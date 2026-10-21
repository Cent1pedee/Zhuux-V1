import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { JsonLd, buildMetadata, personJsonLd, websiteJsonLd } from "@/lib/seo";
import { getAllArticles } from "@/content/articles";
import { chatterExcerpt, getAllChatters } from "@/content/chatters";
import { getAllProjects } from "@/content/projects";
import { formatDate } from "@/lib/format";
import { ProfileCard, StatusBar } from "@/components/BentoParts";
import { CoverCarousel, type Slide } from "@/components/CoverCarousel";
import { ThemeSceneCard } from "@/components/theme";
import { AboutPanel, ExperiencePanel, LatestFeed } from "@/components/HomePanels";
import latestData from "@/data/latest.json";

const site = getSiteConfig();
const latestStatus = (latestData as unknown as { latestStatus: { text: string; updatedAt: string } }).latestStatus;

export const metadata: Metadata = buildMetadata({
  title: site.title,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const articles = getAllArticles();
  const projects = getAllProjects();
  const chatters = getAllChatters();

  const articleSlides: Slide[] = articles.slice(0, 5).map((article) => ({
    href: `/articles/${article.slug}/`,
    title: article.title,
    description: article.summary,
    cover: article.cover,
    date: article.date,
    badge: "Latest · 文章",
    tags: article.tags,
  }));

  const projectSlides: Slide[] = projects.slice(0, 5).map((project) => ({
    href: `/projects/${project.slug}/`,
    title: project.title,
    description: project.summary,
    cover: project.cover,
    date: project.date,
    badge: "Latest · 项目",
    tags: project.tags,
  }));

  const chatterSlides: Slide[] = chatters.slice(0, 5).map((chatter) => ({
    href: `/chatters/${chatter.slug}/`,
    title: chatter.title,
    description: chatterExcerpt(chatter, 80),
    cover: "/images/covers/chatter.svg",
    date: chatter.date,
    badge: "Latest · 杂谈",
    tags: chatter.tags,
  }));

  const latests = [
    ...articles.map((article) => ({ href: `/articles/${article.slug}/`, title: article.title, date: article.date, type: "article" as const })),
    ...chatters.map((chatter) => ({ href: `/chatters/${chatter.slug}/`, title: chatter.title, date: chatter.date, type: "chatter" as const })),
    ...projects.map((project) => ({ href: `/projects/${project.slug}/`, title: project.title, date: project.date, type: "project" as const })),
  ]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  return (
    <>
      <JsonLd data={personJsonLd()} />
      <JsonLd data={websiteJsonLd()} />

      <div className="page-shell">
        <div className="stagger flex flex-col gap-4">
            <div className="bento">
                {/* 第一行：资料卡 + 日/夜场景卡 */}
                <div className="md-span-7 bento-row">
                  <ProfileCard
                    name={site.author.name}
                    jobTitle={site.author.jobTitle}
                    avatar={{ src: site.author.avatar.src, alt: site.author.avatar.alt, width: site.author.avatar.width, height: site.author.avatar.height }}
                    tagline={site.author.tagline}
                    bio={site.author.bio}
                    stats={{ articles: articles.length, projects: projects.length, chatters: chatters.length }}
                    city={site.location.city}
                    timezone={site.location.timezone}
                    socials={site.socials}
                    emailHref={site.contact.emailHref}
                    email={site.contact.email}
                  />
                </div>
                <div className="md-span-5 bento-row">
                  <ThemeSceneCard />
                </div>

                {/* 第二行：最新文章轮播 + 最新项目 / 最新杂谈轮播 */}
                <div className="md-span-5 bento-row">
                  {articleSlides.length > 0 ? (
                    <CoverCarousel slides={articleSlides} readLabel="阅读文章" autoPlayMs={6500} ariaLabel="最新文章" />
                  ) : (
                    <div className="card-surface panel text-sm muted">还没有发布文章。</div>
                  )}
                </div>
                <div className="md-span-7 bento-row">
                  {projectSlides.length > 0 ? (
                    <CoverCarousel slides={projectSlides} readLabel="查看项目" autoPlayMs={7500} ariaLabel="最新项目" />
                  ) : null}
                  {chatterSlides.length > 0 ? (
                    <CoverCarousel slides={chatterSlides} readLabel="查看杂谈" autoPlayMs={8500} ariaLabel="最新杂谈" />
                  ) : null}
                </div>

                {/* 第三行：最近动态 + 关于 */}
                <div className="md-span-8 bento-row">
                  <div className="card-surface panel">
                    <LatestFeed items={latests} updatedAt={formatDate(latests[0]?.date ?? "—")} />
                  </div>
                </div>
                <div className="md-span-4 bento-row">
                  <div className="card-surface panel">
                    <AboutPanel
                      jobTitle={site.author.jobTitle}
                      directionTags={site.author.directionTags}
                      contactWindow={site.location.contactWindow}
                      latestStatus={latestStatus}
                      emailHref={site.contact.emailHref}
                      email={site.contact.email}
                      githubUrl={site.socials.find((social) => social.kind === "github")?.href}
                    />
                  </div>
                </div>

                {/* 第四行：经历与技能（占据整行，避免与导航重复的分类入口） */}
                <div className="md-span-12 bento-row">
                  <div className="card-surface panel">
                    <ExperiencePanel projects={projects.map((project) => ({ tags: project.tags }))} />
                  </div>
                </div>

                {/* 第五行：状态条 */}
                <div className="md-span-12 bento-row">
                  <StatusBar badges={["Next.js 15", "React 19", "Tailwind CSS 4", "daisyUI 5", "TypeScript"]} />
                </div>
            </div>
        </div>
      </div>
    </>
  );
}
