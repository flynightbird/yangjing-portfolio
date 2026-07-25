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
    expect(printCss).toMatch(
      /\[data-system-mode\]\s*>\s*div:last-child\s*\{[^}]*display:\s*grid\s*!important;/s,
    );
  });
});
