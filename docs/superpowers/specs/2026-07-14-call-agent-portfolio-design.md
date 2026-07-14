# Call Agent Portfolio Case Study Design

Date: 2026-07-14  
Language: Simplified Chinese with retained product terms such as Call Agent, AI Studio, ASR/TTS, Prompt, Preview  
Primary format: Responsive web case study  
Secondary format: Browser print to PDF

## 1. Purpose

Create a recruiter-oriented case study for the Agora Call Agent / intelligent call center project. The case should position the author as an AI Product Designer / UX Designer who led the product design from 0 to 1, converted fragmented technical capabilities into a self-service enterprise workflow, established the design system, and improved design-to-engineering delivery through an AI-assisted coded prototype.

The case is not a screen inventory or a chronological diary. It is a decision-led narrative that lets a recruiter answer four questions quickly:

1. What meaningful product problem did the designer solve?
2. What decisions did the designer personally own?
3. How did the designer handle AI uncertainty and enterprise operational complexity?
4. What evidence supports the claimed contribution?

## 2. Confirmed Project Facts

- Product: Agora intelligent call center / Call Agent V1.0.
- Duration: 9 months.
- Iteration scope: approximately eight iterations.
- Role: the only product designer, responsible for the design work from 0 to 1.
- Partners: product manager, frontend and backend engineers, AI/algorithm and audio/video engineers, and QA.
- Product evolution: the original Conversational AI Engine became AI Studio. Call-related capabilities were extracted into a separate intelligent call center, accessed through a product switcher in the left navigation. This was not a product merge.
- Business context: call scenarios are the team's primary promoted direction.
- Product status at handoff: V1.0 was delivered and made available to a small number of enterprise customers in limited beta. It had not been broadly promoted.
- Research boundary: there were no direct customer interviews and no reliable scaled business outcome data.
- Design system contribution: the designer built the design system, including components and token categories, and the system was available in the product repository.
- Coded prototype contribution: the designer pulled the existing frontend repository, reused its design system, and used AI-assisted coding to create an independent high-fidelity frontend prototype. The prototype was not merged into production.
- Engineering delivery: frontend engineers used the provided specifications, system components, coded prototype, and related materials to reproduce pages more quickly and consistently. The production code remained the engineers' responsibility.
- Supporting evidence available: a three-way visual comparison and anonymized engineer feedback.

## 3. Core Positioning

### Primary headline

把需要工程协作的 AI 呼叫能力，变成企业可自主配置与验证的产品

### Supporting proposition

让 AI 在发布前可被看见、测试与控制

### Product thesis

The design transforms fragmented model, voice, number, API, and operational capabilities into one understandable loop:

`Configure -> Preview -> Publish -> Operate`

The narrative should emphasize that AI product design is not only prompt configuration. It also requires observable states, testable behavior, controlled publishing, failure diagnosis, and a path into ongoing operations.

## 4. Audience And Reading Modes

### Primary audience

- Design managers hiring AI Product Designers or senior UX/Product Designers.
- Cross-functional interviewers evaluating product judgment, systems thinking, and delivery ability.

### Reading modes

- Quick scan: project value, role, three design decisions, system contribution, and product status should be clear within 60-90 seconds.
- Full read: desktop reading should take about 8-10 minutes.
- PDF review: the page should export to approximately 16-20 A4 pages without clipped images, broken chapter headings, or dark full-bleed pages that consume excessive ink.

## 5. Narrative Architecture

### 01. PROJECT OVERVIEW | 项目概览

Open with the product name and the primary headline, not an abstract slogan. Show the core product UI as a first-viewport signal. Include a compact fact row for role, duration, iterations, team, and product status.

Required status wording:

> V1.0 已完成交付并进入有限客户灰度阶段，已向少量企业客户开放，但尚未规模化推广。

### 02. CONTEXT & ROLE | 背景与我的角色

Explain the business opportunity, target users, product boundary, and personal ownership. The target users are enterprise product operators, solution engineers, and developers with basic technical knowledge.

Show AI Studio and the intelligent call center as related but distinct products:

- AI Studio: general agent creation and capability configuration.
- Intelligent call center: numbers, outbound tasks, call outcomes, failure diagnosis, and analytics.

State that the designer was the only designer and worked with the named cross-functional roles. Avoid implying sole product ownership or sole engineering delivery.

