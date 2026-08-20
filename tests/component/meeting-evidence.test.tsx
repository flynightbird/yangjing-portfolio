import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  MeetingAdaptiveStageShowcase,
  MeetingHeroStage,
  MeetingLayoutModeEvidence,
  MeetingLanguageShowcase,
  MeetingWhiteboardToolingDeepDive,
  MeetingPolishShowcase,
  MeetingSystemBreakoutFlow,
  MeetingSystemCollaborationShowcase,
  MeetingSystemLanguageShowcase,
  MeetingSystemWhiteboardShowcase,
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

  it('keeps collaboration reorganization to four static evidence views', () => {
    const { container } = render(<MeetingSystemCollaborationShowcase locale="zh" />);

    expect(container.querySelectorAll('video')).toHaveLength(0);
    expect(container.querySelectorAll('img')).toHaveLength(4);
    expect(container.querySelector('img[src="/images/meeting/layout-mode-whiteboard-editing.png"]')).not.toBeNull();
  });

  it('pairs the whiteboard deep dive with the portrait whiteboard recording', () => {
    const { container } = render(<MeetingWhiteboardToolingDeepDive locale="zh" />);

    expect(screen.getByText('让工具栏被发现')).toBeVisible();
    expect(screen.getByText('把切换压缩到一到两步')).toBeVisible();
    expect(screen.getByText('提供可选的白板颜色')).toBeVisible();
    expect(container.querySelector('video[src="/videos/meeting/meeting-whiteboard-app-1.mp4"]')).toHaveAttribute('data-pause-at-end-ms', '3000');
  });

  it('keeps the system whiteboard evidence as Web and portrait recordings', () => {
    const { container } = render(<MeetingSystemWhiteboardShowcase locale="zh" />);
    const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

    expect(screen.getByText('白板占据主舞台，会议控制仍然可用')).toBeVisible();
    expect(screen.getByText('白板上方保留更多参会者画面，也支持隐藏画面给白板更多的视觉空间')).toBeVisible();
    expect(sources).toEqual([
      '/videos/meeting/meeting-whiteboard-web.mp4',
      '/videos/meeting/meeting-whiteboard-app-1.mp4',
    ]);
  });

  it('groups two caption-feedback recordings under one shared caption', () => {
    const { container } = render(<MeetingSystemLanguageShowcase locale="zh" />);
    const captionFeedback = screen.getByText('字幕反馈');
    const captionFeedbackText = screen.getByText('细化捕捉状态，点击字幕区即可快速设置');

    expect(container.querySelector('video[src="/videos/meeting/meeting-captions-app.mp4"]')).not.toBeNull();
    expect(container.querySelector('video[src="/videos/meeting/meeting-captions-feedback-app.mp4"]')).not.toBeNull();
    expect(captionFeedback).toBeVisible();
    expect(captionFeedbackText).toBeVisible();
    expect(screen.getAllByText('字幕反馈')).toHaveLength(1);
    expect(screen.getAllByText('细化捕捉状态，点击字幕区即可快速设置')).toHaveLength(1);
  });

  it('shows four collaboration states without presenting them as a breakout creation flow', () => {
    const { container } = render(<MeetingLayoutModeEvidence locale="zh" />);
    const images = Array.from(container.querySelectorAll('img')).map((image) => image.getAttribute('src'));

    expect(screen.getByText('常规会议')).toBeVisible();
    expect(screen.getByText('白板开启，未编辑')).toBeVisible();
    expect(screen.getByText('白板编辑中')).toBeVisible();
    expect(screen.getByText('分组讨论')).toBeVisible();
    expect(images).toEqual([
      '/images/meeting/layout-mode-regular.png',
      '/images/meeting/layout-mode-whiteboard-idle.png',
      '/images/meeting/layout-mode-whiteboard-editing.png',
      '/images/meeting/layout-mode-breakout.png',
    ]);
  });

  it('uses the shipped Breakout Room entry without placeholder screens', () => {
    const { container } = render(<MeetingSystemBreakoutFlow locale="zh" />);

    expect(screen.getByText('分组讨论：成员关系进入当前会议')).toBeVisible();
    expect(screen.getByText('已上线：从会中应用菜单进入分组讨论')).toBeVisible();
    expect(container.querySelector('img[src="/images/meeting/capability-system.webp"]')).not.toBeNull();
    expect(container).not.toHaveTextContent(/页面待补|进入我的小组|回到主会场/);
    expect(container.querySelector('[class*="placeholderPhone"]')).toBeNull();
  });

  it('keeps whiteboard tooling decisions beside the portrait recording', () => {
    const { container } = render(<MeetingWhiteboardToolingDeepDive locale="zh" />);

    expect(screen.getByText('让工具栏被发现')).toBeVisible();
    expect(screen.getByText('把切换压缩到一到两步')).toBeVisible();
    expect(screen.getByText('提供可选的白板颜色')).toBeVisible();
    expect(container.querySelector('video[src="/videos/meeting/meeting-whiteboard-app-1.mp4"]')).toHaveAttribute('data-pause-at-end-ms', '3000');
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

  it('groups chat behavior separately from other controls in the polish section', () => {
    const { container } = render(<MeetingPolishShowcase locale="en" />);
    const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

    expect(screen.getByText('Chat')).toBeVisible();
    expect(screen.getByText('Private chat and length feedback keep messaging usable inside the room')).toBeVisible();
    expect(screen.getByText('Hidden actions extend chat beyond the default compose state')).toBeVisible();
    expect(screen.getByText('Personal & meeting controls')).toBeVisible();
    expect(screen.getByText('Camera polish')).toBeVisible();
    expect(screen.getByText('Member and safety')).toBeVisible();
    expect(sources).toEqual([
      '/videos/meeting/meeting-chat-1-app.mp4',
      '/videos/meeting/meeting-chat-2-app.mp4',
      '/videos/meeting/meeting-beauty-app.mp4',
      '/videos/meeting/meeting-safety-app.mp4',
    ]);
  });

  it('renders the popup details as four equal inline proofs without a framed board shell', () => {
    const { container } = render(<MeetingPolishShowcase locale="en" />);
    const strip = container.querySelector('[data-meeting-popup-expression]');
    const cards = container.querySelectorAll('[data-meeting-popup-card]');
    const mainCard = container.querySelector('[data-meeting-popup-role="main"]');
    const supportCards = container.querySelectorAll('[data-meeting-popup-role="support"]');
    const guide = container.querySelector('[data-meeting-popup-guides]');
    const images = Array.from(container.querySelectorAll('[data-meeting-popup-card] img')).map((image) =>
      image.getAttribute('src'),
    );

    expect(strip).not.toBeNull();
    expect(cards).toHaveLength(4);
    expect(mainCard).toBeNull();
    expect(supportCards).toHaveLength(0);
    expect(guide).not.toBeNull();
    expect(images).toEqual([
      '/images/meeting/meeting-popup-groups.png',
      '/images/meeting/meeting-popup-host.png',
      '/images/meeting/meeting-popup-camera.png',
      '/images/meeting/meeting-popup-microphone.png',
    ]);
  });
});
