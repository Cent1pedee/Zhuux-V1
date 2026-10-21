#!/usr/bin/env node
/**
 * 构建后处理：把 src/data/latest.json 复制为 out/data/latest.json，
 * 供首页「最近动态」的「刷新」按钮通过 fetch 读取（静态导出目录 out/ 中默认没有 src 目录）。
 *
 * 用法：node scripts/publish-data.mjs（已在 npm run build 中自动执行）
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const source = path.join(root, "src", "data", "latest.json");
const outDir = path.join(root, "out", "data");
const target = path.join(outDir, "latest.json");

if (!fs.existsSync(source)) {
  console.warn("[publish-data] 未找到 src/data/latest.json，跳过");
  process.exit(0);
}

fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(source, target);
console.log(`[publish-data] 已发布 ${path.relative(root, target)}`);
