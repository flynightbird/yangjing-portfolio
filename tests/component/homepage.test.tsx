import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AboutPreview } from '@/components/home/about-preview';
import { DualIdentityHero } from '@/components/home/dual-identity-hero';
import { FeaturedWork } from '@/components/home/featured-work';
import { VisualArchive } from '@/components/home/visual-archive';

afterEach(cleanup);

describe('DualIdentityHero', () => {
  it('gives both identities equal semantic weight and keeps missing portrait honest', () => {
    const { container } = render(<DualIdentityHero locale="en" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Product Designer' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'AI-native Builder' }),
    ).toBeVisible();

    const draftPortrait = container.querySelector(
      '[data-publication-state="draft"][data-media="portrait"]',
    );
    expect(draftPortrait).toBeInTheDocument();
    expect(draftPortrait).toHaveTextContent('Portrait awaiting approved photography');
    expect(within(draftPortrait as HTMLElement).queryByRole('img')).not.toBeInTheDocument();
  });
});

describe('FeaturedWork', () => {
  it('renders the five approved project treatments in order', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const projectIds = Array.from(
      container.querySelectorAll<HTMLElement>('[data-project-id]'),
    ).map((project) => project.dataset.projectId);

    expect(projectIds).toEqual([
      'xuelang',
      'call-agent',
      'meeting',
      'aidx',
      'stt-demo',
    ]);
    expect(container.querySelectorAll('[data-project-kind="build-lab"]')).toHaveLength(1);
  });

  it('uses the complete Xuelang route and keeps Meeting draft', () => {
    render(<FeaturedWork locale="en" />);

    expect(screen.getByRole('link', { name: 'View case study Xuelang Commercial Experience Upgrade' })).toHaveAttribute(
      'href',
      '/en/work/xuelang/',
    );
    expect(screen.getByRole('link', { name: 'Open draft case Meeting' })).toHaveAttribute(
      'href',
      '/en/work/meeting/',
    );
  });

  it('opens every homepage project destination in a secure new tab', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    for (const project of container.querySelectorAll<HTMLElement>('[data-project-id]')) {
      const link = project.querySelector('a');
      expect(link, project.dataset.projectId).not.toBeNull();
      expect(link).toHaveAttribute('target', '_blank');
      expect(link?.getAttribute('rel')).toContain('noopener');
      expect(link?.getAttribute('rel')).toContain('noreferrer');
    }
  });

  it('keeps AIDX external-only with a safe explicit destination', () => {
    render(<FeaturedWork locale="en" />);

    const link = screen.getByRole('link', {
      name: 'Visit live site AIDX (opens in a new tab)',
    });
    expect(link).toHaveAttribute('href', 'https://aidxtech.com/');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    expect(screen.queryByRole('link', { name: /AIDX case/i })).not.toBeInTheDocument();
  });

  it('describes Meeting through three text states without drawing fake UI', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const meeting = container.querySelector<HTMLElement>('[data-project-id="meeting"]');

    expect(meeting).toBeInTheDocument();
    expect(within(meeting as HTMLElement).getByText('Before the meeting')).toBeVisible();
    expect(within(meeting as HTMLElement).getByText('During the meeting')).toBeVisible();
    expect(within(meeting as HTMLElement).getByText('After the meeting')).toBeVisible();
    expect(within(meeting as HTMLElement).queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders verified real media for Xuelang, Call Agent, AIDX, and STT Demo', () => {
    render(<FeaturedWork locale="en" />);

    expect(screen.getByRole('img', { name: /Xuelang product panorama/i })).toHaveAttribute(
      'src',
      '/images/xuelang/hero-panorama.webp',
    );
    expect(screen.getByRole('img', { name: /Call Agent configuration/i })).toHaveAttribute(
      'src',
      '/images/call-agent/ai-preview-live.png',
    );
    expect(screen.getByRole('img', { name: /AIDX public website homepage/i })).toHaveAttribute(
      'width',
      '1440',
    );
    expect(screen.getByRole('img', { name: /STT Demo interface/i })).toHaveAttribute(
      'src',
      '/demos/stt-demo/poster.png',
    );
  });
});

describe('VisualArchive', () => {
  it('renders four real projects with distinct cover treatments', () => {
    const { container } = render(<VisualArchive locale="en" />);

    expect(container.querySelector('[data-archive-carousel]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-archive-card]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-archive-slot]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-placeholder-media]')).toHaveLength(0);
    expect(
      Array.from(container.querySelectorAll<HTMLElement>('[data-cover-variant]')).map(
        (card) => card.dataset.coverVariant,
      ),
    ).toEqual(['alibaba', 'open-language', 'doudou-fox', 'mr-chong']);
    expect(
      screen.getByRole('button', { name: 'Previous archive project' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Next archive project' }),
    ).toBeEnabled();
    expect(container.querySelector('[data-archive-position]')).toHaveTextContent(
      '01 / 04',
    );
  });

  it('renders English company, period, description, and skills for every project', () => {
    const { container } = render(<VisualArchive locale="en" />);

    expect(screen.getByText('Alibaba')).toBeVisible();
    expect(screen.getAllByText('ByteDance')).toHaveLength(2);
    expect(screen.getByText('Tongcheng Travel')).toBeVisible();
    expect(container.querySelector('[data-cover-variant="alibaba"] [data-archive-period]')).toHaveTextContent('2019–2020.12');
    expect(container.querySelector('[data-cover-variant="doudou-fox"] [data-archive-period]')).toHaveTextContent('2021.09–10');
    expect(screen.getByText('Mei Ping Mei Wu')).toBeVisible();
    expect(screen.getByText('Design Principles')).toBeVisible();
    expect(screen.getByText('Doudou Fox')).toBeVisible();
    expect(screen.getByText('MR CHONG')).toBeVisible();
    expect(
      screen.getByText(/A home-design tool and platform from Alibaba/),
    ).toBeVisible();
    expect(container.querySelectorAll('[data-archive-skills]')).toHaveLength(4);
    expect(screen.getAllByText('Skills')).toHaveLength(4);
    expect(screen.getByText('IP Design')).toBeVisible();
    expect(screen.getByText('C4D')).toBeVisible();
  });

  it('localizes project content and carousel controls in Chinese', () => {
    render(<VisualArchive locale="zh" />);

    expect(screen.getByRole('button', { name: '上一个视觉项目' })).toBeVisible();
    expect(screen.getByRole('button', { name: '下一个视觉项目' })).toBeVisible();
    expect(screen.getByText('每平每屋')).toBeVisible();
    expect(screen.getByText('开言设计原则')).toBeVisible();
    expect(screen.getByText('豆豆狐')).toBeVisible();
    expect(
      screen.getByText(/阿里巴巴旗下的家居装修设计师工具和平台/),
    ).toBeVisible();
    expect(screen.getAllByText('技能')).toHaveLength(4);
  });
});

describe('AboutPreview', () => {
  it('uses only the approved career arc and opportunity proposition', () => {
    render(<AboutPreview locale="zh" />);

    expect(
      screen.getByText(
        '从大规模 C 端产品设计，进入复杂 B2B 与 AI 系统，再走向 AI 辅助的产品构建。',
      ),
    ).toBeVisible();
    expect(
      screen.getByText('产品设计 + AI 原型，从复杂想法到可运行体验。'),
    ).toBeVisible();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
