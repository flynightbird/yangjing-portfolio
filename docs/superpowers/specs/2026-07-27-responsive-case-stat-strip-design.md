# Responsive Case Stat Strip Design

## Goal

Create one reusable rule for prominent case-study fact strips: a small label above a large value or conclusion, typically shown as three adjacent items. Values should stay on one line whenever that remains readable. Layout must change before typography becomes too small.

The first migration target is the Xuelang business-context strip:

- Platform scale / DAU 50w (about 500K)
- Business ambition / RMB 30B annual GMV
- Experience shift / Transaction to learning relationship

## Scope

The rule applies only to prominent fact strips with all of these characteristics:

- two-part label/value semantics;
- two or three peer facts;
- large display values or short strategic conclusions;
- a shared horizontal band or repeated rows.

It does not apply to project metadata in a hero, result cards, ordinary content cards, navigation, or long-form descriptions.

## Component Contract

Add a shared `CaseStatStrip` component under `components/case-study/`.

The component accepts:

- an accessible label for the definition list;
- an ordered list of `{ label, value }` items;
- an optional theme class or CSS custom-property overrides.

It renders semantic `dl`, `dt`, and `dd` elements. Content remains selectable live text. The component does not measure the DOM or resize text with JavaScript.

Each value receives a deterministic density tier derived from its visible character count:

- `short`: up to 10 visible characters;
- `medium`: 11 to 20 visible characters;
- `long`: more than 20 visible characters.

Whitespace at the beginning and end is ignored. Unicode characters are counted by code point so Chinese and English use the same deterministic rule.

## Responsive Rule

The component owns a named inline-size container. Its internal definition list responds to the component width rather than only to the viewport.

### Wide container

At `70rem` and above:

- render three equal columns;
- keep every value on one line;
- use vertical separators between items;
- use fluid density-based value sizes with a maximum of 40px;
- maintain one shared baseline and consistent item height.

Value size ranges:

- short: 28-40px;
- medium: 26-34px;
- long: 24-30px.

### Medium container

Below `70rem` and above `26rem`:

- switch to one fact per row;
- place the label in a stable left column and the value in a flexible right column;
- replace vertical separators with horizontal separators;
- keep values on one line;
- never reduce a value below 24px.

This layout change is preferred over shrinking large text until it loses hierarchy.

### Narrow container

At `26rem` and below:

- stack label above value inside each row;
- allow natural wrapping only when the available width cannot hold the value at 22px;
- use balanced wrapping where supported;
- do not truncate, clip, scroll horizontally, or use ellipses.

## Visual Behavior

The shared component controls structure, responsive behavior, typography, and separators. Product-specific case pages supply theme variables for:

- label color;
- value color;
- separator color;
- item padding;
- font families when a case has a branded type treatment.

Xuelang keeps its existing green label treatment, black values, hairline separators, and current spacing character. Only fit behavior and responsive structure change.

The rule does not use viewport-scaled typography beyond fixed min/max ranges, and letter spacing remains zero.

## Accessibility

- Preserve `dl`, `dt`, and `dd` semantics.
- Do not duplicate values for responsive layouts.
- Do not use CSS-generated text.
- Keep DOM order identical to visual and reading order.
- At 200% browser zoom, the strip may move to rows but must not overflow horizontally.

## Verification

Unit and component tests must verify:

- semantic rendering and accessible list label;
- deterministic short, medium, and long density tiers;
- Xuelang Chinese and English content is migrated without copy changes;
- no duplicate responsive markup is rendered.

Browser tests must verify both locales at representative component widths:

- wide: all three values are single-line and contained;
- medium: rows replace columns and values remain single-line;
- narrow: no horizontal page overflow and wrapping is allowed only at the narrow tier;
- 200% zoom: no clipping or horizontal overflow.

## Non-goals

- Automatically fitting arbitrary paragraphs onto one line.
- Applying the rule to every `dl` element on the site.
- Rewriting metric copy to make layout easier.
- Changing existing case-study color systems.
- Introducing canvas text, SVG text, or runtime font-measurement libraries.
