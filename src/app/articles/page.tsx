import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { getAllArticles } from "@/content/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { TagFilterable } from "@/components/TagFilterable";
import { CoverCarousel, type Slide } from "@/components/CoverCarousel";
import { RssIcon } from "@/components/icons";

export const metadata: Metadata = buildMetadata({
  title: "文章",
  description: "关于前端性能、构建工具链与可访问性的技术文章，支持按标签浏览与 RSS 订阅。",
  path: "/articles/",
});

export default function ArticlesPage() {
  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const articles = getAllArticles();

  const featured: Slide[] = articles.slice(0, 4).map((article) => ({
    href: `/articles/${article.slug}/`,
    title: article.title,
    description: article.summary,
    cover: article.cover,
    date: article.date,
    badge: "Featured · 文章",
    tags: article.tags,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "文章", path: "/articles/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Blog",
            name: site.rss.title,
            description: site.rss.description,
            url: `${base}/articles/`,
            inLanguage: "zh-CN",
            author: { "@type": "Person", name: site.author.name, url: `${base}/` },
            blogPost: articles.map((article) => ({
              "@type": "BlogPosting",
              headline: article.title,
              datePublished: article.date,
              url: `${base}/articles/${article.slug}/`,
            })),
          },
        ]}
      />
      <div className="page-shell">
        <CatalogHeader
          kicker="ARTICLES · 文章"
          title="文章"
          description={`${site.rss.description} 共 ${articles.length} 篇。`}
          actions={<CopyLinkButton label="复制本页链接" />}
        />

        {featured.length > 0 ? (
          <div className="catalog-feature">
            <CoverCarousel slides={featured} readLabel="阅读文章" autoPlayMs={7000} ariaLabel="精选文章" />
          </div>
        ) : null}

        {articles.length > 0 ? (
          <TagFilterable
            noun="文章"
            allLabel="全部"
            gridClassName="article-grid"
            items={articles.map((article) => ({
              key: article.slug,
              tags: article.tags,
              node: <ArticleCard article={article} />,
            }))}
            aside={
              <a href="/rss.xml" className="copy-link-btn">
                <RssIcon width={14} height={14} aria-hidden="true" />
                RSS 订阅
              </a>
            }
          />
        ) : (
          <p className="text-sm muted">暂时还没有发布的文章。</p>
        )}
      </div>
    </>
  );
}
