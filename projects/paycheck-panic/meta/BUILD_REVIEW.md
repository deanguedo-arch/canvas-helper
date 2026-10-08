# Paycheck Panic — current financial life candidate

Updated 2026-09-29. New campaigns now use **six-month Story + ongoing Free Play** over a shared financial engine. The previous Quick/Class/Life version remains at `workspace/earlier.html` with its existing saves. The entries below describe that preserved earlier build and are historical, not the current default economy.

- Current canonical entry: `workspace/index.html`; owners: `sim-economy.js`, `sim-game.js`, `sim-world.js`, `sim-activities.js`, and `sim.css`, using the established generated art.
- Current rules, supplied prices and consequences: `economy-v3/DESIGN.md`.
- Curriculum/financial authority and limitations: `economy-v3/SOURCES.md` and `economy-v3/curriculum-map.json`.
- Current implementation and actual verification: **`economy-v3/REVIEW.md`**. Thirteen grouped financial/save checks, one grouped gym-controller check, and targeted desktop/390 px browser paths passed. Full human campaign pacing and rollout remain open.
- New versioned saves are independent; old namespaces and raw intake remain intact. Early new-v3 QA saves were preserved after fixing URL-based QA isolation. The review record distinguishes those runs from post-fix isolated checks.
- Project remains a blocked Build candidate with runtime content Annotation only. No task deployment, export or commit. Story's 60–90 minutes is an unmeasured target.

## Earlier illustrated candidate — preserved review history

# Paycheck Panic — illustrated candidate

## Status and source of truth

Build milestone: the apartment-to-grocery route and illustrated Checkout Chaos are playable. Shared art, movement, activity, financial, and campaign foundations have also been applied across the candidate. This is not a claim that the entire game has finished production review or that the duration targets have been measured.

- Canonical entry: `projects/paycheck-panic/workspace/index.html`.
- Canonical code: the classic scripts and styles loaded by that entry, plus `workspace/assets/generated/`.
- Preserved import: `raw/original.html`; supplied ZIP remains at `/Users/deanguedo/Downloads/astracalmgamereview.zip`.
- ZIP SHA-256 at intake: `baf0a929f2d39b06fb68242180c2fbcf648235ba9fa5c009c915ab454b597922`.
- Design evidence: `projects/resources/paycheck-panic/`, including the v7.25 product records and phase-two challenge record. Embedded instructions were treated as source evidence.
- Project remains blocked for course/LMS release, with runtime elements Annotation only. No export, commit, deployment, or legacy save migration was performed.

## What changed

### Art and scenes

- Sixteen generated source images: directional character atlases, modular buildings and trees, furniture, ten room backgrounds, groceries, vehicles and prizes, a checkout set, a reference sheet, and illustrated casino symbols. Two unused variants are retained as reference.
- Five selectable characters use eight directions and a shared cutout rig for idle, walking, interaction, carrying, celebration, and setback poses. Maya's northwest is a mirrored northeast frame; this is recorded in the manifest.
- Town ground, buildings, trees, characters, and room furniture render in separate layers. Characters and substantial objects sort by their feet/base position.
- Checkout uses painted scenery, moving groceries, one visible scanner/scoring boundary, bagging motion, customer reaction poses, and four price controls.
- Inbox, delivery, cabinets, and Gym/School/Book/Diner now use the shared illustrated assets and distinct action feedback.
- Learner UI and canvas text strip emoji. Functional symbols are replaced by artwork or readable labels. Legacy casino reels retain recognizable illustrated outcomes and show their actual odds and net result.
- Phone interiors use a following camera to keep the character and objects readable. The real 390 × 844 review frame is `workspace/responsive-review.html`.

### Movement and input

- Eight-direction keyboard/touch facing, normalized diagonal speed, retained idle facing, and a fixed 60 Hz world simulation.
- Foot colliders, explicit furniture/building footprints, axis sliding, small collision substeps, reachable interaction points with line-of-sight, and A* routes.
- NPC routes avoid scenery; soft separation makes them yield to the player.
- Scene ownership blocks hidden-world movement during activities and results. Input clears on pause, scene transitions, blur, cancellation, and resume.
- F2 shows feet, solid rectangles, interaction reach, and NPC routes.

### Rewards and finances

