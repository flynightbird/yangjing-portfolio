# Repository and Branch Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the verified integrated portfolio to canonical `main`, preserve and separate all in-progress work, establish page-domain branch naming, and remove obsolete branches and idle worktrees only after their content is accounted for.

**Architecture:** Use the approved `codex/portfolio-nextjs` commit as the release baseline. Back up the dirty source worktree outside Git, extract shared and project work into focused branches, audit unique historical commits, promote and verify `main`, update GitHub, then clean branches and worktrees. ConvoAI is a hard publication gate: final cutover waits for its separately designed bilingual case rather than creating a placeholder.

**Tech Stack:** Git, Git worktrees, GitHub CLI, Next.js 15, TypeScript, MDX, Vitest, Playwright, ESLint, GitHub Actions/Pages

---

## Scope Boundary

This plan governs repository migration and integration. It does not invent missing ConvoAI evidence or case-study content. Task 8 requires a completed `codex/case/convo-ai-build` branch containing bilingual MDX, registry entries, the internal Homepage destination, and passing tests. If that contract is absent, stop and complete an independently approved ConvoAI design and implementation plan before final publication.

## File Responsibility Map

### Migration governance

- Create: `docs/migrations/2026-07-21-repository-migration-ledger.md`
- Verify: `.github/workflows/deploy.yml` continues to target only `main`

### `codex/shared/integration`

- Modify: `app/globals.css`
- Modify: `components/case-study/case-layout.module.css`
- Modify: `components/case-study/chapter-nav.module.css`
- Modify: `components/case-study/evidence-figure.module.css`
- Modify: `components/shell/site-header.tsx`
- Modify: `components/shell/site-header.module.css`
- Modify: `package.json`
- Modify: `package-lock.json`
- Test: `tests/component/site-header.test.tsx`
- Test: `tests/unit/portfolio-detail-system.test.ts`
- Test: `tests/export/static-shell.test.mjs`

### `codex/case/call-agent-refresh`

- Delete: `components/case-study/call-agent-actions.tsx`
- Create: `components/call-agent/*`
- Modify: `content/registry.ts` only for Call Agent layout registration
- Modify: `content/work/call-agent.en.mdx`
- Modify: `content/work/call-agent.zh.mdx`
- Modify/Create: `evidence/call-agent/*`
- Create: `public/images/call-agent/*.webp`
- Create: `public/videos/call-agent/*.mp4`
- Modify/Create: Call Agent preparation and validation scripts
- Modify/Create: focused Call Agent component, unit, and E2E tests

The modified Call Agent PDF and `scripts/generate-call-agent-pdf.mjs` are preserved in the external backup but are not integrated. The approved product rule removes PDF download entry points.

### `codex/case/xuelang-refresh`

- Modify: `components/xuelang/xuelang-layout.tsx`
- Modify: `components/xuelang/xuelang-layout.module.css`
- Modify: `tests/component/xuelang-layout.test.tsx`
- Modify: `tests/e2e/xuelang.spec.ts`

### `codex/case/meeting-assets`

- Modify: `components/meeting/meeting-evidence.module.css`
- Modify: `components/meeting/meeting-layout.module.css`
- Modify: `components/meeting/meeting-models.module.css`
- Create: `evidence/meeting/source/focus-vs-pin.png`
- Create: `public/images/meeting/focus-vs-pin.webp`
- Modify: `tests/component/meeting-layout.test.tsx`

### `codex/case/convo-ai-build`

- Preserve: `evidence/convo-ai/case-study-blueprint.zh.md`
- Require before cutover: `content/work/convo-ai.zh.mdx`
- Require before cutover: `content/work/convo-ai.en.mdx`
- Require before cutover: `content/types.ts` containing `convo-ai` in `workSlugs`
- Require before cutover: `content/registry.ts` containing both ConvoAI entries
- Require before cutover: `content/home.ts` using `internal-case` and `work/convo-ai/`
- Require before cutover: focused unit and E2E route tests

Review artifacts under `.codex-analysis/`, `.codex/`, `.playwright-cli/`, `output/`, `tmp/`, and `tsconfig.tsbuildinfo` are backed up but not committed to product branches.

### Task 1: Establish the Migration Ledger and Preconditions

**Files:**
- Create: `docs/migrations/2026-07-21-repository-migration-ledger.md`

- [ ] **Step 1: Capture repository and worktree state**

Run from `/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs`:

