import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AboutPage from '@/app/(localized)/[locale]/about/page';

afterEach(cleanup);

describe('About framework', () => {
  it('renders approved bilingual structure without fake contact or resume values', async () => {
    const page = await AboutPage({ params: Promise.resolve({ locale: 'en' }) });
    const { container } = render(page);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Clarify the complexity. Make the judgment tangible.',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'My work connects user research, consumer products at scale, complex systems, and AI. I turn technical and business complexity into experiences people can understand and use.',
      ),
    ).toBeVisible();
    expect(container.querySelector('[data-publication-state="draft"]')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="mailto:amanda.yangj@gmail.com"]')).toBeNull();
    expect(container.querySelector('a[href*="linkedin.com"]')).toBeNull();
    expect(container.querySelector('a[href$=".pdf"]')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
