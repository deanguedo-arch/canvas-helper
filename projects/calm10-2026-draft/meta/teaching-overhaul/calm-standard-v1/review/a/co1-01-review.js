// Review-only behavior. Drafts and sign-off use an isolated review namespace.
// This does not write course responses, progress, or teacher assessment.
(() => {
  'use strict';
  const storageKey = 'calm10-2026-draft:career-standard-v1:a:review:co1-01:v1';
  const taskVersion = '2026-09-28.3';
  const controls = [...document.querySelectorAll('#co1-01-review input, #co1-01-review textarea, #co1-01-review select')];
  const fieldKey = control => control.type === 'radio' ? `choice:${control.name}` : control.id;
  let state = { schemaVersion: 1, taskVersion, fields: {}, completedAt: null };
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.schemaVersion === 1 && saved.taskVersion === taskVersion && saved.fields && typeof saved.fields === 'object') {
      state.fields = saved.fields;
      state.completedAt = typeof saved.completedAt === 'string' && Number.isFinite(Date.parse(saved.completedAt)) ? saved.completedAt : null;
    }
  } catch { storageAvailable = false; }
  controls.forEach(control => {
    const value = state.fields[fieldKey(control)];
    if (control.type === 'radio') control.checked = value === control.value;
    else if (control.type === 'checkbox') control.checked = value === true;
    else if (typeof value === 'string') control.value = control.maxLength > 0 ? value.slice(0, control.maxLength) : value;
  });
  const menu = document.querySelector('[data-review-menu]');
  const scrim = document.querySelector('[data-review-scrim]');
  const mobile = window.matchMedia('(max-width: 760px)');
  function syncMenu() {
    const expanded = mobile.matches
      ? document.body.classList.contains('nav-open')
      : !document.body.classList.contains('nav-collapsed');
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? 'Collapse course navigation' : 'Open course navigation');
    menu.textContent = expanded ? '←' : '☰';
    document.getElementById('course-sidebar').inert = !expanded;
  }
  menu.addEventListener('click', () => {
    document.body.classList.toggle(mobile.matches ? 'nav-open' : 'nav-collapsed');
    syncMenu();
  });
  scrim.addEventListener('click', () => { document.body.classList.remove('nav-open'); syncMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open'); syncMenu(); menu.focus();
    }
  });
  document.querySelectorAll('#course-sidebar a').forEach(link => link.addEventListener('click', () => {
    document.body.classList.remove('nav-open'); syncMenu();
  }));
  mobile.addEventListener('change', syncMenu);
  syncMenu();

  document.querySelectorAll('[data-practice-id]').forEach(item => {
    const output = item.querySelector('[data-feedback]');
    const source = item.querySelector('[data-choice-feedback]');
    if (!output || !source) return;
    const messages = JSON.parse(source.content.textContent);
    item.querySelectorAll('input[type=radio]').forEach(radio => radio.addEventListener('change', () => {
      if (!radio.checked) return;
      output.textContent = messages[Number(radio.value)];
      output.hidden = false;
      item.classList.toggle('practice-correct', Number(radio.value) === Number(item.dataset.correctIndex));
    }));
  });

  const match = document.getElementById('review-match');
  const feedback = document.getElementById('review-match-feedback');
  const messages = {
    '': 'Choose one experience, then check your match.',
    welcome: 'Explaining a sign-in order supports communication. For accurate records, look for Rowan checking information before changing a list. Try the club attendance entry.',
    attendance: 'Yes. Rowan checked names against forms and asked about missing information before changing the list. Those actions show the care needed for accurate records. Use this entry to plan your response below.',
    directions: 'Giving directions supports communication with visitors. It does not show Rowan checking a record. The club attendance entry includes a list, a check against forms and an update after the information was verified.'
  };
  document.getElementById('review-check-match').addEventListener('click', () => {
    feedback.textContent = messages[match.value];
    feedback.classList.toggle('good', match.value === 'attendance');
    feedback.hidden = false;
  });
  match.addEventListener('change', () => { feedback.hidden = true; });
  const sentence = document.getElementById('review-sentence');
  const mirror = document.getElementById('review-your-response');
  function updateMirror() {
    mirror.textContent = sentence.value.trim() || 'Your writing will appear here when you enter it above.';
  }
  sentence.addEventListener('input', updateMirror);
  document.getElementById('review-model').addEventListener('toggle', updateMirror);
  updateMirror();
  document.querySelectorAll('[data-practice-id] input[type=radio]:checked').forEach(radio => radio.dispatchEvent(new Event('change')));

  const duty = document.getElementById('review-duty');
  const response = document.getElementById('review-final');
  const checks = [...document.querySelectorAll('[data-review-signoff]')];
  const completeButton = document.getElementById('review-complete');
  const reopenButton = document.getElementById('review-reopen');
  const completionStatus = document.getElementById('review-completion-status');
  const saveStatus = document.getElementById('review-save-status');
  const lessonLink = document.querySelector('[data-review-completion-link]');
  const lessonName = lessonLink.lastElementChild.textContent.trim();
  const ready = () => Boolean(duty.value && response.value.trim() && checks.every(check => check.checked));
  if (!ready()) state.completedAt = null;

  function persist() {
    const fields = { ...state.fields };
    controls.filter(control => control.type === 'radio').forEach(control => { fields[fieldKey(control)] = ''; });
    controls.forEach(control => {
      if (control.type === 'radio') {
        if (control.checked) fields[fieldKey(control)] = control.value;
      } else fields[fieldKey(control)] = control.type === 'checkbox' ? control.checked : control.value;
    });
    state.fields = fields;
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      storageAvailable = true;
    } catch { storageAvailable = false; }
  }

  function renderCompletion(message) {
    const completed = Boolean(state.completedAt);
    lessonLink.classList.toggle('review-is-complete', completed);
    lessonLink.querySelector('.review-complete-mark').hidden = !completed;
    lessonLink.setAttribute('aria-label', `${lessonName}${completed ? ' — complete' : ''}`);
    completeButton.disabled = completed;
    completeButton.textContent = completed ? '✓ Lesson complete' : 'Complete lesson';
    reopenButton.hidden = !completed;
    completionStatus.dataset.complete = String(completed);
    completionStatus.textContent = completed
      ? (storageAvailable ? 'Lesson complete. Your response and sign-off are saved in this browser.' : 'Lesson complete for this visit. Your browser could not save it for next time.')
      : (message || 'Choose a duty, write your response and check all four statements. Then mark this lesson complete.');
    saveStatus.textContent = storageAvailable
      ? 'Your review work saves automatically in this browser, separately from course work.'
      : 'This browser could not save your review work. Keep this page open and copy your response before leaving.';
  }

  controls.forEach(control => control.addEventListener(control.tagName === 'TEXTAREA' ? 'input' : 'change', () => {
    let message;
    if ((control === duty || control === response) && state.fields[fieldKey(control)] !== control.value) {
      const signed = Boolean(state.completedAt) || checks.some(check => check.checked);
      state.completedAt = null;
      checks.forEach(check => { check.checked = false; });
      if (signed) message = 'Your response changed. Review the four statements again, then complete the lesson.';
    } else if (checks.includes(control) && !control.checked && state.completedAt) {
      state.completedAt = null;
      message = 'This lesson is back in progress. Review your sign-off, then complete it again.';
    }
    persist();
    renderCompletion(message);
  }));

  completeButton.addEventListener('click', () => {
    const missing = !duty.value ? duty : !response.value.trim() ? response : checks.find(check => !check.checked);
    if (missing) {
      const message = missing === duty ? 'Choose the festival duty your response supports.'
        : missing === response ? 'Write your application response before completing the lesson.'
        : 'Review your response and check all four sign-off statements before completing the lesson.';
      renderCompletion(message);
      missing.focus();
      return;
    }
    state.completedAt = new Date().toISOString();
    persist();
    renderCompletion();
  });
  reopenButton.addEventListener('click', () => {
    state.completedAt = null;
    checks.forEach(check => { check.checked = false; });
    persist();
    renderCompletion('Lesson reopened. You can revise your response, then review the four statements and complete it again.');
    completeButton.focus();
  });
  renderCompletion();
})();
