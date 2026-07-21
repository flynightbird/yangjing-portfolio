# Xuelang Hero Image Replacement Design

**Date:** 2026-07-17
**Status:** Approved visual direction
**Branch:** `codex/xuelang-case-polish`

## Objective

Replace the four product screenshots in the Xuelang case-study Hero with the newly supplied vertical screens. Preserve the established editorial composition and improve the coherence of the four-state product story without changing images used elsewhere in the case study.

## Approved Direction

Use option A: retain the existing four-panel overlapping composition.

- Preserve the current panel sizes, depth order, rotations, overlap, labels, and hover motion.
- Keep the dark panorama, oversized `XUELANG` word, and the existing `2:1` desktop frame.
- Treat the screenshots as product evidence within an expressive Hero, not as a gallery intended for detailed reading.
- Prioritize the desktop composition. Responsive behavior must remain functional, but must not weaken the desktop presentation.

## Asset Mapping

Create dedicated Hero assets so that existing case-study evidence remains unchanged.

| Supplied source | Evidence source | Public asset | Story state |
| --- | --- | --- | --- |
| `详情-hero配图1.png` | `evidence/xuelang/source/hero-discover.png` | `public/images/xuelang/hero-discover.webp` | Discover / 发现 |
| `详情-hero配图2.png` | `evidence/xuelang/source/hero-decide.png` | `public/images/xuelang/hero-decide.webp` | Decide / 决策 |
| `详情-hero配图3.png` | `evidence/xuelang/source/hero-learn.png` | `public/images/xuelang/hero-learn.webp` | Learn / 学习 |
| `详情-hero配图4.png` | `evidence/xuelang/source/hero-retain.png` | `public/images/xuelang/hero-retain.webp` | Retain / 沉淀 |

Preserve the supplied PNG files as source evidence. Produce optimized WebP derivatives for the website and register all new assets in `evidence/xuelang/manifest.json`.

## Composition And Cropping

- Start with the current panel geometry unchanged.
- Render all four images with `object-fit: cover` and top-center alignment.
- Tune `object-position` per panel only when browser review shows that a meaningful header, course title, primary action, learning progress, or note interaction is obscured.
- Do not edit the screenshots themselves, add device frames, or add artificial corner rounding to the source files. The existing Hero panel container provides the visual framing.

## Content And Accessibility

Update the English and Chinese image alternatives to describe the visible product state rather than the composition. Keep the state sequence equivalent across locales:

1. Discover / 发现
2. Decide / 决策
3. Learn / 学习
4. Retain / 沉淀

The labels may remain concise English interface markers in both locales because they function as visual taxonomy in the Hero.

## Performance

- Generate WebP assets at a resolution sufficient for the largest desktop panel at high-density display scale.
- Avoid upscaling beyond the supplied source dimensions.
- Use a quality setting that preserves UI text and thin divider lines while materially reducing transfer size from the source PNGs.

## Verification

- Update component tests to assert the four dedicated Hero paths in order.
- Confirm that the old evidence assets remain available to downstream case-study sections.
- Run focused component tests, lint, the complete automated test suite, and a production build.
- Review the rendered Hero at desktop widths of `1440px` and `1728px` for hierarchy, cropping, overlap, and image clarity.
- Check a representative mobile viewport for overflow, collisions, and unreadable labels without redesigning the desktop-first composition around mobile.

## Out Of Scope

- Changes to Hero copy, facts, PDF download, chapter navigation, or motion timing.
- Replacement of screenshots in later case-study sections.
- A new mobile-specific Hero design.
- Reordering or redesigning the approved four-state narrative.
