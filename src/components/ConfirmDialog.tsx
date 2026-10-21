"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmText: string;
  cancelText?: string;
  /** 打开时聚焦的元素：确认按钮或取消按钮 */
  focus?: "confirm" | "cancel";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 语义化确认对话框：
 * - 使用原生 <dialog> 的 showModal，自带焦点陷阱、Esc 关闭、背景 inert
 * - Esc / 点击「取消」/ 点击遮罩都会关闭（不存在无法关闭的弹窗）
 * - 关闭后焦点回到触发按钮（原生 dialog 行为）
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText,
  cancelText = "取消",
  focus = "cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      (focus === "confirm" ? confirmRef : cancelRef).current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, focus]);

  return (
    <dialog
      ref={ref}
      className="confirm-dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        // Esc：默认的关闭行为会被复用为「取消」回执
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        // 点击遮罩区域（dialog 自身）时关闭
        if (event.target === ref.current) onCancel();
      }}
    >
      <div className="confirm-dialog-body">
        <h2 id={titleId} className="text-lg">
          {title}
        </h2>
        <div id={descId} className="text-sm muted">
          {description}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" ref={cancelRef} className="btn-outline-primary" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" ref={confirmRef} className="btn-primary-solid" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </dialog>
  );
}
