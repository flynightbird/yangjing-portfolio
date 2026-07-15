# Intro Story Design

## Intent

Create a quiet editorial bridge between the high-impact dual-identity Hero and the evidence-heavy project list. The section introduces Yang Jing's combined product-design and AI-building trajectory without competing with the Hero portrait or delaying access to the work.

## Experience

- The section occupies one pinned viewport on motion-capable desktop and tablet browsers.
- Four statements advance in order as the visitor scrolls forward. Each statement is exactly two lines and remains centered in the viewport.
- A four-position rail on the right reports progress and allows direct navigation to any statement.
- When the visitor scrolls upward from the projects, the section returns directly to statement one. Statements four through two do not replay in reverse. The following upward gesture exits toward the Hero.
- With reduced motion, pinning and transitions are removed and all four statements appear as a readable vertical stack.

## Visual Direction

The approved direction is Editorial Aperture: typography carries the composition, while a restrained frame, hairline rules, and the progress rail provide graphic structure. There are no cards, portrait assets, decorative gradients, or competing artwork.

Desktop type is capped at `60px` to prevent collision with the progress rail and viewport edges. Tablet uses `40px`. Mobile scales up to approximately `34px`, but narrow phones reduce further so every logical line remains one physical line beside the progress rail. Line height remains compact but not clipped, and both lines stay readable at every supported width.

## Content

English:

1. `I design where product scale` / `meets system complexity.`
2. `From consumer products` / `designed at scale.`
3. `To B2B and AI systems` / `where every state matters.`
4. `Now I turn design judgment` / `into working products with AI.`

Chinese:

1. `我在产品规模与` / `系统复杂度的交界处设计`
2. `从大规模 C 端产品` / `到持续使用的真实体验`
3. `再到 B2B 与 AI 系统` / `让每个状态都清晰可控`
4. `现在，我用设计判断与 AI` / `把想法做成可运行产品`

## Architecture

- `IntroStory` is the server component that selects localized copy and owns semantic section markup.
- `IntroStoryMotion` is the client component that owns GSAP/ScrollTrigger setup, scene state, anchor input, reverse-entry behavior, and reduced-motion cleanup.
- `home.module.css` owns the isolated Editorial Aperture presentation and responsive/reduced-motion fallbacks.
- The localized page inserts `IntroStory` only between `DualIdentityHero` and `FeaturedWork`; neither adjacent module is modified.

## Accessibility And Resilience

- Every rail control is a real button with a localized accessible label and current-state indication.
- Keyboard focus is visible, and direct scene navigation works independently of pointer input.
- Copy remains in the DOM rather than being drawn to canvas.
- The non-JavaScript base state shows the first statement; reduced-motion users receive all four statements without pinning.
- The section must not create horizontal overflow at `1440x900`, `768x1024`, or `390x844`.

## Verification

- Component tests verify localized four-scene content, two-line structure, four progress controls, and insertion order.
- Browser verification checks the `60px` desktop cap, forward sequence, reverse skip, direct navigation, reduced motion, overflow, and console errors at the three target viewports.
