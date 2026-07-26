import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConvoAiAppShowcase, ConvoAiAvatarPair, ConvoAiConversationStart, ConvoAiPlaylist, ConvoAiStage, ConvoAiVoiceprintModes } from '@/components/convo-ai/convo-ai-media';
import { ConvoAiViewportVideo } from '@/components/convo-ai/convo-ai-video';

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
    this.callback(this.elements.map((element) => {
      const bounds = element.getBoundingClientRect();
      const isIntersecting = element === target;
      return { target: element, isIntersecting, boundingClientRect: bounds, intersectionRatio: isIntersecting ? 1 : 0, intersectionRect: bounds, rootBounds: null, time: 0 } as IntersectionObserverEntry;
    }), this as unknown as IntersectionObserver);
  }

  triggerAtActivationLine(entries: readonly { readonly id: string; readonly top: number }[]) {
    const rootBounds = { top: 378, bottom: 387 } as DOMRectReadOnly;
    this.callback(entries.map(({ id, top }) => {
      const target = this.elements.find((element) => element.getAttribute('data-app-showcase-step') === id);
      if (!target) throw new Error(`Unknown observed step: ${id}`);
      const bounds = { top } as DOMRectReadOnly;
      return { target, isIntersecting: true, boundingClientRect: bounds, intersectionRatio: 1, intersectionRect: bounds, rootBounds, time: 0 } as IntersectionObserverEntry;
    }), this as unknown as IntersectionObserver);
  }

  triggerElement(target: Element, intersectionRatio: number) {
    const bounds = target.getBoundingClientRect();
    this.callback([{
      target,
      isIntersecting: intersectionRatio >= 0.25,
      intersectionRatio,
      boundingClientRect: bounds,
      intersectionRect: bounds,
      rootBounds: null,
      time: 0,
    } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

function appShowcaseObserver() {
  const observer = IntersectionObserverHarness.instances.find((instance) => (
    instance.elements.some((element) => element.hasAttribute('data-app-showcase-step'))
  ));
  if (!observer) throw new Error('App showcase observer was not registered');
  return observer;
}

function videoObservers() {
  return IntersectionObserverHarness.instances.filter((observer) => (
    observer.elements.some((element) => element.tagName === 'VIDEO')
  ));
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

describe('ConvoAiViewportVideo', () => {
  it('plays at 25% visibility and pauses below the threshold', () => {
    installMediaEnvironment();
    render(<ConvoAiViewportVideo id="app-login" locale="zh" />);
    const video = screen.getByLabelText('App 登录与进入') as HTMLVideoElement;
    const observer = IntersectionObserverHarness.instances.at(-1)!;

    act(() => observer.triggerElement(video, 0.25));
    expect(video.play).toHaveBeenCalled();

    act(() => observer.triggerElement(video, 0));
    expect(video.pause).toHaveBeenCalled();
    expect(video).not.toHaveAttribute('controls');
    expect(video).toHaveAttribute('loop');
    expect(video.muted).toBe(true);
  });

  it('keeps a static poster under reduced motion', () => {
    installMediaEnvironment({ reducedMotion: true });
    render(<ConvoAiViewportVideo id="app-login" locale="zh" />);
    const video = screen.getByLabelText('App 登录与进入') as HTMLVideoElement;

    expect(IntersectionObserverHarness.instances).toHaveLength(0);
    expect(video.play).not.toHaveBeenCalled();
    expect(video.pause).toHaveBeenCalled();
  });

  it('renders sound control only for audio media and mutes other videos', () => {
    installMediaEnvironment();
    const { rerender } = render(<ConvoAiViewportVideo id="app-login" locale="zh" />);
    const first = screen.getByLabelText('App 登录与进入') as HTMLVideoElement;
    const other = document.createElement('video');
    other.dataset.convoAiVideo = 'true';
    other.muted = false;
    document.body.append(other);

    fireEvent.click(screen.getByRole('button', { name: '开启声音' }));
    expect(first.muted).toBe(false);
    expect(other.muted).toBe(true);
    expect(screen.getByRole('button', { name: '关闭声音' })).toHaveAttribute('aria-pressed', 'true');

    rerender(<ConvoAiViewportVideo id="web-login" locale="zh" />);
    expect(screen.queryByRole('button', { name: '开启声音' })).toBeNull();
    other.remove();
  });

  it('updates the previous sound button when another video is unmuted', () => {
    installMediaEnvironment();
    render(<><ConvoAiViewportVideo id="app-login" locale="zh" /><ConvoAiViewportVideo id="app-structure" locale="zh" /></>);
    const soundButtons = screen.getAllByRole('button', { name: '开启声音' });

    fireEvent.click(soundButtons[0]);
    expect(soundButtons[0]).toHaveAccessibleName('关闭声音');

    fireEvent.click(soundButtons[1]);
    expect(soundButtons[0]).toHaveAccessibleName('开启声音');
    expect(soundButtons[1]).toHaveAccessibleName('关闭声音');
  });
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
    expect(video).toHaveAttribute('loop');
    expect(video).not.toHaveAttribute('controls');
    expect((video as HTMLVideoElement).muted).toBe(true);
    expect(screen.getAllByText('00:03.200').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));
    expect(screen.getByLabelText('Product structure')).toHaveAttribute(
      'src',
      '/videos/convo-ai/app-structure.mp4',
    );
  });

  it('moves through evidence with labelled arrows and wraps at both ends', () => {
    const { container } = render(<ConvoAiPlaylist ids={['app-login', 'app-structure']} locale="en" />);

    expect(container.querySelector('[data-carousel-position]')).toHaveTextContent('01 / 02');
    fireEvent.click(screen.getByRole('button', { name: 'Next recording' }));
    expect(screen.getByLabelText('Product structure')).toBeVisible();
    expect(container.querySelector('[data-carousel-position]')).toHaveTextContent('02 / 02');
    fireEvent.click(screen.getByRole('button', { name: 'Next recording' }));
    expect(screen.getByLabelText('App entry and sign in')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Previous recording' }));
    expect(screen.getByLabelText('Product structure')).toBeVisible();
    expect(container.querySelectorAll('[data-convo-ai-playlist] video')).toHaveLength(1);
  });

  it('renders a single recording as a stable evidence stage without carousel controls', () => {
    const { container } = render(<ConvoAiPlaylist ids={['web-realtime-data']} locale="en" />);

    expect(screen.getByLabelText('Real-time observability')).toHaveAttribute(
      'src',
      '/videos/convo-ai/web-realtime-data.mp4',
    );
    expect(container.querySelector('[data-carousel-position]')).not.toBeInTheDocument();
    expect(container.querySelector('[aria-label="Scene list"]')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous recording' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next recording' })).not.toBeInTheDocument();
  });

  it('does not pause other ConvoAI media and restores a forced playback rate', () => {
    render(<ConvoAiPlaylist ids={['app-login']} locale="en" />);
    const current = screen.getByLabelText('App entry and sign in') as HTMLVideoElement;
    const other = document.createElement('video');
    other.dataset.convoAiVideo = 'true';
    other.pause = vi.fn();
    document.body.append(other);

    fireEvent.play(current);
    expect(other.pause).not.toHaveBeenCalled();
    Object.defineProperty(current, 'playbackRate', { value: 1.5, writable: true });
    fireEvent.rateChange(current);
    expect(current.playbackRate).toBe(1);
    other.remove();
  });

  it('renders scene navigation outside the descriptive media surface', () => {
    const { container } = render(<ConvoAiPlaylist ids={['app-login', 'app-structure']} locale="zh" />);
    const surface = container.querySelector('[data-playlist-surface]')!;
    const navigation = container.querySelector('[data-playlist-navigation]')!;

    expect(surface).not.toContainElement(navigation);
    expect(navigation).toHaveAccessibleName('场景列表');
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

describe('ConvoAiConversationStart', () => {
  it('keeps App and Web visible while Web steps change independently', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiConversationStart locale="zh" />);

    expect(container.querySelector('[data-convo-start-stage]')).toBeVisible();
    expect(container.querySelector('[data-convo-start-app]')).toBeVisible();
    expect(container.querySelector('[data-convo-start-web]')).toBeVisible();
    expect(screen.getByLabelText('启动对话')).toHaveAttribute('src', '/videos/convo-ai/app-conversation-start.mp4');
    expect(screen.getByLabelText('Web 登录与进入')).toHaveAttribute('src', '/videos/convo-ai/web-login.mp4');
    expect(screen.getByRole('navigation', { name: 'Web 启动路径' })).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /启动前 Agent 布局/ }));
    expect(screen.getByLabelText('启动对话')).toBeInTheDocument();
    expect(screen.getByLabelText('启动前 Agent 布局')).toHaveAttribute('src', '/videos/convo-ai/web-preflight-layout.mp4');
  });

  it('keeps Web path navigation outside the active description surface', () => {
    const { container } = render(<ConvoAiConversationStart locale="zh" />);
    const detail = container.querySelector('[data-convo-start-detail]')!;
    const navigation = container.querySelector('[data-convo-start-navigation]')!;

    expect(detail).not.toContainElement(navigation);
  });
});

