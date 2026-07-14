import fsPromises from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

import {
  loadApprovedChecksums,
  validatePublishedSttDirectory,
} from './sync-stt-demo.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function findSensitiveText(value) {
  const findings = [];
  if (/authorization\s*[:=]|bearer\s+[a-z0-9._-]{8,}/i.test(value)) findings.push('authorization token');
  if (/(?:\+?86[-\s]?)?1[3-9]\d[-\s]?\d{4}[-\s]?\d{4}/.test(value)) findings.push('phone number');
  if (/\b(?:\d{1,3}\.){3}\d{1,3}\b/.test(value)) findings.push('IP address');
  return findings;
}

export function validateManifestEntry(entry) {
  return ['source', 'output', 'chapter', 'purpose', 'alt']
    .filter((key) => !entry[key])
    .map((key) => `missing ${key}`);
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function uniqueValues(values) {
  return [...new Set(values)];
}

function isInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

export async function validateSttDemoPublication(rootDir = root) {
  const errors = [];
  const expectedSource = {
    repository: 'https://github.com/flynightbird/stt-demo',
    commit: 'e5e840a',
    demoPath: '/demos/stt-demo/index.html',
    kind: 'interactive-static-prototype',
  };
  const requiredPaths = [
    'index.html',
    'styles.css',
    'app.js',
    'assets/agora-logo.svg',
    'assets/participants/video-1.jpg',
    'assets/participants/video-2.jpg',
    'assets/participants/video-3.jpg',
    'stt-ui-component-library/packages/stt-ui/src/tokens/tokens.css',
    'stt-ui-component-library/packages/stt-ui/src/styles/components.css',
    'poster.png',
    'source-revision.json',
  ];

  let source;
  try {
    source = JSON.parse(
      await fsPromises.readFile(
        path.join(rootDir, 'evidence/stt-demo/source.json'),
        'utf8',
      ),
    );
  } catch {
    errors.push('missing or invalid STT source provenance');
  }
  if (source && JSON.stringify(source) !== JSON.stringify(expectedSource)) {
    errors.push('STT source provenance does not match the approved pin');
  }

  const demoRoot = path.join(rootDir, 'public/demos/stt-demo');
  try {
    const contract = await loadApprovedChecksums(
      path.join(rootDir, 'evidence/stt-demo/checksums.json'),
    );
    errors.push(...await validatePublishedSttDirectory(demoRoot, contract));
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  let realRootDir;
  try {
    realRootDir = await fsPromises.realpath(rootDir);
  } catch {
    return [...errors, 'unable to resolve site root for STT publication'];
  }

  for (const relativePath of requiredPaths) {
    const absolutePath = path.resolve(demoRoot, relativePath);
    if (!isInside(demoRoot, absolutePath)) {
      errors.push(`STT demo path escapes publication root: ${relativePath}`);
      continue;
    }
    try {
      const stat = await fsPromises.lstat(absolutePath);
      const realPath = await fsPromises.realpath(absolutePath);
      if (!isInside(realRootDir, realPath)) {
        errors.push(`STT demo file resolves outside site root: ${relativePath}`);
      } else if (stat.isSymbolicLink() || !stat.isFile()) {
        errors.push(`STT demo file is not regular: ${relativePath}`);
      }
    } catch (error) {
      errors.push(
        error?.code === 'ENOENT'
          ? `missing STT demo file: ${relativePath}`
          : `unable to inspect STT demo file: ${relativePath}`,
      );
    }
  }

  let revision;
  try {
    revision = JSON.parse(
      await fsPromises.readFile(
        path.join(demoRoot, 'source-revision.json'),
        'utf8',
      ),
    );
  } catch {
    if (!errors.some((error) => error.includes('source-revision.json'))) {
      errors.push('missing or invalid published STT source revision');
    }
  }
  if (revision) {
    if (
      revision.repository !== expectedSource.repository ||
      revision.kind !== expectedSource.kind ||
      revision.pinnedCommit !== expectedSource.commit
    ) {
      errors.push('published STT revision metadata does not match provenance');
    }
    if (
      typeof revision.commit !== 'string' ||
      !revision.commit.startsWith(expectedSource.commit)
    ) {
      errors.push(
        `published STT commit must begin ${expectedSource.commit}`,
      );
    }
  }

  return errors;
}

export async function validateSite(options = {}) {
  const rootDir = options.rootDir ?? root;
  const usesDefaultContentPaths = options.contentPaths === undefined;
  const contentPaths = options.contentPaths ?? [
    'content/work/call-agent.en.mdx',
    'content/work/call-agent.zh.mdx',
    'content/build/stt-demo.en.mdx',
    'content/build/stt-demo.zh.mdx',
  ];
  const resolvedContentPaths = contentPaths.map((contentPath) =>
    path.isAbsolute(contentPath) ? contentPath : path.join(rootDir, contentPath),
  );
  const contents = await Promise.all(
    resolvedContentPaths.map((contentPath) =>
      fsPromises.readFile(contentPath, 'utf8'),
    ),
  );
  const manifestPath = path.join(
    rootDir,
    'evidence/call-agent/manifest.json',
  );
  const checksumPath = path.join(
    rootDir,
    'evidence/call-agent/checksums.json',
  );
  const manifestText = await fsPromises.readFile(manifestPath, 'utf8');
  const checksumText = await fsPromises.readFile(checksumPath, 'utf8');
  const manifest = JSON.parse(manifestText);
  const checksumContract = JSON.parse(checksumText);
  const errors = [
    ...contents.flatMap(findSensitiveText),
    ...findSensitiveText(manifestText),
  ];
  if (usesDefaultContentPaths) {
    errors.push(...await validateSttDemoPublication(rootDir));
  }

  if (!Array.isArray(manifest.assets)) {
    errors.push('manifest assets must be an array');
    manifest.assets = [];
  }
  if (!Array.isArray(manifest.excluded)) {
    errors.push('manifest excluded must be an array');
    manifest.excluded = [];
  }

  const outputs = [];
  for (const [index, entry] of manifest.assets.entries()) {
    const outputName = entry.output || `assets[${index}]`;
    errors.push(
      ...validateManifestEntry(entry).map(
        (error) => `${outputName}: ${error}`,
      ),
    );
    if (entry.output) outputs.push(entry.output);
  }
  for (const [index, entry] of manifest.excluded.entries()) {
    for (const key of ['source', 'reason']) {
      if (!entry[key]) errors.push(`excluded[${index}]: missing ${key}`);
    }
  }
  for (const output of uniqueValues(outputs)) {
    if (outputs.filter((candidate) => candidate === output).length > 1) {
      errors.push(`duplicate output ${output}`);
    }
  }

  const approvedEntries = Array.isArray(checksumContract.files)
    ? checksumContract.files
    : [];
  if (!Array.isArray(checksumContract.files)) {
    errors.push('checksum contract files must be an array');
  }
  const approvedByPath = new Map();
  for (const [index, entry] of approvedEntries.entries()) {
    if (
      !entry ||
      typeof entry.path !== 'string' ||
      !/^[a-f0-9]{64}$/.test(entry.sha256) ||
      !['image', 'pdf'].includes(entry.kind)
    ) {
      errors.push(`invalid checksum entry ${index}`);
      continue;
    }
    if (approvedByPath.has(entry.path)) {
      errors.push(`duplicate checksum path ${entry.path}`);
      continue;
    }
    approvedByPath.set(entry.path, entry);
  }

  const expectedImagePaths = outputs.map(
    (output) => `public/images/call-agent/${output}`,
  );
  const pdfPath = 'public/files/call-agent-case-study-zh.pdf';
  const expectedPublicPaths = uniqueValues([...expectedImagePaths, pdfPath]);
  for (const publicPath of expectedPublicPaths) {
    if (!approvedByPath.has(publicPath)) {
      errors.push(`missing approved checksum for ${publicPath}`);
    }
  }
  for (const approvedPath of approvedByPath.keys()) {
    if (!expectedPublicPaths.includes(approvedPath)) {
      errors.push(`unexpected approved checksum ${approvedPath}`);
    }
  }

  const imageDirectory = 'public/images/call-agent';
  let actualImagePaths = [];
  try {
    const names = await fsPromises.readdir(path.join(rootDir, imageDirectory));
    actualImagePaths = names.map((name) => `${imageDirectory}/${name}`);
  } catch {
    errors.push(`missing public directory ${imageDirectory}`);
  }
  for (const publicPath of actualImagePaths) {
    if (!expectedImagePaths.includes(publicPath)) {
      errors.push(`unexpected public file ${publicPath}`);
    }
  }

  const realRootDir = await fsPromises.realpath(rootDir);
  for (const [publicPath, approved] of approvedByPath) {
    const absolutePath = path.resolve(rootDir, publicPath);
    if (!isInside(rootDir, absolutePath)) {
      errors.push(`approved path resolves outside site root: ${publicPath}`);
      continue;
    }

    let stat;
    try {
      stat = await fsPromises.lstat(absolutePath);
    } catch (error) {
      if (error?.code === 'ENOENT') {
        errors.push(`missing public file ${publicPath}`);
      } else {
        errors.push(`unable to inspect public file ${publicPath}`);
      }
      continue;
    }

    let realPath;
    try {
      realPath = await fsPromises.realpath(absolutePath);
    } catch {
      errors.push(`unable to resolve public file ${publicPath}`);
      continue;
    }
    if (!isInside(realRootDir, realPath)) {
      errors.push(`public file resolves outside site root: ${publicPath}`);
      continue;
    }
    if (stat.isSymbolicLink() || !stat.isFile()) {
      errors.push(`not a regular file: ${publicPath}`);
      continue;
    }

    let bytes;
    try {
      bytes = await fsPromises.readFile(absolutePath);
    } catch {
      errors.push(`unable to read public file ${publicPath}`);
      continue;
    }
    if (sha256(bytes) !== approved.sha256) {
      errors.push(`checksum mismatch for ${publicPath}`);
    }
    if (approved.kind === 'image') {
      try {
        const metadata = await sharp(bytes, { failOn: 'error' }).metadata();
        if (!metadata.width || !metadata.height || !metadata.format) {
          errors.push(`invalid image metadata for ${publicPath}`);
        }
      } catch {
        errors.push(`image decode failed for ${publicPath}`);
      }
    } else if (
      approved.kind === 'pdf' &&
      !bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))
    ) {
      errors.push(`invalid PDF signature for ${publicPath}`);
    }
  }

  for (const [index, content] of contents.entries()) {
    const ids = resolvedContentPaths[index].includes('/content/build/')
      ? ['overview', 'setup', 'session', 'build-system', 'evidence-boundary']
      : ['overview', 'context-role', 'design-thesis', 'decision-path', 'decision-preview', 'decision-operate', 'system-delivery', 'outcome-learnings'];
    for (const id of ids) {
      if (!content.includes(`id="${id}"`)) {
        errors.push(`missing chapter ${id} in ${path.basename(resolvedContentPaths[index])}`);
      }
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const errors = await validateSite();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('Content validation passed');
}
