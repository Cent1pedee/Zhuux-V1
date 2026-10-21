/** 背景层：四团缓慢漂移的柔光斑 + 可选墙纸 + 雾化层（纯装饰，不进入可访问性树） */
export function SiteBackdrop({ wallpaper }: { wallpaper?: string }) {
  return (
    <div className="site-backdrop" aria-hidden="true">
      {wallpaper ? (
        <div className="site-backdrop-wallpaper" style={{ backgroundImage: `url(${wallpaper})` }} />
      ) : null}
      <div className="site-backdrop-blob" data-blob="a" />
      <div className="site-backdrop-blob" data-blob="b" />
      <div className="site-backdrop-blob" data-blob="c" />
      <div className="site-backdrop-blob" data-blob="d" />
      <div className="site-backdrop-veil" />
    </div>
  );
}
