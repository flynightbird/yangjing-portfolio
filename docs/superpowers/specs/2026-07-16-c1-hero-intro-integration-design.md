# C1 Hero And Intro Story Integration Design

## Status

Approved for implementation planning on 2026-07-16. This document is the
handoff contract for integrating the selected C1 Hero and the previously built
personal introduction into the existing bilingual homepage.

## Goal

Replace only the current homepage Hero with the selected C1 Interface Gallery
direction, then restore the four-scene Intro Story immediately below it. The
result must introduce Yang Jing as both a Product Designer and an AI-native
Builder before visitors reach the existing project content.

The integration must preserve the current project order, Visual Archive,
About Preview, localized routes, and default dark theme.

## Approved Direction

- Use `C1 / Interface Gallery` for the Designer field.
- Preserve the central portrait and the direct-manipulation split between the
  Designer and Builder fields.
- Restore the previously implemented Intro Story below the Hero.
- Use a targeted port into the current homepage. Do not embed the standalone
  prototype in an iframe and do not merge the old Hero commits wholesale.
- Remove all prototype chrome, including `Motion Study`, direction labels, and
  experimental annotations.
- Keep the existing global Site Header as the only page navigation above the
  Hero.

## Source Material

### Selected visual prototype

The selected C1 prototype is:

`/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview/motion-directions-v1.html?variant=b&designer=c1`

It must be viewed through an HTTP server rooted at:

`/Users/admin/Documents/作品集-yangjing/.superpowers/live-preview`

The prototype uses `/files/portrait-placeholder-noemi-cutout-v3.png`. Opening
the HTML directly through `file://` does not resolve this root-relative asset
and is not valid visual evidence.

### Prior production-oriented implementation

The isolated worktree at:

`/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/hero-redesign`

contains useful production-oriented behavior and the prior Intro Story:

- `components/home/dual-identity-hero.tsx`
- `components/home/hero-motion.tsx`
- `components/home/intro-story.tsx`
- `components/home/intro-story-motion.tsx`
- `docs/superpowers/specs/2026-07-15-intro-story-design.md`
- commit `3af11dd` for the interactive portrait Hero
- commit `139aced` for the Intro Story

The old production Hero used Material Blueprint rather than the selected C1
direction. Its interaction structure may be reused, but its Designer-side art
must not be copied as the final visual direction.

## Homepage Composition

The localized homepage must render one shared structure for `/en/` and `/zh/`:

1. `SiteHeader`
2. `DualIdentityHero`
3. `IntroStory`
4. `FeaturedWork`
5. `VisualArchive`
6. `AboutPreview`
7. `SiteFooter`

`IntroStory` is inserted only between `DualIdentityHero` and `FeaturedWork`.
No other homepage section is reordered.

## Component Boundaries

### DualIdentityHero

`components/home/dual-identity-hero.tsx` remains the server-side boundary. It
selects the existing localized Hero copy and passes explicit labels, role
lines, summaries, and portrait accessibility text to the client interaction
component.

The two roles remain equal semantic headings. `Yang Jing` remains the single
homepage H1.

### HeroMotion

`components/home/hero-motion.tsx` owns only the interactive scene:

- adjustable split position;
- pointer, click, keyboard, and touch input;
- magnetic settling;
- five-second desktop return to center;
- Builder scan triggering and cleanup;
- page-visibility and reduced-motion behavior;
- stable portrait error fallback.

The C1 Interface Gallery composition is declarative DOM and CSS. Canvas may be
used only for the existing Builder scan field. The Designer field must not
draw a fake application or add another portrait.

### IntroStory

`components/home/intro-story.tsx` is the server-side localized content
boundary. `components/home/intro-story-motion.tsx` owns the optional GSAP
ScrollTrigger behavior, scene navigation, reverse-entry shortcut, and cleanup.

The Intro Story remains independent from Hero state. Scrolling or adjusting
the Hero divider does not mutate Intro Story progress.

### Styles

Hero and Intro Story styles must use isolated class names inside
`components/home/home.module.css`, or focused component modules if that avoids
conflict more reliably. Do not replace the full stylesheet with an older
branch version.

## Hero Visual System

The Hero uses two dark, clearly differentiated fields:

- Designer: deep olive-black with the C1 Interface Gallery composition;
- Builder: carbon black with a restrained system grid and blue technical
  signals.

The Designer composition uses selection frames, alignment rails, component
slices, resize handles, and cropped layout planes as abstract gallery objects.
These elements remain behind the role title and outside its protected reading
zone. They do not depict a literal dashboard.

The central portrait is rendered as two perfectly aligned treatments of the
same source:

- Designer treatment: color;
- Builder treatment: darker grayscale.

The draggable divider reveals the two treatments without moving or resizing
the subject. Role titles remain two lines, use equal size and weight, have zero
letter spacing, and remain readable at every supported split position.

The Hero must leave a visible cue of the Intro Story below it in the initial
desktop and mobile viewport without causing text or portrait clipping.

## Hero Interaction Contract

### Desktop

- Dragging the divider changes the split continuously.
- Clicking in the Hero moves the split toward the selected field.
- Left and Right Arrow keys adjust an accessible separator control.
- The split settles magnetically at the center and approved near-edge reveal
  positions.
- Five seconds after the pointer leaves the Hero, the divider returns to the
  center with damped motion.
