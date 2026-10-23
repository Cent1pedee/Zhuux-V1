# BLOG

纯静态个人主页：**项目**、**文章**、**杂谈**三分类，毛玻璃视觉，明暗双主题。

- 构建产物是纯静态 HTML，可直接部署到任意静态托管 / CDN，无服务端、无数据库。
- 内容与代码分离：改 Markdown 与 JSON 即可更新站点。
- 默认零第三方请求：不配评论就不加载评论脚本，不配统计地址就不发送任何数据。

> ⚠️ 仓库内所有内容均为**示例假数据**（作者「煮雪话河山」、`hello@example.com`、`https://github.com/example` 等）。
> 部署前请对照 [可替换假数据清单](#可替换假数据清单) 逐项替换。

---

## 目录

- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [路由一览](#路由一览)
- [内容维护](#内容维护)
- [站点配置](#站点配置)
- [图片资源](#图片资源)
- [评论（Giscus）](#评论giscus)
- [统计与隐私](#统计与隐私)
- [部署](#部署)
- [验收清单](#验收清单)
- [可替换假数据清单](#可替换假数据清单)
- [常见问题](#常见问题)

---

## 快速开始

需要 **Node.js ≥ 18.18** 与 **pnpm**（版本见 `package.json` 的 `packageManager` 字段）。

```bash
pnpm install   # 安装依赖
pnpm dev       # 开发服务器 http://localhost:3000
pnpm build     # 静态导出到 out/
pnpm start     # 本地预览 out/  http://localhost:3000
```

| 命令               | 作用                                                         |
| ------------------ | ------------------------------------------------------------ |
| `pnpm dev`         | 开发服务器（Turbopack）                                      |
| `pnpm build`       | 构建静态站点到 `out/`，并把 `latest.json` 复制到 `out/data/` |
| `pnpm start`       | 用 `serve` 预览 `out/`（首次运行会下载 `serve@14`）          |
| `pnpm new:project` | 新建项目 Markdown                                            |
| `pnpm new:article` | 新建文章 Markdown（默认草稿）                                |
| `pnpm new:chatter` | 新建杂谈 Markdown（默认草稿）                                |

> - 构建会清空 `out/`，**只会由 `pnpm build` 产出**，不要手工往里补文件。
> - 静态导出没有服务端，构建后别用 `next start`，请用 `pnpm start`。

技术栈：Next.js 15（App Router，`output: "export"`）· React 19 · Tailwind CSS 4 · daisyUI 5 · TypeScript（`strict`）。
运行时依赖只有 `next`、`react`、`react-dom`；内容解析与 Markdown 渲染都是自写的零依赖实现。

---

## 目录结构

```text
.
├── site.config.json        # 站点身份、联系方式、社交链接、统计、评论、第三方服务清单
├── next.config.ts          # 静态导出等构建配置
├── content/
│   ├── projects/*.md       # 项目
│   ├── articles/*.md       # 文章（draft: true 不发布）
│   └── chatters/*.md       # 杂谈（短记录）
├── public/
│   ├── images/avatar.svg   # 头像
│   ├── images/covers/      # 项目 / 文章 / 杂谈封面（1000×400）
│   └── og/default.svg      # 默认社交分享图（1200×630）
├── scripts/                # 新建内容与构建后处理的脚本
└── src/
    ├── app/                # 页面与路由（见「路由一览」）
    ├── components/         # UI 组件
    ├── content/            # 读取 content/ 的解析与排序
    ├── data/               # 经历、技术栈、最近动态（JSON）
    ├── lib/                # site / seo / analytics / storage / search-index 等工具
    └── styles/             # tokens / background / components / pages / bento / motion
```

---

## 路由一览

| 路径                | 说明                                           |
| ------------------- | ---------------------------------------------- |
| `/`                 | 首页                                           |
| `/projects/`        | 项目列表；`?tags=`、`?kinds=`、`?sort=`、`?q=` |
| `/projects/<slug>/` | 项目详情                                       |
| `/articles/`        | 文章列表；`?tag=`                              |
| `/articles/<slug>/` | 文章详情 + 目录 + 评论                         |
| `/chatters/`        | 杂谈列表                                       |
| `/chatters/<slug>/` | 杂谈详情                                       |
| `/privacy/`         | 隐私政策                                       |
| `/settings/`        | 偏好设置（`robots.txt` 中禁止收录）            |
| `/rss.xml`          | 全文 RSS（仅文章）                             |
| `/sitemap.xml`      | 站点地图                                       |
| `/robots.txt`       | 爬虫规则                                       |
| 其他                | `404.html`                                     |

页面只导出 `content/` 中存在的 slug，其余路径落到 404。详情页的「返回」会带上原列表的筛选参数。

---

## 内容维护

### 新建内容

```bash
pnpm new:project -- perf-budget "性能预算守门员" open-source   # 类型：open-source | commercial | experiment
pnpm new:article -- my-first-post "我的第一篇技术文章"          # 默认 draft: true
pnpm new:chatter -- build-cache "把构建缓存命中率拉到 91%"      # 默认 draft: true
```

脚本会生成对应 Markdown 文件（`date` 取当日），文件已存在时报错退出。**发布草稿**：把 `draft` 改成 `false` 后重新 `pnpm build`。

### 项目 `content/projects/*.md`

| 字段                  | 必填   | 说明                                                                                       |
| --------------------- | ------ | ------------------------------------------------------------------------------------------ |
| `slug`                | ✅     | 唯一标识，决定 URL `/projects/<slug>/`                                                     |
| `title`               | 建议   | 缺省回退为 `slug`                                                                          |
| `date`                | 建议   | `YYYY-MM-DD`，列表排序与 sitemap 使用                                                      |
| `summary`             | 建议   | 一句话描述，用于卡片与 meta description                                                    |
| `priority`            | 否     | 同一天内的排序权重，默认 `0`                                                               |
| `kind` / `kinds`      | 二选一 | 单类型 `kind` 或数组 `kinds`（后者优先），取值 `open-source` / `commercial` / `experiment` |
| `tags`                | 否     | 技术栈标签，用于筛选与相关推荐                                                             |
| `cover` / `coverAlt`  | 建议   | 封面路径（如 `/images/covers/<slug>.svg`）与替代文本                                       |
| `demoUrl` / `repoUrl` | 否     | 留空 `""` 表示没有；点按钮会给出说明，不会是死链                                           |
| `license`             | 否     | 许可证文字，进入 JSON-LD                                                                   |
| `status`              | 否     | `released` / `maintained` / `archived`                                                     |
| `techChoices`         | 否     | 技术选型说明列表                                                                           |
| `highlights`          | 否     | 可核验指标，见下方语法                                                                     |
| `relatedSkills`       | 否     | 相关技能标签                                                                               |
| `relatedArticles`     | 否     | 关联文章 slug 列表                                                                         |
| 正文                  | 建议   | Markdown，按 `##` / `###` 生成小节                                                         |

**指标 `highlights`**（一行一条，字段用 `|` 分隔，**不要加引号**）：

```yaml
highlights:
    - label=首屏 gzip 体积 | value=18KB | source=基于 vite build 产物体积统计 | measuredAt=2026-09-20
```

`label` 或 `value` 至少一个非空才会展示；`source` 与 `measuredAt` 用于标注来源与统计时间——无法核验的数字不要当作成果。

### 文章 `content/articles/*.md`

| 字段                 | 必填 | 说明                                      |
| -------------------- | ---- | ----------------------------------------- |
| `slug`               | ✅   | 唯一标识，URL 为 `/articles/<slug>/`      |
| `title`              | 建议 | 缺省回退为 `slug`                         |
| `date`               | 建议 | `YYYY-MM-DD`，用于排序、RSS、sitemap      |
| `draft`              | 否   | `true` 时整篇不进列表、详情、RSS、sitemap |
| `tags`               | 否   | 标签筛选与 RSS `<category>`               |
| `summary`            | 建议 | 摘要，用于列表与 meta description         |
| `cover` / `coverAlt` | 建议 | 封面与替代文本                            |
| `relatedProjects`    | 否   | 关联项目 slug，文章底部展示「相关项目」   |
| 正文                 | ✅   | Markdown，按 `##` / `###` 生成目录        |

### 杂谈 `content/chatters/*.md`

杂谈是更短的记录（工具链小发现、阅读笔记、生活片段），**不进入 RSS**。

| 字段    | 必填 | 说明                              |
| ------- | ---- | --------------------------------- |
| `slug`  | ✅   | URL 为 `/chatters/<slug>/`        |
| `title` | 建议 | 卡片与详情页标题                  |
| `date`  | 建议 | `YYYY-MM-DD`                      |
| `mood`  | 否   | 心情 / 场景标签，显示在卡片底部   |
| `tags`  | 否   | 标签                              |
| `draft` | 否   | `true` 时不进列表、详情与 sitemap |
| 正文    | ✅   | Markdown                          |

摘要会自动去掉与标题重复的开头，所以正文第一句重复标题不会在卡片里出现两遍。

### 支持的 Markdown 语法

`##` / `###` 标题、段落、无序与有序列表、引用、围栏代码块、行内代码、`**加粗**`、`[链接](https://…)`（外链自动加 `rel="noopener noreferrer"`）。

不支持：图片 `![]()`、表格、HTML 标签（会被转义）。正文需要配图时请写在 front-matter 的 `cover` 里。

### 经历 / 技术栈 / 最近动态

- `src/data/experience.json`：`type`（`work` / `education`）、`org`、`role`、`start`（`YYYY-MM`）、`end`（`null` 显示「至今」）、`summary`、`achievements[]`。按数组顺序展示，请自行倒序排列。
- `src/data/skills.json`：`{ "skills": [{ "group": "语言", "items": ["TypeScript", …] }] }`。若某项技术与项目的 `tags` 重合，会变成可点击的筛选入口并显示匹配项目数。
- `src/data/latest.json`：`latestStatus`（当前状态文案与日期）、`items[]`（`type`、`title`、`href`、`date`）、可选 `source.label`。
  首页「刷新动态」按钮会 `fetch("/data/latest.json")`，该文件由 `pnpm build` 复制到 `out/data/latest.json`——**只改 `src/` 下这份**。

---

## 站点配置

全站唯一数据源是 `site.config.json`（`src/lib/site.ts` 读取；`url` 不以 `http` 开头会直接报错）。

| 字段                    | 说明                                                                 |
| ----------------------- | -------------------------------------------------------------------- |
| `url`                   | **部署前必须改成真实域名**，驱动 canonical、OG、sitemap、RSS、robots |
| `title` / `description` | 全站标题 / 描述                                                      |
| `defaultTheme`          | 初始主题：`system` / `light` / `dark`                                |
| `author.*`              | 姓名、职位、方向标签、一句话简介、打字机文案、长简介、头像           |
| `location.*`            | 城市、时区、联系时间段、是否隐藏精确地址                             |
| `contact.*`             | 邮箱、复制成功提示、`mailto:` 链接                                   |
| `socials[]`             | `kind`、`label`、`href`、`event`                                     |
| `analytics.*`           | 统计上报地址与开关，见 [统计与隐私](#统计与隐私)                     |
| `giscus.*`              | 评论配置，见 [评论（Giscus）](#评论giscus)                           |
| `rss.*`                 | RSS 频道标题 / 描述                                                  |
| `thirdPartyServices[]`  | 隐私政策页的第三方服务清单                                           |
| `backdrop.wallpaper`    | 可选背景墙纸图片路径，留空只用渐变                                   |

---

## 图片资源

| 文件                       | 用途            | 约定                                                      |
| -------------------------- | --------------- | --------------------------------------------------------- |
| `public/images/avatar.svg` | 头像            | 正方形；换图后同步 `author.avatar` 的 `src` / 宽高        |
| `public/images/covers/*`   | 项目 / 文章封面 | **1000×400（5:2）**，与容器比例一致可避免布局偏移         |
| `public/og/default.svg`    | 社交分享图      | **1200×630**；部分平台不抓取 SVG，建议导出 PNG 后替换引用 |

图片是静态直出的（`images.unoptimized: true`），Next 不会自动转格式。需要 WebP / AVIF 时自行导出后替换路径：

```bash
cwebp -q 80 cover.png -o cover.webp
avifenc --min 1 --max 40 -s 4 cover.png cover.avif
```

---

## 评论（Giscus）

评论基于 GitHub Discussions，**懒加载**：滚动到评论区附近或点击「加载评论区」后才注入脚本，不阻塞首屏；加载失败或超时会提示并可重试。未配置时显示「评论区尚未启用」。

启用步骤：

1. 准备一个**公开**仓库，安装 [giscus app](https://github.com/apps/giscus) 并开启 Discussions。
2. 在仓库里新建一个分类（如 `Announcements`）。
3. 打开 <https://giscus.app/zh-CN>，填入仓库与分类，复制生成的配置。
4. 把 `repo`、`repoId`、`categoryId` 填进 `site.config.json` 的 `giscus` —— **三者都非空才会启用**。

主题切换会通过 `postMessage` 同步已加载的 iframe；评论数据由 GitHub 处理，隐私政策页已列入第三方服务清单。

---

## 统计与隐私

**默认不采集、不上报**：交互事件只写入当前标签页的 `sessionStorage`（最多 50 条）。只有同时满足以下两点才会发送——① 访客在 `/settings/` 勾选同意，② `site.config.json` 的 `analytics.endpoint` 非空。

发送方式为 `navigator.sendBeacon`（降级 `fetch keepalive`），请求体：

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

事件清单：`page_view`、`project_link_click`、`social_click`、`contact_click`、`theme_change`（定义在 `src/lib/analytics.ts`）。

`analytics.endpoint` 可指向任何接受 `POST` JSON 的地址，本项目不内置服务端。

### 本地存储

| 键                  | 位置           | 用途               |
| ------------------- | -------------- | ------------------ |
| `theme`             | localStorage   | 手动选择的主题     |
| `analytics-consent` | localStorage   | 统计同意状态       |
| `analytics-log`     | sessionStorage | 本次会话的事件记录 |
| `projects-filter`   | localStorage   | 项目列表的筛选状态 |

「恢复默认设置」会清空以上全部键并回到「跟随系统」。隐私政策页内容在 `src/app/privacy/page.tsx`；**新增任何第三方服务**（字体 CDN、统计 SDK、视频嵌入等）时，请同步更新 `thirdPartyServices` 与隐私政策正文。

---

## 部署

产物在 `out/`，是纯静态文件。托管方需要把 `/projects/foo/` 映射到 `/projects/foo/index.html`（`trailingSlash: true`），并把未知路径返回 `404.html`。

```bash
pnpm install --frozen-lockfile
pnpm build
# 上传整个 out/ 目录
```

| 平台                       | 要点                                                                       |
| -------------------------- | -------------------------------------------------------------------------- |
| Vercel                     | 导入仓库，Framework 选 Next.js，构建命令 `pnpm build`，输出目录 `out`      |
| Cloudflare Pages / Netlify | Build command `pnpm build`，Publish directory `out`                        |
| GitHub Pages               | 仓库不在域名根路径时需配 `basePath` / `assetPrefix`，并让 `url` 带上子路径 |
| 自有 Nginx                 | `try_files $uri $uri/ $uri.html =404;`，`error_page 404 /404.html;`        |

构建命令不要删掉 `&& node scripts/publish-data.mjs`，否则首页「刷新动态」会 404。

上线后请确认：`site.config.json` 的 `url` 已改成真实域名，`/sitemap.xml`、`/robots.txt`、`/rss.xml` 均返回 200 且域名正确。

---

## 验收清单

构建完成后可按下表逐项自查：

**内容与交互**

- [ ] 首屏展示姓名、职位、简介、头像、所在地 / 时区、社交链接，且全部来自 `site.config.json`
- [ ] 顶部导航可在「项目 / 文章 / 杂谈」之间切换，三者各有独立列表与详情页
- [ ] 项目列表可按技术栈、类型筛选，支持搜索与排序，数量实时更新
- [ ] 筛选状态反映在 URL，复制链接到新标签页能还原相同结果
- [ ] 项目详情的指标标注来源与统计时间；无 Demo / 源码链接时给出说明而不是死按钮
- [ ] 文章详情含封面、目录、相关项目、上下篇与评论区
- [ ] 每页都能「复制当前链接」，复制内容包含筛选参数
- [ ] 邮箱可复制且有反馈，`hideExactAddress` 生效
- [ ] 搜索支持 `⌘K` / `Ctrl+K` 唤起、↑↓ 选择、Esc 关闭

**主题与无障碍**

- [ ] 默认跟随系统，首帧即为正确主题，无「先亮后暗」闪烁
- [ ] 360px 宽度下无横向滚动
- [ ] 键盘 Tab 可完成主要操作，焦点始终可见，首帧可「跳到主要内容」
- [ ] 系统开启「减少动态效果」时无动画；禁用 JS 时列表仍完整可见
- [ ] 确认弹窗可 Esc 关闭且焦点返回触发按钮

**SEO 与性能**

- [ ] 每页有独立 `<title>`、description、canonical、OG / Twitter 卡片
- [ ] 草稿不出现在列表、RSS、sitemap 中；`/settings/` 不被收录
- [ ] 图片有宽高或固定比例容器，无明显 CLS
- [ ] 首页首屏无第三方脚本请求（未启用评论时）

---

## 可替换假数据清单

以下文件**全部是示例内容**，部署前请逐项替换：

| 文件                          | 需要替换的内容                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------ |
| `site.config.json`            | `url`、`title`、`description`、`author.*`、`location.*`、`contact.*`、`socials[]`、`rss.*` |
| `content/projects/*.md`       | 5 个示例项目，标题、摘要、指标、链接、许可证均为虚构                                       |
| `content/articles/*.md`       | 3 篇示例文章                                                                               |
| `content/chatters/*.md`       | 5 则示例杂谈                                                                               |
| `src/data/experience.json`    | 「示例科技」「示例网络」「示例大学」及所有成就                                             |
| `src/data/skills.json`        | 示例技术栈分组                                                                             |
| `src/data/latest.json`        | 当前状态文案与动态条目                                                                     |
| `public/images/avatar.svg` 等 | 头像、封面、分享图                                                                         |
| 各列表页 `page.tsx`           | 项目 / 文章 / 杂谈列表页的引导文案                                                         |

最省事的做法：先改 `site.config.json` 与三份 JSON，再删掉 `content/` 下的示例内容、用脚本生成你自己的，最后替换 `public/` 下的图片。

---

## 常见问题

**构建后页面打不开、刷新 404？**
静态导出用目录式 URL，托管方需支持 `/xxx/` → `/xxx/index.html`。本地请用 `pnpm start`，不要用 `next start`。

**canonical 还是 example.com？**
`site.config.json` 的 `url` 没改，改完重新构建。

**改了 `latest.json`，首页「刷新动态」还是旧数据？**
需要重新 `pnpm build` 才会复制到 `out/data/`。

**评论区一直显示「评论区尚未启用」？**
`giscus.repo`、`repoId`、`categoryId` 没有全部填写。

**统计请求没发出去？**
需同时满足「访客同意」与「`analytics.endpoint` 非空」，只填地址不会自动上报。

**文章写了不显示？**
检查 `draft` 是否为 `true`，以及 `slug` 是否填写。

**需要更多 Markdown 语法？**
扩展 `src/components/Markdown.tsx`；正文配图请用 front-matter 的 `cover`。

---

## License

代码可自由用于你的个人主页；**示例文字、封面与头像仅作演示**，请替换为自有内容或取得授权后再发布。
第三方依赖遵循各自许可证：Next.js、React、Tailwind CSS、daisyUI（均为 MIT）；评论由 [Giscus](https://giscus.app/) 提供。字体使用系统字体栈，图标为项目内自绘 SVG。
