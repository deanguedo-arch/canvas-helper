/* inline script 1 */
// --- Sidebar Navigation Logic ---
        function switchModule(event, moduleId) {
            if(event) event.preventDefault();

            // 1. Hide all modules
            const modules = document.querySelectorAll('.module-view');
            modules.forEach(mod => {
                mod.classList.add('hidden');
                mod.classList.remove('block');
            });

            // 2. Show the selected module
            const targetModule = document.getElementById(moduleId);
            if (targetModule) {
                targetModule.classList.remove('hidden');
                targetModule.classList.add('block');
            }

            // 3. Update Sidebar Active States
            if(event) {
                const navItems = document.querySelectorAll('.nav-item');
                navItems.forEach(item => {
                    item.classList.remove('bg-slate-800', 'text-white', 'border-blue-500');
                    item.classList.add('border-transparent', 'hover:bg-slate-800', 'hover:text-white');
                    const iconContainer = item.querySelector('.nav-icon');
                    if(iconContainer) {
                        iconContainer.classList.remove('bg-blue-500', 'text-white');
                        iconContainer.classList.add('bg-slate-800', 'text-slate-400');
                    }
                });

                const clickedItem = event.currentTarget;
                clickedItem.classList.remove('border-transparent', 'hover:bg-slate-800', 'hover:text-white');
                clickedItem.classList.add('bg-slate-800', 'text-white', 'border-blue-500');
                
                const clickedIcon = clickedItem.querySelector('.nav-icon');
                if(clickedIcon) {
                    clickedIcon.classList.remove('bg-slate-800', 'text-slate-400');
                    clickedIcon.classList.add('bg-blue-500', 'text-white');
                }
            }

            document.querySelector('.main-scroll').scrollTo(0, 0);
        }

        // --- Accordion Logic ---
        function toggleAccordion(button) {
            button.classList.toggle("active");
            var content = button.nextElementSibling;
            if (content.classList.contains("open")) {
                content.classList.remove("open");
            } else {
                content.classList.add("open");
            }
        }

        const GENPSY_WORKBOOK_STORAGE_KEY = "genpsy-studio-unit-1-workbook";
        const GENPSY_SIDEBAR_STORAGE_KEY = "genpsy-studio-sidebar-collapsed";

        function setActivityResult(resultId, status, message) {
            const result = document.getElementById(resultId);
            if (!result) {
                return;
            }

            const toneClasses = {
                success: "mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 block",
                warning: "mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 block",
                error: "mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 block"
            };

            result.innerHTML = message;
            result.className = toneClasses[status] || toneClasses.warning;
        }

        function getCheckedValues(name) {
            return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                .map((input) => input.value)
                .sort();
        }

        function arraysEqual(left, right) {
            if (left.length !== right.length) {
                return false;
            }

            return left.every((value, index) => value === right[index]);
        }

        const branchAnswerKey = {
            "branch-1": "developmental",
            "branch-2": "physiological",
            "branch-3": "cognitive",
            "branch-4": "social",
            "branch-5": "clinical",
            "branch-6": "abnormal",
            "branch-7": "cognitive",
            "branch-8": "social",
            "branch-9": "parapsychology",
            "branch-10": "behavioural",
            "branch-11": "physiological",
            "branch-12": "parapsychology",
            "branch-13": "developmental",
            "branch-14": "clinical",
            "branch-15": "clinical"
        };

        function persistWorkbookFields() {
            const data = {};

            document.querySelectorAll("[data-persist-key]").forEach((field) => {
                const key = field.dataset.persistKey;
                if (!key) {
                    return;
                }
                data[key] = field.value;
            });

            try {
                localStorage.setItem(GENPSY_WORKBOOK_STORAGE_KEY, JSON.stringify(data));
            } catch (error) {
                console.warn("Unable to persist GenPsych workbook fields.", error);
            }
        }

        function initializeWorkbookFields() {
            let saved = {};

            try {
                saved = JSON.parse(localStorage.getItem(GENPSY_WORKBOOK_STORAGE_KEY) || "{}");
            } catch (error) {
                console.warn("Unable to read saved GenPsych workbook fields.", error);
            }

            document.querySelectorAll("[data-persist-key]").forEach((field) => {
                const key = field.dataset.persistKey;
                if (key && Object.prototype.hasOwnProperty.call(saved, key)) {
                    field.value = saved[key];
                }

                field.addEventListener("input", persistWorkbookFields);
            });
        }

        function applySidebarState(collapsed) {
            document.body.classList.toggle("sidebar-collapsed", collapsed);

            const sidebar = document.getElementById("course-sidebar");
            const sidebarToggle = document.querySelector(".sidebar-toggle");
            const openButton = document.getElementById("sidebar-open-button");

            if (sidebar) {
                sidebar.setAttribute("aria-hidden", collapsed ? "true" : "false");
            }

            if (sidebarToggle) {
                sidebarToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
                sidebarToggle.setAttribute("aria-label", collapsed ? "Show course menu" : "Hide course menu");
                sidebarToggle.innerHTML = `<i class="fas ${collapsed ? "fa-bars" : "fa-chevron-left"}"></i>`;
            }

            if (openButton) {
                openButton.setAttribute("aria-expanded", collapsed ? "false" : "true");
            }
        }

        function toggleSidebar(forceCollapsed) {
            const nextState = typeof forceCollapsed === "boolean"
                ? forceCollapsed
                : !document.body.classList.contains("sidebar-collapsed");

            applySidebarState(nextState);

            try {
                localStorage.setItem(GENPSY_SIDEBAR_STORAGE_KEY, nextState ? "true" : "false");
            } catch (error) {
                console.warn("Unable to persist sidebar state.", error);
            }
        }

        function initializeSidebarState() {
            let collapsed = false;

            try {
                collapsed = localStorage.getItem(GENPSY_SIDEBAR_STORAGE_KEY) === "true";
            } catch (error) {
                console.warn("Unable to read sidebar state.", error);
            }

            applySidebarState(collapsed);
        }

        function checkCareerActivity() {
            const psychiatristAnswers = ["medical-degree", "prescribe-medication", "therapy-testing", "treat-ailments"];
            const counsellorAnswers = ["counselling-degree", "outreach-programs", "preventative-treatment", "short-term-therapy"];

            const psychiatristSelection = getCheckedValues("psy-role");
            const counsellorSelection = getCheckedValues("counsellor-role");

            if (!psychiatristSelection.length || !counsellorSelection.length) {
                setActivityResult("career-activity-results", "warning", "Select the duties and training that fit both roles before checking your answers.");
                return;
            }

            const psychiatristCorrect = arraysEqual(psychiatristSelection, psychiatristAnswers);
            const counsellorCorrect = arraysEqual(counsellorSelection, counsellorAnswers);

            if (psychiatristCorrect && counsellorCorrect) {
                setActivityResult("career-activity-results", "success", "Both clinic roles are sorted correctly. You now have the core distinction this unit teaches: psychiatrist equals medical doctor plus medication, while family counselling focuses on prevention, consultation, and short-term support.");
                return;
            }

            setActivityResult("career-activity-results", "error", "One or both role checklists still mix the jobs together. Recheck medication and medical-doctor duties for the psychiatrist, and outreach/prevention/counselling duties for the family counsellor.");
        }

        function checkBehaviorActivity() {
            const answers = {
                "behavior-1": "covert",
                "behavior-2": "overt",
                "behavior-3": "covert",
                "behavior-4": "overt",
                "behavior-5": "covert",
                "behavior-6": "overt"
            };

            let score = 0;
            const unanswered = [];

            Object.entries(answers).forEach(([id, expected]) => {
                const field = document.getElementById(id);
                if (!field || !field.value) {
                    unanswered.push(id);
                    return;
                }

                if (field.value === expected) {
                    score += 1;
                }
            });

            if (unanswered.length) {
                setActivityResult("behavior-activity-results", "warning", "Finish all six overt/covert decisions before checking the sorter.");
                return;
            }

            if (score === Object.keys(answers).length) {
                setActivityResult("behavior-activity-results", "success", "All six behaviours are classified correctly. Overt behaviour can be observed directly; covert behaviour stays inside the mind.");
                return;
            }

            setActivityResult("behavior-activity-results", "error", `You got ${score}/6 correct. Revisit the rule: if another person can directly see or hear it, it is overt; if it stays internal, it is covert.`);
        }

        function checkBranchMatchActivity() {
            const unanswered = [];
            const wrong = [];

            Object.entries(branchAnswerKey).forEach(([id, expected], index) => {
                const field = document.getElementById(id);
                if (!field || !field.value) {
                    unanswered.push(index + 1);
                    return;
                }

                if (field.value !== expected) {
                    wrong.push(index + 1);
                }
            });

            if (unanswered.length) {
                setActivityResult("branch-activity-results", "warning", `Finish every branch match before checking. Still open: ${unanswered.join(", ")}.`);
                return;
            }

            if (!wrong.length) {
                setActivityResult("branch-activity-results", "success", "15/15 branch matches are correct. You now have the branch map this unit expects you to know.");
                return;
            }

            setActivityResult("branch-activity-results", "error", `You still have branch mix-ups on items ${wrong.join(", ")}. Recheck where the scenario belongs: development, biology, thought, social influence, treatment, the paranormal, or observable behaviour.`);
        }

        function checkExperimentLabActivity() {
            const missing = [];
            const expectedValues = {
                "gold-hypothesis": "predict-expensive",
                "gold-iv": "shampoo-type",
                "gold-dv": "wig-cleanliness",
                "gold-reliability": "repeated-trials",
                "gold-validity": "valid-yes"
            };

            let score = 0;

            Object.entries(expectedValues).forEach(([id, expected]) => {
                const field = document.getElementById(id);
                if (!field || !field.value) {
                    missing.push(id);
                    return;
                }

                if (field.value === expected) {
                    score += 1;
                }
            });

            const selectedControls = getCheckedValues("gold-control");
            const validControls = ["rinse-time", "shampoo-amount", "wash-time", "water-temp", "wig-type"];
            const correctControls = selectedControls.filter((value) => validControls.includes(value)).length;
            const choseWrongControl = selectedControls.some((value) => !validControls.includes(value));

            if (!selectedControls.length) {
                missing.push("gold-control");
            } else if (correctControls >= 3 && !choseWrongControl) {
                score += 1;
            }

            if (missing.length) {
                setActivityResult("experiment-activity-results", "warning", "Finish every part of the Goldilocks analysis before checking your experiment lab answers.");
                return;
            }

            if (score === 6) {
                setActivityResult("experiment-activity-results", "success", "Your experiment analysis is on target: the hypothesis predicts an outcome, the shampoo type is the independent variable, wig cleanliness is the dependent variable, at least three controls are identified, repetition improves reliability, and the design still has validity.");
                return;
            }

            setActivityResult("experiment-activity-results", "error", `You got ${score}/6 lab checks correct. Revisit the difference between variables, controls, reliability, and validity, then run the lab again.`);
        }

        // --- Tabs Logic for History (Mod 1) ---
        function openHistoryTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementById('mod-1').getElementsByClassName("tab-content-history");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementById('mod-1').getElementsByClassName("tab-btn-history");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-blue-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-blue-600 text-white");
        }

        function checkKnowledgeCheckMC() {
            const questionNames = [
                "kc-mc-1",
                "kc-mc-2",
                "kc-mc-3",
                "kc-mc-4",
                "kc-mc-5",
                "kc-mc-6",
                "kc-mc-7",
                "kc-mc-8",
                "kc-mc-9",
                "kc-mc-10"
            ];

            let score = 0;
            const unanswered = [];

            questionNames.forEach((name, index) => {
                const selected = document.querySelector(`input[name="${name}"]:checked`);
                if (!selected) {
                    unanswered.push(index + 1);
                    return;
                }

                if (selected.value === "correct") {
                    score += 1;
                }
            });

            if (unanswered.length) {
                setActivityResult("knowledge-check-mc-results", "warning", `Answer every multiple choice question before checking. Still open: ${unanswered.join(", ")}.`);
                return;
            }

            if (score === questionNames.length) {
                setActivityResult("knowledge-check-mc-results", "success", "10/10. Your core Unit 1 facts are in place.");
            } else if (score >= 8) {
                setActivityResult("knowledge-check-mc-results", "success", `You scored ${score}/10. Review the few weak spots, then move on to the written responses.`);
            } else {
                setActivityResult("knowledge-check-mc-results", "error", `You scored ${score}/10. Revisit the helper roles, hypnosis, overt/covert, and Goldilocks sections before checking again.`);
            }
        }

        function checkKnowledgeCheckMatching() {
            const unanswered = [];
            const wrong = [];

            Object.entries(branchAnswerKey).forEach(([id, expected], index) => {
                const field = document.getElementById(id.replace("branch-", "kc-branch-"));
                if (!field || !field.value) {
                    unanswered.push(index + 1);
                    return;
                }

                if (field.value !== expected) {
                    wrong.push(index + 1);
                }
            });

            if (unanswered.length) {
                setActivityResult("knowledge-check-matching-results", "warning", `Finish every branch match before checking. Still open: ${unanswered.join(", ")}.`);
                return;
            }

            if (!wrong.length) {
                setActivityResult("knowledge-check-matching-results", "success", "15/15. Your branch matching is fully aligned with the Unit 1 review.");
                return;
            }

            if (wrong.length <= 3) {
                setActivityResult("knowledge-check-matching-results", "success", `You are close. Recheck match numbers ${wrong.join(", ")} and tighten those branch choices.`);
                return;
            }

            setActivityResult("knowledge-check-matching-results", "error", `Several matches still need work. Review items ${wrong.join(", ")} against the branch lesson cards above.`);
        }

        // --- Quiz Logic Module 2 ---
        function checkQuizMod2() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m2q1"]:checked');
            const q2 = document.querySelector('input[name="m2q2"]:checked');
            const q3 = document.querySelector('input[name="m2q3"]:checked');
            const q4 = document.querySelector('input[name="m2q4"]:checked');
            const q5 = document.querySelector('input[name="m2q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz2-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Learning and Development sections and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        // --- Tabs Logic for Learning ---
        function openLearningTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-learning");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-learning");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-rose-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-rose-600 text-white");
        }

        // --- Tabs Logic for Memory ---
        function openMemoryTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-memory");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-memory");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-indigo-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-indigo-600 text-white");
        }

        // --- Tabs Logic for Group (Mod 4) ---
        function openGroupTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-group");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-group");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-amber-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-amber-600 text-white");
        }

        // --- Tabs Logic for Crime (Mod 5) ---
        function openCrimeTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-crime");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-crime");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-red-700 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-red-700 text-white");
        }

        // --- Tabs Logic for Neurosis (Mod 6) ---
        function openNeurosisTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-neurosis");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-neurosis");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-purple-600 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-purple-600 text-white");
        }

        // --- Tabs Logic for Psychosis (Mod 7) ---
        function openPsychosisTab(evt, tabName) {
            var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tab-content-psychosis");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].style.display = "none";
                tabcontent[i].classList.remove("active");
            }
            tablinks = document.getElementsByClassName("tab-btn-psychosis");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" bg-fuchsia-700 text-white", " bg-gray-200 text-gray-700 hover:bg-gray-300");
            }
            document.getElementById(tabName).style.display = "block";
            document.getElementById(tabName).classList.add("active");
            evt.currentTarget.className = evt.currentTarget.className.replace(" bg-gray-200 text-gray-700 hover:bg-gray-300", " bg-fuchsia-700 text-white");
        }

        // --- Quiz Logic Module 3 ---
        function checkQuizMod3() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m3q1"]:checked');
            const q2 = document.querySelector('input[name="m3q2"]:checked');
            const q3 = document.querySelector('input[name="m3q3"]:checked');
            const q4 = document.querySelector('input[name="m3q4"]:checked');
            const q5 = document.querySelector('input[name="m3q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz3-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Thinking and Memory sections and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        // --- Quiz Logic Module 4 ---
        function checkQuizMod4() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m4q1"]:checked');
            const q2 = document.querySelector('input[name="m4q2"]:checked');
            const q3 = document.querySelector('input[name="m4q3"]:checked');
            const q4 = document.querySelector('input[name="m4q4"]:checked');
            const q5 = document.querySelector('input[name="m4q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz4-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Roles and Groups sections and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        // --- Quiz Logic Module 5 ---
        function checkQuizMod5() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m5q1"]:checked');
            const q2 = document.querySelector('input[name="m5q2"]:checked');
            const q3 = document.querySelector('input[name="m5q3"]:checked');
            const q4 = document.querySelector('input[name="m5q4"]:checked');
            const q5 = document.querySelector('input[name="m5q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz5-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Crime and Eugenics sections and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        // --- Quiz Logic Module 6 ---
        function checkQuizMod6() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m6q1"]:checked');
            const q2 = document.querySelector('input[name="m6q2"]:checked');
            const q3 = document.querySelector('input[name="m6q3"]:checked');
            const q4 = document.querySelector('input[name="m6q4"]:checked');
            const q5 = document.querySelector('input[name="m6q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz6-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Neurosis concepts and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        // --- Quiz Logic Module 7 ---
        function checkQuizMod7() {
            let score = 0;
            const total = 5;
            const q1 = document.querySelector('input[name="m7q1"]:checked');
            const q2 = document.querySelector('input[name="m7q2"]:checked');
            const q3 = document.querySelector('input[name="m7q3"]:checked');
            const q4 = document.querySelector('input[name="m7q4"]:checked');
            const q5 = document.querySelector('input[name="m7q5"]:checked');
            
            const resultsDiv = document.getElementById("quiz7-results");
            
            if(!q1 || !q2 || !q3 || !q4 || !q5) {
                resultsDiv.innerHTML = "Please answer all questions before submitting.";
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-yellow-100 text-yellow-800 border border-yellow-300 block animate-pulse";
                return;
            }

            if(q1.value === "correct") score++;
            if(q2.value === "correct") score++;
            if(q3.value === "correct") score++;
            if(q4.value === "correct") score++;
            if(q5.value === "correct") score++;

            if(score === total) {
                resultsDiv.innerHTML = `Perfect Score! ${score}/${total} <i class="fas fa-star text-yellow-500 ml-2"></i>`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-green-100 text-green-800 border border-green-300 block";
            } else {
                resultsDiv.innerHTML = `You scored ${score}/${total}. Review the Psychosis concepts and try again!`;
                resultsDiv.className = "mt-6 p-4 rounded text-center font-bold text-lg bg-red-100 text-red-800 border border-red-300 block";
            }
        }

        function initializeGenPsychStudio() {
            initializeSidebarState();
            initializeWorkbookFields();
            switchModule(null, 'mod-1');
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initializeGenPsychStudio);
        } else {
            initializeGenPsychStudio();
        }
