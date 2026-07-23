# ConvoAI Chinese Case Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Chinese ConvoAI case into the approved seven-chapter narrative, including a Sequence-style scroll-driven App showcase inside the existing case template, four 20px Morandi media-card states, complete source-video playback, and a side-by-side digital-human presentation.

**Architecture:** Keep `ConvoAiLayout`, `SiteHeader`, and `ChapterNav` as the outer detail-page framework. Add two case-local media components to `convo-ai-media.tsx`: `ConvoAiAppShowcase` owns desktop scroll activation and mobile accordion behavior, while `ConvoAiAvatarPair` owns the two complete avatar recordings. Keep media facts and localized CPDI copy in `convo-ai-media-catalog.ts`, and keep all layout/color behavior local to `convo-ai-media.module.css`.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, CSS Modules, Vitest, Testing Library, Playwright.

---

## File Map

- `content/work/convo-ai.zh.mdx`: Chinese metadata, chapter order, narrative, and media composition.
- `components/convo-ai/convo-ai-media.tsx`: shared complete-video behavior, App scroll showcase, avatar pair, and localized CPDI labels.
- `components/convo-ai/convo-ai-media.module.css`: App showcase grid/sticky behavior, 20px Morandi media cards, responsive accordion, avatar pair, and reduced-motion rules.
- `components/convo-ai/convo-ai-media-catalog.ts`: natural Chinese titles, descriptions, and CPDI copy; source metadata remains unchanged.
- `evidence/convo-ai/case-study-blueprint.zh.md`: internal evidence-led blueprint aligned with the public Chinese case.
- `tests/unit/convo-ai-content.test.ts`: Chinese-only chapter and publication contract.
- `tests/component/convo-ai-media.test.tsx`: scroll activation, media reset, card state, keyboard/click, reduced-motion, and avatar-pair tests.
- `tests/component/convo-ai-layout.test.tsx`: regression assertion that the shared chapter navigation remains the outer navigation.
- `tests/e2e/convo-ai.spec.ts`: Chinese narrative, complete-media access, scroll switching, template navigation, responsive layout, and screenshots.

## Task 1: Lock the Chinese narrative contract

**Files:**
- Modify: `tests/unit/convo-ai-content.test.ts`
- Modify: `tests/component/convo-ai-layout.test.tsx`

- [ ] **Step 1: Replace the shared chapter expectation with locale-specific contracts**

Use these exact chapter IDs for Chinese while keeping English unchanged:

```ts
const chapterIds = {
  en: [
    'context-thesis', 'ready', 'interrupt', 'trusted-participant',
    'avatar', 'realtime-system', 'delivery-reflection',
  ],
  zh: [
    'context-challenge', 'app-product-structure', 'start-conversation',
    'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
  ],
} as const;

for (const locale of ['en', 'zh'] as const) {
  expect(getEntry('work', 'convo-ai', locale).meta.chapters?.map(({ id }) => id))
    .toEqual(chapterIds[locale]);
}
```

- [ ] **Step 2: Add Chinese copy and component-presence assertions**

Add the following test to `tests/unit/convo-ai-content.test.ts`:

```ts
it('publishes the approved Chinese decision-led narrative without retired claims', () => {
  const source = readFileSync(
    path.join(process.cwd(), 'content/work/convo-ai.zh.mdx'),
    'utf8',
  );

  expect(source).toContain('<ConvoAiAppShowcase locale="zh"');
  expect(source).toContain('<ConvoAiAvatarPair locale="zh"');
  expect(source).toContain('对话中的控制权');
  expect(source).toContain('一次回答背后的实时链路');
  expect(source).not.toMatch(/确认谁在参与|建立会话信心|定位实时问题|交付与反思/);
  expect(source).not.toContain('这个项目让我更确定');
  expect(source).not.toMatch(/<h[1-6][^>]*>\s*(?:Gap|缺口)/i);
});
```

In the existing all-recordings test, replace the shared Figma-figure count with a locale-specific assertion so the unchanged English page keeps its two figures while the restructured Chinese page uses the new media components:

```ts
if (locale === 'en') {
  expect(source.match(/className="convo-phone-evidence"/g)).toHaveLength(2);
} else {
  expect(source.match(/className="convo-phone-evidence"/g) ?? []).toHaveLength(0);
  expect(source).toContain('<ConvoAiAppShowcase locale="zh"');
  expect(source).toContain('<ConvoAiAvatarPair locale="zh"');
}
```

Move the existing `for (const id of ids)` source assertion into the English branch. For Chinese, assert the ten IDs owned directly by MDX; the other six are owned and tested by `ConvoAiAppShowcase` and `ConvoAiAvatarPair`:

```ts
if (locale === 'en') {
  for (const id of ids) expect(source).toContain(`'${id}'`);
} else {
  const mdxOwnedIds = [
    'app-conversation-start', 'app-caption-camera', 'app-voiceprint-lock',
    'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit',
    'web-conversation', 'web-interrupt', 'web-realtime-data',
  ];
  for (const id of mdxOwnedIds) expect(source).toContain(`'${id}'`);
  expect(source).toContain('<ConvoAiAppShowcase locale="zh"');
  expect(source).toContain('<ConvoAiAvatarPair locale="zh"');
}
```

