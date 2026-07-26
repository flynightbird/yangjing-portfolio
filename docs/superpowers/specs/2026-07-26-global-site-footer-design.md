# Global Site Footer Design

## Goal

Make the approved liquid contact Footer the only Footer implementation across the portfolio. Remove the legacy detail-page email row and apply one shared component to every localized route and the global not-found page.

## Route Coverage

- The localized layout continues to render one `SiteFooter` for every `/en/` and `/zh/` route, including home, About, Build, and Work pages.
- The global not-found document renders the same `SiteFooter` with English content because the not-found route has no locale parameter.
- The root `/` language resolver remains Footer-free because it is a transient redirect surface rather than portfolio content.
- No page mounts its own additional Footer.

## Component Architecture

- `SiteFooter` remains the public shared component and accepts a required `locale` prop.
- Rename `HomeFooterContacts` to `FooterContacts` because the dual Email and WeChat capsule surface is no longer homepage-specific.
- Keep `FooterCopyButton` as the shared client-side clipboard state controller.
- Delete `FooterEmailActions`; its single-email legacy presentation is no longer rendered anywhere.
- `SiteFooter` renders only the liquid decoration, localized CTA, `FooterContacts`, and copyright metadata.

## Presentation

- The deep-purple `#19161b` liquid Footer, two transform-only ribbons, restrained sheen, borderless glass capsules, and Copy-to-Check behavior become the default presentation on every route.
- Remove homepage-only `body:has([data-homepage])` switches from Footer CSS.
- Remove obsolete legacy email-row selectors and styles.
- Preserve the existing responsive single-column capsule layout and reduced-motion behavior.
- Footer remains in normal document flow on every route. No sticky reveal, page-flip effect, scroll listener, Canvas, or route-specific Footer variant is introduced.

## Accessibility And Interaction

- Email remains a `mailto:` link with independent Copy and Arrow actions.
- WeChat remains a text value with an independent Copy action.
- Copy success changes Copy to Check for 1.8 seconds; failures remain localized and announced through the control's live region.
- Focus-visible treatment and fixed control dimensions remain unchanged.
- The global not-found Footer uses English labels and announcements.

## Removal Contract

- Delete `components/shell/footer-email-actions.tsx`.
- Remove all imports, data attributes, styles, and tests that refer to the legacy email actions.
- Rename the homepage-specific contact component and its test selectors to site-wide terminology.
- Retain no hidden duplicate Footer markup.

## Verification

- Component tests prove `SiteFooter` renders only the dual contact capsules in both locales and preserves independent clipboard states.
- Layout and route tests prove the localized shell mounts exactly one shared Footer.
- Browser tests cover home, About, Work, Build, and global not-found routes; each route must show one liquid Footer and no legacy email row.
- Desktop and mobile checks confirm no overlap or horizontal overflow.
- Reduced-motion checks confirm all decorative animations are disabled.
- Full unit tests, lint, and framework build run from an isolated implementation worktree so unrelated Meeting changes remain untouched.