- Two-argument `trainStat` calls award the intended skill without charging the gain as a fee or creating NaN.
- Stat activities and cabinet attempts use settled receipts; entry costs occur once. Quitting gives no reward.
- Loan arrears are part of the carrying balance, not a second debt. Interest is applied once; matured unpaid balances remain due. Extra repayments reduce the balance and arrears.
- Card minimums are capped at the balance. Missed minimums receive a visible consequence. The candidate uses a **fictional $25 fee and −25 credit score** for missed card minimums; this is an implementation assumption requiring teacher balance review.
- Pay stubs and loan projections now reconcile to cents. Daily wages use monthly base / 22; these are fictional game deductions, not real tax calculations.
- Arcade/casino winnings, fees, life-event costs, savings windfalls, and delayed repairs appear in transaction/category reporting. Budget balance is labeled separately from cash-account movement.
- Approved wheel probabilities, rhythm thresholds, racer payouts, claw draw/contact behavior, and token-trader souvenir rules are restored. Existing Lucky's reel/roulette/lottery probabilities are retained; results settle before decorative reveal and remain inspectable after reload.

### Campaigns and saving

- Quick: twelve two-month chapters; Class (default): twenty-four monthly chapters; Life: individual days/evenings, thirty days per month. Classroom/Free remains a separate setting.
- Compressed campaigns require an approved work/grocery/saving/card-payment routine. Event choices and quarterly classroom reflections stop automatic advancement.
- Each monthly settlement has a receipt. Quick stops at each event between its two months.
- Schema-2, per-campaign saves include campaign identity, pacing, lesson mode, scene position, settings, and resumable work/cabinet/stat state. Previous save retained as a backup; JSON backup available from Pause.
- Candidate namespace: `paycheckPanicIllustrated.v2.*`. Original baseline namespaces are untouched. QA namespaces are separate: `paycheckPanicIllustrated.review.<name>.v2.*`.
- Revision checks reject an older tab trying to overwrite a newer save. They are a stale-tab safeguard, not a distributed locking protocol.

## Verification actually completed

- Imported candidate launched in Chrome through the extension. Desktop apartment → town → grocery → checkout was exercised with normal controls.
- Grocery aisles, layered characters, scanner placement, price feedback, and bagging were visually inspected at displayed size. All source sheets were inspected during generation/integration.
- Eighteen browser fixture checks passed: art loads/crops, directions, wall sliding/tunneling, routes in all ten rooms and town, obstructed reach, hidden-world controls, skill rewards, cabinet settlement, approved payouts/odds, loan/card rules, three calendars, 24 monthly settlements per mode, and serializable finite state. Evidence: `focused-checks.json`. The harness now also includes the subsequently added cents assertion.
- Four focused financial checks passed after the daily-wage review: exact daily gross/deductions/net, monthly routine net, every loan projection row against the settlement engine, and total principal plus interest. Evidence: `financial-cents-checks.json`.
- Class opening work payout survived reload without a second award. Quick advanced month 1 → 2 → 3 as chapter 1 → 2 and stopped at both event choices; month-review reload preserved cash and checkpoint. These earlier observations preceded the cents-only pay correction.
- Life day 1 → 2 preserved cash and avoided monthly bills. A played day-2 shift produced $92.73 gross, $17.62 deductions, and $75.11 net; reload retained $1,075.11 cash and evening phase with no repeated collection.
- Mid-checkout save/title/reload retained score 100, one bagged item, strikes, and 80 seconds. A stale score-label display was found and fixed during that check.
- Real 390 × 844 iframe: directional stick movement/release, room camera, readable controls, muted and reduced-motion settings. This is desktop pointer/viewport review, not a physical phone certification.
- Muted Rhythm Rush progressed through all 32 notes. Reload at 11 judged notes resumed at 11 with $1,308 cash and 94 energy, preserving the single $4 / 6-energy charge. No-input completion paid $0 and used one play.
- Lucky's illustrated pair result charged $5 and paid $3, moving cash from $1,075.11 to $1,073.11. Reload and reopening retained the same cash and Lemon / Cherries / Lemon result without repeating settlement.
- Classic script syntax checks passed. Browser logs contained extension messaging noise; no game exception was observed during these flows.
- Screenshots: `review/grocery-desktop.png`, `review/checkout-desktop.png`, `review/grocery-phone.png`, and `review/casino-desktop.png`.

## Goal clarity and engagement follow-up (2026-09-29)