- [ ] **Step 3: Assert the shared detail navigation remains the only outer navigation**

Extend `tests/component/convo-ai-layout.test.tsx`:

```ts
expect(screen.getAllByRole('navigation', { name: 'Case study chapters' })).toHaveLength(1);
expect(container.querySelector('[data-convo-ai-case]')).toBeVisible();
expect(container.querySelector('[data-case-study]')).toBeVisible();
```

- [ ] **Step 4: Run the focused tests and confirm they fail for the old Chinese structure**

Run:

```bash
npm test -- tests/unit/convo-ai-content.test.ts tests/component/convo-ai-layout.test.tsx
```

Expected: `convo-ai-content.test.ts` fails because the Chinese metadata still uses the retired chapter IDs and the new components are absent; the layout regression test passes.

- [ ] **Step 5: Commit the failing contract tests**

```bash
git add tests/unit/convo-ai-content.test.ts tests/component/convo-ai-layout.test.tsx
git commit -m "test: define ConvoAI Chinese restructure contract"
```

## Task 2: Localize media semantics and preserve complete playback

**Files:**
- Modify: `components/convo-ai/convo-ai-media-catalog.ts`
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Add tests for Chinese CPDI labels and complete-loop options**

Add these assertions to `tests/component/convo-ai-media.test.tsx`:

```tsx
it('uses natural Chinese CPDI labels', () => {
  render(<ConvoAiPlaylist ids={['app-caption-camera']} locale="zh" />);
  expect(screen.getByText('场景')).toBeVisible();
  expect(screen.getByText('问题')).toBeVisible();
  expect(screen.getByText('设计')).toBeVisible();
  expect(screen.getByText('作用')).toBeVisible();
  expect(screen.queryByText('context')).not.toBeInTheDocument();
});

it('can render a complete muted loop without changing playback rate', () => {
  render(<CompleteConvoAiVideo id="app-login" locale="zh" autoPlay loop muted />);
  const video = screen.getByLabelText('App 登录与进入');
  expect(video).toHaveAttribute('src', '/videos/convo-ai/app-login.mp4');
  expect(video).toHaveAttribute('loop');
  expect(video).toHaveProperty('muted', true);
  Object.defineProperty(video, 'playbackRate', { value: 1.5, writable: true });
  fireEvent.rateChange(video);
  expect(video).toHaveProperty('playbackRate', 1);
});
```

Update the import:

```ts
import {
  CompleteConvoAiVideo,
  ConvoAiPlaylist,
  ConvoAiStage,
} from '@/components/convo-ai/convo-ai-media';
```

- [ ] **Step 2: Run the component test and verify it fails**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `CompleteConvoAiVideo` is not exported and CPDI terms are still English.

- [ ] **Step 3: Export a configurable complete-video primitive**

Update the React import first:

```tsx
import { useId, useRef, useState, type Ref } from 'react';
```

Replace the private `CompleteVideo` helper in `convo-ai-media.tsx` with this component and update `ConvoAiStage` to call it:

```tsx
export function CompleteConvoAiVideo({
  id,
  locale,
  describedBy,
  autoPlay = false,
  loop = false,
  muted = false,
  videoRef,
}: {
  readonly id: ConvoAiMediaId;
  readonly locale: Locale;
  readonly describedBy?: string;
  readonly autoPlay?: boolean;
  readonly loop?: boolean;
  readonly muted?: boolean;
  readonly videoRef?: Ref<HTMLVideoElement>;
}) {
  const media = getConvoAiMedia(id);
  return <video
    ref={videoRef}
    data-convo-ai-video="true"
    src={media.src}
    poster={media.poster}
    controls
    playsInline
    preload="metadata"
    autoPlay={autoPlay}
    loop={loop}
    muted={muted}
    aria-label={media.copy[locale].title}
    aria-describedby={describedBy}
    onPlay={(event) => pauseOtherMedia(event.currentTarget)}
    onRateChange={(event) => {
      if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1;
    }}
  />;
}
```

- [ ] **Step 4: Map CPDI labels by locale**

Add this constant above `ConvoAiPlaylist`:

```ts
const cpdiLabels = {
  en: { context: 'Context', problem: 'Problem', decision: 'Decision', impact: 'Impact' },
  zh: { context: '场景', problem: '问题', decision: '设计', impact: '作用' },
} as const;
```

Render the definition terms with:

```tsx
<dt>{cpdiLabels[locale][key]}</dt>
```

- [ ] **Step 5: Rewrite only the Chinese catalog strings named by the approved spec**

Keep every `id`, `src`, `poster`, `duration`, `width`, `height`, and `audio` value unchanged. Apply these exact copy corrections:

```ts
'app-caption-camera': {
  title: '字幕与摄像头互动',
  description: '完整呈现字幕、球体、摄像头与通话控件的同步变化。',
  context: '用户在持续对话中打开字幕与摄像头。',
  problem: '声音、文字、视频和 AI 状态同时变化，容易争夺注意力。',
  decision: '保持通话控制稳定，并让字幕、球体与摄像头反馈跟随同一话轮更新。',
  impact: '设计意图是让用户在信息增加后仍能理解 AI 当前的响应状态。',
},
'web-realtime-data': {
  title: '一次回答背后的实时数据',
  description: '完整呈现对话旁的 E2E、RTC、ASR、LLM、TTS 与 Voiceprint 数据。',
  context: '一次 AI 回答正在被识别、生成、合成并播放。',
  problem: '用户听到的是连续回答，演示现场需要同时看见它经过的处理阶段。',
  decision: '把各阶段数据保留在正在发生的对话旁，并按处理链路组织。',
  impact: '设计意图是让体验现场与实时处理过程可以被同时理解。',
},
```

