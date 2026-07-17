# Xuelang Full-width Opening Background

## Goal

Extend the existing Xuelang opening artwork across the full page width instead of limiting it to the right-hand case-study column. The artwork continues to support the first one to two screens while the chapter navigation and main case content retain their current layout.

## Design

- Move the decorative background pseudo-element from the constrained `.case` article to the full-width `.root` wrapper used only by the Xuelang case study.
- Keep the background centered, cover-cropped, non-interactive, and rendered at `0.2` opacity.
- Keep the existing `max(100rem, 180vh)` vertical coverage so the change affects horizontal scope only.
- Preserve the centered `.frame`, chapter rail, content columns, spacing, and readable line lengths.
- Keep later content sections opaque so the opening artwork does not reduce long-form reading clarity.
- Move `data-xuelang-opening` to the full-width wrapper so the existing print rule continues to remove the decorative background.

## Responsive Behavior

The background spans the viewport-width Xuelang wrapper at desktop, tablet, and mobile widths. Its centered `cover` crop may change with the viewport, but the content grid and breakpoints do not change.

## Verification

- Confirm the background reaches both viewport edges at desktop width and sits behind the chapter rail.
- Confirm there is no horizontal overflow at desktop and mobile widths.
- Confirm later reading sections remain opaque.
- Confirm the background is absent from print output.
- Run the focused Xuelang layout tests, lint, and the production build.

