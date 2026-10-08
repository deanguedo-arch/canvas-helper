# Revision record — 1.2.0

## 1.2.0 — reversible learner navigation

- Added a persistent **Previous** control to the game masthead.
- Added a second Previous control at the bottom of practice, transfer and review flows for easy navigation after scrolling.
- Previous navigation now preserves the exact in-session round state instead of silently creating a new round.
- Learners can move from P04 back through P03/P02/P01, return to the worked example, or return from review to transfer, then continue forward with later work restored.
- The How It Works guidance now explicitly explains that moving backward preserves work.
- No science content, accepted answers, curriculum claims or visual-standard version changed in 1.2.0.

## 1.1.0 — prior repaired build

## Baseline

Source: `CURRENT_GAME/` in Dean's uploaded `Science24_A1_Reaction_Detective_ChatGPT_Audit_2026-10-06.zip`. The older prototype inside `ORIGINAL_HANDOFF/` was not used as the editable baseline. Input archive SHA256 is recorded in `provenance/INPUT.json`; original code files and hashes are retained. Repair scope is the standalone A1 component only.

## Fixed

1. **Stale success/progression:** introduced a DOM-independent state engine, immutable successful snapshots, answer fingerprint, explicit revision and a four-item self-review gate. Old success cannot survive an edited answer.
2. **Erased history:** cumulative seen records, complete attempts, hints, reopens and first response now survive investigation restart and replay. Whole-session restart is explicit and confirmed.
3. **Uncertainty bypass:** P01's scientifically justified limited-evidence answer now opens a follow-up rather than granting case completion. Decisive knowledge survives later reopens.
4. **Evidence validation:** test exact authored supporting pairs, not merely two checked boxes. Wrong/weak records receive targeted explanations; fixed selection budget cannot be bypassed through duplicate IDs.
5. **Unverified alternative:** removed unconditional composition acceptance from P02. Corrosion is the checked target.
6. **Terminology:** P03 shows Acid–carbonate / neutralization as one contextual label; feedback distinguishes the specific gas-producing pattern.
7. **Application omissions:** P02 checks barrier protection; P04 checks the emissions connection.
8. **Ambiguous environmental answer:** P04 explicitly asks for the carbon-containing product, because water vapour is also a greenhouse gas. The source context no longer pre-exposes all inlet/outlet identities.
9. **Scaffold fading:** increasing independence across the four practice rounds and conventional final transfer. Hints are bounded and follow complete unsuccessful attempts, not empty input.
10. **Focus and announcement drift:** removed whole-application live behaviour; native labelled controls, action-specific focus, targeted status messages and safe modal focus.
11. **Visual convergence:** charcoal header, forest-green titled panels, three-zone investigation board, strong case hierarchy, exact authored SVG icons, subdued selected states and feedback/key-idea strip. Mobile stacks the same system; final transfer deliberately removes the board.
12. **Art contamination:** switched peroxide to a clean supplied alternative; cropped the antacid label. Formula identities and observations are authored text.
13. **Resilience:** real image failure fallback; learner text escapes markup and wraps long strings; controlled reduced-motion behaviour; clearer input/button borders and hidden-until-focus skip link.
14. **Delivery:** a self-contained `PLAY.html` plus maintainable multi-file source, actual screenshots, provenance, reproducible test scripts and raw test receipts. No runtime dependency installation.

## Intentionally preserved

Six case IDs and core scientific stories; one worked/four practice/one transfer structure; anonymous in-memory state; no time scoring, learner profiling, network calls or LMS writes; authored science separate from decorative art; written explanations ungraded by automation; locked visual standard v0.1.

## Not silently expanded

No new adventure system, animation engine, avatar, sound dependency, medical instructions, hazardous practical activity, question-generation model, login, cloud save or student data collection. No claim of full Unit A coverage. No course activation, host navigation, metadata/progress registration, SCORM build or deployment.

## Final checks outside this environment

Teacher review, a real phone, VoiceOver/NVDA, Safari/Firefox, native browser zoom and the target course host. Automated Chromium and CSS-zoom checks are documented, not misrepresented as those tests.
