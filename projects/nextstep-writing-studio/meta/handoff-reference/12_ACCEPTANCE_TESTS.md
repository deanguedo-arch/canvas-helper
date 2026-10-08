# 12 — Acceptance test catalogue

**These are requirements for the app Codex will build, not tests already passed by that app.** All entries begin NOT_RUN. P0 is a release blocker; P1 is required before broad rollout unless the owner documents a narrow pilot exception. P0/P1 here denote severity, not the P0–P7 engineering phase numbers.

Every automated run records source commit, versions, input fixture and output evidence. Use synthetic data only. Live tenant tests cannot be marked passed by a mock player.

## SAVE-01 · P0 · Fresh launch hydration
**Environment:** mock+browser.

**Run:** Launch with successful empty suspend_data read; do not click anything.

**Pass only when:** No SetValue of workspace occurs before explicit first action; first-run screen visible.

## SAVE-02 · P0 · Failed read is not empty
**Environment:** mock+browser.

**Run:** GetValue returns empty string with error 301.

**Pass only when:** Recovery is shown; no empty state overwrite or student editor mutation.

## SAVE-03 · P0 · Initialize fails
**Environment:** mock+browser.

**Run:** Initialize returns string false or throws.

**Pass only when:** No learner-state writes; diagnostic and temporary/retry route.

## SAVE-04 · P0 · String false handling
**Environment:** mock+browser.

**Run:** Return "false" from SetValue and Commit separately.

**Pass only when:** Neither is treated as truthy success.

## SAVE-05 · P0 · Bound learner restore
**Environment:** mock+browser.

**Run:** Read valid payload with a different learnerKey.

**Pass only when:** Content/titles remain hidden; no automatic rebinding or overwrite.

## SAVE-06 · P0 · Wrong deployment
**Environment:** mock+browser.

**Run:** Use valid payload with another deploymentScope.

**Pass only when:** Stop restore; explicit portable import remains separate.

## SAVE-07 · P0 · Review and browse
**Environment:** mock+browser.

**Run:** Launch each mode with a valid existing draft.

**Pass only when:** Read/export works; editor/import/mutations disabled; no SetValue.

## SAVE-08 · P0 · Corrupt wire
**Environment:** mock+browser.

**Run:** Load corrupt-wire fixture.

**Pass only when:** Original raw preserved/exportable; no sample/default replacement.

## SAVE-09 · P0 · Future schema
**Environment:** mock+browser.

**Run:** Load schema 99 fixture.

**Pass only when:** Read-only recovery; no downgrade; original raw available for export.

## SAVE-10 · P0 · Idle autosave
**Environment:** mock+browser.

**Run:** Type stable text, advance fake timer 1499 then 1500 ms.

**Pass only when:** Save scheduled at idle threshold, no duplicate commit loops.

## SAVE-11 · P0 · Continuous autosave
**Environment:** mock+browser.

**Run:** Type continuously for 25 seconds with fake timers.

**Pass only when:** Maximum-wait saves at most 10 seconds apart while dirty.

## SAVE-12 · P0 · Local completion
**Environment:** mock+browser.

**Run:** Delay IndexedDB transaction success; then abort another transaction.

**Pass only when:** Saved locally appears only after success; abort gives failure.

## SAVE-13 · P0 · Stale save result
**Environment:** mock+browser.

**Run:** Capture revision N, type N+1 before its asynchronous encode/local save finishes.

**Pass only when:** N acknowledgement cannot mark N+1 clean; another save is queued.

## SAVE-14 · P0 · Commit fails after set
**Environment:** mock+browser.

**Run:** SetValue succeeds and Commit fails.

**Pass only when:** Unconfirmed/pending state; old+new recovery copies; no claim server unchanged.

## SAVE-15 · P0 · Backoff bound
**Environment:** mock+browser.

**Run:** Fail transport repeatedly with fake timers.

**Pass only when:** Retries 5/15/30 s only, then visible manual Retry; no infinite loop.

## SAVE-16 · P0 · Tab/device destination wording
**Environment:** mock+browser.

**Run:** Test session, device and off local modes.

**Pass only when:** UI says tab/device/none accurately; no persistent write under session policy.

