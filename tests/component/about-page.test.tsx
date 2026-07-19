import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AboutPage } from '@/components/about/about-page';

afterEach(cleanup);

describe('AboutPage', () => {
  it('presents the approved English capability and career structure', () => {
    const { container } = render(<AboutPage locale="en" />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'AI-native product designer. Product judgment, made tangible.',
      }),
    ).toBeVisible();

    const capabilitySection = container.querySelector('[data-about-capabilities]');
    expect(capabilitySection).not.toBeNull();
    const capabilityCards = within(capabilitySection as HTMLElement).getAllByRole('article');
    expect(capabilityCards).toHaveLength(4);
    capabilityCards.forEach((card) => {
      expect(card).toHaveAttribute('data-card-visual', 'reference-b');
      expect(card.querySelector('svg')).not.toBeNull();
      expect(card.querySelectorAll('[data-card-corner]')).toHaveLength(2);
    });
    expect(capabilitySection?.querySelector('[data-transform-arrow]')).toHaveAttribute(
      'd',
      'M106 55h37m-5-4.5 5 4.5-5 4.5',
    );
    expect(capabilitySection?.querySelector('[data-transform-spark]')).not.toBeNull();
    expect(screen.getByText('Make complexity feel clear')).toBeVisible();
    expect(screen.getByText('Expressive interfaces')).toBeVisible();
    expect(screen.getByText('Design and build, as one workflow.')).toBeVisible();
    expect(screen.getByText('Make design a team capability')).toBeVisible();

    const timeline = container.querySelector('[data-about-timeline]');
    expect(timeline).not.toBeNull();
    expect(within(timeline as HTMLElement).getAllByRole('listitem')).toHaveLength(5);
    expect(screen.getByText('2021.07–2022.07')).toBeVisible();
    expect(screen.getByText('2022.07–Present')).toBeVisible();
    expect(screen.getByText('Alibaba · TDesign')).toBeVisible();
    expect(screen.getByText('Experience Design')).toBeVisible();
    expect(screen.getByText('Not complex production backends')).toBeVisible();
    expect(container).not.toHaveTextContent(/AIDX/i);
    expect(container).not.toHaveTextContent(/\bship\b/i);
  });

  it('provides the Chinese version without changing the evidence boundary', () => {
    const { container } = render(<AboutPage locale="zh" />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'AI 原生产品设计师，让产品判断成为可体验的现实。',
      }),
    ).toBeVisible();
    expect(screen.getByText('不承担复杂生产级后端开发')).toBeVisible();
    expect(screen.getByText('阿里巴巴·躺平设计家')).toBeVisible();
    expect(screen.getByText('体验设计')).toBeVisible();
    expect(screen.getByText('字节跳动')).toBeVisible();
    expect(screen.getByText('声网 Agora')).toBeVisible();
    expect(container).not.toHaveTextContent(/AIDX/i);
  });
});
