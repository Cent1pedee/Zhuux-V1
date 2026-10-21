"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAnalyticsConsent, listenAnalyticsFlush, setAnalyticsEndpoint, track } from "@/lib/analytics";
import { useTheme } from "./theme";
import { useFocusRestore } from "@/lib/hooks";

interface SiteBootProps {
  endpoint: string;
}

/** 全局客户端初始化：标记 JS 可用、启动埋点、页面浏览统计、跨页面焦点恢复 */
export function SiteBoot({ endpoint }: SiteBootProps) {
  const pathname = usePathname();
  const { preference, resolved } = useTheme();

  useEffect(() => {
    document.documentElement.dataset.js = "on";
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      document.documentElement.dataset.motion = query.matches ? "reduced" : "full";
    };
    sync();
    query.addEventListener("change", sync);
    setAnalyticsEndpoint(endpoint);
    return () => query.removeEventListener("change", sync);
  }, [endpoint]);

  useEffect(() => {
    let referrer = "direct";
    try {
      referrer = document.referrer ? new URL(document.referrer).hostname : "direct";
    } catch {
      referrer = "direct";
    }
    track("page_view", { referrer });
    // 已在设置中同意统计数据时，补发本次会话之前的事件
    if (getAnalyticsConsent()) window.dispatchEvent(new Event("analytics:flush"));
  }, [pathname]);

  useEffect(() => listenAnalyticsFlush(), []);

  // 把当前主题偏好与生效主题暴露给 CSS，便于调试与按主题微调
  useEffect(() => {
    document.documentElement.dataset.themePreference = preference;
    document.documentElement.dataset.themeResolved = resolved;
  }, [preference, resolved]);

  useFocusRestore(pathname);

  return null;
}
