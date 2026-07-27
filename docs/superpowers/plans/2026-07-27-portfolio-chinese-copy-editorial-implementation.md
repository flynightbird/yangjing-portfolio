# Portfolio Chinese Copy Editorial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all directly visible public Chinese portfolio copy into a restrained, warm editorial voice while preserving information architecture, page logic, media, controls, English content, and credible claim boundaries.

**Architecture:** Keep copy in its current owners: shared labels and homepage summaries remain in the Chinese dictionary, archive copy remains in `content/home.ts`, About copy remains in its component-local locale object, and case narratives remain in Chinese MDX or their existing localized media components. Add one source-level editorial contract test for global invariants, then update focused component/content tests as each page batch changes.

**Tech Stack:** Next.js 16, React 19, TypeScript, MDX, Vitest, Testing Library, Playwright.

**Design spec:** `docs/superpowers/specs/2026-07-27-portfolio-chinese-copy-editorial-design.md`

---

## File Map

**Primary public copy owners**

- `content/dictionaries/zh.ts`: homepage identity, featured-project summaries, archive/About preview, shared visible Chinese labels.
- `content/home.ts`: localized Visual Archive titles and descriptions only; do not edit alt text.
- `components/about/about-page.tsx`: Chinese About hero, capabilities, evidence, career throughline, and timeline.
- `components/shell/site-footer.tsx`: final invitation copy only.
- `components/shell/footer-contacts.tsx`: visible email and WeChat labels only.
- `content/work/call-agent.zh.mdx`: Call Agent narrative.
- `content/work/convo-ai.zh.mdx`: ConvoAI narrative.
- `content/work/meeting.zh.mdx`: Meeting narrative and removal of the public disclosure.
- `components/meeting/meeting-showcase.tsx`: visible Chinese media-card labels, titles, and descriptions.
- `content/work/xuelang.zh.mdx`: Xuelang narrative, role wording, confirmed metrics, and method-only reflection.
- `content/work/tangping.zh.mdx`: Tangping metadata and removal of the public disclosure.
- `content/tangping.ts`: Tangping localized story copy consumed by `TangpingStory`.
- `content/build/stt-demo.zh.mdx`: STT prototype narrative and replacement of the visible evidence-boundary chapter with a product-focused prototype-scope chapter.
- `components/build-lab/evidence-ledger.tsx`: remove from the Chinese STT page import/render path; do not delete the component because the English page may still consume it.
- Localized media copy in `components/call-agent/*.tsx`, `components/convo-ai/*.tsx`, `components/xuelang/*.tsx`, and `components/home/*.tsx`: edit only directly visible text that repeats, overclaims, or reads like documentation; leave controls, `alt`, `aria-label`, errors, and empty states unchanged.

**Tests**

- Create `tests/unit/chinese-editorial-copy.test.ts` for portfolio-wide Chinese copy invariants.
- Modify existing focused tests only where they assert exact Chinese public copy:
  - `tests/component/about-page.test.tsx`
  - `tests/component/homepage.test.tsx`
  - `tests/component/site-footer.test.tsx`
  - `tests/unit/home-content.test.ts`
  - `tests/unit/call-agent-regression.test.ts`
  - `tests/unit/convo-ai-content.test.ts`
  - `tests/unit/meeting-content.test.ts`
  - `tests/unit/xuelang-content.test.ts`
  - `tests/unit/tangping-content.test.ts`
  - `tests/unit/stt-source.test.ts`
  - `tests/unit/work-metadata.test.ts`

Do not modify or stage the unrelated untracked file `docs/superpowers/plans/2026-07-27-meeting-popup-editorial-board-implementation.md`.

### Task 1: Establish The Chinese Editorial Contract

**Files:**
- Create: `tests/unit/chinese-editorial-copy.test.ts`

- [ ] **Step 1: Write the failing source-level contract test**

Create the test with explicit public-source scope. It must exclude navigation, controls, accessibility labels, errors, empty states, draft-case content, English files, and documentation.

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const publicChineseSources = [
  'content/dictionaries/zh.ts',
  'content/home.ts',
  'components/about/about-page.tsx',
  'components/shell/site-footer.tsx',
  'components/shell/footer-contacts.tsx',
  'content/work/call-agent.zh.mdx',
  'content/work/convo-ai.zh.mdx',
  'content/work/meeting.zh.mdx',
  'content/work/xuelang.zh.mdx',
  'content/work/tangping.zh.mdx',
  'content/tangping.ts',
  'content/build/stt-demo.zh.mdx',
] as const;

