# Agora Meeting Case Study Design

**Status:** Approved design specification  
**Date:** 2026-07-18  
**Implementation status:** Not started

## 1. Evidence And Project Facts

### Confirmed Facts

| Item | Confirmed detail | Portfolio treatment |
| --- | --- | --- |
| Product | Agora Meeting | Use the public product name. |
| Category | Enterprise Meeting aPaaS | Explain in Project Overview, not the main headline. |
| Case title | Designing Agora Meeting: A Multi-device Real-time Collaboration System | Use for the case-study H1 and metadata. |
| Description | Building a scalable meeting experience across Desktop, Web, Tablet, and Mobile with adaptive layouts, AI-powered transcription, and collaborative workflows. | Use as supporting introduction. |
| Timeline | 2024-2026, 1.5 years | Show in the project facts. |
| Role | Sole Product Designer | State directly. |
| Scope | End-to-end 0-to-1 product design through production launch | State directly. |
| Platforms | Desktop, Web, Tablet, and Mobile | Show as one system with platform-specific adaptation. |
| Collaboration | Product managers, client engineers, web engineers, backend engineers, QA, and customer teams | Preserve team contribution and role boundaries. |
| Launch status | The designs in the supplied Figma file shipped | Use real product recordings as behavioral and launch evidence. |
| Audience | Organizations across multiple industries that need configurable meeting capabilities | Frame the product as reusable meeting infrastructure rather than a single-industry app. |
| Business trigger | Customers needed to migrate from Zoom as it prepared to exit the Chinese market | Use as context, not as a competitor showcase. |
| Requirement source | Customer feature requirement lists and product-manager inputs | Do not describe this as direct user-interview research. |
| Prioritization | High-coverage customer needs became default rules; a smaller set became configurable capabilities | Use as the platform product decision. |
| Outcome | The product launched across four platform categories and met customer business requirements | Do not add unsupported adoption, satisfaction, or efficiency metrics. |

### Scope Boundaries

- Agora Meeting owns the complete in-meeting experience covered by this case study.
- Live transcription data is exposed to customers through an API.
- Agora Meeting does not retain the post-meeting transcript in its own client interface.
- Customer-built copy, download, storage, and post-meeting management interfaces are outside this designer's scope.
- The case study will not use a Before / During / After ecosystem narrative.

### Evidence Sources

- Approved Blueprint and Prompt documents.
- The supplied Agora Meeting Figma file.
- Real recordings from an accessible test environment and app test packages.
- Static exports from the shipped Figma designs.

### Known Evidence Limits

- No quantitative adoption, satisfaction, task-completion, or business-performance data is available.
- Impact must be expressed through production delivery, supported business requirements, system coverage, and shipped interaction behavior.
- Product recordings prove that behavior was implemented; they do not independently prove customer satisfaction or business growth.

## 2. Project Positioning

### Positioning Statement

Agora Meeting is a configurable enterprise meeting aPaaS created to help customers migrate from Zoom and integrate production-ready meeting capabilities into products across multiple industries. As the sole product designer, Yang Jing designed and launched the experience across Desktop, Web, Tablet, and Mobile over 1.5 years.

### Core Transformation

From rebuilding expected meeting features to establishing a configurable, state-driven, multi-device collaboration system.

### Hiring Signal

The case study should demonstrate that the designer can translate broad customer requirements into platform rules, manage real-time role and state complexity, collaborate across engineering disciplines, and deliver a multi-platform enterprise product to production.

### Narrative Guardrail

This is a senior product design case study, not a marketing landing page. Product UI, system models, decisions, tradeoffs, and recordings carry the story. The page must not use marketing calls to action, customer-logo walls, feature-benefit cards, decorative product mockups, or promotional claims.

## 3. Chapter Architecture

The site uses nine chapters.

