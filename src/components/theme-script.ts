/**
 * 首帧前的主题脚本（极小、同步执行）。
 * - localStorage 中已有手动选择（dark / light）→ 直接采用；
 * - 没有选择（system）→ 读取系统 prefers-color-scheme；
 * - 都会在首次绘制前写入 data-theme，避免「先亮后暗」的闪烁。
 * 注意：不能因为 HTML 上已有 data-theme 就提前返回，否则 system 用户会先看到默认主题。
 */
export const THEME_INIT_SCRIPT = `(function(){try{var k="theme";var s=localStorage.getItem(k);var t;if(s==="dark"||s==="light"){t=s;}else{t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;
