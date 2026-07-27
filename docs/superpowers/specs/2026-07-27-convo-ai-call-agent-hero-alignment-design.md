# ConvoAI Call Agent-Style Hero Alignment Design

## Scope

Restructure only the ConvoAI case-study opening so its title, description, project facts, launch banner, and App + Web product scene follow the same reading hierarchy as the Call Agent detail page. Preserve ConvoAI's near-black visual system, current media, video behavior, semantic colors, GSAP motion, chapter navigation, and case-study content.

## Goals

- Make the project identity and proposition readable before the product media.
- Align the opening information hierarchy with Call Agent without copying Call Agent's light theme.
- Use one page-level heading and remove the duplicate title and description from inside the visual stage.
- Keep the launch banner between the project information and the App + Web Hero.
- Give the desktop detail column a clear right safe area of `60px`.
- Preserve the current mobile media sizing and prevent horizontal overflow at `375px`.

## Opening Hierarchy

The ConvoAI opening uses this fixed order:

1. Title and project facts
2. AI Studio launch banner
3. App + Web product Hero
4. Next-section hint

The title area appears before all promotional and product media so a reviewer can understand the project, role, and core challenge in one scan.

### Left Column

- Eyebrow: `AGORA / SHIPPED PRODUCT / APP + WEB`
- H1: the complete localized `meta.title`
- Supporting copy: the localized `meta.proposition`

The complete metadata title becomes the only H1 on the page. Do not add an audience statement or any new product claim.

### Right Column

Show the existing four project facts in a `2 x 2` grid:

- Role
- Scope / terminal
- Product
- Status

Keep all values unchanged. The facts use restrained dividers and compact labels suited to the narrow right column. There is no action row because ConvoAI currently has no verified or required hero action.

## Desktop Layout

At desktop widths, use the Call Agent hero relationship:

- The title block and facts form a two-column `heroTop` grid.
- Use a `1.2fr / 0.8fr` split and align both columns at the bottom.
- Use the existing case-study project-title tokens for H1 size, weight, and line height.
- Set the proposition's maximum measure to `50ch`.
- Place the Banner full-width below `heroTop`.
- Place the App + Web Hero full-width below the Banner.
- Keep consistent vertical gaps between `heroTop`, Banner, Hero, and the next-section hint.

The detail-page frame uses a `60px` right gutter at desktop widths. The title area, facts, Banner, Hero, and next-section hint share the resulting right boundary. This safe area belongs to the detail-page frame rather than being implemented as unrelated margins on individual modules.

## Responsive Layout

### Tablet

- Collapse `heroTop` to one column when the existing chapter rail becomes compact.
- Place facts below the proposition and before the Banner.
- Reduce the article right safe area to `32px`.
- Keep Banner and Hero at the full width of the resulting content column.

### Mobile

- Use one reading column in the same semantic order.
- Use `16px` left and right page gutters.
- Preserve the Banner's approved mobile stacking and wrapping behavior.
- Preserve the Hero's sequential, non-pinned mobile behavior.
- Keep every media frame inside the `375px` viewport with no horizontal document overflow.

## Hero Media Behavior

The existing `ConvoAiStage` remains the App + Web visual and animation boundary, but the opening instance becomes media-only:

- Do not render its internal eyebrow, title, or description.
- Keep the Web recording, foreground App phone, platform focus controls, media sizing metadata, sound controls, and current GSAP hooks.
- Keep `data-convo-ai-stage`, `data-hero`, `data-convo-web-plane`, and `data-convo-app-device` so motion and browser tests retain stable targets.
- Associate the media-only stage with the external H1 and proposition through `aria-labelledby` and `aria-describedby`.

Non-Hero uses of `ConvoAiStage` retain their current internal headings and descriptions.

## Component Boundaries

### `ConvoAiLayout`

Owns the opening information architecture:

- renders `heroTop`;
- renders the external H1 and proposition;
- renders the facts in the right column;
- orders Banner, Hero, and next-section hint;
- supplies accessible label and description IDs to the Hero stage.

### `ConvoAiStage`

Adds a narrowly scoped media-only mode for the page-opening instance. The default mode remains unchanged for stages that still need internal copy. Do not create a generic cross-project Hero abstraction in this change.

### Styling

Keep all new layout rules inside the ConvoAI CSS Module. Reuse shared case-study typography tokens, but preserve ConvoAI's dark colors and media styling.

## Motion

- The Banner keeps its current two floating-image loops.
- The Web scale and App differential scroll motion remain attached to the visual stage.
- Moving the visual stage below the Banner changes only the scroll trigger's document position; it must not change the animation range, direction, or reduced-motion behavior.
- Do not introduce title or facts animation, a new long pin, or decorative motion.

## Accessibility

- Render exactly one H1 on the ConvoAI page.
- Keep the H1 before the Banner and Hero in DOM and visual order.
- Label the media-only Hero using the external project title and describe it using the external proposition.
- Preserve all video labels, descriptions, sound controls, keyboard behavior, and reduced-motion behavior.
- Preserve readable contrast for text and dividers on the near-black background.

## Verification

### Component Tests

- The complete localized `meta.title` renders as the only H1.
- The project facts render inside the top information region rather than below the Hero.
- DOM order is `heroTop -> Banner -> App + Web Hero -> next-section hint`.
- The opening `ConvoAiStage` is media-only and references the external title and proposition.
- Non-Hero stages retain their internal semantic heading behavior.

### Browser Tests

- At `1440px`, the title/facts form two columns and the detail-page frame uses a `60px` right gutter.
- The title and proposition remain completely above the Banner.
- The Banner remains completely above the App + Web Hero.
- At tablet width, title and facts stack and the right safe area is `32px`.
- At `375px`, the opening follows the same order, uses `16px` page gutters, and has no horizontal overflow.
- Existing Hero media ratios, phone sizing, sound controls, GSAP motion, and reduced-motion behavior continue to pass.

## Non-Goals

- No changes to ConvoAI copy, claims, facts, chapters, media assets, or product recordings.
- No changes to Call Agent.
- No shared cross-project Hero component.
- No changes to Banner artwork, copy, animation, or responsive composition.
- No changes to chapter content, Footer, top navigation, or chapter navigation.
