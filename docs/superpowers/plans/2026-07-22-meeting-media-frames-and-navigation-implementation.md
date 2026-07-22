# Meeting Media Frames and Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present muted Meeting recordings as polished product evidence with quiet device and browser frames, explanatory copy outside the footage, standard project navigation, and the supplied Web transcription recording.

**Architecture:** Extend the shared Meeting film component with an explicit browser frame variant and a responsive device shell while preserving native video aspect ratios and existing reduced-motion fallbacks. Keep media identity centralized in the Meeting film contract and publication manifest, then restore the shared `ChapterNav` defaults instead of building Meeting-only navigation behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright, FFmpeg, JSON publication assets

---

## File Map

- `components/meeting/meeting-film.tsx`: browser/device frame markup, muted playback without subtitle tracks, footer and replay behavior.
- `components/meeting/meeting-film.module.css`: browser chrome, device shell, pill tabs, circular replay, responsive and print treatment.
- `components/meeting/meeting-layout.tsx`: browser frame on the hero and standard `ChapterNav` breakpoint.
- `components/meeting/meeting-layout.module.css`: shared project-detail rail geometry and visible chapter indices.
- `components/meeting/meeting-showcase.tsx`: browser frame on Web clips and the renamed transcription clip ID.
- `components/meeting/meeting-film-contract.ts`: canonical Web transcription descriptor.
- `scripts/meeting-publication-contract.mjs`: canonical publication inventory.
- `evidence/meeting/manifest.json`: source/output records and metadata for the new media identity.
- `evidence/meeting/source/meeting-web-transcription.mp4`: losslessly remuxed supplied recording.
- `public/videos/meeting/meeting-web-transcription.mp4`: generated public video.
- `evidence/meeting/source/meeting-*.{en,zh}.vtt`: remove subtitle assets associated with rendered Meeting films.
- `public/captions/meeting/meeting-*.{en,zh}.vtt`: remove published subtitle assets associated with rendered Meeting films.
- `tests/component/meeting-film.test.tsx`: film frame, muted playback, no-track, footer, replay, and orientation contracts.
- `tests/component/meeting-layout.test.tsx`: navigation and hero frame integration.
- `tests/component/meeting-showcase.test.tsx`: Web clip integration.
- `tests/unit/meeting-film-contract.test.ts`: descriptor contract without caption fields.
- `tests/unit/meeting-assets.test.ts`: manifest/publication inventory.
- `tests/unit/publication-validation.test.ts`: canonical publication validation.
- `tests/e2e/meeting.spec.ts`: rendered media, muted state, absence of subtitle tracks, controls, navigation, and viewport geometry.

### Task 1: Add Browser Frames and Remove Video Subtitle Tracks

**Files:**
- Modify: `components/meeting/meeting-film.tsx`
- Modify: `components/meeting/meeting-film.module.css`
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-showcase.tsx`
- Test: `tests/component/meeting-film.test.tsx`
- Test: `tests/component/meeting-layout.test.tsx`
- Test: `tests/component/meeting-showcase.test.tsx`

- [ ] **Step 1: Write failing component tests for the browser frame and absence of subtitle tracks**

Add assertions equivalent to:

```tsx
const { container } = render(<ProductFilmClip {...props} frame="browser" />);

expect(container.querySelector('[data-film-frame="browser"]')).not.toBeNull();
expect(container.querySelector('[data-browser-chrome]')).toHaveAttribute(
  'aria-hidden',
  'true',
);
expect(container.querySelectorAll('[data-browser-dot]')).toHaveLength(3);
expect(container.querySelector('track')).toBeNull();
expect(container.querySelector('video')).toHaveProperty('muted', true);
```

In the orientation test, assert the active video has no `track` child and is muted. In layout and showcase tests, assert the Meeting hero and both Web workspace clips use `frame="browser"`, and remove caption-related props from their calls.

- [ ] **Step 2: Run the focused tests and verify the new contract fails**

Run:

```bash
npm test -- tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx --run
```

Expected: FAIL because `ProductFilmClipProps` has no `frame` property, browser markers do not exist, and both film components still render subtitle tracks.

- [ ] **Step 3: Add the explicit frame API and browser chrome markup**

Extend the prop contract and keep the default backwards compatible:

```tsx
export interface ProductFilmClipProps {
  readonly src: string;
  readonly poster: string;
  readonly replayLabel: string;
  readonly title: string;
  readonly description: string;
  readonly fallbackAlt: string;
  readonly frame?: 'plain' | 'browser';
}

