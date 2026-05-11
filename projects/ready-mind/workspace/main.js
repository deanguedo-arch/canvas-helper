const SIDEBAR_COLLAPSE_KEY = 'readymind.sidebarCollapsed';
const SIDEBAR_BREAKPOINT = 860;

const MATERIALS = [
  { id: 'm0', code: '00', title: 'What Is Mental Readiness?', desc: 'Orientation, baseline, and course overview.', color: '#64748b', file: '' },
  { id: 'm1', code: '01', title: 'The Ready State', desc: 'Stress, anxiety, energy, and body regulation.', color: '#14b8a6', file: '' },
  { id: 'm2', code: '02', title: 'Sustainable Discipline', desc: 'Motivation, values, routines, and recovery.', color: '#f59e0b', file: '' },
  { id: 'm3', code: '03', title: 'Focused Action', desc: 'Attention, distraction, overthinking, and study focus.', color: '#22c55e', file: '' },
  { id: 'm4', code: '04', title: 'Confidence Before the Moment', desc: 'Preparation, confidence, and mental rehearsal.', color: '#38bdf8', file: '' }
];

const PHASES = [
  { id: 'phase-0', code: 'Diagnostic', title: 'What Is Mental Readiness?', body: 'Placeholder: add orientation content, baseline reflection, and readiness checkpoints.', accent: '#64748b', image: '' },
  { id: 'phase-1', code: 'Phase 1', title: 'The Ready State', body: 'Placeholder: add stress, anxiety, activation, breathing, and reset content.', accent: '#14b8a6', image: '' },
  { id: 'phase-2', code: 'Phase 2', title: 'Sustainable Discipline', body: 'Placeholder: add motivation, values, habits, recovery, and burnout-prevention content.', accent: '#f59e0b', image: '' },
  { id: 'phase-3', code: 'Phase 3', title: 'Focused Action', body: 'Placeholder: add focus, distraction, overthinking, study skills, and attention-control content.', accent: '#22c55e', image: '' },
  { id: 'phase-4', code: 'Phase 4', title: 'Confidence Before the Moment', body: 'Placeholder: add confidence, preparation, mental rehearsal, and pressure-routine content.', accent: '#38bdf8', image: '' }
];

const ASSIGNMENTS = [
  {
    id: 'a0',
    code: '00',
    title: 'Ready Mind Baseline',
    accent: '#64748b',
    body: 'Baseline placeholder for current stress, focus, confidence, recovery, and next-action habits.',
    eyebrow: 'Diagnostic',
    heroTitle: 'Ready Mind Baseline',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.baseline.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a1',
    code: '01',
    title: 'Stress Reset Plan',
    accent: '#14b8a6',
    body: 'Placeholder for a practical reset plan that helps a learner regulate pressure before choosing the next action.',
    eyebrow: 'Phase 1',
    heroTitle: 'Stress Reset Plan',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.stress-reset-plan.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a2a',
    code: '02A',
    title: 'Values-to-Action Blueprint',
    accent: '#f59e0b',
    body: 'Placeholder for translating values into visible actions and decision filters.',
    eyebrow: 'Phase 2',
    heroTitle: 'Values-to-Action Blueprint',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.values-blueprint.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a2b',
    code: '02B',
    title: 'Sustainable Routine Builder',
    accent: '#f59e0b',
    body: 'Placeholder for routines that balance effort, recovery, repetition, and flexibility.',
    eyebrow: 'Phase 2',
    heroTitle: 'Sustainable Routine Builder',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.sustainable-routine.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a3',
    code: '03',
    title: 'Focus System Blueprint',
    accent: '#22c55e',
    body: 'Placeholder for attention control, distraction response, and study-focus routines.',
    eyebrow: 'Phase 3',
    heroTitle: 'Focus System Blueprint',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.focus-system.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a4a',
    code: '04A',
    title: 'Confidence Evidence Plan',
    accent: '#38bdf8',
    body: 'Placeholder for building confidence from preparation evidence and useful self-talk.',
    eyebrow: 'Phase 4',
    heroTitle: 'Confidence Evidence Plan',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.confidence-evidence.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  },
  {
    id: 'a4b',
    code: '04B',
    title: 'Mental Rehearsal Plan',
    accent: '#38bdf8',
    body: 'Placeholder for mental rehearsal, pressure routines, and recovery after disruption.',
    eyebrow: 'Phase 4',
    heroTitle: 'Mental Rehearsal Plan',
    introCopy: 'Placeholder: add Ready Mind instructions, checkpoints, and reflection prompts after lesson content is finalized.',
    storageKey: 'readymind.mental-rehearsal.v1',
    steps: ['Brief', 'Build', 'Review'],
    introCards: [
      { title: 'Brief', body: 'Placeholder: define the situation and the learner goal.' },
      { title: 'Build', body: 'Placeholder: add the planning prompts and practice steps.' },
      { title: 'Review', body: 'Placeholder: add reflection, revision, and export guidance.' }
    ],
    panels: []
  }
];

const PERFORMANCE_TOOLS = [
  { id: 'stress-state-simulator-placeholder', code: 'Tool 01', title: 'Stress State Simulator', eyebrow: 'Coming soon', accent: '#14b8a6', body: 'Placeholder: add a life-performance stress regulation activity here.', viewerSrc: '' },
  { id: 'focus-reset-simulator-placeholder', code: 'Tool 02', title: 'Focus Reset Simulator', eyebrow: 'Coming soon', accent: '#22c55e', body: 'Placeholder: add a distraction and refocus activity here.', viewerSrc: '' }
];

const FILM_ROOM_VIDEOS = [];

const QUIZZES = [
  { id: 'quiz-ready-mind-baseline-check', code: 'Quiz 00', title: 'Ready Mind Baseline Check', accent: '#64748b', phaseId: 'phase-0', body: 'Questions will be added after lesson content is finalized.', questionCount: 0, sourcePdf: '', questions: [] },
  { id: 'quiz-ready-state', code: 'Quiz 01', title: 'The Ready State', accent: '#14b8a6', phaseId: 'phase-1', body: 'Questions will be added after lesson content is finalized.', questionCount: 0, sourcePdf: '', questions: [] },
  { id: 'quiz-sustainable-discipline', code: 'Quiz 02', title: 'Sustainable Discipline', accent: '#f59e0b', phaseId: 'phase-2', body: 'Questions will be added after lesson content is finalized.', questionCount: 0, sourcePdf: '', questions: [] },
  { id: 'quiz-focused-action', code: 'Quiz 03', title: 'Focused Action', accent: '#22c55e', phaseId: 'phase-3', body: 'Questions will be added after lesson content is finalized.', questionCount: 0, sourcePdf: '', questions: [] },
  { id: 'quiz-confidence-before-the-moment', code: 'Quiz 04', title: 'Confidence Before the Moment', accent: '#38bdf8', phaseId: 'phase-4', body: 'Questions will be added after lesson content is finalized.', questionCount: 0, sourcePdf: '', questions: [] }
];

