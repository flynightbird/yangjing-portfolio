# Hero Designer Art Comparison Design

## Purpose

Create three isolated Hero comparison prototypes for the Product Designer
field. The comparison determines the left-side artistic language before any
direction is merged into the production portfolio.

The portfolio prioritizes visual impact and visual-expression ability. The
comparison must still preserve immediate title recognition and direct-manipulation
clarity.

## Fixed Variables

The following remain identical across all three links:

- dark-first full-viewport Hero composition;
- `Product Designer` and `AI-native Builder` as equal two-line role titles;
- Satoshi at weight 900 for both role titles, with zero letter spacing;
- the approved manual draggable divider, keyboard input, touch input, magnetic
  settling, and five-second return after leaving the Hero;
- the approved Builder-side diagonal volumetric sweep;
- one Builder scan after each divider drag release and each new entry into the
  Builder field;
- reduced-motion behavior that renders the stable final state without timed
  return or ambient motion;
- identical navigation, labels, colors, title positions, and viewport framing.

No person, portrait, face, body, or human silhouette appears in any of the
three comparison variants. The comparison removes the central portrait from
both fields so the role titles and abstract systems become the primary visual
anchors.

## Shared Designer-Side Rules

- Designer art is an atmospheric layer behind the role title, never a content
  layer in front of it.
- A protected title zone surrounds the complete `Product Designer` bounding
  box. No high-contrast stroke, filled form, or animated edge may cross it.
- The field uses a restrained palette derived from signal lime, cool white,
  muted coral, and deep olive-black. No purple, neon glow, or multicolor mesh.
- Motion is weighty and continuous. Elements may settle, reveal, or align, but
  they never jitter, bounce, or drift independently.
- UI references are abstract design material, not fake dashboards or literal
  product screenshots.
- Each variant uses the same activation timing so artistic language is the
  only meaningful comparison variable.

## Variant C1: Interface Gallery

Selection frames, alignment rails, component slices, resize handles, and
cropped layout planes are composed like objects in a contemporary gallery.
The composition is sparse, rectilinear, and recognizably rooted in interface
design without depicting a literal application.

On Designer activation, the planes resolve from slightly misregistered layers
into a stable editorial arrangement. Control points appear in one coordinated
sequence. This is the recommended direction because it balances professional
identity, artistic confidence, and title clarity.

## Variant C2: Typographic System

Oversized outline glyphs, baseline rails, cropped words, and measured spacing
marks form a kinetic typographic specimen. The display forms are low contrast
and remain outside the protected title zone.

On activation, baseline fragments align into a coherent system while a single
large outline form completes its crop. The effect is graphic and art-led, with
less explicit UI symbolism than C1.

## Variant C3: Material Blueprint

Matte translucent planes, Bezier paths, anchor nodes, and thin blueprint lines
create a spatial design field. Surfaces overlap through opacity and restrained
color registration, without glassmorphism, glow, or decorative blobs.

On activation, one continuous path draws through the composition and the
material planes settle into depth. This is the most experimental option and
therefore receives the strictest contrast protection around the title.

## Typography

Both role titles use Satoshi 900 where the web font loads, followed by a heavy
grotesk fallback stack. The visual target is a wide, dense grotesk comparable
to the supplied oversized `designer` reference, not the current Arial 500.

Each title remains exactly two lines on desktop and mobile. Font size may
change by explicit breakpoint, but never through viewport-width font scaling.
The two titles retain equal size and weight.

## Prototype URLs

The comparison remains in the existing motion study and uses the approved
Builder variant:

- `motion-directions-v1.html?variant=b&designer=c1`
- `motion-directions-v1.html?variant=b&designer=c2`
- `motion-directions-v1.html?variant=b&designer=c3`

These routes are comparison artifacts only. The main preview and production
Next.js Hero remain unchanged until one variant is explicitly selected.

## Responsive Behavior

Desktop is verified at 1440 by 900. Mobile is verified at 390 by 844.
All art remains clipped to the Hero, produces no horizontal overflow, and
leaves both complete role titles readable at every divider position.

On mobile, each composition simplifies to no more than three dominant forms.
Fine measurement marks may be removed rather than scaled into visual noise.

## Acceptance Criteria

- All three links load without console errors or missing local assets.
- No person imagery appears in either Hero field.
- Both role titles render at an effective weight of 900, remain two lines, and
  have zero letter spacing.
- No artistic element intersects either title's protected reading zone.
- Divider drag, click, keyboard, touch, magnetic settling, and five-second
  return remain functional.
- Every drag release triggers exactly one complete Builder scan.
- Reduced-motion mode shows a stable, legible final composition.
- Screenshots at 1440 by 900 and 390 by 844 show no clipping, overlap, or
  horizontal overflow.

## Out Of Scope

- selecting or merging a winning direction;
- changing homepage sections below the Hero;
- changing case-study structure or content;
- updating production portrait assets;
- revising the approved Builder-side motion language.
