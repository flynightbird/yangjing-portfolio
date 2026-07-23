# ConvoAI Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved ConvoAI portfolio case study with five decision-led chapters, a layered Web/App product stage, sixteen complete recordings, synchronized detail-navigation tones, accessible playback, and responsive evidence layouts.

**Architecture:** Keep the existing bilingual MDX registry and shared detail shell. Add a ConvoAI-owned media catalog, preparation pipeline, client media components, and layout styling; expose one generic navigation-tone browser event through the shared header and chapter rail so alternating dark/light sections remain consistent without project-colored navigation. Preserve source media as traceable external inputs, commit browser-ready public derivatives and posters, and validate every published asset against a manifest.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, MDX, CSS Modules, Lucide React, Vitest, Testing Library, Playwright, Node.js asset scripts, macOS AVFoundation/`avconvert` for local media preparation.

---

## File Structure

### Create

- `evidence/convo-ai/media-manifest.json` — canonical metadata for nine App and seven Web recordings, hashes, durations, dimensions, posters, and public paths.
- `scripts/prepare-convo-ai-assets.mjs` — copy App MP4 files, convert Web MOV files without trimming, extract poster frames, and verify durations.
- `tests/unit/convo-ai-assets.test.ts` — manifest, output, hash, duration, and source-count contract.
- `components/convo-ai/convo-ai-media-catalog.ts` — typed bilingual titles, descriptions, CPDI, source paths, poster paths, and durations.
- `components/convo-ai/convo-ai-media.tsx` — coordinated player, playlist, and layered cross-platform stage.
- `components/convo-ai/convo-ai-media.module.css` — stable player dimensions, topology stage, device shell, focus states, and responsive motion.
- `components/convo-ai/convo-ai-tone-controller.tsx` — observes case sections and publishes shared light/dark navigation tone.
- `components/convo-ai/convo-ai-print.css` — poster-first print fallback.
- `tests/component/convo-ai-media.test.tsx` — player coordination, full-duration metadata, platform focus, retry, and reduced-motion hooks.
- `tests/component/convo-ai-layout.test.tsx` — literal product H1, shared navigation, layered hero, facts, and neighbors.
- `public/videos/convo-ai/*` — sixteen browser-ready complete recordings.
- `public/images/convo-ai/posters/*` — sixteen generated static poster images.

### Modify

- `package.json` — add `prepare:convo-ai`.
- `scripts/validate-publication.mjs` — require ConvoAI manifest, sixteen public videos, and sixteen posters.
- `components/shell/site-header.tsx` — listen for the generic portfolio navigation-tone event and use a dark initial tone on ConvoAI.
- `components/shell/site-header.module.css` — keep the existing global light/dark tokens and shorten only tone-property transitions.
- `components/case-study/chapter-nav.tsx` — listen for the same generic navigation-tone event.
- `components/case-study/chapter-nav.module.css` — preserve global iris accents while transitioning semantic tone properties.
- `components/convo-ai/convo-ai-layout.tsx` — replace the generic case wrapper with the approved product-theatre shell and layered hero.
- `components/convo-ai/convo-ai-layout.module.css` — implement alternating bands, typography, evidence debriefs, system diagrams, and mobile layout.
- `content/work/convo-ai.zh.mdx` — five Chinese decision acts and complete evidence playlists.
- `content/work/convo-ai.en.mdx` — equivalent English decision acts and complete evidence playlists.
- `tests/component/site-header.test.tsx` — initial ConvoAI tone and custom tone-event behavior.
- `tests/component/case-study.test.tsx` — chapter rail tone-event behavior.
- `tests/unit/convo-ai-content.test.ts` — approved chapter IDs, absence of Gap copy, and media IDs.
- `tests/e2e/convo-ai.spec.ts` — layered stage, sixteen recordings, playback coordination, navigation tones, responsive layout, and overflow.
- `tests/e2e/portfolio-detail-system.spec.ts` — include ConvoAI in shared detail-navigation assertions without changing other projects.

---

### Task 1: Lock The Sixteen-Recording Asset Contract

**Files:**

- Create: `evidence/convo-ai/media-manifest.json`
- Create: `tests/unit/convo-ai-assets.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Write the failing asset-manifest test**

Create `tests/unit/convo-ai-assets.test.ts`:

```ts
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

interface ConvoAiMediaAsset {
  readonly id: string;
  readonly platform: 'app' | 'web';
  readonly sourceName: string;
  readonly output: string;
  readonly poster: string;
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly audio: boolean;
  readonly sha256: string;
  readonly posterTime: number;
}

interface ConvoAiMediaManifest {
  readonly version: 1;
  readonly assets: readonly ConvoAiMediaAsset[];
}

const root = process.cwd();
const manifestPath = path.join(root, 'evidence/convo-ai/media-manifest.json');

function loadManifest(): ConvoAiMediaManifest {
  expect(existsSync(manifestPath)).toBe(true);
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as ConvoAiMediaManifest;
}

