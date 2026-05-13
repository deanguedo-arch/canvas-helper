import courseShellData from "./course-shell-data.js";
import assessmentDelivery from "./assessment-delivery.js";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs";

const STORAGE_KEY = String(courseShellData.storageKey || "general-psychology-20-independent-studies-202633108::workspace-state::v1");
const LEGACY_STORAGE_KEY = `${courseShellData.storageKey}::assessment-layout::v5`;
const root = document.getElementById("root");
const assessmentDeliveryByActivityId = new Map(assessmentDelivery.map((entry) => [entry.activityId, entry]));
const COURSE_THEME_MODES = ["current", "next-step"];
const DEFAULT_THEME_MODE = "next-step";
const THEME_PREFERENCE_VERSION = 1;
const AUTHORING_UNLOCK_ALL = false;
const SIDEBAR_COMPACT_QUERY = "(max-width: 1023px)";
let compactSidebarOpen = false;

if (!root) {
  throw new Error("Missing #root for course shell.");
}

const htmlCacheByActivityId = new Map();
const htmlLoadingByActivityId = new Set();
const htmlErrorByActivityId = new Set();
const quizCacheByActivityId = new Map();
const quizLoadingByActivityId = new Set();
const quizErrorByActivityId = new Set();
const quizLauncherCacheByActivityId = new Map();
const quizLauncherLoadingByActivityId = new Set();
const quizLauncherErrorByActivityId = new Set();
const conversionStatusByActivityId = new Map();
const conversionStatusLoadingByActivityId = new Set();
const pdfDocumentPromiseByActivityId = new Map();
const pdfErrorByActivityId = new Set();
const state = loadState();

const LEARNING_MATCH_CHOICES = [
  "A. First items are remembered more easily",
  "B. Extra studying done following over-learning",
  "C. Trying many alternatives until the correct answer is found",
  "D. Discovering learning has occured when the information is required",
  "E. Several learning sessions at spaced intervals",
  "F. an imitation of a learning situation",
  "G. a period of no apparent progress in learning",
  "H. Following a definite sequence in the learning process.",
  "I. Information that prepares the learner for the main concept of the lesson"
];

const DEFENSE_MATCH_CHOICES = [
  "A. Accusing others of our own faults",
  "B. Putting off an unpleasant task",
  "C. Feeling a great attraction to a positive goal the closer you get to achieving the goal.",
  "D. Health problems that arise from strong emotions.",
  "E. A hormone related to stress",
  "F. A decision which presents two negative choices.",
  "G. Expression of emotions to relieve tension",
  "H. Forgetting personal information as a result of trauma or stress",
  "I. Hiding one's identity",
  "J. Refusing to accept that something is true"
];

const DISORDER_MATCH_CHOICES = [
  "A. A feeling of worry, nervousness, or unease, typically about an imminent event or uncertain outcome.",
  "B. An anxiety disorder in which people have unwanted and repeated thoughts/behaviors that make them feel driven to do something.",
  "C. A mood disorder that causes a persistent feeling of sadness and loss of interest.",
  "D. A mental illness that brings severe high and low moods.",
  "E. An obsessive desire to lose weight by refusing to eat.",
  "F. Consumption of large amounts of food, followed by purging or exercising obsessively.",
  "G. A chronic, inflexible, and maladaptive pattern of relating to the world.",
  "H. Altered brain function associated with hallucinations and delusions in psychiatric disorders.",
  "I. Characterized by abnormal brain function caused by a known physical abnormality."
];

const LOCAL_QUIZ_OVERRIDES = {
  "general-psychology-20-independent-studies-202633108::ia590f0ad-7285-4d6a-8090-723483bf5ecf": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 5 },
    quizQuestions: [
      {
        id: "behaviourism-q1",
        question: "John Watson argued that the goal of psychology is:",
        choices: [
          "to study behavior subjectively (through introspection)",
          "to determine the drives that motivate behavior.",
          "to study sensation, perception, and imagery.",
          "to study behavior objectively."
        ],
        answerIndex: 3
      },
      {
        id: "behaviourism-q2",
        question: "Which of these is NOT a basic assumption of behaviorism?",
        choices: [
          "Learning can be studied objectively by focusing on stimuli and responses",
          "Internal cognitive processes are largely included in scientific study",
          "Organisms are born as blank slates, shaped and influenced by the environment",
          "Principles of learning apply equally to different species"
        ],
        answerIndex: 1
      },
      {
        id: "behaviourism-q3",
        question: "Match: John Watson",
        choices: [
          "A. Father of Psychoanalysis",
          "B. Associated with psychoanalysis & archetypes",
          "C. Father of Behaviourism"
        ],
        answerIndex: 2
      },
      {
        id: "behaviourism-q4",
        question: "Match: Carl Jung",
        choices: [
          "A. Father of Psychoanalysis",
          "B. Associated with psychoanalysis & archetypes",
          "C. Father of Behaviourism"
        ],
        answerIndex: 1
      },
      {
        id: "behaviourism-q5",
        question: "Match: Sigmund Freud",
        choices: [
          "A. Father of Psychoanalysis",
          "B. Associated with psychoanalysis & archetypes",
          "C. Father of Behaviourism"
        ],
        answerIndex: 0
      }
    ]
  },
  "general-psychology-20-independent-studies-202633108::i8b4aac6e-a159-411a-a455-1f83b8a7044e": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 7 },
    quizQuestions: [
      {
        id: "humanism-q1",
        question: "Maslow's concept of hierarchy of needs assumes that:",
        choices: [
          "higher needs have prepotency (dominance) over lower needs.",
          "lower needs have prepotency (dominance) over higher needs.",
          "love needs are more basic than physiological needs."
        ],
        answerIndex: 1
      },
      {
        id: "humanism-q2",
        question: "Feelings of self-worth, confidence, and competence were considered by Maslow to be:",
        choices: [
          "self-actualization needs",
          "safety needs",
          "unnecessary for self-actualization",
          "esteem needs"
        ],
        answerIndex: 3
      },
      {
        id: "humanism-q3",
        question: "Which of the following was NOT listed by Maslow as a characteristic of self-actualizing people?",
        choices: [
          "acceptance of self, others, and nature",
          "people-centered",
          "social interest",
          "autonomy"
        ],
        answerIndex: 1
      },
      {
        id: "humanism-q4",
        question: "Maslow is a:",
        choices: ["humanist", "Jungian", "behaviourist", "Freudian"],
        answerIndex: 0
      },
      {
        id: "humanism-q5",
        question: "Match level: The castaways moved where there were goats, milk, fruit, and vegetables.",
        choices: ["PHYSICAL", "ESTEEM", "LOVE"],
        answerIndex: 0
      },
      {
        id: "humanism-q6",
        question: "Match level: Carlota blushed happily when she opened a gift box of chocolates.",
        choices: ["PHYSICAL", "ESTEEM", "LOVE"],
        answerIndex: 2
      },
      {
        id: "humanism-q7",
        question: "Match level: Andre's neighbors welcomed him warmly and his dinner made a good impression.",
        choices: ["PHYSICAL", "ESTEEM", "LOVE"],
        answerIndex: 1
      }
    ]
  },
  "general-psychology-20-independent-studies-202633108::iab7cf8f3-6035-4852-b8dc-718f4c1d9960": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 9 },
    quizQuestions: [
      { id: "lt-q1", question: "Match: distributed practice", choices: LEARNING_MATCH_CHOICES, answerIndex: 4 },
      { id: "lt-q2", question: "Match: Primacy effect", choices: LEARNING_MATCH_CHOICES, answerIndex: 0 },
      { id: "lt-q3", question: "Match: Diminishing returns", choices: LEARNING_MATCH_CHOICES, answerIndex: 1 },
      { id: "lt-q4", question: "Match: serial learning", choices: LEARNING_MATCH_CHOICES, answerIndex: 7 },
      { id: "lt-q5", question: "Match: plateau", choices: LEARNING_MATCH_CHOICES, answerIndex: 6 },
      { id: "lt-q6", question: "Match: Trial and Error", choices: LEARNING_MATCH_CHOICES, answerIndex: 2 },
      { id: "lt-q7", question: "Match: Latent Learning", choices: LEARNING_MATCH_CHOICES, answerIndex: 3 },
      { id: "lt-q8", question: "Match: simulation", choices: LEARNING_MATCH_CHOICES, answerIndex: 5 },
      { id: "lt-q9", question: "Match: Advanced organizer", choices: LEARNING_MATCH_CHOICES, answerIndex: 8 }
    ]
  },
  "general-psychology-20-independent-studies-202633108::ie0f79a55-44e0-4be9-8b6a-3dacc00c8127": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 9 },
    quizQuestions: [
      { id: "lt2-q1", question: "Match: distributed practice", choices: LEARNING_MATCH_CHOICES, answerIndex: 4 },
      { id: "lt2-q2", question: "Match: Primacy effect", choices: LEARNING_MATCH_CHOICES, answerIndex: 0 },
      { id: "lt2-q3", question: "Match: Diminishing returns", choices: LEARNING_MATCH_CHOICES, answerIndex: 1 },
      { id: "lt2-q4", question: "Match: serial learning", choices: LEARNING_MATCH_CHOICES, answerIndex: 7 },
      { id: "lt2-q5", question: "Match: plateau", choices: LEARNING_MATCH_CHOICES, answerIndex: 6 },
      { id: "lt2-q6", question: "Match: Trial and Error", choices: LEARNING_MATCH_CHOICES, answerIndex: 2 },
      { id: "lt2-q7", question: "Match: Latent Learning", choices: LEARNING_MATCH_CHOICES, answerIndex: 3 },
      { id: "lt2-q8", question: "Match: simulation", choices: LEARNING_MATCH_CHOICES, answerIndex: 5 },
      { id: "lt2-q9", question: "Match: Advanced organizer", choices: LEARNING_MATCH_CHOICES, answerIndex: 8 }
    ]
  },
  "general-psychology-20-independent-studies-202633108::iad6c4cde-5d50-41ef-bbe5-9f67681c9d12": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 10 },
    quizQuestions: [
      { id: "dm-q1", question: "Match: Projection", choices: DEFENSE_MATCH_CHOICES, answerIndex: 0 },
      { id: "dm-q2", question: "Match: Catharsis", choices: DEFENSE_MATCH_CHOICES, answerIndex: 6 },
      { id: "dm-q3", question: "Match: Psychosomatic illness", choices: DEFENSE_MATCH_CHOICES, answerIndex: 3 },
      { id: "dm-q4", question: "Match: Procrastination", choices: DEFENSE_MATCH_CHOICES, answerIndex: 1 },
      { id: "dm-q5", question: "Match: ACTH", choices: DEFENSE_MATCH_CHOICES, answerIndex: 4 },
      { id: "dm-q6", question: "Match: Anonymity", choices: DEFENSE_MATCH_CHOICES, answerIndex: 8 },
      { id: "dm-q7", question: "Match: Denial", choices: DEFENSE_MATCH_CHOICES, answerIndex: 9 },
      { id: "dm-q8", question: "Match: Avoidance - Avoidance", choices: DEFENSE_MATCH_CHOICES, answerIndex: 5 },
      { id: "dm-q9", question: "Match: Amnesia", choices: DEFENSE_MATCH_CHOICES, answerIndex: 7 },
      { id: "dm-q10", question: "Match: Approach gradient", choices: DEFENSE_MATCH_CHOICES, answerIndex: 2 }
    ]
  },
  "general-psychology-20-independent-studies-202633108::i6ec273d0-54f2-48de-b99f-64952c97f4e9": {
    quizMeta: { profile: "Examination", attempts: 3, timeLimitMinutes: 0, questionCount: 9 },
    quizQuestions: [
      { id: "bd-q1", question: "Match: Organic Psychosis", choices: DISORDER_MATCH_CHOICES, answerIndex: 8 },
      { id: "bd-q2", question: "Match: Personality Disorder", choices: DISORDER_MATCH_CHOICES, answerIndex: 6 },
      { id: "bd-q3", question: "Match: Bipolar", choices: DISORDER_MATCH_CHOICES, answerIndex: 3 },
      { id: "bd-q4", question: "Match: Anorexia Nervosa", choices: DISORDER_MATCH_CHOICES, answerIndex: 4 },
      { id: "bd-q5", question: "Match: Functional Psychosis", choices: DISORDER_MATCH_CHOICES, answerIndex: 7 },
      { id: "bd-q6", question: "Match: Anxiety", choices: DISORDER_MATCH_CHOICES, answerIndex: 0 },
      { id: "bd-q7", question: "Match: Depression", choices: DISORDER_MATCH_CHOICES, answerIndex: 2 },
      { id: "bd-q8", question: "Match: OCD", choices: DISORDER_MATCH_CHOICES, answerIndex: 1 },
      { id: "bd-q9", question: "Match: Bulimia Nervosa", choices: DISORDER_MATCH_CHOICES, answerIndex: 5 }
    ]
  }
};

ensureSelection();
injectStyles();
render();

