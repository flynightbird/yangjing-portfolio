import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import sharp from 'sharp';
import { describe, expect, it } from 'vitest';

import * as assetPreparation from '../../scripts/prepare-xuelang-assets.mjs';

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
  it('resolves source and Figma evidence without allowing path escape', () => {
    const resolveSource = (
      assetPreparation as typeof assetPreparation & {
        resolveXuelangSourcePath?: (sourcePath: string) => string;
      }
    ).resolveXuelangSourcePath;

    expect(resolveSource).toBeTypeOf('function');
    if (!resolveSource) return;

    expect(resolveSource('evidence/xuelang/source/20220723.png')).toBe(
      path.join(root, 'evidence/xuelang/source/20220723.png'),
    );
    expect(resolveSource('evidence/xuelang/figma/quality-detail.png')).toBe(
      path.join(root, 'evidence/xuelang/figma/quality-detail.png'),
    );
    expect(() => resolveSource('evidence/outside.png')).toThrow(
      /source must stay inside evidence\/xuelang/i,
    );
  });

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

  it('declares dedicated source evidence for the four Hero product states', () => {
    const manifest = loadManifest();
    const heroAssets = manifest.assets.filter((asset) =>
      ['hero-discover', 'hero-decide', 'hero-learn', 'hero-retain'].includes(asset.id),
    );

    expect(heroAssets.map(({ id, sourcePaths, output }) => ({ id, sourcePaths, output })))
      .toEqual([
        {
          id: 'hero-discover',
          sourcePaths: ['evidence/xuelang/source/hero-discover.png'],
          output: 'public/images/xuelang/hero-discover.webp',
        },
        {
          id: 'hero-decide',
          sourcePaths: ['evidence/xuelang/source/hero-decide.png'],
          output: 'public/images/xuelang/hero-decide.webp',
        },
        {
          id: 'hero-learn',
          sourcePaths: ['evidence/xuelang/source/hero-learn.png'],
          output: 'public/images/xuelang/hero-learn.webp',
        },
        {
          id: 'hero-retain',
          sourcePaths: ['evidence/xuelang/source/hero-retain.png'],
          output: 'public/images/xuelang/hero-retain.webp',
        },
      ]);
  });

  it('declares the three non-duplicate adaptive Course Entry states', () => {
    const manifest = loadManifest();
    const courseEntryAssets = manifest.assets.filter((asset) =>
      ['course-entry-discover', 'course-entry-start', 'course-entry-live'].includes(asset.id),
    );

    expect(courseEntryAssets.map(({ id, sourcePaths, output }) => ({
      id,
      sourcePaths,
      output,
    }))).toEqual([
      {
        id: 'course-entry-discover',
        sourcePaths: ['evidence/xuelang/source/course-entry-discover.png'],
        output: 'public/images/xuelang/course-entry-discover.webp',
      },
      {
        id: 'course-entry-start',
        sourcePaths: ['evidence/xuelang/source/course-entry-start.png'],
        output: 'public/images/xuelang/course-entry-start.webp',
      },
      {
        id: 'course-entry-live',
        sourcePaths: ['evidence/xuelang/source/course-entry-live.png'],
        output: 'public/images/xuelang/course-entry-live.webp',
      },
    ]);
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