export function ProductFilmClip({
  src,
  poster,
  replayLabel,
  title,
  description,
  fallbackAlt,
  frame = 'plain',
}: ProductFilmClipProps) {
  const descriptionId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const reducedMotion = useReducedMotionPreference();
  const failed = failedSrc === src;
  const showPoster = reducedMotion || failed;

  const replay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => undefined);
  };

  return (
    <figure className={styles.clip} data-product-film-clip>
      <div
        className={`${styles.mediaFrame} ${frame === 'browser' ? styles.browserFrame : ''}`}
        data-film-frame={frame}
      >
        {frame === 'browser' ? (
          <div className={styles.browserChrome} data-browser-chrome aria-hidden="true">
            <span className={styles.browserDots}>
              <i data-browser-dot />
              <i data-browser-dot />
              <i data-browser-dot />
            </span>
            <span className={styles.browserAddress}>meeting.agora.io</span>
          </div>
        ) : null}
        <div className={styles.media}>
          {!reducedMotion && (
            <video
              ref={videoRef}
              src={src}
              poster={poster}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              aria-label={title}
              aria-describedby={descriptionId}
              aria-hidden={failed || undefined}
              hidden={failed}
              onError={() => setFailedSrc(src)}
            />
          )}
          <img
            className={styles.fallback}
            src={poster}
            alt={fallbackAlt}
            aria-hidden={showPoster ? undefined : true}
            hidden={!showPoster}
          />
        </div>
      </div>
      <div className={styles.replayRow} data-film-replay-row>
        {!showPoster && (
          <button
            className={styles.replay}
            type="button"
            onClick={replay}
            aria-label={`${replayLabel} ${title}`}
            title={`${replayLabel} ${title}`}
          >
            <RotateCcw aria-hidden="true" size={18} />
          </button>
        )}
      </div>
      <figcaption id={descriptionId}>{description}</figcaption>
    </figure>
  );
}
```

Remove both `<track>` elements. Remove `captions`, `captionLanguage`, and `captionLabel` from `ProductFilmClipProps`, `OrientationSource`, and `OrientationMatchedCutProps`, then remove the corresponding arguments from `meeting-layout.tsx` and `meeting-showcase.tsx`. Keep `muted` on every video. Keep `description` and `<figcaption>` outside the media frame so design intent is readable without overlaying footage.

- [ ] **Step 4: Style the browser frame from the homepage reference**

Add a shallow decorative chrome bar while keeping the actual video ratio stable:

```css
.mediaFrame {
  overflow: hidden;
  border: 1px solid #353a3f;
  border-radius: 6px;
  background: #080a0c;
}

.browserChrome {
  position: relative;
  display: grid;
  height: 2.25rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  padding-inline: 0.75rem;
  border-bottom: 1px solid #353a3f;
  background: rgba(255, 255, 255, 0.06);
}

.browserDots {
  display: flex;
  gap: 0.375rem;
}

.browserDots i {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #71767b;
}

.browserAddress {
  grid-column: 2;
  justify-self: center;
  color: #a7aaad;
  font-size: 0.6875rem;
  line-height: 1;
}