| Chapter | Question to answer | Required evidence |
| --- | --- | --- |
| 1. Case Header | What is the product, scope, role, and central design challenge? | Product title, description, real meeting UI, role, timeline, platforms, and launch status. |
| 2. Business Context | Why did customers need Agora Meeting? | Zoom migration context, multi-industry customer needs, and 0-to-1 product requirement. |
| 3. Design Challenge | What made the work a system problem rather than a screen-design task? | Customer coverage model, roles, devices, states, and configuration boundaries. |
| 4. System Strategy | How did one interaction system adapt across four platforms? | Context -> Information Priority -> Interface State model and cross-device principles. |
| 5. Adaptive Meeting Stage | How did live meeting events change layout and information priority? | Shipped state recordings, state matrix, Focus versus Pin, and cross-device comparisons. |
| 6. Whiteboard Workspace | How did creation become primary without losing meeting awareness? | Multi-device whiteboard UI, portrait split layout, participant-view priority rules, and tradeoffs. |
| 7. Real-time Information Layer | How were individual comprehension controls separated from meeting-level governance? | Captions, transcript panel, translation, bilingual output, interpretation, permissions, and API boundary. |
| 8. Meeting Capability System & Impact | How broad was the shipped system, and what did delivery achieve? | Breakout Rooms, Chat, Waiting Room, four-platform coverage, and shipped capability map. |
| 9. Reflection | What would be improved in a second system iteration? | Component-system maintenance problem and future cross-platform governance model. |

### Reading Depth

- In 30 seconds, a hiring manager should understand the product, role, four-platform scope, business trigger, and shipped status.
- In 3 minutes, the reader should understand the three consequential design decisions.
- In 10 minutes, the reader should see platform thinking, role and permission logic, adaptation rules, product breadth, delivery, and reflection.

## 4. Visual Direction

### Design Character

Use an evidence-led editorial system with the precision and density of enterprise product documentation. Continue the existing portfolio's Interface X-Ray language without recreating the reference sites as a SaaS landing page.

### Execution Rules

- Reuse the existing Home navigation, theme, type system, and case-study behavior.
- Use Archivo Black for selected display moments, Libre Franklin for body copy, DM Mono for technical labels, and Noto Sans SC for Chinese text.
- Preserve the existing restrained neutral palette and coral meeting accent.
- Use accent color only for state, focus, live behavior, and explanatory emphasis.
- Use a 12-column desktop grid, with readable 6-8 column text and 8-12 column media.
- Keep product screens large enough to inspect; avoid screenshot walls and unreadable device mosaics.
- Use diagrams to explain verified relationships, not to simulate technical depth.
- Limit each annotated figure to three decision-relevant callouts.
- Motion may explain state, sequence, and focus. It must not decorate the page.
- Support reduced motion with static frames and equivalent captions.

### Responsive Rules

- Desktop target: 1440px.
- Tablet target: 768px.
- Mobile target: 390px.
- Mobile layouts must be recomposed rather than scaled down.
- Desktop chapter navigation may remain sticky; mobile uses a compact chapter control.
- Capability media becomes a vertical sequence on mobile and must not hijack scrolling.

## 5. Visual Asset Plan

### Case Header

- `meeting-hero.webp`: real Desktop or Web meeting interface.
- `adaptive-layout-preview.mp4`: 5-8 second Gallery -> Focus -> Share loop.
- Static poster for loading, print, and reduced-motion modes.

### Business Context And Strategy

- `migration-context-diagram.webp`: Zoom market exit -> customer migration need -> Agora Meeting.
- `requirement-coverage-model.webp`: high-coverage defaults and limited configuration.
- `context-priority-state.webp`: Context -> Information Priority -> Interface State.

### Adaptive Meeting Stage

- `adaptive-layout-demo.mp4`: 12-18 second real-product state sequence.
- Gallery, Speaker, Screen Share, and Whiteboard static frames.
- `meeting-state-matrix.webp`: trigger, priority, and layout result.
- `focus-vs-pin.webp`: meeting-wide Focus versus personal Pin.
- Four-platform comparison of the same meeting task.

### Whiteboard Workspace

- Desktop, Web, Tablet, and Mobile whiteboard frames.
- Mobile portrait frame showing the upper participant view and lower whiteboard canvas.
- Portrait and landscape comparison.
- `participant-priority.webp`: participant-view priority stack.
- Optional 8-12 second shipped whiteboard interaction recording.

### Real-time Information Layer

- `transcript-demo.mp4`.
- Four-state sequence: live captions, transcript panel, language selection, and bilingual output.
- `caption-vs-transcript.webp`: personal caption control versus host-governed transcript.
- Simultaneous interpretation and participant-request states.
- `speech-to-api.webp`: Speech -> Live Processing -> Meeting UI -> Customer API.

