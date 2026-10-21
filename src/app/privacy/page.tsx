import type { Metadata } from "next";
import Link from "next/link";
import { getSiteConfig } from "@/lib/site";
import { breadcrumbJsonLd, buildMetadata, JsonLd } from "@/lib/seo";
import { CatalogHeader } from "@/components/CatalogHeader";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = buildMetadata({
  title: "隐私政策",
  description: "本站收集哪些数据、用途、保留期限，以及第三方服务（Giscus 评论、访问统计）清单。",
  path: "/privacy/",
});

const ROWS = [
  { key: "name", label: "服务" },
  { key: "purpose", label: "用途" },
  { key: "data", label: "处理的数据" },
  { key: "loading", label: "加载方式" },
] as const;

export default function PrivacyPage() {
  const site = getSiteConfig();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "首页", path: "/" },
          { name: "隐私政策", path: "/privacy/" },
        ])}
      />
      <div className="page-shell">
        <Breadcrumbs items={[{ label: "首页", href: "/" }, { label: "隐私政策" }]} />
        <CatalogHeader
          kicker="PRIVACY · 隐私"
          title="隐私政策"
          titleId="privacy-title"
          description="本站收集哪些数据、用途与保留期限，以及第三方服务清单。"
          actions={<CopyLinkButton label="复制本页链接" />}
        />
        <article className="card-surface glass-article legal" aria-labelledby="privacy-title">
        <div className="legal-layout">
          <nav aria-label="本页目录" className="toc legal-toc">
            <p className="mb-2 text-xs subtle">本页目录</p>
            <ul className="toc-list">
              <li><a href="#what-we-collect" className="toc-link">01 · 我们收集哪些数据</a></li>
              <li><a href="#how-we-use" className="toc-link">02 · 数据用途与保留期限</a></li>
              <li><a href="#storage" className="toc-link">03 · 存储在你设备上的数据</a></li>
              <li><a href="#third-party" className="toc-link">04 · 第三方服务清单</a></li>
              <li><a href="#rights" className="toc-link">05 · 你的权利</a></li>
              <li><a href="#copyright" className="toc-link">06 · 版权与署名</a></li>
              <li><a href="#changes" className="toc-link">07 · 政策更新</a></li>
            </ul>
          </nav>
          <div>
        <p className="legal-lead">
          本站是一个个人技术主页，目标是让访客了解作者的技术方向与联系方式。本站遵循「个人信息最小化」原则：不要求注册，也不收集访客姓名、
          邮箱、位置等非必要信息。如有疑问，请发送邮件至{" "}
          <a href={site.contact.emailHref} className="inline-link font-mono">
            {site.contact.email}
          </a>
          。
        </p>

        <div className="legal-body">
          <h2 id="what-we-collect"><span className="legal-index" aria-hidden="true">01</span><span>我们收集哪些数据</span></h2>
          <ul>
            <li>页面浏览与交互事件（如点击项目链接、社交链接、联系入口、主题切换）的聚合统计。</li>
            <li>访客在留言区主动提交的评论内容（仅在你使用 GitHub 登录并主动发表时产生）。</li>
            <li>不会收集：你的姓名、邮箱、精确位置、设备指纹，也不会做跨站追踪。</li>
          </ul>

          <h2 id="how-we-use"><span className="legal-index" aria-hidden="true">02</span><span>数据用途与保留期限</span></h2>
          <ul>
            <li>用途：了解哪些内容对访客有帮助，用于改进内容结构与质量。</li>
            <li>
              保留期限：交互事件默认只保存在当前浏览器会话（sessionStorage），关闭标签页即清除；只有在你明确同意并填写统计上报地址时才会发送，
              服务器端只保留聚合数据，不长期保存原始访问日志。
            </li>
            <li>本站不设置任何营销 Cookie，也不加载广告脚本。</li>
          </ul>

          <h2 id="storage"><span className="legal-index" aria-hidden="true">03</span><span>存储在你设备上的数据</span></h2>
          <ul>
            <li>
              主题偏好（localStorage：<code>theme</code>）：记住你在亮色 / 暗色 / 跟随系统之间的选择。
            </li>
            <li>
              统计数据同意状态（localStorage：<code>analytics-consent</code>）：记住你是否同意发送统计数据。
            </li>
            <li>
              当前会话的事件记录（sessionStorage：<code>analytics-log</code>）：会话结束即清除。
            </li>
          </ul>
          <p>
            本站不使用 Cookie，也不保存其他浏览记录。浏览器自身的「前进 / 后退」缓存（bfcache）可能保留页面状态，这由你的浏览器管理。
          </p>
          <p>
            你可以随时在{" "}
            <Link href="/settings/" className="inline-link">
              偏好设置
            </Link>{" "}
            中撤回同意、清除本地记录或恢复默认设置。
          </p>

          <h2 id="third-party"><span className="legal-index" aria-hidden="true">04</span><span>第三方服务清单</span></h2>
          <p>以下为本站可能加载的第三方服务；所有脚本均为延迟或异步加载，不会阻塞首屏渲染。</p>
        </div>

        <div className="scroll-table legal-table" tabIndex={0} role="region" aria-label="第三方服务清单，可横向滚动">
          <table className="privacy-table">
            <caption className="visually-hidden">第三方服务清单（含是否需要在偏好设置中同意）</caption>
            <thead>
              <tr>
                {ROWS.map((row) => (
                  <th key={row.key} scope="col">
                    {row.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {site.thirdPartyServices.map((service) => (
                <tr key={service.name}>
                  <th scope="row" data-label="服务">
                    {service.name}
                    {service.consentRequired ? (
                      <>
                        <br />
                        <span className="status-pill" data-tone="info" style={{ marginTop: 6 }}>
                          需同意
                        </span>
                      </>
                    ) : null}
                  </th>
                  <td data-label="用途">{service.purpose}</td>
                  <td data-label="处理的数据">{service.data}</td>
                  <td data-label="加载方式">{service.loading}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="legal-body">
          <h2 id="rights"><span className="legal-index" aria-hidden="true">05</span><span>你的权利</span></h2>
          <ul>
            <li>撤回同意：在偏好设置中关闭数据统计，此后不会再发送任何统计请求。</li>
            <li>删除数据：清除浏览器中本域名的存储即可删除全部本地数据。</li>
            <li>评论数据由 GitHub 保管，你可以自行编辑或删除评论，并适用 GitHub 的隐私政策。</li>
          </ul>

          <h2 id="copyright"><span className="legal-index" aria-hidden="true">06</span><span>版权与署名</span></h2>
          <ul>
            <li>本站文字与图片内容版权归作者所有，转载请联系作者。</li>
            <li>开源项目的许可证信息在每个项目详情页中标注（如 MIT、Apache-2.0）。</li>
            <li>第三方图标来自通用图标集，按原许可证使用。</li>
          </ul>

          <h2 id="changes"><span className="legal-index" aria-hidden="true">07</span><span>政策更新</span></h2>
          <p>本政策如有调整，会更新本页内容并注明更新时间。最近更新：2026-10-20。</p>
        </div>
          </div>
        </div>
        </article>
      </div>
    </>
  );
}
