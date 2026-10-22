"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "./icons";

const DIRECTION_KEY = "pager-direction";
type Direction = "next" | "prev";

/** 详情页翻页（上一篇 / 下一篇）的滑动转场容器 */
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

/** 翻页链接：记录方向，供目标页播放对应方向的滑入动画 */
export function PagerLink({
  href,
  direction,
  children,
  className = "",
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
      prefetch={false}
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

export interface PagerItem {
  href: string;
  title: string;
  /** 副标题：日期或摘要 */
  meta: string;
  /** 可选缩略图 */
  cover?: string;
}

/**
 * 详情页底部翻页卡片：左右两栏，分别指向「更新 / 更早」的内容。
 * - 卡片整块可点，hover 时边框变主色、箭头位移、缩略图轻微放大
 * - 只有一侧内容时自动占满该侧，不留空洞
 */
export function ArticlePager({
  label,
  prev,
  next,
  prevLabel = "更新的内容",
  nextLabel = "更早的内容",
}: {
  label: string;
  prev?: PagerItem | null;
  next?: PagerItem | null;
  prevLabel?: string;
  nextLabel?: string;
}) {
  if (!prev && !next) return null;

  return (
    <nav aria-label={label} className={`pager${prev && next ? "" : " pager-single"}`}>
      {prev ? (
        <PagerLink href={prev.href} direction="prev" className="pager-card pager-prev" ariaLabel={`${prevLabel}：${prev.title}`}>
          <span className="pager-dir">
            <ArrowLeftIcon width={16} height={16} aria-hidden="true" />
            {prevLabel}
          </span>
          <span className="pager-card-body">
            <span className="pager-text">
              <span className="pager-title">{prev.title}</span>
              <span className="pager-meta">{prev.meta}</span>
            </span>
            {prev.cover ? (
              <span className="pager-thumb" aria-hidden="true">
                <img src={prev.cover} alt="" loading="lazy" decoding="async" />
              </span>
            ) : null}
          </span>
        </PagerLink>
      ) : null}
      {next ? (
        <PagerLink href={next.href} direction="next" className="pager-card pager-next" ariaLabel={`${nextLabel}：${next.title}`}>
          <span className="pager-dir">
            {nextLabel}
            <ArrowRightIcon width={16} height={16} aria-hidden="true" />
          </span>
          <span className="pager-card-body">
            {next.cover ? (
              <span className="pager-thumb" aria-hidden="true">
                <img src={next.cover} alt="" loading="lazy" decoding="async" />
              </span>
            ) : null}
            <span className="pager-text">
              <span className="pager-title">{next.title}</span>
              <span className="pager-meta">{next.meta}</span>
            </span>
          </span>
        </PagerLink>
      ) : null}
    </nav>
  );
}
