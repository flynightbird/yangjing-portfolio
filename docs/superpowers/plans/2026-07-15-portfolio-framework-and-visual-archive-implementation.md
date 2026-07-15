# Portfolio Framework And Visual Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved bilingual portfolio homepage framework, honest ByteDance and Meeting draft routes, external-only AIDX treatment, sole STT Build Lab preview, and eight-slot Visual Archive without fabricating missing evidence.

**Architecture:** Keep the existing Next.js static export, CSS Modules, content registry, and Interface X-Ray tokens. Add a typed homepage presentation model separate from native MDX case content, register draft route components for local framework builds, and make publication validation reject machine-readable draft markers in both source and output modes.

**Tech Stack:** Next.js 16, React 19 Server Components, TypeScript, Zod, CSS Modules, Motion for React, Lucide React, Vitest, Testing Library, Playwright.

---

## File Map

- Create `content/home.ts`: bilingual homepage data, destination and availability contracts, archive schema, and eight neutral development slots.
- Modify `content/dictionaries/en.ts` and `content/dictionaries/zh.ts`: complete localized homepage, draft, archive, external-link, About, and contact-framework strings.
- Create `components/home/dual-identity-hero.tsx` and `components/home/hero-motion.tsx`: server-rendered hero with a small client motion leaf.
- Create `components/home/featured-work.tsx`: approved project order and component composition.
- Create `components/home/featured-project.tsx`: shared editorial semantics for internal project bands.
- Create `components/home/meeting-preview.tsx`: three-state text sequence without fake UI.
- Create `components/home/live-website-project.tsx`: AIDX external-only band.
- Create `components/home/build-lab-preview.tsx`: sole STT Demo band.
- Create `components/home/visual-archive.tsx`: validated real entries or exactly eight honest draft slots.
- Create `components/home/about-preview.tsx`: approved career arc and opportunity statement without fake contacts.
- Create `components/home/home.module.css`: one responsive Interface X-Ray layout system for homepage modules.
- Create `components/draft-case/draft-case.tsx` and `components/draft-case/draft-case.module.css`: local ByteDance and Meeting route scaffolds.
- Create `content/work/bytedance-draft.tsx` and `content/work/meeting-draft.tsx`: bilingual route content with approved evidence boundaries.
- Modify `content/registry.ts`: register draft routes without creating MDX publication evidence.
- Create `app/(localized)/[locale]/about/page.tsx`: about and contact framework route.
- Modify `app/(localized)/[locale]/page.tsx`: compose the new homepage.
- Modify `scripts/validate-publication.mjs`: reject `data-publication-state="draft"` in source and output publication modes.
- Add focused unit and component tests, then update export tests for the four additional draft routes.

### Task 1: Homepage Content Contract

**Files:**
- Create: `content/home.ts`
- Modify: `content/dictionaries/en.ts`
- Modify: `content/dictionaries/zh.ts`
- Test: `tests/unit/home-content.test.ts`

- [ ] **Step 1: Write the failing contract tests**

Test that the homepage order is ByteDance, Call Agent, Meeting, AIDX, STT Demo; AIDX has `external-live-site` and `https://aidxtech.com/`; STT is the only `build-lab`; draft projects use explicit `draft` availability; archive development data has exactly eight slots and no name, role, URL, or image; real archive entries require a safe image path, positive intrinsic dimensions, and non-empty alt text; English and Chinese dictionaries have identical leaf keys.

- [ ] **Step 2: Verify the tests fail for the missing module**

Run: `npm test -- tests/unit/home-content.test.ts`

Expected: FAIL because `@/content/home` does not exist.

- [ ] **Step 3: Implement the minimal typed model**

Define these explicit unions:

```ts
export type ProjectDestination =
  | 'internal-case'
  | 'external-live-site'
  | 'lightbox-only';
export type ProjectAvailability = 'complete' | 'draft' | 'awaiting-assets';
export type HomepageProjectKind = 'deep-case' | 'live-launch' | 'build-lab';
```

Use a discriminated Zod schema for archive entries so a real entry must include
`name`, `category`, `role`, `image.src`, `image.width`, `image.height`, and
`image.alt`, while a development slot includes only `key`, `kind: 'draft-slot'`,
and `layoutIndex`. Export exactly eight development slots.

- [ ] **Step 4: Run the focused tests and full dictionary test**

