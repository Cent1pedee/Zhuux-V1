"use client";

/** localStorage 中的键名统一管理，避免散落各处 */
export const STORAGE_KEYS = {
  theme: "theme",
  projectsFilter: "projects-filter",
  contactHistory: "contact-history",
  analyticsConsent: "analytics-consent",
} as const;

export function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* 隐私模式下 localStorage 可能不可用：功能降级为仅当前会话生效 */
  }
}

export function safeRemove(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export { formatDate, formatDateLong } from "./format";
