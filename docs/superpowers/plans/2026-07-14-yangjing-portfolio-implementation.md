# Yang Jing Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish Yang Jing's bilingual Product Designer × AI-native Builder portfolio as a static, accessible Next.js site with ByteDance, Call Agent, Meeting, and the single confirmed STT Demo Build Lab entry.

**Architecture:** Replace the current single-page Vite shell in place with a Next.js App Router static export while retaining the completed Call Agent evidence, privacy processing, PDF, and test intent. Typed bilingual MDX is registered at build time, Zod validation blocks incomplete or unsafe public builds, and focused client islands provide the Hero, Meeting sequence, locale persistence, and other high-value motion without turning case reading into a client-rendered app.

**Tech Stack:** Next.js 16.2.10, React 19.2.7, TypeScript 7.0.2, MDX 3.1.1, Zod 4.4.3, Motion 12.42.2, Lucide React 1.24.0, Sharp 0.35.3, Vitest 4.1.10, Testing Library 16.3.2, Playwright 1.61.1, CSS Modules/custom properties, Cloudflare Pages static hosting

---

## Verified Starting Point

- `main` is clean at commit `cd38b32` before this plan and directly descends from the completed Call Agent commit `b399b28`; no unrelated-history merge is required.
- The current app is Vite/HTML/CSS/JavaScript and contains seven processed Call Agent images, `portfolio/call-agent-case-study.pdf`, a destructive redaction script, a sensitive-content validator, Node tests, Playwright tests, print styles, and a GitHub Pages workflow.
- `https://github.com/flynightbird/stt-demo` is the only Build Lab project at launch. Its inspected source revision is `e5e840a`; the root HTML/CSS/JavaScript prototype is the visual source of truth and its component library contains design-audit and visual-regression evidence.
- Neither checked STT GitHub Pages URL currently returns `200`. The portfolio therefore vendors a pinned interactive snapshot at `/demos/stt-demo/`, links to the source repository, and does not advertise an external live URL until one actually passes the link check.
- Portrait photography, ByteDance PDF/cover, Meeting exports, bilingual resumes, email, LinkedIn, and WeChat data are not currently in the repository. Production validation must fail clearly until the exact publication inputs below are supplied.

## Publication Input Contract

The implementation must never invent personal details, metrics, client claims, or evidence. Before the production build in Task 17, place the approved public files at these exact paths:

```text
public/images/profile/yang-jing-hero.avif
public/images/profile/yang-jing-about.avif
public/images/bytedance/cover.avif
public/files/yang-jing-bytedance-case-study.pdf
public/images/meeting/shipped-room-overview.avif
public/images/meeting/shipped-control-states.avif
public/images/meeting/retrospective-state-model.avif
public/videos/meeting/interaction-sequence.mp4
public/videos/meeting/interaction-sequence.vtt
public/images/meeting/interaction-sequence-poster.avif
public/files/yang-jing-resume-en.pdf
public/files/yang-jing-resume-zh.pdf
public/images/contact/wechat-qr.avif
content/profile/contact.private.json
```

`content/profile/contact.private.json` is committed only after Yang Jing approves its public values and has this exact shape:

```json
{
  "email": "the approved public email address",
  "linkedin": "the approved public LinkedIn HTTPS URL",
  "wechatId": "the approved public WeChat ID",
  "resumeRevision": "the actual YYYY-MM-DD revision date"
}
```

The descriptive strings above define the required real values; they must not be written literally into the JSON file. Local development can run component and unit tests without these inputs, but `npm run verify:publish` and Cloudflare deployment must stop with a list of missing paths or invalid fields.

## Target File Map

```text
app/
  globals.css                         global reset, typography, tokens, utilities
  layout.tsx                          root metadata and document shell
  page.tsx                            accessible locale resolver at `/`
  not-found.tsx                       bilingual static 404
  [locale]/
    layout.tsx                        locale validation, fonts, header/footer
    page.tsx                          locale homepage composition
    about/page.tsx                    biography, timeline, resumes, direct contact
    work/[slug]/page.tsx              ByteDance, Call Agent, Meeting static routes
    build/[slug]/page.tsx             STT Demo static route
components/
  shell/                              header, footer, locale switch, analytics
  hero/                               split Hero and motion client island
  home/                               editorial featured-work sections
  case-study/                         case shell, chapter nav, evidence, PDF actions
    print.css                         stable native-case A4 print treatment
  meeting/                            state model and scroll-linked sequence
  build-lab/                          local demo frame and evidence ledger
  contact/                            direct contact and resume actions
  media/                              responsive image, video, lightbox
content/
  schema.ts                           Zod metadata schemas and vocabularies
  types.ts                            shared Locale, WorkSlug, BuildSlug types
  registry.ts                         explicit MDX imports and route lookup
  navigation.ts                       project order and previous/next resolution
  dictionaries/en.ts                  English shell/UI strings
  dictionaries/zh.ts                  Simplified Chinese shell/UI strings
  profile/about.en.mdx                English biography and principles
  profile/about.zh.mdx                Chinese biography and principles
  profile/contact.private.json        approved public contact values
  work/bytedance.en.mdx               phase-one PDF wrapper content
  work/bytedance.zh.mdx               phase-one PDF wrapper content
  work/call-agent.en.mdx              English native case
  work/call-agent.zh.mdx              Chinese native case migrated from current HTML
  work/meeting.en.mdx                 English Interaction Deep Dive
  work/meeting.zh.mdx                 Chinese Interaction Deep Dive
  build/stt-demo.en.mdx               English Build Lab story
  build/stt-demo.zh.mdx               Chinese Build Lab story
evidence/
  call-agent/manifest.json            portable source/redaction manifest
  media/manifest.json                 responsive source/output dimensions and formats
  stt-demo/source.json                pinned repository and commit provenance
lib/
  content/validate.ts                 locale pair, metadata, asset, link checks
  content/privacy.ts                  sensitive-text patterns and allowlist logic
  i18n/locales.ts                     locale guards and translated href helpers
  analytics/events.ts                 privacy-limited event vocabulary
  media/assets.ts                     typed public asset references
public/
  demos/stt-demo/                     pinned interactive prototype snapshot
  images/call-agent/                  existing seven processed public images
  files/call-agent-case-study-zh.pdf   retained existing PDF
scripts/
  prepare-call-agent-assets.mjs        retained destructive crop/redaction pipeline
  generate-responsive-media.mjs        AVIF/WebP/raster variant generator
  sync-stt-demo.mjs                    imports only the pinned public demo files
  validate-publication.mjs             production input/privacy/link gate
tests/
  unit/                                schema, registry, i18n, privacy, event tests
  component/                           Hero, navigation, contact, case controls
  e2e/                                 route, responsive, keyboard, motion, file tests
  visual/                              desktop/mobile screenshot assertions
```

## Task 1: Protect the Existing Call Agent Baseline

**Files:**
- Read: `index.html`
- Read: `src/**`
- Read: `public/images/**`
- Read: `portfolio/call-agent-case-study.pdf`
- Read: `scripts/prepare-assets.mjs`
- Read: `scripts/validate-content.mjs`
- Read: `tests/**`
- Create: `docs/migration/call-agent-baseline.md`

