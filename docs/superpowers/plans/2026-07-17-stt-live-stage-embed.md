# STT Live Stage Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the STT homepage screenshot with a lazy, visual-only iframe that shows the complete animated landing-page stage while preserving the full Demo and audited source provenance.

**Architecture:** Keep the upstream STT snapshot checksum as the source contract and install a small repository-owned embed adapter into the published copy. The adapter provides `?embed=stage`, proportional stage isolation, readiness/playback messages, and pause-aware timers without copying the 247 KB Demo application. The React media component owns proximity loading, fallback/crossfade/scan state, viewport playback, and the existing outer pointer drift.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript, Motion, plain HTML/CSS/JavaScript, Vitest, Testing Library, Playwright.

---

## File Map

- Create `integrations/stt-demo/stage-embed.css`: stage-only layout and paused animation state.
- Create `integrations/stt-demo/stage-embed.js`: early embed bootstrap, pause-aware timers, validated messaging.
- Create `evidence/stt-demo/publication-checksums.json`: checksums for adapted publication bytes; upstream `checksums.json` remains unchanged.
- Create `scripts/write-stt-publication-checksums.mjs`: deterministic publication checksum writer.
- Modify `scripts/sync-stt-demo.mjs`: validate upstream, install adapter, validate adapted publication.
- Modify `scripts/validate-content.mjs`: use the adapted contract for published output.
- Modify generated `public/demos/stt-demo/index.html` and create generated `stage-embed.css/js` beside it.
- Modify `components/home/build-lab-media.tsx`: lazy iframe, readiness and playback lifecycle.
- Modify `components/home/home.module.css`: stable viewport, crossfade, scan, reduced motion.
- Modify `tests/unit/stt-source.test.ts`, `tests/component/homepage.test.tsx`, `tests/e2e/homepage.spec.ts`, and `tests/e2e/stt-demo.spec.ts`.

### Task 1: Add a Provenance-Safe Demo Adapter

**Files:**
- Create: `integrations/stt-demo/stage-embed.css`
- Create: `integrations/stt-demo/stage-embed.js`
- Create: `evidence/stt-demo/publication-checksums.json`
- Create: `scripts/write-stt-publication-checksums.mjs`
- Modify: `scripts/sync-stt-demo.mjs`
- Modify: `scripts/validate-content.mjs`
- Modify: `public/demos/stt-demo/index.html`
- Create: `public/demos/stt-demo/stage-embed.css`
- Create: `public/demos/stt-demo/stage-embed.js`
- Test: `tests/unit/stt-source.test.ts`

- [ ] **Step 1: Write failing provenance tests**

Add these tests to `tests/unit/stt-source.test.ts`:

```ts
it('separates the upstream snapshot from the adapted publication', async () => {
  const upstream = JSON.parse(
    await readFile(resolve(projectRoot, 'evidence/stt-demo/checksums.json'), 'utf8'),
  );
  const publication = JSON.parse(
    await readFile(resolve(projectRoot, 'evidence/stt-demo/publication-checksums.json'), 'utf8'),
  );
  expect(upstream.files).toHaveLength(11);
  expect(upstream.files.map((file: { path: string }) => file.path)).not.toContain('stage-embed.js');
  expect(publication.files.map((file: { path: string }) => file.path)).toEqual(
    expect.arrayContaining(['index.html', 'stage-embed.css', 'stage-embed.js']),
  );
  expect(publication.files).toHaveLength(13);
});

it('installs the local adapter without changing application bytes', async () => {
  const root = await createSttPublicationFixture();
  const demoRoot = resolve(root, 'public/demos/stt-demo');
  const originalApp = await readFile(resolve(demoRoot, 'app.js'), 'utf8');
  const originalStyles = await readFile(resolve(demoRoot, 'styles.css'), 'utf8');
  const { installLocalSttAdaptation } = await loadSynchronizer();
  await installLocalSttAdaptation({
    demoRoot,
    integrationRoot: resolve(projectRoot, 'integrations/stt-demo'),
  });
  const html = await readFile(resolve(demoRoot, 'index.html'), 'utf8');
  expect(html.match(/stage-embed\.css/g)).toHaveLength(1);
  expect(html.match(/stage-embed\.js/g)).toHaveLength(1);
  expect(await readFile(resolve(demoRoot, 'app.js'), 'utf8')).toBe(originalApp);
  expect(await readFile(resolve(demoRoot, 'styles.css'), 'utf8')).toBe(originalStyles);
});
```

