# Project Entry Sweep and Xuelang Noise Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a cinematic diagonal exit wipe for internal homepage case-study links and a subtle static noise finish to the light Xuelang case study while preserving external new-tab launches.

**Architecture:** A client-side `PageTransitionLayer` mounted once in the localized layout listens for activation of anchors with an explicit `data-page-transition-tone` contract. Eligible links animate a fixed viewport overlay before same-tab navigation; project components only declare destination tone. Xuelang owns its noise finish in its existing layout stylesheet so the effect cannot leak to other pages.

**Tech Stack:** Next.js App Router, React 19, TypeScript, CSS Modules, Vitest/Testing Library, Playwright.

---

### Task 1: Page transition behavior contract

**Files:**
- Create: `components/shell/page-transition-layer.tsx`
- Create: `components/shell/page-transition-layer.module.css`
- Create: `tests/component/page-transition-layer.test.tsx`
- Modify: `app/(localized)/[locale]/layout.tsx`

- [ ] **Step 1: Write failing component tests**

Test a marked internal anchor with `data-page-transition-tone="light"`, an
unmarked external anchor, a modified click, reduced motion, and duplicate
activation. Use fake timers and inject a navigation callback into the layer so
the tests verify that navigation happens only after `1200ms` without mutating
JSDOM's `window.location`.

```tsx
render(
  <PageTransitionLayer navigate={navigate}>
    <a href="/en/work/xuelang/" data-page-transition-tone="light">Xuelang</a>
  </PageTransitionLayer>,
);
await user.click(screen.getByRole('link', { name: 'Xuelang' }));
expect(screen.getByTestId('page-transition-layer')).toHaveAttribute('data-state', 'running');
expect(navigate).not.toHaveBeenCalled();
await vi.advanceTimersByTimeAsync(1200);
expect(navigate).toHaveBeenCalledWith('/en/work/xuelang/');
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/component/page-transition-layer.test.tsx`

Expected: FAIL because `PageTransitionLayer` does not exist.

- [ ] **Step 3: Implement the minimal transition controller**

Create a client component that renders its children and one decorative overlay.
Register one capture-phase document click listener, accept only unmodified
primary activations on marked self-target anchors, read `light | dark` from the
data attribute, prevent duplicate activation, and call
`navigate ?? window.location.assign` after `1200ms`. Bypass animation when
`prefers-reduced-motion: reduce` matches.

```tsx
export type PageTransitionTone = 'light' | 'dark';

export function PageTransitionLayer({ children, navigate = defaultNavigate }: Props) {
  const [transition, setTransition] = useState<{ tone: PageTransitionTone; href: string }>();
  // Resolve the closest marked anchor, preserve native exceptions, lock once,
  // and schedule navigation after PAGE_TRANSITION_DURATION_MS.
  return (
    <>
      {children}
      <div
        aria-hidden="true"
        className={styles.overlay}
        data-state={transition ? 'running' : 'idle'}
        data-tone={transition?.tone}
        data-testid="page-transition-layer"
      />
    </>
  );
}
```

Use a `315deg` diagonal edge, viewport overscan, a broad approximately `15%`
soft edge, `1.2s`, and `cubic-bezier(0.27, 0, 0.51, 1)`. The overlay is fixed,
non-interactive, and above the full shell. Reduced-motion CSS disables animation.

- [ ] **Step 4: Mount the layer and verify GREEN**

Wrap the localized header, main, and footer inside `PageTransitionLayer` so the
single capture boundary owns all localized internal links. Run:

`npm test -- tests/component/page-transition-layer.test.tsx`

Expected: all new transition tests PASS.

### Task 2: Mark internal project entries and preserve external launches

**Files:**
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Change homepage expectations and verify RED**

Update tests so Xuelang, Call Agent, and Meeting have no `_blank` target and
carry explicit tones (`light`, `dark`, `dark`). Keep ConvoAI, AIDX, and both STT
Demo links as secure `_blank` links without a transition tone.

