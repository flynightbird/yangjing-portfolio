# Home and About Scroll Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one-time, upward scroll reveals to below-the-fold Home and About text/media while preserving case-study click transitions and all existing scroll interactions.

**Architecture:** Introduce a shared client-side `ScrollReveal` boundary that owns `IntersectionObserver`, reduced-motion behavior, and stable state attributes. Pages and feature components only declare semantic `text` and `media` groups; a scoped CSS module provides the selected 22px, blur, fade, and 180ms media delay. Replace the old Home-only masked `SectionReveal`, but do not modify `PageTransitionLayer` or `data-page-transition-tone` links.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, IntersectionObserver, Vitest, Testing Library, Playwright.

---

## File Responsibility Map

- Create `components/ui/scroll-reveal.tsx`: one-time observer state and reduced-motion fallback.
- Create `components/ui/scroll-reveal.module.css`: text/media transition tokens and reduced-motion override.
- Create `tests/component/scroll-reveal.test.tsx`: observer, fallback, and reduced-motion contract.
- Modify `components/home/featured-work.tsx`: replace old reveal boundaries around project chapters.
- Modify `app/(localized)/[locale]/page.tsx`: replace the Visual Archive boundary.
- Modify Home project components: add `data-scroll-reveal-group="text"` and `"media"` only.
- Delete `components/home/section-reveal.tsx`, `components/home/section-reveal.module.css`, and `tests/component/section-reveal.test.tsx` after all consumers migrate.
- Modify `components/about/about-page.tsx`: wrap the three below-Hero bands and mark heading/content groups.
- Modify component and E2E tests: verify wiring, preserved page transitions, responsive behavior, and reduced motion.

### Task 1: Build the Shared ScrollReveal Contract

**Files:**
- Create: `components/ui/scroll-reveal.tsx`
- Create: `components/ui/scroll-reveal.module.css`
- Create: `tests/component/scroll-reveal.test.tsx`

- [ ] **Step 1: Write the failing component tests**

Create `tests/component/scroll-reveal.test.tsx` with a controllable observer. Assert the exact observer options, one-time reveal, disconnect, no-observer animation-frame fallback, and reduced-motion behavior:

```tsx
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ScrollReveal } from '@/components/ui/scroll-reveal';

let observerCallback: IntersectionObserverCallback | undefined;
const observe = vi.fn();
const disconnect = vi.fn();

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })));
}

describe('ScrollReveal', () => {
  beforeEach(() => {
    observerCallback = undefined;
    observe.mockReset();
    disconnect.mockReset();
    mockReducedMotion(false);
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
        observerCallback = callback;
        expect(options).toEqual({ threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      }
      observe = observe;
      disconnect = disconnect;
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('reveals once and disconnects', () => {
    const { container } = render(<ScrollReveal><p>Content</p></ScrollReveal>);
    const root = container.querySelector('[data-scroll-reveal]');
    expect(root).toHaveAttribute('data-scroll-reveal-state', 'pending');
    expect(observe).toHaveBeenCalledWith(root);

    act(() => observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ));

    expect(root).toHaveAttribute('data-scroll-reveal-state', 'revealed');
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('reveals on the next frame without IntersectionObserver', () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    const { container } = render(<ScrollReveal><p>Fallback</p></ScrollReveal>);
    act(() => frames[0]?.(0));
    expect(container.querySelector('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal-state',
      'revealed',
    );
  });

  it('renders immediately and skips observation for reduced motion', () => {
    mockReducedMotion(true);
    const { container } = render(<ScrollReveal><p>Static</p></ScrollReveal>);
    expect(container.querySelector('[data-scroll-reveal]')).toHaveAttribute(
      'data-scroll-reveal-state',
      'revealed',
    );
    expect(observe).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npx vitest run tests/component/scroll-reveal.test.tsx
```

Expected: FAIL because `@/components/ui/scroll-reveal` does not exist.