```bash
git remote -v
git status --short --branch
git branch -vv
git worktree list --porcelain
git rev-parse codex/portfolio-nextjs main codex/hero-redesign codex/meeting-product-showcase
```

Expected: remote is `git@github.com:flynightbird/yangjing-portfolio.git`; integrated history contains spec commit `536c37a`; all known worktrees are listed.

- [ ] **Step 2: Create the ledger with actual command output**

The ledger must contain these concrete sections: repository remote, approved spec path, full pre-migration SHAs, complete `git worktree list --porcelain` output, dirty-backup status, extracted branch table, unique-commit audit, verification results, and cleanup results. Paste actual command output; do not use empty fields or placeholder text.

- [ ] **Step 3: Check GitHub authority**

```bash
gh auth status
```

Expected today: authentication is missing. Do not change GitHub settings, delete remote branches, or push replacement `main` until `gh auth login` succeeds and `gh auth status` names `flynightbird`.

- [ ] **Step 4: Commit only the ledger**

```bash
git add docs/migrations/2026-07-21-repository-migration-ledger.md
git diff --cached --name-only
git commit -m "docs: start repository migration ledger"
```

Expected: only the ledger is staged.

### Task 2: Create and Verify a Full Dirty-Work Backup

**Files:**
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`
- Create outside repository: `/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21/`

- [ ] **Step 1: Archive tracked and untracked work outside Git**

```bash
REPO=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
BACKUP=/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21
mkdir -p "$BACKUP"
cd "$REPO"
git status --porcelain=v1 -z > "$BACKUP/status.z"
git diff --binary HEAD > "$BACKUP/tracked.patch"
git ls-files --others --exclude-standard -z > "$BACKUP/untracked.z"
tar --null -T "$BACKUP/untracked.z" -czf "$BACKUP/untracked.tar.gz"
git rev-parse HEAD > "$BACKUP/base-commit.txt"
shasum -a 256 "$BACKUP/tracked.patch" "$BACKUP/untracked.tar.gz" > "$BACKUP/SHA256SUMS"
```

Expected: patch, tarball, base SHA, status, and checksum files exist.

- [ ] **Step 2: Verify both backup layers**

```bash
REPO=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
BACKUP=/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21
cd "$REPO"
tar -tzf "$BACKUP/untracked.tar.gz" >/dev/null
shasum -a 256 -c "$BACKUP/SHA256SUMS"
VERIFY=/Users/admin/Documents/作品集-yangjing/.migration-backups/verify-patch
git worktree add --detach "$VERIFY" "$(cat "$BACKUP/base-commit.txt")"
git -C "$VERIFY" apply --check "$BACKUP/tracked.patch"
git worktree remove "$VERIFY"
```

Expected: tar exits `0`, both checksums report `OK`, and the patch applies cleanly to its recorded base.

- [ ] **Step 3: Record and commit backup evidence**

Add backup path, base SHA, both checksum values, and verification result to the ledger.

```bash
git add docs/migrations/2026-07-21-repository-migration-ledger.md
git commit -m "docs: record repository migration backup"
```

### Task 3: Extract Shared Integration

**Files:**
- Modify the shared files listed in the File Responsibility Map.

- [ ] **Step 1: Create the shared worktree from protected integrated HEAD**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
BASE=$(git -C "$SOURCE" rev-parse HEAD)
SHARED=/Users/admin/Documents/作品集-yangjing/worktrees/shared-integration
git -C "$SOURCE" worktree add -b codex/shared/integration "$SHARED" "$BASE"
```

Expected: source remains dirty and unchanged; shared worktree is clean.

- [ ] **Step 2: Copy only shared files**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
SHARED=/Users/admin/Documents/作品集-yangjing/worktrees/shared-integration
cd "$SOURCE"
rsync -aR app/globals.css \
  components/case-study/case-layout.module.css \
  components/case-study/chapter-nav.module.css \
  components/case-study/evidence-figure.module.css \
  components/shell/site-header.tsx \
  components/shell/site-header.module.css \
  tests/component/site-header.test.tsx \
  tests/unit/portfolio-detail-system.test.ts \
  "$SHARED"/
