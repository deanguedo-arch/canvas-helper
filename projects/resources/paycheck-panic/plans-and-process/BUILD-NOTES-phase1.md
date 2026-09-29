# Phase 1 Build Notes — real stocks + emergency fund meter

**File:** `paycheck-panic-expansion-dev.html` (dev copy; shipped `paycheck-panic-arcade.html` untouched)
**Records authority:** `product-records-v7.24.json`, market model 7.24.0
**Date:** 2026-09-29 (repairs same day, post ChatGPT Phase-1 challenge)

## Phase 1 repairs — ChatGPT challenge findings (2026-09-29)

### Fix 1 (P1): FreshMart now OWNS its 7 seeded draws — full world determinism
- **Was:** the market tick consumed 7 FreshMart sale/shortage draws per tick and discarded them; the grocery itself ran on `Math.random()` (`genMarket()` shuffle + `irnd`), so `(seed, elapsedMonths)` could not reproduce grocery state.
- **Now:** new `groceryDraws(u01, M)` consumes **exactly 7 draws** from the seeded market stream and turns them into the month's sales/shortages — d1: 2|3 sale items, d2: 1|2 shortage items, d3–d7: 5 distinct items by successive uniform selection (÷14, ÷13, ÷12, ÷11, ÷10); shortage depth (40–60%) and news prefix derived deterministically from pick index + month, no extra draws. Fixed draw order preserved.
- The tick's step 5 calls `groceryDraws(u01, M)` instead of the discard loop; PRNG stepping factored into `mktStream()` (`seedGroceryForMonth(M)` reuses it).
- Month-1 grocery: `initMarketIfNeeded()` seeds it from the stream head **before** the catch-up loop, so a migrated save's stream is bit-identical to the live run it mirrors (verified: catch-up == live run).
- `startGame()` calls `initMarketIfNeeded()` instead of random `genMarket()`; `sleep()` no longer calls random `genMarket()`; `genMarket()` itself now delegates to the seeded stream whenever `G.marketInit` (legacy `Math.random` branch survives only for unreachable pre-init calls).
- **Closed hostile trace:** two runs, same seed + same months ⇒ identical `{prices, stockStatus, grocery sales/shortages/news, mktState}` (24-tick comparison in `/tmp/test-fixes.js`).

### Fix 2 (P2): emergency-fund target LOCKED — obligation gaming closed
- **Was:** target = 3 × max(trailing-3-month avg, current obligations) — a one-month loan spike inflated the target; dropping obligations shrank it.
- **Now:** the per-month baseline **locks** the first time the 2-month history window completes, at the trailing average (never the possibly-spiked current month). HUD/Bank meter shows `🔒 target locked`.
- Re-lock happens **only** on a persistent structural shift: current monthly obligations ≥25% away from the locked baseline for **3 straight months** (rent tier change, paid-off car, new dependent…), evaluated once per month (not per `hud()` call). Then the baseline re-locks to the trailing average.
- **Closed hostile traces:** (a) month-8 loan spike $950→$1400→$950 — target stays $2,850 throughout; (b) 2-month loan spike then repay — no re-lock; (c) permanent rent $950→$1,300 for 3 straight months — re-locks to $3,900; (d) migrated saves with no `efBase` lock on first call at the trailing-3 average.

