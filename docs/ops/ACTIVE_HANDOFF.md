# Handoff

## Biology 30 Chapters 14–20 labeling image/answer ZIP — 2026-09-18

- Summary: exported the exact 44 current labeling activity images and mappings, grouped by chapter, to `/Users/deanguedo/Downloads/Biology30_Chapters14_20_Labeling_Images_and_Answers_2026-09-18.zip`. Six diagrams each in 14–19; eight in 20. SHA256: `cb7dd542c2aacda5282b84836fa999fac054a1f4b3f909a8e7de97d4473b6b83`.
- Files changed: new scoped `scripts/package-biology30-labeling14-20.mjs`, this operational handoff, and requested Downloads ZIP. No course, runtime, deployment or student data changed.
- Contents/verification: 44 exact originals, 40 additional PNG renderings of SVGs, 44 individual Markdown keys, master key, JSON manifest, start guide and checksums. Authoring mappings equal current embedded runtime mappings; original copy hashes match; ZIP CRC and every checksum entry passed.
- Source of truth: chapter-specific `workspace/index.html` embedded course-data and matching `meta/external-generation/authoring/course-config.json`, `labelDiagrams` entries; each referenced `workspace/assets/labeling/**` image. The exported keys are current course answers, not a new independent science audit.
- Risks/fragile areas: keep label letters, activity IDs and image/key pairings intact; PNGs are convenience renderings, not corrected replacements. Independent scientific/leader-line review remains separate.
- Next prompt assumptions/action: user can upload this ZIP for review; await requested audit corrections. Previous local overview edits remain undeployed; this export does not authorize deployment or promotion.
- Exact next file: extracted `Biology30_Chapters14_20_Labeling_Images_and_Answers/START_HERE.md`.

## Biology 30 Chapters 14–20 overview alignment — 2026-09-18

- Summary: replaced the new chapters' abbreviated overview blocks with the current Chapter 12/13 overview recipe. Local previews and portable files updated; live site still serves the previous deployment.
- Files changed: seven canonical workspace overview sections and portable assemblies; `scripts/align-biology30-overviews14-20.mjs`; Chapter 14's canonical `meta/external-generation/authoring/templates/overview-current.html`, owning `scripts/build_chapter.py`, and project metadata; assembly receipts. Existing Chapters 11–13 and Chemistry unchanged.
- Verification: focused local Chromium inspection confirmed identical five-block class sequence, three metadata counts, two Begin buttons and all 86 chapter-specific roadmap links resolve. Chapter 14/reference Chapter 12 desktop screenshots compared and Chapter 14 phone inspected without horizontal overflow. Portable files refreshed through their supplied owners. No broad state/E2E/LMS suite rerun for this presentation-only edit.
- Source of truth: each `projects/biology30-chapter-N/workspace/index.html` overview; Chapter 14 regeneration additionally reads `authoring/templates/overview-current.html`. The alignment adapter reads Chapter 12 as reference and retains every non-overview canonical byte during replacement. Chapter-specific outcomes and lesson names retained; explanatory summaries adapted to each chapter. UI skill preserved the established reference, without CSS/font redesign.
- Risks/follow-up: full rollout checks and live verification deferred until redeployment is requested. Prior deployment receipt remains historical live evidence, not evidence that this edit is hosted. Teacher/science/Studio/Brightspace deferred boundaries remain unchanged.
- Fragile areas: native question/check/save IDs unchanged; roadmap completion hooks use each existing lesson route. Do not regenerate Chapter 14 without its current overview template or treat portable output as canonical.
- Next prompt assumptions/action: review local overview changes; await a scoped redeploy request. Do not auto-deploy, commit, package or promote blocked authoring status.
- Exact next file: `projects/biology30-chapter-14/workspace/index.html` at `#overview`.

## Biology 30 Chapters 14–20 deployed for review — 2026-09-17

- Summary: added Chapters 14–20 to the established `https://biology30pilot.web.app` review library. Eleven picker choices: Biology 11–20 plus unchanged Chemistry. Review-only publication; imported authoring/release statuses remain blocked.
- Files changed: `scripts/deploy-biology30-current-review.mjs`; canonical wrapper `projects/biology30-unit-a-pilot-2/meta/review-selector/index.html`; `scripts/tests/biology30-current-review-live.mjs`; deployment receipt and seven integration receipts; this handoff and integration report. No teaching HTML, CSS, fonts, answer IDs or save namespaces changed by deployment.
- Verification: all 1,652 staged content files matched live bytes on the first release. Final wrapper-only correction reused 1,651 unchanged verified hashes and rechecked the changed wrapper. Existing Biology 11–13 and Chemistry files matched the live site before publication. Final live Chromium run passed all seven new chapter lesson/font/textbook-draft-reload/labeling/vocabulary paths; eleven selector options; zero page errors or missing local responses on inspected paths. External media intentionally excluded.
- Source of truth: new chapter canonical workspaces and supplied assembly owners; review wrapper above; `projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json` records actual hashes/target and browser evidence. Full source/fragile-area handoff: `docs/ops/BIOLOGY30_CHAPTERS14_20_INTEGRATION.md`.
- Risks/deferred: public teacher-review URL, browser-local photos only, independent science/crop/teacher acceptance, school video access, Studio readiness, SCORM and Brightspace certification. Preserve required-only progress, immutable attempts, stable IDs and canonical/portable ownership. Removed an unused hidden wrapper logo reference that returned 404; no design change.
- Next assumptions/action: review the hosted chapters and await scoped corrections or Brightspace preparation. No commit, export, Studio promotion or learner-release authorization inferred.
- Exact next file: `projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json`.

## Biology 30 Chapters 14–20 integrated locally — 2026-09-17

- Summary: imported all seven returned chapters as separate blocked generated-course projects. Local and portable previews are usable; existing Biology 11–13 and Chemistry preserved. Full handoff: `docs/ops/BIOLOGY30_CHAPTERS14_20_INTEGRATION.md`.
- Files/source: seven canonical workspaces/metas; scoped integration/portable-refresh/receipt scripts; two local verification harnesses. Source archives retained under incoming staging, authoring/assembly owners preserved in each `meta/external-generation`.
- Fixes: native textbook draft flush on leave/reload, 760px navigation breakpoint parity, idempotent Chapter 14 labeling wording patch. Frozen CSS/fonts unchanged; portable assemblies refreshed.
- Verification: 133 final native-origin groups passed, including browser restart, resets, save conflicts, quota failure and offline portable saving. Workspace verification passed for all seven. Supplied suites and 165 source-package static science assertions are separately recorded with their evidence limits. Representative screen/print renders inspected; see per-chapter receipts for exact final counts.
- Risks/deferred: comprehensive crop/science/teacher acceptance, school video access, Studio readiness/editability, SCORM packaging and Brightspace testing. No deployment, release, promotion or LMS certification inferred.
- Fragile areas: stable native save/question/option IDs, immutable attempts, required-only progress, config-to-assembly ownership. Never use a legacy builder over these canonical sources or treat portable files as editable sources.
- Next assumptions/action: review locally; await scoped audit or rollout request. Exact next file: `projects/biology30-chapter-14/workspace/index.html`.

## Sports Wellness Phases 2–4 imported working previews — 2026-09-17

- Summary: imported returned ChatGPT Pro folders under separate sportswellness-phase-2/3/4 slugs; all blocked, Studio Edit and SCORM export disabled. Original Sports Wellness, Phase 1 and unrelated Biology/Chemistry preserved.
- Files changed: three new canonical workspaces/metas; scripts/lib/importer.ts inert JSON/import-map separation; scripts/tests/import-inert-metadata.test.ts; scripts/tests/sportswellness-phases234-integration.cjs. Source archive and historical evidence preserved in scoped incoming staging.
- Verification: 607 source-package hashes/ZIP CRC; importer metadata regression and existing React-import checks; focused real HTTP/file navigation/state/backup/checkpoint/notes/game/print checks passed. First Learn topic desktop/phone views inspected in every phase; drawer checked. See each meta/integration-checks.json for actual limits.
- Source of truth: each workspace/index.html, runtime.js, full current Phase 1 styles.css, local canonical games/diagrams. Incoming developer/reference and meta/source-review are upstream evidence, not current proof. Full nine-part handoffs: each meta/integration-handoff.md.
- Risks/fragile areas: response maximum now 780,000 characters per phase plus history versus recorded 60,000 bridge capacity; no truncation. File-protocol origins normalized while exact source/session checks retained. Recover PDF/utility regeneration adapters. Preserve stable fields/content versions.
- Deferred: full-route parity/E2E, Studio readiness/lifecycle, actual browser shutdown, physical devices/assistive technology, PDFs/print dialogue, school media, student pilot/teacher evidence mapping, SCORM/Brightspace. Intro/final/replacement slides remain separate.
- Next assumptions/action: review current three workspaces locally; no packaging/deploy/promotion inferred. Exact next file to open: projects/sportswellness-phase-2/workspace/index.html#course-guide.

