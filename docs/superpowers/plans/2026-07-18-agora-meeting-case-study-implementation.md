# Agora Meeting Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Meeting draft with a complete bilingual, evidence-led Agora Meeting case study integrated into the current portfolio Home and localized work routes.

**Architecture:** Keep the existing Next.js content registry and localized routing. Add a Meeting-specific layout, a small set of reusable evidence components, bilingual MDX content, and a traceable media manifest. Real product media is required for publication; every video has a poster, captions, and a static fallback.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, MDX 3, CSS Modules, Vitest, Testing Library, Playwright, Sharp.

---

## File Map

### Create

- `content/work/meeting.en.mdx`: approved English case content and metadata.
- `content/work/meeting.zh.mdx`: equivalent Chinese case content and metadata.
- `components/meeting/meeting-layout.tsx`: Meeting-specific case shell and hero.
- `components/meeting/meeting-layout.module.css`: scoped Meeting editorial layout and responsive rules.
- `components/meeting/meeting-evidence.tsx`: accessible video with poster, captions, and static fallback.
- `components/meeting/meeting-evidence.module.css`: media presentation and controls.
- `components/meeting/meeting-models.tsx`: state matrix, Focus/Pin, participant priority, language governance, and capability-system diagrams.
- `components/meeting/meeting-models.module.css`: diagram and comparison styling.
- `components/meeting/meeting-print.css`: Meeting-specific print fallback.
- `evidence/meeting/manifest.json`: traceable source-to-public media contract.
- `evidence/meeting/source/`: approved Figma exports, recordings, posters, and VTT files.
- `scripts/prepare-meeting-assets.mjs`: validates and copies/optimizes declared media.
- `tests/unit/meeting-assets.test.ts`: manifest and derivative validation.
- `tests/component/meeting-evidence.test.tsx`: accessible media behavior.
- `tests/component/meeting-models.test.tsx`: system-model semantics.
- `tests/component/meeting-layout.test.tsx`: hero, facts, navigation, and boundaries.
- `tests/unit/meeting-content.test.ts`: bilingual metadata, chapters, and forbidden claims.
- `tests/e2e/meeting.spec.ts`: desktop/tablet/mobile route verification.

### Modify

- `content/registry.ts`: register the two MDX entries and Meeting layout.
- `content/home.ts`: mark Meeting complete only after publication verification.
- `content/dictionaries/en.ts`: replace draft Home copy and remove Before/During/After stages.
- `content/dictionaries/zh.ts`: equivalent Chinese Home copy.
- `components/home/meeting-preview.tsx`: render system decisions rather than lifecycle stages.
- `components/home/home.module.css`: adapt the three-column Meeting preview to the new decision copy.
- `package.json`: add `prepare:meeting`.
- `scripts/validate-publication.mjs`: require Meeting public media and reject draft state.
- `tests/component/homepage.test.tsx`: assert the new Home copy and publication state.
- `tests/component/draft-case.test.tsx`: remove Meeting draft expectations while retaining About coverage.
- `tests/unit/home-content.test.ts`: assert Meeting availability and destination.
- `tests/unit/work-metadata.test.ts`: verify bilingual Meeting browser metadata.

### Remove

- `content/work/meeting-draft.tsx`: obsolete draft route content.

## Task 1: Establish The Meeting Media Contract

**Files:**
- Create: `evidence/meeting/manifest.json`
- Create: `scripts/prepare-meeting-assets.mjs`
- Create: `tests/unit/meeting-assets.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing manifest test**

Create `tests/unit/meeting-assets.test.ts` with the exact required IDs and path rules:

```ts
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const requiredIds = [
  'meeting-hero',
  'adaptive-layout-poster',
  'adaptive-layout-demo',
  'meeting-state-matrix',
  'focus-vs-pin',
  'device-comparison',
  'whiteboard-multidevice',
  'participant-priority',
  'transcript-poster',
  'transcript-demo',
  'caption-vs-transcript',
  'speech-to-api',
  'capability-system',
  'launch-coverage',
  'adaptive-layout-captions-en',
  'adaptive-layout-captions-zh',
  'transcript-captions-en',
  'transcript-captions-zh',
] as const;

interface Asset {
  id: string;
  kind: 'image' | 'video' | 'captions';
  source: string;
  output: string;
  purpose: string;
  alt?: { en: string; zh: string };
  poster?: string;
  captions?: { en: string; zh: string };
}

const root = process.cwd();
const manifestPath = path.join(root, 'evidence/meeting/manifest.json');

