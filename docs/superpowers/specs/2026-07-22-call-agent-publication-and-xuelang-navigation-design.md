# Call Agent Publication and Xuelang Navigation Design

## Goal

Make the canonical Call Agent route opened from the Homepage show the latest approved detail experience, and make Xuelang use the current shared portfolio detail navigation without project-specific navigation behavior.

## Root Cause

- All Homepage Call Agent entry points already resolve to `/{locale}/work/call-agent/`.
- The latest Call Agent video-story polish exists in commit `a021ed5` on `codex/call-agent-video-polish`, but is not present on the production `main` branch.
- Xuelang already renders the shared `SiteHeader` and `ChapterNav`, but its layout still opts into legacy project-specific chapter numbering and variant props.

## Approved Approach

Use the latest `main` as the integration base and cherry-pick `a021ed5`. Do not rewrite Homepage URLs and do not merge the outdated feature-branch history.

Apply one focused Xuelang navigation change:

- Keep the shared light-surface top navigation and capsule behavior.
- Remove `indexStart={0}` so chapter numbering follows the shared `01` convention.
- Remove `variant="xuelang"` so the left navigation has no project-specific mode.
- Preserve the shared inactive opacity, purple hover/focus color, active weight, responsive chapter menu, and line-free desktop treatment.

## Scope

In scope:

- Publish the complete Call Agent video-story polish from `a021ed5` on `main`.
- Align Xuelang's top and left navigation with the current shared detail framework.
- Update focused component, unit, and end-to-end assertions.
- Push `main` after verification so the existing deployment workflow can publish it.

Out of scope:

- Homepage layout or link changes.
- Xuelang body content, hero composition, evidence modules, or narrative changes.
- A new navigation component or a Xuelang-specific visual treatment.
- Call Agent changes beyond the already approved `a021ed5` commit.

## Verification

- Confirm every Homepage Call Agent entry still targets `/{locale}/work/call-agent/`.
- Confirm the Call Agent route renders the latest three-clip Hero sequence and complete Preview asset contract.
- Confirm Xuelang uses the shared light header surface and default chapter navigation props.
- Confirm Xuelang chapter numbering begins at `01` and no `xuelang` navigation variant remains.
- Run focused Call Agent, Homepage, Xuelang, SiteHeader, and portfolio detail-system tests.
- Run the relevant browser navigation and visual checks when the local Next runtime is available.
- Verify the final `main` worktree is clean and the pushed commit is the deployed branch head.

## Risks and Controls

- Cherry-pick conflicts: resolve only files touched by `a021ed5`, preserving newer `main` behavior outside the approved Call Agent scope.
- Large video asset: validate the checksum and full-source manifest after integration.
- Deployment mismatch: push the verified `main` head rather than changing the Homepage to a preview URL.
