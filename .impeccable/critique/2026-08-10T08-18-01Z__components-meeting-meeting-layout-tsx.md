---
target: Meeting detail page
total_score: 15
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 0
p1_count: 3
timestamp: 2026-08-10T08-18-01Z
slug: components-meeting-meeting-layout-tsx
---
# Meeting case study critique

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | Chapter state is clear; media progress is mostly invisible. |
| 2 | Match with the real world | 3 | Meeting states and device contexts are recognizable. |
| 3 | User control and freedom | 2 | Most videos autoplay and loop without local controls. |
| 4 | Consistency and standards | 3 | Strong repeated language, but repetition becomes sameness. |
| 5 | Error prevention | n/a | No consequential task flow. |
| 6 | Recognition rather than recall | 3 | Labels and chapter navigation support scanning. |
| 7 | Flexibility and efficiency | n/a | Portfolio reading surface. |
| 8 | Aesthetic and minimalist design | 1 | Equal-weight demos obscure the argument. |
| 9 | Error recovery | n/a | No task errors to recover from. |
| 10 | Help and documentation | n/a | Portfolio reading surface. |
| **Total** | | **15/24** | **Needs structural distillation** |

## Design Specificity Verdict

The visual world is clearly authored for a real meeting product, but the editorial structure becomes a reusable feature gallery. The case explains what exists more convincingly than why the decisions were hard or whether they succeeded. The current chain is: challenge clear, principle clear, evidence abundant but repetitive, outcome missing.

The deterministic scan returned zero findings for `meeting-layout.tsx`. Browser evidence found no horizontal overflow at desktop or mobile, no console errors, sound heading order, valid IDs, and correctly sized primary controls. The clean scan does not cover imported CSS; manual inspection found existing gradients and radii above the documented design-system ceiling.

## Overall Impression

The strongest idea is “meeting state -> information priority -> interface layout.” It is memorable and senior. The page should make that rule the spine of the case, then prove it through two or three consequential decisions. Instead, 17 autoplay videos and 19 figures flatten the hierarchy and turn the middle into a catalog.

## What Works

- The hero immediately establishes Agora Meeting, ownership, four-platform scope, and shipped reality.
- The context-priority model communicates systems thinking more effectively than the surrounding prose.
- Orientation and whiteboard comparisons visibly prove cross-platform adaptation.

## Priority Issues

### P1: Outcomes are absent
The chapter named capability impact contains more feature demonstrations, not impact. A hiring manager cannot tell whether the system improved consistency, delivery, QA coverage, platform expansion, or customer value. Replace it with honest outcome evidence, including qualitative evidence when metrics are unavailable.

### P1: Feature breadth dilutes the thesis
Adaptive stage, whiteboard, four language demos, four polish demos, and popup details receive similar weight. Keep two or three proof stories and move the rest into a compact capability appendix.

### P1: Difficulty is asserted rather than demonstrated
The three-row state matrix is too simple to communicate roles, permissions, client configuration, live state changes, device constraints, and API boundaries. Show one consequential decision with alternatives, constraints, edge cases, and cross-functional resolution. The existing but unused Breakout Room decision artifact is stronger evidence than another phone video.

### P2: The narrative does not accumulate
Repeated H2, introduction, showcase, and caption patterns make chapters feel independent. Rebuild the order as problem, governing principle, hard decision, cross-platform proof, and result.

### P2: The ending repeats rather than resolves
The reflection restates cross-platform rules but adds no tradeoff, failure, compromise, changed belief, or consequence. The ending should reveal what the work proved and what Yang Jing learned.

## Persona Red Flags

- Senior design hiring manager: sees polish and breadth in a short scan, but cannot identify the hardest decision, contribution boundary, or outcome.
- Product leader or founder: understands the configurable meeting product, but not which constraints mattered, what tradeoffs protected business value, or what changed after launch.
- Design peer: can inspect final screens but cannot evaluate rejected alternatives, edge-case reasoning, or collaboration rigor.

## Minor Observations

- Several claims are duplicated between MDX introductions and showcase introductions.
- English labels such as Chat, Live transcript, Adaptive stage, and Popup system weaken language consistency on the Chinese page.
- Captions describe visible behavior but rarely connect it to a constraint, decision, or result.
- Decorative media in the broad capability section weakens an already overloaded ending.

## Questions to Consider

- If only three artifacts could prove senior-level judgment, which three would remain?
- What was the most expensive or politically difficult decision, and what alternative was rejected?
- What evidence could credibly show that unified rules reduced delivery or maintenance cost?
- Should complete product capability become an appendix rather than the climax?
