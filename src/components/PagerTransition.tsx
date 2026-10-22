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

/** 单个翻页卡片：方向标签 + 箭头徽标 + 缩略图 + 标题 + 副标题 */
function PagerCard({
  item,
  direction,
  dirLabel,
}: {
  item: PagerItem;
  direction: "prev" | "next";
  dirLabel: string;
}) {
  const Arrow = direction === "prev" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <PagerLink
      href={item.href}
      direction={direction}
      className={`pager-card pager-${direction}`}
      ariaLabel={`${dirLabel}：${item.title}`}
    >
      <span className="pager-dir">{dirLabel}</span>
      <span className="pager-arrow" aria-hidden="true">
        <Arrow width={14} height={14} />
      </span>
      {item.cover ? (
        <span className="pager-thumb" aria-hidden="true">
          <img src={item.cover} alt="" loading="lazy" decoding="async" />
        </span>
      ) : null}
      <span className="pager-text">
        <span className="pager-title">{item.title}</span>
        <span className="pager-meta">{item.meta}</span>
      </span>
    </PagerLink>
  );
}

/**
 * 详情页底部翻页卡片：左右两栏，分别指向「更新 / 更早」的内容。
 * - 信息层级：方向标签（小号主色）→ 标题（16px，最多两行）→ 日期（等宽小字）
 * - hover / 键盘聚焦时整卡抬起、主色描边、箭头填充主色并沿方向滑动、缩略图轻推
 * - 只有一侧内容时自动单栏铺满，不留空洞
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
      {prev ? <PagerCard item={prev} direction="prev" dirLabel={prevLabel} /> : null}
      {next ? <PagerCard item={next} direction="next" dirLabel={nextLabel} /> : null}
    </nav>
  );
}
