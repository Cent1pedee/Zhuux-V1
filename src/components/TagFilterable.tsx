"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CopyLinkButton } from "./CopyLinkButton";
import { TagChips } from "./TagChips";
import { Toolbar } from "./Toolbar";
import { StaggerList, StaggerItem } from "./Motion";

export interface TagFilterableItem {
  key: string;
  tags: string[];
  node: ReactNode;
}

function TagGrid({
  items,
  gridClassName,
  noun,
  allLabel,
  aside,
}: {
  items: TagFilterableItem[];
  gridClassName: string;
  noun: string;
  allLabel: string;
  aside?: ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const tags = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item) => item.tags.forEach((tag) => map.set(tag, (map.get(tag) ?? 0) + 1)));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
  }, [items]);

  const filtered = activeTag ? items.filter((item) => item.tags.includes(activeTag)) : items;

  const setTag = (tag: string | null) => {
    window.history.pushState(null, "", tag ? `${pathname}?tag=${encodeURIComponent(tag)}` : pathname);
  };

  return (
    <>
      {/* 无 JS 时隐藏工具栏，服务端已渲染全部条目 */}
      <Toolbar
        count={
          <p className="toolbar-count" role="status" aria-live="polite">
            {activeTag ? (
              <>
                标签 <strong>{activeTag}</strong> · 共 <strong key={filtered.length}>{filtered.length}</strong> {noun}
              </>
            ) : (
              <>
                全部 <strong key={filtered.length}>{items.length}</strong> {noun}
              </>
            )}
          </p>
        }
        right={
          <>
            {aside}
            <CopyLinkButton label="复制当前链接" />
          </>
        }
        left={
          <div>
            <p className="toolbar-label">
              <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>
                #
              </span>
              标签筛选
            </p>
            <div className="mt-2">
              <TagChips
                allLabel={allLabel}
                allCount={items.length}
                options={tags.map(({ name, count }) => ({ name, count }))}
                active={activeTag}
                onSelect={(tag) => setTag(tag)}
              />
            </div>
          </div>
        }
        footer={
          filtered.length === 0 ? (
            <button type="button" className="btn-text" onClick={() => setTag(null)}>
              查看全部{noun}
            </button>
          ) : null
        }
      />

      <StaggerList className={`${gridClassName} mt-5`} listKey={activeTag ?? "all"}>
        {filtered.map((item) => (
          <StaggerItem key={item.key}>{item.node}</StaggerItem>
        ))}
      </StaggerList>

      {filtered.length === 0 ? <p className="mt-4 text-sm muted">该标签下暂无{noun}。</p> : null}
    </>
  );
}

/**
 * 通用「按标签筛选」列表：服务端渲染全部卡片，客户端只负责过滤与 URL 同步。
 * 文章与杂谈共用；工具栏右侧可插入页面专属操作（如 RSS）。
 */
export function TagFilterable(props: {
  items: TagFilterableItem[];
  gridClassName: string;
  noun: string;
  allLabel?: string;
  aside?: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className={`${props.gridClassName} mt-5`} aria-busy="true" aria-live="polite">
          {props.items.map((item) => (
            <div key={item.key} className="skeleton-block" style={{ height: 320 }}>
              <span className="visually-hidden">正在加载内容</span>
            </div>
          ))}
        </div>
      }
    >
      <TagGrid
        items={props.items}
        gridClassName={props.gridClassName}
        noun={props.noun}
        allLabel={props.allLabel ?? "全部"}
        aside={props.aside}
      />
    </Suspense>
  );
}
