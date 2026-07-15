import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const outputDir = path.join(root, 'out');
const filesDir = path.join(root, 'public/files');
const port = 4176;
const baseUrl = `http://localhost:${port}`;

async function waitForServer(url, attempts = 80) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The static server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function generatePdf(page, locale) {
  await page.emulateMedia({ media: 'screen', reducedMotion: 'reduce' });
  await page.goto(`${baseUrl}/${locale}/work/xuelang/`, {
    waitUntil: 'networkidle',
  });
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    for (const image of images) image.loading = 'eager';
    await document.fonts.ready;
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    window.scrollTo(0, 0);
  });
  await page.emulateMedia({ media: 'print', reducedMotion: 'reduce' });
  await page.pdf({
    path: path.join(filesDir, `xuelang-case-study-${locale}.pdf`),
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
  });
}

export async function generateXuelangPdfs() {
  const output = await fs.stat(outputDir).catch(() => undefined);
  if (!output?.isDirectory()) {
    throw new Error('Missing out directory. Run npm run build:framework first.');
  }
  await fs.mkdir(filesDir, { recursive: true });

  const server = spawn(process.execPath, ['scripts/serve-static-export.mjs'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let browser;
  try {
    await waitForServer(`${baseUrl}/zh/work/xuelang/`);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await generatePdf(page, 'zh');
    await generatePdf(page, 'en');
  } finally {
    await browser?.close();
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      if (server.exitCode !== null) return resolve();
      server.once('exit', resolve);
      setTimeout(resolve, 2000);
    });
  }
}

if (path.resolve(process.argv[1] ?? '') === scriptPath) {
  await generateXuelangPdfs();
  console.log('Generated bilingual Xuelang PDFs');
}
