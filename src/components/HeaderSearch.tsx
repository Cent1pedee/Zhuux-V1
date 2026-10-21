"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SearchEntry } from "@/lib/search-index";
import { SearchIcon } from "./icons";

const TYPE_LABEL: Record<SearchEntry["type"], string> = {
  article: "文章",
  project: "项目",
  chatter: "杂谈",
};

function Highlight({ text, query }: { text: string; query: string }) {
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (!query || index === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + query.length)}</mark>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * 页头搜索：平时是一个 40px 的放大镜按钮，点击后向左侧展开为胶囊搜索条。
 * - 展开时导航变淡，避免视觉重叠；Esc / 点击外部 / 关闭按钮收起
 * - ⌘K（Ctrl+K）随时唤起；↑/↓ 选择、Enter 打开
 * - 关闭后焦点回到放大镜按钮
 */
export function HeaderSearch({ entries }: { entries: SearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const listboxId = useId();

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return entries.filter((entry) => `${entry.title} ${entry.text}`.toLowerCase().includes(q)).slice(0, 4);
  }, [entries, q]);

  const openSearch = () => {
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const closeSearch = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    setActiveIndex(-1);
    if (restoreFocus) requestAnimationFrame(() => toggleRef.current?.focus());
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (open) closeSearch();
        else openSearch();
      }
      if (event.key === "Escape" && open) {
        event.preventDefault();
        closeSearch();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (open && rootRef.current && !rootRef.current.contains(event.target as Node)) closeSearch(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    setActiveIndex(results.length > 0 ? 0 : -1);
  }, [results.length, q]);

  const goActive = () => {
    if (activeIndex >= 0 && results[activeIndex]) {
      const href = results[activeIndex].href;
      closeSearch(false);
      router.push(href);
    }
  };

  return (
    <div className={`header-search${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        ref={toggleRef}
        type="button"
        className="header-search-toggle"
        aria-label="搜索文章、项目与杂谈（⌘K）"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={openSearch}
      >
        <SearchIcon width={18} height={18} />
      </button>

      <div className="header-search-capsule" id={panelId} aria-hidden={!open} inert={!open ? true : undefined}>
        <SearchIcon width={16} height={16} className="header-search-icon" />
        <label htmlFor="header-search-input" className="visually-hidden">
          搜索文章、项目与杂谈
        </label>
        <input
          ref={inputRef}
          id="header-search-input"
          type="search"
          autoComplete="off"
          placeholder="搜索文章、项目与杂谈…"
          value={query}
          tabIndex={open ? 0 : -1}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeSearch();
              return;
            }
            if (results.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((value) => (value + 1) % results.length);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((value) => (value - 1 + results.length) % results.length);
            } else if (event.key === "Enter") {
              event.preventDefault();
              goActive();
            }
          }}
          role="combobox"
          aria-expanded={open && q.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
        />
        <button type="button" className="header-search-close" aria-label="关闭搜索" onClick={() => closeSearch()} tabIndex={open ? 0 : -1}>
          <span aria-hidden="true">✕</span>
        </button>
      </div>

      {open && q ? (
        <div className="header-search-results" id={listboxId} role="listbox" aria-label="搜索结果">
          {results.length === 0 ? (
            <p className="search-empty">没有找到「{query}」相关的内容。</p>
          ) : (
            results.map((entry, index) => (
              <Link
                key={entry.href}
                id={`${listboxId}-option-${index}`}
                href={entry.href}
                className={`search-result${index === activeIndex ? " is-active" : ""}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => closeSearch(false)}
              >
                <span className="chip shrink-0">{TYPE_LABEL[entry.type]}</span>
                <span className="min-w-0 truncate">
                  <Highlight text={entry.title} query={query.trim()} />
                </span>
              </Link>
            ))
          )}
          <p className="search-hint" aria-hidden="true">
            ↑↓ 选择 · Enter 打开 · Esc 关闭
          </p>
        </div>
      ) : null}

      {open && q ? (
        <p className="visually-hidden" role="status" aria-live="polite">
          共 {results.length} 条结果
        </p>
      ) : null}
    </div>
  );
}
