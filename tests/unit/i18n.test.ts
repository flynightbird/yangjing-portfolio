import { describe, expect, it } from 'vitest';

import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import {
  getStaticLocaleParams,
  isLocale,
  resolveTranslatedPath,
} from '@/lib/i18n/locales';

const knownRoutes = [
  '/en/',
  '/zh/',
  '/en/work/call-agent/',
  '/zh/work/call-agent/',
] as const;

function leafKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof child === 'object' && child !== null
      ? leafKeys(child as object, path)
      : path;
  });
}

describe('locale helpers', () => {
  it('guards only supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('zh')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('provides stable static params for both locales', () => {
    expect(getStaticLocaleParams()).toEqual([{ locale: 'en' }, { locale: 'zh' }]);
  });

  it('preserves route identity for a known translation', () => {
    expect(
      resolveTranslatedPath('/en/work/call-agent', 'zh', knownRoutes),
    ).toEqual({ href: '/zh/work/call-agent/', fellBack: false });
  });

  it('normalizes an optional trailing slash consistently', () => {
    expect(
      resolveTranslatedPath('/en/work/call-agent/', 'zh', [
        '/en/work/call-agent/',
        '/zh/work/call-agent',
      ]),
    ).toEqual({ href: '/zh/work/call-agent/', fellBack: false });
  });

  it('falls back to the target locale home for unknown routes', () => {
    expect(resolveTranslatedPath('/en/private', 'zh', knownRoutes)).toEqual({
      href: '/zh/',
      fellBack: true,
    });
  });

  it('does not accept an unknown source just because its target path is known', () => {
    expect(
      resolveTranslatedPath('/en/private', 'zh', ['/zh/private/']),
    ).toEqual({ href: '/zh/', fellBack: true });
  });

  it('falls back when the source route exists but its translation does not', () => {
    expect(
      resolveTranslatedPath('/en/work/call-agent', 'zh', [
        '/en/work/call-agent/',
      ]),
    ).toEqual({ href: '/zh/', fellBack: true });
  });
});

describe('shell dictionaries', () => {
  it('keeps matching English and Simplified Chinese UI keys', () => {
    expect(leafKeys(zhDictionary).sort()).toEqual(leafKeys(enDictionary).sort());
  });

  it('contains the shell, action, 404, and direct-contact labels', () => {
    expect(enDictionary.navigation).toEqual({
      work: 'Work',
      archive: 'Archive',
      about: 'About',
    });
    expect(enDictionary.home.projects.callAgent.company).toBe('Agora / 声网');
    expect(zhDictionary.home.projects.xuelang.company).toBe('ByteDance / 字节跳动');
    expect(enDictionary.home.projects.aidx.company).toBe('Singapore AI company');
    expect(zhDictionary.home.projects.aidx.company).toBe('新加坡 AI 公司');
    expect(zhDictionary.home.projects.sttDemo.company).toBe('Agora / 声网');
    expect(enDictionary.actions).toHaveProperty('downloadPdf');
    expect(enDictionary.actions).not.toHaveProperty('previous');
    expect(enDictionary.actions).not.toHaveProperty('next');
    expect(enDictionary.notFound).toHaveProperty('title');
    expect(enDictionary.directContact).toHaveProperty('email');
    expect(enDictionary.menu.label).toBe('Menu');
  });
});
