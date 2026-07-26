# Global Site Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the approved liquid Email/WeChat Footer the only Footer implementation on every localized route and the global not-found page.

**Architecture:** Keep `SiteFooter` mounted once in the localized layout and explicitly mount it in `GlobalNotFound`. Rename the homepage-specific contact surface to a route-neutral component, delete the legacy single-email row, and make the liquid CSS the default instead of switching presentations with `body:has([data-homepage])`.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Lucide React, Vitest/Testing Library, Playwright

---

## File Map

- Create `components/shell/footer-contacts.tsx`: route-neutral Email and WeChat contact capsules, renamed from the homepage-only component.
- Delete `components/shell/home-footer-contacts.tsx`: obsolete homepage-specific component name.
- Delete `components/shell/footer-email-actions.tsx`: obsolete single-email Footer implementation.
- Modify `components/shell/footer-copy-button.tsx`: remove legacy-row compatibility props and data attributes.
- Modify `components/shell/site-footer.tsx`: render only `FooterContacts` and remove legacy imports/markup.
- Modify `components/shell/site-footer.module.css`: make liquid presentation global, rename contact selectors, and remove legacy email-row CSS.
- Modify `app/global-not-found.tsx`: render the English `SiteFooter` after not-found content.
- Modify `tests/component/site-footer.test.tsx`: assert one contact surface, no legacy markup, and preserve clipboard behavior.
- Modify `tests/component/not-found.test.tsx`: assert the global not-found document includes the shared Footer.
- Modify `tests/e2e/footer-reveal.spec.ts`: verify the same Footer across Home, About, Work, Build, and 404 routes.
- Modify `tests/e2e/homepage.spec.ts`: use the route-neutral Footer selector.

### Task 0: Prepare The Isolated Worktree

**Files:**
- Verify only; no source changes.

- [ ] **Step 1: Install the exact project dependencies**

```bash
npm install --include=dev
```

Expected: install exits 0 and does not modify tracked source files.

- [ ] **Step 2: Verify the existing Footer baseline**

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/not-found.test.tsx
```

Expected: both existing component test files PASS before the contract changes.

### Task 1: Define The Single-Footer Component Contract

**Files:**
- Modify: `tests/component/site-footer.test.tsx`
- Create: `components/shell/footer-contacts.tsx`
- Delete: `components/shell/home-footer-contacts.tsx`
- Delete: `components/shell/footer-email-actions.tsx`
- Modify: `components/shell/footer-copy-button.tsx`
- Modify: `components/shell/site-footer.tsx`

- [ ] **Step 1: Replace the component structure test with the route-neutral contract**

In `tests/component/site-footer.test.tsx`, replace the first locale test with:

```tsx
it.each(['en', 'zh'] as const)('renders one shared contact surface in %s', (locale) => {
  const { container } = render(<SiteFooter locale={locale} />);
  const contacts = container.querySelector('[data-footer-contacts]');

  expect(container.firstElementChild).toHaveAttribute('data-site-footer');
  expect(contacts).toBeInTheDocument();
  expect(container.querySelectorAll('[data-footer-contacts]')).toHaveLength(1);
  expect(contacts?.querySelectorAll('[data-contact-capsule]')).toHaveLength(2);
  expect(within(contacts as HTMLElement).getByText('flydesigner_yangj')).toBeVisible();
  expect(
    within(contacts as HTMLElement).getByRole('link', {
      name: 'amanda.yangj@gmail.com',
    }),
  ).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
  expect(
    within(contacts as HTMLElement).getByRole('button', {
      name: locale === 'zh' ? '复制微信' : 'Copy WeChat ID',
    }),
  ).toBeVisible();
  expect(container.querySelectorAll('a[href="mailto:amanda.yangj@gmail.com"]')).toHaveLength(2);
  expect(screen.getByText('© 2026 Yang Jing')).toBeVisible();
});
```

Update the independent copy test selectors from `[data-home-footer-contacts]` to `[data-footer-contacts]`. Delete the two tests that exercise the legacy row (`copies the public email...` and `keeps the email usable...`); the independent capsule tests already cover success, reset, repeated clicks, and localized failure.

- [ ] **Step 2: Run the component test and confirm RED**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx
```

Expected: FAIL because `[data-footer-contacts]` does not exist.

- [ ] **Step 3: Rename the contact component and remove the legacy implementation**

Create `components/shell/footer-contacts.tsx` with the current localized capsule implementation, changing only its exported name, wrapper class, and data attribute:

