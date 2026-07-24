# Meeting Whiteboard and Language Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add screen-share annotation to the whiteboard story and live captions to the language story, with readable `3/4 -> 2 -> 1` responsive phone grids.

**Architecture:** Extend the existing Meeting media catalog and evidence manifest, then reuse `PhoneShell` and `phoneGrid`. Column count stays declarative through `data-columns`; CSS owns the responsive transition and phone-width caps.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, Sharp, AVFoundation.

---

## File Map

- Modify `components/meeting/meeting-showcase.tsx`: register both media records, revise copy, and render the new phone items.
- Modify `components/meeting/meeting-showcase.module.css`: support four columns and exact `1121 / 720` breakpoints.
- Modify `evidence/meeting/manifest.json`: register two source videos and two posters.
- Modify `tests/component/meeting-evidence.test.tsx`: verify order and Chinese copy.
- Modify `tests/unit/meeting-assets.test.ts`: require all four new evidence records.
- Modify `tests/e2e/meeting.spec.ts`: update the recording count and verify labels.
- Create source and public MP4/poster files under the existing Meeting evidence paths.

### Task 1: Lock component and evidence contracts

**Files:**
- Modify: `tests/component/meeting-evidence.test.tsx`
- Modify: `tests/unit/meeting-assets.test.ts`
- Modify: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Add failing whiteboard assertions**

Render `MeetingWhiteboardShowcase` in Chinese and assert exact copy plus ordered sources:

```tsx
const { container } = render(<MeetingWhiteboardShowcase locale="zh" />);
const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

expect(screen.getByText('白板优先，参会者、常用操作仍然清晰可见')).toBeVisible();
expect(screen.getByText('退出/进入绘制白板功能前后，均合理利用有限空间')).toBeVisible();
expect(screen.getByText('不同状态沿用同一套布局规则。')).toBeVisible();
expect(screen.getByText('共享内容上直接标注')).toBeVisible();
expect(sources).toEqual([
  '/videos/meeting/meeting-whiteboard-web.mp4',
  '/videos/meeting/meeting-whiteboard-app-1.mp4',
  '/videos/meeting/meeting-whiteboard-app-2.mp4',
  '/videos/meeting/meeting-whiteboard-annotation-app.mp4',
]);
```

- [ ] **Step 2: Add failing language assertions**

```tsx
const { container } = render(<MeetingLanguageShowcase locale="zh" />);
const sources = Array.from(container.querySelectorAll('video')).map((video) => video.getAttribute('src'));

expect(screen.getByText('字幕由个人按需开启')).toBeVisible();
expect(screen.getByText('参会者可在会中自行开启，不改变会议级设置。')).toBeVisible();
expect(sources).toEqual([
  '/videos/meeting/meeting-captions-app.mp4',
  '/videos/meeting/meeting-transcript-app.mp4',
  '/videos/meeting/meeting-interpretation-on-app.mp4',
  '/videos/meeting/meeting-interpretation-live-app.mp4',
]);
```

- [ ] **Step 3: Require the new manifest IDs**

Add to `requiredIds`:

```ts
'meeting-whiteboard-annotation-app-poster',
'meeting-whiteboard-annotation-app',
'meeting-captions-app-poster',
'meeting-captions-app',
```

- [ ] **Step 4: Update the E2E contract**

```ts
await expect(page.locator('video[src^="/videos/meeting/"]')).toHaveCount(15);
await expect(page.getByText(locale === 'zh' ? '屏幕共享标注' : 'Screen-share annotation')).toBeVisible();
await expect(page.getByText(locale === 'zh' ? '实时字幕' : 'Live captions')).toBeVisible();
```

- [ ] **Step 5: Confirm the red state**

Run `npm test -- tests/component/meeting-evidence.test.tsx tests/unit/meeting-assets.test.ts`.

Expected: failures for missing copy, sources, and manifest IDs.

### Task 2: Import and register evidence assets

