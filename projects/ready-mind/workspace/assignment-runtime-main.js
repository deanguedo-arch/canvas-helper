const READY_MIND_ASSIGNMENT_KEYS = {
  intro: 'readymind.baseline.v1',
  phase1: 'readymind.stress-reset-plan.v1',
  values: 'readymind.values-blueprint.v1',
  master: 'readymind.sustainable-routine.v1',
  phase3: 'readymind.focus-system.v1',
  phase4a: 'readymind.confidence-evidence.v1',
  phase4b: 'readymind.mental-rehearsal.v1'
};

function getReadyMindView(view) {
  return document.querySelector(`[data-ready-view="${view}"]`);
}

function getReadyMindStorageKey(view) {
  const panel = getReadyMindView(view);
  return panel?.dataset.readyStorageKey || READY_MIND_ASSIGNMENT_KEYS[view] || `readymind.${view}.v1`;
}

function collectReadyMindFields(view) {
  const panel = getReadyMindView(view);
  const data = {};
  panel?.querySelectorAll('[data-ready-field]').forEach((field) => {
    data[field.dataset.readyField] = field.value || '';
  });
  return data;
}

function setReadyMindStatus(view, message) {
  const panel = getReadyMindView(view);
  const status = panel?.querySelector('[data-ready-status]');
  if (status) status.textContent = message;
}

function saveReadyMindAssignment(view) {
  const data = collectReadyMindFields(view);
  localStorage.setItem(getReadyMindStorageKey(view), JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  setReadyMindStatus(view, 'Saved');
  window.setTimeout(() => setReadyMindStatus(view, 'Ready'), 900);
}

function loadReadyMindAssignment(view) {
  const panel = getReadyMindView(view);
  if (!panel) return;
  try {
    const raw = localStorage.getItem(getReadyMindStorageKey(view));
    const data = raw ? JSON.parse(raw) : {};
    panel.querySelectorAll('[data-ready-field]').forEach((field) => {
      field.value = data[field.dataset.readyField] || '';
    });
  } catch (_error) {
    setReadyMindStatus(view, 'Load error');
  }
}

function downloadReadyMindBackup(view) {
  const data = JSON.stringify(collectReadyMindFields(view), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${getReadyMindStorageKey(view)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function printReadyMindAssignment(view) {
  const panel = getReadyMindView(view);
  const title = panel?.querySelector('h2')?.textContent || 'Ready Mind Assignment';
  const data = collectReadyMindFields(view);
  const rows = Object.entries(data).map(([key, value]) => `<section><h2>${key.replace(/_/g, ' ')}</h2><p>${String(value || 'Not completed yet.').replace(/</g, '&lt;')}</p></section>`).join('');
  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;line-height:1.5;color:#111827;padding:32px;}h1{text-transform:uppercase;font-size:24px;}h2{text-transform:uppercase;font-size:12px;color:#0f766e;margin-top:20px;}p{white-space:pre-wrap;border-bottom:1px solid #e5e7eb;padding-bottom:12px;}</style></head><body><h1>${title}</h1>${rows}<script>window.onload=function(){setTimeout(function(){window.print();},300);};<\/script></body></html>`);
  win.document.close();
}

function resetReadyMindAssignment(view) {
  const panel = getReadyMindView(view);
  panel?.querySelectorAll('[data-ready-field]').forEach((field) => {
    field.value = '';
  });
  localStorage.removeItem(getReadyMindStorageKey(view));
  setReadyMindStatus(view, 'Reset');
  window.setTimeout(() => setReadyMindStatus(view, 'Ready'), 900);
}

function mountAssignmentView(view) {
  document.querySelectorAll('.ready-assignment-view').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.readyView !== view);
  });
  loadReadyMindAssignment(view);
  const panel = getReadyMindView(view);
  if (!panel) return;
  panel.querySelectorAll('[data-ready-field]').forEach((field) => {
    field.addEventListener('input', () => saveReadyMindAssignment(view));
  });
  panel.querySelector('[data-ready-action="save"]')?.addEventListener('click', () => saveReadyMindAssignment(view));
  panel.querySelector('[data-ready-action="print"]')?.addEventListener('click', () => printReadyMindAssignment(view));
  panel.querySelector('[data-ready-action="download"]')?.addEventListener('click', () => downloadReadyMindBackup(view));
  panel.querySelector('[data-ready-action="reset"]')?.addEventListener('click', () => resetReadyMindAssignment(view));
}

window.MentalWellnessRuntime = {
  mountAssignmentView,
  saveReadyMindAssignment,
  loadReadyMindAssignment,
  downloadReadyMindBackup,
  printReadyMindAssignment,
  resetReadyMindAssignment
};
