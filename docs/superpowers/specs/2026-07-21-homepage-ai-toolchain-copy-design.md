# Homepage AI Toolchain Copy Design

## Status

Approved direction, pending written-spec review.

## Goal

Make Yang Jing's AI-native working method more concrete by naming the tools used to explore ideas, turn designs into working products, and develop the product's visual expression.

## Placement

Add the toolchain copy to the third scene of the existing Homepage introduction module, directly below the primary statement about turning design judgment into working products.

Do not add the copy to the Hero. The Hero remains focused on the dual identity of `Product Designer` and `AI-native Builder`. The introduction remains a three-scene sequence; this change must not add a fourth scene or increase its scroll duration.

## Localized Copy

Chinese:

> 熟练运用 Codex、Claude Design 与 Figma Make 进行设计探索，将创意转化为可运行的产品；结合 Midjourney、即梦等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。

English:

> I work fluently with Codex, Claude Design, and Figma Make to explore ideas and turn designs into working products. With AIGC tools such as Midjourney and Jimeng AI, I expand the visual language and bring greater coherence and polish to the product.

## Visual Hierarchy

- Keep the existing third-scene primary statement as the dominant text.
- Render the new copy with the existing introduction-support typography and muted foreground color.
- Highlight `Codex`, `Claude Design`, `Figma Make`, `Midjourney`, and `即梦` / `Jimeng AI` with the existing iris accent used for `Vibe Coding`.
- Do not add tool logos, pills, badges, cards, or a separate tool grid.
- Keep letter spacing at zero and preserve the current square, editorial visual language.

## Component Boundary

- Extend the existing introduction scene data so support copy can contain multiple emphasized fragments.
- Keep all localized text in the introduction copy source.
- Reuse the current support paragraph styles and motion behavior.
- Keep accessibility text complete and readable in source order; emphasis must not split or reorder the spoken sentence.

## Responsive Behavior

- Desktop: the support copy may wrap naturally beneath the primary statement, without increasing the module's pinned height.
- Mobile: allow the support copy to wrap across multiple lines without clipping, overlap, or horizontal overflow at 390px.
- Reduced motion: preserve the existing static introduction layout and show the new third-scene support copy in normal document order.

## Validation

- The Hero content and interaction remain unchanged.
- The introduction still contains exactly three scenes.
- The new Chinese copy appears only in the third scene on `/zh/`.
- The English counterpart appears only in the third scene on `/en/`.
- All five tool names receive the existing iris emphasis treatment.
- Desktop and 390px mobile layouts have no clipping, overlap, or page-level horizontal overflow.
- Existing introduction navigation, scene transitions, and reduced-motion behavior remain functional.

## Out of Scope

- Adding tool logos or a standalone skills section
- Changing the Hero layout or summaries
- Rewriting the existing three primary introduction statements
- Changing the Homepage project sequence or any case-study content
