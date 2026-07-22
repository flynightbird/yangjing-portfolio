# Agora Meeting Product Film Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Agora Meeting case study as a recording-led Product Film whose cinematic first half sells the shipped product and whose editorial second half proves the underlying design system, delivery evidence, and evidence boundaries.

**Architecture:** Keep the existing bilingual content route, chapter navigation, system models, Breakout Room artifact, and closed `DeepDive` disclosures. Add a typed media contract and focused client-side film primitives for accessible playback and the portrait-to-landscape matched cut; compose the approved nine-part story in MDX, with dark cinematic bands before a coral turn and a light twelve-column evidence field after it. Missing source recordings remain an explicit publication gate: development renders inspected static fallbacks, while publication verification cannot pass until the four native source clips, posters, captions, and manifest records are present.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, MDX, CSS Modules, Vitest, Testing Library, Playwright, Node asset scripts, native HTML video.

---

## File Map

- Create `components/meeting/meeting-film.tsx`: client-side Product Film primitives, playback state, media-error fallback, and two-source matched orientation transition.
- Create `components/meeting/meeting-film.module.css`: cinematic media geometry, orientation interpolation, reduced-motion behavior, and responsive film framing.
- Create `components/meeting/meeting-film-contract.ts`: typed, locale-aware source inventory used by the layout and MDX without pretending unavailable clips exist.
- Create `tests/component/meeting-film.test.tsx`: behavior tests for clip fallback, accessible controls, source swapping, and error handling.
- Create `tests/unit/meeting-film-contract.test.ts`: contract tests that make missing source footage a visible publication state.
- Modify `components/meeting/meeting-layout.tsx`: replace the static image hero with the cold-open film stage while preserving `Agora Meeting` as H1 and the evidence disclosure.
- Modify `components/meeting/meeting-layout.module.css`: establish the dark opening field, bounded hero, tonal turn, and light evidence field.
- Modify `components/meeting/meeting-evidence.tsx`: reuse the existing accessible `MeetingVideo`, Breakout artifact, and static evidence in the editorial half.
- Modify `components/meeting/meeting-evidence.module.css`: add the paired orientation keyframe and evidence-boundary layouts.
- Modify `components/meeting/meeting-showcase.tsx`: add concise chapter/title primitives and the coral tonal-turn intermission; keep `DeepDive` closed by default.
- Modify `components/meeting/meeting-showcase.module.css`: style the film titles, challenge triggers, turn, and evidence grid without card nesting.
- Modify `components/meeting/meeting-print.css`: replace all moving media with posters, open rationale disclosures, and remove cinematic viewport constraints.
- Modify `content/work/meeting.en.mdx`: compose the approved nine-part English story and preserve the legacy anchors and design rationale.
- Modify `content/work/meeting.zh.mdx`: mirror the same architecture and evidence boundaries in Chinese.
- Modify `evidence/meeting/manifest.json`: declare the four Product Film source clips, posters, and captions with explicit readiness fields.
- Modify `scripts/prepare-meeting-assets.mjs`: prepare available assets in development and fail publication preparation when required film sources are absent.
- Modify `scripts/validate-publication.mjs`: validate Product Film readiness and remove hard-coded dependence on the two superseded demo names.
- Modify `tests/unit/meeting-assets.test.ts`: test manifest readiness, source containment, derivatives, and the publication gate.
- Modify `tests/unit/meeting-content.test.ts`: test the nine-part bilingual architecture, copy limits, claim boundaries, anchors, and hidden rationale.
- Modify `tests/component/meeting-layout.test.tsx`: test the film hero and front-half/back-half layout contract.
- Modify `tests/component/meeting-evidence.test.tsx`: test static orientation comparison and evidence boundary semantics.
- Modify `tests/e2e/meeting.spec.ts`: test both locales, playback fallbacks, stable anchors, reduced motion, print, and responsive geometry.

### Task 1: Lock The Nine-Part Narrative Contract

**Files:**
- Modify: `tests/unit/meeting-content.test.ts`
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`

- [ ] **Step 1: Replace the six-band expectations with the approved nine chapter IDs and visible-copy guardrails**

```ts
const chapterIds = [
  'cold-open',
  'challenge',
  'stage-adapts',
  'content-takes-stage',
  'information-follows',
  'the-turn',
  'system-reveal',
  'shipped-evidence',
  'reflection',
];

const legacyAnchorIds = [
  'product-overview',
  'business-context',
  'design-challenge',
  'adaptive-stage',
  'whiteboard-workspace',
  'information-layer',
  'system-strategy',
  'system-delivery',
  'capability-impact',
];

