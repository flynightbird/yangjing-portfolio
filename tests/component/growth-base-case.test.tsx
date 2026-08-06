import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GrowthBaseCase } from '@/components/growth-base/growth-base-case';

afterEach(cleanup);

describe('GrowthBaseCase', () => {
  it('migrates the prior showcase as three focused sections', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);
    const sectionIds = Array.from(
      container.querySelectorAll<HTMLElement>(':scope > section'),
    ).map((section) => section.id);

    expect(sectionIds).toEqual(['showcase', 'experience-clips', 'disclosure']);
    expect(screen.getAllByTestId('growth-base-film')).toHaveLength(5);
    expect(screen.getByText('个人概念 · 可交互原型')).toBeVisible();
    expect(container.textContent).not.toMatch(/launched|shipped|上线|提升\s*\d|转化率|留存/iu);
  });

  it('uses bottom captions and a dedicated watermark blur mask for every film', () => {
    const { container } = render(<GrowthBaseCase locale="en" />);

    expect(container.querySelectorAll('[data-film-caption="bottom"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-watermark-mask="top-left"]')).toHaveLength(5);
    expect(container.querySelectorAll('svg')).toHaveLength(0);
  });

  it('uses concise editorial notes and the approved C1 film grid', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);

    expect(container.querySelector('[data-growth-base-film-grid]')).toHaveAttribute(
      'data-layout',
      'editorial-3-2',
    );
    expect(container.querySelectorAll('[data-growth-base-note]')).toHaveLength(2);
    expect(
      screen.getByText('对照保留旧方案，但让当前可交互体验成为视觉主角。'),
    ).toBeVisible();
    expect(screen.queryByText('情境：日常健康行动需要及时回应。')).toBeNull();
    expect(screen.queryByText('情境：IP 需要在多个健康时刻持续出现。')).toBeNull();
  });
});
