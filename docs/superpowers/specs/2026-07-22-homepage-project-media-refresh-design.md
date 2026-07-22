# Homepage Project Media Refresh Design

**Date:** 2026-07-22

## Goal

Refresh five homepage presentation details without changing the homepage information architecture or destabilizing the project detail system:

- make the ConvoAI card show both the web and mobile product experiences clearly;
- give the embedded STT Demo enough vertical room to reveal its Dock;
- simplify the AIDX identity line;
- replace the static Xuelang image with the existing old/new comparison language;
- retain and verify the latest shared Footer already merged into `main`.

The work remains local to the homepage presentation layer except for the generated ConvoAI media asset and focused regression coverage.

## Selected Direction

The selected ConvoAI composition is **desktop web first, mobile as a supporting endpoint**.

On wide screens, the web product is the dominant visual inside a virtual browser matching the Call Agent homepage treatment. A smaller mobile preview sits near the lower-right as a secondary signal. On narrow screens, the desktop composition is replaced by a looping GIF generated from the latter half of the mobile conversation-start video.

This direction preserves product legibility and avoids presenting the web and mobile experiences as equal-sized competing subjects.

## ConvoAI Media Card

### Desktop composition

- Use `public/images/convo-ai/figma/web-ready.png` as the web evidence.
- Place it inside the same browser-chrome language used by the Call Agent homepage media: light chrome, subtle border and shadow, and correctly resolved lower corner radii.
- Keep the screenshot's left edge visible. The browser may extend below the media-card boundary so its lower portion is intentionally clipped by the card.
- Do not crop the screenshot from the left to create scale. Scale and position it from the top-left/left-center according to the available viewport.
- Retain a smaller phone preview near the lower-right. It must have a clean device frame, stable aspect ratio, and sufficient inset so neither the device nor its rounded corners break against the card edge.
- Use a restrained, low-saturation gradient combining purple, grey-green, and warm grey. It may borrow the STT card's sense of depth, but not its color stops, highlight positions, or exact composition.

### Mobile composition

- Hide the desktop browser and supporting phone preview at the mobile breakpoint.
- Generate a looping GIF from the final 50% of `/Users/admin/Desktop/声网 作品集 整理/convo ai demo/对话交互启动.mp4`.
- Preserve the selected half in full; temporal editing is limited to practical playback acceleration and GIF optimization, not removing additional interaction steps.
- Present the GIF as the sole product evidence in the mobile media card, with correct intrinsic ratio and rounded clipping.
- For `prefers-reduced-motion: reduce`, replace the animated GIF with a representative static frame.

## STT Demo Media Card

- Keep the embedded demo and its internal layout unchanged.
- Increase the media card's stable height/aspect constraints so the existing demo Dock is fully visible.
- Adjust the browser window and embedded viewport geometry together, avoiding a second crop that merely moves the missing area.
- Retain current lazy loading, offscreen playback pausing, pointer parallax, fallback image, and external-link behavior.
- Verify desktop and mobile breakpoints separately because the current `16 / 9` container is the main limiting constraint.

## AIDX Metadata

- The first metadata row contains only the AIDX logo and localized company descriptor:
  - Chinese: `新加坡 AI 公司`
  - English: `Singapore AI company`
- Remove the project-kind text and its separator from this row for AIDX only.
- Keep the shared `ProjectMeta` behavior unchanged for all other projects.
- Prefer an explicit AIDX presentation option over CSS that hides semantic content after render.

## Xuelang Homepage Comparison

### Visual treatment

- Replace the homepage's single Xuelang image with a homepage-adapted old/new wipe comparison using the same verified images and visual vocabulary as the Xuelang detail page.
- Preserve the before/after labels, divider, handle, accessible range input, arrow-key behavior, and non-JavaScript fallback principles.
- Keep homepage typography and spacing local; do not import detail-page captions if they overload the card.

### Automatic sequence

- Trigger once when the comparison card enters the central 40% band of the viewport.
- Animate the divider through two complete left/right wipes, then return to its resting position and stop permanently for that page load.
- Use transform/CSS custom-property updates driven by animation frames or the existing motion runtime. Do not drive the sequence from scroll progress.
- Do not retrigger after the user scrolls away and returns.
- Disable the automatic sequence when reduced motion is requested.

### Scroll and interaction safety

- The automatic sequence is observational only: it must never lock, scrub, delay, or alter page scrolling.
- The range control remains directly draggable with mouse, pen, touch, and keyboard.
- Touch handling must preserve vertical page movement. A vertical gesture continues native scrolling; only a clearly horizontal drag updates the divider.
- Avoid global wheel, touchmove, or pointer-event suppression.
- Any deliberate manual input immediately cancels the remaining automatic sequence and gives the user control.

## Footer Integration

- Treat the Footer currently merged into `main` as canonical.
- Do not replace or restyle it as part of this work.
- Confirm the homepage renders the shared `SiteFooter` with its reveal motion, localized CTA, email copy action, email link, and current background treatment.
- Add focused regression coverage so a page-local legacy Footer cannot silently return.

## Accessibility And Responsive Behavior

- Browser chrome is decorative; product screenshots retain useful alternative text.
- Xuelang's range input remains keyboard accessible and exposes its current value.
- Motion does not communicate exclusive information.
- Reduced-motion users receive a static ConvoAI frame and no Xuelang auto-wipe.
- Fixed media geometry prevents layout shifts while GIFs, images, and iframes load.
- Phone frames, browser corners, labels, and controls must remain inside their intended clipping contexts at all supported widths.

## Verification

- Component tests cover the AIDX metadata variant, ConvoAI responsive media sources, Xuelang auto/manual behavior, and shared Footer presence.
- Browser tests verify the STT Dock is visible, ConvoAI's left edge is not cropped, Xuelang does not impede vertical scrolling, two automatic wipes stop, and manual control still works.
- Visual screenshots cover wide desktop and mobile widths, including reduced motion.
- The production build is verified under the configured GitHub Pages base path so generated media URLs resolve after deployment.

## Non-Goals

- Rebuilding the homepage layout or copy system.
- Refactoring every virtual browser into a new site-wide abstraction.
- Changing the ConvoAI or Xuelang detail pages.
- Redesigning the Footer.
- Editing additional steps out of the selected half of the ConvoAI source video.