### 03. DESIGN THESIS | 核心设计命题

Define the problem as fragmented enterprise onboarding across documentation, APIs, model and voice providers, and number configuration. Present one journey diagram:

`Configure -> Preview -> Publish -> Operate`

Use this chapter to establish the three principles that guide all following decisions:

1. Make professional configuration understandable without removing expert control.
2. Make AI behavior observable and testable before release.
3. Connect agent creation to real call operations and diagnosis.

### 04. DESIGN DECISION 01 | 重构产品边界与任务路径

Explain why call capabilities became a dedicated product and how the information architecture supports a clearer call workflow. Cover product switching, resource relationships, templates, and progressive disclosure between basic and advanced configuration.

Embed selected old/new evidence as `Before / Decision / After`. Do not create a separate iteration-history chapter. Iteration count is supporting context, not the main story.

### 05. DESIGN DECISION 02 | 让 AI 在发布前可见、可测、可控

This is the visual and narrative center of the case. Show how Prompt, model, and voice choices connect to a live call Preview. Explain connection states, realtime transcription, interruption or latency feedback where visible, and error recovery.

The chapter must demonstrate a feedback loop rather than merely showing a split-screen layout:

`Change configuration -> Start preview -> Observe behavior/state -> Diagnose -> Adjust`

Use the AI configuration plus Preview page as the main evidence image.

### 06. DESIGN DECISION 03 | 从 AI Demo 到呼叫运营闭环

Show the product path after configuration: publish checks, phone numbers, outbound tasks, call history, failure reasons, information extraction, and analytics. Explain how these capabilities turn a demonstration into an operable enterprise product.

Use dense operational screens selectively. Each screenshot must support one decision and have an annotation or caption; avoid presenting an undifferentiated gallery.

### 07. SYSTEM & DELIVERY | 从设计系统到可执行的工程交付

Treat this as a major contribution, not a closing footnote.

The chapter contains five parts:

1. Design system foundation: token categories, reusable components, interaction states, and responsive rules built by the designer.
2. Repository context: the system existed in the product frontend repository.
3. AI-assisted implementation: the designer pulled the repository and reused its design system to create a high-fidelity frontend prototype.
4. Evidence chain: `Design specification -> AI-assisted prototype -> Engineering production page` using the AI configuration plus Preview page.
5. An anonymized engineer quote confirming that the materials reduced ambiguity and helped reproduce pages quickly and consistently.

Required boundary statement:

> 该高保真前端原型用于验证设计方案并辅助工程交付，未合入生产环境；正式生产代码由前端工程师完成。

Do not use "Vibe Coding" as the chapter headline. Use "AI-assisted frontend implementation" or "AI 辅助编码" because it describes the method without overstating engineering ownership.

Do not claim a percentage improvement unless a dated, comparable measurement exists. The visual comparison and engineer feedback are qualitative delivery evidence.

### 08. OUTCOME & LEARNINGS | 阶段结果与反思

Separate the content into three evidence levels:

- Delivered: V1.0 product loop, dedicated product boundary, preview workflow, operational capabilities, design system, and engineering delivery materials.
- Observed: internal cross-functional review, QA validation, limited customer beta availability, visual implementation comparison, and engineer feedback.
- Not yet validated: scaled adoption, customer task completion, conversion, retention, or business growth.

Use this outcome statement:

> V1.0 已完成交付并进入有限客户灰度阶段。截至项目交接时，产品已向少量企业客户开放，但尚未规模化推广。因此本案例不将灰度状态解释为业务增长结果，而聚焦已建立的产品闭环、设计决策与下一阶段验证基础。

Use this limitation statement:

> 当前验证主要来自产品、研发、算法、音视频与 QA 的内部评审，尚缺少足够的真实客户样本。

Handoff metrics for the next phase:

- Time to first successful agent configuration.
- Configuration error and self-recovery rate.
- Preview-to-publish conversion.
- Publish success rate.
- Time to diagnose call failures.

Frame these as recommended future measurements, not existing results.

## 6. Visual Direction

Use a restrained AI-observability visual language:

