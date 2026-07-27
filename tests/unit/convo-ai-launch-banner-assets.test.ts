import path from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

const assets = [
  ['base.png', 861, 300],
  ['float-robot.png', 148, 142],
  ['float-cloud.png', 107, 77],
] as const;

describe('ConvoAI launch banner assets', () => {
  it.each(assets)(
    '%s preserves its supplied PNG dimensions and alpha channel',
    async (file, width, height) => {
      const metadata = await sharp(
        path.join(process.cwd(), 'public/images/convo-ai/launch-banner', file),
      ).metadata();

      expect(metadata).toMatchObject({
        format: 'png',
        width,
        height,
        hasAlpha: true,
      });
    },
  );
});