.media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 9;
  border: 0;
  background: #080a0c;
}
```

Move the current outer border/radius from `.media` to `.mediaFrame`. Preserve existing reduced-motion and print behavior.

- [ ] **Step 5: Apply the browser variant only to desktop/Web product surfaces**

Pass `frame="browser"` to the hero `ProductFilmClip` in `meeting-layout.tsx` and the shared Web clip renderer in `meeting-showcase.tsx`. Do not pass it to `OrientationMatchedCut`; app recordings use the device shell in Task 2.

- [ ] **Step 6: Run the focused tests and verify they pass**

Run the Task 1 test command again.

Expected: PASS. Browser markers are present only on hero/Web clips; every video is muted and contains no subtitle track.

- [ ] **Step 7: Commit the browser frame and subtitle removal**

```bash
git add components/meeting/meeting-film.tsx components/meeting/meeting-film.module.css components/meeting/meeting-layout.tsx components/meeting/meeting-showcase.tsx tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx
git commit -m "feat: frame Meeting web films"
```

### Task 2: Add the Quiet Device Shell and Refine Film Controls

**Files:**
- Modify: `components/meeting/meeting-film.tsx`
- Modify: `components/meeting/meeting-film.module.css`
- Test: `tests/component/meeting-film.test.tsx`

- [ ] **Step 1: Write failing tests for device-shell semantics and stable controls**

Add assertions equivalent to:

```tsx
const { container } = render(<OrientationMatchedCut {...orientationProps} />);

expect(container.querySelector('[data-device-shell]')).toHaveAttribute(
  'data-orientation',
  'portrait',
);
expect(container.querySelector('[data-device-hardware-cue]')).toHaveAttribute(
  'aria-hidden',
  'true',
);
expect(container.querySelector('[data-orientation-controls]')).not.toBeNull();
```

After selecting landscape and advancing the existing 300 ms timer, assert the shell changes to landscape without adding a transform to the video. For `ProductFilmClip`, assert the figcaption and replay button are children of one `[data-film-footer]`; when fallback is shown the footer remains but a fixed-size placeholder replaces replay.

- [ ] **Step 2: Run the film tests and verify they fail**

```bash
npm test -- tests/component/meeting-film.test.tsx --run
```

Expected: FAIL because no device shell, hardware cue, or shared film footer exists.

- [ ] **Step 3: Wrap orientation media in the device shell and unify the film footer**

Use the target orientation on the shell:

```tsx
<div
  className={styles.deviceShell}
  data-device-shell
  data-orientation={targetOrientation}
>
  <span
    className={styles.deviceHardwareCue}
    data-device-hardware-cue
    aria-hidden="true"
  />
  <div className={styles.orientationFrame} data-orientation-frame>
    <video
      key={`${activeOrientation}:${activeSource.src}`}
      className={styles.orientationVideo}
      src={activeSource.src}
      poster={activeSource.poster}
      autoPlay
      muted
      playsInline
      controls
      preload="metadata"
      aria-label={title}
      onError={handleMediaError}
    />
  </div>
</div>
```

Add `data-orientation-controls` to the existing tab group. Replace the separate replay and description rows with:

```tsx
<div className={styles.filmFooter} data-film-footer>
  <figcaption id={descriptionId}>{description}</figcaption>
  {!showPoster ? (
    <button
      className={styles.replay}
      type="button"
      onClick={replay}
      aria-label={`${replayLabel} ${title}`}
      title={`${replayLabel} ${title}`}
    >
      <RotateCcw aria-hidden="true" size={18} />
    </button>
  ) : (
    <span className={styles.replayPlaceholder} aria-hidden="true" />
  )}
</div>
```

- [ ] **Step 4: Implement quiet, orientation-aware shell geometry**

```css
.deviceShell {
  position: relative;
  box-sizing: border-box;
  padding: 0.375rem;
  border: 1px solid #5b6065;
  border-radius: 1rem;
  background: #171a1d;
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.28);
  transition: width 600ms ease, aspect-ratio 600ms ease;
}

.deviceShell[data-orientation='portrait'] {
  width: min(100%, 25rem);
  aspect-ratio: 9 / 16;
}