```tsx
expect(xuelangLink).toHaveAttribute('data-page-transition-tone', 'light');
expect(xuelangLink).not.toHaveAttribute('target');
for (const link of callAgentLinks) {
  expect(link).toHaveAttribute('data-page-transition-tone', 'dark');
  expect(link).not.toHaveAttribute('target');
}
expect(aidxLink).not.toHaveAttribute('data-page-transition-tone');
expect(aidxLink).toHaveAttribute('target', '_blank');
```

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because all current homepage destinations still use `_blank` and
none declare transition tone.

- [ ] **Step 2: Implement explicit link declarations**

Add a `transitionTone` prop to `FeaturedProject`, render it as
`data-page-transition-tone`, and remove its `_blank` target. Set Xuelang to
`light`. Remove secure blank-target props from every Call Agent title/CTA/media
anchor and mark each `dark`; leave ConvoAI unchanged. Remove `_blank` from the
Meeting CTA and mark it `dark`. Do not change AIDX or STT Demo.

- [ ] **Step 3: Run homepage component tests and verify GREEN**

Run: `npm test -- tests/component/homepage.test.tsx tests/component/action-link.test.tsx`

Expected: all tests PASS; AIDX, STT Demo, and ConvoAI retain `noopener noreferrer`.

### Task 3: Add the Xuelang paper-noise finish

**Files:**
- Create: `public/images/xuelang/paper-noise.png`
- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/e2e/xuelang.spec.ts`

- [ ] **Step 1: Write failing structure tests**

Require one decorative, non-interactive noise element inside the Xuelang root,
before readable content, with `aria-hidden="true"` and `data-xuelang-noise`.

```tsx
const noise = container.querySelector('[data-xuelang-noise]');
expect(noise).toHaveAttribute('aria-hidden', 'true');
expect(noise).toHaveClass(styles.noise);
```

Run: `npm test -- tests/component/xuelang-layout.test.tsx`

Expected: FAIL because the noise layer is absent.

- [ ] **Step 2: Add the deterministic raster tile and layer**

Generate a small monochrome PNG tile with deterministic random luminance. Add
an absolutely positioned `.noise` element inside `.root`; repeat the tile at
native scale, set opacity to `0.035`, `pointer-events: none`, and keep it below
`.frame`. Give `.root` `position: relative; isolation: isolate; overflow: clip`,
and give `.frame` a positioned stacking context so text and controls remain
fully readable and interactive.

- [ ] **Step 3: Verify Xuelang behavior**

Run: `npm test -- tests/component/xuelang-layout.test.tsx`

Expected: all Xuelang component tests PASS.

### Task 4: Browser and regression verification

**Files:**
- Modify only if a verified defect requires it: transition or Xuelang files from Tasks 1-3

- [ ] **Step 1: Run focused and full static checks**

Run:

```bash
npm test -- tests/component/page-transition-layer.test.tsx tests/component/homepage.test.tsx tests/component/xuelang-layout.test.tsx
npm run lint
npm test
npm run build:framework
```

Expected: all commands exit `0`.

- [ ] **Step 2: Verify interaction in a real browser**

Start the dev server on an available localhost port. With agent-browser, verify
both locales and desktop/390px mobile:

- Xuelang starts a white transition and navigates only after the overlay covers.
- Call Agent and Meeting start black transitions and navigate in the same tab.
- AIDX and STT Demo retain `_blank` and have no transition marker.
- Modified click behavior remains native.
- Reduced motion navigates immediately.
- Xuelang noise renders without changing scroll width or blocking controls.

- [ ] **Step 3: Capture visual evidence**

Capture desktop and 390px screenshots of the Xuelang light background and at
least one mid-transition frame for white and black tones. Confirm no uncovered
corners, flash, overlap, or page-level horizontal overflow.

- [ ] **Step 4: Commit only task-owned files**

Stage the transition files, Xuelang noise files, directly modified project-link
files, tests, and this plan. Do not stage unrelated existing homepage/content
changes. Commit with a scoped feature message after verification.
