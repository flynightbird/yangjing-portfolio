# Footer Contact Control Sizing Design

**Date:** 2026-07-27
**Status:** Approved
**Scope:** Shared Site Footer contact action buttons

## Goal

Correct the distorted Copy control and the undersized, vertically misaligned email Arrow control while preserving the existing liquid Footer and contact capsule design.

## Approved Geometry

- Set both Copy and Arrow controls to a stable `40px × 40px` circle.
- Keep both controls on the same vertical center within the contact capsule.
- Render the Copy and Check icons at `18px × 18px`.
- Render the Arrow icon at `19px × 19px` so its diagonal stroke has comparable visual weight.
- Prevent SVG shrinking or non-uniform scaling with explicit square dimensions and `flex: none`.
- Use a zero line box and explicit centering on the controls so inline SVG baseline behavior cannot move either icon.

## Component Behavior

- Preserve the existing Copy-to-Check state transition, clipboard behavior, localized accessible labels, live feedback, mail link, focus ring, and liquid hover fill.
- Keep Copy and Arrow as separate circular actions.
- Do not add visible labels or change the contact values.

## Responsive Behavior

- Use the same 40px control size on desktop and mobile.
- Keep the existing single-column mobile contact layout.
- The larger controls must remain inside each capsule without clipping, overlap, or horizontal page overflow.

## Verification

- A component test asserts the existing semantic controls and icon states remain intact.
- A browser geometry test confirms both buttons are 40px squares, their circles share equal bounds, both SVGs are square, and their vertical centers match the email capsule center within one pixel.
- Desktop and mobile screenshots confirm the Copy icon is not distorted and the Arrow circle has balanced visual weight.

## Non-Goals

- Redesigning the Footer, contact capsules, or liquid background.
- Changing contact content, clipboard timing, or animation character.
- Modifying unrelated page controls.
