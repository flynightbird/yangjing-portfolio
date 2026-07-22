# Homepage Chinese Copy Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved Chinese homepage rewrite, expose the approved project roles and statuses, and remove Call Agent and ConvoAI status/media-production messaging from both localized homepages.

**Architecture:** Keep editorial copy in the existing dictionary and localized content sources. Extend only the homepage presentation components that currently omit approved role/status fields, and remove ConvoAI's visitor-facing temporary-media notice while retaining its internal publication-state marker. Lock the behavior through component tests first, then verify the real `/zh/` and `/en/` pages at desktop and mobile sizes.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, CSS Modules, Vitest, Testing Library, Playwright

---

## File Map

- Modify `tests/component/homepage.test.tsx`: exact Chinese hero, introduction, project, archive, role/status, and cross-locale removal contracts.
- Modify `tests/component/aidx-homepage-copy.test.tsx`: approved Chinese AIDX type and proposition.
- Modify `tests/e2e/homepage.spec.ts`: updated Chinese archive heading and real-page absence checks for removed production wording.
- Modify `content/dictionaries/zh.ts`: approved Chinese hero, project, and Visual Archive copy.
- Modify `components/home/intro-story.tsx`: approved Chinese introduction scenes and toolchain paragraph.
- Modify `content/home.ts`: approved Chinese Visual Archive project descriptions.
- Modify `components/home/flagship-projects.tsx`: render Call Agent and ConvoAI roles; remove the temporary-media notice and visitor-facing placeholder image descriptions.
- Modify `components/home/build-lab-preview.tsx`: render the approved STT status and localize its fact labels.
- Modify `components/home/communication-projects.tsx`: pass locale into the STT preview.
- Modify `components/home/live-website-project.tsx`: render the approved AIDX live status.
- Modify `components/home/home.module.css`: style the new role and status lines without changing the section layout.

### Task 1: Lock the approved copy and removal behavior in component tests

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/component/aidx-homepage-copy.test.tsx`

- [ ] **Step 1: Replace the Chinese introduction expectations with the approved complete sentences**

Update the Chinese `IntroStory` test to assert:

```tsx
expect(scenes[0]).toHaveTextContent(
  '嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师，也长期从事用户研究。',
);
expect(scenes[0]).toHaveTextContent(
  '这是一个由我设计，并通过 Vibe Coding 构建的作品集。',
);
expect(scenes[1]).toHaveTextContent(
  '我的工作覆盖大规模 C 端产品、复杂 B2B 产品与 AI 系统，结合 UX/UI 设计与用户研究，将复杂状态梳理为清晰、可控且具有一致视觉表达的产品体验。',
);
expect(scenes[2]).toHaveTextContent(
  '现在，我也借助 AI 将设计判断转化为可运行的产品，从概念探索、原型验证走向真实体验。',
);
expect(scenes[2]).toHaveTextContent(
  '我使用 Codex、Claude Design 与 Figma Make 进行设计探索与产品构建，并结合 Midjourney、即梦等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。',
);
```

- [ ] **Step 2: Add exact Chinese hero and project presentation assertions**

Add a component test that renders `DualIdentityHero` and `FeaturedWork` in Chinese and checks the approved visitor-facing content:

```tsx
it('renders the approved Chinese homepage positioning and project facts', () => {
  const hero = render(<DualIdentityHero locale="zh" />);
  expect(hero.getByText('专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。')).toBeVisible();
  expect(hero.getByText(
    '通过 Vibe Coding 探索、验证并构建可运行的产品体验，借助 AIGC 拓展视觉表达、提升设计效率。',
  )).toBeVisible();
  hero.unmount();

  const { container } = render(<FeaturedWork locale="zh" />);
  const project = (id: string) => within(
    container.querySelector<HTMLElement>(`[data-project-id="${id}"]`) as HTMLElement,
  );

  expect(project('call-agent').getByText(
    '面向 AI 对话配置的 SaaS 产品，让 AI 对话在发布前可见、可验证、可控。',
  )).toBeVisible();
  expect(project('call-agent').getByText('唯一产品设计师 · 前端原型构建（Vibe Coding）')).toBeVisible();
  expect(project('convo-ai').getByText('唯一产品设计师')).toBeVisible();
  expect(project('meeting').getByText('已在四类终端上线')).toBeVisible();
  expect(project('aidx').getByText('网站已上线')).toBeVisible();
  expect(project('stt-demo').getByText('Agora RTE 2026 大会发布')).toBeVisible();
});
```

- [ ] **Step 3: Replace the old STT omission and ConvoAI placeholder tests with the approved behavior**

Replace the test that expects STT status to be absent and the test that expects temporary ConvoAI image descriptions with:

```tsx
it.each([
  { locale: 'en' as const, roleLabel: 'Role', status: 'Pinned static prototype' },
  { locale: 'zh' as const, roleLabel: '角色', status: 'Agora RTE 2026 大会发布' },
])('renders localized STT facts in $locale', ({ locale, roleLabel, status }) => {
  const { container } = render(<FeaturedWork locale={locale} />);
  const stt = container.querySelector<HTMLElement>('[data-project-id="stt-demo"]');
  const sttScope = within(stt as HTMLElement);

  expect(sttScope.getByText(roleLabel)).toBeVisible();
  expect(sttScope.getByText(status)).toBeVisible();
});

