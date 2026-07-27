# Home Meeting Fluorescent-Green Accent Design

Date: 2026-07-27

## Objective

Align the Agora Meeting homepage module with the homepage hero by replacing its coral-red theme accents with the hero fluorescent green, `#c7ff38`.

## Confirmed Scope

Change only these Meeting-module accents:

- The 6px top divider on the Meeting section.
- The three numbered state labels below the media.
- The GSAP scroll animation color that highlights those state labels.

Use the existing homepage hero signal value, `#c7ff38`, for all three placements. Preserve the current opacity animation, timing, typography, spacing, layout, and responsive behavior.

## Exclusions

Do not change:

- The browser window's red, yellow, and green traffic-light controls.
- The Meeting media-column purple background.
- Meeting posters, videos, copy, links, CTA treatment, or interaction behavior.
- The ConvoAI module or any other homepage section.
- Global coral tokens used by other pages or components.

## Implementation Boundary

Keep the color change local to the Meeting homepage component. Reference `#c7ff38` through a Meeting-local CSS custom property so the CSS and GSAP animation share one explicit module accent without changing global design tokens.

## Accessibility And Motion

The accent is supplementary: state meaning remains available through visible text, numbering, and document order. Existing reduced-motion behavior remains unchanged. The green is used on the current dark surfaces where it maintains strong contrast.

## Verification

- Confirm the Meeting top divider and all three state labels use `#c7ff38` on desktop and mobile.
- Confirm the state-label scroll animation resolves to `#c7ff38`.
- Confirm browser traffic-light colors and the purple media background are unchanged.
- Run the focused Meeting/home tests and the relevant static checks.
- Visually inspect the homepage at desktop and mobile widths for unintended color or layout changes.
