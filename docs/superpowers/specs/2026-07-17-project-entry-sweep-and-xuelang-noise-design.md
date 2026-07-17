# Project Entry Sweep and Xuelang Noise Design

## Goal

Create one deliberate transition moment between the homepage and internal case
studies, inspired by Austin Knight's diagonal page wipe, while keeping external
project launches immediate. Add a restrained paper-like noise layer to the
light Xuelang case study without changing its content or internal composition.

## Approved Direction

Use the cinematic-soft direction, option C:

- A `315deg` diagonal wipe with an approximately `15%` soft transition edge.
- A `1.2s` tween using the reference easing `[0.27, 0, 0.51, 1]`.
- The current page remains visible while the wipe travels across it.
- Navigation occurs only after the wipe fully covers the viewport.
- A light destination uses a white wipe; a dark destination uses a black wipe.
- Xuelang is the current light destination. Call Agent, Meeting, and other dark
  internal case-study destinations use the dark treatment.

The wipe is the single signature motion. It must feel broad and continuous,
not like a narrow shine, flash, gradient flourish, or card-level hover effect.

## Link Behavior

### Internal case-study links

Homepage links that resolve to localized internal detail routes, such as
`/en/work/xuelang/`, use the wipe and then navigate in the same browser tab.
This applies to every clickable entry point for the same card, including its
title, CTA, or media when more than one of those elements is linked.

The transition controller determines behavior from an explicit destination
contract rather than project names embedded in animation code:

- `tone: light` for Xuelang.
- `tone: dark` for the other internal work/build detail routes.
- No transition for hash links, image lightboxes, downloads, or links modified
  with Command, Control, Shift, or Alt.

### External and demo links

AIDX and STT Demo remain new-tab experiences and do not wait for the wipe:

- AIDX continues to open `https://aidxtech.com/` in a secure new tab.
- STT Demo continues to open `/demos/stt-demo/index.html` in a secure new tab.
- Other external destinations, including the current ConvoAI launch, retain
  their external-link behavior and do not use the internal page transition.

This preserves browser intent and avoids delaying a launch whose destination
is outside the localized portfolio route tree.

## Transition Architecture

Add one client-side transition layer at the localized application shell so the
overlay is viewport-fixed, independent from card layout, and reusable by all
homepage project entry points. A small transition-link adapter communicates the
destination URL and tone to that layer.

The interaction sequence is:

1. The user activates an eligible internal case-study link.
2. The controller prevents immediate navigation and locks duplicate activation.
3. A fixed, non-interactive diagonal mask sweeps across the viewport.
4. Once the viewport is fully covered, the browser navigates to the destination
   in the current tab.
5. The new page renders normally; no second decorative reveal is required.

The overlay must use `pointer-events: none` and sit above the site shell during
the transition. The implementation must not alter project-card layout, hover
states, or existing content data.

## Accessibility and Failure Handling

- With `prefers-reduced-motion: reduce`, eligible links navigate immediately in
  the same tab without the animated wipe.
- Keyboard activation receives the same behavior as an unmodified primary
  pointer click.
- Modified clicks, middle clicks, downloads, external links, and links with an
  explicit non-self target retain native browser behavior.
- The transition lock prevents double navigation while the wipe is running.
- If animation events are unavailable, a timer matching the declared duration
  completes navigation so the user cannot become trapped behind the overlay.
- The overlay is decorative and absent from the accessibility tree.

## Xuelang Noise

Add an Xuelang-only fixed or repeating noise layer over its existing `#f5f7f5`
paper background:

- Use a small monochrome raster tile repeated at its native scale.
- Start at approximately `3.5%` visual opacity, materially lighter than the
  Austin reference's roughly `10%` overlay.
- Keep the layer non-interactive and behind all readable content and controls.
- Do not add gradients, tint shifts, vignette effects, or animated grain.
- Preserve Xuelang's existing typography, section backgrounds, evidence
  components, and responsive layout.

The texture should become apparent only on inspection. It is material finish,
not a visible illustration.

## Responsive Behavior

The transition covers the visual viewport on desktop and mobile without
creating document-level overflow. The diagonal geometry must include enough
overscan to cover viewport corners at `315deg`, including at 390px width.
The Xuelang noise layer must not affect dimensions, scrolling, or sticky
elements.

## Verification

- Clicking each internal homepage case-study entry completes the full wipe and
  then arrives at the correct localized detail route in the same tab.
- Xuelang uses a white wipe; dark internal detail routes use a black wipe.
- AIDX and STT Demo still open secure new tabs without an internal wipe delay.
- ConvoAI and other external links preserve their existing external behavior.
- Modified clicks and reduced-motion navigation preserve native expectations.
- Rapid repeated activation causes only one navigation.
- The overlay covers desktop and 390px mobile viewports without gaps or
  horizontal overflow.
- Xuelang shows subtle static noise on its light background with no loss of
  text contrast or interaction.
- `/zh/` and `/en/` behavior is equivalent.
- Existing homepage, content, and Xuelang tests continue to pass.

## Out of Scope

- Redesigning project cards or case-study pages.
- Changing project copy, order, media, or publication state.
- Applying noise to dark pages or the global homepage.
- Adding a page-exit animation to AIDX, STT Demo, or other external links.
- Reproducing unrelated Austin Knight layout, typography, or navigation.
