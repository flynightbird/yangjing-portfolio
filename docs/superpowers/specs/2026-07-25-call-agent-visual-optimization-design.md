# Call Agent Visual Optimization Design

Date: 2026-07-25

## Objective

Refine the bilingual Call Agent case study so its product-system module is faster to scan, its visual language connects to the portfolio homepage, and its hero establishes a clear reading order without placing the project title over product media.

The change must preserve the existing evidence boundary, bilingual content, six-stage product story, media assets, reduced-motion behavior, and static export support.

## Confirmed Direction

Use a compact horizontal pill-tab system above the product view. The primary accent is the homepage fluorescent green, `#c7ff38`. Purple is not a primary accent in this case-study treatment.

## Product-System Module

### Structure

Replace the current tall left-hand step list and sticky right-hand media stage with this order:

1. Section heading and supporting paragraph.
2. A horizontal tab list containing only the six stage names.
3. One stable media viewport.
4. The active stage summary below the viewport.

The stage names remain:

- Create / 创建
- Orchestrate / 编排
- Preview / 预览
- Publish / 发布
- Inbound connection / 内呼连接
- Outbound operations / 外呼运营

### Tab Treatment

- Use semantic `tablist`, `tab`, and `tabpanel` roles.
- Tabs contain the main name only. Remove the number and summary from each tab.
- Use a fully rounded pill shape with a stable height of 38px.
- The active tab uses fluorescent green with black text.
- Inactive tabs use a quiet neutral surface and border; hover and keyboard focus increase contrast without changing dimensions.
- Desktop and wide tablet layouts keep the tabs on one line when space permits.
- Narrow layouts use horizontal overflow with touch scrolling. The active tab scrolls into view without reflowing the media.
- Arrow keys move between tabs; Home and End move to the first and last tab.

### Media And Motion

- Keep one stable media frame with a fixed aspect ratio so tab changes do not shift the page.
- Only the active video plays. Inactive videos pause.
- Use a restrained opacity transition between panels; avoid scale movement that makes the product UI look unstable.
- Keep the active summary below the media as supporting explanation, not inside the control.
- Reduced-motion users receive the same tab interface and static poster states without autoplay or transition motion.

The existing six MP4 clips and six poster images are sufficient for this module.

## Color System

Define a Call Agent signal token using the homepage fluorescent green:

```css
--call-signal: #c7ff38;
```

Use it for the active tab, section indexes, focused interactive states, and small diagram signals. Do not flood large backgrounds with fluorescent green. Dark runtime sections retain near-black surfaces so the signal color remains legible and purposeful.

Replace the current iris-based Call Agent accent. Existing global purple tokens remain unchanged for other pages.

## Hero Layout

The title and product media must occupy separate layout regions.

### Desktop

- Place the eyebrow, audience, H1, and proposition in the upper content region.
- Place project facts in an adjacent or following compact grid aligned to the same baseline system.
- Place the product media below the complete copy region at full available content width.
- Remove overlapping grid columns and negative media offsets.
- Reduce excessive vertical padding so the first viewport reveals both the project positioning and the beginning of the real product view.

### Tablet And Mobile

- Stack copy, facts, actions, and media in document order.
- Keep at least one standard spacing interval between H1 and media.
- Allow long Chinese and English titles to wrap naturally without covering adjacent content.
- Preserve a stable 16:10 product-media area and avoid viewport-height-dependent overlap.

## Typography Standard

Call Agent currently uses the shared project-title, chapter-title, and card-title size tokens, but the surrounding typography is not fully aligned with the newest detail-page standard. This change completes that alignment.

- Project title: shared `--case-project-title-*` tokens, display font, max width 18ch.
- Chapter title: shared `--case-chapter-title-*` tokens, display font, max width 20ch.
- Card title: shared `--case-card-title-*` tokens only where content is genuinely a card title.
- Lead paragraph: `1.1875rem`, `1.6` line-height.
- Body paragraph: `1rem`, `1.75` line-height.
- Tab label: `0.875rem`, semibold weight.
- Metadata label: `0.6875rem`, mono font.

Remove the current Call Agent lead scale that can grow to `2rem`; it competes with chapter headings and breaks cross-case consistency.

## Additional Layout Refinements

