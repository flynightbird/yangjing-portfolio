# ConvoAI Case Study Design Specification

Date: 2026-07-21

Status: Approved design direction, pending written-spec review

## 1. Objective

Create a senior product-design portfolio case study for ConvoAI, a shipped App and Web product for one-to-one real-time AI conversation.

The case study must demonstrate:

- AI interaction judgment beyond a conventional chat interface.
- Systems thinking across RTC, RTM, ASR, LLM, TTS, voiceprint, video, subtitles, hardware, and digital humans.
- Cross-platform design decisions rather than separate App and Web feature inventories.
- Clear personal scope and credible evidence boundaries.
- High visual impact without compromising product legibility or media completeness.

The central narrative is:

> Make invisible real-time states perceptible, interruptible, and recoverable.

Chinese publication line:

> 让不可见的实时状态，变得可感知、可介入、可恢复。

## 2. Evidence And Scope

### Supported inputs

- Figma file: `ConvoAI demo`, file key `n9nbMEMgwDD4ESUg2WYhiZ`.
- Starting Figma canvas: `39530:4969`.
- Nine App recordings totaling 132.219 seconds.
- Seven Web recordings totaling 144.167 seconds.
- Sixteen recordings in total.
- Figma evidence includes ready, listening, speaking, interruption, photo, camera, avatar, subtitles, mute, settings, voiceprint, and timeout states.

### Attributed statements

- `Designer-reported: Independently responsible for product design.`
- `Designer-reported: Product formally launched.`
- `Designer-reported: Product was used for customer experience demonstrations.`

### Responsibility statement

Publish the role as responsibility for product structure, core interaction, cross-platform experience, and visible real-time state expression.

Do not present RTC or RTM infrastructure, AI models, digital-human rendering, or production code as the designer's individual output.

Do not claim unsupported adoption, conversion, satisfaction, sales, or business metrics.

The published case study must not include a section titled `Gap` or `缺口`.

## 3. Audience And Evaluation Goal

Primary audience: hiring managers evaluating senior product designers who combine AI experience design with complex-system capability.

The page should communicate at three depths:

1. Scan depth: understand the product, role, central problem, and strongest product moments within 30 seconds.
2. Read depth: understand five consequential design decisions and their cross-platform evidence.
3. Interview depth: support a 10-minute explanation of state modeling, platform differences, tradeoffs, scope, and delivery.

## 4. Narrative Architecture

The page uses five decision acts rather than separate App and Web chapters.

### Opening: Product and thesis

Question: what is ConvoAI and why is a real-time AI call different from a normal chat page?

Evidence:

- Real Web ready state as the primary opening image.
- Product name `ConvoAI` as the H1.
- Role, scope, product, and launch status.
- Three principles: perceptible state, user intervention, and recoverable conversation.

### Act I: Establish conversation readiness

Question: how does the user know when the conversation can begin?

Shared state sequence:

`Configure -> Permission -> Connecting -> Ready -> Listening -> Exit`

Media:

- App: `登录页.mp4`, 3.200s.
- App: `页面结构.mp4`, 9.357s.
- App: `对话交互启动.mp4`, 12.134s.
- Web: `web-登录.mp4`, 5.300s.
- Web: `web-启动前.mp4`, 25.267s.
- Web: `web-启动前的交互:布局.mov`, 17.928s.
- Web: `web-加入和退出.mov`, 22.598s.

Primary evidence: Web joining and exiting establishes the full session boundary.

Supporting proof: App startup shows permission, connection, and first ready feedback in a compact mobile posture.

### Act II: Protect user control

Question: how does the user understand the current turn and reclaim it when AI is speaking?

Media:

- App: `开启字幕和摄像头后的ai互动.mp4`, 22.833s.
- Web: `web-聊天互动.mov`, 35.135s.
- Web: `web- 语音打断.mov`, 11.482s.

Primary evidence: Web preserves transcript, central state, and interruption history in one view.

Supporting proof: App demonstrates the same turn-taking principle under camera, subtitle, and control-density constraints.

### Act III: Prepare a trusted participant

Question: who and what are allowed to participate in the conversation?

Media:

- App: `个人设置.mp4`, 27.834s.
- App: `声纹锁定.mp4`, 23.834s.
- App: `添加硬件设备.mp4`, 14.167s.

Voiceprint is a consequential design decision, not a settings footnote.

