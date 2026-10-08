# Paycheck Panic financial life — Build review

Date: 2026-09-29 (America/Edmonton). Status: implemented, locally reviewable Build candidate; teacher acceptance and rollout remain open.

## Current entry and preservation

`workspace/index.html` now opens the six-month Story and ongoing Free Play. Story's 60–90 minutes is a design target, not a measured duration. Both use `sim-economy.js`, `sim-game.js`, `sim-activities.js`, `sim-world.js`, and `sim.css`, with the existing generated illustrated art and shared collision geometry. `earlier.html` preserves the prior Quick/Class/Life candidate and its original scripts and independent save namespaces. Raw intake and the supplied ZIP were not edited. No old save was migrated or deleted.

This replaces the old balance for **new campaigns**. The earlier version remains available from the title screen. New schema-3 campaigns have their own identity, rules version, scenario, mode, ledger, reasons, settings and resumable activities. Runtime content remains Annotation only; the project is blocked for course/LMS release.

## What the player now manages

- Two supplied situations: a student living at home and an independent worker sharing housing. Wages, opening resources, rent, transport, utilities, insurance and food shares differ.
- Paydays on days 15 and 30, bills on their dates, four discretionary time blocks, a reduced-income month, optional extra paid work and a certificate with delayed wage effect.
- Complete monthly food baskets: $280 value, $360 mixed and $520 convenience before household share and the supplied month-six increase. Preparation consumes time; purchasing a single cheap package no longer feeds the case for a month. An explicit shortfall choice preserves progression with a wellbeing consequence.
- Saved budget allocations, cash available before payday, actual-versus-planned month reviews, emergency funds, credit minimums, late charges, fixed/variable loans, contract total costs and remaining obligations.
- Saving and investing with accessible-versus-risky choices, illustrative market losses and fees, inflation and future-value comparisons, and mortgage term/amortization comparisons.
- Fraud, information exposure, advertising, mandatory fees, consumer investigation, choices with saved reasons and a downloadable financial journey. The 36 condensed FL procedures in `curriculum-map.json` describe authored applied practice; they do not prove mastery or replace teacher review.
- Gym and arcade cost money and time; scores and souvenirs never create money or employment skills. Casino outcomes change actual fictional cash, respect a saved total-stake limit and show their odds. Borrowing increases a liability as well as cash.
- A visible status header above activities, exact transaction and capped-stat receipts, permanent Help, action-gated opening goals, useful examine points, a continuous three-part gym, and reliable bank Back/Save/Leave navigation.

Prices and consequences are authored cases, not local quotations or personal financial advice. The payroll model uses supplied 2026 Alberta parameters within the supported fictional cases; it is not a certified payroll calculator. Authorities and limitations are in `SOURCES.md`; design rules are in `DESIGN.md`.

## Targeted deterministic verification

Passed on the current candidate:

```sh
node projects/paycheck-panic/meta/economy-v3/verify.cjs
node projects/paycheck-panic/meta/economy-v3/activity-save-check.cjs
```

The first command passed **13 grouped finance/save checks** and parsed the four simulation scripts. It covers cents reconciliation, both incomes, late extra hours, replayed paydays, food coverage/share/inflation, budget earmarks, capped stats, one-time purchases, arrears partitioning, card minimums/fees/interest, investment fees, device term end, delayed training, provider arrangements, saved casino randomness/caps/expected return, invalid saved shapes/numbers, amortization and inflation.

Its six-month Story check exercises the financial engine for both cases and ongoing Free Play. It supplies task decisions programmatically. It is **not** a human playthrough of all chapter interfaces or evidence of the duration target.

The second command passed one grouped activity-controller check: atomic gym payment/activity creation, pause timer freeze, JSON save/resume, all three automatic segments, one cost and one completion, and zero cash reward. Rendering is mocked in this check; live browser observations below provide the narrow visual evidence.

## Browser observations actually completed

Chrome extension, desktop and a temporary 390 × 844 viewport:

