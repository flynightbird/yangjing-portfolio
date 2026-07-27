# Homepage Tongcheng Card Removal Design

## Goal

Remove only the standalone Tongcheng Travel card from the homepage Visual Archive while preserving the MR CHONG card.

## Scope

- Remove the `tongcheng-finance-ui` entry from the published `archiveProjects` array.
- Keep `tongcheng-mr-chong` unchanged.
- Keep the Tongcheng Travel image assets in `public/images/archive/details/tongcheng-travel/` for possible future reuse.
- Keep the About-page Tongcheng Travel career history unchanged.
- Do not change the shared carousel or lightbox components.

## Resulting Homepage Contract

The Visual Archive publishes four cards in this order: Tangping, Open Language, Doudou Fox, and MR CHONG. The carousel count and last position become `04 / 04`, and Chinese and English homepages expose four lightbox triggers.

## Verification

- Add a failing unit assertion that rejects `tongcheng-finance-ui` and expects the four-card order.
- Update homepage component and end-to-end expectations from five entries to four.
- Verify `MR CHONG` remains visible and opens its existing four-image gallery.
- Verify no homepage heading or lightbox trigger remains for the standalone `同程旅游` / `Tongcheng Travel` card.