function loadState() {
  try {
    const rawPrimary = localStorage.getItem(STORAGE_KEY);
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = JSON.parse(rawPrimary || rawLegacy || "{}");
    if (!rawPrimary && rawLegacy) {
      localStorage.setItem(STORAGE_KEY, rawLegacy);
    }
    return {
      selectedModuleId: typeof parsed.selectedModuleId === "string" ? parsed.selectedModuleId : "",
      expandedModuleId: typeof parsed.expandedModuleId === "string" ? parsed.expandedModuleId : "",
      sidebarHidden: Boolean(parsed.sidebarHidden),
      themeMode:
        parsed.themePreferenceVersion === THEME_PREFERENCE_VERSION
          ? normalizeThemeMode(parsed.themeMode)
          : DEFAULT_THEME_MODE,
      themePreferenceVersion: THEME_PREFERENCE_VERSION,
      collapsedSectionByKey:
        parsed.collapsedSectionByKey && typeof parsed.collapsedSectionByKey === "object"
          ? parsed.collapsedSectionByKey
          : {},
      selectedByBucket:
        parsed.selectedByBucket && typeof parsed.selectedByBucket === "object" ? parsed.selectedByBucket : {},
      moduleViewByModuleId:
        parsed.moduleViewByModuleId && typeof parsed.moduleViewByModuleId === "object"
          ? parsed.moduleViewByModuleId
          : {},
      sidebarLibraryView:
        parsed.sidebarLibraryView === "quizzes"
          ? parsed.sidebarLibraryView
          : "modules",
      completedActivityById:
        parsed.completedActivityById && typeof parsed.completedActivityById === "object"
          ? parsed.completedActivityById
          : {},
      quizDraftByActivityId:
        parsed.quizDraftByActivityId && typeof parsed.quizDraftByActivityId === "object"
          ? parsed.quizDraftByActivityId
          : {}
    };
  } catch {
    return {
      selectedModuleId: "",
      expandedModuleId: "",
      sidebarHidden: false,
      themeMode: DEFAULT_THEME_MODE,
      themePreferenceVersion: THEME_PREFERENCE_VERSION,
      collapsedSectionByKey: {},
      selectedByBucket: {},
      moduleViewByModuleId: {},
      sidebarLibraryView: "modules",
      completedActivityById: {},
      quizDraftByActivityId: {}
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeThemeMode(value) {
  return COURSE_THEME_MODES.includes(value) ? value : DEFAULT_THEME_MODE;
}

function ensureSelection() {
  const firstModule = courseShellData.modules?.[0];
  if (!state.selectedModuleId || !courseShellData.modules.some((module) => module.id === state.selectedModuleId)) {
    state.selectedModuleId = firstModule?.id ?? "";
  }

  if (state.expandedModuleId && !courseShellData.modules.some((module) => module.id === state.expandedModuleId)) {
    state.expandedModuleId = "";
  }

  if (!state.expandedModuleId && state.selectedModuleId) {
    state.expandedModuleId = state.selectedModuleId;
  }
  saveState();
}

function getSelectedModule() {
  return courseShellData.modules.find((module) => module.id === state.selectedModuleId) ?? courseShellData.modules[0];
}

function setSelectedModule(moduleId) {
  if (!moduleId || !courseShellData.modules.some((module) => module.id === moduleId)) {
    return;
  }

  if (state.selectedModuleId === moduleId && state.expandedModuleId === moduleId) {
    state.expandedModuleId = "";
    saveState();
    render();
    return;
  }

  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  state.moduleViewByModuleId[moduleId] = "content";
  saveState();
  render();
}

function toggleSidebar() {
  if (isSidebarCompactViewport()) {
    compactSidebarOpen = !compactSidebarOpen;
    render();
    return;
  }

  state.sidebarHidden = !state.sidebarHidden;
  saveState();
  render();
}

function closeSidebar() {
  if (isSidebarCompactViewport()) {
    compactSidebarOpen = false;
    render();
    return;
  }

  if (!state.sidebarHidden) {
    state.sidebarHidden = true;
    saveState();
    render();
  }
}

function closeSidebarAfterCompactSelection() {
  if (isSidebarCompactViewport()) {
    compactSidebarOpen = false;
  }
}

function isSidebarCompactViewport() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia(SIDEBAR_COMPACT_QUERY).matches;
}

function isSidebarVisible() {
  return isSidebarCompactViewport() ? compactSidebarOpen : !state.sidebarHidden;
}

function setThemeMode(themeMode) {
  state.themeMode = normalizeThemeMode(themeMode);
  state.themePreferenceVersion = THEME_PREFERENCE_VERSION;
  saveState();
  render();
}

function getModuleView(moduleId) {
  return state.moduleViewByModuleId[moduleId] === "assignments" ? "assignments" : "content";
}

function setModuleView(moduleId, view) {
  state.moduleViewByModuleId[moduleId] = view === "assignments" ? "assignments" : "content";
  saveState();
  render();
}

function setSidebarLibraryView(view) {
  state.sidebarLibraryView = view === "quizzes" ? view : "modules";
  saveState();
  render();
}

function bucketStateKey(moduleId, bucket) {
  return `${moduleId}::${bucket}`;
}

function ensureBucketSelection(moduleId, bucket, items) {
  const key = bucketStateKey(moduleId, bucket);
  const selectedId = state.selectedByBucket[key];
  if (selectedId && items.some((item) => item.id === selectedId)) {
    return selectedId;
  }

  const nextId = items[0]?.id ?? "";
  state.selectedByBucket[key] = nextId;
  saveState();
  return nextId;
}

function getSelectedActivity(moduleId, bucket, items) {
  const selectedId = ensureBucketSelection(moduleId, bucket, items);
  return items.find((item) => item.id === selectedId) ?? null;
}

function setSelectedActivity(moduleId, bucket, activityId) {
  const module = courseShellData.modules.find((entry) => entry.id === moduleId);
  if (!module) {
    return;
  }

  const { content, assignments } = getModuleBuckets(module);
  const targetBucket = bucket === "assignments" ? "assignments" : "content";
  if (targetBucket === "content") {
    const unlockedContentIds = new Set(buildUnlockedContentActivities(content).map((activity) => activity.id));
    if (!unlockedContentIds.has(activityId)) {
      return;
    }
  } else {
    const quizzesUnlocked = moduleCompletion(module).isUnlocked;
    if (!quizzesUnlocked || !assignments.some((activity) => activity.id === activityId)) {
      return;
    }
  }

  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  const key = bucketStateKey(moduleId, targetBucket);
  state.selectedByBucket[key] = activityId;
  state.moduleViewByModuleId[moduleId] = targetBucket === "assignments" ? "assignments" : "content";
  closeSidebarAfterCompactSelection();
  saveState();
  render();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLearnerCopy(value) {
  return String(value || "")
    .replace(
      /When you're done with your break, please complete Assignment One and upload it to Brightspace so your teacher can provide feedback\.\s*While waiting for feedback you can continue with Module 1 Section 3\./gi,
      "When you're done with your break, please complete Assignment One in this module. You can then continue with Module 1 Section 3."
    )
    .replace(
      /Complete Assignment 2 that covers the concepts learned in Section 3 and Section 4\.\s*When you have received feedback from your teacher, you will be provided with access to the Module 1 (?:Assessment|Practice Quiz)\. Complete the assessment when you are ready \(you do not need to complete the first assessment before moving on to Module 2\)\./gi,
      "Complete Assignment 2 that covers the concepts learned in Section 3 and Section 4 in this module."
    )
    .replace(
      /Using Sections 1 and 2 as your guide, complete Assignment 3\.\s*Once you have completed Assignment 3, upload it to Brightspace and then continue on with Section 3\./gi,
      "Using Sections 1 and 2 as your guide, complete Assignment 3 in this module, then continue on with Section 3."
    )
    .replace(
      /Using Section 3 and Section 4 as a\s+guideline, complete Assignment 4\.\s*When you have completed the assignment, upload it to Brightspace\.\s*Once you receive feedback you will be given access to the Module 2 (?:Assessment|Practice Quiz)\. You do not need to complete this assessment before moving on with Module 3\./gi,
      "Using Section 3 and Section 4 as a guideline, complete Assignment 4 in this module."
    )
    .replace(
      /Using the information in Section 1 and Section 2, complete Assignment 5\.\s*When you\s+have completed the assignment, submit it on Brightspace, then continue with Section 3\./gi,
      "Using the information in Section 1 and Section 2, complete Assignment 5 in this module, then continue with Section 3."
    )
    .replace(
      /Using content from Section 3 and Section 4 you can complete Assignment 6\.\s*When you are done, submit your assignment to Brightspace\.\s*Once you receive feedback from your teacher, you will be given access to the Module 3 (?:Assessment|Practice Quiz)\./gi,
      "Using content from Section 3 and Section 4, complete Assignment 6 in this module."
    )
    .replace(/upload it to Brightspace/gi, "complete it in this module")
    .replace(/submit your assignment to Brightspace/gi, "complete your assignment in this module")
    .replace(/submit it on Brightspace/gi, "complete it in this module")
    .replace(/teacher can provide feedback/gi, "you can keep working through the module")
    .replace(/While waiting for feedback/gi, "After that")
    .replace(/When you have received feedback from your teacher, you will be provided with access to the Module \d+ (?:Assessment|Practice Quiz)\./gi, "")
    .replace(/Once you receive feedback from your teacher, you will be given access to the Module \d+ (?:Assessment|Practice Quiz)\./gi, "")
    .replace(/Once you receive feedback you will be given access to the Module \d+ (?:Assessment|Practice Quiz)\./gi, "")
    .replace(/Complete the assessment when you are ready\s*\(you do not need to complete the first assessment before moving on to Module \d+\)\./gi, "")
    .replace(/You do not need to complete this assessment before moving on with Module \d+\./gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clamp(value, max = 180) {
  const text = normalizeLearnerCopy(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }

  if (text.length <= max) {
    return text;
  }

  return `${text.slice(0, max - 1).trimEnd()}...`;
}

function prettyKind(kind) {
  return String(kind || "other")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getAssessmentDelivery(activity) {
  return assessmentDeliveryByActivityId.get(activity?.id) || null;
}

function getLocalQuizOverride(activity) {
  const data = LOCAL_QUIZ_OVERRIDES[activity?.id];
  if (!data || !Array.isArray(data.quizQuestions) || !data.quizQuestions.length) {
    return null;
  }
  // Keep local override quizzes wired into the same runtime cache path as parsed XML quizzes
  // so existing quiz controls (check/next/clear) behave identically.
  if (activity?.id && !quizCacheByActivityId.has(activity.id)) {
    quizCacheByActivityId.set(activity.id, data);
    quizErrorByActivityId.delete(activity.id);
  }
  return data;
}

function isQuizDeliveryActivity(activity, delivery = null) {
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  if (resourceKind === "quiz") {
    return true;
  }

  const combined = `${activity?.title || ""} ${delivery?.statusText || ""} ${delivery?.summary || ""} ${delivery?.ctaLabel || ""}`
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return /\bquiz\b/.test(combined);
}

function activityMetaLabel(activity) {
  const delivery = getAssessmentDelivery(activity);
  if (delivery?.deliveryMode === "workspace-quiz") {
    return "Workspace quiz";
  }

  if (delivery?.deliveryMode === "workspace-embed") {
    return isQuizDeliveryActivity(activity, delivery) ? "Workspace quiz" : "Workspace assignment";
  }

  if (delivery && delivery.deliveryMode !== "hidden") {
    return "External hand-in";
  }

  const label = prettyKind(activity?.resourceKind || activity?.kind || "other");
  return label === "Html" ? "" : label;
}

function conversionStatusLabel(status) {
  if (status === "converted") {
    return "Converted";
  }
  if (status === "checking") {
    return "Checking...";
  }
  if (status === "needs-conversion") {
    return "Not converted";
  }
  return "";
}

function conversionStatusClass(status) {
  if (status === "converted") {
    return "converted";
  }
  if (status === "checking") {
    return "checking";
  }
  return "needs";
}

function requestConversionStatusForQuiz(activity) {
  if (!activity?.id || String(activity.resourceKind || "").toLowerCase() !== "quiz" || !hasSourceHref(activity)) {
    return;
  }

  if (conversionStatusByActivityId.has(activity.id) || conversionStatusLoadingByActivityId.has(activity.id)) {
    return;
  }

  if (quizCacheByActivityId.has(activity.id)) {
    const quizData = quizCacheByActivityId.get(activity.id);
    const status = Array.isArray(quizData?.quizQuestions) && quizData.quizQuestions.length > 0 ? "converted" : "needs-conversion";
    conversionStatusByActivityId.set(activity.id, status);
    return;
  }

  conversionStatusLoadingByActivityId.add(activity.id);

  fetch(buildReferenceRawUrl(activity.sourceHref))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load quiz XML: ${response.status}`);
      }
      return readResponseText(response);
    })
    .then((xmlText) => {
      const parsed = parseQuizXml(xmlText);
      const status = Array.isArray(parsed?.quizQuestions) && parsed.quizQuestions.length > 0 ? "converted" : "needs-conversion";
      conversionStatusByActivityId.set(activity.id, status);
    })
    .catch(() => {
      conversionStatusByActivityId.set(activity.id, "needs-conversion");
    })
    .finally(() => {
      conversionStatusLoadingByActivityId.delete(activity.id);
      render();
    });
}

function getActivityConversionStatus(activity) {
  if (!isAssignment(activity)) {
    return "";
  }

  if (getLocalQuizOverride(activity)) {
    return "converted";
  }

  const delivery = getAssessmentDelivery(activity);
  const kind = String(activity?.kind || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const hasSource = hasSourceHref(activity);
  if (delivery?.deliveryMode === "document-handin") {
    return "needs-conversion";
  }

  // Workspace embeds are intentionally recreated in-browser or source-backed.
  if (delivery?.deliveryMode === "workspace-embed") {
    return "converted";
  }

  // True converted quiz: source-backed quiz with parseable questions.
  if (resourceKind === "quiz" && hasSource) {
    if (quizCacheByActivityId.has(activity.id)) {
      const quizData = quizCacheByActivityId.get(activity.id);
      const status = Array.isArray(quizData?.quizQuestions) && quizData.quizQuestions.length > 0 ? "converted" : "needs-conversion";
      conversionStatusByActivityId.set(activity.id, status);
      return status;
    }

    const cached = conversionStatusByActivityId.get(activity.id);
    if (cached) {
      return cached;
    }

    requestConversionStatusForQuiz(activity);
    return "checking";
  }

  // Launcher pages and handoff paths are not converted browser-native activities.
  if (delivery?.deliveryMode === "workspace-embed" || (delivery && delivery.deliveryMode !== "workspace-quiz")) {
    return "needs-conversion";
  }

  if (!hasSource) {
    return "needs-conversion";
  }

  // Keep non-assessment lesson pages (including quiz launcher lessons promoted to assignments)
  // marked as not converted unless they were intentionally integrated as local workspace embeds.
  if (kind !== "assessment") {
    return "needs-conversion";
  }

  // Source-backed non-quiz assessment records without a local in-browser runtime remain not converted.
  return "needs-conversion";
}

function normalizePath(value) {
  return String(value || "").replace(/\\/g, "/").replace(/^\/+/, "").replace(/\/{2,}/g, "/");
}

function encodePath(pathValue) {
  return normalizePath(pathValue)
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

function dirname(pathValue) {
  const normalized = normalizePath(pathValue);
  const index = normalized.lastIndexOf("/");
  return index === -1 ? "" : normalized.slice(0, index);
}

function decodePathValue(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function resolveRelativePath(baseFile, relativeValue) {
  if (!relativeValue) {
    return "";
  }

  const decoded = decodePathValue(String(relativeValue).trim());
  if (!decoded) {
    return "";
  }

  if (/^(https?:|mailto:|tel:|#)/i.test(decoded)) {
    return decoded;
  }

  if (decoded.startsWith("/")) {
    return normalizePath(decoded.slice(1));
  }

  const baseDir = dirname(baseFile);
  const combined = normalizePath(baseDir ? `${baseDir}/${decoded}` : decoded);
  const parts = [];

  for (const part of combined.split("/")) {
    if (!part || part === ".") {
      continue;
    }
    if (part === "..") {
      parts.pop();
      continue;
    }
    parts.push(part);
  }

  return parts.join("/");
}

function buildReferenceRawUrl(pathValue) {
  const slug = encodeURIComponent(courseShellData.projectSlug);
  return `/preview/references/raw/${slug}/${encodePath(pathValue)}`;
}

function normalizeCharsetLabel(value) {
  const label = String(value || "").trim().toLowerCase();
  if (!label) {
    return "";
  }
  if (label === "utf16" || label === "utf-16") {
    return "utf-16le";
  }
  if (label === "utf16le") {
    return "utf-16le";
  }
  if (label === "utf16be") {
    return "utf-16be";
  }
  if (label === "utf8") {
    return "utf-8";
  }
  return label;
}

function getCharsetFromContentType(contentType) {
  const value = String(contentType || "");
  const match = value.match(/charset\s*=\s*["']?([^;"'\s]+)/i);
  return normalizeCharsetLabel(match?.[1] || "");
}

function detectEncodingFromBytePattern(bytes) {
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) {
      return "utf-16le";
    }
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return "utf-16be";
    }
  }

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }

  let evenZeroCount = 0;
  let oddZeroCount = 0;
  const sampleLength = Math.min(bytes.length, 192);
  for (let index = 0; index < sampleLength; index += 1) {
    if (bytes[index] !== 0x00) {
      continue;
    }
    if (index % 2 === 0) {
      evenZeroCount += 1;
    } else {
      oddZeroCount += 1;
    }
  }

  if (oddZeroCount >= 4 && oddZeroCount > evenZeroCount * 2) {
    return "utf-16le";
  }
  if (evenZeroCount >= 4 && evenZeroCount > oddZeroCount * 2) {
    return "utf-16be";
  }

  return "";
}

function detectArrayBufferEncoding(bytes, contentType) {
  const byteDetectedEncoding = detectEncodingFromBytePattern(bytes);
  if (byteDetectedEncoding) {
    return byteDetectedEncoding;
  }

  const declared = getCharsetFromContentType(contentType);
  if (declared) {
    return declared;
  }

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return "utf-8";
  }

  return "utf-8";
}

function countUnicodeReplacementCharacters(value) {
  return (String(value || "").match(/\uFFFD/g) || []).length;
}

function decodeArrayBufferWithEncoding(bytes, encoding) {
  try {
    return new TextDecoder(encoding).decode(bytes);
  } catch {
    return "";
  }
}

function decodeFetchedArrayBuffer(buffer, contentType = "") {
  const bytes = new Uint8Array(buffer);
  const preferredEncoding = detectArrayBufferEncoding(bytes, contentType);
  const attempted = [];
  const seen = new Set();
  const queue = [preferredEncoding, "utf-8", "windows-1252", "utf-16le"];

  for (const encoding of queue) {
    const normalized = normalizeCharsetLabel(encoding);
    if (!normalized || seen.has(normalized)) {
      continue;
    }
    seen.add(normalized);
    const decoded = decodeArrayBufferWithEncoding(bytes, normalized);
    if (!decoded) {
      continue;
    }
    attempted.push({
      decoded,
      replacementCount: countUnicodeReplacementCharacters(decoded),
      prefersPrimary: normalized === normalizeCharsetLabel(preferredEncoding)
    });
  }

  if (!attempted.length) {
    return "";
  }

  attempted.sort((left, right) => {
    if (left.replacementCount !== right.replacementCount) {
      return left.replacementCount - right.replacementCount;
    }
    if (left.prefersPrimary === right.prefersPrimary) {
      return 0;
    }
    return left.prefersPrimary ? -1 : 1;
  });

  if (attempted[0].replacementCount === 0) {
    return attempted[0].decoded;
  }

  // Prefer the cleanest decode when UTF-8 introduces replacement glyphs from legacy source files.
  return attempted[0].decoded;
}

function readResponseText(response) {
  return response.arrayBuffer().then((buffer) => decodeFetchedArrayBuffer(buffer, response.headers.get("content-type") || ""));
}

function buildWorkspaceAssetUrl(pathValue) {
  const resolved = String(pathValue || "").trim();
  if (!resolved) {
    return "";
  }
  if (!resolved.startsWith("./assets/")) {
    return resolved;
  }
  const joiner = resolved.includes("?") ? "&" : "?";
  return `${resolved}${joiner}v=20260330b`;
}

function tryAlternatePreviewContentPath(urlValue) {
  const url = String(urlValue || "");
  if (!url.includes("/preview/references/raw/")) {
    return "";
  }

  if (url.includes("/content/")) {
    return url.replace("/content/", "/%D1%81ontent/");
  }

  if (/%d1%81ontent/i.test(url)) {
    return url.replace(/%d1%81ontent/gi, "content");
  }

  return "";
}

function trySecureRemoteAssetUrl(urlValue) {
  const url = String(urlValue || "").trim();
  if (!/^http:\/\//i.test(url)) {
    return "";
  }
  return url.replace(/^http:\/\//i, "https://");
}

function isElementVisuallyEmpty(element) {
  const text = (element.textContent || "").replace(/\u00a0/g, " ").trim();
  if (text) {
    return false;
  }

  return !element.querySelector("img, iframe, video, object, canvas, svg, table, ul, ol, input, textarea, select, button");
}

function removeUnavailableImage(image) {
  const parent = image.parentElement;
  const followingNote = image.nextElementSibling;

  if (followingNote?.classList?.contains("image-missing-note")) {
    followingNote.remove();
  }

  image.remove();

  let current = parent;
  while (
    current &&
    current !== root &&
    current.matches("a, p, div, span, strong, em, h1, h2, h3, h4, h5, h6") &&
    isElementVisuallyEmpty(current)
  ) {
    const next = current.parentElement;
    current.remove();
    current = next;
  }
}

function bindImageFallbacks() {
  root.querySelectorAll(".reader-html img, .reader-text img, .reader-document img").forEach((image) => {
    if (image.dataset.fallbackBound === "1") {
      return;
    }

    image.dataset.fallbackBound = "1";
    const handleUnavailableImage = () => {
      if (image.dataset.fallbackRecovered === "1") {
        return;
      }

      const alternate = image.dataset.fallbackAttempted === "1"
        ? ""
        : tryAlternatePreviewContentPath(image.currentSrc || image.src);

      if (alternate && alternate !== image.src) {
        image.dataset.fallbackAttempted = "1";
        image.src = alternate;
        return;
      }

      const secureSource = image.dataset.fallbackSecureAttempted === "1"
        ? ""
        : trySecureRemoteAssetUrl(image.currentSrc || image.src);

      if (secureSource && secureSource !== image.src) {
        image.dataset.fallbackSecureAttempted = "1";
        image.src = secureSource;
        return;
      }

      image.dataset.fallbackRecovered = "1";
      removeUnavailableImage(image);
    };

    image.addEventListener("error", handleUnavailableImage);

    if (image.complete && (image.naturalWidth === 0 || image.naturalHeight === 0)) {
      handleUnavailableImage();
    }
  });
}

function buildVideoFallbackLink(sourceUrl) {
  const raw = String(sourceUrl || "");
  if (!raw) {
    return "";
  }
  const fileName = raw.split("/").pop() || "";
  const decodedName = decodePathValue(fileName).replace(/\.[a-z0-9]+$/i, "");
  const normalized = decodedName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(normalized)}`;
}

function bindVideoFallbacks() {
  root.querySelectorAll(".reader-html video").forEach((video) => {
    if (video.dataset.fallbackBound === "1") {
      return;
    }

    video.dataset.fallbackBound = "1";
    const showFallback = () => {
      if (video.dataset.fallbackRecovered === "1") {
        return;
      }
      video.dataset.fallbackRecovered = "1";
      video.style.display = "none";

      if (video.nextElementSibling?.classList?.contains("image-missing-note")) {
        return;
      }

      const sourceNode = video.querySelector("source[src]");
      const sourceUrl = sourceNode?.getAttribute("src") || video.getAttribute("src") || "";
      const link = buildVideoFallbackLink(sourceUrl);
      const note = document.createElement("div");
      note.className = "image-missing-note";
      note.innerHTML = link
        ? `Video file unavailable in this export. <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Open matching video search</a>.`
        : "Video file unavailable in this export.";
      video.insertAdjacentElement("afterend", note);
    };

    video.addEventListener("error", showFallback);
    video.querySelectorAll("source").forEach((source) => {
      source.addEventListener("error", showFallback);
    });
  });
}

function getElementsByLocalName(rootNode, localName) {
  return Array.from(rootNode.getElementsByTagName("*")).filter(
    (element) => element.localName === localName || element.tagName?.toLowerCase().endsWith(`:${localName}`)
  );
}

function decodeHtmlEntities(value) {
  const node = document.createElement("textarea");
  node.innerHTML = String(value || "");
  return node.value;
}

function decodeHtmlEntitiesRepeatedly(value, passes = 2) {
  let current = String(value || "");
  for (let index = 0; index < passes; index += 1) {
    const next = decodeHtmlEntities(current);
    if (next === current) {
      break;
    }
    current = next;
  }
  return current;
}

function extractHtmlBodyMarkup(rawHtml) {
  let current = String(rawHtml || "").replace(/\u0000/g, "").replace(/^\uFEFF/, "").trim();
  current = decodeHtmlEntitiesRepeatedly(current, 3).replace(/\r/g, "");

  const bodyMatch = current.match(/<body\b[^>]*>([\s\S]*)<\/body\s*>/i);
  if (bodyMatch?.[1]) {
    current = bodyMatch[1].trim();
  }

  const htmlMatch = current.match(/<html\b[^>]*>([\s\S]*)<\/html\s*>/i);
  if (htmlMatch?.[1]) {
    current = htmlMatch[1].trim();
  }

  current = current.replace(/<!doctype[\s\S]*?>/gi, "").trim();
  current = current.replace(/^(?:<p>\s*)+/i, "").trim();

  return current;
}

function looksLikeRawHtmlSource(value) {
  const text = String(value || "").trim();
  return /(?:&lt;|<)\s*(?:!doctype|html|body|head)\b/i.test(text) || /(?:&lt;|<)\s*\/\s*(?:html|body|head)\s*>/i.test(text);
}

function parseRenderedHtmlFragment(fragment) {
  const parsed = new DOMParser().parseFromString(fragment, "text/html");
  const contentRoot = parsed.querySelector(".col-sm-10.offset-sm-1") || parsed.body || parsed.documentElement;
  return normalizeLearnerCopy(contentRoot?.innerHTML?.trim() || "");
}

function repairRenderableHtml(rawHtml) {
  let current = String(rawHtml || "");
  let previous = "";

  for (let pass = 0; pass < 4; pass += 1) {
    const fragment = extractHtmlBodyMarkup(current);
    const rendered = parseRenderedHtmlFragment(fragment);

    if (!rendered || rendered === previous) {
      return rendered;
    }

    if (!looksLikeRawHtmlSource(rendered)) {
      return rendered;
    }

    previous = rendered;
    current = rendered;
  }

  return parseRenderedHtmlFragment(extractHtmlBodyMarkup(current));
}

function unwrapEncodedHtmlDocument(rawHtml) {
  const unwrapped = extractHtmlBodyMarkup(rawHtml);
  const parsed = new DOMParser().parseFromString(unwrapped, "text/html");
  const bodyText = parsed.body?.textContent || "";
  const decoded = decodeHtmlEntitiesRepeatedly(bodyText, 2).replace(/^[\u0000-\u001f\u00a0\uFEFF]+/g, "").trim();

  if (decoded && /<(?:!doctype\s+html|html)(?:\s|>)/i.test(decoded)) {
    return new DOMParser().parseFromString(extractHtmlBodyMarkup(decoded), "text/html");
  }

  return parsed;
}

function parseQuizXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const metadataFields = getElementsByLocalName(xml, "qtimetadatafield");
  const readMeta = (label) => {
    const field = metadataFields.find(
      (node) => getElementsByLocalName(node, "fieldlabel")[0]?.textContent?.trim() === label
    );
    return getElementsByLocalName(field || xml, "fieldentry")[0]?.textContent?.trim();
  };
  const buildQuizMeta = (questionCount) => ({
    profile: readMeta("qmd_assessmenttype") || "Assessment",
    attempts: Number(readMeta("cc_maxattempts") || 1),
    timeLimitMinutes: Number(readMeta("qmd_timelimit") || 0),
    questionCount
  });

  const items = getElementsByLocalName(xml, "item");
  if (!items.length) {
    return {
      quizMeta: buildQuizMeta(0),
      quizQuestions: []
    };
  }

  const questions = items
    .map((item, itemIndex) => {
      const matTexts = getElementsByLocalName(item, "mattext").map((element) => decodeHtmlEntities(element.textContent || ""));
      const question = matTexts[0] || `Quiz question ${itemIndex + 1}`;
      const choiceNodes = getElementsByLocalName(item, "response_label");
      const choices = choiceNodes
        .map((node) => {
          const text = getElementsByLocalName(node, "mattext")[0]?.textContent || "";
          return decodeHtmlEntities(text).replace(/<[^>]+>/g, "").trim();
        })
        .filter(Boolean);

      const correctId = getElementsByLocalName(item, "respcondition")
        .find((node) => getElementsByLocalName(node, "setvar").length > 0)
        ?.getElementsByTagName("varequal")[0]
        ?.textContent?.trim();
      const choiceIds = choiceNodes.map((node) => node.getAttribute("ident"));
      const answerIndex = correctId ? Math.max(0, choiceIds.indexOf(correctId)) : 0;

      return {
        id: item.getAttribute("ident") || `item-${itemIndex + 1}`,
        question: question.replace(/<[^>]+>/g, "").trim(),
        choices,
        answerIndex
      };
    })
    .filter((question) => question.question && question.choices.length > 0);

  if (!questions.length) {
    return {
      quizMeta: buildQuizMeta(0),
      quizQuestions: []
    };
  }

  return {
    quizMeta: buildQuizMeta(questions.length),
    quizQuestions: questions
  };
}

function requestQuizData(activity) {
  if (!activity?.id || activity.resourceKind !== "quiz" || !activity.sourceHref) {
    return;
  }

  if (quizCacheByActivityId.has(activity.id) || quizLoadingByActivityId.has(activity.id)) {
    return;
  }

  quizLoadingByActivityId.add(activity.id);

  fetch(buildReferenceRawUrl(activity.sourceHref))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load quiz XML: ${response.status}`);
      }
      return readResponseText(response);
    })
    .then((xmlText) => {
      const parsed = parseQuizXml(xmlText);
      if (!parsed) {
        throw new Error("Could not parse quiz XML.");
      }
      quizCacheByActivityId.set(activity.id, parsed);
      quizErrorByActivityId.delete(activity.id);
    })
    .catch(() => {
      quizErrorByActivityId.add(activity.id);
    })
    .finally(() => {
      quizLoadingByActivityId.delete(activity.id);
      render();
    });
}

function getQuizDraft(activityId, questionCount) {
  const raw = state.quizDraftByActivityId?.[activityId];
  const fallback = {
    questionIndex: 0,
    answersByQuestion: {},
    revealedByQuestion: {},
    resultsVisible: false,
    resultsGeneratedAt: ""
  };

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const questionIndex = Number.isInteger(raw.questionIndex) ? Math.max(0, Math.min(raw.questionIndex, Math.max(0, questionCount - 1))) : 0;
  const answersByQuestion =
    raw.answersByQuestion && typeof raw.answersByQuestion === "object" ? raw.answersByQuestion : {};
  const revealedByQuestion =
    raw.revealedByQuestion && typeof raw.revealedByQuestion === "object" ? raw.revealedByQuestion : {};
  const resultsVisible = Boolean(raw.resultsVisible);
  const resultsGeneratedAt = typeof raw.resultsGeneratedAt === "string" ? raw.resultsGeneratedAt : "";

  return { questionIndex, answersByQuestion, revealedByQuestion, resultsVisible, resultsGeneratedAt };
}

function setQuizDraft(activityId, nextDraft) {
  state.quizDraftByActivityId[activityId] = nextDraft;
  saveState();
  render();
}

function updateQuizDraft(activityId, questionCount, updater) {
  const current = getQuizDraft(activityId, questionCount);
  const next = updater(current);
  setQuizDraft(activityId, next);
}

function renderTextContent(text) {
  const normalized = normalizeLearnerCopy(text).replace(/\r/g, "").replace(/\u00a0/g, " ").trim();
  if (!normalized) {
    return `<div class="empty">No content available.</div>`;
  }

  const blocks = normalized
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const merged = lines.join(" ").replace(/\s+/g, " ").trim();
      if (!merged) {
        return "";
      }

      const headingLike = lines.length === 1 && merged.length <= 72 && !/[.!?]$/.test(merged);
      if (headingLike) {
        return `<h4>${escapeHtml(merged)}</h4>`;
      }

      const isBulletList = lines.length > 1 && lines.every((line) => /^[-*•]\s+/.test(line));
      const isNumberedList = lines.length > 1 && lines.every((line) => /^\d+\.\s+/.test(line));
      if (isBulletList || isNumberedList) {
        const tagName = isNumberedList ? "ol" : "ul";
        const items = lines
          .map((line) => `<li>${escapeHtml(line.replace(/^(?:[-*•]|\d+\.)\s+/, ""))}</li>`)
          .join("");
        return `<${tagName}>${items}</${tagName}>`;
      }

      return `<p>${escapeHtml(merged)}</p>`;
    })
    .join("");
}

function moduleCounts(module) {
  const { content, assignments } = getModuleBuckets(module);
  const lessons = content.length;
  const assessments = assignments.length;
  return { lessons, assessments };
}

function isLessonCompleted(activityId) {
  return Boolean(state.completedActivityById[activityId]);
}

function setLessonCompleted(activityId, completed) {
  if (completed) {
    state.completedActivityById[activityId] = true;
  } else {
    delete state.completedActivityById[activityId];
  }
  saveState();
  render();
}

function moduleCompletion(module) {
  const { content } = getModuleBuckets(module);
  let completedCount = 0;
  for (const activity of content) {
    if (!isLessonCompleted(activity.id)) {
      break;
    }
    completedCount += 1;
  }
  const totalCount = content.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    completedCount,
    totalCount,
    percent,
    isUnlocked: totalCount === 0 ? true : completedCount === totalCount
  };
}

function buildUnlockedContentActivities(content) {
  if (!Array.isArray(content) || !content.length) {
    return [];
  }
  const nextIncompleteIndex = content.findIndex((activity) => !isLessonCompleted(activity.id));
  if (nextIncompleteIndex === -1) {
    return content;
  }
  return content.slice(0, nextIncompleteIndex + 1);
}

function getNextContentActivity(moduleId, activityId) {
  if (!moduleId || !activityId) {
    return null;
  }

  const module = courseShellData.modules.find((entry) => entry.id === moduleId);
  if (!module) {
    return null;
  }

  const { content } = getModuleBuckets(module);
  const index = content.findIndex((activity) => activity.id === activityId);
  if (index === -1 || index >= content.length - 1) {
    return null;
  }

  return content[index + 1];
}

function completeAndAdvanceLesson(moduleId, activityId) {
  if (!moduleId || !activityId) {
    return;
  }

  const module = courseShellData.modules.find((entry) => entry.id === moduleId);
  if (!module) {
    return;
  }

  const { content } = getModuleBuckets(module);
  const currentIndex = content.findIndex((activity) => activity.id === activityId);
  if (currentIndex === -1) {
    return;
  }

  state.completedActivityById[activityId] = true;
  const nextActivity = content[currentIndex + 1] || null;
  if (nextActivity) {
    state.selectedModuleId = moduleId;
    state.expandedModuleId = moduleId;
    state.selectedByBucket[bucketStateKey(moduleId, "content")] = nextActivity.id;
    state.moduleViewByModuleId[moduleId] = "content";
    state.sidebarLibraryView = "modules";
  }

  saveState();
  render();
}

function looksLikeAssignmentTitle(title) {
  const text = String(title || "").trim();
  if (!text) {
    return false;
  }
  return /\bassignment\b/i.test(text) || /\bquiz\b/i.test(text) || /\bfinal\s+project\b/i.test(text);
}

function normalizeAssignmentKey(title) {
  return cleanDisplayTitle(String(title || ""))
    .toLowerCase()
    .replace(/\blanguages\b/g, " language ")
    .replace(/\bquiz\b/g, " ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSourceHref(activity) {
  return Boolean(String(activity?.sourceHref || "").trim());
}

function isAssessmentTitleCandidate(title) {
  const text = String(title || "").trim();
  if (!text) {
    return false;
  }
  return /\bquiz\b/i.test(text) || /\bassignment\b/i.test(text) || /\bfinal\s+project\b/i.test(text);
}

function cleanDisplayTitle(value) {
  return String(value || "")
    .replace(/\bHuman Devlopment and Learning\b/gi, "Human Development and Learning")
    .replace(/\bIntroduction to Behaviour Disorders and Thier Treatment Quiz\b/gi, "Introduction to Behaviour Disorders and Their Treatment Quiz")
    .replace(/\bBehavioursim\b/gi, "Behaviourism");
}

function scoreAssignmentCandidate(activity) {
  let score = 0;
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const kind = String(activity?.kind || "").toLowerCase();

  if (hasSourceHref(activity)) {
    score += 100;
  }

  // Prefer true assessment payloads over similarly named HTML launcher pages.
  if (kind === "assessment") {
    score += 120;
  }

  if (resourceKind === "quiz") {
    score += 80;
  } else if (resourceKind === "assignment") {
    score += 70;
  } else if (resourceKind === "html") {
    score += 30;
  } else if (resourceKind === "pdf") {
    score += 20;
  }

  return score;
}

function dedupeAssignments(assignments) {
  const bestIdByKey = new Map();
  const bestScoreByKey = new Map();

  assignments.forEach((activity) => {
    const key = normalizeAssignmentKey(activity?.title) || String(activity?.id || "");
    const score = scoreAssignmentCandidate(activity);
    const currentBestScore = bestScoreByKey.get(key);
    if (typeof currentBestScore !== "number" || score > currentBestScore) {
      bestScoreByKey.set(key, score);
      bestIdByKey.set(key, activity.id);
    }
  });

  return assignments.filter((activity) => {
    const key = normalizeAssignmentKey(activity?.title) || String(activity?.id || "");
    return bestIdByKey.get(key) === activity.id;
  });
}

function isAssignment(activity) {
  const kind = String(activity?.kind || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const renderHint = String(activity?.renderHint || "").toLowerCase();
  if (kind === "overview") {
    return false;
  }

  if (resourceKind === "pdf" && /\bfinal\s+project\b/i.test(String(activity?.title || ""))) {
    return false;
  }

  if (kind === "assessment" || resourceKind === "assignment" || resourceKind === "quiz" || renderHint === "assessment") {
    return true;
  }

  return looksLikeAssignmentTitle(activity?.title);
}

function isWorkspaceAssignment(activity) {
  return isAssignment(activity);
}

function getActivityDisplayTitle(activity) {
  const sectionTitle = normalizeSectionTitle(activity?.sectionTitle).toLowerCase();
  const rawTitle = cleanDisplayTitle(String(activity?.title || "").trim());
  const titleLower = rawTitle.toLowerCase();

  if (sectionTitle === "history of psychological thought") {
    if (titleLower === "intro to psych explore 2") {
      return 'The Word "Psychology"';
    }
    if (titleLower === "intro to psych explore 3") {
      return "First Psychological Exams";
    }
    if (titleLower === "intro to psych explore 4") {
      return "Freud, Wundt, Titchener, and James";
    }
    if (titleLower === "intro to psych explore 5") {
      return "Freud & Psychotherapy";
    }
  }

  return rawTitle;
}

function shouldHideActivityFromModuleList(module, activity) {
  const moduleTitle = String(module?.title || "");
  const sectionTitle = String(activity?.sectionTitle || "");
  const activityTitle = String(activity?.title || "");
  const normalizedModuleTitle = normalizeSectionTitle(moduleTitle).toLowerCase();
  const normalizedSectionTitle = normalizeSectionTitle(sectionTitle).toLowerCase();
  const normalizedActivityTitle = normalizeSectionTitle(activityTitle).toLowerCase();

  if (normalizedModuleTitle.includes("module 4: experiment examples and practice project")) {
    if (normalizedSectionTitle === "section 2: practice project") {
      return true;
    }

    if (["practice project background", "practice project instructions", "lab report"].includes(normalizedActivityTitle)) {
      return true;
    }
  }

  if (normalizedModuleTitle.includes("module 1: history of psychological schools of thought")) {
    if (
      normalizedSectionTitle === "history of psychological thought" &&
      (/^intro to psych q\d+$/i.test(activityTitle) || normalizedActivityTitle === "well done!")
    ) {
      return true;
    }
  }

  if (normalizedModuleTitle.includes("process of learning")) {
    if (normalizedActivityTitle.includes("lesson three challenge - part c - matching")) {
      return true;
    }
    if (normalizedActivityTitle === "how we make memories quiz") {
      return true;
    }
    if (normalizedActivityTitle === "learning techniques quiz") {
      return true;
    }
  }

  if (normalizedModuleTitle.includes("facing frustration and conflict")) {
    if (normalizedActivityTitle === "aggression, altruism and conflict quiz") {
      return true;
    }
  }

  if (normalizedModuleTitle !== "module 2: statistics" || normalizedSectionTitle !== "section 1: measurements") {
    return false;
  }

  return [
    "means, modes, and other measures of central tendancy",
    "mode, median, and mean",
    "measures of variability",
    "practice with percentiles",
    "normal vs. abnormal",
    "reliability and validity"
  ].includes(normalizedActivityTitle);
}

function getModuleBuckets(module) {
  const activities = Array.isArray(module?.activities) ? [...module.activities] : [];
  const visibleActivities = activities
    .filter((activity) => !shouldHideActivityFromModuleList(module, activity))
    .sort((left, right) => Number(left?.order || 0) - Number(right?.order || 0));
  const baseAssignments = visibleActivities.filter((activity) => isWorkspaceAssignment(activity));
  const baseAssignmentKeys = new Set(
    baseAssignments
      .map((activity) => normalizeAssignmentKey(activity?.title))
      .filter(Boolean)
  );

  // If a module has both a shell assessment card and a source-backed lesson page with the same quiz/assignment title,
  // promote the source-backed page into Assignments so it stays usable there and remove its duplicate from Content.
  const promotedContentDuplicates = visibleActivities.filter((activity) => {
    if (isWorkspaceAssignment(activity) || !hasSourceHref(activity)) {
      return false;
    }
    if (!isAssessmentTitleCandidate(activity?.title)) {
      return false;
    }
    const key = normalizeAssignmentKey(activity?.title);
    return Boolean(key) && baseAssignmentKeys.has(key);
  });

  const assignments = dedupeAssignments([...baseAssignments, ...promotedContentDuplicates]);
  const assignmentKeys = new Set(assignments.map((activity) => normalizeAssignmentKey(activity?.title)).filter(Boolean));
  const content = visibleActivities.filter(
    (activity) => {
      if (String(activity?.kind || "").toLowerCase() === "overview" || isWorkspaceAssignment(activity)) {
        return false;
      }

      if (isAssessmentTitleCandidate(activity?.title)) {
        const key = normalizeAssignmentKey(activity?.title);
        if (key && assignmentKeys.has(key)) {
          return false;
        }
      }

      return true;
    }
  );
  return { content, assignments };
}

function normalizeSectionTitle(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sectionStateKey(moduleId, sectionKey) {
  return `${moduleId}::${sectionKey || "__general__"}`;
}

function isSectionCollapsed(moduleId, sectionKey) {
  return Boolean(state.collapsedSectionByKey[sectionStateKey(moduleId, sectionKey)]);
}

function toggleSectionCollapsed(moduleId, sectionKey) {
  const key = sectionStateKey(moduleId, sectionKey);
  const next = !state.collapsedSectionByKey[key];
  if (next) {
    state.collapsedSectionByKey[key] = true;
  } else {
    delete state.collapsedSectionByKey[key];
  }
  saveState();
  render();
}

function groupContentBySection(content) {
  const groups = [];
  const groupIndexByKey = new Map();

  for (const activity of content) {
    const sectionTitle = normalizeSectionTitle(activity?.sectionTitle);
    const key = sectionTitle || "__general__";
    const existingIndex = groupIndexByKey.get(key);

    if (typeof existingIndex === "number") {
      groups[existingIndex].items.push(activity);
      continue;
    }

    groupIndexByKey.set(key, groups.length);
    groups.push({
      key,
      sectionTitle,
      items: [activity]
    });
  }

  return groups;
}

function getModuleReaderItems(module) {
  const { content, assignments } = getModuleBuckets(module);
  return [...content, ...assignments];
}

const DEAD_LESSON_LINK_PATTERNS = [
  /moodle\.eipsnextstep\.ca/i,
  /\/d2l\/common\/dialogs\/quickLink\/quickLink\.d2l/i,
  /\$@BOOKVIEWBYID\*\d+@\$/i,
  /^http:\/\/mailto:/i,
  /googleadservices\.com\/pagead\/aclk/i,
  /howdoitech\.com\/2014\/06\/how-do-i-take-a-screenshot-on-a-chromebook/i,
  /(?:careerplanning|gradschool|psychology)\.about\.com\//i,
  /occinfo\.alis\.alberta\.ca\/occinfopreview\//i,
  /thechicagoschoolonline\.net\/masters-industrial-org-psychology\.asp/i,
  /mhankyswoh\.org\/Uploads\/files\/pdfs\/ChildrenAdol-TeenLifeChangeScale_20130812\.pdf/i,
  /verywellmind\.com\/a-list-of-psychology-careers-2794917/i
];

function isDeadLessonLink(href) {
  const value = String(href || "").trim();
  return Boolean(value) && DEAD_LESSON_LINK_PATTERNS.some((pattern) => pattern.test(value));
}

function unwrapAnchorAsPlainContent(anchor) {
  const ownerDocument = anchor.ownerDocument || document;
  const fragment = ownerDocument.createDocumentFragment();
  while (anchor.firstChild) {
    fragment.appendChild(anchor.firstChild);
  }
  if (!fragment.childNodes.length) {
    fragment.appendChild(ownerDocument.createTextNode(anchor.textContent || ""));
  }
  anchor.replaceWith(fragment);
}

function unwrapDeadLessonLinks(contentRoot) {
  contentRoot.querySelectorAll("a[href]").forEach((anchor) => {
    if (isDeadLessonLink(anchor.getAttribute("href") || "")) {
      unwrapAnchorAsPlainContent(anchor);
    }
  });
}

function sanitizeHtmlContent(rawHtml, sourceHref) {
  const doc = unwrapEncodedHtmlDocument(normalizeLearnerCopy(rawHtml));

  doc.querySelectorAll("script, style, link, meta, title, head, noscript").forEach((node) => node.remove());
  doc.querySelectorAll(".sr-only, .visually-hidden").forEach((node) => node.remove());

  const contentRoot = doc.querySelector(".col-sm-10.offset-sm-1") || doc.body;
  const normalizedSourceHref = normalizePath(sourceHref || "");

  // Source-specific media repairs for known missing binary files in this export.
  if (/chapter_15805\.html$/i.test(normalizedSourceHref)) {
    contentRoot.querySelectorAll("video").forEach((video) => {
      const embedShell = doc.createElement("div");
      embedShell.className = "lesson-video-embed";
      embedShell.innerHTML = `
        <iframe
          src="https://www.youtube.com/embed/R-sVnmmw6WY?si=lz5DO1T8oeMt3XV4"
          title="Cognition - Crash Course Psychology #15"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen
          referrerpolicy="strict-origin-when-cross-origin"
        ></iframe>
      `;
      video.replaceWith(embedShell);
    });
  }

  unwrapDeadLessonLinks(contentRoot);

  const rewriteAttribute = (selector, attribute) => {
    contentRoot.querySelectorAll(selector).forEach((element) => {
      const rawValue = element.getAttribute(attribute);
      if (!rawValue) {
        return;
      }

      const value = rawValue.trim();
      if (!value) {
        return;
      }

      if (/^javascript:/i.test(value) || /^data:text\/html/i.test(value)) {
        element.removeAttribute(attribute);
        return;
      }

      if (/^(https?:|mailto:|tel:|#)/i.test(value)) {
        if (attribute === "href") {
          element.setAttribute("target", "_blank");
          element.setAttribute("rel", "noopener noreferrer");
        }
        return;
      }

      if (value.startsWith("/shared/")) {
        element.removeAttribute(attribute);
        return;
      }

      const resolved = resolveRelativePath(sourceHref, value);
      if (!resolved || /^(https?:|mailto:|tel:|#)/i.test(resolved)) {
        return;
      }

      element.setAttribute(attribute, buildReferenceRawUrl(resolved));
      if (attribute === "href") {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noopener noreferrer");
      }
    });
  };

  rewriteAttribute("img[src]", "src");
  rewriteAttribute("a[href]", "href");
  rewriteAttribute("source[src]", "src");
  rewriteAttribute("video[src]", "src");
  rewriteAttribute("object[data]", "data");

  contentRoot.querySelectorAll("p").forEach((paragraph) => {
    const text = (paragraph.textContent || "").replace(/\u00a0/g, " ").trim();
    if (!text && !paragraph.querySelector("img, a, iframe, video, object")) {
      paragraph.remove();
    }
  });

  const rendered = normalizeLearnerCopy(contentRoot.innerHTML.trim());
  if (!rendered) {
    return rendered;
  }

  if (looksLikeRawHtmlSource(rendered)) {
    return repairRenderableHtml(rendered);
  }

  return rendered;
}

function requestActivityHtml(activity) {
  if (!activity || activity.resourceKind !== "html" || !activity.sourceHref) {
    return;
  }

  if (htmlCacheByActivityId.has(activity.id) || htmlLoadingByActivityId.has(activity.id)) {
    return;
  }

  htmlLoadingByActivityId.add(activity.id);

  fetch(buildReferenceRawUrl(activity.sourceHref))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load source HTML: ${response.status}`);
      }
      return readResponseText(response);
    })
    .then((html) => {
      htmlCacheByActivityId.set(activity.id, sanitizeHtmlContent(html, activity.sourceHref));
      htmlErrorByActivityId.delete(activity.id);
    })
    .catch(() => {
      htmlErrorByActivityId.add(activity.id);
    })
    .finally(() => {
      htmlLoadingByActivityId.delete(activity.id);
      render();
    });
}

function buildPdfViewerId(activityId) {
  return `pdf-viewer-${activityId}`;
}

function getPdfViewerElement(activityId) {
  return root.querySelector(`[data-pdf-viewer-id="${CSS.escape(buildPdfViewerId(activityId))}"]`);
}

function getPdfToolbarMetaElement(activityId) {
  return root.querySelector(`[data-pdf-meta-id="${CSS.escape(buildPdfViewerId(activityId))}"]`);
}

function requestPdfDocument(activity) {
  if (!activity?.id || activity.resourceKind !== "pdf" || !activity.sourceHref) {
    return Promise.reject(new Error("Missing PDF source."));
  }

  const existing = pdfDocumentPromiseByActivityId.get(activity.id);
  if (existing) {
    return existing;
  }

  const loadingTask = pdfjsLib.getDocument(buildReferenceRawUrl(activity.sourceHref));
  const promise = loadingTask.promise
    .then((doc) => {
      pdfErrorByActivityId.delete(activity.id);
      return doc;
    })
    .catch((error) => {
      pdfDocumentPromiseByActivityId.delete(activity.id);
      pdfErrorByActivityId.add(activity.id);
      throw error;
    });

  pdfDocumentPromiseByActivityId.set(activity.id, promise);
  return promise;
}

async function hydratePdfViewer(activity) {
  if (!activity?.id || activity.resourceKind !== "pdf" || !activity.sourceHref) {
    return;
  }

  const viewer = getPdfViewerElement(activity.id);
  if (!viewer || viewer.dataset.loading === "true") {
    return;
  }

  viewer.dataset.loading = "true";

  try {
    const pdfDocument = await requestPdfDocument(activity);
    const freshViewer = getPdfViewerElement(activity.id);
    if (!freshViewer) {
      return;
    }

    const meta = getPdfToolbarMetaElement(activity.id);
    if (meta) {
      meta.textContent = `${pdfDocument.numPages} pages`;
    }

    freshViewer.innerHTML = "";

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.3 });
      const pageCard = document.createElement("section");
      pageCard.className = "pdf-page";

      const pageLabel = document.createElement("div");
      pageLabel.className = "pdf-page-label";
      pageLabel.textContent = `Page ${pageNumber}`;

      const canvas = document.createElement("canvas");
      canvas.className = "pdf-canvas";
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Could not create PDF canvas context.");
      }

      await page.render({
        canvasContext: context,
        viewport
      }).promise;

      pageCard.append(pageLabel, canvas);
      freshViewer.appendChild(pageCard);
    }
  } catch {
    const freshViewer = getPdfViewerElement(activity.id);
    if (freshViewer) {
      freshViewer.innerHTML = `
        <div class="document-fallback">
          <p>This document preview could not be rendered in the workspace.</p>
          <a class="document-link" href="${escapeHtml(buildReferenceRawUrl(activity.sourceHref))}" target="_blank" rel="noopener noreferrer">Open the PDF in a new tab</a>
        </div>
      `;
    }
  } finally {
    const freshViewer = getPdfViewerElement(activity.id);
    if (freshViewer) {
      freshViewer.dataset.loading = "false";
    }
  }
}

