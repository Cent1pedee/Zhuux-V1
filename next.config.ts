import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 静态导出（SSG），配合 Vercel / 任意 CDN 部署，满足 PRD「HTML 服务端渲染或静态生成」
  output: "export",
  // 静态导出下使用目录形式的 url（/projects/foo/ → /projects/foo/index.html）
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
