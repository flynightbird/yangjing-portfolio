import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GrowthBaseLayout } from '@/components/growth-base/growth-base-layout';
import type { ContentMeta } from '@/content/schema';

afterEach(cleanup);

const meta = {
  type: 'work',
  slug: 'growth-base',
  locale: 'en',
  translationKey: 'work.growth-base',
  title: 'AI Coach · Emotional IP Companionship',
  proposition: 'Turn routine health check-ins into a warmer daily relationship.',
  role: 'Independent product and visual design · AI-assisted prototyping',
  duration: 'Personal concept',
  status: 'Personal concept · Interactive prototype',
  disclosure: 'Human design judgment with AI-assisted production.',
  heroMedia: '/images/growth-base/home-video-poster.webp',
  evidenceLevel: 'prototype',
  featuredOrder: 4,
  chapters: [
    { id: 'showcase', label: 'Before / After' },
    { id: 'experience-clips', label: 'Experience clips' },
    { id: 'disclosure', label: 'Disclosure' },
  ],
} as ContentMeta;

describe('GrowthBaseLayout', () => {
  it('renders a full-width compact opening without a case-study chapter rail', () => {
    const { container } = render(
      <GrowthBaseLayout meta={meta} locale="en">
        <section id="showcase">Showcase</section>
      </GrowthBaseLayout>,
    );

    expect(screen.getByRole('heading', { level: 1, name: meta.title })).toBeVisible();
    expect(screen.getByText(meta.status)).toBeVisible();
    expect(screen.getByText(meta.role)).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Case study chapters' })).toBeNull();
    expect(container.querySelector('[data-growth-base-case]')).toHaveAttribute(
      'data-layout',
      'editorial-full-width',
    );
    expect(container.querySelector('[data-case-study]')).toBeVisible();
  });
});
