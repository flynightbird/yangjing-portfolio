import { readFileSync } from 'node:fs';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  OrientationMatchedCut,
  ProductFilmClip,
} from '@/components/meeting/meeting-film';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const props = {
  src: '/videos/meeting/meeting-whiteboard-share.mp4',
  poster: '/images/meeting/whiteboard-multidevice.webp',
  replayLabel: 'Replay',
  title: 'Content takes the stage',
  description: 'The canvas becomes primary while participants remain present.',
  fallbackAlt: 'Whiteboard workspace across four device classes',
};

const orientationProps = {
  portrait: {
    src: '/videos/meeting/orientation-portrait.mp4',
    poster: '/images/meeting/orientation-portrait.webp',
  },
  landscape: {
    src: '/videos/meeting/orientation-landscape.mp4',
    poster: '/images/meeting/orientation-landscape.webp',
  },
  title: 'Orientation-matched continuity',
  fallbackAlt: 'The same meeting shown in its native recording',
  portraitLabel: 'Portrait',
  landscapeLabel: 'Landscape',
  showPortraitLabel: 'Show portrait recording',
  showLandscapeLabel: 'Show landscape recording',
};

function mockReducedMotion(matches: boolean) {
  const media = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  };

  vi.stubGlobal('matchMedia', vi.fn(() => media));
  return media;
}

