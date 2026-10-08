# Handoff

- Project: Biology 30 Chapters 11–20 teaching overhaul; current authoring batch is Chapter 11 lessons 01–03.
- Task: Use the signed-in Biology 30 ChatGPT project to author and independently review the first complete teaching manuscripts before any course integration.
- Status: building — first three revised lessons available as a separate working evaluation copy. Teacher acceptance, canonical integration, calibration and release remain pending/not started.

## Files changed

- scripts/prepare-biology30-browser-authoring.mjs: deterministic, exclusive-output assembly of bounded frozen source attachments; no learner course mutations.
- projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/2026-10-02-browser-authoring/**: attachment binding and nine verified uploads; three prompts; immutable progression/v1/v2 returned files; screenshots; source/progression/manuscript reviews; response hashes and session status.
- REVIEW_START_HERE.md is Dean's review entry. MANUSCRIPT_REVIEW_V2.md and AUTHORING_SESSION.json record current review status separately from raw author status headers.
- index.html is the separate clickable manuscript-review entry; lesson-01/02/03.html render the complete learner manuscripts with native hints/feedback, and source-notes.html contains the teacher appendix. scripts/render-biology30-teaching-review.mjs regenerates these derived pages; HTML_REVIEW_MANIFEST.json binds their source/output hashes. Existing Biology fonts/colours used under the uncodixfy skill; no new learner course or runtime.
- Downloaded handoff: /Users/deanguedo/Downloads/CH11_First_Batch_Authoring_Draft_v2.zip.
- No canonical learner HTML/styles/runtime, IDs, assets, project status, exports or release state changed.
- Working evaluation derivative: scripts/build-biology30-teaching-working-copy.mjs, scripts/serve-biology30-teaching-working-copy.mjs, working-copy/**, WORKING_COPY_MANIFEST.json and evidence/06-working-copy-fresh-evaluation.jpg. Session tracker and review guide distinguish this prototype from canonical integration.

## What changed

- Reused the Chapter 11 frozen handoff bound to revision ecc1b806630cb33b9942e64eb676a1f8568c007e and source-tree SHA 0e89c19b8db652abffc5a8837e084b7e84eb30be888057c8ccdf2e2efe33ba52.
- Verified nine uploaded source files before sending. Visible model menu selected Latest; Power changed from Pro to Extra High, 4 of 5. Pro and Extra High are distinct presets; no simultaneous 6 Pro + Extra High claim or API-backed authoring service.
- Obtained and fully read progression v1, three complete manuscript v1 files and source/integration map. Requested targeted full-file v2 revisions; independently read all four complete v2 files through EOF.
- v2 includes causal explanation, worked examples, diagram-reading guidance, five guided items and three independent transfer items, explained feedback, exact six required written checks and separate source/assets/integration notes.
- Corrected term sequencing, the L02 three/four mismatch, missing worked structure reasoning, learner-facing production language, native save-after-edit instructions, exact-answer leakage into required tennis-ball preparation, frozen-vocabulary-owner claims and review attribution.
- No teacher approval has been inferred from ChatGPT's output or lead review. Chapter 19 lesson-04 calibration has not started.
- At Dean's request for a working copy, inserted all three full manuscripts into a separate snapshot of the native Chapter 11 shell. Reused existing diagrams, native vocabulary/Frayer owners and reader, disclosure styling and six real written-check controls. Only lessons 01–03 revised; other pages retained as context. Compiled a derived runtime from native source with separate activity/Frayer/resume/photo namespaces and all LMS access disabled; production source remains unchanged.

## Why this changed

- Dean said "go" following the source-export phase and the approved browser-assisted teaching-overhaul plan. The plan requires a reviewed first batch and Dean's explicit approval before course HTML changes or calibration/scaling.
- The later request for a working evaluation copy authorizes prototype integration for evaluation only. It does not supply the content-approval or release decisions required for canonical changes.

## Source of truth

- Current authoring evidence/review: projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/2026-10-02-browser-authoring/REVIEW_START_HERE.md, AUTHORING_SESSION.json, RESPONSE_VERSIONS.json and responses/v2/**.
- Frozen source package: projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/2026-10-02-source-handoff/**. Do not rewrite its manifests to add later approval claims.
- Canonical Chapter 11 course: projects/biology30-unit-a-pilot-3/workspace/index.html; embedded pilot3-words and visible vocabulary/Frayer markup remain live owners. Styles and fonts remain native.
- Canonical runtime: scripts/lib/biology30-pilot3/runtime.ts and existing vocabulary helpers. workspace/assets/pilot3-runtime.js is derived; exported vocabulary-and-schema.json is a snapshot, not the edit owner.
- Signed-in authoring conversation: https://chatgpt.com/g/g-p-6aaaa691bcac8191b7230604e7011382-biology-30-course-creation/c/6abfef2d-8c70-83e8-9002-93f346dcc111 . Selected Chrome tab kept for approval/revisions.
- Evaluation entry: working-copy/index.html#lesson-01, live locally at http://127.0.0.1:57000/index.html#lesson-01 . WORKING_COPY_MANIFEST.json binds all manuscript/native-source/output hashes; the builder is a review-derivative owner, never the canonical course owner. Serve command uses only the exact candidate allowlist on loopback. Current exec server session 33091; use the same default port 57000 on restart to preserve the save origin.

## Verification run

- Deterministic source preparation verified 21 input bindings and prepared nine attachments; successful actual browser uploads checked before requesting writing.
- v1/v2 archive file lists and CRC checks passed. Final v2 is 42,111 bytes; SHA 0bc6740baff68af926ce12b7bd6431b17b628b9502c7b3159edf0c8f5600049c.
- Complete source/figure and manuscript reads recorded; selected consequential science claims additionally checked against successful primary textbook/NIH pages. NCBI access challenges are not counted as independent lead retrieval.
- Focused comparison: six exact prompts, three activity IDs, six question/written-field IDs and 3200-character limits match frozen native records; eight proposed optional IDs unique; learner boundaries and main corrections present.
- Final 1,876-file preservation comparison returned zero changed/missing files. No learner storage accessed; this is not save/resume E2E proof.
- No broad learner/Studio/SCORM/Brightspace tests were run in this manuscript phase.
- Review-index checks: renderer syntax passed; three full learner texts equal the raw v2 Markdown render; four immutable source hashes matched; five output hashes and 62 local links/assets checked; 16 native learner disclosures; zero active scripts/learner fields. Actual browser-rendered inspection blocked by the file-URL security policy; no alternate-route workaround attempted and no visual pass claimed.
- Working-copy checks: three complete learner text comparisons; six native prompt/ID/limit bindings; unchanged 12 required-check identities and vocabulary payload; no duplicate DOM IDs; 183 canonical workspace hashes and native runtime hash unchanged; 183 output hashes matched. Native stylesheet/asset bytes copied intact.
- Browser narrowly checked all three routes, native Work Sans/Hanken Grotesk and 700-weight clickable vocabulary, synchronized definition popup, page-372 textbook modal, native existing figures, one keyboard hint and one required Start/Save/reload/Finish/All My Work cycle. Fresh delivery origin starts at 0/12 with no started check; no captured console errors. Myelin image was offscreen/lazy in the recorded early DOM observation, not counted there as visually loaded; its exact file/HTTP response passed.
- Loopback server asset/byte-range checks passed; non-candidate and traversal requests rejected with 404, POST rejected with 405. Test response remains under separate origin 56880; only that test server stopped, no data deleted. Codex browser-panel opening was queued; live Chrome evaluation tab verified and kept.

## Routing

- Frozen-source assembly, hashes and archival checks: deterministic tools. Source authority, native boundaries, browser interaction, science/teaching review and acceptance claims: Sol lead, due to instructional judgment and dirty-checkout preservation.
- No worker spawned and no Muse implementation slice exists in this authoring-only boundary. Previous local handoff/figures/source locators reused after hash verification; provider-cache telemetry unavailable and usage savings unmeasured.
- Clickable-index slice: deterministic Markdown rendering and hashes; Sol lead for the small known review UI and fail-closed untrusted-Markdown boundary. Intended new write paths checked clean before editing; no worker needed.
- Working-copy slice: deterministic snapshot/compile/server checks; Sol lead content mapping and preservation/save/trust boundaries because these depend on manuscript judgments and native storage contracts. New intended script/output paths checked clean; no eligible independent bulk implementation slice or worker call. Native CSS retained under uncodixfy rather than inventing a new design; usage savings unmeasured.

## Fragile areas / watchouts

- Preserve native local/LMS namespace biology30-unit-a-pilot-3:v1, IndexedDB work/state, revision conflict/failure protection, immutable completed history, generated-practice resume and Frayer packing/schema/baseline protections.
- Required activities practice-overview / practice-neuron-structure / practice-reflexes and question IDs 1,2,3,7,4,6 are immutable. New formative notes/reveals do not create a completion gate or saved field.
- Historical Q6 key is preserved as source, not science authority for a directly spinal visual dodge. Corrected marking notes remain teacher-only. Vocabulary explanatory distinctions and deliberately false misconception statements must remain separate.
- Raw draft headers predate independent lead review. Current review status belongs in the session/review records; do not silently alter raw returned files or treat them as accepted.
- Preserve all other chapter owners, approved labeling mappings and Chapter 13 lesson-07 worked/guided-before-failure placement when scaling later.

## Next prompt should assume

- Only Chapter 11 lessons 01–03 have complete authored/reviewed candidate manuscripts. They have a working evaluation derivative but are not integrated into the canonical course. The first batch still needs Dean's explicit scoped decision.
- No universal teaching standard was promoted, no model/Power identity was silently substituted and no course styling/runtime redesign was attempted.
- Global handoff may have been updated by the concurrent Science 24 chat; its exact preceding entry must be archived before switching this active record.

## What still needs validation

- Dean's first-batch content decision; Chapter 19 lesson-04 calibration with prerequisite lessons 01–03 after approval; further bounded batches.
- Withdrawal visual independent rendered/teacher review; existing video playback/caption/transcript fit. Proposed hierarchy/pathway images are unproduced optional enhancements with complete text equivalents.
- After approved integration: rendered manuscript fidelity, affected interactions, saved-work compatibility, keyboard/accessibility, Studio/editability and print checks. Packaging/deployment/actual Brightspace certification remain separately authorized later work.

## Known risks

- This is an authoring review, not a rendered learner candidate. Complete manuscripts must not be compressed during later integration.
- The standalone HTML review is readable content, not an interaction-complete course preview. Browser visual inspection of it is unverified due to the file-URL block; teacher approval and all integration/release gates remain pending.
- The separately requested working evaluation app is interactive and uses isolated test saves; it is not a learner release. Do not mistake its compiled runtime for a canonical edit or refresh it over teacher file edits. Explicit --refresh-generated verifies every derivative against its manifest before rewriting and refuses drift. Same-port restart is needed to retain the browser save origin.
- Local browser refused a file-SVG preview; no security workaround attempted. Source/relationship inspection is distinct from full visual acceptance.
- Three NCBI verification URLs challenged lead access; equivalent consequential science checks used successful sources. Do not represent every author-reported retrieval as independently fetched.

## Exact next action

Have Dean evaluate the working first-three-lesson copy and provide explicit teaching-content approval or requested revisions before canonical integration or Chapter 19 calibration.

## Exact next file to open

/Users/deanguedo/Documents/GitHub/canvas-helper/projects/biology30-unit-a-pilot-3/meta/teaching-overhaul/2026-10-02-browser-authoring/working-copy/index.html

## Do not do next / warnings

- Do not change course HTML/runtime/styling, compress manuscripts, edit raw source keys, activate blocked chapters, regenerate through retired builders, package SCORM, deploy, certify Brightspace or promote a universal standard without the corresponding approval.
