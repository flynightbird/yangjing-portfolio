import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface ConvoAiMediaAsset {
  readonly id: string;
  readonly platform: 'app' | 'web';
  readonly sourceName: string;
  readonly output: string;
  readonly poster: string;
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly audio: boolean;
  readonly sha256: string;
  readonly posterTime: number;
}

interface ConvoAiMediaManifest {
  readonly version: 1;
  readonly assets: readonly ConvoAiMediaAsset[];
}

const root = process.cwd();
const manifestPath = path.join(root, 'evidence/convo-ai/media-manifest.json');

function loadManifest(): ConvoAiMediaManifest {
  expect(existsSync(manifestPath)).toBe(true);
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as ConvoAiMediaManifest;
}

describe('ConvoAI media manifest', () => {
  it('declares nine App and seven Web recordings exactly once', () => {
    const manifest = loadManifest();
    expect(manifest.version).toBe(1);
    expect(manifest.assets).toHaveLength(16);
    expect(manifest.assets.filter(({ platform }) => platform === 'app')).toHaveLength(9);
    expect(manifest.assets.filter(({ platform }) => platform === 'web')).toHaveLength(7);
    expect(new Set(manifest.assets.map(({ id }) => id)).size).toBe(16);
    expect(new Set(manifest.assets.map(({ output }) => output)).size).toBe(16);
  });

  it('records traceable media metadata and contained public outputs', () => {
    for (const asset of loadManifest().assets) {
      expect(asset.sourceName).toMatch(/\.(?:mp4|mov)$/i);
      expect(asset.output).toMatch(/^public\/videos\/convo-ai\/[a-z0-9-]+\.mp4$/);
      expect(asset.poster).toMatch(/^public\/images\/convo-ai\/posters\/[a-z0-9-]+\.webp$/);
      expect(asset.duration).toBeGreaterThan(0);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.fps).toBeGreaterThan(0);
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.posterTime).toBeGreaterThanOrEqual(0);
      expect(asset.posterTime).toBeLessThan(asset.duration);
    }
  });

  it('keeps every generated derivative non-empty', () => {
    for (const asset of loadManifest().assets) {
      for (const relativePath of [asset.output, asset.poster]) {
        const output = path.join(root, relativePath);
        expect(existsSync(output), relativePath).toBe(true);
        expect(statSync(output).size, relativePath).toBeGreaterThan(128);
      }
    }
  });
});
