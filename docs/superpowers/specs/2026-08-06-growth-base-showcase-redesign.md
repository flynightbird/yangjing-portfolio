# Growth Base Showcase Redesign

## Status

Approved design direction, pending written-spec review.

## Problem

The current desktop comparison gives the embedded prototype an iframe viewport of roughly `292 x 648px`. The Growth Base prototype is designed around a mobile canvas close to `390 x 844px`. Because the iframe receives the smaller viewport directly, the application triggers compact layout rules and compresses its text, overlays, navigation, and task content into the same visible area.

The surrounding case-study treatment also competes with the product: dark gradients, decorative paper rotation, heavy shadows, a chapter rail, and four-column analysis make the page feel denser than the intended portfolio showcase.

## Confirmed Direction

Use direction C with the C1 film layout:

- The interactive After state is the primary visual.
- The Before state is smaller and quieter, serving as comparison evidence.
- The page uses a warm gray-brown editorial canvas inspired by the supplied reference.
- Five generated films use a `3 + 2` editorial grid on desktop.
- Mobile preserves the existing interactive application experience and removes portfolio framing.

## Visual System

### Page Structure

1. A compact project introduction states the title, proposition, role, and prototype status.
2. The comparison stage places a smaller Before image to the left and a larger interactive After prototype to the right.
3. One concise design note replaces the four-column CPDI block.
4. The five generated films appear in a three-card first row and centered two-card second row.
5. A short disclosure retains the personal-concept and AI-assistance boundary.

The Growth Base detail page does not use the case-study chapter rail. Global portfolio navigation remains available.

### Color And Material

- Use a restrained warm gray-brown base rather than black, purple glow, or a multicolor gradient.
- Let the prototype's warm photography and yellow accents provide the dominant color.
- Remove the rotated paper layer and heavy device shadows.
- Use thin neutral borders and small labels outside the product viewport.

### Hierarchy

- After is larger, higher contrast, and visually foregrounded.
- Before is smaller and lower contrast but remains legible.
- Labels identify the comparison without overlapping either screen.
- Explanatory copy is secondary to the product visuals.

## Embedded Prototype Architecture

### Desktop

The iframe must always receive an internal layout viewport of `390 x 844px`. A wrapper controls its visible desktop size by applying a uniform scale. The browser therefore lays out the application at its intended mobile dimensions while the portfolio can still fit the complete device within a `1440 x 900` screen.

The wrapper clips the scaled iframe and preserves pointer interaction. The visible frame and the iframe use the same aspect ratio so clicks map correctly without coordinate compensation.

### Mobile

At portfolio mobile breakpoints:

- Hide Before, comparison labels, and the decorative device shell.
- Remove iframe scaling.
- Give the prototype the actual viewport width and a complete mobile-height canvas.
- Do not expose the desktop comparison treatment inside the embedded application.

### Synchronization

Keep the existing `postMessage` contract. The portfolio listens only when origin, iframe window, source marker, message type, and view value are all trusted. Switching `AI 教练` or `预约私教` in the prototype updates the corresponding Before image after the prototype bridge is published.

## Film Grid

Desktop uses a six-column grid model:

- Films 1-3 each span two columns.
- Film 4 spans columns 2-3.
- Film 5 spans columns 4-5.

This creates a centered `3 + 2` composition without nested cards. Tablet may use two columns. Mobile uses one column. Captions remain attached to the bottom edge of each film, and the Doubao blur mask remains at the top-left without intersecting the caption.

## Content Rules

- Keep the project labeled `个人概念 · 可交互原型`.
- Do not claim launch, retention, conversion, or validated behavior change.
- Replace the four CPDI columns with one concise statement explaining the intended design change.
- Preserve the disclosure separating human design judgment from AI-assisted video generation and prototype development.

## Components

- `GrowthBaseLayout`: switches this project to a full-width, compact editorial header without the chapter rail.
- `GrowthBaseComparison`: owns Before/After hierarchy, fixed-canvas iframe scaling, and trusted synchronization.
- `GrowthBaseVideoGrid`: owns the responsive `3 + 2`, two-column, and one-column film layouts.
- `GrowthBaseCase`: reduces analysis density and preserves the disclosure.

No changes are required to the independent prototype's application layout for this portfolio fix.

## Failure Handling

- If the remote iframe cannot load, retain its warm neutral background and accessible title rather than exposing a blank decorative shell.
- If a synchronization message is invalid, ignore it and retain the current Before state.
- If reduced motion is requested, do not introduce portfolio-level entrance motion around the live prototype.

## Verification

Automated tests must cover:

- Fixed `390 x 844px` iframe canvas metadata on desktop.
- Smaller Before and dominant After structure.
- Trusted message synchronization and rejection of invalid messages.
- Mobile Before removal and shell removal.
- Desktop `3 + 2` film grid structure and five-film count.
- Existing homepage video behavior and bilingual routes.

Browser verification must cover:

- `1440 x 900`: full devices fit the comparison stage, iframe internal viewport is `390 x 844px`, and the page has no horizontal overflow.
- `390 x 844`: Before and shell are absent, the prototype is not scaled down, and the application content is not compressed.
- Film captions remain at the bottom and watermark masks remain at the top-left.
- The final page has no browser errors or new warnings.

## Publication Order

Publish the Growth Base prototype bridge before publishing the portfolio. The portfolio can render the prototype before that deployment, but live Before synchronization will begin only after the remote prototype emits the approved messages.
