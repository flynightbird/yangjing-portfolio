# ConvoAI Responsive Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every ConvoAI Web virtual browser derive its height from source aspect ratio while App media preserves the existing portrait size and rotates around the same short-edge baseline for landscape recordings.

**Architecture:** Keep `convo-ai-media-catalog.ts` as the dimension source of truth and add a framework-neutral sizing helper that returns orientation, aspect-ratio text, and numeric ratio. Media components expose that data through one shared DOM/CSS contract; CSS applies width-driven sizing to Web media and short-edge-driven sizing to App media, with uniform shrink-to-fit behavior on narrow screens.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Modify `components/convo-ai/convo-ai-media-catalog.ts`: add the shared orientation and sizing helper.
- Modify `components/convo-ai/convo-ai-media.tsx`: apply source sizing data to every Web/App media wrapper.
- Modify `components/convo-ai/convo-ai-media.module.css`: remove Web height constraints and add orientation-aware App short-edge sizing.
- Modify `tests/component/convo-ai-media.test.tsx`: cover sizing metadata and component DOM contracts.
- Modify `tests/e2e/convo-ai.spec.ts`: verify rendered ratios and 375px horizontal containment.

### Task 1: Define The Media Sizing Contract

**Files:**
- Modify: `components/convo-ai/convo-ai-media-catalog.ts`
- Test: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Write the failing helper tests**

Add imports and tests that exercise portrait, landscape, and Web sizing without React layout assumptions:

```ts
import {
  getConvoAiMedia,
  getConvoAiMediaSizing,
} from '@/components/convo-ai/convo-ai-media-catalog';

describe('getConvoAiMediaSizing', () => {
  it('describes source ratio and portrait orientation', () => {
    expect(getConvoAiMediaSizing(getConvoAiMedia('app-login'))).toEqual({
      aspectRatio: '592 / 1280',
      orientation: 'portrait',
      ratio: 592 / 1280,
    });
  });

  it('describes landscape orientation without forcing a portrait ratio', () => {
    expect(getConvoAiMediaSizing({ width: 1280, height: 592 })).toEqual({
      aspectRatio: '1280 / 592',
      orientation: 'landscape',
      ratio: 1280 / 592,
    });
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `getConvoAiMediaSizing` is not exported.

- [ ] **Step 3: Implement the minimal framework-neutral helper**

Add below `ConvoAiMediaItem`:

```ts
export type ConvoAiMediaOrientation = 'portrait' | 'landscape';

export interface ConvoAiMediaSizing {
  readonly aspectRatio: string;
  readonly orientation: ConvoAiMediaOrientation;
  readonly ratio: number;
}

