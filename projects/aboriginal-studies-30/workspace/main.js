const DATA = window.ABORIGINAL_STUDIES_30_DATA || {};

const STORAGE_KEYS = {
  progress: 'aboriginal-studies-30.progress',
  ui: 'aboriginal-studies-30.ui',
  activityResponses: 'aboriginal-studies-30.activityResponses'
};

const refs = {
  appShell: document.getElementById('app-shell'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sectionTitle: document.getElementById('section-title'),
  contentBody: document.getElementById('content-body'),
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percent'),
  progressCount: document.getElementById('progress-count'),
  navHome: document.getElementById('nav-home'),
  navQuizzes: document.getElementById('nav-quizzes'),
  navAssignments: document.getElementById('nav-assignments'),
  navLibrary: document.getElementById('nav-library'),
  navFilm: document.getElementById('nav-film')
};

const units = DATA.units || [];
const libraryItems = DATA.libraryItems || [];
const assignments = DATA.assignments || [];
const quizzes = DATA.quizzes || [];
const filmRoomItems = DATA.filmRoomItems || [];
const themeActivities = DATA.themeActivities || [];
const reviewUnlockAll = true;
const routeableSections = new Set(['home', 'unit', 'quizzes', 'assignments', 'assignment', 'library', 'film']);
const sidebarForcedCollapseQuery = window.matchMedia?.('(max-width: 860px)');
const libraryPageCounts = {
  './assets/library/chapter-1.pdf': 34,
  './assets/library/chapter-2.pdf': 40,
  './assets/library/chapter-3.pdf': 32,
  './assets/library/chapter-4.pdf': 50,
  './assets/library/chapter-5.pdf': 20,
  './assets/library/chapter-6.pdf': 30,
  './assets/library/chapter-7.pdf': 28,
  './assets/library/critical-response-criteria.pdf': 2,
  './assets/library/critical-response-rubric.pdf': 2,
  './assets/library/glossary.pdf': 5,
  './assets/library/halfbreed-maria-campbell.pdf': 223,
  './assets/library/textbook.pdf': 256
};

let progress = loadJson(STORAGE_KEYS.progress, { completedUnits: [], completedAssignments: [] });
let activityResponses = loadJson(STORAGE_KEYS.activityResponses, {});
let state = loadJson(STORAGE_KEYS.ui, {
  section: 'home',
  activeUnitId: units[0]?.id || null,
  activeLibraryId: null,
  activeAssignmentId: null,
  activeFilmId: null,
  sidebarCollapsed: false,
  mobileSidebarExpanded: false,
  libraryReaderOpen: true,
  libraryReaderFullscreen: false,
  librarySearch: '',
  librarySort: 'default'
});

state.sidebarCollapsed = Boolean(state.sidebarCollapsed);
state.mobileSidebarExpanded = Boolean(state.mobileSidebarExpanded);
state.libraryReaderOpen = state.libraryReaderOpen !== false;
state.libraryReaderFullscreen = Boolean(state.libraryReaderFullscreen);
state.librarySearch = typeof state.librarySearch === 'string' ? state.librarySearch : '';
state.librarySort = state.librarySort === 'title' ? 'title' : 'default';

function isSidebarForcedCollapsed() {
  return Boolean(sidebarForcedCollapseQuery?.matches);
}

function isSidebarCollapsed() {
  if (isSidebarForcedCollapsed()) return !state.mobileSidebarExpanded;
  return state.sidebarCollapsed;
}

const routeParams = new URLSearchParams(window.location.search);
const requestedSection = routeParams.get('section');
if (routeableSections.has(requestedSection)) {
  state.section = requestedSection;
}
const requestedUnit = routeParams.get('unit');
if (requestedUnit && units.some((unit) => unit.id === requestedUnit)) {
  state.section = 'unit';
  state.activeUnitId = requestedUnit;
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback;
  } catch (_error) {
    return fallback;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function completedUnitSet() {
  return new Set(progress.completedUnits || []);
}

function completedAssignmentSet() {
  return new Set(progress.completedAssignments || []);
}

function isUnitComplete(unitId) {
  return completedUnitSet().has(unitId);
}

function getUnitIndex(unitId) {
  return units.findIndex((unit) => unit.id === unitId);
}

function isUnitUnlocked(unitId) {
  if (reviewUnlockAll) return true;
  const index = getUnitIndex(unitId);
  if (index <= 0) return true;
  return isUnitComplete(units[index - 1].id);
}

function isAssignmentUnlocked(assignment) {
  if (reviewUnlockAll) return Boolean(assignment);
  return assignment && (!assignment.unitId || isUnitComplete(assignment.unitId));
}

function setSection(section) {
  state.section = section;
  if (section !== 'library') state.libraryReaderFullscreen = false;
  saveJson(STORAGE_KEYS.ui, state);
  render();
}

function setActiveUnit(unitId) {
  state.section = 'unit';
  state.activeUnitId = unitId;
  saveJson(STORAGE_KEYS.ui, state);
  render();
}

function setActiveLibrary(itemId) {
  state.section = 'library';
  state.activeLibraryId = itemId;
  state.libraryReaderOpen = true;
  saveJson(STORAGE_KEYS.ui, state);
  render();
}

function setActiveAssignment(itemId) {
  state.section = 'assignment';
  state.activeAssignmentId = itemId;
  saveJson(STORAGE_KEYS.ui, state);
  render();
}

function setActiveFilm(itemId) {
  state.section = 'film';
  state.activeFilmId = itemId;
  saveJson(STORAGE_KEYS.ui, state);
  render();
}

function applySidebarState() {
  const collapsed = isSidebarCollapsed();
  const forcedCollapsed = isSidebarForcedCollapsed();
  refs.appShell?.classList.toggle('is-sidebar-collapsed', collapsed);
  refs.appShell?.classList.toggle('is-sidebar-forced-collapsed', forcedCollapsed);
  if (!refs.sidebarToggle) return;
  refs.sidebarToggle.setAttribute('aria-expanded', String(!collapsed));
  refs.sidebarToggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  const icon = refs.sidebarToggle.querySelector('i');
  if (icon) {
    icon.className = `fa-solid ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`;
  }
}

function toggleSidebar() {
  if (isSidebarForcedCollapsed()) {
    state.mobileSidebarExpanded = !state.mobileSidebarExpanded;
    saveJson(STORAGE_KEYS.ui, state);
    applySidebarState();
    return;
  }
  state.sidebarCollapsed = !state.sidebarCollapsed;
  saveJson(STORAGE_KEYS.ui, state);
  applySidebarState();
}

function markUnitComplete(unitId) {
  if (!progress.completedUnits.includes(unitId)) {
    progress.completedUnits.push(unitId);
  }
  saveJson(STORAGE_KEYS.progress, progress);
  render();
}

function markAssignmentComplete(assignmentId) {
  if (!progress.completedAssignments.includes(assignmentId)) {
    progress.completedAssignments.push(assignmentId);
  }
  saveJson(STORAGE_KEYS.progress, progress);
  render();
}

function getUnitActivity(unitId) {
  return themeActivities.find((activity) => activity.unitId === unitId) || null;
}

function activityResponseKey(activityId, promptId) {
  return `${activityId}::${promptId}`;
}

function saveActivityResponse(key, value) {
  activityResponses[key] = value;
  saveJson(STORAGE_KEYS.activityResponses, activityResponses);
}

function autoGrowActivityTextarea(field) {
  if (!(field instanceof HTMLTextAreaElement)) return;
  field.style.height = 'auto';
  const computed = window.getComputedStyle(field);
  const maxHeight = Number.parseFloat(computed.maxHeight);
  const hasMaxHeight = Number.isFinite(maxHeight);
  const nextHeight = hasMaxHeight ? Math.min(field.scrollHeight, maxHeight) : field.scrollHeight;
  field.style.height = `${nextHeight}px`;
  field.style.overflowY = hasMaxHeight && field.scrollHeight > maxHeight ? 'auto' : 'hidden';
}

function updateProgress() {
  const total = units.length || 1;
  const done = units.filter((unit) => isUnitComplete(unit.id)).length;
  const percent = Math.round((done / total) * 100);
  refs.progressFill.style.width = `${percent}%`;
  refs.progressPercent.innerHTML = `${percent}% <span class="progress-complete">complete</span>`;
  refs.progressCount.textContent = `${done} / ${units.length} Units`;
  document.querySelector('.progress-meta strong').textContent = `${done}/${units.length}`;
}

function setActiveNav() {
  const navMap = {
    home: refs.navHome,
    unit: refs.navHome,
    quizzes: refs.navQuizzes,
    assignments: refs.navAssignments,
    assignment: refs.navAssignments,
    library: refs.navLibrary,
    film: refs.navFilm
  };
  for (const button of [refs.navHome, refs.navQuizzes, refs.navAssignments, refs.navLibrary, refs.navFilm]) {
    button?.classList.remove('active');
  }
  navMap[state.section]?.classList.add('active');
}

function renderHome() {
  refs.sectionTitle.textContent = 'Units';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${units.map((unit) => {
        const locked = !isUnitUnlocked(unit.id);
        const complete = isUnitComplete(unit.id);
        return `
          <button type="button" class="stack-card stack-card-button unit-card${locked ? ' is-locked' : ''}${complete ? ' is-complete' : ''}" data-unit-id="${unit.id}" ${locked ? 'disabled' : ''}>
            <span class="unit-badge-shell unit-badge-shell--${escapeHtml(unit.code.toLowerCase())}" aria-hidden="true">
              <span class="unit-badge unit-badge--${escapeHtml(unit.code.toLowerCase())}"></span>
            </span>
            <span class="card-lock-content unit-card-content">
              <strong>${escapeHtml(unit.title)}</strong>
              <span>${escapeHtml(locked ? 'Complete the previous unit to unlock this one.' : unit.description)}</span>
            </span>
            <span class="unit-arrow" aria-hidden="true"><i class="fa-solid fa-chevron-right"></i></span>
          </button>
        `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-unit-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveUnit(button.dataset.unitId));
  });
}

function renderUnit() {
  const unit = units.find((item) => item.id === state.activeUnitId) || units[0];
  if (!unit) {
    renderHome();
    return;
  }
  const locked = !isUnitUnlocked(unit.id);
  const complete = isUnitComplete(unit.id);
  refs.sectionTitle.textContent = unit.title;
  refs.contentBody.innerHTML = `
    <div class="unit-view">
      <article class="detail-card">
        <div class="detail-head">
          <span class="card-code mono">${escapeHtml(unit.code)}</span>
          <h3>Resources</h3>
        </div>
        <p>${escapeHtml(locked ? 'This unit unlocks after the previous unit is marked complete.' : unit.description)}</p>
        <div class="resource-list">
          ${(unit.items || []).map((item) => renderResourceRow(item)).join('')}
        </div>
      </article>
      ${renderUnitActivity(unit, locked)}
      <div class="unit-completion-panel">
        <button type="button" id="back-to-units" class="secondary-button">Back to Units</button>
        <button type="button" id="mark-unit-complete" class="primary-button" ${locked || complete ? 'disabled' : ''}>${complete ? 'Completed' : 'Mark Complete'}</button>
      </div>
    </div>
  `;
  document.getElementById('back-to-units')?.addEventListener('click', () => setSection('home'));
  document.getElementById('mark-unit-complete')?.addEventListener('click', () => markUnitComplete(unit.id));
  bindActivityControls();
}

function renderResourceRow(item) {
  const url = item.url || '#';
  const label = item.kind === 'chapter' ? 'Open Chapter' : (item.kind === 'video' || item.kind === 'film' ? 'Watch' : 'Open');
  return `
    <div class="resource-row">
      <div>
        <span class="resource-kind mono">${escapeHtml(item.kind || 'resource')}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </div>
      <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>
    </div>
  `;
}

function renderUnitActivity(unit, locked) {
  const activity = getUnitActivity(unit.id);
  if (!activity) return '';
  if (locked) {
    return `
      <section class="activity-shell is-locked">
        <h3>${escapeHtml(activity.title)}</h3>
        <p>This online booklet unlocks with the unit.</p>
      </section>
    `;
  }
  const activityResources = Array.isArray(activity.resources) && activity.resources.length
    ? `
      <div class="activity-resources">
        ${activity.resources.map((resource) => renderActivityResource(resource)).join('')}
      </div>
    `
    : '';
  return `
    <section class="activity-shell" data-activity-id="${escapeHtml(activity.id)}">
      <div class="activity-head">
        <div>
          <span class="card-code mono">Online Work</span>
          <h3>${escapeHtml(activity.title)}</h3>
        </div>
        <span class="activity-status" data-activity-save-status>Responses save automatically.</span>
      </div>
      <p class="activity-intro">${escapeHtml(activity.intro)}</p>
      ${activityResources}
      <div class="activity-sections">
        ${(activity.sections || []).map((section, index) => renderActivitySection(activity, section, index)).join('')}
      </div>
      <div class="activity-actions">
        <button type="button" id="copy-activity-responses" class="secondary-button" data-copy-activity="${escapeHtml(activity.id)}">Copy Responses</button>
      </div>
    </section>
  `;
}

function renderActivityResource(resource) {
  const embedUrl = resource.kind === 'video' ? toEmbedUrl(resource.url) : '';
  return `
    <div class="activity-resource">
      <div class="activity-resource-text">
        <span class="resource-kind mono">${escapeHtml(resource.kind || 'resource')}</span>
        <strong>${escapeHtml(resource.title)}</strong>
      </div>
      ${embedUrl ? `
        <div class="activity-video">
          <iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(resource.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
        </div>
      ` : `
        <a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.actionLabel || 'Open')}</a>
      `}
    </div>
  `;
}

function renderActivitySection(activity, section, index) {
  const sourceRef = section.sourceRef ? `<p class="activity-source-ref">${escapeHtml(section.sourceRef)}</p>` : '';
  return `
    <section class="activity-section">
      <div class="activity-section-head">
        <span class="mono">${String(index + 1).padStart(2, '0')}</span>
        <div>
          <h4>${escapeHtml(section.title)}</h4>
          <p>${escapeHtml(section.instructions || '')}</p>
          ${sourceRef}
        </div>
      </div>
      ${renderActivitySectionImages(section.images || [])}
      <div class="activity-prompts">
        ${(section.prompts || []).map((prompt) => renderActivityPrompt(activity, prompt)).join('')}
      </div>
    </section>
  `;
}

function renderActivitySectionImages(images) {
  if (!images.length) return '';
  return `
    <div class="activity-section-images">
      ${images.map((image) => `
        <div class="activity-section-image">
          <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || 'Theme booklet image')}" loading="lazy" />
        </div>
      `).join('')}
    </div>
  `;
}

