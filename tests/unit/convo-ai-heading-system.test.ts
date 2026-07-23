import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

const ruleBlock = (css: string, selectors: string | readonly string[]) => {
  const expected = typeof selectors === 'string' ? [selectors] : selectors;
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)].find(
    ([, selectorList]) => {
      const actual = selectorList
        .split(',')
        .map((selector) => selector.trim());
      return (
        actual.length === expected.length &&
        expected.every((selector) => actual.includes(selector))
      );
    },
  );

  expect(rule, `Expected CSS rule for ${expected.join(', ')}`).toBeDefined();
  return rule?.[2] ?? '';
};

describe('Convo AI semantic heading system', () => {
  it('maps chapter, narrative, and card titles to shared roles', () => {
    const css = read('components/convo-ai/convo-ai-layout.module.css');
    const sectionHeading = ruleBlock(
      css,
      '.content :global(.section-heading)',
    );
    const chapter = ruleBlock(
      css,
      '.content :global(.section-heading h2)',
    );
    const narrative = ruleBlock(
      css,
      '.content :global(.convo-subheading)',
    );
    const card = ruleBlock(
      css,
      '.content :global(.convo-principles h3)',
    );

    expect(sectionHeading).toContain('gap: var(--case-index-title-gap);');
    expect(sectionHeading).toContain(
      'margin-block-end: var(--case-title-body-gap);',
    );

    for (const declaration of [
      'max-width: var(--case-chapter-title-max);',
      'font-size: var(--case-chapter-title-size);',
      'font-weight: var(--case-chapter-title-weight);',
      'line-height: var(--case-chapter-title-leading);',
    ]) {
      expect(chapter).toContain(declaration);
    }

    for (const declaration of [
      'max-width: var(--case-narrative-title-max);',
      'margin-block-end: var(--case-title-body-gap);',
      'font-size: var(--case-narrative-title-size);',
      'font-weight: var(--case-narrative-title-weight);',
      'line-height: var(--case-narrative-title-leading);',
    ]) {
      expect(narrative).toContain(declaration);
    }

    for (const declaration of [
      'max-width: var(--case-card-title-max);',
      'margin-block-end: var(--case-title-body-gap);',
      'font-size: var(--case-card-title-size);',
      'font-weight: var(--case-card-title-weight);',
      'line-height: var(--case-card-title-leading);',
    ]) {
      expect(card).toContain(declaration);
    }
  });

  it('keeps one small index label and derives the giant numeral from data-index', () => {
    const css = read('components/convo-ai/convo-ai-layout.module.css');
    const index = ruleBlock(css, '.content :global(.section-index)');
    const displayIndex = ruleBlock(
      css,
      '.content :global(.section-index::before)',
    );
    const content = `${read('content/work/convo-ai.zh.mdx')}\n${read(
      'content/work/convo-ai.en.mdx',
    )}`;

    expect(index).toContain('font-size: 0.6875rem;');
    expect(displayIndex).toContain('content: attr(data-index);');
    expect(displayIndex).toContain('pointer-events: none;');
    expect(
      content.match(
        /className="section-index" aria-hidden="true" data-index="\d{2}"/g,
      ),
    ).toHaveLength(14);
  });

  it('maps readable stage and media titles while isolating display type', () => {
    const css = read('components/convo-ai/convo-ai-media.module.css');
    const project = ruleBlock(
      css,
      ".stage[data-hero='true'] .stageSemanticTitle",
    );
    const media = ruleBlock(
      css,
      ".stage:not([data-hero='true']) .stageSemanticTitle",
    );
    const avatar = ruleBlock(css, '.avatarFigure figcaption strong');
    const display = ruleBlock(css, '.stageDisplayTitle');
    const inlineChapter = ruleBlock(css, '.inlineHeading');

    for (const declaration of [
      'max-width: var(--case-project-title-max);',
      'font-size: var(--case-project-title-size);',
      'font-weight: var(--case-project-title-weight);',
      'line-height: var(--case-project-title-leading);',
    ]) {
      expect(project).toContain(declaration);
    }

    for (const block of [media, avatar]) {
      for (const declaration of [
        'max-width: var(--case-media-title-max);',
        'font-size: var(--case-media-title-size);',
        'font-weight: var(--case-media-title-weight);',
        'line-height: var(--case-media-title-leading);',
      ]) {
        expect(block).toContain(declaration);
      }
    }

    expect(display).toContain('position: absolute;');
    expect(display).toContain('pointer-events: none;');
    expect(inlineChapter).not.toContain('max-width:');
  });

  it('maps Convo AI print headings to fixed shared roles', () => {
    const css = read('components/convo-ai/convo-ai-print.css');
    const project = ruleBlock(
      css,
      "[data-convo-ai-stage][data-hero='true'] [data-stage-semantic-title]",
    );
    const chapter = ruleBlock(
      css,
      '[data-convo-ai-case] .section-heading h2',
    );
    const narrative = ruleBlock(
      css,
      '[data-convo-ai-case] .convo-subheading',
    );
    const media = ruleBlock(css, [
      "[data-convo-ai-stage]:not([data-hero='true']) [data-stage-semantic-title]",
      "[data-convo-ai-case] [class*='avatarFigure'] figcaption strong",
    ]);
    const card = ruleBlock(
      css,
      '[data-convo-ai-case] .convo-principles h3',
    );

    expect(project).toContain(
      'font-size: var(--case-project-title-size) !important;',
    );
    expect(chapter).toContain(
      'font-size: var(--case-chapter-title-size) !important;',
    );
    expect(narrative).toContain(
      'font-size: var(--case-narrative-title-size) !important;',
    );
    expect(media).toContain(
      'font-size: var(--case-media-title-size) !important;',
    );
    expect(card).toContain(
      'font-size: var(--case-card-title-size) !important;',
    );
    expect(css).toContain('[data-stage-display-title]');
    expect(css).toMatch(
      /\[data-stage-display-title\][^{]*\{[^}]*display:\s*none\s*!important;/s,
    );
  });
});
