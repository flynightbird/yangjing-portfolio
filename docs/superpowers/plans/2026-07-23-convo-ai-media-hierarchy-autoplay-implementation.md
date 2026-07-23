# ConvoAI Media Hierarchy and Autoplay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recompose the Chinese start-conversation chapter as an App/Web shared stage, separate scene navigation from descriptive content, identify the voiceprint modes, and autoplay every visible ConvoAI video without native controls.

**Architecture:** Introduce one reusable viewport-aware video component that owns autoplay, reduced-motion behavior, sound toggling, and cross-video muting. Keep general playlists responsible for selection and error presentation, and add a focused `ConvoAiConversationStart` component for the approved A2 shared-stage composition. MDX remains responsible only for chapter ordering and narrative copy.

**Tech Stack:** React 19, TypeScript, CSS Modules, Lucide React, Vitest, Testing Library, Playwright, Next.js 16.

---

## File Map

- Create `components/convo-ai/convo-ai-video.tsx`: reusable viewport playback and sound-control behavior.
- Modify `components/convo-ai/convo-ai-media.tsx`: consume the shared video component, separate playlist navigation, and add the shared start-conversation stage.
- Modify `components/convo-ai/convo-ai-media.module.css`: style the shared stage, detached scene rail, custom sound button, and responsive layouts.
- Modify `content/work/convo-ai.zh.mdx`: use `ConvoAiConversationStart` and add the voiceprint subheading.
- Modify `tests/component/convo-ai-media.test.tsx`: test playback lifecycle, sound behavior, navigation hierarchy, and the shared stage.
- Modify `tests/unit/convo-ai-content.test.ts`: lock the Chinese component composition and voiceprint heading.
- Modify `tests/e2e/convo-ai.spec.ts`: update media collection and verify the shared stage at all breakpoints.

### Task 1: Lock Viewport Playback and Sound Behavior

**Files:**
- Modify: `tests/component/convo-ai-media.test.tsx`
- Create: `components/convo-ai/convo-ai-video.tsx`

- [ ] **Step 1: Extend the IntersectionObserver harness for video targets**

Add a generic trigger method that can emit a chosen intersection ratio for any observed element:

```tsx
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
```

- [ ] **Step 2: Write failing playback tests**

Import `ConvoAiViewportVideo` from `convo-ai-video` and add tests that assert:

```tsx
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
  act(() => IntersectionObserverHarness.instances.at(-1)?.triggerElement(video, 1));
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
```

- [ ] **Step 3: Run the new tests and verify failure**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `ConvoAiViewportVideo` does not exist and the current video elements render native controls.

- [ ] **Step 4: Implement `ConvoAiViewportVideo`**

Create `components/convo-ai/convo-ai-video.tsx` with this implementation:

```tsx
import { Volume2, VolumeX } from 'lucide-react';
import { type Ref, useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';

interface Props {
  readonly id: ConvoAiMediaId;
  readonly locale: Locale;
  readonly describedBy?: string;
  readonly videoRef?: Ref<HTMLVideoElement>;
  readonly onError?: () => void;
  readonly onLoadedData?: () => void;
}

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function assignRef(ref: Ref<HTMLVideoElement> | undefined, value: HTMLVideoElement | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

function muteOtherVideos(current: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')
    .forEach((video) => { if (video !== current) video.muted = true; });
}

export function ConvoAiViewportVideo({ id, locale, describedBy, videoRef, onError, onLoadedData }: Props) {
  const media = getConvoAiMedia(id);
  const localRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const reducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  );
  const setRef = useCallback((video: HTMLVideoElement | null) => {
    localRef.current = video;
    assignRef(videoRef, video);
  }, [videoRef]);

  useEffect(() => {
    const video = localRef.current;
    if (!video) return;
    if (reducedMotion) {
      video.pause();
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      void video.play().catch(() => undefined);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= 0.25) void video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: [0, 0.25] });
    observer.observe(video);
    return () => observer.disconnect();
  }, [id, reducedMotion]);

  const toggleSound = () => {
    const video = localRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    if (!nextMuted) muteOtherVideos(video);
    video.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) void video.play().catch(() => undefined);
  };

  return <div className={styles.videoShell}>
    <video
      ref={setRef}
      data-convo-ai-video="true"
      src={media.src}
      poster={media.poster}
      playsInline
      preload="metadata"
      loop
      muted={muted}
      aria-label={media.copy[locale].title}
      aria-describedby={describedBy}
      onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }}
      onError={onError}
      onLoadedData={onLoadedData}
    />
    {media.audio ? <button
      className={styles.soundToggle}
      type="button"
      aria-label={locale === 'zh' ? (muted ? '开启声音' : '关闭声音') : (muted ? 'Turn sound on' : 'Turn sound off')}
      aria-pressed={!muted}
      onClick={toggleSound}
    >{muted ? <VolumeX aria-hidden="true" size={18} /> : <Volume2 aria-hidden="true" size={18} />}</button> : null}
  </div>;
}
```