describe('ConvoAI media manifest', () => {
  it('declares nine App and seven Web recordings exactly once', () => {
    const manifest = loadManifest();
    expect(manifest.version).toBe(1);
    expect(manifest.assets).toHaveLength(16);
    expect(manifest.assets.filter(({ platform }) => platform === 'app')).toHaveLength(9);
    expect(manifest.assets.filter(({ platform }) => platform === 'web')).toHaveLength(7);
    expect(new Set(manifest.assets.map(({ id }) => id).size)).toBe(16);
    expect(new Set(manifest.assets.map(({ output }) => output).size)).toBe(16);
  });

  it('records traceable media metadata and contained public outputs', () => {
    for (const asset of loadManifest().assets) {
      expect(asset.sourceName).toMatch(/\.(?:mp4|mov)$/i);
      expect(asset.output).toMatch(/^public\/videos\/convo-ai\/[a-z0-9-]+\.mp4$/);
      expect(asset.poster).toMatch(/^public\/images\/convo-ai\/posters\/[a-z0-9-]+\.webp$/);
      expect(asset.duration).toBeGreaterThan(0);
      expect(asset.width).toBeGreaterThan(0);
      expect(asset.height).toBeGreaterThan(0);
      expect(asset.fps).toBeGreaterThan(0);
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.posterTime).toBeGreaterThanOrEqual(0);
      expect(asset.posterTime).toBeLessThan(asset.duration);
    }
  });

  it('keeps every generated derivative non-empty', () => {
    for (const asset of loadManifest().assets) {
      for (const relativePath of [asset.output, asset.poster]) {
        const output = path.join(root, relativePath);
        expect(existsSync(output), relativePath).toBe(true);
        expect(statSync(output).size, relativePath).toBeGreaterThan(128);
      }
    }
  });
});
```

Before implementation, correct the two `Set` assertions to use `.size` outside the constructor:

```ts
expect(new Set(manifest.assets.map(({ id }) => id)).size).toBe(16);
expect(new Set(manifest.assets.map(({ output }) => output)).size).toBe(16);
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm test -- tests/unit/convo-ai-assets.test.ts
```

Expected: FAIL because `evidence/convo-ai/media-manifest.json` does not exist.

- [ ] **Step 3: Create the complete manifest**

Create `evidence/convo-ai/media-manifest.json` with these exact IDs and metadata. Fill `sha256` with the already measured source digest for each file during this step; do not use placeholder hashes.

```json
{
  "version": 1,
  "assets": [
    { "id": "app-login", "platform": "app", "sourceName": "登录页.mp4", "output": "public/videos/convo-ai/app-login.mp4", "poster": "public/images/convo-ai/posters/app-login.webp", "duration": 3.2, "width": 592, "height": 1280, "fps": 5, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 1.2 },
    { "id": "app-structure", "platform": "app", "sourceName": "页面结构.mp4", "output": "public/videos/convo-ai/app-structure.mp4", "poster": "public/images/convo-ai/posters/app-structure.webp", "duration": 9.357, "width": 592, "height": 1280, "fps": 27, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 4.5 },
    { "id": "app-conversation-start", "platform": "app", "sourceName": "对话交互启动.mp4", "output": "public/videos/convo-ai/app-conversation-start.mp4", "poster": "public/images/convo-ai/posters/app-conversation-start.webp", "duration": 12.134, "width": 592, "height": 1280, "fps": 30, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 8 },
    { "id": "app-caption-camera", "platform": "app", "sourceName": "开启字幕和摄像头后的ai互动.mp4", "output": "public/videos/convo-ai/app-caption-camera.mp4", "poster": "public/images/convo-ai/posters/app-caption-camera.webp", "duration": 22.833, "width": 220, "height": 480, "fps": 30, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 14 },
    { "id": "app-profile-settings", "platform": "app", "sourceName": "个人设置.mp4", "output": "public/videos/convo-ai/app-profile-settings.mp4", "poster": "public/images/convo-ai/posters/app-profile-settings.webp", "duration": 27.834, "width": 592, "height": 1280, "fps": 18, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 16 },
    { "id": "app-voiceprint-lock", "platform": "app", "sourceName": "声纹锁定.mp4", "output": "public/videos/convo-ai/app-voiceprint-lock.mp4", "poster": "public/images/convo-ai/posters/app-voiceprint-lock.webp", "duration": 23.834, "width": 592, "height": 1280, "fps": 30, "audio": true, "sha256": "c5e21a72971ca8953d8d32453d1a7334f0d296011f2e61f12e8e2be15bce8ef1", "posterTime": 12 },
    { "id": "app-hardware-device", "platform": "app", "sourceName": "添加硬件设备.mp4", "output": "public/videos/convo-ai/app-hardware-device.mp4", "poster": "public/images/convo-ai/posters/app-hardware-device.webp", "duration": 14.167, "width": 448, "height": 960, "fps": 12, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 8 },
    { "id": "app-avatar-select", "platform": "app", "sourceName": "选择数字人.mp4", "output": "public/videos/convo-ai/app-avatar-select.mp4", "poster": "public/images/convo-ai/posters/app-avatar-select.webp", "duration": 9.967, "width": 592, "height": 1280, "fps": 4, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 5 },
    { "id": "app-avatar-interaction", "platform": "app", "sourceName": "开启数字人后的交互.mp4", "output": "public/videos/convo-ai/app-avatar-interaction.mp4", "poster": "public/images/convo-ai/posters/app-avatar-interaction.webp", "duration": 8.893, "width": 592, "height": 1280, "fps": 28, "audio": true, "sha256": "SOURCE_SHA256", "posterTime": 6 },
    { "id": "web-login", "platform": "web", "sourceName": "web-登录.mp4", "output": "public/videos/convo-ai/web-login.mp4", "poster": "public/images/convo-ai/posters/web-login.webp", "duration": 5.3, "width": 1291, "height": 816, "fps": 30, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 2.5 },
    { "id": "web-preflight", "platform": "web", "sourceName": "web-启动前.mp4", "output": "public/videos/convo-ai/web-preflight.mp4", "poster": "public/images/convo-ai/posters/web-preflight.webp", "duration": 25.267, "width": 1290, "height": 816, "fps": 30, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 12 },
    { "id": "web-preflight-layout", "platform": "web", "sourceName": "web-启动前的交互:布局.mov", "output": "public/videos/convo-ai/web-preflight-layout.mp4", "poster": "public/images/convo-ai/posters/web-preflight-layout.webp", "duration": 17.928, "width": 2486, "height": 1598, "fps": 57.6, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 8 },
    { "id": "web-join-exit", "platform": "web", "sourceName": "web-加入和退出.mov", "output": "public/videos/convo-ai/web-join-exit.mp4", "poster": "public/images/convo-ai/posters/web-join-exit.webp", "duration": 22.598, "width": 2486, "height": 1598, "fps": 57.39, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 12 },
    { "id": "web-conversation", "platform": "web", "sourceName": "web-聊天互动.mov", "output": "public/videos/convo-ai/web-conversation.mp4", "poster": "public/images/convo-ai/posters/web-conversation.webp", "duration": 35.135, "width": 2486, "height": 1598, "fps": 56.78, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 20 },
    { "id": "web-interrupt", "platform": "web", "sourceName": "web- 语音打断.mov", "output": "public/videos/convo-ai/web-interrupt.mp4", "poster": "public/images/convo-ai/posters/web-interrupt.webp", "duration": 11.482, "width": 2486, "height": 1598, "fps": 56.79, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 6 },
    { "id": "web-realtime-data", "platform": "web", "sourceName": "web-实时监控数据.mov", "output": "public/videos/convo-ai/web-realtime-data.mp4", "poster": "public/images/convo-ai/posters/web-realtime-data.webp", "duration": 26.457, "width": 2486, "height": 1598, "fps": 57.2, "audio": false, "sha256": "SOURCE_SHA256", "posterTime": 16 }
  ]
}
```

The string `SOURCE_SHA256` above is an instruction marker for plan readability, not permitted in the saved manifest. Replace every occurrence with the digest returned by:

```bash
shasum -a 256 "/Users/admin/Desktop/声网 作品集 整理/convo ai demo/<sourceName>"
```

- [ ] **Step 4: Add the asset-preparation command**

Add this script entry to `package.json`:

```json
"prepare:convo-ai": "node scripts/prepare-convo-ai-assets.mjs"
```

- [ ] **Step 5: Run the metadata-only test**

Run:

```bash
npm test -- tests/unit/convo-ai-assets.test.ts
```

Expected: the metadata tests pass; the derivative-output test fails because public videos and posters do not yet exist.

- [ ] **Step 6: Commit the asset contract**

```bash
git add evidence/convo-ai/media-manifest.json tests/unit/convo-ai-assets.test.ts package.json
git commit -m "test: define ConvoAI media contract"
```

---

### Task 2: Prepare Complete Browser Media And Posters

**Files:**

- Create: `scripts/prepare-convo-ai-assets.mjs`
- Create: `public/videos/convo-ai/*.mp4`
- Create: `public/images/convo-ai/posters/*.webp`
- Modify: `scripts/validate-publication.mjs`

- [ ] **Step 1: Write the asset-preparation script**

Implement `scripts/prepare-convo-ai-assets.mjs` with these behaviors:

```js
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = path.join(root, 'evidence/convo-ai/media-manifest.json');
const defaultSourceDir = '/Users/admin/Desktop/声网 作品集 整理/convo ai demo';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => code === 0
      ? resolve()
      : reject(new Error(`${command} exited with ${code}`)));
  });
}

async function sha256(filePath) {
  const data = await fs.readFile(filePath);
  return createHash('sha256').update(data).digest('hex');
}

async function readDuration(filePath) {
  const script = [
    'import Foundation',
    'import AVFoundation',
    'let asset = AVURLAsset(url: URL(fileURLWithPath: CommandLine.arguments[1]))',
    'print(CMTimeGetSeconds(asset.duration))',
  ].join('; ');
  let output = '';
  await new Promise((resolve, reject) => {
    const child = spawn('swift', ['-e', script, filePath]);
    child.stdout.on('data', (chunk) => { output += chunk; });
    child.stderr.on('data', () => {});
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolve() : reject(new Error('duration read failed')));
  });
  return Number.parseFloat(output.trim());
}

async function extractPoster(source, posterTime, output) {
  const temporary = path.join(os.tmpdir(), `convo-ai-${path.basename(output, '.webp')}.jpg`);
  const script = [
    'import Foundation',
    'import AVFoundation',
    'import AppKit',
    'let source = URL(fileURLWithPath: CommandLine.arguments[1])',
    'let time = Double(CommandLine.arguments[2])!',
    'let output = URL(fileURLWithPath: CommandLine.arguments[3])',
    'let generator = AVAssetImageGenerator(asset: AVURLAsset(url: source))',
    'generator.appliesPreferredTrackTransform = true',
    'let image = try generator.copyCGImage(at: CMTime(seconds: time, preferredTimescale: 600), actualTime: nil)',
    'let rep = NSBitmapImageRep(cgImage: image)',
    'try rep.representation(using: .jpeg, properties: [.compressionFactor: 0.9])!.write(to: output)',
  ].join('; ');
  await run('swift', ['-e', script, source, String(posterTime), temporary]);
  await sharp(temporary).webp({ quality: 86, effort: 6 }).toFile(output);
  await fs.rm(temporary, { force: true });
}

export async function prepareConvoAiAssets({ sourceDir } = {}) {
  const resolvedSourceDir = sourceDir ?? process.env.CONVO_AI_SOURCE_DIR ?? defaultSourceDir;
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const outputs = [];

  for (const asset of manifest.assets) {
    const source = path.join(resolvedSourceDir, asset.sourceName);
    const videoOutput = path.join(root, asset.output);
    const posterOutput = path.join(root, asset.poster);
    await fs.access(source);
    if (await sha256(source) !== asset.sha256) throw new Error(`Hash mismatch: ${asset.sourceName}`);
    await fs.mkdir(path.dirname(videoOutput), { recursive: true });
    await fs.mkdir(path.dirname(posterOutput), { recursive: true });

    if (path.extname(source).toLowerCase() === '.mov') {
      await run('avconvert', [
        '--source', source,
        '--preset', 'PresetHighestQuality',
        '--output', videoOutput,
        '--replace',
      ]);
    } else {
      await fs.copyFile(source, videoOutput);
    }

    const duration = await readDuration(videoOutput);
    if (Math.abs(duration - asset.duration) > 0.05) {
      throw new Error(`Duration mismatch: ${asset.id} expected ${asset.duration}, got ${duration}`);
    }
    await extractPoster(videoOutput, asset.posterTime, posterOutput);
    outputs.push(asset.output, asset.poster);
  }
  return outputs;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareConvoAiAssets()
    .then((outputs) => console.log(`Prepared ${outputs.length} ConvoAI derivatives.`))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
```

- [ ] **Step 2: Run asset preparation**

Run:

```bash
CONVO_AI_SOURCE_DIR="/Users/admin/Desktop/声网 作品集 整理/convo ai demo" npm run prepare:convo-ai
```

Expected: `Prepared 32 ConvoAI derivatives.`

Do not pass `--start` or `--duration` to `avconvert`.

- [ ] **Step 3: Add required publication paths**

In `scripts/validate-publication.mjs`, add:

```js
'evidence/convo-ai/media-manifest.json',
```

and all outputs generated from `manifest.assets.flatMap(({ output, poster }) => [output, poster])`. If the validator's required-file list must remain static, add the exact thirty-two paths instead of reading the manifest at runtime.

- [ ] **Step 4: Verify derivatives and duration contract**

Run:

```bash
npm test -- tests/unit/convo-ai-assets.test.ts
node scripts/validate-publication.mjs --mode=source
```

Expected: PASS.

- [ ] **Step 5: Commit generated evidence**

```bash
git add scripts/prepare-convo-ai-assets.mjs scripts/validate-publication.mjs public/videos/convo-ai public/images/convo-ai/posters
git commit -m "feat: prepare ConvoAI recording evidence"
```

---

### Task 3: Add Shared Section-Aware Navigation Tones

**Files:**

- Create: `components/convo-ai/convo-ai-tone-controller.tsx`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`
- Modify: `components/case-study/chapter-nav.tsx`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `tests/component/site-header.test.tsx`
- Modify: `tests/component/case-study.test.tsx`

- [ ] **Step 1: Write failing header and chapter-tone tests**

Add to `tests/component/site-header.test.tsx`:

```tsx
it('uses dark as the initial ConvoAI surface and follows shared tone events', () => {
  navigationMocks.pathname = '/en/work/convo-ai/';
  render(<SiteHeader locale="en" />);
  const header = screen.getByRole('banner');
  expect(header).toHaveAttribute('data-surface', 'dark');

  act(() => {
    window.dispatchEvent(new CustomEvent('portfolio-nav-tone', { detail: 'light' }));
  });
  expect(header).toHaveAttribute('data-surface', 'light');
});
```

Add to `tests/component/case-study.test.tsx`:

```tsx
it('updates the chapter rail from the shared navigation tone event', () => {
  render(<ChapterNav chapters={chapters} locale="en" surface="dark" />);
  const root = screen.getByRole('navigation', { name: 'Case study chapters' }).parentElement;
  expect(root).toHaveAttribute('data-surface', 'dark');
  act(() => {
    window.dispatchEvent(new CustomEvent('portfolio-nav-tone', { detail: 'light' }));
  });
  expect(root).toHaveAttribute('data-surface', 'light');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npm test -- tests/component/site-header.test.tsx tests/component/case-study.test.tsx
```

Expected: FAIL because ConvoAI still resolves light initially and neither navigation listens for `portfolio-nav-tone`.

- [ ] **Step 3: Implement the generic tone event in shared navigation**

In both `SiteHeader` and `ChapterNav`, add this state and listener pattern:

```tsx
type NavigationTone = 'light' | 'dark';

useEffect(() => {
  const updateTone = (event: Event) => {
    const tone = (event as CustomEvent<NavigationTone>).detail;
    if (tone === 'light' || tone === 'dark') setSectionSurface(tone);
  };
  window.addEventListener('portfolio-nav-tone', updateTone);
  return () => window.removeEventListener('portfolio-nav-tone', updateTone);
}, []);
```

Remove `convo-ai` from the light routes in `resolveHeaderSurface`, and render:

```tsx
data-surface={sectionSurface ?? resolveHeaderSurface(pathname)}
```

In `ChapterNav`, initialize `sectionSurface` from the `surface` prop and render that state in `data-surface`.

- [ ] **Step 4: Implement the ConvoAI section observer**

Create `components/convo-ai/convo-ai-tone-controller.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

export function ConvoAiToneController() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-convo-nav-tone]'),
    );
    if (!sections.length || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter(({ isIntersecting }) => isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const tone = active?.target.getAttribute('data-convo-nav-tone');
        if (tone === 'light' || tone === 'dark') {
          window.dispatchEvent(new CustomEvent('portfolio-nav-tone', { detail: tone }));
        }
      },
      { rootMargin: '-18% 0px -70% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return null;
}
```

- [ ] **Step 5: Limit transitions to semantic tone properties**

In header and chapter CSS, keep positions and dimensions unchanged. Add 220ms transitions only for `background-color`, `border-color`, `color`, and `box-shadow`.

- [ ] **Step 6: Run focused tests**

```bash
npm test -- tests/component/site-header.test.tsx tests/component/case-study.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit navigation behavior**

```bash
git add components/shell/site-header.tsx components/shell/site-header.module.css components/case-study/chapter-nav.tsx components/case-study/chapter-nav.module.css components/convo-ai/convo-ai-tone-controller.tsx tests/component/site-header.test.tsx tests/component/case-study.test.tsx
git commit -m "feat: synchronize detail navigation tones"
```

---

### Task 4: Build The Typed Media Catalog And Coordinated Player

**Files:**

- Create: `components/convo-ai/convo-ai-media-catalog.ts`
- Create: `components/convo-ai/convo-ai-media.tsx`
- Create: `components/convo-ai/convo-ai-media.module.css`
- Create: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Write failing player tests**

Create `tests/component/convo-ai-media.test.tsx` with tests that assert:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConvoAiPlaylist } from '@/components/convo-ai/convo-ai-media';

afterEach(() => vi.restoreAllMocks());

describe('ConvoAiPlaylist', () => {
  it('renders one stable complete player and switches evidence by explicit command', () => {
    render(<ConvoAiPlaylist ids={['app-login', 'app-structure']} locale="en" />);
    const video = screen.getByLabelText('App entry and sign in');
    expect(video).toHaveAttribute('src', '/videos/convo-ai/app-login.mp4');
    expect(video).toHaveAttribute('poster', '/images/convo-ai/posters/app-login.webp');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).not.toHaveAttribute('loop');
    expect(screen.getByText('00:03.200')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Product structure/i }));
    expect(screen.getByLabelText('Product structure')).toHaveAttribute(
      'src',
      '/videos/convo-ai/app-structure.mp4',
    );
  });

  it('pauses other ConvoAI media and restores a forced playback rate', () => {
    render(<ConvoAiPlaylist ids={['app-login']} locale="en" />);
    const current = screen.getByLabelText('App entry and sign in') as HTMLVideoElement;
    const other = document.createElement('video');
    other.dataset.convoAiVideo = 'true';
    other.pause = vi.fn();
    document.body.append(other);

    fireEvent.play(current);
    expect(other.pause).toHaveBeenCalled();
    Object.defineProperty(current, 'playbackRate', { value: 1.5, writable: true });
    fireEvent.rateChange(current);
    expect(current.playbackRate).toBe(1);
    other.remove();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: FAIL because the catalog and playlist do not exist.

- [ ] **Step 3: Create the typed catalog**

In `components/convo-ai/convo-ai-media-catalog.ts`, define all sixteen IDs and export:

```ts
import type { Locale } from '@/content/types';

export type ConvoAiMediaId =
  | 'app-login'
  | 'app-structure'
  | 'app-conversation-start'
  | 'app-caption-camera'
  | 'app-profile-settings'
  | 'app-voiceprint-lock'
  | 'app-hardware-device'
  | 'app-avatar-select'
  | 'app-avatar-interaction'
  | 'web-login'
  | 'web-preflight'
  | 'web-preflight-layout'
  | 'web-join-exit'
  | 'web-conversation'
  | 'web-interrupt'
  | 'web-realtime-data';

interface LocalizedCopy {
  readonly title: string;
  readonly description: string;
  readonly context: string;
  readonly problem: string;
  readonly decision: string;
  readonly impact: string;
}

export interface ConvoAiMediaItem {
  readonly id: ConvoAiMediaId;
  readonly platform: 'app' | 'web';
  readonly src: string;
  readonly poster: string;
  readonly duration: number;
  readonly width: number;
  readonly height: number;
  readonly audio: boolean;
  readonly copy: Record<Locale, LocalizedCopy>;
}

export const convoAiMedia: Record<ConvoAiMediaId, ConvoAiMediaItem> = {
  'app-login': {
    id: 'app-login', platform: 'app', src: '/videos/convo-ai/app-login.mp4',
    poster: '/images/convo-ai/posters/app-login.webp', duration: 3.2,
    width: 592, height: 1280, audio: true,
    copy: {
      en: { title: 'App entry and sign in', description: 'Complete shipped App entry recording.', context: 'The user enters ConvoAI.', problem: 'The product and primary route must be recognizable immediately.', decision: 'Keep the short entry sequence intact as orientation evidence.', impact: 'The reviewer can locate the start of the mobile journey.' },
      zh: { title: 'App 登录与进入', description: '完整的已上线 App 入口录屏。', context: '用户进入 ConvoAI。', problem: '产品身份与主要入口需要被立即识别。', decision: '完整保留短入口过程，作为后续流程的定位证据。', impact: '评审能够快速理解移动端旅程的起点。' },
    },
  },
  // Add the remaining fifteen entries using the exact metadata from media-manifest.json
  // and the approved CPDI copy from evidence/convo-ai/case-study-blueprint.zh.md.
};

export function getConvoAiMedia(id: ConvoAiMediaId) {
  return convoAiMedia[id];
}
```

Do not leave the two comments above in the completed file. Expand all fifteen entries explicitly before running tests. The English CPDI must be a direct, faithful translation of the approved Chinese evidence analysis; do not invent results.

- [ ] **Step 4: Implement the coordinated playlist**

In `components/convo-ai/convo-ai-media.tsx`, export `ConvoAiPlaylist` with:

```tsx
'use client';

import { AlertCircle, Play, RotateCcw } from 'lucide-react';
import { useId, useRef, useState } from 'react';

import type { Locale } from '@/content/types';
import { getConvoAiMedia, type ConvoAiMediaId } from './convo-ai-media-catalog';
import styles from './convo-ai-media.module.css';

function pauseOtherMedia(current: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>('video[data-convo-ai-video="true"]')
    .forEach((video) => { if (video !== current) video.pause(); });
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${String(minutes).padStart(2, '0')}:${remaining}`;
}

export function ConvoAiPlaylist({
  ids,
  locale,
}: {
  readonly ids: readonly ConvoAiMediaId[];
  readonly locale: Locale;
}) {
  const [activeId, setActiveId] = useState(ids[0]);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const descriptionId = useId();
  const active = getConvoAiMedia(activeId);
  const copy = active.copy[locale];

  return (
    <div className={styles.playlist} data-convo-ai-playlist>
      <div className={styles.queue} aria-label={locale === 'zh' ? '完整录屏列表' : 'Complete recording list'}>
        {ids.map((id, index) => {
          const item = getConvoAiMedia(id);
          return (
            <button key={id} type="button" aria-pressed={id === activeId}
              onClick={() => { videoRef.current?.pause(); setFailed(false); setActiveId(id); }}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{item.copy[locale].title}</strong>
              <small>{formatDuration(item.duration)}</small>
            </button>
          );
        })}
      </div>
      <figure className={styles.evidence}>
        <div className={styles.videoFrame} style={{ aspectRatio: `${active.width} / ${active.height}` }}>
          <video key={active.id} ref={videoRef} data-convo-ai-video="true"
            src={active.src} poster={active.poster} controls playsInline preload="metadata"
            aria-label={copy.title} aria-describedby={descriptionId}
            onPlay={(event) => pauseOtherMedia(event.currentTarget)}
            onRateChange={(event) => { if (event.currentTarget.playbackRate !== 1) event.currentTarget.playbackRate = 1; }}
            onError={() => setFailed(true)} />
          {failed ? (
            <div className={styles.mediaError} role="status">
              <AlertCircle aria-hidden="true" size={18} />
              <span>{locale === 'zh' ? '媒体暂时无法加载' : 'Media unavailable'}</span>
              <button type="button" onClick={() => videoRef.current?.load()}>
                <RotateCcw aria-hidden="true" size={16} />
                {locale === 'zh' ? '重新加载' : 'Reload'}
              </button>
            </div>
          ) : null}
        </div>
        <figcaption id={descriptionId}>
          <span>{active.platform.toUpperCase()} / {formatDuration(active.duration)}</span>
          <p>{copy.description}</p>
        </figcaption>
      </figure>
      <dl className={styles.cpdi}>
        {(['context', 'problem', 'decision', 'impact'] as const).map((key) => (
          <div key={key}><dt>{key}</dt><dd>{copy[key]}</dd></div>
        ))}
      </dl>
    </div>
  );
}
```

Remove the unused `Play` import unless the final player uses it.

- [ ] **Step 5: Add stable player CSS**

Implement CSS with:

```css
.videoFrame {
  position: relative;
  width: 100%;
  min-height: 18rem;
  overflow: hidden;
  border: 1px solid var(--convo-border);
  border-radius: 6px;
  background: #0b0d0f;
}

.videoFrame video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.queue button {
  min-height: 44px;
  border-radius: 0;
}

.queue button[aria-pressed='true'] {
  border-inline-start-color: var(--color-iris-luminous);
}
```

Add complete desktop and mobile layouts without nesting cards. Use the global iris color for control focus and ConvoAI cyan only for media-state labels.

- [ ] **Step 6: Run component tests**

```bash
npm test -- tests/component/convo-ai-media.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit the media player**

```bash
git add components/convo-ai/convo-ai-media-catalog.ts components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css tests/component/convo-ai-media.test.tsx
git commit -m "feat: add complete ConvoAI media playlists"
```

---

### Task 5: Build The Layered Cross-Platform Stage And Product-Theatre Layout

**Files:**

- Modify: `components/convo-ai/convo-ai-media.tsx`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Create: `components/convo-ai/convo-ai-print.css`
- Create: `tests/component/convo-ai-layout.test.tsx`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Write failing layered-stage and layout tests**

Add tests for these exact hooks:

```tsx
expect(container.querySelector('[data-convo-ai-stage]')).toBeVisible();
expect(container.querySelector('[data-convo-web-plane]')).toBeVisible();
expect(container.querySelector('[data-convo-app-device]')).toBeVisible();
expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^ConvoAI$/);
expect(container.querySelector('[data-convo-next-section-hint]')).toBeVisible();
expect(screen.getByRole('navigation', { name: 'Case study chapters' })).toBeVisible();
```

Add a stage interaction test:

```tsx
fireEvent.click(screen.getByRole('button', { name: 'Focus App recording' }));
expect(container.querySelector('[data-convo-ai-stage]')).toHaveAttribute('data-active-platform', 'app');
expect(container.querySelector('[data-convo-web-plane] video')).toBeNull();
expect(container.querySelector('[data-convo-app-device] video')).toBeInTheDocument();
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test -- tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
```

Expected: FAIL because stage hooks and custom layout do not exist.

- [ ] **Step 3: Implement `ConvoAiStage`**

Export a `ConvoAiStage` client component that accepts:

```ts
interface ConvoAiStageProps {
  readonly locale: Locale;
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly webId: ConvoAiMediaId;
  readonly appId: ConvoAiMediaId;
  readonly hero?: boolean;
}
```

Required behavior:

- Initial `activePlatform` is `null`; both surfaces render poster images.
- Explicit Web focus renders only the Web `<video>` and keeps App as poster.
- Explicit App focus pauses/removes Web video and renders only the complete App `<video>`.
- Pointer movement writes clamped `--stage-x` and `--stage-y` values equivalent to at most 4 degrees.
- `onPointerLeave` resets both values to zero.
- The component exposes `data-active-platform`, `data-convo-web-plane`, and `data-convo-app-device`.
- Native media controls remain available once a platform is active.
- `prefers-reduced-motion` CSS removes transforms and transitions.

Use `Play`, `Monitor`, and `Smartphone` from Lucide for focus commands. Do not draw custom SVG icons.

- [ ] **Step 4: Replace the generic ConvoAI wrapper with the approved shell**

`ConvoAiLayout` must:

```tsx
export function ConvoAiLayout({ meta, locale, children, previous, next }: ContentLayoutProps) {
  return (
    <div className={styles.root} data-convo-ai-case>
      <ConvoAiToneController />
      <div className={styles.frame}>
        <aside className={styles.rail}>
          <ChapterNav chapters={meta.chapters ?? []} locale={locale} compactAt="wide" surface="dark" />
        </aside>
        <article className={styles.case} data-case-study>
          <header className={styles.hero} data-convo-nav-tone="dark">
            <ConvoAiStage
              locale={locale}
              eyebrow="AGORA / SHIPPED PRODUCT / APP + WEB"
              title="ConvoAI"
              description={meta.proposition}
              webId="web-join-exit"
              appId="app-conversation-start"
              hero
            />
            <h1 className={styles.srOnly}>ConvoAI</h1>
            <dl className={styles.facts} aria-label={locale === 'zh' ? '项目概况' : 'Project facts'}>
              <div><dt>{locale === 'zh' ? '角色' : 'Role'}</dt><dd>{meta.role}</dd></div>
              <div><dt>{locale === 'zh' ? '终端' : 'Scope'}</dt><dd>App + Web</dd></div>
              <div><dt>{locale === 'zh' ? '产品' : 'Product'}</dt><dd>{locale === 'zh' ? '1 对 1 实时 AI 对话' : '1:1 real-time AI conversation'}</dd></div>
              <div><dt>{locale === 'zh' ? '状态' : 'Status'}</dt><dd>{meta.status}</dd></div>
            </dl>
            <p className={styles.disclosure}>{meta.disclosure}</p>
            <div className={styles.nextHint} data-convo-next-section-hint>
              {locale === 'zh' ? '实时 AI 不是一个普通聊天页。' : 'Real-time AI is not a normal chat page.'}
            </div>
          </header>
          <div className={styles.content}>{children}</div>
          {/* Render the same previous/next semantics already used by MeetingLayout. */}
        </article>
      </div>
    </div>
  );
}
```

Do not keep the `srOnly` H1 if `ConvoAiStage` renders a semantic visible H1. The completed DOM must contain one visible literal `ConvoAI` H1 and no duplicate level-one heading.

- [ ] **Step 5: Implement product-theatre CSS**

Required layout rules:

- Shared desktop grid: `minmax(9rem, 2fr) minmax(0, 10fr)`.
- Hero minimum height leaves at least 4rem of the next light section visible at 1440x900 and 390x844.
- Stage canvas `#0B0D0F`; light editorial canvas `#F3F5F2`.
- Terrain uses flat polygon layers or one committed bitmap; no gradients.
- Web plane about 70% of stage width; App device about 20%.
- Device shell is the only large-radius rectangular element.
- Media tools and repeated evidence frames use radius 6px or less.
- Do not use nested cards.
- Mobile removes 3D transforms, uses a front-facing Web surface, and limits App overlap.

