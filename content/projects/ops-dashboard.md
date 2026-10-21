---
title: "内部运营后台 · 数据看板重构"
slug: "ops-dashboard"
date: "2025-11-18"
status: "archived"
priority: 1
kind: "commercial"
tags: ["Vue", "TypeScript", "ECharts"]
summary: "商业项目中重构的运营数据看板，万级数据渲染从 2s 降至 120ms。"
cover: "/images/covers/ops-dashboard.svg"
coverAlt: "运营数据看板封面：虚拟列表与图表网格"
demoUrl: ""
repoUrl: ""
license: "闭源商业项目（代码归属公司，不对外开源）"
techChoices:
  - "虚拟列表 + 分片渲染，仅渲染视口附近的行。"
  - "图表按需懒加载，首屏只渲染关键两张图。"
highlights:
  - label=万级数据渲染 | value=2s → 120ms | source=内部性能测试报告 | measuredAt=2025-11-18
relatedSkills: ["Vue", "TypeScript"]
relatedArticles: ["ssg-vs-ssr-rethink"]
---

## 背景

运营同学每天需要在看板上核对大量订单数据，旧实现一次性渲染全部行，滚动时明显卡顿。

## 解决的问题

- 卡顿：虚拟列表让渲染量从「全部」降到「视口 + 缓冲」。
- 首屏慢：图表懒加载，关键指标优先渲染。
- 可维护性：拆分出可复用的数据表格组件。

## 技术选型

- **Vue 3 + TypeScript**：承接既有技术栈，迁移成本最低。
- **ECharts**：团队已有封装经验。

## 成果

- 万级数据渲染从 2s 降至 120ms。
- 该表格组件后续被 2 个其他后台复用。
