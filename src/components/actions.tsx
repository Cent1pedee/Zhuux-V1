"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { track } from "@/lib/analytics";
import { useReducedMotion } from "@/lib/hooks";
import { ExternalIcon } from "./icons";

/* ==========================================================================
   异步操作状态：idle / busy / success / error，均通过 aria-live 播报
   ========================================================================== */
type AsyncState = "idle" | "busy" | "success" | "error";

export function useAsyncAction(action: () => Promise<boolean>, autoResetMs = 1500) {
  const [state, setState] = useState<AsyncState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionRef = useRef(action);
  actionRef.current = action;

  const clearTimer = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const run = useCallback(async () => {
    clearTimer();
    setState("busy");
    let ok = false;
    try {
      ok = await actionRef.current();
    } catch {
      ok = false;
    }
    setState(ok ? "success" : "error");
    if (ok) {
      timer.current = setTimeout(() => setState("idle"), autoResetMs);
    }
  }, [autoResetMs, clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setState("idle");
  }, [clearTimer]);

  return { state, run, reset };
}

/* ==========================================================================
   外部链接按钮（项目 Demo / 源码）：区分主次视觉，rel="noopener noreferrer"
   ========================================================================== */
export function ExternalLinkButton({
  href,
  children,
  variant,
  eventName,
  eventMeta,
  ariaLabel,
  fullWidth,
}: {
  href: string;
  children: ReactNode;
  variant: "primary" | "outline";
  eventName: "project_link_click" | "social_click" | "contact_click";
  eventMeta?: Record<string, string>;
  ariaLabel?: string;
  fullWidth?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={variant === "primary" ? "btn-primary-solid" : "btn-outline-primary"}
      style={fullWidth ? { flex: "1 1 auto" } : undefined}
      aria-label={ariaLabel}
      onClick={() => track(eventName, eventMeta)}
    >
      {children}
      <ExternalIcon />
      <span className="visually-hidden">（在新标签页打开）</span>
    </a>
  );
}

/** 回到顶部 */
export function BackToTop() {
  const reduced = useReducedMotion();
  return (
    <button
      type="button"
      className="btn-text"
      style={{ paddingInline: 0 }}
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
    >
      ↑ 回到顶部
    </button>
  );
}
