# About Evidence Copy Design

## Status

Approved direction, awaiting written-spec review.

## Goal

Refine the About page evidence section by removing the self-reported-results footnote and replacing the build-boundary supporting copy with a concise description of AI-assisted interactive HTML prototyping.

## Approved Changes

### Chinese

- Keep the card label `构建边界` unchanged.
- Keep the card title `可独立完成体验验证` unchanged.
- Replace the supporting copy `不承担复杂生产级后端开发` with:
  - `通过 Codex、Claude 快速搭建涵盖产品逻辑的交互式 HTML`
- Remove the footnote `* 结果数据来自个人履历中的自述。`

### English

- Keep the corresponding build-boundary card label and title unchanged.
- Replace the corresponding supporting copy with:
  - `Rapidly build interactive HTML with product logic using Codex and Claude.`
- Remove the corresponding self-reported-results footnote.

## Rendering Behavior

- Remove the footnote element from the shared About evidence-section markup rather than rendering an empty string.
- Removing the element must also remove its reserved vertical space.
- Keep the three-column evidence grid, card order, borders, colors, typography, spacing, and responsive behavior unchanged.
- Do not add a replacement disclaimer or footnote.

## Unchanged Content

- Evidence-section eyebrow, title, and introduction.
- Business-result and capability-range cards.
- Build-boundary card label and primary title.
- All other About page sections and copy.
- Homepage and case-study content.

## Evidence Boundary

The business-result metrics remain designer-reported claims supplied by the portfolio owner. Removing the visible footnote does not independently verify those metrics and must not be interpreted as upgrading their evidence status. This task changes the public presentation only and does not add or alter any metric.

## Validation

- Chinese About page shows the approved Chinese supporting copy exactly.
- English About page shows the approved English supporting copy exactly.
- Neither locale renders the former footnote text or an empty footnote element.
- The evidence grid retains three cards in the existing order.
- Desktop and mobile views show no extra blank row, clipping, overflow, or layout shift caused by the removal.
- Relevant About component tests pass.

## Out of Scope

- Rewriting or validating the displayed business metrics.
- Changing the evidence-section visual design.
- Changing card hierarchy, responsive layout, or animation.
- Editing other About page content or other routes.
