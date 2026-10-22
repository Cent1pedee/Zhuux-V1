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
      className={`pager-link ${className}`.trim()}
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
  /** 可选缩略图（保持原始比例完整展示，不做裁切） */
  cover?: string;
  /** 可选类型微标签，例如「开源项目」「复盘」 */
  tag?: string;
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
      <span className="pager-dir">
        <span className="pager-dir-label">{dirLabel}</span>
        <span className="pager-arrow" aria-hidden="true">
          <Arrow width={14} height={14} />
        </span>
      </span>
      {item.cover ? (
        <span className="pager-media" aria-hidden="true">
          <img src={item.cover} alt="" loading="lazy" decoding="async" />
        </span>
      ) : null}
      <span className="pager-body">
        {item.tag ? <span className="pager-tag">{item.tag}</span> : null}
        <span className="pager-title">{item.title}</span>
        <span className="pager-meta">
          {item.meta}
          <span className="pager-meta-arrow" aria-hidden="true">
            <Arrow width={11} height={11} />
          </span>
        </span>
      </span>
    </PagerLink>
  );
}

/**
 * 详情页底部翻页卡片：左右两栏，分别指向「更新 / 更早」的内容。
 *
 * 结构：封面 → 标题与日期 → 方向标签＋箭头，三段横排。
 * - 封面按 5:2 完整比例展示、object-fit: contain，不裁掉任何内容；窄屏换 4:3 版本
 * - 「更早」整体镜像，两卡以中缝为轴中心对称，方向箭头都指向中缝
 * - 边框常态是 1px 发丝线；hover 时先淡入主色描边，再过渡到浅色底与阴影
 * - 键盘聚焦（:focus-visible）与鼠标悬停走同一套反馈
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
