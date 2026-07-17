# STT Live Stage Homepage Embed

## Objective

Replace the static STT product-stage screenshot on the portfolio homepage with the complete animated virtual product stage from the right side of the STT Demo landing page. The homepage media must preserve the original speaker, transcript, translation, participant rail, wave motion, content rotation, and bottom Dock while remaining a single clear entry point to the full demo.

## Source And Scope

- Reuse the existing `.land-visual` from `/demos/stt-demo/index.html`.
- Do not show the STT landing page header, left-side copy, CTA, authentication controls, backdrop, product page, overlays, or other Demo screens.
- Do not recreate the stage in React and do not maintain a second copy of its visual logic.
- Add a same-origin stage embed mode to the pinned local Demo so the iframe renders only `.land-visual`.
- Keep the complete Demo available at `/demos/stt-demo/index.html` in a new tab.

## Embed Contract

The homepage iframe loads a dedicated stage-only URL derived from the existing Demo, such as `/demos/stt-demo/index.html?embed=stage`.

In stage embed mode:

- the document identifies itself with an explicit embed state;
- only `.land-visual` is visible;
- the stage fills the iframe viewport and scales as one complete composition;
- transcript, translation, participant rail, and bottom Dock remain visible;
- the existing `rotateHeroSnip` cycle keeps its 5.2-second timing;
- the existing wave and status animations remain unchanged;
- all controls and links are inert;
- the embedded document exposes readiness and playback messages to its same-origin parent;
- the normal full Demo URL remains behaviorally unchanged.

The embedded stage uses the original Demo HTML, CSS, assets, and animation code. The homepage does not copy the 247 KB Demo stylesheet and script into the Next.js bundle.

## Homepage Composition

Preserve the approved Codex-style STT section:

- copy occupies 4 of 12 desktop columns;
- media occupies 8 of 12 desktop columns;
- mobile places media above copy;
- the media card retains its 20px outer radius and cool blue/violet background;
- the simulated browser chrome remains outside the iframe;
- the browser window retains the existing restrained pointer drift of approximately ±10px horizontally and ±6px vertically;
- no additional internal zoom, rotation, tilt, or camera motion is added.

The iframe stage is fully visible rather than cropped. It uses proportional scaling with approximately 12–16px internal breathing room on desktop and approximately 8px on mobile. The same complete composition is used at every breakpoint; mobile does not use an alternate crop.

## Interaction

- The iframe is visual-only and uses `pointer-events: none`.
- The entire media card remains one accessible link that opens the complete STT Demo in a new tab.
- The existing text CTA opens the same complete Demo URL.
- Internal Dock, language, authentication, and stage controls cannot receive pointer or keyboard input on the homepage.
- The iframe is removed from the accessibility tree because the outer media link and product image alternative already describe the destination.

## Loading And Transition

- Do not load the iframe at initial page load.
- Begin preloading when the STT media approaches within approximately 600px of the viewport.
- Reserve the final media dimensions before loading to prevent layout shift.
- Display the existing high-resolution stage screenshot as the loading and failure fallback.
- After the iframe reports readiness, crossfade from the screenshot to the live stage over approximately 500ms.
- Play one restrained horizontal scan lasting approximately 700ms when the live stage first becomes visible.
- The scan does not loop and does not obscure transcript readability.
- If the iframe fails, times out, or cannot initialize, keep the static screenshot and retain both links.

## Playback Lifecycle

- Start or resume animation when the live stage intersects the viewport.
- Pause animation after it leaves the viewport.
- Resuming must continue from the current animation and content state rather than resetting the 5.2-second cycle.
- The parent communicates visibility with `postMessage`; the same-origin embed validates the message source and expected command.
- CSS animations use `animation-play-state: paused` while suspended.
- The transcript rotation timer tracks remaining time so pause/resume does not restart the current interval.
- Under `prefers-reduced-motion: reduce`, preserve the complete static stage, suppress the readiness scan and parent pointer drift, and do not rotate transcript content.

## Accessibility And Performance

- The media link keeps an explicit accessible name stating that it opens the STT Demo in a new tab.
- The fallback image retains descriptive alternative text until the live iframe replaces it visually.
- The iframe has a descriptive title but is not keyboard reachable and is `aria-hidden` on the homepage.
- The iframe stays same-origin and loads only the existing local Demo assets.
- The homepage client component uses `IntersectionObserver` rather than scroll listeners.
- Visibility updates must not trigger React renders on pointer movement.

## Verification

- Component test: the STT media contains a lazy stage iframe and the static fallback.
- Component test: iframe interaction is disabled and the outer media link retains the direct Demo destination.
- Component test: no static screenshot is treated as the final live media.
- Demo test: `?embed=stage` exposes only `.land-visual` and does not expose the landing copy or product page.
- Browser test: desktop and 390px mobile both show the complete stage, participant rail, and Dock without horizontal page overflow.
- Browser test: the screenshot is visible before readiness and crossfades after readiness.
- Browser test: the readiness scan runs once.
- Browser test: leaving the viewport pauses the embed and returning resumes without reset.
- Browser test: the outer pointer drift still moves and returns to rest.
- Browser test: reduced motion keeps the stage static.
- Regression test: `/demos/stt-demo/index.html` remains fully interactive and visually unchanged outside embed mode.

## Success Criteria

The homepage browser window contains the actual animated STT landing-page product stage, not a screenshot or a miniature full landing page. The complete Dock and participant rail remain visible on desktop and mobile. The preview feels active and technically credible while preserving a single, predictable click target to the full Demo.
