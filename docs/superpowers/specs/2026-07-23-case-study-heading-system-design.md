# Case Study Heading System Design

**Status:** Approved for implementation

**Date:** 2026-07-23

**Scope:** Xuelang, Call Agent, STT Demo, and Meeting case-detail pages in Chinese, English, and PDF output. Convo AI is intentionally deferred until its current uncommitted work is committed.

**Supersedes:** `2026-07-23-xuelang-heading-hierarchy-design.md`. The earlier document described only Xuelang. This document is the source of truth for heading hierarchy across case studies.

## Objective

Create one readable visual hierarchy across the portfolio's core case studies without flattening their individual identities. Equivalent content roles must have the same size, weight, line height, title width, and vertical rhythm. Each case retains its own font family, accent color, background, imagery, and decorative treatment.

The system is based on semantic visual roles rather than HTML heading tags. A title's role determines its presentation even when the document outline requires a different `h1`-`h4` element.

## Visual Roles

| Role | Desktop target at 1440px | Fluid Web size | Weight | Line height | Maximum width |
| --- | ---: | --- | ---: | ---: | ---: |
| Project title | 58px | `clamp(2.5rem, 4.03vw, 3.625rem)` | 600 | 1.06 | 18ch |
| Chapter title | 50px | `clamp(2.125rem, 3.47vw, 3.125rem)` | 600 | 1.12 | 20ch |
| Narrative/module title | 36px | `clamp(1.75rem, 2.5vw, 2.25rem)` | 600 | 1.18 | 22ch |
| Media title | 29px | `clamp(1.375rem, 2.01vw, 1.8125rem)` | 600 | 1.16 | 18ch |
| Card title | 22px | `clamp(1.125rem, 1.53vw, 1.375rem)` | 600 | 1.35 | 28ch |

These values make the hierarchy visibly stepped at wide desktop sizes while preserving a restrained mobile scale. Font sizes do not grow beyond the desktop targets, so very wide screens gain whitespace rather than oversized typography.

## Shared Tokens

The global stylesheet owns semantic case-study tokens for every role:

- `--case-project-title-*`
- `--case-chapter-title-*`
- `--case-narrative-title-*`
- `--case-media-title-*`
- `--case-card-title-*`

Each group exposes size, weight, line height, and maximum width. Shared rhythm tokens define `0.75rem` from an index or eyebrow to its title and `1.5rem` from a title to its supporting copy.

The existing `--case-h1-*`, `--case-h2-*`, and `--case-h3-*` variables become compatibility aliases during this rollout. New and migrated selectors consume the role tokens directly; the aliases prevent unrelated or deferred pages from changing unexpectedly.

## Role Mapping

The shared `CaseLayout` maps the hero title, section headings, narrative headings, media headings, and card headings to their corresponding role tokens. This covers Call Agent and STT Demo wherever they use the shared case-study layout.

Meeting keeps its dedicated layout and visual theme, but its hero, chapter, and module selectors consume the same semantic tokens. Meeting-specific font and color variables remain untouched.

Xuelang remains a custom layout. Its role mapping is:

- Hero title: project title
- `.section-heading h2` and direct chapter `h2`: chapter title
- `.storyCopy > h3`, `.learningStates h3`, and `.xuelang-reflection h3`: narrative/module title
- `.stageCopy h4` and equivalent evidence-stage headings: media title
- `.xuelang-problem-list h3` and compact repeated-item headings: card title

Editorial display statements, formulas, metrics, and oversized data figures are not headings and remain case-specific. This prevents the shared type scale from weakening intentional visual moments.

## Responsive Behavior

The fluid tokens apply from mobile through desktop. The minimum values are the mobile sizes and the maximum values are the approved 1440px targets. No viewport-specific override may enlarge a role beyond its shared maximum.

Long Chinese and English titles wrap within the role's maximum width. Existing case layouts may position that title differently, but they must not override its shared size, weight, or line height. Labels, body copy, captions, and metrics remain outside this system.

## PDF Hierarchy

Print styles use fixed point values so exported PDFs remain predictable:

| Role | PDF size | Weight | Line height |
| --- | ---: | ---: | ---: |
| Project title | 31pt | 600 | 1.06 |
| Chapter title | 24pt | 600 | 1.12 |
| Narrative/module title | 18pt | 600 | 1.18 |
| Media title | 14pt | 600 | 1.16 |
| Card title | 11pt | 600 | 1.35 |

Shared print rules provide the default values. Xuelang and Meeting may keep layout-specific pagination and break rules, but their heading sizes must map to this table. PDF verification covers both Chinese and English exports where generation scripts exist.

## Rollout Strategy

Implementation starts on `codex/shared/case-heading-system`, based on the clean `codex/shared/integration` branch. One focused commit introduces the tokens and shared layout mappings; a second commit maps custom Meeting and Xuelang selectors and updates print rules.

After targeted tests and visual verification pass, the first synchronization wave contains only the worktrees that are currently clean:

1. `codex/shared/integration`
2. `codex/case/call-agent-refresh`
3. `codex/case/meeting-assets`

The second wave starts only after the destination status is clean:

1. `codex/stt-footer-layered-reveal`, which currently has an uncommitted generated `next-env.d.ts`
2. `codex/xuelang-case-polish`, while preserving its untracked `.playwright-cli/` and `tmp/` directories

Before every integration, the destination must be clean and its ancestry must be checked. Conflicts are resolved within the destination worktree without copying unrelated files. `codex/case/convo-ai-build` is excluded from this rollout and receives the same commits only after its current changes are committed and its owner explicitly resumes synchronization.

## Verification

Automated tests assert the exact token values, compatibility aliases, and required role-to-selector mappings. They also verify that no migrated selector retains a conflicting local `font-size` or `line-height` declaration.

Browser verification covers representative Chinese and English routes at 1440px, 1024px, and 390px. Checks include hierarchy, wrapping, index-to-title spacing, title-to-body spacing, clipping, overlap, and preservation of each case's brand typography and color.

PDF verification checks the fixed point hierarchy, page breaks, clipped titles, and missing content. Existing unrelated baseline failures are recorded separately and do not count as regressions. At worktree creation, the shared branch had 406 passing tests and five existing failures involving Meeting asset generation, a Meeting chapter-navigation assertion, and publication validation fixtures.

## Non-Goals

- Homepage, About, 404, and other non-case pages
- Body, label, caption, metric, or navigation typography
- Changes to case colors, fonts, media, backgrounds, or decorative composition
- Content rewriting or HTML outline restructuring
- Convo AI integration during this rollout
- Repairing unrelated baseline test failures
