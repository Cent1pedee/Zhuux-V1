import Link from "next/link";
import type { Article } from "@/content/types";
import { formatDate } from "@/lib/format";
import { ArrowRightIcon } from "./icons";

/** 文章卡片：清单页与标签筛选共用 */
export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="card-surface article-card" data-interactive="true">
      <Link href={`/articles/${article.slug}/`} className="flex flex-1 flex-col" style={{ color: "inherit", textDecoration: "none" }}>
        <div className="article-card-cover">
          <img src={article.cover} alt={article.coverAlt} width={1000} height={400} loading="lazy" decoding="async" />
        </div>
        <div className="article-card-body">
          <h3 className="article-card-title">{article.title}</h3>
          <p
            className="text-sm"
            style={{
              color: "var(--text-muted)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.summary}
          </p>
          <div className="article-card-meta">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.tags.slice(0, 2).map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
            <ArrowRightIcon width={14} height={14} className="ml-auto" />
          </div>
        </div>
      </Link>
    </article>
  );
}
