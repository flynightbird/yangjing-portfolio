# Sitewide Footer Email and Copy Design

## Status

Approved direction, awaiting written-spec review.

## Goal

Unify every public contact email around `amanda.yangj@gmail.com`, make the shared site Footer the only contact ending used across the portfolio, and add a polished copy action without weakening the existing email link or arrow interaction.

## Sitewide Footer Boundary

The localized root layout continues to render one shared `SiteFooter` after every page. Homepage, About, work cases, and build cases must use this same Footer implementation and localized Footer copy.

Remove the complete Xuelang-specific contact module from both localized Xuelang MDX files. This includes the signature, role, email, WeChat ID, clipboard behavior, and live message. Delete the unused Xuelang contact component, its CSS Module, and its component test after both MDX imports and render calls are removed.

Do not add another contact section to Xuelang. Its case-study content should flow directly into the shared site Footer.

## Email

Use this exact address in every public site contact surface:

`amanda.yangj@gmail.com`

The visible address and every `mailto:` destination must match exactly in Chinese and English. Remove production references to `yangux@qq.com`.

## Selected Layout

Use the approved visual option A, an independent lightweight action area:

`email address -> copy button -> email arrow`

- Keep the email address as a direct `mailto:` link with the existing underline treatment.
- Add a separate copy button immediately after the address.
- Move the existing arrow after the copy button.
- Keep the arrow as a separate `mailto:` link so a button is never nested inside an anchor.
- Treat the three elements as one visually aligned row without wrapping them in a pill, card, or persistent control border.

## Copy Interaction

- Use the Lucide `Copy` icon at rest and `Check` after a successful copy.
- Copy `amanda.yangj@gmail.com` through the Clipboard API.
- Keep the icon button background transparent at rest.
- On pointer hover and keyboard focus, use a white background at approximately 12% opacity.
- Use a 4px radius and a stable square hit area large enough for touch and keyboard use.
- Hold the success state for approximately 1.8 seconds, then restore the copy icon.
- Preserve the existing arrow translation on hover and focus.
- Respect `prefers-reduced-motion`; icon and arrow state changes remain usable without animated movement.

## Feedback and Accessibility

The copy button uses localized accessible labels:

- Chinese rest: `复制邮箱`
- Chinese success: `邮箱已复制`
- Chinese failure: `复制失败，请手动复制`
- English rest: `Copy email address`
- English success: `Email copied`
- English failure: `Copy failed. Please copy the email manually.`

Expose success and failure through a polite live region. Keep the icon decorative. Give the trailing arrow link a localized accessible name that identifies it as the send-email action.

If the Clipboard API rejects or is unavailable, keep the email visible and clickable, preserve the copy icon, and announce the localized failure message. Do not replace the Clipboard API with deprecated document commands.

## Component Architecture

Keep `SiteFooter` responsible for Footer structure, localization, liquid field, and reveal behavior. Add a small client component inside the Footer to own clipboard state, reset timing, copy feedback, and the three-part action row. This prevents clipboard state from converting the entire shared Footer into a client component.

Keep the email value in one Footer contact source and pass it consistently to the visible link, Clipboard API, and trailing arrow link. Do not duplicate locale-specific addresses.

## Responsive Behavior

- Desktop: preserve the existing Footer composition and vertical rhythm.
- Mobile at 390px: keep the address readable and the two action targets stable without overlap or horizontal page overflow.
- Allow the address track to shrink while keeping copy and arrow hit areas fixed.
- Do not scale typography with viewport width beyond the existing responsive type rules.
- If one row cannot fit at the narrowest supported width, wrap the complete icon group together beneath the address rather than separating copy from the arrow.

## Validation

- Both locales render `amanda.yangj@gmail.com` in the shared Footer with the matching `mailto:` destination.
- No production source contains `yangux@qq.com`.
- The action order is address, copy button, arrow link in the DOM and visually.
- Copy success writes the exact email, swaps to the check state, announces localized feedback, and resets.
- Copy failure preserves the mail link and announces localized failure feedback.
- Hover and focus show the approved translucent copy-button background.
- The existing arrow remains after the copy control and retains its directional interaction.
- Xuelang English and Chinese pages no longer import or render `XuelangContact` and contain no Xuelang-specific contact module.
- Every localized route still renders the shared site Footer.
- Desktop and 390px mobile layouts have no clipping, overlap, or horizontal overflow.
- Reduced-motion mode remains static and usable.

## Out of Scope

- Changing Footer headline copy, liquid-field art, reveal behavior, height, or copyright
- Adding a contact form, LinkedIn, WeChat, resume links, or another contact channel
- Redesigning Xuelang case-study content outside removal of its contact module
- Changing non-public test fixture emails such as `person@example.com`