### Capability System

- Breakout Rooms: creation, assignment, and in-progress states.
- Chat: group/private chat, unread state, and coexistence with the meeting stage.
- Waiting Room: waiting, host decision, and entry result.
- Each capability receives one compact flow and one consequential decision.

### Impact And Reflection

- Four-platform production coverage matrix.
- Shipped meeting capability map.
- Current repeated component maintenance versus a future shared state-and-governance model.

### Media Requirements

- Every video has a compressed MP4, poster, concise caption, and static fallback.
- Source evidence remains separate from optimized public media.
- Website images use WebP or AVIF and preserve readable UI detail.
- No random image placeholders or invented product screens are permitted.

## 6. Screen-level CPDI

### Adaptive Meeting Stage

**Context:** Participants join meetings with changing people, content, roles, and devices.

**Problem:** A fixed responsive layout cannot preserve the right content priority when sharing, whiteboarding, host focus, or participant count changes.

**Decision:** Use four primary triggers: Screen Share, Whiteboard Open, Host Focus, and Participant Count. Map each trigger to an information priority and stage layout. Host Focus changes everyone's main view; personal Pin only changes the individual's view.

**Impact:** The state-driven stage shipped across Desktop, Web, Tablet, and Mobile and supported the required meeting scenarios. No quantitative behavior data is available.

### Whiteboard Workspace

**Context:** Participants create and review content while remaining inside a live meeting.

**Problem:** The canvas, participant awareness, and meeting controls compete for limited space, especially in mobile portrait orientation.

**Decision:** Make the canvas primary. In portrait, use an upper participant view and lower whiteboard region. Select the participant view by this priority: Host Focus, personal Pin, active speaker, self, camera and microphone on, camera on, microphone on.

**Impact:** The shipped layout preserved both creation space and meeting awareness across platform and orientation changes. No task-completion data is available.

### Real-time Information Layer

**Context:** Participants need live comprehension, translation, and transcript access during a meeting.

**Problem:** Individual comprehension preferences and meeting-level transcription governance require different permissions and controls.

**Decision:** Make Live Captions an individual setting. Make the Transcript Panel a host-started and host-stopped meeting capability, while allowing participants to request activation. Support real-time translation, source-language selection, bilingual output, and simultaneous interpretation. Expose transcript data to customers through an API rather than implying an Agora-owned post-meeting record.

**Impact:** The complete in-meeting language experience shipped. Customer-side post-meeting interfaces remain outside the project scope.

### Breakout Rooms

**Context:** Hosts divide an active meeting into smaller groups and manage member assignment and progress.

**Problem:** Creation, assignment, permissions, and transitions introduce multiple host and participant states.

**Decision:** Present Breakout Rooms as a compact capability flow that makes host control and participant state legible.

**Impact:** The capability shipped as part of the meeting system. No usage data is available.

### Chat

**Context:** Participants communicate without leaving the active meeting stage.

**Problem:** Group chat, private chat, unread feedback, and meeting content compete for attention.

**Decision:** Use entry state, side-panel hierarchy, and unread feedback to preserve meeting priority while supporting communication.

**Impact:** Chat shipped within the live meeting experience. No usage data is available.

### Waiting Room

**Context:** Participants wait while the host controls meeting entry.

**Problem:** Waiting, review, acceptance, and rejection states can be ambiguous to both roles.

**Decision:** Separate participant feedback from host decision controls and make each transition explicit.

**Impact:** The Waiting Room shipped as part of the meeting access system. No behavior data is available.

## 7. Three-minute Narrative

Agora Meeting is an enterprise meeting aPaaS designed for organizations that need configurable meeting capabilities inside their own products. The project began as customers needed to migrate from Zoom when it prepared to exit the Chinese market. Over 1.5 years, from 2024 to 2026, I was the sole product designer responsible for taking the experience from product definition to production launch across Desktop, Web, Tablet, and Mobile.

The challenge was not simply rebuilding familiar meeting features. Different customers needed overlapping but not identical capabilities, while every live meeting changed with its participants, content, roles, and device context. We used customer requirement lists to identify coverage: broadly requested capabilities became default product rules, while a smaller recurring set became configurable.

