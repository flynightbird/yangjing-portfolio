# STT Home Media Card Design

## Objective

Replace the homepage STT Demo poster treatment with a Codex-inspired asymmetric project block. The block must make the real product interface immediately legible while preserving the portfolio's dark theme and end-of-page rhythm.

## Locked Direction

- Use a 12-column desktop grid with copy in 4 columns and media in 8 columns.
- Place copy on the left and the media stage on the right.
- Do not embed the complete STT landing page in the homepage.
- Render a high-resolution still from the real STT landing page's right-side product stage.
- Present that still inside a minimal simulated browser window.
- Keep the complete interactive demo available at `/demos/stt-demo/index.html` in a new tab.
- Preserve the existing STT Demo content claims and pinned source provenance.

## Media Asset

Create a high-resolution screenshot directly from the published demo at `/demos/stt-demo/index.html`. Capture only `.land-visual`, the right-side product stage, at a 2x device scale or equivalent native resolution.

The selected frame must show:

- the STT product top bar and running state;
- the current speaker identity;
- the large original-language transcript;
- the translated sentence;
- enough of the participant rail to communicate a multi-speaker system.

The crop may remove part of the participant rail and lower control dock when needed. It must not include the STT landing page's left-side headline, description, or CTA. Store the derived asset as `public/images/stt-demo/stt-product-stage@2x.png` and document that it was rendered from the pinned local demo.

## Desktop Composition

The section stays on the portfolio's dark canvas. Its inner layout uses the existing content width and gutter system.

- Copy column: 4 of 12 columns.
- Media column: 8 of 12 columns.
- Column gap: approximately 32px at the full desktop container width, reduced through existing responsive spacing tokens.
- Media stage: 16:9, 20px outer radius, clipped overflow.
- Copy: vertically centered against the media stage with the existing STT title, proposition, role, status, and one primary action.

The media stage uses a restrained cool blue and violet gradient inspired by the supplied reference. The gradient is limited to this project media surface and does not change the page theme or accent system.

Inside the stage, a minimal browser window rises from the lower portion of the card:

- width approximately 90% to 94% of the media stage;
- offset slightly to the right;
- top edge visible below a generous gradient field;
- thin low-contrast border;
- light browser chrome with three neutral window controls;
- screenshot fills the browser content area without decorative labels or fake controls;
- lower and right edges may be clipped by the media card.

## Interaction

The simulated browser window follows the pointer with restrained two-dimensional drift. The motion communicates that the media is an active prototype entry, not a flat case-study poster.

- Maximum horizontal travel: approximately 10px.
- Maximum vertical travel: approximately 6px.
- No continuous rotation or exaggerated 3D tilt.
- Use transform-only animation driven outside React render state.
- Apply a damped spring or equivalent smooth interpolation.
- Return to the centered resting position when the pointer leaves.
- The gradient stage itself remains stable.
- Hover may add a very small window scale increase, capped near `1.01`.

The media window and the existing text action both open `/demos/stt-demo/index.html` in a new tab with `noopener noreferrer`. The screenshot itself is not interactive and does not intercept pointer events.

Under `prefers-reduced-motion: reduce`, disable pointer drift and scale changes while preserving the static composition and links.

## Mobile Composition

Below 768px, stack media above copy so the product image remains the first visual signal.

- Use the existing page gutter with no page-level horizontal overflow.
- Preserve the 20px media radius.
- Keep the browser window large enough to show transcript and translation text.
- Increase the screenshot's crop toward the central speaker and transcript area.
- Allow the participant rail to fall outside the crop.
- Disable pointer-driven drift on coarse pointers and touch devices.
- Keep the text action visible without overlaying the media.

## Component Boundary

Keep `BuildLabPreview` responsible for the STT project structure and content. Isolate pointer motion in a small client-side media leaf so the static copy and section markup do not rerender on pointer movement.

Do not modify:

- the STT demo HTML, CSS, JavaScript, component library, or pinned revision;
- unrelated homepage project modules;
- Visual Archive structure or carousel logic;
- the existing STT Build Lab detail content during this change.

Update the homepage STT destination to `/demos/stt-demo/index.html` so both homepage actions use the already approved direct-demo behavior. No new STT detail page is added, and the existing registered Build Lab route remains outside this homepage redesign scope.

## Accessibility And Failure Behavior

- Give the product-stage image concise bilingual-compatible alt text describing the visible STT interface.
- Give the media link an explicit accessible name that states it opens the STT Demo in a new tab.
- Preserve keyboard focus visibility on both media and text actions.
- Reserve the media aspect ratio before image load to prevent layout shift.
- If the image fails, retain the gradient stage and browser frame without showing a broken-image icon.
- Keep all button and link text on one line at desktop sizes.

## Verification

- Component test: STT uses the new derived product-stage asset, not `/demos/stt-demo/poster.png` and not an iframe.
- Component test: media and text actions target `/demos/stt-demo/index.html` in a secure new tab.
- Component test: the section preserves one `data-project-id="stt-demo"` Build Lab entry.
- Browser test: desktop layout resolves to a 4:8 copy-to-media relationship.
- Browser test: the browser window moves within the specified bounds and returns to center after pointer leave.
- Browser test: reduced-motion mode keeps the window static.
- Browser test: `/en/` and `/zh/` render the localized copy with the same media treatment.
- Browser test: the screenshot loads and the transcript remains legible at desktop width.
- Browser test: 390px mobile has no page-level horizontal overflow, overlap, or clipped action text.
- Regression test: `/demos/stt-demo/index.html` remains fully interactive when opened directly.

## Success Criteria

The homepage shows a legible, product-first STT media card rather than a miniature landing page. The screenshot clearly communicates speaker, transcription, translation, and multi-participant context at a glance. The section feels consistent with the Codex reference's media-dominant proportions while remaining recognizably part of Yang Jing's dark portfolio.
