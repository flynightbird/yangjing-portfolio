import { describe, expect, it } from 'vitest';

import nativeConfig from '@/playwright.config.mjs';
import exportConfig from '@/playwright.export.config.mjs';

describe('Playwright server ownership', () => {
  it('starts only Next dev for the native suite', () => {
    expect(nativeConfig.webServer).toMatchObject({
      command: 'npm run dev -- --port 4174',
      url: 'http://localhost:4174',
    });
    expect(Array.isArray(nativeConfig.webServer)).toBe(false);
  });

  it('runs STT direct-open and 404 coverage against the static export', () => {
    expect(exportConfig.testMatch).toEqual([
      '**/not-found.spec.ts',
      '**/stt-demo.spec.ts',
    ]);
  });
});
