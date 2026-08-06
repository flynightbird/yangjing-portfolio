import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const stylesheetPath = path.join(
  process.cwd(),
  'components/growth-base/growth-base.module.css',
);
const layoutStylesheetPath = path.join(
  process.cwd(),
  'components/growth-base/growth-base-layout.module.css',
);

describe('Growth Base showcase CSS contract', () => {
  it('uses a fixed desktop prototype canvas and removes scaling on mobile', async () => {
    const css = await readFile(stylesheetPath, 'utf8');

    expect(css).toMatch(/--prototype-width:\s*390px/);
    expect(css).toMatch(/--prototype-height:\s*844px/);
    expect(css).toMatch(/transform:\s*scale\(var\(--prototype-scale\)\)/);
    expect(css).toMatch(/@media \(max-width:\s*767px\)[\s\S]*transform:\s*none/);
    expect(css).toMatch(/\.beforePhone[\s\S]*opacity:\s*0\.72/);
  });

  it('uses two paired editorial film shells', async () => {
    const css = await readFile(stylesheetPath, 'utf8');

    expect(css).toMatch(/\.filmShell\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,/);
    expect(css).toMatch(/\.filmShell\s*\{[\s\S]*background:\s*#f7f4ed/);
  });

  it('keeps the ready tent opaque and enlarges only the meal-prep watermark mask', async () => {
    const css = await readFile(stylesheetPath, 'utf8');

    expect(css).toMatch(/\.tentAsset\s*\{[^}]*opacity:\s*1/);
    expect(css).toMatch(/\.watermarkMask\s*\{[^}]*height:\s*2\.2rem/);
    expect(css).toMatch(
      /\.film\[data-film-id='meal-prep'\]\s+\.watermarkMask\s*\{[^}]*height:\s*3\.2rem/,
    );
  });

  it('keeps all portfolio storytelling desktop-only', async () => {
    const [css, layoutCss] = await Promise.all([
      readFile(stylesheetPath, 'utf8'),
      readFile(layoutStylesheetPath, 'utf8'),
    ]);

    expect(css).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.desktopDecision[\s\S]*display:\s*none/,
    );
    expect(layoutCss).toMatch(
      /@media \(max-width:\s*767px\)[\s\S]*\.hero[\s\S]*display:\s*none/,
    );
  });

  it('aligns the hero and section copy to the same desktop content width', async () => {
    const [css, layoutCss] = await Promise.all([
      readFile(stylesheetPath, 'utf8'),
      readFile(layoutStylesheetPath, 'utf8'),
    ]);

    expect(layoutCss).toMatch(
      /\.hero\s*\{[\s\S]*?width:\s*min\(calc\(100% - 3rem\),\s*78rem\)/,
    );
    expect(css).toMatch(
      /\.sectionHeader\s*\{[\s\S]*?width:\s*min\(calc\(100% - 3rem\),\s*78rem\)/,
    );
  });
});
