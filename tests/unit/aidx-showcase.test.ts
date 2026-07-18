import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('AIDX showcase publication', () => {
  it('renders the approved soft silk palette without hard polygon waves', async () => {
    const liquidSource = await readFile(
      resolve(root, 'components/ui/liquid-field.tsx'),
      'utf8',
    );

    expect(liquidSource).toContain("['#d9e3ff', '#a8b9ef', '#8c8dde']");
    expect(liquidSource).toContain('createRadialGradient');
    expect(liquidSource).not.toContain('context.lineTo');
  });

  it('pins a local video capture to a verified manifest', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(root, 'evidence/aidx/showcase-source.json'), 'utf8'),
    );
    const video = await readFile(
      resolve(root, 'public/demos/aidx-showcase/aidx-homepage-scroll.webm'),
    );
    expect(manifest.source).toBe('https://aidxtech.com/');
    expect(manifest.viewport).toEqual({ width: 1280, height: 720 });
    expect(createHash('sha256').update(video).digest('hex')).toBe(manifest.sha256);
  });

  it('publishes a non-interactive same-origin player', async () => {
    const html = await readFile(
      resolve(root, 'public/demos/aidx-showcase/index.html'),
      'utf8',
    );
    expect(html).toContain('aidx-homepage-scroll.webm');
    expect(html).toContain('playsinline');
    expect(html).not.toMatch(/<a\b|<button\b|<form\b/);
  });

  it('skips the captured loading frames at every loop boundary', async () => {
    const script = await readFile(
      resolve(root, 'public/demos/aidx-showcase/showcase.js'),
      'utf8',
    );
    expect(script).toContain('const loopStart = 2.4');
    expect(script).toContain('video.currentTime = loopStart');
  });
});
