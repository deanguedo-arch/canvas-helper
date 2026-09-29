# Ticket T22 completion record

Status: IMPLEMENTED (automated halves green; human halves issued as protocol, NOT self-cleared)
Baseline commit/source hashes: dirty overlay continues from the T21 record; this ticket adds the route-announcer node in workspace/index.html, routeAnnouncementText/announceRoute + per-render wiring in workspace/main.js, comparison-table overflow + focus-visible + reduced-motion + visually-hidden CSS facts in workspace/styles.css, scripts/tests/aboriginal-studies-30-a11y.test.ts, and meta/ab30-parity/T22-manual-protocol.md. Asset manifest + media ledger regenerated for byte drift. No Biology/Chemistry/brand files touched.
Dirty-overlay/diff digest: cumulative overlay covers T01–T11 + T14/T16/T18-partial + T20 + T21 + T22 (uncommitted by contract). No lesson, prompt, assignment, stored-work, or completion semantics changed. No new compulsory workload, auto-grades, or LMS claims.
Writer/approved scope: shell a11y/reponsive repairs + automated halves + manual protocol (queue allowedScope). No teacher/lead gate in this ticket; human halves stay human-owned.

## Changed files and actual changes

- workspace/index.html: added `<p id="route-announcer" class="visually-hidden" role="status" aria-live="polite">` next to the existing save-status announcer. No other shell changes.
- workspace/main.js: new T22 block — pure `routeAnnouncementText(activeState)` (Lesson/Theme/Assignment/surface names) + DOM writer `announceRoute()`, called after every render in the render dispatcher. Try/catch guarded; returns '' when no document.
- workspace/styles.css: `.comparison-table { overflow-x: auto }` (tables scroll inside their figure, never trap the page); `:focus-visible` styling; `@media (prefers-reduced-motion: reduce)` block; `.visually-hidden` helper.
- scripts/tests/aboriginal-studies-30-a11y.test.ts (new): A11Y01 (accessible-name audit over real consent/conflict/evidence renders), A11Y02 (route announcements via real routeAnnouncementText + dialog focus wiring + focus/motion CSS facts), A11Y03 (viewport/narrow/table/print CSS facts), A11Y04 (comparison tables headed/scoped). Import-free, sandbox-runnable.
- meta/ab30-parity/T22-manual-protocol.md (new): HUMAN-ONLY protocol for widths (1440/768/390/320 + 200%/400% zoom), keyboard, screen reader, motion. Results blank by contract; executor must not fill them.
- meta/ab30-parity/asset-manifest.json + media-ledger.json: regenerated (`node scripts/as30-asset-manifest.js`) after main.js byte drift.
- In-flight teacher request (review-set-v4, same session): lessons removed from the standalone "Lessons" disclosure and listed directly under each theme in `renderThemeSubnav` (main.js); `lesson-nav-group` hook class kept on the new wrapper; ROUTE07 assertion updated to the new structure + explicit no-`Lessons`-disclosure check. Same pattern covers lessons 2/3/4 (single shared renderer). Evidence at implementation time: route suite 8/8, doctor PASS (see below).
- ANOMALY 2026-09-23 ~14:44–14:46 MDT (RESOLVED by owner decision same session): an external writer (not this session) replaced the flat-list nav with `nav-theme-contents` + `nav-lessons` disclosure (`Lessons (N)` summary) + Written-assignments shortcut + title stripping. Owner chose KEEP EXTERNAL. ROUTE07 rewritten to assert the kept structure honestly (theme button → theme contents → count disclosure + written shortcut; nesting order asserted); manifest regenerated; route 8/8 + assets 4/4 re-verified on the kept code. Teacher request now satisfied as "lessons nested under the theme block" rather than "no disclosure". See T23 record.

## Evidence

- `node --test scripts/tests/aboriginal-studies-30-a11y.test.ts`: 4/4 pass. Log: meta/ab30-parity/T22-run.log.
- `node --test scripts/tests/aboriginal-studies-30-route.test.ts`: 8/8 pass (covers the teacher nav change).
- `node --test scripts/tests/aboriginal-studies-30-assets.test.ts`: 4/4 pass after manifest regen.
- Full battery same session: 117/118 green under plain `node --test`. The 1 red is `aboriginal-studies-30-shell.test.ts`, which cannot load under plain node (imports extensionless `../lib/projects.js`; needs tsx). Via an esbuild bundle workaround the shell suite loads and shows 3 PRE-EXISTING failures unrelated to T22 or the nav change (verified first-hand, none touch lesson nav or T22 code):
  1. expects `>Course Overview</button>` (capital O) vs shell `Course overview` — stale casing assertion;
  2. expects `Work\+Sans` in index.html — directly contradicts the completed T21 CDN-removal decision (stale test, production is correct per contract);
  3. expects every course-data lesson `body[]` to have >= 2 paragraphs — content-shape gap, content work is T11-gated.
  Disposition of all three belongs to T23 regression triage (lead-owned); none were introduced or worsened by T22.
- `course:doctor -- --project aboriginal-studies-30`: PASS (driver legacy-snapshot-v1, declared; run via esbuild bundle because tsx IPC is EPERM-blocked in this sandbox — same environmental limit recorded in T21).
- `node --check` main.js: SYNTAX_OK (implicit in suites slicing the real file).
- Caught and fixed during T22: (1) ASSET05 staleness after main.js edits → manifest regen; (2) shell suite unloadable under plain node → bundle workaround used for triage evidence only.

## Learner-work impact

None: no store/data changes. Announcer writes text to a polite live region only; CSS changes are overflow/focus/motion facts. Nav change alters sidebar grouping only — routes, IDs, gating, aria-current, and saved answers untouched.

## Content/source review

No content touched. No sources added or removed. Media-permission posture unchanged from T21 (ledger `unverified` where no human confirmed).

## Not run / failed / blocked

- T22-manual-protocol.md human halves (widths/keyboard/screen-reader/motion on a real browser): NOT RUN — human-owned, recorded as pending. No conformance claimed.
- `npx tsx --test` (repo convention): NOT RUN — tsx IPC EPERM in this sandbox; lead/CI verification needed.
- Shell suite 3 pre-existing failures (above): FAILED pre-existing, triaged to T23, not caused by T22.
- Nothing blocked.

## Next safe step

T23 (regression + capacity verification) is next: full-battery confirmation, disposition of the 3 pre-existing shell failures with lead, capacity/load checks over the real workspace, and browser halves that don't need teacher content approval. T12/T13/T15/T17/T19 remain BLOCKED on the T11 teacher gate; T14/T16/T18 wording stays BLOCKED on official booklets.