Explain the tradeoff among:

- Off: no voice identity protection.
- Seamless Mode: low-friction automatic learning.
- Personalized Mode: explicit recording for stronger control.

Show the complete personalized flow: mode choice, read-aloud text, press-and-hold recording, minimum duration, release to save, slide to cancel, success, and upload state.

### Act IV: Extend the AI's embodied form

Question: how does the interface move from choosing a digital human to interacting with it without losing conversation state?

Media:

- App: `选择数字人.mp4`, 9.967s.
- App: `开启数字人后的交互.mp4`, 8.893s.

Focus on expectation setting, connection, turn state, camera activation, and picture-in-picture hierarchy.

### Act V: Make the system observable

Question: when the experience feels slow, how can the system make the cause discussable?

Media:

- Web: `web-实时监控数据.mov`, 26.457s.

Map visible delay to E2E, RTC, AI Audio, ASR, LLM, TTS, and Voiceprint status. Present this as system evidence inside the conversation context, not as a detached analytics dashboard.

### Closing: Delivery and reflection

State the attributed launch status and personal scope.

Close on the design principle:

> Control in an AI conversation does not come from adding more controls. It comes from consistently expressing current state, available action, and recovery path.

## 5. Cross-Platform Editorial Rule

App and Web are combined by decision, not by platform.

Use the pattern `primary evidence + platform proof`:

- Choose the platform that best exposes the full design problem as primary.
- Use the second platform to prove that the same state model adapts to a different posture.
- Do not mechanically split every section 50/50.
- Do not add a Web counterpart when the evidence is genuinely App-specific.
- Do not add an App counterpart when the evidence is genuinely Web-specific.

Desktop comparison layout is asymmetric:

- Web uses the wider track.
- App preserves its vertical ratio in a narrower track.
- Both retain stable media dimensions.

Mobile comparison layout stacks primary evidence first and supporting proof second.

## 6. Global Detail Navigation

The existing portfolio detail framework remains unchanged in structure and identity.

### Top navigation

- Retain the shared site header component, dimensions, links, locale action, and capsule behavior.
- Do not apply ConvoAI cyan, blue, or coral to global navigation.

### Left chapter navigation

- Retain the shared chapter rail component and responsive chapter drawer.
- Chapter labels describe decisions, not platforms.
- Recommended labels: Context, Thesis, Ready, Interrupt, Trusted Participant, Avatar, Real-time System, Delivery.

### Color behavior

Navigation may switch between the existing global light and dark semantic variants when section backgrounds change. This is background-aware behavior in the shared detail framework, not project-specific theming.

Dark navigation tokens:

- Surface: existing dark capsule or rail surface.
- Text: `#F2F4F0`.
- Active and hover accent: global iris luminous `#C8B9FF`.
- Border: `rgba(242, 244, 240, 0.16)`.

Light navigation tokens:

- Surface: existing light capsule or rail surface.
- Text: `#10110F`.
- Active and hover accent: global iris deep `#5F4B86`.
- Border: `rgba(16, 17, 15, 0.24)` or the existing component token.

Top and left navigation must switch tone from one shared section state. They must never disagree at a chapter boundary.

## 7. Visual Direction

Direction: alternating product theatre and editorial reasoning.

### Dark product stages

Use for real product moments, cross-platform stage openers, interruption, digital-human interaction, and monitoring evidence.

- Canvas: near-black `#0B0D0F`.
- Surface: `#171A1D` or existing dark surface token.
- Primary text: `#F4F7F4`.
- Muted text: `rgba(244, 247, 244, 0.64)`.
- Border: `rgba(244, 247, 244, 0.16)`.

### Light editorial sections

Use for thesis, state mapping, CPDI, platform comparison, responsibility, delivery, and reflection.

- Canvas: `#F3F5F2`.
- Surface: white where a framed tool is necessary.
- Primary text: `#10110F`.
- Muted text: `rgba(16, 17, 15, 0.70)`.
- Border: `rgba(16, 17, 15, 0.24)`.

### ConvoAI content colors

These colors are restricted to case content:

- Live signal: `#19DDD2`.
- System evidence: `#3866FF`.
- Interruption or error: `#FF6458`.

Do not use gradients.

Do not use generic AI illustration, decorative orbs, bokeh, or unrelated scenic imagery.

