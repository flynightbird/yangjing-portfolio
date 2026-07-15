# Design System: Yang Jing Portfolio

## 1. Visual Theme And Atmosphere

Interface X-Ray is a precise editorial system for a designer who works across
large-scale consumer products, complex AI and B2B systems, and AI-assisted
building. The page should feel like a working design review wall: evidence is
large, hierarchy is explicit, and technical annotations explain status without
becoming decoration.

- Design variance: 8/10, offset and asymmetric but never chaotic.
- Motion intensity: 6/10, one orchestrated reveal per chapter with no persistent
  ambient loops.
- Visual density: 4/10, gallery-airy around evidence and compact around facts.
- Theme: cool light canvas for the whole page. Carbon sections are reserved for
  real technical artifacts, not random section inversion.
- Signature: the dual-identity hero uses two equally weighted role fields joined
  by one central portrait aperture. Until the portrait exists, the aperture is
  an explicit non-photographic draft frame.

## 2. Color Palette And Roles

- **Cool Paper** (`#F3F5F2`) is the primary reading canvas.
- **Carbon Ink** (`#10110F`) is primary text and the technical-stage surface.
- **Signal Green** (`#B7FF3C`) marks active controls, scan state, and the primary
  action. It is the single page-wide action accent.
- **Cobalt Link** (`#194BFF`) is reserved for text links, focus rings, and
  Builder-side cursor annotations.
- **Coral Exception** (`#FF654D`) is reserved for Meeting state exceptions and
  retrospective boundaries. It never becomes a general CTA color.
- Neutral borders derive from Carbon Ink at 24% and 50% opacity. Do not introduce
  warm gray, beige, purple, neon, or section-specific palettes.

## 3. Typography Rules

- **Display:** Archivo Black, 400. Use for Yang Jing, role propositions, and
  project theses. Keep hero role statements to two lines or fewer.
- **Body:** Libre Franklin, 400 to 600. Body copy is limited to 72 characters per
  line and uses relaxed leading.
- **Technical:** DM Mono, 400 to 500. Use for real state, evidence, role, and
  destination metadata, never decorative section numbering.
- **Simplified Chinese:** Noto Sans SC, 400 to 600, for all Chinese display and
  body content.
- Letter spacing is always `0`. Font sizes use explicit breakpoint steps and
  `clamp()` only with rem-based bounds, never viewport-width font sizing.
- Do not use Inter, generic serif faces, gradient text, or mixed-family emphasis.

## 4. Component Styling

- **Commands:** Maximum 6px radius, 44px minimum target, one-line label, strong
  visible focus. Primary commands use Signal Green with Carbon Ink. External
  commands include a familiar external-link icon and name the destination.
- **Project bands:** Full-width editorial bands with border and negative-space
  hierarchy. They are not floating cards and never contain nested cards.
- **Media apertures:** Stable aspect ratios, 0 to 2px radius, one-pixel borders.
  Real media keeps intrinsic dimensions and meaningful alt text. Missing media
  is represented by an honest grid aperture with localized Draft text.
- **Archive:** A 12-column editorial image wall. Eight slots fill four desktop
  rows as `7+5`, `4+8`, `8+4`, `5+7`. Mobile is one image per row with permanent
  title, category, and role text.
- **Draft states:** Always include the word Draft or its Chinese equivalent and
  a machine-readable `data-publication-state="draft"` marker. Color alone is
  insufficient.

## 5. Layout Principles

- Content is constrained to 90rem with a 12-column desktop grid and a four-column
  mobile grid.
- The hero uses an asymmetric three-zone composition: Product Designer, central
  portrait aperture, AI-native Builder. Both identities have equal visual area.
- The first viewport shows both identities and the top edge of ByteDance at
  1440x900 and 390x844.
- Homepage order is fixed: Hero, ByteDance, Call Agent, Meeting, AIDX, STT Demo,
  Visual Archive, About/opportunity.
- Each project family gets a distinct composition. Do not repeat alternating
  left-image/right-text bands for three consecutive sections.
- Full-height surfaces use `min-height: 100dvh`. Horizontal overflow is a release
  blocker.

## 6. Motion And Interaction

- Use the installed Motion library only in isolated client leaves.
- Hero motion communicates the relationship between the two roles: role fields
  resolve first, then the central scan frame activates once.
- Project media reveal motion communicates evidence depth, using opacity and
  transform only. Hover scaling stays below 1.02 so screenshots remain readable.
- Meeting may sequence three named interaction states, but must not draw a fake
  interface while source media is absent.
- Lightbox retains Escape close, focus trap, focus return, and body scroll
  restoration.
- `prefers-reduced-motion` renders all content in its final static state. No
  pointer-follow behavior or infinite loops are allowed.

## 7. Content And Evidence Rules

- Never fabricate portraits, screenshots, project names, client names, roles,
  years, URLs, metrics, testimonials, contacts, or outcome claims.
- ByteDance and Meeting remain explicit local draft routes until approved media
  and public-safe content exist.
- AIDX is an external live launch only. Its verified role is UI/UX Design,
  Information Architecture, and Motion.
- STT Demo is the only Build Lab entry. Never reserve or imply a second entry.
- Archive draft slots contain a stable key and layout index only. They contain no
  invented project metadata and cannot pass publication validation.
- English and Simplified Chinese must carry equivalent claims and evidence
  boundaries.

## 8. Anti-Patterns

- No fake product UI, stock product screenshots, generated people, or fake data.
- No purple gradients, gradient orbs, bokeh, glassmorphism, neon glow, or pure
  black.
- No centered generic hero, hero statistics, skill pills, scroll cue, or
  decorative status dots.
- No three equal feature cards, nested cards, excessive rounding, or repeated
  split-section layouts.
- No custom cursor, scroll hijacking, persistent marquee, or motion without a
  hierarchy, storytelling, feedback, or state purpose.
- No decorative section numbering. Project order may be encoded only where it is
  part of the approved canonical sequence.
- No contact form and no fake contact values.
- No em dash or en dash in visible interface copy.
