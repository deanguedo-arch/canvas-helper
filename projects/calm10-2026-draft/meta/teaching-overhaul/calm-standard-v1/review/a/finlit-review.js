// Teacher review pages. Deliberately isolated from CALM learner evidence and progress.
(() => {
  'use strict';
  const article = document.querySelector('.finlit-review');
  if (!article) return;
  const lesson = article.dataset.reviewKey;
  const storageKey = `calm10-2026-draft:career-standard-v1:a:review:finlit:${lesson}:v1`;
  const taskVersion = '2026-09-28.review.1';
  const controls = [...article.querySelectorAll('input, textarea, select')];
  const controlKey = new Map(controls.map((control, index) => [control,
    control.type === 'radio' ? `radio:${control.name}` : control.id || `control:${index}`]));
  const signoffs = [...article.querySelectorAll('[data-review-signoff]')];
  const finalControls = [...article.querySelectorAll('[data-review-final]')];
  const completeButton = article.querySelector('[data-review-complete]');
  const reopenButton = article.querySelector('[data-review-reopen]');
  const completionStatus = article.querySelector('[data-review-completion-status]');
  const saveStatus = article.querySelector('[data-review-save-status]');
  const navLink = document.querySelector('[data-review-active-link]');
  let storageAvailable = true;
  let state = { schemaVersion: 1, taskVersion, fields: {}, feedback: {}, ranModel: false, completedAt: null };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved?.schemaVersion === 1 && saved.taskVersion === taskVersion && saved.fields && typeof saved.fields === 'object') {
      state = { ...state, ...saved, fields: saved.fields,
        feedback: saved.feedback && typeof saved.feedback === 'object' ? saved.feedback : {},
        completedAt: typeof saved.completedAt === 'string' && Number.isFinite(Date.parse(saved.completedAt)) ? saved.completedAt : null };
    }
  } catch { storageAvailable = false; }

  controls.forEach(control => {
    const value = state.fields[controlKey.get(control)];
    if (control.type === 'radio') control.checked = value === control.value;
    else if (control.type === 'checkbox') control.checked = value === true;
    else if (typeof value === 'string') control.value = control.maxLength > 0 ? value.slice(0, control.maxLength) : value;
  });

  const menu = document.querySelector('[data-review-menu]');
  const scrim = document.querySelector('[data-review-scrim]');
  const mobile = window.matchMedia('(max-width: 760px)');
  function syncMenu() {
    const expanded = mobile.matches ? document.body.classList.contains('nav-open') : !document.body.classList.contains('nav-collapsed');
    menu.setAttribute('aria-expanded', String(expanded));
    menu.setAttribute('aria-label', expanded ? 'Collapse course navigation' : 'Open course navigation');
    menu.textContent = expanded ? '←' : '☰';
    document.getElementById('course-sidebar').inert = !expanded;
  }
  menu.addEventListener('click', () => { document.body.classList.toggle(mobile.matches ? 'nav-open' : 'nav-collapsed'); syncMenu(); });
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

  function persist() {
    const fields = {};
    controls.forEach(control => {
      const key = controlKey.get(control);
      if (control.type === 'radio') {
        if (control.checked) fields[key] = control.value;
      } else fields[key] = control.type === 'checkbox' ? control.checked : control.value;
    });
    state.fields = fields;
    try { localStorage.setItem(storageKey, JSON.stringify(state)); storageAvailable = true; }
    catch { storageAvailable = false; }
    saveStatus.textContent = storageAvailable
      ? 'Your review work saves automatically in this browser, separately from course work.'
      : 'This browser could not save review work. Keep this page open and copy your response before leaving.';
  }
  function showFeedback(id, message, good) {
    const output = document.getElementById(id);
    output.textContent = message;
    output.classList.toggle('good', Boolean(good));
    output.hidden = false;
    state.feedback[id] = { message, good: Boolean(good) };
    persist();
  }
  function clearFeedback(id) {
    const output = document.getElementById(id);
    output.hidden = true;
    delete state.feedback[id];
  }
  Object.entries(state.feedback).forEach(([id, item]) => {
    if (document.getElementById(id) && typeof item?.message === 'string') {
      const output = document.getElementById(id);
      output.textContent = item.message;
      output.classList.toggle('good', item.good === true);
      output.hidden = false;
    }
  });

  document.querySelectorAll('[data-review-choice]').forEach(group => {
    const output = group.querySelector('[data-review-feedback]');
    const messages = JSON.parse(group.querySelector('[data-review-messages]').content.textContent);
    const correct = Number(group.dataset.correct);
    const render = () => {
      const checked = group.querySelector('input[type="radio"]:checked');
      if (!checked) return;
      const index = Number(checked.value);
      output.textContent = messages[index];
      output.classList.toggle('good', index === correct);
      output.hidden = false;
    };
    group.querySelectorAll('input[type="radio"]').forEach(radio => radio.addEventListener('change', render));
    render();
  });

  if (lesson === 'ce1-03') {
    const travel = document.getElementById('ce-b-travel');
    const total = document.getElementById('ce-b-total');
    document.querySelector('[data-review-check="ce-cost"]').addEventListener('click', () => {
      const t = Number(travel.value), c = Number(total.value);
      if (!travel.value || !total.value) return showFeedback('ce-cost-feedback', 'Enter both the ten-month travel cost and full listed total, then check again.', false);
      if (t === 800 && c === 2650) return showFeedback('ce-cost-feedback', 'Correct. $80 × 10 = $800 travel; $1,600 + $250 + $800 = $2,650. That is $1,250 above Leah’s $1,400 limit.', true);
      if (t === 80 || c === 1930) return showFeedback('ce-cost-feedback', 'You counted only one month of travel. Route B lasts ten months: $80 × 10, then add the two one-time charges.', false);
      if (t !== 800) return showFeedback('ce-cost-feedback', 'Recheck the repeated line: $80 each month for ten months. Enter the travel subtotal first.', false);
      return showFeedback('ce-cost-feedback', 'The travel subtotal is right. Rebuild the full line: $1,600 tuition/fees + $250 supplies + $800 travel.', false);
    });
    [travel, total].forEach(control => control.addEventListener('input', () => clearFeedback('ce-cost-feedback')));
  }

  if (lesson === 'fl3-04') {
    const run = document.getElementById('fl-run-compounding');
    const results = document.getElementById('fl-compounding-results');
    results.hidden = !state.ranModel;
    run.addEventListener('click', () => { state.ranModel = true; results.hidden = false; persist(); results.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
    const extra = document.getElementById('fl-compounding-extra');
    const reason = document.getElementById('fl-compounding-reason');
    const limit = document.getElementById('fl-compounding-limit');
    document.getElementById('fl-check-compounding').addEventListener('click', () => {
      if (!state.ranModel) return showFeedback('fl-compounding-feedback', 'Run the $40 and $60 model comparisons first so you can separate deposits from modelled growth.', false);
      if (!extra.value || !reason.value || !limit.value.trim()) return showFeedback('fl-compounding-feedback', 'Enter the extra deposits, choose why the balance difference is larger, and name one reason the future balance is uncertain.', false);
      if (Number(extra.value) !== 9600) return showFeedback('fl-compounding-feedback', 'Calculate only the added deposits first: $20 more each month × 12 months × 40 years = $9,600. Then compare modelled growth.', false);
      if (reason.value !== 'interest') return showFeedback('fl-compounding-feedback', 'The extra $20 is deposited many times and can also earn modelled growth. The 5% rate is an assumption, not a guarantee.', false);
      return showFeedback('fl-compounding-feedback', 'Yes. $9,600 extra is deposited; the modelled balance difference is about $29,650.49 because the extra deposits also grow. Your final note should consider future prices, fees, taxes or uncertain returns.', true);
    });
    [extra, reason, limit].forEach(control => control.addEventListener(control.tagName === 'TEXTAREA' || control.tagName === 'INPUT' ? 'input' : 'change', () => clearFeedback('fl-compounding-feedback')));
    const fee = document.getElementById('fl-fee-difference');
    const claim = document.getElementById('fl-fee-claim');
    const explain = document.getElementById('fl-fee-explain');
    document.getElementById('fl-check-fee').addEventListener('click', () => {
      if (!fee.value || !claim.value || !explain.value.trim()) return showFeedback('fl-fee-feedback', 'Enter the displayed difference, choose a supported claim, and explain why this model is conditional.', false);
      if (Math.abs(Number(fee.value) - 1.04) > 0.005) return showFeedback('fl-fee-feedback', 'Subtract the two displayed nominal balances: $104.00 − $102.96 = $1.04. The fee is applied monthly in this model.', false);
      if (claim.value !== 'supported') return showFeedback('fl-fee-feedback', 'Only the comparison between these two otherwise identical model runs is supported. The fee is not exactly a one-time $1 charge, and the return is not guaranteed.', false);
      return showFeedback('fl-fee-feedback', 'Correct. The fee run finishes $1.04 lower in this model. Check that your explanation calls 4% a chosen assumption rather than a promise.', true);
    });
    [fee, claim, explain].forEach(control => control.addEventListener(control.tagName === 'SELECT' ? 'change' : 'input', () => clearFeedback('fl-fee-feedback')));
  }

  function finalError() {
    if (lesson === 'ce1-03') {
      const c = document.getElementById('ce-final-c'), d = document.getElementById('ce-final-d'), response = document.getElementById('ce-final-response');
      if (!c.value || !d.value || !response.value.trim()) return { control: !c.value ? c : !d.value ? d : response, message: 'Enter both totals and Owen’s primary-and-backup recommendation before completing.' };
      if (Number(c.value) !== 1410 || Number(d.value) !== 2700) return { control: Number(c.value) !== 1410 ? c : d, message: 'Recheck Owen’s listed totals: Route C has six travel months; Route D has twelve. Use the amounts in Owen’s notices.' };
      if (response.value.trim().length < 50) return { control: response, message: 'Explain your route choice, backup condition and next check in a few complete sentences.' };
    } else {
      const price = document.getElementById('fl-final-price'), gap = document.getElementById('fl-final-gap'), choice = document.getElementById('fl-final-choice'), response = document.getElementById('fl-final-response');
      if (!price.value || !gap.value || !choice.value || !response.value.trim()) return { control: !price.value ? price : !gap.value ? gap : !choice.value ? choice : response, message: 'Enter the new price, $248 gap, purchase choice and explanation before completing.' };
      if (Number(price.value) !== 252 || Number(gap.value) !== 4) return { control: Number(price.value) !== 252 ? price : gap, message: 'Recheck the confirmed quotation: 5% of $240 is $12, so the new price is $252 and the gap from $248 is $4.' };
      if (response.value.trim().length < 40) return { control: response, message: 'Explain the timing, money remaining and trade-off of your chosen option in complete sentences.' };
    }
    const unchecked = signoffs.find(check => !check.checked);
    if (unchecked) return { control: unchecked, message: 'Review the response you wrote and check all four sign-off statements before completing.' };
    return null;
  }
  function renderCompletion(message) {
    const complete = Boolean(state.completedAt);
    navLink.classList.toggle('review-is-complete', complete);
    navLink.querySelector('.review-complete-mark').hidden = !complete;
    navLink.setAttribute('aria-label', `${navLink.dataset.reviewName}${complete ? ' — complete' : ''}`);
    completeButton.disabled = complete;
    completeButton.textContent = complete ? '✓ Lesson complete' : 'Complete lesson';
    reopenButton.hidden = !complete;
    completionStatus.dataset.complete = String(complete);
    completionStatus.textContent = complete
      ? (storageAvailable ? 'Lesson complete. Your review response and sign-off are saved in this browser.' : 'Lesson complete for this visit. This browser could not save it for next time.')
      : message || 'Complete the final response and four sign-off checks, then mark this lesson complete.';
  }
  if (state.completedAt && finalError()) state.completedAt = null;
  controls.forEach(control => control.addEventListener(control.tagName === 'TEXTAREA' || (control.tagName === 'INPUT' && control.type !== 'radio' && control.type !== 'checkbox') ? 'input' : 'change', () => {
    let message;
    if (finalControls.includes(control)) {
      const signed = Boolean(state.completedAt) || signoffs.some(check => check.checked);
      state.completedAt = null;
      signoffs.forEach(check => { check.checked = false; });
      if (signed) message = 'Your final response changed. Review the four statements again before completing.';
    } else if (signoffs.includes(control) && !control.checked && state.completedAt) {
      state.completedAt = null;
      message = 'Lesson reopened. Review your sign-off and complete it again.';
    }
    persist();
    renderCompletion(message);
  }));
  completeButton.addEventListener('click', () => {
    const error = finalError();
    if (error) { renderCompletion(error.message); error.control.focus(); return; }
    state.completedAt = new Date().toISOString();
    persist();
    renderCompletion();
  });
  reopenButton.addEventListener('click', () => {
    state.completedAt = null;
    signoffs.forEach(check => { check.checked = false; });
    persist();
    renderCompletion('Lesson reopened. Revise your response, check the four statements again and complete when ready.');
    completeButton.focus();
  });
  renderCompletion();
  persist();
})();
