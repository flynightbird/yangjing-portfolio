# Homepage ConvoAI Media Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine only the homepage ConvoAI media card with the approved orb-conversation phone video, tighter device radii, and a content-driven Web browser height.

**Architecture:** Preserve the existing desktop Web-primary and mobile fallback compositions. Replace only the desktop phone picture with a reduced-motion-aware video source, and make the browser viewport participate in intrinsic layout through fixed source ratios rather than an absolute bottom crop.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest/Testing Library, Playwright

---

## File Map

- Modify `tests/component/homepage.test.tsx`: define the approved video/poster attributes while preserving mobile sources.
- Modify `tests/e2e/homepage.spec.ts`: verify source requests, 38px browser bars, ratios, radii, bounds, and mobile isolation.
- Modify `components/home/convo-ai-media.tsx`: render the approved desktop phone video and poster.
- Modify ConvoAI-only rules in `components/home/home.module.css`: remove fixed Web cropping and apply approved geometry.

### Task 1: Write the failing ConvoAI media contract

**Files:**
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] Update the component test so `[data-convo-phone] video` has poster `/images/convo-ai/posters/app-conversation-start.webp`, contains a source with `/videos/convo-ai/app-conversation-start.mp4`, `media="(min-width: 768px) and (prefers-reduced-motion: no-preference)"`, and has `autoplay`, `muted`, `loop`, `playsinline`, no `controls`, and `tabindex="-1"`. Keep the current mobile GIF and poster assertions unchanged.
- [ ] Update the desktop E2E test to locate the phone `video`, expect the approved poster/source and playback attributes, assert both `.studioBrowserBar` and `.convoBrowserBar` computed heights are `38px`, assert viewport ratio is `1.8`, phone ratio is `0.4625`, outer radius is `14px`, inner video radius is `10px`, and browser/phone remain within the ConvoAI media bounds.
- [ ] Update normal-motion asset expectations from `avatar-video.png` to `app-conversation-start.webp` and `.mp4`. Update mobile and mobile reduced-motion negative assertions so neither desktop phone asset is requested.
- [ ] Run `npx vitest run tests/component/homepage.test.tsx` and confirm RED because the phone is still a picture.
- [ ] Commit the failing tests with `git commit -m "test: define ConvoAI homepage media refinement"`.

### Task 2: Implement the approved phone and Web geometry

**Files:**
- Modify: `components/home/convo-ai-media.tsx`
- Modify: `components/home/home.module.css`

- [ ] Replace the desktop phone picture with:

```tsx
<video
  className={styles.convoPhoneVideo}
  poster={withBasePath('/images/convo-ai/posters/app-conversation-start.webp')}
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  tabIndex={-1}
>
  <source
    media="(min-width: 768px) and (prefers-reduced-motion: no-preference)"
    src={withBasePath('/videos/convo-ai/app-conversation-start.mp4')}
    type="video/mp4"
  />
</video>
```

- [ ] Make `.convoWebBrowser` content-driven with `bottom: auto`; make `.convoWebViewport` `position: relative`, `inset: auto`, and `aspect-ratio: 1440 / 800`; keep `.convoBrowserBar { height: 38px; }` unchanged.
- [ ] Make `.convoWebPicture`, `.convoWebImage`, and `.convoPhoneVideo` fill their reserved boxes. Keep the Web image `object-fit: contain` and `object-position: left top`.
- [ ] Set `.convoPhone { aspect-ratio: 592 / 1280; border-radius: 14px; }` and `.convoPhoneVideo { border-radius: 10px; object-fit: cover; object-position: center top; }`. Preserve position, dark border, shadow, rotation, width, and mobile hide breakpoint.
- [ ] Run `npx vitest run tests/component/homepage.test.tsx` and confirm GREEN.
- [ ] Commit with `git commit -m "feat: refine ConvoAI homepage media"`.

### Task 3: Verify responsive behavior and scope

**Files:**
- Modify only the four files above if a scoped defect is found.

- [ ] Run `PW_PORT=4176 npx playwright test tests/e2e/homepage.spec.ts --project=desktop --project=mobile` and fix only ConvoAI media contract failures.
- [ ] Run `npx eslint components/home/convo-ai-media.tsx tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts`, `npm test`, and `npm run build:framework`.
- [ ] Capture the real homepage at 1440x900 and 390x844. Verify the Web image is fully visible, browser chrome equals Call Agent, phone is subordinate and bounded, mobile GIF remains unchanged, and reduced motion uses static evidence.
- [ ] Review `git diff --name-only` and confirm no Call Agent, Meeting, Footer, detail-page, generated asset, `.playwright-cli`, or `next-env.d.ts` path is staged.
- [ ] Commit any verification-only ConvoAI correction with `git commit -m "fix: polish ConvoAI homepage media"`; do not create an empty commit.
