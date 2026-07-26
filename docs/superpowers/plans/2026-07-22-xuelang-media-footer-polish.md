# Xuelang Media And Footer Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every non-cover Xuelang media card a consistent 20px radius, refine the interaction and validation media treatments, and close the case with the global site footer.

**Architecture:** Keep the change scoped to existing Xuelang components and MDX. Add one Xuelang media-radius token in the case root, consume it in each existing media container, and use `data-story-variant="result"` for the validation-only scale exception. Remove the case-specific contact invocation so the localized layout-level `SiteFooter` remains the sole page footer.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, MDX, Vitest, Testing Library, Playwright.

---

## File Map

- `components/xuelang/xuelang-layout.module.css`: owns the Xuelang radius token and panorama radius.
- `components/xuelang/xuelang-evidence.module.css`: applies the radius to evidence buttons, dark comparison, story media, and the result phone exception.
- `components/xuelang/xuelang-wipe-comparison.module.css`: clips the interactive before/after media at 20px.
- `components/xuelang/xuelang-course-entry.module.css`: clips the four-state interactive media at 20px.
- `components/xuelang/xuelang-interaction-board.tsx`: removes the obsolete bilingual caption.
- `components/xuelang/xuelang-interaction-board.module.css`: applies radius and light-green gradient.
- `content/work/xuelang.zh.mdx`, `content/work/xuelang.en.mdx`: remove the case-specific contact import and footer invocation.
- `tests/component/xuelang-interaction-board.test.tsx`: covers caption removal.
- `tests/component/xuelang-layout.test.tsx`, `tests/unit/xuelang-content.test.ts`: cover case-footer removal and global-footer handoff semantics.
- `tests/unit/xuelang-media-styles.test.ts`: covers exact media styling contracts.

### Task 1: Lock The Visual Contracts With Failing Tests

**Files:**
- Create: `tests/unit/xuelang-media-styles.test.ts`
- Modify: `tests/component/xuelang-interaction-board.test.tsx`
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/unit/xuelang-content.test.ts`

- [ ] **Step 1: Add the media CSS contract test**

Read the five CSS Modules and assert that the shared token is `20px`, the wipe/course-entry/interaction containers consume it, the interaction canvas declares a light-green linear gradient, and `.story-result .storyPrimary` uses `width: 70%` with no border on its media button.

```ts
expect(layoutCss).toMatch(/--xuelang-media-radius:\s*20px/);
expect(wipeCss).toMatch(/\.interactive\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s);
expect(courseCss).toMatch(/\.interactive\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s);
expect(interactionCss).toMatch(/\.canvas\s*{[^}]*border-radius:\s*var\(--xuelang-media-radius\)/s);
expect(interactionCss).toMatch(/linear-gradient\([^)]*#eef7f0[^)]*#dfeee3/i);
expect(evidenceCss).toMatch(/\.story-result \.storyPrimary\s*{[^}]*width:\s*70%/s);
expect(evidenceCss).toMatch(/\.story-result \.storyPrimary[^}]*button[^}]*border:\s*0/s);
```

- [ ] **Step 2: Add content and component assertions**

```ts
expect(container).not.toHaveTextContent('产品画面保持完整');
expect(container).not.toHaveTextContent('The product canvas stays intact');
expect(zh).not.toContain("import { XuelangContact }");
expect(en).not.toContain("import { XuelangContact }");
expect(zh).not.toContain('<XuelangContact');
expect(en).not.toContain('<XuelangContact');
expect(screen.queryByText('flydesigner_yangj')).not.toBeInTheDocument();
```

- [ ] **Step 3: Run the focused tests and observe the expected failures**

Run:

```bash
npm test -- --run \
  tests/unit/xuelang-media-styles.test.ts \
  tests/component/xuelang-interaction-board.test.tsx \
  tests/component/xuelang-layout.test.tsx \
  tests/unit/xuelang-content.test.ts
