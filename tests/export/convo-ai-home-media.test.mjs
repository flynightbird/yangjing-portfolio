import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  buildGifArgs,
  buildPngPosterArgs,
  buildPosterArgs,
  parseCliArgs,
  parseDuration,
  prepareConvoAiHomeMedia,
} from '../../scripts/prepare-convo-ai-home-media.mjs';

const source = '/private/source/convo-ai.mp4';
const gifOutput = 'public/images/convo-ai/home-mobile-loop.gif';
const posterOutput = 'public/images/convo-ai/home-mobile-loop-poster.webp';

test('parseDuration accepts a positive ffprobe duration', () => {
  assert.equal(parseDuration('18.4\n'), 18.4);
});

test('parseDuration rejects zero and non-positive durations', () => {
  assert.throws(() => parseDuration('0\n'), /positive duration/);
  assert.throws(() => parseDuration('-1.2\n'), /positive duration/);
});

test('buildGifArgs preserves the latter half and creates a looping palette GIF', () => {
  const args = buildGifArgs({
    source,
    duration: 18.4,
    speed: 1.35,
    output: gifOutput,
  });

  assert.deepEqual(args.slice(0, 4), ['-y', '-ss', '9.200', '-i']);
  assert.equal(args[4], source);
  assert.ok(args.some((argument) => argument.includes('setpts=PTS/1.35')));
  assert.ok(args.some((argument) => argument.includes('palettegen')));
  assert.deepEqual(args.slice(-3), ['-loop', '0', gifOutput]);
  assert.ok(
    args.includes(
      "[0:v]setpts=PTS/1.35,fps=12,scale='min(540,iw)':-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=160:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle",
    ),
  );
});

test('buildPosterArgs captures the first frame of the latter half as WebP', () => {
  const args = buildPosterArgs({
    source,
    duration: 18.4,
    output: posterOutput,
  });

  assert.deepEqual(args.slice(0, 4), ['-y', '-ss', '9.200', '-i']);
  assert.equal(args[4], source);
  assert.equal(args.at(-1), posterOutput);
});

test('buildPngPosterArgs captures the same midpoint for WebP fallback encoding', () => {
  const pngOutput = 'public/images/convo-ai/.home-mobile-loop-poster.png';
  const args = buildPngPosterArgs({
    source,
    duration: 18.4,
    output: pngOutput,
  });

  assert.deepEqual(args.slice(0, 4), ['-y', '-ss', '9.200', '-i']);
  assert.equal(args[4], source);
  assert.deepEqual(args.slice(-3), ['-update', '1', pngOutput]);
});

test('parseCliArgs requires a source and defaults speed to 1.35', () => {
  assert.deepEqual(parseCliArgs(['--source', source]), {
    source,
    speed: 1.35,
  });
  assert.throws(() => parseCliArgs([]), /--source is required/);
});

test('parseCliArgs validates the optional speed', () => {
  assert.deepEqual(parseCliArgs(['--source', source, '--speed', '1.5']), {
    source,
    speed: 1.5,
  });
  assert.throws(
    () => parseCliArgs(['--source', source, '--speed', '0']),
    /positive number/,
  );
});

const gifBytes = Buffer.from('GIF89a-staged');
const webpBytes = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.alloc(4),
  Buffer.from('WEBP-staged'),
]);