## SAVE-17 · P0 · Dual-storage failure
**Environment:** mock+browser.

**Run:** Deny local storage and fail LMS save.

**Pass only when:** Text remains in memory; persistent Not saved and export/copy route.

## SAVE-18 · P0 · Visibility lifecycle
**Environment:** mock+browser.

**Run:** Hide/return to page repeatedly.

**Pass only when:** Flush when hidden without repeated Terminate/Initialize.

## SAVE-19 · P0 · Exit best effort
**Environment:** mock+browser.

**Run:** Close normally and simulate abrupt process kill.

**Pass only when:** Normal path attempts suspend/terminate once; kill is documented risk, not claimed guaranteed save.

## SAVE-20 · P0 · No grade side channel
**Environment:** mock+browser.

**Run:** Exercise all project states and export actions.

**Pass only when:** No essays in interactions/comments; no score or automatic completed/passed writes.

## CAP-01 · P0 · Warning boundary
**Environment:** pure+mock+browser.

**Run:** Generate ASCII wire lengths 43999,44000,49999,50000.

**Pass only when:** Warnings trigger at documented thresholds only.

## CAP-02 · P0 · Hard cap boundary
**Environment:** pure+mock+browser.

**Run:** Produce envelope lengths 56000 and 56001.

**Pass only when:** 56000 allowed; 56001 never sent to suspend_data.

## CAP-03 · P0 · Envelope overhead
**Environment:** pure+mock+browser.

**Run:** Compare raw base64 size with total prefixed envelope.

**Pass only when:** Budget uses whole envelope including digest/prefix/dots/padding.

## CAP-04 · P0 · Entropy cases
**Environment:** pure+mock+browser.

**Run:** Use natural prose, random high-entropy text, emoji and many evidence records.

**Pass only when:** No fixed words/projects capacity claim; actual encoded size measured.

## CAP-05 · P0 · Decompression bomb
**Environment:** pure+mock+browser.

**Run:** Feed a small gzip inflating beyond 1 MiB.

**Pass only when:** Inflation stops at output cap without allocating uncontrolled output.

## CAP-06 · P0 · Archive does not free
**Environment:** pure+mock+browser.

**Run:** Archive a large project without altering its text.

**Pass only when:** Serialized size still includes it; UI does not suggest space was freed.

## CAP-07 · P0 · Overfull current edits
**Environment:** pure+mock+browser.

**Run:** Type valid field content pushing wire over cap.

**Pass only when:** Newest text retained locally/memory; cloud write blocked; backup includes newest changes.

## CAP-08 · P0 · History pressure
**Environment:** pure+mock+browser.

**Run:** Fill optional local history above 5 MiB.

**Pass only when:** Optional old history can rotate; current/unsynced/pre-migration protected copies are not silently removed.

## IMPORT-01 · P0 · Full backup round-trip
**Environment:** pure+browser.

**Run:** Export demo workspace, validate, import into empty destination.

**Pass only when:** All project text/metadata/graphs preserved except documented IDs/binding/revision rebasing.

## IMPORT-02 · P0 · Project round-trip
**Environment:** pure+browser.

**Run:** Export one project with sources/evidence/notes/use anchors.

**Pass only when:** Entire project graph restored with correctly remapped references.

## IMPORT-03 · P0 · Bad checksum
**Environment:** pure+browser.

**Run:** Import bad-checksum fixture.

**Pass only when:** Reject before mutation; existing state hash unchanged.

## IMPORT-04 · P0 · Unknown schema/codec
**Environment:** pure+browser.

**Run:** Import future schema and unknown wire prefix.

**Pass only when:** Recovery/export-only; no best-guess parser.

## IMPORT-05 · P0 · Malformed JSON
**Environment:** pure+browser.

**Run:** Import truncated JSON and duplicate JSON keys.

**Pass only when:** Reject; source file retained; no state mutation.

## IMPORT-06 · P0 · Unknown fields
**Environment:** pure+browser.

**Run:** Import unknown-field fixture.

**Pass only when:** Reject or explicit compatible migration path; never silently strip.

## IMPORT-07 · P0 · Prototype pollution
**Environment:** pure+browser.

**Run:** Import nested __proto__, constructor and prototype keys.

