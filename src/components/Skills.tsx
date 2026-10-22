"use client";

import Link from "next/link";
import { useId } from "react";
import skillsData from "@/data/skills.json";
import type { Project } from "@/content/types";
import { track } from "@/lib/analytics";

export interface SkillGroup {
  group: string;
  items: string[];
}

const groups = (skillsData as unknown as { skills: SkillGroup[] }).skills;

/**
 * 技术栈（P0）：按熟练度分组、小标题区分，标签是文字而非图片。
 * - 有公开项目的技术可点击 → 项目页按该技术筛选
 * - 计数用独立徽标展示，而不是把数字直接贴在文本后面（避免读成「TypeScript4」）
 */
export function Skills({ projects }: { projects: Pick<Project, "tags">[] }) {
  const hintId = useId();
  const countFor = (skill: string) => projects.filter((project) => project.tags.includes(skill)).length;

  return (
    <div className="skill-groups">
      {groups.map((group) => (
        <section key={group.group} className="skill-group" aria-label={group.group}>
          <h3 className="skill-group-title">{group.group}</h3>
          <ul className="skill-list">
            {group.items.map((skill) => {
              const count = countFor(skill);
              return (
                <li key={skill}>
                  {count > 0 ? (
                    <Link
                      href={`/projects/?tags=${encodeURIComponent(skill)}&sort=date`}
                      className="skill-chip"
                      aria-label={`${skill}：筛选 ${count} 个相关项目`}
                      aria-describedby={hintId}
                      onClick={() => track("project_link_click", { target: "skill_filter", skill })}
                    >
                      <span className="skill-chip-name">{skill}</span>
                      <span className="skill-chip-count" aria-hidden="true">
                        {count}
                      </span>
                    </Link>
                  ) : (
                    <span className="skill-chip is-static" aria-label={`${skill}（暂无公开项目）`}>
                      <span className="skill-chip-name">{skill}</span>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <p id={hintId} className="skill-hint">
        徽标数字为相关公开项目数量，点击可直接筛选。
      </p>
    </div>
  );
}
