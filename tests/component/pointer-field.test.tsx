import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PointerField } from '@/components/home/pointer-field';

function mockMedia({ fine = true, reduced = false } = {}) {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : fine,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe('PointerField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockMedia();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows the trail only while moving, then plays one multiline stationary field', async () => {
    const { container } = render(<PointerField />);
    await act(async () => undefined);
    const field = container.querySelector('[data-pointer-field]');
    expect(field).toBeInTheDocument();

    fireEvent.pointerMove(document.body, { clientX: 320, clientY: 240 });
    expect(field).toHaveAttribute('data-moving', 'true');
    expect(container.querySelector('[data-pointer-trail]')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(180));
    expect(field).toHaveAttribute('data-moving', 'false');

    act(() => vi.advanceTimersByTime(340));
    const lines = container.querySelectorAll('[data-pointer-symbol-line]');
    expect(lines.length).toBeGreaterThanOrEqual(3);
    expect(lines.length).toBeLessThanOrEqual(5);

    act(() => vi.advanceTimersByTime(3300));
    expect(container.querySelectorAll('[data-pointer-symbol-line]')).toHaveLength(0);
  });

  it('clears decoration over interactive and suppressed surfaces', async () => {
    const { container } = render(
      <>
        <PointerField />
        <a href="/en/about/">About</a>
        <div data-pointer-suppress>Archive</div>
      </>,
    );
    await act(async () => undefined);

    fireEvent.pointerMove(document.body, { clientX: 120, clientY: 120 });
    expect(container.querySelector('[data-pointer-field]')).toHaveAttribute(
      'data-moving',
      'true',
    );

    fireEvent.pointerMove(container.querySelector('a') as HTMLAnchorElement, {
      clientX: 140,
      clientY: 130,
    });
    expect(container.querySelector('[data-pointer-field]')).toHaveAttribute(
      'data-moving',
      'false',
    );
  });

  it.each([
    { fine: false, reduced: false },
    { fine: true, reduced: true },
  ])('does not render for coarse pointers or reduced motion: %o', async (media) => {
    mockMedia(media);
    const { container } = render(<PointerField />);
    await act(async () => undefined);
    expect(container.querySelector('[data-pointer-field]')).not.toBeInTheDocument();
  });
});
