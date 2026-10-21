#!/usr/bin/env node
/**
 * 新建杂谈：pnpm new:chatter -- my-note "今天的小发现"
 * 生成 content/chatters/<slug>.md；draft: true 时不会出现在列表、首页与站点地图中。
 */
import fs from "node:fs";
import path from "node:path";

const [slug, title] = process.argv.slice(2);
if (!slug || !title) {
  console.error('用法：pnpm new:chatter -- <slug> "<标题>"');
  process.exit(1);
}

const file = path.join(process.cwd(), "content", "chatters", `${slug}.md`);
if (fs.existsSync(file)) {
  console.error(`文件已存在：${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const content = `---
title: "${title}"
slug: "${slug}"
date: "${today}"
mood: "随手记"
tags: ["随笔"]
draft: true
---

今天想记下的一件小事。

- 第一点
- 第二点
`;

fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(file, content);
console.log(`已创建 ${path.relative(process.cwd(), file)}（draft: true，发布前请改为 false）`);
