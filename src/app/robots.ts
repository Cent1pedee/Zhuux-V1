import type { MetadataRoute } from "next";
import { getSiteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteConfig().url.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/settings/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
