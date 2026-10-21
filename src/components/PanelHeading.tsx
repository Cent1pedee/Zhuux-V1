import type { ReactNode } from "react";

/** 首页各玻璃面板的统一标题（kicker + 标题 + 右侧操作），避免每处重复结构 */
export function PanelHeading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="section-kicker">{kicker}</p>
        <h2 className="mt-1 text-xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}
