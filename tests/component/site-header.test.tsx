import { act, cleanup, render, screen } from '@testing-library/react';
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

afterEach(cleanup);

describe('SiteHeader', () => {
  beforeEach(() => {
    navigationMocks.pathname = '/en/';
    navigationMocks.replace.mockReset();
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
  });

  it('renders only Work, Archive, About, and the direct language control', () => {
    render(<SiteHeader locale="en" />);

    expect(screen.getAllByRole('link', { name: 'Work' })[0]).toHaveAttribute(
      'href',
      '/en/#work',
    );
    expect(screen.getAllByRole('link', { name: 'Archive' })[0]).toHaveAttribute(
      'href',
      '/en/#archive',
    );
    expect(screen.getAllByRole('link', { name: 'About' })[0]).toHaveAttribute(
      'href',
      '/en/about/',
    );
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
    expect(screen.queryByText('Contact')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Switch to Simplified Chinese' }),
    ).toBeVisible();
  });

  it('marks the capsule as scrolled without hiding it', () => {
    render(<SiteHeader locale="en" />);

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 80 });
    act(() => window.dispatchEvent(new Event('scroll')));

    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
  });
});
