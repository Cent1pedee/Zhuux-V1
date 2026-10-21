"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Heading {
  level: 2 | 3;
  text: string;
  id: string;
}

/**
 * 页内目录：
 * - 当前小节由「阅读线」判定：取滚动线以上最后一个标题。相比 IntersectionObserver
 *   的入场/离场回调，它不会在小节边界来回抖动（之前抽搐的根因）。
 * - 高亮改用滑动指示块（只动 transform），不再让每个链接单独切换左边框。
 * - 点击后先锁定目标 700ms，避免平滑滚动过程中的过渡态把高亮抢回去。
 */
export function TableOfContents({ headings, title }: { headings: Heading[]; title: string }) {
  const [current, setCurrent] = useState<string | null>(headings[0]?.id ?? null);
  const lockRef = useRef<string | null>(null);
  const lockTimer = useRef<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [marker, setMarker] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (lockRef.current) return;
      const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      const readLine = header + 96;
      let activeId = headings[0].id;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= readLine) activeId = heading.id;
      }
      // 滚动到底部时始终高亮最后一节
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) activeId = headings[headings.length - 1].id;
      setCurrent((prev) => (prev === activeId ? prev : activeId));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  // 指示块位置：根据当前项的 offsetTop / offsetHeight 计算，列表尺寸变化时重算
  useEffect(() => {
    const list = listRef.current;
    if (!list || !current) return;
    const measure = () => {
      const link = list.querySelector<HTMLAnchorElement>(`[data-id="${CSS.escape(current)}"]`);
      if (!link) {
        setMarker(null);
        return;
      }
      setMarker({ top: link.offsetTop, height: link.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [current, headings]);

  const go = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    lockRef.current = id;
    setCurrent(id);
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    lockTimer.current = window.setTimeout(() => {
      lockRef.current = null;
    }, 700);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  useEffect(
    () => () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    },
    [],
  );

  if (headings.length === 0) return null;

  return (
    <nav aria-labelledby="toc-title" className={`toc${title ? "" : " toc-inline"}`}>
      {title ? (
        <p id="toc-title" className="mb-2 text-xs subtle">
          {title}
        </p>
      ) : (
        <span id="toc-title" className="visually-hidden">
          本文目录
        </span>
      )}
      <div className="toc-body">
        <ul className="toc-list" ref={listRef}>
          {marker ? (
            <span
              className="toc-marker"
              aria-hidden="true"
              style={{ transform: `translateY(${marker.top}px)`, height: marker.height }}
            />
          ) : null}
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={`toc-link${current === heading.id ? " is-current" : ""}`}
                data-level={heading.level}
                data-id={heading.id}
                aria-current={current === heading.id ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  go(heading.id);
                }}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
