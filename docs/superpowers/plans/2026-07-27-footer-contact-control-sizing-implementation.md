# Footer Contact Control Sizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Footer Copy and email Arrow controls stable 40px circles with square, visually balanced icons and exact vertical centering.

**Architecture:** Preserve the existing `FooterCopyButton` and `FooterContacts` behavior. Lock the Lucide icon sizes in the components, establish stable control and SVG geometry in the Footer CSS module, and extend the existing Playwright Footer contract to verify the rendered dimensions on desktop and mobile.

**Tech Stack:** React 19, TypeScript, CSS Modules, Lucide React, Playwright

---

## File Map

- Modify `tests/e2e/footer-reveal.spec.ts`: add a rendered geometry contract for the shared Footer controls.
- Modify `components/shell/footer-copy-button.tsx`: render Copy and Check at the approved 18px size.
- Modify `components/shell/footer-contacts.tsx`: render ArrowUpRight at the approved 19px size.
- Modify `components/shell/site-footer.module.css`: establish 40px circles, fixed flex sizing, square SVG bounds, and explicit vertical centering.

### Task 1: Lock The Footer Control Geometry With A Failing Browser Test

**Files:**
- Modify: `tests/e2e/footer-reveal.spec.ts:63-88`
- Test: `tests/e2e/footer-reveal.spec.ts`

- [ ] **Step 1: Extend the visual contract**

Replace the existing `visualContract` evaluation with:

```tsx
const visualContract = await footer.evaluate((element) => {
  const capsule = element.querySelector<HTMLElement>(
    '[data-contact-capsule="email"]',
  );
  const ribbons = Array.from(
    element.querySelectorAll<HTMLElement>('[data-footer-liquid^="ribbon-"]'),
  );
  const copyButton = capsule?.querySelector<HTMLElement>(
    '[data-contact-copy="email"]',
  );
  const mailAction = capsule?.querySelector<HTMLElement>(
    '[class*="contactActions"] a[href^="mailto:"]',
  );
  const copyIcon = copyButton?.querySelector<SVGElement>('svg');
  const arrowIcon = mailAction?.querySelector<SVGElement>('svg');
  if (
    !capsule
    || ribbons.length !== 2
    || !copyButton
    || !mailAction
    || !copyIcon
    || !arrowIcon
  ) return null;

  const style = getComputedStyle(capsule);
  const capsuleBox = capsule.getBoundingClientRect();
  const copyBox = copyButton.getBoundingClientRect();
  const mailBox = mailAction.getBoundingClientRect();
  const copyIconBox = copyIcon.getBoundingClientRect();
  const arrowIconBox = arrowIcon.getBoundingClientRect();

  return {
    borderTopWidth: style.borderTopWidth,
    borderRadius: style.borderRadius,
    backgroundColor: style.backgroundColor,
    ribbonAnimations: ribbons.map((ribbon) => getComputedStyle(ribbon).animationName),
    footerCanvasCount: element.querySelectorAll('canvas').length,
    controls: {
      copy: { width: copyBox.width, height: copyBox.height },
      mail: { width: mailBox.width, height: mailBox.height },
      copyIcon: { width: copyIconBox.width, height: copyIconBox.height },
      arrowIcon: { width: arrowIconBox.width, height: arrowIconBox.height },
      copyCenterOffset: copyBox.y + copyBox.height / 2
        - (capsuleBox.y + capsuleBox.height / 2),
      mailCenterOffset: mailBox.y + mailBox.height / 2
        - (capsuleBox.y + capsuleBox.height / 2),
    },
  };
});
```

Add these assertions after the existing Footer visual assertions:

```tsx
expect(visualContract?.controls.copy).toEqual({ width: 40, height: 40 });
expect(visualContract?.controls.mail).toEqual({ width: 40, height: 40 });
expect(visualContract?.controls.copyIcon).toEqual({ width: 18, height: 18 });
expect(visualContract?.controls.arrowIcon).toEqual({ width: 19, height: 19 });
expect(Math.abs(visualContract?.controls.copyCenterOffset ?? Infinity)).toBeLessThanOrEqual(1);
expect(Math.abs(visualContract?.controls.mailCenterOffset ?? Infinity)).toBeLessThanOrEqual(1);
```

