# Ticket T00 completion record

Status: IMPLEMENTED (read-only ticket; acceptance = lead agreement on frozen baseline)
Baseline commit/source hashes: branch codex/math-engine-preflight @ 02a9fadc9148bf26c0c93006560375a9c5c6b4ee; live workspace sha256 index.html c9a7f359…, course-data.js 7b1ce722…, main.js 91171649…, styles.css 3acd132f… — all four match plan baseline/source-manifest.json exactly.
Dirty-overlay/diff digest: 230 status paths (97 modified, 1 deleted, 132 untracked); 98 tracked files +11813/−2427. AB30 workspace + meta are inside the overlay (uncommitted newer work). No reset/clean/stash performed.
Writer/approved scope: read-only inspection; evidence writes only under meta/ab30-parity/ (ticket outputs, not production edits). No isolated worktree was established; worked read-only against the live checkout.

## Changed files and actual changes

- projects/aboriginal-studies-30/meta/ab30-parity/environment.json (new): resolved AB30_WORKSPACE, BIO_REFERENCE, EVIDENCE_DIR, authoring driver, runtime save owner, export owner, real test commands.
- projects/aboriginal-studies-30/meta/ab30-parity/baseline-observed.json (new): frozen inspector inventory (50-lesson registry in array order, 89-prompt field registry, hashes, old-parser diagnostic).
- No production source touched.

## Evidence

- `python3 tools/inspect_ab30.py <workspace> --output … --baseline …` (packaged CLI, unmodified): exit 2 — hard-requires AUDIT_README.md, which is audit-ZIP packaging and was never a repo workspace file. Recorded as tooling limitation, not a product defect.
- Wrapper /tmp/ab30evidence/run_inspector.py (imports packaged module unmodified, relaxes only the packaging-file precondition): exit 0. Counts: 4 themes; 50 lessons (23/10/10/7); 12 assignments; 1 themeActivity; 94 vocabulary; 20 filmRoom; 0 quizzes; 89 booklet prompts; 102 booklet fields. No duplicate lesson IDs. baselineComparison.matching = true, differentFiles = [].
- Old-parser diagnostic (inventory-level defect reproduction): q1 and q2 each inferred in 3 lessons (t1-l02-nations-peoples, t1-l21-rebuilding-goals, t1-l22-models) — feeds MAP01/T01.
- External style deps pinned by inspector: Google Fonts css2 + cdnjs font-awesome 6.4.0 (feeds T21).
- MAP03 (T00 portion): 50/50 lesson IDs present in array display order (theme-1 t1-l01…t1-l23 in order; theme-2/3/4 nonsequential IDs preserved as listed in baseline-observed.json); no embedded-number sorting; zero lessons carry explicit bookletQuestionIds yet (expected pre-T02). Automated MAP03 guard lands in T01.
- BIO_REFERENCE resolved: biology30-unit-a-pilot-3 (active/conversion), index.html 9fcd8203…, styles.css a4531841…. Plan-mentioned biology30-chapter-13 is authoringStatus=blocked → not a live exemplar. Bio/Chem untouched.
- `npx tsx --test scripts/tests/aboriginal-studies-30-shell.test.ts`: fails in sandbox, EPERM on tsx IPC socket (first-hand). `node --test` on an import-free erasable-TS probe: pass. T01 tests will therefore be import-free so both runners execute them.
- Screenshots (runbook step 6): NOT RUN — no playwright browsers and no system chrome in this environment (first-hand check).

## Learner-work impact

None. Read-only ticket. ID inventory confirms the 50 IDs T02+ must preserve; frozen order recorded in baseline-observed.json lessonRegistry.

## Content/source review

No sources used beyond the plan package + live checkout. Reconciliation outcome: live checkout IS the audit baseline (hash-identical on all 4 course files); nothing to merge, nothing overwritten. Audit ZIP itself (Aboriginal_Studies_30_Audit_2026-09-23.zip) not present locally — needed only if a file-level archive diff is later required. Official booklets/textbook/rubric PDFs not yet located in-repo; they gate source-dependent claims from T03 on, not T01.

## Not run / failed / blocked

- Packaged inspector CLI as-is: exit 2 (packaging-file precondition; worked around with documented wrapper).
- tsx runner in sandbox: EPERM (environmental; lead/CI runs tsx, sandbox runs node --test).
- Desktop/mobile screenshots + synthetic-state export fixtures: NOT RUN (no browser). Prior plan screenshots in baseline/screenshots/ remain comparison-only evidence.
- Real-URL/HTTP behavior: NOT RUN in T00 (no browser/served-course test yet; T01 covers data/behavior seams, T23 the full matrix).

## Next safe step

T01 (tests only): add scripts/tests/aboriginal-studies-30-parity.test.ts + fixtures under scripts/tests/fixtures/ab30-parity/ asserting MAP01/MAP02/STATE02/COMP01/COMP02 desired behavior (red on this baseline) plus a green MAP03 ID/order guard; run via node --test (sandbox) and record tsx as lead-verified. Writer stopped: no — proceeding to T01 per user authorization to execute T00+T01.