- [ ] **Step 3: Implement the shared component**

Create `components/ui/scroll-reveal.tsx`:

```tsx
'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import { useReducedMotionPreference } from '@/lib/use-reduced-motion';

import styles from './scroll-reveal.module.css';

export function ScrollReveal({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionPreference();
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reducedMotion) return;
    if (typeof IntersectionObserver === 'undefined') {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setRevealed(true);
      observer.disconnect();
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    observer.observe(root);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-scroll-reveal
      data-scroll-reveal-state={revealed ? 'revealed' : 'pending'}
    >
      {children}
    </div>
  );
}
```

Create `components/ui/scroll-reveal.module.css`:

```css
.root {
  position: relative;
}

.root :global([data-scroll-reveal-group]) {
  transition:
    opacity 740ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 740ms cubic-bezier(0.22, 1, 0.36, 1),
    filter 740ms cubic-bezier(0.22, 1, 0.36, 1);
}

.root[data-scroll-reveal-state='pending'] :global([data-scroll-reveal-group]) {
  opacity: 0;
  filter: blur(2px);
  transform: translateY(22px);
}

.root :global([data-scroll-reveal-group='media']) {
  transition-duration: 800ms;
  transition-delay: 180ms;
}

.root[data-scroll-reveal-state='revealed'] :global([data-scroll-reveal-group]) {
  opacity: 1;
  filter: none;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .root :global([data-scroll-reveal-group]) {
    opacity: 1 !important;
    filter: none !important;
    transform: none !important;
    transition: none !important;
  }
}
```

- [ ] **Step 4: Run GREEN and lint the new files**

Run:

```bash
npx vitest run tests/component/scroll-reveal.test.tsx
npx eslint components/ui/scroll-reveal.tsx tests/component/scroll-reveal.test.tsx
```

Expected: 3 tests pass and ESLint exits with zero errors.

- [ ] **Step 5: Commit the shared primitive**

```bash
git add components/ui/scroll-reveal.tsx components/ui/scroll-reveal.module.css tests/component/scroll-reveal.test.tsx
git commit -m "feat: add shared scroll reveal"
```

### Task 2: Migrate Home Without Touching Click Transitions

**Files:**
- Modify: `components/home/featured-work.tsx`
- Modify: `app/(localized)/[locale]/page.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/build-lab-media.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/visual-archive.tsx`
- Modify: `tests/component/homepage.test.tsx`
- Delete: `components/home/section-reveal.tsx`
- Delete: `components/home/section-reveal.module.css`
- Delete: `tests/component/section-reveal.test.tsx`

- [ ] **Step 1: Add failing Home wiring assertions**

In `tests/component/homepage.test.tsx`, add assertions to the existing `FeaturedWork` and `VisualArchive` suites:

```tsx
expect(container.querySelectorAll('[data-scroll-reveal]')).toHaveLength(4);
expect(container.querySelectorAll('[data-scroll-reveal-group="text"]')).not.toHaveLength(0);
expect(container.querySelectorAll('[data-scroll-reveal-group="media"]')).not.toHaveLength(0);
expect(container.querySelector('[data-section-reveal]')).not.toBeInTheDocument();

for (const projectId of ['call-agent', 'convo-ai', 'meeting', 'xuelang']) {
  const project = container.querySelector(`[data-project-id="${projectId}"]`);
  expect(project?.querySelector('[data-page-transition-tone]')).not.toBeNull();
}
```

For `VisualArchive`, assert its heading container is `text` and its viewport is `media`:

```tsx
expect(container.querySelector('[data-archive-header]')).toHaveAttribute(
  'data-scroll-reveal-group',
  'text',
);
expect(container.querySelector('[data-archive-scroller]')).toHaveAttribute(
  'data-scroll-reveal-group',
  'media',
);
```

- [ ] **Step 2: Run the Home tests to verify RED**

