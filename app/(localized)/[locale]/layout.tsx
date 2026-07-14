import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import '@/app/globals.css';

import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';
import { enDictionary } from '@/content/dictionaries/en';
import { zhDictionary } from '@/content/dictionaries/zh';
import { getStaticLocaleParams, isLocale } from '@/lib/i18n/locales';

export const metadata: Metadata = {
  title: 'Yang Jing Portfolio',
  description: 'Product design portfolio by Yang Jing.',
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getStaticLocaleParams();
}

interface LocaleLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const documentLanguage = locale === 'zh' ? 'zh-CN' : 'en';
  const dictionary = locale === 'zh' ? zhDictionary : enDictionary;

  return (
    <html lang={documentLanguage}>
      <body>
        <a className="skip-link" href="#main-content">
          {dictionary.site.skipToContent}
        </a>
        <SiteHeader locale={locale} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
