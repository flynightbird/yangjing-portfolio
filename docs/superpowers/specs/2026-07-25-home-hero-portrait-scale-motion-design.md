# Home Hero Portrait Scale And Motion Design

**Date:** 2026-07-25
**Status:** Approved
**Scope:** Homepage dual-identity Hero portrait sizing, anchoring, and Builder motion echo

## Goal

Refine the approved portrait pair so the subjects feel less dominant, meet the Hero baseline without a gap, and give the AI-native Builder side a restrained interaction-linked sense of motion.

## Portrait Scale And Anchoring

- Render both designer and builder portraits at 90% of their current width.
- Preserve identical dimensions and positioning for the two portrait layers so the face remains aligned across the draggable divider.
- Replace top-based portrait positioning with `bottom: 0` anchoring.
- Keep the source images unchanged. Both approved PNGs already have visible pixels at their bottom edge, so bottom anchoring makes the subject meet the Hero's bottom divider without image preprocessing.
- Desktop target width: `min(49.5vw, 42.1875rem)`, which is 90% of `min(55vw, 46.875rem)`.
- Mobile target width: `min(130.5vw, 34.2rem)`, which is 90% of `min(145vw, 38rem)`.

## Builder Motion Echo

Add one decorative duplicate of the builder portrait behind the sharp primary image. The duplicate uses the same source, size, bottom anchor, and horizontal center as the primary image.

The echo is normally invisible. When the existing Builder scan trigger runs, animate it once with these targets:

- duration: approximately `720ms`;
- peak opacity: `0.16`;
- blur: `12px`;
- maximum horizontal offset: approximately `12px` toward the Builder field;
- easing: the Hero's existing restrained ease-out family;
- final state: opacity returns to `0` and the echo returns close to the primary position.

The sharp builder portrait is never blurred. Do not add a persistent glow, continuous loop, vertical displacement, or echo to the designer portrait.

## Trigger And Accessibility Behavior

Reuse the existing `triggerScan` path so the echo appears during the same intentional moments as the Builder code scan:

- the initial Hero scan;
- first pointer entry into the Builder side;
- divider drag release;
- keyboard divider adjustment.

Repeated triggers restart the short echo animation rather than queueing animations. The echo image is decorative, has an empty alt attribute, and remains inside the builder layer that is already hidden from assistive technology.

When `prefers-reduced-motion: reduce` is active, do not run the echo animation and keep the decorative echo hidden.

## Implementation Boundary

- Keep the existing portrait sources, light desaturation, role copy, split mechanics, code canvas, material blueprint, and Hero height.
- Add only the minimal image/ref and animation logic needed for the echo.
- Do not introduce a motion library or new dependency; use the browser Web Animations API already available in the client component.
- If `Element.animate` is unavailable, leave the echo hidden and continue the existing scan behavior without error.

## Verification

- Component tests assert that a single decorative Builder echo exists and uses the builder portrait asset.
- Interaction tests confirm the existing scan triggers remain functional.
- Reduced-motion browser checks confirm the echo stays hidden.
- Desktop and mobile visual checks confirm the two primary portraits share identical bounds, use the approved 90% width, meet the Hero bottom edge, and introduce no horizontal overflow.
- A normal-motion browser check confirms the echo becomes briefly visible during a scan and returns to opacity `0` while the primary portrait remains sharp.

## Non-Goals

- Retouching, trimming, or recompressing either source image.
- Adding persistent atmospheric blur.
- Changing the portrait color treatment.
- Redesigning the Hero copy, layout, or divider interaction.
