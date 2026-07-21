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
  let intersectionCallback: IntersectionObserverCallback;

  beforeEach(() => {
    navigationMocks.pathname = '/en/';
    navigationMocks.replace.mockReset();
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
          intersectionCallback = callback;
        }

        observe = vi.fn();
        disconnect = vi.fn();
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);
        root = null;
        rootMargin = '0px';
        thresholds = [0];
      },
    );
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

  it('uses the full name and exposes a top-state observer sentinel', () => {
    const { container } = render(<SiteHeader locale="en" />);

    expect(screen.getByRole('link', { name: 'Yang Jing home' })).toHaveTextContent(
      'Yang Jing',
    );
    expect(container.querySelector('[data-header-top-sentinel]')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'false');
  });

  it('morphs into the capsule when the page top leaves the viewport', () => {
    render(<SiteHeader locale="en" />);

    act(() => {
      intersectionCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      );
    });

    expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
  });

  it.each([
    '/en/work/meeting/',
    '/zh/work/call-agent/',
    '/en/work/xuelang/',
  ])('marks detail route %s as light', (pathname) => {
    navigationMocks.pathname = pathname;
    render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'light');
  });

  it.each(['/zh/build/stt-demo/', '/en/work/tangping/'])(
    'keeps dark detail route %s dark',
    (pathname) => {
      navigationMocks.pathname = pathname;
      render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);

      expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'dark');
    },
  );

  it.each(['/en/', '/zh/'])('keeps home route %s dark', (pathname) => {
    navigationMocks.pathname = pathname;
    render(<SiteHeader locale={pathname.startsWith('/zh/') ? 'zh' : 'en'} />);

    expect(screen.getByRole('banner')).toHaveAttribute('data-surface', 'dark');
  });
});
