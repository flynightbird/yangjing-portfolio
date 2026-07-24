import { readFileSync } from 'node:fs';

import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MeetingLayout } from '@/components/meeting/meeting-layout';
import type { ContentMeta } from '@/content/schema';

const meta: ContentMeta = {
  type: 'work',
  slug: 'meeting',
  locale: 'en',
  translationKey: 'work.meeting',
  title: 'Agora Meeting: A Real-time Collaboration System',
  proposition: 'Building a scalable meeting experience across Desktop, Web, Tablet, and Mobile with adaptive layouts, AI-powered transcription, and collaborative workflows.',
  role: 'Sole Product Designer',
  duration: '2024-2026 · 1.5 years',
  status: 'Shipped',
  disclosure: 'Real shipped interfaces and product recordings.',
  heroMedia: '/images/meeting/meeting-hero.webp',
  evidenceLevel: 'delivered',
  featuredOrder: 3,
  chapters: [{ id: 'business-context', label: 'Business context' }],
};

it('presents product proof, approved facts, and chapter navigation', () => {
  render(
    <MeetingLayout meta={meta} locale="en">
      <section id="business-context">Context</section>
    </MeetingLayout>,
  );

  expect(screen.getByRole('heading', { level: 1, name: meta.title })).toBeVisible();
  expect(screen.getByRole('heading', { level: 1 }).querySelector('br')).toBeNull();
  expect(screen.getByText('Sole Product Designer')).toBeVisible();
  expect(screen.getByText('2024-2026 · 1.5 years')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Replay' })).toBeVisible();
  expect(screen.getByText('Agora Meeting')).toBeVisible();
  expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
});

it('prevents forced word breaks and uses the shared chapter treatment', () => {
  const layoutStyles = readFileSync(
    'components/meeting/meeting-layout.module.css',
    'utf8',
  );
  const chapterStyles = readFileSync(
    'components/case-study/chapter-nav.module.css',
    'utf8',
  );

  expect(layoutStyles).toMatch(/word-break:\s*normal/);
  expect(layoutStyles).toMatch(/overflow-wrap:\s*break-word/);
  expect(layoutStyles).toMatch(/text-wrap:\s*balance/);
  expect(layoutStyles).toMatch(/\.heroMedia\s*\{\s*order:\s*1;/);
  expect(chapterStyles).toMatch(
    /--chapter-accent:\s*var\(--color-iris-deep\)/,
  );
  expect(chapterStyles).toMatch(/opacity:\s*0\.48/);
});
