import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollReveal } from '@/components/ui/scroll-reveal';
import styles from '@/components/ui/scroll-reveal.module.css';

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

  trigger(isIntersecting: boolean) {
    const target = [...this.observed][0];
    if (!target) throw new Error('Observer has no target');

    this.callback(
      [{ isIntersecting, target } as IntersectionObserverEntry],
      this,
    );
  }
}

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') && matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe('ScrollReveal', () => {
  beforeEach(() => {
    ControllableIntersectionObserver.instances = [];
    mockReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', ControllableIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('starts pending, combines its root class, and observes the root with the reveal options', () => {
    const { container } = render(
      <ScrollReveal className="section-shell">
        <p data-scroll-reveal-group>Content</p>
      </ScrollReveal>,
    );
    const root = container.querySelector<HTMLElement>('[data-scroll-reveal]');
    const observer = ControllableIntersectionObserver.instances[0];

    expect(root).toHaveClass(styles.root, 'section-shell');
    expect(root).toHaveAttribute('data-scroll-reveal-state', 'pending');
    expect(observer).toBeDefined();
    expect(observer.root).toBeNull();
    expect(observer.rootMargin).toBe('0px 0px -8% 0px');
    expect(observer.thresholds).toEqual([0.12]);
    expect(observer.observe).toHaveBeenCalledWith(root);
  });

  it('reveals only after intersection and disconnects once', () => {
    const { container } = render(
      <ScrollReveal>
        <p data-scroll-reveal-group>Content</p>
      </ScrollReveal>,
    );
    const root = container.querySelector('[data-scroll-reveal]');
    const observer = ControllableIntersectionObserver.instances[0];

    act(() => observer.trigger(false));
    expect(root).toHaveAttribute('data-scroll-reveal-state', 'pending');
    expect(observer.disconnect).not.toHaveBeenCalled();

    act(() => observer.trigger(true));
    expect(root).toHaveAttribute('data-scroll-reveal-state', 'revealed');
    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });

  it('reveals on the next animation frame without IntersectionObserver', () => {
    let frameCallback: FrameRequestCallback | undefined;
    const requestFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        frameCallback = callback;
        return 1;
      });
    vi.stubGlobal('IntersectionObserver', undefined);

    const { container } = render(
      <ScrollReveal>
        <p data-scroll-reveal-group>Content</p>
      </ScrollReveal>,
    );
    const root = container.querySelector('[data-scroll-reveal]');

    expect(root).toHaveAttribute('data-scroll-reveal-state', 'pending');
    expect(requestFrame).toHaveBeenCalledTimes(1);

    act(() => frameCallback?.(0));
    expect(root).toHaveAttribute('data-scroll-reveal-state', 'revealed');
  });

  it('renders revealed immediately without observing when reduced motion is requested', () => {
    mockReducedMotion(true);

    const { container } = render(
      <ScrollReveal>
        <p data-scroll-reveal-group>Content</p>
      </ScrollReveal>,
    );

    expect(container.querySelector('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal-state',
      'revealed',
    );
    expect(ControllableIntersectionObserver.instances).toHaveLength(0);
  });
});