**Files:**
- Create: `evidence/meeting/source/imported/meeting-whiteboard-annotation-app.mp4`
- Create: `evidence/meeting/source/imported/meeting-whiteboard-annotation-app-poster.png`
- Create: `evidence/meeting/source/imported/meeting-captions-app.mp4`
- Create: `evidence/meeting/source/imported/meeting-captions-app-poster.png`
- Create: `public/videos/meeting/meeting-whiteboard-annotation-app.mp4`
- Create: `public/videos/meeting/meeting-captions-app.mp4`
- Create: `public/images/meeting/meeting-whiteboard-annotation-app-poster.webp`
- Create: `public/images/meeting/meeting-captions-app-poster.webp`
- Modify: `evidence/meeting/manifest.json`

- [ ] **Step 1: Copy MP4 files without transcoding**

```bash
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/meeting/app 竖屏-屏幕共享标注.mp4' evidence/meeting/source/imported/meeting-whiteboard-annotation-app.mp4
cp '/Users/admin/Desktop/声网 作品集 整理/作品集配图/meeting/app 竖屏-字幕.mp4' evidence/meeting/source/imported/meeting-captions-app.mp4
cp evidence/meeting/source/imported/meeting-whiteboard-annotation-app.mp4 public/videos/meeting/meeting-whiteboard-annotation-app.mp4
cp evidence/meeting/source/imported/meeting-captions-app.mp4 public/videos/meeting/meeting-captions-app.mp4
```

- [ ] **Step 2: Extract feature-visible PNG posters**

Use AVFoundation at `14s` for annotation and `12s` for captions. Both frames show the feature in use rather than a setup state.

- [ ] **Step 3: Generate WebP posters with Sharp**

```js
await sharp('evidence/meeting/source/imported/meeting-whiteboard-annotation-app-poster.png')
  .webp({ quality: 84 })
  .toFile('public/images/meeting/meeting-whiteboard-annotation-app-poster.webp');
await sharp('evidence/meeting/source/imported/meeting-captions-app-poster.png')
  .webp({ quality: 84 })
  .toFile('public/images/meeting/meeting-captions-app-poster.webp');
```

- [ ] **Step 4: Add four manifest records**

Use IDs from Task 1. Poster alt text must describe the visible state. Each video record points to its matching `/images/meeting/...-poster.webp` URL.

- [ ] **Step 5: Run the asset test**

Run `npm test -- tests/unit/meeting-assets.test.ts`.

Expected: all Meeting evidence manifest tests pass.

### Task 3: Extend the catalog and showcases

**Files:**
- Modify: `components/meeting/meeting-showcase.tsx`
- Test: `tests/component/meeting-evidence.test.tsx`

- [ ] **Step 1: Add media IDs**

```ts
| 'whiteboard-annotation-app'
| 'captions-app'
```

- [ ] **Step 2: Add the annotation record**

```ts
'whiteboard-annotation-app': {
  id: 'whiteboard-annotation-app', kind: 'phone',
  src: '/videos/meeting/meeting-whiteboard-annotation-app.mp4',
  poster: '/images/meeting/meeting-whiteboard-annotation-app-poster.webp',
  width: 590, height: 1280,
  label: { en: 'Screen-share annotation', zh: '屏幕共享标注' },
  title: { en: 'Annotate directly on shared content', zh: '共享内容上直接标注' },
  description: {
    en: 'Annotation tools keep discussion attached to the content being shared.',
    zh: '共享过程中调用标注工具，让讨论直接发生在内容上。',
  },
},
```

- [ ] **Step 3: Add the captions record**

```ts
'captions-app': {
  id: 'captions-app', kind: 'phone',
  src: '/videos/meeting/meeting-captions-app.mp4',
  poster: '/images/meeting/meeting-captions-app-poster.webp',
  width: 590, height: 1280,
  label: { en: 'Live captions', zh: '实时字幕' },
  title: { en: 'Captions are enabled on demand', zh: '字幕由个人按需开启' },
  description: {
    en: 'Participants can enable captions without changing meeting-level settings.',
    zh: '参会者可在会中自行开启，不改变会议级设置。',
  },
},
```

