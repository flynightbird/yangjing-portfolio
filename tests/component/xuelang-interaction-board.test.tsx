import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangInteractionBoard } from '@/components/xuelang/xuelang-interaction-board';

afterEach(cleanup);

describe('XuelangInteractionBoard', () => {
  it.each([
    {
      locale: 'zh' as const,
      alt: '多种学习界面展示沉浸播放、倍速控制与课时切换',
      label: '学习控制证据',
      headings: ['沉浸与顺滑', '碎片学习效率', '课时切换'],
      values: ['52.62%', '42.21%', '7.49%', '36.5 min'],
    },
    {
      locale: 'en' as const,
      alt: 'Learning interfaces showing immersive playback, speed controls, and lesson switching',
      label: 'Learning-control evidence',
      headings: ['Immersion and smooth control', 'Efficient fragmented learning', 'Faster lesson switching'],
      values: ['52.62%', '42.21%', '7.49%', '36.5 min'],
    },
  ])('renders inspectable $locale product evidence', ({ locale, alt, label, headings, values }) => {
    const { container } = render(<XuelangInteractionBoard locale={locale} />);

    expect(screen.getByRole('img', { name: alt })).toHaveAttribute(
      'src',
      '/images/xuelang/learning-interaction.webp',
    );
    expect(screen.getByRole('list', { name: label })).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    for (const heading of headings) {
      expect(screen.getByText(heading)).toBeVisible();
    }
    for (const value of values) {
      expect(container).toHaveTextContent(value);
    }
    expect(container.querySelector('[data-interaction-board]')).toBeInTheDocument();
    expect(container).not.toHaveTextContent('产品画面保持完整');
    expect(container).not.toHaveTextContent('The product canvas stays intact');
  });
});