cd "$SHARED"
npm install --save-exact @fontsource/geist@5.2.8
```

Apply this exact no-PDF assertion in `tests/export/static-shell.test.mjs`; do not add any PDF generator requirement:

```javascript
const xuelang = readOutput(`${locale}/work/xuelang/index.html`);
assert.doesNotMatch(xuelang, /<a\b[^>]*href="[^"]*\.pdf"/i);
```

- [ ] **Step 3: Verify boundary and focused behavior**

```bash
SHARED=/Users/admin/Documents/作品集-yangjing/worktrees/shared-integration
git -C "$SHARED" diff --name-only
cd "$SHARED"
npm ci
npx vitest run tests/component/site-header.test.tsx tests/unit/portfolio-detail-system.test.ts
npm run lint
```

Expected: only shared paths changed; tests and lint pass.

- [ ] **Step 4: Commit shared integration**

```bash
git add app/globals.css components/case-study components/shell/site-header.tsx components/shell/site-header.module.css package.json package-lock.json tests/component/site-header.test.tsx tests/unit/portfolio-detail-system.test.ts tests/export/static-shell.test.mjs
git diff --cached --name-only
git commit -m "refactor: unify portfolio detail presentation"
```

Expected: no project content, PDF, generated output, or `next-env.d.ts` is staged.

### Task 4: Extract Project Branches

**Files:**
- Modify/create the project-owned files listed in the File Responsibility Map.
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`

- [ ] **Step 1: Create four project worktrees on shared HEAD**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
SHARED=/Users/admin/Documents/作品集-yangjing/worktrees/shared-integration
SHARED_HEAD=$(git -C "$SHARED" rev-parse HEAD)
git -C "$SOURCE" worktree add -b codex/case/call-agent-refresh /Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh "$SHARED_HEAD"
git -C "$SOURCE" worktree add -b codex/case/xuelang-refresh /Users/admin/Documents/作品集-yangjing/worktrees/xuelang-refresh "$SHARED_HEAD"
git -C "$SOURCE" worktree add -b codex/case/meeting-assets /Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets "$SHARED_HEAD"
git -C "$SOURCE" worktree add -b codex/case/convo-ai-build /Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build "$SHARED_HEAD"
```

Expected: four clean worktrees.

- [ ] **Step 2: Populate Call Agent and apply its deletion**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
CALL=/Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh
cd "$SOURCE"
rsync -aR components/call-agent \
  content/work/call-agent.en.mdx content/work/call-agent.zh.mdx \
  evidence/call-agent public/images/call-agent public/videos/call-agent \
  scripts/prepare-call-agent-assets.mjs scripts/prepare-call-agent-videos.mjs scripts/update-call-agent-checksums.mjs \
  scripts/validate-content.mjs scripts/validate-publication.mjs \
  tests/component/call-agent-browser-video.test.tsx tests/component/call-agent-layout.test.tsx \
  tests/e2e/call-agent.spec.ts tests/e2e/call-agent.visual.spec.ts \
  tests/unit/call-agent-motion.test.ts tests/unit/call-agent-regression.test.ts tests/unit/call-agent-video-assets.test.ts tests/unit/privacy.test.ts tests/unit/publication-validation.test.ts \
  "$CALL"/
rm -f "$CALL/components/case-study/call-agent-actions.tsx"
```

Edit `content/registry.ts` in the Call Agent worktree to replace only `CallAgentActions` with `CallAgentLayout` for both entries. The resulting registration is:

```typescript
import { CallAgentLayout } from '@/components/call-agent/call-agent-layout';

{
  meta: contentMetaSchema.parse(callAgentEnMetadata),
  Component: CallAgentEn,
  Layout: CallAgentLayout,
},
{
  meta: contentMetaSchema.parse(callAgentZhMetadata),
  Component: CallAgentZh,
  Layout: CallAgentLayout,
},
```

Do not copy the dirty registry wholesale because ConvoAI owns its later registration.

Add only the approved video preparation command to Call Agent's package scripts:

```bash
cd "$CALL"
npm pkg set 'scripts.prepare:call-agent:video=node scripts/prepare-call-agent-videos.mjs'
```

- [ ] **Step 3: Enforce no-PDF behavior**

Do not copy `public/files/call-agent-case-study-zh.pdf`, `scripts/generate-call-agent-pdf.mjs`, or `pdf:call-agent`. Make the Call Agent publication list image/video-only:

```javascript
const expectedPublicPaths = uniqueValues([
  ...expectedImagePaths,
  ...expectedVideoPaths,
]);
```

Remove `public/files/call-agent-case-study-zh.pdf` from `scripts/validate-publication.mjs` and `evidence/call-agent/checksums.json`. Keep the existing global assertion that generated work pages contain no PDF anchor.