```bash
npx vitest run tests/component/homepage.test.tsx tests/component/section-reveal.test.tsx
```

Expected: new scroll-reveal assertions fail while the old SectionReveal tests still pass.

- [ ] **Step 3: Replace Home boundaries**

In `components/home/featured-work.tsx`, replace the import and all four wrappers while preserving the existing child props:

```tsx
import { ScrollReveal } from '@/components/ui/scroll-reveal';

<ScrollReveal>
  <FlagshipProjects
    locale={locale}
    callAgent={{
      copy: copy.callAgent,
      href: `${localeRoot}${callAgent.href}`,
    }}
    convoAi={{
      copy: copy.convoAi,
      href: `${localeRoot}${convoAi.href}`,
    }}
  />
</ScrollReveal>
<ScrollReveal>
  <CommunicationProjects
    locale={locale}
    meeting={{ copy: copy.meeting, href: `${localeRoot}${meeting.href}` }}
    stt={{ copy: copy.sttDemo, href: withBasePath(sttDemo.href) }}
  />
</ScrollReveal>
<ScrollReveal>
  <section data-project-chapter="visual-brand">
    <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
  </section>
</ScrollReveal>
<ScrollReveal>
  <section data-project-chapter="product-foundation">
    <FeaturedProject
      id="xuelang"
      copy={copy.xuelang}
      href={`${localeRoot}${xuelang.href}`}
      availability={xuelang.availability}
      companyId="bytedance"
      order="06"
      variant="evidence"
      media={{
        src: withBasePath('/images/xuelang/hero-panorama.webp'),
        width: 3000,
        height: 1500,
        alt: locale === 'zh'
          ? '学浪产品体验全景，呈现发现、决策与学习的关键界面'
          : 'Xuelang product panorama showing key discovery, purchase, and learning interfaces',
      }}
      transitionTone="light"
    />
  </section>
</ScrollReveal>
```

In `app/(localized)/[locale]/page.tsx`, replace only the Visual Archive wrapper:

```tsx
import { ScrollReveal } from '@/components/ui/scroll-reveal';

<ScrollReveal>
  <VisualArchive locale={locale} />
</ScrollReveal>
```

Do not wrap `DualIdentityHero` or `IntroStory`.

- [ ] **Step 4: Add semantic Home groups**

Add `data-scroll-reveal-group="text"` to:

- both `flagshipCopy` nodes in `flagship-projects.tsx`;
- `meetingHeading` and `meetingAction` in `meeting-preview.tsx`;
- `buildCopy` in `build-lab-preview.tsx`;
- `liveCopy` in `live-website-project.tsx`;
- `projectCopy` in `featured-project.tsx`;
- `archiveHeader` in `visual-archive.tsx`, also adding `data-archive-header` for stable tests.

Add `data-scroll-reveal-group="media"` to:

- both `flagshipMedia` nodes;
- `meetingStates`;
- the root `<a>` in `build-lab-media.tsx`;
- `liveMedia`;
- `projectMedia`;
- `archiveViewport`.

Do not remove or rename any `data-page-transition-tone`, archive scrolling, pointer, hover, or media attributes.

- [ ] **Step 5: Remove the old masked reveal implementation**

Delete:

```text
components/home/section-reveal.tsx
components/home/section-reveal.module.css
tests/component/section-reveal.test.tsx
```

Confirm no references remain:

```bash
rg -n "SectionReveal|data-section-reveal|section-mask" app components tests
```

Expected: no matches.

- [ ] **Step 6: Run Home GREEN tests**

```bash
npx vitest run tests/component/homepage.test.tsx tests/component/scroll-reveal.test.tsx
```

Expected: all selected tests pass, including existing navigation, Visual Archive wheel, and project-media assertions.

- [ ] **Step 7: Commit the Home migration**

```bash
git add app/'(localized)'/'[locale]'/page.tsx components/home components/ui tests/component/homepage.test.tsx tests/component/section-reveal.test.tsx
git commit -m "feat: refine homepage scroll reveals"
```

