# Homepage AI Toolchain Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved bilingual AI toolchain copy beneath the third Homepage introduction statement while preserving the three-scene structure, Hero, motion, and responsive layout.

**Architecture:** Keep localized copy in `IntroStory` and generalize each optional support line from one fixed emphasis slot to an ordered array of text fragments. `IntroStoryMotion` will render emphasized fragments as semantic `strong` elements inside the existing support paragraph, so all tool names reuse the current iris styling without adding a new visual component.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright

---

## File Structure

- Modify `tests/component/homepage.test.tsx`: lock the approved Chinese and English copy, the five emphasized tool names, and the unchanged three-scene structure.
- Modify `components/home/intro-story.tsx`: store localized support paragraphs as ordered fragments and add the third-scene toolchain copy.
- Modify `components/home/intro-story-motion.tsx`: define the support-fragment contract and render any number of emphasized fragments in source order.
- Verify `components/home/home.module.css`: reuse `.introSupport` and `.introSupport strong`; change it only if browser verification proves the approved copy clips or overlaps at 390px.
- Verify `tests/e2e/homepage.spec.ts`: use its existing horizontal-overflow contract during focused browser verification; no new end-to-end test is needed unless the existing contract fails to cover the mobile project.

### Task 1: Lock the localized content contract

**Files:**
- Modify: `tests/component/homepage.test.tsx:51-87`

- [ ] **Step 1: Write the failing English content and emphasis assertions**

Replace the current English `IntroStory` test with:

```tsx
it('renders the approved three-stage English introduction and AI toolchain', () => {
  const { container } = render(<IntroStory locale="en" />);
  const scenes = container.querySelectorAll('[data-intro-scene]');

  expect(scenes).toHaveLength(3);
  expect(container.querySelectorAll('[data-intro-emphasis]')).toHaveLength(3);
  expect(container.querySelectorAll('[data-intro-line]')).toHaveLength(0);
  expect(scenes[0]).toHaveTextContent(
    "Hi, I'm Yang Jing, a UX/UI designer with more than a decade of experience.",
  );
  expect(scenes[2]).toHaveTextContent(
    /moving from concept and prototype to real experience/,
  );
  expect(scenes[2]).toHaveTextContent(
    'I work fluently with Codex, Claude Design, and Figma Make to explore ideas and turn designs into working products. With AIGC tools such as Midjourney and Jimeng AI, I expand the visual language and bring greater coherence and polish to the product.',
  );
  expect(
    Array.from(scenes[2].querySelectorAll('[data-intro-support-emphasis]')).map(
      (element) => element.textContent,
    ),
  ).toEqual(['Codex', 'Claude Design', 'Figma Make', 'Midjourney', 'Jimeng AI']);
});
```

- [ ] **Step 2: Extend the Chinese content test**

Replace the final `data-intro-vibe` assertion in the Chinese test with:

```tsx
expect(scenes[2]).toHaveTextContent(
  '熟练运用 Codex、Claude Design 与 Figma Make 进行设计探索，将创意转化为可运行的产品；结合 Midjourney、即梦等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。',
);
expect(
  Array.from(scenes[2].querySelectorAll('[data-intro-support-emphasis]')).map(
    (element) => element.textContent,
  ),
).toEqual(['Codex', 'Claude Design', 'Figma Make', 'Midjourney', '即梦']);
```

Keep the existing assertions for the first scene's support paragraph and the third primary statement.

- [ ] **Step 3: Run the focused test and verify it fails for the missing toolchain**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because the third scene does not yet contain the approved support copy or `[data-intro-support-emphasis]` elements.

- [ ] **Step 4: Commit the failing contract**

```bash
git add tests/component/homepage.test.tsx
git commit -m "test: define homepage AI toolchain copy"
```

### Task 2: Implement fragment-based support copy

**Files:**
- Modify: `components/home/intro-story.tsx:8-63`
- Modify: `components/home/intro-story-motion.tsx:14-29`
- Modify: `components/home/intro-story-motion.tsx:204-210`

- [ ] **Step 1: Generalize the support-copy type**

Add this interface above `IntroStoryMotionProps`:

```tsx
interface IntroSupportFragment {
  readonly text: string;
  readonly emphasis?: boolean;
}
```

Then replace the current fixed `support` object type with:

```tsx
readonly support?: readonly IntroSupportFragment[];
```

- [ ] **Step 2: Convert the existing first-scene support copy to fragments**

In both locales in `intro-story.tsx`, replace the first scene's `support` object with an array. English:

```tsx
support: [
  { text: 'Welcome to a portfolio I designed and built through ' },
  { text: 'Vibe Coding', emphasis: true },
  { text: '.' },
],
```

Chinese:

```tsx
support: [
  { text: '欢迎来到这个由我亲手设计，并通过 ' },
  { text: 'Vibe Coding', emphasis: true },
  { text: ' 构建的作品集。' },
],
```

- [ ] **Step 3: Add the approved English third-scene support fragments**

Add this `support` array to the third English scene:

```tsx
support: [
  { text: 'I work fluently with ' },
  { text: 'Codex', emphasis: true },
  { text: ', ' },
  { text: 'Claude Design', emphasis: true },
  { text: ', and ' },
  { text: 'Figma Make', emphasis: true },
  { text: ' to explore ideas and turn designs into working products. With AIGC tools such as ' },
  { text: 'Midjourney', emphasis: true },
  { text: ' and ' },
  { text: 'Jimeng AI', emphasis: true },
  { text: ', I expand the visual language and bring greater coherence and polish to the product.' },
],
```

- [ ] **Step 4: Add the approved Chinese third-scene support fragments**

Add this `support` array to the third Chinese scene:

```tsx
support: [
  { text: '熟练运用 ' },
  { text: 'Codex', emphasis: true },
  { text: '、' },
  { text: 'Claude Design', emphasis: true },
  { text: ' 与 ' },
  { text: 'Figma Make', emphasis: true },
  { text: ' 进行设计探索，将创意转化为可运行的产品；结合 ' },
  { text: 'Midjourney', emphasis: true },
  { text: '、' },
  { text: '即梦', emphasis: true },
  { text: '等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。' },
],
```

- [ ] **Step 5: Render fragments in accessible source order**

Replace the current support paragraph body in `intro-story-motion.tsx` with:

```tsx
{scene.support.map((fragment, fragmentIndex) =>
  fragment.emphasis ? (
    <strong
      key={`${fragmentIndex}-${fragment.text}`}
      data-intro-support-emphasis
    >
      {fragment.text}
    </strong>
  ) : (
    <span key={`${fragmentIndex}-${fragment.text}`}>{fragment.text}</span>
  ),
)}
```

Keep the existing `<p className={styles.introSupport} data-intro-support>` wrapper. Do not add an `aria-label`; the DOM text order is already the correct spoken sentence.

- [ ] **Step 6: Run the focused component test**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: PASS, including three scenes in both locales and five emphasized tool names in each third scene.

- [ ] **Step 7: Run lint and the complete unit/component suite**

Run:

```bash
npm run lint
npm test
```

Expected: both commands exit 0 with no ESLint errors and all Vitest tests passing.

- [ ] **Step 8: Commit the implementation**

```bash
git add components/home/intro-story.tsx components/home/intro-story-motion.tsx
git commit -m "feat: add homepage AI toolchain copy"
```

### Task 3: Verify responsive presentation and motion boundaries

**Files:**
- Verify: `components/home/home.module.css:478-490`
- Verify: `components/home/home.module.css:557-582`
- Verify: `tests/e2e/homepage.spec.ts`
- Modify only if required by a reproduced failure: `components/home/home.module.css`

- [ ] **Step 1: Start the local development server**

Run:

```bash
npm run dev
```

Expected: Next.js starts successfully and prints the local URL without compilation errors.

- [ ] **Step 2: Inspect the third introduction scene in both locales**

Open `/zh/` and `/en/`, navigate to the third introduction scene using its progress control, and verify:

- the primary statement remains visually dominant;
- the support copy sits below it in the existing muted style;
- all five tool names use the iris accent;
- the counter remains `03 / 03`;
- the Hero copy and drag interaction are unchanged.

- [ ] **Step 3: Verify desktop and 390px layout geometry**

At a desktop viewport and at `390x844`, verify the third scene has no clipped text, overlap with the progress rail or counter, or horizontal overflow. Also verify the support paragraph remains readable with reduced motion enabled.

- [ ] **Step 4: Run the focused Homepage end-to-end checks**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: PASS for both projects, including the existing Homepage hierarchy and horizontal-overflow contract.

- [ ] **Step 5: Apply a CSS adjustment only if verification reproduces a layout failure**

If the support copy overlaps vertically at 390px, change only the existing mobile sizing rules to:

```css
@media (max-width: 767px) {
  .introScenes {
    min-height: 18rem;
  }

  .introSupport {
    max-width: 32rem;
    margin-top: 1rem;
    font-size: 1.125rem;
    line-height: 1.5;
  }
}
```

Re-run the component and focused Playwright commands after this change. Do not change the pinned scroll distance or add a fourth scene.

- [ ] **Step 6: Commit any verified responsive adjustment**

If `components/home/home.module.css` changed:

```bash
git add components/home/home.module.css
git commit -m "fix: fit homepage toolchain copy on mobile"
```

If the existing styles pass verification unchanged, do not create an empty commit.

### Task 4: Final verification

**Files:**
- Verify: `components/home/intro-story.tsx`
- Verify: `components/home/intro-story-motion.tsx`
- Verify: `components/home/home.module.css`
- Verify: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Confirm the implementation diff stays within scope**

Run:

```bash
git diff e2ddb73..HEAD -- components/home/intro-story.tsx components/home/intro-story-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx
```

Expected: only localized support copy, fragment rendering, focused assertions, and any evidence-based mobile fit adjustment are present. Hero files, project content, and scroll-distance logic are unchanged.

- [ ] **Step 2: Run final source verification**

Run:

```bash
npm run lint
npm test
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: all commands exit 0.

- [ ] **Step 3: Confirm repository state**

Run:

```bash
git status --short --branch
```

Expected: no uncommitted implementation changes remain; the current branch contains the focused test and implementation commits.
