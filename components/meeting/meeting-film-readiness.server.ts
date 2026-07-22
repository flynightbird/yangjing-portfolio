import 'server-only';

import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';

import {
  meetingFilmClips,
  meetingFilmSourceDirectory,
} from './meeting-film-contract';

export function meetingFilmSourcesReady(
  rootDirectory = process.cwd(),
): boolean {
  if (!publicationRecordsReady(rootDirectory)) return false;
  const sourceDirectory = path.join(rootDirectory, meetingFilmSourceDirectory);
  const requiredFiles = meetingFilmClips.flatMap(({ sourceFile, src, poster }) => [
    path.join(sourceDirectory, sourceFile),
    resolvePublicFile(rootDirectory, src),
    resolvePublicFile(rootDirectory, poster),
  ]);

  return [...new Set(requiredFiles)].every(isNonEmptyRegularFile);
}

function publicationRecordsReady(rootDirectory: string): boolean {
  try {
    const manifest = JSON.parse(readFileSync(
      path.join(rootDirectory, 'evidence/meeting/manifest.json'),
      'utf8',
    )) as { version?: number; assets?: unknown[] };
    if (manifest.version !== 1 || !Array.isArray(manifest.assets)) return false;
    const assets = manifest.assets.filter(
      (asset): asset is Record<string, unknown> => Boolean(
        asset && typeof asset === 'object' && !Array.isArray(asset),
      ),
    );
    const expected = meetingFilmClips.map((clip) => ({
      id: clip.id,
      kind: 'video',
      source: `${meetingFilmSourceDirectory}/${clip.sourceFile}`,
      output: `public${clip.src}`,
      poster: clip.poster,
      orientation: clip.orientation,
    }));
    const expectedIds = new Set(expected.map(({ id }) => id));
    if (assets.some(({ id, publicationRequired }) => (
      publicationRequired === true && !expectedIds.has(String(id))
    ))) return false;
    return expected.every((record) => {
      const matches = assets.filter(({ id }) => id === record.id);
      if (matches.length !== 1) return false;
      const [asset] = matches;
      if (asset.publicationRequired !== true || asset.readiness !== 'ready') return false;
      if (
        asset.kind !== record.kind ||
        asset.source !== record.source ||
        asset.output !== record.output
      ) return false;
      if ('orientation' in record) {
        return asset.poster === record.poster &&
          asset.orientation === record.orientation &&
          !Object.hasOwn(asset, 'captions');
      }
      return true;
    });
  } catch {
    return false;
  }
}

function resolvePublicFile(rootDirectory: string, publicUrl: string): string {
  return path.join(rootDirectory, 'public', publicUrl.replace(/^\//, ''));
}

function isNonEmptyRegularFile(filePath: string): boolean {
  try {
    const stat = lstatSync(filePath);
    return stat.isFile() && stat.size > 0;
  } catch {
    return false;
  }
}
