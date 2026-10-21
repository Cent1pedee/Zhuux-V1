import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

/** 页面面包屑：三种详情页共用，最后一项为当前页（不可点击） */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="面包屑" className="mb-4">
      <ol className="breadcrumb">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {item.href && !last ? (
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={last ? "min-w-0 truncate" : undefined}
                  style={last ? { color: "var(--color-base-content)" } : undefined}
                >
                  {item.label}
                </span>
              )}
              {last ? null : (
                <span aria-hidden="true" className="subtle">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
