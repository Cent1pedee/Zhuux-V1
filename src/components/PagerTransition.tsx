"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";

const DIRECTION_KEY = "pager-direction";
type Direction = "next" | "prev";

/**
 * 详情页翻页的滑动转场：
 * - PagerLink 点击时把方向写入 sessionStorage
 * - 目标页的 PagerShell 读取方向并播放「从右 / 从左滑入」的 340ms 动画
 * - 不使用动画库；减少动效时由全局 CSS 关闭
 */
export function PagerShell({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<Direction | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DIRECTION_KEY);
      if (saved === "next" || saved === "prev") {
        setDirection(saved);
        sessionStorage.removeItem(DIRECTION_KEY);
      }
    } catch {
      /* sessionStorage 不可用时不做转场 */
    }
  }, []);

  return <div className={`pager-shell${direction ? ` pager-enter-${direction}` : ""}`}>{children}</div>;
}

export function PagerLink({
  href,
  direction,
  children,
  className = "inline-link",
  ariaLabel,
}: {
  href: string;
  direction: Direction;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      className={`pager-link ${className}`}
      aria-label={ariaLabel}
      onClick={() => {
        try {
          sessionStorage.setItem(DIRECTION_KEY, direction);
        } catch {
          /* ignore */
        }
      }}
    >
      {children}
    </Link>
  );
}
