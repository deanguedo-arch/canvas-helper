# CHATGPT CHALLENGE — Phase 2: Arcade + Fun-First Retrofits + Presentation Overhaul

**Date:** 2026-09-29
**Base file:** `paycheck-panic-expansion-dev.html` (Phase 1 signed off, record v7.24, dual zero-hole sign-off 2026-09-29)
**Working copy:** build on a copy; the Phase 1 file stays untouched until dual sign-off.
**Record version:** bump to **7.25** (market model stays 7.24.0; new sections versioned below).

Phase 2 = **EXPANSION-BRIEF.md System 2 (playable arcade)** + **fun-first retrofits** + three
presentation upgrades Dean approved 2026-09-29: **pilot menu reskin**, **articulated sprite
movement**, **pilot banking presentation**. All three reference the course pilot file
`~/workspace/user/files/paycheck-panic-course-pilot.html` (techniques only — do not copy its
simpler game engine).

---

## PART A — Playable arcade at the Mall (from EXPANSION-BRIEF.md System 2)

Location: Mall — the arcade wing has its own street entrance, **EVENING only, 7 days**.
One arcade visit consumes the EVENING token and allows **up to 3 cabinet plays; each cabinet
max once per day** (action budget + exploit cap).

**Energy:** immediate costs deducted atomically at play start (e.g. claw −2); each cabinet play
additionally records an **8-energy next-morning liability, stacking to a 24 cap** — settled once
on sleep, after restoration, then cleared. Deferred liability is never also charged at play start.

### Cabinets
- **Claw Machine ($3/play + 2 energy):** arrow keys/drag to position, one timed drop wins by
  alignment within a visible target zone. Pendulum sway; amplitude grows with consecutive WIN
  days (streak), resets on loss/skipped day: `amplitude_deg = (8 + 14×d1) × min(2.0, 1 + 0.15 × streak)`
  (cap 2.0× at streak ≥ 7). Prize positions reseed daily; **5 decor prizes per WEEK** (refresh
  Monday). Pool exhausted → plays give +1 happiness only (stated on glass). Clean grab (no edge
  contact) → +2 happiness.
- **Rhythm Rush ($4/play):** notes scroll on a timing bar; hit within the window. **Visual timing
  bar is the primary channel — fully playable muted; audio is enhancement only. Mute silences
  the gain node; the AudioContext is NEVER suspended during a run** — the WebAudio clock is the
  sole gameplay clock and runs regardless of mute. Score bands: <60% $0, 60–79% $1, 80–89% $3,
  **90%+ $6**.
- **Lane Racer ($4/play):** 3-lane dodge — arrows/A-D or three full-height touch zones (min 44px).
  Obstacles spawn with seeded gaps, 0.8s telegraph at base speed, speed rises with distance; crash
  = speed loss, not instant death. Run ends at 1,000m or 3 crashes ("wrecked"). **Every finisher
  paid full $6 — no finish-time bands.** Wreck pays 50% of distance-band payout (<400m $0→$0;
  400–699m $1→$0.50; 700–999m $3→$1.50). **Rival/leaderboard ranking by distance first, then
  elapsed time.** Quitting mid-run forfeits the play (stated).
- **Prize Wheel ($2/spin):** pure chance, odds on the glass: 40% $0, 30% $1, 15% $2, 10% $3,
  4% $5, 1% $10 (EV $1.20 < $2). **Classified as gambling**, feeds the lifetime gambling net tracker.
- **Token Trader ($5/entry):** closed loop, **prize tokens only — NO cash conversion, by design.**
  Entry buys 100 tokens at 1.00; fresh seeded mini-market runs 10 ticks inside the play
  (persistent campaign attempt counter: counterUsed = attemptCounter, then attemptCounter += 1
  atomically; FIRST attempt uses counterUsed = 0). Per tick: price × (1 + Normal(0, 0.05))
  Box-Muller on the attempt-seeded stream, floor $0.05, zero fees. Score = virtual cash + tokens
  × final price; prizes by band (100+ small, 140+ medium, 180+ large souvenir trophies —
  permanent souvenir tagging, never flea-listable). Ties broken by more virtual cash (stated
  upfront). **Tokens expire when you leave the cabinet.** Classification: entertainment; gambling
  tracker untouched. Arcade classification rule posted in-game: *chance + cash prize = gambling;
  skill + cash prize = entertainment with capped prizes; no cash prize = entertainment.*

### Arcade money plumbing
- **Entry and payout are separate transactions:** `txn.cabinetEntry` debits the fee and mints one
  immutable attemptId; `txn.cabinetPayout` credits the prize keyed to the SAME attemptId on valid
  completion only. Quitting mid-run keeps the entry committed, creates no payout.
