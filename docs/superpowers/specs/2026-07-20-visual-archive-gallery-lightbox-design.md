# Visual Archive Gallery Lightbox Design

## Scope

Turn the existing single-image Lightbox for `Doudou Fox` and `MR CHONG` into responsive multi-image galleries without adding independent project routes. The Visual Archive carousel, card order, cover treatment, hover behavior, and the other two archive entries remain unchanged.

The experience is bilingual at the interface level. The supplied artwork remains Chinese in both locales and is not translated, cropped, or reconstructed.

## 1. Evidence And Gaps

- **Fact:** The homepage currently publishes four real Visual Archive cards and opens a single cover image in a Lightbox.
- **Fact:** The designer supplied seven approved Doudou Fox images and four approved MR CHONG images.
- **Fact:** The designer selected a fullscreen Lightbox rather than independent detail pages.
- **Fact:** Desktop uses one image per page; mobile uses a vertical image stack.
- **Fact:** Image artwork contains Chinese text and is shared by both `/zh/` and `/en/`.
- **Gap:** There is no corroborated outcome evidence for either project. The gallery must not add impact claims or metrics.
- **Recommendation:** Treat the gallery as visual evidence, not a compressed case-study narrative.

## 2. Positioning

**Recommendation:** Present Doudou Fox and MR CHONG as concise visual proof of interface, illustration, character, and 3D craft inside the secondary Visual Archive.

Scope line: the supplied images demonstrate project artifacts; exact ownership boundaries and shipped outcomes are not independently corroborated in this gallery.

## 3. Experience Architecture

1. The user reaches the existing Visual Archive carousel on the homepage.
2. Clicking the Doudou Fox or MR CHONG cover opens a fullscreen dialog without navigating away.
3. Desktop displays one uncropped image at a time with previous/next controls, keyboard navigation, and a stable counter.
4. Mobile displays all approved images vertically in the same dialog, using natural document scrolling.
5. Closing the dialog restores the homepage scroll position and keyboard focus to the original card trigger.

No URL route, browser-history entry, or project-detail navigation is introduced.

## 4. Visual Direction

- Use a near-black fullscreen surface so the original white, orange, yellow, and charcoal artwork remains dominant.
- Keep the overlay UI restrained: project title, current/total count, close button, and desktop previous/next controls only.
- Controls use the existing site icon language and high-contrast focus rings.
- Desktop artwork fits within the viewport without cropping and preserves its source aspect ratio.
- Mobile artwork spans the usable width with narrow, consistent gutters and vertical spacing.
- Do not add captions, cards, gradients, translations, decorative borders, or portfolio claims over the images.

## 5. Visual Asset Plan

All sources are converted to high-quality WebP and stored under project-specific folders in `public/images/archive/details/`.

### Doudou Fox, 7 images

| Order | Source | Communication job |
| --- | --- | --- |
| 01 | `Frame 1312316551.jpg` | Establish the product and design goal |
| 02 | `Frame 1312316552.jpg` | Show the design framework |
| 03 | `Frame 1312316568.jpg` | Explain the tiered task system visually |
| 04 | `Frame 1312316571.jpg` | Show the reward spectrum and visual assets |
| 05 | `Frame 1312316572.jpg` | Show growth props and changing environments |
| 06 | `Frame 1312316586.jpg` | Show the entry, task visibility, and stopping behavior |
| 07 | `Frame 1312316575.jpg` | Close with the complete end-to-end experience |

### MR CHONG, 4 images

| Order | Source | Communication job |
| --- | --- | --- |
| 01 | `虫虫11.jpg` | Establish emotion and character direction |
| 02 | `虫虫14.jpg` | Show posture and personality exploration |
| 03 | `虫虫12.jpg` | Show the character in a travel scene |
| 04 | `虫虫15.jpg` | Close with the strongest final 3D rendering |

`虫虫13.jpg` is intentionally excluded because its QR code and presentation-board density weaken the final gallery sequence.

## 6. Screen-Level CPDI

### Doudou Fox gallery

