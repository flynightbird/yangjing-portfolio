# STT Responsive Fill And Layered Footer Reveal Design

**Date:** 2026-07-18

**Repository:** `flynightbird/yangjing-portfolio`

**Branch:** `codex/portfolio-nextjs`

**Status:** Approved for implementation planning

## Objective

Refine two homepage moments without changing project content or navigation:

1. Make the live STT Demo stage completely fill its virtual browser interior while preserving the full animated composition.
2. Turn the final black-to-purple boundary into a layered reveal: the black homepage surface slides away above a purple Footer underlay, with a restrained reverse parallax response.

The motion must remain continuous, cinematic, and user-controlled. Neither change may intercept scrolling, introduce horizontal overflow, or reduce the reliability of the existing STT fallback.

## Scope

This iteration may modify:

- The STT stage embed adapter and homepage STT media viewport
- Focused STT embed and homepage media tests
- The homepage's outermost surface treatment near the Footer
- Footer positioning and homepage-only reveal styles
- Focused Footer and homepage end-state tests

This iteration must not modify:

- STT Demo product content, copy, animation sequence, Dock controls, participant data, or full-page prototype
- STT source provenance and pinned-publication validation contracts
- STT external link behavior or its non-interactive homepage iframe rule
- Visual Archive internals, project data, project order, or homepage modules above the final boundary
- Footer copy, email address, liquid-field implementation, or centered `© 2026 Yang Jing` metadata
- Footer behavior on case-study, Build Lab, About, or other non-homepage routes beyond preserving the current layout

## STT Responsive Stage

### Current Problem

The homepage browser interior uses a `2 / 1` viewport while the stage embed is built around a fixed `1000 × 560` composition. The embed currently calculates a contain-style scale with an additional gutter. The mismatch leaves visible black space and makes the product stage appear inset rather than integrated with the virtual browser.

### Approved Composition

Use the approved responsive-fill approach:

- The embed stage occupies the complete browser content viewport.
- The top status bar spans the full available width.
- The participant panel remains visible at the right edge.
- The main conversation stage absorbs additional horizontal space.
- The speaker block, bilingual transcript, participant rows, and bottom Dock remain inside safe bounds.
- Text, avatars, icons, and Dock controls retain their intended proportions; they must not be stretched.
- No content is removed or cropped to obtain the fill.

The adapter should replace fixed-canvas contain scaling with responsive layout dimensions. The embed-only CSS may widen the stage grid and let the central stage column flex, but it must not alter the standalone Demo page.

### Runtime Contract

Preserve the existing runtime behavior:

- The iframe source remains `/demos/stt-demo/index.html?embed=stage`.
- The iframe remains decorative and non-interactive with `aria-hidden`, `tabIndex={-1}`, and pointer events disabled.
- The complete Demo continues to open in a new tab from the media and CTA links.
- Proximity-based lazy mounting remains in place.
- The pinned fallback image remains visible until the iframe reports `stt-stage-ready` from the same origin and source window.
- The existing scan transition runs once when the live stage replaces the fallback.
- Intersection-based playback pause/resume messaging remains unchanged.
- Reduced-motion mode continues to use the stable fallback image rather than loading the animated stage.
- Mouse drift remains attached to the complete virtual browser window, not the iframe's internal elements.

### Responsive Behavior

On desktop, the live stage fills the complete browser interior at every supported card width. It may redistribute empty stage space but may not crop the Dock or participant panel.

On compact/mobile layouts, preserve the existing static fallback strategy. Do not add a live iframe solely to demonstrate the responsive fill on small screens. The fallback must cover its viewport cleanly without page-level horizontal overflow.

## Layered Footer Reveal

### Visual Hierarchy

Apply the reveal only on the localized homepage:

- The purple Footer is a lower visual layer.
- The complete black homepage surface above it is the upper layer.
- The upper layer receives `32px` bottom-left and bottom-right radii.
- The rounded edge becomes visible only as the black layer moves upward and exposes the Footer.
- The existing purple liquid field continues moving beneath the page surface.
- The black and purple areas must not read as two ordinary adjacent document bands.

