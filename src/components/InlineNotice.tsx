"use client";

import type { ReactNode } from "react";

/** 提示条：操作结果 / 说明（role="status"，可手动关闭）。项目、设置等多处共用 */
export function InlineNotice({
  tone = "info",
  children,
  onDismiss,
}: {
  tone?: "info" | "warning" | "error" | "success";
  children: ReactNode;
  onDismiss?: () => void;
}) {
  return (
    <div className="inline-notice" data-tone={tone} role={tone === "error" ? "alert" : "status"}>
      <span className="min-w-0 flex-1">{children}</span>
      {onDismiss ? (
        <button type="button" className="btn-ghost-icon" style={{ width: 44, flex: "none" }} onClick={onDismiss} aria-label="关闭提示">
          <span aria-hidden="true">✕</span>
        </button>
      ) : null}
    </div>
  );
}
