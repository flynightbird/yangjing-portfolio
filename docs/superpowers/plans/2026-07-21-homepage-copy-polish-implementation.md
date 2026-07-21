# Homepage Copy Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace six translated-sounding homepage phrases with the approved Chinese and English copy and remove the homepage STT Status row.

**Architecture:** Keep all localized project copy in the existing dictionaries and keep introduction copy in `IntroStory`. Remove only the status markup owned by `BuildLabPreview`; do not alter the shared `ProjectCopy` contract or status displays used by other projects and case studies.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library.

---

## File Map

- Modify `tests/component/homepage.test.tsx`: lock the approved introduction, ConvoAI CTA, STT proposition, archive description, and missing STT status row.
- Modify `tests/component/aidx-homepage-copy.test.tsx`: lock the new AIDX positioning in both locales.
- Modify `components/home/intro-story.tsx`: preserve the approved complete Chinese third statement.
- Modify `content/dictionaries/zh.ts`: update ConvoAI, STT, AIDX, and archive Chinese copy.
- Modify `content/dictionaries/en.ts`: update the corresponding English copy.
- Modify `components/home/build-lab-preview.tsx`: remove only the homepage STT Status definition row.

### Task 1: Lock And Update The Approved Localized Copy

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/component/aidx-homepage-copy.test.tsx`
- Modify: `components/home/intro-story.tsx`
- Modify: `content/dictionaries/zh.ts`
- Modify: `content/dictionaries/en.ts`

- [ ] **Step 1: Write failing localized-copy assertions**

In `tests/component/homepage.test.tsx`, strengthen the Chinese introduction assertion and add focused homepage-copy coverage:

```tsx
expect(scenes[2]).toHaveTextContent(
  '现在，我也使用 AI 将设计判断转化为可运行的产品，从概念、原型走向真实体验。',
);

it.each([
  {
    locale: 'zh' as const,
    convoAction: '查看案例 ConvoAI',
    sttProposition: '让双语对话在实时转写与翻译中清晰呈现。',
  },
  {
    locale: 'en' as const,
    convoAction: 'View case study ConvoAI',
    sttProposition:
      'Keep bilingual conversation clear through real-time transcription and translation.',
  },
])('renders the approved $locale project copy', ({ locale, convoAction, sttProposition }) => {
  const { container } = render(<FeaturedWork locale={locale} />);
  const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');

  expect(screen.getByRole('link', { name: convoAction })).toBeVisible();
  expect(within(stt as HTMLElement).getByText(sttProposition)).toBeVisible();
});
```

In the existing English and Chinese `VisualArchive` tests, add:

```tsx
expect(
  screen.getByText(
    'More design work, presented through a lightweight, image-led selection of product, brand, and character projects.',
  ),
).toBeVisible();

expect(
  screen.getByText('更多设计作品，将以图片为主，轻量呈现产品、品牌与角色设计作品。'),
).toBeVisible();
```

Update `tests/component/aidx-homepage-copy.test.tsx` expected propositions to:

```tsx
'A new website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.'
'为新加坡 AI 安全公司 AIDX 打造的全新线上官网，通过界面、信息结构与动效塑造品牌表达。'
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: FAIL on the old ConvoAI CTA, STT proposition, AIDX proposition, and Visual Archive description.

- [ ] **Step 3: Apply the approved copy at the existing sources**

In `components/home/intro-story.tsx`, keep the third Chinese scene split for emphasis while producing the exact approved sentence:

```tsx
{
  lead: '现在，我也使用 AI 将设计判断转化为',
  emphasis: '可运行的产品',
  trail: '，从概念、原型走向真实体验。',
}
```

In `content/dictionaries/zh.ts`, set:

```ts
convoAi.action = '查看案例';
sttDemo.proposition = '让双语对话在实时转写与翻译中清晰呈现。';
aidx.proposition = '为新加坡 AI 安全公司 AIDX 打造的全新线上官网，通过界面、信息结构与动效塑造品牌表达。';
archive.description = '更多设计作品，将以图片为主，轻量呈现产品、品牌与角色设计作品。';
```

In `content/dictionaries/en.ts`, set:

```ts
convoAi.action = 'View case study';
sttDemo.proposition = 'Keep bilingual conversation clear through real-time transcription and translation.';
aidx.proposition = 'A new website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.';
archive.description = 'More design work, presented through a lightweight, image-led selection of product, brand, and character projects.';
```

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: both test files pass.

- [ ] **Step 5: Commit the localized copy**

```bash
git add components/home/intro-story.tsx content/dictionaries/en.ts content/dictionaries/zh.ts tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
git commit -m "copy: polish localized homepage language"
```

### Task 2: Remove Only The Homepage STT Status Row

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `components/home/build-lab-preview.tsx`

- [ ] **Step 1: Write the failing STT metadata assertion**

Add this focused test in `tests/component/homepage.test.tsx`:

```tsx
it.each([
  { locale: 'en' as const, status: 'Pinned static prototype' },
  { locale: 'zh' as const, status: '固定版本的静态原型' },
])('removes the homepage STT status row in $locale', ({ locale, status }) => {
  const { container } = render(<FeaturedWork locale={locale} />);
  const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
  const sttScope = within(stt as HTMLElement);

  expect(sttScope.getByText('Role')).toBeVisible();
  expect(sttScope.queryByText('Status')).not.toBeInTheDocument();
  expect(sttScope.queryByText(status)).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: FAIL because the STT card still renders `Status` and its localized value.

- [ ] **Step 3: Remove the status row from `BuildLabPreview`**

Delete only this block from `components/home/build-lab-preview.tsx`:

```tsx
<div>
  <dt>Status</dt>
  <dd>{copy.status}</dd>
</div>
```

Keep the Role row and the rest of the STT component unchanged.

- [ ] **Step 4: Run component tests and verify GREEN**

Run:

```bash
npm test -- tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: both files pass, including existing STT link and media behavior.

- [ ] **Step 5: Run final gates**

```bash
npm run validate:content
npm run lint
npm test -- tests/unit/home-content.test.ts tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
git diff --check
```

Expected: content validation and focused tests pass; ESLint exits with no errors. Existing Xuelang `<img>` warnings may remain.

- [ ] **Step 6: Commit and push**

```bash
git add components/home/build-lab-preview.tsx tests/component/homepage.test.tsx
git commit -m "feat: simplify STT homepage metadata"
git push origin codex/visual-archive-lightbox-stage
```