1. Independent Story opening: actual apartment/town/room movement; bank and grocery routes; a Budget draft of $45 persisted through Back; Save and Leave remained distinct. A $50 emergency withdrawal changed cash $1,500 → $1,550 and emergency $300 → $250. The mixed basket cost $360 and used one block, changing cash $1,550 → $1,190.
2. Checkout practice ran to a single result and did not generate cash. Scheduled bills preceded the first payday. The independent pay stub reconciled $1,480 gross − $79.38 CPP − $24.12 EI − $122.21 income tax = $1,254.29 net. The collected stub and correct net-pay explanation completed their actual opening goals.
3. Student Free Play, muted/reduced motion: the $396.84 projected pay was shown; a $12 gym visit changed cash $300 → $288 and blocks 4 → 3. Pause/reload at 12 elapsed seconds resumed at 48 seconds remaining. Strength, rope and balance advanced automatically, produced one final score (17), and charged once. This run was not a successful-performance threshold tuning trial.
4. Fountain changed energy 90 → 93 and stress 15 → 13 once; the benefit was disabled until next month. At phone width, a diner meal changed cash $288 → $270, energy 93 → 100, happiness 70 → 78 and stress 13 → 10. A subsequent meal showed energy 100 → 100 **(capped)**, cash $270 → $252, happiness 78 → 86 and stress 10 → 7. Header and relevant controls stayed visible. Evidence: `review/phone-capped-meal.png`.
5. Corrected QA isolation: a newly named `reviewSession` showed no existing campaigns. A fresh independent Free Play case had independent state. Future-value inputs changed the 10-year, 8%-inflation result to $8,300.27 nominal and $3,844.63 purchasing power on $6,500 contributed. Mortgage 20-year versus 25-year amortization changed payment, remaining five-year balance and total interest; both tools returned to the bank.
6. A $1,200 variable loan showed 12% changing to 15% and a $106.62 initial payment. Confirmation changed cash $1,500 → $2,700 and loan $0 → $1,200, with both changes in the receipt.
7. Casino in that corrected isolated case: entry used one block. A $5 red wager landed on black 8, paying $0; a $5 slot spin showed seven/bell/star, paying $0. Cash $2,700 → $2,690, wagers 2/10, total stake $10/$20. Reload/Continue preserved $2,690, the one used block, both wagers and the same last result. Returning without editing the cap now goes directly to the tables. Evidence: `review/casino-cash-effect.png`.

Desktop keyboard and pointer/click-to-walk paths were exercised; phone-size controls were inspected. This is not physical-phone touch, keyboard-only or screen-reader certification. Console inspection showed Chrome extension asynchronous-listener noise; no game exception was observed in the reviewed flows.

## Issues found and resolved during this build

- Exact capped receipts, liabilities on borrowing/payment, forecast earmarks, withdrawal previews, late extra-shift pay, 24-month device end, and finite/structural save validation were repaired.
- A local function named `location` shadowed the browser global. QA URL parsing now explicitly uses `window.location.search`. Before this fix, opening Story and student Free Play QA wrote new v3 campaigns to the default **new-v3** namespace. These campaigns were preserved; none of the older v2/classic saves were changed. The post-fix fresh namespace check passed. Earlier browser observations above must not be described as isolated.
- Repository checkpoint `6e30f577` landed during the build and replaced newer edits/removed new operational files. Affected current-source corrections and operational records were restored without resetting the checkout or reverting that checkpoint. Final candidate hashes are recorded in `verification.json`.
- Casino Return to the tables previously opened an unnecessary same-limit confirmation. It now returns directly unless the player actually changes the limit.

## Open checks and limits

- Human play through all six chapter interfaces, successful play tuning, comprehension, and measured session duration. The engine's chapter loop is not this proof.
- Actual phone touch/landscape, keyboard-only paths, screen-reader alternatives, slow loading and the broader successful/failed minigame matrix, including each reload phase.
- Browser backup-file restoration: implementation and saved-shape validation are present, but automated file selection was blocked by Chrome's disabled extension file-URL access. No permission was changed. `synthetic-chapter-five.json` is an explicitly marked engine-generated fixture; it was not imported or played and is not human chapter evidence.
- Teacher review of curriculum mapping, supplied prices, fairness, consequences, debt/poverty framing and the simplified payroll/tax/investment rules. Full subject coverage and assessment certification remain open.
- Accumulated project E2E, Studio/editability, delivery optimization, export/SCORM and live Brightspace proof remain deferred to an authorized rollout checkpoint. No deployment, export or commit was performed by this task.

## Routing

Existing deterministic checks for finance/save boundaries; Sol lead for mathematical correctness, dirty source integration, compatibility and browser acceptance. Prior bounded read-only specification/visual scouts informed the design. No new worker was spawned in this implementation turn; Muse was ineligible for the dirty financial/state boundary. Local context reuse occurred; provider-cache telemetry and usage savings are unknown.

## Next review

Open `http://127.0.0.1:8766/`, choose **Play the story**, and review the financial decisions in the independent case. Exact next source: `workspace/sim-game.js`. Retain this Build candidate and its independent saves while collecting feedback.
