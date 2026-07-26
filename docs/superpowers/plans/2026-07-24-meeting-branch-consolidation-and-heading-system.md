# Meeting Branch Consolidation and Heading System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve the current Meeting media and copy work, make it the canonical Meeting branch, and integrate the shared five-role case-study heading system without losing the newer showcase implementation.

**Architecture:** `codex/meeting-new-assets` remains the source of truth because it contains the newest copy, imported media, posters, and active showcase implementation. The shared heading history is merged from `codex/shared/integration`; the older Meeting branches are comparison sources only until their unique behavior has been audited. After verification, the canonical branch is renamed to `codex/case/meeting-refresh` and pushed without deleting legacy branches.

**Tech Stack:** Next.js 16, React, TypeScript, CSS Modules, MDX, Vitest, Playwright, Git worktrees

---

### Task 1: Protect the active Meeting work

**Files:**
- Modify: existing Meeting components, content, evidence, tests, videos, and posters already present in the worktree
- Exclude: `next-env.d.ts`

- [ ] **Step 1: Restore the generated Next type path**

Change `next-env.d.ts` back to:

```ts
import "./.next/types/routes.d.ts";
```

- [ ] **Step 2: Run the focused Meeting test baseline**

Run:

```bash
npm test -- tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts tests/component/meeting-evidence.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-models.test.tsx
```

Record any existing failures before integration; do not hide them by changing expectations.

- [ ] **Step 3: Commit the active work as a recoverable checkpoint**

```bash
git add components/meeting components/shell/site-header.tsx content/work/meeting.en.mdx content/work/meeting.zh.mdx docs/superpowers evidence/meeting next.config.mjs public/images/meeting public/videos/meeting tests/component/meeting-evidence.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-models.test.tsx tests/e2e/meeting.spec.ts tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts
git commit -m "feat: refresh Meeting case media and narrative"
git push -u origin codex/meeting-new-assets
```

### Task 2: Integrate the shared five-role heading system

**Files:**
- Modify through merge: `app/globals.css`
- Modify through merge: `components/case-study/case-layout.module.css`
- Modify through merge: `components/case-study/print.css`
- Modify through merge: `components/meeting/meeting-layout.module.css`
- Modify through merge: `components/meeting/meeting-evidence.module.css`
- Modify through merge: `components/meeting/meeting-models.module.css`
- Modify through merge: `tests/unit/portfolio-detail-system.test.ts`
- Modify through merge: `tests/e2e/portfolio-detail-system.spec.ts`

- [ ] **Step 1: Confirm the current branch lacks the five semantic tokens**

```bash
rg "case-(project|chapter|narrative|media|card)-title-size" app/globals.css
```

Expected before merge: no matches.

- [ ] **Step 2: Merge the reviewed shared implementation**

```bash
git merge --no-ff codex/shared/integration
```

Resolve conflicts by preserving current Meeting media, copy, and showcase markup while accepting the shared semantic tokens, role mappings, print sizes, and tests.

- [ ] **Step 3: Verify the five desktop maxima**

Confirm the token maxima remain:

```text
Project 58px
Chapter 50px
Narrative 36px
Media 29px
Card 22px
```

- [ ] **Step 4: Run the focused typography tests**

```bash
npm test -- tests/unit/portfolio-detail-system.test.ts tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-models.test.tsx
```

### Task 3: Audit legacy Meeting branches

**Files:**
- Compare: `components/meeting/`
- Compare: `content/work/meeting.en.mdx`
- Compare: `content/work/meeting.zh.mdx`
- Compare: `public/videos/meeting/`

- [ ] **Step 1: Compare `codex/meeting-product-showcase` with the canonical branch**

Inventory any media, interaction, accessibility, or fallback behavior present only in the legacy branch.

- [ ] **Step 2: Compare `codex/case/meeting-assets` with the canonical branch**

Confirm its only required unique contribution is already provided by `codex/shared/integration` and that no Meeting evidence behavior is missing.

- [ ] **Step 3: Migrate only demonstrably missing behavior**

For each missing behavior, add a failing focused test, run it to verify RED, implement the smallest change, and rerun to GREEN. Do not copy legacy components wholesale.

### Task 4: Verify and establish the canonical branch

**Files:**
- Verify all tracked files

- [ ] **Step 1: Run unit and component tests**

```bash
npm test -- tests/unit/portfolio-detail-system.test.ts tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts tests/component/meeting-evidence.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-models.test.tsx
```

- [ ] **Step 2: Run lint and framework build**

```bash
npm run lint
npm run build:framework
git diff --check
```

- [ ] **Step 3: Run Meeting and shared-detail E2E checks**

```bash
PW_REUSE_SERVER=1 PW_PORT=4196 npx playwright test tests/e2e/meeting.spec.ts tests/e2e/portfolio-detail-system.spec.ts --project=desktop --project=mobile
```

- [ ] **Step 4: Rename and push the canonical branch**

```bash
git branch -m codex/case/meeting-refresh
git push -u origin codex/case/meeting-refresh
```

Keep `codex/case/meeting-assets` and `codex/meeting-product-showcase` available until the user explicitly approves remote deletion.
