"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { InlineNotice } from "./InlineNotice";
import { useTheme, type ThemePreference } from "./theme";
import {
  clearAnalyticsLog,
  getAnalyticsConsent,
  readAnalyticsLog,
  setAnalyticsConsent,
  type AnalyticsEvent,
} from "@/lib/analytics";
import { STORAGE_KEYS } from "@/lib/storage";
import { CheckIcon, MonitorIcon, MoonIcon, ShieldIcon, SunIcon } from "./icons";

const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: "system", label: "跟随系统", hint: "随操作系统深色 / 浅色设置自动切换" },
  { value: "light", label: "亮色", hint: "始终使用亮色主题" },
  { value: "dark", label: "暗色", hint: "始终使用暗色主题" },
];

const EVENT_LABEL: Record<string, string> = {
  page_view: "页面浏览",
  project_link_click: "项目链接点击",
  social_click: "社交链接点击",
  contact_click: "联系入口点击",
  theme_change: "主题切换",
};

export function SettingsPanel({ analyticsEndpoint }: { analyticsEndpoint: string }) {
  const { preference, resolved, setPreference } = useTheme();
  const [consent, setConsent] = useState(false);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [notice, setNotice] = useState<{ tone: "success" | "error" | "info"; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshEvents = useCallback(() => setEvents(readAnalyticsLog()), []);

  const flash = (tone: "success" | "error" | "info", text: string) => {
    setNotice({ tone, text });
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  };

  useEffect(() => {
    setConsent(getAnalyticsConsent());
    refreshEvents();
    const onEvent = () => refreshEvents();
    window.addEventListener("analytics:event", onEvent);
    return () => {
      window.removeEventListener("analytics:event", onEvent);
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, [refreshEvents]);

  const onConsentChange = (granted: boolean) => {
    setAnalyticsConsent(granted);
    setConsent(granted);
    if (granted) {
      flash(
        "success",
        analyticsEndpoint
          ? "已开启统计数据发送：现有事件将发送到配置的统计地址，之后仅发送事件名与页面路径。"
          : "已开启统计数据仅本地记录：站点尚未配置上报地址（site.config.json → analytics.endpoint），因此不会发送任何请求。",
      );
    } else {
      flash("info", "已关闭统计数据：本地事件记录已清除，且不会发送任何请求。");
      refreshEvents();
    }
  };

  const exportEvents = () => {
    if (events.length === 0) {
      flash("info", "当前会话没有可导出的事件记录。");
      return;
    }
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), events }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-events-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    flash("success", `已导出 ${events.length} 条事件为 JSON 文件。`);
  };

  const clearEvents = () => {
    clearAnalyticsLog();
    refreshEvents();
    setConfirmClear(false);
    flash("success", "已清除本次会话记录的全部事件。");
  };

  const resetPreferences = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEYS.theme);
      window.localStorage.removeItem(STORAGE_KEYS.projectsFilter);
      window.localStorage.removeItem(STORAGE_KEYS.analyticsConsent);
      window.sessionStorage.removeItem("analytics-log");
    } catch {
      /* ignore */
    }
    setPreference("system");
    setConsent(false);
    refreshEvents();
    flash("success", "已恢复默认设置：主题跟随系统、统计未开启。");
  };

  return (
    <div className="settings-grid">
      {/* 主题 */}
      <section aria-labelledby="settings-theme-title" className="card-surface panel">
        <div className="settings-card-head">
          <div>
            <h2 id="settings-theme-title" className="text-lg">
              明暗主题
            </h2>
            <p className="mt-1 text-sm subtle">
              当前生效：<strong>{resolved === "dark" ? "暗色" : "亮色"}</strong>
              {preference === "system" ? "（跟随系统）" : "（手动选择）"}。切换不刷新页面，并保存在本机。
            </p>
          </div>
          <span className="settings-icon" aria-hidden="true">
            {preference === "system" ? <MonitorIcon width={20} height={20} /> : preference === "dark" ? <MoonIcon width={20} height={20} /> : <SunIcon width={20} height={20} />}
          </span>
        </div>
        <div
          className="theme-options mt-5"
          role="radiogroup"
          aria-labelledby="settings-theme-title"
          onKeyDown={(event) => {
            // 单选组支持方向键切换（WAI-ARIA radiogroup 模式）
            const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"];
            if (!keys.includes(event.key)) return;
            event.preventDefault();
            const currentIndex = THEME_OPTIONS.findIndex((option) => option.value === preference);
            const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
            const next = THEME_OPTIONS[(currentIndex + delta + THEME_OPTIONS.length) % THEME_OPTIONS.length];
            setPreference(next.value);
            flash("success", `主题已切换为「${next.label}」。`);
            const group = event.currentTarget;
            requestAnimationFrame(() => {
              group.querySelectorAll<HTMLButtonElement>('[role="radio"]')[THEME_OPTIONS.indexOf(next)]?.focus();
            });
          }}
        >
          {THEME_OPTIONS.map((option) => {
            const checked = preference === option.value;
            const Icon = option.value === "system" ? MonitorIcon : option.value === "dark" ? MoonIcon : SunIcon;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={checked ? 0 : -1}
                className="theme-option"
                onClick={() => {
                  setPreference(option.value);
                  flash("success", `主题已切换为「${option.label}」。`);
                }}
              >
                <Icon width={20} height={20} aria-hidden="true" style={{ color: "var(--color-primary)" }} />
                <span>{option.label}</span>
                <small>{option.hint}</small>
                <span className="theme-check" aria-hidden="true">
                  <CheckIcon width={12} height={12} />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 数据统计 */}
      <section aria-labelledby="settings-analytics-title" className="card-surface panel">
        <div className="settings-card-head">
          <h2 id="settings-analytics-title" className="text-lg">
            数据统计与同意
          </h2>
          <span className="settings-icon" aria-hidden="true">
            <ShieldIcon width={20} height={20} />
          </span>
        </div>
        <div className="mt-3 flex items-start gap-3">
          <input
            id="analytics-consent"
            type="checkbox"
            className="check-box"
            checked={consent}
            onChange={(event) => onConsentChange(event.target.checked)}
            aria-describedby="analytics-consent-hint"
            style={{ marginTop: 3 }}
          />
          <div>
            <label htmlFor="analytics-consent" className="text-sm font-semibold">
              允许发送匿名统计数据
            </label>
            <p id="analytics-consent-hint" className="mt-1 text-sm subtle">
              默认不勾选。开启后仅发送事件名、页面路径与来源域名，不包含任何个人身份信息，也不做跨站追踪。
              上报地址：<code>{analyticsEndpoint || "未配置（仅本地记录）"}</code>。详见{" "}
              <a href="/privacy/" className="inline-link">
                隐私政策
              </a>
              。
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-outline-primary" onClick={exportEvents}>
            导出本次会话事件（{events.length}）
          </button>
          <button type="button" className="btn-outline-primary" onClick={() => setConfirmClear(true)} disabled={events.length === 0}>
            清除本次会话事件
          </button>
          <button type="button" className="btn-text" onClick={resetPreferences}>
            恢复全部默认设置
          </button>
        </div>

        <h3 className="mt-8 text-base">本次会话已记录的事件</h3>
        {events.length === 0 ? (
          <p className="empty-state text-sm">暂无记录。浏览页面或点击项目、社交链接后会在这里出现（仅保存在当前标签页）。</p>
        ) : (
          <div className="scroll-table mt-3 max-h-64 overflow-y-auto">
            <table className="privacy-table" style={{ minWidth: 480 }}>
              <caption className="visually-hidden">本次会话记录的统计事件</caption>
              <thead>
                <tr>
                  <th scope="col">事件</th>
                  <th scope="col">页面</th>
                  <th scope="col">时间</th>
                </tr>
              </thead>
              <tbody>
                {[...events].reverse().map((event) => (
                  <tr key={`${event.ts}-${event.name}-${event.path}`}>
                    <td>
                      {EVENT_LABEL[event.name] ?? event.name}
                      {event.meta && Object.keys(event.meta).length > 0 ? (
                        <span className="subtle">（{Object.entries(event.meta).map(([key, value]) => `${key}: ${value}`).join("，")}）</span>
                      ) : null}
                    </td>
                    <td className="font-mono text-xs">{event.path}</td>
                    <td className="font-mono text-xs">{new Date(event.ts).toLocaleTimeString("zh-CN", { hour12: false })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-2 text-xs subtle">
          提示：同意开关关闭时，事件仍会暂存在 sessionStorage 中方便你核对，但不会发送到任何服务器；关闭标签页即自动清除。
        </p>
      </section>

      {notice ? (
        <InlineNotice tone={notice.tone} onDismiss={() => setNotice(null)}>
          {notice.text}
        </InlineNotice>
      ) : null}

      <ConfirmDialog
        open={confirmClear}
        title="清除本次会话的事件记录？"
        description="将删除当前标签页中记录的统计事件，此操作不可撤销。你的主题偏好与其他设置不受影响。"
        confirmText="清除记录"
        cancelText="取消"
        onConfirm={clearEvents}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