it.each(['en', 'zh'] as const)('uses the approved %s Product Film architecture', (locale) => {
  const source = readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8');
  const entry = contentEntries.find(
    ({ meta }) => meta.slug === 'meeting' && meta.locale === locale,
  );

  expect(entry?.meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
  expect(source.match(/data-product-film-chapter/g)).toHaveLength(9);
  expect(source.match(/data-film-act/g)).toHaveLength(3);
  expect(source.match(/<DeepDive\s+locale=/g)).toHaveLength(6);
  expect(source).not.toMatch(/3-minute|10-minute|hiring evaluation|QA contract/i);
  expect(source).not.toMatch(/3 分钟|10 分钟|招聘者评估|测试合同/);
  expect(source).not.toMatch(/Host Focus|Personal Pin|主持人聚焦|个人 Pin/i);

  for (const id of legacyAnchorIds) {
    expect(source).toContain(`id="${id}" data-anchor-alias`);
  }
});
```

- [ ] **Step 2: Run the content test and verify the old six-band page fails**

Run: `npm test -- tests/unit/meeting-content.test.ts`

Expected: FAIL because the metadata still exposes six old chapter IDs and the MDX contains no `data-product-film-chapter` markers.

- [ ] **Step 3: Update both metadata chapter arrays and add the nine empty semantic section shells around the existing content**

Use these exact IDs and concise navigation labels; retain `title: 'Agora Meeting'`, the current proposition, role, duration, status, disclosure, neighbors, and all legacy anchor spans.

```ts
chapters: [
  { id: 'cold-open', label: 'Product' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'stage-adapts', label: 'Stage' },
  { id: 'content-takes-stage', label: 'Content' },
  { id: 'information-follows', label: 'Information' },
  { id: 'the-turn', label: 'System' },
  { id: 'system-reveal', label: 'Rules' },
  { id: 'shipped-evidence', label: 'Evidence' },
  { id: 'reflection', label: 'Reflection' },
],
```

Chinese labels:

```ts
chapters: [
  { id: 'cold-open', label: '产品' },
  { id: 'challenge', label: '挑战' },
  { id: 'stage-adapts', label: '舞台' },
  { id: 'content-takes-stage', label: '内容' },
  { id: 'information-follows', label: '信息' },
  { id: 'the-turn', label: '系统转场' },
  { id: 'system-reveal', label: '规则' },
  { id: 'shipped-evidence', label: '证据' },
  { id: 'reflection', label: '反思' },
],
```

Each top-level section must use this shape so navigation, E2E selectors, and print styles share one contract:

```mdx
<section id="stage-adapts" data-product-film-chapter data-film-act>
  <span id="adaptive-stage" data-anchor-alias />
  <header className="section-heading"><h2>The stage adapts.</h2></header>
</section>
```

- [ ] **Step 4: Run the content test and verify the structural contract passes**

Run: `npm test -- tests/unit/meeting-content.test.ts`

Expected: PASS for chapter order, legacy anchors, absence of internal planning language, and absence of Host Focus and Personal Pin.

- [ ] **Step 5: Commit the narrative skeleton**

```bash
git add tests/unit/meeting-content.test.ts content/work/meeting.en.mdx content/work/meeting.zh.mdx
git commit -m "refactor: define Meeting Product Film chapters"
```

### Task 2: Establish The Media Intake And Publication Contract

**Files:**
- Create: `components/meeting/meeting-film-contract.ts`
- Create: `tests/unit/meeting-film-contract.test.ts`
- Modify: `evidence/meeting/manifest.json`
- Modify: `tests/unit/meeting-assets.test.ts`
- Modify: `scripts/prepare-meeting-assets.mjs`
- Modify: `scripts/validate-publication.mjs`

- [ ] **Step 1: Write contract tests for the four native recordings and the explicit source gate**

```ts
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { meetingFilmClips, meetingFilmReady } from '@/components/meeting/meeting-film-contract';

const expected = [
  'meeting-stage-portrait',
  'meeting-stage-landscape',
  'meeting-whiteboard-share',
  'meeting-information-layer',
];

describe('Meeting Product Film source contract', () => {
  it('declares one native source per approved film beat', () => {
    expect(Object.keys(meetingFilmClips)).toEqual(expected);
    for (const clip of Object.values(meetingFilmClips)) {
      expect(clip.src).toMatch(/^\/videos\/meeting\/.+\.mp4$/);
      expect(clip.poster).toMatch(/^\/images\/meeting\/.+\.webp$/);
      expect(clip.captions.en).toMatch(/^\/captions\/meeting\/.+\.en\.vtt$/);
      expect(clip.captions.zh).toMatch(/^\/captions\/meeting\/.+\.zh\.vtt$/);
      expect(clip.fallback.en.length).toBeGreaterThan(20);
      expect(clip.fallback.zh.length).toBeGreaterThan(8);
    }
  });

  it('does not report publication readiness before every original is supplied', () => {
    const allSourcesExist = Object.values(meetingFilmClips).every((clip) =>
      existsSync(path.join(process.cwd(), 'evidence/meeting/source', clip.sourceFile)),
    );
    expect(meetingFilmReady).toBe(allSourcesExist);
  });
});
```

- [ ] **Step 2: Run the contract test and verify the module is missing**

Run: `npm test -- tests/unit/meeting-film-contract.test.ts`

Expected: FAIL with `Failed to resolve import '@/components/meeting/meeting-film-contract'`.

- [ ] **Step 3: Add the typed inventory with native orientation metadata and inspected static fallbacks**

```ts
import { existsSync } from 'node:fs';
import path from 'node:path';

export interface MeetingFilmClip {
  readonly sourceFile: string;
  readonly src: string;
  readonly poster: string;
  readonly captions: { readonly en: string; readonly zh: string };
  readonly fallback: { readonly en: string; readonly zh: string };
  readonly orientation: 'portrait' | 'landscape';
}

export const meetingFilmClips = {
  'meeting-stage-portrait': {
    sourceFile: 'meeting-stage-portrait.mp4',
    src: '/videos/meeting/meeting-stage-portrait.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    captions: {
      en: '/captions/meeting/meeting-stage-portrait.en.vtt',
      zh: '/captions/meeting/meeting-stage-portrait.zh.vtt',
    },
    fallback: {
      en: 'Portrait meeting stage before the native orientation change',
      zh: '原生横竖屏切换前的手机竖屏会议舞台',
    },
    orientation: 'portrait',
  },
  'meeting-stage-landscape': {
    sourceFile: 'meeting-stage-landscape.mp4',
    src: '/videos/meeting/meeting-stage-landscape.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
    captions: {
      en: '/captions/meeting/meeting-stage-landscape.en.vtt',
      zh: '/captions/meeting/meeting-stage-landscape.zh.vtt',
    },
    fallback: {
      en: 'Landscape meeting stage after the native orientation change',
      zh: '原生横竖屏切换后的手机横屏会议舞台',
    },
    orientation: 'landscape',
  },
  'meeting-whiteboard-share': {
    sourceFile: 'meeting-whiteboard-share.mp4',
    src: '/videos/meeting/meeting-whiteboard-share.mp4',
    poster: '/images/meeting/whiteboard-multidevice.webp',
    captions: {
      en: '/captions/meeting/meeting-whiteboard-share.en.vtt',
      zh: '/captions/meeting/meeting-whiteboard-share.zh.vtt',
    },
    fallback: {
      en: 'Whiteboard workspace keeps the canvas primary across devices',
      zh: '白板工作区在不同终端中保持画布为主位',
    },
    orientation: 'landscape',
  },
  'meeting-information-layer': {
    sourceFile: 'meeting-information-layer.mp4',
    src: '/videos/meeting/meeting-information-layer.mp4',
    poster: '/images/meeting/transcript-poster.webp',
    captions: {
      en: '/captions/meeting/meeting-information-layer.en.vtt',
      zh: '/captions/meeting/meeting-information-layer.zh.vtt',
    },
    fallback: {
      en: 'Captions, translation, and chat move around the current task',
      zh: '字幕、翻译与聊天围绕当前任务出现、移动和收起',
    },
    orientation: 'portrait',
  },
} as const satisfies Record<string, MeetingFilmClip>;

export const meetingFilmReady = Object.values(meetingFilmClips).every((clip) =>
  existsSync(path.join(process.cwd(), 'evidence/meeting/source', clip.sourceFile)),
);
```

- [ ] **Step 4: Extend manifest schema tests before editing the manifest**

Add `publicationRequired?: boolean` and `readiness: 'ready' | 'awaiting-source'` to `MeetingAsset`, then assert the four new video records have `publicationRequired: true`, unique outputs, native filenames, localized captions, and `readiness` derived from source existence. Do not make `generates non-empty public derivatives` require outputs for `awaiting-source` records.

```ts
const filmIds = [
  'meeting-stage-portrait',
  'meeting-stage-landscape',
  'meeting-whiteboard-share',
  'meeting-information-layer',
];

