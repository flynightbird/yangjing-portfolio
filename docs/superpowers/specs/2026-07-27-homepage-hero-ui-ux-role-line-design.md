# Homepage Hero UI/UX Role Line Design

## Goal

Clarify the designer identity in the homepage hero without changing its layout logic, motion, imagery, or the builder-side content.

## Scope

- Apply to the Chinese and English homepage hero only.
- Restore the Chinese designer summary to: `专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。`
- Keep the existing English designer summary: `Designing at consumer scale and across complex AI and B2B systems.`
- Add a separate localized line below the designer summary:
  - Chinese: `UI / UX 设计师`
  - English: `UI / UX Designer`
- Keep approximately one body-line of vertical space between the summary and the new role line.
- Match the new line's font size and color to the designer summary.

## Implementation

- Add a localized hero dictionary field for the new role line.
- Pass that field through `DualIdentityHero` into `HeroMotion`.
- Render it as a separate paragraph after the designer summary.
- Add a dedicated class for spacing while inheriting the existing summary typography and color.
- Preserve responsive behavior at all existing breakpoints. At the narrow breakpoint where hero body copy is intentionally hidden, hide both the summary and role line together.

## Out Of Scope

- Do not change any homepage buttons or links.
- Do not change the AIDX or STT modules.
- Do not change the builder summary, hero motion, imagery, or overall layout.

## Verification

- Component tests confirm both localized summaries and role lines.
- Browser checks confirm the role line is visible without overlap on desktop and tablet, and remains hidden with the existing hero body copy on narrow mobile layouts.
- Existing homepage tests continue to pass.