### Fun upgrade: investment missions (brokerage)
Three optional missions, visible in the brokerage UI with live progress (`missionProgressHTML()`), each firing a **one-time CALM debrief** on completion (queued via `missionComplete()`, shown next time the brokerage renders so it can never collide with sleep's month-end modal flow). **No cash rewards** — badges only; money conservation untouched.
1. **Beat the savings account over 12 months** — 12-month clock starts on first holdings; completes when portfolio return (price + dividends) beats the bank's 0.3%/mo over ≥12 months. Clock restarts if the player sells everything.
2. **Crash survivor** — hold through a tick where the portfolio's price value drops ≥15% without selling any shares that month (`sellShares` sets `soldThisMonth`; measured in the tick before defaults/delistings).
3. **$500 dividend stream** — trailing-12-month dividends received ≥ $500 (`divTrailing12()`).

## Verification (repair round, by me)
- **32 new tests** (`/tmp/test-fixes.js`), all pass: seeded-grocery determinism (month-1 + full 24-tick world incl. grocery), grocery structure valid on all 24 ticks, exactly-7-draws consumption, `Math.random` disabled during init+12 ticks (no throw), lock engagement + 4 hostile traces + structural re-lock up/down + migrated-save lock, all 3 missions (completion, non-completion, trailing-12 window, debrief dedupe + CALM lesson modal, progress HTML), buy/sell round-trip conservation, unaffordable-buy block, FIFO partial sale.
- **27 unit tests** (`/tmp/test-phase1.js`): all pass (2 expectations updated for intended behavior changes: locked efund target; startGame now initializes the market eagerly).
- **86→87 integration tests** (`/tmp/test-integration.js`): all pass, incl. catch-up == live run after the fresh-stream-first seeding fix and a 24-month money-conservation run.
- `node --check` clean on the full file script. Real-Chromium playtest still with parent (this agent cannot drive a live browser).

## What was built

### 1. Deterministic seeded stock market (8 symbols)
- Universe: ABC FreshMart Groceries, BIX IronWorks Fitness, IJA Northline Delivery Co., KPN Kapow Noodle House, LLG Lucky's Entertainment, NRT Northline Realty Trust, RTW RightToWork Staffing, XYZ SwapMeet Holdings.
- Initial prices, drifts, sigmas, common shock (σ=0.02), news events (M4 ABC ×1.15, M9 LLG ×0.90), dividend schedules — all per records.
- Stream: `mktState = seed XOR 0x6D65726B`; mulberry32; Box-Muller cached pairs (per-tick, discarded at boundary); fixed draw sequence (common → 8 idiosyncratic in draw order → default draws → relist draws → 7 FreshMart draws, consumed FOR REAL by `groceryDraws`).
- Zero guard → immediate HALT; ≤$2 DISTRESSED (20% monthly default); halt age 6 → delisted, shares wiped, total-loss debrief; 30% relist at $3–$5 while halt age <6.
- Tick order: corporate actions → price update/status → dividends. Runs inside `updateStockPrices()`, called once per `sleep()` before `G.month++`, so event/dividend months key to the month just closed.
- Migration: legacy fractional holdings → floored whole shares AFTER deterministic catch-up (no phantom dividends during catch-up; catch-up does not fabricate obligation history).

### 2. Trading (brokerage UI)
- Whole shares only, buy/sell at the fixed monthly quote. FIFO lots, avg cost/share, unrealized P/L, realized-gains log, dividend log.
- Buying unlocks month 6 (browsing anytime); migrated holdings sellable anytime.
- Executable affordability gate: `buyShares` refuses when `cash < cost` — a buy can never make cash negative. Buttons also disabled when unaffordable.
- Halted/delisted: no trading, holdings frozen. Month-24 sales settle immediately.
- One-time investing tutorial (volatility vs liquidity, news-is-history, never-invest-rent-money) + the existing $1,000-savings-or-lesson-ack gate.
- 12-month canvas sparklines per stock with $2 distress line; charts/news never touch the market RNG.

### 3. Emergency fund meter (LOCKED target — see repairs below)
- Target = 3 × locked per-month baseline. The baseline locks when the 2-month history window completes (trailing average); re-locks only after 3 straight months ≥25% away (structural change). Obligations = bills + credit minimum + loan pay/arrears + $150 laptop plan.
- "Building history" until 2 months settle; 1×/2×/3× milestones locked until then; each crossing fires a one-time CALM debrief (one at a time; bank menu suppressed while showing).
- Meter in Bank header + 🛟 HUD chip (liquid savings only — cash + savings, never portfolio value).

### 4. Money Times
- Market headlines (news events, top mover/loser, defaults, relists, delistings, dividends) are generated AFTER prices move and shown ~65% of the time; otherwise the classic tip. News is history, never prophecy.

## Verification (this round, by me)
- **27 unit tests** (`/tmp/test-phase1.js`): determinism, exact news multipliers, dividend schedule math, no-dividend-when-distressed, affordable gate, FIFO, halt freeze, month-6 lock, efund target math, milestone lock, catch-up == live run. All pass.
- **86 integration tests** (`/tmp/test-integration.js`): full game JS loads in Node with DOM stubs; real `sleep()` × 5; buy/sell/dividends exact; brokerage renders; tutorial; milestone queue (1×→2×→3×→bank); 24-month run with money conservation (cash ≥ 0 every tick, shares integer ≥ 0, lots reconcile). All pass.
- Self-review caught and fixed 3 real bugs: missing `openBrokerage()` definition, milestone debrief overwritten by bank menu, catch-up polluting obligation history.

## Known deviations / limits
- `buyStock(sym)`/`sellStock(sym)` remain as thin wrappers for the test-hook export list.
- The dead first `sleep()`/`openBank()`/`hud()` copies were updated in lockstep but remain dead.
- Real-Chromium play (walk to Bank, click flows, screenshots, console check) NOT done — this agent cannot drive a live browser; parent must arrange.
- Fun polish is functional, not exuberant: cards, sparklines, monthly % movers, headlines, milestone debriefs. No animated ticker yet (deliberately — animated ticks must never move economic prices).

## Files
- Dev: `arcade-edition/paycheck-panic-expansion-dev.html`
- Scratch tests (not shipped): `/tmp/test-fixes.js` (32 repair-verification tests), `/tmp/test-phase1.js`, `/tmp/test-integration.js`, `/tmp/phase1.js`, `/tmp/apply-phase1.py`
