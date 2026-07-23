# ConvoAI Copy Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove attribution and evidence-disclaimer language from ConvoAI while improving the Chinese case-study narrative.

**Architecture:** Keep the current MDX chapter and component boundaries. Change content at the ConvoAI MDX and media-catalog layers, remove the now-unused disclosure markup from the ConvoAI layout, and rewrite the internal blueprint without changing runtime behavior.

**Tech Stack:** Next.js, React, MDX, TypeScript, Vitest, Playwright.

---

### Task 1: Lock The Public Copy Contract

**Files:**
- Modify: `tests/unit/convo-ai-content.test.ts`
- Modify: `tests/component/convo-ai-layout.test.tsx`
- Modify: `tests/e2e/convo-ai.spec.ts`

- [ ] Add assertions for plain role/status copy, absent disclosure markup, and absent attribution/caveat phrases.
- [ ] Run the focused tests and confirm they fail against the current content.

### Task 2: Rewrite Public ConvoAI Copy

**Files:**
- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `components/convo-ai/convo-ai-media-catalog.ts`

- [ ] Replace qualified role/status values and remove disclosure metadata.
- [ ] Rewrite each Chinese chapter lead as challenge, decision, and resulting experience.
- [ ] Remove evidence/reviewer language from Chinese media CPDI copy while retaining accurate interface descriptions.
- [ ] Remove ConvoAI disclosure markup and its unused style.
- [ ] Run focused tests to green.

### Task 3: Rewrite The Internal Blueprint

**Files:**
- Modify: `evidence/convo-ai/case-study-blueprint.zh.md`

- [ ] Replace the evidence-audit framing with a narrative blueprint.
- [ ] Preserve positioning, seven chapters, media mapping, presentation outline, interview prompts, and evaluation priorities.
- [ ] Remove attribution labels, evidence-gap policing, and unverified-outcome caveats requested for deletion.

### Task 4: Verify The Result

**Files:**
- Modify only if verification finds an in-scope defect.

- [ ] Run ConvoAI unit and component tests.
- [ ] Run ConvoAI Playwright structure coverage in Chinese.
- [ ] Scan all ConvoAI public content, tests, and internal blueprint for removed phrases.
- [ ] Confirm the page renders at the existing local preview URL without layout regression.
