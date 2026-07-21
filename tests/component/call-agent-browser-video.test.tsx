import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CallAgentBrowserVideo } from '@/components/call-agent/call-agent-browser-video';

let observerCallback: IntersectionObserverCallback;

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) { observerCallback = callback; }
    observe = vi.fn();
    disconnect = vi.fn();
    unobserve = vi.fn();
    takeRecords = vi.fn(() => []);
    root = null;
    rootMargin = '';
    thresholds = [];
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const props = {
  src: '/videos/call-agent/agent-preview.mp4',
  poster: '/images/call-agent/agent-preview-poster.webp',
  playbackRate: 1.25,
  title: 'Live Preview',
  description: 'Preview connects beside configuration.',
};

describe('CallAgentBrowserVideo', () => {
  it('renders one browser boundary and complete media semantics', () => {
    const { container } = render(<CallAgentBrowserVideo {...props} />);
    const video = container.querySelector('video');
    expect(container.querySelector('[data-call-agent-browser]')).toBeInTheDocument();
    expect(container.querySelector('[data-call-agent-browser]')).toHaveAttribute('data-media-kind', 'video');
    expect(container.querySelector('[data-call-agent-video-viewport]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-browser-dot]')).toHaveLength(3);
    expect(video).toHaveAttribute('src', props.src);
    expect(video).toHaveAttribute('poster', props.poster);
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveProperty('muted', true);
    expect(screen.getByText(props.description)).toBeVisible();
  });

  it('sets playback rate and only plays while active and visible', async () => {
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    const pause = vi.mocked(HTMLMediaElement.prototype.pause);
    const { container, rerender } = render(<CallAgentBrowserVideo {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;
    fireEvent.loadedMetadata(video);
    expect(video.playbackRate).toBe(1.25);
    expect(video.defaultPlaybackRate).toBe(1.25);

    await act(async () => observerCallback([{ target: video, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver));
    expect(play).toHaveBeenCalled();

    rerender(<CallAgentBrowserVideo {...props} active={false} />);
    expect(pause).toHaveBeenCalled();
  });

  it('applies playback rate even when metadata loaded before hydration', () => {
    const { container } = render(<CallAgentBrowserVideo {...props} />);
    const video = container.querySelector('video') as HTMLVideoElement;

    expect(video.playbackRate).toBe(1.25);
    expect(video.defaultPlaybackRate).toBe(1.25);
  });

  it('uses only the poster when reduced motion is requested', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    const { container } = render(<CallAgentBrowserVideo {...props} />);
    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: props.title })).toHaveAttribute('src', props.poster);
  });
});
