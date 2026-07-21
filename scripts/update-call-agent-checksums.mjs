import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(scriptPath), '..');

export async function updateCallAgentChecksums() {
  const imageManifest = JSON.parse(await fs.readFile(path.join(root, 'evidence/call-agent/manifest.json'), 'utf8'));
  const videoManifest = JSON.parse(await fs.readFile(path.join(root, 'evidence/call-agent/video-manifest.json'), 'utf8'));
  const records = [
    ...imageManifest.assets.map(({ output }) => ({ path: `public/images/call-agent/${output}`, kind: 'image' })),
    ...videoManifest.clips.map(({ output }) => ({ path: `public/videos/call-agent/${output}`, kind: 'video' })),
  ].sort((a, b) => a.path.localeCompare(b.path));
  const files = [];
  for (const record of records) {
    const absolutePath = path.join(root, record.path);
    const stat = await fs.lstat(absolutePath);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Not a regular approved file: ${record.path}`);
    const bytes = await fs.readFile(absolutePath);
    files.push({ ...record, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const target = path.join(root, 'evidence/call-agent/checksums.json');
  const temporary = `${target}.tmp-${process.pid}`;
  await fs.writeFile(temporary, `${JSON.stringify({ version: 1, files }, null, 2)}\n`);
  await fs.rename(temporary, target);
  return files;
}

if (path.resolve(process.argv[1] ?? '') === scriptPath) {
  const files = await updateCallAgentChecksums();
  console.log(`Updated ${files.length} Call Agent checksums.`);
}