## Original Sports Wellness generation source archive — 2026-09-17

- Summary: requested unchanged original full-course sources/assets packaged for ChatGPT to generate remaining phases. ZIP: `/Users/deanguedo/Downloads/SportsWellness_Original_All_Phases_Generation_2026-09-17.zip` (178,192,605 bytes; 137 files; SHA256 `027ad0c5b8a10814262254879c17f37af8c3c2613aa79db5abbb9368b26c5680`).
- Files changed: this operational handoff only; archive created in Downloads. Original Sports Wellness and Phase 1 workspaces unchanged.
- Verification: all 94 original copied source hashes matched; full ZIP CRC and archive checksum manifest passed.
- Source of truth: `projects/sportswellness/workspace/**`; earlier raw baseline and metadata included separately. Historical supplied handoff extracted as reference, including all-phase inventories and video catalog.
- Risks/follow-up and fragile areas: original runtime contains teaching content in JavaScript, external CDN/video dependencies remain external, historical handoff instructions/approval flags may be outdated. Existing Phase 1 repairs are not substituted for original material. No SCORM, learner, Studio or Brightspace checks run for this archive.
- Next prompt assumptions/action: user uploads this source ZIP to ChatGPT; read `START_HERE.md` first and generate Phases 2–4 separately with source/asset maps. No deployment or original-course rewrite inferred.
- Exact next file to open: extracted `SportsWellness_Original_All_Phases/START_HERE.md`.

## Sports Wellness Phase 1 CTS audit repairs — 2026-09-17

- Repeated workflow audit: incoming text exactly matches the earlier pre-repair audit. Current fixes retained; added visible activity jumps on all 12 topics, with desktop/phone field/lab click inspection passed. Record: `projects/sportswellness-phase-1/meta/repeated-audit-reconciliation.json`. v1 audit ZIP remains intact and predates these links; packaging and rollout still require their scoped request.
- ChatGPT audit snapshot: `/Users/deanguedo/Downloads/SportsWellness_Phase1_Post_Audit_Repairs_2026-09-17_v1.zip` (8,354,965 bytes; 64 files). One extracted folder with `START_HERE.md`, current workspace/assets/game, contracts/handoff, focused check sources and clearly separated historical references. Copied-source hashes, full ZIP CRC and every checksum entry passed. Receipt: `projects/sportswellness-phase-1/meta/chat-audit-package.json`. This is an audit snapshot, not SCORM packaging or rollout.
- Summary: usable local preview repaired for collection, checkpoint, recovery, figures, practice equivalence and original-game lifecycle/feedback. Keep release blocked; no deployment or SCORM changes.
- Files/source: `projects/sportswellness-phase-1/workspace/**` and focused metadata/tests. Full nine-part handoff: `projects/sportswellness-phase-1/meta/cts-audit-repair-handoff.md`.
- Verification: inventory/blocked-boundary static check and focused local Chromium defect harness passed; tablet and phone affected views inspected. Broad E2E, Studio/readiness, physical devices, external-media access and Brightspace deferred.
- Risks/fragile areas: retained save IDs, checkpoint r2 historical-score separation, exact iframe messaging, generated bundle ownership; unreconciled PDFs withheld; response capacity exceeds bridge.
- Next assumptions/action: review locally, authorize a planned rollout batch later. Preserve unrelated Biology/Chemistry work and prior handoffs below. No package/deploy/promotion inferred.
- Exact next file to open: `projects/sportswellness-phase-1/workspace/index.html` at `#course-guide`.

## Biology post-correction ChatGPT audit ZIP — 2026-09-17

- Summary: created one-folder snapshot of current Biology Chapters 11–13 for a second ChatGPT audit. Output: `/Users/deanguedo/Downloads/Biology30_Chapters_11_12_13_Post_Audit_v8.zip` (423,015,267 bytes). Earlier audit ZIP preserved; Chemistry excluded.
- Files changed/source: updated `docs/ops/BIOLOGY30_CHATGPT_AUDIT_README.md`; archive includes current canonical workspaces, runtime/build sources, specifications, review metadata/correction report, current deployment receipt and all three review SCORM ZIPs. Root `START_HERE.md` and generated `SHA256SUMS.txt` identify the snapshot and audit scope.
- Verification: source hashes checked during copying; full ZIP CRC integrity passed; one top-level folder, current Chapter 12/13 audit configuration, all five corrected image bytes and three review-package entries verified. Initial inspection buffer was too small for embedded textbook HTML; increased-buffer check completed.
- Known risks/deferred: audit snapshot only, not teacher acceptance or Brightspace certification. Original supplied images remain provenance; audit active corrected asset references, not unused originals. Browser-local student saves are not included.
- Fragile areas: canonical HTML/runtime ownership, native save/answer identities, immutable first results, optional-versus-required progress, exact teaching prose and Chapter 13 lesson 7 placement.
- Next prompt assumptions/action: user uploads this ZIP to ChatGPT, starts with `START_HERE.md`, and returns an itemized second audit before further edits. No broad rewrite or additional deployment inferred.
- Exact next file to open: `docs/ops/BIOLOGY30_CHATGPT_AUDIT_README.md`.

## Biology audit corrections deployed — 2026-09-17

- Summary/status: published current Chapters 11–13 audit corrections to the existing shared teacher-review site, `https://biology30pilot.web.app/?v=20260917-8`. Chemistry's live files were preserved unchanged. No learner-release/authoring promotion or Brightspace upload.
- Files changed: selector cache version; new scoped deployment owner `scripts/deploy-biology30-current-review.mjs`; current deployment receipt; showcase workflow documentation and handoff.
- Source of truth: canonical three Biology workspaces; unchanged Chemistry workspace; selector `projects/biology30-unit-a-pilot-2/meta/review-selector/index.html`. Receipt `projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json` includes current hashes, 688 files and live browser results.
- Verification run: all four workspace verifications passed; Chemistry live-byte guard passed; Firebase deployment completed; all 688 staged selector/course files matched live SHA-256. All four browser selector paths populated without page errors. Chapter 11 lesson-first guidance verified live; Chapter 12/13 audit version/varied choices and all five corrected PNGs loaded; detailed ear legend present.
- Known risks/deferred: review-only publication, not teacher acceptance, Studio certification, SCORM certification, Brightspace testing or learner release. Corrected artwork still needs teacher review. Earlier course checks are in the audit correction report.
- Fragile areas: preserve fixed course IDs, browser-local namespaces and selector local fallbacks. Do not run the historical A/B/C/D deployment over this four-course site. The new Biology-only deployment owner refuses a changed Chemistry publish.
- Next prompt assumptions: review current live pages; keep source ownership and existing progress/save contracts. No further broad rewrite or deployment expansion inferred.
- Exact next action: await requested reviewer changes or separately requested Brightspace sandbox testing.
- Exact next file to open: `projects/biology30-unit-a-pilot-2/meta/review-selector-deployment.json`.

## Biology Chapters 11–13 audit correction pass — 2026-09-17

- Summary/status: immediate audit corrections complete as a local review candidate. Balanced all 40 guided/six transfer answer positions, strengthened six transfer distractor sets, corrected five supplied raster targets, taught cochlear chamber terms and aligned Chapter 11 lesson-first instructions. Exact Chapter 12/13 teaching prose and stress worksheet retained; Chemistry unchanged.
- Files changed/source of truth: canonical Biology workspace HTML/main.js and five corrected PNG siblings; shared revision-activities and new audit-corrections.mjs; revision/portable owners; Chapter 11 instruction-only owner. Full file/provenance/prompt list: `docs/ops/BIOLOGY30_AUDIT_CORRECTIONS.md`.
- Verification run: new actual-HTML balance/legacy-choice browser test passed both chapters; instructional regression passed both; five selected images visually inspected; corrected desktop/mobile panel captures inspected; all three review-only SCORM ZIPs refreshed and integrity checked; two actual Chapter 12/13 package cases passed simulated resume/failure checks.
- Known risks/deferred: independent teacher review of corrected artwork and live Brightspace testing remain. No deployment, commit, production promotion or universal Studio/accessibility proof. Original raster assets and earlier audit ZIP remain historical snapshots.
- Fragile areas: keep native namespaces/answer identities, immutable old transfer submissions, required check IDs/progress, native SCORM conflict/failure handling and Chapter 13 lesson 7 worked/guided-before-failure sequence. Correct vocabulary distinctions are not false misconception statements.
- Next prompt assumptions: retain exact prose; do not inflate the question bank or broaden Chapter 11 final assessment without a separate request. Do not rerun original imports/builders over canonical workspaces.
- Exact next action: test refreshed review candidate in a Brightspace sandbox when requested.
- Exact next file to open: `docs/plans/biology-chemistry-brightspace-scorm.md`.

