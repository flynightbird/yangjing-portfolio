import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ConvoAiLayout } from '@/components/convo-ai/convo-ai-layout';
import type { ContentMeta } from '@/content/schema';

const meta = {
  type: 'work', slug: 'convo-ai', locale: 'en', translationKey: 'work.convo-ai',
  title: 'ConvoAI', proposition: 'Make invisible real-time states legible.',
  role: 'Sole product design ownership (designer-reported)', duration: 'Not disclosed',
  status: 'Formally launched (designer-reported)', disclosure: 'Evidence boundary.',
  heroMedia: '/images/convo-ai/figma/web-ready.png', evidenceLevel: 'delivered',
  featuredOrder: 3, previousSlug: 'call-agent', nextSlug: 'meeting',
  chapters: [{ id: 'context-thesis', label: 'Thesis' }],
} as ContentMeta;

describe('ConvoAiLayout', () => {
  it('renders the product theatre, shared chapter navigation, and neighbors', () => {
    const { container } = render(<ConvoAiLayout meta={meta} locale="en" previous={{ href: '/en/work/call-agent/', title: 'Call Agent' }} next={{ href: '/en/work/meeting/', title: 'Meeting' }}><section id="context-thesis">Story</section></ConvoAiLayout>);
    expect(container.querySelector('[data-convo-ai-stage]')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^ConvoAI$/);
    expect(container.querySelector('[data-convo-next-section-hint]')).toBeVisible();
    expect(screen.getAllByRole('navigation', { name: 'Case study chapters' })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
    expect(screen.getByRole('navigation', { name: 'Project navigation' })).toBeVisible();
    expect(container.querySelector('[data-convo-ai-case]')).toBeVisible();
    expect(container.querySelector('[data-case-study]')).toBeVisible();
  });
});
