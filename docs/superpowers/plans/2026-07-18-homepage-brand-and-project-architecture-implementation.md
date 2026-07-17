# Homepage Brand and Project Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage shell and core-project sequence around the approved Smoky Iris brand system, add a controlled AIDX autoplay showcase, and finish with a liquid email CTA while preserving the locked Visual Archive.

**Architecture:** Keep homepage content in the existing bilingual dictionaries and project registry, then compose four unequal project chapters from focused React components. Reuse the proven STT same-origin iframe lifecycle for a local AIDX video showcase, and share a lightweight canvas liquid-field component between the restrained AIDX stage and expressive footer. Protect Visual Archive with existing component tests plus explicit DOM-order and overflow assertions.

**Tech Stack:** Next.js 16 static export, React 19, TypeScript 6, CSS Modules, Motion, GSAP/ScrollTrigger, Canvas 2D, plain HTML/CSS/JavaScript for local showcases, Vitest, Testing Library, Playwright.

---

## Execution Constraints

- The current `codex/portfolio-nextjs` worktree contains valuable uncommitted homepage work. Do not reset, clean, stash, or replace it.
- Execute in the current worktree unless the user first checkpoints those changes. A new worktree from `HEAD` would omit the approved uncommitted baseline.
- Never run `git add -A` or `git add .`. Stage only the files listed in each task.
- Visual Archive is locked. Do not edit `components/home/visual-archive.tsx`, archive data/order, or archive cover styles.
- Before the first UI edit, output the `gpt-taste` `<design_plan>` preflight. Reconcile its deterministic selections with the approved design spec; the user-approved hierarchy and locked components take priority.
- The AIDX capture script may access `https://aidxtech.com/` only when deliberately regenerating the committed showcase. Production builds and tests must remain network-independent.

## File Map

### Create

- `components/home/company-mark.tsx`: render a monochrome, localized company lockup.
- `components/home/company-mark.module.css`: mask-based monochrome logo presentation.
- `components/home/communication-projects.tsx`: asymmetric Meeting/STT chapter.
- `components/home/aidx-showcase.tsx`: lazy AIDX iframe, pause protocol, fallback, and external link.
- `components/home/aidx-showcase.module.css`: virtual browser and restrained purple stage.
- `components/ui/liquid-field.tsx`: shared offscreen-aware Canvas 2D liquid field.
- `components/ui/liquid-field.module.css`: stable full-bleed canvas positioning.
- `public/images/brands/agora.svg`: verified monochrome Agora mark.
- `public/images/brands/bytedance.svg`: verified monochrome ByteDance mark.
- `public/images/brands/aidx.svg`: verified monochrome AIDX mark.
- `evidence/brand-marks/source.json`: official source URLs and retrieval dates.
- `public/demos/aidx-showcase/index.html`: same-origin, non-interactive video document.
- `public/demos/aidx-showcase/styles.css`: stable video frame and reset veil.
- `public/demos/aidx-showcase/showcase.js`: parent messaging and loop reset.
- `public/demos/aidx-showcase/aidx-homepage-scroll.webm`: committed high-resolution AIDX scroll recording.
- `evidence/aidx/showcase-source.json`: source URL, viewport, capture date, and SHA-256.
- `scripts/capture-aidx-showcase.mjs`: deterministic Playwright capture and manifest writer.
- `tests/component/site-footer.test.tsx`: footer CTA and navigation contract.
- `tests/unit/aidx-showcase.test.ts`: local showcase provenance contract.

### Modify

- `app/globals.css`: approved brand tokens and non-blue global interaction colors.
- `app/(localized)/[locale]/about/page.tsx`: real About email action; remove publication placeholders.
- `app/(localized)/[locale]/about/about.module.css`: finished About contact treatment.
- `components/shell/site-header.tsx`: single floating capsule and mobile menu.
- `components/shell/site-header.module.css`: glass, scrolled, desktop, and mobile states.
- `components/shell/locale-switcher.tsx`: one-click opposite-locale navigation.
- `components/shell/site-footer.tsx`: liquid CTA footer.
- `components/shell/site-footer.module.css`: full-width purple footer composition.
- `components/home/dual-identity-hero.tsx`: keep role labels English.
- `components/home/hero-motion.tsx`: replace blue canvas accents with iris tokens.
- `components/home/intro-story.tsx`: approved three-scene copy and support line.
- `components/home/intro-story-motion.tsx`: render support line in scene one.
- `components/home/featured-work.tsx`: four-chapter ordering.
- `components/home/featured-project.tsx`: company mark support for Xuelang.
- `components/home/flagship-projects.tsx`: company marks for Call Agent and ConvoAI.
- `components/home/meeting-preview.tsx`: company mark and chapter-friendly structure.
- `components/home/build-lab-preview.tsx`: formal Agora STT copy and company mark.
- `components/home/live-website-project.tsx`: replace static AIDX figure with `AidxShowcase`.
- `components/home/home.module.css`: Hero height, intro palette, project chapters, and archive bridge rhythm.
- `content/home.ts`: company IDs and approved project order helpers.
- `content/dictionaries/en.ts`: Archive nav, company labels, intro/footer/About copy.
- `content/dictionaries/zh.ts`: matching Chinese dictionary keys and copy.
- `package.json`: `capture:aidx` script.
- `tests/component/homepage.test.tsx`: copy, company, chapter, and AIDX contracts.
- `tests/component/site-header.test.tsx`: capsule navigation contract.
- `tests/component/locale-switcher.test.tsx`: immediate toggle contract.
- `tests/unit/home-content.test.ts`: company ownership and project ordering.
- `tests/unit/i18n.test.ts`: matching dictionary shape and removed Resume/Contact nav.
- `tests/e2e/homepage.spec.ts`: visual order, motion, AIDX, Footer, locale, and overflow checks.