- [ ] **Step 6: Add print fallback**

Create `convo-ai-print.css` so video elements and terrain are hidden in print, posters are visible, text becomes black on white, and all CPDI descriptions remain in document flow.

- [ ] **Step 7: Run component tests**

```bash
npm test -- tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit the layered shell**

```bash
git add components/convo-ai/convo-ai-media.tsx components/convo-ai/convo-ai-media.module.css components/convo-ai/convo-ai-layout.tsx components/convo-ai/convo-ai-layout.module.css components/convo-ai/convo-ai-print.css tests/component/convo-ai-media.test.tsx tests/component/convo-ai-layout.test.tsx
git commit -m "feat: build ConvoAI product theatre"
```

---

### Task 6: Rewrite The Bilingual Case Around Five Decisions

**Files:**

- Modify: `content/work/convo-ai.zh.mdx`
- Modify: `content/work/convo-ai.en.mdx`
- Modify: `tests/unit/convo-ai-content.test.ts`

- [ ] **Step 1: Write the failing bilingual content contract**

Update `tests/unit/convo-ai-content.test.ts` to assert:

```ts
const approvedChapters = [
  'context-thesis',
  'ready',
  'interrupt',
  'trusted-participant',
  'avatar',
  'realtime-system',
  'delivery-reflection',
] as const;

