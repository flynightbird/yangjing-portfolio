import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConvoAiLayout } from '@/components/convo-ai/convo-ai-layout';
import type { ContentMeta } from '@/content/schema';

const meta = {
  type: 'work', slug: 'convo-ai', locale: 'en', translationKey: 'work.convo-ai',
  title: 'ConvoAI', proposition: 'Make invisible real-time states legible.',
  role: 'Sole product design ownership', duration: 'Not disclosed',
  status: 'Formally launched', disclosure: 'Evidence boundary.',
  heroMedia: '/images/convo-ai/figma/web-ready.png', evidenceLevel: 'delivered',
  featuredOrder: 3,
  chapters: [{ id: 'context-thesis', label: 'Thesis' }],
} as ContentMeta;

describe('ConvoAiLayout', () => {
  it('renders the product theatre and shared chapter navigation without project neighbors', () => {
    const { container } = render(<ConvoAiLayout meta={meta} locale="en"><section id="context-thesis">Story</section></ConvoAiLayout>);
    expect(container.querySelector('[data-convo-ai-stage]')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^ConvoAI$/);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(container.querySelector('[data-stage-display-title]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(container.querySelector('[data-convo-next-section-hint]')).toBeVisible();
    expect(screen.getAllByRole('navigation', { name: 'Case study chapters' })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
    expect(container.querySelector('[data-convo-ai-case]')).toBeVisible();
    expect(container.querySelector('[data-case-study]')).toBeVisible();
    expect(screen.queryByText('Evidence boundary.')).toBeNull();
    expect(container.querySelector('[data-project-previous]')).toBeNull();
    expect(container.querySelector('[data-project-next]')).toBeNull();
  });
});
