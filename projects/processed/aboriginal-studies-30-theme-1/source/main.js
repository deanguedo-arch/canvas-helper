const DATA = window.ABORIGINAL_STUDIES_30_DATA || {};

const STORAGE_KEYS = {
  progress: 'aboriginal-studies-30.progress',
  ui: 'aboriginal-studies-30.ui',
  activityResponses: 'aboriginal-studies-30.activityResponses'
};

const refs = {
  sidebarToggle: document.getElementById('sidebar-toggle'),
  topbarMenuToggle: document.getElementById('topbar-menu-toggle'),
  menuScrim: document.getElementById('menu-scrim'),
  topbar: document.querySelector('.course-topbar'),
  courseSidebar: document.getElementById('course-sidebar'),
  themeSubnav: document.getElementById('theme-subnav'),
  contentBody: document.getElementById('content-body'),
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percent'),
  progressCount: document.getElementById('progress-count'),
  navHome: document.getElementById('nav-home'),
  navQuizzes: document.getElementById('nav-quizzes'),
  navAssignments: document.getElementById('nav-assignments'),
  navLibrary: document.getElementById('nav-library'),
  navFilm: document.getElementById('nav-film'),
  navVocabulary: document.getElementById('nav-vocabulary'),
  navMywork: document.getElementById('nav-mywork'),
  dialog: document.getElementById('course-dialog'),
  dialogKicker: document.getElementById('course-dialog-kicker'),
  dialogTitle: document.getElementById('course-dialog-title'),
  dialogBody: document.getElementById('course-dialog-body'),
  dialogClose: document.getElementById('course-dialog-close')
};

const units = DATA.units || [];
const libraryItems = DATA.libraryItems || [];
const assignments = DATA.assignments || [];
const quizzes = DATA.quizzes || [];
const filmRoomItems = DATA.filmRoomItems || [];
const themeActivities = DATA.themeActivities || [];
const coreVocabulary = DATA.coreVocabulary || [];
const vocabEnrichment = window.AS30_VOCAB_ENRICHMENT || {};
const FRAYER_LABELS = ['In my own words', 'The important parts of the idea', 'An example', 'Something this term does not mean'];

function vocabEnrichmentFor(term) {
  return vocabEnrichment[String(term || '')] || null;
}

function renderVocabFrayer(term) {
  const enrich = vocabEnrichmentFor(term);
  const model = (enrich && Array.isArray(enrich.frayer)) ? enrich.frayer : [];
  const slug = String(term || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'term';
  return `
    <section class="frayer">
      <div class="frayer-heading">
        <div>
          <p class="eyebrow">My Frayer</p>
          <h3>${escapeHtml(term)}</h3>
        </div>
      </div>
      <div class="frayer-grid">
        ${FRAYER_LABELS.map((label, index) => {
          const key = `frayer::${term}::${index}`;
          return `
            <label class="field-label" for="frayer-${slug}-${index}">${escapeHtml(label)}
              <textarea id="frayer-${slug}-${index}" data-activity-response="${escapeHtml(key)}" rows="3" maxlength="600">${escapeHtml(readCourseResponse(key) || '')}</textarea>
            </label>
          `;
        }).join('')}
      </div>
      <p class="activity-save-status" data-activity-save-status data-save-state="ready">Save status.</p>
      ${model.length === FRAYER_LABELS.length ? `
        <details class="frayer-model">
          <summary>Show the course model</summary>
          <dl>
            ${FRAYER_LABELS.map((label, index) => `
              <div>
                <dt>${escapeHtml(label)}</dt>
                <dd>${escapeHtml(model[index] || '')}</dd>
              </div>
            `).join('')}
          </dl>
        </details>
      ` : ''}
    </section>
  `;
}
const reviewUnlockAll = true;
const routeableSections = new Set(['home', 'unit', 'lesson', 'quizzes', 'assignments', 'assignment', 'library', 'film', 'vocabulary', 'mywork']);
const ROUTE_QUERY_KEYS = ['section', 'unit', 'lesson', 'assignment', 'library', 'film'];
const chapterPrintedStarts = {
  'chapter-1.pdf': 2,
  'chapter-2.pdf': 36,
  'chapter-3.pdf': 76,
  'chapter-4.pdf': 108,
  'chapter-5.pdf': 158,
  'chapter-6.pdf': 178,
  'chapter-7.pdf': 208
};
const sidebarForcedCollapseQuery = window.matchMedia?.('(max-width: 760px)');
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
  './assets/library/halfbreed-maria-campbell.pdf': 222,
  './assets/library/textbook.pdf': 256
};

let progress = loadJson(STORAGE_KEYS.progress, { completedUnits: [], completedAssignments: [] });
let storeSaveException = false;
// T05: learner responses live in the AB30Store adapter (learning-store.js),
// initialized once here. If the adapter script is missing or init throws,
// the course still renders; reads/writes below take the legacy direct path
// and the save status says so.
let storeBoot = { ok: true, mode: 'envelope' };
try {
  storeBoot = (typeof AB30Store !== 'undefined' && AB30Store)
    ? AB30Store.init()
    : { ok: false, mode: 'legacy-direct', code: 'adapter-missing' };
} catch (error) {
  storeBoot = { ok: false, mode: 'legacy-direct', code: 'init-failed' };
}
// Writes the adapter could not confirm (quota/over-budget). Retried by
// flushPendingWrites before navigation/import/unload; never silently dropped.
const pendingWrites = new Map();
let state = loadJson(STORAGE_KEYS.ui, {
  section: 'home',
  activeUnitId: units[0]?.id || null,
  activeLessonId: null,
  activeLibraryId: null,
  activeAssignmentId: null,
  activeFilmId: null,
  sidebarCollapsed: false,
  mobileSidebarExpanded: false,
  libraryReaderOpen: true,
  libraryReaderFullscreen: false,
  librarySearch: '',
  librarySort: 'default',
  themeTab: 'lessons'
});

state.sidebarCollapsed = Boolean(state.sidebarCollapsed);
state.mobileSidebarExpanded = Boolean(state.mobileSidebarExpanded);
state.libraryReaderOpen = state.libraryReaderOpen !== false;
state.libraryReaderFullscreen = Boolean(state.libraryReaderFullscreen);
state.librarySearch = typeof state.librarySearch === 'string' ? state.librarySearch : '';
state.librarySort = state.librarySort === 'title' ? 'title' : 'default';
state.themeTab = state.themeTab === 'written' ? 'written' : 'lessons';

function isSidebarForcedCollapsed() {
  return Boolean(sidebarForcedCollapseQuery?.matches);
}

function isSidebarCollapsed() {
  if (isSidebarForcedCollapsed()) return !state.mobileSidebarExpanded;
  return state.sidebarCollapsed;
}

// ---- T07 lesson routes: validated, deep-linkable, back-button safe. Pure core
// (parse/resolve/neighbors/href) is unit-tested; thin window wrappers do I/O.
function parseRouteFromSearch(search) {
  const params = new URLSearchParams(String(search || ''));
  const route = {
    section: 'home',
    unitId: null,
    lessonId: null,
    assignmentId: null,
    libraryId: null,
    filmId: null
  };
  const requestedSection = params.get('section');
  if (routeableSections.has(requestedSection)) route.section = requestedSection;
  const requestedUnit = params.get('unit');
  if (requestedUnit && units.some((unit) => unit.id === requestedUnit)) {
    route.section = 'unit';
    route.unitId = requestedUnit;
  }
  const requestedLesson = params.get('lesson');
  if (requestedLesson && route.unitId) {
    const resolved = resolveLessonRoute(route.unitId, requestedLesson);
    if (resolved.ok) {
      route.section = 'lesson';
      route.lessonId = requestedLesson;
    }
  }
  const requestedAssignment = params.get('assignment');
  if (requestedAssignment && assignments.some((item) => item.id === requestedAssignment)) {
    route.section = 'assignment';
    route.assignmentId = requestedAssignment;
  }
  const requestedLibrary = params.get('library');
  if (requestedLibrary && libraryItems.some((item) => item.id === requestedLibrary)) {
    route.section = 'library';
    route.libraryId = requestedLibrary;
  }
  const requestedFilmId = params.get('film');
  if (requestedFilmId && filmRoomItems.some((item) => item.id === requestedFilmId)) {
    route.section = 'film';
    route.filmId = requestedFilmId;
  }
  return route;
}

function resolveLessonRoute(unitId, lessonId) {
  try {
    const unit = units.find((item) => item.id === unitId) || null;
    const lessons = unit && Array.isArray(unit.lessons) ? unit.lessons : [];
    const index = lessons.findIndex((lesson) => lesson && lesson.id === lessonId);
    if (unit && index >= 0) return { ok: true, unit, lesson: lessons[index], index };
    if (unit) return { ok: false, fallback: { section: 'unit', unitId: unit.id } };
    return { ok: false, fallback: { section: 'home' } };
  } catch (_error) {
    return { ok: false, fallback: { section: 'home' } };
  }
}

function lessonNeighbors(unitId, lessonId) {
  const resolved = resolveLessonRoute(unitId, lessonId);
  if (!resolved.ok) return { prevId: null, nextId: null };
  const lessons = resolved.unit.lessons;
  const prev = resolved.index > 0 ? lessons[resolved.index - 1] : null;
  const next = resolved.index < lessons.length - 1 ? lessons[resolved.index + 1] : null;
  return { prevId: prev ? prev.id : null, nextId: next ? next.id : null };
}

function anchorToLessonRoute(hash) {
  const match = String(hash || '').match(/^#lesson-([A-Za-z0-9_-]+)$/);
  if (!match) return null;
  const lessonId = match[1];
  for (const unit of units) {
    if ((unit.lessons || []).some((lesson) => lesson && lesson.id === lessonId)) {
      return { unitId: unit.id, lessonId };
    }
  }
  return null;
}

function lessonRouteHref(unitId, lessonId) {
  const params = new URLSearchParams();
  params.set('section', 'lesson');
  params.set('unit', unitId);
  params.set('lesson', lessonId);
  return `?${params.toString()}`;
}

function routeToSearch(route, currentSearch) {
  const params = new URLSearchParams(String(currentSearch || ''));
  for (const key of ROUTE_QUERY_KEYS) params.delete(key);
  params.set('section', route.section || 'home');
  if ((route.section === 'unit' || route.section === 'lesson') && route.unitId) params.set('unit', route.unitId);
  if (route.section === 'lesson' && route.lessonId) params.set('lesson', route.lessonId);
  if (route.section === 'assignment' && route.assignmentId) params.set('assignment', route.assignmentId);
  if (route.section === 'library' && route.libraryId) params.set('library', route.libraryId);
  if (route.section === 'film' && route.filmId) params.set('film', route.filmId);
  const query = params.toString();
  return query ? `?${query}` : '/';
}

function previewRouteUrl(href, route) {
  const url = new URL(String(href), 'http://localhost/');
  const activeRoute = {
    unit: (route.section === 'unit' || route.section === 'lesson') ? (route.unitId || null) : null,
    lesson: route.section === 'lesson' ? (route.lessonId || null) : null,
    assignment: route.section === 'assignment' ? (route.assignmentId || null) : null,
    library: route.section === 'library' ? (route.libraryId || null) : null,
    film: route.section === 'film' ? (route.filmId || null) : null
  };
  if (url.searchParams.get('section') === route.section &&
      Object.entries(activeRoute).every(([key, value]) => url.searchParams.get(key) === value)) return url.href;
  for (const key of ROUTE_QUERY_KEYS) url.searchParams.delete(key);
  url.searchParams.set('section', route.section || 'home');
  for (const [key, value] of Object.entries(activeRoute)) {
    if (value) url.searchParams.set(key, value);
  }
  return url.href;
}

function applyRouteToState(route) {
  if (!route) return;
  if (route.section === 'lesson' && route.unitId && route.lessonId) {
    const resolved = resolveLessonRoute(route.unitId, route.lessonId);
    if (resolved.ok) {
      state.section = 'lesson';
      state.activeUnitId = route.unitId;
      state.activeLessonId = route.lessonId;
      return;
    }
    route = { ...route, ...resolved.fallback, lessonId: null };
  }
  if (route.section === 'unit' && route.unitId && units.some((unit) => unit.id === route.unitId)) {
    state.section = 'unit';
    state.activeUnitId = route.unitId;
    state.activeLessonId = null;
    return;
  }
  if (route.section === 'assignment' && route.assignmentId) {
    state.section = 'assignment';
    state.activeAssignmentId = route.assignmentId;
    return;
  }
  if (route.section === 'library' && route.libraryId) {
    state.section = 'library';
    state.activeLibraryId = route.libraryId;
    return;
  }
  if (route.section === 'film' && route.filmId) {
    state.section = 'film';
    state.activeFilmId = route.filmId;
    return;
  }
  if (routeableSections.has(route.section)) state.section = route.section;
  else state.section = 'home';
  state.activeLessonId = null;
}

function pushRouteState() {
  try {
    if (typeof window === 'undefined' || !window.history || typeof window.history.pushState !== 'function') return;
    const route = {
      section: state.section,
      unitId: state.activeUnitId,
      lessonId: state.activeLessonId,
      assignmentId: state.activeAssignmentId,
      libraryId: state.activeLibraryId,
      filmId: state.activeFilmId
    };
    window.history.pushState(window.history.state, '', routeToSearch(route, window.location.search));
  } catch (_error) { /* navigation still renders; only Back/Forward depth is lost */ }
}

function applyRouteFromUrl() {
  if (typeof window === 'undefined') return;
  const route = parseRouteFromSearch(window.location.search);
  const anchor = anchorToLessonRoute(window.location.hash);
  if (anchor && route.section === 'home' && !route.unitId) {
    route.section = 'lesson';
    route.unitId = anchor.unitId;
    route.lessonId = anchor.lessonId;
  }
  applyRouteToState(route);
  saveJson(STORAGE_KEYS.ui, state);
}


function syncStudioPreviewRoute() {
  if (typeof window === 'undefined') return;
  if (!window.location.pathname.includes('/preview/workspace/aboriginal-studies-30/index.html')) return;
  const route = {
    section: state.section,
    unitId: state.activeUnitId,
    lessonId: state.activeLessonId,
    assignmentId: state.activeAssignmentId,
    libraryId: state.activeLibraryId,
    filmId: state.activeFilmId
  };
  const href = previewRouteUrl(window.location.href, route);
  if (href !== window.location.href) window.history.replaceState(window.history.state, '', href);
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || '') || fallback;
  } catch (_error) {
    return fallback;
  }
}

// R02: AB30Store is the sole writer of tracked keys. main.js submits
// nav/progress patches; the store read-modify-writes over the current
// stored value (unknown props preserved, __rev versioned). Direct writes
// happen only when the store script itself is absent (degraded mode with
// no practice data to clobber, since practice methods live in the store).
const NAV_PERSIST_PROPS = [
  'section', 'activeUnitId', 'activeLessonId', 'activeLibraryId',
  'activeAssignmentId', 'activeFilmId', 'sidebarCollapsed',
  'mobileSidebarExpanded', 'libraryReaderOpen', 'libraryReaderFullscreen',
  'librarySearch', 'librarySort', 'themeTab'
];

const PROGRESS_PERSIST_PROPS = ['completedUnits', 'completedAssignments'];

function pickPersistProps(source, allowlist) {
  const patch = {};
  for (const key of allowlist) {
    if (source && typeof source === 'object' && key in source) patch[key] = source[key];
  }
  return patch;
}

function storeAvailable() {
  return typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.saveNavigation === 'function';
}

