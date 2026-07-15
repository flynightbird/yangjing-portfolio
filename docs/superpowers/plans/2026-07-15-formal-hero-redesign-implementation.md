# Formal Hero Redesign Implementation Plan

## Goal

Replace only the homepage Hero with the approved dark-first Material Blueprint direction while preserving every module below it.

## Implementation

1. Update the Hero component contract tests to require the approved portrait, an accessible adjustable separator, two equal-weight role headings, and no draft portrait state.
2. Add a focused client-side Hero scene that owns pointer dragging, keyboard adjustment, magnetic settling, Builder scan triggers, five-second reset, and reduced-motion behavior.
3. Render the portrait twice in perfect alignment so the Designer field can show color while the Builder field shows a darker grayscale treatment.
4. Build the Designer field from restrained material planes, a Bezier construction path, and control nodes. Build the Builder field with a canvas grid, code fragments, parallax, and a diagonal volumetric scan.
5. Replace only the Hero selectors at the top of `home.module.css`; leave all project, archive, and about selectors unchanged.
6. Add the approved temporary transparent portrait asset under `public/images/profile/`.
7. Verify focused unit tests, lint, framework build, desktop and mobile rendering, drag and keyboard operation, scan triggers, timed reset, reduced motion, image loading, console output, and horizontal overflow.
8. Commit the focused changes on `codex/hero-redesign`.

## Constraints

- Do not modify `FeaturedWork`, `VisualArchive`, `AboutPreview`, publication validation, or project content.
- Keep `Yang Jing` as the single H1 and the two roles as H2 headings.
- Keep both role headings on two explicit lines with equal visual weight.
- Under reduced motion, keep the final visual fields visible without scan or timed reset animation.
