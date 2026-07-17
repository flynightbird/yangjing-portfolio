# Homepage Brand and Project Architecture Design

**Date:** 2026-07-18
**Status:** Approved design
**Branch:** `codex/portfolio-nextjs`

## Objective

Refine the portfolio homepage into a visually forceful, contemporary expression of Yang Jing as a senior UX/UI designer and AI-native builder. The page should establish visual authorship first, then make the strongest product work easy to understand. This iteration covers the homepage brand system, navigation, introduction, core-project architecture, AIDX presentation, and footer. The locked Visual Archive remains structurally unchanged.

## Audience and Page Job

The primary audience is design leadership, product leadership, and recruiters evaluating senior product-design capability. The homepage has one job: establish Yang Jing's current positioning, prove it through a deliberately weighted sequence of projects, and make the next action obvious.

## Page Narrative

The homepage follows this order:

1. Floating glass capsule navigation
2. Taller dual-identity Hero
3. Dark introduction chapter
4. AI Products: Call Agent and ConvoAI
5. Communication Systems: Meeting and STT
6. Visual & Brand: full-width AIDX media stage
7. Product Foundation: Xuelang
8. Locked Visual Archive
9. Compact About entry
10. Purple liquid footer with email CTA

The sequence defines Yang Jing through current AI work before showing mature product foundations and archival visual breadth. Xuelang provides large-product credibility without defining the first impression.

## Brand System

### Color Tokens

- Carbon: `#0E100F`
- Graphite: `#191B19`
- Paper: `#F4F5F2`
- Smoky Iris: `#B5A3E6`
- Luminous Iris: `#C8B9FF`
- Deep Iris: `#5F4B86`
- Signal Green: `#C5FF63`

All cobalt blue accents are removed from the homepage. Smoky Iris is the primary brand color. Signal Green is restricted to AI runtime states, runnable demos, and one introduction emphasis. The footer is the only large-area purple liquid moment. AIDX receives a restrained local purple field so it does not compete with the footer. Xuelang retains its own light and green project identity.

### Typography and Shape

The Hero role labels `Product Designer` and `AI-native Builder` remain in English in both locales and use weight 800. Core media cards use a consistent 20px radius. Section containers are not wrapped in additional decorative cards. Low-contrast borders and existing Visual Archive radii remain unchanged.

## Navigation

The desktop navigation is one centered floating glass capsule:

`YJ | Work | Archive | About | language icon`

- `Work` scrolls to the core-project sequence.
- `Archive` scrolls to Visual Archive on the homepage.
- `About` opens the separate About page.
- Contact and Resume are removed from the top navigation.
- The language control is a globe icon at the far right, separated by a fine rule.
- Clicking the language icon switches immediately without a dropdown or visible language label.
- Locale switching preserves the current route and hash where an equivalent route exists.
- A localized tooltip and accessible label describe the destination language.
- On scroll, the capsule narrows slightly and gains opacity; it remains visible.
- Mobile retains `YJ`, menu, and language controls without changing the information hierarchy.

## Hero and Introduction

The Hero gains additional vertical height while preserving the approved dual-identity interaction. Its English role labels are not translated and use weight 800.

The introduction becomes a complete dark chapter using Carbon, Paper, Smoky Iris, and one Signal Green emphasis. The first Chinese statement begins:

> 嗨，我是杨静，一名拥有十多年经验的 UX/UI 设计师。

The supporting line appears with the first scene rather than becoming another scroll scene:

> 欢迎来到这个由我亲手设计，并通过 Vibe Coding 构建的作品集。

English:

> Welcome to a portfolio I designed and built through Vibe Coding.

The supporting line is 24px on desktop and 18–20px on mobile. `Vibe Coding` uses Smoky Iris. Signal Green appears once, on the phrase communicating a working or real experience. The introduction remains three-part and is not constrained to exactly two lines.

## Core Project Architecture

Projects are organized as four unequal chapters rather than a uniform card grid.

### AI Products

- Call Agent is the large flagship.
- ConvoAI is a more compact consumer-facing complement.
- Both belong to Agora / 声网.

### Communication Systems

- Meeting carries the larger area and demonstrates complex workflow and collaboration-system design.
- STT is a formal Agora / 声网 product with a runnable experience, not a personal experiment.
- STT opens its high-fidelity demo in a new tab.

### Visual & Brand

- AIDX Website receives a full-width visual crescendo.
- Company attribution is Singapore AIDX.
- The media stage uses restrained purple motion and a virtual browser containing an autoplay AIDX homepage showcase.

