# About Hero Blue Background Design

## Goal

Use the supplied blue sky artwork as the full-bleed background of the About page capability orbit without weakening the existing information hierarchy or motion.

## Locked Direction

- Fill the complete rounded capability frame with the supplied square artwork.
- Preserve the current orbit, marker, connecting lines, labels, layout, border radius, and animation.
- Do not add a frame-wide dark overlay.
- Add translucent black fills only to the center YJ hub and the four labeled capability circles.
- Keep the frame clipped to its existing rounded boundary.
- Use the same presentation on `/en/about/` and `/zh/about/`.
- On narrow screens, keep the square artwork covered and centered without page-level overflow.

## Asset

Source: `/Users/admin/Desktop/声网 作品集 整理/作品集配图/about bg.png`

Destination: `public/images/about/about-hero-blue-bg.png`

## Verification

- Component test confirms the capability frame references the About background asset.
- Both locale pages render successfully.
- Desktop and 390px screenshots confirm full coverage, readable node labels, preserved rounded clipping, and no horizontal overflow.

