# CALM 10 Coverage Map — Paycheck Panic Arcade Edition

*Map built from the verbatim 2026-09-22 draft CALM 10 curriculum text (`calm10-draft-verbatim.md`), extracted from New LearnAlberta and spot-verified by a second independent live-browser pass on 2026-09-27.*

**Game baseline for this map.** Shipped Sept 27, 2026 (single offline HTML, save schema v6): 3 career lanes (Retail/Office/Delivery, 3 tiers each) with 90-second arcade shift minigames (pay scaled 0.7x–1.3x by performance; strong shifts grow stats: Retail +2 People Skills, Office +2 Money Smarts, Delivery +tips/+Wellness); 3 trainable stats 0–100 (Money Smarts via night school, Wellness via gym, People Skills via diner coffee); pay stubs with fictional labeled 12%/5%/2% deductions; budget planner + month-end planned-vs-actual review; FreshMart grocery (14 items, 60,000-calorie monthly target, sales/shortages, capped coffee want); savings accounts + GICs (compound interest); simple stock market carried from v3 (buy $200 lots / sell all at Bank); credit cards with minimums max($25, 2%); amortized bank loans (1.5%/mo, 12-month schedule, extra payments, missed payments hit credit score); energy/stress/burnout month; promotions every 4 shifts; Lucky's Casino (slots/roulette/lottery) with lifetime gambling net tracker; property ladder Apartment→Condo→House→Mansion + 7 furniture items (happiness); Money Karma (−100..100); Money Times newspaper (12 CALM headlines); teacher mode (`?teacher=true`) surfacing student choices, stats, and which CALM lessons landed; 24-month loop; win screen with reputation/skills/stocks summary.

**Planned expansion (approved, NOT built — always labeled "planned"):** real stock system (8 fictional companies, per-share trading, 12-month charts, average cost, unrealized/realized gains, quarterly dividends, news-driven prices, no shorting/margin, T+ settlement); playable mall arcade; tier-matched walkable home interiors; life-chaos events + insurance; living town (NPCs, day/night, weather, shop hours); synthesized sound.

---

## Organizing Idea 1 — Career Exploration

**Guiding Question:** How can planning support the pursuit of educational and career goals?
**Learning Outcome:** *Students investigate how engaging in career planning shapes readiness for the future.*

Key knowledge/skills bullets: exploring interests and strengths; career clusters (business administration and finance, skilled trades, human services); NOC occupational classification; occupational profiles (duties, wage ranges, education/training requirements); labour market information varying by region; interest inventories; resumés, cover letters, portfolios, online employment profiles; high school program plans; networking; career plans changing with internal/external factors (relocation, labour market shifts, evolving interests, entrepreneurial opportunities, unforeseen circumstances); transition management strategies (accessing supports, managing responses to change, adapting); life goals reflecting personal values and the interconnection of education, career, finances, and well-being; work-life balance strategies (scheduling tools, healthy digital habits, stress management, breaking goals into steps, flexibility, seeking support); career pathways as linear/non-linear progressions; researching qualifications and employability skills; incorporating feedback to revise plans.

### (b) Present but shallow

**What exists:** The three career lanes with three tiers each, stat-gated advancement (Office shows check/lock requirements), promotions every 4 shifts, and per-lane stat growth genuinely simulate a *career pathway* — "a progression of formal education, training, and various jobs over time" — and the stat gates mirror "researching occupations helps identify required academic qualifications and essential employability skills." Energy/stress/burnout mechanics touch work-life balance consequences, and Money Times headlines carry CALM career content.

**What would deepen it:** The outcome's core verb is *investigate*, and the investigatory layer is absent — there are no interest inventories, career clusters, NOC/occupational profiles with wage and training data, labour-market research, resumés or portfolios, high school program plans, life-goal/values goal-setting, or structured work-life balance strategies. Deepening = a career-planning hub: interest inventory recommending a lane, occupational profiles shown before lane selection (duties, wage ranges, training requirements), a career-plan screen the player revisits as plans change, all surfaced in teacher mode as assessable evidence.

---

## Organizing Idea 2 — Career Opportunities

