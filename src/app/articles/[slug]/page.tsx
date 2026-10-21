import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import { articleJsonLd, breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { getAllArticles, getArticle } from "@/content/articles";
import { getProject } from "@/content/projects";
import { Markdown, extractHeadings } from "@/components/Markdown";
import { TableOfContents } from "@/components/TableOfContents";
import { Comments } from "@/components/Comments";
import { SidebarRecommend } from "@/components/DetailAside";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AuthorCard } from "@/components/AuthorCard";
import { BackToTop } from "@/components/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { ReadingProgress } from "@/components/ReadingProgress";
import { PagerShell, PagerLink } from "@/components/PagerTransition";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "文章不存在" };
  return buildMetadata({
    title: article.title,
    description: article.summary,
    path: `/articles/${article.slug}/`,
    image: article.cover,
    type: "article",
    publishedTime: article.date,
    tags: article.tags,
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const site = getSiteConfig();
  const articles = getAllArticles();
  const index = articles.findIndex((item) => item.slug === article.slug);
  const newer = index > 0 ? articles[index - 1] : undefined;
  const older = index >= 0 && index < articles.length - 1 ? articles[index + 1] : undefined;
  const relatedProjects = article.relatedProjects.map((projectSlug) => getProject(projectSlug)).filter((project) => project !== undefined);
  const headings = extractHeadings(article.body);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            title: article.title,
            description: article.summary,
            path: `/articles/${article.slug}/`,
            datePublished: article.date,
            tags: article.tags,
            image: article.cover,
          }),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "文章", path: "/articles/" },
            { name: article.title, path: `/articles/${article.slug}/` },
          ]),
        ]}
      />

      <div className="page-shell">
        <Breadcrumbs
          items={[
            { label: "首页", href: "/" },
            { label: "文章", href: "/articles/" },
            { label: article.title },
          ]}
        />

        <div className="detail-grid">
          <PagerShell>
          <article className="card-surface glass-article" aria-labelledby="article-title">
            <div className="article-hero-cover reveal">
              <img src={article.cover} alt={article.coverAlt} width={1000} height={400} loading="eager" fetchPriority="high" decoding="async" />
            </div>

            <header className="article-header">
              <ul className="flex flex-wrap gap-2" aria-label="文章标签">
                {article.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/articles/?tag=${encodeURIComponent(tag)}`} className="chip" aria-label={`查看标签为${tag}的文章`}>
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
              <h1 id="article-title" className="mt-4">
                {article.title}
              </h1>
              <p className="mt-4 flex flex-wrap items-center gap-2 text-sm subtle">
                <time dateTime={article.date}>{article.date}</time>
                <span aria-hidden="true">·</span>
                <span>作者：{site.author.name}</span>
                <span aria-hidden="true">·</span>
                <span>约 {Math.max(1, Math.round(article.body.length / 400))} 分钟阅读</span>
              </p>
              <p className="article-lead">{article.summary}</p>
            </header>

            <ReadingProgress targetId="article-content" />

            <div id="article-content" className="mt-2 border-t pt-6" style={{ borderColor: "var(--border-soft)" }}>
              <Markdown source={article.body} />
            </div>

            <footer className="related-section">
              {relatedProjects.length > 0 ? (
                <div className="mb-6">
                  <h2 className="text-base">相关项目</h2>
                  <ul className="mt-2 space-y-2 text-sm">
                    {relatedProjects.map((project) => (
                      <li key={project.slug}>
                        <Link href={`/projects/${project.slug}/`} className="inline-link">
                          项目：{project.title}
                        </Link>
                        <span className="subtle"> —— {project.summary}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <nav aria-label="文章翻页" className="flex flex-col gap-3 text-sm sm:flex-row sm:justify-between">
                {newer ? (
                  <PagerLink href={`/articles/${newer.slug}/`} direction="prev">
                    <span className="pager-arrow" data-dir="prev" aria-hidden="true">
                      ←
                    </span>
                    更新的文章：{newer.title}
                  </PagerLink>
                ) : (
                  <span />
                )}
                {older ? (
                  <PagerLink href={`/articles/${older.slug}/`} direction="next" className="inline-link sm:text-right">
                    更早的文章：{older.title}
                    <span className="pager-arrow" data-dir="next" aria-hidden="true">
                      →
                    </span>
                  </PagerLink>
                ) : null}
              </nav>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <Link href="/articles/" className="btn-outline-primary btn-sm">
                    全部文章
                  </Link>
                  <a href="/rss.xml" className="btn-text">
                    订阅 RSS
                  </a>
                  <CopyLinkButton label="复制本文链接" />
                </div>
                <BackToTop />
              </div>
            </footer>

            <Comments config={site.giscus} term={`/articles/${article.slug}/`} />
          </article>
          </PagerShell>

          <div className="detail-aside sidebar-stack">
            <AuthorCard
              name={site.author.name}
              avatar={{ src: site.author.avatar.src, alt: site.author.avatar.alt }}
              bio={site.author.bio}
              emailHref={site.contact.emailHref}
              ctaLabel="发邮件讨论"
            />

            {headings.length > 0 ? (
              <div className="card-surface sidebar-card">
                <p className="sidebar-title">本文目录</p>
                <TableOfContents headings={headings} title="" />
              </div>
            ) : null}

            <div className="card-surface sidebar-card">
              <p className="sidebar-title">继续阅读</p>
              <SidebarRecommend
                items={articles
                  .filter((item) => item.slug !== article.slug)
                  .slice(0, 4)
                  .map((item) => ({ href: `/articles/${item.slug}/`, title: item.title, date: item.date }))}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
