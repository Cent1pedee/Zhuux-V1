"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { STORAGE_KEYS, safeGet, safeRemove, safeSet } from "@/lib/storage";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

export type ThemePreference = "system" | "light" | "dark";

interface ThemeContextValue {
  /** 用户偏好：跟随系统 / 亮色 / 暗色 */
  preference: ThemePreference;
  /** 当前实际生效的主题 */
  resolved: "light" | "dark";
  /** origin：切换按钮的屏幕坐标，用于圆形揭幕 */
  setPreference: (next: ThemePreference, origin?: { x: number; y: number }) => void;
  cycle: (origin?: { x: number; y: number }) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const LOGO_COLOR = "#000000";
const originalFavicon =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath fill=%22%23000000%22 d=%22M13 2 4 14h6l-1 8 9-12h-6l1-8Z%22/%3E%3C/svg%3E';

function systemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
}

/**
 * 昼夜切换的「丝滑」揭幕：
 * - 优先使用 View Transition API（Chrome 111+ / Safari 18+）：新主题从点击位置以圆形扩散揭开；
 * - 不支持时退化为 CSS 变量插值（html.theme-anim 打开 --dur-theme 的颜色过渡）。
 * 两种情况都会同步切换，不刷新页面。
 */
function applyThemeWithReveal(next: "light" | "dark", origin?: { x: number; y: number }) {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === next) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const startFallback = () => {
    if (reduced) {
      applyTheme(next);
      return;
    }
    root.classList.add("theme-anim");
    applyTheme(next);
    window.setTimeout(() => root.classList.remove("theme-anim"), 1000);
  };

  type DocWithVT = Document & {
    startViewTransition?: (callback: () => void) => { finished: Promise<void>; ready: Promise<void> };
  };
  const doc = document as DocWithVT;
  if (typeof doc.startViewTransition !== "function" || reduced) {
    startFallback();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--theme-x", `${x}px`);
  root.style.setProperty("--theme-y", `${y}px`);
  root.style.setProperty("--theme-r", `${radius}px`);

  root.classList.add("theme-vt");
  let transition: { finished: Promise<void> };
  try {
    transition = doc.startViewTransition(() => {
      applyTheme(next);
    });
  } catch {
    root.classList.remove("theme-vt");
    startFallback();
    return;
  }
  // 揭幕结束后清理临时类，避免影响普通 hover 过渡
  void transition.finished.finally(() => root.classList.remove("theme-anim", "theme-vt"));
}

function readStoredPreference(): ThemePreference {
  const stored = safeGet(STORAGE_KEYS.theme);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

export function ThemeProvider({ children, defaultTheme }: { children: ReactNode; defaultTheme: ThemePreference }) {
  // 初始值取构建时配置，避免 SSR 与服务端 HTML 不一致；挂载后再读取 localStorage
  const [preference, setPreferenceState] = useState<ThemePreference>(defaultTheme);
  const [resolved, setResolved] = useState<"light" | "dark">(defaultTheme === "dark" ? "dark" : "light");

  useEffect(() => {
    // 与首帧内联脚本保持一致：localStorage 已有手动选择则优先，否则跟随系统
    const stored = readStoredPreference();
    const next = stored === "system" ? systemTheme() : stored;
    setPreferenceState(stored);
    setResolved(next);
    applyTheme(next);
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (preference !== "system") return;
      const next = systemTheme();
      setResolved(next);
      applyTheme(next);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  // 让浏览器地址栏等 UI 跟随主题
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", resolved === "dark" ? "#15181c" : "#ffffff");
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon) favicon.href = originalFavicon.replace(LOGO_COLOR, resolved === "dark" ? "#ffffff" : "#000000");
  }, [resolved]);

  const setPreference = useCallback((next: ThemePreference, origin?: { x: number; y: number }) => {
    const nextResolved = next === "system" ? systemTheme() : next;
    setPreferenceState(next);
    setResolved(nextResolved);
    applyThemeWithReveal(nextResolved, origin);
    if (next === "system") safeRemove(STORAGE_KEYS.theme);
    else safeSet(STORAGE_KEYS.theme, next);
    track("theme_change", { theme: next });
  }, []);

  const cycle = useCallback(
    (origin?: { x: number; y: number }) => {
      // 顺序：跟随系统 → 暗色 → 亮色 → 跟随系统（与当前系统主题无关，点击即可看到变化）
      const order: ThemePreference[] = ["system", "dark", "light"];
      const index = order.indexOf(preference);
      setPreference(order[(index + 1) % order.length], origin);
    },
    [preference, setPreference],
  );

  const value = useMemo(
    () => ({ preference, resolved, setPreference, cycle }),
    [preference, resolved, setPreference, cycle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme 必须在 ThemeProvider 内使用");
  return context;
}

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof SunIcon }[] = [
  { value: "system", label: "跟随系统", Icon: MonitorIcon },
  { value: "light", label: "亮色", Icon: SunIcon },
  { value: "dark", label: "暗色", Icon: MoonIcon },
];

/**
 * 主题切换按钮：在「跟随系统 / 亮色 / 暗色」之间循环。
 * - 点击即切换，不刷新页面，选择持久化到 localStorage
 * - aria-pressed 表示是否处于「非跟随系统」的手动模式
 * - 长按 / 右键无特殊行为；键盘 Enter / Space 等同点击
 */
export function ThemeToggle() {
  const { preference, resolved, cycle, setPreference } = useTheme();
  const current = OPTIONS.find((option) => option.value === preference) ?? OPTIONS[0];
  const label =
    preference === "system"
      ? `主题：跟随系统（当前${resolved === "dark" ? "暗色" : "亮色"}），点击切换`
      : `主题：${current.label}，点击切换`;

  return (
    <div className="flex items-center">
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={(event) => cycle({ x: event.clientX, y: event.clientY })}
        onContextMenu={(event) => {
          // 右键直接重置为跟随系统，避免循环三次
          event.preventDefault();
          setPreference("system", { x: event.clientX, y: event.clientY });
        }}
        aria-label={label}
        aria-pressed={preference !== "system"}
        title={`${label}（右键恢复跟随系统）`}
      >
        <current.Icon />
      </button>
    </div>
  );
}

/**
 * 首页 / 设置页的「日 / 夜」大卡片：点击在昼夜之间切换。
 * 内部有一枚太阳与月亮交错的圆形图标，随主题 700ms 翻转。
 */
export function ThemeSceneCard({ className = "" }: { className?: string }) {
  const { resolved, setPreference } = useTheme();
  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      className={`theme-scene ${className}`}
      onClick={(event) => setPreference(isDark ? "light" : "dark", { x: event.clientX, y: event.clientY })}
      aria-pressed={isDark}
    >
      <span className="theme-scene-orb" aria-hidden="true" data-mode={isDark ? "dark" : "light"}>
        <span className="theme-scene-sky" />
        <span className="theme-scene-sun" />
        <span className="theme-scene-moon" />
        <span className="theme-scene-stars" />
      </span>
      <span className="theme-scene-text">
        <span className="theme-scene-title">{isDark ? "夜间模式" : "日间模式"}</span>
        <span className="theme-scene-sub">{isDark ? "流萤飞舞的深空" : "落樱漫舞的清晨"}</span>
        <span className="theme-scene-hint">
          {isDark ? "切换到日间" : "切换到夜间"} <span aria-hidden="true">→</span>
        </span>
      </span>
    </button>
  );
}
