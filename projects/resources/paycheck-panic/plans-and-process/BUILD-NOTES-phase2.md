# Paycheck Panic — Phase 2 Build Notes

**File:** `paycheck-panic-phase2-dev.html`
**Records:** `product-records-v7.25.json`
**Harness:** `phase2-harness.js` (62 tests, all passing)
**Date:** 2026-09-29
**Source:** built on a copy of signed-off Phase 1 (`paycheck-panic-expansion-dev.html`, untouched)

---

## What Phase 2 adds

### Part A — Arcade wing (mall)
- Separate arcade wing behind one monthly visit: 1 visit/month, 3 plays/visit, each cabinet once/month.
- 5 cabinets: **Claw Machine** ($4/play, 5 drops, prizes feed furniture + gambling tracker), **Rhythm Rush** ($3, 32-note timing), **Lane Racer** ($5, 24 obstacles/1000m), **Prize Wheel** ($2 spin, 5%/$10 · 10%/$5 · 25%/$2 · 60%/$0), **Token Trader** ($6, arcade token exchange).
- Atomic entry: fee + immediate energy commit up front; 8-energy deferred debt per play (cap 24), settled once at next sleep.
- Attempt-ID-linked payouts (idempotent); quitting forfeits the fee and mints nothing.
- Seeded layouts/outcomes (SplitMix64 arcade + casino streams); fixed rivals; souvenirs ($0 resale, +1 happiness each/month).
- Claw streak = consecutive winning months; prize pool refreshes monthly (5 items).

### Part B — Fun-first retrofits (walk-click-wait replaced)
- **Gym → Beat Rep:** timing/hold minigame. <4 hits → +0; else `clamp(floor(points/10),1,3)` (perfect=3, good=2).
- **Night school → Sort It Out:** triage minigame. <50 → +0, 50–69 → +1, 70–89 → +2, 90+ → +3.
- **Money book → Speed Read:** quiz on "Dollars & Sense". 1st purchase: 70%+ → +3 else +1; 2nd → +1; 3rd+ → +0.
- **Diner coffee → Read the Room:** coffee chat with Marta/Devon. <0 → +0, 0–2 → +1, 3–5 → +2, 6+ → +3.
- All walk-click stat paths removed (study session, money book, coffee +1).

### Part C — Menu reskin (pilot-inspired)
- HUD: emoji stat icons → text labels (MO/CASH/SAVE/EFUND/DEBT/MOOD/SCORE/NRG/STR/STATS/JOB).
- Building names, hotspot labels, menu titles, section headers: leading emoji stripped.
- Cream cards, blurred dark-green backdrop, eyebrow labels, gold/sage/red/gray button hierarchy, 46px targets.
- Title screen, town map, and character portraits unchanged.

### Part D — Movement
- Player: articulated procedural figure (counter-swinging arms/legs, eyes face travel, ground shadow, bounce). Character identity via torso color; PNG retired from the world view (portraits remain on the select screen).
- NPCs: 4 named waypoint walkers (Taylor, Casey, Morgan, Jordan), deterministic ping-pong routes, facing flip, shared Y-depth sort with the player.
- `prefers-reduced-motion` renders static poses.

### Part E — Bank (5 tabs)
- Save & withdraw / Debt & loans / Investments / Budget / Pay stubs.
- Strict dollar parser (positive, max 2 decimals). Deposit quick picks $100/$500/Safe (Safe = cash − monthly obligations − $200, min $0).
- Loan confirmation states plainly that borrowing adds equal cash and debt and is not income.
- Existing amortized-loan engine, schedules, credit minimums, GIC, emergency fund, missions, and stock system untouched.

---

## Deliberate deviations from the brief (all recorded in product-records-v7.25.json)

1. **Monthly time model, not per-day.** The shipped game advances in monthly sleep cycles with no day/evening token model. "Per day" limits → once per month; arcade entrance → one monthly evening out; prize pool → 5 items/month; claw streak → consecutive winning months.
2. **Prize-wheel EV is $1.50, not $1.20.** The brief's stated partition (5%×$10 + 10%×$5 + 25%×$2) sums to $1.50 on a $2 spin. Shipped the partition as specified; the $1.20 claim is mathematically wrong. The wheel is still negative-EV (−$0.50/spin) and labeled as such on the glass.
3. **New Prize Wheel uses the seeded casino stream; shipped casino games untouched** (their RNG and math were audited in Round 4).
4. **Stat boundaries** use the exact recorded formulas (see harness).

---

