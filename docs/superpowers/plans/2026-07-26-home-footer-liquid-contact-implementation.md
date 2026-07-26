# Homepage Footer Liquid Contact Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage Footer's sticky page-flip reveal with a normal-flow, restrained liquid-purple ending containing independent borderless email and WeChat capsules with Copy-to-Check feedback.

**Architecture:** Keep one shared `SiteFooter` and preserve the current non-home email presentation. Add a homepage contact surface switched by `body:has([data-homepage])`, extract clipboard state into a reusable control, and replace the scroll listener with bounded CSS layers that animate only transforms and opacity.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Lucide React, Vitest/Testing Library, Playwright

---

## File Map

- Create `components/shell/footer-copy-button.tsx`: reusable Clipboard API state, Copy/Check icon swap, timer reset, and live feedback.
- Create `components/shell/home-footer-contacts.tsx`: homepage email and WeChat capsule markup.
- Modify `components/shell/footer-email-actions.tsx`: retain the non-home layout while using the shared copy control.
- Modify `components/shell/site-footer.tsx`: add liquid layers and the homepage contact surface; remove reveal motion.
- Modify `components/shell/site-footer.module.css`: scope homepage flow, liquid, capsules, responsive layout, and reduced motion.
- Delete `components/shell/footer-reveal-motion.tsx`: remove obsolete scroll behavior.
- Modify `tests/component/site-footer.test.tsx`: cover structure, copy isolation, reset timing, repeated click, and failures.
- Delete `tests/component/footer-reveal-motion.test.tsx`: remove tests for deleted behavior.
- Modify `tests/e2e/footer-reveal.spec.ts`: replace reveal assertions with flow, route isolation, visual material, and motion contracts.
- Modify `tests/e2e/homepage.spec.ts`: count only the visible homepage mail actions.

### Task 1: Define the contact behavior contract

**Files:**
- Modify: `tests/component/site-footer.test.tsx`

- [ ] **Step 1: Add homepage structure assertions**

Inside the locale structure test, keep all existing non-home assertions and add:

```tsx
const homeContacts = container.querySelector('[data-home-footer-contacts]');
expect(homeContacts).toBeInTheDocument();
expect(within(homeContacts as HTMLElement).getByText('flydesigner_yangj')).toBeInTheDocument();
expect(
  within(homeContacts as HTMLElement).getByRole('link', {
    name: 'amanda.yangj@gmail.com',
  }),
).toHaveAttribute('href', 'mailto:amanda.yangj@gmail.com');
expect(container.querySelector('[data-footer-reveal-motion]')).not.toBeInTheDocument();
```

- [ ] **Step 2: Add independent email and WeChat Copy-to-Check coverage**

```tsx
it('copies homepage contacts independently and resets both icons', async () => {
  vi.useFakeTimers();
  const writeText = vi.fn().mockResolvedValue(undefined);
  installClipboard(writeText);
  const { container } = render(<SiteFooter locale="en" />);
  const email = container.querySelector<HTMLButtonElement>('[data-home-footer-contacts] [data-contact-copy="email"]');
  const wechat = container.querySelector<HTMLButtonElement>('[data-home-footer-contacts] [data-contact-copy="wechat"]');
  if (!email || !wechat) throw new Error('Missing homepage copy controls');

  fireEvent.click(email);
  await act(async () => Promise.resolve());
  expect(writeText).toHaveBeenLastCalledWith('amanda.yangj@gmail.com');
  expect(email).toHaveAttribute('data-copy-state', 'copied');
  expect(email.querySelector('[data-copy-icon="check"]')).toBeInTheDocument();
  expect(wechat).toHaveAttribute('data-copy-state', 'idle');

  fireEvent.click(wechat);
  await act(async () => Promise.resolve());
  expect(writeText).toHaveBeenLastCalledWith('flydesigner_yangj');
  expect(wechat.querySelector('[data-copy-icon="check"]')).toBeInTheDocument();

  act(() => vi.advanceTimersByTime(1800));
  expect(email.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
  expect(wechat.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
});
```

- [ ] **Step 3: Add repeated-click and localized failure coverage**

