import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { XuelangWipeComparison } from '@/components/xuelang/xuelang-wipe-comparison';

afterEach(cleanup);

const before = {
  src: '/images/xuelang/learning-before-board.webp',
  width: 1662,
  height: 1080,
  alt: '改版前以内容交付为主的学浪产品界面集合',
  label: '旧版 · 内容交付',
  caption: '入口与内容存在，但学习动作彼此分离。',
};

const after = {
  src: '/images/xuelang/learning-after-board.webp',
  width: 1662,
  height: 1080,
  alt: '改版后连接连续学习体验的学浪产品界面集合',
  label: '新版 · 连续学习',
  caption: '把观看、互动与学习沉淀组织为连续体验。',
};

describe('XuelangWipeComparison', () => {
  it('starts with the approved 38 percent before-state reveal', () => {
    const { container } = render(
      <XuelangWipeComparison
        before={before}
        after={after}
        controlLabel="拖动比较旧版与新版"
      />,
    );

    expect(screen.getByRole('slider', { name: '拖动比较旧版与新版' }))
      .toHaveAttribute('aria-valuenow', '38');
    expect(container.querySelector('[data-wipe-interactive]'))
      .toHaveStyle({ '--wipe-position': '38%' });
  });

  it('moves in three-percent steps and respects the approved bounds', () => {
    render(
      <XuelangWipeComparison
        before={before}
        after={after}
        controlLabel="拖动比较旧版与新版"
      />,
    );
    const slider = screen.getByRole('slider', { name: '拖动比较旧版与新版' });

    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider).toHaveAttribute('aria-valuenow', '41');
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(slider).toHaveAttribute('aria-valuenow', '38');
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(slider).toHaveAttribute('aria-valuenow', '4');
    fireEvent.keyDown(slider, { key: 'End' });
    expect(slider).toHaveAttribute('aria-valuenow', '96');
  });

  it('keeps complete localized evidence available for print', () => {
    const { container } = render(
      <XuelangWipeComparison
        before={before}
        after={after}
        controlLabel="拖动比较旧版与新版"
      />,
    );

    const printPair = container.querySelector('[data-wipe-print-pair]');
    expect(printPair).toBeInTheDocument();
    expect(within(printPair as HTMLElement).getAllByRole('img', { hidden: true }))
      .toHaveLength(2);
    expect(printPair).toHaveTextContent(before.label);
    expect(printPair).toHaveTextContent(before.caption);
    expect(printPair).toHaveTextContent(after.label);
    expect(printPair).toHaveTextContent(after.caption);
  });
});
