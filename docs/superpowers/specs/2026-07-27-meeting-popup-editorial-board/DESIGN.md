# Design System: Meeting Popup Editorial Evidence Board

## 1. Visual Theme & Atmosphere

A restrained editorial insert placed inside a dark case-study page. The atmosphere is warm, paper-like, and deliberate — closer to a magazine proof spread than a product poster. The block should feel intelligent and composed, with visible internal structure, asymmetry under control, and almost no theatrical effects.

Density target: 4/10
Variance target: 6/10
Motion target: 2/10

## 2. Color Palette & Roles

- **Warm Paper** (`#F7F6F3`) — main board surface
- **Soft Sheet** (`#FBFBFA`) — secondary paper variation or background panels
- **Pure Card** (`#FFFFFF`) — popup screenshot cards
- **Editorial Ink** (`#111111`) — primary text and labels
- **Quiet Caption** (`#787774`) — secondary text and metadata
- **Whisper Line** (`#EAEAEA`) — borders, dividers, guide lines

Rules:

- No purple, no blue-neon, no gradients.
- Do not introduce a second accent family.
- If a muted accent is needed at all, it must remain below the visual weight of the popup screenshots.

## 3. Typography Rules

- **Display / Section label:** Geist Sans or equivalent clean sans, uppercase, tight tracking, very small scale
- **Body / UI:** Geist Sans or equivalent neutral sans
- **Mono:** Geist Mono or equivalent for micro labels if needed

Guidance:

- Hierarchy comes from spacing and weight, not giant text.
- Keep text sparse inside the board.
- No decorative serif moment inside this module.

## 4. Component Stylings

- **Board shell:** warm paper rectangle, crisp radius (`12px` max), `1px solid #EAEAEA`
- **Popup cards:** white cards with the same crisp radius family (`8px`–`12px`)
- **Shadows:** nearly invisible; ultra-diffuse only if needed to separate white cards from paper
- **Guide lines:** allowed as faint grid or layout lines behind the cards
- **Hover:** small lift only; no sibling fade-down choreography

## 5. Layout Principles

- Use a **1 main + 3 support** editorial composition.
- The main popup is clearly dominant.
- The three supporting cards are offset around it but remain snapped to a visible internal grid logic.
- No absolute chaos, no overlapping pile, no equal 2×2 default grid.
- Large whitespace is part of the composition and should remain visible.

## 6. Motion & Interaction

- Default state should already look finished without motion.
- Hover can raise the focused card slightly with a tiny shadow change.
- Motion must stay transform/opacity only.
- Reduced motion keeps all cards static.

## 7. Anti-Patterns (Banned)

- No gradients
- No purple or neon glow
- No ghost-outline windows
- No heavy shadows
- No pill-shaped large containers
- No equal 4-up feature grid
- No dramatic hover dimming on non-focused cards
- No decorative filler text
- No overlapping scrapbook composition
