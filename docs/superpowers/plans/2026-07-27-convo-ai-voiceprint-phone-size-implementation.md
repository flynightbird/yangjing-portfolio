# ConvoAI Voiceprint Phone Size Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the App phone width in the Chinese conversation-control recording playlist to `288px` without changing Web recordings or any other ConvoAI phone.

**Architecture:** Add an opt-in `appSize="compact"` prop to `ConvoAiPlaylist`, expose it as a root data attribute, and let the existing CSS Module override only portrait App frames inside that playlist. Enable the variant at the single Chinese MDX call site; preserve the default sizing contract everywhere else.

**Tech Stack:** Next.js, React, TypeScript, MDX, CSS Modules, Vitest, Testing Library, Playwright.

---

### Task 1: Lock The Compact Variant In Failing Tests

**Files:**
- Modify: `tests/component/convo-ai-media.test.tsx`
- Modify: `tests/e2e/convo-ai.spec.ts`

- [ ] **Step 1: Write the failing component test**

Add a test proving the variant is opt-in:

```tsx
it('exposes compact App sizing only when explicitly requested', () => {
  const { container, rerender } = render(
    <ConvoAiPlaylist ids={['app-voiceprint-lock']} locale="zh" />,
  );

  expect(container.querySelector('[data-convo-ai-playlist]')).toHaveAttribute(
    'data-app-size',
    'standard',
  );

  rerender(
    <ConvoAiPlaylist
      ids={['app-voiceprint-lock']}
      locale="zh"
      appSize="compact"
    />,
  );

  expect(container.querySelector('[data-convo-ai-playlist]')).toHaveAttribute(
    'data-app-size',
    'compact',
  );
});
```

- [ ] **Step 2: Run the component test and verify RED**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because `ConvoAiPlaylist` does not accept `appSize` and does not render `data-app-size`.

- [ ] **Step 3: Write the failing browser assertion**

Add a Chinese-only test that navigates the conversation-control playlist to `app-voiceprint-lock`, measures the visible frame, and asserts:

```ts
const playlist = page.locator('#conversation-control [data-convo-ai-playlist]');
await playlist.locator('[data-playlist-navigation] button', { hasText: '声纹锁定' }).click();
const phone = playlist.locator('[data-convo-media-frame][data-media-platform="app"]');
const phoneBox = await phone.boundingBox();

expect(phoneBox).not.toBeNull();
expect(phoneBox!.width).toBeLessThanOrEqual(289);
await expectRenderedRatio(phone, 592 / 1280);
```

Then select `web-conversation` and assert its visible frame width is greater than `288px`. On the mobile project, set the viewport to `375 x 812` and assert document overflow remains at most one pixel.

- [ ] **Step 4: Run the browser test and verify RED**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile --grep "compact voiceprint phone"
```

Expected: FAIL because the App frame can render at approximately `384px`.

- [ ] **Step 5: Commit the failing contract tests**

```bash
git add tests/component/convo-ai-media.test.tsx tests/e2e/convo-ai.spec.ts
git commit -m "test: define compact ConvoAI voiceprint phone"
```

### Task 2: Implement The Opt-In Compact App Variant

**Files:**
- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `content/work/convo-ai.zh.mdx`

- [ ] **Step 1: Implement the typed playlist variant**

Change the component signature to:

```tsx
export function ConvoAiPlaylist({
  ids,
  locale,
  appSize = 'standard',
}: {
  readonly ids: readonly ConvoAiMediaId[];
  readonly locale: Locale;
  readonly appSize?: 'standard' | 'compact';
}) {
```

Render the stable attribute on the existing root:

```tsx
return <div
  className={styles.playlist}
  data-convo-ai-playlist
  data-app-size={appSize}
>
```

- [ ] **Step 2: Add the compact CSS override**

Keep the default `24rem` rule unchanged and add:

```css
.playlist[data-app-size='compact'] .evidence[data-platform='app'] .videoFrame {
  --convo-app-short-edge: min(100cqi, 18rem);
}
```

This selector changes only App frames inside an explicitly compact playlist. Existing portrait and landscape sizing rules continue to derive width from `--convo-app-short-edge`.

- [ ] **Step 3: Enable the variant only in the approved module**

Update the Chinese conversation-control call site to:

```mdx
<ConvoAiPlaylist
  locale="zh"
  appSize="compact"
  ids={['app-caption-camera', 'web-conversation', 'web-interrupt', 'app-voiceprint-lock']}
/>
```

Do not change any other playlist call site.

- [ ] **Step 4: Run the component test and verify GREEN**

Run:

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx
```

Expected: PASS, including the existing carousel, media sizing, audio, and stage tests.

- [ ] **Step 5: Run the browser test and verify GREEN**

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile --grep "compact voiceprint phone"
```

Expected: PASS with a desktop App width at or below `289px`, preserved `592 / 1280` ratio, a wider Web recording, and no mobile overflow.

- [ ] **Step 6: Commit the compact variant**

```bash
git add components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css content/work/convo-ai.zh.mdx
git commit -m "style: sharpen ConvoAI voiceprint recording"
```

### Task 3: Verify Rendered Size And Responsive Bounds

**Files:**
- Verify: `tests/e2e/convo-ai.spec.ts`
- Verify: `tests/component/convo-ai-media.test.tsx`
- Verify: `tests/component/convo-ai-layout.test.tsx`

- [ ] **Step 1: Run focused regression checks**

```bash
npm test -- --run tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile
npm run lint
npm run build:framework
git diff --check
```

Expected: all commands exit `0`; lint may retain only pre-existing repository warnings.

- [ ] **Step 2: Inspect the real page**

Capture the selected `app-voiceprint-lock` state at `1440px` and `375px`. Confirm the phone is centered, visibly smaller, not cropped, and sharper; confirm Web recordings and phones outside `#conversation-control` retain their previous dimensions.

- [ ] **Step 3: Confirm the final diff is scoped**

Verify that only the two tests, playlist component, media CSS Module, and Chinese ConvoAI MDX changed after the plan commit. Confirm no video asset, copy, Web sizing, other phone composition, navigation, Banner, or Footer changed.
