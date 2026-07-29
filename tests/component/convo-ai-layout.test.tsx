import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConvoAiLayout } from '@/components/convo-ai/convo-ai-layout';
import type { ContentMeta } from '@/content/schema';

const meta = {
  type: 'work', slug: 'convo-ai', locale: 'en', translationKey: 'work.convo-ai',
  title: 'ConvoAI: Make real-time AI conversation legible', proposition: 'Make invisible real-time states legible.',
  role: 'Sole product design ownership', duration: 'Not disclosed',
  status: 'Formally launched', disclosure: 'Evidence boundary.',
  heroMedia: '/images/convo-ai/figma/web-ready.png', evidenceLevel: 'delivered',
  featuredOrder: 3,
  chapters: [{ id: 'context-thesis', label: 'Thesis' }],
} as ContentMeta;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('ConvoAiLayout', () => {
  it('renders the product theatre and shared chapter navigation without project neighbors', () => {
    const { container } = render(<ConvoAiLayout meta={meta} locale="en"><section id="context-thesis">Story</section></ConvoAiLayout>);
    expect(container.querySelector('[data-convo-ai-stage]')).toBeVisible();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^ConvoAI: Make real-time AI conversation legible$/);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveAttribute('id', 'convo-ai-title-en');
    expect(screen.getByRole('heading', { level: 1 }).closest('[data-convo-hero-copy]')).not.toBeNull();
    expect(container.querySelector('[data-stage-display-title]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-convo-next-section-hint]')).toBeVisible();
    expect(screen.getAllByRole('navigation', { name: 'Case study chapters' })).toHaveLength(1);
    expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
    expect(container.querySelector('[data-convo-ai-case]')).toBeVisible();
    expect(container.querySelector('[data-case-study]')).toBeVisible();
    expect(screen.queryByText('Evidence boundary.')).toBeNull();
    expect(container.querySelector('[data-project-previous]')).toBeNull();
    expect(container.querySelector('[data-project-next]')).toBeNull();
  });

  it('connects every hero video to a readable stage description', () => {
    const { container } = render(
      <ConvoAiLayout meta={meta} locale="en">
        <section id="context-thesis">Story</section>
      </ConvoAiLayout>,
    );

    const videos = Array.from(container.querySelectorAll('video'));
    const stage = container.querySelector('[data-convo-ai-stage]');
    expect(videos).toHaveLength(2);
    expect(stage).toHaveAttribute('aria-labelledby', 'convo-ai-title-en');
    expect(stage).toHaveAttribute('aria-describedby', 'convo-ai-proposition-en');
    videos.forEach((video) => {
      const descriptionId = video.getAttribute('aria-describedby');
      expect(descriptionId).toBe('convo-ai-proposition-en');
      expect(container.querySelector(`[id="${descriptionId}"]`)).toHaveTextContent(
        'Make invisible real-time states legible.',
      );
    });
  });

  it.each([
    {
      locale: 'en' as const,
      title: 'Agora AI Studio is officially live',
      subtitle: 'Mix and match ASR, LLM, TTS, digital humans, and more to rapidly build AI agents.',
      factsLabel: 'Project facts',
    },
    {
      locale: 'zh' as const,
      title: '声网 AI Studio 正式上线',
      subtitle: '自由搭配 ASR、LLM、TTS、数字人等，快速搭建 AI 智能体。',
      factsLabel: '项目概况',
    },
  ])('renders the $locale opening in the approved information and media order', ({
    locale,
    factsLabel,
  }) => {
    const { container } = render(
      <ConvoAiLayout meta={meta} locale={locale}>
        <section id="context-thesis">Story</section>
      </ConvoAiLayout>,
    );

    const heroTop = container.querySelector('[data-convo-hero-top]');
    const heroMeta = container.querySelector('[data-convo-hero-meta]');
    const heroMedia = container.querySelector('[data-convo-hero-media]');
    const facts = container.querySelector(`dl[aria-label="${factsLabel}"]`);
    const hint = container.querySelector('[data-convo-next-section-hint]');

    expect(container.querySelector('[data-convo-launch-banner]')).toBeNull();
    expect(heroTop).not.toBeNull();
    expect(heroMeta).not.toBeNull();
    expect(heroMedia).not.toBeNull();
    expect(facts).not.toBeNull();
    expect(heroMeta).toContainElement(facts);
    expect(hint).not.toBeNull();
    expect(heroTop!.compareDocumentPosition(heroMedia!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(heroMedia!.compareDocumentPosition(hint!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});
