export const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const number = n => Number.isFinite(Number(n)) ? Number(n).toLocaleString('en-CA', {maximumFractionDigits: 6}) : '—';
export const asset = name => globalThis.__S24_ASSETS?.[name] || name;
export function field(name, label, value = '', unit = '', options = {}) {
  const type = options.type || 'number';
  return `<label class="field-row"><span>${escapeHTML(label)}</span><span><input class="numeric" data-field="${name}" aria-label="${escapeHTML(label)}" type="${type}" ${type === 'number' ? 'step="any"' : ''} value="${escapeHTML(value)}" ${options.readonly ? 'readonly' : ''}> ${escapeHTML(unit)}</span></label>`;
}
export function selectField(name, label, value, choices) {
  return `<label class="field-row"><span>${escapeHTML(label)}</span><select class="numeric wide" data-field="${name}" aria-label="${escapeHTML(label)}"><option value="">Choose…</option>${choices.map(([v,l]) => `<option value="${escapeHTML(v)}" ${String(value) === String(v) ? 'selected' : ''}>${escapeHTML(l)}</option>`).join('')}</select></label>`;
}
export function explanation(value, prompt) {
  return `<label><strong>${escapeHTML(prompt)}</strong><textarea class="input" data-field="explanation" aria-label="${escapeHTML(prompt)}" placeholder="Use the supplied model or evidence to support your answer.">${escapeHTML(value)}</textarea></label>`;
}
export function table(headers, rows, caption = '') {
  return `<table class="ledger">${caption ? `<caption>${escapeHTML(caption)}</caption>` : ''}<thead><tr>${headers.map(x => `<th scope="col">${escapeHTML(x)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((x,i) => `<${i ? 'td' : 'th scope="row"'}>${escapeHTML(x)}</${i ? 'td' : 'th'}>`).join('')}</tr>`).join('')}</tbody></table>`;
}
export function panel(title, index, subtitle, body) {
  return `<section class="panel"><div class="panel-header"><h2>${escapeHTML(title)}</h2><span class="index">0${index}</span></div><div class="panel-body"><p class="panel-subtitle">${escapeHTML(subtitle)}</p>${body}</div></section>`;
}
export function scene(s, description) {
  return `<img class="hero-scene" src="${asset(s.scene)}" alt="${escapeHTML(description)}"><h3>${escapeHTML(s.title)}</h3>`;
}
export function prediction(s, m) {
  return `<div class="callout info"><label><strong>Predict first:</strong> ${escapeHTML(s.predictionPrompt)}<select class="numeric wide" data-prediction aria-label="Prediction" ${m.predictionLocked ? 'disabled' : ''}><option value="">Choose…</option>${s.predictions.map(x => `<option value="${escapeHTML(x)}" ${m.prediction === x ? 'selected' : ''}>${escapeHTML(x)}</option>`).join('')}</select></label><button class="btn" data-action="lock" ${m.predictionLocked ? 'disabled' : ''}>${m.predictionLocked ? 'Prediction committed' : 'Commit prediction'}</button></div>`;
}
export function checkButtons(m, transfer = false) {
  return `<div class="btn-row"><button class="btn primary" data-action="check">${transfer ? 'Submit transfer' : 'Check model'}</button>${transfer && !m.firstTransferResponse ? '' : '<button class="btn" data-action="hint">Next hint</button>'}</div>`;
}
export function modelGate(m, html, transfer = false) {
  return m.predictionLocked || transfer ? html : '<div class="callout"><h3>Commit your prediction</h3><p>The model result stays hidden until you make a prediction. Your prediction can be wrong; it is the starting point for reasoning.</p></div>';
}
export function formGate(m, html, transfer = false) {
  return `<fieldset class="model-controls" ${!m.predictionLocked && !transfer ? 'disabled' : ''}>${html}</fieldset>`;
}
export function routeMap(routes, blocked = [], shown = false) {
  return routes.map((r,i) => `<div class="route-row" data-route="${i}">${r.map((node,j) => `${j ? `<span class="route-arrow" aria-hidden="true"></span>` : ''}<span class="route-node">${escapeHTML(node)}</span>`).join('')}</div>${shown ? `<p class="small-note">Route ${i+1}: ${blocked[i] ? 'Addressed by selected measure(s) in this model' : 'Remains open in this model'}</p>` : ''}`).join('');
}