**Pass only when:** Reject before any object merge; no prototype mutation.

## IMPORT-08 · P0 · ID collision
**Environment:** pure+browser.

**Run:** Import a project whose title/IDs match current work.

**Pass only when:** Default fresh IDs; original preserved; references remapped.

## IMPORT-09 · P0 · Duplicate IDs inside file
**Environment:** pure+browser.

**Run:** Import duplicate-project-id fixture and duplicate block IDs.

**Pass only when:** Invalid graph rejected, not guessed.

## IMPORT-10 · P0 · Dangling references
**Environment:** pure+browser.

**Run:** Make evidence.sourceId, use.blockId and note.blockId invalid.

**Pass only when:** Reject invalid backup; explicit deletion flow may set null, importer cannot silently guess.

## IMPORT-11 · P0 · Candidate over budget
**Environment:** pure+browser.

**Run:** Import/duplicate a small item into a nearly full workspace.

**Pass only when:** Measure resulting bound payload before apply; no partial import.

## IMPORT-12 · P0 · Cancel import
**Environment:** pure+browser.

**Run:** Inspect valid file then cancel preview.

**Pass only when:** Workspace hash unchanged.

## IMPORT-13 · P0 · Replace safety gate
**Environment:** pure+browser.

**Run:** Attempt full replace without reselecting a valid current backup.

**Pass only when:** Replace disabled; merge-as-new remains distinct.

## IMPORT-14 · P0 · Stale backup removal
**Environment:** pure+browser.

**Run:** Verify backup, edit project, then try remove.

**Pass only when:** Verification invalidated; no removal with stale backup.

## IMPORT-15 · P0 · Legacy exact raw preservation
**Environment:** pure+browser.

**Run:** Import legacy fixture with unknown keys/combined notes.

**Pass only when:** Exact responsesRaw/notesRaw retained; original keys unchanged.

## IMPORT-16 · P0 · Failed legacy parse
**Environment:** pure+browser.

**Run:** Legacy raw contains malformed notes JSON.

**Pass only when:** Raw remains exportable; no empty array fallback overwrite.

## IMPORT-17 · P1 · Repeat import
**Environment:** pure+browser.

**Run:** Import same valid file twice.

**Pass only when:** Recognize receipt and ask; intentional second copy allowed, no silent replacement.

## IMPORT-18 · P1 · Download blocked
**Environment:** pure+browser.

**Run:** Simulate denied download/print.

**Pass only when:** Fallback copyable export; no assumption that backup is safely stored.

## EDIT-01 · P0 · Typing and IME
**Environment:** browser.

**Run:** Enter accents, emoji, CJK composition, smart punctuation and long paragraphs.

**Pass only when:** Text/caret preserved; autosave does not interrupt composition.

## EDIT-02 · P0 · Supported paste
**Environment:** browser.

**Run:** Paste paragraphs, bold/italic/underline, lists and blockquote from synthetic Office/Docs HTML.

**Pass only when:** Supported visible text/structure preserved; unsupported styling removed.

## EDIT-03 · P0 · Malicious paste
**Environment:** browser.

**Run:** Paste script/events/iframe/svg and javascript links.

**Pass only when:** No execution or external fetch; safe text/schema output only.

## EDIT-04 · P0 · Table/image paste
**Environment:** browser.

**Run:** Paste a table and an embedded image.

**Pass only when:** Explicit plain-text table preview; image refused with explanation; no silent content loss.

## EDIT-05 · P0 · Oversized paste
**Environment:** browser.

**Run:** Paste more than draft field cap.

**Pass only when:** Entire insertion refused visibly; old text unchanged; source still recoverable.

## EDIT-06 · P0 · Undo atomicity
**Environment:** browser.

**Run:** Insert evidence then undo; paste formatted block then undo.

**Pass only when:** Each operation reverses as one meaningful history step.

## EDIT-07 · P0 · View/focus continuity
**Environment:** browser.

**Run:** Type, switch tabs/focus repeatedly, return.

**Pass only when:** Same document/undo/caret state retained; no second autosave source.

## EDIT-08 · P0 · Evidence edits do not rewrite draft
**Environment:** browser.

**Run:** Insert evidence then edit original evidence note.

