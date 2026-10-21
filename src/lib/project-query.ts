/** 项目筛选状态与 URL 编解码（客户端与服务端都能安全引入，不含 UI） */
export interface ProjectQuery {
  tags: string[];
  kinds: string[];
  sort: "date" | "priority";
  q: string;
}

export function parseProjectQuery(search: string): ProjectQuery {
  const params = new URLSearchParams(search);
  const split = (value: string | null) =>
    (value ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  return {
    tags: split(params.get("tags")),
    kinds: split(params.get("kinds")),
    sort: params.get("sort") === "priority" ? "priority" : "date",
    q: params.get("q") ?? "",
  };
}

/** 固定参数顺序，保证同一种筛选组合得到同一个可分享 URL */
export function buildProjectQueryString(query: ProjectQuery, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  if (query.tags.length) params.set("tags", [...query.tags].sort().join(","));
  if (query.kinds.length) params.set("kinds", [...query.kinds].sort().join(","));
  if (query.sort !== "date") params.set("sort", query.sort);
  if (query.q.trim()) params.set("q", query.q.trim());
  Object.entries(extra).forEach(([key, value]) => params.set(key, value));
  return params.toString();
}
