import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd, projectSoftwareJsonLd } from "@/lib/seo";
import { getAllArticles } from "@/content/articles";
import { getAllProjects, getProject } from "@/content/projects";
import { PROJECT_KIND_LABEL, PROJECT_STATUS_LABEL } from "@/content/types";
import { Markdown } from "@/components/Markdown";
import { ProjectActions } from "@/components/ProjectActions";
import { ProjectCard } from "@/components/ProjectCard";
import { SidebarRecommend } from "@/components/DetailAside";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AuthorCard } from "@/components/AuthorCard";
import { BackToTop } from "@/components/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PagerShell, PagerLink } from "@/components/PagerTransition";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return { title: "项目不存在" };
  return buildMetadata({
    title: project.title,
    description: project.summary,
    path: `/projects/${project.slug}/`,
    image: project.cover,
    tags: project.tags,
  });
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const articles = getAllArticles();
  const allProjects = getAllProjects();

  // 相关推荐：项目 ↔ 文章 ↔ 技能（内链结构，锚文本描述目标内容）
  const relatedArticles = articles.filter((article) => project.relatedArticles.includes(article.slug));
  const skillLinks = Array.from(new Set([...project.relatedSkills, ...project.tags]));
  const projectIndex = allProjects.findIndex((item) => item.slug === project.slug);
  const newerProject = projectIndex > 0 ? allProjects[projectIndex - 1] : undefined;
  const olderProject = projectIndex >= 0 && projectIndex < allProjects.length - 1 ? allProjects[projectIndex + 1] : undefined;

  const relatedProjects = allProjects.filter(
    (candidate) =>
      candidate.slug !== project.slug &&
      candidate.tags.some((tag) => project.relatedSkills.includes(tag) || project.tags.includes(tag)),
  );

  return (
    <>
      <JsonLd
        data={[
          projectSoftwareJsonLd({
            name: project.title,
            description: project.summary,
            path: `/projects/${project.slug}/`,
            dateCreated: project.date,
            codeRepository: project.repoUrl,
            demoUrl: project.demoUrl,
            license: project.license,
            keywords: project.tags,
            image: project.cover,
          }),
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "项目", path: "/projects/" },
            { name: project.title, path: `/projects/${project.slug}/` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: project.title,
            description: project.summary,
            datePublished: project.date,
            inLanguage: "zh-CN",
            url: `${base}/projects/${project.slug}/`,
            image: `${base}${project.cover}`,
            author: { "@type": "Person", name: site.author.name, url: `${base}/` },
          },
        ]}
      />

      <div className="page-shell">
        <Breadcrumbs
          items={[
            { label: "首页", href: "/" },
            { label: "项目", href: "/projects/" },
            { label: project.title },
          ]}
        />

        <div className="detail-grid">
          <PagerShell>
          <article className="card-surface glass-article" aria-labelledby="project-title">
            <div className="article-hero-cover reveal">
              <img src={project.cover} alt={project.coverAlt} width={1000} height={400} loading="eager" fetchPriority="high" decoding="async" />
            </div>

            <header>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">项目</span>
                {project.kinds.map((kind) => (
                  <span key={kind} className="chip">
                    {PROJECT_KIND_LABEL[kind]}
                  </span>
                ))}
                {project.status ? (
                  <span className="status-pill" data-tone={project.status === "archived" ? "warning" : "info"}>
                    {PROJECT_STATUS_LABEL[project.status]}
                  </span>
                ) : null}
                <time className="text-xs subtle" dateTime={project.date}>
                  {project.date}
                </time>
              </div>
              <h1 id="project-title" className="mt-3 text-[28px] leading-tight md:text-[38px]">
                {project.title}
              </h1>
              <p className="article-lead">{project.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2" aria-label="技术栈">
                {project.tags.map((tag) => (
                  <li key={tag}>
                    <Link href={`/projects/?tags=${encodeURIComponent(tag)}`} className="chip" aria-label={`按技术栈 ${tag} 筛选项目`}>
                      {tag}
                    </Link>
                  </li>
                ))}
              </ul>
            </header>

            {/* Demo 与源码入口：主次视觉区分，外部链接 rel="noopener noreferrer" */}
            <ProjectActions
              slug={project.slug}
              title={project.title}
              demoUrl={project.demoUrl}
              repoUrl={project.repoUrl}
              license={project.license}
            />

        {project.highlights.length > 0 ? (
          <section aria-labelledby="highlights-title" className="mt-10">
            <h2 id="highlights-title" className="text-lg">
              可核验的数据
            </h2>
            <ul className="metric-grid mt-3">
              {project.highlights.map((highlight) => (
                <li key={highlight.label} className="metric">
                  <p className="text-xs subtle">{highlight.label}</p>
                  <p className="metric-value mt-1">{highlight.value}</p>
                  <p className="mt-2 text-xs subtle">
                    来源：{highlight.source}
                    {highlight.measuredAt ? ` · 统计时间：${highlight.measuredAt}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="project-body-title" className="mt-10">
          <h2 id="project-body-title" className="text-lg">
            项目详情
          </h2>
          <div className="mt-3">
            <Markdown source={project.body} />
          </div>
        </section>

        {project.techChoices.length > 0 ? (
          <section aria-labelledby="tech-choices-title" className="mt-10">
            <h2 id="tech-choices-title" className="text-lg">
              技术选型说明
            </h2>
            <ul className="mt-3 grid gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
              {project.techChoices.map((choice) => (
                <li key={choice} className="flex gap-2">
                  <span aria-hidden="true" style={{ color: "var(--color-primary)" }}>
                    ▸
                  </span>
                  {choice}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section aria-labelledby="related-title" className="related-section">
          <h2 id="related-title" className="text-lg">
            相关内容
          </h2>
          {relatedArticles.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-sm font-semibold">写过的文章</h3>
              <ul className="mt-2 space-y-2 text-sm">
                {relatedArticles.map((article) => (
                  <li key={article.slug} className="flex flex-wrap items-center gap-2">
                    <Link href={`/articles/${article.slug}/`} className="inline-link">
                      文章：《{article.title}》
                    </Link>
                    <time dateTime={article.date} className="text-xs subtle">
                      {article.date}
                    </time>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4">
            <h3 className="text-sm font-semibold">这个项目用到的技术栈</h3>
            <p className="mt-1 text-xs subtle">点击标签可查看使用相同技术栈的其他项目。</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {skillLinks.map((skill) => (
                <li key={skill}>
                  <Link href={`/projects/?tags=${encodeURIComponent(skill)}`} className="chip" aria-label={`按技术栈 ${skill} 筛选项目`}>
                    {skill}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <nav aria-label="项目翻页" className="mt-8 flex flex-col gap-3 border-t pt-5 text-sm sm:flex-row sm:justify-between" style={{ borderColor: "var(--border-soft)" }}>
            {newerProject ? (
              <PagerLink href={`/projects/${newerProject.slug}/`} direction="prev">
                <span className="pager-arrow" data-dir="prev" aria-hidden="true">
                  ←
                </span>
                更新的项目：{newerProject.title}
              </PagerLink>
            ) : (
              <span />
            )}
            {olderProject ? (
              <PagerLink href={`/projects/${olderProject.slug}/`} direction="next" className="inline-link sm:text-right">
                更早的项目：{olderProject.title}
                <span className="pager-arrow" data-dir="next" aria-hidden="true">
                  →
                </span>
              </PagerLink>
            ) : null}
          </nav>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <a href="/projects/" className="btn-outline-primary btn-sm">
              ← 返回项目列表
            </a>
            <div className="flex items-center gap-4">
              <CopyLinkButton label="复制项目链接" />
              <BackToTop />
            </div>
          </div>
        </section>
          </article>
          </PagerShell>

          <div className="detail-aside sidebar-stack">
            <AuthorCard
              name={site.author.name}
              avatar={{ src: site.author.avatar.src, alt: site.author.avatar.alt }}
              bio={site.author.bio}
              emailHref={site.contact.emailHref}
              ctaLabel="交流这个项目"
            />

            {relatedProjects.length > 0 ? (
              <div className="card-surface sidebar-card">
                <p className="sidebar-title">相关项目</p>
                <SidebarRecommend
                  items={relatedProjects.slice(0, 4).map((related) => ({
                    href: `/projects/${related.slug}/`,
                    title: related.title,
                    date: related.date,
                  }))}
                />
              </div>
            ) : null}
          </div>
        </div>

        {relatedProjects.length > 0 ? (
          <section aria-labelledby="more-projects-title" className="mt-10">
            <h2 id="more-projects-title" className="text-xl">
              你可能也感兴趣的项目
            </h2>
            <div className="project-grid mt-4">
              {relatedProjects.slice(0, 2).map((related) => (
                <ProjectCard key={related.slug} project={related} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