.deviceShell[data-orientation='landscape'] {
  width: min(100%, 64rem);
  aspect-ratio: 16 / 9;
}

.deviceHardwareCue {
  position: absolute;
  z-index: 1;
  top: 0.65rem;
  left: 50%;
  width: 2.5rem;
  height: 0.1875rem;
  border-radius: 999px;
  background: #6f7478;
  transform: translateX(-50%);
  pointer-events: none;
}

.orientationFrame {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 0.6875rem;
  background: #080a0c;
}

.orientationVideo {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: none;
}
```

Move the current width/aspect selectors from `.orientationFrame` to `.deviceShell`. Disable shell transitions under reduced motion. Do not add brand-specific buttons, notches, reflections, cropping, or rotation.

- [ ] **Step 5: Implement pill tabs, circular replay, and one footer row**

```css
.orientationControls {
  display: flex;
  width: fit-content;
  min-height: 44px;
  margin: 0.75rem auto 0;
  padding: 0.25rem;
  border: 0;
  border-radius: 999px;
  background: #2b2f33;
}

.orientationButton {
  min-height: 44px;
  padding: 0.625rem 1rem;
  border: 0;
  border-radius: 999px;
  color: #c4c7ca;
  background: transparent;
}

.orientationButton[aria-pressed='true'] {
  color: #fff;
  background: #50555a;
}

.filmFooter {
  display: grid;
  min-height: 44px;
  grid-template-columns: minmax(0, 1fr) 44px;
  gap: 1rem;
  align-items: center;
  margin-top: 0.75rem;
}

.filmFooter figcaption {
  margin: 0;
}

.replay,
.replayPlaceholder {
  width: 44px;
  height: 44px;
}

.replay {
  border-radius: 50%;
}
```

Retain the 2 px coral focus outline and 44 px minimum targets.

- [ ] **Step 6: Run the film tests and verify they pass**

Run the Task 2 test command again.

Expected: PASS, including existing switching, reduced-motion, failure, replay, and print contracts.

- [ ] **Step 7: Commit the device shell and controls**

```bash
git add components/meeting/meeting-film.tsx components/meeting/meeting-film.module.css tests/component/meeting-film.test.tsx
git commit -m "feat: frame Meeting app films"
```

### Task 3: Restore Standard Project-Detail Navigation

**Files:**
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-layout.module.css`
- Test: `tests/component/meeting-layout.test.tsx`
- Test: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Write failing tests for the standard ChapterNav contract**

In the component test, assert:

```tsx
expect(container.querySelector('[data-case-web-control]')).toHaveAttribute(
  'data-compact-at',
  'default',
);
expect(layoutStyles).not.toMatch(
  /nav a span\)\s*{[^}]*display:\s*none/s,
);
expect(layoutStyles).not.toMatch(
  /nav a\)\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
);
```

In Playwright, add a 1000 px-wide desktop test named `uses standard project navigation`. Assert the control remains the expanded numbered rail and the first visible link contains `01`.

- [ ] **Step 2: Run navigation tests and verify they fail**

```bash
npm test -- tests/component/meeting-layout.test.tsx --run
PW_PORT=4419 PW_REUSE_SERVER=1 npm run test:e2e -- tests/e2e/meeting.spec.ts --project=desktop --grep "standard project navigation"
```

Expected: component FAIL because Meeting passes `compactAt="wide"` and hides indices; E2E FAIL at 1000 px because wide compact mode is active.

- [ ] **Step 3: Use the shared default ChapterNav behavior**

Change the layout call to:

```tsx
<ChapterNav chapters={meta.chapters ?? []} locale={locale} />
```

Delete Meeting-only CSS that hides the chapter number span and collapses links to one column. Preserve Meeting color tokens on `[data-case-web-control]`.

- [ ] **Step 4: Align the rail with shared project-detail measurements**

