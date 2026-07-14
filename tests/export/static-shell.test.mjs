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