```tsx
import { ArrowUpRight } from 'lucide-react';

import type { Locale } from '@/content/types';

import { FooterCopyButton } from './footer-copy-button';
import styles from './site-footer.module.css';

const EMAIL = 'amanda.yangj@gmail.com';
const WECHAT = 'flydesigner_yangj';

const labels = {
  en: {
    email: 'Email',
    wechat: 'WeChat',
    send: `Send email to ${EMAIL}`,
    emailCopy: {
      copy: 'Copy email address',
      copied: 'Email copied',
      failed: 'Email copy failed. Please copy it manually.',
    },
    wechatCopy: {
      copy: 'Copy WeChat ID',
      copied: 'WeChat ID copied',
      failed: 'WeChat ID copy failed. Please copy it manually.',
    },
  },
  zh: {
    email: '邮箱',
    wechat: '微信',
    send: `发送邮件至 ${EMAIL}`,
    emailCopy: {
      copy: '复制邮箱',
      copied: '邮箱已复制',
      failed: '邮箱复制失败，请手动复制',
    },
    wechatCopy: {
      copy: '复制微信',
      copied: '微信已复制',
      failed: '微信复制失败，请手动复制',
    },
  },
} as const;

export function FooterContacts({ locale }: { readonly locale: Locale }) {
  const text = labels[locale];

  return (
    <div className={styles.footerContacts} data-footer-contacts>
      <div className={styles.contactCapsule} data-contact-capsule="email">
        <a className={styles.contactValue} href={`mailto:${EMAIL}`} aria-label={EMAIL}>
          <small>{text.email}</small>
          <strong>{EMAIL}</strong>
        </a>
        <div className={styles.contactActions}>
          <FooterCopyButton value={EMAIL} channel="email" labels={text.emailCopy} buttonClassName={styles.contactCopyButton} feedbackClassName={styles.emailFeedback} />
          <a className={styles.contactMailAction} href={`mailto:${EMAIL}`} aria-label={text.send}>
            <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
          </a>
        </div>
      </div>
      <div className={styles.contactCapsule} data-contact-capsule="wechat">
        <div className={styles.contactValue}>
          <small>{text.wechat}</small>
          <strong>{WECHAT}</strong>
        </div>
        <div className={styles.contactActions}>
          <FooterCopyButton value={WECHAT} channel="wechat" labels={text.wechatCopy} buttonClassName={styles.contactCopyButton} feedbackClassName={styles.emailFeedback} />
        </div>
      </div>
    </div>
  );
}
```

Delete `components/shell/home-footer-contacts.tsx` and `components/shell/footer-email-actions.tsx`. In `components/shell/site-footer.tsx`, replace both old imports with:

```tsx
import { FooterContacts } from './footer-contacts';
```

Replace the two old child elements with one:

```tsx
<FooterContacts locale={locale} />
```

Rename the Footer surface wrapper and remove the obsolete reveal attribute:

```tsx
<div className={styles.surface} data-footer-surface>
```

In `components/shell/footer-copy-button.tsx`, remove `legacyControl` from the props interface and function parameters. Remove these three legacy-only JSX attributes:

```tsx
data-footer-email-control={legacyControl ? 'copy' : undefined}
data-footer-email-icon={legacyControl ? 'check' : undefined}
data-footer-email-icon={legacyControl ? 'copy' : undefined}
```

- [ ] **Step 4: Update the CSS class name needed by the component**

In `components/shell/site-footer.module.css`, make these mechanical selector renames. Do not change visibility behavior yet; Task 2 owns the visual switch and route behavior.

```text
.revealLayer      -> .surface
.homeContacts     -> .footerContacts
.homeCopyButton   -> .contactCopyButton
.homeMailAction   -> .contactMailAction
```

