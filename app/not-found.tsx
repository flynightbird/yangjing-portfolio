export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>
        Page not found / <span lang="zh-CN">页面未找到</span>
      </p>
      <nav aria-label="Portfolio languages">
        <a href="/en/">English</a>{' '}
        <a href="/zh/" lang="zh-CN">
          中文
        </a>
      </nav>
    </main>
  );
}
