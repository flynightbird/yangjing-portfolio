# Visual Archive Wheel Passthrough Design

## Status

Approved direction, awaiting written-spec review.

## Goal

Make downward mouse-wheel scrolling over the homepage Visual Archive feel identical to scrolling over the rest of the page, while preserving deliberate horizontal carousel navigation.

## Confirmed Root Cause

The Visual Archive is an `overflow-x: auto` scroller. Chromium consumes a vertical wheel event while the pointer is over this element even when the carousel cannot use the vertical delta, so the page does not move natively.

The component compensates by forwarding dominant vertical wheel deltas through `window.scrollBy({ top, behavior: 'auto' })`. Because the document globally uses `scroll-behavior: smooth`, `auto` inherits that smooth behavior. A wheel delta therefore becomes a delayed programmatic animation that continues after the input, creating the feeling that the card has captured the mouse.

Browser verification showed:

- With the forwarding call disabled, a `500px` vertical wheel moved neither the page nor the carousel.
- With the current forwarding call, the page was still moving after `250ms`.
- With document smooth scrolling temporarily disabled around the forwarding call, the page moved exactly `500px` within `50ms` and carousel `scrollLeft` remained unchanged.

## Interaction Design

- Keep the existing dominant-axis check.
- If `abs(deltaY) > abs(deltaX)`, accumulate and forward the vertical delta to the page on the next animation frame.
- Immediately before forwarding, save the document element's inline `scrollBehavior` value and set it to `auto`.
- Perform the page scroll.
- Restore the saved inline value synchronously after the scroll call.
- Do not call `preventDefault`; keep the wheel listener passive.
- If the wheel is horizontal-dominant, do not forward it. The native horizontal carousel remains responsible for the gesture.
- Keep button, keyboard, touch, scroll-snap, and active-index behavior unchanged.

The temporary inline override is local to one forwarded frame. It must not change the global stylesheet or any subsequent anchor/navigation scrolling.

## Component Boundary

Modify only the vertical forwarding effect in `components/home/visual-archive.tsx`. Do not change archive content, card layout, CSS, lightbox behavior, Footer reveal behavior, or global scrolling rules.

## Validation

- At the desktop viewport, place the pointer over a Visual Archive card and issue a `500px` vertical wheel event.
- Within `100ms`, page `scrollY` increases by at least `450px` and no more than `550px`.
- Carousel `scrollLeft` changes by no more than `1px` during that vertical wheel.
- A horizontal-dominant wheel is not forwarded to the page.
- Existing next/previous controls, position output, keyboard focus, mobile stacking, and vertical overflow tests continue to pass.
- The document element's inline `scrollBehavior` value after the wheel matches its value before the wheel.

## Out of Scope

- Removing global smooth scrolling.
- Replacing the carousel with button-only navigation.
- Changing track momentum, card snapping, drag behavior, or touch gestures.
- Redesigning Visual Archive cards or controls.
