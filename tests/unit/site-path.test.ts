import { describe, expect, it } from 'vitest';

import * as locales from '@/lib/i18n/locales';

describe('withBasePath', () => {
  it('prefixes internal root paths without changing external or fragment URLs', () => {
    const withBasePath = (
      locales as typeof locales & {
        withBasePath?: (path: string, basePath?: string) => string;
      }
    ).withBasePath;

    expect(withBasePath).toBeTypeOf('function');
    if (!withBasePath) return;

    expect(withBasePath('/en/work/call-agent/', '/yangjing-portfolio')).toBe(
      '/yangjing-portfolio/en/work/call-agent/',
    );
    expect(withBasePath('/images/call-agent/poster.webp', '/yangjing-portfolio')).toBe(
      '/yangjing-portfolio/images/call-agent/poster.webp',
    );
    expect(withBasePath('/yangjing-portfolio/en/', '/yangjing-portfolio')).toBe(
      '/yangjing-portfolio/en/',
    );
    expect(withBasePath('https://aidxtech.com/', '/yangjing-portfolio')).toBe(
      'https://aidxtech.com/',
    );
    expect(withBasePath('#work', '/yangjing-portfolio')).toBe('#work');
    expect(withBasePath('/en/', '')).toBe('/en/');
  });
});
