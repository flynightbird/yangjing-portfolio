# Agora Meeting Product Showcase Design

**Date:** 2026-07-19
**Branch:** `codex/meeting-product-showcase`
**Audience priority:** Overseas hiring managers 70%, domestic freelance clients 30%

## 1. Evidence And Gaps

- **Fact:** The current bilingual case study states that Agora Meeting shipped across desktop, Web, tablet, and mobile, and identifies the designer as the sole product designer over 1.5 years.
- **Fact:** The current page contains three substantial product decisions: an adaptive meeting stage, a whiteboard workspace, and a governed real-time information layer.
- **Fact:** Existing artifacts include product screens, cross-device compositions, state models, a capability map, a Figma breakout-room decision artifact, and temporary poster/video slots.
- **Fact:** The current page is organized as eight consecutive chapters and requires reading multiple paragraphs before the strongest product experiences become visible.
- **Fact:** Host Focus and Personal Pin have already been removed from the published story and must remain absent.
- **Gap:** No supplied evidence supports adoption, satisfaction, conversion, or efficiency metrics.
- **Gap:** Final product imagery and video have not been supplied. Current media must be treated as temporary without judging or replacing it.
- **Recommendation:** Preserve shipped scope and decision evidence, but change the default reading experience from a long retrospective article to a product-first showcase with optional depth.

## 2. Positioning

**Recommendation:** Position Agora Meeting as a shipped, cross-platform real-time collaboration product whose interface reorganizes itself around the meeting's current priority.

Primary proposition:

> One meeting system, designed to keep the right content primary across four device classes.

Chinese equivalent:

> 一套会议系统，让四类终端始终把此刻最重要的内容放在主位。

Scope line:

> Sole product designer · Desktop, Web, tablet, and mobile · Shipped

The page must communicate product quality and delivery scope in the first scan. It must then prove judgment through three decisions instead of asking visitors to read the full process before seeing the work.

## 3. Chapter Architecture

The route and bilingual support remain unchanged. The visible narrative changes from eight equal chapters to six paced bands:

| Band | Question answered | Primary evidence |
|---|---|---|
| Product hero | What is this product, what did the designer own, and why should I keep looking? | Product name, proposition, four-platform scope, shipped status, strong temporary hero media |
| Product in one scan | What makes the system valuable? | Three concise product outcomes and a compact context-to-priority-to-interface model |
| Three signature experiences | Which decisions demonstrate product judgment? | Adaptive stage, whiteboard workspace, real-time information layer |
| System beneath the screens | How does the product remain coherent across devices and changing states? | State matrix, participant priority, language governance, cross-device logic |
| Delivery breadth | Can this designer handle a real product beyond three polished screens? | Breakout Rooms, Chat, Waiting Room, Figma decision evidence, four-platform delivery |
| Outcome and reflection | What shipped, what is honestly known, and what would improve next? | Evidence boundary, shipped scope, component-governance reflection |

The existing business trigger, customer-input limitations, default-versus-configurable strategy, permissions reasoning, and component-governance reflection remain in the page. They move into short evidence notes or expandable deep-dive blocks adjacent to the product moment they explain.

## 4. Visual Direction

**Recommendation:** Use a restrained product-launch composition rather than an editorial report layout.

- **Hierarchy:** `Agora Meeting` is the H1. The proposition is supporting copy, not part of the headline. Large product media follows immediately and leaves a visible hint of the next band in the first viewport.
- **Grid:** Full-width page bands with a consistent 12-column inner grid. Text occupies 4-5 columns; primary media occupies 7-8 columns or spans the full grid. No card-inside-card composition.
- **Pacing:** Alternate product-scale media, short decision copy, and compact system evidence. Avoid long uninterrupted reading columns.
- **Typography:** Preserve the portfolio's existing type system. Use compact display sizing for the product name, readable body sizing, and small mono labels for evidence and platform metadata. Letter spacing remains zero.
- **Color:** Preserve the light paper surface, dark ink, coral decision accent, and restrained cobalt system accent. Color encodes product decisions and state relationships rather than decoration.
- **Media treatment:** Temporary media uses stable aspect ratios, neutral framing, and honest captions. Layout quality must not depend on the final images having a particular crop.
- **Motion:** Use only restrained entrance or media-state transitions when they clarify sequence. Reduced-motion behavior remains complete. No decorative parallax, floating shapes, or marketing effects.
- **Navigation:** Replace the visually dominant eight-item chapter rail with a compact sticky section navigator appropriate to six bands. Deep links remain stable through mapped IDs or aliases where practical.

## 5. Visual Asset Plan

| Asset | Communication job | Placement | Status |
|---|---|---|---|
| Hero product frame | Orient the visitor to the actual shipped product | Product hero | **Fact:** Temporary product image exists |
| Three-outcome proof strip | Make scope and product value scannable | Below hero | **Recommendation:** Derived from verified shipped scope, no invented metrics |
| Adaptive-stage media | Show the interface responding to meeting context | Signature experience 1 | **Fact:** Temporary poster and video slot exist |
| Whiteboard cross-device composition | Prove cross-device spatial judgment | Signature experience 2 | **Fact:** Existing composition exists |
| Real-time information media | Show captions, transcription, translation, and governance | Signature experience 3 | **Fact:** Temporary poster and video slot exist |
| Context-priority-interface model | Explain the central design logic | Product in one scan / system layer | **Fact:** Existing model exists |
| Compact state and priority evidence | Reveal rules beneath the polished screens | System layer | **Fact:** Existing models exist |
| Capability and breakout evidence | Demonstrate breadth and implementable edge-state thinking | Delivery breadth | **Fact:** Existing capability map and Figma evidence exist |

No new decorative imagery is required. Final image replacement remains outside this redesign.