const PHASE_CONTENT = {};

// DOCX-derived Phase 1 rebuild
const ASSIGNMENT_RUNTIME_VIEW = {
  a0: 'intro',
  a1: 'phase1',
  a2a: 'values',
  a2b: 'master',
  a3: 'phase3',
  a4a: 'phase4a',
  a4b: 'phase4b'
};

const ASSIGNMENT_RUNTIME_HTML_SRC = './assignment-runtime.html';
const ASSIGNMENT_RUNTIME_SCRIPT_SRC = './assignment-runtime-main.js';
const ASSIGNMENT_RUNTIME_TAILWIND_SRC = 'https://cdn.tailwindcss.com';
const ASSIGNMENT_RUNTIME_FONTS_HREF = 'https://fonts.googleapis.com/css?family=Inter:ital,wght@0,400;0,700;1,400;1,900&family=JetBrains+Mono:wght@700&display=swap';

const assignmentRuntimeState = {
  htmlPromise: null,
  runtimePromise: null,
  tailwindPromise: null,
  fontsPromise: null,
  viewMarkup: new Map(),
  requestToken: 0
};

const state = {
  section: 'home',
  tab: 'phases',
  activeId: PHASES[0]?.id || null,
  activePerformanceView: 'menu',
  activePerformanceToolId: PERFORMANCE_TOOLS[0]?.id || null,
  activeFilmRoomVideoId: FILM_ROOM_VIDEOS[0]?.id || null,
  activeStep: 0,
  activeMaterialId: null
};

const AUTHORING_UNLOCK_ALL = true;
const COURSE_PROGRESS_KEY = 'readymind.course-progress.v1';
const UI_STATE_KEY = 'readymind.ui-state.v1';
const PHASE_ASSIGNMENT_MAP = {
  'phase-0': ['a0'],
  'phase-1': ['a1'],
  'phase-2': ['a2a', 'a2b'],
  'phase-3': ['a3'],
  'phase-4': ['a4a', 'a4b']
};
const ASSIGNMENT_PHASE_MAP = Object.fromEntries(
  Object.entries(PHASE_ASSIGNMENT_MAP).flatMap(([phaseId, assignmentIds]) => assignmentIds.map((assignmentId) => [assignmentId, phaseId]))
);
const PHASE_QUIZ_MAP = Object.fromEntries(QUIZZES.filter((item) => item.phaseId).map((item) => [item.phaseId, item.id]));

function loadStoredJson(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : null;
  } catch (_error) {
    return null;
  }
}

function getDefaultActiveIdForTab(tab) {
  if (tab === 'quizzes') return QUIZZES[0]?.id || null;
  if (tab === 'assignments') return ASSIGNMENTS[0]?.id || null;
  return PHASES[0]?.id || null;
}

function normalizeUiState(rawState) {
  if (!rawState || typeof rawState !== 'object') {
    return null;
  }

  const nextSection = typeof rawState.section === 'string' ? rawState.section : 'home';
  const nextTab = typeof rawState.tab === 'string' ? rawState.tab : 'phases';
  const normalized = {
    section: ['home', 'phase', 'assignment', 'quiz', 'library', 'performance', 'icons'].includes(nextSection) ? nextSection : 'home',
    tab: ['phases', 'quizzes', 'assignments'].includes(nextTab) ? nextTab : 'phases',
    activeId: null,
    activePerformanceToolId: PERFORMANCE_TOOLS.some((item) => item.id === rawState.activePerformanceToolId)
      ? rawState.activePerformanceToolId
      : (PERFORMANCE_TOOLS[0]?.id || null),
    activeFilmRoomVideoId: FILM_ROOM_VIDEOS.some((item) => item.id === rawState.activeFilmRoomVideoId)
      ? rawState.activeFilmRoomVideoId
      : (FILM_ROOM_VIDEOS[0]?.id || null),
    activeStep: Number.isFinite(Number(rawState.activeStep)) ? Math.max(0, Number(rawState.activeStep)) : 0,
    activeMaterialId: MATERIALS.some((item) => item.id === rawState.activeMaterialId) ? rawState.activeMaterialId : null
  };

  if (normalized.section === 'phase') {
    normalized.activeId = PHASES.some((item) => item.id === rawState.activeId) ? rawState.activeId : (PHASES[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'assignment') {
    normalized.activeId = ASSIGNMENTS.some((item) => item.id === rawState.activeId) ? rawState.activeId : (ASSIGNMENTS[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'quiz') {
    normalized.activeId = QUIZZES.some((item) => item.id === rawState.activeId) ? rawState.activeId : (QUIZZES[0]?.id || null);
    return normalized;
  }

  if (normalized.section === 'performance') {
    normalized.activeId = getDefaultActiveIdForTab(normalized.tab);
    return normalized;
  }

  normalized.activeId = getDefaultActiveIdForTab(normalized.tab);
  return normalized;
}

function applyUiStateSnapshot(snapshot) {
  if (!snapshot) return;
  state.section = snapshot.section;
  state.tab = snapshot.tab;
  state.activeId = snapshot.activeId;
  state.activePerformanceToolId = snapshot.activePerformanceToolId;
  state.activeFilmRoomVideoId = snapshot.activeFilmRoomVideoId;
  state.activeStep = snapshot.activeStep;
  state.activeMaterialId = snapshot.activeMaterialId;
}

function persistUiState() {
  try {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify({
      section: state.section,
      tab: state.tab,
      activeId: state.activeId,
      activePerformanceToolId: state.activePerformanceToolId,
      activeFilmRoomVideoId: state.activeFilmRoomVideoId,
      activeStep: state.activeStep,
      activeMaterialId: state.activeMaterialId
    }));
  } catch (_error) {
    // Ignore storage failures so the course still works in constrained contexts.
  }
}

function restoreUiState() {
  applyUiStateSnapshot(normalizeUiState(loadStoredJson(UI_STATE_KEY)));
}

function loadCourseProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(COURSE_PROGRESS_KEY) || '{}');
    return {
      completedPhases: parsed.completedPhases && typeof parsed.completedPhases === 'object' ? parsed.completedPhases : {},
      passedQuizzes: parsed.passedQuizzes && typeof parsed.passedQuizzes === 'object' ? parsed.passedQuizzes : {},
      quizAttempts: parsed.quizAttempts && typeof parsed.quizAttempts === 'object' ? parsed.quizAttempts : {},
      quizScores: parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {}
    };
  } catch (error) {
    return {
      completedPhases: {},
      passedQuizzes: {},
      quizAttempts: {},
      quizScores: {}
    };
  }
}

const courseProgress = loadCourseProgress();

function saveCourseProgress() {
  localStorage.setItem(COURSE_PROGRESS_KEY, JSON.stringify(courseProgress));
}

function getPhaseById(phaseId) {
  return PHASES.find((item) => item.id === phaseId) || null;
}

