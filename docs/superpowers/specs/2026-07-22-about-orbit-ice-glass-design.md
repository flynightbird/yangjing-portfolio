# About Orbit Ice Glass Design

## Design Read

Targeted redesign of a product designer portfolio About Hero for recruiters and design leads. Preserve the existing technical orbit structure while making its material language coherent with the supplied bright blue digital artwork.

## Locked Direction

- Keep the full-bleed blue background, square composition, rounded frame, orbital layout, labels, and rotation.
- Replace black node fills with translucent ice-blue surfaces.
- Use a deeper translucent cobalt surface for the central YJ hub to preserve hierarchy.
- Replace the four competing accent colors with one coherent blue family.
- Use cool white for orbit geometry and deep navy for labels on light nodes.
- Improve captions over the image with a subtle local text shadow, not a frame-wide overlay.
- Preserve desktop and mobile dimensions and avoid new page-level motion.

## Material Tokens

- Center hub: translucent cobalt blue with a soft white inner edge.
- Capability nodes: translucent pale blue with a cool-white border.
- Primary node labels: deep navy.
- Center label: cool white.
- Orbit and connectors: translucent cool white.
- Captions: deep navy with a restrained pale highlight.

## Verification

- Component contract identifies the approved `ice-glass` material.
- Existing About component tests pass.
- `/en/about/` and `/zh/about/` render at desktop and 390px without horizontal overflow.
- Visual inspection confirms readable node labels against both cloud and cyan regions.

