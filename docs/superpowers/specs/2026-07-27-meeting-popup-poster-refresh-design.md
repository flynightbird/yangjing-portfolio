# Meeting Popup Poster Refresh Design

**Date:** July 27, 2026

**Scope:** Refresh the popup-expression card inside the Meeting case study's “完整产品能力 / Capability & impact” section.

## Problem

The current popup card reads as an older feature-board treatment:

- the purple background fills too much of the card;
- the floating composition lacks a clear first focal point;
- the extra ghost window outlines make the block feel decorative instead of evidentiary.

## Approved direction

Use a **poster-like dark composition**:

- near-black base with one concentrated purple glow instead of a full washed gradient;
- four popup screenshots arranged as **2 support cards above + 2 lead cards below**;
- support cards stay smaller and slightly quieter;
- lead cards become the first read, larger and more legible;
- preserve a small amount of tilt and overlap for tension, but avoid scrapbook-style scattering;
- remove the ghost-window line art and other older ornamental framing.

## Interaction

- Hovering a popup brings that popup slightly forward.
- Other cards do not collapse into a dimmed “inactive” state.
- Reduced-motion users keep a static composition.

## Implementation notes

- Keep the section copy and surrounding showcase modules unchanged.
- Keep the four existing popup image assets unchanged.
- Express the new hierarchy in markup via semantic data attributes so source-level tests can protect the composition.
