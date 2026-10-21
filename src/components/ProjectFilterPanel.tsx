"use client";

import { useId } from "react";
import type { ProjectQuery } from "@/lib/project-query";
import { CopyLinkButton } from "./CopyLinkButton";
import { TagChips } from "./TagChips";
import { Toolbar } from "./Toolbar";
import { ProjectSearch } from "./ProjectSearch";
import { ProjectSortToggle } from "./ProjectSortToggle";

/**
 * 项目工具栏：一行完成「结果计数 + 搜索 + 排序 + 清除 + 复制链接」，
 * 第二行是技术栈与类型筛选，当前条件以可移除 chip 形式附在底部。
 */
export function ProjectFilterPanel({
  query,
  onChange,
  onReset,
  resultCount,
  totalCount,
  allTags,
  kindOptions,
  sortOptions,
}: {
  query: ProjectQuery;
  onChange: (next: ProjectQuery, options?: { replace?: boolean }) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
  allTags: string[];
  kindOptions: { value: string; label: string }[];
  sortOptions: { value: ProjectQuery["sort"]; label: string }[];
}) {
  const countId = useId();

  const toggleTag = (tag: string) => {
    const tags = query.tags.includes(tag) ? query.tags.filter((item) => item !== tag) : [...query.tags, tag];
    onChange({ ...query, tags });
  };

  const toggleKind = (kind: string) => {
    const kinds = query.kinds.includes(kind) ? query.kinds.filter((item) => item !== kind) : [...query.kinds, kind];
    onChange({ ...query, kinds });
  };

  const activeChips = [
    ...query.tags.map((tag) => ({ key: `tag-${tag}`, label: `技术 · ${tag}`, onRemove: () => toggleTag(tag) })),
    ...query.kinds.map((kind) => ({
      key: `kind-${kind}`,
      label: `类型 · ${kindOptions.find((option) => option.value === kind)?.label ?? kind}`,
      onRemove: () => toggleKind(kind),
    })),
    ...(query.q.trim() ? [{ key: "q", label: `关键词 · ${query.q.trim()}`, onRemove: () => onChange({ ...query, q: "" }) }] : []),
  ];
  const hasActiveFilter = activeChips.length > 0;

  return (
    <Toolbar
      count={
        <p id={countId} className="toolbar-count" role="status" aria-live="polite">
          共{" "}
          <strong key={resultCount} className="filter-count">
            {resultCount}
          </strong>{" "}
          / {totalCount} 个项目
        </p>
      }
      right={
        <>
          <ProjectSearch value={query.q} onChange={(q, options) => onChange({ ...query, q }, options)} />
          <ProjectSortToggle sort={query.sort} options={sortOptions} onChange={(sort) => onChange({ ...query, sort })} />
          {hasActiveFilter ? (
            <button type="button" className="copy-link-btn" onClick={onReset}>
              清除筛选
            </button>
          ) : null}
          <CopyLinkButton label="复制当前链接" />
        </>
      }
      left={
        <div className="grid gap-3">
          <div>
            <p className="toolbar-label">技术栈</p>
            <div className="mt-2">
              <TagChips
                options={allTags.map((tag) => ({ name: tag }))}
                active={query.tags}
                multi
                onSelect={(tag) => {
                  if (tag) toggleTag(tag);
                }}
              />
            </div>
          </div>
          <div>
            <p className="toolbar-label">项目类型</p>
            <div className="mt-2">
              <TagChips
                options={kindOptions.map((option) => ({ name: option.label }))}
                active={kindOptions.filter((option) => query.kinds.includes(option.value)).map((option) => option.label)}
                multi
                onSelect={(label) => {
                  const option = kindOptions.find((item) => item.label === label);
                  if (option) toggleKind(option.value);
                }}
              />
            </div>
          </div>
        </div>
      }
      footer={
        hasActiveFilter ? (
          <ul className="flex flex-wrap items-center gap-2 text-xs" aria-label="当前生效的筛选条件">
            <li className="subtle">当前条件</li>
            {activeChips.map((chip) => (
              <li key={chip.key} className="filter-chip-in">
                <button type="button" className="chip" onClick={chip.onRemove} aria-label={`移除筛选条件：${chip.label}`}>
                  {chip.label}
                  <span aria-hidden="true">✕</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null
      }
    />
  );
}
