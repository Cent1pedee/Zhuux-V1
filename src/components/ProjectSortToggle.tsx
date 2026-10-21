"use client";

import { useId } from "react";
import type { ProjectQuery } from "@/lib/project-query";

/**
 * 项目排序：分段控件替代原生下拉，点击即生效并写回 URL。
 */
export function ProjectSortToggle({
  sort,
  options,
  onChange,
}: {
  sort: ProjectQuery["sort"];
  options: { value: ProjectQuery["sort"]; label: string }[];
  onChange: (next: ProjectQuery["sort"]) => void;
}) {
  const id = useId();
  return (
    <div className="seg-toggle" role="group" aria-labelledby={id}>
      <span id={id} className="visually-hidden">
        排序方式
      </span>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={sort === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