The component deliberately omits `controls` and a click handler on the video surface.

- [ ] **Step 5: Run playback tests and verify pass**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: the new viewport and sound tests PASS. Existing assertions about native controls, `autoplay`, or pausing other media may still fail and will be updated in Task 2.

- [ ] **Step 6: Commit the viewport video foundation**

```bash
git add components/convo-ai/convo-ai-video.tsx tests/component/convo-ai-media.test.tsx
git commit -m "feat: add viewport-aware ConvoAI video"
```

### Task 2: Migrate Existing Media and Detach Playlist Navigation

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Replace obsolete playback assertions with the new contract**

Update existing component tests so every rendered ConvoAI video is expected to have `loop`, `muted`, `playsinline`, and no `controls`. Replace the old test that pauses other media with a test that confirms both visible videos can play while only sound is exclusive. Keep playback-rate enforcement at `1` inside the shared video component.

- [ ] **Step 2: Write a failing navigation hierarchy test**

Add:

```tsx
it('renders scene navigation outside the descriptive media surface', () => {
  const { container } = render(<ConvoAiPlaylist ids={['app-login', 'app-structure']} locale="zh" />);
  const surface = container.querySelector('[data-playlist-surface]')!;
  const navigation = container.querySelector('[data-playlist-navigation]')!;

  expect(surface).not.toContainElement(navigation);
  expect(navigation).toHaveAccessibleName('场景列表');
});
```

- [ ] **Step 3: Run the focused test and verify failure**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because the surface and navigation boundaries do not yet exist.

- [ ] **Step 4: Migrate all ConvoAI media to the shared component**

In `convo-ai-media.tsx`:

- Replace direct `<video>` elements and the old `CompleteConvoAiVideo` implementation with `ConvoAiViewportVideo`.
- Remove `CompleteConvoAiVideo` and update all local call sites and component tests to use `ConvoAiViewportVideo`.
- Remove `pauseOtherMedia`, `exclusive`, and manual autoplay effects from playlists and avatar pairs.
- Keep the App showcase's active-scene state and external video ref, but let the shared component own visibility playback.
- Render both Stage videos immediately rather than swapping posters for videos after a focus-button click; focus buttons continue to change visual emphasis only.

- [ ] **Step 5: Restructure playlist markup**

Use this hierarchy, retaining the existing state variables and `move` callback:

```tsx
<div className={styles.playlist} data-convo-ai-playlist>
  <div className={styles.playlistSurface} data-playlist-surface data-tone={activeIndex % 4}>
    {hasMultipleItems ? <div className={styles.carouselHeader}>
      <div aria-live="polite" data-carousel-position><strong>{String(activeIndex + 1).padStart(2, '0')}</strong><span> / {String(ids.length).padStart(2, '0')}</span></div>
      <div className={styles.carouselControls}>
        <button type="button" aria-label={locale === 'zh' ? '上一段录屏' : 'Previous recording'} onClick={() => move(-1)}><ArrowLeft aria-hidden="true" size={20} /></button>
        <button type="button" aria-label={locale === 'zh' ? '下一段录屏' : 'Next recording'} onClick={() => move(1)}><ArrowRight aria-hidden="true" size={20} /></button>
      </div>
    </div> : null}
    <figure className={styles.evidence} data-platform={active.platform} data-media-card={active.id}>
      <div className={styles.videoFrame} style={{ aspectRatio: `${active.width} / ${active.height}` }}>
        <ConvoAiViewportVideo key={active.id} id={active.id} locale={locale} describedBy={descriptionId} videoRef={videoRef} onError={() => setFailed(true)} onLoadedData={() => setFailed(false)} />
        {failed ? <MediaError locale={locale} onReload={() => { setFailed(false); videoRef.current?.load(); }} /> : null}
      </div>
      <figcaption id={descriptionId}><span>{active.platform.toUpperCase()} / {formatDuration(active.duration)}</span><p>{copy.description}</p></figcaption>
    </figure>
    <dl className={styles.cpdi}>{(['context', 'problem', 'decision', 'impact'] as const).map((key) => <div key={key}><dt>{cpdiLabels[locale][key]}</dt><dd>{copy[key]}</dd></div>)}</dl>
  </div>
  {hasMultipleItems ? (
    <div className={styles.playlistNavigation}>
      <p>{locale === 'zh' ? '场景列表' : 'Scene list'}</p>
      <div className={styles.queue} data-playlist-navigation aria-label={locale === 'zh' ? '场景列表' : 'Scene list'}>
        {ids.map((id, index) => {
          const media = getConvoAiMedia(id);
          return <button key={id} type="button" aria-pressed={id === activeId} onClick={() => { setFailed(false); setActiveId(id); }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{media.copy[locale].title}</strong>
            <small>{formatDuration(media.duration)}</small>
          </button>;
        })}
      </div>
    </div>
  ) : null}
</div>
```

Extract the existing error markup into a local `MediaError` helper with props `{ locale: Locale; onReload: () => void }`; its markup and localized labels remain unchanged.

On selection, update `activeId` and clear the error state. Do not manually pause the previous node; unmounting handles cleanup and the new node's observer starts playback when visible.

- [ ] **Step 6: Update playlist and sound styling**

Move border, radius, background tone, and overflow rules from `.playlist` to `.playlistSurface`. Make `.playlist` unframed. Add at least `2rem` separation before `.playlistNavigation`; render the queue as its own bordered band with 44px minimum-height buttons. Add `.videoShell` and `.soundToggle` rules, placing the sound button at the lower-right with a visible focus state and no text label on screen.

- [ ] **Step 7: Run component tests**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: all ConvoAI media component tests PASS.

- [ ] **Step 8: Commit the playlist hierarchy migration**

```bash
git add components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css tests/component/convo-ai-media.test.tsx
git commit -m "refactor: separate ConvoAI media navigation"
```

### Task 3: Build the A2 Shared Start-Conversation Stage

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `tests/component/convo-ai-media.test.tsx`
- Modify: `tests/unit/convo-ai-content.test.ts`

- [ ] **Step 1: Write failing shared-stage component tests**

Add tests for `ConvoAiConversationStart`:

```tsx
it('keeps App and Web visible while Web steps change independently', () => {
  installMediaEnvironment();
  const { container } = render(<ConvoAiConversationStart locale="zh" />);

  expect(container.querySelector('[data-convo-start-stage]')).toBeVisible();
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
```

Update the content test to expect `ConvoAiConversationStart locale="zh"` and to reject the old mixed five-item `ConvoAiPlaylist` expression.

- [ ] **Step 2: Run the new tests and verify failure**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx tests/unit/convo-ai-content.test.ts
```

Expected: FAIL because `ConvoAiConversationStart` does not exist and MDX still uses the mixed playlist.

- [ ] **Step 3: Implement `ConvoAiConversationStart`**

Add fixed IDs:

```tsx
const startConversationAppId = 'app-conversation-start' as const;
const startConversationWebIds = ['web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'] as const;
```

The component owns only `activeWebId` and the two local failure states. Implement:

```tsx
const startConversationAppId = 'app-conversation-start' as const;
const startConversationWebIds = ['web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit'] as const;

