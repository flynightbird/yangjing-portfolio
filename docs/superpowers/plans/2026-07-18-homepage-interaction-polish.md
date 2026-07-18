# Homepage Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved homepage layout polish, unified CTA system, pointer field, ambient motion, section transitions, Archive scrolling fix, and Footer cleanup without changing project data or locked Archive card internals.

**Architecture:** Extend the existing `ActionLink` and `LiquidField` primitives, add two focused client-side decoration components (`PointerField` and `SectionReveal`), and compose them at homepage section boundaries. Keep all decorative layers pointer-transparent and preference-aware; preserve existing Hero and Archive ownership contracts.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Canvas 2D, Vitest/Testing Library, Playwright.

---

## File Map

- Create `public/icons/remix/arrow-right-up-line.svg`: pinned local Remix Icon asset.
- Modify `components/ui/action-link.tsx`: semantic CTA variants and local Remix external icon.
- Modify `components/ui/action-link.module.css`: white, signal-green, outline/A2, text, focus, and reduced-motion states.
- Create `components/home/pointer-field.tsx` and `pointer-field.module.css`: desktop C3 pointer trail and stationary multiline symbol field.
- Create `components/home/section-reveal.tsx` and `section-reveal.module.css`: one-shot section-entry masks and stagger hooks.
- Modify `components/ui/liquid-field.tsx`: softer palette, pale current, and section-local continuous particles.
- Modify `components/home/hero-motion.tsx` and `components/home/home.module.css`: remove visible internal bar, preserve accessible H1, tighten Hero, center Xuelang, relax desktop Archive snap, and add transition hooks.
- Modify homepage project components to use semantic CTA variants and reveal/suppression attributes.
- Modify `app/(localized)/[locale]/page.tsx`: mount `PointerField`, remove `AboutPreview`, and wrap Archive reveal.
- Modify `components/shell/site-footer.tsx` and `.module.css`: local Remix arrow, simplified metadata, softer liquid, and centered copyright.
- Modify `content/dictionaries/en.ts` and `zh.ts`: approved Archive titles.
- Modify focused component and E2E tests.

### Task 1: Lock Structure And Copy With Failing Tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/component/site-footer.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing component assertions**

Add assertions that the Hero has no visible internal topbar, homepage composition omits `AboutPreview`, Archive titles are `More Consumer Product Work` and `More C端用户设计作品`, Footer omits About/privacy, and Footer renders exactly `© 2026 Yang Jing`.

```tsx
expect(container.querySelector('[data-hero-topbar]')).not.toBeInTheDocument();
expect(screen.getByRole('heading', { level: 1, name: 'Yang Jing' })).toBeInTheDocument();
expect(screen.getByRole('heading', { name: 'More Consumer Product Work' })).toBeVisible();
expect(screen.queryByText(/Cloudflare Web Analytics/)).not.toBeInTheDocument();
expect(screen.getByText('© 2026 Yang Jing')).toBeVisible();
```

- [ ] **Step 2: Add failing E2E structure and wheel checks**

Use `page.mouse.wheel(0, 500)` with the pointer over `[data-archive-scroller]` and assert `window.scrollY` increases while `scrollLeft` does not consume the vertical delta.

- [ ] **Step 3: Run focused tests and verify failure**

Run: `npm test -- tests/component/homepage.test.tsx tests/component/site-footer.test.tsx`

Expected: FAIL on old Hero topbar, Archive copy, AboutPreview, and Footer metadata.

Run: `npx playwright test tests/e2e/homepage.spec.ts --project=chromium --grep "Archive.*vertical|homepage structure"`

Expected: FAIL until the new contract is implemented.

### Task 2: Implement The Shared CTA System

**Files:**
- Create: `public/icons/remix/arrow-right-up-line.svg`
- Modify: `components/ui/action-link.tsx`
- Modify: `components/ui/action-link.module.css`
- Modify: `tests/component/action-link.test.tsx`
- Modify: homepage CTA callers in `components/home/*.tsx`

- [ ] **Step 1: Write failing CTA variant tests**

Test `primary`, `signal`, and `secondary` data variants; verify external links render `[data-remix-icon="arrow-right-up-line"]`, retain secure target/rel behavior, and disabled links remain inert.

