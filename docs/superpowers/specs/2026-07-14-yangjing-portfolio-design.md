# Yang Jing Portfolio Design Specification

Date: 2026-07-14
Status: Approved design, awaiting implementation plan
Primary repository: `https://github.com/flynightbird/yangjing-portfolio`
Languages: English default, complete Simplified Chinese equivalent
Initial hosting: Cloudflare Pages free `*.pages.dev` address

## 1. Product Summary

Build a bilingual online portfolio for Yang Jing that serves two goals with equal weight:

1. Win senior product design opportunities.
2. Win selected freelance engagements that combine product design and AI-assisted prototyping.

The portfolio presents one coherent professional identity rather than two unrelated careers:

> **Yang Jing — Product Designer × AI-native Builder**

Supporting proposition:

> Turning complex technology into clear, scalable experiences that can be designed, tested, and built.

The work demonstrates four complementary capabilities:

- Large-scale consumer product design through ByteDance experience.
- AI and complex B2B system design through Call Agent.
- High-complexity interaction design through Meeting.
- Hands-on AI-assisted building through two live Build Lab projects.

The site is the actual portfolio experience. It must not open with a marketing landing page or a generic introduction to the site's features.

## 2. Audience And Success Criteria

### Primary audiences

- Design managers and cross-functional interviewers hiring senior product designers.
- Product leaders and founders seeking end-to-end product design plus AI prototyping.
- Design peers evaluating interaction craft, systems thinking, and delivery quality.

### Visitor questions the site must answer

Within the first viewport:

- Who is Yang Jing?
- What kind of products does she design?
- What is distinctive about her ability to build with AI?

Within 60–90 seconds:

- Has she worked at consumer scale?
- Can she handle AI/B2B system complexity?
- Can she model difficult real-time interactions?
- Are the Build Lab projects real and usable?

Before leaving:

- Can I inspect the relevant case in depth?
- Can I download the appropriate resume?
- Can I contact her directly for a job or freelance project?

### Product-level success signals

Use privacy-friendly Cloudflare Web Analytics to observe:

- Case entry views.
- ByteDance PDF opens and downloads.
- Chinese and English resume downloads.
- Email, LinkedIn, and WeChat contact interactions where technically measurable.
- Language selection.

Analytics must not block navigation or collect unnecessary personal information.

## 3. Brand Positioning

### Core identity

The portfolio uses a dual capability model inspired by the immediate legibility of Adham Dannaway's split-role hero, while using an original visual and interaction system.

- Left identity: **Product Designer**.
- Right identity: **AI-native Builder**.
- Connecting idea: think in systems, make ideas real.

`Vibe Coding` may appear in supporting copy and Build Lab descriptions. The primary professional label remains `AI-native Builder`, which is more durable and credible for recruiters and clients.

### Career narrative

The About story follows the user's real career progression:

> From large-scale consumer product design, into complex B2B and AI systems, then into AI-assisted product building.

The site must not position Yang Jing as an AI/B2B-only designer. Consumer scale, complex systems, interaction depth, and building are equal parts of the larger capability story.

### Freelance proposition

> Product design + AI prototyping, from complex idea to working experience.

The site must not show fabricated packages, prices, client logos, testimonials, or outcome metrics.

## 4. Information Architecture

### Locale structure

- `/en` is the default user-facing locale.
- `/zh` is the complete Simplified Chinese locale.
- The statically exported root page resolves a persisted language preference in the browser and navigates to the matching locale; without a preference it navigates to `/en`. It must include a normal `/en` link so navigation still works when JavaScript is unavailable.
- Language switching preserves the equivalent current page when a translation exists.

### Primary routes

```text
/en
/zh
/[locale]/about
/[locale]/work/bytedance
/[locale]/work/call-agent
/[locale]/work/meeting
/[locale]/build/[slug]
```

There are exactly two Build Lab detail entries at launch. Their public titles and slugs come from the user's two existing AI-built projects during content ingestion; the content model does not invent project identities.

### Global navigation

