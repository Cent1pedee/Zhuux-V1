import "server-only";
import type { Metadata } from "next";
import { getSiteConfig } from "./site";

const site = getSiteConfig();

export const siteMeta = {
  name: site.title,
  url: site.url.replace(/\/$/, ""),
  author: site.author.name,
  jobTitle: site.author.jobTitle,
  directionTags: site.author.directionTags,
  email: site.contact.email,
  location: site.location.city,
  socials: site.socials,
};

interface PageMetaInput {
  title: string;
  description: string;
  /** 语义化路径，如 /projects/lumen-ui/ */
  path: string;
  /** 不使用「标题 · 站点名」模板（首页使用完整标题） */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  tags?: string[];
  image?: string;
}

export function buildMetadata({ title, description, path, absoluteTitle, type = "website", publishedTime, tags, image }: PageMetaInput): Metadata {
  const canonical = path;
  const ogImage = image ?? "/og/default.svg";
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.title,
      locale: "zh_CN",
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags ? { tags } : {}),
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/** Person 结构化数据（全站共享，由首页输出） */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.author.name,
    url: `${siteMeta.url}/`,
    jobTitle: site.author.jobTitle,
    description: site.author.bio,
    image: `${siteMeta.url}${site.author.avatar.src}`,
    email: `mailto:${site.contact.email}`,
    knowsAbout: site.author.directionTags,
    knowsLanguage: ["zh-CN"],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressCountry: "CN",
    },
    sameAs: site.socials.filter((s) => s.kind !== "email" && !s.href.startsWith("mailto:")).map((s) => s.href),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.title,
    url: `${siteMeta.url}/`,
    inLanguage: "zh-CN",
    author: { "@type": "Person", name: site.author.name, url: `${siteMeta.url}/` },
  };
}

export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  datePublished: string;
  tags: string[];
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    datePublished: input.datePublished,
    dateModified: input.datePublished,
    inLanguage: "zh-CN",
    image: `${siteMeta.url}${input.image}`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${siteMeta.url}${input.path}` },
    keywords: input.tags.join(", "),
    author: { "@type": "Person", name: site.author.name, url: `${siteMeta.url}/` },
  };
}

/**
 * 项目结构化数据。
 * Schema.org 有 Project（只是 CreativeWork 的子类型别名），这里使用 SoftwareSourceCode，
 * 它是搜索引擎对「软件项目」最通用的类型，同样包含 name/description/url/codeRepository。
 */
export function projectSoftwareJsonLd(input: {
  name: string;
  description: string;
  path: string;
  dateCreated: string;
  codeRepository: string;
  demoUrl: string;
  license: string;
  keywords: string[];
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: input.name,
    description: input.description,
    url: `${siteMeta.url}${input.path}`,
    codeRepository: input.codeRepository || undefined,
    license: input.license || undefined,
    dateCreated: input.dateCreated,
    keywords: input.keywords.join(", "),
    image: `${siteMeta.url}${input.image}`,
    ...(input.demoUrl ? { sameAs: [input.demoUrl, input.codeRepository].filter(Boolean) } : {}),
    author: { "@type": "Person", name: site.author.name, url: `${siteMeta.url}/` },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteMeta.url}${item.path}`,
    })),
  };
}

/** 结构化数据以 JSON 形式输出到 script[type="application/ld+json"] */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify 的结果只包含数据，不会执行脚本
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
