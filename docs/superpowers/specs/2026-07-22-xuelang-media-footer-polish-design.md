# Xuelang Media And Footer Polish

## Goal

Improve visual consistency and closing-page continuity on the bilingual Xuelang case study without changing its content structure, opening cover, evidence claims, or interaction behavior.

## Scope

### Media radius

- Keep the opening cover square-cornered.
- Apply a 20px outer radius to every other on-screen media card, including evidence figures, the before/after wipe comparison, the four-state course-entry interaction, learning-state media, the interaction board, note screens, and result evidence.
- Apply clipping at the media container so images do not receive conflicting nested radii.
- Preserve circular handles and controls inside interactive media.
- Keep print output intentional and avoid forcing oversized screen radii into PDF layouts.

### Interaction module

- Remove the standalone Chinese caption `产品画面保持完整，设计判断与行为信号由网页文字独立呈现。` and its English equivalent.
- Keep the product image and the three editable behavior-signal items.
- Replace the neutral canvas fill with a subtle light-green gradient. The gradient must remain quiet enough to preserve image contrast and text readability.

### Validation module

- In the result evidence story titled `验证设计方向，不延伸为长期承诺` and its English counterpart, render the phone image at 70% of its current media-column width and center it.
- Remove the phone image's outer border.
- Do not change the annotations, result metrics, claims, or section copy.

### Footer

- Remove `XuelangContact` from both MDX case files.
- Let the localized layout-level `SiteFooter` close the page, matching the homepage and other global routes.
- Remove unused Xuelang contact imports and update tests that currently require the case-specific contact block.

## Implementation Direction

- Prefer a Xuelang-scoped media radius token or shared selector rules over duplicating `20px` across every image.
- Use component-level exceptions for the opening cover, the interaction-board gradient, and the validation phone scale.
- Do not introduce a new media-card React abstraction for this bounded polish pass.

## Responsive Behavior

- Desktop remains the primary visual target.
- At mobile widths, media cards retain the 20px outer radius without horizontal overflow.
- The validation phone remains at 70% width and centered unless that would make it unusably small; its intrinsic aspect ratio is preserved.
- Interactive controls retain at least 44px hit targets.

## Verification

- Component tests confirm the interaction caption is absent and the case-specific contact block is removed.
- CSS-level regression checks confirm the 20px media radius, light-green interaction gradient, and 70% validation image rule.
- Browser checks cover 1440x900 and 390x844, including wipe interaction, course-entry interaction, validation media sizing, global footer presence, and horizontal overflow.
- Full unit tests, lint, production build, and Xuelang E2E/visual suites must pass before implementation is committed.

## Out Of Scope

- Opening-cover artwork or radius changes.
- Copy, evidence, metric, or navigation changes.
- Global footer redesign.
- Refactoring all portfolio media into a new shared React component.
