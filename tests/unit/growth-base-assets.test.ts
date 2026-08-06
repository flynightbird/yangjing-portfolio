import { stat } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const growthBaseAssets = [
  'public/images/growth-base/before-ai-coach.jpg',
  'public/images/growth-base/before-trainer.jpg',
  'public/images/growth-base/home-video-poster.webp',
  'public/images/growth-base/greeting-poster.webp',
  'public/images/growth-base/meditation-poster.webp',
  'public/images/growth-base/meditation-complete-poster.webp',
  'public/images/growth-base/meal-prep-poster.webp',
  'public/images/growth-base/meal-cook-poster.webp',
  'public/images/growth-base/growth-vitality.png',
  'public/images/growth-base/growth-focus.png',
  'public/images/growth-base/growth-stamina.png',
  'public/images/growth-base/reward-bed.png',
  'public/videos/growth-base/home-loop.mp4',
  'public/videos/growth-base/greeting.mp4',
  'public/videos/growth-base/meditation.mp4',
  'public/videos/growth-base/meditation-complete.mp4',
  'public/videos/growth-base/meal-prep.mp4',
  'public/videos/growth-base/meal-cook.mp4',
];

describe('Growth Base portfolio media', () => {
  it('ships every referenced asset as a non-empty file', async () => {
    for (const asset of growthBaseAssets) {
      const metadata = await stat(path.join(process.cwd(), asset));
      expect(metadata.isFile(), asset).toBe(true);
      expect(metadata.size, asset).toBeGreaterThan(0);
    }
  });

  it('uses the approved 16:9 homepage poster size', async () => {
    const metadata = await sharp(
      path.join(process.cwd(), 'public/images/growth-base/home-video-poster.webp'),
    ).metadata();

    expect([metadata.width, metadata.height]).toEqual([1600, 900]);
  });
});
