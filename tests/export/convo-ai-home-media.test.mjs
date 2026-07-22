import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGifArgs,
  buildPngPosterArgs,
  buildPosterArgs,
  parseCliArgs,
  parseDuration,
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
