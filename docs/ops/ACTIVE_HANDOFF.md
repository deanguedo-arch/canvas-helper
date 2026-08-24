# Handoff

- Project: all 21 active `ela*` catalog projects
- Task: Repair the learner-visible defects found by the fine-tooth ELA audit while preserving the accepted Core Vocabulary and Evidence Bank rollout.
- Status: complete and pushed on `codex/all-ela-vocabulary-evidence-rollout`; intentionally unmerged with no pull request, factory rebuild, SCORM export, or Brightspace upload.

## Summary

- Branch: [codex/all-ela-vocabulary-evidence-rollout](https://github.com/deanguedo-arch/canvas-helper/tree/codex/all-ela-vocabulary-evidence-rollout).
- Pre-repair rollback point: `4b5caf3dc1116305a058d23ab50366bbcf29b8d5`.
- Restored-snapshot rollback point: `e69444aaac631f3a507c86240955929b0a892c1e`.
- Repair commits:
  - `4a1ab55d6344d88bff3b0d5e8c287d882c750481` — `fix(english): restore Streetcar SCORM lesson fidelity`.
  - `f841ad171e3bddfea7939e74b68b3cbc07e6d0c4` — `fix(english): repair preserved ELA learner defects`.
  - `5e97afe49a41273f7ec38d4a261144a7a2b513ae` — `test(english): harden ELA learner repair gates`.
  - `ac9d82513b4a0c6ea85bfca24e21335c769a3909` — `fix(english): align ELA 10 progress totals`.
- The supplied `/Users/deanguedo/Downloads/ELA_30-1_MODERN_PLAY.zip` is the canonical Streetcar learner snapshot. Its SHA-256 is `69a2d446be9042444d7fa6a30c91555fcc569c8a0f865b91b5952d09ba822b87`; its `index.html` matches restored checkpoint `e69444aa` at SHA-256 `4c1f01fc09b4d17d4566a4f18ccb722835818d2ae61859a8354d6127ce253bb6`.
- No instructional text was deleted. Removed items were two temporary Streetcar route wrappers whose content was merged back into its SCORM pages, one empty Othello link, and unavailable video embeds replaced by written/internal fallbacks.
- Studio remains available on port `5177`, with ELA 30-1 Streetcar Core Vocabulary open for review.

## Files changed

- Streetcar fidelity and contracts: `projects/ela30-1-modern-drama/workspace/index.html`, `meta/project.json`, and `meta/e2e-contract.json`.
- Short-story repairs: the ELA 10-1, ELA 10-2, ELA 20-2, ELA 30-1, and ELA 30-2 short-story `workspace/index.html` files.
- ELA 30-1 Short Stories support resource: `workspace/resources/rhw-irony.html` dependencies in `workspace/Template/cbestylesheet.css`, `workspace/Template/custom_scripts.js`, plus `workspace/imsmanifest.xml` and `meta/e2e-contract.json`.
- Accessibility repairs: the three Feature Film/Film Study `workspace/index.html` files, ELA 30-1 Othello, and ELA 30-2 Streetcar.
- Content corrections: both tracked Macbeth workspace snapshots and ELA 10-2 Writing Foundations.
- Shared gates: `e2e/lib/learner-course-assertions.ts`, `e2e/lib/project-contract-schema.ts`, `scripts/verify-ela-core-vocabulary.ts`, `scripts/tests/course-build-brief.test.ts`, and `scripts/tests/preview-inspection.test.ts`.
- Operational record: `docs/ops/ACTIVE_HANDOFF.md` and `docs/ops/ARCHIVED_HANDOFFS.md`.

## What changed

- ELA 30-1 Streetcar again matches the supplied SCORM's visible 13-card lesson organization. Tennessee Williams material is inside Introduction, the character presentation is inside Lesson 2, and progress now reaches 13/13. A migration preserves completion from the temporary split routes without allowing totals above 100%.
- ELA 10-1 and ELA 10-2 Short Stories now use 13 real completion items everywhere, including their initial static progress labels.
- The two broken `#text-bank` links now open the existing Story Bank routes.
- Unavailable Theme video embeds were replaced with written-review guidance and internal Elements of Fiction links; the complete written lessons remain.
- The linked ELA 30-1 irony answer page now has reviewed local CSS/print-helper adaptations, both declared in the manifest and covered by a linked-page dependency test.
- All 120 Film Study question fields have programmatic prompt labels. Othello's 17 unlabeled language controls are labeled, its absolute-language regex works, its dead UVic destinations use the current RSC page, and its empty duplicate anchor is gone.
- Five ELA 30-2 Streetcar video frames have descriptive titles, and learner-visible `Street Car` wording is corrected to `Streetcar`.
- Macbeth control characters, the garbled meter example, `Elizabethean`, and adjacent punctuation defects are corrected in both tracked workspace snapshots.
- Writing Foundations models for Chronological Order and Cause and Effect now match the preserved course sources.
- The shared verifier now checks route/hash parity, completion IDs and displayed totals, control characters, accessible controls/frames, reachable local dependencies, forbidden dead references, and the reviewed irony-support contract.
- Project E2E now proves full completion totals, every vocabulary panel hook, and declared linked learner pages with their local dependencies.

## Why this changed

- The fine-tooth audit found real preserved-source defects that the initial rollout contracts did not cover. These repairs correct those defects without redesigning lessons or replacing canonical snapshots.
- The earlier Streetcar progress repair followed hidden 15-item conversion metadata and changed the visible SCORM structure. This repair restores the supplied SCORM as authority while correcting its progress denominator.
- Stronger static and rendered contracts make the same route, progress, accessibility, resource, and vocabulary-hook defects fail before release.

## Verification run

- Exact-head `course:doctor`: 21/21 passed.
- Exact-head workspace verification: 21/21 passed with no missing local assets, workspace embeds, or course-shell resources; declared external font/runtime warnings remain informational.
- Exact-head project E2E matrix: 21/21 passed. Eighteen courses passed on the first run; ELA 10-2 Short Stories passed one isolated timeout retry, and Macbeth plus ELA 20-1 Short Stories passed unchanged after traces proved a full Studio reload interrupted their first assertions.
- E2E exercised 190 unique completion IDs, all 959 vocabulary panels and hook contracts, the linked irony page dependency contract, executable-runtime/local-asset monitoring, and 148 mobile route overflow checks.
- `npm run verify:ela-core-vocabulary`: passed all 21 distinct inventories and 959 concepts.
- `npm run build:studio`: passed.
- `npm run test:studio-inspection`: passed 168/168.
- `npm run test:e2e:smoke`: passed 1/1 Chromium.
- `npm run verify:typecheck-baseline`: passed; ten frozen baseline diagnostics remain, with none in changed files.
- `git lfs fsck --pointers HEAD` and `git lfs fsck --objects HEAD`: passed.
- `git diff --check`: passed.
- Independent final diff audit found no release-blocking defect, instructional deletion, protected-zone change, or source-boundary violation.
- Visible Studio verification confirmed 13 Streetcar cards/completion controls, merged Introduction and Lesson 2 content, 48 vocabulary panels, zero browser-console errors, and no horizontal overflow at 1067 px desktop or 429 px mobile widths.

## Source of truth

- Canonical learner source: each active project's `projects/<slug>/workspace/index.html`.
- Ownership and learner contracts: each project's `projects/<slug>/meta/project.json` and `meta/e2e-contract.json`.
- All 21 projects remain `legacy-snapshot-v1`; historical English factory inputs and rebuild commands are quarantined and are not write authority.
- The Streetcar learner organization follows the supplied SCORM ZIP, not older conversion metadata.
- The irony CSS/JS files are reviewed snapshot adaptations because the supplied short-story ZIPs omitted their referenced `Template/` directory; they are not represented as byte-for-byte ZIP recovery.

## Fragile areas / watchouts

- Do not run an English factory rebuild; it can replace the canonical workspace snapshots and erase these direct repairs.
- Three ELA 30-1 shells still depend on the exact approved Tailwind runtime relay. Future upstream version changes must be reviewed and pinned rather than broadly allowed.
- Remote YouTube, Google Fonts, and reference links remain provider/network dependent.
- Large Crucible, Streetcar, and Othello media require Git LFS objects on another checkout.
- Repeated legacy `header`/`footer` fragment IDs and manifest-only archive pages remain source-preserved because they are not learner routes or active selectors.
- `node_modules` is a local untracked symlink for this worktree and must never be staged.

## Next prompt should assume

- The fine-tooth repair list is implemented, pushed, and fully validated on the isolated branch.
- Core Vocabulary and Evidence Bank behavior remain intact across all 21 ELA projects.
- Keep this branch unmerged until the user explicitly accepts it.
- No SCORM packaging or LMS deployment has occurred.

## What still needs validation

- Human/editorial review may still request vocabulary wording or model refinements; no automated defect remains open from this audit.
- SCORM packaging, Brightspace upload, and LMS/browser persistence remain intentionally untested until the branch is accepted.
- Broad live external-link availability can drift and is not guaranteed by local verification.

## Known risks

- External providers can change or remove fonts, videos, and reference pages after this validation.
- A clone without Git LFS objects will have incomplete large media.
- The ELA 10-1 vocabulary source intentionally uses its deterministic runtime normalizer for uniform hook attributes; rendered checks cover all 45 panels.

## Exact next command

`npm run studio -- --host 127.0.0.1 --port 5177 --strictPort --clearScreen false`

## Exact next file to open

`projects/ela30-1-modern-drama/workspace/index.html`

## Do not do next / warnings

- Do not merge or open a pull request without explicit approval.
- Do not run an English factory rebuild, export SCORM, or upload to Brightspace.
- Do not stage `node_modules`, `.runtime/**`, `raw/**`, exports, downloaded ZIPs, or unrelated projects.
