---
title: "可访问性不是附加项：组件库的 4 个硬性约束"
slug: "a11y-as-baseline"
date: "2026-07-12"
draft: false
tags: ["可访问性", "设计系统"]
summary: "从焦点管理、语义标签、对比度到减少动态效果，组件库应该把可访问性写成不可绕过的约束。"
cover: "/images/covers/a11y-audit.svg"
coverAlt: "文章封面：键盘焦点与对比度示意"
relatedProjects: ["lumen-ui", "a11y-audit"]
---

## 1. 焦点必须可见

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

任何 `outline: none` 都必须有等价的替代样式。

## 2. 组件有正确的语义

弹窗用 `role="dialog"` + `aria-modal`，按钮不是可点击的 `<div>`。

## 3. 对比度用工具校验

正文 ≥ 4.5:1，大字号 ≥ 3:1。颜色不能是唯一的信息载体。

## 4. 尊重减少动态效果

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
