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

        const unit1KnowledgeCheckData = {
            multipleChoiceIntro: "Read each item carefully and decide which choice best completes the statement or answers the question.",
            multipleChoiceQuestions: [
                { id: "u1-kc-mc-1", number: 1, prompt: "Psychology is the study of", options: ["hypnosis", "the human soul", "human behaviour", "subconscious thoughts"] },
                { id: "u1-kc-mc-2", number: 2, prompt: "This group of helping professionals have medical degrees and can prescribe medication.", options: ["Counsellors", "Psychiatrists", "Psychologists", "Paraprofessionals"] },
                { id: "u1-kc-mc-3", number: 3, prompt: "Research in this branch of psychology may involve the effects of hormones on mood.", options: ["Social", "Behavioural", "Physiological", "Developmental"] },
                { id: "u1-kc-mc-4", number: 4, prompt: "Researchers in this field may study how infants learn to crawl.", options: ["Social", "Behavioural", "Physiological", "Developmental"] },
                { id: "u1-kc-mc-5", number: 5, prompt: "This branch of psychology may investigate the effects of overcrowding and its relationship to stress.", options: ["Social", "Behavioural", "Physiological", "Developmental"] },
                { id: "u1-kc-mc-6", number: 6, prompt: "Researchers training monkeys to use sign language would be considered _____ psychologists.", options: ["social", "behavioural", "physiological", "developmental"] },
                { id: "u1-kc-mc-7", number: 7, prompt: "Researchers in this branch of psychology may study the phenomena of remembering and forgetting.", options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"] },
                { id: "u1-kc-mc-8", number: 8, prompt: "These psychologists might conduct research into the causes of anxiety attacks and post-traumatic stress disorder (PTSD).", options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"] },
                { id: "u1-kc-mc-9", number: 9, prompt: "A person in this field may look for energy traces or patterns of ghosts and apparitions.", options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"] },
                { id: "u1-kc-mc-10", number: 10, prompt: "This type of psychologist might use group therapy to help people with addictions.", options: ["Clinical", "Cognitive", "Abnormal", "Parapsychology"] },
                { id: "u1-kc-mc-11", number: 11, prompt: "Generally speaking, children and intellectually disabled adults cannot be hypnotized because they", options: ["do not trust others sufficiently", "do not have any serious problems", "are not as intelligent as healthy adults", "are not able to focus and concentrate sufficiently"] },
                { id: "u1-kc-mc-12", number: 12, prompt: "The independent (or manipulated) variable in Case Study A is", options: ["sailors at sea", "Jell-O colour", "time away from port", "satisfaction level of the sailors"] },
                { id: "u1-kc-mc-13", number: 13, prompt: "The dependent (or responding) variable in Case Study A is", options: ["sailors at sea", "Jell-O colour", "time away from port", "satisfaction level of the sailors"] },
                { id: "u1-kc-mc-14", number: 14, prompt: "The independent (or manipulated) variable in Case Study B is the", options: ["amount of popcorn Brad ate", "amount of weight Brad was thought to bench press", "level of hunger Brad was experiencing during the movie", "type of movie Brad was watching while eating the popcorn"] },
                { id: "u1-kc-mc-15", number: 15, prompt: "The dependent (or responding) variable in Case Study B is", options: ["amount of popcorn Brad ate", "amount of weight Brad was thought to bench press", "level of hunger Brad was experiencing during the movie", "type of movie Brad was watching while eating the popcorn"] },
                { id: "u1-kc-mc-16", number: 16, prompt: "The difference between a control group and an experimental group is that the _____ group is exposed to the _____ variable.", options: ["control; dependent", "control; independent", "experimental; dependent", "experimental; independent"] },
                { id: "u1-kc-mc-17", number: 17, prompt: "Which of the following experiments would require a control group?", options: ["Determining which gender moves their hands more when giving a speech.", "Testing to see if mnemonics help people remember grocery lists.", "Investigating if healthy 5 year-old males have better balance than healthy 50 year-old males.", "Exploring who has better hand-eye coordination, left-handed women or right-handed women."] },
                { id: "u1-kc-mc-18", number: 18, prompt: "The formal term for a predicted outcome of an experiment is a(n)", options: ["theory", "hypothesis", "assumption", "supposition"] },
                { id: "u1-kc-mc-19", number: 19, prompt: "The independent (manipulated) variable in Case Study C is the", options: ["flavours of jelly beans", "arrangement of jelly beans", "number of jelly beans consumed", "orientation of the university students"] },
                { id: "u1-kc-mc-20", number: 20, prompt: "The dependent (responding) variable in Case Study C is the", options: ["flavours of jelly beans", "arrangement of jelly beans", "number of jelly beans consumed", "orientation of the university students"] }
            ],
            caseStudies: {
                a: [
                    "Billy, a galley cook on a Navy ship, was facing daily complaints from the crew about the lemon Jell-O he was serving. Because of an ordering error, lemon was the only flavour of Jell-O purchased for consumption during the four-month exercise. There was no cherry Jell-O and the crew was unhappy.",
                    "Because the ship was not going to be in port for another two months, Billy had to act in a creative manner: he added red food colouring to the lemon Jell-O. When the red-coloured lemon Jell-O was served to the sailors, no one complained."
                ],
                b: [
                    "One hundred forty male college students were asked to read a summary of a fictitious date between Brad and Barb. The students were divided into two groups of 70 people each. The only difference in the descriptions each group received was the amount of popcorn Brad ate during the movie.",
                    "In one version Brad ate only a couple of handfuls. In the other version he ate almost all of his popcorn. Researchers then asked the two groups how much weight they thought Brad could bench press."
                ],
                c: [
                    "A group of students starting university were treated to a movie and given popcorn as part of their orientation experience. Before the movie began, the students were also offered jelly beans. Half were presented jelly beans in a tray divided into six sections, with each flavour kept separate.",
                    "The other half were offered the jelly beans in a mixed container. Researchers calculated the average number of jelly beans taken by individuals in the two groups. When the flavours were separated, students took an average of 12 jelly beans. When the assortment was mixed, students took an average of 23."
                ],
                d: [
                    "The same researchers for Case Study C decided to try an experiment using M&M's candy. With M&M's, the taste of each piece of candy is the same regardless of colour. In this experiment, a group of students were given M&M's to snack on while watching a video.",
                    "Half of the students were given bowls that had 7 colours of candy while the remaining students were given bowls that had 10 colours. Students who had 7 colours of M&M's ate an average of 56 pieces. Those who had 10 colours ate an average of 99 pieces."
                ],
                e: [
                    "Surgeries occur every minute of every day. Some operations require patients to receive only local anaesthetic while others require patients to be under general anaesthetic. Anaesthesiologists must use patient data such as age, mass, and allergies in their calculations of how much general anaesthetic to use for a given patient.",
                    "Researcher Daniel Sessler believes the gene that produces red pigment also produces a hormone that increases pain sensitivity. He hypothesizes that people with red hair feel pain more intensely than people with brown hair. To test this theory, Dr. Sessler enlisted ten women with dark brown hair and ten women with red hair, then adjusted anaesthetic gas exposure while monitoring reaction to a mild electric shock.",
                    "Results showed that the subjects with red hair needed 20% more anaesthetic than subjects with brown hair."
                ]
            },
            trueFalseQuestions: [
                "To be hypnotized, a person must have a disorder such as an addiction or chronic pain.",
                "You cannot easily observe covert behaviour.",
                "Data collected in an experiment is called empirical evidence.",
                "The unqualified use of hypnosis may disguise serious problems and delay proper treatment.",
                "The Canadian Council on Animal Care monitors all animal research that occurs in Canada.",
                "The Canadian Council on Animal Care can influence the research funding a university receives from the government.",
                "Developmental psychology is concerned with how humans evolved from the apes.",
                "Brushing your teeth after lunch is an abnormal behaviour.",
                "Social psychology involves the influences people have on each other.",
                "Extraneous factors add scientific merit to an experiment."
            ],
            writtenResponseQuestions: [
                { id: "u1-kc-wr-1", number: 1, prompt: "What is an overt behaviour? Provide an original example.", placeholder: "Define overt behaviour and give your own example." },
                { id: "u1-kc-wr-2", number: 2, prompt: "What is a covert behaviour? Provide an original example.", placeholder: "Define covert behaviour and give your own example." },
                { id: "u1-kc-wr-3", number: 3, prompt: "Explain why the researchers would need to use participants that liked chocolate and who were not colour-blind.", placeholder: "Explain why both conditions matter for the M&M's case study." },
                { id: "u1-kc-wr-4", number: 4, prompt: "The M&M's Case Study implies that increased variety can increase food consumption. Provide one reason why a person might want to encourage increased food consumption.", placeholder: "Give one practical reason and explain it." },
                { id: "u1-kc-wr-5", number: 5, prompt: "What is the independent (manipulated) variable?", placeholder: "Name what was changed in Case Study E." },
                { id: "u1-kc-wr-6", number: 6, prompt: "What is the dependent (responding) variable?", placeholder: "Name what was measured in Case Study E." },
                { id: "u1-kc-wr-7", number: 7, prompt: "The women in this study were aware they were going to be shocked. If dogs were used instead of people, they would not understand they would not be severely or permanently hurt. In your opinion, would it be acceptable to conduct a similar test on dogs? Would it matter if the knowledge gained from the experiment would help veterinarians perform surgery on dogs in the future? Explain.", placeholder: "Explain your position on the ethics of the study." }
            ]
        };

        function escapeHtml(value) {
            return String(value)
                .replaceAll("&", "&amp;")
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll('"', "&quot;")
                .replaceAll("'", "&#39;");
        }

        function renderCaseStudyBlock(label, paragraphs) {
            return `
                <div class="practice-panel mb-6">
                    <h4 class="text-xl font-bold text-slate-800 mb-3">Case Study ${escapeHtml(label)}</h4>
                    <div class="space-y-3 text-sm text-slate-700 leading-relaxed">
                        ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                    </div>
                </div>
            `;
        }

        function renderMultipleChoiceQuestion(question) {
            return `
                <div class="quiz-q bg-white p-5 rounded-xl border border-slate-200">
                    <p class="font-semibold text-slate-800 mb-4">${question.number}. ${escapeHtml(question.prompt)}</p>
                    <div class="space-y-3">
                        ${question.options.map((option, index) => {
                            const letter = String.fromCharCode(65 + index);
                            return `
                                <label class="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-slate-50">
                                    <input type="radio" name="${question.id}" value="${letter}" data-persist-key="${question.id}" class="form-radio text-blue-600 mt-1">
                                    <span class="text-sm text-slate-700"><strong>${letter}.</strong> ${escapeHtml(option)}</span>
                                </label>
                            `;
                        }).join("")}
                    </div>
                </div>
            `;
        }

        function renderTrueFalseQuestion(statement, index) {
            const persistKey = `u1-kc-tf-${index + 1}`;
            return `
                <div class="quiz-q bg-white p-4 rounded border border-gray-200">
                    <p class="font-semibold mb-2">${index + 1}. ${escapeHtml(statement)}</p>
                    <div class="flex gap-6">
                        <label class="flex items-center gap-2">
                            <input type="radio" name="${persistKey}" value="T" data-persist-key="${persistKey}" class="form-radio text-blue-600">
                            <span>True</span>
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" name="${persistKey}" value="F" data-persist-key="${persistKey}" class="form-radio text-blue-600">
                            <span>False</span>
                        </label>
                    </div>
                </div>
            `;
        }

        function renderWrittenResponseQuestion(question) {
            return `
                <div class="practice-panel">
                    <label class="block text-sm font-semibold text-slate-700 mb-2">${question.number}. ${escapeHtml(question.prompt)}</label>
                    <textarea class="workbook-input min-h-[130px]" data-persist-key="${question.id}" placeholder="${escapeHtml(question.placeholder)}"></textarea>
                </div>
            `;
        }

        function renderUnit1KnowledgeCheck() {
            const root = document.getElementById("unit1-knowledge-check-root");
            if (!root) {
                return;
            }

            const baseMultipleChoice = unit1KnowledgeCheckData.multipleChoiceQuestions.slice(0, 11);
            const caseStudyAQuestions = unit1KnowledgeCheckData.multipleChoiceQuestions.slice(11, 13);
            const caseStudyBQuestions = unit1KnowledgeCheckData.multipleChoiceQuestions.slice(13, 18);
            const caseStudyCQuestions = unit1KnowledgeCheckData.multipleChoiceQuestions.slice(18);
            const writtenIntroQuestions = unit1KnowledgeCheckData.writtenResponseQuestions.slice(0, 2);
            const caseStudyDQuestions = unit1KnowledgeCheckData.writtenResponseQuestions.slice(2, 4);
            const caseStudyEQuestions = unit1KnowledgeCheckData.writtenResponseQuestions.slice(4);

            root.innerHTML = `
                <div class="clay-card p-6">
                    <div class="flex items-start gap-4 mb-5">
                        <div class="activity-number">1</div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800">Part One: Multiple-Choice Items</h3>
                            <p class="text-slate-600">${escapeHtml(unit1KnowledgeCheckData.multipleChoiceIntro)}</p>
                        </div>
                    </div>
                    <div class="grid xl:grid-cols-2 gap-4">
                        ${baseMultipleChoice.map(renderMultipleChoiceQuestion).join("")}
                    </div>
                    <div class="mt-8">
                        ${renderCaseStudyBlock("A", unit1KnowledgeCheckData.caseStudies.a)}
                        <div class="grid xl:grid-cols-2 gap-4">
                            ${caseStudyAQuestions.map(renderMultipleChoiceQuestion).join("")}
                        </div>
                    </div>
                    <div class="mt-8">
                        ${renderCaseStudyBlock("B", unit1KnowledgeCheckData.caseStudies.b)}
                        <div class="grid xl:grid-cols-2 gap-4">
                            ${caseStudyBQuestions.map(renderMultipleChoiceQuestion).join("")}
                        </div>
                    </div>
                    <div class="mt-8">
                        ${renderCaseStudyBlock("C", unit1KnowledgeCheckData.caseStudies.c)}
                        <div class="grid xl:grid-cols-2 gap-4">
                            ${caseStudyCQuestions.map(renderMultipleChoiceQuestion).join("")}
                        </div>
                    </div>
                </div>

                <div class="clay-card p-6">
                    <div class="flex items-start gap-4 mb-5">
                        <div class="activity-number">2</div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800">Part Two: True or False</h3>
                            <p class="text-slate-600">Read each item carefully and choose whether the statement is true or false.</p>
                        </div>
                    </div>
                    <div class="grid xl:grid-cols-2 gap-4">
                        ${unit1KnowledgeCheckData.trueFalseQuestions.map(renderTrueFalseQuestion).join("")}
                    </div>
                </div>

                <div class="clay-card p-6">
                    <div class="flex items-start gap-4 mb-5">
                        <div class="activity-number">3</div>
                        <div>
                            <h3 class="text-2xl font-bold text-slate-800">Part Three: Written-Response Items</h3>
                            <p class="text-slate-600">Respond to the following items using what you learned from the teaching sections above.</p>
                        </div>
                    </div>
                    <div class="space-y-6">
                        ${writtenIntroQuestions.map(renderWrittenResponseQuestion).join("")}
                    </div>
                    <div class="mt-8">
                        ${renderCaseStudyBlock("D", unit1KnowledgeCheckData.caseStudies.d)}
                        <div class="space-y-6">
                            ${caseStudyDQuestions.map(renderWrittenResponseQuestion).join("")}
                        </div>
                    </div>
                    <div class="mt-8">
                        ${renderCaseStudyBlock("E", unit1KnowledgeCheckData.caseStudies.e)}
                        <div class="space-y-6">
                            ${caseStudyEQuestions.map(renderWrittenResponseQuestion).join("")}
                        </div>
                    </div>
                    <div class="workbook-note mt-6">
                        <p class="text-sm"><strong>Hand-in note:</strong> This final section mirrors the real student knowledge-check PDF. The textbook module above teaches the content; this block is the submission layer.</p>
                    </div>
                </div>
            `;
        }

        function persistWorkbookFields() {
            const data = {};

            document.querySelectorAll("[data-persist-key]").forEach((field) => {
                const key = field.dataset.persistKey;
                if (!key) {
                    return;
                }

                if (field.type === "radio") {
                    if (field.checked) {
                        data[key] = field.value;
                    }
                    return;
                }

                if (field.type === "checkbox") {
                    if (!Array.isArray(data[key])) {
                        data[key] = [];
                    }

                    if (field.checked) {
                        data[key].push(field.value);
                    }
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
                    if (field.type === "radio") {
                        field.checked = saved[key] === field.value;
                    } else if (field.type === "checkbox") {
                        field.checked = Array.isArray(saved[key]) && saved[key].includes(field.value);
                    } else {
                        field.value = saved[key];
                    }
                }

                const eventName = field.type === "radio" || field.type === "checkbox" ? "change" : "input";
                field.addEventListener(eventName, persistWorkbookFields);
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

        function checkHistoryTimelineActivity() {
            const expectedChronology = {
                "history-chrono-1": "1",
                "history-chrono-2": "2",
                "history-chrono-3": "3",
                "history-chrono-4": "4",
                "history-chrono-5": "5"
            };

            const unanswered = [];
            const wrong = [];
            const selectedValues = [];

            Object.entries(expectedChronology).forEach(([id, expected], index) => {
                const field = document.getElementById(id);
                if (!field || !field.value) {
                    unanswered.push(index + 1);
                    return;
                }

                selectedValues.push(field.value);
                if (field.value !== expected) {
                    wrong.push(index + 1);
                }
            });

            const duplicates = selectedValues.filter((value, index) => selectedValues.indexOf(value) !== index);

            if (unanswered.length) {
                setActivityResult("history-timeline-results", "warning", `Complete the full timeline first. Missing items: ${unanswered.join(", ")}.`);
                return;
            }

            if (duplicates.length) {
                const uniqueDuplicates = Array.from(new Set(duplicates)).sort();
                setActivityResult("history-timeline-results", "warning", `Your order has duplicate values: ${uniqueDuplicates.join(", ")}. Each step needs a unique rank.`);
                return;
            }

            if (!wrong.length) {
                setActivityResult("history-timeline-results", "success", "Correct timeline. You captured the shift from philosophy to formal science in the right order.");
                return;
            }

            setActivityResult("history-timeline-results", "error", `The sequence still needs fixes. Recheck items: ${wrong.join(", ")}.`);
        }

        function checkSchoolsMatchActivity() {
            const schoolAnswerKey = {
                "school-match-1": "psychoanalysis",
                "school-match-2": "behaviourism",
                "school-match-3": "humanism",
                "school-match-4": "eclectic",
                "school-match-5": "psychoanalysis",
                "school-match-6": "humanism"
            };

            const unanswered = [];
            const wrong = [];

            Object.entries(schoolAnswerKey).forEach(([id, expected], index) => {
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
                setActivityResult("school-match-results", "warning", `Finish every school match before checking. Still open: ${unanswered.join(", ")}.`);
                return;
            }

            if (!wrong.length) {
                setActivityResult("school-match-results", "success", "6/6. The schools map matches the course material.");
                return;
            }

            setActivityResult("school-match-results", "error", `You still have school match errors on items ${wrong.join(", ")}.`);
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

        function gradeFieldActivity(answerKey) {
            const unanswered = [];
            const wrong = [];
            let score = 0;

            Object.entries(answerKey).forEach(([id, expected], index) => {
                const field = document.getElementById(id);
                const value = field && typeof field.value === "string" ? field.value.trim() : "";
                if (!value) {
                    unanswered.push(index + 1);
                    return;
                }

                if (value === expected) {
                    score += 1;
                    return;
                }

                wrong.push(index + 1);
            });

            return {
                score,
                unanswered,
                wrong,
                total: Object.keys(answerKey).length
            };
        }

        function reportFieldActivity(resultId, result, messages) {
            if (result.unanswered.length) {
                setActivityResult(resultId, "warning", `${messages.completeFirst} ${result.unanswered.join(", ")}.`);
                return;
            }

            if (!result.wrong.length) {
                setActivityResult(resultId, "success", messages.success);
                return;
            }

            if (result.wrong.length <= messages.closeThreshold) {
                setActivityResult(resultId, "warning", `${messages.close} ${result.wrong.join(", ")}.`);
                return;
            }

            setActivityResult(resultId, "error", `${messages.retry} ${result.wrong.join(", ")}.`);
        }

        function checkUnit2StrategyActivity() {
            const result = gradeFieldActivity({
                "u2-strategy-1": "distributed-practice",
                "u2-strategy-2": "overlearning",
                "u2-strategy-3": "negative-transfer",
                "u2-strategy-4": "intensity",
                "u2-strategy-5": "mnemonic-device",
                "u2-strategy-6": "insight"
            });

            reportFieldActivity("u2-strategy-results", result, {
                completeFirst: "Finish every strategy match before checking. Missing items:",
                success: "Good. You matched the learning obstacle or support to the right principle instead of treating the unit like a list of terms.",
                close: "A few strategy matches need another look. Recheck items",
                retry: "Several strategy matches are still off. Revisit items",
                closeThreshold: 2
            });
        }

        function checkUnit2HabitActivity() {
            const result = gradeFieldActivity({
                "u2-habit-1": "classical-conditioning",
                "u2-habit-2": "operant-conditioning",
                "u2-habit-3": "negative-reinforcement",
                "u2-habit-4": "punishment",
                "u2-habit-5": "visual-learning"
            });

            reportFieldActivity("u2-habit-results", result, {
                completeFirst: "Finish every habit-builder choice before checking. Missing items:",
                success: "Good. You can now distinguish conditioning, reinforcement logic, punishment, and study preference without collapsing them into one idea.",
                close: "You are close. Recheck habit-builder items",
                retry: "Some habit-builder choices still need correction. Revisit items",
                closeThreshold: 1
            });
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
            renderUnit1KnowledgeCheck();
            initializeWorkbookFields();
            switchModule(null, 'mod-1');
        }

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", initializeGenPsychStudio);
        } else {
            initializeGenPsychStudio();
        }
