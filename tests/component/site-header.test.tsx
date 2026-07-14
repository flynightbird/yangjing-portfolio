import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SiteHeader } from '@/components/shell/site-header';

const navigationMocks = vi.hoisted(() => ({
  pathname: '/en/' as string,
  replace: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMocks.pathname,
  useRouter: () => ({ replace: navigationMocks.replace }),
}));

function navigationDetails(): HTMLDetailsElement {
  const details = screen.getByText('Menu').closest('details');

  if (!details) {
    throw new Error('Expected the navigation summary to belong to details');
  }

  return details;
}

async function openNavigation(user: ReturnType<typeof userEvent.setup>) {
  const summary = screen.getByText('Menu').closest('summary');

  if (!summary) {
    throw new Error('Expected a navigation summary');
  }

  await user.click(summary);
  await waitFor(() => expect(navigationDetails()).toHaveAttribute('open'));
}

async function openLocaleChoices(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Select language' }));
  expect(
    screen.getByRole('button', { name: 'Simplified Chinese' }),
  ).toBeVisible();
}

afterEach(cleanup);

describe('SiteHeader panel coordination', () => {
  beforeEach(() => {
    navigationMocks.pathname = '/en/';
    navigationMocks.replace.mockReset();
  });

  it('closes navigation when locale choices open', async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale="en" />);

    await openNavigation(user);
    await openLocaleChoices(user);

    expect(navigationDetails()).not.toHaveAttribute('open');
  });

  it('closes locale choices when navigation opens', async () => {
    const user = userEvent.setup();
    render(<SiteHeader locale="en" />);

    await openLocaleChoices(user);
    await openNavigation(user);

    expect(
      screen.queryByRole('button', { name: 'Simplified Chinese' }),
    ).not.toBeInTheDocument();
  });

  it('hides locale choices while fallback confirmation is pending', async () => {
    navigationMocks.pathname = '/en/private-preview/';
    const user = userEvent.setup();
    render(<SiteHeader locale="en" />);

    await openLocaleChoices(user);
    await user.click(
      screen.getByRole('button', { name: 'Simplified Chinese' }),
    );

    expect(screen.getByRole('status')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Simplified Chinese' }),
    ).not.toBeInTheDocument();
  });

  it('clears fallback confirmation when navigation opens', async () => {
    navigationMocks.pathname = '/en/private-preview/';
    const user = userEvent.setup();
    render(<SiteHeader locale="en" />);

    await openLocaleChoices(user);
    await user.click(
      screen.getByRole('button', { name: 'Simplified Chinese' }),
    );
    expect(screen.getByRole('status')).toBeVisible();

    await openNavigation(user);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: 'Open the Simplified Chinese homepage',
      }),
    ).not.toBeInTheDocument();
  });
});
