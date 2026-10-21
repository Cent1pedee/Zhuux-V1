"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ProjectQuery } from "@/lib/project-query";
import { SearchIcon } from "./icons";

/**
 * 项目搜索框：带图标的紧凑输入，300ms 防抖后写回 URL。
 * 点击右侧清除按钮立即清空（不等待防抖）。
 */
export function ProjectSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string, options?: { replace?: boolean }) => void;
}) {
  const [text, setText] = useState(value);
  const id = useId();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setText(value);
  }, [value]);

  useEffect(() => {
    if (text === value) return;
    const timer = window.setTimeout(() => onChangeRef.current(text, { replace: true }), 300);
    return () => window.clearTimeout(timer);
  }, [text, value]);

  return (
    <div className="project-search">
      <SearchIcon width={15} height={15} aria-hidden="true" />
      <label htmlFor={id} className="visually-hidden">
        按名称或描述搜索项目
      </label>
      <input
        id={id}
        type="search"
        value={text}
        placeholder="搜索项目名称或描述"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setText("");
            onChange("", { replace: true });
          }
        }}
      />
      {text ? (
        <button
          type="button"
          className="project-search-clear"
          aria-label="清空搜索"
          onClick={() => {
            setText("");
            onChange("", { replace: true });
          }}
        >
          ✕
        </button>
      ) : null}
    </div>
  );
}
