# Ticket T23 completion record

Status: IMPLEMENTED (regression ledger closed; capacity numbers recorded; tree reconciled and green)
Baseline commit/source hashes: dirty overlay continues from the T22 record; this ticket changes only scripts/tests/aboriginal-studies-30-route.test.ts (ROUTE07 rewritten for the kept nav structure), regenerates meta/ab30-parity/asset-manifest.json + media-ledger.json, and adds meta/ab30-parity/T23-run.log + this record. No workspace production code touched by this session in T23. No Biology/Chemistry/brand files touched.
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20 + T21 + T22 + T23 (uncommitted by contract). An external writer's nav rewrite (kept per owner decision, see below) is part of the overlay. No lesson, prompt, assignment, stored-work, or completion semantics changed. No new compulsory workload, auto-grades, or LMS claims.
Writer/approved scope: regression verification + capacity measurement + reconciliation of the T22 anomaly (queue allowedScope). Shell-failure fixes and content-shape fixes are lead/teacher-owned, recorded not taken.

## Regression ledger

Full battery `node --test scripts/tests/aboriginal-studies-30-*.test.ts`: 117/118 pass. Log: meta/ab30-parity/T23-run.log.

- The 1 red is `aboriginal-studies-30-shell.test.ts` failing to LOAD under plain node (imports extensionless `../lib/projects.js`; needs tsx). tsx cannot start in this sandbox (IPC listen EPERM), so the repo-convention run is lead/CI-owned.
- Via an esbuild-bundle workaround the shell suite loads and shows 3 PRE-EXISTING failures, none introduced by T10–T23 work (verified first-hand 2026-09-23):
  1. `>Course Overview</button>` (capital O) vs shell `Course overview` — stale casing assertion. Owner: lead (test-only fix).
  2. `Work\+Sans` expected in index.html — directly contradicts the completed, contracted T21 CDN removal; production is correct, test is stale. Owner: lead (test-only fix; must NOT re-add the font).
  3. Every course-data lesson `body[]` >= 2 paragraphs — content-shape gap. Owner: teacher/lead via T11-gated content tickets (T12/T13/T15/T17/T19).
- Disposition: all three recorded as known failures with owners. This session deliberately did NOT edit the shell suite or course-data to chase them (test-semantics and content decisions belong to lead/teacher).
- T22-anomaly reconciliation (owner decision 2026-09-23: KEEP EXTERNAL): the external `renderThemeSubnav` rewrite (nav-theme-contents + `Lessons (N)` disclosure + Written-assignments shortcut + title stripping) was verified self-consistent — `gotoThemeWritten`, `themeAssignments`, `themeTab` state, both data attributes, and all three CSS classes resolve — then adopted: ROUTE07 rewritten to assert the kept structure honestly (theme button → theme contents nesting order, count disclosure open on lesson routes, lesson links, written shortcut, exactly-one aria-current). Route 8/8 + assets 4/4 re-verified on the kept code; manifest regenerated for the new bytes.
- `course:doctor -- --project aboriginal-studies-30`: PASS (legacy-snapshot-v1, declared; run via esbuild bundle for the tsx EPERM reason above).

## Capacity numbers (measured 2026-09-23, scratch script /tmp/t23_capacity.js)

- Shipped payload: 92 files / 137,188,626 bytes (130.8 MiB). Dominated by library PDFs: textbook.pdf 71.8 MB + 7 chapter PDFs 4.7–11.8 MB each. Code shell is small (main.js 160,752 B; course-data.js 348,158 B). T24 host input: any host/LMS size cap must be checked against ~131 MiB, not against the code.
- Inventory (real data files): 4 units / 50 lessons / 12 assignments / 12 library items / 20 film items / 7 practice modes (AB30PracticeData.MODES). course-data carries no inline quizzes array (quizzes live behind the practice engine + MODES).
- Learner-storage headroom: 56 text-answerable scan hits across course data; worst case (every field filled to 5,000 chars) = 280,495 bytes = 0.27 MiB of the ~5 MiB localStorage quota. Comfortable headroom; no quota-mitigation work needed.
- Render smoke (vm seam over real code): route-announcement text for all 50 lessons in 1 ms. No perf risk in the T22 announcer path.
- Quota/browser halves (real-device load timing, real-quota behavior, print output): NOT measured here — need a browser/host (T24 inputs).

## Learner-work impact

None: no store/data changes in T23. Reconciliation kept all routes, IDs, gating, aria-current behavior, and saved-answer keys.

## Content/source review

No content touched. The lesson-`body` content gap (shell failure 3) is enumerated but untouched — T11-gated.

## Not run / failed / blocked

- `npx tsx --test` (repo convention, all suites incl. shell): NOT RUN — tsx IPC EPERM in this sandbox; lead/CI verification needed.
- Shell suite 3 pre-existing failures: FAILED pre-existing, dispositioned to lead/teacher above, not caused by this plan.
- Browser halves (T22 manual protocol, real load/quota/print): NOT RUN — human-owned.
- Nothing blocked.

## Next safe step

T24 (host export + LMS candidate tests): build the static host candidate from the T21 allowlist, verify byte-completeness + offline behavior statically, and stage (not publish) the LMS candidate with its size/shape report. No deploy, no LMS upload, no auto-grade claims — staging + evidence only. T12/T13/T15/T17/T19 remain BLOCKED on the T11 teacher gate; T14/T16/T18 wording stays BLOCKED on official booklets.
