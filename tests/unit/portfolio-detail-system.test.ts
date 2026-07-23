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

  it('defines the semantic case-study heading token contract', () => {
    const css = read('app/globals.css');

    const roles = [
      ['project', 'clamp(2.5rem, 4.03vw, 3.625rem)', '1.06', '18ch'],
      ['chapter', 'clamp(2.125rem, 3.47vw, 3.125rem)', '1.12', '20ch'],
      ['narrative', 'clamp(1.75rem, 2.5vw, 2.25rem)', '1.18', '22ch'],
      ['media', 'clamp(1.375rem, 2.01vw, 1.8125rem)', '1.16', '18ch'],
      ['card', 'clamp(1.125rem, 1.53vw, 1.375rem)', '1.35', '28ch'],
    ] as const;

    for (const [role, size, leading, max] of roles) {
      expect(css).toContain(`--case-${role}-title-size: ${size};`);
      expect(css).toContain(`--case-${role}-title-weight: 600;`);
      expect(css).toContain(`--case-${role}-title-leading: ${leading};`);
      expect(css).toContain(`--case-${role}-title-max: ${max};`);
    }

    expect(css).toContain('--case-index-title-gap: 0.75rem;');
    expect(css).toContain('--case-title-body-gap: 1.5rem;');

    const compatibilityAliases = [
      ['h1', 'project'],
      ['h2', 'chapter'],
      ['h3', 'card'],
    ] as const;

    for (const [legacyLevel, role] of compatibilityAliases) {
      for (const property of ['size', 'weight', 'leading']) {
        expect(css).toContain(
          `--case-${legacyLevel}-${property}: var(--case-${role}-title-${property});`,
        );
      }
    }

    expect(css).toMatch(
      /@media print\s*\{\s*:root\s*\{[^}]*--case-project-title-size:\s*31pt;[^}]*--case-chapter-title-size:\s*24pt;[^}]*--case-narrative-title-size:\s*18pt;[^}]*--case-media-title-size:\s*14pt;[^}]*--case-card-title-size:\s*11pt;[^}]*\}\s*\}/s,
    );
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

  it.each([
    'components/case-study/case-layout.module.css',
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
