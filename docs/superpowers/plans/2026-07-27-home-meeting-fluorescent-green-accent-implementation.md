# Home Meeting Fluorescent-Green Accent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Agora Meeting homepage module's coral-red accents with the homepage hero fluorescent green while preserving all unrelated colors, media, motion, and layout.

**Architecture:** Define one Meeting-local `--meeting-accent` CSS custom property on the section root, consume it in the divider and state labels, and pass the same variable reference to the existing GSAP state-label tween. Add a source-contract unit test to prevent the local accent from drifting or expanding into excluded browser controls and media surfaces.

**Tech Stack:** Next.js 16, React 19, CSS Modules, GSAP 3, Vitest 4, Playwright 1.61

---

## File Structure

- Create `tests/unit/home-meeting-accent.test.ts`: verifies the approved local color contract across CSS and the GSAP source.
- Modify `components/home/home.module.css`: defines the local Meeting accent and applies it to the divider and state labels.
- Modify `components/home/meeting-home-media.tsx`: makes the existing scroll tween resolve to the local Meeting accent.

### Task 1: Lock The Meeting Accent Contract

**Files:**
- Create: `tests/unit/home-meeting-accent.test.ts`

- [ ] **Step 1: Write the failing source-contract test**

```ts
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const homeCss = readFileSync(
  path.resolve(process.cwd(), 'components/home/home.module.css'),
  'utf8',
);
const meetingMediaSource = readFileSync(
  path.resolve(process.cwd(), 'components/home/meeting-home-media.tsx'),
  'utf8',
);

describe('Meeting homepage accent', () => {
  it('uses the homepage fluorescent green for the local divider, states, and motion', () => {
    expect(homeCss).toMatch(/\.meetingBand\s*{[^}]*--meeting-accent:\s*#c7ff38;/s);
    expect(homeCss).toMatch(/\.meetingBand\s*{[^}]*border-top:\s*6px solid var\(--meeting-accent\);/s);
    expect(homeCss).toMatch(/\.meetingStates li\s*{[^}]*color:\s*var\(--meeting-accent\);/s);
    expect(meetingMediaSource).toContain("color: 'var(--meeting-accent)'");
    expect(meetingMediaSource).not.toContain("color: '#ff654d'");
  });

  it('preserves the excluded browser controls and media background', () => {
    expect(homeCss).toMatch(/\.meetingBrowserLights i:first-child\s*{\s*background:\s*#ff7269;/s);
    expect(homeCss).toMatch(/\.meetingBrowserLights i:nth-child\(2\)\s*{\s*background:\s*#f2bf49;/s);
    expect(homeCss).toMatch(/\.meetingBrowserLights i:last-child\s*{\s*background:\s*#63c56f;/s);
    expect(homeCss).toMatch(/\.meetingMediaColumn\s*{[^}]*background:\s*#17102d;/s);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails for the missing local accent**

Run:

```bash
npm test -- tests/unit/home-meeting-accent.test.ts
```

Expected: FAIL because `.meetingBand` does not yet define `--meeting-accent`, the divider and state labels still use the coral token, and the GSAP tween still uses `#ff654d`.

- [ ] **Step 3: Commit the failing test**

```bash
git add tests/unit/home-meeting-accent.test.ts
git commit -m "test: lock Meeting homepage accent contract"
```

### Task 2: Apply The Local Fluorescent-Green Accent

**Files:**
- Modify: `components/home/home.module.css:1412-1416`
- Modify: `components/home/home.module.css:1587-1596`
- Modify: `components/home/meeting-home-media.tsx:94-100`

- [ ] **Step 1: Define and consume the Meeting-local CSS custom property**

Change the Meeting section root to:

```css
.meetingBand {
  --meeting-accent: #c7ff38;
  overflow: clip;
  border-top: 6px solid var(--meeting-accent);
  background: #0d0e10;
  color: var(--projects-ink);
}
```

Change only the state-label color declaration to:

```css
.meetingStates li {
  display: grid;
  min-width: 0;
  gap: 0.45rem;
  padding: 1rem 0.5rem 1.1rem 0;
  border-top: 1px solid rgba(242, 244, 240, 0.22);
  color: var(--meeting-accent);
  font-size: 0.7rem;
  line-height: 1.3;
}
```

- [ ] **Step 2: Point the existing GSAP tween to the same local accent**

Keep the existing tween timing and opacity unchanged, replacing only its color value:

```ts
.to(
  states,
  { color: 'var(--meeting-accent)', opacity: 1, stagger: 0.08, duration: 0.16 },
  0.55,
);
```

- [ ] **Step 3: Run the focused unit test**

Run:

```bash
npm test -- tests/unit/home-meeting-accent.test.ts
```

Expected: PASS with 2 passing tests.

- [ ] **Step 4: Run the existing homepage component coverage**

Run:

```bash
npm test -- tests/component/homepage.test.tsx
```

Expected: PASS with the existing Meeting structure, poster, video-loading, and motion-contract tests unchanged.

- [ ] **Step 5: Run static validation**

Run:

```bash
npx eslint components/home/meeting-home-media.tsx tests/unit/home-meeting-accent.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all commands exit with status 0 and produce no lint, type, or whitespace errors.

- [ ] **Step 6: Commit the implementation**

```bash
git add components/home/home.module.css components/home/meeting-home-media.tsx
git commit -m "style: align Meeting homepage accent with hero"
```

### Task 3: Verify The Homepage Visually

**Files:**
- Verify only; no planned source changes.

- [ ] **Step 1: Start the local development server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 50211
```

Expected: Next.js reports the homepage available at `http://127.0.0.1:50211`.

- [ ] **Step 2: Inspect the English homepage at desktop width**

Open `http://127.0.0.1:50211/en/` at 1440x1000, scroll to `[data-project-id="meeting"]`, and verify:

- The section divider is fluorescent green.
- The three state labels resolve to fluorescent green as the scrub animation progresses.
- The browser traffic lights remain red, yellow, and green.
- The media-column background remains purple.
- No spacing, wrapping, clipping, or media positioning changed.

- [ ] **Step 3: Inspect the Chinese homepage at mobile width**

Open `http://127.0.0.1:50211/zh/` at 390x844, scroll to `[data-project-id="meeting"]`, and verify the same color contract with no horizontal overflow or overlap.

- [ ] **Step 4: Run the focused Meeting homepage E2E test**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --grep "Meeting home entry layers shipped Web and mobile media without overflow"
```

Expected: PASS, confirming the existing media layers and scroll sequence still work.

- [ ] **Step 5: Confirm the final diff is scoped**

Run:

```bash
git status --short
git diff HEAD~2 -- components/home/home.module.css components/home/meeting-home-media.tsx tests/unit/home-meeting-accent.test.ts
```

Expected: only the approved Meeting accent contract and its test appear; `output/` remains untracked and is not staged.