it('treats source recordings as a publication gate', () => {
  const { assets } = loadManifest();
  const clips = assets.filter(({ id }) => filmIds.includes(id));
  expect(clips).toHaveLength(4);
  for (const clip of clips) {
    expect(clip.publicationRequired).toBe(true);
    expect(clip.readiness).toBe(
      existsSync(path.join(root, clip.source)) ? 'ready' : 'awaiting-source',
    );
  }
});
```

- [ ] **Step 5: Run asset tests and verify the four manifest records are absent**

Run: `npm test -- tests/unit/meeting-assets.test.ts`

Expected: FAIL because `clips` has length 0 instead of 4.

- [ ] **Step 6: Add the four records to `evidence/meeting/manifest.json` without fabricating binary files**

Each record uses this complete shape, with the corresponding filename, poster, caption paths, and purpose from `meetingFilmClips`:

```json
{
  "id": "meeting-stage-portrait",
  "kind": "video",
  "source": "evidence/meeting/source/meeting-stage-portrait.mp4",
  "output": "public/videos/meeting/meeting-stage-portrait.mp4",
  "poster": "/images/meeting/adaptive-layout-poster.webp",
  "captions": {
    "en": "/captions/meeting/meeting-stage-portrait.en.vtt",
    "zh": "/captions/meeting/meeting-stage-portrait.zh.vtt"
  },
  "purpose": "Show the native portrait meeting stage before the matched orientation transition.",
  "publicationRequired": true,
  "readiness": "awaiting-source"
}
```

Add the remaining records with these exact values; every caption object follows the basename shown and appends `.en.vtt` and `.zh.vtt` under `/captions/meeting/`.

| ID | Source | Output | Poster | Purpose |
|---|---|---|---|---|
| `meeting-stage-landscape` | `evidence/meeting/source/meeting-stage-landscape.mp4` | `public/videos/meeting/meeting-stage-landscape.mp4` | `/images/meeting/adaptive-layout-poster.webp` | Show the upright native landscape meeting stage after the matched orientation transition. |
| `meeting-whiteboard-share` | `evidence/meeting/source/meeting-whiteboard-share.mp4` | `public/videos/meeting/meeting-whiteboard-share.mp4` | `/images/meeting/whiteboard-multidevice.webp` | Show shared content becoming primary while participant awareness moves to support. |
| `meeting-information-layer` | `evidence/meeting/source/meeting-information-layer.mp4` | `public/videos/meeting/meeting-information-layer.mp4` | `/images/meeting/transcript-poster.webp` | Show captions, translation, and chat appearing, moving, and collapsing around the current task. |

Until originals are supplied, all four records use `"publicationRequired": true` and `"readiness": "awaiting-source"`; this label is internal manifest state and is not visible page copy.

- [ ] **Step 7: Make preparation mode explicit and publication-strict**

Change the exported signature and CLI parsing:

```js
export async function prepareMeetingAssets({ staticOnly = false, publication = false } = {}) {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('Meeting manifest must use version 1 with an assets array');
  }
  const missingRequired = [];
  const outputs = [];

  for (const asset of manifest.assets) {
    if (staticOnly && asset.kind !== 'image') continue;
    const source = resolveContained(asset.source, 'evidence/meeting/source/');
    const output = resolveContained(asset.output, 'public/');
    try {
      await fs.access(source);
    } catch {
      if (asset.publicationRequired) missingRequired.push(asset.source);
      continue;
    }
    await fs.mkdir(path.dirname(output), { recursive: true });
    if (asset.kind === 'image') {
      await sharp(source).webp({ quality: 88, effort: 6 }).toFile(output);
    } else {
      await fs.copyFile(source, output);
    }
    outputs.push(asset.output);
  }

  if (publication && missingRequired.length > 0) {
    throw new Error(`Meeting Product Film sources required for publication:\n${missingRequired.join('\n')}`);
  }
  return outputs;
}

const staticOnly = process.argv.includes('--static-only');
const publication = process.argv.includes('--publication');
prepareMeetingAssets({ staticOnly, publication })
```

Update publication validation to derive required Meeting paths from manifest records where `publicationRequired === true`; development validation reports the missing list but does not label the page as shipped footage. Source/output validation fails with the exact prefix `Meeting Product Film sources required for publication:`.

- [ ] **Step 8: Run focused tests and verify development fallback passes while publication preparation fails honestly**

Run: `npm test -- tests/unit/meeting-film-contract.test.ts tests/unit/meeting-assets.test.ts`

Expected: PASS.

Run: `node scripts/prepare-meeting-assets.mjs --static-only`

Expected: PASS and print a non-zero count of prepared static assets.

Run: `node scripts/prepare-meeting-assets.mjs --publication`

Expected before source intake: FAIL listing the four missing original MP4 paths. This failure is the correct publication gate and must not be bypassed with copied, generated, or empty files.

- [ ] **Step 9: Commit the source contract**

```bash
git add components/meeting/meeting-film-contract.ts tests/unit/meeting-film-contract.test.ts evidence/meeting/manifest.json tests/unit/meeting-assets.test.ts scripts/prepare-meeting-assets.mjs scripts/validate-publication.mjs
git commit -m "feat: define Meeting Product Film media contract"
```

### Task 3: Build The Accessible Film Clip Primitive

**Files:**
- Create: `components/meeting/meeting-film.tsx`
- Create: `components/meeting/meeting-film.module.css`
- Create: `tests/component/meeting-film.test.tsx`

- [ ] **Step 1: Write failing tests for accessible playback and deterministic fallback**

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ProductFilmClip } from '@/components/meeting/meeting-film';

afterEach(() => document.documentElement.removeAttribute('data-reduce-motion'));

const props = {
  src: '/videos/meeting/meeting-whiteboard-share.mp4',
  poster: '/images/meeting/whiteboard-multidevice.webp',
  captions: '/captions/meeting/meeting-whiteboard-share.en.vtt',
  title: 'Content takes the stage',
  description: 'The canvas becomes primary while participants remain present.',
  fallbackAlt: 'Whiteboard workspace across four device classes',
};

describe('ProductFilmClip', () => {
  it('renders muted inline media with captions and a named replay control', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    const video = container.querySelector('video');
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('poster', props.poster);
    expect(container.querySelector('track[kind="captions"]')).toHaveAttribute('src', props.captions);
    expect(screen.getByRole('button', { name: 'Replay Content takes the stage' })).toBeVisible();
  });

  it('replaces failed media with the inspected poster and description', () => {
    const { container } = render(<ProductFilmClip {...props} />);
    fireEvent.error(container.querySelector('video')!);
    expect(screen.getByRole('img', { name: props.fallbackAlt })).toBeVisible();
    expect(screen.getByText(props.description)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run the test and verify the component is missing**

Run: `npm test -- tests/component/meeting-film.test.tsx`

Expected: FAIL with an unresolved `meeting-film` import.

- [ ] **Step 3: Implement the minimal client component with native controls plus a visible replay command**

```tsx
'use client';

import { RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';

import styles from './meeting-film.module.css';

interface ProductFilmClipProps {
  readonly src: string;
  readonly poster: string;
  readonly captions: string;
  readonly title: string;
  readonly description: string;
  readonly fallbackAlt: string;
}

export function ProductFilmClip(props: ProductFilmClipProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const descriptionId = `film-${props.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const replay = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    void videoRef.current.play().catch(() => undefined);
  };

  return (
    <figure className={styles.clip} data-product-film-clip>
      <div className={styles.media}>
        {failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.poster} alt={props.fallbackAlt} />
        ) : (
          <video
            ref={videoRef}
            src={props.src}
            poster={props.poster}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
            aria-label={props.title}
            aria-describedby={descriptionId}
            onError={() => setFailed(true)}
          >
            <track kind="captions" src={props.captions} srcLang="en" label="Captions" default />
          </video>
        )}
      </div>
      <figcaption id={descriptionId}>{props.description}</figcaption>
      {!failed && (
        <button type="button" onClick={replay} aria-label={`Replay ${props.title}`} title={`Replay ${props.title}`}>
          <RotateCcw aria-hidden="true" size={18} />
        </button>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Add stable media geometry and reduced-motion poster behavior**

```css
.clip { position: relative; min-width: 0; margin: 0; letter-spacing: 0; }
.media { overflow: hidden; aspect-ratio: 16 / 9; background: #080a0c; }
.media video,
.media img { display: block; width: 100%; height: 100%; object-fit: contain; }
.clip figcaption { margin-top: 0.75rem; color: #a7aaad; font-size: 0.8rem; line-height: 1.5; }
.clip button { position: absolute; right: 0.75rem; bottom: 2.75rem; display: grid; width: 44px; height: 44px; place-items: center; border: 1px solid #5b6065; border-radius: 4px; color: #fff; background: #111315; }
.clip button:focus-visible { outline: 2px solid #e4583e; outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .media video { animation: none; }
}
```

- [ ] **Step 5: Run the component tests**

Run: `npm test -- tests/component/meeting-film.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit the film primitive**

```bash
git add components/meeting/meeting-film.tsx components/meeting/meeting-film.module.css tests/component/meeting-film.test.tsx
git commit -m "feat: add accessible Meeting film clip"
```

### Task 4: Build The Two-Source Orientation Matched Cut

**Files:**
- Modify: `components/meeting/meeting-film.tsx`
- Modify: `components/meeting/meeting-film.module.css`
- Modify: `tests/component/meeting-film.test.tsx`

- [ ] **Step 1: Write failing tests for midpoint source swap and upright native video**

```tsx
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const orientationProps = {
  portrait: {
    src: '/videos/meeting/meeting-stage-portrait.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
  },
  landscape: {
    src: '/videos/meeting/meeting-stage-landscape.mp4',
    poster: '/images/meeting/adaptive-layout-poster.webp',
  },
  captions: '/captions/meeting/meeting-stage-portrait.en.vtt',
  title: 'Stage adapts through orientation',
  fallbackAlt: 'Portrait and landscape stage keyframes',
};

it('swaps native sources at the midpoint without rotating video pixels', () => {
  const { container } = render(
    <OrientationMatchedCut
      portrait={{ src: '/videos/meeting/meeting-stage-portrait.mp4', poster: '/images/meeting/adaptive-layout-poster.webp' }}
      landscape={{ src: '/videos/meeting/meeting-stage-landscape.mp4', poster: '/images/meeting/adaptive-layout-poster.webp' }}
      captions="/captions/meeting/meeting-stage-portrait.en.vtt"
      title="Stage adapts through orientation"
      fallbackAlt="Portrait and landscape stage keyframes"
    />,
  );

  fireEvent.click(screen.getByRole('button', { name: 'Show landscape stage' }));
  expect(container.querySelector('video')).toHaveAttribute('src', '/videos/meeting/meeting-stage-portrait.mp4');
  act(() => vi.advanceTimersByTime(300));
  expect(container.querySelector('video')).toHaveAttribute('src', '/videos/meeting/meeting-stage-landscape.mp4');
  expect(container.querySelector('[data-orientation-frame]')).toHaveAttribute('data-orientation', 'landscape');
});

it('uses a side-by-side static comparison when reduced motion is requested', () => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockReturnValue({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  });
  render(<OrientationMatchedCut {...orientationProps} />);
  expect(screen.getByTestId('orientation-static-comparison')).toBeVisible();
});
```

- [ ] **Step 2: Run the focused test and verify the export is absent**

Run: `npm test -- tests/component/meeting-film.test.tsx`

Expected: FAIL because `OrientationMatchedCut` is not exported.

- [ ] **Step 3: Implement the matched-cut state machine with a 600ms frame transition and a 300ms native source swap**

```tsx
interface OrientationSource { readonly src: string; readonly poster: string }

interface OrientationMatchedCutProps {
  readonly portrait: OrientationSource;
  readonly landscape: OrientationSource;
  readonly captions: string;
  readonly title: string;
  readonly fallbackAlt: string;
}

export function OrientationMatchedCut(props: OrientationMatchedCutProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [source, setSource] = useState(props.portrait);
  const [failed, setFailed] = useState(false);
  const reduced = useReducedMotion();

  const changeOrientation = (next: 'portrait' | 'landscape') => {
    setOrientation(next);
    window.setTimeout(() => setSource(next === 'portrait' ? props.portrait : props.landscape), 300);
  };

  if (reduced || failed) {
    return (
      <figure className={styles.orientationComparison} data-testid="orientation-static-comparison">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.portrait.poster} alt={`${props.fallbackAlt}, portrait`} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.landscape.poster} alt={`${props.fallbackAlt}, landscape`} />
      </figure>
    );
  }

  return (
    <figure className={styles.orientationCut}>
      <div className={styles.orientationFrame} data-orientation-frame data-orientation={orientation}>
        <video key={source.src} src={source.src} poster={source.poster} autoPlay muted playsInline controls preload="metadata" aria-label={props.title} onError={() => setFailed(true)}>
          <track kind="captions" src={props.captions} srcLang="en" label="Captions" default />
        </video>
      </div>
      <div className={styles.orientationControls} aria-label="Meeting stage orientation">
        <button type="button" aria-pressed={orientation === 'portrait'} onClick={() => changeOrientation('portrait')}>Portrait</button>
        <button type="button" aria-pressed={orientation === 'landscape'} aria-label="Show landscape stage" onClick={() => changeOrientation('landscape')}>Landscape</button>
      </div>
    </figure>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}
```

- [ ] **Step 4: Add aspect-ratio interpolation while explicitly leaving video untransformed**

```css
.orientationFrame { width: min(100%, 25rem); aspect-ratio: 9 / 16; margin-inline: auto; overflow: hidden; background: #080a0c; transition: width 600ms ease, aspect-ratio 600ms ease; }
.orientationFrame[data-orientation='landscape'] { width: min(100%, 64rem); aspect-ratio: 16 / 9; }
.orientationFrame video { display: block; width: 100%; height: 100%; object-fit: contain; transform: none; }
.orientationControls { display: flex; justify-content: center; margin-top: 1rem; }
.orientationControls button { min-height: 44px; padding: 0.65rem 1rem; border: 1px solid #5b6065; color: #fff; background: #111315; }
.orientationControls button[aria-pressed='true'] { color: #111315; background: #fff; }
.orientationComparison { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr); gap: 1rem; align-items: center; }
.orientationComparison img { display: block; width: 100%; height: auto; object-fit: contain; }
@media (max-width: 720px) { .orientationComparison { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { .orientationFrame { transition: none; } }
```

- [ ] **Step 5: Run film component tests**

Run: `npm test -- tests/component/meeting-film.test.tsx`

Expected: PASS; the frame changes aspect ratio, the source swaps after 300ms, and no CSS transform rotates the video.

- [ ] **Step 6: Commit the matched cut**

```bash
git add components/meeting/meeting-film.tsx components/meeting/meeting-film.module.css tests/component/meeting-film.test.tsx
git commit -m "feat: add native Meeting orientation matched cut"
```

### Task 5: Reshape The Hero And Cinematic First Half

**Files:**
- Modify: `components/meeting/meeting-layout.tsx`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-showcase.tsx`
- Modify: `components/meeting/meeting-showcase.module.css`
- Modify: `tests/component/meeting-layout.test.tsx`
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`

- [ ] **Step 1: Write layout tests for the cold-open film and tonal turn**

```tsx
it('keeps Agora Meeting as H1 and presents the Product Film cold open', () => {
  render(<MeetingLayout meta={meta} locale="en"><section id="challenge" /></MeetingLayout>);
  expect(screen.getByRole('heading', { level: 1, name: 'Agora Meeting' })).toBeVisible();
  expect(document.querySelector('[data-meeting-cold-open]')).not.toBeNull();
  expect(document.querySelector('[data-meeting-hero] video, [data-meeting-hero] img')).not.toBeNull();
  expect(screen.getByTestId('meeting-scope-line')).toHaveTextContent('Sole Product Designer');
  expect(document.querySelector('[data-meeting-disclosure]')).not.toBeNull();
});

it('uses dark film tokens before the light evidence field', () => {
  const css = readFileSync('components/meeting/meeting-layout.module.css', 'utf8');
  expect(css).toMatch(/--meeting-film-bg:\s*#(?:080a0c|0b0d0f)/i);
  expect(css).toMatch(/\[data-product-film-chapter\]\[data-film-act\]/);
  expect(css).toMatch(/\[data-product-film-chapter\]\[data-evidence-chapter\]/);
  expect(css).not.toMatch(/linear-gradient|radial-gradient/);
});
```

- [ ] **Step 2: Run layout tests and verify the cold-open contract fails**

Run: `npm test -- tests/component/meeting-layout.test.tsx`

Expected: FAIL because the hero is still a static editorial image and the film/evidence tokens do not exist.

- [ ] **Step 3: Render the cold-open through `ProductFilmClip` with an honest fallback**

Import `ProductFilmClip` and `meetingFilmClips`; select `meeting-stage-landscape` for the 10-12 second loop. Pass the locale-specific caption and fallback text. Keep the scope line and disclosure in the hero, and add `data-meeting-cold-open` to its media wrapper. When `meetingFilmReady` is false, render the poster image and do not render a broken source URL or claim that the page is showing supplied product footage.

```tsx
<figure className={styles.heroMedia} data-meeting-cold-open>
  {meetingFilmReady ? (
    <ProductFilmClip
      src={heroClip.src}
      poster={heroClip.poster}
      captions={heroClip.captions[locale]}
      title={locale === 'zh' ? 'Agora Meeting 产品片开场' : 'Agora Meeting product film opening'}
      description={text.heroCaption}
      fallbackAlt={heroClip.fallback[locale]}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={meta.heroMedia} alt={text.heroAlt} width={2400} height={1430} />
  )}
</figure>
```

- [ ] **Step 4: Add concise chapter primitives instead of long visible explanation**

```tsx
export function FilmTitle({ index, title, line }: { readonly index: string; readonly title: string; readonly line: string }) {
  return <header className={styles.filmTitle}><span>{index}</span><h2>{title}</h2><p>{line}</p></header>;
}

export function ChallengeTriggers({ locale }: { readonly locale: Locale }) {
  const rows = locale === 'zh'
    ? [['01', '参会者'], ['02', '当前内容'], ['03', '设备环境']]
    : [['01', 'People'], ['02', 'Current content'], ['03', 'Device context']];
  return <ol className={styles.triggers}>{rows.map(([number, label]) => <li key={number}><span>{number}</span><strong>{label}</strong></li>)}</ol>;
}

export function FilmTurn({ locale }: { readonly locale: Locale }) {
  return <div className={styles.turn} data-film-turn><span>05</span><h2>{locale === 'zh' ? '镜头背后，是一套优先级系统。' : 'Behind the film is a system of priorities.'}</h2></div>;
}
```

- [ ] **Step 5: Compose chapters 00-05 with one idea per viewport**

Use these visible titles and single-line arguments; longer rationale stays in the existing closed `DeepDive` blocks.

```mdx
<section id="challenge" data-product-film-chapter data-film-act>
  <span id="business-context" data-anchor-alias />
  <span id="design-challenge" data-anchor-alias />
  <FilmTitle index="01" title="A meeting changes faster than a fixed interface." line="People, content, and device context can change within seconds." />
  <ChallengeTriggers locale="en" />
</section>

<section id="stage-adapts" data-product-film-chapter data-film-act>
  <span id="adaptive-stage" data-anchor-alias />
  <FilmTitle index="02" title="The stage adapts." line="The interface changes priority before it changes layout." />
  <OrientationMatchedCut portrait={{ src: '/videos/meeting/meeting-stage-portrait.mp4', poster: '/images/meeting/adaptive-layout-poster.webp' }} landscape={{ src: '/videos/meeting/meeting-stage-landscape.mp4', poster: '/images/meeting/adaptive-layout-poster.webp' }} captions="/captions/meeting/meeting-stage-portrait.en.vtt" title="Stage adapts through orientation" fallbackAlt="Portrait and landscape meeting-stage keyframes" />
  <DeepDive locale="en" title="Why priority comes before layout">
    <p>Participants move continuously between conversation, presentation, creation, and larger meetings.</p>
    <p>Responsive resizing cannot decide whether people, shared content, or the whiteboard belongs on the main stage.</p>
    <p>Screen sharing, whiteboard activation, and participant count change information priority before they change layout.</p>
    <p>The intended effect is continuity through state and orientation changes; no task-success metric is claimed.</p>
  </DeepDive>
</section>

<section id="content-takes-stage" data-product-film-chapter data-film-act>
  <span id="whiteboard-workspace" data-anchor-alias />
  <FilmTitle index="03" title="Content takes the stage." line="The canvas becomes primary; participant awareness moves to support." />
  <ProductFilmClip src="/videos/meeting/meeting-whiteboard-share.mp4" poster="/images/meeting/whiteboard-multidevice.webp" captions="/captions/meeting/meeting-whiteboard-share.en.vtt" title="Content takes the stage" description="The canvas becomes primary while participant awareness moves to a supporting layer." fallbackAlt="Whiteboard workspace across desktop, tablet, portrait mobile, and landscape mobile" />
  <EvidenceFigure src="/images/meeting/whiteboard-multidevice.webp" width={1800} height={1100} alt="Whiteboard workspace across desktop and mobile orientation states" label="Cross-device proof / supporting cut" caption="The same content-priority rule resolves differently across device classes." locale="en" />
  <DeepDive locale="en" title="Why the canvas stays primary">
    <p>Participants need to create and review content while retaining awareness of other people in the meeting.</p>
    <p>Canvas, participant video, and controls compete for limited space, especially in mobile portrait.</p>
    <p>A shared priority rule keeps the canvas primary and determines which participant view remains visible.</p>
    <p>The intended effect is legible work content without losing meeting awareness; no verified task-success evidence is supplied.</p>
  </DeepDive>
</section>

<section id="information-follows" data-product-film-chapter data-film-act>
  <span id="information-layer" data-anchor-alias />
  <FilmTitle index="04" title="Information follows." line="Captions, translation, and chat stay available without replacing the task." />
  <ProductFilmClip src="/videos/meeting/meeting-information-layer.mp4" poster="/images/meeting/transcript-poster.webp" captions="/captions/meeting/meeting-information-layer.en.vtt" title="Information follows the task" description="Captions, translation, and chat appear, move, and collapse around the current task." fallbackAlt="Captions, transcript controls, translation, and bilingual output" />
  <DeepDive locale="en" title="Why captions and transcripts have different owners">
    <p>Participants need live comprehension, translation, and transcript access during a meeting.</p>
    <p>Live Captions are an individual control; the host starts and stops the meeting-level Transcript Panel while participants can request activation.</p>
    <p>Transcript data is exposed through the Customer API; Agora Meeting does not own customer-built post-meeting storage, copy, or download interfaces.</p>
    <p>The intended effect is available information without replacing the task; no comprehension or adoption metric is claimed.</p>
  </DeepDive>
</section>

<section id="the-turn" data-product-film-chapter data-film-act>
  <span id="system-strategy" data-anchor-alias />
  <FilmTurn locale="en" />
</section>
```

Use this exact Chinese visible-copy map with the same IDs and component order. Do not add the internal 3-minute or 10-minute scripts to either page.

```ts
const zhFilmCopy = {
  challenge: { index: '01', title: '会议变化快于固定界面。', line: '参会者、当前内容与设备环境会在数秒内改变。' },
  stage: { index: '02', title: '舞台随情境重组。', line: '界面先改变信息优先级，再改变布局。' },
  content: { index: '03', title: '内容进入主舞台。', line: '画布成为主位，参会者感知移动到支持层。' },
  information: { index: '04', title: '信息跟随任务。', line: '字幕、翻译与聊天保持可用，但不取代当前任务。' },
  turn: '镜头背后，是一套优先级系统。',
} as const;
```

- [ ] **Step 6: Implement dark full-width film bands and the coral turn**

Add `--meeting-film-bg: #080a0c`, `--meeting-film-ink: #f4f5f5`, and `--meeting-paper: #f7f7f5`. Film chapters use the dark field, bounded 12-column inner content, and no gradients; `#the-turn` uses solid coral with dark ink. Use `min-height: min(92svh, 60rem)` only above 720px, and reset it to `auto` for short landscape and print media.

- [ ] **Step 7: Run focused content and layout tests**

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-layout.test.tsx tests/component/meeting-film.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit the cinematic half**

```bash
git add components/meeting/meeting-layout.tsx components/meeting/meeting-layout.module.css components/meeting/meeting-showcase.tsx components/meeting/meeting-showcase.module.css tests/component/meeting-layout.test.tsx content/work/meeting.en.mdx content/work/meeting.zh.mdx
git commit -m "feat: compose Meeting Product Film opening"
```

### Task 6: Compose The Editorial Evidence Half

**Files:**
- Modify: `components/meeting/meeting-evidence.tsx`
- Modify: `components/meeting/meeting-evidence.module.css`
- Modify: `tests/component/meeting-evidence.test.tsx`
- Modify: `content/work/meeting.en.mdx`
- Modify: `content/work/meeting.zh.mdx`

- [ ] **Step 1: Write failing evidence tests for comparison and claim boundary**

```tsx
import { EvidenceBoundary, OrientationEvidence, RoleBoundary } from '@/components/meeting/meeting-evidence';

it('shows native portrait and landscape evidence side by side', () => {
  render(<OrientationEvidence locale="en" />);
  expect(screen.getByRole('heading', { name: 'One meeting, two native orientations' })).toBeVisible();
  expect(screen.getAllByRole('img')).toHaveLength(2);
  expect(screen.getByText(/portfolio swaps native sources/i)).toBeVisible();
});

it('states what is proven and what remains unverified', () => {
  render(<EvidenceBoundary locale="en" />);
  expect(screen.getByText('Verified here')).toBeVisible();
  expect(screen.getByText(/production delivery across four device classes/i)).toBeVisible();
  expect(screen.getByText('Not claimed')).toBeVisible();
  expect(screen.getByText(/adoption, satisfaction, efficiency, conversion, or business impact/i)).toBeVisible();
});

it('separates design ownership from cross-functional delivery', () => {
  render(<RoleBoundary locale="en" />);
  expect(screen.getByText('Owned')).toBeVisible();
  expect(screen.getByText(/product design across Desktop, Web, tablet, and mobile/i)).toBeVisible();
  expect(screen.getByText('Co-created')).toBeVisible();
  expect(screen.getByText(/product, engineering, QA, and customer teams/i)).toBeVisible();
  expect(screen.getByText('Out of scope')).toBeVisible();
  expect(screen.getByText(/customer-built post-meeting interfaces/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the evidence test and verify the exports are absent**

Run: `npm test -- tests/component/meeting-evidence.test.tsx`

Expected: FAIL because `OrientationEvidence` and `EvidenceBoundary` are not exported.

- [ ] **Step 3: Implement the two compact evidence components**

`OrientationEvidence` renders the existing inspected adaptive-stage poster twice with distinct `object-position` values until native frame exports are supplied; its note explicitly distinguishes product orientation behavior from the portfolio matched cut. `EvidenceBoundary` renders a semantic `<dl>` with exactly two rows, `Verified here` / `本页可验证` and `Not claimed` / `不作声明`, using the copy asserted above.

```tsx
export function EvidenceBoundary({ locale }: { readonly locale: Locale }) {
  const rows = locale === 'zh'
    ? [['本页可验证', '四类终端的生产交付、界面规则与 Figma 决策证据。'], ['不作声明', '缺少证据的采用率、满意度、效率、转化或业务影响。']]
    : [['Verified here', 'Production delivery across four device classes, interface rules, and Figma decision evidence.'], ['Not claimed', 'Adoption, satisfaction, efficiency, conversion, or business impact without supporting evidence.']];
  return <dl className={styles.evidenceBoundary}>{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>;
}

export function RoleBoundary({ locale }: { readonly locale: Locale }) {
  const rows = locale === 'zh'
    ? [['负责', '桌面客户端、Web、平板和手机端的产品设计。'], ['共同交付', '与产品、工程、测试和客户团队协作完成生产交付。'], ['范围之外', '客户自行建设的会后存储、复制与下载界面。']]
    : [['Owned', 'Product design across Desktop, Web, tablet, and mobile.'], ['Co-created', 'Production delivery with product, engineering, QA, and customer teams.'], ['Out of scope', 'Customer-built post-meeting storage, copy, and download interfaces.']];
  return <dl className={styles.roleBoundary}>{rows.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>;
}
```

- [ ] **Step 4: Compose chapters 06-08 from existing evidence instead of duplicating rationale**

```mdx
<section id="system-reveal" data-product-film-chapter data-evidence-chapter>
  <FilmTitle index="06" title="Context sets priority. Priority shapes interface." line="One rule connects people, content, roles, and device conditions." />
  <ContextPriorityModel locale="en" />
  <OrientationEvidence locale="en" />
  <MeetingStateMatrix locale="en" />
  <ParticipantPriorityStack locale="en" />
  <LanguageControlModel locale="en" />
</section>

<section id="shipped-evidence" data-product-film-chapter data-evidence-chapter>
  <span id="system-delivery" data-anchor-alias />
  <span id="capability-impact" data-anchor-alias />
  <FilmTitle index="07" title="Shipped across four device classes." line="Delivery is the supported outcome; the evidence boundary stays explicit." />
  <ShowcaseProof locale="en" />
  <CapabilitySystem locale="en" />
  <BreakoutDecisionEvidence locale="en" />
  <RoleBoundary locale="en" />
  <EvidenceBoundary locale="en" />
  <DeepDive locale="en" title="How defaults and edge states support delivery">
    <p>High-coverage needs became shared defaults, while recurring customer differences became configurable capabilities.</p>
    <p>Supporting workflows reuse the same role, permission, and state logic as the three signature experiences.</p>
    <p>Breakout Room rules make capacity, naming, feedback, and deletion states explicit enough for product, engineering, and QA to evaluate.</p>
    <p>The verified outcome is production delivery across four device classes against customer business requirements.</p>
  </DeepDive>
</section>

<section id="reflection" data-product-film-chapter data-evidence-chapter>
  <FilmTitle index="08" title="Govern the system earlier." line="Shared state definitions and component ownership should precede cross-device scale." />
  <DeepDive locale="en" title="What I would change next">
    <p>Similar components were maintained repeatedly across client and Web surfaces, increasing the cost of keeping states aligned.</p>
    <p>In a second iteration, I would establish shared state definitions, ownership, and component governance earlier: one source for interaction rules, explicit platform exceptions, and cross-device review before release.</p>
  </DeepDive>
</section>
```

Use this exact Chinese evidence-copy map with the same component order. Keep all six `DeepDive` sections closed by default and retain the current detailed paragraphs about customer-requirement inputs, product/API boundary, role distinction, and component governance.

```ts
const zhEvidenceCopy = {
  system: { index: '06', title: '情境决定优先级，优先级塑造界面。', line: '一条规则连接参会者、内容、角色与设备环境。' },
  shipped: { index: '07', title: '完成四类终端的生产交付。', line: '交付是可验证结果，证据边界保持明确。' },
  reflection: { index: '08', title: '更早治理跨端系统。', line: '共享状态定义与组件所有权应早于跨端扩张。' },
} as const;
```

- [ ] **Step 5: Add a stable twelve-column evidence grid and responsive comparison**

```css
.orientationEvidence { display: grid; grid-template-columns: minmax(0, 0.72fr) minmax(0, 1.28fr); gap: 1rem; align-items: end; margin-block: 3rem; }
.orientationEvidence figure { margin: 0; min-width: 0; }
.orientationEvidence img { display: block; width: 100%; height: auto; border: 1px solid var(--meeting-line); }
.evidenceBoundary,
.roleBoundary { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-block: 3rem; border-block: 1px solid var(--meeting-line); }
.roleBoundary { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.evidenceBoundary div { min-width: 0; padding: 1.25rem; }
.roleBoundary div { min-width: 0; padding: 1.25rem; }
.evidenceBoundary div + div,
.roleBoundary div + div { border-left: 1px solid var(--meeting-line); }
@media (max-width: 720px) { .orientationEvidence, .evidenceBoundary, .roleBoundary { grid-template-columns: 1fr; } .evidenceBoundary div + div, .roleBoundary div + div { border-left: 0; border-top: 1px solid var(--meeting-line); } }
```

- [ ] **Step 6: Run content and evidence tests**

Run: `npm test -- tests/unit/meeting-content.test.ts tests/component/meeting-evidence.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the evidence half**

```bash
git add components/meeting/meeting-evidence.tsx components/meeting/meeting-evidence.module.css tests/component/meeting-evidence.test.tsx content/work/meeting.en.mdx content/work/meeting.zh.mdx
git commit -m "feat: reveal Meeting system and shipped evidence"
```

### Task 7: Harden Motion, Error, Print, And Responsive Fallbacks

**Files:**
- Modify: `components/meeting/meeting-film.tsx`
- Modify: `components/meeting/meeting-film.module.css`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-print.css`
- Modify: `tests/component/meeting-film.test.tsx`
- Modify: `tests/component/meeting-layout.test.tsx`
- Modify: `tests/e2e/meeting.spec.ts`

- [ ] **Step 1: Add failing component assertions for autoplay rejection and reduced motion**

```tsx
it('keeps native controls and poster content when autoplay is rejected', async () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(new DOMException('Blocked'));
  const { container } = render(<ProductFilmClip {...props} />);
  expect(container.querySelector('video')).toHaveAttribute('controls');
  expect(container.querySelector('video')).toHaveAttribute('poster', props.poster);
  expect(screen.getByRole('button', { name: `Replay ${props.title}` })).toBeVisible();
  play.mockRestore();
});

it('does not define scroll-linked or perpetual decorative motion', () => {
  const css = readFileSync('components/meeting/meeting-film.module.css', 'utf8');
  expect(css).not.toMatch(/animation-timeline|scroll-timeline|infinite/);
  expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
```

- [ ] **Step 2: Add failing E2E coverage for reduced motion, errors, print, and three viewports**

```ts
test('replaces film motion with useful static evidence in reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/${locale}/work/meeting/`);
  await expect(page.getByTestId('orientation-static-comparison')).toBeVisible();
  await expect(page.locator('[data-product-film-chapter]')).toHaveCount(9);
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
  { width: 1440, height: 1000 },
  { width: 1728, height: 1117 },
]) {
  test(`has stable geometry at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(`/${locale}/work/meeting/`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.getByRole('heading', { level: 1, name: 'Agora Meeting' })).toBeVisible();
    await expect(page.locator('#reflection')).toBeVisible();
  });
}
```

- [ ] **Step 3: Run focused tests and verify the new fallback assertions fail**

Run: `npm test -- tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx`

Expected: FAIL until the final reduced-motion and short-landscape CSS contracts are present.

- [ ] **Step 4: Complete the fallback behavior**

Ensure:

```css
@media (prefers-reduced-motion: reduce) {
  [data-product-film-clip] video { display: none; }
  [data-product-film-clip] img { display: block; }
  [data-orientation-frame] { transition: none !important; }
}

@media (max-height: 42rem) and (min-width: 721px) {
  [data-product-film-chapter][data-film-act] { min-height: auto; padding-block: 4rem; }
}

@media print {
  [data-meeting-case] video,
  [data-meeting-case] button { display: none !important; }
  [data-product-film-chapter] { min-height: auto !important; color: #171717 !important; background: #fff !important; break-inside: auto; }
  [data-meeting-deep-dive] > :not(summary) { display: block !important; }
  [data-meeting-rail] { display: none !important; }
}
```

`ProductFilmClip` must always mount a fallback image in the DOM and toggle it with `hidden`/CSS so reduced motion does not depend on JavaScript. Media errors switch the same fallback into view. Autoplay rejection leaves the poster and native controls usable; it is not treated as a fatal error.

- [ ] **Step 5: Run component and E2E tests**

Run: `npm test -- tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx tests/component/meeting-evidence.test.tsx`

Expected: PASS.

Run: `npm run test:e2e -- tests/e2e/meeting.spec.ts --project=desktop`

Expected: PASS for English and Chinese at mobile portrait, short landscape, and desktop, including reduced-motion and print checks.

- [ ] **Step 6: Commit fallback hardening**

```bash
git add components/meeting/meeting-film.tsx components/meeting/meeting-film.module.css components/meeting/meeting-layout.module.css components/meeting/meeting-print.css tests/component/meeting-film.test.tsx tests/component/meeting-layout.test.tsx tests/e2e/meeting.spec.ts
git commit -m "fix: harden Meeting film fallbacks"
```

### Task 8: Complete Source Intake When The Four Recordings Arrive

**Files:**
- Add: `evidence/meeting/source/meeting-stage-portrait.mp4`
- Add: `evidence/meeting/source/meeting-stage-landscape.mp4`
- Add: `evidence/meeting/source/meeting-whiteboard-share.mp4`
- Add: `evidence/meeting/source/meeting-information-layer.mp4`
- Add: `evidence/meeting/source/meeting-stage-portrait.en.vtt`
- Add: `evidence/meeting/source/meeting-stage-portrait.zh.vtt`
- Add: `evidence/meeting/source/meeting-stage-landscape.en.vtt`
- Add: `evidence/meeting/source/meeting-stage-landscape.zh.vtt`
- Add: `evidence/meeting/source/meeting-whiteboard-share.en.vtt`
- Add: `evidence/meeting/source/meeting-whiteboard-share.zh.vtt`
- Add: `evidence/meeting/source/meeting-information-layer.en.vtt`
- Add: `evidence/meeting/source/meeting-information-layer.zh.vtt`
- Modify: `evidence/meeting/manifest.json`

- [ ] **Step 1: Inspect rather than rename blindly**

Run:

```bash
ffprobe -v error -show_entries stream=codec_name,width,height,duration,avg_frame_rate:format=size -of json evidence/meeting/source/meeting-stage-portrait.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,duration,avg_frame_rate:format=size -of json evidence/meeting/source/meeting-stage-landscape.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,duration,avg_frame_rate:format=size -of json evidence/meeting/source/meeting-whiteboard-share.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,duration,avg_frame_rate:format=size -of json evidence/meeting/source/meeting-information-layer.mp4
```

Expected: portrait width is less than height; landscape and whiteboard width are greater than height; each clip is non-empty, decodable, and between 5 and 30 seconds. Confirm the portrait and landscape pair depicts the same meeting context with 1-2 seconds of overlapping state. If those facts are false, keep the relevant manifest entry at `awaiting-source` and do not publish the matched cut.

- [ ] **Step 2: Add complete WebVTT text access for every clip**

Each file must start with `WEBVTT`, include time ranges matching visible UI changes, and describe meaningful visual state rather than sound. Example structure:

```vtt
WEBVTT

00:00.000 --> 00:03.500
The meeting opens in a portrait participant stage.

00:03.500 --> 00:08.000
Shared content becomes primary while participant awareness remains visible.
```

- [ ] **Step 3: Mark only inspected sources ready and prepare derivatives**

Change each supplied manifest record from `"readiness": "awaiting-source"` to `"readiness": "ready"`, then run:

Run: `node scripts/prepare-meeting-assets.mjs --publication`

Expected after all four originals and caption files are present: PASS and print the prepared Meeting asset count.

- [ ] **Step 4: Verify the publication gate has genuinely cleared**

Run: `npm test -- tests/unit/meeting-film-contract.test.ts tests/unit/meeting-assets.test.ts`

Expected: PASS with `meetingFilmReady === true`, every output larger than 128 bytes, and all required source files present.

- [ ] **Step 5: Commit inspected source evidence and derivatives according to repository media policy**

```bash
git add evidence/meeting/manifest.json evidence/meeting/source public/videos/meeting public/captions/meeting
git commit -m "assets: add Meeting Product Film recordings"
```

This task is blocked until the user supplies the four original recordings. Tasks 1-7 can produce a complete static-fallback implementation; Task 9 publication verification must report this gate as unresolved if Task 8 cannot run.

### Task 9: Full Verification And Visual Review

**Files:**
- Modify only if verification finds a defect in the files listed above.

- [ ] **Step 1: Run static checks and the complete automated test suite**

Run:

```bash
npm run lint
npm test
npm run build:framework
```

Expected: all commands PASS with no ESLint errors, TypeScript/Next build errors, or Vitest failures. Use `build:framework` before source intake; `npm run build` is intentionally publication-strict.

- [ ] **Step 2: Start the production build for browser verification**

Run: `npm run dev -- --hostname 127.0.0.1 --port 4419`

Expected: Next.js reports `Ready` at `http://127.0.0.1:4419`.

- [ ] **Step 3: Verify English and Chinese visual rhythm with Playwright screenshots**

Run:

```bash
npx playwright screenshot --device="Desktop Chrome" --full-page http://127.0.0.1:4419/en/work/meeting/ /tmp/meeting-film-en-desktop.png
npx playwright screenshot --device="Desktop Chrome" --full-page http://127.0.0.1:4419/zh/work/meeting/ /tmp/meeting-film-zh-desktop.png
npx playwright screenshot --device="iPhone 13" --full-page http://127.0.0.1:4419/en/work/meeting/ /tmp/meeting-film-en-mobile.png
npx playwright screenshot --device="iPhone 13" --full-page http://127.0.0.1:4419/zh/work/meeting/ /tmp/meeting-film-zh-mobile.png
```

Expected visual review:

- `Agora Meeting` is the first-viewport H1 and the next chapter is hinted below the fold.
- The first half reads as dark, media-led, and concise rather than as a long report.
- The coral turn is a single solid-color intermission, not a gradient or decorative card.
- The second half is light, stable, and evidence-led.
- App evidence dominates; Web appears only as supporting cross-device proof.
- Portrait/landscape media remains upright with no sideways controls or black-bar-driven overflow.
- Chinese and English text never overlap media, controls, navigation, or adjacent sections.

- [ ] **Step 4: Run the time-boxed hiring-manager comprehension check**

Open a fresh incognito session at the top of the English page and stop after 15 seconds. Without scrolling back, the reviewer must be able to state all three facts: `Agora Meeting`, designer-reported sole product design across four device classes, and the argument that meeting context changes what belongs in the main stage.

Continue scanning for a total of 60 seconds. Without opening a `DeepDive`, the reviewer must be able to state the three product acts, the rule `context -> information priority -> interface`, the App-first/Web-supporting evidence relationship, and that production delivery is verified while outcome metrics are not claimed. If any item is missed, revise only the relevant film title, one-line argument, or evidence label; do not add a visible planning chapter or long explanatory paragraph.

- [ ] **Step 5: Run browser, reduced-motion, print, and overflow verification**

Run: `npm run test:e2e -- tests/e2e/meeting.spec.ts --project=desktop`

Expected: PASS for both locales, all viewports, static fallback, reduced motion, print expansion, chapter anchors, closed `DeepDive` defaults, and horizontal overflow.

- [ ] **Step 6: Run publication verification only after Task 8 clears the media gate**

Run: `npm run verify:publish`

Expected after inspected sources exist: PASS for lint, unit/component tests, publication validation, Next build, and E2E.

Expected before source intake: FAIL with `Meeting Product Film sources required for publication:` and the four missing original paths. Record that result as the sole release blocker; do not weaken validation or substitute temporary imagery/videos to make the command green.

- [ ] **Step 7: Review the final diff and commit verification fixes**

Run:

```bash
git status --short
git diff --check
git log --oneline --max-count=10
```

Expected: no whitespace errors; `next-env.d.ts` remains unstaged; commits correspond to the narrative, media contract, film primitives, matched cut, cinematic half, evidence half, fallbacks, and optional source intake.

If verification required code fixes:

```bash
git add components/meeting content/work/meeting.en.mdx content/work/meeting.zh.mdx tests scripts evidence/meeting/manifest.json
git commit -m "fix: complete Meeting Product Film verification"
```

If no fixes were required, do not create an empty commit.