Also replace these translated phrases with natural Chinese:

```ts
'app-login': {
  decision: '完整保留入口过程，交代移动端体验从哪里开始。',
  impact: '评审可以快速理解用户进入产品后的第一步。',
},
'app-structure': {
  decision: '用完整导览呈现 Agent、个人设置与设备入口之间的层级。',
  impact: '后续设置、设备与通话流程都能回到清晰的产品位置。',
},
'app-avatar-select': {
  decision: '选择角色后直接回到 Agent 配置，让选择进入下一步对话流程。',
  impact: '设计意图是让角色选择与后续互动建立连续关系。',
},
'app-avatar-interaction': {
  decision: '在同一流程中呈现连接、话轮、摄像头与画中画变化。',
  impact: '设计意图是在临场感增强后，用户仍能看懂当前通话状态。',
},
'web-preflight': {
  decision: '在大屏中展开通话前配置，同时保留明确的启动顺序。',
  impact: '设计意图是让 Web 承载更多配置，但不增加启动路径的理解成本。',
},
```

- [ ] **Step 6: Run the component tests**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the media semantic changes**

```bash
git add components/convo-ai/convo-ai-media-catalog.ts components/convo-ai/convo-ai-media.tsx tests/component/convo-ai-media.test.tsx
git commit -m "feat: clarify ConvoAI media evidence semantics"
```

## Task 3: Build the scroll-driven App product showcase

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Add a controllable IntersectionObserver test harness**

Add this class near the top of `tests/component/convo-ai-media.test.tsx`:

```ts
class ShowcaseIntersectionObserver implements IntersectionObserver {
  static instance: ShowcaseIntersectionObserver | undefined;
  readonly root = null;
  readonly rootMargin: string;
  readonly thresholds = [0];
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn(() => [] as IntersectionObserverEntry[]);
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit = {}) {
    this.callback = callback;
    this.rootMargin = options.rootMargin ?? '0px';
    ShowcaseIntersectionObserver.instance = this;
  }

  trigger(target: Element) {
    this.callback([{
      target,
      isIntersecting: true,
      intersectionRatio: 1,
    } as IntersectionObserverEntry], this);
  }
}
```

In `beforeEach`, add:

```ts
ShowcaseIntersectionObserver.instance = undefined;
vi.stubGlobal('IntersectionObserver', ShowcaseIntersectionObserver);
vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
  matches: query.includes('min-width: 801px'),
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
})));
vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
```

- [ ] **Step 2: Add the desktop activation and media-reset test**

```tsx
it('switches the fixed App card at one activation line and resets the previous complete video', async () => {
  const { container } = render(<ConvoAiAppShowcase locale="zh" />);
  const showcase = container.querySelector('[data-convo-app-showcase]');
  expect(showcase).toHaveAttribute('data-active-id', 'app-login');
  expect(ShowcaseIntersectionObserver.instance?.rootMargin).toBe('-42% 0px -57% 0px');

  const firstVideo = screen.getByLabelText('App 登录与进入') as HTMLVideoElement;
  firstVideo.currentTime = 2;
  const profileStep = container.querySelector('[data-app-showcase-step="app-profile-settings"]');
  ShowcaseIntersectionObserver.instance?.trigger(profileStep!);

  expect(showcase).toHaveAttribute('data-active-id', 'app-profile-settings');
  expect(firstVideo.pause).toHaveBeenCalled();
  expect(firstVideo.currentTime).toBe(0);
  expect(screen.getByLabelText('个人设置')).toHaveAttribute('loop');
});
```

- [ ] **Step 3: Add click, keyboard, and reduced-motion tests**

```tsx
it('uses scene buttons as scroll commands rather than a second selection model', () => {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  render(<ConvoAiAppShowcase locale="zh" />);
  fireEvent.click(screen.getByRole('button', { name: /硬件设备/ }));
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
});

it('disables autoplay and smooth scrolling for reduced motion', () => {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList));
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  render(<ConvoAiAppShowcase locale="zh" />);
  expect(screen.getByLabelText('App 登录与进入')).not.toHaveAttribute('autoplay');
  fireEvent.click(screen.getByRole('button', { name: /产品结构/ }));
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
});
```

Update the import to include `ConvoAiAppShowcase`.

- [ ] **Step 4: Run the tests and verify they fail**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `ConvoAiAppShowcase` does not exist.

- [ ] **Step 5: Add the showcase data and reduced-motion helper**

Add to `convo-ai-media.tsx`:

```tsx
import { useCallback, useEffect, useId, useRef, useState, type Ref } from 'react';

const appShowcaseItems = [
  { id: 'app-login', index: '01', label: '登录与进入', summary: '用短入口建立产品身份和移动端旅程起点。' },
  { id: 'app-structure', index: '02', label: '产品结构', summary: '组织 Agent、个人入口与设备入口的主次关系。' },
  { id: 'app-profile-settings', index: '03', label: '个人设置', summary: '让修改、确认与返回形成连续反馈。' },
  { id: 'app-hardware-device', index: '04', label: '硬件设备', summary: '把环境准备与设备扫描组织成一条任务。' },
] as const satisfies readonly {
  id: ConvoAiMediaId;
  index: string;
  label: string;
  summary: string;
}[];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, [query]);
  return matches;
}

function useAutoplayAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowed(!media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return allowed;
}
```

- [ ] **Step 6: Implement `ConvoAiAppShowcase`**

Add this exported component to `convo-ai-media.tsx`:

```tsx
export function ConvoAiAppShowcase({ locale }: { readonly locale: Locale }) {
  const [activeId, setActiveId] = useState<ConvoAiMediaId>('app-login');
  const activeIdRef = useRef<ConvoAiMediaId>('app-login');
  const activeVideoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const desktop = useMediaQuery('(min-width: 801px)');
  const autoplayAllowed = useAutoplayAllowed();
  const active = getConvoAiMedia(activeId);

  const activate = useCallback((nextId: ConvoAiMediaId) => {
    if (nextId === activeIdRef.current) return;
    const current = activeVideoRef.current;
    current?.pause();
    if (current) current.currentTime = 0;
    activeIdRef.current = nextId;
    setActiveId(nextId);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !desktop || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.find(({ isIntersecting }) => isIntersecting);
      const id = entry?.target.getAttribute('data-app-showcase-step') as ConvoAiMediaId | null;
      if (id) activate(id);
    }, { rootMargin: '-42% 0px -57% 0px', threshold: 0 });
    root.querySelectorAll('[data-app-showcase-step]').forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, [activate, desktop]);

  useEffect(() => {
    if (autoplayAllowed) void activeVideoRef.current?.play().catch(() => undefined);
  }, [activeId, autoplayAllowed]);

  const requestItem = (id: ConvoAiMediaId, element: HTMLElement) => {
    if (!desktop) activate(id);
    element.closest('[data-app-showcase-step]')?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const mediaCard = <figure className={styles.appMediaCard} data-media-card={activeId}>
    <div className={styles.showcasePhone}>
      <CompleteConvoAiVideo
        key={active.id}
        id={active.id}
        locale={locale}
        videoRef={activeVideoRef}
        autoPlay={autoplayAllowed}
        loop
        muted
      />
    </div>
    <figcaption aria-live="polite">{active.copy[locale].title}</figcaption>
  </figure>;

  return <div
    ref={rootRef}
    className={styles.appShowcase}
    data-convo-app-showcase
    data-active-id={activeId}
  >
    <div className={styles.appShowcaseSteps} aria-label={locale === 'zh' ? 'App 产品场景' : 'App product scenes'}>
      {appShowcaseItems.map((item) => {
        const selected = item.id === activeId;
        return <article
          key={item.id}
          className={styles.appShowcaseStep}
          data-app-showcase-step={item.id}
          data-active={selected ? 'true' : 'false'}
        >
          <button
            type="button"
            aria-pressed={selected}
            onClick={(event) => requestItem(item.id, event.currentTarget)}
          >
            <span>{item.index}</span>
            <strong>{item.label}</strong>
          </button>
          <p>{item.summary}</p>
          {!desktop && selected ? mediaCard : null}
        </article>;
      })}
    </div>
    {desktop ? <div className={styles.appShowcaseSticky}>{mediaCard}</div> : null}
  </div>;
}
```

- [ ] **Step 7: Run the component tests**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: PASS, including one active ID, previous-video reset, scroll command, and reduced-motion behavior.

- [ ] **Step 8: Commit the showcase behavior**

```bash
git add components/convo-ai/convo-ai-media.tsx tests/component/convo-ai-media.test.tsx
git commit -m "feat: add scroll-driven ConvoAI App showcase"
```

## Task 4: Style the Sequence layout and Morandi media cards

**Files:**
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Add structural class and card-token assertions**

Append this test:

```tsx
it('maps each App scene to a stable 20px Morandi media-card state', () => {
  const { container } = render(<ConvoAiAppShowcase locale="zh" />);
  const card = container.querySelector('[data-media-card="app-login"]');
  expect(card).toBeVisible();
  expect(card?.className).toMatch(/appMediaCard/);
  expect(container.querySelector('[data-convo-app-showcase]')).toHaveAttribute(
    'data-active-id',
    'app-login',
  );
});
```

- [ ] **Step 2: Add the desktop grid, sticky stage, colors, and stable phone geometry**

Append to `convo-ai-media.module.css`:

```css
.appShowcase {
  display: grid;
  grid-template-columns: minmax(15rem, 0.72fr) minmax(22rem, 1.28fr);
  gap: clamp(2rem, 5vw, 5rem);
  margin-block-start: 4rem;
  align-items: start;
}

.appShowcaseSteps {
  min-width: 0;
}

.appShowcaseStep {
  min-block-size: 60vh;
  padding-block: 1.25rem;
  scroll-margin-block-start: 42vh;
  border-block-start: 1px solid rgba(16, 17, 15, 0.2);
  opacity: 0.42;
  transition: opacity 180ms var(--ease-out);
}

.appShowcaseStep[data-active='true'] {
  opacity: 1;
}

.appShowcaseStep button {
  display: grid;
  width: 100%;
  min-height: 44px;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: center;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  color: inherit;
  text-align: start;
  cursor: pointer;
}

.appShowcaseStep button span {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

.appShowcaseStep button strong {
  font-size: clamp(1.25rem, 2vw, 1.75rem);
}

.appShowcaseStep p {
  max-width: 30ch;
  margin: 0.75rem 0 0 2rem;
  line-height: 1.65;
}

.appShowcaseStep button:focus-visible {
  outline: 2px solid var(--color-iris-deep);
  outline-offset: 4px;
}

.appShowcaseSticky {
  position: sticky;
  inset-block-start: calc(var(--header-height) + 2rem);
  display: grid;
  place-items: center;
  min-width: 0;
}

.appMediaCard {
  display: grid;
  width: 100%;
  min-height: clamp(34rem, 72vh, 48rem);
  place-items: center;
  align-content: center;
  gap: 1rem;
  margin: 0;
  overflow: hidden;
  border-radius: 20px;
  background: #b8c7c9;
  transition: background-color 220ms var(--ease-out);
}

.appMediaCard[data-media-card='app-structure'] { background: #bec4b3; }
.appMediaCard[data-media-card='app-profile-settings'] { background: #cfb9b6; }
.appMediaCard[data-media-card='app-hardware-device'] { background: #c6bdad; }

.showcasePhone {
  width: min(42%, 17rem);
  aspect-ratio: 592 / 1280;
  padding: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 30px;
  background: #070809;
  box-shadow: 0 1.5rem 3.5rem rgba(16, 17, 15, 0.24);
}

.showcasePhone video {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 22px;
  background: #0b0d0f;
  object-fit: contain;
}

.appMediaCard figcaption {
  color: rgba(16, 17, 15, 0.72);
  font-size: 0.8125rem;
  font-weight: 650;
}
```

- [ ] **Step 3: Add mobile accordion and reduced-motion rules**

Add to the existing responsive blocks:

```css
@media (max-width: 800px) {
  .appShowcase {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .appShowcaseStep {
    min-block-size: 0;
    scroll-margin-block-start: 0;
    opacity: 1;
  }

  .appShowcaseStep p {
    display: none;
  }

  .appShowcaseStep[data-active='true'] p {
    display: block;
  }

  .appShowcaseSticky {
    position: static;
    inset-block-start: auto;
    grid-row: auto;
    margin-block-start: 1.5rem;
  }

  .appMediaCard {
    min-height: 34rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .appShowcaseStep,
  .appMediaCard {
    transition: none;
  }
}
```

- [ ] **Step 4: Run focused tests and lint the changed component files**

Run:

```bash
npm test -- tests/component/convo-ai-media.test.tsx
npx eslint components/convo-ai/convo-ai-media.tsx tests/component/convo-ai-media.test.tsx
```

Expected: both commands PASS.

- [ ] **Step 5: Commit the App showcase visual system**

```bash
git add components/convo-ai/convo-ai-media.module.css tests/component/convo-ai-media.test.tsx
git commit -m "style: add Morandi App media cards"
```

## Task 5: Add the digital-human pair and rewrite the Chinese page

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `tests/component/convo-ai-media.test.tsx`
- Modify: `tests/unit/convo-ai-content.test.ts`

- [ ] **Step 1: Add the avatar-pair component test**

```tsx
it('renders both complete digital-human recordings as independent full loops', () => {
  const { container } = render(<ConvoAiAvatarPair locale="zh" />);
  const videos = container.querySelectorAll('[data-convo-avatar-pair] video');
  expect(videos).toHaveLength(2);
  expect(videos[0]).toHaveAttribute('src', '/videos/convo-ai/app-avatar-select.mp4');
  expect(videos[1]).toHaveAttribute('src', '/videos/convo-ai/app-avatar-interaction.mp4');
  videos.forEach((video) => {
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveProperty('muted', true);
  });
});
```

- [ ] **Step 2: Implement `ConvoAiAvatarPair`**

```tsx
export function ConvoAiAvatarPair({ locale }: { readonly locale: Locale }) {
  const autoplayAllowed = useAutoplayAllowed();
  const ids = ['app-avatar-select', 'app-avatar-interaction'] as const;
  return <div className={styles.avatarPair} data-convo-avatar-pair>
    {ids.map((id, index) => {
      const media = getConvoAiMedia(id);
      return <figure key={id}>
        <div className={styles.avatarPhone}>
          <CompleteConvoAiVideo
            id={id}
            locale={locale}
            autoPlay={autoplayAllowed}
            loop
            muted
          />
        </div>
        <figcaption>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{media.copy[locale].title}</strong>
          <p>{media.copy[locale].description}</p>
        </figcaption>
      </figure>;
    })}
  </div>;
}
```

- [ ] **Step 3: Add the non-perspective two-column avatar layout**

