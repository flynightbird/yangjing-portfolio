# Homepage Footer Liquid Contact Design

## Status

Approved visual direction, awaiting written-spec review.

## Goal

Redesign only the homepage presentation of the shared Footer so it ends the page in normal document flow, uses a restrained deep-purple liquid background, and presents email and WeChat as two distinct borderless glass capsules. Preserve the existing contact destinations and accessible email behavior while adding WeChat copy support and clearer success feedback. Detail-page Footer appearance and contact structure remain unchanged.

This specification supersedes the homepage reveal and static-background requirements in `2026-07-21-footer-typography-and-scroll-performance-design.md`. It does not reverse that document's performance finding: the full-size animated `LiquidField` canvas must remain absent from the Footer.

## Confirmed Direction

Use the approved combination:

- Layout A: one horizontal contact row with a wider email capsule and a narrower WeChat capsule.
- Visual character B, refined: deep neutral purple, denser borderless glass, and controlled liquid movement inspired by OpenAI's restrained dark motion language.
- Reduce highlight coverage. The background must read primarily as deep gray-purple, not as a collection of bright purple blobs.
- Keep the existing localized eyebrow and heading, copyright, email address, and mail action.
- Add WeChat ID `flydesigner_yangj` with a copy action.

## Homepage Flow

Remove the homepage-only sticky reveal and upward page-flip composition. The Footer follows the final homepage section in normal document flow, with no negative overlap, rounded foreground mask, scroll-linked offset, or page-shadow transition.

The shared Footer remains available to non-home routes. Removing the reveal behavior must not create route-specific duplicate Footer implementations. Scope the new visual and contact presentation with `body:has([data-homepage])`, matching the existing homepage marker. Render the homepage contact row as a sibling of the existing email action, hide it by default, and switch the two surfaces only inside that homepage selector. `display: none` keeps the inactive surface out of the visual layout and accessibility tree. Do not apply the animated background, dual capsules, or visible WeChat row to detail pages.

`FooterRevealMotion` and its homepage-only scroll listener are no longer needed after all render paths are verified. Remove the component and its import rather than leaving inert reveal code behind.

## Composition and Responsive Layout

The Footer retains a spacious editorial ending without behaving like a full-screen hero:

- Keep the eyebrow above the localized heading.
- Keep the heading separate from the contact controls and cap its readable line length.
- Place the two contact capsules in one row beneath the heading on desktop.
- Give email the larger flexible track because its visible value is longer.
- Stack the capsules into one column below `760px` or earlier if the real text needs it.
- Keep capsule height compact and stable; dynamic icon state must not change its dimensions.
- Keep the copyright/meta row at the bottom with a quiet separator.

The Footer must not overlap the preceding homepage section at any viewport width. Validate desktop and 390px mobile layouts for clipping, text truncation, and horizontal overflow.

## Background Liquid System

Use `#19161b` as the primary deep gray-purple surface. Build the visible liquid motion with CSS layers owned by the Footer, not the reusable canvas:

- Two broad, low-contrast dark-purple ribbons cross different areas of the Footer.
- Add one restrained secondary sheen for depth; it occupies less area and uses lower opacity than either dark ribbon.
- Use irregular fixed silhouettes with different scales, directions, and durations so the movement reads as liquid rather than as one gradient sliding across the page.
- Animate only compositor-friendly `transform` and low-amplitude `opacity`; do not animate blur radius, gradients, background position, layout properties, or per-frame JavaScript state.
- Keep blur and color treatment static. Bound each filtered layer to the Footer rather than rendering a viewport-sized canvas.
- Use asynchronous 9-second, 12-second, and 10-second cycles for the two ribbons and sheen respectively, with smooth easing and no sharp resets.

The intended result is visible when watched for a few seconds but remains behind the content. Avoid fluorescent purple, isolated glowing orbs, bokeh, and large pale regions that compete with the heading.

Under `prefers-reduced-motion: reduce`, freeze every decorative layer in a composed static position. Text contrast and capsule separation must not depend on motion.

## Borderless Glass Capsules

Email and WeChat use separate fully rounded capsules with no visible outline or one-pixel border. Removing the border requires stronger material separation:

- Use `rgba(34, 27, 38, 0.58)` as the dark-purple capsule base rather than a highly transparent glass fill.
- Use static backdrop blur and restrained saturation.
- Use a subtle top inset highlight, a darker lower inset refraction, and a soft external shadow to define the edge without drawing a contour.
- Add a very low-strength internal fluid layer that travels slowly behind the content using `transform` only.
- Preserve sufficient contrast when a background ribbon passes behind a capsule.

Each capsule contains a small channel label and the real contact value. The email capsule contains Copy and ArrowUpRight actions; the WeChat capsule contains Copy only.

## Action Material and Hover

Use Lucide icons and stable circular action targets. Controls have a quiet translucent fill at rest, without persistent outlines.

On pointer hover or keyboard focus, a localized liquid layer rises inside the control. The effect is contained to the action and must not brighten the whole capsule. ArrowUpRight retains its current `0.125rem` up-and-right translation. Keyboard focus still needs a clearly visible focus ring even though the decorative capsule outline is removed.

Reduced-motion mode removes rising-liquid and directional transitions while keeping hover, focus, and state contrast usable.

## Copy Interaction

Use one reusable client-side contact-copy control for both email and WeChat. Each control owns an independent state:

`idle -> copied -> idle`

- Idle renders Lucide `Copy`.
- Clicking writes the exact contact value with the Clipboard API.
- Success immediately renders Lucide `Check` in the same fixed icon box.
- Hold success for 1.8 seconds, then return to `Copy` automatically.
- A repeated click clears and restarts that control's reset timer.
- Email and WeChat timers do not affect each other.
- Unmount cleanup clears pending timers.

On Clipboard API failure, keep the `Copy` icon, preserve the visible selectable value, and announce a localized failure message. Do not use deprecated document copy commands.

Provide localized accessible names and a polite live region for email and WeChat success/failure. Icons remain decorative. The email value and trailing arrow both keep the exact `mailto:amanda.yangj@gmail.com` destination.

## Component Boundaries

- `SiteFooter` remains the single semantic Footer implementation and retains the existing non-home presentation.
- Add an explicit homepage variant inside that shared boundary for the two contact definitions and homepage-only visual layers. Do not create a second `<footer>` implementation.
- Refactor the copy behavior into a small reusable contact-copy control so the homepage email and WeChat actions share state logic without duplicating timers and accessibility behavior. The existing non-home email action can reuse this primitive without changing its visible layout.
- CSS Modules own the background ribbons, glass capsules, hover liquid, responsive layout, and reduced-motion states.
- No scroll event listener, requestAnimationFrame loop, Canvas, WebGL, or new animation dependency is introduced.

## Testing and Verification

Component tests must cover:

- Email and WeChat values render with the correct localized labels.
- Email address and arrow retain the correct `mailto:` destination.
- Each copy control writes its exact value.
- Successful copy changes only the clicked control from Copy to Check.
- The clicked control returns to Copy after 1.8 seconds.
- Repeated clicks restart the reset timer.
- A failed copy retains Copy and exposes localized failure feedback.
- The Footer no longer renders or imports homepage reveal behavior.
- Non-home routes retain their existing single-email Footer presentation and do not expose the homepage WeChat capsule.

Browser verification must cover:

- Footer is in normal document flow on the homepage and does not overlap the preceding section.
- Desktop and 390px mobile layouts have no clipping, overlap, or horizontal overflow.
- Background motion is clearly visible over several seconds but highlights remain subordinate to content.
- Borderless capsules remain legible over every background position.
- Hover, focus, Copy-to-Check, ArrowUpRight, and automatic reset behave correctly.
- Reduced-motion produces a static but visually complete Footer.
- A repeatable bottom-of-page scroll has no frame above 32ms in the desktop verification environment and does not regress toward the former canvas baseline.

## Out of Scope

- ConvoAI media-card production changes
- Meeting card layout changes
- Any other homepage module or case-study page
- Changing the non-home Footer presentation
- Changing Footer copy, email address, WeChat ID, or copyright
- Reintroducing `LiquidField` to the Footer
- Adding QR codes, LinkedIn, a contact form, or new contact channels
- Redesigning non-home page content
