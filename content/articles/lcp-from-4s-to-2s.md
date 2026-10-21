---
title: "把首屏 LCP 从 4.2s 压到 1.9s 的六个决策"
slug: "lcp-from-4s-to-2s"
date: "2026-10-08"
draft: false
tags: ["性能优化", "LCP", "Next.js"]
summary: "记录一次真实的移动端首屏优化：从资源优先级、字体策略到渲染模式，每一步都附带了可复现的测量方式。"
cover: "/images/covers/perf-lens.svg"
coverAlt: "文章封面：LCP 优化前后对比图"
relatedProjects: ["lumen-ui", "perf-lens"]
---

## 结论先行

六周内移动端 LCP 从 4.2s 降到 1.9s，p75 数据来自真实的现场采集，而非实验室模拟。下面依次说明六个决策以及它们的代价。

## 1. 重排资源优先级

首屏最大的意外是背景图抢占了关键 CSS 的带宽。我们用 `fetchpriority` 与 `<link rel="preload">` 重新排序关键资源，**只预加载一帧内真正需要的资源**。

```html
<link rel="preload" href="/fonts/critical.woff2" as="font" type="font/woff2" crossorigin>
<img src="/hero.avif" fetchpriority="high" width="720" height="420" alt="">
```

## 2. 字体策略：系统栈优先

自定义 Web 字体带来了 FOUT 与额外的关键路径请求。我们回到系统字体栈，首屏文本立即呈现。

## 3. 图片格式与尺寸

AVIF 优先、WebP 回退，配合 `srcset` 与固定宽高比占位，CLS 从 0.14 降到 0.02。

## 4. 渲染模式

静态生成 + 边缘缓存，让 HTML 直接可命中缓存。详情见另一篇文章的复盘。

## 5. 第三方脚本

评论、统计全部改为「接近视口再加载」，首屏零第三方阻塞脚本。

## 6. 持续监控

没有监控的优化无法维持。我们把 LCP 加入 CI 性能预算，回归即失败。

## 代价与反思

- 预加载过多会导致带宽竞争，需要基于真实网络环境校准。
- 系统字体的排版一致性略差，但换来的是可预测的首屏体验。

> 所有数据均来自现场采集（p75），采集周期为优化前后各两周。
