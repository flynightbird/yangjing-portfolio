# Homepage Visual Polish Design

**Date:** 2026-07-18
**Status:** Approved for implementation
**Branch:** `codex/portfolio-nextjs`

## Objective

Polish the approved homepage architecture without changing its project order or the locked Visual Archive. The work gives the navigation a clear top-to-scrolled transformation, makes project ownership easier to scan, strengthens the first three project actions, and replaces hard liquid boundaries with broad, softly feathered motion.

## Design Direction

- Audience: design and product leaders evaluating a senior UX/UI designer and AI-native builder.
- Visual priority: authored visual impact first, efficient case discovery second.
- Design variance: 8 / 10.
- Motion intensity: 7 / 10.
- Visual density: 3 / 10.
- Theme: one continuous dark editorial theme with cool lavender media stages and a small signal-green runtime accent.
- Shape system: 20px for media and browser frames. Section containers remain unframed.

## Navigation

At the top of the page, desktop navigation is a full-width 78px bar. `Yang Jing` is left aligned, Work / Archive / About are centered, and the language icon is right aligned. It has no capsule outline at the top.

After the page moves beyond the top threshold, the navigation morphs into a centered frosted-glass capsule. The transition changes width, inset, border, background opacity, and shadow as one continuous state change. `Yang Jing` remains the home label in both locales. Its hover background is centered around the full name.

Mobile uses a 64px full-width top state with `Yang Jing`, menu, and language controls. The scrolled state becomes a capsule with 12px side margins. Scroll state detection uses `IntersectionObserver`, not a direct window scroll listener. Reduced motion removes animated interpolation but preserves both states.

## Project Metadata And Actions

All six core projects display one inline metadata row:

`company logo + company name / project type`

The company name and project type share the same font size, weight, baseline, and muted contrast. The row wraps cleanly on narrow screens without clipping.

The first three projects, Call Agent, ConvoAI, and Meeting, use a white filled CTA with dark text. Their buttons have enough bottom space before the media or next content block to read as deliberate actions. STT keeps its signal-green runnable-product action. AIDX and Xuelang retain restrained secondary action styling.

## AIDX Media Stage

The AIDX section stays full-bleed and unframed. The virtual browser alone uses a 20px radius. Its chrome matches the STT light browser language: light gray bar, low-contrast controls, subtle border, and dark low-contrast URL text.

The liquid field uses a brighter cool-lavender family centered on `#d9e3ff`, `#a8b9ef`, and `#8c8dde`. Broad translucent fields overlap and blur into one another. No wave polygon or hard boundary is visible. Motion is slow and atmospheric, and the existing browser hover lift remains restrained.

## Footer Liquid

The Footer uses the same broad Soft Silk language in a darker palette. Forms are approximately 1.8 times larger than the current waves, move more slowly, and use strong feathering. The backdrop must not show a crisp fluid edge. Footer typography and links remain stable and readable above the motion.

## Media Geometry

- Xuelang media becomes a page-guttered 20px rounded card.
- AIDX remains an unframed full-width media stage.
- Only the AIDX virtual browser is rounded.
- No nested same-radius cards are introduced.

## Accessibility And Responsive Behavior

- Navigation and actions preserve 44px minimum interactive targets.
- Keyboard focus remains visible.
- Motion respects `prefers-reduced-motion`.
- Animated canvases pause outside the viewport.
- The homepage has no page-level horizontal overflow at 390px.
- All project metadata is visible without hover.
- Visual Archive internals, order, controls, card radius, hover scale, and last-card state remain untouched.

## Validation

- `/en/` and `/zh/` render the `Yang Jing` home label.
- The top navigation is full-width and the observed scrolled state is a centered capsule.
- All six projects expose inline company/type metadata.
- Only Call Agent, ConvoAI, and Meeting expose the white filled CTA treatment.
- STT keeps its green CTA; AIDX and Xuelang stay secondary.
- AIDX uses light browser chrome and the brighter lavender field.
- AIDX and Footer liquid fields have no hard polygon boundary.
- Xuelang media is a guttered 20px rounded card.
- Desktop and 390px mobile have no horizontal overflow.
- Existing component tests, lint, and Next.js framework build pass.

## Out Of Scope

- Changing project copy, ownership, order, or routes
- Redesigning the Visual Archive
- Replacing project assets
- Changing case-study pages
- Adding a theme switcher

