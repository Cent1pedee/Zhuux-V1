import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { getAllProjectTags, getAllProjects } from "@/content/projects";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { PROJECT_KIND_LABEL } from "@/content/types";

export const metadata: Metadata = buildMetadata({
  title: "项目",
  description: "开源项目、商业项目与实验项目：每个项目包含背景、技术选型、成果与可核验的数据来源。",
  path: "/projects/",
});

/**
 * 项目列表。
 * 静态导出（output: "export"）不支持在服务端读取 searchParams，
 * 因此筛选状态完全由客户端从 URL 读取（useSearchParams），
 * 页面本身输出默认顺序的完整列表 —— 无 JS 时仍可浏览全部项目。
 */
export default function ProjectsPage() {
  const site = getSiteConfig();
  const base = site.url.replace(/\/$/, "");
  const projects = getAllProjects();
  const allTags = getAllProjectTags();
  const featured = projects[0];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "首页", path: "/" },
            { name: "项目", path: "/projects/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "项目",
            url: `${base}/projects/`,
            inLanguage: "zh-CN",
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: projects.length,
              itemListElement: projects.map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: project.title,
                url: `${base}/projects/${project.slug}/`,
              })),
            },
          },
        ]}
      />
      <div className="page-shell">
        <CatalogHeader
          kicker="PROJECTS · 项目"
          title="项目"
          description={`共 ${projects.length} 个项目：开源可查源码，商业项目因授权不公开代码，未部署 Demo 的会在详情页说明。`}
          actions={<CopyLinkButton label="复制本页链接" />}
        >
          <span className="chip">更新于 {projects[0]?.date ?? "—"}</span>
        </CatalogHeader>

        {featured ? (
          <a href={`/projects/${featured.slug}/`} className="card-surface featured-project" data-interactive="true">
            <div className="featured-project-cover">
              <img src={featured.cover} alt={featured.coverAlt} width={1000} height={400} loading="eager" decoding="async" />
            </div>
            <div className="featured-project-body">
              <span className="status-pill" data-tone="info" style={{ alignSelf: "flex-start" }}>
                精选项目
              </span>
              <h2 className="text-2xl leading-tight">{featured.title}</h2>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {featured.summary}
              </p>
              <ul className="flex flex-wrap gap-2" aria-label="技术栈">
                {featured.tags.map((tag) => (
                  <li key={tag} className="chip">
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="flex flex-wrap items-center gap-3 text-xs subtle">
                <time dateTime={featured.date}>{featured.date}</time>
                <span>{featured.kinds.map((kind) => PROJECT_KIND_LABEL[kind]).join(" / ")}</span>
              </p>
            </div>
          </a>
        ) : null}

        <ProjectsExplorer projects={projects} allTags={allTags} />
      </div>
    </>
  );
}
