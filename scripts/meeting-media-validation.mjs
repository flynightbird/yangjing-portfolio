import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function probeMeetingVideo(filePath, {
  executable = 'ffprobe',
  timeoutMs = 15_000,
  env = process.env,
} = {}) {
  try {
    const { stdout } = await execFileAsync(executable, [
      '-v', 'error',
      '-show_entries', 'stream=codec_type,codec_name,width,height,duration:format=duration',
      '-of', 'json',
      filePath,
    ], {
      env,
      timeout: timeoutMs,
      killSignal: 'SIGKILL',
      maxBuffer: 1024 * 1024,
    });
    return JSON.parse(stdout);
  } catch (error) {
    if (error?.killed && error?.signal === 'SIGKILL') {
      throw new Error(`ffprobe timed out after ${timeoutMs}ms`);
    }
    if (error?.code === 'ENOENT') {
      throw new Error('ffprobe is required to inspect ready Meeting publication video');
    }
    throw new Error(error?.stderr?.trim() || error?.message || String(error));
  }
}

export function parseWebVtt(value) {
  const normalized = value.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  if (!/^WEBVTT(?:[ \t].*)?$/.test(lines[0] ?? '')) {
    return { validHeader: false, cues: [] };
  }

  const blocks = lines.slice(1).join('\n').split(/\n{2,}/);
  const cues = [];
  for (const block of blocks) {
    const cueLines = block.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!cueLines.length || /^(?:NOTE|STYLE|REGION)(?:\s|$)/.test(cueLines[0])) continue;
    const timingIndex = cueLines.findIndex((line) => line.includes('-->'));
    if (timingIndex < 0) continue;
    const match = cueLines[timingIndex].match(
      /^(\d{2,}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2,}:\d{2}:\d{2}\.\d{3}|\d{2}:\d{2}\.\d{3})(?:\s+.*)?$/,
    );
    const text = cueLines.slice(timingIndex + 1).join('\n').trim();
    if (!match || !text) continue;
    const start = parseTimestamp(match[1]);
    const end = parseTimestamp(match[2]);
    if (start !== undefined && end !== undefined && end > start) {
      cues.push({ start, end, text });
    }
  }
  return { validHeader: true, cues };
}

function parseTimestamp(value) {
  const parts = value.split(':');
  const seconds = Number(parts.at(-1));
  const minutes = Number(parts.at(-2));
  if (
    !Number.isInteger(minutes) || minutes < 0 || minutes > 59 ||
    !Number.isFinite(seconds) || seconds < 0 || seconds >= 60
  ) return undefined;
  if (parts.length === 2) return minutes * 60 + seconds;
  const hours = Number(parts[0]);
  if (!Number.isInteger(hours) || hours < 0) return undefined;
  return hours * 3600 + minutes * 60 + seconds;
}

export async function validateMeetingPublicationMedia({
  rootDir,
  assets,
  pathForAsset = (asset) => asset.source,
  probeVideo = probeMeetingVideo,
}) {
  const errors = [];
  const readyAssets = assets.filter(({ publicationRequired, readiness }) => (
    publicationRequired === true && readiness === 'ready'
  ));

  for (const asset of readyAssets) {
    const relativePath = pathForAsset(asset);
    const filePath = path.join(rootDir, relativePath);
    try {
      const stat = await fs.lstat(filePath);
      if (!stat.isFile() || stat.isSymbolicLink()) continue;
    } catch {
      continue;
    }
    if (asset.kind === 'captions') {
      let parsed;
      try {
        parsed = parseWebVtt(await fs.readFile(filePath, 'utf8'));
      } catch {
        continue;
      }
      if (!parsed.validHeader) {
        errors.push(`Invalid VTT caption header: ${relativePath}`);
      } else if (parsed.cues.length === 0) {
        errors.push(`Meeting captions require at least one valid timed non-empty cue: ${relativePath}`);
      }
      continue;
    }
    if (asset.kind !== 'video') continue;

    let probe;
    try {
      probe = await probeVideo(filePath, asset);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/^ffprobe (?:is required|timed out)/i.test(message)) {
        errors.push(`${message}: ${relativePath}`);
      } else {
        errors.push(`Meeting video is not decodable: ${relativePath} (${message})`);
      }
      continue;
    }
    const stream = probe?.streams?.find(({ codec_type }) => codec_type === 'video') ?? probe?.streams?.[0];
    const width = Number(stream?.width);
    const height = Number(stream?.height);
    const duration = Number(probe?.format?.duration ?? stream?.duration);
    if (!stream?.codec_name || !(width > 0) || !(height > 0) || !Number.isFinite(duration)) {
      errors.push(`Meeting video is not decodable: ${relativePath} (missing video codec, dimensions, or duration)`);
      continue;
    }
    if (duration < 5 || duration > 30) {
      errors.push(`Meeting video duration must be between 5 and 30 seconds: ${relativePath} (${duration}s)`);
    }
    if (asset.orientation === 'portrait' && width >= height) {
      errors.push(`Meeting video requires portrait video (width < height): ${relativePath} (${width}x${height})`);
    }
    if (asset.orientation === 'landscape' && width <= height) {
      errors.push(`Meeting video requires landscape video (width > height): ${relativePath} (${width}x${height})`);
    }
  }
  return errors;
}
