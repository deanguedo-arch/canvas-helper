# Handoff

> Continuation update: editor reconciliation completed; see `RECONCILIATION_HANDOFF.md` and `EDITOR_RECONCILIATION.json` for the current disposition ledger and verification. The historical pending-map counts below are superseded. Learner candidate hashes remain identical; canonical integration and full rollout proof are not claimed.

- Project: Biology 30 Chapters 11–12
- Task: Realize the complete supplied v1.0.1 teaching handoff as isolated native review candidates.
- Status: Building; complete teaching and native response controls assembled, teacher/editor acceptance and rollout proof pending.

## Files changed

- `scripts/build-biology30-ch11-ch12-teaching-comparison.mjs`
- `scripts/serve-biology30-ch11-ch12-teaching-comparison.mjs`
- This directory: immutable `pro-return/`, `evaluation/`, `BUILD_REPORT.json`, and `evidence/`.
- Operational active/archived handoffs. No canonical workspace, runtime owner, assessment bank, export or deployment changed.

## What changed / summary

- CH11: all 13 routes, 45 separately hash-verified teaching sections, 25 optional native writing activities. Native Start, draft, writing save, finish, reset and redo controls; 3200-character validation; models outside prompt snapshot owners.
- CH12: all 10 routes, 55 separately hash-verified replacement/addition intervals, nine append-only C.notes records with native 5000-character response controls.
- Full supplied prose, stimuli, hints, comparisons and feedback preserved. Static paragraph/heading/list/table-cell comparison rejects omissions. New tables use the established comparison-table component; fonts, colors and stylesheets are copied unchanged.
- Four teaching-direction/locator amendments: writing-only directions for CH11 lessons 01–03; Launch Lab printed365/PDF6 link. Assessments unchanged.
- New CH12 extension comparison mirrors the original extension's native saved-note lock using a supplementary candidate-only observer, without altering its state owner or original saved-task subtree.
- New source assets copied exactly and mapped in BUILD_REPORT. Original figure/media subtrees preserved. Interwoven bold vocabulary uses native lookup controls.
- Comparison: http://127.0.0.1:57300/?chapter=11&lesson=lesson-01 . Full width: CH11 port57302, CH12 port57304. Old CH11/12 ports57301/57303; synthetic QA57305/57306. Each is a separate browser origin.

## Why this changed

Dean requested completion of the supplied source-led teaching package, not another shortened prose pass. Existing course structure and native saving were reused, following the uncodixfy skill's preservation of the established design.

## Source of truth

- Canonical CH11: `projects/biology30-unit-a-pilot-3/workspace/index.html`; original SHA256 9fcd8203b41f4220e53716e473c02a0835f356420b363ea0092e544a8e7bb210.
- Canonical CH12: `projects/biology30-chapter-12/workspace/index.html`; original SHA256 2205c401e8edacf3fb91b71cb7146ae1757d5d1bf06d5ec6e8b24724bcde3062.
- Both matched the supplied source hashes. No stale-offset rebase was required. The builder aborts on source/boundary/anchor drift.
- Supplied ZIP SHA256: 718d5e0abda8e87f075a931d772037cc0032c53fc72b3491e46ef30e67931314. CRC passed; all 417 root manifest payloads and root checksums verified.
- Full manuscripts, source locators, independent source reviews and proposals remain unchanged under `pro-return/`. The package's independent science review is supplied evidence, not a new Codex full science audit.

## Verification run

- Hash-bound assembly and protected DOM comparisons: CH11's 12 required checks, original activities/scripts/videos; CH12's nine checks, original guided/transfer/note controls. Unique HTML IDs; no inert new response fields; all local image paths exist. Original figures:36/36 CH11 and12/12 CH12 exact.
- Every new CH11 activity saved and finished using real UI controls on QA57305. Reload showed25 original completed runs. All25 were revised through Redo, saved and finished; collection showed50 runs and25 revised responses, with required progress still0/12.
- Every new CH12 note saved through real UI controls on QA57306. All nine fields restored after reload; All My Work showed nine collected responses. Every note was edited, returned to Draft, and deliberately saved again.
- CH12 extension supplementary/native model locks both true before its existing optional note was saved and both false afterward.
- Representative CH11 native vocabulary popup opened Homeostasis and its explanatory panels. CH11 revised typography inspected at full width; screenshot under `evidence/ch11-revised-teaching.png`.
- All13 CH11 route headings and desktop overflow inspected. Offscreen lazy images are not reported as loaded-pixel proof merely because files exist.
- The25-item redo loop reached its tool timeout near lesson12. Browser state was inspected; remaining saves completed; final50-run count verified. No ambiguous partial run was counted as completed.
- A final rebuild hit ENOSPC. Only the generated old-preview asset duplicates were replaced with symlinks to the unchanged canonical assets; the original copied HTML remains frozen. No user source was removed. Duplicate assets can be recreated from canonical owners. The rebuild subsequently completed; final hashes are recorded in BUILD_REPORT.
- Native reset cleared a newly typed unfinished CH11 draft and returned Start to its enabled state; all50 prior completed runs and0/12 required progress remained. The CH12 supplementary extension lock restored false after reload of its collected native note.
- Routing: source/state integration retained by the lead because it depends on current course owners and teacher boundaries; deterministic assembly. No workers or provider-cache calls; savings unknown. CH11 authoring context retrieved; CH12 context correctly refuses blocked/proposal-only lifecycle status, which was not promoted.

## Fragile areas / watchouts

- Existing prose editor identities are not automatically equivalent to new explanations. BUILD_REPORT explicitly inventories unresolved original prose/term occurrence placements. Do not falsely attach old keys to unrelated paragraphs; resolve semantic identities before canonical Studio integration. New prose has unique candidate edit keys.
- The pending protected questions/keys can conflict with corrected teaching. Preserve historical records; obtain scoped decisions and version amendments separately. Do not auto-regrade.
- Old preview assets now reference canonical assets; they must not drift during this comparison. The original canonical hashes and retained intake remain the recovery basis.
- Preview namespaces are native but isolated by origin. Do not automatically import review/test saves into production or use multiple writing tabs on one origin.
- CH12 supplementary model lock relies on its original native extension lock; it has no independent grading or persistence.

## Next prompt should assume

- All supplied teaching is present for review; exact teacher acceptance remains false. Canonical courses, release status and LMS packages are unchanged.
- Source manifests and proposed assessment amendments are not permission to change marking.
- Build-mode evidence is not Studio, legacy-save, print, media, SCORM or Brightspace certification.

## What still needs validation / known risks

- Semantic editor-identity reconciliation, full rendered manuscript/pixel review across all23 routes, all-route narrow/mobile and keyboard review.
- Legacy import/resume/conflict/failure checks; complete required-check and original optional-task runtime regression; print/PDF/backup, reader pixels, media playback/captions/fallback.
- Final standalone sharing/package/deployment/SCORM/Brightspace only at an authorized rollout checkpoint.
- Required neuron drawing remains an unchanged text-only saved prompt; no unsupported attachment upload promised.

## Exact next action

Review the new teaching through the chapter/lesson comparison selector and record exact acceptance or requested changes. Complete the semantic editor-binding map before canonical integration. If preview server stopped: `node scripts/serve-biology30-ch11-ch12-teaching-comparison.mjs`.

## Exact next file to open

`/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/ch11-ch12-handoff-v1.0.1/evaluation/index.html`

## Do not do next / warnings

Do not deploy, package, migrate saves, overwrite canonical owners, reinterpret old marking or silently promote the blocked CH12 lifecycle. Do not describe this review candidate as fully finished or LMS-ready.
