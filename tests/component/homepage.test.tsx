import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    expect(
      screen.getByText('专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。'),
    ).toBeVisible();
    expect(
      screen.getByText(
        '通过 Vibe Coding 探索、验证并构建可运行的产品体验，借助 AIGC 拓展视觉表达、提升设计效率。',
      ),
    ).toBeVisible();
  });
});

describe('IntroStory', () => {
  it('renders the approved three-stage English introduction and AI toolchain', () => {
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
    expect(scenes[2]).toHaveTextContent(
      'I work fluently with Codex, Claude Design, and Figma Make to explore ideas and turn designs into working products. With AIGC tools such as Midjourney and Jimeng AI, I expand the visual language and bring greater coherence and polish to the product.',
    );
    expect(
      Array.from(scenes[2].querySelectorAll('[data-intro-support-emphasis]')).map(
        (element) => element.textContent,
      ),
    ).toEqual(['Codex', 'Claude Design', 'Figma Make', 'Midjourney', 'Jimeng AI']);
  });

  it('renders the approved three-stage Chinese introduction', () => {
    const { container } = render(<IntroStory locale="zh" />);
    const scenes = container.querySelectorAll('[data-intro-scene]');
    const normalizeSceneText = (text: string | null) =>
      text?.replace(/\s+/g, ' ').replace(/。 (?=\S)/g, '。').trim();

    expect(Array.from(scenes, (scene) => normalizeSceneText(scene.textContent))).toEqual([
      '嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师，也长期从事用户研究。这是一个由我设计，并通过 Vibe Coding 构建的作品集。',
      '我的工作覆盖大规模 C 端产品、复杂 B2B 产品与 AI 系统，结合 UX/UI 设计与用户研究，将复杂状态梳理为清晰、可控且具有一致视觉表达的产品体验。',
      '现在，我也借助 AI 将设计判断转化为可运行的产品，从概念探索、原型验证走向真实体验。我使用 Codex、Claude Design 与 Figma Make 进行设计探索与产品构建，并结合 Midjourney、即梦等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。',
    ]);
    expect(scenes[0].querySelector('[data-intro-support]')).toBeInTheDocument();
    expect(
      Array.from(scenes[2].querySelectorAll('[data-intro-support-emphasis]')).map(
        (element) => element.textContent,
      ),
    ).toEqual(['Codex', 'Claude Design', 'Figma Make', 'Midjourney', '即梦']);
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
  it('maps an explicit horizontal touch drag without changing on vertical intent', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const comparison = container.querySelector<HTMLElement>('[data-xuelang-home-comparison]');
    const slider = within(comparison as HTMLElement).getByRole('slider');
    vi.spyOn(comparison as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      right: 400,
      bottom: 260,
      left: 0,
      width: 400,
      height: 260,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(slider, {
      pointerType: 'touch',
      pointerId: 7,
      clientX: 100,
      clientY: 100,
    });
    fireEvent.pointerMove(slider, {
      pointerType: 'touch',
      pointerId: 7,
      clientX: 190,
      clientY: 104,
    });
    expect(slider).toHaveValue('59');
    fireEvent.pointerUp(slider, { pointerType: 'touch', pointerId: 7 });

    fireEvent.pointerDown(slider, {
      pointerType: 'touch',
      pointerId: 8,
      clientX: 190,
      clientY: 100,
    });
    fireEvent.pointerMove(slider, {
      pointerType: 'touch',
      pointerId: 8,
      clientX: 194,
      clientY: 150,
    });
    expect(slider).toHaveValue('59');
    fireEvent.pointerCancel(slider, { pointerType: 'touch', pointerId: 8 });
    expect(slider).toHaveValue('59');
  });

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

  it.each([
    { locale: 'en' as const, descriptor: 'Singapore AI company' },
    { locale: 'zh' as const, descriptor: '新加坡 AI 公司' },
  ])(
    'uses company-only AIDX metadata while preserving default metadata in $locale',
    ({ locale, descriptor }) => {
      const { container } = render(<FeaturedWork locale={locale} />);
      const aidx = container.querySelector<HTMLElement>('[data-project-id="aidx"]');
      const aidxMeta = aidx?.querySelector<HTMLElement>('[data-project-meta]');

      expect(aidxMeta).toHaveAttribute('data-meta-variant', 'company-only');
      expect(
        within(aidxMeta as HTMLElement).getByText(descriptor, { selector: '[data-company-mark] span' }),
      ).toBeVisible();
      expect(aidxMeta?.querySelector('[data-project-meta-separator]')).not.toBeInTheDocument();
      expect(aidxMeta?.querySelector('[data-project-kind-label]')).not.toBeInTheDocument();

      for (const projectId of ['call-agent', 'convo-ai', 'meeting', 'stt-demo', 'xuelang']) {
        const project = container.querySelector<HTMLElement>(
          `[data-project-id="${projectId}"]`,
        );
        const meta = project?.querySelector<HTMLElement>('[data-project-meta]');

        expect(meta).toHaveAttribute('data-meta-variant', 'default');
        expect(meta?.querySelector('[data-project-meta-separator]')).toHaveTextContent('/');
        expect(meta?.querySelector('[data-project-kind-label]')).not.toBeEmptyDOMElement();
      }
    },
  );

  it('uses one homepage CTA size hook and destination-aware external icons', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const ctas = Array.from(
      container.querySelectorAll<HTMLElement>('[data-home-project-cta]'),
    );

    expect(ctas).toHaveLength(6);
    expect(
      screen
        .getByRole('link', { name: 'View case study ConvoAI' })
        .querySelector('[data-remix-icon="arrow-right-up-line"]'),
    ).not.toBeInTheDocument();
    expect(
      screen
        .getByRole('link', { name: /Visit live site AIDX/ })
        .querySelector('[data-remix-icon="arrow-right-up-line"]'),
    ).toBeInTheDocument();

    const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
    expect(
      within(stt as HTMLElement)
        .getByRole('link', { name: /Explore Build Lab/ })
        .querySelector('[data-remix-icon="arrow-right-up-line"]'),
    ).toBeInTheDocument();
  });

  it('uses dark same-tab transitions for Call Agent and ConvoAI', () => {
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
      expect(link).toHaveAttribute('data-page-transition-tone', 'dark');
      expect(link).not.toHaveAttribute('target');
    }
  });

  it.each([
    {
      locale: 'zh' as const,
      convoAction: '查看案例 ConvoAI',
      sttProposition: '让双语对话的实时转写与翻译更清晰。',
    },
    {
      locale: 'en' as const,
      convoAction: 'View case study ConvoAI',
      sttProposition:
        'Keep bilingual conversation clear through real-time transcription and translation.',
    },
  ])(
    'renders the approved $locale project copy',
    ({ locale, convoAction, sttProposition }) => {
      const { container } = render(<FeaturedWork locale={locale} />);
      const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');

      expect(screen.getByRole('link', { name: convoAction })).toBeVisible();
      expect(within(stt as HTMLElement).getByText(sttProposition)).toBeVisible();
    },
  );

  it('renders the approved Chinese project propositions, roles, and statuses', () => {
    const { container } = render(<FeaturedWork locale="zh" />);
    const project = (id: string) =>
      within(
        container.querySelector<HTMLElement>(`[data-project-id="${id}"]`) as HTMLElement,
      );

    expect.soft(
      project('call-agent').queryByText(
        '面向 AI 对话配置的 SaaS 产品，让 AI 对话在发布前可见、可验证、可控。',
      ),
    ).toBeVisible();
    expect.soft(
      project('call-agent').queryByText('唯一产品设计师 · 前端原型构建（Vibe Coding）'),
    ).toBeVisible();
    expect.soft(
      project('convo-ai').queryByText('为 AI 对话打造自然、清晰的跨端体验。'),
    ).toBeVisible();
    expect.soft(project('convo-ai').queryByText('唯一产品设计师')).toBeVisible();
    expect.soft(
      project('meeting').queryByText(
        '在参会者、内容、角色与设备持续变化的会议场景中，构建覆盖桌面端、Web、App 与 Pad 的实时协作体验。',
      ),
    ).toBeVisible();
    expect.soft(project('meeting').queryByText('唯一产品设计师')).toBeVisible();
    expect.soft(project('meeting').queryByText('已在四类终端上线')).toBeVisible();
    expect.soft(project('aidx').queryByText('网站已上线')).toBeVisible();
    expect.soft(
      project('stt-demo').queryByText('让双语对话的实时转写与翻译更清晰。'),
    ).toBeVisible();
    expect.soft(
      project('stt-demo').queryByText('唯一产品设计师 · AI 辅助高保真原型'),
    ).toBeVisible();
    expect.soft(project('stt-demo').queryByText('Agora RTE 2026 大会发布')).toBeVisible();
    expect.soft(
      project('xuelang').queryByText('从卖课工具，走向高品质学习平台'),
    ).toBeVisible();
    expect.soft(project('xuelang').queryByText('项目主设计师')).toBeVisible();
  });

  it('defaults to Call Agent focus and publishes owned ConvoAI media', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    expect(container.querySelector('[data-flagship-focus]')).toHaveAttribute(
      'data-flagship-focus',
      'call-agent',
    );
    expect(container.querySelector('[data-project-id="convo-ai"]')).not.toHaveAttribute(
      'data-publication-state',
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
      'convo-ai': 'dark',
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

    for (const projectId of ['aidx', 'stt-demo']) {
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

  it.each([
    {
      locale: 'en' as const,
      beforeLabel: 'Before',
      afterLabel: 'After',
      controlLabel: 'Compare the old and new Xuelang learning experience',
    },
    {
      locale: 'zh' as const,
      beforeLabel: '旧版',
      afterLabel: '新版',
      controlLabel: '对比学浪旧版与新版学习体验',
    },
  ])('renders localized Xuelang wipe media in $locale', ({
    locale,
    beforeLabel,
    afterLabel,
    controlLabel,
  }) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const xuelang = container.querySelector<HTMLElement>('[data-project-id="xuelang"]');
    const comparison = xuelang?.querySelector<HTMLElement>('[data-xuelang-home-comparison]');

    expect(comparison).toBeInTheDocument();
    expect(within(comparison as HTMLElement).getByText(beforeLabel)).toBeVisible();
    expect(within(comparison as HTMLElement).getByText(afterLabel)).toBeVisible();
    expect(
      within(comparison as HTMLElement).getByRole('img', { name: beforeLabel }),
    ).toHaveAttribute('src', '/images/xuelang/learning-before-board.webp');
    expect(
      within(comparison as HTMLElement).getByRole('img', { name: afterLabel }),
    ).toHaveAttribute('src', '/images/xuelang/learning-after-board.webp');
    expect(xuelang?.querySelector('img[src*="hero-panorama"]')).not.toBeInTheDocument();

    const slider = within(comparison as HTMLElement).getByRole('slider', {
      name: controlLabel,
    });
    expect(slider).toHaveAttribute('min', '4');
    expect(slider).toHaveAttribute('max', '96');
    expect(slider).toHaveAttribute('step', '1');
    expect(slider).toHaveValue('38');
    expect(comparison).toHaveAttribute('data-auto-state', 'idle');
    expect(comparison).toHaveAttribute('data-auto-leg', '0');

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveValue('41');
    expect(comparison).toHaveAttribute('data-auto-state', 'cancelled');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveValue('4');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveValue('96');
  });

  it('renders verified real media for Call Agent, AIDX, and STT Demo', () => {
    const { container } = render(<FeaturedWork locale="en" />);

    const callAgent = container.querySelector<HTMLElement>('[data-project-id="call-agent"]');
    const studioFrame = callAgent?.querySelector<HTMLIFrameElement>('[data-convo-studio-frame]');
    expect(callAgent?.querySelector('[data-convo-studio-window]')).toHaveAttribute(
      'data-locale',
      'en',
    );
    expect(studioFrame).toHaveAttribute('src', '/demos/convo-ai-studio/en/index.html');
    expect(studioFrame).toHaveAttribute('tabindex', '-1');
    expect(studioFrame).toHaveAttribute('aria-hidden', 'true');
    expect(studioFrame).toHaveAttribute('sandbox', 'allow-scripts');
    expect(
      callAgent?.querySelectorAll('[data-media-radius="20"] a'),
    ).toHaveLength(1);
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

  it('uses the localized Chinese Convo AI Studio document inside Call Agent', () => {
    const { container } = render(<FeaturedWork locale="zh" />);
    const frame = container.querySelector<HTMLIFrameElement>(
      '[data-project-id="call-agent"] [data-convo-studio-frame]',
    );

    expect(frame).toHaveAttribute('src', '/demos/convo-ai-studio/zh/index.html');
    expect(frame).toHaveAttribute('title', '声网 Convo AI Studio 控制台预览');
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

  it.each([
    {
      locale: 'en' as const,
      roleLabel: 'Role',
      statusLabel: 'Status',
      status: 'Pinned static prototype',
    },
    {
      locale: 'zh' as const,
      roleLabel: '角色',
      statusLabel: '状态',
      status: 'Agora RTE 2026 大会发布',
    },
  ])('renders localized STT facts in $locale', ({ locale, roleLabel, statusLabel, status }) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
    const sttScope = within(stt as HTMLElement);

    expect.soft(sttScope.queryByText(roleLabel)).toBeVisible();
    expect.soft(sttScope.queryByText(statusLabel)).toBeVisible();
    expect.soft(sttScope.queryByText(status)).toBeVisible();
  });

  it('publishes the responsive ConvoAI homepage media sources', () => {
    const { container } = render(<FeaturedWork locale="en" />);
    const convoAi = container.querySelector<HTMLElement>('[data-project-id="convo-ai"]');
    const media = convoAi?.querySelector<HTMLElement>('[data-convo-home-media]');
    const browser = media?.querySelector('[data-convo-web-browser]');

    expect(media).toBeInTheDocument();
    expect(browser).not.toHaveAttribute('aria-hidden');
    const webSource = browser?.querySelector('source');
    const webImage = browser?.querySelector('img');
    expect(webSource).toHaveAttribute(
      'srcset',
      '/images/convo-ai/figma/web-ready.png',
    );
    expect(webSource).toHaveAttribute('media', '(min-width: 768px)');
    expect(webImage?.getAttribute('src')).toMatch(/^data:image\/gif;base64,/);
    expect(webImage).toHaveAttribute('alt', 'ConvoAI web conversation ready state');
    const phone = media?.querySelector('[data-convo-phone]');
    expect(phone?.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/convo-ai/figma/avatar-video.png',
    );
    expect(phone?.querySelector('source')).toHaveAttribute('media', '(min-width: 768px)');
    expect(phone?.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/gif;base64,/);
    const loop = media?.querySelector('[data-convo-mobile-loop]');
    expect(loop?.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/convo-ai/home-mobile-loop.gif',
    );
    expect(loop?.querySelector('source')).toHaveAttribute(
      'media',
      '(max-width: 767px) and (prefers-reduced-motion: no-preference)',
    );
    expect(loop?.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/gif;base64,/);
    const poster = media?.querySelector('[data-convo-mobile-poster]');
    expect(poster?.querySelector('source')).toHaveAttribute(
      'srcset',
      '/images/convo-ai/home-mobile-loop-poster.webp',
    );
    expect(poster?.querySelector('source')).toHaveAttribute(
      'media',
      '(max-width: 767px) and (prefers-reduced-motion: reduce)',
    );
    expect(poster?.querySelector('img')?.getAttribute('src')).toMatch(/^data:image\/gif;base64,/);
  });

  it.each(['en', 'zh'] as const)(
    'removes Call Agent and ConvoAI status and media-production copy in %s',
    (locale) => {
      const { container } = render(<FeaturedWork locale={locale} />);
      const callAgent = within(
        container.querySelector<HTMLElement>('[data-project-id="call-agent"]') as HTMLElement,
      );
      const convoAiElement = container.querySelector<HTMLElement>(
        '[data-project-id="convo-ai"]',
      ) as HTMLElement;
      const convoAi = within(convoAiElement);

      for (const removed of locale === 'zh'
        ? [
            '有限客户测试',
            '真实产品证据',
            '公开产品，等待替换项目素材',
            '临时 Web 与 App 素材',
            '当前为临时第三方图片',
          ]
        : [
            'Limited beta',
            'Real product evidence',
            'Public product, media replacement pending',
            'Temporary web and app media',
            'Temporary third-party imagery',
          ]) {
        expect.soft(callAgent.queryByText(removed, { exact: false })).not.toBeInTheDocument();
        expect.soft(convoAi.queryByText(removed, { exact: false })).not.toBeInTheDocument();
      }
      expect.soft(convoAi.queryAllByRole('img')).toHaveLength(3);
    },
  );
});

describe('VisualArchive', () => {
  it('forwards vertical wheel movement once per animation frame without cancelling it', () => {
    const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => undefined);
    const frames: FrameRequestCallback[] = [];
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frames.push(callback);
        return frames.length;
      });
    const { container } = render(<VisualArchive locale="en" />);
    const scroller = container.querySelector('[data-archive-scroller]');
    if (!(scroller instanceof HTMLElement)) throw new Error('Missing archive scroller');

    const wheels = [200, 180, 120].map((deltaY) => new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY,
      }));
    wheels.forEach((wheel) => fireEvent(scroller, wheel));

    expect(wheels.every((wheel) => !wheel.defaultPrevented)).toBe(true);
    expect(frames).toHaveLength(1);
    expect(scrollBy).not.toHaveBeenCalled();
    frames[0]?.(0);
    expect(scrollBy).toHaveBeenCalledOnce();
    expect(scrollBy).toHaveBeenCalledWith({ top: 500, behavior: 'auto' });

    requestFrame.mockRestore();
    scrollBy.mockRestore();
  });

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
    expect(
      screen.getByText(
        'More design work, presented through a lightweight, image-led selection of product, brand, and character projects.',
      ),
    ).toBeVisible();
    expect(screen.getByText('Alibaba')).toBeVisible();
    expect(screen.getAllByText('ByteDance')).toHaveLength(2);
    expect(screen.getByText('Tongcheng Travel')).toBeVisible();
    expect(container.querySelector('[data-cover-variant="alibaba"] [data-archive-period]')).toHaveTextContent('2019–2020.12');
    expect(container.querySelector('[data-cover-variant="doudou-fox"] [data-archive-period]')).toHaveTextContent('2021.09–10');
    expect(screen.getByText('Tangping')).toBeVisible();
    expect(screen.queryByText('Mei Ping Mei Wu')).not.toBeInTheDocument();
    const archive = screen.getByRole('region', { name: 'Visual Archive projects' });
    expect(
      within(archive).getAllByRole('button', { name: /^Open project image:/ }),
    ).toHaveLength(4);
    expect(within(archive).queryByRole('link', { name: /Tangping/ })).not.toBeInTheDocument();
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
    const { container } = render(<VisualArchive locale="zh" />);

    expect(
      screen.getByRole('heading', { name: 'More C 端产品作品' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        '以视觉卡片为主，呈现更多产品、品牌与角色设计。',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: '上一个视觉项目' })).toBeVisible();
    expect(screen.getByRole('button', { name: '下一个视觉项目' })).toBeVisible();
    expect(screen.getByText('躺平')).toBeVisible();
    expect(screen.queryByText('每平每屋')).not.toBeInTheDocument();
    const archive = screen.getByRole('region', { name: '视觉作品集项目' });
    expect(
      within(archive).getAllByRole('button', { name: /^打开项目图片:/ }),
    ).toHaveLength(4);
    expect(within(archive).queryByRole('link', { name: /躺平/ })).not.toBeInTheDocument();
    expect(screen.getByText('开言设计原则')).toBeVisible();
    expect(screen.getByText('豆豆狐')).toBeVisible();
    const archiveCard = (variant: string) =>
      within(
        container.querySelector<HTMLElement>(
          `[data-cover-variant="${variant}"]`,
        ) as HTMLElement,
      );
    expect(archiveCard('alibaba').getByText(
      '面向家居装修设计师的工具与平台。升级 App 与官网主站体验，并强化产品的品牌表达。',
    )).toBeVisible();
    expect(archiveCard('open-language').getByText(
      '字节跳动旗下的语言学习 App。探索新的设计原则，提升视觉一致性与体验品质。',
    )).toBeVisible();
    expect(archiveCard('doudou-fox').getByText(
      '字节跳动旗下的儿童语言学习 App。设计英语闯关体验，让学习任务更直观，也更具游戏感。',
    )).toBeVisible();
    expect(archiveCard('mr-chong').getByText(
      '为同程旅游某业务线打造可延展的品牌 IP，并完成三维角色、动作与视觉表达。',
    )).toBeVisible();
    expect(screen.getAllByText('技能')).toHaveLength(4);
  });

  it('opens the ordered Doudou Fox and MR CHONG galleries with English controls', () => {
    const { baseElement } = render(<VisualArchive locale="en" />);

    fireEvent.click(screen.getByRole('button', { name: 'Open project image: Doudou Fox' }));

    expect(screen.getByRole('dialog', { name: /Doudou Fox/ })).toHaveAttribute(
      'data-lightbox-variant',
      'archive',
    );
    expect(screen.getByText('01 / 07')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Previous gallery image' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next gallery image' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close image' })).toBeVisible();
    expect(baseElement.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: 'Close image' }));
    fireEvent.click(screen.getByRole('button', { name: 'Open project image: MR CHONG' }));

    expect(
      screen.getByRole('status', { name: 'Gallery position: 01 / 04' }),
    ).toHaveTextContent('01 / 04');
    expect(baseElement.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(4);
  });

  it('opens the ordered Doudou Fox and MR CHONG galleries with Chinese controls', () => {
    const { baseElement } = render(<VisualArchive locale="zh" />);

    fireEvent.click(screen.getByRole('button', { name: '打开项目图片: 豆豆狐' }));

    expect(screen.getByText('01 / 07')).toBeVisible();
    expect(screen.getByRole('button', { name: '上一张图片' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '下一张图片' })).toBeVisible();
    expect(screen.getByRole('button', { name: '关闭图片' })).toBeVisible();
    expect(baseElement.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(7);

    fireEvent.click(screen.getByRole('button', { name: '关闭图片' }));
    fireEvent.click(screen.getByRole('button', { name: '打开项目图片: MR CHONG' }));

    expect(screen.getByRole('status', { name: '画廊位置: 01 / 04' })).toHaveTextContent(
      '01 / 04',
    );
    expect(baseElement.querySelectorAll('[data-gallery-mobile] img')).toHaveLength(4);
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
