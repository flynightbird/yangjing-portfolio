# Meeting Popup Editorial Board Design

**Date:** July 27, 2026

**Scope:** Replace the current Meeting popup-expression block with a warmer editorial evidence board that relies on structure, typography, borders, and whitespace instead of gradient atmosphere.

## Intent

This block should stop reading like a decorative hero poster and start reading like a magazine-style product evidence page inside the case study.

The user explicitly wants:

- no purple gradient;
- a full re-think of layout and typography;
- a cleaner editorial composition;
- optional background layout lines or grid lines.

## Design direction

The new direction is **editorial proof board**.

It should feel like a carefully art-directed case-study spread:

- warm neutral paper surface placed inside the dark Meeting page;
- one dominant popup screenshot as the main proof;
- three smaller supporting popups arranged around it asymmetrically;
- visible grid or layout lines used as quiet structure, not decoration;
- no floating glass, no neon, no dramatic poster glow, no heavy shadows.

## Visual atmosphere

- **Density:** airy to medium
- **Variance:** asymmetric but controlled
- **Motion:** restrained

The block should feel more like a design annual or internal review board than a marketing panel.

## Layout

Use a **1 main + 3 supporting** composition.

- The main popup becomes the visual anchor.
- The three supporting popups work as secondary evidence rather than equal tiles.
- The composition should be asymmetric, but still visibly snapped to an internal editorial grid.
- No overlapping chaos. Cards may offset slightly, but every item must still feel deliberately placed.

Recommended spatial reading order:

1. small section label / board label
2. main popup
3. top-right supporting popup
4. lower-right supporting popup
5. lower-left supporting popup

## Surface and background

- Outer board surface: warm off-white or bone
- Inner popup cards: white
- Structural borders: thin light-gray lines
- Optional background treatment: faint grid lines or layout guide lines

The grid lines should suggest alignment and composition, not mimic engineering wireframes.

## Color rules

- Remove purple entirely from this module.
- Use warm neutral tones only.
- Accent, if any, should be minimal and washed out.

Suggested palette:

- board canvas: `#F7F6F3`
- board secondary paper: `#FBFBFA`
- popup cards: `#FFFFFF`
- primary ink: `#111111`
- secondary text: `#787774`
- structure lines: `#EAEAEA`

## Typography

Typography should carry the sophistication of the block more than effects do.

- Sans body/UI: Geist or equivalent project-safe neutral sans
- Mono/meta: Geist Mono or equivalent for labels
- Tight, small uppercase label for the board caption
- No oversized decorative copy inside the board itself

The board can include a minimal label if needed, but should remain predominantly visual.

## Component rules

- Card radius: crisp and small (`8px`–`12px`)
- Borders: `1px solid #EAEAEA`
- Shadows: nearly absent; if used, extremely diffuse and low-opacity
- Hover: subtle lift only, no dimming cascade on sibling cards
- Reduced motion: keep composition static

## What must be removed from the current version

- purple glow treatment
- ghost popup outlines
- large atmospheric gradient fill
- old “floating poster” hierarchy
- strong card dimming on hover

## Implementation notes

- Keep the existing 4 popup assets.
- Re-map which popup becomes the main card based on visual strength during implementation.
- Update markup so the hierarchy is explicit in data attributes for regression tests.
- Add one source-level test that protects the new editorial surface contract.
