import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  meetingFilmClips,
  meetingFilmSourceDirectory,
} from '@/components/meeting/meeting-film-contract';
import { meetingFilmSourcesReady } from '@/components/meeting/meeting-film-readiness.server';

const expectedClips = [
  {
    id: 'meeting-stage-portrait',
    sourceFile: 'meeting-stage-portrait.mp4',
    src: '/videos/meeting/meeting-stage-portrait.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    fallback: {
      en: 'Portrait meeting stage before the native orientation change',
      zh: '原生横竖屏切换前的手机竖屏会议舞台',
    },
    orientation: 'portrait',
  },
  {
    id: 'meeting-stage-landscape',
    sourceFile: 'meeting-stage-landscape.mp4',
    src: '/videos/meeting/meeting-stage-landscape.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    fallback: {
      en: 'Landscape meeting stage after the native orientation change',
      zh: '原生横竖屏切换后的手机横屏会议舞台',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-whiteboard-portrait',
    sourceFile: 'meeting-whiteboard-portrait.mp4',
    src: '/videos/meeting/meeting-whiteboard-portrait.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Portrait whiteboard workspace with participant awareness above the canvas',
      zh: '竖屏白板工作区在画布上方保留参会者感知',
    },
    orientation: 'portrait',
  },
  {
    id: 'meeting-whiteboard-landscape',
    sourceFile: 'meeting-whiteboard-landscape.mp4',
    src: '/videos/meeting/meeting-whiteboard-landscape.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Landscape whiteboard workspace keeps tools and participants beside the canvas',
      zh: '横屏白板工作区将工具与参会者放在画布两侧',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-web-transcription',
    sourceFile: 'meeting-web-transcription.mp4',
    src: '/videos/meeting/meeting-web-transcription.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    fallback: {
      en: 'Web transcription panel sharing the workspace with the primary meeting stage',
      zh: 'Web 实时转写面板与主要会议舞台并行使用页面空间',
    },
    orientation: 'landscape',
  },
  {
    id: 'meeting-web-layout',
    sourceFile: 'meeting-web-layout.mp4',
    src: '/videos/meeting/meeting-web-layout.mp4',
    poster: '/images/meeting/device-comparison.webp',
    fallback: {
      en: 'Web meeting workspace moving participant and chat panels around the stage',
      zh: 'Web 会议工作区在舞台两侧切换参会者与聊天面板',
    },
    orientation: 'landscape',
  },
] as const;

function requiredFilmPaths(rootDirectory: string) {
  const relativePaths = meetingFilmClips.flatMap((clip) => [
    `${meetingFilmSourceDirectory}/${clip.sourceFile}`,
    `public${clip.src}`,
    `public${clip.poster}`,
  ]);

  return [...new Set(relativePaths)].map((relativePath) =>
    path.join(rootDirectory, relativePath),
  );
}

function writeRequiredFilmFiles(
  rootDirectory: string,
  directoryPath?: string,
) {
  for (const filePath of requiredFilmPaths(rootDirectory)) {
    mkdirSync(path.dirname(filePath), { recursive: true });
    if (filePath === directoryPath) mkdirSync(filePath);
    else writeFileSync(filePath, 'test fixture');
  }
}

function writeFilmManifest(rootDirectory: string, readiness: 'ready' | 'awaiting-source') {
  const manifestPath = path.join(rootDirectory, 'evidence/meeting/manifest.json');
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify({
    version: 1,
    assets: meetingFilmClips.map((clip) => ({
      id: clip.id,
      kind: 'video',
      source: `${meetingFilmSourceDirectory}/${clip.sourceFile}`,
      output: `public${clip.src}`,
      poster: clip.poster,
      orientation: clip.orientation,
      publicationRequired: true,
      readiness,
    })),
  }));
}

describe('Meeting Product Film contract', () => {
  it('defines the six native clips in stable editorial order', () => {
    expect(meetingFilmClips).toEqual(expectedClips);
    for (const clip of meetingFilmClips) expect(clip).not.toHaveProperty('captions');
  });

  it('reports readiness only when every non-empty source and rendered output exists', () => {
    expect(meetingFilmSourcesReady()).toBe(
      requiredFilmPaths(process.cwd()).every(
        (filePath) => existsSync(filePath) && statSync(filePath).size > 0,
      ),
    );
  });

  it('does not become ready when only the six original MP4 files exist', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'meeting-film-originals-'));
    const sourceDirectory = path.join(root, meetingFilmSourceDirectory);
    mkdirSync(sourceDirectory, { recursive: true });
    for (const { sourceFile } of meetingFilmClips) {
      writeFileSync(path.join(sourceDirectory, sourceFile), 'test fixture');
    }

    try {
      expect(meetingFilmSourcesReady(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('requires every prepared public video and poster without caption sidecars', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'meeting-film-outputs-'));
    writeRequiredFilmFiles(root);
    writeFilmManifest(root, 'ready');

    try {
      expect(meetingFilmSourcesReady(root)).toBe(true);
      rmSync(path.join(root, 'public/videos/meeting/meeting-web-layout.mp4'));
      expect(meetingFilmSourcesReady(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('fails closed when every file exists but a publication record is awaiting source', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'meeting-film-awaiting-'));
    writeRequiredFilmFiles(root);
    writeFilmManifest(root, 'awaiting-source');

    try {
      expect(meetingFilmSourcesReady(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([
    ['removes a canonical record', (assets: Array<Record<string, unknown>>) => assets.filter(
      ({ id }) => id !== 'meeting-web-layout',
    )],
    ['declassifies a canonical record', (assets: Array<Record<string, unknown>>) => assets.map(
      (asset) => asset.id === 'meeting-stage-portrait'
        ? { ...asset, publicationRequired: false }
        : asset,
    )],
    ['substitutes a ready record', (assets: Array<Record<string, unknown>>) => assets.map(
      (asset) => asset.id === 'meeting-stage-landscape'
        ? { ...asset, id: 'substitute-landscape' }
        : asset,
    )],
    ['adds a partial ready publication record', (assets: Array<Record<string, unknown>>) => [
      ...assets,
      {
        id: 'partial-ready-caption',
        kind: 'captions',
        source: 'evidence/meeting/source/partial-ready.en.vtt',
        output: 'public/captions/meeting/partial-ready.en.vtt',
        publicationRequired: true,
        readiness: 'ready',
      },
    ]],
  ])('fails closed when the manifest %s', (_name, mutate) => {
    const root = mkdtempSync(path.join(tmpdir(), 'meeting-film-inventory-'));
    writeRequiredFilmFiles(root);
    writeFilmManifest(root, 'ready');
    const manifestPath = path.join(root, 'evidence/meeting/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifest.assets = mutate(manifest.assets);
    writeFileSync(manifestPath, JSON.stringify(manifest));

    try {
      expect(meetingFilmSourcesReady(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('does not treat a directory with a required filename as a ready file', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'meeting-film-readiness-'));
    const directoryPath = path.join(
      root,
      'public/videos/meeting/meeting-stage-portrait.mp4',
    );
    writeRequiredFilmFiles(root, directoryPath);

    try {
      expect(meetingFilmSourcesReady(root)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
