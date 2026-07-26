# Homepage Meeting Entry Design

## Scope

Replace the homepage Meeting text-only entry with a bilingual, evidence-led Web + mobile media stage. The entry must communicate one idea: Agora Meeting applies one priority model across four platform categories while reorganizing the interface for changing live-meeting context.

This work changes only the Meeting entry on the homepage and its focused tests. It does not restructure the Meeting case study, change other homepage projects, add new product claims, or introduce new media.

## Evidence And Boundaries

### Fact

- The published Meeting case identifies the project as `Agora Meeting`, an enterprise meeting aPaaS.
- The supplied case metadata states the designer role as sole product designer, the status as shipped, and the platform scope as Desktop, Web, Tablet, and Mobile.
- The repository contains shipped-surface recordings and posters for the Meeting Web and mobile hero states:
  - `public/videos/meeting/meeting-hero-web.mp4`
  - `public/videos/meeting/meeting-hero-app.mp4`
  - `public/images/meeting/meeting-hero-web-poster.webp`
  - `public/images/meeting/meeting-hero-app-poster.webp`
- The Meeting case organizes the product story around adaptive stage behavior, collaborative workspace behavior, and real-time information behavior.

### Gap

- No supplied evidence verifies adoption, efficiency improvement, customer satisfaction, or business impact. The homepage entry must not introduce metrics or outcome claims.

### Recommendation

- Position the entry around a system decision rather than a capability list: one meeting rule across four platform categories and changing live states.
- Use real shipped-surface recordings as visual evidence instead of reconstructed or illustrative UI.

## Approved Content

### Chinese

- Product title: `Agora Meeting`
- Proposition: `一套会议规则，适配四类终端与持续变化的会中状态。`
- Evidence line: `唯一产品设计师 · 已在四类终端上线`
- State index: `自适应舞台 / 协作工作区 / 实时信息层`
- Action: `查看案例`

### English

- Product title: `Agora Meeting`
- Proposition: `One meeting system, adapting across four platforms and constantly changing live states.`
- Evidence line: `Sole Product Designer · Shipped across four platforms`
- State index: `Adaptive stage / Collaborative workspace / Real-time information`
- Action: `View case study`

The project title remains the largest readable text. The proposition carries the design argument; the entry does not replace the product name with an abstract slogan.

## Visual Direction

### Composition

Use the approved **Offset System** composition.

- Preserve the homepage near-black canvas on the copy side.
- Transition the media side into the Meeting case study's deep blue-purple surface.
- Retain the existing coral top rule as the Meeting boundary and use coral only for active state signaling.
- Use a 12-column dense desktop grid: copy occupies 4 columns and the media stage occupies 8 columns. The three state-index items each occupy 4 columns. No grid cell is intentionally empty.
- Keep `Agora Meeting` within two lines at desktop widths.
- Do not add badges, stamp graphics, fabricated UI, generic meeting imagery, nested cards, or decorative gradients outside the approved media-stage transition.

### Copy Side

The left side contains, in order:

1. Existing Agora/project-kind metadata
2. Linked `Agora Meeting` heading
3. Approved proposition
4. Approved role and shipping evidence line
5. Existing white primary CTA treatment

The copy remains vertically centered on desktop. The evidence line and CTA anchor the lower portion without becoming a facts table.

### Media Side

- Render the Web recording as the dominant browser surface.
- Render the mobile recording as a smaller foreground device entering from the lower right.
- Use the existing Meeting browser treatment rather than inventing a new browser UI.
- Place the three-state index inside the lower media stage. It replaces the current three large text columns.
- Place `Desktop / Web / Tablet / Mobile` in a restrained platform track below the state index.
- The state index and platform track support the cross-platform argument; they are not navigation controls.

### Mobile Device Treatment

Match the homepage ConvoAI phone mockup contract:

- Aspect ratio: `590 / 1280`
- Device border: `4px solid #222428`
- Outer radius: `14px`
- Inner video radius: `10px`
- Background: `#222428`
- Shadow: equivalent depth to the ConvoAI homepage phone
- Resting rotation: approximately `2deg`

This treatment applies to both desktop and mobile layouts. Do not add a notch, speaker slot, hardware buttons, or a thicker decorative frame.

## Responsive Behavior

### Desktop

- Keep the approved 4/8 copy-to-media split.
- Keep the browser partly offset to the right so the media stage feels spatial rather than card-like.
- Keep the mobile device fully contained inside the media stage.
- Keep all three state names readable in one horizontal row.

### Tablet

- Preserve the two-part composition while space allows, then stack before text or device geometry collides.
- Reduce offsets and device scale before reducing text below the shared homepage typography roles.
- Keep the platform list static if the looping track would clip or create overflow.

### Mobile

- Stack copy above media.
- Show a horizontally cropped Web surface first, then the mobile device in the lower-right foreground.
- Keep the same Web-to-mobile comparison; do not replace it with a phone-only composition.
- Keep the three state names in one compact row with localized labels sized to fit.
- Place the evidence line and CTA below the media stage.
- Do not pin the section and do not create horizontal page scrolling.

## Motion

