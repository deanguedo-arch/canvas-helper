# Phase 1 CTS audit — supplied-assets addendum

**Verdict: not ready for independent student release.** This adds actual asset and simulator findings to the earlier HTML audit. It is an audit/developer handoff, not a corrected learning package.

## Scope and limitations

Inputs: `sportswellness-phase-1(2).html` and `assets.zip`, supplied in this conversation. Inspected all nine teaching figures; read the 13-page companion reading's extracted text and inspected its relevant page renderings; visually surveyed all 18 slide pages and inspected selected problem pages at full size. Read the game application source and exercised the supplied compiled bundle, rather than judging the game only from its filename or wrapper.

Browser checks: Chromium at 1440×1000, 1100×900, 768×1024, and 390×844 CSS pixels. Navigation to hosted/local URLs was restricted in this environment. Therefore the test harness inserted the supplied images as data resources, inserted the original bundled game/CSS in an iframe `srcdoc`, and substituted in-memory storage for the parent course. Source teaching content/game logic was not rewritten. These tests establish visual/component behaviour under the stated harness, NOT live Brightspace integration, actual browser persistence, school-network video access, physical-device usability, or formal accessibility compliance.

The screenshot `game-idle-failure-desktop.png` is a reproducible component test, not student work. No real student information was used. Original input files were not modified.

## Updated package result

All 13 direct asset references in the main HTML resolve after extracting the archive beside it: nine instructional figures, logo, game runtime, reading PDF, slides PDF. The active game runtime's two linked CSS files and compiled JavaScript bundle are present.

However, `assets/phase1/arousal-continuum.svg` is only a decorative shell around `<image href="./phase1-arousal-continuum.png">`. That PNG is absent. The rendered result is an empty dark panel. Restore as a self-contained SVG or embedded image rather than relying on an external raster inside an SVG used through an HTML img element. Check nested asset dependencies, not just main-page src attributes.

## Priority 0 — fix before student release

### A01. Blank activation continuum
- Location: Topic 02, “See the activation continuum”; `assets/phase1/arousal-continuum.svg`.
- Evidence: `complete-dependency-audit.json`, `arousal-continuum.png`, `1440-key-terms-figure.png`.
- Change: replace the shell with a complete, legible, self-contained diagram. Keep arousal distinct from anxiety; do not imply a fixed personal midpoint or attach a diagnostic label to an arbitrary scale.
- Acceptance: open the supplied course and standalone graphic with no sibling raster dependency; low/high activation and the intended relationship are actually visible. A missing nested resource must fail the packaging test.

### G01. Game feedback contradicts its own displayed state
- Active file: `assets/game/original/phase1-game-runtime.html`, which loads `phase1-game.bundle.js`.
- Source locator: `phase1-performance-state-simulator-game.app.js`, lock-loss branch ~lines 343–349 and final feedback ~lines 699–713.
- Reproduction: begin a round and leave the pointer stationary. Tracking lock drains and the round ends after about 3.4 seconds. Observed activation was 60, labelled IDEAL PERFORMANCE STATE. The review nevertheless says activation drifted outside IPS for too long and caused the breakdown.
- Actual programmed cause: target-tracking failure. Activation remained inside the game's own 35–65 band.
- Evidence: `game-idle-failure-desktop.png`, `game-functional-results.json`.
- Change: separate end causes and explanations. Example: “This round ended because the cursor did not remain near the target. Your activation stayed inside this game's practice band. That tracking result does not establish anything about your real anxiety or regulation skill.”
- Acceptance: exercise low-activation, high-activation, and tracking-only endings independently. Every feedback message must agree with the actual cause and final state. Do not infer a learner's psychological failure from pointer performance.

### D01. Student PDF alternatives disagree with the revised lesson
- Both are exposed in Resources as other ways to revisit the lesson, not merely archived author sources.
- Reading, `phase1-engine-content.pdf`, page 12, answer 4: “The Inverted-U assumes a shared moderate optimum.” Current HTML explicitly cautions against one fixed midpoint for everybody.
- Reading, page 12, answer 10, and goal graphic: process actions described as fully/100% controllable. Current HTML uses a more qualified comparison of direct control.
- Slides, `01-engine.pdf`, page 10: State Anxiety Level axis reads **30, 40, 40, 50, 60**. The duplicate tick is a visible graphic error. The numeric scale also needs a defined meaning or removal; the HTML treats these as schematic ranges.
- Slides, page 14: breathing is described as the only physiological function with voluntary/autonomic control, a manual override, and a direct safety signal that intercepts the stress response. This is stronger and more literal than the revised lesson's gentle-routine and metaphor qualifications. Reconcile the claims explicitly during revision rather than treating the versions as equivalent.
- Change: temporarily remove these two learner-facing alternatives or revise them against the approved lesson wording. Maintain originals in developer-only source records. Do not make struggling learners decide which version is authoritative.
- Acceptance: compare each key definition, model axis, controllability claim, breathing explanation, and answer key across lesson, graphics, PDFs, quiz, and game. No contradictory assessed explanation.

