import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const globalsPath = path.resolve(process.cwd(), 'app/globals.css');
const globalsCss = readFileSync(globalsPath, 'utf8');
const actionLinkPath = path.resolve(
  process.cwd(),
  'components/ui/action-link.module.css',
);
const actionLinkCss = readFileSync(actionLinkPath, 'utf8');

describe('Interface X-Ray design tokens', () => {
  it.each([
    ['paper', '#F3F5F2'],
    ['carbon', '#10110F'],
    ['signal', '#B7FF3C'],
    ['cobalt', '#194BFF'],
    ['coral', '#FF654D'],
  ])('defines the exact %s color', (name, value) => {
    expect(globalsCss).toMatch(
      new RegExp(`--color-${name}:\\s*${value}`, 'i'),
    );
  });

  it('caps shared geometry at a six pixel radius', () => {
    expect(globalsCss).toMatch(/--radius-max:\s*6px/i);
  });

  it('sets global letter spacing to zero', () => {
    expect(globalsCss).toMatch(/letter-spacing:\s*0(?:;|\s*})/i);
    expect(globalsCss).not.toMatch(/letter-spacing:\s*-/i);
  });

  it.each(['480px', '768px', '1200px'])(
    'defines an explicit type step at %s',
    (width) => {
      expect(globalsCss).toMatch(
        new RegExp(`@media\\s*\\([^)]*min-width:\\s*${width}[^)]*\\)`, 'i'),
      );
    },
  );

  it('does not size type from viewport width', () => {
    expect(globalsCss).not.toMatch(/font-size\s*:[^;}]*\d(?:\.\d+)?vw\b/i);
  });

  it('lets localized action links inherit the document font', () => {
    expect(actionLinkCss).toMatch(
      /\.root\s*{[^}]*font-family:\s*inherit;/i,
    );
    expect(actionLinkCss).not.toMatch(/font-family:\s*var\(--font-body\)/i);
  });

  it('ships the approved Xuelang typography locally', () => {
    for (const [file, weight] of [
      ['misans-regular.woff2', '400'],
      ['misans-semibold.woff2', '600'],
      ['misans-bold.woff2', '700'],
    ] as const) {
      expect(globalsCss).toContain(`/fonts/${file}`);
      expect(globalsCss).toMatch(
        new RegExp(`font-weight:\\s*${weight}`),
      );
      expect(
        statSync(path.resolve(process.cwd(), 'public/fonts', file)).size,
      ).toBeGreaterThan(1024);
    }

    expect(globalsCss).toContain("--xuelang-font-body: 'MiSans'");
    expect(globalsCss).toContain("--xuelang-font-mono: 'Geist Mono'");
  });
});
