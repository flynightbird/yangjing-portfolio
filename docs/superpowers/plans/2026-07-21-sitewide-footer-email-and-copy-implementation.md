# Sitewide Footer Email and Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the portfolio around `amanda.yangj@gmail.com`, add the approved copy action to the shared Footer, and remove the complete Xuelang-specific contact module.

**Architecture:** Keep `SiteFooter` as the shared structural component and delegate clipboard state to a focused client component. Render the email address link, copy button, and trailing email arrow as sibling controls; remove Xuelang's duplicated contact component at its two MDX call sites and delete its orphaned implementation.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Lucide React, Vitest, Testing Library, Playwright

---

## File Structure

- Create `components/shell/footer-email-actions.tsx`: localized Clipboard API state, reset timer, accessible feedback, and the three-part Footer email action row.
- Modify `components/shell/site-footer.tsx`: replace the fixed QQ email anchor with `FooterEmailActions`.
- Modify `components/shell/site-footer.module.css`: implement option A, translucent copy hover/focus, fixed icon targets, arrow placement, mobile fit, and reduced motion.
- Modify `tests/component/site-footer.test.tsx`: test the new address, DOM order, copy success/reset, and localized failure.
- Modify `tests/e2e/footer-reveal.spec.ts` and `tests/e2e/homepage.spec.ts`: update the sitewide address and verify hover/layout contracts.
- Modify `content/work/xuelang.zh.mdx` and `content/work/xuelang.en.mdx`: remove the Xuelang contact import and render call.
- Delete `components/xuelang/xuelang-contact.tsx`, `components/xuelang/xuelang-contact.module.css`, and `tests/component/xuelang-contact.test.tsx`.
- Modify `tests/e2e/xuelang.spec.ts`: verify the results chapter contains no duplicated contact module while the shared Footer remains present.
- Modify `tests/component/draft-case.test.tsx`: keep its no-contact assertion aligned with the new public email.

### Task 1: Lock the shared Footer behavior

**Files:**
- Modify: `tests/component/site-footer.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts:123`
- Modify: `tests/e2e/footer-reveal.spec.ts:43`
- Modify: `tests/component/draft-case.test.tsx:25`

- [ ] **Step 1: Add the component-test interaction imports and cleanup**

Use these imports and cleanup hooks in `tests/component/site-footer.test.tsx`:

```tsx
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});
```

- [ ] **Step 2: Replace the old Footer address assertion with the new structure contract**

Inside the existing locale-parametrized test, use:

```tsx
const actions = container.querySelector('[data-footer-email-actions]');
expect(actions).toBeInTheDocument();
expect(
  within(actions as HTMLElement).getByRole('link', {
    name: 'amanda.yangj@gmail.com',
  }),
).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
expect(
  within(actions as HTMLElement).getByRole('button', {
    name: locale === 'zh' ? '复制邮箱' : 'Copy email address',
  }),
).toBeVisible();
expect(
  within(actions as HTMLElement).getByRole('link', {
    name: locale === 'zh'
      ? '发送邮件至 amanda.yangj@gmail.com'
      : 'Send email to amanda.yangj@gmail.com',
  }),
).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');

expect(
  Array.from(actions?.children ?? []).slice(0, 3).map((element) =>
    element.getAttribute('data-footer-email-control'),
  ),
).toEqual(['address', 'copy', 'arrow']);
```

Keep the existing liquid field, metadata, no-About, no-resume, and copyright assertions.

- [ ] **Step 3: Add the copy-success and reset test**

```tsx
it('copies the public email, announces success, and resets the control', async () => {
  vi.useFakeTimers();
  const writeText = vi
    .spyOn(navigator.clipboard, 'writeText')
    .mockResolvedValue(undefined);

  render(<SiteFooter locale="en" />);
  fireEvent.click(screen.getByRole('button', { name: 'Copy email address' }));

  await waitFor(() => {
    expect(writeText).toHaveBeenCalledWith('amanda.yangj@gmail.com');
  });
  expect(screen.getByRole('button', { name: 'Email copied' })).toHaveAttribute(
    'data-copy-state',
    'copied',
  );
  expect(screen.getByRole('status')).toHaveTextContent('Email copied');

  act(() => vi.advanceTimersByTime(1800));
  expect(screen.getByRole('button', { name: 'Copy email address' })).toHaveAttribute(
    'data-copy-state',
    'idle',
  );
});
```

