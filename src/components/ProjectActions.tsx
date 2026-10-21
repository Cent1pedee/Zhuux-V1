"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ExternalLinkButton } from "./actions";
import { InlineNotice } from "./InlineNotice";

type Notice = { tone: "info" | "warning"; text: string } | null;

interface ActionProps {
  slug: string;
  title: string;
  demoUrl: string;
  repoUrl: string;
  license: string;
}

/**
 * 项目详情页的「Demo / 源码」入口。
 * - 有链接：主按钮「在线 Demo」（主色填充）+ 次按钮「查看源码」（描边），外链带 rel="noopener noreferrer"
 * - 无链接：按钮依然可操作，点击后给出明确说明（不存在死按钮，也不会指向无效地址）
 * - 从筛选后的列表进入时（URL 带 ?list=…），额外提供「返回并保留筛选条件」
 */
export function ProjectActions(props: ActionProps) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-wrap items-center gap-3" style={{ minHeight: 44 }}>
          <Link href="/projects/" className="btn-text">
            ← 返回项目列表
          </Link>
        </div>
      }
    >
      <ProjectActionsInner {...props} />
    </Suspense>
  );
}

function ProjectActionsInner({ slug, title, demoUrl, repoUrl, license }: ActionProps) {
  const searchParams = useSearchParams();
  const listQuery = searchParams.get("list");
  const [notice, setNotice] = useState<Notice>(null);

  const returnHref = listQuery ? `/projects/?${listQuery}` : "/projects/";

  return (
    <section aria-labelledby="project-actions-title" className="project-actions">
      <h2 id="project-actions-title" className="visually-hidden">
        在线演示与源码
      </h2>
      <div className="project-actions-row">
        {demoUrl ? (
          <ExternalLinkButton
            href={demoUrl}
            variant="primary"
            eventName="project_link_click"
            eventMeta={{ slug, target: "demo" }}
            ariaLabel={`在线体验 ${title} 的 Demo（在新标签页打开）`}
          >
            在线 Demo
          </ExternalLinkButton>
        ) : (
          <button
            type="button"
            className="btn-outline-primary"
            aria-describedby="project-actions-demo-hint"
            onClick={() =>
              setNotice({
                tone: "info",
                text: `「${title}」目前没有部署在线演示环境。你可以前往 GitHub 仓库查看源码，或直接发邮件联系作者获取演示。`,
              })
            }
          >
            暂无在线 Demo
          </button>
        )}

        {repoUrl ? (
          <ExternalLinkButton
            href={repoUrl}
            variant="outline"
            eventName="project_link_click"
            eventMeta={{ slug, target: "repo" }}
            ariaLabel={`查看 ${title} 的 GitHub 仓库（在新标签页打开）`}
          >
            查看源码
          </ExternalLinkButton>
        ) : (
          <button
            type="button"
            className="btn-outline-primary"
            onClick={() =>
              setNotice({
                tone: "info",
                text: `「${title}」为商业项目，源码归属公司，未对外公开。许可证：${license}。`,
              })
            }
          >
            源码未公开
          </button>
        )}

        <Link href={returnHref} className="btn-text" prefetch={false}>
          ← 返回项目列表{listQuery ? "（保留筛选）" : ""}
        </Link>
      </div>

      <p id="project-actions-demo-hint" className="visually-hidden">
        若该项目没有在线 Demo，点击按钮会显示说明信息。
      </p>

      {notice ? (
        <div className="mt-3">
          <InlineNotice tone={notice.tone} onDismiss={() => setNotice(null)}>
            {notice.text}
          </InlineNotice>
        </div>
      ) : null}

      {license ? <p className="mt-3 text-xs subtle">许可证：{license}</p> : null}
    </section>
  );
}
