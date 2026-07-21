'use client';

import { Globe2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import type { Locale } from '@/content/types';
import { resolveTranslatedPath } from '@/lib/i18n/locales';

const localeStorageKey = 'yj-locale';

export const launchLocaleRoutes = [
  '/en/', '/zh/', '/en/about/', '/zh/about/', '/en/work/', '/zh/work/',
  '/en/work/xuelang/', '/zh/work/xuelang/',
  '/en/work/call-agent/', '/zh/work/call-agent/',
  '/en/work/convo-ai/', '/zh/work/convo-ai/',
  '/en/work/meeting/', '/zh/work/meeting/',
  '/en/build/', '/zh/build/',
  '/en/build/stt-demo/', '/zh/build/stt-demo/',
] as const;

type Replace = (href: string) => void;

interface LocaleSwitcherControlProps {
  readonly locale: Locale;
  readonly pathname: string;
  readonly replace: Replace;
}

export function LocaleSwitcherControl({
  locale,
  pathname,
  replace,
}: LocaleSwitcherControlProps) {
  const targetLocale: Locale = locale === 'en' ? 'zh' : 'en';
  const targetLanguage = locale === 'en' ? 'Simplified Chinese' : '英语';
  const label = locale === 'en'
    ? `Switch to ${targetLanguage}`
    : `切换至${targetLanguage}`;

  const switchLocale = () => {
    const result = resolveTranslatedPath(
      pathname,
      targetLocale,
      launchLocaleRoutes,
    );
    const hash = typeof window === 'undefined' ? '' : window.location.hash;

    try {
      window.localStorage.setItem(localeStorageKey, targetLocale);
    } catch {
      // Navigation remains available when storage is unavailable.
    }

    replace(`${result.href}${hash}`);
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={switchLocale}
    >
      <Globe2 aria-hidden="true" size={18} />
    </button>
  );
}

export function LocaleSwitcher({ locale }: { readonly locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <LocaleSwitcherControl
      locale={locale}
      pathname={pathname}
      replace={(href) => router.replace(href)}
    />
  );
}