### Task 3: Apply the Shared Reveal to About Below the Hero

**Files:**
- Modify: `components/about/about-page.tsx`
- Modify: `tests/component/about-page.test.tsx`

- [ ] **Step 1: Add failing About structure tests**

Extend both locale cases in `tests/component/about-page.test.tsx`:

```tsx
const revealBoundaries = container.querySelectorAll('[data-about-page] [data-scroll-reveal]');
expect(revealBoundaries).toHaveLength(3);
expect(container.querySelector('.heroBand [data-scroll-reveal]')).not.toBeInTheDocument();

for (const boundary of revealBoundaries) {
  expect(boundary.querySelector('[data-scroll-reveal-group="text"]')).not.toBeNull();
  expect(boundary.querySelector('[data-scroll-reveal-group="media"]')).not.toBeNull();
}
```

Use a new `data-about-hero` attribute instead of the CSS-module class for the Hero exclusion assertion:

```tsx
expect(container.querySelector('[data-about-hero] [data-scroll-reveal]')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run About RED tests**

```bash
npx vitest run tests/component/about-page.test.tsx
```

Expected: FAIL because no About reveal boundaries or group attributes exist.

- [ ] **Step 3: Add the About reveal boundaries**

Import `ScrollReveal` and extend `SectionBand` with a `reveal` boolean:

```tsx
function SectionBand({
  className,
  children,
  reveal = false,
}: {
  readonly className?: string;
  readonly children: ReactNode;
  readonly reveal?: boolean;
}) {
  const content = <div className={styles.inner}>{children}</div>;
  return (
    <section className={[styles.band, className].filter(Boolean).join(' ')}>
      {reveal ? <ScrollReveal>{content}</ScrollReveal> : content}
    </section>
  );
}
```

Add `data-about-hero` directly to the existing `<div className={styles.hero}>`. Set `reveal` only on the capability, evidence, and career bands.

- [ ] **Step 4: Mark About text and media groups**

Set `data-scroll-reveal-group="text"` on `SectionHeading`'s `<header>`. Set `data-scroll-reveal-group="media"` on `capabilityGrid`, `evidenceGrid`, and a wrapper containing the timeline plus education row. Do not mark the Hero copy or orbit.

- [ ] **Step 5: Run About GREEN and the shared component tests**

```bash
npx vitest run tests/component/about-page.test.tsx tests/component/scroll-reveal.test.tsx
```

Expected: all tests pass for English and Chinese About content and reveal structure.

- [ ] **Step 6: Commit the About integration**

```bash
git add components/about/about-page.tsx tests/component/about-page.test.tsx
git commit -m "feat: add About scroll reveals"
```

### Task 4: Lock Page-Transition and Browser Behavior

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`
- Create: `tests/e2e/about-motion.spec.ts`
- Test only: `components/shell/page-transition-layer.tsx`
- Test only: `components/shell/page-transition-layer.module.css`

- [ ] **Step 1: Add an E2E one-time reveal test**

For `/en/`, observe a below-the-fold project boundary before and after scroll:

```ts
const reveal = page.locator('[data-scroll-reveal]').first();
await expect(reveal).toHaveAttribute('data-scroll-reveal-state', 'pending');
await reveal.scrollIntoViewIfNeeded();
await expect(reveal).toHaveAttribute('data-scroll-reveal-state', 'revealed');
await page.evaluate(() => window.scrollTo(0, 0));
await expect(reveal).toHaveAttribute('data-scroll-reveal-state', 'revealed');
```

Keep the existing `finishes the destination-toned sweep before same-tab navigation` and Meeting keyboard-transition tests unchanged. They already assert that Call Agent and Meeting activate the dark page-transition layer before navigation; their passing result is the regression proof.

- [ ] **Step 2: Add About desktop/mobile and reduced-motion coverage**

