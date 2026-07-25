# Home Hero Portrait Pair Design

**Date:** 2026-07-25
**Status:** Approved
**Scope:** Homepage dual-identity Hero only

## Goal

Replace the current shared placeholder portrait with two approved portraits that reinforce the Hero's existing dual-identity interaction. Preserve the current layout, split reveal, copy, background art, and motion.

## Approved Portrait Mapping

- Product Designer, left designer field: use source `2.png`, the hand-drawn portrait.
- AI-native Builder, right builder field: use source `1.png`, the photographic portrait.
- Store both as explicit profile assets under `public/images/profile/` with role-based filenames.
- Do not use `3.png` in the approved implementation.

The two images must share the same rendered dimensions, horizontal center, and vertical anchor. Dragging the divider must reveal a stable face position rather than making the subject jump between layers.

## Visual Treatment

The designer portrait retains the existing restrained color treatment:

```css
filter: saturate(0.95) contrast(1.07) brightness(0.93);
```

The builder portrait uses partial desaturation rather than the current full grayscale treatment:

```css
filter: grayscale(0.28) saturate(0.82) contrast(1.08) brightness(0.9);
```

This preserves visible skin tone and natural hair color while keeping the photograph integrated with the dark technical field. No additional glow, outline, mask, or decorative portrait frame is added.

## Component Behavior

- Keep the existing draggable split range, magnetic stops, keyboard controls, reset behavior, code canvas, material blueprint, role copy, and metadata.
- Render the designer portrait in the designer field and the builder portrait in the builder field.
- Keep the builder-field image decorative because the designer-field image already supplies the portrait's accessible label.
- Keep image loading eager and high priority because both portraits are above the fold.

## Responsive Behavior

- Preserve the current desktop and mobile portrait width rules.
- Keep both portraits on the same center line at every breakpoint.
- Maintain the current mobile vertical anchor unless visual verification shows that the new source crop clips the head or shoulders; if adjustment is required, apply the same positional rule to both layers.
- The Hero must retain its current viewport fit and must not introduce horizontal overflow.

## Verification

- Component test asserts that the designer and builder layers reference different approved role-based assets.
- Component test preserves the current accessible portrait label and confirms the decorative duplicate remains hidden from assistive technology.
- Existing Hero interaction tests continue to pass.
- Desktop and mobile browser checks confirm that both images load, faces align through the divider, skin tone remains visible on the builder side, and no text overlaps the portraits incoherently.

## Non-Goals

- Redesigning the Hero layout or copy.
- Changing the identity interaction or animation model.
- Retouching or regenerating the supplied portraits.
- Using the `2.png + 3.png` alternative.
