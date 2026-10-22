import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { getAllChatters, getChatter, toPlainText } from "@/content/chatters";
import { getAllArticles, getArticle } from "@/content/articles";
import { Markdown } from "@/components/Markdown";
import { SidebarRecommend } from "@/components/DetailAside";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AuthorCard } from "@/components/AuthorCard";
import { BackToTop } from "@/components/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PagerShell, ArticlePager } from "@/components/PagerTransition";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllChatters().map((chatter) => ({ slug: chatter.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const chatter = getChatter(slug);
  if (!chatter) return { title: "杂谈不存在" };
  return buildMetadata({
    title: chatter.title,
    description: toPlainText(chatter.body).slice(0, 90),
    path: `/chatters/${chatter.slug}/`,
    image: "/images/covers/chatter.svg",
    type: "article",
    publishedTime: chatter.date,
    tags: chatter.tags,
  });
}

export default async function ChatterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const chatter = getChatter(slug);
  if (!chatter) notFound();

  const site = getSiteConfig();
  const all = getAllChatters();
  const index = all.findIndex((item) => item.slug === chatter.slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : undefined;
  const related = all.filter((item) => item.slug !== chatter.slug).slice(0, 4);
  // 推荐一篇相关长文：优先取与该杂谈标签重合的文章，否则取最新文章
  const articles = getAllArticles();
  const relatedArticle =
    articles.find((article) => article.tags.some((tag) => chatter.tags.includes(tag))) ??
    (articles[0] ? getArticle(articles[0].slug) : undefined);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            title: chatter.title,
            description: toPlainText(chatter.body).slice(0, 120),
            path: `/chatters/${chatter.slug}/`,
            datePublished: chatter.date,
            tags: chatter.tags,
            image: "/images/covers/chatter.svg",
          }),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "杂谈", path: "/chatters/" },
            { name: chatter.title, path: `/chatters/${chatter.slug}/` },
          ]),
        ]}
      />

      <div className="page-shell">
        <Breadcrumbs
          items={[
            { label: "首页", href: "/" },
            { label: "杂谈", href: "/chatters/" },
            { label: chatter.title },
          ]}
        />

        <div className="detail-grid">
          <PagerShell>
          <article className="card-surface glass-article" aria-labelledby="chatter-title">
            <header className="border-b pb-5" style={{ borderColor: "var(--border-soft)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="status-pill" data-tone="info">
                  杂谈
                </span>
                {chatter.tags.map((tag) => (
                  <span key={tag} className="chip">
                    #{tag}
                  </span>
                ))}
              </div>
              <h1 id="chatter-title" className="mt-3 text-[26px] leading-snug md:text-[34px]">
                {chatter.title}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-3 text-sm subtle">
                <time dateTime={chatter.date}>{chatter.date}</time>
                {chatter.mood ? <span className="chip">{chatter.mood}</span> : null}
                <span>约 {Math.max(1, Math.round(chatter.body.length / 400))} 分钟读完</span>
              </p>
            </header>

            <div className="mt-6">
              <Markdown source={chatter.body} />
            </div>

            <footer className="mt-10 border-t pt-5" style={{ borderColor: "var(--border-soft)" }}>
              <ArticlePager
                label="杂谈翻页"
                prev={newer ? { href: `/chatters/${newer.slug}/`, title: newer.title, meta: newer.date } : null}
                next={older ? { href: `/chatters/${older.slug}/`, title: older.title, meta: older.date } : null}
                prevLabel="更新的一则"
                nextLabel="更早的一则"
              />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Link href="/chatters/" className="btn-outline-primary btn-sm">
                  全部杂谈
                </Link>
                <div className="flex items-center gap-4">
                  <CopyLinkButton label="复制本则链接" />
                  <BackToTop />
                </div>
              </div>
            </footer>
          </article>
          </PagerShell>

          <div className="detail-aside sidebar-stack">
            <AuthorCard
              name={site.author.name}
              avatar={{ src: site.author.avatar.src, alt: site.author.avatar.alt }}
              bio={site.author.bio}
              emailHref={site.contact.emailHref}
              ctaLabel="发邮件聊聊"
            />

            <div className="card-surface sidebar-card">
              <p className="sidebar-title">更多杂谈</p>
              <SidebarRecommend
                items={related.map((item) => ({ href: `/chatters/${item.slug}/`, title: item.title, date: item.date }))}
              />
            </div>

            {relatedArticle ? (
              <div className="card-surface sidebar-card">
                <p className="sidebar-title">推荐长文</p>
                <SidebarRecommend items={[{ href: `/articles/${relatedArticle.slug}/`, title: relatedArticle.title, date: relatedArticle.date }]} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
