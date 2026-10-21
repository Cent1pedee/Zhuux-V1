/**
 * 复制文本：优先 Clipboard API；非安全上下文或权限被拒时，
 * 退回隐藏 textarea + execCommand（与 useAsyncAction 里的复制邮箱逻辑一致）。
 * 返回是否成功，并记录失败原因便于提示文案区分。
 */
export type CopyFailure = "denied" | "unsupported";

export async function copyToClipboard(text: string): Promise<{ ok: true } | { ok: false; reason: CopyFailure }> {
  if (typeof window === "undefined") return { ok: false, reason: "unsupported" };

  // 1) 现代方式：仅在安全上下文（https / localhost）可用
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return { ok: true };
    } catch {
      // 权限被拒（浏览器弹窗被关闭、企业策略等）时继续尝试降级方案
    }
  }

  // 2) 降级：隐藏 textarea + execCommand
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok ? { ok: true } : { ok: false, reason: "denied" };
  } catch {
    return { ok: false, reason: "denied" };
  }
}

/** 复制失败的兜底：选中地址栏内容并提示用户手动复制 */
export function selectAddressBarFallback() {
  const input = document.createElement("input");
  input.value = window.location.href;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.top = "-1000px";
  document.body.appendChild(input);
  input.select();
  input.setSelectionRange(0, input.value.length);
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(input);
  }
}
