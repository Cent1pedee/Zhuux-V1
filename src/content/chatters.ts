import { readContentDir, stringField, booleanField, stringList, type FrontMatter } from "./frontmatter";

/**
 * 杂谈（短篇记录）：content/chatters/*.md
 * 与文章区分：不需要封面、篇幅短，适合日常碎片、灵感与状态记录。
 */
export interface Chatter {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  /** 可选心情/场景标签，显示为一个小圆点 + 文案 */
  mood: string;
  /** 正文（Markdown），列表中截取纯文本作为摘要 */
  body: string;
}

/** 去掉 Markdown 标记，得到用于摘要的纯文本 */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#{1,6}\s+.*$/gm, " ")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^---$/gm, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function toChatter(file: string, body: string, data: FrontMatter): Chatter {
  return {
    slug: stringField(data, "slug", file),
    title: stringField(data, "title", "碎片记录"),
    date: stringField(data, "date"),
    tags: stringList(data, "tags"),
    mood: stringField(data, "mood"),
    body,
  };
}

let cache: Chatter[] | null = null;

/** 已发布杂谈，按时间倒序（draft: true 不展示） */
export function getAllChatters(): Chatter[] {
  if (cache) return cache;
  const items = readContentDir("content/chatters")
    .filter(({ data }) => !booleanField(data, "draft"))
    .map(({ data, body, file }) => toChatter(file, body, data))
    .filter((chatter) => chatter.slug);
  items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  cache = items;
  return items;
}

export function getChatter(slug: string): Chatter | undefined {
  return getAllChatters().find((chatter) => chatter.slug === slug);
}

/** 摘要：去掉 Markdown，并裁掉与标题重复的开头，避免卡片里出现两遍标题 */
export function chatterExcerpt(chatter: Chatter, max = 160): string {
  let text = toPlainText(chatter.body);
  if (chatter.title) {
    const title = toPlainText(chatter.title);
    if (text.startsWith(title)) {
      text = text.slice(title.length).replace(/^[\s,，。.、;；:：!！?？—–-]+/, "");
    }
  }
  if (text.length > max) return `${text.slice(0, max).trim()}…`;
  return text;
}
