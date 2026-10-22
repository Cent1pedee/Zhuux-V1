# BLOG

一个面向技术人的**纯静态个人主页**：项目展示、技术文章、经历时间线、技术栈、联系方式，外加明暗主题、可访问性基线与隐私友好的统计数据。

> ⚠️ **仓库内所有内容均为示例假数据**（作者「煮雪话河山」、`hello@example.com`、`https://github.com/example` 等）。部署前请对照 [可替换假数据清单](#可替换假数据清单) 逐项替换。

- 构建产物是纯静态 HTML，可直接部署到任意静态托管 / CDN，无服务端、无数据库、无运行时依赖。
- 内容与代码分离：改 Markdown 和 JSON 即可更新站点，不需要改组件。
- 默认**零第三方请求**：不配 Giscus 就不加载评论脚本，不配 `analytics.endpoint` 就不发送任何统计数据。

---

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [路由一览](#路由一览)
- [内容更新指南](#内容更新指南)
    - [新增页面内容的两条命令](#新增页面内容的两条命令)
    - [项目 `content/projects/*.md`](#项目-contentprojects-md)
    - [文章 `content/articles/*.md`](#文章-contentarticles-md)
    - [站点身份 `site.config.json`](#站点身份-siteconfigjson)
    - [经历 `src/data/experience.json`](#经历-srcdataexperiencejson)
    - [技术栈 `src/data/skills.json`](#技术栈-srcdataskillsjson)
    - [最近动态 `src/data/latest.json`](#最近动态-srcdatalatestjson)
    - [Markdown 支持的语法](#markdown-支持的语法)
- [图片资源](#图片资源)
- [SEO](#seo)
- [评论（Giscus）配置](#评论giscus配置)
- [统计数据与隐私](#统计数据与隐私)
- [视觉体系](#视觉体系)
- [可访问性与动效降级](#可访问性与动效降级)
- [部署](#部署)
- [验收自查清单（P0）](#验收自查清单p0)
- [可替换假数据清单](#可替换假数据清单)
- [已知限制（与代码一致）](#已知限制与代码一致)
- [常见问题](#常见问题)
- [License / Credits](#license--credits)

---

## 项目简介

> **本版视觉**：整体改为毛玻璃 Bento 风格（柔光背景、半透明玻璃卡片、衬线标题），
> 昼夜切换带圆形揭幕过渡，并将内容拆为**文章 / 项目 / 杂谈**三个独立分类。
> 旧版的普通卡片列表已被替换，交互（筛选、复制、设置、评论等）保持可用。

| 能力     | 说明                                                                                                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 视觉风格 | 毛玻璃（Glassmorphism）：柔光斑背景 + 半透明玻璃卡片（`backdrop-filter`）+ 24px 大圆角 + 衬线标题；亮 / 暗双主题                                                                                              |
| 首页     | Bento 栅格：可搜索的胶囊搜索条、资料卡（头像 / 姓名 / 简介 / 文章·项目·杂谈计数 / 社交）、日/夜场景切换卡、最新文章 / 项目 / 杂谈三张轮播卡（可暂停）、最近动态、关于、经历与技术栈、分类入口、本地时间状态条 |
| 三分类   | **文章**（长文）、**项目**（作品）、**杂谈**（短记录）各自拥有独立列表与详情页；三类之间只通过顶部主导航切换，分类页内不再重复放一份切换控件                                                                  |
| 项目列表 | 精选项目大卡 + 客户端筛选与排序，状态同步到 URL（`?tags=&kinds=&sort=&q=`），可复制分享链接；**禁用 JS 时仍列出全部项目**                                                                                     |
| 项目详情 | 封面、Demo / 源码入口（无链接时点击给出说明而非死按钮）、带来源与统计时间的指标卡片、技术选型、相关文章 / 项目，`?list=` 可「返回并保留筛选条件」                                                             |
| 文章列表 | 精选轮播 + 标签筛选（`?tag=`）+ 卡片网格 + RSS 订阅入口                                                                                                                                                       |
| 文章详情 | 封面、页内目录（侧栏）、阅读时长估算、相关项目、上下篇、作者卡 + 推荐阅读、懒加载 Giscus 评论                                                                                                                 |
| 杂谈列表 | 瀑布流卡片（正文摘要、心情与日期）                                                                                                                                                                            |
| 杂谈详情 | 短文正文、上下则、作者卡与更多杂谈                                                                                                                                                                            |
| 偏好设置 | 主题（跟随系统 / 亮色 / 暗色）、统计同意开关、导出 / 清除本次会话事件、恢复默认                                                                                                                               |
| 隐私政策 | 数据处理说明 + 由 `site.config.json` 驱动的第三方服务清单表                                                                                                                                                   |
| SEO      | 每页独立 metadata、canonical、OG / Twitter、JSON-LD、`sitemap.xml`、`robots.txt`、全文 `rss.xml`                                                                                                              |
| 兜底     | 404 页面                                                                                                                                                                                                      |

---

## 技术栈

| 类别       | 选型                                                                                                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 框架       | Next.js `15.5.28`（App Router，`output: "export"` 静态导出，`trailingSlash: true`，`images.unoptimized: true`）                                                                         |
| UI         | React `19.1.1` / ReactDOM `19.1.1`                                                                                                                                                      |
| 包管理     | **pnpm**（`packageManager: pnpm@9.15.0`，锁文件 `pnpm-lock.yaml`；根目录 `.npmrc` 关闭严格版本校验）                                                                                    |
| 样式       | Tailwind CSS `4.1.18`（`@tailwindcss/postcss`）+ daisyUI `5.7.50`；自定义亮 / 暗主题与令牌在 `src/styles/tokens.css`（`@plugin "daisyui/theme"`），`src/app/globals.css` 只做 `@import` |
| 语言       | TypeScript `5.9.2`（`strict: true`，路径别名 `@/* → src/*`）                                                                                                                            |
| 内容解析   | 自写的零依赖 front-matter / Markdown 解析器（`src/content/frontmatter.ts`、`src/components/Markdown.tsx`）                                                                              |
| 开发期工具 | `@playwright/test`、`axe-core`（仅用于自测，不进入线上产物）                                                                                                                            |
| 运行时依赖 | 仅 `next`、`react`、`react-dom`                                                                                                                                                         |

构建配置见 `next.config.ts`：静态导出、目录式 URL（`/projects/foo/` → `out/projects/foo/index.html`）、关闭 X-Powered-By。

---

## 快速开始

需要 **Node.js ≥ 18.18**（Next.js 15 的最低要求）与 **pnpm**（本项目使用 pnpm 管理依赖，版本见 `package.json` 的 `packageManager` 字段）。

```bash
# 0. 如果没有 pnpm：npm i -g pnpm@9（或用 corepack enable && corepack prepare pnpm@9.15.0 --activate）
# 1. 安装依赖（生成 pnpm-lock.yaml）
pnpm install

# 2. 本地开发（Turbopack，默认 http://localhost:3000）
pnpm dev

# 3. 构建静态站点 → out/
pnpm build

# 4. 本地预览构建产物（http://localhost:3000）
pnpm start
```

> 换包管理器时请把 `node_modules` 与 `package-lock.json` 一并删除，只保留 `pnpm-lock.yaml`，避免两套锁文件互相覆盖。仓库根目录的 `.npmrc` 中 `package-manager-strict=false` 仅用于允许其他包管理器临时运行，不改变以 pnpm 为准的约定。

### pnpm scripts

| 命令               | 实际执行                                      | 说明                                                                                                                                                                                                 |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`         | `next dev --turbopack`                        | 开发服务器                                                                                                                                                                                           |
| `pnpm build`       | `next build && node scripts/publish-data.mjs` | 静态导出到 `out/`，再把 `src/data/latest.json` 复制为 `out/data/latest.json`（供首页「刷新动态」按钮 `fetch`）。⚠️ 构建会自动清空 `out/`，**必须先跑 build 再上传/部署，不要手工往 `out/` 里补文件** |
| `pnpm start`       | `pnpm dlx serve@14 out -l 3000`               | 用 `serve` 预览 `out/`（首次运行会下载 `serve@14`）                                                                                                                                                  |
| `pnpm new:project` | `node scripts/new-project.mjs`                | 新建项目 Markdown                                                                                                                                                                                    |
| `pnpm new:article` | `node scripts/new-article.mjs`                | 新建文章 Markdown（默认草稿）                                                                                                                                                                        |
| `pnpm new:chatter` | `node scripts/new-chatter.mjs`                | 新建杂谈 Markdown（默认草稿）                                                                                                                                                                        |
| `pnpm dlx ...`     | —                                             | 临时执行一次性命令（等价 `npx`）                                                                                                                                                                     |

> 构建好之后别再单独跑 `next start`：静态导出模式没有服务端，必须服务 `out/` 目录。

---

## 目录结构

```text
.
├── site.config.json            # 站点身份、联系方式、社交链接、统计、Giscus、RSS、第三方服务清单
├── next.config.ts              # 静态导出等构建配置
├── postcss.config.mjs          # Tailwind CSS 4 的 PostCSS 插件
├── tsconfig.json
├── package.json
├── .npmrc                      # 包管理器约定（pnpm；关闭严格版本校验）
├── pnpm-lock.yaml              # pnpm 锁文件
├── content/
│   ├── projects/*.md           # 项目（front-matter + Markdown）
│   ├── articles/*.md           # 文章（front-matter + Markdown，draft: true 不发布）
│   └── chatters/*.md           # 杂谈（短记录，front-matter + Markdown）
├── public/
│   ├── images/avatar.svg       # 头像
│   ├── images/covers/*.svg     # 项目 / 文章封面（1000×400，5:2）
│   └── og/default.svg          # 默认社交分享图（1200×630）
├── scripts/
│   ├── new-project.mjs         # pnpm new:project
│   ├── new-article.mjs         # pnpm new:article
│   ├── new-chatter.mjs         # pnpm new:chatter
│   └── publish-data.mjs        # 构建后复制 latest.json
└── src/
    ├── app/                    # App Router 页面
    │   ├── layout.tsx          # 全局布局、metadata、首帧主题脚本、跳转链接
    │   ├── page.tsx            # 首页
    │   ├── globals.css         # 只负责 @import Tailwind / daisyUI 与 ../styles/*.css
    │   ├── not-found.tsx       # 404
    │   ├── projects/page.tsx   # 项目列表
    │   ├── projects/[slug]/page.tsx
    │   ├── articles/page.tsx   # 文章列表
    │   ├── articles/[slug]/page.tsx
    │   ├── chatters/page.tsx   # 杂谈列表
    │   ├── chatters/[slug]/page.tsx
    │   ├── privacy/page.tsx    # 隐私政策
    │   ├── settings/page.tsx   # 偏好设置
    │   ├── rss.xml/route.ts    # /rss.xml
    │   ├── sitemap.ts          # /sitemap.xml
    │   └── robots.ts           # /robots.txt
    ├── styles/                 # tokens.css（令牌/主题/基底）、background.css（柔光背景与昼夜揭幕）、
    │                           # components.css（容器/按钮/卡片/表单）、pages.css（页面细节）、
    │                           # bento.css（首页 Bento 与分类卡片）、motion.css（过渡与降级）
    ├── components/             # BentoParts（资料卡/搜索/状态条）、CoverCarousel、HomePanels、
    │                           # 共享：CatalogHeader / Breadcrumbs / AuthorCard / TagChips / CopyLinkButton / InlineNotice
    │                           # ProjectFilters、Comments、SettingsPanel、DetailAside…
    ├── content/
    │   ├── frontmatter.ts      # 极简 front-matter 解析 + 字段读取工具
    │   ├── projects.ts         # 读取 content/projects，排序、标签汇总
    │   ├── articles.ts         # 读取 content/articles，过滤草稿
    │   ├── chatters.ts         # 读取 content/chatters、摘要提取（chatterExcerpt）
    │   └── types.ts            # Project / Article 类型与常量
    ├── data/
    │   ├── experience.json     # 经历
    │   ├── skills.json         # 技术栈
    │   └── latest.json         # 最近动态
    └── lib/
        ├── site.ts             # 读取并校验 site.config.json，absoluteUrl()
        ├── seo.tsx             # metadata 构造 + JSON-LD 生成器
        ├── analytics.ts        # 事件记录 / 同意 / 上报
        ├── data-source.ts      # 读取 latest.json 的 source
        ├── storage.ts          # localStorage 键名与安全读写
        └── hooks.ts            # useReducedMotion、useInViewOnce、useFocusRestore
```

> `.verify/`（本地自测脚本）、`.next/`、`out/`、`node_modules/` 均不进入版本库（见 `.gitignore`）。

---

## 路由一览

| 路径                | 输出文件                         | 说明                                                                                              |
| ------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------- |
| `/`                 | `out/index.html`                 | 首页                                                                                              |
| `/projects/`        | `out/projects/index.html`        | 项目列表；筛选参数 `tags`（逗号分隔、多选为「或」）、`kinds`、`sort`（`date` \| `priority`）、`q` |
| `/projects/<slug>/` | `out/projects/<slug>/index.html` | 项目详情；`?list=<query>` 时显示「返回并保留筛选」                                                |
| `/articles/`        | `out/articles/index.html`        | 文章列表；标签筛选 `?tag=`                                                                        |
| `/articles/<slug>/` | `out/articles/<slug>/index.html` | 文章详情 + TOC + 评论                                                                             |
| `/chatters/`        | `out/chatters/index.html`        | 杂谈列表（短记录）                                                                                |
| `/chatters/<slug>/` | `out/chatters/<slug>/index.html` | 杂谈详情                                                                                          |
| `/privacy/`         | `out/privacy/index.html`         | 隐私政策                                                                                          |
| `/settings/`        | `out/settings/index.html`        | 偏好设置（工具页，`robots.txt` 中 `Disallow: /settings/`）                                        |
| `/rss.xml`          | `out/rss.xml`                    | 全文 RSS                                                                                          |
| `/sitemap.xml`      | `out/sitemap.xml`                | 站点地图                                                                                          |
| `/robots.txt`       | `out/robots.txt`                 | 爬虫规则                                                                                          |
| 其他                | `out/404.html`                   | 404 页面                                                                                          |

详情页使用 `generateStaticParams` + `dynamicParams = false`：只有 `content/` 里存在的 slug 会被导出，其余路径落到 404。

---

## 内容更新指南

### 新增页面内容的两条命令

```bash
# 新建项目：<slug> "<标题>" [open-source|commercial|experiment]，类型默认 open-source
pnpm new:project -- perf-budget "性能预算守门员" open-source

# 新建文章：默认 draft: true，不会出现在列表 / RSS / sitemap 中
pnpm new:article -- my-first-post "我的第一篇技术文章"
```

脚本行为（`scripts/new-project.mjs` / `scripts/new-article.mjs`）：

- 生成 `content/projects/<slug>.md` 或 `content/articles/<slug>.md`，`date` 取运行当日（`YYYY-MM-DD`）；文件已存在时报错退出。
- 项目脚本会检查 `public/images/covers/<slug>.svg` 是否存在，不存在时提示补一张 1000×400 封面；文章脚本的模板封面默认指向 `/images/covers/a11y-audit.svg`，记得改。
- 项目类型的第三个参数只接受 `open-source` / `commercial` / `experiment`，否则报错。
- **发布文章**：把 front-matter 里的 `draft: true` 改成 `false`，然后重新 `pnpm build`。RSS、sitemap、文章列表会在下次构建时自动包含。

---

### 项目 `content/projects/*.md`

front-matter 字段（由 `src/content/projects.ts` 读取）：

| 字段              | 类型                | 必填   | 说明                                                                            |
| ----------------- | ------------------- | ------ | ------------------------------------------------------------------------------- |
| `slug`            | string              | ✅     | 唯一标识，决定 URL `/projects/<slug>/`；缺失会直接构建报错                      |
| `title`           | string              | 建议   | 缺省时回退为 `slug`                                                             |
| `date`            | string `YYYY-MM-DD` | 建议   | 列表排序、sitemap `lastModified`、JSON-LD `dateCreated`                         |
| `summary`         | string              | 建议   | 一句话描述，用于卡片、列表、meta description、JSON-LD                           |
| `priority`        | number              | 否     | 重要性权重，默认 `0`；同一天按此倒序                                            |
| `kind`            | string              | 二选一 | 单个类型：`open-source` / `commercial` / `experiment`（「开源 / 商业 / 实验」） |
| `kinds`           | string[]            | 二选一 | 多类型写法，优先于 `kind`；非法值会被过滤                                       |
| `tags`            | string[]            | 否     | 技术栈标签，用于筛选和「相关项目」推荐                                          |
| `cover`           | string              | 建议   | 封面路径，如 `/images/covers/<slug>.svg`                                        |
| `coverAlt`        | string              | 建议   | 封面替代文本                                                                    |
| `demoUrl`         | string              | 否     | 留空 `""` 表示没有在线 Demo（按钮仍可点击并给出说明）                           |
| `repoUrl`         | string              | 否     | 留空表示源码不公开                                                              |
| `license`         | string              | 否     | 许可证文字（MIT、Apache-2.0、闭源说明等），会进入 JSON-LD                       |
| `status`          | string              | 否     | `released`（新发布）/ `maintained`（维护中）/ `archived`（已归档），其他值忽略  |
| `techChoices`     | string[]            | 否     | 技术选型说明列表，按顺序渲染                                                    |
| `highlights`      | string[]            | 否     | 可核验指标，见下方「一行式记录」语法                                            |
| `relatedSkills`   | string[]            | 否     | 相关技能，与技术栈标签合并展示；也参与相关项目推荐                              |
| `relatedArticles` | string[]            | 否     | 关联文章 slug 列表                                                              |
| 正文              | Markdown            | 建议   | 渲染在「项目详情」区域，按 `## / ###` 生成小节                                  |

> 列表排序：**时间倒序**，同一天再按 `priority` 倒序（`getAllProjects()`）。

**`highlights` 一行式记录语法**（本项目的解析器不支持嵌套 YAML，`src/content/projects.ts` 的 `parseHighlights`）：

```yaml
highlights:
    - label=首屏 gzip 体积 | value=18KB | source=基于 vite build 产物体积统计 | measuredAt=2026-09-20
    - label=GitHub Star | value=1.2k | source=GitHub 仓库页面 | measuredAt=2026-10-15
```

- 字段名为 `label` / `value` / `source` / `measuredAt`；`label` 或 `value` 至少有一个非空才会展示。
- 字段之间必须用 **空格 + 竖线 + 空格**（`|`）分隔；字段值内部不要出现 `|`。
- **不要给字段值加引号。** 该解析器只去掉整个列表项外层的一对引号，`label="xx" | value="yy"` 这种写法会把引号原样渲染到页面上（仓库里现有的 5 个示例项目正是这种写法，详情页指标现在显示为 `"18KB"`、`"GitHub 仓库页面"` 等带引号的文字）——参照下面的正确写法，或顺手把示例里的引号去掉。
- `measuredAt` 推荐写 `YYYY-MM-DD`，详情页会显示为「来源：… · 统计时间：…」。**这个字段是设计上的约定**：写指标时务必标注来源与统计时间，不要把无法核验的数字当作成果。

**带引号的写法（可解析，但页面上会出现引号）**——节选自 `content/projects/lumen-ui.md`：

```markdown
---
title: 'lumen-ui · 轻量 React 组件库'
slug: 'lumen-ui'
date: '2026-09-21'
status: 'released'
priority: 3
kind: 'open-source'
tags: ['React', 'TypeScript', 'Tailwind CSS', 'Vite']
summary: '面向中后台的轻量 React 组件库，按需加载与可访问性优先，gzip 后首屏仅 18KB。'
cover: '/images/covers/lumen-ui.svg'
coverAlt: 'lumen-ui 组件库封面：按需加载的组件网格示意图'
demoUrl: 'https://example.com/lumen-ui-demo'
repoUrl: 'https://github.com/example/lumen-ui'
license: 'MIT'
techChoices:
    - '以 Vite 库模式产出 ESM + CJS 双格式，tree-shaking 友好。'
highlights:
    - label="首屏 gzip 体积" | value="18KB" | source="基于 vite build 产物体积统计" | measuredAt="2026-09-20"
relatedSkills: ['React', 'TypeScript', 'Vite']
relatedArticles: ['lcp-from-4s-to-2s']
---

## 背景

正文……
```

---

### 文章 `content/articles/*.md`

front-matter 字段（由 `src/content/articles.ts` 读取）：

| 字段              | 类型                | 必填 | 说明                                                                  |
| ----------------- | ------------------- | ---- | --------------------------------------------------------------------- |
| `slug`            | string              | ✅   | 唯一标识，URL 为 `/articles/<slug>/`；缺失会构建报错                  |
| `title`           | string              | 建议 | 缺省回退为 `slug`                                                     |
| `date`            | string `YYYY-MM-DD` | 建议 | 排序、RSS `pubDate`、sitemap、JSON-LD `datePublished`                 |
| `draft`           | boolean             | 否   | **`true` 时整篇文章不进入列表、详情路由、RSS、sitemap**；默认 `false` |
| `tags`            | string[]            | 否   | 标签筛选与 RSS `<category>`                                           |
| `summary`         | string              | 建议 | 摘要，用于列表与 meta description                                     |
| `cover`           | string              | 建议 | 封面路径                                                              |
| `coverAlt`        | string              | 建议 | 封面替代文本                                                          |
| `relatedProjects` | string[]            | 否   | 关联项目 slug，文章底部展示「相关项目」                               |
| 正文              | Markdown            | 是   | 按 `## / ###` 自动生成目录（TOC）                                     |

示例：

```markdown
---
title: '把首屏 LCP 从 4.2s 压到 1.9s 的六个决策'
slug: 'lcp-from-4s-to-2s'
date: '2026-10-08'
draft: false
tags: ['性能优化', 'LCP', 'Next.js']
summary: '记录一次真实的移动端首屏优化……'
cover: '/images/covers/perf-lens.svg'
coverAlt: '文章封面：LCP 优化前后对比图'
relatedProjects: ['lumen-ui', 'perf-lens']
---

## 结论先行

正文……
```

### 杂谈 `content/chatters/*.md`

杂谈是比文章更短的记录（工具链小发现、阅读笔记、生活片段），与文章共用 Markdown 渲染器，但不进 RSS。

| 字段    | 类型                | 必填 | 说明                                           |
| ------- | ------------------- | ---- | ---------------------------------------------- |
| `slug`  | string              | ✅   | URL 为 `/chatters/<slug>/`；缺省时回退为文件名 |
| `title` | string              | 建议 | 卡片与详情页标题                               |
| `date`  | string `YYYY-MM-DD` | 建议 | 排序与 JSON-LD                                 |
| `mood`  | string              | 否   | 心情/场景标签，显示为卡片右下角的小 Chip       |
| `tags`  | string[]            | 否   | 标签，用于内链与展示                           |
| `draft` | boolean             | 否   | `true` 时不进入列表、详情路由与 sitemap        |
| 正文    | Markdown            | 是   | 支持标题、列表、引用、代码块、加粗与链接       |

```markdown
---
title: '把构建缓存命中率从 12% 拉到 91%'
slug: 'build-cache-hit-rate'
date: '2026-10-14'
mood: '一点点得意'
tags: ['工程化', 'CI']
draft: false
---

今天终于把 CI 的缓存命中率从 12% 拉到 91%。
```

> 摘要会自动去掉与标题重复的开头（`chatterExcerpt`），所以正文第一句即使重复标题也不会在卡片里出现两遍。

用 `pnpm new:chatter -- <slug> "<标题>"` 生成模板；默认 `draft: true`，发布前改为 `false`。

---

### 站点身份 `site.config.json`

全站唯一数据源，`src/lib/site.ts` 读取并在进程内缓存；`url` 不以 `http` 开头会直接抛错。

| 路径                                                 | 说明                                                                                                                                                               |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `url`                                                | **站点根地址，务必在部署前改成你的真实域名。** 驱动 `metadataBase`、canonical、OG、sitemap、RSS、robots 中的绝对 URL                                               |
| `title` / `description`                              | 全站标题 / 描述（首页 metadata、OG、`WebSite` JSON-LD）                                                                                                            |
| `defaultTheme`                                       | 初始主题：`system` / `light` / `dark`（用户手动选择后以 `localStorage.theme` 为准）                                                                                |
| `author.name` / `jobTitle` / `directionTags` / `bio` | 姓名、职位、方向标签、长简介（`bio` 进入 `Person` JSON-LD）                                                                                                        |
| `author.tagline`                                     | 一句话简介（≤60 字），首屏的语义文案与 `aria-label="一句话简介"` 使用它；首屏容器预留 2 行高度，避免打字过程引起布局偏移                                           |
| `author.typewriterText`                              | 首屏一句话的打字机文本（50ms/字）；若不需要该字段可留空，首屏会直接展示 `bio` 与 `tagline`                                                                         |
| `author.avatar`                                      | `src` / `width` / `height` / `alt`（首页头像，`Person` JSON-LD 的 image）                                                                                          |
| `location`                                           | `city`、`timezone`、`contactWindow`、`hideExactAddress`、`exactAddress`                                                                                            |
| `contact`                                            | `email`、`emailCopyLabel`（复制成功提示文案）、`emailHref`（一般为 `mailto:`）                                                                                     |
| `socials[]`                                          | `kind`（`github` \| `juejin` \| `zhihu` \| `x` \| `linkedin` \| `email` \| `telegram` \| `wechat`）、`label`、`href`、`event`（`social_click` 或 `contact_click`） |
| `analytics.endpoint`                                 | 统计数据上报地址（POST JSON），留空 = 只在本地记录，不发送                                                                                                         |
| `analytics.enabled`                                  | 仅作配置标记，代码中实际以上述「endpoint 非空 + 访客同意」决定是否上报                                                                                             |
| `giscus.*`                                           | 评论配置，见 [评论（Giscus）配置](#评论giscus配置)                                                                                                                 |
| `rss.title` / `rss.description`                      | RSS 频道标题 / 描述，也用于文章列表页的说明文字                                                                                                                    |
| `thirdPartyServices[]`                               | 隐私政策页的第三方服务清单：`name`、`purpose`、`data`、`loading`、`consentRequired`                                                                                |

---

### 经历 `src/data/experience.json`

```json
{
    "experience": [
        {
            "type": "work",
            "org": "示例科技（杭州）",
            "role": "高级前端工程师",
            "start": "2021-06",
            "end": null,
            "summary": "负责电商主站的前端架构与性能治理。",
            "achievements": ["重构构建链路，CI 构建耗时从 6 分钟降至 90 秒。"]
        }
    ]
}
```

| 字段           | 类型                      | 说明                            |
| -------------- | ------------------------- | ------------------------------- |
| `type`         | `"work"` \| `"education"` | 展示为「工作经历」/「教育经历」 |
| `org`          | string                    | 公司 / 学校                     |
| `role`         | string                    | 职位或专业                      |
| `start`        | string `YYYY-MM`          | 开始时间，展示为 `YYYY.MM`      |
| `end`          | string \| null            | 结束时间；`null` 显示为「至今」 |
| `summary`      | string                    | 一行概述                        |
| `achievements` | string[]                  | 要点列表                        |

首页时间线默认只显示前 2 条，超出部分可点击「展开全部经历」查看。按数组顺序展示，**请自己按时间倒序排列**。

---

### 技术栈 `src/data/skills.json`

```json
{
    "skills": [
        {
            "group": "语言",
            "items": ["TypeScript", "JavaScript", "HTML", "CSS", "Go"]
        }
    ]
}
```

- 按 `group` 分组，组内 `items` 为纯文本标签（有意不使用「精通 / 熟练」等评级）。
- 若某个技术同时出现在某个项目的 `tags` 中，标签会变成链接，跳转到 `/projects/?tags=<技术>` 并按该技术筛选，标签后数字为匹配项目数；没有匹配项目时显示为普通标签。

---

### 最近动态 `src/data/latest.json`

```json
{
    "source": { "kind": "static", "label": "静态维护（src/data/latest.json）" },
    "latestStatus": {
        "text": "正在寻找前端架构方向的机会",
        "updatedAt": "2026-10-12"
    },
    "items": [
        {
            "type": "article",
            "title": "文章标题",
            "href": "/articles/<slug>/",
            "date": "2026-10-08"
        }
    ]
}
```

| 字段                                           | 说明                                                                                                                                            |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `latestStatus.text` / `latestStatus.updatedAt` | 首页顶部「当前状态」与日期（也在首屏自我介绍区展示）                                                                                            |
| `items[]`                                      | `type`（`article` \| `project`）、`title`、`href`（站内路径）、`date`                                                                           |
| `source`                                       | 可选；`kind` 为 `static` / `rss` / `api`，`label` 会显示在卡片底部「数据来源：…」。由 `src/lib/data-source.ts` 读取，缺失或非法时回退为静态来源 |

「刷新动态」按钮会 `fetch("/data/latest.json")` 重新拉取（最多取前 5 条）。该文件由 `scripts/publish-data.mjs` 在构建后复制到 `out/data/latest.json`——**只改 `src/` 下这份，不要手改 `out/`**。

---

### Markdown 支持的语法

`src/components/Markdown.tsx` 是自写的极简渲染器，只支持以下语法（超出部分会按纯文本显示）：

- `##` 二级标题、`###` 三级标题（会被收集进文章目录）
- 段落（空行分段）、无序列表 `-` / 有序列表 `1.`
- 引用 `> `、围栏代码块 ` ```lang `
- 行内代码 `` `code` ``、加粗 `**文本**`、链接 `[文本](https://…)`（外部链接自动加 `target="_blank" rel="noopener noreferrer"`）

不支持：图片语法 `![]()`、表格、HTML 标签（会被转义而不会执行）、多级嵌套列表。需要在正文里放图片时，请改为在 front-matter 中设置 `cover`。

---

## 图片资源

| 文件                         | 用途           | 约定                                                                                                                                |
| ---------------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `public/images/avatar.svg`   | 首页头像       | 任意正方形图；改动后在 `site.config.json` 的 `author.avatar` 同步 `src` / `width` / `height`                                        |
| `public/images/covers/*.svg` | 项目与文章封面 | **1000×400（5:2）**，代码里写死 `width={1000} height={400}` 且封面容器固定 `aspect-ratio: 5 / 2`，用同比例图片可避免布局偏移（CLS） |
| `public/og/default.svg`      | 默认社交分享图 | **1200×630**；未指定 `cover` 的页面使用它。部分社交平台不抓取 SVG，建议另外导出 PNG/JPG 后替换引用                                  |

### 替换成自己的图

1. 把新图放进 `public/images/`，保持路径不变可直接替换；换文件名则同步修改 `site.config.json` 的 `avatar.src` 或内容里的 `cover` 字段。
2. 封面统一按 5:2 裁剪导出，头像用正方形。

### 导出 AVIF / WebP 变体

图片是静态导出的（`images.unoptimized: true`），Next 不会自动转格式，需要自己导出：

```bash
# WebP（质量 80）
cwebp -q 80 cover.png -o cover.webp

# AVIF（质量 50，速度 4）
avifenc --min 1 --max 40 -s 4 cover.png cover.avif

# PNG 兜底（可在原图基础上压缩）
pngquant --quality=65-85 cover.png -o cover-fallback.png
```

### 如需进一步优化：`<picture>` / `srcset`

当前组件统一使用单张 `<img src={cover} … width={1000} height={400}>`。如果你需要按格式或分辨率分发，推荐做法：

1. 为每个封面额外导出 `cover.avif` 和 `cover.webp`，并生成 500px / 1000px 两档宽度（`cwebp -resize 500 200`、`avifenc` 同理）。
2. 在 `src/components/ProjectCard.tsx`（卡片）、`src/app/projects/[slug]/page.tsx` 与 `src/app/articles/[slug]/page.tsx`（详情页封面）中把 `<img>` 换成 `<picture>`：`<source type="image/avif" srcSet="…">`、`<source type="image/webp">`、最后 `<img>` 指向 SVG/PNG 兜底，并保留 `width` / `height` 防止 CLS。
3. 卡片图保持 `loading="lazy"`，详情页封面保持 `loading="eager"`（当前即如此）。

> 注意：详情页与卡片中 `<img>` 的高度会由 5:2 容器约束，换图时仍建议维持 5:2 比例。

---

## SEO

| 产物           | 实现                                                                                                                                                                                                                                                                | 依赖                                             |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 每页 metadata  | `src/lib/seo.tsx` 的 `buildMetadata()`：`title`（全站模板 `%s · <作者名>`，首页用完整标题）、`description`、`alternates.canonical`、Open Graph、Twitter `summary_large_image`                                                                                       | `site.config.json`                               |
| JSON-LD        | 首页：`Person`、`WebSite`；`/projects/`：`CollectionPage` + `ItemList`；项目详情：`SoftwareSourceCode`、`BreadcrumbList`、`Article`；`/articles/`：`Blog`、`BreadcrumbList`；文章详情：`BlogPosting`、`BreadcrumbList`；`/privacy/`、`/settings/`：`BreadcrumbList` | `src/lib/seo.tsx`                                |
| `/sitemap.xml` | 首页、`/projects/`、`/articles/`、`/privacy/` + 全部项目与文章；**设置页不收录**                                                                                                                                                                                    | `src/app/sitemap.ts`                             |
| `/robots.txt`  | `Allow: /`，`Disallow: /settings/`，声明 `Host` 与 `Sitemap`                                                                                                                                                                                                        | `src/app/robots.ts`                              |
| `/rss.xml`     | RSS 2.0 **全文**（`content:encoded` 为完整 Markdown 正文）、`<category>` 为标签；只含已发布（`draft: false`）文章                                                                                                                                                   | `src/app/rss.xml/route.ts`                       |
| 站点图标       | 内联 SVG favicon（`data:` URL），随主题切换颜色                                                                                                                                                                                                                     | `src/app/layout.tsx`、`src/components/theme.tsx` |
| 404            | `src/app/not-found.tsx`                                                                                                                                                                                                                                             | —                                                |

**上线前必须做的一件事**：把 `site.config.json` 里的 `url`（当前 `https://example.com`）改成真实域名，通常是 `https://<你的域名>/` 或 `https://<你的域名>`（代码会自行去掉末尾斜杠）。它决定 canonical、OG、sitemap、RSS、robots 中的绝对地址；`<html lang="zh-CN">` 也已设置。

部署后建议自查：

- 访问 `/sitemap.xml`、`/robots.txt`、`/rss.xml` 是否都返回 200 且域名正确；
- 用搜索引擎的站长工具提交 sitemap；
- 用 [Rich Results Test](https://search.google.com/test/rich-results) 或 Schema Markup Validator 检查 JSON-LD；
- 用社交平台的分享调试工具确认 OG 图能被抓取（SVG 支持不一致，见 [图片资源](#图片资源)）。

---

## 评论（Giscus）配置

评论基于 GitHub Discussions（Giscus），**懒加载**：访客滚动到评论区附近（提前 200px）或点击「加载评论区」后才注入 `https://giscus.app/client.js`，不阻塞首屏。加载失败或 10 秒超时会显示错误与「重新加载」按钮。

当前 `site.config.json` 中 `giscus.repo`、`repoId`、`categoryId` 均为空，页面显示 **「评论区尚未启用」** 空态。

启用步骤：

1. 准备一个 **公开** GitHub 仓库（用于存放评论）。
2. 在仓库安装 [giscus app](https://github.com/apps/giscus)，并开启 **Discussions**。
3. 在仓库 Discussions 中新建一个分类，例如 `Announcements` 类型（只有维护者能发起新讨论的那种）作为评论分类。
4. 打开 <https://giscus.app/zh-CN>，在「仓库」输入 `<用户名>/<仓库名>`，选择分类与映射 `pathname`，页面会生成配置代码。
5. 把生成的 `data-repo`、`data-repo-id`、`data-category-id` 填进去：

```json
"giscus": {
  "repo": "your-name/your-repo",
  "repoId": "R_kgDOxxxxxxx",
  "category": "Announcements",
  "categoryId": "DIC_kwDOxxxxxxxx",
  "mapping": "pathname",
  "themeLight": "light",
  "themeDark": "dark"
}
```

| 键                               | 说明                                                                  |
| -------------------------------- | --------------------------------------------------------------------- |
| `repo` / `repoId` / `categoryId` | 三者**都非空**才会启用评论；缺任意一个都会显示「评论区尚未启用」      |
| `category`                       | 分类名称（必须是该仓库已存在的 Discussion 分类）                      |
| `mapping`                        | 页面与讨论的映射，默认 `pathname`                                     |
| `themeLight` / `themeDark`       | 亮 / 暗主题名；站点主题切换时会通过 `postMessage` 同步已加载的 iframe |

说明：脚本固定使用 `strict=0`、`reactionsEnabled=1`、`emitMetadata=0`、`inputPosition=top`、`lang=zh-CN`、`loading=lazy`。评论数据由 GitHub 处理，隐私政策页已把 Giscus 列入第三方服务清单（`thirdPartyServices`）。

---

## 统计数据与隐私

### 同意流程

1. **默认不采集、不上报**。访问者的交互事件只写入当前标签页的 `sessionStorage`（键 `analytics-log`，最多保留最近 50 条）。
2. 只有同时满足 **① 访客在 `/settings/` 勾选「允许发送匿名统计数据」**（`localStorage["analytics-consent"] = "granted"`）**且 ② `site.config.json → analytics.endpoint` 非空**，才会发送。
3. 发送方式：`navigator.sendBeacon(endpoint, Blob(JSON))`，不支持时降级为 `fetch(..., { keepalive: true })`；请求体：

```json
{
    "events": [
        {
            "name": "page_view",
            "path": "/projects/",
            "meta": { "referrer": "direct" },
            "ts": 1761000000000
        }
    ]
}
```

4. 勾选同意时会把之前积压的事件一并补发；**取消勾选会立即清空本地事件记录**，之后不再发送。
5. `/settings/` 还提供：导出本次会话事件（下载 JSON 文件）、清除本次会话事件（原生 `<dialog>` 确认后生效）、恢复全部默认设置（清掉 `theme`、`projects-filter`、`analytics-consent`、`analytics-log`，主题回到「跟随系统」）。

`analytics.endpoint` 可以指向任何接受 `POST` JSON 的地址（如自建函数、Logflare、Plausible 的兼容端点、Serverless Function 等），本项目不内置服务端。

### 事件清单

| 事件名               | 触发位置                                                                     | `meta` 示例                                             |
| -------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------- |
| `page_view`          | 每次路由变化（`SiteBoot`）                                                   | `{ referrer }`（来源域名或 `direct`）                   |
| `project_link_click` | 项目卡片、详情页 Demo / 源码按钮、技术栈筛选、首屏「查看项目」               | `{ slug, target }`、`{ target: "skill_filter", skill }` |
| `social_click`       | 首屏与联系方式区的社交链接（`socials[].event` 不是 `contact_click` 的项）    | `{ network }`                                           |
| `contact_click`      | 复制邮箱、mailto 链接、首屏邮箱按钮、`socials` 中标记为 `contact_click` 的项 | `{ channel }`                                           |
| `theme_change`       | 主题切换（`theme` 取 `system` / `light` / `dark`）                           | `{ theme }`                                             |

事件名与类型定义在 `src/lib/analytics.ts`，中文标签在 `src/components/SettingsPanel.tsx`。

### 本地存储键

| 键                  | 存储位置       | 用途                                                                                                                                                        |
| ------------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `theme`             | localStorage   | 手动选择的主题（选择「跟随系统」时删除）                                                                                                                    |
| `analytics-consent` | localStorage   | 统计同意状态（`granted` / `denied`）                                                                                                                        |
| `analytics-log`     | sessionStorage | 本次会话的事件记录                                                                                                                                          |
| `projects-filter`   | localStorage   | 「恢复默认设置」时会被清除                                                                                                                                  |
| `projects-scroll`   | sessionStorage | 隐私政策页声明用于恢复项目列表滚动位置；「恢复默认设置」时会清除。⚠️ 当前源码中除隐私页与设置页外没有读写该键的代码，如你实现了滚动位置恢复，请使用这个键名 |

### 隐私政策页

隐私政策位于 **`src/app/privacy/page.tsx` → `/privacy/`**，内容包括：收集哪些数据、用途与保留期限、存储在设备上的数据、第三方服务清单表（由 `site.config.json → thirdPartyServices` 渲染）、你的权利、版权与署名、政策更新日期。

**如果你新增了第三方服务**（字体 CDN、统计 SDK、视频嵌入等），务必同时更新 `thirdPartyServices` 并在此页说明；`consentRequired: true` 的服务会显示「需同意」标记。

---

## 视觉体系（毛玻璃 / Bento）

样式集中在 `src/styles/`，由 `src/app/globals.css` 统一 `@import`：

| 文件             | 内容                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `tokens.css`     | daisyUI 亮/暗主题、设计令牌（留白、圆角、玻璃、阴影、缓动、时长）、衬线标题与基底排版                  |
| `background.css` | 固定背景层（四团柔光斑 + 可选墙纸 + 雾化层）、昼夜切换的圆形揭幕                                       |
| `components.css` | 容器（`.page-shell` / `.page-wrap`）、悬浮玻璃导航、按钮、Chip、玻璃卡片、表单、对话框、表格、触控目标 |
| `pages.css`      | 时间线、文章正文、目录、隐私/设置/404、入场渐显                                                        |
| `bento.css`      | 首页 Bento 栅格、资料卡、封面轮播、日/夜场景卡、分类卡片与详情侧栏                                     |
| `motion.css`     | 页面切换、路由进度、减少动效兜底                                                                       |

- **玻璃材质**：所有面板统一使用 `--glass-bg` + `1px --glass-border` + `backdrop-filter: blur(22px) saturate(160%)` + 内高光阴影；亮色是乳白玻璃，暗色是深蓝玻璃。卡片圆角 24px、内层 16px。
- **背景**：`.site-backdrop` 固定铺满视口，四团 `--blob-*` 光斑以 26–38s 缓慢漂移（只改 `transform`）。在 `site.config.json` 的 `backdrop.wallpaper` 填入图片路径即可叠加墙纸，留空则只用渐变。
- **排版**：标题使用系统衬线栈（`--font-serif`：Songti SC / Noto Serif SC…），正文为系统无衬线；不加载 Web 字体。
- **留白**：统一 `.page-shell`（最大 1120px）与 `--gutter`（手机 16 / 平板 24 / 桌面 32px）；列表页头部统一 `.catalog-head`，详情页统一「左内容 + 右 300px 侧栏」的 `.detail-grid`。
- **双主题**：亮/暗只切换 CSS 变量（`[data-theme="dark"]`），结构与间距完全一致，不会产生布局跳动。

### 昼夜切换（丝滑）

1. 点击主题按钮或首页「日 / 夜」场景卡时，会把点击坐标写入 `--theme-x/--theme-y`，并通过 **View Transition API** 让新主题以圆形揭幕从点击处扩散（780ms，`ease-out`）。
2. 不支持 View Transition 的浏览器退化为 `html.theme-anim`：所有颜色变量在 900ms 内插值（`--dur-theme`），同样是渐变而非瞬间闪烁。
3. `prefers-reduced-motion: reduce` 时两种动画都跳过，直接切换。
4. 选择写入 `localStorage.theme`；首帧由内联脚本恢复，避免刷新闪烁；`system` 模式实时跟随系统主题。

### 组件复用

页面骨架与列表控件统一抽到 `src/components/`，避免三个分类各写一套：

| 组件                                          | 复用位置                                                                           |
| --------------------------------------------- | ---------------------------------------------------------------------------------- |
| `CatalogHeader`                               | 文章 / 项目 / 杂谈 / 隐私 / 设置 五个页面的头部                                    |
| `Breadcrumbs`                                 | 三种详情页 + 隐私 / 设置                                                           |
| `AuthorCard`                                  | 三种详情页的侧栏作者卡                                                             |
| `CoverCarousel`                               | 首页三张轮播 + 文章 / 杂谈列表的精选轮播                                           |
| `TagChips`                                    | 文章与杂谈的标签单选、项目的技术栈 / 类型多选                                      |
| `TagFilterable`                               | 文章与杂谈的「按标签筛选」列表（服务端渲染卡片 + 客户端过滤）                      |
| `ArticleCard` / `ChatterCard` / `ProjectCard` | 列表与首页复用同一套卡片                                                           |
| `CopyLinkButton` / `InlineNotice`             | 筛选页、设置页、项目操作提示                                                       |
| `PanelHeading`                                | 首页「最近动态 / 此刻 / 经历与技术栈」面板标题                                     |
| `ScrollTop`                                   | 全站悬浮「回到顶部」（滚动一屏后淡入）                                             |
| `StaggerList` / `StaggerItem`                 | 文章 / 杂谈 / 项目列表的错峰入场（筛选或切标签后重新播放，纯 CSS 实现）            |
| `Motion` 说明                                 | 列表入场不依赖动画库：`listKey` 变化使容器重挂载，CSS 按 `nth-child` 编排延迟      |
| `Toolbar`                                     | 分类页工具栏骨架（计数 + 操作 + 标签 + 条件），文章 / 杂谈 / 项目共用              |
| `CopyLinkButton`                              | 每个页面都能复制当前链接（含筛选参数），失败自动降级并给出提示                     |
| `HeaderSearch`                                | 页头搜索：平时是放大镜按钮，点击向左展开胶囊；⌘K 唤起、↑↓ 选择、Esc 收起并归还焦点 |
| `ProjectFilterPanel` / `ProjectSearchSort`    | 项目筛选面板与「搜索 + 排序」子组件（状态与 URL 编解码在 `lib/project-query.ts`）  |
| `ReadingProgress`                             | 文章正文阅读进度条（独立于顶部全局进度）                                           |
| `PagerShell` / `PagerLink`                    | 详情页上一篇 / 下一篇的滑动转场                                                    |

> 分类页内不再放置「文章 / 项目 / 杂谈」切换器：该入口只保留在顶部主导航，避免同一层级出现两个等价入口。

### 三类内容的区别

| 分类 | 定位                | 数据目录            | 列表样式                        | 详情页                                |
| ---- | ------------------- | ------------------- | ------------------------------- | ------------------------------------- |
| 文章 | 长文、教程、复盘    | `content/articles/` | 精选轮播 + 标签筛选 + 三列卡片  | 封面 + 正文 + 目录 + 评论 + 侧栏      |
| 项目 | 作品、开源/商业项目 | `content/projects/` | 精选大卡 + 筛选/排序 + 双列卡片 | 封面 + Demo/源码 + 指标 + 正文 + 侧栏 |
| 杂谈 | 日常碎片、短记录    | `content/chatters/` | 精选轮播 + 瀑布流卡片           | 短文 + 上下则 + 侧栏                  |

三者在顶部主导航、首页轮播与相互的内链之间互通；RSS 仅包含文章全文（杂谈不进入 RSS，避免短记录打扰订阅者）。

## 可访问性与动效降级

### 可访问性

- **键盘可达**：全站 `:focus-visible` 焦点轮廓可见（含卡片、输入框、链接）；首帧即有「跳到主要内容」（skip link），指向 `#main-content`。
- **SPA 导航后恢复焦点**：`useFocusRestore` 会把焦点还给导航前聚焦的元素，键盘用户不会丢失 Tab 位置。
- **语义化**：`<nav aria-label="面包屑">` + `aria-current`、`<article>` + `aria-labelledby`、`<fieldset>/<legend>`、`<time dateTime>`、筛选状态用 `aria-pressed`、结果数量用 `role="status" aria-live="polite"`、提示条 `role="status"` / `role="alert"`。
- **原生 `<dialog>` 确认框**：`ConfirmDialog` 使用 `showModal()`，自带焦点陷阱、Esc 关闭、背景 inert，关闭后焦点返回触发按钮。
- **无 JS 可用**：带 JS 才出现的控件（项目筛选器、文章标签筛选）挂在 `.js-only` 下，脚本运行后会设置 `html[data-js="on"]`；**禁用 JS 时项目与文章仍完整按默认顺序展示**，只是没有筛选交互（轮播显示第一项，主题跟随系统）。
- **主题**：默认跟随系统 `prefers-color-scheme`，手动选择持久化到 `localStorage.theme`；首帧前由内联脚本同时处理「手动选择」与「系统偏好」，不会出现「先亮后暗」的闪烁。主题按钮在三态间循环，右键恢复「跟随系统」。
- **轮播可暂停**：首页三张封面卡与各分类页的精选轮播都提供「暂停 / 继续」按钮（`aria-pressed`），鼠标悬停与键盘聚焦时自动暂停；系统开启「减少动态效果」时不自动播放，并隐藏暂停按钮（避免出现无效按钮）。
- **触控目标**：`@media (pointer: coarse)` 下所有按钮、图标链接、导航项、复选框、轮播指示点与暂停按钮均为 ≥ 44×44px（轮播指示点视觉仍是小胶囊，命中区 24×24 以上）。
- **标题层级**：每个页面只有 1 个 `h1`，轮播与卡片标题使用 `h2/h3`，axe 与 Lighthouse 的 `heading-order` 检查均通过。
- **文字而非图片**：技术栈、指标等关键信息均为文本，屏幕阅读器可读。

### 动效降级

| 行为            | 条件                              | 效果                                                                                                                                               |
| --------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 全局减少动效    | `prefers-reduced-motion: reduce`  | 关闭平滑滚动、过渡与动画；背景光斑停止漂移；轮播不自动播放并隐藏暂停按钮；入场渐显直接显示最终状态                                                 |
| 背景光斑        | 非减少动效                        | 四团 `blur(80px)` 光斑以 26–38s 交替漂移，只改 `transform`，使用 `will-change` 限定在合成层                                                        |
| 昼夜切换        | 支持 View Transition 且非减少动效 | 从点击处圆形揭幕（780ms `ease-out`）；不支持的浏览器改为 900ms 颜色插值；减少动效时瞬时切换                                                        |
| 页面切换        | 非减少动效                        | 内容淡入 + 上移 10px + 0.997 缩放（320ms），顶部进度线只在真实路由切换时出现；导航指示块以弹性曲线滑到当前项                                       |
| 封面轮播        | 非减少动效                        | 6.5–8.5s 自动切换，双层封面 520ms 交叉淡入 + 内容上移；支持触屏左右滑动（Pointer Events），**悬停或键盘聚焦时暂停**，并提供显式「暂停 / 继续」按钮 |
| 卡片 hover      | 精细指针                          | 上浮 3px + 阴影加深 + 封面 900ms 缓慢放大 4–7% + 一道 900ms 斜向扫光，只改 `transform` / `opacity`                                                 |
| 列表入场        | 非减少动效                        | 文章 / 杂谈网格按 50ms 递增错峰淡入（使用 `backwards` 填充，动画结束后不锁定 hover）                                                               |
| 时间线          | 非减少动效                        | 连线 900ms 自上而下绘制，节点按 180ms 间隔弹性点亮                                                                                                 |
| 下拉与提示      | 非减少动效                        | 搜索结果 180ms 轻弹、提示条 220ms 下滑、目录当前项指示条 240ms 展开                                                                                |
| 回到顶部        | 非减少动效                        | 滚动超过 720px 后悬浮按钮淡入，hover 上浮、按压回弹                                                                                                |
| 入场渐显        | 非减少动效                        | 首屏 `.stagger` 子元素 40–330ms 错峰淡入；首页大区块 `.reveal` 挂载时 600ms 淡入（**不是滚动触发**，因此任何时刻内容都可见）                       |
| 状态点 / 场景球 | 非减少动效                        | 状态圆点脉冲、日/夜场景球 7s 上下浮动，仅用于强调                                                                                                  |

> `SiteBoot` 会把 `prefers-reduced-motion` 的实时结果写入 `html[data-motion]`，用户在同一标签页切换系统设置时无需刷新即可生效。

性能基线：首屏共享 JS 约 **103–115 kB**（gzip，来自 `next build` 的路由体积报告），无第三方脚本（未配置评论/统计时）。`backdrop-filter` 只作用于卡片与导航，背景光斑为纯 CSS 渐变 + `transform`。封面使用固定比例容器（5:2）与 `width/height`，CLS 为 0。

本仓库最近一次自查（`out/` 静态产物，移动端模拟，Lighthouse 12）：首页 99、文章 98、杂谈 99、项目详情 98、文章详情 99；Accessibility / Best Practices / SEO 均 100（`/settings/` 因 robots 主动排除，SEO 显示 66 属预期），LCP 2.0–2.4s，CLS 0，TBT ≤ 50ms；axe（WCAG 2.1 AA + best-practice，10 个页面 × 亮/暗双主题）0 违规。

推荐的验收工具（不属于项目依赖产物）：Chrome DevTools Lighthouse、[axe DevTools](https://www.deque.com/axe/devtools/) 或 `@axe-core/cli`、以及关闭 JS / 系统开启「减少动态效果」各走一遍。

---

## 部署

构建产物在 `out/`，是纯静态文件，必须有服务端 / 托管方把 `/projects/foo/` 映射到 `/projects/foo/index.html`（`trailingSlash: true`），并把未知路径返回 `404.html`。

### Vercel

1. 把仓库推到 GitHub / GitLab / Bitbucket，在 Vercel 中 **Import Project**。
2. Framework Preset 选 **Next.js**（Vercel 会自动识别 `output: "export"`，构建命令 `pnpm build`，输出目录 `out`）。
3. Build Command 保持 `pnpm build`（注意别删掉 `&& node scripts/publish-data.mjs`，否则首页「刷新动态」会 404）；Output Directory 为 `out`。
4. 部署后到 _Settings → Domains_ 绑定域名，然后把 `site.config.json` 的 `url` 改成该域名并重新部署。
5. 若使用其他平台预设（如 Other），请手动设置 Build Command `pnpm build`、Output Directory `out`。

### 任意静态托管 / CDN

```bash
pnpm install --frozen-lockfile
pnpm build
# 把整个 out/ 目录上传到托管方
```

| 平台                       | 要点                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Cloudflare Pages / Netlify | Build command `pnpm build`，Publish directory `out`（Netlify 如需 404 页可另配 `redirects`）                                         |
| GitHub Pages               | 部署 `out/`；若仓库不在域名根路径，`next.config.ts` 需要配 `basePath` / `assetPrefix`，同时把 `site.config.json` 的 `url` 带上子路径 |
| 自有 Nginx                 | `location / { try_files $uri $uri/ $uri.html =404; }`，`error_page 404 /404.html;`；静态资源可长期缓存 `_next/static/`               |
| COS / OSS / S3 + CDN       | 开启「默认首页 `index.html`」，并配置 404 → `404.html`；`rss.xml` 建议 `cache-control: public, max-age=3600`（与代码内一致）         |

### CI 建议

可选的 GitHub Actions 思路（本项目未内置 CI 工作流）：

- `pnpm install --frozen-lockfile && pnpm build` 防止内容 front-matter 写错导致构建失败；
- 构建后检查 `out/` 关键文件存在：`index.html`、`404.html`、`rss.xml`、`sitemap.xml`、`robots.txt`、`data/latest.json`；
- 用 `du -sh out/_next/static` 或 `gzip -c` 对比首屏 JS 体积，设一个阈值防止回退；
- 用 Playwright + axe-core 对 `/`、`/projects/`、项目详情、`/articles/`、文章详情、`/settings/` 跑无障碍扫描（两个工具已在 `devDependencies` 中），只阻断 critical / serious；
- 用 Lighthouse CI 对首页和项目列表页设性能预算。

---

## 验收自查清单（P0）

构建完成后按此清单逐个勾选（`npx serve@14 out -l 3000` 预览后逐项检查）：

**内容与结构**

- [ ] 首屏展示姓名、职位、简介、头像、所在地 / 时区、社交链接，且**所有信息可在 `site.config.json` 中修改**
- [ ] 首页 Bento 三张轮播卡分别展示最新文章 / 项目 / 杂谈，可暂停、可点击指示点切换、可进入各自分类页
- [ ] 顶部主导航可在「文章 / 项目 / 杂谈」之间切换，三者各有独立列表与详情页（分类页内不重复放置同类切换控件）
- [ ] 项目列表可按技术栈（多选）、类型（开源 / 商业 / 实验）筛选，支持关键词搜索与排序，数量统计实时更新
- [ ] 筛选状态反映在 URL（`?tags=&kinds=&sort=&q=`），复制链接后在新的标签页打开能还原相同结果
- [ ] 项目详情包含：背景 / 解决的问题 / 技术选型 / 成果；指标标注来源与统计时间；Demo 与源码入口主次分明，无链接时给出明确说明
- [ ] 文章详情包含封面、正文、侧栏目录、推荐阅读与评论区（未配置时显示说明）
- [ ] 经历时间线按时间倒序，「至今」正确显示，可展开 / 收起
- [ ] 技术栈为文字标签，按组展示，有公开项目的标签可点击筛选
- [ ] 联系区可复制邮箱且有反馈，mailto 可用，不暴露精确地址（`hideExactAddress`）
- [ ] 杂谈列表与详情可用：卡片摘要、心情标签、上下则、侧栏推荐
- [ ] 搜索胶囊可检索三类内容，`⌘K` / `Ctrl+K` 聚焦，Esc 关闭
- [ ] 昼夜切换为平滑过渡（支持 View Transition 时圆形揭幕；「减少动态效果」下瞬时切换）
- [ ] 每个页面（首页除外的列表 / 详情 / 隐私 / 设置）都有「复制当前链接」，复制内容包含当前筛选参数
- [ ] 滚动一屏后出现「回到顶部」按钮并可正常回顶
- [ ] 页头放大镜按钮可向左展开胶囊搜索；`⌘K` 唤起、↑/↓ 选择、Enter 打开、Esc 收起且焦点回到按钮
- [ ] 项目页精选卡封面与右侧文字不重叠（封面限制在栅格列内）
- [ ] 文章正文有独立的阅读进度条（吸顶，0–100% 随滚动更新）
- [ ] 文章 / 项目 / 杂谈详情的上一篇、下一篇以卡片呈现，并带方向滑动转场
- [ ] 文章底部「相关项目」为卡片（封面 / 摘要 / 标签），不是纯文本行
- [ ] 技术栈标签在亮色下为深色文字浅灰底，计数以徽标呈现
- [ ] 设置页主题单选组可用方向键切换，且焦点跟随
- [ ] 邮件链接、社交链接、Demo 链接均可用且不在新窗口打开的链接上遗留 `window.opener`

**导航与 SEO**

- [ ] 所有页面可从导航（页头 / 页脚 / 面包屑）到达，无死链；404 页面存在且可返回
- [ ] 每个页面都有独立的 `<title>`、meta description、canonical、OG / Twitter 卡片
- [ ] `/sitemap.xml`、`/robots.txt`（禁止 `/settings/`）、`/rss.xml` 均可访问且使用真实域名
- [ ] RSS 为全文，不要求邮箱订阅；草稿文章不出现在 RSS / sitemap / 列表中

**主题、响应式与可访问性**

- [ ] 默认跟随系统深浅色（首帧即为正确主题，无「先亮后暗」闪烁），手动切换即时生效、不刷新、刷新后保持
- [ ] 360px 宽度下无横向滚动，卡片单列、导航可用
- [ ] 键盘 Tab 可完成主要操作，焦点始终可见；首帧 Tab 出现「跳到主要内容」
- [ ] 系统开启「减少动态效果」时页面无动画；禁用 JS 时项目和文章列表仍完整可见
- [ ] 表单控件都有 label，确认弹窗可 Esc 关闭且焦点返回

**性能**

- [ ] 首页首屏无第三方脚本请求（未启用评论时）
- [ ] 图片都有 `width` / `height` 或固定比例容器，无明显 CLS
- [ ] Lighthouse（移动端）性能 ≥ 90、无障碍 ≥ 95（建议值，按实际调整）

---

## 可替换假数据清单

以下文件**全部是示例内容**，部署前请逐项替换为你的真实信息：

| 文件                         | 需要替换的内容                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site.config.json`           | `url`（示例 `https://example.com`）、`title`、`description`、`author.name`（「煮雪话河山」）、`jobTitle`、`directionTags`、`tagline`、`typewriterText`、`bio`、`location.city` / `timezone` / `contactWindow` / `exactAddress`、`contact.email`（`hello@example.com`）、`contact.emailHref`、`socials[]`（`github.com/example`、掘金、知乎、X、LinkedIn 均为示例）、`rss.title` / `rss.description`、`giscus.*`、`analytics.endpoint` |
| `content/projects/*.md`      | 5 个项目示例：`lumen-ui`、`perf-lens`、`gradient-cursor`、`a11y-audit`、`ops-dashboard`——标题、摘要、指标、链接、许可证全部为虚构                                                                                                                                                                                                                                                                                                     |
| `content/articles/*.md`      | 3 篇示例文章：`lcp-from-4s-to-2s`、`ssg-vs-ssr-rethink`、`a11y-as-baseline`（正文中的项目与数据均为例示）                                                                                                                                                                                                                                                                                                                             |
| `content/chatters/*.md`      | 5 则示例杂谈（构建缓存、阅读笔记、升降桌、键盘走查、着色器），`mood` 与正文均为示例                                                                                                                                                                                                                                                                                                                                                   |
| `src/data/experience.json`   | 「示例科技（杭州）」「示例网络」「示例大学」及所有成就数据                                                                                                                                                                                                                                                                                                                                                                            |
| `src/data/skills.json`       | 示例技术栈分组                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `src/data/latest.json`       | `latestStatus` 文案、`items[]` 中指向示例文章 / 杂谈的条目                                                                                                                                                                                                                                                                                                                                                                            |
| `public/images/avatar.svg`   | 示例头像                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `public/images/covers/*.svg` | 示例封面（5 张项目 + 1 张文章封面 `article-ssg.svg` + 杂谈封面 `chatter.svg`）                                                                                                                                                                                                                                                                                                                                                        |
| `public/og/default.svg`      | 示例分享图（内含「煮雪话河山 · 前端工程师」文字，需重画或换成 PNG）                                                                                                                                                                                                                                                                                                                                                                   |
| `src/app/privacy/page.tsx`   | 「最近更新：2026-10-20」，以及若你更换了统计 / 评论方案时同步正文                                                                                                                                                                                                                                                                                                                                                                     |
| `src/app/articles/page.tsx`  | 文章列表页的描述文案（「关于前端性能、构建工具链与可访问性…」）                                                                                                                                                                                                                                                                                                                                                                       |
| `src/app/chatters/page.tsx`  | 杂谈列表页的描述文案                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/app/projects/page.tsx`  | 项目列表页的描述文案                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `src/app/settings/page.tsx`  | 设置页描述文案（一般无需修改）                                                                                                                                                                                                                                                                                                                                                                                                        |
| 各 JSON 的 `_comment` 字段   | 仅作提醒，`latest.json` / `skills.json` / `experience.json` 中都有，可保留或删除                                                                                                                                                                                                                                                                                                                                                      |

**最省事的做法**：先按上表替换 `site.config.json` 与三份 JSON，然后删掉 `content/` 下的示例，用 `pnpm new:project` / `pnpm new:article` 生成你自己的内容，最后替换 `public/` 下的图片。

---

## 设计取舍（与代码一致）

以下几处是与 PRD 示例文字不完全一致、但经过验证的选择，修改前请先了解原因：

| 现象                                      | 原因 / 位置                                                                                                                                                                   | 建议                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| 正文链接带 1px 细下划线                   | PRD 示例写「不加下划线」，但 PRD 同时要求「链接与周围文字有明确区分，不依赖颜色 alone」并通过 WCAG AA；axe 实测纯色链接会报 `link-in-text-block`（serious），因此保留细下划线 | 见 `src/styles/tokens.css` 中 `.prose-body a, .inline-link` |
| 筛选与排序更新 URL 时使用原生 History API | 若用 `router.push` 只改查询参数，Next 的客户端路由缓存会让「从详情返回列表」时显示旧顺序；改用 History API 后 `useSearchParams` 会立即响应，列表始终与 URL 一致               | 见 `src/components/ProjectFilters.tsx`                      |
| 项目筛选在禁用 JS 时不出现                | 筛选栏带 `.js-only`，脚本运行后由 `html[data-js="on"]` 显示；**项目卡片本身在服务端渲染完整列表**，所以无 JS 时仍能看到全部项目，只是没有筛选                                 | 正常行为（渐进增强）                                        |

---

## 常见问题

**构建后页面打不开 / 刷新 404？**
静态导出使用目录式 URL，托管方需要支持 `/xxx/` → `/xxx/index.html`。本地请用 `pnpm start`（即 `serve out`），不要用 `next start`。

**控制台出现 metadata 警告或 canonical 是 example.com？**
没改 `site.config.json` 的 `url`。改完重新构建。

**改了 `src/data/latest.json`，首页「刷新动态」还是旧数据？**
该文件被复制到 `out/data/latest.json`，需重新 `pnpm build`（或手动同步一次）。浏览器可能缓存，按钮已带时间戳参数绕过缓存。

**评论区一直是「评论区尚未启用」？**
`giscus.repo`、`repoId`、`categoryId` 没有全部填写，见 [评论配置](#评论giscus配置)。

**统计请求怎么没发出去？**
需要同时满足：访客在 `/settings/` 勾选同意，且 `analytics.endpoint` 非空。只填 endpoint 不会自动上报。

**文章写了不显示？**
检查 `draft: true`，以及 `slug` 是否填写。

**想加图片 / 表格 / 加粗以外的格式？**
当前 Markdown 渲染器非常精简，不支持图片和表格；可以扩展 `src/components/Markdown.tsx`，或在 front-matter 中用 `cover` 承载图片。

---

## License / Credits

- 本仓库模板的代码可自由用于你的个人主页；**示例文字、封面图和头像仅作演示**，替换为自有内容或取得授权后再发布。
- 第三方依赖遵循各自的许可证：Next.js（MIT）、React（MIT）、Tailwind CSS（MIT）、daisyUI（MIT）。
- 评论能力由 [Giscus](https://giscus.app/)（MIT，基于 GitHub Discussions）提供，仅在配置并触发加载时使用。
- 字体使用系统字体栈，不额外请求 Web 字体。
- 图标为项目内自绘的内联 SVG（`src/components/icons.tsx`）。

---

如有问题或建议，欢迎通过页面底部的邮箱联系作者。
