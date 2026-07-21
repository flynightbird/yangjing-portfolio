# Repository and Branch Architecture Design

Date: 2026-07-21
Repository: `flynightbird/yangjing-portfolio`
Working project: `yangjing-portfolio-nextjs`
Status: Approved design, pending implementation plan

## Objective

Turn the current collection of long-lived feature branches into one understandable portfolio repository. The final `main` branch must contain the complete deployable website. Homepage sections and case-study pages are routes in that website, not permanent Git branches.

The migration must preserve all committed work and all current uncommitted assets while separating unrelated in-progress changes into reviewable branches.

## Current State

- The integrated portfolio currently lives on `codex/portfolio-nextjs`.
- The repository remote is `git@github.com:flynightbird/yangjing-portfolio.git`.
- GitHub's remote HEAD currently points at `feature/call-agent-case-study`, while deployment listens to `main`.
- The existing `main` belongs to an older Call Agent-oriented history and has one commit not contained in the integrated branch.
- `codex/portfolio-nextjs` contains the latest committed Homepage integration but also has substantial uncommitted Call Agent, Xuelang, Meeting, shared tooling, asset, and test changes.
- Several historical branches are fully merged. Other branches still contain unique commits that require review.

No destructive reset or blanket cleanup is allowed during migration.

## Target Repository Model

`flynightbird/yangjing-portfolio` remains the only official repository. `main` becomes the only complete, deployable website branch and the GitHub default branch. The deployment workflow publishes only `main`.

The website represented by `main` contains:

```text
/[locale]/                         Homepage
/[locale]/work/call-agent/         Call Agent case study
/[locale]/work/convo-ai/           ConvoAI case study
/[locale]/work/meeting/            Meeting case study
/[locale]/work/xuelang/            Xuelang case study
```

The canonical ConvoAI slug is lowercase `convo-ai`; the visible product name remains `ConvoAI`.

Homepage destination behavior is fixed as follows:

| Homepage item | Destination behavior |
| --- | --- |
| Call Agent | Internal localized case-study route |
| ConvoAI | Internal localized case-study route |
| Meeting | Internal localized case-study route |
| Xuelang | Internal localized case-study route |
| AIDX | External live website in a new tab |
| STT Demo | Runnable demo in a new tab |
| Visual Archive items | Homepage Lightbox |

Visual Archive projects do not require permanent branches or detail routes.

## Branch Taxonomy

All future work starts from the latest `main` and uses a short-lived branch named by the area it changes:

```text
codex/home/<task>
codex/case/<project>-<task>
codex/demo/<project>-<task>
codex/shared/<task>
```

Examples:

```text
codex/home/navigation-polish
codex/case/convo-ai-build
codex/demo/stt-interaction
codex/shared/button-system
```

Branches are merged into `main` after verification and then deleted. Names such as `homepage`, `lightbox`, or `hero-redesign` describe past implementation stages and must not become permanent website branches.

## Uncommitted Work Isolation

The current dirty workspace must be preserved before branch migration. In-progress changes are divided by final ownership rather than by their current file location:

```text
codex/case/call-agent-refresh
codex/case/xuelang-refresh
codex/case/meeting-assets
codex/shared/integration
```

- Project-specific components, content, assets, and tests belong to that project's case branch.
- Cross-project publication scripts, shared components, dependency changes, and integration tests belong to `codex/shared/integration` when they cannot be assigned cleanly to one case.
- If one file contains changes for multiple destinations, its changes are split by hunk or reconstructed as focused commits. The whole file must not be assigned arbitrarily to one branch.
- Untracked assets are inventoried and copied into the branch that consumes them before verification.
- No dirty changes are bundled into the commit that promotes the verified integrated site to `main`.

## Migration Sequence

1. Record the current branch, HEAD, worktree list, status, untracked-file inventory, and remote configuration.
2. Create a recoverable protection point for all tracked and untracked work without destructive commands.
3. Extract current dirty work into the four short-lived branches defined above.
4. Verify and commit each extracted branch independently.
5. Promote the committed, verified `codex/portfolio-nextjs` baseline to the new `main`.
6. Audit unique commits on old `main`, `codex/hero-redesign`, and `codex/meeting-product-showcase`.
7. Reapply only still-useful unique work through correctly named short-lived branches, then merge it into `main`.
8. Merge the verified Call Agent, Xuelang, Meeting, and shared integration branches into `main` one at a time.
9. Push `main`, change the GitHub default branch to `main`, and confirm that deployment listens only to `main`.
10. Delete fully merged historical branches and their idle worktrees.
11. Delete remaining historical worktrees only after their unique work has been migrated or explicitly rejected and the resulting `main` has been verified.

Deleting a worktree is never used as a migration mechanism. Content is protected and verified first; cleanup happens last.

## Historical Branch Audit

The following branches are already fully merged and are cleanup candidates after `main` is established:

```text
codex/homepage-interaction-polish
codex/stt-footer-layered-reveal
codex/visual-archive-lightbox-stage
codex/xuelang-case-polish
```

The following histories contain unique commits and require explicit audit before deletion:

```text
main
codex/hero-redesign
codex/meeting-product-showcase
```

For each unique commit, record its source commit, affected feature, whether the integrated site already supersedes it, and the keep/reject decision. A commit is migrated only when it is demonstrably newer, still required, and compatible with the target architecture. Rejected commits remain recoverable from Git history until final remote cleanup is complete.

## Verification and Merge Rules

Every temporary branch must:

- Contain only the project or shared responsibility named by the branch.
- Keep both Chinese and English routes functional where applicable.
- Include every asset it references.
- Pass its relevant component and end-to-end tests.
- Pass ESLint and the Next.js production build before final integration.
- Avoid page-level horizontal overflow on desktop and at a 390 px mobile viewport.
- Record the source branch and original commit when historical work is transplanted.

Integration into `main` is sequential. After each merge, run focused tests for that area. Before pushing the final `main`, run the full available test suite, ESLint, and the framework build, then inspect the localized Homepage and internal case routes in a real browser.

## Failure Handling and Rollback

- Stop a migration step when a branch contains unexplained files, missing assets, or failing verification.
- Do not resolve ambiguity by deleting or resetting user work.
- Preserve a pre-migration reference until the final `main` is pushed and verified.
- If promotion or integration fails, restore from the recorded reference and correct the focused branch; do not continue stacking merges on a broken `main`.
- Do not delete a branch or worktree until Git proves its required commits are reachable from verified `main`, or an audit explicitly records why its unique commits are rejected.

## Completion Criteria

The migration is complete only when:

- `/zh/` and `/en/` work correctly.
- Call Agent, ConvoAI, Meeting, and Xuelang enter their corresponding internal case-study routes.
- AIDX and STT Demo open in new tabs.
- All four Visual Archive projects continue to use the Homepage Lightbox.
- Existing Homepage Hero, motion, navigation, media-card, and Footer interactions do not regress.
- GitHub's default branch is `main`, and the deployment workflow publishes only `main`.
- Local and remote development no longer treats old feature branches as alternate website versions.
- Fully merged old branches and idle worktrees are deleted.
- Every remaining unmerged branch has a clear responsibility, purpose, and target for integration.
- Old unique commits that cannot be shown to be newer or still valuable have a recorded rejection decision and are not migrated.

## Out of Scope

- Redesigning Homepage sections or case-study content.
- Changing Visual Archive Lightbox behavior.
- Adding new project routes beyond the approved destination map.
- Refactoring unrelated application code during repository migration.
