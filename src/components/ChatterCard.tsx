import Link from "next/link";
import type { Chatter } from "@/content/chatters";
import { formatDate } from "@/lib/format";
import { ArrowRightIcon } from "./icons";

/** 杂谈卡片：瀑布流列表使用，标题 + 摘要 + 日期 / 心情 */
export function ChatterCard({ chatter, excerpt }: { chatter: Chatter; excerpt: string }) {
  return (
    <article className="card-surface chatter-card" data-interactive="true">
      <Link href={`/chatters/${chatter.slug}/`} className="chatter-card-link" style={{ color: "inherit", textDecoration: "none" }}>
        <p className="chatter-quote">
          {chatter.title ? <strong className="block font-semibold">{chatter.title}</strong> : null}
          {excerpt}
        </p>
        <div className="chatter-foot">
          <time dateTime={chatter.date}>{formatDate(chatter.date)}</time>
          <span className="flex items-center gap-2">
            {chatter.mood ? <span className="chip">{chatter.mood}</span> : null}
            <ArrowRightIcon width={14} height={14} />
          </span>
        </div>
      </Link>
    </article>
  );
}
