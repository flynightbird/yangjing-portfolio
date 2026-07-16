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
});

describe('IntroStory', () => {
  it('renders four English story scenes with two deliberate lines each', () => {
    const { container } = render(<IntroStory locale="en" />);
    const scenes = container.querySelectorAll('[data-intro-scene]');

    expect(scenes).toHaveLength(4);
    for (const scene of scenes) {
      expect(scene.querySelectorAll('[data-intro-line]')).toHaveLength(2);
    }

    expect(screen.getByText('I design where product scale')).toBeVisible();
    expect(screen.getByText('into working products with AI.')).toBeVisible();
  });

  it('renders the approved Chinese career arc', () => {
    render(<IntroStory locale="zh" />);

    expect(screen.getByText('我在产品规模与')).toBeVisible();
    expect(screen.getByText('系统复杂度的交界处设计')).toBeVisible();
    expect(screen.getByText('把想法做成可运行产品')).toBeVisible();
  });

  it('provides four real progress controls and exposes the first scene as current', () => {
    render(<IntroStory locale="en" />);

    const controls = screen.getAllByRole('button', { name: /Go to introduction statement/i });
    expect(controls).toHaveLength(4);
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
      'aidx',
      'meeting',
      'xuelang',
      'stt-demo',
    ]);
    expect(container.querySelectorAll('[data-project-kind="build-lab"]')).toHaveLength(1);
  });

  it('provides three independent secure links for each flagship project', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    for (const id of ['call-agent', 'convo-ai']) {
      const project = container.querySelector<HTMLElement>(`[data-project-id="${id}"]`);
      const links = within(project as HTMLElement).getAllByRole('link');

      expect(links).toHaveLength(3);
      for (const link of links) {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link.getAttribute('rel')).toContain('noopener');
        expect(link.getAttribute('rel')).toContain('noreferrer');
      }
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
    expect(container.querySelectorAll('[data-media-radius="20"]')).toHaveLength(2);
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

  it('opens STT Demo as the pinned interactive artifact without an intermediate case page', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
    const link = within(stt as HTMLElement).getByRole('link');

    expect(link).toHaveAttribute('href', '/demos/stt-demo/index.html');
    expect(link).toHaveAttribute('target', '_blank');
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
  it('renders eight honest development slots and no fabricated images', () => {
    const { container } = render(<VisualArchive locale="en" />);
    const slots = container.querySelectorAll(
      '[data-publication-state="draft"][data-archive-slot]',
    );

    expect(slots).toHaveLength(8);
    expect(screen.getAllByText('Draft media slot')).toHaveLength(8);
    expect(container.querySelectorAll('img')).toHaveLength(0);
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
