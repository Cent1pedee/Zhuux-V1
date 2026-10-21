"use client";

/** 标签筛选按钮组：文章 / 杂谈为单选，项目技术栈与类型为多选 */
export interface TagChipOption {
  name: string;
  count?: number;
}

export function TagChips({
  options,
  active,
  allLabel,
  allCount,
  onSelect,
  multi = false,
  legend,
}: {
  options: TagChipOption[];
  /** 单选：当前标签或 null；多选：已选数组 */
  active: string | null | string[];
  allLabel?: string;
  allCount?: number;
  onSelect: (tag: string | null) => void;
  multi?: boolean;
  legend?: string;
}) {
  const selected = Array.isArray(active) ? active : active === null ? [] : [active];
  const isActive = (tag: string) => selected.includes(tag);
  const noneActive = selected.length === 0;

  return (
    <div>
      {legend ? <legend className="filter-legend mb-2.5">{legend}</legend> : null}
      <ul className="flex flex-wrap gap-2" aria-label={legend ?? "标签筛选"}>
        {allLabel ? (
          <li>
            <button type="button" className={`chip${noneActive ? " is-active" : ""}`} aria-pressed={noneActive} onClick={() => onSelect(null)}>
              {allLabel}
              {typeof allCount === "number" ? `（${allCount}）` : ""}
            </button>
          </li>
        ) : null}
        {options.map((option) => {
          const pressed = isActive(option.name);
          return (
            <li key={option.name}>
              <button
                type="button"
                className={`chip${pressed ? " is-active" : ""}`}
                aria-pressed={pressed}
                onClick={() => onSelect(option.name)}
              >
                {multi ? option.name : `${option.name}${typeof option.count === "number" ? `（${option.count}）` : ""}`}
                {multi && typeof option.count === "number" ? (
                  <span className="subtle" aria-hidden="true">
                    {option.count}
                  </span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
