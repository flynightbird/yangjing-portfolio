import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AboutPage } from '@/components/about/about-page';

afterEach(cleanup);

describe('AboutPage', () => {
  it('presents the approved English capability and career structure', () => {
    const { container } = render(<AboutPage locale="en" />);

    const capabilityOrbit = container.querySelector('[data-about-orbit-background]');
    expect(capabilityOrbit).toHaveAttribute(
      'data-about-orbit-background',
      '/images/about/about-hero-blue-bg.png',
    );
    expect(capabilityOrbit).toHaveAttribute('data-orbit-material', 'ice-glass');

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
    expect(screen.getByText('Independent experience validation')).toBeVisible();
    expect(
      screen.getByText(
        'Rapidly build interactive HTML with product logic using Codex and Claude.',
      ),
    ).toBeVisible();
    expect(
      screen.queryByText('* Outcomes are self-reported from my resume.'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Not complex production backends')).not.toBeInTheDocument();
    const evidenceSection = screen
      .getByRole('heading', { name: 'Design value, beyond the screen' })
      .closest('section');
    expect(evidenceSection).not.toBeNull();
    expect(within(evidenceSection as HTMLElement).getAllByRole('article')).toHaveLength(3);
    expect(container).not.toHaveTextContent(/AIDX/i);
    expect(container).not.toHaveTextContent(/\bship\b/i);
  });

  it('provides the approved Chinese evidence copy', () => {
    const { container } = render(<AboutPage locale="zh" />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'AI 原生产品设计师，让产品判断成为可体验的现实。',
      }),
    ).toBeVisible();
    expect(screen.getByText('可独立完成体验验证')).toBeVisible();
    expect(
      screen.getByText('通过 Codex、Claude 快速搭建涵盖产品逻辑的交互式 HTML'),
    ).toBeVisible();
    expect(
      screen.queryByText('* 结果数据来自个人履历中的自述。'),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('不承担复杂生产级后端开发')).not.toBeInTheDocument();
    expect(screen.getByText('阿里巴巴·躺平设计家')).toBeVisible();
    expect(screen.getByText('体验设计')).toBeVisible();
    expect(screen.getByText('字节跳动')).toBeVisible();
    expect(screen.getByText('声网 Agora')).toBeVisible();
    expect(container).not.toHaveTextContent(/AIDX/i);
  });
});
