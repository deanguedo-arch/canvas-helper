(() => {
/* inline script 1 */
// --- NAVIGATION LOGIC ---
        const SIDEBAR_COLLAPSE_KEY = 'sportswellness.sidebarCollapsed';
        const SIDEBAR_MOBILE_BREAKPOINT = 860;
        const PHASE1_ASSIGNMENT_STORAGE_KEY = 'sportswellness_phase1_assignment_v2';
        const PHASE1_ASSIGNMENT_LEGACY_STORAGE_KEY = 'mentalfitness10_option2_phase1_assignment_v2';
        const PHASE1_ASSIGNMENT_OLDER_STORAGE_KEY = 'elite_operator_v3_p1';
        const ASSIGNMENT_PROGRESS_CONFIG = [
            { storageKey: 'diag_data', metaId: 'meta-a0', barId: 'bar-a0' },
            { storageKey: PHASE1_ASSIGNMENT_STORAGE_KEY, metaId: 'meta-a1', barId: 'bar-a1' },
            { storageKey: 'vb_data', metaId: 'meta-a2a', barId: 'bar-a2a' },
            { storageKey: 'mb_data', metaId: 'meta-a2b', barId: 'bar-a2b' },
            { storageKey: 'p3_data', metaId: 'meta-a3', barId: 'bar-a3' },
            { storageKey: 'p4a_data', metaId: 'meta-a4a', barId: 'bar-a4a' },
            { storageKey: 'athlete_visualization_master_v1', metaId: 'meta-a4b', barId: 'bar-a4b' }
        ];

        function applySidebarCollapse(collapsed) {
            const isMobile = window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT}px)`).matches;
            const shouldCollapseDesktop = !isMobile && collapsed;
            const shouldOpenMobileMenu = isMobile && !collapsed;
            document.body.classList.toggle('sidebar-collapsed', shouldCollapseDesktop);
            document.body.classList.toggle('mobile-menu-open', shouldOpenMobileMenu);
            const toggle = document.getElementById('menu-collapse-toggle');
            if (!toggle) return;
            toggle.setAttribute('aria-expanded', shouldOpenMobileMenu || !shouldCollapseDesktop ? 'true' : 'false');
            toggle.title = isMobile
                ? (shouldOpenMobileMenu ? 'Condense menu' : 'Expand menu')
                : (shouldCollapseDesktop ? 'Expand menu' : 'Collapse menu');
        }

        function toggleSidebarCollapse() {
            const isMobile = window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT}px)`).matches;
            if (isMobile) {
                const isOpen = document.body.classList.contains('mobile-menu-open');
                const nextCollapsed = isOpen;
                applySidebarCollapse(nextCollapsed);
                return;
            }
            const isCollapsed = document.body.classList.contains('sidebar-collapsed');
            const next = !isCollapsed;
            applySidebarCollapse(next);
            localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0');
        }

        function condenseMobileMenu() {
            if (!window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT}px)`).matches) return;
            applySidebarCollapse(true);
        }

        document.addEventListener('click', (event) => {
            const trigger = event.target.closest('.nav-item, .module-link, .library-tab, .home-subnav button, .home-subnav a');
            if (!trigger || trigger.closest('.menu-toggle')) return;
            window.requestAnimationFrame(() => condenseMobileMenu());
        });

        function parseStoredJson(storageKey) {
            const raw = localStorage.getItem(storageKey);
            if (!raw) return null;
            try {
                return JSON.parse(raw);
            } catch (_error) {
                return null;
            }
        }

        function getFirstById(...ids) {
            for (const id of ids) {
                const element = document.getElementById(id);
                if (element) return element;
            }
            return null;
        }

        function setTextById(ids, text) {
            const element = Array.isArray(ids) ? getFirstById(...ids) : getFirstById(ids);
            if (element) element.innerText = text;
            return element;
        }

        function hasMeaningfulValue(value) {
            if (value == null) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            if (typeof value === 'number') return value !== 0;
            if (typeof value === 'boolean') return value;
            if (Array.isArray(value)) return value.some((entry) => hasMeaningfulValue(entry));
            if (typeof value === 'object') return Object.values(value).some((entry) => hasMeaningfulValue(entry));
            return false;
        }

        function estimateCompletionPercent(data) {
            if (!data || typeof data !== 'object') return 0;

            const coreEntries = Object.entries(data).filter(([key]) => key !== 'scores');
            if (coreEntries.length > 0) {
                const filled = coreEntries.filter(([, value]) => hasMeaningfulValue(value)).length;
                return Math.max(0, Math.min(100, Math.round((filled / coreEntries.length) * 100)));
            }

            const scores = data.scores && typeof data.scores === 'object' ? Object.values(data.scores) : [];
            if (scores.length === 0) return 0;
            const scoreTotal = scores.reduce((sum, score) => sum + (Number(score) || 0), 0);
            const maxScore = scores.length * 5;
            if (maxScore === 0) return 0;
            return Math.max(0, Math.min(100, Math.round((scoreTotal / maxScore) * 100)));
        }

        function refreshProgressUI() {
            let totalPercent = 0;
            let fullyCompleted = 0;

            ASSIGNMENT_PROGRESS_CONFIG.forEach((module) => {
                const parsed = parseStoredJson(module.storageKey);
                const percent = estimateCompletionPercent(parsed);
                totalPercent += percent;
                if (percent >= 100) fullyCompleted += 1;

                const meta = document.getElementById(module.metaId);
                if (meta) meta.innerText = `${percent}% complete`;

                const bar = document.getElementById(module.barId);
                if (bar) bar.style.width = `${percent}%`;
            });

            const totalModules = ASSIGNMENT_PROGRESS_CONFIG.length;
            const overallPercent = totalModules === 0 ? 0 : Math.round(totalPercent / totalModules);

            const count = document.getElementById('course-progress-count');
            const fill = document.getElementById('course-progress-fill');
            const text = document.getElementById('course-progress-text');
            const countMain = document.getElementById('course-progress-count-main');
            const fillMain = document.getElementById('course-progress-fill-main');
            const textMain = document.getElementById('course-progress-text-main');

            if (count) count.innerText = `${fullyCompleted}/${totalModules}`;
            if (fill) fill.style.width = `${overallPercent}%`;
            if (text) text.innerText = `${overallPercent}% complete`;
            if (countMain) countMain.innerText = `${fullyCompleted}/${totalModules}`;
            if (fillMain) fillMain.style.width = `${overallPercent}%`;
            if (textMain) textMain.innerText = `${overallPercent}% complete`;
        }

        function normalizeAssignmentNavBars() {
            // Keep original layout from runtime markup without adding wrapper classes.
            return;
        }

        function setLibraryView(view, keepCurrentView = false) {
            document.querySelectorAll('.library-tab').forEach((button) => button.classList.remove('active'));
            document.querySelectorAll('.library-section').forEach((section) => section.classList.add('hidden'));

            const tab = document.getElementById(`tab-${view}`);
            const section = document.getElementById(`library-${view}`);
            if (tab) tab.classList.add('active');
            if (section) section.classList.remove('hidden');

            if (keepCurrentView) {
                return;
            }

            if (view === 'phases') {
                switchView('phase-shell1');
            } else if (view === 'quizzes') {
                switchView('quizzes-empty');
            } else {
                switchView('phase1');
            }
        }

        function switchView(view) {
            document.getElementById('nav-materials')?.classList.remove('active');
            document.querySelectorAll('.module-link').forEach((button) => button.classList.remove('active'));

            // Hide all views
            document.getElementById('view-materials').classList.add('hidden');
            document.getElementById('view-intro').classList.add('hidden');
            document.getElementById('view-phase1').classList.add('hidden');
            document.getElementById('view-values').classList.add('hidden');
            document.getElementById('view-master').classList.add('hidden');
            document.getElementById('view-phase3').classList.add('hidden');
            document.getElementById('view-phase4a').classList.add('hidden');
            document.getElementById('view-phase4b').classList.add('hidden');
            document.getElementById('view-external').classList.add('hidden');
            document.getElementById('view-quizzes-empty').classList.add('hidden');
            document.getElementById('view-phase-shell1').classList.add('hidden');
            document.getElementById('view-phase-shell2').classList.add('hidden');
            document.getElementById('view-phase-shell3').classList.add('hidden');
            document.getElementById('view-phase-shell4').classList.add('hidden');

            const assignmentViews = new Set(['phase1', 'values', 'master', 'phase3', 'phase4a', 'phase4b']);
            const phaseViews = new Set(['phase-shell1', 'phase-shell2', 'phase-shell3', 'phase-shell4']);

            if (assignmentViews.has(view)) {
                setLibraryView('assignments', true);
            } else if (phaseViews.has(view)) {
                setLibraryView('phases', true);
            } else if (view === 'quizzes-empty') {
                setLibraryView('quizzes', true);
            }

            if(view === 'materials') {
                document.getElementById('view-materials').classList.remove('hidden');
                document.getElementById('nav-materials').classList.add('active');
            } else if(view === 'intro') {
                document.getElementById('view-intro').classList.remove('hidden');
            } else if(view === 'phase1') {
                document.getElementById('view-phase1').classList.remove('hidden');
                document.getElementById('nav-a1')?.classList.add('active');
            } else if(view === 'values') {
                document.getElementById('view-values').classList.remove('hidden');
                document.getElementById('nav-a2a')?.classList.add('active');
            } else if(view === 'master') {
                document.getElementById('view-master').classList.remove('hidden');
                document.getElementById('nav-a2b')?.classList.add('active');
            } else if(view === 'phase3') {
                document.getElementById('view-phase3').classList.remove('hidden');
                document.getElementById('nav-a3')?.classList.add('active');
            } else if(view === 'phase4a') {
                document.getElementById('view-phase4a').classList.remove('hidden');
                document.getElementById('nav-a4a')?.classList.add('active');
            } else if(view === 'phase4b') {
                document.getElementById('view-phase4b').classList.remove('hidden');
                document.getElementById('nav-a4b')?.classList.add('active');
            } else if (view === 'quizzes-empty') {
                document.getElementById('view-quizzes-empty').classList.remove('hidden');
            } else if (view === 'phase-shell1') {
                document.getElementById('view-phase-shell1').classList.remove('hidden');
                document.getElementById('nav-phase1')?.classList.add('active');
            } else if (view === 'phase-shell2') {
                document.getElementById('view-phase-shell2').classList.remove('hidden');
                document.getElementById('nav-phase2')?.classList.add('active');
            } else if (view === 'phase-shell3') {
                document.getElementById('view-phase-shell3').classList.remove('hidden');
                document.getElementById('nav-phase3')?.classList.add('active');
            } else if (view === 'phase-shell4') {
                document.getElementById('view-phase-shell4').classList.remove('hidden');
                document.getElementById('nav-phase4')?.classList.add('active');
            } else if(view === 'external') {
                document.getElementById('view-external').classList.remove('hidden');
            }
        }

        function loadExternal(url, btnId) {
            switchView('external');
            const frame = document.getElementById('view-external');
            frame.src = url;
            document.getElementById(btnId).classList.add('active');
        }

        function openPDF(url, title) {
            const container = document.getElementById('pdf-viewer-container');
            document.getElementById('pdf-frame').src = url;
            document.getElementById('viewer-title').innerText = "VIEWING: " + title;
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }

        function closeViewer() {
            document.getElementById('pdf-viewer-container').classList.add('hidden');
            document.getElementById('pdf-frame').src = "";
        }

        // --- DIAGNOSTIC MODULE (00) LOGIC ---
        let diag_scores = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0 };
        let diag_report_ready = false;
        function initDiagDom() {
            const logEntry = document.getElementById('log_entry');
            if (logEntry && !logEntry.dataset.bound) {
                logEntry.addEventListener('input', diag_handleLogInput);
                logEntry.dataset.bound = '1';
            }
        }
        function diag_totalScore() {
            return Object.values(diag_scores).reduce((sum, value) => sum + Number(value || 0), 0);
        }
        function diag_answeredCount() {
            return Object.values(diag_scores).filter((value) => Number(value || 0) > 0).length;
        }
        function diag_hasLogEntry() {
            return (document.getElementById('log_entry')?.value || '').trim().length > 0;
        }
        function diag_allPromptsRated() {
            return !Object.values(diag_scores).includes(0);
        }
        function diag_syncCompletionUI() {
            const completeButton = document.getElementById('diagnostic-mark-complete');
            const completeCopy = document.getElementById('diagnostic-complete-copy');
            if (!completeButton) return;
            const alreadyCompleted = completeButton.dataset.phaseComplete === '1';
            if (alreadyCompleted) return;
            completeButton.disabled = !diag_report_ready;
            if (!completeCopy) return;
            if (diag_report_ready) {
                completeCopy.innerText = completeCopy.dataset.readyCopy || completeCopy.innerText;
                return;
            }
            if (!diag_allPromptsRated()) {
                completeCopy.innerText = completeCopy.dataset.lockedCopy || completeCopy.innerText;
                return;
            }
            if (!diag_hasLogEntry()) {
                completeCopy.innerText = completeCopy.dataset.logCopy || completeCopy.innerText;
                return;
            }
            completeCopy.innerText = completeCopy.dataset.pendingCopy || completeCopy.innerText;
        }
        function diag_getFormData() {
            return {
                q1: diag_scores.q1 || 0,
                q2: diag_scores.q2 || 0,
                q3: diag_scores.q3 || 0,
                q4: diag_scores.q4 || 0,
                q5: diag_scores.q5 || 0,
                log: document.getElementById('log_entry')?.value || '',
                reportReady: diag_report_ready
            };
        }
        function diag_updateStatus() {
            const allRated = diag_allPromptsRated();
            const hasLog = diag_hasLogEntry();
            const complete = allRated && hasLog;
            const answered = diag_answeredCount();
            const total = diag_totalScore();
            const status = document.getElementById('system-status');
            if (status) {
                const statusText = diag_report_ready ? 'OPERATIONAL' : complete ? 'READY TO VERIFY' : 'PENDING CHECK';
                status.innerText = statusText;
                status.classList.toggle('text-rose-500', !complete);
                status.classList.toggle('text-amber-300', complete && !diag_report_ready);
                status.classList.toggle('text-emerald-400', diag_report_ready);
            }
            const totalEl = document.getElementById('diag-score-total');
            if (totalEl) totalEl.innerText = String(total).padStart(2, '0');
            const countEl = document.getElementById('diag-score-count');
            if (countEl) countEl.innerText = `${answered}/5 systems rated`;
            const progressFill = document.getElementById('diag-progress-fill');
            if (progressFill) progressFill.style.width = `${answered * 20}%`;
            const progressText = document.getElementById('diag-progress-text');
            if (progressText) {
                if (!allRated) {
                    const remaining = 5 - answered;
                    progressText.innerText = `${remaining} prompt${remaining === 1 ? '' : 's'} left before report unlocks.`;
                } else if (!hasLog) {
                    progressText.innerText = 'Add the operator log, then run diagnostics to unlock the report.';
                } else if (!diag_report_ready) {
                    progressText.innerText = 'Inputs are complete. Run diagnostics to unlock the report and completion.';
                } else {
                    progressText.innerText = 'Report unlocked. Generate the baseline report or mark this phase complete.';
                }
            }
            const btn = document.getElementById('print-btn');
            if (btn) {
                btn.disabled = !diag_report_ready;
                btn.classList.toggle('bg-slate-800', !diag_report_ready);
                btn.classList.toggle('cursor-not-allowed', !diag_report_ready);
                btn.classList.toggle('bg-emerald-600', diag_report_ready);
            }
            diag_syncCompletionUI();
        }
        function diag_saveData() {
            localStorage.setItem('diag_data', JSON.stringify(diag_getFormData()));
            const indicator = document.getElementById('save-indicator');
            if (indicator) {
                indicator.classList.remove('bg-slate-600');
                indicator.classList.add('bg-emerald-400');
            }
            setTextById(['save-text'], 'Saved');
            refreshProgressUI();
            setTimeout(() => {
                if (indicator) {
                    indicator.classList.add('bg-slate-600');
                    indicator.classList.remove('bg-emerald-400');
                }
                setTextById(['save-text'], 'System Ready');
            }, 1000);
        }
        function diag_handleLogInput() {
            diag_report_ready = false;
            diag_updateStatus();
            diag_saveData();
        }
        function diag_setScore(q, val, persist = true) {
            diag_scores[q] = val;
            diag_report_ready = false;
            const group = document.getElementById(q);
            if (!group) return;
            const buttons = group.getElementsByTagName('button');
            for(let btn of buttons) { btn.classList.remove('active'); }
            buttons[val-1].classList.add('active');
            diag_updateStatus();
            if (persist) diag_saveData();
        }
        function diag_populate(data) {
            const restoredScores = data?.scores && typeof data.scores === 'object'
                ? data.scores
                : {
                    q1: data?.q1 || 0,
                    q2: data?.q2 || 0,
                    q3: data?.q3 || 0,
                    q4: data?.q4 || 0,
                    q5: data?.q5 || 0
                };
            diag_scores = { q1: 0, q2: 0, q3: 0, q4: 0, q5: 0, ...restoredScores };
            const logEntry = document.getElementById('log_entry');
            if (logEntry) {
                logEntry.value = data?.log || '';
            }
            Object.keys(diag_scores).forEach((key) => {
                if (diag_scores[key] > 0) diag_setScore(key, diag_scores[key], false);
            });
            diag_report_ready = Boolean(data?.reportReady) && diag_allPromptsRated() && diag_hasLogEntry();
            diag_updateStatus();
        }
        function diag_calculateStatus() {
            if (!diag_allPromptsRated()) { alert("Please complete all items."); return; }
            if (!diag_hasLogEntry()) { alert("Please add the operator log before running diagnostics."); return; }
            diag_report_ready = true;
            diag_updateStatus();
            diag_saveData();
            document.getElementById('print-btn')?.focus();
        }
        function diag_downloadBackup() {
             const data = diag_getFormData();
             const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a'); a.href = url; a.download = "diag-backup.json"; a.click();
        }
        function diag_loadBackup(input) {
            const file = input.files[0]; if(!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                diag_populate(data);
                diag_saveData();
                alert("Loaded");
            };
            reader.readAsText(file);
        }
        function diag_generatePrint() {
            if (!diag_report_ready) {
                diag_calculateStatus();
                if (!diag_report_ready) return;
            }
            const log = document.getElementById('log_entry').value;
            const status = document.getElementById('system-status').innerText;
            const html = `<html><head><title>Protocol 001 Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: monospace; padding: 40px; background: white; color: black; }</style></head>
            <body><div class="border-b-4 border-black pb-4 mb-8 flex justify-between items-end"><div><h1 class="text-4xl font-black uppercase">Protocol 001</h1><p class="text-sm font-bold uppercase tracking-widest">Baseline Diagnostic Report</p></div><div class="text-right"><p class="text-xs uppercase">System Status</p><h2 class="text-2xl font-black italic">${status}</h2></div></div>
            <div class="grid grid-cols-2 gap-4 mb-8"><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 1: Engine</strong><div class="text-lg font-bold">${diag_scores.q1}/5 (Pressure)</div><div class="text-lg font-bold">${diag_scores.q2}/5 (Regulation)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 2: Drive</strong><div class="text-lg font-bold">${diag_scores.q3}/5 (Fuel Source)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 3: Focus</strong><div class="text-lg font-bold">${diag_scores.q4}/5 (Reset Speed)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 4: Toolkit</strong><div class="text-lg font-bold">${diag_scores.q5}/5 (Visualization)</div></div></div>
            <div class="p-6 bg-gray-100 border-l-4 border-black"><strong class="block uppercase text-xs mb-2">Operator's Log</strong><p class="italic">"${log}"</p></div><div class="mt-12 text-center text-xs uppercase font-bold tracking-widest">End of Report // Ready for Phase 1</div><script>window.onload = function() { window.print(); };<\/script></body></html>`;
            const win = window.open('','_blank'); win.document.write(html); win.document.close();
        }

        // --- PHASE 1 (THE ENGINE) LOGIC ---
        const p1_cats = [
  { id: 'reset', label: 'Stress Reset' },
  { id: 'tune', label: 'Arousal Control' },
  { id: 'focus', label: 'Attention Control' },
  { id: 'goals', label: 'Confidence Build' },
  { id: 'intel', label: 'Integration' }
];

const p1_storage_key = PHASE1_ASSIGNMENT_STORAGE_KEY;
const p1_legacy_storage_key = PHASE1_ASSIGNMENT_LEGACY_STORAGE_KEY;
const p1_older_storage_key = PHASE1_ASSIGNMENT_OLDER_STORAGE_KEY;
const p1_field_ids = [
  'p1_threat_trigger',
  'p1_breath_scenario',
  'p1_somatic_signals',
  'p1_cognitive_signals',
  'p1_breath_detail',
  'p1_interrupt_signal',
  'p1_under_zone',
  'p1_ideal_zone',
  'p1_over_zone',
  'p1_relax_plan',
  'p1_active_plan',
  'p1_internal_dist',
  'p1_external_dist',
  'p1_cue_inst',
  'p1_cue_mot',
  'p1_tunnel_sign',
  'p1_jam_scenario',
  'p1_fac_help',
  'p1_fac_hurt',
  'p1_situational_stressors',
  'p1_personal_stressors',
  'p1_goal_proc',
  'p1_goal_perf',
  'p1_goal_out',
  'p1_smart_final',
  'p1_final_narrative',
  'p1_zone_summary',
  'p1_crash_plan'
];

let p1_scores = { reset: 0, tune: 0, focus: 0, goals: 0, intel: 0 };
let p1_current_step = 0;
let p1_ready = false;
let p1_step_menu_open = false;

function p1_byId(id) {
  return document.getElementById(id);
}

function p1_totalScore() {
  return Object.values(p1_scores).reduce((sum, value) => sum + Number(value || 0), 0);
}

function p1_updateScoreSummary() {
  const totalEl = p1_byId('p1-score-total');
  if (totalEl) totalEl.textContent = String(p1_totalScore()).padStart(2, '0');

  document.querySelectorAll('#view-phase1 .score-btn').forEach((btn) => {
    const active = Number(btn.dataset.p1Score) === Number(p1_scores[btn.dataset.p1Cat] || 0);
    btn.classList.toggle('active', active);
  });
}

function p1_syncStepMenu() {
  const toggleCurrent = p1_byId('p1-step-toggle-current');
  const toggleButton = p1_byId('p1-step-toggle');
  const activeStep = document.querySelector('#view-phase1 .p1-step-btn.active');
  const activeLabel = activeStep ? activeStep.textContent.trim() : '00 Briefing';
  if (toggleCurrent) toggleCurrent.textContent = activeLabel;
  if (toggleButton) toggleButton.setAttribute('aria-expanded', p1_step_menu_open ? 'true' : 'false');
}

function p1_setStepMenuOpen(open) {
  const shell = p1_byId('p1-step-nav-shell');
  if (!shell) return;
  p1_step_menu_open = !!open;
  shell.classList.toggle('is-open', p1_step_menu_open);
  p1_syncStepMenu();
}

function p1_showStep(step) {
  p1_current_step = Math.max(0, Math.min(5, Number(step) || 0));

  document.querySelectorAll('#view-phase1 .p1-step').forEach((panel, index) => {
    panel.classList.toggle('hidden', index !== p1_current_step);
  });

  document.querySelectorAll('#view-phase1 .p1-step-btn').forEach((btn) => {
    const active = Number(btn.dataset.p1Step) === p1_current_step;
    btn.classList.toggle('active', active);
  });

  p1_setStepMenuOpen(false);

  if (p1_ready) p1_saveData();
}

