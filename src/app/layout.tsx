import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { getSiteConfig } from "@/lib/site";
import { siteMeta } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteBoot } from "@/components/SiteBoot";
import { PageTransition } from "@/components/PageTransition";
import { ThemeProvider } from "@/components/theme";
import { THEME_INIT_SCRIPT } from "@/components/theme-script";
import { SiteBackdrop } from "@/components/SiteBackdrop";
import { ScrollTop } from "@/components/ScrollTop";
import { getSearchIndex } from "@/lib/search-index";
import { getAppearance } from "@/lib/appearance";
import "./globals.css";

const site = getSiteConfig();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#060a12" },
  ],
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.author.name}`,
  },
  description: site.description,
  applicationName: site.title,
  authors: [{ name: site.author.name, url: `${siteMeta.url}/` }],
  creator: site.author.name,
  keywords: [site.author.name, site.author.jobTitle, ...site.author.directionTags],
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": [{ url: "/rss.xml", title: site.rss.title }] },
  },
  openGraph: {
    type: "profile",
    locale: "zh_CN",
    siteName: site.title,
    title: site.title,
    description: site.description,
    url: "/",
    images: [{ url: "/og/default.svg", width: 1200, height: 630, alt: `${site.author.name} · ${site.author.jobTitle}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
    images: ["/og/default.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22%3E%3Cpath fill=%22%23000000%22 d=%22M13 2 4 14h6l-1 8 9-12h-6l1-8Z%22/%3E%3C/svg%3E",
        type: "image/svg+xml",
      },
    ],
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-theme={site.defaultTheme === "dark" ? "dark" : "light"} suppressHydrationWarning>
      <head>
        {/* 首帧前确定主题，避免闪烁；脚本极小且同步执行 */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="alternate" type="application/rss+xml" title={site.rss.title} href="/rss.xml" />
      </head>
      <body>
        <ThemeProvider defaultTheme={site.defaultTheme}>
          <SiteBackdrop wallpaper={getAppearance().backdrop.wallpaper} />
          <a href="#main-content" className="skip-link">
            跳到主要内容
          </a>
          <SiteBoot endpoint={site.analytics.endpoint} />
          <SiteHeader name={site.author.name} searchEntries={getSearchIndex()} />
          <main id="main-content" tabIndex={-1}>
            <PageTransition>{children}</PageTransition>
          </main>
          <ScrollTop />
          <SiteFooter
            email={site.contact.email}
            emailHref={site.contact.emailHref}
            name={site.author.name}
            year={new Date().getFullYear()}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