**Guiding Question:** How do work-related experiences influence career development?
**Learning Outcome:** *Students explore work-related experiences related to career pathways of interest.*

Key knowledge/skills bullets: employability skills assessment and refinement; work-related experiences (volunteering, job shadowing, community service, career fairs, entrepreneurship) developing employability skills; self-assessment and feedback; job-specific responsibilities and workplace safety; positive workplace culture; networking (mentorship, internships, mock interviews); insight into training requirements (on-the-job training, trades/apprenticeships, micro-credentials, dual credit, diplomas, degrees); types of employment (full-time, part-time, temporary, seasonal, self-employment, multiple jobs) and their differing impacts on career/financial security, benefits, and lifestyle; interview preparation strategies.

### (b) Present but shallow

**What exists:** The arcade shift minigames *are* simulated work-related experiences: 90-second shifts with performance-based pay (0.7x–1.3x), stat (employability-skill) growth per lane, promotions every 4 shifts, and CALM debriefs after shifts (e.g., Inbox Blitz) that provide the reflection step. Teacher mode logs choices and which lessons landed.

**What would deepen it:** Missing: interview preparation or mock interviews (a natural gate before tier promotions), networking/mentorship/shadowing experiences, volunteering or community-service options, any comparison of employment types (the game models one full-time job shape), and entrepreneurship (named explicitly in the curriculum). Deepening = interview minigame before promotions, a "side gigs" board showing part-time/seasonal/self-employment with different security/benefits trade-offs, and an entrepreneurship path.

**Guiding Question:** How do employment rights and responsibilities support employees in the world of work?
**Learning Outcome:** *Students investigate employee rights and responsibilities in the workplace.*

Key knowledge/skills bullets: employer duty to protect health and safety; Alberta Human Rights Act, Occupational Health and Safety legislation, Alberta Employment Standards Code (federal/provincial); employment standards (payment of earnings, hours/breaks/overtime, vacations/statutory holidays, termination, youth employment restrictions); employee responsibilities (knowing applicable legislation, hazards, training, right to refuse dangerous work); protection against workplace discrimination and a discrimination-free workplace.

### (c) Missing

No workplace-rights content exists in the shipped game. Pay stubs touch "payment of earnings" only as a number on a slip, not as a standard. The local lesson-packet source files contain workplace scenarios (hazards, discrimination) but they are not implemented in the game. The approved planned expansion does not cover this. Closing it would fit the existing frame: workplace events during shifts (unpaid overtime offered, unsafe task with right-to-refuse choice, discriminatory scheduling) with CALM debriefs, plus a Money Times explainer series — all assessable through teacher mode.

---

## Organizing Idea 3 — Financial Literacy

**Guiding Question:** How do economic and financial decisions support personal and financial well-being?
**Learning Outcome:** *Students analyze factors and strategies that impact economic and financial decisions.*

Key knowledge/skills bullets: evaluating costs, benefits, and trade-offs with short- and long-term consequences; assessing and comparing costs of major purchases; researching products/services before purchase; prioritizing spending; understanding a pay stub (current and year-to-date totals, additional earnings, deductions, overtime); contextual factors (professional advice, family, culture, community); psychological factors (emotions, habits, attitudes); beliefs and values about money, debt, saving, and credit across cultures and lived experience; major purchases via fixed-term contracts, month-to-month agreements, leases, or one-time purchases; overextending (overspending/borrowing beyond repayment ability); long-term costs of major purchases (insurance, maintenance, interest); fixed-term vs. month-to-month considerations (commitment, cancellation, penalties, predictability, frequency).

### (a) Fully embedded and assessable

**Game systems (all shipped):** pay stubs with labeled deductions (supports "explain elements on various pay stubs"); budget planner + month-end planned-vs-actual review (the analyze step, with real consequences); FreshMart grocery with 14 items, sales, and shortages (assessing/comparing costs, researching before purchase); property ladder purchases (major-purchase cost evaluation); credit cards, bank loans, and credit-score consequences (investigating overextension with modeled outcomes); Lucky's Casino with lifetime gambling net tracker (risk/low-odds financial decisions). **Teacher mode evidence:** `?teacher=true` surfaces the student's budget plans vs. actuals, pay-stub views, loan/credit decisions, and which CALM lessons landed — the analysis is logged, not just performed.

