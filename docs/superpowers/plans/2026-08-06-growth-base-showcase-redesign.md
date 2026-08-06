# Growth Base Decision Chapters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the approved Growth Base overview with four desktop-only, bilingual design-decision chapters while preserving the current mobile prototype.

**Architecture:** Keep the existing comparison component unchanged. Add focused components for task focus, reward loop, emotional language, and grouped scene films; centralize localized content and asset metadata in `content/growth-base.ts`. Use CSS Modules for the editorial bands and reduced-motion behavior, and React state only for the tent claim/replay demonstration.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Lucide React, Vitest, Testing Library, Playwright.

---

## File Map

- Modify `content/growth-base.ts`: bilingual chapter copy, task data, language examples, and four scene-film records.
- Modify `components/growth-base/growth-base-case.tsx`: approved 01-05 chapter order and transition copy.
- Create `components/growth-base/growth-base-task-focus.tsx`: clipped seven-task editorial diagram.
- Create `components/growth-base/growth-base-reward-loop.tsx`: Hi Five, point sequence, manual tent claim, and replay.
- Create `components/growth-base/growth-base-language.tsx`: time-based dynamic quote field.
- Modify `components/growth-base/growth-base-video-grid.tsx`: two editorial shells with independently controlled videos.
- Modify `components/growth-base/growth-base.module.css`: five-band visual system, motion, and desktop-only rules.
- Add `public/images/growth-base/growth-vitality.png`, `growth-focus.png`, `growth-stamina.png`, and `reward-bed.png` from supplied prototype assets.
- Modify component, unit, asset, and end-to-end tests for behavior and responsive contracts.

### Task 1: Lock The New Narrative In Tests

- [ ] Add a component test asserting section order `showcase`, `task-focus`, `reward-loop`, `emotional-language`, `scene-films`.
- [ ] Assert all approved Chinese and English titles, four language quotes, seven tasks, and four scene films.
- [ ] Run `npx vitest run tests/component/growth-base-case.test.tsx` and confirm it fails because 02-05 are absent.

### Task 2: Add Assets And Content

- [ ] Extend the asset test with the three supplied stat images and tent image.
- [ ] Run `npx vitest run tests/unit/growth-base-assets.test.ts` and confirm it fails because portfolio copies are absent.
- [ ] Copy the four supplied prototype PNGs into `public/images/growth-base/`.
- [ ] Add bilingual task, reward, language, transition, and scene-film content.
- [ ] Re-run the focused tests and confirm the content and asset assertions pass.

### Task 3: Build Task Focus And Chapter Structure

- [ ] Add structural tests for seven task records, five visible positions, two overflow positions, and centered meditation emphasis.
- [ ] Run the component test and confirm RED.
- [ ] Implement `GrowthBaseTaskFocus` and the 01-05 section shell.
- [ ] Add CSS for the warm-white band and clipped phone-width diagram.
- [ ] Run focused tests and confirm GREEN.

### Task 4: Build Reward Loop Interaction

- [ ] Add tests proving point order, `+10` feedback, a manual `领取` action, claimed state, and Lucide replay reset.
- [ ] Run the component test and confirm RED.
- [ ] Implement `GrowthBaseRewardLoop` with a Hi Five video, sequential CSS delays, and React state for claim/replay.
- [ ] Add pale-green reward composition, translucent pedestals, confetti, and reduced-motion fallbacks.
- [ ] Run focused tests and confirm GREEN.

### Task 5: Build Emotional Language And Scene Shells

- [ ] Add tests for four quotes in one typographic field and two film shells containing two independent videos each.
- [ ] Run the component test and confirm RED.
- [ ] Implement the language field and refactor the film grid to four videos, excluding Hi Five.
- [ ] Add the deep ink-green language band and warm-white editorial film shells.
- [ ] Run focused tests and confirm GREEN.

### Task 6: Protect Mobile And Verify

- [ ] Add CSS-contract assertions that 02-05 and desktop header are hidden at `max-width: 767px`, while the prototype remains full viewport and unscaled.
- [ ] Add Playwright coverage for section order, manual claim/replay, two film shells, and the mobile-only prototype.
- [ ] Run focused tests, then `npm test`, `npm run lint`, and `npm run build`.
- [ ] Start the local server and capture desktop and mobile screenshots. Verify no overlap, compression, horizontal overflow, unreadable type, or console errors.
- [ ] Commit the verified implementation.
