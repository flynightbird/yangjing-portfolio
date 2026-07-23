# ConvoAI Copy Cleanup Design

## Scope

Remove all `Designer-reported` attribution, evidence disclaimers, unverified-metric caveats, and related internal evidence-boundary language from the ConvoAI public case study and internal blueprint. Keep the current seven chapters, visual system, media order, motion, navigation, and interaction behavior unchanged.

## Public Copy

- Present the role as `独立负责产品设计` and the status as `已上线` without qualification.
- Remove the Hero disclosure row entirely instead of leaving an empty metadata field.
- Rewrite Chinese chapter leads around one continuous arc: real-time challenge, product foundation, conversation entry, user control, digital-human presence, processing chain, and delivered scope.
- Describe product decisions and visible behavior directly. Avoid portfolio-production language such as evidence, recordings as proof, reviewer orientation, and unsupported-claim disclaimers.
- Keep English content structurally aligned by removing the same attribution and caveat language; detailed prose optimization is limited to Chinese.

## Internal Blueprint

Convert the internal document from an evidence-audit artifact into a concise narrative blueprint. Preserve product positioning, chapter architecture, visual jobs, media mapping, CPDI notes, presentation outline, interview prompts, and evaluation priorities. Remove evidence labels, gaps about attribution, and instructions that exist only to police `Designer-reported` claims.

## Verification

- Source scans find no `Designer-reported`, `designer-reported`, `现有证据`, `不延伸为未经验证的业务指标`, or equivalent English caveats in ConvoAI public content, tests, or internal blueprint.
- Component tests prove the disclosure row is absent.
- Content tests prove the simplified role/status and revised Chinese narrative.
- Existing chapter IDs, media coverage, and responsive behavior remain unchanged.
