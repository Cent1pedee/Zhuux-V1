"use client";

import { useId } from "react";
import skillsData from "@/data/skills.json";
import type { Project } from "@/content/types";
import Link from "next/link";
import { track } from "@/lib/analytics";

export interface SkillGroup {
  group: string;
  items: string[];
}

const groups = (skillsData as unknown as { skills: SkillGroup[] }).skills;

/**
 * 技术栈标签（P0）：按熟练度分组、小标题区分，标签是文字而非图片。
 * 有相关公开项目的标签可点击 → 跳转到项目页并按该技术栈筛选（项目页读取 ?tags= 参数）。
 */
export function Skills({ projects }: { projects: Pick<Project, "tags">[] }) {
  const hintId = useId();

  const countFor = (skill: string) => projects.filter((project) => project.tags.includes(skill)).length;

  return (
    <div className="skill-groups">
      {groups.map((group) => (
        <div key={group.group}>
          <h3 className="skill-group-title">{group.group}</h3>
          <ul className="flex flex-wrap gap-2" aria-label={`${group.group}技术栈`}>
            {group.items.map((skill) => {
              const count = countFor(skill);
              return (
                <li key={skill}>
                  {count > 0 ? (
                    <Link
                      href={`/projects/?tags=${encodeURIComponent(skill)}&sort=date`}
                      className="chip"
                      aria-label={`${skill}：在项目页筛选相关项目（${count} 个）`}
                      aria-describedby={hintId}
                      onClick={() => track("project_link_click", { target: "skill_filter", skill })}
                    >
                      {skill}
                      <span className="subtle" aria-hidden="true">
                        {count}
                      </span>
                    </Link>
                  ) : (
                    <span className="chip" aria-label={`${skill}（暂无公开项目）`}>
                      {skill}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p id={hintId} className="text-xs subtle">
        标签后的数字表示相关公开项目数量；点击可跳转到项目页并按该项技术筛选。
      </p>
    </div>
  );
}
