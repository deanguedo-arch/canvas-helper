(() => {
/* inline script 1 */
// --- NAVIGATION LOGIC ---
        const SIDEBAR_COLLAPSE_KEY = 'mentalwellness10.sidebarCollapsed';
        const SIDEBAR_MOBILE_BREAKPOINT = 860;
        const ASSIGNMENT_PROGRESS_CONFIG = [
            { storageKey: 'diag_data', metaId: 'meta-a0', barId: 'bar-a0' },
            { storageKey: 'elite_operator_v3_p1', metaId: 'meta-a1', barId: 'bar-a1' },
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
        function initDiagDom() {
            const logEntry = document.getElementById('log_entry');
            if (logEntry && !logEntry.dataset.bound) {
                logEntry.addEventListener('input', diag_saveData);
                logEntry.dataset.bound = '1';
            }
        }
        function diag_getFormData() {
            return {
                q1: diag_scores.q1 || 0,
                q2: diag_scores.q2 || 0,
                q3: diag_scores.q3 || 0,
                q4: diag_scores.q4 || 0,
                q5: diag_scores.q5 || 0,
                log: document.getElementById('log_entry')?.value || ''
            };
        }
        function diag_updateStatus() {
            const complete = !Object.values(diag_scores).includes(0);
            const status = document.getElementById('system-status');
            if (status) {
                status.innerText = complete ? 'OPERATIONAL' : 'PENDING CHECK';
                status.classList.toggle('text-rose-500', !complete);
                status.classList.toggle('text-emerald-400', complete);
            }
            const btn = document.getElementById('print-btn');
            if (btn) {
                btn.disabled = !complete;
                btn.classList.toggle('bg-slate-800', !complete);
                btn.classList.toggle('cursor-not-allowed', !complete);
                btn.classList.toggle('bg-emerald-600', complete);
            }
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
        function diag_setScore(q, val, persist = true) {
            diag_scores[q] = val;
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
            diag_updateStatus();
        }
        function diag_calculateStatus() {
            if(Object.values(diag_scores).includes(0)) { alert("Please complete all items."); return; }
            diag_updateStatus();
            diag_saveData();
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
            const log = document.getElementById('log_entry').value;
            const status = document.getElementById('system-status').innerText;
            const html = `<html><head><title>Protocol 001 Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: monospace; padding: 40px; background: white; color: black; }</style></head>
            <body><div class="border-b-4 border-black pb-4 mb-8 flex justify-between items-end"><div><h1 class="text-4xl font-black uppercase">Protocol 001</h1><p class="text-sm font-bold uppercase tracking-widest">Baseline Diagnostic Report</p></div><div class="text-right"><p class="text-xs uppercase">System Status</p><h2 class="text-2xl font-black italic">${status}</h2></div></div>
            <div class="grid grid-cols-2 gap-4 mb-8"><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 1: Engine</strong><div class="text-lg font-bold">${diag_scores.q1}/5 (Pressure)</div><div class="text-lg font-bold">${diag_scores.q2}/5 (Regulation)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 2: Drive</strong><div class="text-lg font-bold">${diag_scores.q3}/5 (Fuel Source)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 3: Focus</strong><div class="text-lg font-bold">${diag_scores.q4}/5 (Reset Speed)</div></div><div class="p-4 border border-black"><strong class="block uppercase text-xs mb-1">Phase 4: Toolkit</strong><div class="text-lg font-bold">${diag_scores.q5}/5 (Visualization)</div></div></div>
            <div class="p-6 bg-gray-100 border-l-4 border-black"><strong class="block uppercase text-xs mb-2">Operator's Log</strong><p class="italic">"${log}"</p></div><div class="mt-12 text-center text-xs uppercase font-bold tracking-widest">End of Report // Ready for Phase 1</div><script>window.onload = function() { window.print(); };<\/script></body></html>`;
            const win = window.open('','_blank'); win.document.write(html); win.document.close();
        }

        // --- PHASE 1 (THE ENGINE) LOGIC ---
        const p1_cats = [ { id: 'reset', label: 'Stress Reset' }, { id: 'tune', label: 'Arousal' }, { id: 'focus', label: 'Targeting' }, { id: 'goals', label: 'Confidence' }, { id: 'intel', label: 'Integration' } ];
        let p1_scores = { reset: 0, tune: 0, focus: 0, goals: 0, intel: 0 };
        function p1_showStep(n) {
            document.querySelectorAll('#view-phase1 .step-content').forEach(s => s.classList.remove('active'));
            document.getElementById('p1-step' + n).classList.add('active');
            document.querySelectorAll('#view-phase1 .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n));
        }
        function p1_setScore(cat, val) {
            p1_scores[cat] = val;
            const group = document.getElementById(`group-${cat}`);
            if(group) { group.querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); }
            const total = Object.values(p1_scores).reduce((a, b) => a + b, 0);
            document.getElementById('p1-total-score').innerText = total.toString().padStart(2, '0');
            p1_saveData();
        }
        function p1_getFormData() {
             return { b_scenario: document.getElementById('p1_breath_scenario').value, b_detail: document.getElementById('p1_breath_detail').value, relax: document.getElementById('p1_relax_plan').value, active: document.getElementById('p1_active_plan').value, inst: document.getElementById('p1_cue_inst').value, mot: document.getElementById('p1_cue_mot').value, jam: document.getElementById('p1_jam_scenario').value, proc: document.getElementById('p1_goal_proc').value, perf: document.getElementById('p1_goal_perf').value, out: document.getElementById('p1_goal_out').value, smart_final: document.getElementById('p1_smart_final').value, narr: document.getElementById('p1_final_narrative').value, scores: p1_scores };
        }
        function p1_saveData() { localStorage.setItem('elite_operator_v3_p1', JSON.stringify(p1_getFormData())); setTextById(['p1-save-text'], "Saved"); refreshProgressUI(); setTimeout(() => setTextById(['p1-save-text'], "System Ready"), 1000); }
        function p1_populate(data) { if(!data) return; if(data.b_scenario) document.getElementById('p1_breath_scenario').value = data.b_scenario; if(data.b_detail) document.getElementById('p1_breath_detail').value = data.b_detail; if(data.relax) document.getElementById('p1_relax_plan').value = data.relax; if(data.active) document.getElementById('p1_active_plan').value = data.active; if(data.inst) document.getElementById('p1_cue_inst').value = data.inst; if(data.mot) document.getElementById('p1_cue_mot').value = data.mot; if(data.jam) document.getElementById('p1_jam_scenario').value = data.jam; if(data.proc) document.getElementById('p1_goal_proc').value = data.proc; if(data.perf) document.getElementById('p1_goal_perf').value = data.perf; if(data.out) document.getElementById('p1_goal_out').value = data.out; if(data.smart_final) document.getElementById('p1_smart_final').value = data.smart_final; if(data.narr) document.getElementById('p1_final_narrative').value = data.narr; if(data.scores) { p1_scores = data.scores; Object.keys(p1_scores).forEach(c => { if(p1_scores[c]>0) p1_setScore(c, p1_scores[c]); }); } }
        function p1_downloadBackup() { const data = p1_getFormData(); const blob = new Blob([JSON.stringify(data)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "phase1-backup.json"; a.click(); }
        function p1_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p1_populate(JSON.parse(e.target.result)); alert("Phase 1 Data Loaded"); }; reader.readAsText(file); }
        function p1_generatePDF() { 
            const data = p1_getFormData(); 
            const total = Object.values(p1_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p1_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p1_scores[c.id] || 0}/5</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Elite Operator Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body{font-family:sans-serif;padding:40px;color:black;background:white;line-height:1.3}.header{border-bottom:5px solid black;padding-bottom:10px;margin-bottom:25px}.section{margin-bottom:20px;border-left:4px solid black;padding-left:15px}.label{font-size:8px;font-weight:bold;text-transform:uppercase;color:#888}.val{font-size:13px;font-weight:900;font-style:italic;border-bottom:1px solid #ddd;margin-bottom:8px;min-height:18px;color:#111}.narr-val{font-size:11px;line-height:1.4;padding:12px;background:#f9f9f9;border-radius:8px;border:1px solid #eee;margin-top:5px}</style></head><body><div style="max-width:800px;margin:auto"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Operator Report</h1><p style="font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:bold">Regulation Engine Tactical Assessment</p></div><div style="text-align:right"><p style="font-size:10px;text-transform:uppercase;font-weight:bold">Mental Fitness Score</p><p style="font-size:40px;font-weight:900;font-style:italic;line-height:1">${total}/25</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section" style="border-left-color:#f43f5e"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#f43f5e">01 Stress Loop Reset</h2><div class="label">Deployment Scenario</div><div class="val">${data.b_scenario||'...'}</div><div class="label">Centering Action</div><div class="val">${data.b_detail||'...'}</div></div><div class="section" style="border-left-color:#f59e0b"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#f59e0b">02 Arousal Tuning</h2><div class="label">Down-Regulation (PMR)</div><div class="val">${data.relax||'...'}</div><div class="label">Up-Regulation (Active)</div><div class="val">${data.active||'...'}</div></div></div><div class="grid grid-cols-2 gap-8"><div class="section" style="border-left-color:#10b981"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#10b981">03 Targeting (Cues)</h2><div class="label">Instructional Cue</div><div class="val">${data.inst||'...'}</div><div class="label">Motivational Cue</div><div class="val">${data.mot||'...'}</div><div class="label">Jamming Scenario</div><div class="val" style="font-size:11px">${data.jam||'...'}</div></div><div class="section" style="border-left-color:#0ea5e9"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:10px;color:#0ea5e9">04 Confidence (SMART)</h2><div class="label">Process Goal (100% Control)</div><div class="val">${data.proc||'...'}</div><div class="label">Full SMART Statement</div><div class="val" style="font-size:11px">${data.smart_final||'...'}</div></div></div><div class="section"><h2 style="font-size:12px;font-weight:900;text-transform:uppercase;margin-bottom:5px">Integration Narrative</h2><div class="narr-val">${data.narr||'---'}</div></div><div style="margin-top:20px;border-top:2px solid black;padding-top:15px"><h2 style="font-size:10px;font-weight:900;text-transform:uppercase;margin-bottom:8px">Evaluation Breakdown</h2>${scoreDetails}</div></div><script>window.onload=function(){setTimeout(function(){window.print()},500)};<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 2A (VALUES) LOGIC ---
        const vb_cats = [ { id: 'clar', label: 'Values Clarification' }, { id: 'depth', label: 'Alignment Depth' }, { id: 'sys', label: 'System Awareness' }, { id: 'supp', label: 'Support & Self-Care' }, { id: 'audit', label: 'Integrity Audit' } ];
        let vb_scores = { clar: 0, depth: 0, sys: 0, supp: 0, audit: 0 };
        const allValues = ["Accountability", "Achievement", "Activism", "Adaptability", "Adventure", "Altruism", "Ambition", "Authenticity", "Balance", "Commitment", "Community", "Compassion", "Courage", "Creativity", "Curiosity", "Efficiency", "Equality", "Excellence", "Fairness", "Faith", "Freedom", "Generosity", "Gratitude", "Growth", "Harmony", "Health", "Honesty", "Integrity", "Intuition", "Joy", "Justice", "Kindness", "Leadership", "Learning", "Love", "Loyalty", "Optimism", "Peace", "Respect", "Responsibility", "Service", "Simplicity", "Success", "Teamwork", "Trust", "Vulnerability", "Wisdom"];
        const valuesDefinitions = { "Accountability": "Taking responsibility.", "Achievement": "Reaching a goal.", "Integrity": "Honest and strong moral principles." }; 

        function vb_showStep(n) { document.querySelectorAll('#view-values .step-content').forEach(s => s.classList.remove('active')); document.getElementById('vb-step' + n).classList.add('active'); document.querySelectorAll('#view-values .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n)); }
        function vb_setScore(cat, val) { vb_scores[cat] = val; document.getElementById(`vb-group-${cat}`).querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); const total = Object.values(vb_scores).reduce((a, b) => a + b, 0); document.getElementById('vb-total-score').innerText = total.toString().padStart(2, '0'); vb_saveData(); }
        function vb_getFormData() { return { value1: document.getElementById('vb_value1').value, value2: document.getElementById('vb_value2').value, v1_align: document.getElementById('vb_v1_align').value, v1_out: document.getElementById('vb_v1_out').value, v1_example: document.getElementById('vb_v1_example').value, v2_align: document.getElementById('vb_v2_align').value, v2_out: document.getElementById('vb_v2_out').value, v2_example: document.getElementById('vb_v2_example').value, feeling: document.getElementById('vb_feeling').value, warning: document.getElementById('vb_warning').value, support_person: document.getElementById('vb_support_person').value, self_compassion: document.getElementById('vb_self_compassion').value, narrative: document.getElementById('vb_narrative').value, scores: vb_scores }; }
        function updateVBSummary(data) {
            const preview = document.getElementById('vb-summary-preview');
            if (!preview) return;
            const valueOne = data.value1 || '...';
            const valueTwo = data.value2 || '...';
            const signal = data.warning || data.feeling || 'your early warning signs';
            preview.innerHTML = `I protect <span class="text-sky-400 font-bold underline underline-offset-2">${valueOne}</span> and <span class="text-emerald-400 font-bold underline underline-offset-2">${valueTwo}</span> by noticing <span class="text-sky-400 font-bold underline underline-offset-2">${signal}</span> before I drift.`;
        }
        function vb_saveData() { const data = vb_getFormData(); localStorage.setItem('vb_data', JSON.stringify(data)); setTextById(['vb-save-text'], "Saved"); updateVBSummary(data); refreshProgressUI(); setTimeout(() => setTextById(['vb-save-text'], "System Ready"), 1000); }
        function vb_populate(data) { if(!data) return; if (data.value1) document.getElementById('vb_value1').value = data.value1; if (data.value2) document.getElementById('vb_value2').value = data.value2; if (data.v1_align) document.getElementById('vb_v1_align').value = data.v1_align; if (data.v1_out) document.getElementById('vb_v1_out').value = data.v1_out; if (data.v1_example) document.getElementById('vb_v1_example').value = data.v1_example; if (data.v2_align) document.getElementById('vb_v2_align').value = data.v2_align; if (data.v2_out) document.getElementById('vb_v2_out').value = data.v2_out; if (data.v2_example) document.getElementById('vb_v2_example').value = data.v2_example; if (data.feeling) document.getElementById('vb_feeling').value = data.feeling; if (data.warning) document.getElementById('vb_warning').value = data.warning; if (data.support_person) document.getElementById('vb_support_person').value = data.support_person; if (data.self_compassion) document.getElementById('vb_self_compassion').value = data.self_compassion; if (data.narrative) document.getElementById('vb_narrative').value = data.narrative; if (data.scores) { vb_scores = data.scores; Object.keys(vb_scores).forEach(c => { if(vb_scores[c]>0) vb_setScore(c, vb_scores[c]); }); } vb_saveData(); }
        function vb_downloadBackup() { const data = localStorage.getItem('vb_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "values-backup.json"; a.click(); }
        function vb_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { vb_populate(JSON.parse(e.target.result)); alert("Values Data Loaded"); }; reader.readAsText(file); }
        function vb_generateFullPrint() { 
            const data = vb_getFormData();
            const total = Object.values(vb_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = vb_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${vb_scores[c.id] || 0}/5</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Values Blueprint: Full System</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 15px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 800px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Values Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 Mastery Report</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/25</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#0284c7;">Value 01: ${data.value1 || '---'}</h2><div class="label">In Alignment</div><div class="val">${data.v1_align || '---'}</div><div class="label">Out of Alignment</div><div class="val">${data.v1_out || '---'}</div></div><div class="section" style="border-left-color:#059669;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#059669;">Value 02: ${data.value2 || '---'}</h2><div class="label">In Alignment</div><div class="val">${data.v2_align || '---'}</div><div class="label">Out of Alignment</div><div class="val">${data.v2_out || '---'}</div></div></div><div class="section" style="border-left-color:#0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${data.narrative || '---'}</div></div><div class="grid grid-cols-2 gap-8 mt-4"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">System Indicators</h2><div class="label">Feelings of Alignment</div><div class="val" style="font-size:12px;">${data.feeling || '---'}</div><div class="label">Warning Signs</div><div class="val" style="font-size:12px;">${data.warning || '---'}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Support</h2><div class="label">Support Person</div><div class="val" style="font-size:12px;">${data.support_person || '---'}</div><div class="label">Self-Compassion</div><div class="val" style="font-size:12px;">${data.self_compassion || '---'}</div></div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 2B (MASTER CONFIG) LOGIC ---
        const mb_cats = [ { id: 'id', label: 'Engine Identity' }, { id: 'tk', label: 'The Path (7/10)' }, { id: 'mn', label: 'Maintenance' }, { id: 'cl', label: 'System Audit' } ];
        let mb_scores = { id: 0, tk: 0, mn: 0, cl: 0 };

        function mb_showStep(n) { document.querySelectorAll('#view-master .step-content').forEach(s => s.classList.remove('active')); document.getElementById('mb-step' + n).classList.add('active'); document.querySelectorAll('#view-master .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n)); }
        function mb_setScore(cat, val) { mb_scores[cat] = val; document.getElementById(`mb-group-${cat}`).querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); const total = Object.values(mb_scores).reduce((a, b) => a + b, 0); document.getElementById('mb-total-score').innerText = total.toString().padStart(2, '0'); mb_saveData(); }
        function mb_getFormData() { return { anchor: document.getElementById('mb_anchor').value, value: document.getElementById('mb_value').value, task: document.getElementById('mb_task').value, flinch: document.getElementById('mb_flinch').value, hammer: document.getElementById('mb_hammer').value, recovery: document.getElementById('mb_recovery').value, pride: document.getElementById('mb_pride').value, narrative: document.getElementById('mb_narrative').value, scores: mb_scores }; }
        function mb_saveData() { const data = mb_getFormData(); localStorage.setItem('mb_data', JSON.stringify(data)); setTextById(['mb-save-text'], "Saved"); updateMBSummary(data); refreshProgressUI(); setTimeout(() => setTextById(['mb-save-text'], "System Ready"), 1000); }
        function updateMBSummary(data) { const preview = document.getElementById('mb-summary-preview'); if (!preview) return; preview.innerHTML = `"I am <span class="text-sky-400 font-bold underline underline-offset-2">${data.anchor || '...'}</span>. I choose <span class="text-sky-400 font-bold underline underline-offset-2">${data.value || '...'}</span>. 7/10: <span class="text-sky-400 font-bold underline underline-offset-2">${data.task || '...'}</span>."`; }
        function mb_populate(data) { if(!data) return; if(data.anchor) document.getElementById('mb_anchor').value = data.anchor; if(data.value) document.getElementById('mb_value').value = data.value; if(data.task) document.getElementById('mb_task').value = data.task; if(data.flinch) document.getElementById('mb_flinch').value = data.flinch; if(data.hammer) document.getElementById('mb_hammer').value = data.hammer; if(data.recovery) document.getElementById('mb_recovery').value = data.recovery; if(data.pride) document.getElementById('mb_pride').value = data.pride; if(data.narrative) document.getElementById('mb_narrative').value = data.narrative; if(data.scores) { mb_scores = data.scores; Object.keys(mb_scores).forEach(c => { if(mb_scores[c]>0) mb_setScore(c, mb_scores[c]); }); } mb_saveData(); }
        function mb_downloadBackup() { const data = localStorage.getItem('mb_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "master-backup.json"; a.click(); }
        function mb_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { mb_populate(JSON.parse(e.target.result)); alert("Master Data Loaded"); }; reader.readAsText(file); }
        function mb_generateFullPrint() { 
            const data = mb_getFormData();
            const total = Object.values(mb_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = mb_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:8px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${mb_scores[c.id] || 0}/5</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Athlete Blueprint: Full System</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 16px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; margin-top: 5px; border: 1px solid #eee; }</style></head><body><div style="max-width: 800px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">The User Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 System Configuration</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/20</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">01 Engine Identity</h2><div class="label">Identity Anchor</div><div class="val">${data.anchor || '---'}</div><div class="label">Compass Value</div><div class="val">${data.value || '---'}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">02 The Path</h2><div class="label">7/10 Task</div><div class="val">${data.task || '---'}</div><div class="label">Hammer Protocol</div><div class="val" style="font-size:13px; color:#0ea5e9;">${data.flinch || '...'} &rarr; ${data.hammer || '...'}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">03 System Maintenance</h2><div class="grid grid-cols-2 gap-4"><div><div class="label">Recovery Mandate</div><div class="val" style="font-size:13px;">${data.recovery || '---'}</div></div><div><div class="label">Authentic Pride</div><div class="val" style="font-size:13px;">${data.pride || '---'}</div></div></div></div><div class="section" style="border-left-color: #0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${data.narrative || 'No narrative provided.'}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Audit Results</h2>${scoreDetails}</div><div style="margin-top:30px; text-align:center; font-size:9px; font-weight:bold; color:#aaa; text-transform:uppercase; letter-spacing:2px;">"If the plan doesn't survive a bad day, it isn't a plan."</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 3 (FOCUS BLUEPRINT) LOGIC ---
        const p3_cats = [ { id: 'arena', label: 'Arena Audit' }, { id: 'anch', label: 'Anchoring' }, { id: 'fort', label: 'Fortress Prep' }, { id: 'narr', label: 'Understanding' }, { id: 'audit', label: 'Integrity Audit' } ];
        let p3_scores = { arena: 0, anch: 0, fort: 0, narr: 0, audit: 0 };
        function p3_showStep(n) { document.querySelectorAll('#view-phase3 .step-content').forEach(s => s.classList.remove('active')); document.getElementById('p3-step' + n).classList.add('active'); document.querySelectorAll('#view-phase3 .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n)); }
        function p3_setScore(cat, val) { p3_scores[cat] = val; document.getElementById(`p3-group-${cat}`).querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); const total = Object.values(p3_scores).reduce((a, b) => a + b, 0); document.getElementById('p3-total-score').innerText = total.toString().padStart(2, '0'); p3_saveData(); }
        function p3_getFormData() { return { internal_dist: document.getElementById('p3_internal_dist').value, time_trap: document.getElementById('p3_time_trap').value, external_dist: document.getElementById('p3_external_dist').value, spotlight: document.getElementById('p3_spotlight').value, instructional_cue: document.getElementById('p3_instructional_cue').value, motivational_cue: document.getElementById('p3_motivational_cue').value, anchor_type: document.getElementById('p3_anchor_type').value, anchor_usage: document.getElementById('p3_anchor_usage').value, routine_1: document.getElementById('p3_routine_1').value, routine_2: document.getElementById('p3_routine_2').value, routine_3: document.getElementById('p3_routine_3').value, what_if: document.getElementById('p3_what_if').value, response: document.getElementById('p3_response').value, narrative: document.getElementById('p3_narrative').value, scores: p3_scores }; }
        function p3_saveData() { const data = p3_getFormData(); localStorage.setItem('p3_data', JSON.stringify(data)); setTextById(['p3-save-text'], "Saved"); updateP3Summary(data); refreshProgressUI(); setTimeout(() => setTextById(['p3-save-text'], "System Ready"), 1000); }
        function updateP3Summary(data) { const preview = document.getElementById('p3-summary-preview'); if (!preview) return; const target = data.spotlight || '...'; const cues = (data.instructional_cue || '...') + ' & ' + (data.motivational_cue || '...'); preview.innerHTML = `"I focus on <span class="text-sky-400 font-bold underline underline-offset-2">${target}</span> by using <span class="text-emerald-400 font-bold underline underline-offset-2">${cues}</span>."`; }
        function p3_populate(data) { if(!data) return; if(data.internal_dist) document.getElementById('p3_internal_dist').value = data.internal_dist; if(data.time_trap) document.getElementById('p3_time_trap').value = data.time_trap; if(data.external_dist) document.getElementById('p3_external_dist').value = data.external_dist; if(data.spotlight) document.getElementById('p3_spotlight').value = data.spotlight; if(data.instructional_cue) document.getElementById('p3_instructional_cue').value = data.instructional_cue; if(data.motivational_cue) document.getElementById('p3_motivational_cue').value = data.motivational_cue; if(data.anchor_type) document.getElementById('p3_anchor_type').value = data.anchor_type; if(data.anchor_usage) document.getElementById('p3_anchor_usage').value = data.anchor_usage; if(data.routine_1) document.getElementById('p3_routine_1').value = data.routine_1; if(data.routine_2) document.getElementById('p3_routine_2').value = data.routine_2; if(data.routine_3) document.getElementById('p3_routine_3').value = data.routine_3; if(data.what_if) document.getElementById('p3_what_if').value = data.what_if; if(data.response) document.getElementById('p3_response').value = data.response; if(data.narrative) document.getElementById('p3_narrative').value = data.narrative; if(data.scores) { p3_scores = data.scores; Object.keys(p3_scores).forEach(c => { if(p3_scores[c]>0) p3_setScore(c, p3_scores[c]); }); } p3_saveData(); }
        function p3_downloadBackup() { const data = localStorage.getItem('p3_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "focus-backup.json"; a.click(); }
        function p3_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p3_populate(JSON.parse(e.target.result)); alert("Focus Data Loaded"); }; reader.readAsText(file); }
        function p3_generateFullPrint() { 
            const data = p3_getFormData();
            const total = Object.values(p3_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p3_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p3_scores[c.id] || 0}/5</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Focus Blueprint: Full System</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 1px; } .val { font-size: 15px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 800px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Focus Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 3 Mastery Report</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Concentration Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/25</p></div></div><div class="grid grid-cols-2 gap-8"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">01 The Arena Audit</h2><div class="label">Internal Distracters</div><div class="val">${data.internal_dist || '---'}</div><div class="label">Spotlight Target</div><div class="val" style="color:#0ea5e9;">${data.spotlight || '---'}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">02 Tactical Anchoring</h2><div class="label">Instructional Cue</div><div class="val">${data.instructional_cue || '---'}</div><div class="label">Physical Anchor</div><div class="val">${data.anchor_type || '---'}: ${data.anchor_usage || '---'}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">03 Fortress Routine</h2><div style="font-size:11px; font-style:italic; border-bottom:1px solid #ddd; padding-bottom:5px;">${data.routine_1 || '...'} &rarr; ${data.routine_2 || '...'} &rarr; ${data.routine_3 || '...'}</div></div><div class="section" style="border-left-color: #0ea5e9;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Understanding Narrative</h2><div class="narr-val">${data.narrative || '---'}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 4A (CONFIDENCE - NEW) LOGIC ---
        const p4a_cats = [ { id: 'bank', label: 'Bank Account' }, { id: 'dmg', label: 'Damage Control' }, { id: 'action', label: 'C-B-A Routine' }, { id: 'un', label: 'Understanding' }, { id: 'audit', label: 'Integrity' } ];
        let p4a_scores = { bank: 0, dmg: 0, action: 0, un: 0, audit: 0 };
        let p4a_saveTimeout;
        function p4a_showStep(n) { document.querySelectorAll('#view-phase4a .step-content').forEach(s => s.classList.remove('active')); document.getElementById('p4a_step' + n).classList.add('active'); document.querySelectorAll('#view-phase4a .mod-nav-btn').forEach((b, i) => b.classList.toggle('active', i === n)); }
        function p4a_setScore(cat, val) { p4a_scores[cat] = val; document.getElementById(`p4a_group-${cat}`).querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); const total = Object.values(p4a_scores).reduce((a, b) => a + b, 0); document.getElementById('p4a_total-score').innerText = total.toString().padStart(2, '0'); p4a_saveData(); }
        function p4a_getFormData() {
             const tt = []; for(let i=1; i<=10; i++) { const el = document.getElementById(`p4a_tt-${i}`); if(el) tt.push(el.value); }
             return { tt, esp1: document.getElementById('p4a_esp_effort').value, esp2: document.getElementById('p4a_esp_success').value, esp3: document.getElementById('p4a_esp_progress').value, setback: document.getElementById('p4a_setback').value, cue: document.getElementById('p4a_cue').value, attach: document.getElementById('p4a_attach').value, narr: document.getElementById('p4a_narr').value, scores: p4a_scores };
        }
        function p4a_saveData() {
            localStorage.setItem('p4a_data', JSON.stringify(p4a_getFormData()));
            refreshProgressUI();
            const indicator = getFirstById('p4a_save-indicator', 'p4a-save-indicator');
            const text = getFirstById('p4a_save-text', 'p4a-save-text');
            if (indicator) {
                indicator.classList.remove('bg-slate-600');
                indicator.classList.add('bg-emerald-500', 'status-saved');
            }
            if (text) text.innerText = "Saving...";
            clearTimeout(p4a_saveTimeout);
            p4a_saveTimeout = setTimeout(() => {
                if (indicator) indicator.classList.remove('status-saved');
                if (text && text.isConnected) text.innerText = "Saved Locally";
            }, 1000);
        }
        function p4a_populate(data) { if(!data) return; if(data.tt) data.tt.forEach((v,i) => { if(document.getElementById(`p4a_tt-${i+1}`)) document.getElementById(`p4a_tt-${i+1}`).value = v; }); if(data.esp1) document.getElementById('p4a_esp_effort').value = data.esp1; if(data.esp2) document.getElementById('p4a_esp_success').value = data.esp2; if(data.esp3) document.getElementById('p4a_esp_progress').value = data.esp3; if(data.setback) document.getElementById('p4a_setback').value = data.setback; if(data.cue) document.getElementById('p4a_cue').value = data.cue; if(data.attach) document.getElementById('p4a_attach').value = data.attach; if(data.narr) document.getElementById('p4a_narr').value = data.narr; if(data.scores) { p4a_scores = data.scores; Object.keys(p4a_scores).forEach(c => { if(p4a_scores[c]>0) p4a_setScore(c, p4a_scores[c]); }); } p4a_saveData(); }
        function p4a_downloadBackup() { const data = localStorage.getItem('p4a_data'); const blob = new Blob([data], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = "confidence-backup.json"; a.click(); }
        function p4a_loadBackup(input) { const file = input.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = (e) => { p4a_populate(JSON.parse(e.target.result)); alert("Confidence Data Loaded"); }; reader.readAsText(file); }
        function p4a_generatePDF() { 
            const data = p4a_getFormData();
            const total = Object.values(p4a_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p4a_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p4a_scores[c.id] || 0}/5</span></div>`).join('');
            let ttHTML = ''; data.tt.forEach((item, i) => { if(item) ttHTML += `<div style="font-size:11px; margin-bottom:4px;"><b>${i+1}.</b> ${item}</div>`; });
            const html = `<!DOCTYPE html><html><head><title>Confidence Mastery Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; } .val { font-size: 15px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 800px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Confidence Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 Mastery Report</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Total Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/25</p></div></div><div class="section"><h2 style="font-size:14px; font-weight:900; text-transform:uppercase; margin-bottom:10px; color:#0ea5e9;">01 The Bank Account (Top Ten)</h2><div style="column-count: 2;">${ttHTML}</div></div><div class="grid grid-cols-2 gap-8 mt-6"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Daily E-S-P</h2><div class="label">Effort</div><div class="val" style="font-size:11px;">${data.esp1 || '...'}</div><div class="label">Success</div><div class="val" style="font-size:11px;">${data.esp2 || '...'}</div></div><div class="section" style="border-left-color:#f43f5e;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">02 Damage Control</h2><div class="label">Reframe</div><div class="val" style="font-size:11px;">${data.setback || '...'}</div></div></div><div class="section" style="border-left-color:#fbbf24;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">03 Conviction (C-B-A Routine)</h2><div class="val" style="font-size:13px;"><b>Cue:</b> ${data.cue || '...'} | <b>Attach:</b> ${data.attach || '...'}</div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Understanding Narrative</h2><div class="narr-val">${data.narr || '---'}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Self-Evaluation Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`; 
            const win = window.open('','_blank'); win.document.write(html); win.document.close(); 
        }

        // --- PHASE 4B VISUALIZATION (NEW) LOGIC ---
        const p4b_cats = [ { id: 'script', label: 'Master Script', desc: 'Narrative Synthesis' }, { id: 'depth', label: 'Sensory Depth', desc: 'VR Vividness' }, { id: 'reset', label: 'Flat Tire Reset', desc: 'Controllability' }, { id: 'un', label: 'Understanding', desc: 'Concept Narrative' }, { id: 'audit', label: 'Integrity', desc: 'Audit Honesty' } ];
        let p4b_scores = { script: 0, depth: 0, reset: 0, un: 0, audit: 0 };
        let p4b_saveTimeout;

        function p4b_showStep(n) { document.querySelectorAll('#view-phase4b .step-content').forEach(s => s.classList.remove('active')); document.getElementById('p4b_step' + n).classList.add('active'); document.querySelectorAll('#view-phase4b .nav-btn').forEach((b, i) => b.classList.toggle('active', i === n)); }
        function p4b_setScore(cat, val) { p4b_scores[cat] = val; document.getElementById(`p4b_group-${cat}`).querySelectorAll('button').forEach((b, i) => b.classList.toggle('active', (i+1) === val)); const total = Object.values(p4b_scores).reduce((a, b) => a + b, 0); document.getElementById('p4b_total-score').innerText = total.toString().padStart(2, '0'); p4b_saveData(); }
        function p4b_getFormData() {
            return {
                sanctuary_desc: document.getElementById('p4b_sanctuary_desc').value,
                tool_name: document.getElementById('p4b_tool_name').value,
                tool_manipulation: document.getElementById('p4b_tool_manipulation').value,
                script_va: document.getElementById('p4b_script_va').value,
                script_k: document.getElementById('p4b_script_k').value,
                script_e: document.getElementById('p4b_script_e').value,
                ft_crisis: document.getElementById('p4b_ft_crisis').value,
                ft_reset: document.getElementById('p4b_ft_reset').value,
                master_script: document.getElementById('p4b_master_script').value,
                narrative: document.getElementById('p4b_narrative').value,
                scores: p4b_scores
            };
        }
        function p4b_saveData() {
            const data = p4b_getFormData();
            localStorage.setItem('athlete_visualization_master_v1', JSON.stringify(data));
            refreshProgressUI();
            const ind = getFirstById('p4b_save-indicator', 'p4b-save-indicator');
            const txt = getFirstById('p4b_save-text', 'p4b-save-text');
            if (ind) {
                ind.classList.remove('bg-slate-600');
                ind.classList.add('bg-emerald-500', 'status-saved');
            }
            if (txt) txt.innerText = "Saving...";
            clearTimeout(p4b_saveTimeout);
            p4b_saveTimeout = setTimeout(() => {
                if (ind) ind.classList.remove('status-saved');
                if (txt && txt.isConnected) txt.innerText = "Saved Locally";
            }, 1000);
        }
        function p4b_populate(data) {
            if(!data) return;
            if(data.sanctuary_desc) document.getElementById('p4b_sanctuary_desc').value = data.sanctuary_desc; 
            if(data.tool_name) document.getElementById('p4b_tool_name').value = data.tool_name; 
            if(data.tool_manipulation) document.getElementById('p4b_tool_manipulation').value = data.tool_manipulation; 
            if(data.script_va) document.getElementById('p4b_script_va').value = data.script_va; 
            if(data.script_k) document.getElementById('p4b_script_k').value = data.script_k; 
            if(data.script_e) document.getElementById('p4b_script_e').value = data.script_e; 
            if(data.ft_crisis) document.getElementById('p4b_ft_crisis').value = data.ft_crisis; 
            if(data.ft_reset) document.getElementById('p4b_ft_reset').value = data.ft_reset; 
            if(data.master_script) document.getElementById('p4b_master_script').value = data.master_script; 
            if(data.narrative) document.getElementById('p4b_narrative').value = data.narrative; 
            if(data.scores) { p4b_scores = data.scores; Object.keys(p4b_scores).forEach(c => { if(p4b_scores[c]>0) p4b_setScore(c, p4b_scores[c]); }); }
        }
        function p4b_downloadBackup() {
            const data = p4b_getFormData();
            const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = "visualization-backup.json"; a.click();
        }
        function p4b_loadBackup(input) {
            const file = input.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    p4b_populate(data);
                    p4b_saveData();
                    alert("Blueprint loaded successfully!");
                } catch (err) { alert("Error loading file."); }
            };
            reader.readAsText(file);
        }
        function p4b_generateFullPrint() {
            const data = p4b_getFormData();
            const total = Object.values(p4b_scores).reduce((a, b) => a + b, 0);
            const scoreDetails = p4b_cats.map(c => `<div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding:6px 0;"><span style="font-size:10px; font-weight:bold; color:#666; text-transform:uppercase;">${c.label}</span><span style="font-weight:900; font-style:italic;">${p4b_scores[c.id] || 0}/5</span></div>`).join('');
            const html = `<!DOCTYPE html><html><head><title>Visualization Mastery Report</title><link href="https://cdn.tailwindcss.com" rel="stylesheet"><style>body { font-family: sans-serif; padding: 40px; color: black; background: white; line-height: 1.3; } .header { border-bottom: 5px solid black; padding-bottom: 10px; margin-bottom: 25px; } .section { margin-bottom: 20px; border-left: 4px solid black; padding-left: 15px; } .label { font-size: 8px; font-weight: bold; text-transform: uppercase; color: #888; } .val { font-size: 15px; font-weight: 900; font-style: italic; border-bottom: 1px solid black; margin-bottom: 12px; min-height: 22px; } .narr-val { font-size: 11px; line-height: 1.4; padding: 12px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; margin-top: 5px; }</style></head><body><div style="max-width: 800px; margin: auto;"><div class="header flex justify-between items-end"><div><h1 class="text-3xl font-black italic uppercase">Visualization Blueprint</h1><p style="font-size:10px; letter-spacing:3px; text-transform:uppercase; font-weight:bold;">Phase 4 Mastery Report</p></div><div style="text-align:right;"><p style="font-size:10px; text-transform:uppercase; font-weight:bold;">Total Mastery Score</p><p style="font-size:40px; font-weight:900; font-style:italic; line-height:1;">${total}/25</p></div></div><div class="section" style="border-left-color: #0ea5e9;"><h2 style="font-size:14px; font-weight:900; text-transform:uppercase; margin-bottom:5px; color:#0ea5e9;">Master Performance Script</h2><div class="narr-val" style="font-size:12px; font-weight:bold; white-space: pre-wrap;">${data.master_script || '---'}</div></div><div class="grid grid-cols-2 gap-8 mt-6"><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">01 Foundations</h2><div class="label">Sanctuary</div><div class="val" style="font-size:11px;">${data.sanctuary_desc || '...'}</div><div class="label">Manipulation: ${data.tool_name || '...'}</div><div class="val" style="font-size:11px;">${data.tool_manipulation || '...'}</div></div><div class="section" style="border-left-color: #f43f5e;"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:10px;">02 Reset</h2><div class="label">Flat Tire Crisis</div><div class="val" style="font-size:11px;">${data.ft_crisis || '...'}</div><div class="label">Dominant Response</div><div class="val" style="font-size:11px; color:#059669;">${data.ft_reset || '...'}</div></div></div><div class="section"><h2 style="font-size:12px; font-weight:900; text-transform:uppercase; margin-bottom:5px;">Reflective Narrative</h2><div class="narr-val">${data.narrative || '---'}</div></div><div style="margin-top:20px; border-top:2px solid black; padding-top:15px;"><h2 style="font-size:10px; font-weight:900; text-transform:uppercase; margin-bottom:8px;">Audit Results</h2>${scoreDetails}</div></div><script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };<\/script></body></html>`;
            const pw = window.open('', '_blank'); if(pw) { pw.document.open(); pw.document.write(html); pw.document.close(); }
        }

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
            const vb_sc = document.getElementById('vb-scoring-container');
            if (vb_sc && vb_sc.children.length === 0) {
                vb_cats.forEach(cat => {
                    const d = document.createElement('div');
                    d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                    d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="flex gap-1" id="vb-group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="vb_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                    vb_sc.appendChild(d);
                });
            }

            const sel1 = document.getElementById('vb_value1');
            const sel2 = document.getElementById('vb_value2');
            const listContainer = document.getElementById('values-list');
            if (!sel1 || !sel2 || !listContainer || listContainer.children.length > 0) return;

            allValues.forEach(v => {
                const opt1 = document.createElement('option'); opt1.value = opt1.innerText = v; sel1.appendChild(opt1);
                const opt2 = document.createElement('option'); opt2.value = opt2.innerText = v; sel2.appendChild(opt2);
                const p = document.createElement('p'); p.className = 'hover:text-white cursor-pointer transition-colors'; p.innerText = v;
                p.onclick = () => { if (!sel1.value) sel1.value = v; else if (!sel2.value) sel2.value = v; vb_saveData(); };
                listContainer.appendChild(p);
            });
        }

        function initMasterDom() {
            const mb_sc = document.getElementById('mb-scoring-container');
            if (!mb_sc || mb_sc.children.length > 0) return;
            mb_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="flex gap-1" id="mb-group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="mb_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                mb_sc.appendChild(d);
            });
        }

        function initP3Dom() {
            const p3_sc = document.getElementById('p3-scoring-container');
            if (!p3_sc || p3_sc.children.length > 0) return;
            p3_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="flex gap-1" id="p3-group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="p3_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                p3_sc.appendChild(d);
            });
        }

        function initP4ADom() {
            const p4a_tt = document.getElementById('p4a_tt-container');
            if (p4a_tt && p4a_tt.children.length === 0) {
                for(let i=1; i<=10; i++) {
                    const d = document.createElement('div'); d.className='flex gap-2 items-center';
                    d.innerHTML=`<span class="text-[9px] font-black text-slate-600 w-4">${i}.</span><input type="text" id="p4a_tt-${i}" oninput="p4a_saveData()" placeholder="Proof of Mastery ${i}..." class="top-ten-input w-full">`;
                    p4a_tt.appendChild(d);
                }
            }

            const p4a_sc = document.getElementById('p4a_scoring-container');
            if (!p4a_sc || p4a_sc.children.length > 0) return;
            p4a_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4></div><div class="flex gap-1" id="p4a_group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="p4a_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                p4a_sc.appendChild(d);
            });
        }

        function initP4BDom() {
            const p4b_sc = document.getElementById('p4b_sc-container');
            if (!p4b_sc || p4b_sc.children.length > 0) return;
            p4b_cats.forEach(cat => {
                const d = document.createElement('div');
                d.className='flex items-center justify-between gap-2 bg-slate-900/30 p-3 rounded-xl border border-slate-800';
                d.innerHTML=`<div class="flex-1 text-left"><h4 class="text-[11px] font-bold text-white uppercase italic leading-none mb-1">${cat.label}</h4><p class="text-[8px] text-slate-500 uppercase mono leading-none">${cat.desc}</p></div><div class="flex gap-1" id="p4b_group-${cat.id}">${[1,2,3,4,5].map(v => `<button onclick="p4b_setScore('${cat.id}', ${v})" class="score-btn rounded-lg border font-mono font-bold w-8 h-8 text-[11px]">${v}</button>`).join('')}</div>`;
                p4b_sc.appendChild(d);
            });
        }

        function mountAssignmentView(view) {
            normalizeAssignmentNavBars();

            if (view === 'intro') {
                initDiagDom();
                diag_populate(parseStoredJson('diag_data') || {});
            } else if (view === 'phase1') {
                initP1Dom();
                p1_populate(parseStoredJson('elite_operator_v3_p1') || {});
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
            if (document.getElementById('view-phase1')) p1_populate(parseStoredJson('elite_operator_v3_p1') || {});
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
            vb_showStep, vb_setScore, vb_saveData, vb_downloadBackup, vb_loadBackup, vb_generateFullPrint,
            mb_showStep, mb_setScore, mb_saveData, mb_downloadBackup, mb_loadBackup, mb_generateFullPrint,
            p3_showStep, p3_setScore, p3_saveData, p3_downloadBackup, p3_loadBackup, p3_generateFullPrint,
            p4a_showStep, p4a_setScore, p4a_saveData, p4a_downloadBackup, p4a_loadBackup, p4a_generatePDF,
            p4b_showStep, p4b_setScore, p4b_saveData, p4b_downloadBackup, p4b_loadBackup, p4b_generateFullPrint
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

