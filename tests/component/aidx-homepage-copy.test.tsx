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
        'A live website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
    },
    {
      locale: 'zh' as const,
      kind: '新加坡 AI 公司',
      proposition:
        '为新加坡 AI 安全公司 AIDX 打造的线上官网，通过界面、信息结构与动效塑造品牌表达。',
    },
  ])('renders the approved $locale positioning', ({ locale, kind, proposition }) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const aidx = container.querySelector<HTMLElement>('[data-project-id="aidx"]');

    expect(aidx).toBeInTheDocument();
    expect(within(aidx as HTMLElement).getByText(kind)).toBeVisible();
    expect(within(aidx as HTMLElement).getByText(proposition)).toBeVisible();
    expect(within(aidx as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      'https://aidxtech.com/',
    );
  });
});
