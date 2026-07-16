# Visual Archive Carousel Design

Status: Approved for implementation

Date: 2026-07-15

## Purpose

Replace the homepage Visual Archive image wall with a compact horizontal
showcase inspired by the browsing mechanics of Johnyvino. Preserve the
Interface X-Ray brand system and the existing evidence boundary.

The carousel is a secondary portfolio layer. It must add visual range without
competing with the five core project bands or delaying the About section.

## Structure

- A compact heading block contains the title, short description, item count,
  current position, previous and next controls, and a progress rail.
- A full-width horizontal viewport contains eight cards.
- The first card is a wide landscape stage. Narrow and wide cards alternate so
  the following project remains visible at the viewport edge.
- Each real entry keeps its existing Lightbox and optional external action.
- Draft entries show local UI screenshots as composition placeholders. They
  remain labeled Draft, use empty image alt text, and retain
  `data-publication-state="draft"` so the publication gate rejects them.

## Interaction

- Previous and next buttons move to the adjacent card and disable at the ends.
- Pointer, trackpad, touch, and keyboard scrolling use native horizontal
  overflow with CSS scroll snap.
- The current index and progress rail update after scrolling settles.
- Controls have localized accessible names and visible focus states.
- Reduced motion changes smooth scrolling to immediate scrolling and removes
  media transforms.

## Responsive Behavior

- Desktop shows one dominant card plus a substantial preview of the next card.
- Tablet shows roughly one and a half cards.
- Mobile shows approximately 1.12 cards so the next item remains discoverable.
- The section target height is one viewport or less on desktop and mobile.
- Essential metadata remains visible without hover.

## Visual Direction

- Keep the existing cool-white surface, carbon borders, Archivo Black display
  type, Libre Franklin body type, and DM Mono technical labels.
- Keep radii at or below 6px.
- Use no gradients, glass effects, decorative shadows, or copied Johnyvino
  branding.
- Placeholder media uses existing local product screenshots only as clearly
  labeled composition studies. It is not publishable evidence.

## Verification

- Component tests cover eight cards, localized controls, Draft labels, and
  placeholder media semantics.
- Browser tests cover button movement, disabled end states, scroll-snap layout,
  section height, mobile next-card visibility, no page-level horizontal
  overflow, and reduced motion.
- Final verification includes lint, focused tests, production framework build,
  and desktop/mobile screenshots.
