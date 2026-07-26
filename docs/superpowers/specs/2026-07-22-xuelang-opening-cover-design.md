# Xuelang Opening Cover Design

## Goal

Add the supplied `20220693.png` artwork as the first-screen cover of the Xuelang case study. The cover should establish the project's visual identity before the reader enters product evidence, while keeping the existing product panorama and all later chapters intact.

## Evidence And Communication Job

- **Fact:** The supplied artwork is a 1920×1080 PNG containing the Xuelang project title composition and the period label `2022/03-4`.
- **Recommendation:** Use it to orient the reviewer and establish project character. It is a cover artifact, not evidence for research, ownership, shipping, or outcomes.
- **Recommendation:** Keep the coded project title, proposition, role, duration, and verified result signal available as readable HTML rather than relying on text embedded in the image.
- **Designer-approved correction:** Update the coded project duration to `2022.03–04 · 2 个月` in Chinese and `Mar–Apr 2022 · 2 months` in English so the visible metadata agrees with the supplied cover.

## Approved Structure

The opening becomes two distinct stages inside the existing Xuelang case column:

1. **First screen — cover and project identity**
   - Display the complete 16:9 artwork without cropping.
   - Place a compact coded information band directly below it.
- The information band contains the project title, proposition, role, duration, and existing result signal.
   - This replaces the current oversized title block so the title is not repeated at equal visual weight.
2. **Second screen — product evidence**
   - Keep the existing four-state product panorama unchanged.
   - Position it after the first-screen cover rather than inside the first-screen header.
   - Keep the existing chapter content, navigation, images, copy, and evidence order unchanged.

The left chapter rail and centered page frame remain unchanged. No full-page background image is introduced.

## Visual Treatment

- Preserve the artwork's full 16:9 composition using `width: 100%`, `height: auto`, and no `object-fit: cover` crop.
- Use the existing Xuelang paper, ink, green, border, and typography tokens.
- Keep the information band flat and editorial: one subtle divider, no floating card, no gradient, and no decorative shadow.
- Use a smaller coded heading than the former hero headline because the supplied artwork already carries the dominant display typography.
- Keep the result signal factual and unchanged.

## Responsive Behavior

- **Desktop:** The cover fills the case-study column width. The information band uses a title/proposition area plus a compact facts grid, fitting with the cover inside the first viewport at the primary 1440×1000 review size.
- **Tablet:** The facts grid may wrap to two rows while the artwork remains uncropped.
- **Mobile:** The cover remains 16:9 and full width. The information band becomes a single-column title block followed by a two-column facts grid; long English text wraps without horizontal scrolling.
- Web desktop quality remains the priority. Mobile behavior protects legibility without reducing the desktop composition.

## Motion

- Reuse the existing Xuelang hero entrance system for the coded title and supporting information.
- Keep the current panorama reveal behavior, now triggered as the second-stage product evidence enters view.
- Respect `prefers-reduced-motion`; do not add a new animation dependency.

## Print

- The PDF first page contains the cover artwork and coded project information.
- The product panorama remains printable after the cover instead of being removed.
- The cover uses `object-fit: contain` and avoids page clipping.

## Assets

- Add a semantic source asset under `evidence/xuelang/source/`.
- Generate a WebP publication asset under `public/images/xuelang/` using the repository's existing Xuelang asset preparation pipeline.
- Add a manifest record with the supplied 1920×1080 intrinsic dimensions and bilingual alt text.
- Do not overwrite the homepage Xuelang cover or any existing hero-state image.

## Verification

- Component tests confirm the cover image, coded title, project facts, and separate four-state panorama.
- Asset tests confirm the semantic source, output path, and 1920×1080 dimensions.
- Browser checks confirm the cover is visible in the first desktop viewport, the panorama follows it, and desktop/mobile pages have no horizontal overflow.
- Print inspection confirms the cover is present and uncropped on page one.
- Run the focused Xuelang tests, complete Vitest suite, ESLint, production build, and `git diff --check` before committing.

## Scope Boundary

This change affects only the Xuelang case-study opening and its new cover asset. It does not change homepage cards, other projects, chapter copy, metrics, interaction evidence, or contact/footer content.
The only copy change is the approved bilingual Xuelang duration correction.
