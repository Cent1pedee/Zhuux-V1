"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/**
 * 页面切换过渡（纯 CSS，零运行时依赖）：
 * - 路由变化时内容以 260ms 淡入 + 6px 上移，并显示顶部细进度线
 * - 只重新挂载内层容器，外层保持稳定，不产生布局偏移
 * - prefers-reduced-motion 时由全局 CSS 关闭动画
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    // 首次加载不显示进度线，只在路由切换时出现
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setVisible(true);
    // 与内容淡入（320ms）同步收起进度线；reduced-motion 时更快
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setVisible(false), reduced ? 60 : 320);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      <div className={`route-progress${visible ? " is-active" : ""}`} aria-hidden="true">
        <span />
      </div>
      <div key={pathname} className="page-enter-transition">
        {children}
      </div>
    </>
  );
}
