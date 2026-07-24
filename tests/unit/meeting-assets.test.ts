import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const requiredIds = [
  'meeting-hero',
  'meeting-logo-light',
  'meeting-logo-dark',
  'meeting-hero-web-poster',
  'meeting-hero-web',
  'meeting-hero-app-poster',
  'meeting-hero-app',
  'meeting-stage-web-poster',
  'meeting-stage-web',
  'meeting-stage-landscape-app-poster',
  'meeting-stage-landscape-app',
  'meeting-stage-portrait-app-poster',
  'meeting-stage-portrait-app',
  'meeting-whiteboard-web-poster',
  'meeting-whiteboard-web',
  'meeting-whiteboard-app-1-poster',
  'meeting-whiteboard-app-1',
  'meeting-whiteboard-app-2-poster',
  'meeting-whiteboard-app-2',
  'meeting-transcript-app-poster',
  'meeting-transcript-app',
  'meeting-interpretation-on-app-poster',
  'meeting-interpretation-on-app',
  'meeting-interpretation-live-app-poster',
  'meeting-interpretation-live-app',
  'meeting-beauty-app-poster',
  'meeting-beauty-app',
  'meeting-safety-app-poster',
  'meeting-safety-app',
  'adaptive-layout-poster',
  'meeting-state-matrix',
  'device-comparison',
  'whiteboard-multidevice',
  'participant-priority',
  'transcript-poster',
  'caption-vs-transcript',
  'speech-to-api',
  'capability-system',
  'launch-coverage',
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
    expect(manifest.assets.map(({ id }) => id)).toEqual(
      expect.arrayContaining(requiredIds),
    );
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
        expect(asset).not.toHaveProperty('captions');
      }
    }
  });

  it('publishes only evidence that exists in the repository', () => {
    const { assets } = loadManifest();

    expect(assets.some(({ kind }) => kind === 'video')).toBe(true);
    expect(assets.map(({ output }) => output)).not.toContain('public/captions/meeting/');
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
