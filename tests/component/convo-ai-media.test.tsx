import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompleteConvoAiVideo, ConvoAiPlaylist, ConvoAiStage } from '@/components/convo-ai/convo-ai-media';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
beforeEach(() => { vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined); });

describe('ConvoAiPlaylist', () => {
  it('renders one stable complete player and switches evidence by explicit command', () => {
    render(<ConvoAiPlaylist ids={['app-login', 'app-structure']} locale="en" />);
    const video = screen.getByLabelText('App entry and sign in');
    expect(video.closest('figure')).toHaveAttribute('data-platform', 'app');
    expect(video).toHaveAttribute('src', '/videos/convo-ai/app-login.mp4');
    expect(video).toHaveAttribute('poster', '/images/convo-ai/posters/app-login.webp');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).not.toHaveAttribute('autoplay');
    expect(video).not.toHaveAttribute('loop');
    expect(screen.getAllByText('00:03.200').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));
    expect(screen.getByLabelText('Product structure')).toHaveAttribute(
      'src',
      '/videos/convo-ai/app-structure.mp4',
    );
  });

  it('pauses other ConvoAI media and restores a forced playback rate', () => {
    render(<ConvoAiPlaylist ids={['app-login']} locale="en" />);
    const current = screen.getByLabelText('App entry and sign in') as HTMLVideoElement;
    const other = document.createElement('video');
    other.dataset.convoAiVideo = 'true';
    other.pause = vi.fn();
    document.body.append(other);

    fireEvent.play(current);
    expect(other.pause).toHaveBeenCalled();
    Object.defineProperty(current, 'playbackRate', { value: 1.5, writable: true });
    fireEvent.rateChange(current);
    expect(current.playbackRate).toBe(1);
    other.remove();
  });

  it('localizes CPDI labels for Chinese evidence', () => {
    render(<ConvoAiPlaylist ids={['app-caption-camera']} locale="zh" />);

    expect(screen.getByText('场景')).toBeInTheDocument();
    expect(screen.getByText('问题')).toBeInTheDocument();
    expect(screen.getByText('设计')).toBeInTheDocument();
    expect(screen.getByText('作用')).toBeInTheDocument();
    expect(screen.queryByText('context')).not.toBeInTheDocument();
  });

  it('clears an error before reloading the active video', () => {
    render(<ConvoAiPlaylist ids={['app-login']} locale="en" />);
    const video = screen.getByLabelText('App entry and sign in') as HTMLVideoElement;
    const load = vi.spyOn(video, 'load').mockImplementation(() => undefined);

    fireEvent.error(video);
    expect(screen.getByRole('status')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

    expect(load).toHaveBeenCalledOnce();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('clears an error after the active video successfully loads', () => {
    render(<ConvoAiPlaylist ids={['app-login']} locale="en" />);
    const video = screen.getByLabelText('App entry and sign in');

    fireEvent.error(video);
    expect(screen.getByRole('status')).toBeVisible();
    fireEvent.loadedData(video);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('CompleteConvoAiVideo', () => {
  it('preserves complete Chinese playback options and rate enforcement', () => {
    render(<CompleteConvoAiVideo id="app-login" locale="zh" autoPlay loop muted />);
    const video = screen.getByLabelText('App 登录与进入') as HTMLVideoElement;

    expect(video).toHaveAttribute('src', '/videos/convo-ai/app-login.mp4');
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('loop');
    expect(video.muted).toBe(true);
    Object.defineProperty(video, 'playbackRate', { value: 1.5, writable: true });
    fireEvent.rateChange(video);
    expect(video.playbackRate).toBe(1);
  });

  it('pauses other marked media by default', () => {
    render(<><CompleteConvoAiVideo id="app-login" locale="en" /><video data-convo-ai-video="true" /></>);
    const current = screen.getByLabelText('App entry and sign in');
    const other = document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')[1];
    other.pause = vi.fn();

    fireEvent.play(current);

    expect(other.pause).toHaveBeenCalledOnce();
  });

  it('does not pause other marked media when exclusivity is disabled', () => {
    render(<><CompleteConvoAiVideo id="app-login" locale="en" exclusive={false} /><video data-convo-ai-video="true" /></>);
    const current = screen.getByLabelText('App entry and sign in');
    const other = document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')[1];
    other.pause = vi.fn();

    fireEvent.play(current);

    expect(other.pause).not.toHaveBeenCalled();
  });
});

describe('ConvoAiStage', () => {
  it('layers Web and App evidence and activates only the selected platform', () => {
    const { container } = render(
      <ConvoAiStage
        locale="en"
        eyebrow="Agora / shipped product"
        title="ConvoAI"
        description="A live AI conversation system."
        webId="web-join-exit"
        appId="app-conversation-start"
      />,
    );

    expect(container.querySelector('[data-convo-ai-stage]')).toBeVisible();
    expect(container.querySelector('[data-convo-web-plane]')).toBeVisible();
    expect(container.querySelector('[data-convo-app-device]')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Focus App recording' }));
    expect(container.querySelector('[data-convo-ai-stage]')).toHaveAttribute('data-active-platform', 'app');
    expect(container.querySelector('[data-convo-web-plane] video')).toBeNull();
    expect(container.querySelector('[data-convo-app-device] video')).toBeInTheDocument();
  });
});
