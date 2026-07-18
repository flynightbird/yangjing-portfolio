import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SiteFooter } from '@/components/shell/site-footer';

afterEach(cleanup);

describe('SiteFooter', () => {
  it.each([
    ['en', '/en/about/'],
    ['zh', '/zh/about/'],
  ] as const)('offers direct email and About only in %s', (locale, aboutHref) => {
    const { container } = render(<SiteFooter locale={locale} />);

    expect(container.querySelector('[data-liquid-field="footer"]')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /yangux@qq\.com/i })).toHaveAttribute(
      'href',
      'mailto:yangux@qq.com',
    );
    expect(screen.getByRole('link', { name: /about|关于/i })).toHaveAttribute(
      'href',
      aboutHref,
    );
    expect(screen.queryByText(/resume|简历/i)).not.toBeInTheDocument();
  });
});
