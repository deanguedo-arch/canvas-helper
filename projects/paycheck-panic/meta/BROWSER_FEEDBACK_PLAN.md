# Paycheck Panic — player feedback plan

Status: implemented in the separate illustrated candidate on 2026-09-29. This document retains the original plan; verified outcomes and remaining risks are recorded in `BUILD_REVIEW.md` and `docs/ops/ACTIVE_HANDOFF.md`.

## Scope and intended outcome

Address the six browser comments and the missing explanation of the game's purpose. Preserve the illustrated direction, the three pacing modes, Classroom/Free settings, and independent campaign saves. Interpret the continuous-game request as a redesign of the marked gym activity: one uninterrupted workout containing several short challenges and one final result.

The next playable section must let a new player understand the goal, learn the controls, make a purchase and see its exact effect, use the bank without becoming stuck, and complete an engaging gym session.

## Source findings

- `main.js:3573`: `openBank()` restores `G.bankTab`. When that tab is `budget`, it calls `renderBudgetPlanner()` and returns. The planner's Back handler calls `openBank()` without changing the tab, recreating the planner.
- `styles.css`: HUD z-index 20; full-screen modal backdrop z-index 40 with blur; work and cabinet overlays z-index 55. They obscure the status bar. `illustrated.css` retains inline labels/numbers and hides several mobile stats using positional selectors.
- `stat-activities.js`: each gym release calls `answer()`, switches to feedback, and requires a Continue button before `next()`. Repeated attempts use the same timing window and charge.
- `main.js:870`: all ten examine points are flavor text followed by a Nice button. They do not execute a useful action.
- `main.js:3176`: existing onboarding is a five-step objective banner. Opening the budget planner marks it as seen and advances onboarding before a plan has been saved. It also describes sleeping as ending a month, including for the daily mode.

## 1. Persistent status and visible consequences

### Layout

- Build one shared status header for world, shopping, bank, learning activities, work, and cabinets.
- Use centered label/value pairs, aligned columns, tabular numerals, and sufficient spacing. Keep the cream/forest palette and illustrated portrait.
- Desktop: primary row for time, cash, debt, energy, happiness, and stress; secondary row for savings, emergency reserve, credit, named skills, and career.
- Phone: compact primary rows remain visible; a clearly labeled Details control opens secondary information. Do not silently hide critical stats according to element order.
- Show meaningful emergency-fund text such as Calculating monthly costs rather than an unexplained ellipsis. Show card and loan debt consistently.
- Measure the actual header height and reserve that space above world and activity content. Modal blur begins below it. Activity counters and touch controls have their own space.
- Keep status values readable while modal focus remains correctly contained. Title, character selection, and end screens may have their own layout.

### Feedback

- Each player action produces a single before/after receipt after all of its changes settle.
- Example: Hot meal — cash $609 → $595; energy 76 → 96; happiness 98 → 100; stress 20 → 16.
- Show actual capped gains, not an advertised +14 happiness when only +2 was applied. Explain the cap briefly.
- Show immediate effects separately from future liabilities or monthly benefits, including cabinet energy debt and furniture benefits.
- Keep the latest action visible until the next action and provide recent results on demand. Announce one concise result accessibly; reduced motion uses static highlighting.
- Show cost, benefit, availability, and reset time before a purchase or activity. After purchase, refresh the menu and status together.

Acceptance: the user can buy a diner meal and inspect every resulting value without closing the menu. The same status header remains readable during checkout, gym, and cabinets at desktop and 390 px phone width; no play controls overlap it.

## 2. Reliable navigation

- Make Back to bank explicitly return to the bank overview/Save & withdraw tab, rather than the selected Budget tab.
- Keep bank tabs available inside the budget view where practical. Separate Save plan, Back to bank, and Leave bank actions.
- Preserve unsaved budget input when moving among bank subviews; save only through the stated save action.
- Inspect the nearby bank routes: planner, loan schedule, investment details, and pay stubs. Return keyboard focus to the invoking control.
- Remove duplicate ambiguous Back/Leave buttons in the affected menus through explicit destinations.