- Re-entry or any new input cancels the pending return.
- A new entry into the Builder field triggers one scan.
- Releasing one divider drag triggers exactly one Builder scan.
- Background tab visibility pauses timed behavior and prevents stale motion
  from firing on return.

### Mobile

- Touch dragging remains available.
- The composition reduces to no more than three dominant Designer-side forms.
- Automatic return is disabled.
- Fine annotations that become visual noise are removed rather than scaled
  down indefinitely.

### Reduced Motion

- No timed return, scan animation, pinned motion, or ambient loop is created.
- The final split composition remains visible and understandable.
- All controls and content remain keyboard and screen-reader accessible.

## Intro Story Content

The Intro Story is a quiet editorial bridge between the Hero and project
evidence. It contains no portrait, cards, gradient, or decorative illustration.

### Chinese

1. `我在产品规模与` / `系统复杂度的交界处设计`
2. `从大规模 C 端产品` / `到持续使用的真实体验`
3. `再到 B2B 与 AI 系统` / `让每个状态都清晰可控`
4. `现在，我用设计判断与 AI` / `把想法做成可运行产品`

### English

1. `I design where product scale` / `meets system complexity.`
2. `From consumer products` / `designed at scale.`
3. `To B2B and AI systems` / `where every state matters.`
4. `Now I turn design judgment` / `into working products with AI.`

On motion-capable desktop and tablet browsers, the section pins for four
forward scenes. A compact `01-04` rail reports progress and supports direct
navigation. When re-entered from below, the section returns directly to scene
one rather than replaying scenes four through two in reverse.

On mobile and under reduced motion, the four statements render as a normal
vertical reading sequence without a long pinned scroll.

## Portrait And Publication Boundary

The current portrait is a temporary third-party placeholder and must not be
treated as Yang Jing or as a publishable identity asset.

Development previews may use the placeholder while its filename and code path
remain explicitly marked as temporary. Production publication requires an
approved, transparent-background portrait of Yang Jing. Publication validation
must fail while the temporary portrait remains active.

If the portrait fails to load during development, the Hero retains its stable
dimensions and shows the existing `YJ` fallback treatment. Missing media must
not collapse the Hero or create layout shift.

## Locked Homepage Areas

The following Visual Archive implementation is the only approved version and
must not be redesigned, replaced, or overwritten during this work:

- `components/home/visual-archive.tsx`
- Archive selectors in `components/home/home.module.css`
- the four real projects in `content/home.ts`
- Archive content in `content/dictionaries/en.ts`
- Archive content in `content/dictionaries/zh.ts`
- `public/images/archive/`

The integration must preserve the four-project horizontal carousel, 20px
corner radius, gray border, image zoom, corrected top crop, highlighted
`04 / 04` terminal card, company/time/title overlay, descriptions, Skills, and
default dark theme.

The implementation also leaves `FeaturedWork` and `AboutPreview` content,
ordering, and visual treatment unchanged.

## Failure Handling And Cleanup

- Portrait failure resolves to a stable `YJ` fallback.
- Dynamic imports that fail leave semantic copy and a usable static layout.
- Every timer, pointer listener, animation frame, GSAP tween, and ScrollTrigger
  is removed during component cleanup.
- Resizing or changing motion preferences rebuilds only the affected scene and
  does not duplicate listeners or triggers.
- Hero interaction failure never prevents access to Intro Story or projects.

## Verification

### Component contracts

- The localized homepage orders Hero, Intro Story, Featured Work, Visual
  Archive, and About Preview correctly.
- `Yang Jing` is the only H1; both roles are equal semantic headings.
- Intro Story renders four localized statements with two explicit lines each
  and four accessible progress controls where the rail is active.
- The portrait has a stable fallback and explicit dimensions.

### Browser behavior

Verify `/en/` and `/zh/` at `1440x900`, `768x1024`, and `390x844`:

- no horizontal overflow or incoherent text overlap;
- portrait alignment and crop remain stable across the full split range;
- pointer, keyboard, and touch adjustment work;
- one drag release produces one Builder scan;
- desktop timed return and cancellation work;
- mobile automatic return is absent;
- Intro Story forward sequence, direct navigation, and reverse shortcut work;
- reduced motion shows complete readable content without pinned or timed
  animation;
- the existing Site Header is not duplicated;
- the first viewport hints at Intro Story;
- no console errors or failed required assets occur.

### Regression checks

- Run the existing Visual Archive component, unit, and browser tests.
- Run the focused Hero and Intro Story component and browser tests.
- Run ESLint.
- Run the Next.js framework build.
- Report the known full-publication blockers for Meeting, profile, resume, and
  other absent approved media separately from Hero regressions.

## Out Of Scope

- redesigning or rewriting Visual Archive;
- changing project order or project case content;
- changing About Preview;
- embedding the standalone HTML prototype;
- publishing the temporary portrait;
- merging all of `3af11dd` or `139aced` without reviewing each affected file;
- implementing Agora Meeting content as part of this Hero task.

## Implementation Handoff

Start from the current `codex/portfolio-nextjs` worktree and preserve its dirty
user-owned changes. Read the selected C1 prototype and the isolated
`codex/hero-redesign` worktree as source material. Port only the approved
component behavior, Intro Story files, scoped styles, route insertion, and
focused tests required by this document.

Before editing `home.module.css`, identify and protect the current Hero,
Intro Story, Featured Work, Visual Archive, and About selector boundaries.
Never replace the file with the older worktree copy. Use a focused diff to
confirm that Archive selectors and locked content files remain unchanged.