## Task 1: Establish Brand Tokens, Project Ownership, and Verified Marks

**Files:**
- Create: `public/images/brands/agora.svg`
- Create: `public/images/brands/bytedance.svg`
- Create: `public/images/brands/aidx.svg`
- Create: `evidence/brand-marks/source.json`
- Modify: `app/globals.css`
- Modify: `content/home.ts`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Test: `tests/unit/home-content.test.ts`
- Test: `tests/unit/i18n.test.ts`

- [ ] **Step 1: Write failing ownership and dictionary tests**

Add this contract to `tests/unit/home-content.test.ts`:

```ts
it('records the approved company ownership and core-work order', () => {
  expect(homepageProjects.map(({ id, companyId }) => [id, companyId])).toEqual([
    ['xuelang', 'bytedance'],
    ['call-agent', 'agora'],
    ['convo-ai', 'agora'],
    ['meeting', 'agora'],
    ['aidx', 'aidx'],
    ['stt-demo', 'agora'],
  ]);
  expect(coreProjectOrder).toEqual([
    'call-agent',
    'convo-ai',
    'meeting',
    'stt-demo',
    'aidx',
    'xuelang',
  ]);
});
```

Replace the shell assertion in `tests/unit/i18n.test.ts` with:

```ts
expect(enDictionary.navigation).toEqual({
  work: 'Work',
  archive: 'Archive',
  about: 'About',
});
expect(enDictionary.home.projects.callAgent.company).toBe('Agora / 声网');
expect(zhDictionary.home.projects.xuelang.company).toBe('ByteDance / 字节跳动');
expect(enDictionary.home.projects.aidx.company).toBe('Singapore AIDX');
expect(zhDictionary.home.projects.sttDemo.company).toBe('Agora / 声网');
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npx vitest run tests/unit/home-content.test.ts tests/unit/i18n.test.ts
```

Expected: FAIL because `companyId`, `coreProjectOrder`, `navigation.archive`, and company copy do not exist.

- [ ] **Step 3: Add typed ownership and display order**

In `content/home.ts`, add:

```ts
export type HomepageCompanyId = 'agora' | 'bytedance' | 'aidx';

export const coreProjectOrder = [
  'call-agent',
  'convo-ai',
  'meeting',
  'stt-demo',
  'aidx',
  'xuelang',
] as const satisfies readonly HomepageProjectId[];
```

Add `readonly companyId: HomepageCompanyId` to `HomepageProject`. Add `companyId: 'bytedance'` to Xuelang, `companyId: 'aidx'` to AIDX, and `companyId: 'agora'` to Call Agent, ConvoAI, Meeting, and STT. Do not reorder the registry because existing validators depend on its stable archival order; `coreProjectOrder` owns homepage presentation order.

- [ ] **Step 4: Add exact bilingual shell and company copy**

Use this dictionary shape in both locale files:

```ts
navigation: {
  work: 'Work',
  archive: 'Archive',
  about: 'About',
},
```

Chinese values are `作品`, `视觉档案`, and `关于`. Add `company` to each project copy with these values:

```ts
// English
callAgent: { company: 'Agora / 声网' },
convoAi: { company: 'Agora / 声网' },
meeting: { company: 'Agora / 声网' },
sttDemo: { company: 'Agora / 声网' },
xuelang: { company: 'ByteDance / 字节跳动' },
aidx: { company: 'Singapore AIDX' },

// Chinese
callAgent: { company: 'Agora / 声网' },
convoAi: { company: 'Agora / 声网' },
meeting: { company: 'Agora / 声网' },
sttDemo: { company: 'Agora / 声网' },
xuelang: { company: 'ByteDance / 字节跳动' },
aidx: { company: '新加坡 AIDX' },
```

Retain dictionary key parity and remove only the now-unused navigation-level `resume` and `contact` keys; do not remove action labels used by case-study pages.

- [ ] **Step 5: Replace the homepage interaction palette**

In `app/globals.css`, set:

```css
:root {
  --color-carbon: #0e100f;
  --color-graphite: #191b19;
  --color-paper: #f4f5f2;
  --color-iris: #b5a3e6;
  --color-iris-luminous: #c8b9ff;
  --color-iris-deep: #5f4b86;
  --color-signal: #c5ff63;
  --color-focus: var(--color-iris-luminous);
}

a:hover {
  color: var(--color-iris-luminous);
}

:focus-visible {
  outline-color: var(--color-focus);
}
```

Replace the blue tap highlight with `rgba(200, 185, 255, 0.2)`. Do not alter Xuelang's scoped project tokens.

- [ ] **Step 6: Add verified monochrome mark assets and provenance**

Download each mark from the official company site or official brand kit, simplify it to a single filled path, remove embedded colors, and save it under `public/images/brands/`. Record the exact source and SHA-256 in:

```json
{
  "version": 1,
  "retrievedAt": "2026-07-18",
  "marks": [
    { "id": "agora", "path": "/images/brands/agora.svg", "source": "https://www.agora.io/" },
    { "id": "bytedance", "path": "/images/brands/bytedance.svg", "source": "https://www.bytedance.com/" },
    { "id": "aidx", "path": "/images/brands/aidx.svg", "source": "https://aidxtech.com/" }
  ]
}
```

Do not redraw or approximate official marks. Each SVG must use a single black fill so CSS masking can recolor it.

- [ ] **Step 7: Verify GREEN and commit**

Run:

```bash
npx vitest run tests/unit/home-content.test.ts tests/unit/i18n.test.ts
rg -n "#194BFF|#4b7aff|color-cobalt" app/globals.css
```