Use the existing 2fr/10fr relationship and standard sticky offset:

```css
.frame {
  grid-template-columns: minmax(10rem, 2fr) minmax(0, 10fr);
}

.rail :global([data-case-web-control]) {
  top: calc(var(--header-height) + var(--space-5));
}

.rail :global([data-case-web-control] nav a) {
  grid-template-columns: 2rem minmax(0, 1fr);
}
```

Compare final values with `components/case-study/case-layout.module.css` and `chapter-nav.module.css`. Do not change full-width film bands, restore project neighbors, or replace the global `SiteHeader`.

- [ ] **Step 5: Run navigation tests and verify they pass**

Run the Task 3 commands again.

Expected: PASS; numbered navigation is expanded at 1000 px and switches at the shared default breakpoint.

- [ ] **Step 6: Commit standard navigation**

```bash
git add components/meeting/meeting-layout.tsx components/meeting/meeting-layout.module.css tests/component/meeting-layout.test.tsx tests/e2e/meeting.spec.ts
git commit -m "fix: align Meeting project navigation"
```

### Task 4: Replace Web Whiteboard with the Supplied Transcription Recording

**Files:**
- Create: `evidence/meeting/source/meeting-web-transcription.mp4`
- Create: `public/videos/meeting/meeting-web-transcription.mp4`
- Delete: `evidence/meeting/source/meeting-web-whiteboard.mp4`
- Delete: `public/videos/meeting/meeting-web-whiteboard.mp4`
- Delete: `evidence/meeting/source/meeting-stage-*.{en,zh}.vtt`
- Delete: `evidence/meeting/source/meeting-whiteboard-*.{en,zh}.vtt`
- Delete: `evidence/meeting/source/meeting-web-*.{en,zh}.vtt`
- Delete: `public/captions/meeting/meeting-stage-*.{en,zh}.vtt`
- Delete: `public/captions/meeting/meeting-whiteboard-*.{en,zh}.vtt`
- Delete: `public/captions/meeting/meeting-web-*.{en,zh}.vtt`
- Modify: `components/meeting/meeting-film-contract.ts`
- Modify: `components/meeting/meeting-showcase.tsx`
- Modify: `scripts/meeting-publication-contract.mjs`
- Modify: `evidence/meeting/manifest.json`
- Modify: `tests/unit/meeting-film-contract.test.ts`
- Modify: `tests/unit/meeting-assets.test.ts`
- Modify: `tests/unit/publication-validation.test.ts`
- Modify: `tests/component/meeting-showcase.test.tsx`
- Modify: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Write failing contract expectations for the renamed clip**

Replace canonical `meeting-web-whiteboard` expectations with:

```ts
{
  id: 'meeting-web-transcription',
  sourceFile: 'meeting-web-transcription.mp4',
  src: '/videos/meeting/meeting-web-transcription.mp4',
  orientation: 'landscape',
}
```

Assert that every descriptor omits a `captions` field and the canonical publication inventory contains no `kind: 'captions'` records for rendered Meeting films. Preserve the descriptor's current poster and localized fallback values unless they explicitly describe whiteboard imagery. Update the first Web slot and E2E source list to expect transcription.

- [ ] **Step 2: Run contract tests and verify they fail**

```bash
npm test -- tests/unit/meeting-film-contract.test.ts tests/unit/meeting-assets.test.ts tests/unit/publication-validation.test.ts tests/component/meeting-showcase.test.tsx --run
```

Expected: FAIL because production descriptors, manifest records, files, and showcase IDs still use the old identity and publish subtitle assets.

- [ ] **Step 3: Remux the supplied H.264 recording without re-encoding**

```bash
ffmpeg -y \
  -i "/Users/admin/Desktop/声网 作品集 整理/作品集配图/meeting/web-实施转写-页面利用.mov" \
  -map 0:v:0 -c copy -movflags +faststart \
  evidence/meeting/source/meeting-web-transcription.mp4
```