```css
.avatarPair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  margin-block-start: 3rem;
}

.avatarPair figure {
  display: grid;
  min-width: 0;
  place-items: center;
  gap: 1rem;
  margin: 0;
  padding: clamp(1.5rem, 4vw, 3rem);
  border: 1px solid rgba(16, 17, 15, 0.18);
}

.avatarPhone {
  width: min(70%, 18rem);
  aspect-ratio: 592 / 1280;
  padding: 8px;
  overflow: hidden;
  border-radius: 30px;
  background: #070809;
}

.avatarPhone video {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 22px;
  object-fit: contain;
}

.avatarPair figcaption {
  width: 100%;
}

.avatarPair figcaption span {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

.avatarPair figcaption strong,
.avatarPair figcaption p {
  display: block;
  margin-block-start: 0.5rem;
}

@media (max-width: 800px) {
  .avatarPair { grid-template-columns: 1fr; }
}
```

- [ ] **Step 4: Replace the Chinese metadata chapter array**

Use:

```tsx
chapters: [
  { id: 'context-challenge', label: '背景与挑战' },
  { id: 'app-product-structure', label: 'App 产品结构' },
  { id: 'start-conversation', label: '开始实时对话' },
  { id: 'conversation-control', label: '对话控制' },
  { id: 'digital-human', label: '数字人互动' },
  { id: 'realtime-chain', label: '实时链路' },
  { id: 'delivery', label: '交付范围' },
],
```

Update the import to:

```tsx
import {
  ConvoAiAppShowcase,
  ConvoAiAvatarPair,
  ConvoAiPlaylist,
} from '@/components/convo-ai/convo-ai-media'
```

- [ ] **Step 5: Replace the public Chinese sections with the approved sequence**

The seven section shells and their media ownership must be exactly:

```tsx
<section id="context-challenge" data-convo-nav-tone="light">
  <header className="section-heading"><p className="section-index">00 / CONTEXT</p><h2>实时 AI 对话，不只是把聊天界面换成语音</h2></header>
  <div className="reading"><p className="lead">ConvoAI 是面向客户体验演示的 1 对 1 AI 对话产品，同时覆盖 App 与 Web。连接、聆听、生成和播放连续发生，字幕、摄像头、球体与数字人则把这些变化带到界面上。</p><p>我独立负责产品设计（Designer-reported），包括产品结构、核心交互、跨端体验与实时状态的界面表达；RTC / RTM 基础设施、AI 模型、数字人驱动与生产代码不属于个人设计产出。</p></div>
  <div className="state-flow" aria-label="对话状态链"><div><span>01</span><strong>Connecting</strong></div><div><span>02</span><strong>Ready</strong></div><div><span>03</span><strong>Listening</strong></div><div><span>04</span><strong>Thinking</strong></div><div><span>05</span><strong>Speaking</strong></div><div><span>06</span><strong>Interrupted</strong></div><div><span>07</span><strong>Recovery</strong></div></div>
</section>

<section id="app-product-structure" data-convo-nav-tone="light">
  <header className="section-heading"><p className="section-index">01 / APP STRUCTURE</p><h2>核心通话之外，App 仍要成为一个完整产品</h2></header>
  <div className="reading"><p className="lead">登录、首页结构、个人设置与设备连接共同建立移动端产品骨架。向下滚动四个场景，右侧手机在固定位置切换完整录屏。</p></div>
  <ConvoAiAppShowcase locale="zh" />
</section>

<section id="start-conversation" data-convo-nav-tone="dark">
  <header className="section-heading"><p className="section-index">02 / START</p><h2>从进入产品，到开始一段实时对话</h2></header>
  <div className="reading"><p className="lead">App 把权限、连接和就绪压缩为一条短路径；Web 展开 Agent、号码、布局和加入退出。两端共享状态语义，但不强行共享同一种布局。</p></div>
  <ConvoAiPlaylist locale="zh" ids={['app-conversation-start', 'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit']} />
</section>

<section id="conversation-control" data-convo-nav-tone="light">
  <header className="section-heading"><p className="section-index">03 / CONTROL</p><h2>对话中的控制权</h2></header>
  <div className="reading"><p className="lead">连续对话中，用户既要看懂声音、字幕、摄像头和球体如何同步，也要能够打断 AI、恢复新话轮，并决定哪些声音能够触发 Agent。</p></div>
  <div className="voiceprint-modes"><article><h3>Off</h3><p>关闭声纹限制，减少准备步骤。</p></article><article><h3>Seamless</h3><p>以更少打扰学习说话人。</p></article><article><h3>Personalized</h3><p>通过明确录入获得更强身份控制。</p></article></div>
  <ConvoAiPlaylist locale="zh" ids={['app-caption-camera', 'web-conversation', 'web-interrupt', 'app-voiceprint-lock']} />
</section>

<section id="digital-human" data-convo-nav-tone="light">
  <header className="section-heading"><p className="section-index">04 / DIGITAL HUMAN</p><h2>从选择数字人，到进入实时互动</h2></header>
  <div className="reading"><p className="lead">角色选择建立互动预期；进入通话后，音画同步、摄像头与画中画共同塑造临场感。两个场景并排呈现，保留选择与互动的前后关系。</p></div>
  <ConvoAiAvatarPair locale="zh" />
</section>

<section id="realtime-chain" data-convo-nav-tone="dark">
  <header className="section-heading"><p className="section-index">05 / REAL-TIME CHAIN</p><h2>一次回答背后的实时链路</h2></header>
  <div className="reading"><p className="lead">用户听到的是一段连续回答，背后却依次经过媒体传输、语音识别、模型生成、语音合成与声纹状态。实时数据与正在发生的对话并置，让处理过程能够被看见。</p></div>
  <div className="realtime-map"><article><strong>E2E</strong><p>端到端过程</p></article><article><strong>RTC</strong><p>媒体传输</p></article><article><strong>ASR</strong><p>语音识别</p></article><article><strong>LLM</strong><p>生成回答</p></article><article><strong>TTS</strong><p>语音合成</p></article><article><strong>Voiceprint</strong><p>说话人状态</p></article></div>
  <ConvoAiPlaylist locale="zh" ids={['web-realtime-data']} />
</section>

<section id="delivery" data-convo-nav-tone="light">
  <header className="section-heading"><p className="section-index">06 / DELIVERY</p><h2>交付范围</h2></header>
  <div className="reading"><p className="lead">产品已正式上线（Designer-reported）。现有证据支持 App 与 Web 的产品结构、话轮状态、字幕与摄像头、打断、声纹、硬件、数字人与实时数据设计，不延伸为未经验证的业务指标。</p></div>
  <p className="evidence-note">9 段 App 与 7 段 Web 录屏均保留完整时长；作品集的编辑只发生在视频之外。</p>
</section>
```

