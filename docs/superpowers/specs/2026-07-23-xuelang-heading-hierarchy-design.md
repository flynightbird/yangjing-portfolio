# Xuelang Heading Hierarchy Design

## Goal

Make headings with the same visual role use the same responsive size and line height, while preserving deliberate differences between chapter titles, narrative module titles, card titles, and media-stage titles.

## Approved Direction

Use visual roles rather than raw HTML heading tags as the source of typographic hierarchy.

- Chapter titles (`.section-heading h2`) remain unchanged at `clamp(2rem, 3.5vw, 4rem)` with `1.08` line height.
- Large narrative module titles use `clamp(1.8rem, 3vw, 3.25rem)` with `1.08` line height.
- Apply the large narrative module title treatment to evidence-story titles, learning-state titles, and the final reflection title.
- Problem-card titles remain `1.5rem`; they are compact card labels rather than narrative module titles.
- The active course-entry media title remains an in-media heading and retains its current H4 treatment.

## Implementation Scope

Update only the Xuelang CSS selectors responsible for large narrative module titles:

- `components/xuelang/xuelang-evidence.module.css`
  - `.storyCopy > h3`
  - `.learningStates h3`
- `components/xuelang/xuelang-layout.module.css`
  - `.content :global(.xuelang-reflection h3)`

Do not change MDX content, heading elements, chapter headings, problem cards, course-entry media headings, print styles, other case studies, or shared site typography.

## Responsive Behavior

At desktop widths, all large narrative module titles resolve to the same computed size and `1.08` line height. Existing clamp behavior continues to reduce the type on smaller viewports without introducing overflow or changing the chapter-title hierarchy.

## Verification

- Add a focused CSS regression test for the shared size and line-height declarations.
- Verify computed styles at 1440px for representative story, learning-state, and reflection headings.
- Confirm problem-card and course-entry media heading sizes are unchanged.
- Confirm Chinese and English pages have no horizontal overflow.
- Run the focused Xuelang tests and full unit suite before completion.
