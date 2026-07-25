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
    expect(container.querySelector('[data-liquid-field="footer"]')).not.toBeInTheDocument();
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
    expect(container.querySelector('[data-footer-email-icon="copy"]')).toHaveAttribute(
      'width',
      '16',
    );
    expect(
      within(actions as HTMLElement).getByRole('link', {
        name: locale === 'zh'
          ? '发送邮件至 amanda.yangj@gmail.com'
          : 'Send email to amanda.yangj@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
    expect(container.querySelector('[data-footer-email-icon="arrow"]')).toHaveAttribute(
      'width',
      '16',
    );
    const homeContacts = container.querySelector('[data-home-footer-contacts]');
    expect(homeContacts).toBeInTheDocument();
    expect(
      within(homeContacts as HTMLElement).getByText('flydesigner_yangj'),
    ).toBeInTheDocument();
    expect(
      within(homeContacts as HTMLElement).getByRole('link', {
        name: 'amanda.yangj@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
    expect(container.querySelector('[data-footer-reveal-motion]')).not.toBeInTheDocument();
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
    expect(document.querySelector('[data-footer-email-icon="check"]')).toHaveAttribute(
      'width',
      '16',
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

  it('copies homepage contacts independently and resets both icons', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const { container } = render(<SiteFooter locale="en" />);
    const email = container.querySelector<HTMLButtonElement>(
      '[data-home-footer-contacts] [data-contact-copy="email"]',
    );
    const wechat = container.querySelector<HTMLButtonElement>(
      '[data-home-footer-contacts] [data-contact-copy="wechat"]',
    );
    if (!email || !wechat) throw new Error('Missing homepage copy controls');

    fireEvent.click(email);
    await act(async () => Promise.resolve());
    expect(writeText).toHaveBeenLastCalledWith('amanda.yangj@gmail.com');
    expect(email).toHaveAttribute('data-copy-state', 'copied');
    expect(email.querySelector('[data-copy-icon="check"]')).toBeInTheDocument();
    expect(wechat).toHaveAttribute('data-copy-state', 'idle');

    fireEvent.click(wechat);
    await act(async () => Promise.resolve());
    expect(writeText).toHaveBeenLastCalledWith('flydesigner_yangj');
    expect(wechat.querySelector('[data-copy-icon="check"]')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(1800));
    expect(email.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
    expect(wechat.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
  });

  it('restarts a contact reset timer after a repeated click', async () => {
    vi.useFakeTimers();
    installClipboard(vi.fn().mockResolvedValue(undefined));
    const { container } = render(<SiteFooter locale="en" />);
    const button = container.querySelector<HTMLButtonElement>(
      '[data-contact-copy="wechat"]',
    );
    if (!button) throw new Error('Missing WeChat copy control');

    fireEvent.click(button);
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(1200));
    fireEvent.click(button);
    await act(async () => Promise.resolve());
    act(() => vi.advanceTimersByTime(700));
    expect(button).toHaveAttribute('data-copy-state', 'copied');
    act(() => vi.advanceTimersByTime(1100));
    expect(button).toHaveAttribute('data-copy-state', 'idle');
  });

  it('keeps Copy visible and announces a localized WeChat failure', async () => {
    installClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const { container } = render(<SiteFooter locale="zh" />);
    const button = container.querySelector<HTMLButtonElement>(
      '[data-contact-copy="wechat"]',
    );
    if (!button) throw new Error('Missing WeChat copy control');

    fireEvent.click(button);
    await act(async () => Promise.resolve());
    expect(button).toHaveAttribute('data-copy-state', 'failed');
    expect(button.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
    expect(button).toHaveTextContent('微信复制失败，请手动复制');
  });
});