```tsx
it('restarts a contact reset timer after a repeated click', async () => {
  vi.useFakeTimers();
  installClipboard(vi.fn().mockResolvedValue(undefined));
  const { container } = render(<SiteFooter locale="en" />);
  const button = container.querySelector<HTMLButtonElement>('[data-contact-copy="wechat"]');
  if (!button) throw new Error('Missing WeChat copy control');
  fireEvent.click(button);
  await act(async () => Promise.resolve());
  act(() => vi.advanceTimersByTime(1200));
  fireEvent.click(button);
  await act(async () => Promise.resolve());
  act(() => vi.advanceTimersByTime(700));
  expect(button).toHaveAttribute('data-copy-state', 'copied');
  act(() => vi.advanceTimersByTime(1100));
  expect(button).toHaveAttribute('data-copy-state', 'idle');
});

it('keeps Copy visible and announces a localized WeChat failure', async () => {
  installClipboard(vi.fn().mockRejectedValue(new Error('denied')));
  const { container } = render(<SiteFooter locale="zh" />);
  const button = container.querySelector<HTMLButtonElement>('[data-contact-copy="wechat"]');
  if (!button) throw new Error('Missing WeChat copy control');
  fireEvent.click(button);
  await act(async () => Promise.resolve());
  expect(button).toHaveAttribute('data-copy-state', 'failed');
  expect(button.querySelector('[data-copy-icon="copy"]')).toBeInTheDocument();
  expect(button.parentElement).toHaveTextContent('微信复制失败，请手动复制');
});
```

- [ ] **Step 4: Run the test and confirm RED**

```bash
npx vitest run tests/component/site-footer.test.tsx
```

Expected: FAIL because homepage contacts and generic contact copy controls do not exist.

- [ ] **Step 5: Commit the failing contract**

```bash
git add tests/component/site-footer.test.tsx
git commit -m "test: define homepage Footer contact behavior"
```

### Task 2: Extract clipboard state and render the homepage contacts

**Files:**
- Create: `components/shell/footer-copy-button.tsx`
- Create: `components/shell/home-footer-contacts.tsx`
- Modify: `components/shell/footer-email-actions.tsx`
- Modify: `components/shell/site-footer.tsx`

- [ ] **Step 1: Create the reusable copy control**

```tsx
'use client';

import { Check, Copy } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface FooterCopyButtonProps {
  readonly value: string;
  readonly channel: 'email' | 'wechat';
  readonly labels: { readonly copy: string; readonly copied: string; readonly failed: string };
  readonly buttonClassName: string;
  readonly feedbackClassName: string;
  readonly legacyControl?: boolean;
}

const RESET_DELAY = 1800;
type CopyState = 'idle' | 'copied' | 'failed';

export function FooterCopyButton({ value, channel, labels, buttonClassName, feedbackClassName, legacyControl = false }: FooterCopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const feedback = state === 'idle' ? '' : labels[state];
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copyValue() {
    if (timer.current) clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    timer.current = setTimeout(() => setState('idle'), RESET_DELAY);
  }

  return (
    <>
      <button className={buttonClassName} type="button" onClick={copyValue} aria-label={feedback || labels.copy} data-contact-copy={channel} data-copy-state={state} data-footer-email-control={legacyControl ? 'copy' : undefined}>
        {state === 'copied'
          ? <Check aria-hidden="true" size={16} strokeWidth={1.7} data-copy-icon="check" data-footer-email-icon={legacyControl ? 'check' : undefined} />
          : <Copy aria-hidden="true" size={16} strokeWidth={1.7} data-copy-icon="copy" data-footer-email-icon={legacyControl ? 'copy' : undefined} />}
      </button>
      <span className={feedbackClassName} role="status" aria-live="polite">{feedback}</span>
    </>
  );
}
```

- [ ] **Step 2: Refactor the legacy email row**

Remove its local state, effect, timer, `Copy`, and `Check`. Keep `EMAIL`, its two `mailto:` links, and `ArrowUpRight`, then render:

```tsx
<FooterCopyButton
  value={EMAIL}
  channel="email"
  labels={{ copy: text.copy, copied: text.copied, failed: text.failed }}
  buttonClassName={styles.copyButton}
  feedbackClassName={styles.emailFeedback}
  legacyControl
/>
```

The `legacyControl` prop in Step 1 preserves `data-footer-email-icon="copy|check"` for existing non-home tests without duplicating the state machine.

- [ ] **Step 3: Create `HomeFooterContacts`**

Use constants `EMAIL = 'amanda.yangj@gmail.com'` and `WECHAT = 'flydesigner_yangj'`. Render this exact structure with localized label objects for English and Chinese:

```tsx
<div className={styles.homeContacts} data-home-footer-contacts>
  <div className={styles.contactCapsule} data-contact-capsule="email">
    <a className={styles.contactValue} href={`mailto:${EMAIL}`}>
      <small>{text.email}</small><strong>{EMAIL}</strong>
    </a>
    <div className={styles.contactActions}>
      <FooterCopyButton value={EMAIL} channel="email" labels={text.emailCopy} buttonClassName={styles.homeCopyButton} feedbackClassName={styles.emailFeedback} />
      <a className={styles.homeMailAction} href={`mailto:${EMAIL}`} aria-label={text.send}>
        <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.7} />
      </a>
    </div>
  </div>
  <div className={styles.contactCapsule} data-contact-capsule="wechat">
    <div className={styles.contactValue}><small>{text.wechat}</small><strong>{WECHAT}</strong></div>
    <div className={styles.contactActions}>
      <FooterCopyButton value={WECHAT} channel="wechat" labels={text.wechatCopy} buttonClassName={styles.homeCopyButton} feedbackClassName={styles.emailFeedback} />
    </div>
  </div>
</div>
```

The Chinese copy labels are `复制邮箱/邮箱已复制/邮箱复制失败，请手动复制` and `复制微信/微信已复制/微信复制失败，请手动复制`. The English equivalents are `Copy email address/Email copied/Email copy failed. Please copy it manually.` and `Copy WeChat ID/WeChat ID copied/WeChat copy failed. Please copy it manually.`

- [ ] **Step 4: Update `SiteFooter` structure**

Remove `FooterRevealMotion`. Inside `.revealLayer`, insert the three decorative elements before `.inner`; render `HomeFooterContacts` immediately after `FooterEmailActions`:

```tsx
<div className={styles.revealLayer} data-footer-surface>
  <div className={`${styles.liquidRibbon} ${styles.ribbonOne}`} aria-hidden="true" />
  <div className={`${styles.liquidRibbon} ${styles.ribbonTwo}`} aria-hidden="true" />
  <div className={styles.liquidSheen} aria-hidden="true" />
  <div className={styles.inner}>
    <div className={styles.cta} data-footer-cta>
      <p>{copy.eyebrow}</p><h2>{copy.title}</h2>
      <FooterEmailActions locale={locale} />
      <HomeFooterContacts locale={locale} />
    </div>
    <div className={styles.meta} data-footer-meta><p>© 2026 Yang Jing</p></div>
  </div>
</div>
```

- [ ] **Step 5: Run the component test and confirm GREEN**

```bash
npx vitest run tests/component/site-footer.test.tsx
```

Expected: PASS for exact values, independent states, 1.8-second reset, repeated-click restart, and failures.

- [ ] **Step 6: Commit the behavior**

```bash
git add components/shell/footer-copy-button.tsx components/shell/home-footer-contacts.tsx components/shell/footer-email-actions.tsx components/shell/site-footer.tsx tests/component/site-footer.test.tsx
git commit -m "feat: add homepage Footer contact capsules"
```

### Task 3: Replace sticky reveal with the liquid normal-flow visual system

**Files:**
- Modify: `components/shell/site-footer.module.css`
- Delete: `components/shell/footer-reveal-motion.tsx`
- Delete: `tests/component/footer-reveal-motion.test.tsx`

- [ ] **Step 1: Delete reveal files and homepage page-flip rules**

Delete the two reveal files. Remove `--footer-reveal-*`, sticky/bottom/negative-margin rules, homepage bottom radii/shadow, and reveal transforms. Preserve the non-home `.root`, `.revealLayer`, `.emailActions`, and `.email` visual rules.

- [ ] **Step 2: Add homepage normal-flow and surface switching**

```css
.homeContacts,
.liquidRibbon,
.liquidSheen { display: none; }

:global(body:has([data-homepage])) .root {
  position: relative;
  min-height: 42rem;
  padding: 0;
  margin: 0;
  background: #19161b;
}
:global(body:has([data-homepage])) .revealLayer { overflow: hidden; background: #19161b; }
:global(body:has([data-homepage])) .emailActions { display: none; }
:global(body:has([data-homepage])) .homeContacts {
  display: grid;
  grid-template-columns: minmax(0, 1.28fr) minmax(0, 0.72fr);
  gap: 0.75rem;
  margin-top: clamp(2.25rem, 5vh, 3rem);
}
```

- [ ] **Step 3: Add bounded transform-only liquid layers**

