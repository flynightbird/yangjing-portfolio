# Home Hero Portrait Scale And Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce both Hero portraits to 90%, anchor them to the Hero baseline, and add a brief interaction-triggered motion echo behind the builder portrait.

**Architecture:** Preserve the existing `HeroMotion` scan and divider architecture. Add one decorative builder image ref and animate it through the browser Web Animations API from the existing `triggerScan` function, so scan and echo timing stay synchronized without new React state or dependencies. CSS owns the shared 90% geometry and hidden echo appearance; component and Playwright tests lock structure, dimensions, baseline alignment, triggers, and reduced-motion behavior.

**Tech Stack:** Next.js 16, React 19, CSS Modules, Web Animations API, Vitest, Testing Library, Playwright

---

## File Map

- Modify `components/home/hero-motion.tsx`: render one decorative builder echo, animate it from `triggerScan`, cancel prior animations, and expose deterministic run counts for browser tests.
- Modify `components/home/home.module.css`: apply the approved 90% widths, bottom anchoring, hidden blurred echo treatment, and reduced-motion suppression.
- Modify `tests/component/homepage.test.tsx`: lock the single decorative echo and asset mapping.
- Modify `tests/e2e/homepage.spec.ts`: verify geometry, baseline alignment, synchronized scan/echo triggers, and reduced-motion suppression.

### Task 1: Lock The Builder Echo Structure

**Files:**
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Add failing assertions for one decorative builder echo**

Add these assertions after the primary builder portrait checks:

```tsx
const builderEchoes = portraitScene?.querySelectorAll<HTMLImageElement>(
  '[data-hero-builder-echo]',
);
expect(builderEchoes).toHaveLength(1);
expect(builderEchoes?.[0]).toHaveAttribute(
  'src',
  expect.stringContaining('yang-jing-builder.png'),
);
expect(builderEchoes?.[0]).toHaveAttribute('alt', '');
expect(builderEchoes?.[0]).toHaveAttribute('data-echo-runs', '0');
```

- [ ] **Step 2: Run the focused component test and verify RED**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
```

Expected: FAIL because `[data-hero-builder-echo]` does not exist.

### Task 2: Lock The 90% Geometry And Echo Behavior

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add a portrait geometry test**

Add this test after the existing taller-first-viewport test:

```tsx
test('keeps the 90 percent portraits aligned to the Hero baseline', async ({ page }) => {
  await page.goto('/en/', { waitUntil: 'networkidle' });
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing viewport');

  const geometry = await page.evaluate(() => {
    const hero = document.querySelector<HTMLElement>('[data-media="portrait"]');
    const designer = document.querySelector<HTMLImageElement>(
      '[data-portrait-role="designer"]',
    );
    const builder = document.querySelector<HTMLImageElement>(
      '[data-portrait-role="builder"]',
    );
    if (!hero || !designer || !builder) throw new Error('Missing Hero portrait geometry');
    return {
      rootFontSize: Number.parseFloat(getComputedStyle(document.documentElement).fontSize),
      hero: hero.getBoundingClientRect().toJSON(),
      designer: designer.getBoundingClientRect().toJSON(),
      builder: builder.getBoundingClientRect().toJSON(),
    };
  });
  const expectedWidth = viewport.width < 768
    ? Math.min(viewport.width * 1.305, geometry.rootFontSize * 34.2)
    : Math.min(viewport.width * 0.495, geometry.rootFontSize * 42.1875);

  expect(geometry.designer.width).toBeCloseTo(expectedWidth, 0);
  expect(geometry.builder.width).toBeCloseTo(expectedWidth, 0);
  expect(geometry.designer.x).toBeCloseTo(geometry.builder.x, 1);
  expect(geometry.designer.y).toBeCloseTo(geometry.builder.y, 1);
  expect(geometry.designer.height).toBeCloseTo(geometry.builder.height, 1);
  expect(geometry.hero.bottom - geometry.designer.bottom).toBeLessThanOrEqual(1);
  expect(geometry.hero.bottom - geometry.builder.bottom).toBeLessThanOrEqual(1);
});
```

- [ ] **Step 2: Extend the reduced-motion test**

After the existing `data-scan-runs="0"` assertion, add:

```tsx
const builderEcho = page.locator('[data-hero-builder-echo]');
await expect(builderEcho).toHaveAttribute('data-echo-runs', '0');
await expect(builderEcho).toHaveCSS('display', 'none');
```

- [ ] **Step 3: Extend the keyboard and pointer interaction test**

After locating the canvas, add:

```tsx
const builderEcho = page.locator('[data-hero-builder-echo]');
const echoRunsBeforeKey = Number(await builderEcho.getAttribute('data-echo-runs'));
```

After pressing `ArrowRight`, add:

```tsx
await expect
  .poll(async () => Number(await builderEcho.getAttribute('data-echo-runs')))
  .toBeGreaterThan(echoRunsBeforeKey);
await expect
  .poll(() => builderEcho.evaluate((element) => element.getAnimations().length))
  .toBeGreaterThan(0);