```tsx
expect(link).toHaveAttribute('data-action-variant', 'signal');
expect(link.querySelector('[data-remix-icon="arrow-right-up-line"]')).toBeInTheDocument();
```

- [ ] **Step 2: Run the ActionLink tests and verify failure**

Run: `npm test -- tests/component/action-link.test.tsx`

Expected: FAIL because `signal` and the Remix icon marker do not exist.

- [ ] **Step 3: Add the local Remix asset and variant API**

Pin the official `arrow-right-up-line` SVG under `public/icons/remix/`. Render it through a current-color CSS mask so the icon follows each CTA state without adding a package.

```ts
type ActionLinkVariant = 'primary' | 'signal' | 'secondary' | 'text';
```

Add `data-action-variant={variant}` and use the local Remix mask when an external link has no explicit icon.

- [ ] **Step 4: Implement the A2 outline fill**

Use an oversized lateral oval pseudo-element for `.secondary`; on hover/focus, move it fully past the far edge. Keep label/icon above the surface and provide a visible focus outline. Disable transforms under reduced motion.

- [ ] **Step 5: Apply semantic variants**

Use white-filled primary CTA for internal case studies, signal-green for AIDX/STT live products, and white outline for supporting actions. Preserve all current link destinations and transition-tone attributes.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- tests/component/action-link.test.tsx tests/component/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add public/icons/remix components/ui components/home tests/component
git commit -m "feat: unify homepage action treatments"
```

### Task 3: Implement Hero, Xuelang, Archive, And Footer Layout

**Files:**
- Modify: `components/home/hero-motion.tsx`
- Modify: `components/home/home.module.css`
- Modify: `app/(localized)/[locale]/page.tsx`
- Modify: `components/shell/site-footer.tsx`
- Modify: `components/shell/site-footer.module.css`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: focused component tests

- [ ] **Step 1: Remove the visible Hero topbar but keep an accessible H1**

Replace the three-column topbar with a visually hidden `h1` and move `.heroLayer` / `.heroDivider` to begin below the 78px site header. Anchor the portrait toward the bottom and reduce Hero minimum height without allowing portrait overflow.

- [ ] **Step 2: Center and enlarge the Xuelang media stage**

At desktop breakpoints, make the evidence project copy/media grid align to center and increase the media card's stable height/aspect constraint. Preserve the 20px radius and light surface.

- [ ] **Step 3: Relax desktop Archive snap without changing card internals**

Use `scroll-snap-type: x proximity`, `scroll-snap-stop: normal`, and non-containing inline overscroll for fine pointers. Retain intentional horizontal scrolling and mobile neighboring-card reveal.

- [ ] **Step 4: Remove AboutPreview and update Archive dictionaries**

Delete only the homepage composition import/render. Keep the About route and header link.

- [ ] **Step 5: Simplify Footer content**

Keep the email CTA, align its local Remix arrow, remove About/privacy, and render a centered literal `© 2026 Yang Jing`.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- tests/component/homepage.test.tsx tests/component/site-footer.test.tsx tests/unit/i18n.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app components/home components/shell content tests
git commit -m "feat: refine homepage section geometry"
```

### Task 4: Add C3 Pointer Field And Ambient Particles

**Files:**
- Create: `components/home/pointer-field.tsx`
- Create: `components/home/pointer-field.module.css`
- Modify: `components/ui/liquid-field.tsx`
- Modify: `components/ui/liquid-field.module.css`
- Modify: `components/home/hero-motion.tsx`
- Modify: `app/(localized)/[locale]/page.tsx`
- Create: `tests/component/pointer-field.test.tsx`
- Create: `tests/component/liquid-field.test.tsx`

- [ ] **Step 1: Write failing preference and interaction tests**

Mock `matchMedia`, fake timers, pointer movement, and stationary delay. Assert the trail exists only during movement, symbol lines appear sequentially after the delay, suppression zones clear both, and reduced/coarse pointer modes render no field.

```tsx
expect(container.querySelector('[data-pointer-trail]')).toHaveAttribute('data-moving', 'true');
await vi.advanceTimersByTimeAsync(520);
expect(container.querySelectorAll('[data-pointer-symbol-line]').length).toBeGreaterThanOrEqual(3);
```

- [ ] **Step 2: Run tests and verify failure**

