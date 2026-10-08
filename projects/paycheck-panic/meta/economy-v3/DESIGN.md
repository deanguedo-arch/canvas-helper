# Financial life candidate

## Direction and ownership

New campaigns have one six-month Story (60–90 minute design target, not measured) and ongoing Free Play. Both use one financial engine and the existing illustrated town. The two fictional situations are an 18-year-old finishing high school at home and a 20-year-old sharing housing. Appearance does not alter money or odds. The $1,200 near-term goal is distinct from learning: six chapters, actual actions, reasons, and monthly revisions complete the story; missed goals or debt do not erase evidence or trigger an arbitrary bankruptcy reset.

Canonical entry: `workspace/index.html`. Active owners: `sim-economy.js`, `sim-game.js`, `sim-world.js`, `sim-activities.js`, `sim.css`; shared `art.js`, `asset-manifest.js`, `world-core.js`, and existing generated atlases. `earlier.html` owns the preserved prior candidate and its Quick/Class/Life saves. Raw import and supplied ZIP are untouched. No automatic old-save migration. Imported runtime remains Annotation only; course/LMS release stays blocked.

## Supplied price book

All monetary balances and transfers are integer cents. These are authored scenarios, not actual Alberta quotes.

| Case | Scheduled work | Opening money | Fixed monthly commitments |
|---|---|---|---|
| Student | $17.50 × 48 h, two 24 h pays | $300 cash, $150 emergency | $80 transit, $45 phone, $40 essentials; one-third food share |
| Independent | $18.50 × 160 h, two 80 h pays | $1,500 cash, $300 emergency | $950 rent, $110 transit, $25 insurance, $100 utilities/internet, $45 phone, $60 essentials; full food cost |

Complete four-group monthly baskets: value $280/two preparation blocks, mixed home $360/one, convenience $520/none. All four groups must be chosen. Month six adds 5%. An explicitly recorded shortfall buys nothing and produces −10 energy/+5 stress before month-end recovery. It prevents poverty from trapping progression behind an unaffordable purchase.

Paydays: 15 and 30. Bills settle on their supplied dates. Reading/movement do not advance financial time. Four discretionary blocks per month: preparation, extra work, training, or leisure. One extra eight-hour shift consumes a block and is fully paid even if accepted after day 15. $120/two-block certificate increases this case’s wage $0.50/h from next month. Month four cuts ordinary hours 20%.

Budget saving earmarks money, not transfers. Available cash protects bills due before payday, arrears, missing food allowance and remaining saved goal/emergency allocations. Actual cash spending and overages are compared at the review. Account transfers never create earnings.

## Consequences

- Device: keep working device; refurbished $420 cash/credit; or $25 × 24 months = $600, cancellation requires remaining balance. Existing $45 service is month-to-month. Future instalments remain after the story.
- Card: $2,000 purchase limit, 20.99% nominal APR applied monthly, min(balance, max($25, 2% statement)), $25 missed-minimum fee; supplied no-grace model. Extra payments count toward minimum.
- Loan: $600/$1,200, initial 12-month amortization; 10% fixed or 12% variable changing to 15% in chapter four; unchanged payment can extend repayment; no origination fee, $25 missed-payment fee. Arrears partition the balance and are not additional principal charged twice.
- Bills: shortfalls remain owed, with supplied $25 rent/$10 other fees. An explicit provider arrangement pays half now and defers the remainder until next month without deleting liability.
- Emergency deposit: fictional 3% nominal annual interest applied monthly. Fund: 0.5% annual management fee applied monthly, then illustrative market path with losses; no guarantee/tax wrapper model.
- Gym: $12/one block, or $45 monthly admission; visits still consume blocks. Three automatic 20-second segments, equal score weights; no cash or employment skill reward. Fountain: capped +3 energy/−2 stress once per month. Arcade: $5/one block for monthly visit, reusable practice, no cash payouts or resale.
- Casino: one block/visit, ten wagers, chosen total-stake cap, cash only. Roulette: 37 equal outcomes, red/black 18/37 inclusive 2× return, straight seven 1/37 inclusive 36×. Independent 13-symbol slot reels: triple seven 100×, other triples 10×, exactly one pair 0.6×, otherwise zero; expected return 82.0573509%. Outcome settles before display and is saved. Risk grows with stakes/exposure; odds never secretly change.

## Chapter progression

1. Actual movement, saved budget, food coverage, collected pay-stub understanding.
2. Device terms/total cost/psychological influences and social priorities.
3. Transport full costs and borrowing/rates/capacity/application requirements.
4. Reduced income, recovery, debt strategies and revised plan.
5. Actual allocation or investigation, accounts versus products, inflation, risk, leverage, future and mortgage calculators.
6. Information exposure, digital habits, scam classification/verification/reporting, consumer investigation and final evidence.

Every later month also requires a saved plan and food choice or recorded shortfall. Major decisions and month reviews save a short reason. Final/downloaded journey separates wealth, gambling luck and minigame scores from written evidence; it does not automatically grade CALM mastery.

## State contract

Rules `2026.09.financial-story.1`, schema 3, independent campaign UUID, scenario, Story/Free, receipts, ledger, reasons, settings and resumable activity. `reviewSession` isolates QA. Numeric/structural validation, primary write, previous revision backup, conflict refusal, downloadable backup and restoration as new identity. Gym cost and activity creation are atomic; completion settles once. YTD resets every 12 Free Play months; supplied rates stay fixed to this rules version.
