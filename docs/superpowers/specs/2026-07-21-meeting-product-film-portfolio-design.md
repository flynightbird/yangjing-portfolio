# Agora Meeting Product Film Portfolio Design

**Date:** 2026-07-21
**Branch:** `codex/meeting-product-showcase`
**Audience priority:** Overseas hiring managers 70%, domestic freelance clients 30%
**Approved direction:** Product Film, cinematic first half and evidence-led second half

## 1. Evidence And Gaps Ledger

| Claim | Label | Source | Corroboration status | Confidence | Next action |
|---|---|---|---|---|---|
| The Figma file contains one production-design page with 3,918 top-level nodes spanning mobile meeting states, Breakout Rooms, whiteboard and screen sharing, chat, captions, transcription, and translation. | **Fact** | Supplied Figma file `LbagoAHs57vyPH7z0mZH1w`, inspected through the Plugin API | Direct artifact evidence | High | Select only the states that explain consequential decisions. Do not reproduce the design workspace as a screenshot wall. |
| The strongest Figma clusters are adaptive meeting layouts, shared-content reflow, and real-time information controls. | **Fact** | Figma frames and headings, including mobile grid, landscape whiteboard, chat, captions, and translation states | Direct artifact evidence | High | Use these as the three film acts. |
| Existing portfolio code contains static Meeting evidence for the hero, adaptive layout, cross-device whiteboard, information layer, state matrix, participant priority, capability system, and delivery coverage. | **Fact** | Tracked files under `public/images/meeting/` and Meeting components | Direct repository evidence | High | Reuse these assets in the evidence half until final replacements arrive. |
| App recordings cover stage changes, shared content, and the real-time information layer. | **Fact:** Designer-reported | User confirmation: `A B C` | Raw recordings are not yet present in the repository | Medium | Request and inventory the source clips before implementation. |
| The App recordings show shipped product rather than prototypes. | **Fact:** Designer-reported | User selected status `A` | No release record or raw clip has yet been inspected | Medium | Label as shipped only after the supplied clip is inspected; preserve the attribution boundary in internal evidence notes. |
| The designer worked as sole product designer from 2024 to 2026 across desktop, Web, tablet, and mobile. | **Fact:** Designer-reported | Existing bilingual portfolio metadata | No collaborator or release artifact supplied in this task | Medium | Keep role language consistent and avoid implying sole team delivery. |
| Web recordings are sparse because final Web visual presentation and recording are not ready. | **Fact:** Designer-reported | User brief | No Web recording inventory supplied | High | Use Web as a supporting cut and system proof, not as a parallel film chapter. |
| Host Focus and Personal Pin are not valuable to the public story. | **Fact:** Designer preference | Prior approved direction | Confirmed by existing implementation and tests | High | Keep both absent from copy, data models, media captions, and visual evidence. |
| Adoption, satisfaction, conversion, efficiency, and business impact are not supported. | **Gap** | No supplied outcome artifact | Missing | High | Do not claim quantitative impact. Ask for release notes, customer feedback, analytics, or stakeholder evidence if available later. |
| Final App source clips, portrait/landscape pairs, captions, posters, and checksums are not yet in the repository. | **Gap** | Repository inventory | Missing | High | Add an asset intake and validation task before building the film sequence. |
| A product-film structure can increase memorability without reducing hiring signal if the evidence layer remains explicit. | **Recommendation** | Portfolio strategy based on audience and available assets | To be validated through review and usability checks | Medium | Test scan comprehension at 15 seconds, 60 seconds, and interview depth. |

## 2. Project Positioning

**Recommendation:** Position Agora Meeting as a shipped real-time collaboration system that continuously reorganizes the interface around the meeting's current priority.

Primary argument:

> A meeting changes faster than a fixed interface. Agora Meeting reads people, content, and device context so the most important information stays primary.

Chinese equivalent:

> 会议变化快于固定界面。Agora Meeting 根据参与者、当前内容与设备环境，让此刻最重要的信息始终处在主位。

Scope line:

> Designer-reported sole product designer, 2024-2026 · Desktop, Web, tablet, and mobile · Shipped product recordings pending asset inspection

