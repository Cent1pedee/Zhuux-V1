import Link from "next/link";

/**
 * 详情页侧栏作者卡：三种详情页共用。
 * 数据来自 site.config.json（由页面传入），不在这里读文件，保持组件可复用。
 */
export function AuthorCard({
  name,
  avatar,
  bio,
  emailHref,
  ctaLabel,
}: {
  name: string;
  avatar: { src: string; alt: string };
  bio: string;
  emailHref: string;
  ctaLabel: string;
}) {
  return (
    <div className="card-surface sidebar-card sidebar-author">
      <img src={avatar.src} alt={avatar.alt} width={72} height={72} />
      <p className="sidebar-author-name">{name}</p>
      <p className="sidebar-author-bio">{bio}</p>
      <a href={emailHref} className="btn-outline-primary btn-sm mt-4">
        {ctaLabel}
      </a>
      <p className="mt-3 text-xs subtle">
        也欢迎通过{" "}
        <Link href="/privacy/" className="inline-link">
          隐私政策
        </Link>{" "}
        了解数据处理方式。
      </p>
    </div>
  );
}
