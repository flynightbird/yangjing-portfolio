# AIDX Singapore Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make AIDX's Singapore identity immediately visible in both localized homepage cards.

**Architecture:** Keep the existing AIDX component and project model unchanged. Update only the localized `kind` and `proposition` strings, and add a focused component test that proves both locales render the approved copy while the external destination remains unchanged.

**Tech Stack:** React 19, TypeScript, Testing Library, Vitest, Next.js 16.

---

## File Map

- Create `tests/component/aidx-homepage-copy.test.tsx`: isolated bilingual rendering and destination contract.
- Modify `content/dictionaries/en.ts`: approved English Singapore positioning.
- Modify `content/dictionaries/zh.ts`: approved Chinese Singapore positioning.

### Task 1: Lock the Bilingual AIDX Copy

**Files:**
- Create: `tests/component/aidx-homepage-copy.test.tsx`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`

- [ ] **Step 1: Write the failing component test**

Create `tests/component/aidx-homepage-copy.test.tsx`:

```tsx
import { cleanup, render, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FeaturedWork } from '@/components/home/featured-work';

afterEach(cleanup);

describe('AIDX Singapore positioning', () => {
  it.each([
    {
      locale: 'en' as const,
      kind: 'Singapore AI company',
      proposition:
        'A live website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
    },
    {
      locale: 'zh' as const,
      kind: '新加坡 AI 公司',
      proposition:
        '为新加坡 AI 安全公司 AIDX 打造的线上官网，通过界面、信息结构与动效塑造品牌表达。',
    },
  ])('renders the approved $locale positioning', ({ locale, kind, proposition }) => {
    const { container } = render(<FeaturedWork locale={locale} />);
    const aidx = container.querySelector<HTMLElement>('[data-project-id="aidx"]');

    expect(aidx).toBeInTheDocument();
    expect(within(aidx as HTMLElement).getByText(kind)).toBeVisible();
    expect(within(aidx as HTMLElement).getByText(proposition)).toBeVisible();
    expect(within(aidx as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      'https://aidxtech.com/',
    );
  });
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
npx vitest run tests/component/aidx-homepage-copy.test.tsx
```

Expected: both locale cases fail because the current labels and propositions are generic.

- [ ] **Step 3: Implement the approved copy**

In `content/dictionaries/en.ts`, set:

```ts
kind: 'Singapore AI company',
proposition:
  'A live website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.',
```

In `content/dictionaries/zh.ts`, set:

```ts
kind: '新加坡 AI 公司',
proposition:
  '为新加坡 AI 安全公司 AIDX 打造的线上官网，通过界面、信息结构与动效塑造品牌表达。',
```

- [ ] **Step 4: Run focused and content verification**

Run:

```bash
npx vitest run tests/component/aidx-homepage-copy.test.tsx
node scripts/validate-content.mjs
npx eslint tests/component/aidx-homepage-copy.test.tsx content/dictionaries/en.ts content/dictionaries/zh.ts
git diff --check
```

Expected: both component cases pass; content validation, ESLint, and diff checks exit 0.

- [ ] **Step 5: Commit only the approved scope**

Stage the new test and only the AIDX dictionary hunks. Do not stage existing ConvoAI or homepage worktree changes.

```bash
git commit -m "content: highlight AIDX Singapore positioning"
```

- [ ] **Step 6: Publish the branch**

Push the current branch without force:

```bash
git push origin codex/portfolio-nextjs
```

Expected: the remote `codex/portfolio-nextjs` branch advances to the new content commit.