Verify:

```bash
ffprobe -v error -select_streams v:0 \
  -show_entries stream=codec_name,width,height \
  -show_entries format=duration,size \
  -of json evidence/meeting/source/meeting-web-transcription.mp4
```

Expected: H.264, `2920x1476`, about `18.248` seconds, with no re-encoding.

- [ ] **Step 4: Put the design explanation outside the transcription video**

Update the first `FilmActMedia` call in `WebWorkspaceMedia` to use concise bilingual external copy:

```tsx
title={isChinese ? 'Web 实时转写与页面利用' : 'Web transcription workspace'}
description={isChinese
  ? '转写面板与会议舞台并行展开，信息增加时仍保持主要内容清晰。'
  : 'The transcript and meeting stage share the workspace while primary content stays clear.'}
```

Keep this text in the existing `ProductFilmClip` figcaption below the browser frame. Do not burn text into the video or add a timed-text track.

- [ ] **Step 5: Update descriptors, inventory, manifest, and showcase ID**

Rename `meeting-web-whiteboard` to `meeting-web-transcription` in:

```text
components/meeting/meeting-film-contract.ts
components/meeting/meeting-showcase.tsx
scripts/meeting-publication-contract.mjs
evidence/meeting/manifest.json
```

Remove `captions` from all six rendered-film descriptors and from `scripts/meeting-publication-contract.mjs`. In the manifest, remove the `captions` property from those six video records and remove their twelve `meeting-*-captions-{en,zh}` asset records. Update the transcription video record with its actual byte size and SHA-256 hash; never reuse the deleted whiteboard checksum. Leave unrelated legacy evidence such as `adaptive-layout-demo` and `transcript-demo` unchanged because they are not rendered by the current Meeting page.

- [ ] **Step 6: Remove superseded files and publish the new assets**

```bash
rm evidence/meeting/source/meeting-web-whiteboard.mp4 \
  public/videos/meeting/meeting-web-whiteboard.mp4
rm evidence/meeting/source/meeting-stage-*.en.vtt \
  evidence/meeting/source/meeting-stage-*.zh.vtt \
  evidence/meeting/source/meeting-whiteboard-*.en.vtt \
  evidence/meeting/source/meeting-whiteboard-*.zh.vtt \
  evidence/meeting/source/meeting-web-*.en.vtt \
  evidence/meeting/source/meeting-web-*.zh.vtt
rm public/captions/meeting/meeting-stage-*.en.vtt \
  public/captions/meeting/meeting-stage-*.zh.vtt \
  public/captions/meeting/meeting-whiteboard-*.en.vtt \
  public/captions/meeting/meeting-whiteboard-*.zh.vtt \
  public/captions/meeting/meeting-web-*.en.vtt \
  public/captions/meeting/meeting-web-*.zh.vtt
node scripts/prepare-meeting-assets.mjs --publication
```

Expected: the transcription video is copied to public output, no subtitle files are regenerated for rendered Meeting films, and publication validation reports no missing or unexpected canonical asset.

- [ ] **Step 7: Confirm no stale Web whiteboard identity remains**

```bash
rg -n "meeting-web-whiteboard" tests components scripts evidence content public
rg -n "<track|captionLanguage|captionLabel|clip\.captions" components/meeting tests/component tests/e2e
```

Expected: no matches. App whiteboard video files and the whiteboard chapter remain untouched; only their subtitle sidecars are removed.

- [ ] **Step 8: Run media contract tests and verify they pass**

Run the Task 4 test command again.

Expected: PASS with `meeting-web-transcription` in canonical inventory/public output and no rendered-film subtitle contract.

- [ ] **Step 9: Commit the recording replacement**

