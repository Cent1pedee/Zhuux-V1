/**
 * 极简 Markdown 渲染器（零依赖）。
 * 仅支持内容文件中实际使用的语法：
 *   ## / ### 标题、段落、无序/有序列表、引用、代码块、行内代码、**加粗**、[链接](url)、空行分段。
 * 输出为 React 节点（非 dangerouslySetInnerHTML），因此内容中的 HTML 不会被执行为标签。
 */
import React from "react";

type Block =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; text: string }
  | { type: "code"; lang: string; code: string };

function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}

/** 行内语法：链接、行内代码、加粗 */
export function renderInline(text: string, keyPrefix = "i"): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // 纯文本片段也要有唯一 key，否则 React 会提示同 key（且可能复用错误的节点）
  const pushText = (value: string) => {
    if (value) nodes.push(<span key={`${keyPrefix}-t${index++}`}>{value}</span>);
  };
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) pushText(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${index++}`;
    if (token.startsWith("`")) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, label, href] = linkMatch;
        nodes.push(
          <a
            key={key}
            href={href}
            {...(isExternal(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {label}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) pushText(text.slice(lastIndex));
  return nodes;
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // 跳过结束围栏
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{2,3})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: "heading", level: heading[1].length as 2 | 3, text: heading[2] });
      i++;
      continue;
    }
    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quote.push(lines[i].slice(2));
        i++;
      }
      blocks.push({ type: "quote", text: quote.join("\n") });
      continue;
    }
    if (/^- /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const items: string[] = [];
      while (i < lines.length && (ordered ? /^\d+\. /.test(lines[i]) : /^- /.test(lines[i]))) {
        items.push(lines[i].replace(ordered ? /^\d+\.\s+/ : /^-\s+/, ""));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    // 段落：连续非空行合并
    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !lines[i].startsWith("```") &&
      !/^- /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
  }
  return blocks;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parseBlocks(source);
  return (
    <div className="prose-body">
      {blocks.map((block, index) => {
        const key = `b-${index}`;
        switch (block.type) {
          case "heading": {
            const Tag = block.level === 2 ? "h2" : "h3";
            return (
              <Tag key={key} id={slugifyHeading(block.text)}>
                {renderInline(block.text, key)}
              </Tag>
            );
          }
          case "paragraph":
            return <p key={key}>{renderInline(block.text, key)}</p>;
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag key={key}>
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote key={key}>
                <p>{renderInline(block.text, key)}</p>
              </blockquote>
            );
          case "code":
            return (
              <pre key={key} className="code-block" tabIndex={0} aria-label={`${block.lang || "代码"} 代码块，可横向滚动`}>
                <code>{block.code}</code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** 为标题生成锚点 id（用于页内跳转） */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** 提取标题用于生成正文目录（页内锚点） */
export function extractHeadings(markdown: string): { level: 2 | 3; text: string; id: string }[] {
  return parseBlocks(markdown)
    .filter((block): block is Extract<Block, { type: "heading" }> => block.type === "heading")
    .map((block) => ({ level: block.level, text: block.text, id: slugifyHeading(block.text) }));
}