- [ ] **Step 2: Run desktop and mobile Footer tests and verify RED**

Run:

```bash
PW_PORT=4174 PW_REUSE_SERVER=1 npx playwright test tests/e2e/footer-reveal.spec.ts --grep "en ends in a normal-flow liquid contact surface" --project=desktop --project=mobile
```

Expected: FAIL because both controls currently render at 34px and both icons at 16px.

### Task 2: Implement Stable 40px Controls

**Files:**
- Modify: `components/shell/footer-copy-button.tsx:63-76`
- Modify: `components/shell/footer-contacts.tsx:66-72`
- Modify: `components/shell/site-footer.module.css:176-225`

- [ ] **Step 1: Set the approved Lucide sizes**

In `footer-copy-button.tsx`, change both `Check` and `Copy`:

```tsx
size={18}
```

In `footer-contacts.tsx`, change the Arrow:

```tsx
<ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.7} />
```

- [ ] **Step 2: Stabilize the action row and control boxes**

Replace the relevant CSS geometry with:

```css
.contactActions {
  display: flex;
  align-self: center;
  align-items: center;
  gap: 0.3125rem;
}

.contactCopyButton,
.contactMailAction {
  position: relative;
  display: inline-flex;
  flex: 0 0 2.5rem;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.075);
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  line-height: 0;
  isolation: isolate;
}

.contactCopyButton svg {
  flex: none;
  width: 1.125rem;
  height: 1.125rem;
}

.contactMailAction svg {
  flex: none;
  width: 1.1875rem;
  height: 1.1875rem;
  transition: transform 220ms var(--ease-out);
}
```

Preserve the existing pseudo-element, hover, focus-visible, and Arrow translation rules.

- [ ] **Step 3: Run the focused Footer test and verify GREEN**

Run:

```bash
PW_PORT=4174 PW_REUSE_SERVER=1 npx playwright test tests/e2e/footer-reveal.spec.ts --grep "en ends in a normal-flow liquid contact surface" --project=desktop --project=mobile
```

Expected: PASS for both viewports with 40px controls, square icons, and center offsets within one pixel.

- [ ] **Step 4: Run component and complete Footer regression suites**

Run:

```bash
npm test -- tests/component/site-footer.test.tsx
PW_PORT=4174 PW_REUSE_SERVER=1 npx playwright test tests/e2e/footer-reveal.spec.ts --project=desktop --project=mobile
```

Expected: all Footer component and browser tests PASS, including Copy-to-Check behavior, localized routes, and reduced motion.

- [ ] **Step 5: Inspect desktop and mobile screenshots**

At `1440 × 1000` and `390 × 844`, scroll the Footer into view and capture the whole Footer plus a close crop of the email capsule. Confirm:

- Copy and Arrow circles have equal diameter and equal vertical centers;
- the Copy and Check icons remain square without stretching;
- the Arrow is visually centered and no longer undersized;
- hover and focus transforms do not clip the icons;
- capsules do not overlap or cause horizontal overflow.

- [ ] **Step 6: Run final static checks and commit only Footer files**

Run:

```bash
npx eslint components/shell/footer-copy-button.tsx components/shell/footer-contacts.tsx tests/e2e/footer-reveal.spec.ts
git diff --check -- components/shell/footer-copy-button.tsx components/shell/footer-contacts.tsx components/shell/site-footer.module.css tests/e2e/footer-reveal.spec.ts
```

Then commit only the scoped files:

```bash
git add components/shell/footer-copy-button.tsx components/shell/footer-contacts.tsx components/shell/site-footer.module.css tests/e2e/footer-reveal.spec.ts
git commit -m "fix: align footer contact controls"
```