- [ ] **Step 5: Run the component test and confirm GREEN**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx
```

Expected: all `SiteFooter` tests PASS.

- [ ] **Step 6: Confirm obsolete component references are gone**

Run:

```bash
rg -n "FooterEmailActions|HomeFooterContacts|footer-email-actions|home-footer-contacts|legacyControl|data-footer-email-actions|data-home-footer-contacts|data-footer-email-control|data-footer-email-icon|data-footer-reveal-layer|revealLayer|homeCopyButton|homeMailAction" components tests/component
```

Expected: exit 1 with no matches.

- [ ] **Step 7: Commit the single component implementation**

```bash
git add components/shell/footer-contacts.tsx components/shell/home-footer-contacts.tsx components/shell/footer-email-actions.tsx components/shell/footer-copy-button.tsx components/shell/site-footer.tsx components/shell/site-footer.module.css tests/component/site-footer.test.tsx
git commit -m "refactor: make liquid Footer the only contact component"
```

### Task 2: Make The Liquid Presentation Route-Neutral

**Files:**
- Modify: `tests/e2e/footer-reveal.spec.ts`
- Modify: `tests/e2e/homepage.spec.ts`
- Modify: `components/shell/site-footer.module.css`

- [ ] **Step 1: Replace the non-home legacy E2E contract**

In `tests/e2e/footer-reveal.spec.ts`, replace `non-home routes keep the legacy email row` with:

```ts
test('localized content routes share the liquid Footer', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Route coverage is viewport-independent.');

  for (const path of [
    '/en/about/',
    '/zh/work/call-agent/',
    '/en/build/stt-demo/',
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const footer = page.locator('[data-site-footer]');
    const contacts = footer.locator('[data-footer-contacts]');
    await expect(footer).toHaveCount(1);
    await expect(contacts).toBeVisible();
    await expect(contacts.locator('[data-contact-capsule]')).toHaveCount(2);
    await expect(contacts.getByText('flydesigner_yangj')).toBeVisible();
    await expect(footer.locator('[data-footer-liquid]')).toHaveCount(3);
  }
});
```

Change all homepage selectors in this file from `[data-home-footer-contacts]` to `[data-footer-contacts]`. In `tests/e2e/homepage.spec.ts`, make the same selector rename and delete the obsolete `[data-footer-email-actions]` assertion.

- [ ] **Step 2: Run the route test and confirm RED**

Run:

```bash
PW_PORT=4195 npx playwright test tests/e2e/footer-reveal.spec.ts --project=desktop
```

Expected: FAIL on `/en/about/` because `.footerContacts` and liquid decoration are still hidden outside the homepage.

- [ ] **Step 3: Replace homepage-scoped CSS with the global liquid surface**

In `components/shell/site-footer.module.css`:

1. Change `.root` to use the approved default surface and remove the duplicate homepage root block:

```css
.root {
  position: relative;
  min-height: 42rem;
  overflow: hidden;
  background: #19161b;
  color: var(--color-paper);
  isolation: isolate;
}
```

2. Replace `.surface` with:

```css
.surface {
  position: relative;
  min-height: inherit;
  overflow: hidden;
  background: #19161b;
  isolation: isolate;
}
```

3. Delete all legacy selector blocks for `.emailActions`, `.email`, `.copyButton`, `.emailArrow`, and `.emailIcon`.

4. Replace the hidden/default and homepage switching blocks with:

```css
.footerContacts {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 0.72fr);
  gap: 0.75rem;
  margin-top: clamp(2.25rem, 5vh, 3rem);
}

.liquidRibbon,
.liquidSheen {
  position: absolute;
  display: block;
  pointer-events: none;
  will-change: transform, opacity;
}

.liquidRibbon {
  z-index: 0;
  width: 120%;
  height: 13rem;
  border-radius: 44% 56% 63% 37% / 57% 42% 58% 43%;
  filter: blur(26px);
}