## 6. Screen-Level CPDI

### Adaptive Meeting Stage

- **Context:** A meeting continuously moves between conversation, screen sharing, whiteboarding, and different participant counts.
- **Problem:** Responsive scaling alone cannot decide which information deserves the main stage.
- **Decision:** Use screen sharing, whiteboard activation, and participant count as primary triggers; resolve information priority before resolving layout.
- **Impact:** **Fact:** The state-driven stage shipped across four device classes. No quantitative outcome is claimed.

### Whiteboard Workspace

- **Context:** Participants create or review content while maintaining awareness of others in the meeting.
- **Problem:** Canvas, participant video, and controls compete for limited space, especially in mobile portrait orientation.
- **Decision:** Make the canvas primary, adapt spatial structure by device, and use one participant-priority rule rather than screen-specific exceptions.
- **Impact:** **Fact:** The cross-device whiteboard layouts shipped. No unsupported usability improvement is claimed.

### Real-Time Information Layer

- **Context:** Participants need live understanding, translation, and transcription during a meeting.
- **Problem:** Personal comprehension preferences and meeting-level transcript governance require different control boundaries.
- **Decision:** Keep captions personal; give transcript start/stop authority to the host while allowing participant requests; organize language, translation, bilingual output, and interpretation as one layer.
- **Impact:** **Fact:** The in-meeting language experience shipped, with transcript data exposed through the customer API.

## 7. Three-Minute Narrative

Agora Meeting was created as a shippable meeting capability for customers who needed an alternative they could integrate into their own products. As the sole product designer, I worked across desktop, Web, tablet, and mobile for 1.5 years.

The central design problem was not responsive layout. A live meeting constantly changes its participants, content, permissions, and available space. I built the experience around one rule: identify the current context, decide what information must remain primary, and then resolve the interface for the device.

Three shipped decisions show that system. The meeting stage responds to screen sharing, whiteboard activation, and participant count. The whiteboard keeps the canvas primary while preserving participant awareness through a shared priority rule. The real-time information layer separates personal caption preferences from host-governed transcription and language controls.

Those decisions extended into a broader product with Breakout Rooms, Chat, and Waiting Room across four device classes. The strongest verified outcome is production delivery, not an invented engagement metric. My main reflection is that the state model was stronger than the component governance: next time, I would establish shared cross-platform component ownership earlier.

## 8. Ten-Minute Deep Dive

The deep-dive layer preserves the original case-study thinking without making it the default page experience. It covers:

1. The Zoom market context and customer-integration need.
2. The designer's role, team collaboration, and the limitation that customer input came through requirements and product-manager synthesis rather than direct interviews.
3. The distinction between high-coverage defaults and repeated differences that became configurable capabilities.
4. The context-to-priority-to-interface model and its cross-platform implications.
5. Detailed CPDI for the adaptive stage, whiteboard, and information layer.
6. State, participant-priority, permission, and language-governance rules.
7. Breakout-room limits, disabled states, and deletion edge cases as implementation evidence.
8. Honest delivery scope, missing quantitative evidence, and the component-governance reflection.

This content appears through compact “Design rationale” and “System detail” disclosures placed beside the relevant product experience, not as a separate wall of prose.

## 9. Interview Questions

- What did you own as the sole product designer, and what was co-created with product, engineering, QA, and customer teams?
- Why was a state model more appropriate than a conventional responsive layout system?
- Which alternative stage rules were considered, and why were three triggers retained?
- How did the participant-priority model behave across device and orientation changes?
- Why are captions personal while transcription is host-governed?
- How did customer differences become configurable capabilities rather than one-off layouts?
- What evidence confirms shipping, and what outcome evidence remains unavailable?
- What would earlier component governance have changed for delivery and maintenance?

## 10. Hiring-Manager Evaluation And Priorities

- **User understanding:** Preserve meeting contexts and role/permission tensions, but remove repeated explanation.
- **Systems thinking:** Lead with the context-to-priority-to-interface model and support it with compact state evidence.
- **Business understanding:** Keep the market trigger, customer integration context, and default-versus-configurable strategy.
- **Complexity to clarity:** Make the product and three signature decisions understandable in under 60 seconds.
- **Decision quality:** Attach one concise rationale and tradeoff to every major screen sequence.
- **Leadership and role clarity:** State sole-designer scope without implying sole team delivery; retain collaboration boundaries.
- **Visual storytelling:** Let real product media lead, use diagrams only to explain invisible rules, and keep temporary assets replaceable.

Revision priority:

1. Rebuild the hero and first scan around product, scope, and three outcomes.
2. Restructure the body into three product moments with CPDI and strong media hierarchy.
3. Move original reasoning into progressive deep-dive disclosures.
4. Consolidate system evidence and capability breadth.
5. Verify bilingual scanability, responsive behavior, accessibility, and stable media slots.

## Interaction And Testing Contract

- Preserve `/zh/work/meeting/` and `/en/work/meeting/`.
- Preserve bilingual content parity and semantic heading order.
- Keep Focus/Pin absent.
- All expandable rationale remains keyboard accessible and useful without JavaScript animation.
- Stable aspect ratios prevent temporary or final media from shifting the layout.
- Desktop verification: 1440x1000 and a wide 1728px viewport.
- Mobile verification: 390x844 and 430x932.
- Validate the first scan, all three signature experiences, disclosure controls, deep links, focus states, reduced motion, text overflow, and horizontal overflow.
- Existing baseline failures caused by missing private or temporary publication assets remain separately documented and must not be presented as redesign regressions.

## Out Of Scope

- Replacing or judging temporary product imagery and video.
- Inventing business or user outcome metrics.
- Reworking unrelated case studies or the global homepage.
- Restoring Host Focus or Personal Pin.
- Changing the product's underlying feature scope.