The first scan must sell the product experience. The second scan must prove the design judgment behind it.

## 3. Chapter Architecture

The case study becomes a Product Film with a deliberate tonal turn. The first half is cinematic and driven by shipped App recordings. The second half is editorial, calm, and evidence-led.

| Chapter | Driving question | Primary evidence | Presentation mode |
|---|---|---|---|
| 00. Cold Open | What is this product and why should I keep watching? | `Agora Meeting`, role and scope, a 10-12 second App film loop | Dark, full-width product stage |
| 01. The Challenge | Why can one fixed meeting layout not work? | Three changing inputs: people, content, device | Three rapid state changes with one sentence of context |
| 02. Act One: Stage Adapts | How does the interface decide what belongs in the main stage? | Grid, speaker, large-small window, portrait-landscape states | Primary App recording with short film titles |
| 03. Act Two: Content Takes The Stage | What happens when the meeting becomes a working session? | Whiteboard and screen-share reflow | App recording as hero, one Web cut as cross-device proof |
| 04. Act Three: Information Follows | How can live information remain available without replacing the task? | Captions, translation, chat, appear-move-collapse states | App recording with one desktop information-layer cut |
| 05. The Turn | What system produced the film viewers just watched? | Product-film result reframed as system evidence | Coral title intermission, motion settles |
| 06. System Reveal | How do context, priority, roles, and device become interface rules? | Context-to-priority-to-interface model, cross-device matrix, permissions, language governance | Light editorial field with diagrams and paused keyframes |
| 07. Shipped Evidence | What did the designer own and what can be proved? | Delivery coverage, role boundaries, Figma decision evidence, component and API boundaries | Compact evidence grid and optional deep dives |
| 08. Reflection / End Title | What was learned and what remains unverified? | Component-governance reflection, missing outcome evidence, next validation | Dark closing title with restrained next-project navigation |

The default story still maps to Context -> Challenge -> Insight -> Strategy -> System -> Key Experiences -> Impact -> Reflection:

- Context and Challenge appear in chapters 00-01.
- Insight and Strategy are expressed through the repeated priority rule across Acts One to Three.
- System appears explicitly after the tonal turn.
- Key Experiences are the three film acts.
- Impact is limited to verified shipping evidence and intended effects.
- Reflection closes the story without invented metrics.

## 4. Visual Direction

**Recommendation:** Build a product-film portfolio page, not a simulated Meeting application and not a long-form report.

- **Hierarchy:** `Agora Meeting` remains the H1. Film titles are concise supporting statements, never feature-list headings.
- **Composition:** The first half alternates full-width moving media with short title frames. The second half uses a stable 12-column evidence grid.
- **Product media:** Real shipped recordings are the visual source of truth. The portfolio page adds cropping, sequencing, focus, and captions but does not redraw the product UI.
- **App and Web relationship:** App footage is the main camera. Web footage or static UI appears only as a cross-cut that proves the same rule at another scale.
- **Color:** Dark neutral film stage, existing coral transition accent, light paper evidence field, restrained cobalt only for system relationships. No decorative gradients or generic tech effects.
- **Typography:** Existing portfolio sans system. Large but bounded product titles, compact decision copy, and mono evidence labels. Letter spacing remains zero.
- **Motion:** Motion must explain change of state. Use hard cuts, matched cuts, crop expansion, and brief title intermissions. Avoid parallax, floating decoration, and constant scroll-linked movement.
- **Density:** Film chapters show one product idea at a time. Evidence chapters can be denser but must remain readable without zooming.
- **Media controls:** Videos are muted and `playsInline`. Autoplay is limited to short loops. Pause, replay, captions, posters, and reduced-motion fallbacks remain available.
- **Accessibility:** `prefers-reduced-motion` replaces sequence transitions with poster frames. No meaning depends on autoplay or sound.

### Portrait And Landscape Rule

The approved main-film treatment is a matched cut:

1. End the portrait recording on a stable action or shared state.
2. Animate the device/media container from portrait proportion toward landscape proportion.
3. Swap from the native portrait source to the native landscape source at the transition midpoint.
4. Continue with an upright native landscape recording.