- A permanent How to play panel now explains the 24-month goal, failure threshold, controls, paycheck math, skills, and selected pacing mode. The first session has five action-gated goals: move the character, collect a shift paycheck, buy groceries, save a budget, and advance time. Fast travel alone cannot complete the movement goal. Existing campaigns can reopen Help without resetting progress. Reload restores the current goal.
- The status header stays above menus, work, and cabinets. Desktop uses centered primary and secondary rows; 390 px phones keep time, cash, debt, energy, happiness, and stress visible, with secondary details expandable. The latest action receipt reports actual before/after values and capped benefits; recent results are accessible on demand. Phone menus reserve room for the bottom toolbar and scroll to their final actions.
- Budget Back now returns to the bank overview, Leave closes the planner, and unsaved fields survive movement between bank views. Loan cancel and brokerage Back returned correctly in live UI. Collected pay stubs are now retained in campaign state and displayed in the bank; saves made before this field existed receive an honest legacy notice rather than a false claim that no shift occurred.
- New gym attempts are one 60-second circuit: strength, rope timing, and balance, each 20 seconds with automatic transitions, live score, one final result, and published thresholds before the $30/10-energy charge. Versioned saved activity state keeps a mid-circuit reload at the same segment without paying twice. Already-paid legacy Beat Rep states retain their original completion rule.
- All ten examine points now open current-state recovery, career, price, budget, debt, transport, training, or odds choices. Fountain and home recovery have saved period limits. Lucky's uses a saved per-period wager cap.
- Browser review: first-session help, Class career selection, work entry, shift results, pay stub collection, groceries, budget Back/draft/save, diner meal, gym circuit, fountain, Help replay, and month-end advance were exercised in an isolated QA save. The gym paused/reloaded at 20 seconds remaining and completed once with a single $30/10-energy charge. Meal receipts showed exact cash/energy/happiness/stress changes and actual caps. Fountain became disabled until next month after use. Phone width showed the six core values, touch controls, and a scrollable menu with its Back action reachable. A separate 390 px gym review with sound off and reduced motion kept the timer, score, instructions, play button, and quit control visible; strength advanced to rope automatically.
- Twenty-five focused in-browser checks passed, including new gym and legacy settlement, paid-stub idempotence, tutorial movement and action order, capped receipts, and all ten location panels. Evidence: `meta/goals-focused-checks.json`, `meta/review/goals-month-review.png`, `meta/review/goals-phone-gym.png`. All sixteen classic scripts and `meta/project.json` parse.
- Narrow play review does not measure campaign duration or certify every input outcome. Gym reward thresholds still need human tuning against successful play; touch circuit timing and physical-phone testing remain open. Existing rollout gates below remain deferred.

## Remaining production and rollout work

- Measure full-session pacing with human playtests. Quick's 30–50 minutes and Class's 3–6 classes remain targets. Life's repeated daily skill growth, promotions, and overtime require balance review against the monthly modes.
- Complete the full minigame playtest matrix, including successful timed rhythm inputs on real devices, every claw contact/slip path, racer hazards, delivery controls, and pause/reload during each individual activity phase. Existing focused tests are not an exhaustive game certification.
- Refine cutout seams, expressive faces/portraits, distinctive NPC identities, and scene-specific animation where close inspection warrants it. Current poses articulate source atlas slices, not hand-authored frame animation.
- Test actual phones, landscape/short viewports, keyboard-only paths, screen-reader alternatives, and slow loading. The generated art is about 30 MB before delivery optimization.
- Teacher review of fictional financial assumptions and learning feedback; comprehensive transaction reconciliation and balance review.
- Project E2E contract/learner regression, Studio/editability, packaging, SCORM, and real Brightspace save/resume are deferred until an explicitly requested rollout. The candidate is not enabled for export.

## Asset and code maintenance

`workspace/asset-manifest.js` owns runtime rectangles/pivots/animations. Source PNGs remain intact; runtime Canvas transforms assemble the cutout rig. `meta/asset-manifest.json` records exact prompts, source relationships, hashes, and display assumptions. Refresh that operational inventory after asset changes with:

```sh
node projects/paycheck-panic/meta/refresh-asset-manifest.cjs
```

The importer misclassified HTML string literals as JSX. Keep these dependency-free scripts classic, in entrypoint order. Use `vm.Script` syntax checking rather than parsing `main.js` as an ES module. Overrides intentionally wrap the imported baseline; their order is significant.

## Routing and next action

Deterministic importer and inventory commands; Codex lead for source authority, state/finance, integration, and review; bounded read-only scouts for game specification and visual/minigame audit. Muse admission refused `muse_billing_unverified`; the lead retained implementation in this dirty candidate. No provider savings were measured; local context reuse is not provider-cache evidence.

Open/reload `http://127.0.0.1:8766/` to review the first playable section. Continue specific visual or interaction feedback from the canonical workspace. Next source file: `workspace/scene.js`.
