import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import {
  RESPONSIVE_WIDTHS,
  assertSafeRelativePath,
  dimensionsAtWidth,
  ensureSafeOutputPath,
  resolveContainedPath,
  resolveRealContainedPath,
  responsiveVariantPath,
  selectResponsiveWidths,
} from '../lib/media/assets.ts';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');

function assertManifest(manifest) {
  if (!manifest || manifest.version !== 1) throw new Error('Media manifest version must be 1');
  if (JSON.stringify(manifest.allowedWidths) !== JSON.stringify(RESPONSIVE_WIDTHS)) {
    throw new Error(`Media manifest allowedWidths must equal ${RESPONSIVE_WIDTHS.join(', ')}`);
  }
  assertSafeRelativePath(manifest.sourceRoot, 'sourceRoot');
  if (manifest.sourceRoot === 'public' || manifest.sourceRoot.startsWith('public/')) {
    throw new Error('Raw media sourceRoot must not be inside public/');
  }
  if (!Array.isArray(manifest.assets)) throw new Error('Media manifest assets must be an array');
  if (!Array.isArray(manifest.generated)) throw new Error('Media manifest generated must be an array');
}

async function readExcludedSources(rootDir) {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(rootDir, 'evidence/call-agent/manifest.json'), 'utf8'),
    );
    return new Set(
      Array.isArray(manifest.excluded)
        ? manifest.excluded.map((entry) => entry?.source).filter(Boolean)
        : [],
    );
  } catch (error) {
    if (error?.code === 'ENOENT') return new Set();
    throw new Error('Unable to read Call Agent excluded-source manifest');
  }
}

async function inspectAssets({ rootDir, manifest }) {
  if (manifest.assets.length === 0) return [];
  const realSourceRoot = await resolveRealContainedPath(
    rootDir,
    manifest.sourceRoot,
    'Media sourceRoot',
  );
  const excludedSources = await readExcludedSources(rootDir);
  const destinations = new Set();
  const inspected = [];
  for (const [index, asset] of manifest.assets.entries()) {
    if (!asset || typeof asset.id !== 'string' || !asset.id.trim()) {
      throw new Error(`Media asset ${index} must have an id`);
    }
    assertSafeRelativePath(asset.source, `assets[${index}].source`);
    if (excludedSources.has(asset.source)) {
      throw new Error(`Media asset ${asset.id} uses an excluded authorization-token source`);
    }
    assertSafeRelativePath(asset.destination, `assets[${index}].destination`);
    if (!asset.destination.startsWith('public/')) {
      throw new Error(`Media asset ${asset.id} destination must be under public/`);
    }
    if (destinations.has(asset.destination)) {
      throw new Error(`Duplicate media destination: ${asset.destination}`);
    }
    destinations.add(asset.destination);
    if (!['jpeg', 'png'].includes(asset.fallback)) {
      throw new Error(`Media asset ${asset.id} fallback must be jpeg or png`);
    }
    if (!Array.isArray(asset.widths) || asset.widths.length === 0) {
      throw new Error(`Media asset ${asset.id} must declare widths`);
    }
    const sourcePath = resolveContainedPath(realSourceRoot, asset.source);
    const realSourcePath = await fs.realpath(sourcePath).catch(() => {
      throw new Error(`Media source is unreadable: ${asset.source}`);
    });
    const relation = path.relative(realSourceRoot, realSourcePath);
    if (!relation || relation.startsWith('..') || path.isAbsolute(relation)) {
      throw new Error(`Media source escapes sourceRoot: ${asset.source}`);
    }
    const stat = await fs.stat(realSourcePath);
    if (!stat.isFile()) throw new Error(`Media source is not a file: ${asset.source}`);
    let metadata;
    try {
      metadata = await sharp(realSourcePath, { failOn: 'error' }).metadata();
    } catch {
      throw new Error(`Media source is not a readable image: ${asset.source}`);
    }
    if (!metadata.width || !metadata.height) {
      throw new Error(`Media source has no intrinsic dimensions: ${asset.source}`);
    }
    const widths = selectResponsiveWidths(asset.widths, metadata.width);
    for (const width of widths) {
      for (const format of ['avif', 'webp', asset.fallback]) {
        const relativeOutput = responsiveVariantPath(asset.destination, width, format);
        await ensureSafeOutputPath(
          path.join(rootDir, 'public'),
          resolveContainedPath(rootDir, relativeOutput),
        );
      }
    }
    inspected.push({ asset, sourcePath: realSourcePath, metadata, widths });
  }
  return inspected;
}

function encode(pipeline, format) {
  if (format === 'avif') return pipeline.avif({ quality: 80 });
  if (format === 'webp') return pipeline.webp({ quality: 82 });
  if (format === 'jpeg') return pipeline.jpeg({ quality: 85, mozjpeg: true });
  return pipeline.png({ compressionLevel: 9 });
}

export async function generateResponsiveMedia(options = {}) {
  const rootDir = path.resolve(options.rootDir ?? repositoryRoot);
  const manifestPath = path.resolve(
    options.manifestPath ?? path.join(rootDir, 'evidence/media/manifest.json'),
  );
  const manifestRelation = path.relative(rootDir, manifestPath);
  if (manifestRelation.startsWith('..') || path.isAbsolute(manifestRelation)) {
    throw new Error('Media manifest escapes repository root');
  }
  let manifest;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  } catch {
    throw new Error('Media manifest is missing or invalid JSON');
  }
  assertManifest(manifest);
  const inspected = await inspectAssets({ rootDir, manifest });
  const records = [];
  for (const { asset, sourcePath, metadata, widths } of inspected) {
    asset.intrinsicWidth = metadata.width;
    asset.intrinsicHeight = metadata.height;
    for (const width of widths) {
      const dimensions = dimensionsAtWidth(metadata.width, metadata.height, width);
      for (const format of ['avif', 'webp', asset.fallback]) {
        const relativeOutput = responsiveVariantPath(asset.destination, width, format);
        const outputPath = resolveContainedPath(rootDir, relativeOutput);
        await fs.mkdir(path.dirname(outputPath), { recursive: true });
        await encode(sharp(sourcePath, { failOn: 'error' }).resize({ width, withoutEnlargement: true }), format)
          .toFile(outputPath);
        const stat = await fs.stat(outputPath);
        records.push({
          asset: asset.id,
          path: relativeOutput,
          format,
          width: dimensions.width,
          height: dimensions.height,
          bytes: stat.size,
        });
      }
    }
  }
  manifest.generated = records;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  return records;
}

if (process.argv[1] === scriptPath) {
  try {
    const records = await generateResponsiveMedia();
    console.log(`Generated ${records.length} responsive media variants`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
