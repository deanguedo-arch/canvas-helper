# PAYCHECK PANIC — Arcade Minigames Edition
## Complete Build Plan (hand this to the builder)

**What this is:** A 2D life-sim game for a high-school CALM (Career and Life Management) course. A stickman lives in a small town for 24 months, works shifts, gets paid, budgets, shops, and survives without going broke. Every system teaches a real money lesson. School-appropriate, single HTML file, works offline.

**What happened before this plan:** An earlier version of this game (v3) worked well — town map, buildings, career ladder, stocks, events, save/load. A rebuild attempt broke it. **This plan starts from the working v3 file and adds to it. Do not rebuild from scratch. Do not remove working features.**

**The one-line pitch:** *Stick RPG meets arcade cabinets — every work shift is a 90-second arcade minigame, and every dollar is real math.*

---

## 1. DESIGN PILLARS (follow these on every decision)

1. **Arcade first.** Minigames must feel like arcade cabinets: a timer, a score, combos, waves that get faster, lives/strikes, juicy feedback (screen shake, sounds, "COMBO x5!" popups). Simple controls — tap, or one finger, or arrow keys. A 14-year-old should understand each minigame in 10 seconds.
2. **Every dollar is traceable.** No money appears or disappears without a labeled transaction. If cash changes, the player can see why.
3. **The money is legit.** Pay stubs with deductions, a budget planner, savings with compound interest, amortized loans, credit-card minimums. Rates are simplified for learning and clearly labeled as in-game, not real tax law.
4. **Systems bite each other.** Low energy makes minigames harder. Skipping groceries hurts energy. Debt hurts credit score. Stress hurts performance. Nothing lives in isolation.
5. **School-appropriate, CALM-aligned.** Every major system ends with a one-line money lesson. No gambling glorification, no predatory mechanics.

---

## 2. START FROM THE WORKING VERSION — DO NOT BREAK

The builder will be given the working file (the v3 2D version). It contains:

- Top-down town map with 11 buildings (apartment, office, grocery, bank, night school, gym, diner, mall/arcade, dealership, lottery, park), player movement (WASD/arrows + mobile joystick), collision, building interiors
- 24-month game loop with HUD (cash, savings, debt, happiness, energy, stress, credit score, month counter)
- 30 life events with CALM lessons and delayed follow-ups
- Career ladder, trainable stats (Money Smarts, Wellness, People Skills), night school courses, gym, stocks, bank loans, casino/lottery, property ladder + furniture, Money Karma titles, newspaper headlines, broke/game-over screen, ranked win screen, localStorage save/continue

**Rules for the build:**
- KEEP all of the above working exactly as-is unless this plan explicitly says to change something.
- ADD the three arcade minigames (Section 3) as the new shift-work system.
- UPGRADE the money systems to the spec in Section 4.
- UPGRADE groceries to the market spec in Section 5.
- If a v3 feature conflicts with this plan, this plan wins — but flag the conflict in your build notes.
- The quest system (if any quest code exists in the file you receive): **remove it.** The designer killed quests. NPCs stay as shopkeepers/ambience only.

---

## 3. THE THREE ARCADE MINIGAMES (the core of this edition)

Each career lane has its own 90-second arcade shift. The player walks to the workplace, presses "Work shift," and the minigame starts full-screen.

**Universal arcade rules (all three games):**
- 90 seconds on the clock, visible countdown.
- Score starts at 0. Correct actions add points; mistakes break the combo.
- **Combo system:** consecutive correct actions build a multiplier (x1 → x2 → x3 → x4 → x5, +1 tier per 5 streak). A mistake resets it to x1. Big combo tiers trigger a popup ("COMBO x5! 🔥"), screen shake, and a happy sound.
- **Difficulty waves:** at 60s, 40s, and 20s remaining the game speeds up (faster spawns, tighter timers). Announce each wave ("RUSH HOUR! ⚡").
- **Low-energy handicap:** if the player's energy is below 30 when the shift starts, everything moves ~25% faster and timers are ~25% shorter. Show a warning: "Low energy — this shift will be harder! Eat something."
- **Performance → pay:** final score converts to a performance rating 0–100% (each game defines its own curve), which converts to a pay multiplier from **0.7× to 1.3×** (linear: multiplier = 0.7 + performance × 0.6). Show the math on the results screen: "Score 8,400 → Performance 82% → Pay ×1.19."
- **Results screen** after every shift: score, best combo, correct/mistakes, performance %, pay multiplier, gross pay, and one CALM lesson line. Then the pay stub (Section 4.1).

