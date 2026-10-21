"use client";

/**
 * 隐私友好的最小埋点（PRD「数据统计」）。
 * - 记录 PRD 规定的核心事件：页面浏览、项目链接点击、简历下载、社交链接点击、联系入口点击
 * - 事件先写入 sessionStorage，只有访客在偏好设置中明确同意后才发送到配置的上报地址
 * - 不采集个人身份信息，不做跨站追踪
 */

/**
 * PRD 规定的核心事件中，站点实际产生的有：页面浏览、项目链接点击、社交链接点击、联系入口点击、主题切换。
 * 「简历下载」需要存在可下载的简历文件后才应上报，本站当前未提供简历下载，因此不定义该事件。
 */
export type AnalyticsEventName =
  | "page_view"
  | "project_link_click"
  | "social_click"
  | "contact_click"
  | "theme_change";

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  /** 事件发生时的页面路径 */
  path: string;
  /** 附加信息，仅限非个人数据（如项目 slug、渠道名） */
  meta?: Record<string, string>;
  ts: number;
}

const ANALYTICS_OPT_IN_KEY = "analytics-consent";
export const ANALYTICS_EVENT = "analytics:event";
const LOG_KEY = "analytics-log";

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ANALYTICS_OPT_IN_KEY) === "granted";
}

let endpoint = "";
export function setAnalyticsEndpoint(url: string) {
  endpoint = url.trim();
}
export function getAnalyticsEndpoint() {
  return endpoint;
}

export function setAnalyticsConsent(granted: boolean) {
  window.localStorage.setItem(ANALYTICS_OPT_IN_KEY, granted ? "granted" : "denied");
  if (!granted) {
    window.sessionStorage.removeItem(LOG_KEY);
    return;
  }
  flushPending(endpoint);
}

function readLog(): AnalyticsEvent[] {
  try {
    const raw = window.sessionStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as AnalyticsEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLog(events: AnalyticsEvent[]) {
  try {
    window.sessionStorage.setItem(LOG_KEY, JSON.stringify(events.slice(-50)));
  } catch {
    /* sessionStorage 不可用时静默放弃本地记录 */
  }
}

function flushPending(currentEndpoint: string) {
  const events = readLog();
  if (events.length === 0) return;
  if (!currentEndpoint) return; // 未配置上报地址：仅保留本地记录
  try {
    const payload = JSON.stringify({ events });
    if (typeof navigator.sendBeacon === "function") {
      const ok = navigator.sendBeacon(currentEndpoint, new Blob([payload], { type: "application/json" }));
      if (ok) writeLog([]);
      return;
    }
    void fetch(currentEndpoint, { method: "POST", body: payload, keepalive: true, headers: { "content-type": "application/json" } }).then(
      (res) => {
        if (res.ok) writeLog([]);
      },
    );
  } catch {
    /* 上报失败不影响页面 */
  }
}

/** 记录事件；页面内监听 `analytics:event` 可实时查看（开发调试用） */
export function track(name: AnalyticsEventName, meta?: Record<string, string>) {
  if (typeof window === "undefined") return;
  const event: AnalyticsEvent = {
    name,
    path: window.location.pathname,
    meta,
    ts: Date.now(),
  };
  const log = readLog();
  writeLog([...log, event]);
  window.dispatchEvent(new CustomEvent<AnalyticsEvent>(ANALYTICS_EVENT, { detail: event }));
  if (getAnalyticsConsent()) flushPending(endpoint);
}

export function readAnalyticsLog(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  return readLog();
}

export function clearAnalyticsLog() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(LOG_KEY);
}

/** 收到 `analytics:flush` 事件时补发待上报事件（由 SiteBoot 在已同意时触发） */
export function listenAnalyticsFlush() {
  const handler = () => {
    if (getAnalyticsConsent()) flushPending(endpoint);
  };
  window.addEventListener("analytics:flush", handler);
  return () => window.removeEventListener("analytics:flush", handler);
}