My central strategy was to connect meeting context to information priority and then to interface state. In the Adaptive Meeting Stage, Screen Share, Whiteboard, Host Focus, and Participant Count trigger layout changes. A host Focus changes the main view for the whole meeting, while a participant's Pin preserves personal control.

The same system thinking shaped Whiteboard and real-time language features. Whiteboard makes the canvas primary while retaining participant awareness through device-specific layouts and an explicit view-priority rule. Live Captions remain an individual control, while the Transcript Panel is governed by the host and can be requested by participants. The experience also includes real-time translation, bilingual output, and simultaneous interpretation, with transcript data handed to customers through an API.

The product launched across all four platform categories and met the required customer business needs. Looking back, the main improvement would be to establish the cross-platform component system earlier. Fast delivery meant similar components were maintained repeatedly across clients, so a future iteration would connect shared state models and naming rules with platform-specific interaction behavior from the beginning.

## 8. Ten-minute Deep Dive

| Time | Story | Evidence |
| --- | --- | --- |
| 0:00-1:00 | Product, customer migration context, aPaaS model, role, timeline, and shipped scope | Case Header and project facts |
| 1:00-2:00 | Requirement sources, high-coverage default rules, and limited configuration | Requirement coverage model |
| 2:00-3:00 | Why live meetings are dynamic systems | Context-priority-state model |
| 3:00-4:45 | Adaptive Meeting Stage triggers, layout states, Focus, and Pin | State matrix and product recording |
| 4:45-6:15 | Whiteboard canvas priority, portrait split, participant-view sorting, and device differences | Multi-device frames and priority stack |
| 6:15-7:45 | Personal captions, host transcript governance, requests, translation, bilingual output, interpretation, and API boundary | Permission model and transcript recording |
| 7:45-8:45 | Product breadth through Breakout Rooms, Chat, and Waiting Room | Capability System |
| 8:45-9:25 | Production delivery, four-platform coverage, and business requirement coverage | Launch coverage |
| 9:25-10:00 | Component-system reflection and future governance | Reflection model |

## 9. Interview Questions

| Question | Answer direction |
| --- | --- |
| Why was Agora Meeting created? | Customers needed a Zoom replacement as Zoom prepared to exit the Chinese market. Agora built configurable meeting capabilities from zero. |
| What did you own? | Sole Product Designer, responsible for the end-to-end product experience across four platform categories through production launch. |
| Who did you work with? | Product managers, client, web, and backend engineers, QA, and customer teams. |
| How did you decide what became platform functionality? | Customer requirement coverage determined common defaults; a smaller recurring set became configurable. |
| What made the stage adaptive rather than responsive? | Meeting events change information priority, not only dimensions. Share, Whiteboard, Focus, and Participant Count trigger different stage states. |
| Why have both Focus and Pin? | Focus gives the host meeting-wide control; Pin gives each participant personal viewing autonomy. |
| How does the whiteboard preserve participant awareness? | Canvas remains primary while a reduced participant region follows an explicit role and activity priority order. |
| Why are captions and transcripts governed differently? | Captions are personal comprehension controls; transcripts are meeting-level resources governed by the host, with a participant request path. |
| What happens to transcript data after the meeting? | Agora exposes the data through an API. Customer-owned storage and post-meeting interfaces are outside this project's scope. |
| What was the measurable impact? | No quantitative product metrics are available. The verified outcome is production launch across four platform categories and coverage of customer business requirements. |
| What would you change? | Establish the cross-platform component system earlier to reduce repeated maintenance while preserving platform-specific interaction behavior. |

## 10. Hiring-manager Evaluation

| Dimension | Intended signal | Risk control |
| --- | --- | --- |
| User and customer understanding | Shows how customer requirement coverage became a platform decision. | Do not describe PM-translated requirements as direct user research. |
| Systems thinking | Shows roles, permissions, triggers, layout states, platforms, and API boundaries. | Keep diagrams tied to shipped behavior. |
| Business understanding | Connects Zoom migration, multi-industry configuration, and production delivery. | Do not invent commercial results. |
| Complexity to clarity | Uses three consequential cases and a compact capability system. | Prevent the capability section from becoming a feature catalog. |
| Decision quality | Shows default-versus-configurable logic, Focus versus Pin, canvas priority, and transcript governance. | Include tradeoffs and alternatives where source material supports them. |
| Leadership and role clarity | States sole design ownership while naming all collaborating disciplines. | Do not claim engineering or customer-team output as personal work. |
| Visual storytelling | Uses real UI, state recordings, comparisons, and concise diagrams. | Avoid marketing composition, unreadable UI, and decorative motion. |

