# Xuelang Evidence And Visual Polish Design

## Objective

Raise the Xuelang case study from a strong editorial document to an inspectable senior-design case. The order of priorities is visual quality, reading clarity, and precise composition. Desktop web is the primary canvas; smaller layouts must remain usable without weakening the desktop art direction.

## Approved Direction

Use the existing cinematic editorial shell and rebuild the evidence layer. Presentation-board explanations become localized HTML. Real product UI is exported from independent Figma nodes or tightly cropped from source boards. Full original boards remain available only where they add audit value.

The signature device is an evidence track: each design decision is paired with a large product state, a short decision annotation, and the verified signal it influenced. Green is reserved for evidence and validation; the rest of the page stays quiet and typographic.

## Hero

- Keep the two-zone desktop thesis and panorama.
- Replace the generic status fact with a concise verified proof: the 14-day experiment and relative GMV-per-user lift.
- Keep the PDF action in the hero and disclose its approximate size until the generated files are reduced.
- Preserve a meaningful panorama slice in the first desktop viewport.

## Evidence Reconstruction

- Quality standard: pair the HTML standard map with an independently exported course-detail state. Explain teacher credibility, structure, outcomes, and platform guarantee outside the image.
- Purchase decision: replace presentation-board screenshots with three product states showing the control, review evidence, and selected hero-trial experience. Make the selected state visually dominant.
- Learning sequence: use an independent learning-entry screen, retain the dark comparison as a chapter interruption, and crop three note-related product states from the original Figma board.
- Results: keep verified values in HTML and pair them with the relevant selected product state rather than a text-heavy result board.
- Every evidence trigger must show an always-visible expand cue, not only a cursor change.

## Editorial Rhythm

- Keep the chapter grid, but vary the composition by reasoning type: diagnostic list, strategy thesis, standard map, controlled experiment, progressive sequence, and result summary.
- Shorten the English strategy thesis and reduce only its English display scale by roughly 25 percent.
- Avoid nested cards, decorative phone mockups, generic metric strips, and repeated full-width 16:9 boards.
- Keep image labels short; captions explain one decision only.

## Responsive And Accessibility

- At 1100px and below, make the chapter rail itself sticky and render the open index as an overlay so it does not push the case downward.
- Preserve desktop-first image scale while stacking evidence at narrower widths.
- Raise small green labels on light surfaces and blue labels on dark surfaces to at least 4.5:1 contrast.
- Add localized case-specific document titles.
- Preserve keyboard-operable lightboxes, visible focus, reduced motion, print isolation, and no horizontal overflow.

## Assets

Source file: Figma `STUOWO6MG2rUvwcLlvJdFK`, page `0:1`.

- `1:2548`: quality course-detail state.
- `1:8351`: purchase experiment control.
- `1:9145`: review-evidence state.
- `1:8753`: selected hero-trial state.
- `1:3220`: learning-entry state.
- `1:11618`: source board for three note-related crops.

Store original exports in `evidence/xuelang/figma/` and web-ready derivatives in `public/images/xuelang/`. Maintain a mapping guide so every public image can be replaced later without changing page copy.

## Validation

- Component tests verify proof placement, evidence-story structure, expand cues, localized metadata, and PDF size disclosure.
- Playwright verifies the 1024px sticky overlay, desktop evidence scale, English strategy height, overlap, overflow, image loading, and localized title.
- Capture Chinese and English at 1024x768, 1280x800, 1440x900, and 1728x1080.
- Run lint, unit tests, production build, interaction tests, and PDF contract verification.

