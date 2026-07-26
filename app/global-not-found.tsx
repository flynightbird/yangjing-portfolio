import type { Metadata } from 'next';

import '@/app/globals.css';

import { NotFoundContent } from '@/components/shell/not-found-content';
import { SiteFooter } from '@/components/shell/site-footer';

export const metadata: Metadata = {
  title: 'Page not found | Yang Jing Portfolio',
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundContent />
        <SiteFooter locale="en" />
      </body>
    </html>
  );
}
