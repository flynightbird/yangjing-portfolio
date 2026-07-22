# Meeting Clean Product Showcase Design

## Goal

Turn the Meeting case study into a recruiter-scannable product showcase by removing production notes and expandable rationale while preserving the product story, shipped interface evidence, and future video replacement path.

## Approved Scope

- Remove every `DeepDive` block and the reusable `DeepDive` component.
- Remove the hero evidence disclosure.
- Remove pending-source and temporary-media captions from static fallbacks.
- Remove the provisional portrait/landscape evidence section.
- Remove the `Verified here / Not claimed` evidence table.
- Remove Meeting-specific previous/next project navigation.
- Keep product chapter titles, one-line arguments, product models, shipped proof, role ownership, and working media components.
- Let the global `SiteFooter` from the localized layout follow the Meeting case directly.

## Content Behavior

Static media remains visible while recordings are unavailable, but it carries only product-relevant descriptions. Internal production status is not exposed on the page. When validated recordings are supplied, the existing Product Film components replace the static media without changing the narrative structure.

## Verification

Unit and component tests must assert the absence of disclosures, deep dives, provisional orientation evidence, evidence-boundary tables, and project-neighbor navigation in both locales. Browser tests must retain responsive geometry, media fallback, accessibility, and global footer coverage.
