# Homepage Interaction Polish Design

**Date:** 2026-07-18  
**Repository:** `flynightbird/yangjing-portfolio`  
**Branch:** `codex/portfolio-nextjs`  
**Status:** Approved for implementation planning

## Objective

Strengthen the homepage's visual impact and motion coherence without changing the six-project narrative, project data, case-study content, or the locked Visual Archive card design. The result should combine a reusable interaction system with selected cinematic moments while preserving page control, readability, and responsive stability.

## Scope

This iteration may modify:

- Hero composition and bottom geometry
- Shared homepage CTA component and icon treatment
- Homepage section composition and reveal wrappers
- Xuelang homepage media alignment and height
- Visual Archive heading and outer scroll behavior
- AIDX and Footer ambient fields
- Footer content hierarchy
- Homepage pointer and particle layers
- Homepage dictionaries and focused tests

This iteration must not modify:

- The six-project order, ownership, or project data
- Case-study page content or information architecture
- Visual Archive card internals, cover title positions, card order, hover scale, border, radius, or last-card highlight logic
- Hero divider drag, scan-on-movement, keyboard support, or five-second reset behavior
- About route or its navigation entry

## Page Structure

### Hero

Remove the internal Hero top bar containing `Yang Jing`, `Material Blueprint`, and `Designer / Builder`. The global site navigation remains unchanged.

Use the approved synchronized bottom treatment:

- Reduce the empty space below the portrait.
- Move the Hero lower boundary upward.
- Move the portrait downward so the clothing visually meets the Hero bottom edge.
- Keep the portrait fully inside the Hero; it must never overlap the introduction section.
- Preserve the dual-field split, manual drag, scan trigger, keyboard controls, and five-second return to the default split.

### Core Projects

Keep the established six-project sequence and content. Preserve the current company and project-type metadata system.

For the Xuelang homepage feature:

- Increase the media card height.
- Vertically center the media card against the complete right-side content group.
- Preserve its light background treatment and existing case-study navigation.
- Do not show ambient particles in this light section.

### Visual Archive

Rename the section:

- Chinese: `More C端用户设计作品`
- English: `More Consumer Product Work`

Preserve all locked Archive internals, including the four real projects, 20px cover radius, low-contrast 1px border, approximately 1.035 hover scale, 14px top track clearance, independent title placement, bilingual descriptions and skills, mobile neighboring-card reveal, and the highlighted `04 / 04` final card.

Adjust only the outer interaction behavior needed to ensure vertical wheel and trackpad scrolling continues naturally while the pointer is over the Archive. Horizontal controls and intentional horizontal gestures remain available. No page-level horizontal overflow is allowed.

Remove the homepage `AboutPreview` section below the Archive. The standalone About page and header navigation entry remain.

### Footer

Keep the email as the primary Footer action and align its arrow optically with the email text. Remove the About link and the right-side static copy.

The final metadata row contains only a centered, continuously spaced string:

`© 2026 Yang Jing`

Do not add custom spacing between the copyright symbol and `2026`.

## Shared CTA System

Create or extend a single reusable capsule CTA component. Use the official Remix Icon `arrow-right-up-line` SVG as a local repository asset instead of a text arrow or a full icon-package dependency. The icon uses the current text color and stays optically centered with the label.

The component has three semantic variants:

1. **White filled:** primary case-study actions such as “View case study.”
2. **Signal green filled:** runnable product and external experience actions such as STT and AIDX.
3. **White outline:** secondary actions such as Resume, About, and supporting links.

The white-outline variant uses the approved A2 motion. A broad curved white surface enters laterally. The curve remains visible during entry, then travels completely beyond the far edge so the final state is fully white with black text and icon. No black corners, crescents, or gaps may remain. Keyboard focus must produce the same readable filled state without removing a visible focus ring.

## Pointer Interaction

Add one page-level desktop fine-pointer layer using the approved C3 behavior. The system pointer remains visible and unchanged.

