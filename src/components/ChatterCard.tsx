import Link from "next/link";
import type { Chatter } from "@/content/chatters";
import { formatDate } from "@/lib/format";
import { ArrowRightIcon } from "./icons";

/** 杂谈卡片：瀑布流列表使用，标题 + 摘要 + 日期 / 心情 */
export function ChatterCard({ chatter, excerpt }: { chatter: Chatter; excerpt: string }) {
  return (
    <article className="card-surface chatter-card" data-interactive="true">
      <Link href={`/chatters/${chatter.slug}/`} className="chatter-card-link">
        {/* 标题与正文分成两个文本块：原先同字号同字体挤在一段里，扫描时找不到入口 */}
        {chatter.title ? <h3 className="chatter-title">{chatter.title}</h3> : null}
        <p className="chatter-excerpt">{excerpt}</p>
        <div className="chatter-foot">
          <time dateTime={chatter.date}>{formatDate(chatter.date)}</time>
          <span className="chatter-meta-end">
            {chatter.mood ? <span className="chip">{chatter.mood}</span> : null}
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </Link>
    </article>
  );
}
