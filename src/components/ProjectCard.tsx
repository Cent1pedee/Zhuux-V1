"use client";

import { type MouseEvent, useEffect, useRef } from "react";
import { track } from "@/lib/analytics";
import { PROJECT_KIND_LABEL, PROJECT_STATUS_LABEL, type Project } from "@/content/types";
import { ArrowRightIcon } from "./icons";

/** 项目卡片内部内容（详情页「相关项目」复用） */
export function ProjectCardContent({ project }: { project: Project }) {
  return (
    <>
      <div className="cover-frame">
        <img src={project.cover} alt={project.coverAlt} width={1000} height={400} decoding="async" loading="lazy" />
      </div>
      <div className="project-card-body">
        <div className="project-card-meta">
          <time dateTime={project.date}>{project.date}</time>
          {project.status ? (
            <span className="status-pill" data-tone={project.status === "archived" ? "warning" : "info"}>
              {PROJECT_STATUS_LABEL[project.status]}
            </span>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{project.kinds.map((kind) => PROJECT_KIND_LABEL[kind]).join(" / ")}</span>
        </div>
        <h3 className="project-card-title" id={`project-${project.slug}-title`}>
          {project.title}
        </h3>
        <p id={`project-${project.slug}-summary`} className="text-sm" style={{ color: "var(--text-muted)" }}>
          {project.summary}
        </p>
        <ul className="flex flex-wrap gap-2 pt-1" aria-label={`${project.title} 的技术标签`}>
          {project.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        <span className="project-card-more">
          查看项目详情
          <ArrowRightIcon width={16} height={16} />
        </span>
      </div>
    </>
  );
}

/** 鼠标跟随光斑：只写 CSS 变量，合并到 rAF，不触发重渲染 */
function usePointerGlow() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        el.style.setProperty("--my", `${event.clientY - rect.top}px`);
      });
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
    };
  }, []);
  return ref;
}

/**
 * 项目卡片：语义化 <article>，标题链接进入详情页（整卡可点击）。
 * 使用普通 <a> 而非 next/link：保证「从详情返回列表」时列表重新渲染为当前数据。
 */
export function ProjectCard({
  project,
  queryString,
}: {
  project: Project;
  /** 进入详情时携带的筛选参数，详情页据此提供「保留筛选返回列表」 */
  queryString?: string;
}) {
  const glowRef = usePointerGlow();
  const href = `/projects/${project.slug}/${queryString ? `?list=${encodeURIComponent(queryString)}` : ""}`;

  const attachRefs = (el: HTMLElement | null) => {
    (glowRef as React.MutableRefObject<HTMLElement | null>).current = el;
  };

  return (
    <article
      ref={attachRefs}
      className="card-surface glow-card project-card"
      data-interactive="true"
      aria-labelledby={`project-${project.slug}-title`}
    >
      <a
        href={href}
        className="project-card-link"
        aria-describedby={`project-${project.slug}-summary`}
        onClick={(event: MouseEvent) => track("project_link_click", { slug: project.slug, target: "detail" })}
      >
        <ProjectCardContent project={project} />
      </a>
    </article>
  );
}
