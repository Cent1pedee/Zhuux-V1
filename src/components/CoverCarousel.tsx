"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface Slide {
  href: string;
  title: string;
  description: string;
  cover: string;
  date: string;
  badge: string;
  tags: string[];
}

/**
 * 封面轮播卡（文章 / 项目 / 杂谈共用）
 * - 自动播放可暂停：悬停、键盘聚焦、显式按钮都会暂停；减少动效时完全不自动播放
 * - 支持触屏左右滑动（Pointer Events），滑动后不会误触发跳转
 * - 交叉淡入用双图层 + CSS 完成，不引入动画库，避免首屏 JS 膨胀
 * - 第一张封面优先加载，避免 LCP 等待
 */
export function CoverCarousel({
  slides,
  className = "",
  autoPlayMs = 6500,
  readLabel,
  ariaLabel = "精选内容轮播",
}: {
  slides: Slide[];
  className?: string;
  autoPlayMs?: number;
  readLabel: string;
  ariaLabel?: string;
}) {
  const [state, setState] = useState<{ index: number; previous: Slide | null }>({ index: 0, previous: null });
  const [hovered, setHovered] = useState(false);
  const [manualPaused, setManualPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const index = state.index;
  const previous = state.previous;
  const previousTimer = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const draggedRef = useRef(false);
  const count = slides.length;
  const current = slides[index] ?? slides[0];

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (count <= 1 || reduced || manualPaused || hovered) return;
    timerRef.current = window.setInterval(() => {
      setState((value) => {
        const next = (value.index + 1) % count;
        return { index: next, previous: slides[value.index] ?? null };
      });
    }, autoPlayMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [count, reduced, manualPaused, hovered, autoPlayMs]);

  // 淡出层在 460ms 后清理（与 CSS 动画时长一致）
  useEffect(() => {
    if (!previous) return;
    if (previousTimer.current) window.clearTimeout(previousTimer.current);
    previousTimer.current = window.setTimeout(() => setState((value) => ({ ...value, previous: null })), 460);
    return () => {
      if (previousTimer.current) window.clearTimeout(previousTimer.current);
    };
  }, [previous]);

  useEffect(() => {
    if (index > count - 1) setState({ index: 0, previous: null });
  }, [count, index]);

  if (!current) return null;

  const goTo = (next: number) => {
    const target = ((next % count) + count) % count;
    setState((value) => ({ index: target, previous: slides[value.index] ?? null }));
  };

  return (
    <section
      className={`feature-card ${className}`}
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={() => setHovered(false)}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") return;
        pointerStart.current = { x: event.clientX, y: event.clientY };
        draggedRef.current = false;
      }}
      onPointerMove={(event) => {
        if (!pointerStart.current) return;
        const dx = Math.abs(event.clientX - pointerStart.current.x);
        const dy = Math.abs(event.clientY - pointerStart.current.y);
        if (dx > 12 && dx > dy) draggedRef.current = true;
      }}
      onPointerUp={(event) => {
        const start = pointerStart.current;
        pointerStart.current = null;
        if (!start) return;
        const dx = event.clientX - start.x;
        if (Math.abs(dx) > 50) {
          goTo(dx < 0 ? index + 1 : index - 1);
          // 阻止随后的 click 跳转
          window.setTimeout(() => {
            draggedRef.current = false;
          }, 0);
        }
      }}
      onPointerCancel={() => {
        pointerStart.current = null;
        draggedRef.current = false;
      }}
    >
      {previous ? (
        <div className="feature-cover feature-cover-leaving" aria-hidden="true" key={`prev-${previous.href}`}>
          <img src={previous.cover} alt="" loading="lazy" decoding="async" />
        </div>
      ) : null}
      <div className="feature-cover feature-cover-entering" aria-hidden="true" key={`cover-${current.href}`}>
        <img
          src={current.cover}
          alt=""
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          decoding="async"
        />
      </div>

      <div className="feature-content" key={`content-${current.href}`}>
        <Link
          href={current.href}
          className="feature-link"
          aria-label={`${readLabel}：${current.title}`}
          onClickCapture={(event) => {
            if (draggedRef.current) {
              event.preventDefault();
              draggedRef.current = false;
            }
          }}
          draggable={false}
        >
          <span className="feature-badge">{current.badge}</span>
          <h2 className="feature-title">{current.title}</h2>
          <p className="feature-desc">{current.description}</p>
          <span className="feature-meta">
            <time dateTime={current.date}>{current.date}</time>
            {current.tags.slice(0, 2).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
            <span aria-hidden="true">→</span>
          </span>
        </Link>
      </div>

      {count > 1 && !reduced ? (
        <button
          type="button"
          className="feature-pause"
          aria-pressed={manualPaused}
          aria-label={manualPaused ? "继续自动播放" : "暂停自动播放"}
          onClick={() => setManualPaused((value) => !value)}
        >
          <span aria-hidden="true">{manualPaused ? "▶" : "❚❚"}</span>
        </button>
      ) : null}

      {count > 1 ? (
        <div className="feature-dots" role="group" aria-label="选择展示内容">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.href}
              type="button"
              className="feature-dot"
              aria-pressed={dotIndex === index}
              aria-label={`第 ${dotIndex + 1} 项：${slide.title}`}
              onClick={() => goTo(dotIndex)}
            />
          ))}
        </div>
      ) : null}

      <span className="visually-hidden" role="status" aria-live="polite">
        {`第 ${index + 1} / ${count} 项：${current.title}`}
      </span>
    </section>
  );
}