## Money-conservation rules enforced

- Every fee calls `loseCash` + `noteSpend("fun", …)` so monthly budget reports conserve.
- No player choice makes cash negative (`canAfford` gates every spend).
- Deferred arcade energy settles exactly once per sleep, then clears.
- Quit/pause never mints payouts; attempt IDs make payouts idempotent.
- Souvenirs have $0 resale.

---

## Verification

- `node --check` on the full extracted script: **pass**.
- `node phase2-harness.js`: **62/62 pass** — seed determinism (claw/rhythm/racer), all stat boundaries, wheel EV + distribution.
- Static checks: zero external requests; zero `Math.random()` in Phase 2 code; single energy-debt settlement; single payout call-site.
- **Not yet done:** real-Chromium playthrough and the ChatGPT adversarial audit (parent agent runs these next).

## Known limitations

- Browser/touch testing not performed in this build pass.
- The emoji pass covered chrome (menus/HUD/hotspots/building names); lesson/event/toast body copy retains inline emoji as content, not chrome.
- NPC waypoints are fixed pairs on verified walkable corridors; they do not avoid the player.

## Hotfix 2026-09-29 — startup crash (found via Dean's preview)
- Symptom: game stuck on entry screen, all clicks dead. Root cause: the
  `window.__game` test-hooks object literal referenced three names that don't
  exist (`splitmix64` — only `splitmix64_2arg` exists; `spReadRoom` — actual
  name is `spReadTheRoom`; `confirmLoanText` — actual name is `confirmLoan`).
  In `"use strict"` the first bad reference threw at top-level script eval, so
  button wiring and `loadArt(boot)` never ran and the loading veil (z-70) stayed
  up forever, swallowing all clicks.
- Second layer: the hooks block also referenced `CABGAMES`/`CABS`, which are
  `const`s declared later in the file (temporal dead zone). Fix: moved the
  whole `window.__game` hooks block to the end of the script and converted both
  hooks blocks to merge-safe form
  (`Object.assign(window.__game=window.__game||{}, {...})`).
- Verified via node top-level-eval stub: no throw; real-Chromium click-through
  re-test requested.
- Startup emoji cleanup (Dean's standing no-emoji-menus rule): loading veil,
  title "New Game" button, "Choose your player" heading, mode-picker labels and
  buttons, teacher-report button — all plain text now.

## Hotfix verification 2026-09-29 — real-Chromium pass (own CDP harness)
- Drove the fixed file in real Chromium 152 via CDP: full startup flow
  title -> New Game -> mode modal -> character select -> Start ->
  career-lane modal -> "why" modal -> town. Zero JS errors/exceptions,
  veil hides on its own, HUD renders, screen='town', canvas 1280x657.
- Emoji sweep on the startup path: veil, title button, mode modal
  (incl. the CALM-lesson callout icon), character select, career-lane
  modal (title/desc/cards), and the "why this lane" reason buttons are
  all plain text now. Screenshots archived in /tmp (shot_*).
- Remaining body-copy emojis (HUD stat icons, toasts, lesson text
  deeper in the game) are out of the startup path and go through the
  pending adversarial audit loop.

## Sprite fix 2026-09-29 — player renders as painted character in town
- Dean reported the in-town player was a stickman even after picking a painted
  character. Root cause: drawPlayerFigure() deliberately drew the procedural
  stickman (identity color on torso only); the painted player-*.png sprites
  were only used on the character-select cards.
- Fix: drawPlayerFigure() now draws the chosen character's painted sprite
  (assets/player-*.png, 80px tall, walking bob, facing flip, glow shadow),
  falling back to the stickman for "classic" or while the sprite loads.
  Applies to town and interiors (both call drawPlayerFigure). NPCs unchanged.
- Verified in real Chromium: new game as Maya -> town shows the painted Maya
  sprite; zero JS errors. The single-file export inlines the sprites as data
  URIs, so hosted + export both work.

## Walk-animation fix 2026-09-29 — sprite leans/bobs with movement
- Dean: the painted sprite rendered but looked static — no visible walk or turn.
  Cause: the art is a single front-facing frame, so the horizontal flip did
  nothing visible and the old 2.2px bob was too subtle.
- Fix: drawPlayerFigure() now adds a walk cycle to the sprite — a 3px bob, a
  lean into the direction of travel (up to ~0.15 rad, signed by facing), and a
  slight stride sway from the walk phase. Verified in real Chromium: holding D
  leans the sprite right, holding A leans it left; zero JS errors.