function p1_getFormData() {
  const data = {};
  p1_field_ids.forEach((id) => {
    const field = p1_byId(id);
    data[id] = field ? field.value : '';
  });

  data.scores = { ...p1_scores };
  data.currentStep = p1_current_step;
  data.updatedAt = new Date().toISOString();
  return data;
}

function p1_readStoredData() {
  return parseStoredJson(p1_storage_key) || parseStoredJson(p1_legacy_storage_key) || parseStoredJson(p1_older_storage_key);
}

function p1_saveData() {
  try {
    localStorage.setItem(p1_storage_key, JSON.stringify(p1_getFormData()));
    refreshProgressUI();
  } catch (error) {
    console.warn('Phase 1 save failed', error);
  }
}

function p1_populate(data) {
  if (!data || typeof data !== 'object') return;

  p1_field_ids.forEach((id) => {
    const field = p1_byId(id);
    if (field && typeof data[id] === 'string') field.value = data[id];
  });

  if (data.scores && typeof data.scores === 'object') {
    p1_scores = {
      reset: Number(data.scores.reset || 0),
      tune: Number(data.scores.tune || 0),
      focus: Number(data.scores.focus || 0),
      goals: Number(data.scores.goals || 0),
      intel: Number(data.scores.intel || 0)
    };
  }

  p1_updateScoreSummary();
  p1_showStep(data.currentStep ?? 0);
}

function p1_setScore(cat, value) {
  if (!Object.prototype.hasOwnProperty.call(p1_scores, cat)) return;
  p1_scores[cat] = Number(value || 0);
  p1_updateScoreSummary();
  p1_saveData();
}

function p1_downloadBackup() {
  const blob = new Blob([JSON.stringify(p1_getFormData(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mental-fitness-phase1-assignment-backup.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function p1_loadBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result || '{}'));
      p1_populate(parsed);
      p1_saveData();
    } catch (error) {
      console.warn('Phase 1 backup load failed', error);
      alert('That backup file could not be loaded.');
    }
  };
  reader.readAsText(file);
}
function p1_linesForPdf(data) {
  return [
    ['Threat trigger', data.p1_threat_trigger],
    ['Pressure scenario', data.p1_breath_scenario],
    ['Somatic signals', data.p1_somatic_signals],
    ['Cognitive signals', data.p1_cognitive_signals],
    ['Centering / manual override', data.p1_breath_detail],
    ['First interrupt signal', data.p1_interrupt_signal],
    ['Under-activated zone', data.p1_under_zone],
    ['Ideal zone', data.p1_ideal_zone],
    ['Over-activated zone', data.p1_over_zone],
    ['Down-regulation plan', data.p1_relax_plan],
    ['Up-regulation plan', data.p1_active_plan],
    ['Internal distractors', data.p1_internal_dist],
    ['External distractors', data.p1_external_dist],
    ['Instructional cue', data.p1_cue_inst],
    ['Motivational cue', data.p1_cue_mot],
    ['Tunnel vision warning', data.p1_tunnel_sign],
    ['Jam scenario', data.p1_jam_scenario],
    ['When nerves help', data.p1_fac_help],
    ['When nerves hurt', data.p1_fac_hurt],
    ['Situational stressors', data.p1_situational_stressors],
    ['Personal stressors', data.p1_personal_stressors],
    ['Process goal', data.p1_goal_proc],
    ['Performance goal', data.p1_goal_perf],
    ['Outcome goal', data.p1_goal_out],
    ['SMART goal', data.p1_smart_final],
    ['Operating summary', data.p1_final_narrative],
    ['Zone summary', data.p1_zone_summary],
    ['Crash-prevention plan', data.p1_crash_plan],
    ['Scores', `Stress Reset ${data.scores.reset}/5 | Arousal ${data.scores.tune}/5 | Attention ${data.scores.focus}/5 | Confidence ${data.scores.goals}/5 | Integration ${data.scores.intel}/5 | Total ${p1_totalScore()}/25`]
  ];
}

