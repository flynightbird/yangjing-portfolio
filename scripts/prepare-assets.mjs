import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await fs.readFile(path.join(root, 'assets/manifest.json'), 'utf8'));
const outputDir = path.join(root, 'public/images');
await fs.mkdir(outputDir, { recursive: true });

for (const asset of manifest.assets) {
  let pipeline = sharp(asset.source, { failOn: 'error' });
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
