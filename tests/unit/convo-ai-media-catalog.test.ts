import { afterEach, describe, expect, it, vi } from 'vitest';

describe('ConvoAI media catalog', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('prefixes video and poster URLs for a subpath deployment', async () => {
    vi.stubEnv('NEXT_PUBLIC_BASE_PATH', '/yangjing-portfolio');
    vi.resetModules();

    const { getConvoAiMedia } = await import(
      '@/components/convo-ai/convo-ai-media-catalog'
    );
    const media = getConvoAiMedia('app-conversation-start');

    expect(media.src).toBe(
      '/yangjing-portfolio/videos/convo-ai/app-conversation-start.mp4',
    );
    expect(media.poster).toBe(
      '/yangjing-portfolio/images/convo-ai/posters/app-conversation-start.webp',
    );
  });
});