describe('ConvoAiVoiceprintModes', () => {
  it('exposes three modes and changes the expanded slice by explicit command', () => {
    const { container } = render(<ConvoAiVoiceprintModes locale="zh" />);
    const accordion = container.querySelector('[data-convo-voiceprint-modes]');

    expect(accordion).toBeVisible();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Seamless/ })).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: /Personalized/ }));
    expect(screen.getByRole('button', { name: /Personalized/ })).toHaveAttribute('aria-expanded', 'true');
    expect(accordion).toHaveAttribute('data-active-mode', 'personalized');
  });
});

describe('ConvoAiStage', () => {
  it('layers two playing surfaces and changes visual focus without removing either video', () => {
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
    expect(container.querySelector('[data-convo-web-plane] video')).toBeInTheDocument();
    expect(container.querySelector('[data-convo-app-device] video')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
    expect(
      screen.getByRole('heading', { level: 3, name: 'ConvoAI' }),
    ).toHaveAttribute('data-stage-semantic-title');
    expect(container.querySelector('[data-stage-display-title]')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Focus App recording' }));
    expect(container.querySelector('[data-convo-ai-stage]')).toHaveAttribute('data-active-platform', 'app');
    expect(container.querySelector('[data-convo-web-plane] video')).toBeInTheDocument();
    expect(container.querySelector('[data-convo-app-device] video')).toBeInTheDocument();
  });

  it('uses the shared project heading role only for the hero stage', () => {
    const { container } = render(
      <ConvoAiStage
        locale="en"
        eyebrow="Agora / shipped product"
        title="ConvoAI"
        description="A live AI conversation system."
        webId="web-join-exit"
        appId="app-conversation-start"
        hero
      />,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: 'ConvoAI' }),
    ).toHaveAttribute('data-stage-semantic-title');
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull();
    expect(container.querySelectorAll('[data-stage-display-title]')).toHaveLength(
      1,
    );
  });
});