**Thin bullets (honest caveat):** psychological factors (emotions, habits, attitudes), beliefs/values about money across cultures and lived experience, and fixed-term vs. month-to-month contract comparison are not covered — these are gap items (see top-10 list).

**Guiding Question:** In what ways can lending and debt affect financial planning?
**Learning Outcome:** *Students explore lending products and debt management as part of financial planning.*

Key knowledge/skills bullets: consequences of financial decisions including debt accumulation; debt-management strategies (additional lump-sum payments, prioritizing high-interest debt, adjusting budgets, emergency fund); gambling/lotteries/sports betting as risk to financial security; saving strategies (bundling, comparing fees); financial leveraging (using debt to invest — magnifies gain and risk); lending-product features (terms, rates, application requirements); formats (vehicle loans, cash advances, lines of credit, mortgages, student loans, buy-now-pay-later); secured vs. unsecured credit; fixed vs. variable interest rates; amortization (principal + interest per payment over months/years); co-borrowers; mortgages (income confirmation, down payment, amortization, credit score, prepayment options); comparing cost of borrowing with a financial calculation tool.

### (b) Present but shallow

**What exists:** The debt-management core is real and modeled honestly — amortized bank loans with a visible principal/interest schedule, extra (lump-sum) payments, credit-card minimums, missed payments damaging the credit score, and budget adjustment as a lever. The casino's lifetime net tracker directly teaches gambling's impact on financial security.

**What would deepen it:** Lending-product breadth is the gap: no mortgages (despite a four-tier property ladder — the single most natural mortgage-teaching moment in the game), no vehicle loans, student loans, lines of credit, cash advances, or buy-now-pay-later offers; no fixed-vs-variable rate choice; no secured-vs-unsecured distinction taught; no in-game financial calculation tool for comparing borrowing costs; no emergency-fund framing for savings; financial leveraging is untouched. Deepening = mortgage path on Condo/House/Mansion purchases (down payment, income confirmation, amortization choice, prepayment), a rotating set of lending offers to compare, and an in-game loan calculator. The planned expansion does not add lending products.

**Guiding Question:** How can financial plans support long-term goals?
**Learning Outcome:** *Students examine the role of saving, investing, and strategies for future financial planning.*

Key knowledge/skills bullets: financial plans (budgeting) changing across life stages; saving (short-term/unanticipated costs) vs. investing (intentional long-term planning); opportunity cost; savings/investment products (mutual funds and others) in registered and non-registered accounts; product features, terms, risks, rates of return; registered accounts (TFSAs, RRSPs, FHSAs, RESPs); alignment factors (purpose, duration, life stage, risk tolerance, fees, ROI, investor knowledge); financial calculation tools and simulators; market fluctuations and volatility; investments varying in risk/uncertainty/benefit (e.g., cryptocurrency, bonds); inflation eroding purchasing power.

### (b) Present but shallow

**What exists:** Saving is solid — savings accounts and GICs with compound interest over the 24-month loop, plus the budget planner as the financial-plan artifact. A simple stock market (buy $200 lots / sell all at Bank, carried from v3) gives investing a first, shallow foothold.

**What would deepen it:** The **planned** 8-company stock system (per-share trading, 12-month charts, average cost, unrealized/realized gains, quarterly dividends, news-driven prices) would make market fluctuations, volatility, and risk/return genuinely playable — label it planned, not shipped. Still missing even after that: registered vs. non-registered accounts (TFSA, RRSP, FHSA, RESP are named explicitly in the curriculum), mutual funds/bonds/crypto as distinct products, risk-tolerance alignment, opportunity cost, inflation (modelable across 24 months of prices), and financial calculation tools/simulators.

**Guiding Question:** In what ways can protecting personal information impact financial security?
**Learning Outcome:** *Students examine strategies for protecting personal information.*

