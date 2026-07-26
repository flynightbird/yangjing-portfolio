# Call Agent Video Story Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore full Preview playback and add an end-driven three-clip Hero sequence while correcting browser radii and paired-video spacing on the Call Agent detail page.

**Architecture:** Extend the shared browser-video component with optional end and loop controls, then compose three existing clips in a dedicated Hero sequence. Represent full-source conversion explicitly in the video manifest and teach the preparation script to omit trim flags for that contract.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Playwright, AVFoundation `avconvert`.

---

### Task 1: Lock The Full-Source Media Contract

**Files:**
- Modify: `tests/unit/call-agent-video-assets.test.ts`
- Modify: `evidence/call-agent/video-manifest.json`
- Modify: `scripts/prepare-call-agent-videos.mjs`

- [ ] Add a failing assertion that Preview has `fullSource: true` and omits `start` and `duration`.
- [ ] Run `npx vitest run tests/unit/call-agent-video-assets.test.ts` and confirm the new assertion fails against the trimmed manifest.
- [ ] Update manifest validation so a clip uses either `{ fullSource: true }` or a validated `{ start, duration }` trim, never both.
- [ ] Build `avconvert` arguments conditionally, omitting `--start` and `--duration` for full-source clips.
- [ ] Update Preview to use the full source and rerun the unit test to green.

### Task 2: Add End-Driven Hero Playback

**Files:**
- Create: `components/call-agent/call-agent-hero-sequence.tsx`
- Create: `components/call-agent/call-agent-hero-sequence.module.css`
- Modify: `components/call-agent/call-agent-browser-video.tsx`
- Modify: `components/call-agent/call-agent-layout.tsx`
- Modify: `tests/component/call-agent-browser-video.test.tsx`
- Modify: `tests/component/call-agent-layout.test.tsx`

- [ ] Add failing component tests for optional non-looping playback, `onEnded`, the Create → Preview → Operate order, and end-driven advancement.
- [ ] Run the focused component tests and confirm failures describe the missing props and sequence.
- [ ] Add optional `loop` and `onEnded` props without changing existing callers.
- [ ] Implement the three-layer Hero sequence; keep one active clip, advance on `ended`, and leave only the first poster under reduced motion.
- [ ] Replace the Hero’s single Preview browser with the sequence and rerun focused tests to green.

### Task 3: Correct Radius And Spacing

**Files:**
- Modify: `components/call-agent/call-agent-browser-video.module.css`
- Modify: `components/call-agent/call-agent-layout.module.css`
- Modify: `tests/unit/portfolio-detail-system.test.ts`
- Modify: `tests/e2e/call-agent.visual.spec.ts`

- [ ] Add failing source assertions and browser checks for a 20px browser radius, a 20px dark-band radius, and 32px adjacent browser gaps.
- [ ] Run the focused unit test and confirm the new requirements fail.
- [ ] Apply the radius and clipping rules to the browser and dark band.
- [ ] Apply one direct-sibling rule for paired browser figures so both target modules use a 32px gap.
- [ ] Rerun unit and component tests to green.

### Task 4: Regenerate And Verify Media

**Files:**
- Modify: `public/videos/call-agent/agent-preview.mp4`
- Modify: `evidence/call-agent/checksums.json`

- [ ] Regenerate `agent-preview.mp4` from the complete `智能体编排和预览.mov` source with no trim flags.
- [ ] Run the checksum updater and content validation.
- [ ] Verify the generated duration is approximately 26.31 seconds with AVFoundation metadata.
- [ ] Run focused Vitest, ESLint, `npm run build:framework`, and Call Agent Playwright coverage.
- [ ] Capture desktop and mobile screenshots and inspect Hero transitions, lower browser corners, dark-band radius, and both 32px media gaps.