Do not rotate the video pixels with CSS as the final state. Direct rotation risks sideways UI, black bars, blurred scaling, incorrect native controls, and unstable mobile layout.

The evidence chapter may show portrait and landscape keyframes side by side because comparison, not cinematic scale, is its communication job.

## 5. Visual Asset Plan

| Asset | Communication job | Source evidence | Format | Placement | Status |
|---|---|---|---|---|---|
| Cold-open product loop | Orient and create immediate product desire | **Fact:** Designer-reported shipped App recordings | 10-12 second muted MP4/WebM plus poster | Hero | **Gap:** Source file not supplied |
| Stage portrait clip | Establish the starting meeting state | **Fact:** Designer-reported recording coverage | Native portrait video, 5-12 seconds | Act One | **Gap:** Source file not supplied |
| Stage landscape clip | Prove the orientation and priority change | **Fact:** Designer-reported recording coverage | Native landscape video, 5-12 seconds | Act One matched cut | **Gap:** Source file not supplied |
| Whiteboard/share clip | Show content becoming primary | **Fact:** Figma and existing static evidence | Native App recording | Act Two | **Gap:** Source file not supplied |
| Web whiteboard frame | Prove the rule across a wider surface | **Fact:** Figma Web whiteboard frames | Static or very short Web cut | Act Two supporting cut | **Gap:** Final Web recording optional |
| Captions/translation/chat clip | Show information following the task | **Fact:** Figma caption, translation, and chat states | Native App recording | Act Three | **Gap:** Source file not supplied |
| Context-priority-interface model | Explain the central system rule | **Fact:** Existing model | Diagram | System Reveal | Available, may need visual adaptation |
| Orientation comparison | Explain what changed between portrait and landscape | **Fact:** Figma orientation states and supplied clips | Two annotated keyframes | System Reveal | Provisional until clips arrive |
| Cross-device matrix | Prove consistency and intentional differences | **Fact:** Existing static evidence | Matrix/diagram | System Reveal | Available |
| Permission and language evidence | Reveal role and governance complexity | **Fact:** Figma and current case content | Compact rule table | System Reveal | Available |
| Breakout Room decision artifact | Demonstrate edge-state and implementation depth | **Fact:** Figma artifact | Cropped decision sequence | Shipped Evidence deep dive | Available |
| Evidence boundary panel | Separate shipping from unsupported outcomes | **Gap:** No quantitative outcome evidence | Text and status panel | Shipped Evidence | Required |

### Video Intake Contract

For the orientation sequence, request two original files:

```text
meeting-stage-portrait.mp4
meeting-stage-landscape.mp4
```

Both should show the same meeting, people, and content where possible. Preserve 1-2 seconds of overlap around the orientation change. Do not pre-rotate, crop, add a device frame, or compress for delivery before handoff.

## 6. Screen-Level CPDI

### Act One: Adaptive Stage

- **Context - Fact:** Figma contains grid, speaker, large-small window, portrait, landscape, and participant-count states.
- **Problem - Recommendation:** A fixed responsive grid cannot determine which person or content deserves the main stage as the meeting changes.
- **Decision - Recommendation:** Present the shipped stage as a context-driven system. Use people, current content, and device as the three visible triggers. Match-cut portrait and landscape recordings instead of rotating a single video.
- **Impact - Fact:** Designer-reported shipped App recording. Intended effect: preserve continuity and information priority through state and orientation changes. **Gap:** No outcome study supplied.

### Act Two: Shared Content

- **Context - Fact:** Figma and existing assets show whiteboard and shared-content states across App and Web.
- **Problem - Recommendation:** Canvas, video, controls, and collaboration feedback compete for limited space.
- **Decision - Recommendation:** Let the canvas become primary while participant awareness moves to a supporting layer. Use App footage for the experiential proof and one Web frame for cross-device consistency.
- **Impact - Fact:** Designer-reported shipped product scope. Intended effect: keep work content legible without losing meeting awareness. **Gap:** No verified task-success evidence supplied.

### Act Three: Real-Time Information

