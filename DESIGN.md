# Design System

## Theme

**Interface X-Ray**

The portfolio feels precise, editorial, technical, and human. Interface evidence is the visual material; decoration never substitutes for real work.

English is the default locale. Every public route and essential interaction has a complete Simplified Chinese equivalent, with aligned hierarchy and meaning across both languages.

## Experience Priority

The portfolio is first a visually forceful showcase of Yang Jing's visual-expression ability. Case-study reading efficiency remains important, but it is the secondary priority when the two goals compete.

This means the page may use bold composition, large media, and orchestrated motion to create a strong first impression. It must still preserve legible project evidence, stable reading surfaces, accessible controls, and reduced-motion alternatives.

## Color Palette

The system uses a committed multi-role palette:

- **Cool white — `#F3F5F2`:** reading surfaces and the Product Designer side of the Hero.
- **Carbon black — `#10110F`:** the AI-native Builder side of the Hero and high-focus visual stages.
- **Signal green — `#B7FF3C`:** system status, scans, progress, and active state.
- **Cobalt blue — `#194BFF`:** links, the Builder cursor, and digital annotations.
- **Coral signal — `#FF654D`:** limited Meeting and exception emphasis.

Neutral text and borders derive from the cool-white and carbon relationship rather than a blue-only palette.

## Typography

- **English display:** Archivo Black.
- **English body:** Libre Franklin.
- **Technical labels:** DM Mono.
- **Simplified Chinese:** Noto Sans SC.
- **Letter spacing:** `0` throughout.

Type uses explicit responsive steps. It does not scale font size with viewport width. Hero-scale type is reserved for the Hero and major project propositions.

## Geometry And Layout

- Use a responsive 12-column desktop grid.
- Keep primary content at a maximum width of approximately `1440px`.
- Keep corner radii at or below `6px`, except for geometry inside unmodified product evidence.
- Build page sections as full-width bands or unframed layouts with constrained inner content.
- Use sharp divisions and fine borders, with mostly flat layers.
- Do not nest cards inside cards.
- Reserve shadows for functional elevation.
- Give fixed-format media stable dimensions and preserve source aspect ratios so captions, controls, and loading states cannot shift the surrounding layout.

## Hero

The Hero is a full-width split composition:

- A cool-white field communicates Product Designer.
- A carbon-black field communicates AI-native Builder.
- A real portrait of Yang Jing is centered across and connects both fields.
- The portrait remains the primary visual anchor; system-scan behavior and digital annotations remain secondary.
- A manually draggable central divider is the primary desktop and touch reveal control.
- Hover never moves the divider. Hovering the Builder field activates an abstract field of characters, coordinates, and data traces with restrained pointer parallax.
- The Builder field remains faintly alive at rest with low density and slow drift. Hovering the Builder side or dragging toward it increases density, velocity, clarity, and pointer depth.
- Code-field motion is clipped to the Builder side. Tokens compress, shear, and redirect as they approach the divider so it reads as a physical boundary without contaminating the Designer field.
- The Builder atmosphere is optimized for visual impact, not literal source-code readability. It must remain behind the portrait and role labels.
- Clicking a role snaps the divider toward that identity, keyboard arrows provide an equivalent control, and the divider holds its released position.
- Dragging is continuous, with subtle magnetic settling at the center and near-edge reveal states. The chosen position persists while the visitor remains in the Hero. Five seconds after the pointer leaves the Hero, the divider returns to center with damped motion; re-entry or any input cancels the reset.
- Desktop and mobile both keep the two roles legible in the first viewport and reveal a hint of the following ByteDance section.

## Motion And Interaction

- Use expressive motion as a portfolio-wide visual storytelling tool, with the highest intensity reserved for the Hero identity sequence and selected project transitions.
- Pace the homepage as a wave rather than a continuous spectacle: the Hero creates the strongest peak, project transitions create distinct secondary peaks, and case-reading surfaces deliberately become quiet and stable.
- Keep direct-manipulation controls predictable: dragging owns the Hero divider while hover activates atmosphere only.
- Keep case-study reading layouts stable, with restrained evidence reveals and short navigation transitions.
- Provide static end states and reduced-motion alternatives for all pointer, scroll-linked, and entrance motion.
- Disable the Hero's timed auto-return under reduced motion and while the page is not visible.
- Remove pointer-follow behavior on mobile.
- Preserve keyboard equivalents, visible focus, and non-hover access to essential content.

## Media

- Use real product screenshots, portrait photography, Figma interaction captures, and live Build Lab previews.
- Preserve critical UI areas and source aspect ratios.
- Prefer annotations, local zooms, and cropped evidence blocks over unreadably reduced full screens.
- Never edit evidence to imply a feature or outcome that did not exist.

## Prohibited Treatments

- Gradients, including gradient text and decorative color fields.
- Decorative orbs or bokeh.
- Glassmorphism.
- Decorative 3D.
- Scroll hijacking.
- Generic futuristic or AI illustration.
- Purple or beige visual drift.
