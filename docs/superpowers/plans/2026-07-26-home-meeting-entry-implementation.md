# Homepage Meeting Entry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage Meeting text block with the approved bilingual Offset System entry using real Web and mobile recordings, accessible links, responsive layering, and reduced-motion poster fallback.

**Architecture:** Keep semantic copy and link ownership in `MeetingPreview`, and add a focused client-side `MeetingHomeMedia` component for proximity loading, reduced-motion selection, and a short GSAP scroll sequence. Keep the existing homepage CSS module and route conventions; test observable content, DOM contracts, network behavior, and computed geometry rather than GSAP internals.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP ScrollTrigger, Vitest/Testing Library, Playwright.

---

### Task 1: Lock The Approved Copy And Semantic Contract

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: `components/home/meeting-preview.tsx`

- [ ] **Step 1: Replace the old Meeting assertion with failing bilingual contract tests**

Assert the exact approved proposition, evidence line, three state names, platform names, and CTA for both locales. Assert three links within `[data-project-id="meeting"]`, all targeting the localized route, with accessible names for the title, media stage, and CTA. Assert the old long stage descriptions are absent.

```tsx
expect(within(meeting).getByText(expected.proposition)).toBeVisible();
expect(within(meeting).getByText(expected.evidence)).toBeVisible();
expect(within(meeting).getAllByRole('link')).toHaveLength(3);
expect(within(meeting).queryByText(/Meeting events change content priority/)).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because the approved proposition/evidence and title/media links do not exist.

- [ ] **Step 3: Replace dictionary stage descriptions with the approved state index**

Change the Meeting dictionary type to `states: readonly string[]`, add `platforms: readonly string[]`, and set the approved Chinese and English values verbatim. Combine role and status into the approved evidence line in rendering without inventing extra claims.

- [ ] **Step 4: Update the semantic article shell**

Render the linked `h2`, proposition, a media-stage link wrapping only the decorative media component slot, a descriptive state list, a platform track, evidence line, and explicit CTA. Preserve `data-page-transition-tone="dark"` on all links and keep the article itself unlinked.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: PASS with the three-link and bilingual copy contract.

- [ ] **Step 6: Commit**

```bash
git add tests/component/homepage.test.tsx content/dictionaries/en.ts content/dictionaries/zh.ts components/home/meeting-preview.tsx
git commit -m "feat: define homepage Meeting entry contract"
```

### Task 2: Add Proximity-Loaded Media With Poster-Only Reduced Motion

**Files:**
- Create: `components/home/meeting-home-media.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Add failing normal-motion and reduced-motion component tests**

Stub `matchMedia` and `IntersectionObserver`. In normal motion, intersect the stage and assert two muted, looping, inline videos with the exact MP4 sources and posters. In reduced motion, assert two poster images and zero `video`/`source[src$=".mp4"]` elements.

```tsx
expect(meeting.querySelectorAll('video')).toHaveLength(2);
expect(meeting.querySelector('[src$="meeting-hero-web.mp4"]')).toBeInTheDocument();
expect(meeting.querySelectorAll('[data-meeting-poster]')).toHaveLength(2);
expect(meeting.querySelector('video')).not.toBeInTheDocument();
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because `MeetingHomeMedia` and its media layers do not exist.

- [ ] **Step 3: Implement `MeetingHomeMedia`**

Use `useState` initialized from `prefers-reduced-motion`, listen for query changes, and observe the root with `{ rootMargin: '600px 0px' }`. Render `next/image` posters when reduced motion is active; otherwise retain each poster as the video `poster` and attach sources only after proximity. Mark visual media `aria-hidden="true"`, use `tabIndex={-1}`, and omit controls.

- [ ] **Step 4: Wire the media component into the media-stage link**

Pass a localized media accessible name from `MeetingPreview`; keep the visual subtree decorative and the link keyboard reachable.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: PASS for normal and reduced-motion DOM structures.

- [ ] **Step 6: Commit**

```bash
git add components/home/meeting-home-media.tsx components/home/meeting-preview.tsx tests/component/homepage.test.tsx
git commit -m "feat: add responsive Meeting home media"
```

### Task 3: Build The Offset System Layout And Short Motion Sequence

**Files:**
- Modify: `components/home/home.module.css`
- Modify: `components/home/meeting-home-media.tsx`
- Modify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Add failing structural motion tests**

Assert stable selectors for the motion root, Web surface, phone, three state items, and platform track, plus `data-meeting-motion="scrub"` and no pin marker.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because the motion and layer contracts are missing.

- [ ] **Step 3: Implement the responsive 12-column layout**

At desktop, assign copy to columns 1-4 and media to 5-12 with the near-black to deep blue-purple transition. Layer the Web browser and lower-right phone, keep state labels in three equal columns, and render the platform track below. At mobile, stack copy, media, evidence, and CTA; constrain all widths and overflow.

- [ ] **Step 4: Match the approved phone geometry**

Set `aspect-ratio: 590 / 1280`, `border: 4px solid #222428`, `border-radius: 14px`, inner video radius `10px`, dark background/shadow, and a final `rotate(2deg)` transform.