Run: `npm test -- tests/unit/home-content.test.ts tests/unit/i18n.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the content contract**

```bash
git add content/home.ts content/dictionaries/en.ts content/dictionaries/zh.ts tests/unit/home-content.test.ts
git commit -m "feat: define portfolio homepage content contract"
```

### Task 2: Homepage Framework

**Files:**
- Create: `components/home/dual-identity-hero.tsx`
- Create: `components/home/hero-motion.tsx`
- Create: `components/home/featured-work.tsx`
- Create: `components/home/featured-project.tsx`
- Create: `components/home/meeting-preview.tsx`
- Create: `components/home/live-website-project.tsx`
- Create: `components/home/build-lab-preview.tsx`
- Create: `components/home/visual-archive.tsx`
- Create: `components/home/about-preview.tsx`
- Create: `components/home/home.module.css`
- Modify: `app/(localized)/[locale]/page.tsx`
- Test: `tests/component/homepage.test.tsx`

- [ ] **Step 1: Write failing semantic and interaction tests**

Render the homepage components in both locales and assert: both hero identities are headings; the portrait aperture is marked Draft and does not contain an image when the real portrait is absent; five project treatments appear in the approved order; ByteDance and Meeting links are internal; AIDX uses `_blank`, `rel="noreferrer"`, an external destination label, and no internal AIDX link; exactly one Build Lab heading exists; Meeting exposes three named text stages; the Archive renders eight machine-readable draft slots; and About uses only the approved career progression and freelance proposition.

- [ ] **Step 2: Verify the tests fail for missing components**

Run: `npm test -- tests/component/homepage.test.tsx`

Expected: FAIL because the homepage component modules do not exist.

- [ ] **Step 3: Implement server-first components and one motion leaf**

Keep content rendering in Server Components. `HeroMotion` may use Motion for one mount reveal only and must use `useReducedMotion()` to render the final state immediately. Do not add GSAP, pointer tracking, fake screenshots, or remote images. Use the existing Call Agent screenshot and STT poster; use stable draft apertures for ByteDance, Meeting, portrait, and Archive.

- [ ] **Step 4: Implement the exact desktop Archive composition**

Use a 12-column dense grid with spans `7+5`, `4+8`, `8+4`, `5+7`. Every slot has a stable aspect ratio and a visible localized Draft label. Below 768px, render one column and keep all labels visible.

- [ ] **Step 5: Verify component tests and regressions**

Run: `npm test -- tests/component/homepage.test.tsx tests/component/case-study.test.tsx tests/unit/design-tokens.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the homepage framework**

```bash
git add app/'(localized)'/'[locale]'/page.tsx components/home tests/component/homepage.test.tsx
git commit -m "feat: build portfolio homepage framework"
```

### Task 3: Honest Draft Routes And About Framework

**Files:**
- Create: `components/draft-case/draft-case.tsx`
- Create: `components/draft-case/draft-case.module.css`
- Create: `content/work/bytedance-draft.tsx`
- Create: `content/work/meeting-draft.tsx`
- Modify: `content/registry.ts`
- Create: `app/(localized)/[locale]/about/page.tsx`
- Test: `tests/component/draft-case.test.tsx`
- Modify: `tests/unit/content-schema.test.ts`
- Modify: `tests/export/static-shell.test.mjs`

- [ ] **Step 1: Write failing route and Draft semantics tests**

Assert bilingual ByteDance and Meeting registry entries exist with canonical featured order and neighbors; each draft page renders localized Draft text, a stable media aperture, and `data-publication-state="draft"`; ByteDance contains no inferred private content; Meeting separates shipped evidence from a 2026 retrospective; About contains no `mailto`, LinkedIn URL, WeChat ID, QR image, or resume link while private inputs are absent.

- [ ] **Step 2: Verify the tests fail**

Run: `npm test -- tests/component/draft-case.test.tsx tests/unit/content-schema.test.ts`

Expected: FAIL because draft entries and the component are missing.

- [ ] **Step 3: Implement draft components and registry entries**

Register TypeScript components, not MDX files, so local `build:framework` emits the routes while the source publication validator still requires real canonical MDX. Preserve the canonical navigation sequence ByteDance, Call Agent, Meeting, STT Demo. Use required future media paths only as metadata and never render broken `<img>` elements.

- [ ] **Step 4: Implement the About route as an awaiting-input framework**

Render only the approved career arc and freelance proposition. Reserve portrait, resume, email, LinkedIn, and WeChat areas as unavailable input rows with no fake values. Mark the route with `data-publication-state="draft"`.

- [ ] **Step 5: Verify registry and framework export**

