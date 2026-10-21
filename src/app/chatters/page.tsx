import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { chatterExcerpt, getAllChatters } from "@/content/chatters";
import { getAllArticles } from "@/content/articles";
import { ChatterCard } from "@/components/ChatterCard";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { TagFilterable } from "@/components/TagFilterable";
import { CoverCarousel, type Slide } from "@/components/CoverCarousel";

export const metadata: Metadata = buildMetadata({
  title: "杂谈",
  description: "日常碎片、灵感与状态的短文记录：构建缓存、阅读笔记、可访问性与一些生活片段。",
  path: "/chatters/",
});

export default function ChattersPage() {
  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const chatters = getAllChatters();
  const articles = getAllArticles();

  const slides: Slide[] = chatters.slice(0, 4).map((chatter) => ({
    href: `/chatters/${chatter.slug}/`,
    title: chatter.title,
    description: chatterExcerpt(chatter, 90),
    cover: "/images/covers/chatter.svg",
    date: chatter.date,
    badge: "Latest · 杂谈",
    tags: chatter.tags,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "杂谈", path: "/chatters/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "杂谈",
            url: `${base}/chatters/`,
            inLanguage: "zh-CN",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: chatters.length,
              itemListElement: chatters.map((chatter, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: chatter.title,
                url: `${base}/chatters/${chatter.slug}/`,
              })),
            },
          },
        ]}
      />
      <div className="page-shell">
        <CatalogHeader
          kicker="CHATTERS · 杂谈"
          title="杂谈"
          description={`比文章更短的记录：工具链的小发现、读到的句子、周末的折腾。共 ${chatters.length} 则。`}
          actions={<CopyLinkButton label="复制本页链接" />}
        />

        {slides.length > 0 ? (
          <div className="catalog-feature">
            <CoverCarousel slides={slides} readLabel="查看杂谈" autoPlayMs={8000} ariaLabel="最新杂谈" />
          </div>
        ) : null}

        {chatters.length > 0 ? (
          <TagFilterable
              noun="杂谈"
              allLabel="全部"
              gridClassName="chatter-grid"
              items={chatters.map((chatter) => ({
                key: chatter.slug,
                tags: chatter.tags,
                node: <ChatterCard chatter={chatter} excerpt={chatterExcerpt(chatter, 170)} />,
              }))}
          />
        ) : (
          <p className="text-sm muted">还没有发布杂谈。</p>
        )}
      </div>
    </>
  );
}
