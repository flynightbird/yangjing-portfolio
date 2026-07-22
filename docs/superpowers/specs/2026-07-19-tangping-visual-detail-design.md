# Tangping Visual Detail Design

**Date:** 2026-07-19
**Status:** Approved
**Project:** Yang Jing Portfolio, Visual Archive

## Objective

Add a bilingual internal detail page for the Visual Archive entry currently titled "Mei Ping Mei Wu / Design" and referred to as the Tangping project. The page must reproduce the supplied Figma compositions with real web text while using only the corresponding text-free images as production artwork.

The initial story contains frames 6, 10, 11, and 20. The design must support later frame additions without changing the agreed presentation rules.

## Routes And Entry Point

- Publish the detail page at `/zh/work/tangping/` and `/en/work/tangping/`.
- Change the existing Alibaba / Mei Ping Mei Wu Visual Archive card from a lightbox-only entry to an internal project link.
- Preserve the current lightbox behavior for all other Visual Archive entries.
- Use the existing archive cover image, `/images/archive/alibaba-meipingmeiwu.jpg`, as the detail-page hero artwork.
- Overlay the existing company, period, project name, and project type as real HTML text on the hero.

## Asset Pairing And Order

Each story frame is represented by a filename pair with the same numeric prefix:

- `N.png` is the text-bearing Figma reference. It is used only for copy extraction, positioning, and visual comparison.
- `N-1.png` is the text-free production artwork. It is the only member of the pair rendered by the website.

Frame order is the ascending numeric value of `N`, not lexicographic filename order. The initial sequence is therefore:

1. `6`
2. `10`
3. `11`
4. `20`

Future paired frames automatically enter the story at their numeric position. For example, frame 8 belongs between frames 6 and 10. A frame is publishable only when its reference image, production image, localized copy, dimensions, and layout definition are all present.

Production assets live under `/public/images/tangping/`. The application must not depend on the source files on the desktop.
Text-bearing references live under `/evidence/tangping/` for extraction and visual verification only; public pages never load them.

## Page Structure

The page is one continuous vertical narrative:

1. Existing cover hero with HTML project metadata
2. Frame 6: design background
3. Frame 10: user research
4. Frame 11: research dimensions and personas
5. Frame 20: role-based needs and product opportunities

All story frames share the same content width. Their height follows the intrinsic image ratio and responsive text layout. Frames do not fill or snap to the viewport.

There are no borders, rules, dividers, or extra gaps between adjacent story frames. The hero may retain natural chapter spacing before the first frame.

## Rendering Model

Use a hybrid composition for every frame:

- Render the `N-1.png` artwork as the complete, uncropped visual base.
- Recreate the text removed from `N.png` using semantic HTML and CSS.
- Recreate titles, body copy, data statements, legends, persona labels, table headers, row labels, and matrix cell descriptions.
- Keep small text already embedded inside report screenshots and charts in the base image; do not duplicate it.
- Keep image data, localized copy, and layout coordinates separate so one can change without rewriting the others.

The Chinese page follows the supplied reference copy. The English page uses an equivalent English translation while preserving the same information hierarchy. Text embedded in source screenshots remains in its original language.

## Component Architecture

- Register `tangping` as a bilingual work slug in the existing content registry.
- Add `tangping.zh.mdx` and `tangping.en.mdx` entries for metadata and localized narrative content.
- Add a dedicated `TangpingLayout` instead of reusing the long-form `CaseLayout`; the visual story does not use the case-study chapter rail.
- Add a frame renderer that receives the numeric frame ID, production image metadata, localized text groups, and layout variant.
- Extend the archive entry model with an internal destination for Tangping while retaining the external-link and lightbox-only states used by other entries.
- Reuse the existing site header, locale behavior, metadata generation, and project navigation conventions.

The frame renderer owns only shared rendering and reveal behavior. Frame-specific text placement remains in focused layout variants so the complex matrices do not turn into conditional markup inside one oversized component.

## Desktop Layout

- Keep the full text-free image visible without cropping.
- Position text groups with normalized coordinates relative to the frame canvas.
- Match the text-bearing reference for hierarchy, alignment, line length, and visual grouping.
- Keep all frames at one shared responsive width.
- Allow height to follow the artwork ratio and content needs; do not force a viewport height.
- Do not place dividers or spacing between frames.

## Mobile Layout

Below the mobile breakpoint, preserve reading quality rather than shrinking the entire desktop composition:

- Keep the production artwork full-width and uncropped.
- Retain short titles and key data in the visual area when they remain readable.
- Move long paragraphs, persona explanations, legends, and dense matrix content into semantic groups below their related image.
- Preserve the same frame and content order as desktop.
- Do not introduce horizontal scrolling.

## Motion

Motion is restrained and content-led:

- Reveal each frame's title, body, and labels in three subtle layers as the frame enters the viewport.
- Use a small upward translation with opacity; do not scale or parallax the artwork.
- Trigger each layer once and keep the final state stable.
- When `prefers-reduced-motion: reduce` is active, render every layer immediately with no transition.

## Accessibility

- Use semantic heading levels and preserve a logical DOM reading order independent of absolute desktop positioning.
- Provide localized alternative text for meaningful artwork.
- Treat purely structural artwork as decorative when the equivalent information is present in HTML.
- Keep links keyboard accessible and provide a visible focus state.
- Maintain readable contrast over the black composition.
- Ensure mobile reflow remains understandable without reference to spatial coordinates such as "left" or "above."

## Failure And Validation Behavior

All content is local and requires no runtime data fetch.

Build-time validation must reject:

- a frame with a missing reference or production image;
- a frame without Chinese or English content;
- an unsafe public asset path;
- invalid or missing image dimensions;
- duplicate numeric frame IDs;
- a frame sequence that is not numerically ascending;
- a production configuration that references the text-bearing `N.png` image.

Reserve the image aspect ratio to prevent layout collapse. If an image cannot render at runtime, keep the HTML text visible against the black frame background.

## Verification

Automated tests cover:

- Visual Archive navigation to both localized Tangping routes;
- static generation and metadata for both locales;
- numeric frame ordering, including multi-digit values;
- the initial `6, 10, 11, 20` sequence;
- exclusive production use of the `N-1.png` artwork;
- absence of frame borders and inter-frame gaps;
- localized copy availability;
- reduced-motion behavior;
- no horizontal overflow at supported mobile widths.

Playwright screenshots verify desktop and mobile rendering against the text-bearing references. Review focuses on shared frame width, copy position, wrapping, overflow, mobile reading order, image completeness, and the absence of visual separators between frames.

## Out Of Scope

- Rebuilding text already embedded in small report screenshots or charts
- Viewport snapping, slide navigation, or scroll hijacking
- Parallax, image scaling, or decorative transition effects
- Redesigning other Visual Archive projects
- Publishing unpaired or partially localized future frames
