# STT Home Media Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage STT poster with a Codex-style 4:8 project block containing a high-resolution crop of the real demo product stage and restrained pointer drift.

**Architecture:** Keep `BuildLabPreview` as the server-rendered project boundary and add one focused client leaf for pointer-driven media motion. Generate a checked-in image directly from the pinned local demo, use the direct static demo path for both links, and keep all layout styling in the existing homepage module.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Motion 12, Vitest, Testing Library, Playwright, agent-browser.

---

## File Map

- Create `public/images/stt-demo/stt-product-stage@2x.png`: derived 2x capture of the real `.land-visual` demo element.
- Create `components/home/build-lab-media.tsx`: client-only media link and pointer motion.
- Modify `components/home/build-lab-preview.tsx`: render copy plus the new media leaf.
- Modify `components/home/home.module.css`: 4:8 desktop grid, gradient stage, browser chrome, motion and mobile fallback.
- Modify `components/home/featured-work.tsx`: pass the direct STT demo path without a locale prefix.
- Modify `content/home.ts`: register the homepage STT destination as `/demos/stt-demo/index.html`.
- Modify `tests/component/homepage.test.tsx`: lock the new asset, links and non-iframe contract.
- Modify `tests/unit/home-content.test.ts`: lock the direct homepage destination.
- Modify `tests/e2e/homepage.spec.ts`: verify geometry, hover drift, reduced motion, direct URL and overflow.

### Task 1: Generate The Real Product-Stage Asset

**Files:**
- Create: `public/images/stt-demo/stt-product-stage@2x.png`

- [ ] **Step 1: Start a static server for the existing demo**

Run:

```bash
npx http-server public -p 4176 -c-1
```

Expected: `http://localhost:4176` serves `/demos/stt-demo/index.html` with all local CSS and assets.

- [ ] **Step 2: Capture only the real right-side product stage at 2x scale**

Run:

```bash
mkdir -p public/images/stt-demo
agent-browser --session stt-capture set viewport 1280 720 2
agent-browser --session stt-capture open http://localhost:4176/demos/stt-demo/index.html
agent-browser --session stt-capture wait --load networkidle
agent-browser --session stt-capture screenshot ".land-visual" public/images/stt-demo/stt-product-stage@2x.png
```

Expected: the PNG contains the product top bar, current speaker, original transcript, translation and participant rail, without the landing-page headline or CTA.

- [ ] **Step 3: Verify the asset dimensions and visual contents**

Run:

```bash
sips -g pixelWidth -g pixelHeight public/images/stt-demo/stt-product-stage@2x.png
```

Expected: width is at least 1200 physical pixels and height is at least 1000 physical pixels.

- [ ] **Step 4: Commit the asset**

```bash
git add public/images/stt-demo/stt-product-stage@2x.png
git commit -m "assets: add STT product stage capture"
```

### Task 2: Lock The Homepage Contract With Failing Tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/unit/home-content.test.ts`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Replace the old component expectation with the new asset and direct-link contract**

Add these assertions to the existing real-media test after changing it to retain the render container:

```tsx
const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
const stage = within(stt as HTMLElement).getByRole('img', {
  name: /STT Demo product stage/i,
});
expect(stage).toHaveAttribute(
  'src',
  '/images/stt-demo/stt-product-stage@2x.png',
);
expect(stt?.querySelector('iframe')).not.toBeInTheDocument();
expect(stt?.querySelector('[data-stt-media-stage]')).toBeInTheDocument();
for (const link of within(stt as HTMLElement).getAllByRole('link')) {
  expect(link).toHaveAttribute('href', '/demos/stt-demo/index.html');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link.getAttribute('rel')).toContain('noopener');
  expect(link.getAttribute('rel')).toContain('noreferrer');
}
```

- [ ] **Step 2: Lock the direct destination in the unit test**

Extend the STT project expectation:

```ts
expect(buildEntries[0]).toMatchObject({
  id: 'stt-demo',
  destination: 'internal-case',
  href: '/demos/stt-demo/index.html',
});
```

- [ ] **Step 3: Add browser assertions for geometry and motion**

Add a desktop test that asserts:

```ts
const stt = page.locator('[data-project-id="stt-demo"]');
const copy = stt.locator('[data-stt-copy]');
const media = stt.locator('[data-stt-media-stage]');
const windowFrame = stt.locator('[data-stt-browser-window]');
const copyBox = await copy.boundingBox();
const mediaBox = await media.boundingBox();
expect((mediaBox?.width ?? 0) / (copyBox?.width ?? 1)).toBeGreaterThan(1.7);
await expect(media).toHaveCSS('border-radius', '20px');
const before = await windowFrame.evaluate((node) => getComputedStyle(node).transform);
await media.hover({ position: { x: (mediaBox?.width ?? 400) - 24, y: 36 } });
await expect.poll(() => windowFrame.evaluate((node) => getComputedStyle(node).transform))
  .not.toBe(before);
```

