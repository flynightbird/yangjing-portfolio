# Home and About Scroll Reveal Design

## Goal

Add a deliberate first-entry reveal to text and imagery on the localized Home and About pages. The motion should make downward scrolling feel more dimensional without changing layout, capturing the wheel, or competing with existing page-specific interactions.

## Confirmed Direction

- Use the selected **C / narrative** intensity.
- Trigger only when a below-the-fold module first enters the viewport.
- Play once, then remain fully visible even if the user scrolls away and returns.
- Preserve the black full-page transition shown after clicking supported case-study links.
- Remove only the black section mask that currently sweeps across Home project sections during downward scrolling.

## Scope

### Home

Apply the shared reveal to:

- the four selected-work project chapters currently wrapped by `SectionReveal`;
- the Visual Archive heading and carousel surface.

Do not alter:

- the dual-identity Hero;
- the interactive introduction sequence;
- pointer-field behavior;
- project-card hover and media interactions;
- Visual Archive horizontal scrolling, controls, or wheel passthrough;
- Footer layered reveal;
- click-triggered page transitions into case studies.

### About

Apply the shared reveal to the three sections below the Hero:

- capability heading and capability-card grid;
- evidence heading and evidence grid;
- career heading, timeline, and education row.

Do not animate the About Hero on initial page load.

## Motion Specification

Each observed module has two semantic reveal groups:

1. **Text group**
   - starts at `opacity: 0`;
   - starts `22px` below its final position;
   - starts with `filter: blur(2px)`;
   - resolves over `740ms`;
   - uses `cubic-bezier(0.22, 1, 0.36, 1)`.

2. **Media group**
   - starts at `opacity: 0`;
   - starts `22px` below its final position;
   - starts with `filter: blur(2px)`;
   - begins `180ms` after the text group;
   - resolves over `800ms` with the same easing.

Cards and images inside one module enter as a coherent group. They do not cascade one by one. Motion uses only opacity, transform, and filter, so it does not reserve new space or cause layout shift.

## Trigger Behavior

Create a shared client component, `ScrollReveal`, backed by one `IntersectionObserver` per mounted reveal boundary.

- Reveal with `threshold: 0.12`.
- Use `rootMargin: 0px 0px -8% 0px` so the reveal begins after the module visibly enters.
- Disconnect the observer immediately after the first reveal.
- If `IntersectionObserver` is unavailable, reveal on the next animation frame.
- The server-rendered content remains structurally present; animation state must not affect document flow or semantic order.

The component exposes stable data attributes for tests and semantic child hooks for text and media groups. Home and About use the same implementation and motion tokens.

## Existing Motion Relationship

The existing Home `SectionReveal` combines three effects: a horizontal section mask, whole-content blur/upward movement, and delayed project items. It will be replaced by the shared reveal behavior for in-page scrolling.

This change does **not** modify `PageTransitionLayer` or case-study links with `data-page-transition-tone`. Their black full-page transition remains the intentional response to clicking into supported detail pages.

## Reduced Motion and Accessibility

When `prefers-reduced-motion: reduce` is active:

- content renders immediately at full opacity;
- no blur, transform, transition, or animation runs;
- observer setup is skipped or disconnected;
- reading order, focus order, and accessible names remain unchanged.

The reveal is decorative and must never delay keyboard access or hide content from assistive technology.

## Responsive Behavior

Desktop and mobile use the same motion distance and timing so the visual language remains consistent. Reveal groups follow the existing responsive layout: grids may become stacked, but the group animation does not change dimensions or introduce overflow.

## Verification

Component tests must prove:

- pending and revealed states are represented by stable attributes;
- the observer uses the approved threshold and root margin;
- the reveal happens once and the observer disconnects;
- the no-observer fallback reveals content;
- reduced-motion users receive immediate static content;
- Home and About render the expected reveal boundaries and text/media hooks;
- click-triggered page-transition attributes remain present.

Browser verification must cover `/en/`, `/zh/`, `/en/about/`, and `/zh/about/` at desktop and 390px mobile widths. Confirm first-entry motion, no repeat on back-scroll, no horizontal overflow, no scroll capture, preserved case-study transitions, and static rendering under reduced motion.
