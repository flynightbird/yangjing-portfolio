# Repository Migration Ledger

Date: 2026-07-21
Remote: `git@github.com:flynightbird/yangjing-portfolio.git`
Approved design: `docs/superpowers/specs/2026-07-21-repository-and-branch-architecture-design.md`
Implementation plan: `docs/superpowers/plans/2026-07-21-repository-and-branch-architecture-implementation.md`

## Pre-Migration References

| Reference | Commit | State |
| --- | --- | --- |
| `codex/portfolio-nextjs` | `a82387fe3129cf9ddba5143318118861c969d805` | Integrated baseline plus 67 dirty status entries in its source worktree |
| `codex/shared/repository-migration` | `a82387fe3129cf9ddba5143318118861c969d805` | Clean isolated migration-control branch |
| `main` | `005bba3b3f70c6738c76fd871aa909648f4b8254` | Old main; unique-commit audit required |
| `codex/hero-redesign` | `1143aa1e646bdb82e55d574284a11306db518aea` | Three unique commits; audit required |
| `codex/meeting-product-showcase` | `4ed411122c8403c1d21febcde46d0582be0e757e` | Sixteen unique commits; audit required |

## Worktrees at Start

```text
worktree /Users/admin/Documents/作品集-yangjing/yangjing-portfolio
HEAD 005bba3b3f70c6738c76fd871aa909648f4b8254
branch refs/heads/main

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/hero-redesign
HEAD 1143aa1e646bdb82e55d574284a11306db518aea
branch refs/heads/codex/hero-redesign

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/homepage-interaction-polish
HEAD ae707fc259bfc24a0c6a8b09a4b3d944bff35fbf
branch refs/heads/codex/homepage-interaction-polish

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/meeting-product-showcase
HEAD 4ed411122c8403c1d21febcde46d0582be0e757e
branch refs/heads/codex/meeting-product-showcase

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/merged-preview
HEAD 642ab67a094272d1bb621e4dc2bf4f818c5eba46
detached

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/stt-footer-layered-reveal
HEAD 7021c07f3c1ad5f6327b9cbfad7d7ac078d4c97e
branch refs/heads/codex/stt-footer-layered-reveal

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/visual-archive-lightbox-stage
HEAD 90056c1fd496e3167ad06742334b28938f54f651
branch refs/heads/codex/visual-archive-lightbox-stage

worktree /Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/xuelang-nav-fix
HEAD fca115f8786c1934c51c016f79f27117c4ef72fd
branch refs/heads/codex/xuelang-case-polish

worktree /Users/admin/Documents/作品集-yangjing/worktrees/repository-migration
HEAD a82387fe3129cf9ddba5143318118861c969d805
branch refs/heads/codex/shared/repository-migration

worktree /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
HEAD a82387fe3129cf9ddba5143318118861c969d805
branch refs/heads/codex/portfolio-nextjs
```

## GitHub Authority

`gh auth status` reports no authenticated GitHub host. Local migration may proceed. Remote default-branch changes, remote cleanup, and replacement of remote `main` are blocked until authentication identifies the `flynightbird` account.

## Accepted Pre-Migration Test Baseline

Command: `npm test` in the clean `codex/shared/repository-migration` worktree.

- Test files: 45 passed, 2 failed, 47 total.
- Tests: 387 passed, 5 failed, 392 total.
- Duration: 152.56 seconds.
- The user explicitly approved recording these failures as the pre-migration baseline.

Known failures:

1. `tests/unit/meeting-assets.test.ts` cannot find `public/videos/meeting/adaptive-layout-demo.mp4` in the committed baseline.
2. `tests/unit/publication-validation.test.ts` development-input test exceeds its 5-second timeout.
3. The publication diagnostic expectation still looks for a missing Meeting route, while the current output reports draft markers and missing publication assets.
4. The Meeting video caption/poster fixture expects the obsolete `interaction-sequence.mp4` contract.
5. The composed publication fixture omits Meeting evidence/assets before reaching its intended Call Agent checksum assertion.

These failures are not a blanket waiver. Project extraction must resolve the failures belonging to its files, and the final `main` must not add new unexplained failures.

The repeated jsdom `HTMLCanvasElement.getContext()` messages are warnings, not additional failed assertions.

## Dirty-Work Backup

Not created yet.

## Extracted Branches

Not created yet.

## Unique-Commit Audit

Not started.

## Verification

Baseline recorded above. Integration verification has not started.

## Cleanup

Not started. No historical branch or worktree has been deleted.
