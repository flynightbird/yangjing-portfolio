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

Created and verified at `/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21/`.

- Base commit: `a82387fe3129cf9ddba5143318118861c969d805`
- Source status entries: 67
- Untracked paths: 340
- `tracked.patch`: 7.5 MB
- `untracked.tar.gz`: 87 MB
- Tracked patch SHA-256: `79680f60bb2690996c48cab9edd921c2c0bc3f5a3968a9318d01b09805a9b4c4`
- Untracked archive SHA-256: `3f3c2f3da6176ce4873218d99c056262b232415a1a2799c5454c0b521536d483`
- `tar -tzf` completed successfully.
- `shasum -a 256 -c SHA256SUMS` reported `OK` for both files.
- `tracked.patch` passed `git apply --check` in a detached clean worktree at the recorded base.
- The temporary verification worktree was removed after the check.

## Extracted Branches

All project branches were created from shared integration commit `86f65b16620015635708cf96181253e80e0b6d54`.

| Branch | Commit | Scope | Focused verification |
| --- | --- | --- | --- |
| `codex/shared/integration` | `86f65b16620015635708cf96181253e80e0b6d54` | Shared typography, header, chapter navigation, case-detail surfaces, and static shell assertions | 40/40 focused tests passed; ESLint completed with 0 errors and 3 existing `<img>` warnings |
| `codex/case/call-agent-refresh` | `0125fba` | Dedicated bilingual Call Agent layout, image/video evidence, preparation and validation contracts | 110/110 component/unit tests and 24/24 E2E tests passed |
| `codex/case/xuelang-refresh` | `9322917` | Removes case PDF entry and uses the shared light chapter treatment | 3/3 component tests and 9/9 applicable E2E tests passed; 6 viewport-inapplicable tests skipped |
| `codex/case/meeting-assets` | `a0b27f5` | Shared light chapter treatment plus `focus-vs-pin` source/public evidence | 2/2 focused component tests passed |
| `codex/case/convo-ai-build` | `93d173f` | Preserves the evidence-labelled Chinese case blueprint | Documentation only; publication gate remains open |

The first parallel Vitest attempt produced only resource-contention timeouts. Serial reruns passed. Call Agent's initial Playwright server probe timed out before assertions because the first route compilation took 55.08 seconds in addition to server startup; the same server, once warmed, completed all 24 tests successfully.

Excluded from product branches: Call Agent PDF generation, the Call Agent PDF, all user-facing Call Agent PDF actions, temporary captures, logs, caches, `.codex-analysis/`, `.codex/`, `.playwright-cli/`, `output/`, `tmp/`, and `tsconfig.tsbuildinfo`. These remain recoverable in the verified external backup.

## Unique-Commit Audit

Audit material is preserved at `/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21/audit/`. Counts matched the plan: old `main` 1, `codex/hero-redesign` 3, and `codex/meeting-product-showcase` 16.

