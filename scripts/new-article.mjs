#!/usr/bin/env node
/**
 * 新建文章：npm run new:article -- my-article "文章标题"
 * 生成 content/articles/<slug>.md；RSS、站点地图、文章列表会在下次构建时自动包含。
 */
import fs from "node:fs";
import path from "node:path";

const [slug, title] = process.argv.slice(2);
if (!slug || !title) {
  console.error("用法：npm run new:article -- <slug> \"<标题>\"");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "articles", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`文件已存在：${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const content = `---
title: "${title}"
slug: "${slug}"
date: "${today}"
draft: true
tags: ["前端"]
summary: "用一两句话概括文章内容，会展示在列表与搜索结果中。"
cover: "/images/covers/a11y-audit.svg"
coverAlt: "文章封面说明"
relatedProjects: []
---

## 小节标题

正文内容。支持 **加粗**、\`行内代码\`、[链接](https://example.com)、列表与代码块。

\`\`\`ts
const hello = "world";
\`\`\`

> 文章草稿（draft: true）不会出现在列表、RSS 与站点地图中，发布前改为 false 即可。
`;

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, content);
console.log(`已创建 ${path.relative(process.cwd(), file)}（draft: true，发布前请改为 false）`);
