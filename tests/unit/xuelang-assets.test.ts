import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

interface XuelangAsset {
  readonly id: string;
  readonly chapter: string;
  readonly sourceFrames: readonly string[];
  readonly sourcePaths: readonly string[];
  readonly output: string;
  readonly format: 'webp' | 'png';
  readonly intrinsic: { readonly width: number; readonly height: number };
  readonly purpose: string;
  readonly alt: { readonly zh: string; readonly en: string };
  readonly replacementPath: string;
}

interface XuelangManifest {
  readonly version: number;
  readonly assets: readonly XuelangAsset[];
}

const root = process.cwd();
const manifestPath = path.join(root, 'evidence/xuelang/manifest.json');

function loadManifest(): XuelangManifest {
  expect(existsSync(manifestPath), 'Xuelang manifest must exist').toBe(true);
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as XuelangManifest;
}

describe('Xuelang evidence manifest', () => {
  it('declares matched before and after boards for the learning comparison', () => {
    const manifest = loadManifest();
    const comparisonAssets = manifest.assets.filter((asset) =>
      ['learning-before-board', 'learning-after-board'].includes(asset.id),
    );

    expect(comparisonAssets.map((asset) => asset.id)).toEqual([
      'learning-before-board',
      'learning-after-board',
    ]);
    for (const asset of comparisonAssets) {
      expect(asset.chapter).toBe('06');
      expect(asset.intrinsic).toEqual({ width: 1662, height: 1080 });
      expect(asset.output).toMatch(
        /^public\/images\/xuelang\/learning-(before|after)-board\.webp$/,
      );
    }
  });

  it('keeps source evidence traceable and replaceable', () => {
    const manifest = loadManifest();

    expect(manifest.version).toBe(1);
    expect(new Set(manifest.assets.flatMap((asset) => asset.sourceFrames)).size)
      .toBeGreaterThanOrEqual(16);
    expect(new Set(manifest.assets.map((asset) => asset.output)).size)
      .toBe(manifest.assets.length);

    for (const asset of manifest.assets) {
      expect(asset.output).toMatch(
        /^public\/images\/xuelang\/[a-z0-9-]+\.(webp|png)$/,
      );
      expect(asset.chapter).toMatch(/^0[0-7]$/);
      expect(asset.sourcePaths.every((source) => !path.isAbsolute(source))).toBe(true);
      expect(asset.intrinsic.width).toBeGreaterThan(0);
      expect(asset.intrinsic.height).toBeGreaterThan(0);
      expect(asset.purpose.trim().length).toBeGreaterThan(12);
      expect(asset.alt.zh.trim().length).toBeGreaterThan(8);
      expect(asset.alt.en.trim().length).toBeGreaterThan(12);
      expect(asset.replacementPath).toMatch(/^figma:\/\//);
    }
  });

  it('generates every declared public derivative at its intrinsic size', async () => {
    const manifest = loadManifest();

    for (const asset of manifest.assets) {
      const outputPath = path.join(root, asset.output);
      expect(existsSync(outputPath), asset.output).toBe(true);
      expect(statSync(outputPath).size).toBeGreaterThan(1024);
      const metadata = await sharp(outputPath).metadata();
      expect(metadata.width).toBe(asset.intrinsic.width);
      expect(metadata.height).toBe(asset.intrinsic.height);
      expect(metadata.format).toBe(asset.format);
    }
  });
});
