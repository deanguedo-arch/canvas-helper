/* inline script 1 */
// --- NAVIGATION STATE ---
        const navData = [
            { id: 'intro', label: 'Overview' },
            { id: 'engine', label: '1. Engine Tuning' },
            { id: 'toolkit', label: '2. The Toolkit' },
            { id: 'operator', label: '3. The Operator' },
            { id: 'quiz', label: 'Knowledge Check' }
        ];

        let currentSection = 'intro';

        function renderNav() {
            const dNav = document.getElementById('desktop-nav');
            const mNav = document.getElementById('mobile-nav');

            const navHtml = navData.map(item => `
                <button onclick="navigateTo('${item.id}')" class="px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${currentSection === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}">
                    ${item.label}
                </button>
            `).join('');

            const mobileHtml = navData.map(item => `
                <button onclick="navigateTo('${item.id}')" class="flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${currentSection === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 bg-slate-800/50'}">
                    ${item.label}
                </button>
            `).join('');

            dNav.innerHTML = navHtml;
            mNav.innerHTML = mobileHtml;
        }

        function navigateTo(id) {
            currentSection = id;
            document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(`view-${id}`).classList.add('active');
            renderNav();
            window.scrollTo(0, 0);
            
            if (id === 'quiz') restartQuiz();
        }

        // --- INTERACTIVE: AROUSAL SLIDER ---
        function updateArousal(val) {
            const arousal = parseInt(val);
            const indicator = document.getElementById('curve-indicator');
            const statusEl = document.getElementById('arousal-status');
            
            // Curve math
            const h = 200;
            const k = 20;
            const a = 0.004938;
            const x = 20 + (arousal / 100) * 360;
            const y = a * Math.pow(x - h, 2) + k;

            indicator.setAttribute('transform', `translate(${x}, ${y})`);
            
            let status = "Optimal (Flow State)";
            let colorClass = "text-green-400 bg-green-500/10 border-green-500/30";
            
            if (arousal < 35) {
                status = "Under-aroused (Lethargic)";
                colorClass = "text-blue-400 bg-blue-500/10 border-blue-500/30";
            } else if (arousal > 65) {
                status = "Over-aroused (Anxious / Choking)";
                colorClass = "text-red-400 bg-red-500/10 border-red-500/30";
            }
            
            statusEl.innerText = status;
            statusEl.className = `px-4 py-1 rounded-full border text-sm font-bold ${colorClass}`;
        }

        // --- INTERACTIVE: SELF TALK ---
        let selfTalkFlipped = false;
        function toggleSelfTalk() {
            selfTalkFlipped = !selfTalkFlipped;
            const neg = document.getElementById('negative-talk');
            const pos = document.getElementById('positive-talk');
            
            if (selfTalkFlipped) {
                neg.style.opacity = '0';
                pos.style.opacity = '1';
            } else {
                neg.style.opacity = '1';
                pos.style.opacity = '0';
            }
        }

        // --- INTERACTIVE: QUIZ ---
        const questions = [
            {
                q: "Which technique is a 'manual override to the autonomic nervous system' to reset the stress loop?",
                options: ["Centering (Diaphragmatic Breathing)", "Social Facilitation", "Identity Foreclosure", "Drive Theory"],
                answer: 0
            },
            {
                q: "According to Social Facilitation Theory, presence of an audience helps performance on:",
                options: ["Complex or unlearned tasks", "Simple or well-learned tasks", "All high-pressure tasks", "None of the above"],
                answer: 1
            },
            {
                q: "What occurs when an athlete commits to an identity prematurely without exploring other options?",
                options: ["Identity Achievement", "Burn-out", "Identity Foreclosure", "State Anxiety"],
                answer: 2
            },
            {
                q: "Which goal type is most effective for reducing anxiety because the operator has 100% control?",
                options: ["Outcome Goals", "Competitive Goals", "Extrinsic Goals", "Process Goals"],
                answer: 3
            },
            {
                q: "The IZOF model suggests that optimal performance occurs:",
                options: ["Only at the lowest possible arousal", "At the exact same level for all athletes", "Within a unique arousal bandwidth for each athlete", "Whenever cognitive anxiety is zero"],
                answer: 2
            }
        ];

        let quizState = {
            currentIdx: 0,
            score: 0,
            answered: false
        };

        function renderQuestion() {
            const q = questions[quizState.currentIdx];
            document.getElementById('question-meta').innerText = `Question ${quizState.currentIdx + 1} of ${questions.length}`;
            document.getElementById('question-text').innerText = q.q;
            document.getElementById('quiz-progress').style.width = `${(quizState.currentIdx / questions.length) * 100}%`;

            const optionsHtml = q.options.map((opt, idx) => `
                <button onclick="handleQuizAnswer(${idx})" id="opt-${idx}" class="w-full text-left p-4 rounded-xl border-2 border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-medium">
                    ${opt}
                </button>
            `).join('');
            document.getElementById('options-container').innerHTML = optionsHtml;
        }

        function handleQuizAnswer(idx) {
            if (quizState.answered) return;
            quizState.answered = true;

            const q = questions[quizState.currentIdx];
            const correct = q.answer;
            
            // Visual feedback
            const selectedBtn = document.getElementById(`opt-${idx}`);
            const correctBtn = document.getElementById(`opt-${correct}`);
            
            if (idx === correct) {
                quizState.score++;
                selectedBtn.classList.add('border-green-500', 'bg-green-500/10', 'text-green-400');
            } else {
                selectedBtn.classList.add('border-red-500', 'bg-red-500/10', 'text-red-400');
                correctBtn.classList.add('border-green-500', 'bg-green-500/10', 'text-green-400');
            }

            setTimeout(() => {
                if (quizState.currentIdx < questions.length - 1) {
                    quizState.currentIdx++;
                    quizState.answered = false;
                    renderQuestion();
                } else {
                    showQuizResults();
                }
            }, 1500);
        }

        function showQuizResults() {
            document.getElementById('question-view').classList.add('hidden');
            document.getElementById('results-view').classList.remove('hidden');
            document.getElementById('quiz-progress').style.width = '100%';
            
            const perc = Math.round((quizState.score / questions.length) * 100);
            document.getElementById('final-percentage').innerText = `${perc}%`;
            document.getElementById('final-text').innerText = `You scored ${quizState.score} out of ${questions.length}.`;
        }

        function restartQuiz() {
            quizState = { currentIdx: 0, score: 0, answered: false };
            document.getElementById('question-view').classList.remove('hidden');
            document.getElementById('results-view').classList.add('hidden');
            renderQuestion();
        }

        // --- INIT ---
        window.onload = () => {
            renderNav();
            updateArousal(50);
            renderQuestion();
        };
