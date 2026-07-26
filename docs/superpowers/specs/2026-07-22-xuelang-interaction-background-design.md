# Xuelang Interaction Background Polish

## Goal

Make the interaction media board visually consistent with the light-green media treatment shown elsewhere in the Xuelang case study.

## Scope

- Replace only the continuous baked-in gray background in `public/images/xuelang/learning-interaction.webp` with `#E3ECE7`.
- Preserve the phone screenshots, white evidence rail, text, spacing, crop, dimensions, and image quality.
- Keep the existing 20px media radius.
- Remove the interaction canvas outer border and box shadow.
- Apply the same borderless treatment at desktop and mobile breakpoints.

## Implementation

Create a lossless or high-quality replacement asset by masking pixels connected to the image edges whose colors belong to the gray background range. Feather the mask slightly at foreground edges to avoid halos. Keep the source dimensions at 3840 x 1876 and verify that foreground pixels remain visually unchanged.

Update `xuelang-interaction-board.module.css` so `.canvas` has no border and no box shadow. Do not modify the inner evidence rail styling.

## Verification

- Compare the updated board at desktop width against the supplied screenshots.
- Confirm the background reads as `#E3ECE7` and no gray fringe remains around the foreground.
- Confirm the canvas has no computed border or box shadow.
- Confirm the 20px radius and responsive layout remain intact.
- Run the relevant component/unit tests and the full test suite before committing implementation.
