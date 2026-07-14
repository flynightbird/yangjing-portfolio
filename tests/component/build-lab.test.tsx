import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DemoFrame } from '@/components/build-lab/demo-frame';
import { EvidenceLedger } from '@/components/build-lab/evidence-ledger';

afterEach(cleanup);

describe('Build Lab evidence surface', () => {
  it.each([
    ['en', 'Interactive STT static prototype', 'Open prototype', 'View source'],
    ['zh', 'STT 交互式静态原型', '打开原型', '查看源代码'],
  ] as const)(
    'renders the pinned %s demo with a real fallback and actions',
    (locale, title, openLabel, sourceLabel) => {
      render(<DemoFrame locale={locale} />);

      expect(screen.getByTitle(title)).toHaveAttribute(
        'src',
        '/demos/stt-demo/index.html',
      );
      const poster = screen.getByRole('img', { name: title });
      expect(poster).toHaveAttribute('src', '/demos/stt-demo/poster.png');
      expect(poster).toHaveAttribute('loading', 'eager');
      expect(screen.getByRole('link', { name: openLabel })).toHaveAttribute(
        'href',
        '/demos/stt-demo/index.html',
      );
      expect(screen.getByRole('link', { name: new RegExp(sourceLabel) })).toHaveAttribute(
        'href',
        'https://github.com/flynightbird/stt-demo/tree/e5e840a',
      );
    },
  );

  it.each([
    ['en', 'Prototype boundary', 'Component library', 'Design audit', 'Visual regression'],
    ['zh', '原型边界', '组件库', '设计审计', '视觉回归'],
  ] as const)(
    'renders auditable %s evidence without hiding the limitations',
    (locale, boundary, library, audit, regression) => {
      render(<EvidenceLedger locale={locale} />);

      expect(screen.getByText('e5e840a')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: boundary })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: library })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: audit })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: regression })).toBeInTheDocument();
    },
  );
});