```

- [ ] **Step 4: Run the new browser assertions and verify RED**

Run:

```bash
PW_PORT=4674 npx playwright test tests/e2e/homepage.spec.ts \
  --project=desktop --project=mobile \
  --grep "90 percent portraits|reduced-motion output|keyboard and pointer control"
```

Expected: FAIL because portrait widths are still 100%, the echo is missing, and no echo animation runs.

### Task 3: Implement Scale, Baseline Anchoring, And Echo

**Files:**
- Modify: `components/home/hero-motion.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Add the echo ref**

Add next to the existing canvas ref:

```tsx
const echoRef = useRef<HTMLImageElement>(null);
```

- [ ] **Step 2: Render the decorative echo before the primary builder portrait**

Inside `.builderField`, after the canvas and before the primary builder image, add:

```tsx
<Image
  ref={echoRef}
  className={`${styles.heroPortrait} ${styles.builderEcho}`}
  data-hero-builder-echo
  data-echo-runs="0"
  src={BUILDER_PORTRAIT_SRC}
  width={990}
  height={1055}
  alt=""
  priority
/>
```

- [ ] **Step 3: Synchronize echo animation with `triggerScan`**

Capture the echo with the canvas and Hero at the top of `useEffect`, declare `echoAnimation`, and extend `triggerScan`:

```tsx
const echo = echoRef.current;
if (!canvas || !hero || !echo) return;

let echoAnimation: Animation | null = null;

const triggerScan = () => {
  if (reducedMotionRef.current) return;
  scanRuns += 1;
  scanStart = performance.now();
  canvas.dataset.scanRuns = String(scanRuns);
  echo.dataset.echoRuns = String(scanRuns);
  if (window.__heroMotion) window.__heroMotion.scanRuns = scanRuns;

  if (typeof echo.animate === 'function') {
    echoAnimation?.cancel();
    echoAnimation = echo.animate(
      [
        { opacity: 0, transform: 'translateX(-50%)' },
        { opacity: 0.16, transform: 'translateX(calc(-50% + 12px))', offset: 0.22 },
        { opacity: 0.06, transform: 'translateX(calc(-50% + 4px))', offset: 0.68 },
        { opacity: 0, transform: 'translateX(-50%)' },
      ],
      {
        duration: 720,
        easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    );
  }
};
```

In `handleMotionChange`, cancel the animation when reduced motion becomes active:

```tsx
if (media.matches) {
  clearReset();
  stopSettle();
  echoAnimation?.cancel();
}
```

In the effect cleanup, add:

```tsx
echoAnimation?.cancel();
```

- [ ] **Step 4: Apply the approved geometry and echo styles**

Update the shared portrait rule:

```css
.heroPortrait {
  position: absolute;
  z-index: 3;
  inset-block-start: auto;
  inset-block-end: 0;
  inset-inline-start: 50%;
  width: min(49.5vw, 42.1875rem);
  max-width: none;
  height: auto;
  pointer-events: none;
  user-select: none;
  transform: translateX(-50%);
}
```

Add after the builder color treatment:

```css
.builderField .builderEcho {
  z-index: 2;
  opacity: 0;
  filter: grayscale(0.2) saturate(0.9) contrast(1.02) brightness(0.9) blur(12px);
  will-change: opacity, transform;
}
```

Update the mobile portrait override:

```css
.heroPortrait {
  inset-block-start: auto;
  inset-block-end: 0;
  width: min(130.5vw, 34.2rem);
}
```

Add to the existing reduced-motion media query:

```css
.builderEcho {
  display: none;
}
```

- [ ] **Step 5: Run component and browser tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
PW_PORT=4674 npx playwright test tests/e2e/homepage.spec.ts \
  --project=desktop --project=mobile \
  --grep "90 percent portraits|reduced-motion output|keyboard and pointer control"
```

Expected: component test PASSes; desktop/mobile geometry and reduced-motion tests PASS; desktop interaction test PASSes and the mobile interaction test is skipped by its existing device guard.

### Task 4: Regression, Visual Verification, And Commit

**Files:**
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Run the complete homepage component suite**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
```

Expected: all homepage component tests PASS.

- [ ] **Step 2: Run the complete desktop and mobile homepage browser suite**

Run:

```bash
PW_PORT=4674 npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: all applicable tests PASS; device-specific tests remain skipped.

- [ ] **Step 3: Capture and inspect desktop and mobile Hero screenshots**

Capture `/en/` at `1440x900` and `390x844`. Confirm that both primary portraits are visibly smaller, share exact bounds, meet the Hero bottom edge, and do not create text overlap or horizontal overflow. Trigger the Builder scan once and confirm the sharp portrait remains unchanged while only the low-opacity echo moves briefly.

- [ ] **Step 4: Run final diff checks**

Run:

```bash
git diff --check
git diff -- components/home/hero-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git status --short
```

Expected: no whitespace errors; only the four planned implementation/test files are included. Existing unrelated main-worktree modifications remain unstaged and outside the isolated implementation branch.

- [ ] **Step 5: Commit the implementation**

Run:

```bash
git add components/home/hero-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: refine home hero portrait motion"
```

Expected: one implementation commit containing only the approved Hero refinement.
