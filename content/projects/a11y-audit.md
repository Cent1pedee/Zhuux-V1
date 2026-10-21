---
title: "a11y-audit · 可访问性基线扫描"
slug: "a11y-audit"
date: "2025-05-09"
status: "maintained"
priority: 2
kind: "open-source"
tags: ["Node.js", "Playwright", "axe-core"]
summary: "在 CI 中自动拦截 a11y 严重级别违规，覆盖 12 条核心页面路径。"
cover: "/images/covers/a11y-audit.svg"
coverAlt: "可访问性扫描封面：焦点轮廓与对比度检查"
demoUrl: ""
repoUrl: "https://github.com/example/a11y-audit"
license: "Apache-2.0"
techChoices:
  - "复用 axe-core 规则集，只拦截 critical / serious 级别。"
  - "结果与 PR 评论联动，失败即阻断合并。"
highlights:
  - label=拦截违规数 | value=37 | source=仓库 Issue 记录 | measuredAt=2026-08-01
relatedSkills: ["Node.js", "Playwright", "GitHub Actions"]
relatedArticles: ["ssg-vs-ssr-rethink"]
---

## 背景

团队上线流程中没有可访问性检查，问题往往等到用户反馈才被发现。

## 解决的问题

- 缺少自动化检测：把 axe-core 接入 CI。
- 结果不可读：生成按页面分组的可读报告。

## 技术选型

- **Playwright**：直接扫描真实渲染结果。
- **axe-core**：成熟、规则透明。

## 成果

- 12 条核心路径全部纳入扫描，上线前无严重违规。

> 本项目尚未部署在线 Demo，详情页的 Demo 按钮会给出明确提示，而不是指向无效链接。
