import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NotFound from '@/app/not-found';

describe('NotFound', () => {
  it('links to both locales and identifies Chinese text', () => {
    render(<NotFound />);

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
});
