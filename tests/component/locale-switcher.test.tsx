import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleSwitcherControl } from '@/components/shell/locale-switcher';

const storedValues = new Map<string, string>();
const testStorage = {
  clear: () => storedValues.clear(),
  getItem: (key: string) => storedValues.get(key) ?? null,
  setItem: (key: string, value: string) => storedValues.set(key, value),
} as Storage;

afterEach(cleanup);

describe('LocaleSwitcherControl', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: testStorage,
    });
    window.localStorage.clear();
  });

  it('preserves route identity and persists the selected locale before navigation', async () => {
    const replace = vi.fn();
    const user = userEvent.setup();

    render(
      <LocaleSwitcherControl
        locale="en"
        pathname="/en/work/call-agent/"
        replace={replace}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select language' }));
    await user.click(
      screen.getByRole('button', { name: 'Simplified Chinese' }),
    );

    expect(window.localStorage.getItem('yj-locale')).toBe('zh');
    expect(replace).toHaveBeenCalledWith('/zh/work/call-agent/');
  });

  it('discloses an unknown-route fallback before opening the locale homepage', async () => {
    const replace = vi.fn();
    const user = userEvent.setup();

    render(
      <LocaleSwitcherControl
        locale="en"
        pathname="/en/private-preview/"
        replace={replace}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Select language' }));
    await user.click(
      screen.getByRole('button', { name: 'Simplified Chinese' }),
    );

    expect(replace).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(
      'This page is not available in Simplified Chinese.',
    );

    await user.click(
      screen.getByRole('button', {
        name: 'Open the Simplified Chinese homepage',
      }),
    );

    expect(window.localStorage.getItem('yj-locale')).toBe('zh');
    expect(replace).toHaveBeenCalledWith('/zh/');
  });

  it('opens the language choices from the keyboard', async () => {
    const user = userEvent.setup();

    render(
      <LocaleSwitcherControl
        locale="en"
        pathname="/en/"
        replace={vi.fn()}
      />,
    );

    await user.tab();
    expect(screen.getByRole('button', { name: 'Select language' })).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(
      screen.getByRole('button', { name: 'Select language' }),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', { name: 'Simplified Chinese' }),
    ).toBeVisible();
  });
});
