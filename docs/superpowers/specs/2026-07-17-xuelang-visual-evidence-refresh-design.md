# Xuelang Visual Evidence Refresh Design

**Date:** 2026-07-17  
**Status:** Approved visual direction  
**Branch:** `codex/xuelang-case-polish`

## Objective

Improve the Xuelang case study's opening atmosphere and learning-evidence quality without rebuilding the chapter architecture. Desktop web remains the primary canvas. The update removes an unnecessary download action, replaces provisional note imagery with the supplied product screens, and separates the interaction board's explanation from its bitmap so the evidence stays readable, localizable, responsive, and printable.

## Approved Direction

Extend the current evidence system locally instead of rebuilding the learning chapter. Keep the existing Hero, chapter navigation, learning sequence, and evidence-story rhythm. Add one dedicated interaction-board presentation because its image-plus-annotation relationship does not fit the generic figure component cleanly.

The approved visual choices are:

- Background fusion option B: a restrained 20% visual presence.
- Interaction layout option B: a right-side editorial evidence rail rendered as HTML over the product board.
- Professionally rewrite the source-board wording while preserving its design conclusions and supplied behavioral data.

## Opening Background

Use `bg.png` as the shared atmospheric image for the Hero and project-overview region.

- Preserve one continuous visual field across the first two desktop screens rather than repeating the image in visible tiles.
- Blend the grayscale landscape into `#f5f7f5` with a `0.20` image opacity, matching the approved option B preview.
- Keep all body text, metadata, navigation, and the dark product panorama above the background layer.
- Do not introduce a colored gradient. The landscape and paper color provide the complete background treatment.
- The dark panorama must remain the strongest visual object in the opening.
- Later chapters return to the existing solid paper surface so the background does not compete with evidence.
- At narrow widths, retain a quieter crop and prioritize text contrast over preserving the complete landscape.
- In print, reduce or remove the decorative image when required for economical, legible output.

Store the supplied PNG as an approved source asset and generate a WebP derivative through the existing Xuelang asset pipeline.

## PDF Action Removal

Remove the Xuelang PDF download action from the Chinese and English Hero.

- Remove the link, download icon, localized label, file-size copy, and unused PDF URL construction.
- Remove styles and responsive rules used only by that action.
- Keep browser print styles working because printable output remains a delivery requirement even though no explicit download entry is shown.
- Do not remove PDF or resume behavior from other cases.

## Note Evidence Replacement

Replace the three images in the “Build personal value” / “形成个人资产” evidence story with the supplied screenshots. Preserve each original PNG and generate semantic WebP derivatives.

| Narrative step | Supplied source | Semantic asset | Presentation |
| --- | --- | --- | --- |
| Capture | `记笔记1.png` | `learning-note-player` | Supporting screen showing the note entry in the player control area |
| Edit in context | `记笔记3.png` | `learning-note-editor` | Primary screen showing timestamped note creation without leaving the video |
| Accumulate | `记笔记2.png` | `learning-note-list` | Supporting screen showing notes organized by course |

The page, not the bitmap, supplies phone corner radius, framing, spacing, and shadow. Do not bake a device frame into the derivatives. Keep the chronological capture → edit → accumulate relationship clear even though the editor remains the visually dominant screen.

Update intrinsic dimensions, source records, alt text, labels, and asset tests in both locales. Do not rewrite the surrounding learning-asset argument beyond adjustments needed to match the new screenshots.

## Interaction Evidence Board

Replace the existing Interaction figure with `20220758.png`. Treat it as the product-canvas layer only. Use `20220739.png` as a private reference for structure, wording, and data; do not publish it as the visible board.

Create a dedicated interaction-board component with two explicit layers:

1. A large product image that remains inspectable.
2. A right-side editorial evidence rail rendered as localized HTML.

The rail presents three concise evidence groups:

1. **Immersion and smooth control**: dark-mode atmosphere and brightness or playback controls support a continuous viewing state.
2. **Efficient fragmented learning**: expose the supplied penetration data as supporting evidence, including `52.62%` progress-bar penetration, `42.21%` fullscreen penetration, and `7.49%` speed-control penetration.
3. **Faster lesson switching**: foreground high-frequency lesson navigation and make the learner's next target easier to locate. Preserve the supplied contextual figures of roughly five lessons per day and `36.5 min` learned per day as supporting context, not causal proof.

Chinese copy is professionally rewritten rather than transcribed word for word. English copy communicates the same conclusions and clearly labels the figures as observed behavior. Do not claim that the redesign caused those behaviors unless the source evidence demonstrates causality.

### Responsive Behavior

- Wide desktop: keep the evidence rail on the right side of the board with enough width for two-to-three-line annotations.
- Medium layouts: preserve the board's aspect ratio and reduce annotation density before reducing product-image readability.
- Narrow layouts: move the evidence groups below the image instead of squeezing or overlapping them.
- Print: render the image and all evidence groups statically with no hidden interaction.
- Keep labels, image content, and adjacent learning states free of overlap and horizontal overflow.

## Component Boundaries

- Reuse `XuelangEvidenceStory` for the three note screens.
- Add a focused `XuelangInteractionBoard` component for the interaction canvas and editorial evidence rail.
- Keep localized interaction content in the Xuelang MDX or a small typed locale map, following the current component boundary.
- Register all new or replaced files in `evidence/xuelang/manifest.json` and generate public derivatives through `scripts/prepare-xuelang-assets.mjs`.
- Avoid unrelated changes to the Hero panorama, course-entry state module, wipe comparison, results, or global case-study components.

## Motion And Accessibility

- The new evidence rail may use the case's existing restrained reveal motion, but the image and copy must remain understandable without animation.
- Respect `prefers-reduced-motion`.
- Use semantic headings and lists for the code-rendered evidence.
- Provide accurate Chinese and English alternative text for the product board and all note screens.
- Decorative opening background uses empty alternative semantics and must not enter the reading order.

## Testing And Verification

- Asset tests assert the background, three note sources, interaction source, WebP outputs, intrinsic dimensions, and unique manifest records.
- Content or component tests assert that the Xuelang Hero no longer exposes a PDF download action in either locale.
- Component tests verify the interaction board's image, three localized evidence groups, data values, and semantic structure.
- Existing note-story tests are updated to assert the new semantic image mapping.
- Print assertions confirm that the interaction evidence and note screens remain present without interaction.
- `agent-browser` visual verification covers Chinese and English at `1440×1000` and `1728×1100`, plus a representative `390×844` narrow viewport.
- Visual review checks first-two-screen background continuity, text contrast, product-image inspection size, evidence-rail overlap, phone-screen framing, and horizontal overflow.
- Run focused tests, the complete Vitest suite, lint, production build, and `git diff --check` before committing implementation.

## Out Of Scope

- Restoring or generating downloadable Xuelang PDF files.
- Changing other projects' download actions.
- Rebuilding the learning sequence or course-entry interaction.
- Changing the Hero's four product screens.
- Publishing `20220739.png` as a visible asset.
- Adding new outcome claims or treating observed behavior as causal validation.
