import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { TangpingLayout } from '@/components/tangping/tangping-layout';
import { TangpingStory } from '@/components/tangping/tangping-story';
import { getEntry } from '@/content/registry';

afterEach(cleanup);

describe('Tangping visual detail', () => {
  it('uses the archive cover as a coded Tangping hero', () => {
    const meta = getEntry('work', 'tangping', 'zh').meta;

    const { container } = render(
      <TangpingLayout meta={meta} locale="zh">
        <TangpingStory locale="zh" />
      </TangpingLayout>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '躺平设计家' })).toBeVisible();
    expect(screen.getByText('Alibaba / 2019–2020.12')).toBeVisible();
    expect(screen.getByText('APP & 官网主站')).toBeVisible();
    expect(screen.getByRole('img', { name: '躺平设计家项目封面' })).toHaveAttribute(
      'src',
      '/images/archive/alibaba-meipingmeiwu.jpg',
    );
    expect(container).not.toHaveTextContent('每平每屋');
  });

  it('renders the four approved frames in numeric order without reference artwork', () => {
    const { container } = render(<TangpingStory locale="zh" />);
    const frames = [...container.querySelectorAll<HTMLElement>('[data-tangping-frame]')];

    expect(frames.map((frame) => frame.dataset.frameId)).toEqual(['6', '10', '11', '20']);
    expect(frames.every((frame) => frame.dataset.contiguous === 'true')).toBe(true);
    expect(container.querySelector('hr')).not.toBeInTheDocument();

    expect(
      screen.getAllByRole('img').map((image) => image.getAttribute('src')),
    ).toEqual([
      '/images/tangping/frame-06.png',
      '/images/tangping/frame-10.png',
      '/images/tangping/frame-11.png',
      '/images/tangping/frame-20.png',
    ]);
    expect(container.innerHTML).not.toContain('reference-');
  });

  it('keeps real copy in semantic groups instead of baking it into images', () => {
    const { container } = render(<TangpingStory locale="zh" />);

    expect(screen.getByRole('heading', { name: '躺平设计家 · 设计背景' })).toBeVisible();
    expect(screen.getByText('整个室内设计人群 1700 万+')).toBeVisible();
    expect(screen.getByText('问卷调研（200 份+）')).toBeVisible();
    expect(screen.getAllByText('家装设计驱动型设计师')).toHaveLength(2);
    expect(screen.getByText('机会点 / 竞品未匹配')).toBeVisible();
    expect(container.querySelectorAll('[data-copy-group]')).toHaveLength(14);
    expect(container.querySelector('[data-persona-grid]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-legend-swatch]')).toHaveLength(4);

    for (const frame of container.querySelectorAll<HTMLElement>('[data-tangping-frame]')) {
      expect(within(frame).getByRole('heading', { level: 2 })).toBeVisible();
      expect(frame.querySelectorAll('[data-reveal-layer]')).toHaveLength(3);
    }
  });

  it('renders equivalent English narrative groups', () => {
    render(<TangpingStory locale="en" />);

    expect(screen.getByRole('heading', { name: 'Tangping Designer · Design context' })).toBeVisible();
    expect(screen.getByText('Questionnaire research (200+ responses)')).toBeVisible();
    expect(screen.getByText('Needs differ by role', { exact: false })).toBeVisible();
  });
});