- [ ] **Step 5: Add the GSAP scrub sequence**

Dynamically import GSAP and ScrollTrigger only for `prefers-reduced-motion: no-preference`. Create one unpinned trigger from `top bottom-=10%` to `bottom top+=40%` with `scrub: 0.6`; scale/fade Web, enter phone from lower right, recede Web slightly, and activate state labels sequentially. Clean up the timeline/trigger on unmount and keep the mobile platform track static.

- [ ] **Step 6: Add reduced-motion CSS final state**

Disable transforms, transitions, and platform animation under `prefers-reduced-motion: reduce`; show the final layered composition without source requests.

- [ ] **Step 7: Run tests and lint the touched components**

Run: `npm test -- tests/component/homepage.test.tsx && npx eslint components/home/meeting-preview.tsx components/home/meeting-home-media.tsx content/dictionaries/en.ts content/dictionaries/zh.ts tests/component/homepage.test.tsx`

Expected: PASS with zero ESLint errors.

- [ ] **Step 8: Commit**

```bash
git add components/home/home.module.css components/home/meeting-home-media.tsx tests/component/homepage.test.tsx
git commit -m "feat: style and animate Meeting home entry"
```

### Task 4: Verify Browser Behavior, Requests, And Geometry

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add failing Playwright coverage**

For desktop, tablet, and mobile projects, assert `scrollWidth <= clientWidth`, Web and phone layers are visible, the phone is contained by the media stage, and all three links target `/en/work/meeting/`. On desktop assert computed phone ratio, `4px` border, `14px` outer radius, and `10px` video radius. Add reduced-motion context coverage that records requests and rejects either Meeting MP4.

- [ ] **Step 2: Run the focused E2E tests and verify RED**

Run: `npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "Meeting home entry"`

Expected: FAIL before final selector/network/geometry behavior is complete.

- [ ] **Step 3: Adjust implementation only for observed failures**

Fix responsive containment, accessible names, loading threshold, or final geometry without expanding scope. Do not weaken assertions that encode the approved specification.

- [ ] **Step 4: Run desktop, tablet, mobile, and reduced-motion coverage**

Run: `npx playwright test tests/e2e/homepage.spec.ts --grep "Meeting home entry"`

Expected: PASS in all configured projects with no Meeting MP4 request in reduced motion.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/homepage.spec.ts components/home/home.module.css components/home/meeting-home-media.tsx
git commit -m "test: cover Meeting homepage media behavior"
```

### Task 5: Visual And Regression Verification

**Files:**
- Modify only if verification reveals an approved-scope defect.

- [ ] **Step 1: Start the development server**

Run: `npm run dev -- --hostname 127.0.0.1 --port 4176`

Expected: Next.js reports ready at `http://127.0.0.1:4176`.

- [ ] **Step 2: Capture desktop and mobile screenshots**

Inspect `/zh/` and `/en/` at desktop and mobile widths. Verify product hierarchy, black-to-blue-purple transition, Web/phone depth, state readability, CTA order, focus visibility, and absence of overlap or horizontal scroll.

- [ ] **Step 3: Inspect reduced motion and network behavior manually**

Emulate reduced motion, reload near the Meeting section, and confirm poster-only rendering with no `.mp4` requests.

- [ ] **Step 4: Run fresh focused and broad verification**

Run: `npm test -- tests/component/homepage.test.tsx && npx playwright test tests/e2e/homepage.spec.ts --grep "Meeting home entry|published Meeting route" && npm run lint && npm run build`

Expected: all commands exit 0. Existing baseline Canvas warnings may remain, but no new warnings or errors are introduced.

- [ ] **Step 5: Review the final diff against the specification**

Confirm exact bilingual copy, three links, two normal-motion MP4s, poster-only reduced motion, old prose removal, responsive containment, phone geometry, unpinned short scrub, keyboard access, and no unrelated files.

- [ ] **Step 6: Commit any verification-only corrections**

```bash
git add components/home/home.module.css components/home/meeting-home-media.tsx tests/e2e/homepage.spec.ts
git commit -m "fix: polish Meeting home entry verification"
```