### Product Foundation

- Xuelang belongs to ByteDance / 字节跳动.
- It closes the core-project sequence quietly and provides mature large-product evidence.

### Company Marks

Every core project displays both company name and logo. Logos are monochrome and switch between black and white according to the card background. Original corporate brand colors are not introduced into the homepage palette.

## AIDX Showcase

The AIDX browser uses a controlled same-origin presentation copy rather than a directly controlled cross-origin iframe. The public AIDX site currently permits iframe rendering, but browser same-origin rules prevent reliable parent-controlled scrolling. Moving a tall external iframe would also make scroll-triggered effects unreliable.

The presentation copy preserves the homepage's visual content and principal motion while removing navigation, forms, and internal clicks. It is hosted under a local showcase route and embedded in the virtual browser.

Autoplay sequence:

1. Hold on the AIDX Hero for about two seconds.
2. Scroll smoothly through the page over approximately 20–24 seconds.
3. Slow briefly at meaningful product chapters.
4. Hold at the footer for about two seconds.
5. Cover the browser with a soft purple veil.
6. Reset to the top while covered, then fade back in.
7. Repeat.

Hover or keyboard focus pauses the sequence; leaving resumes it. Internal pointer interaction is disabled. Clicking the outer media card opens `https://aidxtech.com/` in a new tab. When the section is outside the viewport, playback pauses. Reduced-motion mode presents a stable representative frame.

## Visual Archive

Visual Archive is a locked version. Its project data, order, carousel controls, last-card highlight, internal title placement, hover scale, 20px radius, borders, descriptions, Skills, bilingual content, and mobile neighboring-card reveal must not change.

Only the rhythm around it may be adjusted: preceding whitespace, background continuity, divider treatment, and a lightweight entry reveal. There must be no abrupt blank space, overlap, clipping, or page-level horizontal overflow.

## Footer

The footer is a full-width purple liquid field and the page's final visual climax. Its motion is slow and ambient, with only a subtle response to pointer position. Typography and controls remain stable and readable above the field.

The primary action invites recruiting and project conversations. Its button uses a standard `mailto:` link to `yangux@qq.com`; no contact-form or email-delivery service is added. A secondary link opens About. The footer removes Resume and separate Contact navigation entries.

The liquid animation pauses offscreen, is reduced on mobile, and becomes static under `prefers-reduced-motion`.

## Motion Hierarchy

Motion effort is concentrated in three authored moments:

1. Hero dual-identity interaction
2. AIDX autoplay media stage
3. Footer liquid field

Other homepage sections use restrained short-distance reveals, existing image hover scaling, and the approved page-transition sweeps. Internal case-study links complete their light or dark sweep before navigation. AIDX and STT open new tabs and do not use the internal page sweep.

## Responsive and Accessibility Requirements

- Desktop paired projects use asymmetric layouts.
- Mobile pairs stack vertically and expose all essential information without hover.
- At 390px, the page has no horizontal overflow.
- Interactive targets provide visible keyboard focus and accessible names.
- The language icon has a localized tooltip and screen-reader label.
- Autoplay motion pauses when hidden and respects `prefers-reduced-motion`.
- Text and controls maintain WCAG AA contrast against animated backgrounds.
- Decorative motion does not intercept input or obscure the primary CTA.

## Validation

Implementation verification must cover:

- `/zh/` and `/en/` render and navigate correctly.
- Hero role labels remain English and use weight 800.
- The introduction copy and 24px support line are correct in both locales.
- No homepage cobalt blue remains.
- Every core project shows the correct monochrome company mark and company name.
- Project order and asymmetric chapter hierarchy match this specification.
- AIDX autoplay completes a full cycle, pauses on hover/focus and offscreen, and opens the live site in a new tab.
- STT is attributed to Agora / 声网 and opens its demo in a new tab.
- Visual Archive retains all locked behavior, including `04 / 04` final-card highlight.
- Navigation anchors, About route, and immediate language switching work with keyboard and pointer input.
- Footer email action targets `yangux@qq.com`.
- Desktop and 390px mobile layouts have no page-level horizontal overflow.
- Reduced-motion behavior is static and usable.

## Out of Scope

- Redesigning Visual Archive internals
- Creating or restoring Resume downloads
- Adding a contact form or email backend
- Redesigning case-study detail pages
- Allowing interaction inside the AIDX showcase browser
- Changing core project ownership, order, or chapter grouping