.ribbonOne {
  top: -4.5rem;
  left: -48%;
  background: #56445f;
  opacity: 0.56;
  animation: footer-river-one 9s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.ribbonTwo {
  right: -52%;
  bottom: -6rem;
  background: #392a45;
  opacity: 0.72;
  animation: footer-river-two 12s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite alternate;
}

.liquidSheen {
  z-index: 0;
  top: 18%;
  right: -32%;
  width: 86%;
  height: 6.25rem;
  border-radius: 50%;
  background: rgba(144, 122, 156, 0.16);
  filter: blur(24px);
  animation: footer-sheen 10s ease-in-out infinite alternate;
}
```

5. In the mobile query, replace the scoped contact rule with:

```css
.footerContacts { grid-template-columns: 1fr; }
.inner { padding-inline: 1.25rem; }
```

6. In reduced motion, replace the scoped selectors with:

```css
.liquidRibbon,
.liquidSheen,
.contactCapsule::before {
  animation: none;
}
```

Replace the reduced-motion transition list with:

```css
.contactCopyButton,
.contactMailAction,
.contactCopyButton::before,
.contactMailAction::before {
  transition: none;
}
```

- [ ] **Step 4: Run the route test and confirm GREEN**

Run:

```bash
PW_PORT=4195 npx playwright test tests/e2e/footer-reveal.spec.ts --project=desktop
```

Expected: all desktop Footer tests PASS for home and localized content routes.

- [ ] **Step 5: Verify no homepage switch or legacy CSS remains**

Run:

```bash
rg -n "body:has\(\[data-homepage\]\)|emailActions|emailArrow|copyButton|emailIcon|homeContacts|homeCopyButton|homeMailAction|revealLayer" components/shell/site-footer.module.css components/shell
```

Expected: exit 1 with no matches.

- [ ] **Step 6: Commit the route-neutral presentation**

```bash
git add components/shell/site-footer.module.css tests/e2e/footer-reveal.spec.ts tests/e2e/homepage.spec.ts
git commit -m "feat: apply liquid Footer across localized routes"
```

### Task 3: Add The Shared Footer To Global Not Found

**Files:**
- Modify: `tests/component/not-found.test.tsx`
- Modify: `app/global-not-found.tsx`
- Modify: `tests/e2e/not-found.spec.ts`

- [ ] **Step 1: Add a failing global document component test**

In `tests/component/not-found.test.tsx`, keep the existing `NotFoundContent` test and add:

```tsx
import { renderToStaticMarkup } from 'react-dom/server';

import GlobalNotFound from '@/app/global-not-found';

it('includes the shared English Footer in the global not-found document', () => {
  const markup = renderToStaticMarkup(<GlobalNotFound />);
  const document = new DOMParser().parseFromString(markup, 'text/html');
  const footer = document.querySelector('[data-site-footer]');

  expect(footer).not.toBeNull();
  expect(footer?.querySelector('[data-footer-contacts]')).not.toBeNull();
  expect(footer?.textContent).toContain('flydesigner_yangj');
});
```

- [ ] **Step 2: Run the component test and confirm RED**

Run:

```bash
npx vitest run tests/component/not-found.test.tsx
```

Expected: FAIL because `GlobalNotFound` does not render `SiteFooter`.

- [ ] **Step 3: Mount the shared Footer in the global document**

In `app/global-not-found.tsx`, import the component:

```tsx
import { SiteFooter } from '@/components/shell/site-footer';
```

Render it after `NotFoundContent`:

```tsx
<body>
  <NotFoundContent />
  <SiteFooter locale="en" />
</body>
```

- [ ] **Step 4: Run the component test and confirm GREEN**

Run:

```bash
npx vitest run tests/component/not-found.test.tsx
```

Expected: all not-found component tests PASS.

- [ ] **Step 5: Add the browser-level 404 Footer contract**

Extend `unknown routes show bilingual recovery navigation` in `tests/e2e/not-found.spec.ts` with:

```ts
const footer = page.locator('[data-site-footer]');
await expect(footer).toHaveCount(1);
await expect(footer.locator('[data-footer-contacts]')).toBeVisible();
await expect(footer.locator('[data-contact-capsule]')).toHaveCount(2);
await expect(footer.getByText('flydesigner_yangj')).toBeVisible();
```

- [ ] **Step 6: Run the not-found E2E contract**

Run:

```bash
PW_PORT=4196 npx playwright test tests/e2e/not-found.spec.ts --project=desktop
```

Expected: all not-found E2E tests PASS.

- [ ] **Step 7: Commit global not-found coverage**

```bash
git add app/global-not-found.tsx tests/component/not-found.test.tsx tests/e2e/not-found.spec.ts
git commit -m "feat: add shared Footer to global not found"
```

### Task 4: Complete Cross-Route Verification

**Files:**
- Verify only; no planned production edits.

- [ ] **Step 1: Run focused component tests**

```bash
npx vitest run tests/component/site-footer.test.tsx tests/component/not-found.test.tsx
```

Expected: both files PASS.

- [ ] **Step 2: Run desktop and mobile Footer browser coverage**

```bash
PW_PORT=4197 npx playwright test tests/e2e/footer-reveal.spec.ts tests/e2e/homepage.spec.ts tests/e2e/not-found.spec.ts --project=desktop --project=mobile
```

Expected: all applicable tests PASS; viewport-specific tests may report their existing intentional skips.

- [ ] **Step 3: Run full repository verification**

```bash
npm test
npm run lint
npm run build:framework
```

Expected: all commands exit 0. Existing lint warnings may remain, but no new warning may reference Footer files.

- [ ] **Step 4: Inspect the full scope**

```bash
rg -n "FooterEmailActions|HomeFooterContacts|footer-email-actions|home-footer-contacts|legacyControl|data-footer-email-actions|data-home-footer-contacts|data-footer-email-control|data-footer-email-icon|data-footer-reveal-layer|body:has\(\[data-homepage\]\)" components app tests
git status --short
git diff --check main...HEAD
```

Expected: `rg` exits 1 with no obsolete matches. Git status is clean. The branch changes only shell Footer files, global not-found, Footer/Homepage/not-found tests, and this plan. Meeting files, assets, detail-page modules, `.playwright-cli`, and `next-env.d.ts` remain absent from the branch diff.

- [ ] **Step 5: Run visual checks**

Capture the Footer at 1440x900 and 390x844 on `/en/`, `/zh/work/call-agent/`, and `/missing-portfolio-page/`. Confirm each route shows one deep-purple liquid surface, two borderless capsules, no legacy email row, no overlap, and no horizontal overflow. Repeat one desktop capture with reduced motion and confirm all three decorative layers are static.

- [ ] **Step 6: Finish the branch**

Use `superpowers:verification-before-completion`, then `superpowers:finishing-a-development-branch`. Present local merge, push/PR, keep, and discard options without choosing an integration action automatically.
