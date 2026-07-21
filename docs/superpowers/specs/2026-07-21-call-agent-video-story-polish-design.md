# Call Agent Video Story Polish Design

## Scope

This change applies only to the Call Agent detail page. It does not modify the portfolio homepage.

## Intent

The page should present the product as a connected path from configuration to validation and real call operations. Video edits must preserve the approved source story: the Preview recording is restored to its full 26.31-second timeline and may be accelerated, but it must not be temporally trimmed.

## Hero

The detail Hero uses one stable virtual-browser stage with three sequential clips:

1. Create
2. Preview
3. Outbound operations

Only one clip is active at a time. A clip advances only after its `ended` event, so playback speed changes viewing time without deleting content. Transitions use a short opacity and scale handoff. The sequence loops after the third clip. Reduced-motion users see the first poster without autoplay or transitions.

## Media Treatment

- Preserve the existing image-fit and viewport treatment; this request is about timeline length, not spatial cropping.
- Keep the existing per-clip playback rates within 1.25x to 1.6x.
- Increase the virtual browser radius to 20px and clip the lower viewport to the same boundary so source-video corner pixels cannot leak outside it.
- Keep section videos centered within the available content width.

## Detail Modules

- Give the dark “Make AI behavior observable” section a 20px radius and clip its background to that boundary.
- Use the full Preview recording for the first video in that section.
- Set the gap between the Preview and Publish videos to exactly 32px.
- Set the gap between the Inbound connection and Outbound operations videos to exactly 32px.

## Accessibility And Failure Behavior

- Every video retains its title, description, poster, muted inline playback, and playback-rate behavior.
- If autoplay is unavailable, the poster remains visible and the existing play failure handling remains non-blocking.
- The sequence advances only from a real media `ended` event, not a timer.

## Verification

- Component tests cover source order, end-driven advancement, reduced motion, browser radius hooks, and section spacing hooks.
- Manifest tests prove Preview uses the full source contract with no `start` or `duration` trim.
- Playwright checks desktop and mobile geometry, visible media, 20px radii, and 32px gaps.
- The Call Agent media pipeline regenerates the Preview MP4 and updates approved checksums.
