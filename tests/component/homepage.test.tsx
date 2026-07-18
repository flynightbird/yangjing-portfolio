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

    expect(screen.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeInTheDocument();
    expect(screen.queryByText('Designer / Builder')).not.toBeInTheDocument();
    expect(screen.queryByText('Material Blueprint')).not.toBeInTheDocument();
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
    expect(scenes[0]).toHaveTextContent(
      '欢迎来到这个由我亲手设计，并通过 Vibe Coding 构建的作品集。',
    );
    expect(scenes[0].querySelector('[data-intro-support]')).toBeInTheDocument();
    expect(container.querySelector('[data-intro-vibe]')).toHaveTextContent(
      'Vibe Coding',
    );
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
  it('renders the six approved project treatments in order', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const projectIds = Array.from(
      container.querySelectorAll<HTMLElement>('[data-project-id]'),
    ).map((project) => project.dataset.projectId);

    expect(projectIds).toEqual([
      'call-agent',
      'convo-ai',
      'meeting',
      'stt-demo',
      'aidx',
      'xuelang',
    ]);
    expect(container.querySelectorAll('[data-project-kind="build-lab"]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-company-mark]')).toHaveLength(6);
    expect(container.querySelectorAll('[data-project-chapter]')).toHaveLength(4);
  });

  it('aligns company and project type for all six projects and reserves white CTAs for the first three', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const projects = Array.from(
      container.querySelectorAll<HTMLElement>('[data-project-id]'),
    );

    expect(projects).toHaveLength(6);
    for (const project of projects) {
      expect(project.querySelectorAll('[data-project-meta]')).toHaveLength(1);
    }

    expect(
      Array.from(container.querySelectorAll<HTMLElement>('[data-cta-treatment="white"]')).map(
        (cta) => cta.closest<HTMLElement>('[data-project-id]')?.dataset.projectId,
      ),
    ).toEqual(['call-agent', 'convo-ai', 'meeting']);
  });

  it('uses dark same-tab transitions for Call Agent and secure external links for ConvoAI', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    const callAgent = container.querySelector<HTMLElement>('[data-project-id="call-agent"]');
    const callAgentLinks = within(callAgent as HTMLElement).getAllByRole('link');
    expect(callAgentLinks).toHaveLength(3);
    for (const link of callAgentLinks) {
      expect(link).toHaveAttribute('data-page-transition-tone', 'dark');
      expect(link).not.toHaveAttribute('target');
    }

    const convoAi = container.querySelector<HTMLElement>('[data-project-id="convo-ai"]');
    const convoAiLinks = within(convoAi as HTMLElement).getAllByRole('link');
    expect(convoAiLinks).toHaveLength(3);
    for (const link of convoAiLinks) {
      expect(link).not.toHaveAttribute('data-page-transition-tone');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
      expect(link.getAttribute('rel')).toContain('noreferrer');
    }
  });

  it('defaults to Call Agent focus and marks ConvoAI media as temporary', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    expect(container.querySelector('[data-flagship-focus]')).toHaveAttribute(
      'data-flagship-focus',
      'call-agent',
    );
    expect(container.querySelector('[data-project-id="convo-ai"]')).toHaveAttribute(
      'data-publication-state',
      'temporary-media',
    );
    expect(
      container.querySelectorAll('[data-flagship-focus] [data-media-radius="20"]'),
    ).toHaveLength(2);
  });

  it('uses complete Xuelang and Meeting case routes', () => {
    render(<FeaturedWork locale="en" />);

    expect(screen.getByRole('link', { name: 'View case study Xuelang Commercial Experience Upgrade' })).toHaveAttribute(
      'href',
      '/en/work/xuelang/',
    );
    expect(screen.getByRole('link', { name: 'View case study Agora Meeting' })).toHaveAttribute(
      'href',
      '/en/work/meeting/',
    );
  });

  it('uses page sweeps only for internal case-study destinations', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    const expectedInternalTones = {
      xuelang: 'light',
      'call-agent': 'dark',
      meeting: 'dark',
    } as const;
    for (const [projectId, tone] of Object.entries(expectedInternalTones)) {
      const project = container.querySelector<HTMLElement>(`[data-project-id="${projectId}"]`);
      const links = within(project as HTMLElement).getAllByRole('link');
      for (const link of links) {
        expect(link).toHaveAttribute('data-page-transition-tone', tone);
        expect(link).not.toHaveAttribute('target');
      }
    }

    for (const projectId of ['convo-ai', 'aidx', 'stt-demo']) {
      const project = container.querySelector<HTMLElement>(`[data-project-id="${projectId}"]`);
      const links = within(project as HTMLElement).getAllByRole('link');
      for (const link of links) {
        expect(link).not.toHaveAttribute('data-page-transition-tone');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
      }
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

  it('describes Meeting through three system decisions without drawing fake UI', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const meeting = container.querySelector<HTMLElement>('[data-project-id="meeting"]');

    expect(meeting).toBeInTheDocument();
    expect(meeting).toHaveAttribute('data-publication-state', 'complete');
    expect(within(meeting as HTMLElement).getByText('Adaptive stage')).toBeVisible();
    expect(within(meeting as HTMLElement).getByText('Collaborative workspace')).toBeVisible();
    expect(within(meeting as HTMLElement).getByText('Real-time information')).toBeVisible();
    expect(within(meeting as HTMLElement).queryByText('Before the meeting')).not.toBeInTheDocument();
    expect(within(meeting as HTMLElement).queryByText('After the meeting')).not.toBeInTheDocument();
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
    const aidx = container.querySelector<HTMLElement>('[data-project-id="aidx"]');
    expect(aidx?.querySelector('[data-aidx-showcase]')).toBeInTheDocument();
    expect(aidx?.querySelector('[data-aidx-browser]')).toHaveAttribute(
      'data-browser-theme',
      'light',
    );
    expect(
      container.querySelector('[data-project-id="xuelang"] [data-project-media-frame]'),
    ).toHaveAttribute('data-media-radius', '20');
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

  it('labels both ConvoAI images as temporary placeholders', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const convoAi = container.querySelector<HTMLElement>('[data-project-id="convo-ai"]');

    expect(
      within(convoAi as HTMLElement).getByRole('img', { name: /temporary ConvoAI web/i }),
    ).toHaveAttribute('src', '/images/convo-ai/temporary-web.webp');
    expect(
      within(convoAi as HTMLElement).getByRole('img', { name: /temporary ConvoAI app/i }),
    ).toHaveAttribute('src', '/images/convo-ai/temporary-app.webp');
    expect(
      within(convoAi as HTMLElement).getByText(/replace with owned project assets/i),
    ).toBeVisible();
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

    expect(
      screen.getByRole('heading', { name: 'More Consumer Product Work' }),
    ).toBeVisible();
    expect(screen.getByText('Alibaba')).toBeVisible();
    expect(screen.getAllByText('ByteDance')).toHaveLength(2);
    expect(screen.getByText('Tongcheng Travel')).toBeVisible();
    expect(container.querySelector('[data-cover-variant="alibaba"] [data-archive-period]')).toHaveTextContent('2019–2020.12');
    expect(container.querySelector('[data-cover-variant="doudou-fox"] [data-archive-period]')).toHaveTextContent('2021.09–10');
    expect(screen.getByText('Tangping')).toBeVisible();
    expect(screen.queryByText('Mei Ping Mei Wu')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View project: Tangping' })).toHaveAttribute(
      'href',
      '/en/work/tangping/',
    );
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

    expect(
      screen.getByRole('heading', { name: 'More C端用户设计作品' }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: '上一个视觉项目' })).toBeVisible();
    expect(screen.getByRole('button', { name: '下一个视觉项目' })).toBeVisible();
    expect(screen.getByText('躺平')).toBeVisible();
    expect(screen.queryByText('每平每屋')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看项目：躺平' })).toHaveAttribute(
      'href',
      '/zh/work/tangping/',
    );
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
