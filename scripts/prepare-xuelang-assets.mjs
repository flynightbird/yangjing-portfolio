import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(projectRoot, 'evidence/xuelang/manifest.json');
const evidenceRoot = path.join(projectRoot, 'evidence/xuelang');
const outputRoot = path.join(projectRoot, 'public/images/xuelang');
const interactionBackground = [235, 237, 238];
const interactionBackgroundTarget = [227, 236, 231];
const interactionBackgroundThresholdSquared = 20 ** 2;

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

export function resolveXuelangSourcePath(sourcePath, assetId = sourcePath) {
  const absolutePath = path.resolve(projectRoot, sourcePath);
  if (!isInside(evidenceRoot, absolutePath)) {
    throw new Error(`${assetId}: source must stay inside evidence/xuelang`);
  }
  return absolutePath;
}

function positiveRect(rect) {
  return rect && ['left', 'top', 'width', 'height'].every(
    (key) => Number.isInteger(rect[key]) && rect[key] >= (key === 'left' || key === 'top' ? 0 : 1),
  );
}

export function validateXuelangManifest(manifest) {
  if (manifest?.version !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('Xuelang manifest must use version 1 with an assets array');
  }

  const outputs = new Set();
  for (const asset of manifest.assets) {
    if (!asset.id || !/^0[0-7]$/.test(asset.chapter)) {
      throw new Error(`Invalid Xuelang asset identity: ${asset.id ?? 'unknown'}`);
    }
    if (!Array.isArray(asset.sourcePaths) || asset.sourcePaths.length === 0) {
      throw new Error(`${asset.id}: sourcePaths must not be empty`);
    }
    if (asset.sourcePaths.some((sourcePath) => path.isAbsolute(sourcePath))) {
      throw new Error(`${asset.id}: source paths must be project-relative`);
    }
    if (!positiveRect(asset.crop) || !positiveRect({ left: 0, top: 0, ...asset.intrinsic })) {
      throw new Error(`${asset.id}: crop and intrinsic dimensions must be positive`);
    }
    const output = path.resolve(projectRoot, asset.output);
    if (!isInside(outputRoot, output) || !['webp', 'png'].includes(asset.format)) {
      throw new Error(`${asset.id}: output must stay inside public/images/xuelang`);
    }
    if (outputs.has(output)) throw new Error(`${asset.id}: duplicate output path`);
    outputs.add(output);
    if (asset.composition && asset.composition.length !== asset.sourcePaths.length) {
      throw new Error(`${asset.id}: composition must match source count`);
    }
  }

  return manifest;
}

async function cropBuffer(sourcePath, crop, target) {
  return sharp(sourcePath)
    .extract(crop)
    .resize(target.width, target.height, { fit: 'fill' })
    .png()
    .toBuffer();
}

export async function prepareXuelangInteractionWebp(input) {
  const { data, info } = await sharp(input)
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixelCount = info.width * info.height;
  const visited = Buffer.alloc(pixelCount);
  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  const matchesBackground = (index) => {
    const offset = index * info.channels;
    const red = data[offset] - interactionBackground[0];
    const green = data[offset + 1] - interactionBackground[1];
    const blue = data[offset + 2] - interactionBackground[2];
    return red * red + green * green + blue * blue
      <= interactionBackgroundThresholdSquared;
  };
  const enqueue = (index) => {
    if (visited[index] || !matchesBackground(index)) return;
    visited[index] = 1;
    queue[tail] = index;
    tail += 1;
  };

  for (let x = 0; x < info.width; x += 1) {
    enqueue(x);
    enqueue((info.height - 1) * info.width + x);
  }
  for (let y = 1; y < info.height - 1; y += 1) {
    enqueue(y * info.width);
    enqueue(y * info.width + info.width - 1);
  }

  while (head < tail) {
    const index = queue[head];
    head += 1;
    const x = index % info.width;
    if (x > 0) enqueue(index - 1);
    if (x + 1 < info.width) enqueue(index + 1);
    if (index >= info.width) enqueue(index - info.width);
    if (index + info.width < pixelCount) enqueue(index + info.width);
  }

  for (let index = 0; index < tail; index += 1) {
    const offset = queue[index] * info.channels;
    data[offset] = interactionBackgroundTarget[0];
    data[offset + 1] = interactionBackgroundTarget[1];
    data[offset + 2] = interactionBackgroundTarget[2];
  }

  return sharp(data, { raw: info })
    .webp({ lossless: true, effort: 6 })
    .toBuffer();
}

async function prepareAsset(asset) {
  const outputPath = path.resolve(projectRoot, asset.output);
  const sourcePaths = asset.sourcePaths.map((sourcePath) =>
    resolveXuelangSourcePath(sourcePath, asset.id));

  await Promise.all(sourcePaths.map((sourcePath) => fs.access(sourcePath)));
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  if (asset.composition) {
    const layers = await Promise.all(
      sourcePaths.map(async (sourcePath, index) => {
        const rectangle = asset.composition[index];
        return {
          input: await cropBuffer(sourcePath, asset.crop, rectangle),
          left: rectangle.left,
          top: rectangle.top,
        };
      }),
    );
    await sharp({
      create: {
        width: asset.intrinsic.width,
        height: asset.intrinsic.height,
        channels: 3,
        background: '#eef2ef',
      },
    })
      .composite(layers)
      .webp({ quality: 88, effort: 6 })
      .toFile(outputPath);
    return;
  }

  const pipeline = sharp(sourcePaths[0])
    .extract(asset.crop)
    .resize(asset.intrinsic.width, asset.intrinsic.height, { fit: 'fill' });
  if (asset.id === 'learning-interaction') {
    const prepared = await pipeline.png().toBuffer();
    await fs.writeFile(outputPath, await prepareXuelangInteractionWebp(prepared));
  } else if (asset.format === 'png') {
    await pipeline.png({ compressionLevel: 9 }).toFile(outputPath);
  } else {
    await pipeline.webp({ quality: 88, effort: 6 }).toFile(outputPath);
  }
}

export async function prepareXuelangAssets({ rootDir = projectRoot } = {}) {
  if (path.resolve(rootDir) !== projectRoot) {
    throw new Error('Xuelang preparation currently targets the repository root only');
  }
  const manifest = validateXuelangManifest(
    JSON.parse(await fs.readFile(manifestPath, 'utf8')),
  );
  for (const asset of manifest.assets) await prepareAsset(asset);
  return manifest.assets.map((asset) => asset.output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareXuelangAssets()
    .then((outputs) => console.log(`Prepared ${outputs.length} Xuelang assets.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
