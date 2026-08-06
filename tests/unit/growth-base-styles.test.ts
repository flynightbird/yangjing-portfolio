import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const stylesheetPath = path.join(
  process.cwd(),
  'components/growth-base/growth-base.module.css',
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

  it('centers the final two films in a six-column desktop grid', async () => {
    const css = await readFile(stylesheetPath, 'utf8');

    expect(css).toMatch(
      /grid-template-columns:\s*repeat\(6,\s*minmax\(0,\s*1fr\)\)/,
    );
    expect(css).toMatch(
      /\.film:nth-child\(4\)[\s\S]*grid-column:\s*2\s*\/\s*span\s*2/,
    );
    expect(css).toMatch(
      /\.film:nth-child\(5\)[\s\S]*grid-column:\s*4\s*\/\s*span\s*2/,
    );
  });
});
