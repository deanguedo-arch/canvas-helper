# Ticket T24 completion record

Status: IMPLEMENTED (staging + static verification only; no upload, no LMS claim)
Baseline commit/source hashes: dirty overlay continues from the T23 record; this ticket adds projects/aboriginal-studies-30/exports/brightspace/ (97 files) + projects/aboriginal-studies-30/exports/aboriginal-studies-30-brightspace.zip (193M) via the REAL exporter, updates meta/studio-export-evidence.json (exporter-written evidence, honest), and adds meta/ab30-parity/T24-run.log + this record. meta/project.json was snapshotted before the run and RESTORED after (see stamp note). No workspace production code touched. No Biology/Chemistry/brand files touched.
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20–T24 (uncommitted by contract). No lesson, prompt, assignment, stored-work, or completion semantics changed. No new compulsory workload, auto-grades, or LMS claims.
Writer/approved scope: stage + statically verify the host/LMS candidate (queue allowedScope). Upload, LMS import testing, and release approval are human-owned and NOT performed.

## Staging run

- Command (real exporter, tsx replaced by a loader shim — tsx IPC is EPERM-blocked in this sandbox; shim at /tmp/ts-register.mjs + /tmp/ts-resolve-loader.mjs resolves tsx-style `.js`→`.ts` specifiers under plain node with native type-stripping):
  `node --import /tmp/ts-register.mjs scripts/export-brightspace-package.ts --project aboriginal-studies-30`
- Result: `Packaged "aboriginal-studies-30" to .../exports/aboriginal-studies-30-brightspace.zip (97 file(s) copied to .../exports/brightspace).`
- No `--accept-deviations` flags passed: the authoring-deviation preflight PASSED on its own. No gate was self-cleared.
- Approval-stamp note: the exporter stamps `workspaceApprovedAt`/`updatedAt` into meta/project.json on every run. Review has NOT happened, so the snapshot was restored byte-identical after staging (verified by diff: only the two timestamps differed). The candidate is staged, not approved.

## Verification (all first-hand, see T24-run.log)

- Byte fidelity: `diff -r workspace exports/brightspace` → identical except the added `export-report.md`. Nothing missing, nothing altered.
- Zip integrity: `unzip -t` → "No errors detected". 110 zip entries (97 files + report + directory entries), 192,105,655 bytes uncompressed.
- Entry point: `index.html` (3,800 B) + `export-report.md` at package root.
- Absolute-path scan over html/js/css in the package (`file:///`, `/Users/`, `C:\`): ZERO hits. Portable.
- Sizes: export dir 200M, zip 193M. Payload dominated by library PDFs (textbook 71.8M + chapters), same as T23.
- External-dependency correction: the generated report lists 6 https URLs and warns about "external CDN resources". Verified role of each: 4× Google Docs `/copy` links are assignment-handout copy-templates (plain `<a>`, intentional workflow); globalnews.ca + nsi-canada.ca are cited sources in source-pages (plain `<a>`); YouTube URLs exist only as JS strings behind the T21 consent facade. Zero `src="http`, zero stylesheet/script `@import`/`url(http)`, zero http refs in index.html or CSS. The "CDN" warning is boilerplate — accurate posture is "content links only, zero render dependencies". Lead may reword the template; not changed here (out of scope).
- Allowlist gap (finding, not fixed): the exporter copies the whole workspace WITHOUT applying the T21 allowlist, so the candidate carries 6 extra files: 3 `.DS_Store` (harmless), `assets/assignments/docx/Archive.zip` (448K), `assets/library/Archive.zip` (52M), + the report. The Archive.zips are inert (unreferenced backups) but add 52.4M. Trim-before-upload is a lead decision — recorded, not taken.
- Shell suite, proper run via loader: 8/11 pass; the same 3 pre-existing failures from the T23 ledger (stale casing, stale Work+Sans, lesson-body content gap). Triage stands; owners unchanged.
- `course:doctor -- --project aboriginal-studies-30` via loader: PASS (legacy-snapshot-v1, declared).

## Learner-work impact

None: export is a copy. No store/data changes.

## Content/source review

No content touched. Candidate content is the current workspace byte-identical, including T11-gated draft state and `unverified` media permissions — the candidate must NOT be presented as reviewed or approved.

## Not run / failed / blocked

- Brightspace/LMS upload and in-LMS import/render testing: NOT RUN — human-owned, requires a host (explicit contract constraint).
- Browser load of the staged candidate (file:// + http-server): NOT RUN — needs a browser; covered by the T22 manual protocol at rollout.
- Real `tsx` runs (repo convention): NOT RUN — sandbox EPERM; loader-shim runs used instead (same code paths, tsx's own IPC being the only bypassed component).
- Nothing failed; nothing blocked.

## Next safe step

T25 (final review + handoff packet): assemble the T10–T25 completion map, the exact pending-human-decisions list (T11 approval, booklets, novel 4.3, manual protocol, shell-triage fixes, upload/approval), and the rollout evidence index. Then the goal's final list is delivered and remaining work is explicitly human-owned.