Non-homepage routes retain the current Footer flow and must not inherit the rounded upper-sheet or sticky-underlay treatment.

### Scroll Behavior

Use natural document scrolling as the primary driver. Do not add scroll snap, wheel listeners, artificial scroll progress, or a pinned full-screen transition.

The approved B motion adds restrained reverse parallax to the Footer underlay:

- Desktop Footer content/field begins `8%` lower and settles to its natural position as it is revealed.
- Mobile uses `4%` travel.
- The black upper layer moves only because the document scrolls; it does not receive a second competing transform.
- Parallax interpolation must be smooth and bounded to the final reveal interval.
- The Footer remains fully reachable and continues in normal flow after the reveal.

The transition should feel like the upper page of a presentation sliding away, while retaining the precision and control of ordinary webpage scrolling.

### Reduced Motion And Fallback

For `prefers-reduced-motion: reduce`:

- Disable Footer parallax.
- Preserve the `32px` rounded black boundary and layered color relationship.
- Keep normal scrolling and the Footer's complete content accessible.
- The liquid field follows its existing reduced-motion behavior.

If the required browser APIs are unavailable, render the same static rounded layered boundary without introducing script errors or hiding Footer content.

## Component Boundaries

- `BuildLabMedia` continues to own iframe lifecycle, readiness, fallback switching, playback messages, and browser-window drift.
- The STT embed adapter owns embed-only responsive stage geometry. It must not leak styling into the standalone Demo.
- The homepage root owns the black upper-surface marker and end spacing needed for the reveal.
- `SiteFooter` continues to own Footer content and the liquid field.
- Homepage-only shell styling owns sticky/underlay positioning and reverse parallax activation. The homepage marker is the sole route gate; other routes do not receive the treatment.

Use a small focused client controller inside the Footer to calculate reveal progress only when the homepage marker exists. It reads the Footer bounds through one request-animation-frame-throttled scroll listener and writes a bounded `0..1` CSS custom property. CSS uses that property to interpolate the underlay from `8%` to `0%` on desktop and `4%` to `0%` on mobile. The controller must never prevent default scrolling, attach wheel handlers, or set React state during scroll.

## Accessibility And Interaction Safety

- `/zh/` and `/en/` remain equivalent.
- Links and buttons retain their current semantics, keyboard behavior, and focus treatment.
- The STT iframe remains unreachable by keyboard and cannot intercept pointer input.
- The Footer email and navigation remain interactive throughout the reveal.
- Decorative motion stays hidden from assistive technology.
- Desktop and 390px mobile layouts have no page-level horizontal overflow.
- Sticky or transformed layers must not cover unrelated content or trap focus.

## Verification

Automated checks must cover:

- Existing `BuildLabMedia` lazy loading, same-origin readiness, fallback, pause/resume, and reduced-motion contracts
- The live embed retaining the top status bar, participant panel, speaker content, bilingual transcript, and Dock
- Desktop STT stage bounds filling the browser interior without visible outer gutters
- No crop of the Dock or participant panel at supported desktop widths
- Static fallback behavior on mobile and reduced motion
- Homepage-only `32px` upper-surface radius and layered Footer behavior
- Non-homepage routes retaining normal Footer layout
- Desktop reverse parallax bounded to `8%` and mobile to `4%`
- No scroll snap, wheel interception, focus obstruction, or page-level horizontal overflow
- `/zh/` and `/en/` desktop and 390px mobile rendering
- ESLint, component/unit tests, focused E2E tests, and the Next.js framework build

Browser verification must capture:

- The STT browser at desktop width with all four edges filled
- The STT Dock and participant panel simultaneously visible
- The black homepage surface before, during, and after the Footer reveal
- The `32px` curved black edge against the moving purple underlay
- The final Footer state with email and centered copyright unobstructed
- The reduced-motion static boundary

The implementation is acceptable only when the STT stage reads as one complete product window and the Footer reads as a lower layer being revealed, without abrupt gaps, black gutters, hard purple boundaries, clipping, or loss of scroll control.
