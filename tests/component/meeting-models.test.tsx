import { readFileSync } from 'node:fs';

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  CapabilitySystem,
  ContextPriorityModel,
  LanguageControlModel,
  MeetingStateMatrix,
  ParticipantPriorityStack,
} from '@/components/meeting/meeting-models';

afterEach(cleanup);

const modelStyles = readFileSync(
  'components/meeting/meeting-models.module.css',
  'utf8',
);

describe('Meeting system models', () => {
  it('renders exactly the three approved stage triggers', () => {
    render(<MeetingStateMatrix locale="en" />);
    const region = screen.getByRole('region', { name: 'Meeting stage state rules' });
    const table = screen.getByRole('table', { name: 'Meeting stage state rules' });

    expect(region).toHaveAttribute('tabindex', '0');
    const columnHeaders = within(table).getAllByRole('columnheader');
    expect(columnHeaders).toHaveLength(3);
    for (const columnHeader of columnHeaders) {
      expect(columnHeader).toHaveAttribute('scope', 'col');
    }
    const rowHeaders = within(table).getAllByRole('rowheader');
    expect(rowHeaders).toHaveLength(3);
    expect(rowHeaders.map((header) => header.textContent)).toEqual([
      'Screen Share',
      'Whiteboard Open',
      'Participant Count',
    ]);
    for (const rowHeader of rowHeaders) expect(rowHeader).toHaveAttribute('scope', 'row');
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).queryByText('Host Focus')).not.toBeInTheDocument();
  });

  it('connects context, information priority, and interface state', () => {
    const { container } = render(<ContextPriorityModel locale="en" />);
    expect(screen.getByText('Meeting context')).toBeVisible();
    expect(screen.getByText('Information priority')).toBeVisible();
    expect(screen.getByText('Interface state')).toBeVisible();
    expect(container.querySelectorAll('[data-meeting-context-step]')).toHaveLength(3);
  });

  it('preserves the approved participant priority order', () => {
    render(<ParticipantPriorityStack locale="en" />);
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Active Speaker'),
      expect.stringContaining('Self'),
      expect.stringContaining('Camera + Microphone'),
      expect.stringContaining('Camera'),
      expect.stringContaining('Microphone'),
    ]);
  });

  it('separates individual captions from host-governed transcription', () => {
    const { container } = render(<LanguageControlModel locale="en" />);
    expect(screen.getByText('Individual control')).toBeVisible();
    expect(screen.getByText('Host starts or stops')).toBeVisible();
    expect(screen.getByText('Participant can request')).toBeVisible();
    expect(container.querySelectorAll('[data-meeting-language-path]')).toHaveLength(2);
  });

  it('keeps breadth evidence to the three approved capabilities', () => {
    render(<CapabilitySystem locale="en" />);
    expect(screen.getAllByRole('article').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Breakout Rooms'),
      expect.stringContaining('In-meeting Chat'),
      expect.stringContaining('Waiting Room'),
    ]);
  });
});

describe('Meeting system model layout', () => {
  it('uses the Meeting line and muted tokens throughout', () => {
    expect(modelStyles).toContain('var(--meeting-line,');
    expect(modelStyles).toContain('var(--meeting-muted,');
    expect(modelStyles).not.toMatch(/var\(--line(?:,|\))/);
    expect(modelStyles).not.toMatch(/var\(--text-muted(?:,|\))/);
  });

  it('presents capability breadth as one asymmetric strip', () => {
    expect(modelStyles).toMatch(
      /\.capabilities\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s+minmax\(0,\s*\.85fr\)\s+minmax\(0,\s*1fr\)[^}]*border-block:/s,
    );
    expect(modelStyles).not.toMatch(
      /\.capabilities\s*{[^}]*grid-template-columns:\s*repeat\(3,/s,
    );
    expect(modelStyles).toMatch(
      /\.capabilities article\s*{[^}]*border-right:\s*1px solid var\(--meeting-line,/s,
    );
  });

  it('collapses every model grid at 720px and contains table overflow', () => {
    expect(modelStyles).toMatch(
      /@media\s*\(max-width:\s*720px\)[^{]*{[\s\S]*?\.contextFlow,[\s\S]*?\.languagePaths,[\s\S]*?\.capabilities,[\s\S]*?\.priority figcaption\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/,
    );
    expect(modelStyles).toMatch(
      /\.tableWrap\s*{[^}]*max-width:\s*100%[^}]*overflow-x:\s*auto/s,
    );
    expect(modelStyles).toMatch(
      /\.tableWrap:focus-visible\s*{[^}]*outline:\s*2px solid var\(--meeting-accent,[^}]*outline-offset:\s*4px/s,
    );
    expect(modelStyles).toMatch(
      /\.matrix\s*{[^}]*width:\s*100%[^}]*min-width:\s*42rem/s,
    );
  });
});
