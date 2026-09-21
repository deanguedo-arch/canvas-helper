# Math 10C Chapter 3 — repair candidate v0.5

This is an **edited local review candidate**, not a learner release or an installed Canvas Helper project. It preserves all eight lessons, the science-course presentation, original learner question IDs and the original M01–M30 corpus. New migration/catalog files preserve v0.4 saved work before ten additional authored activities are registered.

## Read first

1. `docs/BUILD_REPORT.md` — actual edits, checks and limits.
2. `docs/CAPACITY_DECISION.md` — current limits unchanged; capacity fit remains unresolved.
3. `docs/CONFIDENCE.md` — evidence categories, not a confidence percentage.
4. `docs/CODEX_HANDOFF.md` — separately executed repository/re-audit gates.

## Local preview

From this directory serve **only the canonical workspace**, for example:

```sh
python -m http.server 8000 --bind 127.0.0.1 --directory workspace
```

Open localhost port 8000 in your browser. The rebuilt `Math10C_Chapter3_Reconciled.html` is an equivalent single-file review artifact. A context that does not offer exclusive Web Locks is deliberately read-only; it will not silently use an unsafe localStorage lease. The execution host used for this repair blocked URL navigation, so native-origin preview behavior is a named external recheck—not a claimed pass.

No teacher/assignment routes are invented. Reports/downloads are not submissions. Browser-local preview saves are not cross-device LMS saves. Keep unsaved work open and use labelled recovery if a failure occurs.

## Re-run locally executable checks

```sh
export NODE_PATH="$(npm root -g)" # only if TypeScript is installed globally
python tests/repair/run_repair_suite.py
python tests/repair/ui_capacity_print.py
```

Requires Node, TypeScript, Chromium, Python Playwright, SymPy, BeautifulSoup and PyMuPDF for the indicated test/print steps. These are test dependencies, not remotely fetched course dependencies. Full repository tests are NOT represented by this local runner. Native-origin and real-MathLive gates have separate scripts and can return BLOCKED; see the handoff.

## Shared repository patch

`shared-repository/canvas-helper-save-receipts-and-codec.patch` is **UNAPPLIED**. Base/proposed source and file hashes are supplied. A disposable reference-only dry-run/reconstruction passed; no actual repository was changed. `tests/reference/scorm-state-codec.ts` remains unchanged and is not the production repair.

The install helper is read-only. `--apply` fails before any integration write. Use the repository's own scaffold only after separately authorized Gate B work. Do not overlay this folder onto a live checkout.

Historical v0.4 reports and tests are under `historical/`; their results do not describe this candidate. Current evidence is under `evidence/`. The root manifest covers the repaired files; it excludes itself to avoid a self-hash cycle.
