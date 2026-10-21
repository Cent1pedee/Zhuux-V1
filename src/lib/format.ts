/** 与客户端无关的纯函数：日期格式化（服务端组件也可调用） */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${year}-${month}-${day}`;
}

/** 中文长日期：2026 年 10 月 14 日 */
export function formatDateLong(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${year} 年 ${month} 月 ${day} 日`;
}
