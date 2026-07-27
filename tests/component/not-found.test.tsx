import { render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import GlobalNotFound from '@/app/global-not-found';
import { NotFoundContent } from '@/components/shell/not-found-content';

describe('NotFound', () => {
  it('links to both locales and identifies Chinese text', () => {
    render(<NotFoundContent />);

    expect(screen.getByRole('link', { name: 'English' })).toHaveAttribute(
      'href',
      '/en/',
    );
    expect(screen.getByRole('link', { name: '中文' })).toHaveAttribute(
      'href',
      '/zh/',
    );
    expect(screen.getByText(/页面未找到/)).toHaveAttribute('lang', 'zh-CN');
  });

  it('includes the shared English Footer in the global not-found document', () => {
    const markup = renderToStaticMarkup(<GlobalNotFound />);
    const document = new DOMParser().parseFromString(markup, 'text/html');
    const footer = document.querySelector('[data-site-footer]');

    expect(footer).not.toBeNull();
    expect(footer?.querySelector('[data-footer-contacts]')).not.toBeNull();
    expect(footer?.textContent).toContain('flydesigner-yj');
  });
});