- Glass states the expert cap only: "a consistently expert player can earn at most
  ($6−$4) × 30 days = **$60/month** — designed skill-prize income, not an exploit." Average-player
  EV is a balancing target, never a stated fact.
- **Arcade prizes are souvenirs, not assets:** every claw/prize-wheel decor prize carries permanent
  `souvenir:true` — $0 resale, excluded from flea-market selling and furniture liquidation.
  Cash-bought furniture tracks real acquisition cost; **guaranteed resale 50%** via the canonical
  `actions.furnitureResale`.
- Payout tables posted on each cabinet in-game.
- **High scores tagged per save-slot + mode + rulesVersion** — never inherited across profiles.
  2 NPC rival scores per SKILL cabinet (fixed numbers in `marketModel.rivalScores`: claw 2/4 grabs,
  rhythm 68%/86%, racer 640m/920m, token-trader 135/168 — design-baked 60th/85th-percentile targets,
  never recomputed, never a global maximum). Prize Wheel has NO rivals. Beating a rival = one-time
  recognition per cabinet per save.
- **Seeded layouts (v7.12 algorithms):** the three skill cabinets derive layouts deterministically
  from ONE arcade-stream draw per play via the exact `rngAlgorithm` in `casino.cabinets` — claw:
  bit-field prize placement on 5×2 grid + 3 sway params; rhythm: splitmix64-expanded 32-note lanes
  + timestamps; racer: splitmix64-expanded 24-obstacle lanes + distances + types. Identical seeds
  reproduce identical runs. New stream `arcade` (salt per records); streamSeed = campaignSeed XOR salt.

---

## PART B — Fun-first retrofits (from EXPANSION-BRIEF.md)

Every shipped stat grind gets a real minigame. All obey universal invariants (atomic energy at
start, stated block cost, pause-safe, touch + mute playable). One-time narrative beats and
pure-banking transactions are exempt.

- **Gym → "Beat Rep" (Wellness):** hold-and-release strength loop — press and HOLD to lift the rep,
  RELEASE when the marker reaches the top zone; timing + hold-duration scored (Perfect/Good/Miss).
  10-rep set: Perfect = 3 pts, Good = 2, Miss = 0. **Score → stat (`statProgression.beatRep`):**
  hits (Perfect+Good) ≥ 4 of 10, else +0 ("no gains today — muscles need real effort"; energy cost
  still spent, stated upfront); wellness gain = floor(totalPoints ÷ 10) clamped 1–3. Costs one DAY
  token + energy, deducted atomically at start. One workout per DAY token. Stats integers 0–100.
