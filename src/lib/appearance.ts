import fs from "node:fs";
import path from "node:path";

/**
 * 站点外观配置（与站点的身份/内容分离）。
 * - backdrop.wallpaper：背景墙纸图片路径（放在 public/ 下，如 "/images/wallpaper.jpg"）；
 *   留空则只显示柔光渐变背景。
 */
export interface AppearanceConfig {
  backdrop: {
    wallpaper: string;
  };
}

const FILE = path.join(process.cwd(), "site.config.json");

let cache: AppearanceConfig | null = null;

export function getAppearance(): AppearanceConfig {
  if (cache) return cache;
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<AppearanceConfig>;
    cache = { backdrop: { wallpaper: raw.backdrop?.wallpaper ?? "" } };
  } catch {
    cache = { backdrop: { wallpaper: "" } };
  }
  return cache;
}
