import { describe, expect, it } from 'vitest';

import { featuredOrder } from '@/content/navigation';

describe('featured project order', () => {
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

});
