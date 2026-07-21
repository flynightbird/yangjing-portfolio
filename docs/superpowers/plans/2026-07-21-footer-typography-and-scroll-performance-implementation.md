# Footer Typography and Scroll Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce and relax the shared Footer heading, make its SVG email controls visually restrained, and replace the frame-heavy animated Footer canvas with an editable static CSS purple-gray background.

**Architecture:** Keep `SiteFooter` and `FooterRevealMotion` as the shared structural and scroll-reveal boundaries. Remove only the Footer instance of `LiquidField`, render all three mail icons through Lucide inline SVG, and place four static off-canvas radial gradients on the existing reveal layer so scrolling composites a cached surface instead of redrawing canvas pixels.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Lucide React, Vitest/Testing Library, Playwright

---

## File Map

- Modify `components/shell/site-footer.tsx`: remove the Footer canvas while preserving shared structure and reveal motion.
- Modify `components/shell/footer-email-actions.tsx`: render `Copy`, `Check`, and `ArrowUpRight` as consistently sized inline SVG controls.
- Modify `components/shell/site-footer.module.css`: apply compact typography, static purple-gray gradients, and 24px email action boxes.
- Modify `tests/component/site-footer.test.tsx`: specify the absence of the Footer canvas and the SVG icon contract.
- Modify `tests/e2e/footer-reveal.spec.ts`: verify computed typography, static background, icon/control dimensions, and existing reveal behavior.

### Task 1: Define the static Footer and SVG control contract

**Files:**
- Modify: `tests/component/site-footer.test.tsx`
- Modify: `tests/e2e/footer-reveal.spec.ts`

- [ ] **Step 1: Replace the component test's canvas expectation and add SVG assertions**

In the localized structure test, replace the current positive Footer canvas assertion with:

```tsx
expect(container.querySelector('[data-liquid-field="footer"]')).not.toBeInTheDocument();
expect(
  container.querySelector('[data-footer-email-icon="copy"]'),
).toHaveAttribute('width', '16');
expect(
  container.querySelector('[data-footer-email-icon="arrow"]'),
).toHaveAttribute('width', '16');
```

In the copy-success test, add:

```tsx
expect(document.querySelector('[data-footer-email-icon="check"]')).toHaveAttribute(
  'width',
  '16',
);
```

- [ ] **Step 2: Add browser assertions for type, background, and compact controls**

After the Footer becomes visible in the localized reveal test, evaluate the relevant computed styles:

```ts
const visualContract = await footer.evaluate((element) => {
  const title = element.querySelector('h2');
  const layer = element.querySelector<HTMLElement>('[data-footer-reveal-layer]');
  const address = element.querySelector<HTMLElement>(
    '[data-footer-email-control="address"]',
  );
  const copy = element.querySelector<HTMLElement>(
    '[data-footer-email-control="copy"]',
  );
  const arrow = element.querySelector<HTMLElement>(
    '[data-footer-email-control="arrow"]',
  );
  const copyIcon = element.querySelector<SVGElement>(
    '[data-footer-email-icon="copy"]',
  );
  const arrowIcon = element.querySelector<SVGElement>(
    '[data-footer-email-icon="arrow"]',
  );
  if (!title || !layer || !address || !copy || !arrow || !copyIcon || !arrowIcon) {
    return null;
  }

  const titleStyle = getComputedStyle(title);
  const addressStyle = getComputedStyle(address);
  return {
    titleSize: Number.parseFloat(titleStyle.fontSize),
    titleLineHeight: Number.parseFloat(titleStyle.lineHeight),
    backgroundImage: getComputedStyle(layer).backgroundImage,
    addressLineHeight: Number.parseFloat(addressStyle.lineHeight),
    copyHeight: copy.getBoundingClientRect().height,
    arrowHeight: arrow.getBoundingClientRect().height,
    copyIconWidth: copyIcon.getBoundingClientRect().width,
    arrowIconWidth: arrowIcon.getBoundingClientRect().width,
    footerCanvasCount: element.querySelectorAll('[data-liquid-field="footer"]').length,
  };
});

expect(visualContract).not.toBeNull();
if (!visualContract) throw new Error('Missing Footer visual contract');
expect(visualContract.footerCanvasCount).toBe(0);
expect(visualContract.backgroundImage.match(/radial-gradient/g)).toHaveLength(4);
expect(visualContract.titleLineHeight / visualContract.titleSize).toBeCloseTo(1.08, 2);
expect(visualContract.titleSize).toBeLessThanOrEqual(
  testInfo.project.name === 'mobile' ? 36 : 76,
);
expect(visualContract.copyHeight).toBeLessThanOrEqual(visualContract.addressLineHeight);
expect(visualContract.arrowHeight).toBeLessThanOrEqual(visualContract.addressLineHeight);
expect(visualContract.copyIconWidth).toBe(16);
expect(visualContract.arrowIconWidth).toBe(16);
```