describe('ConvoAiAvatarPair', () => {
  it('renders the two complete avatar recordings in selection-to-interaction order', () => {
    const { container } = render(<ConvoAiAvatarPair locale="zh" />);
    const items = [...container.querySelectorAll<HTMLElement>('[data-convo-ai-avatar]')];
    const videos = [...container.querySelectorAll<HTMLVideoElement>('video')];

    expect(items.map((item) => item.dataset.convoAiAvatar)).toEqual(['app-avatar-select', 'app-avatar-interaction']);
    expect(videos.map((video) => video.getAttribute('src'))).toEqual([
      '/videos/convo-ai/app-avatar-select.mp4',
      '/videos/convo-ai/app-avatar-interaction.mp4',
    ]);
    expect(videos).toHaveLength(2);
    videos.forEach((video) => {
      expect(video).not.toHaveAttribute('controls');
      expect(video).toHaveAttribute('loop');
      expect(video.muted).toBe(true);
    });
    expect(screen.getByText('选择数字人')).toBeVisible();
    expect(screen.getByText('数字人互动')).toBeVisible();
    expect(screen.getByText('完整呈现数字人选择过程。')).toBeVisible();
    expect(screen.getByText('完整呈现数字人连接、对话与摄像头过程。')).toBeVisible();
  });

  it('allows either avatar recording to play without pausing the other', () => {
    installMediaEnvironment({ reducedMotion: false });
    const { container } = render(<ConvoAiAvatarPair locale="en" />);
    const videos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    const secondPause = vi.spyOn(videos[1], 'pause');

    fireEvent.play(videos[0]);

    expect(secondPause).not.toHaveBeenCalled();
  });

  it('observes both recordings when normal motion becomes allowed after hydration', () => {
    const media = installMediaEnvironment({ reducedMotion: true });
    const { container } = render(<ConvoAiAvatarPair locale="en" />);
    const videos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    const plays = videos.map((video) => vi.spyOn(video, 'play').mockResolvedValue(undefined));

    expect(videos.every((video) => !video.autoplay)).toBe(true);
    act(() => { media.setReducedMotion(false); });

    const observers = videoObservers();
    expect(observers).toHaveLength(2);
    observers.forEach((observer) => act(() => observer.triggerElement(observer.elements[0], 1)));
    plays.forEach((play) => expect(play).toHaveBeenCalled());
  });

  it('pauses both avatar recordings when reduced motion becomes preferred', () => {
    const media = installMediaEnvironment({ reducedMotion: false });
    const { container } = render(<ConvoAiAvatarPair locale="en" />);
    const videos = [...container.querySelectorAll<HTMLVideoElement>('video')];
    const pauses = videos.map((video) => vi.spyOn(video, 'pause'));

    act(() => { media.setReducedMotion(true); });

    pauses.forEach((pause) => expect(pause).toHaveBeenCalled());
  });

  it('does not autoplay or explicitly play under reduced motion', () => {
    installMediaEnvironment({ reducedMotion: true });
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    const { container } = render(<ConvoAiAvatarPair locale="en" />);

    expect([...container.querySelectorAll<HTMLVideoElement>('video')].every((video) => !video.hasAttribute('controls'))).toBe(true);
    expect(play).not.toHaveBeenCalled();
  });
});

