import Link from "next/link";

/** 侧栏推荐列表：标题 + 日期（详情页复用） */
export function SidebarRecommend({ items }: { items: { href: string; title: string; date: string }[] }) {
  if (items.length === 0) return <p className="text-xs subtle">暂无更多内容。</p>;
  return (
    <ul className="sidebar-recommend">
      {items.map((item) => (
        <li key={item.href}>
          <Link href={item.href}>
            <span className="t">{item.title}</span>
            <span className="d">{item.date}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
