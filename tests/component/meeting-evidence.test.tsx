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

  it('lays out the whiteboard section as one browser surface plus three mobile tools', () => {
    render(<MeetingWhiteboardShowcase locale="en" />);

    expect(screen.getByText('One whiteboard rule across desktop and portrait mobile')).toBeVisible();
    expect(screen.getByText('Portrait whiteboard A')).toBeVisible();
    expect(screen.getByText('Portrait whiteboard B')).toBeVisible();
    expect(screen.getByText('Screen-share annotation')).toBeVisible();
  });

  it('uses consistent Chinese whiteboard terminology across orientations', () => {
    const { container } = render(<MeetingWhiteboardShowcase locale="zh" />);
    const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

    expect(screen.getByText('一套白板规则，适配桌面与手机横竖屏')).toBeVisible();
    expect(screen.getByText('白板优先，参会者、常用操作仍然清晰可见')).toBeVisible();
    expect(screen.getByText('退出/进入绘制白板功能前后，均合理利用有限空间')).toBeVisible();
    expect(screen.getByText('不同状态沿用同一套布局规则。')).toBeVisible();
    expect(screen.getByText('共享内容上直接标注')).toBeVisible();
    expect(container).not.toHaveTextContent('画布');
    expect(sources).toEqual([
      '/videos/meeting/meeting-whiteboard-web.mp4',
      '/videos/meeting/meeting-whiteboard-app-1.mp4',
      '/videos/meeting/meeting-whiteboard-app-2.mp4',
      '/videos/meeting/meeting-whiteboard-annotation-app.mp4',
    ]);
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
    expect(screen.getByText('Live captions')).toBeVisible();
    expect(screen.getByText('Live transcript')).toBeVisible();
    expect(screen.getByText('Interpretation setup')).toBeVisible();
    expect(screen.getByText('Interpretation live')).toBeVisible();
  });

  it('uses concise Chinese showcase captions', () => {
    const { container } = render(<MeetingLanguageShowcase locale="zh" />);
    const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

    expect(screen.getByText('三类能力，同一处完成')).toBeVisible();
    expect(screen.getByText('实时字幕')).toBeVisible();
    expect(screen.getByText('字幕由个人按需开启')).toBeVisible();
    expect(screen.getByText('参会者可在会中自行开启，不改变会议级设置。')).toBeVisible();
    expect(screen.getByText('实时转写')).toBeVisible();
    expect(screen.getByText('同声传译·开启')).toBeVisible();
    expect(screen.getByText('同声传译·翻译官角色')).toBeVisible();
    expect(sources).toEqual([
      '/videos/meeting/meeting-captions-app.mp4',
      '/videos/meeting/meeting-transcript-app.mp4',
      '/videos/meeting/meeting-interpretation-on-app.mp4',
      '/videos/meeting/meeting-interpretation-live-app.mp4',
    ]);
  });
});
