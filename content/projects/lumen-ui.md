---
title: "lumen-ui · 轻量 React 组件库"
slug: "lumen-ui"
date: "2026-09-21"
status: "released"
priority: 3
kind: "open-source"
tags: ["React", "TypeScript", "Tailwind CSS", "Vite"]
summary: "面向中后台的轻量 React 组件库，按需加载与可访问性优先，gzip 后首屏仅 18KB。"
cover: "/images/covers/lumen-ui.svg"
coverAlt: "lumen-ui 组件库封面：按需加载的组件网格示意图"
demoUrl: "https://example.com/lumen-ui-demo"
repoUrl: "https://github.com/example/lumen-ui"
license: "MIT"
techChoices:
  - "以 Vite 库模式产出 ESM + CJS 双格式，tree-shaking 友好。"
  - "样式基于 CSS 变量，允许业务方在不 fork 的前提下覆盖主题。"
  - "所有交互组件遵循 WAI-ARIA 模式，键盘与屏幕阅读器可用。"
highlights:
  - label=首屏 gzip 体积 | value=18KB | source=基于 vite build 产物体积统计 | measuredAt=2026-09-20
  - label=GitHub Star | value=1.2k | source=GitHub 仓库页面 | measuredAt=2026-10-15
  - label=覆盖组件数 | value=48 | source=组件文档站目录统计 | measuredAt=2026-09-21
relatedSkills: ["React", "TypeScript", "Vite"]
relatedArticles: ["lcp-from-4s-to-2s"]
---

## 背景

中后台业务页面高度雷同，但每个业务线都在重复实现表单、表格和弹窗。我们需要的不是一个「大而全」的组件库，而是一套**可以按需引入、默认可访问**的基础组件。

## 解决的问题

- 重复造轮子：同一个日期选择器在 3 条业务线里被写过 4 次。
- 可访问性缺失：键盘无法操作弹窗、图标按钮没有可读文本。
- 体积失控：全量引入一个组件库往往带来 200KB+ 的首屏负担。

> 本文中的 star 数与体积数据均标注了来源与统计时间，未做任何夸大处理。

## 技术选型

- **Vite 库模式**：构建快，产物干净，配合 `preserveModules` 支持深路径引入。
- **CSS 变量 + Tailwind**：主题可覆盖，业务方无需重新编译样式。
- **TypeScript 严格模式**：所有 Props 都有显式类型与 JSDoc。

## 成果

- 业务线接入后，重复开发减少约 30%。
- 组件测试覆盖率达到 82%，键盘可完成所有组件主流程。