- Align the overall frame and rail proportions with Meeting and Xuelang: a bounded 100rem content area, 2/10 rail-to-content ratio, and shared responsive gutters.
- Reduce section padding from the current very large range to the newer detail-page rhythm.
- Replace the 20px rounded dark section with a quieter full-width content band without rounded corners.
- Normalize browser-frame radius, caption spacing, borders, and shadows so media reads as evidence rather than a decorative card.
- Keep reading text near 42-48rem and do not stretch paragraphs to the full media width.
- Preserve the existing chapter navigation and bilingual route structure.

## Existing Asset Inventory

The repository already contains:

- Six workflow videos: create, orchestrate, preview, publish, inbound connection, and outbound operations.
- Six matching WebP posters.
- Additional product stills covering AI Preview, number connection, outbound task creation, product switching, resource management before/after, and call-history filtering before/after.
- Product-boundary and productization diagrams generated from structured page content.

No new visual asset is required to implement the confirmed layout and interaction changes.

## Missing Material Ledger

These gaps affect portfolio credibility or storytelling depth. They do not block the visual optimization.

### Gap: Dedicated Hero Master Image

The hero currently reuses a video poster rather than a deliberately composed master image. Supply one approved, redacted 16:9 or 16:10 capture at 2560px width or greater, showing the most legible Call Agent configuration and Preview state with safe data.

### Gap: Verified Before-State Evidence

The story states that capabilities existed without a complete configuration entry, but no artifact directly demonstrates that fragmented starting point. Useful material would be an approved legacy workflow capture, resource map, or before-state diagram based on project documentation.

### Gap: Research And Operator Evidence

No approved artifact currently demonstrates operator tasks, customer pain points, interview findings, support patterns, or requirement synthesis. Useful material would be redacted research notes, a task model, a journey, or attributed product requirements.

### Gap: Information-Architecture Iterations

The final six-stage system is visible, but the rejected or intermediate structures are not. Useful material would be an early sitemap, grouping alternatives, or a comparison explaining why technical resource categories were replaced by task stages.

### Gap: Design-System Contribution Evidence

The reflection mentions design-system and AI-assisted prototype delivery, but no approved component sheet, token view, state matrix, or prototype excerpt supports that contribution.

### Gap: Collaboration And Handoff Evidence

The case names cross-functional collaborators but does not show how decisions were aligned or handed off. Useful material would be a redacted review artifact, annotation example, implementation checklist, or state specification.

### Gap: Verified Outcome Evidence

The current source supports a formally launched status but includes no independently verified adoption, task success, configuration time, support reduction, quality, or business outcome. Useful material would be an approved analytics screenshot, release note, customer quote, operational metric, or attributed stakeholder assessment.

### Gap: Responsive Product Evidence

All current product evidence is desktop-oriented. If responsive Call Agent behavior shipped and is relevant, supply approved tablet or narrow-layout captures. If the product is intentionally desktop-only, document that constraint instead of creating responsive product mockups.

## Accessibility And Interaction Requirements

- Preserve visible focus treatment with at least 3:1 contrast against adjacent colors.
- Keep every tab reachable by keyboard and expose selected state through `aria-selected`.
- Associate each tab with one panel through `aria-controls` and `aria-labelledby`.
- Do not rely on fluorescent green alone; selected state also uses text contrast and semantic attributes.
- Keep inactive panels out of the accessibility tree.
- Avoid content overlap at 390x844, 768x1024, 1440x900, and wide desktop viewports.

## Testing And Acceptance

- Component tests verify tab semantics, title-only labels, keyboard navigation, active summary changes, and active-video behavior.
- Existing Call Agent media and reduced-motion tests remain valid or are updated to the new interaction contract.
- Browser tests verify tabs are above the viewport, have stable height, and do not produce layout shift.
- Visual checks cover Chinese and English at mobile, tablet, desktop, and wide desktop sizes.
- Hero tests verify the H1 and media rectangles never intersect.
- Typography checks verify Call Agent uses the shared title tokens and normalized lead/body sizes.
- The full lint, unit, end-to-end, static export, and production build suites must pass before deployment.

## Out Of Scope

- Rewriting the case-study claims or adding unsupported outcome statements.
- Creating fictional research, metrics, collaboration evidence, or product screens.
- Changing Meeting, Xuelang, ConvoAI, or homepage visual systems.
- Replacing the six approved workflow videos.
- Redesigning the underlying Call Agent product UI shown inside supplied media.