- [ ] **Step 6: Run unit and component tests**

Run:

```bash
npm test -- tests/unit/convo-ai-content.test.ts tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the Chinese page restructure**

```bash
git add content/work/convo-ai.zh.mdx components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css tests/unit/convo-ai-content.test.ts tests/component/convo-ai-media.test.tsx
git commit -m "feat: restructure ConvoAI Chinese case narrative"
```

## Task 6: Align the internal evidence blueprint

**Files:**
- Modify: `evidence/convo-ai/case-study-blueprint.zh.md`

- [ ] **Step 1: Replace the public chapter architecture table**

Use this exact public sequence:

```markdown
| 章节 | 回答的问题 | 主要证据 |
|---|---|---|
| 项目背景与设计挑战 | ConvoAI 是什么，实时 AI 通话为什么比文字聊天更难理解？ | 产品说明、职责边界、状态链 |
| App 产品结构与 UI 交互 | 核心通话之外，App 如何组织入口、首页、个人设置与设备连接？ | 登录、页面结构、个人设置、硬件设备四段完整录屏 |
| 从进入产品，到开始一段实时对话 | App 与 Web 如何完成进入、准备、连接、加入与退出？ | App 启动 + Web 登录、启动前、布局、加入退出 |
| 对话中的控制权 | 用户如何改变 AI 的话轮，以及哪些声音能够触发 Agent？ | 字幕摄像头、连续聊天、语音打断、声纹锁定 |
| 数字人互动 | 用户如何从选择数字人进入实时互动？ | 数字人选择与互动两段完整录屏 |
| 一次回答背后的实时链路 | 一次回答如何经过媒体、识别、生成与合成？ | Web 实时数据完整录屏 |
| 交付范围 | 最终交付了什么，现有证据能够支持哪些结论？ | Designer-reported 上线状态 + 16 段完整录屏 |
```

- [ ] **Step 2: Remove retired public-story language while retaining interview preparation**

Delete public recommendations that use these phrases:

```text
确认谁在参与
建立会话信心
定位实时问题
交付与反思
```

Keep reflection questions only under the internal interview-preparation heading and mark them as internal, not page content.

- [ ] **Step 3: Update the visual asset plan**

Add these rows:

```markdown
| Sequence 式 App 产品结构 | 在详情模板正文内展示四个移动端场景；左侧滚动说明，右侧固定手机 | 四段 App 原片完整循环；20px 媒体卡片；雾蓝 / 灰绿 / 灰粉 / 灰褐 | App 产品结构 |
| 数字人双屏 | 并排建立“选择 → 互动”的前后关系 | 两段 App 原片完整循环，无透视叠加 | 数字人互动 |
```

- [ ] **Step 4: Verify evidence language**

Run:

```bash
rg -n "确认谁在参与|建立会话信心|定位实时问题|交付与反思" evidence/convo-ai/case-study-blueprint.zh.md
rg -n "Designer-reported|20px|雾蓝|灰绿|灰粉|灰褐|完整" evidence/convo-ai/case-study-blueprint.zh.md
```

Expected: the first command returns no public-story matches; the second returns the attribution, card, and complete-video constraints.

- [ ] **Step 5: Commit the blueprint alignment**

```bash
git add evidence/convo-ai/case-study-blueprint.zh.md
git commit -m "docs: align ConvoAI evidence blueprint"
```

## Task 7: Verify browser behavior, responsiveness, and complete evidence

**Files:**
- Modify: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Make the E2E chapter expectation locale-specific**

```ts
const chapterIds = {
  en: [
    'context-thesis', 'ready', 'interrupt', 'trusted-participant',
    'avatar', 'realtime-system', 'delivery-reflection',
  ],
  zh: [
    'context-challenge', 'app-product-structure', 'start-conversation',
    'conversation-control', 'digital-human', 'realtime-chain', 'delivery',
  ],
} as const;
```

Use `chapterIds[locale]` in the structure assertion.

- [ ] **Step 2: Add a Chinese desktop scroll-switching test**

```ts
test('switches the Chinese App media card while preserving the case template', async ({ page }) => {
  test.skip(locale !== 'zh');
  const showcase = page.locator('[data-convo-app-showcase]');
  await showcase.scrollIntoViewIfNeeded();
  await expect(showcase).toHaveAttribute('data-active-id', 'app-login');
  await expect(page.getByRole('navigation', { name: '案例章节' })).toHaveCount(1);

  const profile = page.locator('[data-app-showcase-step="app-profile-settings"]');
  await profile.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(showcase).toHaveAttribute('data-active-id', 'app-profile-settings');
  await expect(showcase.locator('[data-media-card="app-profile-settings"]')).toHaveCSS('border-radius', '20px');
  await expect(showcase.locator('video')).toHaveAttribute('src', '/videos/convo-ai/app-profile-settings.mp4');

  const structure = page.locator('[data-app-showcase-step="app-structure"]');
  await structure.evaluate((element) => element.scrollIntoView({ block: 'center' }));
  await expect(showcase).toHaveAttribute('data-active-id', 'app-structure');
});
```

The existing `ChapterNav` accessible name is `案例章节` for Chinese. Keep the assertion and shared component unchanged.

- [ ] **Step 3: Replace the playlist-count assumption with source coverage across all ConvoAI media surfaces**

```ts
test('keeps all sixteen recordings reachable through visible media controls', async ({ page }) => {
  const sources = new Set<string>();

  if (locale === 'zh') {
    const showcase = page.locator('[data-convo-app-showcase]');
    for (const id of ['app-login', 'app-structure', 'app-profile-settings', 'app-hardware-device']) {
      const step = page.locator(`[data-app-showcase-step="${id}"]`);
      await step.evaluate((element) => element.scrollIntoView({ block: 'center' }));
      await expect(showcase).toHaveAttribute('data-active-id', id);
      sources.add((await showcase.locator('video').getAttribute('src')) ?? '');
    }

    for (const video of await page.locator('[data-convo-avatar-pair] video').all()) {
      sources.add((await video.getAttribute('src')) ?? '');
    }
  }

  const playlists = page.locator('[data-convo-ai-playlist]');
  for (let playlistIndex = 0; playlistIndex < await playlists.count(); playlistIndex += 1) {
    const playlist = playlists.nth(playlistIndex);
    const buttons = playlist.locator('button[aria-pressed]');
    for (let index = 0; index < await buttons.count(); index += 1) {
      await buttons.nth(index).click();
      const video = playlist.locator('video');
      await expect(video).toHaveAttribute('src', /\/videos\/convo-ai\/.+\.mp4/);
      sources.add((await video.getAttribute('src')) ?? '');
    }
  }

  expect(sources.size).toBe(16);
});
```

For English, keep the five existing playlists, which already expose all sixteen recordings. For Chinese, the four App showcase recordings, two avatar recordings, and ten playlist recordings together expose the same sixteen source files without mounting hidden videos.

- [ ] **Step 4: Run focused tests, then the full validation suite**

Run:

```bash
npm test -- tests/unit/convo-ai-content.test.ts tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
npm run lint
npm test
npm run build
```

Expected: all commands PASS.

- [ ] **Step 5: Start the app and run desktop/mobile Playwright checks**

Run in one terminal:

```bash
npm run dev -- --hostname 127.0.0.1 --port 65106
```

Run in another terminal:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=chromium
```