describe('Meeting evidence manifest', () => {
  it('declares every approved communication asset once', () => {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      version: number;
      assets: Asset[];
    };
    expect(manifest.version).toBe(1);
    expect(manifest.assets.map(({ id }) => id)).toEqual(requiredIds);
    expect(new Set(manifest.assets.map(({ output }) => output)).size)
      .toBe(manifest.assets.length);
  });

  it('keeps sources traceable and public outputs contained', () => {
    const { assets } = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      assets: Asset[];
    };
    expect(new Set(assets.map(({ output }) => output)).size).toBe(assets.length);
    for (const asset of assets) {
      expect(asset.source).toMatch(/^evidence\/meeting\/source\//);
      expect(asset.output).toMatch(/^public\/(images|videos|captions)\/meeting\//);
      expect(asset.purpose.trim().length).toBeGreaterThan(20);
      if (asset.kind === 'image') {
        expect(asset.alt?.en.trim().length).toBeGreaterThan(20);
        expect(asset.alt?.zh.trim().length).toBeGreaterThan(8);
      }
      if (asset.kind === 'video') {
        expect(asset.poster).toMatch(/^\/images\/meeting\//);
        expect(asset.captions).toEqual({
          en: expect.stringMatching(/^\/captions\/meeting\/.+\.en\.vtt$/),
          zh: expect.stringMatching(/^\/captions\/meeting\/.+\.zh\.vtt$/),
        });
      }
    }
  });

  it('generates non-empty public derivatives', () => {
    const { assets } = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      assets: Asset[];
    };
    for (const asset of assets) {
      const output = path.join(root, asset.output);
      expect(existsSync(output), asset.output).toBe(true);
      expect(statSync(output).size, asset.output).toBeGreaterThan(128);
    }
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/unit/meeting-assets.test.ts`

Expected: FAIL because `evidence/meeting/manifest.json` does not exist.

- [ ] **Step 3: Add the versioned manifest**

Create `evidence/meeting/manifest.json` with the exact ordered IDs from the test. Use these output contracts:

```json
{
  "version": 1,
  "assets": [
    {
      "id": "meeting-hero",
      "kind": "image",
      "source": "evidence/meeting/source/meeting-hero.png",
      "output": "public/images/meeting/meeting-hero.webp",
      "purpose": "Orient the reviewer to the shipped Agora Meeting stage and product scale.",
      "alt": {
        "en": "Agora Meeting desktop stage with participant video, controls, and live meeting state",
        "zh": "Agora Meeting 桌面会议舞台，包含参会者视频、控制栏与实时会议状态"
      }
    },
    {
      "id": "adaptive-layout-poster",
      "kind": "image",
      "source": "evidence/meeting/source/adaptive-layout-poster.png",
      "output": "public/images/meeting/adaptive-layout-poster.webp",
      "purpose": "Provide a static fallback for the adaptive stage transition recording.",
      "alt": {
        "en": "Four shipped meeting-stage states: gallery, focus, content share, and whiteboard",
        "zh": "四种已上线会议舞台状态：宫格、聚焦、内容共享与白板"
      }
    },
    {
      "id": "adaptive-layout-demo",
      "kind": "video",
      "source": "evidence/meeting/source/adaptive-layout-demo.mp4",
      "output": "public/videos/meeting/adaptive-layout-demo.mp4",
      "poster": "/images/meeting/adaptive-layout-poster.webp",
      "captions": {
        "en": "/captions/meeting/adaptive-layout-demo.en.vtt",
        "zh": "/captions/meeting/adaptive-layout-demo.zh.vtt"
      },
      "purpose": "Prove that live meeting events cause continuous, shipped stage transitions."
    }
  ]
}
```

Insert these exact remaining records after `adaptive-layout-demo` inside the same `assets` array (remove the illustrative array brackets below when inserting). Every image record already includes the required bilingual `alt`.

```json
[
  { "id": "meeting-state-matrix", "kind": "image", "source": "evidence/meeting/source/meeting-state-matrix.png", "output": "public/images/meeting/meeting-state-matrix.webp", "purpose": "Explain how verified meeting triggers map to information priority and stage layout.", "alt": { "en": "Meeting state matrix linking share, whiteboard, focus, and participant count to layout", "zh": "会议状态矩阵，将共享、白板、聚焦和人数变化映射到布局" } },
  { "id": "focus-vs-pin", "kind": "image", "source": "evidence/meeting/source/focus-vs-pin.png", "output": "public/images/meeting/focus-vs-pin.webp", "purpose": "Compare meeting-wide host Focus with the participant's personal Pin control.", "alt": { "en": "Comparison of host Focus affecting everyone and personal Pin affecting one participant", "zh": "主持人聚焦影响所有人，而个人 Pin 只影响自己的对比" } },
  { "id": "device-comparison", "kind": "image", "source": "evidence/meeting/source/device-comparison.png", "output": "public/images/meeting/device-comparison.webp", "purpose": "Prove that the same meeting task adapts intentionally across four platform categories.", "alt": { "en": "The same Agora Meeting task across Desktop, Web, Tablet, and Mobile", "zh": "同一 Agora Meeting 任务在桌面、Web、平板和手机端的呈现" } },
  { "id": "whiteboard-multidevice", "kind": "image", "source": "evidence/meeting/source/whiteboard-multidevice.png", "output": "public/images/meeting/whiteboard-multidevice.webp", "purpose": "Show canvas priority and participant awareness across whiteboard layouts.", "alt": { "en": "Whiteboard workspace across desktop, tablet, mobile portrait, and mobile landscape", "zh": "白板工作区在桌面、平板、手机竖屏和横屏中的布局" } },
  { "id": "participant-priority", "kind": "image", "source": "evidence/meeting/source/participant-priority.png", "output": "public/images/meeting/participant-priority.webp", "purpose": "Explain the verified participant-view priority used above the portrait whiteboard.", "alt": { "en": "Seven-level participant-view priority for the mobile portrait whiteboard", "zh": "手机竖屏白板上方用户视窗的七级优先顺序" } },
  { "id": "transcript-poster", "kind": "image", "source": "evidence/meeting/source/transcript-poster.png", "output": "public/images/meeting/transcript-poster.webp", "purpose": "Provide a static fallback for the real-time information-layer recording.", "alt": { "en": "Live captions, transcript panel, language selection, and bilingual output", "zh": "实时字幕、转写面板、语言选择和双语输出" } },
  { "id": "transcript-demo", "kind": "video", "source": "evidence/meeting/source/transcript-demo.mp4", "output": "public/videos/meeting/transcript-demo.mp4", "poster": "/images/meeting/transcript-poster.webp", "captions": { "en": "/captions/meeting/transcript-demo.en.vtt", "zh": "/captions/meeting/transcript-demo.zh.vtt" }, "purpose": "Prove the shipped relationship among captions, transcription, translation, and interpretation." },
  { "id": "caption-vs-transcript", "kind": "image", "source": "evidence/meeting/source/caption-vs-transcript.png", "output": "public/images/meeting/caption-vs-transcript.webp", "purpose": "Explain personal caption control and host-governed transcript activation.", "alt": { "en": "Personal Live Captions compared with host-governed Transcript Panel controls", "zh": "个人实时字幕与主持人治理的转写面板控制对比" } },
  { "id": "speech-to-api", "kind": "image", "source": "evidence/meeting/source/speech-to-api.png", "output": "public/images/meeting/speech-to-api.webp", "purpose": "Define the shipped boundary from live speech processing to the customer API.", "alt": { "en": "Speech flows through live processing and Meeting UI into the customer API", "zh": "语音经过实时处理和会议界面进入客户 API 的流程" } },
  { "id": "capability-system", "kind": "image", "source": "evidence/meeting/source/capability-system.png", "output": "public/images/meeting/capability-system.webp", "purpose": "Show Breakout Rooms, Chat, and Waiting Room as compact system breadth evidence.", "alt": { "en": "Breakout Rooms, in-meeting Chat, and Waiting Room capability flows", "zh": "分组讨论、会中聊天和等候室能力流程" } },
  { "id": "launch-coverage", "kind": "image", "source": "evidence/meeting/source/launch-coverage.png", "output": "public/images/meeting/launch-coverage.webp", "purpose": "Summarize shipped platform coverage without implying unsupported product metrics.", "alt": { "en": "Shipped Agora Meeting coverage across Desktop, Web, Tablet, and Mobile", "zh": "Agora Meeting 在桌面、Web、平板和手机四类终端的上线覆盖" } },
  { "id": "adaptive-layout-captions-en", "kind": "captions", "source": "evidence/meeting/source/adaptive-layout-demo.en.vtt", "output": "public/captions/meeting/adaptive-layout-demo.en.vtt", "purpose": "Provide English text access for the adaptive layout recording." },
  { "id": "adaptive-layout-captions-zh", "kind": "captions", "source": "evidence/meeting/source/adaptive-layout-demo.zh.vtt", "output": "public/captions/meeting/adaptive-layout-demo.zh.vtt", "purpose": "Provide Chinese text access for the adaptive layout recording." },
  { "id": "transcript-captions-en", "kind": "captions", "source": "evidence/meeting/source/transcript-demo.en.vtt", "output": "public/captions/meeting/transcript-demo.en.vtt", "purpose": "Provide English text access for the transcript recording." },
  { "id": "transcript-captions-zh", "kind": "captions", "source": "evidence/meeting/source/transcript-demo.zh.vtt", "output": "public/captions/meeting/transcript-demo.zh.vtt", "purpose": "Provide Chinese text access for the transcript recording." }
]
```

- [ ] **Step 4: Add the preparation script**

Create `scripts/prepare-meeting-assets.mjs`. Images are converted with Sharp; already-compressed MP4 and VTT files are copied byte-for-byte:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'evidence/meeting/manifest.json');

function resolveContained(relativePath, prefix) {
  if (!relativePath.startsWith(prefix) || path.isAbsolute(relativePath) || relativePath.includes('..')) {
    throw new Error(`Unsafe Meeting asset path: ${relativePath}`);
  }
  return path.join(root, relativePath);
}

export async function prepareMeetingAssets() {
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  if (manifest.version !== 1 || !Array.isArray(manifest.assets)) {
    throw new Error('Meeting manifest must use version 1 with an assets array');
  }

  for (const asset of manifest.assets) {
    const source = resolveContained(asset.source, 'evidence/meeting/source/');
    const output = resolveContained(asset.output, 'public/');
    await fs.access(source);
    await fs.mkdir(path.dirname(output), { recursive: true });
    if (asset.kind === 'image') {
      await sharp(source).webp({ quality: 88, effort: 6 }).toFile(output);
    } else {
      await fs.copyFile(source, output);
    }
  }
  return manifest.assets.map(({ output }) => output);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareMeetingAssets()
    .then((outputs) => console.log(`Prepared ${outputs.length} Meeting assets.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```

- [ ] **Step 5: Add the package command**

Add to `package.json` scripts:

```json
"prepare:meeting": "node scripts/prepare-meeting-assets.mjs"
```

- [ ] **Step 6: Populate approved sources and run preparation**

Export static frames from Figma into `evidence/meeting/source/`. Record the two MP4s from the test environment/app packages. Add matching `.en.vtt` and `.zh.vtt` source files declared in the manifest.

Run: `npm run prepare:meeting`

Expected: `Prepared 18 Meeting assets.`

- [ ] **Step 7: Run the manifest test**

Run: `npm test -- tests/unit/meeting-assets.test.ts`

Expected: PASS with 3 tests.

- [ ] **Step 8: Commit**

```bash
git add package.json scripts/prepare-meeting-assets.mjs evidence/meeting public/images/meeting public/videos/meeting public/captions/meeting tests/unit/meeting-assets.test.ts
git commit -m "feat: add Agora Meeting evidence pipeline"
```

## Task 2: Build Accessible Meeting Evidence Components

**Files:**
- Create: `components/meeting/meeting-evidence.tsx`
- Create: `components/meeting/meeting-evidence.module.css`
- Create: `tests/component/meeting-evidence.test.tsx`

- [ ] **Step 1: Write failing component tests**

```tsx
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MeetingVideo } from '@/components/meeting/meeting-evidence';

afterEach(cleanup);

describe('MeetingVideo', () => {
  it('renders poster, localized captions, transcript description, and fallback image', () => {
    const { container } = render(
      <MeetingVideo
        src="/videos/meeting/adaptive-layout-demo.mp4"
        poster="/images/meeting/adaptive-layout-poster.webp"
        captions="/captions/meeting/adaptive-layout-demo.en.vtt"
        title="Adaptive stage transition"
        description="Gallery changes to focus and content share."
        fallback={{
          src: '/images/meeting/adaptive-layout-poster.webp',
          alt: 'Four shipped meeting-stage states',
        }}
        locale="en"
      />,
    );
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('poster', '/images/meeting/adaptive-layout-poster.webp');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('muted');
    expect(video).toHaveAttribute('aria-describedby');
    expect(container.querySelector('track[kind="captions"]')).toHaveAttribute(
      'src',
      '/captions/meeting/adaptive-layout-demo.en.vtt',
    );
    expect(screen.getByRole('img', { name: 'Four shipped meeting-stage states' }))
      .toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/component/meeting-evidence.test.tsx`

Expected: FAIL because `MeetingVideo` does not exist.

- [ ] **Step 3: Implement `MeetingVideo`**

```tsx
'use client';

import type { Locale } from '@/content/types';
import styles from './meeting-evidence.module.css';

interface MeetingVideoProps {
  src: string;
  poster: string;
  captions: string;
  title: string;
  description: string;
  fallback: { src: string; alt: string };
  locale: Locale;
}

export function MeetingVideo(props: MeetingVideoProps) {
  const descriptionId = `meeting-video-${props.src.replace(/[^a-z0-9]/gi, '-')}`;
  return (
    <figure className={styles.root} data-meeting-video>
      <video
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
      >
        <track
          kind="captions"
          src={props.captions}
          srcLang={props.locale === 'zh' ? 'zh-CN' : 'en'}
          label={props.locale === 'zh' ? '中文字幕' : 'English captions'}
          default
        />
      </video>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={props.fallback.src} alt={props.fallback.alt} />
      </noscript>
      <figcaption id={descriptionId}>{props.description}</figcaption>
    </figure>
  );
}
```

Use CSS to keep a stable aspect ratio, show visible focus styles on controls, and expose the fallback image in print/reduced-motion mode.

- [ ] **Step 4: Verify pass**

Run: `npm test -- tests/component/meeting-evidence.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add components/meeting/meeting-evidence.tsx components/meeting/meeting-evidence.module.css tests/component/meeting-evidence.test.tsx
git commit -m "feat: add accessible Meeting video evidence"
```

## Task 3: Build The Meeting System Models

**Files:**
- Create: `components/meeting/meeting-models.tsx`
- Create: `components/meeting/meeting-models.module.css`
- Create: `tests/component/meeting-models.test.tsx`

- [ ] **Step 1: Write failing semantic tests**

```tsx
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  CapabilitySystem,
  ContextPriorityModel,
  FocusPinComparison,
  LanguageControlModel,
  MeetingStateMatrix,
  ParticipantPriorityStack,
} from '@/components/meeting/meeting-models';

afterEach(cleanup);

describe('Meeting system models', () => {
  it('renders the four verified stage triggers', () => {
    render(<MeetingStateMatrix locale="en" />);
    const table = screen.getByRole('table', { name: 'Meeting stage state rules' });
    for (const trigger of ['Screen Share', 'Whiteboard Open', 'Host Focus', 'Participant Count']) {
      expect(within(table).getByText(trigger)).toBeVisible();
    }
  });

  it('connects context, information priority, and interface state', () => {
    render(<ContextPriorityModel locale="en" />);
    expect(screen.getByText('Meeting context')).toBeVisible();
    expect(screen.getByText('Information priority')).toBeVisible();
    expect(screen.getByText('Interface state')).toBeVisible();
  });

  it('separates meeting-wide focus from personal pin', () => {
    render(<FocusPinComparison locale="en" />);
    expect(screen.getByText('Changes everyone’s main view')).toBeVisible();
    expect(screen.getByText('Changes only my view')).toBeVisible();
  });

  it('preserves the approved participant priority order', () => {
    render(<ParticipantPriorityStack locale="en" />);
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Host Focus'),
      expect.stringContaining('Personal Pin'),
      expect.stringContaining('Active Speaker'),
      expect.stringContaining('Self'),
      expect.stringContaining('Camera + Microphone'),
      expect.stringContaining('Camera'),
      expect.stringContaining('Microphone'),
    ]);
  });

  it('separates individual captions from host-governed transcription', () => {
    render(<LanguageControlModel locale="en" />);
    expect(screen.getByText('Individual control')).toBeVisible();
    expect(screen.getByText('Host starts or stops')).toBeVisible();
    expect(screen.getByText('Participant can request')).toBeVisible();
  });

  it('keeps breadth evidence to the three approved capabilities', () => {
    render(<CapabilitySystem locale="en" />);
    expect(screen.getAllByRole('article').map((item) => item.textContent)).toEqual([
      expect.stringContaining('Breakout Rooms'),
      expect.stringContaining('In-meeting Chat'),
      expect.stringContaining('Waiting Room'),
    ]);
  });
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/component/meeting-models.test.tsx`

Expected: FAIL because the model exports do not exist.

- [ ] **Step 3: Implement localized presentational models**

Define one `copy` object with `en` and `zh` keys. Render the state rules as a semantic table, Focus/Pin as two adjacent articles, participant priority as an ordered list, and language controls as two role-labeled paths. Do not add click behavior; these models explain shipped rules and do not simulate the product.

The exact stage rows are:

```ts
const stageRows = {
  en: [
    ['Screen Share', 'Shared content', 'Content Focus'],
    ['Whiteboard Open', 'Canvas interaction', 'Workspace Mode'],
    ['Host Focus', 'Meeting-wide subject', 'Focused Stage'],
    ['Participant Count', 'Equal visibility or speaker priority', 'Gallery / Speaker'],
  ],
  zh: [
    ['屏幕共享', '共享内容', '内容聚焦'],
    ['白板开启', '画布交互', '协作工作区'],
    ['主持人聚焦', '全局主要对象', '聚焦舞台'],
    ['参会人数变化', '平等可见或发言优先', '宫格 / 演讲者'],
  ],
} as const;
```

Use CSS Grid with explicit columns, 1px borders, stable minimum row heights, and a stacked mobile layout. No decorative cards or gradients.

- [ ] **Step 4: Verify pass**

Run: `npm test -- tests/component/meeting-models.test.tsx`

Expected: PASS with 6 tests.

- [ ] **Step 5: Commit**

```bash
git add components/meeting/meeting-models.tsx components/meeting/meeting-models.module.css tests/component/meeting-models.test.tsx
git commit -m "feat: add Agora Meeting system models"
```

## Task 4: Create The Meeting Case Layout

**Files:**
- Create: `components/meeting/meeting-layout.tsx`
- Create: `components/meeting/meeting-layout.module.css`
- Create: `components/meeting/meeting-print.css`
- Create: `tests/component/meeting-layout.test.tsx`

- [ ] **Step 1: Write the failing layout test**

```tsx
import { render, screen } from '@testing-library/react';
import { MeetingLayout } from '@/components/meeting/meeting-layout';
import type { ContentMeta } from '@/content/schema';

const meta: ContentMeta = {
  type: 'work', slug: 'meeting', locale: 'en', translationKey: 'work.meeting',
  title: 'Designing Agora Meeting: A Multi-device Real-time Collaboration System',
  proposition: 'Building a scalable meeting experience across Desktop, Web, Tablet, and Mobile with adaptive layouts, AI-powered transcription, and collaborative workflows.',
  role: 'Sole Product Designer', duration: '2024-2026 · 1.5 years',
  status: 'Shipped', disclosure: 'Real shipped interfaces and product recordings.',
  heroMedia: '/images/meeting/meeting-hero.webp', evidenceLevel: 'delivered',
  featuredOrder: 3, previousSlug: 'call-agent', nextSlug: 'stt-demo',
  chapters: [{ id: 'business-context', label: 'Business context' }],
};

it('presents product proof, approved facts, and chapter navigation', () => {
  render(<MeetingLayout meta={meta} locale="en"><section id="business-context">Context</section></MeetingLayout>);
  expect(screen.getByRole('heading', { level: 1, name: meta.title })).toBeVisible();
  expect(screen.getByText('Sole Product Designer')).toBeVisible();
  expect(screen.getByText('2024-2026 · 1.5 years')).toBeVisible();
  expect(screen.getByRole('img', { name: /Agora Meeting desktop stage/i })).toHaveAttribute(
    'src', '/images/meeting/meeting-hero.webp',
  );
  expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/component/meeting-layout.test.tsx`

Expected: FAIL because `MeetingLayout` does not exist.

- [ ] **Step 3: Implement the layout**

Follow `components/xuelang/xuelang-layout.tsx` as the local pattern, but keep Meeting quieter and more technical. Required structure:

```tsx
export function MeetingLayout({ meta, locale, children, previous, next }: ContentLayoutProps) {
  const text = copy[locale];
  return (
    <div className={styles.root} data-meeting-case>
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>AGORA MEETING / ENTERPRISE MEETING aPaaS</p>
            <h1>{meta.title}</h1>
            <p className={styles.proposition}>{meta.proposition}</p>
            <dl className={styles.facts} aria-label={text.projectFacts}>
              <div><dt>{text.role}</dt><dd>{meta.role}</dd></div>
              <div><dt>{text.timeline}</dt><dd>{meta.duration}</dd></div>
              <div><dt>{text.platforms}</dt><dd>Desktop · Web · Tablet · Mobile</dd></div>
              <div><dt>{text.status}</dt><dd>{meta.status}</dd></div>
            </dl>
            <figure className={styles.heroMedia}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meta.heroMedia} alt={text.heroAlt} width="2400" height="1350" />
              <figcaption>{text.heroCaption}</figcaption>
            </figure>
          </header>
          <div className={styles.content}>{children}</div>
          <CaseNeighbors locale={locale} previous={previous} next={next} />
        </article>
      </div>
    </div>
  );
}
```

Implement `CaseNeighbors` locally with this exact contract:

```tsx
function CaseNeighbors({
  locale,
  previous,
  next,
}: Pick<ContentLayoutProps, 'locale' | 'previous' | 'next'>) {
  if (!previous && !next) return null;
  const text = locale === 'zh'
    ? { label: '项目导航', previous: '上一个项目', next: '下一个项目' }
    : { label: 'Project navigation', previous: 'Previous project', next: 'Next project' };
  return (
    <nav className={styles.neighbors} aria-label={text.label}>
      {previous ? <a href={previous.href} data-project-previous><span>{text.previous}</span><strong>{previous.title}</strong></a> : null}
      {next ? <a href={next.href} data-project-next><span>{text.next}</span><strong>{next.title}</strong></a> : null}
    </nav>
  );
}
```

- [ ] **Step 4: Add scoped visual and print rules**

Use a 2/10 rail-content grid above 1100px, a single column below it, stable 16:9 media frames, 6-8 column reading width, and section spacing that alternates overview and evidence. Import `meeting-print.css` from the layout. Print rules must hide controls, show posters, preserve diagrams, and start chapters 5-8 on new pages.

- [ ] **Step 5: Verify the layout**

Run: `npm test -- tests/component/meeting-layout.test.tsx`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/meeting/meeting-layout.tsx components/meeting/meeting-layout.module.css components/meeting/meeting-print.css tests/component/meeting-layout.test.tsx
git commit -m "feat: add Agora Meeting case layout"
```

## Task 5: Replace The Draft With Approved Bilingual Content

**Files:**
- Create: `content/work/meeting.en.mdx`
- Create: `content/work/meeting.zh.mdx`
- Create: `tests/unit/meeting-content.test.ts`
- Modify: `content/registry.ts`
- Modify: `tests/component/draft-case.test.tsx`
- Modify: `tests/unit/work-metadata.test.ts`
- Remove: `content/work/meeting-draft.tsx`

- [ ] **Step 1: Write the failing content contract**

```ts
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contentEntries } from '@/content/registry';

const chapterIds = [
  'business-context', 'design-challenge', 'system-strategy',
  'adaptive-stage', 'whiteboard-workspace', 'information-layer',
  'capability-impact', 'reflection',
];

describe('Agora Meeting content', () => {
  it.each(['en', 'zh'] as const)('registers complete %s shipped metadata', (locale) => {
    const entry = contentEntries.find(({ meta }) => meta.slug === 'meeting' && meta.locale === locale);
    expect(entry?.meta.status).toBe(locale === 'zh' ? '已上线' : 'Shipped');
    expect(entry?.meta.duration).toBe(locale === 'zh' ? '2024-2026 · 1.5 年' : '2024-2026 · 1.5 years');
    expect(entry?.meta.chapters?.map(({ id }) => id)).toEqual(chapterIds);
    expect(entry?.meta.evidenceLevel).toBe('delivered');
  });

  it('does not claim post-meeting ownership or unsupported metrics', () => {
    const source = ['en', 'zh'].map((locale) =>
      readFileSync(`content/work/meeting.${locale}.mdx`, 'utf8'),
    ).join('\n');
    expect(source).not.toMatch(/Before the meeting|After the meeting|会议前|会议后/);
    expect(source).not.toMatch(/increased by\s*\d+%|提升了?\s*\d+%|满意度|adoption/i);
    expect(source).toMatch(/Customer API/);
    expect(source).toMatch(/客户 API/);
  });
});
```

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/unit/meeting-content.test.ts`

Expected: FAIL because the MDX files and shipped entries do not exist.

- [ ] **Step 3: Create English metadata and sections**

Start `content/work/meeting.en.mdx` with imports for `MeetingVideo`, `EvidenceFigure`, and the six model components (`ContextPriorityModel`, `MeetingStateMatrix`, `FocusPinComparison`, `ParticipantPriorityStack`, `LanguageControlModel`, and `CapabilitySystem`). Use this exact metadata:

```js
export const metadata = {
  type: 'work', slug: 'meeting', locale: 'en', translationKey: 'work.meeting',
  title: 'Designing Agora Meeting: A Multi-device Real-time Collaboration System',
  proposition: 'Building a scalable meeting experience across Desktop, Web, Tablet, and Mobile with adaptive layouts, AI-powered transcription, and collaborative workflows.',
  role: 'Sole Product Designer', duration: '2024-2026 · 1.5 years',
  status: 'Shipped',
  disclosure: 'This case uses shipped product interfaces and real product recordings. No quantitative adoption or satisfaction metrics are claimed.',
  heroMedia: '/images/meeting/meeting-hero.webp', evidenceLevel: 'delivered',
  featuredOrder: 3, previousSlug: 'call-agent', nextSlug: 'stt-demo',
  caseLabel: 'AGORA MEETING / ENTERPRISE MEETING aPaaS',
  chapters: [
    { id: 'business-context', label: 'Business context' },
    { id: 'design-challenge', label: 'Design challenge' },
    { id: 'system-strategy', label: 'System strategy' },
    { id: 'adaptive-stage', label: 'Adaptive stage' },
    { id: 'whiteboard-workspace', label: 'Whiteboard' },
    { id: 'information-layer', label: 'Information layer' },
    { id: 'capability-impact', label: 'Capability & impact' },
    { id: 'reflection', label: 'Reflection' },
  ],
}
```

Use the approved facts and CPDI language from `docs/superpowers/specs/2026-07-18-agora-meeting-case-study-design.md`, specifically sections `1. Evidence And Project Facts`, `2. Project Positioning`, and `6. Screen-level CPDI`. Preserve the factual boundaries exactly: do not introduce direct-research claims, quantitative outcomes, or Agora-owned post-meeting transcript UI. Map the copy to MDX with this fixed section/component order:

```mdx
<section id="business-context">Business trigger, product positioning, role, collaboration, and requirement-source copy.</section>
<section id="design-challenge">Default-versus-configurable rule and the multi-role, multi-device challenge.</section>
<section id="system-strategy">
  <ContextPriorityModel locale="en" />
  <EvidenceFigure src="/images/meeting/device-comparison.webp" width={2400} height={1350} alt="The same Agora Meeting task across Desktop, Web, Tablet, and Mobile" label="FOUR PLATFORMS / ONE TASK" caption="The user goal and interaction logic remain stable while each interface adapts to its device context." locale="en" />
</section>
<section id="adaptive-stage">
  <MeetingVideo src="/videos/meeting/adaptive-layout-demo.mp4" poster="/images/meeting/adaptive-layout-poster.webp" captions="/captions/meeting/adaptive-layout-demo.en.vtt" title="Adaptive meeting-stage transitions" description="Screen Share, Whiteboard, Host Focus, and Participant Count change information priority and layout." fallback={{ src: '/images/meeting/adaptive-layout-poster.webp', alt: 'Four shipped meeting-stage states: gallery, focus, content share, and whiteboard' }} locale="en" />
  <MeetingStateMatrix locale="en" />
  <FocusPinComparison locale="en" />
</section>
<section id="whiteboard-workspace">
  <EvidenceFigure src="/images/meeting/whiteboard-multidevice.webp" width={2400} height={1500} alt="Whiteboard workspace across desktop, tablet, mobile portrait, and mobile landscape" label="CANVAS FIRST / MULTI-DEVICE" caption="The canvas becomes primary while participant awareness remains available through device-specific layouts." locale="en" />
  <ParticipantPriorityStack locale="en" />
</section>
<section id="information-layer">
  <MeetingVideo src="/videos/meeting/transcript-demo.mp4" poster="/images/meeting/transcript-poster.webp" captions="/captions/meeting/transcript-demo.en.vtt" title="Real-time meeting information layer" description="Live Captions, host-governed transcription, translation, bilingual output, and simultaneous interpretation form one in-meeting information layer." fallback={{ src: '/images/meeting/transcript-poster.webp', alt: 'Live captions, transcript panel, language selection, and bilingual output' }} locale="en" />
  <LanguageControlModel locale="en" />
  <EvidenceFigure src="/images/meeting/speech-to-api.webp" width={1800} height={1000} alt="Speech flows through live processing and Meeting UI into the customer API" label="PRODUCT BOUNDARY / CUSTOMER API" caption="Agora owns the complete in-meeting experience; customers decide how transcript data is retained and used after the meeting." locale="en" />
</section>
<section id="capability-impact">
  <CapabilitySystem locale="en" />
  <EvidenceFigure src="/images/meeting/launch-coverage.webp" width={1800} height={1000} alt="Shipped Agora Meeting coverage across Desktop, Web, Tablet, and Mobile" label="SHIPPED / FOUR PLATFORM CATEGORIES" caption="Production delivery and customer-requirement coverage are the verified outcomes; no quantitative usage metric is claimed." locale="en" />
</section>
<section id="reflection">Component-system reflection and future cross-platform governance copy.</section>
```

- [ ] **Step 4: Create equivalent Chinese content**

Use the same section IDs, component order, media paths, and factual coverage. Metadata title may remain the approved English product title, while the proposition and chapter labels are Chinese. Required role/status strings are `唯一产品设计师` and `已上线`.

- [ ] **Step 5: Replace registry imports**

In `content/registry.ts`, remove `MeetingDraftEn`, `MeetingDraftZh`, and draft metadata imports. Add:

```ts
import MeetingEn, { metadata as meetingEnMetadata } from '@/content/work/meeting.en.mdx';
import MeetingZh, { metadata as meetingZhMetadata } from '@/content/work/meeting.zh.mdx';
import { MeetingLayout } from '@/components/meeting/meeting-layout';
```

Register both entries with `Layout: MeetingLayout` and parsed metadata.

- [ ] **Step 6: Remove obsolete draft content and tests**

Delete `content/work/meeting-draft.tsx`. In `tests/component/draft-case.test.tsx`, remove the Meeting registry and `DraftCase` tests; retain the About framework test. Extend `tests/unit/work-metadata.test.ts` with:

```ts
['en', 'meeting', 'Designing Agora Meeting: A Multi-device Real-time Collaboration System | Yang Jing'],
['zh', 'meeting', 'Designing Agora Meeting: A Multi-device Real-time Collaboration System | Yang Jing'],
```

- [ ] **Step 7: Run focused tests**

Run: `npm test -- tests/unit/meeting-content.test.ts tests/unit/work-metadata.test.ts tests/component/draft-case.test.tsx`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add content/work/meeting.en.mdx content/work/meeting.zh.mdx content/registry.ts tests/unit/meeting-content.test.ts tests/unit/work-metadata.test.ts tests/component/draft-case.test.tsx
git rm content/work/meeting-draft.tsx
git commit -m "feat: publish bilingual Agora Meeting case content"
```

## Task 6: Update The Home Meeting Entry

**Files:**
- Modify: `content/home.ts`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `components/home/home.module.css`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Replace the old homepage assertions with failing new assertions**

```tsx
const meeting = container.querySelector<HTMLElement>('[data-project-id="meeting"]');
expect(meeting).toHaveAttribute('data-publication-state', 'complete');
expect(within(meeting as HTMLElement).getByText('Adaptive stage')).toBeVisible();
expect(within(meeting as HTMLElement).getByText('Collaborative workspace')).toBeVisible();
expect(within(meeting as HTMLElement).getByText('Real-time information')).toBeVisible();
expect(within(meeting as HTMLElement).queryByText('Before the meeting')).not.toBeInTheDocument();
expect(within(meeting as HTMLElement).queryByText('After the meeting')).not.toBeInTheDocument();
expect(within(meeting as HTMLElement).getByRole('link', { name: /View case study/i }))
  .toHaveAttribute('href', '/en/work/meeting/');
```

Update `tests/unit/home-content.test.ts` to expect Meeting availability `complete`.

- [ ] **Step 2: Verify failure**

Run: `npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts`

Expected: FAIL on draft state and lifecycle copy.

- [ ] **Step 3: Update Home data and bilingual copy**

Set Meeting availability to `complete` in `content/home.ts`. Replace `stages` values with these three decision summaries:

```ts
// English
[
  { title: 'Adaptive stage', description: 'Meeting events change content priority and layout state.' },
  { title: 'Collaborative workspace', description: 'Whiteboard keeps creation primary without losing participant awareness.' },
  { title: 'Real-time information', description: 'Captions and transcription separate personal control from host governance.' },
]

// Chinese
[
  { title: '自适应会议舞台', description: '会议事件改变内容优先级与布局状态。' },
  { title: '协作工作区', description: '白板以创作为主，同时保留参会者感知。' },
  { title: '实时信息层', description: '字幕与转写区分个人控制和主持人治理。' },
]
```

Set the title to `Agora Meeting`, action to `View case study` / `查看案例`, and status to `Shipped across four platforms` / `已覆盖四类终端上线`.

- [ ] **Step 4: Update preview semantics and CSS**

Rename the internal `MeetingStage` type to `MeetingDecision`. Keep the three-section semantic structure. Change `data-publication-state` from `draft` to `complete`. Retain the stable three-column desktop grid and vertical mobile sequence; remove offsets that imply chronological lifecycle.

- [ ] **Step 5: Verify pass**

Run: `npm test -- tests/component/homepage.test.tsx tests/unit/home-content.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add content/home.ts content/dictionaries/en.ts content/dictionaries/zh.ts components/home/meeting-preview.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/unit/home-content.test.ts
git commit -m "feat: publish Agora Meeting on the portfolio home"
```

## Task 7: Add Meeting Route And Publication Verification

**Files:**
- Create: `tests/e2e/meeting.spec.ts`
- Modify: `scripts/validate-publication.mjs`
- Modify: `tests/unit/publication-validation.test.ts`

- [ ] **Step 1: Write the failing E2E route contract**

```ts
import { expect, test } from '@playwright/test';

const chapterIds = [
  'business-context', 'design-challenge', 'system-strategy', 'adaptive-stage',
  'whiteboard-workspace', 'information-layer', 'capability-impact', 'reflection',
];

for (const locale of ['en', 'zh'] as const) {
  test.describe(`${locale} Agora Meeting case`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${locale}/work/meeting/`, { waitUntil: 'domcontentloaded' });
    });

    test('renders the approved case and shipped boundaries', async ({ page }) => {
      await expect(page.locator('[data-meeting-case]')).toBeVisible();
      const ids = await page.locator('article[data-case-study] > div > section')
        .evaluateAll((sections) => sections.map(({ id }) => id));
      expect(ids).toEqual(chapterIds);
      await expect(page.getByText(locale === 'zh' ? '唯一产品设计师' : 'Sole Product Designer')).toBeVisible();
      await expect(page.getByText(locale === 'zh' ? '已上线' : 'Shipped', { exact: true })).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/提升了?\s*\d+%|increased by\s*\d+%/i);
    });

    test('loads accessible video evidence', async ({ page }) => {
      const videos = page.locator('video');
      await expect(videos).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(videos.nth(index)).toHaveAttribute('poster', /\/images\/meeting\/.+\.webp$/);
        await expect(videos.nth(index).locator('track[kind="captions"]')).toHaveCount(1);
      }
    });

    test('has no horizontal overflow', async ({ page }) => {
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
```

- [ ] **Step 2: Add source publication requirements**

In `scripts/validate-publication.mjs`, add the Meeting hero, both videos, both posters, and four VTT files to the required publication inputs. Preserve the existing generated-HTML checks for poster and transcript/captions access.

- [ ] **Step 3: Add validation unit coverage**

Extend `tests/unit/publication-validation.test.ts` so missing Meeting assets produce deterministic errors and complete Meeting media passes. Use the existing temporary-root helpers and write minimal image/video/VTT fixtures.

- [ ] **Step 4: Run focused unit and E2E tests**

Run: `npm test -- tests/unit/publication-validation.test.ts`

Expected: PASS.

Run: `npx playwright test tests/e2e/meeting.spec.ts`

Expected: PASS for desktop, tablet, and mobile projects in both locales.

- [ ] **Step 5: Inspect responsive screenshots**

Capture:

```bash
npx playwright screenshot --viewport-size="1440,900" http://localhost:3000/en/work/meeting/ output/meeting-desktop.png
npx playwright screenshot --viewport-size="768,1024" http://localhost:3000/en/work/meeting/ output/meeting-tablet.png
npx playwright screenshot --viewport-size="390,844" http://localhost:3000/zh/work/meeting/ output/meeting-mobile-zh.png
```

Verify: no overlaps, all interface labels remain readable, media frames keep stable dimensions, and mobile content does not reproduce the desktop sticky layout.

- [ ] **Step 6: Commit**

```bash
git add tests/e2e/meeting.spec.ts scripts/validate-publication.mjs tests/unit/publication-validation.test.ts
git commit -m "test: verify Agora Meeting publication"
```

## Task 8: Full Publication Gate

**Files:**
- Review all files changed in Tasks 1-7.

- [ ] **Step 1: Run formatting and source checks**

Run: `npm run lint`

Expected: PASS with no warnings or errors introduced by Meeting files.

- [ ] **Step 2: Run all unit and component tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 3: Run the content validator**

Run: `npm run validate:content`

Expected: PASS with complete `en` and `zh` Meeting entries and no draft marker.

- [ ] **Step 4: Build and validate static output**

Run: `npm run build`

Expected: Next static export succeeds; publication validation finds all Meeting images, videos, posters, captions, and localized routes.

- [ ] **Step 5: Run the complete browser suite**

Run: `npm run test:e2e`

Expected: PASS across desktop, tablet, and mobile projects.

- [ ] **Step 6: Run the final publication command**

Run: `npm run verify:publish`

Expected: PASS for lint, unit/component tests, source/output validation, build, and E2E.

- [ ] **Step 7: Check factual and visual publication gates manually**

Confirm all of the following:

- The case states Agora Meeting, Enterprise Meeting aPaaS, 2024-2026, 1.5 years, Sole Product Designer, and Shipped.
- The business trigger is Zoom's planned China-market exit and customer migration.
- No direct-research claim is made; requirement sources are customer lists and PM inputs.
- No unsupported adoption, satisfaction, efficiency, or percentage claim appears.
- Post-meeting transcript storage and customer-built copy/download interfaces remain out of scope.
- The three primary cases are Adaptive Stage, Whiteboard Workspace, and Real-time Information Layer.
- Breakout Rooms, Chat, and Waiting Room remain compact system-breadth evidence.
- Home and case routes preserve locale without declaring an English-default rule.
- The 30-second, 3-minute, and 10-minute reading paths remain coherent.

- [ ] **Step 8: Commit any verification-only fixes**

```bash
git add content components evidence public scripts tests package.json
git commit -m "fix: complete Agora Meeting publication gate"
```

Skip this commit when verification required no fixes.
