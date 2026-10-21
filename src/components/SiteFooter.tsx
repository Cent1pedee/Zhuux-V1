import Link from "next/link";
import { MailIcon, RssIcon } from "./icons";

interface SiteFooterProps {
  emailHref: string;
  email: string;
  name: string;
  year: number;
}

/** 页脚：玻璃条；邮箱、RSS、隐私与设置入口均在 2 次点击内可达 */
export function SiteFooter({ emailHref, email, name, year }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="wide-wrap site-footer-inner">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold">
              {name}
              <span className="subtle font-normal"> · 技术型个人主页</span>
            </p>
            <a href={emailHref} className="mail-link inline-flex min-h-11 items-center gap-2 font-mono text-sm">
              <MailIcon width={16} height={16} />
              {email}
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/rss.xml" className="btn-outline-primary btn-sm">
              <RssIcon width={15} height={15} />
              订阅 RSS
            </a>
            <Link href="/privacy/" className="btn-outline-primary btn-sm">
              隐私政策
            </Link>
          </div>
        </div>

        <div
          className="flex flex-col gap-2 border-t pt-5 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: "var(--border-soft)" }}
        >
          <p className="subtle">
            © {year} {name} · 本站仅使用中文（zh-CN）
          </p>
          <ul className="flex flex-wrap items-center gap-x-4">
            <li>
              <Link href="/articles/" className="footer-link">
                文章
              </Link>
            </li>
            <li>
              <Link href="/projects/" className="footer-link">
                项目
              </Link>
            </li>
            <li>
              <Link href="/chatters/" className="footer-link">
                杂谈
              </Link>
            </li>
            <li>
              <Link href="/privacy/" className="footer-link">
                隐私政策
              </Link>
            </li>
            <li>
              <Link href="/settings/" className="footer-link">
                偏好设置
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