for (const locale of ['en', 'zh'] as const) {
  const entry = getEntry('work', 'convo-ai', locale);
  expect(entry.meta.title).toBe('ConvoAI');
  expect(entry.meta.chapters?.map(({ id }) => id)).toEqual(approvedChapters);
}
```

Read both MDX files as text and assert all sixteen media IDs occur, `Gap`/`缺口` do not occur as headings, and percentage metrics are absent.

- [ ] **Step 2: Run the test to verify it fails**

```bash
npm test -- tests/unit/convo-ai-content.test.ts
```

Expected: FAIL because current metadata and chapter IDs use the seven-section provisional case.

- [ ] **Step 3: Replace Chinese metadata and chapter structure**

Use this exact metadata shape in `content/work/convo-ai.zh.mdx`:

```tsx
export const metadata = {
  type: 'work',
  slug: 'convo-ai',
  locale: 'zh',
  translationKey: 'work.convo-ai',
  title: 'ConvoAI',
  proposition: '让不可见的实时状态，变得可感知、可介入、可恢复。',
  role: '独立负责产品设计（Designer-reported）',
  duration: '未公开',
  status: '正式上线（Designer-reported）',
  disclosure: '界面与交互证据来自项目 Figma 与完整产品录屏；职责和上线状态为设计师陈述，不声明未经证实的业务指标。',
  heroMedia: '/images/convo-ai/figma/web-ready.png',
  evidenceLevel: 'delivered',
  featuredOrder: 3,
  previousSlug: 'call-agent',
  nextSlug: 'meeting',
  caseLabel: 'AGORA CONVOAI / APP + WEB',
  chapters: [
    { id: 'context-thesis', label: '核心命题' },
    { id: 'ready', label: '建立就绪' },
    { id: 'interrupt', label: '夺回话轮' },
    { id: 'trusted-participant', label: '可信参与者' },
    { id: 'avatar', label: '数字人形态' },
    { id: 'realtime-system', label: '实时系统' },
    { id: 'delivery-reflection', label: '交付与反思' },
  ],
};
```

The body must import `ConvoAiStage` and `ConvoAiPlaylist`, assign `data-convo-nav-tone="light"` or `"dark"` to every section, and use these exact playlists:

```tsx
<ConvoAiPlaylist locale="zh" ids={[
  'app-login', 'app-structure', 'app-conversation-start',
  'web-login', 'web-preflight', 'web-preflight-layout', 'web-join-exit',
]} />