**Pass only when:** Draft text stays unchanged; changed-source notification possible.

## EDIT-09 · P1 · Deleted anchor
**Environment:** browser.

**Run:** Delete/join paragraph referenced by feedback or evidence use.

**Pass only when:** Note/evidence text survives; anchor safely remapped/null with clear unlinked state.

## EDIT-10 · P1 · Word-count fixture
**Environment:** browser.

**Run:** Count punctuation, contractions, hyphens, emoji, NBSP, title and prompt.

**Pass only when:** Expected draft-only counts in tools tests; no title/prompt/evidence not inserted counted.

## EDIT-11 · P0 · Export formats
**Environment:** browser.

**Run:** Export TXT, HTML and Print from formatted synthetic draft.

**Pass only when:** No app chrome or executable content; structure/text preserved; no fake DOCX.

## EDIT-12 · P1 · Ready/reopen
**Environment:** browser.

**Run:** Mark ready then attempt to edit.

**Pass only when:** Explicit reopen updates status; never reports LMS course completion/submission.

## UI-01 · P0 · Canonical style
**Environment:** browser+manual.

**Run:** Capture Plan/Settings at 1440×960.

**Pass only when:** Light rail, bold sans headings, green primary, no fake D2L chrome; compare actual screenshots.

## UI-02 · P0 · Keyboard complete workflow
**Environment:** browser+manual.

**Run:** Create project, plan, evidence, draft, revise and export without mouse.

**Pass only when:** All actions reachable; no keyboard traps; focus returned logically.

## UI-03 · P0 · Screen reader
**Environment:** browser+manual.

**Run:** Run NVDA/Chrome and VoiceOver/Safari on editor/dialogs/save status.

**Pass only when:** Labels/structure announced; saving not announced per keystroke; errors persistent.

## UI-04 · P0 · Responsive matrices
**Environment:** browser+manual.

**Run:** Test 1440,1366,1024,768,390 and 320px content widths.

**Pass only when:** No page overflow or inaccessible primary/recovery action; context collapses before editor crushes.

## UI-05 · P0 · Zoom and contrast
**Environment:** browser+manual.

**Run:** Test 200% zoom, high contrast and reduced motion.

**Pass only when:** Readable/reflowed interface; focus/status not colour-only.

## UI-06 · P1 · Mobile keyboard
**Environment:** browser+manual.

**Run:** Open editor and form on phone/tablet virtual keyboard.

**Pass only when:** Caret and confirmation actions remain visible/reachable.

## UI-07 · P1 · Long/empty content
**Environment:** browser+manual.

**Run:** Use 160-character titles, long URLs, zero evidence, all archived, no guide matches.

**Pass only when:** No clipped fields; appropriate empty states; no fake sample student work.

## UI-08 · P0 · No screenshot UI
**Environment:** browser+manual.

**Run:** Inspect DOM and accessibility tree.

**Pass only when:** Controls are live HTML/CSS/SVG, not PNG hotspots/raster text.

## UI-09 · P0 · Scope-accurate features
**Environment:** browser+manual.

**Run:** Inspect all screens.

**Pass only when:** No live teacher threads, direct submission, grading percentages or screen-reader switch.

## UI-10 · P1 · Library authorship
**Environment:** browser+manual.

**Run:** Inspect all default guide examples.

**Pass only when:** Original fictional label and teacher-review flag; no screenshot quotations reused as verified sources.

## ISOLATION-01 · P0 · Two same-origin tabs
**Environment:** mock+browser.

**Run:** Open same binding concurrently.

**Pass only when:** One writer; other read-only with clear route; no forced healthy-lock takeover.

## ISOLATION-02 · P0 · Different learners shared browser
**Environment:** mock+browser.

**Run:** Save A, then launch B on same browser/origin.

**Pass only when:** B cannot see A titles/content/recovery candidates.

## ISOLATION-03 · P0 · Different course scope
**Environment:** mock+browser.

**Run:** Same learnerKey source ID, different deploymentScope.

**Pass only when:** Separate local recovery namespace; no automatic workspace transfer.

## ISOLATION-04 · P0 · Remote-empty local-nonempty
**Environment:** mock+browser.

