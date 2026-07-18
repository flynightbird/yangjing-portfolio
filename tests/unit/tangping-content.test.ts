import { describe, expect, it } from 'vitest';

import { tangpingFrames } from '@/content/tangping';

describe('Tangping frame manifest', () => {
  it('orders the approved frames by numeric ID', () => {
    expect(tangpingFrames.map(({ id }) => id)).toEqual([6, 10, 11, 20]);
  });

  it('uses only text-free production artwork', () => {
    for (const frame of tangpingFrames) {
      expect(frame.image).toEqual({
        src: `/images/tangping/frame-${String(frame.id).padStart(2, '0')}.png`,
        width: 2880,
        height: 1620,
      });
      expect(JSON.stringify(frame)).not.toContain('reference-');
    }
  });

  it('provides equivalent Tangping titles and semantic groups in both locales', () => {
    for (const frame of tangpingFrames) {
      expect(frame.copy.zh.title).toMatch(/^躺平设计家/);
      expect(frame.copy.en.title).toMatch(/^Tangping Designer/);
      expect(frame.copy.zh.groups.length).toBeGreaterThan(0);
      expect(frame.copy.en.groups).toHaveLength(frame.copy.zh.groups.length);
      expect(frame.copy.zh.groups.every(({ label, items }) => label && items.length > 0)).toBe(
        true,
      );
      expect(frame.copy.en.groups.every(({ label, items }) => label && items.length > 0)).toBe(
        true,
      );
    }
  });

  it('assigns one focused layout to each narrative job', () => {
    expect(tangpingFrames.map(({ layout }) => layout)).toEqual([
      'background',
      'research',
      'personas',
      'needs-matrix',
    ]);
  });
});
