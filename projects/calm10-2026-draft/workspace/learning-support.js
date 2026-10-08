// Formative teaching support. Course.js owns saving, response history and completion.
(() => {
  'use strict';
  const restorers = [];
  const save = (field, value) => {
    field.value = JSON.stringify(value);
    field.dispatchEvent(new Event('input', {bubbles: true}));
  };
  const readJSON = (field, fallback) => {
    try { return field.value ? JSON.parse(field.value) : fallback; }
    catch (_) { return fallback; }
  };
  const makeOutput = () => {
    const output = document.createElement('p');
    output.className = 'field-feedback';
    output.setAttribute('role', 'status');
    return output;
  };
  const fieldLabel = field => {
    const label = field.id && document.querySelector(`label[for="${field.id}"]`) || field.closest('label');
    if (!label) return field.name || 'Response';
    const copy = label.cloneNode(true);
    copy.querySelectorAll('input,select,textarea,button,small,.field-feedback').forEach(node => node.remove());
    return copy.textContent.trim();
  };
  document.querySelectorAll('article[data-lesson-id] > template[data-learning-support]').forEach(template => {
    const root = template.parentElement;
    const config = JSON.parse(template.content.textContent);
    const first = root.querySelector('[data-support-first]');
    const firstDisplay = root.querySelector('[data-support-first-display]');
    const copyStatus = root.querySelector('[data-support-copy-status]');
    const finalFields = [...root.querySelectorAll('[data-final-field]')];
    const displayFirst = () => {
      if (!first.value) { firstDisplay.textContent = 'No first attempt kept yet.'; return; }
      const copy = readJSON(first, null);
      if (!copy || !Array.isArray(copy.entries)) {
        firstDisplay.textContent = 'Your earlier copy is retained. It could not be displayed here.';
        return;
      }
      firstDisplay.textContent = `${copy.partial ? 'Partial' : 'Complete'} first attempt — ${new Date(copy.at).toLocaleString()}\n\n` +
        copy.entries.map(entry => `${entry.label}\n${entry.display || entry.value || '[Not entered yet]'}`).join('\n\n');
    };
    const captureFirst = () => {
      if (first.value) {
        copyStatus.textContent = 'Your first attempt is already kept. Your current response can still be revised.';
        return;
      }
      if (!finalFields.some(field => field.value.trim())) {
        copyStatus.textContent = 'Begin your independent response first. An empty response is not kept as a first attempt.';
        return;
      }
      save(first, {
        at: new Date().toISOString(), partial: finalFields.some(field => !field.value.trim()),
        taskVersion: root.dataset.taskVersion || finalFields[0]?.dataset.taskVersion || '',
        entries: finalFields.map(field => ({key: field.dataset.saveKey, label: fieldLabel(field), value: field.value,
          display: field.tagName === 'SELECT' && field.value ? field.selectedOptions[0]?.textContent.trim() : field.value}))
      });
      displayFirst();
      copyStatus.textContent = 'First attempt kept for comparison. Revise your current response and use the review statements before completing the lesson.';
    };
    root.querySelector('[data-support-review]').addEventListener('click', captureFirst);
    root.querySelectorAll('[data-capture-first] > summary').forEach(summary => summary.addEventListener('click', () => {
      if (!summary.parentElement.open) captureFirst();
    }));
    displayFirst();
    restorers.push(() => { displayFirst(); copyStatus.textContent = ''; });

    config.items.forEach((item, index) => {
      const control = root.querySelector(`[data-support-item="${index}"]`);
      const attempt = [...root.querySelectorAll('[data-learning-support-fields] input')].find(field => field.dataset.saveKey === item.attempt);
      let button, output, fields;
      if (item.kind === 'choice') {
        button = control.querySelector('[data-check-choice],[data-support-check]');
        output = control.querySelector('[data-choice-result],[data-review-feedback],[data-feedback]');
        fields = [...control.querySelectorAll('input[type=radio]')];
      } else if (item.kind === 'select') {
        fields = [control];
        if (root.id === 'co1-01') {
          button = root.querySelector('#co1-01-review-check-match');
          output = root.querySelector('#co1-01-review-match-feedback');
        } else {
          button = document.createElement('button');
          button.type = 'button'; button.textContent = 'Check my choice'; button.dataset.supportCheck = '';
          output = makeOutput(); control.after(button, output);
        }
      } else {
        button = control;
        fields = (item.fields || [item.field]).map(id => root.querySelector(`[id="${id}"]`));
        output = item.output ? root.querySelector(`[id="${item.output}"]`) :
          control.nextElementSibling?.matches('[data-support-number-output]') ? control.nextElementSibling :
          control.closest('.authored-field')?.querySelector('.field-feedback') ||
          item.kind === 'flexible' && root.querySelector('[data-flexible-feedback]');
        if (!output) { output = makeOutput(); button.after(output); }
      }
      const reveal = document.createElement('button');
      reveal.type = 'button'; reveal.textContent = 'Show worked reasoning'; reveal.hidden = true;
      reveal.dataset.supportReveal = ''; output.after(reveal);
      const state = () => {
        const record = readJSON(attempt, {last: null, wrong: 0});
        return record && Number.isInteger(record.wrong) && record.wrong >= 0 ? record : {last: null, wrong: 0};
      };
      const show = (message, good = false) => {
        output.textContent = message; output.hidden = false;
        output.classList.toggle('good', good);
      };
      const read = () => {
        if (item.kind === 'choice') return control.querySelector('input:checked')?.value ?? null;
        if (item.kind === 'select') return control.value || null;
        if (fields.some(field => !field.value.trim())) return null;
        if (item.kind === 'number') return Number.isFinite(Number(fields[0].value)) ? Number(fields[0].value) : null;
        const values = fields.map((field, i) => item.kind === 'flexible' || typeof item.answers[i] === 'number' ? Number(field.value) : field.value.trim());
        return values.some(value => typeof value === 'number' && !Number.isFinite(value)) ? null : values;
      };
      const correct = value => {
        if (item.kind === 'flexible') return value[0] >= 0 && value[0] <= 70 && value[1] >= 0 && value[1] <= 35 && value[0] + value[1] <= 55;
        if (item.kind === 'bundle') return item.answers.every((answer, i) => answer === null ? Boolean(value[i]) :
          typeof answer === 'number' ? Math.abs(value[i] - answer) <= .005 : value[i] === answer);
        if (item.kind === 'number') return Math.abs(value - item.correct) <= item.tolerance;
        return String(value) === String(item.correct);
      };
      const check = () => {
        if (fields.some(field => field.hasAttribute('data-final-field'))) captureFirst();
        const value = read();
        reveal.hidden = true;
        if (value === null) {
          show(item.kind === 'choice' || item.kind === 'select' ? 'Choose an answer first.' : 'Fill the requested fields first; use zero when you mean zero.');
          return;
        }
        if (correct(value)) { show(item.worked, true); return; }
        const record = state(), serialized = JSON.stringify(value);
        if (record.last !== serialized) {
          record.last = serialized; record.wrong += 1; save(attempt, record);
        }
        const hint = item.hints[value] || item.hints[Array.isArray(value) ? value[0] : value] || item.hints.default;
        show(record.wrong < 2 ? `Hint: ${hint} Revise your answer, then check again.` :
          `Use this method: ${item.steps} Revise again, or choose “Show worked reasoning” to compare.`);
        reveal.hidden = record.wrong < 2;
      };
      button.addEventListener('click', check);
      reveal.addEventListener('click', () => { show(item.worked); reveal.hidden = true; });
      const reset = () => { output.textContent = ''; output.hidden = true; reveal.hidden = true; output.classList.remove('good'); };
      fields.forEach(field => field.addEventListener(field.type === 'radio' || field.tagName === 'SELECT' ? 'change' : 'input', reset));
      restorers.push(reset);
      reset();
    });
  });
  document.addEventListener('calm:restore', () => restorers.forEach(restore => restore()));
})();
