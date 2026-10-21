"use client";

import { Suspense, useCallback, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Project } from "@/content/types";
import { PROJECT_KIND_LABEL, PROJECT_KINDS } from "@/content/types";
import { ProjectCard } from "./ProjectCard";
import { ProjectFilterPanel } from "./ProjectFilterPanel";
import { buildProjectQueryString, parseProjectQuery, type ProjectQuery } from "@/lib/project-query";
import { CopyLinkButton } from "./CopyLinkButton";
import { InlineNotice } from "./InlineNotice";
import { StaggerList, StaggerItem } from "./Motion";

const SORT_OPTIONS: { value: ProjectQuery["sort"]; label: string }[] = [
  { value: "date", label: "按时间（最新优先）" },
  { value: "priority", label: "按重要性" },
];

const KIND_OPTIONS = PROJECT_KINDS.map((kind) => ({ value: kind, label: PROJECT_KIND_LABEL[kind] }));

function matchesQuery(project: Project, query: ProjectQuery): boolean {
  if (query.tags.length && !project.tags.some((tag) => query.tags.includes(tag))) return false;
  if (query.kinds.length && !project.kinds.some((kind) => query.kinds.includes(kind))) return false;
  const keyword = query.q.trim().toLowerCase();
  if (keyword) {
    const haystack = `${project.title} ${project.summary} ${project.tags.join(" ")}`.toLowerCase();
    if (!haystack.includes(keyword)) return false;
  }
  return true;
}

/** 默认排序：时间倒序；可切换为重要性 */
function sortProjects(projects: Project[], sort: ProjectQuery["sort"]): Project[] {
  const copy = [...projects];
  if (sort === "priority") {
    copy.sort((a, b) => b.priority - a.priority || (a.date < b.date ? 1 : -1));
  } else {
    copy.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.priority - a.priority));
  }
  return copy;
}

function Explorer({ projects, allTags }: { projects: Project[]; allTags: string[] }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const query = useMemo(() => parseProjectQuery(search), [search]);

  const onChange = useCallback(
    (next: ProjectQuery, options?: { replace?: boolean }) => {
      const qs = buildProjectQueryString(next);
      const href = qs ? `${pathname}?${qs}` : pathname;
      // 原生 History API：不经过 Next 路由缓存，筛选状态由 useSearchParams 响应
      if (options?.replace) window.history.replaceState(null, "", href);
      else window.history.pushState(null, "", href);
    },
    [pathname],
  );

  const onReset = useCallback(() => {
    window.history.pushState(null, "", pathname);
  }, [pathname]);

  const filtered = useMemo(
    () => sortProjects(projects.filter((project) => matchesQuery(project, query)), query.sort),
    [projects, query],
  );

  // 进入详情时携带当前筛选条件，详情页据此提供「保留筛选返回列表」
  const queryString = buildProjectQueryString(query);

  return (
    <>
      <div className="mt-2">
        <ProjectFilterPanel
          query={query}
          onChange={onChange}
          onReset={onReset}
          resultCount={filtered.length}
          totalCount={projects.length}
          allTags={allTags}
          kindOptions={KIND_OPTIONS}
          sortOptions={SORT_OPTIONS}
        />
      </div>

      {filtered.length > 0 ? (
        <StaggerList className="project-grid mt-6" listKey={queryString}>
          {filtered.map((project) => (
            <StaggerItem key={project.slug}>
              <ProjectCard project={project} queryString={queryString} />
            </StaggerItem>
          ))}
        </StaggerList>
      ) : (
        <div className="mt-6">
          <InlineNotice tone="warning" onDismiss={onReset}>
            没有符合当前条件的项目。可移除部分筛选条件，或点击上方「清除筛选」重新开始。
          </InlineNotice>
          <div className="mt-3">
            <CopyLinkButton label="复制当前（无结果）链接以便反馈" />
          </div>
        </div>
      )}
    </>
  );
}

/** 外层提供 Suspense 边界：useSearchParams 在静态导出（SSG）中必须位于 Suspense 内 */
export function ProjectsExplorer({ projects, allTags }: { projects: Project[]; allTags: string[] }) {
  return (
    <Suspense
      fallback={
        <div aria-busy="true" aria-live="polite">
          <div className="card-surface skeleton-block" style={{ height: 264 }}>
            <span className="visually-hidden">正在加载筛选器…</span>
          </div>
          <div className="project-grid mt-6">
            {projects.map((project) => (
              <div key={project.slug} className="card-surface skeleton-block" style={{ height: 380 }}>
                <span className="visually-hidden">正在加载项目：{project.title}</span>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Explorer projects={projects} allTags={allTags} />
    </Suspense>
  );
}
