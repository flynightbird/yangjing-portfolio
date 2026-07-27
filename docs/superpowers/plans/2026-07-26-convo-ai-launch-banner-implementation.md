# ConvoAI AI Studio Launch Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved bilingual AI Studio launch banner between the ConvoAI hero facts and next-section hint, using the supplied transparent artwork and accessible responsive motion.

**Architecture:** A case-local `ConvoAiLaunchBanner` owns localized copy and the three decorative image layers. `ConvoAiLayout` only chooses placement. Layout and motion remain in the existing ConvoAI CSS module, while focused component, asset, and browser tests enforce content, DOM order, image integrity, responsive containment, and reduced-motion behavior.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Sharp, Playwright

---

### Task 1: Lock the banner content, placement, and asset contract

**Files:**
- Create: `tests/unit/convo-ai-launch-banner-assets.test.ts`
- Modify: `tests/component/convo-ai-layout.test.tsx`

- [ ] **Step 1: Write failing component tests for both locales and DOM order**

Add a `renderLayout(locale)` helper and tests that assert:

```tsx
const banner = container.querySelector('[data-convo-launch-banner]');
const facts = screen.getByRole('group', { name: locale === 'zh' ? '项目概况' : 'Project facts' });
const hint = container.querySelector('[data-convo-next-section-hint]');

expect(banner).toBeVisible();
expect(banner).toHaveAttribute('role', 'region');
expect(banner).toHaveAccessibleName(
  locale === 'zh' ? '声网 AI Studio 正式上线' : 'Agora AI Studio is officially live',
);
expect(banner).toHaveTextContent(
  locale === 'zh'
    ? '自由搭配 ASR、LLM、TTS、数字人等，快速搭建 AI 智能体。'
    : 'Mix and match ASR, LLM, TTS, digital humans, and more to rapidly build AI agents.',
);
expect(facts.compareDocumentPosition(banner!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
expect(banner!.compareDocumentPosition(hint!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

const artwork = banner!.querySelector('[data-convo-launch-artwork]');
expect(artwork).toHaveAttribute('aria-hidden', 'true');
expect(artwork?.querySelectorAll('img')).toHaveLength(3);
expect(banner!.querySelector('a, button')).toBeNull();
```

- [ ] **Step 2: Write a failing static asset test**

Create `tests/unit/convo-ai-launch-banner-assets.test.ts`:

```ts
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';

const assets = [
  ['base.png', 861, 300],
  ['float-robot.png', 148, 142],
  ['float-cloud.png', 107, 77],
] as const;

describe('ConvoAI launch banner assets', () => {
  it.each(assets)('%s preserves its supplied PNG dimensions and alpha channel', async (file, width, height) => {
    const metadata = await sharp(path.join(process.cwd(), 'public/images/convo-ai/launch-banner', file)).metadata();
    expect(metadata).toMatchObject({ format: 'png', width, height, hasAlpha: true });
  });
});
```

- [ ] **Step 3: Run the tests and verify RED**

Run:

```bash
npm test -- tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-launch-banner-assets.test.ts
```

Expected: FAIL because the banner DOM and public assets do not exist.

### Task 2: Implement the case-local banner and source assets

**Files:**
- Create: `components/convo-ai/convo-ai-launch-banner.tsx`
- Create: `public/images/convo-ai/launch-banner/base.png`
- Create: `public/images/convo-ai/launch-banner/float-robot.png`
- Create: `public/images/convo-ai/launch-banner/float-cloud.png`
- Modify: `components/convo-ai/convo-ai-layout.tsx`
- Modify: `components/convo-ai/convo-ai-layout.module.css`

- [ ] **Step 1: Copy the supplied source PNGs without transformation**

Create `public/images/convo-ai/launch-banner/`, then copy:

```text
/Users/admin/Desktop/声网 作品集 整理/作品集配图/convo/正主2.png -> public/images/convo-ai/launch-banner/base.png
/Users/admin/Desktop/声网 作品集 整理/作品集配图/convo/banner小图1.png -> public/images/convo-ai/launch-banner/float-robot.png
/Users/admin/Desktop/声网 作品集 整理/作品集配图/convo/banner小图2.png -> public/images/convo-ai/launch-banner/float-cloud.png
```

- [ ] **Step 2: Create the localized decorative component**

Create `components/convo-ai/convo-ai-launch-banner.tsx`:

```tsx
import Image from 'next/image';
import type { Locale } from '@/lib/i18n/locales';
import styles from './convo-ai-layout.module.css';

const copy = {
  zh: {
    title: '声网 AI Studio 正式上线',
    subtitle: '自由搭配 ASR、LLM、TTS、数字人等，快速搭建 AI 智能体。',
  },
  en: {
    title: 'Agora AI Studio is officially live',
    subtitle: 'Mix and match ASR, LLM, TTS, digital humans, and more to rapidly build AI agents.',
  },
} as const;

export function ConvoAiLaunchBanner({ locale }: { locale: Locale }) {
  const text = copy[locale];

  return (
    <section
      className={styles.launchBanner}
      role="region"
      aria-labelledby="convo-ai-launch-title"
      data-convo-launch-banner
    >
      <div className={styles.launchCopy}>
        <p id="convo-ai-launch-title" className={styles.launchTitle}>{text.title}</p>
        <p className={styles.launchSubtitle}>{text.subtitle}</p>
      </div>
      <div className={styles.launchArtwork} data-convo-launch-artwork aria-hidden="true">
        <Image className={styles.launchBase} src="/images/convo-ai/launch-banner/base.png" alt="" width={861} height={300} />
        <Image className={styles.launchFloatOne} src="/images/convo-ai/launch-banner/float-robot.png" alt="" width={148} height={142} />
        <Image className={styles.launchFloatTwo} src="/images/convo-ai/launch-banner/float-cloud.png" alt="" width={107} height={77} />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Render the banner at the approved hero boundary**

Import `ConvoAiLaunchBanner` in `components/convo-ai/convo-ai-layout.tsx` and render:

```tsx
</dl>
<ConvoAiLaunchBanner locale={locale} />
<div className={styles.nextHint} data-convo-next-section-hint>{text.hint}</div>
```

- [ ] **Step 4: Add desktop, mobile, and reduced-motion styles**

Add banner-local rules to `components/convo-ai/convo-ai-layout.module.css`:

```css
.launchBanner {
  position: relative;
  min-height: 18.75rem;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(90deg, #5954f7 44%, #9eb8f3 78%, #d6dbfc 100%);
  isolation: isolate;
}

.launchCopy {
  position: relative;
  z-index: 2;
  display: grid;
  width: 64%;
  min-height: 18.75rem;
  align-content: center;
  gap: 0.75rem;
  padding-inline: 50px;
}

.launchTitle,
.launchSubtitle { margin: 0; white-space: nowrap; }
.launchTitle { color: #fff; font-size: 1.75rem; font-weight: 650; line-height: 1.2; }
.launchSubtitle { color: rgba(255, 255, 255, 0.9); font-size: 0.8125rem; line-height: 1.5; }
.launchArtwork { position: absolute; z-index: 1; right: 0; bottom: 0; width: 67%; aspect-ratio: 861 / 300; pointer-events: none; }
.launchBase { display: block; width: 100%; height: auto; }
.launchFloatOne,
.launchFloatTwo { position: absolute; height: auto; }
.launchFloatOne { left: 46.5%; top: 7%; width: 17.2%; --convo-launch-travel: 26px; animation: convo-launch-float-one 3.6s ease-in-out infinite; }
.launchFloatTwo { left: 41%; top: 47%; width: 11.16%; --convo-launch-travel: 10px; animation: convo-launch-float-two 5.2s ease-in-out 450ms infinite; }

@keyframes convo-launch-float-one {
  0%, 100% { transform: translateY(-13px) rotate(1.5deg); }
  50% { transform: translateY(13px) rotate(-1.5deg); }
}

@keyframes convo-launch-float-two {
  0%, 100% { transform: translateY(-5px); }
  50% { transform: translateY(5px); }
}

@media (max-width: 800px) {
  .launchBanner { min-height: 25rem; }
  .launchCopy { width: 100%; min-height: 0; align-content: start; gap: 0.625rem; padding: 2rem 20px 0; }
  .launchTitle,
  .launchSubtitle { white-space: normal; }
  .launchTitle { font-size: 1.625rem; }
  .launchSubtitle { max-width: 34ch; font-size: 0.875rem; }
  .launchArtwork { right: -34%; width: 152%; }
}

@media (prefers-reduced-motion: reduce) {
  .launchFloatOne,
  .launchFloatTwo { animation: none; transform: none; }
}
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
npm test -- tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-launch-banner-assets.test.ts tests/unit/convo-ai-content.test.ts
```

Expected: PASS with localized copy, correct placement, three decorative layers, no controls, and exact PNG metadata.

- [ ] **Step 6: Commit the component and assets**

```bash
git add components/convo-ai/convo-ai-launch-banner.tsx components/convo-ai/convo-ai-layout.tsx components/convo-ai/convo-ai-layout.module.css public/images/convo-ai/launch-banner tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-launch-banner-assets.test.ts
git commit -m "feat: add ConvoAI AI Studio launch banner"
```

### Task 3: Verify browser geometry and motion behavior

**Files:**
- Modify: `tests/e2e/convo-ai.spec.ts`
- Modify if browser evidence exposes a Convo-only issue: `components/convo-ai/convo-ai-layout.module.css`

- [ ] **Step 1: Add browser assertions for desktop, mobile, and motion**

In each locale suite, assert the banner is visible, has `16px` radius, stays between facts and hint, and does not overflow. For desktop, assert title/subtitle are single-line and artwork width is about `67%` of the banner. For mobile, set the viewport to exactly `375 x 812`, assert `20px` equal copy padding, wrapped copy above the artwork, no horizontal page overflow, and artwork remains clipped within the banner. Assert float one exposes `26px`, float two exposes `10px`, and float two is about `11.16%` of the artwork group. Emulate reduced motion and assert both animations compute to `none`.

- [ ] **Step 2: Run browser tests and verify RED if geometry needs adjustment**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile
```

Expected before final CSS tuning: at least one new geometry or motion assertion fails for a specific measurable reason.

- [ ] **Step 3: Adjust only banner-local CSS until the browser contract passes**

Keep the approved gradient stops, desktop `50px` copy padding, mobile `20px` copy padding, desktop `67%` artwork scale, overlay coordinates, travel distances, durations, delay, and reduced-motion behavior unchanged. Tune only typography, banner height, and mobile crop values needed to prevent overlap or overflow.

- [ ] **Step 4: Run focused browser coverage and capture screenshots**

Run:

```bash
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile
```

Expected: PASS. Inspect the latest English and Chinese ConvoAI desktop/mobile screenshots for readable text, purposeful artwork crop, no overlap, and no horizontal overflow.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test -- tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-launch-banner-assets.test.ts tests/unit/convo-ai-content.test.ts tests/unit/convo-ai-heading-system.test.ts
npx eslint components/convo-ai/convo-ai-launch-banner.tsx components/convo-ai/convo-ai-layout.tsx tests/component/convo-ai-layout.test.tsx tests/unit/convo-ai-launch-banner-assets.test.ts tests/e2e/convo-ai.spec.ts
npx playwright test tests/e2e/convo-ai.spec.ts --project=desktop --project=mobile
```

Expected: all commands PASS.

- [ ] **Step 6: Commit browser coverage and any measured CSS correction**

```bash
git add components/convo-ai/convo-ai-layout.module.css tests/e2e/convo-ai.spec.ts
git commit -m "test: verify ConvoAI launch banner behavior"
```

