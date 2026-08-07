import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import '@/app/globals.css';

import { SecurityMeta } from '@/components/security/security-meta';

export const metadata: Metadata = {
  title: 'Yang Jing Portfolio',
  description: 'Product design portfolio by Yang Jing.',
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head><SecurityMeta /></head>
      <body>{children}</body>
    </html>
  );
}