```css
:global(body:has([data-homepage])) .liquidRibbon,
:global(body:has([data-homepage])) .liquidSheen { position: absolute; display: block; pointer-events: none; will-change: transform, opacity; }
:global(body:has([data-homepage])) .liquidRibbon { z-index: 0; width: 120%; height: 13rem; border-radius: 44% 56% 63% 37% / 57% 42% 58% 43%; filter: blur(26px); }
:global(body:has([data-homepage])) .ribbonOne { top: -4.5rem; left: -48%; background: #56445f; opacity: 0.56; animation: footer-river-one 9s cubic-bezier(.45,.05,.55,.95) infinite alternate; }
:global(body:has([data-homepage])) .ribbonTwo { right: -52%; bottom: -6rem; background: #392a45; opacity: 0.72; animation: footer-river-two 12s cubic-bezier(.45,.05,.55,.95) infinite alternate; }
:global(body:has([data-homepage])) .liquidSheen { z-index: 0; top: 18%; right: -32%; width: 86%; height: 6.25rem; border-radius: 50%; background: rgba(144,122,156,.16); filter: blur(24px); animation: footer-sheen 10s ease-in-out infinite alternate; }
@keyframes footer-river-one { from { transform: translate3d(0,0,0) rotate(-7deg) scale(1,.86); } to { transform: translate3d(46%,.75rem,0) rotate(8deg) scale(.95,1.12); } }
@keyframes footer-river-two { from { transform: translate3d(0,0,0) rotate(5deg) scale(1.05,.86); } to { transform: translate3d(-44%,-.5rem,0) rotate(-8deg) scale(1.08,.94); } }
@keyframes footer-sheen { from { transform: translate3d(0,0,0) rotate(-8deg) scaleX(.82); opacity: .1; } to { transform: translate3d(-52%,2.875rem,0) rotate(5deg) scaleX(1.08); opacity: .22; } }
```

Set `.inner { position: relative; z-index: 1; }` so decoration never covers content.

- [ ] **Step 4: Add borderless capsule material and action states**

```css
.contactCapsule { position: relative; display: grid; min-width: 0; grid-template-columns: minmax(0,1fr) auto; align-items: center; gap: .75rem; padding: .625rem .625rem .625rem 1.125rem; overflow: hidden; border: 0; border-radius: 999px; background: rgba(34,27,38,.58); box-shadow: inset 0 1px 0 rgba(255,255,255,.11), inset 0 -16px 28px rgba(14,9,17,.18), 0 18px 38px rgba(8,5,10,.18); backdrop-filter: blur(26px) saturate(112%); isolation: isolate; }
.contactCapsule::before { position: absolute; z-index: -1; top: -95%; left: -28%; width: 72%; height: 260%; border-radius: 44% 56% 62% 38%; background: rgba(110,87,124,.2); content: ''; filter: blur(12px); animation: capsule-flow 8s ease-in-out infinite alternate; }
.contactValue small, .contactValue strong { display: block; }
.contactValue { min-width: 0; color: inherit; text-decoration: none; }
.contactValue small { color: rgba(241,239,242,.48); font: .625rem/1.2 var(--font-mono); text-transform: uppercase; }
.contactValue strong { margin-top: .25rem; overflow: hidden; color: rgba(255,255,255,.93); font-size: .875rem; font-weight: 520; text-overflow: ellipsis; white-space: nowrap; }
.contactActions { display: flex; gap: .3125rem; }
.homeCopyButton, .homeMailAction { position: relative; display: grid; width: 2.125rem; height: 2.125rem; place-items: center; overflow: hidden; border: 0; border-radius: 50%; background: rgba(255,255,255,.075); color: rgba(255,255,255,.9); }
.homeCopyButton::before, .homeMailAction::before { position: absolute; z-index: -1; inset: 42% -35% -70%; border-radius: 48% 52% 38% 62%; background: #725c7e; content: ''; transform: translateY(100%) rotate(-12deg); transition: transform 480ms cubic-bezier(.16,1,.3,1); }
.homeCopyButton:hover::before, .homeCopyButton:focus-visible::before, .homeMailAction:hover::before, .homeMailAction:focus-visible::before { transform: translateY(-45%) rotate(8deg); }
.homeCopyButton:focus-visible, .homeMailAction:focus-visible { outline: 2px solid rgba(255,255,255,.72); outline-offset: 2px; }
.homeMailAction svg { transition: transform 220ms var(--ease-out); }
.homeMailAction:hover svg, .homeMailAction:focus-visible svg { transform: translate(.125rem, -.125rem); }
```

The selectors above keep the liquid hover local, preserve keyboard focus, and keep the 34px target dimensions unchanged between Copy and Check.

- [ ] **Step 5: Add mobile and reduced-motion rules**

```css
@media (max-width: 760px) {
  :global(body:has([data-homepage])) .homeContacts { grid-template-columns: 1fr; }
  :global(body:has([data-homepage])) .inner { padding-inline: 1.25rem; }
  .contactValue strong { overflow-wrap: anywhere; }
}
@media (prefers-reduced-motion: reduce) {
  .liquidRibbon, .liquidSheen, .contactCapsule::before { animation: none; }
  .homeCopyButton, .homeMailAction, .homeCopyButton::before, .homeMailAction::before { transition: none; }
}
```

