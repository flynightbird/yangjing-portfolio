import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoRoot = path.join(root, 'public/demos/stt-demo');
const outputPath = path.join(
  root,
  'evidence/stt-demo/publication-checksums.json',
);

function resolvePublishedPath(relativePath) {
  const absolutePath = path.resolve(demoRoot, relativePath);
  const relative = path.relative(demoRoot, absolutePath);
  if (
    relative === '' ||
    relative.startsWith('..') ||
    path.isAbsolute(relative)
  ) {
    throw new Error(`Published path escapes STT root: ${relativePath}`);
  }
  return absolutePath;
}

async function listFiles(relative = '') {
  const directory = relative
    ? resolvePublishedPath(relative)
    : demoRoot;
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(candidate));
    } else if (entry.isFile()) {
      files.push(candidate);
    }
  }
  return files;
}

const files = [];
for (const publishedPath of (await listFiles()).sort()) {
  const bytes = await fs.readFile(resolvePublishedPath(publishedPath));
  files.push({
    path: publishedPath,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}

await fs.writeFile(
  outputPath,
  `${JSON.stringify({ version: 1, files }, null, 2)}\n`,
);
