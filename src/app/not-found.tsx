import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell">
      <section className="notfound" aria-labelledby="notfound-title">
        <div>
          <span className="section-kicker justify-center">404 · NOT FOUND</span>
          <p className="notfound-code mt-2" aria-hidden="true">
            404
          </p>
          <h1 id="notfound-title" className="mt-4">
            页面走丢了
          </h1>
          <p className="mx-auto mt-3 max-w-[26em] text-sm" style={{ color: "var(--text-muted)" }}>
            你访问的地址可能已被移动或删除。可以从下面的入口继续浏览。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary-solid">
              返回首页
            </Link>
            <Link href="/projects/" className="btn-outline-primary">
              查看项目
            </Link>
            <Link href="/articles/" className="btn-outline-primary">
              阅读文章
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