Expected: tests PASS; `rg` returns no matches in `app/globals.css`.

Commit only the listed files:

```bash
git add app/globals.css content/home.ts content/dictionaries/en.ts content/dictionaries/zh.ts public/images/brands evidence/brand-marks/source.json tests/unit/home-content.test.ts tests/unit/i18n.test.ts
git commit -m "feat: establish portfolio brand and project ownership"
```

## Task 2: Build the Glass Capsule and Immediate Language Toggle

**Files:**
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`
- Modify: `components/shell/locale-switcher.tsx`
- Test: `tests/component/site-header.test.tsx`
- Test: `tests/component/locale-switcher.test.tsx`

- [ ] **Step 1: Replace panel tests with the approved navigation contract**

Add these assertions:

```tsx
it('renders only Work, Archive, About, and the direct language control', () => {
  render(<SiteHeader locale="en" />);
  expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/en/#work');
  expect(screen.getByRole('link', { name: 'Archive' })).toHaveAttribute('href', '/en/#archive');
  expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about/');
  expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  expect(screen.queryByText('Contact')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Switch to Simplified Chinese' })).toBeVisible();
});

it('marks the capsule as scrolled without hiding it', () => {
  render(<SiteHeader locale="en" />);
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 80 });
  window.dispatchEvent(new Event('scroll'));
  expect(screen.getByRole('banner')).toHaveAttribute('data-scrolled', 'true');
});
```

Replace locale-choice tests with:

```tsx
it('switches to the opposite locale immediately and preserves the hash', async () => {
  const replace = vi.fn();
  window.location.hash = '#archive';
  render(
    <LocaleSwitcherControl locale="en" pathname="/en/" replace={replace} />,
  );
  await userEvent.click(
    screen.getByRole('button', { name: 'Switch to Simplified Chinese' }),
  );
  expect(window.localStorage.getItem('yj-locale')).toBe('zh');
  expect(replace).toHaveBeenCalledWith('/zh/#archive');
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run `npx vitest run tests/component/site-header.test.tsx tests/component/locale-switcher.test.tsx`.

Expected: FAIL because the current header exposes Resume/Contact and the language button opens a panel.

- [ ] **Step 3: Simplify the locale control**

Replace the panel state with one click handler:

```tsx
export function LocaleSwitcherControl({ locale, pathname, replace }: LocaleSwitcherControlProps) {
  const dictionary = dictionaryFor(locale);
  const targetLocale: Locale = locale === 'en' ? 'zh' : 'en';
  const targetLanguage = dictionary.languages[targetLocale];

  const switchLocale = () => {
    const result = resolveTranslatedPath(pathname, targetLocale, launchLocaleRoutes);
    const hash = typeof window === 'undefined' ? '' : window.location.hash;
    try {
      window.localStorage.setItem(localeStorageKey, targetLocale);
    } catch {
      // Navigation remains available when storage is unavailable.
    }
    replace(`${result.href}${hash}`);
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${targetLanguage}`}
      title={`Switch to ${targetLanguage}`}
      onClick={switchLocale}
    >
      <Globe2 aria-hidden="true" size={18} />
    </button>
  );
}
```

Remove `active`, `onActiveChange`, locale panels, fallback confirmation, and visible language text. Keep route fallback to the target locale homepage.

- [ ] **Step 4: Recompose the header**

Render one capsule containing the home mark, direct desktop links, mobile `details`, a separator, and `LocaleSwitcher`. Add a scroll listener that batches state updates with `requestAnimationFrame` and sets `data-scrolled` when `window.scrollY > 32`. Use this DOM contract:

```tsx
<header className={styles.root} data-scrolled={scrolled ? 'true' : 'false'}>
  <div className={styles.capsule}>
    <a className={styles.home} href={localeRoot} aria-label={dictionary.site.homeLabel}>YJ</a>
    <nav className={styles.desktopNav} aria-label={dictionary.menu.label}>
      <a href={`${localeRoot}#work`}>{dictionary.navigation.work}</a>
      <a href={`${localeRoot}#archive`}>{dictionary.navigation.archive}</a>
      <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
    </nav>
    <details className={styles.mobileMenu}>
      <summary aria-label={dictionary.menu.open}>
        <Menu aria-hidden="true" size={20} />
      </summary>
      <nav aria-label={dictionary.menu.label}>
        <a href={`${localeRoot}#work`}>{dictionary.navigation.work}</a>
        <a href={`${localeRoot}#archive`}>{dictionary.navigation.archive}</a>
        <a href={`${localeRoot}about/`}>{dictionary.navigation.about}</a>
      </nav>
    </details>
    <span className={styles.separator} aria-hidden="true" />
    <LocaleSwitcher locale={locale} />
  </div>
</header>
```

- [ ] **Step 5: Implement the capsule states**

Use these structural values in `site-header.module.css`:

```css
.root {
  position: fixed;
  z-index: var(--z-sticky);
  inset: 0 0 auto;
  display: flex;
  justify-content: center;
  padding: 0.75rem var(--content-gutter);
  pointer-events: none;
}

.capsule {
  display: flex;
  min-height: 3.25rem;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.375rem 0.25rem 0.75rem;
  border: 1px solid rgba(244, 245, 242, 0.16);
  border-radius: 999px;
  background: rgba(14, 16, 15, 0.58);
  box-shadow: 0 0.75rem 2.5rem rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(20px) saturate(135%);
  pointer-events: auto;
  transition: background 300ms var(--ease-out), transform 300ms var(--ease-out);
}

