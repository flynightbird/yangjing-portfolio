import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleSwitcherControl } from '@/components/shell/locale-switcher';

const storedValues = new Map<string, string>();
const testStorage = {
  clear: () => storedValues.clear(),
  getItem: (key: string) => storedValues.get(key) ?? null,
  setItem: (key: string, value: string) => storedValues.set(key, value),
} as unknown as Storage;

afterEach(() => {
  window.history.replaceState(null, '', '/');
  cleanup();
});

describe('LocaleSwitcherControl', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: testStorage,
    });
    window.localStorage.clear();
  });

  it('switches to the opposite locale immediately and preserves the hash', async () => {
    const replace = vi.fn();
    window.history.replaceState(null, '', '/en/#archive');
    render(
      <LocaleSwitcherControl locale="en" pathname="/en/" replace={replace} />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to Simplified Chinese' }),
    );

    expect(window.localStorage.getItem('yj-locale')).toBe('zh');
    expect(replace).toHaveBeenCalledWith('/zh/#archive');
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('falls back directly to the target homepage for an unknown route', async () => {
    const replace = vi.fn();
    render(
      <LocaleSwitcherControl
        locale="en"
        pathname="/en/private-preview/"
        replace={replace}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: 'Switch to Simplified Chinese' }),
    );

    expect(replace).toHaveBeenCalledWith('/zh/');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('is directly operable from the keyboard', async () => {
    const replace = vi.fn();
    const user = userEvent.setup();
    render(
      <LocaleSwitcherControl locale="zh" pathname="/zh/" replace={replace} />,
    );

    await user.tab();
    const control = screen.getByRole('button', { name: '切换至英语' });
    expect(control).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(replace).toHaveBeenCalledWith('/en/');
  });
});
