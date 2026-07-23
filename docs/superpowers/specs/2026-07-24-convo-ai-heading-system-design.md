# Convo AI Detail Heading System Design

Date: 2026-07-24
Branch: `codex/case/convo-ai-build`
Status: Approved in conversation

## Objective

Bring the Convo AI case study onto the same semantic typography standard as the other portfolio detail pages without flattening its black cinematic identity. Every readable text role must use the shared system; Convo-specific oversized type may remain only when it is a decorative presentation layer rather than a competing content hierarchy.

## Scope

This change covers the Chinese and English Convo AI detail pages, their custom layout and media styles, print styles, and regression tests. It does not change case-study copy, evidence claims, information architecture, imagery, color palette, motion direction, or other case-study branches.

The implementation must preserve the existing untracked `.playwright-cli/`, `output/`, and `tsconfig.tsbuildinfo` items and must not include them in commits.

## Shared Semantic Roles

Convo AI must consume the shared case-study typography tokens directly for these readable roles:

| Role | Desktop target | Intended use |
| --- | ---: | --- |
| Project | 58px | Case-study project title |
| Chapter | 50px | Primary numbered chapter heading |
| Narrative | 36px | Major argument or decision heading inside a chapter |
| Media | 29px | Heading attached to a media explanation or product showcase |
| Card | 22px | Repeated principle, problem, or supporting card heading |

The implementation must also inherit the shared weights, line heights, maximum readable widths, responsive behavior, and rhythm tokens, including:

- `--case-index-title-gap: 0.75rem`
- `--case-title-body-gap: 1.5rem`

Convo-specific selectors must not restate independent typography values for these roles.

## Cinematic Presentation Layer

The existing black canvas, green accents, Outfit typeface, asymmetrical composition, media treatment, and motion remain part of the Convo AI identity.

Oversized chapter numerals may remain as background display graphics under these constraints:

- They are visually subordinate to the real chapter heading.
- They do not determine layout dimensions or replace readable labels.
- They are excluded from the accessibility tree with `aria-hidden` or equivalent semantics.
- They do not create duplicate text in print or automated heading navigation.

The immersive `ConvoAI` wordmark inside the product stage may remain as a compositional element. The page must still expose a real project-title role that uses the shared project typography standard.

## Role Mapping

The custom Convo AI layout will map actual rendered elements rather than relying on shared-layout selectors that the page does not use:

- Chapter `h2` elements map to the shared chapter role.
- `.convo-subheading` maps to the shared narrative role.
- Repeated principle and problem card `h3` elements map to the shared card role.
- Media explanation and showcase headings map to the shared media role when they function as module titles.
- Product controls, mode labels, buttons, and screenshot-native text remain component UI, not case-study headings.
- Decorative stage typography remains outside the semantic role scale and cannot substitute for a real heading.

Any ambiguous media heading must be classified by its communication job, not by its current HTML tag or current visual size.

## Responsive Behavior

The shared typography scale remains authoritative at desktop, tablet, and mobile breakpoints. Convo AI may adapt composition, stacking, and decorative numeral placement, but it may not introduce a separate mobile heading scale.

At `1440px`, `1024px`, and `390px`, both languages must maintain:

- No clipped or overlapping headings.
- Clear separation between decorative numerals and readable text.
- Consistent index-to-title and title-to-body spacing.
- Comfortable line lengths without weakening the desktop-first composition.
- Stable media and motion framing when titles wrap.

## Print And PDF

Print output uses the shared fixed role mapping:

| Role | Print size |
| --- | ---: |
| Project | 31pt |
| Chapter | 24pt |
| Narrative | 18pt |
| Media | 14pt |
| Card | 11pt |

Decorative oversized numerals and stage-only effects must not dominate or duplicate the print hierarchy. Existing print behavior for motion and media chrome remains intact.

## Integration Strategy

Merge the current `codex/shared/integration` tip into `codex/case/convo-ai-build`, then resolve the old shared-system test expectations in favor of the approved semantic system. Preserve all existing Convo AI branch work and make Convo-specific adaptations only in its custom layout, media, print, content semantics where necessary, and tests.

This work must not modify Xuelang, STT, Call Agent, or other deferred case branches.

## Verification

Testing must verify behavior at the actual Convo AI custom selectors and rendered elements:

- Shared token values and rhythm remain correct after integration.
- Project, chapter, narrative, media, and card roles consume the intended tokens.
- Role weight, line height, maximum width, index/title gap, and title/body gap are tested in addition to font size.
- Decorative numerals are not exposed as duplicate semantic headings.
- Chinese and English heading structure remains valid.
- Print role sizes match the fixed shared mapping.
- Visual regression checks cover `1440px`, `1024px`, and `390px` for both locales.
- Existing Convo AI component and end-to-end behavior continues to pass.

## Acceptance Criteria

The change is complete when:

1. All readable Convo AI detail-page typography uses the same semantic role system as the other core detail pages.
2. Convo AI retains its cinematic identity only through non-semantic presentation choices.
3. No heading overlaps, clips, duplicates, or loses hierarchy in either language at the required viewports.
4. Web and print output preserve the same role relationships.
5. Automated tests cover Convo AI's real custom selectors and pass with the existing case-study suite.
6. No unrelated branch content or existing untracked output is included in the change.

## Evidence Boundary

This specification changes presentation and technical consistency only. It does not add, strengthen, or rewrite portfolio outcome claims, so it introduces no new evidence assertions.