it.each(['en', 'zh'] as const)(
  'removes Call Agent and ConvoAI status and media-production copy in %s',
  (locale) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const callAgent = within(
      container.querySelector<HTMLElement>('[data-project-id="call-agent"]') as HTMLElement,
    );
    const convoAi = within(
      container.querySelector<HTMLElement>('[data-project-id="convo-ai"]') as HTMLElement,
    );

    for (const removed of locale === 'zh'
      ? ['有限客户测试', '真实产品证据', '公开产品，等待替换项目素材', '临时 Web 与 App 素材', '当前为临时第三方图片']
      : ['Limited beta', 'Real product evidence', 'Public product, media replacement pending', 'Temporary web and app media', 'Temporary third-party imagery']) {
      expect(callAgent.queryByText(removed, { exact: false })).not.toBeInTheDocument();
      expect(convoAi.queryByText(removed, { exact: false })).not.toBeInTheDocument();
    }
    expect(convoAi.queryAllByRole('img')).toHaveLength(0);
  },
);
```

The final image assertion intentionally treats the two images as decorative because their enclosing project link already provides the accessible name.

- [ ] **Step 4: Update the Visual Archive and AIDX exact-copy expectations**

Assert the new archive heading, description, and all four Chinese project descriptions in `tests/component/homepage.test.tsx`. Update the Chinese row in `tests/component/aidx-homepage-copy.test.tsx` to:

```tsx
{
  locale: 'zh' as const,
  kind: '新加坡 AI 安全公司官网',
  proposition: '通过界面、信息架构与动效，为 AIDX 打造清晰、可信的品牌官网。',
}
```

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: FAIL on the old Chinese strings, absent Call Agent/ConvoAI role text, absent AIDX/STT status text, and still-visible ConvoAI temporary notice/image accessible names.

- [ ] **Step 6: Commit the failing contract tests**

```bash
git add tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
git commit -m "test: define homepage Chinese copy contract"
```

### Task 2: Apply the approved Chinese editorial rewrite

**Files:**
- Modify: `content/dictionaries/zh.ts`
- Modify: `components/home/intro-story.tsx`
- Modify: `content/home.ts`

- [ ] **Step 1: Update the Chinese hero and project dictionary strings**

Apply the exact strings from the approved design spec to `zhDictionary.home.hero` and `zhDictionary.home.projects`. The project values must resolve to:

```ts
xuelang: {
  proposition: '从卖课工具，走向高品质学习平台',
  role: '项目主设计师',
},
callAgent: {
  proposition: '面向 AI 对话配置的 SaaS 产品，让 AI 对话在发布前可见、可验证、可控。',
  role: '唯一产品设计师 · 前端原型构建（Vibe Coding）',
},
convoAi: {
  proposition: '为 AI 对话打造自然、清晰的跨端体验。',
  role: '唯一产品设计师',
},
meeting: {
  proposition: '在参会者、内容、角色与设备持续变化的会议场景中，构建覆盖桌面端、Web、App 与 Pad 的实时协作体验。',
  role: '唯一产品设计师',
  status: '已在四类终端上线',
},
aidx: {
  kind: '新加坡 AI 安全公司官网',
  proposition: '通过界面、信息架构与动效，为 AIDX 打造清晰、可信的品牌官网。',
  status: '网站已上线',
},
sttDemo: {
  proposition: '让双语对话的实时转写与翻译更清晰。',
  role: '唯一产品设计师 · AI 辅助高保真原型',
  status: 'Agora RTE 2026 大会发布',
},
```

Keep required but unrendered `status`, `mediaLabel`, and `temporaryNotice` fields in the dictionary until a separate type-contract cleanup; do not replace them with empty strings.

- [ ] **Step 2: Update the Chinese introduction scene fragments without changing English fragments**

Preserve the existing emphasis segmentation while making concatenated scene text equal the approved sentences. Use these Chinese fragments:

```ts
{
  lead: '嗨，我是杨静，一名拥有十多年经验的 ',
  emphasis: 'UX/UI 设计师',
  trail: '，也长期从事用户研究。',
  support: [
    { text: '这是一个由我设计，并通过 ' },
    { text: 'Vibe Coding', emphasis: true },
    { text: ' 构建的作品集。' },
  ],
},
{
  lead: '我的工作覆盖大规模 C 端产品、复杂 B2B 产品与 AI 系统，结合 UX/UI 设计与用户研究，将复杂状态梳理为',
  emphasis: '清晰、可控且具有一致视觉表达的产品体验',
  trail: '。',
},
{
  lead: '现在，我也借助 AI 将设计判断转化为',
  emphasis: '可运行的产品',
  trail: '，从概念探索、原型验证走向真实体验。',
}
```

Build the support fragments so their concatenated text exactly matches the approved fifth introduction sentence and the emphasis list remains `['Codex', 'Claude Design', 'Figma Make', 'Midjourney', '即梦']`.

- [ ] **Step 3: Update the Visual Archive heading and Chinese project descriptions**

Set:

```ts
title: 'More C 端产品作品',
description: '以视觉卡片为主，呈现更多产品、品牌与角色设计。',
```

In `content/home.ts`, replace only the four `description.zh` values with the exact approved archive descriptions from the design spec. Do not modify any `.en` value, title, period, skill, image path, or alt text.

- [ ] **Step 4: Run the focused tests and identify only presentation failures**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: copy assertions PASS; remaining failures are limited to role/status rendering and ConvoAI visitor-facing temporary-media content.

- [ ] **Step 5: Commit the editorial sources**

```bash
git add content/dictionaries/zh.ts components/home/intro-story.tsx content/home.ts
git commit -m "copy: refine Chinese homepage narrative"
```

### Task 3: Render approved facts and remove visitor-facing production notes

**Files:**
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/communication-projects.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `components/home/home.module.css`

- [ ] **Step 1: Render Call Agent and ConvoAI roles and remove the ConvoAI notice**

Change `FlagshipCopy` to include `readonly role: string`, delete the `ConvoAiCopy` interface, and type both projects with `FlagshipCopy`. After each flagship proposition, render:

```tsx
<p className={styles.flagshipRole}>{project.copy.role}</p>
```

Use `callAgent.copy.role` and `convoAi.copy.role` explicitly in the respective articles. Remove:

```tsx
<p className={styles.flagshipSource}>{convoAi.copy.temporaryNotice}</p>
```

Keep `data-publication-state="temporary-media"` because it is an internal publication validator, not visitor copy. Change the two ConvoAI images to `alt=""`; the enclosing link's `aria-label` remains their accessible project name.

- [ ] **Step 2: Pass locale to STT and render localized Role and Status rows**

Add `readonly locale: Locale` to `BuildLabPreviewProps`, import `Locale`, and render:

```tsx
<dl className={styles.buildFacts}>
  <div>
    <dt>{locale === 'zh' ? '角色' : 'Role'}</dt>
    <dd>{copy.role}</dd>
  </div>
  <div>
    <dt>{locale === 'zh' ? '状态' : 'Status'}</dt>
    <dd>{copy.status}</dd>
  </div>
