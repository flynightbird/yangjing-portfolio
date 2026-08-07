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
    ]);
    expect(
      screen.getByText('互动式、更立体、更亲近的陪伴，更贴近用户的心灵'),
    ).toBeVisible();
    expect(screen.getByText('聚焦当下最重要的任务')).toBeVisible();
    expect(screen.getByText('让每次完成，都得到及时回应')).toBeVisible();
    expect(screen.getByText('先回应此刻，再给出一步建议')).toBeVisible();
    expect(screen.getByText('让陪伴进入一天中的不同场景')).toBeVisible();
    expect(screen.getByText('把预约私教，变成清晰的选择与确认')).toBeVisible();
    expect(
      screen.queryByText('对照保留旧方案，但让当前可交互体验成为视觉主角。'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(
        '围绕任务聚焦、激励反馈、情感语言与场景陪伴，我进一步拆解了四个关键设计决策。',
      ),
    ).toBeVisible();
    expect(container.textContent).not.toMatch(/launched|shipped|上线|提升\s*\d|转化率|留存/iu);
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
    expect(screen.getByText('Bringing companionship into everyday moments')).toBeVisible();
  });

  it('authors the decision narrative in English', () => {
    render(<GrowthBaseCase locale="en" />);

    expect(screen.getByText('Focusing on the task that matters now')).toBeVisible();
    expect(screen.getByText('Make every completion feel acknowledged')).toBeVisible();
    expect(screen.getByText('Respond to the moment, then suggest one small step')).toBeVisible();
  });
});
