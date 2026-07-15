# Xuelang Layout Refresh Design

## Objective

Refresh the Xuelang case-study layout with a stronger desktop-first composition. The page should feel intentionally art-directed at the hero and chapter transitions while preserving the existing evidence, bilingual content, typography, color system, PDF output, and restrained motion language.

## Direction

Use a cinematic editorial composition rather than a uniform stacked document. The hero becomes a two-zone thesis: oversized project naming on the left, project proposition and facts on the right, followed by a wide evidence panorama that is meaningfully visible in the first desktop viewport. Chapter introductions use an asymmetric title-and-reading split so text does not accumulate in one narrow column while the right side remains empty.

## Desktop Layout

- At `1200px` and above, keep the persistent chapter rail and the full editorial grid.
- At `1100px` and below, switch to the compact chapter control and give evidence the full content width. This avoids squeezing a rail and multi-column evidence into a narrow laptop canvas.
- Keep the case canvas capped by the existing `100rem` frame and retain the current global header.
- Reduce section padding from viewport-width-driven spacing to a bounded viewport-height rhythm so wide screens do not create excessive dead space.

## Hero

- Keep the project title as the dominant first signal.
- Arrange the proposition, project facts, and PDF action in a supporting right column on large desktop screens.
- Keep the panorama full-width below the thesis zone and preserve its source aspect ratio.
- Ensure a meaningful portion of the panorama appears in the first viewport at `1280x800`, `1440x900`, and `1728x1100` without reducing title impact.
- Fall back to the current single-column hierarchy below `1200px`, where horizontal room is insufficient for the two-zone thesis.

## Chapter Openings

- For sections that contain both `.section-heading` and `.xuelang-reading`, position the heading in the first six grid columns and the reading block in the remaining four columns on large desktop.
- Keep evidence, maps, and process diagrams full width.
- Retain single-column flow below `1100px` for readability.

## Evidence Composition

- Change the primary evidence pair from `8/4` to `7/5` and align both figures at the top so the secondary image remains inspectable.
- Preserve the deliberate emphasis of the selected purchase experiment while preventing the context image from becoming thumbnail-sized.
- Keep three-step touchpoint evidence in three columns only when the case canvas can support it.

## Learning Sequence

- Remove the blanket `34rem` minimum height from every learning state.
- Let states with images derive height from their evidence; let the text-only fragmented-learning state remain compact.
- Preserve the pinned thesis on large desktop and the reduced-motion static flow.

## Results

- Keep the first three primary metrics as a three-column row.
- Render the fourth multi-value dwell-time metric as a full-width summary row with a two-column value/description layout.
- Prevent long values from colliding with labels or creating an orphaned single cell.

## Motion And Accessibility

- Preserve all current GSAP reveal behavior, reduced-motion handling, focus states, and lightbox interactions.
- Layout must remain readable before JavaScript runs and when reduced motion is enabled.
- No horizontal overflow, accidental overlap, or clipped controls at tested viewports.

## Validation

- Add layout-contract assertions for the new hero zones, compact learning state, and result summary row.
- Run component, visual, interaction, export, and production-build checks.
- Capture before/after screenshots at `1024x768`, `1280x800`, `1440x900`, and `1728x1100` in English and spot-check Chinese wrapping.
- Confirm the generated PDF contract remains unchanged.
