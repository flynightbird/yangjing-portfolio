/* eslint-disable @next/next/no-html-link-for-pages */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PageTransitionLayer } from '@/components/shell/page-transition-layer';

const navigate = vi.fn();

function setReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' && matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  vi.useFakeTimers();
  navigate.mockReset();
  setReducedMotion(false);
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('PageTransitionLayer', () => {
  it('waits for the full white sweep before navigating to a light case', () => {
    render(
      <PageTransitionLayer navigate={navigate}>
        <a
          href="/en/work/xuelang/"
          data-page-transition-tone="light"
          onClick={(event) => event.preventDefault()}
        >
          Xuelang
        </a>
      </PageTransitionLayer>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Xuelang' }));

    const overlay = screen.getByTestId('page-transition-layer');
    expect(overlay).toHaveAttribute('data-state', 'running');
    expect(overlay).toHaveAttribute('data-tone', 'light');
    expect(navigate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1199);
    expect(navigate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/en/work/xuelang/');
  });

  it('uses the dark sweep and ignores duplicate activation while running', () => {
    render(
      <PageTransitionLayer navigate={navigate}>
        <a href="/en/work/call-agent/" data-page-transition-tone="dark">
          Call Agent
        </a>
        <a href="/en/work/meeting/" data-page-transition-tone="dark">
          Meeting
        </a>
      </PageTransitionLayer>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Call Agent' }));
    fireEvent.click(screen.getByRole('link', { name: 'Meeting' }));

    expect(screen.getByTestId('page-transition-layer')).toHaveAttribute(
      'data-tone',
      'dark',
    );
    vi.advanceTimersByTime(1200);
    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/en/work/call-agent/');
  });

  it('preserves native behavior for unmarked links and modified clicks', () => {
    render(
      <PageTransitionLayer navigate={navigate}>
        <a
          href="https://aidxtech.com/"
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.preventDefault()}
        >
          AIDX
        </a>
        <a
          href="/en/work/xuelang/"
          data-page-transition-tone="light"
          onClick={(event) => event.preventDefault()}
        >
          Xuelang
        </a>
      </PageTransitionLayer>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'AIDX' }));
    fireEvent.click(screen.getByRole('link', { name: 'Xuelang' }), {
      metaKey: true,
    });
    vi.advanceTimersByTime(1200);

    expect(screen.getByTestId('page-transition-layer')).toHaveAttribute(
      'data-state',
      'idle',
    );
    expect(navigate).not.toHaveBeenCalled();
  });

  it('navigates immediately when reduced motion is requested', () => {
    setReducedMotion(true);
    render(
      <PageTransitionLayer navigate={navigate}>
        <a href="/zh/work/xuelang/" data-page-transition-tone="light">
          学浪
        </a>
      </PageTransitionLayer>,
    );

    fireEvent.click(screen.getByRole('link', { name: '学浪' }));

    expect(navigate).toHaveBeenCalledOnce();
    expect(navigate).toHaveBeenCalledWith('/zh/work/xuelang/');
    expect(screen.getByTestId('page-transition-layer')).toHaveAttribute(
      'data-state',
      'idle',
    );
  });
});