Avoid nested cards. Page sections are full-width bands or unframed layouts. Repeated evidence items and actual media tools may use a maximum 8px radius. The physical phone shell may use a larger radius because it represents device hardware.

## 8. Hero And Layered Cross-Platform Stage

### Hero composition

- H1 is the literal product name `ConvoAI`.
- Supporting copy carries the value proposition.
- Use real ConvoAI media as the primary first-viewport signal.
- Keep a visible hint of the next light thesis section at the bottom of the viewport.
- Keep the global top navigation and left chapter rail visible and unchanged.

### Layered stage composition

Use the approved layered media stage in the Hero and cross-platform Acts I and II.

- Background: a dark terrain derived from audio waveform and real-time latency topology.
- Do not use an unrelated stock mountain photograph.
- Web plane: approximately 70% of stage width and visually dominant.
- App device: approximately 20% of stage width, placed at the right foreground.
- App shell: neutral black hardware frame with no fake brand mark or glossy decorative reflection.
- Web plane depth: maximum 4 degrees.
- App plane depth: visually subordinate and stable.
- All product UI remains inspectable.

Do not repeat the layered cross-platform composition for App-only Acts III and IV. Use a single-device product stage there. Act V uses a wide Web monitoring stage.

### Stage versus evidence

The layered stage is an orientation and chapter-opening device. It does not replace evidence playback.

After each stage, return to independent, front-facing players with original aspect ratios, complete durations, controls, and CPDI analysis.

## 9. Media Playback Behavior

### Initial state

- Both Web and App show poster frames.
- No media produces sound.
- Preload poster and metadata only.
- Preserve stable dimensions before media loads.

### Web active

- Web plane moves from light perspective to near-front view.
- Web may play muted after explicit user activation.
- App stays on its poster and reduces visual emphasis.
- Provide a visible mute or unmute control when playback supports audio.

### App active

- Starting App playback immediately pauses Web playback.
- App may use audio because playback follows explicit user action.
- App video plays from the beginning to the source-file end.
- Do not trim, accelerate, skip frames, jump chapters, or loop a local segment.

### Global media coordination

- Only one audible video may play on the page.
- Starting any new audible video pauses the previous one.
- Leaving the media stage viewport pauses stage playback and perspective response.
- Returning to the stage preserves playback progress unless the user explicitly restarts.

### Full evidence players

- Display source title and complete duration before playback.
- Use `object-fit: contain` for evidence playback.
- Preserve source aspect ratio.
- Do not crop product controls, captions, system states, or device edges.
- All nine App source recordings must remain complete.
- Present all seven Web recordings as complete scenario evidence.

## 10. Screen-Level Analysis

Every selected recording must include a concise CPDI analysis outside the video surface.

- Context: where the user is in the conversation journey.
- Problem: the human or system tension visible in the recording.
- Decision: the interaction and information choice, including tradeoffs.
- Impact: verified result when supported; otherwise state intended effect.

Do not overlay long analysis on top of product media.

Use one shared debrief after cross-platform pairs to explain what remains consistent and what adapts by platform.

## 11. Motion Language

Motion communicates state and depth. It is not ambient decoration.

- Maximum stage plane rotation: 4 degrees.
- Scroll motion: gradually return the Web plane toward front view as the stage enters focus.
- Hover motion: no more than 1.5 degrees additional response.
- Do not continuously float, bob, orbit, or rotate media.
- Do not animate navigation dimensions or position during chapter-tone changes.
- Light or dark navigation token changes complete in approximately 180-240ms.
- Media-focus transitions complete in approximately 300-450ms with an ease-out curve.
- Preserve fixed container dimensions during all state transitions.

When `prefers-reduced-motion: reduce` is active:

- Remove 3D perspective response.
- Keep Web and App front-facing.
- Disable automatic stage motion.
- Require explicit user activation for all playback.

## 12. Responsive Behavior

### Desktop

- Preserve the shared left chapter rail and main article grid.
- Layered stage uses Web as the large back plane and App as the right foreground device.
- Evidence comparison uses asymmetric Web and App tracks.

### Tablet

- Reduce perspective to a maximum 2 degrees.
- Reduce App overlap so it does not obscure Web controls or captions.
- Use the existing compact chapter navigation behavior.

### Mobile