- [ ] **Step 3: Run the targeted tests and confirm RED**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx
PW_PORT=4175 PW_REUSE_SERVER=1 npx playwright test tests/e2e/footer-reveal.spec.ts --project=desktop --project=mobile
```

Expected: component tests fail because the Footer canvas still exists and icon data attributes are absent; E2E fails because the old export still uses the large heading, canvas background, and 40px controls.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/component/site-footer.test.tsx tests/e2e/footer-reveal.spec.ts
git commit -m "test: define Footer performance and type contract"
```

### Task 2: Replace the animated Footer surface and refine typography

**Files:**
- Modify: `components/shell/site-footer.tsx`
- Modify: `components/shell/site-footer.module.css`

- [ ] **Step 1: Remove only the Footer `LiquidField` instance**

Delete this import and render call from `site-footer.tsx`:

```tsx
import { LiquidField } from '@/components/ui/liquid-field';
```

```tsx
<LiquidField variant="footer" interactive className={styles.liquid} />
```

Do not change `FooterRevealMotion`, `LiquidField`, or the AIDX surface.

- [ ] **Step 2: Add the static four-layer purple-gray background**

Replace the unused `.liquid` rule and give `.revealLayer` this static surface:

```css
.revealLayer {
  position: relative;
  min-height: inherit;
  background:
    radial-gradient(120% 105% at -18% 116%, rgba(47, 34, 62, 0.98) 0 36%, transparent 69%),
    radial-gradient(105% 92% at 112% -8%, rgba(184, 177, 193, 0.9) 0 31%, transparent 68%),
    radial-gradient(92% 88% at 72% 92%, rgba(119, 103, 139, 0.82) 0 30%, transparent 70%),
    radial-gradient(105% 92% at 38% 34%, rgba(82, 67, 102, 0.88) 0 32%, transparent 72%),
    #211a26;
  isolation: isolate;
}
```

Keep all gradients static and off-canvas enough to read as broad tonal regions rather than discrete orbs. Delete the old `.root::after` dark canvas overlay; the chosen gradient values provide the final surface and preserve the intended separation.

- [ ] **Step 3: Apply the approved compact heading scale**

Update `.cta h2` to:

```css
.cta h2 {
  max-width: 15ch;
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(2.25rem, 5vw, 4.75rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0;
}
```

- [ ] **Step 4: Run the component test to confirm the canvas contract is GREEN**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx
```

Expected: the canvas assertion passes; SVG assertions remain red until Task 3.

- [ ] **Step 5: Commit the static surface and typography**

```bash
git add components/shell/site-footer.tsx components/shell/site-footer.module.css
git commit -m "perf: replace animated Footer canvas"
```

### Task 3: Standardize compact inline SVG email controls

**Files:**
- Modify: `components/shell/footer-email-actions.tsx`
- Modify: `components/shell/site-footer.module.css`

- [ ] **Step 1: Render the arrow through Lucide and expose icon identities**

Change the import to:

```tsx
import { ArrowUpRight, Check, Copy } from 'lucide-react';
```

Render the state icons as:

```tsx
{copyState === 'copied' ? (
  <Check
    aria-hidden="true"
    size={16}
    strokeWidth={1.7}
    data-footer-email-icon="check"
  />
) : (
  <Copy
    aria-hidden="true"
    size={16}
    strokeWidth={1.7}
    data-footer-email-icon="copy"
  />
)}
```

Replace the masked span in the arrow link with:

```tsx
<ArrowUpRight
  className={styles.emailIcon}
  aria-hidden="true"
  size={16}
  strokeWidth={1.7}
  data-footer-email-icon="arrow"
