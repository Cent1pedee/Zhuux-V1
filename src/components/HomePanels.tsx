import Link from "next/link";
import { ArrowRightIcon, ClockIcon, GitHubIcon, MailIcon, RssIcon } from "./icons";
import type { ExperienceItem } from "@/content/types";
import experienceData from "@/data/experience.json";
import { Skills } from "./Skills";
import { PanelHeading } from "./PanelHeading";
import { formatDate } from "@/lib/format";

/* ==========================================================================
   最近动态：文章 / 项目 / 杂谈混排，按时间倒序
   ========================================================================== */
const TYPE_LABEL = { article: "文章", project: "项目", chatter: "杂谈" } as const;

export function LatestFeed({
  items,
  updatedAt,
}: {
  items: { href: string; title: string; date: string; type: keyof typeof TYPE_LABEL }[];
  updatedAt: string;
}) {
  return (
    <div className="flex h-full flex-col">
      <PanelHeading
        kicker="LATEST"
        title="最近动态"
        action={
          <Link href="/articles/" className="btn-outline-primary btn-sm" aria-label="查看全部文章">
            全部文章
          </Link>
        }
      />
      <ol className="mt-3 flex-1">
        {items.map((item) => (
          <li key={item.href} className="latest-row">
            <Link href={item.href} className="flex min-h-11 items-center justify-between gap-4 py-3">
              <span className="flex min-w-0 items-center gap-3">
                <span className="chip shrink-0">{TYPE_LABEL[item.type]}</span>
                <span className="latest-title text-sm">{item.title}</span>
              </span>
              <span className="flex shrink-0 items-center gap-2 text-xs subtle">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                <ArrowRightIcon width={14} height={14} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs subtle">最近更新于 {updatedAt} · 数据来自 content/ 目录</p>
    </div>
  );
}

/* ==========================================================================
   关于：当前状态 + 关注方向 + 联系方式（不重复资料卡里的所在地）
   ========================================================================== */
export function AboutPanel({
  jobTitle,
  directionTags,
  contactWindow,
  latestStatus,
  emailHref,
  email,
  githubUrl,
}: {
  jobTitle: string;
  directionTags: string[];
  contactWindow: string;
  latestStatus: { text: string; updatedAt: string };
  emailHref: string;
  email: string;
  githubUrl?: string;
}) {
  return (
    <div className="now-panel">
      <PanelHeading
        kicker="NOW"
        title="此刻"
        action={
          <time className="now-updated" dateTime={latestStatus.updatedAt}>
            {latestStatus.updatedAt}
          </time>
        }
      />

      <div className="now-status">
        <span aria-hidden="true" className="now-status-dot" />
        <p className="now-status-text">{latestStatus.text}</p>
      </div>

      <dl className="now-facts">
        <div>
          <dt>方向</dt>
          <dd>
            <ul className="now-tags" aria-label="技术方向">
              {directionTags.map((tag) => (
                <li key={tag} className="chip">
                  {tag}
                </li>
              ))}
            </ul>
            <span className="now-role">{jobTitle}</span>
          </dd>
        </div>
        <div>
          <dt>可联系</dt>
          <dd className="now-contact">
            <ClockIcon width={14} height={14} />
            <span>{contactWindow}</span>
          </dd>
        </div>
      </dl>

      <div className="now-links">
        <a href={emailHref} className="now-link" aria-label={`发邮件至 ${email}`}>
          <MailIcon width={15} height={15} aria-hidden="true" />
          邮箱
        </a>
        {githubUrl ? (
          <a href={githubUrl} className="now-link" target="_blank" rel="me noopener noreferrer" aria-label="GitHub（在新标签页打开）">
            <GitHubIcon width={15} height={15} aria-hidden="true" />
            GitHub
          </a>
        ) : null}
        <a href="/rss.xml" className="now-link">
          <RssIcon width={15} height={15} aria-hidden="true" />
          RSS
        </a>
      </div>

      <a href={emailHref} className="btn-primary-solid btn-sm now-cta">
        给我发邮件<span className="visually-hidden">（{email}）</span>
      </a>
    </div>
  );
}

/* ==========================================================================
   经历与技能
   ========================================================================== */
export function ExperiencePanel({ projects }: { projects: { tags: string[] }[] }) {
  const items = (experienceData as { experience: ExperienceItem[] }).experience.slice(0, 3);
  return (
    <div>
      <PanelHeading kicker="JOURNEY" title="经历与技术栈" />
      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
        <ol className="xp-timeline" aria-label="工作与教育经历（按时间倒序）">
          {items.map((item) => (
            <li key={`${item.org}-${item.start}`} className="xp-timeline-item is-lit">
              <span className="xp-timeline-node" aria-hidden="true" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3>
                  {item.role}
                  <span className="muted text-base font-normal"> @ {item.org}</span>
                </h3>
                <p className="font-mono text-xs subtle">
                  {item.start.replace("-", ".")} — {item.end ? item.end.replace("-", ".") : "至今"}
                </p>
              </div>
              <ul className="xp-achievements">
                {item.achievements.slice(0, 2).map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <Skills projects={projects} />
      </div>
    </div>
  );
}
