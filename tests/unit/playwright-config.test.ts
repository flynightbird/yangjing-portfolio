import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

  it('filters STT request failures using each project configured base URL', async () => {
    const nativeBaseUrl = String(nativeConfig.use?.baseURL);
    const exportBaseUrl = String(exportConfig.use?.baseURL);
    const sttSpec = await readFile(
      resolve(process.cwd(), 'tests/e2e/stt-demo.spec.ts'),
      'utf8',
    );

    expect(new URL(nativeBaseUrl).origin).not.toBe(new URL(exportBaseUrl).origin);
    expect(sttSpec).toContain('testInfo.project.use.baseURL');
    expect(sttSpec).not.toContain(
      "requestUrl.origin === 'http://localhost:4174'",
    );
  });
});
