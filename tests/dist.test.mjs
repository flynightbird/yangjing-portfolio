import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('build uses portable relative asset paths', () => {
  const html = fs.readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(html, /\/yangjing-portfolio\/(?:assets|images)\//);
  assert.match(html, /\.\/assets\//);
  assert.ok(fs.existsSync(new URL('../dist/images/ai-preview-live.png', import.meta.url)));
});
