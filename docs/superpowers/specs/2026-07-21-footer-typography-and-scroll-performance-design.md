# Footer Typography and Scroll Performance Design

## Status

Approved direction, awaiting written-spec review.

## Goal

Make the shared Footer quieter and easier to read, keep its email actions visually restrained, and remove the severe frame drops that occur while scrolling from the final homepage section into the Footer.

## Confirmed Root Cause

The Footer currently runs a full-size, device-pixel-ratio-scaled canvas while it enters the viewport. Every animation frame redraws four large radial gradients and 22 particles. A repeatable 1.2-second bottom-of-page scroll produced 7 frames, averaging about 190ms with a 518ms maximum. Hiding only the Footer canvas produced 73 frames averaging 16.7ms, with no frame above 20ms.

The existing Footer reveal listener is not the primary bottleneck. Keep its sticky lower-layer composition and scroll-linked transform, but remove the continuously rendered Footer canvas.

## Typography

Use the approved compact option B for the Footer heading:

- Responsive size: `clamp(2.25rem, 5vw, 4.75rem)`.
- Line height: `1.08`, with no negative letter spacing.
- Preserve the existing display font, weight, copy, and maximum line length.
- Confirm that the Chinese heading has clear space between its two lines at 390px and that the English heading remains a strong but restrained page ending on desktop.

The eyebrow, email, and copyright typography remain unchanged.

## Static Footer Background

Replace the Footer `LiquidField` canvas with a static CSS background composed from four layered `radial-gradient()` values over the existing dark base.

The layers must separate more clearly than the current canvas:

- A deep purple-black region anchors one side.
- A mid-value gray-purple region carries the center.
- A lighter, cool gray-purple region opens the opposite side.
- Any additional highlight remains broad and low contrast; do not create discrete decorative blobs.

Apply the gradients to the Footer reveal layer or one of its pseudo-elements so the browser can composite the static surface while the reveal transform moves. Do not animate gradient positions, opacity, filters, or background properties. Keep the existing dark overlay only if it improves text contrast without collapsing the three tonal regions.

Remove the Footer `LiquidField` render call. The reusable canvas component remains available to other surfaces such as AIDX; do not refactor or delete it.

## Email Icons and Hover Area

Use inline SVG icons for all email actions:

- Lucide `Copy` at rest.
- Lucide `Check` after a successful copy.
- Lucide `ArrowUpRight` for the mail action.
- Render each at `16px` with matching stroke weight so neither icon competes with the email address.

Use compact `24px` control boxes. The copy button hover/focus background must not be taller than the email text line box. Use a `3px` radius and the existing translucent white treatment. Keep sufficient focus indication and accessible labels; the visible compact box does not remove keyboard support.

Reduce the grid tracks and gaps around the two controls so the sequence remains visually continuous:

`email address -> copy SVG -> arrow SVG`

The arrow translates `0.125rem` right and up on hover/focus, with reduced-motion support.

## Performance Behavior

- Keep the homepage Footer sticky reveal and rounded foreground layer.
- Keep the reveal transform compositor-friendly.
- Remove continuous Footer background animation and pointer interaction.
- Do not introduce blur filters, animated gradients, scroll-linked React state, or additional per-frame layout work.
- Reduced-motion remains fully static.

## Validation

- Footer heading uses the approved compact size and relaxed line height in both locales.
- Chinese and English headings do not overlap or clip at desktop and 390px mobile widths.
- Footer background shows clearly separated deep, middle, and light purple-gray regions.
- Footer contains no `data-liquid-field="footer"` canvas.
- Copy, check, and arrow controls render as inline SVG at a restrained size.
- Copy hover/focus background height does not exceed the email text line box.
- Copy success, reset, failure feedback, `mailto:` links, and localized labels continue to work.
- The homepage Footer reveal, non-homepage Footer flow, and reduced-motion behavior remain correct.
- A repeatable bottom-of-page scroll has no frame above 32ms in the desktop verification environment and materially improves over the recorded canvas baseline.
- Desktop and 390px mobile screenshots show no overlap or horizontal overflow.

## Out of Scope

- Changing Footer copy, email address, copyright, or contact destinations.
- Removing or redesigning the AIDX liquid field.
- Reworking the homepage Visual Archive or other final-section content.
- Replacing the sticky Footer reveal architecture unless verification disproves the confirmed canvas root cause.
