import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { GrowthBaseCase } from '@/components/growth-base/growth-base-case';

afterEach(cleanup);

describe('GrowthBaseCase', () => {
  it('presents one overview followed by four design decisions', () => {
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
    ]);
    expect(
      screen.getByText('互动式、更立体、更亲近的陪伴，更贴近用户的心灵'),
    ).toBeVisible();
    expect(screen.getByText('聚焦当下最重要的任务')).toBeVisible();
    expect(screen.getByText('让每次完成，都得到及时回应')).toBeVisible();
    expect(screen.getByText('先回应此刻，再给出一步建议')).toBeVisible();
    expect(screen.getByText('让陪伴进入一天中的不同场景')).toBeVisible();
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

  it('turns completion into sequential points and a manually claimed prop', () => {
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

    fireEvent.click(screen.getByRole('button', { name: '领取静心帐篷' }));

    expect(container.querySelector('[data-tent-demo]')).toHaveAttribute('data-state', 'claimed');
    expect(screen.getByText('静心帐篷已放入营地')).toBeVisible();
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
      screen.getByText('“早上好，Maggie。先喝杯水，让今天慢慢开始吧。”'),
    ).toBeVisible();
    expect(
      screen.getByText('“夜深了，Maggie。今天先到这里，做一段轻柔拉伸，再安心休息吧。”'),
    ).toBeVisible();
  });

  it('groups four independent films into two editorial shells', () => {
    const { container } = render(<GrowthBaseCase locale="en" />);

    expect(container.querySelectorAll('[data-film-shell]')).toHaveLength(2);
    expect(screen.getAllByTestId('growth-base-film')).toHaveLength(4);
    expect(container.querySelectorAll('[data-film-shell] video')).toHaveLength(4);
    expect(container.querySelectorAll('[data-film-caption="bottom"]')).toHaveLength(4);
    expect(container.querySelectorAll('[data-watermark-mask="top-left"]')).toHaveLength(4);
    expect(screen.getByText('Bringing companionship into everyday moments')).toBeVisible();
  });

  it('authors the decision narrative in English', () => {
    render(<GrowthBaseCase locale="en" />);

    expect(screen.getByText('Focusing on the task that matters now')).toBeVisible();
    expect(screen.getByText('Make every completion feel acknowledged')).toBeVisible();
    expect(screen.getByText('Respond to the moment, then suggest one small step')).toBeVisible();
  });
});
