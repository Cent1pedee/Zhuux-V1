import type { ReactNode } from "react";

/**
 * 列表错峰入场（零运行时依赖）：
 * - 通过 listKey 变化重新挂载容器，从而在筛选 / 切换标签后重新播放
 * - 动画由 CSS `.stagger-list > *` 负责；减少动效时由全局媒体查询关闭
 */
export function StaggerList({
  children,
  className = "",
  listKey,
}: {
  children: ReactNode;
  className?: string;
  listKey?: string;
}) {
  return (
    <div key={listKey} className={`stagger-list ${className}`}>
      {children}
    </div>
  );
}

/** StaggerList 的子项：只需普通容器，错峰由父级 CSS 的 nth-child 完成 */
export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`stagger-item ${className}`}>{children}</div>;
}