- [ ] **Step 4: Add the localized copy-failure test**

```tsx
it('keeps the email usable and announces a localized copy failure', async () => {
  vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

  render(<SiteFooter locale="zh" />);
  fireEvent.click(screen.getByRole('button', { name: '复制邮箱' }));

  expect(
    await screen.findByRole('button', { name: '复制失败，请手动复制' }),
  ).toHaveAttribute('data-copy-state', 'failed');
  expect(screen.getByRole('status')).toHaveTextContent('复制失败，请手动复制');
  expect(screen.getByRole('link', { name: 'amanda.yangj@gmail.com' })).toHaveAttribute(
    'href',
    'mailto:amanda.yangj@gmail.com',
  );
});
```

- [ ] **Step 5: Update existing end-to-end and draft-case email expectations**

Replace Footer references to `yangux@qq.com` with `amanda.yangj@gmail.com` in `tests/e2e/homepage.spec.ts` and `tests/e2e/footer-reveal.spec.ts`. In `tests/component/draft-case.test.tsx`, keep the existing absence assertion but target:

```tsx
expect(container.querySelector('a[href="mailto:amanda.yangj@gmail.com"]')).toBeNull();
```

- [ ] **Step 6: Run the focused tests and verify the new contract fails**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/draft-case.test.tsx --reporter=verbose
```

Expected: FAIL because `FooterEmailActions`, the new address, copy button, and feedback states do not exist yet.

- [ ] **Step 7: Commit the failing Footer contract**

```bash
git add tests/component/site-footer.test.tsx tests/component/draft-case.test.tsx tests/e2e/homepage.spec.ts tests/e2e/footer-reveal.spec.ts
git commit -m "test: define shared Footer email actions"
```

### Task 2: Implement the approved Footer action row

**Files:**
- Create: `components/shell/footer-email-actions.tsx`
- Modify: `components/shell/site-footer.tsx:1-47`
- Modify: `components/shell/site-footer.module.css:87-143`

- [ ] **Step 1: Create the focused client component**

Create `components/shell/footer-email-actions.tsx` with:

```tsx
'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { Locale } from '@/content/types';

import styles from './site-footer.module.css';

const EMAIL = 'amanda.yangj@gmail.com';
const RESET_DELAY = 1800;

type CopyState = 'idle' | 'copied' | 'failed';

const labels = {
  en: {
    copy: 'Copy email address',
    copied: 'Email copied',
    failed: 'Copy failed. Please copy the email manually.',
    send: `Send email to ${EMAIL}`,
  },
  zh: {
    copy: '复制邮箱',
    copied: '邮箱已复制',
    failed: '复制失败，请手动复制',
    send: `发送邮件至 ${EMAIL}`,
  },
} as const;

