# ConvoAI Black Cinematic Redesign

## Scope

Redesign only the ConvoAI case study as a cinematic near-black experience. Preserve the shared site header, left chapter navigation, seven public Chinese chapters, evidence boundaries, full media durations, and the existing global purple footer.

Remove previous/next project navigation from every case-study surface and delete its metadata and route-resolution model. The global footer becomes the only site-level ending after a project.

## Evidence Boundary

- Keep `Designer-reported` ownership and launch attribution unchanged.
- Do not add research, metrics, customer feedback, performance claims, or business outcomes.
- Keep all 9 App and 7 Web recordings complete, at 1x, without trimming, skipping, excerpting, or partial loops.
- Treat the media as interface evidence. Every media presentation retains context, problem, visible decision, and intended impact copy.

## Deterministic Design Selection

The approved 215-character synthesized brief produces the following seeded selection:

- Hero: Cinematic Center
- Typography: Outfit
- Components: Inline Typography Images, Horizontal Accordions, Feedback Carousel
- Motion: Scroll Pinning, Scrubbing Text Reveals

`Feedback Carousel` is implemented as an evidence carousel containing the supplied complete recordings. It must not imply testimonials or user feedback.

## Visual System

The page is at least 90% near-black and grayscale. Use multiple black elevations rather than alternating light and dark chapters:

- Canvas: near-black with a cool-neutral tint
- Recessed surface: slightly lighter black
- Raised media surface: black with subtle spectral tint
- Primary text: off-white
- Secondary text: high-contrast cool gray
- Structural borders: low-opacity white

Semantic colors retain meaning:

- Cyan: live media, listening, active navigation
- Cool blue: system processing and technical stages
- Red: interruption and recovery boundaries only

Selected media cards may use low-luminance stained-glass surfaces: dark cyan, dark red, forest green, and violet-gray. No bright full-section backgrounds are allowed.

## Page Structure

### Navigation

Keep the shared top navigation and left chapter navigation. Navigation remains structurally identical to the existing detail template and uses the shared dark surface behavior.

### Attention: Hero

Use a wide, centered two-line-or-less title over a full-width product media field. The Web conversation fills the main scene and the App phone occupies the lower-right foreground. The hero contains no badge pile, raw stat row, marketing CTA, or decorative stock image.

During the hero pin, the Web plane gains subtle depth while the phone moves at a different rate. The movement belongs to one ScrollTrigger timeline and must not create horizontal overflow.

### Interest: Context And State

Remove visible `00 / CONTEXT` and similar meta-labels. Every chapter begins with a giant low-opacity numeral used as spatial composition, not as a small label. The Chinese title remains the primary heading and spans no more than three desktop lines.

Present the seven conversation states as a gapless, dense system strip. The grid contains seven occupied cells with no filler card. Voiceprint modes become a three-slice horizontal accordion on desktop and a stacked disclosure-free sequence on mobile.

### Desire: Product Media

The App product structure remains a Sequence-style split: scrolling narrative on the left, fixed phone media stage on the right. Its four 20px media cards use dark stained-glass colors and preserve the complete source recordings.

All other chapter playlists become one large evidence carousel per chapter. Arrow controls switch complete recordings inside a stable media stage. The active media preserves source, poster, accessible label, description relationship, and CPDI copy. Only the active carousel video mounts and autoplays.

Embed two small real product stills inside large headings:

- Animated orb in the start-conversation heading
- Digital-human face in the digital-human heading

The realtime-chain chapter is the second visual peak. Pin the conversation media on the left and scrub RTC, ASR, LLM, TTS, and Voiceprint stages on the right. End on the supplied realtime-data interface. Do not claim debugging or performance improvement.

### Action: Ending

End the ConvoAI article with the evidence-based delivery chapter and then reveal the existing global purple footer. Do not render previous/next project links. Do not modify footer content, palette, particle field, or reveal motion.

## Motion

Use GSAP and `@gsap/react` for two advanced paradigms only:

1. Scroll pinning for the hero, App Sequence support where needed, and realtime-chain split.
2. Scrubbing text reveals for selected lead paragraphs and realtime stages.

Desktop motion is cinematic but limited to the hero and realtime-chain peaks. Mobile removes long pins and uses sequential entry with light transforms. `prefers-reduced-motion: reduce` disables pinning, scrubbing, parallax, autoplay, and looping where the existing media policy requires a static poster.

## Responsive Behavior

- Desktop: shared rail plus case grid, full hero composition, sticky/pinned media.
- Tablet: shared compact chapter navigation, stacked avatar scenes, stable carousel controls, no horizontal overflow.
- Mobile: one-column reading order, inline active App media, no long pins, headings fit without overlap, full media controls remain reachable.

## Global Neighbor Removal

Delete `previousSlug` and `nextSlug` from content metadata, schema validation, route neighbor lookup, layout props, all case-specific navigation markup, styles, and tests. The change applies to Work and Build details. The global footer remains mounted by the localized root layout.

## Verification

- Unit tests prove metadata no longer accepts neighbor fields and routes no longer resolve them.
- Component tests prove case layouts render no project-neighbor navigation.
- ConvoAI tests prove the seven chapters, black surfaces, giant numerals, 20px media cards, evidence carousel controls, complete media metadata, responsive behavior, and reduced-motion behavior.
- Playwright screenshots cover desktop, tablet, and mobile with pixel checks for nonblank media and no horizontal overflow.
- Full-site build remains subject to existing private profile, resume, and Meeting publication inputs that are absent from the repository.
