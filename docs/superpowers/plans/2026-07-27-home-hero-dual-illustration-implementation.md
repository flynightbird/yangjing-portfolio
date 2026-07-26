# Home Hero Dual Illustration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage Hero's photographic Builder portrait with the approved `3.png` illustration while preserving exact registration with the existing `2.png` Designer portrait.

**Architecture:** Keep the existing two-layer `HeroMotion` composition and all CSS geometry unchanged. Add a clearly named public Builder illustration asset, point the existing Builder primary and echo images to it through their shared constant, and use the existing component and Playwright contracts to protect source mapping, alignment, baseline anchoring, motion, and responsive behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Create `public/images/profile/yang-jing-builder-illustration.png`: approved `3.png` source for the Builder primary and echo layers.
- Modify `tests/component/homepage.test.tsx`: assert both Builder images use the new explicit illustration asset.
- Modify `components/home/hero-motion.tsx`: update the shared Builder portrait source constant.
- Verify `components/home/home.module.css`: no edit; existing shared dimensions and bottom anchor remain the alignment contract.
- Verify `tests/e2e/homepage.spec.ts`: no edit expected; existing geometry and motion tests exercise the preserved behavior.

### Task 1: Establish The New Builder Asset Contract

**Files:**
- Modify: `tests/component/homepage.test.tsx:46-58`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write the failing component assertions**

Change both Builder source expectations while leaving the Designer expectation and accessibility assertions unchanged:

```tsx
expect(builderPortrait).toHaveAttribute(
  'src',
  expect.stringContaining('yang-jing-builder-illustration.png'),
);
expect(builderPortrait).toHaveAttribute('alt', '');
const builderEchoes = portraitScene?.querySelectorAll<HTMLImageElement>(
  '[data-hero-builder-echo]',
);
expect(builderEchoes).toHaveLength(1);
expect(builderEchoes?.[0]).toHaveAttribute(
  'src',
  expect.stringContaining('yang-jing-builder-illustration.png'),
);
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
```

Expected: FAIL because the rendered Builder and echo sources still contain `yang-jing-builder.png`.

- [ ] **Step 3: Add the approved illustration asset**

Copy the exact supplied RGBA image without recompression:

```bash
cp "/Users/admin/Desktop/声网 作品集 整理/照片/3.png" public/images/profile/yang-jing-builder-illustration.png
```

Confirm it is byte-identical to the source:

```bash
shasum -a 256 "/Users/admin/Desktop/声网 作品集 整理/照片/3.png" public/images/profile/yang-jing-builder-illustration.png
```

Expected: both lines report `7a2d66a115ec4f5f72e767dceeab0396071a9a373af3c287052d9514bc6d320f`.

- [ ] **Step 4: Point the Builder layers to the new asset**

In `components/home/hero-motion.tsx`, update only the shared source constant:

```tsx
const BUILDER_PORTRAIT_SRC = withBasePath(
  '/images/profile/yang-jing-builder-illustration.png',
);
```

Both the sharp Builder portrait and the existing echo already consume this constant, so no render or animation changes are required.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx -t "gives both identities equal semantic weight"
```

Expected: PASS with one Designer image using `yang-jing-designer.png` and both decorative Builder images using `yang-jing-builder-illustration.png`.

- [ ] **Step 6: Commit the asset contract and implementation**

```bash
git add tests/component/homepage.test.tsx components/home/hero-motion.tsx public/images/profile/yang-jing-builder-illustration.png
git commit -m "feat: use dual illustrations in home hero"
```

### Task 2: Verify Registration, Motion, And Responsive Rendering

**Files:**
- Verify: `components/home/home.module.css:145-176`
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts:443-475`

- [ ] **Step 1: Run the complete homepage component suite**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: all homepage component tests PASS with no new warnings.

- [ ] **Step 2: Start or reuse the local development server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 4176
```

Expected: the homepage is available at `http://127.0.0.1:4176/en/`. If port `4176` is already serving this worktree, reuse it and confirm the updated asset responds with HTTP 200.

- [ ] **Step 3: Run the focused Hero geometry and motion tests**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --grep "90 percent portraits aligned|builder portrait echo|reduced motion" --project=desktop --project=mobile
```

Expected: PASS. The two primary images have the same width, `x`, `y`, and height; both meet the Hero bottom; the Builder echo still runs only in normal motion and stays hidden in reduced motion.

- [ ] **Step 4: Inspect desktop composition**

At `1440 x 1000`, capture the Hero at the default divider and after moving the divider toward each side. Confirm:

- `2.png` is visible on Product Designer and `3.png` on AI-native Builder;
- eyes, face contour, shoulders, and lower image edge remain registered through the divider;
- both portraits remain at the approved 90% scale and touch the Hero baseline;
- the darker Builder linework remains legible without adding permanent blur;
- role copy remains unobscured and there is no horizontal overflow.

- [ ] **Step 5: Inspect mobile composition**

At `390 x 844`, repeat the default, left, and right divider checks. Confirm the head and shoulders remain framed, both layers share identical bounds, the baseline has no gap, and no text overlaps or overflows.

- [ ] **Step 6: Check the final diff and repository state**

Run:

```bash
git diff --check HEAD~1..HEAD
git status --short
```

Expected: no whitespace errors. The implementation commit contains only the component test, source constant, and new illustration asset; any `next-env.d.ts` rewrite caused by the dev server is restored to the committed worktree version before completion.