Add direct-link and mobile overflow assertions using the same selectors. Add a reduced-motion project or emulation assertion that the browser window remains at its static transform.

- [ ] **Step 4: Run the focused tests and verify they fail for the intended reasons**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/unit/home-content.test.ts
```

Expected: FAIL because the old poster, old localized Build Lab link and missing media-stage attributes are still rendered.

### Task 3: Implement The Media Leaf And Codex Layout

**Files:**
- Create: `components/home/build-lab-media.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/home.module.css`
- Modify: `components/home/featured-work.tsx`
- Modify: `content/home.ts`

- [ ] **Step 1: Create the client-only pointer-motion leaf**

Implement the component with Motion values rather than React state:

```tsx
'use client';

import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import type { PointerEvent } from 'react';

import styles from './home.module.css';

interface BuildLabMediaProps {
  readonly href: string;
}

export function BuildLabMedia({ href }: BuildLabMediaProps) {
  const reduceMotion = useReducedMotion();
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 22, mass: 0.7 });
  const y = useSpring(rawY, { stiffness: 150, damping: 22, mass: 0.7 });

  const move = (event: PointerEvent<HTMLAnchorElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    rawX.set(((event.clientX - rect.left) / rect.width - 0.5) * 20);
    rawY.set(((event.clientY - rect.top) / rect.height - 0.5) * 12);
  };

  const reset = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <a
      className={styles.buildMedia}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open the interactive STT Demo in a new tab"
      data-stt-media-stage
      onPointerMove={move}
      onPointerLeave={reset}
      onBlur={reset}
    >
      <motion.div
        className={styles.buildBrowserWindow}
        data-stt-browser-window
        style={reduceMotion ? undefined : { x, y }}
      >
        <span className={styles.buildBrowserChrome} aria-hidden="true">
          <i /><i /><i />
        </span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/stt-demo/stt-product-stage@2x.png"
          width={1266}
          height={1120}
          alt="STT Demo product stage showing a speaker, bilingual transcript, translation, and participants"
          onError={(event) => { event.currentTarget.hidden = true; }}
        />
      </motion.div>
    </a>
  );
}
```

- [ ] **Step 2: Compose media and copy in the server component**

Render `buildCopy` first with `data-stt-copy`, then `<BuildLabMedia href={href} />`. Keep the localized facts and `ActionLink` unchanged apart from the direct `href`.

- [ ] **Step 3: Update the homepage destination**

Set the STT entry in `content/home.ts` to:

```ts
href: '/demos/stt-demo/index.html',
```

Pass it directly in `featured-work.tsx`:

```tsx
<BuildLabPreview copy={copy.sttDemo} href={sttDemo.href} />
```

- [ ] **Step 4: Implement the layout and visual styling**

Use the existing CSS Module names plus focused browser-window classes. Desktop rules must use `grid-template-columns: minmax(18rem, 4fr) minmax(0, 8fr)`, a 16:9 media aspect ratio, 20px radius, a scoped cool gradient, a 90% to 94% browser window, and transform-only hover motion. Mobile rules must use one column, put media first, keep `overflow: hidden`, and disable hover scale for coarse pointers. Reduced motion must disable CSS transitions and transform changes.

- [ ] **Step 5: Run focused tests until green**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/unit/home-content.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the implementation**

```bash
git add components/home/build-lab-media.tsx components/home/build-lab-preview.tsx components/home/featured-work.tsx components/home/home.module.css content/home.ts tests/component/homepage.test.tsx tests/unit/home-content.test.ts
git commit -m "feat: redesign STT homepage media card"
```

### Task 4: Browser Verification And Regression Coverage

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Run the homepage desktop and mobile browser tests**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: the 4:8 layout, 20px card, direct links, pointer drift, bilingual pages and no-overflow checks pass.

- [ ] **Step 2: Run the STT direct-demo regression suite**

Run:

```bash
npx playwright test tests/e2e/stt-demo.spec.ts
```

Expected: the existing direct demo and Build Lab route remain functional.

- [ ] **Step 3: Run static verification**

Run:

```bash
npm run lint
npm test
npm run build:framework
```

Expected: ESLint has no new errors, all Vitest suites pass, and Next.js builds successfully.

- [ ] **Step 4: Inspect final desktop and 390px screenshots**

Use `agent-browser` against the active local preview. Confirm the transcript is legible, the browser window stays inside the 20px stage, the media remains visually dominant, and the mobile crop prioritizes speaker and transcript.

- [ ] **Step 5: Commit browser coverage**

```bash
git add tests/e2e/homepage.spec.ts
git commit -m "test: cover STT homepage media behavior"
```