## Biology photo-upload controls removed

- Summary: removed Add photo/file inputs and Replace photo controls from Biology Chapters 11–13. Updated practice instructions to describe written work and teacher-directed paper submissions. Existing photo records/blob databases/viewing/removal and all saved-answer IDs retained. Chemistry unchanged.
- Files/source of truth: shared `scripts/lib/biology30-chapters/textbook-practice.js`, owning integration markup, three canonical workspace HTML files; Chapter 11 bundle rebuilt with esbuild, Chapter 12/13 asset copies and portable pages refreshed through their owner.
- Verification: changed-area browser rendering inspected for all three practice panels; upload controls absent and writing/Save question work present. No broad tests or readiness claims.
- Known risks/deferred: existing SCORM review ZIPs still contain the old controls until explicitly repackaged/reuploaded. LMS/course/Studio rollout suites deferred. Old local photo blobs remain browser-specific; no cloud-photo integration pursued.
- Fragile areas: preserve stable question/state/photo IDs and old records; shared renderer/integration owner must not recreate upload controls.
- Next assumptions/action: user can refresh workspace previews; when requested, rebuild the Chapter 12 review ZIP and replace the sandbox package. No deployment/exports/other-course expansion in this edit.
- Exact next file: `scripts/lib/biology30-chapters/textbook-practice.js`.

## EIPS Chapter 12 single photo pilot — follow-up

- Summary: user narrowed current pilot to Chapter 12. Regular Chrome → incognito restored written response but showed saved-photo filename/unavailable bytes; local photos are not portable yet. EIPS URL confirmed: https://eips.brightspace.com/.
- Files changed/source of truth: rollout plan and this handoff only. No course/package rebuild or external writes.
- Verification: read-only authenticated home/admin-menu inspection; All-tools searches for OAuth and Extensibility showed no results for this account. Organization capabilities remain unconfirmed.
- Known risks/fragile areas: available admin menu is not proof of absent API support; no approved current-learner OAuth flow or pilot submission folder identified. Existing browser-local photo remains in original Chrome profile.
- Next assumptions/action: use Chapter 12 only. Obtain EIPS administrator-supported app-registration access, approved authorization flow and actual pilot course/ungraded folder; then connect and test same-learner photo retrieval in incognito. No administrator credential in learner package. Other packages remain deferred.
- Exact next file: `docs/plans/biology-chemistry-brightspace-scorm.md`. Broader release/readiness checks remain deferred as below.

## Biology and Chemistry SCORM implementation — 2026-09-17

- Summary/status: four review-only SCORM 2004 ZIPs built. Shared native state adapters restore writing/practice/history in fresh browsers, derive required completion, bookmark routes and track active time without grades. Existing automatic-saving UI retained. Optional Brightspace photo component implemented and mock-tested; organization authentication is NOT connected, so shipped photos remain browser-local. No release, deployment or authoring promotion.
- Files changed: shared `scripts/lib/scorm.ts`, `scorm-tracking.ts`, new `scorm-state-codec.ts`, exporter/CLI; four workspace tracking contracts and native runtime adapters; shared textbook/photo modules and integration/portable owners; focused unit/browser tests and commands; README/ARCHITECTURE/CONTRIBUTING/tracking workflow/rollout plan. Chapter 11 bundle rebuilt through esbuild, Chapter 12/13 component copies/portable pages through their owners. Per-course `meta/scorm-review-package.json` records ZIP hashes and exact dirty-source fingerprints. Earlier unrelated dirty changes preserved.
- Verification run: 29 focused SCORM/codec/authenticated-photo tests passed; all eight current real-course browser tests passed (four fresh-browser writing restorations, learner isolation, simulated authenticated photo round trip, oversized-save preservation, legacy Chemistry migration). Earlier nine existing shared bridge browser tests passed. Existing textbook regression passed all three chapters: draft/edit/reload/photo/remove/navigation/modal/print/mobile and portable offline images. Native JS syntax and tracked diff checks passed. All four ZIP integrity and packaged source-byte comparisons passed. Repository typecheck still fails on unrelated pre-existing suites/types; no errors name the new SCORM/science/photo files.
- Known risks/follow-up: actual Brightspace saving/completion/time/cross-device behavior unverified. Photo API/OAuth/CORS/destination permissions require organization setup. API mocks do not prove these. These ZIPs include `review-only.json`; blocked statuses/export flags retained. Comprehensive course/Studio/readiness certification, native teacher acceptance and project E2E remain deferred; review packaging does not clear these gates.
- Source of truth: `docs/plans/biology-chemistry-brightspace-scorm.md`; shared protocol/codec and canonical native workspace/runtime owners. Generated ZIPs are derivative, never edit them directly.
- Fragile areas: native state/revision/identity contracts, asynchronous unload flushing, finite suspend-data capacity (preserves local work and last LMS copy rather than trimming). Chemistry original compressed format migrates; old shared envelopes containing only localStorage values are deliberately blocked pending explicit migration. Browser photos are attempt-scoped, not portable without the approved remote adapter. Removing remote references retains submitted Brightspace files.
- Next prompt assumptions: user will test the review candidate in a sandbox topic using existing Brightspace login. Still awaiting organization Brightspace URL and administrator-supported application/API setup. Start with one Chapter 11 question in an ungraded pilot folder; no separate student account, external storage service or privileged credentials in the package.
- Exact next action: upload Chapter 11 `exports/biology30-unit-a-pilot-3-scorm-2004-review.zip` to a sandbox Brightspace SCORM topic; test writing/resume, save failure/retry, completion and time over two sessions. Obtain approved auth callback/destination, then connect the one-question photo pilot and verify real upload/retrieval/other-learner denial before expanding.
- Exact next file to open: `docs/plans/biology-chemistry-brightspace-scorm.md`; photo owner is `scripts/lib/biology30-chapters/brightspace-photo-store.js`.

- Project: repo-wide
- Task: Restore the Studio preview bridge for oversized static HTML course pages.
- Status: validated

## Chemistry reference launcher — 2026-09-17

- Removed sidebar Open reference sheet and hidden top duplicate; retained stable `#reference-launch` / `data-action="reference"` owner. Launcher is a 44px icon fixed bottom right above the save bar; expands to Reference Sheet on hover or keyboard focus. Accessible name is always available; reduced motion respected.
- Canonical source: Chemistry `workspace/index.html`, `main.js` nav renderer, `styles.css`; integration hashes updated. CSS/runtime versioned to bypass observed old browser cache. No rebuild/state change required.
- Verified: rendered right 14px, bottom 54px, compact width 44px; sidebar duplicate absent; keyboard activation opens reference panel. JS syntax/diff check. Requested doctor reports only existing blocked authoring eligibility. Broader responsive/E2E/Studio/LMS/deployment remain deferred.
- Branch/commit before editing: main / ed6dcc2c23c88c245e19dbb6ae190e57c4ffeac4.
- Next action: refresh preview. Next file: Chemistry `workspace/styles.css`, Persistent compact reference launcher section.

## Biology 30 automatic saving presentation — 2026-09-17

- Removed global Save and Exit controls from nine Biology workspace shells: Unit A, Unit A Pilot, Pilot 2, Pilot 3, Units B/C/D and Chapter 12/13. Pilot 3 guides now describe automatic saving. Lesson-completion controls are retained.
- Source owners updated: `scripts/create-biology30-unit-a-pilot-3.ts`, `scripts/lib/biology30-unit-a/v2/runtime.ts`, `scripts/lib/biology30-unit-a-pilot-2/render-gate1.ts`, `scripts/lib/biology30-course/v1/pilot2-presentation-shell.ts`; corresponding workspace HTML shells synchronized. No runtime bundles or answer/state engines changed. Chapter portable shells inherit the updated Pilot 3 base on refresh.
- Checks: no remaining global Save and Exit buttons in affected HTML, visible Pilot 3 guide wording updated, automatic saving handlers retained; targeted diff check passed. No state/schema changes; broad runtime/learner E2E, factory rebuild/certification, deployment and LMS verification deferred.
- Source of truth: direct workspace HTML for direct-owned pilots; listed render owners for generated families. Generated previews received matching shell-only changes without running gated factory builds.
- Fragile areas: required lesson completion buttons remain distinct from global exit; preserve their IDs/behavior. Existing CSS for removed controls is retained to keep this pass narrow.
- Next action: refresh the Biology preview; await next learner change. Next file: `projects/biology30-unit-a-pilot-3/workspace/index.html`.