- **Night school → "Sort It Out" (Money Smarts):** rapid-fire rounds sorting falling wants-vs-needs
  cards into NEED / WANT / **IT DEPENDS** against a timer, then CALM quiz questions with instant
  explanations. **Every card carries a context tag** (e.g. "Phone — delivery driver, dispatch needs
  it" vs "Phone — upgrade from a working phone"); IT DEPENDS requires picking the matching reason
  chip for full points. Debrief states: "needs depend on your situation — the same object can be a
  need or a want." **Score → stat (`statProgression.sortItOut`, % correct cards + quiz):** ≥90% → +3,
  70–89% → +2, 50–69% → +1, <50% → +0. Costs one EVENING token + energy. One class per evening.
- **Mall money book → "Speed Read" quiz (Money Smarts alt route, no longer a bypass):** buying the
  $25 book unlocks a 60-second quiz on the book's contents; **+3 only on ≥70%**, else +1 ("skimmed
  it"). Repeat purchases follow `statProgression.speedRead.rewardByPurchaseIndex`: first +3 on ≥70%
  (else +1), second rewarded purchase +1, third+ +0 ("you've outgrown beginner books"). Each purchase
  mints a unique purchase ID — `txn.bookPurchase` idempotency keyed on purchase ID. Walk-click-repeat
  stat path is closed; diminishing returns stated on the shelf.
- **Diner coffee → "Read the Room" (People Skills):** NPC regular with hidden current NEED
  (vent / advice / encouragement / space) + topic; pick responses (listen / encourage / advise /
  deflect) across 3 exchanges. **No fixed policy wins:** needs rotate per visit (seeded); match = +2
  rapport, neutral = +1, mismatch (advising someone who needs to vent) = −1; best response never
  visually marked; remembering something the NPC said two visits ago unlocks +1 callback line.
  Two regulars require opposite play: Marta needs venting first, advice only later; Devon wants
  direct advice, dislikes deflecting. **Rapport → stat (`statProgression.readTheRoom`, max 7/visit):**
  ≥6 → +3, 3–5 → +2, 0–2 → +1, <0 → +0. Costs one EVENING token + $3 diner coffee. One chat/evening.

Keep every shipped system working: 3 career lanes + shift minigames, pay stubs, budget planner +
month-end review, FreshMart, amortized loans, credit minimums, stats, casino (with the five EV
fixes), property ladder, karma, Money Times, burnout, and ALL of Phase 1 (stocks, emergency fund,
missions, save migration, deterministic catch-up).

---

## PART C — Pilot menu reskin (Dean: "I like the menu style of this as well, not the weird emojis")

Adopt the course pilot's menu design language across all game menus/modals:
- Cream paper cards (`#fffaf0`, 23px radius, deep shadow) on dark green blurred backdrop.
- Small-caps eyebrow labels (10px, letter-spaced) above large titles.
- Button system: gold primary (`#f4cb61`, 3px hard shadow), sage secondary, red danger, gray quiet;
  min 46px touch height.
- Card grid (`.item`): title, description, big price, button pinned to bottom.
- Choice rows: full-width, left-aligned, bold title + small description.
- Callouts: yellow left-border lesson boxes, green notice boxes, fine print.
- **No emojis in menus.** Replace existing emoji icons with text labels and simple unicode marks
  (⌖ ≡ ☰ style). HUD, dock, hotspots included.
- Keep the game's identity (title art, town art, character art); this is a menu/chrome reskin, not
  an art replacement.

## PART D — Articulated sprite movement (Dean: "the movement of the sprites is dope")

Replace the sliding-static-PNG player movement with the pilot's procedural walk-cycle technique:
- Every frame, draw the figure on canvas: legs swing on a sine phase, arms counter-swing, head
  eyes shift with facing direction, soft ground shadow, subtle landing bounce.
- Player keeps character identity via torso color per chosen character (Alex/Maya/Jay/Sam/Classic);
  character select screen stays.
- NPC wanderers in town: waypoint pairs, facing flips on direction change, y-sorted depth rendering
  with the player (pilot's `npcData` pattern: 3–4 named NPCs walking set routes).
- Motion respects the existing motion-effects toggle (reduced motion = static figures).
- Technique reference: pilot's `drawStick` (phase-driven swing, `phase += dt*5` while moving).

## PART E — Pilot banking presentation (Dean asked for my take; approved: steal the presentation, keep our engine)

Reorganize the bank UI into tabs — **Save & withdraw / Debt & loans / Investments / Budget /
Pay stubs** — while keeping the full existing engine (amortized loans + schedules, credit
minimums, Phase 1 stock market, emergency fund meter):
- Quick amounts: $100, $500, and **"Safe"** = cash − upcoming obligations − $200 buffer (teaches
  buffer thinking; never proposes an amount that breaks bill-paying).
- Loan confirmation modal states explicitly: "This loan adds $X cash and $X debt. Interest is
  1.5% monthly. Borrowing increases cash AND debt; **it is not income**."
- Deposit/withdraw with strict dollar parsing (positive, max two decimals).
- Investments tab keeps the six-month GIC presentation alongside the Phase 1 brokerage.

---

## UNIVERSAL INVARIANTS (must hold — audit these first)

1. Every money path conserves money (ledger balances to zero; no path creates or destroys cash).
2. Player choices can never make cash negative (guards + true-ups, never silent borrowing).
3. Gambling stays negative-EV and honestly labeled (prize wheel odds on glass; EV $1.20 < $2).
4. Atomic costs: energy/fees deducted at action start; stated upfront; no double-charging
   (especially the arcade's deferred 8-energy morning liability — never charged twice).
5. Pause-safe: pausing mid-minigame never loses committed entry fees or creates payouts.
6. Determinism: identical campaign seed → identical arcade layouts, cabinet outcomes, NPC needs,
   quiz cards. Seeded streams only; no `Math.random()` in gameplay logic.
7. Touch + mute playable: every cabinet and retrofit minigame fully playable on touch and muted.
8. Character/world scale consistent; no regressions to Phase 1 systems (re-run the Phase 1
   acceptance checks: market init on fresh start, halt/default/relist lifecycle, emergency fund
   meter, missions, save migration).
9. Zero console errors; zero external requests (fully offline).
10. Walk-click-wait is rejected: if a retrofit minigame is boring, it is not done.

## DELIVERABLE

A working `paycheck-panic-expansion-dev.html` with Phase 2 complete, plus a build-notes section
appended to `BUILD-NOTES-phase2.md` documenting deviations. Then the audit loop:
**ChatGPT adversarial audit → repair → re-audit → Muse independent Chromium verification →
dual zero-hole sign-off** (0 P0 / 0 P1 / 0 P2 from both sides), same bar as Phase 1.