export function ConvoAiConversationStart({ locale }: { readonly locale: Locale }) {
  const [activeWebId, setActiveWebId] = useState<(typeof startConversationWebIds)[number]>('web-login');
  const [failed, setFailed] = useState<'app' | 'web' | null>(null);
  const appVideoRef = useRef<HTMLVideoElement>(null);
  const webVideoRef = useRef<HTMLVideoElement>(null);
  const appDescriptionId = useId();
  const webDescriptionId = useId();
  const app = getConvoAiMedia(startConversationAppId);
  const web = getConvoAiMedia(activeWebId);
  const webCopy = web.copy[locale];

  return <div className={styles.conversationStart} data-convo-start>
    <div className={styles.conversationStage} data-convo-start-stage>
      <figure className={styles.conversationWeb} data-media-card={activeWebId}>
        <div className={styles.conversationPlatformLabel}><span>WEB</span><strong>{locale === 'zh' ? '完整准备' : 'Complete setup'}</strong></div>
        <div className={styles.conversationWebMedia}>
          <ConvoAiViewportVideo key={activeWebId} id={activeWebId} locale={locale} describedBy={webDescriptionId} videoRef={webVideoRef} onError={() => setFailed('web')} onLoadedData={() => setFailed(null)} />
          {failed === 'web' ? <MediaError locale={locale} onReload={() => { setFailed(null); webVideoRef.current?.load(); }} /> : null}
        </div>
        <figcaption id={webDescriptionId}>{webCopy.description}</figcaption>
      </figure>

      <figure className={styles.conversationApp} data-media-card={startConversationAppId}>
        <div className={styles.conversationPlatformLabel}><span>APP</span><strong>{locale === 'zh' ? '快速开始' : 'Quick start'}</strong></div>
        <div className={styles.conversationPhone}>
          <ConvoAiViewportVideo id={startConversationAppId} locale={locale} describedBy={appDescriptionId} videoRef={appVideoRef} onError={() => setFailed('app')} onLoadedData={() => setFailed(null)} />
          {failed === 'app' ? <MediaError locale={locale} onReload={() => { setFailed(null); appVideoRef.current?.load(); }} /> : null}
        </div>
        <figcaption id={appDescriptionId}>{app.copy[locale].description}</figcaption>
      </figure>
    </div>

    <dl className={styles.cpdi} data-convo-start-detail>
      {(['context', 'problem', 'decision', 'impact'] as const).map((key) => <div key={key}><dt>{cpdiLabels[locale][key]}</dt><dd>{webCopy[key]}</dd></div>)}
    </dl>

    <nav className={styles.conversationNavigation} aria-label={locale === 'zh' ? 'Web 启动路径' : 'Web launch path'} data-convo-start-navigation>
      <p>{locale === 'zh' ? 'Web 启动路径' : 'Web launch path'}</p>
      <div className={styles.conversationSteps}>
        {startConversationWebIds.map((id, index) => {
          const media = getConvoAiMedia(id);
          return <button key={id} type="button" aria-pressed={id === activeWebId} onClick={() => { setFailed(null); setActiveWebId(id); }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{media.copy[locale].title}</strong>
            <small>{formatDuration(media.duration)}</small>
          </button>;
        })}
      </div>
    </nav>
  </div>;
}
```

- [ ] **Step 4: Implement the shared-stage CSS**

Desktop:

- Web plane uses the available width and preserves its catalog aspect ratio.
- App phone overlaps the lower-left of the Web plane and stays within the stage bounds.
- Stage labels remain readable over the near-black media frame.
- The detail panel ends before the independent Web navigation begins.

Tablet keeps a reduced overlap. At `max-width: 640px`, remove overlap, place the App phone directly below the Web plane inside the same stage, and render the Web steps as a horizontally scrollable rail without causing page overflow.

- [ ] **Step 5: Replace the mixed playlist in Chinese MDX**

Update the import and chapter body:

```mdx
import { ConvoAiAppShowcase, ConvoAiAvatarPair, ConvoAiConversationStart, ConvoAiInlineHeading, ConvoAiPlaylist, ConvoAiVoiceprintModes } from '@/components/convo-ai/convo-ai-media'

<ConvoAiConversationStart locale="zh" />
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx tests/unit/convo-ai-content.test.ts
```

Expected: all focused tests PASS.

- [ ] **Step 7: Commit the shared start-conversation stage**

```bash
git add components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css content/work/convo-ai.zh.mdx tests/component/convo-ai-media.test.tsx tests/unit/convo-ai-content.test.ts
git commit -m "feat: build ConvoAI shared conversation stage"
```

### Task 4: Add Voiceprint Identification and End-to-End Coverage

**Files:**
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `tests/unit/convo-ai-content.test.ts`
- Modify: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Write failing voiceprint and browser assertions**

In the content test, assert the Chinese source contains exactly one `声纹如何定义“听谁说话”` and does not contain the rejected explanatory sentence.

In Playwright, add assertions that:

```ts
const startStage = page.locator('[data-convo-start-stage]');
await expect(startStage.locator('video')).toHaveCount(2);
await expect(page.getByRole('navigation', { name: 'Web 启动路径' })).toBeVisible();
await expect(page.locator('video[controls]')).toHaveCount(0);
await expect(page.getByRole('heading', { level: 3, name: '声纹如何定义“听谁说话”' })).toBeVisible();
await expect(page.locator('[data-app-showcase-step="app-profile-settings"]')).toBeVisible();
await expect(page.locator('[data-app-showcase-step="app-hardware-device"]')).toBeVisible();
await expect(page.locator('[data-convo-ai-avatar="app-avatar-select"]')).toBeVisible();
await expect(page.locator('[data-convo-ai-avatar="app-avatar-interaction"]')).toBeVisible();
```

Update `playlistIds.zh` so the mixed start playlist is removed, and collect the start-stage App/Web sources separately before comparing the complete set of 16 media IDs.

- [ ] **Step 2: Run focused tests and verify failure**

Run:

```bash
npm test -- --run tests/unit/convo-ai-content.test.ts
PW_PORT=4193 PW_REUSE_SERVER=1 npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop
```

Expected: FAIL until the heading and revised E2E media collection are implemented.

- [ ] **Step 3: Add the voiceprint heading**

Insert before `ConvoAiVoiceprintModes`:

```mdx
<h3 className="convo-subheading">声纹如何定义“听谁说话”</h3>
```

Style `.convo-subheading` through `convo-ai-layout.module.css` as a compact section-level heading with a maximum line length, no eyebrow label, and sufficient spacing from both the chapter lead and mode panels.

- [ ] **Step 4: Update E2E media collection and responsive assertions**

Collect both start-stage videos plus each Web step. On desktop, assert the App phone overlaps the Web plane while remaining inside the stage. On mobile, assert the App phone begins below the Web plane and both remain in the same `data-convo-start-stage` container. Check the sound button appears only for catalog entries with `audio: true` and every video lacks `controls`.

- [ ] **Step 5: Run the complete verification suite**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx tests/unit/convo-ai-content.test.ts tests/component/convo-ai-layout.test.tsx
npm run lint
npm run build:framework
PW_PORT=4193 PW_REUSE_SERVER=1 npx playwright test tests/e2e/convo-ai.spec.ts
git diff --check
```

Expected:

- focused Vitest suites PASS;
- ESLint reports zero errors;
- Next.js production build exits `0`;
- ConvoAI Playwright tests pass across desktop, tablet, and mobile, with only explicitly breakpoint-gated tests skipped;
- `git diff --check` exits `0`.

- [ ] **Step 6: Perform live visual verification**

At `http://localhost:4193/zh/work/convo-ai/`, verify:

- the A2 Web plane and App phone read as one shared stage;
- App content remains assigned to its approved chapters;
- Web scene navigation is visually detached from the description;
- both visible start-stage videos autoplay muted without native controls;
- the sound button is unobtrusive and remains keyboard accessible;
- the voiceprint heading identifies the three modes;
- desktop, 768px tablet, 390px mobile, and reduced-motion rendering have no overlap or horizontal overflow.

- [ ] **Step 7: Commit final copy and regression coverage**

```bash
git add content/work/convo-ai.zh.mdx components/convo-ai/convo-ai-layout.module.css tests/unit/convo-ai-content.test.ts tests/e2e/convo-ai.spec.ts
git commit -m "test: verify ConvoAI media hierarchy"
```