- **Context - Fact:** Figma includes captions, movable caption states, translation modes, chat, transcript, and permission states.
- **Problem - Recommendation:** Live information can obscure the shared task or imply the same control boundary for personal and meeting-level data.
- **Decision - Recommendation:** Show information appearing, moving, and collapsing around the task. Preserve the distinction between personal captions and governed transcript controls in the evidence layer.
- **Impact - Fact:** Designer-reported shipped product recording. Intended effect: make information available without taking over the stage. **Gap:** No comprehension or adoption evidence supplied.

### System Reveal

- **Context - Fact:** The Figma workspace documents many role, state, device, and edge-case permutations.
- **Problem - Recommendation:** Showing every screen would communicate effort but not judgment.
- **Decision - Recommendation:** Reduce the workspace to one context-priority-interface model, one cross-device matrix, and two compact governance examples.
- **Impact - Recommendation:** The intended portfolio effect is to make the product logic explainable within 60 seconds while retaining interview depth.

## 7. Three-Minute Narrative

Agora Meeting is a real-time collaboration system designed across desktop, Web, tablet, and mobile. My reported role was sole product designer from 2024 to 2026. The App footage in this case study is reported as shipped product; final source inspection and release corroboration remain part of publication readiness.

The central problem was not responsive layout. A meeting can change its participants, active content, permissions, and available space within seconds. A fixed interface can resize, but it cannot decide what matters now.

The product film shows three consequences of that problem. First, the stage adapts as a meeting moves between people, speaker focus, and orientation. Second, whiteboard or screen sharing becomes the primary task while participant awareness moves to a supporting layer. Third, captions, translation, and chat follow the task rather than replacing it.

After the film, the case study reveals the rule beneath those moments: context leads to information priority, and information priority leads to interface. The system connects people, content, roles, and device conditions across four surfaces. Web is not treated as a weaker duplicate of App footage; it is used where it proves the same rule at a wider scale.

The strongest supported result is production delivery, not an invented adoption or efficiency claim. The reflection is that meeting design is the ongoing act of choosing what should remain primary, and that future work should preserve stronger release, user, and outcome evidence alongside the interface system.

## 8. Ten-Minute Deep Dive

1. **0:00-1:00 - Product and scope:** Establish Agora Meeting, reported role, four-surface scope, and the evidence boundary.
2. **1:00-2:00 - Challenge:** Explain why people, content, roles, and devices make fixed responsive layouts insufficient.
3. **2:00-3:20 - Act One:** Walk through grid, speaker, large-small window, and portrait-landscape continuity. Explain the priority rule and matched-cut portfolio treatment.
4. **3:20-4:35 - Act Two:** Show whiteboard and screen-share reflow. Explain why content becomes primary and how Web supports the cross-device proof.
5. **4:35-5:45 - Act Three:** Show captions, translation, and chat. Explain personal preference versus meeting-level governance.
6. **5:45-7:00 - System model:** Reveal context-to-priority-to-interface, cross-device logic, roles, permissions, and edge states.
7. **7:00-8:15 - Delivery:** Use Breakout Rooms and capability evidence to show implementation breadth, constraints, and collaboration boundaries.
8. **8:15-9:15 - Evidence and impact:** State what is reported as shipped, what artifacts corroborate design decisions, and what outcome evidence is missing.
9. **9:15-10:00 - Reflection:** Discuss component governance, evidence preservation, and what would be validated next.

## 9. Interview Questions

