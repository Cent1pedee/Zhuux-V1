"use client";

import { useEffect, useRef, useState } from "react";

/** 监听系统「减少动态效果」偏好 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * 元素进入视口 20% 时回调一次（已经可见的元素不会重复触发）。
 * 元素本身始终在 DOM 中且可读，动画只是视觉强调。
 */
export function useInViewOnce<T extends HTMLElement>(
  onEnter: (element: T) => void,
  options?: { threshold?: number; delayStep?: number; delayIndex?: number },
) {
  const ref = useRef<T | null>(null);
  const callbackRef = useRef(onEnter);
  callbackRef.current = onEnter;
  const threshold = options?.threshold ?? 0.2;
  const delayStep = options?.delayStep ?? 0;
  const delayIndex = options?.delayIndex ?? 0;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      callbackRef.current(element);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            callbackRef.current(entry.target as T);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, delayStep, delayIndex]);

  return ref;
}

/**
 * 记录「已聚焦的交互元素」，页面切换完成后把焦点恢复到该元素。
 * 这样键盘用户在 SPA 导航后不会丢失 Tab 位置（元素不在新页面时交给浏览器默认处理）。
 */
export function useFocusRestore(pathname: string) {
  const lastFocused = useRef<HTMLElement | null>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const handler = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) lastFocused.current = event.target;
    };
    document.addEventListener("focusin", handler);
    return () => document.removeEventListener("focusin", handler);
  }, []);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;
    const el = lastFocused.current;
    if (el && el.isConnected && document.activeElement === document.body) {
      el.focus({ preventScroll: true });
    }
  }, [pathname]);
}

/** 读取一个本地/会话存储值，并在挂载后触发一次重渲染（避免 SSR 不一致） */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