function saveJson(key, value) {
  try { flushDebouncedDrafts(); } catch (_error) { /* nav must never break on a draft flush */ }
  if ((key === STORAGE_KEYS.ui || key === STORAGE_KEYS.progress) && storeAvailable()) {
    try {
      const result = key === STORAGE_KEYS.ui
        ? AB30Store.saveNavigation(pickPersistProps(value, NAV_PERSIST_PROPS))
        : AB30Store.saveProgress(pickPersistProps(value, PROGRESS_PERSIST_PROPS));
      storeSaveException = false;
      if (result?.ok === false) refreshSaveStatus();
    } catch (_error) {
      // The adapter owns these keys even when it fails. A direct write here
      // could replace a newer tab's state or bypass migration/conflict data.
      storeSaveException = true;
      refreshSaveStatus();
    }
    return;
  }
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

function getUnitNumber(unitId) {
  const match = String(unitId || '').match(/^theme-(\d+)$/i);
  if (match) return Number(match[1]);
  return Math.max(1, getUnitIndex(unitId) + 1);
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
  closeMobileMenuOnNavigate();
  saveJson(STORAGE_KEYS.ui, state);
  pushRouteState();
  syncStudioPreviewRoute();
  render();
}

function setActiveUnit(unitId) {
  state.section = 'unit';
  state.activeUnitId = unitId;
  state.activeLessonId = null;
  state.themeTab = 'lessons';
  closeMobileMenuOnNavigate();
  saveJson(STORAGE_KEYS.ui, state);
  pushRouteState();
  syncStudioPreviewRoute();
  render();
  window.scrollTo(0, 0);
}

function setActiveLesson(unitId, lessonId) {
  const resolved = resolveLessonRoute(unitId, lessonId);
  if (!resolved.ok) {
    applyRouteToState({ ...resolved.fallback, unitId: resolved.fallback.unitId || null });
    saveJson(STORAGE_KEYS.ui, state);
    pushRouteState();
    syncStudioPreviewRoute();
    render();
    return resolved;
  }
  closeCourseDialog();
  state.section = 'lesson';
  state.activeUnitId = unitId;
  state.activeLessonId = lessonId;
  closeMobileMenuOnNavigate();
  saveJson(STORAGE_KEYS.ui, state);
  pushRouteState();
  syncStudioPreviewRoute();
  render();
  focusLessonHeading();
  return resolved;
}

function focusLessonHeading() {
  try {
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') window.scrollTo(0, 0);
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return;
    const heading = document.querySelector('[data-lesson-heading]');
    if (heading && typeof heading.focus === 'function') heading.focus({ preventScroll: true });
  } catch (_error) { /* focus is an enhancement; navigation already rendered */ }
}

function setActiveLibrary(itemId) {
  state.section = 'library';
  state.activeLibraryId = itemId;
  state.libraryReaderOpen = true;
  saveJson(STORAGE_KEYS.ui, state);
  syncStudioPreviewRoute();
  render();
}

function setActiveAssignment(itemId) {
  state.section = 'assignment';
  state.activeAssignmentId = itemId;
  saveJson(STORAGE_KEYS.ui, state);
  syncStudioPreviewRoute();
  render();
}

function setActiveFilm(itemId) {
  state.section = 'film';
  state.activeFilmId = itemId;
  saveJson(STORAGE_KEYS.ui, state);
  syncStudioPreviewRoute();
  render();
}

function isMobileMenuOpen() {
  return isSidebarForcedCollapsed() && state.mobileSidebarExpanded === true;
}

// R06: the scrim is the only visibility switch for the mobile menu overlay.
// Desktop collapse never shows it.
function syncMenuScrim() {
  if (!refs.menuScrim) return;
  refs.menuScrim.hidden = !isMobileMenuOpen();
}

function applySidebarState() {
  const collapsed = isSidebarCollapsed();
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  for (const toggle of [refs.sidebarToggle, refs.topbarMenuToggle]) {
    if (!toggle) continue;
    toggle.setAttribute('aria-expanded', String(!collapsed));
    toggle.setAttribute('aria-label', collapsed ? 'Expand sidebar' : 'Collapse sidebar');
  }
  const icon = refs.sidebarToggle?.querySelector('i');
  if (icon) {
    icon.textContent = collapsed ? '›' : '‹';
  }
  syncMenuScrim();
}

// R06: opening moves focus into the menu; closing returns it to the menu
// button. Selection-driven closes pass { focus: false } because the new
// view takes focus (lesson heading) or keeps it (other sections).
function setMobileMenu(open, options) {
  const focus = !options || options.focus !== false;
  state.mobileSidebarExpanded = open === true;
  saveJson(STORAGE_KEYS.ui, state);
  applySidebarState();
  if (!focus || typeof document === 'undefined') return;
  try {
    if (open === true) {
      const first = refs.courseSidebar?.querySelector('.course-nav button, .course-nav summary, .course-nav a');
      if (first && typeof first.focus === 'function') first.focus();
    } else if (refs.topbarMenuToggle && typeof refs.topbarMenuToggle.focus === 'function') {
      refs.topbarMenuToggle.focus();
    }
  } catch (_error) { /* focus is an enhancement; the menu already toggled */ }
}

function toggleSidebar() {
  if (isSidebarForcedCollapsed()) {
    setMobileMenu(!isMobileMenuOpen());
    return;
  }
  state.sidebarCollapsed = !state.sidebarCollapsed;
  saveJson(STORAGE_KEYS.ui, state);
  applySidebarState();
}

// R06: route selection closes the mobile menu without stealing focus.
function closeMobileMenuOnNavigate() {
  if (isMobileMenuOpen()) setMobileMenu(false, { focus: false });
}

// R06: layout offset follows the real header height (two-row on mobile),
// never a retained 64px assumption. Pure enhancement: failure keeps CSS.
function syncTopbarOffset() {
  try {
    if (typeof document === 'undefined' || !refs.topbar) return 0;
    const height = Math.max(0, Math.round(refs.topbar.getBoundingClientRect().height || 0));
    if (height > 0) document.documentElement.style.setProperty('--topbar-actual', `${height}px`);
    return height;
  } catch (_error) {
    return 0;
  }
}

// R06: the current route stays visible inside the sidebar on load, resume,
// and route change — scrolled within the sidebar only, never the lesson.
function revealActiveNavLink() {
  try {
    if (typeof document === 'undefined' || typeof document.querySelector !== 'function') return false;
    const active = document.querySelector('[data-testid="active-lesson-link"]');
    if (!active || typeof active.scrollIntoView !== 'function') return false;
    active.scrollIntoView({ block: 'nearest' });
    return true;
  } catch (_error) {
    return false;
  }
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

function readCourseResponse(viewKey) {
  if (typeof readLogicalResponse === 'function') {
    try {
      return readLogicalResponse(viewKey);
    } catch (_error) { /* fall through to legacy direct read */ }
  }
  try {
    const flat = JSON.parse(localStorage.getItem(STORAGE_KEYS.activityResponses) || '{}') || {};
    return typeof flat[viewKey] === 'string' ? flat[viewKey] : '';
  } catch (_error) {
    return '';
  }
}

// R03: autosave debounce (spec S-06). Keystrokes queue per key and commit
// once after 800ms of quiet; explicit saves, navigation (via saveJson),
// visibility loss, and unload flush synchronously. Draft state never
// claims a submission.
const AUTOSAVE_DEBOUNCE_MS = 800;
const debouncedDrafts = new Map();
const debouncedTimers = new Map();

function queueDebouncedDraft(key, value, contentVersion) {
  debouncedDrafts.set(key, { value, contentVersion: contentVersion || null });
  if (debouncedTimers.has(key)) clearTimeout(debouncedTimers.get(key));
  debouncedTimers.set(key, setTimeout(() => {
    debouncedTimers.delete(key);
    const pending = debouncedDrafts.get(key);
    debouncedDrafts.delete(key);
    if (pending) saveActivityResponse(key, pending.value, pending.contentVersion);
  }, AUTOSAVE_DEBOUNCE_MS));
}

function flushDebouncedDrafts() {
  for (const [key, timer] of debouncedTimers) clearTimeout(timer);
  debouncedTimers.clear();
  for (const [key, pending] of debouncedDrafts) saveActivityResponse(key, pending.value, pending.contentVersion);
  debouncedDrafts.clear();
}

function saveActivityResponse(key, value, contentVersion) {
  let result = { ok: true };
  if (storeAvailable() && contentVersion && typeof AB30Store.writeDraft === 'function') {
    result = AB30Store.writeDraft({ id: key, contentVersion, sourceIds: [], stimulusId: '' }, value) || { ok: true };
  } else if (typeof writeLogicalResponse === 'function') {
    try {
      result = writeLogicalResponse(key, value) || { ok: true };
    } catch (_error) {
      result = { ok: false, code: 'write-failed' };
    }
  } else {
    // R02: no competing flat writer. Without the store adapter the write
    // queues in memory (flushed when the adapter returns) instead of
    // forking a second activity format that migration would fight.
    result = { ok: false, code: 'store-missing' };
  }
  if (result && result.ok) pendingWrites.delete(key);
  else pendingWrites.set(key, value);
  refreshSaveStatus();
  return result;
}

function flushPendingWrites() {
  if (pendingWrites.size === 0) return { ok: true, retried: 0 };
  if (typeof writeLogicalResponse !== 'function') return { ok: false, code: 'adapter-missing', retried: 0 };
  let retried = 0;
  for (const [key, value] of Array.from(pendingWrites.entries())) {
    retried += 1;
    let result = null;
    try {
      result = writeLogicalResponse(key, value);
    } catch (_error) {
      result = { ok: false, code: 'write-failed' };
    }
    if (result && result.ok) pendingWrites.delete(key);
    else return { ok: false, code: (result && result.code) || 'write-failed', retried };
  }
  refreshSaveStatus();
  return { ok: true, retried };
}

function saveStateWord() {
  try {
    if (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.status === 'function') {
      const state = AB30Store.status().state;
      if (state === 'saved') return 'saved';
      if (state === 'saving' || state === 'unsaved' || state === 'ready') return 'unsaved changes';
      return 'save issue — see save status';
    }
  } catch (_error) { /* fall through */ }
  return 'saved locally';
}

function refreshSaveStatus() {
  let status = { state: 'ready', text: 'Save status.', conflicts: 0, revision: 0, mode: 'unknown' };
  try {
    if (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.status === 'function') {
      status = AB30Store.status();
    } else if (storeBoot && !storeBoot.ok) {
      status = { state: 'save-failed', text: 'Save failed — keep this page open and export your work', conflicts: 0, revision: 0, mode: storeBoot.mode || 'unknown' };
    }
  } catch (_error) {
    status = { state: 'save-failed', text: 'Save failed — keep this page open and export your work', conflicts: 0, revision: 0, mode: 'unknown' };
  }
  if (storeSaveException) status = { ...status, state: 'save-failed', text: 'Save failed — keep this page open and export your work' };
  if (typeof document === 'undefined' || !document.querySelectorAll) return status;
  document.querySelectorAll('[data-activity-save-status]').forEach((node) => {
    node.dataset.saveState = status.state;
    if (status.conflicts > 0) node.dataset.conflictCount = String(status.conflicts);
    else delete node.dataset.conflictCount;
    node.dataset.storeRevision = String(status.revision || 0);
    node.dataset.storeMode = status.mode || 'unknown';
  });
  const announcer = typeof document.getElementById === 'function' ? document.getElementById('save-status-announcer') : null;
  if (announcer) {
    announcer.textContent = status.conflicts > 0
      ? `${status.text} ${status.conflicts} saved versions need your review.`
      : status.text;
  }
  return status;
}

function conflictOriginLabel(key) {
  const name = String(key || '');
  if (name.indexOf('written::') === 0) return 'Written assignment page';
  if (name.indexOf('assignment-draft::') === 0) return 'Lesson draft box';
  if (name.indexOf('theme-1-online-booklet::assignment-') === 0) return 'Lesson pages';
  if (name.indexOf('theme-1-online-booklet::q') === 0) return 'Lesson question';
  if (name.indexOf('local:') === 0) return 'Current saved work';
  if (name.indexOf('import:') === 0) return 'Imported file';
  return name || 'Saved version';
}

function storeConflictsForKeys(viewKeys) {
  if (typeof AB30Store === 'undefined' || !AB30Store || typeof AB30Store.conflicts !== 'function') return [];
  let conflicts = [];
  try {
    conflicts = AB30Store.conflicts();
  } catch (_error) {
    return [];
  }
  const wanted = new Set();
  viewKeys.forEach((viewKey) => {
    if (typeof AB30Store.aliases !== 'undefined' && AB30Store.aliases) {
      for (const alias of AB30Store.aliases) {
        if (alias.legacyKeys.indexOf(viewKey) !== -1) wanted.add(`assignment:${alias.assignmentId}`);
      }
    }
    wanted.add(viewKey);
  });
  const seen = new Set();
  return conflicts.filter((conflict) => {
    if (!wanted.has(conflict.recordId) || seen.has(conflict.id)) return false;
    seen.add(conflict.id);
    return true;
  });
}

function renderConflictPanelsForKeys(viewKeys) {
  const conflicts = storeConflictsForKeys(viewKeys);
  if (!conflicts.length) return '';
  return conflicts.map((conflict) => {
    const versions = conflict.candidates.map((candidate, index) => `
      <div class="conflict-version">
        <p class="conflict-version-label">Version ${index === 0 ? 'A' : 'B'} — ${escapeHtml(conflictOriginLabel(candidate.key))}</p>
        <p class="conflict-version-text">${escapeHtml(candidate.value) || '<em>Empty.</em>'}</p>
        <button type="button" class="secondary-button" data-resolve-conflict="${escapeHtml(conflict.id)}" data-resolve-mode="${index === 0 ? 'keep-first' : 'keep-second'}">Keep this version</button>
      </div>
    `).join('');
    return `
      <div class="conflict-panel" data-conflict-panel="${escapeHtml(conflict.id)}">
        <p><strong>Two saved versions need your review.</strong> Nothing is lost — read both, then keep one or combine them.</p>
        <div class="conflict-versions">${versions}</div>
        <label class="conflict-merge">Or combine them into one response:
          <textarea data-merge-text="${escapeHtml(conflict.id)}" rows="4"></textarea>
        </label>
        <button type="button" class="secondary-button" data-resolve-conflict="${escapeHtml(conflict.id)}" data-resolve-mode="merged">Use combined text</button>
      </div>
    `;
  }).join('');
}

function renderWorkExportControls() {
  return `
    <span class="work-export-row">
      <button type="button" class="secondary-button" data-export-work>Export my work</button>
      <label class="secondary-button work-import-label">Import work<input type="file" data-import-work accept=".json,application/json" hidden /></label>
    </span>
  `;
}

function refreshRecordEditors(candidateKeys) {
  if (typeof document === 'undefined' || !document.querySelectorAll) return;
  candidateKeys.forEach((key) => {
    const text = readCourseResponse(key);
    document.querySelectorAll(`[data-activity-response="${CSS.escape(key)}"]`).forEach((field) => {
      if (field.type === 'radio') {
        field.checked = field.value === text;
      } else if ('value' in field) {
        field.value = text;
        autoGrowActivityTextarea(field);
      }
    });
    if (key.indexOf('written::') === 0) {
      const assignmentId = key.slice('written::'.length);
      const keyed = document.querySelectorAll(`[data-written-key="${CSS.escape(key)}"]`);
      const targets = keyed.length ? keyed
        : document.querySelectorAll(`[data-written-response="${CSS.escape(assignmentId)}"]`);
      targets.forEach((field) => {
        field.value = text;
        updateWrittenCount(field);
      });
    }
  });
}

function downloadWorkExport() {
  if (typeof AB30Store === 'undefined' || !AB30Store || typeof AB30Store.exportWork !== 'function') return false;
  try {
    const pack = AB30Store.exportWork();
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aboriginal-studies-30-my-work.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (_error) {
    return false;
  }
}

function importWorkFromFile(file) {
  if (!file || typeof AB30Store === 'undefined' || !AB30Store) return;
  // Refuse to apply an import while unsaved writing is unconfirmed: the
  // re-render after import must never wipe text that only exists in the DOM.
  const pending = flushPendingWrites();
  let flushed = { ok: true };
  try {
    flushed = AB30Store.flush();
  } catch (_error) {
    flushed = { ok: false };
  }
  if (!pending.ok || !flushed.ok) {
    refreshSaveStatus();
    const announcer = document.getElementById('save-status-announcer');
    if (announcer) announcer.textContent = 'Could not confirm your saved work. Export your work first, then try importing again.';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const pack = JSON.parse(String(reader.result || ''));
      const result = AB30Store.importWork(pack);
      if (!result.ok) {
        refreshSaveStatus();
        return;
      }
      render();
    } catch (_error) {
      refreshSaveStatus();
    }
  };
  reader.readAsText(file);
}

// ---- T20 work collection + evidence export. Built on exportWork() (never a
// parallel store): groups canonical drafts/submissions/revisions/conflicts by
// theme/lesson/assignment, links back to tasks, and exports prompt/source
// context with saved responses. Deliberately EXCLUDES key material (item keys,
// accepted answers, feedback/criteria/model text are never collected here —
// ASSET04). Submission honesty: this course has no LMS hand-in, so every item
// is labelled local-only; no teacher-reviewed/mastery claim is ever emitted
// (COMP06).
function evidenceLessonHome(promptId) {
  for (const unit of units) {
    for (const lesson of (unit.lessons || [])) {
      if ((lesson.bookletQuestionIds || []).includes(promptId)) {
        return {
          unitId: unit.id,
          unitTitle: unit.title || unit.id,
          lessonId: lesson.id,
          lessonTitle: lesson.title || lesson.id,
          href: lessonRouteHref(unit.id, lesson.id),
          textbook: (lesson.textbook && lesson.textbook.label) || ''
        };
      }
    }
  }
  return null;
}

function evidenceLessonById(lessonId) {
  for (const unit of units) {
    const lesson = (unit.lessons || []).find((item) => item && item.id === lessonId);
    if (lesson) {
      return {
        unitId: unit.id,
        unitTitle: unit.title || unit.id,
        lessonId: lesson.id,
        lessonTitle: lesson.title || lesson.id,
        href: lessonRouteHref(unit.id, lesson.id),
        textbook: (lesson.textbook && lesson.textbook.label) || ''
      };
    }
  }
  return null;
}

function evidencePromptById(activityId, promptId) {
  const activity = (themeActivities || []).find((item) => item && item.id === activityId) || null;
  if (!activity) return { activity: null, prompt: null };
  for (const section of (activity.sections || [])) {
    const prompt = (section.prompts || []).find((item) => item && item.id === promptId) || null;
    if (prompt) return { activity, prompt, section };
  }
  return { activity, prompt: null, section: null };
}

function evidenceSubfieldLabel(prompt, sub) {
  if (!sub) return '';
  const parts = String(sub).split('.');
  if (prompt && (prompt.kind === 'table' || prompt.kind === 'fillBlank') && parts.length === 2) {
    const rows = prompt.kind === 'table' ? (prompt.rows || []) : [{ id: parts[0] }];
    const columns = prompt.kind === 'table'
      ? (prompt.columns || [])
      : (((prompt.blanks || []).length ? prompt.blanks : [{ id: parts[1] }]));
    const row = rows.find((item) => tableFieldId(item) === parts[0]);
    const column = columns.find((item) => tableFieldId(item) === parts[1]);
    if (row || column) {
      return [row ? tableFieldLabel(row) : parts[0], column ? tableFieldLabel(column) : parts[1]]
        .filter(Boolean).join(' / ');
    }
  }
  return String(sub);
}

function resolveEvidenceRecord(record) {
  const origins = (record && Array.isArray(record.origins) && record.origins.length)
    ? record.origins.map((origin) => String((origin && origin.key) || ''))
    : [String((record && record.id) || '')];
  const viewKey = origins[0] || '';
  const base = {
    recordId: String((record && record.id) || ''),
    viewKeys: origins,
    draft: String((record && record.draft) || ''),
    revision: (record && typeof record.revision === 'number') ? record.revision : 0,
    contentVersion: String((record && record.contentVersion) || ''),
    submission: 'local-only'
  };
  if (viewKey.indexOf('written::') === 0) {
    const assignmentId = viewKey.slice('written::'.length);
    const assignment = (assignments || []).find((item) => item && item.id === assignmentId) || null;
    return {
      ...base, kind: 'written', assignmentId,
      title: assignment ? (assignment.title || assignmentId) : assignmentId,
      href: `?section=assignment&assignment=${encodeURIComponent(assignmentId)}`,
      role: roleForRequirement(`assignment:${assignmentId}`),
      status: base.draft.trim() ? 'fields-complete' : 'not-started',
      links: (assignment && assignment.links) || []
    };
  }
  if (viewKey.indexOf('assignment-draft::') === 0) {
    const assignmentId = viewKey.slice('assignment-draft::'.length);
    const assignment = (assignments || []).find((item) => item && item.id === assignmentId) || null;
    return {
      ...base, kind: 'draft', assignmentId,
      title: assignment ? `Draft: ${assignment.title || assignmentId}` : `Draft: ${assignmentId}`,
      href: `?section=assignment&assignment=${encodeURIComponent(assignmentId)}`,
      role: 'formative',
      status: base.draft.trim() ? 'fields-complete' : 'not-started',
      links: []
    };
  }
  const sep = viewKey.indexOf('::');
  if (sep > 0) {
    const activityId = viewKey.slice(0, sep);
    const rest = viewKey.slice(sep + 2);
    const dot = rest.indexOf('.');
    const promptId = dot >= 0 ? rest.slice(0, dot) : rest;
    const sub = dot >= 0 ? rest.slice(dot + 1) : '';
    const found = evidencePromptById(activityId, promptId);
    if (found.prompt) {
      const home = evidenceLessonHome(promptId);
      const completion = getPromptCompletion(found.activity, found.prompt);
      return {
        ...base, kind: 'booklet', activityId, promptId, subfield: sub,
        subfieldLabel: evidenceSubfieldLabel(found.prompt, sub),
        title: found.prompt.number ? `Q${found.prompt.number}: ${found.prompt.label || ''}` : (found.prompt.label || promptId),
        promptLabel: String(found.prompt.label || ''),
        promptKind: String(found.prompt.kind || ''),
        href: home ? home.href : '',
        home,
        role: roleForRequirement(`booklet:${activityId}:${promptId}`),
        status: completion.status,
        links: []
      };
    }
    const lessonHome = evidenceLessonById(activityId);
    if (lessonHome) {
      return {
        ...base, kind: 'formative', activityId, promptId, subfield: sub,
        title: `Formative: ${promptId}`,
        href: lessonHome.href,
        home: lessonHome,
        role: 'formative',
        status: base.draft.trim() ? 'fields-complete' : 'not-started',
        links: []
      };
    }
  }
  if (base.recordId.indexOf('assignment:') === 0) {
    const assignmentId = base.recordId.slice('assignment:'.length);
    const assignment = (assignments || []).find((item) => item && item.id === assignmentId) || null;
    return {
      ...base, kind: 'written', assignmentId,
      title: assignment ? (assignment.title || assignmentId) : assignmentId,
      href: `?section=assignment&assignment=${encodeURIComponent(assignmentId)}`,
      role: roleForRequirement(`assignment:${assignmentId}`),
      status: base.draft.trim() ? 'fields-complete' : 'not-started',
      links: (assignment && assignment.links) || [],
      migrated: origins.length > 1
    };
  }
  return { ...base, kind: 'unmapped', title: viewKey || base.recordId, href: '', role: 'formative', status: base.draft.trim() ? 'fields-complete' : 'not-started', links: [] };
}

function collectWorkEvidence() {
  const pack = (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.exportWork === 'function')
    ? AB30Store.exportWork()
    : { activity: { records: {}, attempts: [], conflicts: [] }, ui: {} };
  const activity = (pack && pack.activity) || {};
  const ui = (pack && pack.ui) || {};
  const records = (activity.records && typeof activity.records === 'object') ? activity.records : {};
  const attempts = Array.isArray(activity.attempts) ? activity.attempts : [];
  const conflicts = Array.isArray(activity.conflicts) ? activity.conflicts : [];
  // R02: practice domain lives in the activity envelope; tolerate legacy
  // packs that still carry it under ui (unmigrated imports/exports).
  const practice = (activity.practice && typeof activity.practice === 'object') ? activity.practice : {};
  const runs = (practice.runs && typeof practice.runs === 'object') ? practice.runs
    : ((ui.practiceRuns && typeof ui.practiceRuns === 'object') ? ui.practiceRuns : {});
  const exposed = (practice.exposure && typeof practice.exposure === 'object') ? practice.exposure
    : ((ui.practiceExposed && typeof ui.practiceExposed === 'object') ? ui.practiceExposed : {});
  const items = Object.keys(records).map((id) => resolveEvidenceRecord(records[id]));
  // R03: join durable submissions (first + revisions) onto their records.
  const submissionsByRecord = new Map();
  for (const sub of (Array.isArray(activity.submissions) ? activity.submissions : [])) {
    const rid = String((sub && sub.recordId) || '');
    if (!submissionsByRecord.has(rid)) submissionsByRecord.set(rid, []);
    submissionsByRecord.get(rid).push({
      id: String((sub && sub.id) || ''),
      text: String((sub && sub.text) || ''),
      parentAttemptId: (sub && sub.parentAttemptId) || null,
      evidenceKind: String((sub && sub.evidenceKind) || ''),
      contentVersion: String((sub && sub.task && sub.task.contentVersion) || ''),
      observedAt: (sub && sub.observedAt) || null
    });
  }
  for (const item of items) item.submissions = submissionsByRecord.get(item.recordId) || [];
  const groups = [];
  const groupIndex = new Map();
  for (const item of items) {
    const home = item.home || null;
    const groupKey = home ? `${home.unitId}::${home.lessonId}` : (item.assignmentId ? `assignment::${item.assignmentId}` : 'other');
    if (!groupIndex.has(groupKey)) {
      groupIndex.set(groupKey, groups.length);
      groups.push({
        key: groupKey,
        unitId: home ? home.unitId : null,
        unitTitle: home ? home.unitTitle : (item.assignmentId ? 'Assignments' : 'Other work'),
        lessonId: home ? home.lessonId : null,
        lessonTitle: home ? home.lessonTitle : (item.title || ''),
        href: home ? home.href : (item.href || ''),
        textbook: home ? home.textbook : '',
        items: []
      });
    }
    groups[groupIndex.get(groupKey)].items.push(item);
  }
  const runByAttempt = new Map();
  for (const runId of Object.keys(runs)) {
    const run = runs[runId] || {};
    const attemptIds = run.attemptIds || {};
    for (const taskId of Object.keys(attemptIds)) {
      for (const attemptId of (attemptIds[taskId] || [])) runByAttempt.set(attemptId, runId);
    }
  }
  const practiceAttempts = attempts.map((attempt) => {
    const taskId = String((attempt && attempt.taskId) || '');
    const itemId = taskId.indexOf('practice:') === 0 ? taskId.split(':').slice(2).join(':') : '';
    return {
      id: String((attempt && attempt.id) || ''),
      taskId,
      contentVersion: String((attempt && attempt.contentVersion) || ''),
      response: String((attempt && attempt.response) || ''),
      optionOrder: Array.isArray(attempt && attempt.optionOrder) ? attempt.optionOrder.slice() : [],
      selectedOptions: Array.isArray(attempt && attempt.selectedOptions) ? attempt.selectedOptions.slice() : [],
      role: String((attempt && attempt.role) || 'first'),
      revisionOf: (attempt && attempt.revisionOf) || null,
      reviewState: String((attempt && attempt.reviewState) || ''),
      runId: runByAttempt.get(String((attempt && attempt.id) || '')) || null,
      exposed: itemId && exposed[itemId] ? exposed[itemId].slice() : [],
      submission: 'local-only'
    };
  });
  const practiceRuns = Object.keys(runs).map((runId) => {
    const run = runs[runId] || {};
    const attemptIds = run.attemptIds || {};
    const answered = Object.keys(attemptIds).filter((taskId) => (attemptIds[taskId] || []).length).length;
    return {
      id: runId,
      mode: String(run.mode || ''),
      attemptMode: String(run.attemptMode || ''),
      status: String(run.status || ''),
      itemCount: Array.isArray(run.itemIds) ? run.itemIds.length : 0,
      answeredCount: answered
    };
  });
  const conflictItems = conflicts.map((conflict) => {
    const recordId = String((conflict && conflict.recordId) || '');
    const record = records[recordId] || null;
    return {
      id: String((conflict && conflict.id) || ''),
      recordId,
      status: String((conflict && conflict.status) || ''),
      candidateCount: Array.isArray(conflict && conflict.candidates) ? conflict.candidates.length : 0,
      recordTitle: record ? (resolveEvidenceRecord(record).title || recordId) : recordId,
      resolution: (conflict && conflict.resolution && conflict.resolution.choice) || null
    };
  });
  return {
    format: 'ab30-evidence-v1',
    groups,
    practice: { runs: practiceRuns, attempts: practiceAttempts },
    conflicts: conflictItems,
    counts: {
      records: items.length,
      filledRecords: items.filter((item) => item.draft.trim()).length,
      attempts: practiceAttempts.length,
      runs: practiceRuns.length,
      unresolvedConflicts: conflictItems.filter((item) => item.status === 'unresolved').length
    }
  };
}

function evidenceStatusLabel(status) {
  if (status === 'fields-complete') return 'Complete fields';
  if (status === 'partial') return 'Partially filled';
  if (status === 'needs-review') return 'Needs review';
  return 'Not started';
}

function renderEvidenceGroups(evidence) {
  const groups = (evidence && Array.isArray(evidence.groups)) ? evidence.groups : [];
  if (!groups.length) {
    return '<p class="mywork-empty">No saved work yet. Your booklet answers, assignment drafts, formative writing, and practice attempts will collect here as you save them.</p>';
  }
  return groups.map((group) => `
    <section class="mywork-group" aria-label="${escapeHtml(group.lessonTitle || group.unitTitle || 'Work group')}">
      <h3>${group.href ? `<a href="${escapeHtml(group.href)}">${escapeHtml(group.lessonTitle || '')}</a>` : escapeHtml(group.lessonTitle || '')}</h3>
      ${group.unitTitle ? `<p class="mywork-unit">${escapeHtml(group.unitTitle)}${group.textbook ? ` · ${escapeHtml(group.textbook)}` : ''}</p>` : ''}
      <ul class="mywork-items">
        ${(group.items || []).map((item) => `
          <li class="mywork-item">
            <div class="mywork-item-head">
              ${item.href ? `<a href="${escapeHtml(item.href)}">${escapeHtml(item.title || '')}</a>` : `<span>${escapeHtml(item.title || '')}</span>`}
              <span class="mywork-chip" data-role="${escapeHtml(item.role || '')}">${escapeHtml(item.role === 'legacyAssigned' ? 'Assigned' : 'Formative')}</span>
              <span class="mywork-chip" data-status="${escapeHtml(item.status || '')}">${escapeHtml(evidenceStatusLabel(item.status))}</span>
              <span class="mywork-chip" data-submission="local-only">Local only</span>
            </div>
            ${item.subfieldLabel ? `<p class="mywork-sub">Field: ${escapeHtml(item.subfieldLabel)}</p>` : ''}
            <blockquote class="mywork-draft">${escapeHtml(item.draft || '—')}</blockquote>
            ${renderEvidenceSubmissions(item.submissions)}
            <p class="mywork-meta">Revision ${Number(item.revision) || 0}${item.contentVersion ? ` · ${escapeHtml(item.contentVersion)}` : ''}</p>
          </li>
        `).join('')}
      </ul>
    </section>
  `).join('');
}

function renderEvidenceSubmissions(submissions) {
  if (!Array.isArray(submissions) || !submissions.length) return '';
  let revisionNumber = 0;
  return submissions.map((sub) => {
    const isFirst = !sub.parentAttemptId;
    if (!isFirst) revisionNumber += 1;
    const label = isFirst ? 'First submission' : `Revision ${revisionNumber}`;
    const kind = sub.evidenceKind === 'review' ? ' · written after comparing criteria'
      : sub.evidenceKind === 'unknown' ? ' · comparison state unknown'
      : sub.evidenceKind === 'first-before-comparison' ? ' · written before comparing criteria' : '';
    return `
            <p class="mywork-sub">${escapeHtml(label)}${escapeHtml(kind)}${sub.contentVersion ? ` · ${escapeHtml(sub.contentVersion)}` : ''}</p>
            <blockquote class="mywork-draft">${escapeHtml(sub.text || '—')}</blockquote>`;
  }).join('');
}

function renderEvidencePractice(evidence) {
  const practice = (evidence && evidence.practice) || { runs: [], attempts: [] };
  const runs = practice.runs || [];
  const attempts = practice.attempts || [];
  if (!runs.length && !attempts.length) return '';
  return `
    <section class="mywork-group" aria-label="Practice attempts">
      <h3>Practice attempts</h3>
      ${runs.map((run) => `
        <p class="mywork-run">${escapeHtml(run.mode || '')} · ${escapeHtml(run.attemptMode || '')} · ${escapeHtml(run.status || '')} · ${Number(run.answeredCount) || 0}/${Number(run.itemCount) || 0} answered</p>
      `).join('')}
      <ul class="mywork-items">
        ${attempts.map((attempt) => `
          <li class="mywork-item">
            <div class="mywork-item-head">
              <span>${escapeHtml(attempt.taskId || '')}</span>
              <span class="mywork-chip">${escapeHtml(attempt.role || '')}</span>
              <span class="mywork-chip">${escapeHtml(attempt.reviewState || '')}</span>
              <span class="mywork-chip" data-submission="local-only">Local only</span>
            </div>
            ${attempt.response ? `<blockquote class="mywork-draft">${escapeHtml(attempt.response)}</blockquote>` : ''}
            ${(attempt.selectedOptions || []).length ? `<p class="mywork-meta">Selected: ${attempt.selectedOptions.map(escapeHtml).join(', ')}</p>` : ''}
            ${(attempt.exposed || []).length ? `<p class="mywork-meta">Model shown for this item before or with this attempt.</p>` : ''}
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderEvidenceConflicts(evidence) {
  const conflicts = (evidence && Array.isArray(evidence.conflicts)) ? evidence.conflicts : [];
  if (!conflicts.length) return '';
  return `
    <section class="mywork-group" aria-label="Conflicts">
      <h3>Conflicts</h3>
      <ul class="mywork-items">
        ${conflicts.map((conflict) => `
          <li class="mywork-item">
            <div class="mywork-item-head">
              <span>${escapeHtml(conflict.recordTitle || conflict.recordId || '')}</span>
              <span class="mywork-chip" data-status="${escapeHtml(conflict.status || '')}">${escapeHtml(conflict.status || '')}</span>
            </div>
            <p class="mywork-meta">${Number(conflict.candidateCount) || 0} saved versions${conflict.resolution ? ` · resolved: ${escapeHtml(conflict.resolution)}` : ' · resolve it where the question lives'}</p>
          </li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderMyWork() {
  const evidence = collectWorkEvidence();
  const counts = evidence.counts || {};
  refs.contentBody.innerHTML = `
    <section class="course-page mywork-page">
      <header class="social-overview-hero">
        <p class="course-kicker">Aboriginal Studies 30</p>
        <h2>All my work</h2>
        <p>${Number(counts.filledRecords) || 0} saved responses · ${Number(counts.attempts) || 0} practice attempts${Number(counts.unresolvedConflicts) ? ` · ${counts.unresolvedConflicts} conflicts need review` : ''}</p>
        <p class="mywork-honesty">Everything here lives in this browser only. Nothing is submitted to a host or teacher until you export or hand it in yourself.</p>
      </header>
      <div class="mywork-toolbar no-print">
        ${renderWorkExportControls()}
        <button type="button" class="secondary-button" data-export-evidence>Download evidence (with prompts)</button>
        <button type="button" class="secondary-button" data-print-work>Print all my work</button>
      </div>
      <div class="mywork-evidence">
        ${renderEvidenceGroups(evidence)}
        ${renderEvidencePractice(evidence)}
        ${renderEvidenceConflicts(evidence)}
      </div>
    </section>
  `;
  refs.contentBody.querySelector('[data-export-evidence]')?.addEventListener('click', () => {
    downloadEvidencePack();
  });
  refs.contentBody.querySelector('[data-print-work]')?.addEventListener('click', () => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') window.print();
  });
  refs.contentBody.querySelector('[data-export-work]')?.addEventListener('click', () => {
    downloadWorkExport();
  });
  refs.contentBody.querySelector('[data-import-work]')?.addEventListener('change', (event) => {
    const file = event.target && event.target.files ? event.target.files[0] : null;
    if (file) importWorkFromFile(file);
  });
}

function downloadEvidencePack() {
  try {
    const evidence = collectWorkEvidence();
    const blob = new Blob([JSON.stringify(evidence, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'aboriginal-studies-30-evidence.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
  } catch (_error) {
    return false;
  }
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
  // T06: course progress counts fields-complete legacy requirements — never a
  // mastery claim, and never 100% from flags alone. Manual Mark Complete flags
  // persist (locks still read them) and display as legacy self-report.
  const { done, total } = requirementTotals();
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const selfReported = (progress.completedUnits || []).length;
  if (refs.progressFill) refs.progressFill.style.width = `${percent}%`;
  if (refs.progressPercent) refs.progressPercent.textContent = `${percent}%`;
  if (refs.progressCount) {
    refs.progressCount.textContent = selfReported > 0
      ? `${done} / ${total} requirements · ${selfReported} self-reported`
      : `${done} / ${total} requirements`;
  }
  const inline = document.querySelector('[data-progress-count-inline]');
  if (inline) inline.textContent = `${done}/${total}`;
}

function renderThemeSubnav() {
  if (!refs.themeSubnav) return;
  const expanded = new Set(Array.from(refs.themeSubnav.querySelectorAll('details[open][data-theme-nav]')).map((node) => node.dataset.themeNav));
  refs.themeSubnav.innerHTML = units.map((unit) => {
    const locked = !isUnitUnlocked(unit.id);
    const isActiveUnit = (state.section === 'unit' || state.section === 'lesson') && state.activeUnitId === unit.id;
    const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
    const themeTitle = unit.title.replace(/^Theme\s+\d+\s*[-–:]\s*/i, '');
    const overviewActive = isActiveUnit && state.section === 'unit';
    return `
      <details class="nav-theme" data-theme-nav="${escapeHtml(unit.id)}"${isActiveUnit || expanded.has(unit.id) ? ' open' : ''}>
        <summary><span>Theme ${getUnitNumber(unit.id)}</span>${escapeHtml(themeTitle)}</summary>
        <div class="nav-theme-contents lesson-nav-group">
          <button type="button" class="nav-link${overviewActive ? ' active' : ''}" data-unit-id="${escapeHtml(unit.id)}" ${locked ? 'disabled' : ''}${overviewActive ? ' aria-current="page"' : ''}>Theme overview</button>
          ${lessons.map((lesson, lessonIndex) => {
            const current = isActiveUnit && state.section === 'lesson' && state.activeLessonId === lesson.id;
            return locked ? `<span class="nav-link nav-locked">${lessonIndex + 1}. ${escapeHtml(lesson.title)}</span>` : `
              <a class="nav-link nav-lesson-link${current ? ' active' : ''}" href="${lessonRouteHref(unit.id, lesson.id)}" data-lesson-link="${escapeHtml(unit.id)}::${escapeHtml(lesson.id)}" data-testid="${current ? 'active-lesson-link' : `lesson-nav-${lesson.id}`}"${current ? ' aria-current="page"' : ''}>${lessonIndex + 1}. ${escapeHtml(lesson.title)}</a>`;
          }).join('')}
        </div>
      </details>`;
  }).join('');
  refs.themeSubnav.querySelectorAll('[data-unit-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveUnit(button.dataset.unitId));
  });
}

function setActiveNav() {
  const navMap = {
    home: refs.navHome,
    unit: null,
    quizzes: refs.navQuizzes,
    assignments: refs.navAssignments,
    assignment: refs.navAssignments,
    library: refs.navLibrary,
    film: refs.navFilm,
    vocabulary: refs.navVocabulary,
    mywork: refs.navMywork
  };
  for (const button of [refs.navHome, refs.navQuizzes, refs.navAssignments, refs.navLibrary, refs.navFilm, refs.navVocabulary, refs.navMywork]) {
    button?.classList.remove('active');
    button?.removeAttribute('aria-current');
  }
  if (navMap[state.section]) {
    navMap[state.section].classList.add('active');
    navMap[state.section].setAttribute('aria-current', 'page');
    const group = navMap[state.section].closest('details');
    if (group) group.open = true;
  }
  renderThemeSubnav();
  revealActiveNavLink();
}

function renderHome() {
  const totals = requirementTotals();
  const nextUnit = units.find((unit) => !isUnitComplete(unit.id) && isUnitUnlocked(unit.id)) || units[0];
  const singleThemeCourse = units.length === 1;
  const soleTheme = singleThemeCourse ? units[0] : null;
  refs.contentBody.innerHTML = `
    <section class="course-page">
      <header class="social-overview-hero">
        <p class="course-kicker">${escapeHtml(DATA.course.title || 'Aboriginal Studies 30')}</p>
        <h2>Course Overview</h2>
        <p>${singleThemeCourse
          ? `This course focuses on ${escapeHtml(soleTheme.title)}. Work through its lessons, readings, videos, booklet, and assignments using the resources collected here.`
          : 'Work through four themes on rights, land claims, society, and world issues. Open chapters and videos, complete the online booklets, and use the library and film room along the way.'}</p>
        <div class="hero-meta">
          <span><strong data-progress-count-inline>${totals.done}/${totals.total}</strong> requirements complete</span>
          <span>${units.length} ${units.length === 1 ? 'theme' : 'themes'}</span>
          <span>${assignments.filter((assignment) => !BOOKLET_SHELL_ASSIGNMENT_IDS.has(assignment.id)).length} assignments</span>
        </div>
      </header>
      <section class="social-overview-section">
        <h3>${singleThemeCourse ? 'Start this theme' : 'Start your next theme'}</h3>
        <p>${singleThemeCourse ? 'Begin with the theme overview, then follow the lessons in order.' : 'Themes unlock in order.'} Watch the save status while you work in this browser.</p>
        ${nextUnit ? `<button type="button" class="lesson-jump primary" data-unit-id="${escapeHtml(nextUnit.id)}">Begin ${escapeHtml(nextUnit.code)}</button>` : ''}
      </section>
      <section class="social-overview-section">
        <h3>Your theme route</h3>
        <div class="social-roadmap">
          ${units.map((unit) => {
            const locked = !isUnitUnlocked(unit.id);
            const complete = isUnitComplete(unit.id);
            return `
              <button type="button" data-unit-id="${escapeHtml(unit.id)}" ${locked ? 'disabled' : ''}>
                <span>${getUnitNumber(unit.id)}.</span>
                <strong>${escapeHtml(unit.title)}${complete ? ' — complete' : ''}</strong>
              </button>
            `;
          }).join('')}
        </div>
      </section>
      <section class="social-overview-section">
        <h3>How to use this course</h3>
        <ol>
          <li>${singleThemeCourse ? 'Work through the lessons in order from the sidebar or the route above.' : 'Work through the themes in order from the sidebar or the route above.'}</li>
          <li>Open the chapters, readings, and videos, then complete the online booklet.</li>
          <li>Use Assignments for hand-ins, Library for chapters and PDFs, and Film Room for videos.</li>
          <li>Use Mark Complete when the theme's work is finished.</li>
        </ol>
        <p>Your writing is kept in this browser when saving succeeds — watch the save status. Keep using the same browser and device to return to your saved work.</p>
      </section>
      <section class="social-overview-section">
        <h3>What counts as finished?</h3>
        <p>Complete the readings, videos, booklet questions, and assigned work, then mark the theme complete.</p>
      </section>
    </section>
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
  const unitNumber = getUnitNumber(unit.id);
  refs.contentBody.innerHTML = `
    <section class="course-page lesson-page">
      <header class="lesson-document-header">
        <p>Theme ${unitNumber} · ${escapeHtml(unit.code)}</p>
        <h2>${escapeHtml(unit.title)}</h2>
        <span>${escapeHtml(locked ? 'This theme unlocks after the previous theme is marked complete.' : unit.description)}</span>
      </header>
      <div class="lesson-reader-panel">
        ${state.themeTab === 'written' && themeAssignments(unit.id).length ? `
        <div class="written-assignments written-tab">
          <p class="page-intro">Everything needed to complete each assignment lives here: the full description and instructions, the marking rubric, a place to write, and any linked readings.</p>
          <div class="card-actions">
            <button type="button" class="secondary-button" data-theme-lessons>Back to ${escapeHtml(unit.title)} content</button>
            ${renderWorkExportControls()}
          </div>
          ${themeAssignments(unit.id).map((assignment) => renderWrittenAssignmentCard(assignment)).join('')}
        </div>
        ` : `
        <div class="goal-strip">
          <section>
            <h3>In this theme</h3>
            <p>Work through the lessons below, then complete the online booklet. Watch the save status while you work.</p>
          </section>
          <section>
            <h3>Status</h3>
            <p>${complete ? 'Completed.' : 'Not yet complete.'} Lessons ${(unit.lessons || []).length} · Booklet questions in the online booklet below.</p>
          </section>
        </div>
        ${renderThemeLessons(unit)}
        <article class="social-document">
          <div class="social-document-header">
            <p>Resources</p>
            <h3>Resources</h3>
            <span>${(unit.items || []).length} ${(unit.items || []).length === 1 ? 'resource' : 'resources'}</span>
          </div>
          <div class="social-document-body">
            <div class="resource-list">
              ${(unit.items || []).map((item) => renderResourceRow(item)).join('')}
            </div>
          </div>
        </article>
        ${renderUnitActivity(unit, locked)}
        `}
      </div>
      <div class="lesson-bottom-bar">
        <button type="button" id="back-to-units" class="lesson-jump">Back to Overview</button>
        <button type="button" id="mark-unit-complete" class="lesson-jump primary" ${locked || complete ? 'disabled' : ''}>${complete ? 'Completed' : 'Mark Complete'}</button>
      </div>
    </section>
  `;
  document.getElementById('back-to-units')?.addEventListener('click', () => setSection('home'));
  document.getElementById('mark-unit-complete')?.addEventListener('click', () => markUnitComplete(unit.id));
  bindActivityControls();
  bindWrittenWorkFields();
}

function renderLesson() {
  const resolved = resolveLessonRoute(state.activeUnitId, state.activeLessonId);
  if (!resolved.ok) {
    applyRouteToState({ ...resolved.fallback, unitId: resolved.fallback.unitId || null });
    saveJson(STORAGE_KEYS.ui, state);
    if (state.section === 'unit') renderUnit();
    else renderHome();
    return;
  }
  const { unit, lesson, index } = resolved;
  const activity = getUnitActivity(unit.id);
  const { prevId, nextId } = lessonNeighbors(unit.id, lesson.id);
  const unitNumber = getUnitNumber(unit.id);
  const pagerButton = (targetId, label, rel) => targetId
    ? `<a class="lesson-jump" rel="${rel}" href="${lessonRouteHref(unit.id, targetId)}" data-lesson-link="${escapeHtml(unit.id)}::${escapeHtml(targetId)}">${label}</a>`
    : `<button type="button" class="lesson-jump" data-unit-id="${escapeHtml(unit.id)}">${label}</button>`;
  refs.contentBody.innerHTML = `
    <section class="course-page lesson-page">
      <p class="lesson-overview-return"><button type="button" class="lesson-jump" data-unit-id="${escapeHtml(unit.id)}">← Theme ${unitNumber} overview</button></p>
      ${renderLessonArticle(activity, lesson, index)}
      <nav class="lesson-pager" aria-label="Lesson navigation">
        ${pagerButton(prevId, prevId ? '← Previous lesson' : '← Theme overview', 'prev')}
        ${pagerButton(nextId, nextId ? 'Next lesson →' : 'Theme overview →', 'next')}
      </nav>
    </section>
  `;
  refs.contentBody.querySelectorAll('[data-unit-id]').forEach((button) => {
    button.addEventListener('click', () => setActiveUnit(button.dataset.unitId));
  });
  bindActivityControls();
  bindWrittenWorkFields();
}

let dialogReturnFocus = null;

function openCourseDialog({ kicker, title, bodyHtml, returnFocus }) {
  if (!refs.dialog) return;
  dialogReturnFocus = returnFocus || document.activeElement || null;
  refs.dialogKicker.textContent = kicker || 'Reader';
  refs.dialogTitle.textContent = title || 'Reader';
  refs.dialogBody.innerHTML = bodyHtml || '';
  if (typeof refs.dialog.showModal === 'function') {
    refs.dialog.showModal();
  }
  refs.dialogClose?.focus();
}

let sidebarCollapsedBeforeReader = null;

function restoreSidebarAfterReader() {
  if (sidebarCollapsedBeforeReader === false) {
    state.sidebarCollapsed = false;
    saveJson(STORAGE_KEYS.ui, state);
    applySidebarState();
  }
  sidebarCollapsedBeforeReader = null;
}

function handleDialogClose() {
  if (!refs.dialog) return;
  refs.dialogBody.innerHTML = '';
  restoreSidebarAfterReader();
  if (dialogReturnFocus && dialogReturnFocus.isConnected) {
    dialogReturnFocus.focus({ preventScroll: true });
  }
  dialogReturnFocus = null;
}

function closeCourseDialog() {
  if (!refs.dialog) return;
  if (typeof refs.dialog.close === 'function' && refs.dialog.open) {
    refs.dialog.close();
  }
  handleDialogClose();
}

function chapterFileName(file) {
  return String(file || '').split('/').pop() || '';
}

function chapterPdfPage(file, printedPage) {
  const start = chapterPrintedStarts[chapterFileName(file)];
  const page = Number(printedPage);
  if (!start || !Number.isInteger(page)) return 1;
  return Math.max(1, page - start + 1);
}

function lessonStartPage(lesson) {
  const label = String(lesson?.textbook?.label || '');
  const match = label.match(/pages?\s+(\d+)/i);
  return match ? Number(match[1]) : 1;
}

function openChapterViewer(file, printedPage, title, trigger) {
  const pdfPage = chapterPdfPage(file, printedPage);
  const src = `${file}#page=${pdfPage}`;
  // Reading mode: tuck the course sidebar away so the chapter page fills
  // the view. The prior state returns when the reader closes.
  sidebarCollapsedBeforeReader = isSidebarCollapsed();
  if (!sidebarCollapsedBeforeReader) {
    state.sidebarCollapsed = true;
    saveJson(STORAGE_KEYS.ui, state);
    applySidebarState();
  }
  openCourseDialog({
    kicker: 'Textbook reader',
    title: title || 'Chapter',
    returnFocus: trigger || null,
    bodyHtml: `
      <p class="dialog-note">Showing printed page ${escapeHtml(String(printedPage))}. Use the Library if the page looks off by a page or two.</p>
      <iframe class="chapter-frame" title="${escapeHtml(title || 'Chapter')}" src="${escapeHtml(src)}"></iframe>
      <div class="dialog-actions">
        <a class="lesson-jump" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer">Open in new tab</a>
      </div>
    `
  });
}

function findVocabularyTerm(term) {
  const needle = String(term || '').trim().toLowerCase();
  return coreVocabulary.find((entry) => String(entry.term || '').toLowerCase() === needle) || null;
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Wrap the first mention of each lesson key term in a clickable Bio-style
// term button. Placeholders keep later terms from matching inside the
// buttons (or data attributes) inserted for earlier, longer terms.
function linkLessonTerms(paragraph, terms) {
  let html = escapeHtml(paragraph);
  const usable = (Array.isArray(terms) ? terms : [])
    .map((item) => item && item.term)
    .filter((term) => term && findVocabularyTerm(term));
  usable.sort((a, b) => b.length - a.length);
  const slots = [];
  usable.forEach((term) => {
    const pattern = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i');
    const match = pattern.exec(html);
    if (!match) return;
    slots.push({ term, label: match[0] });
    html = `${html.slice(0, match.index)}\u0000${slots.length - 1}\u0001${html.slice(match.index + match[0].length)}`;
  });
  slots.forEach((slot, index) => {
    html = html.split(`\u0000${index}\u0001`).join(
      `<button type="button" class="bio-term" data-vocab-term="${escapeHtml(slot.term)}" aria-haspopup="dialog">${escapeHtml(slot.label)}</button>`
    );
  });
  return html;
}

function lessonTitleFor(unitId, lessonId) {
  const unit = units.find((item) => item.id === unitId);
  const lesson = (unit?.lessons || []).find((item) => item.id === lessonId);
  return { unit, lesson };
}

function openVocabularyViewer(term, trigger, focusSelect) {
  const entry = findVocabularyTerm(term);
  if (!entry) return;
  const { unit, lesson } = lessonTitleFor(entry.unitId, entry.lessonId);
  const enrich = vocabEnrichmentFor(entry.term);
  const parts = (enrich && Array.isArray(enrich.parts)) ? enrich.parts : [];
  openCourseDialog({
    kicker: `Core vocabulary · ${escapeHtml(unit?.title || 'Course')}`,
    title: entry.term,
    returnFocus: trigger || null,
    bodyHtml: `
      <label class="popup-word-select">Core Vocabulary
        <select id="course-dialog-word-select">
          ${coreVocabulary.map((option) => `<option value="${escapeHtml(option.term)}"${option.term === entry.term ? ' selected' : ''}>${escapeHtml(option.term)}</option>`).join('')}
        </select>
      </label>
      <article>
        <p class="vocab-meaning">${escapeHtml(entry.meaning || '')}</p>
      </article>
      ${parts.length ? `
        <dl class="word-parts">
          ${parts.map((part) => `
            <div>
              <dt>${escapeHtml(part[0] || '')}</dt>
              <dd>${escapeHtml(part[1] || '')}</dd>
            </div>
          `).join('')}
        </dl>
      ` : ''}
      <div class="dialog-actions">
        <button type="button" class="lesson-jump" data-goto-vocab="${escapeHtml(entry.term)}">Open in Core Vocabulary</button>
        ${lesson ? `<button type="button" class="lesson-jump primary" data-goto-lesson="${escapeHtml(entry.unitId)}::${escapeHtml(entry.lessonId)}">Open lesson</button>` : ''}
      </div>
    `
  });
  if (focusSelect) document.getElementById('course-dialog-word-select')?.focus();
}

function gotoLesson(unitId, lessonId) {
  setActiveLesson(unitId, lessonId);
}

// ---- T07: one lesson article per route. renderThemeLessons (unit overview)
// shows the map; renderLesson mounts exactly one article plus the pager.
// ---- T08 versioned teaching: v2 lessons (blocks array) render the goal strip
// plus block components; all other lessons keep the v1 body/example/check
// path byte-identical. contentVersion defaults to v1-legacy when absent.
function lessonContentVersion(lesson) {
  return (lesson && typeof lesson.contentVersion === 'string' && lesson.contentVersion)
    ? lesson.contentVersion
    : 'v1-legacy';
}

function isV2Lesson(lesson) {
  return !!lesson && Array.isArray(lesson.blocks) && lesson.blocks.length > 0;
}

function lessonBlocksApi() {
  return (typeof AB30LessonBlocks !== 'undefined' && AB30LessonBlocks) ? AB30LessonBlocks : null;
}

function renderV2GoalStrip(lesson) {
  const api = lessonBlocksApi();
  if (!api || !isV2Lesson(lesson)) return '';
  return api.renderGoalStrip({
    goal: lesson.goal,
    prerequisite: lesson.prerequisite,
    essentialQuestion: lesson.essentialQuestion
  });
}

function renderV2Blocks(lesson) {
  const api = lessonBlocksApi();
  if (!api || !isV2Lesson(lesson)) return '';
  return api.renderBlocks(lesson.blocks, {
    teacherVoice: true,
    lessonTitle: lesson.title,
    assignmentHref: (id) => `?section=assignment&assignment=${encodeURIComponent(id)}`,
    assignmentExists: (id) => assignments.some((item) => item.id === id),
    formativeResponse: (key) => readCourseResponse(key) || '',
    submissionsForTask: (key) => (storeAvailable() && AB30Store.submissionsForTask
      ? AB30Store.submissionsForTask(key) : []),
    practiceExposed: (itemId) => {
      const store = practiceStore();
      return !!(store && store.getPracticeExposure && store.getPracticeExposure()[itemId]);
    }
  });
}

// R05: per-lesson guide. V-04 steps adapted to the controls this lesson
// actually renders — no step may name a control the lesson lacks.
// R08: lesson-guide data-testid hook.
function renderLessonGuide(activity, lesson, v2) {
  const blocks = v2 && Array.isArray(lesson.blocks) ? lesson.blocks : [];
  const hasType = (type) => blocks.some((block) => block && block.type === type);
  const hasIndependentResponse = blocks.some((block) =>
    block && block.type === 'independentTask' &&
    typeof block.responseKey === 'string' && block.responseKey.trim());
  const hasQuestions = promptsForLesson(activity, lesson).length > 0;
  const steps = [];
  steps.push(v2
    ? 'Start with the reading below. Use the reading question to focus your attention, then work through the explanations and examples.'
    : 'Read the teaching and open the chapter at its page when the lesson uses it.');
  if (hasType('workedExample')) {
    steps.push('Follow the worked example: it completes the reasoning before you practise.');
  }
  if (hasType('supportedPractice')) {
    steps.push('Try the task first, then open the feedback and use it to improve your answer.');
  }
  if (hasType('supportedSelection')) {
    steps.push('In supported practice, choose an answer and select Check answer, then read the feedback for your choice.');
  }
  if (hasIndependentResponse) {
    steps.push('In independent practice, write first and select Save first response before viewing comparison criteria. Save revision preserves a later version; it does not replace the first response.');
  }
  if (!v2 && lesson.check && lesson.check.prompt) {
    steps.push('Try the retrieval check before opening the explanation.');
  }
  if (hasQuestions) {
    steps.push('Complete the assigned questions shown for this lesson. Additional practice is ungraded unless explicitly identified as an existing assignment.');
  } else if (!v2) {
    steps.push('Answer in your notes or course booklet where the lesson asks you to write.');
  }
  steps.push('Open All My Work to review or export saved work. A browser save is not a submission to your teacher.');
  return `
    <details class="page-guide lesson-guide" data-testid="lesson-guide">
      <summary><strong>How to complete this lesson</strong><span>Read &rarr; practise &rarr; answer</span></summary>
      <div class="guide-body">
        <ol>
          ${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </div>
    </details>
  `;
}

// R06: eyebrow from normal display order (unit position, lesson position,
// lesson count) — never from ID suffixes or kicker text.
function lessonEyebrow(lesson) {
  if (lesson && lesson.id && Array.isArray(units)) {
    for (let u = 0; u < units.length; u += 1) {
      const lessons = Array.isArray(units[u].lessons) ? units[u].lessons : [];
      for (let l = 0; l < lessons.length; l += 1) {
        if (lessons[l] && lessons[l].id === lesson.id) {
          return `Learn · Theme ${getUnitNumber(units[u].id)} · Lesson ${l + 1} of ${lessons.length}`;
        }
      }
    }
  }
  return (lesson && lesson.kicker) || '';
}

function renderLessonArticle(activity, lesson, index) {
  const v2 = isV2Lesson(lesson);
  const hero = lesson && lesson.heroImage;
  const heroSrc = String(hero?.src || '').trim();
  const heroHtml = heroSrc.startsWith('./assets/') && !heroSrc.includes('..')
    ? `<figure class="lesson-hero">
        <img src="${escapeHtml(heroSrc)}" alt="${escapeHtml(hero.alt || '')}" width="1400" height="788" />
      </figure>`
    : '';
  return `
<article class="social-document theme-lesson${v2 ? ' teacher-pilot' : ''}" id="lesson-${escapeHtml(lesson.id || index)}" data-testid="lesson-article" data-lesson-id="${escapeHtml(lesson.id || '')}">
  <div class="social-document-header">
    <p>${escapeHtml(lessonEyebrow(lesson) || lesson.kicker || `Learn ${index + 1}`)}</p>
    <h1 tabindex="-1" data-lesson-heading data-testid="lesson-heading">${escapeHtml(lesson.title)}</h1>
    ${v2 && lesson.essentialQuestion ? `<p class="lesson-question">${escapeHtml(lesson.essentialQuestion)}</p>` : ''}
    <span>${escapeHtml(lesson.intro || '')}</span>
  </div>
  ${heroHtml}
  ${v2 ? renderV2GoalStrip(lesson) : ''}
  ${renderLessonGuide(activity, lesson, v2)}
  <div class="theme-lesson-body">
    ${lesson.textbook ? `
      <div class="textbook-band">
        <div>
          <strong>Read with a purpose</strong>
          <span>${escapeHtml(lesson.textbook.label || '')}</span>
          <p class="reading-focus">${escapeHtml(lesson.readingFocus || (lesson.essentialQuestion ? `As you read, look for evidence that helps you answer: ${lesson.essentialQuestion}` : 'As you read, notice the details that explain the lesson idea.'))}</p>
        </div>
        <p><button type="button" class="social-reading-link" data-open-chapter="${escapeHtml(lesson.textbook.file || '')}" data-chapter-page="${lessonStartPage(lesson)}" data-chapter-title="${escapeHtml(lesson.textbook.title || 'Chapter')}">Read here at page ${lessonStartPage(lesson)}</button></p>
      </div>
    ` : ''}
    ${Array.isArray(lesson.terms) && lesson.terms.length ? `
      <p class="terms-line lesson-term-strip"><strong>Key terms:</strong> ${lesson.terms.map((item) => `<button type="button" class="bio-term" data-vocab-term="${escapeHtml(item.term)}" aria-haspopup="dialog">${escapeHtml(item.term)}</button>`).join(' · ')}</p>
      <details class="key-terms vocab-help">
        <summary>Vocabulary help</summary>
        <section class="lesson-words">
          <p class="section-label">Key terms</p>
          <h2>Words for this lesson</h2>
          <p>Use these definitions when you need help with a term.</p>
          <dl>
            ${lesson.terms.map((item) => `
              <div>
                <dt><button type="button" class="bio-term" data-vocab-term="${escapeHtml(item.term)}" aria-haspopup="dialog">${escapeHtml(item.term)}</button></dt>
                <dd>${escapeHtml(item.def)}</dd>
              </div>
            `).join('')}
          </dl>
        </section>
      </details>
    ` : ''}
    ${v2 ? renderV2Blocks(lesson) : `
    ${(lesson.body || []).map((paragraph) => `<p>${linkLessonTerms(paragraph, lesson.terms)}</p>`).join('')}
    ${lesson.example ? `
      <div class="theme-lesson-example">
        <strong>${escapeHtml(lesson.example.title)}</strong>
        <p>${escapeHtml(lesson.example.text)}</p>
      </div>
    ` : ''}
    ${lesson.check ? `
      <div class="stop-check">
        <p class="section-label">Check your understanding</p>
        <h2>Try this before opening the explanation</h2>
        <p>${escapeHtml(lesson.check.prompt)}</p>
        <details>
          <summary>Show the explanation</summary>
          <p>${escapeHtml(lesson.check.sample)}</p>
          ${lesson.textbook ? `
            <p class="check-source">Find this in the textbook: <button type="button" class="social-reading-link" data-open-chapter="${escapeHtml(lesson.textbook.file || '')}" data-chapter-page="${lessonStartPage(lesson)}" data-chapter-title="${escapeHtml(lesson.textbook.title || 'Chapter')}">Read ${escapeHtml(lesson.textbook.label || 'the chapter reading')}</button></p>
          ` : ''}
        </details>
      </div>
    ` : ''}
    `}
    ${renderLessonQuestions(activity, lesson)}
    ${renderAssignmentDrafts(lesson)}
  </div>
</article>
  `;
}

function renderThemeLessons(unit) {
  const lessons = Array.isArray(unit.lessons) ? unit.lessons : [];
  if (!lessons.length) return '';
  const activity = getUnitActivity(unit.id);
  const guideSteps = activity
    ? [
      'Work the lessons in order. Open each chapter at its page, learn the key terms, and read the teaching.',
      'Answer each lesson\u2019s questions right inside the lesson. Your writing saves as you go.',
      'Use the booklet review at the bottom to find unanswered questions, then mark the theme complete.'
    ]
    : [
      'Work the lessons in order. Open each chapter at its page, learn the key terms, and read the teaching.',
      'Draft each assignment inside its lesson, then complete the hand-in from the Assignments section and mark the theme complete.'
    ];
  return `
    <details class="page-guide lessons-guide">
      <summary><strong>How to complete this theme</strong><span>Learn &rarr; answer &rarr; review</span></summary>
      <div class="guide-body">
        <ol>
          ${guideSteps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
        </ol>
      </div>
    </details>
    <div class="lesson-map">
      <h3>Lessons in this theme</h3>
      <ol>
        ${lessons.map((lesson, index) => `
          <li>
            <a class="lesson-map-link" href="${lessonRouteHref(unit.id, lesson.id)}" data-lesson-link="${escapeHtml(unit.id)}::${escapeHtml(lesson.id)}">
              <span class="lesson-map-kicker">${escapeHtml(lesson.kicker || `Learn ${index + 1}`)}</span>
              <strong>${escapeHtml(lesson.title)}</strong>
              <span>${escapeHtml(lesson.intro || '')}</span>
            </a>
          </li>
        `).join('')}
      </ol>
    </div>
  `;
}

function renderResourceRow(item) {
  const url = item.url || '#';
  const label = item.kind === 'chapter' ? 'Open Chapter' : (item.kind === 'video' || item.kind === 'film' ? 'Watch' : 'Open');
  return `
    <div class="resource-row">
      <div>
        <span class="resource-kind">${escapeHtml(item.kind || 'resource')}</span>
        <strong>${escapeHtml(item.title)}</strong>
      </div>
      <a class="external-resource-action" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${label}</a>
    </div>
  `;
}

const ASSIGNMENT_PROMPT_LESSONS = {
  'assignment-1-1': 't1-l05-early-treaties',
  'assignment-1-2': 't1-l22-models',
  // R07: unnumbered booklet sections home by section id (EXPECTED_ITEM_HOMES).
  't1-glossary': 't1-l03-rights-distinctions',
  'assignment-2-1': 't2-l05-land-values',
  'assignment-2-2': 't2-l04-resolving-claims',
  'assignment-3-1': 't3-l02-breaking-barriers',
  'reel-injun': 't3-l06-screens-punchlines',
  'assignment-3-3': 't3-l04-urban-life-services',
  'assignment-4-1': 't4-l02-colonial-wounds',
  'assignment-4-2': 't4-l02-colonial-wounds',
  'halfbreed-definitions': 't4-l01-one-world-many-peoples',
  'halfbreed-chart': 't4-l04-youth-future-response',
  'assignment-4-3': 't4-l04-youth-future-response'
};

const LESSON_DRAFTS = {
  't2-l04-resolving-claims': [
    { assignmentId: '2-1-land-stewardship', label: 'Draft your 2.1 stewardship paragraph here. Copy it into your hand-in when it is ready.' },
    { assignmentId: '2-2-specific-land-claims', label: 'Draft your 2.2 claim profiles here, one paragraph per claim with events, issues, settlement or decision, and a timeline.' }
  ],
  't3-l02-breaking-barriers': [
    { assignmentId: 'assignment-3-1-breaking-stereotypes', label: 'Draft your 3.1 response here: realistic ways society, community, and individuals can overcome and break stereotypes.' }
  ],
  't3-l04-urban-life-services': [
    { assignmentId: 'attawapiskat-report', label: 'Draft your Attawapiskat report findings here, service by service.' }
  ],
  't4-l03-land-resources-un': [
    { assignmentId: '4-2-rabbit-proof-fence', label: 'Draft your 4.2 film response here using the scene-plus-source method.' }
  ],
  't4-l04-youth-future-response': [
    { assignmentId: '4-3-personal-response', label: 'Earlier draft (Inconvenient Indian prompt). Your earlier work continues here; it is never moved onto the new prompt.' },
    { assignmentId: '4-3-personal-response::v2-halfbreed', label: 'Draft your 4.3 Halfbreed response here: choose one study question, then discuss your thoughts in 2-3 paragraphs.' }
  ]
};

function promptsForLesson(activity, lesson) {
  if (!activity || !lesson) return [];
  // Explicit membership only (T02): numbered prompts belong to a lesson iff
  // the lesson's bookletQuestionIds lists them. Display text (kicker, title,
  // paragraphs) must never influence membership.
  const wanted = new Set(Array.isArray(lesson.bookletQuestionIds) ? lesson.bookletQuestionIds : []);
  const woven = [];
  for (const section of activity.sections || []) {
    for (const prompt of section.prompts || []) {
      if (prompt.number && wanted.has(prompt.id)) {
        woven.push(prompt);
      } else if (!prompt.number && ASSIGNMENT_PROMPT_LESSONS[section.id] === lesson.id) {
        woven.push(prompt);
      }
    }
  }
  return woven;
}

// ---- T06 honest completion: explicit field states, never prefix-search proof.
// Field completion means "every required response field has text" — never
// correct, reviewed, or mastered. Statuses: not-started | partial |
// fields-complete | needs-review (legacy unstructured text against a newly
// structured task; the raw text is preserved, structural verification pending).
function requiredPromptFieldKeys(activity, prompt) {
  if (prompt && prompt.kind === 'table') {
    const rows = Array.isArray(prompt.rows) ? prompt.rows : [];
    const columns = Array.isArray(prompt.columns) ? prompt.columns : [];
    return rows.flatMap((row) => columns.map((column) => (
      promptFieldKey(activity, prompt, `${tableFieldId(row)}.${tableFieldId(column)}`)
    )));
  }
  if (prompt && prompt.kind === 'fillBlank') {
    const blanks = Array.isArray(prompt.blanks) && prompt.blanks.length ? prompt.blanks : [{ id: 'blank-1' }];
    return blanks.map((blank, index) => promptFieldKey(activity, prompt, (blank && blank.id) || `blank-${index + 1}`));
  }
  return [promptFieldKey(activity, prompt)];
}

function promptExpectsSubfields(prompt) {
  return !!prompt && (prompt.kind === 'table' || prompt.kind === 'fillBlank');
}

function getPromptCompletion(activity, prompt) {
  const keys = requiredPromptFieldKeys(activity, prompt);
  const expected = keys.length;
  const filled = keys.filter((key) => String(readCourseResponse(key) || '').trim()).length;
  if (promptExpectsSubfields(prompt)) {
    const baseText = String(readCourseResponse(activityResponseKey(activity.id, prompt.id)) || '').trim();
    if (baseText && filled < expected) {
      return { status: 'needs-review', filled, expected, detail: 'legacy-unstructured' };
    }
  }
  if (filled === 0) return { status: 'not-started', filled: 0, expected };
  if (filled < expected) return { status: 'partial', filled, expected };
  return { status: 'fields-complete', filled, expected };
}

function promptAnswered(activity, prompt) {
  return getPromptCompletion(activity, prompt).status === 'fields-complete';
}

function sectionAnswerCount(activity, section) {
  const prompts = section.prompts || [];
  let done = 0;
  let partial = 0;
  let needsReview = 0;
  for (const prompt of prompts) {
    const status = getPromptCompletion(activity, prompt).status;
    if (status === 'fields-complete') done += 1;
    else if (status === 'partial') partial += 1;
    else if (status === 'needs-review') needsReview += 1;
  }
  return { done, total: prompts.length, partial, needsReview };
}

// ---- T06 requirement manifest: separate assigned/formative/optional/teacher
// roles. The required denominator counts legacyAssigned items ONLY, so new
// formative or optional practice never changes grade weight or the legacy
// denominator. No weights, locks, or compulsory tasks are created here;
// teacher policy lands in REQUIREMENT_ROLE_OVERRIDES when recorded.
const REQUIREMENT_ROLE_OVERRIDES = {};

function roleForRequirement(id) {
  if (Object.prototype.hasOwnProperty.call(REQUIREMENT_ROLE_OVERRIDES, id)) return REQUIREMENT_ROLE_OVERRIDES[id];
  return isKnownLegacyRequirement(id) ? 'legacyAssigned' : 'formative';
}

function isKnownLegacyRequirement(id) {
  return requirementItems().some((item) => item.id === id);
}

function requirementItems() {
  const items = [];
  for (const activity of themeActivities) {
    for (const section of (activity.sections || [])) {
      for (const prompt of (section.prompts || [])) {
        items.push({
          id: `booklet:${activity.id}:${prompt.id}`,
          role: 'legacyAssigned',
          kind: 'prompt',
          activity,
          prompt
        });
      }
    }
  }
  for (const assignment of assignments) {
    if (BOOKLET_SHELL_ASSIGNMENT_IDS.has(assignment.id)) continue;
    items.push({
      id: `assignment:${assignment.id}`,
      role: 'legacyAssigned',
      kind: 'assignment',
      assignment
    });
  }
  for (const item of items) {
    if (Object.prototype.hasOwnProperty.call(REQUIREMENT_ROLE_OVERRIDES, item.id)) {
      item.role = REQUIREMENT_ROLE_OVERRIDES[item.id];
    }
  }
  return items;
}

function requirementDenominator(items) {
  return (items || requirementItems()).filter((item) => item.role === 'legacyAssigned').length;
}

function isRequirementComplete(item) {
  if (item.kind === 'prompt') {
    return getPromptCompletion(item.activity, item.prompt).status === 'fields-complete';
  }
  return assignmentHasResponse(item.assignment);
}

function requirementTotals() {
  const items = requirementItems();
  const required = items.filter((item) => item.role === 'legacyAssigned');
  const done = required.filter(isRequirementComplete).length;
  return { done, total: required.length };
}

function lessonsForSection(unit, activity, section) {
  return (unit.lessons || []).filter((lesson) => {
    if (ASSIGNMENT_PROMPT_LESSONS[section.id] === lesson.id) return true;
    // Explicit membership only (T02): mirror promptsForLesson, no text parsing.
    const wanted = Array.isArray(lesson.bookletQuestionIds) ? lesson.bookletQuestionIds : [];
    if (!wanted.length) return false;
    return (section.prompts || []).some((prompt) => prompt.number && wanted.includes(prompt.id));
  });
}

function renderLessonQuestions(activity, lesson) {
  const woven = promptsForLesson(activity, lesson);
  if (!woven.length) return '';
  const viewKeys = woven.map((prompt) => activityResponseKey(activity.id, prompt.id));
  return `
    <div class="lesson-questions">
      <h4>Answer as you learn</h4>
      <p>These booklet questions belong to this lesson. Your answers save here and appear in the booklet review below.</p>
      ${renderConflictPanelsForKeys(viewKeys)}
      <div class="activity-prompts">
        ${woven.map((prompt) => renderActivityPrompt(activity, prompt)).join('')}
      </div>
      <p class="activity-save-status" data-activity-save-status data-save-state="ready">Save status.</p>
    </div>
  `;
}

function renderAssignmentDrafts(lesson) {
  const drafts = LESSON_DRAFTS[lesson.id] || [];
  if (!drafts.length) return '';
  const viewKeys = drafts.map((draft) => `assignment-draft::${draft.assignmentId}`);
  return `
    <div class="lesson-drafts">
      ${renderConflictPanelsForKeys(viewKeys)}
      ${drafts.map((draft) => {
        const key = `assignment-draft::${draft.assignmentId}`;
        return `
          <label class="activity-prompt" for="draft-${escapeHtml(draft.assignmentId)}">
            <span><strong>Draft your hand-in.</strong> ${escapeHtml(draft.label)}</span>
            <textarea id="draft-${escapeHtml(draft.assignmentId)}" class="activity-response" rows="5" data-activity-response="${escapeHtml(key)}">${escapeHtml(readCourseResponse(key) || '')}</textarea>
          </label>
        `;
      }).join('')}
    </div>
  `;
}

function renderBookletReview(unit, activity) {
  const sections = activity.sections || [];
  const rows = sections.map((section) => {
    const { done, total, partial, needsReview } = sectionAnswerCount(activity, section);
    const stateBits = [`${done} of ${total} fields-complete`];
    if (partial > 0) stateBits.push(`${partial} partial`);
    if (needsReview > 0) stateBits.push(`${needsReview} needs review`);
    const targets = lessonsForSection(unit, activity, section);
    const first = targets[0];
    return `
      <div class="resource-row">
        <div>
          <span class="resource-kind">${stateBits.join(' · ')}</span>
          <strong>${escapeHtml(section.title)}</strong>
        </div>
        ${first ? `<button type="button" class="lesson-jump" data-goto-lesson="${escapeHtml(unit.id)}::${escapeHtml(first.id)}">Open lesson</button>` : ''}
      </div>
    `;
  }).join('');
  return `
    <section class="activity-shell" data-activity-id="${escapeHtml(activity.id)}">
      <div class="activity-head">
        <div>
          <span class="card-code mono">Online Work</span>
          <h3>${escapeHtml(activity.title)} · Review</h3>
        </div>
        <span class="activity-status" data-activity-save-status data-save-state="ready">Save status.</span>
      </div>
      <p class="activity-intro">${escapeHtml(activity.intro)} Questions now live inside their lessons above; this review tracks what is answered.</p>
      <div class="resource-list">
        ${rows}
      </div>
      <div class="activity-actions">
        <button type="button" id="copy-activity-responses" class="secondary-button" data-copy-activity="${escapeHtml(activity.id)}">Copy Responses</button>
        ${renderWorkExportControls()}
      </div>
    </section>
  `;
}

function renderUnitActivity(unit, locked) {
  const activity = getUnitActivity(unit.id);
  if (!activity) return '';
  if ((unit.lessons || []).length && !locked) {
    return renderBookletReview(unit, activity);
  }
  if (locked) {
    return `
      <section class="activity-shell is-locked">
        <h3>${escapeHtml(activity.title)}</h3>
        <p>This online booklet unlocks with the theme.</p>
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
        <span class="activity-status" data-activity-save-status data-save-state="ready">Save status.</span>
      </div>
      <p class="activity-intro">${escapeHtml(activity.intro)}</p>
      ${activityResources}
      <div class="activity-sections">
        ${(activity.sections || []).map((section, index) => renderActivitySection(activity, section, index)).join('')}
      </div>
      <div class="activity-actions">
        <button type="button" id="copy-activity-responses" class="secondary-button" data-copy-activity="${escapeHtml(activity.id)}">Copy Responses</button>
        ${renderWorkExportControls()}
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
          ${renderConsentEmbed(embedUrl, resource.title)}
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
      <textarea id="${escapeHtml(inputId)}" class="activity-response" rows="${Number(prompt.rows) || 5}" data-activity-response="${escapeHtml(key)}">${escapeHtml(readCourseResponse(key) || '')}</textarea>
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
                ${renderConsentEmbed(embedUrl, resource.title)}
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

// Legacy label-derived token (pre-T02 saved keys). Render paths now use
// explicit row/column IDs; this remains only for backward-compatible reads
// of string-shaped rows/columns and for migration/test reference.
function fieldToken(value) {
  return String(value || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

// Explicit table identity (T02): rows/columns are { id, label } records.
// Saved keys use the stable id; visible text uses the label. Plain-string
// entries fall back to the legacy token so old shapes keep reading.
function tableFieldId(entry) {
  if (entry && typeof entry === 'object') return entry.id;
  return fieldToken(entry);
}

function tableFieldLabel(entry) {
  if (entry && typeof entry === 'object') return entry.label;
  return entry;
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
      <input id="${escapeHtml(inputId)}" type="text" class="activity-blank-input" data-activity-response="${escapeHtml(key)}" value="${escapeHtml(readCourseResponse(key) || '')}" aria-label="${escapeHtml(`Q${prompt.number || ''} ${blank.label || 'blank'}`)}" />
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
          const checked = readCourseResponse(key) === choice ? 'checked' : '';
          const letter = String.fromCharCode(65 + index);
          return `
            <label class="activity-choice" for="${escapeHtml(inputId)}">
              <span class="choice-letter" aria-hidden="true">${letter}</span>
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
              ${columns.map((column) => `<th scope="col">${escapeHtml(tableFieldLabel(column))}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map((row) => `
              <tr>
                <th scope="row">${escapeHtml(tableFieldLabel(row))}</th>
                ${columns.map((column) => {
                  const key = promptFieldKey(activity, prompt, `${tableFieldId(row)}.${tableFieldId(column)}`);
                  return `<td data-column-label="${escapeHtml(tableFieldLabel(column))}"><textarea class="activity-table-response" rows="3" data-activity-response="${escapeHtml(key)}" aria-label="${escapeHtml(`Q${prompt.number || ''} ${tableFieldLabel(row)} ${tableFieldLabel(column)}`)}">${escapeHtml(readCourseResponse(key) || '')}</textarea></td>`;
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
      // R03: radios commit immediately (single gesture); text debounces.
      if (field.type === 'radio') {
        saveActivityResponse(field.dataset.activityResponse, field.value);
      } else {
        queueDebouncedDraft(field.dataset.activityResponse, field.value, field.dataset.contentVersion || null);
      }
      // Truthful save feedback travels in data-save-state (see refreshSaveStatus):
      // Studio's annotation refresh fingerprints element text, so visible text
      // stays static and state changes ride on attributes instead.
    };
    field.addEventListener(field.type === 'radio' ? 'change' : 'input', saveField);
  });
  bindSubmissionLifecycle();
  bindSupportedSelections();
  refs.contentBody.querySelectorAll('[data-activity-save-status]').forEach((status) => {
    if (!status.dataset.activitySaveTouched && !status.dataset.saveState) status.dataset.saveState = 'ready';
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
      if (status) status.dataset.saveState = 'copied';
    } catch (_error) {
      if (status) status.dataset.saveState = 'copy-unavailable';
    }
  });
  refs.contentBody.querySelector('[data-export-work]')?.addEventListener('click', () => {
    downloadWorkExport();
    refreshSaveStatus();
  });
  refs.contentBody.querySelector('[data-import-work]')?.addEventListener('change', (event) => {
    const file = event.currentTarget.files && event.currentTarget.files[0];
    if (file) importWorkFromFile(file);
    event.currentTarget.value = '';
  });
  refs.contentBody.querySelectorAll('[data-resolve-conflict]').forEach((button) => {
    button.addEventListener('click', () => {
      if (typeof AB30Store === 'undefined' || !AB30Store) return;
      const conflictId = button.dataset.resolveConflict;
      const mode = button.dataset.resolveMode;
      const panel = button.closest('[data-conflict-panel]');
      const conflict = AB30Store.conflicts().find((item) => item.id === conflictId);
      if (!conflict) return;
      let mergedText;
      if (mode === 'merged') {
        const area = panel ? panel.querySelector(`[data-merge-text="${CSS.escape(conflictId)}"]`) : null;
        mergedText = area ? area.value : '';
      }
      const result = AB30Store.resolveConflict(conflictId, mode, mergedText);
      if (!result.ok) {
        refreshSaveStatus();
        return;
      }
      // Targeted update only: never full-render here, so text the learner is
      // still typing elsewhere on the page cannot be wiped.
      refreshRecordEditors(conflict.candidates.map((candidate) => candidate.key));
      if (panel) panel.remove();
      refreshSaveStatus();
    });
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
        return `${blank.label || `Blank ${index + 1}`}: ${readCourseResponse(key) || ''}`;
      }).join('\n')
    ];
  }
  if (prompt.kind === 'multipleChoice') {
    const key = promptFieldKey(activity, prompt);
    return [promptLabel, readCourseResponse(key) || ''];
  }
  if (prompt.kind === 'table') {
    const rows = Array.isArray(prompt.rows) ? prompt.rows : [];
    const columns = Array.isArray(prompt.columns) ? prompt.columns : [];
    const tableLines = [promptLabel];
    for (const row of rows) {
      tableLines.push(tableFieldLabel(row));
      for (const column of columns) {
        const key = promptFieldKey(activity, prompt, `${tableFieldId(row)}.${tableFieldId(column)}`);
        tableLines.push(`${tableFieldLabel(column)}: ${readCourseResponse(key) || ''}`);
      }
    }
    return tableLines;
  }
  const key = promptFieldKey(activity, prompt);
  return [promptLabel, readCourseResponse(key) || ''];
}

// ---- T09 practice UI: reviewed modes only; everything else is visibly not
// offered with a reason. Attempt cores are DOM-free for testing; delegated
// handlers only read controls and re-render.
let practiceView = { screen: 'catalog', runId: null, lastResult: null };

function practiceStore() {
  return (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.startPracticeRun === 'function')
    ? AB30Store
    : null;
}

function practiceEngine() {
  return (typeof AB30PracticeEngine !== 'undefined' && AB30PracticeEngine) ? AB30PracticeEngine : null;
}

function practiceBank() {
  return (typeof AB30PracticeData !== 'undefined' && AB30PracticeData) ? AB30PracticeData : null;
}

function practiceReady() {
  return !!(practiceStore() && practiceEngine() && practiceBank());
}

function practiceCatalogHtml(modes) {
  const offered = modes.filter((mode) => mode.offered);
  const notOffered = modes.filter((mode) => !mode.offered);
  if (!modes.length || !offered.length) {
    return `
      <div class="empty-card">
        <h3>No practice available yet</h3>
        <p>Nothing here is ready to offer honestly. ${notOffered.map((mode) => escapeHtml(mode.reason || '')).join(' ')}</p>
      </div>
    `;
  }
  return `
    <div class="practice-modes">
      ${offered.map((mode) => `
        <div class="practice-mode-card"${mode.id === 'matching' ? ' data-testid="practice-mode-matching"' : ''}>
          <h3>${escapeHtml(mode.title)}</h3>
          <p>${escapeHtml(mode.description || '')}</p>
          ${mode.id === 'matching' ? `
            <div class="practice-start-row">
              <label><input type="radio" name="practice-attempt-mode-matching" value="independent" checked /> Independent</label>
              <label><input type="radio" name="practice-attempt-mode-matching" value="supported" /> Supported</label>
              <label>Items
                <select data-practice-count>
                  <option value="5" selected>5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </label>
              <button type="button" class="lesson-jump primary" data-practice-start="matching" data-testid="practice-start">Start matching</button>
            </div>
          ` : ''}
          ${mode.id === 'selected-response' ? `
            <div class="practice-start-row">
              <label><input type="radio" name="practice-attempt-mode-selected-response" value="independent" checked /> Independent</label>
              <label><input type="radio" name="practice-attempt-mode-selected-response" value="supported" /> Supported</label>
              <label>Items
                <select data-practice-count>
                  <option value="5" selected>5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                </select>
              </label>
              <button type="button" class="lesson-jump primary" data-practice-start="selected-response" data-testid="practice-start-selected-response">Start source practice</button>
            </div>
          ` : ''}
          ${mode.id === 'concept-cards' ? `
            <button type="button" class="lesson-jump" data-practice-cards>Open concept cards</button>
          ` : ''}
        </div>
      `).join('')}
    </div>
    ${notOffered.length ? `
      <div class="practice-not-offered">
        <h3>Not offered yet</h3>
        ${notOffered.map((mode) => `
          <p><strong>${escapeHtml(mode.title)}:</strong> ${escapeHtml(mode.reason || '')}</p>
        `).join('')}
      </div>
    ` : ''}
  `;
}

function renderPracticeCatalog() {
  const bank = practiceBank();
  const store = practiceStore();
  const modes = bank ? bank.MODES : [];
  let resume = '';
  if (store) {
    const inProgress = store.listPracticeRuns().runs.filter((run) => run.status === 'in-progress');
    if (inProgress.length) {
      resume = `
        <div class="practice-resume">
          <h3>Resume practice</h3>
          ${inProgress.map((run) => `
            <p><button type="button" class="lesson-jump" data-practice-resume="${escapeHtml(run.id)}" data-testid="resume-practice-run" data-run-id="${escapeHtml(run.id)}">
              Resume ${escapeHtml(run.mode)} (${Object.keys(run.attemptIds || {}).length}/${(run.itemIds || []).length} answered)
            </button></p>
          `).join('')}
        </div>
      `;
    }
  }
  refs.contentBody.innerHTML = `
    <section class="course-page">
      <p class="course-kicker">Aboriginal Studies 30</p>
      <h2>Practice</h2>
      <p class="page-intro">Reviewed practice only. Anything without reviewed keys, feedback, or models is listed below as not offered instead of faked.</p>
      ${resume}
      ${practiceCatalogHtml(modes)}
    </section>
  `;
}

function selectedResponseItemFromRun(run, index) {
  const bank = practiceBank();
  const recorded = (run.stimuli || [])[index] || {};
  const recordedOptions = Array.isArray(recorded.options) ? recorded.options : [];
  const bankItem = bank && bank.itemById ? bank.itemById(recorded.itemId) : null;
  const prompt = (recorded.stimulus && recorded.stimulus.prompt)
    || (bankItem && bankItem.prompt) || '';
  return {
    id: recorded.itemId,
    family: (bankItem && bankItem.familyId) || 'selected-response',
    mode: run.mode,
    concept: (bankItem && bankItem.skillTag) || '',
    lessonId: recorded.lessonId || (bankItem && bankItem.lessonId) || null,
    unitId: recorded.unitId || null,
    stimulus: recorded.stimulus || {},
    stimulusVersion: (run.versions || [])[index],
    prompt,
    options: recordedOptions,
    optionOrder: (run.optionOrders || [])[index] || recordedOptions.map((option) => option.id),
    key: recorded.key || (bankItem && bankItem.correctOptionId) || '',
    feedbackByOption: recorded.feedbackByOption || (bankItem && bankItem.feedbackByOption) || {},
    version: (run.versions || [])[index],
    reviewed: recorded.reviewed === true || !!(bankItem && bankItem.reviewed),
    role: 'formative'
  };
}

function practiceItemFromRun(run, index) {
  // R08: in-lesson supported runs resume through the same run renderer.
  // Matching items rebuild from recorded term stimuli; selected-response
  // items rebuild from recorded options/order plus the reviewed bank key.
  if (run && run.mode === 'selected-response') return selectedResponseItemFromRun(run, index);
  const stimulus = run.stimuli[index];
  const options = stimulus.options || [];
  const correct = options.find((option) => option.id === stimulus.stimulus.termId) || { id: '', text: '' };
  const feedbackByOption = {};
  options.forEach((option) => {
    feedbackByOption[option.id] = option.id === correct.id
      ? `Correct. \u201C${stimulus.stimulus.term}\u201D means: ${correct.text}`
      : `Not quite. \u201C${stimulus.stimulus.term}\u201D means: ${correct.text}`;
  });
  return {
    id: stimulus.itemId,
    family: 'term-meaning',
    mode: run.mode,
    concept: stimulus.stimulus.term,
    lessonId: stimulus.lessonId || null,
    unitId: stimulus.unitId || null,
    stimulus: stimulus.stimulus,
    stimulusVersion: run.versions[index],
    prompt: `What does \u201C${stimulus.stimulus.term}\u201D mean?`,
    options,
    optionOrder: run.optionOrders[index] || [],
    key: correct.id,
    feedbackByOption,
    version: run.versions[index],
    reviewed: true,
    role: 'formative'
  };
}

function practiceRunProgress(run) {
  const total = (run.itemIds || []).length;
  const done = Object.keys(run.attemptIds || {}).length;
  return { done, total };
}

function renderPracticeRun(runId) {
  const store = practiceStore();
  const engine = practiceEngine();
  const run = store ? store.getPracticeRun(runId) : null;
  if (!run) {
    practiceView = { screen: 'catalog', runId: null, lastResult: null };
    renderPracticeCatalog();
    return;
  }
  const exposed = store.getPracticeExposure();
  const progress = practiceRunProgress(run);
  const complete = run.status === 'complete';
  let firstCorrect = 0;
  let firstCounted = 0;
  const itemsHtml = run.itemIds.map((itemId, index) => {
    const rawItem = practiceItemFromRun(run, index);
    const displayApi = typeof AB30LessonBlocks !== 'undefined' ? AB30LessonBlocks : null;
    const displayLesson = rawItem && rawItem.lessonId
      ? units.flatMap((unit) => unit.lessons || []).find((candidate) => candidate.id === rawItem.lessonId)
      : null;
    const item = displayApi && typeof displayApi.presentPracticeItem === 'function' && displayLesson
      ? displayApi.presentPracticeItem(rawItem, displayLesson.blocks || [])
      : rawItem;
    const attemptIds = (run.attemptIds[engine.practiceTaskId(item)] || []);
    const attempts = attemptIds.map((id) => store.getPracticeAttempt(id)).filter(Boolean);
    const first = attempts[0] || null;
    const isReview = !!exposed[item.id] && !first;
    let block;
    if (!first) {
      block = `
        <fieldset class="activity-prompt practice-item-form">
          <legend>${escapeHtml(item.prompt)}${isReview ? ' <span class="review-flag">(Review)</span>' : ''}</legend>
          ${item.options.map((option) => `
            <label class="activity-choice" for="practice-${escapeHtml(run.id)}-${index}-${escapeHtml(option.id)}">
              <input id="practice-${escapeHtml(run.id)}-${index}-${escapeHtml(option.id)}" type="radio" name="practice-${escapeHtml(run.id)}-${index}" value="${escapeHtml(option.id)}" data-practice-option="${escapeHtml(item.id)}" />
              ${escapeHtml(option.text)}
            </label>
          `).join('')}
          <label class="practice-reasoning" for="practice-reasoning-${index}">Your reasoning (optional, saved with your answer, never graded)
            <textarea id="practice-reasoning-${index}" rows="3" data-practice-reasoning="${escapeHtml(item.id)}"></textarea>
          </label>
          <button type="button" class="lesson-jump primary" data-practice-submit="${escapeHtml(item.id)}" data-testid="practice-check-answer">Submit answer</button>
        </fieldset>
      `;
    } else {
      const selected = (first.selectedOptions || [])[0] || '';
      const feedback = engine.feedbackFor(item, selected);
      if (first.role === 'first') {
        firstCounted += 1;
        if (feedback.correct) firstCorrect += 1;
      }
      const teaching = item.lessonId && item.unitId
        ? `<p><a href="${lessonRouteHref(item.unitId, item.lessonId)}" data-lesson-link="${escapeHtml(item.unitId)}::${escapeHtml(item.lessonId)}">Revisit the lesson</a></p>`
        : '';
      const revisions = attempts.slice(1).map((attempt) => {
        const revisionFeedback = engine.feedbackFor(item, (attempt.selectedOptions || [])[0]);
        return `<li>Revision: ${escapeHtml((attempt.selectedOptions || []).join(', ') || 'written only')} — ${revisionFeedback.correct ? 'correct' : 'not correct yet'}</li>`;
      }).join('');
      block = `
        <div class="practice-item-answered">
          <p><strong>${escapeHtml(item.prompt)}</strong>${isReview ? ' <span class="review-flag">(Review)</span>' : ''}</p>
          <p>Your answer: ${escapeHtml(selected || 'written response only')} — ${feedback.correct ? 'correct' : 'not correct'}.</p>
          <p data-testid="practice-feedback">${escapeHtml(feedback.text)}</p>
          ${teaching}
          ${first.response ? `<p>Your reasoning: ${escapeHtml(first.response)}</p>` : ''}
          ${revisions ? `<ul>${revisions}</ul>` : ''}
          <details class="practice-revise">
            <summary>Revise this answer (keeps your first attempt)</summary>
            ${item.options.map((option) => `
              <label class="activity-choice" for="practice-revise-${escapeHtml(run.id)}-${index}-${escapeHtml(option.id)}">
                <input id="practice-revise-${escapeHtml(run.id)}-${index}-${escapeHtml(option.id)}" type="radio" name="practice-revise-${escapeHtml(run.id)}-${index}" value="${escapeHtml(option.id)}" data-practice-revise-option="${escapeHtml(item.id)}" />
                ${escapeHtml(option.text)}
              </label>
            `).join('')}
            <button type="button" class="lesson-jump" data-practice-revise="${escapeHtml(item.id)}">Submit revision</button>
          </details>
        </div>
      `;
    }
    return `<section class="practice-item" aria-label="Practice item ${index + 1} of ${progress.total}">${block}</section>`;
  }).join('');
  const lastResult = practiceView.lastResult;
  refs.contentBody.innerHTML = `
    <section class="course-page" data-testid="practice-run" data-run-id="${escapeHtml(run.id)}">
      <p class="course-kicker">Aboriginal Studies 30 · Practice</p>
      <h2>${run.attemptMode === 'supported' ? 'Supported' : 'Independent'} ${run.mode === 'selected-response' ? 'selected-response' : 'matching'}</h2>
      <p class="page-intro">${progress.done} of ${progress.total} answered. First attempts stay saved; revisions never overwrite them.</p>
      ${lastResult && !lastResult.ok ? `<p class="practice-error" role="alert">Save failed (${escapeHtml(lastResult.code || 'unknown')}) — your answer is kept in the form below. Fix saving, then submit again.</p>` : ''}
      ${complete ? `<p><strong>Run complete.</strong> First-attempt score: ${firstCorrect} of ${firstCounted}. Revisions are recorded separately and never inflate it.</p>` : ''}
      ${itemsHtml}
      <div class="card-actions">
        <button type="button" class="secondary-button" data-practice-catalog>Back to practice</button>
        ${!complete && progress.done >= progress.total && progress.total > 0 ? `<button type="button" class="lesson-jump primary" data-practice-finish>Finish run</button>` : ''}
        ${!complete ? `<button type="button" class="secondary-button" data-practice-abandon>Abandon run</button>` : ''}
      </div>
    </section>
  `;
}

function renderPracticeCards() {
  const engine = practiceEngine();
  const cards = engine ? engine.conceptCards(coreVocabulary) : [];
  refs.contentBody.innerHTML = `
    <section class="course-page">
      <p class="course-kicker">Aboriginal Studies 30 · Practice</p>
      <h2>Concept cards</h2>
      <p class="page-intro">${cards.length} cards from the reviewed vocabulary bank. Flipping a card submits, scores, and grades nothing.</p>
      <div class="card-actions">
        <button type="button" class="secondary-button" data-practice-catalog>Back to practice</button>
      </div>
      ${cards.map((card) => `
        <details class="concept-card">
          <summary>${escapeHtml(card.term)}</summary>
          <p>${escapeHtml(card.meaning)}</p>
          ${card.lessonId && card.unitId ? `<p><a href="${lessonRouteHref(card.unitId, card.lessonId)}" data-lesson-link="${escapeHtml(card.unitId)}::${escapeHtml(card.lessonId)}">Revisit the lesson</a></p>` : ''}
        </details>
      `).join('')}
      <div class="card-actions">
        <button type="button" class="secondary-button" data-practice-catalog>Back to practice</button>
      </div>
    </section>
  `;
}

function renderQuizzes() {
  if (!practiceReady()) {
    refs.contentBody.innerHTML = `
      <section class="course-page">
        <p class="course-kicker">Aboriginal Studies 30</p>
        <h2>Quizzes</h2>
        <p class="page-intro">Quiz materials will appear here. Quizzes unlock as their themes unlock.</p>
        <div class="empty-card">
          <h3>No quizzes loaded yet</h3>
          <p>Practice scripts failed to load. Reload the page; your saved work is unaffected.</p>
        </div>
      </section>
    `;
    return;
  }
  if (practiceView.screen === 'run' && practiceView.runId) renderPracticeRun(practiceView.runId);
  else if (practiceView.screen === 'cards') renderPracticeCards();
  else renderPracticeCatalog();
}

function startPracticeMode(mode, attemptMode, count, seed) {
  const store = practiceStore();
  const engine = practiceEngine();
  const bank = practiceBank();
  if (!store || !engine || !bank) return { ok: false, code: 'practice-missing' };
  const catalog = bank.modeById(mode);
  if (!catalog || !catalog.offered) return { ok: false, code: 'mode-not-offered' };
  const built = mode === 'selected-response'
    ? engine.buildSelectedResponseItems(bank.ITEMS, seed, bank.BANK_VERSION, store.getPracticeExposure())
    : engine.buildMatchingItems(coreVocabulary, count, seed, bank.BANK_VERSION, store.getPracticeExposure());
  const sampled = engine.sampleItems(engine.eligibleItems(built).eligible, count, seed);
  if (!sampled.items.length) return { ok: false, code: 'bank-empty' };
  const started = engine.startRun(store, { mode, attemptMode, items: sampled.items, seed });
  if (!started.ok) return started;
  practiceView = { screen: 'run', runId: started.run.id, lastResult: null };
  return started;
}

function submitPracticeItem(runId, itemId, input) {
  const store = practiceStore();
  const engine = practiceEngine();
  if (!store || !engine) return { ok: false, code: 'practice-missing' };
  const run = store.getPracticeRun(runId);
  if (!run) return { ok: false, code: 'unknown-run' };
  const index = (run.itemIds || []).indexOf(itemId);
  if (index === -1) return { ok: false, code: 'unknown-item' };
  const item = practiceItemFromRun(run, index);
  const result = engine.submitFirst(store, run, item, input || {});
  practiceView.lastResult = result.ok ? null : result;
  if (result.ok) engine.recordExposure(store, itemId, `feedback:${result.attemptId}`);
  return result;
}

function revisePracticeItem(runId, itemId, input) {
  const store = practiceStore();
  const engine = practiceEngine();
  if (!store || !engine) return { ok: false, code: 'practice-missing' };
  const run = store.getPracticeRun(runId);
  if (!run) return { ok: false, code: 'unknown-run' };
  const index = (run.itemIds || []).indexOf(itemId);
  if (index === -1) return { ok: false, code: 'unknown-item' };
  const item = practiceItemFromRun(run, index);
  const firstId = ((run.attemptIds || {})[engine.practiceTaskId(item)] || [])[0] || null;
  if (!firstId) return { ok: false, code: 'no-first-attempt' };
  const result = engine.submitRevision(store, run, item, firstId, input || {});
  practiceView.lastResult = result.ok ? null : result;
  if (result.ok) engine.recordExposure(store, itemId, `revision:${result.attemptId}`);
  return result;
}

function abandonPracticeRun(runId) {
  const store = practiceStore();
  if (!store) return { ok: false, code: 'practice-missing' };
  const result = store.finishPracticeRun(runId, 'abandoned');
  if (result.ok) practiceView = { screen: 'catalog', runId: null, lastResult: null };
  return result;
}

function finishPracticeRunUi(runId) {
  const store = practiceStore();
  if (!store) return { ok: false, code: 'practice-missing' };
  return store.finishPracticeRun(runId, 'complete');
}

function resumePracticeRun(runId) {
  practiceView = { screen: 'run', runId, lastResult: null };
  render();
}

function backToPracticeCatalog() {
  practiceView = { screen: 'catalog', runId: null, lastResult: null };
  render();
}

const WRITTEN_RUBRIC = {
  title: 'Critical Response Rubric',
  total: 16,
  levels: [
    { name: 'Excellent', points: 4 },
    { name: 'Proficient', points: 3 },
    { name: 'Acceptable', points: 2 },
    { name: 'Limited', points: 1 }
  ],
  criteria: [
    {
      name: 'Comprehension ×2',
      cells: ['Insightful understanding of the question; deliberate viewpoint; in-depth comprehension; perceptive interpretations.', 'Clear understanding; explores the viewpoint; thorough comprehension; purposeful, logical interpretations.', 'Evident understanding; identifies the viewpoint; comprehends text and topic; predictable, logical interpretations.', 'Understanding not apparent; vague viewpoint; incomplete comprehension; uncertain interpretations.']
    },
    {
      name: 'Evidence',
      cells: ['Thoughtful, precise, complete evidence, free of factual errors; used skillfully to strengthen ideas.', 'Important, complete evidence, free of factual errors; used to strengthen ideas.', 'Largely important evidence with minimal errors; attempts to strengthen ideas.', 'Irrelevant, largely incomplete evidence with factual errors; not used to strengthen ideas.']
    },
    {
      name: 'Communication Skills',
      cells: ['Highly effective arrangement; skillful control and conclusion; sustained, integrated main idea; flowing organization; error-free mechanics.', 'Effective arrangement; purposeful control and conclusion; sustained main idea; flowing organization; largely error-free.', 'Logical arrangement; attempts control and conclusion; evident main idea; lacks structure; errors that do not impede meaning.', 'Haphazard arrangement; uncontrolled, unconcluded; main idea not evident; incoherent organization; errors impede meaning.']
    }
  ]
};

function writtenWorkKey(assignmentId) {
  return `written::${assignmentId}`;
}

// R07 versioned assignment profiles (A-04). Assignments without `profiles`
// behave exactly as before. The legacy version keeps the original
// unsuffixed keys; every other version binds `::<version>` keys so old
// responses are never relabelled onto new prompts.
function assignmentVersions(assignment) {
  if (!assignment || !assignment.profiles || typeof assignment.profiles !== 'object') return [''];
  return Object.keys(assignment.profiles);
}

function activeAssignmentVersion(assignment) {
  if (assignment && assignment.profiles && assignment.activeProfile &&
      assignment.profiles[assignment.activeProfile]) {
    return assignment.activeProfile;
  }
  return '';
}

function profiledWorkKey(assignment, version) {
  const base = writtenWorkKey(assignment.id);
  if (!assignment.profiles || !version || version === assignment.legacyVersion) return base;
  return `${base}::${version}`;
}

function profiledDraftKey(assignment, version) {
  const base = `assignment-draft::${assignment.id}`;
  if (!assignment.profiles || !version || version === assignment.legacyVersion) return base;
  return `${base}::${version}`;
}

function profiledSummary(assignment, version) {
  const profile = assignment && assignment.profiles ? assignment.profiles[version] : null;
  if (profile && typeof profile.summary === 'string') return profile.summary;
  return assignment.summary;
}

function profiledInstructions(assignment, version) {
  const profile = assignment && assignment.profiles ? assignment.profiles[version] : null;
  if (profile && typeof profile.instructionsHtml === 'string') return profile.instructionsHtml;
  return assignment.instructionsHtml;
}

function assignmentHasResponse(assignment) {
  for (const version of assignmentVersions(assignment)) {
    if (String(readCourseResponse(profiledWorkKey(assignment, version)) || '').trim()) return true;
    // Draft boxes count only for versioned assignments (legacy-draft
    // continuation); single-profile completion stays written-key-only.
    if (assignment && assignment.profiles &&
        String(readCourseResponse(profiledDraftKey(assignment, version)) || '').trim()) return true;
  }
  return false;
}

function plainTextFromHtml(html) {
  const holder = document.createElement('div');
  holder.innerHTML = String(html || '');
  return (holder.textContent || '').replace(/\s+/g, ' ').trim();
}

function assignmentDescription(assignment) {
  const summary = String(assignment.summary || '').trim();
  if (summary && !/\.{3}|…$/.test(summary)) return summary;
  const paras = String(assignment.instructionsHtml || '').match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
  for (const para of paras) {
    const text = plainTextFromHtml(para);
    if (text.length > 60) return text;
  }
  return summary.replace(/\.{3}|…$/g, '').trim();
}

function renderWrittenRubric() {
  return `
    <div class="written-rubric">
      <h4>${escapeHtml(WRITTEN_RUBRIC.title)} · ${WRITTEN_RUBRIC.total} marks</h4>
      <p class="rubric-scoring">Comprehension counts double: 8 for comprehension, 4 for evidence, 4 for communication.</p>
      <table class="rubric-table">
        <thead>
          <tr>
            <th scope="col">Criteria</th>
            ${WRITTEN_RUBRIC.levels.map((level) => `<th scope="col">${escapeHtml(level.name)} (${level.points})</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${WRITTEN_RUBRIC.criteria.map((criterion) => `
            <tr>
              <th scope="row">${escapeHtml(criterion.name)}</th>
              ${criterion.cells.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderWrittenSteps() {
  return `
    <div class="written-steps">
      <h4>Steps to follow: the critical response format</h4>
      <ol>
        <li><strong>Statement.</strong> Turn the question into a thesis statement that answers it. Example (from the course criteria handout): asked what international organization divided Palestine in 1947, write "The international organization that divided Palestine in 1947 was ..."</li>
        <li><strong>Evidence.</strong> Give at least three reasons your statement is true, with embedded quotations or summarized proof from the text plus page numbers.</li>
        <li><strong>Interpret.</strong> Explain what your proof means. Restating the quote is not interpreting. Use starters: This means that ... / This tells us that ... / This shows that ... / From this we know ... / Now we understand that ... / Therefore ... / This is important because ...</li>
        <li><strong>Connect.</strong> Add personal or summary comments that connect your understanding to the response. Example (from the course criteria handout): after establishing the facts, note how the people affected felt — as the handout does when it connects Palestinian land loss to First Peoples of Canada who signed treaties.</li>
        <li>Write in complete sentences, in paragraph form, in the Your work box below. Then check against the rubric and use Mark Complete.</li>
      </ol>
    </div>
  `;
}

function renderWrittenLinks(assignment) {
  if (!assignment.links?.length || !isAssignmentUnlocked(assignment)) return '';
  return `
    <div class="link-list">
      ${assignment.links.map((link) => {
        const url = String(link.url || '');
        if (/^\.\/assets\/.+\.pdf$/i.test(url)) {
          return `<button type="button" class="link-button" data-view-local-doc="${escapeHtml(url)}" data-doc-title="${escapeHtml(link.name)}">${escapeHtml(link.name)}</button>`;
        }
        const docMatch = url.match(/^https:\/\/docs\.google\.com\/document\/d\/([A-Za-z0-9_-]+)/);
        if (docMatch) {
          const previewUrl = `https://docs.google.com/document/d/${docMatch[1]}/preview`;
          return `<button type="button" class="link-button" data-view-external-doc="${escapeHtml(previewUrl)}" data-doc-title="${escapeHtml(link.name)}" data-doc-source="${escapeHtml(url)}">${escapeHtml(link.name)}</button>`;
        }
        return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.name)}</a>`;
      }).join('')}
    </div>
  `;
}

function renderWrittenWorkField(assignment, version) {
  const resolved = version || activeAssignmentVersion(assignment);
  const key = profiledWorkKey(assignment, resolved);
  const value = readCourseResponse(key) || '';
  const hook = resolved ? `${assignment.id}::${resolved}` : assignment.id;
  const keyAttr = resolved ? ` data-written-key="${escapeHtml(key)}"` : '';
  return `
    <div class="written-work">
      <label for="written-${escapeHtml(hook)}"><strong>Your work.</strong> Write your response here and watch the save status while you work.</label>
      <textarea id="written-${escapeHtml(hook)}" class="activity-response" rows="8" data-written-response="${escapeHtml(hook)}"${keyAttr} ${!isAssignmentUnlocked(assignment) ? 'disabled' : ''}>${escapeHtml(value)}</textarea>
      <p class="written-work-meta"><span data-written-count="${escapeHtml(hook)}"></span></p>
    </div>
  `;
}

// R07: legacy history for versioned assignments. Rendered only when legacy
// work exists: the old prompt and text stay readable, and the legacy draft
// box stays writable. Nothing is moved onto the new prompt.
function renderLegacyProfileHistory(assignment) {
  if (!assignment || !assignment.profiles || !assignment.legacyVersion) return '';
  const legacy = assignment.legacyVersion;
  if (activeAssignmentVersion(assignment) === legacy) return '';
  const workKey = profiledWorkKey(assignment, legacy);
  const draftKey = profiledDraftKey(assignment, legacy);
  const legacyText = String(readCourseResponse(workKey) || '').trim();
  const legacyDraft = String(readCourseResponse(draftKey) || '');
  if (!legacyText && !legacyDraft.trim()) return '';
  const hook = `${assignment.id}::${legacy}`;
  return `
    <section class="legacy-profile-history" aria-label="Previous version of this assignment">
      <h4>Previous version (kept for your records)</h4>
      <p>This assignment used a different novel prompt. Your earlier work stays here exactly as saved; it is never moved onto the new prompt.</p>
      <p class="legacy-profile-prompt">${escapeHtml(profiledSummary(assignment, legacy))}</p>
      ${legacyText ? `<div class="mywork-draft" data-testid="legacy-profile-text">${escapeHtml(legacyText)}</div>` : ''}
      <div class="written-work">
        <label for="written-${escapeHtml(hook)}"><strong>Earlier draft (continues).</strong> You can keep editing this draft.</label>
        <textarea id="written-${escapeHtml(hook)}" class="activity-response" rows="6" data-written-response="${escapeHtml(hook)}" data-written-key="${escapeHtml(draftKey)}" ${!isAssignmentUnlocked(assignment) ? 'disabled' : ''}>${escapeHtml(legacyDraft)}</textarea>
        <p class="written-work-meta"><span data-written-count="${escapeHtml(hook)}"></span></p>
      </div>
    </section>
  `;
}

function renderWrittenAssignmentCard(assignment) {
    const locked = !isAssignmentUnlocked(assignment);
    const complete = completedAssignmentSet().has(assignment.id);
    const status = complete
      ? 'Completed.'
      : (locked ? `Unlocks after ${assignment.unitTitle || 'its theme'} is marked complete.` : 'Not yet complete.');
    const activeVersion = activeAssignmentVersion(assignment);
    const shown = activeVersion
      ? { summary: profiledSummary(assignment, activeVersion),
          instructions: profiledInstructions(assignment, activeVersion) }
      : { summary: assignment.summary, instructions: assignment.instructionsHtml };
    const conflictKeys = activeVersion
      ? assignmentVersions(assignment).map((version) => profiledWorkKey(assignment, version))
      : [writtenWorkKey(assignment.id)];
    return `
      <article class="detail-card assignment-detail${locked ? ' is-locked' : ''}${complete ? ' is-complete' : ''}" data-written-assignment="${escapeHtml(assignment.id)}">
        <div class="detail-head">
          <span class="card-code mono">${escapeHtml(assignment.unitTitle || 'Written assignment')}</span>
          <h3>${escapeHtml(assignment.title)}</h3>
          <p class="assignment-status">${escapeHtml(status)}</p>
        </div>
        <p class="assignment-description">${escapeHtml(assignmentDescription({ ...assignment, summary: shown.summary, instructionsHtml: shown.instructions }))}</p>
        ${!locked && assignment.textbook ? `
          <div class="textbook-band">
            <div>
              <strong>Read with a purpose</strong>
              <span>${escapeHtml(assignment.textbook.label || '')}</span>
            </div>
            <p><button type="button" class="social-reading-link" data-open-chapter="${escapeHtml(assignment.textbook.file || '')}" data-chapter-page="${lessonStartPage(assignment)}" data-chapter-title="${escapeHtml(assignment.textbook.title || 'Chapter')}">Read here at page ${lessonStartPage(assignment)}</button></p>
          </div>
        ` : ''}
        ${locked ? '<p>Complete the related theme to unlock the full instructions.</p>' : `<h4>Instructions</h4>${shown.instructions || ''}`}
        ${locked ? '' : renderWrittenSteps()}
        ${renderWrittenLinks(assignment)}
        ${renderWrittenRubric()}
        ${locked ? '' : renderConflictPanelsForKeys(conflictKeys)}
        ${locked ? '' : renderWrittenWorkField(assignment)}
        ${locked ? '' : renderLegacyProfileHistory(assignment)}
        ${locked ? '' : '<p class="activity-save-status" data-activity-save-status data-save-state="ready">Save status.</p>'}
        <div class="detail-actions">
          <button type="button" class="primary-button" data-mark-assignment="${escapeHtml(assignment.id)}" ${locked || complete ? 'disabled' : ''}>${complete ? 'Completed' : 'Mark Complete'}</button>
        </div>
      </article>
    `;
}

function updateWrittenCount(field) {
  const id = field?.dataset?.writtenResponse;
  if (!id) return;
  const words = String(field.value || '').trim().split(/\s+/).filter(Boolean).length;
  const host = document.querySelector(`[data-written-count="${CSS.escape(id)}"]`);
  if (host) host.textContent = `${words} ${words === 1 ? 'word' : 'words'} · ${saveStateWord()}`;
}

function bindWrittenWorkFields() {
  refs.contentBody.querySelectorAll('[data-written-response]').forEach((field) => {
    updateWrittenCount(field);
  });
}

// Booklet shells ("Make a copy of the assignment document...") from the
// import. The theme booklets now live in the course, so these stay in the
// data but never render as written assignments.
const BOOKLET_SHELL_ASSIGNMENT_IDS = new Set([
  'aboriginal-studies-30-theme-1-assignment',
  'aboriginal-studies-30-theme-2-assignment',
  'aboriginal-studies-30-theme-3-assignment',
  'aboriginal-studies-30-theme-4-assignment'
]);

function themeAssignments(unitId) {
  return assignments.filter((assignment) => assignment.unitId === unitId && !BOOKLET_SHELL_ASSIGNMENT_IDS.has(assignment.id));
}

function gotoThemeWritten(unitId) {
  if (!units.some((unit) => unit.id === unitId)) return;
  state.section = 'unit';
  state.activeUnitId = unitId;
  state.themeTab = 'written';
  saveJson(STORAGE_KEYS.ui, state);
  syncStudioPreviewRoute();
  render();
  window.scrollTo(0, 0);
}

function renderAssignments() {
  refs.contentBody.innerHTML = `
    <section class="course-page">
      <p class="course-kicker">Aboriginal Studies 30</p>
      <h2>Assignments</h2>
      <p class="page-intro">Written assignments live under each theme in its Written Assignments section, with full instructions, the marking rubric, and a place to write.</p>
      <section class="social-overview-section">
        <h3>How to complete a written assignment</h3>
        <ol>
          <li>Open your theme's Written Assignments section and read the full description and instructions.</li>
          <li>Check the response criteria and rubric links so you know how it is marked.</li>
          <li>Write your response in the Your work box and watch the save status.</li>
          <li>Use Mark Complete when you are finished.</li>
        </ol>
      </section>
    <div class="stack-list">
      ${units.map((unit) => {
        const items = themeAssignments(unit.id);
        if (!items.length) return '';
        const locked = !isUnitUnlocked(unit.id);
        const done = items.filter((assignment) => completedAssignmentSet().has(assignment.id)).length;
        return `
          <article class="stack-card assignment-card${locked ? ' is-locked' : ''}">
            <span class="card-code mono">${escapeHtml(unit.title)}</span>
            <h3>Written Assignments (${done}/${items.length})</h3>
            <p>${locked ? 'Complete the previous theme to unlock these assignments.' : 'Full instructions, the marking rubric, linked readings, and a place to write.'}</p>
            <div class="card-actions">
              <button type="button" data-theme-written-open="${escapeHtml(unit.id)}" ${locked ? 'disabled' : ''}>Open Written Assignments</button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
    </section>
  `;
  refs.contentBody.querySelectorAll('[data-theme-written-open]').forEach((button) => {
    button.addEventListener('click', () => gotoThemeWritten(button.dataset.themeWrittenOpen));
  });
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
  refs.contentBody.innerHTML = `
    <section class="course-page">
    <p class="course-kicker">${escapeHtml(assignment.unitTitle)}</p>
    <h2>${escapeHtml(assignment.title)}</h2>
    ${renderWrittenAssignmentCard(assignment)}
    <div class="lesson-bottom-bar">
      <button type="button" id="back-to-assignments" class="lesson-jump">Back to Assignments</button>
    </div>
    </section>
  `;
  document.getElementById('back-to-assignments')?.addEventListener('click', () => setSection('assignments'));
  bindWrittenWorkFields();
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
        <span class="chapter-status" aria-hidden="true"><i class="icon-glyph">${isActive ? '✓' : '○'}</i></span>
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
    refs.contentBody.innerHTML = `
      <section class="course-page">
        <p class="course-kicker">Aboriginal Studies 30</p>
        <h2>Library</h2>
        <div class="empty-card">
          <h3>No library files loaded yet</h3>
          <p>PDF resources can be added here without changing the course shell.</p>
        </div>
      </section>
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
  const viewerSrc = `${selected.file}#page=1`;
  const readerOpen = state.libraryReaderOpen !== false;
  const readerFullscreen = readerOpen && state.libraryReaderFullscreen === true;
  const selectedCode = selected.code || (selected.kind === 'chapter' ? 'Chapter' : 'Resource');

  document.body.classList.toggle('is-library-reader-fullscreen', readerFullscreen);
  refs.contentBody.innerHTML = `
    <section class="course-page">
    <p class="course-kicker">Aboriginal Studies 30</p>
    <h2>Library</h2>
    <p class="page-intro">Choose a chapter or resource to open it in the course viewer, or download the PDF for offline reading.</p>
    <section class="library-section">
      <div class="library-tools-row">
        <label class="library-search-box" for="library-search">
          <i class="icon-glyph" aria-hidden="true">⌕</i>
          <input id="library-search" type="search" value="${escapeHtml(state.librarySearch)}" placeholder="Search library..." autocomplete="off" />
        </label>
        <button class="library-tool-button" type="button" data-library-sort>
          <i class="icon-glyph" aria-hidden="true">⇅</i>
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
                <i class="icon-glyph" aria-hidden="true">▤</i>
                <span>${escapeHtml(formatLibraryPages(selected))}</span>
              </div>
            </div>
            <div class="chapter-actions">
              <button class="primary-action" type="button" id="toggle-library-reader">
                <i class="icon-glyph" aria-hidden="true">${readerOpen ? '✕' : '▷'}</i>
                ${readerOpen ? 'Close Viewer' : 'View Chapter'}
              </button>
              <button class="secondary-action reader-fullscreen-action" type="button" id="fullscreen-library-reader">
                <i class="icon-glyph" aria-hidden="true">${readerFullscreen ? '⤡' : '⤢'}</i>
                ${readerFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              </button>
              <a class="secondary-action" href="${escapeHtml(selected.file)}" target="_blank" rel="noopener noreferrer">
                <i class="icon-glyph" aria-hidden="true">⬇</i>
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
    refs.contentBody.innerHTML = `
      <section class="course-page">
        <p class="course-kicker">Aboriginal Studies 30</p>
        <h2>Film Room</h2>
        <div class="empty-card">
          <h3>No films loaded yet</h3>
          <p>Video resources can be added here without changing the course shell.</p>
        </div>
      </section>
    `;
    return;
  }
  const activeVideoNumber = Math.max(1, filmRoomItems.findIndex((item) => item.id === active.id) + 1);
  const activeType = toEmbedUrl(active.url) ? 'Embedded source' : 'Source link';
  const activeModuleLabel = moduleLabelFor(active);
  const activeModuleCode = moduleCodeFor(active);
  refs.contentBody.innerHTML = `
    <section class="course-page">
    <p class="course-kicker">Aboriginal Studies 30</p>
    <h2>Film Room</h2>
    <p class="page-intro">Use the playlist to switch videos without leaving the course shell.</p>
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
  return renderFilmEmbed(embedUrl, item.title);
}

function renderFilmEmbed(embedUrl, title) {
  return '<iframe src="' + escapeHtml(embedUrl) + '" title="' + escapeHtml(title || 'Video') + '" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="eager"></iframe>';
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

// T21: third-party embeds load ONLY after an explicit learner action. The
// facade keeps title + source host visible with zero network cost; the
// delegated [data-load-embed] handler swaps in the iframe on click.
function renderConsentEmbed(embedUrl, title) {
  let host = '';
  try {
    host = new URL(embedUrl).host;
  } catch (_error) {
    host = 'external source';
  }
  return `
    <div class="consent-embed" data-consent-embed>
      <p class="consent-embed-note">Video hosted on ${escapeHtml(host)}. Loading it contacts that service.</p>
      <button type="button" class="secondary-button" data-load-embed="${escapeHtml(embedUrl)}" data-embed-title="${escapeHtml(title || 'Video')}">Load video: ${escapeHtml(title || 'Video')}</button>
    </div>
  `;
}

function mountConsentEmbed(button) {
  if (!button || button.dataset.embedMounted === 'true') return false;
  const embedUrl = button.getAttribute('data-load-embed') || '';
  if (!embedUrl) return false;
  const host = button.closest('[data-consent-embed]') || button.parentElement;
  if (!host) return false;
  const frame = document.createElement('iframe');
  frame.src = embedUrl;
  frame.title = button.getAttribute('data-embed-title') || 'Video';
  frame.setAttribute('allow', 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
  frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
  frame.setAttribute('allowfullscreen', '');
  frame.setAttribute('loading', 'lazy');
  host.replaceWith(frame);
  return true;
}

function render() {
  // Every render follows navigation or a state change: flush pending writes
  // first (never silently drop them), then paint, then truthful status.
  try {
    flushPendingWrites();
    if (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.flush === 'function') AB30Store.flush();
  } catch (_error) { /* status below reports the failure */ }
  document.body.classList.toggle(
    'is-library-reader-fullscreen',
    state.section === 'library' && state.libraryReaderOpen !== false && state.libraryReaderFullscreen === true
  );
  updateProgress();
  setActiveNav();
  if (state.section === 'unit') renderUnit();
  else if (state.section === 'lesson') renderLesson();
  else if (state.section === 'quizzes') renderQuizzes();
  else if (state.section === 'assignments') renderAssignments();
  else if (state.section === 'assignment') renderAssignmentDetail();
  else if (state.section === 'library') renderLibrary();
  else if (state.section === 'film') renderFilmRoom();
  else if (state.section === 'vocabulary') renderVocabulary();
  else if (state.section === 'mywork') renderMyWork();
  else renderHome();
  refreshSaveStatus();
  announceRoute();
}

// T22: screen-reader route announcements. Pure text builder (testable) +
// a DOM writer called after every paint.
function routeAnnouncementText(activeState) {
  const section = (activeState && activeState.section) || 'home';
  if (section === 'lesson' && activeState.activeUnitId && activeState.activeLessonId) {
    const found = lessonTitleFor(activeState.activeUnitId, activeState.activeLessonId);
    if (found.lesson) return `Lesson: ${found.lesson.title || activeState.activeLessonId}`;
  }
  if (section === 'unit' && activeState.activeUnitId) {
    const unit = units.find((item) => item.id === activeState.activeUnitId);
    if (unit) return `Theme: ${unit.title || activeState.activeUnitId}`;
  }
  if (section === 'assignment' && activeState.activeAssignmentId) {
    const assignment = assignments.find((item) => item.id === activeState.activeAssignmentId);
    if (assignment) return `Assignment: ${assignment.title || activeState.activeAssignmentId}`;
  }
  const names = {
    home: 'Course overview', quizzes: 'Quizzes', assignments: 'Assignments',
    library: 'Library', film: 'Film room', vocabulary: 'Core vocabulary', mywork: 'All my work'
  };
  return names[section] || 'Course overview';
}

function announceRoute() {
  try {
    if (typeof document === 'undefined') return '';
    const node = document.getElementById('route-announcer');
    const text = routeAnnouncementText(typeof state !== 'undefined' ? state : null);
    if (node) node.textContent = text;
    return text;
  } catch (_error) {
    return '';
  }
}

function vocabularyThemeOptions() {
  return units
    .filter((unit) => (unit.lessons || []).length)
    .map((unit) => `<option value="${escapeHtml(unit.id)}">${escapeHtml(unit.title)}</option>`)
    .join('');
}

function renderVocabulary() {
  const theme = state.vocabTheme && units.some((unit) => unit.id === state.vocabTheme) ? state.vocabTheme : '';
  const query = String(state.vocabQuery || '').trim().toLowerCase();
  const matches = coreVocabulary.filter((entry) => {
    if (theme && entry.unitId !== theme) return false;
    if (query && !`${entry.term} ${entry.meaning}`.toLowerCase().includes(query)) return false;
    return true;
  });
  const selected = matches.some((entry) => entry.term === state.vocabWord)
    ? matches.find((entry) => entry.term === state.vocabWord)
    : (matches[0] || null);
  const groups = units
    .map((unit) => ({ unit, entries: matches.filter((entry) => entry.unitId === unit.id) }))
    .filter((group) => group.entries.length);
  const reader = selected ? (() => {
    const { unit, lesson } = lessonTitleFor(selected.unitId, selected.lessonId);
    const enrich = vocabEnrichmentFor(selected.term);
    const parts = (enrich && Array.isArray(enrich.parts)) ? enrich.parts : [];
    return `
      <article>
        <p class="eyebrow">${escapeHtml(unit?.title || 'Core Vocabulary')}</p>
        <h2>${escapeHtml(selected.term)}</h2>
        <div>
          <section>
            <h3>Meaning</h3>
            <p>${escapeHtml(selected.meaning || '')}</p>
          </section>
          ${enrich && enrich.what ? `
            <section>
              <h3>What it does</h3>
              <p>${escapeHtml(enrich.what)}</p>
            </section>
          ` : ''}
          ${enrich && enrich.confusion ? `
            <section class="common-confusion">
              <h3>Common confusion</h3>
              <p>${escapeHtml(enrich.confusion)}</p>
            </section>
          ` : ''}
          ${parts.length ? `
            <details class="word-more">
              <summary>More about this word</summary>
              <section>
                <h3>Word structure</h3>
                <dl class="word-parts">
                  ${parts.map((part) => `
                    <div>
                      <dt>${escapeHtml(part[0] || '')}</dt>
                      <dd>${escapeHtml(part[1] || '')}</dd>
                    </div>
                  `).join('')}
                </dl>
              </section>
            </details>
          ` : ''}
          <details class="drawer-frayer-disclosure">
            <summary>My Frayer</summary>
            ${renderVocabFrayer(selected.term)}
          </details>
          <section>
            <h3>Find it in the course</h3>
            ${lesson ? `<div class="dialog-actions"><button type="button" class="lesson-jump primary" data-goto-lesson="${escapeHtml(selected.unitId)}::${escapeHtml(selected.lessonId)}">Open lesson</button></div>` : ''}
          </section>
        </div>
      </article>
    `;
  })() : '<div class="empty-card"><h3>No terms match</h3><p>Clear the search or choose another theme.</p></div>';
  refs.contentBody.innerHTML = `
    <section class="course-page">
      <p class="course-kicker">Aboriginal Studies 30</p>
      <h2>Core Vocabulary</h2>
      <p class="page-intro">Every key term from the theme lessons in one place. Choose a theme and word on the left; the word opens on the right with its meaning and a link to the lesson that teaches it.</p>
      <div class="vocabulary-tools">
        <label>Search terms
          <input type="search" id="vocab-search" value="${escapeHtml(state.vocabQuery || '')}" placeholder="Type to filter terms" />
        </label>
        <label>Theme
          <select id="vocab-theme">
            <option value="">All themes (${coreVocabulary.length} terms)</option>
            ${vocabularyThemeOptions()}
          </select>
        </label>
      </div>
      <p class="vocab-count" data-vocab-count>${matches.length} of ${coreVocabulary.length} terms</p>
      <div class="vocabulary-layout">
        <nav class="vocabulary-index" aria-label="Vocabulary themes and words">
          ${groups.map((group) => `
            <section class="word-category">
              <h2>${escapeHtml(group.unit.title)}</h2>
              ${group.entries.map((entry) => `
                <button type="button" data-vocab-select="${escapeHtml(entry.term)}" aria-pressed="${selected && entry.term === selected.term ? 'true' : 'false'}">${escapeHtml(entry.term)}</button>
              `).join('')}
            </section>
          `).join('')}
        </nav>
        <div class="vocabulary-reader">${reader}</div>
      </div>
    </section>
  `;
  const search = document.getElementById('vocab-search');
  const select = document.getElementById('vocab-theme');
  if (select && theme) select.value = theme;
  search?.addEventListener('input', () => {
    state.vocabQuery = search.value;
    saveJson(STORAGE_KEYS.ui, state);
    renderVocabulary();
    const again = document.getElementById('vocab-search');
    again?.focus();
    if (again instanceof HTMLInputElement) {
      again.setSelectionRange(again.value.length, again.value.length);
    }
  });
  select?.addEventListener('change', () => {
    state.vocabTheme = select.value;
    saveJson(STORAGE_KEYS.ui, state);
    renderVocabulary();
  });
  refs.contentBody.querySelectorAll('[data-vocab-select]').forEach((button) => {
    button.addEventListener('click', () => {
      state.vocabWord = button.dataset.vocabSelect || '';
      saveJson(STORAGE_KEYS.ui, state);
      renderVocabulary();
      const pressed = refs.contentBody.querySelector('[data-vocab-select][aria-pressed="true"]');
      if (pressed instanceof HTMLElement) pressed.focus({ preventScroll: true });
    });
  });
}

refs.navHome?.addEventListener('click', () => setSection('home'));
refs.navQuizzes?.addEventListener('click', () => setSection('quizzes'));
refs.navAssignments?.addEventListener('click', () => setSection('assignments'));
refs.navLibrary?.addEventListener('click', () => setSection('library'));
refs.navFilm?.addEventListener('click', () => setSection('film'));
refs.navVocabulary?.addEventListener('click', () => setSection('vocabulary'));
refs.navMywork?.addEventListener('click', () => setSection('mywork'));
refs.sidebarToggle?.addEventListener('click', toggleSidebar);
refs.topbarMenuToggle?.addEventListener('click', toggleSidebar);
refs.menuScrim?.addEventListener('click', () => setMobileMenu(false));
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('resize', () => syncTopbarOffset());
}
refs.contentBody?.addEventListener('click', (event) => {
  const embedButton = event.target.closest('[data-load-embed]');
  if (embedButton) {
    mountConsentEmbed(embedButton);
    return;
  }
  const opener = event.target.closest('[data-open-chapter]');
  if (opener) {
    openChapterViewer(
      opener.dataset.openChapter,
      Number(opener.dataset.chapterPage) || 1,
      opener.dataset.chapterTitle || 'Chapter',
      opener
    );
    return;
  }
  const vocabButton = event.target.closest('[data-vocab-term]');
  if (vocabButton) {
    openVocabularyViewer(vocabButton.dataset.vocabTerm, vocabButton);
    return;
  }
});
document.addEventListener('click', (event) => {
  const gotoButton = event.target.closest('[data-goto-lesson]');
  if (!gotoButton) return;
  const [unitId, lessonId] = String(gotoButton.dataset.gotoLesson || '').split('::');
  if (unitId && lessonId) gotoLesson(unitId, lessonId);
});
document.addEventListener('click', (event) => {
  const lessonLink = event.target.closest('[data-lesson-link]');
  if (!lessonLink) return;
  const [unitId, lessonId] = String(lessonLink.dataset.lessonLink || '').split('::');
  if (unitId && lessonId) {
    event.preventDefault();
    setActiveLesson(unitId, lessonId);
  }
});
document.addEventListener('click', (event) => {
  const startButton = event.target.closest('[data-practice-start]');
  if (startButton) {
    const mode = startButton.dataset.practiceStart || 'matching';
    const card = startButton.closest('.practice-mode-card');
    const attemptMode = card?.querySelector(`input[name="practice-attempt-mode-${mode}"]:checked`)?.value || 'independent';
    const count = Number(card?.querySelector('[data-practice-count]')?.value) || 5;
    const started = startPracticeMode(mode, attemptMode, count, Date.now());
    if (!started.ok) {
      practiceView.lastResult = started;
      practiceView.screen = 'catalog';
    }
    render();
    return;
  }
  const cardsButton = event.target.closest('[data-practice-cards]');
  if (cardsButton) {
    practiceView = { screen: 'cards', runId: null, lastResult: null };
    render();
    return;
  }
  const resumeButton = event.target.closest('[data-practice-resume]');
  if (resumeButton) {
    resumePracticeRun(resumeButton.dataset.practiceResume);
    return;
  }
  const catalogButton = event.target.closest('[data-practice-catalog]');
  if (catalogButton) {
    backToPracticeCatalog();
    return;
  }
  const submitButton = event.target.closest('[data-practice-submit]');
  if (submitButton && practiceView.runId) {
    const itemId = submitButton.dataset.practiceSubmit || '';
    const scope = submitButton.closest('.practice-item') || document;
    const checked = scope.querySelector('input[data-practice-option]:checked');
    const reasoning = scope.querySelector('textarea[data-practice-reasoning]');
    submitPracticeItem(practiceView.runId, itemId, {
      selectedOptions: checked ? [checked.value] : [],
      response: reasoning ? reasoning.value : ''
    });
    render();
    return;
  }
  const reviseButton = event.target.closest('[data-practice-revise]');
  if (reviseButton && practiceView.runId) {
    const itemId = reviseButton.dataset.practiceRevise || '';
    const scope = reviseButton.closest('.practice-item') || document;
    const checked = scope.querySelector('input[data-practice-revise-option]:checked');
    if (checked) revisePracticeItem(practiceView.runId, itemId, { selectedOptions: [checked.value], response: '' });
    render();
    return;
  }
  const finishButton = event.target.closest('[data-practice-finish]');
  if (finishButton && practiceView.runId) {
    finishPracticeRunUi(practiceView.runId);
    render();
    return;
  }
  const abandonButton = event.target.closest('[data-practice-abandon]');
  if (abandonButton && practiceView.runId) {
    const confirmed = typeof window.confirm === 'function' ? window.confirm('Abandon this practice run? Submitted answers stay saved.') : true;
    if (confirmed) abandonPracticeRun(practiceView.runId);
    render();
  }
});
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('popstate', () => {
    try {
      applyRouteFromUrl();
      render();
      if (state.section === 'lesson') focusLessonHeading();
    } catch (_error) { /* keep the current view; Back/Forward must never blank the page */ }
  });
}
document.addEventListener('click', (event) => {
  const vocabButton = event.target.closest('[data-goto-vocab]');
  if (!vocabButton) return;
  closeCourseDialog();
  state.vocabWord = vocabButton.dataset.gotoVocab || '';
  saveJson(STORAGE_KEYS.ui, state);
  setSection('vocabulary');
});
document.addEventListener('click', (event) => {
  const markButton = event.target.closest('[data-mark-assignment]');
  if (!markButton || markButton.disabled) return;
  markAssignmentComplete(markButton.dataset.markAssignment);
});
document.addEventListener('click', (event) => {
  const backButton = event.target.closest('[data-theme-lessons]');
  if (!backButton) return;
  state.themeTab = 'lessons';
  saveJson(STORAGE_KEYS.ui, state);
  render();
});
document.addEventListener('input', (event) => {
  const field = event.target.closest('[data-written-response]');
  if (!field || field.disabled) return;
  saveActivityResponse(field.dataset.writtenKey || writtenWorkKey(field.dataset.writtenResponse), field.value);
  updateWrittenCount(field);
});
function openDocumentViewer({ file, title, trigger, newTabUrl }) {
  if (!file) return;
  sidebarCollapsedBeforeReader = isSidebarCollapsed();
  if (!sidebarCollapsedBeforeReader) {
    state.sidebarCollapsed = true;
    saveJson(STORAGE_KEYS.ui, state);
    applySidebarState();
  }
  openCourseDialog({
    kicker: 'Reading',
    title,
    returnFocus: trigger,
    bodyHtml: `
      <iframe class="chapter-frame" title="${escapeHtml(title)}" src="${escapeHtml(file)}"></iframe>
      <div class="dialog-actions">
        <a class="lesson-jump" href="${escapeHtml(newTabUrl || file)}" target="_blank" rel="noopener noreferrer">Open in new tab</a>
      </div>
    `
  });
}
document.addEventListener('click', (event) => {
  const docButton = event.target.closest('[data-view-local-doc]');
  if (!docButton) return;
  openDocumentViewer({
    file: docButton.dataset.viewLocalDoc || '',
    title: docButton.dataset.docTitle || 'Reading',
    trigger: docButton
  });
});
document.addEventListener('click', (event) => {
  const docButton = event.target.closest('[data-view-external-doc]');
  if (!docButton) return;
  openDocumentViewer({
    file: docButton.dataset.viewExternalDoc || '',
    title: docButton.dataset.docTitle || 'Document',
    trigger: docButton,
    newTabUrl: docButton.dataset.docSource || ''
  });
});
document.addEventListener('change', (event) => {
  if (event.target && event.target.id === 'course-dialog-word-select') {
    openVocabularyViewer(event.target.value, null, true);
  }
});
refs.dialogClose?.addEventListener('click', closeCourseDialog);
refs.dialog?.addEventListener('close', handleDialogClose);
sidebarForcedCollapseQuery?.addEventListener?.('change', applySidebarState);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (isMobileMenuOpen()) {
    setMobileMenu(false);
    return;
  }
  if (!state.libraryReaderFullscreen) return;
  state.libraryReaderFullscreen = false;
  saveJson(STORAGE_KEYS.ui, state);
  renderLibrary();
});

// R03 first-submission + revision lifecycle (spec S-03/S-04). Surgical DOM
// updates only: no whole-lesson re-render on submit; learner text enters
// via textContent, never innerHTML.
function taskForSection(section) {
  return {
    id: section.dataset.taskId || '',
    contentVersion: section.dataset.contentVersion || 'legacy-v0',
    sourceIds: [],
    stimulusId: ''
  };
}

function submissionCommandId(taskId, text) {
  try {
    if (typeof AB30LearningStoreInternals !== 'undefined' && AB30LearningStoreInternals
      && typeof AB30LearningStoreInternals.storeHash === 'function') {
      return 'cmd:' + AB30LearningStoreInternals.storeHash(taskId + '\n' + text);
    }
  } catch (_error) { /* degraded fallback below */ }
  return 'cmd:' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e9).toString(36);
}

function setSectionStatus(section, text) {
  const node = section ? section.querySelector('[data-task-status]') : null;
  if (node) node.textContent = text || '';
}

function submissionTaskReady() {
  return storeAvailable() && typeof AB30Store.submitFirstResponse === 'function';
}

function bindSubmissionLifecycle() {
  refs.contentBody.querySelectorAll('[data-submit-first]').forEach((button) => {
    button.addEventListener('click', () => submitFirstFromSection(button));
  });
  refs.contentBody.querySelectorAll('[data-comparison-toggle]').forEach((button) => {
    button.addEventListener('click', () => openComparisonFromSection(button));
  });
  refs.contentBody.querySelectorAll('[data-submit-revision]').forEach((button) => {
    button.addEventListener('click', () => submitRevisionFromSection(button));
  });
}

// R08: in-lesson supported selections run real engine sessions — one
// in-progress supported run per item, first check persisted as the first
// attempt, later checks as revisions, exposure recorded either way.
// Feedback appears in place; nothing re-renders.
function supportedCheckReady() {
  return !!(practiceStore() && practiceEngine() && practiceBank());
}

function ensureSupportedRun(store, engine, item) {
  const open = (store.listPracticeRuns().runs || []).filter((run) =>
    run && run.status === 'in-progress' && run.mode === 'selected-response' &&
    (run.itemIds || []).indexOf(item.id) !== -1);
  if (open.length) return { ok: true, run: open[0], reused: true };
  return engine.startRun(store, {
    mode: 'selected-response',
    attemptMode: 'supported',
    items: [item],
    seed: item.id
  });
}

function supportedSelectionItem(itemId) {
  const store = practiceStore();
  const engine = practiceEngine();
  const bank = practiceBank();
  if (!store || !engine || !bank) return null;
  const bankItem = bank.itemById(itemId);
  if (!bankItem) return null;
  const built = engine.buildSelectedResponseItems([bankItem], itemId, bank.BANK_VERSION, store.getPracticeExposure());
  return built.length ? built[0] : null;
}

function bindSupportedSelections() {
  refs.contentBody.querySelectorAll('[data-supported-check]').forEach((button) => {
    button.addEventListener('click', () => supportedCheckFromSection(button));
  });
}

function supportedCheckFromSection(button) {
  const section = button.closest('[data-supported-item]');
  const feedback = section ? section.querySelector('[data-testid="supported-feedback"]') : null;
  if (!section || !feedback) return;
  const itemId = section.dataset.supportedItem || '';
  const checked = section.querySelector('input[type="radio"]:checked');
  feedback.hidden = false;
  if (!checked) {
    feedback.textContent = 'Choose an answer first, then select Check answer.';
    return;
  }
  if (!supportedCheckReady()) {
    feedback.textContent = 'Practice scripts failed to load. Reload the page; your saved work is unaffected.';
    return;
  }
  const store = practiceStore();
  const engine = practiceEngine();
  const item = supportedSelectionItem(itemId);
  if (!item) {
    feedback.textContent = 'This item is not a reviewed practice item yet, so it cannot be checked.';
    return;
  }
  const runResult = ensureSupportedRun(store, engine, item);
  if (!runResult.ok || !runResult.run) {
    feedback.textContent = `Could not start a practice session (${(runResult && runResult.code) || 'unknown'}) — your choice is kept above. Fix saving, then check again.`;
    return;
  }
  const run = runResult.run;
  const firstId = ((run.attemptIds || {})[engine.practiceTaskId(item)] || [])[0] || null;
  const input = { response: '', selectedOptions: [checked.value] };
  const result = firstId
    ? engine.submitRevision(store, run, item, firstId, input)
    : engine.submitFirst(store, run, item, input);
  if (!result.ok) {
    feedback.textContent = `Save failed (${result.code || 'unknown'}) — your choice is kept above. Fix saving, then check again.`;
    return;
  }
  engine.recordExposure(store, itemId, `${firstId ? 'revision' : 'feedback'}:${result.attemptId}`);
  const judged = result.feedback || engine.feedbackFor(item, checked.value);
  feedback.textContent = `${judged.correct ? 'Correct. ' : 'Not quite yet. '}${judged.text || ''}`;
}

function submitFirstFromSection(button) {
  const section = button.closest('[data-task-id]');
  if (!section || !submissionTaskReady()) return;
  const task = taskForSection(section);
  const draft = section.querySelector('[data-activity-response]');
  const text = draft ? draft.value : '';
  button.disabled = true;
  const result = AB30Store.submitFirstResponse(task, submissionCommandId(task.id, text), text);
  if (result && result.ok) {
    unlockSectionAfterFirstSubmit(section, result.submission);
    setSectionStatus(section, '');
    refreshSaveStatus();
    const toggle = section.querySelector('[data-comparison-toggle]');
    if (toggle) toggle.focus();
    return;
  }
  button.disabled = false;
  setSectionStatus(section, 'Save failed — your text is kept above. Retry, or export your work from All My Work.');
  refreshSaveStatus();
}

function unlockSectionAfterFirstSubmit(section, submission) {
  const key = section.dataset.taskId || '';
  // Frozen first submission (text node: untrusted learner text).
  const saveButton = section.querySelector('[data-submit-first]');
  const frozen = document.createElement('div');
  frozen.className = 'submission-frozen';
  const frozenLabel = document.createElement('p');
  frozenLabel.className = 'section-label';
  frozenLabel.textContent = 'First submission (kept as submitted)';
  const frozenText = document.createElement('blockquote');
  frozenText.setAttribute('data-testid', 'first-submission-text');
  frozenText.textContent = (submission && submission.text) || '';
  frozen.appendChild(frozenLabel);
  frozen.appendChild(frozenText);
  if (saveButton && saveButton.parentNode) saveButton.parentNode.replaceWith(frozen);
  // Criteria region: locked note becomes an explicit (exposure-recorded) toggle.
  const region = section.querySelector('[data-criteria-region]');
  if (region) {
    const criteriaText = region.dataset.criteria || '';
    region.textContent = '';
    const actions = document.createElement('p');
    actions.className = 'submission-actions';
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'lesson-jump';
    toggle.setAttribute('data-testid', 'comparison-toggle');
    toggle.setAttribute('data-comparison-toggle', key);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Compare with criteria';
    toggle.addEventListener('click', () => openComparisonFromSection(toggle));
    actions.appendChild(toggle);
    const body = document.createElement('div');
    body.className = 'task-criteria';
    body.setAttribute('data-testid', 'comparison-criteria');
    body.hidden = true;
    const bodyText = document.createElement('p');
    bodyText.textContent = criteriaText;
    body.appendChild(bodyText);
    region.appendChild(actions);
    region.appendChild(body);
  }
  // Revision area.
  const revision = document.createElement('div');
  revision.className = 'revision-area';
  const revisionLabel = document.createElement('label');
  const draft = section.querySelector('[data-activity-response]');
  const seed = (draft && draft.value.trim()) ? draft.value : ((submission && submission.text) || '');
  const revisionId = 'revision-live-' + key.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40);
  revisionLabel.setAttribute('for', revisionId);
  revisionLabel.textContent = 'Revise your response (your first submission is kept)';
  const revisionDraft = document.createElement('textarea');
  revisionDraft.id = revisionId;
  revisionDraft.className = 'activity-response';
  revisionDraft.rows = 5;
  revisionDraft.setAttribute('data-testid', 'revision-draft');
  revisionDraft.setAttribute('data-revision-draft', key);
  revisionDraft.value = seed;
  const revisionActions = document.createElement('p');
  revisionActions.className = 'submission-actions';
  const revisionButton = document.createElement('button');
  revisionButton.type = 'button';
  revisionButton.className = 'lesson-jump';
  revisionButton.setAttribute('data-testid', 'save-revision');
  revisionButton.setAttribute('data-submit-revision', key);
  revisionButton.textContent = 'Save revision';
  revisionButton.addEventListener('click', () => submitRevisionFromSection(revisionButton));
  revisionActions.appendChild(revisionButton);
  revision.appendChild(revisionLabel);
  revision.appendChild(revisionDraft);
  revision.appendChild(revisionActions);
  section.appendChild(revision);
}

function openComparisonFromSection(button) {
  const section = button.closest('[data-task-id]');
  if (!section) return;
  const region = section.querySelector('[data-criteria-region]');
  const body = region ? region.querySelector('[data-testid="comparison-criteria"]') : null;
  if (submissionTaskReady()) {
    AB30Store.recordExposure(taskForSection(section), 'comparison-opened');
  }
  if (body) body.hidden = false;
  button.setAttribute('aria-expanded', 'true');
}

function submitRevisionFromSection(button) {
  const section = button.closest('[data-task-id]');
  if (!section || !submissionTaskReady()) return;
  const task = taskForSection(section);
  const draft = section.querySelector('[data-revision-draft]');
  const text = draft ? draft.value : '';
  const prior = AB30Store.submissionsForTask(task.id) || [];
  const parent = prior.length ? prior[prior.length - 1] : null;
  if (!parent) {
    setSectionStatus(section, 'Save your first response before revising.');
    return;
  }
  button.disabled = true;
  const result = AB30Store.submitRevision(task, submissionCommandId(task.id + ':' + parent.id, text), parent.id, text);
  if (result && result.ok) {
    appendRevisionToSection(section, result.submission, prior.filter((item) => item.parentAttemptId).length + 1);
    setSectionStatus(section, '');
    refreshSaveStatus();
    button.disabled = false;
    return;
  }
  button.disabled = false;
  setSectionStatus(section, 'Save failed — your revision text is kept above. Retry, or export your work from All My Work.');
  refreshSaveStatus();
}

function appendRevisionToSection(section, submission, number) {
  const area = section.querySelector('.revision-area');
  if (!area) return;
  const label = document.createElement('p');
  label.className = 'section-label';
  label.textContent = 'Revision ' + number;
  const text = document.createElement('blockquote');
  text.setAttribute('data-testid', 'latest-revision-text');
  text.textContent = (submission && submission.text) || '';
  area.appendChild(label);
  area.appendChild(text);
}

// Seam boundary (test harness slices functions up to the next top-level
// declaration): keeps the listener registrations below out of slices.
const R03_SUBMISSION_LIFECYCLE_DEFINED = true;

// R02 cross-tab minimum: forward external tracked-key writes to the store,
// which holds local automatic overwrites and keeps both candidates.
window.addEventListener('storage', (event) => {
  try {
    if (storeAvailable() && typeof AB30Store.noteExternalChange === 'function'
      && (event.key === STORAGE_KEYS.ui || event.key === STORAGE_KEYS.progress || event.key === STORAGE_KEYS.activityResponses)) {
      AB30Store.noteExternalChange(event.key);
      refreshSaveStatus();
    }
  } catch (_error) { /* observation only; never break navigation */ }
});

// R03: debounced drafts flush on lifecycle edges (sync store writes).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    try { flushDebouncedDrafts(); } catch (_error) { /* never break unload */ }
  }
});
window.addEventListener('pagehide', () => {
  try { flushDebouncedDrafts(); } catch (_error) { /* never break unload */ }
});

window.addEventListener('beforeunload', (event) => {
  let pending = { ok: true };
  let flushed = { ok: true };
  try {
    flushDebouncedDrafts();
    pending = flushPendingWrites();
  } catch (_error) {
    pending = { ok: false };
  }
  try {
    if (typeof AB30Store !== 'undefined' && AB30Store && typeof AB30Store.flush === 'function') flushed = AB30Store.flush();
  } catch (_error) {
    flushed = { ok: false };
  }
  if (!pending.ok || !flushed.ok) event.preventDefault();
});

applySidebarState();
// Apply the initial deep link after navigation allowlists and draft queues exist.
applyRouteFromUrl();
render();
syncTopbarOffset();
if (state.section !== 'home') syncStudioPreviewRoute();
