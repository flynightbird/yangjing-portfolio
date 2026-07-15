import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolvePdfToText() {
  try {
    return execFileSync('which', ['pdftotext'], { encoding: 'utf8' }).trim();
  } catch {
    const bundled = path.join(
      homedir(),
      '.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/poppler/bin/pdftotext',
    );
    if (existsSync(bundled)) return bundled;
    throw new Error('pdftotext is required to verify Xuelang PDF text');
  }
}

test('localized Xuelang routes link verified A4 case-study PDFs', () => {
  const pdftotext = resolvePdfToText();
  const expectations = {
    zh: ['学浪商业化体验升级', '11.75%', '14 天累计相对值'],
    en: ['Xuelang Commercial Experience Upgrade', '11.75%', '14-day experiment period'],
  };

  for (const locale of ['zh', 'en']) {
    const name = `xuelang-case-study-${locale}.pdf`;
    const pdfPath = path.join(root, 'public/files', name);
    const html = readFileSync(
      path.join(root, 'out', locale, 'work/xuelang/index.html'),
      'utf8',
    );

    assert.match(html, new RegExp(`/files/${name}`));
    assert.match(readFileSync(pdfPath).subarray(0, 5).toString(), /^%PDF-/);
    assert.ok(statSync(pdfPath).size > 500_000, `${locale} PDF must exceed 500 KB`);

    const info = execFileSync('pdfinfo', [pdfPath], { encoding: 'utf8' });
    const pages = Number(info.match(/^Pages:\s+(\d+)/m)?.[1]);
    assert.ok(pages >= 12 && pages <= 16, `${locale} PDF has ${pages} pages`);
    const size = info.match(/^Page size:\s+([\d.]+) x ([\d.]+) pts \(A4\)$/m);
    assert.ok(size, `${locale} PDF must report A4 page size`);
    assert.ok(Math.abs(Number(size[1]) - 595) < 1);
    assert.ok(Math.abs(Number(size[2]) - 842) < 1);

    const text = execFileSync(pdftotext, ['-layout', pdfPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    for (const expected of expectations[locale]) {
      assert.ok(text.includes(expected), `${locale} PDF must contain ${expected}`);
    }
  }
});