.root[data-scrolled='true'] .capsule {
  background: rgba(14, 16, 15, 0.82);
  transform: scale(0.96);
}
```

Desktop shows `.desktopNav`; below 768px show `.mobileMenu`. All controls remain at least 44px.

- [ ] **Step 6: Verify GREEN and commit**

Run `npx vitest run tests/component/site-header.test.tsx tests/component/locale-switcher.test.tsx`.

Expected: PASS.

```bash
git add components/shell/site-header.tsx components/shell/site-header.module.css components/shell/locale-switcher.tsx tests/component/site-header.test.tsx tests/component/locale-switcher.test.tsx
git commit -m "feat: add glass capsule navigation"
```

## Task 3: Finish the Taller Hero and Dark Three-Scene Introduction

**Files:**
- Modify: `components/home/hero-motion.tsx`
- Modify: `components/home/intro-story.tsx`
- Modify: `components/home/intro-story-motion.tsx`
- Modify: `components/home/home.module.css`
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing copy and structure tests**

Add:

```tsx
it('renders the approved support line inside the first of three intro scenes', () => {
  const { container } = render(<IntroStory locale="zh" />);
  expect(container.querySelectorAll('[data-intro-scene]')).toHaveLength(3);
  const first = container.querySelector('[data-intro-scene="1"]');
  expect(first).toHaveTextContent('嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师。');
  expect(first).toHaveTextContent('欢迎来到这个由我亲手设计，并通过 Vibe Coding 构建的作品集。');
  expect(first?.querySelector('[data-intro-support]')).toBeInTheDocument();
  expect(container.querySelector('[data-intro-vibe]')).toHaveTextContent('Vibe Coding');
});
```

Extend the existing Hero E2E test to assert the Hero height remains at least 820px on desktop and 780px on mobile, and both role headings have `font-weight: 800`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --project=desktop --grep "taller first viewport"
```

Expected: component test FAIL because no support line exists. E2E may fail the increased height threshold.

- [ ] **Step 3: Add the support-line data without adding a fourth scene**

Add `support` to scene one only:

```ts
support: {
  lead: '欢迎来到这个由我亲手设计，并通过 ',
  emphasis: 'Vibe Coding',
  trail: ' 构建的作品集。',
},
```

English uses `Welcome to a portfolio I designed and built through `, `Vibe Coding`, and `.`. Extend the scene type with an optional support object.

- [ ] **Step 4: Render a valid scene wrapper**

Change each scene root from `p` to `div`, keep the main statement in a child `p`, and render support only when present:

```tsx
<div
  className={`${styles.introScene} ${index === currentScene ? styles.introStatementCurrent : ''}`}
  aria-hidden={reducedMotion || index === currentScene ? undefined : true}
  data-intro-scene={index + 1}
>
  <p className={styles.introStatement}>
    {scene.lead}
    <strong data-intro-emphasis>{scene.emphasis}</strong>
    {scene.trail}
  </p>
  {scene.support ? (
    <p className={styles.introSupport} data-intro-support>
      {scene.support.lead}
      <strong data-intro-vibe>{scene.support.emphasis}</strong>
      {scene.support.trail}
    </p>
  ) : null}
</div>
```

Keep GSAP targeting `[data-intro-scene]`, so reverse scroll still jumps directly to scene one without replaying all scenes.

- [ ] **Step 5: Apply the approved palette and type scale**

In `home.module.css`:

```css
.hero {
  min-height: max(48rem, calc(100dvh - 1rem));
}

.introStory {
  background: var(--color-carbon);
  color: var(--color-paper);
}

.introSupport {
  max-width: 48ch;
  margin: 1.5rem auto 0;
  color: rgba(244, 245, 242, 0.7);
  font-size: 1.5rem;
  line-height: 1.45;
  text-align: center;
}

.introSupport strong {
  color: var(--color-iris);
  font-weight: 600;
}
```

Use 1.125–1.25rem for `.introSupport` below 768px. Replace `--hero-blue`, blue canvas strokes, and builder labels with `--color-iris-luminous` or equivalent rgba values. Preserve Signal Green only on the design field and the single approved intro emphasis.

- [ ] **Step 6: Verify GREEN, audit blue, and commit**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
rg -n "hero-blue|#4b7aff|25, 75, 255" components/home/hero-motion.tsx components/home/home.module.css
```

Expected: tests PASS; blue audit has no matches.

```bash
git add components/home/hero-motion.tsx components/home/intro-story.tsx components/home/intro-story-motion.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: refine hero and introduction chapter"
```

## Task 4: Recompose Core Work into Four Unequal Chapters

**Files:**
- Create: `components/home/company-mark.tsx`
- Create: `components/home/company-mark.module.css`
- Create: `components/home/communication-projects.tsx`
- Modify: `components/home/featured-work.tsx`
- Modify: `components/home/featured-project.tsx`
- Modify: `components/home/flagship-projects.tsx`
- Modify: `components/home/meeting-preview.tsx`
- Modify: `components/home/build-lab-preview.tsx`
- Modify: `components/home/live-website-project.tsx`
- Modify: `components/home/home.module.css`
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing chapter and company tests**

Add:

```tsx
it('renders the approved core order and a company lockup for every project', () => {
  const { container } = render(<FeaturedWork locale="en" />);
  expect(
    Array.from(container.querySelectorAll('[data-project-id]')).map(
      (node) => node.getAttribute('data-project-id'),
    ),
  ).toEqual(['call-agent', 'convo-ai', 'meeting', 'stt-demo', 'aidx', 'xuelang']);
  expect(container.querySelectorAll('[data-company-mark]')).toHaveLength(6);
  expect(container.querySelectorAll('[data-project-chapter]')).toHaveLength(4);
  expect(container.querySelector('[data-project-chapter="ai-products"]')).toContainElement(
    container.querySelector('[data-project-id="convo-ai"]'),
  );
});
```

In E2E, assert the same project order, `20px` media radius, and that Meeting/STT stack vertically on mobile.

- [ ] **Step 2: Run tests and verify RED**

Run `npx vitest run tests/component/homepage.test.tsx`.

Expected: FAIL with the current Xuelang-first order and no company marks/chapters.

- [ ] **Step 3: Create an accessible monochrome company lockup**

Implement:

```tsx
import type { HomepageCompanyId } from '@/content/home';
import styles from './company-mark.module.css';

