import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('portfolio detail visual system', () => {
  it('keeps chapter navigation neutral and line-free on desktop', () => {
    const css = read('components/case-study/chapter-nav.module.css');

    expect(css).toMatch(/--chapter-accent:\s*var\(--color-iris-luminous\)/);
    expect(css).toMatch(
      /\.root\[data-surface='light'\]\s*\{[^}]*--chapter-accent:\s*var\(--color-iris-deep\)/s,
    );
    expect(css).toMatch(/\.navigation\s*\{[^}]*border:\s*0/s);
    expect(css).toMatch(/\.navigation a\s*\{[^}]*border:\s*0/s);
    expect(css).toMatch(/\.navigation a\s*\{[^}]*opacity:\s*0\.48/s);
    expect(css).toMatch(
      /a\[aria-current='location'\]\s*\{[^}]*font-weight:\s*600/s,
    );
    expect(css).not.toMatch(/box-shadow:\s*inset\s+2px/);
    expect(css).not.toMatch(/color:\s*var\(--color-cobalt\)/);
  });

  it('defines the approved editorial heading hierarchy', () => {
    const css = read('app/globals.css');

    expect(css).toMatch(
      /--case-h1-size:\s*clamp\(3\.25rem,\s*5vw,\s*5\.5rem\)/,
    );
    expect(css).toMatch(/--case-h1-weight:\s*600/);
    expect(css).toMatch(/--case-h1-leading:\s*1\.06/);
    expect(css).toMatch(
      /--case-h2-size:\s*clamp\(2\.2rem,\s*4vw,\s*4\.5rem\)/,
    );
    expect(css).toMatch(/--case-h2-weight:\s*600/);
    expect(css).toMatch(/--case-h2-leading:\s*1\.16/);
    expect(css).toMatch(
      /--case-h3-size:\s*clamp\(1\.25rem,\s*2vw,\s*1\.75rem\)/,
    );
    expect(css).toMatch(/--case-h3-weight:\s*600/);
    expect(css).toMatch(/--case-h3-leading:\s*1\.28/);
  });

  it('keeps the base detail layout readable on dark surfaces', () => {
    const css = read('components/case-study/case-layout.module.css');

    expect(css).toMatch(
      /--case-portfolio-accent:\s*var\(--color-iris-luminous\)/,
    );
    expect(css).toMatch(
      /\.case :global\(\.lead\)\s*\{[^}]*color:\s*var\(--theme-dark-ink\)/s,
    );
    expect(css).toMatch(
      /@media \(max-width:\s*900px\)[\s\S]*?\.rail\s*\{[^}]*padding-block-start:\s*var\(--header-height\)/,
    );
  });

  it('clips Call Agent media cleanly and spaces paired evidence by 32px', () => {
    const browserCss = read('components/call-agent/call-agent-browser-video.module.css');
    const layoutCss = read('components/call-agent/call-agent-layout.module.css');

    expect(browserCss).toMatch(/\.browser\s*\{[^}]*border-radius:\s*20px/);
    expect(browserCss).toMatch(/\.viewport\s*\{[^}]*overflow:\s*hidden/);
    expect(layoutCss).toMatch(
      /:global\(\.call-dark-band\)\s*\{[^}]*border-radius:\s*20px/,
    );
    expect(layoutCss).toMatch(
      /:global\(\[data-call-agent-browser\]\)\s*\+\s*:global\(\[data-call-agent-browser\]\)\s*\{[^}]*margin-top:\s*32px/,
    );
  });

  it.each([
    'components/case-study/case-layout.module.css',
    'components/call-agent/call-agent-layout.module.css',
    'components/meeting/meeting-layout.module.css',
    'components/xuelang/xuelang-layout.module.css',
  ])('%s consumes shared editorial heading tokens', (path) => {
    const css = read(path);

    expect(css).toContain('var(--case-h1-size)');
    expect(css).toContain('var(--case-h2-size)');
    expect(css).toContain('var(--case-h3-size)');
    expect(css).toContain('var(--case-h1-leading)');
    expect(css).toContain('var(--case-h2-leading)');
    expect(css).toContain('var(--case-h3-leading)');
  });

  it.each([
    'components/case-study/case-layout.module.css',
    'components/case-study/evidence-figure.module.css',
    'components/call-agent/call-agent-layout.module.css',
    'components/call-agent/call-agent-system-stage.module.css',
    'components/meeting/meeting-layout.module.css',
    'components/meeting/meeting-evidence.module.css',
    'components/meeting/meeting-models.module.css',
    'components/xuelang/xuelang-layout.module.css',
  ])('%s has no legacy portfolio UI accent', (path) => {
    const css = read(path);

    expect(css).not.toMatch(
      /color-cobalt|call-blue|meeting-accent|xuelang-green/,
    );
  });
});