function readPublicProse(file: (typeof publicChineseSources)[number]) {
  let value = readFileSync(path.join(root, file), 'utf8');
  if (file === 'content/dictionaries/zh.ts') {
    value = value.replace(
      /\n  draftCase: \{[\s\S]*?\n  aboutPage: \{/,
      '\n  aboutPage: {',
    );
  }
  if (file === 'content/home.ts') {
    value = value.replace(/^\s*alt:\s*.*$/gm, '');
  }
  return value;
}

const source = publicChineseSources
  .map(readPublicProse)
  .join('\n');

describe('public Chinese editorial contract', () => {
  it('uses the approved identity and role language', () => {
    const dictionary = readFileSync(path.join(root, 'content/dictionaries/zh.ts'), 'utf8');
    const about = readFileSync(path.join(root, 'components/about/about-page.tsx'), 'utf8');

    expect(`${dictionary}\n${about}`).toContain('产品设计师（UI/UX），专注 AI 与复杂系统');
    expect(source).not.toMatch(/唯一产品设计师|项目主设计师|项目主负责设计师/);
  });

  it('removes public disclaimers and evidence-boundary narration', () => {
    expect(source).not.toMatch(/不作.*声明|不对未验证|证据边界|结果数据来自个人履历中的自述/);
    expect(source).not.toContain("disclosure: '");
  });

  it('removes generic portfolio filler from public prose', () => {
    expect(source).not.toMatch(/赋能|打造|沉淀|闭环|抓手|全链路|体验升级|能力建设|价值落地/);
  });
});
```

- [ ] **Step 2: Run the contract test and confirm the current copy fails**

Run: `npm test -- tests/unit/chinese-editorial-copy.test.ts`

Expected: FAIL on the missing approved identity, inconsistent role labels, public disclosures/evidence-boundary wording, and filler phrases.

- [ ] **Step 3: Commit the failing contract test**

```bash
git add tests/unit/chinese-editorial-copy.test.ts
git commit -m "test: define Chinese portfolio editorial contract"
```

### Task 2: Rewrite Homepage, About, And Footer Voice

**Files:**
- Modify: `content/dictionaries/zh.ts`
- Modify: `content/home.ts`
- Modify: `components/about/about-page.tsx`
- Modify: `components/shell/site-footer.tsx`
- Modify: `components/shell/footer-contacts.tsx`
- Modify: `tests/component/about-page.test.tsx`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/component/site-footer.test.tsx`
- Modify: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Update focused tests with the approved identity and tone anchors**

Replace outdated exact-copy assertions with these public anchors:

```ts
expect(screen.getByText('产品设计师（UI/UX），专注 AI 与复杂系统')).toBeVisible();
expect(screen.getByText('把复杂产品理清，再把关键判断做成可体验、可验证的产品。')).toBeVisible();
expect(screen.getByText('独立负责产品设计', { exact: false })).toBeVisible();
```

For the footer, assert the final invitation and preserve existing contact behavior:

```ts
expect(screen.getByText('聊聊产品、AI，或一个还没被讲清的问题。')).toBeVisible();
```

Run: `npm test -- tests/component/about-page.test.tsx tests/component/homepage.test.tsx tests/component/site-footer.test.tsx tests/unit/home-content.test.ts`

Expected: FAIL because the new anchors are not present.

- [ ] **Step 2: Rewrite the homepage dictionary and archive descriptions**

Apply these fixed hierarchy decisions:

```ts
description: '产品设计师（UI/UX），专注 AI 与复杂系统。',
designerSummary: '把复杂产品理清，再把关键判断做成可体验、可验证的产品。',
builderSummary: '用 Vibe Coding 快速搭建可运行原型，让产品思路更早进入体验和讨论。',
```

Use `独立负责产品设计` for Xuelang, Call Agent, ConvoAI, Meeting, and STT role labels, adding `· 前端原型构建（Vibe Coding）` or `· AI 辅助原型构建` only where already established. Remove temporary-material notices from completed public projects. Rewrite each project proposition to one sentence that states the product and its central design problem; do not repeat title, kind, status, or role.

In `content/home.ts`, edit only `zh` titles, supporting text, and descriptions that contain filler or read like production notes. Do not touch any `alt` field, period, skill, image path, gallery order, or English value.

- [ ] **Step 3: Rewrite About as one concise career throughline**

Use these fixed hero anchors:

```ts
eyebrow: '产品设计师（UI/UX），专注 AI 与复杂系统',
title: ['把复杂问题理清，', '再把判断做成真实体验。'],
intro: '从用户研究、大规模消费产品到复杂系统与 AI 产品，杨静关注一件事：让复杂的技术和业务逻辑，变成人能理解、能使用的体验。',
```

Reduce leadership emphasis by changing the four capability areas to complex UX, expressive UI systems, AI-assisted prototyping, and cross-functional product collaboration. Keep the two confirmed metrics exactly as `MAU +45%` and `留存 +35%`. Keep `AI-native Builder`, `Vibe Coding`, `Codex`, and `Claude` in English. Remove the explicit `5 年设计领导经验` hero stat and make the timeline read as one progression rather than five disconnected claims.

- [ ] **Step 4: Rewrite the footer invitation without changing contact controls**

Use:

```ts
const copy = locale === 'zh'
  ? {
      eyebrow: '保持联系',
      title: '聊聊产品、AI，或一个还没被讲清的问题。',
    }
  : /* keep the existing English object unchanged */;
```

Keep the email address, WeChat ID, copy icon behavior, check state, link targets, button labels, and accessibility text unchanged. Only shorten directly visible Chinese contact descriptions.

- [ ] **Step 5: Run focused tests and the editorial contract**

Run: `npm test -- tests/component/about-page.test.tsx tests/component/homepage.test.tsx tests/component/site-footer.test.tsx tests/unit/home-content.test.ts tests/unit/chinese-editorial-copy.test.ts`

Expected: About/home/footer tests PASS; the editorial contract still FAILS only on case-study and Build copy handled in later tasks.

- [ ] **Step 6: Commit the homepage/About/footer batch**

```bash
git add content/dictionaries/zh.ts content/home.ts components/about/about-page.tsx components/shell/site-footer.tsx components/shell/footer-contacts.tsx tests/component/about-page.test.tsx tests/component/homepage.test.tsx tests/component/site-footer.test.tsx tests/unit/home-content.test.ts
git commit -m "copy: refine Chinese homepage and about narrative"
```

### Task 3: Rewrite Call Agent And ConvoAI Cases

**Files:**
- Modify: `content/work/call-agent.zh.mdx`
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: directly visible Chinese copy in `components/call-agent/call-agent-diagrams.tsx`
- Modify: directly visible Chinese copy in `components/call-agent/call-agent-hero-sequence.tsx`
- Modify: directly visible Chinese copy in `components/call-agent/call-agent-layout.tsx`
- Modify: directly visible Chinese copy in `components/call-agent/call-agent-system-stage.tsx`
- Modify: directly visible Chinese copy in `components/convo-ai/convo-ai-launch-banner.tsx`
- Modify: directly visible Chinese copy in `components/convo-ai/convo-ai-layout.tsx`
- Modify: directly visible Chinese copy in `components/convo-ai/convo-ai-media.tsx`
- Modify: `tests/unit/call-agent-regression.test.ts`
- Modify: `tests/unit/convo-ai-content.test.ts`

- [ ] **Step 1: Change exact-copy tests to descriptive chapter and role anchors**

Assert the shared role phrase and these chapter headings:

```ts
expect(callAgentZh).toContain("role: '独立负责产品设计'");
expect(callAgentZh).toContain('<h2>配置与发布之间的产品链路</h2>');
expect(convoAiZh).toContain("role: '独立负责产品设计'");
expect(convoAiZh).toContain('<h2>实时对话的状态与控制</h2>');
```

Run: `npm test -- tests/unit/call-agent-regression.test.ts tests/unit/convo-ai-content.test.ts`

Expected: FAIL on outdated headings and role copy.

- [ ] **Step 2: Rewrite Call Agent around productization decisions**

Keep all section IDs, imports, media components, status, duration, and existing product facts. Replace rhetorical `不是…而是…` headings with descriptive headings. Compress each section to one consequential idea: configurable product scope, six-stage setup model, usable starting state, progressive complexity, observable AI behavior and controlled publishing, post-publish operations, and method summary. Remove self-congratulatory first-person framing; preserve the distinction between product design ownership and prototype construction.

- [ ] **Step 3: Rewrite ConvoAI around real-time state clarity**

Keep all seven section IDs, media modules, product facts, and cross-device distinction. Use descriptive headings and short paragraphs covering product context, App product completeness, conversation entry, in-call control, digital-human selection, real-time response chain, and design delivery. Keep the established lead explaining connect/listen/generate/playback/interruption, but cut repetition between the lead and later sections.

Do not edit error messages, media controls, playlist navigation labels, `aria-label`, or alt text in `convo-ai-media.tsx`.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- tests/unit/call-agent-regression.test.ts tests/unit/convo-ai-content.test.ts tests/component/call-agent-layout.test.tsx tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the AI cases**

```bash
git add content/work/call-agent.zh.mdx content/work/convo-ai.zh.mdx components/call-agent components/convo-ai tests/unit/call-agent-regression.test.ts tests/unit/convo-ai-content.test.ts
git commit -m "copy: clarify Chinese AI case narratives"
```

### Task 4: Rewrite The Meeting Case

**Files:**
- Modify: `content/work/meeting.zh.mdx`
- Modify: directly visible Chinese card copy in `components/meeting/meeting-showcase.tsx`
- Modify: directly visible Chinese explanatory copy in `components/meeting/meeting-evidence.tsx`
- Modify: directly visible Chinese explanatory copy in `components/meeting/meeting-models.tsx`
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `tests/component/meeting-evidence.test.tsx`
- Modify: `tests/component/meeting-models.test.tsx`

- [ ] **Step 1: Write Meeting copy assertions**

```ts
expect(zh).toContain("role: '独立负责产品设计'");
expect(zh).not.toContain('disclosure:');
expect(zh).toContain('<h2>四类终端共用的会议规则</h2>');
expect(zh).toContain('<h2>会中语言能力</h2>');
```

Run: `npm test -- tests/unit/meeting-content.test.ts`

Expected: FAIL.

- [ ] **Step 2: Rewrite the Meeting narrative and media captions**

Remove the metadata `disclosure` field and the visible claim disclaimer. Keep section IDs, shipped status, four-platform fact, imports, and media order. Replace judgment-led headings with descriptive headings covering embedded product context, changing meeting states, information priority, adaptive stage, whiteboard collaboration, language capabilities, interaction consistency, and cross-device rules.

In `meeting-showcase.tsx`, shorten visible Chinese titles and descriptions so each card states one design decision. Preserve every asset, item order, English string, label used as a control, and all accessibility text.

- [ ] **Step 3: Run Meeting tests**

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-evidence.test.tsx tests/component/meeting-models.test.tsx`

Expected: PASS.

- [ ] **Step 4: Commit Meeting copy**

```bash
git add content/work/meeting.zh.mdx components/meeting/meeting-showcase.tsx components/meeting/meeting-evidence.tsx components/meeting/meeting-models.tsx tests/unit/meeting-content.test.ts tests/component/meeting-evidence.test.tsx tests/component/meeting-models.test.tsx
git commit -m "copy: edit Chinese Meeting case for clarity"
```

### Task 5: Rewrite Xuelang Without Losing Confirmed Results

**Files:**
- Modify: `content/work/xuelang.zh.mdx`
- Modify: directly visible Chinese explanatory copy in `components/xuelang/xuelang-course-entry.tsx`
- Modify: directly visible Chinese explanatory copy in `components/xuelang/xuelang-evidence.tsx`
- Modify: directly visible Chinese explanatory copy in `components/xuelang/xuelang-interaction-board.tsx`
- Modify: directly visible Chinese explanatory copy in `components/xuelang/xuelang-layout.tsx`
- Modify: `tests/unit/xuelang-content.test.ts`

- [ ] **Step 1: Update Xuelang tests for role, metrics, and method-only reflection**

```ts
expect(zh).toContain("role: '独立负责产品设计'");
for (const metric of ['11.75%', '1.36%', '6.5%', '43%', '55%', '39%']) {
  expect(section(zh, 'results')).toContain(metric);
}
expect(section(zh, 'results')).not.toMatch(/下一阶段|后续假设|更值得验证/);
expect(section(zh, 'results')).toContain('把质量标准写进用户的判断路径');
```

Run: `npm test -- tests/unit/xuelang-content.test.ts`

Expected: FAIL on role wording and the current future-opportunity reflection.

- [ ] **Step 2: Edit Xuelang for a decision-led deep read**

Keep all eight chapter IDs, media, experiment framing, duration, data basis, and confirmed metrics exactly intact. Change the title from `学浪商业化体验升级` to `学浪商业化产品设计`. Standardize the role to `独立负责产品设计` while retaining collaboration language in the overview paragraph.

Shorten repeated strategy explanations. Preserve the three user problems, quality-standard logic, A/B/C decision, selected hero-preview result, continuous-learning sequence, and 14-day result basis. Rewrite the reflection as one method summary: quality standards must appear in the user's actual decision path; product information, purchase evidence, and learning continuity should express the same standard at different moments. Remove the entire future-opportunity paragraph.

- [ ] **Step 3: Run Xuelang tests**

Run: `npm test -- tests/unit/xuelang-content.test.ts tests/component/xuelang-layout.test.tsx tests/component/xuelang-course-entry.test.tsx tests/component/xuelang-interaction-board.test.tsx`

Expected: PASS.

- [ ] **Step 4: Commit Xuelang copy**

```bash
git add content/work/xuelang.zh.mdx components/xuelang tests/unit/xuelang-content.test.ts
git commit -m "copy: sharpen Chinese Xuelang case narrative"
```

### Task 6: Rewrite Tangping And STT Build Copy

**Files:**
- Modify: `content/work/tangping.zh.mdx`
- Modify: `content/tangping.ts`
- Modify: `content/build/stt-demo.zh.mdx`
- Modify: `tests/unit/tangping-content.test.ts`
- Modify: `tests/unit/stt-source.test.ts`
- Modify: `tests/unit/work-metadata.test.ts`

- [ ] **Step 1: Add tests for public metadata and the STT chapter replacement**

```ts
expect(tangpingZh).not.toContain('disclosure:');
expect(tangpingZh).toContain("proposition: '从用户研究到产品机会地图'");
expect(sttZh).not.toContain('disclosure:');
expect(sttZh).not.toContain("{ id: 'evidence-boundary'");
expect(sttZh).toContain("{ id: 'prototype-scope', label: '原型范围' }");
expect(sttZh).toContain('<section id="prototype-scope">');
```

Run: `npm test -- tests/unit/tangping-content.test.ts tests/unit/stt-source.test.ts tests/unit/work-metadata.test.ts`

Expected: FAIL.

- [ ] **Step 2: Rewrite Tangping around research and product opportunity**

Remove the metadata disclosure. Replace `设计师赋能` with `设计师成长` or a concrete description of learning, creation, and monetization. Keep project dates, media, status, and the retrospective nature of the case. In `content/tangping.ts`, remove generic platform language and make each visible passage state the user group, observed need, research synthesis, or resulting product opportunity.

- [ ] **Step 3: Replace STT evidence-boundary narration with prototype scope**

Remove the metadata `disclosure` field and `EvidenceLedger` import/render from the Chinese MDX only. Rename the chapter and section ID from `evidence-boundary` to `prototype-scope`, with the heading `原型覆盖的产品范围`. Describe only what the fixed prototype contains: room setup, device and language preparation, in-session bilingual transcript states, participant/settings context, and access-layer concepts. Do not list absent backend capabilities and do not claim adoption, customer use, or measured outcomes.

Keep the source/version facts, `DemoFrame`, all existing interactive/media behavior, and the first four chapter IDs. Rewrite the Build-system chapter around the product value of using AI-assisted construction for earlier interaction validation, while retaining the established use of tokens, components, audits, and visual regression.

- [ ] **Step 4: Run Tangping and STT tests**

Run: `npm test -- tests/unit/tangping-content.test.ts tests/unit/stt-source.test.ts tests/unit/work-metadata.test.ts tests/component/tangping-layout.test.tsx tests/component/build-lab.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit Tangping and Build copy**

```bash
git add content/work/tangping.zh.mdx content/tangping.ts content/build/stt-demo.zh.mdx tests/unit/tangping-content.test.ts tests/unit/stt-source.test.ts tests/unit/work-metadata.test.ts
git commit -m "copy: refine Chinese research and Build stories"
```

### Task 7: Complete Editorial, Build, And Browser Verification

**Files:**
- Modify only failing exact-copy tests caused by approved Chinese copy changes.
- Do not modify production design, layout, assets, English copy, controls, accessibility strings, or unrelated tests to make verification pass.

- [ ] **Step 1: Run the portfolio-wide editorial contract**

Run: `npm test -- tests/unit/chinese-editorial-copy.test.ts`

Expected: PASS.

If a banned term appears in a visible public sentence where it is the clearest accurate domain term, replace that single regex assertion with an explicit file-and-phrase allowlist. Do not weaken or delete the other contract checks.

- [ ] **Step 2: Search for residual inconsistencies**

Run:

```bash
rg -n "唯一产品设计师|项目主设计师|项目主负责设计师|不作.*声明|证据边界|赋能|打造|沉淀|闭环|抓手|全链路|体验升级|能力建设|价值落地" content/dictionaries/zh.ts content/home.ts components/about components/home components/shell content/work/*.zh.mdx content/build/*.zh.mdx components/call-agent components/convo-ai components/meeting components/tangping components/xuelang components/build-lab
```

Expected: no matches in directly visible public titles or body copy. Matches in excluded alt/aria/control/error/internal component branches may remain only when the approved scope says not to edit them.

- [ ] **Step 3: Run content validation, lint, and the full unit/component suite**

Run: `npm run validate:content && npm run lint && npm test`

Expected: all commands exit 0.

- [ ] **Step 4: Run the production build**

Run: `npm run build`

Expected: source publication validation, Next.js build, and output publication validation all exit 0.

- [ ] **Step 5: Start the local site and inspect all edited Chinese routes**

Run: `npm run dev -- --hostname 127.0.0.1 --port 50210`

Inspect at desktop `1440x1000` and mobile `390x844`:

- `/zh/`
- `/zh/about/`
- `/zh/work/call-agent/`
- `/zh/work/convo-ai/`
- `/zh/work/meeting/`
- `/zh/work/xuelang/`
- `/zh/work/tangping/`
- `/zh/build/stt-demo/`

Expected: no text overflow, clipped headings, accidental blank result/disclosure areas, broken chapter navigation, changed media order, or English-copy regressions. Contact copying and all existing controls continue to work.

- [ ] **Step 6: Run route-level Playwright regression tests**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/about-motion.spec.ts tests/e2e/call-agent.spec.ts tests/e2e/convo-ai.spec.ts tests/e2e/meeting.spec.ts tests/e2e/xuelang.spec.ts tests/e2e/tangping.spec.ts tests/e2e/stt-demo.spec.ts
```

Expected: PASS.

- [ ] **Step 7: Commit final test alignment and verification fixes**

```bash
git add tests
git commit -m "test: verify Chinese portfolio editorial pass"
```

Before committing, run `git diff --cached --name-only` and confirm it contains only tests changed to align with approved public copy. Do not stage the unrelated Meeting popup plan.

## Completion Criteria

- The exact identity `产品设计师（UI/UX），专注 AI 与复杂系统` appears consistently in the Chinese homepage/About positioning.
- `Yang Jing` remains the brand/navigation name; `杨静` is used naturally in Chinese prose.
- Homepage, About, case reflections, and footer feel warm without promotional claims.
- Case prose is shorter, descriptive, decision-led, and low in first-person narration.
- All targeted role labels use `独立负责产品设计`.
- Public disclosures and evidence-boundary narration are gone.
- Missing-result modules do not claim or speculate about impact.
- Confirmed About and Xuelang metrics remain intact.
- English technical terms remain English and are not forcibly explained.
- No layout, media, component behavior, navigation, controls, accessibility labels, errors, or English pages change.
- Content validation, lint, tests, build, and edited-route browser checks pass.
