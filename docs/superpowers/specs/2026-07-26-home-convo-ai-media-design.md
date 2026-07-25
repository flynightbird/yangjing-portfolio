# Homepage ConvoAI Media Card Design

## Goal

Refine only the ConvoAI media card on the homepage so the Web evidence fits its source content and the phone evidence shows the orb-based conversation interaction. Preserve every other homepage module, including the Call Agent card, Meeting, and Footer.

## Scope

### In scope

- `components/home/convo-ai-media.tsx`
- ConvoAI-specific selectors in `components/home/home.module.css`
- Focused component, unit, and homepage E2E coverage for this media card

### Out of scope

- Call Agent media or copy
- ConvoAI case-study detail pages
- Meeting homepage layout
- Footer behavior or styling
- Homepage section order, copy, typography, or shared project-card layout
- Existing mobile ConvoAI loop and reduced-motion poster behavior

## Approved Design

### Desktop and tablet composition

Keep the current Web-primary composition: one virtual browser is the main evidence surface and one phone mockup overlaps it at the lower right.

- Keep the Web image at `/images/convo-ai/figma/web-ready.png`.
- Keep the existing virtual browser chrome and address label.
- Replace fixed bottom positioning that crops or stretches the Web surface with a content-driven viewport using the source image ratio of `1440 / 800`.
- Let the virtual browser height equal the browser bar plus the proportional Web viewport height.
- Keep the Web image fully visible with `object-fit: contain` and top-left positioning.
- Keep the phone subordinate to the Web browser and inside the outer media-card bounds.

### Phone mockup

Replace the current static avatar image with the complete orb conversation recording:

- Video: `/videos/convo-ai/app-conversation-start.mp4`
- Poster: `/images/convo-ai/posters/app-conversation-start.webp`
- Source ratio: `592 / 1280`
- Playback: autoplay, muted, loop, inline, no controls
- Accessible treatment: the enclosing project link retains the navigation label; the decorative looping phone video does not add a competing focus target

Reduce the phone shape from the current soft rounding to a tighter product-device treatment:

- Outer phone radius: `14px`
- Inner media radius: `10px`
- Preserve the existing dark device border and shadow, adjusted only if necessary to prevent clipping at the tighter radius

### Mobile behavior

Do not change the current mobile composition.

- Normal motion continues to use `/images/convo-ai/home-mobile-loop.gif`.
- Reduced motion continues to use `/images/convo-ai/home-mobile-loop-poster.webp`.
- The desktop Web browser and overlapping phone remain hidden at the existing mobile breakpoint.

## Interaction And Loading

- The phone recording must not introduce controls, sound, or a separate interactive target.
- The committed poster must display before video readiness and remain a valid fallback if playback does not start.
- The Web image and phone poster must reserve stable dimensions before loading.
- Existing flagship hover/focus scaling remains unchanged; this task does not alter shared card motion.
- Reduced-motion users must not receive the looping desktop phone video when the existing reduced-motion path provides static evidence.

## Responsive Geometry

- The outer ConvoAI media card keeps its current desktop and tablet footprint.
- The virtual browser derives its height from the `1440 / 800` viewport ratio instead of a fixed height or negative bottom inset.
- The phone uses `aspect-ratio: 592 / 1280` and remains visually secondary.
- At all supported widths, neither the browser nor phone may overflow the media-card border radius or create page-level horizontal overflow.

## Accessibility

- Preserve the existing linked-card accessible name and focus ring.
- The looping phone video is muted and non-focusable.
- The poster provides the meaningful visual fallback without duplicating spoken labels.
- Existing reduced-motion behavior remains authoritative.

## Verification

Add or update focused tests before implementation to assert:

- The homepage phone uses the approved orb conversation video and poster.
- The phone video is autoplaying, muted, looping, inline, and has no controls.
- The Web viewport uses `aspect-ratio: 1440 / 800` and no negative bottom crop.
- The phone uses `aspect-ratio: 592 / 1280`, `14px` outer radius, and `10px` inner radius.
- The mobile loop and reduced-motion poster sources remain unchanged.
- Call Agent, Meeting, Footer, and unrelated homepage source files remain outside the implementation diff.

Run focused component/unit tests, homepage E2E at desktop and mobile widths, lint, and a production build. Visually verify the real page at desktop and mobile sizes after implementation.
