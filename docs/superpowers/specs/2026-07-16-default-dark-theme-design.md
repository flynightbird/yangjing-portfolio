# Default Dark Theme Design

## Objective

Make the portfolio default to a restrained dark theme while retaining the current light palette as named tokens for future use. Do not add a visible theme switcher.

## Theme

- Canvas: `#111311`
- Raised surface: `#181B18`
- Primary text: `#F2F4F0`
- Muted text: `rgba(242, 244, 240, 0.68)`
- Border: `rgba(242, 244, 240, 0.16)`
- Strong border: `rgba(242, 244, 240, 0.32)`
- Existing signal green, cobalt, and coral remain accent colors.

The existing light colors remain available as `--theme-light-*` variables. Active UI colors map to the dark theme through semantic canvas, surface, ink, muted, and border variables.

## Scope

Apply the dark theme to the global page canvas, site header, homepage sections, carousel controls, metadata, and footer. Preserve project-cover artwork and its art-directed black or white overlay text. Preserve the Xuelang case study's self-contained visual theme and print styles.

No toggle, system preference listener, persistence, or animation is added.

## Verification

Check desktop and mobile screenshots, readable text contrast, header menus, carousel controls, project cards, hover states, no horizontal overflow, and all four Visual Archive cover treatments.
