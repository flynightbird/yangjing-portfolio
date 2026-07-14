import fsPromises from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

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

export async function validateSite(options = {}) {
  const rootDir = options.rootDir ?? root;
  const contentPaths = options.contentPaths ?? [
    'content/work/call-agent.en.mdx',
    'content/work/call-agent.zh.mdx',
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

  const actualPublicPaths = [];
  for (const [relativeDirectory, prefix] of [
    ['public/images/call-agent', 'public/images/call-agent'],
    ['public/files', 'public/files'],
  ]) {
    const directory = path.join(rootDir, relativeDirectory);
    let names = [];
    try {
      names = await fsPromises.readdir(directory);
    } catch {
      errors.push(`missing public directory ${relativeDirectory}`);
    }
    actualPublicPaths.push(...names.map((name) => `${prefix}/${name}`));
  }
  for (const publicPath of expectedPublicPaths) {
    if (!actualPublicPaths.includes(publicPath)) {
      errors.push(`missing public file ${publicPath}`);
    }
  }
  for (const publicPath of actualPublicPaths) {
    if (!expectedPublicPaths.includes(publicPath)) {
      errors.push(`unexpected public file ${publicPath}`);
    }
  }

  for (const [publicPath, approved] of approvedByPath) {
    const absolutePath = path.join(rootDir, publicPath);
    let bytes;
    try {
      bytes = await fsPromises.readFile(absolutePath);
    } catch {
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
    }
  }

  const ids = ['overview', 'context-role', 'design-thesis', 'decision-path', 'decision-preview', 'decision-operate', 'system-delivery', 'outcome-learnings'];
  for (const [index, content] of contents.entries()) {
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