<ConvoAiPlaylist locale="zh" ids={[
  'app-caption-camera', 'web-conversation', 'web-interrupt',
]} />

<ConvoAiPlaylist locale="zh" ids={[
  'app-profile-settings', 'app-voiceprint-lock', 'app-hardware-device',
]} />

<ConvoAiPlaylist locale="zh" ids={[
  'app-avatar-select', 'app-avatar-interaction',
]} />

<ConvoAiPlaylist locale="zh" ids={['web-realtime-data']} />
```

Use `ConvoAiStage` only for `ready` and `interrupt`. Use single-device/static Figma evidence for `trusted-participant` and `avatar`, and a wide Web stage for `realtime-system`.

- [ ] **Step 4: Replace English metadata and chapter structure**

Use the same IDs and media order in `content/work/convo-ai.en.mdx`. English metadata differs only in localized copy:

```tsx
title: 'ConvoAI',
proposition: 'Make invisible real-time states perceptible, interruptible, and recoverable.',
role: 'Sole product design ownership (designer-reported)',
status: 'Formally launched (designer-reported)',
```

Use these chapter labels: `Thesis`, `Establish readiness`, `Reclaim the turn`, `Trusted participant`, `Digital human`, `Real-time system`, `Delivery and reflection`.

Translate every Chinese Context, Problem, Decision, and intended Impact faithfully. Keep the same evidence attribution and do not add metrics.

- [ ] **Step 5: Run the content contract**

```bash
npm test -- tests/unit/convo-ai-content.test.ts tests/unit/content-schema.test.ts tests/unit/privacy.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit bilingual content**

