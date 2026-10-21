"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/hooks";

/** 右下角悬浮回顶按钮：滚动超过一屏后淡入，点击平滑回顶（减少动效时瞬时） */
export function ScrollTop() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(window.scrollY > 720);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      className={`scroll-top${visible ? " is-visible" : ""}`}
      aria-label="回到顶部"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })}
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
