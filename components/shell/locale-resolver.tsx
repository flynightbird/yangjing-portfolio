'use client';

import { useEffect } from 'react';

import { withBasePath } from '@/lib/i18n/locales';

const localeStorageKey = 'yj-locale';

export function LocaleResolver() {
  useEffect(() => {
    let destination = withBasePath('/en/');

    try {
      if (window.localStorage.getItem(localeStorageKey) === 'zh') {
        destination = withBasePath('/zh/');
      }
    } catch {
      destination = withBasePath('/en/');
    }

    window.location.replace(destination);
  }, []);

  return null;
}
