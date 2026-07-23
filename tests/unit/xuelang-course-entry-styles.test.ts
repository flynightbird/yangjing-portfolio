import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const styles = fs.readFileSync(
  path.join(process.cwd(), 'components/xuelang/xuelang-course-entry.module.css'),
  'utf8',
);

const ruleBlock = (css: string, selector: string) => {
  const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/gs)].find(
    ([, selectorList]) =>
      selectorList
        .split(',')
        .map((item) => item.trim())
        .includes(selector),
  );

  expect(rule, `Expected CSS rule for ${selector}`).toBeDefined();

  return rule?.[2] ?? '';
};

describe('Xuelang Course Entry print styles', () => {
  it('maps course-entry titles to the media semantic role', () => {
    const stageTitle = ruleBlock(styles, '.stageCopy h4');
    const mobileStyles = styles.slice(
      styles.indexOf('@media (max-width: 640px)'),
      styles.indexOf('@media (prefers-reduced-motion: reduce)'),
    );
    const printTitle = ruleBlock(styles, '.printGrid figcaption strong');

    for (const declaration of [
      'margin-block: var(--case-index-title-gap) var(--case-title-body-gap);',
      'max-width: var(--case-media-title-max);',
      'font-size: var(--case-media-title-size);',
      'font-weight: var(--case-media-title-weight);',
      'line-height: var(--case-media-title-leading);',
    ]) {
      expect(stageTitle).toContain(declaration);
    }
    expect(mobileStyles).not.toMatch(
      /\.stageCopy h4\s*\{[^}]*(?:font-size|max-width):/s,
    );
    expect(printTitle).toContain(
      'font-size: var(--case-media-title-size);',
    );
    expect(printTitle).toContain(
      'font-weight: var(--case-media-title-weight);',
    );
    expect(printTitle).toContain(
      'line-height: var(--case-media-title-leading);',
    );
  });

  it('preserves the full mobile screens in print', () => {
    const printStyles = styles.slice(styles.indexOf('@media print'));

    expect(printStyles).toMatch(
      /\.printGrid img\s*\{[\s\S]*?object-fit:\s*contain\s*!important;/,
    );
  });
});