```bash
git add content/work/convo-ai.zh.mdx content/work/convo-ai.en.mdx tests/unit/convo-ai-content.test.ts
git commit -m "content: tell ConvoAI through five decisions"
```

---

### Task 7: Complete Responsive Styling, System Evidence, And Accessibility

**Files:**

- Modify: `components/convo-ai/convo-ai-layout.module.css`
- Modify: `components/convo-ai/convo-ai-media.module.css`
- Modify: `tests/component/convo-ai-layout.test.tsx`
- Modify: `tests/component/convo-ai-media.test.tsx`

- [ ] **Step 1: Add failing style-contract tests**

Read both CSS Modules and assert:

```ts
expect(layoutStyles).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/);
expect(mediaStyles).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/);
expect(mediaStyles).toMatch(/prefers-reduced-motion:\s*reduce/);
expect(mediaStyles).toMatch(/object-fit:\s*contain/);
expect(layoutStyles).toMatch(/--convo-live:\s*#19ddd2/i);
expect(layoutStyles).toMatch(/--convo-system:\s*#3866ff/i);
expect(layoutStyles).toMatch(/--convo-interrupt:\s*#ff6458/i);
expect(layoutStyles).toMatch(/word-break:\s*normal/);
expect(layoutStyles).toMatch(/overflow-wrap:\s*break-word/);
```