## Chemistry automatic saving presentation — 2026-09-17

- Removed the shared Save & exit button (desktop sidebar/mobile header) from canonical Chemistry `workspace/index.html`. Work already saves after changes (650 ms debounce), when the page becomes hidden and on pagehide; LMS termination remains on pagehide.
- Retained existing save owner/keys, visible status and failure messages, Save now and Backup. No runtime/state changes required. Existing inert-session exit action remains only for compatibility; no course shell exit button invokes it.
- Files: canonical HTML, integration hash/presentation metadata, this handoff. Check: focused source inspection and diff check; runtime contracts unchanged. Live LMS auto-save/exit proof remains deferred.
- Next action: refresh local preview. Next file: Chemistry `workspace/index.html`.

## Chemistry Save & exit review — 2026-09-17

- Read-only investigation: both buttons use `data-action="exit"` and the canonical `workspace/main.js` delegated handler. Saves through existing browser/LMS owner; stops on save failure; successful LMS exit calls Terminate; successful exit makes the lesson/sidebar inert and displays a confirmation. Tab closing is manual.
- Branch/commit checked: main, ed6dcc2c23c88c245e19dbb6ae190e57c4ffeac4. No learner source edits required.
- Verification: isolated browser preview showed Your session is saved and browser-only save confirmation after clicking Save & exit. Requested course doctor reports only existing blocked authoring eligibility. Live LMS exit remains unverified.
- Next action: await requested learner change. Next file: Chemistry `workspace/main.js`, exit action handler.

## Chemistry title follow-up — 2026-09-17

- Removed Pilot from the sidebar course name, document title and learner footer in canonical `projects/chemistry30-unit-a-pilot/workspace/index.html`.
- Ownership: imported workspace HTML is canonical; no rebuild required. Corrected manifest canonicalSources to existing absolute workspace paths. Preserved project slug, state/course IDs, raw provenance, blocked authoring and rollout gates.
- Branch/commit verified before editing: `main`, `ed6dcc2c23c88c245e19dbb6ae190e57c4ffeac4`; unrelated dirty work retained.
- Requested validation: course doctor initially reported blocked status and malformed relative source paths; source paths repaired. Remaining blocked-status eligibility is deferred authoring readiness, not a missing learner file.
- Files: canonical index HTML; project ownership metadata; integration title/hash; this handoff. Preview title verified by direct source inspection.
- Next action: refresh the local preview. Next file: Chemistry `workspace/index.html`.

## Files changed

- `app/server/routes/preview.ts`
- `scripts/tests/preview-route.test.ts`

## What changed

- Oversized UTF-8 HTML pages now receive the preview bridge even when bounded source inspection is unavailable.
- Added coverage for a page larger than the 8 MB inspection threshold.

## Why this changed

- Biology 30 Chapter 12 is 11.5 MB. Studio coupled bridge injection to optional inspection decoration, which returns no document above 8 MB and caused `bridge-timeout` despite the course page rendering normally.

## Source of truth

- `app/server/routes/preview.ts` owns bridge injection for isolated HTML previews.
- `scripts/tests/preview-route.test.ts` owns the oversized-page regression proof.

## Fragile areas / watchouts

- Oversized pages still intentionally omit opaque inspection markers and the editability map; the bridge provides preview connection only.
- UTF-16 pages remain byte-preserved and are not bridged through this fallback.

## Next prompt should assume

- The local Studio server is running at `http://127.0.0.1:5174/` and Chapter 12 has reconnected successfully.

## What still needs validation

- Broader Studio inspection and rollout checks remain deferred; the focused preview-route test and live Chapter 12 handshake passed.

## Known risks

- This local Build-mode repair is not a release or an LMS validation.

## Exact next action

- Await the next requested change.

## Exact next file to open

`app/server/routes/preview.ts`

## Do not do next / warnings

- Do not modify the Chapter 12 learner workspace to work around this Studio server defect.

## Prior active handoff

### Biology 30 overview parity follow-up — 2026-09-17

- Summary/status: local candidate updated so Biology 30 Chapters 11–13 share the same complete overview sequence and presentation: chapter hero, chapter-specific outcomes first, four-step “Learn the explanation” guidance, matching two-column lesson-route cards, and “What counts as finished?” guidance. The “Offline use” paragraph was removed from all three Biology chapter overviews.
- Files/source of truth: Pilot 3 `workspace/index.html`, `workspace/styles.css`, and runtime source/bundle; Chapter 12/13 canonical workspaces plus their portable copies; `scripts/refresh-biology30-chapter-portable.mjs` now owns the ordering and removal rule. Selector and Chemistry were not structurally changed.
- Verification: all four workspace verification commands passed; Pilot 3 runtime syntax passed; textbook-practice and topic-inventory checks passed; `git diff --check` passed; static inspection confirmed the same overview order and no “Offline use” text in canonical or portable Biology pages.
- Known risks/deferred: this is a local Build candidate only. The hosted selector remains the previous `v=20260916-6` release until an explicit deployment request. Chapters 12/13 remain blocked teacher-review candidates; browser-local saving and teacher-review-only scope are unchanged.
- Exact next action: review the local Chapter 11 overview, then deploy the shared selector if approved. Exact next file: `projects/biology30-unit-a-pilot-3/workspace/index.html`.

## Biology Chapters 11–13 Textbook Practice — 2026-09-16

- Latest topic organization: Choose a topic now filters lesson-aligned questions in all three chapters, with All chapter questions and Chapter review — mixed topics. Cross-topic questions share the same save ID; Previous/Next stay within the filter and lesson links open the relevant topic. Canonical mapping: `scripts/lib/biology30-chapters/textbook-topics.json`; shared behavior/integration own derived manifests, bundle and portable copies. Focused `node scripts/tests/biology30-textbook-topics.mjs` passed all three chapters (285 records, filter/tile inventory, shared saves/reload, lesson links, bounded navigation). Changed-area desktop screenshot inspected. No export/deployment; earlier live selector has not been refreshed for this change. Teacher mapping acceptance and broad rollout checks remain deferred. Next action: refresh local previews and review the topic menu; next file: `scripts/lib/biology30-chapters/textbook-topics.json`.
- Latest visual correction: user rejected the approximation. Integration now derives Chemistry's actual scoped component CSS and uses its chapter band, page-section/tile DOM, separate question-navigation header and bordered capture toolbar. Biology content/state adapters and shell remain intact; Chemistry source unchanged. All three changed previews loaded with no page errors; Next and enlargement/Escape worked. Desktop screenshots inspected. Portable copies/bundle refreshed; broad prior suites not rerun for styling alone. Reference CSS is deliberately a dependency of the integration script and may drift if Chemistry changes.

- Summary/status: local Build-mode implementation delivered. Optional ungraded practice contains 93 / 90 / 102 stable question records (285 total), original PDF crops/full-page context, Chemistry-style page/question tiles, written drafts/saved revisions and up to three browser-local photos. Existing required checks, source responses, vocabulary, labeling and Chemistry reference are preserved.
- Files changed/source of truth: shared `scripts/lib/biology30-chapters/textbook-practice.js` / `.css`, renderer and mechanical integration scripts, Chapter 11 `scripts/lib/biology30-pilot3/runtime.ts`, all three canonical workspace HTML files and source manifests/assets; Chapters 12/13 native runtime adapters and refreshed derived portable copies. Detailed ownership/regeneration: `docs/ops/BIOLOGY30_TEXTBOOK_PRACTICE.md`.
- Verification: focused `node scripts/tests/biology30-textbook-practice.mjs` passed for all three chapters, including exact counts, older native saves/nonzero progress, drafts/save/edit/reload, attachment operations/limits/rejection, navigation/modal/focus, print output, mobile overflow and simulated photo/response storage failure. Portable original images loaded offline. Source/crop/continuation and representative print/layout images visually reviewed.
- Known risks/deferred: photos are browser-local IndexedDB only; LMS/cross-device saving does not carry photos. Print/PDF is the portable record. Exhaustive device EXIF/responsive, whole-course/Studio/readiness, packaging, deployment, SCORM and live LMS proof remain separate. Chapters 12/13 stay blocked teacher-review candidates.
- Fragile areas/next prompt assumptions: preserve native namespaces/IDs and additive `textbookWork`; do not regenerate existing lessons/labeling through older intake tools. Question coordinates refer to PDF media-box origin. Portable files and Chapter 11 bundle are derived.
- Exact next action: review the three local Textbook Practice pages; await the next requested change. Exact next file: `projects/biology30-unit-a-pilot-3/workspace/index.html`.


