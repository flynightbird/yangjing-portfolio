import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FooterRevealMotion } from '@/components/shell/footer-reveal-motion';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const rect = (top: number, height = 800) => ({
  x: 0,
  y: top,
  top,
  right: 1200,
  bottom: top + height,
  left: 0,
  width: 1200,
  height,
  toJSON: () => ({}),
});

describe('FooterRevealMotion', () => {
  it('writes bounded homepage reveal progress through requestAnimationFrame', () => {
    let homepageBottom = 1000;
    Object.defineProperties(window, {
      innerHeight: { configurable: true, value: 1000 },
      innerWidth: { configurable: true, value: 1200 },
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        const element = this as HTMLElement;
        if (element.matches('[data-site-footer]')) return rect(232, 768);
        if (element.matches('[data-homepage]')) {
          return rect(homepageBottom - 10_000, 10_000);
        }
        return rect(0, 0);
      },
    );

    const { container } = render(
      <>
        <div data-homepage />
        <footer data-site-footer>
          <FooterRevealMotion />
        </footer>
      </>,
    );
    const footer = container.querySelector<HTMLElement>('[data-site-footer]');

    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('0');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('8%');

    homepageBottom = 632;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('0.5');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('4%');

    homepageBottom = 264;
    act(() => window.dispatchEvent(new Event('scroll')));
    expect(footer?.style.getPropertyValue('--footer-reveal-progress')).toBe('1');
    expect(footer?.style.getPropertyValue('--footer-reveal-offset')).toBe('0%');
  });

  it('uses the smaller mobile parallax distance', () => {
    Object.defineProperties(window, {
      innerHeight: { configurable: true, value: 844 },
      innerWidth: { configurable: true, value: 390 },
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function () {
        const element = this as HTMLElement;
        if (element.matches('[data-site-footer]')) return rect(172, 672);
        if (element.matches('[data-homepage]')) return rect(-9156, 10_000);
        return rect(0, 0);
      },
    );

    const { container } = render(
      <>
        <div data-homepage />
        <footer data-site-footer>
          <FooterRevealMotion />
        </footer>
      </>,
    );

    expect(
      container
        .querySelector<HTMLElement>('[data-site-footer]')
        ?.style.getPropertyValue('--footer-reveal-offset'),
    ).toBe('4%');
  });

  it('does not activate without the homepage marker', () => {
    const { container } = render(
      <footer data-site-footer>
        <FooterRevealMotion />
      </footer>,
    );

    expect(
      container
        .querySelector<HTMLElement>('[data-site-footer]')
        ?.style.getPropertyValue('--footer-reveal-progress'),
    ).toBe('');
  });
});