function p1_generatePDF() {
  const data = p1_getFormData();
  const total = Object.values(p1_scores).reduce((a, b) => a + Number(b || 0), 0);
  const scoreDetails = p1_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p1_scores[c.id] || 0}/5</span></div>`).join('');
  const html = `<!DOCTYPE html><html><head><title>Regulation Engine: Full System</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .mini-val { font-size: 11px; line-height: 1.45; border-bottom: 1px solid black; padding-bottom: 6px; margin-bottom: 10px; min-height: 18px; font-style: italic; font-weight: 700; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">The Regulation Engine</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 1 Mastery Report</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/25</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#0284c7;">Stress Reset</h2><div class="label">Threat Trigger</div><div class="val">${data.p1_threat_trigger || '---'}</div><div class="label">Pressure Scenario</div><div class="val">${data.p1_breath_scenario || '---'}</div><div class="label">Somatic Signals</div><div class="mini-val">${data.p1_somatic_signals || '---'}</div><div class="label">Cognitive Signals</div><div class="mini-val">${data.p1_cognitive_signals || '---'}</div><div class="label">Manual Override</div><div class="mini-val">${data.p1_breath_detail || '---'}</div><div class="label">First Interrupt Signal</div><div class="mini-val">${data.p1_interrupt_signal || '---'}</div></div><div class="section" style="border-left-color:#059669;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#059669;">Arousal Control</h2><div class="label">Under-Activated</div><div class="mini-val">${data.p1_under_zone || '---'}</div><div class="label">Ideal Zone</div><div class="mini-val">${data.p1_ideal_zone || '---'}</div><div class="label">Over-Activated</div><div class="mini-val">${data.p1_over_zone || '---'}</div><div class="label">Down-Regulation</div><div class="mini-val">${data.p1_relax_plan || '---'}</div><div class="label">Up-Regulation</div><div class="mini-val">${data.p1_active_plan || '---'}</div></div></div><div class="grid grid-cols-2 gap-8 mt-4"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Targeting</h2><div class="label">Internal Distractors</div><div class="mini-val">${data.p1_internal_dist || '---'}</div><div class="label">External Distractors</div><div class="mini-val">${data.p1_external_dist || '---'}</div><div class="label">Instructional Cue</div><div class="mini-val">${data.p1_cue_inst || '---'}</div><div class="label">Motivational Cue</div><div class="mini-val">${data.p1_cue_mot || '---'}</div><div class="label">Tunnel Vision Warning</div><div class="mini-val">${data.p1_tunnel_sign || '---'}</div><div class="label">Jam Scenario</div><div class="mini-val">${data.p1_jam_scenario || '---'}</div></div><div class="section" style="border-left-color:#f59e0b;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#d97706;">Confidence Build</h2><div class="label">When Nerves Help</div><div class="mini-val">${data.p1_fac_help || '---'}</div><div class="label">When Nerves Hurt</div><div class="mini-val">${data.p1_fac_hurt || '---'}</div><div class="label">Situational Stressors</div><div class="mini-val">${data.p1_situational_stressors || '---'}</div><div class="label">Personal Stressors</div><div class="mini-val">${data.p1_personal_stressors || '---'}</div><div class="label">Goals</div><div class="mini-val"><b>Process:</b> ${data.p1_goal_proc || '---'}<br><b>Performance:</b> ${data.p1_goal_perf || '---'}<br><b>Outcome:</b> ${data.p1_goal_out || '---'}</div><div class="label">SMART Goal</div><div class="mini-val">${data.p1_smart_final || '---'}</div></div></div><div class="section" style="border-left-color:#0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Integration Narrative</h2><div class="narr-val">${data.p1_final_narrative || '---'}</div><div class="label" style="margin-top:12px;">Zone Summary</div><div class="mini-val">${data.p1_zone_summary || '---'}</div><div class="label">Crash-Prevention Plan</div><div class="mini-val">${data.p1_crash_plan || '---'}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`;
  const win = window.open('', '_blank');
  if (!win) {
    alert('Allow popups to generate the blueprint report.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
function p1_init() {
  const root = p1_byId('view-phase1');
  if (!root || root.dataset.p1Bound === 'true') return;
  root.dataset.p1Bound = 'true';

  document.querySelectorAll('#view-phase1 [data-p1-step]').forEach((btn) => {
    btn.addEventListener('click', () => p1_showStep(btn.dataset.p1Step));
  });

  const stepToggle = p1_byId('p1-step-toggle');
  if (stepToggle) {
    stepToggle.addEventListener('click', () => p1_setStepMenuOpen(!p1_step_menu_open));
  }

  document.querySelectorAll('#view-phase1 [data-p1-field]').forEach((field) => {
    field.addEventListener('input', p1_saveData);
    field.addEventListener('change', p1_saveData);
  });

  document.querySelectorAll('#view-phase1 .score-btn').forEach((btn) => {
    btn.addEventListener('click', () => p1_setScore(btn.dataset.p1Cat, btn.dataset.p1Score));
  });

  const loadInput = p1_byId('p1-load-file');
  const loadBtn = p1_byId('p1-load-backup');
  if (loadBtn && loadInput) {
    loadBtn.addEventListener('click', () => loadInput.click());
    loadInput.addEventListener('change', (event) => {
      const target = event.target;
      p1_loadBackup(target.files && target.files[0]);
      target.value = '';
    });
  }

  const saveBtn = p1_byId('p1-download-backup');
  if (saveBtn) saveBtn.addEventListener('click', p1_downloadBackup);

  const pdfBtn = p1_byId('p1-generate-pdf');
  if (pdfBtn) pdfBtn.addEventListener('click', p1_generatePDF);

  try {
    const existing = p1_readStoredData();
    if (existing) p1_populate(existing);
    else {
      p1_updateScoreSummary();
      p1_showStep(0);
    }
  } catch (error) {
    console.warn('Phase 1 load failed', error);
    p1_updateScoreSummary();
    p1_showStep(0);
  }

  p1_syncStepMenu();

  p1_ready = true;
  p1_saveData();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', p1_init, { once: true });
} else {
  p1_init();
}

// --- PHASE 2A (VALUES) LOGIC ---
        function setStepMarkup(id, html) {
            const step = document.getElementById(id);
            if (step) step.innerHTML = html;
            return step;
        }

        const phase2RubricScale = [1, 2, 3];
        const phase2ValuesMaxScore = 15;
        const phase2MasterMaxScore = 12;

        function normalizePhase2RubricScore(value) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric) || numeric <= 0) return 0;
            if (numeric >= 4) return 3;
            if (numeric >= 2) return 2;
            return 1;
        }

        function upgradePhase2FieldCards(root) {
            if (!root) return;
            root.querySelectorAll('label.rounded-2xl').forEach((card) => {
                if (card.dataset.phase2FieldCard === 'v1') return;

                card.classList.add('phase2-field-card');
                const children = Array.from(card.children);
                const headerNodes = [];
                const kicker = children[0];
                const note = children[1];

                if (kicker && kicker.matches('span.text-xs.font-semibold.uppercase')) {
                    kicker.classList.add('phase2-field-kicker');
                    headerNodes.push(kicker);
                }

                if (note && note.matches('p.text-slate-400')) {
                    note.classList.add('phase2-field-note');
                    headerNodes.push(note);
                }

                if (headerNodes.length) {
                    const copy = document.createElement('div');
                    copy.className = 'phase2-field-copy';
                    card.insertBefore(copy, headerNodes[0]);
                    headerNodes.forEach((node) => copy.appendChild(node));
                }

                Array.from(card.children).forEach((child) => {
                    if (child.matches('textarea, input, select')) {
                        child.classList.add('phase2-field-control');
                    }
                });

                card.dataset.phase2FieldCard = 'v1';
            });
        }

        function buildPhase2ScoreButtons(prefix, catId) {
            if (prefix === 'vb') {
                return [1,2,3].map(v => `<button onclick="vb_setScore('${catId}', ${v})" data-score="${v}" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('');
            }

            return [1,2,3].map(v => `<button onclick="mb_setScore('${catId}', ${v})" data-score="${v}" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('');
        }

        function buildValuesPhase2Shell() {
            return `
                <div class="mx-auto w-full max-w-none space-y-6 text-white">
                    <section class="rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:items-start">
                            <div class="space-y-3">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-300/75">Assignment 02A</p>
                                <div>
                                    <h1 class="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">The Values Blueprint</h1>
                                    <p class="mt-2 p1-phase-subtitle text-xs uppercase tracking-[0.32em] text-slate-400">Phase 2 / identity, standards, and support</p>
                                </div>
                                <p class="max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
                                    Translate the drive chapter into a personal standard system. This assignment turns values into observable
                                    behaviors, pressure filters, and support structures so effort stays aligned when stress rises.
                                </p>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:min-w-0">
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Mastery score</p>
                                    <div class="mt-3 flex items-end gap-2">
                                        <span id="vb-total-score" class="text-4xl font-black tracking-tight text-cyan-300">00</span>
                                        <span class="pb-1 text-sm uppercase tracking-[0.3em] text-slate-500">/15</span>
                                    </div>
                                    <p class="mt-2 text-xs leading-6 text-slate-400">Review scoring stays manual so you can judge how complete and specific the blueprint really is.</p>
                                </div>
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 p1-file-actions">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">File actions</p>
                                    <div class="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                        <span id="vb-save-indicator" class="h-2 w-2 rounded-full bg-slate-600"></span>
                                        <span id="vb-save-text">System Ready</span>
                                    </div>
                                    <div class="mt-3 flex flex-wrap gap-3">
                                        <button type="button" onclick="vb_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button>
                                        <button type="button" onclick="document.getElementById('vb-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button>
                                    </div>
                                    <p class="mt-3 text-[10px] italic text-slate-500">Generate the blueprint report from the review step below.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4">
                        <div id="vb-step-nav-shell" class="p1-step-nav-shell">
                            <button id="vb-step-toggle" type="button" onclick="vb_toggleStepMenu()" class="p1-step-toggle" aria-expanded="false">
                                <span class="p1-step-toggle-copy">
                                    <span class="p1-step-toggle-kicker mono">Step Menu</span>
                                    <span id="vb-step-toggle-current" class="p1-step-toggle-current mono">00 Briefing</span>
                                </span>
                                <span class="p1-step-toggle-bars" aria-hidden="true">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                            <div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2 p1-step-nav">
                                <button type="button" onclick="vb_showStep(0)" class="mod-nav-btn p1-step-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">00 Briefing</button>
                                <button type="button" onclick="vb_showStep(1)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Clarify</button>
                                <button type="button" onclick="vb_showStep(2)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Standards</button>
                                <button type="button" onclick="vb_showStep(3)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Filters</button>
                                <button type="button" onclick="vb_showStep(4)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Review</button>
                            </div>
                        </div>
                    </section>

                    <section id="vb-step0" class="step-content active p1-step space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="vb-step1" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="vb-step2" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="vb-step3" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="vb-step4" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                </div>
                <input id="vb-file-upload" type="file" accept="application/json" class="hidden" onchange="vb_loadBackup(this)" />
            `;
        }

        function buildMasterPhase2Shell() {
            return `
                <div class="mx-auto w-full max-w-none space-y-6 text-white">
                    <section class="rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:items-start">
                            <div class="space-y-3">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-300/75">Assignment 02B</p>
                                <div>
                                    <h1 class="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">The Master Config</h1>
                                    <p class="mt-2 p1-phase-subtitle text-xs uppercase tracking-[0.32em] text-slate-400">Phase 2 / integrated discipline, recovery, and maintenance</p>
                                </div>
                                <p class="max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
                                    Build a repeatable operating system for hard days. This assignment converts the phase reading into default
                                    settings, if-then responses, recovery thresholds, and a maintenance loop that can survive pressure.
                                </p>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:min-w-0">
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Mastery score</p>
                                    <div class="mt-3 flex items-end gap-2">
                                        <span id="mb-total-score" class="text-4xl font-black tracking-tight text-cyan-300">00</span>
                                        <span class="pb-1 text-sm uppercase tracking-[0.3em] text-slate-500">/12</span>
                                    </div>
                                    <p class="mt-2 text-xs leading-6 text-slate-400">Review scoring stays manual so you can judge how durable the full system really is.</p>
                                </div>
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 p1-file-actions">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">File actions</p>
                                    <div class="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                        <span id="mb-save-indicator" class="h-2 w-2 rounded-full bg-slate-600"></span>
                                        <span id="mb-save-text">System Ready</span>
                                    </div>
                                    <div class="mt-3 flex flex-wrap gap-3">
                                        <button type="button" onclick="mb_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button>
                                        <button type="button" onclick="document.getElementById('mb-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button>
                                    </div>
                                    <p class="mt-3 text-[10px] italic text-slate-500">Generate the blueprint report from the review step below.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4">
                        <div id="mb-step-nav-shell" class="p1-step-nav-shell">
                            <button id="mb-step-toggle" type="button" onclick="mb_toggleStepMenu()" class="p1-step-toggle" aria-expanded="false">
                                <span class="p1-step-toggle-copy">
                                    <span class="p1-step-toggle-kicker mono">Step Menu</span>
                                    <span id="mb-step-toggle-current" class="p1-step-toggle-current mono">00 Briefing</span>
                                </span>
                                <span class="p1-step-toggle-bars" aria-hidden="true">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                            <div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2 p1-step-nav">
                                <button type="button" onclick="mb_showStep(0)" class="mod-nav-btn p1-step-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">00 Briefing</button>
                                <button type="button" onclick="mb_showStep(1)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Audit</button>
                                <button type="button" onclick="mb_showStep(2)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Defaults</button>
                                <button type="button" onclick="mb_showStep(3)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Plans</button>
                                <button type="button" onclick="mb_showStep(4)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Review</button>
                            </div>
                        </div>
                    </section>

                    <section id="mb-step0" class="step-content active p1-step space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="mb-step1" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="mb-step2" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="mb-step3" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="mb-step4" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                </div>
                <input id="mb-file-upload" type="file" accept="application/json" class="hidden" onchange="mb_loadBackup(this)" />
            `;
        }

        function buildValuesStep0Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 00</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mission briefing</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Phase 2 asks a different question than Phase 1: what is actually driving your effort, and what system keeps that effort aligned when pressure, fatigue, or evaluation show up? This blueprint converts values from abstract ideals into standards, decision filters, and support structures you can actually use.</p></div><div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-3"><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Values as filters</p><p class="mt-3 text-sm leading-7 text-slate-300">Your values should do more than sound impressive. They should help you answer hard questions, correct drift quickly, and define the standard you want to live into under pressure.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Quality of motivation</p><p class="mt-3 text-sm leading-7 text-slate-300">The reading warns that effort can be driven by guilt, image, or fear just as easily as identity and purpose. This blueprint asks you to name the real driver, not the polished answer.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Standards in action</p><p class="mt-3 text-sm leading-7 text-slate-300">If someone watched your training week, they should be able to see your values without hearing you explain them. This assignment turns belief into repeatable behavior.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Social context</p><p class="mt-3 text-sm leading-7 text-slate-300">Environment matters. Support people, pit crew settings, and warning signs are part of the system, not optional add-ons once things are already going wrong.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Repair over shame</p><p class="mt-3 text-sm leading-7 text-slate-300">When drift happens, the goal is repair. Decision filters and self-compassion acts help you return to standard without collapsing into avoidance or self-attack.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Output</p><p class="mt-3 text-sm leading-7 text-slate-300">By the end you should have three values, visible standards, hard-choice filters, and a support system that protects the identity you are trying to become.</p></article></div><div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">What this assignment should produce</p><ul class="mt-3 grid gap-2 text-sm leading-7 text-slate-300 md:grid-cols-2"><li>1. Three values that can survive hard moments instead of only good moods.</li><li>2. Training and competition standards that make those values visible.</li><li>3. Decision filters for hard choices, mistakes, and daily drift.</li><li>4. A support environment, warning system, and recovery-friendly reset plan.</li><li>5. A final synthesis that explains how values protect sustainable effort.</li></ul></div>`;
        }

        function buildValuesStep1Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 01</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Clarify the values</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">List your top three core values. Choose the beliefs that define you when things get difficult, not the ones that only sound impressive on a good day.</p></div><div class="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]"><div class="space-y-5"><div class="grid gap-5 xl:grid-cols-3"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Core value 01</span><select id="vb_value1" onchange="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300"><option value="">Select value...</option></select><div id="v1-def-box" class="mt-4 hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Definition</p><p id="v1-definition" class="mt-2 text-sm leading-6 text-slate-300"></p></div><ul class="mt-4 space-y-2 text-sm leading-6 text-slate-400"><li>Does this define me under pressure?</li><li>Is this who I am at my best?</li><li>Can I use it as a decision filter?</li></ul></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Core value 02</span><select id="vb_value2" onchange="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300"><option value="">Select value...</option></select><div id="v2-def-box" class="mt-4 hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Definition</p><p id="v2-definition" class="mt-2 text-sm leading-6 text-slate-300"></p></div><ul class="mt-4 space-y-2 text-sm leading-6 text-slate-400"><li>Does this raise my standard?</li><li>Would other people see it in my behavior?</li><li>Would I still choose it on a bad day?</li></ul></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Core value 03</span><select id="vb_value3" onchange="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300"><option value="">Select value...</option></select><div id="v3-def-box" class="mt-4 hidden rounded-2xl border border-slate-800 bg-slate-950/60 p-4"><p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Definition</p><p id="v3-definition" class="mt-2 text-sm leading-6 text-slate-300"></p></div><ul class="mt-4 space-y-2 text-sm leading-6 text-slate-400"><li>Will this help with hard choices?</li><li>Does it describe the person I am building?</li><li>Is it strong enough to anchor repair?</li></ul></div></div><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Why these values matter</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain why these values are non-negotiable for the person you are trying to become.</p><textarea id="vb_values_why" oninput="vb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe what these values protect, why they matter now, and what changes when you live by them."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What is driving your effort right now?</span><p class="mt-2 text-sm leading-6 text-slate-400">Use the chapter lens: pressure, guilt, values, identity, enjoyment, or fear. Name what is actually driving this week's effort.</p><textarea id="vb_motivation_driver" oninput="vb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Be honest about whether your effort is being pulled by meaning, image, pressure, or a mix."></textarea></label></div></div><aside class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Reference list</span><p class="mt-2 text-sm leading-6 text-slate-400">Use the list as a prompt bank, not a menu to copy from casually. Pick values that actually survive stress.</p><div id="values-list" class="custom-scroll mt-4 max-h-[520px] overflow-y-auto space-y-2 pr-2 text-sm leading-6 text-slate-300"></div></aside></div>`;
        }

        function buildValuesStep2Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 02</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Values in action</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Translate the values into visible behaviors. If someone watched a week of training or competition, they should be able to see these standards without you explaining them.</p></div><div class="grid gap-5 lg:grid-cols-3"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Training standards</span><p class="mt-2 text-sm leading-6 text-slate-400">What behaviors prove your values in practice, study, recovery, and preparation?</p><textarea id="vb_training_behaviors" oninput="vb_saveData()" rows="9" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the concrete actions that show your values are active in ordinary work."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Competition standards</span><p class="mt-2 text-sm leading-6 text-slate-400">What behaviors prove your values when pressure, evaluation, or uncertainty rises?</p><textarea id="vb_competition_behaviors" oninput="vb_saveData()" rows="9" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe what those values look like when the environment becomes stressful."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Weekly proof action</span><p class="mt-2 text-sm leading-6 text-slate-400">What single controllable process action will prove these values this week?</p><textarea id="vb_task_bridge" oninput="vb_saveData()" rows="9" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the action that makes the values concrete instead of theoretical."></textarea></label></div><div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quality check</p><p class="mt-3 text-sm leading-7 text-slate-300">Strong standards are observable, controllable, and specific enough that someone else could recognize them in real behavior. Weak standards stay abstract, moralizing, or too vague to guide action.</p></div>`;
        }

        function buildValuesStep3Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 03</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Filters and support</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Build the questions, warning signs, and support conditions that protect your values when motivation dips or pressure spikes.</p></div><div class="grid gap-5 lg:grid-cols-2"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Before a hard choice</span><p class="mt-2 text-sm leading-6 text-slate-400">What question will you ask before a difficult decision?</p><input type="text" id="vb_filter_hard" oninput="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: What would discipline do here?" /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">After a mistake</span><p class="mt-2 text-sm leading-6 text-slate-400">What question brings you back into alignment after a slip?</p><input type="text" id="vb_filter_mistake" oninput="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: What choice keeps me aligned right now?" /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Aligned habits</span><p class="mt-2 text-sm leading-6 text-slate-400">What routines, environments, or habits already support your standard?</p><textarea id="vb_aligned_habits" oninput="vb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Identify what is already helping the values stay active."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Out-of-alignment habits</span><p class="mt-2 text-sm leading-6 text-slate-400">What patterns, moods, or settings pull you away from your standard?</p><textarea id="vb_drift_habits" oninput="vb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the leaks honestly so you can catch them earlier."></textarea></label></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">How it feels when aligned</span><p class="mt-2 text-sm leading-6 text-slate-400">What physical or mental signs tell you the values are active?</p><textarea id="vb_feeling" oninput="vb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the body and mind state that tells you you are living in line with the blueprint."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Warning signs</span><p class="mt-2 text-sm leading-6 text-slate-400">What are the first signals that stress, fatigue, or ego is starting to take over?</p><textarea id="vb_warning" oninput="vb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="List the earliest clues that your values are starting to slip."></textarea></label><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Support person</span><p class="mt-2 text-sm leading-6 text-slate-400">Who helps you stay honest and aligned?</p><input type="text" id="vb_support_person" oninput="vb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the person who helps you tell the truth." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Pit crew environment</span><p class="mt-2 text-sm leading-6 text-slate-400">What social or physical setting helps you hold the line?</p><textarea id="vb_pit_crew" oninput="vb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the room, people, or atmosphere that protects the system."></textarea></label></div><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Repair action</span><p class="mt-2 text-sm leading-6 text-slate-400">What will you do to reset without slipping into shame or avoidance?</p><textarea id="vb_self_compassion" oninput="vb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Write the compassionate action that helps you repair and re-align."></textarea></label></div></div>`;
        }

        function buildValuesStep4Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 04</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Review and synthesis</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Audit the blueprint, then explain how the values, standards, and support system actually work together.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid"><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Integrity audit</span><p class="mt-2 text-sm leading-6 text-slate-400">Score how specific, usable, and honest the blueprint feels right now.</p><div id="vb-scoring-container" class="mt-4 space-y-4"></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What strong work looks like</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>Values are real filters, not generic virtues.</li><li>Standards are visible in training and competition.</li><li>Motivation quality is named honestly.</li><li>Support and warning systems are specific enough to use quickly.</li></ul></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Understanding narrative</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain why you chose these values and how this blueprint changes your daily behavior, effort quality, and support strategy.</p><textarea id="vb_narrative" oninput="vb_saveData()" rows="11" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Show how your values, standards, filters, and support environment connect into one coherent system."></textarea></label><div class="rounded-2xl border border-cyan-400/20 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Final synthesis</span><p id="vb-summary-preview" class="mt-3 text-sm leading-7 text-slate-300">...</p></div></div></div><div class="p1-rubric-shell overflow-x-auto"><table class="min-w-[980px] w-full border-collapse p1-rubric-table"><thead><tr><th>Criteria</th><th>Proficient</th><th>Developing</th><th>Emerging</th></tr></thead><tbody><tr><th>Values clarification</th><td>Three values are clearly chosen, defined, and strong enough to guide hard choices.</td><td>Values are present but partly generic, repetitive, or only loosely tied to identity.</td><td>Values are missing, random, or too vague to guide behavior.</td></tr><tr><th>Values in action</th><td>Training, competition, and weekly proof actions are specific, observable, and believable.</td><td>Some standards are useful, but others stay abstract or difficult to see in action.</td><td>Behavior standards are missing, generic, or disconnected from the chosen values.</td></tr><tr><th>Decision filters</th><td>Hard-choice and mistake filters are practical, memorable, and clearly tied to repair.</td><td>Filters exist but need stronger wording, clearer use cases, or better alignment.</td><td>Filters are absent or too vague to help under pressure.</td></tr><tr><th>Support system</th><td>Warning signs, pit crew context, and repair actions create a real support structure.</td><td>Support ideas exist, but they are thin, incomplete, or not connected to actual drift patterns.</td><td>Support system is incomplete or missing.</td></tr><tr><th>Integration</th><td>The narrative shows how values, motivation quality, standards, and support work as one system.</td><td>The narrative covers pieces of the assignment but does not fully integrate them.</td><td>The narrative is missing or shows limited understanding of how the blueprint should work.</td></tr></tbody></table></div><div class="flex flex-col md:flex-row gap-4 pt-2"><button type="button" onclick="vb_showStep(0)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button type="button" onclick="vb_generateFullPrint()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Generate Blueprint PDF</button></div>`;
        }

        function buildMasterStep0Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 00</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mission briefing</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">The phase reading argues that discipline lasts when motivation quality, recovery, and social context work together. This assignment turns that claim into an operating system: audit the current system, define your defaults, script the predictable stress moments, and build a maintenance loop that survives bad days.</p></div><div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">System audit</p><p class="mt-3 text-sm leading-7 text-slate-300">Start by reading the whole environment honestly: strengths, leaks, social context, and recovery signals.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Default settings</p><p class="mt-3 text-sm leading-7 text-slate-300">Before, during, and after performance, define the state you want to return to on purpose instead of improvising from stress.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">If-then plans</p><p class="mt-3 text-sm leading-7 text-slate-300">Predictable breakdowns do not need fresh debate. Script the response to anxiety, motivation drops, and mistakes now.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Maintenance loop</p><p class="mt-3 text-sm leading-7 text-slate-300">Daily checks, weekly review, recovery data, and pit crew context protect the system from drifting back into reactive effort.</p></article></div><div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">What this assignment should produce</p><ul class="mt-3 grid gap-2 text-sm leading-7 text-slate-300 md:grid-cols-2"><li>1. An honest system audit that includes context and recovery signals.</li><li>2. Defaults for pre-, in-, and post-performance behavior.</li><li>3. If-then plans for common breakdown points.</li><li>4. A goal ladder that separates outcome, performance, and process.</li><li>5. A maintenance loop with deload logic and support accountability.</li></ul></div>`;
        }

        function buildMasterStep1Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 01</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">System audit</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Use the person-by-situation lens from the chapter. You are not only auditing yourself. You are auditing the system around you.</p></div><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Performance identity</span><p class="mt-2 text-sm leading-6 text-slate-400">How do you want to describe the person you are when the system is healthy?</p><input type="text" id="mb_anchor" oninput="mb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-white outline-none transition focus:border-cyan-300" placeholder="I am..." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Compass value</span><p class="mt-2 text-sm leading-6 text-slate-400">What value should stay visible even on high-pressure or low-energy days?</p><input type="text" id="mb_value" oninput="mb_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Core guiding value..." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">System strengths</span><p class="mt-2 text-sm leading-6 text-slate-400">What habits, routines, or relationships are already strengthening the system?</p><textarea id="mb_strengths" oninput="mb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="List the patterns that currently support strong performance and sustainable effort."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Performance leaks</span><p class="mt-2 text-sm leading-6 text-slate-400">What habits, environments, or reactions destabilize the system?</p><textarea id="mb_leaks" oninput="mb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Identify the patterns that make the system brittle or reactive."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Support environment</span><p class="mt-2 text-sm leading-6 text-slate-400">What coach, teammate, room, routine, or level of solitude helps you work well?</p><textarea id="mb_support_environment" oninput="mb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the social and physical environment that supports strong execution."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Recovery signals</span><p class="mt-2 text-sm leading-6 text-slate-400">What signs tell you sleep, mood, concentration, or soreness are starting to slip?</p><textarea id="mb_recovery_signals" oninput="mb_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the early data points that tell you the system is under-recovered."></textarea></label></div>`;
        }

        function buildMasterStep2Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 02</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Default settings</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Set intentional defaults for before, during, and after performance. These are the states you want to return to, not just the feelings you hope appear on their own.</p></div><div class="grid gap-5 lg:grid-cols-3"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Pre-performance default</span><p class="mt-2 text-sm leading-6 text-slate-400">How do you want to enter performance?</p><textarea id="mb_pre_default" oninput="mb_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the posture, breathing, attention, and intent you want before performance."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">In-performance default</span><p class="mt-2 text-sm leading-6 text-slate-400">What state do you want to return to during execution?</p><textarea id="mb_in_default" oninput="mb_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the steady execution state you want to return to quickly."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Post-performance default</span><p class="mt-2 text-sm leading-6 text-slate-400">What is your first move after training or competition?</p><textarea id="mb_post_default" oninput="mb_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the default that protects recovery, perspective, and clean evaluation."></textarea></label></div><div class="rounded-2xl border border-slate-700 bg-slate-900/70 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Standard check</p><p class="mt-3 text-sm leading-7 text-slate-300">Good defaults are behavioral and repeatable. They describe what you do, how you regulate, and what you return to when execution starts to drift.</p></div>`;
        }

        function buildMasterStep3Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 03</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">If-then plans and goal ladder</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Anticipate predictable breakdowns and remove hesitation by scripting the response now. Then separate outcome, performance, and process so the system knows what it is trying to protect.</p></div><div class="grid gap-5 lg:grid-cols-2"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">If anxiety spikes, then...</span><p class="mt-2 text-sm leading-6 text-slate-400">What response do you want to automate the moment stress climbs too high?</p><textarea id="mb_if_anxiety" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Write the exact sequence you want to execute instead of debating in the moment."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">If motivation drops, then...</span><p class="mt-2 text-sm leading-6 text-slate-400">What maintenance response keeps the system moving without fake intensity?</p><textarea id="mb_if_motivation" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the low-drama action that keeps the system honest."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">If a mistake rattles you, then...</span><p class="mt-2 text-sm leading-6 text-slate-400">What is the reset sequence after an error, miss, or disruption?</p><textarea id="mb_if_mistake" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Write the next-action reset you want to become automatic."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Weekly process action</span><p class="mt-2 text-sm leading-6 text-slate-400">What controllable weekly action proves the system is still working?</p><textarea id="mb_process_action" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the one process action that keeps the system honest this week."></textarea></label></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Goal ladder</span><p class="mt-2 text-sm leading-6 text-slate-400">Use the chapter hierarchy: outcome goals provide direction, performance goals measure progress, and process goals protect execution under pressure.</p><div class="mt-4 grid gap-5"><label class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Outcome goal</span><p class="mt-2 text-sm leading-6 text-slate-400">What final result matters?</p><textarea id="mb_goal_outcome" oninput="mb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the big result that gives the system direction."></textarea></label><label class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Performance goal</span><p class="mt-2 text-sm leading-6 text-slate-400">What personal benchmark shows progress?</p><textarea id="mb_goal_performance" oninput="mb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the standard that tells you the system is improving."></textarea></label><label class="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Process goal</span><p class="mt-2 text-sm leading-6 text-slate-400">What cue, habit, or routine protects execution?</p><textarea id="mb_goal_process" oninput="mb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the controllable behavior that should still hold up on bad days."></textarea></label></div></div></div>`;
        }

        function buildMasterStep4Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 04</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Maintenance loop and review</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Finish the loop with check-ins, recovery thresholds, and an explanation of how the whole system works together.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid"><div class="space-y-5"><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Daily system check</span><p class="mt-2 text-sm leading-6 text-slate-400">What quick daily check tells you whether the system is healthy?</p><textarea id="mb_daily_check" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the fast daily read that prevents unnoticed drift."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Weekly review and update</span><p class="mt-2 text-sm leading-6 text-slate-400">How will you review and update the system each week?</p><textarea id="mb_weekly_review" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the weekly review ritual that keeps the plan current."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Recovery checkpoint</span><p class="mt-2 text-sm leading-6 text-slate-400">What do sleep, mood, concentration, and soreness suggest today?</p><textarea id="mb_recovery_checkpoint" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Turn recovery data into information instead of waiting for a full crash."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Pit crew check-in</span><p class="mt-2 text-sm leading-6 text-slate-400">When do you need accountability through connection, and when do you need relief from social evaluation?</p><textarea id="mb_pit_crew_check" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe how social context should support the system instead of destabilizing it."></textarea></label></div><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">When do you push and when do you back off?</span><p class="mt-2 text-sm leading-6 text-slate-400">Define the data that tells you to keep pushing, reduce load, or deload. What is your deload trigger?</p><textarea id="mb_recovery_threshold" oninput="mb_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Turn recovery information into a real decision rule."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Authentic pride</span><p class="mt-2 text-sm leading-6 text-slate-400">What have you earned through deliberate action rather than image or empty confidence?</p><textarea id="mb_pride" oninput="mb_saveData()" rows="4" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Finish the sentence honestly: I earned this because I..."></textarea></label><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">System integrity audit</span><p class="mt-2 text-sm leading-6 text-slate-400">Score how believable and durable the system feels right now.</p><div id="mb-scoring-container" class="mt-4 space-y-4"></div></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Understanding narrative</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain how the audit, defaults, plans, recovery data, and support environment work together as one system.</p><textarea id="mb_narrative" oninput="mb_saveData()" rows="12" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Show how this system protects performance quality, recovery, and sustainability."></textarea></label><div class="rounded-2xl border border-cyan-400/20 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Live summary</span><p id="mb-summary-preview" class="mt-3 text-sm leading-7 text-slate-300">...</p></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Durability check</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>Defaults are behavioral, not just emotional wishes.</li><li>If-then plans are short enough to execute fast.</li><li>Recovery data changes decisions instead of being ignored.</li><li>Social context is treated as part of the system.</li></ul></div></div></div><div class="p1-rubric-shell overflow-x-auto"><table class="min-w-[980px] w-full border-collapse p1-rubric-table"><thead><tr><th>Criteria</th><th>Proficient</th><th>Developing</th><th>Emerging</th></tr></thead><tbody><tr><th>System audit</th><td>Audit is specific about strengths, leaks, environment, and recovery signals instead of using generic language.</td><td>Audit names some useful information, but important patterns remain vague or incomplete.</td><td>Audit is missing or too thin to guide action.</td></tr><tr><th>Default settings</th><td>Pre-, in-, and post-performance defaults are clear, repeatable, and grounded in behavior.</td><td>Defaults are present but generic, emotional only, or difficult to repeat under stress.</td><td>Default settings are incomplete or missing.</td></tr><tr><th>If-then plans</th><td>Responses to anxiety, low motivation, mistakes, and weekly process demands are specific and actionable.</td><td>Some plans are useful, but others remain vague, reactive, or inconsistent.</td><td>If-then plans are missing or not actionable.</td></tr><tr><th>Maintenance loop</th><td>Daily check, weekly review, recovery checkpoint, deload rule, pit crew logic, and pride reflection create a believable maintenance system.</td><td>Maintenance loop exists but is thin, irregular, or only partly connected to the rest of the plan.</td><td>Maintenance loop is incomplete or missing.</td></tr></tbody></table></div><div class="flex flex-col md:flex-row gap-4 pt-2"><button type="button" onclick="mb_showStep(0)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button type="button" onclick="mb_generateFullPrint()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Generate Blueprint PDF</button></div>`;
        }

        function upgradePhase2Views() {
            const valuesRoot = document.getElementById('view-values');
            const masterRoot = document.getElementById('view-master');
            const valuesUpgraded = !valuesRoot || valuesRoot.dataset.phase2Upgrade === 'v1';
            const masterUpgraded = !masterRoot || masterRoot.dataset.phase2Upgrade === 'v1';
            if (valuesUpgraded && masterUpgraded) return;

            if (valuesRoot && !valuesUpgraded) {
                valuesRoot.innerHTML = buildValuesPhase2Shell();
                setStepMarkup('vb-step0', buildValuesStep0Markup());
                setStepMarkup('vb-step1', buildValuesStep1Markup());
                setStepMarkup('vb-step2', buildValuesStep2Markup());
                setStepMarkup('vb-step3', buildValuesStep3Markup());
                setStepMarkup('vb-step4', buildValuesStep4Markup());
                upgradePhase2FieldCards(valuesRoot);
                valuesRoot.dataset.phase2Upgrade = 'v1';
                vb_syncStepMenu();
            }

            if (masterRoot && !masterUpgraded) {
                masterRoot.innerHTML = buildMasterPhase2Shell();
                setStepMarkup('mb-step0', buildMasterStep0Markup());
                setStepMarkup('mb-step1', buildMasterStep1Markup());
                setStepMarkup('mb-step2', buildMasterStep2Markup());
                setStepMarkup('mb-step3', buildMasterStep3Markup());
                setStepMarkup('mb-step4', buildMasterStep4Markup());
                upgradePhase2FieldCards(masterRoot);
                masterRoot.dataset.phase2Upgrade = 'v1';
                mb_syncStepMenu();
            }

            return;

            const valuesHeader = document.querySelector('#view-values header');
            if (valuesHeader) {
                const subtitle = valuesHeader.querySelector('p');
                if (subtitle) subtitle.textContent = 'Identity, Standards, and Support';
                valuesHeader.querySelectorAll('.mod-nav-btn').forEach((button, index) => {
                    button.textContent = ['00 Mission', '01 Clarify', '02 Standards', '03 Filters', '04 Review'][index] || button.textContent;
                });
            }

            const valuesPrompt = document.querySelector('#vb-step1 p.text-slate-400');
            if (valuesPrompt) valuesPrompt.textContent = 'List your top three core values. Choose the beliefs that define you when things get difficult, not the ones that only sound impressive on a good day.';

            const valuesGrid = document.querySelector('#vb-step1 .grid.grid-cols-1.md\\:grid-cols-2.gap-6');
            if (valuesGrid && !document.getElementById('vb_value3')) {
                valuesGrid.classList.remove('md:grid-cols-2');
                valuesGrid.classList.add('md:grid-cols-3');
                valuesGrid.insertAdjacentHTML('beforeend', `<div class="space-y-4"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Core Value 03</label><select id="vb_value3" onchange="vb_saveData()" class="w-full rounded-lg p-4 text-lg font-bold text-white italic"><option value="">Select Value...</option></select></div><div class="bg-slate-950/50 p-4 rounded-xl border border-slate-800 min-h-[160px]"><p class="text-[9px] text-slate-500 uppercase font-bold mb-2 mono">Value 3 Filter Check</p><div id="v3-def-box" class="mb-4 hidden"><p class="text-[10px] font-black text-amber-400 uppercase mono mb-1 tracking-tighter italic">Definition:</p><p id="v3-definition" class="text-[11px] text-slate-200 leading-tight italic"></p></div><ul class="text-[10px] text-slate-400 space-y-1 italic"><li>- Does this define me?</li><li>- Is this me at my best?</li><li>- Is this my filter for hard decisions?</li></ul></div></div>`);
                valuesGrid.insertAdjacentHTML('afterend', `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Why do these values matter to you?</label><textarea id="vb_values_why" oninput="vb_saveData()" placeholder="Explain why these values are non-negotiable for the person you are trying to become..." class="w-full rounded-xl p-4 text-sm h-28 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What is driving your effort right now?</label><textarea id="vb_motivation_driver" oninput="vb_saveData()" placeholder="Use the study lens from the chapter: pressure, guilt, values, identity, enjoyment, or fear. What is actually driving this week's effort?" class="w-full rounded-xl p-4 text-sm h-28 resize-none text-slate-200 italic"></textarea></div></div>`);
            }

            const valuesStep2 = document.getElementById('vb-step2');
            if (valuesStep2 && !document.getElementById('vb_training_behaviors')) {
                valuesStep2.innerHTML = `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 02: Standards</h2></div><div class="p-8 space-y-8"><p class="text-slate-400 text-xs italic">Translate values into visible behaviors. If someone watched a week of training or competition, they should be able to see these standards without you explaining them.</p><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="space-y-3"><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 mono tracking-widest">What behaviors prove your values in training?</label><textarea id="vb_training_behaviors" oninput="vb_saveData()" placeholder="Describe concrete behaviors that show your values during practice, study, recovery, or preparation..." class="w-full rounded-xl p-4 text-sm h-40 resize-none text-slate-200 italic"></textarea></div><div class="space-y-3"><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 mono tracking-widest">What behaviors prove your values in competition?</label><textarea id="vb_competition_behaviors" oninput="vb_saveData()" placeholder="Describe what your values look like when pressure, evaluation, or uncertainty rises..." class="w-full rounded-xl p-4 text-sm h-40 resize-none text-slate-200 italic"></textarea></div><div class="space-y-3"><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 mono tracking-widest">What action proves these values this week?</label><textarea id="vb_task_bridge" oninput="vb_saveData()" placeholder="Name the controllable process action that makes your values concrete this week..." class="w-full rounded-xl p-4 text-sm h-40 resize-none text-slate-200 italic"></textarea></div></div><div class="flex justify-between pt-4"><button onclick="vb_showStep(1)" class="text-slate-500 font-bold uppercase text-[10px]">Back</button><button onclick="vb_showStep(3)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px]">Next</button></div></div>`;
            }

            const valuesStep3 = document.getElementById('vb-step3');
            if (valuesStep3 && !document.getElementById('vb_filter_hard')) {
                valuesStep3.innerHTML = `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 03: Decision Filters + Support</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><div class="space-y-6"><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 mono tracking-widest italic underline">Decision Filters</label><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">What question will you ask before a hard choice?</label><input type="text" id="vb_filter_hard" oninput="vb_saveData()" placeholder="Example: What would discipline do here?" class="w-full rounded-lg p-4 text-xs text-slate-200"></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">What question will you ask after a mistake?</label><input type="text" id="vb_filter_mistake" oninput="vb_saveData()" placeholder="Example: What choice keeps me aligned right now?" class="w-full rounded-lg p-4 text-xs text-slate-200"></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Where are your habits currently aligned?</label><textarea id="vb_aligned_habits" oninput="vb_saveData()" placeholder="Describe the routines, habits, or environments already supporting your values..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Where are you out of alignment?</label><textarea id="vb_drift_habits" oninput="vb_saveData()" placeholder="Identify the habits, moods, or environments that pull you off standard..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div></div><div class="space-y-6"><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 mono tracking-widest italic underline">Support + Warning System</label><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">How does it feel when aligned?</label><textarea id="vb_feeling" oninput="vb_saveData()" placeholder="Physical and mental signs that tell you your values are active..." class="w-full rounded-lg p-4 text-xs h-20 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Warning signs?</label><textarea id="vb_warning" oninput="vb_saveData()" placeholder="What are the first signs that stress, fatigue, or ego is taking over?" class="w-full rounded-lg p-4 text-xs h-20 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Support person</label><input type="text" id="vb_support_person" oninput="vb_saveData()" placeholder="Name the person who helps you stay honest..." class="w-full rounded-lg p-4 text-xs text-slate-200"></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Pit crew or support environment</label><textarea id="vb_pit_crew" oninput="vb_saveData()" placeholder="Describe the social setting, teammate, coach, or quiet space that helps you hold the line..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[9px] font-bold uppercase text-slate-600 mb-2 italic">Self-compassion act</label><textarea id="vb_self_compassion" oninput="vb_saveData()" placeholder="What will you do to reset without slipping into shame or avoidance?" class="w-full rounded-lg p-4 text-xs h-20 resize-none text-slate-200 italic"></textarea></div></div></div><div class="flex justify-between pt-4"><button onclick="vb_showStep(2)" class="text-slate-500 font-bold uppercase text-[10px]">Back</button><button onclick="vb_showStep(4)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px]">Next</button></div></div>`;
            }

            const masterHeader = document.querySelector('#view-master header');
            if (masterHeader) {
                const title = masterHeader.querySelector('h1');
                const subtitle = masterHeader.querySelector('p');
                if (title) title.textContent = 'Master Config';
                if (subtitle) subtitle.textContent = 'Integrated Discipline System';
                masterHeader.querySelectorAll('.mod-nav-btn').forEach((button, index) => {
                    button.textContent = ['00 Mission', '01 Audit', '02 Defaults', '03 Plans', '04 Review'][index] || button.textContent;
                });
            }

            setStepMarkup('mb-step0', `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 00: Mission Briefing</h2></div><div class="p-8 space-y-8"><div class="max-w-4xl mx-auto space-y-6"><p class="text-slate-400 text-sm italic leading-relaxed text-center">The Phase 2 chapter argues that discipline lasts when motivation quality, recovery, and social context work together. This assignment turns that idea into a stable operating system: audit the system you already have, define your defaults, script the hard moments, and build a maintenance loop that survives bad days.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div class="info-card"><h3 class="text-sky-400 font-bold uppercase text-xs mb-2 mono tracking-wider italic">System Audit</h3><p class="text-xs text-slate-300 leading-relaxed">Start with an honest read on what currently strengthens your system, what creates leaks, and what environment helps or hurts your effort.</p></div><div class="info-card border-l-emerald-500"><h3 class="text-emerald-400 font-bold uppercase text-xs mb-2 mono tracking-wider italic">Default Settings</h3><p class="text-xs text-slate-300 leading-relaxed">Before, during, and after performance, decide how you want to operate on purpose rather than improvising from stress.</p></div><div class="info-card border-l-rose-500"><h3 class="text-rose-500 font-bold uppercase text-xs mb-2 mono tracking-wider italic">If-Then Plans</h3><p class="text-xs text-slate-300 leading-relaxed">Predictable breakdowns do not need fresh debate. Script the response to anxiety spikes, motivation drops, mistakes, and resistance now.</p></div><div class="info-card border-l-amber-500"><h3 class="text-amber-500 font-bold uppercase text-xs mb-2 mono tracking-wider italic">Maintenance Loop</h3><p class="text-xs text-slate-300 leading-relaxed">Recovery checkpoint data, pit crew check-in choices, and daily or weekly review protect the system from drifting back into reactive effort.</p></div></div><div class="flex justify-center pt-6"><button onclick="mb_showStep(1)" class="bg-sky-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/20 active:scale-95">Start Configuration</button></div></div></div>`);
            setStepMarkup('mb-step1', `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 01: System Audit</h2></div><div class="p-8 space-y-6"><p class="text-slate-400 text-xs italic">Use the person-by-situation lens from the chapter. You are not only auditing yourself. You are auditing the system around you.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Performance identity</label><input type="text" id="mb_anchor" oninput="mb_saveData()" placeholder="I am..." class="w-full rounded-lg p-4 text-lg font-bold text-white italic"><p class="text-[9px] text-slate-600 mt-2 italic">Example: I am a person who keeps showing up with purpose.</p></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Compass value</label><input type="text" id="mb_value" oninput="mb_saveData()" placeholder="Core guiding value..." class="w-full rounded-lg p-4 text-slate-200"></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What currently strengthens your system?</label><textarea id="mb_strengths" oninput="mb_saveData()" placeholder="List the habits, routines, or relationships already working..." class="w-full rounded-lg p-4 text-xs h-28 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What currently creates performance leaks?</label><textarea id="mb_leaks" oninput="mb_saveData()" placeholder="Identify habits, environments, or patterns that destabilize you..." class="w-full rounded-lg p-4 text-xs h-28 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What social environment helps you perform well?</label><textarea id="mb_support_environment" oninput="mb_saveData()" placeholder="Describe the coach, teammate, room, routine, or amount of solitude that helps you work well..." class="w-full rounded-lg p-4 text-xs h-28 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What signs tell you recovery is slipping?</label><textarea id="mb_recovery_signals" oninput="mb_saveData()" placeholder="Sleep, mood, concentration, soreness, impatience, or other under-recovery signals..." class="w-full rounded-lg p-4 text-xs h-28 resize-none text-slate-200 italic"></textarea></div></div><div class="flex justify-between pt-4"><button onclick="mb_showStep(0)" class="text-slate-500 font-bold uppercase text-[10px]">Back</button><button onclick="mb_showStep(2)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px]">Next</button></div></div>`);
            setStepMarkup('mb-step2', `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 02: Default Settings</h2></div><div class="p-8 space-y-6"><p class="text-slate-400 text-xs italic">Set intentional defaults for before, during, and after performance. These are the states you want to return to, not just the feelings you hope show up on their own.</p><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Pre-performance default</label><textarea id="mb_pre_default" oninput="mb_saveData()" placeholder="Describe how you want to enter performance..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">In-performance default</label><textarea id="mb_in_default" oninput="mb_saveData()" placeholder="Describe the baseline state you want to return to..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Post-performance default</label><textarea id="mb_post_default" oninput="mb_saveData()" placeholder="Describe the first thing you do after competition or training..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div class="flex justify-between pt-4"><button onclick="mb_showStep(1)" class="text-slate-500 font-bold uppercase text-[10px]">Back</button><button onclick="mb_showStep(3)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px]">Next</button></div></div>`);
            setStepMarkup('mb-step3', `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-sky-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 03: If-Then Plans</h2></div><div class="p-8 space-y-6"><p class="text-slate-400 text-xs italic">Anticipate common breakdowns and remove hesitation by scripting the response now. You are building recovery, regulation, and momentum into the system before you need them.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">If anxiety spikes, then...</label><textarea id="mb_if_anxiety" oninput="mb_saveData()" placeholder="Write the response you want to automate..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">If motivation drops, then...</label><textarea id="mb_if_motivation" oninput="mb_saveData()" placeholder="Write the maintenance response..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">If a mistake rattles you, then...</label><textarea id="mb_if_mistake" oninput="mb_saveData()" placeholder="Write the reset sequence..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">What weekly process action proves the system is working?</label><textarea id="mb_process_action" oninput="mb_saveData()" placeholder="Name the controllable action that keeps the system honest this week..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div></div><div class="rounded-2xl border border-slate-800 bg-slate-950/40 p-6 space-y-6"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Goal Ladder</label><p class="text-slate-400 text-xs italic">Use the chapter's hierarchy: outcome goals provide direction, performance goals track progress, and process goals protect execution under pressure.</p></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Outcome goal</label><textarea id="mb_goal_outcome" oninput="mb_saveData()" placeholder="What final result matters?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Performance goal</label><textarea id="mb_goal_performance" oninput="mb_saveData()" placeholder="What personal standard shows progress?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Process goal</label><textarea id="mb_goal_process" oninput="mb_saveData()" placeholder="What controllable cue, habit, or routine protects execution?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div></div></div><div class="flex justify-between pt-4"><button onclick="mb_showStep(2)" class="text-slate-500 font-bold uppercase text-[10px]">Back</button><button onclick="mb_showStep(4)" class="bg-sky-600 px-8 py-3 rounded-lg text-white font-bold uppercase text-[10px]">Next</button></div></div>`);
            setStepMarkup('mb-step4', `<div class="relative px-6 py-4 border-b border-slate-800 bg-slate-900/50"><div class="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div><h2 class="text-xl font-bold text-white uppercase italic tracking-tight">Step 04: Maintenance Loop &amp; Review</h2></div><div class="p-8 space-y-8"><div class="grid grid-cols-1 lg:grid-cols-2 gap-8"><div class="space-y-6"><div class="grid grid-cols-1 md:grid-cols-2 gap-6"><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Daily system check</label><textarea id="mb_daily_check" oninput="mb_saveData()" placeholder="What quick daily check tells you whether the system is healthy?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Weekly review and update</label><textarea id="mb_weekly_review" oninput="mb_saveData()" placeholder="How will you review and update the system each week?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Recovery checkpoint</label><textarea id="mb_recovery_checkpoint" oninput="mb_saveData()" placeholder="What do sleep, mood, concentration, and soreness suggest today?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Pit crew check-in</label><textarea id="mb_pit_crew_check" oninput="mb_saveData()" placeholder="When do you need accountability through connection, and when do you need relief from social evaluation?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">When do you push and when do you back off?</label><textarea id="mb_recovery_threshold" oninput="mb_saveData()" placeholder="Define the data that tells you to keep pushing, reduce load, or deload. What is your deload trigger?" class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest mono">Authentic pride</label><textarea id="mb_pride" oninput="mb_saveData()" placeholder="I earned this because I..." class="w-full rounded-lg p-4 text-xs h-24 resize-none text-slate-200 italic"></textarea></div><label class="block text-[10px] font-bold uppercase text-slate-500 mb-4 tracking-widest mono italic underline underline-offset-2">System Integrity Audit</label><div id="mb-scoring-container" class="space-y-4"></div><div class="border-t border-slate-800 mt-6 pt-6 flex justify-between items-center"><span class="text-[10px] uppercase font-bold text-slate-500 tracking-[0.2em]">Readiness Score</span><div class="text-4xl font-black italic text-emerald-500 leading-none"><span id="mb-total-score">00</span><span class="text-xl text-slate-700 font-normal not-italic">/20</span></div></div></div><div class="space-y-6"><div><label class="block text-[10px] font-bold uppercase text-sky-400 mb-2 tracking-widest mono italic underline underline-offset-4">Understanding Narrative</label><textarea id="mb_narrative" oninput="mb_saveData()" placeholder="Explain how your audit findings, defaults, if-then plans, and maintenance loop work together. Show how recovery and social context protect the system." class="w-full rounded-xl p-4 text-sm h-[200px] resize-none text-slate-200 border-2 border-sky-500/20 focus:border-sky-500 transition-all"></textarea></div><div class="bg-sky-500/5 border border-sky-500/20 p-6 rounded-2xl text-center"><h3 class="text-sky-500 font-black text-[10px] uppercase italic tracking-widest mb-3 italic underline underline-offset-4">Live Summary</h3><p id="mb-summary-preview" class="text-sm font-bold italic text-white leading-relaxed">...</p></div></div></div><div class="border-t border-slate-800 pt-8"><label class="block text-[10px] font-bold uppercase text-emerald-500 mb-4 tracking-[0.2em] mono italic underline underline-offset-4">Self-Evaluation Rubric</label><div class="overflow-x-auto glass rounded-2xl border border-slate-800 shadow-xl"><table class="w-full text-left border-collapse min-w-[700px]"><thead><tr class="bg-slate-900/80 border-b border-slate-800"><th class="p-4 text-[10px] font-black uppercase text-slate-500 mono tracking-widest w-1/4">Criteria</th><th class="p-4 text-[10px] font-black uppercase text-emerald-400 mono tracking-widest w-1/4">Proficient</th><th class="p-4 text-[10px] font-black uppercase text-amber-400 mono tracking-widest w-1/4">Developing</th><th class="p-4 text-[10px] font-black uppercase text-rose-400 mono tracking-widest w-1/4">Emerging</th></tr></thead><tbody class="text-[10px] leading-relaxed"><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono italic">System Audit</td><td onclick="mb_setScore('audit', 5)" id="mb-audit-5" class="rubric-cell p-4 text-slate-400 italic">Audit is specific about strengths, leaks, social context, and recovery signals instead of using generic language.</td><td onclick="mb_setScore('audit', 3)" id="mb-audit-3" class="rubric-cell p-4 text-slate-400 italic">Audit names some useful information, but important patterns remain vague or incomplete.</td><td onclick="mb_setScore('audit', 1)" id="mb-audit-1" class="rubric-cell p-4 text-slate-400 italic">Audit is missing or too thin to guide action.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono italic">Default Settings</td><td onclick="mb_setScore('defaults', 5)" id="mb-defaults-5" class="rubric-cell p-4 text-slate-400 italic">Pre-, in-, and post-performance defaults are clear, realistic, and tied to repeatable behavior.</td><td onclick="mb_setScore('defaults', 3)" id="mb-defaults-3" class="rubric-cell p-4 text-slate-400 italic">Defaults are present but generic, emotional only, or difficult to repeat under stress.</td><td onclick="mb_setScore('defaults', 1)" id="mb-defaults-1" class="rubric-cell p-4 text-slate-400 italic">Default settings are incomplete or missing.</td></tr><tr class="border-b border-slate-800/50"><td class="p-4 font-bold uppercase text-white mono italic">If-Then Plans</td><td onclick="mb_setScore('plans', 5)" id="mb-plans-5" class="rubric-cell p-4 text-slate-400 italic">Responses to anxiety, low motivation, mistakes, weekly process demands, and the goal ladder are specific and actionable.</td><td onclick="mb_setScore('plans', 3)" id="mb-plans-3" class="rubric-cell p-4 text-slate-400 italic">Some plans are useful, but others are vague, reactive, or inconsistent.</td><td onclick="mb_setScore('plans', 1)" id="mb-plans-1" class="rubric-cell p-4 text-slate-400 italic">If-then plans are missing or not actionable.</td></tr><tr><td class="p-4 font-bold uppercase text-white mono italic">Maintenance Loop</td><td onclick="mb_setScore('maintenance', 5)" id="mb-maintenance-5" class="rubric-cell p-4 text-slate-400 italic">Daily check, weekly review, recovery checkpoint, push/back-off threshold, pit crew check-in, and authentic pride reflection create a believable maintenance system.</td><td onclick="mb_setScore('maintenance', 3)" id="mb-maintenance-3" class="rubric-cell p-4 text-slate-400 italic">Maintenance loop exists but is thin, irregular, or only partly connected to the rest of the plan.</td><td onclick="mb_setScore('maintenance', 1)" id="mb-maintenance-1" class="rubric-cell p-4 text-slate-400 italic">Maintenance loop is incomplete or missing.</td></tr></tbody></table></div></div><div class="flex flex-col md:flex-row gap-4 pt-8"><button onclick="mb_showStep(1)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button onclick="mb_generateFullPrint()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]">Generate Full One-Page Blueprint</button></div></div>`);

            if (valuesRoot) valuesRoot.dataset.phase2Upgrade = 'v1';
            if (masterRoot) masterRoot.dataset.phase2Upgrade = 'v1';
        }

        const vb_cats = [ { id: 'clar', label: 'Values Clarification' }, { id: 'std', label: 'Values in Action' }, { id: 'flt', label: 'Decision Filters' }, { id: 'supp', label: 'Support System' }, { id: 'audit', label: 'Integrity Audit' } ];
        let vb_scores = { clar: 0, std: 0, flt: 0, supp: 0, audit: 0 };
        const allValues = ["Accountability", "Achievement", "Activism", "Adaptability", "Adventure", "Altruism", "Ambition", "Authenticity", "Balance", "Commitment", "Community", "Compassion", "Courage", "Creativity", "Curiosity", "Efficiency", "Equality", "Excellence", "Fairness", "Faith", "Freedom", "Generosity", "Gratitude", "Growth", "Harmony", "Health", "Honesty", "Integrity", "Intuition", "Joy", "Justice", "Kindness", "Leadership", "Learning", "Love", "Loyalty", "Optimism", "Peace", "Respect", "Responsibility", "Service", "Simplicity", "Success", "Teamwork", "Trust", "Vulnerability", "Wisdom"];
        const valuesDefinitions = { "Accountability": "Owning your choices, effort, and consequences without excuses.", "Achievement": "Pursuing meaningful progress through disciplined effort and follow-through.", "Authenticity": "Acting in a way that is honest to who you are, not just who you want others to see.", "Commitment": "Staying loyal to a chosen standard over time, especially when motivation changes.", "Compassion": "Responding to struggle with care, understanding, and constructive action.", "Courage": "Taking the right action even when fear, discomfort, or uncertainty is present.", "Excellence": "Pursuing high quality with intention, not perfectionism for show.", "Growth": "Seeing challenge, feedback, and effort as part of becoming better.", "Health": "Protecting the physical and mental habits that make high performance sustainable.", "Honesty": "Telling the truth about what is happening instead of hiding behind image or excuses.", "Integrity": "Keeping your behavior aligned with what you claim to believe.", "Leadership": "Influencing the group by example, responsibility, and steadiness.", "Learning": "Staying teachable and using mistakes as information instead of identity threats.", "Respect": "Treating people, roles, and responsibilities with seriousness and dignity.", "Responsibility": "Accepting that your response, preparation, and repair work belong to you.", "Service": "Using your effort to improve something beyond your own ego or comfort.", "Teamwork": "Working in a way that makes the group stronger, clearer, and more coordinated.", "Trust": "Choosing reliability, honesty, and follow-through so others can count on you.", "Vulnerability": "Allowing truth, feedback, and emotional honesty without collapsing into shame.", "Wisdom": "Choosing what matters most with perspective, restraint, and judgment." }; 
        const vb_step_labels = ['00 Briefing', '01 Clarify', '02 Standards', '03 Filters', '04 Review'];
        let vb_current_step = 0;
        let vb_step_menu_open = false;
        const mb_step_labels = ['00 Briefing', '01 Audit', '02 Defaults', '03 Plans', '04 Review'];
        let mb_current_step = 0;
        let mb_step_menu_open = false;

        function phase2ValueDefinition(value) { return valuesDefinitions[value] || "A chosen principle you can use as a standard for daily decisions and hard moments."; }
        function phase2Field(id) { return document.getElementById(id); }
        function phase2Value(id) { const field = phase2Field(id); return field ? field.value : ''; }
        function phase2SetValue(id, value) { const field = phase2Field(id); if (field && typeof value === 'string') field.value = value; }
        function phase2ReportText(value, fallback = '---') { const raw = typeof value === 'string' && value.trim() ? value : fallback; return raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
        function phase2ReportMultiline(value, fallback = '---') { return phase2ReportText(value, fallback).replace(/\n/g, '<br>'); }
        function updateVBDefinitionDisplays() { [{ selectId: 'vb_value1', boxId: 'v1-def-box', textId: 'v1-definition' }, { selectId: 'vb_value2', boxId: 'v2-def-box', textId: 'v2-definition' }, { selectId: 'vb_value3', boxId: 'v3-def-box', textId: 'v3-definition' }].forEach(({ selectId, boxId, textId }) => { const value = phase2Value(selectId); const box = phase2Field(boxId); const text = phase2Field(textId); if (!box || !text) return; if (!value) { box.classList.add('hidden'); text.textContent = ''; return; } text.textContent = phase2ValueDefinition(value); box.classList.remove('hidden'); }); }
        function vb_syncStepMenu() {
            const shell = document.getElementById('vb-step-nav-shell');
            const toggleButton = document.getElementById('vb-step-toggle');
            const toggleCurrent = document.getElementById('vb-step-toggle-current');
            if (shell) shell.classList.toggle('is-open', vb_step_menu_open);
            if (toggleButton) toggleButton.setAttribute('aria-expanded', vb_step_menu_open ? 'true' : 'false');
            if (toggleCurrent) toggleCurrent.textContent = vb_step_labels[vb_current_step] || vb_step_labels[0];
        }
        function vb_setStepMenuOpen(open) { vb_step_menu_open = !!open; vb_syncStepMenu(); }
        function vb_toggleStepMenu() { vb_setStepMenuOpen(!vb_step_menu_open); }
        function vb_showStep(n) { vb_current_step = Math.max(0, Math.min(4, Number(n) || 0)); document.querySelectorAll('#view-values .step-content').forEach((panel) => { panel.classList.add('hidden'); panel.classList.remove('active'); }); const activePanel = document.getElementById('vb-step' + vb_current_step); if (activePanel) { activePanel.classList.remove('hidden'); activePanel.classList.add('active'); } document.querySelectorAll('#view-values .p1-step-btn').forEach((b, i) => b.classList.toggle('active', i === vb_current_step)); vb_setStepMenuOpen(false); }
        function vb_setScore(cat, val) { const normalized = normalizePhase2RubricScore(val); vb_scores[cat] = normalized; const group = document.getElementById(`vb-group-${cat}`); if (group) group.querySelectorAll('button').forEach((button) => button.classList.toggle('active', Number(button.dataset.score) === normalized)); const total = Object.values(vb_scores).reduce((a, b) => a + b, 0); const totalScore = document.getElementById('vb-total-score'); if (totalScore) totalScore.innerText = total.toString().padStart(2, '0'); vb_saveData(); }
        function vb_getFormData() { return { value1: phase2Value('vb_value1'), value2: phase2Value('vb_value2'), value3: phase2Value('vb_value3'), values_why: phase2Value('vb_values_why'), motivation_driver: phase2Value('vb_motivation_driver'), training_behaviors: phase2Value('vb_training_behaviors'), competition_behaviors: phase2Value('vb_competition_behaviors'), task_bridge: phase2Value('vb_task_bridge'), filter_hard: phase2Value('vb_filter_hard'), filter_mistake: phase2Value('vb_filter_mistake'), aligned_habits: phase2Value('vb_aligned_habits'), drift_habits: phase2Value('vb_drift_habits'), feeling: phase2Value('vb_feeling'), warning: phase2Value('vb_warning'), support_person: phase2Value('vb_support_person'), pit_crew: phase2Value('vb_pit_crew'), self_compassion: phase2Value('vb_self_compassion'), narrative: phase2Value('vb_narrative'), scores: vb_scores }; }
        function updateVBSummary(data) {
            const preview = document.getElementById('vb-summary-preview');
            if (!preview) return;
            const values = [data.value1, data.value2, data.value3].filter(Boolean).join(', ') || 'my values';
            const action = data.task_bridge || 'one controllable process action';
            const support = data.pit_crew || data.support_person || 'a support environment';
            const driver = data.motivation_driver || 'values, identity, and sustainable effort';
            preview.innerHTML = `I protect <span class="text-sky-400 font-bold underline underline-offset-2">${values}</span> by proving them through <span class="text-emerald-400 font-bold underline underline-offset-2">${action}</span>, checking whether my effort is being driven by <span class="text-amber-400 font-bold underline underline-offset-2">${driver}</span>, and leaning on <span class="text-sky-400 font-bold underline underline-offset-2">${support}</span> when pressure rises.`;
        }
        function vb_saveData() { upgradePhase2Views(); updateVBDefinitionDisplays(); const data = vb_getFormData(); localStorage.setItem('vb_data', JSON.stringify(data)); setTextById(['vb-save-text'], "Saved"); updateVBSummary(data); refreshProgressUI(); setTimeout(() => setTextById(['vb-save-text'], "System Ready"), 1000); }
        function vb_populate(data) { upgradePhase2Views(); upgradePhase2FieldCards(document.getElementById('view-values')); if(!data) { updateVBDefinitionDisplays(); return; } phase2SetValue('vb_value1', data.value1 || ''); phase2SetValue('vb_value2', data.value2 || ''); phase2SetValue('vb_value3', data.value3 || ''); phase2SetValue('vb_values_why', data.values_why || ''); phase2SetValue('vb_motivation_driver', data.motivation_driver || ''); phase2SetValue('vb_training_behaviors', data.training_behaviors || ''); phase2SetValue('vb_competition_behaviors', data.competition_behaviors || ''); phase2SetValue('vb_task_bridge', data.task_bridge || ''); phase2SetValue('vb_filter_hard', data.filter_hard || ''); phase2SetValue('vb_filter_mistake', data.filter_mistake || ''); phase2SetValue('vb_aligned_habits', data.aligned_habits || ''); phase2SetValue('vb_drift_habits', data.drift_habits || ''); phase2SetValue('vb_feeling', data.feeling || ''); phase2SetValue('vb_warning', data.warning || ''); phase2SetValue('vb_support_person', data.support_person || ''); phase2SetValue('vb_pit_crew', data.pit_crew || ''); phase2SetValue('vb_self_compassion', data.self_compassion || ''); phase2SetValue('vb_narrative', data.narrative || ''); const incomingVBScores = data.scores || {}; vb_scores = { clar: normalizePhase2RubricScore(incomingVBScores.clar), std: normalizePhase2RubricScore(incomingVBScores.std ?? incomingVBScores.depth), flt: normalizePhase2RubricScore(incomingVBScores.flt ?? incomingVBScores.sys), supp: normalizePhase2RubricScore(incomingVBScores.supp), audit: normalizePhase2RubricScore(incomingVBScores.audit) }; Object.keys(vb_scores).forEach(c => { if(vb_scores[c] > 0) vb_setScore(c, vb_scores[c]); }); updateVBDefinitionDisplays(); vb_saveData(); }
        function vb_downloadBackup() { const data = localStorage.getItem('vb_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "values-backup.json"; a.click(); }
        function vb_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { vb_populate(JSON.parse(e.target.result)); alert("Values Data Loaded"); }; reader.readAsText(file); }
        function vb_generateFullPrint() { 
            const data = vb_getFormData();
            const total = Object.values(vb_scores).reduce((a, b) => a + b, 0);
            const totalMax = phase2ValuesMaxScore;
            const scoreDetails = vb_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${vb_scores[c.id] || 0}/3</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Values Blueprint</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.35; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 700; line-height: 1.45; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; padding-bottom: 6px; } .narr-val { font-size: 11px; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Values Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 2 Identity System</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/${totalMax}</p></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#0284c7;">Core Values</h2><div class="val">${phase2ReportText(data.value1)} / ${phase2ReportText(data.value2)} / ${phase2ReportText(data.value3)}</div><div class="label">Why these values matter</div><div class="narr-val">${phase2ReportMultiline(data.values_why)}</div><div class="label">Current effort driver</div><div class="val">${phase2ReportMultiline(data.motivation_driver)}</div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Training Standards</h2><div class="val">${phase2ReportMultiline(data.training_behaviors)}</div><div class="label">Weekly proof action</div><div class="val">${phase2ReportMultiline(data.task_bridge)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Competition Standards</h2><div class="val">${phase2ReportMultiline(data.competition_behaviors)}</div><div class="label">Support person</div><div class="val">${phase2ReportText(data.support_person)}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Decision Filters + Alignment</h2><div class="label">Before a hard choice</div><div class="val">${phase2ReportText(data.filter_hard)}</div><div class="label">After a mistake</div><div class="val">${phase2ReportText(data.filter_mistake)}</div><div class="label">Aligned habits</div><div class="val">${phase2ReportMultiline(data.aligned_habits)}</div><div class="label">Out of alignment</div><div class="val">${phase2ReportMultiline(data.drift_habits)}</div></div><div class="grid grid-cols-2 gap-8 mt-4"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Warning System</h2><div class="label">Aligned feeling</div><div class="val">${phase2ReportMultiline(data.feeling)}</div><div class="label">Warning signs</div><div class="val">${phase2ReportMultiline(data.warning)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Support</h2><div class="label">Pit crew or support environment</div><div class="val">${phase2ReportMultiline(data.pit_crew)}</div><div class="label">Self-compassion act</div><div class="val">${phase2ReportMultiline(data.self_compassion)}</div></div></div><div class="section" style="border-left-color:#0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${phase2ReportMultiline(data.narrative, 'No narrative provided.')}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 2B (MASTER CONFIG) LOGIC ---
        const mb_cats = [ { id: 'audit', label: 'System Audit' }, { id: 'defaults', label: 'Default Settings' }, { id: 'plans', label: 'If-Then Plans' }, { id: 'maintenance', label: 'Maintenance Loop' } ];
        let mb_scores = { audit: 0, defaults: 0, plans: 0, maintenance: 0 };

        function mb_syncStepMenu() {
            const shell = document.getElementById('mb-step-nav-shell');
            const toggleButton = document.getElementById('mb-step-toggle');
            const toggleCurrent = document.getElementById('mb-step-toggle-current');
            if (shell) shell.classList.toggle('is-open', mb_step_menu_open);
            if (toggleButton) toggleButton.setAttribute('aria-expanded', mb_step_menu_open ? 'true' : 'false');
            if (toggleCurrent) toggleCurrent.textContent = mb_step_labels[mb_current_step] || mb_step_labels[0];
        }
        function mb_setStepMenuOpen(open) { mb_step_menu_open = !!open; mb_syncStepMenu(); }
        function mb_toggleStepMenu() { mb_setStepMenuOpen(!mb_step_menu_open); }
        function mb_showStep(n) { mb_current_step = Math.max(0, Math.min(4, Number(n) || 0)); document.querySelectorAll('#view-master .step-content').forEach((panel) => { panel.classList.add('hidden'); panel.classList.remove('active'); }); const activePanel = document.getElementById('mb-step' + mb_current_step); if (activePanel) { activePanel.classList.remove('hidden'); activePanel.classList.add('active'); } document.querySelectorAll('#view-master .p1-step-btn').forEach((b, i) => b.classList.toggle('active', i === mb_current_step)); mb_setStepMenuOpen(false); }
        function mb_setScore(cat, val) { const normalized = normalizePhase2RubricScore(val); mb_scores[cat] = normalized; const group = document.getElementById(`mb-group-${cat}`); if (group) group.querySelectorAll('button').forEach((button) => button.classList.toggle('active', Number(button.dataset.score) === normalized)); const total = Object.values(mb_scores).reduce((a, b) => a + b, 0); const totalScore = document.getElementById('mb-total-score'); if (totalScore) totalScore.innerText = total.toString().padStart(2, '0'); mb_saveData(); }
        function mb_getFormData() { return { anchor: phase2Value('mb_anchor'), value: phase2Value('mb_value'), strengths: phase2Value('mb_strengths'), leaks: phase2Value('mb_leaks'), support_environment: phase2Value('mb_support_environment'), recovery_signals: phase2Value('mb_recovery_signals'), pre_default: phase2Value('mb_pre_default'), in_default: phase2Value('mb_in_default'), post_default: phase2Value('mb_post_default'), if_anxiety: phase2Value('mb_if_anxiety'), if_motivation: phase2Value('mb_if_motivation'), if_mistake: phase2Value('mb_if_mistake'), process_action: phase2Value('mb_process_action'), goal_outcome: phase2Value('mb_goal_outcome'), goal_performance: phase2Value('mb_goal_performance'), goal_process: phase2Value('mb_goal_process'), daily_check: phase2Value('mb_daily_check'), weekly_review: phase2Value('mb_weekly_review'), recovery_checkpoint: phase2Value('mb_recovery_checkpoint'), pit_crew_check: phase2Value('mb_pit_crew_check'), recovery_threshold: phase2Value('mb_recovery_threshold'), pride: phase2Value('mb_pride'), narrative: phase2Value('mb_narrative'), scores: mb_scores }; }
        function mb_saveData() { upgradePhase2Views(); const data = mb_getFormData(); localStorage.setItem('mb_data', JSON.stringify(data)); setTextById(['mb-save-text'], "Saved"); updateMBSummary(data); refreshProgressUI(); setTimeout(() => setTextById(['mb-save-text'], "System Ready"), 1000); }
        function updateMBSummary(data) { const preview = document.getElementById('mb-summary-preview'); if (!preview) return; preview.innerHTML = `I enter with <span class="text-sky-400 font-bold underline underline-offset-2">${data.pre_default || 'an intentional pre-performance default'}</span>, return to <span class="text-emerald-400 font-bold underline underline-offset-2">${data.in_default || 'a steady in-performance state'}</span>, protect execution with <span class="text-amber-400 font-bold underline underline-offset-2">${data.goal_process || data.process_action || 'a process goal'}</span>, and back off when <span class="text-sky-400 font-bold underline underline-offset-2">${data.recovery_threshold || data.recovery_checkpoint || 'the recovery checkpoint says to deload'}</span>.`; }
        function mb_populate(data) { upgradePhase2Views(); upgradePhase2FieldCards(document.getElementById('view-master')); if(!data) return; phase2SetValue('mb_anchor', data.anchor || ''); phase2SetValue('mb_value', data.value || ''); phase2SetValue('mb_strengths', data.strengths || ''); phase2SetValue('mb_leaks', data.leaks || ''); phase2SetValue('mb_support_environment', data.support_environment || ''); phase2SetValue('mb_recovery_signals', data.recovery_signals || data.recovery || ''); phase2SetValue('mb_pre_default', data.pre_default || ''); phase2SetValue('mb_in_default', data.in_default || ''); phase2SetValue('mb_post_default', data.post_default || ''); phase2SetValue('mb_if_anxiety', data.if_anxiety || ''); phase2SetValue('mb_if_motivation', data.if_motivation || ''); phase2SetValue('mb_if_mistake', data.if_mistake || ''); phase2SetValue('mb_process_action', data.process_action || data.task || ''); phase2SetValue('mb_goal_outcome', data.goal_outcome || ''); phase2SetValue('mb_goal_performance', data.goal_performance || ''); phase2SetValue('mb_goal_process', data.goal_process || data.process_action || data.task || ''); phase2SetValue('mb_daily_check', data.daily_check || ''); phase2SetValue('mb_weekly_review', data.weekly_review || ''); phase2SetValue('mb_recovery_checkpoint', data.recovery_checkpoint || data.recovery || ''); phase2SetValue('mb_pit_crew_check', data.pit_crew_check || ''); phase2SetValue('mb_recovery_threshold', data.recovery_threshold || data.recovery_checkpoint || data.recovery || ''); phase2SetValue('mb_pride', data.pride || ''); phase2SetValue('mb_narrative', data.narrative || ''); const incomingMBScores = data.scores || {}; mb_scores = { audit: normalizePhase2RubricScore(incomingMBScores.audit ?? incomingMBScores.cl), defaults: normalizePhase2RubricScore(incomingMBScores.defaults ?? incomingMBScores.id), plans: normalizePhase2RubricScore(incomingMBScores.plans ?? incomingMBScores.tk), maintenance: normalizePhase2RubricScore(incomingMBScores.maintenance ?? incomingMBScores.mn) }; Object.keys(mb_scores).forEach(c => { if(mb_scores[c]>0) mb_setScore(c, mb_scores[c]); }); mb_saveData(); }
        function mb_downloadBackup() { const data = localStorage.getItem('mb_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "master-backup.json"; a.click(); }
        function mb_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { mb_populate(JSON.parse(e.target.result)); alert("Master Data Loaded"); }; reader.readAsText(file); }
        function mb_generateFullPrint() { 
            const data = mb_getFormData();
            const total = Object.values(mb_scores).reduce((a, b) => a + b, 0);
            const totalMax = phase2MasterMaxScore;
            const scoreDetails = mb_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:8px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${mb_scores[c.id] || 0}/3</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Master Config</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.35; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 700; line-height: 1.45; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; padding-bottom: 6px; } .narr-val { font-size: 11px; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 8px; margin-top: 5px; border: 1px solid #eee; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Master Config</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 2 Integrated Discipline System</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Readiness Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/${totalMax}</p></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">System Audit</h2><div class="label">Performance identity</div><div class="val">${phase2ReportText(data.anchor)}</div><div class="label">Compass value</div><div class="val">${phase2ReportText(data.value)}</div><div class="label">System strengths</div><div class="val">${phase2ReportMultiline(data.strengths)}</div><div class="label">Performance leaks</div><div class="val">${phase2ReportMultiline(data.leaks)}</div><div class="label">Support environment</div><div class="val">${phase2ReportMultiline(data.support_environment)}</div><div class="label">Recovery signals</div><div class="val">${phase2ReportMultiline(data.recovery_signals)}</div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Default Settings</h2><div class="label">Pre-performance default</div><div class="val">${phase2ReportMultiline(data.pre_default)}</div><div class="label">In-performance default</div><div class="val">${phase2ReportMultiline(data.in_default)}</div><div class="label">Post-performance default</div><div class="val">${phase2ReportMultiline(data.post_default)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">If-Then Plans</h2><div class="label">If anxiety spikes</div><div class="val">${phase2ReportMultiline(data.if_anxiety)}</div><div class="label">If motivation drops</div><div class="val">${phase2ReportMultiline(data.if_motivation)}</div><div class="label">If a mistake rattles you</div><div class="val">${phase2ReportMultiline(data.if_mistake)}</div><div class="label">Weekly process action</div><div class="val">${phase2ReportMultiline(data.process_action)}</div><div class="label">Outcome goal</div><div class="val">${phase2ReportMultiline(data.goal_outcome)}</div><div class="label">Performance goal</div><div class="val">${phase2ReportMultiline(data.goal_performance)}</div><div class="label">Process goal</div><div class="val">${phase2ReportMultiline(data.goal_process)}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Maintenance Loop</h2><div class="grid grid-cols-2 gap-4"><div><div class="label">Daily system check</div><div class="val">${phase2ReportMultiline(data.daily_check)}</div></div><div><div class="label">Weekly review and update</div><div class="val">${phase2ReportMultiline(data.weekly_review)}</div></div><div><div class="label">Recovery checkpoint</div><div class="val">${phase2ReportMultiline(data.recovery_checkpoint)}</div></div><div><div class="label">Pit crew check-in</div><div class="val">${phase2ReportMultiline(data.pit_crew_check)}</div></div></div><div class="label">When do you push and when do you back off?</div><div class="val">${phase2ReportMultiline(data.recovery_threshold)}</div><div class="label">Authentic pride</div><div class="val">${phase2ReportMultiline(data.pride)}</div></div><div class="section" style="border-left-color: #0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${phase2ReportMultiline(data.narrative, 'No narrative provided.')}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Audit Results</h2>${scoreDetails}</div><div style="margin-top:30px; text-align:center; font-size:9px; font-weight:bold; color:#aaa; text-transform:uppercase; letter-spacing:2px;">"If the plan doesn't survive a bad day, it isn't a plan."</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 3 (FOCUS BLUEPRINT) LOGIC ---
        const phase3RubricScale = [1, 2, 3];
        const phase3MaxScore = 15;
        const p3_cats = [ { id: 'arena', label: 'Spotlight Audit' }, { id: 'anch', label: 'Cue Builder' }, { id: 'fort', label: 'Fortress Plan' }, { id: 'narr', label: 'Understanding Narrative' }, { id: 'audit', label: 'Integrity Audit' } ];
        let p3_scores = { arena: 0, anch: 0, fort: 0, narr: 0, audit: 0 };
        const p3_step_labels = ['00 Briefing', '01 Audit', '02 Cues', '03 Fortress', '04 Review'];
        let p3_current_step = 0;
        let p3_step_menu_open = false;

        function normalizePhase3RubricScore(value) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric) || numeric <= 0) return 0;
            if (numeric >= 4) return 3;
            if (numeric >= 2) return 2;
            return 1;
        }

        function buildPhase3ScoreButtons(catId) {
            return [1,2,3].map(v => `<button onclick="p3_setScore('${catId}', ${v})" data-score="${v}" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('');
        }

        function buildPhase3Shell() {
            return `
                <div class="mx-auto w-full max-w-none space-y-6 text-white">
                    <section class="rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]">
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:items-start">
                            <div class="space-y-3">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-300/75">Assignment 03</p>
                                <div>
                                    <h1 class="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">Focus Master Blueprint</h1>
                                    <p class="mt-2 p1-phase-subtitle text-xs uppercase tracking-[0.32em] text-slate-400">Phase 3 / attentional control, interference management, and fortress routines</p>
                                </div>
                                <p class="max-w-4xl text-sm leading-7 text-slate-300 md:text-base">
                                    Concentration is selective, sustained, and shiftable attention. This assignment turns the focus chapter into a repeatable system for
                                    diagnosing interference, moving through the right attentional quadrant, choosing usable cues, and resetting fast when pressure interrupts execution.
                                </p>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:min-w-0">
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Mastery score</p>
                                    <div class="mt-3 flex items-end gap-2">
                                        <span id="p3-total-score" class="text-4xl font-black tracking-tight text-cyan-300">00</span>
                                        <span class="pb-1 text-sm uppercase tracking-[0.3em] text-slate-500">/15</span>
                                    </div>
                                    <p class="mt-2 text-xs leading-6 text-slate-400">Review scoring stays manual so you can judge how usable the focus system feels under real pressure.</p>
                                </div>
                                <div class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-4 p1-file-actions">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">File actions</p>
                                    <div class="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                        <span id="p3-save-indicator" class="h-2 w-2 rounded-full bg-slate-600"></span>
                                        <span id="p3-save-text">System Ready</span>
                                    </div>
                                    <div class="mt-3 flex flex-wrap gap-3">
                                        <button type="button" onclick="p3_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button>
                                        <button type="button" onclick="document.getElementById('p3-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button>
                                    </div>
                                    <p class="mt-3 text-[10px] italic text-slate-500">Generate the blueprint report from the review step below.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4">
                        <div id="p3-step-nav-shell" class="p1-step-nav-shell">
                            <button id="p3-step-toggle" type="button" onclick="p3_toggleStepMenu()" class="p1-step-toggle" aria-expanded="false">
                                <span class="p1-step-toggle-copy">
                                    <span class="p1-step-toggle-kicker mono">Step Menu</span>
                                    <span id="p3-step-toggle-current" class="p1-step-toggle-current mono">00 Briefing</span>
                                </span>
                                <span class="p1-step-toggle-bars" aria-hidden="true">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </span>
                            </button>
                            <div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2 p1-step-nav">
                                <button type="button" onclick="p3_showStep(0)" class="mod-nav-btn p1-step-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">00 Briefing</button>
                                <button type="button" onclick="p3_showStep(1)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Audit</button>
                                <button type="button" onclick="p3_showStep(2)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Cues</button>
                                <button type="button" onclick="p3_showStep(3)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Fortress</button>
                                <button type="button" onclick="p3_showStep(4)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Review</button>
                            </div>
                        </div>
                    </section>

                    <section id="p3-step0" class="step-content active p1-step space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="p3-step1" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="p3-step2" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="p3-step3" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                    <section id="p3-step4" class="step-content p1-step hidden space-y-6 rounded-3xl border border-cyan-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(34,211,238,0.05)]"></section>
                </div>
                <input id="p3-file-upload" type="file" accept="application/json" class="hidden" onchange="p3_loadBackup(this)" />
            `;
        }

        function buildPhase3Step0Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 00</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mission briefing</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Phase 3 treats concentration as a trainable control system, not a personality trait. Your job is to diagnose where attention breaks, notice when alertness makes the field too broad or too narrow, quiet Self 1 before it overcoaches the skill, map the quadrant shift the moment requires, and build a routine that can survive mistakes, noise, fatigue, and evaluation.</p></div><div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Selectivity, capacity, and alertness</p><p class="mt-3 text-sm leading-7 text-slate-300">Pressure steals bandwidth, but arousal also changes attentional width. The system has to screen out irrelevant cues, keep enough processing room for the task, and notice when low energy creates drift or high energy creates tunnel vision.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Quadrant shift</p><p class="mt-3 text-sm leading-7 text-slate-300">Strong performers move broad-external to broad-internal to narrow-internal to narrow-external instead of freezing in analysis or drifting into tunnel vision.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Self 1 vs Self 2</p><p class="mt-3 text-sm leading-7 text-slate-300">Self 1 labels, judges, and interferes. Self 2 sees, feels, and executes. The cue system should lower interference rather than add more talking.</p></article><article class="rounded-2xl border border-cyan-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Pressure rehearsal</p><p class="mt-3 text-sm leading-7 text-slate-300">A routine becomes believable only when you train it under noise, consequence, fatigue, scoring pressure, and disrupted rhythm.</p></article></div><div class="flex justify-center pt-2"><button type="button" onclick="p3_showStep(1)" class="bg-sky-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/20 active:scale-95">Start Focus Build</button></div>`;
        }

        function buildPhase3Step1Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 01</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Spotlight audit</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Use the chapter's diagnostic mindset: name what steals bandwidth, identify where your attention goes instead, check whether alertness is making the field too broad or too narrow, then define the narrow-external cue and quadrant shift that fit the task.</p></div><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Internal distracters</span><p class="mt-2 text-sm leading-6 text-slate-400">What does Self 1 usually say or tighten when performance starts to wobble?</p><textarea id="p3_internal_dist" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: do not miss, keep the elbow exactly here, I always rush this, chest tightens, jaw locks."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Past / future traps</span><p class="mt-2 text-sm leading-6 text-slate-400">Where does attention time-travel when you stop living in the rep?</p><textarea id="p3_time_trap" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Name the replay loops, scoreboard thoughts, selection fears, or result predictions that hijack the present moment."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">External distracters</span><p class="mt-2 text-sm leading-6 text-slate-400">What in the environment pulls the spotlight off the task?</p><textarea id="p3_external_dist" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Crowd, officiating, weather, spacing, defenders, spectators, teammates, delays, or hostile energy."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Alertness / width check</span><p class="mt-2 text-sm leading-6 text-slate-400">When pressure rises, does arousal make your attention too broad, too narrow, or too flat?</p><textarea id="p3_alertness_width" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: too much arousal narrows me into mechanics and outcome fear; too little leaves me drifting and late to key cues."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Primary spotlight goal</span><p class="mt-2 text-sm leading-6 text-slate-400">What narrow-external target deserves your attention when the skill is unfolding?</p><textarea id="p3_spotlight" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: back rim, seams of the ball, lane line, release window, or the sound of clean contact."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Shift sequence</span><p class="mt-2 text-sm leading-6 text-slate-400">How should your attention move through Nideffer's quadrants in this moment?</p><textarea id="p3_shift_sequence" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: broad-external scan -> broad-internal plan -> narrow-internal breath and body tone -> narrow-external back rim."></textarea></label></div>`;
        }

        function buildPhase3Step2Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 02</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Cue builder and anchors</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Quiet Self 1 by choosing language and sensory anchors that are short, present, and immediately actionable. The goal is to redirect behavior, not to give yourself a motivational speech.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div class="grid gap-5 lg:grid-cols-2"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Instructional cue</span><p class="mt-2 text-sm leading-6 text-slate-400">What short phrase organizes the behavior or mechanic you want?</p><input id="p3_instructional_cue" oninput="p3_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: smooth, finish, eyes up, tall, through the line." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Motivational cue</span><p class="mt-2 text-sm leading-6 text-slate-400">What phrase raises intent or activation without creating panic?</p><input id="p3_motivational_cue" oninput="p3_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: trust, attack, compete, drive, explode." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Sensory anchor</span><p class="mt-2 text-sm leading-6 text-slate-400">What present-moment anchor brings you back to the now?</p><select id="p3_anchor_type" onchange="p3_saveData()" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"><option value="">Select anchor...</option><option value="Breath">Breath</option><option value="Object Detail">Object Detail</option><option value="Quiet Eye">Quiet Eye</option><option value="Sound">Sound</option></select></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Anchor usage</span><p class="mt-2 text-sm leading-6 text-slate-400">How will you run that anchor during a pause, reset, or restart?</p><textarea id="p3_anchor_usage" oninput="p3_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: one slow exhale, eyes on the back rim, feel the seams, say smooth, then go."></textarea></label></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Why this matters</span><p class="mt-3 text-sm leading-7 text-slate-300">Good cues do not debate the miss, the fear, or the judgment. They compress the next useful action. Good anchors occupy attention with something sensory and immediate so analysis paralysis loses room to grow.</p><ul class="mt-4 space-y-2 text-sm leading-6 text-slate-300"><li>Instructional cues should guide an action, not a mood.</li><li>Motivational cues should raise intent without turning the routine frantic.</li><li>Anchors should be sensory, fast, and available under pressure.</li><li>Quiet Eye belongs in the cue system when stable gaze on a target matters for execution.</li></ul></div></div>`;
        }

        function buildPhase3Step3Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 03</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Fortress routine and what-if reset</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Build the short attentional transfer system that moves you from everyday noise into readiness. Then script the exact reset you want after a bad call, a rushed rep, a mistake, or a pressure spike and decide how you will rehearse it.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div class="space-y-5"><div class="grid gap-5 lg:grid-cols-3"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Routine step 1</span><p class="mt-2 text-sm leading-6 text-slate-400">What physical action starts the transfer into performance?</p><textarea id="p3_routine_1" oninput="p3_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: one slow exhale, soften shoulders, step to the line, or set the stance."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Routine step 2</span><p class="mt-2 text-sm leading-6 text-slate-400">What cue, image, or body check narrows attention toward execution?</p><textarea id="p3_routine_2" oninput="p3_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: smooth, see the arc, feel the seams, body tall, or eyes up."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Routine step 3</span><p class="mt-2 text-sm leading-6 text-slate-400">What final trigger releases Self 2 into execution?</p><textarea id="p3_routine_3" oninput="p3_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Use Quiet Eye, the back rim, the sound of contact, or another final trigger that says go."></textarea></label></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Fortress check</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The routine should be short enough to repeat under pressure instead of becoming a superstition script.</li><li>Each step should move attention closer to the task, not back to mechanics, outcome fear, or self-judgment.</li><li>The routine should help you enter execution and also re-enter after disruption.</li><li>The what-if and simulation plan should pressure-test the routine before competition does.</li></ul></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">High-pressure what-if</span><p class="mt-2 text-sm leading-6 text-slate-400">What predictable disruption tends to break your concentration?</p><textarea id="p3_what_if" oninput="p3_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Example: bad call after a miss, hostile crowd after a turnover, slow start, delay, or visible frustration."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Pre-planned reset</span><p class="mt-2 text-sm leading-6 text-slate-400">What is the tactical, nonjudgmental response that gets the spotlight back immediately?</p><textarea id="p3_response" oninput="p3_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Write the exact response: objective description, slow exhale, cue, anchor, and next target."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Simulation plan</span><p class="mt-2 text-sm leading-6 text-slate-400">How will you rehearse this under noise, fatigue, scoring pressure, or evaluation?</p><textarea id="p3_simulation_plan" oninput="p3_saveData()" rows="7" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Describe the drill: add noise, consequence, fatigue, or judgment, then measure whether the reset sequence still lands on the right cue."></textarea></label></div></div>`;
        }

        function buildPhase3Step4Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">Step 04</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Review and synthesis</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Audit the system, then explain how selectivity, alertness, shifting, cues, anchors, and reset logic work together to protect execution under pressure.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid"><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Focus integrity audit</span><p class="mt-2 text-sm leading-6 text-slate-400">Score how specific, usable, and repeatable the concentration system feels right now.</p><div id="p3-scoring-container" class="mt-4 space-y-4"></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">What strong focus work looks like</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The spotlight target is narrow, external, and relevant to execution.</li><li>The alertness read notices when arousal is making the field too broad, too narrow, or too flat.</li><li>The shift sequence deliberately moves attention into the right quadrant for the moment.</li><li>Cues are short, behavioral, and do not feed Self 1 more interference.</li><li>The anchor returns attention to the present rather than back into mechanics or outcome fear.</li><li>The fortress routine, what-if reset, and simulation plan are specific enough to survive disruption.</li></ul></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Understanding narrative</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain how quieting Self 1, reading alertness, shifting through the right quadrant, choosing cues, using an anchor, and rehearsing the routine under pressure improve concentration.</p><textarea id="p3_narrative" oninput="p3_saveData()" rows="11" class="mt-4 w-full rounded-2xl border border-cyan-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300" placeholder="Show how the spotlight, alertness read, scan-to-lock shift, cues, anchors, and rehearsal logic connect into one believable concentration system."></textarea></label><div class="rounded-2xl border border-cyan-400/20 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Concentration summary</span><p id="p3-summary-preview" class="mt-3 text-sm leading-7 text-slate-300">...</p></div></div></div><div class="p1-rubric-shell overflow-x-auto"><table class="min-w-[980px] w-full border-collapse p1-rubric-table"><thead><tr><th>Criteria</th><th>Proficient</th><th>Developing</th><th>Emerging</th></tr></thead><tbody><tr><th>Spotlight audit</th><td>Internal noise, time traps, external distracters, alertness width, the spotlight target, and the shift sequence clearly diagnose what kind of focus the task requires.</td><td>Some distracters are named, but the alertness read, spotlight target, or shift sequence stays broad, vague, or only partly actionable.</td><td>The audit is incomplete or does not define a usable spotlight target, width read, and shift pattern.</td></tr><tr><th>Cue builder</th><td>Instructional and motivational cues are short, behavioral, and paired with a sensory anchor that supports present-moment execution.</td><td>Cues exist, but they are generic, too wordy, or not clearly tied to execution.</td><td>Cues are missing, confusing, or unusable in the moment.</td></tr><tr><th>Fortress plan</th><td>The routine, what-if reset, and simulation plan create a repeatable attentional transfer system back to execution under pressure.</td><td>The routine exists, but parts are thin, inconsistent, or too vague to trust under disruption.</td><td>The fortress routine, reset plan, or pressure rehearsal is incomplete or missing.</td></tr><tr><th>Understanding narrative</th><td>The narrative shows strong understanding of spotlight control, alertness, attentional shifting, Self 1 vs Self 2, cues, anchors, and reset logic.</td><td>The narrative covers some ideas but does not fully connect the concentration system.</td><td>The narrative is missing or shows limited understanding of how the system should work.</td></tr><tr><th>Integrity audit</th><td>Scoring and summary are honest, aligned with the work, and usable for future resets.</td><td>Scoring is present but only partly aligned with the actual blueprint.</td><td>Scoring is incomplete or not supported by the written plan.</td></tr></tbody></table></div><div class="flex flex-col md:flex-row gap-4 pt-2"><button type="button" onclick="p3_showStep(0)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button type="button" onclick="p3_generateFullPrint()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Generate Blueprint PDF</button></div>`;
        }

        function upgradePhase3View() {
            const phase3Root = document.getElementById('view-phase3');
            if (!phase3Root || phase3Root.dataset.phase3Upgrade === 'v1') return;

            phase3Root.innerHTML = buildPhase3Shell();
            setStepMarkup('p3-step0', buildPhase3Step0Markup());
            setStepMarkup('p3-step1', buildPhase3Step1Markup());
            setStepMarkup('p3-step2', buildPhase3Step2Markup());
            setStepMarkup('p3-step3', buildPhase3Step3Markup());
            setStepMarkup('p3-step4', buildPhase3Step4Markup());
            upgradePhase2FieldCards(phase3Root);
            phase3Root.dataset.phase3Upgrade = 'v1';
            p3_syncStepMenu();
        }
        function p3_syncStepMenu() {
            const shell = document.getElementById('p3-step-nav-shell');
            const toggleButton = document.getElementById('p3-step-toggle');
            const toggleCurrent = document.getElementById('p3-step-toggle-current');
            if (shell) shell.classList.toggle('is-open', p3_step_menu_open);
            if (toggleButton) toggleButton.setAttribute('aria-expanded', p3_step_menu_open ? 'true' : 'false');
            if (toggleCurrent) toggleCurrent.textContent = p3_step_labels[p3_current_step] || p3_step_labels[0];
        }
        function p3_setStepMenuOpen(open) { p3_step_menu_open = !!open; p3_syncStepMenu(); }
        function p3_toggleStepMenu() { p3_setStepMenuOpen(!p3_step_menu_open); }
        function p3_showStep(n) { p3_current_step = Math.max(0, Math.min(4, Number(n) || 0)); document.querySelectorAll('#view-phase3 .step-content').forEach((panel) => { panel.classList.add('hidden'); panel.classList.remove('active'); }); const activePanel = document.getElementById('p3-step' + p3_current_step); if (activePanel) { activePanel.classList.remove('hidden'); activePanel.classList.add('active'); } document.querySelectorAll('#view-phase3 .p1-step-btn').forEach((b, i) => b.classList.toggle('active', i === p3_current_step)); p3_setStepMenuOpen(false); }
        function p3_setScore(cat, val) { const normalized = normalizePhase3RubricScore(val); p3_scores[cat] = normalized; const group = document.getElementById(`p3-group-${cat}`); if (group) group.querySelectorAll('button').forEach((button) => button.classList.toggle('active', Number(button.dataset.score) === normalized)); const total = Object.values(p3_scores).reduce((a, b) => a + b, 0); const totalScore = document.getElementById('p3-total-score'); if (totalScore) totalScore.innerText = total.toString().padStart(2, '0'); p3_saveData(); }
        function p3_getFormData() { return { internal_dist: phase2Value('p3_internal_dist'), time_trap: phase2Value('p3_time_trap'), external_dist: phase2Value('p3_external_dist'), alertness_width: phase2Value('p3_alertness_width'), spotlight: phase2Value('p3_spotlight'), shift_sequence: phase2Value('p3_shift_sequence'), instructional_cue: phase2Value('p3_instructional_cue'), motivational_cue: phase2Value('p3_motivational_cue'), anchor_type: phase2Value('p3_anchor_type'), anchor_usage: phase2Value('p3_anchor_usage'), routine_1: phase2Value('p3_routine_1'), routine_2: phase2Value('p3_routine_2'), routine_3: phase2Value('p3_routine_3'), what_if: phase2Value('p3_what_if'), response: phase2Value('p3_response'), simulation_plan: phase2Value('p3_simulation_plan'), narrative: phase2Value('p3_narrative'), scores: p3_scores }; }
        function p3_saveData() { upgradePhase3View(); const data = p3_getFormData(); localStorage.setItem('p3_data', JSON.stringify(data)); setTextById(['p3-save-text'], "Saved"); updateP3Summary(data); refreshProgressUI(); setTimeout(() => setTextById(['p3-save-text'], "System Ready"), 1000); }
        function updateP3Summary(data) { const preview = document.getElementById('p3-summary-preview'); if (!preview) return; const alertness = data.alertness_width || 'an alertness read that catches drift or tunnel vision'; const spotlight = data.spotlight || 'a narrow spotlight goal'; const shift = data.shift_sequence || 'a deliberate scan-to-lock sequence'; const cues = [data.instructional_cue, data.motivational_cue].filter(Boolean).join(' / ') || 'short cues'; const anchor = data.anchor_type || 'a present-tense anchor'; const threat = data.what_if || 'disruption'; const response = data.response || 'a practiced reset'; const simulation = data.simulation_plan || 'pressure rehearsal'; preview.innerHTML = `I watch alertness through <span class="text-sky-400 font-bold underline underline-offset-2">${alertness}</span>, move attention through <span class="text-emerald-400 font-bold underline underline-offset-2">${shift}</span>, lock the spotlight onto <span class="text-amber-400 font-bold underline underline-offset-2">${spotlight}</span>, use <span class="text-sky-400 font-bold underline underline-offset-2">${cues}</span> and <span class="text-emerald-400 font-bold underline underline-offset-2">${anchor}</span> to stay present, answer <span class="text-amber-400 font-bold underline underline-offset-2">${threat}</span> with <span class="text-sky-400 font-bold underline underline-offset-2">${response}</span>, and rehearse it with <span class="text-emerald-400 font-bold underline underline-offset-2">${simulation}</span>.`; }
        function p3_populate(data) { upgradePhase3View(); upgradePhase2FieldCards(document.getElementById('view-phase3')); if(!data) return; phase2SetValue('p3_internal_dist', data.internal_dist || ''); phase2SetValue('p3_time_trap', data.time_trap || ''); phase2SetValue('p3_external_dist', data.external_dist || ''); phase2SetValue('p3_alertness_width', data.alertness_width || ''); phase2SetValue('p3_spotlight', data.spotlight || ''); phase2SetValue('p3_shift_sequence', data.shift_sequence || ''); phase2SetValue('p3_instructional_cue', data.instructional_cue || ''); phase2SetValue('p3_motivational_cue', data.motivational_cue || ''); phase2SetValue('p3_anchor_type', data.anchor_type || ''); phase2SetValue('p3_anchor_usage', data.anchor_usage || ''); phase2SetValue('p3_routine_1', data.routine_1 || ''); phase2SetValue('p3_routine_2', data.routine_2 || ''); phase2SetValue('p3_routine_3', data.routine_3 || ''); phase2SetValue('p3_what_if', data.what_if || ''); phase2SetValue('p3_response', data.response || ''); phase2SetValue('p3_simulation_plan', data.simulation_plan || ''); phase2SetValue('p3_narrative', data.narrative || ''); const incomingP3Scores = data.scores || {}; p3_scores = { arena: normalizePhase3RubricScore(incomingP3Scores.arena), anch: normalizePhase3RubricScore(incomingP3Scores.anch), fort: normalizePhase3RubricScore(incomingP3Scores.fort), narr: normalizePhase3RubricScore(incomingP3Scores.narr), audit: normalizePhase3RubricScore(incomingP3Scores.audit) }; Object.keys(p3_scores).forEach(c => { if (p3_scores[c] > 0) p3_setScore(c, p3_scores[c]); }); p3_saveData(); }
        function p3_downloadBackup() { const data = localStorage.getItem('p3_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "focus-backup.json"; a.click(); }
        function p3_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p3_populate(JSON.parse(e.target.result)); alert("Focus Data Loaded"); }; reader.readAsText(file); }
        function p3_generateFullPrint() {
            const data = p3_getFormData();
            const total = Object.values(p3_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p3_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p3_scores[c.id] || 0}/3</span></div>`).join('');
            const routineLine = [data.routine_1, data.routine_2, data.routine_3].filter(Boolean).map((item) => phase2ReportText(item)).join(' &rarr; ') || '---';
            const html = `<!DOCTYPE html><html><head><title>Focus Master Blueprint</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.35; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 700; line-height: 1.45; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; padding-bottom: 6px; } .narr-val { font-size: 11px; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Focus Master Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 3 Concentration System</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/${phase3MaxScore}</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Spotlight Audit</h2><div class="label">Internal distracters</div><div class="val">${phase2ReportMultiline(data.internal_dist)}</div><div class="label">Past / future traps</div><div class="val">${phase2ReportMultiline(data.time_trap)}</div><div class="label">External distracters</div><div class="val">${phase2ReportMultiline(data.external_dist)}</div><div class="label">Alertness / width check</div><div class="val">${phase2ReportMultiline(data.alertness_width)}</div><div class="label">Primary spotlight goal</div><div class="val">${phase2ReportMultiline(data.spotlight)}</div><div class="label">Shift sequence</div><div class="val">${phase2ReportMultiline(data.shift_sequence)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Cue Builder</h2><div class="label">Instructional cue</div><div class="val">${phase2ReportText(data.instructional_cue)}</div><div class="label">Motivational cue</div><div class="val">${phase2ReportText(data.motivational_cue)}</div><div class="label">Physical anchor</div><div class="val">${phase2ReportText(data.anchor_type)}</div><div class="label">Anchor usage</div><div class="val">${phase2ReportMultiline(data.anchor_usage)}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Fortress Plan</h2><div class="label">Routine sequence</div><div class="val">${routineLine}</div><div class="label">High-pressure what-if</div><div class="val">${phase2ReportMultiline(data.what_if)}</div><div class="label">Pre-planned reset</div><div class="val">${phase2ReportMultiline(data.response)}</div><div class="label">Simulation plan</div><div class="val">${phase2ReportMultiline(data.simulation_plan)}</div></div><div class="section" style="border-left-color:#0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${phase2ReportMultiline(data.narrative, 'No narrative provided.')}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div><div style="margin-top:30px; text-align:center; font-size:9px; font-weight:bold; color:#aaa; text-transform:uppercase; letter-spacing:2px;">"The spotlight is trained by what you return to, not by what you say you value."</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`;
            const win = window.open('', '_blank'); win.document.write(html); win.document.close();
        }

        // --- PHASE 4A (CONFIDENCE - NEW) LOGIC ---
        const phase4AMaxScore = 15;
        const p4a_cats = [ { id: 'bank', label: 'Bank Account' }, { id: 'dmg', label: 'Damage Control' }, { id: 'action', label: 'C-B-A Routine' }, { id: 'un', label: 'Understanding Narrative' }, { id: 'audit', label: 'Integrity Audit' } ];
        let p4a_scores = { bank: 0, dmg: 0, action: 0, un: 0, audit: 0 };
        const p4a_step_labels = ['00 Briefing', '01 Bank', '02 Control', '03 Conviction', '04 Review'];
        let p4a_current_step = 0;
        let p4a_step_menu_open = false;

        function normalizePhase4ARubricScore(value) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric) || numeric <= 0) return 0;
            if (numeric >= 4) return 3;
            if (numeric >= 2) return 2;
            return 1;
        }

        function buildPhase4AScoreButtons(catId) {
            return [1,2,3].map(v => `<button onclick="p4a_setScore('${catId}', ${v})" data-score="${v}" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('');
        }

        function buildPhase4ATopTenInputs() {
            return Array.from({ length: 10 }, (_, index) => `<div class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-2"><span class="w-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-sky-300">${index + 1}</span><input id="p4a_tt-${index + 1}" oninput="p4a_saveData()" placeholder="Confidence deposit ${index + 1}..." class="top-ten-input w-full rounded-xl border border-transparent bg-transparent px-1 py-2 text-sm text-white outline-none" /></div>`).join('');
        }

        function buildPhase4AShell() {
            return `
                <div class="mx-auto w-full max-w-none space-y-6 text-white">
                    <section class="rounded-3xl border border-sky-400/25 bg-slate-950/70 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.06)]">
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:items-start">
                            <div class="space-y-3">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.38em] text-sky-300/75">Assignment 04A</p>
                                <div>
                                    <h1 class="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">Confidence Master Blueprint</h1>
                                    <p class="mt-2 p1-phase-subtitle text-xs uppercase tracking-[0.32em] text-slate-400">Phase 4 / bank account, damage control, and conviction routines</p>
                                </div>
                                <p class="max-w-4xl text-sm leading-7 text-slate-300 md:text-base">Confidence is built through deposits, protected by interpretation, and expressed through routine. This pass turns belief into a usable system instead of a mood.</p>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:min-w-0">
                                <div class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-4">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Mastery score</p>
                                    <div class="mt-3 flex items-end gap-2">
                                        <span id="p4a-total-score" class="text-4xl font-black tracking-tight text-sky-300">00</span>
                                        <span class="pb-1 text-sm uppercase tracking-[0.3em] text-slate-500">/15</span>
                                    </div>
                                    <p class="mt-2 text-xs leading-6 text-slate-400">Review scoring stays manual so you can judge whether the confidence system is believable and durable.</p>
                                </div>
                                <div class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-4 p1-file-actions">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">File actions</p>
                                    <div class="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                        <span id="p4a-save-indicator" class="h-2 w-2 rounded-full bg-slate-600"></span>
                                        <span id="p4a-save-text">System Ready</span>
                                    </div>
                                    <div class="mt-3 flex flex-wrap gap-3">
                                        <button type="button" onclick="p4a_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button>
                                        <button type="button" onclick="document.getElementById('p4a-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-sky-400 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button>
                                    </div>
                                    <p class="mt-3 text-[10px] italic text-slate-500">Generate the blueprint report from the review step below.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4">
                        <div id="p4a-step-nav-shell" class="p1-step-nav-shell">
                            <button id="p4a-step-toggle" type="button" onclick="p4a_toggleStepMenu()" class="p1-step-toggle" aria-expanded="false">
                                <span class="p1-step-toggle-copy"><span class="p1-step-toggle-kicker mono">Step Menu</span><span id="p4a-step-toggle-current" class="p1-step-toggle-current mono">00 Briefing</span></span>
                                <span class="p1-step-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
                            </button>
                            <div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2 p1-step-nav">
                                <button type="button" onclick="p4a_showStep(0)" class="mod-nav-btn p1-step-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">00 Briefing</button>
                                <button type="button" onclick="p4a_showStep(1)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Bank</button>
                                <button type="button" onclick="p4a_showStep(2)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Control</button>
                                <button type="button" onclick="p4a_showStep(3)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Conviction</button>
                                <button type="button" onclick="p4a_showStep(4)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Review</button>
                            </div>
                        </div>
                    </section>

                    <section id="p4a-step0" class="step-content active p1-step space-y-6 rounded-3xl border border-sky-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.05)]"></section>
                    <section id="p4a-step1" class="step-content p1-step hidden space-y-6 rounded-3xl border border-sky-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.05)]"></section>
                    <section id="p4a-step2" class="step-content p1-step hidden space-y-6 rounded-3xl border border-sky-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.05)]"></section>
                    <section id="p4a-step3" class="step-content p1-step hidden space-y-6 rounded-3xl border border-sky-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.05)]"></section>
                    <section id="p4a-step4" class="step-content p1-step hidden space-y-6 rounded-3xl border border-sky-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(14,165,233,0.05)]"></section>
                </div>
                <input id="p4a-file-upload" type="file" accept="application/json" class="hidden" onchange="p4a_loadBackup(this)" />
            `;
        }

        function buildPhase4AStep0Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Step 00</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mission briefing</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Confidence is evidence stored well, setbacks interpreted correctly, and a routine that restores conviction fast. Phase 4A builds the bank, the filter, and the trigger.</p></div><div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"><article class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">The bank account</p><p class="mt-3 text-sm leading-7 text-slate-300">Track specific evidence of capability instead of waiting to feel confident first.</p></article><article class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Daily deposits</p><p class="mt-3 text-sm leading-7 text-slate-300">Effort, success, and progress keep confidence active between major performances.</p></article><article class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Damage control</p><p class="mt-3 text-sm leading-7 text-slate-300">The event is not the damage. The interpretation is.</p></article><article class="rounded-2xl border border-sky-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">C-B-A routine</p><p class="mt-3 text-sm leading-7 text-slate-300">Cue, breathe, attach. Reconnect belief to action quickly.</p></article></div><div class="flex justify-center pt-2"><button type="button" onclick="p4a_showStep(1)" class="bg-sky-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/20 active:scale-95">Enter The Vault</button></div>`;
        }

        function buildPhase4AStep1Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Step 01</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">The mental bank account</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Inventory the evidence that you are capable, prepared, and reliable. Then define the daily logic that keeps the account stocked.</p></div><div class="grid gap-5 xl:grid-cols-[1.2fr_0.9fr]"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Top ten confidence deposits</span><p class="mt-2 text-sm leading-6 text-slate-400">List the proof that you can perform, respond, and improve under pressure.</p><div class="mt-4 space-y-2">${buildPhase4ATopTenInputs()}</div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Effort deposit</span><p class="mt-2 text-sm leading-6 text-slate-400">What recent effort proves grit or discipline?</p><input id="p4a_esp_effort" oninput="p4a_saveData()" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Name the recent effort that deserves to count as proof." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Success deposit</span><p class="mt-2 text-sm leading-6 text-slate-400">What recent win or technical success belongs in the account?</p><input id="p4a_esp_success" oninput="p4a_saveData()" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Name the success you want your brain to keep counting." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Progress deposit</span><p class="mt-2 text-sm leading-6 text-slate-400">How are you better than before?</p><input id="p4a_esp_progress" oninput="p4a_saveData()" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Name the proof that growth is happening." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Daily deposit plan</span><p class="mt-2 text-sm leading-6 text-slate-400">How will you keep adding to the account on ordinary days?</p><textarea id="p4a_daily_plan" oninput="p4a_saveData()" rows="5" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Describe the habit that keeps confidence supplied with real evidence."></textarea></label></div></div>`;
        }

        function buildPhase4AStep2Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Step 02</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Damage control</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Build the interpretation filter now so setbacks cost less belief when they happen.</p></div><div class="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Recent setback or recurring fear</span><p class="mt-2 text-sm leading-6 text-slate-400">Name the event or pressure pattern that usually drains confidence fastest.</p><textarea id="p4a_setback" oninput="p4a_saveData()" rows="7" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Describe the setback or fear that normally creates the biggest withdrawal."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Lockdown reframe</span><p class="mt-2 text-sm leading-6 text-slate-400">Rewrite the event as temporary, limited, and non-defining.</p><textarea id="p4a_lockdown" oninput="p4a_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Show how you would answer the event so it stays temporary, limited, and nonrepresentative."></textarea></label></div><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Lockdown filter</span><div class="mt-4 grid gap-3"><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">Temporary</p><p class="mt-2 text-sm leading-6 text-slate-300">It happened in time. It is not forever.</p></article><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">Limited</p><p class="mt-2 text-sm leading-6 text-slate-300">It affected one moment or skill. It is not everything.</p></article><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">Non-defining</p><p class="mt-2 text-sm leading-6 text-slate-300">The mistake is data, not identity.</p></article></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Selective perception</span><p class="mt-3 text-sm leading-7 text-slate-300">Confidence stays alive when your brain keeps counting evidence of preparation and response, even after a miss.</p></div></div></div>`;
        }

        function buildPhase4AStep3Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Step 03</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Conviction (C-B-A routine)</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Build the quick sequence that restores belief and reconnects attention to action.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Cue word</span><p class="mt-2 text-sm leading-6 text-slate-400">What short phrase triggers confidence immediately?</p><input id="p4a_cue" oninput="p4a_saveData()" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Example: trust, reset, hunt, compete." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Belief statement</span><p class="mt-2 text-sm leading-6 text-slate-400">What belief should be active before execution?</p><textarea id="p4a_belief" oninput="p4a_saveData()" rows="6" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Write the belief you want to return to when confidence gets tested."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Attachment action</span><p class="mt-2 text-sm leading-6 text-slate-400">What physical or visual action reattaches attention to execution?</p><input id="p4a_attach" oninput="p4a_saveData()" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Name the physical or visual action that reconnects you to the task." /></label></div><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">C-B-A sequence</span><div class="mt-4 grid gap-3"><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-sky-300">Cue</p><p class="mt-2 text-sm leading-6 text-slate-300">Trigger the mindset you trust.</p></article><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-300">Breathe</p><p class="mt-2 text-sm leading-6 text-slate-300">Take one diaphragmatic breath to stop escalation.</p></article><article class="rounded-2xl border border-slate-800 bg-slate-950/75 p-4"><p class="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">Attach</p><p class="mt-2 text-sm leading-6 text-slate-300">Lock onto the external target or first action that starts execution.</p></article></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Routine check</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The cue should be short enough to use under pressure.</li><li>The belief statement should restore conviction, not start an internal argument.</li><li>The attachment action should point attention toward execution, not self-monitoring.</li></ul></div></div></div>`;
        }

        function buildPhase4AStep4Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-sky-300">Step 04</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Review and synthesis</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Audit the confidence system, then explain how the deposits, damage-control filter, and C-B-A routine work together.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid"><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Confidence integrity audit</span><p class="mt-2 text-sm leading-6 text-slate-400">Score how believable, specific, and durable the confidence system feels right now.</p><div id="p4a-scoring-container" class="mt-4 space-y-4"></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">What strong confidence work looks like</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The bank account contains specific evidence, not vague compliments.</li><li>Daily deposits keep confidence active between major performances.</li><li>The lockdown filter protects belief without denying reality.</li><li>The C-B-A routine is short enough to use in a real pressure moment.</li></ul></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Understanding narrative</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain how the bank account, lockdown reframe, and C-B-A routine combine into one believable confidence system.</p><textarea id="p4a_narr" oninput="p4a_saveData()" rows="11" class="mt-4 w-full rounded-2xl border border-sky-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300" placeholder="Show how the deposits, reframe logic, and conviction routine reinforce performance under pressure."></textarea></label><div class="rounded-2xl border border-sky-400/20 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-sky-300">Confidence summary</span><p id="p4a-summary-preview" class="mt-3 text-sm leading-7 text-slate-300">...</p></div></div></div><div class="p1-rubric-shell overflow-x-auto"><table class="min-w-[980px] w-full border-collapse p1-rubric-table"><thead><tr><th>Criteria</th><th>Proficient</th><th>Developing</th><th>Emerging</th></tr></thead><tbody><tr><th>Bank account</th><td>Deposits and daily logic are specific, believable, and clearly tied to preparation or mastery evidence.</td><td>Some useful evidence is present, but deposits stay generic, incomplete, or only partly actionable.</td><td>The confidence bank is thin, vague, or missing a believable deposit habit.</td></tr><tr><th>Damage control</th><td>The setback and lockdown reframe clearly protect confidence by treating the event as temporary, limited, and non-defining.</td><td>A setback is named, but the reframe stays partial, emotional, or only loosely connected to the filter.</td><td>Damage control is incomplete or missing, so setbacks still read like identity threats.</td></tr><tr><th>C-B-A routine</th><td>The cue, belief, and attachment action create a short, usable conviction routine for real pressure moments.</td><td>The routine exists, but one or more parts are generic, wordy, or difficult to use under stress.</td><td>The routine is incomplete or not credible enough to use in competition.</td></tr><tr><th>Understanding narrative</th><td>The narrative clearly connects deposits, interpretation, and routine into one coherent confidence system.</td><td>The narrative explains some ideas but does not fully connect the full system or its pressure use.</td><td>The narrative is missing or shows limited understanding of how confidence should be built and protected.</td></tr><tr><th>Integrity audit</th><td>Scoring and summary are honest, aligned with the written work, and useful for future review.</td><td>Scoring is present but only partly aligned with the actual confidence plan.</td><td>Scoring is incomplete or unsupported by the written work.</td></tr></tbody></table></div><div class="flex flex-col md:flex-row gap-4 pt-2"><button type="button" onclick="p4a_showStep(0)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button type="button" onclick="p4a_generatePDF()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Generate Blueprint PDF</button></div>`;
        }

        function upgradePhase4AView() {
            const phase4ARoot = document.getElementById('view-phase4a');
            if (!phase4ARoot || phase4ARoot.dataset.phase4aUpgrade === 'v1') return;

            phase4ARoot.innerHTML = buildPhase4AShell();
            setStepMarkup('p4a-step0', buildPhase4AStep0Markup());
            setStepMarkup('p4a-step1', buildPhase4AStep1Markup());
            setStepMarkup('p4a-step2', buildPhase4AStep2Markup());
            setStepMarkup('p4a-step3', buildPhase4AStep3Markup());
            setStepMarkup('p4a-step4', buildPhase4AStep4Markup());
            upgradePhase2FieldCards(phase4ARoot);
            phase4ARoot.dataset.phase4aUpgrade = 'v1';
            p4a_syncStepMenu();
        }

        function p4a_syncStepMenu() {
            const shell = document.getElementById('p4a-step-nav-shell');
            const toggleButton = document.getElementById('p4a-step-toggle');
            const toggleCurrent = document.getElementById('p4a-step-toggle-current');
            if (shell) shell.classList.toggle('is-open', p4a_step_menu_open);
            if (toggleButton) toggleButton.setAttribute('aria-expanded', p4a_step_menu_open ? 'true' : 'false');
            if (toggleCurrent) toggleCurrent.textContent = p4a_step_labels[p4a_current_step] || p4a_step_labels[0];
        }
        function p4a_setStepMenuOpen(open) { p4a_step_menu_open = !!open; p4a_syncStepMenu(); }
        function p4a_toggleStepMenu() { p4a_setStepMenuOpen(!p4a_step_menu_open); }
        function p4a_showStep(n) { p4a_current_step = Math.max(0, Math.min(4, Number(n) || 0)); document.querySelectorAll('#view-phase4a .step-content').forEach((panel) => { panel.classList.add('hidden'); panel.classList.remove('active'); }); const activePanel = document.getElementById('p4a-step' + p4a_current_step); if (activePanel) { activePanel.classList.remove('hidden'); activePanel.classList.add('active'); } document.querySelectorAll('#view-phase4a .p1-step-btn').forEach((b, i) => b.classList.toggle('active', i === p4a_current_step)); p4a_setStepMenuOpen(false); }
        function p4a_setScore(cat, val) { const normalized = normalizePhase4ARubricScore(val); p4a_scores[cat] = normalized; const group = document.getElementById(`p4a-group-${cat}`); if (group) group.querySelectorAll('button').forEach((button) => button.classList.toggle('active', Number(button.dataset.score) === normalized)); const total = Object.values(p4a_scores).reduce((a, b) => a + b, 0); const totalScore = document.getElementById('p4a-total-score'); if (totalScore) totalScore.innerText = total.toString().padStart(2, '0'); p4a_saveData(); }
        function p4a_getFormData() { const tt = []; for (let i = 1; i <= 10; i += 1) tt.push(phase2Value(`p4a_tt-${i}`)); return { tt, esp1: phase2Value('p4a_esp_effort'), esp2: phase2Value('p4a_esp_success'), esp3: phase2Value('p4a_esp_progress'), daily_plan: phase2Value('p4a_daily_plan'), setback: phase2Value('p4a_setback'), lockdown: phase2Value('p4a_lockdown'), cue: phase2Value('p4a_cue'), belief: phase2Value('p4a_belief'), attach: phase2Value('p4a_attach'), narr: phase2Value('p4a_narr'), scores: p4a_scores }; }
        function p4a_saveData() { upgradePhase4AView(); const data = p4a_getFormData(); localStorage.setItem('p4a_data', JSON.stringify(data)); setTextById(['p4a-save-text'], "Saved"); updateP4ASummary(data); refreshProgressUI(); setTimeout(() => setTextById(['p4a-save-text'], "System Ready"), 1000); }
        function updateP4ASummary(data) { const preview = document.getElementById('p4a-summary-preview'); if (!preview) return; const deposit = (data.tt || []).find((item) => typeof item === 'string' && item.trim()) || data.esp2 || 'specific deposits'; const reframe = data.lockdown || 'a lockdown reframe'; const cue = data.cue || 'a cue word'; const belief = data.belief || 'a belief statement'; const attach = data.attach || 'an attachment action'; preview.innerHTML = `I reinforce confidence with <span class="text-sky-400 font-bold underline underline-offset-2">${deposit}</span>, protect belief through <span class="text-emerald-400 font-bold underline underline-offset-2">${reframe}</span>, and enter pressure with <span class="text-amber-400 font-bold underline underline-offset-2">${cue}</span>, <span class="text-sky-400 font-bold underline underline-offset-2">${belief}</span>, and <span class="text-emerald-400 font-bold underline underline-offset-2">${attach}</span>.`; }
        function p4a_populate(data) { upgradePhase4AView(); upgradePhase2FieldCards(document.getElementById('view-phase4a')); if(!data) return; if (Array.isArray(data.tt)) data.tt.forEach((value, index) => phase2SetValue(`p4a_tt-${index + 1}`, value || '')); phase2SetValue('p4a_esp_effort', data.esp1 || ''); phase2SetValue('p4a_esp_success', data.esp2 || ''); phase2SetValue('p4a_esp_progress', data.esp3 || ''); phase2SetValue('p4a_daily_plan', data.daily_plan || ''); phase2SetValue('p4a_setback', data.setback || ''); phase2SetValue('p4a_lockdown', data.lockdown || ''); phase2SetValue('p4a_cue', data.cue || ''); phase2SetValue('p4a_belief', data.belief || ''); phase2SetValue('p4a_attach', data.attach || ''); phase2SetValue('p4a_narr', data.narr || ''); const incomingP4AScores = data.scores || {}; p4a_scores = { bank: normalizePhase4ARubricScore(incomingP4AScores.bank), dmg: normalizePhase4ARubricScore(incomingP4AScores.dmg), action: normalizePhase4ARubricScore(incomingP4AScores.action), un: normalizePhase4ARubricScore(incomingP4AScores.un), audit: normalizePhase4ARubricScore(incomingP4AScores.audit) }; Object.keys(p4a_scores).forEach(c => { if (p4a_scores[c] > 0) p4a_setScore(c, p4a_scores[c]); }); p4a_saveData(); }
        function p4a_downloadBackup() { const data = localStorage.getItem('p4a_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "confidence-backup.json"; a.click(); }
        function p4a_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p4a_populate(JSON.parse(e.target.result)); alert("Confidence Data Loaded"); }; reader.readAsText(file); }
        function p4a_generatePDF() { const data = p4a_getFormData(); const total = Object.values(p4a_scores).reduce((a, b) => a + b, 0); const scoreDetails = p4a_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p4a_scores[c.id] || 0}/3</span></div>`).join(''); const ttHTML = (data.tt || []).filter((item) => typeof item === 'string' && item.trim()).map((item, i) => `<div style="font-size:11px; margin-bottom:4px;"><b>${i + 1}.</b> ${phase2ReportText(item)}</div>`).join('') || '<div style="font-size:11px; margin-bottom:4px;">No deposits recorded.</div>'; const html = `<!DOCTYPE html><html><head><title>Confidence Master Blueprint</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.35; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 700; line-height: 1.45; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; padding-bottom: 6px; } .narr-val { font-size: 11px; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Confidence Master Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 Confidence System</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/${phase4AMaxScore}</p></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Top Ten Confidence Deposits</h2>${ttHTML}</div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Daily Deposit Logic</h2><div class="label">Effort deposit</div><div class="val">${phase2ReportText(data.esp1)}</div><div class="label">Success deposit</div><div class="val">${phase2ReportText(data.esp2)}</div><div class="label">Progress deposit</div><div class="val">${phase2ReportText(data.esp3)}</div><div class="label">Daily deposit plan</div><div class="val">${phase2ReportMultiline(data.daily_plan)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Damage Control</h2><div class="label">Recent setback or recurring fear</div><div class="val">${phase2ReportMultiline(data.setback)}</div><div class="label">Lockdown reframe</div><div class="val">${phase2ReportMultiline(data.lockdown)}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">C-B-A Routine</h2><div class="label">Cue word</div><div class="val">${phase2ReportText(data.cue)}</div><div class="label">Belief statement</div><div class="val">${phase2ReportMultiline(data.belief)}</div><div class="label">Attachment action</div><div class="val">${phase2ReportText(data.attach)}</div></div><div class="section" style="border-left-color:#0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${phase2ReportMultiline(data.narr, 'No narrative provided.')}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div><div style="margin-top:30px; text-align:center; font-size:9px; font-weight:bold; color:#aaa; text-transform:uppercase; letter-spacing:2px;">"Confidence is evidence remembered and protected on purpose."</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; const win = window.open('', '_blank'); win.document.write(html); win.document.close(); }

        // --- PHASE 4B VISUALIZATION (NEW) LOGIC ---
        const phase4BMaxScore = 15;
        const p4b_cats = [ { id: 'script', label: 'Master Script' }, { id: 'depth', label: 'Sensory Depth' }, { id: 'reset', label: 'Reset Drill' }, { id: 'un', label: 'Understanding Narrative' }, { id: 'audit', label: 'Integrity Audit' } ];
        let p4b_scores = { script: 0, depth: 0, reset: 0, un: 0, audit: 0 };
        const p4b_step_labels = ['00 Briefing', '01 Sanctuary', '02 Performance', '03 Reset', '04 Review'];
        let p4b_current_step = 0;
        let p4b_step_menu_open = false;
        let p4b_saveTimeout;

        function normalizePhase4BRubricScore(value) {
            const numeric = Number(value);
            if (!Number.isFinite(numeric) || numeric <= 0) return 0;
            if (numeric >= 4) return 3;
            if (numeric >= 2) return 2;
            return 1;
        }

        function buildPhase4BScoreButtons(catId) {
            return [1,2,3].map(v => `<button onclick="p4b_setScore('${catId}', ${v})" data-score="${v}" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('');
        }

        function buildPhase4BShell() {
            return `
                <div class="mx-auto w-full max-w-none space-y-6 text-white">
                    <section class="rounded-3xl border border-violet-400/25 bg-slate-950/70 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.08)]">
                        <div class="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.95fr)] xl:items-start">
                            <div class="space-y-3">
                                <p class="text-[11px] font-semibold uppercase tracking-[0.38em] text-violet-300/75">Assignment 04B</p>
                                <div>
                                    <h1 class="text-3xl font-black uppercase tracking-tight text-white md:text-5xl">Visualization Master Blueprint</h1>
                                    <p class="mt-2 p1-phase-subtitle text-xs uppercase tracking-[0.32em] text-slate-400">Phase 4 / sanctuary building, multisensory scripting, and reset rehearsal</p>
                                </div>
                                <p class="max-w-4xl text-sm leading-7 text-slate-300 md:text-base">Visualization works when the internal film is controlled, vivid, and usable under disruption. This pass turns the chapter into a deliberate rehearsal system instead of a vague imagination exercise.</p>
                            </div>
                            <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 xl:min-w-0">
                                <div class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-4">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">Mastery score</p>
                                    <div class="mt-3 flex items-end gap-2">
                                        <span id="p4b-total-score" class="text-4xl font-black tracking-tight text-violet-300">00</span>
                                        <span class="pb-1 text-sm uppercase tracking-[0.3em] text-slate-500">/15</span>
                                    </div>
                                    <p class="mt-2 text-xs leading-6 text-slate-400">Review scoring stays manual so you can judge whether the internal film is detailed, controllable, and believable enough to reuse.</p>
                                </div>
                                <div class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-4 p1-file-actions">
                                    <p class="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-400">File actions</p>
                                    <div class="mt-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.24em] text-slate-500">
                                        <span id="p4b-save-indicator" class="h-2 w-2 rounded-full bg-slate-600"></span>
                                        <span id="p4b-save-text">Visualization system ready</span>
                                    </div>
                                    <div class="mt-3 flex flex-wrap gap-3">
                                        <button type="button" onclick="p4b_downloadBackup()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Save Backup File</button>
                                        <button type="button" onclick="document.getElementById('p4b-file-upload').click()" class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-violet-300 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider transition-colors border border-slate-700">Load Backup</button>
                                    </div>
                                    <p class="mt-3 text-[10px] italic text-slate-500">Generate the blueprint report from the review step below.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="rounded-3xl border border-slate-700/80 bg-slate-950/60 p-4">
                        <div id="p4b-step-nav-shell" class="p1-step-nav-shell">
                            <button id="p4b-step-toggle" type="button" onclick="p4b_toggleStepMenu()" class="p1-step-toggle" aria-expanded="false">
                                <span class="p1-step-toggle-copy"><span class="p1-step-toggle-kicker mono">Step Menu</span><span id="p4b-step-toggle-current" class="p1-step-toggle-current mono">00 Briefing</span></span>
                                <span class="p1-step-toggle-bars" aria-hidden="true"><span></span><span></span><span></span></span>
                            </button>
                            <div class="flex justify-center gap-2 overflow-x-auto pb-2 px-2 p1-step-nav">
                                <button type="button" onclick="p4b_showStep(0)" class="mod-nav-btn p1-step-btn active px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">00 Briefing</button>
                                <button type="button" onclick="p4b_showStep(1)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">01 Sanctuary</button>
                                <button type="button" onclick="p4b_showStep(2)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">02 Performance</button>
                                <button type="button" onclick="p4b_showStep(3)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">03 Reset</button>
                                <button type="button" onclick="p4b_showStep(4)" class="mod-nav-btn p1-step-btn px-4 py-2 rounded-lg border border-slate-700 text-[10px] font-bold uppercase tracking-widest mono transition-all flex-shrink-0">04 Review</button>
                            </div>
                        </div>
                    </section>

                    <section id="p4b-step0" class="step-content active p1-step space-y-6 rounded-3xl border border-violet-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06)]"></section>
                    <section id="p4b-step1" class="step-content p1-step hidden space-y-6 rounded-3xl border border-violet-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06)]"></section>
                    <section id="p4b-step2" class="step-content p1-step hidden space-y-6 rounded-3xl border border-violet-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06)]"></section>
                    <section id="p4b-step3" class="step-content p1-step hidden space-y-6 rounded-3xl border border-violet-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06)]"></section>
                    <section id="p4b-step4" class="step-content p1-step hidden space-y-6 rounded-3xl border border-violet-400/25 bg-slate-950/65 p-6 shadow-[0_0_0_1px_rgba(167,139,250,0.06)]"></section>
                </div>
                <input id="p4b-file-upload" type="file" accept="application/json" class="hidden" onchange="p4b_loadBackup(this)" />
            `;
        }

        function buildPhase4BStep0Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Step 00</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mission briefing</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Phase 4B turns visualization into a controllable rehearsal system. The job is to create a sanctuary, load the film with multisensory detail, rehearse the disruption, and leave with a script that can be replayed on purpose.</p></div><div class="grid gap-4 lg:grid-cols-2 xl:grid-cols-4"><article class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Mental sanctuary</p><p class="mt-3 text-sm leading-7 text-slate-300">Start rehearsal in a place you control completely so the film begins from calm and intention.</p></article><article class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Multisensory script</p><p class="mt-3 text-sm leading-7 text-slate-300">Build the scene through sight, sound, body feel, and emotional tone instead of relying on vague imagery.</p></article><article class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Reset rehearsal</p><p class="mt-3 text-sm leading-7 text-slate-300">Do not rehearse only success. Rehearse the glitch and the dominant response that restores control.</p></article><article class="rounded-2xl border border-violet-400/20 bg-slate-900/80 p-5"><p class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Full film</p><p class="mt-3 text-sm leading-7 text-slate-300">The script should flow from entry to execution to reset as one believable internal sequence.</p></article></div><div class="flex justify-center pt-2"><button type="button" onclick="p4b_showStep(1)" class="bg-violet-600 px-12 py-4 rounded-xl text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/20 active:scale-95">Enter Visualization Lab</button></div>`;
        }

        function buildPhase4BStep1Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Step 01</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Mental sanctuary</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Start the film in a space you can control fully, then add the anchor object that makes the scene tactile and present instead of abstract.</p></div><div class="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Describe your sanctuary</span><p class="mt-2 text-sm leading-6 text-slate-400">Describe the room, lighting, colors, temperature, and atmosphere.</p><textarea id="p4b_sanctuary_desc" oninput="p4b_saveData()" rows="12" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe the controlled room where the internal film begins."></textarea></label><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Anchor object</span><p class="mt-2 text-sm leading-6 text-slate-400">What object or tool are you holding when the visualization starts?</p><input id="p4b_tool_name" oninput="p4b_saveData()" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Name the object, tool, or piece of equipment." /></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Object manipulation details</span><p class="mt-2 text-sm leading-6 text-slate-400">Describe the texture, weight, pressure, and movement as you handle it.</p><textarea id="p4b_tool_manipulation" oninput="p4b_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe the tactile detail that makes the scene feel physically real."></textarea></label><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Sanctuary standard</span><p class="mt-3 text-sm leading-7 text-slate-300">The sanctuary should make you feel oriented, calm, and in control. If the opening scene feels chaotic or generic, the rehearsal is usually too thin to help later.</p></div></div></div>`;
        }

        function buildPhase4BStep2Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Step 02</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Performance script</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Build the sequence with multiple sensory channels so the film becomes rehearsable, not just watchable. Detail increases controllability.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Visual and auditory details</span><p class="mt-2 text-sm leading-6 text-slate-400">What do you see and hear in the execution scene?</p><textarea id="p4b_script_va" oninput="p4b_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe what the scene looks and sounds like when performance is working well."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Kinesthetic details</span><p class="mt-2 text-sm leading-6 text-slate-400">What does your body feel as you execute?</p><textarea id="p4b_script_k" oninput="p4b_saveData()" rows="7" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe tempo, balance, breath, tension, smoothness, and body position."></textarea></label></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Emotional state</span><p class="mt-2 text-sm leading-6 text-slate-400">What is the felt sense of readiness, control, or intensity?</p><textarea id="p4b_script_e" oninput="p4b_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe the emotional tone that should accompany strong execution."></textarea></label><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Vividness check</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>If the scene feels fuzzy, add more sensory detail.</li><li>If the scene feels passive, add more body action and timing.</li><li>If the scene feels emotionally flat, clarify the performance tone you want active.</li><li>The goal is not fantasy. The goal is a repeatable internal rehearsal cue.</li></ul></div></div></div>`;
        }

        function buildPhase4BStep3Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Step 03</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Reset drill</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Do not rehearse only perfect execution. Build the predictable glitch into the film and script the dominant response that re-centers control.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">The failure or glitch</span><p class="mt-2 text-sm leading-6 text-slate-400">What disruption usually breaks rhythm, confidence, or timing?</p><textarea id="p4b_ft_crisis" oninput="p4b_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Describe the error, interruption, or pressure moment that usually cracks the film."></textarea></label><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">The dominant reset</span><p class="mt-2 text-sm leading-6 text-slate-400">What breath, cue, and physical response restores control?</p><textarea id="p4b_ft_reset" oninput="p4b_saveData()" rows="8" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Write the exact reset you want to rehearse until it feels automatic."></textarea></label></div><div class="space-y-5"><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Reset standard</span><p class="mt-3 text-sm leading-7 text-slate-300">A strong reset drill does not erase the disruption. It shows how you recognize it, calm the body, and return to the next controllable action without losing the whole sequence.</p></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Controllability check</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The crisis should be realistic, not theatrical.</li><li>The reset should be short enough to use in real time.</li><li>The response should reconnect attention to action, not to panic or commentary.</li></ul></div></div></div>`;
        }

        function buildPhase4BStep4Markup() {
            return `<div><p class="text-xs font-semibold uppercase tracking-[0.32em] text-violet-300">Step 04</p><h2 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Review and synthesis</h2><p class="mt-3 max-w-4xl text-sm leading-7 text-slate-300">Write the full internal film, audit its quality, and explain how the sanctuary, sensory detail, and reset drill create a usable visualization system.</p></div><div class="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] p1-review-grid"><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Full visualization script</span><p class="mt-2 text-sm leading-6 text-slate-400">Combine the sanctuary, performance sequence, and reset drill into one coherent internal film.</p><textarea id="p4b_master_script" oninput="p4b_saveData()" rows="12" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Write the full multisensory script from entry to execution to reset."></textarea></label><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Visualization integrity audit</span><p class="mt-2 text-sm leading-6 text-slate-400">Score how vivid, controllable, and believable the internal film feels right now.</p><div id="p4b-scoring-container" class="mt-4 space-y-4"></div></div><div class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">What strong visualization work looks like</span><ul class="mt-3 space-y-2 text-sm leading-6 text-slate-300"><li>The sanctuary is specific enough to create control immediately.</li><li>The script uses multiple sensory channels instead of generic imagery.</li><li>The reset drill rehearses disruption and recovery, not just success.</li><li>The full film reads like a sequence you could actually replay on purpose.</li></ul></div></div><div class="space-y-5"><label class="rounded-2xl border border-slate-700 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Understanding narrative</span><p class="mt-2 text-sm leading-6 text-slate-400">Explain how the sanctuary, sensory depth, and reset drill turn visualization into a usable performance tool.</p><textarea id="p4b_narrative" oninput="p4b_saveData()" rows="11" class="mt-4 w-full rounded-2xl border border-violet-400/25 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-violet-300" placeholder="Show how the internal film supports preparation, execution, and recovery under pressure."></textarea></label><div class="rounded-2xl border border-violet-400/20 bg-slate-900/75 p-5"><span class="text-xs font-semibold uppercase tracking-[0.3em] text-violet-300">Visualization summary</span><p id="p4b-summary-preview" class="mt-3 text-sm leading-7 text-slate-300">...</p></div></div></div><div class="p1-rubric-shell overflow-x-auto"><table class="min-w-[980px] w-full border-collapse p1-rubric-table"><thead><tr><th>Criteria</th><th>Proficient</th><th>Developing</th><th>Emerging</th></tr></thead><tbody><tr><th>Master script</th><td>The full script flows from sanctuary to execution to reset as one coherent internal sequence.</td><td>The script exists, but transitions or key moments remain thin, abrupt, or only partly connected.</td><td>The script is incomplete or too underbuilt to guide rehearsal.</td></tr><tr><th>Sensory depth</th><td>Visual, auditory, kinesthetic, and emotional detail make the scene vivid and controllable.</td><td>Some sensory channels are useful, but others remain vague or underdeveloped.</td><td>The scene is generic, sparse, or missing the detail needed for effective rehearsal.</td></tr><tr><th>Reset drill</th><td>The disruption and dominant response create a realistic recovery sequence you could rehearse under pressure.</td><td>The reset exists, but it is partly vague, too long, or not fully connected to controllable action.</td><td>The reset drill is incomplete or not believable enough to use.</td></tr><tr><th>Understanding narrative</th><td>The narrative clearly explains how visualization supports preparation, execution, and recovery.</td><td>The narrative covers some ideas but does not fully connect the purpose of the full visualization system.</td><td>The narrative is missing or shows limited understanding of how the system should work.</td></tr><tr><th>Integrity audit</th><td>Scoring and summary are honest, aligned with the written work, and useful for future rehearsal.</td><td>Scoring is present but only partly aligned with the actual script and reset plan.</td><td>Scoring is incomplete or not supported by the written work.</td></tr></tbody></table></div><div class="flex flex-col md:flex-row gap-4 pt-2"><button type="button" onclick="p4b_showStep(0)" class="flex-1 text-slate-500 font-bold uppercase text-[10px] tracking-widest hover:text-white transition-colors border border-slate-800 rounded-xl py-4"><- Start Over</button><button type="button" onclick="p4b_generateFullPrint()" class="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all active:scale-[0.98]">Generate Blueprint PDF</button></div>`;
        }

        function upgradePhase4BView() {
            const phase4bRoot = document.getElementById('view-phase4b');
            if (!phase4bRoot || phase4bRoot.dataset.phase4bUpgrade === 'v1') return;

            phase4bRoot.innerHTML = buildPhase4BShell();
            setStepMarkup('p4b-step0', buildPhase4BStep0Markup());
            setStepMarkup('p4b-step1', buildPhase4BStep1Markup());
            setStepMarkup('p4b-step2', buildPhase4BStep2Markup());
            setStepMarkup('p4b-step3', buildPhase4BStep3Markup());
            setStepMarkup('p4b-step4', buildPhase4BStep4Markup());
            upgradePhase2FieldCards(phase4bRoot);
            phase4bRoot.dataset.phase4bUpgrade = 'v1';
            p4b_syncStepMenu();
        }

        function p4b_syncStepMenu() {
            const shell = document.getElementById('p4b-step-nav-shell');
            const toggleButton = document.getElementById('p4b-step-toggle');
            const toggleCurrent = document.getElementById('p4b-step-toggle-current');
            if (shell) shell.classList.toggle('is-open', p4b_step_menu_open);
            if (toggleButton) toggleButton.setAttribute('aria-expanded', p4b_step_menu_open ? 'true' : 'false');
            if (toggleCurrent) toggleCurrent.textContent = p4b_step_labels[p4b_current_step] || p4b_step_labels[0];
        }
        function p4b_setStepMenuOpen(open) { p4b_step_menu_open = !!open; p4b_syncStepMenu(); }
        function p4b_toggleStepMenu() { p4b_setStepMenuOpen(!p4b_step_menu_open); }
        function p4b_showStep(n) { p4b_current_step = Math.max(0, Math.min(4, Number(n) || 0)); document.querySelectorAll('#view-phase4b .step-content').forEach((panel) => { panel.classList.add('hidden'); panel.classList.remove('active'); }); const activePanel = document.getElementById('p4b-step' + p4b_current_step); if (activePanel) { activePanel.classList.remove('hidden'); activePanel.classList.add('active'); } document.querySelectorAll('#view-phase4b .p1-step-btn').forEach((b, i) => b.classList.toggle('active', i === p4b_current_step)); p4b_setStepMenuOpen(false); }
        function p4b_setScore(cat, val) { const normalized = normalizePhase4BRubricScore(val); p4b_scores[cat] = normalized; const group = document.getElementById(`p4b-group-${cat}`); if (group) group.querySelectorAll('button').forEach((button) => button.classList.toggle('active', Number(button.dataset.score) === normalized)); const total = Object.values(p4b_scores).reduce((a, b) => a + b, 0); const totalScore = document.getElementById('p4b-total-score'); if (totalScore) totalScore.innerText = total.toString().padStart(2, '0'); p4b_saveData(); }
        function p4b_getFormData() { return { sanctuary_desc: phase2Value('p4b_sanctuary_desc'), tool_name: phase2Value('p4b_tool_name'), tool_manipulation: phase2Value('p4b_tool_manipulation'), script_va: phase2Value('p4b_script_va'), script_k: phase2Value('p4b_script_k'), script_e: phase2Value('p4b_script_e'), ft_crisis: phase2Value('p4b_ft_crisis'), ft_reset: phase2Value('p4b_ft_reset'), master_script: phase2Value('p4b_master_script'), narrative: phase2Value('p4b_narrative'), scores: p4b_scores }; }
        function p4b_saveData() { upgradePhase4BView(); const data = p4b_getFormData(); localStorage.setItem('athlete_visualization_master_v1', JSON.stringify(data)); setTextById(['p4b-save-text'], "Saved"); updateP4BSummary(data); refreshProgressUI(); clearTimeout(p4b_saveTimeout); p4b_saveTimeout = setTimeout(() => setTextById(['p4b-save-text'], "Visualization system ready"), 1000); }
        function updateP4BSummary(data) { const preview = document.getElementById('p4b-summary-preview'); if (!preview) return; const sanctuary = data.sanctuary_desc || 'a controlled sanctuary'; const tool = data.tool_name || 'an anchor object'; const detail = data.script_va || data.script_k || data.script_e || 'multisensory detail'; const disruption = data.ft_crisis || 'a pressure glitch'; const response = data.ft_reset || 'a dominant reset'; preview.innerHTML = `I start in <span class="text-sky-400 font-bold underline underline-offset-2">${sanctuary}</span>, ground the film with <span class="text-emerald-400 font-bold underline underline-offset-2">${tool}</span>, load the sequence with <span class="text-amber-400 font-bold underline underline-offset-2">${detail}</span>, and answer <span class="text-sky-400 font-bold underline underline-offset-2">${disruption}</span> with <span class="text-emerald-400 font-bold underline underline-offset-2">${response}</span>.`; }
        function p4b_populate(data) { upgradePhase4BView(); upgradePhase2FieldCards(document.getElementById('view-phase4b')); if(!data) return; phase2SetValue('p4b_sanctuary_desc', data.sanctuary_desc || ''); phase2SetValue('p4b_tool_name', data.tool_name || ''); phase2SetValue('p4b_tool_manipulation', data.tool_manipulation || ''); phase2SetValue('p4b_script_va', data.script_va || ''); phase2SetValue('p4b_script_k', data.script_k || ''); phase2SetValue('p4b_script_e', data.script_e || ''); phase2SetValue('p4b_ft_crisis', data.ft_crisis || ''); phase2SetValue('p4b_ft_reset', data.ft_reset || ''); phase2SetValue('p4b_master_script', data.master_script || ''); phase2SetValue('p4b_narrative', data.narrative || ''); const incomingP4BScores = data.scores || {}; p4b_scores = { script: normalizePhase4BRubricScore(incomingP4BScores.script), depth: normalizePhase4BRubricScore(incomingP4BScores.depth), reset: normalizePhase4BRubricScore(incomingP4BScores.reset), un: normalizePhase4BRubricScore(incomingP4BScores.un), audit: normalizePhase4BRubricScore(incomingP4BScores.audit) }; Object.keys(p4b_scores).forEach(c => { if (p4b_scores[c] > 0) p4b_setScore(c, p4b_scores[c]); }); p4b_saveData(); }
        function p4b_downloadBackup() { const data = localStorage.getItem('athlete_visualization_master_v1') || JSON.stringify(p4b_getFormData()); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "visualization-backup.json"; a.click(); }
        function p4b_loadBackup(input) { const file = input.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (e) => { try { p4b_populate(JSON.parse(e.target.result)); alert("Visualization data loaded"); } catch (err) { alert("Error loading file."); } }; reader.readAsText(file); }
        function p4b_generateFullPrint() { const data = p4b_getFormData(); const total = Object.values(p4b_scores).reduce((a, b) => a + b, 0); const scoreDetails = p4b_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p4b_scores[c.id] || 0}/3</span></div>`).join(''); const html = `<!DOCTYPE html><html><head><title>Visualization Master Blueprint</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.35; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 13px; font-weight: 700; line-height: 1.45; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; padding-bottom: 6px; } .narr-val { font-size: 11px; line-height: 1.5; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 820px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Visualization Master Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 Visualization System</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/${phase4BMaxScore}</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Mental Sanctuary</h2><div class="label">Describe your sanctuary</div><div class="val">${phase2ReportMultiline(data.sanctuary_desc)}</div><div class="label">Anchor object</div><div class="val">${phase2ReportText(data.tool_name)}</div><div class="label">Object manipulation details</div><div class="val">${phase2ReportMultiline(data.tool_manipulation)}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">Performance Script</h2><div class="label">Visual and auditory details</div><div class="val">${phase2ReportMultiline(data.script_va)}</div><div class="label">Kinesthetic details</div><div class="val">${phase2ReportMultiline(data.script_k)}</div><div class="label">Emotional state</div><div class="val">${phase2ReportMultiline(data.script_e)}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Reset Drill</h2><div class="label">The failure or glitch</div><div class="val">${phase2ReportMultiline(data.ft_crisis)}</div><div class="label">The dominant reset</div><div class="val">${phase2ReportMultiline(data.ft_reset)}</div></div><div class="section" style="border-left-color:#8b5cf6;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#8b5cf6;">Full Visualization Script</h2><div class="narr-val">${phase2ReportMultiline(data.master_script, 'No full script provided.')}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Understanding Narrative</h2><div class="narr-val">${phase2ReportMultiline(data.narrative, 'No narrative provided.')}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div><div style="margin-top:30px; text-align:center; font-size:9px; font-weight:bold; color:#aaa; text-transform:uppercase; letter-spacing:2px;">"Rehearse the full film, including the moment it goes wrong and the way you come back."</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; const win = window.open('', '_blank'); if (win) { win.document.write(html); win.document.close(); } }

        // --- INIT ---
        function initP1Dom() {
            const sc = document.getElementById('sc-container');
            if (!sc || sc.children.length > 0) return;
            p1_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="flex gap-1" id="group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="p1_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                sc.appendChild(d);
            });
        }

        function initValuesDom() {
            upgradePhase2Views();
            upgradePhase2FieldCards(document.getElementById('view-values'));
            const vb_sc = document.getElementById('vb-scoring-container');
            if (vb_sc && vb_sc.children.length === 0) {
                vb_cats.forEach(cat => {
                    const d = document.createElement('div');
                    d.className='phase2-score-row flex items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                    d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="phase2-score-group flex gap-1" id="vb-group-${cat.id}">${buildPhase2ScoreButtons('vb', cat.id)}</div>`;
                    vb_sc.appendChild(d);
                });
            }

            const sel1 = document.getElementById('vb_value1');
            const sel2 = document.getElementById('vb_value2');
            const sel3 = document.getElementById('vb_value3');
            const listContainer = document.getElementById('values-list');
            if (!sel1 || !sel2 || !sel3 || !listContainer || listContainer.children.length > 0) return;

            allValues.forEach(v => {
                const opt1 = document.createElement('option'); opt1.value = opt1.innerText = v; sel1.appendChild(opt1);
                const opt2 = document.createElement('option'); opt2.value = opt2.innerText = v; sel2.appendChild(opt2);
                const opt3 = document.createElement('option'); opt3.value = opt3.innerText = v; sel3.appendChild(opt3);
                const p = document.createElement('p'); p.className = 'hover:text-white cursor-pointer transition-colors'; p.innerText = v;
                p.onclick = () => { if (!sel1.value) sel1.value = v; else if (!sel2.value) sel2.value = v; else if (!sel3.value) sel3.value = v; vb_saveData(); };
                listContainer.appendChild(p);
            });
            updateVBDefinitionDisplays();
            vb_syncStepMenu();
        }

        function initMasterDom() {
            upgradePhase2Views();
            upgradePhase2FieldCards(document.getElementById('view-master'));
            const mb_sc = document.getElementById('mb-scoring-container');
            if (!mb_sc || mb_sc.children.length > 0) return;
            mb_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='phase2-score-row flex items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="phase2-score-group flex gap-1" id="mb-group-${cat.id}">${buildPhase2ScoreButtons('mb', cat.id)}</div>`;
                mb_sc.appendChild(d);
            });
            mb_syncStepMenu();
        }

        function initP3Dom() {
            upgradePhase3View();
            upgradePhase2FieldCards(document.getElementById('view-phase3'));
            const p3_sc = document.getElementById('p3-scoring-container');
            if (!p3_sc || p3_sc.children.length > 0) {
                p3_syncStepMenu();
                return;
            }
            p3_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='phase2-score-row flex items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="phase2-score-group flex gap-1" id="p3-group-${cat.id}">${buildPhase3ScoreButtons(cat.id)}</div>`;
                p3_sc.appendChild(d);
            });
            p3_syncStepMenu();
        }

        function initP4ADom() {
            upgradePhase4AView();
            const p4a_sc = document.getElementById('p4a-scoring-container');
            if (!p4a_sc || p4a_sc.children.length > 0) {
                p4a_syncStepMenu();
                return;
            }
            p4a_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='phase2-score-row flex items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="phase2-score-group flex gap-1" id="p4a-group-${cat.id}">${buildPhase4AScoreButtons(cat.id)}</div>`;
                p4a_sc.appendChild(d);
            });
            p4a_syncStepMenu();
        }

        function initP4BDom() {
            upgradePhase4BView();
            const p4b_sc = document.getElementById('p4b-scoring-container');
            if (!p4b_sc || p4b_sc.children.length > 0) {
                p4b_syncStepMenu();
                return;
            }
            p4b_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='phase2-score-row flex items-center justify-between gap-3 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="phase2-score-group flex gap-1" id="p4b-group-${cat.id}">${buildPhase4BScoreButtons(cat.id)}</div>`;
                p4b_sc.appendChild(d);
            });
            p4b_syncStepMenu();
        }

        function mountAssignmentView(view) {
            normalizeAssignmentNavBars();

            if (view === 'intro') {
                initDiagDom();
                diag_populate(parseStoredJson('diag_data') || {});
            } else if (view === 'phase1') {
                p1_init();
                p1_showStep(0);
            } else if (view === 'values') {
                initValuesDom();
                vb_populate(parseStoredJson('vb_data') || {});
                vb_showStep(0);
            } else if (view === 'master') {
                initMasterDom();
                mb_populate(parseStoredJson('mb_data') || {});
                mb_showStep(0);
            } else if (view === 'phase3') {
                initP3Dom();
                p3_populate(parseStoredJson('p3_data') || {});
                p3_showStep(0);
            } else if (view === 'phase4a') {
                initP4ADom();
                p4a_populate(parseStoredJson('p4a_data') || {});
                p4a_showStep(0);
            } else if (view === 'phase4b') {
                initP4BDom();
                p4b_populate(parseStoredJson('athlete_visualization_master_v1') || {});
                p4b_showStep(0);
            }

            refreshProgressUI();
        }

        let runtimeResizeBound = false;
        function bindStandaloneResizeHandler() {
            if (runtimeResizeBound) return;
            runtimeResizeBound = true;
            window.addEventListener('resize', () => {
                if (window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT}px)`).matches) {
                    applySidebarCollapse(true);
                    return;
                }
                const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
                if (stored === '0' || stored === '1') {
                    applySidebarCollapse(stored === '1');
                    return;
                }
                applySidebarCollapse(false);
            });
        }

        function bootStandaloneRuntime() {
            initDiagDom();
            initP1Dom();
            initValuesDom();
            initMasterDom();
            initP3Dom();
            initP4ADom();
            initP4BDom();
            normalizeAssignmentNavBars();

            if (document.getElementById('library-phases')) {
                setLibraryView('phases', true);
            }

            if (document.getElementById('app-sidebar')) {
                const savedSidebarState = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
                const isMobile = window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT}px)`).matches;
                const defaultCollapsed = isMobile ? true : savedSidebarState === '1';
                applySidebarCollapse(defaultCollapsed);
                bindStandaloneResizeHandler();
            }

            if (document.getElementById('view-intro')) diag_populate(parseStoredJson('diag_data') || {});
            if (document.getElementById('view-phase1')) p1_populate(p1_readStoredData() || {});
            if (document.getElementById('view-values')) vb_populate(parseStoredJson('vb_data') || {});
            if (document.getElementById('view-master')) mb_populate(parseStoredJson('mb_data') || {});
            if (document.getElementById('view-phase3')) p3_populate(parseStoredJson('p3_data') || {});
            if (document.getElementById('view-phase4a')) p4a_populate(parseStoredJson('p4a_data') || {});
            if (document.getElementById('view-phase4b')) p4b_populate(parseStoredJson('athlete_visualization_master_v1') || {});
            refreshProgressUI();
        }

        const runtimeGlobals = {
            diag_setScore, diag_calculateStatus, diag_downloadBackup, diag_loadBackup, diag_generatePrint,
            p1_showStep, p1_setScore, p1_saveData, p1_downloadBackup, p1_loadBackup, p1_generatePDF,
            vb_showStep, vb_toggleStepMenu, vb_setScore, vb_saveData, vb_downloadBackup, vb_loadBackup, vb_generateFullPrint,
            mb_showStep, mb_toggleStepMenu, mb_setScore, mb_saveData, mb_downloadBackup, mb_loadBackup, mb_generateFullPrint,
            p3_showStep, p3_toggleStepMenu, p3_setScore, p3_saveData, p3_downloadBackup, p3_loadBackup, p3_generateFullPrint,
            p4a_showStep, p4a_toggleStepMenu, p4a_setScore, p4a_saveData, p4a_downloadBackup, p4a_loadBackup, p4a_generatePDF,
            p4b_showStep, p4b_toggleStepMenu, p4b_setScore, p4b_saveData, p4b_downloadBackup, p4b_loadBackup, p4b_generateFullPrint
        };

        window.MentalWellnessRuntime = {
            mountAssignmentView,
            refreshProgressUI
        };
        Object.assign(window, runtimeGlobals);

        if (document.getElementById('app-sidebar')) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', bootStandaloneRuntime, { once: true });
            } else {
                bootStandaloneRuntime();
            }
        }
})();