export function FooterEmailActions({ locale }: { readonly locale: Locale }) {
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const text = labels[locale];
  const feedback = copyState === 'idle' ? '' : text[copyState];
  const buttonLabel = feedback || text.copy;

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  async function copyEmail() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(EMAIL);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), RESET_DELAY);
  }

  return (
    <div className={styles.emailActions} data-footer-email-actions>
      <a
        className={styles.email}
        href={`mailto:${EMAIL}`}
        data-footer-email-control="address"
      >
        {EMAIL}
      </a>
      <button
        className={styles.copyButton}
        type="button"
        onClick={copyEmail}
        aria-label={buttonLabel}
        data-copy-state={copyState}
        data-footer-email-control="copy"
      >
        {copyState === 'copied' ? (
          <Check aria-hidden="true" size={18} strokeWidth={1.7} />
        ) : (
          <Copy aria-hidden="true" size={18} strokeWidth={1.7} />
        )}
      </button>
      <a
        className={styles.emailArrow}
        href={`mailto:${EMAIL}`}
        aria-label={text.send}
        data-footer-email-control="arrow"
      >
        <span
          className={styles.emailIcon}
          data-remix-icon="arrow-right-up-line"
          aria-hidden="true"
        />
      </a>
      <span className={styles.emailFeedback} role="status" aria-live="polite">
        {feedback}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Compose the client component into the shared Footer**

Import `FooterEmailActions` in `components/shell/site-footer.tsx` and replace the old email anchor with:

```tsx
<FooterEmailActions locale={locale} />
```

Do not add `'use client'` to `site-footer.tsx`.

- [ ] **Step 3: Replace the old email styles with option A**

Use these rules in `site-footer.module.css`:

```css
.emailActions {
  display: inline-grid;
  max-width: 100%;
  grid-template-columns: minmax(0, auto) 2.5rem 2.5rem;
  align-items: center;
  column-gap: 0.25rem;
  margin-top: clamp(2rem, 5vh, 4rem);
}

.email {
  min-width: 0;
  padding-block: 0.625rem;
  border-bottom: 1px solid rgba(244, 245, 242, 0.72);
  color: var(--color-paper);
  font-size: clamp(1.15rem, 2vw, 1.75rem);
  overflow-wrap: anywhere;
  text-decoration: none;
}

.copyButton,
.emailArrow {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--color-paper);
  text-decoration: none;
}

.copyButton {
  cursor: pointer;
  transition: background-color 180ms var(--ease-out);
}

.copyButton:hover,
.copyButton:focus-visible {
  background: rgba(244, 245, 242, 0.12);
}

.copyButton:focus-visible,
.emailArrow:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.emailIcon {
  display: block;
  width: 1.75rem;
  height: 1.75rem;
  background: currentColor;
  mask: url('/icons/remix/arrow-right-up-line.svg') center / contain no-repeat;
  transition: transform 350ms var(--ease-out);
}

.emailArrow:hover .emailIcon,
.emailArrow:focus-visible .emailIcon {
  transform: translate(0.2rem, -0.2rem);
}

.emailFeedback {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

- [ ] **Step 4: Add mobile and reduced-motion rules**

Inside the existing mobile media query add:

```css
.emailActions {
  width: min(100%, 30rem);
  grid-template-columns: minmax(0, 1fr) 2.25rem 2.25rem;
  column-gap: 0.125rem;
}

.email {
  font-size: 1rem;
}

.copyButton,
.emailArrow {
  width: 2.25rem;
  height: 2.25rem;
}
```

Inside the reduced-motion query add `.copyButton` to the transition reset:

```css
.copyButton,
.emailIcon {
  transition: none;
}
```

- [ ] **Step 5: Run the focused Footer tests**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/draft-case.test.tsx --reporter=verbose
```

Expected: PASS for both files, including Clipboard API success, reset, localized failure, and address/copy/arrow order.

- [ ] **Step 6: Run lint**

Run:

```bash
npm run lint
```

Expected: exit 0 with no new errors or warnings in the modified Footer files.

- [ ] **Step 7: Commit the Footer implementation**

```bash
git add components/shell/footer-email-actions.tsx components/shell/site-footer.tsx components/shell/site-footer.module.css
git commit -m "feat: unify shared Footer email actions"
```

### Task 3: Remove the Xuelang-specific contact module

**Files:**
- Modify: `content/work/xuelang.zh.mdx:9,234`
- Modify: `content/work/xuelang.en.mdx:9,182`
- Delete: `components/xuelang/xuelang-contact.tsx`
- Delete: `components/xuelang/xuelang-contact.module.css`
- Delete: `tests/component/xuelang-contact.test.tsx`
- Modify: `tests/e2e/xuelang.spec.ts:88-93`

- [ ] **Step 1: Change the Xuelang end-to-end contract before removing code**

Replace the locale-specific `#results` email assertion in `tests/e2e/xuelang.spec.ts` with:

```tsx
await expect(page.locator('#results a[href^="mailto:"]')).toHaveCount(0);
await expect(page.locator('#results')).not.toContainText('flydesigner_yangj');
await expect(page.locator('[data-site-footer]')).toHaveCount(1);
await expect(
  page.locator('[data-site-footer] a[href="mailto:amanda.yangj@gmail.com"]'),
).toHaveCount(2);
```

- [ ] **Step 2: Run a source check and confirm Xuelang still contains the old module**

Run:

```bash
rg -n "XuelangContact|xuelang-contact|flydesigner_yangj|yangux@qq\.com" content components tests
```

Expected: matches remain in both Xuelang MDX files, the Xuelang contact component/CSS/test, and old email assertions.

- [ ] **Step 3: Remove both MDX imports and render calls**

Delete this line from both localized Xuelang MDX files:

```tsx
import { XuelangContact } from '@/components/xuelang/xuelang-contact'
```

Delete the corresponding final render calls:

```tsx
<XuelangContact locale="zh" />
<XuelangContact locale="en" />
```

Keep the surrounding `#results` sections and reflection copy unchanged.

- [ ] **Step 4: Delete the orphaned Xuelang contact files**

Delete:

```text
components/xuelang/xuelang-contact.tsx
components/xuelang/xuelang-contact.module.css
tests/component/xuelang-contact.test.tsx
```

- [ ] **Step 5: Verify no production QQ email or Xuelang contact module remains**

Run:

```bash
rg -n "XuelangContact|xuelang-contact|flydesigner_yangj|yangux@qq\.com" app components content lib
```

Expected: no matches.

- [ ] **Step 6: Run focused content and component tests**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/unit/xuelang-content.test.ts tests/component/case-study.test.tsx --reporter=dot
```

Expected: all selected tests pass.

- [ ] **Step 7: Commit the Xuelang cleanup**

```bash
git add content/work/xuelang.zh.mdx content/work/xuelang.en.mdx tests/e2e/xuelang.spec.ts
git add -u components/xuelang tests/component/xuelang-contact.test.tsx
git commit -m "refactor: use shared Footer after Xuelang"
```

### Task 4: Verify visual polish and sitewide consistency

**Files:**
- Verify: `components/shell/footer-email-actions.tsx`
- Verify: `components/shell/site-footer.module.css`
- Verify: `content/work/xuelang.zh.mdx`
- Verify: `content/work/xuelang.en.mdx`
- Verify: `tests/e2e/footer-reveal.spec.ts`
- Verify: `tests/e2e/homepage.spec.ts`
- Verify: `tests/e2e/xuelang.spec.ts`

- [ ] **Step 1: Build the static site**

Run:

```bash
npm run build:framework
```

Expected: Next.js compiles, TypeScript passes, and all localized static routes are generated.

- [ ] **Step 2: Serve the static export and inspect both locales**

Run:

```bash
PORT=4175 node scripts/serve-static-export.mjs
```

Inspect `/en/`, `/zh/`, `/en/about/`, and both localized Xuelang routes. Confirm every page ends with the same shared Footer and both Xuelang pages no longer show their former contact block.

- [ ] **Step 3: Verify the selected Footer interaction at desktop and 390px**

At `1440x900` and `390x844`, confirm:

- visible order is email address, copy button, arrow;
- copy hover/focus background computes to `rgba(244, 245, 242, 0.12)`;
- the arrow is after the copy button and retains its upward-right hover movement;
- success swaps Copy to Check and announces localized feedback;
- the address and two fixed controls do not clip, overlap, or cause page-level overflow;
- reduced motion removes copy and arrow transitions.

- [ ] **Step 4: Run focused end-to-end checks**

Run:

```bash
npx playwright test tests/e2e/footer-reveal.spec.ts tests/e2e/homepage.spec.ts tests/e2e/xuelang.spec.ts --project=desktop --project=mobile
```

Expected: all selected tests pass for both configured viewports.

- [ ] **Step 5: Run final source and repository checks**

Run:

```bash
rg -n "yangux@qq\.com|XuelangContact|xuelang-contact|flydesigner_yangj" app components content lib tests
git diff --check
git status --short --branch
```

Expected: the removed production identifiers have no remaining source matches except intentionally updated historical assertions if any; diff check reports no whitespace errors; only planned work is present.

- [ ] **Step 6: Run lint and the complete Vitest suite**

Run:

```bash
npm run lint
npm test
```

Expected: lint exits 0 and all tests related to the modified Footer and Xuelang content pass. If the migration worktree's known missing publication assets still fail unrelated tests, record the exact failing files and counts without changing those publication systems.
