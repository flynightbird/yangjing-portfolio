import { defineConfig, devices } from '@playwright/test';

const port = process.env.PW_PORT ?? '4174';
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  // Next dev can transiently expose partially written route manifests when
  // multiple cold routes compile at once. Keep this suite serial and let the
  // static-export suite retain Playwright's normal parallelism.
  workers: 1,
  // Next dev cannot represent the static export's unknown-path fallback.
  testIgnore: '**/not-found.spec.ts',
  use: {
    baseURL,
    trace: 'retain-on-failure'
  },
  webServer: {
    command: `npm run dev -- --port ${port}`,
    url: `${baseURL}/en/work/call-agent/`,
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: 'tablet', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