- Collapse the left rail into the shared chapter drawer.
- Use a front-facing Web poster.
- Allow only a slight lower-right App overlap in the chapter opener.
- On activation, move to a single-focus media view rather than playing two overlapping surfaces.
- Stack full evidence players vertically.
- Keep App video in its original portrait ratio.
- Place Web evidence after the primary App or Web item defined for that act.
- Ensure the longest label fits without clipping or overlap.

## 13. Loading, Failure, And Recovery

### Loading

- Keep the poster visible while media metadata or content loads.
- Show a compact loading status without changing container dimensions.
- Lazy-load video content near the relevant chapter.

### Playback blocked

- Remain on the poster state.
- Keep the explicit play control available.
- Do not show an error when browser autoplay policy simply requires user activation.

### Media unavailable

- Keep poster, filename, duration, and analysis visible.
- Show a retry command using a familiar reload icon and text label.
- Allow the reader to continue through the case study.
- Do not collapse the stage or shift following content.

### Unsupported decoding

- Validate `选择数字人.mp4` through its complete 9.967s duration in Chrome and Safari.
- If compatibility transcoding is necessary, preserve exact content and duration.
- Apply the same complete-playback check to `声纹锁定.mp4`, 23.834s.

## 14. Accessibility

- All video players require accessible names.
- All meaningful poster frames require descriptive alternative text.
- Decorative terrain is ignored by assistive technology.
- Playback, mute, retry, and platform focus controls are keyboard reachable.
- Focus indicators use the portfolio's global focus treatment.
- State cannot be communicated by color alone; pair color with text labels and icons.
- Captions remain available where present in the source experience.
- Do not autoplay audible media.
- Respect reduced-motion preferences.
- Maintain WCAG-readable text contrast over light and dark surfaces.

## 15. Performance

- Use static poster assets for initial rendering.
- Use `preload="metadata"` for video unless a later implementation test supports a lighter strategy.
- Lazy-load videos by chapter proximity.
- Avoid loading all sixteen full media files at first paint.
- Pause offscreen stage motion and video work.
- Reserve media aspect ratios to prevent layout shift.
- Use generated bitmap terrain only if it materially improves fidelity; otherwise use a lightweight static background asset derived from the approved topology direction.

## 16. Verification Requirements

### Content and evidence

- Confirm the page includes nine App and seven Web recordings.
- Confirm source names and displayed durations match the media inventory.
- Confirm responsibility and launch statements retain `Designer-reported` attribution where published.
- Confirm no unsupported metrics or outcomes are introduced.
- Confirm no `Gap` or `缺口` section appears.

### Playback

- Play every App recording from 0 to its source-file end.
- Confirm no App recording is shortened, accelerated, frame-skipped, or locally looped.
- Confirm all Web scenarios reach their source-file ends.
- Confirm starting a new audible video pauses the previous one.
- Confirm stage and evidence players preserve progress according to the specified behavior.
- Confirm media failure leaves the layout stable and retry available.

### Visual and responsive

- Verify desktop, tablet, and mobile screenshots.
- Confirm top and left navigation use only global portfolio accents.
- Confirm navigation tone changes remain synchronized across light and dark sections.
- Confirm App shells do not obscure critical Web content.
- Confirm product UI remains readable at every supported viewport.
- Confirm no overlapping text, clipped controls, distorted video, or layout shifts.
- Confirm the next section remains visible below the Hero on desktop and mobile.

### Motion and accessibility

- Verify perspective never exceeds 4 degrees.
- Verify reduced-motion mode removes 3D response.
- Verify keyboard operation for play, pause, mute, retry, platform focus, and chapter navigation.
- Verify focus visibility and contrast.
- Verify no audible autoplay.

## 17. Approved Design Summary

- Narrative: invisible real-time state becomes perceptible, interruptible, and recoverable.
- Structure: five decision acts, not separate App and Web catalogs.
- Visual rhythm: alternating dark product theatre and light editorial reasoning.
- Navigation: shared portfolio framework and iris accent, never project-specific navigation color.
- Hero: real ConvoAI media, literal product name, and a visible next-section hint.
- Cross-platform stage: Web back plane, App phone foreground, topology terrain, maximum 4-degree depth.
- Evidence: independent complete players and external CPDI analysis.
- Voiceprint: a full trusted-participant decision, not a settings footnote.
- App constraint: nine complete recordings, no trimming or speed manipulation.
- Media behavior: one active audible source, explicit activation, stable loading and recovery.
- Mobile: reduced depth, single-focus playback, stacked evidence.