Acceptance: open Budget, edit, save, go back, open Debt, inspect a schedule, and return. No repeated planner loop, blank panel, or lost saved plan.

## 3. Explain the purpose and teach through play

### Purpose

Present this before the campaign starts and through a permanent How to play control:

> Build a stable life over 24 months. Earn income, cover your essentials, manage debt, and care for your energy and happiness. Improve your skills to open better jobs and build a reserve for surprises.

- State the existing campaign completion and failure conditions accurately: complete month 24; the current bankruptcy trigger is cash below -$200. Explain the threshold and provide an early warning, without silently changing the economy in this pass.
- Distinguish campaign completion from optional success goals such as the first $1,000 reserve, paying off a balance, and promotion. Show progress toward a small number of meaningful goals.
- Explain that work performance affects pay, skills affect opportunities, and arcade activities spend entertainment money. Explain which actions advance time in the selected pace.

### Guided first session

1. Move and face a direction; approach an accessible interaction and use E/tap.
2. Locate the chosen workplace and try a brief, uncharged practice example. Practice has no financial or skill reward.
3. Play the first shift, collect pay, and explain gross, deductions, and net using that actual pay stub.
4. Buy food and observe its real effect in the visible status header.
5. Save a budget and identify the next bills and a chosen savings goal.
6. Advance time with a clear preview: tomorrow in Life, month review in Class, two-month chapter with decision stops in Quick.

- Use a persistent Next goal control, contextual destination marker, and short control demonstrations. Keep explanations at the moment they become useful.
- Tutorial steps complete from verified actions: a saved plan, a collected paycheck, a completed purchase. Merely opening a menu is insufficient.
- Allow Help/tutorial replay from existing campaigns without resetting progress or replaying costs/rewards. Keep Classroom guidance and Free-play skip behavior consistent with their existing settings.
- Give every minigame a short rules/control demonstration and visible reward thresholds before charging entry.

Acceptance: a new player can answer what the objective is, what they should do next, how to move/interact, how to earn money, and how time advances. Existing campaigns can access the same explanations safely.

## 4. One continuous gym circuit

### Proposed format

- One approximately 60-second circuit, with three 20-second segments and automatic transitions. Show a brief countdown/control cue at each transition; no Continue clicks between reps.
- Strength: hold and release the lift inside visible good/perfect zones, with telegraphed changes to lift speed and zone position.
- Cardio: tap/press to clear incoming jump-rope beats, with readable spacing changes and visible miss feedback. Works muted.
- Balance: steer left/right or drag to remain in a visible target while predictable disturbances push the marker.
- Use illustrated equipment and the existing character rig, generating additional production art only where needed.
- Maintain inline feedback, score, remaining time, and combo. Mistakes reduce performance but keep the circuit moving.
- Use a seeded sequence for fair resume and varied repeat sessions. Difficulty increases through legible patterns and modestly tighter tolerances; introductory practice stays forgiving.
- Preserve the existing $30 / 10-energy entry and maximum +3 Wellness initially. Publish the score thresholds before starting and tune them against actual play. The highest reward must require strong performance.
- Finish with one result showing score by segment, skill gain, happiness/stress effects, and exact cost. Include one concrete improvement tip.

### Saving and compatibility

- Store the activity rules version, seed, segment, elapsed time, score, input-neutral state, and settled receipt.
- Pause/blur freezes the timer and clears held controls. Resume continues the same attempt; reload cannot charge or award twice.
- Existing saved Beat Rep attempts finish through their legacy rules; new attempts use the circuit. Do not discard a paid attempt.
- School and conversation feedback remain readable. Do not indiscriminately auto-dismiss explanations across all activities.

