import { describe, expect, it } from 'vitest';

import { resolveXuelangMotionMode } from '@/components/xuelang/xuelang-motion-mode';

describe('resolveXuelangMotionMode', () => {
  it.each([
    [1600, 'cinematic'],
    [1440, 'cinematic'],
    [1280, 'cinematic'],
    [1024, 'reveal'],
    [390, 'static'],
    [375, 'static'],
  ] as const)('uses %s pixels as %s mode', (width, expected) => {
    expect(resolveXuelangMotionMode({ width, reducedMotion: false })).toBe(expected);
  });

  it.each([1600, 1280, 1024, 390])('keeps %s pixels static for reduced motion', (width) => {
    expect(resolveXuelangMotionMode({ width, reducedMotion: true })).toBe('static');
  });
});
