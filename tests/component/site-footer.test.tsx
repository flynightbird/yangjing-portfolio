import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SiteFooter } from '@/components/shell/site-footer';

function installClipboard(writeText: ReturnType<typeof vi.fn>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  Reflect.deleteProperty(navigator, 'clipboard');
});

describe('SiteFooter', () => {
  it.each(['en', 'zh'] as const)('offers direct email and minimal metadata in %s', (locale) => {
    const { container } = render(<SiteFooter locale={locale} />);

    expect(container.firstElementChild).toHaveAttribute('data-site-footer');
    expect(container.querySelector('[data-footer-reveal-layer]')).toBeInTheDocument();
    expect(container.querySelector('[data-liquid-field="footer"]')).toBeInTheDocument();
    const actions = container.querySelector('[data-footer-email-actions]');
    expect(actions).toBeInTheDocument();
    expect(
      within(actions as HTMLElement).getByRole('link', {
        name: 'amanda.yangj@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
    expect(
      within(actions as HTMLElement).getByRole('button', {
        name: locale === 'zh' ? '复制邮箱' : 'Copy email address',
      }),
    ).toBeVisible();
    expect(
      within(actions as HTMLElement).getByRole('link', {
        name: locale === 'zh'
          ? '发送邮件至 amanda.yangj@gmail.com'
          : 'Send email to amanda.yangj@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
    expect(
      Array.from(actions?.children ?? []).slice(0, 3).map((element) =>
        element.getAttribute('data-footer-email-control'),
      ),
    ).toEqual(['address', 'copy', 'arrow']);
    expect(screen.queryByRole('link', { name: /yangux@qq\.com/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /copy email|复制邮箱/i })).toBeVisible();
    expect(container.querySelectorAll('a[href="mailto:amanda.yangj@gmail.com"]')).toHaveLength(
      2,
    );
    expect(screen.queryByRole('link', { name: /about|关于/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Cloudflare Web Analytics|静态网站使用/i)).not.toBeInTheDocument();
    expect(screen.getByText('© 2026 Yang Jing')).toBeVisible();
    expect(screen.queryByText(/resume|简历/i)).not.toBeInTheDocument();
  });

  it('copies the public email, announces success, and resets the control', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);

    render(<SiteFooter locale="en" />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));

    await act(async () => {
      await Promise.resolve();
    });
    expect(writeText).toHaveBeenCalledWith('amanda.yangj@gmail.com');
    expect(screen.getByRole('button', { name: 'Email copied' })).toHaveAttribute(
      'data-copy-state',
      'copied',
    );
    expect(screen.getByRole('status')).toHaveTextContent('Email copied');

    act(() => vi.advanceTimersByTime(1800));
    expect(screen.getByRole('button', { name: 'Copy email address' })).toHaveAttribute(
      'data-copy-state',
      'idle',
    );
  });

  it('keeps the email usable and announces a localized copy failure', async () => {
    installClipboard(vi.fn().mockRejectedValue(new Error('denied')));

    render(<SiteFooter locale="zh" />);
    fireEvent.click(screen.getByRole('button', { name: '复制邮箱' }));

    expect(
      await screen.findByRole('button', { name: '复制失败，请手动复制' }),
    ).toHaveAttribute('data-copy-state', 'failed');
    expect(screen.getByRole('status')).toHaveTextContent('复制失败，请手动复制');
    expect(screen.getByRole('link', { name: 'amanda.yangj@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:amanda.yangj@gmail.com',
    );
  });
});
