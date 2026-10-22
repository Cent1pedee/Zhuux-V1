import Link from "next/link";
import type { Project } from "@/content/types";
import { PROJECT_KIND_LABEL } from "@/content/types";
import { ArrowRightIcon } from "./icons";

/**
 * 文章底部的「相关项目」卡片：缩略图 + 名称 + 一句话描述 + 技术标签。
 * 取代原先的纯文本行（项目：xxx —— 描述），与站内项目卡片保持同一视觉语言。
 */
export function RelatedProjects({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;
  return (
    <section aria-labelledby="related-projects-title" className="related-block">
      <div className="related-block-head">
        <h2 id="related-projects-title" className="text-base">
          相关项目
        </h2>
        <Link href="/projects/" className="related-block-more">
          全部项目
          <ArrowRightIcon width={14} height={14} aria-hidden="true" />
        </Link>
      </div>
      <ul className="related-project-list">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}/`} className="related-project">
              <span className="related-project-thumb">
                <img src={project.cover} alt={project.coverAlt} width={1000} height={400} loading="lazy" decoding="async" />
              </span>
              <span className="related-project-body">
                <span className="related-project-meta">
                  <time dateTime={project.date}>{project.date}</time>
                  <span aria-hidden="true">·</span>
                  <span>{project.kinds.map((kind) => PROJECT_KIND_LABEL[kind]).join(" / ")}</span>
                </span>
                <span className="related-project-title">{project.title}</span>
                <span className="related-project-summary">{project.summary}</span>
                <span className="related-project-tags">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="chip">
                      {tag}
                    </span>
                  ))}
                </span>
              </span>
              <span className="related-project-arrow" aria-hidden="true">
                <ArrowRightIcon width={16} height={16} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
