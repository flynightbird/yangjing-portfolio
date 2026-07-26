# Homepage Chinese Copy Review Design

## Status

Approved direction, awaiting written-spec review.

## Goal

Rewrite the Chinese homepage in concise, professional, natural Chinese that is easy for hiring managers and collaborators to scan. Preserve all intentionally English display copy, product names, company names, tool names, and the existing English homepage copy, except for the explicitly approved removal of project status and media-production descriptions from both locales.

The rewrite must state scope and responsibility directly without adding unsupported ownership, launch, customer, or impact claims.

## Voice

- Information-first and restrained.
- Short, direct sentences with explicit subjects and actions.
- Prefer product scope, design responsibility, and user value over promotional language.
- Avoid translated phrasing, repeated nouns, internal production notes, and vague claims.
- Keep established English terms unchanged, including `Yang Jing`, `Product Designer`, `AI-native Builder`, `Vibe Coding`, product names, company names, and tool names.

## Approved Homepage Copy

### Hero

- Designer summary: `专注于 C 端产品，以及复杂的 B2B 与 AI 系统设计。`
- Builder summary: `通过 Vibe Coding 探索、验证并构建可运行的产品体验，借助 AIGC 拓展视觉表达、提升设计效率。`

### Introduction

1. `嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师，也长期从事用户研究。`
2. `这是一个由我设计，并通过 Vibe Coding 构建的作品集。`
3. `我的工作覆盖大规模 C 端产品、复杂 B2B 产品与 AI 系统，结合 UX/UI 设计与用户研究，将复杂状态梳理为清晰、可控且具有一致视觉表达的产品体验。`
4. `现在，我也借助 AI 将设计判断转化为可运行的产品，从概念探索、原型验证走向真实体验。`
5. `我使用 Codex、Claude Design 与 Figma Make 进行设计探索与产品构建，并结合 Midjourney、即梦等 AIGC 工具拓展视觉表达，提升产品的完整度与质感。`

### Featured Projects

#### 学浪

- Proposition: `从卖课工具，走向高品质学习平台`
- Role: `项目主设计师`

#### Call Agent

- Proposition: `面向 AI 对话配置的 SaaS 产品，让 AI 对话在发布前可见、可验证、可控。`
- Role: `唯一产品设计师 · 前端原型构建（Vibe Coding）`
- Do not render a project status or any media-description copy in either locale.

#### ConvoAI

- Proposition: `为 AI 对话打造自然、清晰的跨端体验。`
- Role: `唯一产品设计师`
- Do not render a project status, temporary notice, or any media-description copy in either locale.

#### Agora Meeting

- Proposition: `在参会者、内容、角色与设备持续变化的会议场景中，构建覆盖桌面端、Web、App 与 Pad 的实时协作体验。`
- Role: `唯一产品设计师`
- Status: `已在四类终端上线`

#### AIDX

- Proposition: `通过界面、信息架构与动效，为 AIDX 打造清晰、可信的品牌官网。`
- Kind: `新加坡 AI 安全公司官网`
- Status: `网站已上线`

#### STT Demo

- Proposition: `让双语对话的实时转写与翻译更清晰。`
- Role: `唯一产品设计师 · AI 辅助高保真原型`
- Status: `Agora RTE 2026 大会发布`

### Visual Archive

- Title: `More C 端产品作品`
- Description: `以视觉卡片为主，呈现更多产品、品牌与角色设计。`

Archive project descriptions:

- 躺平设计家: `面向家居装修设计师的工具与平台。升级 App 与官网主站体验，并强化产品的品牌表达。`
- 开言: `字节跳动旗下的语言学习 App。探索新的设计原则，提升视觉一致性与体验品质。`
- 豆豆狐: `字节跳动旗下的儿童语言学习 App。设计英语闯关体验，让学习任务更直观，也更具游戏感。`
- Mr Chong: `为同程旅游某业务线打造可延展的品牌 IP，并完成三维角色、动作与视觉表达。`

## Cross-Locale Removal Rules

Remove the following visitor-facing content from both the Chinese and English homepage:

- Call Agent status.
- Call Agent media-description label.
- ConvoAI status.
- ConvoAI media-description label.
- ConvoAI temporary-media notice.
- Any equivalent wording about temporary assets, real-product evidence, asset replacement, or asset preparation attached to those two homepage projects.

This removal applies only to the homepage presentation. It must not remove evidence boundaries or factual disclosures from individual case-study routes.

## Unchanged Content

- Existing English editorial copy remains unchanged except for the approved removals above.
- Navigation, locale controls, menu controls, archive interaction labels, image alternative text, and shared Footer copy remain unchanged unless a test requires a structural adjustment caused by the removal.
- Product and company names remain unchanged.
- No new metrics, launch claims, customer claims, or ownership claims may be introduced beyond the copy supplied and approved by the portfolio owner.

## Implementation Notes

- Update exact-copy tests before production strings.
- Prefer optional presentation fields or explicit rendering conditions over empty visible placeholders.
- Preserve the dictionary type contract without inventing replacement copy for removed fields.
- Remove obsolete homepage-only temporary notices from the rendered DOM in both locales.
- Verify that removing metadata does not leave empty separators, spacing, or inaccessible labels.
- Confirm that English dictionary text has no editorial changes outside the approved removals.

## Validation

- Chinese homepage renders every approved string exactly.
- Call Agent and ConvoAI show no status or media-production wording in either locale.
- Meeting, AIDX, and STT Demo retain their approved statuses.
- English homepage editorial copy is otherwise unchanged.
- Desktop and mobile screenshots show no overflow, awkward orphan lines, empty metadata rows, or spacing gaps.
- Focus order and accessible names remain coherent after the removals.
- Relevant component, unit, and end-to-end homepage tests pass.

## Out of Scope

- Rewriting English homepage copy.
- Rewriting case-study, About, resume, or non-homepage content.
- Changing project facts, metrics, navigation, layout, motion, visual styling, or media assets.
- Removing case-study evidence disclosures that do not appear on the homepage.
