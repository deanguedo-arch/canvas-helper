/* inline script 1 */
const { useState, useEffect } = React;

        // --- DATA ---

        const NEEDS_WANTS_ITEMS = [
            { id: 1, name: "Winter Coat", img: "fa-mitten", isNeed: true, explanation: "Protection from the elements is a basic human need." },
            { id: 2, name: "Latest iPhone", img: "fa-mobile-screen", isNeed: false, explanation: "Communication is a need, but a $1200 luxury device is a want." },
            { id: 3, name: "Groceries (Apples, Bread, Beans)", img: "fa-apple-whole", isNeed: true, explanation: "Nutritious food is required for survival." },
            { id: 4, name: "UberEats / Dining Out", img: "fa-burger", isNeed: false, explanation: "Convenience food is a want. Cooking at home fulfills the need." },
            { id: 5, name: "Basic Internet Access", img: "fa-wifi", isNeed: true, explanation: "In modern society, internet is required for school, work, and banking." },
            { id: 6, name: "Netflix Subscription", img: "fa-tv", isNeed: false, explanation: "Entertainment is nice, but it is not essential for survival." }
        ];

        const BUDGET_SCENARIOS = {
            home: {
                icon: "fa-house-chimney-user",
                title: "Living at Home",
                subtitle: "(College/Working)",
                desc: "You live with your parents rent-free, but you are responsible for your own phone, car, and personal expenses.",
                tips: "Rent: $0 | Groceries: $150 | Utilities: $0"
            },
            alone: {
                icon: "fa-building",
                title: "Living Alone",
                subtitle: "(Working Full-Time)",
                desc: "You got your own 1-bedroom apartment. You value privacy, but you pay for absolutely EVERYTHING yourself.",
                tips: "Rent: $1200+ | Groceries: $400+ | Utilities: $150+"
            },
            roommates: {
                icon: "fa-people-roof",
                title: "Living with Roommates",
                subtitle: "(Working/School)",
                desc: "You split a 3-bedroom house with two friends. Bills are shared, saving you money, but conflicts can happen!",
                tips: "Rent: $500-700 | Groceries: $300 | Utilities: $75"
            }
        };

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

        const SOCIAL_SCENARIOS = {
            maya: {
                title: "Maya & Leticia", icon: "fa-person-dress",
                nodes: {
                    start: {
                        text: "You are Maya. You notice your friend Leticia is skipping meals again. When offered food, she says she is 'fat.' You also know her boyfriend recently threatened to dump her if she didn't lose weight. What do you say to her?",
                        options: [
                            { text: "Your boyfriend is toxic. You need to dump him right now.", next: "aggressive" },
                            { text: "Hey, I noticed you aren't eating much lately. Are you okay?", next: "empathetic" }
                        ]
                    },
                    aggressive: { text: "Leticia gets defensive. 'You don't understand him! He actually cares about me!' She storms off. By attacking her boyfriend, you made her put her guard up. Your emotional resources are drained.", options: [{ text: "Try again", next: "start" }] },
                    empathetic: { text: "Leticia sighs. 'I'm just so stressed. He says I need to look perfect or he'll leave me.'", options: [{ text: "Tell her: 'A real partner wouldn't threaten you like that. You deserve better.'", next: "supportive" }, { text: "Tell her: 'Well, maybe just lose a few pounds to keep him happy?'", next: "enabling" }] },
                    enabling: { text: "Leticia nods sadly and skips another meal. You haven't helped her protect her emotional resources; you validated a toxic boundary.", options: [{ text: "Try again", next: "start" }] },
                    supportive: { text: "Leticia cries a little, but nods. 'I know. It's just hard.' You offer to go with her to the school counselor. You used your social resources to build her up and establish healthy boundaries!", options: [], success: true }
                }
            },
            tyler: {
                title: "Tyler's Concert", icon: "fa-ticket",
                nodes: {
                    start: { text: "Your friend Tyler just got a new job. He wants you to come to a huge music festival this weekend. The tickets are $150, plus food and merch. You are trying to stick to your budget to save for college.", options: [{ text: "Put the $150 on your credit card so you don't miss out.", next: "credit" }, { text: "Tell Tyler you can't afford it right now, but offer a cheaper alternative hangout.", next: "boundary" }] },
                    credit: { text: "You go to the festival and have fun, but next month you are hit with 21% interest on your credit card. You are now stressed about money, draining your emotional and financial resources. Tyler didn't even notice you paid on credit.", options: [{ text: "Try again", next: "start" }] },
                    boundary: { text: "Tyler is bummed at first, but agrees to come over and play video games instead. You protected your financial goals without losing your friend. Setting financial boundaries is a crucial life skill!", options: [], success: true }
                }
            },
            sam: {
                title: "Sam's Schedule", icon: "fa-clock",
                nodes: {
                    start: { text: "You work part-time at a fast-food restaurant. Your manager, Dave, schedules you for 5 shifts this week, including the night before your massive Math Diploma exam. You are already exhausted.", options: [{ text: "Skip studying and work the shifts. Dave needs you.", next: "work" }, { text: "Speak to Dave immediately and explain you need the night before your exam off.", next: "communicate" }] },
                    work: { text: "You work the shifts but are falling asleep during your Math exam. You bomb the test. You traded your long-term human resources (education/future) for a short-term minimum wage paycheck.", options: [{ text: "Try again", next: "start" }] },
                    communicate: { text: "Dave is slightly annoyed but adjusts the schedule. 'School comes first,' he admits. By communicating professionally, you protected your time and energy (Human Resources) while keeping your job.", options: [], success: true }
                }
            }
        };


        // --- UI COMPONENTS ---

        

        

        

        


        // --- MAIN APP ---

        const App = () => {
            const [activeTab, setActiveTab] = useState(0);
            const [data, setData] = useState({
                studentName: '',
                // Tab 0: Resources
                needsWantsIndex: 0,
                // Tab 1: Ads
                adScore: 0,
                // Tab 2: Finance (Multi-Scenario)
                budgets: {
                    home: { income: { job: '', loans: '', support: '', other: '' }, fixed: { rent: '0', utilities: '0', insurance: '', transit: '', car: '', carIns: '', phone: '', internet: '', subs: '' }, variable: { groceries: '', dining: '', gas: '', personal: '', clothing: '', fun: '' } },
                    alone: { income: { job: '', loans: '', support: '', other: '' }, fixed: { rent: '', utilities: '', insurance: '', transit: '', car: '', carIns: '', phone: '', internet: '', subs: '' }, variable: { groceries: '', dining: '', gas: '', personal: '', clothing: '', fun: '' } },
                    roommates: { income: { job: '', loans: '', support: '', other: '' }, fixed: { rent: '', utilities: '', insurance: '', transit: '', car: '', carIns: '', phone: '', internet: '', subs: '' }, variable: { groceries: '', dining: '', gas: '', personal: '', clothing: '', fun: '' } }
                },
                lifeEvent: null,
                // Tab 3: Social
                completedScenarios: [],
                // Tab 4: Goals
                smart: { s: '', m: '', a: '', r: '', t: '' },
                // WRITTEN REFLECTIONS FOR TEACHER
                reflections: {
                    needsWants: '',
                    adDeconstruction: '',
                    budgetChoice: '',
                    socialJustification: ''
                }
            });

            // Mini-states
            const [activeSocialScenario, setActiveSocialScenario] = useState('maya');
            const [scenarioNodes, setScenarioNodes] = useState({ maya: 'start', tyler: 'start', sam: 'start' });
            const [adIndex, setAdIndex] = useState(0);
            const [adFeedback, setAdFeedback] = useState("");
            const [activeBudgetTab, setActiveBudgetTab] = useState('home');

            const update = (key, val) => setData(prev => ({ ...prev, [key]: val }));
            const updateNested = (cat, key, val) => setData(prev => ({ ...prev, [cat]: { ...prev[cat], [key]: val } }));
            const updateReflection = (key, val) => setData(prev => ({ ...prev, reflections: { ...prev.reflections, [key]: val } }));
            
            const updateBudget = (cat, key, val) => {
                setData(prev => {
                    const newBudgets = { ...prev.budgets };
                    newBudgets[activeBudgetTab] = { ...newBudgets[activeBudgetTab] };
                    newBudgets[activeBudgetTab][cat] = { ...newBudgets[activeBudgetTab][cat], [key]: val };
                    return { ...prev, budgets: newBudgets };
                });
            };

            // Finance Math
            const calcTotal = (obj) => Object.values(obj).reduce((acc, val) => acc + (Number(val) || 0), 0);
            
            const getTotals = (scenarioKey) => {
                const b = data.budgets[scenarioKey];
                let inc = calcTotal(b.income);
                let fix = calcTotal(b.fixed);
                let varExp = calcTotal(b.variable);
                
                if (data.lifeEvent) {
                    if (data.lifeEvent.type === 'expense') varExp += data.lifeEvent.amount;
                    if (data.lifeEvent.type === 'income') inc += data.lifeEvent.amount;
                }
                return { inc, fix, varExp, net: inc - (fix + varExp) };
            };

            const currentTotals = getTotals(activeBudgetTab);

            const handleAdGuess = (guess) => {
                const currentAd = AD_SCENARIOS[adIndex];
                if (guess === currentAd.tactic) {
                    setAdFeedback("Correct! " + currentAd.hint);
                    if (adIndex < AD_SCENARIOS.length - 1) {
                        setTimeout(() => { setAdIndex(prev => prev + 1); setAdFeedback(""); }, 2000);
                    } else {
                        update('adScore', AD_SCENARIOS.length);
                        confetti();
                    }
                } else {
                    setAdFeedback("Not quite. Try again!");
                }
            };

            const triggerLifeEvent = () => {
                const events = [
                    { desc: "Your car broke down (or bus pass prices surged).", amount: 350, type: 'expense' },
                    { desc: "You dropped your phone and cracked the screen.", amount: 200, type: 'expense' },
                    { desc: "You got a bad flu and missed 3 shifts at work.", amount: 250, type: 'expense' }
                ];
                update('lifeEvent', events[Math.floor(Math.random() * events.length)]);
                confetti({ particleCount: 40, colors: ['#ff0000', '#000000'] });
            };

            const handleNeedsWants = (isNeedGuess) => {
                const current = NEEDS_WANTS_ITEMS[data.needsWantsIndex];
                if (isNeedGuess === current.isNeed) {
                    if (data.needsWantsIndex < NEEDS_WANTS_ITEMS.length - 1) {
                        update('needsWantsIndex', data.needsWantsIndex + 1);
                    } else {
                        update('needsWantsIndex', NEEDS_WANTS_ITEMS.length);
                        confetti();
                    }
                } else {
                    alert(`Not quite! ${current.explanation}`);
                }
            };


            const TABS = [
                { id: 0, title: "1. Basic Needs", icon: "fa-cubes" },
                { id: 1, title: "2. Consumerism", icon: "fa-bullhorn" },
                { id: 2, title: "3. Budgeting", icon: "fa-wallet" },
                { id: 3, title: "4. Scenarios", icon: "fa-users" },
                { id: 4, title: "Final Report", icon: "fa-file-signature" }
            ];

            return (
                <div className="min-h-screen pb-20">
                    {/* HEADER */}
                    <header className="bg-slate-900 text-white p-6 sticky top-0 z-50 shadow-md no-print">
                        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-black tracking-tight"><i className="fa-solid fa-compass text-blue-400 mr-2"></i> CALM MODULE 2</h1>
                                <p className="text-slate-400 text-sm font-medium">Resource Choices & Consumerism</p>
                            </div>
                            <div className="w-full md:w-64">
                                <input 
                                    type="text" 
                                    placeholder="Enter Student Name" 
                                    className="w-full bg-slate-800 border-none rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-blue-500"
                                    value={data.studentName}
                                    onChange={(e) => update('studentName', e.target.value)}
                                />
                            </div>
                        </div>
                    </header>

                    {/* NAVIGATION */}
                    <div className="bg-white border-b border-slate-200 sticky top-[88px] z-40 no-print overflow-x-auto">
                        <div className="max-w-6xl mx-auto flex">
                            {TABS.map((tab, i) => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 min-w-[120px] py-4 px-2 text-sm font-bold text-center border-b-4 transition-colors flex flex-col items-center gap-1
                                        ${activeTab === tab.id ? 'border-blue-600 text-blue-700 bg-blue-50' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                                    `}
                                >
                                    <i className={`fa-solid ${tab.icon} text-lg`}></i>
                                    {tab.title}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* MAIN CONTENT AREA */}
                    <div className="max-w-6xl mx-auto p-4 md:p-6 mt-4">
                        
                        {/* TAB 0: NEEDS VS WANTS */}
                        {activeTab === 0 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex flex-col xl:flex-row gap-6">
                                    <div className="xl:w-1/2">
                                        <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                                            <h2 className="text-2xl font-black text-blue-900 mb-4"><i className="fa-solid fa-book-open mr-2 text-blue-500"></i> Learn: Understanding Resources</h2>
                                            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
                                                <p>Everything you want to do in life requires <strong>resources</strong>. There are three main types:</p>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                        <div className="text-xl mb-1 text-emerald-500"><i className="fa-solid fa-coins"></i></div>
                                                        <h3 className="font-bold text-slate-800">Financial</h3>
                                                        <p className="text-xs text-slate-500 mt-1">Money, investments, credit, income.</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                        <div className="text-xl mb-1 text-purple-500"><i className="fa-solid fa-brain"></i></div>
                                                        <h3 className="font-bold text-slate-800">Human</h3>
                                                        <p className="text-xs text-slate-500 mt-1">Time, energy, skills, intelligence.</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                                                        <div className="text-xl mb-1 text-rose-500"><i className="fa-solid fa-users"></i></div>
                                                        <h3 className="font-bold text-slate-800">Social</h3>
                                                        <p className="text-xs text-slate-500 mt-1">Family, friends, community support.</p>
                                                    </div>
                                                </div>
                                                <p className="bg-white p-3 rounded-lg border-l-4 border-blue-500 text-xs mt-4">
                                                    <strong>The Trade-Off:</strong> You almost always have to trade one resource for another. Working a job trades your Human Resource (time/energy) for a Financial Resource (money).
                                                </p>
                                            </div>
                                        </Card>
                                    </div>
                                    
                                    <div className="xl:w-1/2">
                                        <Card className="h-full relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-slate-100 text-slate-500 px-3 py-1 text-xs font-bold rounded-bl-lg">Game</div>
                                            <h2 className="text-xl font-black text-slate-800 mb-2">Need or Want?</h2>
                                            <p className="text-sm text-slate-500 mb-6">Categorize the following items correctly to proceed.</p>
                                            
                                            {data.needsWantsIndex < NEEDS_WANTS_ITEMS.length ? (
                                                <div className="text-center p-6 bg-slate-50 rounded-2xl border-2 border-slate-200">
                                                    <i className={`fa-solid ${NEEDS_WANTS_ITEMS[data.needsWantsIndex].img} text-6xl text-slate-700 mb-4`}></i>
                                                    <h3 className="text-2xl font-black text-slate-800 mb-8">{NEEDS_WANTS_ITEMS[data.needsWantsIndex].name}</h3>
                                                    <div className="flex gap-4 justify-center">
                                                        <Btn color="emerald" onClick={() => handleNeedsWants(true)} className="w-32"><i className="fa-solid fa-heart-pulse mr-2"></i> Need</Btn>
                                                        <Btn color="rose" onClick={() => handleNeedsWants(false)} className="w-32"><i className="fa-solid fa-gem mr-2"></i> Want</Btn>
                                                    </div>
                                                    <div className="mt-6 text-xs text-slate-400 font-bold">Item {data.needsWantsIndex + 1} of {NEEDS_WANTS_ITEMS.length}</div>
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 bg-emerald-50 text-emerald-800 rounded-2xl border-2 border-emerald-200">
                                                    <i className="fa-solid fa-circle-check text-4xl mb-2"></i>
                                                    <h3 className="font-black text-xl">Perfect Score!</h3>
                                                    <p className="text-sm mt-2">You successfully differentiated between needs and wants.</p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </div>

                                <TextAreaReflect 
                                    label="Explain a time you recently confused a 'Want' for a 'Need'. What happened, and how did it affect your resources?"
                                    placeholder="Type your reflection here... (e.g., I convinced myself I needed new shoes for work, but I actually just wanted the specific brand. It drained my financial resources for that month.)"
                                    value={data.reflections.needsWants}
                                    onChange={(v) => updateReflection('needsWants', v)}
                                />

                                <div className="flex justify-end"><Btn disabled={data.needsWantsIndex < NEEDS_WANTS_ITEMS.length || data.reflections.needsWants.length < 10} onClick={() => setActiveTab(1)}>Next Module <i className="fa-solid fa-arrow-right ml-2"></i></Btn></div>
                            </div>
                        )}

                        {/* TAB 1: CONSUMERISM & ADS */}
                        {activeTab === 1 && (
                            <div className="animate-fade-in space-y-6">
                                <div className="flex flex-col xl:flex-row gap-6">
                                    <div className="xl:w-1/2">
                                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100">
                                            <h2 className="text-2xl font-black text-indigo-900 mb-4"><i className="fa-solid fa-brain mr-2 text-indigo-500"></i> Learn: Advertising Tactics</h2>
                                            <div className="space-y-3 text-sm text-slate-700">
                                                <p>The Canadian Code of Advertising Standards says ads must be honest, but companies still use psychology to manipulate your "Wants" into feeling like "Needs."</p>
                                                <ul className="space-y-2 mt-4">
                                                    <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Bandwagon:</strong> "Everyone else is doing it/buying it!"</li>
                                                    <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Emotional Appeal:</strong> Targets fear, loneliness, or desire for happiness.</li>
                                                    <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Testimonial:</strong> Using celebrities or "experts" to build fake trust.</li>
                                                    <li className="bg-white p-2 rounded border border-indigo-50 shadow-sm"><strong className="text-indigo-700">Facts & Figures:</strong> Using statistics (even misleading ones) to sound scientific.</li>
                                                </ul>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="xl:w-1/2">
                                        <Card>
                                            <h2 className="text-2xl font-black text-slate-800 mb-2"><i className="fa-solid fa-magnifying-glass mr-2 text-indigo-500"></i> Apply: Ad Analyzer</h2>
                                            <p className="text-sm text-slate-500 mb-6">Read the fake ad below. Which tactic is the company using to manipulate you?</p>
                                            
                                            {data.adScore < AD_SCENARIOS.length ? (
                                                <div className="p-6 bg-slate-800 text-white rounded-2xl text-center shadow-lg relative overflow-hidden">
                                                    <div className="absolute top-0 left-0 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 uppercase tracking-widest rounded-br-xl">Ad {adIndex + 1} of {AD_SCENARIOS.length}</div>
                                                    <h3 className="font-black text-xl mt-4 mb-2 text-indigo-300">{AD_SCENARIOS[adIndex].product}</h3>
                                                    <p className="italic text-lg mb-6">"{AD_SCENARIOS[adIndex].ad}"</p>
                                                    
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {AD_TACTICS.map(t => (
                                                            <button key={t} onClick={() => handleAdGuess(t)} className="bg-slate-700 hover:bg-slate-600 p-3 rounded-xl font-bold transition-colors text-sm">{t}</button>
                                                        ))}
                                                    </div>
                                                    {adFeedback && <p className={`mt-4 font-bold ${adFeedback.includes('Correct') ? 'text-emerald-400' : 'text-rose-400'}`}>{adFeedback}</p>}
                                                </div>
                                            ) : (
                                                <div className="text-center p-8 bg-emerald-50 text-emerald-800 rounded-2xl border-2 border-emerald-200">
                                                    <i className="fa-solid fa-shield-halved text-4xl mb-2"></i>
                                                    <h3 className="font-black">Immunity Unlocked!</h3>
                                                    <p className="text-sm">You successfully identified all {AD_SCENARIOS.length} major advertising tactics.</p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>
                                </div>

                                <TextAreaReflect 
                                    label="Deconstruct a Real Brand: Pick a brand you like (e.g., Nike, Apple, Lululemon). What physical product do they sell, and what EMOTION or IDEA are they ACTUALLY selling you?"
                                    placeholder="Type your reflection here... (e.g., Nike sells shoes, but their ads are actually selling the idea of being an elite athlete and never giving up.)"
                                    value={data.reflections.adDeconstruction}
                                    onChange={(v) => updateReflection('adDeconstruction', v)}
                                />

                                <div className="mt-8 flex justify-end"><Btn disabled={data.adScore < AD_SCENARIOS.length || data.reflections.adDeconstruction.length < 10} onClick={() => setActiveTab(2)}>Next Module <i className="fa-solid fa-arrow-right ml-2"></i></Btn></div>
                            </div>
                        )}

                        {/* TAB 2: FINANCE & BUDGET */}
                        {activeTab === 2 && (
                            <div className="animate-fade-in space-y-6">
                                <Card className="bg-emerald-50 border-emerald-100">
                                    <h2 className="text-2xl font-black text-emerald-900 mb-2"><i className="fa-solid fa-money-check-dollar mr-2"></i> Learn: Paystubs & Net Pay</h2>
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="text-sm font-medium flex-1">
                                            <p>Before you budget, you must know your <strong>Net Pay</strong>. Your boss pays you a <strong>Gross Wage</strong>, but the government takes deductions before you see it.</p>
                                            <ul className="mt-2 space-y-1 list-disc pl-4 text-emerald-800">
                                                <li><strong>Income Tax:</strong> Pays for schools, roads, hospitals.</li>
                                                <li><strong>CPP (Canada Pension Plan):</strong> Forced savings for retirement.</li>
                                                <li><strong>EI (Employment Insurance):</strong> A safety net if you lose your job.</li>
                                            </ul>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm w-full md:w-64 text-center">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Gross Pay</p>
                                            <p className="font-black text-lg line-through text-slate-400">$2,000.00</p>
                                            <p className="text-xs font-bold text-rose-400 uppercase mt-2">Deductions (Taxes)</p>
                                            <p className="font-black text-sm text-rose-500">-$300.00</p>
                                            <div className="border-t border-slate-100 my-2"></div>
                                            <p className="text-xs font-bold text-emerald-600 uppercase">Your Net Pay</p>
                                            <p className="font-black text-2xl text-emerald-600">$1,700.00</p>
                                        </div>
                                    </div>
                                </Card>

                                <Card>
                                    <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-200">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800"><i className="fa-solid fa-calculator mr-2 text-indigo-500"></i> The Budget Builder</h2>
                                            <p className="text-sm text-slate-500 font-bold mt-1 text-indigo-600">Fill out all 3 scenarios to see how your life choices affect your money.</p>
                                        </div>
                                    </div>

                                    {/* BUDGET SCENARIO TABS */}
                                    <div className="flex space-x-2 border-b-2 border-slate-200 mb-6 relative">
                                        {Object.entries(BUDGET_SCENARIOS).map(([key, sc]) => (
                                            <button key={key} onClick={() => setActiveBudgetTab(key)}
                                                className={`flex-1 py-4 px-2 font-black text-sm md:text-base transition-all flex flex-col md:flex-row items-center justify-center gap-2 rounded-t-xl ${activeBudgetTab === key ? 'bg-indigo-600 text-white shadow-md z-10 scale-105 transform origin-bottom border-b-0' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border-2 border-transparent border-b-0'}`}>
                                                <i className={`fa-solid ${sc.icon} text-xl md:text-base`}></i>
                                                <span>{sc.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <div className="bg-slate-50 border-2 border-slate-200 p-6 rounded-2xl mb-8 -mt-6">
                                        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                            <i className={`fa-solid ${BUDGET_SCENARIOS[activeBudgetTab].icon} text-4xl text-indigo-400`}></i>
                                            <div>
                                                <h3 className="font-black text-lg">{BUDGET_SCENARIOS[activeBudgetTab].title} {BUDGET_SCENARIOS[activeBudgetTab].subtitle}</h3>
                                                <p className="text-sm text-slate-600 mb-2">{BUDGET_SCENARIOS[activeBudgetTab].desc}</p>
                                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded"><i className="fa-solid fa-lightbulb mr-1"></i> Hint: {BUDGET_SCENARIOS[activeBudgetTab].tips}</span>
                                            </div>
                                        </div>

                                        <div className="grid lg:grid-cols-3 gap-6 mb-6">
                                            {/* INCOME */}
                                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-inner">
                                                <h3 className="font-black text-sm uppercase text-blue-800 mb-4 flex items-center justify-between">
                                                    <span>1. Monthly Income</span>
                                                    <span className="bg-blue-200 text-blue-900 px-2 py-1 rounded text-xs">${currentTotals.inc}</span>
                                                </h3>
                                                <div className="space-y-3">
                                                    <Input prefix="$" type="number" placeholder="Net Job Income" value={data.budgets[activeBudgetTab].income.job} onChange={v => updateBudget('income', 'job', v)} />
                                                    <Input prefix="$" type="number" placeholder="Student Loans / Grants" value={data.budgets[activeBudgetTab].income.loans} onChange={v => updateBudget('income', 'loans', v)} />
                                                    <Input prefix="$" type="number" placeholder="Family Support" value={data.budgets[activeBudgetTab].income.support} onChange={v => updateBudget('income', 'support', v)} />
                                                </div>
                                            </div>

                                            {/* FIXED EXPENSES */}
                                            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-100 shadow-inner">
                                                <h3 className="font-black text-sm uppercase text-rose-800 mb-4 flex items-center justify-between">
                                                    <span>2. Fixed Expenses</span>
                                                    <span className="bg-rose-200 text-rose-900 px-2 py-1 rounded text-xs">${currentTotals.fix}</span>
                                                </h3>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                                    <Input prefix="$" type="number" placeholder="Rent / Mortgage" value={data.budgets[activeBudgetTab].fixed.rent} onChange={v => updateBudget('fixed', 'rent', v)} />
                                                    <Input prefix="$" type="number" placeholder="Utilities (Heat/Water)" value={data.budgets[activeBudgetTab].fixed.utilities} onChange={v => updateBudget('fixed', 'utilities', v)} />
                                                    <Input prefix="$" type="number" placeholder="Internet / Phone" value={data.budgets[activeBudgetTab].fixed.internet} onChange={v => updateBudget('fixed', 'internet', v)} />
                                                    <Input prefix="$" type="number" placeholder="Car / Transit" value={data.budgets[activeBudgetTab].fixed.transit} onChange={v => updateBudget('fixed', 'transit', v)} />
                                                </div>
                                            </div>

                                            {/* VARIABLE EXPENSES */}
                                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 shadow-inner">
                                                <h3 className="font-black text-sm uppercase text-amber-800 mb-4 flex items-center justify-between">
                                                    <span>3. Variable Expenses</span>
                                                    <span className="bg-amber-200 text-amber-900 px-2 py-1 rounded text-xs">${currentTotals.varExp}</span>
                                                </h3>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                                                    <Input prefix="$" type="number" placeholder="Groceries" value={data.budgets[activeBudgetTab].variable.groceries} onChange={v => updateBudget('variable', 'groceries', v)} />
                                                    <Input prefix="$" type="number" placeholder="Dining Out" value={data.budgets[activeBudgetTab].variable.dining} onChange={v => updateBudget('variable', 'dining', v)} />
                                                    <Input prefix="$" type="number" placeholder="Personal Care" value={data.budgets[activeBudgetTab].variable.personal} onChange={v => updateBudget('variable', 'personal', v)} />
                                                    <Input prefix="$" type="number" placeholder="Fun / Entertainment" value={data.budgets[activeBudgetTab].variable.fun} onChange={v => updateBudget('variable', 'fun', v)} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`p-4 rounded-xl text-white flex flex-col md:flex-row justify-between items-center gap-4 ${currentTotals.net >= 0 ? 'bg-slate-800' : 'bg-rose-600'}`}>
                                            <div>
                                                <h3 className="font-black text-lg">Active Tab Bottom Line</h3>
                                                <p className="text-xs opacity-80 mt-1">Income (${currentTotals.inc}) - Expenses (${currentTotals.fix + currentTotals.varExp})</p>
                                            </div>
                                            <div className="text-3xl font-black text-center md:text-right">
                                                ${currentTotals.net.toFixed(2)}
                                                {currentTotals.net < 0 && <div className="text-[10px] text-rose-200 mt-1 uppercase tracking-wider">You are in debt!</div>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* SIDE BY SIDE COMPARISON */}
                                    <div className="mt-8 border-t border-slate-200 pt-8">
                                        <h3 className="text-xl font-black text-slate-800 mb-4"><i className="fa-solid fa-scale-balanced mr-2 text-indigo-500"></i> Side-by-Side Comparison</h3>
                                        
                                        {!data.lifeEvent && (
                                            <div className="text-center p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200 mb-6 flex justify-between items-center">
                                                <div className="text-left">
                                                    <h4 className="font-black text-indigo-900">Life Happens Curveball</h4>
                                                    <p className="text-xs text-indigo-700">See how an unexpected event affects all 3 budgets.</p>
                                                </div>
                                                <Btn color="blue" onClick={triggerLifeEvent} className="text-sm py-2"><i className="fa-solid fa-bolt mr-1"></i> Draw Card</Btn>
                                            </div>
                                        )}

                                        {data.lifeEvent && (
                                            <div className="p-4 bg-rose-100 border-2 border-rose-300 rounded-xl mb-6 flex justify-between items-center text-rose-900 font-bold animate-fade-in">
                                                <div><i className="fa-solid fa-triangle-exclamation mr-2 text-rose-600"></i> Curveball: {data.lifeEvent.desc} applied to all budgets!</div>
                                                <div className="text-lg">-${data.lifeEvent.amount}</div>
                                            </div>
                                        )}

                                        <div className="grid md:grid-cols-3 gap-4">
                                            {Object.keys(BUDGET_SCENARIOS).map(key => {
                                                const totals = getTotals(key);
                                                return (
                                                    <div key={key} className={`p-4 rounded-xl border-2 ${activeBudgetTab === key ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                                                        <h4 className="font-black text-slate-700 mb-2 flex items-center justify-between">
                                                            <span><i className={`fa-solid ${BUDGET_SCENARIOS[key].icon} mr-2`}></i> {BUDGET_SCENARIOS[key].title}</span>
                                                        </h4>
                                                        <div className="space-y-1 text-sm font-medium text-slate-600 mb-3 border-b border-slate-200 pb-3">
                                                            <div className="flex justify-between"><span>Income:</span> <span className="text-emerald-600">${totals.inc}</span></div>
                                                            <div className="flex justify-between"><span>Expenses:</span> <span className="text-rose-600">${totals.fix + totals.varExp}</span></div>
                                                        </div>
                                                        <div className={`text-xl font-black text-center ${totals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            Net: ${totals.net.toFixed(2)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </Card>

                                <TextAreaReflect 
                                    label="Budget Justification: Looking at the 3 scenarios above, which one is most realistic for you right out of high school? What is one major sacrifice you will have to make to ensure you don't go into debt?"
                                    placeholder="Type your reflection here... (e.g., I plan to live at home so I can save for college. The major sacrifice is my privacy and having to follow my parents' house rules.)"
                                    value={data.reflections.budgetChoice}
                                    onChange={(v) => updateReflection('budgetChoice', v)}
                                />

                                <div className="mt-8 flex justify-end">
                                    <Btn disabled={data.reflections.budgetChoice.length < 10} onClick={() => setActiveTab(3)}>Next Module <i className="fa-solid fa-arrow-right ml-2"></i></Btn>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: SOCIAL RESOURCES */}
                        {activeTab === 3 && (
                            <div className="animate-fade-in space-y-6">
                                <Card>
                                    <div className="flex justify-between items-end mb-6 pb-4 border-b border-slate-200">
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800"><i className="fa-solid fa-comments mr-2 text-indigo-500"></i> Apply: Social & Personal Scenarios</h2>
                                            <p className="text-sm text-slate-500 font-bold mt-1 text-indigo-600">Navigate the scenarios below to practice protecting your time, energy, and relationships.</p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                                        {Object.keys(SOCIAL_SCENARIOS).map(key => (
                                            <button key={key} onClick={() => setActiveSocialScenario(key)}
                                                className={`flex-1 py-3 px-2 font-bold text-sm transition-all flex items-center justify-center gap-2 rounded-xl border-2 whitespace-nowrap min-w-[120px] ${activeSocialScenario === key ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'} ${data.completedScenarios.includes(key) ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}>
                                                <i className={`fa-solid ${SOCIAL_SCENARIOS[key].icon}`}></i>
                                                <span className="hidden md:inline">{SOCIAL_SCENARIOS[key].title}</span>
                                                {data.completedScenarios.includes(key) && <i className="fa-solid fa-check-circle text-emerald-400 ml-1"></i>}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {!data.completedScenarios.includes(activeSocialScenario) ? (
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 min-h-[250px] flex flex-col justify-center animate-fade-in">
                                            <p className="font-bold text-slate-700 text-lg mb-6 leading-relaxed">{SOCIAL_SCENARIOS[activeSocialScenario].nodes[scenarioNodes[activeSocialScenario]].text}</p>
                                            <div className="space-y-3">
                                                {SOCIAL_SCENARIOS[activeSocialScenario].nodes[scenarioNodes[activeSocialScenario]].options.map((opt, i) => (
                                                    <button key={i} onClick={() => {
                                                        const nextNode = opt.next;
                                                        setScenarioNodes(prev => ({ ...prev, [activeSocialScenario]: nextNode }));
                                                        if (SOCIAL_SCENARIOS[activeSocialScenario].nodes[nextNode].success) {
                                                            if (!data.completedScenarios.includes(activeSocialScenario)) {
                                                                update('completedScenarios', [...data.completedScenarios, activeSocialScenario]);
                                                                confetti();
                                                            }
                                                        }
                                                    }} className="w-full text-left p-4 bg-white border-2 border-blue-100 hover:border-blue-500 rounded-xl font-bold text-slate-600 hover:text-blue-700 transition-all shadow-sm">
                                                        {opt.text}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 bg-purple-100 text-purple-900 rounded-2xl border-2 border-purple-300 min-h-[250px] flex flex-col justify-center animate-fade-in">
                                            <i className="fa-solid fa-hand-holding-heart text-5xl mb-4"></i>
                                            <h3 className="font-black text-2xl mb-2">Scenario Mastered</h3>
                                            <p className="font-medium">You successfully navigated this situation and protected your resources.</p>
                                        </div>
                                    )}
                                </Card>

                                <TextAreaReflect 
                                    label="Boundary Setting: Pick one of the scenarios above. Why is it so difficult to say 'no' to friends or bosses, and what is the long-term consequence of never setting boundaries?"
                                    placeholder="Type your reflection here..."
                                    value={data.reflections.socialJustification}
                                    onChange={(v) => updateReflection('socialJustification', v)}
                                />

                                <div className="mt-8 flex justify-end">
                                    <Btn disabled={data.completedScenarios.length < Object.keys(SOCIAL_SCENARIOS).length || data.reflections.socialJustification.length < 10} onClick={() => setActiveTab(4)}>Go to Final Report <i className="fa-solid fa-flag-checkered ml-2"></i></Btn>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: FINAL REPORT (FOR PRINTING) */}
                        {activeTab === 4 && (
                            <div className="animate-fade-in">
                                <Card className="bg-blue-600 text-white mb-6 no-print border-none">
                                    <h2 className="text-2xl font-black mb-2">Final Step: Print/Save your Workbook</h2>
                                    <p className="font-medium opacity-90 mb-4">Review your answers below. Ensure you have elaborated on your reflections so your teacher can grade your critical thinking. When you are ready, print this page to PDF and submit it.</p>
                                    <div className="mt-6 flex justify-end">
                                        <Btn color="slate" onClick={() => window.print()} className="text-blue-900"><i className="fa-solid fa-file-pdf mr-2"></i> Print to PDF</Btn>
                                    </div>
                                </Card>

                                {/* PRINTABLE AREA */}
                                <Card className="print-card print:border-none print:shadow-none bg-white">
                                    <div className="text-center border-b-4 border-slate-800 pb-4 mb-6">
                                        <h1 className="text-3xl font-black uppercase">CALM Module 2 Workbook</h1>
                                        <h2 className="text-xl text-slate-500 font-bold mt-1">Resource Choices & Consumerism</h2>
                                        <p className="text-lg font-black mt-4 bg-slate-100 py-2 rounded-lg">Student: {data.studentName || '[No Name Entered]'}</p>
                                    </div>
                                    
                                    <div className="mb-8">
                                        <h3 className="font-black text-xl border-b-2 border-slate-200 pb-2 mb-4">Interactive Competencies Met</h3>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                                <i className={`fa-solid fa-${data.needsWantsIndex >= NEEDS_WANTS_ITEMS.length ? 'check text-emerald-500' : 'xmark text-rose-500'} text-2xl mb-2`}></i>
                                                <p className="text-xs font-bold text-slate-600 uppercase">Needs/Wants</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                                <i className={`fa-solid fa-${data.adScore === AD_SCENARIOS.length ? 'check text-emerald-500' : 'xmark text-rose-500'} text-2xl mb-2`}></i>
                                                <p className="text-xs font-bold text-slate-600 uppercase">Ad Analyzer</p>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                                <i className={`fa-solid fa-${data.completedScenarios.length === Object.keys(SOCIAL_SCENARIOS).length ? 'check text-emerald-500' : 'xmark text-rose-500'} text-2xl mb-2`}></i>
                                                <p className="text-xs font-bold text-slate-600 uppercase">Social Boundaries</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="font-black text-xl border-b-2 border-slate-200 pb-2 mb-4">Financial Profile Summary</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.keys(BUDGET_SCENARIOS).map(key => {
                                                const totals = getTotals(key);
                                                return (
                                                    <div key={key} className="border border-slate-200 p-3 rounded text-sm">
                                                        <strong className="block mb-1 text-slate-700">{BUDGET_SCENARIOS[key].title}</strong>
                                                        <div className="flex justify-between text-slate-500"><span>Inc:</span> <span>${totals.inc}</span></div>
                                                        <div className="flex justify-between text-slate-500"><span>Exp:</span> <span>${totals.fix + totals.varExp}</span></div>
                                                        <div className={`flex justify-between font-black mt-1 ${totals.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                            <span>Net:</span> <span>${totals.net.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-black text-xl border-b-2 border-slate-200 pb-2 mb-4">Student Written Reflections</h3>
                                        <div className="space-y-6">
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-gray-400">
                                                <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase tracking-wide">1. Needs vs Wants Reflection</h4>
                                                <p className="text-slate-800 font-medium whitespace-pre-wrap">{data.reflections.needsWants || <span className="text-rose-400 italic">No answer provided.</span>}</p>
                                            </div>
                                            
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-gray-400">
                                                <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase tracking-wide">2. Ad Deconstruction</h4>
                                                <p className="text-slate-800 font-medium whitespace-pre-wrap">{data.reflections.adDeconstruction || <span className="text-rose-400 italic">No answer provided.</span>}</p>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-gray-400">
                                                <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase tracking-wide">3. Budget Choice Justification</h4>
                                                <p className="text-slate-800 font-medium whitespace-pre-wrap">{data.reflections.budgetChoice || <span className="text-rose-400 italic">No answer provided.</span>}</p>
                                            </div>

                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 print:bg-white print:border-gray-400">
                                                <h4 className="font-bold text-sm text-slate-500 mb-2 uppercase tracking-wide">4. Social Boundary Justification</h4>
                                                <p className="text-slate-800 font-medium whitespace-pre-wrap">{data.reflections.socialJustification || <span className="text-rose-400 italic">No answer provided.</span>}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
