import { describe, expect, it } from 'vitest';

import { resolveCallAgentMotionMode } from '@/components/call-agent/call-agent-motion-mode';

describe('Call Agent motion mode', () => {
  it.each([
    [1600, false, 'cinematic'],
    [1280, false, 'cinematic'],
    [1024, false, 'reveal'],
    [768, false, 'reveal'],
    [390, false, 'static'],
    [1280, true, 'static'],
  ] as const)('maps %s/%s to %s', (width, reducedMotion, expected) => {
    expect(resolveCallAgentMotionMode({ width, reducedMotion })).toBe(expected);
  });
});
