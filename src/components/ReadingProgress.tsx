"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 文章正文阅读进度条（独立于顶部全局路由进度）：
 * - 以正文容器的实际位置计算 0–100%，滚动时 rAF 节流更新
 * - 进度条在文章卡片内吸顶，离开文章后自然消失
 * - 只有整数百分比变化时才触发渲染，避免高频重绘
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [percent, setPercent] = useState(0);
  const lastPercent = useRef(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const header = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64;
      // 0%：正文顶部刚进入吸顶进度条下方；100%：正文底部到达视口底部
      const readLine = window.scrollY + header + 40;
      const start = window.scrollY + rect.top;
      const end = window.scrollY + rect.bottom - window.innerHeight + 80;
      const span = Math.max(end - start, 1);
      const ratio = Math.min(1, Math.max(0, (readLine - start) / span));
      const next = Math.round(ratio * 100);
      if (next !== lastPercent.current) {
        lastPercent.current = next;
        setPercent(next);
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // 内容（图片、字体）加载完成后重新测量一次，避免进度百分比偏移
    update();
    const observer = new ResizeObserver(onScroll);
    observer.observe(target);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      className="reading-progress"
      role="progressbar"
      aria-label="文章阅读进度"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={`已阅读 ${percent}%`}
    >
      <span className="reading-progress-track" aria-hidden="true">
        <span className="reading-progress-fill" style={{ transform: `scaleX(${percent / 100})` }} />
      </span>
      <span className="reading-progress-value" aria-hidden="true">
        {percent}%
      </span>
    </div>
  );
}
