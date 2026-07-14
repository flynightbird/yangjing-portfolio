import { describe, expect, it } from 'vitest';

import {
  featuredOrder,
  getFeaturedNeighbors,
  getNextFeatured,
  getPreviousFeatured,
} from '@/content/navigation';

describe('featured navigation', () => {
  it('keeps the approved homepage order with one Build Lab entry', () => {
    expect(featuredOrder).toEqual([
      'work/bytedance',
      'work/call-agent',
      'work/meeting',
      'build/stt-demo',
    ]);
  });

  it('resolves typed previous and next neighbors without adding projects', () => {
    expect(getFeaturedNeighbors('work/call-agent')).toEqual({
      previous: 'work/bytedance',
      next: 'work/meeting',
    });
    expect(getPreviousFeatured('work/bytedance')).toBeUndefined();
    expect(getNextFeatured('build/stt-demo')).toBeUndefined();
  });
});
