import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { AboutPreview } from '@/components/home/about-preview';
import { DualIdentityHero } from '@/components/home/dual-identity-hero';
import { FeaturedWork } from '@/components/home/featured-work';
import { IntroStory } from '@/components/home/intro-story';
import { VisualArchive } from '@/components/home/visual-archive';

afterEach(cleanup);

describe('DualIdentityHero', () => {
  it('gives both identities equal semantic weight in the interactive portrait scene', () => {
    const { container } = render(<DualIdentityHero locale="en" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Product Designer' }),
    ).toBeVisible();
    expect(
      screen.getByRole('heading', { level: 2, name: 'AI-native Builder' }),
    ).toBeVisible();

    const portraitScene = container.querySelector('[data-media="portrait"]');
    expect(portraitScene).toBeInTheDocument();
    expect(portraitScene).not.toHaveAttribute('data-publication-state', 'draft');
    expect(
      within(portraitScene as HTMLElement).getByRole('img', {
        name: 'Yang Jing portrait frame',
      }),
    ).toHaveAttribute('src', expect.stringContaining('yang-jing-hero-placeholder.png'));

    expect(screen.getByRole('separator', { name: 'Adjust identity reveal' })).toHaveAttribute(
      'aria-valuenow',
      '48',
    );
    expect(container.querySelector('[data-hero-code-canvas]')).toBeInTheDocument();
    expect(container.querySelector('[data-designer-art="material-blueprint"]')).toBeInTheDocument();
  });

  it('keeps the role titles in English in the Chinese locale', () => {
    render(<DualIdentityHero locale="zh" />);

    expect(screen.getByRole('heading', { level: 2, name: 'Product Designer' })).toBeVisible();
    expect(screen.getByRole('heading', { level: 2, name: 'AI-native Builder' })).toBeVisible();
  });
});

describe('IntroStory', () => {
  it('renders three naturally wrapping English statements with one emphasis each', () => {
    const { container } = render(<IntroStory locale="en" />);
    const scenes = container.querySelectorAll('[data-intro-scene]');

    expect(scenes).toHaveLength(3);
    expect(container.querySelectorAll('[data-intro-emphasis]')).toHaveLength(3);
    expect(container.querySelectorAll('[data-intro-line]')).toHaveLength(0);
    expect(scenes[0]).toHaveTextContent(
      "Hi, I'm Yang Jing, a UX/UI designer with more than a decade of experience.",
    );
    expect(scenes[2]).toHaveTextContent(
      /moving from concept and prototype to real experience/,
    );
  });

  it('renders the approved three-stage Chinese introduction', () => {
    const { container } = render(<IntroStory locale="zh" />);
    const scenes = container.querySelectorAll('[data-intro-scene]');

    expect(scenes[0]).toHaveTextContent(
      '嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师。',
    );
    expect(scenes[1]).toHaveTextContent(/将复杂状态转化为清晰、可控的产品体验/);
    expect(scenes[2]).toHaveTextContent(/从概念、原型走向真实体验/);
  });

  it('provides three progress controls and exposes the first scene as current', () => {
    render(<IntroStory locale="en" />);

    const controls = screen.getAllByRole('button', {
      name: /Go to introduction statement/i,
    });
    expect(controls).toHaveLength(3);
    expect(controls[0]).toHaveAttribute('aria-current', 'step');
    expect(controls[1]).not.toHaveAttribute('aria-current');
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
    const { container } = render(<FeaturedWork locale="en" />);

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
    const sttDemo = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
    expect(
      within(sttDemo as HTMLElement).getByRole('img', { name: /STT Demo product stage/i }),
    ).toHaveAttribute('src', '/images/stt-demo/stt-product-stage@2x.png');
    expect(sttDemo?.querySelector('iframe')).not.toBeInTheDocument();
    expect(sttDemo?.querySelector('[data-stt-media-stage]')).toBeInTheDocument();
    expect(sttDemo?.querySelector('[data-stt-browser-window]')).toBeInTheDocument();
  });

  it('opens the complete STT Demo directly from both homepage actions', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const sttDemo = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
    const links = within(sttDemo as HTMLElement).getAllByRole('link');

    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', '/demos/stt-demo/index.html');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    }
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