- **Context:** A hiring reviewer opens a secondary visual project from the homepage archive.
- **Problem:** A single cover cannot communicate the breadth of the learning-task and reward experience, while a full case study would overstate this archive item's role.
- **Decision:** Show seven selected artifacts as a controlled gallery, preserving the supplied sequence and artwork.
- **Impact:** **Intended effect:** reviewers can scan the design system and final experience without leaving the homepage context. **Gap:** no usage evidence is available.

### MR CHONG gallery

- **Context:** A reviewer wants to inspect the progression from character direction to final 3D expression.
- **Problem:** The current cover only shows the final character and hides the range of craft.
- **Decision:** Show four selected artifacts from direction, posture, scene, and final rendering.
- **Impact:** **Intended effect:** the sequence demonstrates visual and 3D range. **Gap:** no production or brand outcome evidence is available.

## 7. Three-Minute Narrative

**Status:** Not embedded in this feature. The Visual Archive is intentionally a fast visual layer rather than a spoken case-study narrative.

## 8. Ten-Minute Deep Dive

**Status:** Not embedded in this feature. Deep-dive analysis remains the responsibility of the core portfolio cases.

## 9. Interview Questions

**Status:** Not displayed in the gallery. The selected artifacts can support questions about learning motivation, reward-system design, character direction, and 3D craft, but the UI must not invent answers or ownership claims.

## 10. Hiring-Manager Evaluation

- **Demonstrated strength:** visual craft, system consistency, interface presentation, character direction, and 3D expression.
- **Credibility risk:** Chinese-only artwork on the English locale and limited role/outcome evidence.
- **Mitigation:** keep English interface labels clear, preserve the artwork honestly, and avoid unsupported claims.
- **Priority:** optimize image legibility and gallery ergonomics rather than adding more explanatory slides.

## Component And Data Design

- Extend the existing Lightbox into a backward-compatible gallery contract or add a focused gallery wrapper that reuses its dialog behavior.
- Add an optional ordered gallery collection to real archive entries. An entry with no gallery continues to use the current single-image behavior.
- Keep the Visual Archive carousel state and scroll logic untouched.
- Use one semantic dialog with `aria-modal="true"`, an accessible project label, and announced position text.
- Lock document scrolling while open and restore it on close.
- Restore focus to the opening trigger after Escape, close-button activation, or backdrop dismissal.

## Responsive Behavior

### Desktop and tablet landscape

- One image is visible at a time.
- `ArrowLeft` and `ArrowRight` change images; `Escape` closes.
- Previous/next buttons remain in stable viewport positions and disable at sequence boundaries.
- The counter reads `01 / 07` or `01 / 04`.
- Images use `object-fit: contain`; no content is cropped.

### Mobile

- All images render in a vertical stack inside the fullscreen dialog.
- The close control remains sticky at the top; the project title remains readable without covering artwork.
- The dialog uses native vertical scrolling; horizontal swipe navigation is disabled.
- No page-level horizontal overflow is allowed at 390px.

## Loading And Failure Behavior

- Convert source JPEGs to visually lossless WebP at dimensions appropriate for high-density desktop displays.
- Eager-load the first gallery image after opening and lazy-load the remaining images.
- Desktop may preload the adjacent image after the current image is ready.
- If an image fails, preserve the gallery controls and show localized fallback alt text rather than collapsing the dialog.
- Respect `prefers-reduced-motion`; gallery changes become immediate without sliding animation.

## Validation

- Both galleries open from `/zh/` and `/en/`.
- Doudou Fox contains exactly seven images in the approved order.
- MR CHONG contains exactly four images in the approved order.
- Desktop controls, counter, Escape, focus restoration, and boundary states work.
- Mobile shows a vertical stack and retains a reachable close control.
- Images remain uncropped and readable at desktop and 390px widths.
- Opening or closing a gallery does not move the Visual Archive carousel or lose the homepage scroll position.
- The existing Tangping and Open Language behaviors remain unchanged.
- Component tests, E2E tests, ESLint, and the Next.js build pass.
