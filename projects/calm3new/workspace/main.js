/* inline script 1 */
const sections = [
            { id: 'intro', title: '1. Introduction', icon: 'book-open' },
            { id: 'attitude', title: '2. Attitude & Learning', icon: 'smile' },
            { id: 'trends', title: '3. Life/Work Trends', icon: 'target' },
            { id: 'smart_goals', title: '4. SMART Goals', icon: 'crosshair' },
            { id: 'decision_making', title: '5. Decision Making', icon: 'git-branch-plus' },
            { id: 'career_prep', title: '6. Transferable Skills', icon: 'sparkles' },
            { id: 'job_search', title: '7. Job Search Toolkit', icon: 'briefcase' },
            { id: 'workplace_safety', title: '8. Employment Rights', icon: 'shield-check' }
        ];

        let activeSection = 'intro';
        let progress = {
            intro: false,
            attitude: false,
            trends: false,
            smart_goals: false,
            decision_making: false,
            career_prep: false,
            job_search: false,
            workplace_safety: false
        };
        const progressTemplate = { ...progress };

        const contentArea = document.getElementById('content-area');
        const navLinks = document.getElementById('nav-links');
        const progressBar = document.getElementById('progress-bar');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebarTitle = document.getElementById('sidebar-title');
        const sidebarSubtitle = document.getElementById('sidebar-subtitle');
        const progressWrap = document.getElementById('progress-wrap');
        const mobileQuery = window.matchMedia('(max-width: 767px)');
        let sidebarCollapsed = false;
        let mobileMenuOpen = false;
        let smartGoalTrack = 'school';
        const feelingOptions = [
            'Scared / anxious',
            'Frustrated',
            'Unsure',
            'Curious',
            'Motivated / excited',
            'Confident',
            'Proud'
        ];
        const attitudeTypeOptions = [
            'Positive',
            'Negative',
            'Mixed / changing'
        ];
        const impactOptions = [
            'Slowed learning',
            'Needed more practice and support',
            'Increased effort and focus',
            'Made learning easier/faster',
            'Built confidence over time',
            'Led to deeper participation'
        ];
        const learningStyles = [
            {
                id: 'visual',
                label: 'Visual Learner',
                traits: [
                    'I like to read and see things in writing.',
                    'I remember faces but often forget names.',
                    'I need a quiet place to study.',
                    'I enjoy maps, charts, and diagrams.',
                    'I am good at spelling.'
                ]
            },
            {
                id: 'auditory',
                label: 'Auditory Learner',
                traits: [
                    'I learn best by listening.',
                    'I remember names but often forget faces.',
                    'I like to talk things through.',
                    'I am easily distracted by noise.',
                    'I follow spoken directions better than written ones.'
                ]
            },
            {
                id: 'kinesthetic',
                label: 'Kinesthetic Learner',
                traits: [
                    'I learn best by doing and being active.',
                    'I have trouble sitting still for long periods.',
                    'I like to move around while I am learning.',
                    'I often tap my pencil or fidget while studying.',
                    'I remember things by actually doing them.'
                ]
            }
        ];
        const smartGoalExamples = {
            school: [
                'Better grades',
                'Organization',
                'Social relationships',
                'Extracurricular goals'
            ],
            life: [
                'Moving out of your parents place',
                'Buying a car',
                'Travelling',
                'Finding a job',
                'Going to college or university',
                'Taking a year off to save money',
                'Volunteering to gain experience'
            ]
        };
        const STORAGE_KEY = 'calm3new::workspace-state::v1';
        let appState = loadAppState();
        appState.responses = appState.responses ?? {};
        progress = { ...progress, ...(appState.progress ?? {}) };
        activeSection = sections.some(section => section.id === appState.activeSection) ? appState.activeSection : activeSection;
        smartGoalTrack = appState.smartGoalTrack === 'life' ? 'life' : smartGoalTrack;
        sidebarCollapsed = typeof appState.sidebarCollapsed === 'boolean' ? appState.sidebarCollapsed : sidebarCollapsed;

        function init() {
            renderNav();
            renderSection();
            lucide.createIcons();
            initUtilityActions();
            updateProgress();
            
            prevBtn.addEventListener('click', () => navigate(-1));
            nextBtn.addEventListener('click', () => {
                progress[activeSection] = true;
                updateProgress();
                saveAppState();
                navigate(1);
            });
            contentArea.addEventListener('input', handleFieldInput);
            contentArea.addEventListener('change', handleFieldInput);
            sidebarToggle.addEventListener('click', () => {
                if (mobileQuery.matches) {
                    mobileMenuOpen = !mobileMenuOpen;
                } else {
                    sidebarCollapsed = !sidebarCollapsed;
                }
                applySidebarState();
                renderNav();
                saveAppState();
            });
            mobileQuery.addEventListener('change', () => {
                if (!mobileQuery.matches) {
                    mobileMenuOpen = false;
                }
                applySidebarState();
                renderNav();
            });
            applySidebarState();
        }

        function navigate(dir) {
            const idx = sections.findIndex(s => s.id === activeSection);
            const newIdx = idx + dir;
            if (newIdx >= 0 && newIdx < sections.length) {
                activeSection = sections[newIdx].id;
                renderNav();
                renderSection();
                updateProgress();
                saveAppState();
                window.scrollTo(0, 0);
            }
        }

        function renderNav() {
            navLinks.innerHTML = sections.map(s => `
                <button onclick="changeSection('${s.id}')" class="flex items-center ${(sidebarCollapsed && !mobileQuery.matches) ? 'justify-center' : ''} gap-3 p-3.5 rounded-xl transition-all text-left group ${activeSection === s.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'hover:bg-indigo-50 text-slate-600'}" title="${s.title}">
                    <i data-lucide="${s.icon}" class="w-5 h-5 ${activeSection === s.id ? 'text-white' : 'text-indigo-500 group-hover:text-indigo-600'}"></i>
                    ${(sidebarCollapsed && !mobileQuery.matches) ? '' : `<span class="font-bold flex-1 text-sm">${s.title}</span>`}
                    ${progress[s.id] && !(sidebarCollapsed && !mobileQuery.matches) ? '<i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-400"></i>' : ''}
                </button>
            `).join('');
            lucide.createIcons();

            prevBtn.disabled = activeSection === sections[0].id;
            nextBtn.innerHTML = activeSection === sections[sections.length - 1].id ? 'Finish Module' : 'Mark Done & Continue <i data-lucide="chevron-right" class="w-4 h-4"></i>';
            lucide.createIcons();
        }

        function applySidebarState() {
            const isMobile = mobileQuery.matches;
            const desktopCollapsed = sidebarCollapsed && !isMobile;

            sidebar.classList.toggle('sidebar-collapsed', desktopCollapsed);
            sidebar.classList.toggle('md:w-20', desktopCollapsed);
            sidebar.classList.toggle('md:w-80', !desktopCollapsed);

            if (isMobile) {
                sidebarTitle.classList.remove('hidden');
                sidebarSubtitle.classList.remove('hidden');
                navLinks.classList.toggle('hidden', !mobileMenuOpen);
                progressWrap.classList.toggle('hidden', !mobileMenuOpen);
                sidebarToggle.setAttribute('aria-label', mobileMenuOpen ? 'Close menu' : 'Open menu');
                sidebarToggle.setAttribute('title', mobileMenuOpen ? 'Close menu' : 'Open menu');
                sidebarToggle.innerHTML = mobileMenuOpen
                    ? '<i data-lucide="x" class="w-4 h-4"></i>'
                    : '<i data-lucide="menu" class="w-4 h-4"></i>';
            } else {
                navLinks.classList.remove('hidden');
                sidebarTitle.classList.toggle('hidden', desktopCollapsed);
                sidebarSubtitle.classList.toggle('hidden', desktopCollapsed);
                progressWrap.classList.toggle('hidden', desktopCollapsed);
                sidebarToggle.setAttribute('aria-label', desktopCollapsed ? 'Expand menu' : 'Collapse menu');
                sidebarToggle.setAttribute('title', desktopCollapsed ? 'Expand menu' : 'Collapse menu');
                sidebarToggle.innerHTML = desktopCollapsed
                    ? '<i data-lucide="panel-left-open" class="w-4 h-4"></i>'
                    : '<i data-lucide="panel-left-close" class="w-4 h-4"></i>';
            }
            lucide.createIcons();
        }

        function renderLearningStyleCards() {
            return learningStyles.map(style => `
                <div class="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <h4 class="text-xl font-black uppercase tracking-tighter mb-2">${style.label}</h4>
                    <p class="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Matches: <span id="style-count-${style.id}">0</span> / ${style.traits.length}</p>
                    <div class="space-y-3">
                        ${style.traits.map(trait => `
                            <button onclick="toggleTrait(this)" data-style="${style.id}" class="w-full text-left p-4 rounded-2xl text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100 hover:border-slate-300 transition-all flex items-center gap-3">
                                <div class="w-4 h-4 rounded bg-white border border-slate-300 flex-shrink-0"></div>
                                ${trait}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }

        function updateLearningStyleSummary() {
            const counts = {};
            for (const style of learningStyles) {
                const selected = document.querySelectorAll(`[data-style="${style.id}"].bg-indigo-600`).length;
                counts[style.id] = selected;
                const countEl = document.getElementById(`style-count-${style.id}`);
                if (countEl) {
                    countEl.textContent = String(selected);
                }
            }

            const summaryEl = document.getElementById('style-summary-text');
            const bridgeEl = document.getElementById('style-bridge-text');
            if (!summaryEl || !bridgeEl) {
                return;
            }

            const leaderboard = learningStyles.map(style => ({
                id: style.id,
                label: style.label,
                count: counts[style.id] ?? 0
            }));
            const topScore = Math.max(...leaderboard.map(item => item.count));

            if (topScore === 0) {
                summaryEl.textContent = 'Select the traits that match you to discover your likely learning style.';
                bridgeEl.textContent = 'A positive attitude helps you stay open, practice consistently, and use any learning style more effectively.';
                return;
            }

            const leaders = leaderboard.filter(item => item.count === topScore);
            if (leaders.length === 1) {
                summaryEl.textContent = `Your strongest style right now appears to be ${leaders[0].label} (${topScore}/5).`;
                bridgeEl.textContent = `When your attitude is positive, you can use ${leaders[0].label.toLowerCase()} strategies more effectively and keep improving.`;
                return;
            }

            const mixedLabel = leaders.map(item => item.label).join(' and ');
            summaryEl.textContent = `You show a mixed profile: ${mixedLabel} (${topScore}/5).`;
            bridgeEl.textContent = 'A positive attitude helps you combine multiple learning styles and adapt to different tasks.';
        }

        function buildSelect(options, placeholder, selected = '', disabled = false) {
            const optionMarkup = [`<option value="">${placeholder}</option>`, ...options.map((option) => {
                const selectedFlag = option === selected ? ' selected' : '';
                return `<option value="${option}"${selectedFlag}>${option}</option>`;
            })].join('');
            const disabledAttr = disabled ? ' disabled' : '';
            const classes = disabled
                ? 'w-full min-w-[150px] bg-white border border-indigo-200 rounded-xl p-3 text-sm text-slate-700'
                : 'w-full min-w-[150px] bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none';

            return `<select class="${classes}"${disabledAttr}>${optionMarkup}</select>`;
        }

        function renderSmartGoalBuilder(track, title, ideas) {
            return `
                <div id="smart-goal-panel-${track}" class="${track === smartGoalTrack ? '' : 'hidden '}rounded-[2rem] border border-white/10 bg-white/5 p-6">
                    <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">${title}</p>
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                        ${ideas.map(item => `
                            <div class="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-slate-100">${item}</div>
                        `).join('')}
                    </div>
                    <label class="block text-sm font-black uppercase tracking-widest text-slate-300 mb-3">State Your General Goal</label>
                    <input type="text" class="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Write your general goal here...">
                </div>
            `;
        }

        function setSmartGoalTrack(track) {
            smartGoalTrack = track;
            saveAppState();

            const buttons = document.querySelectorAll('[data-smart-track-button]');
            const panels = document.querySelectorAll('[data-smart-track-panel]');

            buttons.forEach((button) => {
                const isActive = button.dataset.smartTrackButton === track;
                button.className = `px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isActive ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`;
            });

            panels.forEach((panel) => {
                panel.classList.toggle('hidden', panel.dataset.smartTrackPanel !== track);
            });
        }

        function changeSection(id) {
            activeSection = id;
            if (mobileQuery.matches) {
                mobileMenuOpen = false;
            }
            applySidebarState();
            renderNav();
            renderSection();
            updateProgress();
            saveAppState();
            window.scrollTo(0, 0);
        }

        function updateProgress() {
            const completed = Object.values(progress).filter(Boolean).length;
            const percentage = (completed / sections.length) * 100;
            progressBar.style.width = percentage + '%';
        }

        function loadAppState() {
            try {
                const raw = window.localStorage.getItem(STORAGE_KEY);
                return raw ? JSON.parse(raw) : {};
            } catch (error) {
                return {};
            }
        }

        function saveAppState() {
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    activeSection,
                    progress,
                    smartGoalTrack,
                    sidebarCollapsed,
                    responses: appState.responses
                }));
            } catch (error) {
                // Ignore storage failures in embedded/private contexts.
            }
        }

        function initUtilityActions() {
            const footerNav = document.getElementById('footer-nav');
            if (!footerNav || document.getElementById('print-report-btn')) {
                return;
            }

            footerNav.classList.add('flex-wrap', 'gap-4');

            const actionWrap = document.createElement('div');
            actionWrap.className = 'flex items-center gap-3 order-last md:order-none';
            actionWrap.innerHTML = `
                <button id="reset-responses-btn" type="button" class="px-4 py-3 rounded-2xl border border-slate-200 bg-white text-slate-600 font-black text-xs uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 transition-all">
                    Reset
                </button>
                <button id="print-report-btn" type="button" class="px-4 py-3 rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">
                    Print Report
                </button>
            `;

            footerNav.insertBefore(actionWrap, nextBtn);
            document.getElementById('reset-responses-btn').addEventListener('click', resetResponses);
            document.getElementById('print-report-btn').addEventListener('click', printReport);
        }

        function handleFieldInput(event) {
            const field = event.target;
            if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
                return;
            }

            if (!field.dataset.fieldKey) {
                wireFieldsForCurrentSection();
            }

            storeFieldValue(field);
        }

        function wireFieldsForCurrentSection() {
            const section = sections.find(item => item.id === activeSection);
            const fields = contentArea.querySelectorAll('input, textarea, select');

            fields.forEach((field, index) => {
                const key = `${activeSection}::${index}`;
                const label = deriveFieldLabel(field, index);

                field.dataset.fieldKey = key;
                field.dataset.fieldLabel = label;
                field.dataset.sectionId = activeSection;
                field.dataset.sectionTitle = section ? section.title : activeSection;

                restoreFieldValue(field);
            });
        }

        function wireInteractiveControls() {
            const section = sections.find(item => item.id === activeSection);
            const traitButtons = contentArea.querySelectorAll('[data-style]');

            traitButtons.forEach((button, index) => {
                const key = `${activeSection}::trait::${button.dataset.style || 'style'}::${index}`;
                const labelText = String(button.textContent || '').replace(/\s+/g, ' ').trim();

                button.dataset.fieldKey = key;
                button.dataset.fieldLabel = `Learning trait: ${labelText}`;
                button.dataset.sectionId = activeSection;
                button.dataset.sectionTitle = section ? section.title : activeSection;

                const record = appState.responses[key];
                applyTraitVisualState(button, Boolean(record && record.value));
            });

            if (traitButtons.length) {
                updateLearningStyleSummary();
            }
        }

        function applyTraitVisualState(button, isActive) {
            const check = button.querySelector('div');
            if (!check) {
                return;
            }

            if (isActive) {
                button.classList.add('bg-indigo-600', 'text-white', 'border-indigo-600', 'shadow-lg');
                button.classList.remove('bg-slate-50', 'text-slate-600', 'border-slate-100');
                check.innerHTML = '<div class="w-full h-full bg-indigo-600 border-2 border-white rounded-sm"></div>';
                return;
            }

            button.classList.remove('bg-indigo-600', 'text-white', 'border-indigo-600', 'shadow-lg');
            button.classList.add('bg-slate-50', 'text-slate-600', 'border-slate-100');
            check.innerHTML = '';
        }

        function deriveFieldLabel(field, index) {
            const clean = (value) => String(value || '').replace(/\s+/g, ' ').trim();

            if ((field.type === 'checkbox' || field.type === 'radio') && field.closest('.application-availability')) {
                const availability = field.closest('.application-availability');
                const checkboxFields = Array.from(availability.querySelectorAll('.application-availability__cell input'));
                const availabilityIndex = checkboxFields.indexOf(field);
                if (availabilityIndex >= 0) {
                    const rows = ['Day', 'Evening', 'Night'];
                    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    const row = Math.floor(availabilityIndex / days.length);
                    const column = availabilityIndex % days.length;
                    return `Availability: ${rows[row]} ${days[column]}`;
                }
            }

            if (field.type === 'checkbox' || field.type === 'radio') {
                const optionLabel = field.closest('label');
                const optionText = optionLabel ? clean(optionLabel.textContent) : '';
                const groupLabel = field.closest('.application-field')?.querySelector('.application-label');
                const groupText = groupLabel ? clean(groupLabel.textContent) : '';
                if (optionText && groupText && optionText !== groupText) {
                    return `${groupText}: ${optionText}`;
                }
                if (optionText) {
                    return optionText;
                }
            }

            const applicationLabel = field.closest('.application-field')?.querySelector('.application-label');
            if (applicationLabel) {
                return clean(applicationLabel.textContent);
            }

            const wrappingLabel = field.closest('label');
            if (wrappingLabel) {
                const clone = wrappingLabel.cloneNode(true);
                clone.querySelectorAll('input, textarea, select').forEach((el) => el.remove());
                const text = clean(clone.textContent);
                if (text) {
                    return text.length > 180 ? `${text.slice(0, 177)}...` : text;
                }
            }

            const previous = field.previousElementSibling;
            if (previous) {
                const text = clean(previous.textContent);
                if (text) {
                    return text;
                }
            }

            return clean(field.placeholder || `Response ${index + 1}`);
        }

        function restoreFieldValue(field) {
            const record = appState.responses[field.dataset.fieldKey];
            if (!record) {
                return;
            }

            if (field.type === 'checkbox' || field.type === 'radio') {
                field.checked = Boolean(record.value);
                return;
            }

            field.value = record.value ?? '';
        }

        function storeFieldValue(field) {
            const key = field.dataset.fieldKey;
            if (!key) {
                return;
            }

            const isToggle = field.type === 'checkbox' || field.type === 'radio';
            const rawValue = isToggle ? field.checked : field.value;
            const isEmpty = isToggle ? rawValue === false : String(rawValue || '').trim() === '';

            if (isEmpty) {
                delete appState.responses[key];
            } else {
                appState.responses[key] = {
                    sectionId: field.dataset.sectionId || activeSection,
                    sectionTitle: field.dataset.sectionTitle || activeSection,
                    label: field.dataset.fieldLabel || 'Response',
                    type: field.type || field.tagName.toLowerCase(),
                    value: rawValue
                };
            }

            saveAppState();
        }

        function storeTraitButtonState(button, isActive) {
            const key = button.dataset.fieldKey;
            if (!key) {
                return;
            }

            if (!isActive) {
                delete appState.responses[key];
            } else {
                appState.responses[key] = {
                    sectionId: button.dataset.sectionId || activeSection,
                    sectionTitle: button.dataset.sectionTitle || activeSection,
                    label: button.dataset.fieldLabel || 'Learning trait',
                    type: 'toggle-button',
                    value: 'Selected'
                };
            }

            saveAppState();
        }

        function persistCurrentSectionFields() {
            contentArea.querySelectorAll('input, textarea, select').forEach((field) => {
                if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
                    storeFieldValue(field);
                }
            });
        }

        function resetResponses() {
            if (!window.confirm('Clear all saved responses for this module on this device?')) {
                return;
            }

            appState = { responses: {} };
            progress = { ...progressTemplate };
            activeSection = sections[0].id;
            smartGoalTrack = 'school';
            sidebarCollapsed = false;
            mobileMenuOpen = false;

            try {
                window.localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                // Ignore storage failures.
            }

            applySidebarState();
            renderNav();
            renderSection();
            updateProgress();
            window.scrollTo(0, 0);
        }

        function escapeHtml(value) {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function formatPrintableValue(record) {
            if (record.type === 'checkbox' || record.type === 'radio' || record.type === 'toggle-button') {
                return 'Selected';
            }

            return String(record.value ?? '');
        }

        function getPrintableResponses() {
            return Object.entries(appState.responses)
                .map(([key, record]) => ({ key, ...record }))
                .filter((record) => {
                    if (record.type === 'checkbox' || record.type === 'radio' || record.type === 'toggle-button') {
                        return Boolean(record.value) && !/^Response /.test(record.label || '');
                    }
                    return String(record.value || '').trim() !== '';
                })
                .sort((left, right) => {
                    const leftSection = sections.findIndex((section) => section.id === left.sectionId);
                    const rightSection = sections.findIndex((section) => section.id === right.sectionId);
                    if (leftSection !== rightSection) {
                        return leftSection - rightSection;
                    }

                    const leftParts = String(left.key || '').split('::');
                    const rightParts = String(right.key || '').split('::');
                    const leftIndex = Number(leftParts[leftParts.length - 1] || 0);
                    const rightIndex = Number(rightParts[rightParts.length - 1] || 0);
                    return leftIndex - rightIndex;
                });
        }

        function buildPrintReportDocument(responses, completed) {
            const sectionMarkup = sections.map((section) => {
                const sectionResponses = responses.filter((record) => record.sectionId === section.id);
                if (!sectionResponses.length) {
                    return '';
                }

                return `
                    <section class="report-section">
                        <h2>${escapeHtml(section.title)}</h2>
                        <div class="report-grid">
                            ${sectionResponses.map((record) => `
                                <article class="report-card">
                                    <h3>${escapeHtml(record.label)}</h3>
                                    <div class="report-answer">${escapeHtml(formatPrintableValue(record)).replace(/\n/g, '<br>')}</div>
                                </article>
                            `).join('')}
                        </div>
                    </section>
                `;
            }).join('');

            return `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <title>CALM Module 3 Report</title>
                        <style>
                            body {
                                font-family: Inter, Arial, sans-serif;
                                margin: 0;
                                padding: 2rem;
                                background: #f8fafc;
                                color: #0f172a;
                            }
                            .report-shell {
                                max-width: 960px;
                                margin: 0 auto;
                            }
                            .report-hero {
                                background: linear-gradient(135deg, #312e81, #4f46e5);
                                color: white;
                                border-radius: 2rem;
                                padding: 2rem;
                                margin-bottom: 2rem;
                            }
                            .report-hero p {
                                margin: 0.4rem 0 0;
                                color: #c7d2fe;
                            }
                            .report-meta {
                                display: flex;
                                gap: 1rem;
                                flex-wrap: wrap;
                                margin-top: 1.25rem;
                            }
                            .report-pill {
                                border: 1px solid rgba(255,255,255,0.2);
                                border-radius: 999px;
                                padding: 0.45rem 0.8rem;
                                font-size: 0.78rem;
                                font-weight: 700;
                                letter-spacing: 0.08em;
                                text-transform: uppercase;
                            }
                            .report-section {
                                margin-bottom: 2rem;
                            }
                            .report-section h2 {
                                margin: 0 0 1rem;
                                font-size: 1.5rem;
                                font-weight: 900;
                            }
                            .report-grid {
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                                gap: 1rem;
                            }
                            .report-card {
                                background: white;
                                border: 1px solid #e2e8f0;
                                border-radius: 1.25rem;
                                padding: 1rem 1.1rem;
                                break-inside: avoid;
                            }
                            .report-card h3 {
                                margin: 0 0 0.7rem;
                                font-size: 0.82rem;
                                font-weight: 900;
                                letter-spacing: 0.08em;
                                text-transform: uppercase;
                                color: #475569;
                            }
                            .report-answer {
                                font-size: 0.95rem;
                                line-height: 1.55;
                                color: #0f172a;
                            }
                            @media print {
                                body {
                                    background: white;
                                    padding: 0;
                                }
                                .report-hero {
                                    -webkit-print-color-adjust: exact;
                                    print-color-adjust: exact;
                                }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="report-shell">
                            <header class="report-hero">
                                <h1>CALM Module 3 Report</h1>
                                <p>Career and Life Choices response summary</p>
                                <div class="report-meta">
                                    <span class="report-pill">Generated ${escapeHtml(new Date().toLocaleString())}</span>
                                    <span class="report-pill">Completed sections ${completed}/${sections.length}</span>
                                    <span class="report-pill">Saved responses ${responses.length}</span>
                                </div>
                            </header>
                            ${sectionMarkup}
                        </div>
                    </body>
                </html>
            `;
        }

        function printReport() {
            persistCurrentSectionFields();
            const responses = getPrintableResponses();

            if (!responses.length) {
                window.alert('There is nothing to print yet. Add some responses first.');
                return;
            }

            const completed = Object.values(progress).filter(Boolean).length;
            const printFrame = document.createElement('iframe');
            printFrame.setAttribute('aria-hidden', 'true');
            printFrame.style.position = 'fixed';
            printFrame.style.right = '0';
            printFrame.style.bottom = '0';
            printFrame.style.width = '0';
            printFrame.style.height = '0';
            printFrame.style.border = '0';
            printFrame.style.opacity = '0';
            printFrame.style.pointerEvents = 'none';
            document.body.appendChild(printFrame);

            const cleanup = () => {
                window.setTimeout(() => {
                    if (printFrame.parentNode) {
                        printFrame.parentNode.removeChild(printFrame);
                    }
                }, 0);
            };

            const printWindow = printFrame.contentWindow;
            const printDocument = printFrame.contentDocument || (printWindow ? printWindow.document : null);

            if (!printWindow || !printDocument) {
                cleanup();
                window.alert('Print preview could not be created in this browser context.');
                return;
            }

            printDocument.open();
            printDocument.write(buildPrintReportDocument(responses, completed));
            printDocument.close();

            const runPrint = () => {
                const handleAfterPrint = () => {
                    printWindow.removeEventListener('afterprint', handleAfterPrint);
                    cleanup();
                };

                printWindow.addEventListener('afterprint', handleAfterPrint);
                printWindow.focus();
                window.setTimeout(() => {
                    printWindow.print();
                    window.setTimeout(cleanup, 1000);
                }, 150);
            };

            if (printDocument.readyState === 'complete') {
                runPrint();
            } else {
                printFrame.onload = runPrint;
            }
        }

        function renderSection() {
            switch(activeSection) {
                case 'intro': renderIntro(); break;
                case 'attitude': renderAttitude(); break;
                case 'trends': renderTrends(); break;
                case 'smart_goals': renderSmartGoals(); break;
                case 'decision_making': renderDecisionMaking(); break;
                case 'career_prep': renderCareerPrep(); break;
                case 'job_search': renderJobSearch(); break;
                case 'workplace_safety': renderSafety(); break;
            }
            wireFieldsForCurrentSection();
            wireInteractiveControls();
            lucide.createIcons();
        }

        // --- SECTION RENDERS ---

        function renderIntro() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-2xl relative overflow-hidden">
                        <i data-lucide="quote" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 relative z-10 uppercase tracking-tighter">Oh! The Places You'll Go!</h2>
                        <p class="text-indigo-100 text-xl italic leading-relaxed relative z-10 max-w-2xl">
                            "Congratulations! Today is your day. You're off to Great Places! You're off and away!"
                        </p>
                    </div>

                    <section class="bg-white p-8 md:p-14 rounded-[2.5rem] border border-slate-200 shadow-sm mb-16 text-center">
                        <h3 class="text-xl font-bold text-indigo-700 uppercase tracking-widest mt-8 mb-10">Full Poem — By Dr. Seuss</h3>
                        <div class="space-y-6 text-slate-700 leading-relaxed font-serif text-xl max-w-2xl mx-auto italic">
                            <p>Congratulations! Today is your day. You’re off to Great Places! You’re off and away!</p>
                            <p>You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. You’re on your own. And you know what you know. And YOU are the guy who’ll decide where to go.</p>
                            <p>You’ll look up and down streets. Look’em over with care. About some you will say, “I don’t choose to go there.” With your head full of brains and your shoes full of feet, you’re too smart to go down a not-so-good street.</p>
                            <p>And you may not find any you’ll want to go down. In that case, of course, you’ll head straight out of town. It’s opener there in the wide open air.</p>
                            <p>Out there things can happen and frequently do to people as brainy and footsy as you.</p>
                            <p>And when things start to happen, don’t worry. Don’t stew. Just go right along. You’ll start happening too.</p>
                            <p class="font-black text-indigo-600 text-3xl py-6 non-italic tracking-tighter uppercase">Oh! The Places You’ll Go!</p>
                            <p>You’ll be on your way up! You’ll be seeing great sights! You’ll join the high fliers who soar to high heights.</p>
                            <p>You won’t lag behind, because you’ll have the speed. You’ll pass the whole gang and you’ll soon take the lead. Wherever you fly, you’ll be best of the best. Wherever you go, you will top all the rest.</p>
                            <p class="text-slate-400 italic">Except when you don’t. Because, sometimes, you won’t.</p>
                            <p>I’m sorry to say so but, sadly, it’s true that Bang-ups and Hang-ups can happen to you. You can get all hung up in a prickle-ly perch. And your gang will fly on. You’ll be left in a Lurch.</p>
                            <p>You’ll come down from the Lurch with an unpleasant bump. And the chances are, then, that you’ll be in a Slump. And when you’re in a Slump, you’re not in for much fun. Un-slumping yourself is not easily done.</p>
                            <p>You will come to a place where the streets are not marked. Some windows are lighted. But mostly they’re darked. A place you could sprain both your elbow and chin! Do you dare to stay out? Do you dare to go in? How much can you lose? How much can you win?</p>
                            <p>And if you go in, should you turn left or right…or right-and-three-quarters? Or, maybe, not quite? Or go around back and sneak in from behind? Simple it’s not, I’m afraid you will find, for a mind-maker-upper to make up his mind.</p>
                            <p>You can get so confused that you’ll start in to race down long wiggled roads at a break-necking pace and grind on for miles across weirdish wild space, headed, I fear, toward a most useless place.</p>
                            <p class="font-bold text-slate-300 uppercase tracking-widest text-sm pt-4">The Waiting Place…for people just waiting.</p>
                            <p class="text-slate-500 text-lg">Everyone is just waiting... for a train to go or a bus to come, or a plane to go or the mail to come, or the rain to go or the phone to ring... or waiting, perhaps, for their Uncle Jake or Another Chance.</p>
                            <p class="font-black text-indigo-600 text-2xl py-4 uppercase tracking-tighter">No! That’s not for you!</p>
                            <p>Somehow you'll escape all that waiting and staying. You'll find the bright places where Boom Bands are playing. With banner flip-flapping, once more you’ll ride high! Ready for anything under the sky. Ready because you’re that kind of a guy!</p>
                            <p>Oh, the places you’ll go! There is fun to be done! There are points to be scored. There are games to be won. Fame! You’ll be famous as famous can be, with the whole wide world watching you win on TV.</p>
                            <p class="text-slate-400 italic">Except when they don’t. Because, sometimes, they won’t.</p>
                            <p>All Alone! Whether you like it or not, Alone will be something you’ll be quite a lot. And when you’re alone, there’s a very good chance you’ll meet things that scare you right out of your pants.</p>
                            <p>But on you will go though the weather be foul. Onward up many a frightening creek, though your arms may get sore and your sneakers may leak. On and on you will hike. And I know you’ll hike far and face up to your problems whatever they are.</p>
                            <p>You’ll get mixed up, of course, as you already know. You’ll get mixed up with many strange birds as you go. So be sure when you step. Step with care and great tact and remember that Life’s a Great Balancing Act.</p>
                            <p class="font-black text-indigo-800 text-3xl pt-8 uppercase tracking-tighter">Kid, you’ll move mountains!</p>
                            <p>Your mountain is waiting. So…get on your way!</p>
                        </div>
                    </section>

                    <!-- Quote Analysis Table -->
                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 mb-16 shadow-sm overflow-hidden">
                        <h3 class="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
                            <i data-lucide="message-square-quote" class="text-indigo-600"></i> Activity: Quote Analysis Table
                        </h3>
                        <table class="w-full border-collapse">
                            <thead>
                                <tr class="bg-slate-50">
                                    <th class="border-y border-slate-200 p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/2">The Quote</th>
                                    <th class="border-y border-slate-200 p-6 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/2">My Version of the Message</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${[
                                    '"You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose."',
                                    '"You\'ll look up and down streets. Look \'em over with care. About some you will say, \'I don\'t choose to go there.\'"',
                                    '"And when you\'re in a Slump, you\'re not in for much fun. Un-slumping yourself is not easily done."',
                                    '"The Waiting Place... for people just waiting."',
                                    '"I\'m afraid that some times you\'ll play lonely games too. Games you can\'t win \'cause you\'ll play against you."',
                                    '"Kid, you\'ll move mountains!"'
                                ].map(q => `
                                    <tr class="hover:bg-slate-50/50">
                                        <td class="border-b border-slate-100 p-8 text-slate-700 font-serif italic text-lg">${q}</td>
                                        <td class="border-b border-slate-100 p-4">
                                            <textarea placeholder="Write interpretation..." class="w-full min-h-[100px] bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm resize-none focus:ring-2 focus:ring-amber-200 outline-none"></textarea>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </section>

                    <!-- Personal Reflections -->
                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-rose-500">
                        <h3 class="text-3xl font-black mb-12 text-slate-800 uppercase tracking-tight">Personal Reflection</h3>
                        <div class="space-y-12">
                            ${[
                                { q: "Where do you see yourself 5 years from now?", hint: "(university? full-time job? living at home? abroad?)" },
                                { q: "Are you someone who has their life figured out or are you still trying out different things?" },
                                { q: "Are you someone who takes risks or do you prefer to play it safe?" },
                                { q: "What do you think is your 'mountain'?" }
                            ].map((item, idx) => `
                                <div>
                                    <label class="block text-xl font-black text-slate-800 mb-4">${idx+1}. ${item.q}</label>
                                    ${item.hint ? `<p class="text-sm text-slate-400 mb-4 italic ml-14">${item.hint}</p>` : ''}
                                    <textarea class="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-lg min-h-[160px] md:ml-14 md:w-[calc(100%-3.5rem)] focus:ring-2 focus:ring-rose-400 outline-none"></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            `;
        }

        function renderAttitude() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="smile" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Attitude and Learning</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Definition:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             "Attitude is a choice. It is the way you think and feel about things, and it is reflected in your behavior."
                           </p>
                        </div>
                    </div>

                    <!-- Source Conversation -->
                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="message-circle" class="w-8 h-8"></i></div>
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Source Conversation: Attitude and Learning</h3>
                        </div>

                        <div class="space-y-4">
                            ${[
                                { who: 'Mr. Mackay', line: 'Have you ever been in a situation where you had to learn a new skill but for some reason you had very negative feelings about learning that skill?' },
                                { who: 'P. Parker', line: 'When I was five, my mother enrolled me in swimming lessons. I was terrified of the water.' },
                                { who: 'Mr. Mackay', line: 'How did your feelings affect your learning experience?' },
                                { who: 'P. Parker', line: 'I hated the lessons. It took me forever to learn how to swim, but once I learned how, I really enjoyed swimming. I even joined the swim club.' },
                                { who: 'Mr. Mackay', line: 'Have you ever had a situation where you were eager to learn a new skill? How did your feelings affect that learning experience?' },
                                { who: 'P. Parker', line: 'I have always wanted to learn sign language, so last summer I took lessons. In September, the instructor asked me to help teach the course. I really enjoyed the lessons and the language was easy for me to learn.' },
                                { who: 'Mr. Mackay', line: 'Your attitude influences how you view your experiences.' }
                            ].map((item, idx) => `
                                <div class="conversation-line ${idx % 2 === 0 ? 'conversation-line-mackay' : 'conversation-line-parker'} p-6 rounded-2xl border">
                                    <p class="text-xs font-black uppercase tracking-widest mb-2 ${idx % 2 === 0 ? 'text-indigo-600' : 'text-amber-600'}">${item.who}</p>
                                    <p class="text-slate-700 leading-relaxed text-lg">${item.line}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <!-- Big Idea Summary -->
                    <section class="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="users" class="w-8 h-8"></i></div>
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">The Scenario: Mr. Mackay & P. Park</h3>
                        </div>
                        <div class="bg-white p-8 rounded-3xl border border-slate-200 leading-relaxed text-slate-700 text-lg italic">
                            <p>"Consider the following scenario: Mr. Mackay has just hired P. Park to work for his company. He thinks P. Park is going to be a great employee because P. Park has a 'good attitude'."</p>
                            <p class="font-bold text-indigo-700 mt-4 not-italic">What does Mr. Mackay mean by this?</p>
                        </div>
                    </section>

                    <!-- Dialogue Analysis -->
                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 mb-16 shadow-sm overflow-hidden">
                        <h3 class="text-xl font-bold mb-8 text-slate-800 flex items-center gap-2">
                            <i data-lucide="clipboard-list" class="text-indigo-600"></i> Activity: Analyze the Dialogue
                        </h3>
                        <div class="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                            <p class="text-sm font-semibold text-indigo-900">Instructions: For each line, identify the feeling, decide if the attitude is positive or negative, and explain how that attitude affected learning.</p>
                            <p class="text-xs text-indigo-700 mt-2">Example: "I was terrified of the water." -> Feeling: scared/anxious, Attitude type: negative at first, Impact on learning: learning was slower until confidence improved.</p>
                        </div>
                        <div class="lg:hidden space-y-4">
                            ${[
                                'I was terrified of the water.',
                                'I hated the lessons. It took me forever to learn.',
                                'I really enjoyed swimming. I even joined the swim club.',
                                'I have always wanted to learn sign language.',
                                'I really enjoyed the lessons and the language was easy for me to learn.'
                            ].map((line, idx) => `
                                <div class="rounded-2xl border border-slate-200 p-4 ${idx === 0 ? 'bg-indigo-50/40' : 'bg-white'}">
                                    <p class="text-sm font-bold text-slate-700 mb-3">${line}</p>
                                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Feeling
                                            ${buildSelect(feelingOptions, 'Choose feeling')}
                                        </label>
                                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Attitude Type
                                            ${buildSelect(attitudeTypeOptions, 'Choose type')}
                                        </label>
                                        <label class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                            Impact on Learning
                                            ${buildSelect(impactOptions, 'Choose impact')}
                                        </label>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="hidden lg:block overflow-x-auto">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-slate-50">
                                        <th class="border-y border-slate-200 p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-2/5">Conversation Line</th>
                                        <th class="border-y border-slate-200 p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/5">Feeling</th>
                                        <th class="border-y border-slate-200 p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/5">Attitude Type</th>
                                        <th class="border-y border-slate-200 p-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/5">Impact on Learning</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="bg-indigo-50/60">
                                        <td class="border-b border-slate-100 p-4 text-slate-700 font-medium">Example: "I was terrified of the water."</td>
                                        <td class="border-b border-slate-100 p-3">${buildSelect(feelingOptions, 'Choose feeling', 'Scared / anxious', true)}</td>
                                        <td class="border-b border-slate-100 p-3">${buildSelect(attitudeTypeOptions, 'Choose type', 'Negative', true)}</td>
                                        <td class="border-b border-slate-100 p-3">${buildSelect(impactOptions, 'Choose impact', 'Slowed learning', true)}</td>
                                    </tr>
                                    ${[
                                        'I was terrified of the water.',
                                        'I hated the lessons. It took me forever to learn.',
                                        'I really enjoyed swimming. I even joined the swim club.',
                                        'I have always wanted to learn sign language.',
                                        'I really enjoyed the lessons and the language was easy for me to learn.'
                                    ].map(line => `
                                        <tr class="hover:bg-slate-50/50 transition-colors">
                                            <td class="border-b border-slate-100 p-4 text-slate-700 font-medium">${line}</td>
                                            <td class="border-b border-slate-100 p-3">${buildSelect(feelingOptions, 'Choose feeling')}</td>
                                            <td class="border-b border-slate-100 p-3">${buildSelect(attitudeTypeOptions, 'Choose type')}</td>
                                            <td class="border-b border-slate-100 p-3">${buildSelect(impactOptions, 'Choose impact')}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-8 p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                            <p class="font-black text-indigo-800 mb-3 uppercase tracking-wider text-xs">Creative Extension</p>
                            <p class="text-slate-700 mb-4">Write your own short two-person conversation about learning a new skill, and show how attitude changed the outcome.</p>
                            <textarea class="w-full min-h-[130px] bg-white border border-indigo-100 rounded-2xl p-4 text-sm resize-none focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Speaker A: ...&#10;Speaker B: ..."></textarea>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl">
                                <h4 class="font-black text-emerald-700 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4"></i> Positive / Proactive (Winner)
                                </h4>
                                <ul class="space-y-4 text-emerald-900 font-bold">
                                    <li>"How can I solve this problem?"</li>
                                    <li>"I am excited to learn something new today."</li>
                                    <li>"I will do my best even if this task is boring."</li>
                                </ul>
                            </div>
                            <div class="bg-rose-50 border border-rose-100 p-8 rounded-3xl">
                                <h4 class="font-black text-rose-700 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <i data-lucide="alert-triangle" class="w-4 h-4"></i> Negative / Reactive (Risk)
                                </h4>
                                <ul class="space-y-4 text-rose-900 font-bold italic">
                                    <li>"This is too hard, I quit."</li>
                                    <li>"I already know everything."</li>
                                    <li>"I'll do the bare minimum."</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <!-- Learning Styles Checklist -->
                    <section class="mb-16">
                        <h2 class="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-8 pl-4">Learning Style Discovery</h2>
                        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                            ${renderLearningStyleCards()}
                        </div>
                        <div class="mt-8 rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
                            <p id="style-summary-text" class="text-base font-bold text-indigo-900 mb-2">Select the traits that match you to discover your likely learning style.</p>
                            <p id="style-bridge-text" class="text-sm text-indigo-800">A positive attitude helps you stay open, practice consistently, and use any learning style more effectively.</p>
                        </div>
                    </section>

                    <!-- Attitude Assessment -->
                    <section class="bg-white border-2 border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <h3 class="text-3xl font-black mb-12 text-slate-800 uppercase tracking-tight">What is your Attitude?</h3>
                        <div class="space-y-12">
                            ${[
                                "How would you describe your attitude toward school and learning?",
                                "Give two examples of how you have displayed a positive attitude:",
                                "Do you agree that you have a positive attitude? Why or why not?",
                                "What is one thing you can do to improve your attitude?"
                            ].map((q, i) => `
                                <div>
                                    <label class="block text-xl font-black text-slate-800 mb-4">${i+1}. ${q}</label>
                                    <textarea class="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-lg min-h-[160px] md:ml-14 md:w-[calc(100%-3.5rem)] focus:ring-2 focus:ring-indigo-400 outline-none shadow-inner"></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            `;
            updateLearningStyleSummary();
        }

        // --- PLACEHOLDER RENDERS FOR OTHER SECTIONS ---
        function renderTrends() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="target" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Life / Work Trends</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Big Idea:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             The lifestyle you want is shaped by your values, your choices, and the kind of work you choose.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="messages-square" class="w-8 h-8"></i></div>
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Source Conversation: Lifestyle</h3>
                        </div>
                        <div class="space-y-4">
                            ${[
                                { who: 'Mr. Mackay', line: 'What do you think will be the focus in your life? Self-knowledge will help you define the lifestyle you want. It will also help you find the occupations that will help you achieve the lifestyle you want.' },
                                { who: 'S. Rogers', line: 'What exactly is meant by the term lifestyle?' },
                                { who: 'Mr. Mackay', line: 'A person\'s lifestyle is a collection of choices he or she makes about career, relationships, and material assets. Put simply, your lifestyle is determined by how much money you make and choices you make based on your needs and choices.' }
                            ].map((item, idx) => `
                                <div class="conversation-line ${idx % 2 === 0 ? 'conversation-line-mackay' : 'conversation-line-parker'} p-6 rounded-2xl border">
                                    <p class="text-xs font-black uppercase tracking-widest mb-2 ${idx % 2 === 0 ? 'text-indigo-600' : 'text-amber-600'}">${item.who}</p>
                                    <p class="text-slate-700 leading-relaxed text-lg">${item.line}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="list-todo" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">What Matters Most?</h3>
                                <p class="text-slate-500 font-medium">Choose the three behaviours that matter most to your lifestyle and rank them 1, 2, and 3.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${[
                                'being with your family',
                                'making money',
                                'being independent',
                                'making new friends',
                                'learning new things',
                                'having fun',
                                'being creative',
                                'working hard',
                                'helping others',
                                'travelling'
                            ].map((item) => `
                                <label class="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                                    <select class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-200 outline-none">
                                        <option value="">Rank</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </select>
                                    <span class="text-slate-700 font-semibold">${item}</span>
                                </label>
                            `).join('')}
                        </div>
                        <div class="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                            <p class="text-sm font-semibold text-indigo-900">Insight: The behaviours you value most influence the kind of job, schedule, income, and relationships you may want in your future lifestyle.</p>
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <h3 class="text-2xl font-black mb-4 uppercase tracking-tight flex items-center gap-4">
                            <i data-lucide="briefcase-business" class="text-indigo-300"></i> Occupation and Lifestyle Scenario Lab
                        </h3>
                        <p class="text-slate-300 mb-10 max-w-3xl">Explain how each person's occupation affects their lifestyle. Think about time, family, independence, travel, stress, and routine.</p>
                        <div class="space-y-8">
                            ${[
                                {
                                    name: 'Baljit',
                                    text: 'Baljit visits his son\'s classroom two mornings a week as a parent helper. He is able to do this because he works the night shift and doesn\'t have to be at work until late in the afternoon.'
                                },
                                {
                                    name: 'Anika',
                                    text: 'Anika and her husband both work office jobs during the week. Because of this, their daughter goes to an after-school care centre, and Anika picks her up on the way home from work.'
                                },
                                {
                                    name: 'James',
                                    text: 'James is an on-call emergency nurse.'
                                },
                                {
                                    name: 'Gisele',
                                    text: 'Gisele is a long-haul truck driver. She drives from Edmonton to the United States twice a week.'
                                },
                                {
                                    name: 'Jordan',
                                    text: 'Jordan, an electrician who works in Fort McMurray, lives in camp and is home every second weekend for four days.'
                                }
                            ].map((scenario) => `
                                <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
                                    <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
                                        <div>
                                            <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">${scenario.name}</p>
                                            <p class="text-lg leading-relaxed text-white">${scenario.text}</p>
                                        </div>
                                        <div class="grid grid-cols-2 gap-2 md:w-72 shrink-0">
                                            ${['Time', 'Family', 'Income', 'Stress', 'Location', 'Routine'].map(tag => `
                                                <label class="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-200">
                                                    <input type="checkbox" class="rounded border-white/20 bg-transparent">
                                                    ${tag}
                                                </label>
                                            `).join('')}
                                        </div>
                                    </div>
                                    <textarea class="w-full min-h-[120px] rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Explain how this occupation shapes the person's lifestyle..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><i data-lucide="scale" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Control vs. Chance</h3>
                                <p class="text-slate-500 font-medium">Some parts of your future lifestyle are shaped by your choices. Other parts are affected by circumstances around you.</p>
                            </div>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8 mb-8">
                            <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Why This Matters</p>
                            <div class="space-y-4 text-slate-700 leading-relaxed">
                                <p>The lifestyle you choose will not happen by chance. On the other hand, some chance occurrences, over which you have no control, may impact your lifestyle. For instance, you do not have any control over where you were born, whether the economy is booming, or whether you have grown up with very little money. However, most of the factors that will create your lifestyle are within your control.</p>
                                <p>Your life right now is in the process of change. You probably have control over some parts of your life, such as the choices you make about friends, the possessions you purchase, and the values you hold to be most important. You have control over the amount of effort you put into your studies and some choice about the courses you take. You may choose the extracurricular activities you participate in. Of course, much of your lifestyle as a high school student is affected by external factors, such as your family, peers, and your community.</p>
                                <p>Your control over your own lifestyle will increase as your ability to earn money increases, your independence grows, and your values become clearer to you.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-2">Key Idea 1</p>
                                <p class="text-sm font-semibold text-slate-700">Some things affect your lifestyle by chance, and you cannot fully control them.</p>
                            </div>
                            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                                <p class="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Key Idea 2</p>
                                <p class="text-sm font-semibold text-slate-700">Many important lifestyle choices are still within your control right now.</p>
                            </div>
                            <div class="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                                <p class="text-xs font-black uppercase tracking-widest text-amber-700 mb-2">Key Idea 3</p>
                                <p class="text-sm font-semibold text-slate-700">As you gain independence, your ability to shape your own lifestyle grows.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-emerald-700 mb-4">Things I Can Control</h4>
                                <textarea class="w-full min-h-[220px] rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="Examples: how hard I work, the values I choose, the friends I spend time with, the goals I set..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-amber-100 bg-amber-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-amber-700 mb-4">Things I Cannot Fully Control</h4>
                                <textarea class="w-full min-h-[220px] rounded-2xl border border-amber-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-300 outline-none" placeholder="Examples: the economy, family circumstances, where I was born, surprise events..."></textarea>
                            </div>
                        </div>
                        <div class="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <label class="block text-sm font-black uppercase tracking-widest text-slate-500 mb-3">What will I focus on this year?</label>
                            <input type="text" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Write one practical focus for building the lifestyle you want...">
                        </div>
                    </section>

                    <section class="bg-white border-2 border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <h3 class="text-3xl font-black mb-4 text-slate-800 uppercase tracking-tight">My Lifestyle Vision</h3>
                        <p class="text-slate-400 mb-12 italic font-medium leading-relaxed">Build a short paragraph describing the kind of lifestyle you would like to have.</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">I Value...</label>
                                <textarea class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="family, independence, creativity, stability..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">I Want Work That...</label>
                                <textarea class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="gives me balance, helps others, pays well, allows travel..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <label class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">To Get There, I Will...</label>
                                <textarea class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="learn new skills, stay focused, make good choices..."></textarea>
                            </div>
                        </div>
                        <div class="rounded-3xl border border-indigo-100 bg-indigo-50 p-8">
                            <label class="block text-sm font-black uppercase tracking-widest text-indigo-700 mb-4">Final Paragraph</label>
                            <textarea class="w-full min-h-[220px] rounded-2xl border border-indigo-100 bg-white p-5 text-base text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="In a short paragraph, describe the lifestyle you would like to have..."></textarea>
                        </div>
                    </section>
                </div>
            `;
        }
        function renderSmartGoals() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="crosshair" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">SMART Goals</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Why this matters:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             SMART goals help you clarify your ideas, focus your effort, use your time productively, and improve your chances of achieving what you want.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="blocks" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">What SMART Means</h3>
                                <p class="text-slate-500 font-medium">Each goal should be specific, measurable, achievable, relevant, and time-bound.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            ${[
                                { letter: 'S', word: 'Specific', desc: 'Clear and focused so you know exactly what you want to accomplish.', prompts: 'What? Why? Who? Where? Which resources or limits?' },
                                { letter: 'M', word: 'Measurable', desc: 'Trackable so you know when progress is happening.', prompts: 'How much? How many? How will I know?' },
                                { letter: 'A', word: 'Achievable', desc: 'Realistic enough to be possible, but strong enough to stretch you.', prompts: 'How can I do this? Do I have time, resources, and money?' },
                                { letter: 'R', word: 'Relevant', desc: 'Important to you and connected to your real priorities.', prompts: 'Is it worthwhile? Is this the right time? Am I the right person?' },
                                { letter: 'T', word: 'Time-Bound', desc: 'Attached to a timeline so it does not stay a wish forever.', prompts: 'When? Six months? Six weeks? Today?' }
                            ].map(item => `
                                <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-7 md:p-8">
                                    <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-black mb-5">${item.letter}</div>
                                    <h4 class="text-lg font-black uppercase tracking-tight text-slate-800 mb-3">${item.word}</h4>
                                    <p class="text-sm text-slate-600 leading-relaxed mb-5">${item.desc}</p>
                                    <p class="text-xs font-bold uppercase tracking-wider leading-relaxed text-indigo-700">${item.prompts}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="git-compare-arrows" class="w-8 h-8"></i></div>
                            <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Weak Goal vs. SMART Goal</h3>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="rounded-3xl border border-rose-100 bg-rose-50 p-8">
                                <p class="text-xs font-black uppercase tracking-widest text-rose-700 mb-3">Too Vague</p>
                                <p class="text-2xl font-black text-rose-900 mb-4">I want better grades.</p>
                                <p class="text-sm text-rose-800">This goal is not detailed enough to guide action or measure progress.</p>
                            </div>
                            <div class="rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
                                <p class="text-xs font-black uppercase tracking-widest text-emerald-700 mb-3">SMART Version</p>
                                <p class="text-lg font-black text-emerald-900 leading-relaxed mb-4">I will get an A on my next English paper by understanding the assignment, asking my teacher to review my draft, and completing three revisions before the due date.</p>
                                <p class="text-sm text-emerald-800">This version gives a clear target, a plan, and a deadline.</p>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
                            <div>
                                <h3 class="text-2xl font-black uppercase tracking-tight">Build Your SMART Goal</h3>
                                <p class="text-slate-300 mt-2">Use the switch to change the prompt set in this same window, then keep both final goal drafts below for comparison.</p>
                            </div>
                            <div class="flex gap-2 rounded-2xl bg-white/5 p-2">
                                <button data-smart-track-button="school" onclick="setSmartGoalTrack('school')" class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${smartGoalTrack === 'school' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}">High School</button>
                                <button data-smart-track-button="life" onclick="setSmartGoalTrack('life')" class="px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${smartGoalTrack === 'life' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}">Life After</button>
                            </div>
                        </div>

                        <div class="mb-8 space-y-4">
                            <div data-smart-track-panel="school">
                                ${renderSmartGoalBuilder('school', 'High School Goal Ideas', smartGoalExamples.school)}
                            </div>
                            <div data-smart-track-panel="life" class="${smartGoalTrack === 'life' ? '' : 'hidden'}">
                                ${renderSmartGoalBuilder('life', 'Life After High School Goal Ideas', smartGoalExamples.life)}
                            </div>
                        </div>

                        <div class="space-y-6">
                            ${[
                                {
                                    letter: 'S',
                                    word: 'Specific',
                                    prompts: ['What do I want to accomplish?', 'Why is this goal important?', 'Who is involved?', 'Where is it located?', 'Which resources or limits are involved?']
                                },
                                {
                                    letter: 'M',
                                    word: 'Measurable',
                                    prompts: ['How much?', 'How many?', 'How will I know when it is accomplished?']
                                },
                                {
                                    letter: 'A',
                                    word: 'Achievable',
                                    prompts: ['How can I accomplish this goal?', 'Do I have the time to accomplish this goal?', 'Do I have the necessary resources?', 'Can I afford to do it?']
                                },
                                {
                                    letter: 'R',
                                    word: 'Relevant',
                                    prompts: ['Does this seem worthwhile?', 'Is this the right time?', 'Am I the right person to reach this goal?', 'Is it applicable in the current socio-economic environment?']
                                },
                                {
                                    letter: 'T',
                                    word: 'Time-Bound',
                                    prompts: ['When?', 'What can I do six months from now?', 'What can I do six weeks from now?', 'What can I do today?']
                                }
                            ].map(item => `
                                <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8">
                                    <div class="flex items-center gap-4 mb-6">
                                        <div class="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-black">${item.letter}</div>
                                        <div>
                                            <h4 class="text-xl font-black uppercase tracking-tight text-white">${item.word}</h4>
                                            <p class="text-slate-300 text-sm">Answer the prompts below to strengthen this part of your goal.</p>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        ${item.prompts.map(prompt => `
                                            <label class="block rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                                                <span class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">${prompt}</span>
                                                <textarea class="w-full min-h-[110px] rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Write your answer..."></textarea>
                                            </label>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="pen-square" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Restate Both SMART Goals</h3>
                                <p class="text-slate-500 font-medium">Keep both drafts visible so it is easy to compare your school goal and your life-after goal.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">High School SMART Goal</p>
                                <p class="text-sm text-slate-500 mb-4">Restate your goal as one strong SMART goal sentence.</p>
                                <textarea class="w-full min-h-[220px] rounded-3xl border border-slate-200 bg-white p-6 text-base text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Restate your high school SMART goal..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">Life After High School SMART Goal</p>
                                <p class="text-sm text-slate-500 mb-4">Restate your future-focused SMART goal as one strong sentence.</p>
                                <textarea class="w-full min-h-[220px] rounded-3xl border border-slate-200 bg-white p-6 text-base text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Restate your life-after SMART goal..."></textarea>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border-2 border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <h3 class="text-3xl font-black mb-4 text-slate-800 uppercase tracking-tight">SMART Goal Reflection</h3>
                        <p class="text-slate-400 mb-12 italic font-medium leading-relaxed">Explain why each SMART part matters when you are setting goals.</p>
                        <div class="space-y-10">
                            ${[
                                'Why is it important to make your goals SPECIFIC?',
                                'Why is it important to make your goals MEASURABLE?',
                                'Why is it important to make your goals ACHIEVABLE?',
                                'Why is it important to make your goals RELEVANT?',
                                'Why is it important to make your goals TIME-BOUND?'
                            ].map((question, index) => `
                                <div>
                                    <label class="block text-xl font-black text-slate-800 mb-4">${index + 1}. ${question}</label>
                                    <textarea class="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-lg min-h-[150px] focus:ring-2 focus:ring-indigo-400 outline-none shadow-inner"></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            `;
        }
        function renderDecisionMaking() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="git-branch-plus" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Decision Making</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Why this matters:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             Goal setting, decision making, and planning all work together. The choices you make now shape what becomes possible later.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="message-circle-question" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Starting Point: Think About a Real Decision</h3>
                                <p class="text-slate-500 font-medium">Use a choice from your own life to anchor this section.</p>
                            </div>
                        </div>
                        <div class="space-y-8">
                            ${[
                                'Have you ever made a choice that resulted in a consequence you did not want? Briefly describe what happened.',
                                'Looking back, what would you do differently if you could make that decision again?',
                                'How do we decide whether we should do something or not?',
                                'How do you usually make a choice right now? What is your current process?'
                            ].map((prompt, index) => `
                                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <label class="block text-lg font-black text-slate-800 mb-4">${index + 1}. ${prompt}</label>
                                    <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-5 text-base text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Write your response..."></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-white/10 text-indigo-300 rounded-2xl"><i data-lucide="route" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black uppercase tracking-tight">The 5-Step Decision-Making Process</h3>
                                <p class="text-slate-300">This is the core process from the booklet. Use it for small decisions and major life choices.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
                            ${[
                                {
                                    n: '1',
                                    title: 'Identify Your Goal',
                                    text: 'Ask yourself what problem needs to be solved and why it matters.',
                                    prompt: 'What exactly is the issue, and what do I need this decision to help me do?'
                                },
                                {
                                    n: '2',
                                    title: 'Gather Information',
                                    text: 'Learn about the problem and generate possible options before choosing.',
                                    prompt: 'What choices do I have, and who or what can help me understand them better?'
                                },
                                {
                                    n: '3',
                                    title: 'Consider Consequences',
                                    text: 'Think about how each option might affect you now and later.',
                                    prompt: 'What are the pros and cons, and how could this affect other people too?'
                                },
                                {
                                    n: '4',
                                    title: 'Make Your Decision',
                                    text: 'Choose the option that best fits your goal, values, and future plans.',
                                    prompt: 'Which option feels right and works best for me now and in the future?'
                                },
                                {
                                    n: '5',
                                    title: 'Evaluate Your Decision',
                                    text: 'Review the result so you can improve your decision making next time.',
                                    prompt: 'Did this choice work? What would I repeat or change next time?'
                                }
                            ].map(item => `
                                <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6">
                                    <div class="w-12 h-12 rounded-2xl bg-indigo-500 text-white flex items-center justify-center text-xl font-black mb-4">${item.n}</div>
                                    <h4 class="text-lg font-black uppercase tracking-tight text-white mb-3">${item.title}</h4>
                                    <p class="text-sm text-slate-300 leading-relaxed mb-4">${item.text}</p>
                                    <p class="text-xs font-black uppercase tracking-widest text-indigo-300 leading-relaxed">${item.prompt}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="search-check" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Apply the Process</h3>
                                <p class="text-slate-500 font-medium">Use the five steps on a real post-high-school decision.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">What does it mean to keep an eye on your goal?</span>
                                <textarea class="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Explain what it means in your own words..."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">What information can you start gathering now?</span>
                                <textarea class="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Programs, jobs, requirements, deadlines, money, training, supports..."></textarea>
                            </label>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><i data-lucide="scale" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Pro / Con Decision Lab</h3>
                                <p class="text-slate-500 font-medium">A pro-con list helps you slow down and compare your options instead of reacting too quickly.</p>
                            </div>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6 mb-8">
                            <label class="block text-sm font-black uppercase tracking-widest text-slate-500 mb-3">Decision I Am Thinking About</label>
                            <input type="text" class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Example: Should I work part-time this semester?">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div class="rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-emerald-700 mb-4">Possible Pros</h4>
                                <textarea class="w-full min-h-[220px] rounded-2xl border border-emerald-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-emerald-300 outline-none" placeholder="What are the benefits of this option?"></textarea>
                            </div>
                            <div class="rounded-3xl border border-rose-100 bg-rose-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-rose-700 mb-4">Possible Cons</h4>
                                <textarea class="w-full min-h-[220px] rounded-2xl border border-rose-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-rose-300 outline-none" placeholder="What are the drawbacks or risks?"></textarea>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Has a pro-con list helped you before?</span>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Describe the situation, or explain when a pro-con list would be useful."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Who could help you weigh the options?</span>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Teachers, family, counsellors, employers, program advisors, trusted friends..."></textarea>
                            </label>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="map" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">My Decision Map</h3>
                                <p class="text-slate-500 font-medium">Walk one important decision through the full process from goal to evaluation.</p>
                            </div>
                        </div>
                        <div class="space-y-6">
                            ${[
                                { label: '1. My goal in this situation is...', placeholder: 'What am I trying to accomplish?' },
                                { label: '2. My main options are...', placeholder: 'List the realistic choices I have.' },
                                { label: '3. The consequences I need to think about are...', placeholder: 'Short-term, long-term, and effects on other people.' },
                                { label: '4. The decision I think is best right now is...', placeholder: 'Choose the option that best fits your goal and values.' },
                                { label: '5. I will know this was a good decision if...', placeholder: 'How will I evaluate whether this choice worked?' }
                            ].map(item => `
                                <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <span class="block text-sm font-black uppercase tracking-widest text-slate-600 mb-3">${item.label}</span>
                                    <textarea class="w-full min-h-[130px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="${item.placeholder}"></textarea>
                                </label>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-white border-2 border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <h3 class="text-3xl font-black mb-4 text-slate-800 uppercase tracking-tight">Decision-Making Reflection</h3>
                        <p class="text-slate-400 mb-12 italic font-medium leading-relaxed">Use this final reflection to connect decision making back to goals, planning, and your future.</p>
                        <div class="space-y-10">
                            ${[
                                'Explain how goal setting, decision making, and planning are ongoing interrelated actions.',
                                'Why is it important to evaluate your decision after the decision has already been made?',
                                'What part of the five-step process do you think will help you most in real life, and why?'
                            ].map((question, index) => `
                                <div>
                                    <label class="block text-xl font-black text-slate-800 mb-4">${index + 1}. ${question}</label>
                                    <textarea class="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 text-lg min-h-[150px] focus:ring-2 focus:ring-indigo-400 outline-none shadow-inner"></textarea>
                                </div>
                            `).join('')}
                        </div>
                    </section>
                </div>
            `;
        }
        function renderCareerPrep() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="sparkles" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Transferable Skills</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Definition:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             Skills you build in classes, jobs, hobbies, sports, projects, and daily life can transfer into many different workplaces and occupations.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="layers-3" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Skill Bank</h3>
                                <p class="text-slate-500 font-medium">These are examples of transferable skills you may already be using.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
                            ${[
                                'Communicating', 'Troubleshooting', 'Testing', 'Designing', 'Researching',
                                'Writing', 'Planning', 'Analyzing', 'Speaking', 'Persuading',
                                'Organizing', 'Motivating', 'Problem-solving', 'Teaching', 'Learning',
                                'Creating', 'Leading', 'Estimating', 'Negotiating', 'Decision-making',
                                'Proofreading', 'Reading', 'Team-building', 'Comparing', 'Reasoning'
                            ].map(skill => `
                                <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">${skill}</div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-white/10 text-indigo-300 rounded-2xl"><i data-lucide="graduation-cap" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black uppercase tracking-tight">From the Classroom to the World</h3>
                                <p class="text-slate-300">Identify what school is already teaching you that will matter outside the classroom.</p>
                            </div>
                        </div>
                        <div class="overflow-x-auto rounded-3xl border border-white/10">
                            <table class="w-full border-collapse">
                                <thead>
                                    <tr class="bg-white/5">
                                        <th class="p-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Subject</th>
                                        <th class="p-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Transferable Skills Learned</th>
                                        <th class="p-5 text-left text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">How These Skills Apply Outside School</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${['Math', 'Science', 'English', 'History', 'Additional Languages', 'Music', 'Art', 'Drama', 'CALM'].map(subject => `
                                        <tr class="border-t border-white/10">
                                            <td class="p-5 font-black text-white">${subject}</td>
                                            <td class="p-4"><textarea class="w-full min-h-[110px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="List skills you learn in ${subject}..."></textarea></td>
                                            <td class="p-4"><textarea class="w-full min-h-[110px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="How could these skills help in life or work?"></textarea></td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="rounded-3xl border border-indigo-100 bg-indigo-50 p-8">
                                <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Reflection: My Skills</h3>
                                <label class="block text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">What are your strongest transferable skills?</label>
                                <textarea class="w-full min-h-[180px] rounded-2xl border border-indigo-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Explain which skills stand out for you and where you have used them..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-amber-100 bg-amber-50 p-8">
                                <h3 class="text-xl font-black text-slate-800 uppercase tracking-tight mb-4">Growth Areas</h3>
                                <label class="block text-xs font-black uppercase tracking-widest text-amber-700 mb-3">What are three transferable skills you would like to improve?</label>
                                <textarea class="w-full min-h-[180px] rounded-2xl border border-amber-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-amber-300 outline-none" placeholder="Choose three skills and explain why they matter to your future..."></textarea>
                            </div>
                        </div>
                    </section>

                </div>
            `;
        }
        function renderJobSearch() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="briefcase" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Job Search Toolkit</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Big idea:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             Finding a job as a student is a process: stay flexible, search widely, market yourself well, and keep applying.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><i data-lucide="briefcase-business" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Jobs, Occupations, and Careers</h3>
                                <p class="text-slate-500 font-medium">Before you search for work, get clear on what kind of work path you are actually talking about.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                            ${[
                                { title: 'Job', text: 'A specific paid position with duties and responsibilities in one place.' },
                                { title: 'Occupation', text: 'A group of similar jobs that share common characteristics and skills.' },
                                { title: 'Profession', text: 'A calling or vocation that often involves advanced learning or specialized knowledge.' },
                                { title: 'Career', text: 'The bigger life path of work roles, growth, and experiences over time.' }
                            ].map(item => `
                                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <h4 class="text-lg font-black uppercase tracking-tight text-slate-800 mb-3">${item.title}</h4>
                                    <p class="text-sm text-slate-600 leading-relaxed">${item.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Sort the Definitions</h4>
                                <div class="space-y-4">
                                    ${[
                                        'The sum total of all the work roles you have fulfilled and your life experiences, including paid, unpaid, family, community, volunteer, and leisure pursuits.',
                                        'A position in an organization or business with specific duties and responsibilities in one location.',
                                        'A group of similar jobs with common characteristics requiring similar skills.'
                                    ].map(text => `
                                        <label class="block rounded-2xl border border-slate-200 bg-white p-5">
                                            <span class="block text-sm text-slate-700 leading-relaxed mb-4">${text}</span>
                                            <select class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none">
                                                <option value="">Choose the correct term...</option>
                                                <option>Job</option>
                                                <option>Occupation</option>
                                                <option>Profession</option>
                                                <option>Career</option>
                                            </select>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-8">
                                <h4 class="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Examples from the Workbook</h4>
                                <div class="space-y-4">
                                    ${[
                                        'Chef at East Side MarioÃ¢â‚¬â„¢s',
                                        'Flutist with the Toronto Symphony Orchestra',
                                        'Marine Biologist',
                                        'Mechanic at Mazda Dealership',
                                        'Musician',
                                        'Math Teacher'
                                    ].map(item => `
                                        <label class="block rounded-2xl border border-slate-200 bg-white p-5">
                                            <span class="block text-sm font-semibold text-slate-700 mb-4">${item}</span>
                                            <select class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none">
                                                <option value="">Classify this example...</option>
                                                <option>Job</option>
                                                <option>Occupation</option>
                                                <option>Profession</option>
                                            </select>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label class="block rounded-3xl border border-indigo-100 bg-indigo-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">What kind of work are you looking for right now?</span>
                                <textarea class="w-full min-h-[170px] rounded-2xl border border-indigo-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Are you looking for a first job, exploring an occupation family, or starting to imagine a long-term career?"></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Would you rather have a job, an occupation path, or a career direction right now?</span>
                                <textarea class="w-full min-h-[170px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Explain your answer and how it changes the way you should search."></textarea>
                            </label>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="search" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Job Search Tips for High School Students</h3>
                                <p class="text-slate-500 font-medium">These are the practical habits that improve your chances of getting hired.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            ${[
                                'Consider a variety of job options instead of limiting yourself too early.',
                                'Look at companies in your community that often hire younger workers.',
                                'Volunteer if you need experience for your first resume.',
                                'Start close to home with neighbors, family friends, and local contacts.',
                                'Advertise your search and tell people you are looking for work.',
                                'Use online and in-person search methods at the same time.'
                            ].map((tip, index) => `
                                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">Tip ${index + 1}</p>
                                    <p class="text-sm font-semibold text-slate-700 leading-relaxed">${tip}</p>
                                </div>
                            `).join('')}
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
                                <h3 class="text-xl font-black uppercase tracking-tight mb-4">Hidden Job Market</h3>
                                <p class="text-slate-300 mb-4">Many jobs are never posted publicly. You often hear about them through people, not websites.</p>
                                <label class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">What is the hidden job market, and how do you access it?</label>
                                <textarea class="w-full min-h-[200px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Explain networking, asking around, community contacts, follow-up, and being known as reliable..."></textarea>
                            </div>
                            <div class="rounded-3xl border border-white/10 bg-white/5 p-8">
                                <h3 class="text-xl font-black uppercase tracking-tight mb-4">Local Search Plan</h3>
                                <p class="text-slate-300 mb-4">List places and resources you can use in your own community.</p>
                                <label class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Companies in my area that hire students</label>
                                <textarea class="w-full min-h-[90px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none mb-4" placeholder="List employers in your community..."></textarea>
                                <label class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Two non-profit organizations that use volunteers</label>
                                <textarea class="w-full min-h-[90px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none mb-4" placeholder="List volunteer organizations..."></textarea>
                                <label class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Three local job-board websites</label>
                                <textarea class="w-full min-h-[90px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Paste local job websites or online resources..."></textarea>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="clipboard-pen-line" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Employment Application Guide + Practice Form</h3>
                                <p class="text-slate-500 font-medium">This is the section to slow down and use. Read the full guide, then fill out the practice application like it is a real paper form.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
                            ${[
                                {
                                    title: 'Why Employers Use Application Forms',
                                    cardClass: 'border-indigo-100 bg-indigo-50',
                                    titleClass: 'text-indigo-700',
                                    dotClass: 'bg-indigo-500',
                                    points: [
                                        'They standardize the information gathered from every applicant.',
                                        'They collect details that might not appear on a resume.',
                                        'They test whether you can follow directions carefully.',
                                        'They show your attention to detail, including neatness, spelling, and grammar.',
                                        'They create a signed record of your employment history.'
                                    ]
                                },
                                {
                                    title: 'What Employers Are Judging',
                                    cardClass: 'border-slate-200 bg-slate-50',
                                    titleClass: 'text-slate-700',
                                    dotClass: 'bg-slate-500',
                                    points: [
                                        'Whether your answers are complete and accurate.',
                                        'Whether you look careful, honest, and responsible.',
                                        'Whether your writing shows effort and professionalism.',
                                        'Whether you understand the type of work you are applying for.',
                                        'Whether you can represent yourself well without help.'
                                    ]
                                },
                                {
                                    title: 'Fill Out the Form with Care',
                                    cardClass: 'border-amber-100 bg-amber-50',
                                    titleClass: 'text-amber-700',
                                    dotClass: 'bg-amber-500',
                                    points: [
                                        'Use a draft first if possible, then copy carefully onto the final form.',
                                        'Read the whole form before writing anything.',
                                        'Write clearly and neatly, and make your answers fit the space provided.',
                                        'Answer every question truthfully.',
                                        'If a question does not apply to you, write "N/A."',
                                        'Never write "see resume" instead of answering the question.'
                                    ]
                                },
                                {
                                    title: 'How to Handle Tricky Questions',
                                    cardClass: 'border-emerald-100 bg-emerald-50',
                                    titleClass: 'text-emerald-700',
                                    dotClass: 'bg-emerald-500',
                                    points: [
                                        'For salary expectations, give a range or say you are open to discussion.',
                                        'For reasons for leaving, keep your answer brief and neutral.',
                                        'List your most recent experience first.',
                                        'Describe duties in enough detail to show what you actually did.',
                                        'Include training, awards, volunteer work, and anything relevant to the job.'
                                    ]
                                },
                                {
                                    title: 'Before You Submit',
                                    cardClass: 'border-rose-100 bg-rose-50',
                                    titleClass: 'text-rose-700',
                                    dotClass: 'bg-rose-500',
                                    points: [
                                        'Use the additional comments section to explain why you are a strong fit.',
                                        'Double-check spelling, grammar, and overall appearance.',
                                        'Attach your resume if appropriate, but do not attach extra documents unless asked.',
                                        'Deliver the form exactly the way the employer wants it delivered.',
                                        'Sign the form before handing it in.'
                                    ]
                                },
                                {
                                    title: 'Common Mistakes to Avoid',
                                    cardClass: 'border-violet-100 bg-violet-50',
                                    titleClass: 'text-violet-700',
                                    dotClass: 'bg-violet-500',
                                    points: [
                                        'Leaving blanks instead of writing "N/A."',
                                        'Rushing and turning in a messy form.',
                                        'Being too vague when describing duties or experience.',
                                        'Giving negative or overly emotional explanations.',
                                        'Ignoring directions about how the employer wants the form submitted.'
                                    ]
                                }
                            ].map(card => `
                                <div class="rounded-3xl border ${card.cardClass} p-6">
                                    <p class="text-xs font-black uppercase tracking-widest ${card.titleClass} mb-4">${card.title}</p>
                                    <ul class="space-y-3 text-sm font-semibold text-slate-700 leading-relaxed">
                                        ${card.points.map(point => `<li class="flex gap-3"><span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${card.dotClass}"></span><span>${point}</span></li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Before you begin, what information do you already have ready?</span>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Contact info, education, availability, references, work history, volunteer experience..."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">What parts of an application form usually feel hardest for you?</span>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Examples: work history, availability, wage expectations, describing strengths, references..."></textarea>
                            </label>
                        </div>

                        <div class="application-sheet">
                            <div class="application-sheet__header">
                                <div>
                                    <p class="application-sheet__brand">Practice Employment Application</p>
                                    <p class="application-sheet__subhead">Modeled after a paper application form so you can practice filling out the real thing with confidence.</p>
                                </div>
                                <div class="application-sheet__office">For practice use only</div>
                            </div>

                            <div class="application-grid application-grid--3 application-section">
                                <label class="application-field">
                                    <span class="application-label">Work location</span>
                                    <input type="text" class="application-input" placeholder="Store, branch, or city">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Wage expected</span>
                                    <input type="text" class="application-input" placeholder="Range or open to discussion">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Other work locations</span>
                                    <input type="text" class="application-input" placeholder="If applicable">
                                </label>
                            </div>

                            <div class="application-grid application-grid--2 application-section">
                                <label class="application-field">
                                    <span class="application-label">Position</span>
                                    <input type="text" class="application-input" placeholder="Cashier, sales associate, stock clerk">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Date available</span>
                                    <input type="text" class="application-input" placeholder="When can you start?">
                                </label>
                            </div>

                            <div class="application-grid application-grid--4 application-section">
                                <label class="application-field">
                                    <span class="application-label">First name</span>
                                    <input type="text" class="application-input" placeholder="">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Last name</span>
                                    <input type="text" class="application-input" placeholder="">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Phone number</span>
                                    <input type="text" class="application-input" placeholder="">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Address / city / postal code</span>
                                    <input type="text" class="application-input" placeholder="">
                                </label>
                            </div>

                            <div class="application-grid application-grid--3 application-section">
                                <label class="application-field">
                                    <span class="application-label">Languages spoken / written</span>
                                    <input type="text" class="application-input" placeholder="English, French, other">
                                </label>
                                <div class="application-field">
                                    <span class="application-label">Type of work preferred</span>
                                    <div class="application-options">
                                        <label class="application-option"><input type="checkbox"> <span>Full time</span></label>
                                        <label class="application-option"><input type="checkbox"> <span>Part time</span></label>
                                        <label class="application-option"><input type="checkbox"> <span>Student</span></label>
                                    </div>
                                </div>
                                <label class="application-field">
                                    <span class="application-label">Hours preferred</span>
                                    <input type="text" class="application-input" placeholder="Example: 15-20 hours/week">
                                </label>
                            </div>

                            <div class="application-grid application-grid--2 application-section">
                                <div class="application-field">
                                    <span class="application-label">Availability</span>
                                    <div class="application-availability">
                                        <div class="application-availability__head"></div>
                                        ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(day => `<div class="application-availability__head">${day}</div>`).join('')}
                                        <div class="application-availability__label">Day</div>
                                        ${Array.from({ length: 7 }).map(() => `<label class="application-availability__cell"><input type="checkbox"></label>`).join('')}
                                        <div class="application-availability__label">Evening</div>
                                        ${Array.from({ length: 7 }).map(() => `<label class="application-availability__cell"><input type="checkbox"></label>`).join('')}
                                        <div class="application-availability__label">Night</div>
                                        ${Array.from({ length: 7 }).map(() => `<label class="application-availability__cell"><input type="checkbox"></label>`).join('')}
                                    </div>
                                </div>
                                <div class="application-field">
                                    <span class="application-label">Education</span>
                                    <div class="application-table">
                                        <div class="application-table__row application-table__row--header">
                                            <div>School / program</div>
                                            <div>Grade completed / diploma</div>
                                        </div>
                                        ${['Elementary and high school', 'University, technical, business, or community college', 'Other studies'].map(item => `
                                            <div class="application-table__row">
                                                <div class="application-table__cell application-table__cell--label">${item}</div>
                                                <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="application-section">
                                <span class="application-label">Work history</span>
                                <div class="application-table">
                                    <div class="application-table__row application-table__row--header application-table__row--history">
                                        <div>Employer / address</div>
                                        <div>Position held</div>
                                        <div>From</div>
                                        <div>To</div>
                                        <div>Reason for leaving</div>
                                    </div>
                                    ${Array.from({ length: 3 }).map(() => `
                                        <div class="application-table__row application-table__row--history">
                                            <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                            <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                            <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                            <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                            <div class="application-table__cell"><input type="text" class="application-input application-input--compact" placeholder=""></div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="application-grid application-grid--2 application-section">
                                <label class="application-field">
                                    <span class="application-label">Activities, interests, sports, clubs, or volunteering</span>
                                    <textarea class="application-textarea" placeholder="List activities that show responsibility, teamwork, leadership, or commitment."></textarea>
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Additional comments</span>
                                    <textarea class="application-textarea" placeholder="Explain why you are a strong fit for the job."></textarea>
                                </label>
                            </div>

                            <div class="application-grid application-grid--2 application-section">
                                <label class="application-field">
                                    <span class="application-label">References</span>
                                    <textarea class="application-textarea" placeholder="List names, relationship, and contact information if ready."></textarea>
                                </label>
                                <div class="application-field">
                                    <span class="application-label">Applicant check</span>
                                    <div class="application-checklist">
                                        ${[
                                            'I answered every question.',
                                            'I wrote N/A where needed.',
                                            'My spelling and grammar are checked.',
                                            'My form makes a professional first impression.'
                                        ].map(item => `
                                            <label class="application-option"><input type="checkbox"> <span>${item}</span></label>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            <div class="application-grid application-grid--2 application-section application-sheet__footer">
                                <label class="application-field">
                                    <span class="application-label">Date application filled out</span>
                                    <input type="text" class="application-input" placeholder="">
                                </label>
                                <label class="application-field">
                                    <span class="application-label">Signature</span>
                                    <input type="text" class="application-input" placeholder="Type your full name as a practice signature">
                                </label>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-emerald-100 text-emerald-600 rounded-2xl"><i data-lucide="messages-square" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Interview Prep Lab</h3>
                                <p class="text-slate-500 font-medium">This section should prepare you for a real interview, not just tell you to Ã¢â‚¬Å“be confident.Ã¢â‚¬Â Use the guide, then practice answers in writing.</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-10">
                            ${[
                                {
                                    title: 'Before the Interview',
                                    cardClass: 'border-indigo-100 bg-indigo-50',
                                    titleClass: 'text-indigo-700',
                                    dotClass: 'bg-indigo-500',
                                    points: [
                                        'Confirm the interview time, location, and whether there will be a test or written assignment.',
                                        'Ask how many people will be interviewing you.',
                                        'Review the company, the job posting, and the qualifications needed for the role.',
                                        'Plan and rehearse answers to likely questions.',
                                        'Choose your clothes a day or two ahead and make sure they are neat and clean.',
                                        'Plan your route and have a back-up plan so you can arrive 5 to 10 minutes early.'
                                    ]
                                },
                                {
                                    title: 'What to Bring',
                                    cardClass: 'border-amber-100 bg-amber-50',
                                    titleClass: 'text-amber-700',
                                    dotClass: 'bg-amber-500',
                                    points: [
                                        'A copy of your resume for each interviewer.',
                                        'A copy of your reference list.',
                                        'Paper and a pen for notes.',
                                        'Letters of recommendation if you have them.',
                                        'A folder or envelope so everything looks organized.'
                                    ]
                                },
                                {
                                    title: 'During the Interview',
                                    cardClass: 'border-emerald-100 bg-emerald-50',
                                    titleClass: 'text-emerald-700',
                                    dotClass: 'bg-emerald-500',
                                    points: [
                                        'Greet the interviewer, introduce yourself, smile, and shake hands appropriately if expected.',
                                        'Stand until you are invited to sit down.',
                                        'Make eye contact and answer in a clear, confident voice.',
                                        'Sit naturally without slouching or leaning on the desk.',
                                        'Ask for clarification if you do not understand a question.',
                                        'Have one or two thoughtful questions ready for the employer.'
                                    ]
                                },
                                {
                                    title: 'Quick Things to Avoid',
                                    cardClass: 'border-rose-100 bg-rose-50',
                                    titleClass: 'text-rose-700',
                                    dotClass: 'bg-rose-500',
                                    points: [
                                        'Do not chew gum or smoke.',
                                        'Do not bring a friend to the interview.',
                                        'Do not discuss personal or financial problems.',
                                        'Do not complain about past employers or teachers.',
                                        'Do not linger awkwardly after the interview ends.',
                                        'Do not show up late and assume it will not matter.'
                                    ]
                                }
                            ].map(card => `
                                <div class="rounded-3xl border ${card.cardClass} p-6">
                                    <p class="text-xs font-black uppercase tracking-widest ${card.titleClass} mb-4">${card.title}</p>
                                    <ul class="space-y-3 text-sm font-semibold text-slate-700 leading-relaxed">
                                        ${card.points.map(point => `<li class="flex gap-3"><span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${card.dotClass}"></span><span>${point}</span></li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Company research notes</span>
                                <textarea class="w-full min-h-[170px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What does the company do? Who are the customers? What skills might they want? What does the role involve?"></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">My interview plan</span>
                                <textarea class="w-full min-h-[170px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What will I wear? What will I bring? How will I get there? What time will I leave?"></textarea>
                            </label>
                        </div>

                        <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8 mb-10">
                            <div class="flex items-center gap-4 mb-6">
                                <div class="p-3 bg-white text-indigo-600 rounded-2xl border border-slate-200"><i data-lucide="sparkles" class="w-7 h-7"></i></div>
                                <div>
                                    <h4 class="text-xl font-black text-slate-800 uppercase tracking-tight">Common Interview Questions Lab</h4>
                                    <p class="text-slate-500 text-sm">For each question, read why it is asked, what a strong answer should include, what to avoid, then build and write your own answer.</p>
                                </div>
                            </div>

                            <div class="space-y-8">
                                ${[
                                    {
                                        question: 'Tell me about yourself.',
                                        why: 'The employer is trying to understand you professionally, not hear your whole life story.',
                                        include: 'Focus on school, work, strengths, experience, and why you are interested in the role.',
                                        avoid: 'Do not ramble about unrelated personal details or hobbies unless they connect to the job.'
                                    },
                                    {
                                        question: 'Why should we hire you?',
                                        why: 'They want to hear what strengths and qualities you bring that fit this job.',
                                        include: 'Name your specific strengths, work habits, and what you can contribute.',
                                        avoid: 'Do not say only generic things like Ã¢â‚¬Å“I am hardworkingÃ¢â‚¬Â without examples.'
                                    },
                                    {
                                        question: 'Why do you want to work here?',
                                        why: 'They want proof that you researched the company and actually care about this role.',
                                        include: 'Show what you know about the company and connect your skills to their needs.',
                                        avoid: 'Do not say only Ã¢â‚¬Å“because I need money.Ã¢â‚¬Â'
                                    },
                                    {
                                        question: 'Why did you leave your last job?',
                                        why: 'They want to see your professionalism and attitude when discussing past experience.',
                                        include: 'Keep the answer brief, neutral, and focused on growth or change.',
                                        avoid: 'Do not complain, blame, or speak badly about a past employer.'
                                    },
                                    {
                                        question: 'Describe a problem situation and how you solved it.',
                                        why: 'They want evidence that you can think, adapt, and handle responsibility.',
                                        include: 'Describe the situation, what you did, and the result.',
                                        avoid: 'Do not give an example where someone else solved everything for you.'
                                    },
                                    {
                                        question: 'What are your greatest strengths?',
                                        why: 'They want to know what value you bring to the role.',
                                        include: 'Choose strengths that match the job and support each one with an example.',
                                        avoid: 'Do not list strengths that have nothing to do with work or school responsibility.'
                                    },
                                    {
                                        question: 'What are your greatest weaknesses?',
                                        why: 'They want honesty, self-awareness, and evidence that you can improve.',
                                        include: 'Name a real weakness and explain what you are doing to improve it.',
                                        avoid: 'Do not choose a weakness that destroys trust or sounds fake.'
                                    }
                                ].map((item, index) => `
                                    <div class="rounded-3xl border border-slate-200 bg-white p-6">
                                        <div class="flex items-start gap-4 mb-6">
                                            <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-lg font-black shrink-0">${index + 1}</div>
                                            <div>
                                                <h5 class="text-xl font-black text-slate-800 mb-2">${item.question}</h5>
                                                <p class="text-sm text-slate-500">Imagine this is for an interview at Canadian Tire or a similar student job.</p>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div class="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                                                <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-2">Why they ask it</p>
                                                <p class="text-sm text-slate-700 leading-relaxed">${item.why}</p>
                                            </div>
                                            <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                                                <p class="text-xs font-black uppercase tracking-widest text-emerald-700 mb-2">Strong answer includes</p>
                                                <p class="text-sm text-slate-700 leading-relaxed">${item.include}</p>
                                            </div>
                                            <div class="rounded-2xl border border-rose-100 bg-rose-50 p-4">
                                                <p class="text-xs font-black uppercase tracking-widest text-rose-700 mb-2">Avoid</p>
                                                <p class="text-sm text-slate-700 leading-relaxed">${item.avoid}</p>
                                            </div>
                                        </div>
                                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <label class="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <span class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Main point</span>
                                                <textarea class="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What is the main thing I want the interviewer to remember?"></textarea>
                                            </label>
                                            <label class="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <span class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Example or evidence</span>
                                                <textarea class="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What example from school, volunteering, work, sports, or life supports my answer?"></textarea>
                                            </label>
                                            <label class="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <span class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Why it matters for this job</span>
                                                <textarea class="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="How does this answer show I would be a good hire?"></textarea>
                                            </label>
                                        </div>
                                        <label class="block rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <span class="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-2">Final interview answer</span>
                                            <textarea class="w-full min-h-[150px] rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Write your final answer in a clear, interview-ready way."></textarea>
                                        </label>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <h4 class="text-lg font-black uppercase tracking-tight text-slate-800 mb-4">Questions You Can Ask the Employer</h4>
                                <div class="space-y-3 text-sm font-semibold text-slate-700 leading-relaxed">
                                    <p>What does success look like in this role?</p>
                                    <p>What training is provided?</p>
                                    <p>What would a typical shift or day look like?</p>
                                    <p>What are the next steps in the hiring process?</p>
                                </div>
                                <label class="block mt-5">
                                    <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Questions I want to ask</span>
                                    <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Write the questions you want to bring to the interview."></textarea>
                                </label>
                            </div>
                            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <h4 class="text-lg font-black uppercase tracking-tight text-slate-800 mb-4">Mock Interview Final Check</h4>
                                <div class="space-y-4">
                                    ${[
                                        'I researched the company and the job.',
                                        'I know what I am going to wear.',
                                        'I know how I am getting there and when I need to leave.',
                                        'I have examples ready for my strengths and problem-solving.',
                                        'I have at least one or two questions to ask the employer.',
                                        'I know what I am bringing with me.'
                                    ].map(item => `
                                        <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                                            <input type="checkbox" class="mt-1 accent-indigo-600">
                                            <span>${item}</span>
                                        </label>
                                    `).join('')}
                                </div>
                                <label class="block mt-5">
                                    <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">My biggest interview goal</span>
                                    <textarea class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What do I most want to improve before a real interview?"></textarea>
                                </label>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Describe a comfortable and appropriate interview outfit.</span>
                                <textarea class="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Describe what you would wear and why it is appropriate..."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">If interviews are not coming, what should you re-evaluate?</span>
                                <textarea class="w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Resume, cover letter, fit, volume of applications, interview performance, communication..."></textarea>
                            </label>
                        </div>
                    </section>
                </div>
            `;
        }
        function renderSafety() {
            contentArea.innerHTML = `
                <div class="animate-in">
                    <div class="bg-indigo-600 text-white p-10 rounded-[2.5rem] mb-12 shadow-xl relative overflow-hidden">
                        <i data-lucide="shield-check" class="absolute -top-6 -right-6 w-48 h-48 opacity-10"></i>
                        <h2 class="text-4xl font-black mb-4 uppercase tracking-tighter">Employment Rights</h2>
                        <div class="bg-white/10 p-6 rounded-2xl border border-white/20 max-w-3xl">
                           <p class="text-indigo-100 text-xl font-bold italic mb-2">Why this matters:</p>
                           <p class="text-white text-2xl font-black leading-tight">
                             This is the workplace survival guide part of the module: what employers can ask, what your safety rights are, how pay and scheduling rules work, what to do if you get hurt, and when to stop and ask for training.
                           </p>
                        </div>
                    </div>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="badge-help" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Hiring Rights</h3>
                                <p class="text-slate-500 font-medium">Employers can ask about your ability to do the job. They generally cannot ask for personal information tied to protected grounds unless it is truly essential to the position.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            ${[
                                {
                                    title: 'Usually Allowed',
                                    cardClass: 'border-emerald-100 bg-emerald-50',
                                    titleClass: 'text-emerald-700',
                                    items: [
                                        'Can you work evenings and weekends?',
                                        'Can you legally work in Canada?',
                                        'This job requires lifting 50 pounds repeatedly. Can you do that safely?',
                                        'Are you 18 or older if the job has a legal minimum age?'
                                    ]
                                },
                                {
                                    title: 'Usually Not Allowed',
                                    cardClass: 'border-rose-100 bg-rose-50',
                                    titleClass: 'text-rose-700',
                                    items: [
                                        'Do you have children or plan to have children?',
                                        'Where were you born?',
                                        'What is your religion or sexual orientation?',
                                        'Have you ever filed a WCB claim?',
                                        'Tell me about your medical conditions.'
                                    ]
                                },
                                {
                                    title: 'Depends on the Job (BFOR)',
                                    cardClass: 'border-amber-100 bg-amber-50',
                                    titleClass: 'text-amber-700',
                                    items: [
                                        'A real requirement can be allowed if it is necessary to do the work.',
                                        'Example: being 18 to legally serve alcohol.',
                                        'Example: being physically able to climb ladders for roofing work.',
                                        'The rule must be about the job, not about the employer\'s personal preference.'
                                    ]
                                }
                            ].map(card => `
                                <div class="rounded-3xl border ${card.cardClass} p-6">
                                    <p class="text-xs font-black uppercase tracking-widest ${card.titleClass} mb-4">${card.title}</p>
                                    <ul class="space-y-3 text-sm font-semibold text-slate-700 leading-relaxed">
                                        ${card.items.map(item => `<li>${item}</li>`).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8">
                            <div class="flex items-center gap-4 mb-6">
                                <div class="p-3 bg-white text-indigo-600 rounded-2xl border border-slate-200"><i data-lucide="list-checks" class="w-7 h-7"></i></div>
                                <div>
                                    <h4 class="text-xl font-black text-slate-800 uppercase tracking-tight">Interview Question Sort</h4>
                                    <p class="text-slate-500 text-sm">For each question, decide whether it is allowed, not allowed, or only okay if it is a real job requirement.</p>
                                </div>
                            </div>
                            <div class="space-y-4 mb-6">
                                ${[
                                    'Do you have children?',
                                    'Can you work evenings and weekends?',
                                    'Where were you born?',
                                    'This position requires lifting 50 pounds repeatedly. Can you do that safely?',
                                    'Have you ever filed a WCB claim?',
                                    'Are you 18 or older?'
                                ].map(item => `
                                    <label class="block rounded-2xl border border-slate-200 bg-white p-5">
                                        <span class="block text-sm font-semibold text-slate-700 mb-4">${item}</span>
                                        <select class="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none">
                                            <option value="">Choose one...</option>
                                            <option>Allowed</option>
                                            <option>Not allowed</option>
                                            <option>Depends on a real job requirement</option>
                                        </select>
                                    </label>
                                `).join('')}
                            </div>
                            <label class="block rounded-2xl border border-slate-200 bg-white p-5">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">If an employer asks an improper question, how could you redirect it professionally?</span>
                                <textarea class="w-full min-h-[150px] rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Write a calm response that brings the conversation back to your ability to do the job."></textarea>
                            </label>
                        </div>
                        <div class="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Learn more</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <a href="https://albertahumanrights.ab.ca/media/b0kbdy2q/pre-employment-inquiries.pdf" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Alberta Human Rights Commission: Pre-employment inquiries</a>
                                <a href="https://albertahumanrights.ab.ca/contact/" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Alberta Human Rights Commission contact and help</a>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-white/10 text-indigo-300 rounded-2xl"><i data-lucide="shield" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black uppercase tracking-tight">Safety at Work</h3>
                                <p class="text-slate-300">Young workers in Alberta have three basic rights: to know, to participate, and to refuse dangerous work without reprisal.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            ${[
                                { title: 'Right to Know', text: 'You have the right to know about hazards and get basic health and safety information before doing the work.' },
                                { title: 'Right to Participate', text: 'You have the right to ask questions, raise concerns, and take part in health and safety discussions.' },
                                { title: 'Right to Refuse Dangerous Work', text: 'You can refuse dangerous work, report why, and the employer cannot punish or threaten you for using this right properly.' }
                            ].map(item => `
                                <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">${item.title}</p>
                                    <p class="text-sm text-slate-200 leading-relaxed">${item.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="rounded-[2rem] border border-white/10 bg-white/5 p-6 md:p-8 mb-8">
                            <h4 class="text-xl font-black uppercase tracking-tight mb-4">Refuse Dangerous Work Scenario</h4>
                            <p class="text-slate-300 mb-6">You are told to clean a chemical spill, but you have not been trained and nobody has shown you the label, SDS, or emergency procedure.</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                ${[
                                    'Do it quickly so you do not look difficult.',
                                    'Ask for training and the safety information before you do the task.',
                                    'Refuse dangerous work, report why, and ask the employer to inspect the hazard.',
                                    'Leave without telling anyone what happened.'
                                ].map(item => `
                                    <label class="block rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                                        <span class="block text-sm text-white mb-4">${item}</span>
                                        <select class="w-full rounded-xl border border-white/10 bg-slate-950/40 p-3 text-sm text-white focus:ring-2 focus:ring-indigo-400 outline-none">
                                            <option value="">Choose how you would classify this response...</option>
                                            <option>Strong choice</option>
                                            <option>Unsafe choice</option>
                                            <option>Needs more information</option>
                                        </select>
                                    </label>
                                `).join('')}
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <label class="block rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                                    <span class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">What must the worker do first?</span>
                                    <textarea class="w-full min-h-[130px] rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Explain the first step clearly."></textarea>
                                </label>
                                <label class="block rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                                    <span class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">What must the employer do before work resumes?</span>
                                    <textarea class="w-full min-h-[130px] rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Mention inspection, fixing the hazard, and why the work cannot just continue."></textarea>
                                </label>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">What workers must do</p>
                                <ul class="space-y-3 text-sm text-slate-200 leading-relaxed">
                                    <li>Report unsafe work practices.</li>
                                    <li>Follow safety procedures and use required equipment.</li>
                                    <li>Ask for training if they do not know how to do something safely.</li>
                                    <li>Work safely and encourage others to do the same.</li>
                                </ul>
                            </div>
                            <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">What employers must do</p>
                                <ul class="space-y-3 text-sm text-slate-200 leading-relaxed">
                                    <li>Provide training and supervision.</li>
                                    <li>Make sure workers understand hazards and emergency procedures.</li>
                                    <li>Inspect and address reported hazards.</li>
                                    <li>Not discipline or threaten workers for properly refusing dangerous work.</li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4">Learn more</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <a href="https://www.alberta.ca/refuse-dangerous-work" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-white hover:border-indigo-400 transition-all">Alberta OHS: Refuse dangerous work</a>
                                <a href="https://www.alberta.ca/work-site-health-safety-committees" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-white hover:border-indigo-400 transition-all">Alberta OHS: Participation and work-site safety committees</a>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-amber-100 text-amber-600 rounded-2xl"><i data-lucide="banknote" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">Pay, Schedules, and Youth Rules</h3>
                                <p class="text-slate-500 font-medium">These are the rules most likely to affect a student's first job: how you get paid, when schedules can change, who can work late, and what happens on holidays.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                            ${[
                                { title: 'Getting Paid', text: 'Employees generally must be paid within 10 consecutive days after the end of the pay period.' },
                                { title: 'Minimum Wage', text: 'As of March 10, 2026, Alberta\'s general minimum wage is $15/hour. A $13/hour student wage can apply to eligible students under 18 in specific circumstances.' },
                                { title: 'Shift Changes', text: 'Changing from one shift to another generally requires at least 24 hours written notice and at least 8 hours rest between shifts.' },
                                { title: 'Vacation Basics', text: 'After 1 year, most employees are entitled to 2 weeks of vacation. After more than 5 years, the minimum becomes 3 weeks.' },
                                { title: 'General Holiday Basics', text: 'If a holiday is a regular day of work and you do not work, you are generally owed average daily wage. Different rules apply if you work or if it is not a regular day of work.' },
                                { title: 'Youth Rules 15â€“17', text: 'Retail and hospitality workers ages 15 to 17 can work 9 pm to 12 am only with adult supervision and cannot work 12:01 am to 6 am there. Other jobs may allow late work only with adult supervision and parent or guardian consent.' }
                            ].map(item => `
                                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <p class="text-xs font-black uppercase tracking-widest text-amber-700 mb-3">${item.title}</p>
                                    <p class="text-sm font-semibold text-slate-700 leading-relaxed">${item.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Your shift, your rights</span>
                                <p class="text-sm text-slate-700 leading-relaxed mb-4">Your manager texts you at 9:30 pm and says your 7:00 am shift tomorrow has been changed to a midnight start. What rights issue should you check first?</p>
                                <textarea class="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Think about notice of shift changes and rest between shifts."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Teen worker scenario</span>
                                <p class="text-sm text-slate-700 leading-relaxed mb-4">A 16-year-old is scheduled alone at a retail gas station from 11:00 pm to 2:00 am. What rules or concerns should be checked?</p>
                                <textarea class="w-full min-h-[140px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Think about retail hours, supervision, and youth restrictions."></textarea>
                            </label>
                        </div>
                        <div class="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 md:p-8">
                            <h4 class="text-xl font-black uppercase tracking-tight text-slate-800 mb-4">Holiday Pay Logic Check</h4>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                ${[
                                    'The holiday falls on your regular day of work and you do not work.',
                                    'The holiday falls on your regular day of work and you do work.',
                                    'The holiday falls on a day that is not a regular day of work and you do not work.'
                                ].map((item, index) => `
                                    <label class="block rounded-2xl border border-slate-200 bg-white p-5">
                                        <span class="block text-sm font-semibold text-slate-700 mb-4">${index + 1}. ${item}</span>
                                        <textarea class="w-full min-h-[130px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What would usually be owed here, and why?"></textarea>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Learn more</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                <a href="https://www.alberta.ca/payment-earnings" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Payment of earnings</a>
                                <a href="https://www.alberta.ca/minimum-wage" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Minimum wage</a>
                                <a href="https://www.alberta.ca/hours-work-rest" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Hours of work and rest</a>
                                <a href="https://www.alberta.ca/alberta-general-holidays" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">General holidays</a>
                                <a href="https://www.alberta.ca/youth-employment-laws" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">Youth employment laws</a>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900 text-white p-10 md:p-14 rounded-[2.5rem] shadow-2xl mb-16">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-white/10 text-indigo-300 rounded-2xl"><i data-lucide="activity" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black uppercase tracking-tight">If You Get Hurt at Work</h3>
                                <p class="text-slate-300">Students do not need a huge insurance lecture. They need to know what to do next and why reporting matters.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                            ${[
                                'Tell your employer or supervisor right away.',
                                'Get first aid or medical help if needed.',
                                'Report the injury to WCB quickly if it is more than first aid or you miss work.',
                                'Keep cooperating with forms, treatment, and follow-up.'
                            ].map((step, index) => `
                                <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                                    <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Step ${index + 1}</p>
                                    <p class="text-sm text-slate-200 leading-relaxed">${step}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                                <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Reporting deadlines that matter</p>
                                <ul class="space-y-3 text-sm text-slate-200 leading-relaxed">
                                    <li>Workers should report to WCB as quickly as possible after telling the employer, if treatment is beyond first aid or time is missed from work.</li>
                                    <li>Employers must report required injuries to WCB within 72 hours.</li>
                                    <li>Health care providers must report workplace injury and treatment to WCB within 48 hours.</li>
                                </ul>
                            </div>
                            <label class="block rounded-3xl border border-white/10 bg-white/5 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-indigo-300 mb-3">Case study</span>
                                <p class="text-sm text-slate-200 leading-relaxed mb-4">You twist your ankle at work and your manager tells you to just go home and not report it. What should you do next, and why?</p>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-400 outline-none" placeholder="Write the correct reporting sequence and explain why it matters."></textarea>
                            </label>
                        </div>
                        <div class="rounded-3xl border border-white/10 bg-white/5 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-indigo-300 mb-4">Learn more</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <a href="https://www.wcb.ab.ca/claims/report-an-injury/" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-white hover:border-indigo-400 transition-all">WCB Alberta: Report an injury</a>
                                <a href="https://www.wcb.ab.ca/claims/the-claims-process/for-workers.html" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-sm font-semibold text-white hover:border-indigo-400 transition-all">WCB Alberta: Claims process for workers</a>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 mb-16 shadow-sm">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="p-3 bg-indigo-100 text-indigo-600 rounded-2xl"><i data-lucide="flask-conical" class="w-8 h-8"></i></div>
                            <div>
                                <h3 class="text-2xl font-black text-slate-800 uppercase tracking-tight">WHMIS Basics</h3>
                                <p class="text-slate-500 font-medium">This does not need to become a full WHMIS certification unit. Students need the essentials: label, SDS, training, and when to stop and ask.</p>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                            ${[
                                { title: 'What WHMIS is for', text: 'WHMIS helps workers understand hazardous products and use them more safely.' },
                                { title: 'Labels', text: 'A supplier label gives fast hazard information and safe-use clues.' },
                                { title: 'SDS', text: 'A safety data sheet gives more detailed information about identification, hazards, prevention, and response.' },
                                { title: 'Training', text: 'If hazardous products are present, employers must provide WHMIS education and worksite-specific training.' }
                            ].map(item => `
                                <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">${item.title}</p>
                                    <p class="text-sm font-semibold text-slate-700 leading-relaxed">${item.text}</p>
                                </div>
                            `).join('')}
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">WHMIS label and SDS challenge</span>
                                <p class="text-sm text-slate-700 leading-relaxed mb-4">If you are handed a chemical product you have never used before, what are the first things you should look for before using it?</p>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Mention the label, SDS, hazard information, PPE, and training."></textarea>
                            </label>
                            <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                <span class="block text-xs font-black uppercase tracking-widest text-slate-500 mb-3">When should a worker stop and ask for help?</span>
                                <textarea class="w-full min-h-[150px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Explain when you should stop before using a hazardous product."></textarea>
                            </label>
                        </div>
                        <div class="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Learn more</p>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <a href="https://www.ccohs.ca/teach_tools/chem_hazards/whmis_basics.html" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">CCOHS: WHMIS basics for young workers</a>
                                <a href="https://www.ccohs.ca/oshanswers/chemicals/whmis_ghs/education_training.pdf" target="_blank" rel="noreferrer noopener" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all">CCOHS: WHMIS education and training</a>
                            </div>
                        </div>
                    </section>

                    <section class="bg-white border-2 border-slate-200 rounded-[2.5rem] p-10 md:p-14 shadow-sm border-b-8 border-b-indigo-500">
                        <h3 class="text-3xl font-black mb-4 text-slate-800 uppercase tracking-tight">Final Knowledge Check</h3>
                        <p class="text-slate-400 mb-10 italic font-medium leading-relaxed">Use the final scenarios to show that you can apply the rules, not just repeat them.</p>
                        <div class="space-y-8 mb-10">
                            ${[
                                'An interviewer asks if you plan to have children.',
                                'Your supervisor asks you to use an unfamiliar chemical without training.',
                                'Your shift is changed with almost no notice and you are not given enough rest between shifts.'
                            ].map((scenario, index) => `
                                <label class="block rounded-3xl border border-slate-200 bg-slate-50 p-6">
                                    <span class="block text-sm font-black text-slate-800 mb-3">${index + 1}. ${scenario}</span>
                                    <textarea class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="What would you do, and which right or rule applies?"></textarea>
                                </label>
                            `).join('')}
                        </div>
                        <div class="rounded-3xl border border-indigo-100 bg-indigo-50 p-6 mb-8">
                            <p class="text-xs font-black uppercase tracking-widest text-indigo-700 mb-3">Capstone scenario</p>
                            <p class="text-sm font-semibold text-slate-700 leading-relaxed mb-4">You are 16 and get hired at a restaurant. In the interview you are asked a personal question, then on your first week you are scheduled late, given a cleaner without training, and told not to report a minor injury. What rights issues do you notice, and what should you do at each step?</p>
                            <textarea class="w-full min-h-[180px] rounded-2xl border border-indigo-100 bg-white p-4 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-300 outline-none" placeholder="Walk through the situation in order and explain your decisions."></textarea>
                        </div>
                        <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                            <p class="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Source note</p>
                            <p class="text-sm text-slate-600 leading-relaxed">Rules can change. This section was updated from official Alberta.ca, Alberta Human Rights Commission, WCB Alberta, and CCOHS guidance current as of March 10, 2026. If a workplace rule or law has changed, the official source governs.</p>
                        </div>
                    </section>
                </div>
            `;
        }

        // --- HELPERS ---
        function toggleTrait(el) {
            if (!el.dataset.fieldKey) {
                wireInteractiveControls();
            }

            const nextState = !el.classList.contains('bg-indigo-600');
            applyTraitVisualState(el, nextState);
            storeTraitButtonState(el, nextState);
            updateLearningStyleSummary();
        }

        window.onload = init;




