# Homepage Copy Polish Design

## Status

Approved copy direction for the localized homepage.

## Goal

Remove translated-sounding Chinese from the homepage while preserving the existing visual hierarchy, project order, links, and component structure.

## Scope

1. Keep the third Chinese introduction statement as:
   `现在，我也使用 AI 将设计判断转化为可运行的产品，从概念、原型走向真实体验。`
2. Change the ConvoAI call to action to `查看案例` in Chinese and `View case study` in English. The existing external destination and new-tab behavior remain unchanged.
3. Change the STT proposition to:
   - Chinese: `让双语对话在实时转写与翻译中清晰呈现。`
   - English: `Keep bilingual conversation clear through real-time transcription and translation.`
4. Remove the complete `Status` definition row from the homepage STT card in both locales. Do not change status presentation in case-study pages or other project cards.
5. Change the AIDX proposition to:
   - Chinese: `为新加坡 AI 安全公司 AIDX 打造的全新线上官网，通过界面、信息结构与动效塑造品牌表达。`
   - English: `A new website for AIDX, a Singapore AI safety company, shaped through interface, information structure, and motion.`
6. Change the Visual Archive description to:
   - Chinese: `更多设计作品，将以图片为主，轻量呈现产品、品牌与角色设计作品。`
   - English: `More design work, presented through a lightweight, image-led selection of product, brand, and character projects.`

## Implementation Boundary

- Update localized homepage copy at its existing source of truth.
- Remove only the homepage STT status markup.
- Keep STT role, media, CTA, link target, and interaction unchanged.
- Keep all project routes and external-link behavior unchanged.
- Add or update focused tests for the approved copy and the missing STT status row.

## Acceptance Criteria

- `/zh/` renders every approved Chinese phrase exactly.
- `/en/` renders the corresponding English copy.
- ConvoAI still opens its existing external destination in a new tab, but its CTA reads `查看案例` / `View case study`.
- The homepage STT card shows Role but no Status label or value.
- Other project status labels remain visible.
- Existing homepage interaction and Lightbox tests remain green.
