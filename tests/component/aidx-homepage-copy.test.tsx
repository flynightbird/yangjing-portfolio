import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FeaturedWork } from '@/components/home/featured-work';

afterEach(cleanup);

describe('AIDX Singapore positioning', () => {
  it.each([
    {
      locale: 'en' as const,
      kind: 'Singapore AI company',
      proposition:
        'A new website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
    },
    {
      locale: 'zh' as const,
      kind: '新加坡 AI 安全公司官网',
      proposition: '通过界面、信息架构与动效，为 AIDX 打造清晰、可信的品牌官网。',
    },
  ])('renders the approved $locale positioning', ({ locale, kind, proposition }) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const aidx = container.querySelector<HTMLElement>('[data-project-id="aidx"]');

    expect(aidx).toBeInTheDocument();
    expect.soft(within(aidx as HTMLElement).queryByText(kind)).toBeVisible();
    expect.soft(within(aidx as HTMLElement).queryByText(proposition)).toBeVisible();
    const links = within(aidx as HTMLElement).getAllByRole('link');
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toHaveAttribute('href', 'https://aidxtech.com/');
      expect(link).toHaveAttribute('target', '_blank');
    }
  });
});