function renderActionLink(href, label, className = "assignment-link") {
  if (!href || !label) {
    return "";
  }

  const external = /^(https?:|mailto:|tel:)/i.test(href);
  return `<a class="${className}" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ' target="_blank" rel="noopener noreferrer"'}>${escapeHtml(label)}</a>`;
}

function renderAssessmentHandIn(activity, delivery) {
  const primaryHref = delivery?.ctaUrl || "";
  const supportHref = delivery?.resourcePath ? buildReferenceRawUrl(delivery.resourcePath) : "";
  const secondaryHref = delivery?.secondaryResourcePath ? buildReferenceRawUrl(delivery.secondaryResourcePath) : "";
  const statusText =
    delivery?.statusText || "Complete this work outside the workspace and hand it in through your course submission flow.";
  const summary =
    delivery?.summary || "This assignment is being routed out of the workspace so it does not feel like a dead-end internal submission.";
  const handInNote =
    delivery?.handInNote || "Use the module materials here as support, then submit the finished work outside the workspace.";

  return `
    <div class="assignment-handoff">
      <div class="assignment-handoff-head">
        <div>
          <div class="assignment-handoff-label">External hand-in</div>
          <h5>${escapeHtml(activity.title)}</h5>
        </div>
        <div class="assignment-handoff-state">${escapeHtml(delivery?.deliveryMode === "document-handin" ? "Document hand-in" : "Google Docs/Classroom")}</div>
      </div>
      <p class="assignment-handoff-summary">${escapeHtml(summary)}</p>
      <div class="assignment-handoff-note">
        <strong>Submission path</strong>
        <span>${escapeHtml(statusText)}</span>
      </div>
      <div class="assignment-links">
        ${
          primaryHref
            ? renderActionLink(primaryHref, delivery.ctaLabel || "Open hand-in", "assignment-link primary")
            : `<div class="assignment-link-placeholder">${escapeHtml(delivery?.ctaLabel || "Google Classroom hand-in link")}</div>`
        }
        ${supportHref ? renderActionLink(supportHref, delivery.resourceLabel || "Review assignment support") : ""}
        ${
          secondaryHref
            ? renderActionLink(secondaryHref, delivery.secondaryResourceLabel || "Open supporting document", "assignment-link secondary")
            : ""
        }
      </div>
      <p class="assignment-handoff-footnote">${escapeHtml(handInNote)}</p>
    </div>
  `;
}

