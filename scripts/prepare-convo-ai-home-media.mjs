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

function run(binary, args, { captureStdout = false, cwd = repositoryRoot } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, {
      cwd,
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

async function runBinary(runner, binary, args, options, environmentVariable) {
  try {
    return await runner(binary, args, options);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    const tool = environmentVariable === 'FFPROBE_BIN' ? 'ffprobe' : 'ffmpeg';
    throw new Error(
      `Unable to find ${tool} binary "${binary}". Install FFmpeg or set ${environmentVariable} to its executable path.`,
      { cause: error },
    );
  }
}

async function validateMediaFile(fileSystem, file, format) {
  const stat = await fileSystem.stat(file);
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`Generated ${format} is empty: ${file}`);
  }
  const header = await fileSystem.readFile(file);
  const valid =
    format === 'GIF'
      ? header.subarray(0, 4).toString() === 'GIF8'
      : header.subarray(0, 4).toString() === 'RIFF' &&
        header.subarray(8, 12).toString() === 'WEBP';
  if (!valid) throw new Error(`Generated file is not a valid ${format}: ${file}`);
}

async function copyIfPresent(fileSystem, source, destination) {
  try {
    await fileSystem.copyFile(source, destination);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function publishPair({
  fileSystem,
  stagingDir,
  stagedGif,
  stagedPoster,
  finalGif,
  finalPoster,
}) {
  await fileSystem.mkdir(path.dirname(finalGif), { recursive: true });
  const backupGif = path.join(stagingDir, '.previous.gif');
  const backupPoster = path.join(stagingDir, '.previous.webp');
  const hadGif = await copyIfPresent(fileSystem, finalGif, backupGif);
  const hadPoster = await copyIfPresent(fileSystem, finalPoster, backupPoster);

  try {
    await fileSystem.rename(stagedGif, finalGif);
    await fileSystem.rename(stagedPoster, finalPoster);
  } catch (publishError) {
    const rollbackErrors = [];
    for (const [hadPrevious, backup, final] of [
      [hadGif, backupGif, finalGif],
      [hadPoster, backupPoster, finalPoster],
    ]) {
      try {
        if (hadPrevious) await fileSystem.copyFile(backup, final);
        else await fileSystem.rm(final, { force: true });
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError(
        [publishError, ...rollbackErrors],
        'Media publish failed and rollback was incomplete.',
      );
    }
    throw publishError;
  }
}

export async function prepareConvoAiHomeMedia(
  { source, speed = 1.35 },
  dependencies = {},
) {
  const root = dependencies.repositoryRoot ?? repositoryRoot;
  const fileSystem = dependencies.fileSystem ?? fs;
  const environment = dependencies.environment ?? process.env;
  const runner = dependencies.runner ?? run;
  const encodeWebp =
    dependencies.encodeWebp ??
    (async ({ input, output }) => {
      await sharp(input).webp({ quality: 85, effort: 5 }).toFile(output);
    });
  const ffmpeg = environment.FFMPEG_BIN || 'ffmpeg';
  const ffprobe = environment.FFPROBE_BIN || 'ffprobe';
  const outputParent = path.join(root, 'public/images');
  const finalGif = path.join(root, gifOutput);
  const finalPoster = path.join(root, posterOutput);
  await fileSystem.mkdir(outputParent, { recursive: true });
  const stagingDir = await fileSystem.mkdtemp(
    path.join(outputParent, '.convo-ai-home-'),
  );
  const stagedGif = path.join(stagingDir, path.basename(gifOutput));
  const stagedPoster = path.join(stagingDir, path.basename(posterOutput));
  const temporaryPoster = path.join(stagingDir, 'poster-source.png');

  try {
    const duration = parseDuration(
      await runBinary(
        runner,
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
        { captureStdout: true, cwd: root },
        'FFPROBE_BIN',
      ),
    );

    await runBinary(
      runner,
      ffmpeg,
      buildGifArgs({ source, duration, speed, output: stagedGif }),
      { cwd: root },
      'FFMPEG_BIN',
    );
    const encoders = await runBinary(
      runner,
      ffmpeg,
      ['-hide_banner', '-encoders'],
      { captureStdout: true, cwd: root },
      'FFMPEG_BIN',
    );
    if (/\blibwebp\b/.test(encoders)) {
      await runBinary(
        runner,
        ffmpeg,
        buildPosterArgs({ source, duration, output: stagedPoster }),
        { cwd: root },
        'FFMPEG_BIN',
      );
    } else {
      await runBinary(
        runner,
        ffmpeg,
        buildPngPosterArgs({ source, duration, output: temporaryPoster }),
        { cwd: root },
        'FFMPEG_BIN',
      );
      await encodeWebp({ input: temporaryPoster, output: stagedPoster });
    }

    await validateMediaFile(fileSystem, stagedGif, 'GIF');
    await validateMediaFile(fileSystem, stagedPoster, 'WebP');
    await publishPair({
      fileSystem,
      stagingDir,
      stagedGif,
      stagedPoster,
      finalGif,
      finalPoster,
    });
  } finally {
    await fileSystem.rm(stagingDir, { recursive: true, force: true });
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
