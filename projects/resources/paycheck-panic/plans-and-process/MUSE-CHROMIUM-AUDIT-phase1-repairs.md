# Muse real-Chromium audit — Phase 1 repairs (2026-09-29)

Target: `paycheck-panic-expansion-dev.html` (post-repair build)
Method: real Chromium 152.0.7977.82 via raw CDP, file:// load, full user-flow driving
(real clicks, keyboard input, proximity+E interactions — no direct state cheating
except where noted). 0 console errors, 0 page errors, 0 external requests.

## Flow verified end-to-end
- Title → mode pick (Classroom) → character select (5 characters render) → career
  lane pick → "Why this lane?" debrief → town spawn.
- Keyboard walking (D key) moves the player.
- Bank: walk to door + E → interior; move to counter hotspot + E → bank menu.
  (Interior positions are image fractions; proximity radius works.)
- Budget planner opens from bank menu; sawPlanner unlocks month advance.
  Month-1 sleep block without planner is the intended Round-4 checkpoint (verified
  in code: classroom mode toasts and returns; free-play gets one nudge).
- Brokerage: tutorial modal → "Got it" → main screen, all 8 symbols, 3 investment
  missions with live progress, 12-mo charts, per-stock Buy 1 / Buy 5 / Buy max.

## Money conservation (all exact to the cent)
- Buy gate month 1: BLOCKED, cash unchanged ($1,000 → $1,000).
- First buy with savings < $1,000 → invest-lesson modal → "I understand — buy 5"
  completes the purchase in one tap: 5 × $51.92 = $259.60, cash $4,096 → $3,836.40 exact.
- Unaffordable buy (82 × $51.92 > cash): BLOCKED, cash unchanged.
- Dividends: ABC paid month 9; divLog amounts verified = perShare × shares held.
- Sell all: 6 × $53.02 = $318.12 credited exact; 0 shares left; FIFO lots consumed
  first-lot-first (5@15.06 + 5@22.59, sold 7 → 3@22.59 remain), realized gains logged.
- Forced HALTED: buy AND sell blocked, cash/shares unchanged.
- Forced DELISTED: holdings frozen, portfolio value $0.
- Forced cash=$10: buy blocked, cash stays $10.
- Oversell (sell 103 of 3 held): clamps to held — deliberate `Math.min` design,
  credits exactly 3 × price, never negative. Not a bug.
- Balances never negative across the full 12-month run.

## Repairs under test
- Emergency fund: target LOCKED at $2,850 (3 × $950) after history window;
  HUD shows 🛟 214%; 1× milestone modal fired with CALM lesson. Gaming via
  temporary obligation spikes is closed (per builder's hostile traces).
- FreshMart RNG: grocery draws exist on the market stream (`hasGroceryDraws: true`).
  Full seed-replay determinism was verified by the builder's 32 repair tests
  (Math.random-throws through init + 12 ticks); not re-proven here.
- Missions: Beat-the-savings (12-mo clock), Crash survivor (15% drop, no sell),
  $500 dividend stream — all visible, live progress, read-only, no cash rewards.

## Visual quality (screenshots reviewed)
Title, char select, lane debrief, town, bank interior (teller, couches, hotspots
with badges), budget planner (7 categories + take-home estimate), brokerage
tutorial, brokerage main (company names, ACTIVE badges, dividends, charts),
portfolio (own 6 @ avg $53 · value $319, Buy 1/5/max), e-fund milestone modal.
All polished; no layout breaks.

## False alarms investigated and cleared
1. `sleep()` "not advancing" — intended planner checkpoint, not a bug.
2. Duplicate `sleep()` definition at line 1829 — dead code; live one is at 3936.
3. Phantom 6th share — my own test clicked the real "Buy 1" UI button; the game
   processed it correctly and conserved money exactly.

## Verdict: CLEAN — 0 P0 / 0 P1 / 0 P2
No repairs needed from the Muse side. Awaiting ChatGPT re-challenge verdict for
dual sign-off.