function renderEmbeddedAssignment(activity, delivery) {
  const embedHref = buildWorkspaceAssetUrl(delivery?.embedPath || delivery?.ctaUrl || "");
  const sectionJumpHash = String(delivery?.sectionJumpHash || "").trim();
  const normalizedJumpHash = sectionJumpHash ? (sectionJumpHash.startsWith("#") ? sectionJumpHash : `#${sectionJumpHash}`) : "";
  const sectionJumpHref = embedHref && normalizedJumpHash ? `${embedHref}${normalizedJumpHash}` : "";
  const sectionJumpLabel = delivery?.sectionJumpLabel || "Jump to assignment section";
  const supportHref = delivery?.resourcePath ? buildReferenceRawUrl(delivery.resourcePath) : "";
  const secondaryHref = delivery?.secondaryResourcePath ? buildReferenceRawUrl(delivery.secondaryResourcePath) : "";
  const statusText =
    delivery?.statusText || "Complete this interactive assignment in the workspace, then export the finished report for submission.";
  const summary =
    delivery?.summary || "This assignment now runs directly in the workspace so students can complete the interactive handout in place.";
  const handInNote =
    delivery?.handInNote || "Complete the assignment, export the finished work, and submit it through your course hand-in flow.";

  return `
    <div class="assignment-embed-shell">
      <div class="assignment-handoff-head">
        <div>
          <div class="assignment-handoff-label">Interactive assignment</div>
          <h5>${escapeHtml(activity.title)}</h5>
        </div>
        <div class="assignment-handoff-state">Workspace lab</div>
      </div>
      <p class="assignment-handoff-summary">${escapeHtml(summary)}</p>
      <div class="assignment-handoff-note">
        <strong>How to use it</strong>
        <span>${escapeHtml(statusText)}</span>
      </div>
      <div class="assignment-links">
        ${embedHref ? renderActionLink(embedHref, delivery?.ctaLabel || "Open assignment in a new tab", "assignment-link primary") : ""}
        ${sectionJumpHref ? renderActionLink(sectionJumpHref, sectionJumpLabel) : ""}
        ${supportHref ? renderActionLink(supportHref, delivery.resourceLabel || "Review assignment support") : ""}
        ${
          secondaryHref
            ? renderActionLink(secondaryHref, delivery.secondaryResourceLabel || "Open supporting document", "assignment-link secondary")
            : ""
        }
      </div>
      ${
        embedHref
          ? `
        <div class="assignment-embed-frame-wrap">
          <iframe
            class="assignment-embed-frame"
            src="${escapeHtml(embedHref)}"
            title="${escapeHtml(activity.title)}"
            loading="eager"
            scrolling="no"
          ></iframe>
        </div>
      `
          : `<div class="assignment-link-placeholder">Interactive assignment file not added yet.</div>`
      }
      <p class="assignment-handoff-footnote">${escapeHtml(handInNote)}</p>
    </div>
  `;
}

function parseQuizLauncherHtml(htmlText) {
  const parsed = unwrapEncodedHtmlDocument(htmlText);
  const quizAnchor = Array.from(parsed.querySelectorAll("a[href]")).find((anchor) =>
    /type=quiz/i.test(anchor.getAttribute("href") || "")
  );

  const anchorText = decodeHtmlEntities((quizAnchor?.textContent || "").replace(/\s+/g, " ").trim());
  const anchorHref = String(quizAnchor?.getAttribute("href") || "").trim();
  const copyCandidates = Array.from(parsed.querySelectorAll("p, h4, h5, strong, em"))
    .map((node) => decodeHtmlEntities((node.textContent || "").replace(/\s+/g, " ").trim()))
    .filter(Boolean);

  const usageText =
    copyCandidates.find((text) => /\b(click|complete|quiz)\b/i.test(text) && text.length >= 22) ||
    copyCandidates[0] ||
    "";
  const followUpText =
    copyCandidates.find(
      (text) =>
        text !== usageText &&
        text.length >= 18 &&
        !/\bclick on\b/i.test(text) &&
        !/\bquiz\b/i.test(text)
    ) || "";

  return {
    quizHref: anchorHref,
    quizLabel: anchorText,
    usageText,
    followUpText
  };
}

