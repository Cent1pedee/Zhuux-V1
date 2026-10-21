/** 项目数据类型与常量：与文件读取逻辑分离，客户端组件可以安全引入 */

export type ProjectKind = "open-source" | "commercial" | "experiment";

export const PROJECT_KIND_LABEL: Record<ProjectKind, string> = {
  "open-source": "开源",
  commercial: "商业",
  experiment: "实验",
};

/** PRD：按项目类型（开源/商业/实验）筛选 */
export const PROJECT_KINDS: ProjectKind[] = ["open-source", "commercial", "experiment"];

export type ProjectStatus = "released" | "maintained" | "archived";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  released: "新发布",
  maintained: "维护中",
  archived: "已归档",
};

export interface ProjectHighlight {
  label: string;
  value: string;
  /** 数据来源（P2 验收要点：标注来源与统计时间） */
  source: string;
  /** 统计时间 */
  measuredAt: string;
}

export interface Project {
  slug: string;
  title: string;
  /** 一句话描述 */
  summary: string;
  /** 时间，用于排序 */
  date: string;
  /** 重要性，用于排序 */
  priority: number;
  /** 项目类型（开源 / 商业 / 实验），可多值 */
  kinds: ProjectKind[];
  /** 技术栈标签 */
  tags: string[];
  cover: string;
  coverAlt: string;
  /** 空字符串表示没有在线 Demo */
  demoUrl: string;
  /** 空字符串表示没有公开源码 */
  repoUrl: string;
  license: string;
  status?: ProjectStatus;
  techChoices: string[];
  highlights: ProjectHighlight[];
  relatedSkills: string[];
  relatedArticles: string[];
  body: string;
}

export interface Article {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  summary: string;
  cover: string;
  coverAlt: string;
  relatedProjects: string[];
  body: string;
}

/** 工作 / 教育经历（数据来自 src/data/experience.json） */
export interface ExperienceItem {
  type: "work" | "education";
  org: string;
  role: string;
  start: string;
  end: string | null;
  summary: string;
  achievements: string[];
}
