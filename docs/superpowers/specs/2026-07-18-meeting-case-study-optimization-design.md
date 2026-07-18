# Agora Meeting Case Study Optimization Design

**Date:** 2026-07-18

## Objective

Turn the existing Agora Meeting page from a long product-description page into a decision-led portfolio case study for hiring managers. Preserve the route, bilingual structure, shipped-product claims, and temporary media placements while improving scanability, evidence quality, and responsive behavior.

## Approved Direction

- Preserve the existing light editorial theme, charcoal type, and coral accent.
- Keep the existing eight chapter anchors so navigation and deep links remain stable.
- Treat supplied images as temporary. Recompose their placement and proportions without evaluating or replacing their visual content.
- Remove Host Focus and Personal Pin from the published narrative, models, and visible priority rules.
- Use the supplied Figma file as evidence of interaction decisions and cross-functional alignment, with collaboration claims kept designer-attributed unless corroborated by comments or review records.

## Content Architecture

### Hero

- Replace the long English article title with a compact bilingual product title that fits within two desktop lines and avoids broken English words on mobile.
- Keep product category, role, duration, platforms, status, disclosure, and hero media.
- Bring the product value proposition and the top edge of the hero media into the first desktop viewport where practical.

### Context, Challenge, And Strategy

- Tighten the first three chapters by removing repeated explanations of changing meeting state.
- Keep the business trigger, role boundaries, customer-requirement input, default-versus-configurable strategy, and context-to-priority-to-interface model.
- Remove Host Focus and Personal Pin from challenge copy.

### Adaptive Meeting Stage

- Present three primary triggers: Screen Share, Whiteboard Open, and Participant Count.
- Remove the Focus/Pin comparison component and its bilingual copy.
- Update the meeting-state matrix, video description, captions metadata where referenced, and tests to match the three-trigger model.

### Whiteboard Workspace

- Keep canvas priority and cross-device orientation as the central decision.
- Simplify the participant-view priority to Active Speaker, Self, Camera and Microphone, Camera, and Microphone.
- Retain the cross-device figure and ordered priority model.

### Decision Evidence

- Add one compact evidence block using the supplied Figma decision artifact.
- Use the breakout-room work as evidence of translating requirements into implementable rules: 50-group limit, 24-character naming limit, disabled states, and different deletion behavior for empty and occupied groups.
- Attribute collaboration honestly: the artifact proves the rules and edge states; its use for product, engineering, and QA alignment is designer-reported.
- Do not embed the full Figma canvas. Use a readable crop or linked evidence treatment.

### Information Layer, Capability Breadth, And Reflection

- Keep the personal-versus-meeting-level language control distinction because it directly explains governance.
- Replace repeated section-level statements about missing metrics with one disclosure near the project overview and concise delivery language in later chapters.
- Keep Breakout Rooms, Chat, and Waiting Room as breadth, but connect the Figma evidence to Breakout Rooms so the section demonstrates decisions rather than listing features.
- Preserve the reflection about late component governance and strengthen its connection to the documented state rules.

## Interaction And Responsive Design

- Fix the initial header so navigation remains visible against the light hero before the sticky dark treatment activates.
- Fix chapter-navigation colors so inactive links remain readable on both desktop and the mobile chapter drawer.
- Keep the mobile chapter control compact and ensure the open drawer shows all chapter links without invisible text or unexplained blank space.
- Prevent forced mid-word English wrapping in the hero.
- Preserve semantic headings, tables, ordered lists, skip link, keyboard navigation, focus states, and reduced-motion behavior.

## Component Scope

- Update bilingual meeting MDX content.
- Update meeting layout and model components only where needed by this page.
- Remove `FocusPinComparison` and its dedicated test coverage.
- Remove unused Focus/Pin styles only when no remaining meeting component references them.
- Update the meeting asset manifest or generator references so removed Focus/Pin assets are no longer required for publication. Existing source assets may remain on disk if deleting them risks unrelated user work.
- Add a focused decision-evidence component only if existing evidence components cannot express the Figma artifact clearly.

## Testing

- Content tests assert that neither locale publishes Host Focus, Personal Pin, or their Chinese equivalents.
- Model tests assert exactly three adaptive-stage triggers and the revised five-item participant priority.
- Layout tests assert a compact hero title and readable chapter navigation classes or tokens.
- Publication and asset tests no longer require the Focus/Pin asset.
- Browser verification covers Chinese and English at 1440x1000 and 390x844.
- Visual checks confirm readable initial navigation, visible mobile drawer links, no mid-word hero break, no horizontal overflow, and coherent spacing after the removed comparison block.
- Network checks distinguish temporary missing media from regressions introduced by this optimization.

## Out Of Scope

- Replacing temporary product images or videos.
- Changing the `/zh/work/meeting/` or `/en/work/meeting/` routes.
- Changing global portfolio navigation labels or unrelated case studies.
- Inventing adoption, satisfaction, efficiency, research, or collaboration claims.
