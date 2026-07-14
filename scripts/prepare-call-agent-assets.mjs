import fs, { constants } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRootValue = process.env.CALL_AGENT_SOURCE_ROOT;

if (!sourceRootValue) {
  console.error('CALL_AGENT_SOURCE_ROOT must point to an existing readable directory.');
  process.exit(1);
}

const sourceRoot = path.resolve(sourceRootValue);
try {
  const sourceRootStat = await fs.stat(sourceRoot);
  await fs.access(sourceRoot, constants.R_OK);
  if (!sourceRootStat.isDirectory()) {
    throw new Error('not a directory');
  }
} catch {
  console.error('CALL_AGENT_SOURCE_ROOT must point to an existing readable directory.');
  process.exit(1);
}

const manifest = JSON.parse(
  await fs.readFile(
    path.join(root, 'evidence/call-agent/manifest.json'),
    'utf8',
  ),
);
const outputDir = path.join(root, 'public/images/call-agent');
await fs.mkdir(outputDir, { recursive: true });

for (const asset of manifest.assets) {
  if (path.isAbsolute(asset.source)) {
    throw new Error(`Manifest source must be relative: ${asset.source}`);
  }

  const sourcePath = path.resolve(sourceRoot, asset.source);
  const relativeSource = path.relative(sourceRoot, sourcePath);
  if (relativeSource.startsWith('..') || path.isAbsolute(relativeSource)) {
    throw new Error(`Manifest source escapes CALL_AGENT_SOURCE_ROOT: ${asset.source}`);
  }

  if (path.basename(asset.output) !== asset.output) {
    throw new Error(`Manifest output must be a file name: ${asset.output}`);
  }

  await fs.access(sourcePath, constants.R_OK);
  let pipeline = sharp(sourcePath, { failOn: 'error' });
  if (asset.extract) pipeline = pipeline.extract(asset.extract);
  const composites = (asset.redactions || []).map((rect) => ({
    input: Buffer.from(`<svg width="${rect.width}" height="${rect.height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${rect.color || '#111827'}"/></svg>`),
    left: rect.left,
    top: rect.top
  }));
  if (composites.length) pipeline = pipeline.composite(composites);
  await pipeline.toFile(path.join(outputDir, asset.output));
}

console.log(`Prepared ${manifest.assets.length} public-safe images`);
