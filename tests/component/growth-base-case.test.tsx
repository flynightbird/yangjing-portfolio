import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GrowthBaseCase } from '@/components/growth-base/growth-base-case';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('GrowthBaseCase', () => {
  it('presents one overview, four design decisions, and a trainer extension', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);
    const sectionIds = Array.from(
      container.querySelectorAll<HTMLElement>(':scope > section'),
    ).map((section) => section.id);

    expect(sectionIds).toEqual([
      'showcase',
      'task-focus',
      'reward-loop',
      'emotional-language',
      'scene-films',
      'personal-trainer',
      'campaign-posters',
    ]);
    expect(
      screen.getByText('把健康打卡-信息展示的“运动工具”转向“生活方式和健康陪伴”。'),
    ).toBeVisible();
    expect(screen.getByText('让下一步行动一眼可见')).toBeVisible();
    expect(screen.getByText('让完成不再只是状态变化')).toBeVisible();
    expect(screen.getByText('先理解此刻，再提出一个小行动')).toBeVisible();
    expect(screen.getByText('用连续场景建立陪伴感')).toBeVisible();
    expect(screen.getByText('把私教预约收束成清晰的决策路径')).toBeVisible();
    expect(screen.getByText('小程序上线与「照顾好自己」系列宣传海报')).toBeVisible();
    expect(container.querySelectorAll('[data-campaign-poster]')).toHaveLength(3);
    expect(
      screen.queryByText('对照保留旧方案，但让当前可交互体验成为视觉主角。'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        '这次改版不只是替换视觉，而是围绕行动焦点、完成反馈、情感语言、场景连续性与私教预约，重构用户感知健康陪伴的方式。',
      ),
    ).toBeVisible();
    expect(container.textContent).not.toMatch(/launched|shipped|项目已上线|提升\s*\d|转化率|留存/iu);
  });

  it('shows seven tasks with five in the phone window and meditation centered', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);

    expect(screen.getAllByTestId('growth-base-task')).toHaveLength(7);
    expect(container.querySelectorAll('[data-task-visibility="visible"]')).toHaveLength(5);
    expect(container.querySelectorAll('[data-task-visibility="overflow"]')).toHaveLength(2);
    expect(container.querySelector('[data-task-current="true"]')).toHaveTextContent(
      '15:30冥想',
    );
  });

  it('turns completion into sequential points and a manually claimed prop', async () => {
    vi.useFakeTimers();
    const { container } = render(<GrowthBaseCase locale="zh" />);
    const pointRewards = container.querySelectorAll('[data-point-reward]');

    expect(Array.from(pointRewards).map((item) => item.getAttribute('data-point-reward'))).toEqual([
      'vitality',
      'focus',
      'stamina',
    ]);
    expect(screen.getAllByText('+10')).toHaveLength(3);
    expect(screen.getByText('完成任务')).toBeVisible();
    expect(screen.getByText('Hi Five')).toBeVisible();
    expect(screen.getByRole('img', { name: '活力积分素材' })).toBeVisible();
    expect(screen.getByLabelText('任务完成后的 Hi Five 视频')).toHaveAttribute(
      'aria-describedby',
      'growth-base-hi-five-zh-description',
    );
    expect(screen.getByText('道具获取')).toBeVisible();
    expect(screen.getByRole('button', { name: '领取静心帐篷' })).toHaveTextContent('领取道具');

    fireEvent.click(screen.getByRole('button', { name: '领取静心帐篷' }));

    expect(container.querySelector('[data-tent-demo]')).toHaveAttribute('data-state', 'claiming');
    expect(screen.getByText('领取中')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(650));
    expect(container.querySelector('[data-tent-demo]')).toHaveAttribute('data-state', 'claimed');
    expect(screen.getByText('静心帐篷已放入营地')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('已获得');
    expect(screen.getByRole('button', { name: '重新演示帐篷领取' })).toBeVisible();
    expect(container.querySelector('svg.lucide')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: '重新演示帐篷领取' }));
    expect(container.querySelector('[data-tent-demo]')).toHaveAttribute('data-state', 'ready');
  });

  it('keeps four contextual quotes in one large language field', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);
    const field = container.querySelector('[data-language-field]');

    expect(field).toBeVisible();
    expect(field?.querySelectorAll('[data-language-moment]')).toHaveLength(4);
    expect(
      screen.getByText('“早上好，Maggie。'),
    ).toBeVisible();
    expect(
      screen.getByText('今天先到这里，做一段轻柔拉伸，再安心休息吧。”'),
    ).toBeVisible();
  });

  it('shows a scrollable automatic trainer booking walkthrough', () => {
    const { container } = render(<GrowthBaseCase locale="zh" />);
    const demo = container.querySelector('[data-trainer-auto-demo]');

    expect(demo).toBeVisible();
    expect(demo?.querySelector('iframe')).toHaveAttribute(
      'src',
      expect.stringContaining('demo=trainer'),
    );
    expect(demo?.querySelector('iframe')).toHaveAttribute('tabindex', '-1');
    expect(container.querySelector('[class*="demoInputShield"]')).not.toBeInTheDocument();
    expect(demo?.querySelectorAll('button')).toHaveLength(0);
  });

  it('groups four independent films into two editorial shells', () => {
    const { container } = render(<GrowthBaseCase locale="en" />);

    expect(container.querySelectorAll('[data-film-shell]')).toHaveLength(2);
    expect(screen.getAllByTestId('growth-base-film')).toHaveLength(4);
    expect(container.querySelectorAll('[data-film-shell] video')).toHaveLength(4);
    expect(container.querySelectorAll('[data-film-caption="bottom"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-watermark-mask="top-left"]')).toHaveLength(4);
    expect(container.querySelector('[data-film-id="meal-prep"]')).toBeVisible();
    expect(screen.getByText('Build companionship through continuity')).toBeVisible();
  });

  it('authors the decision narrative in English', () => {
    render(<GrowthBaseCase locale="en" />);

    expect(screen.getByText('Make the next action unmistakable')).toBeVisible();
    expect(screen.getByText('Turn completion into a felt response')).toBeVisible();
    expect(screen.getByText('Acknowledge the moment before offering advice')).toBeVisible();
  });
});
