# PAYCHECK PANIC 3D — Shared Build Spec

Every builder (Muse, Muse Code, ChatGPT Pro) builds from THIS spec. Same requirements, different builders. Best parts get combined into v4.

## Concept
A 3D stickman budget-survival game. You are a stickman in a small 3D neighborhood. You walk around, earn paychecks, spend money, dodge life's surprises, and try to survive 12 months without going broke. Educational goal (CALM financial literacy): needs vs wants, trade-offs, emergency funds, credit/debt, scams, opportunity cost.

## Tech
- Single self-contained HTML file (+ local assets folder if needed)
- Three.js via CDN for 3D
- Must work on mobile (touch joystick) and desktop (WASD/arrows)
- No build step, no login, runs from file://

## World
A small stylized 3D neighborhood block containing:
- **Apartment (home)** — textured with `assets/tex-apartment.png`
- **Workplace (office)** — textured with `assets/tex-office.png`
- **Grocery store**, **Bank**, **Mall/Arcade** (fun) — procedural is fine
- Streets, trees/lamps for charm, simple skybox/lighting
- Title screen uses `assets/title.png`
- HUD shows the player avatar: `assets/avatar-happy.png` / `avatar-worried.png` / `avatar-broke.png` depending on finances

## Character
- Classic stickman (sphere head, capsule body, cylinder limbs) with a simple walk animation
- Third-person follow camera
- Movement: WASD/arrows on desktop, virtual thumb joystick on touch
- Collision: stay in world bounds, don't walk through buildings (simple push-out)

## Core loop (per month)
1. Player roams freely.
2. **Work**: walk in once per month → collect paycheck (job: ~$2,200–3,400/mo, builder picks exact number). Second visit in same month → overtime offer event.
3. **Grocery**: choose food tier (cheap/normal/nice — different cost & happiness).
4. **Mall/Arcade**: fun spending options (cost money, boost happiness).
5. **Bank**: deposit to / withdraw from savings.
6. **Home**: sleep → end month → fixed bills auto-deducted (~$950 + phone/transport) → random life-event card → next month.

## Systems (tracked in HUD)
- **Cash** (spending money), **Savings** (emergency fund), **Debt** (credit, 2%/mo interest + minimum payments), **Happiness** (0–100), **Month** (1–12)
- Cash below $0 at any point → **BROKE: game over**
- Complete month 12 → win screen with rank by net worth (savings − debt):
  - $6,000+: Financial Rockstar / $3,000+: Solid Planner / $1,000+: Survivor / else: Barely Hanging On
- Show end-of-game stats + one "what mattered most" lesson

## Life events (street ambushes while roaming)
Implement at least 12 of these as modal cards with 2–3 choices each. Every event teaches its CALM concept (shown after the choice):
1. **Car trouble** ($480 repair): pay from savings / credit ($120×5 with interest) / ignore it (worse later — follow-up event: $700 breakdown)
2. **Phone screen cracked** ($220 fix / $90 cheap fix / live with it)
3. **Friend's birthday dinner** ($70 go / $35 light / skip — happiness trade-offs)
4. **Overtime offer** (+$240, −happiness / rest +happiness)
5. **Subscription creep** ($86/mo discovered → cancel unused, save $54/mo)
6. **Toothache** ($310 dentist / $25 painkillers → 50% chance of $420 root canal later)
7. **Tax refund** ($520 windfall: save all / split / splurge)
8. **The jacket** (40% off $180: buy / 48-hour rule → urge fades)
9. **Rent increase** (+$90/mo accept / move to cheaper place, −happiness)
10. **DM scam** ("turn $200 into $2,000": block = correct / send = lose $200)
11. **Bike vs bus** ($350 bike once vs $110/mo pass)
12. **Takeout temptation** ($45 delivery vs cook at home)
13. **Credit card offer** (shred / emergencies only / buy $900 TV on credit → debt)
14. **Sick day** (no paid sick days: lose $140 wages resting / work sick −happiness)
15. **Course upgrade** ($380 certification → permanent pay raise after 2 months)

## Feel
- Playful, not preachy. Funny event writing encouraged.
- Juice: coin particles on payday, screen shake or red flash on big expenses, happy bounce on good news.
- Sound: optional, simple WebAudio bleeps (no external files).

## Deliverable
One HTML file (plus `assets/` folder with the 6 provided PNGs). Name it `paycheck-panic-3d.html`.
