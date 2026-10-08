# Reaction Detective — repaired build v1.2.0

**Science 24 · Next Step · A1**  
Prepared 6 October 2026, local Alberta date. Some machine-generated receipts are dated 7 October in UTC.

This is the **actual revised game**, not a new mockup package. The original six-case sequence and approved visual standard v0.1 are preserved. The code, responsive interface, answer lifecycle, feedback and source wording have been repaired. No live repository, course, student records, LMS adapter or deployment has been changed.

## v1.2 navigation refinement

Learners can now move backward through the activity without losing their current work. A persistent **Previous** control appears in the masthead and again near the bottom of case/transfer screens. Returning to an earlier case restores its exact in-session draft/submitted state; continuing forward restores later in-progress work rather than silently resetting it. The review screen can return directly to the transfer challenge.

## Start here

**For Dean:** open `PLAY.html` in a browser after extracting the ZIP. This is the self-contained build: images, styles, scenario records and JavaScript are embedded. Keep it as one file; there is no installation, login or network dependency. Browser/application security policies may restrict opening HTML attachments; open the extracted file in an actual browser rather than an attachment preview.

**For Codex:** use the complete `game/` directory as the editable implementation. Its `index.html` uses local files and classic JavaScript, with no package manager or build tool required at runtime. Read `CODEX_INTEGRATION_HANDOFF.md` before replacing anything in the repository.

For an HTTP preview where local policy allows it:

```sh
cd game
python3 -m http.server 8000
```

Then open `http://localhost:8000/`. The self-contained `PLAY.html` and source-folder build contain the same game. To rebuild the standalone after editing the source:

```sh
python3 scripts/build_standalone.py
```

**Session boundary:** all work is in memory. Reloading, closing the tab or explicitly starting a new session clears it. The review can be printed locally. There is no automatic saving or submission to a teacher.

## What changed

| Area | Revision |
|---|---|
| Visual identity | Restored the charcoal course header, forest-green section bars, Case / Evidence / Reasoning panels, modest white cards, pale-green selections and anchored feedback section. Transfer deliberately becomes a plainer exam-style task. |
| Progression integrity | Correct submissions become immutable snapshots. Controls lock. `Revise answer` clears permission to advance; a new check and all four self-review items are required. |
| Attempts and support | Case reopens preserve seen evidence, submitted attempts, hints, the original prediction and the first complete response. An investigation restart cannot manufacture independent success. |
| Scientific uncertainty | P01's justified uncertainty is a checkpoint, not case completion. A labelled identity follow-up lets the learner revise. Previously seen decisive evidence cannot be silently forgotten. |
| Practical/application reasoning | P02 now checks a corrosion-limiting response. P04 checks the carbon-containing greenhouse-gas product, avoiding a false CO₂-versus-water-vapour distinction. |
| Terminology | P02 checks corrosion rather than automatically accepting an unverified composition explanation. P03 uses a combined acid–carbonate / neutralization label. |
| Scaffolding | A worked example leads to 3/2/2/1 available hints, increasingly concise prompts, removal of sentence starters, and a final task with no hint, token, photo or early model answer. Hints follow meaningful unsuccessful attempts. |
| Access and robustness | Native inputs, local focus changes, targeted status announcements, native confirmation dialogs, mobile reflow, reduced motion, contrast checks, escaped/wrapped learner text and missing-image fallbacks. |
| Scientific art boundary | Replaced the labelled peroxide scene with a clean supplied alternative; cropped the antacid bottle label out. All authoritative evidence is HTML, never photo markings. |

## Files that matter

- `PLAY.html`: single-file playable version.
- `game/`: editable source and six local WebP context images.
- `reference/`: the unchanged approved visual standard and canonical A1 style reference. **The reference image is a visual reference, not a science answer key.**
- `qa/screenshots/20_actual_game_desktop.png` and `21_actual_game_mobile.png`: actual repaired runtime, not generated concept art.
- `qa/TEST_REPORT.md` and raw receipts: tests performed, methods and limits.
- `docs/SCIENCE_AND_SCOPE.md`: specific curriculum targets, source checks and what is not covered.
- `docs/RULES_AND_STATE.md`: exact rule/answer/attempt contracts.
- `docs/CHANGELOG.md`: repairs and preservation decisions.
- `provenance/`: baseline code and hashes linking this build to the supplied Codex snapshot.

## Testing and release status

This package includes passing automated engine, full-route browser, responsive, touch-emulation, keyboard and robustness checks. See `qa/TEST_REPORT.md` for exact counts and scope.

It is **not** labelled 100% curriculum mastery or certified classroom release. Teacher review of explanations and assessment demand, physical-device/assistive-technology testing, Safari/Firefox checks and the intended course host remain distinct final checks. The managed authoring browser blocks direct `file://` and localhost navigation, so tests executed the **exact embedded HTML bytes** through Chromium's document loader. No host, attachment-viewer or LMS routing pass is claimed.

Nothing in this ZIP activates or publishes the blocked course, registers required progress, saves student information or creates a SCORM package.
