import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readCss = (file: string) => readFileSync(path.join(root, file), 'utf8');
const layoutCss = readCss('components/xuelang/xuelang-layout.module.css');
const evidenceCss = readCss('components/xuelang/xuelang-evidence.module.css');
const wipeCss = readCss('components/xuelang/xuelang-wipe-comparison.module.css');
const courseCss = readCss('components/xuelang/xuelang-course-entry.module.css');
const interactionCss = readCss('components/xuelang/xuelang-interaction-board.module.css');
const interactionDesktopCss = interactionCss.split('@media')[0];

describe('Xuelang media styling', () => {
  it('defines one 20px media radius while leaving the opening cover square', () => {
    expect(layoutCss).toMatch(/--xuelang-media-radius:\s*20px/);
    expect(layoutCss).toMatch(/\.panorama\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s);
    expect(layoutCss).not.toMatch(/\.cover\s*{[^}]*border-radius/s);
  });

  it.each([
    ['wipe comparison', wipeCss, 'viewport'],
    ['course entry', courseCss, 'interactive'],
    ['interaction board', interactionCss, 'canvas'],
  ])('clips the %s interactive media at the shared radius', (_name, css, selector) => {
    expect(css).toMatch(
      new RegExp(
        `\\.${selector}\\s*\\{[^}]*overflow:\\s*hidden;[^}]*border-radius:\\s*var\\(--xuelang-media-radius\\)`,
        's',
      ),
    );
  });

  it('rounds evidence media and uses a light-green interaction canvas', () => {
    expect(evidenceCss).toMatch(
      /\.figure\s+:global\(button\)\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s,
    );
    expect(evidenceCss).toMatch(
      /\.storyMedia\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s,
    );
    expect(interactionCss).toMatch(
      /\.canvas\s*{[^}]*background:\s*linear-gradient\(145deg,\s*#eef7f0\s*0%,\s*#dfeee3\s*100%\)/s,
    );
  });

  it('renders the interaction canvas without an outer border or shadow', () => {
    expect(interactionDesktopCss).toMatch(/\.canvas\s*{[^}]*border:\s*0/s);
    expect(interactionDesktopCss).toMatch(/\.canvas\s*{[^}]*box-shadow:\s*none/s);
  });

  it('centers the result phone at 70 percent without an outer media border', () => {
    expect(evidenceCss).toMatch(
      /\.story-result \.storyPrimary\s*{[^}]*width:\s*70%;[^}]*margin-inline:\s*auto/s,
    );
    expect(evidenceCss).toMatch(
      /\.story-result \.storyPrimary\s+:global\(button\)\s*{[^}]*border:\s*0/s,
    );
  });
});
