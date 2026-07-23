# About Career Link and Copy Design

## Goal

Clarify Yang Jing's current Agora role and make the employer name directly actionable without changing the About page structure.

## Evidence And Scope

- Fact: The About timeline already renders localized career entries from `components/about/about-page.tsx`.
- Fact: The Chinese and English pages use separate localized copy.
- Recommendation: Keep the timeline layout and reveal behavior unchanged; update only the approved labels, current-role copy, link semantics, and interaction styling.
- Gap: No new employment or impact evidence is introduced by this change.

## Approved Content

### Chinese

- Change `研究与交互` to `研究与设计`.
- Change the current role to `产品设计师（UI/UX）`.
- Render `声网 Agora` as a link to `https://www.shengwang.cn/`.
- Append `（全球领先的对话式 AI 与实时音视频云服务商）` as non-link supporting text after the brand link.

### English

- Change `Research & Interaction` to `Research & Design`.
- Change the current role to `Product Designer (UI/UX)`.
- Render `Agora` as a link to `https://www.agora.io/`.
- Do not append an English company description.

## Interaction And Visual Treatment

- Only the employer name is interactive; the description remains ordinary text.
- Open each external company link in a new tab with `rel="noreferrer"`.
- Default link color inherits the existing timeline text color.
- Hover and keyboard focus use the portfolio purple accent, with a visible underline and a short color transition.
- Preserve readable focus indication and reduced-motion behavior.

## Implementation Boundary

- Extend the timeline entry data with an optional company URL and optional company description.
- Render linked and unlinked employers through the same timeline component.
- Do not change timeline spacing, ordering, dates, reveal animation, or mobile layout unless the longer Chinese description causes verified overflow.

## Verification

- Component tests verify the localized labels, role copy, URLs, new-tab behavior, and Chinese-only description.
- Focused lint and About component tests pass.
- Desktop and mobile browser checks confirm the Chinese description wraps cleanly and the link hover/focus state remains legible.

## Portfolio Output Contract Status

This is a localized maintenance change. Existing project positioning, chapter architecture, visual direction, asset plan, CPDI, presentation narratives, interview preparation, and hiring-manager evaluation remain unchanged. No unsupported claim or new portfolio outcome is added.
