# Xuelang Adaptive Course Entry Design

**Date:** 2026-07-17
**Status:** Approved visual direction
**Branch:** `codex/xuelang-case-polish`

## Objective

Replace the single screenshot inside step 01, Course Entry, with an interactive four-state product story. Show that the learning entry adapts to the learner's relationship with the platform instead of remaining a fixed destination.

## Narrative

The module presents four mutually exclusive entry states in this order:

1. **Discover:** The learner has not purchased a course. The entry prioritizes discovery and recommendations.
2. **Start:** The learner bought a new course but has not watched it. The entry prioritizes beginning the course.
3. **Continue:** The learner has recently watched a course. The entry restores progress and context.
4. **Join live:** A teacher the learner follows is live. The entry prioritizes the time-sensitive event while preserving the ongoing course.

The Continue state is selected by default because it best represents the continuous-learning thesis and uses the higher-resolution third Hero screen.

## Approved Desktop Layout

Use option B: a focused main screen with persistent state navigation.

- Place the active product screenshot in a dark main stage on the left.
- Place four state controls in a vertical rail on the right, including the active state.
- Each control shows a sequence number, state name, and concise entry strategy.
- Highlight the active control with Xuelang green and a restrained inset marker.
- Keep one screen large enough to inspect while exposing the complete state model at a glance.
- Do not repeat the Hero's four-screen overlapping composition.

This module replaces the existing image presentation inside learning state 01. Learning states 02 through 05 remain unchanged.

## Interaction

- Implement the state controls with tab semantics: one `tablist`, four `tab` buttons, and one visible `tabpanel`.
- Support pointer selection, keyboard focus, and left/right or up/down arrow navigation.
- Keep the active tab and panel linked with `aria-controls` and `aria-labelledby`.
- Animate a state change with a restrained opacity and vertical-position transition of approximately `220ms`.
- Respect `prefers-reduced-motion` by removing the positional transition.
- Preserve stable stage dimensions so switching screens causes no page reflow.

## Asset Mapping

Preserve source evidence and generate public WebP derivatives through the existing Xuelang asset pipeline.

| State | Source | Public asset |
| --- | --- | --- |
| Discover | `当我还没有买课时.png` | `public/images/xuelang/course-entry-discover.webp` |
| Start | `当买了一个新课还没看时.png` | `public/images/xuelang/course-entry-start.webp` |
| Continue | Existing `evidence/xuelang/source/hero-learn.png` | Existing `public/images/xuelang/hero-learn.webp` |
| Join live | `当我的老师有直播来了.png` | `public/images/xuelang/course-entry-live.webp` |

Do not duplicate the supplied recent-learning screen because the approved Hero source is the same state at a higher resolution. Preserve the other three supplied PNGs under `evidence/xuelang/source` with semantic filenames and register them in `evidence/xuelang/manifest.json`.

## Responsive Behavior

Desktop remains the priority.

- At wide widths, use the main-stage and four-item side rail layout.
- At narrower widths, place the four controls in a horizontally scrollable row above one stable main screen.
- Do not shrink all four screenshots into unreadable mobile columns.
- Prevent horizontal page overflow and preserve touch targets of at least 44px.

## Print And PDF

Printing cannot depend on interaction. Render all four states as a static two-by-two evidence grid with state labels and short strategy descriptions. Hide interactive-only affordances while retaining all screenshots and bilingual text.

## Content

Update the Chinese and English Course Entry copy to explain adaptive entry behavior. Keep the larger Continuous Learning sequence and the wording of steps 02 through 05 unchanged.

## Testing And Verification

- Component tests assert four tabs, the Continue default, state switching, keyboard navigation, and correct image paths.
- Asset tests assert the three new source records and generated derivatives while confirming reuse of `hero-learn.webp`.
- Print tests or print DOM assertions confirm that all four states remain available without interaction.
- Browser verification covers `1440px` and `1728px` desktop widths plus a representative `390px` mobile viewport.
- Visual review checks image clarity, stable layout, state-label legibility, transition comfort, and absence of overlap or overflow.
- Run lint, the complete Vitest suite, and the framework production build before committing the implementation.

## Out Of Scope

- Changes to learning states 02 through 05.
- Changes to the Hero composition or Hero assets.
- Changes to the before-and-after wipe comparison.
- New validation claims or business metrics.
