import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import AboutPage from '@/app/(localized)/[locale]/about/page';
import { DraftCase } from '@/components/draft-case/draft-case';
import { contentEntries } from '@/content/registry';

afterEach(cleanup);

describe('draft route registry', () => {
  it('registers complete Xuelang and draft Meeting routes in canonical order', () => {
    for (const locale of ['en', 'zh'] as const) {
      const xuelang = contentEntries.find(
        ({ meta }) => meta.slug === 'xuelang' && meta.locale === locale,
      );
      const meeting = contentEntries.find(
        ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
      );

      expect(xuelang?.meta).toMatchObject({
        type: 'work',
        featuredOrder: 1,
        nextSlug: 'call-agent',
        status: locale === 'zh' ? '已完成实验验证' : 'Experiment validated',
      });
      expect(xuelang?.meta.previousSlug).toBeUndefined();
      expect(meeting?.meta).toMatchObject({
        type: 'work',
        featuredOrder: 3,
        previousSlug: 'call-agent',
        nextSlug: 'stt-demo',
        status: locale === 'zh' ? '草稿' : 'Draft',
      });
    }
  });
});

describe('DraftCase', () => {
  it('separates shipped Meeting evidence from the retrospective and limitations', () => {
    const { container } = render(<DraftCase locale="en" project="meeting" />);
    const draft = container.querySelector<HTMLElement>(
      '[data-publication-state="draft"]',
    );

    expect(draft).toBeInTheDocument();
    expect(within(draft as HTMLElement).getByRole('heading', { name: 'Shipped evidence' })).toBeVisible();
    expect(within(draft as HTMLElement).getByRole('heading', { name: '2026 retrospective' })).toBeVisible();
    expect(
      within(draft as HTMLElement).getByText(
        'No customer audience, outcome metric, or retrospective launch claim is included.',
      ),
    ).toBeVisible();
    expect(within(draft as HTMLElement).queryByRole('img')).not.toBeInTheDocument();
  });
});

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
    expect(container.querySelector('[data-publication-state="draft"]')).toBeInTheDocument();
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(container.querySelector('a[href*="linkedin.com"]')).toBeNull();
    expect(container.querySelector('a[href$=".pdf"]')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
});