Run: `npm test -- tests/component/draft-case.test.tsx tests/unit/content-schema.test.ts tests/unit/case-neighbor.test.tsx && npm run build:framework && npm run test:export`

Expected: unit tests pass and the static export adds six artifacts for bilingual ByteDance, Meeting, and About routes to the existing export set.

- [ ] **Step 6: Commit the draft framework**

```bash
git add components/draft-case content/work/bytedance-draft.tsx content/work/meeting-draft.tsx content/registry.ts app/'(localized)'/'[locale]'/about tests
git commit -m "feat: add honest draft case and about routes"
```

### Task 4: Explicit Publication Draft Gate

**Files:**
- Modify: `scripts/validate-publication.mjs`
- Modify: `tests/unit/publication-validation.test.ts`

- [ ] **Step 1: Write failing source and output gate tests**

Create isolated fixtures containing `data-publication-state="draft"` in a TSX source file and in exported HTML. Assert `development` mode reports missing real inputs without a draft error, while `source` and `output` modes each return a clear `Draft publication marker` error naming the file.

- [ ] **Step 2: Verify the new tests fail for missing validation**

Run: `npm test -- tests/unit/publication-validation.test.ts`

Expected: FAIL because draft markers are not scanned.

- [ ] **Step 3: Implement mode-specific marker scanning**

For source mode scan regular files under `app`, `components`, and `content`. For output mode scan HTML under `out`. Reject only the exact machine-readable attribute so prose documentation and test descriptions do not create false positives. Reuse the existing symlink-safe file walker and relative-path reporting.

- [ ] **Step 4: Verify the gate and expected incomplete publication failure**

Run: `npm test -- tests/unit/publication-validation.test.ts && node scripts/validate-publication.mjs --mode=development && node scripts/validate-publication.mjs --mode=source`

Expected: tests and development validation pass; source validation exits non-zero and names both missing publication inputs and Draft publication markers.

- [ ] **Step 5: Commit the publication boundary**

```bash
git add scripts/validate-publication.mjs tests/unit/publication-validation.test.ts
git commit -m "feat: block publication of draft portfolio states"
```

### Task 5: Full Verification And Visual Refinement

**Files:**
- Create: `tests/e2e/homepage.spec.ts`
- Modify: `tests/export/static-shell.test.mjs`
- Modify only if screenshots reveal defects: `components/home/home.module.css`

- [ ] **Step 1: Write browser tests before refinement**

Assert English and Chinese homepage order, internal and external destinations, eight archive slots, one Build Lab entry, Draft route accessibility, no horizontal overflow, and reduced-motion readability.

- [ ] **Step 2: Run the browser test and observe any failures**

Run: `npx playwright test tests/e2e/homepage.spec.ts`

Expected: initial failures identify layout or behavior requiring refinement.

- [ ] **Step 3: Refine only the failing behavior**

Use screenshots at 1440x900 and 390x844. Keep both hero identities and the top edge of ByteDance visible, preserve 44px targets, and remove overlap or overflow without changing approved content.

- [ ] **Step 4: Run fresh complete verification**

Run: `npm run lint && npm test && npm run validate:content && npm run build:framework && npm run test:export && npx playwright test tests/e2e/homepage.spec.ts`

Expected: all commands exit zero.

- [ ] **Step 5: Confirm publication remains blocked for the correct reasons**

Run: `node scripts/validate-publication.mjs --mode=source`

Expected: non-zero exit naming missing approved inputs, missing canonical ByteDance and Meeting MDX publication content, and Draft publication markers. No privacy, checksum, Call Agent, or STT regression error is permitted.

- [ ] **Step 6: Commit verified framework refinements**

```bash
git add tests/e2e/homepage.spec.ts tests/export/static-shell.test.mjs components/home/home.module.css
git commit -m "test: verify portfolio framework across viewports"
```

## Self-Review

- Spec coverage: all homepage bands, bilingual copy, AIDX external-only behavior,
  one Build Lab entry, eight archive slots, Draft routes, About framework,
  accessibility, responsive behavior, and publication blocking map to tasks.
- Placeholder scan: implementation steps contain concrete contracts, commands,
  and expected results. Runtime Draft states are approved product behavior, not
  missing plan instructions.
- Type consistency: destination, availability, project kind, archive schema, and
  publication marker names are identical across tasks.
- Fixed evidence: no task modifies Call Agent evidence, the STT source revision,
  the STT checksum contract, or any verified media file.