</dl>
```

In `CommunicationProjects`, pass the existing locale:

```tsx
<BuildLabPreview locale={locale} {...stt} />
```

- [ ] **Step 3: Render AIDX status without changing its scope list or links**

After `scopeList` in `LiveWebsiteProject`, render:

```tsx
<p className={styles.liveStatus}>{copy.status}</p>
```

The existing English `Live website` and approved Chinese `网站已上线` then render from their respective dictionaries. Do not change the English proposition, type, scope, caption, or action.

- [ ] **Step 4: Add restrained styles for the new facts**

Replace the obsolete `.flagshipSource` rule with:

```css
.flagshipRole {
  margin: 0.75rem 0 0;
  color: #8f948f;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.5;
}
```

Add the AIDX status style next to `.scopeList`:

```css
.liveStatus {
  margin: calc(-1 * var(--space-3)) 0 var(--space-6);
  color: var(--color-iris-deep);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.5;
}
```

Do not introduce new containers or change grid dimensions. The STT status uses the existing `.buildFacts` layout.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
```

Expected: both test files PASS.

- [ ] **Step 6: Run static checks for the changed files**

Run:

```bash
npx eslint components/home/flagship-projects.tsx components/home/build-lab-preview.tsx components/home/communication-projects.tsx components/home/live-website-project.tsx components/home/intro-story.tsx content/dictionaries/zh.ts content/home.ts tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx
npx tsc --noEmit
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit the homepage presentation changes**

```bash
git add components/home/flagship-projects.tsx components/home/build-lab-preview.tsx components/home/communication-projects.tsx components/home/live-website-project.tsx components/home/home.module.css
git commit -m "feat: present refined homepage project facts"
```

### Task 4: Update browser contracts and verify real layouts

**Files:**
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Update the Chinese archive heading in the homepage end-to-end contract**

Replace only the Chinese branch of the archive heading expectation:

```ts
name: locale === 'zh' ? 'More C 端产品作品' : 'More Consumer Product Work',
```

- [ ] **Step 2: Add real-page assertions for removed and retained project facts**

Inside the localized homepage loop, assert that neither flagship project contains visitor-facing production language and that the approved facts remain:

```ts
const callAgent = page.locator('[data-project-id="call-agent"]');
const convoAi = page.locator('[data-project-id="convo-ai"]');
await expect(callAgent).not.toContainText(/Limited beta|Real product evidence|有限客户测试|真实产品证据/);
await expect(convoAi).not.toContainText(
  /temporary third-party|media replacement|temporary web and app|临时第三方|等待替换|临时 Web 与 App/i,
);
await expect(page.locator('[data-project-id="meeting"]')).toContainText(
  locale === 'zh' ? '已在四类终端上线' : 'Shipped across four platforms',
);
await expect(page.locator('[data-project-id="aidx"]')).toContainText(
  locale === 'zh' ? '网站已上线' : 'Live website',
);
await expect(page.locator('[data-project-id="stt-demo"]')).toContainText(
  locale === 'zh' ? 'Agora RTE 2026 大会发布' : 'Pinned static prototype',
);
```

- [ ] **Step 3: Run the focused browser test at desktop and mobile sizes**

Ensure the existing preview server is available at the configured Playwright base URL, then run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile
```