```bash
git add components/meeting/meeting-film-contract.ts components/meeting/meeting-showcase.tsx scripts/meeting-publication-contract.mjs evidence/meeting/manifest.json evidence/meeting/source public/videos/meeting public/captions/meeting tests/unit/meeting-film-contract.test.ts tests/unit/meeting-assets.test.ts tests/unit/publication-validation.test.ts tests/component/meeting-showcase.test.tsx tests/e2e/meeting.spec.ts
git commit -m "feat: add Meeting web transcription film"
```

Confirm `git status --short` does not stage the unrelated `next-env.d.ts`.

### Task 5: End-to-End Visual and Production Verification

**Files:**
- Modify: `tests/e2e/meeting.spec.ts`
- Create locally: `artifacts/meeting-media-frames-desktop.png`
- Create locally: `artifacts/meeting-media-frames-mobile.png`

- [ ] **Step 1: Add E2E assertions for frames, muted playback, no subtitle tracks, and geometry**

In the ready-media branch, assert:

```ts
await expect(meeting.locator('[data-film-frame="browser"]')).toHaveCount(3);
await expect(meeting.locator('[data-browser-chrome]')).toHaveCount(3);
await expect(meeting.locator('[data-device-shell]')).toHaveCount(2);
await expect(meeting.locator('video track')).toHaveCount(0);
expect(
  await meeting.locator('video').evaluateAll((videos) =>
    videos.every((video) => (video as HTMLVideoElement).muted),
  ),
).toBe(true);
```

For each required viewport, inspect browser/device/video boxes and computed styles. Assert no horizontal overflow, `object-fit: contain`, transform `none`, device shell within its stage, chrome above the video, pill tabs, and a 44x44 circular replay.

- [ ] **Step 2: Run focused tests, publication preparation, and lint**

```bash
node scripts/prepare-meeting-assets.mjs --publication
npm test -- tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-showcase.test.tsx tests/unit/meeting-film-contract.test.ts tests/unit/meeting-assets.test.ts tests/unit/meeting-content.test.ts tests/unit/publication-validation.test.ts --run --testTimeout=180000
npm run lint
```

Expected: asset preparation succeeds, tests pass, and ESLint has 0 errors. Existing unrelated Xuelang warnings may remain; no new warning is accepted.

- [ ] **Step 3: Start or reuse port 4419 and run both Playwright projects**

```bash
npm run dev -- --hostname 127.0.0.1 --port 4419
PW_PORT=4419 PW_REUSE_SERVER=1 npm run test:e2e -- tests/e2e/meeting.spec.ts --project=desktop
PW_PORT=4419 PW_REUSE_SERVER=1 npm run test:e2e -- tests/e2e/meeting.spec.ts --project=mobile
```

Expected: both projects PASS across 390x844, 430x932, 844x390, 1440x1000, and 1728x1117.

- [ ] **Step 4: Capture and inspect desktop/mobile screenshots**

Capture the Chinese Meeting page at 1440x1000 and 390x844 after media metadata loads. Verify:

```text
- browser chrome is shallow and secondary to footage
- device bezel follows portrait and landscape aspect ratios
- no video is rotated, stretched, or cropped
- pill tabs and circular replay do not shift surrounding content
- description and replay share one vertically centered row
- no subtitle overlay, track, or CC option is attached to the recordings
- design explanations appear as concise text outside each video frame
- numbered navigation matches other detail pages
- first Web film shows transcription/page utilization
- previous/next project navigation is absent
```

- [ ] **Step 5: Stop the development server and run the production build**

```bash
npm run build:framework
```

Expected: production build succeeds and includes `/zh/work/meeting/` and `/en/work/meeting/`.

- [ ] **Step 6: Restart preview and verify the route**

```bash
npm run dev -- --hostname 127.0.0.1 --port 4419
curl -I http://127.0.0.1:4419/zh/work/meeting/
```

Expected: HTTP `200`.

- [ ] **Step 7: Commit the E2E verification contract**

```bash
git add tests/e2e/meeting.spec.ts
git commit -m "test: verify Meeting media presentation"
```

Do not stage `next-env.d.ts` or generated screenshots.
