import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LiquidField } from '@/components/ui/liquid-field';

function setReducedMotion(matches: boolean) {
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

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('LiquidField', () => {
  it.each(['aidx', 'footer'] as const)('exposes the soft particle field for %s', (variant) => {
    setReducedMotion(false);
    const { container } = render(<LiquidField variant={variant} />);
    const canvas = container.querySelector(`[data-liquid-field="${variant}"]`);

    expect(canvas).toHaveAttribute('data-field-palette', 'soft-iris');
    expect(Number(canvas?.getAttribute('data-particle-count'))).toBeGreaterThan(0);
  });

  it('removes continuous particles under reduced motion', () => {
    setReducedMotion(true);
    const { container } = render(<LiquidField variant="footer" />);
    expect(container.querySelector('[data-liquid-field="footer"]')).toHaveAttribute(
      'data-particle-count',
      '0',
    );
  });
});