## Teaching-image decisions

| Student-linked asset | Decision | Required action |
|---|---|---|
| `same-pressure.webp` | Keep content | Clear demand/appraisal comparison; no guaranteed outcome. Improve inline readability by moving full-sentence explanations into live HTML or providing a wider/stacked treatment. |
| `body-signals.webp` | Keep content | Useful “signals are not proof” framing. Portrait is a visual anchor, not a diagnosis. Keep bodily signs separate from inferred feelings and provide legible text outside the bitmap. |
| `model-comparison.webp` | Keep content; change presentation | The strongest comparison figure. Retains dominant-response qualification, state-anxiety versus arousal axes, and catastrophe condition. Teach one model at a time before the four-panel summary; tiny labels should not be the primary explanation on phones. |
| `arousal-continuum.svg` | Replace/repair | Missing nested raster; currently blank. |
| `goal-control.svg` | Revise | Replace “100% controllable” with the course's qualified “more directly controllable actions.” Add one concrete example per goal type. Clarify that upward arrows mean process can support performance/outcomes, not a move toward increasing control. |
| `ideal-performance-state-map.webp` | Revise | “Challenge vs. threat framing changes the outcome” is too certain beside the opening lesson's explicit no-guarantee distinction. Use possible influence on attention/action. Consider “Performance state” as the centre: stress/anxiety arrows should not imply these automatically create an ideal state. |
| `attention-field.webp` | Revise | Keep the three-panel comparison, but replace the categorical subtitle with a possible/task-dependent relationship. Show the SAME sport scene and same relevant cues in all three panels; currently the distractor objects and surroundings change, not just attended information. A narrow target can be useful for a different task. |
| `stress-process.svg` | Revise | Keep numbered cycle; simplify wording and clarify that the centre's appraisal “pivot point” belongs to Stage 2, not a fifth stage. Current central text is cramped; shorten labels and give the diagram more breathing room. Keep response descriptions conditional, consistent with the lesson. |
| `regulation-toolkit.svg` | Revise | Rename “Elite Operator Toolkit” to “Performance Regulation Tools.” Align safety-signal/reset/guaranteed anxiety-reduction language with the more qualified lesson. Breathing text presses across its box edge in the rendered asset. Use real labels and readable explanatory HTML. |

This is **three keep-content figures, five revise figures, and one broken graphic**, not a recommendation to discard all visuals. The priority is instructional consistency and readability, not decorative replacement.

## Priority 1 — game learning design and usability

### G02. The game does not model all the concepts it names
The game drives a single activation variable. At >=100 it ends with “Catastrophe Phenomenon (Panic / Cognitive Overload).” There is no separately modelled cognitive-anxiety variable, despite the lesson specifying BOTH cognitive anxiety and physiological arousal in that model. Its lower range is labelled “apathy” and upper range “panic.” These are not distinctions the game's numerical state establishes.

Revise the game as a clearly labelled simplified activation/attention exercise. Use neutral state labels and cause-specific feedback. Keep 35–65, ±15 action changes, pace drift, and the drawn curve explicitly fictional. The guided lab uses a different 40–65 band; different scenarios may have different bands, but neither is a universal learner target. Avoid an “IPS” label implying that getting a cursor into a numeric band produces flow.

### G03. Current game completion is failure/survival based
The code provides no fixed successful learning endpoint; it ends at an activation bound or when tracking lock expires. The gameover screen labels this Regulation Failure, Simulation Terminated, Survival Time, and Pedagogical Review. This is more punitive/technical than the course's thoughtful “choose, explain, adjust” teaching.

Recommended design: short fixed rounds, a prediction before each round, optional moving target, one cause-specific feedback message, and a transfer explanation. Assess reasoning, not pointer score. Keep the current chase mechanic only as an optional extension after correcting its feedback.