function renderActivityPromptLabel(prompt) {
  return prompt.number
    ? `<span class="activity-question-label"><span class="activity-question-number">Q${escapeHtml(prompt.number)}</span><span>${escapeHtml(prompt.label)}</span></span>`
    : `<span>${escapeHtml(prompt.label)}</span>`;
}

function renderActivityPrompt(activity, prompt) {
  const key = activityResponseKey(activity.id, prompt.id);
  const inputId = `activity-${activity.id}-${prompt.id}`;
  const promptText = renderActivityPromptLabel(prompt);
  if (prompt.kind === 'fillBlank') return renderFillBlankPrompt(activity, prompt, promptText);
  if (prompt.kind === 'multipleChoice') return renderMultipleChoicePrompt(activity, prompt, promptText);
  if (prompt.kind === 'table') return renderTablePrompt(activity, prompt, promptText);
  return `
    <label class="activity-prompt" for="${escapeHtml(inputId)}">
      ${promptText}
      ${renderActivityPromptResources(prompt.resources || [])}
      <textarea id="${escapeHtml(inputId)}" class="activity-response" rows="${Number(prompt.rows) || 5}" data-activity-response="${escapeHtml(key)}">${escapeHtml(activityResponses[key] || '')}</textarea>
    </label>
  `;
}

