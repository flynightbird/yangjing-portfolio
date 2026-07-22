import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { prepareMeetingAssets } from '@/scripts/prepare-meeting-assets.mjs';
import { canonicalMeetingPublicationAssets } from '@/scripts/meeting-publication-contract.mjs';

const requiredIds = [
  'meeting-hero',
  'adaptive-layout-poster',
  'adaptive-layout-demo',
  'meeting-state-matrix',
  'device-comparison',
  'whiteboard-multidevice',
  'participant-priority',
  'transcript-poster',
  'transcript-demo',
  'caption-vs-transcript',
  'speech-to-api',
  'capability-system',
  'launch-coverage',
  'adaptive-layout-captions-en',
  'adaptive-layout-captions-zh',
  'transcript-captions-en',
  'transcript-captions-zh',
  'meeting-stage-portrait',
  'meeting-stage-landscape',
  'meeting-whiteboard-portrait',
  'meeting-whiteboard-landscape',
  'meeting-web-transcription',
  'meeting-web-layout',
] as const;

interface MeetingAsset {
  readonly id: string;
  readonly kind: 'image' | 'video' | 'captions';
  readonly source: string;
  readonly output: string;
  readonly purpose: string;
  readonly alt?: { readonly en: string; readonly zh: string };
  readonly poster?: string;
  readonly captions?: { readonly en: string; readonly zh: string };
  readonly publicationRequired?: boolean;
  readonly readiness?: 'ready' | 'awaiting-source';
  readonly orientation?: 'portrait' | 'landscape';
  readonly bytes?: number;
  readonly sha256?: string;
}

interface MeetingManifest {
  readonly version: number;
  readonly assets: readonly MeetingAsset[];
}

const root = process.cwd();
const manifestPath = path.join(root, 'evidence/meeting/manifest.json');

function loadManifest(): MeetingManifest {
  expect(existsSync(manifestPath), 'Meeting manifest must exist').toBe(true);
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as MeetingManifest;
}

function writeFixtureManifest(rootDirectory: string, asset: MeetingAsset) {
  const destination = path.join(rootDirectory, 'evidence/meeting/manifest.json');
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, JSON.stringify({ version: 1, assets: [asset] }));
}

function writeCanonicalPublicationFixture(
  rootDirectory: string,
  readinessFor: (id: string) => 'ready' | 'awaiting-source' = () => 'ready',
) {
  const assets = canonicalMeetingPublicationAssets.map((asset) => ({
    ...asset,
    purpose: `Canonical publication fixture for ${asset.id}.`,
    publicationRequired: true,
    readiness: readinessFor(asset.id),
  }));
  const manifestPath = path.join(rootDirectory, 'evidence/meeting/manifest.json');
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({ version: 1, assets }));
  for (const asset of assets) {
    const source = path.join(rootDirectory, asset.source);
    mkdirSync(path.dirname(source), { recursive: true });
    writeFileSync(
      source,
      asset.kind === 'video'
        ? Buffer.concat([Buffer.from('ftypisom'), Buffer.alloc(256)])
        : 'WEBVTT\n\n00:00.000 --> 00:02.000\nVisible interface change.\n',
    );
  }
  return assets;
}

