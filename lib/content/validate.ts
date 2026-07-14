import type { ContentEntry } from '@/content/registry';
import {
  featuredOrder,
  type FeaturedRoute,
} from '@/content/navigation';
import { contentMetaSchema } from '@/content/schema';
import {
  locales,
  type ContentSlug,
  type Locale,
} from '@/content/types';

export interface RegistryValidationOptions {
  readonly checkAssets?: boolean;
  readonly assetExists?: (assetPath: string) => boolean;
  readonly checkNavigation?: boolean;
}

function fail(message: string): never {
  throw new Error(message);
}

export function validateRegistry(
  entries: readonly ContentEntry[],
  options: RegistryValidationOptions = {},
): void {
  if (options.checkAssets && !options.assetExists) {
    fail('options.assetExists: required when asset checking is enabled');
  }

  const slugLocales = new Set<string>();
  const translationKeyLocales = new Set<string>();
  const localesByTranslationKey = new Map<string, Set<Locale>>();
  const identityByTranslationKey = new Map<string, string>();

  entries.forEach((entry, index) => {
    const result = contentMetaSchema.safeParse(entry.meta);
    if (!result.success) {
      const issue = result.error.issues[0];
      const path = issue.path.length > 0 ? `.${issue.path.join('.')}` : '';
      fail(`entries[${index}].meta${path}: ${issue.message}`);
    }

    const { meta } = entry;
    const slugLocale = `${meta.type}/${meta.slug}:${meta.locale}`;
    if (slugLocales.has(slugLocale)) {
      fail(
        `entries[${index}]: duplicate slug-locale pair ` +
          `"${meta.type}/${meta.slug}" for locale "${meta.locale}"`,
      );
    }
    slugLocales.add(slugLocale);

    const translationKeyLocale = `${meta.translationKey}:${meta.locale}`;
    if (translationKeyLocales.has(translationKeyLocale)) {
      fail(
        `entries[${index}]: duplicate translation key ` +
          `"${meta.translationKey}" for locale "${meta.locale}"`,
      );
    }
    translationKeyLocales.add(translationKeyLocale);

    const routeIdentity = `${meta.type}/${meta.slug}`;
    const pairedIdentity = identityByTranslationKey.get(meta.translationKey);
    if (pairedIdentity && pairedIdentity !== routeIdentity) {
      fail(
        `entries[${index}]: translation key "${meta.translationKey}" maps to ` +
          `"${routeIdentity}" but previously mapped to "${pairedIdentity}"`,
      );
    }
    identityByTranslationKey.set(meta.translationKey, routeIdentity);

    const translationLocales =
      localesByTranslationKey.get(meta.translationKey) ?? new Set<Locale>();
    translationLocales.add(meta.locale);
    localesByTranslationKey.set(meta.translationKey, translationLocales);

    if (
      options.checkAssets &&
      options.assetExists &&
      !options.assetExists(meta.heroMedia)
    ) {
      fail(
        `entries[${index}].meta.heroMedia: referenced asset ` +
          `"${meta.heroMedia}" does not exist`,
      );
    }
  });

  for (const [translationKey, translationLocales] of localesByTranslationKey) {
    for (const locale of locales) {
      if (!translationLocales.has(locale)) {
        fail(
          `translation key "${translationKey}" is missing locale "${locale}"`,
        );
      }
    }
  }

  if (options.checkNavigation) {
    const slugsByLocale = new Map<Locale, Set<string>>(
      locales.map((locale) => [
        locale,
        new Set(
          entries
            .filter((entry) => entry.meta.locale === locale)
            .map((entry) => entry.meta.slug),
        ),
      ]),
    );

    entries.forEach((entry, index) => {
      const availableSlugs = slugsByLocale.get(entry.meta.locale);
      const targets = [
        ['previousSlug', entry.meta.previousSlug],
        ['nextSlug', entry.meta.nextSlug],
      ] as const;

      for (const [field, target] of targets) {
        if (target !== undefined && !availableSlugs?.has(target)) {
          fail(
            `entries[${index}].meta.${field}: target "${target}" ` +
              `is not registered for locale "${entry.meta.locale}"`,
          );
        }
      }
    });
  }
}

export function assertCompleteRegistry(
  entries: readonly ContentEntry[],
  options: RegistryValidationOptions = {},
): void {
  validateRegistry(entries, { ...options, checkNavigation: true });

  for (const route of featuredOrder) {
    for (const locale of locales) {
      const isRegistered = entries.some(
        (entry) =>
          `${entry.meta.type}/${entry.meta.slug}` === route &&
          entry.meta.locale === locale,
      );
      if (!isRegistered) {
        fail(`missing launch route "${route}" for locale "${locale}"`);
      }
    }
  }

  const orderedSlugs = featuredOrder.map(
    (route) => route.split('/')[1] as ContentSlug,
  );

  entries.forEach((entry, index) => {
    const route = `${entry.meta.type}/${entry.meta.slug}` as FeaturedRoute;
    const routeIndex = featuredOrder.indexOf(route);
    const expectedFeaturedOrder = routeIndex + 1;
    if (entry.meta.featuredOrder !== expectedFeaturedOrder) {
      fail(
        `entries[${index}].meta.featuredOrder: expected ` +
          `${expectedFeaturedOrder}, received ${entry.meta.featuredOrder}`,
      );
    }

    const expectedNeighbors = [
      ['previousSlug', orderedSlugs[routeIndex - 1]],
      ['nextSlug', orderedSlugs[routeIndex + 1]],
    ] as const;

    for (const [field, expected] of expectedNeighbors) {
      const actual = entry.meta[field];
      if (actual !== expected) {
        const expectation = expected ? `"${expected}"` : 'no target';
        const received = actual ? `"${actual}"` : 'no target';
        fail(
          `entries[${index}].meta.${field}: expected ${expectation} from ` +
            `canonical order, received ${received}`,
        );
      }
    }
  });
}
