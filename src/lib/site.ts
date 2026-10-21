import fs from "node:fs";
import path from "node:path";

export type ThemeMode = "light" | "dark" | "system";

export interface SocialLink {
  kind: "github" | "juejin" | "zhihu" | "x" | "linkedin" | "email" | "telegram" | "wechat";
  label: string;
  href: string;
  event: string;
}

export interface ThirdPartyService {
  name: string;
  purpose: string;
  data: string;
  loading: string;
  consentRequired: boolean;
}

export interface SiteConfig {
  url: string;
  title: string;
  description: string;
  defaultTheme: ThemeMode;
  author: {
    name: string;
    jobTitle: string;
    directionTags: string[];
    tagline: string;
    typewriterText: string;
    bio: string;
    avatar: { src: string; width: number; height: number; alt: string };
  };
  location: {
    city: string;
    timezone: string;
    contactWindow: string;
    hideExactAddress: boolean;
    exactAddress: string;
  };
  contact: {
    email: string;
    emailCopyLabel: string;
    emailHref: string;
  };
  socials: SocialLink[];
  /** 统计脚本地址（留空则只在本地 sessionStorage 记录事件，不上报） */
  analytics: { endpoint: string; enabled: boolean };
  /** Giscus 配置（空字符串表示未配置，评论区显示配置提示而非空白） */
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    themeLight: string;
    themeDark: string;
  };
  rss: {
    title: string;
    description: string;
  };
  thirdPartyServices: ThirdPartyService[];
}

const CONFIG_PATH = path.join(process.cwd(), "site.config.json");

let cached: SiteConfig | null = null;

/** 单一数据源：site.config.json，扫描时读取一次并在进程内缓存 */
export function getSiteConfig(): SiteConfig {
  if (cached) return cached;
  const raw = fs.readFileSync(CONFIG_PATH, "utf8");
  const parsed = JSON.parse(raw) as SiteConfig;
  if (!parsed.url.startsWith("http")) {
    throw new Error("site.config.json 中的 url 必须是完整 URL（用于 canonical / sitemap / RSS）");
  }
  cached = parsed;
  return parsed;
}

export function absoluteUrl(pathname: string): string {
  const base = getSiteConfig().url.replace(/\/$/, "");
  if (!pathname || pathname === "/") return `${base}/`;
  return `${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}