Key knowledge/skills bullets: digital identity/footprint from online transactions; footprint enabling identity theft, fraud, scams, financial loss; consumer protection laws (Alberta); fraud and scam types (investment, job, emergency, online purchase, romance); fraud indicators (requests for personal info, unusual payment methods, urgency/secrecy, too-good-to-be-true offers, impersonation of trusted sources); protection strategies (device/password security, reviewing transactions, reporting phishing, minimal sharing, privacy settings, digital literacy, educating others); notifying authorities (law enforcement, financial institutions, credit bureaus).

### (c) Missing

Zero coverage in the shipped game — no fraud, scam, phishing, identity-theft, or consumer-protection content anywhere (not in systems, events, Money Times, or debriefs). The approved planned expansion does not cover this. It is highly gameable: phishing-text and too-good-to-be-true "investment opportunity" events (especially once the planned stock system lands — investment scams are a named curriculum item), a Money Times consumer-protection series, and a "review your transactions" habit loop would map almost every bullet to playable, assessable content.

---

## Bucket tally per organizing idea

| Organizing idea | Outcomes | (a) Fully embedded | (b) Present but shallow | (c) Missing | (d) Unsuitable |
|---|---|---|---|---|---|
| 1 — Career Exploration | 1 | 0 | 1 | 0 | 0 |
| 2 — Career Opportunities | 2 | 0 | 1 | 1 | 0 |
| 3 — Financial Literacy | 4 | 1 | 2 | 1 | 0 |
| **Total** | **7** | **1** | **4** | **2** | **0** |

Honest read: the game's center of gravity is financial decision-making mechanics, and it shows — 3 of 4 financial-literacy outcomes have real systems behind them. Career content is the weaker pillar: pathways and progression exist, but the curriculum's planning, research, and workplace-rights skills are thin or absent. Fraud protection is the single largest zero-coverage outcome.

## (d) Unsuitable for the game — outcome level: none

No learning outcome is unsuitable at the outcome level. Three specific *bullets* are better handled in class than in the game and should not drive game design: **creating an actual high school program plan** (requires the student's real school course catalog — a guidance task, not a game task); **participating in a supervised work-related experience in school or the community** (a real-world placement the game can simulate but never provide); **investigating current legislation** (legal research belongs in coursework; the game can dramatize rights through events, not teach statute).

---

## Top 10 gaps worth closing in the game (prioritized)

1. **Fraud/scam protection (OI3)** — zero coverage; phishing and too-good-to-be-true investment-scam events plus a Money Times consumer-protection series would map nearly every bullet; pairs naturally with the planned stock system.
2. **Employee rights and responsibilities (OI2)** — zero coverage; shift events (unpaid overtime, unsafe task with right-to-refuse choice, discriminatory scheduling) with CALM debriefs fit the existing minigame frame.
3. **Mortgages on the property ladder (OI3)** — buying a House/Mansion with cash teaches nothing; a mortgage path (down payment, income confirmation, amortization choice, prepayment, credit-score gating) is the most thematically natural lending lesson available.
4. **Registered investment accounts (OI3)** — TFSA/RRSP/FHSA/RESP are named explicitly in the curriculum; the planned stock system should offer account-type choice with tax treatment, not just a taxable brokerage.
5. **Career-planning hub (OI1)** — interest inventory recommending a lane, occupational profiles (duties, wage ranges, training requirements) before lane selection, and a revisable career-plan screen, all logged to teacher mode.
6. **Lending-product breadth + comparison tool (OI3)** — student loans, BNPL, and line-of-credit offers to compare; fixed-vs-variable rate choice; an in-game loan calculator for "compare cost of borrowing."
7. **Inflation, opportunity cost, and simulators (OI3)** — show prices/savings eroding across the 24-month loop; an explicit save-vs-invest-vs-pay-debt choice moment.
8. **Interview prep and employment types (OI2)** — mock-interview gate before tier promotions; a side-gig board contrasting part-time/seasonal/self-employment security and benefits.
9. **Fixed-term vs. month-to-month contracts (OI3)** — a phone-plan choice is a small, cheap, explicitly named curriculum bullet.
10. **Psychological and cultural factors in money decisions (OI3)** — reflective debriefs after casino sessions and big purchases (emotions, habits, values); Money Karma is the natural hook.