```bash
CALL=/Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh
rg -n "call-agent.*pdf|call-agent-case-study-zh\.pdf|pdf:call-agent" "$CALL"/content "$CALL"/components "$CALL"/scripts "$CALL"/tests "$CALL"/package.json
```

Expected: no user-facing PDF link or Call Agent PDF command.

- [ ] **Step 4: Populate Xuelang, Meeting, and ConvoAI evidence branches**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
XUELANG=/Users/admin/Documents/作品集-yangjing/worktrees/xuelang-refresh
MEETING=/Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets
CONVO=/Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build
cd "$SOURCE"
rsync -aR components/xuelang/xuelang-layout.tsx components/xuelang/xuelang-layout.module.css tests/component/xuelang-layout.test.tsx tests/e2e/xuelang.spec.ts "$XUELANG"/
rsync -aR components/meeting/meeting-evidence.module.css components/meeting/meeting-layout.module.css components/meeting/meeting-models.module.css tests/component/meeting-layout.test.tsx evidence/meeting/source/focus-vs-pin.png public/images/meeting/focus-vs-pin.webp "$MEETING"/
rsync -aR evidence/convo-ai/case-study-blueprint.zh.md "$CONVO"/
```

- [ ] **Step 5: Run focused tests**

```bash
CALL=/Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh
XUELANG=/Users/admin/Documents/作品集-yangjing/worktrees/xuelang-refresh
MEETING=/Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets
cd "$CALL" && npm ci && npx vitest run tests/component/call-agent-browser-video.test.tsx tests/component/call-agent-layout.test.tsx tests/unit/call-agent-motion.test.ts tests/unit/call-agent-regression.test.ts tests/unit/call-agent-video-assets.test.ts tests/unit/privacy.test.ts tests/unit/publication-validation.test.ts && npx playwright test tests/e2e/call-agent.spec.ts
cd "$XUELANG" && npm ci && npx vitest run tests/component/xuelang-layout.test.tsx && npx playwright test tests/e2e/xuelang.spec.ts
cd "$MEETING" && npm ci && npx vitest run tests/component/meeting-layout.test.tsx
```

Expected: all focused tests pass before commit.

- [ ] **Step 6: Commit each branch independently**

```bash
CALL=/Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh
XUELANG=/Users/admin/Documents/作品集-yangjing/worktrees/xuelang-refresh
MEETING=/Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets
CONVO=/Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build
git -C "$CALL" add components/call-agent components/case-study/call-agent-actions.tsx content/registry.ts content/work/call-agent.en.mdx content/work/call-agent.zh.mdx evidence/call-agent public/images/call-agent public/videos/call-agent scripts tests
git -C "$CALL" commit -m "feat: refresh Call Agent case study"
git -C "$XUELANG" add components/xuelang tests/component/xuelang-layout.test.tsx tests/e2e/xuelang.spec.ts
git -C "$XUELANG" commit -m "fix: refine Xuelang case layout"
git -C "$MEETING" add components/meeting evidence/meeting/source/focus-vs-pin.png public/images/meeting/focus-vs-pin.webp tests/component/meeting-layout.test.tsx
git -C "$MEETING" commit -m "fix: complete Meeting evidence presentation"
git -C "$CONVO" add evidence/convo-ai/case-study-blueprint.zh.md
git -C "$CONVO" commit -m "docs: preserve ConvoAI case evidence blueprint"
```

- [ ] **Step 7: Record branch SHAs and exclusions**

Add each new branch head to the ledger. Record that PDF generation, PDFs, temporary captures, logs, and caches were backed up but excluded.

### Task 5: Audit Historical Unique Commits

**Files:**
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`

- [ ] **Step 1: Record unique commits and counts**

```bash
git log --reverse --format='%H %s' codex/portfolio-nextjs..main
git log --reverse --format='%H %s' codex/portfolio-nextjs..codex/hero-redesign
git log --reverse --format='%H %s' codex/portfolio-nextjs..codex/meeting-product-showcase
```

Expected baseline counts: old `main` = 1, Hero = 3, Meeting = 16.

- [ ] **Step 2: Classify each unique commit**

