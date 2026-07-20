import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SiteFooter } from '@/components/shell/site-footer';

afterEach(cleanup);

describe('SiteFooter', () => {
  it.each(['en', 'zh'] as const)('offers direct email and minimal metadata in %s', (locale) => {
    const { container } = render(<SiteFooter locale={locale} />);

    expect(container.firstElementChild).toHaveAttribute('data-site-footer');
    expect(container.querySelector('[data-footer-reveal-layer]')).toBeInTheDocument();
    expect(container.querySelector('[data-liquid-field="footer"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /yangux@qq\.com/i })).toHaveAttribute(
      'href',
      'mailto:yangux@qq.com',
    );
    expect(screen.queryByRole('link', { name: /about|关于/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/Cloudflare Web Analytics|静态网站使用/i)).not.toBeInTheDocument();
    expect(screen.getByText('© 2026 Yang Jing')).toBeVisible();
    expect(screen.queryByText(/resume|简历/i)).not.toBeInTheDocument();
  });
});
