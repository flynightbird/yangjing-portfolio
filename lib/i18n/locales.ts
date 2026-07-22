import { locales, type Locale } from '@/content/types';

export interface TranslatedPathResult {
  readonly href: string;
  readonly fellBack: boolean;
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && locales.some((locale) => locale === value);
}

export function getStaticLocaleParams(): Array<{ locale: Locale }> {
  return locales.map((locale) => ({ locale }));
}

export function withBasePath(
  sitePath: string,
  basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '',
): string {
  const normalizedBase = basePath.replace(/\/+$/, '');

  if (
    !normalizedBase
    || !sitePath.startsWith('/')
    || sitePath.startsWith('//')
    || sitePath === normalizedBase
    || sitePath.startsWith(`${normalizedBase}/`)
  ) {
    return sitePath;
  }

  return `${normalizedBase}${sitePath}`;
}

function normalizeSitePath(pathname: string): string {
  const withoutQuery = pathname.split(/[?#]/, 1)[0] ?? '';
  const withLeadingSlash = withoutQuery.startsWith('/')
    ? withoutQuery
    : `/${withoutQuery}`;
  const withoutTrailingSlash = withLeadingSlash.replace(/\/+$/, '');

  return `${withoutTrailingSlash || ''}/`;
}

export function resolveTranslatedPath(
  pathname: string,
  targetLocale: Locale,
  knownRoutes: readonly string[],
): TranslatedPathResult {
  const fallback = `/${targetLocale}/`;
  const normalizedPath = normalizeSitePath(pathname);
  const segments = normalizedPath.split('/').filter(Boolean);

  if (!isLocale(segments[0])) {
    return { href: fallback, fellBack: true };
  }

  const candidate = normalizeSitePath(
    `/${targetLocale}/${segments.slice(1).join('/')}`,
  );
  const normalizedRoutes = new Set(knownRoutes.map(normalizeSitePath));

  return normalizedRoutes.has(normalizedPath) && normalizedRoutes.has(candidate)
    ? { href: candidate, fellBack: false }
    : { href: fallback, fellBack: true };
}