### 3A. RETAIL — "Checkout Chaos" (Grocery store)

**Fantasy:** You're the cashier on the busiest Saturday of the month.

- Items scroll right-to-left on a conveyor toward your scanner.
- Each item shows a price tag ($1–$20, realistic grocery prices).
- Below the belt: **4 price buttons** (one matches the item's price, three are plausible fakes like $4.99 vs $5.49).
- Tap the matching price **before the item reaches the scanner**.
- Correct: cha-ching, +100 × combo, item flies into the bag. Wrong button or item reaches the end unscanned: the customer gets angry (😡 +1), combo resets.
- **3 angry customers = shift ends early** (strike system, show 3 hearts/customer faces).
- Waves: belt speeds up; later waves use trickier prices (close-together numbers, $x.99 endings).
- Performance curve: 0 mistakes + high throughput ≈ 100%; each angry customer ≈ −20%.
- CALM result line example: "Rush-hour cashiers who stay accurate earn more — speed without accuracy is just expensive."

### 3B. OFFICE — "Inbox Blitz" (Office)

**Fantasy:** It's Monday morning and the inbox is on fire.

- Task cards fly in from an inbox tray onto the desk, each showing a **one-line workplace situation** (use the 8 scenarios below, simplified to fast reads) with **2–3 big action buttons**.
- Tap the correct action **before the card's timer bar empties** (~5 seconds, shrinking each wave).
- Correct: stamp "APPROVED ✅", +100 × combo. Wrong or expired: stress +4, combo resets, card flies into the shredder.
- No lives — it's pure throughput vs. the clock, but every mistake visibly raises the player's stress meter on screen.
- The 8 scenarios (keep the full CALM lesson text for the post-shift debrief, but the card itself is one line + buttons):
  1. Coworker asks for your login → [Never share] [Share it]
  2. Spill blocking the exit → [Clean + report it] [Leave it]
  3. Coworker makes a discriminatory joke → [Speak up / report] [Laugh along]
  4. Boss asks you to backdate a form → [Refuse, date it today] [Backdate it]
  5. Résumé gap question in an interview → [Answer honestly] [Make something up]
  6. Printer jam, deadline in 10 min → [Tell boss + fix] [Panic quietly]
  7. Coworker takes credit for your work → [Document + talk to them] [Say nothing forever]
  8. Customer demands a refund against policy → [Offer store credit per policy] [Break policy]
- Post-shift **debrief**: show the one scenario the player got wrong (or a random one if perfect) with its full 2–3 sentence CALM lesson.
- CALM result line example: "Fast is good. Fast and ethical is employable."

### 3C. DELIVERY — "Tip Runner" (Diner)

**Fantasy:** You're the delivery driver on a Friday dinner rush.

- Top-down mini map (a few streets, the diner, 6 houses). Drive a scooter with **arrow keys/WASD or touch-drag**.
- Orders pop up: drive to the diner to grab the food (drive over it), then to the customer's house.
- Each order has a **heat bar** draining in real time. Deliver hot = big tip ($5–$12 scaled by remaining heat). Deliver cold = $1. Order expires = $0 + wasted trip.
- **Traffic:** cars cross the streets. Hit one = crash (drop current food, 3-second stun, screen shake).
- **Fuel:** drains as you drive; fuel cans spawn — grab them or you slow to a crawl.
- Up to 3 active orders at once in later waves; new orders spawn faster each wave.
- Tips are shown as floating "+$8 🤑" popups and added to a visible tip jar.
- Performance curve: based on deliveries completed + average heat at delivery + crashes.
- Pay math: base pay × multiplier **plus the actual tips earned** (tips are separate income on the pay stub).
- CALM result line example: "Tips are a performance wage — hot food and safe driving literally pay."

---

## 4. MONEY SYSTEMS (must be legit)

### 4.1 Pay stubs (every payday)
After each shift, show a pay stub:
- Gross pay = monthly base × performance multiplier (show the math: "$2,400 × 1.19 = $2,856")
- Delivery: separate "Tips: $27" line added to gross
- Deductions, clearly labeled as **in-game fictional rates for learning, not real tax law**:
  - Income-tax withholding: 12%
  - Pension-style contribution: 5%
  - Employment-insurance-style contribution: 2%
- Net pay = the actual deposit to cash. Every line must reconcile: gross − deductions = net, exactly.
- If the player skips their shift that month: gross = base × 0.8, no performance, no promotion progress, stub still shown.

### 4.2 Monthly budget planner (Bank menu)
- Categories: Housing, Groceries, Transport, Debt payments, Savings, Fun, Buffer (for surprises).
- Player sets planned amounts at the start of the month.
- Every transaction in the game is **auto-categorized**; at month end, show **planned vs. actual per category, the variance, total income, total spending, and remaining buffer**.
- Rule of thumb taught: if actual spending exceeds planned by more than 10% in any category, the review flags it with a lesson ("Fun spending ran 40% over plan — fun is fine, surprise fun is debt.").

### 4.3 Savings
- Savings balance earns **0.3% per month** compound interest (show the annual equivalent ≈ 3.66% so players learn the conversion).
- Interest appears as its own transaction line: "Savings interest +$3.10."
- **Emergency fund target:** 3 months of essential expenses (housing + groceries + transport + debt minimums). Show a progress bar. If the fund is full and a surprise bill hits, the game notes "your emergency fund covered this."
- **GICs** (kept from v3): lock money for 6 or 12 months at a higher rate; show the trade-off explicitly ("Higher rate, but you can't touch it — liquidity has a price.").

### 4.4 Debt
- **Credit-card-style debt:** 2% monthly interest on the outstanding balance. Minimum payment each month = **greater of $25 or 2% of balance**. Missing the minimum: $25 late fee + credit score −15. Show the payoff forecast: "At minimum payments only: 47 months, $X total interest."
- **Bank loans:** proper amortization — each payment is split **interest first, remainder to principal** (the old build had a bug deducting the full payment from principal; do not repeat it). Show a full amortization schedule (month, payment, interest, principal, balance). Allow extra payments; show **interest saved** by each extra payment. New loan offers must show **total cost of borrowing** (sum of all payments), not just the monthly number.
- **Multiple debts:** the extra-payment UI defaults to **highest-interest-first (avalanche)** and says why; the player may override it.

### 4.5 Bills and month-end sequence (the monthly loop)
Run the month in this order — this is the economic backbone, borrowed from the designer's own *StudentBudgetWars* game:
1. **Work** — play the shift minigame (or skip → 0.8×, no promo progress).
2. **Get paid** — pay stub, net → cash.
3. **Bills auto-deduct** — housing, transport, debt minimums, subscriptions. Each shown as a line item.
4. **Player acts** — grocery shopping, budget tweaks, night school, gym, bank, diner, mall.
5. **Sleep → month end** — savings interest credited, debt interest charged, loan payments split, credit score updated, energy/stress carried over, 0–2 life events fire, budget review shown (planned vs. actual).
6. **Fail-state checks** — see Section 8.

### 4.6 Credit score (300–850, kept from v3)
- On-time minimums: +5. Missed minimum: −15. High debt vs. income: drifts down. Paying down debt: drifts up.
- Credit score gates loan offers (bigger loans need better scores) — show the gate.

---

## 5. GROCERY MARKET (situational, needs vs. wants)

- **14 grocery items** across produce, protein, dairy, grains, frozen, drinks, snacks, and coffee. Each has: price, calories, happiness effect, energy effect.
- **Monthly price dynamics:** each month, 2–3 items go on **SALE (−30%)** and 1–2 items have a **SHORTAGE (+40–60%)**, with a one-line news blurb ("🚨 Fuel surcharge lifts transport costs. Salmon up 53%."). Badges on the item cards.
- **Calorie target: 60,000/month** (~2,000/day). Show a progress bar while shopping.
  - Below 70% of target: "under-fed" — energy drains faster, minigames get the low-energy handicap.
  - 70–100%: okay. 100–120%: well-fed (small happiness bonus). Over 120%: overstocked (wasted money lesson).
- **Needs vs. wants, enforced by consequences:** calories are the need; coffee/snacks are wants. **Coffee:** max 30/month; each cup +energy +happiness, but over 20/month adds stress ("the jitters"). The market UI must make the trade-off visible, not hidden.
- **Skipping groceries** doesn't instantly fail you — the game auto-buys a sad $180 fallback (40% of calorie target, −25 energy: "vending-machine month"). The lesson lands without a death spiral.
- **Remove any old generic "grocery bill"** — all food spending must come from the actual cart.

---

## 6. CAREER LANES (3 approved lanes)

| Lane | Tier 1 | Tier 2 | Tier 3 | Minigame |
|---|---|---|---|---|
| Retail | Cashier $2,400 | Shift Lead $2,950 | Store Manager $3,600 | Checkout Chaos |
| Office | Clerk $2,800 | Coordinator $3,450 | Manager $4,250 | Inbox Blitz |
| Delivery | Driver $2,200 | Lead Driver $2,750 | Dispatcher $3,350 | Tip Runner |

- **Promotions:** 4 shifts at 80%+ performance **plus** stat gates (e.g., Shift Lead needs People Skills 25; Manager needs Money Smarts 35). Show requirements with ✓/🔒 in the workplace menu.
- **Switching lanes:** $150 retraining fee; tier/shift progress resets in the new lane; blocked if cash < $150 (no debt-spiral from job-hopping).
- **Stats** (kept from v3, 0–100): Money Smarts (night school $40 / money book $25), Wellness (gym), People Skills (diner coffee chats). Stats gate promotions and give small minigame edges (e.g., Wellness 50+ = +10% energy efficiency).
- **Shift costs:** each shift costs energy and adds stress (retail 12⚡/8😰, office 9⚡/6😰, delivery 14⚡/7😰 — tune in testing).

---

## 7. ENERGY / STRESS / WELLBEING

- Working a shift costs energy and adds stress. Sleeping restores energy; fun (mall, park, diner) restores happiness and cuts stress.
- **Energy 0:** can't work the shift (button disabled: "Too exhausted — eat or rest."). This must be a hard gate, not a suggestion.
- **Stress ≥ 80 for two straight months:** **burnout** — forced rest month (no shift, must do recovery actions), with a supportive message, not a punishment screen.
- Food, coffee, naps (free, once a month, +10⚡), and sleep all move these numbers. Every change is shown with a floating indicator.

---

## 8. WIN / LOSE

- **Broke:** cash below $0 after bills → warning + one month to recover (gig work / sell stuff). Still below $0 next month → game over ("The town repo'd your couch."). Game-over screen shows months survived, lessons learned, and "try again" — never shaming.
- **Burnout collapse** (Section 7) is a setback, not game over.
- **Win:** survive all 24 months → ranked ending by net worth + career tier + credit score + happiness (ranks like "Money Mentor" → "Debt Diver," kept from v3's karma titles).
- LocalStorage save/continue with versioning; old saves migrate or reset cleanly with a notice.

---

## 9. CALM CONTENT (weave it in, don't bolt it on)

- The 8 office scenarios (Section 3B) carry the career/workplace lessons.
- Keep v3's 30 life events with lessons + the Money Times headlines.
- Every results screen (shift, budget review, month end) ends with **one** lesson line — short, plain-spoken, no preaching.
- The designer has 16 career/workplace lesson packets and finance lesson packets; use them as the source of truth for lesson wording where they fit.

---

## 10. TECHNICAL REQUIREMENTS (non-negotiable)

1. **One self-contained `.html` file.** No build step. No external URLs — no CDNs, no fonts, no images hosted elsewhere. It must run from `file://` with **zero network requests** (verify in DevTools: the Network tab must be empty).
2. **Canvas for minigames**, DOM for menus. All art drawn in code or emoji — nothing to download.
3. **localStorage** save with a version key; handle corrupt/old saves gracefully.
4. **Mobile:** playable at 390×844. Touch targets ≥ 44×44px. Minigames fully touch-playable (delivery uses touch-drag). No modal wider than the viewport.
5. **Desktop:** keyboard for delivery (WASD/arrows), mouse/touch for the other two.
6. **Zero console errors or warnings** on load, through a full month, and on save/load. Test this.
7. **Performance:** 60fps on the minigame canvases; no layout thrash.
8. **Code structure:** keep game-logic functions (pay math, amortization, interest, grocery pricing, scoring curves) as **pure, testable functions** separated from rendering, so the math can be unit-tested.

---

## 11. BALANCE SHEET (starting numbers — tune, don't reinvent)

- Start: cash $2,500, savings $500, energy 80, happiness 70, stress 20, credit 650.
- Month length: 24. Rent (apartment): $800/mo. Bus pass: $60/mo (bike: one-time $150, kills the bus pass).
- Groceries: ~$250–350/mo for one person at normal prices.
- Minigame performance → pay multiplier: 0.7×–1.3×. Skipped shift: 0.8×, no promo progress.
- Savings: 0.3%/mo. Credit interest: 2%/mo. Loan example: $5,000 at ~1%/mo over 12 months.
- Promotion: 4 shifts ≥ 80% + stat gates. Lane switch: $150.
- Difficulty target: a decent player who budgets should finish months 1–6 comfortably, feel pressure in months 7–18 (rent hike event, surprise bills), and win month 24 with planning — not grinding.

---

## 12. ACCEPTANCE CRITERIA (test before calling it done)

**Logic tests (run in Node against the pure functions):**
- [ ] Pay stub: gross − (12% + 5% + 2%) = net, exactly, for at least 9 gross values including $0 and odd numbers.
- [ ] Multiplier: performance 0% → 0.7×, 50% → 1.0×, 100% → 1.3×.
- [ ] Savings: 12 months of 0.3% compounding matches the closed-form value.
- [ ] Loan: amortization schedule ends at balance 0; principal column sums to the loan amount; every row: payment = interest + principal.
- [ ] Credit minimum: max($25, 2% of balance); missing it applies fee + score hit.
- [ ] Grocery: sale = −30%, shortage = +40–60%; cart totals = Σ(price × qty); calorie bands correct.
- [ ] Budget review: planned vs. actual variance math; >10% over plan flagged.

**Browser tests (real Chromium, desktop + 390×844 mobile):**
- [ ] Title → new game → all 3 lanes selectable → each minigame opens, plays full 90s, shows results + pay stub.
- [ ] Grocery: add items, checkout, cash decreases by the exact cart total, calories recorded.
- [ ] Budget planner saves; month-end review shows planned vs. actual.
- [ ] Loan: schedule renders, extra payment reduces total interest, "interest saved" shown.
- [ ] Save → reload → continue works. Zero console errors in every run. Screenshots of every screen.

**Do not ship until every box is checked.** The designer was burned by unverified builds — self-reported "it works" is not accepted; show the test output.

---

## 13. WHAT NOT TO BUILD

- **No quests.** Removed by design. NPCs are shopkeepers and ambience only.
- No 3D, no multiplayer, no real-money anything, no external assets or network calls.
- No new currencies, no loot boxes, no dark patterns. If a mechanic would embarrass the designer in front of a classroom, cut it.
- Don't "improve" v3 systems that already work (movement, interiors, stocks, casino, property, events) — wire the new systems into them.

---

## 14. DELIVERABLES

1. `paycheck-panic-arcade.html` — the game, one file.
2. A `BUILD-NOTES.md` — what you changed from v3, the tuning numbers you chose, any conflicts with this plan and how you resolved them.
3. Test output — the logic-test results and the browser-test checklist from Section 12, with screenshots.

**Tone of the game text:** plain-spoken, a little funny, never preachy. The player is a young adult, not a child and not a finance major. Lessons land as one-liners, not lectures.