Expected: PASS. The homepage order, links, project controls, archive interactions, and no-horizontal-overflow checks remain green.

- [ ] **Step 4: Inspect `/zh/` and `/en/` visually**

At `1440x1000` and `390x844`, inspect:

- Hero summaries wrap without clipping or colliding with role headings.
- Introduction scene text stays within its stage and does not overlap progress controls.
- Call Agent and ConvoAI role lines do not push CTAs into media.
- Meeting proposition remains readable at both widths.
- AIDX and STT status lines are visible without adding empty rows.
- Visual Archive heading, description, and descriptions have no awkward overflow.
- No temporary-media or asset-replacement wording is visible in either locale.

- [ ] **Step 5: Run the relevant regression suite**

Run:

```bash
npm run lint
npx vitest run tests/component/homepage.test.tsx tests/component/aidx-homepage-copy.test.tsx tests/unit/home-content.test.ts tests/unit/work-metadata.test.ts
npm run build:framework
```

Expected: lint and focused tests exit 0. `build:framework` exits 0; if it encounters the repository's known missing Meeting/profile/resume publication assets, record the exact pre-existing failure without expanding this task.

- [ ] **Step 6: Confirm English editorial diff boundaries**

Run:

```bash
git diff HEAD~3 -- content/dictionaries/en.ts
git diff --check
git status --short
```

Expected: no diff in `content/dictionaries/en.ts`, no whitespace errors, and only the planned implementation/test files remain uncommitted.

- [ ] **Step 7: Commit the browser contract**

```bash
git add tests/e2e/homepage.spec.ts
git commit -m "test: verify localized homepage copy presentation"
```

## Completion Criteria

- Every approved Chinese homepage sentence renders exactly.
- Existing English editorial text remains unchanged.
- Call Agent and ConvoAI expose no status or media-production descriptions in either locale.
- Call Agent and ConvoAI roles render in both locales from existing dictionary values.
- Meeting, AIDX, and STT statuses render; the STT fact labels localize correctly.
- ConvoAI media remains linked and visually unchanged but is decorative to assistive technology.
- Focused component tests, lint, type-check, browser tests, and the framework build pass or disclose only previously known asset failures.
- Desktop and mobile review finds no overlap, overflow, empty metadata row, or CTA displacement.
