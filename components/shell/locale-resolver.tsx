'use client';

import { useEffect } from 'react';

const localeStorageKey = 'yj-locale';

export function LocaleResolver() {
  useEffect(() => {
    let destination = '/en/';

    try {
      if (window.localStorage.getItem(localeStorageKey) === 'zh') {
        destination = '/zh/';
      }
    } catch {
      destination = '/en/';
    }

    window.location.replace(destination);
  }, []);

  return null;
}
