import { createHash, randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');
const defaultDemoRoot = path.join(root, 'public/demos/stt-demo');
const defaultOutputPath = path.join(
  root,
  'evidence/stt-demo/publication-checksums.json',
);

function resolvePublishedPath(demoRoot, relativePath) {
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

async function listFiles(fileSystem, demoRoot, relative = '') {
  const directory = relative
    ? resolvePublishedPath(demoRoot, relative)
    : demoRoot;
  const entries = await fileSystem.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fileSystem, demoRoot, candidate));
    } else if (entry.isFile()) {
      files.push(candidate);
    }
  }
  return files;
}

export async function writeSttPublicationChecksums({
  demoRoot: demoRootValue = defaultDemoRoot,
  outputPath: outputPathValue = defaultOutputPath,
  fileSystem = fs,
} = {}) {
  const demoRoot = path.resolve(demoRootValue);
  const outputPath = path.resolve(outputPathValue);
  const files = [];
  for (const publishedPath of (
    await listFiles(fileSystem, demoRoot)
  ).sort()) {
    const bytes = await fileSystem.readFile(
      resolvePublishedPath(demoRoot, publishedPath),
    );
    files.push({
      path: publishedPath,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }

  const contents = `${JSON.stringify({ version: 1, files }, null, 2)}\n`;
  const temporaryPath = `${outputPath}.tmp-${process.pid}-${randomUUID()}`;
  let handle;
  try {
    handle = await fileSystem.open(temporaryPath, 'wx');
    await handle.writeFile(contents);
    await handle.sync();
    await handle.close();
    handle = undefined;
    await fileSystem.rename(temporaryPath, outputPath);
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined);
    await fileSystem.rm(temporaryPath, { force: true }).catch(() => undefined);
    throw error;
  }

  return files.length;
}

if (process.argv[1] === scriptPath) {
  await writeSttPublicationChecksums();
}