Expected: PASS with no horizontal overflow, one shared chapter navigation, reversible App scroll switching, 20px media-card radius, two desktop avatar columns, and one mobile avatar column.

- [ ] **Step 6: Inspect screenshots at desktop and mobile widths**

Verify all of the following in Playwright screenshots:

```text
1440px: outer chapter navigation and inner App scene list have distinct hierarchy
1440px: sticky App media card remains within the App section
1440px: phone size and anchor do not move between four card colors
1440px: digital-human videos are side by side and uncropped
390px: outer chapter navigation follows the template collapse behavior
390px: App showcase becomes an inline accordion without sticky overlap
390px: digital-human videos stack and all Chinese text remains inside its container
all widths: top navigation, chapter navigation, headings, media, and CPDI never overlap
```

- [ ] **Step 7: Commit E2E assertions and any evidence-based fixes**

```bash
git add tests/e2e/convo-ai.spec.ts
git commit -m "test: verify ConvoAI Chinese showcase experience"
```

## Final Verification

- [ ] Run `git diff --check` and expect no whitespace errors.
- [ ] Run `npm run lint` and expect PASS.
- [ ] Run `npm test` and expect PASS.
- [ ] Run `npm run build` and expect PASS.
- [ ] Run `npx playwright test tests/e2e/convo-ai.spec.ts --project=chromium` and expect PASS.
- [ ] Confirm `content/work/convo-ai.en.mdx` and English media copy were not changed by this plan.
- [ ] Confirm all nine App source durations and all sixteen source paths remain unchanged.
- [ ] Confirm only the case-local media cards use the four Morandi colors; `SiteHeader` and `ChapterNav` keep the detail-template iris theme.
