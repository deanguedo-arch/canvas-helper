const SAVE_KEY = 'hss1010_full_data';
const VIEW_STUDY = 'view-study';
const VIEW_ASSESS = 'view-assess';
let assessmentModel = null;

function switchMainView(viewId) {
  document.querySelectorAll('.main-view').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(viewId);
  if (target) target.classList.add('active');
  const btnStudy = document.getElementById('btn-view-study');
  const btnAssess = document.getElementById('btn-view-assess');
  if (viewId === VIEW_STUDY) {
    btnStudy?.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
    btnStudy?.classList.remove('text-slate-400');
    btnAssess?.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
    btnAssess?.classList.add('text-slate-400');
  } else {
    btnAssess?.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
    btnAssess?.classList.remove('text-slate-400');
    btnStudy?.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
    btnStudy?.classList.add('text-slate-400');
  }
}

function switchContentTab(tabId) {
  document.querySelectorAll('#view-study .section-content').forEach((el) => el.classList.remove('active'));
  const target = document.getElementById(tabId);
  if (target) target.classList.add('active');
  document.querySelectorAll('#view-study .nav-btn').forEach((btn) => {
    btn.classList.remove('bg-slate-800', 'border-slate-700', 'text-blue-400', 'shadow-sm');
    btn.classList.add('text-slate-400');
  });
  const active = document.getElementById(`btn-study-${tabId}`);
  if (active) {
    active.classList.remove('text-slate-400');
    active.classList.add('bg-slate-800', 'border-slate-700', 'text-blue-400', 'shadow-sm');
  }
  window.scrollTo(0, 0);
}

function switchAssessTab(tabId) {
  document.querySelectorAll('.assess-tab').forEach((el) => {
    el.classList.add('hidden');
    el.classList.remove('active');
  });
  const target = document.getElementById(tabId);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }
  document.querySelectorAll('#view-assess .nav-btn').forEach((btn) => {
    btn.classList.remove('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');
    btn.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-700');
  });
  const active = document.getElementById(`btn-${tabId}`);
  if (active) {
    active.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-700');
    active.classList.add('active', 'bg-slate-800', 'text-blue-400', 'border-blue-500');
  }
  window.scrollTo(0, 0);
}

function getStudyFieldState() {
  const studyFields = {};
  document.querySelectorAll('[data-persist-key]').forEach((el) => {
    const key = el.getAttribute('data-persist-key');
    if (!key) return;
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') {
        studyFields[key] = el.checked;
        return;
      }
      if (el.type === 'radio') {
        if (el.checked) studyFields[key] = el.value;
        return;
      }
      studyFields[key] = el.value;
      return;
    }
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      studyFields[key] = el.value;
    }
  });
  return studyFields;
}

function getFormData() {
  const name = document.getElementById('student-name')?.value ?? '';
  const inputs = [];
  document.querySelectorAll('.auto-grade, .cb-grade').forEach((el, idx) => {
    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      inputs.push({ type: 'checkbox', idx, val: el.checked });
      return;
    }
    if (el instanceof HTMLSelectElement) {
      inputs.push({ type: 'select', idx, val: el.value });
    }
  });
  return { name, inputs, studyFields: getStudyFieldState() };
}

function saveLocal() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(getFormData()));
  const status = document.getElementById('save-status');
  if (!status) return;
  status.style.opacity = '1';
  setTimeout(() => { status.style.opacity = '0'; }, 800);
}

function downloadBackup() {
  const data = JSON.stringify(getFormData());
  const href = `data:text/json;charset=utf-8,${encodeURIComponent(data)}`;
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = 'HSS1010_Backup.json';
  anchor.click();
}

function loadBackupFromFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const payload = JSON.parse(String(event.target?.result ?? '{}'));
      hydrateFormData(payload);
      saveLocal();
      alert('File Loaded Successfully!');
    } catch (error) {
      alert('Backup file is invalid.');
    }
  };
  reader.readAsText(file);
}

function hydrateStudyFields(studyFields) {
  document.querySelectorAll('[data-persist-key]').forEach((el) => {
    const key = el.getAttribute('data-persist-key');
    if (!key || !(key in (studyFields ?? {}))) return;
    const value = studyFields[key];
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') {
        el.checked = Boolean(value);
        return;
      }
      if (el.type === 'radio') {
        el.checked = String(value ?? '') === el.value;
        return;
      }
      el.value = String(value ?? '');
      return;
    }
    if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      el.value = String(value ?? '');
    }
  });
}

