import { readContentDir, type FrontMatter, stringField, numberField, stringList } from "./frontmatter";
import {
  PROJECT_KINDS,
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectHighlight,
  type ProjectKind,
  type ProjectStatus,
} from "./types";

export {
  PROJECT_KIND_LABEL,
  PROJECT_KINDS,
  PROJECT_STATUS_LABEL,
  type Project,
  type ProjectHighlight,
  type ProjectKind,
  type ProjectStatus,
} from "./types";

function parseKindList(data: FrontMatter): ProjectKind[] {
  const kinds = stringList(data, "kinds").filter((kind): kind is ProjectKind =>
    (PROJECT_KINDS as string[]).includes(kind),
  );
  if (kinds.length > 0) return kinds;
  const single = stringField(data, "kind");
  return (PROJECT_KINDS as string[]).includes(single) ? [single as ProjectKind] : [];
}

/**
 * highlights 使用「一行式记录」写法（本项目的极简解析器不支持嵌套 YAML）：
 *
 *   highlights:
 *     - label=首屏 gzip 体积 | value=18KB | source=vite build 产物体积统计 | measuredAt=2026-09-20
 *     - label=GitHub Star | value=1.2k | source=GitHub 仓库页面 | measuredAt=2026-10-15
 *
 * 字段之间用 ` | `（竖线加空格）分隔；字段值内部不要出现该分隔符，也不要包含引号。
 */
function parseHighlights(data: FrontMatter): ProjectHighlight[] {
  const raw = data.highlights;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      const fields: Record<string, string> = {};
      for (const chunk of entry.split(" | ")) {
        const eq = chunk.indexOf("=");
        if (eq === -1) continue;
        fields[chunk.slice(0, eq).trim()] = chunk.slice(eq + 1).trim();
      }
      return {
        label: fields.label ?? "",
        value: fields.value ?? "",
        source: fields.source ?? "",
        measuredAt: fields.measuredAt ?? "",
      };
    })
    .filter((highlight) => highlight.label || highlight.value);
}

function toProject(data: FrontMatter, body: string): Project {
  const slug = stringField(data, "slug");
  if (!slug) throw new Error("项目缺少 slug 字段");
  const statusRaw = stringField(data, "status");
  return {
    slug,
    title: stringField(data, "title", slug),
    summary: stringField(data, "summary"),
    date: stringField(data, "date"),
    priority: numberField(data, "priority", 0),
    kinds: parseKindList(data),
    tags: stringList(data, "tags"),
    cover: stringField(data, "cover"),
    coverAlt: stringField(data, "coverAlt"),
    demoUrl: stringField(data, "demoUrl"),
    repoUrl: stringField(data, "repoUrl"),
    license: stringField(data, "license"),
    status: (Object.keys(PROJECT_STATUS_LABEL) as ProjectStatus[]).includes(statusRaw as ProjectStatus)
      ? (statusRaw as ProjectStatus)
      : undefined,
    techChoices: stringList(data, "techChoices"),
    highlights: parseHighlights(data),
    relatedSkills: stringList(data, "relatedSkills"),
    relatedArticles: stringList(data, "relatedArticles"),
    body,
  };
}

let cache: Project[] | null = null;

/** 默认顺序：时间倒序；同一天按 priority 倒序 */
export function getAllProjects(): Project[] {
  if (cache) return cache;
  const projects = readContentDir("content/projects").map(({ data, body }) => toProject(data, body));
  projects.sort((a, b) => {
    if (a.date === b.date) return b.priority - a.priority;
    return a.date < b.date ? 1 : -1;
  });
  cache = projects;
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return getAllProjects().find((project) => project.slug === slug);
}

export function getAllProjectTags(): string[] {
  const set = new Set<string>();
  getAllProjects().forEach((project) => project.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "zh-CN"));
}
