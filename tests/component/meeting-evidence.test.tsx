import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  MeetingAdaptiveStageShowcase,
  MeetingHeroStage,
  MeetingLanguageShowcase,
  MeetingWhiteboardShowcase,
} from '@/components/meeting/meeting-showcase';

afterEach(cleanup);

describe('Meeting showcase media', () => {
  it('renders the hero as a shared Web + App stage with one replay control', () => {
    const { container } = render(<MeetingHeroStage locale="en" />);
    const videos = Array.from(container.querySelectorAll('video'));

    expect(screen.getByRole('button', { name: 'Replay' })).toBeVisible();
    expect(screen.getByText('Agora Meeting')).toBeVisible();
    expect(videos).toHaveLength(2);
    expect(videos.every((video) => video.muted)).toBe(true);
  });

  it('lays out the whiteboard section as one browser surface plus two portrait phones', () => {
    render(<MeetingWhiteboardShowcase locale="en" />);

    expect(screen.getByText('One whiteboard rule across desktop and portrait mobile')).toBeVisible();
    expect(screen.getByText('Portrait whiteboard A')).toBeVisible();
    expect(screen.getByText('Portrait whiteboard B')).toBeVisible();
  });

  it('uses consistent Chinese whiteboard terminology across orientations', () => {
    const { container } = render(<MeetingWhiteboardShowcase locale="zh" />);

    expect(screen.getByText('一套白板规则，适配桌面与手机横竖屏')).toBeVisible();
    expect(container).not.toHaveTextContent('画布');
  });

  it('compares landscape and portrait viewports inside the adaptive stage story', () => {
    const { container } = render(<MeetingAdaptiveStageShowcase locale="zh" />);
    const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

    expect(screen.getByText('方向改变，信息优先级不变')).toBeVisible();
    expect(screen.getByText('横屏视窗')).toBeVisible();
    expect(screen.getByText('竖屏视窗')).toBeVisible();
    expect(sources).toEqual(expect.arrayContaining([
      '/videos/meeting/meeting-stage-landscape-app.mp4',
      '/videos/meeting/meeting-stage-portrait-app.mp4',
    ]));
  });

  it('keeps the language layer inside portrait mobile recordings', () => {
    render(<MeetingLanguageShowcase locale="en" />);

    expect(screen.getByText('Real-time language support lives inside the meeting, not outside it')).toBeVisible();
    expect(screen.getByText('Live transcript')).toBeVisible();
    expect(screen.getByText('Interpretation setup')).toBeVisible();
    expect(screen.getByText('Interpretation live')).toBeVisible();
  });

  it('uses concise Chinese showcase captions', () => {
    render(<MeetingLanguageShowcase locale="zh" />);

    expect(screen.getByText('三类能力，同一处完成')).toBeVisible();
    expect(screen.getByText('实时转写')).toBeVisible();
    expect(screen.getByText('同声传译·开启')).toBeVisible();
    expect(screen.getByText('同声传译·翻译官角色')).toBeVisible();
  });
});
