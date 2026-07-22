import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AboutPage } from '@/components/about/about-page';

afterEach(cleanup);

function expectAboutRevealStructure(
  container: HTMLElement,
  sectionTitles: readonly [string, string, string],
) {
  const aboutPage = container.querySelector('[data-about-page]');
  const hero = container.querySelector('[data-about-hero]');
  const revealBoundaries = container.querySelectorAll(
    '[data-about-page] [data-scroll-reveal]',
  );

  expect(aboutPage).not.toBeNull();
  expect(hero).not.toBeNull();
  expect(hero?.closest('[data-scroll-reveal]')).toBeNull();
  expect(hero?.querySelectorAll('[data-scroll-reveal]')).toHaveLength(0);
  expect(revealBoundaries).toHaveLength(3);

  const sectionRevealBoundaries = sectionTitles.map((title) =>
    within(aboutPage as HTMLElement)
      .getByRole('heading', { level: 2, name: title })
      .closest('[data-scroll-reveal]'),
  );
  sectionRevealBoundaries.forEach((boundary) => expect(boundary).not.toBeNull());
  expect(new Set(sectionRevealBoundaries).size).toBe(3);

  revealBoundaries.forEach((boundary) => {
    expect(boundary.querySelectorAll('[data-scroll-reveal-group="text"]')).toHaveLength(1);
    expect(boundary.querySelectorAll('[data-scroll-reveal-group="media"]')).toHaveLength(1);
  });
}

describe('AboutPage', () => {
  it('presents the approved English capability and career structure', () => {
    const { container } = render(<AboutPage locale="en" />);

    expectAboutRevealStructure(container, [
      'The design problems I solve',
      'Design value, beyond the screen',
      'Step by step, to where I am now',
    ]);
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
    const aiWorkflow = capabilitySection?.querySelector('[data-ai-workflow="continuous-signal"]');
    expect(aiWorkflow).not.toBeNull();
    expect(aiWorkflow?.querySelectorAll('[data-workflow-system]')).toHaveLength(2);
    expect(aiWorkflow?.querySelector('[data-workflow-path]')).not.toBeNull();
    expect(capabilitySection?.querySelector('[data-transform-spark]')).toBeNull();
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

    expectAboutRevealStructure(container, [
      '我解决的设计问题',
      '设计价值，不止于屏幕',
      '一步一步，走到现在',
    ]);
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