interface CompanyMarkProps {
  readonly companyId: HomepageCompanyId;
  readonly label: string;
}

export function CompanyMark({ companyId, label }: CompanyMarkProps) {
  return (
    <p className={styles.root} data-company-mark={companyId}>
      <span className={styles.logo} data-company-logo={companyId} aria-hidden="true" />
      <span>{label}</span>
    </p>
  );
}
```

Use exact mask selectors and fixed mark boxes so logos remain monochrome and never shift copy:

```css
.logo {
  width: 1.75rem;
  height: 1rem;
  flex: 0 0 auto;
  background: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.logo[data-company-logo='agora'] { mask-image: url('/images/brands/agora.svg'); }
.logo[data-company-logo='bytedance'] { mask-image: url('/images/brands/bytedance.svg'); }
.logo[data-company-logo='aidx'] { mask-image: url('/images/brands/aidx.svg'); }
```

- [ ] **Step 4: Create the Communication Systems wrapper**

Implement:

```tsx
export function CommunicationProjects({ locale, meeting, stt }: CommunicationProjectsProps) {
  return (
    <section
      className={styles.communicationChapter}
      data-project-chapter="communication-systems"
      aria-label={locale === 'zh' ? '通信系统' : 'Communication systems'}
    >
      <MeetingPreview
        copy={meeting.copy}
        href={meeting.href}
        companyId="agora"
      />
      <BuildLabPreview
        copy={stt.copy}
        href={stt.href}
        companyId="agora"
      />
    </section>
  );
}
```

Meeting occupies the larger grid track on desktop; STT remains media-dominant within its smaller track. At mobile width, both become full-width and STT media precedes its copy as already tested.

- [ ] **Step 5: Reorder `FeaturedWork` without reordering the registry**

Create a lookup by ID, then render:

```tsx
<FlagshipProjects
  callAgent={{ copy: copy.callAgent, href: `${localeRoot}${callAgent.href}` }}
  convoAi={{ copy: copy.convoAi, href: convoAi.href }}
/>
<CommunicationProjects
  locale={locale}
  meeting={{ copy: copy.meeting, href: `${localeRoot}${meeting.href}` }}
  stt={{ copy: copy.sttDemo, href: sttDemo.href }}
/>
<section data-project-chapter="visual-brand">
  <LiveWebsiteProject copy={copy.aidx} href={aidx.href} />
</section>
<section data-project-chapter="product-foundation">
  <FeaturedProject
    id="xuelang"
    copy={copy.xuelang}
    href={`${localeRoot}${xuelang.href}`}
    availability={xuelang.availability}
    order="06"
    transitionTone="light"
    variant="evidence"
    companyId="bytedance"
    media={xuelangMedia}
  />
</section>
```

Set `data-project-chapter="ai-products"` on `FlagshipProjects`. Pass `companyId` and localized `company` to each project component. Change STT kind/status from Build Lab language to formal Agora product language while retaining its external Demo destination.

- [ ] **Step 6: Implement asymmetric layout and quiet Xuelang close**

Use a 12-column desktop grid with exact spans:

```css
.communicationChapter {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(20rem, 5fr);
  border-bottom: 1px solid var(--theme-border);
}

.communicationChapter > * {
  min-width: 0;
}

.communicationChapter > :last-child {
  border-inline-start: 1px solid var(--theme-border);
}

@media (max-width: 767px) {
  .communicationChapter {
    grid-template-columns: minmax(0, 1fr);
  }
  .communicationChapter > :last-child {
    border-inline-start: 0;
    border-top: 1px solid var(--theme-border);
  }
}
```

Do not add chapter-number labels. Use only meaningful chapter names where they improve orientation. Keep all media radii at 20px.

- [ ] **Step 7: Verify Visual Archive remains untouched**

Run:

```bash
npx vitest run tests/component/homepage.test.tsx
git diff -- components/home/visual-archive.tsx
```

Expected: tests PASS; Visual Archive diff is empty.

- [ ] **Step 8: Commit**

```bash
git add components/home/company-mark.tsx components/home/company-mark.module.css components/home/communication-projects.tsx components/home/featured-work.tsx components/home/featured-project.tsx components/home/flagship-projects.tsx components/home/meeting-preview.tsx components/home/build-lab-preview.tsx components/home/live-website-project.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "feat: recompose core work chapters"
```

## Task 5: Build the Same-Origin AIDX Autoplay Showcase

**Files:**
- Create: `scripts/capture-aidx-showcase.mjs`
- Create: `evidence/aidx/showcase-source.json`
- Create: `public/demos/aidx-showcase/index.html`
- Create: `public/demos/aidx-showcase/styles.css`
- Create: `public/demos/aidx-showcase/showcase.js`
- Create: `public/demos/aidx-showcase/aidx-homepage-scroll.webm`
- Create: `components/home/aidx-showcase.tsx`
- Create: `components/home/aidx-showcase.module.css`
- Create: `components/ui/liquid-field.tsx`
- Create: `components/ui/liquid-field.module.css`
- Modify: `components/home/live-website-project.tsx`
- Modify: `package.json`
- Test: `tests/unit/aidx-showcase.test.ts`
- Test: `tests/component/homepage.test.tsx`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing local-showcase tests**

Create `tests/unit/aidx-showcase.test.ts`:

```ts
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();

describe('AIDX showcase publication', () => {
  it('pins a local video capture to a verified manifest', async () => {
    const manifest = JSON.parse(
      await readFile(resolve(root, 'evidence/aidx/showcase-source.json'), 'utf8'),
    );
    const video = await readFile(
      resolve(root, 'public/demos/aidx-showcase/aidx-homepage-scroll.webm'),
    );
    expect(manifest.source).toBe('https://aidxtech.com/');
    expect(manifest.viewport).toEqual({ width: 1280, height: 720 });
    expect(createHash('sha256').update(video).digest('hex')).toBe(manifest.sha256);
  });

  it('publishes a non-interactive same-origin player', async () => {
    const html = await readFile(
      resolve(root, 'public/demos/aidx-showcase/index.html'),
      'utf8',
    );
    expect(html).toContain('aidx-homepage-scroll.webm');
    expect(html).toContain('playsinline');
    expect(html).not.toMatch(/<a\b|<button\b|<form\b/);
  });
});
```

Add a component assertion that AIDX has one fallback image, lazy iframe source `/demos/aidx-showcase/index.html`, two external links at most, and no internal transition tone.

- [ ] **Step 2: Run tests and verify RED**

Run `npx vitest run tests/unit/aidx-showcase.test.ts tests/component/homepage.test.tsx`.

Expected: FAIL because the showcase and component do not exist.

- [ ] **Step 3: Create the deterministic capture script**

Implement `scripts/capture-aidx-showcase.mjs` with this complete flow:

```js
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = process.cwd();
const source = 'https://aidxtech.com/';
const viewport = { width: 1280, height: 720 };
const outputDir = path.join(root, 'public/demos/aidx-showcase');
const output = path.join(outputDir, 'aidx-homepage-scroll.webm');
const manifestPath = path.join(root, 'evidence/aidx/showcase-source.json');
const temporary = path.join(root, 'tmp/aidx-capture');

await fs.rm(temporary, { force: true, recursive: true });
await fs.mkdir(temporary, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(path.dirname(manifestPath), { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport,
  recordVideo: { dir: temporary, size: viewport },
  reducedMotion: 'no-preference',
});
const page = await context.newPage();
await page.goto(source, { waitUntil: 'networkidle' });
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(2000);
await page.evaluate(async () => {
  const start = performance.now();
  const duration = 22000;
  const distance = document.documentElement.scrollHeight - innerHeight;
  await new Promise((resolve) => {
    const tick = (now) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - ((-2 * raw + 2) ** 2) / 2;
      scrollTo(0, distance * eased);
      if (raw < 1) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });
});
await page.waitForTimeout(2000);
const video = page.video();
await context.close();
if (!video) throw new Error('Playwright did not create the AIDX capture.');
await video.saveAs(output);
await browser.close();

const bytes = await fs.readFile(output);
await fs.writeFile(manifestPath, `${JSON.stringify({
  version: 1,
  source,
  capturedAt: new Date().toISOString(),
  viewport,
  sha256: createHash('sha256').update(bytes).digest('hex'),
}, null, 2)}\n`);
```

Add `"capture:aidx": "node scripts/capture-aidx-showcase.mjs"` to `package.json`. Run the script once, visually review the generated video, and commit the approved bytes. Do not run it during build or tests.

- [ ] **Step 4: Create the local player and pause protocol**

`index.html` contains only a muted inline video, reset veil, stylesheet, and script. In `showcase.js`, validate `event.origin === location.origin`, accept `{ type: 'aidx-showcase-playback', paused }`, and pause/play the video. On `ended`, set `data-resetting="true"`, wait 500ms, set `currentTime = 0`, resume, then remove the reset state. Post `{ type: 'aidx-showcase-ready' }` to the same-origin parent after `canplay`.

Use:

```css
html, body, main, video { width: 100%; height: 100%; margin: 0; }
body { overflow: hidden; background: #0e100f; }
video { display: block; object-fit: cover; pointer-events: none; }
.veil { position: fixed; inset: 0; background: #5f4b86; opacity: 0; transition: opacity 500ms ease; }
html[data-resetting='true'] .veil { opacity: 1; }
```

- [ ] **Step 5: Create the reusable liquid field**

`LiquidField` accepts `variant: 'aidx' | 'footer'` and `interactive?: boolean`. Use `IntersectionObserver` to stop the animation loop offscreen, `matchMedia` to render one static frame for reduced motion, and pointer coordinates to alter wave phase only when interactive. Draw four broad bezier/sine bands across the full canvas; do not draw isolated circles or gradient orbs.

Public contract:

```ts
interface LiquidFieldProps {
  readonly variant: 'aidx' | 'footer';
  readonly interactive?: boolean;
  readonly className?: string;
}
```

The returned canvas must expose the test and accessibility contract:

```tsx
<canvas
  ref={canvasRef}
  className={`${styles.canvas} ${className ?? ''}`}
  aria-hidden="true"
  data-liquid-field={variant}
  data-motion={reducedMotion ? 'reduced' : running ? 'running' : 'paused'}
/>
```

AIDX uses low opacity and half the footer speed. Footer uses the stronger field and pointer influence capped at 8% of wave amplitude.

- [ ] **Step 6: Build the AIDX parent lifecycle**

Mirror the proven STT lifecycle: proximity-load at `600px` root margin, validate ready messages by origin and source window, pause offscreen, pause on pointer enter/focus, and resume on leave/blur. Reduced motion renders `/images/aidx/home-2026-07.png` without an iframe.

The outer element is a single external anchor:

```tsx
<a
  ref={stageRef}
  className={styles.stage}
  href="https://aidxtech.com/"
  target="_blank"
  rel="noopener noreferrer"
  data-aidx-showcase
  data-aidx-ready={ready ? 'true' : 'false'}
>
  <LiquidField variant="aidx" />
  <div className={styles.browser} data-aidx-browser>
    <span className={styles.chrome} aria-hidden="true"><i /><i /><i /></span>
    {shouldLoad && !reduceMotion ? (
      <iframe
        ref={setIframeNode}
        src="/demos/aidx-showcase/index.html"
        title="Autoplay tour of the AIDX homepage"
        aria-hidden="true"
        tabIndex={-1}
      />
    ) : null}
    <img src="/images/aidx/home-2026-07.png" alt="AIDX homepage" />
  </div>
</a>
```

Keep `pointer-events: none` on the iframe so only the outer card is clickable.

- [ ] **Step 7: Verify unit/component behavior and commit**

Run:

```bash
npx vitest run tests/unit/aidx-showcase.test.ts tests/component/homepage.test.tsx
```

Expected: PASS.

```bash
git add package.json scripts/capture-aidx-showcase.mjs evidence/aidx public/demos/aidx-showcase components/home/aidx-showcase.tsx components/home/aidx-showcase.module.css components/home/live-website-project.tsx components/ui/liquid-field.tsx components/ui/liquid-field.module.css tests/unit/aidx-showcase.test.ts tests/component/homepage.test.tsx
git commit -m "feat: add autoplay AIDX media stage"
```

## Task 6: Build the Liquid Footer and Finish About Email Contact

**Files:**
- Modify: `components/shell/site-footer.tsx`
- Modify: `components/shell/site-footer.module.css`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Modify: `app/(localized)/[locale]/about/page.tsx`
- Modify: `app/(localized)/[locale]/about/about.module.css`
- Create: `tests/component/site-footer.test.tsx`
- Test: `tests/unit/i18n.test.ts`
- Test: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write failing Footer and About tests**

Create:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SiteFooter } from '@/components/shell/site-footer';

describe('SiteFooter', () => {
  it('uses one direct email CTA and one About link', () => {
    const { container } = render(<SiteFooter locale="zh" />);
    expect(screen.getByRole('link', { name: /yangux@qq.com/i })).toHaveAttribute(
      'href',
      expect.stringMatching(/^mailto:yangux@qq\.com/),
    );
    expect(screen.getByRole('link', { name: '关于' })).toHaveAttribute('href', '/zh/about/');
    expect(screen.queryByText('简历')).not.toBeInTheDocument();
    expect(container.querySelector('[data-liquid-field="footer"]')).toBeInTheDocument();
  });
});
```

Add an About route test that expects a visible `mailto:yangux@qq.com` link and no `data-publication-state="draft"`.

- [ ] **Step 2: Run tests and verify RED**

Run `npx vitest run tests/component/site-footer.test.tsx tests/unit/i18n.test.ts`.

Expected: FAIL because the footer still exposes Resume/Contact and has no liquid field.

- [ ] **Step 3: Add exact footer copy**

Add matching dictionary keys:

```ts
footer: {
  title: 'Have a complex product worth making clear?',
  emailAction: 'Email Yang Jing',
  aboutAction: 'About',
  privacy: 'This static site uses Cloudflare Web Analytics and has no contact form.',
},
```

Chinese title: `有复杂的产品，值得一起把它做清楚。`; email action: `发邮件给杨静`; About action: `关于`.

- [ ] **Step 4: Rebuild the Footer around the shared liquid field**

Use:

```tsx
<footer className={styles.root}>
  <LiquidField variant="footer" interactive />
  <div className={styles.inner}>
    <p className={styles.eyebrow}>Yang Jing</p>
    <h2>{dictionary.footer.title}</h2>
    <div className={styles.actions}>
      <a href="mailto:yangux@qq.com?subject=Portfolio%20inquiry">
        {dictionary.footer.emailAction}<span>yangux@qq.com</span>
      </a>
      <a href={`${localeRoot}about/`}>{dictionary.footer.aboutAction}</a>
    </div>
    <div className={styles.legal}>
      <p>© {new Date().getFullYear()} Yang Jing.</p>
      <p>{dictionary.footer.privacy}</p>
    </div>
  </div>
</footer>
```

The content layer must remain stable and meet AA contrast. The canvas stays `aria-hidden`, does not receive pointer events, pauses offscreen, and respects reduced motion through `LiquidField`.

- [ ] **Step 5: Replace the About placeholder contact section**

Remove the pending portrait/resume/contact list and `data-publication-state="draft"`. Render:

```tsx
<section id="contact" className={styles.contact}>
  <h2>{locale === 'zh' ? '联系我' : 'Get in touch'}</h2>
  <a href="mailto:yangux@qq.com">yangux@qq.com</a>
</section>
```

Do not add a form, phone number, or unverified social link.

- [ ] **Step 6: Verify GREEN and commit**

Run:

```bash
npx vitest run tests/component/site-footer.test.tsx tests/unit/i18n.test.ts
```

Expected: PASS.

```bash
git add components/shell/site-footer.tsx components/shell/site-footer.module.css content/dictionaries/en.ts content/dictionaries/zh.ts 'app/(localized)/[locale]/about/page.tsx' 'app/(localized)/[locale]/about/about.module.css' tests/component/site-footer.test.tsx tests/unit/i18n.test.ts tests/e2e/homepage.spec.ts
git commit -m "feat: add liquid footer and direct email contact"
```

## Task 7: Integrate, Protect Visual Archive, and Verify the Whole Experience

**Files:**
- Modify: `app/(localized)/[locale]/page.tsx`
- Modify: `components/home/about-preview.tsx`
- Modify: `components/home/home.module.css`
- Modify: `tests/component/homepage.test.tsx`
- Modify: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Add the final page-order and locked Archive assertions**

Set `id="archive"` on the existing archive bridge, not inside `VisualArchive`. Extend E2E:

```ts
const sectionOrder = await page.locator(
  '[data-media="portrait"], [data-intro-story], #work, #archive, [data-about-preview]',
).evaluateAll((nodes) => nodes.map((node) =>
  node.getAttribute('data-media') ??
  (node.hasAttribute('data-intro-story') ? 'intro' : node.id || 'about')
));
expect(sectionOrder).toEqual(['portrait', 'intro', 'work', 'archive', 'about']);

await expect(page.locator('[data-archive-card]')).toHaveCount(4);
await expect(page.locator('[data-archive-position]')).toHaveText('01 / 04');
```

Add `data-about-preview` to the existing `AboutPreview` section so the final order can be asserted without coupling tests to CSS class names.

Keep the existing next-button loop that reaches `04 / 04` and verifies the final card stays highlighted.

- [ ] **Step 2: Add AIDX, navigation, Footer, and reduced-motion E2E checks**

Add one desktop test that scrolls AIDX into view, waits for `data-aidx-ready="true"`, verifies the iframe is same-origin and pointer-inert, hovers to pause, then moves away to resume. Expose only a test-safe playback state such as `data-aidx-playback="paused|running"` on the outer stage.

Add one reduced-motion test that asserts the AIDX iframe is absent, the fallback is visible, and both liquid canvases report `data-motion="reduced"`.

Add navigation checks for `Work`, `Archive`, `About`, the direct language icon, and the `mailto:yangux@qq.com` Footer link.

- [ ] **Step 3: Tune only the Archive boundary**

Keep Archive internals unchanged. Adjust only:

```css
.archiveBridge {
  position: relative;
  padding-block-start: clamp(4rem, 9vh, 8rem);
  border-top: 1px solid var(--theme-border);
  background: var(--theme-canvas);
}
```

Retain the existing lightweight entry animation and top track clearance. Ensure the Xuelang close does not overlap or leave an accidental empty viewport before Archive.

- [ ] **Step 4: Run focused tests**

Run:

```bash
npx vitest run tests/unit/home-content.test.ts tests/unit/i18n.test.ts tests/unit/aidx-showcase.test.ts tests/component/site-header.test.tsx tests/component/locale-switcher.test.tsx tests/component/site-footer.test.tsx tests/component/homepage.test.tsx
npx playwright test tests/e2e/homepage.spec.ts --project=desktop
npx playwright test tests/e2e/homepage.spec.ts --project=mobile
```

Expected: all PASS. Treat the previously documented unrelated CLI timeout as a known baseline only if it reproduces outside these homepage tests; do not weaken new assertions to hide a regression.

- [ ] **Step 5: Perform CSS and DOM audits**

Run:

```bash
rg -n "#194BFF|#4b7aff|color-cobalt|hero-blue" app/globals.css components/home components/shell
git diff -- components/home/visual-archive.tsx content/home.ts public/images/archive tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
```

Expected: no cobalt matches in homepage/shell CSS. Inspect the diff to confirm archive project data, project order, cover internals, and carousel logic are unchanged; only tests around the Archive boundary may differ.

- [ ] **Step 6: Verify visual quality in a real browser**

Start the existing dev server on an unused port and capture:

- `/en/` at 1440x900
- `/zh/` at 1440x900
- `/en/` at 390x844
- `/zh/` at 390x844
- AIDX stage while running and while paused
- Footer at rest and under pointer response
- Reduced-motion AIDX and Footer

Check hero title line count, nav text fit, company-mark clarity, project order, 20px radii, no overlapping text, smooth AIDX reset, Archive neighboring-card reveal, `04 / 04`, and no page-level horizontal overflow.

- [ ] **Step 7: Run repository verification**

Run:

```bash
npm run lint
npm test
npm run build:framework
npx playwright test tests/e2e/homepage.spec.ts
```

Expected: lint, Vitest, Next.js framework build, and homepage E2E all PASS. If the full publication validator fails on a known pre-existing publication input, record the exact failure separately and do not claim `npm run build` passed.

- [ ] **Step 8: Commit the integration**

```bash
git add 'app/(localized)/[locale]/page.tsx' components/home/about-preview.tsx components/home/home.module.css tests/component/homepage.test.tsx tests/e2e/homepage.spec.ts
git commit -m "test: verify homepage brand architecture"
```

## Final Acceptance Checklist

- `/en/` and `/zh/` render the same approved hierarchy.
- Hero is taller; both role labels stay English at weight 800.
- Introduction is dark, has exactly three scenes, and includes the 24px Vibe Coding support line in scene one.
- Homepage and shell CSS contain no cobalt blue.
- Every core project shows the approved company name and verified monochrome mark.
- Core order is Call Agent, ConvoAI, Meeting, STT, AIDX, Xuelang.
- AIDX uses a committed same-origin autoplay recording, pauses on hover/focus/offscreen, resets under a purple veil, and opens the live site in a new tab.
- STT remains a formal Agora product and opens its full Demo in a new tab.
- Navigation is one glass capsule with direct Work, Archive, About, and language actions.
- Language switching is immediate, icon-only, and preserves route/hash where possible.
- Footer uses the restrained interactive liquid field and direct `mailto:yangux@qq.com` CTA.
- About exposes the same email and no draft resume/contact placeholders.
- Visual Archive internals remain unchanged and its final card remains highlighted at `04 / 04`.
- Desktop and 390px layouts have no page-level horizontal overflow.
- Keyboard focus, touch behavior, offscreen pausing, and reduced motion are verified.
