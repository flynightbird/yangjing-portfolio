import { LocaleResolver } from '@/components/shell/locale-resolver';

export default function HomePage() {
  return (
    <main>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- This is the no-JS static-export escape link. */}
      <a href="/en/">View portfolio in English</a>
      <LocaleResolver />
    </main>
  );
}
