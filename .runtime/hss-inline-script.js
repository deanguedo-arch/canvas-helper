
        // --- VIEW SWITCHING ---
        function switchMainView(viewId) {
            document.body.classList.remove('assignment-focus');
            document.querySelectorAll('.main-view').forEach(el => el.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            
            // Toggle Button Styles
            const btnStudy = document.getElementById('btn-view-study');
            const btnAssess = document.getElementById('btn-view-assess');

            if(viewId === 'view-study') {
                btnStudy.classList.replace('text-slate-400', 'bg-blue-600');
                btnStudy.classList.add('text-white', 'shadow-lg');
                btnAssess.classList.replace('bg-blue-600', 'text-slate-400');
                btnAssess.classList.remove('text-white', 'shadow-lg');
            } else {
                btnAssess.classList.replace('text-slate-400', 'bg-blue-600');
                btnAssess.classList.add('text-white', 'shadow-lg');
                btnStudy.classList.replace('bg-blue-600', 'text-slate-400');
                btnStudy.classList.remove('text-white', 'shadow-lg');
            }
        }

        function switchContentTab(tabId) {
            document.body.classList.remove('assignment-focus');
            document.getElementById('view-assess').classList.remove('active');
            document.getElementById('view-study').classList.add('active');
            document.querySelectorAll('#view-study .section-content').forEach(el => el.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            document.querySelectorAll('#view-study .assignment-sub-link').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('#view-study .nav-btn').forEach(btn => {
                btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-blue-400', 'text-white', 'shadow-sm', 'text-emerald-500');
                btn.classList.add('text-slate-400');
            });
            const activeBtn = document.getElementById('btn-study-' + tabId);
            if(activeBtn) {
                activeBtn.classList.remove('text-slate-400');
                activeBtn.classList.add('bg-slate-800', 'border-slate-700', 'shadow-sm', 'text-blue-400');
            }
            window.scrollTo(0,0);
        }

        function openAssignmentSection(tabId) {
            document.body.classList.add('assignment-focus');
            document.getElementById('view-study').classList.remove('active');
            document.getElementById('view-assess').classList.add('active');
            document.querySelectorAll('#view-study .section-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('#view-study .nav-btn').forEach(btn => {
                btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-blue-400', 'text-white', 'shadow-sm', 'text-emerald-500');
                btn.classList.add('text-slate-400');
            });
            document.querySelectorAll('#view-study .assignment-sub-link').forEach(btn => btn.classList.remove('active'));
            const assignmentLink = document.getElementById('link-' + tabId);
            if (assignmentLink) assignmentLink.classList.add('active');
            switchAssessTab(tabId);
        }

        function switchStudyTab(tabId) { switchContentTab(tabId); } 

        function switchAssessTab(tabId) {
            // Hide all tabs
            document.querySelectorAll('.assess-tab').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.assess-tab').forEach(el => el.classList.remove('active')); // Ensure active class is removed
            
            // Show target
            document.getElementById(tabId).classList.remove('hidden');
            document.getElementById(tabId).classList.add('active');
            
            // Update buttons
            document.querySelectorAll('#view-assess .nav-btn').forEach(btn => {
                btn.classList.remove('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');
                btn.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-700');
            });
            const activeBtn = document.getElementById('btn-' + tabId);
            if(activeBtn) {
                activeBtn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-700');
                activeBtn.classList.add('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');
            }
            window.scrollTo(0,0);
        }

        // --- SAVE/LOAD ---
        const SAVE_KEY = 'hss1010_full_data';

        function getFormData() {
            const data = { name: document.getElementById('student-name').value, inputs: [] };
            document.querySelectorAll('.auto-grade, .cb-grade').forEach((el, index) => {
                if(el.type === 'checkbox') data.inputs.push({ type: 'checkbox', idx: index, val: el.checked });
                else data.inputs.push({ type: 'select', idx: index, val: el.value });
            });
            return data;
        }

        function saveLocal() {
            localStorage.setItem(SAVE_KEY, JSON.stringify(getFormData()));
            const status = document.getElementById('save-status');
            status.style.opacity = '1';
            setTimeout(() => status.style.opacity = '0', 1000);
        }

        function downloadBackup() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getFormData()));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "HSS1010_Backup.json");
            dlAnchor.click();
        }

        function loadBackup(input) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const data = JSON.parse(e.target.result);
                if(data.name) document.getElementById('student-name').value = data.name;
                const els = document.querySelectorAll('.auto-grade, .cb-grade');
                data.inputs.forEach(item => {
                    if(els[item.idx]) {
                        if(item.type === 'checkbox') els[item.idx].checked = item.val;
                        else els[item.idx].value = item.val;
                    }
                });
                saveLocal();
                alert("File Loaded Successfully!");
            };
            reader.readAsText(input.files[0]);
        }

        // --- GRADING ---
        function calculateScores() {
            let scores = { s1: 0, s2: 0, s3: 0, s4: 0, total: 0 };
            function getSection(el) { return el.closest('.assess-tab').id; }
            
            document.querySelectorAll('.auto-grade').forEach(el => {
                el.classList.remove('correct', 'incorrect');
                let pts = 0;
                if(el.value === el.dataset.correct || el.dataset.correct === "any") { pts = 1; el.classList.add('correct'); }
                else { el.classList.add('incorrect'); }
                scores[getSection(el)] += pts;
            });
            
            document.querySelectorAll('.cb-grade').forEach(el => {
                let p = el.parentElement; p.style.color = "white";
                let pts = 0;
                if(el.checked && el.value === "yes") { pts = 1; p.style.color = "#10b981"; }
                else if(el.checked && el.value === "no") { p.style.color = "#ef4444"; }
                scores[getSection(el)] += pts;
            });
            scores.total = scores.s1 + scores.s2 + scores.s3 + scores.s4;
            return scores;
        }

        function checkSectionScore(secId, total) {
            const scores = calculateScores();
            let score = (secId === 'sec1') ? scores.s1 : (secId === 'sec2') ? scores.s2 : scores.s3;
            document.getElementById('score-'+secId+'-display').innerText = `Score: ${score} / ${total}`;
            document.getElementById('score-'+secId+'-display').classList.remove('hidden');
        }

        function generatePrintableReport() {
            saveLocal();
            const scores = calculateScores();
            const name = document.getElementById('student-name').value || "Student";
            const date = new Date().toLocaleDateString();

            const reportHTML = `
                <html>
                <head>
                    <title>HSS 1010 Final Report</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
                        th { background-color: #f4f4f4; }
                        .total-row { font-weight: bold; font-size: 1.2em; background-color: #e8f5e9; }
                    </style>
                <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2family=Archivo+Narrow:wght@600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="./stitch-sports-wellness.css">
</head>
                <body>
                    <h1>HSS 1010: Final Report Card</h1>
                    <p><strong>Student Name:</strong> ${name}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <table>
                        <thead><tr><th>Section</th><th>Marks Obtained</th><th>Total Possible</th></tr></thead>
                        <tbody>
                            <tr><td>Section 1: Wellness</td><td>${scores.s1}</td><td>20</td></tr>
                            <tr><td>Section 2: Anatomy & Physiology</td><td>${scores.s2}</td><td>100</td></tr>
                            <tr><td>Section 3: Roadmap to Wellness</td><td>${scores.s3}</td><td>33</td></tr>
                            <tr><td>Section 4: Public Health</td><td>${scores.s4}</td><td>32</td></tr>
                            <tr class="total-row"><td>FINAL SCORE</td><td>${scores.total}</td><td>185</td></tr>
                        </tbody>
                    </table>
                    <script>window.print();<\/script>
                </body>
                </html>
            `;
            const win = window.open('', '_blank');
            win.document.write(reportHTML);
            win.document.close();
        }

        window.addEventListener('load', () => {
            const saved = localStorage.getItem(SAVE_KEY);
            if(saved) {
                const data = JSON.parse(saved);
                if(data.name) document.getElementById('student-name').value = data.name;
                const els = document.querySelectorAll('.auto-grade, .cb-grade');
                data.inputs.forEach(item => {
                    if(els[item.idx]) {
                        if(item.type === 'checkbox') els[item.idx].checked = item.val;
                        else els[item.idx].value = item.val;
                    }
                });
            }
            document.querySelectorAll('select, input').forEach(el => {
                el.addEventListener('change', saveLocal);
                el.addEventListener('input', saveLocal);
            });
        });
    