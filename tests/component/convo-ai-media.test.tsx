import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CompleteConvoAiVideo, ConvoAiAppShowcase, ConvoAiPlaylist, ConvoAiStage } from '@/components/convo-ai/convo-ai-media';

class IntersectionObserverHarness {
  static instances: IntersectionObserverHarness[] = [];
  readonly observe = vi.fn((element: Element) => { this.elements.push(element); });
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly elements: Element[] = [];

  constructor(readonly callback: IntersectionObserverCallback, readonly options?: IntersectionObserverInit) {
    IntersectionObserverHarness.instances.push(this);
  }

  trigger(id: string) {
    const target = this.elements.find((element) => element.getAttribute('data-app-showcase-step') === id);
    if (!target) throw new Error(`Unknown observed step: ${id}`);
    this.callback([{ target, isIntersecting: true, boundingClientRect: target.getBoundingClientRect(), intersectionRatio: 1, intersectionRect: target.getBoundingClientRect(), rootBounds: null, time: 0 } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function installMediaEnvironment({ desktop: initialDesktop = true, reducedMotion: initialReducedMotion = false, intersectionObserver = true } = {}) {
  let desktop = initialDesktop;
  let reducedMotion = initialReducedMotion;
  const listeners = new Map<string, Set<(event: MediaQueryListEvent) => void>>();
  vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
    matches: query === '(min-width: 801px)' ? desktop : query === '(prefers-reduced-motion: reduce)' ? reducedMotion : false,
    media: query,
    onchange: null,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      const queryListeners = listeners.get(query) ?? new Set();
      queryListeners.add(listener);
      listeners.set(query, queryListeners);
    },
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.get(query)?.delete(listener),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
  IntersectionObserverHarness.instances = [];
  if (intersectionObserver) vi.stubGlobal('IntersectionObserver', IntersectionObserverHarness);
  else vi.stubGlobal('IntersectionObserver', undefined);
  return {
    setDesktop(next: boolean) {
      desktop = next;
      listeners.get('(min-width: 801px)')?.forEach((listener) => listener({ matches: next, media: '(min-width: 801px)' } as MediaQueryListEvent));
    },
    setReducedMotion(next: boolean) {
      reducedMotion = next;
      listeners.get('(prefers-reduced-motion: reduce)')?.forEach((listener) => listener({ matches: next, media: '(prefers-reduced-motion: reduce)' } as MediaQueryListEvent));
    },
  };
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
});

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

describe('ConvoAiAppShowcase', () => {
  it('observes all App scenes with the intended desktop activation band', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="zh" />);
    const observer = IntersectionObserverHarness.instances[0];

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-login');
    expect(observer.options).toMatchObject({ rootMargin: '-42% 0px -57% 0px', threshold: 0 });
    expect(observer.observe).toHaveBeenCalledTimes(4);
    expect(observer.elements.map((element) => element.getAttribute('data-app-showcase-step'))).toEqual([
      'app-login', 'app-structure', 'app-profile-settings', 'app-hardware-device',
    ]);
    expect(screen.getByText('登录与进入')).toBeVisible();
    expect(screen.getByText('用短入口建立产品身份和移动端旅程起点。')).toBeVisible();
  });

  it('uses semantic scenes and describes each button with its adjacent summary', () => {
    installMediaEnvironment();
    render(<ConvoAiAppShowcase locale="zh" />);
    const button = screen.getByRole('button', { name: '登录与进入' });
    const descriptionId = button.getAttribute('aria-describedby');

    expect(screen.getByRole('list', { name: 'App 产品场景' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(button.querySelector('p')).toBeNull();
    expect(descriptionId).toBeTruthy();
    expect(document.getElementById(descriptionId ?? '')).toHaveTextContent('用短入口建立产品身份和移动端旅程起点。');
  });

  it('hands media to an observer-selected scene and resets the prior video exactly once in StrictMode', () => {
    installMediaEnvironment();
    const { container } = render(<StrictMode><ConvoAiAppShowcase locale="zh" /></StrictMode>);
    const initialVideo = container.querySelector('video[aria-label="App 登录与进入"]') as HTMLVideoElement;
    const pause = vi.spyOn(initialVideo, 'pause');
    Object.defineProperty(initialVideo, 'currentTime', { value: 8, writable: true, configurable: true });

    act(() => { IntersectionObserverHarness.instances.at(-1)?.trigger('app-profile-settings'); });

    expect(pause).toHaveBeenCalledOnce();
    expect(initialVideo.currentTime).toBe(0);
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-profile-settings');
    const current = container.querySelector('video[aria-label="个人设置"]') as HTMLVideoElement;
    expect(current).toHaveAttribute('src', '/videos/convo-ai/app-profile-settings.mp4');
    expect(current).toHaveAttribute('loop');
    expect((current as HTMLVideoElement).muted).toBe(true);
    expect(current).toHaveAttribute('autoplay');
  });

  it('uses the shared fixed phone shell for every active App scene', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = IntersectionObserverHarness.instances[0];
    const sceneIds = ['app-login', 'app-structure', 'app-profile-settings', 'app-hardware-device'] as const;
    const initialCard = container.querySelector('[data-app-showcase-placement="desktop"][data-media-card="app-login"]') as HTMLElement;
    const cardClass = initialCard.className;
    const phoneShellClass = initialCard.firstElementChild?.className;

    expect(initialCard.firstElementChild).not.toHaveAttribute('style');

    sceneIds.forEach((id) => {
      act(() => { observer.trigger(id); });
      const card = container.querySelector(`[data-app-showcase-placement="desktop"][data-media-card="${id}"]`) as HTMLElement;

      expect(card).toHaveClass(cardClass);
      expect(card.firstElementChild).toHaveClass(phoneShellClass ?? '');
      expect(card.firstElementChild).not.toHaveAttribute('style');
      expect(card.firstElementChild?.querySelector('video')).toBeInTheDocument();
    });
  });

  it('keeps both placement shells stable while a media-query change moves the single video', () => {
    const media = installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const desktopCard = container.querySelector('[data-app-showcase-placement="desktop"]') as HTMLElement;
    const mobileCard = container.querySelector('[data-app-showcase-placement="mobile"]') as HTMLElement;
    const desktopShellClass = desktopCard.firstElementChild?.className;
    const mobileShellClass = mobileCard.firstElementChild?.className;

    expect(desktopCard).toBeInTheDocument();
    expect(mobileCard).toBeInTheDocument();
    expect(container.querySelectorAll('[data-convo-ai-video="true"]')).toHaveLength(1);
    expect(desktopCard.querySelector('video')).toBeInTheDocument();
    expect(mobileCard.querySelector('img[alt=""]')).toBeInTheDocument();

    act(() => { media.setDesktop(false); });

    expect(container.querySelector('[data-app-showcase-placement="desktop"]')).toBe(desktopCard);
    expect(container.querySelector('[data-app-showcase-placement="mobile"]')).toBe(mobileCard);
    expect(desktopCard.firstElementChild).toHaveClass(desktopShellClass ?? '');
    expect(mobileCard.firstElementChild).toHaveClass(mobileShellClass ?? '');
    expect(container.querySelectorAll('[data-convo-ai-video="true"]')).toHaveLength(1);
    expect(desktopCard.querySelector('img[alt=""]')).toBeInTheDocument();
    expect(mobileCard.querySelector('video')).toBeInTheDocument();
  });

  it('accepts reverse observer activation without inferring scroll direction', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = IntersectionObserverHarness.instances[0];

    act(() => { observer.trigger('app-profile-settings'); });
    act(() => { observer.trigger('app-structure'); });

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
    expect(container.querySelector('[data-app-showcase-step="app-structure"]')).toHaveAttribute('data-active', 'true');
    expect(container.querySelector('[data-app-showcase-step="app-profile-settings"]')).toHaveAttribute('data-active', 'false');
  });

  it('uses desktop buttons as scroll commands until the observer selects a scene', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    const scrollIntoView = vi.fn();
    structure.scrollIntoView = scrollIntoView;

    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-login');
    act(() => { IntersectionObserverHarness.instances[0].trigger('app-structure'); });
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
  });

  it('does not autoplay and uses instant navigation when reduced motion is preferred', () => {
    installMediaEnvironment({ reducedMotion: true });
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    const scrollIntoView = vi.fn();
    structure.scrollIntoView = scrollIntoView;

    expect(container.querySelector('video[aria-label="App entry and sign in"]')).not.toHaveAttribute('autoplay');
    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
  });

  it('starts the initial video when autoplay becomes allowed without remounting it', () => {
    const media = installMediaEnvironment({ reducedMotion: true });
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const video = container.querySelector('video[aria-label="App entry and sign in"]') as HTMLVideoElement;
    const play = vi.spyOn(video, 'play').mockResolvedValue(undefined);

    expect(video).not.toHaveAttribute('autoplay');
    expect(play).not.toHaveBeenCalled();
    act(() => { media.setReducedMotion(false); });

    expect(container.querySelector('video[aria-label="App entry and sign in"]')).toBe(video);
    expect(video).toHaveAttribute('autoplay');
    expect(play).toHaveBeenCalledOnce();
  });

  it('keeps mobile media inline, activates by click, and mounts one video', () => {
    installMediaEnvironment({ desktop: false });
    const { container } = render(<ConvoAiAppShowcase locale="zh" />);

    expect(IntersectionObserverHarness.instances).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: /硬件设备/i }));

    const hardware = container.querySelector('[data-app-showcase-step="app-hardware-device"]') as HTMLElement;
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-hardware-device');
    expect(hardware.querySelector('[data-media-card="app-hardware-device"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-convo-ai-video="true"]')).toHaveLength(1);
  });

  it('disconnects its observer when the showcase unmounts', () => {
    installMediaEnvironment();
    const { unmount } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = IntersectionObserverHarness.instances[0];

    unmount();

    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