- [ ] **Step 2: Verify RED**

Run `npx vitest run tests/unit/stt-source.test.ts`.

Expected: FAIL because the publication contract, adapter files, and installer do not exist.

- [ ] **Step 3: Implement deterministic installation**

Add this export to `scripts/sync-stt-demo.mjs` and call it after upstream files are copied to the temporary publication directory:

```js
const adapterTags = '  <link rel="stylesheet" href="stage-embed.css" />\n' +
  '  <script src="stage-embed.js"></script>\n';

export async function installLocalSttAdaptation({
  demoRoot,
  integrationRoot = path.join(root, 'integrations/stt-demo'),
  fileSystem = fs,
}) {
  await Promise.all(['stage-embed.css', 'stage-embed.js'].map((file) =>
    fileSystem.copyFile(path.join(integrationRoot, file), path.join(demoRoot, file)),
  ));
  const indexPath = path.join(demoRoot, 'index.html');
  const html = await fileSystem.readFile(indexPath, 'utf8');
  const clean = html
    .replace(/^\s*<link rel="stylesheet" href="stage-embed\.css" \/>\s*$/gm, '')
    .replace(/^\s*<script src="stage-embed\.js"><\/script>\s*$/gm, '');
  await fileSystem.writeFile(indexPath, clean.replace('</head>', `${adapterTags}</head>`));
}
```

Do not modify `public/demos/stt-demo/app.js` or `styles.css`.

- [ ] **Step 4: Create the embed CSS**

Create `integrations/stt-demo/stage-embed.css`:

```css
html[data-stt-embed='stage'],
html[data-stt-embed='stage'] body {
  width: 100%; height: 100%; margin: 0; overflow: hidden; background: transparent;
}
html[data-stt-embed='stage'] body > :not(#pageLanding) { display: none !important; }
html[data-stt-embed='stage'] #pageLanding,
html[data-stt-embed='stage'] .land-main {
  display: grid !important; width: 100%; height: 100%; min-height: 0;
  padding: 0; place-items: center; background: transparent; pointer-events: none;
}
html[data-stt-embed='stage'] .land-bar,
html[data-stt-embed='stage'] .land-copy { display: none !important; }
html[data-stt-embed='stage'] .land-visual {
  width: min(calc(100% - 32px), calc(178.5714vh - 57.1428px));
  height: auto; min-height: 0; aspect-ratio: 1000 / 560;
}
html[data-stt-embed='stage'] .snip { width: 100%; height: 100%; mask-image: none; }
html[data-stt-embed='stage'][data-stt-playback='paused'] .land-visual *,
html[data-stt-embed='stage'][data-stt-playback='paused'] .land-visual *::before,
html[data-stt-embed='stage'][data-stt-playback='paused'] .land-visual *::after {
  animation-play-state: paused !important;
}
@media (max-width: 600px) {
  html[data-stt-embed='stage'] .land-visual {
    width: min(calc(100% - 16px), calc(178.5714vh - 28.5714px));
  }
}
@media (prefers-reduced-motion: reduce) {
  html[data-stt-embed='stage'] .land-visual * { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 5: Create the early bootstrap**

Create `integrations/stt-demo/stage-embed.js`. It exits immediately for the normal URL, wraps functional intervals before `app.js` initializes, preserves remaining time, and accepts messages only from the same-origin parent:

```js
(() => {
  if (new URLSearchParams(location.search).get('embed') !== 'stage') return;
  const root = document.documentElement;
  root.dataset.sttEmbed = 'stage';
  root.dataset.sttPlayback = 'paused';
  const nativeTimeout = window.setTimeout.bind(window);
  const clearNativeTimeout = window.clearTimeout.bind(window);
  const nativeInterval = window.setInterval.bind(window);
  const clearNativeInterval = window.clearInterval.bind(window);
  const intervals = new Map();
  let paused = true;
  let nextId = 1;

  function schedule(record) {
    record.startedAt = performance.now();
    record.timeoutId = nativeTimeout(() => {
      record.callback(...record.args);
      record.remaining = record.delay;
      if (!paused && intervals.has(record.id)) schedule(record);
    }, record.remaining);
  }

  window.setInterval = (callback, delay = 0, ...args) => {
    if (typeof callback !== 'function') return nativeInterval(callback, delay, ...args);
    const normalized = Math.max(0, Number(delay) || 0);
    const record = { id: nextId++, callback, args, delay: normalized,
      remaining: normalized, startedAt: performance.now(), timeoutId: 0 };
    intervals.set(record.id, record);
    if (!paused) schedule(record);
    return record.id;
  };
  window.clearInterval = (id) => {
    const record = intervals.get(id);
    if (!record) return clearNativeInterval(id);
    clearNativeTimeout(record.timeoutId);
    intervals.delete(id);
  };

  function setPaused(next) {
    if (paused === next) return;
    paused = next;
    root.dataset.sttPlayback = paused ? 'paused' : 'playing';
    const now = performance.now();
    for (const record of intervals.values()) {
      if (paused) {
        clearNativeTimeout(record.timeoutId);
        record.remaining = Math.max(0, record.remaining - (now - record.startedAt));
      } else schedule(record);
    }
  }

  addEventListener('message', (event) => {
    if (event.source !== parent || event.origin !== location.origin ||
        event.data?.type !== 'stt-stage-playback') return;
    setPaused(event.data.paused === true);
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.body.dataset.page = 'landing';
    parent.postMessage({ type: 'stt-stage-ready' }, location.origin);
  });
})();
```

- [ ] **Step 6: Split upstream and publication validation**

Parameterize the existing checksum validator in `scripts/sync-stt-demo.mjs` with an explicit expected-path list. `loadApprovedChecksums()` continues to validate the 11 upstream paths. Add `loadPublicationChecksums()` for the 13 published paths, including `stage-embed.css` and `stage-embed.js`. `validateApprovedSourceFiles()` must use only the upstream contract; `validatePublishedSttDirectory()` must use only the publication contract.

Update `createSttPublicationFixture()` in `tests/unit/stt-source.test.ts` to copy both contracts. Update `scripts/validate-content.mjs` to load `publication-checksums.json` for the published directory. In `syncSttDemo()`, use this order: validate upstream source, copy upstream bytes, install the local adapter, validate the temporary adapted directory, then atomically commit it.

- [ ] **Step 7: Generate publication checksums**

Create `scripts/write-stt-publication-checksums.mjs`:

```js
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoRoot = path.join(root, 'public/demos/stt-demo');
const outputPath = path.join(root, 'evidence/stt-demo/publication-checksums.json');