### G04. Pause, navigation and evidence
A test round continued/end-failed after navigating to a different course topic. The application source has no explicit pause/resume, parent-route exit handshake, or learner mute control. The main course's game state remained `{attempts: [], interrupted: null}` after a completed failure. The game does not emit an attempt to the parent collection; the parent saves only the separately typed debrief.

Add explicit pause/resume and stop-on-topic-exit/visibility handling, plus a clear end-round control. Decide what evidence is retained. Prefer a small meaningful record (scenario, decision, explanation, result, limitation) over a raw score. Do not advertise collected game evidence unless that integration exists. Verify in Brightspace after implementation.

### G05. Phone layout needs redesign, not just width reduction
At an iframe viewport of about 388×648, the game document was ~1153px high. The opening overlay was constrained to a 360px-high, overflow-hidden playfield, while its Begin Simulation button's original bounding box lay below that clipping area (top ~1239px, bottom ~1299px). The ordinary full-document screenshot does not show the complete introduction or Start button. An automated locator click DID succeed by scrolling containers; this is not proof of a comfortable touch workflow and should not be reported as an absolute inability to start.

Evidence: `phone-game-full-document.png`, `phone-game-bottom-before-start.png`, and geometry in `game-functional-results.json`.

Move introduction outside the clipped arena, keep start controls visible, and keep activation controls close to the playfield. Avoid nested scrolling. Add an equivalent untimed route with all three decision types. Test actual touch and keyboard/screen-reader routes rather than treating a tap handler as accessibility approval.

## Priority 1 — layout/readability

The main school theme can stay. No horizontal page overflow was detected in the eight routes checked at four widths. But fitting within the viewport is not the same as being readable.

- At desktop width 1440, the opening 1440px-wide bitmap displayed ~495 CSS pixels wide: much of its explanatory text is very small beside the 17px lesson text.
- At phone width 390, several detailed teaching images display ~334px wide. In the four-model comparison, opening the initial fit-to-screen zoom still produced only a ~344px-wide image; the learner must then choose Actual size to obtain a 1440px-wide scrollable view.
- At width 768, the desktop sidebar remains open, and repeated nested padding/margins shrink the toolkit image to ~162px wide. See `tablet-toolkit-layout.png`.

Revise the sidebar breakpoint and nested figure margins. Use wider figure rows or stacked cards for text-heavy content. Keep labels/captions/live descriptions in HTML, with the diagram supplying relationships. Make the normal reading view sufficient for essential teaching; zoom should be supplementary.

## Prior HTML release blockers remain

The newly supplied assets do not alter the main HTML. This pass reconfirmed the My Work route defect under the stated emulated-state test: a typed response was in the course state, but `#process-summary` was empty after ordinary course navigation.

The previous audit's checkpoint reset, recovery/backup controls, completion-versus-review distinction, 28-field workload/repetition, fictional-case consistency, and submission requirements remain unresolved in this supplied HTML. Those original findings are retained, not claimed as newly tested in a real storage/LMS environment by this addendum.

## Videos and Alberta CTS scope

The archive supplies graphics, PDFs and game files, not a new video collection. The original video-curation findings therefore remain. This pass does not certify playback/captions, age restriction, embedding, or school filtering for every external link. Maintain a genuinely self-contained written route. Recheck videos in the real student environment.

REC1050's official course description emphasizes mental fitness and performance/motivation in sport, artistic and academic contexts. The course need not frame every learner as an elite athlete or operator. This remains a Phase 1 resource audit, not certification that the full CTS credit's outcomes are met.

## Recommended release sequence

1. Repair the blank continuum; remove or correct false simulator feedback; withhold unreconciled PDFs from the student Resources route.
2. Fix previously identified saving/collection/checkpoint and submission-workflow blockers.
3. Revise the five inconsistent figures; keep and improve presentation of the three strongest figures.
4. Fix tablet/phone reading widths and the simulator's clipped introduction. Make guided decision practice the default; repair game logic before retaining it as an option.
5. Define equivalent required evidence across guided, game and untimed routes. Pilot in actual Brightspace with student accounts and physical devices. Confirm resume, export/submission, navigation, and a learner's ability to explain a NEW scenario.

**Release criterion:** a learner can find the required work, understand the same concept consistently across formats, make and justify a decision, and recover/submit their work without teacher rescue. More media and another aesthetic redesign are not the priority.