function getQuizById(quizId) {
  return QUIZZES.find((item) => item.id === quizId) || null;
}

function getPerformanceToolById(toolId) {
  return PERFORMANCE_TOOLS.find((item) => item.id === toolId) || null;
}

function getFilmRoomVideoById(videoId) {
  return FILM_ROOM_VIDEOS.find((item) => item.id === videoId) || null;
}

function getPhaseIndex(phaseId) {
  return PHASES.findIndex((item) => item.id === phaseId);
}

function getNextPhase(phaseId) {
  const nextIndex = getPhaseIndex(phaseId) + 1;
  return PHASES[nextIndex] || null;
}

function getQuizForPhase(phaseId) {
  return getQuizById(PHASE_QUIZ_MAP[phaseId] || '');
}

function getAssignmentsForPhase(phaseId) {
  return (PHASE_ASSIGNMENT_MAP[phaseId] || []).map((assignmentId) => ASSIGNMENTS.find((item) => item.id === assignmentId)).filter(Boolean);
}

function isPhaseComplete(phaseId) {
  return !!courseProgress.completedPhases[phaseId];
}

function isQuizPassed(quizId) {
  return !!courseProgress.passedQuizzes[quizId];
}

function isPhaseUnlocked(phaseId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const phaseIndex = getPhaseIndex(phaseId);
  if (phaseIndex <= 0) return true;
  const previousPhase = PHASES[phaseIndex - 1];
  const previousQuiz = getQuizForPhase(previousPhase.id);
  return previousQuiz ? isQuizPassed(previousQuiz.id) : isPhaseComplete(previousPhase.id);
}

function isQuizUnlocked(quizId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const quiz = getQuizById(quizId);
  return quiz ? isPhaseComplete(quiz.phaseId) : true;
}

function isAssignmentUnlocked(assignmentId) {
  if (AUTHORING_UNLOCK_ALL) return true;
  const phaseId = ASSIGNMENT_PHASE_MAP[assignmentId];
  if (!phaseId) return true;
  const linkedQuiz = getQuizForPhase(phaseId);
  return linkedQuiz ? isQuizPassed(linkedQuiz.id) : isPhaseComplete(phaseId);
}

function getPhaseUnlockRequirement(phaseId) {
  const phaseIndex = getPhaseIndex(phaseId);
  if (phaseIndex <= 0) {
    return 'Available now.';
  }

  const previousPhase = PHASES[phaseIndex - 1];
  const previousQuiz = getQuizForPhase(previousPhase.id);
  if (previousQuiz) {
    return `Pass ${previousQuiz.code} with 70% to unlock.`;
  }
  return `Mark ${previousPhase.code} complete to unlock.`;
}

function getQuizUnlockRequirement(quizId) {
  const quiz = getQuizById(quizId);
  if (!quiz) return 'Locked.';
  const phase = getPhaseById(quiz.phaseId);
  return phase ? `Mark ${phase.code} complete to unlock.` : 'Locked.';
}

function getAssignmentUnlockRequirement(assignmentId) {
  const phaseId = ASSIGNMENT_PHASE_MAP[assignmentId];
  const phase = getPhaseById(phaseId);
  const linkedQuiz = getQuizForPhase(phaseId);
  if (linkedQuiz) {
    return `Pass ${linkedQuiz.code} with 70% to unlock.`;
  }
  return phase ? `Mark ${phase.code} complete to unlock.` : 'Locked.';
}

function markPhaseComplete(phaseId) {
  if (isPhaseComplete(phaseId)) return;
  courseProgress.completedPhases[phaseId] = true;
  saveCourseProgress();
  render();
}

function submitQuizResult(quizId, scorePercent) {
  courseProgress.quizAttempts[quizId] = (courseProgress.quizAttempts[quizId] || 0) + 1;
  courseProgress.quizScores[quizId] = Math.max(courseProgress.quizScores[quizId] || 0, scorePercent);
  if (scorePercent >= 70) {
    courseProgress.passedQuizzes[quizId] = true;
  }
  saveCourseProgress();
  render();
}

function getProgressSnapshot() {
  const completedPhases = PHASES.filter((item) => isPhaseComplete(item.id)).length;
  const passedQuizzes = QUIZZES.filter((item) => isQuizPassed(item.id)).length;
  const total = PHASES.length + QUIZZES.length;
  const complete = completedPhases + passedQuizzes;
  return {
    completedPhases,
    totalPhases: PHASES.length,
    passedQuizzes,
    totalQuizzes: QUIZZES.length,
    total,
    complete,
    percent: total ? Math.round((complete / total) * 100) : 0
  };
}

const refs = {
  sectionTitle: document.getElementById('section-title'),
  contentBody: document.getElementById('content-body'),
  progressShell: document.querySelector('.progress-shell'),
  progressFill: document.getElementById('progress-fill'),
  progressPercent: document.getElementById('progress-percent'),
  progressCounters: Array.from(document.querySelectorAll('.progress-counters span')),
  progressModulesCount: document.querySelector('.progress-meta strong'),
  navHome: document.getElementById('nav-home'),
  navLibrary: document.getElementById('nav-library'),
  navPerformance: document.getElementById('nav-performance'),
  navIcons: document.getElementById('nav-icons'),
  tabPhases: document.getElementById('tab-phases'),
  tabQuizzes: document.getElementById('tab-quizzes'),
  tabAssignments: document.getElementById('tab-assignments'),
  collapseToggle: document.getElementById('menu-collapse-toggle')
};

const COMPACT_LAYOUT_BREAKPOINT = 1180;

function isCompactLayout() {
  return window.matchMedia(`(max-width: ${COMPACT_LAYOUT_BREAKPOINT}px)`).matches;
}

function applySidebarCollapse(collapsed) {
  const compact = isCompactLayout();
  document.body.classList.toggle('compact-layout', compact);
  document.body.classList.toggle('sidebar-collapsed', collapsed);
  document.body.classList.toggle('mobile-menu-open', compact && !collapsed);
  if (refs.collapseToggle) {
    refs.collapseToggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    refs.collapseToggle.title = compact
      ? (collapsed ? 'Open menu' : 'Close menu')
      : (collapsed ? 'Expand menu' : 'Collapse menu');
  }
}

function toggleSidebarCollapse() {
  const next = !document.body.classList.contains('sidebar-collapsed');
  applySidebarCollapse(next);
  if (!isCompactLayout()) {
    localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? '1' : '0');
  }
}

function collapseCompactMenu() {
  if (!isCompactLayout()) return;
  applySidebarCollapse(true);
}

function getCollection() {
  if (state.tab === 'phases') return PHASES;
  if (state.tab === 'quizzes') return QUIZZES;
  if (state.tab === 'assignments') return ASSIGNMENTS;
  return [];
}

