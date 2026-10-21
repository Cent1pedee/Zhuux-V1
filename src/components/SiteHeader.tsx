"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme";
import { HeaderSearch } from "./HeaderSearch";
import type { SearchEntry } from "@/lib/search-index";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/articles/", label: "文章" },
  { href: "/projects/", label: "项目" },
  { href: "/chatters/", label: "杂谈" },
  { href: "/settings/", label: "设置", utility: true },
  { href: "/privacy/", label: "隐私", utility: true },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href);
}

/** 导航滑动高亮：按当前项位置计算指示块，路由切换时平滑移动 */
function NavIndicator({ navRef, activeIndex }: { navRef: React.RefObject<HTMLDivElement | null>; activeIndex: number }) {
  const [style, setStyle] = useState<{ x: number; w: number } | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const links = nav.querySelectorAll<HTMLAnchorElement>(".nav-link");
      const target = links[activeIndex];
      if (!target) {
        setStyle(null);
        return;
      }
      setStyle({ x: target.offsetLeft, w: target.offsetWidth });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [navRef, activeIndex]);

  return (
    <span
      className={`nav-indicator${style ? " is-ready" : ""}`}
      aria-hidden="true"
      style={style ? { width: style.w, transform: `translate(${style.x}px, -50%)` } : undefined}
    />
  );
}

export function SiteHeader({ name, searchEntries }: { name: string; searchEntries: SearchEntry[] }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const activeIndex = NAV.findIndex((item) => isActive(pathname, item.href));

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 8);
      // 向下滚动且离开顶部时收起导航，向上滚动立即出现（移动端尤其省空间）
      if (y > 160 && y > lastY.current + 4) setHidden(true);
      else if (y < lastY.current - 4 || y < 120) setHidden(false);
      lastY.current = y;
      const bar = progressRef.current;
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
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
  }, [pathname]);

  return (
    <>
      <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}>
        <div className="site-header-inner-shell">
          <div className="site-header-bar">
            <Link
              href="/"
              className="site-brand"
              aria-label={`${name} · 返回首页`}
              onClick={() => {
                if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <span aria-hidden="true" className="site-brand-mark">
                {name.slice(0, 1)}
              </span>
              <span className="site-brand-text">{name}</span>
              <span aria-hidden="true" className="site-brand-suffix">
                <span className="mx-1" style={{ color: "var(--color-primary)" }}>
                  の
                </span>
                宝藏之地
              </span>
            </Link>

            <nav aria-label="主导航" className="site-nav" ref={navRef}>
              <NavIndicator navRef={navRef} activeIndex={activeIndex} />
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="nav-link"
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  data-utility={item.utility ? "true" : undefined}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="header-actions">
              <HeaderSearch entries={searchEntries} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>
      {/*
        顶部全局进度：作为 header 的兄弟节点固定在视口顶部。
        header 带有 transform（收起动画），其内部元素的 position: fixed
        会以 header 为包含块，导致进度条随头部一起移出屏幕。
      */}
      <div className={`scroll-progress${scrolled ? " is-visible" : ""}`} aria-hidden="true">
        <span ref={progressRef} />
      </div>
    </>
  );
}
