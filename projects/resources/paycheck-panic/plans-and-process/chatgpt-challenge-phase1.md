# ChatGPT challenge brief — Phase 1 code (real stocks + emergency fund)

**What to challenge:** the Phase 1 implementation in `paycheck-panic-expansion-dev.html` (dev copy; shipped file untouched).
**Records authority:** `product-records-v7.24.json`, market model 7.24.0.
**New code location:** search for `PHASE 1 (expansion)` — one contiguous block after `netWorth()`, plus hooks in `updateStockPrices`, both `openBank()` copies, `hud()`, `showNews()`, `load()`, `startGame()`, `freshState()`, test-hook exports. Build notes: `BUILD-NOTES-phase1.md`.

## Challenge 1 — money holes (highest priority)
Try to break money conservation. For each, give a concrete trace with numbers:
1. Can any buy make cash negative (float edge, `Buy max`, price $0.01, cash $0.005…)?
2. Can dividends be double-paid or paid on shares not held at the tick (buy after tick, sell before tick)?
3. Halted-stock exploits: buy at $0.01 pre-halt, sell after relist — is any of that a money printer?
4. Delisting: does the realized-loss accounting reconcile (lots removed, no phantom shares)?
5. FIFO: construct a 3-lot buy sequence and a partial sale — is the gain exact?
6. Sell-all at month 24 — proceeds settle immediately with no other month-24 interference?
7. Emergency fund: can the target be gamed (e.g., debt spike then repay) to trigger milestones dishonestly?

## Challenge 2 — records conformance
Against market model 7.24.0, verify: 8 symbols with exact initial prices/drifts/sigmas; common shock σ=0.02; news events (M4 ABC ×1.15, M9 LLG ×0.90); dividend schedules (ABC/RTW/KPN quarterly, IJA semi-annual, NRT annual; BIX/LLG/XYZ none); halt/default/relist/delist rules; draw order and stream alignment; whole shares; month-6 buy gate; no-margin.

## Challenge 3 — logic bugs
Halt-age increment/delist timing; relist draw eligibility (newly halted excluded same-tick?); migration catch-up determinism; milestone queue (one at a time, locked while building history); tutorial shown once; brokerage re-render after trades; charts using stored history only.

## Challenge 4 — fun / kid-UX
Dean's bar: "it can't feel boring." Is the brokerage fun for a 15-year-old? What's confusing, dead, or walk-click-wait about it? Concrete improvements, ranked.

## Verdict format
GO (zero holes) or NOT GO with P0/P1/P2 list. Quote exact code lines for every finding.
