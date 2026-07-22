import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');
const gifOutput = 'public/images/convo-ai/home-mobile-loop.gif';
const posterOutput = 'public/images/convo-ai/home-mobile-loop-poster.webp';

export function parseDuration(value) {
  const duration = Number.parseFloat(value);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw new Error('ffprobe must return a positive duration');
  }
  return duration;
}

function midpoint(duration) {
  return (parseDuration(String(duration)) / 2).toFixed(3);
}

export function buildGifArgs({ source, duration, speed, output = gifOutput }) {
  const filter =
    `[0:v]setpts=PTS/${speed},fps=12,scale='min(540,iw)':-2:flags=lanczos,split[s0][s1];` +
    '[s0]palettegen=max_colors=160:stats_mode=diff[p];' +
    '[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle';

  return [
    '-y',
    '-ss',
    midpoint(duration),
    '-i',
    source,
    '-filter_complex',
    filter,
    '-an',
    '-loop',
    '0',
    output,
  ];
}

export function buildPosterArgs({ source, duration, output = posterOutput }) {
  return [
    '-y',
    '-ss',
    midpoint(duration),
    '-i',
    source,
    '-frames:v',
    '1',
    '-vf',
    "scale='min(540,iw)':-2:flags=lanczos",
    '-c:v',
    'libwebp',
    '-quality',
    '85',
    output,
  ];
}

export function buildPngPosterArgs({ source, duration, output }) {
  return [
    '-y',
    '-ss',
    midpoint(duration),
    '-i',
    source,
    '-frames:v',
    '1',
    '-vf',
    "scale='min(540,iw)':-2:flags=lanczos",
    '-c:v',
    'png',
    '-update',
    '1',
    output,
  ];
}

export function parseCliArgs(argv) {
  let source;
  let speed = 1.35;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--source') {
      source = argv[index + 1];
      index += 1;
    } else if (argument === '--speed') {
      speed = Number(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!source || source.startsWith('--')) {
    throw new Error('--source is required');
  }
  if (!Number.isFinite(speed) || speed <= 0) {
    throw new Error('--speed must be a positive number');
  }
  return { source, speed };
}

function run(binary, args, { captureStdout = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd: repositoryRoot,
      stdio: ['ignore', captureStdout ? 'pipe' : 'inherit', 'inherit'],
    });
    let stdout = '';
    if (captureStdout) {
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk) => {
        stdout += chunk;
      });
    }
    child.on('error', reject);
    child.on('close', (code, signal) => {
      if (code === 0) resolve(stdout);
      else {
        reject(
          new Error(
            `${binary} exited ${signal ? `after signal ${signal}` : `with code ${code}`}`,
          ),
        );
      }
    });
  });
}

export async function prepareConvoAiHomeMedia({ source, speed = 1.35 }) {
  const ffmpeg = process.env.FFMPEG_BIN || 'ffmpeg';
  const ffprobe = process.env.FFPROBE_BIN || 'ffprobe';
  await fs.mkdir(path.join(repositoryRoot, 'public/images/convo-ai'), {
    recursive: true,
  });

  const duration = parseDuration(
    await run(
      ffprobe,
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        source,
      ],
      { captureStdout: true },
    ),
  );

  await run(ffmpeg, buildGifArgs({ source, duration, speed }));
  const encoders = await run(ffmpeg, ['-hide_banner', '-encoders'], {
    captureStdout: true,
  });
  if (/\blibwebp\b/.test(encoders)) {
    await run(ffmpeg, buildPosterArgs({ source, duration }));
  } else {
    const temporaryPoster = `public/images/convo-ai/.home-mobile-loop-poster-${process.pid}.png`;
    try {
      await run(
        ffmpeg,
        buildPngPosterArgs({ source, duration, output: temporaryPoster }),
      );
      await sharp(path.join(repositoryRoot, temporaryPoster))
        .webp({ quality: 85, effort: 5 })
        .toFile(path.join(repositoryRoot, posterOutput));
    } finally {
      await fs.rm(path.join(repositoryRoot, temporaryPoster), { force: true });
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === scriptPath) {
  try {
    const options = parseCliArgs(process.argv.slice(2));
    await prepareConvoAiHomeMedia(options);
    console.log('Prepared ConvoAI homepage mobile loop and poster.');
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