- [ ] **Step 2: Run tests to verify missing rules fail**

```bash
npm test -- tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
```

Expected: FAIL for any incomplete responsive, motion, or text-fit rule.

- [ ] **Step 3: Finish the visual system**

Implement:

- Dark product bands with `#0B0D0F`, `#F4F7F4`, and `rgba(244,247,244,.64)`.
- Light editorial bands with `#F3F5F2`, `#10110F`, and `rgba(16,17,15,.70)`.
- ConvoAI live, system, and interrupt colors only inside case content.
- A six-state conversation chain with fixed grid tracks and no layout shift.
- A voiceprint mode comparison using three flat columns, not nested cards.
- A real-time data map linking E2E, RTC, ASR, LLM, TTS, and Voiceprint.
- CPDI as an unframed definition list below media.
- Desktop, 768px tablet, and 390px mobile rules.
- No viewport-width font scaling outside existing `clamp()` tokens.
- No negative letter spacing.

- [ ] **Step 4: Finish accessibility states**

Verify and implement:

- 44px minimum media and playlist controls.
- Visible global iris focus rings.
- Text labels alongside cyan, blue, or coral state marks.
- `aria-live="polite"` only for media failure status, not playback progress.
- Decorative topology has `aria-hidden="true"`.
- Long Chinese and English labels wrap without overlap.

