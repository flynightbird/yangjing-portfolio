import { withBasePath } from '@/lib/i18n/locales';

export function NotFoundContent() {
  return (
    <main>
      <h1>404</h1>
      <p>
        Page not found / <span lang="zh-CN">页面未找到</span>
      </p>
      <nav aria-label="Portfolio languages">
        <a href={withBasePath('/en/')}>English</a>{' '}
        <a href={withBasePath('/zh/')} lang="zh-CN">
          中文
        </a>
      </nav>
    </main>
  );
}