Generate the review material with this concrete loop:

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
AUDIT=/Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21/audit
mkdir -p "$AUDIT"
for branch in main codex/hero-redesign codex/meeting-product-showcase; do
  safe_name=${branch//\//-}
  git log --reverse --format='%H' "codex/portfolio-nextjs..$branch" | while IFS= read -r sha; do
    git show --stat --summary "$sha" > "$AUDIT/$safe_name-$sha.txt"
    git diff --stat "$sha^" "$sha" >> "$AUDIT/$safe_name-$sha.txt"
  done
  git cherry codex/portfolio-nextjs "$branch" > "$AUDIT/$safe_name-cherry.txt"
done
```

For every recorded commit, write exactly one ledger decision: `migrate`, `superseded`, or `reject`. A `migrate` record names its destination branch; a `superseded` record names the integrated file or commit that replaces it; a `reject` record states the concrete conflict with current requirements.

- [ ] **Step 3: Apply retained Meeting commits to the Meeting branch**

Cherry-pick only commits classified `migrate`, one at a time. After each functional commit:

```bash
MEETING=/Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets
cd "$MEETING"
npx vitest run tests/component/meeting-layout.test.tsx tests/component/meeting-evidence.test.tsx tests/component/meeting-models.test.tsx
npx playwright test tests/e2e/meeting.spec.ts
```

Expected: no Homepage, Xuelang, Lightbox, or Footer files enter the Meeting branch.

- [ ] **Step 4: Commit the audit**

```bash
git add docs/migrations/2026-07-21-repository-migration-ledger.md
git commit -m "docs: record historical branch audit"
```

### Task 6: Free and Recreate Local `main`

**Files:**
- Modify Git refs and worktree associations only.

- [ ] **Step 1: Verify old main worktree is clean**

```bash
OLD_MAIN=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio
git -C "$OLD_MAIN" status --short --branch
```

Expected: no modified or untracked files. Stop and back it up if dirty.

- [ ] **Step 2: Rename old local main and push its safety ref**

```bash
git -C "$OLD_MAIN" branch -m main codex/shared/old-main-audit
git -C "$OLD_MAIN" push -u origin codex/shared/old-main-audit
```

Expected: old main commit is preserved remotely; local name `main` is free.

- [ ] **Step 3: Stash the already backed-up source as a second recovery layer**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
cd "$SOURCE"
git stash push --include-untracked -m "pre-main-migration-2026-07-21"
git status --short
```

Expected: canonical worktree is clean. Keep the stash through remote verification.

- [ ] **Step 4: Create canonical local main**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
git switch -c main
git status --short --branch
git log -1 --oneline
rg -n -U "push:\n\s+branches: \[main\]" .github/workflows/deploy.yml
```

Expected: canonical path is on new `main`; deployment targets only `main`.

### Task 7: Merge Shared and Project Work

**Files:**
- Merge focused branches into `main`.

- [ ] **Step 1: Merge in dependency order with a test after each merge**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
cd "$SOURCE"
git merge --no-ff codex/shared/integration -m "merge: integrate shared portfolio system"
npm test
git merge --no-ff codex/case/call-agent-refresh -m "merge: integrate Call Agent refresh"
npx vitest run tests/component/call-agent-layout.test.tsx tests/unit/call-agent-regression.test.ts
git merge --no-ff codex/case/xuelang-refresh -m "merge: integrate Xuelang refresh"
npx vitest run tests/component/xuelang-layout.test.tsx
git merge --no-ff codex/case/meeting-assets -m "merge: integrate Meeting assets"
npx vitest run tests/component/meeting-layout.test.tsx
```

Expected: each merge and focused test passes before the next merge.

### Task 8: Enforce and Merge the ConvoAI Internal Case

**Files:**
- Require the ConvoAI files listed in the File Responsibility Map.

- [ ] **Step 1: Prove the ConvoAI publication contract**

```bash
CONVO=/Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build
test -f "$CONVO/content/work/convo-ai.zh.mdx"
test -f "$CONVO/content/work/convo-ai.en.mdx"
rg -n "'convo-ai'" "$CONVO/content/types.ts" "$CONVO/content/registry.ts"
rg -n "destination: 'internal-case'|href: 'work/convo-ai/'" "$CONVO/content/home.ts"
cd "$CONVO"
npx vitest run tests/unit/content-schema.test.ts tests/unit/home-content.test.ts
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/convo-ai.spec.ts
```

Expected: bilingual content, registry entries, internal links, localized routes, and tests all pass. If any command fails, stop and complete the separately approved ConvoAI case plan. Do not publish a placeholder.

- [ ] **Step 2: Merge verified ConvoAI**

```bash
SOURCE=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
cd "$SOURCE"
git merge --no-ff codex/case/convo-ai-build -m "merge: publish ConvoAI case study"
```

- [ ] **Step 3: Verify the destination model**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
rg -n "id: '(call-agent|convo-ai|meeting|xuelang)'|destination: 'internal-case'|href: 'work/(call-agent|convo-ai|meeting|xuelang)/'" content/home.ts
rg -n "id: '(aidx|stt-demo)'" content/home.ts
```

Expected: four internal cases; AIDX and STT remain new-tab destinations; Visual Archive remains Lightbox-driven.

### Task 9: Run Full Local Verification

**Files:**
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`

- [ ] **Step 1: Run source, test, lint, and build verification**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
npm run validate:content
npm test
npm run lint
npm run build
```

Expected: all pass. Record exact totals. A known historical timeout is recorded separately and must not be used to excuse a new failure.

- [ ] **Step 2: Run Homepage and route E2E tests**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/call-agent.spec.ts tests/e2e/convo-ai.spec.ts tests/e2e/meeting.spec.ts tests/e2e/xuelang.spec.ts
```

Expected: both locales, four internal routes, AIDX/STT new tabs, and Visual Archive Lightbox pass.

- [ ] **Step 3: Inspect desktop and 390 px output**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
npx serve dist -l 4174
```

Inspect `/zh/`, `/en/`, and all internal case routes at desktop and 390 px. In each route evaluate:

```javascript
document.documentElement.scrollWidth === document.documentElement.clientWidth
```

Expected: `true`. Verify Hero, motion, navigation, media cards, Footer, and all Visual Archive Lightboxes interact correctly.

- [ ] **Step 4: Commit verification evidence**

Record command totals, viewport results, and final local `main` SHA in the ledger.

```bash
git add docs/migrations/2026-07-21-repository-migration-ledger.md
git commit -m "docs: verify canonical portfolio main"
```

### Task 10: Push Canonical `main` and Correct GitHub Defaults

**Files:**
- Modify remote refs and GitHub repository settings.

- [ ] **Step 1: Reconfirm remote main lease**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
git fetch origin
git rev-parse origin/main
git rev-parse codex/shared/old-main-audit
```

Expected: SHAs match. Stop if remote main changed after the audit branch was created.

- [ ] **Step 2: Push new main with lease protection**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
OLD_REMOTE_MAIN=$(git rev-parse origin/main)
git push --force-with-lease=main:$OLD_REMOTE_MAIN -u origin main
```

Expected: remote `main` points to verified portfolio. Never replace with unrestricted `--force`.

- [ ] **Step 3: Set and verify GitHub default branch**

```bash
gh auth status
gh repo edit flynightbird/yangjing-portfolio --default-branch main
gh repo view flynightbird/yangjing-portfolio --json defaultBranchRef --jq '.defaultBranchRef.name'
gh workflow list --repo flynightbird/yangjing-portfolio
```

Expected: account is `flynightbird`; default branch is `main`; `Deploy portfolio` exists.

- [ ] **Step 4: Verify the main deployment before cleanup**

```bash
RUN_ID=$(gh run list --repo flynightbird/yangjing-portfolio --workflow "Deploy portfolio" --branch main --limit 1 --json databaseId --jq '.[0].databaseId')
test -n "$RUN_ID"
gh run watch "$RUN_ID" --repo flynightbird/yangjing-portfolio --exit-status
```

Expected: latest main deployment succeeds. Do not clean branches/worktrees while pending or failing.

### Task 11: Delete Merged Branches and Idle Worktrees

**Files:**
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`
- Remove fully accounted Git worktrees and branches.

- [ ] **Step 1: Prove each non-canonical worktree is clean**

Run this check for every registered path except the canonical worktree:

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
CANONICAL=/Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
git worktree list --porcelain | awk '/^worktree / { sub(/^worktree /, ""); print }' | while IFS= read -r path; do
  if [ "$path" != "$CANONICAL" ]; then
    test -z "$(git -C "$path" status --porcelain)" || exit 1
  fi
done
```

Expected: empty output for every candidate. Stop and preserve any non-empty worktree.

- [ ] **Step 2: Prove merged heads are reachable from main**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
for branch in codex/homepage-interaction-polish codex/stt-footer-layered-reveal codex/visual-archive-lightbox-stage codex/xuelang-case-polish codex/shared/integration codex/case/call-agent-refresh codex/case/xuelang-refresh codex/case/meeting-assets codex/case/convo-ai-build; do
  git merge-base --is-ancestor "$branch" main || exit 1
done
```

Expected: exit `0`. Hero, Meeting showcase, and old-main audit use their recorded audit decision because rejected commits need not be ancestors.

- [ ] **Step 3: Remove verified idle worktrees without force**

Remove the known clean, accounted paths with this explicit list:

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
worktrees=(
  '/Users/admin/Documents/作品集-yangjing/yangjing-portfolio'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/hero-redesign'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/homepage-interaction-polish'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/meeting-product-showcase'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/merged-preview'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/stt-footer-layered-reveal'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/visual-archive-lightbox-stage'
  '/Users/admin/.config/superpowers/worktrees/yangjing-portfolio-nextjs/xuelang-nav-fix'
  '/Users/admin/Documents/作品集-yangjing/worktrees/shared-integration'
  '/Users/admin/Documents/作品集-yangjing/worktrees/call-agent-refresh'
  '/Users/admin/Documents/作品集-yangjing/worktrees/xuelang-refresh'
  '/Users/admin/Documents/作品集-yangjing/worktrees/meeting-assets'
  '/Users/admin/Documents/作品集-yangjing/worktrees/convo-ai-build'
)
for path in "${worktrees[@]}"; do
  if [ -d "$path" ]; then
    test -z "$(git -C "$path" status --porcelain)" || exit 1
    git worktree remove "$path"
  fi
done
```

Expected: removal succeeds without `--force`. A refusal means stop and inspect.

- [ ] **Step 4: Delete merged branches safely**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
git branch -d codex/homepage-interaction-polish codex/stt-footer-layered-reveal codex/visual-archive-lightbox-stage codex/xuelang-case-polish codex/shared/integration codex/case/call-agent-refresh codex/case/xuelang-refresh codex/case/meeting-assets codex/case/convo-ai-build
for branch in codex/homepage-interaction-polish codex/stt-footer-layered-reveal codex/visual-archive-lightbox-stage codex/xuelang-case-polish; do
  if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
    git push origin --delete "$branch"
  fi
done
```

After audit decisions and worktree removal, delete `codex/hero-redesign`, `codex/meeting-product-showcase`, and `codex/shared/old-main-audit` locally/remotely. Use `git branch -d`; if Git refuses because rejected commits are intentionally unmerged, verify the ledger and ask for explicit final deletion approval rather than using `-D` automatically.

- [ ] **Step 5: Drop the temporary stash only after backup re-verification**

```bash
cd /Users/admin/Documents/作品集-yangjing/yangjing-portfolio-nextjs
shasum -a 256 -c /Users/admin/Documents/作品集-yangjing/.migration-backups/2026-07-21/SHA256SUMS
git stash list
git stash show --stat stash^{/pre-main-migration-2026-07-21}
git stash drop stash^{/pre-main-migration-2026-07-21}
git worktree prune
git fetch --prune origin
```

Expected: backup remains valid before stash deletion.

### Task 12: Final Governance Verification

**Files:**
- Modify: `docs/migrations/2026-07-21-repository-migration-ledger.md`

- [ ] **Step 1: Verify Git and GitHub state**

```bash
git status --short --branch
git branch --merged main
git branch --no-merged main
git worktree list
git remote show origin
gh repo view flynightbird/yangjing-portfolio --json defaultBranchRef --jq '.defaultBranchRef.name'
```

Expected: canonical worktree is clean on `main`; GitHub default is `main`; every remaining unmerged branch has a documented purpose and target.

- [ ] **Step 2: Re-run the route contract**

```bash
npx playwright test tests/e2e/homepage.spec.ts tests/e2e/call-agent.spec.ts tests/e2e/convo-ai.spec.ts tests/e2e/meeting.spec.ts tests/e2e/xuelang.spec.ts
```

Expected: both locales pass; four cases navigate internally; AIDX/STT open new tabs; Visual Archive opens Lightbox.

- [ ] **Step 3: Close and push the ledger**

Record final main SHA, deployment result, deleted branches/worktrees, remaining branch purposes, backup path, and checksums.

```bash
git add docs/migrations/2026-07-21-repository-migration-ledger.md
git commit -m "docs: close repository migration"
git push origin main
```

Expected: final migration commit contains only the completed ledger.
