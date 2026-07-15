'use client';

import { Languages } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useId, useState } from 'react';

import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import type { Locale } from '@/content/types';
import { resolveTranslatedPath } from '@/lib/i18n/locales';

const localeStorageKey = 'yj-locale';

export const launchLocaleRoutes = [
  '/en/',
  '/zh/',
  '/en/about/',
  '/zh/about/',
  '/en/work/',
  '/zh/work/',
  '/en/work/xuelang/',
  '/zh/work/xuelang/',
  '/en/work/call-agent/',
  '/zh/work/call-agent/',
  '/en/work/meeting/',
  '/zh/work/meeting/',
  '/en/build/',
  '/zh/build/',
  '/en/build/stt-demo/',
  '/zh/build/stt-demo/',
] as const;

type Replace = (href: string) => void;

interface LocaleSwitcherControlProps {
  readonly locale: Locale;
  readonly pathname: string;
  readonly replace: Replace;
  readonly active?: boolean;
  readonly onActiveChange?: (isActive: boolean) => void;
}

interface PendingFallback {
  readonly locale: Locale;
  readonly href: string;
}

type LocalePanel = 'choices' | 'fallback' | null;

function dictionaryFor(locale: Locale) {
  return locale === 'zh' ? zhDictionary : enDictionary;
}

function interpolate(template: string, language: string): string {
  return template.replace('{language}', language);
}

export function LocaleSwitcherControl({
  locale,
  pathname,
  replace,
  active,
  onActiveChange,
}: LocaleSwitcherControlProps) {
  const dictionary = dictionaryFor(locale);
  const choicesId = useId();
  const [internalActive, setInternalActive] = useState(false);
  const [panel, setPanel] = useState<LocalePanel>(null);
  const [pendingFallback, setPendingFallback] =
    useState<PendingFallback | null>(null);
  const panelActive = active ?? internalActive;
  const visiblePanel = panelActive ? panel : null;

  const setPanelActive = (isActive: boolean) => {
    if (active === undefined) {
      setInternalActive(isActive);
    }

    onActiveChange?.(isActive);
  };

  const toggleChoices = () => {
    if (panelActive) {
      setPanel(null);
      setPendingFallback(null);
      setPanelActive(false);
      return;
    }

    setPendingFallback(null);
    setPanel('choices');
    setPanelActive(true);
  };

  const persistAndReplace = (targetLocale: Locale, href: string) => {
    try {
      window.localStorage.setItem(localeStorageKey, targetLocale);
    } catch {
      // Navigation remains available when storage is unavailable.
    }

    replace(href);
  };

  const chooseLocale = (targetLocale: Locale) => {
    const result = resolveTranslatedPath(
      pathname,
      targetLocale,
      launchLocaleRoutes,
    );

    if (result.fellBack) {
      setPendingFallback({ locale: targetLocale, href: result.href });
      setPanel('fallback');
      return;
    }

    setPanel(null);
    setPanelActive(false);
    persistAndReplace(targetLocale, result.href);
  };

  const pendingLanguage = pendingFallback
    ? dictionary.languages[pendingFallback.locale]
    : '';

  return (
    <div>
      <button
        type="button"
        aria-controls={choicesId}
        aria-expanded={visiblePanel === 'choices'}
        aria-label={dictionary.localeSwitcher.label}
        title={dictionary.localeSwitcher.label}
        onClick={toggleChoices}
      >
        <Languages aria-hidden="true" size={18} />
        <span>{dictionary.languages[locale]}</span>
      </button>
      <ul id={choicesId} hidden={visiblePanel !== 'choices'}>
        {(['en', 'zh'] as const).map((choice) => (
          <li key={choice}>
            <button
              type="button"
              aria-pressed={choice === locale}
              onClick={() => chooseLocale(choice)}
            >
              {dictionary.languages[choice]}
            </button>
          </li>
        ))}
      </ul>
      {visiblePanel === 'fallback' && pendingFallback ? (
        <div>
          <p role="status">
            {interpolate(
              dictionary.localeSwitcher.fallbackNotice,
              pendingLanguage,
            )}
          </p>
          <button
            type="button"
            onClick={() =>
              persistAndReplace(pendingFallback.locale, pendingFallback.href)
            }
          >
            {interpolate(
              dictionary.localeSwitcher.fallbackAction,
              pendingLanguage,
            )}
          </button>
        </div>
      ) : null}
    </div>
  );
}

interface LocaleSwitcherProps {
  readonly locale: Locale;
  readonly active?: boolean;
  readonly onActiveChange?: (isActive: boolean) => void;
}

export function LocaleSwitcher({
  locale,
  active,
  onActiveChange,
}: LocaleSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <LocaleSwitcherControl
      locale={locale}
      pathname={pathname}
      replace={(href) => router.replace(href)}
      active={active}
      onActiveChange={onActiveChange}
    />
  );
}