- Dark editorial opening with clear product imagery and small realtime green state accents.
- Light or neutral long-form content sections for readability and print economy.
- Use green for status, active signals, and journey continuity rather than as a decorative wash.
- Use neutral grays plus limited semantic red, amber, and blue for errors, warnings, and information.
- Keep typography compact and professional. Large type is reserved for the opening statement, not internal panels.
- Prefer unframed full-width sections. Cards are reserved for repeated evidence items or genuinely framed tools.
- Use annotations, zoomed crops, and short captions to explain evidence. Do not rely on tiny full-screen screenshots alone.
- Avoid decorative gradients, generic AI imagery, floating orbs, excessive rounded cards, and a one-color dark theme.

## 7. Responsive Behavior

- Desktop: a constrained editorial column with selected full-width product images and occasional two-column evidence layouts.
- Tablet: preserve chapter hierarchy while changing comparison grids from three columns to a horizontal scroll or stacked sequence.
- Mobile: stack all comparisons in reading order and keep captions adjacent to their image. Navigation becomes a compact chapter index rather than a persistent sidebar.
- Fixed-format screenshots retain their aspect ratio and never crop critical interface areas.
- Long English product terms wrap without overflowing.
- Interactive affordances used only for the web version must have a visible static equivalent in print.

## 8. Print And PDF Requirements

- Provide dedicated `@media print` styles for A4 portrait output.
- Switch dark backgrounds to print-friendly light surfaces while preserving hierarchy.
- Prevent chapter headings, comparison groups, captions, and quoted evidence from splitting awkwardly across pages.
- Repeat no web-only sticky navigation in print.
- Preserve screenshot resolution and avoid scaling UI text below readable size; use crops across separate blocks when required.
- Include page-break controls before major design decisions when they improve composition.
- Remove hover-only content and expand essential disclosure content before print.
- Verify the exported PDF visually page by page.

## 9. Evidence And Privacy Rules

- Every claimed result must be labeled by evidence level: delivered fact, observed qualitative evidence, or proposed future metric.
- Do not fabricate customer quotes, adoption outcomes, conversion improvements, or quantified efficiency gains.
- Engineer feedback may be lightly edited for brevity only if meaning is preserved; label it as anonymized.
- Redact phone numbers, authorization tokens, IP addresses, App IDs, Pipeline IDs, customer names, internal accounts, and personal identities.
- Exclude or fully redact `Screenshot 2026-07-13 at 5.17.38 PM.png`, which contains a visible authorization token.
- Source screenshots remain product evidence; visual cleanup must not change product behavior or imply unbuilt features.

## 10. Asset Plan

Use final-product screenshots from:

`/Users/admin/Desktop/声网 作品集 整理/studio 截图/`

Use old-version screenshots from:

`/Users/admin/Desktop/声网 作品集 整理/studio 旧版/`

Prioritize these comparisons:

- Product architecture and navigation.
- Resource management.
- Number details.
- Outbound monitoring and analytics.
- Call history filtering.

Additional evidence still required before the System & Delivery chapter can be finalized:

- AI-assisted prototype screenshot for the AI configuration plus Preview page.
- Matching design specification or design image.
- Matching production screenshot, selected from existing product images when possible.
- Anonymized engineer feedback screenshot or approved quotation.

The implementation may use an explicit "evidence pending" internal marker during development, but no placeholder should appear in the final public page.

## 11. Interaction Scope

Keep interaction purposeful and printable:

- Chapter index navigation with current-section indication.
- Click-to-enlarge evidence images.
- Before/after comparison control only where it materially improves inspection; provide both images in print.
- Print / Export PDF command using the browser print dialog.
- No marketing-style animation. Small status transitions may reinforce the observability theme but must respect reduced-motion preferences.

## 12. Acceptance Criteria

The finished case study is acceptable when:

1. A recruiter can identify the product problem, role, duration, and status in the first viewport.
2. The narrative contains exactly three primary design decisions and one major system/delivery chapter.
3. Old/new comparisons sit inside the decisions they support rather than in a detached iteration chapter.
4. AI configuration and Preview are the strongest visual and narrative moment.
5. The Design System and AI-assisted prototype contribution is evidenced and accurately bounded.
6. No limited-beta statement is presented as scaled business impact.
7. All sensitive data is removed from public assets.
8. Desktop, tablet, and mobile layouts remain readable without overlap or horizontal page overflow.
9. Browser print produces a visually reviewed, readable A4 PDF.
10. The case can be understood without opening hidden interactions or relying on unsupported claims.
