export function NotFoundContent() {
  return (
    <main>
      <h1>404</h1>
      <p>
        Page not found / <span lang="zh-CN">页面未找到</span>
      </p>
      <nav aria-label="Portfolio languages">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Static-export recovery link. */}
        <a href="/en/">English</a>{' '}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Static-export recovery link. */}
        <a href="/zh/" lang="zh-CN">
          中文
        </a>
      </nav>
    </main>
  );
}