For both `/en/about/` and `/zh/about/`:

```ts
const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
await expect(boundaries).toHaveCount(3);
await boundaries.nth(0).scrollIntoViewIfNeeded();
await expect(boundaries.nth(0)).toHaveAttribute('data-scroll-reveal-state', 'revealed');
expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
```

Create `tests/e2e/about-motion.spec.ts` with complete locale and reduced-motion coverage:

```ts
import { expect, test } from '@playwright/test';

test.describe('About scroll reveals', () => {
  for (const locale of ['en', 'zh'] as const) {
    test(`${locale} reveals three below-Hero modules once`, async ({ page }) => {
      await page.goto(`/${locale}/about/`, { waitUntil: 'networkidle' });
      const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
      await expect(boundaries).toHaveCount(3);
      await expect(page.locator('[data-about-hero] [data-scroll-reveal]')).toHaveCount(0);

      const first = boundaries.nth(0);
      await first.scrollIntoViewIfNeeded();
      await expect(first).toHaveAttribute('data-scroll-reveal-state', 'revealed');
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(first).toHaveAttribute('data-scroll-reveal-state', 'revealed');
      expect(await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )).toBeLessThanOrEqual(1);
    });
  }

  test.describe('reduced motion', () => {
    test.use({ reducedMotion: 'reduce' });

    test('renders every About reveal group statically', async ({ page }) => {
      await page.goto('/en/about/', { waitUntil: 'networkidle' });
      const boundaries = page.locator('[data-about-page] [data-scroll-reveal]');
      await expect(boundaries).toHaveCount(3);
      expect(await boundaries.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-scroll-reveal-state')),
      )).toEqual(['revealed', 'revealed', 'revealed']);
      const styles = await page.locator('[data-scroll-reveal-group]').evaluateAll((groups) =>
        groups.map((group) => {
          const style = getComputedStyle(group);
          return { opacity: style.opacity, filter: style.filter, transform: style.transform };
        }),
      );
      expect(styles.every((style) =>
        style.opacity === '1' && style.filter === 'none' && style.transform === 'none'
      )).toBe(true);
    });
  });
});
```

- [ ] **Step 3: Run the focused browser tests**

```bash
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/about-motion.spec.ts --project=desktop --project=mobile
```

Expected: Home and About reveal checks pass at 1440x900 and 390x844; the existing click transition remains active; there is no horizontal overflow.

- [ ] **Step 4: Commit browser coverage**

```bash
git add tests/e2e/homepage.spec.ts tests/e2e/about-motion.spec.ts
git commit -m "test: verify localized scroll reveals"
```

### Task 5: Final Verification

**Files:**
- Verify all modified files from Tasks 1-4.

- [ ] **Step 1: Run focused component coverage**

```bash
npx vitest run tests/component/scroll-reveal.test.tsx tests/component/homepage.test.tsx tests/component/about-page.test.tsx tests/component/page-transition-layer.test.tsx tests/component/draft-case.test.tsx
```

Expected: all selected test files pass.

- [ ] **Step 2: Run static checks and production build**

```bash
npm run lint
npm run build:framework
git diff --check
```

Expected: ESLint has zero errors, the Next production build succeeds, and `git diff --check` is silent.

- [ ] **Step 3: Review all localized pages in a real browser**

Review `/en/`, `/zh/`, `/en/about/`, and `/zh/about/` at 1440x900 and 390x844. Verify:

- first-entry C motion is visible but does not shift layout;
- text leads media by 180ms;
- back-scroll does not replay;
- Hero and introduction motion are unchanged;
- Visual Archive still passes vertical wheel movement and horizontal controls;
- case-study clicks still show the black page transition;
- Footer reveal remains unchanged;
- reduced-motion mode is fully static.

- [ ] **Step 4: Confirm repository state**

```bash
git status --short
git log --oneline --max-count=5
```

Expected: no uncommitted implementation changes remain and the task commits are present.
