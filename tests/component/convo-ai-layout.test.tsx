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

  it('connects every hero video to a readable stage description', () => {
    const { container } = render(
      <ConvoAiLayout meta={meta} locale="en">
        <section id="context-thesis">Story</section>
      </ConvoAiLayout>,
    );

    const videos = Array.from(container.querySelectorAll('video'));
    expect(videos).toHaveLength(2);
    videos.forEach((video) => {
      const descriptionId = video.getAttribute('aria-describedby');
      expect(descriptionId).toBeTruthy();
      expect(container.querySelector(`#${descriptionId}`)).toHaveTextContent(
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
  ])('renders the $locale launch banner after facts and before the next-section hint', ({
    locale,
    title,
    subtitle,
    factsLabel,
  }) => {
    const { container } = render(
      <ConvoAiLayout meta={meta} locale={locale}>
        <section id="context-thesis">Story</section>
      </ConvoAiLayout>,
    );

    const banner = container.querySelector('[data-convo-launch-banner]');
    const facts = container.querySelector(`dl[aria-label="${factsLabel}"]`);
    const hint = container.querySelector('[data-convo-next-section-hint]');

    expect(banner).toBeVisible();
    expect(banner).toHaveAttribute('role', 'region');
    expect(banner).toHaveAccessibleName(title);
    expect(banner).toHaveTextContent(title);
    expect(banner).toHaveTextContent(subtitle);
    expect(facts).not.toBeNull();
    expect(hint).not.toBeNull();
    expect(facts!.compareDocumentPosition(banner!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(banner!.compareDocumentPosition(hint!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

    const artwork = banner!.querySelector('[data-convo-launch-artwork]');
    expect(artwork).toHaveAttribute('aria-hidden', 'true');
    expect(artwork?.querySelectorAll('img')).toHaveLength(3);
    expect(banner!.querySelector('a, button')).toBeNull();
  });
});
