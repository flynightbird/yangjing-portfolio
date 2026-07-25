import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('Call Agent static stage sequence', () => {
  it('stays hidden on screen and is exposed only by the print stylesheet', () => {
    const stageCss = readFileSync(
      'components/call-agent/call-agent-system-stage.module.css',
      'utf8',
    );
    const printCss = readFileSync(
      'components/call-agent/call-agent-print.css',
      'utf8',
    );

    expect(stageCss).toMatch(/\.staticSequence\s*\{[^}]*display:\s*none;/s);
    expect(stageCss).not.toMatch(/\.staticSequence\s*\{[^}]*display:\s*grid;/s);
    for (const selector of [
      "[role='tablist']",
      '[data-call-agent-media-stage]',
      '[data-stage-summary]',
    ]) {
      expect(printCss).toMatch(
        new RegExp(`${selector.replace(/[\[\]]/g, '\\$&')}[^{}]*\\{[^}]*display:\\s*none\\s*!important;`, 's'),
      );
    }
    expect(printCss).toMatch(
      /\[data-static-sequence\]\s*\{[^}]*display:\s*grid\s*!important;/s,
    );
    expect(printCss).not.toMatch(/div:(?:first|last)-child/);
  });
});