function requestQuizLauncherData(activity, delivery) {
  if (!activity?.id || !delivery || quizLauncherCacheByActivityId.has(activity.id) || quizLauncherLoadingByActivityId.has(activity.id)) {
    return;
  }

  const sourceUrl = buildWorkspaceAssetUrl(delivery?.embedPath || delivery?.ctaUrl || "");
  if (!sourceUrl) {
    quizLauncherErrorByActivityId.add(activity.id);
    return;
  }

  quizLauncherLoadingByActivityId.add(activity.id);

  fetch(sourceUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load quiz launcher content: ${response.status}`);
      }
      return readResponseText(response);
    })
    .then((htmlText) => {
      const parsed = parseQuizLauncherHtml(htmlText);
      quizLauncherCacheByActivityId.set(activity.id, parsed);
      quizLauncherErrorByActivityId.delete(activity.id);
    })
    .catch(() => {
      quizLauncherErrorByActivityId.add(activity.id);
    })
    .finally(() => {
      quizLauncherLoadingByActivityId.delete(activity.id);
      render();
    });
}

function renderQuizLauncher(activity, delivery) {
  const launcher = quizLauncherCacheByActivityId.get(activity.id);
  if (!launcher && !quizLauncherErrorByActivityId.has(activity.id)) {
    requestQuizLauncherData(activity, delivery);
    return `<p class="loading">Loading quiz activity...</p>`;
  }

  const fallbackTitle = cleanDisplayTitle(activity.title || "Quiz");
  const launchHref = launcher?.quizHref || "";
  const launchLabel = launcher?.quizLabel || fallbackTitle;
  const launchPageHref = buildWorkspaceAssetUrl(delivery?.embedPath || delivery?.ctaUrl || "");
  const supportHref = delivery?.resourcePath ? buildReferenceRawUrl(delivery.resourcePath) : "";
  const usageText =
    launcher?.usageText ||
    delivery?.statusText ||
    "Open the quiz link below, complete the quiz, and save your result for submission.";
  const followUpText =
    launcher?.followUpText ||
    "This export contains the quiz launcher page but not the internal D2L question bank file.";

  return `
    <div class="quiz-shell quiz-launch-shell">
      <div class="quiz-toolbar">
        <div class="quiz-toolbar-copy">
          <div class="quiz-label">Assignments</div>
          <h5>${escapeHtml(fallbackTitle)}</h5>
        </div>
        <div class="quiz-stats">
          <span class="quiz-stat">Launcher page detected</span>
          <span class="quiz-stat">Workspace quiz flow</span>
        </div>
      </div>
      <div class="quiz-progress">
        <div class="quiz-progress-bar" style="width: 100%;"></div>
      </div>
      <div class="quiz-card">
        <div class="quiz-question">${escapeHtml(usageText)}</div>
        <p class="quiz-launch-note">${escapeHtml(followUpText)}</p>
        <div class="quiz-actions">
          ${
            launchHref
              ? renderActionLink(launchHref, `Open ${launchLabel}`, "assignment-link primary")
              : `<div class="assignment-link-placeholder">No quiz launch link was found on this page.</div>`
          }
          ${launchPageHref ? renderActionLink(launchPageHref, delivery?.ctaLabel || "Open assignment in a new tab", "assignment-link") : ""}
          ${supportHref ? renderActionLink(supportHref, delivery.resourceLabel || "Review assignment support", "assignment-link secondary") : ""}
        </div>
      </div>
    </div>
  `;
}

function measureEmbedFrameContentHeight(frame) {
  try {
    const doc = frame.contentDocument || frame.contentWindow?.document;
    if (!doc) {
      return null;
    }
    const body = doc.body;
    const html = doc.documentElement;
    if (!body || !html) {
      return null;
    }
    return Math.max(
      body.scrollHeight,
      body.offsetHeight,
      body.clientHeight,
      html.scrollHeight,
      html.offsetHeight,
      html.clientHeight
    );
  } catch {
    return null;
  }
}

function resizeEmbedFrame(frame) {
  const measured = measureEmbedFrameContentHeight(frame);
  if (!measured) {
    return;
  }
  const minHeight = window.matchMedia("(max-width: 560px)").matches ? 1350 : 980;
  const nextHeight = Math.max(minHeight, measured + 18);
  const currentHeight = Number.parseInt(frame.style.height || "0", 10);
  if (Number.isFinite(currentHeight) && Math.abs(nextHeight - currentHeight) < 2) {
    return;
  }
  frame.style.height = `${nextHeight}px`;
}

function bindEmbedFrameAutoResize(frame) {
  if (!frame || frame.dataset.resizeBound === "true") {
    return;
  }
  frame.dataset.resizeBound = "true";

  let rafToken = 0;
  const scheduleResize = () => {
    if (rafToken) {
      return;
    }
    rafToken = window.requestAnimationFrame(() => {
      rafToken = 0;
      resizeEmbedFrame(frame);
    });
  };

  const schedulePasses = () => {
    scheduleResize();
    [120, 420, 900, 1700, 2600].forEach((delay) => {
      window.setTimeout(scheduleResize, delay);
    });
    const pollHandle = window.setInterval(scheduleResize, 1200);
    window.setTimeout(() => window.clearInterval(pollHandle), 14000);
  };

  const onLoad = () => {
    schedulePasses();
    try {
      const doc = frame.contentDocument || frame.contentWindow?.document;
      const target = doc?.body || doc?.documentElement;
      if (!target || typeof MutationObserver === "undefined") {
        return;
      }
      const observer = new MutationObserver(() => scheduleResize());
      observer.observe(target, { childList: true, subtree: true, attributes: true });
      window.setTimeout(() => observer.disconnect(), 16000);
    } catch {
      // Same-origin guards or transient load states can fail safely.
    }
  };

  frame.addEventListener("load", onLoad);

  if (frame.contentDocument?.readyState === "complete") {
    onLoad();
  }
}

function bindEmbeddedFrames() {
  root.querySelectorAll(".assignment-embed-frame").forEach((frame) => {
    bindEmbedFrameAutoResize(frame);
  });
}

function renderQuiz(activity, quizData) {
  const questions = quizData?.quizQuestions || [];
  if (!questions.length) {
    return `
      <div class="reader-text">
        ${renderTextContent(
          "This quiz was exported without question content in the current cartridge. Provide the full quiz bank export to enable in-browser attempts."
        )}
      </div>
      ${
        activity?.sourceHref
          ? `<p class="reader-meta"><a class="document-link" href="${escapeHtml(buildReferenceRawUrl(activity.sourceHref))}" target="_blank" rel="noopener noreferrer">Open quiz source XML</a></p>`
          : ""
      }
    `;
  }

  const draft = getQuizDraft(activity.id, questions.length);
  const answeredCount = questions.filter((question) => Number.isInteger(draft.answersByQuestion[question.id])).length;
  const resultsVisible = Boolean(draft.resultsVisible);
  const statusLabel = resultsVisible ? "Quiz complete" : answeredCount > 0 ? "In progress" : "Not started";
  const submittedLabel = resultsVisible && draft.resultsGeneratedAt ? draft.resultsGeneratedAt : "Not yet submitted";
  const quizProfile = quizData.quizMeta?.profile || "Assessment";

  return `
    <div
      class="quiz-shell quiz-detail-surface"
      data-quiz-id="${escapeHtml(activity.id)}"
      data-quiz-layout="forensics-assessment"
    >
      <div class="quiz-detail-layout">
        <div class="quiz-header">
          <div class="quiz-copy">
            <p class="quiz-eyebrow">General Psychology 20 &bull; ${escapeHtml(quizProfile)}</p>
            <h4 class="quiz-page-title">${escapeHtml(activity.title)}</h4>
          </div>
          <div class="quiz-meta-row">
            <div class="quiz-meta-block">
              <span>Status</span>
              <strong>${escapeHtml(statusLabel)}</strong>
            </div>
            <div class="quiz-meta-block">
              <span>Submitted</span>
              <strong>${escapeHtml(submittedLabel)}</strong>
            </div>
          </div>
        </div>

        <section class="quiz-evaluation-panel">
          <div class="quiz-evaluation-copy">
            <h5>Final Evaluation</h5>
            <p>This counter tracks completed questions only. Marks are handled separately, and responses can be reviewed after results are generated.</p>
          </div>
          <div class="quiz-evaluation-score" data-testid="quiz-progress">
            <strong><span>${answeredCount}</span><small>/${questions.length}</small></strong>
            <span class="quiz-evaluation-status">Questions completed</span>
          </div>
        </section>

        <div class="quiz-actions quiz-actions-row">
          <button class="quiz-action primary" type="button" data-quiz-generate="${escapeHtml(activity.id)}">Generate Results</button>
          <button class="quiz-action" type="button" data-quiz-check-all="${escapeHtml(activity.id)}" ${resultsVisible ? "" : "disabled"}>Check answers</button>
          <button class="quiz-action" type="button" data-quiz-retake="${escapeHtml(activity.id)}" ${answeredCount || resultsVisible ? "" : "disabled"}>Retake Quiz</button>
          <button class="quiz-action quiz-back-link" type="button" data-library-view="quizzes">Back to quizzes <span aria-hidden="true">-&gt;</span></button>
        </div>

        <section class="quiz-breakdown-shell" data-testid="quiz-section-breakdown">
          <h5 class="quiz-breakdown-title">Section Breakdown</h5>
          <div class="quiz-section-breakdown" data-testid="quiz-question-nav">
            <button
              class="quiz-breakdown-item active"
              type="button"
              data-quiz-question="${escapeHtml(activity.id)}"
              data-question-index="0"
              data-testid="quiz-question-button"
            >
              <span class="quiz-breakdown-copy">
                <span class="quiz-breakdown-name">Multiple Choice</span>
                <span class="quiz-breakdown-range">Questions 1-${questions.length}</span>
              </span>
              <span class="quiz-breakdown-score">${answeredCount}/${questions.length}</span>
            </button>
          </div>
        </section>

        <div class="quiz-question-list">
          ${questions
            .map(
              (question, questionIndex) => {
                const selectedAnswer = draft.answersByQuestion[question.id];
                const isAnswered = Number.isInteger(selectedAnswer);
                const isCorrect = selectedAnswer === question.answerIndex;
                return `
            <article class="quiz-question-row" data-testid="quiz-question-row">
              <div class="quiz-question-grid">
                <span class="quiz-question-number">${questionIndex + 1}</span>
                <div class="quiz-question-body">
                  <p class="quiz-question">${escapeHtml(question.question || "Untitled question")}</p>
                  <div class="quiz-choices">
                    ${(question.choices || [])
                      .map((choice, choiceIndex) => {
                        const selected = selectedAnswer === choiceIndex;
                        const revealCorrect = resultsVisible && choiceIndex === question.answerIndex;
                        const revealWrong = resultsVisible && selected && !isCorrect;
                        const stateClass = revealCorrect ? "correct" : revealWrong ? "incorrect" : selected ? "selected" : "";
                        return `
                    <button
                      class="quiz-choice ${stateClass}"
                      type="button"
                      data-quiz-choice="${escapeHtml(activity.id)}"
                      data-question-id="${escapeHtml(question.id)}"
                      data-choice-index="${choiceIndex}"
                      ${resultsVisible ? "disabled" : ""}
                      data-testid="quiz-answer-choice"
                    >
                      <span class="quiz-choice-letter" aria-hidden="true">${String.fromCharCode(65 + choiceIndex)}</span>
                      <span>${escapeHtml(choice)}</span>
                    </button>
          `
                      })
                      .join("")}
                  </div>
                  ${
                    resultsVisible && isAnswered
                      ? `
                  <div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}">
                    ${isCorrect ? "Correct" : `Incorrect. Correct answer: ${escapeHtml(question.choices?.[question.answerIndex] || "Not available")}`}
                  </div>
                `
                      : ""
                  }
                </div>
              </div>
            </article>
          `;
              }
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderLessonCompletionFooter(activity, moduleId) {
  if (!activity || isAssignment(activity)) {
    return "";
  }

  const completed = isLessonCompleted(activity.id);
  const nextActivity = getNextContentActivity(moduleId, activity.id);
  return `
    <div class="lesson-completion-card">
      <div>
        <strong>${completed ? "Lesson completed" : "Mark this lesson complete"}</strong>
        <span>${completed ? "This lesson now counts toward the module release condition." : "Complete every lesson in the module to unlock that module's quizzes."}</span>
      </div>
      <div class="lesson-completion-actions">
        <button
          class="lesson-completion-btn ${completed ? "completed" : ""}"
          type="button"
          data-complete-lesson="${escapeHtml(activity.id)}"
          data-completed="${completed ? "true" : "false"}"
        >
          ${completed ? "Completed" : "Mark complete"}
        </button>
        ${
          nextActivity
            ? `
        <button
          class="lesson-next-btn"
          type="button"
          data-complete-next="${escapeHtml(activity.id)}"
          data-module-id="${escapeHtml(moduleId || "")}"
        >
          ${completed ? "Next content" : "Mark complete + next"}
        </button>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function renderActivityBody(activity) {
  if (!activity) {
    return `<div class="empty">Select an item to view its content.</div>`;
  }

  const localQuiz = getLocalQuizOverride(activity);
  if (localQuiz) {
    return renderQuiz(activity, localQuiz);
  }

  const delivery = getAssessmentDelivery(activity);
  const embedPath = String(delivery?.embedPath || "").trim();
  const hasLocalWorkspaceEmbed = embedPath.startsWith("./assets/");

  if (delivery?.deliveryMode === "workspace-embed" && hasLocalWorkspaceEmbed) {
    return renderEmbeddedAssignment(activity, delivery);
  }

  if (activity.resourceKind === "quiz" && activity.sourceHref) {
    const quizData = quizCacheByActivityId.get(activity.id);
    if (quizData) {
      return renderQuiz(activity, quizData);
    }

    if (!quizErrorByActivityId.has(activity.id)) {
      requestQuizData(activity);
      return `<p class="loading">Loading assessment questions...</p>`;
    }

    return `<div class="reader-text">${renderTextContent("This assessment could not be loaded in the workspace.")}</div>`;
  }

  if (delivery?.deliveryMode === "workspace-embed" && !(activity.resourceKind === "quiz" && activity.sourceHref)) {
    if (isQuizDeliveryActivity(activity, delivery)) {
      return renderQuizLauncher(activity, delivery);
    }
    return renderEmbeddedAssignment(activity, delivery);
  }

  if (delivery && delivery.deliveryMode !== "workspace-quiz") {
    return renderAssessmentHandIn(activity, delivery);
  }

  if (activity.resourceKind === "pdf" && activity.sourceHref) {
    const pdfUrl = buildReferenceRawUrl(activity.sourceHref);
    queueMicrotask(() => {
      hydratePdfViewer(activity);
    });
    return `
      <div class="reader-document">
        <div class="document-toolbar">
          <div class="document-meta" data-pdf-meta-id="${escapeHtml(buildPdfViewerId(activity.id))}">Loading pages...</div>
          <a class="document-link" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">Open document in a new tab</a>
        </div>
        <div class="document-frame" data-pdf-viewer-id="${escapeHtml(buildPdfViewerId(activity.id))}" data-loading="false">
          <p class="loading">Loading document pages...</p>
        </div>
      </div>
    `;
  }

  if (activity.resourceKind === "html" && activity.sourceHref) {
    if (htmlCacheByActivityId.has(activity.id)) {
      return `<div class="reader-html">${htmlCacheByActivityId.get(activity.id)}</div>`;
    }

    if (!htmlErrorByActivityId.has(activity.id)) {
      requestActivityHtml(activity);
      return `<p class="loading">Loading formatted source content...</p>`;
    }
  }

  const fallback = activity.contentBody || activity.contentPreview || activity.description || "";
  return `<div class="reader-text">${renderTextContent(fallback)}</div>`;
}

function renderContentGroups(moduleId, content, selectedActivityId) {
  if (!content.length) {
    return `<div class="empty compact-empty">No content items.</div>`;
  }

  const sectionGroups = groupContentBySection(content);
  const hasNamedSections = sectionGroups.some((group) => Boolean(group.sectionTitle));

  if (!hasNamedSections) {
    return content
      .map((activity) =>
        renderActivityListItem(moduleId, "content", activity, selectedActivityId === activity.id, "module-item-btn")
      )
      .join("");
  }

  return sectionGroups
    .map((group) => {
      if (!group.sectionTitle) {
        return `
          <div class="subgroup subgroup-plain">
            <div class="subgroup-items">
              ${group.items
                .map((activity) =>
                  renderActivityListItem(moduleId, "content", activity, selectedActivityId === activity.id, "module-item-btn")
                )
                .join("")}
            </div>
          </div>
        `;
      }

      const label = group.sectionTitle;
      const collapsed = isSectionCollapsed(moduleId, group.key);
      return `
        <div class="subgroup ${collapsed ? "collapsed" : ""}">
          <button
            class="subgroup-toggle"
            type="button"
            data-toggle-section
            data-module-id="${escapeHtml(moduleId)}"
            data-section-key="${escapeHtml(group.key)}"
            aria-expanded="${collapsed ? "false" : "true"}"
          >
            <span class="subgroup-caret" aria-hidden="true">${collapsed ? ">" : "v"}</span>
            <span class="subgroup-label ${group.sectionTitle ? "" : "muted"}">${escapeHtml(label)}</span>
          </button>
          <div class="subgroup-items">
            ${group.items
              .map((activity) =>
                renderActivityListItem(moduleId, "content", activity, selectedActivityId === activity.id, "module-item-btn")
              )
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

function renderModuleButton(module, expanded, selected) {
  const { content } = getModuleBuckets(module);
  const unlockedContent = buildUnlockedContentActivities(content);
  const completion = moduleCompletion(module);
  const selectedItem = expanded ? getSelectedActivity(module.id, "content", unlockedContent) : null;

  return `
    <article class="module-card ${expanded ? "expanded" : ""} ${selected ? "selected" : ""}">
      <button class="module-btn ${expanded ? "expanded" : ""} ${selected ? "selected" : ""}" data-module="${escapeHtml(module.id)}" type="button">
        <div class="module-kicker">${escapeHtml(module.overline || "Module")}</div>
        <h3>${escapeHtml(module.title)}</h3>
        <div class="module-progress-block">
          <div class="module-progress-meta">
            <span>${completion.completedCount}/${completion.totalCount} completed</span>
            <span>${completion.percent}%</span>
          </div>
          <div class="module-progress-track">
            <div class="module-progress-fill" style="width: ${completion.percent}%;"></div>
          </div>
          <div class="module-progress-note">
            ${
              completion.isUnlocked
                ? `Quizzes unlocked`
                : `Complete content to unlock quizzes`
            }
          </div>
        </div>
      </button>
      ${
        expanded
          ? `
      <div class="module-dropdown">
        <div class="group-block" data-testid="module-content-view">
          ${renderContentGroups(module.id, unlockedContent, selectedItem?.id)}
        </div>
      </div>
    `
          : ""
      }
    </article>
  `;
}

function renderActivityListItem(moduleId, bucket, activity, active, className = "item-btn", options = {}) {
  const metaLabel = activityMetaLabel(activity);
  const completed = !isAssignment(activity) && isLessonCompleted(activity.id);
  const displayTitle = getActivityDisplayTitle(activity);
  const status = bucket === "assignments" && !isQuizLibraryItem(activity) ? getActivityConversionStatus(activity) : "";
  const statusLabel = conversionStatusLabel(status);
  const statusClass = conversionStatusClass(status);
  const isLocked = Boolean(options.locked);
  const lockMeta = options.lockReason ? `<div class="item-meta lock-note">${escapeHtml(options.lockReason)}</div>` : "";
  return `
    <button
      class="${className} ${active ? "active" : ""} ${isLocked ? "is-locked" : ""}"
      type="button"
      data-select-activity="${escapeHtml(activity.id)}"
      data-module-id="${escapeHtml(moduleId)}"
      data-bucket="${escapeHtml(bucket)}"
      ${isLocked ? "disabled" : ""}
    >
      <div class="item-row">
        <div class="item-title">
          <span class="item-title-text">${escapeHtml(displayTitle)}</span>
          ${statusLabel ? `<span class="item-status-pill ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>` : ""}
        </div>
        ${completed ? `<span class="item-complete">Completed</span>` : ""}
      </div>
      ${metaLabel ? `<div class="item-meta">${escapeHtml(metaLabel)}</div>` : ""}
      ${lockMeta}
    </button>
  `;
}

function isQuizLibraryItem(activity) {
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  if (resourceKind === "quiz") {
    return true;
  }

  const title = String(activity?.title || "");
  if (/\bquiz\b/i.test(title)) {
    return true;
  }

  const delivery = getAssessmentDelivery(activity);
  return isQuizDeliveryActivity(activity, delivery);
}

function getSidebarLibraryCollections() {
  const quizModules = [];
  const assignmentModules = [];

  courseShellData.modules.forEach((module) => {
    const buckets = getModuleBuckets(module);
    const assignmentItems = buckets.assignments || [];
    if (!assignmentItems.length) {
      return;
    }

    const quizItems = assignmentItems.filter((activity) => isQuizLibraryItem(activity));
    const nonQuizAssignments = assignmentItems.filter((activity) => !isQuizLibraryItem(activity));
    const completion = moduleCompletion(module);

    if (quizItems.length) {
      quizModules.push({ module, items: quizItems, quizzesUnlocked: completion.isUnlocked });
    }

    if (nonQuizAssignments.length) {
      assignmentModules.push({ module, items: nonQuizAssignments });
    }
  });

  return { quizModules, assignmentModules };
}

function renderSidebarLibraryModuleBlock(collectionTitle, rows, selectedModuleId = "", selectedActivityId = "") {
  if (!rows.length) {
    return `<div class="library-empty">No ${escapeHtml(collectionTitle.toLowerCase())} found yet.</div>`;
  }

  const blocks = rows
    .map(({ module, items, quizzesUnlocked }) => {
      const moduleLabel = escapeHtml(module?.title || "Module");
      const isLocked = collectionTitle.toLowerCase() === "quizzes" ? !quizzesUnlocked : false;
      const itemButtons = items
        .map((activity) =>
          renderActivityListItem(
            module.id,
            "assignments",
            activity,
            module.id === selectedModuleId && activity.id === selectedActivityId,
            "library-item-btn",
            isLocked ? { locked: true, lockReason: "Complete module content to unlock quizzes." } : {}
          )
        )
        .join("");

      return `
        <section class="library-module-block">
          <div class="library-module-head">
            <h4>${moduleLabel}</h4>
            ${
              collectionTitle.toLowerCase() === "quizzes"
                ? `<span class="library-lock-pill ${quizzesUnlocked ? "unlocked" : "locked"}">${quizzesUnlocked ? "Unlocked" : "Locked"}</span>`
                : ""
            }
          </div>
          <div class="library-module-items">${itemButtons}</div>
          ${
            isLocked
              ? `<p class="library-lock-note">Complete all content lessons in this module to unlock quizzes.</p>`
              : ""
          }
        </section>
      `;
    })
    .join("");

  return `
    <section class="library-section">
      <h3>${escapeHtml(collectionTitle)}</h3>
      ${blocks}
    </section>
  `;
}

function renderReader(activity, moduleId) {
  if (!activity) {
    return `<div class="empty">Select a content item from the active module.</div>`;
  }

  const isHtmlReader = activity.resourceKind === "html" && activity.sourceHref;
  const displayTitle = getActivityDisplayTitle(activity);

  return `
    <section class="panel">
      <div class="reader-card">
        ${
          isHtmlReader
            ? ""
            : `
        <header class="reader-head">
          <div class="reader-heading">
            <div class="reader-eyebrow">${escapeHtml(prettyKind(activity.kind))}</div>
            <h4>${escapeHtml(displayTitle)}</h4>
          </div>
          <div class="reader-meta">
            ${escapeHtml(prettyKind(activity.resourceKind || "other"))}
          </div>
        </header>
        `
        }
        <div class="reader-content ${isHtmlReader ? "html-reader-content" : ""}">
          ${renderActivityBody(activity)}
          ${renderLessonCompletionFooter(activity, moduleId)}
        </div>
      </div>
    </section>
  `;
}

function render() {
  const module = getSelectedModule();
  const moduleView = module ? getModuleView(module.id) : "content";
  const buckets = module ? getModuleBuckets(module) : { content: [], assignments: [] };
  const activeBucket = moduleView === "assignments" ? "assignments" : "content";
  const unlockedContent = module ? buildUnlockedContentActivities(buckets.content) : [];
  const moduleQuizzesUnlocked = module ? moduleCompletion(module).isUnlocked : false;
  const moduleReaderItems = activeBucket === "assignments"
    ? (moduleQuizzesUnlocked ? buckets.assignments : [])
    : unlockedContent;
  const selectedActivity = module ? getSelectedActivity(module.id, activeBucket, moduleReaderItems) : null;
  const moduleCount = Array.isArray(courseShellData.modules) ? courseShellData.modules.length : 0;
  const contentCount = courseShellData.modules.reduce(
    (sum, current) => sum + getModuleBuckets(current).content.length,
    0
  );
  const quizCount = courseShellData.modules.reduce(
    (sum, current) => sum + getModuleBuckets(current).assignments.filter((activity) => isQuizLibraryItem(activity)).length,
    0
  );
  const moduleCode = String(module?.overline || "MOD 01").replace(/module\s*/i, "MOD ").toUpperCase();
  const themeMode = normalizeThemeMode(state.themeMode);
  const sidebarVisible = isSidebarVisible();
  const appClassNames = [
    "app",
    state.sidebarHidden ? "sidebar-hidden" : "",
    compactSidebarOpen ? "compact-sidebar-open" : "",
    themeMode === "next-step" ? "next-step-theme" : ""
  ].filter(Boolean).join(" ");

  root.innerHTML = `
    <div class="${appClassNames}" data-course-theme="${escapeHtml(themeMode)}">
      <aside class="sidebar" aria-hidden="${sidebarVisible ? "false" : "true"}">
        <div class="brand">
          <div class="brand-head">
            <h1>General Psychology 20</h1>
            <button
              class="sidebar-close"
              type="button"
              data-close-sidebar
              aria-label="Hide module sidebar"
              title="Hide module sidebar"
            >
              <span></span><span></span>
            </button>
          </div>
          <p class="brand-note">Select a module, then open one lesson or assignment at a time in the reading pane.</p>
        </div>

        <nav class="side-nav-ghost" aria-label="Workspace sections">
          <button type="button" class="side-nav-item ${state.sidebarLibraryView === "modules" ? "active" : ""}" data-library-view="modules">Modules</button>
          <button type="button" class="side-nav-item ${state.sidebarLibraryView === "quizzes" ? "active" : ""}" data-library-view="quizzes">Quizzes</button>
        </nav>

        ${
          state.sidebarLibraryView !== "modules"
            ? (() => {
                const collections = getSidebarLibraryCollections();
                return `
                  <div class="library-list" data-testid="quiz-library">
                    ${renderSidebarLibraryModuleBlock("Quizzes", collections.quizModules, module?.id || "", selectedActivity?.id || "")}
                  </div>
                `;
              })()
            : `
              <div class="module-list" data-testid="module-list">
                ${courseShellData.modules
                  .map((item) => renderModuleButton(item, item.id === state.expandedModuleId, item.id === module?.id))
                  .join("")}
              </div>
            `
        }
      </aside>
      <button
        class="sidebar-scrim"
        type="button"
        data-close-sidebar
        aria-label="Hide module sidebar"
        tabindex="-1"
      ></button>

      <section class="main">
        <header class="topbar">
          <div class="topbar-inner">
            <div class="topbar-main">
              <button
                class="sidebar-toggle"
                type="button"
                data-toggle-sidebar
                aria-label="Toggle module sidebar"
                aria-expanded="${sidebarVisible ? "true" : "false"}"
                title="Toggle module sidebar"
              >
                <span></span><span></span><span></span>
              </button>
              <div class="topbar-copy">
                <div class="topbar-kicker">General Psychology / ${escapeHtml(moduleCode)} / Course module</div>
                <h2>${escapeHtml(module?.title || "Course")}</h2>
              </div>
            </div>
            <div class="topbar-actions">
              <div class="theme-toggle" role="group" aria-label="Course theme">
                <button
                  type="button"
                  class="theme-toggle-button ${themeMode === "current" ? "active" : ""}"
                  data-theme-toggle="current"
                  aria-pressed="${themeMode === "current" ? "true" : "false"}"
                >Current</button>
                <button
                  type="button"
                  class="theme-toggle-button ${themeMode === "next-step" ? "active" : ""}"
                  data-theme-toggle="next-step"
                  aria-pressed="${themeMode === "next-step" ? "true" : "false"}"
                >Next Step</button>
              </div>
              <div class="stats">
                <span class="stat"><strong>${moduleCount}</strong><span> modules</span></span>
                <span class="stat"><strong>${contentCount}</strong><span> content items</span></span>
                <span class="stat"><strong>${quizCount}</strong><span> quizzes</span></span>
              </div>
            </div>
          </div>
        </header>

        <div class="content">
          ${renderReader(selectedActivity, module?.id || "")}
        </div>
      </section>
    </div>
  `;

  root.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => setSelectedModule(button.getAttribute("data-module") || ""));
  });

  root.querySelectorAll("[data-select-activity]").forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.getAttribute("data-module-id") || "";
      const bucket = button.getAttribute("data-bucket") || "content";
      const activityId = button.getAttribute("data-select-activity") || "";
      setSelectedActivity(moduleId, bucket, activityId);
    });
  });

  root.querySelectorAll("[data-toggle-sidebar]").forEach((button) => {
    button.addEventListener("click", () => toggleSidebar());
  });

  root.querySelectorAll("[data-close-sidebar]").forEach((button) => {
    button.addEventListener("click", () => closeSidebar());
  });

  root.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.addEventListener("click", () => setThemeMode(button.getAttribute("data-theme-toggle") || DEFAULT_THEME_MODE));
  });

  root.querySelectorAll("[data-library-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-library-view") || "modules";
      setSidebarLibraryView(view);
    });
  });

  root.querySelectorAll("[data-toggle-section]").forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.getAttribute("data-module-id") || "";
      const sectionKey = button.getAttribute("data-section-key") || "";
      toggleSectionCollapsed(moduleId, sectionKey);
    });
  });

  root.querySelectorAll("[data-module-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const moduleId = button.getAttribute("data-module-view") || "";
      const view = button.getAttribute("data-view") || "content";
      setModuleView(moduleId, view);
    });
  });

  root.querySelectorAll("[data-complete-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-complete-lesson") || "";
      const completed = button.getAttribute("data-completed") === "true";
      setLessonCompleted(activityId, !completed);
    });
  });

  root.querySelectorAll("[data-complete-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-complete-next") || "";
      const moduleId = button.getAttribute("data-module-id") || "";
      completeAndAdvanceLesson(moduleId, activityId);
    });
  });

  root.querySelectorAll("[data-quiz-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-question") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const questionIndex = Number(button.getAttribute("data-question-index") || 0);
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => ({
        ...draft,
        questionIndex
      }));
    });
  });

  root.querySelectorAll("[data-quiz-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-choice") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const questionId = button.getAttribute("data-question-id") || "";
      const choiceIndex = Number(button.getAttribute("data-choice-index") || 0);
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => ({
        ...draft,
        answersByQuestion: {
          ...draft.answersByQuestion,
          [questionId]: choiceIndex
        },
        revealedByQuestion: {
          ...draft.revealedByQuestion,
          [questionId]: false
        }
      }));
    });
  });

  root.querySelectorAll("[data-quiz-generate]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-generate") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const questions = quizData?.quizQuestions || [];
      const revealedByQuestion = Object.fromEntries(questions.map((question) => [question.id, true]));
      updateQuizDraft(activityId, questions.length, (draft) => ({
        ...draft,
        revealedByQuestion,
        resultsVisible: true,
        resultsGeneratedAt: new Date().toLocaleString()
      }));
    });
  });

  root.querySelectorAll("[data-quiz-check-all]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-check-all") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const questions = quizData?.quizQuestions || [];
      const revealedByQuestion = Object.fromEntries(questions.map((question) => [question.id, true]));
      updateQuizDraft(activityId, questions.length, (draft) => ({
        ...draft,
        revealedByQuestion,
        resultsVisible: true,
        resultsGeneratedAt: draft.resultsGeneratedAt || new Date().toLocaleString()
      }));
    });
  });

  root.querySelectorAll("[data-quiz-check]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-check") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const draft = getQuizDraft(activityId, quizData?.quizQuestions?.length || 0);
      const question = quizData?.quizQuestions?.[draft.questionIndex];
      if (!question) {
        return;
      }
      updateQuizDraft(activityId, quizData.quizQuestions.length, (currentDraft) => ({
        ...currentDraft,
        revealedByQuestion: {
          ...currentDraft.revealedByQuestion,
          [question.id]: true
        }
      }));
    });
  });

  root.querySelectorAll("[data-quiz-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-clear") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      const questionId = button.getAttribute("data-question-id") || "";
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => {
        const answersByQuestion = { ...draft.answersByQuestion };
        const revealedByQuestion = { ...draft.revealedByQuestion };
        delete answersByQuestion[questionId];
        delete revealedByQuestion[questionId];
        return {
          ...draft,
          answersByQuestion,
          revealedByQuestion
        };
      });
    });
  });

  root.querySelectorAll("[data-quiz-retake]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-retake") || "";
      setQuizDraft(activityId, {
        questionIndex: 0,
        answersByQuestion: {},
        revealedByQuestion: {},
        resultsVisible: false,
        resultsGeneratedAt: ""
      });
    });
  });

  root.querySelectorAll("[data-quiz-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-next") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => ({
        ...draft,
        questionIndex: Math.min(
          draft.questionIndex + 1,
          Math.max(0, (quizData?.quizQuestions?.length || 1) - 1)
        )
      }));
    });
  });

  bindEmbeddedFrames();
  bindImageFallbacks();
  bindVideoFallbacks();
}

function injectStyles() {
  if (document.getElementById("ep-shell-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "ep-shell-style";
  style.textContent = `
    :root {
      --bg: #131314;
      --bg-elevated: #171719;
      --bg-sidebar: #171719;
      --bg-subtle: #222225;
      --surface-3: #2d2d31;
      --paper: #f5f0e8;
      --paper-alt: #fbf7f0;
      --paper-line: #d2c3b1;
      --paper-soft: #e9dece;
      --paper-shadow: 0 12px 26px rgba(16, 14, 12, 0.14);
      --text: #e5e2e3;
      --text-strong: #fff4f1;
      --text-body: #2f2a24;
      --muted: #b7acaa;
      --muted-strong: #d9c1be;
      --accent: #ffb4a9;
      --accent-soft: #ffb4a9;
      --line: #2f2f33;
      --line-strong: #7e3b32;
      --focus: rgba(255, 180, 169, 0.45);
      --shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
      --status-good-bg: #1d3a31;
      --status-good-border: #3f8a6b;
      --status-good-text: #b7ead3;
      --status-warn-bg: #3c2522;
      --status-warn-border: #9f5b56;
      --status-warn-text: #f1c2be;
      --status-pending-bg: #352e25;
      --status-pending-border: #8b7c63;
      --status-pending-text: #ead9b5;
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background: radial-gradient(circle at 20% 0%, #202125 0%, #131314 38%, #101012 100%);
      color: var(--text);
      font-family: "Inter", "Segoe UI", sans-serif;
    }

    body {
      line-height: 1.45;
    }

    .app {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 264px minmax(0, 1fr);
      transition: grid-template-columns 0.16s ease;
    }

    .app.sidebar-hidden {
      grid-template-columns: 0 minmax(0, 1fr);
    }

    .sidebar {
      border-right: 1px solid var(--line);
      background: linear-gradient(180deg, #1a1a1d 0%, #141416 100%);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 264px;
      overflow: hidden;
      transition: width 0.16s ease, opacity 0.16s ease, border-color 0.16s ease;
    }

    .app.sidebar-hidden .sidebar {
      width: 0;
      opacity: 0;
      pointer-events: none;
      border-right-color: transparent;
    }

    .brand {
      padding: 1rem 0.95rem 0.9rem;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, rgba(255, 180, 169, 0.08) 0%, rgba(255, 180, 169, 0) 100%);
    }

    .brand-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .brand h1 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.35;
      font-weight: 700;
      color: var(--text-strong);
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .brand-note {
      margin: 0.5rem 0 0;
      font-size: 0.76rem;
      line-height: 1.45;
      color: var(--muted);
      max-width: 28ch;
    }

    .sidebar-close {
      display: none;
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 4px;
      border: 1px solid var(--line);
      background: #242325;
      color: var(--text);
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex: 0 0 auto;
      position: relative;
    }

    .sidebar-close span {
      position: absolute;
      width: 0.92rem;
      height: 2px;
      border-radius: 2px;
      background: var(--text-strong);
    }

    .sidebar-close span:first-child {
      transform: rotate(45deg);
    }

    .sidebar-close span:last-child {
      transform: rotate(-45deg);
    }

    .sidebar-scrim {
      display: none;
    }

    .side-nav-ghost {
      margin: 0.7rem 0.65rem 0.55rem;
      display: grid;
      gap: 0.26rem;
      border-bottom: 1px solid var(--line);
      padding-bottom: 0.62rem;
    }

    .side-nav-item {
      border: 1px solid #323238;
      border-radius: 3px;
      background: #1c1c20;
      color: #9e9ba1;
      text-align: left;
      padding: 0.42rem 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.65rem;
      font-weight: 700;
      font-family: "Space Grotesk", "Inter", sans-serif;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .side-nav-item:hover {
      border-color: #534c50;
      color: #cec3c1;
      background: #232329;
    }

    .side-nav-item.active {
      background: rgba(126, 59, 50, 0.32);
      border-color: rgba(255, 180, 169, 0.2);
      color: #ffb4a9;
    }

    .module-list,
    .library-list {
      padding: 0.65rem;
      overflow: auto;
      min-height: 0;
      flex: 1 1 auto;
      display: grid;
      gap: 0.38rem;
      align-content: start;
    }

    .library-list {
      gap: 0.74rem;
    }

    .library-section {
      display: grid;
      gap: 0.42rem;
    }

    .library-section h3 {
      margin: 0;
      font-size: 0.68rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #f0c0b8;
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .library-module-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .library-lock-pill {
      border: 1px solid #4f4a44;
      border-radius: 999px;
      padding: 0.1rem 0.42rem;
      font-size: 0.56rem;
      line-height: 1.25;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #b8b2a8;
      background: #252424;
      font-family: "Space Grotesk", "Inter", sans-serif;
      font-weight: 700;
    }

    .library-lock-pill.unlocked {
      border-color: rgba(16, 185, 129, 0.35);
      background: rgba(16, 185, 129, 0.14);
      color: #bbf7d0;
    }

    .library-lock-note {
      margin: 0.2rem 0 0;
      font-size: 0.64rem;
      line-height: 1.38;
      color: var(--muted);
    }

    .library-module-block {
      border: 1px solid #2f2f34;
      border-radius: 5px;
      background: #1a1a1f;
      padding: 0.46rem;
      display: grid;
      gap: 0.34rem;
    }

    .library-module-block h4 {
      margin: 0;
      font-size: 0.7rem;
      line-height: 1.35;
      color: var(--muted-strong);
      font-family: "Space Grotesk", "Inter", sans-serif;
      font-weight: 700;
    }

    .library-module-items {
      display: grid;
      gap: 0.32rem;
    }

    .library-empty {
      border: 1px dashed #454048;
      border-radius: 4px;
      background: #1a1a1f;
      color: #9f9494;
      padding: 0.55rem;
      font-size: 0.74rem;
      text-align: center;
    }

    .module-card {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg-elevated);
      overflow: hidden;
      box-shadow: inset 0 0 0 1px rgba(255, 180, 169, 0.03);
    }

    .module-card.expanded {
      border-color: var(--line-strong);
      background: #201b1b;
    }

    .module-card.selected:not(.expanded) {
      border-color: #645855;
    }

    .module-btn {
      width: 100%;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text);
      text-align: left;
      padding: 0.62rem;
      cursor: pointer;
      transition: background 0.16s ease, color 0.16s ease;
    }

    .module-btn:hover {
      background: #252528;
    }

    .module-btn.expanded,
    .module-btn.selected {
      background: transparent;
    }

    .module-kicker {
      margin: 0 0 0.22rem;
      font-size: 0.68rem;
      line-height: 1.35;
      color: var(--accent-soft);
      font-family: "Space Grotesk", "Inter", sans-serif;
      letter-spacing: 0.02em;
    }

    .module-btn h3 {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.4;
      font-weight: 700;
      color: var(--text-strong);
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .module-btn p {
      margin: 0.3rem 0 0;
      font-size: 0.73rem;
      line-height: 1.4;
      color: var(--muted);
    }

    .meta-row {
      margin-top: 0.42rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.3rem;
    }

    .meta-chip {
      font-size: 0.67rem;
      line-height: 1.2;
      border: 1px solid var(--line);
      color: var(--muted-strong);
      padding: 0.18rem 0.42rem;
      font-weight: 600;
      border-radius: 4px;
      background: #202024;
      white-space: nowrap;
    }

    .module-progress-block {
      margin-top: 0.62rem;
      display: grid;
      gap: 0.28rem;
    }

    .module-progress-meta,
    .module-progress-note {
      display: flex;
      justify-content: space-between;
      gap: 0.6rem;
      font-size: 0.68rem;
      line-height: 1.35;
      color: var(--muted);
    }

    .module-progress-track {
      height: 0.34rem;
      border-radius: 3px;
      background: #232328;
      overflow: hidden;
    }

    .module-progress-fill {
      height: 100%;
      border-radius: 0;
      background: var(--accent);
    }

    .module-dropdown {
      border-top: 1px solid var(--line);
      padding: 0.58rem;
      display: grid;
      gap: 0.46rem;
      max-height: none;
      overflow: visible;
      background: #151517;
    }

    .group-block {
      display: grid;
      gap: 0.36rem;
    }

    .module-view-switcher {
      display: flex;
      gap: 0.42rem;
      margin-bottom: 0.1rem;
    }

    .module-view-btn {
      border: 1px solid var(--line);
      border-radius: 4px;
      background: #1f1f22;
      color: var(--muted-strong);
      padding: 0.42rem 0.62rem;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      font-family: "Space Grotesk", "Inter", sans-serif;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .module-view-btn:hover {
      border-color: #6a5a53;
      background: #28282c;
      color: var(--text-strong);
    }

    .module-view-btn.active {
      border-color: var(--line-strong);
      background: #3a2724;
      color: var(--text-strong);
    }

    .module-view-btn:disabled {
      cursor: not-allowed;
      opacity: 0.55;
      color: var(--muted);
    }

    .release-condition-card {
      border: 1px dashed #544340;
      border-radius: 4px;
      background: #1f1b1f;
      padding: 0.72rem;
      display: grid;
      gap: 0.26rem;
    }

    .release-condition-card strong {
      font-size: 0.76rem;
      color: var(--text-strong);
    }

    .release-condition-card span {
      font-size: 0.72rem;
      line-height: 1.5;
      color: var(--muted);
    }

    .subgroup {
      display: grid;
      gap: 0.32rem;
    }

    .subgroup + .subgroup {
      border-top: 1px solid #2f2f31;
      margin-top: 0.18rem;
      padding-top: 0.42rem;
    }

    .subgroup.collapsed .subgroup-items {
      display: none;
    }

    .subgroup-toggle {
      border: 0;
      background: transparent;
      color: var(--text);
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.36rem;
      padding: 0;
      text-align: left;
      cursor: pointer;
    }

    .subgroup-toggle:hover .subgroup-label {
      color: var(--text-strong);
    }

    .subgroup-caret {
      width: 0.85rem;
      font-size: 0.74rem;
      color: var(--muted);
      flex-shrink: 0;
      line-height: 1;
      transform: translateY(-1px);
    }

    .subgroup-items {
      display: grid;
      gap: 0.34rem;
    }

    .subgroup-label {
      margin-top: 0.02rem;
      font-size: 0.72rem;
      color: var(--accent-soft);
      font-weight: 600;
      line-height: 1.35;
    }

    .subgroup-label.muted {
      color: var(--muted);
    }

    .group-label {
      margin-top: 0.04rem;
      font-size: 0.72rem;
      line-height: 1.35;
      color: var(--muted-strong);
      font-weight: 700;
    }

    .module-item-btn {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg-subtle);
      color: var(--text);
      text-align: left;
      padding: 0.54rem 0.58rem;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease;
    }

    .module-item-btn:hover {
      border-color: #5a5555;
      background: #2c2c31;
    }

    .module-item-btn.active {
      border-color: var(--line-strong);
      background: #392725;
    }

    .module-item-btn.is-locked,
    .library-item-btn.is-locked {
      opacity: 0.48;
      cursor: not-allowed;
      border-color: #3a3840;
      background: #25252b;
    }

    .library-item-btn {
      border: 1px solid #3a3840;
      border-radius: 5px;
      background: #25252b;
      color: #e7e2e1;
      text-align: left;
      padding: 0.5rem 0.55rem;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease;
    }

    .library-item-btn .item-title {
      font-size: 0.73rem;
      line-height: 1.34;
    }

    .library-item-btn .item-meta {
      font-size: 0.65rem;
      margin-top: 0.14rem;
    }

    .library-item-btn:hover {
      border-color: #59535c;
      background: #303039;
    }

    .library-item-btn.active {
      border-color: var(--line-strong);
      background: #3a2724;
    }

    .module-btn:focus-visible,
    .module-item-btn:focus-visible,
    .subgroup-toggle:focus-visible,
    .sidebar-toggle:focus-visible,
    .sidebar-close:focus-visible,
    .theme-toggle-button:focus-visible,
    .quiz-nav-btn:focus-visible,
    .quiz-choice:focus-visible,
    .quiz-action:focus-visible,
    .assignment-link:focus-visible,
    .lesson-next-btn:focus-visible {
      outline: 2px solid var(--focus);
      outline-offset: 2px;
    }

    .compact-empty {
      padding: 0.45rem;
      font-size: 0.72rem;
    }

    .main {
      min-width: 0;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .topbar {
      z-index: 8;
      border-bottom: 1px solid var(--line);
      background: linear-gradient(180deg, #17171a 0%, #111114 100%);
    }

    .topbar-inner {
      padding: 0.9rem 1rem;
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .topbar-main {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      min-width: 0;
    }

    .sidebar-toggle {
      width: 2rem;
      height: 2rem;
      border-radius: 4px;
      border: 1px solid var(--line);
      background: #242325;
      color: var(--text);
      display: inline-flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.22rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    .sidebar-toggle:hover {
      border-color: #6b5c59;
      background: #302e31;
    }

    .sidebar-close:hover {
      border-color: #6b5c59;
      background: #302e31;
    }

    .sidebar-toggle span {
      display: block;
      width: 0.95rem;
      height: 2px;
      border-radius: 2px;
      background: var(--text-strong);
    }

    .topbar-copy {
      min-width: 0;
    }

    .topbar-kicker {
      font-size: 0.78rem;
      line-height: 1.35;
      color: var(--accent-soft);
      font-family: "Space Grotesk", "Inter", sans-serif;
      letter-spacing: 0.02em;
    }

    .topbar h2 {
      margin: 0.12rem 0 0;
      font-size: clamp(1.05rem, 2vw, 1.35rem);
      line-height: 1.3;
      font-weight: 700;
      color: var(--text-strong);
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.55rem;
      flex-wrap: wrap;
      min-width: min(100%, 32rem);
    }

    .theme-toggle {
      display: inline-flex;
      align-items: stretch;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: #1a1a1d;
      overflow: hidden;
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .theme-toggle-button {
      border: 0;
      border-right: 1px solid var(--line);
      background: transparent;
      color: var(--muted-strong);
      min-height: 2rem;
      padding: 0.34rem 0.58rem;
      font: inherit;
      font-size: 0.68rem;
      font-weight: 700;
      line-height: 1.2;
      cursor: pointer;
      transition: background 0.16s ease, color 0.16s ease;
    }

    .theme-toggle-button:last-child {
      border-right: 0;
    }

    .theme-toggle-button:hover {
      background: #242326;
      color: var(--text-strong);
    }

    .theme-toggle-button.active {
      background: var(--accent);
      color: #201311;
    }

    .stats {
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
    }

    .stat {
      border: 1px solid var(--line);
      border-radius: 4px;
      padding: 0.34rem 0.56rem;
      font-size: 0.73rem;
      font-weight: 600;
      color: var(--muted);
      background: #1a1a1d;
      white-space: nowrap;
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .stat strong {
      color: var(--text-strong);
      margin-right: 0.22rem;
    }

    .stat span {
      color: var(--muted-strong);
    }

    .content {
      padding: 1rem;
      background-image: radial-gradient(circle at 1px 1px, rgba(255, 180, 169, 0.09) 1px, transparent 0);
      background-size: 20px 20px;
      background-color: #101012;
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg-elevated);
      box-shadow: 0 0 0 1px rgba(255, 180, 169, 0.05), 0 14px 24px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    }

    .item-title {
      display: inline-flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.34rem;
      font-size: 0.8rem;
      line-height: 1.4;
      font-weight: 700;
      color: var(--text-strong);
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .item-title-text {
      display: inline;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      gap: 0.55rem;
      align-items: flex-start;
    }

    .item-meta {
      margin-top: 0.18rem;
      font-size: 0.69rem;
      color: var(--muted);
      font-weight: 500;
    }

    .item-meta.lock-note {
      margin-top: 0.24rem;
      font-size: 0.66rem;
      line-height: 1.34;
      font-weight: 500;
      color: #c8c1b8;
    }

    .item-complete {
      border: 1px solid #6c5a4c;
      border-radius: 4px;
      padding: 0.12rem 0.4rem;
      font-size: 0.62rem;
      line-height: 1.2;
      color: #e8dac9;
      background: #3a2f29;
      white-space: nowrap;
      flex-shrink: 0;
      margin-top: 0.02rem;
    }

    .item-status-pill {
      border-radius: 4px;
      padding: 0.1rem 0.42rem;
      font-size: 0.58rem;
      line-height: 1.25;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      white-space: nowrap;
      border: 1px solid transparent;
      font-weight: 700;
      flex-shrink: 0;
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .item-status-pill.converted {
      border-color: var(--status-good-border);
      background: var(--status-good-bg);
      color: var(--status-good-text);
    }

    .item-status-pill.needs {
      border-color: var(--status-warn-border);
      background: var(--status-warn-bg);
      color: var(--status-warn-text);
    }

    .item-status-pill.checking {
      border-color: var(--status-pending-border);
      background: var(--status-pending-bg);
      color: var(--status-pending-text);
    }

    .reader-card {
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    .reader-head {
      border-bottom: 1px solid var(--line);
      padding: 0.8rem 0.9rem;
      background: #17181c;
      display: flex;
      flex-wrap: wrap;
      gap: 0.55rem;
      align-items: center;
      justify-content: space-between;
    }

    .reader-heading {
      min-width: 0;
    }

    .reader-eyebrow {
      margin-bottom: 0.18rem;
      font-size: 0.76rem;
      line-height: 1.35;
      color: var(--accent-soft);
      font-family: "Space Grotesk", "Inter", sans-serif;
    }

    .reader-head h4 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.35;
      font-weight: 700;
      color: var(--text-strong);
    }

    .reader-meta {
      font-size: 0.75rem;
      line-height: 1.4;
      color: var(--muted);
      align-self: flex-start;
    }

    .reader-content {
      padding: 0.9rem;
      overflow: visible;
      max-height: none;
      background: linear-gradient(180deg, rgba(255, 180, 169, 0.03) 0%, rgba(255, 180, 169, 0) 30%);
    }

    .html-reader-content {
      padding-top: 1rem;
    }

    .reader-html,
    .reader-text,
    .reader-document,
    .assignment-handoff,
    .quiz-shell {
      background: linear-gradient(180deg, var(--paper) 0%, var(--paper-alt) 100%);
      border: 1px solid var(--paper-line);
      border-radius: 6px;
      color: var(--text-body);
      padding: 1.1rem 1.15rem;
      max-width: 920px;
      margin: 0 auto;
      box-shadow: var(--paper-shadow);
    }

    .reader-html h1,
    .reader-text h4 {
      margin: 0 0 1rem;
      color: #28221d;
      font-size: clamp(1.35rem, 2vw, 1.8rem);
      line-height: 1.25;
      font-weight: 700;
    }

    .reader-html h2 {
      margin: 1.5rem 0 0.8rem;
      color: #6a3f34;
      font-size: clamp(1.15rem, 1.7vw, 1.45rem);
      line-height: 1.25;
      font-weight: 700;
      padding-top: 0.15rem;
      border-top: 1px solid var(--paper-soft);
    }

    .reader-html h3 {
      margin: 1.1rem 0 0.6rem;
      color: #4b382f;
      font-size: 1.02rem;
      line-height: 1.3;
      font-weight: 700;
    }

    .reader-html h2:first-child,
    .reader-html h3:first-child,
    .reader-html h1:first-child,
    .reader-text h4:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: 0;
    }

    .reader-html p,
    .reader-text p {
      margin: 0 0 0.95rem;
      font-size: 0.99rem;
      line-height: 1.7;
      color: #433b33;
    }

    .reader-html a {
      color: #7a4739;
      text-decoration-thickness: 1px;
      text-underline-offset: 0.12em;
    }

    .reader-html a:hover {
      color: #5f352c;
    }

    .reader-html ul,
    .reader-html ol,
    .reader-text ul,
    .reader-text ol {
      margin: 0 0 0.95rem;
      padding-left: 1.35rem;
      color: #433b33;
    }

    .reader-html li + li,
    .reader-text li + li {
      margin-top: 0.45rem;
    }

    .reader-html table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0 1.2rem;
      font-size: 0.94rem;
      color: #433b33;
    }

    .reader-html th,
    .reader-html td {
      border: 1px solid #d2c6b6;
      padding: 0.7rem 0.8rem;
      text-align: left;
      vertical-align: top;
    }

    .reader-html th {
      background: #efe6d8;
      color: #4b382f;
      font-weight: 700;
    }

    .reader-html blockquote {
      margin: 1rem 0;
      padding: 0.25rem 0 0.25rem 1rem;
      border-left: 3px solid #caa692;
      color: #5a4a3f;
    }

    .reader-html hr {
      border: 0;
      border-top: 1px solid #d7cebf;
      margin: 1.25rem 0;
    }

    .reader-html img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      margin: 0.9rem auto;
      border: 1px solid #cec3b2;
      background: #fff;
    }

    .lesson-video-embed {
      width: min(100%, 720px);
      margin: 0.9rem auto 1rem;
      border: 1px solid #cec3b2;
      border-radius: 8px;
      overflow: hidden;
      background: #111;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
    }

    .lesson-video-embed iframe {
      width: 100%;
      aspect-ratio: 16 / 9;
      border: 0;
      display: block;
    }

    .image-missing-note {
      margin: 0.8rem auto;
      max-width: 520px;
      border: 1px dashed #c8b9a5;
      border-radius: 4px;
      padding: 0.5rem 0.7rem;
      font-size: 0.8rem;
      color: #6f5d50;
      background: #f8f0e5;
      text-align: center;
    }

    .reader-html .card {
      margin: 0.8rem 0;
      border: 1px solid #d1c7b9;
      border-radius: 8px;
      background: #fff;
    }

    .reader-html .card-body {
      padding: 0.8rem;
    }

    .document-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 0.8rem;
    }

    .document-meta {
      font-size: 0.86rem;
      color: #66584d;
      font-weight: 600;
    }

    .document-link {
      color: #7a4739;
      font-size: 0.88rem;
      font-weight: 600;
      text-decoration: none;
    }

    .document-link:hover {
      color: #5f352c;
      text-decoration: underline;
    }

    .document-frame {
      width: 100%;
      min-height: 78vh;
      border: 1px solid #d1c7b9;
      border-radius: 6px;
      background: #efe7da;
      padding: 0.9rem;
      display: grid;
      gap: 1rem;
      align-content: start;
      overflow: auto;
    }

    .pdf-page {
      margin: 0 auto;
      width: min(100%, 920px);
      display: grid;
      gap: 0.45rem;
    }

    .pdf-page-label {
      font-size: 0.8rem;
      color: #7a6c5f;
      font-weight: 600;
    }

    .pdf-canvas {
      width: 100%;
      height: auto;
      display: block;
      background: #fff;
      border: 1px solid #d1c7b9;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(45, 32, 24, 0.08);
    }

    .document-fallback {
      display: grid;
      place-items: center;
      min-height: 16rem;
      padding: 1rem;
      text-align: center;
      color: #5c5148;
      gap: 0.75rem;
    }

    .document-fallback p {
      margin: 0;
    }

    .assignment-handoff {
      display: grid;
      gap: 1rem;
    }

    .assignment-embed-shell {
      display: grid;
      gap: 1rem;
      color: #f5ece3;
      background: linear-gradient(180deg, #1b1b1f 0%, #141419 100%);
      border: 1px solid #4a3b38;
      border-radius: 6px;
      padding: 1rem;
    }

    .assignment-embed-shell .assignment-handoff-label {
      color: #f0d8c4 !important;
    }

    .assignment-embed-shell .assignment-handoff-head h5 {
      color: #fff5ec !important;
    }

    .assignment-embed-shell .assignment-handoff-state {
      background: #3a2a21;
      border-color: #8f6a56;
      color: #fff0e2;
    }

    .assignment-embed-shell .assignment-handoff-summary,
    .assignment-embed-shell .assignment-handoff-footnote {
      color: #f1dfd0 !important;
    }

    .assignment-embed-shell .assignment-handoff-note {
      background: #2f231c;
      border-color: #6e5242;
    }

    .assignment-embed-shell .assignment-handoff-note strong {
      color: #fff0e2;
    }

    .assignment-embed-shell .assignment-handoff-note span {
      color: #f2dfd1;
    }

    .assignment-handoff-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
      padding-bottom: 0.95rem;
      border-bottom: 1px solid var(--paper-soft);
    }

    .assignment-handoff-label,
    .quiz-label {
      font-size: 0.76rem;
      line-height: 1.35;
      color: #7b5748;
      font-weight: 700;
    }

    .assignment-handoff-head h5,
    .quiz-toolbar-copy h5 {
      margin: 0.18rem 0 0;
      font-size: 1.22rem;
      line-height: 1.3;
      color: #28221d;
      font-weight: 700;
    }

    .assignment-handoff-state {
      border: 1px solid #d3c6b8;
      border-radius: 4px;
      padding: 0.34rem 0.55rem;
      background: #f8f2e8;
      color: #5d4b3f;
      font-size: 0.76rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .assignment-handoff-summary,
    .assignment-handoff-footnote {
      margin: 0;
      font-size: 0.98rem;
      line-height: 1.7;
      color: #433b33;
    }

    .assignment-handoff-note {
      border: 1px solid #d7ccbf;
      border-radius: 6px;
      background: #fbf7f0;
      padding: 0.9rem 0.95rem;
      display: grid;
      gap: 0.28rem;
    }

    .assignment-handoff-note strong {
      color: #3b2f28;
      font-size: 0.85rem;
    }

    .assignment-handoff-note span {
      color: #53473e;
      font-size: 0.92rem;
      line-height: 1.55;
    }

    .assignment-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.7rem;
    }

    .assignment-embed-frame-wrap {
      border: 1px solid #544340;
      border-radius: 6px;
      background: #111217;
      padding: 0.55rem;
      box-shadow: none;
    }

    .assignment-embed-frame {
      width: 100%;
      height: 1100px;
      min-height: 980px;
      border: 1px solid #353436;
      border-radius: 4px;
      background: #ffffff;
      display: block;
    }

    .assignment-link,
    .quiz-action,
    .quiz-nav-btn,
    .quiz-choice {
      border: 1px solid #bca594;
      border-radius: 4px;
      background: #fffdf8;
      color: #3c312a;
      text-decoration: none;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .assignment-link {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 2.5rem;
      padding: 0.58rem 0.82rem;
      font-size: 0.86rem;
      font-weight: 700;
    }

    .assignment-link:hover,
    .quiz-action:hover,
    .quiz-nav-btn:hover,
    .quiz-choice:hover {
      border-color: #b89c87;
      background: #fff8ee;
      color: #2d241f;
    }

    .assignment-link.primary,
    .quiz-action.primary {
      background: linear-gradient(135deg, #8a4338 0%, #7e3b32 100%);
      border-color: #8d4a3f;
      color: #ffdad5;
    }

    .assignment-link.primary:hover,
    .quiz-action.primary:hover {
      background: #6e332b;
      border-color: #6e332b;
      color: #ffdad5;
    }

    .assignment-link.secondary {
      background: #f7efe4;
    }

    .assignment-link-placeholder {
      min-height: 2.5rem;
      display: inline-flex;
      align-items: center;
      padding: 0.58rem 0.82rem;
      border: 1px dashed #c9b9a8;
      border-radius: 4px;
      color: #7a6a5d;
      background: #f9f4eb;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .quiz-shell {
      display: grid;
      gap: 0.95rem;
    }

    .quiz-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .quiz-stats {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
    }

    .quiz-stat {
      border: 1px solid #d3c7b8;
      border-radius: 4px;
      padding: 0.34rem 0.54rem;
      background: #f7f0e5;
      color: #5e4d42;
      font-size: 0.77rem;
      font-weight: 700;
    }

    .quiz-progress {
      height: 0.45rem;
      border-radius: 999px;
      background: #eadfce;
      overflow: hidden;
    }

    .quiz-progress-bar {
      height: 100%;
      background: #9a624d;
      border-radius: inherit;
    }

    .quiz-nav {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }

    .quiz-nav-btn {
      padding: 0.42rem 0.62rem;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
    }

    .quiz-nav-btn.active {
      background: #efe3d3;
      border-color: #b19179;
      color: #4a392f;
    }

    .quiz-card {
      display: grid;
      gap: 0.9rem;
      border: 1px solid #ded2c3;
      border-radius: 6px;
      background: #fffaf3;
      padding: 1rem;
    }

    .quiz-launch-shell .quiz-progress-bar {
      background: #7d493b;
    }

    .quiz-question {
      font-size: 1rem;
      line-height: 1.65;
      color: #312822;
      font-weight: 600;
    }

    .quiz-launch-note {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.62;
      color: #584b42;
    }

    .quiz-choices {
      display: grid;
      gap: 0.62rem;
    }

    .quiz-choice {
      width: 100%;
      padding: 0.78rem 0.85rem;
      text-align: left;
      font-size: 0.93rem;
      line-height: 1.55;
      cursor: pointer;
    }

    .quiz-choice.selected {
      border-color: #a87c67;
      background: #f3e8dc;
      color: #2f251f;
    }

    .quiz-actions {
      display: flex;
      gap: 0.6rem;
      flex-wrap: wrap;
    }

    .quiz-action {
      min-height: 2.5rem;
      padding: 0.56rem 0.82rem;
      font-size: 0.86rem;
      font-weight: 700;
      cursor: pointer;
    }

    .quiz-feedback {
      border-radius: 6px;
      padding: 0.85rem 0.95rem;
      display: grid;
      gap: 0.22rem;
      font-size: 0.9rem;
      line-height: 1.55;
    }

    .quiz-feedback.correct {
      border: 1px solid #b9ceb4;
      background: #edf4ea;
      color: #28412d;
    }

    .quiz-feedback.incorrect {
      border: 1px solid #dcb8ac;
      background: #f8ece8;
      color: #5a342a;
    }

    .quiz-detail-surface {
      display: block;
      max-width: 1040px;
      background: #ffffff;
      border-color: #d9dad9;
      color: #1a1c1a;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .quiz-detail-layout {
      display: grid;
      gap: 1.65rem;
    }

    .quiz-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1.25rem;
      padding-bottom: 1.35rem;
      border-bottom: 1px solid #d9dad9;
    }

    .quiz-copy {
      max-width: 44rem;
    }

    .quiz-eyebrow {
      margin: 0;
      font-size: 0.7rem;
      line-height: 1.35;
      font-weight: 800;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: #3f9f2e;
    }

    .quiz-page-title {
      margin: 0.65rem 0 0;
      font-size: 1.9rem;
      line-height: 1.15;
      font-weight: 800;
      color: #1a1c1a;
    }

    .quiz-meta-row {
      min-width: min(100%, 230px);
      display: grid;
      gap: 0.75rem;
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #f9f9f8;
      padding: 0.9rem;
    }

    .quiz-meta-block span {
      display: block;
      font-size: 0.7rem;
      line-height: 1.35;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: #3f9f2e;
    }

    .quiz-meta-block strong {
      display: block;
      margin-top: 0.18rem;
      color: #1a1c1a;
      font-size: 0.92rem;
    }

    .quiz-evaluation-panel {
      display: grid;
      gap: 1.25rem;
      align-items: center;
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #f9f9f8;
      padding: 1.25rem;
    }

    .quiz-evaluation-copy h5,
    .quiz-breakdown-title {
      margin: 0;
      font-size: 1.65rem;
      line-height: 1.2;
      font-weight: 800;
      color: #1a1c1a;
    }

    .quiz-evaluation-copy p {
      margin: 0.55rem 0 0;
      max-width: 38rem;
      color: #5f6660;
      font-size: 0.98rem;
      line-height: 1.7;
    }

    .quiz-evaluation-score {
      text-align: left;
    }

    .quiz-evaluation-score strong {
      display: block;
      color: #59A844;
      font-size: 3.75rem;
      line-height: 0.95;
      font-weight: 800;
    }

    .quiz-evaluation-score small {
      color: #1a1c1a;
      font-size: 0.55em;
    }

    .quiz-evaluation-status {
      display: block;
      margin-top: 0.5rem;
      color: #ba1a1a;
      font-size: 0.7rem;
      line-height: 1.35;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .quiz-actions-row {
      gap: 0.75rem;
    }

    .quiz-detail-surface .quiz-action {
      min-height: 2.875rem;
      border-radius: 8px;
      border-color: #d9dad9;
      background: #ffffff;
      color: #3c3f3e;
      padding: 0.7rem 1rem;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .quiz-detail-surface .quiz-action:hover:not(:disabled) {
      background: #eceeec;
      border-color: #c3c8c1;
      color: #1a1c1a;
    }

    .quiz-detail-surface .quiz-action.primary {
      border-color: #59A844;
      background: #59A844;
      color: #ffffff;
    }

    .quiz-detail-surface .quiz-action.primary:hover:not(:disabled) {
      border-color: #4b8d39;
      background: #4b8d39;
      color: #ffffff;
    }

    .quiz-detail-surface .quiz-action:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .quiz-back-link {
      margin-left: auto;
      border-color: transparent !important;
      background: transparent !important;
      color: #1a1c1a !important;
    }

    .quiz-breakdown-shell {
      border-top: 1px solid #d9dad9;
      padding-top: 0.2rem;
    }

    .quiz-section-breakdown,
    .quiz-question-list,
    .quiz-choices {
      display: grid;
      gap: 0.8rem;
    }

    .quiz-section-breakdown {
      margin-top: 0.9rem;
    }

    .quiz-breakdown-item {
      display: grid;
      gap: 0.5rem;
      width: 100%;
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #f3f4f3;
      padding: 1rem;
      color: #1a1c1a;
      text-align: left;
    }

    .quiz-breakdown-name {
      display: block;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .quiz-breakdown-range {
      display: block;
      margin-top: 0.18rem;
      color: #5f6660;
      font-size: 0.7rem;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .quiz-breakdown-score {
      color: #1a1c1a;
      font-size: 0.92rem;
      font-weight: 800;
    }

    .quiz-question-row {
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #ffffff;
      padding: 1.1rem;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    .quiz-question-grid {
      display: grid;
      gap: 1rem;
    }

    .quiz-question-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 8px;
      background: #eef6eb;
      color: #3f9f2e;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .quiz-detail-surface .quiz-question {
      margin: 0;
      color: #1a1c1a;
      font-size: 1rem;
      line-height: 1.7;
      font-weight: 800;
    }

    .quiz-detail-surface .quiz-choices {
      margin-top: 0.95rem;
    }

    .quiz-detail-surface .quiz-choice {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-height: 2.875rem;
      border-color: #d9dad9;
      border-radius: 8px;
      background: #ffffff;
      color: #414942;
      padding: 0.72rem 0.9rem;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .quiz-detail-surface .quiz-choice:hover:not(:disabled) {
      border-color: #c3c8c1;
      background: #f9f9f8;
      color: #1a1c1a;
    }

    .quiz-choice-letter {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: 1.25rem;
      height: 1.25rem;
      border: 1px solid #c3c8c1;
      border-radius: 50%;
      background: #ffffff;
      color: #3c3f3e;
      font-size: 0.66rem;
      font-weight: 800;
    }

    .quiz-detail-surface .quiz-choice.selected,
    .quiz-detail-surface .quiz-choice.correct {
      border-color: #59A844;
      background: #eef6eb;
      color: #1a1c1a;
    }

    .quiz-detail-surface .quiz-choice.incorrect {
      border-color: #ba1a1a;
      background: #fff1ee;
      color: #1a1c1a;
    }

    .quiz-choice.selected .quiz-choice-letter,
    .quiz-choice.correct .quiz-choice-letter,
    .quiz-choice.incorrect .quiz-choice-letter {
      border-color: #59A844;
      background: #59A844;
      color: #ffffff;
    }

    .quiz-choice.incorrect .quiz-choice-letter {
      border-color: #ba1a1a;
      background: #ba1a1a;
    }

    .quiz-detail-surface .quiz-feedback {
      margin-top: 0.95rem;
      border-radius: 8px;
      padding: 0.75rem 0.85rem;
      font-size: 0.88rem;
    }

    @media (min-width: 700px) {
      .quiz-evaluation-panel {
        grid-template-columns: minmax(0, 1fr) auto;
      }

      .quiz-evaluation-score {
        text-align: right;
      }

      .quiz-breakdown-item {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }

      .quiz-question-grid {
        grid-template-columns: auto minmax(0, 1fr);
      }
    }

    .lesson-completion-card {
      margin: 0.9rem auto 0;
      max-width: 860px;
      border: 1px solid #d8ccbe;
      border-radius: 6px;
      background: #fbf7f0;
      padding: 0.9rem 0.95rem;
      display: flex;
      justify-content: space-between;
      gap: 0.8rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .lesson-completion-card strong {
      display: block;
      color: #342a24;
      font-size: 0.9rem;
    }

    .lesson-completion-card span {
      display: block;
      margin-top: 0.18rem;
      color: #5b4d43;
      font-size: 0.84rem;
      line-height: 1.5;
      max-width: 44rem;
    }

    .lesson-completion-actions {
      display: flex;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .lesson-completion-btn {
      border: 1px solid #cbb9a6;
      border-radius: 4px;
      background: #fffdfa;
      color: #352a24;
      min-height: 2.45rem;
      padding: 0.52rem 0.82rem;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .lesson-completion-btn:hover {
      border-color: #b49983;
      background: #fff6ea;
    }

    .lesson-completion-btn.completed {
      border-color: #8f745f;
      background: #efe2d4;
      color: #2f251f;
    }

    .lesson-next-btn {
      border: 1px solid #8f745f;
      border-radius: 4px;
      background: #efe2d4;
      color: #2f251f;
      min-height: 2.45rem;
      padding: 0.52rem 0.82rem;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .lesson-next-btn:hover {
      border-color: #7a604d;
      background: #e8d7c5;
    }

    .loading {
      margin: 0;
      color: #66584d;
      font-size: 0.92rem;
      max-width: 860px;
      margin-inline: auto;
    }

    .empty {
      border: 1px dashed var(--line);
      border-radius: 6px;
      padding: 1.1rem;
      color: var(--muted);
      font-size: 0.82rem;
      text-align: center;
      background: #1c1a18;
    }

    .app.next-step-theme {
      --ns-surface: #f9f9f8;
      --ns-surface-lowest: #ffffff;
      --ns-surface-low: #f3f4f3;
      --ns-surface-container: #edeeed;
      --ns-surface-high: #e7e8e7;
      --ns-surface-highest: #e1e3e2;
      --ns-on-surface: #191c1c;
      --ns-on-surface-variant: #40493b;
      --ns-outline: #707a6a;
      --ns-outline-variant: #c0cab7;
      --ns-primary: #1e6d0d;
      --ns-primary-container: #59a844;
      --ns-primary-fixed: #a3f788;
      --ns-secondary-container: #fdbf3f;
      --ns-on-secondary-container: #6f4e00;
      --ns-inverse-surface: #2e3131;
      --bg: var(--ns-surface);
      --bg-elevated: var(--ns-surface-lowest);
      --bg-sidebar: var(--ns-inverse-surface);
      --bg-subtle: var(--ns-surface-low);
      --surface-3: var(--ns-surface-highest);
      --paper: var(--ns-surface-lowest);
      --paper-alt: var(--ns-surface);
      --paper-line: var(--ns-outline-variant);
      --paper-soft: var(--ns-surface-highest);
      --paper-shadow: 0 4px 20px rgba(77, 77, 77, 0.08);
      --text: var(--ns-on-surface);
      --text-strong: var(--ns-on-surface);
      --text-body: var(--ns-on-surface);
      --muted: var(--ns-on-surface-variant);
      --muted-strong: var(--ns-on-surface);
      --accent: var(--ns-primary);
      --accent-soft: var(--ns-primary);
      --line: var(--ns-outline-variant);
      --line-strong: var(--ns-primary);
      --focus: rgba(30, 109, 13, 0.28);
      --shadow: 0 4px 20px rgba(77, 77, 77, 0.08);
      --status-good-bg: #e8f6e3;
      --status-good-border: #59a844;
      --status-good-text: #1e6d0d;
      --status-warn-bg: #fff2d0;
      --status-warn-border: #fdbf3f;
      --status-warn-text: #6f4e00;
      --status-pending-bg: #edeeed;
      --status-pending-border: #c0cab7;
      --status-pending-text: #40493b;
      background: var(--ns-surface);
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .sidebar {
      background: var(--ns-inverse-surface);
      border-right-color: rgba(192, 202, 183, 0.28);
    }

    .app.next-step-theme .brand {
      background: transparent;
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .app.next-step-theme .brand h1,
    .app.next-step-theme .library-section h3,
    .app.next-step-theme .module-kicker,
    .app.next-step-theme .subgroup-label {
      color: var(--ns-primary-fixed);
    }

    .app.next-step-theme .brand-note,
    .app.next-step-theme .module-btn p,
    .app.next-step-theme .module-progress-meta,
    .app.next-step-theme .module-progress-note,
    .app.next-step-theme .library-lock-note,
    .app.next-step-theme .item-meta.lock-note {
      color: rgba(255, 255, 255, 0.68);
    }

    .app.next-step-theme .side-nav-ghost,
    .app.next-step-theme .module-dropdown,
    .app.next-step-theme .subgroup + .subgroup {
      border-color: rgba(255, 255, 255, 0.1);
    }

    .app.next-step-theme .side-nav-item,
    .app.next-step-theme .module-view-btn {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.74);
    }

    .app.next-step-theme .side-nav-item:hover,
    .app.next-step-theme .module-view-btn:hover {
      border-color: rgba(163, 247, 136, 0.32);
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .app.next-step-theme .side-nav-item.active,
    .app.next-step-theme .module-view-btn.active {
      border-color: var(--ns-primary-container);
      background: var(--ns-primary);
      color: #ffffff;
    }

    .app.next-step-theme .module-card,
    .app.next-step-theme .library-module-block {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      box-shadow: none;
    }

    .app.next-step-theme .module-card.expanded,
    .app.next-step-theme .module-card.selected:not(.expanded) {
      border-color: rgba(163, 247, 136, 0.36);
      background: rgba(255, 255, 255, 0.08);
    }

    .app.next-step-theme .module-btn h3,
    .app.next-step-theme .library-module-block h4,
    .app.next-step-theme .group-label,
    .app.next-step-theme .subgroup-toggle,
    .app.next-step-theme .item-title,
    .app.next-step-theme .library-item-btn {
      color: #ffffff;
    }

    .app.next-step-theme .module-btn:hover,
    .app.next-step-theme .module-btn.expanded,
    .app.next-step-theme .module-btn.selected {
      background: rgba(255, 255, 255, 0.05);
    }

    .app.next-step-theme .module-progress-track {
      background: rgba(255, 255, 255, 0.14);
    }

    .app.next-step-theme .module-progress-fill {
      background: var(--ns-primary-fixed);
    }

    .app.next-step-theme .meta-chip,
    .app.next-step-theme .library-lock-pill {
      border-color: rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.82);
    }

    .app.next-step-theme .library-lock-pill.unlocked {
      border-color: rgba(163, 247, 136, 0.44);
      background: rgba(163, 247, 136, 0.14);
      color: var(--ns-primary-fixed);
    }

    .app.next-step-theme .library-item-btn,
    .app.next-step-theme .module-item-btn {
      border-color: rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.06);
      color: #ffffff;
    }

    .app.next-step-theme .library-item-btn:hover,
    .app.next-step-theme .module-item-btn:hover {
      border-color: rgba(163, 247, 136, 0.34);
      background: rgba(255, 255, 255, 0.09);
    }

    .app.next-step-theme .library-item-btn.active,
    .app.next-step-theme .module-item-btn.active {
      border-color: var(--ns-primary-container);
      background: rgba(30, 109, 13, 0.42);
    }

    .app.next-step-theme .topbar {
      background: var(--ns-surface-lowest);
      border-bottom-color: var(--ns-surface-highest);
      box-shadow: 0 1px 0 rgba(192, 202, 183, 0.3);
    }

    .app.next-step-theme .sidebar-toggle,
    .app.next-step-theme .sidebar-close,
    .app.next-step-theme .theme-toggle,
    .app.next-step-theme .stat {
      border-color: var(--ns-outline-variant);
      background: var(--ns-surface-low);
      color: var(--ns-on-surface-variant);
    }

    .app.next-step-theme .sidebar-toggle:hover,
    .app.next-step-theme .sidebar-close:hover,
    .app.next-step-theme .theme-toggle-button:hover {
      border-color: var(--ns-outline);
      background: var(--ns-surface-container);
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .sidebar-toggle span {
      background: var(--ns-on-surface);
    }

    .app.next-step-theme .sidebar-close span {
      background: var(--ns-on-surface);
    }

    .app.next-step-theme .theme-toggle-button {
      border-color: var(--ns-outline-variant);
      color: var(--ns-on-surface-variant);
    }

    .app.next-step-theme .theme-toggle-button.active {
      background: var(--ns-primary);
      color: #ffffff;
    }

    .app.next-step-theme .topbar-kicker,
    .app.next-step-theme .stat strong,
    .app.next-step-theme .stat span {
      color: var(--ns-primary);
    }

    .app.next-step-theme .content {
      background-color: var(--ns-surface);
      background-image: repeating-linear-gradient(
        135deg,
        rgba(30, 109, 13, 0.025) 0,
        rgba(30, 109, 13, 0.025) 9px,
        transparent 9px,
        transparent 18px
      );
    }

    .app.next-step-theme .panel {
      border-color: rgba(192, 202, 183, 0.64);
      background: var(--ns-surface-lowest);
      box-shadow: 0 6px 24px rgba(77, 77, 77, 0.08);
    }

    .app.next-step-theme .reader-head {
      border-color: var(--ns-surface-highest);
      background: var(--ns-surface-low);
    }

    .app.next-step-theme .reader-eyebrow,
    .app.next-step-theme .reader-html h2,
    .app.next-step-theme .reader-html h3,
    .app.next-step-theme .assignment-handoff-label,
    .app.next-step-theme .quiz-label {
      color: var(--ns-primary);
    }

    .app.next-step-theme .reader-content {
      background: transparent;
    }

    .app.next-step-theme .reader-html,
    .app.next-step-theme .reader-text,
    .app.next-step-theme .reader-document,
    .app.next-step-theme .assignment-handoff,
    .app.next-step-theme .quiz-shell {
      background: var(--ns-surface-lowest);
      border-color: var(--ns-outline-variant);
      color: var(--ns-on-surface);
      box-shadow: var(--paper-shadow);
    }

    .app.next-step-theme .reader-html h1,
    .app.next-step-theme .reader-text h4,
    .app.next-step-theme .assignment-handoff-head h5,
    .app.next-step-theme .quiz-toolbar-copy h5 {
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .reader-html h2,
    .app.next-step-theme .assignment-handoff-head {
      border-color: var(--ns-surface-highest);
    }

    .app.next-step-theme .reader-html p,
    .app.next-step-theme .reader-text p,
    .app.next-step-theme .reader-html ul,
    .app.next-step-theme .reader-html ol,
    .app.next-step-theme .reader-text ul,
    .app.next-step-theme .reader-text ol,
    .app.next-step-theme .reader-html table,
    .app.next-step-theme .assignment-handoff-summary,
    .app.next-step-theme .assignment-handoff-footnote {
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .reader-html a,
    .app.next-step-theme .document-link {
      color: var(--ns-primary);
    }

    .app.next-step-theme .reader-html a:hover,
    .app.next-step-theme .document-link:hover {
      color: #164d0b;
    }

    .app.next-step-theme .reader-html th,
    .app.next-step-theme .assignment-handoff-state,
    .app.next-step-theme .assignment-handoff-note {
      background: var(--ns-surface-low);
      border-color: var(--ns-outline-variant);
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .reader-html td,
    .app.next-step-theme .reader-html th,
    .app.next-step-theme .document-frame,
    .app.next-step-theme .pdf-canvas,
    .app.next-step-theme .reader-html img,
    .app.next-step-theme .reader-html .card,
    .app.next-step-theme .lesson-video-embed {
      border-color: var(--ns-outline-variant);
    }

    .app.next-step-theme .document-frame {
      background: var(--ns-surface-low);
    }

    .app.next-step-theme .assignment-link,
    .app.next-step-theme .quiz-action,
    .app.next-step-theme .quiz-nav-btn,
    .app.next-step-theme .quiz-choice,
    .app.next-step-theme .lesson-next-btn {
      border-color: var(--ns-primary-container);
      background: var(--ns-surface-lowest);
      color: var(--ns-primary);
    }

    .app.next-step-theme .assignment-link:hover,
    .app.next-step-theme .quiz-action:hover,
    .app.next-step-theme .quiz-nav-btn:hover,
    .app.next-step-theme .quiz-choice:hover,
    .app.next-step-theme .lesson-next-btn:hover {
      background: #edf8e8;
      border-color: var(--ns-primary);
      color: var(--ns-primary);
    }

    .app.next-step-theme .quiz-choice.selected,
    .app.next-step-theme .lesson-next-btn {
      background: var(--ns-primary);
      color: #ffffff;
    }

    .app.next-step-theme .quiz-detail-surface {
      border-color: #d9dad9;
      background: #ffffff;
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-eyebrow,
    .app.next-step-theme .quiz-detail-surface .quiz-meta-block span,
    .app.next-step-theme .quiz-detail-surface .quiz-question-number {
      color: #3f9f2e;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-page-title,
    .app.next-step-theme .quiz-detail-surface .quiz-evaluation-copy h5,
    .app.next-step-theme .quiz-detail-surface .quiz-breakdown-title,
    .app.next-step-theme .quiz-detail-surface .quiz-question,
    .app.next-step-theme .quiz-detail-surface .quiz-breakdown-score {
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-meta-row,
    .app.next-step-theme .quiz-detail-surface .quiz-evaluation-panel {
      border-color: #d9dad9;
      background: #f9f9f8;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-evaluation-score strong {
      color: #59A844;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-evaluation-status {
      color: #ba1a1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-action {
      border-color: #d9dad9;
      background: #ffffff;
      color: #3c3f3e;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-action:hover:not(:disabled) {
      border-color: #c3c8c1;
      background: #eceeec;
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-action.primary {
      border-color: #59A844;
      background: #59A844;
      color: #ffffff;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-action.primary:hover:not(:disabled) {
      border-color: #4b8d39;
      background: #4b8d39;
      color: #ffffff;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice {
      border-color: #d9dad9;
      background: #ffffff;
      color: #414942;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice:hover:not(:disabled) {
      border-color: #c3c8c1;
      background: #f9f9f8;
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice.selected,
    .app.next-step-theme .quiz-detail-surface .quiz-choice.correct {
      border-color: #59A844;
      background: #eef6eb;
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice.incorrect {
      border-color: #ba1a1a;
      background: #fff1ee;
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice.selected .quiz-choice-letter,
    .app.next-step-theme .quiz-detail-surface .quiz-choice.correct .quiz-choice-letter {
      border-color: #59A844;
      background: #59A844;
      color: #ffffff;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-choice.incorrect .quiz-choice-letter {
      border-color: #ba1a1a;
      background: #ba1a1a;
      color: #ffffff;
    }

    .app.next-step-theme .empty,
    .app.next-step-theme .library-empty,
    .app.next-step-theme .release-condition-card {
      border-color: var(--ns-outline-variant);
      background: var(--ns-surface-low);
      color: var(--ns-on-surface-variant);
    }

    @media (max-width: 1023px) {
      .side-nav-ghost {
        margin-left: 0.6rem;
        margin-right: 0.6rem;
      }

      .side-nav-ghost {
        margin-bottom: 0.4rem;
      }

      .app {
        grid-template-columns: 1fr;
      }

      .app.sidebar-hidden {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: sticky;
        top: 0;
        min-height: auto;
        width: 100%;
        border-right: 0;
        border-bottom: 1px solid var(--line);
        opacity: 1;
        pointer-events: auto;
        z-index: 30;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.18);
        transform: none;
        transition: none;
      }

      .app.sidebar-hidden .sidebar {
        display: flex;
        width: 100%;
        transform: none;
        opacity: 1;
        pointer-events: auto;
        border-bottom-color: var(--line);
      }

      .sidebar-close {
        display: none;
      }

      .app.compact-sidebar-open .sidebar-close {
        display: inline-flex;
      }

      .sidebar-scrim {
        display: none;
      }

      .brand-note {
        display: none;
      }

      .side-nav-ghost,
      .module-list,
      .library-list {
        display: none;
      }

      .app.compact-sidebar-open .side-nav-ghost,
      .app.compact-sidebar-open .module-list,
      .app.compact-sidebar-open .library-list {
        display: grid;
      }

      .module-list,
      .library-list {
        max-height: min(70vh, 720px);
        overflow: auto;
      }

      .topbar {
        position: relative;
        z-index: 24;
      }

      .topbar-inner {
        align-items: flex-start;
      }

      .topbar-actions,
      .stats {
        width: 100%;
        justify-content: flex-start;
      }

      .stat {
        flex: 1 1 140px;
      }

      .content {
        padding: 0.75rem;
      }

      .reader-content,
      .html-reader-content {
        padding: 0.75rem;
      }

      .reader-html,
      .reader-text,
      .reader-document,
      .assignment-handoff,
      .quiz-shell {
        padding: 0.95rem;
      }

      .document-frame {
        min-height: 65vh;
      }

      .module-view-switcher {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .assignment-links,
      .quiz-actions {
        display: grid;
      }

      .assignment-link,
      .assignment-link-placeholder,
      .quiz-action {
        width: 100%;
      }

      .assignment-embed-frame-wrap {
        padding: 0.55rem;
        border-radius: 6px;
      }

      .assignment-embed-frame {
        min-height: 1180px;
        border-radius: 4px;
      }

      .lesson-completion-card {
        align-items: stretch;
      }

      .lesson-completion-actions {
        display: grid;
      }

      .lesson-completion-btn {
        width: 100%;
      }

      .lesson-next-btn {
        width: 100%;
      }
    }

    @media (max-width: 560px) {
      .sidebar {
        width: 100%;
      }

      .brand {
        padding: 0.9rem 0.9rem 0.85rem;
      }

      .module-list,
      .library-list {
        padding: 0.6rem;
      }

      .module-btn {
        padding: 0.62rem;
      }

      .topbar-inner {
        padding: 0.8rem 0.85rem;
      }

      .topbar h2 {
        font-size: 1rem;
      }

      .sidebar-toggle {
        width: 1.9rem;
        height: 1.9rem;
      }

      .assignment-embed-frame-wrap {
        padding: 0.4rem;
      }

      .assignment-embed-frame {
        min-height: 1320px;
      }
    }
  `;

  document.head.appendChild(style);
}