describe('Meeting evidence manifest', () => {
  it('declares every approved communication asset once', () => {
    const manifest = loadManifest();

    expect(manifest.version).toBe(1);
    expect(manifest.assets.map(({ id }) => id)).toEqual(requiredIds);
    expect(manifest.assets.map(({ id }) => id)).not.toContain('focus-vs-pin');
    expect(new Set(manifest.assets.map(({ output }) => output)).size)
      .toBe(manifest.assets.length);
  });

  it('keeps sources traceable and public outputs contained', () => {
    const { assets } = loadManifest();

    for (const asset of assets) {
      expect(asset.source).toMatch(/^evidence\/meeting\/source\//);
      expect(asset.output).toMatch(/^public\/(images|videos|captions)\/meeting\//);
      expect(asset.source.split('/')).not.toContain('..');
      expect(asset.output.split('/')).not.toContain('..');
      expect(asset.purpose.trim().length).toBeGreaterThan(20);
      if (asset.kind === 'image') {
        expect(asset.alt?.en.trim().length).toBeGreaterThan(20);
        expect(asset.alt?.zh.trim().length).toBeGreaterThan(8);
      }
      if (asset.kind === 'video') {
        expect(asset.poster).toMatch(/^\/images\/meeting\//);
        if (asset.publicationRequired) expect(asset).not.toHaveProperty('captions');
        else expect(asset.captions).toEqual({
          en: expect.stringMatching(/^\/captions\/meeting\/.+\.en\.vtt$/),
          zh: expect.stringMatching(/^\/captions\/meeting\/.+\.zh\.vtt$/),
        });
      }
    }
  });

  it('declares six publication-required native film records in contract order', () => {
    const { assets } = loadManifest();
    const publicationAssets = assets.filter(({ publicationRequired }) => publicationRequired);
    const films = assets.filter(
      (asset) => asset.kind === 'video' && asset.publicationRequired,
    );

    expect(films.map(({ id }) => id)).toEqual([
      'meeting-stage-portrait',
      'meeting-stage-landscape',
      'meeting-whiteboard-portrait',
      'meeting-whiteboard-landscape',
      'meeting-web-transcription',
      'meeting-web-layout',
    ]);
    expect(films.map(({ source }) => path.basename(source))).toEqual([
      'meeting-stage-portrait.mp4',
      'meeting-stage-landscape.mp4',
      'meeting-whiteboard-portrait.mp4',
      'meeting-whiteboard-landscape.mp4',
      'meeting-web-transcription.mp4',
      'meeting-web-layout.mp4',
    ]);
    expect(films.map(({ output }) => path.basename(output))).toEqual(
      films.map(({ source }) => path.basename(source)),
    );
    expect(films.map(({ poster }) => poster)).toEqual([
      '/images/meeting/adaptive-layout-poster.webp',
      '/images/meeting/adaptive-layout-poster.webp',
      '/images/meeting/whiteboard-multidevice.webp',
      '/images/meeting/whiteboard-multidevice.webp',
      '/images/meeting/whiteboard-multidevice.webp',
      '/images/meeting/device-comparison.webp',
    ]);
    expect(films.map(({ orientation }) => orientation)).toEqual([
      'portrait',
      'landscape',
      'portrait',
      'landscape',
      'landscape',
      'landscape',
    ]);
    expect(films.find(({ id }) => id === 'meeting-web-transcription')).toMatchObject({
      bytes: 7_031_894,
      sha256: 'fe06e2b39fafc09dc4e36bd7dabdb662b6856d17700df851518e90fb48112ffd',
    });
    expect(publicationAssets).toHaveLength(6);
    expect(publicationAssets.every(({ kind }) => kind === 'video')).toBe(true);
    for (const asset of publicationAssets) {
      expect(asset.readiness).toBe(
        existsSync(path.join(root, asset.source)) ? 'ready' : 'awaiting-source',
      );
    }
    for (const film of films) expect(film).not.toHaveProperty('captions');
  });

  it('prepares the inspected native media for publication', async () => {
    await expect(prepareMeetingAssets()).resolves.toEqual(
      expect.arrayContaining(['public/images/meeting/meeting-hero.webp']),
    );
    await expect(prepareMeetingAssets({
      publication: true,
      probeMeetingVideo: async (_filePath: string, asset: MeetingAsset) => ({
        streams: [{
          codec_type: 'video',
          codec_name: 'h264',
          width: asset.orientation === 'portrait' ? 720 : 1280,
          height: asset.orientation === 'portrait' ? 1280 : 720,
        }],
        format: { duration: '10' },
      }),
    })).resolves.toEqual(
      expect.arrayContaining(['public/videos/meeting/meeting-web-layout.mp4']),
    );
  }, 120_000);

  it('refuses to publish or copy an available source still awaiting inspection', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-awaiting-'));
    writeCanonicalPublicationFixture(
      fixtureRoot,
      (id) => id === 'meeting-stage-portrait' ? 'awaiting-source' : 'ready',
    );

    try {
      await expect(prepareMeetingAssets({
        rootDir: fixtureRoot,
        publication: true,
      })).rejects.toThrow(/Meeting Product Film records awaiting source inspection:[\s\S]*meeting-stage-portrait/);
      expect(existsSync(path.join(fixtureRoot, 'public/videos/meeting/meeting-stage-portrait.mp4')))
        .toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('refuses publication when a canonical record is missing even if all other sources exist', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-inventory-'));
    const assets = writeCanonicalPublicationFixture(fixtureRoot);
    const manifestPath = path.join(fixtureRoot, 'evidence/meeting/manifest.json');
    writeFileSync(manifestPath, JSON.stringify({
      version: 1,
      assets: assets.filter(({ id }) => id !== 'meeting-web-layout'),
    }));

    try {
      await expect(prepareMeetingAssets({
        rootDir: fixtureRoot,
        publication: true,
      })).rejects.toThrow(
        /Invalid Meeting Product Film publication inventory:[\s\S]*Missing canonical Meeting publication asset: meeting-web-layout/,
      );
      expect(existsSync(path.join(
        fixtureRoot,
        'public/videos/meeting/meeting-stage-portrait.mp4',
      ))).toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('validates ready video metadata before copying', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-inspected-'));
    const assets = writeCanonicalPublicationFixture(fixtureRoot);

    try {
      await expect(prepareMeetingAssets({
        rootDir: fixtureRoot,
        publication: true,
        probeMeetingVideo: async (_filePath: string, asset: MeetingAsset) => ({
          streams: [{
            codec_type: 'video',
            codec_name: 'h264',
            width: asset.orientation === 'portrait' ? 720 : 1280,
            height: asset.orientation === 'portrait' ? 1280 : 720,
          }],
          format: { duration: '10' },
        }),
      })).resolves.toEqual(assets.map(({ output }) => output));
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('surfaces ffprobe timeouts before copying ready publication media', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-probe-timeout-'));
    writeCanonicalPublicationFixture(fixtureRoot);

    try {
      await expect(prepareMeetingAssets({
        rootDir: fixtureRoot,
        publication: true,
        probeMeetingVideo: async () => {
          throw new Error('ffprobe timed out after 25ms');
        },
      })).rejects.toThrow(
        /Meeting Product Film media validation failed:[\s\S]*ffprobe timed out after 25ms:[\s\S]*meeting-stage-portrait\.mp4/,
      );
      expect(existsSync(path.join(
        fixtureRoot,
        'public/videos/meeting/meeting-stage-portrait.mp4',
      ))).toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
    }
  });

  it('limits combined static publication preparation to image records', async () => {
    const outputs = await prepareMeetingAssets({
      staticOnly: true,
      publication: true,
    });

    expect(outputs).toContain('public/images/meeting/meeting-hero.webp');
    expect(outputs.every((output) => output.startsWith('public/images/meeting/')))
      .toBe(true);
  }, 180_000);

  it('rejects a symlinked source ancestor before reading outside evidence', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-source-'));
    const outside = mkdtempSync(path.join(tmpdir(), 'meeting-assets-outside-'));
    mkdirSync(path.join(fixtureRoot, 'evidence/meeting/source'), { recursive: true });
    writeFileSync(path.join(outside, 'captions.vtt'), 'WEBVTT\n');
    symlinkSync(outside, path.join(fixtureRoot, 'evidence/meeting/source/link'));
    writeFixtureManifest(fixtureRoot, {
      id: 'unsafe-source',
      kind: 'captions',
      source: 'evidence/meeting/source/link/captions.vtt',
      output: 'public/captions/meeting/captions.vtt',
      purpose: 'Reject source ancestors that leave the Meeting evidence directory.',
    });

    try {
      await expect(prepareMeetingAssets({ rootDir: fixtureRoot })).rejects.toThrow(
        /Meeting asset source.*symlink/i,
      );
      expect(existsSync(path.join(fixtureRoot, 'public/captions/meeting/captions.vtt')))
        .toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it('rejects a symlinked output ancestor before writing outside public', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-output-'));
    const outside = mkdtempSync(path.join(tmpdir(), 'meeting-assets-outside-'));
    const source = path.join(fixtureRoot, 'evidence/meeting/source/captions.vtt');
    mkdirSync(path.dirname(source), { recursive: true });
    writeFileSync(source, 'WEBVTT\n');
    mkdirSync(path.join(fixtureRoot, 'public/captions/meeting'), { recursive: true });
    symlinkSync(outside, path.join(fixtureRoot, 'public/captions/meeting/link'));
    writeFixtureManifest(fixtureRoot, {
      id: 'unsafe-output',
      kind: 'captions',
      source: 'evidence/meeting/source/captions.vtt',
      output: 'public/captions/meeting/link/captions.vtt',
      purpose: 'Reject output ancestors that leave the public Meeting directory.',
    });

    try {
      await expect(prepareMeetingAssets({ rootDir: fixtureRoot })).rejects.toThrow(
        /Meeting asset output.*symlink/i,
      );
      expect(existsSync(path.join(outside, 'captions.vtt'))).toBe(false);
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it('rejects a symlinked output leaf before overwriting its target', async () => {
    const fixtureRoot = mkdtempSync(path.join(tmpdir(), 'meeting-assets-output-leaf-'));
    const outside = mkdtempSync(path.join(tmpdir(), 'meeting-assets-outside-'));
    const source = path.join(fixtureRoot, 'evidence/meeting/source/captions.vtt');
    const output = path.join(fixtureRoot, 'public/captions/meeting/captions.vtt');
    const outsideTarget = path.join(outside, 'captions.vtt');
    mkdirSync(path.dirname(source), { recursive: true });
    mkdirSync(path.dirname(output), { recursive: true });
    writeFileSync(source, 'WEBVTT\n\n00:00.000 --> 00:01.000\nreplacement\n');
    writeFileSync(outsideTarget, 'do not replace');
    symlinkSync(outsideTarget, output);
    writeFixtureManifest(fixtureRoot, {
      id: 'unsafe-output-leaf',
      kind: 'captions',
      source: 'evidence/meeting/source/captions.vtt',
      output: 'public/captions/meeting/captions.vtt',
      purpose: 'Reject output leaves that redirect writes outside public.',
    });

    try {
      await expect(prepareMeetingAssets({ rootDir: fixtureRoot })).rejects.toThrow(
        /Meeting asset output.*symlink/i,
      );
      expect(readFileSync(outsideTarget, 'utf8')).toBe('do not replace');
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true });
      rmSync(outside, { recursive: true, force: true });
    }
  });

  it('generates non-empty public derivatives', () => {
    const { assets } = loadManifest();

    for (const asset of assets) {
      if (
        asset.readiness === 'awaiting-source' ||
        !existsSync(path.join(root, asset.source))
      ) continue;
      const output = path.join(root, asset.output);
      expect(existsSync(output), asset.output).toBe(true);
      expect(statSync(output).size, asset.output).toBeGreaterThan(128);
    }
  });
});
