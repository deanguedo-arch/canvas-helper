/* inline script 1 */
tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'] }
                }
            }
        }

/* inline script 2 */
const { useState, useEffect, useRef } = React;

        // --- CONSTANTS & INITIAL STATE ---
        const BUDGET_SCENARIOS = {
            home: {
                icon: "fa-house-chimney-user",
                title: "Living at Home",
                subtitle: "(College / Working)",
                desc: "You live with your parents rent-free, but you still need to cover your own phone, transportation, food extras, and fun spending.",
                tips: "Typical hint: Rent $0, Utilities $0, Groceries around $150"
            },
            alone: {
                icon: "fa-building",
                title: "Living Alone",
                subtitle: "(Working Full-Time)",
                desc: "You have your own place and total independence, but every bill is now your responsibility.",
                tips: "Typical hint: Rent $1,200+, Utilities $150+, Groceries $400+"
            },
            roommates: {
                icon: "fa-people-roof",
                title: "Living with Roommates",
                subtitle: "(School / Working)",
                desc: "You split rent and utilities with other people, which saves money, but you also give up privacy and flexibility.",
                tips: "Typical hint: Rent $500-700, Utilities $75-100, Groceries around $300"
            }
        };

        const BUDGET_FIELD_GROUPS = {
            income: [
                { key: "job", label: "Net Job Income", placeholder: "Net Job Income" },
                { key: "loans", label: "Student Loans / Grants", placeholder: "Student Loans / Grants" },
                { key: "support", label: "Family Support", placeholder: "Family Support" }
            ],
            fixed: [
                { key: "rent", label: "Rent / Room & Board", placeholder: "Rent / Room & Board" },
                { key: "utilities", label: "Utilities", placeholder: "Utilities" },
                { key: "internetPhone", label: "Internet / Phone", placeholder: "Internet / Phone" },
                { key: "transit", label: "Car / Transit", placeholder: "Car / Transit" }
            ],
            variable: [
                { key: "groceries", label: "Groceries", placeholder: "Groceries" },
                { key: "dining", label: "Dining Out", placeholder: "Dining Out" },
                { key: "personal", label: "Personal Care", placeholder: "Personal Care" },
                { key: "fun", label: "Fun / Entertainment", placeholder: "Fun / Entertainment" }
            ]
        };

        const BUDGET_PANEL_STYLES = {
            income: {
                wrapper: "bg-violet-50 border-violet-100",
                heading: "text-violet-700",
                badge: "bg-violet-200 text-violet-900"
            },
            fixed: {
                wrapper: "bg-rose-50 border-rose-100",
                heading: "text-rose-600",
                badge: "bg-rose-200 text-rose-900"
            },
            variable: {
                wrapper: "bg-amber-50 border-amber-100",
                heading: "text-amber-700",
                badge: "bg-amber-200 text-amber-900"
            }
        };

        const BUDGET_CURVEBALLS = [
            { desc: "Your car needs an unexpected repair.", amount: 350, type: "expense" },
            { desc: "You crack your phone screen and need to replace it.", amount: 200, type: "expense" },
            { desc: "You get sick and miss shifts at work.", amount: 250, type: "expense" },
            { desc: "You pick up a bonus shift this month.", amount: 120, type: "income" }
        ];

        const AD_SCENARIOS = [
            { id: 1, product: "X-Treme Kicks", ad: "Join millions of teens already wearing X-Treme Kicks! Don't be the only one left out.", tactic: "Bandwagon", hint: "It implies everyone else is doing it." },
            { id: 2, product: "ClearSkin Pro", ad: "Feeling ugly? Lonely? ClearSkin Pro guarantees happiness and a perfect prom date.", tactic: "Emotional Appeal", hint: "It targets fear and promises happiness." },
            { id: 3, product: "MegaBurger", ad: "Our new burger is REVOLUTIONARY. It's an ALL-NATURAL paradigm shift in flavor!", tactic: "Glittering Generalities", hint: "It uses big words that don't mean anything specific." },
            { id: 4, product: "Star-Glow Energy", ad: "Pro-Athlete Mike Jenkins drinks Star-Glow every morning. Drink it to be a champion!", tactic: "Testimonials/Influencers", hint: "It uses a famous person to sell the product." },
            { id: 5, product: "Lumina Shampoo", ad: "Look at the gorgeous model's hair. Lumina makes everything about you better.", tactic: "The Halo Effect", hint: "It implies if the model is attractive, the product must be good." },
            { id: 6, product: "Quantum Brain Pills", ad: "Clinical studies show 98% of students improve their grades by 2 full letter grades within 3 weeks.", tactic: "Facts & Figures", hint: "It uses numbers and statistics to sound scientific (even if they are fake)." },
            { id: 7, product: "Diamond Elite Watch", ad: "Not everyone can appreciate true luxury. For those who demand the absolute best, and have the wealth to prove it.", tactic: "Snob Appeal", hint: "It makes you feel like you are part of an exclusive, wealthy club." }
        ];

        const AD_TACTICS = ["Bandwagon", "Emotional Appeal", "Glittering Generalities", "Testimonials/Influencers", "The Halo Effect", "Facts & Figures", "Snob Appeal"];

        const createDefaultBudgetScenarios = () => ({
            home: {
                income: { job: "", loans: "", support: "" },
                fixed: { rent: "0", utilities: "0", internetPhone: "", transit: "" },
                variable: { groceries: "", dining: "", personal: "", fun: "" }
            },
            alone: {
                income: { job: "", loans: "", support: "" },
                fixed: { rent: "", utilities: "", internetPhone: "", transit: "" },
                variable: { groceries: "", dining: "", personal: "", fun: "" }
            },
            roommates: {
                income: { job: "", loans: "", support: "" },
                fixed: { rent: "", utilities: "", internetPhone: "", transit: "" },
                variable: { groceries: "", dining: "", personal: "", fun: "" }
            }
        });

        const BUDGET_SCENARIO_DEFAULTS = createDefaultBudgetScenarios();

        const collectProgressValues = (value) => {
            if (Array.isArray(value)) return value.flatMap(collectProgressValues);
            if (value && typeof value === "object") return Object.values(value).flatMap(collectProgressValues);
            return [value];
        };

        const calculateBudgetTotal = (group) => Object.values(group || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

        const getBudgetScenarioState = (data, scenarioKey) => data.budgetScenarios?.[scenarioKey] || BUDGET_SCENARIO_DEFAULTS[scenarioKey];

        const getBudgetTotalsForState = (data, scenarioKey) => {
            const scenario = getBudgetScenarioState(data, scenarioKey);
            let income = calculateBudgetTotal(scenario.income);
            const fixed = calculateBudgetTotal(scenario.fixed);
            let variable = calculateBudgetTotal(scenario.variable);

            if (data.budgetLifeEvent) {
                if (data.budgetLifeEvent.type === "expense") variable += data.budgetLifeEvent.amount;
                if (data.budgetLifeEvent.type === "income") income += data.budgetLifeEvent.amount;
            }

            return {
                income,
                fixed,
                variable,
                expenses: fixed + variable,
                net: income - (fixed + variable)
            };
        };

        const formatMoney = (value) => new Intl.NumberFormat("en-CA", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(Number(value) || 0);

        const DEFAULT_STATE = {
            defMarketing: "", defPackaging: "", influenceExample: "", favoriteStore: "",
            purchases: Array.from({ length: 10 }, () => ({ item: "", influence: "" })),
            biggestInfluence: "",
            adAnalyzerIndex: 0,
            adAnalyzerScore: 0,
            adAnalyzerFeedback: "",
            adDeconstruction: "",
            joeDecision: "", sallyDecision: "", betterDecision: "",
            purchaseReflection: "",
            honestyNorma: "", honestyGertrude: "", honestyHerman: "", honestyAsif: "", honestyFrank: "", honestyCharlotte: "", honestySalima: "",
            honestyImportant: "", honestyAcceptable: "", honestyEasiest: "", honestyHardest: "", honestyReflection1: "", honestyReflection2: "",
            defConflict: "", conflictAbout: "", conflictResolve: "", conflictEffective: "",
            commSkills: [
                { poor: "Yelling at one another", good: "Speaking at a reasonable volume" },
                { poor: "Aggressive or standoffish body language", good: "Warm, or calm, body language" },
                { poor: "Interrupting", good: "" }, { poor: "Not listening", good: "" },
                { poor: "Not considering the other person's perspective", good: "" }, { poor: "Having to be right", good: "" },
                { poor: "Not accepting criticism", good: "" }, { poor: "Speaking more than you listen", good: "" },
                { poor: "Making generalizations", good: "" }, { poor: "Blowing things out of proportion", good: "" },
                { poor: "Not being open-minded", good: "" }
            ],
            incomeCurrent: "", incomeFuture: "", purchaseDecision: "", purchaseFactors: "",
            budget: { 
                job: "", parents: "", other: "", otherExp: "",
                rent: "", utilities: "", phone: "", groceries: "", car: "", insurance: "", gas: "", entertainment: "", dining: "", clothes: "", etc: "", etcExp: ""
            },
            budgetScenarios: createDefaultBudgetScenarios(),
            budgetLifeEvent: null,
            budgetChoice: "",
            budgetWhereFrom: "", budgetWhereGo: "", budgetEndMonth: "", budgetChange: "",
            caseJonCraig1: "", caseJonCraig2: "", caseJonCraig3: "",
            caseAmandaJoanne1: "", caseAmandaJoanne2: "", caseAmandaJoanne3: "",
            caseMayaLeticia1: "", caseMayaLeticia2: "", caseMayaLeticia3: "",
            supplementaryImage: null
        };

        const SECTIONS = [
            { id: 'intro', title: 'Start Here', icon: 'fa-rocket' },
            { id: 'advertising', title: '1. Advertising', icon: 'fa-bullhorn' },
            { id: 'waiting', title: '2. What Are You Waiting For?', icon: 'fa-car' },
            { id: 'money', title: '3. Managing Money', icon: 'fa-wallet' },
            { id: 'honesty', title: '4. Honesty Quiz', icon: 'fa-scale-balanced' },
            { id: 'maintaining', title: '5. Maintaining Relationships', icon: 'fa-handshake-angle' },
            { id: 'sum_cases', title: '6. Task: Case Studies', icon: 'fa-users' },
            { id: 'finish', title: 'Review & Submit', icon: 'fa-flag-checkered' }
        ];

        const hasTeacherReportValue = (value) => {
            if (typeof value === "string") return value.trim().length > 0;
            if (value === null || value === undefined) return false;
            return true;
        };

        const escapeTeacherReportHtml = (value) => String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

        const renderTeacherReportAnswer = (value) => {
            if (!hasTeacherReportValue(value)) {
                return '<span class="answer-empty-chip">Not answered</span>';
            }

            return `<div class="report-answer">${escapeTeacherReportHtml(String(value)).replace(/\n/g, "<br>")}</div>`;
        };

        const renderTeacherReportCardGrid = (items) => items.map((item) => `
            <article class="report-card">
                <h3>${escapeTeacherReportHtml(item.label)}</h3>
                ${renderTeacherReportAnswer(item.value)}
            </article>
        `).join("");

        const renderTeacherReportListCard = (label, items) => {
            if (!items.length) {
                return `
                    <article class="report-card report-card-wide">
                        <h3>${escapeTeacherReportHtml(label)}</h3>
                        ${renderTeacherReportAnswer("")}
                    </article>
                `;
            }

            return `
                <article class="report-card report-card-wide">
                    <h3>${escapeTeacherReportHtml(label)}</h3>
                    <div class="report-answer">
                        <ul class="report-list">
                            ${items.map((item) => `<li>${item}</li>`).join("")}
                        </ul>
                    </div>
                </article>
            `;
        };

        const buildTeacherReportSection = (eyebrow, title, content) => `
            <section class="report-section">
                <div class="report-section-heading">
                    <p class="report-section-eyebrow">${escapeTeacherReportHtml(eyebrow)}</p>
                    <h2>${escapeTeacherReportHtml(title)}</h2>
                </div>
                ${content}
            </section>
        `;

        const parseTeacherReportMoney = (value) => {
            if (typeof value !== "string" || value.trim().length === 0) return null;
            const numeric = Number(value.replace(/[^0-9.-]/g, ""));
            return Number.isFinite(numeric) ? numeric : null;
        };

        const formatTeacherReportMoneyCell = (value) => {
            const numeric = parseTeacherReportMoney(value);
            if (numeric === null) {
                return '<span class="answer-empty-chip">Not entered</span>';
            }

            return `$${numeric.toFixed(2)}`;
        };

        const formatTeacherReportMoneySummary = (value) => `$${formatMoney(value)}`;

        const collectTeacherReportValues = (fd) => [
            fd.defMarketing, fd.defPackaging, fd.influenceExample, fd.favoriteStore, fd.biggestInfluence,
            ...fd.purchases.flatMap((purchase) => [purchase.item, purchase.influence]),
            fd.adDeconstruction,
            fd.adAnalyzerScore === AD_SCENARIOS.length ? "complete" : "",
            fd.joeDecision, fd.sallyDecision, fd.betterDecision,
            fd.purchaseReflection,
            ...collectProgressValues(fd.budgetScenarios),
            fd.budgetChoice,
            fd.honestyNorma, fd.honestyGertrude, fd.honestyHerman, fd.honestyAsif, fd.honestyFrank, fd.honestyCharlotte, fd.honestySalima,
            fd.honestyImportant, fd.honestyAcceptable, fd.honestyEasiest, fd.honestyHardest, fd.honestyReflection1, fd.honestyReflection2,
            fd.defConflict, fd.conflictAbout, fd.conflictResolve, fd.conflictEffective,
            ...fd.commSkills.map((skill) => skill.good),
            fd.caseJonCraig1, fd.caseJonCraig2, fd.caseJonCraig3,
            fd.caseAmandaJoanne1, fd.caseAmandaJoanne2, fd.caseAmandaJoanne3,
            fd.caseMayaLeticia1, fd.caseMayaLeticia2, fd.caseMayaLeticia3,
            fd.supplementaryImage
        ];

        function buildCalmModule2TeacherReport(fd, { completedSections, answeredCount, responseCount }) {
            const purchaseItems = fd.purchases
                .filter((purchase) => hasTeacherReportValue(purchase.item) || hasTeacherReportValue(purchase.influence))
                .map((purchase, index) => `${index + 1}. <strong>${escapeTeacherReportHtml(purchase.item || "Item not named")}</strong>${hasTeacherReportValue(purchase.influence) ? ` <span class="muted-inline">(${escapeTeacherReportHtml(purchase.influence)})</span>` : ""}`);

            const communicationItems = fd.commSkills
                .filter((skill, index) => index > 1 && hasTeacherReportValue(skill.good))
                .map((skill) => `<strong>${escapeTeacherReportHtml(skill.poor)}</strong> -> ${escapeTeacherReportHtml(skill.good)}`);

            const budgetScenarioCards = Object.entries(BUDGET_SCENARIOS).map(([scenarioKey, scenarioMeta]) => {
                const totals = getBudgetTotalsForState(fd, scenarioKey);
                const scenario = getBudgetScenarioState(fd, scenarioKey);

                return `
                    <article class="report-card">
                        <h3>${escapeTeacherReportHtml(`${scenarioMeta.title} ${scenarioMeta.subtitle}`)}</h3>
                        <div class="report-answer">
                            <p><strong>Income:</strong> Job ${escapeTeacherReportHtml(scenario.income.job || "0")}, Loans/Grants ${escapeTeacherReportHtml(scenario.income.loans || "0")}, Family ${escapeTeacherReportHtml(scenario.income.support || "0")}</p>
                            <p><strong>Fixed:</strong> Rent ${escapeTeacherReportHtml(scenario.fixed.rent || "0")}, Utilities ${escapeTeacherReportHtml(scenario.fixed.utilities || "0")}, Internet/Phone ${escapeTeacherReportHtml(scenario.fixed.internetPhone || "0")}, Car/Transit ${escapeTeacherReportHtml(scenario.fixed.transit || "0")}</p>
                            <p><strong>Variable:</strong> Groceries ${escapeTeacherReportHtml(scenario.variable.groceries || "0")}, Dining ${escapeTeacherReportHtml(scenario.variable.dining || "0")}, Personal ${escapeTeacherReportHtml(scenario.variable.personal || "0")}, Fun ${escapeTeacherReportHtml(scenario.variable.fun || "0")}</p>
                            <p><strong>Totals:</strong> Income ${formatTeacherReportMoneySummary(totals.income)} | Expenses ${formatTeacherReportMoneySummary(totals.expenses)} | Net ${formatTeacherReportMoneySummary(totals.net)}</p>
                        </div>
                    </article>
                `;
            }).join("");

            const advertisingSection = buildTeacherReportSection(
                "Section 1",
                "Advertising and Consumerism",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Marketing Definition", value: fd.defMarketing },
                            { label: "Packaging Definition", value: fd.defPackaging },
                            { label: "Influence Example", value: fd.influenceExample },
                            { label: "Favorite Store or Brand", value: fd.favoriteStore },
                            { label: "Biggest Influence", value: fd.biggestInfluence },
                            { label: "Ad Analyzer Score", value: `${fd.adAnalyzerScore} / ${AD_SCENARIOS.length}` },
                            { label: "Brand Deconstruction", value: fd.adDeconstruction }
                        ])}
                        ${renderTeacherReportListCard("Purchase Influence Tracker", purchaseItems)}
                    </div>
                `
            );

            const waitingSection = buildTeacherReportSection(
                "Section 2",
                "What Are You Waiting For?",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Why Joe Bought the Camaro", value: fd.joeDecision },
                            { label: "Why Sally Bought the Escort", value: fd.sallyDecision },
                            { label: "Who Made the Better Decision", value: fd.betterDecision }
                        ])}
                    </div>
                `
            );

            const moneySection = buildTeacherReportSection(
                "Section 3",
                "Managing Money",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Purchase Reflection", value: fd.purchaseReflection },
                            { label: "Budget Choice Justification", value: fd.budgetChoice },
                            { label: "Curveball Event", value: fd.budgetLifeEvent ? `${fd.budgetLifeEvent.desc} (${fd.budgetLifeEvent.type === "expense" ? "-" : "+"}$${fd.budgetLifeEvent.amount})` : "" }
                        ])}
                        <div class="report-card report-card-wide">
                            <h3>Budget Scenario Comparison</h3>
                            <div class="report-grid">
                                ${budgetScenarioCards}
                            </div>
                        </div>
                    </div>
                `
            );

            const honestySection = buildTeacherReportSection(
                "Section 4",
                "Honesty Quiz and Reflection",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Norma: Found $100", value: fd.honestyNorma },
                            { label: "Gertrude: Graffiti", value: fd.honestyGertrude },
                            { label: "Herman: Lying to a Friend", value: fd.honestyHerman },
                            { label: "Asif: Wrong Change", value: fd.honestyAsif },
                            { label: "Frank: Found Phone", value: fd.honestyFrank },
                            { label: "Charlotte: Test Answers", value: fd.honestyCharlotte },
                            { label: "Salima: Tracing Art", value: fd.honestySalima },
                            { label: "When Honesty Matters Most", value: fd.honestyImportant },
                            { label: "When Lying Might Feel Acceptable", value: fd.honestyAcceptable },
                            { label: "Easiest Scenario", value: fd.honestyEasiest },
                            { label: "Hardest Scenario", value: fd.honestyHardest },
                            { label: "A Time I Chose to Lie", value: fd.honestyReflection1 },
                            { label: "Why Honesty Matters in Relationships", value: fd.honestyReflection2 }
                        ])}
                    </div>
                `
            );

            const relationshipsSection = buildTeacherReportSection(
                "Section 5",
                "Maintaining Relationships",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Conflict Definition", value: fd.defConflict },
                            { label: "Conflict Topic", value: fd.conflictAbout },
                            { label: "Resolution Attempt", value: fd.conflictResolve },
                            { label: "Was It Effective?", value: fd.conflictEffective }
                        ])}
                        ${renderTeacherReportListCard("Communication Skill Rewrites", communicationItems)}
                    </div>
                `
            );

            const caseStudySection = buildTeacherReportSection(
                "Section 6",
                "Case Studies",
                `
                    <div class="report-grid">
                        ${renderTeacherReportCardGrid([
                            { label: "Joe and Craig: How Should Joe Handle It?", value: fd.caseJonCraig1 },
                            { label: "Joe and Craig: How Will Craig React?", value: fd.caseJonCraig2 },
                            { label: "Joe and Craig: What If He Needs the Car Fixed?", value: fd.caseJonCraig3 },
                            { label: "Amanda and Joanne: How Should Amanda Handle It?", value: fd.caseAmandaJoanne1 },
                            { label: "Amanda and Joanne: How Will Joanne React?", value: fd.caseAmandaJoanne2 },
                            { label: "Amanda and Joanne: What If Joanne Could Be Kicked Out?", value: fd.caseAmandaJoanne3 },
                            { label: "Maya and Leticia: How Should Maya Handle It?", value: fd.caseMayaLeticia1 },
                            { label: "Maya and Leticia: How Will Leticia React?", value: fd.caseMayaLeticia2 },
                            { label: "Maya and Leticia: What If Her Boyfriend Threatens to Leave?", value: fd.caseMayaLeticia3 }
                        ])}
                    </div>
                `
            );

            const evidenceSection = buildTeacherReportSection(
                "Supplementary Evidence",
                "Optional Uploaded Image",
                fd.supplementaryImage
                    ? `
                        <div class="image-card">
                            <img src="${fd.supplementaryImage}" alt="Student supplementary evidence" />
                        </div>
                    `
                    : `<div class="report-card">${renderTeacherReportAnswer("")}</div>`
            );

            const reportHtml = `<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>CALM Module 2 Teacher Report</title>
                    <style>
                        :root { color-scheme: light; --ink: #0f172a; --muted: #475569; --line: #dbe4f0; --panel: #ffffff; --panel-soft: #f8fafc; --accent: #6d28d9; --accent-soft: #f5f3ff; --success: #047857; --success-soft: #ecfdf5; --warning: #92400e; --warning-soft: #fff7ed; }
                        * { box-sizing: border-box; }
                        body { margin: 0; padding: 2rem; background: #eef2ff; color: var(--ink); font-family: Inter, "Segoe UI", Arial, sans-serif; }
                        .report-shell { max-width: 1100px; margin: 0 auto; }
                        .report-hero { background: linear-gradient(135deg, #4c1d95, #7c3aed 52%, #c4b5fd); color: white; border-radius: 2rem; padding: 2rem; margin-bottom: 1.5rem; box-shadow: 0 24px 60px rgba(76, 29, 149, 0.22); }
                        .report-hero h1 { margin: 0 0 0.6rem; font-size: 2rem; line-height: 1.05; }
                        .report-hero p { margin: 0; color: rgba(255, 255, 255, 0.88); font-size: 1rem; }
                        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 0.9rem; margin-top: 1.4rem; }
                        .summary-stat { background: rgba(255, 255, 255, 0.14); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 1.25rem; padding: 0.95rem 1rem; }
                        .summary-stat-label { display: block; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255, 255, 255, 0.74); margin-bottom: 0.35rem; }
                        .summary-stat-value { font-size: 1.05rem; font-weight: 800; line-height: 1.35; }
                        .report-section { background: var(--panel); border: 1px solid var(--line); border-radius: 1.8rem; padding: 1.4rem; margin-bottom: 1.2rem; box-shadow: 0 12px 28px rgba(15, 23, 42, 0.06); }
                        .report-section-heading { margin-bottom: 1rem; }
                        .report-section-eyebrow { margin: 0 0 0.3rem; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }
                        .report-section-heading h2 { margin: 0; font-size: 1.45rem; line-height: 1.15; }
                        .report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.9rem; }
                        .report-card { background: var(--panel-soft); border: 1px solid var(--line); border-radius: 1.25rem; padding: 1rem; break-inside: avoid; }
                        .report-card-wide { grid-column: 1 / -1; }
                        .report-card h3 { margin: 0 0 0.65rem; font-size: 0.75rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
                        .report-answer { font-size: 0.95rem; line-height: 1.6; color: var(--ink); }
                        .answer-empty-chip { display: inline-flex; align-items: center; gap: 0.35rem; border-radius: 999px; padding: 0.3rem 0.7rem; background: var(--warning-soft); color: var(--warning); font-size: 0.8rem; font-weight: 700; }
                        .report-list { margin: 0; padding-left: 1.2rem; }
                        .report-list li + li { margin-top: 0.45rem; }
                        .muted-inline { color: var(--muted); }
                        .budget-wrap { display: grid; gap: 1rem; }
                        .budget-compare-table { width: 100%; border-collapse: collapse; overflow: hidden; border-radius: 1.25rem; border: 1px solid var(--line); background: white; }
                        .budget-compare-table th, .budget-compare-table td { padding: 0.85rem 0.9rem; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; font-size: 0.9rem; }
                        .budget-compare-table thead th { font-size: 0.75rem; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); background: #eff6ff; }
                        .budget-compare-table tbody tr:last-child td { border-bottom: 0; }
                        .budget-type-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.2rem 0.55rem; font-size: 0.72rem; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
                        .budget-type-income { background: var(--success-soft); color: var(--success); }
                        .budget-type-expense { background: #fef2f2; color: #b91c1c; }
                        .budget-compare-note { margin: 0; padding: 0.95rem 1rem; border-radius: 1rem; background: var(--accent-soft); color: #5b21b6; font-size: 0.92rem; font-weight: 700; }
                        .image-card { background: white; border: 1px solid var(--line); border-radius: 1.5rem; padding: 1rem; }
                        .image-card img { display: block; max-width: 100%; height: auto; border-radius: 1rem; border: 1px solid var(--line); }
                        @media print { body { background: white; padding: 0; } .report-hero { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                    </style>
                </head>
                <body>
                    <div class="report-shell">
                        <header class="report-hero">
                            <h1>CALM Module 2 Teacher Report</h1>
                            <p>Resource Choices response summary for review, printing, and discussion.</p>
                            <div class="summary-grid">
                                <div class="summary-stat"><span class="summary-stat-label">Student</span><div class="summary-stat-value">Not collected</div></div>
                                <div class="summary-stat"><span class="summary-stat-label">Sections Complete</span><div class="summary-stat-value">${completedSections} / ${SECTIONS.length - 1}</div></div>
                                <div class="summary-stat"><span class="summary-stat-label">Answered Prompts</span><div class="summary-stat-value">${answeredCount} / ${responseCount}</div></div>
                                <div class="summary-stat"><span class="summary-stat-label">Generated</span><div class="summary-stat-value">${escapeTeacherReportHtml(new Date().toLocaleString())}</div></div>
                            </div>
                        </header>
                        ${advertisingSection}
                        ${waitingSection}
                        ${moneySection}
                        ${honestySection}
                        ${relationshipsSection}
                        ${caseStudySection}
                        ${evidenceSection}
                    </div>
                </body>
            </html>`;

            return reportHtml;
        }

        // --- HELPER COMPONENTS ---
        
        const AutoExpandingTextarea = ({ value, onChange, placeholder, className = "" }) => {
            const textareaRef = useRef(null);
            useEffect(() => {
                if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto';
                    textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
                }
            }, [value]);
            return (
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`clay-input w-full p-4 text-slate-700 resize-none overflow-hidden ${className}`}
                    rows={2}
                />
            );
        };

        const KnowledgeDrop = ({ title, children, defaultOpen = true }) => {
            const [isOpen, setIsOpen] = useState(defaultOpen);
            return (
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-200 mb-6 overflow-hidden transition-all">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="w-full flex items-center justify-between p-4 bg-amber-100/50 hover:bg-amber-100 text-amber-900 font-bold"
                    >
                        <div className="flex items-center gap-3">
                            <i className="fa-solid fa-lightbulb text-amber-500 text-xl"></i>
                            <span>{title}</span>
                        </div>
                        <i className={`fa-solid fa-chevron-down transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
                    </button>
                    {isOpen && <div className="p-6 text-amber-900 space-y-4 leading-relaxed">{children}</div>}
                </div>
            );
        };

        const HintToggle = ({ hint }) => {
            const [show, setShow] = useState(false);
            return (
                <div className="mt-2">
                    <button onClick={() => setShow(!show)} className="text-sm font-semibold text-violet-500 hover:text-violet-600 flex items-center gap-2">
                        <i className="fa-solid fa-circle-question"></i> {show ? 'Hide Hint' : 'Stuck? Show Hint'}
                    </button>
                    {show && <div className="mt-2 p-3 bg-violet-50 rounded-xl border border-violet-100 text-sm text-violet-800 italic">{hint}</div>}
                </div>
            );
        };

        const ImageUploader = ({ image, onImageChange }) => {
            const canvasRef = useRef(null);

            const handleFile = (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = canvasRef.current;
                        const ctx = canvas.getContext('2d');
                        
                        // Scale down if too large (Max width 800px)
                        const MAX_WIDTH = 800;
                        let width = img.width;
                        let height = img.height;
                        
                        if (width > MAX_WIDTH) {
                            height = Math.round((height * MAX_WIDTH) / width);
                            width = MAX_WIDTH;
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress to JPEG to save localStorage quota
                        const base64 = canvas.toDataURL('image/jpeg', 0.6);
                        onImageChange(base64);
                    };
                    img.src = event.target.result;
                };
                reader.readAsDataURL(file);
            };

            return (
                <div className="mt-4 p-6 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-center hover:bg-slate-100 transition-colors relative">
                    {image ? (
                        <div className="relative inline-block">
                            <img src={image} alt="Uploaded evidence" className="max-w-full h-auto rounded-xl border shadow-sm" />
                            <button 
                                onClick={() => onImageChange(null)}
                                className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-600 shadow-md"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center text-2xl shadow-sm">
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                            </div>
                            <div>
                                <span className="font-bold text-slate-700">Click to upload</span> or drag and drop
                                <p className="text-sm text-slate-500 mt-1">PNG, JPG up to 5MB (Auto-compressed)</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFile} />
                        </label>
                    )}
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                </div>
            );
        };

        // --- MAIN APPLICATION ---

        const App = () => {
            const [formData, setFormData] = useState(DEFAULT_STATE);
            const [activeTab, setActiveTab] = useState('intro');
            const [activeBudgetTab, setActiveBudgetTab] = useState('home');
            const [isLoaded, setIsLoaded] = useState(false);
            const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
                if (typeof window === "undefined") return true;
                return window.innerWidth >= 1024;
            });
            const completedSectionsRef = useRef(new Set());

            // 1. Auto-Load Data
            useEffect(() => {
                const saved = localStorage.getItem('calmModule2Data');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        // Merge parsed with default to ensure no missing keys crash the app
                        setFormData((prev) => ({
                            ...prev,
                            ...parsed,
                            purchases: Array.isArray(parsed.purchases) ? parsed.purchases : prev.purchases,
                            commSkills: Array.isArray(parsed.commSkills) ? parsed.commSkills : prev.commSkills,
                            budget: { ...prev.budget, ...(parsed.budget || {}) },
                            budgetScenarios: {
                                ...prev.budgetScenarios,
                                ...Object.fromEntries(
                                    Object.keys(BUDGET_SCENARIOS).map((scenarioKey) => [
                                        scenarioKey,
                                        {
                                            ...prev.budgetScenarios[scenarioKey],
                                            ...(parsed.budgetScenarios?.[scenarioKey] || {}),
                                            income: {
                                                ...prev.budgetScenarios[scenarioKey].income,
                                                ...(parsed.budgetScenarios?.[scenarioKey]?.income || {})
                                            },
                                            fixed: {
                                                ...prev.budgetScenarios[scenarioKey].fixed,
                                                ...(parsed.budgetScenarios?.[scenarioKey]?.fixed || {})
                                            },
                                            variable: {
                                                ...prev.budgetScenarios[scenarioKey].variable,
                                                ...(parsed.budgetScenarios?.[scenarioKey]?.variable || {})
                                            }
                                        }
                                    ])
                                )
                            }
                        }));
                    } catch (e) {
                        console.error("Failed to parse saved data", e);
                    }
                }
                setIsLoaded(true);
            }, []);

            // 2. Auto-Save Data
            useEffect(() => {
                if (isLoaded) {
                    localStorage.setItem('calmModule2Data', JSON.stringify(formData));
                }
            }, [formData, isLoaded]);

            // Helper to update specific fields easily
            const updateField = (key, value) => {
                setFormData(prev => ({ ...prev, [key]: value }));
            };

            const updateNested = (parent, indexOrKey, keyOrValue, value) => {
                setFormData(prev => {
                    const newParent = Array.isArray(prev[parent]) ? [...prev[parent]] : { ...prev[parent] };
                    if (Array.isArray(newParent)) {
                        newParent[indexOrKey] = { ...newParent[indexOrKey], [keyOrValue]: value };
                    } else {
                        newParent[indexOrKey] = keyOrValue; // obj[key] = value
                    }
                    return { ...prev, [parent]: newParent };
                });
            };

            const updateBudgetField = (group, key, value) => {
                setFormData((prev) => {
                    const currentScenario = getBudgetScenarioState(prev, activeBudgetTab);
                    return {
                        ...prev,
                        budgetScenarios: {
                            ...prev.budgetScenarios,
                            [activeBudgetTab]: {
                                ...currentScenario,
                                [group]: {
                                    ...currentScenario[group],
                                    [key]: value
                                }
                            }
                        }
                    };
                });
            };

            const triggerBudgetCurveball = () => {
                const event = BUDGET_CURVEBALLS[Math.floor(Math.random() * BUDGET_CURVEBALLS.length)];
                updateField("budgetLifeEvent", event);
                confetti({ particleCount: 40, spread: 70, colors: ['#8b5cf6', '#f59e0b', '#ef4444'] });
            };

            const handleAdAnalyzerGuess = (guess) => {
                const currentAd = AD_SCENARIOS[formData.adAnalyzerIndex];
                if (!currentAd || formData.adAnalyzerScore >= AD_SCENARIOS.length) return;

                if (guess === currentAd.tactic) {
                    updateField("adAnalyzerScore", Math.max(formData.adAnalyzerScore, formData.adAnalyzerIndex + 1));
                    updateField("adAnalyzerFeedback", `Correct! ${currentAd.hint}`);
                    if (formData.adAnalyzerIndex < AD_SCENARIOS.length - 1) {
                        window.setTimeout(() => {
                            setFormData((prev) => ({
                                ...prev,
                                adAnalyzerIndex: prev.adAnalyzerIndex + 1,
                                adAnalyzerFeedback: ""
                            }));
                        }, 1600);
                    } else {
                        confetti({ particleCount: 70, spread: 75, colors: ['#6366f1', '#22c55e', '#f59e0b'] });
                    }
                } else {
                    updateField("adAnalyzerFeedback", "Not quite. Try again!");
                }
            };

            const activeBudgetScenario = getBudgetScenarioState(formData, activeBudgetTab);
            const currentBudgetTotals = getBudgetTotalsForState(formData, activeBudgetTab);

            // Calculate Progress 
            const calcProgress = (sectionId) => {
                const fd = formData;
                let fields = [];
                switch(sectionId) {
                    case 'intro': fields = ['complete']; break;
                    case 'advertising': 
                        fields = [
                            fd.defMarketing,
                            fd.defPackaging,
                            fd.influenceExample,
                            fd.favoriteStore,
                            fd.biggestInfluence,
                            fd.adDeconstruction,
                            fd.adAnalyzerScore === AD_SCENARIOS.length ? "complete" : ""
                        ];
                        fd.purchases.forEach(p => { fields.push(p.item, p.influence) });
                        break;
                    case 'waiting': fields = [fd.joeDecision, fd.sallyDecision, fd.betterDecision]; break;
                    case 'money': 
                        fields = [
                            fd.purchaseReflection,
                            fd.budgetChoice,
                            ...collectProgressValues(fd.budgetScenarios)
                        ];
                        break; 
                    case 'honesty': fields = [fd.honestyNorma, fd.honestyGertrude, fd.honestyHerman, fd.honestyAsif, fd.honestyFrank, fd.honestyCharlotte, fd.honestySalima, fd.honestyImportant, fd.honestyAcceptable, fd.honestyEasiest, fd.honestyHardest, fd.honestyReflection1, fd.honestyReflection2]; break;
                    case 'maintaining': 
                        fields = [fd.defConflict, fd.conflictAbout, fd.conflictResolve, fd.conflictEffective];
                        fd.commSkills.forEach(s => fields.push(s.good));
                        break;
                    case 'sum_cases': 
                        fields = [fd.caseJonCraig1, fd.caseJonCraig2, fd.caseJonCraig3, fd.caseAmandaJoanne1, fd.caseAmandaJoanne2, fd.caseAmandaJoanne3, fd.caseMayaLeticia1, fd.caseMayaLeticia2, fd.caseMayaLeticia3];
                        break;
                    default: return { completed: 0, total: 1, isDone: false };
                }
                
                const total = fields.length;
                const completed = fields.filter(f => {
                    if (typeof f === 'string') return f.trim().length > 0;
                    if (f === null || f === undefined) return false;
                    return true;
                }).length;

                const isDone = total > 0 && completed === total;
                return { completed, total, isDone };
            };

            // Confetti effect when a section becomes fully done
            useEffect(() => {
                SECTIONS.forEach(sec => {
                    if (sec.id === 'finish') return;
                    const { isDone } = calcProgress(sec.id);
                    if (isDone && !completedSectionsRef.current.has(sec.id)) {
                        completedSectionsRef.current.add(sec.id);
                        fireConfettiEdges();
                    } else if (!isDone && completedSectionsRef.current.has(sec.id)) {
                        completedSectionsRef.current.delete(sec.id);
                    }
                });
            }, [formData]);

            const fireConfettiEdges = () => {
                const duration = 2 * 1000;
                const end = Date.now() + duration;
                (function frame() {
                    confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#8b5cf6', '#a78bfa', '#fcd34d'] });
                    confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#8b5cf6', '#a78bfa', '#fcd34d'] });
                    if (Date.now() < end) requestAnimationFrame(frame);
                }());
            };

            const generateTeacherExport = () => {
                const answeredCount = collectTeacherReportValues(formData).filter(hasTeacherReportValue).length;
                if (answeredCount === 0) {
                    window.alert("There is nothing to print yet. Add some responses first.");
                    return;
                }

                const completedSections = SECTIONS.filter((section) => section.id !== "finish" && calcProgress(section.id).isDone).length;
                const responseCount = collectTeacherReportValues(DEFAULT_STATE).length;
                const reportHtml = buildCalmModule2TeacherReport(formData, {
                    completedSections,
                    answeredCount,
                    responseCount
                });
                const printWindow = window.open("", "_blank");

                if (!printWindow) {
                    window.alert("Print preview was blocked. Allow pop-ups for this site and try again.");
                    return;
                }

                printWindow.document.open();
                printWindow.document.write(reportHtml);
                printWindow.document.close();
                window.setTimeout(() => {
                    printWindow.focus();
                    printWindow.print();
                }, 250);
            };

            const nextTab = () => {
                const idx = SECTIONS.findIndex(s => s.id === activeTab);
                if (idx < SECTIONS.length - 1) {
                    setActiveTab(SECTIONS[idx + 1].id);
                    window.scrollTo(0, 0);
                }
            };

            const selectTab = (tabId) => {
                setActiveTab(tabId);
                if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                }
                window.scrollTo(0, 0);
            };

            if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading your workbook...</div>;

            return (
                <div className="flex min-h-screen bg-slate-50">
                    {isSidebarOpen && (
                        <button
                            type="button"
                            className="fixed inset-0 z-20 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
                            aria-label="Close navigation menu"
                            onClick={() => setIsSidebarOpen(false)}
                        />
                    )}
                    
                    {/* SIDEBAR NAVIGATION */}
                    <div className={`fixed inset-y-0 left-0 z-30 flex w-72 max-w-[88vw] shrink-0 flex-col border-r-2 border-slate-100 bg-white p-6 shadow-[4px_0_24px_rgba(0,0,0,0.08)] transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:max-w-none lg:shadow-[4px_0_24px_rgba(0,0,0,0.02)] ${isSidebarOpen ? 'translate-x-0 lg:w-72 lg:min-w-[18rem]' : '-translate-x-full lg:w-20 lg:min-w-[5rem] lg:translate-x-0 lg:p-3'}`}>
                        {!isSidebarOpen && (
                            <div className="hidden lg:flex h-full w-full flex-col items-center pt-3">
                                <button
                                    type="button"
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100"
                                    aria-label="Open navigation sidebar"
                                    aria-expanded={false}
                                    onClick={() => setIsSidebarOpen(true)}
                                >
                                    <i className="fa-solid fa-bars text-base"></i>
                                </button>
                            </div>
                        )}
                        <div className={`flex h-full flex-col ${isSidebarOpen ? 'opacity-100' : 'hidden lg:hidden'} transition-opacity duration-200`}>
                        <div className="mb-8 flex items-start justify-between gap-4">
                            <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-tight">CALM <span className="text-violet-500">Module 2</span></h1>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100"
                                    aria-label="Collapse navigation sidebar"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <i className="fa-solid fa-bars text-base"></i>
                                </button>
                                <button
                                    type="button"
                                    className="lg:hidden inline-flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-slate-200 bg-slate-50 text-slate-500 transition-all hover:bg-slate-100"
                                    aria-label="Close navigation menu"
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-semibold mt-1 mb-8">Resource Choices</p>
                        
                        <nav className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {SECTIONS.map(sec => {
                                const { completed, total, isDone } = calcProgress(sec.id);
                                const isActive = activeTab === sec.id;
                                return (
                                    <button 
                                        key={sec.id}
                                        onClick={() => selectTab(sec.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${isActive ? 'bg-violet-500 text-white shadow-[0_4px_0_0_#5b21b6] font-bold' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 font-medium border-2 border-transparent'}`}
                                        style={isActive ? { transform: 'translateY(-2px)' } : {}}
                                    >
                                        <div className="flex items-center gap-3">
                                            <i className={`fa-solid ${sec.icon} ${isActive ? 'text-violet-200' : 'text-slate-400'}`}></i>
                                            <span className="text-sm text-left">{sec.title}</span>
                                        </div>
                                        {sec.id !== 'finish' && (
                                            <div className={`text-xs px-2 py-1 rounded-full font-bold ${isActive ? 'bg-violet-600 text-white' : (isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500')}`}>
                                                {isDone ? <i className="fa-solid fa-check"></i> : `${completed}/${total}`}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                        
                        <div className="mt-6 pt-6 border-t-2 border-slate-100">
                            <div className="text-xs text-slate-400 font-bold mb-2 uppercase tracking-wider">Progress Saved Automatically</div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-400 transition-all duration-500" style={{ width: `${(SECTIONS.filter(s => s.id!=='finish' && calcProgress(s.id).isDone).length / (SECTIONS.length-1)) * 100}%` }}></div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto relative min-w-0">
                        <div className="sticky top-0 z-10 border-b border-slate-200/80 bg-slate-50/95 px-4 py-3 backdrop-blur md:px-6 lg:px-8">
                            <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[0.7rem] font-black uppercase tracking-[0.22em] text-violet-500">CALM Module 2</div>
                                    <div className="truncate text-sm font-semibold text-slate-500">Resource Choices</div>
                                </div>
                                <button
                                    type="button"
                                    className="inline-flex lg:hidden items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-[0_4px_0_0_#e2e8f0] transition-all active:translate-y-[4px] active:shadow-none"
                                    aria-label={isSidebarOpen ? "Collapse navigation sidebar" : "Open navigation sidebar"}
                                    aria-expanded={isSidebarOpen}
                                    onClick={() => setIsSidebarOpen((prev) => !prev)}
                                >
                                    <i className={`fa-solid ${isSidebarOpen ? 'fa-panel-left' : 'fa-bars'}`}></i>
                                    <span className="hidden sm:inline">{isSidebarOpen ? 'Collapse menu' : 'Open menu'}</span>
                                </button>
                            </div>
                        </div>
                    <div className="p-4 md:p-8 lg:p-12 bg-slate-50 relative">
                        <div className="max-w-4xl mx-auto space-y-8 pb-32">
                            
                            {/* TAB: INTRO */}
                            {activeTab === 'intro' && (
                                <div className="clay-card p-8 md:p-12 animate-[fadeIn_0.3s_ease-out]">
                                    <div className="text-center mb-10">
                                        <div className="inline-block p-4 bg-violet-100 rounded-3xl mb-4">
                                            <i className="fa-solid fa-rocket text-4xl text-violet-500"></i>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-800 tracking-tight mb-4">Welcome to Module 2!</h2>
                                        <p className="text-lg text-slate-500 font-medium">Let's explore resource choices, money management, and healthy relationships.</p>
                                    </div>
                                    
                                    <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100">
                                        <p className="text-sm font-bold text-slate-700">Your progress saves automatically while you work. No student name is collected.</p>
                                    </div>
                                </div>
                            )}

                            {/* TAB: ADVERTISING */}
                            {activeTab === 'advertising' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6 text-slate-800">Who Decides What You Buy?</h2>
                                    
                                    <div className="clay-card p-8 space-y-6">
                                        <div>
                                            <label className="block font-bold mb-2">Using a dictionary, define the term <span className="text-violet-500">Marketing</span>:</label>
                                            <AutoExpandingTextarea value={formData.defMarketing} onChange={e => updateField('defMarketing', e.target.value)} placeholder="Marketing is..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">Using a dictionary, define the term <span className="text-violet-500">Packaging</span>:</label>
                                            <AutoExpandingTextarea value={formData.defPackaging} onChange={e => updateField('defPackaging', e.target.value)} placeholder="Packaging is..." />
                                        </div>
                                    </div>

                                    <KnowledgeDrop title="Influences in Marketing" defaultOpen={true}>
                                        <div className="space-y-4 text-sm">
                                            <p><strong>1. Significant Others:</strong> People who matter to us influence our opinions and buying decisions. Our families demonstrate "what to buy" from childhood. Friends and peer groups influence us to buy "trendy" items.</p>
                                            <p><strong>2. Habit:</strong> Consumers tend to buy what they have purchased in the past that was satisfactory. People are creatures of habit.</p>
                                            <p><strong>3. Changes in Lifestyle:</strong> A new job, moving away, or changes in money/time available affects purchases.</p>
                                            <p><strong>4. Personal Expectations:</strong> Changes in age, becoming a better consumer, negative past experiences, or conscious decisions (e.g., environmental protection).</p>
                                        </div>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-6 mt-6">
                                        <div>
                                            <label className="block font-bold mb-2">How might friends or family influence what you spend your money on? List and explain one example from your own life.</label>
                                            <AutoExpandingTextarea value={formData.influenceExample} onChange={e => updateField('influenceExample', e.target.value)} placeholder="An example from my life..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">What is your favorite store/brand name to buy? Why?</label>
                                            <AutoExpandingTextarea value={formData.favoriteStore} onChange={e => updateField('favoriteStore', e.target.value)} placeholder="My favorite store/brand is..." />
                                        </div>
                                    </div>

                                    <div className="clay-card p-8 space-y-6 mt-6">
                                        <h3 className="font-black text-xl mb-4">Your Recent Purchases</h3>
                                        <p className="text-slate-500 text-sm mb-4">List up to 10 things you have purchased recently and what influenced you to buy them (e.g., needed it, saw an ad, friend had one).</p>
                                        
                                        <div className="space-y-3">
                                            {formData.purchases.map((p, i) => (
                                                <div key={i} className="flex flex-col md:flex-row gap-3">
                                                    <input 
                                                        type="text" 
                                                        className="clay-input flex-1 p-3" 
                                                        placeholder={`Item ${i+1}`}
                                                        value={p.item}
                                                        onChange={e => {
                                                            const newPurchases = [...formData.purchases];
                                                            newPurchases[i].item = e.target.value;
                                                            updateField('purchases', newPurchases);
                                                        }}
                                                    />
                                                    <input 
                                                        type="text" 
                                                        className="clay-input flex-1 p-3" 
                                                        placeholder="Influence / Reason"
                                                        value={p.influence}
                                                        onChange={e => {
                                                            const newPurchases = [...formData.purchases];
                                                            newPurchases[i].influence = e.target.value;
                                                            updateField('purchases', newPurchases);
                                                        }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="mt-6">
                                            <label className="block font-bold mb-2 text-violet-600">Looking at your list, what has been the BIGGEST influence on what you have purchased?</label>
                                            <AutoExpandingTextarea value={formData.biggestInfluence} onChange={e => updateField('biggestInfluence', e.target.value)} placeholder="The biggest influence seems to be..." />
                                        </div>
                                    </div>

                                    <div className="flex flex-col xl:flex-row gap-6 mt-8">
                                        <div className="xl:w-1/2">
                                            <div className="clay-card p-8 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                                                <h2 className="text-2xl font-black text-indigo-900 mb-4"><i className="fa-solid fa-brain mr-2 text-indigo-500"></i> Learn: Advertising Tactics</h2>
                                                <div className="space-y-3 text-sm text-slate-700">
                                                    <p>The Canadian Code of Advertising Standards says ads must be honest, but companies still use psychology to manipulate your "wants" into feeling like "needs."</p>
                                                    <ul className="space-y-2 mt-4">
                                                        <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Bandwagon:</strong> "Everyone else is doing it/buying it!"</li>
                                                        <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Emotional Appeal:</strong> Targets fear, loneliness, or desire for happiness.</li>
                                                        <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Testimonials/Influencers:</strong> Using celebrities or "experts" to build fake trust.</li>
                                                        <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Facts & Figures:</strong> Using statistics to sound scientific, even when they are misleading.</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="xl:w-1/2">
                                            <div className="clay-card p-8">
                                                <h2 className="text-2xl font-black text-slate-800 mb-2"><i className="fa-solid fa-magnifying-glass mr-2 text-indigo-500"></i> Apply: Ad Analyzer</h2>
                                                <p className="text-sm text-slate-500 mb-6">Read the fake ad below. Which tactic is the company using to manipulate you?</p>
                                                
                                                {formData.adAnalyzerScore < AD_SCENARIOS.length ? (
                                                    <div className="p-6 bg-slate-800 text-white rounded-2xl text-center shadow-lg relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 uppercase tracking-widest rounded-br-xl">Ad {formData.adAnalyzerIndex + 1} of {AD_SCENARIOS.length}</div>
                                                        <h3 className="font-black text-xl mt-4 mb-2 text-indigo-300">{AD_SCENARIOS[formData.adAnalyzerIndex].product}</h3>
                                                        <p className="italic text-lg mb-6">"{AD_SCENARIOS[formData.adAnalyzerIndex].ad}"</p>
                                                        
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                            {AD_TACTICS.map((tactic) => (
                                                                <button
                                                                    key={tactic}
                                                                    type="button"
                                                                    onClick={() => handleAdAnalyzerGuess(tactic)}
                                                                    className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl font-bold transition-colors text-sm"
                                                                >
                                                                    {tactic}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {formData.adAnalyzerFeedback && (
                                                            <p className={`mt-4 font-bold ${formData.adAnalyzerFeedback.includes('Correct') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {formData.adAnalyzerFeedback}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-8 bg-emerald-50 text-emerald-800 rounded-2xl border-2 border-emerald-200">
                                                        <i className="fa-solid fa-shield-halved text-4xl mb-2"></i>
                                                        <h3 className="font-black">Immunity Unlocked!</h3>
                                                        <p className="text-sm">You successfully identified all {AD_SCENARIOS.length} major advertising tactics.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 bg-amber-50 border-2 border-amber-200 p-4 rounded-xl">
                                        <label className="block text-sm font-black text-amber-900 mb-2"><i className="fa-solid fa-pen-to-square mr-2 text-violet-600"></i> Teacher Checkpoint: Deconstruct a Real Brand. Pick a brand you like. What physical product do they sell, and what emotion or idea are they actually selling you?</label>
                                        <textarea
                                            className="w-full border-2 border-amber-100 rounded-xl py-3 px-4 focus:outline-none focus:border-amber-400 min-h-[120px] text-sm"
                                            placeholder="Type your reflection here..."
                                            value={formData.adDeconstruction}
                                            onChange={(e) => updateField('adDeconstruction', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: WAITING */}
                            {activeTab === 'waiting' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6">What are you Waiting For?</h2>
                                    
                                    <KnowledgeDrop title="The Price of Cool: Joe vs. Sally">
                                        <div className="space-y-4 text-sm">
                                            <p><strong>Joe</strong><br/>
                                            Joe gets a job as a clerk at Wal-Mart. He’s living a home and saving every last dollar so he can make the $2,000 down payment on a $20,000 Camaro which the racing scoop on the hood. He takes out a car loan for the remaining $18,000. His parents had to sign for the loan, but Joe is making the payments. It’s a five year loan at 11.67 percent interest, so he sends $400 to the finance company every month. He cringes the first time he seals the envelope, kisses $400 goodbye, but he forgets all about that when he’s driving around in the Camaro and his friends are telling him what a cool car it is.</p>
                                            
                                            <p>A few months later, there are scratches on the door and stains on the carpet and nobody is oohing and aahing when the Camaro pulls into the parking lot. It’s just another car by then, but Joe is stuck with the payments. To be able to afford the car and a date to ride in the car, he works extra night shifts, which means he’s too busy to catch many dates.</p>
                                            
                                            <p>At the end of five years, he’s sick of the Camaro, which lost its cool a long time ago. He has finally paid off the car loan, which cost him an extra $6,000 in interest charges. Now between the loan and the original purchase price, Joe has invested $26,000 in this car, not including taxes and fees, insurance premiums, gas, oil, and maintenance.</p>
                                            
                                            <p>At this point, the Camaro has dents and stains and the engine sounds a bit rough. If he sold the thing he could get maybe $5,000 for it. So what he’s got to show for his $26,000 investment is a $5,000 care that he doesn’t even want any more.</p>

                                            <div className="h-px w-full bg-amber-200 my-4"></div>
                                            
                                            <p><strong>Sally</strong><br/>
                                            Sally also lives at home and works at the Wal-Mart checkout line a few feet away from Joe, but she didn’t buy a cool car. She took the $2,000 she’d saved up and bought a used Ford Escort. Since Sally paid cash, she didn’t have car payments. So instead of spending $400 a month to the finance company, she invested $400 a month in a mutual fund for stocks.</p>
                                            
                                            <p>Five years later, when Joe was mailing out his last car payment, the value of Sally’s mutual fund has doubled, Between the doubling of the fund itself and the steady stream of $400 contributions to the fund, Sally has an asset of nearly $30,000. She also has the Escort, which gets her back and forth OK, and she never worries about dents and stains because she never thought of her car as an investment. It’s only transportation.</p>
                                        </div>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-8">
                                        <div>
                                            <label className="block font-bold mb-2 text-lg">Why do you think Joe bought a new Camaro? Explain your thinking.</label>
                                            <AutoExpandingTextarea value={formData.joeDecision} onChange={e => updateField('joeDecision', e.target.value)} placeholder="Joe likely bought the car because..." />
                                            <HintToggle hint="Think about social status, the desire to impress friends, and the allure of instant gratification." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-lg">Why do you think Sally bought a used Escort? Explain your thinking.</label>
                                            <AutoExpandingTextarea value={formData.sallyDecision} onChange={e => updateField('sallyDecision', e.target.value)} placeholder="Sally probably bought the used car because..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-lg">Who do you think made the better decision? Explain your thinking.</label>
                                            <AutoExpandingTextarea value={formData.betterDecision} onChange={e => updateField('betterDecision', e.target.value)} placeholder="I think [Joe/Sally] made the better decision because..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: MANAGING MONEY */}
                            {activeTab === 'money' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6">Managing Your Money</h2>
                                    
                                    <p className="text-gray-700 mb-6 font-medium text-lg">
                                        Think about something significant you or a family member purchased. Review the checklist below to determine if enough research was done, then complete the reflection.
                                    </p>

                                    <KnowledgeDrop title="Smart Buyer Checklist">
                                        <div className="space-y-4 text-sm text-gray-800">
                                            <div>
                                                <strong className="text-amber-800">1. Ask yourself before buying:</strong>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    <li>Do you really need this? Could it be rented, borrowed, or substituted with something you already have?</li>
                                                    <li>Can you afford it? Will there be any other hidden costs with this purchase?</li>
                                                    <li>Did you read reviews and gather information to ensure it's the best price for the quality?</li>
                                                    <li>Can you return it if needed?</li>
                                                </ul>
                                            </div>
                                            
                                            <div>
                                                <strong className="text-amber-800">2. Understand advertising and labeling:</strong>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    <li>Did you confirm the item is actually being sold for the advertised price and conditions?</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <strong className="text-amber-800">3. Ask questions and get answers:</strong>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    <li>Did you talk to salespeople and ask questions?</li>
                                                    <li>If the article isn't being sold in a store, did you get the seller's "promises" in writing?</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <strong className="text-amber-800">4. Shop wisely:</strong>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    <li>Did you comparison shop, check prices month-to-month, or watch for advertisements of sales?</li>
                                                    <li>Did you shop out-of-season (e.g., buying winter clothing sales at the end of the season)?</li>
                                                </ul>
                                            </div>

                                            <div>
                                                <strong className="text-amber-800">5. Know the return, exchange, and refund policy:</strong>
                                                <ul className="list-disc pl-5 mt-1 space-y-1">
                                                    <li>Do they require a receipt? Must the item be in "store-bought" condition?</li>
                                                    <li>Are sale items final sale? Do they only offer "in-store credit" for returns?</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-6 mt-6">
                                        <h3 className="font-black text-xl mb-4">Reflecting on a Purchase</h3>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
                                                Reflecting: Do you think you did enough research into your purchase? Why or why not?
                                            </label>
                                            <AutoExpandingTextarea 
                                                value={formData.purchaseReflection} 
                                                onChange={(e) => updateField('purchaseReflection', e.target.value)} 
                                                placeholder="Consider the checklist above in your answer..."
                                            />
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-slate-200 my-10"></div>

                                    <KnowledgeDrop title="Net Pay and Deductions" defaultOpen={false}>
                                        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
                                            <div className="flex-1 text-sm text-amber-900 space-y-2">
                                                <p>Before you build a budget, think about your <strong>net pay</strong>, not just the hourly wage or salary someone offers you.</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li><strong>Gross pay</strong> is the full amount you earn before deductions.</li>
                                                    <li><strong>Net pay</strong> is the money you actually get to use after deductions.</li>
                                                    <li>Taxes, CPP, EI, and other deductions mean your real spending money is always lower than your gross wage.</li>
                                                </ul>
                                                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Budget with the money that really lands in your account.</p>
                                            </div>
                                            <div className="bg-white rounded-2xl border border-amber-200 p-5 w-full lg:w-80 shadow-sm">
                                                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sample Paycheque</p>
                                                <div className="mt-3 space-y-2">
                                                    <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                                                        <span>Gross Pay</span>
                                                        <span className="line-through">$2,000</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm font-semibold text-rose-500">
                                                        <span>Deductions</span>
                                                        <span>-$300</span>
                                                    </div>
                                                    <div className="h-px bg-slate-100 my-3"></div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-black text-slate-800">Net Pay</span>
                                                        <span className="font-black text-2xl text-violet-600">$1,700</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </KnowledgeDrop>

                                    <div className="flex items-center gap-3 mb-6 mt-8">
                                        <div className="bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-full text-sm tracking-wider uppercase">Task</div>
                                        <h3 className="text-2xl font-black">Budget Builder Assignment</h3>
                                    </div>

                                    <div className="clay-card p-8 space-y-8 mb-8">
                                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 pb-6 border-b-2 border-slate-100">
                                            <div>
                                                <h3 className="font-black text-3xl text-slate-800 flex items-center gap-3">
                                                    <span className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-500 flex items-center justify-center text-2xl">
                                                        <i className="fa-solid fa-wallet"></i>
                                                    </span>
                                                    The Budget Builder
                                                </h3>
                                                <p className="text-slate-500 font-semibold mt-3">
                                                    Fill out all three scenarios to compare how your living situation changes your money.
                                                </p>
                                            </div>

                                            <button
                                                onClick={triggerBudgetCurveball}
                                                className="clay-btn py-3 px-5 text-sm flex items-center gap-2 self-start lg:self-auto"
                                            >
                                                <i className="fa-solid fa-bolt"></i> Draw Life Curveball
                                            </button>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-3">
                                            {Object.entries(BUDGET_SCENARIOS).map(([scenarioKey, scenarioMeta]) => (
                                                <button
                                                    key={scenarioKey}
                                                    onClick={() => setActiveBudgetTab(scenarioKey)}
                                                    className={`flex-1 rounded-2xl px-5 py-4 border-2 text-left transition-all ${
                                                        activeBudgetTab === scenarioKey
                                                            ? 'bg-violet-500 text-white border-violet-600 shadow-[0_6px_0_0_#5b21b6] -translate-y-1'
                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <i className={`fa-solid ${scenarioMeta.icon} text-xl ${activeBudgetTab === scenarioKey ? 'text-violet-200' : 'text-slate-400'}`}></i>
                                                        <div>
                                                            <div className="font-black">{scenarioMeta.title}</div>
                                                            <div className={`text-xs font-semibold ${activeBudgetTab === scenarioKey ? 'text-violet-100' : 'text-slate-400'}`}>{scenarioMeta.subtitle}</div>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="bg-slate-50 border-2 border-slate-200 rounded-[2rem] p-6 md:p-7">
                                            <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 md:p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-4 md:items-center">
                                                <div className="w-16 h-16 rounded-3xl bg-violet-100 text-violet-500 flex items-center justify-center text-3xl shrink-0">
                                                    <i className={`fa-solid ${BUDGET_SCENARIOS[activeBudgetTab].icon}`}></i>
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-2xl text-slate-800">
                                                        {BUDGET_SCENARIOS[activeBudgetTab].title} <span className="text-slate-400 text-lg">{BUDGET_SCENARIOS[activeBudgetTab].subtitle}</span>
                                                    </h4>
                                                    <p className="text-slate-600 font-medium mt-2">{BUDGET_SCENARIOS[activeBudgetTab].desc}</p>
                                                    <div className="inline-flex items-center gap-2 mt-3 text-xs font-black uppercase tracking-wide bg-amber-100 text-amber-800 px-3 py-2 rounded-full">
                                                        <i className="fa-solid fa-lightbulb"></i>
                                                        {BUDGET_SCENARIOS[activeBudgetTab].tips}
                                                    </div>
                                                </div>
                                            </div>

                                            {formData.budgetLifeEvent && (
                                                <div className={`mb-6 rounded-2xl border-2 p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
                                                    formData.budgetLifeEvent.type === 'expense'
                                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                                        : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                                }`}>
                                                    <div className="font-bold">
                                                        <i className={`fa-solid ${formData.budgetLifeEvent.type === 'expense' ? 'fa-triangle-exclamation' : 'fa-circle-plus'} mr-2`}></i>
                                                        Curveball: {formData.budgetLifeEvent.desc}
                                                    </div>
                                                    <div className="font-black text-2xl">
                                                        {formData.budgetLifeEvent.type === 'expense' ? '-' : '+'}${formatMoney(formData.budgetLifeEvent.amount)}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid xl:grid-cols-3 gap-5">
                                                {Object.entries(BUDGET_FIELD_GROUPS).map(([groupKey, fields]) => {
                                                    const panelStyle = BUDGET_PANEL_STYLES[groupKey];
                                                    const totalValue =
                                                        groupKey === 'income'
                                                            ? currentBudgetTotals.income
                                                            : groupKey === 'fixed'
                                                                ? currentBudgetTotals.fixed
                                                                : currentBudgetTotals.variable;
                                                    const title =
                                                        groupKey === 'income'
                                                            ? '1. Monthly Income'
                                                            : groupKey === 'fixed'
                                                                ? '2. Fixed Expenses'
                                                                : '3. Variable Expenses';

                                                    return (
                                                        <div key={groupKey} className={`rounded-[1.75rem] border p-5 shadow-inner ${panelStyle.wrapper}`}>
                                                            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-white/70">
                                                                <h5 className={`font-black uppercase tracking-wide text-sm ${panelStyle.heading}`}>{title}</h5>
                                                                <span className={`text-xs font-black px-3 py-2 rounded-full ${panelStyle.badge}`}>${formatMoney(totalValue)}</span>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {fields.map((field) => (
                                                                    <div key={field.key} className="space-y-2">
                                                                        <label className="block text-sm font-bold text-slate-600">{field.label}</label>
                                                                        <div className="relative">
                                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 font-black">$</span>
                                                                            <input
                                                                                type="number"
                                                                                className="clay-input w-full p-3 pl-9 text-slate-700 font-semibold"
                                                                                placeholder={field.placeholder}
                                                                                value={activeBudgetScenario[groupKey][field.key]}
                                                                                onChange={e => updateBudgetField(groupKey, field.key, e.target.value)}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className={`mt-6 rounded-[1.5rem] px-5 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                                                currentBudgetTotals.net >= 0 ? 'bg-slate-800 text-white' : 'bg-rose-600 text-white'
                                            }`}>
                                                <div>
                                                    <h4 className="font-black text-2xl">Active Scenario Bottom Line</h4>
                                                    <p className={`text-sm font-medium mt-1 ${currentBudgetTotals.net >= 0 ? 'text-slate-300' : 'text-rose-100'}`}>
                                                        Income (${formatMoney(currentBudgetTotals.income)}) - Expenses (${formatMoney(currentBudgetTotals.expenses)})
                                                    </p>
                                                </div>
                                                <div className="text-left md:text-right">
                                                    <div className="text-4xl font-black">${formatMoney(currentBudgetTotals.net)}</div>
                                                    {currentBudgetTotals.net < 0 && (
                                                        <div className="text-xs font-black uppercase tracking-[0.2em] text-rose-100 mt-1">You are in debt</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <i className="fa-solid fa-scale-balanced text-2xl text-violet-500"></i>
                                                <h4 className="font-black text-2xl text-slate-800">Side-by-Side Comparison</h4>
                                            </div>

                                            <div className="grid md:grid-cols-3 gap-4">
                                                {Object.entries(BUDGET_SCENARIOS).map(([scenarioKey, scenarioMeta]) => {
                                                    const totals = getBudgetTotalsForState(formData, scenarioKey);
                                                    return (
                                                        <div
                                                            key={scenarioKey}
                                                            className={`rounded-[1.5rem] border-2 p-5 ${
                                                                activeBudgetTab === scenarioKey
                                                                    ? 'border-violet-300 bg-violet-50'
                                                                    : 'border-slate-200 bg-white'
                                                            }`}
                                                        >
                                                            <div className="flex items-center gap-3 mb-4">
                                                                <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                                                                    <i className={`fa-solid ${scenarioMeta.icon}`}></i>
                                                                </div>
                                                                <div>
                                                                    <div className="font-black text-slate-800">{scenarioMeta.title}</div>
                                                                    <div className="text-xs font-semibold text-slate-400">{scenarioMeta.subtitle}</div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2 text-sm font-semibold text-slate-600 border-b border-slate-100 pb-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span>Income</span>
                                                                    <span className="text-violet-600">${formatMoney(totals.income)}</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span>Expenses</span>
                                                                    <span className="text-rose-500">${formatMoney(totals.expenses)}</span>
                                                                </div>
                                                            </div>

                                                            <div className={`mt-4 text-center text-2xl font-black ${totals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                Net ${formatMoney(totals.net)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="clay-card p-8 space-y-4">
                                        <h3 className="font-black text-2xl text-slate-800">Budget Choice Justification</h3>
                                        <p className="text-slate-500 font-medium">
                                            Looking at the three scenarios above, which one is most realistic for you right out of high school? What major sacrifice would you have to make to stay out of debt?
                                        </p>
                                        <AutoExpandingTextarea
                                            value={formData.budgetChoice}
                                            onChange={e => updateField('budgetChoice', e.target.value)}
                                            placeholder="The most realistic option for me is... One sacrifice I would have to make is..."
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: HONESTY */}
                            {activeTab === 'honesty' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6">Relationships & Honesty</h2>

                                    <KnowledgeDrop title="Healthy Relationships">
                                        <p className="mb-2">People in healthy relationships:</p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm">
                                            <li>Listen and take feelings seriously</li>
                                            <li>Talk openly and honestly</li>
                                            <li>Never use threats of harm/violence/suicide</li>
                                            <li>Never strike out in anger</li>
                                            <li>Do not try to control where you go</li>
                                            <li>Respect you and say good things about you</li>
                                            <li>Enjoy spending time with you</li>
                                            <li>Trust you and keep confidences</li>
                                            <li>Allow you to enjoy activities</li>
                                            <li>Accept sexual limits, every time</li>
                                        </ul>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-8">
                                        <div className="flex items-center gap-3 mb-6 pb-6 border-b-2 border-slate-100">
                                            <i className="fa-solid fa-scale-balanced text-3xl text-violet-500"></i>
                                            <h3 className="font-black text-2xl">Honesty Quiz</h3>
                                        </div>
                                        <p className="font-bold text-slate-500">For each of the following situations, answer whether or not the individual is justified in their actions. Question: Yes or No? Explain.</p>

                                        <div className="space-y-6">
                                            {[
                                                { key: 'honestyNorma', text: "Norma sees a wealthy person drop money while exiting a limousine. On the ground she finds $100. Norma is low on rent money and finds it hard to make ends meet. Norma knows she needs the money more than the person who dropped it. Is she justified in keeping the money?" },
                                                { key: 'honestyGertrude', text: "Gertrude sees her friend Ethyl tagging the wall with a homophobic slur. Ethyl sees Gertrude but no one else witnesses this happening. Later that day the principal asks anyone with information to come forward. Is Gertrude justified in not reporting this?" },
                                                { key: 'honestyHerman', text: "Herman's best friend Ollie has a new girlfriend, Krystaal. Herman has overheard Krystaal say mean things to her friends about Ollie. Ollie asks Herman what he thinks of her, and Herman says she is 'nice.' Herman knows that Ollie is head over heels for his girlfriend and doesn't want to hurt Ollie's feelings. Is Herman justified in his response?" },
                                                { key: 'honestyAsif', text: "Asif goes to Tim Horton's and they give him back too much change. Once outside the store, he realizes they gave him $4 extra back. Since it wasn't his mistake and he is running late, should Asif feel guilty for keeping the money?" },
                                                { key: 'honestyFrank', text: "Frank finds an iPhone in the washroom at school. He has always wanted a smart phone and knows a friend who can unlock it for him. Is Frank justified in keeping the phone?" },
                                                { key: 'honestyCharlotte', text: "Charlotte is writing a test and realizes the teacher has accidentally left the answer key on the chalkboard. Is Charlotte justified in copying the answers?" },
                                                { key: 'honestySalima', text: "Salima is given homework to draw an object from observation, but traces it from a magazine instead. Is this plagiarism?" },
                                            ].map((q, idx) => (
                                                <div key={idx} className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                    <p className="font-semibold text-slate-800 mb-3">{idx+1}. {q.text}</p>
                                                    <AutoExpandingTextarea value={formData[q.key]} onChange={e => updateField(q.key, e.target.value)} placeholder="Yes/No, because..." className="bg-white" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="clay-card p-8 space-y-6 mt-8 bg-violet-50 border-violet-100">
                                        <h3 className="font-black text-xl mb-4 text-violet-900">Discussion & Reflection</h3>
                                        
                                        <div>
                                            <label className="block font-bold mb-2 text-violet-800">When is it important to be honest? Describe situations.</label>
                                            <AutoExpandingTextarea value={formData.honestyImportant} onChange={e => updateField('honestyImportant', e.target.value)} placeholder="It is most important to be honest when..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-violet-800">When is it acceptable to lie or omit truth? Describe situations.</label>
                                            <AutoExpandingTextarea value={formData.honestyAcceptable} onChange={e => updateField('honestyAcceptable', e.target.value)} placeholder="It might be acceptable when..." />
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block font-bold mb-2 text-violet-800">Which scenario was the easiest for you to decide? Why?</label>
                                                <AutoExpandingTextarea value={formData.honestyEasiest} onChange={e => updateField('honestyEasiest', e.target.value)} placeholder="The easiest was..." />
                                            </div>
                                            <div>
                                                <label className="block font-bold mb-2 text-violet-800">Which scenario was the hardest for you to decide? Why?</label>
                                                <AutoExpandingTextarea value={formData.honestyHardest} onChange={e => updateField('honestyHardest', e.target.value)} placeholder="The hardest was..." />
                                            </div>
                                        </div>
                                        
                                        <div className="h-px w-full bg-violet-200 my-4"></div>
                                        
                                        <div>
                                            <label className="block font-bold mb-2 text-violet-800">Explain a time when you chose to deceive or lie? Why did you need to do this?</label>
                                            <AutoExpandingTextarea value={formData.honestyReflection1} onChange={e => updateField('honestyReflection1', e.target.value)} placeholder="A time I lied was..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-violet-800">Do you believe honesty is important to healthy relationships? Why or Why not?</label>
                                            <AutoExpandingTextarea value={formData.honestyReflection2} onChange={e => updateField('honestyReflection2', e.target.value)} placeholder="I believe honesty is..." />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: MAINTAINING RELATIONSHIPS */}
                            {activeTab === 'maintaining' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6">Maintaining Positive Relationships</h2>

                                    <div className="clay-card p-8 space-y-6">
                                        <div>
                                            <label className="block font-bold mb-2">Using a dictionary, define <span className="text-violet-500">conflict</span>.</label>
                                            <AutoExpandingTextarea value={formData.defConflict} onChange={e => updateField('defConflict', e.target.value)} placeholder="Conflict is..." />
                                        </div>
                                    </div>

                                    <div className="clay-card p-8 space-y-6">
                                        <h3 className="font-black text-xl text-slate-800">Think of a time in your life when you were in a conflict with a friend or family member.</h3>
                                        <div>
                                            <label className="block font-bold mb-2">What were you fighting or arguing about?</label>
                                            <AutoExpandingTextarea value={formData.conflictAbout} onChange={e => updateField('conflictAbout', e.target.value)} placeholder="We argued about..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">How did you try to resolve your conflict?</label>
                                            <AutoExpandingTextarea value={formData.conflictResolve} onChange={e => updateField('conflictResolve', e.target.value)} placeholder="I tried to resolve it by..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">Was this effective? Why or why not?</label>
                                            <AutoExpandingTextarea value={formData.conflictEffective} onChange={e => updateField('conflictEffective', e.target.value)} placeholder="It was/wasn't effective because..." />
                                        </div>
                                    </div>

                                    <KnowledgeDrop title="Conflict: A Fact of Life">
                                        <p>Conflict between people is a fact of life - and it's not necessarily a bad thing. In fact, a relationship with frequent conflict may be healthier than one with no observable conflict.</p>
                                        <p>Conflicts occur at all levels of interaction - at work among friends, within families and between relationship partners.</p>
                                        <p>Once you find yourself in a conflicted situation with someone else, it is important to reduce the emotional charge from the situation so that you and the other person can communicate rationally about the conflict and resolve it. Good communication skills are essential to resolving conflict quickly and effectively.</p>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-6 mt-8">
                                        <h3 className="font-black text-xl mb-4">Communication Skills Translator</h3>
                                        <p className="text-sm text-slate-500 mb-2">Below, you will find examples of poor communication skills. For each example, provide an example of good communication skills.</p>
                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 mb-6">Examples Of Poor Communication Skills {"->"} Examples Of Good Communication Skills</p>
                                        
                                        <div className="space-y-4">
                                            {formData.commSkills.map((skill, idx) => (
                                                <div key={idx} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-4 rounded-2xl border-2 border-slate-100">
                                                    <div className="w-full md:w-1/2 flex items-center gap-3 text-rose-500 font-semibold">
                                                        <i className="fa-solid fa-xmark bg-rose-100 p-2 rounded-full shrink-0"></i>
                                                        <span className="leading-tight">{skill.poor}</span>
                                                    </div>
                                                    <i className="fa-solid fa-arrow-right text-slate-300 hidden md:block"></i>
                                                    <div className="w-full md:w-1/2 relative">
                                                        <input 
                                                            type="text" 
                                                            className="clay-input w-full p-3 pl-10" 
                                                            placeholder="Good Alternative..."
                                                            value={skill.good}
                                                            onChange={e => {
                                                                const newSkills = [...formData.commSkills];
                                                                newSkills[idx].good = e.target.value;
                                                                updateField('commSkills', newSkills);
                                                            }}
                                                        />
                                                        <i className="fa-solid fa-check text-emerald-500 absolute left-4 top-1/2 transform -translate-y-1/2"></i>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* TAB: SUMMATIVE CASES */}
                            {activeTab === 'sum_cases' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-full text-sm tracking-wider uppercase">Summative Task</div>
                                        <h2 className="text-3xl font-black">Social Case Studies</h2>
                                    </div>
                                    
                                    <p className="text-slate-600 mb-8 font-medium">Read the following 3 social situations and analyze how the characters should handle them.</p>

                                    {/* Case 1 */}
                                    <div className="clay-card p-8 space-y-6 mb-8 border-l-8 border-l-blue-400">
                                        <h3 className="font-black text-2xl text-blue-900 mb-4">Case 1: Joe & Craig</h3>
                                        <div className="bg-blue-50 p-4 rounded-xl text-blue-900 italic font-medium">
                                            "Joe lent Craig, his best friend, $100 six weeks ago. He has not asked for the money back but knows that Craig started a new part-time job three weeks ago and feels he should now have the cash to repay him."
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Jon (Joe) should handle this situation? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseJonCraig1} onChange={e => updateField('caseJonCraig1', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Craig will react? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseJonCraig2} onChange={e => updateField('caseJonCraig2', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm text-blue-700">What if Craig told Joe that he needed the money to fix his car? Does this change how Jon should handle it?</label>
                                            <AutoExpandingTextarea value={formData.caseJonCraig3} onChange={e => updateField('caseJonCraig3', e.target.value)} placeholder="..." />
                                        </div>
                                    </div>

                                    {/* Case 2 */}
                                    <div className="clay-card p-8 space-y-6 mb-8 border-l-8 border-l-purple-400">
                                        <h3 className="font-black text-2xl text-purple-900 mb-4">Case 2: Amanda & Joanne</h3>
                                        <div className="bg-purple-50 p-4 rounded-xl text-purple-900 italic font-medium">
                                            "Amanda has known Joanne since 3rd grade. She has covered for Joanne several times, saying that they are having a sleep-over when in fact Joanne has been staying with her boyfriend. Amanda no longer wants to lie and feels used."
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Amanda should handle this situation? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseAmandaJoanne1} onChange={e => updateField('caseAmandaJoanne1', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Joanne will react? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseAmandaJoanne2} onChange={e => updateField('caseAmandaJoanne2', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm text-purple-700">What if Joanne told Amanda that her family would kick her out of the house if they found out? Does this change how Amanda handles it?</label>
                                            <AutoExpandingTextarea value={formData.caseAmandaJoanne3} onChange={e => updateField('caseAmandaJoanne3', e.target.value)} placeholder="..." />
                                        </div>
                                    </div>

                                    {/* Case 3 */}
                                    <div className="clay-card p-8 space-y-6 border-l-8 border-l-emerald-400">
                                        <h3 className="font-black text-2xl text-emerald-900 mb-4">Case 3: Maya & Leticia</h3>
                                        <div className="bg-emerald-50 p-4 rounded-xl text-emerald-900 italic font-medium">
                                            "Maya and Leticia consider themselves best friends. Recently Maya noticed Leticia losing a lot of weight, passing on food, and calling herself 'fat'. Maya is very concerned but not sure how Leticia will react if she raises the subject."
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Maya should handle this situation? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseMayaLeticia1} onChange={e => updateField('caseMayaLeticia1', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm">How do you think Leticia will react? Why?</label>
                                            <AutoExpandingTextarea value={formData.caseMayaLeticia2} onChange={e => updateField('caseMayaLeticia2', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-sm text-emerald-700">What if Leticia told Maya that her boyfriend said he would dump her if she didn't lose weight? Does this change how Maya handles it?</label>
                                            <AutoExpandingTextarea value={formData.caseMayaLeticia3} onChange={e => updateField('caseMayaLeticia3', e.target.value)} placeholder="..." />
                                        </div>
                                    </div>

                                </div>
                            )}

                            {/* TAB: FINISH */}
                            {activeTab === 'finish' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <div className="text-center mb-10">
                                        <div className="inline-block p-4 bg-emerald-100 rounded-3xl mb-4 text-emerald-500">
                                            <i className="fa-solid fa-flag-checkered text-5xl"></i>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-800 tracking-tight">Final Review</h2>
                                        <p className="text-slate-500 mt-2 text-lg">Make sure all sections are complete before downloading your workbook.</p>
                                    </div>

                                    <div className="clay-card p-8 mb-8 bg-slate-50 border-slate-200">
                                        <h3 className="font-black text-xl mb-4">Module Completion Checklist</h3>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {SECTIONS.filter(s => s.id !== 'finish' && s.id !== 'intro').map(sec => {
                                                const { completed, total, isDone } = calcProgress(sec.id);
                                                return (
                                                    <div key={sec.id} className={`flex items-center justify-between p-4 rounded-xl border-2 ${isDone ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white border-slate-200 opacity-70'}`}>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isDone ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                                                {isDone ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-ellipsis"></i>}
                                                            </div>
                                                            <span className="font-bold text-slate-700">{sec.title}</span>
                                                        </div>
                                                        <span className={`text-sm font-bold ${isDone ? 'text-emerald-500' : 'text-slate-400'}`}>{completed}/{total}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Image Upload Area for Supplementary evidence if needed */}
                                    <div className="clay-card p-8 mb-8">
                                        <h3 className="font-black text-xl mb-2"><i className="fa-solid fa-camera text-violet-500 mr-2"></i> Supplementary Evidence (Optional)</h3>
                                        <p className="text-sm text-slate-500">If your teacher asked you to draw, map, or create something physical for this module, upload a photo of it here. It will be compressed automatically.</p>
                                        <ImageUploader image={formData.supplementaryImage} onImageChange={(img) => updateField('supplementaryImage', img)} />
                                    </div>

                                    <div className="clay-card p-8 text-center bg-violet-600 border-violet-700 text-white shadow-[0_8px_0_0_#4c1d95]">
                                        <h3 className="font-black text-2xl mb-4">Ready to Print?</h3>
                                        <p className="text-violet-200 mb-8 max-w-lg mx-auto">Open a clean teacher-facing print report with your responses, budget snapshot, and case-study answers in one place.</p>
                                        
                                        <button 
                                            onClick={generateTeacherExport}
                                            className="bg-white text-violet-600 hover:bg-slate-50 font-black py-4 px-8 rounded-2xl shadow-[0_6px_0_0_#e2e8f0] active:translate-y-[6px] active:shadow-none transition-all text-xl"
                                        >
                                            <i className="fa-solid fa-print mr-2"></i> Print Teacher Report
                                        </button>
                                    </div>
                                </div>
                            )}

                    {/* NEXT BUTTON (Floating Bottom Right within container) */}
                            {activeTab !== 'finish' && (
                                <div className="mt-12 flex justify-end">
                                    <button 
                                        onClick={nextTab}
                                        className="clay-btn py-3 px-8 text-lg flex items-center gap-2"
                                    >
                                        Next Section <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
