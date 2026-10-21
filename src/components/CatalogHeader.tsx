import type { ReactNode } from "react";

/**
 * 分类页统一头部：小标题 + 大标题 + 描述 + 右侧操作区。
 * 不再包含「文章 / 项目 / 杂谈」切换 —— 该职责由顶部主导航承担，避免重复入口。
 */
export function CatalogHeader({
  kicker,
  title,
  titleId,
  description,
  children,
  actions,
}: {
  kicker: string;
  title: string;
  titleId?: string;
  description: ReactNode;
  children?: ReactNode;
  /** 标题下方的一行操作（例如复制本页链接） */
  actions?: ReactNode;
}) {
  return (
    <header className="catalog-head">
      <div className="min-w-0">
        <p className="section-kicker">{kicker}</p>
        <h1 id={titleId} className="catalog-title mt-2">
          {title}
        </h1>
        <p className="catalog-subtitle">{description}</p>
        {actions ? <div className="catalog-actions">{actions}</div> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-3">{children}</div> : null}
    </header>
  );
}