- Work
- About
- Resume
- Contact
- Language switch

Navigation stays compact and predictable. It may become sticky after the Hero, but must not cover headings or media.

### Homepage order

1. Global navigation.
2. Interface X-Ray dual-identity Hero.
3. ByteDance flagship entry.
4. Call Agent flagship entry.
5. Meeting Interaction Deep Dive entry.
6. Build Lab with two live projects.
7. Short About preview.
8. Product design + AI prototyping collaboration statement.
9. Direct contact region.
10. Resume and legal footer.

This hierarchy supersedes the earlier equal-card and long-project-feed approaches.

## 5. Homepage Experience

### Hero

The Hero is a full-width split composition:

- Cool-white left field for Product Designer.
- Carbon-black right field for AI-native Builder.
- A real portrait of Yang Jing bridges both fields.
- A `YJ / System Scan` frame, orbit path, and editing cursor form a secondary digital identity around the portrait.
- Supporting copy names consumer scale, AI/B2B systems, Vibe Coding, prototyping, and shipping without becoming a skills list.
- The bottom of the first viewport reveals the beginning of the ByteDance project entry on desktop and mobile.

The portrait remains the primary visual anchor. The `YJ` device acts as behavior around the person rather than obscuring the face.

### Initial motion sequence

1. Navigation becomes visible.
2. The two role labels enter from their own visual fields.
3. The portrait resolves at center.
4. The scan frame and cursor activate.
5. The next-section signal appears.

Pointer movement creates a restrained offset in the scan layer only. It must not move the portrait aggressively or reduce text legibility.

### Featured work behavior

ByteDance and Call Agent use large editorial sections rather than repeated cards. Meeting uses a shorter but more animated interaction section. Build Lab uses two compact interactive entries with direct demo access.

Each homepage project entry communicates:

- Project type.
- Outcome-oriented proposition.
- Yang Jing's role.
- One real product visual or interaction preview.
- Evidence or project status.
- A clear detail action.

## 6. Visual System

### Atmosphere

`Interface X-Ray` is precise, editorial, technical, and human. It avoids generic futuristic decoration and makes interface evidence the visual material.

### Core palette

- Cool white — `#F3F5F2`: reading surfaces and the Product Designer field.
- Carbon black — `#10110F`: Builder field and high-focus visual stages.
- Signal green — `#B7FF3C`: system status, scans, progress, and active state.
- Cobalt blue — `#194BFF`: links, Builder cursor, and digital annotations.
- Coral signal — `#FF654D`: limited Meeting and exception emphasis.
- Neutral text and borders are derived from the cool-white/carbon relationship, not from a blue-only palette.

Do not use purple gradients, decorative gradient orbs, glassmorphism, beige-dominant surfaces, generic AI illustrations, or bokeh decoration.

### Typography

- English display: Archivo Black.
- English body: Libre Franklin.
- Technical labels: DM Mono.
- Simplified Chinese: Noto Sans SC.

Letter spacing remains `0`. Type sizes use explicit responsive steps rather than viewport-width font scaling. Hero-scale type is reserved for the Hero and major project propositions.

### Geometry And depth

- 12-column responsive desktop grid.
- Maximum primary content width around `1440px`.
- Sharp divisions and fine borders.
- Corner radius no greater than `6px` unless a real product screenshot contains its own geometry.
- Mostly flat layers; use shadows only for functional elevation, such as the sticky navigation or an active draggable comparison.
- No cards nested inside cards.
- Page sections remain full-width bands or unframed constrained layouts.

### Media treatment

- Use real product screenshots, portrait photography, Figma interaction captures, and live Build Lab previews.
- Preserve screenshot aspect ratios and critical UI areas.
- Use annotations, local zooms, and cropped evidence blocks instead of unreadably shrinking full screens.
- Do not visually edit source evidence to imply features or outcomes that did not exist.

## 7. Motion And Interaction

Motion is selectively intense:

- Hero: identity reveal, scan activation, and restrained pointer response.
- Meeting: scroll-linked state demonstration for selected interaction sequences.
- Case reading: stable layouts with small evidence reveals.
- Project navigation and language switching: short, consistent transitions.

Use Motion for React for high-value sequences and CSS transitions for simple states. Do not introduce 3D, scroll hijacking, or a heavy animation framework.

`prefers-reduced-motion` replaces scroll and pointer motion with static end states and short opacity transitions. Mobile removes pointer-follow behavior entirely.

All click interactions have keyboard equivalents, visible focus states, and non-hover access to essential information.

## 8. Case Study System

### Shared native case structure

1. Outcome-oriented proposition.
2. Role, duration, team, status, and disclosure boundary.
3. Primary real product visual.
4. Problem and constraints.
5. Major design decisions.
6. Evidence and actual outcome.
7. Limitations and reflection.
8. Previous and next project navigation.

Desktop uses a narrow sticky chapter index. Mobile uses a compact chapter menu and never reserves a persistent 300px-style sidebar.

### ByteDance

The first release uses `/[locale]/work/bytedance` as a stable native wrapper around the user's existing sanitized PDF:

- Public project summary.
- Role and disclosure statement.
- One sanitized project visual.
- View PDF and download PDF actions.
- Desktop may show an in-page PDF viewer when supported.
- Mobile opens the PDF directly in the browser.

The second phase replaces the wrapper content with a native bilingual MDX case without changing the route. The PDF remains available as an archive download.

The ByteDance PDF is not present in either inspected GitHub repository and must be supplied locally before the first public build.

### Call Agent

Call Agent is the deepest native case. Its approved narrative is sourced from `yangjing0006/2026-portfolio` and retains these chapters:

1. Project overview.
2. Context and role.
3. Design thesis.
4. Product boundary and task path.
5. Make AI visible, testable, and controllable before release.
6. From AI demo to call operations.
7. Design system and AI-assisted engineering delivery.
8. Staged outcomes and reflection.

The page distinguishes `Delivered`, `Observed`, and `Next`. Limited customer beta is not presented as scaled business growth. Sensitive tokens, phone numbers, account data, internal identities, and customer information are destructively redacted from public assets.

### Meeting Interaction Deep Dive

Meeting is publicly displayable and supported by a complete Figma source. It has shipped, but lacks reliable outcome metrics and its shipped UI is not presented as a visual showcase.

Core proposition:

> **Designing clarity and control for highly dynamic real-time collaboration.**

Detail structure:

1. Why real-time collaboration becomes difficult to understand and control.
2. Visibility and control principles.
3. Roles, permissions, and state model.
4. Critical before/during/after meeting tasks.
5. Real shipped interface and interaction playback.
6. `2026 Retrospective` visual and interaction refinement.
7. Transferable lessons.

`What shipped` and `2026 Retrospective` are visually and verbally separated. The site never implies that retrospective work shipped or produced measured results.

### Build Lab

Each of the two Build Lab projects includes:

- Problem and target user.
- Live interactive demo.
- What Yang Jing designed and built.
- AI/Vibe Coding workflow.
- Product and technical trade-offs.
- Current limitations and next step.
- Public demo and source links when disclosure permits.

Build Lab pages are deliberately shorter than flagship cases. They prove that the products work rather than inflating experiments into commercial case studies.

## 9. About, Resume, And Contact

### About page

1. Portrait and personal proposition.
2. Career progression from consumer scale to AI/B2B to building.
3. Product judgment, complex interaction, and design-to-build capabilities.
4. Concise experience timeline.
5. Design and collaboration principles.
6. Resume downloads.
7. Opportunity status and contact details.

The homepage About preview is 60–90 Chinese characters or an equivalent concise English paragraph.

### Resume

- Separate Chinese and English PDFs.
- Available from global navigation and About.
- File names use the person's name and language, without confusing version strings.
- The page displays the latest revision date.

### Contact

There is no contact form and no server-side email service.