describe('ConvoAiAppShowcase', () => {
  it('observes all App scenes with the intended desktop activation band', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="zh" />);
    const observer = appShowcaseObserver();
    const activationTop = Math.round(window.innerHeight * 0.42);
    const activationBottom = Math.round(window.innerHeight * 0.57);

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-login');
    expect(observer.options).toMatchObject({
      rootMargin: `-${activationTop}px 0px -${activationBottom}px 0px`,
      threshold: 0,
    });
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

    act(() => { appShowcaseObserver().trigger('app-profile-settings'); });

    expect(pause).toHaveBeenCalledOnce();
    expect(initialVideo.currentTime).toBe(0);
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-profile-settings');
    const current = container.querySelector('video[aria-label="个人设置"]') as HTMLVideoElement;
    expect(current).toHaveAttribute('src', '/videos/convo-ai/app-profile-settings.mp4');
    expect(current).toHaveAttribute('loop');
    expect((current as HTMLVideoElement).muted).toBe(true);
    expect(current).not.toHaveAttribute('controls');
  });

  it('uses the shared fixed phone shell for every active App scene', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = appShowcaseObserver();
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
    expect(mobileCard.querySelector('img')).toHaveAttribute(
      'alt',
      'App entry and sign in',
    );

    act(() => { media.setDesktop(false); });

    expect(container.querySelector('[data-app-showcase-placement="desktop"]')).toBe(desktopCard);
    expect(container.querySelector('[data-app-showcase-placement="mobile"]')).toBe(mobileCard);
    expect(desktopCard.firstElementChild).toHaveClass(desktopShellClass ?? '');
    expect(mobileCard.firstElementChild).toHaveClass(mobileShellClass ?? '');
    expect(container.querySelectorAll('[data-convo-ai-video="true"]')).toHaveLength(1);
    expect(desktopCard.querySelector('img')).toHaveAttribute(
      'alt',
      'App entry and sign in',
    );
    expect(mobileCard.querySelector('video')).toBeInTheDocument();
  });

  it('accepts reverse observer activation without inferring scroll direction', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = appShowcaseObserver();

    act(() => { observer.trigger('app-profile-settings'); });
    act(() => { observer.trigger('app-structure'); });

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
    expect(container.querySelector('[data-app-showcase-step="app-structure"]')).toHaveAttribute('data-active', 'true');
    expect(container.querySelector('[data-app-showcase-step="app-profile-settings"]')).toHaveAttribute('data-active', 'false');
  });

  it('selects the scene nearest the activation line when adjacent steps intersect together', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    const profile = container.querySelector('[data-app-showcase-step="app-profile-settings"]') as HTMLElement;
    vi.spyOn(structure, 'getBoundingClientRect').mockReturnValue({ top: -158 } as DOMRect);
    vi.spyOn(profile, 'getBoundingClientRect').mockReturnValue({ top: 382 } as DOMRect);

    act(() => {
      appShowcaseObserver().triggerAtActivationLine([
        { id: 'app-structure', top: -158 },
        { id: 'app-profile-settings', top: 382 },
      ]);
    });

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-profile-settings');
  });

  it('keeps the nearest intersecting scene when adjacent updates arrive separately', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = appShowcaseObserver();
    const login = container.querySelector('[data-app-showcase-step="app-login"]') as HTMLElement;
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    const loginBounds = vi.spyOn(login, 'getBoundingClientRect').mockReturnValue({ top: 382 } as DOMRect);
    const structureBounds = vi.spyOn(structure, 'getBoundingClientRect').mockReturnValue({ top: 922 } as DOMRect);

    act(() => { observer.triggerAtActivationLine([{ id: 'app-login', top: 382 }]); });
    loginBounds.mockReturnValue({ top: -158 } as DOMRect);
    structureBounds.mockReturnValue({ top: 382 } as DOMRect);
    act(() => { observer.triggerAtActivationLine([{ id: 'app-structure', top: 382 }]); });

    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
  });

  it('activates desktop scenes immediately while preserving scroll positioning', () => {
    installMediaEnvironment();
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    vi.spyOn(structure, 'getBoundingClientRect').mockReturnValue({ top: 600 } as DOMRect);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'smooth',
      top: Math.max(0, window.scrollY + 600 - window.innerHeight * 0.425),
    });
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
    act(() => { appShowcaseObserver().trigger('app-structure'); });
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-structure');
  });

  it('does not autoplay and uses instant navigation when reduced motion is preferred', () => {
    installMediaEnvironment({ reducedMotion: true });
    const { container } = render(<ConvoAiAppShowcase locale="en" />);
    const structure = container.querySelector('[data-app-showcase-step="app-structure"]') as HTMLElement;
    vi.spyOn(structure, 'getBoundingClientRect').mockReturnValue({ top: 600 } as DOMRect);
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

    expect(container.querySelector('video[aria-label="App entry and sign in"]')).not.toHaveAttribute('autoplay');
    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));
    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      top: Math.max(0, window.scrollY + 600 - window.innerHeight * 0.425),
    });
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
    const observer = videoObservers()[0];
    act(() => observer.triggerElement(video, 1));
    expect(play).toHaveBeenCalledOnce();
  });

  it('keeps mobile media inline, activates by click, and mounts one video', () => {
    installMediaEnvironment({ desktop: false });
    const { container } = render(<ConvoAiAppShowcase locale="zh" />);

    expect(IntersectionObserverHarness.instances.some((observer) => observer.elements.some((element) => element.hasAttribute('data-app-showcase-step')))).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /硬件设备/i }));

    const hardware = container.querySelector('[data-app-showcase-step="app-hardware-device"]') as HTMLElement;
    expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute('data-active-id', 'app-hardware-device');
    expect(hardware.querySelector('[data-media-card="app-hardware-device"]')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-convo-ai-video="true"]')).toHaveLength(1);
  });

  it('disconnects its observer when the showcase unmounts', () => {
    installMediaEnvironment();
    const { unmount } = render(<ConvoAiAppShowcase locale="en" />);
    const observer = appShowcaseObserver();

    unmount();

    expect(observer.disconnect).toHaveBeenCalledOnce();
  });
});
