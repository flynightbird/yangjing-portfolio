import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AboutPage from '@/app/(localized)/[locale]/about/page';

afterEach(cleanup);

describe('About framework', () => {
  it('renders approved bilingual structure without fake contact or resume values', async () => {
    const page = await AboutPage({ params: Promise.resolve({ locale: 'en' }) });
    const { container } = render(page);

    expect(screen.getByRole('heading', { level: 1, name: 'About Yang Jing' })).toBeVisible();
    expect(
      screen.getByText(
        'From large-scale consumer product design, into complex B2B and AI systems, then into AI-assisted product building.',
      ),
    ).toBeVisible();
    expect(container.querySelector('[data-publication-state="draft"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="mailto:yangux@qq.com"]')).toBeInTheDocument();
    expect(container.querySelector('a[href*="linkedin.com"]')).toBeNull();
    expect(container.querySelector('a[href$=".pdf"]')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
