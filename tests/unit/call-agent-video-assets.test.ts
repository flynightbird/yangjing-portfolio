import path from 'node:path';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { validateVideoManifest } from '@/scripts/prepare-call-agent-videos.mjs';

const manifest = JSON.parse(
  readFileSync(
    path.join(process.cwd(), 'evidence/call-agent/video-manifest.json'),
    'utf8',
  ),
);
describe('Call Agent video manifest', () => {
  it('defines six portable, accelerated clips with an explicit trim contract', () => {
    expect(() => validateVideoManifest(manifest)).not.toThrow();
    expect(manifest.clips.map(({ id }: { id: string }) => id)).toEqual([
      'create',
      'orchestrate',
      'preview',
      'publish',
      'connect',
      'operate',
    ]);

    for (const clip of manifest.clips) {
      expect(clip.output).toMatch(/^[a-z0-9-]+\.mp4$/);
      expect(clip.poster).toMatch(/^[a-z0-9-]+\.webp$/);
      expect(clip.playbackRate).toBeGreaterThanOrEqual(1.25);
      expect(clip.playbackRate).toBeLessThanOrEqual(1.6);
      if (clip.fullSource) {
        expect(clip).not.toHaveProperty('start');
        expect(clip).not.toHaveProperty('duration');
      } else {
        expect(clip.duration).toBeGreaterThanOrEqual(2.5);
        expect(clip.duration).toBeLessThanOrEqual(8);
      }
      expect(path.isAbsolute(clip.source)).toBe(false);
      expect(clip.source.split(/[\\/]/)).not.toContain('..');
      expect(clip.description.trim().length).toBeGreaterThan(0);
    }
  });

  it('rejects traversal and duplicate output names before conversion', () => {
    expect(() =>
      validateVideoManifest({
        ...manifest,
        clips: manifest.clips.map((clip: Record<string, unknown>, index: number) =>
          index === 1 ? { ...clip, source: '../private.mov' } : clip,
        ),
      }),
    ).toThrow(/unsafe.*source/i);

    expect(() =>
      validateVideoManifest({
        ...manifest,
        clips: manifest.clips.map((clip: Record<string, unknown>, index: number) =>
          index === 1 ? { ...clip, output: manifest.clips[0].output } : clip,
        ),
      }),
    ).toThrow(/duplicate.*output/i);
  });

  it('maps inbound connection and outbound operations to videos', () => {
    expect(manifest.clips).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'connect',
        source: 'call agent/我的号码.mov',
        output: 'agent-connect.mp4',
        poster: 'agent-connect-poster.webp',
      }),
      expect.objectContaining({
        id: 'operate',
        source: 'call agent/添加外呼框架.mov',
        output: 'agent-operate.mp4',
        poster: 'agent-operate-poster.webp',
      }),
    ]));
  });

  it('uses the complete replacement recording for Preview', () => {
    expect(manifest.clips).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'orchestrate',
        source: 'call agent/智能体编排和预览.mov',
        start: 0,
        duration: 2.85,
        posterSource: 'replacement-2026-07-21/frame-001.8.jpg',
      }),
      expect.objectContaining({
        id: 'preview',
        source: 'call agent/智能体编排和预览.mov',
        fullSource: true,
        posterSource: 'replacement-2026-07-21/frame-020.0.jpg',
      }),
    ]));
    const preview = manifest.clips.find(({ id }: { id: string }) => id === 'preview');
    expect(preview).not.toHaveProperty('start');
    expect(preview).not.toHaveProperty('duration');
  });

});