function setSection(section) {
  const previous = state.section;
  state.section = section;
  if (section !== 'library') {
    state.activeMaterialId = null;
  }
  if (section === 'home' && previous !== 'home') {
    state.tab = 'phases';
    state.activeId = PHASES[0]?.id || null;
  }
  if (section === 'performance' && !getPerformanceToolById(state.activePerformanceToolId)) {
    state.activePerformanceToolId = PERFORMANCE_TOOLS[0]?.id || null;
  }
  if (section === 'icons' && !getFilmRoomVideoById(state.activeFilmRoomVideoId)) {
    state.activeFilmRoomVideoId = FILM_ROOM_VIDEOS[0]?.id || null;
  }
  if (section === 'performance') {
    state.activePerformanceView = 'menu';
  }
  if (section !== 'home') {
    state.tab = 'phases';
  }
  collapseCompactMenu();
  persistUiState();
  render();
}

function setTab(tab) {
  state.section = 'home';
  state.tab = tab;
  const collection = getCollection();
  state.activeId = collection[0]?.id || null;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openPhase(id) {
  if (!isPhaseUnlocked(id)) return;
  if (id === 'phase-0') {
    openAssignment('a0');
    return;
  }
  state.section = 'phase';
  state.activeId = id;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openAssignment(id) {
  if (!isAssignmentUnlocked(id)) return;
  state.section = 'assignment';
  state.activeId = id;
  state.activeStep = 0;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openQuiz(id) {
  if (!isQuizUnlocked(id)) return;
  state.section = 'quiz';
  state.activeId = id;
  collapseCompactMenu();
  persistUiState();
  render();
}

function openPerformanceTool(id) {
  if (!getPerformanceToolById(id)) return;
  state.section = 'performance';
  state.activePerformanceToolId = id;
  state.activePerformanceView = 'player';
  collapseCompactMenu();
  persistUiState();
  render();
}

function closePerformanceTool() {
  state.section = 'performance';
  state.activePerformanceView = 'menu';
  collapseCompactMenu();
  persistUiState();
  render();
}

function selectFilmRoomVideo(id) {
  if (!getFilmRoomVideoById(id)) return;
  state.section = 'icons';
  state.activeFilmRoomVideoId = id;
  persistUiState();
  render();
}

function openMaterial(id) {
  state.activeMaterialId = id;
  persistUiState();
  renderLibrary();
}

function closeMaterialViewer() {
  state.activeMaterialId = null;
  persistUiState();
  renderLibrary();
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getAppsScriptAssetId(url) {
  if (typeof url !== 'string' || !url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url, window.location.href);
    return parsedUrl.searchParams.get('asset');
  } catch (error) {
    return null;
  }
}

function getAppsScriptRawAssetUrl(url) {
  const assetId = getAppsScriptAssetId(url);
  if (!assetId || typeof window.__CH_ASSET_RAW__ !== 'function') {
    return url;
  }

  return window.__CH_ASSET_RAW__(assetId);
}

function getEmbeddedTextAsset(url) {
  const assetId = getAppsScriptAssetId(url);
  if (!assetId || typeof window.__CH_TEXT_ASSET__ !== 'function') {
    return null;
  }

  const embeddedTextAsset = window.__CH_TEXT_ASSET__(assetId);
  return typeof embeddedTextAsset === 'string' ? embeddedTextAsset : null;
}

async function fetchTextAsset(url) {
  const embeddedTextAsset = getEmbeddedTextAsset(url);
  if (typeof embeddedTextAsset === 'string') {
    return embeddedTextAsset;
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load ${url}`);
  }

  return response.text();
}

async function setPerformanceFrameSource(frame, url) {
  if (!frame) {
    return;
  }

  if (!url) {
    frame.removeAttribute('src');
    frame.srcdoc = '';
    return;
  }

  if (getAppsScriptAssetId(url) && typeof window.__CH_ASSET_RAW__ === 'function') {
    const html = await fetchTextAsset(getAppsScriptRawAssetUrl(url));
    frame.removeAttribute('src');
    frame.srcdoc = html;
    return;
  }

  frame.removeAttribute('srcdoc');
  frame.src = url;
}

function renderReadingTable(table) {
  return `
    <div class="reading-table-wrap">
      <table class="reading-table">
        <thead>
          <tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${table.rows.map((row) => `
            <tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

const quizDrafts = {};

function getQuizDraft(quizId) {
  if (!quizDrafts[quizId]) {
    quizDrafts[quizId] = {
      questionIndex: 0,
      answersByQuestion: {},
      feedbackByQuestion: {}
    };
  }
  return quizDrafts[quizId];
}

function setQuizDraft(quizId, nextDraft) {
  quizDrafts[quizId] = nextDraft;
  if (state.section === 'quiz' && state.activeId === quizId) {
    renderQuizDetail();
  }
}

function setAssignmentStep(step) {
  state.activeStep = step;
  render();
}

function renderNavState() {
  refs.navHome.classList.toggle('active', state.section === 'home' || state.section === 'phase' || state.section === 'quiz');
  refs.navLibrary.classList.toggle('active', state.section === 'library');
  refs.navPerformance.classList.toggle('active', state.section === 'performance');
  refs.navIcons.classList.toggle('active', state.section === 'icons');

  refs.tabPhases.classList.toggle('active', (state.section === 'home' && state.tab === 'phases') || state.section === 'phase');
  refs.tabQuizzes.classList.toggle('active', (state.section === 'home' && state.tab === 'quizzes') || state.section === 'quiz');
  refs.tabAssignments.classList.toggle('active', (state.section === 'home' && state.tab === 'assignments') || state.section === 'assignment');
}

function renderHome() {
  if (state.tab === 'phases') {
    refs.sectionTitle.textContent = 'Readiness Modules';
    refs.contentBody.innerHTML = `
      <div class="modules-grid">
        ${PHASES.map((item, index) => {
          const locked = !isPhaseUnlocked(item.id);
          const moduleLabel = index === 0 ? 'Module 00' : item.code;
          const moduleTitle = index === 0 ? item.code : item.title;
          const moduleDesc = MATERIALS[index]?.desc || item.title;
          return `
          <button type="button" class="module-tile${locked ? ' is-locked' : ''}" data-id="${item.id}" style="--tile-accent:${item.accent}"${locked ? ' disabled' : ''}>
            <article class="module-card${item.id === state.activeId ? ' is-active' : ''}">
              ${item.image ? `<img src="${item.image}" alt="${item.title}" />` : `<div class="module-card-placeholder" aria-hidden="true"><span>${item.code}</span></div>`}
              <div class="module-copy">
                <p class="module-code">${moduleLabel}</p>
                <h4 class="module-title">${moduleTitle}</h4>
                <p class="module-description">${moduleDesc}</p>
                <div class="module-state">${locked ? getPhaseUnlockRequirement(item.id) : isPhaseComplete(item.id) ? 'Completed' : 'Open module'}</div>
              </div>
            </article>
          </button>
        `;
        }).join('')}
      </div>
    `;

    refs.contentBody.querySelectorAll('[data-id]').forEach((button) => {
      button.addEventListener('click', () => openPhase(button.dataset.id));
    });
    return;
  }

  if (state.tab === 'quizzes') {
    renderQuizzes();
    return;
  }

  if (state.tab === 'assignments') {
    renderAssignments();
    return;
  }

  refs.sectionTitle.textContent = 'Readiness Modules';
  refs.contentBody.innerHTML = '';
}

function renderPhaseCompletionCard(active) {
  const linkedQuiz = getQuizForPhase(active.id);
  const linkedAssignments = getAssignmentsForPhase(active.id);
  const nextPhase = getNextPhase(active.id);
  const isComplete = isPhaseComplete(active.id);
  const assignmentTitles = linkedAssignments.map((item) => `${item.code}: ${item.title}`).join(', ');

  let statusCopy = 'Mark this phase complete to record progress.';
  if (linkedQuiz) {
    statusCopy = isComplete
      ? isQuizPassed(linkedQuiz.id)
        ? `Quiz passed. ${assignmentTitles ? `${assignmentTitles} unlocked.` : ''}${nextPhase ? ` ${nextPhase.code}: ${nextPhase.title} is now open.` : ''}`.trim()
        : `${linkedQuiz.code} is now unlocked. Score 70% or better to open ${assignmentTitles || 'the assignment'}${nextPhase ? ` and ${nextPhase.code}: ${nextPhase.title}` : ''}.`
      : `This unlocks ${linkedQuiz.code}. A 70% quiz score opens ${assignmentTitles || 'the assignment'}${nextPhase ? ` and ${nextPhase.code}: ${nextPhase.title}` : ''}.`;
  } else if (linkedAssignments.length || nextPhase) {
    const unlockTargets = [];
    if (assignmentTitles) unlockTargets.push(assignmentTitles);
    if (nextPhase) unlockTargets.push(`${nextPhase.code}: ${nextPhase.title}`);
    statusCopy = isComplete
      ? `${unlockTargets.join(' and ')} unlocked.`
      : `This unlocks ${unlockTargets.join(' and ')}.`;
  } else if (isComplete) {
    statusCopy = 'Phase completion recorded.';
  }

  return `
    <article class="stack-card phase-complete-card" style="border-left-color: ${active.accent}">
      <p class="reading-eyebrow">Phase progress</p>
      <h4>${isComplete ? 'Phase complete' : 'Mark complete'}</h4>
      <p>${escapeHtml(statusCopy)}</p>
      <div class="reading-actions">
        <button type="button" class="reading-btn reading-btn-primary" id="phase-mark-complete"${isComplete ? ' disabled' : ''}>${isComplete ? 'Completed' : 'Mark complete'}</button>
      </div>
    </article>
  `;
}

function renderPhaseDetail() {
  const active = PHASES.find((item) => item.id === state.activeId) || PHASES[0];
  const content = PHASE_CONTENT[active.id];
  refs.sectionTitle.textContent = `${active.code}: ${active.title}`;
  if (content) {
    refs.contentBody.innerHTML = `
      <div class="reading-shell">
        <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
          <div class="reading-hero-head">
            <div class="reading-title-block">
              <p class="reading-eyebrow">${escapeHtml(content.eyebrow)}</p>
              <h4 class="reading-hero-title">${escapeHtml(content.heading)}</h4>
            </div>
            <div class="reading-actions reading-hero-actions">
              <button type="button" class="reading-btn reading-btn-secondary" id="back-to-home">Back to phase picker</button>
              ${content.quizId ? `<button type="button" class="reading-btn reading-btn-secondary" id="open-linked-quiz"${isQuizUnlocked(content.quizId) ? '' : ' disabled'}>${isQuizUnlocked(content.quizId) ? 'Open phase quiz' : 'Quiz locked until mark complete'}</button>` : ''}
            </div>
          </div>
          <p class="reading-subtitle">${escapeHtml(content.subheading)}</p>
          ${content.summary ? `<p class="reading-lead">${escapeHtml(content.summary)}</p>` : ''}
          ${content.heroFigure ? `<figure class="reading-hero-figure"><img src="${content.heroFigure.src}" alt="${escapeHtml(content.heroFigure.alt || '')}">${content.heroFigure.caption ? `<figcaption>${escapeHtml(content.heroFigure.caption)}</figcaption>` : ''}</figure>` : ''}
        </article>
        ${content.sections.map((section) => `
          <section class="stack-card reading-section" style="border-left-color: ${active.accent}">
            <h4>${escapeHtml(section.title)}</h4>
            ${(section.paragraphs || []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
            ${section.figures?.length ? `
              <div class="reading-media-grid${section.figures.length === 1 ? ' single' : ''}">
                ${section.figures.map((figure) => `
                  <figure class="reading-figure">
                    <img src="${figure.src}" alt="${escapeHtml(figure.alt || '')}">
                    ${figure.caption ? `<figcaption>${escapeHtml(figure.caption)}</figcaption>` : ''}
                  </figure>
                `).join('')}
              </div>
            ` : ''}
            ${section.bullets?.length ? `<ul class="reading-list">${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
            ${section.table ? renderReadingTable(section.table) : ''}
            ${section.glossary?.length ? `
              <dl class="glossary-grid">
                ${section.glossary.map(([term, definition]) => `
                  <div class="glossary-card">
                    <dt>${escapeHtml(term)}</dt>
                    <dd>${escapeHtml(definition)}</dd>
                  </div>
                `).join('')}
              </dl>
            ` : ''}
          </section>
        `).join('')}
        ${renderPhaseCompletionCard(active)}
      </div>
    `;
    document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
    document.getElementById('open-linked-quiz')?.addEventListener('click', () => openQuiz(content.quizId));
    document.getElementById('phase-mark-complete')?.addEventListener('click', () => markPhaseComplete(active.id));
    return;
  }

  refs.contentBody.innerHTML = `
    <div class="stack-list">
      <article class="stack-card" style="border-left-color: ${active.accent}">
        <h4>${active.code}: ${active.title}</h4>
        <p>${active.body}</p>
      </article>
      <button type="button" class="stack-card" id="back-to-home" style="text-align:left; cursor:pointer;">
        <h4>Back to phase picker</h4>
        <p>Return to the module grid.</p>
      </button>
      ${renderPhaseCompletionCard(active)}
    </div>
  `;
  document.getElementById('back-to-home')?.addEventListener('click', () => setSection('home'));
  document.getElementById('phase-mark-complete')?.addEventListener('click', () => markPhaseComplete(active.id));
}

function renderLibrary() {
  const activeMaterial = MATERIALS.find((item) => item.id === state.activeMaterialId) || null;
  const canOpenActiveMaterial = Boolean(activeMaterial?.file);
  const viewerSrc = canOpenActiveMaterial
    ? `./pdf-viewer.html?file=${encodeURIComponent(activeMaterial.file)}&title=${encodeURIComponent(activeMaterial.title)}`
    : '';
  refs.sectionTitle.textContent = 'Course Materials';

  if (!MATERIALS.length) {
    refs.contentBody.innerHTML = '<div class="empty-card"><h4>Materials coming soon</h4><p>Materials coming soon after the Ready Mind lesson sources are finalized.</p></div>';
    return;
  }

  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${activeMaterial && canOpenActiveMaterial ? `
        <article class="stack-card" style="border-left-color: ${activeMaterial.color}; padding:0; overflow:hidden;">
          <iframe src="${viewerSrc}" title="${activeMaterial.title}" style="display:block; width:100%; min-height:760px; border:0; background:#0b1220;"></iframe>
        </article>
      ` : ''}
      ${MATERIALS.map((item) => `
        <article class="stack-card" style="border-left-color: ${item.color}">
          <p class="mono" style="margin:0 0 6px; color:${item.color}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
          ${item.file ? `<div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:14px;"><button type="button" data-open-material="${item.id}">View Slides</button><a href="${item.file}" target="_blank" rel="noopener noreferrer">Download PDF</a></div>` : '<p class="empty-inline">Materials coming soon after the Ready Mind source list is finalized.</p>'}
        </article>
      `).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-open-material]').forEach((button) => {
    button.addEventListener('click', () => openMaterial(button.dataset.openMaterial));
  });
  document.getElementById('close-material-viewer')?.addEventListener('click', closeMaterialViewer);
}function renderQuizzes() {
  refs.sectionTitle.textContent = 'Quiz Library';
  if (!QUIZZES.length) {
    refs.contentBody.innerHTML = `
      <div class="empty-card">
        <h4>No quizzes loaded yet</h4>
        <p>Quiz scaffolds can be added here without changing the shell structure.</p>
      </div>
    `;
    return;
  }

  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${QUIZZES.map((item) => {
        const locked = !isQuizUnlocked(item.id);
        return `
        <button type="button" class="stack-card stack-card-button${locked ? ' is-locked' : ''}" data-quiz-id="${item.id}" style="border-left-color: ${item.accent}"${locked ? ' disabled' : ''}>
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:20px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${locked ? getQuizUnlockRequirement(item.id) : item.body}</p>
          <div class="reading-chip-row" style="margin-top:14px;">
            <span class="reading-chip">${item.questionCount} questions</span>
            <span class="reading-chip">Multiple choice</span>
            <span class="reading-chip">${locked ? 'Locked' : isQuizPassed(item.id) ? 'Passed' : '70% to pass'}</span>
          </div>
        </button>
      `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-quiz-id]').forEach((button) => {
    button.addEventListener('click', () => openQuiz(button.dataset.quizId));
  });
}

function renderQuizDetail() {
  const active = QUIZZES.find((item) => item.id === state.activeId) || QUIZZES[0];
  if (!active) {
    refs.sectionTitle.textContent = 'Quiz Library';
    refs.contentBody.innerHTML = '<div class="empty-card"><h4>Quiz coming soon</h4><p>Questions will be added after lesson content is finalized.</p></div>';
    return;
  }

  const activePhase = getPhaseById(active.phaseId);
  const draft = getQuizDraft(active.id);
  const questions = active.questions || [];
  const questionIndex = Math.min(Math.max(draft.questionIndex || 0, 0), Math.max(questions.length - 1, 0));
  const activeQuestion = questions[questionIndex];
  const answeredCount = questions.filter((question) => draft.answersByQuestion[question.id] !== undefined).length;
  const correctCount = questions.filter((question) => draft.answersByQuestion[question.id] === question.answerIndex).length;
  refs.sectionTitle.textContent = active.title;
  refs.contentBody.innerHTML = `
    <div class="quiz-detail-shell">
      <article class="stack-card reading-hero" style="border-left-color: ${active.accent}">
        <p class="reading-eyebrow">${escapeHtml(active.code)}</p>
        <h4 class="reading-hero-title">${escapeHtml(active.title)}</h4>
        <p class="reading-lead">${escapeHtml(active.body)}</p>
        <div class="reading-chip-row">
          <span class="reading-chip">${active.questionCount} questions</span>
          <span class="reading-chip">${answeredCount}/${questions.length} answered</span>
          <span class="reading-chip">${questions.length ? `${correctCount}/${questions.length} correct` : 'Quiz coming soon'}</span>
        </div>
        <div class="reading-actions">
          ${active.sourcePdf ? `<a class="reading-btn reading-btn-primary" href="${active.sourcePdf}" target="_blank" rel="noopener noreferrer">Source PDF</a>` : ''}
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-quizzes">Back to quizzes</button>
          <button type="button" class="reading-btn reading-btn-secondary" id="back-to-phase">Back to ${escapeHtml(activePhase ? activePhase.code.toLowerCase() : 'phase')}</button>
        </div>
      </article>
      <section class="stack-card quiz-question-card quiz-interactive-card" style="border-left-color: ${active.accent}">
        ${activeQuestion ? '<p>Question loaded.</p>' : '<div class="empty-card embedded"><h4>Quiz coming soon</h4><p>Questions will be added after lesson content is finalized.</p></div>'}
      </section>
    </div>
  `;
  document.getElementById('back-to-quizzes')?.addEventListener('click', () => setTab('quizzes'));
  document.getElementById('back-to-phase')?.addEventListener('click', () => openPhase(active.phaseId));
}

function renderAssignments() {
  refs.sectionTitle.textContent = 'Assignments';
  refs.contentBody.innerHTML = `
    <div class="stack-list">
      ${ASSIGNMENTS.map((item) => {
        const locked = !isAssignmentUnlocked(item.id);
        return `
        <button type="button" class="stack-card stack-card-button${locked ? ' is-locked' : ''}" data-assignment-id="${item.id}" style="border-left-color: ${item.accent}"${locked ? ' disabled' : ''}>
          <p class="mono" style="margin:0 0 6px; color:${item.accent}; font-size:11px; letter-spacing:0.18em; text-transform:uppercase;">Assignment ${item.code}</p>
          <h4 style="margin:0 0 10px; color:#eef4ff; font-size:22px; font-weight:900; letter-spacing:0.02em; text-transform:uppercase;">${item.code}: ${item.title}</h4>
          <p style="margin:0; color:#b8c4d7; font-size:14px; line-height:1.65;">${locked ? getAssignmentUnlockRequirement(item.id) : item.body}</p>
        </button>
      `;
      }).join('')}
    </div>
  `;
  refs.contentBody.querySelectorAll('[data-assignment-id]').forEach((button) => {
    button.addEventListener('click', () => openAssignment(button.dataset.assignmentId));
  });
}

function renderPerformanceToolButtons(activeToolId, layoutClass = 'performance-launcher-grid') {
  return `
    <div class="${layoutClass}">
      ${PERFORMANCE_TOOLS.map((item) => `
        <button
          type="button"
          class="performance-tool-button${item.id === activeToolId ? ' is-active' : ''}"
          data-performance-tool-id="${item.id}"
          style="--performance-accent:${item.accent}"
        >
          <span class="performance-tool-code mono">${item.code}</span>
          <span class="performance-tool-copy">
            <strong>${item.title}</strong>
            <span>${item.body}</span>
          </span>
        </button>
      `).join('')}
    </div>
  `;
}

function renderPerformance() {
  const activeTool = getPerformanceToolById(state.activePerformanceToolId) || PERFORMANCE_TOOLS[0];
  const isPlayerView = state.activePerformanceView === 'player' && activeTool;
  refs.sectionTitle.textContent = isPlayerView ? '' : 'Performance';
  refs.sectionTitle.style.display = isPlayerView ? 'none' : '';
  if (refs.progressShell) refs.progressShell.style.display = isPlayerView ? 'none' : '';

  if (!PERFORMANCE_TOOLS.length) {
    refs.contentBody.innerHTML = '<section class="performance-launcher"><div class="empty-card"><h4>Performance tools coming soon</h4><p>Performance tools will be added here after the Ready Mind lessons are finalized.</p></div></section>';
    return;
  }

  if (!isPlayerView) {
    refs.contentBody.innerHTML = `
      <section class="performance-launcher">
        <div class="performance-menu"><div class="performance-menu-head"><p class="mono performance-menu-kicker">Performance tools</p><h4>Tool menu</h4><p>Performance tools will be added here after the Ready Mind lessons are finalized.</p></div></div>
        ${renderPerformanceToolButtons(activeTool?.id)}
      </section>
    `;
    refs.contentBody.querySelectorAll('[data-performance-tool-id]').forEach((button) => button.addEventListener('click', () => openPerformanceTool(button.dataset.performanceToolId)));
    return;
  }

  refs.contentBody.innerHTML = `
    <section class="performance-player-shell">
      <div class="performance-player-layout">
        <aside class="performance-player-sidebar"><div class="performance-menu performance-player-menu"><div class="performance-menu-head"><p class="mono performance-menu-kicker">Performance tools</p><h4>Tool menu</h4><p>Select a tool placeholder without leaving the performance section.</p></div><div class="performance-tool-list">${renderPerformanceToolButtons(activeTool?.id, 'performance-tool-list-inner')}</div></div></aside>
        <div class="performance-player-stage">
          <div class="performance-player-nav"><button type="button" class="performance-player-back" data-performance-close>Back to tool menu</button></div>
          ${activeTool?.viewerSrc ? '<div class="performance-player-frame-wrap"><iframe class="performance-player-frame" data-performance-frame loading="lazy"></iframe></div>' : '<div class="empty-card embedded performance-placeholder-card"><h4>Performance tools coming soon</h4><p>Performance tools will be added here after the Ready Mind lessons are finalized.</p></div>'}
        </div>
      </div>
    </section>
  `;
  refs.contentBody.querySelectorAll('[data-performance-tool-id]').forEach((button) => button.addEventListener('click', () => openPerformanceTool(button.dataset.performanceToolId)));
  refs.contentBody.querySelector('[data-performance-close]')?.addEventListener('click', closePerformanceTool);
  const performanceFrame = refs.contentBody.querySelector('[data-performance-frame]');
  if (performanceFrame instanceof HTMLIFrameElement) {
    setPerformanceFrameSource(performanceFrame, activeTool?.viewerSrc || '').catch((error) => {
      performanceFrame.removeAttribute('src');
      performanceFrame.srcdoc = `<body style="margin:0;display:grid;place-items:center;min-height:100vh;background:#08111c;color:#fda4af;font-family:Rajdhani,sans-serif;">${escapeHtml(error instanceof Error ? error.message : 'Failed to load performance tool.')}</body>`;
    });
  }
}

function renderAssignmentField(field) {
  if (field.type === 'textarea') {
    return `
      <label class="assignment-label">${field.label}</label>
      <textarea class="assignment-field assignment-textarea${field.large ? ' assignment-textarea-lg' : ''}" placeholder="${field.placeholder}"></textarea>
    `;
  }

  return `
    <label class="assignment-label">${field.label}</label>
    <input class="assignment-field" placeholder="${field.placeholder}" />
  `;
}

function renderAssignmentPanel(panel, accent) {
  return `
    <article class="assignment-panel${panel.wide ? ' assignment-panel-wide' : ''}" style="--assignment-accent:${accent}">
      <div class="assignment-panel-head">
        <span class="mono">${panel.label}</span>
        <h5>${panel.title}</h5>
      </div>
      ${panel.copy ? `<p class="assignment-panel-copy" style="margin-bottom:16px;">${panel.copy}</p>` : ''}
      ${panel.fields.map((field) => renderAssignmentField(field)).join('')}
    </article>
  `;
}

function ensureScriptLoaded(src, id) {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  const embeddedScriptAsset = getEmbeddedTextAsset(src);
  if (typeof embeddedScriptAsset === 'string') {
    const script = document.createElement('script');
    script.id = id;
    script.textContent = embeddedScriptAsset;
    document.head.appendChild(script);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

function ensureStylesheetLoaded(href, id) {
  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });
}

function ensureAssignmentRuntimeAssets() {
  if (!assignmentRuntimeState.fontsPromise) {
    assignmentRuntimeState.fontsPromise = ensureStylesheetLoaded(ASSIGNMENT_RUNTIME_FONTS_HREF, 'mentalwellness-runtime-fonts');
  }

  if (!assignmentRuntimeState.tailwindPromise) {
    assignmentRuntimeState.tailwindPromise = ensureScriptLoaded(ASSIGNMENT_RUNTIME_TAILWIND_SRC, 'mentalwellness-runtime-tailwind');
  }

  if (!assignmentRuntimeState.runtimePromise) {
    assignmentRuntimeState.runtimePromise = ensureScriptLoaded(ASSIGNMENT_RUNTIME_SCRIPT_SRC, 'mentalwellness-runtime-script');
  }

  return Promise.all([assignmentRuntimeState.fontsPromise, assignmentRuntimeState.tailwindPromise, assignmentRuntimeState.runtimePromise]);
}

async function getAssignmentRuntimeDocument() {
  if (!assignmentRuntimeState.htmlPromise) {
    assignmentRuntimeState.htmlPromise = fetchTextAsset(getAppsScriptRawAssetUrl(ASSIGNMENT_RUNTIME_HTML_SRC))
      .then((html) => new DOMParser().parseFromString(html, 'text/html'));
  }

  return assignmentRuntimeState.htmlPromise;
}

async function getAssignmentRuntimeMarkup(view) {
  if (assignmentRuntimeState.viewMarkup.has(view)) {
    return assignmentRuntimeState.viewMarkup.get(view);
  }

  const doc = await getAssignmentRuntimeDocument();
  const section = doc.getElementById(`view-${view}`);
  if (!section) {
    throw new Error(`Missing runtime view: ${view}`);
  }

  const clone = section.cloneNode(true);
  clone.classList.remove('hidden');
  const markup = clone.outerHTML;
  assignmentRuntimeState.viewMarkup.set(view, markup);
  return markup;
}

async function mountAssignmentRuntime(active) {
  const mount = document.getElementById('assignment-runtime-mount');
  if (!mount) {
    return;
  }

  const view = ASSIGNMENT_RUNTIME_VIEW[active.id];
  if (!view) {
    mount.innerHTML = '<div class="assignment-runtime-error">Assignment view is not mapped.</div>';
    return;
  }

  const requestToken = ++assignmentRuntimeState.requestToken;
  mount.innerHTML = '<div class="assignment-runtime-loading">Loading full assignment system...</div>';

  try {
    const markup = await getAssignmentRuntimeMarkup(view);
    if (assignmentRuntimeState.requestToken !== requestToken || state.section !== 'assignment' || state.activeId !== active.id) {
      return;
    }

    mount.style.visibility = 'hidden';
    mount.innerHTML = markup;
    mount.firstElementChild?.classList.remove('hidden');
    mount.firstElementChild?.classList.add('assignment-runtime-view');

    await ensureAssignmentRuntimeAssets();
    if (assignmentRuntimeState.requestToken !== requestToken || state.section !== 'assignment' || state.activeId !== active.id) {
      return;
    }

    const runtime = window.MentalWellnessRuntime;
    if (!runtime || typeof runtime.mountAssignmentView !== 'function') {
      throw new Error('Assignment runtime did not initialize.');
    }

    runtime.mountAssignmentView(view);
    mount.style.visibility = '';
  } catch (error) {
    if (assignmentRuntimeState.requestToken !== requestToken) {
      return;
    }

    mount.style.visibility = '';
    mount.innerHTML = `<div class="assignment-runtime-error">${error instanceof Error ? error.message : 'Failed to load assignment runtime.'}</div>`;
  }
}

function renderAssignmentDetail() {
  const active = ASSIGNMENTS.find((item) => item.id === state.activeId) || ASSIGNMENTS[0];
  refs.sectionTitle.textContent = '';
  refs.sectionTitle.style.display = 'none';
  if (refs.progressShell) refs.progressShell.style.display = 'none';
  refs.contentBody.innerHTML = `
    <section class="assignment-shell">
      <article class="assignment-runtime-shell"><div id="assignment-runtime-mount" class="assignment-runtime-frame assignment-runtime-mount"><div class="assignment-runtime-loading">Loading Ready Mind assignment shell...</div></div></article>
      <article class="stack-card phase-complete-card" style="border-left-color: ${active.accent}"><p class="reading-eyebrow">Assignment placeholder</p><h4>${escapeHtml(active.code)}: ${escapeHtml(active.title)}</h4><p>Use this blank shell to add Ready Mind prompts after the lesson content is finalized.</p><div class="reading-actions"><button type="button" class="reading-btn reading-btn-secondary" id="back-to-assignments">Back to assignments</button></div></article>
    </section>
  `;
  mountAssignmentRuntime(active);
  document.getElementById('back-to-assignments')?.addEventListener('click', () => setTab('assignments'));
}

function renderIcons() {
  const activeVideo = getFilmRoomVideoById(state.activeFilmRoomVideoId) || FILM_ROOM_VIDEOS[0];
  refs.sectionTitle.textContent = 'Video Resources';
  if (!activeVideo) {
    refs.contentBody.innerHTML = '<section class="film-room-shell"><div class="film-room-stage"><div class="film-room-sign"><div><p class="mono film-room-kicker">Ready Mind video library</p><h4>Video Resources</h4></div><div class="mono film-room-count">0 videos loaded</div></div><div class="empty-card embedded film-room-empty-card"><h4>Video resources coming soon</h4><p>Video resources will be added after the Ready Mind source list is finalized.</p></div></div><aside class="film-room-sidebar"><article class="film-room-panel"><p class="mono film-room-kicker">Video catalog</p><h4>Source list pending</h4><p>Video resources will be added after the Ready Mind source list is finalized.</p></article></aside></section>';
    return;
  }
}function renderContent() {
  refs.sectionTitle.style.display = '';
  if (refs.progressShell) refs.progressShell.style.display = '';
  const progress = getProgressSnapshot();
  refs.progressFill.style.width = `${progress.percent}%`;
  refs.progressPercent.textContent = `${progress.percent}%`;
  if (refs.progressCounters[0]) {
    refs.progressCounters[0].innerHTML = `<i class="fa-solid fa-server"></i> ${progress.completedPhases}/${progress.totalPhases}`;
  }
  if (refs.progressCounters[1]) {
    refs.progressCounters[1].innerHTML = `<i class="fa-solid fa-database"></i> ${progress.passedQuizzes}/${progress.totalQuizzes}`;
  }
  if (refs.progressModulesCount) {
    refs.progressModulesCount.textContent = `${progress.completedPhases}/${progress.totalPhases}`;
  }

  if (state.section === 'library') {
    renderLibrary();
    return;
  }

  if (state.section === 'home') {
    renderHome();
    return;
  }

  if (state.section === 'phase') {
    renderPhaseDetail();
    return;
  }

  if (state.section === 'assignment') {
    renderAssignmentDetail();
    return;
  }

  if (state.section === 'quiz') {
    renderQuizDetail();
    return;
  }

  if (state.section === 'performance') {
    renderPerformance();
    return;
  }

  renderIcons();
}

function render() {
  renderNavState();
  renderContent();
}

refs.navHome.addEventListener('click', () => setSection('home'));
refs.navLibrary.addEventListener('click', () => setSection('library'));
refs.navPerformance.addEventListener('click', () => setSection('performance'));
refs.navIcons.addEventListener('click', () => setSection('icons'));
refs.tabPhases.addEventListener('click', () => setTab('phases'));
refs.tabQuizzes.addEventListener('click', () => setTab('quizzes'));
refs.tabAssignments.addEventListener('click', () => setTab('assignments'));
refs.collapseToggle?.addEventListener('click', toggleSidebarCollapse);

let lastCompactLayout = isCompactLayout();
applySidebarCollapse(lastCompactLayout ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
restoreUiState();
render();

window.addEventListener('resize', () => {
  const compact = isCompactLayout();
  if (compact !== lastCompactLayout) {
    lastCompactLayout = compact;
    applySidebarCollapse(compact ? true : localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
    return;
  }

  if (compact) {
    applySidebarCollapse(document.body.classList.contains('sidebar-collapsed'));
    return;
  }

  applySidebarCollapse(localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === '1');
});

window.addEventListener('storage', (event) => {
  if (event.storageArea !== localStorage || event.key !== UI_STATE_KEY) {
    return;
  }

  const nextState = normalizeUiState(loadStoredJson(UI_STATE_KEY));
  if (!nextState) {
    return;
  }

  applyUiStateSnapshot(nextState);
  render();
});