**Run:** Reset mock remote while local candidate remains.

**Pass only when:** Recovery choice before any local upload; not auto-resurrected.

## ISOLATION-05 · P0 · Divergent heads
**Environment:** mock+browser.

**Run:** Alter local and remote from different known bases.

**Pass only when:** Explicit conflict preview, keep/export both; timestamps alone never choose winner.

## ISOLATION-06 · P1 · Lock fallback
**Environment:** mock+browser.

**Run:** Disable Web Locks; race IndexedDB lease acquisitions.

**Pass only when:** Single winner when fallback supported; otherwise honest unsupported coordination warning.

## ISOLATION-07 · P0 · Network quietness
**Environment:** mock+browser.

**Run:** Block all package-origin resource-external requests and inspect network log.

**Pass only when:** Core app works; no analytics, CDN fonts, remote previews or student-data requests outside SCORM bridge.

## ISOLATION-08 · P0 · Diagnostic privacy
**Environment:** mock+browser.

**Run:** Export logs after writing distinctive test text/title/ID.

**Pass only when:** No distinctive text/title/raw learner ID/suspend payload in diagnostic output.

## TENANT-01 · P0 · Actual first save/resume
**Environment:** live Brightspace synthetic learner.

**Run:** Create 3 projects and 3,000+ synthetic words; save/close/reopen.

**Pass only when:** Exact project/text hashes restored; record player/mode/API evidence.

## TENANT-02 · P0 · Clean-browser readback
**Environment:** live Brightspace synthetic learner.

**Run:** Close first browser; launch same activity in second with no local data.

**Pass only when:** Exact latest accepted workspace restored from LMS.

## TENANT-03 · P0 · Near-cap readback
**Environment:** live Brightspace synthetic learner.

**Run:** Use valid envelope near 56,000 chars.

**Pass only when:** Accepted and retrieved untruncated on clean browser; real configured limit recorded.

## TENANT-04 · P0 · Offline acknowledgement behaviour
**Environment:** live Brightspace synthetic learner.

**Run:** Disconnect while open, edit, trigger saves, reconnect/relaunch.

**Pass only when:** Observe actual player responses; save label never implies online confirmation known to be false.

## TENANT-05 · P0 · Expiry and failure
**Environment:** live Brightspace synthetic learner.

**Run:** Expire LMS session while editing.

**Pass only when:** No false saved status; export retains latest writing; safe reopen guidance.

## TENANT-06 · P0 · Pinned update
**Environment:** live Brightspace synthetic learner.

**Run:** Update sandbox object while content is pinned; relaunch.

**Pass only when:** Record exact version delivered and whether old payload remains; no assumed behaviour.

## TENANT-07 · P0 · Same-object version update
**Environment:** live Brightspace synthetic learner.

**Run:** Apply candidate to active synthetic learner in sandbox.

**Pass only when:** All text/metadata hashes survive or migration explicitly used; fail rollout otherwise.

## TENANT-08 · P0 · New-object migration
**Environment:** live Brightspace synthetic learner.

**Run:** Keep old object, export, import into new object, then clean-browser relaunch.

**Pass only when:** New workspace matches mapped content; old object/backup remain accessible.

## TENANT-09 · P0 · Review/retake lifecycle
**Environment:** live Brightspace synthetic learner.

**Run:** Exercise player review/retake choices in sandbox.

**Pass only when:** No inadvertent blank workspace destructive overwrite; settings/policy documented.

## TENANT-10 · P0 · Simultaneous different devices
**Environment:** live Brightspace synthetic learner.

**Run:** Open two device sessions and deliberately diverge synthetic drafts.

**Pass only when:** Record risk/detection limits honestly; no claim cross-device atomic locking exists.

## TENANT-11 · P0 · Course copy
**Environment:** live Brightspace synthetic learner.

**Run:** Copy activity into another sandbox course with new scope.

**Pass only when:** No local scope collision; no assumed LMS workspace continuity.

## TENANT-12 · P0 · Rollback after data write
**Environment:** live Brightspace synthetic learner.

**Run:** Write candidate schema then attempt planned rollback in sandbox.

**Pass only when:** Old code never overwrites unsupported schema; compatible code/data restore route verified.