- [ ] **Step 1: Create an isolated implementation worktree**

Run:

```bash
git status --short
git worktree add ../yangjing-portfolio-nextjs -b codex/portfolio-nextjs main
cd ../yangjing-portfolio-nextjs
```

Expected: the status output is empty and the new worktree is on `codex/portfolio-nextjs` at the approved spec/plan commit.

- [ ] **Step 2: Verify the current Vite delivery before migration**

Run:

```bash
npm ci
npx playwright install chromium
npm test
npm run validate
npm run build
npm run test:e2e
```

Expected: Node content tests, validation, Vite build, and all desktop/tablet/mobile Playwright projects pass. Record any environment-only failure before changing files.

- [ ] **Step 3: Record immutable migration facts**

Create `docs/migration/call-agent-baseline.md` with the source commit, eight chapter IDs, seven processed image filenames, the PDF checksum, and the exact verification commands:

```bash
shasum -a 256 portfolio/call-agent-case-study.pdf public/images/*
```

Expected chapter IDs:

```text
overview
context-role
design-thesis
decision-path
decision-preview
decision-operate
system-delivery
outcome-learnings
```

- [ ] **Step 4: Commit the baseline record**

```bash
git add docs/migration/call-agent-baseline.md
git commit -m "docs: record call agent migration baseline"
```

## Task 2: Replace Vite With a Tested Next.js Static Shell

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `next.config.mjs`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `mdx-components.tsx`
- Create: `types/mdx.d.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/not-found.tsx`
- Create: `tests/unit/architecture.test.ts`
- Delete after passing tests: `vite.config.mjs`
- Delete after content migration: `index.html`

- [ ] **Step 1: Write the failing architecture test**

```ts
// tests/unit/architecture.test.ts
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(import.meta.dirname, '../..');

describe('static portfolio architecture', () => {
  it('uses Next static export and MDX', () => {
    const nextConfig = fs.readFileSync(path.join(root, 'next.config.mjs'), 'utf8');
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(nextConfig).toContain("output: 'export'");
    expect(nextConfig).toContain("pageExtensions: ['ts', 'tsx', 'md', 'mdx']");
    expect(packageJson.scripts.build).toBe('next build');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run tests/unit/architecture.test.ts`

Expected: FAIL because `next.config.mjs` and Vitest are not yet configured.

- [ ] **Step 3: Install the pinned application and test dependencies**

Run:

```bash
npm install next@16.2.10 react@19.2.7 react-dom@19.2.7 motion@12.42.2 lucide-react@1.24.0 zod@4.4.3 @next/mdx@16.2.10 @mdx-js/loader@3.1.1 @mdx-js/react@3.1.1 remark-frontmatter@5.0.0 remark-mdx-frontmatter@5.2.0 @fontsource/archivo-black@5.2.8 @fontsource/libre-franklin@5.2.8 @fontsource/dm-mono@5.2.7 @fontsource/noto-sans-sc@5.2.9
npm install -D typescript@7.0.2 vitest@4.1.10 jsdom@29.1.1 @testing-library/react@16.3.2 @testing-library/jest-dom@6.9.1 @testing-library/user-event@14.6.1 @playwright/test@1.61.1 sharp@0.35.3 eslint@10.7.0 eslint-config-next@16.2.10 @types/node @types/react @types/react-dom
```

- [ ] **Step 4: Create the minimal static configuration**

```js
// next.config.mjs
import createMDX from '@next/mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const withMDX = createMDX({
  options: { remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter] }
});

export default withMDX({
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  pageExtensions: ['ts', 'tsx', 'md', 'mdx']
});
```

Set these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "lint": "eslint .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:visual": "playwright test tests/visual",
    "prepare:assets": "node scripts/prepare-call-agent-assets.mjs",
    "sync:stt": "node scripts/sync-stt-demo.mjs",
    "verify:publish": "node scripts/validate-publication.mjs && npm run lint && npm test && npm run build && npm run test:e2e"
  }
}
```

Create `app/layout.tsx`, `app/page.tsx`, and `app/not-found.tsx` as server components. The root page must render a normal `/en/` link plus the locale resolver client component added in Task 4; the 404 must present both `/en/` and `/zh/` links.

- [ ] **Step 5: Run the test and static build**

Run:

```bash
npm test -- tests/unit/architecture.test.ts
npm run build
test -f out/index.html
test -f out/404.html
```

Expected: PASS; `out/index.html` and `out/404.html` exist.

- [ ] **Step 6: Commit the application foundation**

```bash
git add package.json package-lock.json next.config.mjs tsconfig.json next-env.d.ts eslint.config.mjs vitest.config.ts vitest.setup.ts mdx-components.tsx types/mdx.d.ts app tests/unit/architecture.test.ts
git rm vite.config.mjs
git commit -m "chore: migrate portfolio foundation to next static export"
```

## Task 3: Define Typed Bilingual Content and Navigation

**Files:**
- Create: `content/types.ts`
- Create: `content/schema.ts`
- Create: `content/registry.ts`
- Create: `content/navigation.ts`
- Create: `content/dictionaries/en.ts`
- Create: `content/dictionaries/zh.ts`
- Create: `lib/i18n/locales.ts`
- Create: `lib/content/validate.ts`
- Create: `tests/unit/content-schema.test.ts`
- Create: `tests/unit/navigation.test.ts`
- Create: `tests/unit/i18n.test.ts`

- [ ] **Step 1: Write failing metadata and route-pair tests**

```ts
// tests/unit/content-schema.test.ts
import { describe, expect, it } from 'vitest';
import { contentMetaSchema } from '@/content/schema';

const valid = {
  slug: 'call-agent', locale: 'en', translationKey: 'work-call-agent',
  title: 'Call Agent', proposition: 'Make AI visible, testable, and controllable before release.',
  type: 'work', role: 'Lead Product Designer', duration: '9 months',
  status: 'Limited beta', disclosure: 'Public, destructively redacted',
  heroMedia: '/images/call-agent/ai-preview-live.png', evidenceLevel: 'observed',
  featuredOrder: 2, previousSlug: 'bytedance', nextSlug: 'meeting'
};

describe('content metadata', () => {
  it('accepts the approved vocabulary', () => {
    expect(contentMetaSchema.parse(valid)).toEqual(valid);
  });

  it('rejects unsupported evidence claims', () => {
    expect(() => contentMetaSchema.parse({ ...valid, evidenceLevel: 'proven-growth' })).toThrow();
  });
});
```

```ts
// tests/unit/navigation.test.ts
import { expect, it } from 'vitest';
import { featuredOrder } from '@/content/navigation';

