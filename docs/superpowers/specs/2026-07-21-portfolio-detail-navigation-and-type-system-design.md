# Portfolio Detail Navigation and Type System

Date: 2026-07-21
Status: Approved design, awaiting written-spec review

## Goal

Make every portfolio detail page feel like part of one portfolio system without forcing project stories into one visual template.

The shared system owns navigation, interaction color semantics, and editorial heading hierarchy. Each project continues to own its information architecture, content rhythm, media treatment, and bespoke storytelling components.

## Scope

This change applies to all localized `work` and `build` detail routes and their shared navigation components.

It includes:

- two semantic color themes for the shared top navigation;
- one neutral and purple chapter-navigation treatment across detail pages;
- removal of project blue, green, and orange from portfolio-owned UI and editorial accents;
- a consistent heading scale, weight, and line-height for case-study H1, section H2, and ordinary narrative H3 headings;
- responsive and keyboard states for the affected navigation.

It does not include:

- converting Call Agent, Meeting, Xuelang, or other cases to one body template;
- changing each case's content order, grids, media composition, scroll choreography, or bespoke components;
- recoloring brand colors visible inside real screenshots, videos, posters, or product evidence;
- normalizing display typography inside simulations, interactive stages, data statements, or other intentionally bespoke visual modules.

## Shared Top Navigation

The top navigation keeps one DOM structure, one capsule geometry, and one scroll transition. Color is controlled by semantic surface tokens rather than project names.

### Dark surface

- At the top: transparent background with light text.
- After scroll: translucent near-black capsule, light text, subtle light border, and dark shadow.
- Mobile disclosure: the same dark surface tokens.

### Light surface

- At the top: transparent background with near-black text.
- After scroll: translucent light capsule, black-gray text, subtle dark border, and restrained neutral shadow.
- Mobile disclosure: the same light surface tokens.

Both themes use the portfolio purple for hover and keyboard focus. The geometry, spacing, radius, blur, and morph timing remain identical.

Each detail route uses the token set that matches its real opening surface. Call Agent, Meeting, and Xuelang currently declare the light treatment; base-layout cases such as STT Demo and Tangping retain the dark treatment. The portfolio home also retains its dark treatment. Adding a new case therefore requires an explicit surface decision rather than assuming that every detail page is light.

Suggested component-level tokens:

- `--header-fg`
- `--header-separator`
- `--header-capsule-bg`
- `--header-capsule-border`
- `--header-capsule-shadow`
- `--header-menu-bg`

## Shared Chapter Navigation

`ChapterNav` remains the single component used by all detail layouts.

The component accepts a semantic `light` or `dark` surface. Both surfaces share structure, opacity, weight, and interaction behavior; only neutral ink, iris contrast, disclosure background, and border tokens change.

Desktop behavior:

- remove the top border, row dividers, and active vertical rule;
- use one neutral ink color independent of the current project's palette;
- inactive links use approximately 48% opacity;
- the active link uses full opacity and a slightly stronger weight;
- hover and keyboard focus use the portfolio purple;
- transitions change color and opacity without moving the layout.

Responsive behavior:

- preserve the compact disclosure interaction;
- use neutral ink and purple interaction states consistently;
- retain only the container borders needed to distinguish the expanded mobile menu from the page;
- do not reintroduce project-specific colors.

The navigation remains accessible through its existing semantic `nav`, `aria-current`, minimum target sizes, and keyboard-operable disclosure.

## Portfolio Color Semantics

Portfolio-owned controls and editorial accents use only neutral colors plus the existing iris purple family. Blue, green, and orange must not be used to color generic links, eyebrows, navigation states, focus states, or reusable case-study labels.

This rule applies inside the body as well as in the shared shell. It does not recolor media or the UI visible inside product evidence.

The existing `--color-iris-luminous` is optimized for dark surfaces. Light-surface interaction text should use a deeper iris token with sufficient contrast, such as the existing `--color-iris-deep`, while dark surfaces may continue to use the luminous iris. Focus indicators must remain visibly distinct from hover alone.

## Editorial Heading System

The cases keep their own layouts, but their main editorial hierarchy uses shared metrics:

| Level | Size | Weight | Line height | Use |
| --- | --- | --- | --- | --- |
| H1 | `clamp(3.25rem, 5vw, 5.5rem)` | `600` | `1.06` | Case title |
| H2 | `clamp(2.2rem, 4vw, 4.5rem)` | `600` | `1.16` | Main narrative section title |
| H3 | `clamp(1.25rem, 2vw, 1.75rem)` | `600` | `1.28` | Ordinary narrative subsection title |

These values replace the currently inconsistent H2 line heights of approximately `1.02–1.08`, creating more breathing room for multi-line Chinese headings while retaining strong display scale.

The metrics should be exposed as shared case-study tokens and consumed by each layout's editorial selectors. Bespoke modules may override them only when the text is functioning as interface content, a data display, or a deliberately art-directed statement rather than a normal narrative heading.

Body paragraphs keep their existing readable line heights. This change does not impose one paragraph style across all cases.

## Component Boundaries

- `SiteHeader` determines the semantic surface from the known page surface and exposes it through `data-surface`.
- `site-header.module.css` maps each surface to the shared header tokens and consumes those tokens in every state, including scrolled and mobile states.
- `ChapterNav` keeps its behavior; its CSS becomes project-independent.
- Global case-study heading tokens provide consistent metrics.
- Each detail layout adopts those tokens only for editorial H1/H2/H3 selectors and preserves its own layout rules.

No new context provider or page template is required for this scope.

## Verification

Automated checks should cover:

- Call Agent, Meeting, and Xuelang resolve to the light header surface;
- base-layout details such as STT Demo and Tangping, plus the home route, resolve to the dark header surface;
- light and dark headers define distinct capsule, foreground, menu, border, and shadow tokens;
- the chapter navigation has no desktop row dividers or active vertical rule;
- inactive, active, hover, and focus states use neutral/iris semantics rather than cobalt or project colors;
- shared heading tokens contain the approved sizes, weights, and line heights;
- representative layouts consume the shared editorial heading tokens.

Visual browser checks should include Call Agent, Meeting, Xuelang, and one base-layout case at desktop and mobile widths. Verify initial and scrolled header states, chapter hover/current states, expanded mobile navigation, multi-line Chinese headings, and the absence of unintended layout shifts.

## Success Criteria

- The top navigation is readable immediately on every light detail page and keeps the same capsule behavior across themes.
- Moving between detail pages no longer changes the left navigation's color language or structural decoration.
- Portfolio-owned body accents no longer appear blue, green, or orange.
- Main editorial headings have consistent size, weight, and spacing without forcing project bodies into a shared template.
- Product media retains its authentic source colors and every case keeps its distinct narrative composition.