Implement one short GSAP scrub sequence over approximately `40-60vh`. Do not create a full-screen or long-duration pinned chapter.

### Desktop Sequence

1. The Web stage scales from approximately `0.88` to `1` while becoming fully opaque.
2. The deep blue-purple media surface gains prominence as the Web stage settles.
3. The mobile device enters from the lower right and settles at its `2deg` resting angle.
4. The Web stage recedes slightly to clarify foreground/background depth.
5. The three state-index labels activate in sequence.

The platform track may loop slowly after the stage settles. It must not compete with the recordings or create a second dominant motion.

### Mobile Sequence

- Use the same narrative order with smaller translations and no pinning.
- Keep native vertical scrolling responsive throughout the sequence.
- Render the platform names as a static line rather than a marquee.

### Reduced Motion

Under `prefers-reduced-motion: reduce`:

- Do not request either MP4.
- Render both poster images in the final layered composition.
- Disable scrub transforms, device entrance, state-index sequencing, and platform-track motion.
- Preserve all readable copy and links.

## Media Loading And Failure Handling

- Use `meeting-hero-web.mp4` and `meeting-hero-app.mp4` for normal-motion rendering.
- Both recordings are muted, looping, inline, and excluded from the tab order.
- Begin loading only when the Meeting stage is within approximately `600px` of the viewport.
- Preserve the corresponding poster on each video so delayed loading or playback failure never creates an empty stage.
- Hide the duplicate visual description from assistive technology because the localized text and link labels carry the entry meaning.
- Do not use GIF output or introduce a new encoding pipeline.

## Link And Accessibility Contract

Provide three intentional links to the localized Meeting case route:

1. Product-title link
2. Media-stage link
3. Explicit primary CTA

Do not wrap the entire Meeting article in one large link. Each link must have a distinct accessible name, visible focus treatment, and the existing dark page-transition tone.

The state index and platform track are descriptive, not interactive. Videos are decorative repetitions of the content argument and must not expose controls or receive focus.

## Component Boundary

- Keep `components/home/meeting-preview.tsx` responsible for semantic article structure, localized copy, evidence line, and link placement.
- Add a focused client component under `components/home/` for media loading, video/poster selection, and GSAP progress.
- Keep Meeting entry styling inside the existing homepage CSS module unless a focused local module is required to prevent `home.module.css` from taking on unrelated media-state logic.
- Reuse existing homepage link, CTA, reduced-motion, and page-transition conventions.

## Verification

### Component Tests

- Chinese and English title, proposition, evidence line, state labels, and CTA render exactly.
- Title, media, and CTA link to the correct localized Meeting route.
- The entry renders one Web media layer and one mobile media layer.
- Normal-motion structure exposes two videos with matching posters and no controls.
- Reduced-motion structure exposes poster-only rendering and no video sources.
- The old three-column decision prose is removed.

### Browser Tests

- Desktop, tablet, and mobile layouts have no horizontal page overflow.
- Desktop uses the intended copy/media hierarchy and keeps the device inside the media stage.
- Mobile stacks copy, media, evidence, and CTA in the approved order.
- The phone computes to the `590 / 1280` ratio with `4px` border, `14px` outer radius, and `10px` inner radius.
- Both MP4 requests occur in normal-motion mode after approaching the viewport.
- Neither MP4 request occurs in reduced-motion mode.
- The short scrub reaches the final Web/mobile layered state without pinning the page.
- Title, media, and CTA are keyboard reachable and navigate to the localized Meeting case.
- Screenshots confirm no text/media overlap and a coherent black-to-blue-purple transition.

## Portfolio Contract Status

1. **Evidence and gaps ledger:** Included above for the homepage claim surface.
2. **Project positioning:** One meeting system across four platform categories and changing live context.
3. **Chapter architecture:** Homepage entry only; the approved Meeting case-study chapter architecture remains unchanged.
4. **Visual direction:** Defined above.
5. **Visual asset plan:** Two verified recordings and their posters; no new assets.
6. **Screen-level CPDI:** Context: a homepage reviewer scanning selected work. Problem: the current text-only entry does not reveal the cross-platform system. Decision: show Web and mobile reorganizing under one priority model. Intended impact: make system judgment legible before entering the case; no outcome metric is claimed.
7. **3-minute narrative:** Unchanged in the Meeting detail case and out of scope for this homepage entry.
8. **10-minute deep dive:** Unchanged in the Meeting detail case and out of scope for this homepage entry.
9. **Interview questions:** Unchanged in the Meeting detail case and out of scope for this homepage entry.
10. **Hiring-manager evaluation:** The entry prioritizes systems thinking, role clarity, shipped scope, complexity-to-clarity, and real product evidence without inventing impact.

## Out Of Scope

- Changes to Meeting case-study content or chapter order
- New screenshots, recordings, illustrations, mock interfaces, or product claims
- Full-screen pinning or horizontal scrolling
- Playback controls, audio, scrubbing inside the videos, or user-selectable state tabs
- Changes to Call Agent, ConvoAI, STT Demo, AIDX, Xuelang, the homepage hero, or the global footer
