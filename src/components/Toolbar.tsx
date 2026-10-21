"use client";

import type { ReactNode } from "react";

/**
 * 分类页工具栏：左侧标签筛选、右侧搜索 / 排序 / 清除 / 复制链接。
 * 文章、杂谈、项目三个列表页共用同一套骨架，避免每页各写一遍。
 */
export function Toolbar({
  left,
  right,
  footer,
  count,
}: {
  left: ReactNode;
  right: ReactNode;
  footer?: ReactNode;
  count?: ReactNode;
}) {
  return (
    <div className="toolbar card-surface js-only" data-block="true">
      <div className="toolbar-head">
        <div className="min-w-0">{count}</div>
        <div className="toolbar-actions">{right}</div>
      </div>
      <div className="toolbar-body">
        <div className="toolbar-tags">{left}</div>
      </div>
      {footer ? <div className="toolbar-footer">{footer}</div> : null}
    </div>
  );
}
