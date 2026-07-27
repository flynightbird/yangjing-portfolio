# Open Language Lightbox Gallery Design

## Goal

Update the homepage Visual Archive entry for Open Language so its lightbox presents the three supplied portfolio screenshots in the approved order.

## Scope

- Keep the existing Open Language homepage card cover unchanged.
- Add the supplied screenshots to the existing archive detail-media directory structure.
- Present the lightbox gallery in this order:
  1. `开言设计原则.png`
  2. `86.png`
  3. `87.png`
- Preserve the shared lightbox behavior: paginated navigation on desktop and a vertical image stack on mobile.
- Do not change the card copy, archive order, lightbox component, or any other project gallery.

## Content Contract

Each image remains a PNG at its source dimensions and receives localized alternative text. The Open Language archive entry gains an explicit three-item `gallery`; its existing `image` remains the homepage cover and fallback media.

## Verification

- Add a unit assertion for the exact Open Language gallery paths and order.
- Confirm the focused content and homepage component tests pass.
- Open the homepage in a real browser at desktop and mobile widths and verify the Open Language lightbox shows all three supplied screenshots in order without clipping or overlap.
