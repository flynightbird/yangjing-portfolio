# ConvoAI AI Studio Launch Banner Design

## Scope

Add one bilingual promotional banner to the ConvoAI case-study hero. The banner appears immediately below the project facts row and above the existing next-section hint. It does not replace the current App + Web hero stage, add a CTA, or change any case-study claims.

## Content

### Chinese

- Title: `声网 AI Studio 正式上线`
- Subtitle: `自由搭配 ASR、LLM、TTS、数字人等，快速搭建 AI 智能体。`

### English

- Title: `Agora AI Studio is officially live`
- Subtitle: `Mix and match ASR, LLM, TTS, digital humans, and more to rapidly build AI agents.`

The banner is informational only. It contains no link, button, or implied interaction.

## Visual Composition

- Fill the available width of the ConvoAI article column.
- Use a `16px` corner radius and clip all artwork to the banner boundary.
- Use the approved horizontal gradient exactly: `#5954F7 44%`, `#9EB8F3 78%`, `#D6DBFC 100%`.
- Place the localized copy on the left and the supplied artwork group on the right.
- Keep the copy left aligned. Desktop copy uses equal `50px` left and right padding.
- Use `正主2.png` as the transparent base artwork.
- Overlay `banner小图1.png` and `banner小图2.png` using the relative composition established by `正主.png`.
- Preserve the approved Option A artwork scale: the artwork group occupies `67%` of the desktop banner width.
- Position small image 1 at `left: 46.5%`, `top: 7%`, and `width: 17.2%` inside the artwork group.
- Display small image 2 at `90%` of its initial reference size by using `width: 11.16%`, `left: 41%`, and `top: 47%` inside the artwork group; these values preserve its visual center.
- Do not add glow, extra badges, CTA treatments, or new decorative assets.

## Responsive Behavior

### Desktop and Tablet

- Keep the title on one line.
- Keep the subtitle on one line.
- Vertically center the copy within the banner.
- Right-align the full artwork group and preserve the approved relative proportions.
- Maintain equal `50px` horizontal copy padding.

### 375px Mobile

- Stack copy above the artwork within the same banner.
- Use equal `20px` left and right copy padding.
- Allow the title and subtitle to wrap naturally.
- Keep the artwork anchored to the lower-right area and crop only decorative transparent artwork when necessary.
- Prevent horizontal page overflow and prevent copy from overlapping the artwork.

## Motion

- Animate only the two small overlay images.
- Small image 1 uses the more visible motion: a `26px` total vertical travel with a subtle counter-rotation over a `3.6s` ease-in-out loop.
- Small image 2 uses a quieter `10px` total vertical travel over a `5.2s` ease-in-out loop, delayed by `450ms` to create an offset rhythm.
- The base artwork remains static so the banner does not compete with the existing GSAP hero motion.
- Under `prefers-reduced-motion: reduce`, disable both loops and render the overlays in their static reference positions.

## Component Boundary

Create a case-local `ConvoAiLaunchBanner` component under `components/convo-ai/`. It owns:

- locale-specific copy;
- the three decorative image layers;
- the banner-specific accessibility contract;
- responsive composition classes.

Render it from `ConvoAiLayout` after the facts list and before `data-convo-next-section-hint`. Keep its styling in the ConvoAI layout style boundary rather than introducing global banner styles.

## Assets

Copy the supplied files into `public/images/convo-ai/launch-banner/`:

- `正主2.png` as the base artwork;
- `banner小图1.png` as floating overlay 1;
- `banner小图2.png` as floating overlay 2.

Use stable ASCII filenames in the public directory. Preserve transparency and original pixel dimensions. The composed reference image `正主.png` is a positioning reference only and is not rendered.

## Accessibility

- Treat all three images as one decorative visual group because the localized text carries the banner meaning.
- Use empty alternative text and hide the artwork container from assistive technology.
- Do not add a second page-level heading. Render the promotional title as styled text within a labelled banner region.
- Ensure foreground copy maintains readable contrast across the gradient.
- Motion must comply with the reduced-motion rule above.

## Verification

- Component test: Chinese and English copy render for their respective locales.
- Component test: the banner appears after the facts list and before the next-section hint.
- Component test: the artwork exposes three image layers and no interactive control.
- Static asset test: all three public PNG files exist and retain the expected dimensions.
- Browser test at desktop width: title and subtitle each remain on one line; the banner has a `16px` radius and no overflow.
- Browser test at `375px`: copy uses equal `20px` horizontal padding, wraps without clipping, stays above the artwork, and causes no horizontal page overflow.
- Motion test: overlay 1 uses the larger travel, overlay 2 is rendered at `90%` of the initial reference display size, and reduced-motion disables both animations.

## Out of Scope

- Changes to the existing ConvoAI hero App/Web stage or its GSAP scroll sequence.
- New links, marketing CTAs, analytics, launch metrics, or unsupported product claims.
- Changes to other portfolio projects or the shared site shell.
