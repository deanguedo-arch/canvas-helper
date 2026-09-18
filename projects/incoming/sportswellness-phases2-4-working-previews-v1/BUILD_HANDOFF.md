# Sports Wellness · Phases 2–4 working previews

**Milestone:** local learner preview v1, prepared 17 September 2026 (Alberta time).  
**Release state:** local review candidates. Student/LMS release remains blocked pending the checks below.  
**Repository:** no GitHub files, branches or production courses were changed.

## Open the modules

Extract the complete ZIP, then open `OPEN_PHASES.html`. Each phase also opens independently through its own `index.html`; keep the companion folders beside it.

For a stable local review origin, run `python3 start_preview.py` from the extracted bundle. It serves only on this computer at port 8765 and opens the launcher. This helper has not been exercised through an actual browser URL in the execution environment. Do not switch between file launch and a different server/port when checking resume; those are different browser storage contexts. Keep a backup before changing devices, paths or launch methods.

The three folders are:

| Module folder | Assignment | Reading |
|---|---|---|
| `sportswellness-phase-2` | My Motivation Plan | `assets/readings/phase2-drive-reading.pdf` |
| `sportswellness-phase-3` | My Focus Plan | `assets/readings/phase3-focus-reading.pdf` |
| `sportswellness-phase-4` | My Confidence and Rehearsal Toolkit | `assets/readings/phase4-toolkit-reading.pdf` |

## What is built

Each module has 18 working routes: 12 numbered topics and six supporting routes. The learning sequence is Overview → eight Learn topics → decision practice → Build → written review and checkpoint. My Work, My Notes, Resources, the course guide, an optional game and untimed practice use the shared shell.

Every Learn topic contains an explanation, a complete worked example, two formative checks with reasoning, a saved primary application and a local alternate explanation. Completion guides start closed and specify the actual required work. Activity shortcuts lead to the relevant work. Figures have captions, enlargement and live written explanations.

Each five-step Build assignment contains **12 distinct required evidence fields**. Reuse is explicit and asks before replacing edited work. Each phase has four written review prompts with first-answer snapshots and revisions. Checkpoints retain the original identities: 10 in Phase 2, 12 in Phase 3 and 12 in Phase 4. Correct-answer positions now include A–D, without changing conceptual keys merely for balancing.

The required practice route is all three guided cases and a transfer, or the equivalent three untimed cases and transfer. Timed games are optional. A fictional case is available throughout, with sport, academic and artistic/recreational examples. The text does not require private beliefs, named personal support contacts, injury reports, vivid imagery or claims of confidence.

## Applied audit corrections

**The Drive:** amotivation is separate from intentional regulation; integrated regulation remains extrinsic; the continuum is not a compulsory ladder. Values are connected to observable actions, not judgments about character. Recovery questions ask about information, support and a discussed adjustment, not self-diagnosis or pushing through a stop signal. Repeated original values/goals/support/narrative fields are consolidated.

**The Focus:** attention changes with the task. Missed information is not treated as a unique diagnosis. Gallwey’s framework is attributed and distinguished from anatomy or measurement. The free-throw case is introduced before application. Preparation, cues, resets and unfamiliar-case transfer are explicit.

**The Toolkit:** useful action does not require certainty. Corrective feedback is retained. Confidence-account and flat-tire language are identified as metaphors. Decorative physiological numbers and unsupported neurological-equivalence/myelin claims are not carried into the learner materials. Imagery, written/spoken sequences, storyboards and walkthroughs can demonstrate planning; the rubric does not grade a claimed internal experience.

The original target/card/timing game mechanics are retained. Dependencies are local. Feedback describes game inputs and rules; all three have Start, Pause, Resume, End and Restart controls, keyboard support and validated summary messages. Phase 3’s residual “Self 1 Control” message was found during testing and changed to “Input outside the timing window.” Its stage labels now describe timed game stages, and its saved score matches the displayed game score rather than raw points.

## Saving and evidence

All work is local to the browser. No LMS calls, network saving, analytics or automatic submissions are present. Each module has an isolated `canvas-helper:sportswellness-phase-N:state` key. Legacy assignment storage is not read or automatically migrated.

My Work collects responses, notes, snapshots, practice records, checkpoint information and game summaries. Return links reopen the correct response, Build step, review question or lab case. Notes support separate entries, timestamps, Delete and immediate Undo.

Checkpoint drafts and submitted feedback persist in the phase state. Incomplete attempts are rejected; repeated unchanged submissions do not add records. Earlier-version results do not satisfy the current-version threshold. The 70% threshold is formative practice, not a teacher mark.

Backup import validates identity, version and record types before changing work. It requires replacement confirmation and keeps a prior-state recovery copy. Invalid, unrelated and cross-module files leave current work unchanged. The permitted 20,000-character response length is preserved, not silently truncated. Browser-save failures and unreadable existing state produce a warning rather than a false “saved” message.

My Work’s print action creates a readable copy. It does not submit work and is not an importable backup. Backup/import lives in the course guide’s recovery disclosure.

## Source accounting

The contracts and per-phase review records account for **104 original assignment controls**, **44 original teaching sections**, **34 checkpoint identities**, **16 conceptual figures** and **29 catalogue video records**. Original checkpoint wording, choices, keys and explanations are preserved beside their replacements. Original Phase 2 written-review questions are mapped across the new lesson/application/lab/review work; their exact original prompts are included.

