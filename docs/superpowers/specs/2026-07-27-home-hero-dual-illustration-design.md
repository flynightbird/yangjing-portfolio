# Home Hero Dual Illustration Design

**Date:** 2026-07-27
**Status:** Approved
**Scope:** Homepage dual-identity Hero portrait pair only

## Goal

Replace the photographic AI-native Builder portrait with the approved second illustration so the Hero presents two illustration styles as one precisely aligned dual identity.

## Approved Mapping

- Product Designer, left field: use source `2.png`, the lighter pencil-and-watercolor illustration.
- AI-native Builder, right field: use source `3.png`, the darker and more graphic illustration.
- Keep explicit role-based assets under `public/images/profile/`.
- This mapping supersedes the portrait choices in `2026-07-25-home-hero-portrait-pair-design.md`; all compatible layout and interaction rules from the earlier Hero specifications remain in force.

## Composition

The two illustrations must use the same rendered width, horizontal center, and bottom anchor. Their shared pose and crop should register exactly across the draggable divider, making the transition read as a change in visual language rather than a second displaced person.

Preserve the approved portrait geometry:

- desktop width: `min(49.5vw, 42.1875rem)`;
- mobile width: `min(130.5vw, 34.2rem)`;
- bottom anchor: `0`;
- no independent translation, scale, or parallax between the primary layers.

## Visual Treatment And Motion

- Keep the left illustration softer and lighter through its existing designer treatment.
- Let the darker linework and flatter color of `3.png` create the Builder-side contrast; do not add a permanent blur, glow, outline, or opacity offset.
- Keep the existing single Builder echo animation and change its source to the same `3.png` Builder asset.
- Keep the primary portraits sharp. Reduced-motion behavior remains unchanged.

## Behavior And Accessibility

- Preserve the existing split range, pointer and keyboard controls, magnetic stops, reset behavior, code canvas, material blueprint, role copy, and Hero height.
- Keep the Designer image as the single accessible portrait image using the existing portrait label.
- Keep the Builder image and Builder echo decorative with empty alt text.
- Keep above-the-fold priority loading.

## Verification

- A component test first establishes that the Designer uses its existing `2.png` role asset while both Builder images use the new `3.png` role asset.
- Existing Hero interaction and geometry tests continue to pass.
- Desktop and mobile browser checks confirm both illustrations load, share identical bounds, meet the Hero baseline, and do not introduce overflow or text overlap.
- Divider checks at left, center, and right positions confirm the eyes, face contour, shoulders, and lower edge stay registered.

## Non-Goals

- Changing the Hero layout, copy, divider interaction, or surrounding artwork.
- Adding physical parallax between the two primary portraits.
- Retouching or regenerating the supplied illustrations.
- Changing the Meeting homepage entry or other project cards.