- While the pointer moves through eligible blank dark surfaces, show the `>>_ _ _ooo / /` character trail.
- The trail is not persistent and fades after movement stops.
- After a short stationary delay, generate one group of three to five random symbol lines.
- Lines emerge sequentially from the pointer center with blur, opacity, and small spatial expansion.
- The group then fades out progressively and plays only once per stationary event.
- The layer hides over text, media, buttons, navigation, form controls, Visual Archive, and the Xuelang light section.
- It never captures pointer events or affects scrolling.

Disable the layer for touch/coarse pointers and reduced-motion preferences.

## Ambient Particles And Liquid Fields

Use a low-density continuous particle layer only in eligible dark ambient areas:

- Hero code field
- Dark core-project backgrounds
- AIDX liquid field
- Footer liquid field

Particles reduce opacity near content and controls. They disappear completely in Visual Archive and Xuelang's light section. The layer is decorative, pointer-transparent, bounded to its section, and must not create page overflow.

Refine the AIDX and Footer liquid fields with the same visual family:

- Brighter and softer iris purple based on the existing STT/AIDX palette
- Larger, softer color boundaries without visible hard edges
- Slightly more noticeable movement than the current implementation
- A restrained pale lavender-white current for depth
- No excessive white, high-frequency turbulence, or sharp gradient seams

Reduced-motion mode renders a quiet static field without continuous particles.

## Cross-Section Transitions

Add one-shot viewport-entry transitions without scroll locking or scroll-progress scrubbing.

- Use a broad dark or muted-purple mask between dark sections.
- Use a soft white mask when entering the Xuelang light section.
- Stagger heading, media, metadata, and CTA reveals by approximately 100–140ms.
- Play each section transition once per page visit.
- Do not replay the full sequence when the user scrolls upward.
- Never intercept wheel, touch, pointer, or keyboard navigation.

Touch devices and reduced-motion mode receive a simple opacity reveal or immediate final state.

## Component Boundaries

Keep responsibilities isolated:

- The CTA component owns visual variants, icon alignment, hover, focus, and disabled behavior.
- The pointer layer owns pointer eligibility, trail timing, stationary symbol generation, and motion preference handling.
- The ambient field owns particles and section-local visual rendering.
- The transition wrapper owns one-shot intersection state and reveal sequencing.
- Existing project components continue to own their content and links.
- Visual Archive continues to own its locked carousel logic; only its outer scrolling contract changes.

No component may prevent page-level vertical scrolling unless an existing explicit drag gesture is active.

## Responsive And Accessibility Behavior

- `/zh/` and `/en/` must remain complete and equivalent.
- Desktop and 390px mobile layouts must have no page-level horizontal overflow.
- Interactive elements retain semantic links/buttons, keyboard access, and visible focus states.
- Decorative canvases, particles, masks, and cursor glyphs are hidden from assistive technology.
- `prefers-reduced-motion` disables complex masks, continuous particles, cursor trails, and symbol fields.
- Coarse-pointer devices do not render desktop pointer-follow effects.
- Hero dragging remains touch-safe and keyboard operable.

## Verification

Automated verification must cover:

- Component tests for CTA variants, local Remix icon usage, Footer content, Archive titles, and removal of `AboutPreview`
- Existing Hero drag, scan, keyboard, and reset tests
- Existing Visual Archive four-card order, cover loading, `04 / 04` highlight, and mobile neighboring-card reveal tests
- E2E wheel/trackpad-style vertical scrolling while the pointer is over Visual Archive
- E2E interaction checks proving decorative layers do not block clicks or scrolling
- `/zh/` and `/en/` desktop and 390px mobile checks
- Reduced-motion and coarse-pointer fallbacks
- ESLint and Next.js production build

Browser visual verification must capture desktop and mobile views of:

- Hero bottom alignment and portrait containment
- Xuelang media/content centering
- Visual Archive title and vertical scrolling behavior
- AIDX liquid field and green external CTA
- Footer liquid field, email arrow alignment, and centered copyright

The final implementation is acceptable only when there is no abrupt whitespace, overlap, crop, unintended pointer capture, or page-level horizontal overflow.
