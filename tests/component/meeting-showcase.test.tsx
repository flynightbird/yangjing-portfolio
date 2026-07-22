import { readFileSync } from 'node:fs';
import type { ComponentType } from 'react';
import { createElement } from 'react';

import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ShowcaseProof } from '@/components/meeting/meeting-showcase';

const filmReadiness = vi.hoisted(() => ({ ready: true }));

vi.mock('@/components/meeting/meeting-film-readiness.server', () => ({
  meetingFilmSourcesReady: () => filmReadiness.ready,
}));

type ShowcaseComponent = ComponentType<Record<string, unknown>>;

async function loadShowcaseComponent(name: string): Promise<ShowcaseComponent | undefined> {
  const showcase = await import('@/components/meeting/meeting-showcase');
  return (showcase as unknown as Record<string, ShowcaseComponent | undefined>)[name];
}

afterEach(() => {
  filmReadiness.ready = true;
});

describe('Meeting Product Film showcase helpers', () => {
  it('renders a concise FilmTitle without a numbered eyebrow', async () => {
    const FilmTitle = await loadShowcaseComponent('FilmTitle');
    expect(FilmTitle).toBeTypeOf('function');
    if (!FilmTitle) return;

    const { container } = render(createElement(FilmTitle, {
      title: 'One meeting system. Four device classes.',
      supportingLine: 'Agora Meeting keeps the right content primary as people present, create, and communicate.',
    }));

    expect(screen.getByRole('heading', {
      level: 2,
      name: 'One meeting system. Four device classes.',
    })).toBeVisible();
    expect(screen.getByText(/keeps the right content primary/)).toBeVisible();
    expect(container.querySelector('[data-film-title]')).not.toHaveTextContent(/\d{2}\s*\//);
  });

  it.each([
    ['en', ['People', 'Current content', 'Device context']],
    ['zh', ['参会者', '当前内容', '设备环境']],
  ] as const)('renders three unframed %s challenge triggers', async (locale, labels) => {
    const ChallengeTriggers = await loadShowcaseComponent('ChallengeTriggers');
    expect(ChallengeTriggers).toBeTypeOf('function');
    if (!ChallengeTriggers) return;

    const { container } = render(createElement(ChallengeTriggers, { locale }));
    expect(container.querySelector('[data-challenge-triggers]')).not.toBeNull();
    expect(container.querySelectorAll('[data-challenge-trigger]')).toHaveLength(3);
    for (const label of labels) expect(screen.getByText(label)).toBeVisible();
  });

  it('groups the static film title and description as spaced block copy', async () => {
    filmReadiness.ready = false;
    const FilmActMedia = await loadShowcaseComponent('FilmActMedia');
    expect(FilmActMedia).toBeTypeOf('function');
    if (!FilmActMedia) return;

    const { container } = render(createElement(FilmActMedia, {
      clipId: 'meeting-web-transcription',
      locale: 'en',
      title: 'Web transcription workspace',
      description: 'The transcript and meeting stage share the workspace while primary content stays clear.',
      replayLabel: 'Replay',
    }));

    expect(container.querySelector('video')).not.toBeInTheDocument();
    const copy = container.querySelector('figcaption[data-film-static-copy]');
    expect(copy).toBeInTheDocument();
    expect(copy?.querySelector(':scope > strong')).toHaveTextContent('Web transcription workspace');
    expect(copy?.querySelector(':scope > span')).toHaveTextContent(
      'The transcript and meeting stage share the workspace while primary content stays clear.',
    );

    const showcaseStyles = readFileSync(
      'components/meeting/meeting-showcase.module.css',
      'utf8',
    );
    expect(showcaseStyles).toMatch(
      /\.staticCopy\s*{[^}]*display:\s*grid[^}]*gap:\s*0\.125rem/s,
    );
  });

  it.each([
    ['en', 'Behind the film is a system of priorities.'],
    ['zh', '镜头背后，是一套优先级系统。'],
  ] as const)('renders the solid-turn statement in %s', async (locale, statement) => {
    const FilmTurn = await loadShowcaseComponent('FilmTurn');
    expect(FilmTurn).toBeTypeOf('function');
    if (!FilmTurn) return;

    const { container } = render(createElement(FilmTurn, { locale }));
    expect(container.querySelector('[data-film-turn]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: statement })).toBeVisible();
  });

  it.each([
    ['en', 'Supporting panels move around the stage.'],
    ['zh', '辅助面板围绕舞台移动。'],
  ] as const)('uses the inspected %s Web layout recording', async (locale, description) => {
    const FilmActMedia = await loadShowcaseComponent('FilmActMedia');
    expect(FilmActMedia).toBeTypeOf('function');
    if (!FilmActMedia) return;

    const { container } = render(createElement(FilmActMedia, {
      clipId: 'meeting-web-layout',
      locale,
      title: locale === 'zh' ? 'Web 左右布局切换' : 'Web side-panel layout',
      description,
      replayLabel: locale === 'zh' ? '重新播放' : 'Replay',
    }));

    expect(container.querySelector('[data-film-video-ready]')).not.toBeNull();
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/meeting-web-layout.mp4',
    );
    expect(container.querySelector('[data-film-frame="browser"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-browser-dot]')).toHaveLength(3);
    expect(container.querySelector('video')).toHaveProperty('muted', true);
    expect(container.querySelector('track')).not.toBeInTheDocument();
    expect(screen.getByText(description)).toBeVisible();
    expect(container).not.toHaveTextContent(/pending source inspection|待源文件检查|静态参考图/i);
  });

  it.each([
    ['en', 'Adaptive meeting-stage interface across portrait and landscape layouts'],
    ['zh', '自适应会议舞台在横屏与竖屏布局中的界面'],
  ] as const)('uses the inspected %s orientation recordings', async (locale, alt) => {
    const StageOrientationMedia = await loadShowcaseComponent('StageOrientationMedia');
    expect(StageOrientationMedia).toBeTypeOf('function');
    if (!StageOrientationMedia) return;

    const { container } = render(createElement(StageOrientationMedia, { locale }));
    expect(container.querySelector('[data-film-video-ready]')).not.toBeNull();
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/meeting-stage-portrait.mp4',
    );
    expect(container.querySelector('[data-film-frame]')).not.toBeInTheDocument();
    expect(container.querySelector('video')).toHaveProperty('muted', true);
    expect(container.querySelector('track')).not.toBeInTheDocument();
    expect(container.querySelectorAll('img')).toHaveLength(2);
    for (const image of container.querySelectorAll('img')) {
      expect(image.getAttribute('alt')).toContain(alt);
    }
    expect(container).not.toHaveTextContent(/pending source inspection|待源文件检查|静态参考图/i);
  });

  it.each(['en', 'zh'] as const)('pairs the %s whiteboard portrait and landscape recordings', async (locale) => {
    const WhiteboardOrientationMedia = await loadShowcaseComponent('WhiteboardOrientationMedia');
    expect(WhiteboardOrientationMedia).toBeTypeOf('function');
    if (!WhiteboardOrientationMedia) return;

    const { container } = render(createElement(WhiteboardOrientationMedia, { locale }));
    expect(container.querySelector('[data-whiteboard-orientation-media]')).not.toBeNull();
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/meeting-whiteboard-portrait.mp4',
    );
  });

  it.each([
    {
      locale: 'en' as const,
      title: 'Web transcription workspace',
      description: 'The transcript and meeting stage share the workspace while primary content stays clear.',
    },
    {
      locale: 'zh' as const,
      title: 'Web 实时转写与页面利用',
      description: '转写面板与会议舞台并行展开，信息增加时仍保持主要内容清晰。',
    },
  ])('frames both $locale Web workspace clips as browser recordings', async ({ locale, title, description }) => {
    const WebWorkspaceMedia = await loadShowcaseComponent('WebWorkspaceMedia');
    expect(WebWorkspaceMedia).toBeTypeOf('function');
    if (!WebWorkspaceMedia) return;

    const { container } = render(createElement(WebWorkspaceMedia, { locale }));
    expect(container.querySelectorAll('[data-film-frame="browser"]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-browser-chrome]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-browser-dot]')).toHaveLength(6);
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/meeting-web-transcription.mp4',
    );
    expect(container.querySelectorAll('track')).toHaveLength(0);
    expect(within(container).getByText(title)).toBeVisible();
    expect(within(container).getByText(description)).toBeVisible();
  });
});

