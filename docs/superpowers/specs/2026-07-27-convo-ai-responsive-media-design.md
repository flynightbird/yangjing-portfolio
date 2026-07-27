# ConvoAI Responsive Media Design

## Scope

Update only ConvoAI media presentation. Web recordings become ratio-driven virtual browser surfaces, while App recordings preserve a believable device size and the source orientation. Copy, content order, navigation, video playback behavior, and motion choreography remain unchanged.

## Goals

- Every Web virtual browser uses the source recording width and height to determine its rendered height.
- Web surfaces fit their available horizontal space on desktop and mobile without cropping, stretching, or horizontal page overflow.
- Portrait App recordings keep the current production phone height as their size reference.
- Landscape App recordings behave like the same phone rotated 90 degrees: the landscape height equals the portrait phone width reference.
- App media shrink uniformly only when their calculated width exceeds the available content width.

## Sizing Model

### Web Media

Web media is width-driven:

1. The virtual browser width is the available width of its existing layout container.
2. The rendered height is calculated from the media catalog's original `width / height` ratio.
3. Fixed viewport-height caps, forced minimum media heights, and independent width/height stretching must not override that ratio.
4. The media remains fully visible with `object-fit: contain`.

This rule applies to Web media in the Hero, the conversation-start composition, chapter playlists, and the real-time chain.

### App Media

App media is device-size-driven:

1. Portrait media keeps the current production portrait phone height.
2. Its width is derived from its original aspect ratio; width is never stretched independently.
3. Landscape media uses the portrait phone width reference as its height. Its width is then derived from the landscape source ratio.
4. This models a physical device rotating 90 degrees: the device's short edge stays constant.
5. If the resulting width is wider than the available mobile content area, the entire device scales down uniformly.

Existing App visual sizing remains the baseline. The change must not make portrait phones fill a wide parent container or appear tablet-sized.

## Responsive Behavior

### Desktop

- Existing compositions remain intact, including the Hero Web/App overlap and the conversation-start Web/App overlap.
- Web browser surfaces expand to their existing layout width and derive their height from source ratio.
- Portrait App phones retain their current perceived height and narrow phone width.
- Landscape App devices use the rotated short-edge rule.

### Mobile

- Web surfaces use `width: 100%`, `max-width: 100%`, and ratio-derived height.
- App devices preserve orientation and ratio and never exceed the content area's inline size.
- A device that would overflow is scaled down as a complete unit; neither axis is compressed separately.
- Existing sequential layouts remain sequential. No new long pin behavior is introduced.
- The document must not gain horizontal overflow at 375px.

## Component Boundaries

- `convo-ai-media-catalog.ts` remains the source of truth for media width, height, and platform.
- Shared media sizing data is passed to the relevant wrappers instead of duplicating hard-coded ratios in CSS.
- `ConvoAiPlaylist`, `ConvoAiConversationStart`, `ConvoAiStage`, `ConvoAiAvatarPair`, and `ConvoAiAppShowcase` keep their existing responsibilities and interactions.
- A small shared sizing helper or CSS custom-property contract may be introduced only if it removes repeated orientation logic across these components.

## Accessibility And Motion

- Video semantics, descriptions, sound controls, keyboard behavior, and reduced-motion playback behavior remain unchanged.
- Layout adaptation must not move sound controls outside the visible video boundary.
- Ratio changes must not introduce content layout shifts after video metadata loads; catalog dimensions are available before playback.

## Verification

- Component tests verify that media wrappers receive source dimensions and orientation-aware sizing data.
- E2E checks verify Web wrapper height against its source aspect ratio at desktop and mobile widths.
- E2E checks verify that portrait App media retains its ratio and that any landscape App fixture follows the rotated short-edge rule.
- At 375px, every Web and App media boundary stays within the document content width and the page has no horizontal overflow.
- Browser screenshots cover the Hero, conversation-start composition, a Web playlist, and App media at desktop and 375px.

## Non-Goals

- No changes to copy, chapter order, carousel behavior, autoplay, sound controls, GSAP choreography, or media assets.
- No cropping or playback speed changes.
- No redesign of the phone or browser chrome.
