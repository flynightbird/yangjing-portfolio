# Hero Designer Art Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three person-free Designer background comparisons around the preserved central split portrait, with heavy equal-weight role typography and the approved divider and Builder sweep behavior.

**Architecture:** Keep the experiment in the existing standalone HTML motion study. Add three declarative art compositions selected by the `designer=c1|c2|c3` query parameter, share one typography and activation system, and verify behavior with a static Node contract test plus real-browser checks.

**Tech Stack:** HTML, CSS, vanilla JavaScript, Canvas 2D, Node.js test runner, agent-browser.

---

### Task 1: Add the comparison contract test

**Files:**
- Create: `/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/tests/hero-art-comparison.test.mjs`
- Test: `/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/motion-directions-v1.html`

- [ ] **Step 1: Write the failing test**

Use `node:test` to assert that the HTML supports `c1`, `c2`, and `c3`, contains the three named art roots, preserves exactly two aligned central portrait treatments while keeping the art roots image-free, applies role weight 900 with zero letter spacing, keeps the Builder canvas, and exposes a scan-run counter for browser verification.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test .superpowers/live-preview/tests/hero-art-comparison.test.mjs`

Expected: FAIL because the current page only supports `designer=a|b|c`, uses person imagery inside the old art variants, and uses role weight 500.

### Task 2: Implement the three comparison variants

**Files:**
- Modify: `/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/motion-directions-v1.html`
- Test: `/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/tests/hero-art-comparison.test.mjs`

- [ ] **Step 1: Replace the superseded person-based art**

Create `.interface-gallery`, `.typographic-system`, and `.material-blueprint` art roots. Populate them with semantic decorative elements only, mark the shared art container `aria-hidden="true"`, and render no image elements inside those roots. Keep the two aligned central portrait images outside the art container.

- [ ] **Step 2: Add isolated visual and motion rules**

Use `body.designer-c1`, `body.designer-c2`, and `body.designer-c3` selectors. Keep all high-contrast forms outside the title protection rectangle, animate only `transform`, `opacity`, and SVG stroke reveal, and collapse each mobile composition to three dominant forms.

- [ ] **Step 3: Upgrade shared typography**

Load Satoshi 900 from Fontshare with `Arial Black` and `Helvetica Neue` fallbacks. Set both `.role` titles to weight 900 and letter spacing 0, preserving exactly two explicit lines.

- [ ] **Step 4: Preserve and instrument interaction behavior**

Retain pointer, keyboard, touch, magnetic, reduced-motion, and Builder sweep logic. Increment `window.__heroMotion.scanRuns` only when `begin()` starts a scan so browser checks can verify one run per drag release.

- [ ] **Step 5: Run the contract test**

Run: `node --test .superpowers/live-preview/tests/hero-art-comparison.test.mjs`

Expected: PASS with all contract assertions green.

### Task 3: Verify real-browser output

**Files:**
- Verify: `/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/motion-directions-v1.html`

- [ ] **Step 1: Open all three desktop routes**

Open each `http://localhost:61777/motion-directions-v1.html?variant=b&designer=cN` route at 1440 by 900 and capture a screenshot.

- [ ] **Step 2: Inspect computed contracts**

For each route, assert title weight `900`, letter spacing `0px`, two title lines, zero `img` elements, no horizontal overflow, and a recognized variant name.

- [ ] **Step 3: Exercise the divider**

Drag the divider once, verify `aria-valuenow` changes, and confirm `window.__heroMotion.scanRuns` increments by exactly one after release. Press ArrowLeft and verify the value changes again.

- [ ] **Step 4: Verify mobile layouts**

Capture each route at 390 by 844 and inspect for clipping, title overlap, and horizontal overflow.

- [ ] **Step 5: Re-run final verification**

Run the Node contract test again and collect browser console errors. Expected: zero test failures and zero console errors.
