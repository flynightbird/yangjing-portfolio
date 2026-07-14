import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputPath = path.join(root, 'out');

function readOutput(relativePath) {
  return fs.readFileSync(path.join(outputPath, relativePath), 'utf8');
}

test('localized exports have server-correct document languages', () => {
  assert.match(
    readOutput('en/index.html'),
    /^<!DOCTYPE html><html lang="en">/,
  );
  assert.match(
    readOutput('zh/index.html'),
    /^<!DOCTYPE html><html lang="zh-CN">/,
  );
});

test('root resolver and custom bilingual 404 remain static artifacts', () => {
  assert.ok(fs.existsSync(path.join(outputPath, 'index.html')));

  const notFound = readOutput('404.html');
  assert.match(notFound, /^<!DOCTYPE html><html lang="en">/);
  assert.match(notFound, /<title>Page not found \| Yang Jing Portfolio<\/title>/);
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /<span lang="zh-CN">页面未找到<\/span>/);
  assert.match(notFound, /href="\/en\/"/);
  assert.match(notFound, /<a href="\/zh\/" lang="zh-CN">中文<\/a>/);
});

test('unregistered work routes are not emitted as soft-404 artifacts', () => {
  for (const locale of ['en', 'zh']) {
    for (const slug of ['bytedance', 'meeting']) {
      assert.equal(
        fs.existsSync(path.join(outputPath, locale, 'work', slug, 'index.html')),
        false,
        `${locale}/work/${slug} must not be exported`,
      );
    }
  }
});

test('the bilingual STT Build Lab routes and pinned demo are emitted', () => {
  for (const locale of ['en', 'zh']) {
    const buildPage = readOutput(`${locale}/build/stt-demo/index.html`);
    assert.match(buildPage, /STT Demo|STT Demo：/);
    assert.match(buildPage, /e5e840a/);
    assert.match(buildPage, /\/demos\/stt-demo\/index\.html/);
  }

  for (const asset of [
    'demos/stt-demo/index.html',
    'demos/stt-demo/styles.css',
    'demos/stt-demo/app.js',
    'demos/stt-demo/source-revision.json',
    'demos/stt-demo/stt-ui-component-library/packages/stt-ui/src/tokens/tokens.css',
    'demos/stt-demo/stt-ui-component-library/packages/stt-ui/src/styles/components.css',
  ]) {
    assert.ok(fs.existsSync(path.join(outputPath, asset)), `${asset} must be exported`);
  }
});

test('unknown Build Lab routes are not emitted', () => {
  for (const locale of ['en', 'zh']) {
    for (const slug of ['second-build', 'stt-demo-live', 'unknown']) {
      assert.equal(
        fs.existsSync(path.join(outputPath, locale, 'build', slug, 'index.html')),
        false,
        `${locale}/build/${slug} must not be exported`,
      );
    }
  }
});
