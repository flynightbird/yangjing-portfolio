import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BuildLabMedia } from '@/components/home/build-lab-media';

const motionPreference = vi.hoisted(() => ({ reduced: false }));

vi.mock('motion/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('motion/react')>();

  return {
    ...actual,
    useReducedMotion: () => motionPreference.reduced,
  };
});

class ControllableIntersectionObserver implements IntersectionObserver {
  static instances: ControllableIntersectionObserver[] = [];

  readonly root: Element | Document | null;
  readonly rootMargin: string;
  readonly thresholds: readonly number[];
  readonly observe = vi.fn((target: Element) => {
    this.observed.add(target);
  });
  readonly unobserve = vi.fn((target: Element) => {
    this.observed.delete(target);
  });
  readonly disconnect = vi.fn(() => {
    this.observed.clear();
  });
  readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);

  private readonly callback: IntersectionObserverCallback;
  private readonly observed = new Set<Element>();

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.root = options.root ?? null;
    this.rootMargin = options.rootMargin ?? '0px';
    this.thresholds = Array.isArray(options.threshold)
      ? options.threshold
      : [options.threshold ?? 0];
    ControllableIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean, target = [...this.observed][0]) {
    if (!target) throw new Error('Observer has no target');

    const rect = target.getBoundingClientRect();
    this.callback(
      [
        {
          boundingClientRect: rect,
          intersectionRatio: isIntersecting ? 1 : 0,
          intersectionRect: isIntersecting ? rect : new DOMRectReadOnly(),
          isIntersecting,
          rootBounds: null,
          target,
          time: performance.now(),
        },
      ],
      this,
    );
  }
}

const renderMedia = () => render(<BuildLabMedia href="/demos/stt-demo/index.html" />);

const loadStage = () => {
  const proximityObserver = ControllableIntersectionObserver.instances[0];
  act(() => proximityObserver.trigger(true));
  return proximityObserver;
};

beforeEach(() => {
  motionPreference.reduced = false;
  ControllableIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', ControllableIntersectionObserver);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('BuildLabMedia live STT stage', () => {
  it('does not mount the iframe before proximity and configures the preload observer', () => {
    const { container } = renderMedia();
    const anchor = screen.getByRole('link', {
      name: 'Open the interactive STT Demo in a new tab',
    });

    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(anchor).toHaveAttribute('href', '/demos/stt-demo/index.html');
    expect(anchor).toHaveAttribute('target', '_blank');
    expect(anchor).toHaveAttribute('rel', 'noopener noreferrer');
    expect(anchor).toHaveAttribute('data-stt-ready', 'false');
    expect(ControllableIntersectionObserver.instances).toHaveLength(1);
    expect(ControllableIntersectionObserver.instances[0].rootMargin).toBe('600px 0px');
    expect(ControllableIntersectionObserver.instances[0].observe).toHaveBeenCalledWith(anchor);
  });

  it('mounts an inaccessible visual iframe on proximity while retaining the image fallback', () => {
    const { container } = renderMedia();
    const proximityObserver = loadStage();
    const iframe = container.querySelector('iframe');

    expect(proximityObserver.disconnect).toHaveBeenCalledTimes(1);
    expect(iframe).toHaveAttribute('src', '/demos/stt-demo/index.html?embed=stage');
    expect(iframe).toHaveAttribute('title', 'Animated STT Demo conversation stage');
    expect(iframe).toHaveAttribute('aria-hidden', 'true');
    expect(iframe).toHaveAttribute('tabindex', '-1');
    expect(
      screen.getByRole('img', {
        name: 'STT Demo product stage showing a speaker, bilingual transcript, translation, and participants',
      }),
    ).toHaveAttribute('src', '/images/stt-demo/stt-product-stage@2x.png');
  });

  it('keeps the static fallback under reduced motion', () => {
    motionPreference.reduced = true;
    const { container } = renderMedia();

    expect(container.querySelector('iframe')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: /STT Demo product stage/i })).toBeVisible();
  });

  it('posts playback changes from a separate visibility observer without marking ready', () => {
    const { container } = renderMedia();
    loadStage();
    const anchor = screen.getByRole('link');
    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage');
    const visibilityObserver = ControllableIntersectionObserver.instances[1];

    expect(visibilityObserver.thresholds).toEqual([0.05]);
    expect(visibilityObserver.observe).toHaveBeenCalledWith(anchor);

    act(() => visibilityObserver.trigger(true));
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: 'stt-stage-playback', paused: false },
      window.location.origin,
    );
    expect(anchor).toHaveAttribute('data-stt-ready', 'false');

    act(() => visibilityObserver.trigger(false));
    expect(postMessage).toHaveBeenLastCalledWith(
      { type: 'stt-stage-playback', paused: true },
      window.location.origin,
    );
  });

  it('ignores readiness messages from an invalid origin or source', () => {
    const { container } = renderMedia();
    loadStage();
    const anchor = screen.getByRole('link');
    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage');

    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'stt-stage-ready' },
          origin: 'https://invalid.example',
          source: iframe.contentWindow,
        }),
      );
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'stt-stage-ready' },
          origin: window.location.origin,
          source: window,
        }),
      );
    });

    expect(anchor).toHaveAttribute('data-stt-ready', 'false');
    expect(postMessage).not.toHaveBeenCalled();
  });

  it('accepts readiness from its iframe and immediately posts current playback state', () => {
    const { container } = renderMedia();
    loadStage();
    const anchor = screen.getByRole('link');
    const iframe = container.querySelector('iframe') as HTMLIFrameElement;
    const postMessage = vi.spyOn(iframe.contentWindow as Window, 'postMessage');
    const visibilityObserver = ControllableIntersectionObserver.instances[1];

    act(() => visibilityObserver.trigger(true));
    postMessage.mockClear();
    act(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: { type: 'stt-stage-ready' },
          origin: window.location.origin,
          source: iframe.contentWindow,
        }),
      );
    });

    expect(anchor).toHaveAttribute('data-stt-ready', 'true');
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(postMessage).toHaveBeenCalledWith(
      { type: 'stt-stage-playback', paused: false },
      window.location.origin,
    );
  });

  it('loads immediately when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const { container } = renderMedia();

    await waitFor(() => {
      expect(container.querySelector('iframe')).toHaveAttribute(
        'src',
        '/demos/stt-demo/index.html?embed=stage',
      );
    });
  });

  it('disconnects active observers and removes the message listener on unmount', () => {
    const addEventListener = vi.spyOn(window, 'addEventListener');
    const removeEventListener = vi.spyOn(window, 'removeEventListener');
    const { unmount } = renderMedia();
    const proximityObserver = loadStage();
    const visibilityObserver = ControllableIntersectionObserver.instances[1];
    const messageListener = addEventListener.mock.calls.find(
      ([type]) => type === 'message',
    )?.[1];

    unmount();

    expect(proximityObserver.disconnect).toHaveBeenCalled();
    expect(visibilityObserver.disconnect).toHaveBeenCalled();
    expect(messageListener).toBeDefined();
    expect(removeEventListener).toHaveBeenCalledWith('message', messageListener);
  });
});