## Biology labeling: all ten supplied images installed — 2026-09-16

- Explicit user direction supersedes the earlier four-image filter: install all ten supplied PNGs unchanged. Chapter 12 now has four package diagrams; Chapter 13 has six. No older generated diagrams are restored.
- Canonical files: both workspace HTML course-data, PNGs under `assets/labeling/`, and package-review metadata. Import owner `scripts/import-biology30-reviewed-labeling.mjs --all-supplied`; portable refresh embeds all PNGs. Stable earlier package IDs/keys preserved, including documented key cleanups on #04/#06/#10.
- Focused preview check: all four/six dropdown entries and corresponding images load. Earlier six science/target concerns remain documented and unresolved; this is installation at user request, not scientific clearance. Broad rollout checks remain deferred.
- Next action/assumption: refresh both previews; revise supplied images only upon request. Next file: `projects/biology30-chapter-13/meta/labeling-package-review.json`.

## Biology labeling: package images only — 2026-09-16

- User requested removing the older generated diagrams. Both chapters now offer only two reviewed package diagrams each; the other six package images remain held for correction. Chapter 11 unchanged.
- Canonical files: both chapter workspace HTML/main.js; derived portable copies refreshed. Removed diagram source retained recoverably in each project's `meta/retired-labeling-diagrams.json`. Owner: `scripts/keep-biology30-package-labeling.mjs`.
- Narrow saved-state check: an older saved labeling run in each chapter migrates to `retiredLabelingRuns`, retaining its selected answer, without rendering an unavailable diagram. Exactly two package choices render without page errors. Completed history remains untouched. Broad rollout checks deferred.
- Fragile area: do not rerun older intake tools that reintroduce retired diagrams. Next assumption/action: correct held package images only if requested. Exact next file: `projects/biology30-chapter-13/meta/labeling-package-review.json`.

## Biology Chapters 12/13 ten-image labeling package review — 2026-09-16

