"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { copyToClipboard } from "@/lib/clipboard";
import { LinkIcon } from "./icons";

type Status = "idle" | "busy" | "done" | "error";

/**
 * 复制当前页面链接（筛选 / 分类状态已同步到 URL，可直接分享）。
 * - 使用 lib/clipboard：安全上下文走 Clipboard API，失败自动降级为 execCommand
 * - 成功后按钮短暂变为「已复制」2s；失败时给出可操作的提示，而不是静默无反应
 */
export function CopyLinkButton({ label = "复制当前链接", showIcon = true }: { label?: string; showIcon?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const timer = useRef<number | null>(null);

  // 卸载时清理定时器，避免在已卸载组件上 setState
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const run = useCallback(async () => {
    if (timer.current) window.clearTimeout(timer.current);
    setStatus("busy");
    setMessage("");
    const result = await copyToClipboard(window.location.href);
    if (result.ok) {
      setStatus("done");
      setMessage("链接已复制，可直接分享");
      timer.current = window.setTimeout(() => setStatus("idle"), 2000);
      return;
    }
    setStatus("error");
    setMessage("复制被浏览器阻止，请手动从地址栏复制");
    timer.current = window.setTimeout(() => setStatus("idle"), 4000);
  }, []);

  const text = status === "done" ? "已复制" : status === "error" ? "复制失败" : status === "busy" ? "复制中…" : label;

  return (
    <span className="copy-link">
      <button
        type="button"
        className={`copy-link-btn${status === "done" ? " is-done" : ""}${status === "error" ? " is-error" : ""}`}
        onClick={() => void run()}
        aria-label={label}
      >
        {showIcon ? <LinkIcon width={14} height={14} aria-hidden="true" /> : null}
        <span>{text}</span>
        <span className="copy-link-check" aria-hidden="true">
          ✓
        </span>
      </button>
      <span role="status" aria-live="polite" className="copy-link-status">
        {message}
      </span>
    </span>
  );
}
