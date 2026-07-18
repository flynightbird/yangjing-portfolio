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

describe('Meeting system models', () => {
  it('renders exactly the three approved stage triggers', () => {
    render(<MeetingStateMatrix locale="en" />);
    const table = screen.getByRole('table', { name: 'Meeting stage state rules' });
    for (const trigger of ['Screen Share', 'Whiteboard Open', 'Participant Count']) {
      expect(within(table).getByText(trigger)).toBeVisible();
    }
    expect(within(table).getAllByRole('row')).toHaveLength(4);
    expect(within(table).queryByText('Host Focus')).not.toBeInTheDocument();
  });

  it('connects context, information priority, and interface state', () => {
    render(<ContextPriorityModel locale="en" />);
    expect(screen.getByText('Meeting context')).toBeVisible();
    expect(screen.getByText('Information priority')).toBeVisible();
    expect(screen.getByText('Interface state')).toBeVisible();
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
    render(<LanguageControlModel locale="en" />);
    expect(screen.getByText('Individual control')).toBeVisible();
    expect(screen.getByText('Host starts or stops')).toBeVisible();
    expect(screen.getByText('Participant can request')).toBeVisible();
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