Six, five and five corrected native SVGs replace the dense figure presentations. Original filenames and hashes identify the historical PNGs. The large historical image library remains in the original all-phases ZIP already supplied; this handoff does not duplicate that 114 MB library.

The original 44/25/58-page decks and available 19/13-page original readings are retained in the combined developer reference folder. Unreconciled decks are not linked in learner Resources. There was no original Phase 4 reading PDF; its new chapter is explicitly authored for this build.

The new reading PDFs are generated from the same canonical lesson markup and matching authored question/Build/glossary records. They include selectable text, Letter pages, contents, bookmarks, figures, worked examples, applications, lab summaries, assignment steps/rubric and a separate answer section after the questions. They are an alternate reading format—not an additional assignment.

The audit’s media appendices were actually present in the supplied audit ZIP. The intake record corrects the specification’s statement that they were missing.

## Videos

**No external videos are activated.** The five shortlist entries could not be certified for actual publisher/title, segment, captions, accuracy and playback. All 29 catalogue records are retained with explicit dispositions. Candidate lesson purposes and application questions are included for later review. Complete local teaching and alternate explanations remain available; there are no “coming soon” players or empty video controls.

## Design reference and what parity means here

The latest **uploaded repaired Phase 1** workspace is the frozen available baseline. The newer uncommitted Mac workspace identified in the specification was not supplied, and the connected GitHub default-branch copy predates the repair upload. The prepared generation kit was not attached; the source inventories and template use were prepared from the available files.

The full stylesheet and Next Step logo are copied unchanged. The stylesheet SHA-256 is:

`b5f0822a0ec80c4d854ba8e7a97bc5234d283813ffb78a5fa9e35aba8d0c63ea`

The shell, component classes and matching wrapper variants are reused. Phase-specific content/configuration changes are separate from the shared runtime. Existing `p1` styling hooks deliberately remain.

**This is not a claim of exact parity with the unavailable newest local reference.** Compare that reference before final integration rather than substituting the older GitHub file or silently calling this the current master.

## Verification actually performed

| Check | Recorded result |
|---|---|
| 54 routes at 1117×902 and 390×844 | 108 route/viewport runs passed; top, activity and bottom captured |
| Saving, My Work, reuse, review, quiz, recovery, notes, games and export logic | 185 recorded component assertions passed |
| Available-reference computed-style comparisons at seven viewport sizes | 21 phase/viewport comparisons matched |
| Matching component wrapper variants | 36 comparisons matched |
| Active HTML IDs, local links and direct assets | No duplicate IDs, broken internal anchors or missing direct local assets found |
| Core remote dependencies | None in the learner modules; game dependencies are local |
| Reading documents | Selectable text, bookmarks and page bounds checked; rendered contact sheets and sampled full-size pages reviewed |

The additional sizes include 1440×900, 1024×902, 1023×902, 768×1024 and 430×900. The breakpoint pair specifically checks the drawer behaviour.

**Harness limits matter:** URL navigation was denied in the execution environment. Chromium component fixtures inlined local assets and used an emulated storage object. Saved-state reconstruction is not a real browser shutdown/reload test. The embedded-game fixture supplied the launch nonce normally read from its URL; real application logic and message validation ran. Backup downloads were exercised. The print function emitted a safe complete document into a capture fixture; the actual print window/dialog was not certified.

The hydrated game frames were also captured at both main viewports. Final visual inspection caught a mixed-clock elapsed-time error in the Phase 4 game; it was repaired, and three specific elapsed-time/pause/resume regressions passed. The narrow-screen counter strip was also made to wrap within the game iframe.

Screenshots and machine-readable results are in `developer/tests`. The tools preserve these limitations in their documentation. Viewport tests are not physical-device or assistive-technology certification. Automated bounds checks and representative visual inspection do not replace a student usability pilot.

## Workload and reading review

Core teaching totals approximately 3,496 / 3,454 / 3,539 words, plus 568 / 633 / 584 worked-example words. This excludes optional support, questions, field instructions and answer keys. Each learner completes one—not both—decision pathways.

A planning allowance is roughly **3–5 hours per phase**, spread over shorter sessions. This is an estimate from approximately 4,100 words of core/example reading, 16 checks, eight lesson applications, decision practice, 12 Build fields, review and checkpoint—not a completion-time requirement or validated student average. Reusing earlier responses can reduce retyping. Pilot reading confidence, revision time and accessibility needs before fixing a timetable.

Heuristic readability estimates average about 9.2 / 8.9 / 9.7, with technical-vocabulary passages ranging roughly 7.9–10.9. These calculations are editorial signals, not certified reading ages. Review the vocabulary-heavy Toolkit explanations with actual learners rather than claiming every paragraph has passed a Grade 8–9 test.

## Remaining gates before student release

1. Compare against the actual newest Phase 1 workspace and approve any shared-template differences.
2. Test real launch, browser close/reopen, backups and print export on the intended computers and browser origins.
3. Integrate through the existing Codex workflow without changing phase identities or importing old student data silently. Keep candidates blocked.
4. Resolve SCORM response capacity deliberately; do not truncate text to make a package fit. Verify actual Brightspace resume, completion and submission separately.
5. Test physical phones, keyboard-only navigation, assistive technology and school-network behaviour. Verify any external video before activating it.
6. Complete a small student pilot and the teacher’s outcome/evidence review. Fictional written plans do not automatically satisfy personal-assessment or physical-demonstration outcomes.

The introduction, final Performance Playbook, replacement slide decks and production SCORM packages are outside this milestone. The curriculum map records remaining evidence rather than awarding credits from a browser preview.