function hydrateFormData(data) {
  if (data?.name) {
    const studentInput = document.getElementById('student-name');
    if (studentInput instanceof HTMLInputElement) {
      studentInput.value = data.name;
    }
  }
  const elements = document.querySelectorAll('.auto-grade, .cb-grade');
  for (const item of data?.inputs ?? []) {
    const el = elements[item.idx];
    if (!el) continue;
    if (item.type === 'checkbox' && el instanceof HTMLInputElement) {
      el.checked = Boolean(item.val);
    }
    if (item.type === 'select' && el instanceof HTMLSelectElement) {
      el.value = String(item.val ?? '');
    }
  }
  hydrateStudyFields(data?.studyFields ?? data?.studyInputs ?? {});
}

function calculateScores() {
  const sectionTotals = {};
  document.querySelectorAll('.assess-tab[id]').forEach((tab) => {
    sectionTotals[tab.id] = 0;
  });
  document.querySelectorAll('.auto-grade').forEach((el) => {
    if (!(el instanceof HTMLSelectElement)) return;
    el.classList.remove('correct', 'incorrect');
    const sectionId = el.closest('.assess-tab')?.id;
    if (!sectionId) return;
    const expected = el.dataset.correct ?? '';
    const isCorrect = expected === 'any' ? el.value.length > 0 : el.value === expected;
    if (isCorrect) {
      sectionTotals[sectionId] = (sectionTotals[sectionId] ?? 0) + 1;
      el.classList.add('correct');
    } else if (el.value) {
      el.classList.add('incorrect');
    }
  });
  document.querySelectorAll('.cb-grade').forEach((el) => {
    if (!(el instanceof HTMLInputElement) || el.type !== 'checkbox') return;
    const sectionId = el.closest('.assess-tab')?.id;
    if (!sectionId) return;
    const label = el.parentElement;
    if (label) label.style.color = '';
    if (el.checked && el.value === 'yes') {
      sectionTotals[sectionId] = (sectionTotals[sectionId] ?? 0) + 1;
      if (label) label.style.color = '#10b981';
    } else if (el.checked && el.value === 'no') {
      if (label) label.style.color = '#ef4444';
    }
  });
  const total = Object.values(sectionTotals).reduce((sum, value) => sum + Number(value || 0), 0);
  return { sections: sectionTotals, total };
}

function checkSectionScore(sectionId, totalMarks) {
  const scores = calculateScores();
  const score = Number(scores.sections[sectionId] ?? 0);
  const target = document.getElementById(`score-${sectionId}-display`);
  if (!target) return;
  target.textContent = `Score: ${score} / ${totalMarks}`;
  target.classList.remove('hidden');
}

function generatePrintableReport() {
  saveLocal();
  const scoreState = calculateScores();
  const name = document.getElementById('student-name')?.value || 'Student';
  const date = new Date().toLocaleDateString();
  const rows = (assessmentModel?.sections ?? []).map((section) => {
    const sectionScore = Number(scoreState.sections[section.id] ?? 0);
    const sectionTotal = Number(section.totalMarks ?? 0);
    return `<tr><td>${section.title}</td><td>${sectionScore}</td><td>${sectionTotal}</td></tr>`;
  }).join('');
  const overallTotal = (assessmentModel?.sections ?? []).reduce((sum, section) => sum + Number(section.totalMarks ?? 0), 0);
  const reportHtml = `
    <html>
      <head>
        <title>HSS1010 Report</title>
        <style>
          body { font-family: sans-serif; padding: 40px; color: #111827; }
          h1 { border-bottom: 2px solid #111827; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 12px; border-bottom: 1px solid #d1d5db; text-align: left; }
          th { background: #f3f4f6; }
          .total-row { font-weight: 700; background: #d1fae5; }
        </style>
      </head>
      <body>
        <h1>HSS 1010: Final Report Card</h1>
        <p><strong>Student Name:</strong> ${name}</p>
        <p><strong>Date:</strong> ${date}</p>
        <table>
          <thead><tr><th>Section</th><th>Marks Obtained</th><th>Total Possible</th></tr></thead>
          <tbody>
            ${rows}
            <tr class='total-row'><td>FINAL SCORE</td><td>${scoreState.total}</td><td>${overallTotal}</td></tr>
          </tbody>
        </table>
        <script>window.print();<\/script>
      </body>
    </html>
  `;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(reportHtml);
  win.document.close();
}