- Summary: visually inspected all ten supplied PNG worksheets and their individual answer keys. Added only four cleared candidates: Chapter 12 retinal layers (#02) and vestibular apparatus (#04); Chapter 13 pituitary pathways (#06) and insulin/glucagon (#10). Existing three diagrams per chapter and their keys/IDs remain unchanged, giving five available diagrams per chapter.
- Files/source of truth: canonical chapter HTML course-data / main.js, `workspace/assets/labeling/`, and `meta/labeling-package-review.json`. Full original package retained reference-only under `projects/resources/biology30-labeling-package/`; importer `scripts/import-biology30-reviewed-labeling.mjs`. Portable refresh embeds the new PNG bytes in derived standalone files.
- Verification: checked all 60 installed label mappings via dropdown / Check all, finished runs, reload, image loading and unchanged required-check state in isolated Chromium contexts. JS syntax checked. General E2E/Studio/SCORM/Brightspace remain deferred. This is local candidate review, not external teacher approval.
- Held candidates: #01 iris/optic-disc target issues; #03 round-window target on cochlear wall; #05 thyroid inset points thyroid key to parathyroid; #07 reabsorption arrows point into duct plus unlettered boxes; #08 clarify anterior pituitary lobe target; #09 misleading ACTH→aldosterone branch. No held image is installed. Package keys differ from the earlier GitHub manifest: never transplant letters between images.
- Key cleanup / fragile areas: #04 H specifically stereocilia; #06 P adrenal cortex; #10 M return toward workable blood-glucose range. #02 simplified cortex route is not for grading chiasm crossing. Stable old labeling snapshots must continue referencing their original diagrams. Original image bytes are unchanged.
- Next prompt assumption/action: correct the six held worksheets if requested, then review again before integration. Exact next file: `projects/biology30-chapter-12/meta/labeling-package-review.json`.

## Biology Chapters 12 and 13 Practice & Review handoff intake — 2026-09-16

- Summary: fetched only the supplied `chatgpt/ch12-ch13-practice-handoff` branch (revision `1ac22c4579640887cdd3f2e6f4cdb43c57c515a8`), without checkout/merge. Integrated its concept banks into flash cards / fill-in-the-blanks and its explicit authored MC plus definition-recognition items into multiple choice / mixed practice. Chapter 12: 64 concepts / 87 MC items; Chapter 13: 67 concepts / 95 MC items. Existing reviewed ordering sequences retained instead of blindly generating every supplied sequence. Chapter 11 unchanged.
- Files/source of truth: both chapter `workspace/index.html` course-data, `workspace/main.js`, retained handoff sources under `workspace/practice/`, `meta/practice-handoff-integration.json`; integration owner `scripts/integrate-biology30-practice-handoff.mjs`. Derived standalone copies refreshed with `scripts/refresh-biology30-chapter-portable.mjs`. Also fixed refresh tool's dollar-sign inflation in the textbook modal close selector.
- Verification: focused Chromium checked new 20-item flash sessions and reload; MC question/option snapshots restore exactly; in-page reset removes only the practice session and leaves required-check data unchanged. Syntax and whitespace checks passed. Comprehensive science/distractor approval and rollout E2E remain deferred, not passed.
- Known remaining work: labeling expansion is NOT complete. Three existing labeling activities per chapter remain. The supplied manifest contains nine new sets per chapter; several explicitly require missing target redraws or textbook extraction. Inspect each final image before mapping keys; do not attach the manifest's letters to unmodified teaching SVGs. Generated definition distractors also need teacher review before release.
- Fragile areas: independent existing chapter storage namespaces and saved run item snapshots must remain stable. Vocabulary/Frayer records remain separate from practiceConcepts. Do not rerun intake presentation scripts. Full Studio/readiness, SCORM, deployment and Brightspace checks deferred.
- Next action/assumptions: continue labeling integration, Chapter 12 first, using manifest answer authority and visual inspection, preserving formative-only progress. Exact next file: `projects/biology30-chapter-12/workspace/practice/labeling-manifest.json`.

## Biology Chapters 12 and 13 component parity — 2026-09-16

- Summary: replaced vocabulary card grids with Chapter 11's topic index / word reader; integrated clickable vocabulary into first occurrences in lesson prose; added right-side word dropdown popup using the existing Frayer owner. Matched textbook dialog at 900 × 760 desktop and replaced cover/button library with inline chapter PDF/fullscreen/download links. Sidebar numbering now uses 1., 2., etc.; restored compact textbook bands and guide process lines.
- Files/source of truth: both chapter canonical workspace HTML/CSS/JS, local `assets/textbook/chapter-12.pdf` / `chapter-13.pdf`, portable derived HTML; component intake tool and reader/CSS under `scripts/lib/biology30-chapters`; `scripts/refresh-biology30-chapter-portable.mjs` produces portable previews from canonical workspaces.
- Verification: focused Chromium checked topic selection, contextual vocabulary, 576px popup, 900 × 760 textbook modal, close/focus behaviour and no page errors in both chapters. Editing a word's existing Frayer through popup, closing and reloading preserved its exact text. Mobile reader had no overflow; portable library points at embedded PDF Blob. JS syntax and diff whitespace checks passed.
- Risks/fragile areas: word IDs, storage keys, selected Frayers and eight-word limits unchanged. What it does uses exact matching existing Chapter 11 Unit A records where available, otherwise the chapter's own teaching sentence or example. Broader content/science and activity validation, Studio, SCORM/Brightspace and deployment remain deferred. Do not rerun intake alignment tools over subsequent authored edits. Popup temporarily moves the existing editor and returns it on close; no duplicate save model.
- Next action/assumptions: refresh the two existing Chapter 12/13 tabs and review local component parity. Next file: `projects/biology30-chapter-13/workspace/main.js`, word reader and popup section.

## Biology Chapters 12 and 13 presentation intake — 2026-09-16

- Summary: two supplied standalone chapter HTML files imported as separate blocked, previewable conversion candidates. Exact Chapter 11 fonts, colour tokens, heading/guide dimensions, sidebar and lesson spacing applied; mobile header overlap corrected. Original Downloads and Chapter 11 remain unchanged.
- Files changed/source of truth: `projects/biology30-chapter-12/workspace/{index.html,styles.css,main.js}` and corresponding Chapter 13 files; imported project metadata, presentation records and prompt packs. `workspace/Biology30_Chapter12.html` / `Biology30_Chapter13.html` are derived portable copies. Intake tool: `scripts/align-biology30-chapter-presentation.mjs`, compatibility styles: `scripts/lib/biology30-chapters/presentation-parity.css`.
- Verification: original course-data/textbook-data matched exactly after normalization; runtime preserved exactly. Focused Chromium desktop comparisons matched Chapter 11 heading font/colour, goal/guide geometry and sidebar title typography. Both chapters loaded exact embedded Work Sans/Hanken fonts; 390px and desktop representative lesson/practice pages had no overflow or page errors. Final mobile header adjustment rechecked separately.
- Known risks/follow-up: generic importer failed while merging embedded PDF/JSON data into executable JS; repaired only these imported workspaces, preserving non-executable data nodes and externalizing the actual runtime. Comprehensive content/science, activity E2E, Studio, SCORM, deployment and LMS proof deferred. Existing imported runtime/saving differs from Chapter 11 and was not replaced by this presentation pass.
- Fragile areas: stable source activity/word/storage IDs and runtime selectors must remain. Intake alignment script reads original Downloads and overwrites candidates: do not rerun after canonical content changes. Font resources are embedded; base CSS references replaced.
- Next prompt assumptions: presentation review only, separate chapter candidates; no release or Chapter 11 changes implied.
- Exact next action: open each Chapter 12/13 workspace preview and request specific learner changes.
- Exact next file to open: `projects/biology30-chapter-12/workspace/index.html`.

- Project: `chemistry30-unit-a-pilot`
- Task: implement Chemistry 30 Unit A Practice & Review using Biology Pilot 3’s learner experience.
- Status: local Practice & Review Build candidate complete; blocked authoring. Prior teacher-review deployment is a separate earlier candidate.

## Chemistry navigation follow-up: Video lessons

- Moved the existing `video-library` link from Practice & Review to Resources, after Textbook Library. Page, videos, route and saving unchanged.
- Canonical source: `workspace/main.js`, `window.UNIT_GROUPS`; integration hash updated.
- Check: JS syntax and targeted diff check; broader rollout checks remain deferred.
- Next action: refresh the local preview. Next file: Chemistry `workspace/main.js`.

## Chemistry uploaded full diagram pack — supersedes three-diagram restriction

- User clarified all ten uploaded diagrams, including Chapters 12–13. Diagrams now uses the original ten PNGs and 71 canonical answer/synonym mappings, extracted unchanged from the supplied ZIP. The seven authored additions stay excluded from new sets and remain restoration-only.
- Unit A teaching, completion and other banks remain unchanged. Diagrams offers Chapter 11/12/13 scopes; Mixed Unit A includes only uploaded Chapter 11 diagrams. No new Chapter 12/13 lessons or completion milestones were created.
- Canonical files: `workspace/practice/diagrams.js`, `engine.js`, `ui.js`, and `practice/diagrams/uploaded/**/*.png`; adapter/coverage/project/integration metadata; focused practice tests.
- Verification: 11 focused tests passed; pack assets extracted by original archive paths. Full ten-item chooser inspected in an isolated browser; original Chapter 13 PNG loaded and its matching draft survived save/reload. Chapter 12/13 scopes use the same practice namespace. Earlier reset, report and state compatibility contracts remain.
- Fragile area: additional SVG definitions remain to resolve historical saves. Original uploaded figures are now the active artwork; earlier SVG corrections do not describe these original PNGs.
- Deferred rollout gates unchanged: project E2E, Studio, SCORM, deployment and Brightspace.
- Next action: refresh Diagrams; stop/reset an old excluded unfinished set, then choose an uploaded diagram.
- Next file: `projects/chemistry30-unit-a-pilot/workspace/practice/diagrams.js`.

## Chemistry diagram scope adjustment — 2026-09-16

- Summary: only the three uploaded Chapter 11 diagrams enter new diagram runs and Mixed Practice. Retained 22 original label mappings; SVG redraws remain. Seven added diagrams are restoration-only so existing saved entries remain readable.
- Files/source of truth: canonical `workspace/practice/diagrams.js`, `engine.js`, `ui.js`; labeling-adapter, coverage and integration metadata; focused practice tests.
- Verification: focused practice suite 11/11 passed, including new-set filtering and saved extra-diagram resolution; JS syntax and targeted diff check. Diagram selector exposes only scopes with supplied activities.
- Risks/fragile areas: historical saved runs may still contain an excluded diagram; do not delete their definitions or IDs. Current restriction applies to new selections.
- Deferred: project E2E, Studio, SCORM, deployment and Brightspace checks unchanged.
- Next action: refresh Diagrams and choose one of the three supplied activities.
- Next file to open: `projects/chemistry30-unit-a-pilot/workspace/practice/diagrams.js`.

## Chemistry Practice & Review — 2026-09-16

- Summary/status: requested local Build candidate complete. Six optional modes cover all 20 teaching lessons: 300 authored prompts (100 flashcards, 50 blanks, 150 multiple choice), 28 constrained calculation templates and 10 SVG diagram activities. Mastery and Chapters 12–13 remain outside Unit A.
- Files changed: Chemistry canonical `workspace/index.html`, `workspace/main.js`, `workspace/styles.css`; `workspace/practice/chapter-9.js`, `chapter-10.js`, `chapter-11.js`, `engine.js`, `generators.js`, `diagrams.js`, `ui.js` and `diagrams/*.svg`; project/pilot metadata and new practice coverage, source, labeling-adapter and preservation records; focused `scripts/tests/chemistry30-unit-a-practice.test.cjs`. Blueprint reference files and the original labeling archive/manifest are under `projects/resources/chemistry30-unit-a-pilot/practice-blueprints/`.
- What changed: scoped sets, two-attempt cues/answers, distinct first/eventual results, flashcard self-assessment, missed-skill variants, keyboard diagram dropdowns/enlargement/descriptions, confirmation before resetting unfinished practice, and one completed-set entry grouped by mode in All My Work. Report export opens grouped disclosures so all responses are readable and printable.
- Source of truth: canonical Chemistry entry `projects/chemistry30-unit-a-pilot/workspace/index.html`; practice banks/generators/engine/UI/SVGs are authored canonical sources. Existing course runtime is the integration and save owner. Reference documents and teacher solutions are outside learner pages; Biology sources were not edited for this task.
- Saving: optional `state.tools.practice` version 1; existing `chem30-unit-a-v2` keys, codec and save limits remain. Generated parameters, choice identities, unfinished inputs, position and checked feedback are saved. Latest three completed sets per mode plus compact skill history; completed records survive reset. Save failures follow the existing course status and are never reported as successful by practice.
- Verification run: 10/10 focused Node tests passed, including 28 templates × 40 seeds, unit/sign/rounding checks, exact original 3-diagram/22-label mappings, mixed-format selection, three-set retention, self-assessment separation, shared diagram skill aggregation, old-save compatibility and codec round-trip. Before/after data hashes preserve PDFs, vocabulary, textbook data/crops, assessments, embedded labels and milestones; all 32 original page records are unchanged. Total routes 38; textbook entries 123; milestones 24. All 10 SVGs rasterized and visually inspected; catalyst leaders corrected. Isolated browser checks covered all six screens, unsubmitted calculation value/unit/working reload, second-attempt blank feedback reload, completed diagram reload, flashcard variant retry, reset confirmation, keyboard matching, enlargement and compact 582px layout without overflow. Downloaded report included grouped Flash Cards/Diagrams entries and no closed disclosures.
- Known risks / fragile areas: stable question/template/diagram IDs and engine version must remain resolvable for older saved sets; changing only option order is not a fresh skill variant. Calculation tolerances allow sensible rounding; sig-figure guidance is nonblocking. Numerical values are constrained teaching models, with assumptions stated in each question. Browser-local storage remains path-specific and is not cross-device saving. Existing 60,000-character LMS limit can still reject a large whole-course record without shortening it. Compact browser backend reported 582px despite requesting 390px, so full narrow-mobile proof remains deferred.
- Deferred rollout gates: full learner/project E2E (including a Chemistry project contract), Studio editability and reversible lifecycle certification, teacher acceptance, full-course SCORM state capacity/packaging, deployment and Brightspace verification. Keep blocked proposal-only authoring; prior teacher-review deployment does not include this practice candidate.
- Next prompt assumptions: local candidate only; no deployment, export, promotion or Biology changes implied. The five-round Mastery workflow and Unit B pack assets remain future work.
- Exact next action: review the local practice candidate at `http://127.0.0.1:4178/projects/chemistry30-unit-a-pilot/workspace/index.html#practice` and request the next learner adjustment.
- Exact next file to open: `projects/chemistry30-unit-a-pilot/workspace/practice/ui.js`.

## Chemistry follow-up: Video Library simplification — 2026-09-16

- Summary: removed the topic table that navigated away to written lessons. The guide now directs students to choose a video below; all 12 video/playlist cards and their controls remain unchanged.
- Files changed / source of truth: canonical `projects/chemistry30-unit-a-pilot/workspace/main.js`, `window.COURSE_PAGES` / `video-library`; `meta/pilot-integration.json`; this handoff.
- Verification: preserved video URL inventory and JS syntax; focused local rendered-page inspection.
- Risks / fragile areas: page is runtime-rendered; edit its canonical page record. Playback depends on existing video sources.
- Deferred: broad E2E, Studio, SCORM/Brightspace and deployment/live verification. Local only; blocked authoring remains.
- Next prompt assumption / exact next action: review the simplified local Video lessons page; no deployment implied.
- Exact next file to open: Chemistry `workspace/main.js`, `video-library` page record.

## Chemistry follow-up: cropped textbook practice — 2026-09-16

- Summary: local Build candidate complete. All 123 assigned questions now show cropped textbook images above their existing answer workspace. Multiple images keep question continuations, diagrams and referenced context together. Enlarge question opens an in-course zoomable view; See full textbook page retains page context.
- Files changed: Chemistry canonical `workspace/main.js` and `workspace/styles.css`, `workspace/assets/textbook-question-crops/*.jpg`, `meta/textbook-question-crops.json`, `meta/project.json`, `meta/pilot-integration.json`, and `scripts/render-chemistry30-question-crops.py`. Earlier navigation trial also changed canonical HTML and full-page assets.
- Verification: JS syntax, original question inventory comparison and asset checks; 123 question IDs, 137 crops. Inspected contact sheets and corrected boundaries/continuations. Focused browser checks confirmed loaded images above answers, enlarged zoom and full-page fallback. Earlier isolated Save/Next/Previous/reload check passed; this display revision does not alter saved-answer contracts.
- Source of truth: canonical Chemistry HTML/runtime/styles; embedded PDFs in `workspace/main.js`; reviewed crop coordinates in `meta/textbook-question-crops.json`. JPEGs are generated display assets.
- Known risks/follow-up: image questions retain scanned textbook typography and are not transcribed text. Full-page context remains available. Existing question, equation, response, diagram and progress IDs are preserved.
- Fragile areas: crop coordinates depend on the preserved PDF edition and printed-page offsets (9=332, 10=368, 11=402). Regenerate with `python3 scripts/render-chemistry30-question-crops.py` if source or boxes change.
- Deferred rollout checks: broad project E2E, Studio lifecycle/editability, SCORM packaging/state capacity and Brightspace. The crop revision is now deployed for teacher review; retain blocked authoring and existing release decisions.
- Next prompt assumption: review cropped question presentation locally; no assignment changes or deployment implied.
- Exact next action: refresh local Textbook Practice and try a question, Enlarge question and Next question.
- Exact next file to open: `projects/chemistry30-unit-a-pilot/meta/textbook-question-crops.json` for image boundaries, or canonical `workspace/main.js` / `renderBookWork` for the learner display.

## Current follow-up: Biology 30 Pilot 3 practice startup

- Status: deployed for teacher review at `https://biology30pilot.web.app/?v=20260916-2`; live Biology and Chemistry selector paths were checked after deployment, including the current Chemistry textbook-crop assets.
- Cause: two `lesson-14` concepts are retained in the practice bank solely for legacy saved-session restoration, but the validator treated them as unknown learner lessons and blocked every generated practice mode at start.
- Fix: `scripts/lib/biology30-pilot3/practice-engine.ts` now permits only that explicit legacy restoration ID while keeping lesson 14 hidden from new practice selections; the generated `pilot3-runtime.js` bundle was rebuilt.
- Verification: generated-practice tests passed 4/4; focused Chromium practice/reset tests passed 2/2; Biology and Chemistry workspace verification passed; live Biology multiple-choice resumed a saved 10-item set without errors; live Chemistry populated after selector switching; live core-byte and crop-asset hashes matched; targeted `git diff --check` passed.
- Reset boundary: Pilot 3 exposes `Stop and reset` for unfinished practice only. Completed practice history, lesson responses, and vocabulary Frayers remain in browser storage by design; deployment does not clear them.

## Files changed

## Biology 30 practice reset follow-up — 2026-09-16

- Local fix complete; not deployed. Both reset paths now use an on-page confirmation instead of native `window.confirm`, which can be suppressed in embedded previews and silently cancel reset.
- Reset unfinished practice clears only the current unfinished run; Keep working preserves it. Completed history and activity/answer/storage IDs are unchanged.
- Follow-up presentation fix: the activity bar wraps, the confirmation occupies its own full-width row, and its buttons use a wrapping action group with a 12px gap. Runtime bundle rebuilt and targeted diff check passed; reset-state regression was not repeated for this presentation-only edit.
- Changed: runtime source `scripts/lib/biology30-pilot3/runtime.ts`, rebuilt `projects/biology30-unit-a-pilot-3/workspace/assets/pilot3-runtime.js`, both Pilot 3 stylesheets, and `scripts/tests/biology30-pilot3-reset-browser.test.ts`.
- Focused browser test passed with native confirmation suppressed: all four generated modes and Labeling, cancellation, confirmed reset, reload, completed-history preservation and unchanged progress. Broader E2E, Studio, packaging and LMS checks remain deferred.
- Next action: refresh the local Biology preview and review the confirmation; deploy only on explicit request. Next file: `scripts/lib/biology30-pilot3/runtime.ts`.

### Chemistry files

- `projects/chemistry30-unit-a-pilot/workspace/index.html`
- `projects/chemistry30-unit-a-pilot/workspace/styles.css`
- `projects/chemistry30-unit-a-pilot/workspace/main.js`
- `projects/chemistry30-unit-a-pilot/workspace/assets/fonts/**`
- `projects/chemistry30-unit-a-pilot/meta/project.json`
- `projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`
- Import-generated metadata under `projects/chemistry30-unit-a-pilot/meta/**`
- `docs/ops/ACTIVE_HANDOFF.md`
- `docs/ops/ARCHIVED_HANDOFFS.md`

## What changed

- Imported the user-supplied ChatGPT Guided Teaching Edition into a new blocked pilot while preserving the original HTML byte-for-byte under `raw/original.html`.
- Added Hanken Grotesk and Work Sans from the local Biology Pilot 3 font assets and aligned lesson headers, goal strips, spacing, guide panels, review orientation, and embedded-activity directions with the established learner presentation.
- Refined the shared course shell after visual review: the sidebar now follows Biology Pilot 3's course-name hierarchy, section rhythm, active marker, bottom Save and Exit placement, and narrow collapsed rail; the top bar now carries the live course-progress block.
- Rebuilt the sidebar navigation hierarchy to match Biology Pilot 3 more closely: Start and Learn are the primary learner sections; Chapters 9, 10, and 11 are collapsible subsections inside Learn; Practice & Review, Tools, Process Collection, and Resources retain the same Biology-sized headings, lesson typography, spacing, and active border treatment.
- Rebuilt the lesson surface as the same bordered white card pattern used by Biology Pilot 3. The learning-goal strip fills the card edge-to-edge without grey gutters, and closing the sidebar expands the complete card and all lesson sections from 1120px to 1380px at the reviewed desktop width.
- Added 31 collapsed guides: 20 lesson-specific “How to complete this lesson” disclosures, four review guides, and seven guides for Practice Lab, Textbook Practice, Process Collection, Core Vocabulary, Equation Studio, Resources, and Video Library.
- Rebuilt Core Vocabulary with Biology Pilot 3's category index and split reader. All 74 Chemistry terms retain their original meanings and common-confusion notes, and their existing four Frayer fields remain the sole saved-response owner.
- Added an explicit Frayer save control. A learner completes all four Frayer sections and saves them together as one Vocabulary Frayers entry; existing drafts remain available and are consolidated without changing the four underlying field IDs.
- Wired vocabulary terms throughout lesson teaching text. Each underlined term opens a right-side mini vocabulary drawer with Meaning, What it does, Common confusion, related ideas, and the same saved Frayer fields used on Core Vocabulary.
- Added a persistent Reference sheet control beside the top bar. Its panel is non-modal, can remain open while a learner navigates or works, can be dragged by its heading, resized from its lower corner, and returned to its default position.
- Reorganized the support navigation into collapsible Practice & Review, Tools, Process Collection, and Resources sections. Video Lessons now sits with Practice & Review; Practice Lab, Core Vocabulary, and Equation Studio sit together under Tools; All My Work sits under Process Collection.
- Removed the selected administrative/source-provenance copy from Video Lessons while retaining every video card and playback control. The three playlist cards now use direct learner wording.
- Replaced Textbooks & Sources with a Biology-style Textbook Library under Resources. It provides Chapter 9, 10, and 11 selectors, printed-page controls, and an embedded PDF reader without leaving the course.
- Converted the 24 lesson/review textbook bands into 27 printed-page entry points. Each opens an in-course textbook modal at the mapped PDF page; lessons citing separated ranges expose one control for each range. Textbook Practice uses the same viewer.
- Reorganized All My Work into collection types: Vocabulary Frayers, Written responses, Equation and textbook work, Energy diagrams, Models and simulations, Checked practice, and Interactive activities. Related fields from one Frayer, lesson, textbook question, model, or diagram now render as one entry with their data together.
- Simplified the Process Collection action area to one learner-facing **Download your process report** button. Its guide and helper copy now describe the readable HTML report; the page-specific backup and restore controls were removed.
- Kept the overview’s existing learner directions visible and restyled them instead of adding a duplicate guide.
- Updated visible course identity to Chemistry 30 Unit A Pilot while preserving the runtime course/state identity required by the existing save contract.
- Recorded source/reference hashes, preservation evidence, focused browser results, and the release boundary in `meta/pilot-integration.json`.

## Why this changed

- Learners needed the completed Chemistry course presented with the same clear rhythm and page-level completion guidance as Biology 30 Pilot 3 without rebuilding or altering the course’s instructional and assessment systems.

## Verification run

- `node --check projects/chemistry30-unit-a-pilot/workspace/main.js` passed.
- Firebase Hosting deploy to `biology30pilot` completed successfully after adding the selector frame cache key `20260915-3`.
- Live Chromium verification passed for `https://biology30pilot.web.app/?v=20260915-3#chemistry30-a-pilot` and the original `?v=20260915-2#chemistry30-a-pilot` link; the embedded Chemistry overview populated instead of remaining blank. Biology Pilot 3 also rendered after switching in the selector.
- `git diff --check -- projects/chemistry30-unit-a-pilot` passed before the final metadata/handoff write.
- Static source comparison passed for preserved instructional and assessment content after accounting for the added guide markup, overview style hook, requested sidebar regrouping, and teacher-requested removal of two Video Lessons administrative blocks plus three playlist wording revisions. Vocabulary, textbook-question, check, label, and milestone data are unchanged, and every original route ID remains present exactly once.
- Inventory confirmed 32 routes, 24 milestones, 123 textbook entries, 74 vocabulary terms, 19 unit-check definitions, 11 lesson/review activity placements, one Practice Lab frame, and 24 unchanged completion requirements/controls.
- Focused Chromium check confirmed all 31 guide routes have one closed-by-default guide, Enter opens a focused guide, a Chapter 9 required-check response survives reload, and the 390px Practice Lab has no horizontal page overflow or console errors.
- Focused shell check at 1667px confirmed the top progress block and menu control are visible and clickable, the expanded frame/goal strip measure 1120px/1118px, and sidebar collapse produces a 78px rail with a 1380px/1378px frame/goal strip. Both states have zero horizontal overflow.
- Focused mobile check at 390px confirmed a single-column goal strip, zero horizontal overflow, and a working 310px navigation drawer. The compact mobile header intentionally omits the progress block to preserve usable space.
- Focused vocabulary check confirmed all 74 preserved terms appear in the category index. A Chapter 9 lesson produced 29 contextual term links; selecting `system` opened the correct drawer, and a Frayer response entered there appeared on Core Vocabulary and survived reload.
- Isolated Frayer save check confirmed all four fields save through one button and appear as one dated Vocabulary Frayers entry. A two-field investigation response and a textbook response each rendered as one entry under their correct collection type.
- Existing-state collection check confirmed a prior four-field vocabulary draft and four supplied profile values now render as two consolidated entries instead of eight individual rows; no stored values or IDs changed.
- Focused Process Collection check confirmed the action area renders exactly one **Download your process report** button and no page-specific Download backup or Restore backup controls.
- Focused reference check confirmed the panel opens non-modally at 620×760px, moves by its heading, reports `resize: both`, and stays open when navigating to another lesson.
- At 390px, Core Vocabulary becomes one column, the vocabulary drawer fills the viewport, the Reference sheet control remains visible, and horizontal overflow remains zero.
- Focused sidebar check confirmed all 32 route IDs remain unique, Practice & Review opens automatically on Textbook Practice, and the other support sections remain collapsed until selected.
- Refreshed sidebar inspection confirmed six Biology-style top-level sections, three nested collapsible chapter groups, and the active Chapter 9 lesson under the expanded Learn group. The reviewed browser's Process Collection showed four supplied reaction-profile starting values, zero completed practice attempts, and zero of 24 finished lessons.
- Focused Video Lessons source check confirmed the selected “Internet and access” and “The original video collections” blocks and their export/source wording are absent; all existing video load controls remain in the course runtime.
- Focused textbook check confirmed Chapter 9 p. 334 opens at PDF page 3, Chapter 9’s separated pp. 336 and 351 references have separate buttons, the Chapter 11 bonds lesson exposes pp. 342 and 408 separately, and Textbook Practice opens its selected question in the same modal.
- Textbook modal verification confirmed modal state, close-button/Escape behavior, focus return, no new-tab navigation, no browser errors, and a full-viewport 390×844 mobile presentation with zero horizontal page overflow.
- Screenshots inspected at 1440px for Chapter 9, 1667px for the reviewed shell states, and 390px for Practice Lab and the shell.
- No full E2E, Studio lifecycle, packaging, deployment, or Brightspace verification was run in Build mode.

## Source of truth

- Preserved imported baseline: `projects/chemistry30-unit-a-pilot/raw/original.html`.
- Canonical learner review sources: `projects/chemistry30-unit-a-pilot/workspace/index.html`, `workspace/styles.css`, and `workspace/main.js`.
- Integration and verification evidence: `projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`.

## Fragile areas / watchouts

- `workspace/main.js` contains the imported self-contained course data and runtime. Preserve all route IDs, question/activity identifiers, `data-save`, `data-check`, `data-require`, `data-complete`, iframe placement/query values, state schema, and `chem30-unit-a-v2` identity.
- Add future page guidance by exact route in `window.COURSE_PAGES`; do not reconstruct the course or replace the Chemistry runtime with Biology code.
- Do not rerun import with `--force` over this pilot. The raw source and current canonical workspace now have distinct roles.

## Next prompt should assume

- The usable local Chemistry 30 Unit A pilot exists in the current dirty `main` checkout and Biology Pilot 3 remains unchanged.
- The new preview pathname creates a separate browser-local work record; the existing backup/restore controls remain the transfer mechanism.
- Teacher guides and the interactive SCORM ZIP are reference-only provenance and were not treated as current verification.
- Studio editing, export, deployment, and LMS readiness remain disabled or unclaimed.

## What still needs validation

- At rollout: project E2E coverage, the remaining 320/375/768 responsive widths, Studio Edit-map and reversible lifecycle, export integrity, SCORM checks, and actual Brightspace save/reopen/reporting.

## Known risks

- The canonical `main.js` is large because the source embeds PDFs and activity code. Future broad serialization could create unnecessary drift.
- Browser-local save/reload passed at the new pathname, but this is not proof of cross-device saving or Brightspace persistence.

## Exact next action

- Await teacher review of the deployed Chemistry 30 Unit A pilot and Biology 30 Pilot 3 selector.

## Exact next file to open

`projects/chemistry30-unit-a-pilot/meta/pilot-integration.json`

## Do not do next / warnings

- Do not commit, export, upload to Brightspace, enable Studio Edit, or change release flags without a separate request. Future deployment remains explicit and should preserve the selector frame cache-busting pattern.
- Do not modify Biology 30 Pilot 3 while reviewing Chemistry.
