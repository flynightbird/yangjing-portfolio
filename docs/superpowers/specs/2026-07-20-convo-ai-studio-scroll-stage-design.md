# Convo AI Studio Scroll Stage Design

## Objective

Replace the scaled-down complete-page treatment inside the Call Agent media card with a legible, media-dominant console stage derived from the approved Figma overview node `11861:59447`.

## Locked Composition

- Keep the existing 20px Call Agent media-card radius and Morandi background.
- Keep the light virtual-browser chrome.
- Fill the browser viewport horizontally with the console instead of fitting the complete 1470 x 1469 page into both axes.
- Keep the 272px Figma sidebar fixed and scale it to the full available browser viewport height.
- Scroll only the right content column upward at a restrained, continuous pace.
- Pause briefly at the end and return to the start with a soft crossfade so no hard jump is visible.
- Preserve the existing subtle pointer drift on the virtual-browser window.
- Keep the embedded document non-interactive. The single overlay link remains the media-card click target and retains the dark page-sweep transition.

## Figma Assets

- Store all used Figma assets in `public/demos/convo-ai-studio/assets/`; do not hotlink short-lived MCP URLs.
- Reuse the approved launch banner.
- Export the AI service icon, official avatar, and news-grid background from their exact child nodes at 2x PNG.
- Download the original high-resolution metric illustration source once and reproduce the three Figma crops with CSS rather than duplicating the source image.
- Use CSS/HTML for ordinary interface icons and text where the Figma source is vector UI chrome; do not rasterize the entire interface.

## Responsive Behavior

- Desktop and tablet: retain the full sidebar while the right panel scrolls.
- Mobile: preserve the current upper-left crop so the sidebar, launch banner, and first metrics remain recognizable; disable automatic vertical travel and pointer drift.
- Respect `prefers-reduced-motion` by disabling the content animation and showing its starting state.

## Motion

- One right-column cycle lasts approximately 20 seconds.
- The start and end each hold for roughly one second.
- Movement uses constant, calm velocity rather than elastic easing.
- Animation pauses when the browser document is not visible.

## Validation

- Verify `/zh/` and `/en/` use their localized HTML documents.
- Verify the sidebar does not move during the desktop cycle.
- Verify the right content changes vertical position over time and returns without a visible flash.
- Verify the iframe remains `pointer-events: none` and `tabIndex=-1`.
- Verify Call Agent hover expansion and the dark page transition still work.
- Verify 1440px desktop and 390px mobile have no page-level horizontal overflow.
- Run component tests, focused Playwright tests, ESLint, and the production framework build.

