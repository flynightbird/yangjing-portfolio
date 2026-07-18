import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'evidence/meeting/manifest.json');

function resolveContained(relativePath, prefix) {
  if (
    !relativePath.startsWith(prefix) ||
    path.isAbsolute(relativePath) ||
    relativePath.split('/').includes('..')
  ) {
    throw new Error(`Unsafe Meeting asset path: ${relativePath}`);
  }
  return path.join(root, relativePath);
}

export async function prepareMeetingAssets({ staticOnly = false } = {}) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('Meeting manifest must use version 1 with an assets array');
  }

  const outputs = [];
  for (const asset of manifest.assets) {
    if (staticOnly && asset.kind !== 'image') continue;
    const source = resolveContained(asset.source, 'evidence/meeting/source/');
    const output = resolveContained(asset.output, 'public/');
    await fs.access(source);
    await fs.mkdir(path.dirname(output), { recursive: true });
    if (asset.kind === 'image') {
      await sharp(source).webp({ quality: 88, effort: 6 }).toFile(output);
    } else {
      await fs.copyFile(source, output);
    }
    outputs.push(asset.output);
  }

  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const staticOnly = process.argv.includes('--static-only');
  prepareMeetingAssets({ staticOnly })
    .then((outputs) => console.log(`Prepared ${outputs.length} Meeting assets.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
