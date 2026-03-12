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
        const DEFAULT_STATE = {
            studentName: "",
            defMarketing: "", defPackaging: "", influenceExample: "", favoriteStore: "",
            purchases: Array(10).fill({ item: "", influence: "" }),
            biggestInfluence: "",
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

        const collectTeacherReportValues = (fd) => [
            fd.studentName,
            fd.defMarketing, fd.defPackaging, fd.influenceExample, fd.favoriteStore, fd.biggestInfluence,
            ...fd.purchases.flatMap((purchase) => [purchase.item, purchase.influence]),
            fd.joeDecision, fd.sallyDecision, fd.betterDecision,
            fd.purchaseReflection, fd.incomeCurrent, fd.incomeFuture, fd.purchaseDecision, fd.purchaseFactors,
            ...Object.values(fd.budget),
            fd.budgetWhereFrom, fd.budgetWhereGo, fd.budgetEndMonth, fd.budgetChange,
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

            const incomeRows = [
                { label: "Job", amount: fd.budget.job, note: "" },
                { label: "Parents", amount: fd.budget.parents, note: "" },
                { label: "Other", amount: fd.budget.other, note: fd.budget.otherExp }
            ];
            const expenseRows = [
                { label: "Rent", amount: fd.budget.rent, note: "" },
                { label: "Utilities", amount: fd.budget.utilities, note: "" },
                { label: "Phone", amount: fd.budget.phone, note: "" },
                { label: "Groceries", amount: fd.budget.groceries, note: "" },
                { label: "Car", amount: fd.budget.car, note: "" },
                { label: "Insurance", amount: fd.budget.insurance, note: "" },
                { label: "Gas", amount: fd.budget.gas, note: "" },
                { label: "Entertainment", amount: fd.budget.entertainment, note: "" },
                { label: "Dining", amount: fd.budget.dining, note: "" },
                { label: "Clothes", amount: fd.budget.clothes, note: "" },
                { label: "Etc", amount: fd.budget.etc, note: fd.budget.etcExp }
            ];

            const incomeTotal = incomeRows.reduce((sum, row) => sum + (parseTeacherReportMoney(row.amount) ?? 0), 0);
            const expenseTotal = expenseRows.reduce((sum, row) => sum + (parseTeacherReportMoney(row.amount) ?? 0), 0);
            const budgetDifference = incomeTotal - expenseTotal;
            const budgetNote = (!incomeRows.some((row) => parseTeacherReportMoney(row.amount) !== null) && !expenseRows.some((row) => parseTeacherReportMoney(row.amount) !== null))
                ? "Enter monthly dollar amounts in the workbook to compare income and expenses automatically."
                : budgetDifference > 0
                    ? `Budget snapshot shows a monthly surplus of $${budgetDifference.toFixed(2)}.`
                    : budgetDifference < 0
                        ? `Budget snapshot shows a monthly shortfall of $${Math.abs(budgetDifference).toFixed(2)}.`
                        : "Budget snapshot is currently balanced at $0.00.";

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
                            { label: "Biggest Influence", value: fd.biggestInfluence }
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
                            { label: "Current Income Sources", value: fd.incomeCurrent },
                            { label: "Future Income Sources", value: fd.incomeFuture },
                            { label: "How Purchases Are Decided", value: fd.purchaseDecision },
                            { label: "Decision Factors", value: fd.purchaseFactors },
                            { label: "Where Most Money Comes From", value: fd.budgetWhereFrom },
                            { label: "Where Most Money Goes", value: fd.budgetWhereGo },
                            { label: "End of Month Outcome", value: fd.budgetEndMonth },
                            { label: "One Budget Change", value: fd.budgetChange }
                        ])}
                    </div>
                    <div class="budget-wrap">
                        <table class="budget-compare-table">
                            <thead>
                                <tr>
                                    <th>Budget Type</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${incomeRows.map((row) => `
                                    <tr>
                                        <td><span class="budget-type-chip budget-type-income">Income</span></td>
                                        <td>${escapeTeacherReportHtml(row.label)}</td>
                                        <td>${formatTeacherReportMoneyCell(row.amount)}</td>
                                        <td>${hasTeacherReportValue(row.note) ? escapeTeacherReportHtml(row.note) : '<span class="answer-empty-chip">No note</span>'}</td>
                                    </tr>
                                `).join("")}
                                ${expenseRows.map((row) => `
                                    <tr>
                                        <td><span class="budget-type-chip budget-type-expense">Expense</span></td>
                                        <td>${escapeTeacherReportHtml(row.label)}</td>
                                        <td>${formatTeacherReportMoneyCell(row.amount)}</td>
                                        <td>${hasTeacherReportValue(row.note) ? escapeTeacherReportHtml(row.note) : '<span class="answer-empty-chip">No note</span>'}</td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                        <p class="budget-compare-note">${escapeTeacherReportHtml(budgetNote)}</p>
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
                                <div class="summary-stat"><span class="summary-stat-label">Student</span><div class="summary-stat-value">${hasTeacherReportValue(fd.studentName) ? escapeTeacherReportHtml(fd.studentName) : "Not provided"}</div></div>
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
            const [isLoaded, setIsLoaded] = useState(false);
            const completedSectionsRef = useRef(new Set());

            // 1. Auto-Load Data
            useEffect(() => {
                const saved = localStorage.getItem('calmModule2Data');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        // Merge parsed with default to ensure no missing keys crash the app
                        setFormData(prev => ({ ...prev, ...parsed }));
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

            // Calculate Progress 
            const calcProgress = (sectionId) => {
                const fd = formData;
                let fields = [];
                switch(sectionId) {
                    case 'intro': fields = [fd.studentName]; break;
                    case 'advertising': 
                        fields = [fd.defMarketing, fd.defPackaging, fd.influenceExample, fd.favoriteStore, fd.biggestInfluence];
                        fd.purchases.forEach(p => { fields.push(p.item, p.influence) });
                        break;
                    case 'waiting': fields = [fd.joeDecision, fd.sallyDecision, fd.betterDecision]; break;
                    case 'money': 
                        fields = [
                            fd.purchaseReflection,
                            fd.incomeCurrent, fd.incomeFuture, fd.purchaseDecision, fd.purchaseFactors, 
                            fd.budgetWhereFrom, fd.budgetWhereGo, fd.budgetEndMonth, fd.budgetChange
                        ];
                        Object.values(fd.budget).forEach(v => fields.push(v));
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

            if (!isLoaded) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading your workbook...</div>;

            return (
                <div className="flex flex-col md:flex-row min-h-screen">
                    
                    {/* SIDEBAR NAVIGATION */}
                    <div className="md:w-72 bg-white border-r-2 border-slate-100 p-6 flex flex-col md:h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0">
                        <div className="mb-8">
                            <h1 className="text-2xl font-black tracking-tighter text-slate-800 leading-tight">CALM <span className="text-violet-500">Module 2</span></h1>
                            <p className="text-sm text-slate-500 font-semibold mt-1">Resource Choices</p>
                        </div>
                        
                        <nav className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {SECTIONS.map(sec => {
                                const { completed, total, isDone } = calcProgress(sec.id);
                                const isActive = activeTab === sec.id;
                                return (
                                    <button 
                                        key={sec.id}
                                        onClick={() => setActiveTab(sec.id)}
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

                    {/* MAIN CONTENT AREA */}
                    <div className="flex-1 p-6 md:p-12 overflow-y-auto bg-slate-50 relative">
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
                                        <label className="block text-sm font-bold text-slate-700 mb-2">To get started, enter your full name:</label>
                                        <input 
                                            type="text" 
                                            className="clay-input w-full p-4 text-xl font-bold" 
                                            placeholder="Your Name Here..."
                                            value={formData.studentName}
                                            onChange={(e) => updateField('studentName', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* TAB: ADVERTISING */}
                            {activeTab === 'advertising' && (
                                <div className="animate-[fadeIn_0.3s_ease-out]">
                                    <h2 className="text-3xl font-black mb-6">Who Decides What You Buy?</h2>
                                    
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

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-amber-400 text-amber-900 font-bold px-3 py-1 rounded-full text-sm tracking-wider uppercase">Task</div>
                                        <h3 className="text-2xl font-black">Budgeting Assignment</h3>
                                    </div>

                                    <div className="clay-card p-8 space-y-6 mb-8">
                                        <div>
                                            <label className="block font-bold mb-2">1. List your current source(s) of income.</label>
                                            <AutoExpandingTextarea value={formData.incomeCurrent} onChange={e => updateField('incomeCurrent', e.target.value)} placeholder="I make money from..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">2. What do you expect to be your source(s) of income in the near future?</label>
                                            <AutoExpandingTextarea value={formData.incomeFuture} onChange={e => updateField('incomeFuture', e.target.value)} placeholder="In the future, I expect to earn from..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">3. How do you decide what to purchase?</label>
                                            <AutoExpandingTextarea value={formData.purchaseDecision} onChange={e => updateField('purchaseDecision', e.target.value)} placeholder="I decide by..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">4. What factors do you think influence your purchasing decisions?</label>
                                            <AutoExpandingTextarea value={formData.purchaseFactors} onChange={e => updateField('purchaseFactors', e.target.value)} placeholder="Factors include..." />
                                        </div>
                                    </div>

                                    {/* BUDGET SHEET */}
                                    <div className="clay-card p-0 overflow-hidden mb-8 border-violet-200">
                                        <div className="bg-violet-500 p-6 text-white text-center">
                                            <h3 className="font-black text-2xl">Monthly Personal Budget</h3>
                                            <p className="text-violet-200 text-sm">Fill in estimated amounts (use $0 if not applicable)</p>
                                        </div>
                                        
                                        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                            {/* INCOME */}
                                            <div className="flex-1 space-y-4">
                                                <h4 className="font-black text-xl text-emerald-600 flex items-center gap-2 border-b-2 border-emerald-100 pb-2"><i className="fa-solid fa-arrow-down"></i> Income (+)</h4>
                                                
                                                <div className="flex justify-between items-center gap-4">
                                                    <label className="font-semibold text-slate-600">Job</label>
                                                    <input type="number" className="clay-input w-32 p-2 text-right font-bold text-slate-800" placeholder="$" value={formData.budget.job} onChange={e => updateNested('budget', 'job', e.target.value)} />
                                                </div>
                                                <div className="flex justify-between items-center gap-4">
                                                    <label className="font-semibold text-slate-600">Parents/Family</label>
                                                    <input type="number" className="clay-input w-32 p-2 text-right font-bold text-slate-800" placeholder="$" value={formData.budget.parents} onChange={e => updateNested('budget', 'parents', e.target.value)} />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <label className="font-semibold text-slate-600">Other</label>
                                                        <input type="number" className="clay-input w-32 p-2 text-right font-bold text-slate-800" placeholder="$" value={formData.budget.other} onChange={e => updateNested('budget', 'other', e.target.value)} />
                                                    </div>
                                                    <input type="text" className="clay-input w-full p-2 text-sm" placeholder="Explain 'Other'..." value={formData.budget.otherExp} onChange={e => updateNested('budget', 'otherExp', e.target.value)} />
                                                </div>
                                            </div>

                                            {/* EXPENSES */}
                                            <div className="flex-1 space-y-4">
                                                <h4 className="font-black text-xl text-rose-500 flex items-center gap-2 border-b-2 border-rose-100 pb-2"><i className="fa-solid fa-arrow-up"></i> Expenses (-)</h4>
                                                
                                                {[
                                                    { label: 'Rent/Room & Board', key: 'rent' },
                                                    { label: 'Utilities', key: 'utilities' },
                                                    { label: 'Phone', key: 'phone' },
                                                    { label: 'Groceries', key: 'groceries' },
                                                    { label: 'Car Payments', key: 'car' },
                                                    { label: 'Insurance', key: 'insurance' },
                                                    { label: 'Gas', key: 'gas' },
                                                    { label: 'Entertainment', key: 'entertainment' },
                                                    { label: 'Dining Out', key: 'dining' },
                                                    { label: 'Clothes', key: 'clothes' }
                                                ].map(item => (
                                                    <div key={item.key} className="flex justify-between items-center gap-4">
                                                        <label className="font-semibold text-slate-600 text-sm">{item.label}</label>
                                                        <input type="number" className="clay-input w-32 p-2 text-right font-bold text-slate-800" placeholder="$" value={formData.budget[item.key]} onChange={e => updateNested('budget', item.key, e.target.value)} />
                                                    </div>
                                                ))}

                                                <div className="flex flex-col gap-2">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <label className="font-semibold text-slate-600 text-sm">Etc.</label>
                                                        <input type="number" className="clay-input w-32 p-2 text-right font-bold text-slate-800" placeholder="$" value={formData.budget.etc} onChange={e => updateNested('budget', 'etc', e.target.value)} />
                                                    </div>
                                                    <input type="text" className="clay-input w-full p-2 text-sm" placeholder="Explain 'Etc'..." value={formData.budget.etcExp} onChange={e => updateNested('budget', 'etcExp', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="clay-card p-8 space-y-6">
                                        <h3 className="font-black text-xl mb-4">Budget Analysis</h3>
                                        <div>
                                            <label className="block font-bold mb-2">Where does most of your money come from?</label>
                                            <AutoExpandingTextarea value={formData.budgetWhereFrom} onChange={e => updateField('budgetWhereFrom', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">Where does most of your money go?</label>
                                            <AutoExpandingTextarea value={formData.budgetWhereGo} onChange={e => updateField('budgetWhereGo', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2">At the end of the month, are you saving money or going into debt? What are your plans for the money?</label>
                                            <AutoExpandingTextarea value={formData.budgetEndMonth} onChange={e => updateField('budgetEndMonth', e.target.value)} placeholder="..." />
                                        </div>
                                        <div>
                                            <label className="block font-bold mb-2 text-violet-600">Looking at your budget, what is one thing you would like to do differently? Explain.</label>
                                            <AutoExpandingTextarea value={formData.budgetChange} onChange={e => updateField('budgetChange', e.target.value)} placeholder="I would like to change..." />
                                        </div>
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
                                        <p className="font-bold text-slate-500">For each situation, answer whether or not the individual is justified. Explain your reasoning (Yes or No? Why?).</p>

                                        <div className="space-y-6">
                                            {[
                                                { key: 'honestyNorma', text: "Norma sees a wealthy person drop $100. Norma is low on rent and finds it hard to make ends meet. She knows she needs it more. Is she justified in keeping the money?" },
                                                { key: 'honestyGertrude', text: "Gertrude sees her friend Ethyl tagging a wall with a homophobic slur. No one else witnesses it. The principal asks anyone with information to come forward. Is Gertrude justified in not reporting this?" },
                                                { key: 'honestyHerman', text: "Herman overheard Ollie's new girlfriend saying mean things. Ollie asks Herman what he thinks of her, and Herman says she is 'nice' to avoid hurting his feelings. Is Herman justified?" },
                                                { key: 'honestyAsif', text: "Asif is given $4 too much change at Tim Horton's. He is running late and realizes outside. Should Asif feel guilty for keeping the money?" },
                                                { key: 'honestyFrank', text: "Frank finds an iPhone in the school washroom. He wants a smartphone and knows a friend who can unlock it. Is Frank justified in keeping the phone?" },
                                                { key: 'honestyCharlotte', text: "Charlotte sees the teacher left the answer key on the chalkboard during a test. Is Charlotte justified in copying the answers?" },
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

                                    <KnowledgeDrop title="Conflict: A Fact of Life">
                                        <p>Conflict between people is a fact of life – and it's not necessarily a bad thing. A relationship with frequent conflict may be healthier than one with no observable conflict.</p>
                                        <p>Once you are in a conflict, it is important to reduce the emotional charge so you can communicate rationally. Good communication skills are essential to resolving conflict quickly and effectively.</p>
                                    </KnowledgeDrop>

                                    <div className="clay-card p-8 space-y-6">
                                        <h3 className="font-black text-xl text-slate-800">Think of a time you were in a conflict with a friend or family member.</h3>
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

                                    <div className="clay-card p-8 space-y-6 mt-8">
                                        <h3 className="font-black text-xl mb-4">Communication Skills Translator</h3>
                                        <p className="text-sm text-slate-500 mb-6">For each example of poor communication skills, provide an alternative example of good communication skills.</p>
                                        
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
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
