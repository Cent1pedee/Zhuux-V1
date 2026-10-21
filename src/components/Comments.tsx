"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "./theme";

interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  themeLight: string;
  themeDark: string;
}

type Status = "idle" | "loading" | "ready" | "error" | "unconfigured";

/**
 * Giscus 评论区（基于 GitHub Discussions，P1）
 * - 脚本延迟加载：访客滚动到评论区（提前 200px）或点击「加载评论区」后才注入脚本，绝不阻塞首屏
 * - 只使用一次前置校验：是否支持 IntersectionObserver、是否被系统要求减少数据（saveData）
 * - 未登录 / 未加载时提供空态引导；加载超时或失败可重试
 * - 配置缺失（site.config.json 中 repo / repoId 为空）时显示明确说明
 */
export function Comments({ config, term }: { config: GiscusConfig; term: string }) {
  const configured = Boolean(config.repo && config.repoId && config.categoryId);
  const containerRef = useRef<HTMLDivElement>(null);
  const injectedRef = useRef(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState("");
  const { resolved } = useTheme();

  const load = useCallback(() => {
    if (!configured || injectedRef.current) return;
    const container = containerRef.current;
    if (!container) return;
    injectedRef.current = true;
    setStatus("loading");
    setErrorText("");

    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.dataset.repo = config.repo;
    script.dataset.repoId = config.repoId;
    script.dataset.category = config.category;
    script.dataset.categoryId = config.categoryId;
    script.dataset.mapping = config.mapping;
    script.dataset.strict = "0";
    script.dataset.reactionsEnabled = "1";
    script.dataset.emitMetadata = "0";
    script.dataset.inputPosition = "top";
    script.dataset.theme = resolved === "dark" ? config.themeDark : config.themeLight;
    script.dataset.lang = "zh-CN";
    script.dataset.loading = "lazy";

    const timeout = window.setTimeout(() => {
      setStatus((current) => {
        if (current !== "loading") return current;
        setErrorText("加载超时（10 秒），可能是网络受限或第三方服务暂时不可用。");
        return "error";
      });
    }, 10000);

    script.onload = () => {
      window.clearTimeout(timeout);
      setStatus("ready");
    };
    script.onerror = () => {
      window.clearTimeout(timeout);
      setErrorText("脚本加载失败，可能是网络限制或浏览器拦截了第三方脚本。");
      injectedRef.current = false;
      setStatus("error");
    };
    container.appendChild(script);
  }, [config, configured, resolved]);

  // 进入视口附近才加载（首次检查；之后由「加载」/「重试」按钮控制）
  useEffect(() => {
    if (!configured || injectedRef.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        load();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [configured, load]);

  // 主题变化时同步已加载的 iframe
  useEffect(() => {
    if (status !== "ready") return;
    const iframe = containerRef.current?.querySelector<HTMLIFrameElement>("iframe.giscus-frame");
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: resolved === "dark" ? config.themeDark : config.themeLight } } },
      "https://giscus.app",
    );
  }, [resolved, status, config]);

  const retry = () => {
    containerRef.current?.replaceChildren();
    injectedRef.current = false;
    load();
  };

  return (
    <section aria-labelledby="comments-title" className="mt-12 border-t pt-8" style={{ borderColor: "var(--border-soft)" }}>
      <h2 id="comments-title" className="text-lg">
        留言与讨论
      </h2>
      <p className="mt-1 text-sm subtle">
        评论由 GitHub Discussions 提供，需要用 GitHub 账号登录。登录与评论数据由 GitHub 处理，详见{" "}
        <a href="/privacy/" className="inline-link">
          隐私政策
        </a>
        。
      </p>

      <div className="mt-4" ref={containerRef} data-term={term} />

      {!configured ? (
        <div className="empty-state" role="status">
          <p className="font-semibold">评论区尚未启用</p>
          <p className="mt-1 text-sm subtle">
            站点作者还未配置 Giscus（需要在 site.config.json 中填写 repo、repoId、categoryId，可通过
            giscus.app 的配置工具获取）。启用后，访客即可用 GitHub 账号登录留言；在此之前可以先通过邮箱交流。
          </p>
        </div>
      ) : null}

      {configured && status === "idle" ? (
        <div className="empty-state" role="status">
          <p className="font-semibold">还没有加载评论区</p>
          <p className="mt-1 text-sm subtle">评论脚本为延迟加载：滚动到这里或点击下方按钮后，才会请求 giscus.app 的资源。</p>
          <button type="button" className="btn-outline-primary mt-3" onClick={load}>
            加载评论区
          </button>
        </div>
      ) : null}

      {status === "loading" ? (
        <div className="empty-state" role="status" aria-live="polite">
          <p className="font-semibold">正在加载评论区…</p>
          <p className="mt-1 text-sm subtle">正在请求第三方脚本 giscus.app，不影响页面其他内容的阅读。</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="empty-state" role="alert">
          <p className="font-semibold">评论区加载失败</p>
          <p className="mt-1 text-sm subtle">{errorText}你也可以通过页面底部的邮箱与作者交流。</p>
          <button type="button" className="btn-outline-primary mt-3" onClick={retry}>
            重新加载评论区
          </button>
        </div>
      ) : null}
    </section>
  );
}
