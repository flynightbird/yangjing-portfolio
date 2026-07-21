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
      'work/xuelang',
      'work/call-agent',
      'work/convo-ai',
      'work/meeting',
      'work/tangping',
      'build/stt-demo',
    ]);
  });

  it('resolves typed previous and next neighbors without adding projects', () => {
    expect(getFeaturedNeighbors('work/call-agent')).toEqual({
      previous: 'work/xuelang',
      next: 'work/convo-ai',
    });
    expect(getFeaturedNeighbors('work/convo-ai')).toEqual({
      previous: 'work/call-agent',
      next: 'work/meeting',
    });
    expect(getPreviousFeatured('work/xuelang')).toBeUndefined();
    expect(getFeaturedNeighbors('work/tangping')).toEqual({
      previous: 'work/meeting',
      next: 'build/stt-demo',
    });
    expect(getNextFeatured('build/stt-demo')).toBeUndefined();
  });
});