export function getConvoAiMediaSizing(
  media: Pick<ConvoAiMediaItem, 'width' | 'height'>,
): ConvoAiMediaSizing {
  return {
    aspectRatio: `${media.width} / ${media.height}`,
    orientation: media.width > media.height ? 'landscape' : 'portrait',
    ratio: media.width / media.height,
  };
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit the sizing contract**

```bash
git add components/convo-ai/convo-ai-media-catalog.ts tests/component/convo-ai-media.test.tsx
git commit -m "test: define ConvoAI media sizing contract"
```

### Task 2: Apply Source Ratios To Every Media Wrapper

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Test: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Write failing component contract tests**

Add a helper in the test file:

```ts
function expectMediaSizing(
  element: Element | null,
  orientation: 'portrait' | 'landscape',
  aspectRatio: string,
) {
  expect(element).toHaveAttribute('data-media-orientation', orientation);
  expect(element).toHaveAttribute('data-convo-media-frame');
  expect(element).toHaveStyle({ aspectRatio });
}
```

Extend the existing playlist, conversation-start, stage, avatar, and showcase tests with assertions such as:

```ts
expectMediaSizing(
  container.querySelector('[data-media-card="web-realtime-data"] [data-convo-media-frame]'),
  'landscape',
  '2486 / 1598',
);

expectMediaSizing(
  container.querySelector('[data-convo-start-app] [data-convo-media-frame]'),
  'portrait',
  '592 / 1280',
);

expectMediaSizing(
  container.querySelector('[data-convo-web-plane]'),
  'landscape',
  '2486 / 1598',
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because wrappers do not yet expose the shared sizing contract.

- [ ] **Step 3: Add one local style adapter and apply it consistently**

Import `CSSProperties` and `getConvoAiMediaSizing`, then add:

```ts
type MediaSizingStyle = CSSProperties & {
  '--convo-media-ratio': number;
};

function mediaSizingProps(media: ReturnType<typeof getConvoAiMedia>) {
  const sizing = getConvoAiMediaSizing(media);
  return {
    'data-convo-media-frame': '',
    'data-media-platform': media.platform,
    'data-media-orientation': sizing.orientation,
    style: {
      aspectRatio: sizing.aspectRatio,
      '--convo-media-ratio': sizing.ratio,
    } as MediaSizingStyle,
  } as const;
}
```

Spread `mediaSizingProps(...)` onto these wrappers using their active media item:

- `ConvoAiPlaylist`: `.videoFrame`
- `ConvoAiConversationStart`: `.conversationWebMedia` and `.conversationPhone`
- `ConvoAiStage`: `.webPlane` and `.appDevice`
- `ConvoAiAvatarPair`: `.avatarPhone`
- `ConvoAiAppShowcase`: `.appShowcaseVideo`

For `ConvoAiStage`, resolve both catalog records before the return:

```ts
const webMedia = getConvoAiMedia(webId);
const appMedia = getConvoAiMedia(appId);
```

For mapped or active App media, use the item already resolved by the component rather than looking it up a second time.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: PASS with every wrapper exposing source ratio and orientation.

- [ ] **Step 5: Commit the component contract**

```bash
git add components/convo-ai/convo-ai-media.tsx tests/component/convo-ai-media.test.tsx
git commit -m "feat: expose ConvoAI media sizing metadata"
```

### Task 3: Implement Ratio-Driven Web And Short-Edge App CSS

**Files:**
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Test: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Add failing browser-level ratio and containment assertions**

Add helpers near the top of `tests/e2e/convo-ai.spec.ts`:

```ts
async function expectRenderedRatio(frame: Locator, expectedRatio: number) {
  const box = await frame.boundingBox();
  expect(box).not.toBeNull();
  expect(Math.abs(box!.width / box!.height - expectedRatio)).toBeLessThan(0.02);
}

async function expectInsideDocument(frame: Locator, page: Page) {
  const [box, documentWidth] = await Promise.all([
    frame.boundingBox(),
    page.evaluate(() => document.documentElement.clientWidth),
  ]);
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(-1);
  expect(box!.x + box!.width).toBeLessThanOrEqual(documentWidth + 1);
}
```

Add a test for the Chinese page that checks the Hero Web frame, conversation-start Web frame, real-time Web playlist, and representative App frames:

```ts
test('sizes Web media by source ratio and keeps every media frame inside the viewport', async ({ page }, testInfo) => {
  const heroWeb = page.locator('[data-convo-web-plane]').first();
  const startWeb = page.locator('[data-convo-start-web] [data-convo-media-frame]');
  const realtimeWeb = page.locator('[data-media-card="web-realtime-data"] [data-convo-media-frame]');

  await expectRenderedRatio(heroWeb, 2486 / 1598);
  await expectRenderedRatio(startWeb, 1291 / 816);
  await expectRenderedRatio(realtimeWeb, 2486 / 1598);

  if (testInfo.project.name === 'mobile') {
    const frames = page.locator('[data-convo-media-frame]');
    for (let index = 0; index < await frames.count(); index += 1) {
      await expectInsideDocument(frames.nth(index), page);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  }
});
```

- [ ] **Step 2: Run the targeted E2E test and verify RED**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile --grep "sizes Web media"
```

Expected: FAIL because the shared frame attributes are new and existing fixed height rules still override ratio-driven sizing.

- [ ] **Step 3: Remove fixed Web height constraints**

Update the Web rules:

```css
.evidence {
  min-width: 0;
  min-height: 0;
}

.videoFrame {
  width: 100%;
  max-width: 100%;
  height: auto;
  max-height: none;
}

.conversationWebMedia,
.webPlane {
  width: 100%;
  max-width: 100%;
  height: auto;
}

[data-convo-media-frame][data-media-platform='web'] video,
[data-convo-media-frame][data-media-platform='web'] img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
```

Remove the hard-coded `aspect-ratio` declarations from `.conversationWebMedia` and `.webPlane`, and remove the mobile `.videoFrame { min-height: 12rem; }` override. Do not remove App-specific sizing yet.

- [ ] **Step 4: Express App sizing through a short-edge custom property**

Make the relevant layout containers inline-size containers and preserve each current portrait width as `--convo-app-short-edge`:

```css
.evidence,
.conversationStage,
.stage,
.avatarFigure {
  container-type: inline-size;
}

.evidence[data-platform='app'] .videoFrame { --convo-app-short-edge: min(100cqi, 24rem); }
.conversationApp { --convo-app-short-edge: min(19cqi, 15rem); }
.appDevice { --convo-app-short-edge: min(22cqi, 16rem); }
.avatarPhone { --convo-app-short-edge: min(100cqi, 18rem); }
.appShowcaseVideo {
  --convo-app-short-edge: min(42cqw, 17rem, calc(46.25cqh - 2.3125rem));
}

[data-convo-media-frame][data-media-platform='app'][data-media-orientation='portrait'] {
  width: var(--convo-app-short-edge);
  max-width: 100%;
  height: auto;
}

[data-convo-media-frame][data-media-platform='app'][data-media-orientation='landscape'] {
  width: min(
    calc(var(--convo-app-short-edge) * var(--convo-media-ratio)),
    100%
  );
  max-width: 100%;
  height: auto;
}
```

Keep context-specific positioning, borders, padding, radius, and shadows. At `max-width: 800px` and `max-width: 640px`, change only `--convo-app-short-edge` values to match the current mobile portrait widths instead of overriding physical width independently:

```css
@media (max-width: 800px) {
  .appDevice { --convo-app-short-edge: 27cqi; }
}

@media (max-width: 640px) {
  .conversationApp { --convo-app-short-edge: min(72cqi, 17rem); }
}
```

For the conversation-start composition, let `.conversationApp` size to its media child rather than retaining a portrait-only percentage width; keep its absolute position and captions unchanged. The landscape formula makes the media frame's rendered height equal to the portrait short edge. If its calculated width exceeds the content area, the `min(..., 100%)` width constraint shrinks both axes through `aspect-ratio`.

- [ ] **Step 5: Run the targeted E2E test and verify GREEN**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile --grep "sizes Web media"
```

Expected: PASS for ratio and horizontal containment assertions.

- [ ] **Step 6: Run the full ConvoAI component and E2E suites**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
npx playwright test tests/e2e/convo-ai.spec.ts
```

Expected: PASS with existing carousel, autoplay, sound, stage, and responsive layout behavior intact.

- [ ] **Step 7: Commit responsive sizing**

```bash
git add components/convo-ai/convo-ai-media.module.css tests/e2e/convo-ai.spec.ts
git commit -m "feat: make ConvoAI media frames responsive"
```

### Task 4: Verify Production And Visual Layout

**Files:**
- Verify only; no expected source changes.

- [ ] **Step 1: Run static checks and production build**

Run:

```bash
npm run lint
npm run build:framework
git diff --check
```

Expected: ESLint has no errors, the Next.js build exits 0, and `git diff --check` has no output.

- [ ] **Step 2: Start the local app if it is not already running**

Run:

```bash
npm run dev -- --port 4193
```

Expected: `http://localhost:4193` is ready.

- [ ] **Step 3: Inspect desktop at 1440px**

Open `/zh/work/convo-ai/` and verify:

- Hero Web media follows `2486 / 1598` while the phone retains its current perceived size.
- Conversation-start Web and App overlap remains intentional.
- Web playlist and real-time chain surfaces contain the full recording without empty forced-height space.
- Portrait phone height matches the current production presentation.

- [ ] **Step 4: Inspect mobile at 375px**

Verify:

- Every Web frame fits the content width and derives height from its source ratio.
- Portrait App phones retain their narrow phone form and scale down only if required.
- A landscape App fixture or sizing-helper check follows the rotated short-edge rule.
- Sound buttons remain inside their media frame.
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 5: Record final repository state**

Run:

```bash
git status --short --branch
git log -4 --oneline
```

Expected: only pre-existing unrelated untracked files remain, and the responsive-media commits are at `HEAD`.
