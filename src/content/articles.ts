import { readContentDir, type FrontMatter, stringField, booleanField, stringList } from "./frontmatter";
import type { Article } from "./types";

export type { Article } from "./types";

function toArticle(data: FrontMatter, body: string): Article {
  const slug = stringField(data, "slug");
  if (!slug) throw new Error("文章缺少 slug 字段");
  return {
    slug,
    title: stringField(data, "title", slug),
    date: stringField(data, "date"),
    tags: stringList(data, "tags"),
    summary: stringField(data, "summary"),
    cover: stringField(data, "cover"),
    coverAlt: stringField(data, "coverAlt"),
    relatedProjects: stringList(data, "relatedProjects"),
    body,
  };
}

let cache: Article[] | null = null;

/** 已发布文章，按时间倒序；draft: true 的文章不出现在任何列表、RSS、sitemap 中 */
export function getAllArticles(): Article[] {
  if (cache) return cache;
  const articles = readContentDir("content/articles")
    .filter(({ data }) => !booleanField(data, "draft"))
    .map(({ data, body }) => toArticle(data, body));
  articles.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = articles;
  return articles;
}

export function getArticle(slug: string): Article | undefined {
  return getAllArticles().find((article) => article.slug === slug);
}

export function getAllArticleTags(): string[] {
  const set = new Set<string>();
  getAllArticles().forEach((article) => article.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
