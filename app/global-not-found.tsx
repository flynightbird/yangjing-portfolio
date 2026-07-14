import type { Metadata } from 'next';

import '@/app/globals.css';

import { NotFoundContent } from '@/components/shell/not-found-content';

export const metadata: Metadata = {
  title: 'Page not found | Yang Jing Portfolio',
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <NotFoundContent />
      </body>
    </html>
  );
}