- Public email with display, copy, and `mailto:` actions.
- LinkedIn link.
- WeChat ID and QR code on Chinese content.
- No public phone number.
- Separate `Job opportunity` and `Freelance project` actions use different prefilled email subjects while resolving to the same public email address.

The contact region appears at the end of About and in the global footer.

## 10. Content And Localization Model

Case and Build Lab content lives in MDX or an equivalent typed local-content format. Components and content are separate so case copy can be updated without editing layout code.

Required frontmatter concepts:

```text
slug
locale
title
proposition
type
role
duration
status
disclosure
heroMedia
evidenceLevel
featuredOrder
translationKey
nextSlug
previousSlug
```

English and Chinese entries share a `translationKey`. Missing route pairs, required metadata, assets, alt text, or disclosure labels fail the production build.

The language switch preserves route identity. If a translated route is intentionally unavailable, the UI links to the equivalent locale homepage with a visible explanation; the launch content is expected to be complete in both languages.

## 11. Technical Architecture

### Stack

- Next.js App Router.
- TypeScript.
- MDX local content.
- Motion for React.
- CSS custom properties and scoped component styles.
- Static export using `output: "export"`.
- Cloudflare Pages.
- Cloudflare Web Analytics.

### Data flow

```text
Typed MDX + metadata
  -> build-time validation
  -> static locale routes
  -> responsive case components
  -> Next.js static export
  -> Cloudflare Pages `out/`
```

No database, CMS, form endpoint, or always-running server is required.

### Media pipeline

- Generate responsive raster sizes and WebP/AVIF variants before deployment.
- Use preprocessed images with stable dimensions to prevent layout shift.
- Static export must not depend on a paid runtime image optimizer.
- Videos use poster images, captions when speech is present, and lazy loading.
- Large autoplay video is prohibited on mobile.

### Build-time failure handling

The build fails for:

- Missing locale pairs.
- Missing required frontmatter.
- Missing images, PDFs, resumes, or video posters.
- Missing alt text or required captions.
- Duplicate slugs or translation keys.
- Known sensitive token, phone, IP, account, or internal ID patterns in public content.
- Broken internal links.

The public app includes a localized static 404 page. Analytics failure never prevents content access. External links visually communicate that they leave the site.

## 12. Responsive And Accessibility Requirements

### Responsive behavior

- Desktop: 12-column layout, split Hero, sticky compact chapter navigation, wide evidence comparisons.
- Tablet: preserve hierarchy, reduce simultaneous columns, keep portrait and role labels readable.
- Mobile: stack the Hero, retain both identities in the first viewport, remove pointer interactions, stack all comparisons, and keep evidence labels next to media.
- Fixed-format screenshots use `aspect-ratio` and never resize the surrounding layout when captions or controls change.
- No viewport has incoherent text, navigation, portrait, or project-media overlap.

### Accessibility

- WCAG 2.2 AA contrast targets.
- Semantic landmarks and ordered heading structure.
- Skip link and visible keyboard focus.
- Descriptive alt text for meaningful images.
- Empty alt attributes for decorative visuals.
- Captions or transcripts for meaningful video/audio.
- Reduced-motion support.
- Touch targets sized for mobile use.
- No essential content hidden behind hover, drag, or motion.

## 13. Performance Budgets

- Target LCP below 2.5 seconds on a representative mobile connection.
- Target CLS below 0.1.
- Self-host the approved font files or subsets so Chinese and English typography does not depend on an external font CDN. Load only the fonts and weights used by the current locale.
- Lazy-load below-the-fold case media.
- Keep Hero portrait and first project preview optimized and preloaded only when they are true LCP candidates.
- Avoid 3D, canvas effects, and persistent animation loops.
- Motion and analytics code must be non-blocking.

## 14. Verification Strategy

### Unit and content validation

- Frontmatter and locale-pair validation.
- Route and project-order generation.
- Sensitive-content scanner.
- Asset, resume, and PDF existence checks.
- Evidence-level vocabulary checks.

### Browser verification

Use Playwright to verify:

- English and Chinese homepage routes.
- Desktop, tablet, and mobile layouts.
- Hero content and next-section visibility.
- Keyboard navigation and focus order.
- Language preservation across equivalent routes.
- ByteDance PDF view/download behavior.
- Native Call Agent, Meeting, and Build Lab routes.
- Resume downloads.
- Contact links and prefilled mail subjects.
- Reduced-motion output.
- No horizontal page overflow or overlapping interface text.
- Static 404 behavior.

### Visual verification

- Screenshot key routes at desktop and mobile widths.
- Inspect Hero framing and portrait crop manually.
- Inspect the Meeting scroll sequence at start, middle, and end states.
- Render and visually review Call Agent print output and both resume PDFs page by page.
- Inspect source screenshots at original resolution before public export.

## 15. Deployment

- Repository: `flynightbird/yangjing-portfolio`.
- The repository is empty at design approval time and has no legacy code constraints.
- The production branch is `main` after repository initialization.
- Cloudflare Pages build command: `npm run build`.
- Static output directory: `out`.
- First release uses a free `*.pages.dev` address.
- A custom domain can be attached later without changing routes or application code.
- No Vercel plan, database, form service, or paid server is required.

## 16. Delivery Phases

### Phase 1: Portfolio launch

- Bilingual global shell and Interface X-Ray Hero.
- Homepage project hierarchy.
- ByteDance sanitized PDF wrapper.
- Native Call Agent case.
- Native Meeting Interaction Deep Dive.
- Two Build Lab detail pages.
- About, bilingual resumes, direct contact, analytics, tests, and Cloudflare deployment.

### Phase 2: ByteDance native migration

- Convert the sanitized PDF into a responsive bilingual MDX case.
- Preserve `/[locale]/work/bytedance`.
- Keep the PDF as an archive download.
- Re-run privacy, content, responsive, and visual verification.

## 17. Content Preconditions

Before Phase 1 can be considered publication-ready, the repository must receive:

- A newly photographed or selected high-resolution portrait suitable for the split Hero.
- The sanitized ByteDance PDF and one public-safe preview image.
- Chinese and English resume PDFs.
- Public email, LinkedIn URL, and WeChat ID/QR asset.
- Complete Meeting Figma source or exported interaction evidence.
- Titles, descriptions, demo URLs, and disclosure boundaries for the two Build Lab projects.
- Call Agent source evidence listed in the approved Call Agent specification.

Missing content may be represented in local development data, but no unfinished placeholder is permitted in a public build.

## 18. Acceptance Criteria

The design is implemented successfully when:

1. The first viewport clearly communicates Product Designer × AI-native Builder and reveals the next section.
2. ByteDance, Call Agent, Meeting, and two Build Lab projects have stable detail routes or approved first-phase PDF behavior.
3. Recruiting and freelance paths are equally visible without creating two separate personal brands.
4. English and Chinese routes are complete and remain aligned.
5. Call Agent preserves evidence boundaries and does not overstate limited beta.
6. Meeting clearly separates shipped work from the 2026 retrospective.
7. The site uses direct contact details without a form or phone number.
8. The site remains usable with keyboard navigation and reduced motion.
9. Key desktop and mobile screenshots show no overlap, cropping, blank media, or horizontal overflow.
10. Static export deploys successfully to Cloudflare Pages without paid runtime services.
11. All public assets pass privacy and sensitive-content review.
12. The implementation follows the approved Interface X-Ray visual system rather than a generic portfolio template.

## 19. Reference Boundaries

- `https://www.adhamdannaway.com/` informs the immediate dual-role Hero concept only. The final portrait treatment, typography, scan system, and layout are original.
- `https://www.jonnyczar.com/` informs the strong case proposition, evidence strip, and project-index behavior. The final site does not copy its 300px sidebar, excessive page length, or mobile evidence removal.
- `https://github.com/yangjing0006/2026-portfolio` is a content reference for the approved Call Agent specification, not the production repository.
- `https://github.com/flynightbird/yangjing-portfolio` is the single production and future design repository.
