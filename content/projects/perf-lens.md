---
title: "perf-lens · 页面性能体检报告生成器"
slug: "perf-lens"
date: "2026-06-14"
status: "released"
priority: 2
kind: "open-source"
tags: ["TypeScript", "Node.js", "Playwright", "Next.js"]
summary: "一条命令跑完 Lighthouse 与真实用户指标，生成可对比、可归档的性能体检报告。"
cover: "/images/covers/perf-lens.svg"
coverAlt: "perf-lens 封面：性能指标对比条形图"
demoUrl: "https://example.com/perf-lens-demo"
repoUrl: "https://github.com/example/perf-lens"
license: "MIT"
techChoices:
  - "Playwright 驱动多设备采样，避免单一模拟器偏差。"
  - "报告为纯静态 HTML，可直接归档到 CI 产物。"
highlights:
  - label=累计采样页面 | value=1,800+ | source=仓库 README 统计 | measuredAt=2026-10-01
  - label=报告生成耗时 | value=≈ 45s / 10 页 | source=本地 M 系列芯片实测 | measuredAt=2026-06-14
relatedSkills: ["TypeScript", "Playwright", "Node.js"]
relatedArticles: ["lcp-from-4s-to-2s"]
---

## 背景

每次性能优化后，我们都需要告诉团队「到底快了多少」。人工截图、手工记录指标，既无法对比历史，也无法在 CI 中自动校验。

## 解决的问题

- 指标分散在多个工具中，难以横向对比。
- 优化前后缺少统一基线，结论依赖主观感受。
- 报告无法归档，回归问题发现得太晚。

## 技术选型

- **Playwright**：跨浏览器采样，支持移动端节流参数。
- **Node.js CLI**：与现有 CI 流水线零成本集成。

## 成果

- 在 3 个项目中接入 CI，性能回归在合并前即可被发现。
- 报告生成时间稳定在 1 分钟内。
