import type { MetadataRoute } from "next";
import { getAllArticles } from "@/content/articles";
import { getAllProjects } from "@/content/projects";
import { getAllChatters } from "@/content/chatters";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-static";

/** XML sitemap：首页、列表页、隐私页 + 全部项目与文章详情（设置页不收录） */
export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/projects/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/articles/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/chatters/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/privacy/`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const projects: MetadataRoute.Sitemap = getAllProjects().map((project) => ({
    url: `${base}/projects/${project.slug}/`,
    lastModified: new Date(`${project.date}T08:00:00+08:00`),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const articles: MetadataRoute.Sitemap = getAllArticles().map((article) => ({
    url: `${base}/articles/${article.slug}/`,
    lastModified: new Date(`${article.date}T08:00:00+08:00`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const chatters: MetadataRoute.Sitemap = getAllChatters().map((chatter) => ({
    url: `${base}/chatters/${chatter.slug}/`,
    lastModified: new Date(`${chatter.date}T08:00:00+08:00`),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...projects, ...articles, ...chatters];
}
