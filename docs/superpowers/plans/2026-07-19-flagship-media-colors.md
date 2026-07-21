# Flagship Media Colors Implementation Plan

**Goal:** Apply the approved solid backgrounds to the two flagship media cards without changing their layout or interaction contract.

1. Update the existing E2E color assertions and confirm they fail against the current gray implementation.
2. Replace only the Call Agent and ConvoAI media background values in the homepage stylesheet.
3. Rebuild the Next.js application and run focused desktop and mobile E2E coverage.
4. Inspect both viewports with agent-browser, then run the relevant regression suite, lint, and `git diff --check`.
5. Commit the focused change on `codex/stt-footer-layered-reveal`.