- [ ] **Step 6: Run component checks and confirm obsolete references are gone**

```bash
npx vitest run tests/component/site-footer.test.tsx
npx eslint components/shell/site-footer.tsx components/shell/footer-copy-button.tsx components/shell/home-footer-contacts.tsx components/shell/footer-email-actions.tsx
rg -n "FooterRevealMotion|footer-reveal-progress|footer-reveal-offset" components tests
```

Expected: tests/lint PASS; `rg` exits 1 with no matches.

- [ ] **Step 7: Commit the presentation**

```bash
git add components/shell/site-footer.module.css components/shell/footer-reveal-motion.tsx tests/component/footer-reveal-motion.test.tsx
git commit -m "feat: replace homepage Footer reveal with liquid flow"
```

### Task 4: Replace the browser contract and complete verification

**Files:**
- Modify: `tests/e2e/footer-reveal.spec.ts`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Rewrite the Footer E2E contract for normal flow**

For both locales and desktop/mobile projects, assert:

```ts
const footer = page.locator('[data-site-footer]');
const contacts = footer.locator('[data-home-footer-contacts]');
await expect(footer).toHaveCSS('position', 'relative');
await expect(footer).toHaveCSS('bottom', 'auto');
await expect(page.locator('[data-homepage]')).toHaveCSS('border-bottom-left-radius', '0px');
await expect(contacts).toBeVisible();
await expect(footer.locator('[data-footer-email-actions]')).toBeHidden();
await expect(contacts.locator('[data-contact-capsule]')).toHaveCount(2);
await expect(contacts.getByText('flydesigner_yangj')).toBeVisible();
```

After scrolling to the bottom, compare `footer.getBoundingClientRect().top` with `homepage.getBoundingClientRect().bottom`; the absolute gap must be at most one pixel. Assert document scroll width exceeds client width by at most one pixel.

- [ ] **Step 2: Add browser copy and material assertions**

Stub `navigator.clipboard.writeText`, click `[data-contact-copy="wechat"]`, expect `copied` plus `[data-copy-icon="check"]`, then expect `idle` plus Copy within 2500ms. Evaluate the email capsule and assert `borderTopWidth === '0px'`, `borderRadius === '999px'`, `backgroundColor === 'rgba(34, 27, 38, 0.58)'`, two ribbon animation names are not `none`, and Footer canvas count is zero.

- [ ] **Step 3: Add reduced-motion and route-isolation assertions**

With `page.emulateMedia({ reducedMotion: 'reduce' })`, expect ribbon and sheen `animation-name: none`. On `/en/about/`, expect homepage contacts hidden, legacy email actions visible, WeChat hidden, and Footer position relative.

- [ ] **Step 4: Update homepage visible mail-link counting**

In `homepage.spec.ts`, scope the two `mailto:` link expectation to `[data-home-footer-contacts]` and assert `[data-footer-email-actions]` is hidden on the homepage.

- [ ] **Step 5: Run targeted and full verification**

```bash
PW_PORT=4175 npx playwright test tests/e2e/footer-reveal.spec.ts tests/e2e/homepage.spec.ts --project=desktop --project=mobile
npm test
npm run lint
npm run build:framework
```

Expected: all commands exit 0. Existing Meeting changes must not be staged, reformatted, or reverted while resolving unrelated failures.

- [ ] **Step 6: Inspect screenshots and motion**

Capture `/zh/` and `/en/` at 1440x900 and 390x844 after scrolling to the Footer. Confirm the `#19161b` base dominates, ribbons visibly move over 3-5 seconds, the sheen stays subordinate, capsules remain distinct without outlines, controls do not shift during Copy/Check, and mobile has no overlap or overflow. Repeat with reduced motion and confirm a complete static composition.

- [ ] **Step 7: Check scope and performance**

Record a repeatable bottom scroll in Chromium and confirm no frame exceeds 32ms in the verification environment. Confirm there is no Footer canvas, JavaScript scroll listener, or animated layout/background property. Review `git status --short` and ensure Meeting, ConvoAI, detail pages, generated assets, `.playwright-cli`, and `next-env.d.ts` are not staged.

- [ ] **Step 8: Commit the browser contract**

```bash
git add tests/e2e/footer-reveal.spec.ts tests/e2e/homepage.spec.ts
git commit -m "test: verify homepage liquid Footer"
```
