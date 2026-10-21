---
title: "gradient-cursor · 渐变光标与粒子背景"
slug: "gradient-cursor"
date: "2026-03-02"
status: "maintained"
priority: 1
kind: "experiment"
tags: ["TypeScript", "Canvas", "CSS"]
summary: "一个小于 2KB 的 Canvas 粒子网格 + 渐变光标组件，尊重 prefers-reduced-motion。"
cover: "/images/covers/gradient-cursor.svg"
coverAlt: "gradient-cursor 封面：渐变光斑与粒子网格"
demoUrl: "https://example.com/gradient-cursor-demo"
repoUrl: "https://github.com/example/gradient-cursor"
license: "MIT"
techChoices:
  - "粒子数量上限 50，页面切到后台时 requestAnimationFrame 自动暂停。"
  - "低端设备检测后只保留静态渐变背景。"
highlights:
  - label=gzip 体积 | value=1.8KB | source=bundle 分析 | measuredAt=2026-03-02
relatedSkills: ["TypeScript", "Canvas"]
relatedArticles: []
---

## 背景

首屏希望有点「技术感」，但绝大多数粒子背景都会拖慢 LCP，或者在低端机上掉帧。

## 解决的问题

- 动效与性能冲突：通过粒子数量上限与后台暂停解决。
- 可访问性：检测 `prefers-reduced-motion` 后直接显示静态渐变。
- 体积：无任何运行时依赖。

## 技术选型

- **Canvas 2D**：相比 WebGL 兼容性更好，2KB 以内即可实现。
- **CSS 渐变**：作为降级态，不依赖 JS 渲染。

## 成果

- 在首页实测 LCP 未受到明显影响（小于 100ms 增量）。
