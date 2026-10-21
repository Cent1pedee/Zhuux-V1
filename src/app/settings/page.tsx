import type { Metadata } from "next";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { SettingsPanel } from "@/components/SettingsPanel";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";

/*
 * 设置页虽然已在 robots.txt 中 Disallow，但这里仍保持可索引：
 * 搜索引擎需要先抓取页面才能看到 noindex；且被 robots.txt 拦截的 URL
 * 若出现在外链中，可能以「无描述」形式被收录。工具页本身无敏感内容。
 */
export const metadata: Metadata = buildMetadata({
  title: "偏好设置",
  description: "管理明暗主题、数据统计同意状态，并查看或清除本机保存的偏好与统计数据。",
  path: "/settings/",
});

export default function SettingsPage() {
  const site = getSiteConfig();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: "偏好设置", path: "/settings/" },
        ])}
      />
      <div className="page-shell">
        <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "偏好设置" }]} />
        <CatalogHeader
          kicker="SETTINGS · 设置"
          title="偏好设置"
          titleId="settings-title"
          description="这里的所有设置都只保存在你的浏览器中，不会被上传。你可以随时撤回统计同意或清除记录。"
          actions={<CopyLinkButton label="复制本页链接" />}
        />
        <SettingsPanel analyticsEndpoint={site.analytics.endpoint} />
      </div>
    </>
  );
}
