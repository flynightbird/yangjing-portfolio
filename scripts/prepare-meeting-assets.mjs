import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

import { validateMeetingPublicationMedia } from './meeting-media-validation.mjs';
import { validateMeetingPublicationInventory } from './meeting-publication-contract.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function resolveContained(rootDirectory, relativePath, prefix) {
  if (
    !relativePath.startsWith(prefix) ||
    path.isAbsolute(relativePath) ||
    relativePath.split('/').includes('..')
  ) {
    throw new Error(`Unsafe Meeting asset path: ${relativePath}`);
  }
  const resolvedRoot = path.resolve(rootDirectory);
  const resolvedPath = path.resolve(resolvedRoot, relativePath);
  const relation = path.relative(resolvedRoot, resolvedPath);
  if (!relation || relation === '..' || relation.startsWith(`..${path.sep}`)) {
    throw new Error(`Unsafe Meeting asset path: ${relativePath}`);
  }
  return resolvedPath;
}

async function inspectPath(rootDirectory, targetPath, label, includeLeaf) {
  const resolvedRoot = path.resolve(rootDirectory);
  const relation = path.relative(resolvedRoot, targetPath);
  const segments = relation.split(path.sep).filter(Boolean);
  const inspectedSegments = includeLeaf ? segments : segments.slice(0, -1);
  let current = resolvedRoot;
  let finalStat;

  for (const segment of inspectedSegments) {
    current = path.join(current, segment);
    try {
      finalStat = await fs.lstat(current);
    } catch (error) {
      if (error?.code === 'ENOENT') return undefined;
      throw error;
    }
    if (finalStat.isSymbolicLink()) {
      throw new Error(`${label} path contains a symlink: ${relation}`);
    }
    if (current !== targetPath && !finalStat.isDirectory()) {
      throw new Error(`${label} ancestor must be a directory: ${relation}`);
    }
  }
  return finalStat;
}

async function sourceIsRegularFile(rootDirectory, source, relativePath) {
  const stat = await inspectPath(
    rootDirectory,
    source,
    'Meeting asset source',
    true,
  );
  if (!stat) return false;
  if (!stat.isFile()) {
    throw new Error(`Meeting asset source must be a regular file: ${relativePath}`);
  }
  await assertRealContained(rootDirectory, source, 'Meeting asset source');
  return true;
}

async function assertSafeOutputParent(rootDirectory, output) {
  await inspectPath(
    rootDirectory,
    output,
    'Meeting asset output',
    false,
  );
}

async function assertSafeOutputLeaf(rootDirectory, output) {
  const stat = await inspectPath(
    rootDirectory,
    output,
    'Meeting asset output',
    true,
  );
  if (stat && !stat.isFile()) {
    throw new Error(
      `Meeting asset output must be absent or a regular file: ${path.relative(rootDirectory, output)}`,
    );
  }
}

async function assertRealContained(rootDirectory, targetPath, label) {
  const [realRoot, realTarget] = await Promise.all([
    fs.realpath(path.resolve(rootDirectory)),
    fs.realpath(targetPath),
  ]);
  const relation = path.relative(realRoot, realTarget);
  if (relation === '..' || relation.startsWith(`..${path.sep}`) || path.isAbsolute(relation)) {
    throw new Error(`${label} resolves outside repository: ${targetPath}`);
  }
}

export async function prepareMeetingAssets({
  staticOnly = false,
  publication = false,
  rootDir = repositoryRoot,
  probeMeetingVideo,
} = {}) {
  const manifestPath = path.join(rootDir, 'evidence/meeting/manifest.json');
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('Meeting manifest must use version 1 with an assets array');
  }
  if (publication && !staticOnly) {
    const inventoryErrors = validateMeetingPublicationInventory(manifest.assets);
    if (inventoryErrors.length > 0) {
      throw new Error(
        `Invalid Meeting Product Film publication inventory:\n${inventoryErrors.join('\n')}`,
      );
    }
  }

  const availableAssets = [];
  const missingPublicationSources = [];
  const awaitingPublicationRecords = manifest.assets
    .filter(({ publicationRequired, readiness }) => (
      publicationRequired === true && readiness !== 'ready'
    ))
    .map(({ id }) => id);
  for (const asset of manifest.assets) {
    if (staticOnly && asset.kind !== 'image') continue;
    const source = resolveContained(rootDir, asset.source, 'evidence/meeting/source/');
    const output = resolveContained(rootDir, asset.output, 'public/');
    if (await sourceIsRegularFile(rootDir, source, asset.source)) {
      await assertSafeOutputParent(rootDir, output);
      availableAssets.push({ asset, source, output });
    } else {
      if (asset.publicationRequired) {
        missingPublicationSources.push(asset.source);
      }
    }
  }

  if (publication && missingPublicationSources.length > 0) {
    throw new Error(
      `Meeting Product Film sources required for publication:\n${missingPublicationSources.join('\n')}`,
    );
  }
  if (publication && !staticOnly && awaitingPublicationRecords.length > 0) {
    throw new Error(
      `Meeting Product Film records awaiting source inspection:\n${awaitingPublicationRecords.join('\n')}`,
    );
  }
  if (publication && !staticOnly) {
    const mediaErrors = await validateMeetingPublicationMedia({
      rootDir,
      assets: manifest.assets,
      probeVideo: probeMeetingVideo,
    });
    if (mediaErrors.length > 0) {
      throw new Error(`Meeting Product Film media validation failed:\n${mediaErrors.join('\n')}`);
    }
  }

  const outputs = [];
  for (const { asset, source, output } of availableAssets) {
    const outputDirectory = path.dirname(output);
    await fs.mkdir(outputDirectory, { recursive: true });
    await assertSafeOutputParent(rootDir, output);
    await assertRealContained(rootDir, outputDirectory, 'Meeting asset output');
    await assertSafeOutputLeaf(rootDir, output);

    const stagingDirectory = await fs.mkdtemp(
      path.join(outputDirectory, '.meeting-asset-'),
    );
    const stagedOutput = path.join(stagingDirectory, path.basename(output));
    try {
      if (asset.kind === 'image') {
        await sharp(source).webp({ quality: 88, effort: 6 }).toFile(stagedOutput);
      } else {
        await fs.copyFile(source, stagedOutput);
      }
      await assertSafeOutputParent(rootDir, output);
      await assertRealContained(rootDir, outputDirectory, 'Meeting asset output');
      await assertSafeOutputLeaf(rootDir, output);
      await fs.rename(stagedOutput, output);
    } finally {
      await fs.rm(stagingDirectory, { recursive: true, force: true });
    }
    outputs.push(asset.output);
  }

  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const staticOnly = process.argv.includes('--static-only');
  const publication = process.argv.includes('--publication');
  prepareMeetingAssets({ staticOnly, publication })
    .then((outputs) => console.log(`Prepared ${outputs.length} Meeting assets.`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
