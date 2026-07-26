# Homepage Visual Archive: Tongcheng Travel Card Design

**Date:** 2026-07-26  
**Status:** Approved for implementation

## Scope

Add one real project card to the end of the homepage Visual Archive. The new card presents a small collection of Tongcheng Travel Financial Business Unit work. No other homepage module, project card, footer, or case-study page changes in this scope.

## Content

- Company: `Tongcheng Travel` / `同程旅游`
- Year: `2019`
- Cover title: `Tongcheng Travel` / `同程旅游`
- Chinese description: `在同程旅游金融事业部，面向不同用户群体，参与多类产品的体验与界面设计。`
- English description: `Product and interface design across multiple offerings for distinct user groups within Tongcheng Travel's Financial Business Unit.`
- Skill: `UI设计`
- English skill: keep the same visible source value unless localization is added to the archive skill model in a separate change.
- Destination: lightbox only; the card does not introduce a new route.

## Assets

Copy the supplied source files into a dedicated public archive directory with stable ASCII filenames.

| Role | Source file | Public filename |
| --- | --- | --- |
| Cover | `封面.png` | `cover.png` |
| Gallery 1 | `众筹20.png` | `01-crowdfunding-2.png` |
| Gallery 2 | `码上游日本.jpg` | `02-mashangyou-japan.jpg` |
| Gallery 3 | `同程合伙人.jpg` | `03-tongcheng-partner.jpg` |
| Gallery 4 | `出境游小程序.jpg` | `04-outbound-travel-mini-program.jpg` |

All five supplied images are 16:9. Preserve their original dimensions and visual content; do not crop, redraw, recolor, or bake the title into the bitmap.

## Cover Composition

- Add a dedicated `tongcheng-travel` cover variant to the existing archive system.
- Render the title as semantic HTML over the supplied cover.
- Place `同程旅游` below the fish motif on the left side of the image.
- Keep approximately one title-line height of clear space between the bottom of the fish/white oval composition and the title.
- Use the existing `.archiveCoverTitle h3` typography so the title size and weight match the other Visual Archive covers at each breakpoint.
- Use white title text against the black cover. Keep the company/year line in the established cover-index style with sufficient contrast.
- Position the overlay with percentage-based insets so it remains anchored to the artwork on desktop and mobile without covering the fish.

## Card And Lightbox Behavior

- Append the card after the existing Mr Chong card; do not reorder existing entries.
- The cover opens the existing archive Lightbox.
- The gallery starts with `众筹20`, followed by `码上游日本`, `同程合伙人`, and `出境游小程序`.
- Preserve existing keyboard, previous/next, close, focus, error, and reduced-motion behavior.
- Update archive count and position output to use the actual total of five cards. The last card must report `05 / 05`.

## Accessibility

- Provide localized, descriptive alt text for the cover and each gallery image.
- The Lightbox trigger label must include the localized project title.
- Title text remains real HTML rather than image-only content.
- Existing focus treatment and dialog semantics remain unchanged.

## Responsive Requirements

- Preserve the archive's existing 16:9 card geometry and carousel width behavior.
- At mobile widths, the title must stay below the fish motif and inside the cover bounds.
- Text must not overlap the company/year line or the geometric artwork on the right.
- The facts area continues to use the existing description and skills layout.

## Verification

- Component tests assert five cards, five Lightbox triggers, five skill blocks, and `01 / 05` initial position.
- Interaction coverage verifies navigation can reach `05 / 05` and return to the previous card.
- Lightbox coverage verifies the Tongcheng card opens and that the first gallery image is `众筹20`, with `码上游日本` second.
- Desktop and mobile visual checks confirm title scale, spacing below the fish, lack of overlap, and correct gallery order.
- Confirm no unrelated homepage module changed.