- [ ] **Step 4: Apply approved whiteboard copy**

Set Chinese titles to `白板优先，参会者、常用操作仍然清晰可见` and `退出/进入绘制白板功能前后，均合理利用有限空间`. Set the second description to `不同状态沿用同一套布局规则。` Preserve current English copy.

- [ ] **Step 5: Render approved media order**

Change the whiteboard deck to `data-columns="3"` and append `<PhoneShell mediaId="whiteboard-annotation-app" locale={locale} />`. Change the language deck to `data-columns="4"` and prepend `<PhoneShell mediaId="captions-app" locale={locale} />`.

- [ ] **Step 6: Run component tests**

Run `npm test -- tests/component/meeting-evidence.test.tsx`.

Expected: all Meeting showcase tests pass.

### Task 4: Implement responsive grids

**Files:**
- Modify: `components/meeting/meeting-showcase.module.css`

- [ ] **Step 1: Add four-column desktop support**

```css
.phoneGrid[data-columns='4'] {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}
.phoneGrid[data-columns='4'] > * {
  width: min(100%, 14rem);
}
```

- [ ] **Step 2: Implement the `721-1120px` two-column state**

At `max-width: 1120px`, set both three- and four-column decks to `repeat(2, minmax(0, 1fr))`. Restore four-column children to `width: min(100%, 15.75rem)`.

- [ ] **Step 3: Implement the `<=720px` one-column state**

At `max-width: 720px`, set decks with `data-columns='2'`, `'3'`, and `'4'` to `grid-template-columns: 1fr`.

- [ ] **Step 4: Run focused checks**

```bash
npx eslint components/meeting/meeting-showcase.tsx tests/component/meeting-evidence.test.tsx tests/unit/meeting-assets.test.ts tests/e2e/meeting.spec.ts
npm test -- tests/component/meeting-evidence.test.tsx tests/unit/meeting-assets.test.ts
```

Expected: lint exits `0`; all focused tests pass.

### Task 5: Verify and audit the full page

**Files:**
- Modify only if verification exposes a requirement regression.

- [ ] **Step 1: Run the production build**

Run `npm run build`.

Expected: source validation, TypeScript, static generation, and output validation all exit `0`.

- [ ] **Step 2: Run Meeting E2E across all projects**

Run `PW_PORT=4418 PW_REUSE_SERVER=1 npx playwright test tests/e2e/meeting.spec.ts`.

Expected: all desktop, tablet, and mobile Meeting tests pass.

- [ ] **Step 3: Inspect grid geometry**

At `1440px`, verify whiteboard has three columns and language has four. At `900px`, verify both have two. At `390px`, verify both have one. Confirm `scrollWidth - clientWidth <= 1` at every size.

- [ ] **Step 4: Inspect deterministic screenshots**

Capture both sections with reduced motion enabled. Confirm posters are nonblank, UI remains inspectable, captions do not overlap, and every phone viewport retains `590 / 1280`.

- [ ] **Step 5: Audit the full Chinese case study**

Review every chapter for duplicated diagrams, weak evidence transitions, unreadable screenshots, excessive repeated phone media, and unsupported outcome claims. Report findings ordered by severity with exact section/file references. Do not add unapproved assets during this audit.

- [ ] **Step 6: Run final checks**

```bash
npm test -- tests/component/meeting-evidence.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-models.test.tsx tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts
npx eslint components/meeting/meeting-showcase.tsx tests/component/meeting-evidence.test.tsx tests/unit/meeting-assets.test.ts tests/e2e/meeting.spec.ts
git diff --check
```

Expected: all tests pass, lint exits `0`, and `git diff --check` produces no output.