Run: `npm test -- tests/component/pointer-field.test.tsx tests/component/liquid-field.test.tsx`

Expected: FAIL because the pointer field and enhanced liquid contract do not exist.

- [ ] **Step 3: Implement PointerField**

Use one fixed, `pointer-events:none`, `aria-hidden` layer. Listen to pointer movement only for `(hover: hover) and (pointer: fine)`. Suppress over links, buttons, text/content markers, media, `#archive`, and `#xuelang`. Use seeded character selection per stationary event to avoid render instability while retaining visual randomness.

- [ ] **Step 4: Enhance LiquidField**

Expand radial fields, soften alpha stops, add one restrained lavender-white current, and draw a low-density section-local particle set. Pause offscreen, freeze under reduced motion, and cap device pixel ratio.

- [ ] **Step 5: Mark suppression and ambient zones**

Add explicit data attributes to Visual Archive and Xuelang so pointer/particles remain absent. Reuse the existing Hero canvas for Hero code fragments rather than stacking a second Hero canvas.

- [ ] **Step 6: Run focused tests**

Run: `npm test -- tests/component/pointer-field.test.tsx tests/component/liquid-field.test.tsx tests/component/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add app components tests/component
git commit -m "feat: add ambient homepage interaction field"
```

### Task 5: Add One-Shot Cross-Section Transitions

**Files:**
- Create: `components/home/section-reveal.tsx`
- Create: `components/home/section-reveal.module.css`
- Modify: `components/home/featured-work.tsx`
- Modify: `app/(localized)/[locale]/page.tsx`
- Create: `tests/component/section-reveal.test.tsx`

- [ ] **Step 1: Write failing reveal lifecycle tests**

Mock `IntersectionObserver` and assert each wrapper moves from `pending` to `revealed` once, disconnects after reveal, exposes dark/light tone data, and renders immediately under reduced motion.

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/component/section-reveal.test.tsx`

Expected: FAIL because the component does not exist.

- [ ] **Step 3: Implement SectionReveal**

Use a broad mask pseudo-element and child stagger variables. Do not use scroll progress, wheel handlers, fixed pinning, or scroll locks. Use a soft white mask for Xuelang and dark/muted iris masks for dark chapters.

- [ ] **Step 4: Compose section boundaries**

Wrap the AI products, communication systems, AIDX, Xuelang, and Archive boundaries. Keep project IDs and DOM ordering unchanged.

- [ ] **Step 5: Run focused tests**

Run: `npm test -- tests/component/section-reveal.test.tsx tests/component/homepage.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app components/home tests/component
git commit -m "feat: add homepage section transitions"
```

### Task 6: Full Verification And Visual QA

**Files:**
- Modify: `tests/e2e/homepage.spec.ts` only for verified contract corrections

- [ ] **Step 1: Run all component and unit tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 2: Run static analysis and build**

Run: `npm run lint`

Expected: 0 errors; only documented pre-existing image warnings are acceptable.

Run: `npm run build:framework`

Expected: successful Next.js build.

- [ ] **Step 3: Run homepage E2E on desktop and mobile**

Run: `npx playwright test tests/e2e/homepage.spec.ts --project=chromium`

Expected: all applicable desktop and 390px checks pass; device-specific skips remain intentional.

- [ ] **Step 4: Inspect with agent-browser**

At `/zh/` and `/en/`, verify Hero drag/scan/reset, CTA hover end states, Archive vertical wheel behavior, AIDX/STT external tabs, Footer alignment, and no console errors.

- [ ] **Step 5: Capture visual evidence**

Capture desktop and 390px screenshots of Hero, Xuelang, Archive, AIDX, and Footer. Confirm no overlap, crop, hard liquid edges, blocked pointer interaction, or page-level horizontal overflow.

- [ ] **Step 6: Commit verification corrections**

```bash
git add tests components app content public
git commit -m "test: verify homepage interaction polish"
```

## Plan Self-Review

- Every approved specification section maps to a task.
- Visual Archive internals remain out of implementation scope.
- Existing page-transition sweeps remain separate from section-entry masks.
- Pointer, particle, and reveal components each have one responsibility.
- No task introduces scroll locking, new animation dependencies, or a full icon library.
- All new motion has touch and reduced-motion fallbacks.