| Question | Evidence-based answer direction | Status |
|---|---|---|
| What did you own, co-create, influence, or inherit? | Separate reported sole-design ownership from product, engineering, QA, and customer-team delivery. | **Gap:** Collaborator map not supplied |
| What evidence shows these recordings are shipped product? | Reference the supplied raw clips and add release or production corroboration if available. | **Gap:** Source clips and release evidence pending |
| Why use a context model instead of responsive breakpoints alone? | Explain that breakpoints size layouts, while context and priority determine the main content. | **Fact:** Supported by the state-rich Figma artifact |
| How did the portrait-to-landscape transition work in product versus portfolio? | Product changes orientation natively; the portfolio swaps two native sources through a matched cut and never claims the transition animation is product behavior. | **Recommendation:** Explicit attribution prevents confusion |
| Why is App the main film surface? | App has the strongest shipped dynamic evidence. Web appears where it proves system consistency rather than to balance asset counts. | **Fact:** Designer-reported asset availability |
| Why can captions be personal while transcripts require governance? | Explain the distinction between individual comprehension controls and meeting-level shared data. | **Fact:** Existing case and Figma states support the control distinction |
| Which alternatives were rejected? | Compare static side-by-side orientation, direct video rotation, and matched cuts; explain legibility and evidence tradeoffs. | **Recommendation:** Preserve as an interview-ready decision |
| What changed for users or the business? | State production delivery only unless outcome evidence is later supplied. | **Gap:** No verified outcome evidence |
| What failed or would you change? | Establish cross-platform component governance and evidence capture earlier. | **Fact:** Existing reflection; corroboration remains limited |

## 10. Hiring-Manager Evaluation And Priorities

| Dimension | Current signal | Credibility risk | Highest-leverage revision |
|---|---|---|---|
| User understanding | Meeting context and information competition are visible in Figma states. | Direct research evidence remains limited. | Tie each film act to a specific user tension and label intended effects honestly. |
| Systems thinking | Strong state, device, role, and governance evidence. | The raw Figma workspace can look like exhaustive production documentation. | Show one model, one matrix, and two governance examples. |
| Business understanding | aPaaS and customer-configurability context exists in the prior case. | No business outcome proof supplied. | Keep product stakes concise and avoid growth or efficiency claims. |
| Complexity to clarity | Product Film provides a memorable transformation. | Cinematic pacing could hide the actual logic. | Make the tonal turn explicit and readable within 60 seconds. |
| Decision quality | Three consequential experience decisions are available. | Fast video alone cannot expose tradeoffs. | Pause each act on one keyframe with Context, Problem, Decision, and intended Impact. |
| Leadership and role clarity | Reported sole-designer scope across four surfaces is substantial. | Sole-design wording may be mistaken for sole team delivery. | Add owned, co-created, influenced, inherited, and out-of-scope boundaries. |
| Visual storytelling | Real product motion can create a distinctive portfolio moment. | Overproduction could feel like marketing and reduce trust. | Let real product footage carry spectacle; keep portfolio motion purposeful and reversible. |

Revision priority:

1. Collect and inspect the three App recording groups, starting with the portrait-landscape stage pair.
2. Build the cold open and three film acts around real product moments.
3. Create the tonal turn and evidence half without losing existing system thinking.
4. Adapt Web static evidence as cross-device proof rather than forcing a Web film chapter.
5. Add evidence status, role boundaries, reduced-motion behavior, and accessible media controls.
6. Validate 15-second attraction, 60-second comprehension, and 10-minute interview depth.

## Interaction And Verification Contract

- Preserve `/zh/work/meeting/` and `/en/work/meeting/`.
- Preserve bilingual parity, legacy deep links, semantic headings, and keyboard accessibility.
- Keep Host Focus and Personal Pin absent.
- Do not simulate the full Meeting product in portfolio code.
- Use real recordings for product behavior and explicitly separate portfolio transition behavior.
- Every video must have a stable aspect ratio, poster, caption, fallback, and reduced-motion treatment.
- The portrait-landscape sequence uses two native media sources and swaps them at a tested transition boundary.
- Film chapters must remain understandable when video fails, autoplay is blocked, or motion is reduced.
- Verify desktop at 1440x1000 and 1728x1117; mobile at 390x844 and 430x932; short landscape at 844x390; and print.
- Test media load failure, keyboard controls, focus visibility, text overflow, horizontal overflow, and layout stability.
- Evaluate whether the product, role, and main argument are understandable in 15 seconds and whether the system logic is understandable in 60 seconds.

## Out Of Scope

- Recreating or simulating the Meeting application in the portfolio.
- Rotating a single video source as the final landscape presentation.
- Requiring equal App and Web recording volume.
- Inventing adoption, satisfaction, conversion, or efficiency metrics.
- Restoring Host Focus or Personal Pin.
- Reworking unrelated portfolio case studies or the global homepage.
