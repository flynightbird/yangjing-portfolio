# Visual Archive Lightbox Stage Design

## Status

Approved direction: **C / Gallery Stage**.

This specification changes only Lightboxes opened from the homepage Visual Archive. Case-study Lightboxes keep their current appearance and behavior.

## Intent

Make the Visual Archive feel curated rather than merely enlarged. The modal should inherit the homepage's 20px card language while introducing one stronger signature: a narrow control rail that frames the work like a gallery viewing desk.

The work remains primary. Controls must never cover meaningful image content, and the frame must not become more visually prominent than the artwork.

## Existing Behavior To Preserve

- Reuse the latest shared gallery logic from `origin/codex/portfolio-nextjs`.
- Preserve previous/next buttons, arrow-key navigation, disabled boundaries, position status, failure states, focus trapping, Escape close, backdrop close, body lock, exact scroll restoration, and trigger focus return.
- Preserve the gallery's current source order and localized labels.
- Preserve mobile vertical stacking of all gallery images; do not convert mobile into a one-image carousel.
- Preserve reduced-motion behavior and print suppression.
- Do not change detail-page Lightboxes.

## Component Boundary

Add an explicit visual variant to the shared component rather than forking its behavior:

```tsx
<Lightbox variant="archive" ... />
```

`variant="default"` remains the implicit default. `VisualArchive` is the only initial caller of `variant="archive"`. Shared accessibility and gallery state remain in one component.

The archive variant may receive a concise visible title already derived from the localized project label. It must not introduce new project data or alter archive content.

## Visual System

### Tokens

- Backdrop: `rgba(8, 8, 10, 0.82)` with an 18px backdrop blur.
- Stage surface: `#171719`.
- Media well: `#0D0D0F`.
- Primary text: `#F4F4F1`.
- Secondary text and borders: `rgba(244, 244, 241, 0.42)` and `rgba(244, 244, 241, 0.14)`.
- Active/focus signal: reuse the site's existing signal color; do not add a new archive accent.
- Typography: existing Geist/sans tokens for title and existing mono token for index.

### Radius Hierarchy

- Homepage archive card: retain 20px.
- Desktop modal stage: 24px.
- Desktop media well/image: 18px.
- Circular controls: 999px with a 44px target.
- Mobile media items: 20px.

The modal must not contain the current 2px square frame language.

## Desktop Composition

```text
┌─ media stage, radius 24 ────────────────────┬─ 104px rail ─┐
│ ┌─ artwork, radius 18 ────────────────┐ │       close   │
│ │                                              │ │               │
│ │         full artwork, object-fit contain      │ │ vertical title│
│ │                                              │ │               │
│ └──────────────────────────────────────────────┘ │ 01 / 04      │
│                                                  │ [←] [→]     │
└──────────────────────────────────────────────────┴──────────────┘
```

- Stage width: `min(94vw, 1600px)`.
- Stage max height: `calc(100dvh - 40px)`.
- Rail width: clamp between 96px and 112px; default 104px.
- Media uses `object-fit: contain`. No archive image may be cropped to fill the stage.
- Close sits at the rail top. The localized title is restrained and vertical in the rail center. Counter and arrow controls sit at the bottom.
- Rail controls stay visible at low contrast; hover and keyboard focus increase contrast.

## Mobile Composition

- At the existing mobile breakpoint, replace the side rail with a compact sticky top bar.
- Keep the existing vertical stack of gallery images in source order.
- Hide previous/next controls because scrolling, not carousel navigation, is the mobile interaction model.
- Keep close, localized title, and position context in the sticky bar without obscuring media.
- Use 8px outer gutters, 8px gaps, and 20px media radius.
- Preserve safe-area insets and prevent page-level horizontal overflow.

## Motion

Use one short GSAP entrance sequence for the archive variant only:

1. Backdrop opacity `0 -> 1` over 220ms.
2. Stage `translateY(16px), scale(0.985), opacity 0 -> resting state` over 420ms with `power3.out`.
3. Media and rail controls resolve over the final 180ms with no bounce.

Closing reverses the visual hierarchy in 180ms before unmount. Image changes use a restrained opacity/translate transition, never a wipe, glitch, or large zoom. Under `prefers-reduced-motion`, render the final state immediately.

## Interaction And Accessibility

- All icon controls retain localized accessible names and visible focus states.
- Minimum target size is 44px.
- The dialog retains a semantic title even when the visible title is vertical.
- Disabled arrow controls remain perceivable but cannot receive accidental pointer action.
- Do not add hover-only information.
- Do not change keyboard handling, focus restoration, scroll restoration, media error handling, or mobile image readiness logic.

## Acceptance Criteria

- Only homepage Visual Archive Lightboxes use the Gallery Stage design.
- Detail-page Lightboxes are visually unchanged.
- Desktop shows a 24px stage, 18px media radius, and a 96-112px right control rail.
- Artwork is fully visible without cropping.
- Previous/next buttons, keyboard arrows, counter, focus trap, Escape, backdrop close, and exact scroll restoration still work.
- Mobile retains vertically stacked images, 20px media radius, sticky close/title context, and no page-level horizontal overflow at 390px.
- Missing media remains recoverable and does not break the gallery.
- Reduced-motion users receive no staged animation.
- Component and E2E coverage proves variant scoping, gallery navigation, mobile stacking, focus behavior, scroll restoration, and image-error behavior.

## Out Of Scope

- Redesigning archive cards or their internal title positions.
- Changing archive project data, order, cover assets, or gallery assets.
- Changing detail-page Lightboxes.
- Adding thumbnails, autoplay, looping navigation, swipe inertia, download actions, or new theme controls.
