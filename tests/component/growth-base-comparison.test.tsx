import { cleanup, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GrowthBaseComparison } from '@/components/growth-base/growth-base-comparison';

afterEach(cleanup);

describe('GrowthBaseComparison', () => {
  it.each([
    ['zh', 'zh-CN'],
    ['en', 'en'],
  ] as const)('passes the %s portfolio locale into the prototype', (locale, language) => {
    const { container } = render(<GrowthBaseComparison locale={locale} />);

    expect(container.querySelector('iframe')).toHaveAttribute(
      'src',
      `https://flynightbird.github.io/meditation-prototype/?embed=1&lang=${language}`,
    );
  });

  it('keeps a fixed mobile canvas inside a dominant After viewport', () => {
    const { container } = render(<GrowthBaseComparison locale="en" />);

    expect(container.querySelector('[data-comparison-role="before"]')).toBeVisible();
    expect(container.querySelector('[data-comparison-role="after"]')).toBeVisible();
    expect(container.querySelector('[data-prototype-viewport]')).toHaveAttribute(
      'data-canvas-size',
      '390x844',
    );
    expect(container.querySelector('iframe')).toHaveAttribute('width', '390');
    expect(container.querySelector('iframe')).toHaveAttribute('height', '844');
  });

  it('synchronizes the Before image with trusted prototype view messages', async () => {
    const { container } = render(<GrowthBaseComparison locale="zh" />);
    const iframe = container.querySelector<HTMLIFrameElement>('iframe');
    const before = container.querySelector<HTMLImageElement>('[data-growth-base-before]');

    expect(before).toHaveAttribute('src', '/images/growth-base/before-ai-coach.jpg');
    expect(before).toHaveAttribute('loading', 'eager');

    window.dispatchEvent(new MessageEvent('message', {
      origin: 'https://flynightbird.github.io',
      source: iframe?.contentWindow,
      data: {
        source: 'growth-base-prototype',
        type: 'growth-base:view',
        view: 'trainer',
      },
    }));

    await waitFor(() => {
      expect(before).toHaveAttribute('src', '/images/growth-base/before-trainer.jpg');
    });
  });

  it.each([
    ['wrong origin', 'https://example.com', 'growth-base-prototype', 'growth-base:view', 'trainer'],
    ['wrong source marker', 'https://flynightbird.github.io', 'other', 'growth-base:view', 'trainer'],
    ['wrong message type', 'https://flynightbird.github.io', 'growth-base-prototype', 'other', 'trainer'],
    ['unsupported view', 'https://flynightbird.github.io', 'growth-base-prototype', 'growth-base:view', 'points'],
  ])('ignores %s messages', (_, origin, source, type, view) => {
    const { container } = render(<GrowthBaseComparison locale="en" />);
    const iframe = container.querySelector<HTMLIFrameElement>('iframe');
    const before = container.querySelector<HTMLImageElement>('[data-growth-base-before]');

    window.dispatchEvent(new MessageEvent('message', {
      origin,
      source: iframe?.contentWindow,
      data: { source, type, view },
    }));

    expect(before).toHaveAttribute('src', '/images/growth-base/before-ai-coach.jpg');
  });
});
