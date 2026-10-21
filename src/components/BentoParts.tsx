"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SOCIAL_ICONS, ClockIcon, PinIcon } from "./icons";

/* ==========================================================================
   打字机：首帧渲染完整文本（不阻塞 LCP），挂载后 50ms/字播放，完成即停。
   prefers-reduced-motion 时直接显示最终状态。
   ========================================================================== */
function Typewriter({ text, speed = 50 }: { text: string; speed?: number }) {
  const [count, setCount] = useState(text.length);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let index = 0;
    setCount(0);
    setTyping(true);
    const timer = window.setInterval(() => {
      index += 1;
      setCount(index);
      if (index >= text.length) {
        window.clearInterval(timer);
        setTyping(false);
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      <span className="visually-hidden">{text}</span>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {typing ? <span className="type-caret" aria-hidden="true" /> : null}
    </span>
  );
}

/* ==========================================================================
   资料卡：头像 / 姓名 / 简介 / 数字 / 联系方式 / 社交入口
   ========================================================================== */
export function ProfileCard({
  name,
  jobTitle,
  avatar,
  tagline,
  bio,
  stats,
  city,
  timezone,
  socials,
  emailHref,
  email,
}: {
  name: string;
  jobTitle: string;
  avatar: { src: string; alt: string; width: number; height: number };
  /** 一句话简介，首屏用打字机呈现（容器预留高度，不产生布局偏移） */
  tagline: string;
  bio: string;
  stats: { articles: number; projects: number; chatters: number };
  city: string;
  timezone: string;
  socials: { kind: string; label: string; href: string }[];
  emailHref: string;
  email: string;
}) {
  return (
    <div className="card-surface profile-card">
      <div className="profile-top">
        <div className="profile-avatar">
          <img src={avatar.src} alt={avatar.alt} width={avatar.width} height={avatar.height} loading="eager" fetchPriority="high" decoding="async" />
        </div>
        <div className="min-w-0">
          <p className="text-xs subtle">{jobTitle}</p>
          <h1 className="profile-name">{name}</h1>
          <p className="profile-tagline">
            <Typewriter text={tagline} />
          </p>
          <p className="profile-bio">{bio}</p>
        </div>
      </div>

      <div className="profile-stats" aria-label="内容统计">
        <Link href="/articles/" className="profile-stat">
          <span className="num">{stats.articles}</span>
          <span className="lbl">文章</span>
        </Link>
        <Link href="/projects/" className="profile-stat">
          <span className="num">{stats.projects}</span>
          <span className="lbl">项目</span>
        </Link>
        <Link href="/chatters/" className="profile-stat">
          <span className="num">{stats.chatters}</span>
          <span className="lbl">杂谈</span>
        </Link>
      </div>

      <div className="profile-foot">
        <div className="profile-meta">
          <span>
            <PinIcon /> {city}
          </span>
          <span>
            <ClockIcon /> {timezone}
          </span>
        </div>
        <ul className="profile-socials" aria-label="社交与联系方式">
          <li>
            <a href={emailHref} className="profile-social" aria-label={`发送邮件至 ${email}`} title={email}>
              <SOCIAL_ICONS.email width={18} height={18} />
            </a>
          </li>
          {socials
            .filter((social) => social.kind !== "email")
            .map((social) => {
              const Icon = SOCIAL_ICONS[social.kind as keyof typeof SOCIAL_ICONS] ?? SOCIAL_ICONS.github;
              const external = social.href.startsWith("http");
              return (
                <li key={`${social.kind}-${social.href}`}>
                  <a
                    href={social.href}
                    className="profile-social"
                    aria-label={external ? `${social.label}（在新标签页打开）` : social.label}
                    title={social.label}
                    {...(external ? { target: "_blank", rel: "me noopener noreferrer" } : { rel: "me" })}
                  >
                    <Icon width={18} height={18} />
                  </a>
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}

/* ==========================================================================
   底部状态条：技术栈徽章 + 本地时间（不展示虚构的建站时长）
   ========================================================================== */
export function StatusBar({ badges }: { badges: string[] }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeText = now
    ? now.toLocaleTimeString("zh-CN", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="card-surface status-bar">
      <p className="status-time">
        <span aria-hidden="true" className="status-dot" style={{ color: "var(--color-success)" }} />
        <span aria-label="本地时间">{timeText}</span>
      </p>
      <ul className="status-badges" aria-label="本站技术栈">
        {badges.map((badge) => (
          <li key={badge} className="chip">
            {badge}
          </li>
        ))}
      </ul>
    </div>
  );
}
