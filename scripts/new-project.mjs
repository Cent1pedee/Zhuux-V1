#!/usr/bin/env node
/**
 * 新建项目内容文件：npm run new:project -- my-project "我的项目" [类型]
 * 生成 content/projects/<slug>.md，按 front-matter 规范填写即可在 /projects 中展示。
 */
import fs from "node:fs";
import path from "node:path";

const [slug, title, kind = "open-source"] = process.argv.slice(2);
if (!slug || !title) {
  console.error("用法：npm run new:project -- <slug> \"<标题>\" [open-source|commercial|experiment]");
  process.exit(1);
}
if (!["open-source", "commercial", "experiment"].includes(kind)) {
  console.error("项目类型必须是 open-source / commercial / experiment");
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "projects", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`文件已存在：${file}`);
  process.exit(1);
}

const cover = `/images/covers/${slug}.svg`;
if (!fs.existsSync(path.join(process.cwd(), "public", cover))) {
  console.warn(`提示：封面图 ${cover} 不存在，请补充一张 1000×400 的图片（建议同时导出 .avif / .webp）。`);
}

const today = new Date().toISOString().slice(0, 10);
const content = `---
title: "${title}"
slug: "${slug}"
date: "${today}"
status: "released"
priority: 1
kind: "${kind}"
tags: ["TypeScript"]
summary: "一句话说明这个项目解决了什么问题。"
cover: "${cover}"
coverAlt: "项目封面图说明"
demoUrl: ""
repoUrl: ""
license: "MIT"
techChoices:
  - "说明选择某个技术方案的原因。"
highlights:
  - label=指标名称 | value=指标值 | source=数据来源 | measuredAt=${today}
relatedSkills: ["TypeScript"]
relatedArticles: []
---

## 背景

写下项目产生的背景（约 2 段）。

## 解决的问题

- 问题一
- 问题二

## 技术选型

## 成果
`;

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, content);
console.log(`已创建 ${path.relative(process.cwd(), file)}`);