function renderActivityPromptResources(resources) {
  if (!Array.isArray(resources) || !resources.length) return '';
  return `
    <div class="activity-prompt-resources">
      ${resources.map((resource) => {
        const embedUrl = resource.kind === 'video' ? toEmbedUrl(resource.url) : '';
        return `
          <div class="activity-prompt-resource">
            <div>
              <span class="resource-kind mono">${escapeHtml(resource.kind || 'resource')}</span>
              <strong>${escapeHtml(resource.title)}</strong>
            </div>
            ${embedUrl ? `
              <div class="activity-prompt-resource-video">
                <iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(resource.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>
              </div>
            ` : `
              <a href="${escapeHtml(resource.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(resource.actionLabel || 'Open')}</a>
            `}
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function promptFieldKey(activity, prompt, suffix) {
  const base = activityResponseKey(activity.id, prompt.id);
  return suffix ? `${base}.${suffix}` : base;
}

function fieldToken(value) {
  return String(value || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

function renderFillBlankPrompt(activity, prompt, promptText) {
  const parts = Array.isArray(prompt.textParts) && prompt.textParts.length ? prompt.textParts : [prompt.label, ''];
  const blanks = Array.isArray(prompt.blanks) && prompt.blanks.length ? prompt.blanks : [{ id: 'blank-1', label: 'Blank' }];
  const heading = prompt.number
    ? `<span class="activity-fill-heading"><span class="activity-question-number">Q${escapeHtml(prompt.number)}</span></span>`
    : promptText;
  const line = blanks.map((blank, index) => {
    const key = promptFieldKey(activity, prompt, blank.id || `blank-${index + 1}`);
    const inputId = `activity-${activity.id}-${prompt.id}-${blank.id || index}`;
    return `
      ${escapeHtml(parts[index] || '')}
      <input id="${escapeHtml(inputId)}" type="text" class="activity-blank-input" data-activity-response="${escapeHtml(key)}" value="${escapeHtml(activityResponses[key] || '')}" aria-label="${escapeHtml(`Q${prompt.number || ''} ${blank.label || 'blank'}`)}" />
    `;
  }).join('') + escapeHtml(parts[blanks.length] || '');
  return `
    <fieldset class="activity-prompt activity-fill-blank">
      <legend>${heading}</legend>
      ${renderActivityPromptResources(prompt.resources || [])}
      <div class="activity-fill-line">${line}</div>
    </fieldset>
  `;
}

function renderMultipleChoicePrompt(activity, prompt, promptText) {
  const key = promptFieldKey(activity, prompt);
  const choices = Array.isArray(prompt.choices) ? prompt.choices : [];
  return `
    <fieldset class="activity-prompt activity-choice-prompt">
      <legend>${promptText}</legend>
      ${renderActivityPromptResources(prompt.resources || [])}
      <div class="activity-choice-list">
        ${choices.map((choice, index) => {
          const inputId = `activity-${activity.id}-${prompt.id}-choice-${index}`;
          const checked = activityResponses[key] === choice ? 'checked' : '';
          return `
            <label class="activity-choice" for="${escapeHtml(inputId)}">
              <input id="${escapeHtml(inputId)}" type="radio" name="${escapeHtml(key)}" value="${escapeHtml(choice)}" data-activity-response="${escapeHtml(key)}" ${checked} />
              <span>${escapeHtml(choice)}</span>
            </label>
          `;
        }).join('')}
      </div>
    </fieldset>
  `;
}

function renderTablePrompt(activity, prompt, promptText) {
  const rows = Array.isArray(prompt.rows) ? prompt.rows : [];
  const columns = Array.isArray(prompt.columns) ? prompt.columns : [];
  return `
    <div class="activity-prompt activity-table-prompt">
      <div>${promptText}</div>
      ${renderActivityPromptResources(prompt.resources || [])}
      <div class="activity-table-wrap">
        <table class="activity-table">
          <thead>
            <tr>
              <th scope="col">Area</th>
              ${columns.map((column) => `<th scope="col">${escapeHtml(column)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <th scope="row">${escapeHtml(row)}</th>
                ${columns.map((column) => {
                  const key = promptFieldKey(activity, prompt, `${fieldToken(row)}.${fieldToken(column)}`);
                  return `<td><textarea class="activity-table-response" rows="3" data-activity-response="${escapeHtml(key)}" aria-label="${escapeHtml(`Q${prompt.number || ''} ${row} ${column}`)}">${escapeHtml(activityResponses[key] || '')}</textarea></td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function bindActivityControls() {
  refs.contentBody.querySelectorAll('textarea[data-activity-response]').forEach((field) => {
    autoGrowActivityTextarea(field);
  });
  refs.contentBody.querySelectorAll('[data-activity-response]').forEach((field) => {
    const saveField = () => {
      autoGrowActivityTextarea(field);
      if (field.type === 'radio' && !field.checked) return;
      saveActivityResponse(field.dataset.activityResponse, field.value);
      const status = refs.contentBody.querySelector('[data-activity-save-status]');
      if (status) status.textContent = 'Saved just now.';
    };
    field.addEventListener(field.type === 'radio' ? 'change' : 'input', saveField);
  });
  refs.contentBody.querySelector('[data-copy-activity]')?.addEventListener('click', async (event) => {
    const activity = themeActivities.find((item) => item.id === event.currentTarget.dataset.copyActivity);
    if (!activity) return;
    const lines = [activity.title];
    for (const section of activity.sections || []) {
      lines.push('', section.title);
      for (const prompt of section.prompts || []) {
        lines.push(...activityPromptResponseLines(activity, prompt));
      }
    }
    const status = refs.contentBody.querySelector('[data-activity-save-status]');
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      if (status) status.textContent = 'Responses copied.';
    } catch (_error) {
      if (status) status.textContent = 'Copy unavailable. Responses are still saved here.';
    }
  });
}

function activityPromptResponseLines(activity, prompt) {
  const promptLabel = prompt.number ? `Q${prompt.number}. ${prompt.label}` : prompt.label;
  if (prompt.kind === 'fillBlank') {
    const blanks = Array.isArray(prompt.blanks) && prompt.blanks.length ? prompt.blanks : [{ id: 'blank-1', label: 'Blank' }];
    return [
      promptLabel,
      blanks.map((blank, index) => {
        const key = promptFieldKey(activity, prompt, blank.id || `blank-${index + 1}`);
        return `${blank.label || `Blank ${index + 1}`}: ${activityResponses[key] || ''}`;
      }).join('\n')
    ];
  }
  if (prompt.kind === 'multipleChoice') {
    const key = promptFieldKey(activity, prompt);
    return [promptLabel, activityResponses[key] || ''];
  }
  if (prompt.kind === 'table') {
    const rows = Array.isArray(prompt.rows) ? prompt.rows : [];
    const columns = Array.isArray(prompt.columns) ? prompt.columns : [];
    const tableLines = [promptLabel];
    for (const row of rows) {
      tableLines.push(row);
      for (const column of columns) {
        const key = promptFieldKey(activity, prompt, `${fieldToken(row)}.${fieldToken(column)}`);
        tableLines.push(`${column}: ${activityResponses[key] || ''}`);
      }
    }
    return tableLines;
  }
  const key = promptFieldKey(activity, prompt);
  return [promptLabel, activityResponses[key] || ''];
}

function renderQuizzes() {
  refs.sectionTitle.textContent = 'Quizzes';
  if (!quizzes.length) {
    refs.contentBody.innerHTML = `
      <div class="empty-card">
        <h3>No quizzes loaded yet</h3>
        <p>Quiz materials can be added here without changing the course shell.</p>
      </div>
    `;
    return;
  }
}

function renderAssignments() {
  refs.sectionTitle.textContent = 'Assignments';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${assignments.map((assignment) => {
        const locked = !isAssignmentUnlocked(assignment);
        const complete = completedAssignmentSet().has(assignment.id);
        return `
          <article class="stack-card assignment-card${locked ? ' is-locked' : ''}${complete ? ' is-complete' : ''}">
            <span class="card-code mono">${escapeHtml(assignment.unitTitle)}</span>
            <h3>${escapeHtml(assignment.title)}</h3>
            <p>${escapeHtml(locked ? 'Complete the related unit to unlock this assignment.' : assignment.summary)}</p>
            <div class="card-actions">
              <button type="button" data-assignment-id="${assignment.id}" ${locked ? 'disabled' : ''}>View Assignment</button>
              <a href="${escapeHtml(assignment.docxPath)}" target="_blank" rel="noopener noreferrer">Download DOCX</a>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-assignment-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveAssignment(button.dataset.assignmentId));
  });
}

function renderAssignmentDetail() {
  const assignment = assignments.find((item) => item.id === state.activeAssignmentId) || assignments[0];
  if (!assignment) {
    renderAssignments();
    return;
  }
  const locked = !isAssignmentUnlocked(assignment);
  const complete = completedAssignmentSet().has(assignment.id);
  refs.sectionTitle.textContent = assignment.title;
  refs.contentBody.innerHTML = `
    <article class="detail-card assignment-detail">
      <div class="detail-head">
        <span class="card-code mono">${escapeHtml(assignment.unitTitle)}</span>
        <h3>${escapeHtml(assignment.title)}</h3>
      </div>
      ${locked ? '<p>Complete the related unit to unlock this assignment.</p>' : assignment.instructionsHtml}
      ${renderAssignmentLinks(assignment)}
      <div class="detail-actions">
        <button type="button" id="back-to-assignments" class="secondary-button">Back to Assignments</button>
        <a class="secondary-link" href="${escapeHtml(assignment.docxPath)}" target="_blank" rel="noopener noreferrer">Download DOCX</a>
        <button type="button" id="mark-assignment-complete" class="primary-button" ${locked || complete ? 'disabled' : ''}>${complete ? 'Completed' : 'Mark Complete'}</button>
      </div>
    </article>
  `;
  document.getElementById('back-to-assignments')?.addEventListener('click', () => setSection('assignments'));
  document.getElementById('mark-assignment-complete')?.addEventListener('click', () => markAssignmentComplete(assignment.id));
}

function renderAssignmentLinks(assignment) {
  if (!assignment.links?.length || !isAssignmentUnlocked(assignment)) return '';
  return `
    <div class="link-list">
      ${assignment.links.map((link) => `
        <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a>
      `).join('')}
    </div>
  `;
}

function getLibraryPageCount(item) {
  return libraryPageCounts[item.file] || null;
}

function formatLibraryPages(item) {
  const pages = getLibraryPageCount(item);
  if (!pages) return 'PDF';
  return `${pages} ${pages === 1 ? 'page' : 'pages'}`;
}

function libraryIndexLabel(item, index) {
  const chapterMatch = item.id.match(/chapter-(\d+)/);
  if (chapterMatch) return chapterMatch[1].padStart(2, '0');
  if (item.code && item.code.length <= 4) return item.code;
  return String(index + 1).padStart(2, '0');
}

function libraryDescription(item) {
  if (item.description) return item.description;
  if (item.kind === 'chapter') {
    return 'Open this chapter in the course viewer or download it for offline reading.';
  }
  return 'Open this course resource in the viewer or download it for offline reading.';
}

function getSelectedLibraryItem() {
  return libraryItems.find((item) => item.id === state.activeLibraryId)
    || libraryItems.find((item) => item.kind === 'chapter')
    || libraryItems[0]
    || null;
}

function renderLibraryRows(items, selected) {
  if (!items.length) {
    return '<div class="library-empty-list">No matching library items.</div>';
  }
  return items.map((item, index) => {
    const isActive = selected?.id === item.id;
    return `
      <button class="chapter-tab${isActive ? ' is-active' : ''}" type="button" data-library-id="${escapeHtml(item.id)}" aria-pressed="${isActive}">
        <span class="chapter-index mono">${escapeHtml(libraryIndexLabel(item, index))}</span>
        <span class="chapter-tab-main">
          <strong>${escapeHtml(item.title)}</strong>
          <span>${escapeHtml(formatLibraryPages(item))}</span>
        </span>
        <span class="chapter-status" aria-hidden="true"><i class="fa-solid ${isActive ? 'fa-check' : 'fa-circle'}"></i></span>
      </button>
    `;
  }).join('');
}

function renderLibrarySelectOptions(chapterItems, resourceItems, selected) {
  const chapterOptions = chapterItems.map((item) => `
    <option value="${escapeHtml(item.id)}"${selected?.id === item.id ? ' selected' : ''}>
      ${escapeHtml(item.title)} - ${escapeHtml(formatLibraryPages(item))}
    </option>
  `).join('');
  const resourceOptions = resourceItems.map((item) => `
    <option value="${escapeHtml(item.id)}"${selected?.id === item.id ? ' selected' : ''}>
      ${escapeHtml(item.title)} - ${escapeHtml(formatLibraryPages(item))}
    </option>
  `).join('');
  return `
    ${chapterOptions ? `<optgroup label="Chapters">${chapterOptions}</optgroup>` : ''}
    ${resourceOptions ? `<optgroup label="Resources">${resourceOptions}</optgroup>` : ''}
  `;
}

function renderLibrary() {
  const selected = getSelectedLibraryItem();
  if (!selected) {
    refs.sectionTitle.textContent = 'Library';
    refs.contentBody.innerHTML = `
      <div class="empty-card">
        <h3>No library files loaded yet</h3>
        <p>PDF resources can be added here without changing the course shell.</p>
      </div>
    `;
    return;
  }

  const search = state.librarySearch.trim().toLowerCase();
  const sortedItems = [...libraryItems].sort((a, b) => {
    if (state.librarySort !== 'title') return 0;
    return a.title.localeCompare(b.title);
  });
  const filteredItems = search
    ? sortedItems.filter((item) => `${item.title} ${item.code} ${item.kind} ${item.description || ''}`.toLowerCase().includes(search))
    : sortedItems;
  const chapterItems = filteredItems.filter((item) => item.kind === 'chapter');
  const resourceItems = filteredItems.filter((item) => item.kind !== 'chapter');
  const chapterCount = libraryItems.filter((item) => item.kind === 'chapter').length;
  const resourceCount = libraryItems.length - chapterCount;
  const viewerSrc = `./pdf-viewer.html?file=${encodeURIComponent(selected.file)}&title=${encodeURIComponent(selected.title)}`;
  const readerOpen = state.libraryReaderOpen !== false;
  const readerFullscreen = readerOpen && state.libraryReaderFullscreen === true;
  const selectedCode = selected.code || (selected.kind === 'chapter' ? 'Chapter' : 'Resource');

  document.body.classList.toggle('is-library-reader-fullscreen', readerFullscreen);
  refs.sectionTitle.textContent = 'Library';
  refs.contentBody.innerHTML = `
    <section class="library-section">
      <div class="library-tools-row">
        <label class="library-search-box" for="library-search">
          <i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
          <input id="library-search" type="search" value="${escapeHtml(state.librarySearch)}" placeholder="Search library..." autocomplete="off" />
        </label>
        <button class="library-tool-button" type="button" data-library-sort>
          <i class="fa-solid fa-arrow-down-wide-short" aria-hidden="true"></i>
          ${state.librarySort === 'title' ? 'Source Order' : 'Sort A-Z'}
        </button>
      </div>

      <div class="library-browser">
        <aside class="chapter-selector-panel" aria-label="Library item selector">
          <label class="library-mobile-select-wrap" for="library-mobile-select">
            <span class="mono">Choose reading</span>
            <select id="library-mobile-select">
              ${renderLibrarySelectOptions(chapterItems, resourceItems, selected)}
            </select>
          </label>
          <div class="chapter-selector-header">
            <span class="mono">Chapters</span>
            <strong>${chapterCount} ${chapterCount === 1 ? 'chapter' : 'chapters'}</strong>
          </div>
          <div class="chapter-list">
            ${renderLibraryRows(chapterItems, selected)}
          </div>
          ${resourceItems.length ? `
            <div class="resource-selector-group">
              <div class="chapter-selector-header chapter-selector-header--secondary">
                <span class="mono">Resources</span>
                <strong>${resourceCount} files</strong>
              </div>
              <div class="chapter-list">
                ${renderLibraryRows(resourceItems, selected)}
              </div>
            </div>
          ` : ''}
        </aside>

        <article class="chapter-reader-panel${readerFullscreen ? ' is-reader-fullscreen' : ''}">
          <div class="chapter-reader-header">
            <div class="chapter-reader-copy">
              <span class="chapter-reader-kicker mono">${escapeHtml(selectedCode)}</span>
              <h3>${escapeHtml(selected.title)}</h3>
              <p>${escapeHtml(libraryDescription(selected))}</p>
              <div class="chapter-reader-meta">
                <i class="fa-regular fa-file-lines" aria-hidden="true"></i>
                <span>${escapeHtml(formatLibraryPages(selected))}</span>
              </div>
            </div>
            <div class="chapter-actions">
              <button class="primary-action" type="button" id="toggle-library-reader">
                <i class="fa-solid ${readerOpen ? 'fa-eye-slash' : 'fa-book-open'}" aria-hidden="true"></i>
                ${readerOpen ? 'Close Viewer' : 'Open Reader'}
              </button>
              <button class="secondary-action reader-fullscreen-action" type="button" id="fullscreen-library-reader">
                <i class="fa-solid ${readerFullscreen ? 'fa-compress' : 'fa-expand'}" aria-hidden="true"></i>
                ${readerFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
              <a class="secondary-action" href="${escapeHtml(selected.file)}" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-download" aria-hidden="true"></i>
                Download PDF
              </a>
            </div>
          </div>

          ${readerOpen ? `
            <div class="pdf-reader-frame">
              <iframe src="${viewerSrc}" title="${escapeHtml(selected.title)}"></iframe>
            </div>
          ` : `
            <div class="reader-closed-panel">
              <span class="mono">Reader closed</span>
              <p>Open the selected PDF in the course viewer when you are ready to read.</p>
            </div>
          `}
        </article>
      </div>
    </section>
  `;

  refs.contentBody.querySelectorAll('[data-library-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveLibrary(button.dataset.libraryId));
  });
  refs.contentBody.querySelector('#library-mobile-select')?.addEventListener('change', (event) => {
    setActiveLibrary(event.target.value);
  });
  refs.contentBody.querySelector('[data-library-sort]')?.addEventListener('click', () => {
    state.librarySort = state.librarySort === 'title' ? 'default' : 'title';
    saveJson(STORAGE_KEYS.ui, state);
    renderLibrary();
  });
  refs.contentBody.querySelector('#toggle-library-reader')?.addEventListener('click', () => {
    state.libraryReaderOpen = !readerOpen;
    if (!state.libraryReaderOpen) state.libraryReaderFullscreen = false;
    saveJson(STORAGE_KEYS.ui, state);
    renderLibrary();
  });
  refs.contentBody.querySelector('#fullscreen-library-reader')?.addEventListener('click', toggleLibraryFullscreen);
  refs.contentBody.querySelector('#library-search')?.addEventListener('input', (event) => {
    const nextValue = event.target.value;
    state.librarySearch = nextValue;
    saveJson(STORAGE_KEYS.ui, state);
    renderLibrary();
    const nextInput = refs.contentBody.querySelector('#library-search');
    nextInput?.focus();
    nextInput?.setSelectionRange(nextValue.length, nextValue.length);
  });
}

function toggleLibraryFullscreen() {
  state.libraryReaderOpen = true;
  state.libraryReaderFullscreen = !state.libraryReaderFullscreen;
  saveJson(STORAGE_KEYS.ui, state);
  renderLibrary();
}

function renderFilmRoom() {
  const active = filmRoomItems.find((item) => item.id === state.activeFilmId) || filmRoomItems[0] || null;
  if (!active) {
    refs.sectionTitle.textContent = 'Film Room';
    refs.contentBody.innerHTML = `
      <div class="empty-card">
        <h3>No films loaded yet</h3>
        <p>Video resources can be added here without changing the course shell.</p>
      </div>
    `;
    return;
  }
  const activeVideoNumber = Math.max(1, filmRoomItems.findIndex((item) => item.id === active.id) + 1);
  const activeType = toEmbedUrl(active.url) ? 'Embedded source' : 'Source link';
  const activeModuleLabel = moduleLabelFor(active);
  const activeModuleCode = moduleCodeFor(active);
  refs.sectionTitle.textContent = 'Film Room';
  refs.contentBody.innerHTML = `
    <section class="film-room-shell">
      <div class="film-room-stage">
        <div class="film-room-sign">
          <div>
            <p class="mono film-room-kicker">Aboriginal Studies Archive</p>
            <h4>Film Room</h4>
          </div>
          <div class="mono film-room-count">${filmRoomItems.length} videos loaded</div>
        </div>
        <div class="film-room-tv-wrap">
          <div class="film-room-antenna" aria-hidden="true">
            <span></span>
            <span></span>
          </div>
          <div class="film-room-tv">
            <div class="film-room-screen-shell">
              <div class="film-room-screen">
                ${renderMediaFrame(active)}
              </div>
            </div>
            <div class="film-room-console">
              <div class="film-room-slot" aria-hidden="true"></div>
              <div class="film-room-led mono">${escapeHtml(activeModuleCode)}</div>
            </div>
          </div>
        </div>
      </div>
      <aside class="film-room-sidebar">
        <article class="film-room-panel">
          <p class="mono film-room-kicker">Video catalog</p>
          <h4>Load a video</h4>
          <p>Use the playlist to switch videos without leaving the course shell.</p>
          <label class="film-room-label" for="film-room-select">Playlist</label>
          <select id="film-room-select" class="film-room-select" data-film-room-select>
            ${filmRoomItems.map((item) => `
              <option value="${item.id}"${item.id === active.id ? ' selected' : ''}>${escapeHtml(moduleLabelFor(item))} - ${escapeHtml(item.title)}</option>
            `).join('')}
          </select>
        </article>
        <article class="film-room-panel film-room-now-playing">
          <p class="mono film-room-kicker">Now loaded</p>
          <h4>${escapeHtml(activeModuleLabel)}</h4>
          <p class="film-room-title">${escapeHtml(active.title)}</p>
          <p>${escapeHtml(active.description)}</p>
          <div class="film-room-meta mono">
            <span>${escapeHtml(activeType)}</span>
            <span>${activeVideoNumber} / ${filmRoomItems.length}</span>
          </div>
          <a class="film-room-source" href="${escapeHtml(active.url)}" target="_blank" rel="noopener noreferrer">Open Source</a>
        </article>
      </aside>
    </section>
  `;
  refs.contentBody.querySelector('[data-film-room-select]')?.addEventListener('change', (event) => {
    setActiveFilm(event.target.value);
  });
}

function moduleLabelFor(item) {
  if (item.moduleLabel) return item.moduleLabel;
  const unit = units.find((candidate) => candidate.id === item.unitId);
  return unit?.title || 'Course media';
}

function moduleCodeFor(item) {
  if (item.moduleCode) return item.moduleCode;
  const unit = units.find((candidate) => candidate.id === item.unitId);
  return unit?.code || 'AS30';
}

function renderMediaFrame(item) {
  const embedUrl = toEmbedUrl(item.url);
  if (!embedUrl) {
    return `
      <div class="film-room-external">
        <span class="mono">${escapeHtml(item.kind || 'resource')}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">Open Source</a>
      </div>
    `;
  }
  return `<iframe src="${escapeHtml(embedUrl)}" title="${escapeHtml(item.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`;
}

function toEmbedUrl(url) {
  if (!url) return '';
  if (/youtube\.com\/embed\//i.test(url)) return url;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (/youtube\.com/i.test(url) && watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = url.match(/youtu\.be\/([^?&#]+)/i);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  if (/archive\.org\/embed\//i.test(url)) return url;
  const archiveMatch = url.match(/archive\.org\/details\/([^?&#/]+)/i);
  if (archiveMatch) return `https://archive.org/embed/${archiveMatch[1]}`;
  return '';
}

function render() {
  document.body.classList.toggle(
    'is-library-reader-fullscreen',
    state.section === 'library' && state.libraryReaderOpen !== false && state.libraryReaderFullscreen === true
  );
  updateProgress();
  setActiveNav();
  if (state.section === 'unit') return renderUnit();
  if (state.section === 'quizzes') return renderQuizzes();
  if (state.section === 'assignments') return renderAssignments();
  if (state.section === 'assignment') return renderAssignmentDetail();
  if (state.section === 'library') return renderLibrary();
  if (state.section === 'film') return renderFilmRoom();
  return renderHome();
}

refs.navHome?.addEventListener('click', () => setSection('home'));
refs.navQuizzes?.addEventListener('click', () => setSection('quizzes'));
refs.navAssignments?.addEventListener('click', () => setSection('assignments'));
refs.navLibrary?.addEventListener('click', () => setSection('library'));
refs.navFilm?.addEventListener('click', () => setSection('film'));
refs.sidebarToggle?.addEventListener('click', toggleSidebar);
sidebarForcedCollapseQuery?.addEventListener?.('change', applySidebarState);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !state.libraryReaderFullscreen) return;
  state.libraryReaderFullscreen = false;
  saveJson(STORAGE_KEYS.ui, state);
  renderLibrary();
});

applySidebarState();
render();
