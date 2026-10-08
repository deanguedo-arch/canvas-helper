# A1 rules, answer contracts and state — v1.2.0

## Sequence and allowed actions

Intro → W01 worked example → P01 guided investigation → P02 build evidence → P03 reduced guidance → P04 low guidance → T01 independent transfer → review.

Practice begins with an unscored provisional prediction. It freezes on the first record opening. The learner may open two optional authored records and select two opened records as the evidence supporting a final claim. Opening and selecting are different operations. No random lab chemistry, actual chemical-handling steps, scoring timer, currency economy, lives or leaderboard exists.

A complete submission contains a final claim, two selected records for a practice case, a reaction type when claiming chemical change, the application response where present, and an explanation. An explanation needs 15 characters to avoid empty submissions and permits up to 3,000 characters. **That length check is not a judgment of scientific quality.** Arbitrary prose cannot earn an automatic reasoning/mastery grade.

Incomplete input is identified and focused; it does not count as a complete attempt or unlock hints. A complete but unsupported answer stays editable, records an attempt and gives targeted feedback. Hints become available only after a meaningful unsuccessful submission, within the case's cap.

A supported structured response freezes the submission and locks all answer controls. The learner reviews four explanation criteria: Claim, Evidence, Reasoning, Limits. A model explanation is available for comparison only after a supported submission. The Next control requires all four self-checks, a supported snapshot and an unchanged answer fingerprint. “Revise answer” explicitly clears permission to advance and the self-checks but preserves the previous attempt and draft prose.

## Exact practice answer sets

IDs below are stable from the first-pass data. Selection order is irrelevant. There is no score for selecting an incorrect pair plus unrelated extras: at most two records may be selected.

| Case | Final classification | Reaction value | Accepted pair(s) | Additional response |
|---|---|---|---|---|
| P01 | Physical | `none` | e1 recovery + e2 identity | None |
| P02 | Chemical | `corrosion` | e1 analysis + e2 atmosphere; e1 analysis + e3 surface | `barrier_coating` |
| P03 | Chemical | `neutralization` | e1 products + e2 reactants; e1 + e3 pH; e1 + e4 bubbles | None |
| P04 | Chemical | `combustion` | e1 inlet + e2 exhaust | `carbon_dioxide` |
| T01 | Physical | No reaction-type control | All base evidence supplied; no selected pair | None |

An `e1` entry in this table is prefixed by its case, e.g. `p02_e1`. `scenarios.js` contains the full wording, accepted-pair arrays, misconception feedback, hints and model explanations.

**P01 uncertainty branch:** when the identity-comparison record has not been seen, “not enough evidence” can be scientifically defensible. It opens an uncertainty checkpoint, not Next case. The labelled identity follow-up reveals the decisive record without spending another token, marks support used, and reopens the answer. The learner selects the recovery/identity pair and revises the classification. The max-two selected-evidence rule still applies, so a previously selected weak record must be unselected. Reopening cannot erase having seen the identity record.

For other cases, an insufficiency answer with missing identity evidence is acknowledged as cautious and directs a new investigation; it does not complete the case. The complete packet does contain the needed evidence. “Insufficient” is not a universal bypass.

**P02:** composition is not offered as an unconditional alternative. The game cannot verify a nuanced composition argument from ungraded prose. Corrosion is the targeted, explicitly checked label. This does not make corrosion and other defensible chemical classifications universally exclusive outside this activity.

**P03:** the UI says “Acid–carbonate / neutralization” for a single accepted value, keeping the supplied antacid context and curricular neutralization vocabulary together. The feedback does not imply all acid–base reactions emit gas.

**P04:** the question explicitly asks for the **carbon-containing product** linking the model to greenhouse-gas emissions. CO₂ is correct. Water vapour is also a greenhouse gas but contains no carbon; methane is an inlet reactant, not an identified product in this stated complete-combustion model.

## Scaffold fading

| Stage | Interface/support |
|---|---|
| W01 | Full teacher-style worked explanation, identity records highlighted, word equation and energy interpretation. No independent-performance claim. |
| P01 | Explicit evidence guidance, sentence starter, three hints after attempts, uncertainty follow-up. |
| P02 | Shorter support, two hints, practical application. |
| P03 | No sentence starter, two hints, precise reaction terminology. |
| P04 | Minimal scaffold, one hint after an attempt, required inlet/outlet comparison and environmental decision. |
| T01 | Conventional text/table presentation; no photo, optional-record mechanism, token display, help control, hint or early exemplar. First complete response stored separately. |

## State and integrity

`engine.js` is a pure, DOM-free engine. `scenarios.js` contains authored cases. `game.js` renders and binds native controls. `styles.css` defines the canonical shell and responsive layout.

Each case has cumulative memory: submitted attempts, records ever seen, hints, investigation restarts, visits, identity-follow-up status and the first complete response. A round holds the current draft, frozen prediction, token budget, opened/selected records, final claim/type/application, prose, self-checks and optional immutable submission.

- `draft → submitted`: structured choices validated; snapshot freezes; answer fields lock.
- `draft → uncertain`: P01 justified checkpoint; fields lock; follow-up required.
- `submitted → draft`: explicit revision invalidates progression and self-review.
- `uncertain → draft`: identity follow-up changes known evidence and records support.
- Reopen investigation: clear active selection/submission, restore two openings, keep prior prediction/prose/history/support.
- Finalize: copy the validated immutable submission into results only when all gates pass.
- Replay from review: create a fresh practice round but preserve the original first response and support history.
- Back from a replay: the previous completed result is retained; an unfinished draft cannot silently replace it. Submitted attempts stay in case memory.
- New session: confirmation clears everything. Reload/tab close also clears memory, as explicitly disclosed.

A first incorrect T01 response followed by correction remains “corrected after feedback.” Replaying T01 does not create new first-attempt evidence. There is no percentage mastery score. Results distinguish structured choices, ungraded submitted explanation and self-review.

## Accessibility and failure behaviour

Native radio/select/textarea/checkbox/button semantics; labels and text supplement colour; evidence never requires dragging. Tab and arrows operate native inputs. Major navigation focuses a heading; opening a record focuses that record; validation focuses the relevant missing control; checking a complete answer focuses feedback; hints focus their own text. Only a small atomic status region is live. The whole application is not live.

Dialogs are native, labelled and cancel safely with Escape; focus returns to the trigger. Reduced-motion preference removes transitions. Panels stack rather than shrinking scientific labels on phones. Long unbroken learner text wraps; HTML is escaped before insertion. Missing decorative images produce a visible fallback while all evidence and controls remain available.

No remote scripts, fonts, fetch calls, analytics, logins, student identifiers, storage APIs, service workers, network grading or LMS reporting are present. A one-file build embeds identical source and images. This is client-side formative practice: source answers are inspectable and must not be treated as secure summative assessment.


## Reversible navigation (v1.2)

- Previous navigation is always available after the opening brief.
- Leaving a practice or transfer screen stores the exact current round object in session memory.
- Returning restores prediction, opened evidence, selected evidence, draft explanation, submitted state, rubric checks and feedback exactly as left.
- Completed result records are not deleted by back navigation. If a learner revises and re-finalizes a completed case, the latest finalized result replaces the case summary while the attempt history remains in the case memory.
- `Practise again` from the review deliberately starts a fresh round; ordinary Previous navigation does not.
- Reload still clears all session state because v1 remains data-free and local-only.
