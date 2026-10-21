import { getAllArticles } from "@/content/articles";
import { getSiteConfig } from "@/lib/site";

// 与 sitemap、robots 一致：静态导出到 out/rss.xml
export const dynamic = "force-static";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, 8, 0, 0)).toUTCString();
}

/** 全文 RSS（PRD：RSS 为默认订阅方案，自动生成，不强制收集邮箱） */
export function GET() {
  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const articles = getAllArticles();

  const items = articles
    .map((article) => {
      const categories = article.tags.map((tag) => `      <category>${escapeXml(tag)}</category>`).join("\n");
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${base}/articles/${article.slug}/</link>
      <guid isPermaLink="true">${base}/articles/${article.slug}/</guid>
      <pubDate>${toRfc822(article.date)}</pubDate>
      <description>${escapeXml(article.summary)}</description>
      <content:encoded><![CDATA[${article.body.split("]]>").join("]]&gt;")}]]></content:encoded>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.rss.title)}</title>
    <link>${base}/articles/</link>
    <description>${escapeXml(site.rss.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${toRfc822(articles[0]?.date ?? "2026-01-01")}</lastBuildDate>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
