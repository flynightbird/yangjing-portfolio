import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');

function isPortableFile(value) {
  return typeof value === 'string' && value.length > 0 && !path.isAbsolute(value) &&
    !value.split(/[\\/]/).includes('..');
}

export function validateVideoManifest(manifest) {
  if (manifest?.version !== 1 || !Array.isArray(manifest.clips) || manifest.clips.length !== 6) {
    throw new Error('Call Agent video manifest must define exactly six clips');
  }
  const outputs = new Set();
  for (const clip of manifest.clips) {
    if (!isPortableFile(clip.source) || !isPortableFile(clip.posterSource)) {
      throw new Error(`Unsafe clip source: ${clip.source ?? ''}`);
    }
    if (!/^[a-z0-9-]+\.mp4$/.test(clip.output) || !/^[a-z0-9-]+\.webp$/.test(clip.poster)) {
      throw new Error(`Unsafe clip output: ${clip.output ?? ''}`);
    }
    for (const output of [clip.output, clip.poster]) {
      if (outputs.has(output)) throw new Error(`Duplicate manifest output: ${output}`);
      outputs.add(output);
    }
    if (clip.duration < 2.5 || clip.duration > 8 || clip.playbackRate < 1.25 || clip.playbackRate > 1.6) {
      throw new Error(`Invalid timing for clip: ${clip.id ?? ''}`);
    }
    if (typeof clip.description !== 'string' || !clip.description.trim()) {
      throw new Error(`Missing clip description: ${clip.id ?? ''}`);
    }
  }
  if (!Array.isArray(manifest.images)) throw new Error('Manifest images must be an array');
  for (const image of manifest.images) {
    if (!isPortableFile(image.source) || !/^[a-z0-9-]+\.webp$/.test(image.output)) {
      throw new Error(`Unsafe image source or output: ${image.source ?? ''}`);
    }
    if (outputs.has(image.output)) throw new Error(`Duplicate manifest output: ${image.output}`);
    outputs.add(image.output);
  }
  return manifest;
}

async function containedFile(root, relativePath) {
  const realRoot = await fs.realpath(root);
  const candidate = path.resolve(realRoot, relativePath);
  const realCandidate = await fs.realpath(candidate);
  const relative = path.relative(realRoot, realCandidate);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Source escapes configured root: ${relativePath}`);
  }
  const stat = await fs.stat(realCandidate);
  if (!stat.isFile()) throw new Error(`Source is not a file: ${relativePath}`);
  return realCandidate;
}

async function installDirectory(outputDir, temporaryDir) {
  const backupDir = `${outputDir}.backup-${process.pid}-${Date.now()}`;
  let backedUp = false;
  try {
    await fs.rename(outputDir, backupDir);
    backedUp = true;
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  try {
    await fs.rename(temporaryDir, outputDir);
    if (backedUp) await fs.rm(backupDir, { recursive: true, force: true });
  } catch (error) {
    if (backedUp) await fs.rename(backupDir, outputDir);
    throw error;
  }
}

export async function prepareCallAgentVideos({
  sourceRoot = process.env.CALL_AGENT_VIDEO_SOURCE_ROOT,
  posterRoot = process.env.CALL_AGENT_POSTER_SOURCE_ROOT,
  manifestPath = path.join(repositoryRoot, 'evidence/call-agent/video-manifest.json'),
  videoOutputDir = path.join(repositoryRoot, 'public/videos/call-agent'),
  imageOutputDir = path.join(repositoryRoot, 'public/images/call-agent'),
  convertBinary = '/usr/bin/avconvert',
} = {}) {
  if (!sourceRoot || !posterRoot) throw new Error('Call Agent video and poster source roots are required');
  const manifest = validateVideoManifest(JSON.parse(await fs.readFile(manifestPath, 'utf8')));
  const videoParent = path.dirname(videoOutputDir);
  const imageParent = path.dirname(imageOutputDir);
  await Promise.all([fs.mkdir(videoParent, { recursive: true }), fs.mkdir(imageParent, { recursive: true })]);
  const videoTemp = await fs.mkdtemp(path.join(videoParent, '.call-agent-video-'));
  const imageTemp = await fs.mkdtemp(path.join(imageParent, '.call-agent-image-'));
  try {
    await fs.cp(imageOutputDir, imageTemp, { recursive: true, force: true }).catch((error) => {
      if (error?.code !== 'ENOENT') throw error;
    });
    for (const clip of manifest.clips) {
      const source = await containedFile(sourceRoot, clip.source);
      const poster = await containedFile(posterRoot, clip.posterSource);
      await execFileAsync(convertBinary, [
        '--source', source,
        '--preset', 'Preset1280x720',
        '--output', path.join(videoTemp, clip.output),
        '--start', String(clip.start),
        '--duration', String(clip.duration),
        '--replace',
      ]);
      await sharp(poster).webp({ quality: 88, effort: 5 }).toFile(path.join(imageTemp, clip.poster));
    }
    for (const image of manifest.images) {
      const source = await containedFile(posterRoot, image.source);
      let pipeline = sharp(source);
      if (image.extract) pipeline = pipeline.extract(image.extract);
      const redactions = image.redactions.map((rect) => ({
        input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}"><rect width="100%" height="100%" fill="${rect.color ?? '#f8fafc'}"/></svg>`),
        left: rect.left,
        top: rect.top,
      }));
      if (redactions.length) pipeline = pipeline.composite(redactions);
      await pipeline.webp({ quality: 88, effort: 5 }).toFile(path.join(imageTemp, image.output));
    }
    await installDirectory(videoOutputDir, videoTemp);
    await installDirectory(imageOutputDir, imageTemp);
  } catch (error) {
    await Promise.all([
      fs.rm(videoTemp, { recursive: true, force: true }),
      fs.rm(imageTemp, { recursive: true, force: true }),
    ]);
    throw error;
  }
  return manifest.clips.map(({ output }) => output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  prepareCallAgentVideos()
    .then((outputs) => console.log(`Prepared ${outputs.length} Call Agent videos.`))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    });
}