/>
```

- [ ] **Step 2: Compact the email action tracks and hover box**

Update the relevant CSS to:

```css
.emailActions {
  display: inline-grid;
  max-width: 100%;
  grid-template-columns: minmax(0, auto) 1.5rem 1.5rem;
  align-items: center;
  column-gap: 0.25rem;
  margin-top: clamp(2rem, 5vh, 4rem);
}

.copyButton,
.emailArrow {
  display: grid;
  width: 1.5rem;
  height: 1.5rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: var(--color-paper);
  text-decoration: none;
}

.emailIcon {
  display: block;
  width: 1rem;
  height: 1rem;
  transition: transform 350ms var(--ease-out);
}

.emailArrow:hover .emailIcon,
.emailArrow:focus-visible .emailIcon {
  transform: translate(0.125rem, -0.125rem);
}
```

In the mobile media query, keep the same `1.5rem` tracks and remove the old `2.25rem` button dimensions. Keep the copy hover color `rgba(244, 245, 242, 0.12)` and existing focus outline.

- [ ] **Step 3: Run the Footer component tests and confirm GREEN**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/draft-case.test.tsx
```

Expected: all Footer email, SVG, clipboard success/reset/failure, and shared-layout tests pass.

- [ ] **Step 4: Commit the compact SVG controls**

```bash
git add components/shell/footer-email-actions.tsx components/shell/site-footer.module.css tests/component/site-footer.test.tsx
git commit -m "style: refine Footer email controls"
```

### Task 4: Rebuild and verify visuals, interaction, and scrolling

**Files:**
- Modify: `tests/e2e/footer-reveal.spec.ts`
- Verify: `components/shell/site-footer.tsx`
- Verify: `components/shell/footer-email-actions.tsx`
- Verify: `components/shell/site-footer.module.css`

- [ ] **Step 1: Run static checks and the production build**

Run:

```bash
git diff --check
npm run lint
npm run build:framework
```

Expected: no diff errors, no lint errors, and 17 static pages generated. The three pre-existing `xuelang-wipe-comparison.tsx` `<img>` warnings may remain.

- [ ] **Step 2: Restart the static export preview on port 4175**

Stop the existing `com.codex.yangjing-preview` launchd job, rebuild or refresh the static export according to the repository's preview workflow, and restart:

```bash
launchctl submit -l com.codex.yangjing-preview -- /bin/zsh -lc 'cd "/Users/admin/Documents/作品集-yangjing/worktrees/repository-migration" && exec env PORT=4175 /opt/homebrew/bin/node scripts/serve-static-export.mjs >>/tmp/yangjing-portfolio-preview.log 2>&1'
```

Confirm `http://localhost:4175/zh/` returns HTTP 200.

- [ ] **Step 3: Run Footer component and E2E regression tests**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/draft-case.test.tsx
PW_PORT=4175 PW_REUSE_SERVER=1 npx playwright test tests/e2e/footer-reveal.spec.ts tests/e2e/xuelang.spec.ts --project=desktop --project=mobile
```

Expected: Footer and Xuelang tests pass, with only viewport-specific skips.

- [ ] **Step 4: Repeat the measured scroll profile**

Use the same 1.2-second scroll from `scrollHeight - innerHeight - min(innerHeight * 1.35, 1100)` to the document bottom. Record frame count, average interval, p95, maximum, and counts above 20ms and 32ms.

Expected: no `data-liquid-field="footer"`, no interval above 32ms in the desktop verification environment, and a material improvement over the recorded 7-frame / 190ms-average / 518ms-maximum baseline.

- [ ] **Step 5: Capture and inspect desktop and mobile screenshots**

Capture the fully revealed Footer at 1440x900 for `/en/` and 390x844 for `/zh/`. Verify:

- the compact heading and `1.08` line height;
- separated deep, middle, and light purple-gray regions;
- 16px SVG icons and 24px hover box;
- email/icon alignment and no overlap;
- no horizontal overflow.

- [ ] **Step 6: Run final repository checks**

Run:

```bash
git diff --check
git status --short --branch
npm test
```

Expected: worktree clean after commits. Record the known repository-migration failures for missing Meeting/profile/resume publication assets without expanding this Footer task to fix them.
