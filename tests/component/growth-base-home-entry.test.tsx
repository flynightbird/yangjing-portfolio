import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GrowthBaseHomeEntry } from '@/components/home/growth-base-home-entry';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const copy = {
  company: 'Personal concept',
  kind: 'WeChat Mini Program · Interactive prototype',
  title: 'AI Coach · Emotional IP Companionship',
  proposition:
    'Turn routine health check-ins into a warmer daily relationship through generative character films and restorative feedback.',
  role: 'Independent product and visual design · AI-assisted prototyping',
  action: 'View case study',
};

function renderEntry() {
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(hover: hover) and (pointer: fine)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })));

  return render(<GrowthBaseHomeEntry copy={copy} href="/en/work/growth-base/" />);
}

describe('GrowthBaseHomeEntry', () => {
  it('renders the approved media contract and starts muted', () => {
    const { container } = renderEntry();
    const entry = container.querySelector('[data-project-id="growth-base"]');
    const video = container.querySelector<HTMLVideoElement>('[data-growth-base-home-video]');

    expect(entry).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/videos/growth-base/home-loop.mp4');
    expect(video).toHaveAttribute('poster', '/images/growth-base/home-video-poster.webp');
    expect(video?.muted).toBe(true);
    expect(
      screen.getByRole('link', { name: 'Open AI Coach · Emotional IP Companionship case study' }),
    ).toHaveAttribute('href', '/en/work/growth-base/');
    expect(container.querySelector('[data-media-radius]')).toHaveAttribute(
      'data-media-radius',
      '24',
    );
  });

  it('plays on fine-pointer enter and pauses without resetting progress on leave', () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const { container } = renderEntry();
    const media = container.querySelector<HTMLElement>('[data-growth-base-home-media]');
    const video = container.querySelector<HTMLVideoElement>('[data-growth-base-home-video]');

    Object.defineProperty(video, 'currentTime', { configurable: true, writable: true, value: 4.25 });
    fireEvent.pointerEnter(media as HTMLElement);
    expect(play).toHaveBeenCalledOnce();
    fireEvent.pointerLeave(media as HTMLElement);
    expect(pause).toHaveBeenCalledOnce();
    expect(video?.currentTime).toBe(4.25);
  });

  it('lets the user unmute without changing playback progress', () => {
    const { container } = renderEntry();
    const video = container.querySelector<HTMLVideoElement>('[data-growth-base-home-video]');

    Object.defineProperty(video, 'currentTime', { configurable: true, writable: true, value: 3.5 });
    fireEvent.click(screen.getByRole('button', { name: 'Turn sound on' }));
    expect(video?.muted).toBe(false);
    expect(video?.currentTime).toBe(3.5);
  });
});
