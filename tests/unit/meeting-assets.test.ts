import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

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
      expect(asset.purpose.trim().length).toBeGreaterThan(20);
      if (asset.kind === 'image') {
        expect(asset.alt?.en.trim().length).toBeGreaterThan(20);
        expect(asset.alt?.zh.trim().length).toBeGreaterThan(8);
      }
      if (asset.kind === 'video') {
        expect(asset.poster).toMatch(/^\/images\/meeting\//);
        expect(asset.captions).toEqual({
          en: expect.stringMatching(/^\/captions\/meeting\/.+\.en\.vtt$/),
          zh: expect.stringMatching(/^\/captions\/meeting\/.+\.zh\.vtt$/),
        });
      }
    }
  });

  it('generates non-empty public derivatives', () => {
    const { assets } = loadManifest();

    for (const asset of assets) {
      const output = path.join(root, asset.output);
      expect(existsSync(output), asset.output).toBe(true);
      expect(statSync(output).size, asset.output).toBeGreaterThan(128);
    }
  });
});
