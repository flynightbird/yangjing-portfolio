import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

const ruleBlock = (css: string, selectors: string | readonly string[]) => {
  const expectedSelectors =
    typeof selectors === 'string' ? [selectors] : selectors;
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)].find(
    ([, selectorList]) => {
      const actualSelectors = selectorList
        .split(',')
        .map((selector) => selector.trim());

      return (
        actualSelectors.length === expectedSelectors.length &&
        expectedSelectors.every((selector) =>
          actualSelectors.includes(selector),
        )
      );
    },
  );

  expect(
    rule,
    `Expected CSS rule for ${expectedSelectors.join(', ')}`,
  ).toBeDefined();

  return rule?.[2] ?? '';
};

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

  it('maps shared case-study headings to their semantic roles', () => {
    const css = read('components/case-study/case-layout.module.css');
    const printCss = read('components/case-study/print.css');
    const heroTitle = ruleBlock(css, '.hero h1');
    const sectionHeading = ruleBlock(css, '.case :global(.section-heading)');
    const chapterTitle = ruleBlock(
      css,
      '.case :global(.section-heading h2)',
    );
    const narrativeTitle = ruleBlock(
      css,
      '.case :global(.reflection-grid h3)',
    );
    const cardTitles = ruleBlock(css, [
      '.case :global(.principles h3)',
      '.case :global(.evidence-levels h3)',
      '.case :global(.boundary-map h3)',
      '.case :global(.feedback-loop h3)',
    ]);
    const printProjectTitle = ruleBlock(
      printCss,
      'article[data-case-study] h1',
    );
    const printChapterTitle = ruleBlock(
      printCss,
      'article[data-case-study] h2',
    );

    expect(heroTitle).toContain(
      'max-width: var(--case-project-title-max);',
    );
    expect(heroTitle).toContain(
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
    );
    expect(heroTitle).toContain('font-size: var(--case-project-title-size);');
    expect(heroTitle).toContain(
      'font-weight: var(--case-project-title-weight);',
    );
    expect(heroTitle).toContain(
      'line-height: var(--case-project-title-leading);',
    );

    expect(sectionHeading).toContain('gap: var(--case-index-title-gap);');
    expect(sectionHeading).toContain(
      'margin-block-end: var(--case-title-body-gap);',
    );

    expect(chapterTitle).toContain(
      'max-width: var(--case-chapter-title-max);',
    );
    expect(chapterTitle).toContain(
      'font-size: var(--case-chapter-title-size);',
    );
    expect(chapterTitle).toContain(
      'font-weight: var(--case-chapter-title-weight);',
    );
    expect(chapterTitle).toContain(
      'line-height: var(--case-chapter-title-leading);',
    );

    for (const declaration of [
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
      'max-width: var(--case-narrative-title-max);',
      'font-size: var(--case-narrative-title-size);',
      'font-weight: var(--case-narrative-title-weight);',
      'line-height: var(--case-narrative-title-leading);',
    ]) {
      expect(narrativeTitle).toContain(declaration);
    }

    for (const declaration of [
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
      'max-width: var(--case-card-title-max);',
      'font-size: var(--case-card-title-size);',
      'font-weight: var(--case-card-title-weight);',
      'line-height: var(--case-card-title-leading);',
    ]) {
      expect(cardTitles).toContain(declaration);
    }

    expect(printProjectTitle).toContain(
      'font-size: var(--case-project-title-size);',
    );
    expect(printProjectTitle).toContain(
      'line-height: var(--case-project-title-leading);',
    );
    expect(printChapterTitle).toContain(
      'font-size: var(--case-chapter-title-size) !important;',
    );
    expect(printChapterTitle).toContain(
      'line-height: var(--case-chapter-title-leading) !important;',
    );
  });

  it('maps Meeting headings to the shared semantic roles', () => {
    const layoutCss = read('components/meeting/meeting-layout.module.css');
    const evidenceCss = read('components/meeting/meeting-evidence.module.css');
    const modelsCss = read('components/meeting/meeting-models.module.css');
    const heroTitle = ruleBlock(layoutCss, '.hero h1');
    const eyebrow = ruleBlock(layoutCss, '.eyebrow');
    const proposition = ruleBlock(layoutCss, '.proposition');
    const sectionHeading = ruleBlock(
      layoutCss,
      '.content :global(.section-heading)',
    );
    const sectionHeadingTitle = ruleBlock(
      layoutCss,
      '.content :global(.section-heading h2)',
    );
    const chapterTitle = ruleBlock(layoutCss, '.content h2');
    const cardTitle = ruleBlock(layoutCss, '.content :where(h3)');
    const decisionTitle = ruleBlock(evidenceCss, '.decisionHeader h3');
    const capabilityTitle = ruleBlock(modelsCss, '.capabilities h3');
    const languageTitle = ruleBlock(modelsCss, '.language > figcaption');

    expect(layoutCss).toContain(
      '--meeting-portfolio-accent: var(--color-iris-luminous);',
    );
    expect(layoutCss).not.toMatch(/(?:^|})\s*\.content h3\s*\{/);

    expect(heroTitle).toContain('max-width: var(--case-project-title-max);');
    expect(heroTitle).toContain('font-size: var(--case-project-title-size);');
    expect(heroTitle).toContain(
      'font-weight: var(--case-project-title-weight);',
    );
    expect(heroTitle).toContain(
      'line-height: var(--case-project-title-leading);',
    );

    expect(eyebrow).toContain(
      'margin-block-end: var(--case-index-title-gap);',
    );
    expect(proposition).toContain(
      'margin-block-start: var(--case-title-body-gap);',
    );
    expect(sectionHeading).toContain('gap: var(--case-index-title-gap);');
    expect(sectionHeading).toContain(
      'margin-bottom: var(--case-title-body-gap);',
    );
    expect(sectionHeadingTitle).toContain(
      'max-width: var(--case-chapter-title-max);',
    );

    expect(chapterTitle).toContain(
      'max-width: var(--case-chapter-title-max);',
    );
    expect(chapterTitle).toContain(
      'margin-block-end: var(--case-title-body-gap);',
    );
    expect(chapterTitle).toContain(
      'font-size: var(--case-chapter-title-size);',
    );
    expect(chapterTitle).toContain(
      'font-weight: var(--case-chapter-title-weight);',
    );
    expect(chapterTitle).toContain(
      'line-height: var(--case-chapter-title-leading);',
    );

    expect(cardTitle).toContain(
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
    );
    expect(cardTitle).toContain('max-width: var(--case-card-title-max);');
    expect(cardTitle).toContain('font-size: var(--case-card-title-size);');
    expect(cardTitle).toContain(
      'font-weight: var(--case-card-title-weight);',
    );
    expect(cardTitle).toContain(
      'line-height: var(--case-card-title-leading);',
    );

    expect(decisionTitle).toContain(
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
    );
    expect(decisionTitle).toContain(
      'max-width: var(--case-narrative-title-max);',
    );
    expect(decisionTitle).toContain(
      'font-size: var(--case-narrative-title-size);',
    );
    expect(decisionTitle).toContain(
      'font-weight: var(--case-narrative-title-weight);',
    );
    expect(decisionTitle).toContain(
      'line-height: var(--case-narrative-title-leading);',
    );

    expect(capabilityTitle).toContain(
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
    );
    expect(capabilityTitle).toContain(
      'max-width: var(--case-card-title-max);',
    );
    expect(capabilityTitle).toContain(
      'font-size: var(--case-card-title-size);',
    );
    expect(capabilityTitle).toContain(
      'font-weight: var(--case-card-title-weight);',
    );
    expect(capabilityTitle).toContain(
      'line-height: var(--case-card-title-leading);',
    );

    expect(languageTitle).toContain(
      'margin-block: 0 var(--case-title-body-gap);',
    );
    expect(languageTitle).toContain(
      'max-width: var(--case-media-title-max);',
    );
    expect(languageTitle).toContain(
      'font-size: var(--case-media-title-size);',
    );
    expect(languageTitle).toContain(
      'font-weight: var(--case-media-title-weight);',
    );
    expect(languageTitle).toContain(
      'line-height: var(--case-media-title-leading);',
    );
    const languagePaths = ruleBlock(
      modelsCss,
      '.language > .languagePaths',
    );
    expect(languagePaths).toContain('margin-block-start: 0;');
  });

  it('maps Xuelang headings to the shared semantic roles', () => {
    const layoutCss = read('components/xuelang/xuelang-layout.module.css');
    const evidenceCss = read('components/xuelang/xuelang-evidence.module.css');
    const printCss = read('components/xuelang/xuelang-print.css');
    const heroTitle = ruleBlock(layoutCss, '.hero h1');
    const eyebrow = ruleBlock(layoutCss, '.eyebrow');
    const proposition = ruleBlock(layoutCss, '.proposition');
    const sectionGrid = ruleBlock(
      layoutCss,
      '.content > :global(section)',
    );
    const sectionHeading = ruleBlock(
      layoutCss,
      '.content :global(.section-heading)',
    );
    const chapterTitle = ruleBlock(layoutCss, [
      '.content :global(.section-heading h2)',
      '.content > :global(section > h2)',
    ]);
    const problemTitle = ruleBlock(
      layoutCss,
      '.content :global(.xuelang-problem-list h3)',
    );
    const reflectionTitle = ruleBlock(
      layoutCss,
      '.content :global(.xuelang-reflection h3)',
    );
    const storyTitle = ruleBlock(evidenceCss, '.storyCopy > h3');
    const learningTitle = ruleBlock(evidenceCss, '.learningStates h3');
    const printProjectTitle = ruleBlock(
      printCss,
      '[data-xuelang-hero] h1',
    );
    const printChapterTitle = ruleBlock(
      printCss,
      '[data-xuelang-case] [data-case-study] section h2',
    );
    const printStoryTitle = ruleBlock(
      printCss,
      '[data-xuelang-case] [data-evidence-story] h3',
    );
    const printReflectionTitle = ruleBlock(
      printCss,
      '[data-xuelang-case] [data-case-study] .xuelang-reflection h3',
    );

    for (const declaration of [
      'max-width: var(--case-project-title-max);',
      'font-size: var(--case-project-title-size);',
      'font-weight: var(--case-project-title-weight);',
      'line-height: var(--case-project-title-leading);',
    ]) {
      expect(heroTitle).toContain(declaration);
    }
    expect(eyebrow).toContain(
      'margin-block-end: var(--case-index-title-gap);',
    );
    expect(proposition).toContain(
      'margin-block-start: var(--case-title-body-gap);',
    );

    expect(sectionGrid).toContain('gap: 1.5rem;');
    expect(sectionHeading).toContain('display: grid;');
    expect(sectionHeading).toContain('gap: var(--case-index-title-gap);');

    for (const declaration of [
      'max-width: var(--case-chapter-title-max);',
      'font-size: var(--case-chapter-title-size);',
      'font-weight: var(--case-chapter-title-weight);',
      'line-height: var(--case-chapter-title-leading);',
    ]) {
      expect(chapterTitle).toContain(declaration);
    }

    for (const declaration of [
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
      'max-width: var(--case-card-title-max);',
      'font-size: var(--case-card-title-size);',
      'font-weight: var(--case-card-title-weight);',
      'line-height: var(--case-card-title-leading);',
    ]) {
      expect(problemTitle).toContain(declaration);
    }

    for (const title of [reflectionTitle, storyTitle, learningTitle]) {
      for (const declaration of [
        'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
        'max-width: var(--case-narrative-title-max);',
        'font-size: var(--case-narrative-title-size);',
        'font-weight: var(--case-narrative-title-weight);',
        'line-height: var(--case-narrative-title-leading);',
      ]) {
        expect(title).toContain(declaration);
      }
    }
    expect(evidenceCss).not.toMatch(/\.storyCopy:lang\(en\)\s*>\s*h3/);

    for (const declaration of [
      'max-width: var(--case-project-title-max) !important;',
      'font-size: var(--case-project-title-size) !important;',
      'line-height: var(--case-project-title-leading) !important;',
    ]) {
      expect(printProjectTitle).toContain(declaration);
    }
    for (const declaration of [
      'max-width: var(--case-chapter-title-max) !important;',
      'font-size: var(--case-chapter-title-size) !important;',
      'line-height: var(--case-chapter-title-leading) !important;',
    ]) {
      expect(printChapterTitle).toContain(declaration);
    }
    for (const title of [printStoryTitle, printReflectionTitle]) {
      expect(title).toContain(
        'font-size: var(--case-narrative-title-size) !important;',
      );
      expect(title).toContain(
        'line-height: var(--case-narrative-title-leading) !important;',
      );
    }
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