Acceptance: start once, play continuously through three distinct challenges, and finish once. Test misses, successful timing, mute, reduced motion, touch, pause, and reload at a segment transition.

## 5. Give location details a purpose

An interaction should provide a useful action, a comparison based on the player's current situation, or progress toward a goal. Informational content can be useful without awarding arbitrary cash or skill points.

| Location | Proposed useful interaction |
|---|---|
| Apartment window | Take a short breathing break for modest stress recovery; show availability and actual benefit. Keep sleep and the larger nap distinct. |
| Office noticeboard | Show the next promotion's actual requirements, current progress, and the relevant training destination. |
| Grocery shelf tags | Compare unit prices for real basket items and offer a specific cheaper substitution with its cost/nutrition tradeoff. |
| Bank interest display | Use the player's savings/debt to show a simple projection; link directly to a deposit or repayment action. |
| School catalog | Compare available training costs, skill gains, and the career requirement it helps meet. |
| Gym fountain | Refill water: proposed +4 energy and -2 stress, capped at actual need and limited to once per activity period. |
| Diner newspaper | Show one current event or offer that actually applies this period, its expiry, and a relevant destination. |
| Mall display | Compare the item's cost with the player's remaining fun budget; buy it or save it to a wishlist. |
| Dealership bike rack | Compare walking/bike/car upfront and recurring costs and any real gameplay effect before choosing transport. |
| Lucky's odds poster | Show the actual game odds and choose a visit spending cap. Reaching it blocks further paid plays for that visit period. |

- Publish recovery/reset rules: Life uses a day; Class and Quick use the current simulated month. Fast-forwarding consumes each period only once and never grants unattended optional bonuses.
- Save usage and spending-limit state. Reopening a menu or reloading cannot refresh free benefits.
- A capped or already-used action explains why it has no additional effect and when it becomes available again.
- Do not invent events, payback promises, discounts, or transport benefits that are absent from the actual game rules.

Acceptance: inspect one useful interaction in each location. Verify the fountain's exact change, its once-per-period rule, and persistence after reload. Verify informational comparisons against the same engine used by the corresponding action.

## Implementation order and first review

1. Repair bank return navigation; build the shared status header and action receipts.
2. Add the purpose/help screen and guided first-session flow.
3. Replace new gym attempts with the continuous circuit.
4. Implement useful location interactions and connect them to current state.
5. Review a focused path: tutorial → work/pay → groceries → budget/back → diner meal → gym circuit → fountain → save/reload. Review desktop and phone layouts.

Keep full campaign balancing, all-device testing, Studio, export, SCORM, and Brightspace proof deferred as already recorded. This plan does not authorize a commit, deployment, or export.

## Ownership, routing, and handoff

- Current inspection: lead-owned targeted source reads. No gameplay edits or runtime tests in this planning pass.
- Planned navigation/status/receipts: lead, because the candidate files are uncommitted and changes cross current UI/state wrappers.
- Planned tutorial and meaningful interactions: lead integration with existing campaign state and actual economy.
- Planned gym: separate activity controller slice, but retained by lead while dependent on the dirty candidate; do not dispatch a worker against an unrelated committed baseline.
- Deterministic checks: classic-script parsing and narrow save/reward compatibility checks when implementation is made. Provider savings are unknown; no new agent call was made.
- Canonical source remains `projects/paycheck-panic/workspace/index.html` and its loaded scripts/styles.
- Likely owners: `index.html`, `illustrated.css`, `interface.js`, `main.js`, `stat-activities.js`, `campaign.js`, and viewport/input adjustments in `scene.js` and activity renderers.
- Main risks: HUD height changing canvas coordinates; modal focus and input ownership; capped multi-stat changes; legacy activity resume; period limits across all three modes.
- Exact next action after the plan: implement the bank return and status/action-feedback foundation first.
- Exact next source to open: `projects/paycheck-panic/workspace/main.js`, `openBank()` and `renderBudgetPlanner()`.