```

Expected: failures for missing `20px` token, existing interaction caption, missing 70% result rule, and existing `XuelangContact` references.

### Task 2: Implement Unified Media Styling

**Files:**
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `components/xuelang/xuelang-evidence.module.css`
- Modify: `components/xuelang/xuelang-wipe-comparison.module.css`
- Modify: `components/xuelang/xuelang-course-entry.module.css`
- Modify: `components/xuelang/xuelang-interaction-board.module.css`

- [ ] **Step 1: Add and consume the shared token**

Add to `.root`:

```css
--xuelang-media-radius: 20px;
```

Keep `.cover` without a radius. Apply `border-radius: var(--xuelang-media-radius)` with `overflow: hidden` to `.panorama`, evidence media buttons, `.darkComparison`, `.storyMedia`, wipe `.interactive`, course-entry `.interactive`, and interaction `.canvas`.

- [ ] **Step 2: Apply the interaction and validation exceptions**

```css
.canvas {
  background: linear-gradient(145deg, #eef7f0 0%, #dfeee3 100%);
}

.story-result .storyPrimary {
  width: 70%;
  margin-inline: auto;
}

.story-result .storyPrimary :global(button) {
  border: 0;
}
```

Retain the validation phone's aspect ratio and existing centered layout. In mobile rules, do not override the 70% width.

- [ ] **Step 3: Run the style test**

Run:

```bash
npm test -- --run tests/unit/xuelang-media-styles.test.ts
```

Expected: PASS.

### Task 3: Remove Obsolete Caption And Case Footer

**Files:**
- Modify: `components/xuelang/xuelang-interaction-board.tsx`
- Modify: `content/work/xuelang.zh.mdx`
- Modify: `content/work/xuelang.en.mdx`
- Modify: `tests/component/xuelang-interaction-board.test.tsx`
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/unit/xuelang-content.test.ts`

- [ ] **Step 1: Remove interaction caption data and markup**

Delete both `caption` entries from the component copy and remove:

```tsx
<figcaption>{text.caption}</figcaption>
```

- [ ] **Step 2: Remove case contact imports and invocations**

Delete from both MDX files:

```tsx
import { XuelangContact } from '@/components/xuelang/xuelang-contact'
```

and delete the closing `<XuelangContact locale="..." />` from each results section. Do not remove `SiteFooter` from `app/(localized)/[locale]/layout.tsx`.

- [ ] **Step 3: Run focused content and component tests**

Run:

```bash
npm test -- --run \
  tests/component/xuelang-interaction-board.test.tsx \
  tests/component/xuelang-layout.test.tsx \
  tests/unit/xuelang-content.test.ts
```

Expected: PASS with no case-specific contact or obsolete caption rendered.

### Task 4: Browser And Repository Verification

**Files:**
- Verify: `components/xuelang/*`
- Verify: `content/work/xuelang.*.mdx`

- [ ] **Step 1: Run the complete automated checks**

```bash
npm test -- --testTimeout=30000
npm run lint
npm run build:framework
PW_REUSE_SERVER=1 PW_PORT=4174 npx playwright test \
  tests/e2e/xuelang.spec.ts tests/e2e/xuelang.visual.spec.ts --project=desktop
git diff --check
```

Expected: all tests and production build pass; lint has no errors. Existing unrelated `<img>` warnings may remain.

- [ ] **Step 2: Verify desktop and mobile in the browser**

At `1440x900`, verify all non-cover media cards have a computed `20px` radius, the opening cover remains `0px`, the interaction canvas has a light-green gradient, the validation phone is 70% of its parent, and the page ends with `body > footer` rather than a case contact block.

At `390x844`, verify no horizontal overflow, the validation phone remains centered and legible, media clipping is clean, and both interactive modules remain operable.

- [ ] **Step 3: Commit implementation**

```bash
git add app components content tests
git commit -m "style: polish Xuelang media and footer"
```

Do not stage `tmp/`. Do not push unless the user explicitly requests it.
