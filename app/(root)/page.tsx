import { LocaleResolver } from '@/components/shell/locale-resolver';
import { withBasePath } from '@/lib/i18n/locales';

export default function HomePage() {
  return (
    <main>
      <a href={withBasePath('/en/')}>View portfolio in English</a>
      <LocaleResolver />
    </main>
  );
}
