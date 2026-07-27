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
  it('uses the approved direct Chinese invitation', () => {
    render(<SiteFooter locale="zh" />);

    expect(screen.getByText('聊聊产品、AI，或一个还没被讲清的问题。')).toBeVisible();
  });
  it.each(['en', 'zh'] as const)('renders one shared contact surface in %s', (locale) => {
    const { container } = render(<SiteFooter locale={locale} />);
    const contacts = container.querySelector('[data-footer-contacts]');

    expect(container.firstElementChild).toHaveAttribute('data-site-footer');
    expect(contacts).toBeInTheDocument();
    expect(container.querySelectorAll('[data-footer-contacts]')).toHaveLength(1);
    expect(contacts?.querySelectorAll('[data-contact-capsule]')).toHaveLength(2);
    expect(within(contacts as HTMLElement).getByText('flydesigner-yj')).toBeVisible();
    expect(
      within(contacts as HTMLElement).getByRole('link', {
        name: 'amanda.yangj@gmail.com',
      }),
    ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
    expect(
      within(contacts as HTMLElement).getByRole('button', {
        name: locale === 'zh' ? '复制微信' : 'Copy WeChat ID',
      }),
    ).toBeVisible();
    expect(container.querySelectorAll('a[href="mailto:amanda.yangj@gmail.com"]')).toHaveLength(2);
    expect(screen.getByText('© 2026 Yang Jing')).toBeVisible();
  });

  it('copies homepage contacts independently and resets both icons', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    installClipboard(writeText);
    const { container } = render(<SiteFooter locale="en" />);
    const email = container.querySelector<HTMLButtonElement>(
      '[data-footer-contacts] [data-contact-copy="email"]',
    );
    const wechat = container.querySelector<HTMLButtonElement>(
      '[data-footer-contacts] [data-contact-copy="wechat"]',
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
    expect(writeText).toHaveBeenLastCalledWith('flydesigner-yj');
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
