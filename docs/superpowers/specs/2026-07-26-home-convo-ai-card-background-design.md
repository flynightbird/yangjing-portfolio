# Homepage ConvoAI Card Background Design

## Goal

Replace the homepage ConvoAI media card's current gradient with the supplied blue image. The image must fill the entire media card without padding or exposed edges while preserving the existing desktop browser-and-phone composition, mobile loop, reduced-motion poster, card geometry, and flagship focus motion.

## Approved Asset

- Source: `/Users/admin/Desktop/声网 作品集 整理/作品集配图/convo/封面背景.jpg`
- The source contains PNG image data at `803 x 460` despite its `.jpg` filename.
- Publish it without recompression as `public/images/convo-ai/home-card-background.png` so the repository extension matches the real file format.
- Treat the image as decorative because the foreground ConvoAI product media and linked project card already provide the meaningful accessible content.

## Component And Layering

Add one decorative background image as the first child of `ConvoAiMedia`. Generate its public URL with the existing `withBasePath` helper so local development, static export, and deployed base paths use the same asset contract.

The media stack is:

1. Full-bleed ConvoAI background image.
2. Desktop virtual browser and phone evidence.
3. Mobile animated loop or reduced-motion poster.

The background image uses an empty `alt` attribute and is hidden from assistive technology. It does not introduce a new interaction target, loading state, or motion effect.

## Visual Treatment

- Position the background layer absolutely with `inset: 0`.
- Set its width and height to `100%`.
- Use `object-fit: cover` and centered object positioning.
- Inherit the card's clipping boundary so the image reaches every edge while respecting the existing outer radius.
- Remove the existing gradient from `.flagshipConvoMedia` completely.
- Retain the existing neutral background color only as a fallback while the image loads or if it fails.
- Add no overlay, tint, blur, opacity reduction, padding, border, or extra gradient.

The same background is present on desktop and mobile. On mobile, the existing contained loop or poster stays above it, so any space around that foreground media reveals the approved image rather than the former gradient.

## Scope Boundary

Do not change:

- the ConvoAI card dimensions, radius, hover/focus transforms, or opacity states;
- the desktop virtual browser geometry or phone treatment;
- the mobile GIF and reduced-motion poster sources or their `contain` behavior;
- Call Agent, Meeting, Footer, project copy, or ConvoAI detail pages.

## Verification

- Component coverage verifies exactly one decorative background image and the approved base-path-aware asset source.
- Desktop and mobile browser coverage verifies the image is loaded, uses `object-fit: cover`, and shares the media card's full bounds with no inset.
- Existing foreground asset and responsive behavior tests remain valid.
- Visual checks at desktop and `390 x 844` confirm there are no uncovered edges, unintended cropping of foreground product media, or horizontal overflow.
- Final repository checks include only the supplied background asset, the ConvoAI homepage media component and styles, focused tests, this specification, and its implementation plan.
