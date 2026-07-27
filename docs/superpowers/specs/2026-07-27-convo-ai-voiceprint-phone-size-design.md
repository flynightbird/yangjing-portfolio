# ConvoAI Voiceprint Phone Size Design

## Scope

Reduce only the App phone presentation inside the Chinese ConvoAI `conversation-control` recording playlist. The current source recording is `592 x 1280`; its existing desktop presentation can reach `384px` CSS width, which asks a 2x display for more horizontal source pixels than the recording contains and makes the UI appear soft.

## Approved Direction

Use the selected B size:

- desktop App phone maximum width: `288px`;
- width remains responsive below that maximum;
- preserve the source portrait ratio and existing media sizing metadata;
- do not crop, stretch, sharpen, replace, or re-encode the video.

The `288px` width requires approximately `576` horizontal source pixels on a 2x display, closely matching the recording's native `592px` width while keeping the in-product controls readable.

## Component Boundary

Add a narrowly scoped compact App-size variant to `ConvoAiPlaylist`. The default variant retains the current `384px` maximum. The compact variant exposes a stable data attribute on the playlist root so the CSS Module can reduce only portrait App frames inside that playlist.

Enable the compact variant only for the Chinese `conversation-control` playlist containing:

- `app-caption-camera`;
- `web-conversation`;
- `web-interrupt`;
- `app-voiceprint-lock`.

Both App recordings in this decision-focused module use the same compact phone geometry. Web recordings remain full-width. All other ConvoAI playlists retain their current sizing.

## Responsive Behavior

- Desktop: compact App frames use `min(100cqi, 18rem)` as their short edge.
- Tablet and mobile: the same rule respects the available playlist width and never exceeds `288px`.
- Portrait aspect ratio remains `592 / 1280`.
- Sound controls, autoplay-on-visibility, looping, muted default, carousel navigation, captions, and CPDI content remain unchanged.

## Accessibility And Motion

No semantic, keyboard, audio-control, reduced-motion, or animation changes are introduced. The visual adjustment affects only the rendered phone width.

## Verification

- A component test proves the compact variant is opt-in and the default playlist remains standard.
- A browser test selects `app-voiceprint-lock` and confirms its rendered width is at most `288px` on desktop while its ratio remains `592 / 1280`.
- The same browser test confirms the Web recording remains wider than the compact App phone.
- Existing ConvoAI component and browser tests continue to pass.
- Visual inspection at desktop and `375px` confirms the phone is clearer, centered, readable, and free of horizontal overflow.

## Non-Goals

- No video replacement or re-encoding.
- No size changes to the App product-structure showcase, Hero phone, start-conversation phone, avatar phones, or other playlists.
- No changes to the voiceprint mode cards, copy, chapter structure, Banner, Footer, or navigation.
