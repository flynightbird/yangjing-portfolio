# Lightbox Controls And Homepage CTA Design

## Status

Approved direction: **A / canvas-corner controls**.

## Goal

Correct the Visual Archive Lightbox title direction, reduce control-rail congestion, and make homepage project CTAs visually consistent.

## Scope

- Change only the `archive` variant used by homepage Visual Archive Lightboxes.
- Keep default case-study Lightboxes visually and behaviorally unchanged.
- Standardize CTAs across the six core homepage projects: Call Agent, ConvoAI, Meeting, STT Demo, AIDX, and Xuelang.
- Keep Visual Archive card composition, project order, media, and Lightbox gallery behavior unchanged.

## Visual Archive Lightbox

### Title

- Keep the localized project title in the right control rail.
- Use a normal top-to-bottom vertical reading direction.
- Use `writing-mode: vertical-rl` and `text-orientation: mixed` without a 180-degree transform.
- Preserve truncation and the existing semantic dialog title.

### Navigation Placement

- Move previous and next controls from the right rail into the media canvas at its lower-right corner.
- Keep both controls together with an 8px gap.
- Use 48px circular controls on desktop.
- Keep at least 20px clearance from the media well's right and bottom edges.
- The controls overlay the media well rather than entering the artwork layout flow, so gallery dimensions do not shift during navigation.

### Counter Alignment

- Keep the position counter in the right rail.
- Place the counter at the same visual centerline as the arrow group.
- Use the existing monospaced counter typography and restrained secondary contrast.
- The rail retains Close at the top and the vertical title in the center; arrows no longer occupy the rail.

### Arrow States

- Default enabled: dark translucent circular surface, visible white arrow, subtle light border, no green outer ring.
- Disabled: dark translucent surface and lower-contrast arrow; remains visible but does not react to Hover.
- Hover: solid light surface and dark arrow, no green outer ring.
- Keyboard `focus-visible`: solid light surface and dark arrow with the existing fluorescent-green outer focus ring.
- Preserve localized labels, disabled boundaries, arrow-key navigation, focus trap, and reduced-motion behavior.

### Responsive Behavior

- Desktop and tablet Gallery Stage use the canvas-corner arrows and rail counter.
- Mobile keeps the approved vertical image stack and sticky header.
- Mobile continues to hide previous and next arrows; scrolling remains the navigation model.
- Preserve 390px no-horizontal-overflow behavior and 20px mobile media radius.

## Homepage CTA System

### Shared Sizing

- Height: `48px`.
- Font size: `14px`.
- Font weight: `500`.
- Pill radius: `999px`.
- Use one consistent horizontal padding and icon gap across the six core project sections.
- Preserve the existing white, signal-green, and white-outline color variants.

### Icon Rules

- Every `查看案例` / `View case study` CTA contains text only and no arrow icon.
- `访问线上网站` / `Visit live site` keeps the external-link arrow.
- `查看 Build Lab` / `Explore Build Lab` keeps the external-link arrow.
- The icon rule follows destination meaning, not section color.
- Existing link destinations, target behavior, secure `rel` values, and page-transition tones remain unchanged.

## Interaction And Accessibility

- Arrow controls retain 48px targets, localized accessible names, keyboard navigation, visible focus, and disabled semantics.
- CTA accessible names remain unchanged except for the already approved localized visible copy.
- Removing the visible case-study arrow must not remove text labels or change link behavior.
- Hover treatments must not cause layout shift.

## Testing

- Component tests prove the archive title no longer uses the inverted transform and archive controls are rendered in the media canvas rather than the rail.
- E2E tests prove arrow visibility, rail/canvas placement, counter alignment, Hover contrast, keyboard focus ring, navigation, and mobile arrow hiding.
- Homepage component tests prove all six core CTA instances share the approved sizing hook and that case-study CTAs contain no arrow while AIDX and STT retain external arrows.
- Existing Lightbox lifecycle, scroll restoration, focus, gallery-error, and mobile-stack tests remain green.

## Out Of Scope

- Changing Visual Archive card artwork or card-level controls.
- Changing detail-page Lightbox styling.
- Adding thumbnails, swipe navigation, autoplay, or looping gallery navigation.
- Changing CTA wording, destinations, or color roles beyond the approved icon rule.
