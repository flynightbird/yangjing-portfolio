import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const source = 'https://aidxtech.com/';
const viewport = { width: 1280, height: 720 };
const outputDir = path.join(root, 'public/demos/aidx-showcase');
const output = path.join(outputDir, 'aidx-homepage-scroll.webm');
const manifestPath = path.join(root, 'evidence/aidx/showcase-source.json');
const temporary = path.join(root, 'tmp/aidx-capture');

await fs.rm(temporary, { force: true, recursive: true });
await fs.mkdir(temporary, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(path.dirname(manifestPath), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport,
  recordVideo: { dir: temporary, size: viewport },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
await page.goto(source, { waitUntil: 'networkidle' });
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(2000);
await page.evaluate(async () => {
  const start = performance.now();
  const duration = 22000;
  const distance = document.documentElement.scrollHeight - innerHeight;
  await new Promise((resolve) => {
    const tick = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = raw < 0.5
        ? 2 * raw * raw
        : 1 - ((-2 * raw + 2) ** 2) / 2;
      scrollTo(0, distance * eased);
      if (raw < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
});
await page.waitForTimeout(2000);
const video = page.video();
await context.close();
if (!video) throw new Error('Playwright did not create the AIDX capture.');
await video.saveAs(output);
await browser.close();

const bytes = await fs.readFile(output);
await fs.writeFile(
  manifestPath,
  `${JSON.stringify({
    version: 1,
    source,
    capturedAt: new Date().toISOString(),
    viewport,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  }, null, 2)}\n`,
);
