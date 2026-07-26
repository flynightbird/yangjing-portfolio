import { createHash } from 'node:crypto';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';

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
  it('prepares the manifest interaction asset through the production branch', async () => {
    const prepareAsset = (
      assetPreparation as typeof assetPreparation & {
        prepareXuelangAsset?: (
          asset: XuelangAsset,
          options: { outputPath: string },
        ) => Promise<void>;
      }
    ).prepareXuelangAsset;

    expect(prepareAsset).toBeTypeOf('function');
    if (!prepareAsset) return;

    const interaction = loadManifest().assets.find((asset) => asset.id === 'learning-interaction');
    expect(interaction).toBeDefined();
    if (!interaction) return;

    const tempRoot = await mkdtemp(path.join(tmpdir(), 'xuelang-interaction-'));
    const outputPath = path.join(tempRoot, 'learning-interaction.webp');
    try {
      await prepareAsset(interaction, { outputPath });

      const [generated, checkedIn] = await Promise.all([
        readFile(outputPath),
        readFile(path.join(root, interaction.output)),
      ]);
      expect(createHash('sha256').update(generated).digest('hex')).toBe(
        createHash('sha256').update(checkedIn).digest('hex'),
      );

      const metadata = await sharp(generated).metadata();
      expect(metadata).toMatchObject({ format: 'webp', width: 3840, height: 1876 });
      const cornerCoordinates = [
        [0, 0],
        [3839, 0],
        [0, 1875],
        [3839, 1875],
      ] as const;
      const corners = await Promise.all(
        cornerCoordinates.map(([left, top]) =>
          sharp(generated).extract({ left, top, width: 1, height: 1 }).raw().toBuffer()),
      );
      expect(corners.map((corner) => Array.from(corner))).toEqual(
        Array.from({ length: 4 }, () => [227, 236, 231]),
      );
    } finally {
      await rm(tempRoot, { recursive: true, force: true });
    }
    expect(existsSync(tempRoot)).toBe(false);
  }, 120_000);

  it('prepares the interaction artwork with a lossless edge-connected green background', async () => {
    const prepareInteraction = (
      assetPreparation as typeof assetPreparation & {
        prepareXuelangInteractionWebp?: (input: Buffer) => Promise<Buffer>;
      }
    ).prepareXuelangInteractionWebp;

    expect(prepareInteraction).toBeTypeOf('function');
    if (!prepareInteraction) return;

    const width = 5;
    const height = 5;
    const background = [235, 237, 238];
    const target = [227, 236, 231];
    const pixels = Buffer.alloc(width * height * 3);
    const setPixel = (buffer: Buffer, x: number, y: number, color: number[]) => {
      const offset = (y * width + x) * 3;
      buffer.set(color, offset);
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) setPixel(pixels, x, y, background);
    }

    const foregroundPixels = [
      [2, 1, [13, 71, 219]],
      [1, 2, [241, 143, 29]],
      [3, 2, [44, 95, 52]],
      [2, 3, [198, 32, 91]],
    ] as const;
    for (const [x, y, color] of foregroundPixels) setPixel(pixels, x, y, [...color]);
    setPixel(pixels, 0, 2, [255, 237, 238]);
    setPixel(pixels, 4, 2, [255, 238, 238]);

    const source = await sharp(pixels, { raw: { width, height, channels: 3 } })
      .png()
      .toBuffer();
    const output = await prepareInteraction(source);
    const metadata = await sharp(output).metadata();
    const { data, info } = await sharp(output).raw().toBuffer({ resolveWithObject: true });

    const expected = Buffer.alloc(width * height * 3);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) setPixel(expected, x, y, target);
    }
    for (const [x, y, color] of foregroundPixels) setPixel(expected, x, y, [...color]);
    setPixel(expected, 2, 2, background);
    setPixel(expected, 4, 2, [255, 238, 238]);

    expect(metadata).toMatchObject({ format: 'webp', width, height });
    expect(info).toMatchObject({ width, height, channels: 3 });
    expect(Array.from(data)).toEqual(Array.from(expected));
  });

  it('declares the supplied opening cover as a semantic asset', () => {
    const manifest = loadManifest();
    const cover = manifest.assets.find((asset) => asset.id === 'opening-cover');

    expect(cover).toMatchObject({
      id: 'opening-cover',
      sourcePaths: ['evidence/xuelang/source/20220693.png'],
      output: 'public/images/xuelang/opening-cover.webp',
      intrinsic: { width: 1920, height: 1080 },
    });
  });

  it('uses the approved interaction artwork source', () => {
    const source = readFileSync(
      path.join(root, 'evidence/xuelang/source/learning-interaction-board.png'),
    );

    expect(createHash('sha256').update(source).digest('hex')).toBe(
      '3c3d03ea8eed58adf4ea31435b10cc54be63a3a2c600b3147f015886e62d837a',
    );
  });

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

  it('declares the supplied opening and learning evidence as semantic assets', () => {
    const manifest = loadManifest();
    const refreshedIds = [
      'opening-background',
      'learning-interaction',
      'learning-note-player',
      'learning-note-list',
      'learning-note-editor',
    ];
    const refreshAssets = manifest.assets.filter((asset) => refreshedIds.includes(asset.id));

    expect(refreshAssets.map(({ id, sourcePaths, output, intrinsic }) => ({
      id,
      sourcePaths,
      output,
      intrinsic,
    }))).toEqual([
      {
        id: 'opening-background',
        sourcePaths: ['evidence/xuelang/source/opening-background.png'],
        output: 'public/images/xuelang/opening-background.webp',
        intrinsic: { width: 3840, height: 2160 },
      },
      {
        id: 'learning-interaction',
        sourcePaths: ['evidence/xuelang/source/learning-interaction-board.png'],
        output: 'public/images/xuelang/learning-interaction.webp',
        intrinsic: { width: 3840, height: 1876 },
      },
      {
        id: 'learning-note-player',
        sourcePaths: ['evidence/xuelang/source/learning-note-player.png'],
        output: 'public/images/xuelang/learning-note-player.webp',
        intrinsic: { width: 904, height: 1958 },
      },
      {
        id: 'learning-note-list',
        sourcePaths: ['evidence/xuelang/source/learning-note-list.png'],
        output: 'public/images/xuelang/learning-note-list.webp',
        intrinsic: { width: 904, height: 1958 },
      },
      {
        id: 'learning-note-editor',
        sourcePaths: ['evidence/xuelang/source/learning-note-editor.png'],
        output: 'public/images/xuelang/learning-note-editor.webp',
        intrinsic: { width: 904, height: 1958 },
      },
    ]);
    expect(manifest.assets.flatMap(({ sourcePaths }) => sourcePaths))
      .not.toContain('evidence/xuelang/source/learning-interaction-copy-reference.png');
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
