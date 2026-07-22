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
    /^<!DOCTYPE html><html lang="en" data-scroll-behavior="smooth">/,
  );
  assert.match(
    readOutput('zh/index.html'),
    /^<!DOCTYPE html><html lang="zh-CN" data-scroll-behavior="smooth">/,
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

test('approved draft work routes are emitted for local framework review', () => {
  for (const locale of ['en', 'zh']) {
    const routePath = path.join(outputPath, locale, 'work', 'meeting', 'index.html');
    assert.equal(fs.existsSync(routePath), true, `${locale}/work/meeting must be exported`);
    assert.match(readOutput(`${locale}/work/meeting/index.html`), /data-publication-state="draft"/);

    const xuelang = readOutput(`${locale}/work/xuelang/index.html`);
    assert.doesNotMatch(xuelang, /data-publication-state="draft"/);
    assert.match(xuelang, /Xuelang|学浪/);
    assert.doesNotMatch(xuelang, new RegExp(`/files/xuelang-case-study-${locale}\\.pdf`));
  }
});

test('bilingual About framework routes are emitted without fake contacts', () => {
  for (const locale of ['en', 'zh']) {
    const about = readOutput(`${locale}/about/index.html`);
    const main = about.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? '';
    assert.match(about, /data-publication-state="draft"/);
    assert.doesNotMatch(main, /mailto:|linkedin\.com|wechat-qr|\.pdf/);
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
