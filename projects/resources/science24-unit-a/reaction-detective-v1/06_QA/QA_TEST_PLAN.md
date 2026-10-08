# QA Test Plan — A1 Reaction Detective v1.0

Use **Pass / Revise / Not tested**. Never mark an unperformed test as Pass.

## A. Science/content

1. W01: verify hydrogen peroxide → water + oxygen is presented as the supplied decomposition record and the catalyst is not described as a reactant consumed by the reaction.
2. W01: verify product identity is presented as stronger evidence than bubbles alone.
3. P01: verify temperature change and dissolving do not automatically trigger chemical-change success.
4. P01: verify “Not enough evidence” is accepted before decisive identity/recovery evidence is supplied if that prediction step is active.
5. P01: after the identity record is revealed, verify physical change is accepted.
6. P02: production copy must **not** define rust as one exact formula such as Fe₂O₃.
7. P02: verify mass increase is explained consistently with matter from the surroundings becoming part of the corrosion products.
8. P03: verify neutralization/acid–carbonate classification is based on supplied reactant/product records, not bubbles alone.
9. P03: no dosing, medical recommendation or real procedure.
10. P04: verify methane + oxygen → carbon dioxide + water is the authored combustion pattern and heat/light are supporting evidence.
11. T01: verify boiling water is classified as physical change in the supplied record and bubbles alone are explicitly rejected as proof of chemical reaction.
12. Verify every accepted alternative in `SCENARIO_BANK.json` is intentional.

## B. Answer logic

For every practice case test:

- correct conclusion + strong evidence + correct reaction type;
- correct conclusion + weak evidence only;
- wrong conclusion + strong evidence;
- correct chemical-change conclusion + wrong reaction type;
- empty explanation;
- explanation shorter than minimum input gate;
- two selected evidence records;
- attempt to select a third evidence record;
- valid alternative reaction label where authored;
- reset after revealing one token;
- new case after a completed case.

Confirm state does not leak between cases.

## C. Feedback

- Bubbles-only error receives evidence-specific feedback.
- Temperature-only error receives evidence-specific feedback.
- Correct conclusion/weak evidence receives targeted feedback rather than “wrong.”
- Reaction-type error acknowledges correct change classification when appropriate.
- Hint 1 does not reveal full answer.
- Hint 2 narrows the decision.
- Hint 3 can point to decisive evidence but still requires learner action.
- Previous answer remains visible during retry.
- No shame language or score penalty.

## D. Transfer

- No hint control before first transfer submission.
- No investigation tokens.
- No worked answer visible before submission.
- Explanation required.
- Structured answer is checked independently from explanation quality.
- Review distinguishes completion from mastery.

## E. Accessibility

### Keyboard
- Tab order follows visual/learning order.
- All buttons, radios, checkboxes, selects and textareas operate with keyboard.
- Focus is clearly visible.
- No drag-only interaction.

### Screen reader
- Page title is meaningful.
- Major regions/headings are logical.
- Images have contextual alt text; decorative images use empty alt when appropriate.
- Feedback is announced without excessive repeated live-region chatter.
- Selected/correct/revise state is conveyed in text, not colour alone.

### Visual
- Test 200% zoom.
- Test narrow widths around 360–430 CSS px.
- Do not shrink scientific labels into illegibility.
- Text reflows without horizontal scrolling for normal content.
- Contrast meets WCAG AA for normal text wherever practical.

### Motion
- `prefers-reduced-motion` disables nonessential movement.
- No flashing.
- No time limit/reflex requirement.

## F. Touch/mobile

- Tap targets target ~44 px minimum in production.
- No hover-only information.
- Evidence controls remain usable in stacked layout.
- Text area is practical on phone.
- Primary action remains reachable after content stacking.

## G. Privacy/network

- Inspect network panel: no analytics, trackers or third-party calls.
- No login/account/student identifier prompts.
- No localStorage/cloud save unless separately approved.
- Refresh clears session state in initial v1 unless a later persistence decision is approved.

## H. Mockup/art boundary

- All answer-critical text is HTML/SVG/DOM, not pixels.
- Generated mockup labels are not transcribed without content review.
- Context art does not introduce contradictory scientific claims.

## I. Release record

Record:
- build version / commit;
- scenario version;
- browsers/devices tested;
- accessibility tests performed;
- science reviewer;
- known limits;
- all Not tested items.