- [ ] **Step 5: Run focused tests and lint**

```bash
npm test -- tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
npm run lint
```

Expected: PASS.

- [ ] **Step 6: Commit responsive polish**

```bash
git add components/convo-ai/convo-ai-layout.module.css components/convo-ai/convo-ai-media.module.css tests/component/convo-ai-layout.test.tsx tests/component/convo-ai-media.test.tsx
git commit -m "feat: polish ConvoAI responsive evidence"
```

---

### Task 8: Verify The Full Case In Browser And Static Export

**Files:**

- Modify: `tests/e2e/convo-ai.spec.ts`
- Modify: `tests/e2e/portfolio-detail-system.spec.ts`
- Modify: `tests/unit/publication-validation.test.ts`

- [ ] **Step 1: Replace provisional E2E assertions with approved behavior**

`tests/e2e/convo-ai.spec.ts` must verify for both locales:

```ts
const chapterIds = [
  'context-thesis', 'ready', 'interrupt', 'trusted-participant',
  'avatar', 'realtime-system', 'delivery-reflection',
] as const;

await expect(page.locator('[data-convo-ai-stage]').first()).toBeVisible();
await expect(page.locator('[data-convo-web-plane]').first()).toBeVisible();
await expect(page.locator('[data-convo-app-device]').first()).toBeVisible();
await expect(page.locator('[data-convo-ai-playlist]')).toHaveCount(5);
```

Iterate every playlist button, activate it, and assert the active video has a non-empty `src`, `poster`, `aria-label`, and `aria-describedby`. Count sixteen unique `src` values across the sequence.

- [ ] **Step 2: Add playback coordination and tone assertions**

Use `page.evaluate` to stub `HTMLMediaElement.prototype.pause`, start one video, activate a second playlist item, and assert the previous source receives pause. Scroll from a dark section to a light section and assert both the header and chapter root change to the same `data-surface`.

- [ ] **Step 3: Add responsive and pixel-safety checks**

For desktop, tablet, and mobile:

- Assert horizontal overflow is at most 1px.
- Assert the visible Hero bounds leave a visible next-section hint.
- Assert the App device does not cover the Web stage's control region.
- Assert every visible button and label remains inside its containing box.
- Capture screenshots to `test-results/convo-ai-<locale>-<project>.png` on first implementation review.

- [ ] **Step 4: Add publication validator coverage**

Extend `tests/unit/publication-validation.test.ts` so source validation requires the ConvoAI manifest and representative video/poster paths, and generated HTML accepts ConvoAI videos only when poster and non-empty described text are present.

- [ ] **Step 5: Run focused browser tests**

```bash
npx playwright test tests/e2e/convo-ai.spec.ts tests/e2e/portfolio-detail-system.spec.ts --project=desktop
npx playwright test tests/e2e/convo-ai.spec.ts --project=tablet
npx playwright test tests/e2e/convo-ai.spec.ts --project=mobile
```

Expected: PASS with no missing media, overflow, tone mismatch, or overlap.

- [ ] **Step 6: Run the complete verification suite**

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

Expected: all commands pass. The static export contains `/en/work/convo-ai/` and `/zh/work/convo-ai/`, all thirty-two ConvoAI derivatives, accessible video descriptions, and no publication markers.

- [ ] **Step 7: Inspect final screenshots**

Open desktop and mobile screenshots and verify:

- The stage is nonblank.
- Actual Web and App product UI is readable.
- The topology background does not look like unrelated stock scenery.
- Navigation uses global iris accents.
- ConvoAI cyan, blue, and coral remain inside case content.
- No controls, labels, media, or sections overlap incoherently.

- [ ] **Step 8: Commit final verification**

```bash
git add tests/e2e/convo-ai.spec.ts tests/e2e/portfolio-detail-system.spec.ts tests/unit/publication-validation.test.ts
git commit -m "test: verify ConvoAI case study"
```

---

## Plan Completion Gate

Before declaring implementation complete:

- [ ] The manifest contains exactly nine App and seven Web sources.
- [ ] All App recordings preserve source duration and content.
- [ ] All Web scenario recordings are published as complete evidence.
- [ ] Five decision acts replace the provisional feature sequence.
- [ ] Hero and cross-platform openers use the approved layered stage.
- [ ] Independent front-facing players remain available below the stage.
- [ ] Voiceprint is a full trusted-participant decision.
- [ ] Top and left navigation stay synchronized and retain global iris accents.
- [ ] No Gap/缺口 section or unsupported metric appears.
- [ ] Desktop, tablet, mobile, reduced-motion, loading, failure, and print states pass.
- [ ] Lint, unit/component tests, static build, and Playwright pass.
