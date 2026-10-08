# A1 Reaction Detective — Master Handoff v1.0

## 1. Product intent

Reaction Detective is an exam-preparation learning game disguised as a clean science investigation. The game must be enjoyable and visually strong, but its real job is to make students better at the exact reasoning Alberta Science 24 asks of them: interpreting evidence, distinguishing physical from chemical change, classifying common reactions, and explaining a conclusion from data.

The game must never become a quiz with decorative art. The core mechanic is **evidence-based inference**.

## 2. Learner promise

By the end of the game, the learner should have practised how to:

- identify evidence that a new substance may have formed;
- distinguish strong evidence from suggestive observations;
- avoid treating bubbles, temperature change, colour change or odour alone as proof;
- distinguish physical and chemical change;
- classify selected decomposition, corrosion/composition, neutralization and combustion cases;
- explain how evidence supports a claim;
- handle a case where “not enough evidence” is the best current answer;
- transfer the reasoning to a plain, exam-like prompt with reduced scaffolding.

## 3. Locked visual direction

Use the approved Science 24 / Next Step visual system:

- near-black/charcoal global header;
- deep forest-green panel headers and anchors;
- brighter course green only for progress, selected states and confirmations;
- white dominant surface;
- pale gray and pale green-gray secondary surfaces;
- clean sans-serif typography;
- modest rounded cards and restrained shadows;
- realistic or polished contextual science imagery;
- exact science in deterministic UI.

Do not switch to neon cyan, glassmorphism, arcade HUD styling, mascots, sci-fi holograms, or a separate visual brand.

The canonical reference is `01_DESIGN/Science24_Games_Visual_Reference_A1_v0.1.png`.

## 4. Core game loop

Each practice case uses the same reasoning loop:

1. **Observe** — read the situation and base observations.
2. **Predict** — choose an initial claim before extra evidence is revealed.
3. **Investigate** — spend a limited number of investigation tokens on optional records/tests.
4. **Prioritize evidence** — choose the two pieces that best support the claim.
5. **Conclude** — select physical change / chemical change / not enough evidence, plus reaction classification when appropriate.
6. **Explain** — write a short evidence-based explanation.
7. **Feedback** — show what the selected evidence actually establishes and what it does not.
8. **Retry** — preserve the previous attempt during the case and allow revision without shame or score penalty.

The final transfer removes the token mechanic and hints. It presents a compact exam-like prompt and requires an independent explanation.

## 5. Stage flow

### S00 — Intro
- One-screen mission overview.
- Explains the three actions: inspect, build a claim, explain.
- Makes clear there is no speed score.

### S01 — Worked round
- Case W01: Peroxide Record.
- Complete reasoning is demonstrated.
- Explicitly labelled **worked example — does not count as independent evidence**.

### S02–S05 — Practice cases
- P01 Cooling Solution
- P02 Rusting Tool
- P03 Antacid Record
- P04 Furnace Combustion

Progressively reduce scaffolding. P01 emphasizes evidence sufficiency. P02 and P03 require stronger evidence selection. P04 expects classification + explanation with minimal guidance.

### S06 — Independent transfer
- T01 Boiling Water.
- No hints before submission.
- Plain language, reduced decoration, conventional assessment format.

### S07 — Review
Show:
- cases completed;
- hints/retries used by case;
- skills practised;
- transfer result;
- suggested next practice.

Do **not** label completion as mastery.

## 6. Investigation tokens

For practice cases:

- show base observations immediately;
- offer four optional evidence records/tests;
- learner may reveal at most **two** per attempt;
- a token reveals information; it is not a score or currency;
- reset restarts the case and restores tokens;
- no points are awarded for using fewer tokens;
- the purpose is to make learners decide what information would actually help.

The worked round demonstrates this logic without requiring the learner to optimize tokens.

## 7. Answer validation

Deterministically validate structured choices:

- change classification;
- reaction type where applicable;
- selected evidence IDs;
- required response/decision.

Do **not** auto-grade open explanations using keyword matching. The explanation field can be required for submission, but its quality is handled through a visible rubric/self-check or teacher review in future integrations.

For v1, the review records explanation status as **submitted**, not “correct,” unless a teacher-reviewed workflow is later approved.

## 8. Feedback rules

Feedback must diagnose the reasoning error, not just display “wrong.”

Examples:

- If bubbles are used as sole proof: “Bubbles are an observation. What evidence identifies a new substance?”
- If cooling is used as sole proof: “A temperature change can happen during physical or chemical processes. What evidence tells you whether the substance changed identity?”
- If a dominant but irrelevant clue is selected: explain what that clue tells us and why it does not answer the claim.
- If the learner overclaims from insufficient evidence: explicitly accept **Not enough evidence** when warranted.

Hints are one-at-a-time. Do not reveal the complete answer on Hint 1.

## 9. Exam-preparation rule

Every major scaffold introduced in the game must eventually be removable.

Early game:
- icons;
- evidence cards;
- selected-state guidance;
- hints;
- structured choices.

Final transfer:
- short source passage / record;
- standard answer choices or short response;
- independent explanation;
- no hidden “game knowledge” required.

If a learner can succeed only because of the interface, the design has failed.

## 10. Safety/content boundary

All cases are authored virtual records. The game is not a laboratory procedure.

Do not instruct learners to:
- mix unknown chemicals;
- smell substances;
- ingest products;
- perform combustion tests;
- handle corrosives;
- reproduce the scenarios at home.

Context images can show standard laboratory equipment, but they must not serve as procedural directions.

## 11. Data/privacy boundary

Initial build:
- anonymous;
- in-memory state only;
- no localStorage persistence required;
- no logins;
- no identifiers;
- no analytics;
- no network submission;
- no cloud save;
- no recordings.

Any LMS reporting or persistence is a separate future decision.

## 12. Responsive/accessibility rule

Everything must work with:
- keyboard;
- touch;
- screen reader;
- reduced motion;
- narrow screens;
- browser zoom/text enlargement.

No essential operation may require dragging. Colour never carries meaning alone. Focus is visible. The reading order follows the learning order.

## 13. Non-negotiable QA gate

Before integration:
- independently solve every case;
- test correct, misconception, incomplete and valid-alternative responses;
- verify every display value and reaction classification;
- verify generated art contains no answer-critical text relied upon by the game;
- test reset and case changes for state leakage;
- test the transfer with no hints;
- test keyboard-only and representative touch use;
- test at narrow width and 200% zoom;
- mark anything not tested as **Not tested**, never as pass.