async function withTemporaryRoot(runTest) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'convo-ai-media-test-'));
  try {
    await runTest(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

function createFakeRunner({ webpEncoder = true } = {}) {
  const calls = [];
  const runner = async (binary, args) => {
    calls.push({ binary, args });
    if (binary === 'ffprobe') return '18.4\n';
    if (args.includes('-encoders')) return webpEncoder ? ' V....D libwebp' : '';
    const output = args.at(-1);
    if (args.includes('-filter_complex')) await fs.writeFile(output, gifBytes);
    else if (args.includes('libwebp')) await fs.writeFile(output, webpBytes);
    else await fs.writeFile(output, Buffer.from('png-staged'));
    return '';
  };
  return { calls, runner };
}

test('prepareConvoAiHomeMedia publishes both generated files together', async () => {
  await withTemporaryRoot(async (root) => {
    const { runner } = createFakeRunner();

    await prepareConvoAiHomeMedia(
      { source, speed: 1.35 },
      { repositoryRoot: root, runner },
    );

    assert.deepEqual(
      await fs.readFile(path.join(root, gifOutput)),
      gifBytes,
    );
    assert.deepEqual(
      await fs.readFile(path.join(root, posterOutput)),
      webpBytes,
    );
    assert.deepEqual(
      (await fs.readdir(path.join(root, 'public/images'))).sort(),
      ['convo-ai'],
    );
  });
});

test('prepareConvoAiHomeMedia selects PNG plus Sharp when FFmpeg lacks WebP', async () => {
  await withTemporaryRoot(async (root) => {
    const { calls, runner } = createFakeRunner({ webpEncoder: false });
    let encoded = 0;
    const encodeWebp = async ({ input, output }) => {
      assert.equal((await fs.readFile(input)).toString(), 'png-staged');
      encoded += 1;
      await fs.writeFile(output, webpBytes);
    };

    await prepareConvoAiHomeMedia(
      { source },
      { repositoryRoot: root, runner, encodeWebp },
    );

    assert.equal(encoded, 1);
    assert.ok(calls.some(({ args }) => args.includes('png')));
    assert.ok(!calls.some(({ args }) => args.includes('libwebp')));
    assert.deepEqual(await fs.readFile(path.join(root, posterOutput)), webpBytes);
  });
});

test('prepareConvoAiHomeMedia gives actionable missing-binary messages', async () => {
  await withTemporaryRoot(async (root) => {
    const missing = Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' });
    await assert.rejects(
      prepareConvoAiHomeMedia(
        { source },
        { repositoryRoot: root, runner: async () => { throw missing; } },
      ),
      /ffprobe.*install FFmpeg.*FFPROBE_BIN/i,
    );

    await assert.rejects(
      prepareConvoAiHomeMedia(
        { source },
        {
          repositoryRoot: root,
          runner: async (binary) => {
            if (binary === 'ffprobe') return '18.4\n';
            throw missing;
          },
        },
      ),
      /ffmpeg.*install FFmpeg.*FFMPEG_BIN/i,
    );
  });
});

test('prepareConvoAiHomeMedia rolls back both outputs and cleans staging on publish failure', async () => {
  await withTemporaryRoot(async (root) => {
    const outputDir = path.join(root, 'public/images/convo-ai');
    const finalGif = path.join(root, gifOutput);
    const finalPoster = path.join(root, posterOutput);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(finalGif, Buffer.from('GIF89a-old'));
    await fs.writeFile(
      finalPoster,
      Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP-old')]),
    );
    const { runner } = createFakeRunner();
    const failingFs = new Proxy(fs, {
      get(target, property) {
        if (property !== 'rename') return target[property];
        return async (from, to) => {
          if (to === finalPoster && from.includes('.convo-ai-home-')) {
            throw Object.assign(new Error('simulated publish failure'), { code: 'EIO' });
          }
          return target.rename(from, to);
        };
      },
    });

    await assert.rejects(
      prepareConvoAiHomeMedia(
        { source },
        { repositoryRoot: root, runner, fileSystem: failingFs },
      ),
      /simulated publish failure/,
    );

    assert.equal((await fs.readFile(finalGif)).toString(), 'GIF89a-old');
    assert.ok((await fs.readFile(finalPoster)).includes(Buffer.from('WEBP-old')));
    assert.deepEqual(
      (await fs.readdir(path.join(root, 'public/images'))).sort(),
      ['convo-ai'],
    );
  });
});

test('prepareConvoAiHomeMedia preserves both outputs after a partial GIF failure', async () => {
  await withTemporaryRoot(async (root) => {
    const outputDir = path.join(root, 'public/images/convo-ai');
    const finalGif = path.join(root, gifOutput);
    const finalPoster = path.join(root, posterOutput);
    const oldGif = Buffer.from('GIF89a-old');
    const oldPoster = Buffer.concat([
      Buffer.from('RIFF'),
      Buffer.alloc(4),
      Buffer.from('WEBP-old'),
    ]);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(finalGif, oldGif);
    await fs.writeFile(finalPoster, oldPoster);
    const runner = async (binary, args) => {
      if (binary === 'ffprobe') return '18.4\n';
      if (args.includes('-filter_complex')) {
        await fs.writeFile(args.at(-1), Buffer.from('GIF8-partial'));
        throw new Error('simulated GIF failure');
      }
      return '';
    };

    await assert.rejects(
      prepareConvoAiHomeMedia(
        { source },
        { repositoryRoot: root, runner },
      ),
      /simulated GIF failure/,
    );

    assert.deepEqual(await fs.readFile(finalGif), oldGif);
    assert.deepEqual(await fs.readFile(finalPoster), oldPoster);
    assert.deepEqual(
      (await fs.readdir(path.join(root, 'public/images'))).sort(),
      ['convo-ai'],
    );
  });
});