## Component Architecture

### Page Layer

- `MeetingCaseLayout`: integrates existing Home navigation, theme, locale, and adjacent-case behavior.
- `CaseChapterNav`: nine-chapter navigation with desktop and mobile behavior.
- English and Chinese content share the same component and media layer.

### Narrative Layer

- `CaseHeader`
- `ProjectFacts`
- `NarrativeSection`
- `DecisionStory`
- `TradeoffNote`

### System Evidence Layer

- `ContextPriorityModel`
- `MeetingStateMatrix`
- `StateTransitionDemo`
- `FocusPinComparison`
- `DeviceComparison`
- `ParticipantPriorityStack`
- `LanguageControlModel`
- `CapabilitySystem`

### Outcome Layer

- `LaunchCoverage`
- `ReflectionBlock`

### Content Model

- Replace the current Meeting draft with complete English and Chinese case content.
- Store facts, chapter copy, evidence labels, captions, and media paths in content files.
- Keep components responsible for rendering and interaction rather than project-specific prose.
- Reuse `DecisionStory` across the three primary cases.
- Inherit locale from the current Home route. Do not state an English-default rule in the product specification.

## Implementation Plan

### Phase 1: Content Lock

- Convert confirmed facts into equivalent English and Chinese content.
- Remove the post-meeting transcript implication and Before / During / After ecosystem narrative.
- Complete CPDI, rules, tradeoffs, and shipped results for the three primary cases.

### Phase 2: Asset Production

- Index Figma evidence by case and capability.
- Record real flows from the test environment and app packages.
- Export state comparisons, system diagrams, and optimized public media.
- Create posters and static fallbacks for every video.

### Phase 3: Home Integration

- Preserve `/en/work/meeting/` and `/zh/work/meeting/`.
- Replace the current Meeting draft entry with the complete bilingual case.
- Reuse existing navigation, themes, locale switching, and content registration.
- Change the Home project availability only when the publication checks pass.

### Phase 4: Core Components

- Build the complete static reading experience before motion.
- Implement shared narrative, system, comparison, media, and outcome components.
- Keep specialized behavior scoped to the Meeting case layout.

### Phase 5: Product Evidence

- Integrate the Adaptive Stage recording and state model.
- Integrate the Whiteboard comparison and participant priority model.
- Integrate the language controls, permissions, and API boundary.
- Integrate Breakout Rooms, Chat, and Waiting Room as compact capability evidence.

### Phase 6: Motion And Responsive Behavior

- Add only state, sequence, and focus motion.
- Pause video outside the viewport and expose playback controls where needed.
- Support reduced motion and static fallbacks.
- Verify intentional desktop, tablet, and mobile composition.

### Phase 7: Verification

- Validate facts, product boundaries, bilingual equivalence, and media captions.
- Run lint, unit tests, content validation, production build, Playwright, and visual tests.
- Verify navigation, locale inheritance, keyboard interaction, contrast, media behavior, and responsive layouts.
- Test the 30-second, 3-minute, and 10-minute hiring-manager reading paths.

## Failure And Fallback Behavior

- Missing media renders a clearly labeled evidence slot during development and blocks publication status.
- Failed or disabled video falls back to a readable static poster and equivalent caption.
- Reduced-motion mode uses static sequences without losing narrative meaning.
- A missing translated route follows the portfolio's existing locale fallback behavior.
- The page must remain fully understandable when JavaScript-driven motion is unavailable.

## Approval Record

The user approved:

- The hybrid editorial case-study direction with controlled interactive evidence.
- The nine-chapter website structure.
- The component architecture.
- The visual asset scope.
- The implementation sequence and verification criteria.

No website implementation is authorized by this specification alone; implementation begins only after the user explicitly requests it.
