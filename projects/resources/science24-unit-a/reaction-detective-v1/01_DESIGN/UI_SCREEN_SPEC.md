# UI Screen Specification — A1 Reaction Detective

## Shared shell

### Header
- Height target: 64–76 px desktop.
- Charcoal background.
- Left: `Science 24`.
- Right: `Next Step` / course-family identity.
- Keep navigation minimal inside the game.

### Progress
Use six conceptual stages:
1. Brief
2. Worked example
3. Your turn
4. Feedback / retry
5. Transfer
6. Review

The stage indicator is informational, never a score.

### Desktop grid
Primary game screen:
- left: 30–32% — case/context;
- centre: 34–36% — evidence/investigation;
- right: 34–36% — reasoning/decision.

At widths below ~900 px, stack:
**Case → Evidence → Reasoning → Feedback/navigation**.

## S00 — Intro
Reference: `02_MOCKUPS/S00_intro.png`

Required production elements:
- title and one-sentence goal;
- what the learner will practise;
- 3-step explanation of play;
- “Start investigation” primary action;
- no gameplay state yet.

## S01 — Worked round
Reference: `02_MOCKUPS/S01_worked_round.png`

Required:
- worked-example banner;
- case record;
- evidence records;
- step-by-step reasoning;
- explicit note: worked round does not count as independent evidence;
- Next: Your Turn.

Do not turn this into a video-only screen. The reasoning must remain readable as text.

## S02 — Predict / investigate
Reference: `02_MOCKUPS/S02_investigate_prediction.png`

Required:
- base observations;
- prediction before extra evidence;
- investigation-token count;
- optional evidence choices;
- clear difference between unrevealed and revealed records;
- accessible button alternative for every interaction.

## S03 — Build claim
Reference: `02_MOCKUPS/S03_practice_rusting.png`

Required:
- conclusion choice;
- reaction-type choice when relevant;
- strongest-evidence selection;
- explanation text area;
- optional response/decision where authored;
- “Check claim” action.

## S04 — Feedback / retry
Reference: `02_MOCKUPS/S04_feedback_retry.png`

Required:
- show previous attempt;
- identify the exact reasoning issue;
- one hint at a time;
- allow edits without clearing prior work;
- “Revise and try again” action;
- no score penalty.

## S05 — Later practice / reduced scaffold
Reference: `02_MOCKUPS/S05_late_practice_combustion.png`

Required:
- same shell;
- less explanatory copy;
- still show exact evidence text;
- explanation required;
- reaction type chosen from a concise set.

## S06 — Independent transfer
Reference: `02_MOCKUPS/S06_transfer.png`

Required:
- prominent `Independent transfer — no hints` notice;
- compact scenario record;
- conventional answer choices;
- explanation field;
- no optional evidence-token mechanic;
- no hint before first submission;
- speed-is-not-scored reminder.

## S07 — Review
Reference: `02_MOCKUPS/S07_review.png`

Required:
- what was practised;
- case-by-case status;
- hints/retries used;
- transfer result;
- next useful practice;
- retry case / return to Unit A.

Never display `Mastered` solely because the learner completed the screens.

## Interaction states

Each card/control needs states for:
- default;
- hover (pointer only);
- keyboard focus;
- selected;
- disabled/unavailable;
- correct structured choice;
- revise/incorrect structured choice.

Correct/revise states require icon + text, not colour alone.

## Motion

Allowed:
- 150–250 ms panel transitions;
- subtle selected-card lift;
- progress indicator fill;
- optional evidence reveal fade.

Reduced-motion mode:
- remove movement;
- keep instantaneous state changes and text feedback.

No flashing, shake effects, countdowns or reflex requirements.
