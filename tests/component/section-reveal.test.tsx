import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SectionReveal } from '@/components/home/section-reveal';

type ObserverCallback = IntersectionObserverCallback;

let observerCallback: ObserverCallback | undefined;
const disconnect = vi.fn();

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

describe('SectionReveal', () => {
  beforeEach(() => {
    observerCallback = undefined;
    disconnect.mockReset();
    mockReducedMotion(false);

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root = null;
      readonly rootMargin = '0px';
      readonly thresholds = [0.12];
      readonly observe = vi.fn();
      readonly unobserve = vi.fn();
      readonly disconnect = disconnect;
      readonly takeRecords = vi.fn(() => []);

      constructor(callback: ObserverCallback) {
        observerCallback = callback;
      }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('reveals once and disconnects its observer', () => {
    const { container } = render(
      <SectionReveal tone="iris">
        <section>Project</section>
      </SectionReveal>,
    );
    const root = container.querySelector('[data-section-reveal]');
    expect(root).toHaveAttribute('data-reveal-state', 'pending');
    expect(root).toHaveAttribute('data-reveal-tone', 'iris');

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(root).toHaveAttribute('data-reveal-state', 'revealed');
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('renders immediately when reduced motion is requested', () => {
    mockReducedMotion(true);
    const { container } = render(
      <SectionReveal tone="light">
        <section>Xuelang</section>
      </SectionReveal>,
    );

    expect(container.querySelector('[data-section-reveal]')).toHaveAttribute(
      'data-reveal-state',
      'revealed',
    );
    expect(observerCallback).toBeUndefined();
  });
});