describe('OrientationMatchedCut', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockReducedMotion(false);
  });

  it('starts with the native portrait source in a portrait device shell', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);

    const stage = container.querySelector('[data-orientation-stage]');
    const shell = container.querySelector('[data-device-shell]');
    const frame = container.querySelector('[data-orientation-frame]');
    const controls = container.querySelector('[data-orientation-controls]');
    const video = container.querySelector('video');

    expect(stage).toContainElement(shell);
    expect(shell).toContainElement(frame);
    expect(shell).toHaveAttribute('data-orientation', 'portrait');
    expect(shell?.querySelector('[data-device-hardware-cue]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(stage?.nextElementSibling).toBe(controls);
    expect(controls).toHaveAttribute('role', 'group');
    expect(video).toHaveAttribute('src', orientationProps.portrait.src);
    expect(video).toHaveAttribute('poster', orientationProps.portrait.poster);
    expect(screen.getByRole('button', { name: 'Show portrait recording' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('always mounts meaningful orientation posters for ready-state print output', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);
    const printComparison = container.querySelector(
      '[data-orientation-print-comparison]',
    );

    expect(printComparison).toBeInTheDocument();
    expect(printComparison).not.toHaveAttribute('hidden');
    expect(printComparison).not.toHaveAttribute('aria-hidden');
    expect(printComparison?.firstElementChild).toHaveAttribute('role', 'group');
    expect(printComparison?.firstElementChild).toHaveAttribute(
      'aria-label',
      orientationProps.title,
    );
    expect(printComparison?.querySelectorAll('img')).toHaveLength(2);
    expect(printComparison?.querySelectorAll('img')[0]).toHaveAttribute(
      'src',
      orientationProps.portrait.poster,
    );
    expect(printComparison?.querySelectorAll('img')[1]).toHaveAttribute(
      'src',
      orientationProps.landscape.poster,
    );
    expect(printComparison?.querySelectorAll('img')[0]).toHaveAttribute(
      'alt',
      `${orientationProps.fallbackAlt} - ${orientationProps.portraitLabel}`,
    );
    expect(printComparison?.querySelectorAll('img')[1]).toHaveAttribute(
      'alt',
      `${orientationProps.fallbackAlt} - ${orientationProps.landscapeLabel}`,
    );
    expect(screen.queryByTestId('orientation-static-comparison')).not.toBeInTheDocument();
  });

  it('targets landscape immediately and swaps to its native source at 300ms', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);
    const shell = container.querySelector('[data-device-shell]');

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));

    expect(shell).toHaveAttribute('data-orientation', 'landscape');
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );

    act(() => vi.advanceTimersByTime(299));
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );

    act(() => vi.advanceTimersByTime(1));
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.landscape.src,
    );
  });

  it('reverses the matched cut and cancels a stale pending source swap', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);
    const portrait = screen.getByRole('button', { name: 'Show portrait recording' });
    const landscape = screen.getByRole('button', { name: 'Show landscape recording' });

    fireEvent.click(landscape);
    act(() => vi.advanceTimersByTime(300));
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.landscape.src,
    );

    fireEvent.click(portrait);
    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    act(() => vi.advanceTimersByTime(300));
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );

    fireEvent.click(landscape);
    act(() => vi.advanceTimersByTime(150));
    fireEvent.click(portrait);
    act(() => vi.advanceTimersByTime(300));

    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );
  });

  it('does not schedule work for the already-selected target and clears pending work on unmount', () => {
    const { unmount } = render(<OrientationMatchedCut {...orientationProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show portrait recording' }));
    expect(vi.getTimerCount()).toBe(0);

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    expect(vi.getTimerCount()).toBe(1);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses muted native playback without subtitle tracks', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);
    const video = container.querySelector('video');

    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).not.toHaveAttribute('loop');
    expect(video).toHaveAttribute('aria-label', orientationProps.title);
    expect(container.querySelector('track')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    act(() => vi.advanceTimersByTime(300));

    expect(container.querySelector('video')).toHaveProperty('muted', true);
    expect(container.querySelector('track')).not.toBeInTheDocument();
  });

  it('uses supplied localized labels for its segmented control', () => {
    render(
      <OrientationMatchedCut
        {...orientationProps}
        title="方向匹配切换"
        portraitLabel="竖屏"
        landscapeLabel="横屏"
        showPortraitLabel="显示竖屏录制"
        showLandscapeLabel="显示横屏录制"
      />,
    );

    const portraitButton = screen.getByRole('button', { name: '显示竖屏录制' });
    expect(portraitButton.closest('[role="group"]')).toHaveAttribute(
      'aria-label',
      '方向匹配切换',
    );
    expect(portraitButton).toHaveTextContent(/^竖屏$/);
    expect(screen.getByRole('button', { name: '显示横屏录制' })).toHaveTextContent(/^横屏$/);
  });

  it('renders a subscribed static poster comparison for reduced motion', () => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    const media = mockReducedMotion(true);
    const { container, unmount } = render(<OrientationMatchedCut {...orientationProps} />);
    const comparison = screen.getByTestId('orientation-static-comparison');

    expect(comparison).toHaveAttribute('data-orientation-static-comparison');
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: `${orientationProps.fallbackAlt} - ${orientationProps.portraitLabel}`,
      }),
    ).toHaveAttribute('src', orientationProps.portrait.poster);
    expect(
      screen.getByRole('img', {
        name: `${orientationProps.fallbackAlt} - ${orientationProps.landscapeLabel}`,
      }),
    ).toHaveAttribute('src', orientationProps.landscape.poster);
    expect(media.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    const listener = media.addEventListener.mock.calls[0]?.[1];
    unmount();
    expect(media.removeEventListener).toHaveBeenCalledWith('change', listener);
  });

  it('cancels a pending cut when reduced motion is enabled', () => {
    const media = mockReducedMotion(false);
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    expect(vi.getTimerCount()).toBe(1);

    const listener = media.addEventListener.mock.calls[0]?.[1] as () => void;
    act(() => {
      media.matches = true;
      listener();
    });

    expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();
    expect(vi.getTimerCount()).toBe(0);

    act(() => {
      media.matches = false;
      listener();
    });

    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );
  });

  it('invalidates a source swap when reduced motion changes at the deadline', () => {
    const media = mockReducedMotion(false);
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);
    const listener = media.addEventListener.mock.calls[0]?.[1] as () => void;

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    act(() => vi.advanceTimersByTime(299));

    act(() => {
      media.matches = true;
      listener();
      vi.advanceTimersByTime(2);
    });

    expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();

    act(() => {
      media.matches = false;
      listener();
    });

    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.portrait.src,
    );
    expect(screen.getByRole('button', { name: 'Show portrait recording' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Show landscape recording' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    act(() => vi.advanceTimersByTime(300));

    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'landscape',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      orientationProps.landscape.src,
    );
  });

  it('replaces failed transition media with the same static comparison and removes controls', () => {
    const { container } = render(<OrientationMatchedCut {...orientationProps} />);

    fireEvent.error(container.querySelector('video')!);

    expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('recovers from a stale media error when its sources change', () => {
    const { container, rerender } = render(<OrientationMatchedCut {...orientationProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    fireEvent.error(container.querySelector('video')!);
    expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();

    rerender(
      <OrientationMatchedCut
        {...orientationProps}
        portrait={{
          src: '/videos/meeting/orientation-portrait-recovered.mp4',
          poster: '/images/meeting/orientation-portrait-recovered.webp',
        }}
      />,
    );

    expect(screen.queryByTestId('orientation-static-comparison')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'portrait',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/orientation-portrait-recovered.mp4',
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });

  it('keeps an active landscape failure when unrelated portrait metadata changes', () => {
    const { container, rerender } = render(<OrientationMatchedCut {...orientationProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    act(() => vi.advanceTimersByTime(300));
    fireEvent.error(container.querySelector('video')!);

    rerender(
      <OrientationMatchedCut
        {...orientationProps}
        portrait={{
          ...orientationProps.portrait,
          poster: '/images/meeting/orientation-portrait-updated.webp',
        }}
      />,
    );

    expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('recovers when the failed active landscape source is replaced', () => {
    const { container, rerender } = render(<OrientationMatchedCut {...orientationProps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Show landscape recording' }));
    act(() => vi.advanceTimersByTime(300));
    fireEvent.error(container.querySelector('video')!);

    rerender(
      <OrientationMatchedCut
        {...orientationProps}
        landscape={{
          ...orientationProps.landscape,
          src: '/videos/meeting/orientation-landscape-recovered.mp4',
        }}
      />,
    );

    expect(screen.queryByTestId('orientation-static-comparison')).not.toBeInTheDocument();
    expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
      'data-orientation',
      'landscape',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'src',
      '/videos/meeting/orientation-landscape-recovered.mp4',
    );
    expect(screen.getAllByRole('button')).toHaveLength(2);
  });
});

describe('OrientationMatchedCut layout contract', () => {
  it('reveals the ready-state static comparison only in print', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(
      /\.orientationPrintComparison\s*{[^}]*display:\s*none/s,
    );
    expect(styles).toMatch(
      /@media\s+print\s*{[\s\S]*?\.orientationPrintComparison\s*{[^}]*display:\s*block\s*!important/s,
    );
    expect(styles).toMatch(
      /@media\s+print\s*{[\s\S]*?\.orientationStage[^}]*,[\s\S]*?\.orientationControls\s*{[^}]*display:\s*none\s*!important/s,
    );
  });

  it('reserves a stable, overridable stage around the animated frame', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(
      /\.orientationStage\s*{[^}]*--orientation-stage-block-size:\s*min\(44\.5rem,\s*calc\(100vw\s*\*\s*16\s*\/\s*9\)\)/,
    );
    expect(styles).toMatch(
      /\.orientationStage\s*{[^}]*block-size:\s*var\(--orientation-stage-block-size\)/,
    );
    expect(styles).toMatch(
      /\.orientationStage\s*{[^}]*min-block-size:\s*var\(--orientation-stage-block-size\)/,
    );
    expect(styles).toMatch(/\.orientationStage\s*{[^}]*display:\s*flex/);
    expect(styles).toMatch(/\.orientationStage\s*{[^}]*align-items:\s*center/);
    expect(styles).toMatch(/\.orientationStage\s*{[^}]*justify-content:\s*center/);
    expect(styles).not.toMatch(/\.orientationStage\s*{[^}]*transition\s*:/);
  });

  it('puts native geometry on the device shell and never crops or rotates video pixels', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(/\.deviceShell\s*{[^}]*transition:\s*width 600ms[^;}]*,\s*aspect-ratio 600ms/);
    expect(styles).toMatch(
      /\.deviceShell\[data-orientation=['"]portrait['"]\]\s*{[^}]*width:\s*min\(100%,\s*25rem\)[^}]*aspect-ratio:\s*9\s*\/\s*16/,
    );
    expect(styles).toMatch(
      /\.deviceShell\[data-orientation=['"]landscape['"]\]\s*{[^}]*width:\s*min\(100%,\s*64rem\)[^}]*aspect-ratio:\s*16\s*\/\s*9/,
    );
    expect(styles).toMatch(/\.orientationFrame\s*{[^}]*width:\s*100%/);
    expect(styles).toMatch(/\.orientationFrame\s*{[^}]*height:\s*100%/);
    expect(styles).toMatch(/\.orientationVideo\s*{[^}]*object-fit:\s*contain/);
    expect(styles).toMatch(/\.orientationVideo\s*{[^}]*transform:\s*none/);
    expect(styles).not.toMatch(/\brotate\s*:|rotate\s*\(/i);
    expect(styles).not.toMatch(/gradient/i);
  });

  it('uses a borderless pill control with accessible targets and no dividers', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(/\.orientationControls\s*{[^}]*position:\s*static/);
    expect(styles).toMatch(/\.orientationControls\s*{[^}]*border:\s*0/);
    expect(styles).toMatch(/\.orientationControls\s*{[^}]*border-radius:\s*999px/);
    expect(styles).toMatch(/\.orientationControls\s*{[^}]*padding:\s*0\.25rem/);
    expect(styles).toMatch(/\.orientationControls\s*{[^}]*background:\s*#353a3f/);
    expect(styles).toMatch(/\.orientationButton\s*{[^}]*min-width:\s*44px/);
    expect(styles).toMatch(/\.orientationButton\s*{[^}]*min-height:\s*44px/);
    expect(styles).toMatch(/\.orientationButton\s*{[^}]*border:\s*0/);
    expect(styles).toMatch(/\.orientationButton\s*{[^}]*border-radius:\s*999px/);
    expect(styles).not.toMatch(/\.orientationButton(?::last-child)?\s*{[^}]*border-(?:right|left)/);
    expect(styles).toMatch(
      /\.orientationButton\[aria-pressed=['"]true['"]\]\s*{[^}]*background:\s*#62676c/,
    );
  });

  it('lays out the static comparison responsively and disables reduced-motion transitions', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(/\.orientationComparison\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*9fr\)\s+minmax\(0,\s*16fr\)/);
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*720px\)\s*{[^}]*\.orientationComparison\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(styles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[^}]*\.deviceShell\s*{[^}]*transition:\s*none/,
    );
  });
});

describe('ProductFilmClip', () => {
  it('keeps native controls and poster content available when autoplay is unavailable', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    const video = container.querySelector('video')!;

    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('poster', props.poster);
    expect(screen.getByRole('button', { name: `Replay ${props.title}` })).toBeVisible();
    expect(container.querySelector('img')).toHaveAttribute('src', props.poster);
    expect(video).not.toHaveAttribute('hidden');
  });

  it('renders named muted native media without subtitle tracks and an inaccessible fallback image', () => {
    const { container } = render(<ProductFilmClip {...props} />);

    const figure = container.querySelector('figure[data-product-film-clip]');
    const video = container.querySelector('video');
    const fallback = container.querySelector('img');
    const replay = screen.getByRole('button', {
      name: 'Replay Content takes the stage',
    });

    expect(figure).toBeInTheDocument();
    expect(video).toHaveAttribute('src', props.src);
    expect(video).toHaveAttribute('poster', props.poster);
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveAttribute('aria-label', props.title);
    expect(video).toHaveAttribute('aria-describedby');
    expect(container.querySelector('track')).not.toBeInTheDocument();
    expect(fallback).toHaveAttribute('src', props.poster);
    expect(fallback).toHaveAttribute('alt', props.fallbackAlt);
    expect(fallback).toHaveAttribute('aria-hidden', 'true');
    expect(replay).toHaveAttribute('title', 'Replay Content takes the stage');
    expect(replay.querySelector('svg')).toBeInTheDocument();
    expect(screen.getByText(props.description).closest('figcaption')).toHaveAttribute(
      'id',
      video?.getAttribute('aria-describedby'),
    );
  });

  it('renders a stable poster without autoplay media when reduced motion is requested', () => {
    mockReducedMotion(true);
    const { container } = render(<ProductFilmClip {...props} />);

    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: props.fallbackAlt })).toBeVisible();
    expect(container.querySelector('img')).not.toHaveAttribute('aria-hidden');
    expect(
      screen.queryByRole('button', { name: 'Replay Content takes the stage' }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[data-film-footer]')).toContainElement(
      screen.getByText(props.description),
    );
    expect(
      container.querySelector('[data-film-replay-placeholder]'),
    ).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText(props.description)).toBeVisible();
  });

  it('creates unique description references for repeated clips', () => {
    const { container } = render(
      <>
        <ProductFilmClip {...props} />
        <ProductFilmClip {...props} />
      </>,
    );

    const videos = Array.from(container.querySelectorAll('video'));
    expect(videos[0]?.getAttribute('aria-describedby')).not.toBe(
      videos[1]?.getAttribute('aria-describedby'),
    );
  });

  it('restarts native playback from the beginning', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { container } = render(<ProductFilmClip {...props} />);
    const video = container.querySelector('video')!;

    Object.defineProperty(video, 'currentTime', {
      configurable: true,
      value: 18,
      writable: true,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Replay Content takes the stage' }));

    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it('uses the supplied localized replay label', () => {
    render(<ProductFilmClip {...props} replayLabel="重新播放" />);

    expect(
      screen.getByRole('button', { name: '重新播放 Content takes the stage' }),
    ).toHaveAttribute('title', '重新播放 Content takes the stage');
  });

  it('handles a rejected replay promise without surfacing an unhandled rejection', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockRejectedValue(new Error('Playback is blocked'));
    render(<ProductFilmClip {...props} />);

    fireEvent.click(screen.getByRole('button', { name: 'Replay Content takes the stage' }));
    await Promise.resolve();

    expect(play).toHaveBeenCalledTimes(1);
  });

  it('hides failed media, reveals its poster fallback, and preserves the description', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    const video = container.querySelector('video')!;
    const fallback = container.querySelector('img')!;

    fireEvent.error(video);

    expect(video).toHaveAttribute('hidden');
    expect(fallback).not.toHaveAttribute('aria-hidden');
    expect(screen.getByRole('img', { name: props.fallbackAlt })).toBeVisible();
    expect(screen.getByText(props.description)).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Replay Content takes the stage' }),
    ).not.toBeInTheDocument();
  });

  it('preserves footer geometry while replacing replay after media failure', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    const footer = container.querySelector('[data-film-footer]');

    fireEvent.error(container.querySelector('video')!);

    expect(footer).toBeInTheDocument();
    expect(container.querySelector('[data-film-footer]')).toBe(footer);
    expect(footer?.querySelector('[data-film-replay-placeholder]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(
      screen.queryByRole('button', { name: 'Replay Content takes the stage' }),
    ).not.toBeInTheDocument();
  });

  it('restores video playback controls when a new source replaces failed media', () => {
    const { container, rerender } = render(<ProductFilmClip {...props} />);
    const video = container.querySelector('video')!;

    fireEvent.error(video);
    rerender(<ProductFilmClip {...props} src="/videos/meeting/recovered.mp4" />);

    expect(video).not.toHaveAttribute('hidden');
    expect(video).toHaveAttribute('src', '/videos/meeting/recovered.mp4');
    expect(screen.getByRole('button', { name: 'Replay Content takes the stage' })).toBeVisible();
  });

  it('co-locates description and replay in a direct-child figcaption footer', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    const figure = container.querySelector('[data-product-film-clip]');
    const footer = container.querySelector('[data-film-footer]');

    expect(footer?.tagName).toBe('FIGCAPTION');
    expect(footer?.parentElement).toBe(figure);
    expect(footer).toContainElement(screen.getByText(props.description));
    expect(footer).toContainElement(
      screen.getByRole('button', { name: 'Replay Content takes the stage' }),
    );
  });

  it('uses a plain media frame by default', () => {
    const { container } = render(<ProductFilmClip {...props} />);

    expect(container.querySelector('[data-film-frame="plain"]')).toBeInTheDocument();
    expect(container.querySelector('[data-browser-chrome]')).not.toBeInTheDocument();
  });

  it('renders quiet browser chrome with exactly three dots and a centered address', () => {
    const { container } = render(<ProductFilmClip {...props} frame="browser" />);
    const chrome = container.querySelector('[data-browser-chrome]');

    expect(container.querySelector('[data-film-frame="browser"]')).toBeInTheDocument();
    expect(chrome).toHaveAttribute('aria-hidden', 'true');
    expect(chrome?.querySelectorAll('[data-browser-dot]')).toHaveLength(3);
    expect(chrome).toHaveTextContent('meeting.agora.io');
  });
});

describe('ProductFilmClip layout contract', () => {
  it('keeps media and replay geometry stable without visual video effects', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(/\.mediaFrame\s*{[^}]*border:\s*1px solid/);
    expect(styles).toMatch(/\.mediaFrame\s*{[^}]*border-radius:\s*6px/);
    expect(styles).toMatch(/\.media\s*{[^}]*aspect-ratio:\s*16\s*\/\s*9/);
    expect(styles).toMatch(/\.browserChrome\s*{[^}]*height:\s*2\.25rem/);
    expect(styles).toMatch(/\.replay\s*{[^}]*width:\s*44px/);
    expect(styles).toMatch(/\.replay\s*{[^}]*height:\s*44px/);
    expect(styles).toMatch(/\.replay\s*{[^}]*border-radius:\s*50%/);
    expect(styles).toContain('object-fit: contain');
    expect(styles).toMatch(/\.replay:focus-visible\s*{/);
    expect(styles).not.toMatch(/\.media video(?:,\s*\.fallback)?\s*{[^}]*\btransform\s*:/);
    expect(styles).not.toMatch(/gradient/i);
    expect(styles).not.toMatch(/animation:\s*[^;]*infinite/i);
  });

  it('explicitly hides inactive video and fallback media', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(
      /\.media video\[hidden\],\s*\.fallback\[hidden\]\s*{[^}]*display:\s*none/,
    );
  });

  it('replaces video with the mounted fallback in CSS-only reduced motion', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?\.media video\s*{[^}]*display:\s*none/s,
    );
    expect(styles).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*?\.fallback(?:\[hidden\])?\s*{[^}]*display:\s*block\s*!important/s,
    );
  });

  it('does not define scroll-linked or perpetual decorative motion', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).not.toMatch(/animation-timeline|scroll-timeline|infinite/);
    expect(styles).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  });

  it('keeps a stable aligned footer outside native media controls', () => {
    const styles = readFileSync('components/meeting/meeting-film.module.css', 'utf8');

    expect(styles).toMatch(/\.filmFooter\s*{[^}]*display:\s*flex/);
    expect(styles).toMatch(/\.filmFooter\s*{[^}]*min-height:\s*44px/);
    expect(styles).toMatch(/\.filmFooter\s*{[^}]*align-items:\s*center/);
    expect(styles).toMatch(/\.replayPlaceholder\s*{[^}]*width:\s*44px/);
    expect(styles).toMatch(/\.replayPlaceholder\s*{[^}]*height:\s*44px/);
    expect(styles).toMatch(/\.replay\s*{[^}]*position:\s*static/);
    expect(styles).not.toMatch(/\.replay\s*{[^}]*position:\s*absolute/);
  });
});
