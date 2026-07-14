import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ChapterNav } from '@/components/case-study/chapter-nav';
import { EvidenceFigure } from '@/components/case-study/evidence-figure';
import { Lightbox } from '@/components/media/lightbox';

const chapters = [
  { id: 'overview', label: 'Overview' },
  { id: 'decision-preview', label: 'Preview decision' },
];

afterEach(() => {
  document.body.removeAttribute('style');
});

describe('ChapterNav', () => {
  it('exposes a keyboard-operable compact chapter menu', async () => {
    const user = userEvent.setup();
    render(<ChapterNav chapters={chapters} locale="en" />);

    const toggle = screen.getByRole('button', { name: 'Open chapter index' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(toggle).toHaveAccessibleName('Close chapter index');
    expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();

    await user.click(screen.getByRole('link', { name: 'Preview decision' }));
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('EvidenceFigure', () => {
  it('preserves intrinsic media dimensions and evidence semantics', () => {
    render(
      <EvidenceFigure
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Agent configuration next to a live call preview"
        label="OBSERVED / Product evidence"
        caption="Configuration and runtime feedback share one view."
        locale="en"
      />,
    );

    expect(
      screen.getByRole('img', {
        name: 'Agent configuration next to a live call preview',
      }),
    ).toHaveAttribute('width', '2934');
    expect(screen.getByText('OBSERVED / Product evidence')).toBeVisible();
    expect(
      screen.getByText('Configuration and runtime feedback share one view.'),
    ).toBeVisible();
  });
});

describe('Lightbox', () => {
  it('closes on Escape, returns focus, and restores the exact body overflow', async () => {
    const user = userEvent.setup();
    document.body.style.overflow = 'clip';

    render(
      <Lightbox
        src="/images/call-agent/ai-preview-live.png"
        width={2934}
        height={1466}
        alt="Agent configuration next to a live call preview"
        triggerLabel="Enlarge live preview evidence"
        dialogLabel="Product interface detail"
      />,
    );

    const trigger = screen.getByRole('button', {
      name: 'Enlarge live preview evidence',
    });
    trigger.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('dialog', { name: 'Product interface detail' })).toBeVisible();
    expect(document.body.style.overflow).toBe('hidden');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe('clip');
  });
});