async function listFiles(directory, relative = '') {
  const entries = await fs.readdir(path.join(directory, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const candidate = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(directory, candidate));
    else if (entry.isFile()) files.push(candidate);
  }
  return files;
}

const files = [];
for (const publishedPath of (await listFiles(demoRoot)).sort()) {
  const absolutePath = path.resolve(demoRoot, publishedPath);
  if (!absolutePath.startsWith(`${demoRoot}${path.sep}`)) {
    throw new Error(`Published path escapes STT root: ${publishedPath}`);
  }
  const bytes = await fs.readFile(absolutePath);
  files.push({
    path: publishedPath,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
}

await fs.writeFile(
  outputPath,
  `${JSON.stringify({ version: 1, files }, null, 2)}\n`,
);
```

This script derives every digest from current bytes and contains no hard-coded checksum.

Run the installer against `public/demos/stt-demo`, then run `node scripts/write-stt-publication-checksums.mjs`.

- [ ] **Step 8: Verify GREEN and commit**

Run:

```bash
npx vitest run tests/unit/stt-source.test.ts
node scripts/validate-content.mjs
```

Expected: PASS; upstream remains 11 files at `e5e840a`, adapted publication is 13 validated files.

Commit only the Task 1 files:

```bash
git add integrations/stt-demo scripts/sync-stt-demo.mjs scripts/validate-content.mjs scripts/write-stt-publication-checksums.mjs evidence/stt-demo/publication-checksums.json public/demos/stt-demo/index.html public/demos/stt-demo/stage-embed.css public/demos/stt-demo/stage-embed.js tests/unit/stt-source.test.ts
git commit -m "feat: add STT stage embed mode"
```

### Task 2: Add Homepage Lazy Loading and Playback

**Files:**
- Modify: `components/home/build-lab-media.tsx`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write failing component tests**

Install a local controllable `IntersectionObserver` double. Assert that there is no iframe initially, its load observer uses `rootMargin: '600px 0px'`, and triggering proximity creates:

```tsx
<iframe
  src="/demos/stt-demo/index.html?embed=stage"
  title="Animated STT Demo conversation stage"
  aria-hidden="true"
  tabIndex={-1}
/>
```

Assert the existing fallback image remains mounted and both outer links still target `/demos/stt-demo/index.html` with `_blank`, `noopener`, and `noreferrer`.

- [ ] **Step 2: Verify RED**

Run `npx vitest run tests/component/homepage.test.tsx`.

Expected: FAIL because the component has no iframe or observers.

- [ ] **Step 3: Implement lifecycle state**

In `BuildLabMedia`, add `mediaRef`, `iframeRef`, `shouldLoad`, `isReady`, and `isVisibleRef`. Use one observer with `rootMargin: '600px 0px'` to set `shouldLoad` once, and a second observer with threshold `0.05` to post:

```ts
iframeRef.current?.contentWindow?.postMessage(
  { type: 'stt-stage-playback', paused: !entry.isIntersecting },
  window.location.origin,
);
```

Add a window message listener that accepts readiness only when all are true:

```ts
event.origin === window.location.origin &&
event.source === iframeRef.current?.contentWindow &&
event.data?.type === 'stt-stage-ready'
```

On readiness, set `isReady` and immediately post the current visibility. Under reduced motion, do not load the iframe. If `IntersectionObserver` is unavailable, load the iframe immediately and keep the static fallback until readiness.

- [ ] **Step 4: Render fallback and frame as siblings**

Inside the existing browser window, keep the chrome and render:

```tsx
<div className={styles.buildStageViewport}>
  <img data-stt-stage-fallback className={styles.buildStageFallback}
    src="/images/stt-demo/stt-product-stage@2x.png" width={1266} height={1120}
    alt="STT Demo product stage showing a speaker, bilingual transcript, translation, and participants" />
  {shouldLoad && !reduceMotion ? (
    <iframe ref={iframeRef} className={styles.buildStageFrame}
      src="/demos/stt-demo/index.html?embed=stage"
      title="Animated STT Demo conversation stage" aria-hidden="true" tabIndex={-1} />
  ) : null}
  <span data-stt-stage-scan className={styles.buildStageScan} aria-hidden="true" />
</div>
```

Set `ref={mediaRef}` and `data-stt-ready={isReady ? 'true' : 'false'}` on the outer anchor. Preserve all current pointer handlers and Motion springs.

- [ ] **Step 5: Verify GREEN and commit**

Run `npx vitest run tests/component/homepage.test.tsx`.

Expected: PASS.

```bash
git add components/home/build-lab-media.tsx tests/component/homepage.test.tsx
git commit -m "feat: lazy load STT homepage stage"
```

### Task 3: Add Crossfade, One-Shot Scan, and Reduced Motion

**Files:**
- Modify: `components/home/home.module.css`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing browser assertions**

Update the desktop STT test to scroll the section into proximity, locate `iframe[src="/demos/stt-demo/index.html?embed=stage"]`, verify fallback opacity begins at `1`, wait on `data-stt-ready="true"`, then verify frame opacity `1`, fallback opacity `0`, and scan `animation-iteration-count: 1`.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "media-dominant STT"
```

Expected: FAIL because the transition styles are absent.

- [ ] **Step 3: Implement the exact presentation states**

Add:

```css
.buildStageViewport { position: relative; aspect-ratio: 2 / 1; overflow: hidden; background: #08090b; }
.buildStageFallback, .buildStageFrame {
  position: absolute; inset: 0; display: block; width: 100%; height: 100%; border: 0;
}
.buildStageFallback {
  object-fit: cover; object-position: center 61%; opacity: 1;
  transition: opacity 500ms var(--ease-out);
}
.buildStageFrame {
  background: transparent; opacity: 0; pointer-events: none;
  transition: opacity 500ms var(--ease-out);
}
.buildMedia[data-stt-ready='true'] .buildStageFallback { opacity: 0; }
.buildMedia[data-stt-ready='true'] .buildStageFrame { opacity: 1; }
.buildStageScan {
  position: absolute; inset-block: 0; left: -18%; width: 18%; opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(225, 244, 255, 0.3), transparent);
  pointer-events: none;
}
.buildMedia[data-stt-ready='true'] .buildStageScan {
  animation: stt-stage-scan 700ms var(--ease-out) 1 both;
}
@keyframes stt-stage-scan {
  0% { transform: translateX(0); opacity: 0; }
  18% { opacity: 0.72; }
  100% { transform: translateX(660%); opacity: 0; }
}
```

Extend the existing reduced-motion query so fallback/frame transitions are `none` and `.buildStageScan` is `display: none`. Preserve the browser window, chrome, shadow, 20px media radius, and outer drift.

- [ ] **Step 4: Verify desktop and mobile, then commit**

Run:

```bash
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "STT"
npx playwright test tests/e2e/homepage.spec.ts --project=mobile --grep "STT"
```

Expected: PASS; mobile media remains above copy with no page overflow.

```bash
git add components/home/home.module.css tests/e2e/homepage.spec.ts
git commit -m "style: transition STT live stage media"
```

### Task 4: Verify Isolation, Complete Stage, and Pause Without Reset

**Files:**
- Modify: `tests/e2e/stt-demo.spec.ts`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write the direct embed test**

Open `/demos/stt-demo/index.html?embed=stage` and assert `html[data-stt-embed="stage"]`, `.land-visual`, `.snip-side`, and `.snip-dock` are visible; `.land-bar`, `.land-copy`, and `#pageProduct` are hidden; body overflow is hidden; the stage bounding box has at least 7px inset on desktop and mobile.

Retain the existing normal URL test and assert header, copy, CTA, and full Demo transition remain interactive.

- [ ] **Step 2: Write the pause/resume test**

On the homepage, wait for the stage frame to report `data-stt-playback="playing"`; save `.snip-original` text; scroll to Call Agent; verify playback becomes `paused`; wait 5500ms and assert text is unchanged; return to STT; verify `playing`; poll until the text rotates. The 5500ms wait proves the original 5200ms cycle cannot fire while paused.

- [ ] **Step 3: Verify RED or expose the precise lifecycle gap**

Run:

```bash
npx playwright test tests/e2e/stt-demo.spec.ts --project=desktop --grep "stage embed"
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "pause"
```

- [ ] **Step 4: Make only contract-level corrections**

Limit corrections to `stage-embed.css` isolation/fit, `stage-embed.js` readiness/timer state, and `build-lab-media.tsx` observer/message state. Do not add internal clicks, alternate crops, camera motion, or duplicate transcript logic.

- [ ] **Step 5: Regenerate checksums and verify GREEN**

Run:

```bash
cp integrations/stt-demo/stage-embed.css public/demos/stt-demo/stage-embed.css
cp integrations/stt-demo/stage-embed.js public/demos/stt-demo/stage-embed.js
node scripts/write-stt-publication-checksums.mjs
npx playwright test tests/e2e/stt-demo.spec.ts --project=desktop
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "STT"
npx playwright test tests/e2e/homepage.spec.ts --project=mobile --grep "STT"
```

Expected: PASS for complete stage/Dock, normal Demo regression, pause/resume, pointer drift, reduced motion, and mobile layout.

- [ ] **Step 6: Commit lifecycle coverage**

```bash
git add integrations/stt-demo public/demos/stt-demo/stage-embed.css public/demos/stt-demo/stage-embed.js evidence/stt-demo/publication-checksums.json components/home/build-lab-media.tsx tests/e2e/stt-demo.spec.ts tests/e2e/homepage.spec.ts
git commit -m "test: verify STT live stage lifecycle"
```

### Task 5: Full Regression and Visual Verification

**Files:**
- Verify only; correct only files listed in Tasks 1–4 when a failure demonstrates a defect.

- [ ] **Step 1: Run static and unit checks**

```bash
git diff --check
npm run lint
npm test
```

Expected: all exit 0.

- [ ] **Step 2: Run publication build**

Run `npm run build`.

Expected: source validation, Next build, and output validation all PASS with the adapted publication contract.

- [ ] **Step 3: Run browser coverage**

```bash
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/stt-demo.spec.ts --project=desktop
npx playwright test tests/e2e/homepage.spec.ts --project=mobile
```

Expected: all selected tests PASS at 1440×900 and 390×844.

- [ ] **Step 4: Capture desktop and mobile screenshots after readiness**

Verify full transcript, participant rail, and Dock; 12–16px desktop and about 8px mobile breathing room; no Demo header/copy/CTA/product screen; no clipping, blank iframe, overlap, or horizontal overflow; fallback hidden after readiness; restrained outer pointer drift.

- [ ] **Step 5: Audit scope**

```bash
git status --short
git diff --stat HEAD~4..HEAD
git diff --name-only HEAD~4..HEAD
```

Expected: only STT embed, homepage media, provenance, and associated tests are included. Existing Call Agent/ConvoAI edits remain untouched and unstaged.

- [ ] **Step 6: Commit only a demonstrated verification correction**

Stage only corrected STT files and commit `fix: harden STT stage embed`. Do not create an empty commit.