it('keeps the approved homepage order with one Build Lab entry', () => {
  expect(featuredOrder).toEqual([
    'work/bytedance', 'work/call-agent', 'work/meeting', 'build/stt-demo'
  ]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/unit/content-schema.test.ts tests/unit/navigation.test.ts tests/unit/i18n.test.ts`

Expected: FAIL because the content and locale modules do not exist.

- [ ] **Step 3: Implement the exact shared types**

```ts
// content/types.ts
export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];
export const workSlugs = ['bytedance', 'call-agent', 'meeting'] as const;
export type WorkSlug = (typeof workSlugs)[number];
export const buildSlugs = ['stt-demo'] as const;
export type BuildSlug = (typeof buildSlugs)[number];
export type ContentKind = 'work' | 'build';
export type EvidenceLevel = 'delivered' | 'observed' | 'retrospective' | 'prototype';
```

Implement `contentMetaSchema` with every approved frontmatter field, enum-backed locale/type/evidence values, positive `featuredOrder`, absolute public media paths, and non-empty disclosure text. Implement `assertCompleteRegistry()` so it rejects duplicate slug-locale pairs, duplicate translation keys within a locale, missing `en`/`zh` pairs, missing assets, and navigation targets outside the registry.

- [ ] **Step 4: Define the only approved feature order and translated path helper**

```ts
// content/navigation.ts
export const featuredOrder = [
  'work/bytedance',
  'work/call-agent',
  'work/meeting',
  'build/stt-demo'
] as const;
```

`translatedPath('/en/work/call-agent', 'zh')` must return `/zh/work/call-agent`; unknown paths must return `/zh` plus a boolean that lets the UI disclose the fallback.

- [ ] **Step 5: Run tests and commit**

```bash
npm test -- tests/unit/content-schema.test.ts tests/unit/navigation.test.ts tests/unit/i18n.test.ts
git add content lib/i18n lib/content tests/unit
git commit -m "feat: add typed bilingual content contracts"
```

Expected: all targeted tests PASS.

## Task 4: Build Locale Routing and the Global Shell

**Files:**
- Modify: `app/page.tsx`
- Create: `app/[locale]/layout.tsx`
- Create: `app/[locale]/page.tsx`
- Create: `components/shell/locale-resolver.tsx`
- Create: `components/shell/site-header.tsx`
- Create: `components/shell/site-footer.tsx`
- Create: `components/shell/locale-switcher.tsx`
- Create: `components/shell/resume-menu.tsx`
- Create: `tests/component/locale-switcher.test.tsx`
- Create: `tests/e2e/locale.spec.ts`

- [ ] **Step 1: Write failing locale behavior tests**

```tsx
// tests/component/locale-switcher.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { LocaleSwitcher } from '@/components/shell/locale-switcher';

it('preserves route identity and persists the selected locale', async () => {
  const replace = vi.fn();
  render(<LocaleSwitcher locale="en" pathname="/en/work/call-agent" replace={replace} />);
  await userEvent.click(screen.getByRole('button', { name: '中文' }));
  expect(localStorage.getItem('yj-locale')).toBe('zh');
  expect(replace).toHaveBeenCalledWith('/zh/work/call-agent');
});
```

- [ ] **Step 2: Run the component test to verify it fails**

Run: `npm test -- tests/component/locale-switcher.test.tsx`

Expected: FAIL because `LocaleSwitcher` does not exist.

- [ ] **Step 3: Implement static locale generation and validation**

`app/[locale]/layout.tsx` must export `generateStaticParams()` returning `[{ locale: 'en' }, { locale: 'zh' }]`, call `notFound()` for any other segment, apply the correct `lang`, and render skip link, header, main slot, and footer. The locale resolver reads `localStorage['yj-locale']`, uses `location.replace('/zh/')` only for a stored Chinese preference, and otherwise resolves `/en/`; it keeps the server-rendered `/en/` link available when JavaScript is disabled.

- [ ] **Step 4: Implement compact global navigation**

Header commands are exactly Work, About, Resume, Contact, and the language switch. Resume opens a two-option menu for the English and Chinese PDFs; no navigation item opens a contact form. Use Lucide icons for menu, download, external-link, and copy controls, each with an accessible name and tooltip when the icon alone is shown. The footer repeats direct contact and resume access, then shows copyright, current year, and the privacy statement that the static site uses Cloudflare Web Analytics without a contact form.

- [ ] **Step 5: Verify routing and commit**

Run:

```bash
npm test -- tests/component/locale-switcher.test.tsx
npm run build
npx playwright test tests/e2e/locale.spec.ts
```

Expected: `/` resolves predictably, `/en/` and `/zh/` render, the switch preserves a case route, and a fresh browser defaults to English.

```bash
git add app components/shell tests/component/locale-switcher.test.tsx tests/e2e/locale.spec.ts
git commit -m "feat: add bilingual routing and global navigation"
```

## Task 5: Implement the Interface X-Ray Visual Foundation

**Files:**
- Create: `app/globals.css`
- Create: `components/shell/site-header.module.css`
- Create: `components/shell/site-footer.module.css`
- Create: `components/ui/action-link.tsx`
- Create: `components/ui/action-link.module.css`
- Create: `tests/unit/design-tokens.test.ts`

- [ ] **Step 1: Write the failing visual-token test**

```ts
import fs from 'node:fs';
import { expect, it } from 'vitest';

const css = fs.readFileSync('app/globals.css', 'utf8');

it('defines the approved Interface X-Ray palette and geometry', () => {
  for (const token of ['#F3F5F2', '#10110F', '#B7FF3C', '#194BFF', '#FF654D']) {
    expect(css.toUpperCase()).toContain(token);
  }
  expect(css).toContain('--radius-max: 6px');
  expect(css).toContain('letter-spacing: 0');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/design-tokens.test.ts`

Expected: FAIL because `app/globals.css` does not contain the approved system.

- [ ] **Step 3: Define tokens, font loading, and responsive grid**

Use CSS custom properties named `--color-paper`, `--color-carbon`, `--color-signal`, `--color-cobalt`, `--color-coral`, `--space-*`, `--content-max`, `--reading-max`, `--header-height`, and `--radius-max`. Import only Archivo Black 400, Libre Franklin 400/500/600, DM Mono 400/500, and the required Noto Sans SC weights. Add explicit stepped type sizes at `480px`, `768px`, and `1200px`; do not use viewport-width font sizing or negative letter spacing.

- [ ] **Step 4: Add reusable command styling and states**

`ActionLink` supports `primary`, `secondary`, and `text` treatments, a Lucide icon, external-link labeling, hover, active, focus-visible, and disabled states. Minimum touch size is `44px`; radius never exceeds `6px`.

- [ ] **Step 5: Run token tests, lint, and commit**

```bash
npm test -- tests/unit/design-tokens.test.ts
npm run lint
git add app/globals.css components/shell components/ui tests/unit/design-tokens.test.ts
git commit -m "feat: establish interface x-ray design system"
```

## Task 6: Build the Dual-Identity Hero

**Files:**
- Create: `components/hero/dual-identity-hero.tsx`
- Create: `components/hero/hero-motion.tsx`
- Create: `components/hero/dual-identity-hero.module.css`
- Create: `tests/component/dual-identity-hero.test.tsx`
- Create: `tests/e2e/hero.spec.ts`
- Require: `public/images/profile/yang-jing-hero.avif`

- [ ] **Step 1: Write the failing semantic and reduced-motion tests**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { DualIdentityHero } from '@/components/hero/dual-identity-hero';

it('communicates both capabilities without obscuring the portrait', () => {
  render(<DualIdentityHero locale="en" reducedMotion />);
  expect(screen.getByRole('heading', { name: /Yang Jing/i })).toBeVisible();
  expect(screen.getByText('Product Designer')).toBeVisible();
  expect(screen.getByText('AI-native Builder')).toBeVisible();
  expect(screen.getByAltText(/Portrait of Yang Jing/)).toBeVisible();
  expect(screen.getByTestId('system-scan')).toHaveAttribute('data-motion', 'static');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/component/dual-identity-hero.test.tsx`

Expected: FAIL because the Hero modules do not exist.

- [ ] **Step 3: Implement the server-rendered Hero composition**

The first viewport contains Yang Jing's name, the two role labels, supporting copy naming consumer scale, AI/B2B systems, Vibe Coding, prototyping, and shipping, the central real portrait, and the top edge of the ByteDance section. The portrait uses stable dimensions and `object-position` values reviewed against the actual photo; the `YJ / System Scan` layer stays outside the facial focal region.

- [ ] **Step 4: Implement the focused motion island**

Use Motion only in `hero-motion.tsx`: nav reveal, two role entrances, portrait opacity resolve, scan activation, and a pointer-driven maximum `8px` scan-layer offset on fine-pointer devices. `prefers-reduced-motion` and all coarse pointers render the final static state with no pointer listener.

- [ ] **Step 5: Verify desktop and mobile framing**

Run:

```bash
npm test -- tests/component/dual-identity-hero.test.tsx
npx playwright test tests/e2e/hero.spec.ts --project=desktop --project=mobile
```

Expected: both identities and part of ByteDance are visible without scroll at `1440×900` and `390×844`; no text intersects the portrait, nav, or next section; reduced motion has no transforms that change reading order.

- [ ] **Step 6: Commit the Hero**

```bash
git add components/hero tests/component/dual-identity-hero.test.tsx tests/e2e/hero.spec.ts public/images/profile/yang-jing-hero.avif
git commit -m "feat: build dual identity portfolio hero"
```

## Task 7: Compose the Homepage Project Narrative

**Files:**
- Modify: `app/[locale]/page.tsx`
- Create: `components/home/featured-work.tsx`
- Create: `components/home/featured-project.tsx`
- Create: `components/home/meeting-preview.tsx`
- Create: `components/home/build-lab-preview.tsx`
- Create: `components/home/about-preview.tsx`
- Create: `components/home/home.module.css`
- Create: `tests/component/featured-work.test.tsx`
- Create: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write the failing order test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { FeaturedWork } from '@/components/home/featured-work';

it('renders the approved four-entry sequence with one Build Lab project', () => {
  render(<FeaturedWork locale="en" />);
  const links = screen.getAllByRole('link', { name: /view case|explore build/i });
  expect(links.map((link) => link.getAttribute('href'))).toEqual([
    '/en/work/bytedance/', '/en/work/call-agent/', '/en/work/meeting/', '/en/build/stt-demo/'
  ]);
  expect(screen.getAllByTestId('build-lab-entry')).toHaveLength(1);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/component/featured-work.test.tsx`

Expected: FAIL because homepage project components do not exist.

- [ ] **Step 3: Implement differentiated editorial sections**

ByteDance and Call Agent are full-width editorial bands with real media, proposition, role, evidence/status, and detail action. Meeting is a shorter coral-accented state transition preview. STT Demo is a single focused Build Lab band with interactive-demo, design-system, and source evidence actions; do not render an empty second column or fake companion project.

- [ ] **Step 4: Add About, collaboration, and contact transitions**

The homepage About preview stays within one concise English paragraph or 60–90 Chinese characters. Follow it with the exact approved freelance offer, `Product design + AI prototyping, from complex idea to working experience.`, localized faithfully, then direct email/LinkedIn/WeChat actions supplied by Task 12.

- [ ] **Step 5: Verify hierarchy and commit**

```bash
npm test -- tests/component/featured-work.test.tsx
npx playwright test tests/e2e/home.spec.ts --project=desktop --project=mobile
git add app/[locale]/page.tsx components/home tests/component/featured-work.test.tsx tests/e2e/home.spec.ts
git commit -m "feat: compose editorial homepage project sequence"
```

Expected: project order is exact; each entry has a unique route and real visual; there is no repeated generic card grid.

## Task 8: Migrate Call Agent Into the Native Case System

**Files:**
- Create: `app/[locale]/work/[slug]/page.tsx`
- Create: `components/case-study/case-layout.tsx`
- Create: `components/case-study/chapter-nav.tsx`
- Create: `components/case-study/evidence-figure.tsx`
- Create: `components/case-study/print.css`
- Create: `components/media/lightbox.tsx`
- Create: `content/work/call-agent.zh.mdx`
- Create: `content/work/call-agent.en.mdx`
- Move: `public/images/*.png` and `public/images/*.jpg` to `public/images/call-agent/`
- Move: `portfolio/call-agent-case-study.pdf` to `public/files/call-agent-case-study-zh.pdf`
- Move: `assets/manifest.json` to `evidence/call-agent/manifest.json`
- Rename/modify: `scripts/prepare-assets.mjs` to `scripts/prepare-call-agent-assets.mjs`
- Migrate: `tests/case-study.spec.mjs` to `tests/e2e/call-agent.spec.ts`
- Migrate: `tests/content.test.mjs` to `tests/unit/privacy.test.ts`
- Create: `tests/unit/call-agent-regression.test.ts`

- [ ] **Step 1: Write failing regression tests before moving content**

```ts
import { expect, it } from 'vitest';
import { getEntry } from '@/content/registry';

it('preserves the eight approved Call Agent chapters and evidence boundary', () => {
  const entry = getEntry('work', 'call-agent', 'zh');
  expect(entry.meta.chapters.map((chapter) => chapter.id)).toEqual([
    'overview', 'context-role', 'design-thesis', 'decision-path',
    'decision-preview', 'decision-operate', 'system-delivery', 'outcome-learnings'
  ]);
  expect(entry.meta.status).toMatch(/有限灰度/);
  expect(entry.meta.evidenceLevel).toBe('observed');
});
```

- [ ] **Step 2: Run the regression test to verify it fails**

Run: `npm test -- tests/unit/call-agent-regression.test.ts`

Expected: FAIL because the MDX registry entry does not exist.

- [ ] **Step 3: Make the redaction manifest portable before moving assets**

Replace absolute personal source paths in `evidence/call-agent/manifest.json` with paths relative to `CALL_AGENT_SOURCE_ROOT`, retain every crop/redaction rectangle and the excluded authorization-token screenshot, and make `prepare-call-agent-assets.mjs` stop unless that environment variable points to a readable directory. Output only to `public/images/call-agent/`.

- [ ] **Step 4: Migrate the Chinese case without changing claims**

Move all eight current HTML chapters into `call-agent.zh.mdx` verbatim at the claim level. Preserve role `唯一产品设计师`, duration `9 个月`, roughly eight iterations, limited beta, the distinction between delivered/observed/next, and every before/after caption. Update only layout syntax, asset paths, and links; do not add growth, conversion, efficiency, production-fidelity, or scaled-customer claims.

- [ ] **Step 5: Create the complete English counterpart**

Translate the same eight chapters without shortening evidence boundaries. A bilingual reviewer must compare headings, numeric statements, status, role, disclosure, media, and delivered/observed/next labels side by side before approval.

- [ ] **Step 6: Build the reusable native case shell**

`app/[locale]/work/[slug]/page.tsx` exports static params for all six locale/work combinations and returns `notFound()` for every other slug. Desktop uses a narrow sticky chapter index; mobile uses a button-triggered compact chapter menu. `EvidenceFigure` requires `src`, intrinsic width/height, meaningful `alt`, evidence label, and caption. Lightbox supports Enter/Space, Escape, focus return, and body-scroll restoration. Previous/next links follow ByteDance → Call Agent → Meeting. `print.css` removes web controls, keeps evidence visible, prevents headings/captions from becoming isolated, and preserves the existing A4 reading behavior.

- [ ] **Step 7: Run migrated tests and compare output**

```bash
npm test -- tests/unit/privacy.test.ts tests/unit/call-agent-regression.test.ts
npx playwright test tests/e2e/call-agent.spec.ts --project=desktop --project=tablet --project=mobile
npm run build
shasum -a 256 public/files/call-agent-case-study-zh.pdf
```

Expected: all eight chapters render in both locales; images open and close by keyboard; limited-beta language remains; the PDF checksum equals the Task 1 baseline; no horizontal overflow occurs.

- [ ] **Step 8: Remove only superseded Vite presentation files and commit**

```bash
git rm index.html src/main.js src/styles/base.css src/styles/components.css src/styles/layout.css src/styles/print.css src/styles/tokens.css src/ui/lightbox.js src/ui/navigation.js src/ui/print.js
git add app components/case-study components/media content/work public evidence scripts tests
git commit -m "feat: migrate call agent into bilingual native case"
```

## Task 9: Add the ByteDance PDF-First Case With a Hard Publication Gate

**Files:**
- Create: `content/work/bytedance.en.mdx`
- Create: `content/work/bytedance.zh.mdx`
- Create: `components/case-study/pdf-case.tsx`
- Create: `components/case-study/pdf-actions.tsx`
- Create: `tests/component/pdf-actions.test.tsx`
- Create: `tests/e2e/bytedance.spec.ts`
- Require: `public/files/yang-jing-bytedance-case-study.pdf`
- Require: `public/images/bytedance/cover.avif`

- [ ] **Step 1: Write the failing PDF behavior test**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PdfActions } from '@/components/case-study/pdf-actions';

it('offers distinct browser view and download actions', () => {
  render(<PdfActions locale="en" href="/files/yang-jing-bytedance-case-study.pdf" />);
  expect(screen.getByRole('link', { name: /view pdf/i })).toHaveAttribute('target', '_blank');
  expect(screen.getByRole('link', { name: /download pdf/i })).toHaveAttribute('download');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/component/pdf-actions.test.tsx`

Expected: FAIL because `PdfActions` does not exist.

- [ ] **Step 3: Implement the stable native wrapper**

The route contains only user-approved public summary, role, disclosure statement, sanitized cover, view/download actions, and project navigation. Desktop can render an `<object>` PDF preview with a normal link fallback; mobile renders the cover and opens the PDF directly. Do not extract confidential content or infer metrics from the PDF.

- [ ] **Step 4: Add publication validation for the real PDF and cover**

Validation checks file existence, non-zero size, PDF magic bytes, AVIF dimensions, cover alt text, and that neither MDX file contains disclosure-prohibited terms identified during content review. The deployment workflow must not bypass this check.

- [ ] **Step 5: Verify and commit after the approved files exist**

```bash
npm test -- tests/component/pdf-actions.test.tsx
npx playwright test tests/e2e/bytedance.spec.ts --project=desktop --project=mobile
git add content/work/bytedance.* components/case-study tests public/files/yang-jing-bytedance-case-study.pdf public/images/bytedance/cover.avif
git commit -m "feat: add bytedance pdf case wrapper"
```

Expected: both locale routes work, desktop fallback is accessible, mobile opens the exact PDF, and download response is non-empty.

## Task 10: Build the Meeting Interaction Deep Dive

**Files:**
- Create: `content/work/meeting.en.mdx`
- Create: `content/work/meeting.zh.mdx`
- Create: `components/meeting/state-model.tsx`
- Create: `components/meeting/interaction-sequence.tsx`
- Create: `components/meeting/interaction-sequence.module.css`
- Create: `tests/component/meeting-sequence.test.tsx`
- Create: `tests/e2e/meeting.spec.ts`
- Require: the six Meeting files in the Publication Input Contract

- [ ] **Step 1: Write failing shipped/retrospective separation tests**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { InteractionSequence } from '@/components/meeting/interaction-sequence';

it('labels shipped evidence separately from the 2026 retrospective', () => {
  render(<InteractionSequence locale="en" reducedMotion />);
  expect(screen.getByRole('region', { name: 'What shipped' })).toBeVisible();
  expect(screen.getByRole('region', { name: '2026 Retrospective' })).toBeVisible();
  expect(screen.getByText(/not shipped and has no measured outcome/i)).toBeVisible();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/component/meeting-sequence.test.tsx`

Expected: FAIL because the Meeting components do not exist.

- [ ] **Step 3: Ingest only approved Figma exports and interaction evidence**

Review every export at original resolution. Record which screens shipped and which belong to the 2026 retrospective. Do not redraw shipped evidence to make it more attractive; place redesigned material only in the retrospective region with its disclosure label.

- [ ] **Step 4: Author the seven approved chapters**

Use the approved proposition `Designing clarity and control for highly dynamic real-time collaboration.` and the exact structure: difficulty, visibility/control principles, roles/permissions/state model, before/during/after tasks, shipped interface/playback, 2026 retrospective, transferable lessons. Where metrics do not exist, use qualitative design evidence and explicitly state that measured outcomes are unavailable.

- [ ] **Step 5: Implement progressive interaction playback**

The sequence exposes discrete start/middle/end states, play/pause, captions, and a textual state summary. Scroll progress may select states on desktop, but keyboard controls provide the same access. Reduced motion shows the final arrangement without scroll transforms; mobile uses a swipe-free stacked sequence and never autoplay-loads the MP4.

- [ ] **Step 6: Verify visual truth and commit**

```bash
npm test -- tests/component/meeting-sequence.test.tsx
npx playwright test tests/e2e/meeting.spec.ts --project=desktop --project=mobile
git add content/work/meeting.* components/meeting tests public/images/meeting public/videos/meeting
git commit -m "feat: add meeting interaction deep dive"
```

Expected: shipped and retrospective regions are unmistakable at every viewport; start/middle/end states have no overlap; reduced-motion content remains complete.

## Task 11: Add the Single STT Demo Build Lab Entry

**Files:**
- Create: `content/build/stt-demo.en.mdx`
- Create: `content/build/stt-demo.zh.mdx`
- Create: `components/build-lab/demo-frame.tsx`
- Create: `components/build-lab/evidence-ledger.tsx`
- Create: `components/build-lab/build-lab.module.css`
- Create: `evidence/stt-demo/source.json`
- Create: `scripts/sync-stt-demo.mjs`
- Create: `tests/unit/stt-source.test.ts`
- Create: `tests/e2e/stt-demo.spec.ts`
- Create from pinned source: `public/demos/stt-demo/**`

- [ ] **Step 1: Write the failing provenance test**

```ts
import fs from 'node:fs';
import { expect, it } from 'vitest';

it('pins the only Build Lab project to an auditable STT source revision', () => {
  const source = JSON.parse(fs.readFileSync('evidence/stt-demo/source.json', 'utf8'));
  expect(source).toEqual({
    repository: 'https://github.com/flynightbird/stt-demo',
    commit: 'e5e840a',
    demoPath: '/demos/stt-demo/index.html',
    kind: 'interactive-static-prototype'
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/stt-source.test.ts`

Expected: FAIL because the provenance file does not exist.

- [ ] **Step 3: Implement the pinned sync script**

`sync-stt-demo.mjs` accepts `STT_DEMO_SOURCE`, verifies `git rev-parse --short HEAD` starts with `e5e840a`, clears only `public/demos/stt-demo`, and copies the root `index.html`, `styles.css`, `app.js`, participant assets, Agora logo, token CSS, and component CSS required by the root document. It writes `source-revision.json` into the output and refuses a different commit.

Run:

```bash
STT_DEMO_SOURCE=/tmp/yangjing-stt-demo-inspect npm run sync:stt
```

Expected: the local demo and all referenced CSS/image assets exist under `public/demos/stt-demo/` with revision `e5e840a`.

- [ ] **Step 4: Author the truthful Build Lab story**

Describe target users, pre-start setup, recognition modes, in-session transcription/translation, participant/settings panels, plugin/QR layers, AI-assisted workflow, component library, design audit, and visual regression. State the actual boundary from `PROTOTYPE-SPEC.md`: no backend integration, real SSO, RTC joining, or real STT stream. Present the source repository as source; present `/demos/stt-demo/` as the interactive prototype.

- [ ] **Step 5: Implement the framed live demo safely**

`app/[locale]/build/[slug]/page.tsx` exports only the English and Chinese `stt-demo` static params and returns `notFound()` for any other build slug. Use a stable-aspect-ratio iframe with title, loading state, open-fullscreen action, source action, and a non-interactive poster fallback on narrow or reduced-data contexts. Do not claim the currently returning-404 GitHub Pages addresses as live demos.

- [ ] **Step 6: Verify interaction and commit**

```bash
npm test -- tests/unit/stt-source.test.ts
npx playwright test tests/e2e/stt-demo.spec.ts --project=desktop --project=mobile
git add content/build components/build-lab evidence/stt-demo scripts/sync-stt-demo.mjs public/demos/stt-demo tests
git commit -m "feat: add stt demo build lab case"
```

Expected: `/en/build/stt-demo/` and `/zh/build/stt-demo/` render; the local demo loads nonblank, can be opened directly, and source provenance is visible; no second Build Lab entry exists.

## Task 12: Build About, Resume, and Direct Contact

**Files:**
- Create: `app/[locale]/about/page.tsx`
- Create: `content/profile/about.en.mdx`
- Create: `content/profile/about.zh.mdx`
- Create: `content/profile/contact.private.json`
- Create: `components/contact/contact-links.tsx`
- Create: `components/contact/resume-links.tsx`
- Create: `components/contact/contact.module.css`
- Create: `tests/component/contact-links.test.tsx`
- Create: `tests/e2e/about-contact.spec.ts`
- Require: profile image, two resume PDFs, WeChat QR, and approved contact JSON

- [ ] **Step 1: Write failing contact-action tests using test data**

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ContactLinks } from '@/components/contact/contact-links';

const contact = {
  email: 'test@example.com',
  linkedin: 'https://www.linkedin.com/in/test-profile',
  wechatId: 'test-wechat'
};

it('uses direct contact actions and distinct email subjects', () => {
  render(<ContactLinks locale="en" contact={contact} />);
  expect(screen.queryByRole('form')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: /job opportunity/i })).toHaveAttribute(
    'href', 'mailto:test@example.com?subject=Job%20opportunity%20for%20Yang%20Jing'
  );
  expect(screen.getByRole('link', { name: /freelance project/i })).toHaveAttribute(
    'href', 'mailto:test@example.com?subject=Freelance%20project%20for%20Yang%20Jing'
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/component/contact-links.test.tsx`

Expected: FAIL because `ContactLinks` does not exist.

- [ ] **Step 3: Author the real career narrative**

The About content follows the verified progression: large-scale consumer product design → complex B2B and AI systems → AI-assisted product building. Include concise timeline, product judgment, complex interaction, design-to-build capabilities, collaboration principles, opportunity status, and no fabricated employers, dates, awards, testimonials, or metrics.

- [ ] **Step 4: Implement direct contact and resume actions**

Render visible email plus copy and mailto commands, LinkedIn, WeChat ID, and QR on Chinese content. There is no form and no phone. Resume links point to the exact English/Chinese filenames and display the actual revision date from approved JSON.

- [ ] **Step 5: Verify files and commit only approved public values**

```bash
npm test -- tests/component/contact-links.test.tsx
npx playwright test tests/e2e/about-contact.spec.ts --project=desktop --project=mobile
git add app/[locale]/about content/profile components/contact tests public/images/profile/yang-jing-about.avif public/images/contact/wechat-qr.avif public/files/yang-jing-resume-en.pdf public/files/yang-jing-resume-zh.pdf
git commit -m "feat: add about resume and direct contact experience"
```

Expected: both resumes open and download, copied email/WeChat values equal visible values, two mail subjects differ, and no form or telephone link exists.

## Task 13: Generalize Privacy, Asset, and Publication Validation

**Files:**
- Create: `lib/content/privacy.ts`
- Create: `lib/media/assets.ts`
- Create: `evidence/media/manifest.json`
- Create: `scripts/generate-responsive-media.mjs`
- Create: `scripts/validate-publication.mjs`
- Modify: `scripts/prepare-call-agent-assets.mjs`
- Create: `tests/unit/privacy.test.ts`
- Create: `tests/unit/publication-validation.test.ts`

- [ ] **Step 1: Extend the failing privacy tests**

```ts
import { expect, it } from 'vitest';
import { findSensitiveText } from '@/lib/content/privacy';

it.each([
  ['Authorization: Bearer abc.def.ghi', 'authorization token'],
  ['+86 138 1234 5678', 'phone number'],
  ['10.24.16.8', 'IP address'],
  ['account_id=acc_82HF91KQ', 'account identifier']
])('flags %s', (value, finding) => {
  expect(findSensitiveText(value)).toContain(finding);
});

it('does not treat the approved public email as a secret', () => {
  expect(findSensitiveText('Contact: public@example.com')).not.toContain('email address');
});
```

- [ ] **Step 2: Run the tests to verify the new patterns fail**

Run: `npm test -- tests/unit/privacy.test.ts tests/unit/publication-validation.test.ts`

Expected: FAIL for account/internal-ID detection and missing publication validator.

- [ ] **Step 3: Implement a deterministic publication gate**

Scan committed text content, generated HTML, evidence manifests, and image OCR sidecar text when supplied. Validate locale pairs, required metadata, alt/captions, all internal links, file existence, PDF headers, video posters/captions, unique translation keys, and exact allowed evidence vocabulary. Contact JSON is allowed only for the approved public email, LinkedIn, and WeChat fields; phone patterns always fail.

- [ ] **Step 4: Make the production build enforce source and generated-output validation**

Set the final scripts in `package.json` to:

```json
{
  "scripts": {
    "build": "node scripts/validate-publication.mjs --mode=source && next build && node scripts/validate-publication.mjs --mode=output",
    "build:framework": "next build",
    "verify:publish": "npm run lint && npm test && npm run build && npm run test:e2e"
  }
}
```

Source mode blocks missing or unsafe publication inputs before Next runs. Output mode scans `out/` for broken internal links, leaked sensitive text, missing files, bad locale pairs, and generated HTML defects. Cloudflare uses `npm run build`, so it receives the same gate as CI.

- [ ] **Step 5: Preserve destructive image processing and generate responsive media**

Keep Sharp crop-before-composite order, fail on unreadable sources, never copy raw source files into `public`, and compare each generated file against manifest dimensions. Add a test proving the excluded authorization-token source can never be an output entry.

`generate-responsive-media.mjs` reads `evidence/media/manifest.json`, creates only the declared `640`, `960`, `1440`, and `1920` pixel widths that do not upscale the source, writes AVIF/WebP plus the declared fallback format, and records width, height, and byte size for every output. Portrait, first ByteDance preview, and every case Hero receive explicit stable dimensions; below-the-fold variants are lazy-loaded.

- [ ] **Step 6: Run validation and commit**

```bash
npm test -- tests/unit/privacy.test.ts tests/unit/publication-validation.test.ts
node scripts/generate-responsive-media.mjs
node scripts/validate-publication.mjs --mode=development
git add package.json package-lock.json lib evidence/media scripts tests
git commit -m "feat: enforce privacy and publication content gates"
```

Expected: development validation passes structural checks and explicitly lists absent publication inputs; production mode exits non-zero until every approved input exists.

## Task 14: Add Accessible Media, Motion, and Case Navigation

**Files:**
- Modify: `components/media/lightbox.tsx`
- Create: `components/media/responsive-video.tsx`
- Modify: `components/case-study/chapter-nav.tsx`
- Create: `components/case-study/project-pagination.tsx`
- Create: `hooks/use-reduced-motion.ts`
- Create: `tests/component/lightbox.test.tsx`
- Create: `tests/component/chapter-nav.test.tsx`
- Create: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Write failing keyboard/focus tests**

Test that Escape closes the lightbox and restores focus, chapter menu reports `aria-expanded`, all video has captions/transcript access, and project pagination order is ByteDance ↔ Call Agent ↔ Meeting ↔ STT Demo.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- tests/component/lightbox.test.tsx tests/component/chapter-nav.test.tsx`

Expected: at least focus restoration and menu-state assertions FAIL before implementation.

- [ ] **Step 3: Implement accessible interaction parity**

All hover disclosures remain visible or keyboard-reachable; icon-only commands have accessible labels and tooltips; focus rings meet contrast; the skip link targets locale main content; sticky navigation uses `scroll-margin-top`; no drag is essential. Touch targets are at least `44×44px`.

- [ ] **Step 4: Centralize reduced-motion behavior**

`useReducedMotion()` combines the media query with an optional test override. Hero and Meeting consume it; CSS disables smooth scrolling and nonessential transitions. No persistent animation loop runs after the initial Hero sequence.

- [ ] **Step 5: Run keyboard and reduced-motion coverage, then commit**

```bash
npm test -- tests/component/lightbox.test.tsx tests/component/chapter-nav.test.tsx
npx playwright test tests/e2e/accessibility.spec.ts
git add components hooks tests
git commit -m "feat: harden media motion and navigation accessibility"
```

## Task 15: Add Privacy-Limited Analytics and Metadata

**Files:**
- Create: `components/shell/cloudflare-analytics.tsx`
- Create: `lib/analytics/events.ts`
- Create: `components/analytics/tracked-link.tsx`
- Create: `app/sitemap.ts`
- Create: `app/robots.ts`
- Modify: `app/layout.tsx`
- Modify: locale page metadata exports
- Create: `tests/unit/analytics.test.ts`
- Create: `tests/e2e/metadata.spec.ts`

- [ ] **Step 1: Write the failing event-vocabulary test**

```ts
import { expect, it } from 'vitest';
import { portfolioEventSchema } from '@/lib/analytics/events';

it('allows only privacy-limited portfolio events', () => {
  for (const name of ['case_open', 'pdf_open', 'pdf_download', 'resume_download', 'contact_click', 'locale_switch']) {
    expect(portfolioEventSchema.parse({ name, locale: 'en', target: 'call-agent' }).name).toBe(name);
  }
  expect(() => portfolioEventSchema.parse({ name: 'form_payload', email: 'person@example.com' })).toThrow();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/unit/analytics.test.ts`

Expected: FAIL because the event schema does not exist.

- [ ] **Step 3: Implement non-blocking Cloudflare analytics**

Load the beacon only when `NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN` is present. Event helpers send only event name, locale, and a fixed content key; never send free text, email, WeChat, URL query contents, or PDF contents. Network failure must not cancel navigation.

- [ ] **Step 4: Add bilingual SEO metadata and route discovery**

Each route has localized title/description, canonical URL when a production origin is configured, `hreflang` alternates, social preview using real case media, sitemap entries for all twelve locale-specific launch routes, and robots rules that permit the public site but do not expose source evidence directories.

- [ ] **Step 5: Verify and commit**

```bash
npm test -- tests/unit/analytics.test.ts
npx playwright test tests/e2e/metadata.spec.ts
git add components/analytics components/shell/cloudflare-analytics.tsx lib/analytics app
git commit -m "feat: add private analytics and bilingual metadata"
```

## Task 16: Establish Browser, Visual, and Performance Regression Coverage

**Files:**
- Replace: `playwright.config.mjs` with `playwright.config.ts`
- Create: `tests/e2e/routes.spec.ts`
- Create: `tests/e2e/overflow.spec.ts`
- Create: `tests/e2e/files.spec.ts`
- Create: `tests/visual/key-routes.spec.ts`
- Create: `tests/visual/meeting-states.spec.ts`
- Create: `scripts/check-performance-budget.mjs`
- Create: `tests/performance/budgets.json`

- [ ] **Step 1: Write the failing route matrix**

```ts
const routes = [
  '/', '/en/', '/zh/', '/en/about/', '/zh/about/',
  '/en/work/bytedance/', '/zh/work/bytedance/',
  '/en/work/call-agent/', '/zh/work/call-agent/',
  '/en/work/meeting/', '/zh/work/meeting/',
  '/en/build/stt-demo/', '/zh/build/stt-demo/'
];

for (const route of routes) {
  test(`${route} renders without console or page errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
    expect(errors).toEqual([]);
  });
}
```

- [ ] **Step 2: Run the route matrix before final fixes**

Run: `npx playwright test tests/e2e/routes.spec.ts`

Expected: FAIL on any incomplete content route or missing publication asset; use the exact failure list as the completion queue.

- [ ] **Step 3: Configure representative projects and stable screenshots**

Use `1440×900`, `1024×768`, `390×844`, and one reduced-motion mobile project. Disable animation during screenshot assertions except the explicit Hero and Meeting state captures. Capture home, each case/build route, About, 404, Meeting start/middle/end, and Call Agent print output.

- [ ] **Step 4: Enforce layout and asset budgets**

Every route must have `scrollWidth - clientWidth <= 1`, no overlapping visible text rectangles, no blank natural-width images, no failed requests, and no missing iframe asset. `check-performance-budget.mjs` fails when initial route JavaScript exceeds the measured agreed baseline by 10%, any non-demo autoplay video appears on mobile, Hero media lacks dimensions, or total preloaded image bytes exceed the LCP asset budget.

- [ ] **Step 5: Run the complete browser suite and commit baselines**

```bash
npm run build
npx playwright test tests/e2e tests/visual
node scripts/check-performance-budget.mjs out
git add playwright.config.ts tests scripts/check-performance-budget.mjs
git rm playwright.config.mjs
git commit -m "test: add portfolio browser visual and performance coverage"
```

Expected: all viewport projects pass and reviewed screenshots contain no crop, blank media, overlap, or horizontal overflow.

## Task 17: Configure Cloudflare Pages and Publication CI

**Files:**
- Replace: `.github/workflows/deploy.yml`
- Create: `.github/workflows/ci.yml`
- Create: `wrangler.toml`
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Write the failing workflow contract test**

Extend `tests/unit/architecture.test.ts` to assert:

```ts
const workflow = fs.readFileSync('.github/workflows/ci.yml', 'utf8');
expect(workflow).toContain('npm ci');
expect(workflow).toContain('npm run verify:publish');
expect(workflow).toContain('out');
expect(fs.readFileSync('wrangler.toml', 'utf8')).toContain('pages_build_output_dir = "out"');
```

- [ ] **Step 2: Run the contract test to verify it fails**

Run: `npm test -- tests/unit/architecture.test.ts`

Expected: FAIL because Cloudflare configuration is absent.

- [ ] **Step 3: Replace the GitHub Pages workflow**

`ci.yml` checks out `main`, uses Node 22, runs `npm ci`, installs Chromium, runs `npm run verify:publish`, and uploads Playwright artifacts only on failure. Remove GitHub Pages deployment actions and `dist` assumptions. Cloudflare Pages uses repository integration with build command `npm run build`, output `out`, Node 22, and the analytics token environment variable.

Use this `wrangler.toml` core:

```toml
name = "yangjing-portfolio"
pages_build_output_dir = "out"
compatibility_date = "2026-07-14"
```

- [ ] **Step 4: Document exact local and Cloudflare setup**

README includes `npm ci`, `npm run dev`, `npm run verify:publish`, the required publication file list, local redaction/source environment variables, Cloudflare build/output settings, analytics token, and the rule that no paid Vercel/runtime service is required.

- [ ] **Step 5: Run the real publication gate**

```bash
npm run verify:publish
```

Expected: PASS only after all approved personal/content assets exist, privacy checks pass, unit/browser tests pass, and `out/` is complete. Do not deploy when this command exits non-zero.

- [ ] **Step 6: Commit deployment configuration**

```bash
git add .github wrangler.toml README.md .gitignore tests/unit/architecture.test.ts
git commit -m "ci: prepare verified cloudflare pages deployment"
```

## Task 18: Phase-Two ByteDance Native Migration Without Route Changes

**Files:**
- Modify: `content/work/bytedance.en.mdx`
- Modify: `content/work/bytedance.zh.mdx`
- Add approved exports under: `public/images/bytedance/`
- Modify: `tests/e2e/bytedance.spec.ts`
- Retain unchanged: `public/files/yang-jing-bytedance-case-study.pdf`

- [ ] **Step 1: Start only after the sanitized case has approved bilingual source copy**

The source must identify proposition, role, duration, team, status, disclosure boundary, problem/constraints, major decisions, actual evidence, limitations, and reflection. If any section is unavailable for public disclosure, state that boundary instead of inferring content.

- [ ] **Step 2: Change the test from PDF-wrapper mode to native-case mode**

Assert a native chapter index and all approved chapter headings while retaining a link named Archive PDF to `/files/yang-jing-bytedance-case-study.pdf`.

- [ ] **Step 3: Run the test to verify it fails against phase one**

Run: `npx playwright test tests/e2e/bytedance.spec.ts`

Expected: FAIL because the phase-one wrapper lacks native chapters.

- [ ] **Step 4: Replace wrapper MDX with the reviewed native case**

Use the shared `CaseLayout`, `EvidenceFigure`, chapter navigation, evidence labels, previous/next navigation, and bilingual metadata. Keep route, translation key, feature order, archive PDF, disclosure boundary, and analytics target unchanged.

- [ ] **Step 5: Re-run privacy and visual verification**

```bash
npm run verify:publish
npx playwright test tests/e2e/bytedance.spec.ts tests/visual/key-routes.spec.ts
git add content/work/bytedance.* public/images/bytedance tests/e2e/bytedance.spec.ts
git commit -m "feat: migrate bytedance case to native bilingual format"
```

Expected: native content replaces the wrapper at the same URLs; archive PDF remains downloadable; all added evidence passes privacy review.

## Task 19: Final Review, Push, and Cloudflare Smoke Test

**Files:**
- Verify all tracked files
- No new implementation files unless a failing check identifies a scoped defect

- [ ] **Step 1: Run the final local verification from a clean install**

```bash
rm -rf node_modules .next out
npm ci
npx playwright install chromium
npm run verify:publish
git status --short
```

Expected: every check passes and status contains only intentionally reviewed visual baselines, if they were updated.

- [ ] **Step 2: Review generated output manually**

Serve `out/` and inspect `/en/`, `/zh/`, both About pages, all six work locale routes, both STT Demo locale routes, the local demo, 404, PDF behavior, resume files, contact actions, Hero framing, and Meeting start/middle/end at desktop and mobile widths.

- [ ] **Step 3: Push the implementation branch**

```bash
git push -u origin codex/portfolio-nextjs
```

Expected: remote branch exists and CI passes.

- [ ] **Step 4: Merge only after reviewed CI and visual evidence**

Use a pull request into `main`; retain the Call Agent baseline/migration document and evidence provenance. After merge, verify Cloudflare Pages reports a successful `out/` deployment.

- [ ] **Step 5: Smoke-test the real Pages URL**

Run the route, file, console-error, and broken-link Playwright tests with `PLAYWRIGHT_BASE_URL` set to the assigned `*.pages.dev` URL. Confirm Cloudflare Web Analytics receives fixed event names without personal payloads and that analytics blocking does not affect any navigation.

## Completion Definition

Implementation is complete only when the production gate, all unit/component/browser/visual tests, clean static export, and real Cloudflare smoke test pass; all publication inputs are real and approved; the Call Agent evidence/PDF/privacy lineage remains auditable; Meeting distinguishes shipped from retrospective work; and exactly one Build Lab project, STT Demo, is shown everywhere.