| Commit | Decision | Evidence |
| --- | --- | --- |
| `005bba3b3f70c6738c76fd871aa909648f4b8254` | `superseded` | `git cherry` marks the account-migration patch equivalent (`-`); both affected documents already reference `flynightbird`. |
| `3af11ddde779a17a2c5f55cb2883530480f8beb9` | `superseded` | Interactive Hero behavior is present and further evolved by integrated commits `ac8d80f`, `ddc8feb`, and later Homepage refinements. |
| `139aced6c14eb5d66da73c7376369acf69eabcc1` | `superseded` | The introduction components remain in the integrated Homepage and were further revised by `ac8d80f` and `ddc8feb`; the standalone old E2E file was intentionally folded into current Homepage coverage. |
| `1143aa1e646bdb82e55d574284a11306db518aea` | `superseded` | Current `flagship-projects.tsx`, localized content, media stages, and CTA coverage contain later Homepage work including `ddc8feb`, `8393c1b`, `876d7ca`, `c54ce8c`, and `1000ec2`. |
| `1973da4349f289ec1c5886c0bab5dc3e86066324` | `reject` | Defines the Meeting showcase redesign that the user explicitly instructed the migration to ignore. |
| `a9cbea6af9a34a8451f3f3ecac822413728802b7` | `reject` | Plans the explicitly rejected Meeting showcase redesign rather than the retained `790fc8d` case. |
| `5e5aa4e6087d3c7fdb79fe73da3945f685aadf5d` | `reject` | Tests the rejected showcase contract and would replace current Meeting expectations. |
| `fa04d302564c9a4747b4068836440c452cacf42c` | `reject` | Extends the rejected showcase localization contract. |
| `e20727a083ebf68245a121a8674c3c506a03ba09` | `reject` | Adds showcase-only components absent from the retained Meeting architecture. |
| `24fc1a99d856bb752d2ad6557ae68cbcaa386358` | `reject` | Rewrites the retained bilingual Meeting narrative into the rejected showcase story. |
| `c1621e6d19e0027046498d46ed3d3f40bc0627f8` | `reject` | Follow-up copy contract belongs to the rejected showcase narrative. |
| `2bd76bb37b03472bf7520d67710af6e32e6b0e0d` | `reject` | Follow-up evidence wording belongs to the rejected showcase narrative. |
| `f0eb34ec845ef34e67c667e7bdafe3b17b7549b4` | `reject` | Replaces the retained Meeting layout with the rejected product-led showcase layout. |
| `fefd187cc75c34cc70855509ec2749cea4cbe385` | `reject` | Tunes viewport rhythm for the rejected showcase layout. |
| `eb9a33133fa1384f5b2b0f05a5cc9804e5f8bae9` | `reject` | Constrains the rejected showcase Hero composition. |
| `bdbbc7decdc6885c7c41ff608f539b8adeecb1de` | `reject` | Hardens edge viewports and print rules for the rejected showcase layout. |
| `88b58c37ca41c4a6964a4e0596d81feff5e4628b` | `reject` | Restyles evidence and adds tests around the rejected showcase component family. |
| `0faa8d188ddd7825d89e0e84397ac4fbda723dd1` | `reject` | Alters the rejected showcase matrix and its accessibility contract. |
| `f49311c519e8f411216f051fcf81be4438a38767` | `reject` | Couples shared routing/presentation changes to the rejected showcase; current shared routing is handled by `86f65b1`. |
| `4ed411122c8403c1d21febcde46d0582be0e757e` | `reject` | Adds geometry checks for the rejected showcase layout. |

No historical commit was classified `migrate`, so no cherry-pick was applied. The retained Meeting implementation is the published `790fc8d` case plus focused branch `a0b27f5`; the rejected branch is preserved until final cleanup.

## Verification

Local canonical `main` was created from approved base `a82387f`. Post-backup source commit `f2f5224` remains preserved on `codex/portfolio-nextjs` but was not used as the base because it combines shared and Call Agent work with the excluded Call Agent PDF contract.

Merged and verified locally:

- Shared integration merge `5a1b47d`; its immediate full-suite run exposed the recorded baseline failures, resource-contention timeouts, and one expected transitional Meeting assertion resolved by the Meeting branch.
- Call Agent merge `50edc22`; 7/7 focused integration tests passed.
- Xuelang merge `389bbbc`; 3/3 focused integration tests passed.
- Meeting merge `2aa6570`; 2/2 focused integration tests passed.
- Migration audit merge `97ed48c`; this also preserves the previously completed Homepage AI toolchain copy commits already present on the migration-control branch.

### ConvoAI publication gate

Final verification and publication are blocked by the explicit no-placeholder contract:

- Missing `content/work/convo-ai.zh.mdx`.
- Missing `content/work/convo-ai.en.mdx`.
- Missing `convo-ai` work slug and registry entries.
- Homepage still declares ConvoAI as `external-live-site`, `awaiting-assets`, and `https://conversational-ai.shengwang.cn/` instead of `internal-case` and `work/convo-ai/`.
- Missing `tests/e2e/convo-ai.spec.ts`.

Branch `codex/case/convo-ai-build` currently contains only evidence blueprint commit `93d173f`; it has not been merged. Full canonical verification, remote `main` replacement, deployment, and cleanup remain intentionally pending.

## Cleanup

Not started. No historical branch or worktree has been deleted.