function toggleSourceSupport(panelId) {
  const panel = document.querySelector(`[data-source-support-panel="${panelId}"]`);
  const trigger = document.querySelector(`[data-source-support-toggle="${panelId}"]`);
  if (!panel || !trigger) return;
  const willOpen = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !willOpen);
  trigger.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  trigger.textContent = willOpen ? 'Hide source support' : 'Open source support';
}

function runStudyCheck(activityId) {
  const container = document.querySelector(`[data-study-activity="${activityId}"]`);
  const result = document.querySelector(`[data-study-results="${activityId}"]`);
  if (!container || !result) return;
  let total = 0;
  let correct = 0;
  let answered = 0;
  container.querySelectorAll('[data-correct-value]').forEach((el) => {
    const expected = String(el.getAttribute('data-correct-value') ?? '').trim();
    if (!expected) return;
    total += 1;
    let actual = '';
    if (el instanceof HTMLInputElement) {
      if (el.type === 'checkbox') {
        actual = el.checked ? 'true' : 'false';
      } else if (el.type === 'radio') {
        if (!el.checked) return;
        actual = el.value;
      } else {
        actual = el.value;
      }
    } else if (el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      actual = el.value;
    }
    if (String(actual).trim().length > 0) answered += 1;
    if (String(actual).trim() === expected) correct += 1;
  });
  result.classList.remove('hidden');
  if (total === 0) {
    result.innerHTML = '<strong>No answer key was defined for this activity yet.</strong>';
    return;
  }
  if (answered === 0) {
    result.innerHTML = '<strong>Nothing checked yet.</strong> Choose an answer first, then run the check again.';
    return;
  }
  const summary = `<strong>${correct} / ${total}</strong> correct.`;
  const followUp = correct === total
    ? 'You matched the lesson correctly. Move to the reflection and explain why those choices fit.'
    : 'Use the lesson cards again and look for the clue words that point to the right dimension or determinant.';
  result.innerHTML = `${summary} ${followUp}`;
}

function wireEvents() {
  document.getElementById('btn-view-study')?.addEventListener('click', () => switchMainView(VIEW_STUDY));
  document.getElementById('btn-view-assess')?.addEventListener('click', () => switchMainView(VIEW_ASSESS));
  document.querySelectorAll('[data-study-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchContentTab(btn.getAttribute('data-study-tab') || ''));
  });
  document.querySelectorAll('[data-assess-tab]').forEach((btn) => {
    btn.addEventListener('click', () => switchAssessTab(btn.getAttribute('data-assess-tab') || ''));
  });
  document.querySelectorAll('.score-section-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-score-section') || '';
      const total = Number(btn.getAttribute('data-score-total') || '0');
      checkSectionScore(sectionId, total);
    });
  });
  document.getElementById('btn-download-backup')?.addEventListener('click', downloadBackup);
  document.getElementById('btn-upload-trigger')?.addEventListener('click', () => {
    const input = document.getElementById('upload');
    if (input instanceof HTMLInputElement) input.click();
  });
  const upload = document.getElementById('upload');
  if (upload instanceof HTMLInputElement) {
    upload.addEventListener('change', () => {
      const file = upload.files?.[0];
      if (file) loadBackupFromFile(file);
      upload.value = '';
    });
  }
  document.getElementById('btn-generate-report')?.addEventListener('click', generatePrintableReport);
  document.querySelectorAll('[data-study-check]').forEach((btn) => {
    btn.addEventListener('click', () => runStudyCheck(btn.getAttribute('data-study-check') || ''));
  });
  document.querySelectorAll('[data-source-support-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => toggleSourceSupport(btn.getAttribute('data-source-support-toggle') || ''));
  });
  document.querySelectorAll('select, textarea, input[type=text], input[type=checkbox], input[type=radio]').forEach((el) => {
    el.addEventListener('change', saveLocal);
    el.addEventListener('input', saveLocal);
  });
}

async function boot() {
  try {
    const [courseResponse, assessmentResponse] = await Promise.all([
      fetch('./data/course.json'),
      fetch('./data/assessment.json')
    ]);
    if (!courseResponse.ok || !assessmentResponse.ok) throw new Error('Failed to load course data.');
    assessmentModel = await assessmentResponse.json();
  } catch (error) {
    console.error(error);
  }
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try { hydrateFormData(JSON.parse(saved)); } catch {}
  }
  wireEvents();
  switchMainView(VIEW_STUDY);
}

window.addEventListener('load', boot);

console.log('HSS1010 runtime ready for hss1010.');