describe.each([
  {
    locale: 'en' as const,
    labels: ['4 device classes', '3 signature decisions', 'Shipped product'],
  },
  {
    locale: 'zh' as const,
    labels: ['4 类终端', '3 个核心决策', '已上线产品'],
  },
])('Meeting showcase primitives ($locale)', ({ locale, labels }) => {
  it('shows localized product proof', () => {
    render(<ShowcaseProof locale={locale} />);
    for (const label of labels) expect(screen.getByText(label)).toBeVisible();
  });

});

it('does not export the removed DeepDive primitive', async () => {
  expect(await loadShowcaseComponent('DeepDive')).toBeUndefined();
});

it('uses canonical Meeting tokens for showcase separators and muted copy', () => {
  const showcaseStyles = readFileSync(
    'components/meeting/meeting-showcase.module.css',
    'utf8',
  );
  expect(showcaseStyles).toContain('var(--meeting-line,');
  expect(showcaseStyles).toContain('var(--meeting-muted,');
  expect(showcaseStyles).not.toMatch(/var\(--line(?:,|\))/);
  expect(showcaseStyles).not.toMatch(/var\(--text-muted(?:,|\))/);
  expect(showcaseStyles).not.toMatch(/font-size:\s*(?:clamp|min|max|calc)\(/);
});

it('lets pending static posters derive their rendered height from the film aspect ratio', () => {
  const showcaseStyles = readFileSync(
    'components/meeting/meeting-showcase.module.css',
    'utf8',
  );

  expect(showcaseStyles).toMatch(
    /\.staticMedia\s+img\s*{[^}]*width:\s*100%[^}]*height:\s*auto[^}]*aspect-ratio:\s*16\s*\/\s*9/s,
  );
});
