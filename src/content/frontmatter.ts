import fs from "node:fs";
import path from "node:path";

/**
 * 极简 Front-matter 解析（零依赖，避免为了几行 YAML 引入额外包）。
 * 支持：`key: "value"`、`key: value`、`key: 123`、`key: true/false`、`key: null`、
 * 以及 `key:\n  - "item"` 形式的字符串数组。数组内的项目统一转成字符串。
 */
export type FrontMatterValue = string | number | boolean | null | string[];
export type FrontMatter = Record<string, FrontMatterValue>;

export interface ParsedMarkdown {
  data: FrontMatter;
  body: string;
}

function stripQuotes(raw: string): string {
  const value = raw.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseScalar(raw: string): FrontMatterValue {
  const value = stripQuotes(raw);
  if (value === "null" || value === "~" || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

/** 支持 `key: value`、`"key with space": value` */
function parseKeyValue(line: string): RegExpMatchArray | null {
  return line.match(/^(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+)):\s*(.*)$/);
}

/** 支持 `key: ["a", "b"]` 行内数组 */
function parseInlineList(raw: string): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (!inner) return [];
  return inner
    .split(",")
    .map((item) => stripQuotes(item))
    .filter((item) => item.length > 0);
}

export function parseMarkdown(source: string): ParsedMarkdown {
  const normalized = source.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { data: {}, body: normalized.trim() };
  }
  const end = normalized.indexOf("\n---", 3);
  if (end === -1) {
    throw new Error("front-matter 未闭合：缺少结束的 ---");
  }
  const header = normalized.slice(4, end);
  const body = normalized.slice(end + 4).replace(/^\n+/, "");

  const data: FrontMatter = {};
  let currentKey: string | null = null;
  for (const line of header.split("\n")) {
    if (line.startsWith("#")) continue; // 行首 # 为注释，可包含任意字符
    if (!line.trim()) continue;
    const listItem = line.match(/^\s+-\s+(.*)$/);
    if (listItem && currentKey) {
      const existing = data[currentKey];
      const item = stripQuotes(listItem[1]);
      data[currentKey] = Array.isArray(existing) ? [...existing, item] : [item];
      continue;
    }
    const kv = parseKeyValue(line);
    if (!kv) {
      throw new Error(`无法解析的 front-matter 行：${line}`);
    }
    currentKey = kv[1] ?? kv[2] ?? kv[3];
    const raw = kv[4] ?? "";
    if (raw.trim() === "") {
      data[currentKey] = [];
    } else if (raw.trim().startsWith("[") && raw.trim().endsWith("]")) {
      data[currentKey] = parseInlineList(raw);
    } else {
      data[currentKey] = parseScalar(raw);
    }
  }
  return { data, body: body.trim() };
}

export interface ContentFile extends ParsedMarkdown {
  /** 文件名（不含扩展名），可作为 slug 的默认值 */
  file: string;
}

export function readContentDir(dir: string): ContentFile[] {
  const abs = path.join(process.cwd(), dir);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ ...parseMarkdown(fs.readFileSync(path.join(abs, file), "utf8")), file: file.replace(/\.md$/, "") }));
}

export function stringField(data: FrontMatter, key: string, fallback = ""): string {
  const value = data[key];
  return typeof value === "string" ? value : fallback;
}

export function numberField(data: FrontMatter, key: string, fallback = 0): number {
  const value = data[key];
  return typeof value === "number" ? value : fallback;
}

export function booleanField(data: FrontMatter, key: string, fallback = false): boolean {
  const value = data[key];
  return typeof value === "boolean" ? value : fallback;
}

export function stringList(data: FrontMatter, key: string): string[] {
  const value = data[key];
  return Array.isArray(value) ? value : [];
}
