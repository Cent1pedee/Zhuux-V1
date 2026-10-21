import { getAllArticles } from "@/content/articles";
import { chatterExcerpt, getAllChatters } from "@/content/chatters";
import { getAllProjects } from "@/content/projects";

export interface SearchEntry {
  href: string;
  title: string;
  /** 参与检索的纯文本（摘要 + 标签），不含完整正文，控制 HTML 体积 */
  text: string;
  type: "article" | "project" | "chatter";
}

/** 全站搜索索引：布局层生成一次，交给页头搜索使用 */
export function getSearchIndex(): SearchEntry[] {
  const articles = getAllArticles().map((article) => ({
    href: `/articles/${article.slug}/`,
    title: article.title,
    text: `${article.summary} ${article.tags.join(" ")}`,
    type: "article" as const,
  }));

  const projects = getAllProjects().map((project) => ({
    href: `/projects/${project.slug}/`,
    title: project.title,
    text: `${project.summary} ${project.tags.join(" ")}`,
    type: "project" as const,
  }));

  const chatters = getAllChatters().map((chatter) => ({
    href: `/chatters/${chatter.slug}/`,
    title: chatter.title,
    text: `${chatterExcerpt(chatter, 120)} ${chatter.tags.join(" ")}`,
    type: "chatter" as const,
  }));

  return [...articles, ...projects, ...chatters];
}
