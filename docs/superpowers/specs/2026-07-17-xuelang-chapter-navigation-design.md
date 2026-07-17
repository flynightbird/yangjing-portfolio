# Xuelang Chapter Navigation Correction

## Goal

Correct the Xuelang chapter navigation so every item displays one sequence number, while preserving the navigation behavior and visual treatment of other case studies.

## Scope

- Remove the embedded `00` through `07` prefixes from the Chinese and English Xuelang chapter labels.
- Let `ChapterNav` render the Xuelang sequence from `00` through `07`.
- Remove the active-item vertical marker for Xuelang only.
- Use Xuelang green (`#466b52`) for hover and keyboard-focus text states.
- Preserve the existing default numbering and styling for Call Agent, Meeting, and future case studies.

## Implementation

`ChapterNav` will accept an optional Xuelang-specific presentation configuration through explicit props. Defaults retain the existing shared behavior. `XuelangLayout` will opt into zero-based numbering and the marker-free green navigation treatment.

Chapter labels remain semantic content only, without visual numbering. The component owns number rendering, which prevents duplicated or mismatched sequences.

## Responsive And Accessible Behavior

The correction applies to desktop navigation and the compact chapter overlay. Hover and `:focus-visible` share the green accent. Current-section semantics continue to use `aria-current="location"`; only its decorative vertical marker is removed.

## Verification

- Component test: Xuelang starts at `00` and shows each number once.
- Component test: default case-study navigation still starts at `01`.
- Content test: Chinese and English Xuelang labels contain no numeric prefixes.
- Browser verification: no duplicate numbers, no active vertical marker, green hover/focus state, and no layout overflow.
