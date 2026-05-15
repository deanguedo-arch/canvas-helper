import courseShellData from "./course-shell-data.js";
import assessmentDelivery from "./assessment-delivery.js";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs";

const STORAGE_KEY = String(courseShellData.storageKey || "experimental-psych-30-per-1-a-b-sec-s-202632352::workspace-state::v1");
const LEGACY_STORAGE_KEY = `${courseShellData.storageKey}::assessment-layout::v5`;
const root = document.getElementById("root");
const assessmentDeliveryByActivityId = new Map(assessmentDelivery.map((entry) => [entry.activityId, entry]));
const COURSE_THEME_MODES = ["current", "next-step"];
const DEFAULT_THEME_MODE = "next-step";
const THEME_PREFERENCE_VERSION = 1;
const COURSE_SHELL_VIEWS = ["home", "chapters", "quizzes", "assignments", "reader"];
const SHELL_ASSIGNMENTS_VIEW = "assignments";
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
const pdfDocumentPromiseByActivityId = new Map();
const pdfErrorByActivityId = new Set();
const state = loadState();

ensureSelection();
injectStyles();
injectForensics35ShellStyles();
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
      courseShellView: normalizeCourseShellView(parsed.courseShellView),
      sidebarLibraryView:
        parsed.sidebarLibraryView === "quizzes" || parsed.sidebarLibraryView === "assignments"
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
      courseShellView: "home",
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

function normalizeCourseShellView(value) {
  return COURSE_SHELL_VIEWS.includes(value) ? value : "home";
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
  state.sidebarHidden = !state.sidebarHidden;
  saveState();
  render();
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
  state.sidebarLibraryView = view === "quizzes" || view === "assignments" ? view : "modules";
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
  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  const key = bucketStateKey(moduleId, bucket);
  state.selectedByBucket[key] = activityId;
  state.moduleViewByModuleId[moduleId] = bucket === "assignments" ? "assignments" : "content";
  saveState();
  render();
}

function cleanDisplayText(value) {
  return String(value ?? "")
    .replace(/\u00c2\u00b7/g, " - ")
    .replace(/\u00c2\s*:/g, ":")
    .replace(/\u00c2\u00a0/g, " ")
    .replace(/\u00c2/g, "")
    .replace(/\u00e2\u20ac\u2122/g, "'")
    .replace(/\u00e2\u20ac\u0153/g, '"')
    .replace(/\u00e2\u20ac\u009d/g, '"')
    .replace(/\u00e2\u20ac\u201c/g, "-")
    .replace(/\u00e2\u20ac\u201d/g, "-")
    .replace(/\u00ef\u00bf\u00bd/g, "");
}

function escapeHtml(value) {
  return cleanDisplayText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLearnerCopy(value) {
  return cleanDisplayText(value)
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
    // Repair malformed copied helper text from source exports:
    // e.g. "https://youtu.be/vJG698U2Mvothis link opens in a new window/tab)"
    .replace(
      /(https?:\/\/(?:youtu\.be\/|www\.youtube\.com\/watch\?v=)[^\s)]+?)(this\s+link\s+opens\s+in\s+a\s+new\s+window\/tab\)?)/gi,
      "$1 (this link opens in a new window/tab)"
    )
    .replace(
      /(Direct Link:\s*https?:\/\/[^\s)]+?)(this\s+link\s+opens\s+in\s+a\s+new\s+window\/tab\)?)/gi,
      "$1 (this link opens in a new window/tab)"
    )
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

function parseQuizXml(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  const items = getElementsByLocalName(xml, "item");
  if (!items.length) {
    return null;
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
    return null;
  }

  const metadataFields = getElementsByLocalName(xml, "qtimetadatafield");
  const readMeta = (label) => {
    const field = metadataFields.find(
      (node) => getElementsByLocalName(node, "fieldlabel")[0]?.textContent?.trim() === label
    );
    return getElementsByLocalName(field || xml, "fieldentry")[0]?.textContent?.trim();
  };

  return {
    quizMeta: {
      profile: readMeta("qmd_assessmenttype") || "Assessment",
      attempts: Number(readMeta("cc_maxattempts") || 1),
      timeLimitMinutes: Number(readMeta("qmd_timelimit") || 0),
      questionCount: questions.length
    },
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
      return response.text();
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
    revealedByQuestion: {}
  };

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const questionIndex = Number.isInteger(raw.questionIndex) ? Math.max(0, Math.min(raw.questionIndex, Math.max(0, questionCount - 1))) : 0;
  const answersByQuestion =
    raw.answersByQuestion && typeof raw.answersByQuestion === "object" ? raw.answersByQuestion : {};
  const revealedByQuestion =
    raw.revealedByQuestion && typeof raw.revealedByQuestion === "object" ? raw.revealedByQuestion : {};

  return { questionIndex, answersByQuestion, revealedByQuestion };
}

function setQuizDraft(activityId, nextDraft) {
  state.quizDraftByActivityId[activityId] = nextDraft;
  saveState();
  renderWithForensicsScrollRestored();
}

function renderWithForensicsScrollRestored() {
  const scrollTarget = document.querySelector(".forensic-main");
  const scrollTop = scrollTarget ? scrollTarget.scrollTop : (typeof window !== "undefined" ? window.scrollY : 0);

  render();

  const restoreScroll = () => {
    const nextScrollTarget = document.querySelector(".forensic-main");
    if (nextScrollTarget) {
      nextScrollTarget.scrollTop = scrollTop;
      return;
    }

    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo(0, scrollTop);
    }
  };

  if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(restoreScroll);
  } else {
    restoreScroll();
  }
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

      const isBulletList = lines.length > 1 && lines.every((line) => /^(?:[-*]|\u2022)\s+/.test(line));
      const isNumberedList = lines.length > 1 && lines.every((line) => /^\d+\.\s+/.test(line));
      if (isBulletList || isNumberedList) {
        const tagName = isNumberedList ? "ol" : "ul";
        const items = lines
          .map((line) => `<li>${escapeHtml(line.replace(/^(?:(?:[-*]|\u2022)|\d+\.)\s+/, ""))}</li>`)
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
  renderWithForensicsScrollRestored();
}

function moduleCompletion(module) {
  const { content } = getModuleBuckets(module);
  const completedCount = content.filter((activity) => isLessonCompleted(activity.id)).length;
  const totalCount = content.length;
  const percent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    completedCount,
    totalCount,
    percent,
    isUnlocked: totalCount > 0 && completedCount === totalCount
  };
}

function buildUnlockedContentItems(contentItems) {
  const items = Array.isArray(contentItems) ? contentItems : [];
  if (!items.length) {
    return [];
  }

  const nextIndex = items.findIndex((activity) => !isLessonCompleted(activity.id));
  if (nextIndex === -1) {
    return items;
  }

  return items.slice(0, nextIndex + 1);
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
  renderWithForensicsScrollRestored();
}

function isAssignment(activity) {
  const kind = String(activity?.kind || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const renderHint = String(activity?.renderHint || "").toLowerCase();
  return kind === "assessment" || resourceKind === "assignment" || resourceKind === "quiz" || renderHint === "assessment";
}

function isWorkspaceAssignment(activity) {
  if (!isAssignment(activity)) {
    return false;
  }

  const delivery = getAssessmentDelivery(activity);
  return !delivery || delivery.deliveryMode === "workspace-quiz" || delivery.deliveryMode === "workspace-embed";
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
  const activities = module?.activities || [];
  const visibleActivities = activities.filter((activity) => !shouldHideActivityFromModuleList(module, activity));
  const assignments = visibleActivities.filter((activity) => isWorkspaceAssignment(activity));
  const content = visibleActivities.filter(
    (activity) => !isAssignment(activity) && String(activity?.kind || "").toLowerCase() !== "overview"
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

function sanitizeHtmlContent(rawHtml, sourceHref) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(normalizeLearnerCopy(rawHtml), "text/html");

  doc.querySelectorAll("script, style, link, meta, title, head, noscript").forEach((node) => node.remove());
  doc.querySelectorAll(".sr-only, .visually-hidden").forEach((node) => node.remove());

  const contentRoot = doc.querySelector(".col-sm-10.offset-sm-1") || doc.body;

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

  return normalizeLearnerCopy(contentRoot.innerHTML.trim());
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
      return response.text();
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
          <h5 style="color:#1a1c1a !important;">${escapeHtml(activity.title)}</h5>
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
            : `<div class="assignment-link-placeholder">${escapeHtml(delivery?.ctaLabel || "Google Classroom hand-in link")} not added yet</div>`
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
          <h5 style="color:#1a1c1a !important;">${escapeHtml(activity.title)}</h5>
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
    return `<div class="reader-text">${renderTextContent(activity.description || "No quiz questions were found.")}</div>`;
  }

  const draft = getQuizDraft(activity.id, questions.length);
  const answeredCount = questions.filter((question) => Number.isInteger(draft.answersByQuestion[question.id])).length;
  const correctCount = questions.filter((question) => draft.answersByQuestion[question.id] === question.answerIndex).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const complete = questions.length > 0 && answeredCount === questions.length;
  const resultsVisible = questions.some((question) => Boolean(draft.revealedByQuestion[question.id]));
  const quizProfile = quizData.quizMeta?.profile || "Assessment";
  const quizStatusLabel = complete ? "Ready for review" : answeredCount > 0 ? "In progress" : "Not started";

  return `
    <div
      class="quiz-shell quiz-detail-surface"
      data-testid="renderer-quiz"
      data-quiz-id="${escapeHtml(activity.id)}"
      data-quiz-layout="forensics-assessment"
    >
      <div class="quiz-detail-layout">
        <div class="quiz-header">
          <div class="quiz-copy">
            <p class="quiz-eyebrow">Experimental Psychology 30 &bull; ${escapeHtml(quizProfile)}</p>
            <h4 class="quiz-page-title">${escapeHtml(activity.title)}</h4>
          </div>
          <div class="quiz-meta-row">
            <div class="quiz-meta-block">
              <span>Status</span>
              <strong>${escapeHtml(quizStatusLabel)}</strong>
            </div>
            <div class="quiz-meta-block">
              <span>Submitted</span>
              <strong>${resultsVisible ? "Generated" : "Not yet submitted"}</strong>
            </div>
          </div>
        </div>

        <section class="quiz-evaluation-panel">
          <div class="quiz-evaluation-copy">
            <h5>Final Evaluation</h5>
            <p>This counter tracks completed questions only. Marks are handled separately, and responses can be reviewed after results are generated.</p>
          </div>
          <div class="quiz-evaluation-score">
            <strong><span>${answeredCount}</span><small>/${questions.length}</small></strong>
            <span class="quiz-evaluation-status">Questions completed</span>
          </div>
        </section>

        <div class="quiz-actions quiz-actions-row">
          <button class="quiz-action primary" type="button" data-quiz-generate="${escapeHtml(activity.id)}">Generate Results</button>
          <button class="quiz-action" type="button" data-quiz-check-all="${escapeHtml(activity.id)}">Check answers</button>
          <button class="quiz-action" type="button" data-quiz-retake="${escapeHtml(activity.id)}">Retake quiz</button>
          <button class="quiz-action" type="button" data-library-view="quizzes">Back to quizzes -&gt;</button>
        </div>

        <section class="quiz-section-breakdown" data-testid="quiz-section-breakdown">
          <h5>Section Breakdown</h5>
          <div class="quiz-section-list" data-testid="quiz-question-nav">
            <button
              class="quiz-section-button"
              type="button"
              data-quiz-question="${escapeHtml(activity.id)}"
              data-question-index="0"
            >
              <span>
                <span class="quiz-section-label">Multiple Choice</span>
                <span class="quiz-section-range">Questions 1-${questions.length}</span>
              </span>
              <span class="quiz-section-score">${answeredCount}/${questions.length}</span>
            </button>
          </div>
        </section>

        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width: ${progress}%;"></div>
        </div>

        <div class="quiz-question-list">
          ${questions
            .map((question, questionIndex) => {
              const selectedAnswer = draft.answersByQuestion[question.id];
              const revealed = Boolean(draft.revealedByQuestion[question.id]);
              const isCorrect = selectedAnswer === question.answerIndex;
              return `
            <article class="quiz-card quiz-question-row" data-testid="quiz-question-row">
              <div class="quiz-question-grid">
                <span class="quiz-question-number">${questionIndex + 1}</span>
                <div>
                  <p class="quiz-question">${escapeHtml(question.question || "No quiz question parsed.")}</p>
                  <div class="quiz-choices">
                    ${(question.choices || [])
                      .map((choice, choiceIndex) => {
                        const selected = selectedAnswer === choiceIndex;
                        const correct = revealed && choiceIndex === question.answerIndex;
                        const incorrect = revealed && selected && !isCorrect;
                        const choiceClasses = ["quiz-choice"];
                        if (selected) choiceClasses.push("selected");
                        if (correct) choiceClasses.push("correct");
                        if (incorrect) choiceClasses.push("incorrect");
                        const letter = String.fromCharCode(65 + choiceIndex);
                        return `
                    <button
                      class="${choiceClasses.join(" ")}"
                      type="button"
                      data-quiz-choice="${escapeHtml(activity.id)}"
                      data-question-id="${escapeHtml(question.id)}"
                      data-choice-index="${choiceIndex}"
                    >
                      <span class="quiz-choice-letter">${letter}</span>
                      <span>${escapeHtml(choice)}</span>
                    </button>
                  `;
                      })
                      .join("")}
                  </div>
                  ${
                    revealed && Number.isInteger(selectedAnswer)
                      ? `
                    <div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}">
                      <strong>${isCorrect ? "Correct" : "Incorrect"}</strong>
                      <span>${isCorrect ? "Your selected answer matches the key." : `Correct answer: ${escapeHtml(question.choices?.[question.answerIndex] || "Not available")}.`}</span>
                    </div>
                  `
                      : ""
                  }
                </div>
              </div>
            </article>
          `;
            })
            .join("")}
        </div>
        ${
          resultsVisible
            ? `
          <div class="quiz-feedback ${correctCount === questions.length ? "correct" : "incorrect"}">
            <strong>Results generated</strong>
            <span>${correctCount}/${questions.length} keyed responses currently match your selections.</span>
          </div>
        `
            : ""
        }
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
        <span>${completed ? "This lesson now counts toward the module release condition." : "Complete every lesson in the module to unlock that module's quizzes and assignments."}</span>
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

  const delivery = getAssessmentDelivery(activity);
  if (delivery?.deliveryMode === "workspace-embed") {
    return renderEmbeddedAssignment(activity, delivery);
  }

  if (delivery && delivery.deliveryMode !== "workspace-quiz") {
    return renderAssessmentHandIn(activity, delivery);
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
      return `<div class="reader-html">${cleanDisplayText(htmlCacheByActivityId.get(activity.id))}</div>`;
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
      const label = group.sectionTitle || "General Content";
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
  const { content, assignments } = getModuleBuckets(module);
  const unlockedContent = buildUnlockedContentItems(content);
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
              assignments.length
                ? completion.isUnlocked
                  ? `Quizzes and assignments unlocked`
                  : `Quizzes and assignments recommended after 100% completion`
                : `No assessments in this module`
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

function renderActivityListItem(moduleId, bucket, activity, active, className = "item-btn", disabled = false) {
  const metaLabel = activityMetaLabel(activity);
  const completed = !isAssignment(activity) && isLessonCompleted(activity.id);
  return `
    <button
      class="${className} ${active ? "active" : ""} ${disabled ? "locked" : ""}"
      type="button"
      data-select-activity="${escapeHtml(activity.id)}"
      data-module-id="${escapeHtml(moduleId)}"
      data-bucket="${escapeHtml(bucket)}"
      ${disabled ? "disabled" : ""}
    >
      <div class="item-row">
        <div class="item-title">${escapeHtml(activity.title)}</div>
        ${completed ? `<span class="item-complete">Completed</span>` : ""}
      </div>
      ${metaLabel ? `<div class="item-meta">${escapeHtml(metaLabel)}</div>` : ""}
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

    if (quizItems.length) {
      quizModules.push({ module, items: quizItems });
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
    .map(({ module, items }) => {
      const moduleLabel = escapeHtml(module?.title || "Module");
      const completion = moduleCompletion(module);
      const isUnlocked = completion.isUnlocked;
      const itemButtons = items
        .map((activity) =>
          renderActivityListItem(
            module.id,
            "assignments",
            activity,
            module.id === selectedModuleId && activity.id === selectedActivityId,
            "library-item-btn",
            !isUnlocked
          )
        )
        .join("");

      return `
        <section class="library-module-block">
          <div class="library-module-head">
            <h4>${moduleLabel}</h4>
            <span class="library-lock-chip ${isUnlocked ? "unlocked" : "locked"}">${isUnlocked ? "Unlocked" : "Locked"}</span>
          </div>
          <div class="library-module-items">${itemButtons}</div>
          ${!isUnlocked ? `<p class="library-lock-note">Complete all content lessons in this module to unlock ${escapeHtml(collectionTitle.toLowerCase())}.</p>` : ""}
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

  return `
    <section class="panel">
      <div class="reader-card">
        ${
          isHtmlReader
            ? ""
            : `
        <header class="reader-head">
          <div class="reader-heading">
            ${activityMetaLabel(activity) ? `<div class="reader-eyebrow">${escapeHtml(activityMetaLabel(activity))}</div>` : ""}
            <h4>${escapeHtml(activity.title)}</h4>
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

function courseShellAllowsAssignments() {
  return COURSE_SHELL_VIEWS.includes(SHELL_ASSIGNMENTS_VIEW);
}

function getForensics35DisplayTitle() {
  const rawTitle = String(courseShellData.title || "");
  if (/experimental/i.test(rawTitle) || STORAGE_KEY.includes("experimental-psych")) {
    return "Experimental Psychology 30";
  }
  if (/general/i.test(rawTitle) || STORAGE_KEY.includes("general-psychology")) {
    return "General Psychology 20";
  }
  return rawTitle || "Course";
}

function getForensics35DisplayDescription() {
  const title = getForensics35DisplayTitle();
  if (title === "Experimental Psychology 30") {
    return "Experimental Psychology 30 content and quizzes.";
  }
  if (title === "General Psychology 20") {
    return "General Psychology 20 content and quizzes.";
  }
  return courseShellData.description || courseShellData.subtitle || "Course content and quizzes.";
}

function getShellUnlockedContent(content) {
  if (typeof buildUnlockedContentActivities === "function") {
    return buildUnlockedContentActivities(content);
  }
  if (typeof buildUnlockedContentItems === "function") {
    return buildUnlockedContentItems(content);
  }
  return Array.isArray(content) ? content : [];
}

function isShellQuizActivity(activity) {
  const title = String(activity?.title || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const renderHint = String(activity?.renderHint || "").toLowerCase();
  const delivery = typeof getAssessmentDelivery === "function" ? getAssessmentDelivery(activity) : null;
  const deliveryMode = String(delivery?.deliveryMode || "").toLowerCase();
  if (/\bassignment\b/.test(title)) {
    return false;
  }
  return /\b(quiz|assessment|exam|test)\b/.test(title)
    || resourceKind === "quiz"
    || renderHint === "quiz"
    || deliveryMode.includes("quiz");
}

function getForensics35ShellRows() {
  return (courseShellData.modules || []).map((module, index) => {
    const buckets = getModuleBuckets(module);
    const content = Array.isArray(buckets.content) ? buckets.content : [];
    const assignments = Array.isArray(buckets.assignments) ? buckets.assignments : [];
    const quizzes = assignments.filter((activity) => isShellQuizActivity(activity));
    const taskAssignments = assignments.filter((activity) => !isShellQuizActivity(activity));
    const completion = moduleCompletion(module);
    const unlockedByAuthoring = typeof AUTHORING_UNLOCK_ALL !== "undefined" && AUTHORING_UNLOCK_ALL;
    return {
      module,
      index,
      content,
      assignments,
      quizzes,
      taskAssignments,
      unlockedContent: getShellUnlockedContent(content),
      completion,
      quizzesUnlocked: unlockedByAuthoring || completion.isUnlocked
    };
  });
}

function getForensics35ShellProgress(rows) {
  const totalContent = rows.reduce((sum, row) => sum + row.content.length, 0);
  const completedContent = rows.reduce((sum, row) => sum + row.content.filter((activity) => isLessonCompleted(activity.id)).length, 0);
  const totalQuizzes = rows.reduce((sum, row) => sum + row.quizzes.length, 0);
  const totalAssignments = rows.reduce((sum, row) => sum + row.taskAssignments.length, 0);
  const percent = totalContent ? Math.round((completedContent / totalContent) * 100) : 0;
  return { totalContent, completedContent, totalQuizzes, totalAssignments, percent };
}

function getForensics35ActiveNav() {
  if (state.courseShellView === "reader") {
    if (state.sidebarLibraryView === "quizzes") return "quizzes";
    if (state.sidebarLibraryView === SHELL_ASSIGNMENTS_VIEW && courseShellAllowsAssignments()) return SHELL_ASSIGNMENTS_VIEW;
    return "chapters";
  }
  return normalizeCourseShellView(state.courseShellView);
}

function setForensics35LibraryView(view) {
  if (view === "home") {
    state.courseShellView = "home";
    state.sidebarLibraryView = "modules";
  } else if (view === "quizzes") {
    state.courseShellView = "quizzes";
    state.sidebarLibraryView = "quizzes";
  } else if (view === SHELL_ASSIGNMENTS_VIEW && courseShellAllowsAssignments()) {
    state.courseShellView = SHELL_ASSIGNMENTS_VIEW;
    state.sidebarLibraryView = SHELL_ASSIGNMENTS_VIEW;
  } else {
    state.courseShellView = "chapters";
    state.sidebarLibraryView = "modules";
  }
  saveState();
  render();
}

function openForensics35Content(moduleId, activityId = "") {
  const row = getForensics35ShellRows().find((entry) => entry.module.id === moduleId);
  if (!row) return;
  const availableContent = row.unlockedContent.length ? row.unlockedContent : row.content;
  const target = availableContent.find((activity) => activity.id === activityId) || availableContent[0] || null;
  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  state.courseShellView = "reader";
  state.sidebarLibraryView = "modules";
  state.moduleViewByModuleId[moduleId] = "content";
  if (target) {
    state.selectedByBucket[bucketStateKey(moduleId, "content")] = target.id;
  }
  saveState();
  render();
}

function openForensics35Quiz(moduleId, activityId = "") {
  const row = getForensics35ShellRows().find((entry) => entry.module.id === moduleId);
  if (!row || !row.quizzesUnlocked || !row.quizzes.length) return;
  const target = row.quizzes.find((activity) => activity.id === activityId) || row.quizzes[0];
  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  state.courseShellView = "reader";
  state.sidebarLibraryView = "quizzes";
  state.moduleViewByModuleId[moduleId] = "assignments";
  state.selectedByBucket[bucketStateKey(moduleId, "assignments")] = target.id;
  saveState();
  render();
}

function openForensics35Assignment(moduleId, activityId = "") {
  if (!courseShellAllowsAssignments()) return;
  const row = getForensics35ShellRows().find((entry) => entry.module.id === moduleId);
  if (!row || !row.quizzesUnlocked || !row.taskAssignments.length) return;
  const target = row.taskAssignments.find((activity) => activity.id === activityId) || row.taskAssignments[0];
  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  state.courseShellView = "reader";
  state.sidebarLibraryView = SHELL_ASSIGNMENTS_VIEW;
  state.moduleViewByModuleId[moduleId] = "assignments";
  state.selectedByBucket[bucketStateKey(moduleId, "assignments")] = target.id;
  saveState();
  render();
}

function isForensicsCompactViewport() {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia(SIDEBAR_COMPACT_QUERY).matches;
}

function isForensicsMenuCollapsed() {
  return !isForensicsCompactViewport() && Boolean(state.sidebarHidden);
}

function isForensicsMobileMenuOpen() {
  return !isForensicsCompactViewport() || Boolean(compactSidebarOpen);
}

function toggleForensics35Sidebar() {
  if (isForensicsCompactViewport()) {
    compactSidebarOpen = !compactSidebarOpen;
    render();
    return;
  }

  state.sidebarHidden = !state.sidebarHidden;
  saveState();
  render();
}

function closeForensics35MenuAfterSelection() {
  if (isForensicsCompactViewport()) {
    compactSidebarOpen = false;
  }
}

function formatForensics35ModuleTitle(row) {
  const title = String(row?.module?.title || `Module ${row.index + 1}`)
    .replace(/^Module\s+\d+\s*:\s*/i, "")
    .replace(/^\d+\.\s*/, "")
    .trim();
  return `${row.index + 1}. ${title || `Module ${row.index + 1}`}`;
}

function renderForensics35Shell() {
  const rows = getForensics35ShellRows();
  const activeNav = getForensics35ActiveNav();
  const isMenuCollapsed = isForensicsMenuCollapsed();
  const isMobileMenuOpen = isForensicsMobileMenuOpen();
  const mainContent = state.courseShellView === "reader" ? renderForensics35Reader(rows) : renderForensics35Library(rows);

  root.innerHTML = `
    <div class="forensic-app">
      <div class="forensic-layout ${isMenuCollapsed ? "menu-collapsed" : ""} ${isMobileMenuOpen ? "mobile-menu-open" : ""}">
        ${renderForensics35Sidebar(rows, activeNav, isMenuCollapsed, isMobileMenuOpen)}
        <main class="forensic-main">
          ${mainContent}
        </main>
      </div>
    </div>
  `;

  bindForensics35ShellEvents();
  bindEmbeddedFrames();
  bindUnavailableLessonImages();
}

function bindUnavailableLessonImages() {
  root.querySelectorAll(".forensic-reader-surface img").forEach((image) => {
    const removeImage = () => {
      const wrapper = image.closest("figure, .image-card, .image-frame, .reader-image, p, div");
      image.setAttribute("data-image-unavailable", "true");
      if (wrapper && wrapper !== root && wrapper.children.length === 1 && !wrapper.textContent.trim()) {
        wrapper.remove();
        return;
      }
      image.remove();
    };
    const removeIfUnavailable = () => {
      const src = String(image.currentSrc || image.getAttribute("src") || "").trim();
      if (!src || (image.complete && (image.naturalWidth === 0 || image.naturalHeight === 0))) {
        removeImage();
      }
    };
    image.addEventListener("error", removeImage, { once: true });
    image.addEventListener("load", removeIfUnavailable, { once: true });
    removeIfUnavailable();
    window.setTimeout(removeIfUnavailable, 250);
    window.setTimeout(removeIfUnavailable, 1000);
  });
}

function forensics35NavIcon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12v16l-6-3-6 3V4z"/></svg>',
    chapters: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5v14"/><path d="M8 7v10"/><path d="M12 9v8"/><path d="M16 6l4 12"/></svg>',
    quizzes: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="4" width="10" height="16" rx="2"/><path d="M10 8h4"/><path d="M10 12h2"/><path d="M12 16h.01"/></svg>',
    assignments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8l2 2v14H6V4h2z"/><path d="M9 10h6"/><path d="M9 14h6"/><path d="M9 18h3"/></svg>'
  };
  return icons[name] || "";
}

function renderForensics35Icon(name) {
  return `<span class="forensic-nav-icon" aria-hidden="true">${forensics35NavIcon(name)}</span>`;
}

function forensics35NavLabel(label) {
  return `<strong>${escapeHtml(label)}</strong>`;
}

function forensics35NavContent(iconName, label) {
  return `${renderForensics35Icon(iconName)}${forensics35NavLabel(label)}`;
}

function renderForensics35Sidebar(rows, activeNav, isMenuCollapsed, isMobileMenuOpen) {
  const progress = getForensics35ShellProgress(rows);
  const assignmentNav = courseShellAllowsAssignments()
    ? `<button type="button" class="${forensics35NavClass(activeNav === SHELL_ASSIGNMENTS_VIEW)}" data-shell-nav="${escapeHtml(SHELL_ASSIGNMENTS_VIEW)}" data-library-view="${escapeHtml(SHELL_ASSIGNMENTS_VIEW)}">${forensics35NavContent("assignments", "Assignments")}</button>`
    : "";

  return `
    <aside class="forensic-sidebar" data-testid="chapter-menu-panel" data-collapsed="${isMenuCollapsed ? "true" : "false"}" data-sidebar-responsive-mode="option2-sticky">
      <div class="forensic-sidebar-top" data-testid="forensics35-fs25-sidebar-top">
        <div class="forensic-brand-row">
          <div class="forensic-brand" data-testid="forensics35-fs25-sidebar-brand">
            <h1>${escapeHtml(getForensics35DisplayTitle())}</h1>
            <div>SCHOLARLY ACCESS</div>
          </div>
          <button type="button" class="forensic-menu-button forensic-mobile-menu-toggle" data-sidebar-toggle aria-expanded="${isMobileMenuOpen ? "true" : "false"}" aria-label="${isMobileMenuOpen ? "Close chapter menu" : "Open chapter menu"}" data-testid="forensics35-mobile-menu-toggle">
            <span></span><span></span><span></span>
          </button>
          <button type="button" class="forensic-menu-button forensic-desktop-menu-toggle" data-sidebar-toggle aria-expanded="${isMenuCollapsed ? "false" : "true"}" aria-label="${isMenuCollapsed ? "Open chapter menu" : "Collapse chapter menu"}" data-testid="chapter-menu-toggle">
            <span></span><span></span><span></span>
          </button>
        </div>
        <div class="forensic-sidebar-progress" data-testid="forensics35-sidebar-progress">
          <div role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}">
            <span style="width:${progress.percent}%"></span>
          </div>
        </div>
      </div>
      <div class="forensic-sidebar-body ${isMobileMenuOpen ? "is-open" : ""}" data-testid="forensics35-fs25-sidebar-body">
        <nav class="forensic-shell-nav" aria-label="Primary navigation" data-testid="forensics35-fs25-shell-nav">
          <button type="button" class="${forensics35NavClass(activeNav === "home")}" data-shell-nav="home">${forensics35NavContent("home", "Home")}</button>
          <button type="button" class="${forensics35NavClass(activeNav === "chapters")}" data-shell-nav="chapters" data-library-view="modules">${forensics35NavContent("chapters", "Chapters")}</button>
          <button type="button" class="${forensics35NavClass(activeNav === "quizzes")}" data-shell-nav="quizzes" data-library-view="quizzes">${forensics35NavContent("quizzes", "Quizzes")}</button>
          ${assignmentNav}
        </nav>
      </div>
    </aside>
  `;
}

function forensics35NavClass(active) {
  return `forensic-nav-button ${active ? "active" : ""}`;
}

function renderForensics35Library(rows) {
  const view = normalizeCourseShellView(state.courseShellView);
  return `
    <section class="forensic-library" data-testid="course-shell-library">
      ${renderForensics35CourseworkCard(rows)}
      ${view === "home" ? renderForensics35ModuleGrid("forensics35-home-library", "Home", `Each module includes lesson pages and quizzes from the ${escapeHtml(getForensics35DisplayTitle())} course.`, rows) : ""}
      ${view === "chapters" ? renderForensics35ModuleGrid("forensics35-chapters-library", "Chapters", "Open a module to work through its lesson pages before completing the related assessments.", rows) : ""}
      ${view === "quizzes" ? renderForensics35QuizLibrary(rows) : ""}
      ${view === SHELL_ASSIGNMENTS_VIEW && courseShellAllowsAssignments() ? renderForensics35AssignmentLibrary(rows) : ""}
    </section>
  `;
}

function renderForensics35CourseworkCard(rows) {
  const progress = getForensics35ShellProgress(rows);
  const unlockedChapters = rows.filter((row) => row.completion.isUnlocked).length;
  return `
    <section class="forensic-coursework-card">
      <div>
        <div class="forensic-overline">Current Coursework</div>
        <h1>${escapeHtml(getForensics35DisplayTitle())}</h1>
        <p>${escapeHtml(getForensics35DisplayDescription())}</p>
      </div>
      <div class="forensic-coursework-progress">
        <div class="forensic-progress-label"><span>Overall Progress</span><strong>${progress.percent}%</strong></div>
        <div class="forensic-progressbar"><span style="width:${progress.percent}%"></span></div>
        <div class="forensic-progress-stats">
          <div><span>Unlocked Chapters</span><strong>${unlockedChapters}/${rows.length}</strong></div>
          <div><span>Completed Quizzes</span><strong>0/${progress.totalQuizzes}</strong></div>
        </div>
      </div>
    </section>
  `;
}

function renderForensics35ModuleGrid(id, title, description, rows) {
  return `
    <section class="forensic-library-section" id="${escapeHtml(id)}">
      <h2>${escapeHtml(title)}</h2>
      <p>${description}</p>
      <div class="forensic-module-grid">
        ${rows.map((row) => renderForensics35ChapterCard(row)).join("")}
      </div>
    </section>
  `;
}

function renderForensics35ChapterCard(row) {
  const quiz = row.quizzes[0] || null;
  const locked = quiz && !row.quizzesUnlocked;
  return `
    <article class="forensic-module-card" data-testid="forensics35-chapter-card">
      <div class="forensic-overline">Module ${row.index + 1}</div>
      <h3>${escapeHtml(formatForensics35ModuleTitle(row))}</h3>
      <p>Mapped from the D2L manifest hierarchy. This node is included in the shell so navigation follows the real course sequence.</p>
      <div class="forensic-card-actions">
        <button type="button" class="forensic-primary-button" data-open-shell-content="${escapeHtml(row.module.id)}">Open content</button>
        ${quiz ? `<button type="button" class="forensic-secondary-button" data-open-shell-quiz="${escapeHtml(row.module.id)}" data-activity-id="${escapeHtml(quiz.id)}" ${locked ? "disabled" : ""}>Open test</button>` : ""}
      </div>
      <div class="forensic-complete-pill">${row.completion.completedCount}/${row.completion.totalCount} components complete</div>
      ${locked ? `<div class="forensic-lock-pill">Locked until all module content is marked complete</div>` : ""}
    </article>
  `;
}

function renderForensics35QuizLibrary(rows) {
  const cards = rows.flatMap((row) => row.quizzes.map((quiz, index) => renderForensics35AssessmentCard(row, quiz, index, "quiz"))).join("");
  return `
    <section class="forensic-library-section" id="forensics35-quiz-library">
      <h2>Quizzes</h2>
      <p>Open a test to work through the question sets and track completion by section.</p>
      <div class="forensic-assessment-grid">
        ${cards || `<div class="forensic-empty">No quizzes are available in this course shell.</div>`}
      </div>
    </section>
  `;
}

function renderForensics35AssignmentLibrary(rows) {
  const cards = rows.flatMap((row) => row.taskAssignments.map((assignment, index) => renderForensics35AssessmentCard(row, assignment, index, "assignment"))).join("");
  return `
    <section class="forensic-library-section" id="forensics35-assignment-library">
      <h2>Assignments</h2>
      <p>Open an assignment after completing the related module content.</p>
      <div class="forensic-assessment-grid">
        ${cards || `<div class="forensic-empty">No standalone assignments are available in this course shell.</div>`}
      </div>
    </section>
  `;
}

function renderForensics35AssessmentCard(row, activity, index, type) {
  const locked = !row.quizzesUnlocked;
  const actionAttribute = type === "assignment" ? "data-open-shell-assignment" : "data-open-shell-quiz";
  return `
    <article class="forensic-module-card" data-testid="${type === "assignment" ? "forensics35-assignment-card" : "forensics35-quiz-card"}">
      <div class="forensic-overline">${type === "assignment" ? "Assignment" : "Quiz"} ${index + 1}</div>
      <h3>${escapeHtml(activity.title || (type === "assignment" ? "Assignment" : "Assessment"))}</h3>
      <p>Mapped from the D2L manifest hierarchy. This node is included in the shell so navigation follows the real course sequence.</p>
      <div class="forensic-card-actions">
        <button type="button" class="forensic-secondary-button" ${actionAttribute}="${escapeHtml(row.module.id)}" data-activity-id="${escapeHtml(activity.id)}" ${locked ? "disabled" : ""}>Open test</button>
      </div>
      ${locked ? `<div class="forensic-lock-pill">Locked until all module content is marked complete</div>` : ""}
    </article>
  `;
}

function renderForensics35Reader(rows) {
  const selectedModule = getSelectedModule();
  const row = rows.find((entry) => entry.module.id === selectedModule?.id) || rows[0];
  if (!row) {
    return `<section class="forensic-reader-surface"><div class="forensic-empty">No module content is available.</div></section>`;
  }

  if (state.sidebarLibraryView === "quizzes") {
    return renderForensics35AssessmentReader(row);
  }
  if (state.sidebarLibraryView === SHELL_ASSIGNMENTS_VIEW && courseShellAllowsAssignments()) {
    return renderForensics35AssignmentReader(row);
  }
  return renderForensics35ChapterReader(row);
}

function renderForensics35ChapterReader(row) {
  return `
    <section class="forensic-reader-surface">
      <div class="forensic-reader-header">
        <div class="forensic-reader-kicker">${escapeHtml(formatForensics35ModuleTitle(row))}</div>
        <h2 data-testid="lesson-title">${escapeHtml(formatForensics35ModuleTitle(row))}</h2>
        <div class="forensic-badge">Content</div>
        <div class="forensic-reader-progress">
          <div><span>Course progress</span><strong>${row.completion.completedCount}/${row.completion.totalCount} - ${row.completion.percent}%</strong></div>
          <div class="forensic-progressbar"><span style="width:${row.completion.percent}%"></span></div>
        </div>
      </div>
      <div class="forensic-reader-list" data-testid="module-content-view">
        <section class="forensic-progress-control" data-testid="mark-complete-panel">
          <div class="forensic-overline">Progress control</div>
          <h3>Lesson sequence</h3>
          <p>Complete each lesson to unlock the next card in this module.</p>
          <div class="forensic-progressbar"><span style="width:${row.completion.percent}%"></span></div>
          <p>${row.completion.completedCount}/${row.completion.totalCount} completed in this module</p>
        </section>
        <div class="forensic-sequence-list" data-testid="chapter-sequence-list">
          ${row.content.map((activity, index) => renderForensics35SequenceCard(row, activity, index)).join("")}
        </div>
      </div>
    </section>
  `;
}

function renderForensics35SequenceCard(row, activity, index) {
  const unlockedIds = new Set(row.unlockedContent.map((entry) => entry.id));
  const locked = !unlockedIds.has(activity.id);
  const complete = isLessonCompleted(activity.id);
  const progressState = locked ? "locked" : complete ? "complete" : "active";
  return `
    <article class="forensic-sequence-card" data-progress-state="${progressState}">
      <div class="forensic-sequence-card-head">
        <span>${index + 1}</span>
        <div>
          ${activityMetaLabel(activity) ? `<div class="forensic-overline">${escapeHtml(activityMetaLabel(activity))}</div>` : ""}
          <h3>${escapeHtml(activity.title || `Lesson ${index + 1}`)}</h3>
        </div>
      </div>
      <div class="forensic-sequence-card-body">
        ${renderActivityBody(activity)}
      </div>
      <div class="forensic-sequence-actions">
        <p>${locked ? "Locked until the previous lesson is completed." : complete ? "Lesson complete." : "Active lesson. Mark complete to unlock the next card."}</p>
        <div>
          <button type="button" class="forensic-secondary-button" data-complete-lesson="${escapeHtml(activity.id)}" data-completed="${complete ? "true" : "false"}" ${locked ? "disabled" : ""}>${complete ? "Mark incomplete" : "Mark complete"}</button>
          ${!complete ? `<button type="button" class="forensic-secondary-button" data-complete-next="${escapeHtml(activity.id)}" data-module-id="${escapeHtml(row.module.id)}" ${locked ? "disabled" : ""}>Mark complete + next</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

function renderForensics35AssessmentReader(row) {
  if (!row.quizzesUnlocked) {
    return renderForensics35LockedReader(row, "No quizzes in this module", "Complete all module content lessons first to unlock this module's quizzes.");
  }
  const selected = getSelectedActivity(row.module.id, "assignments", row.quizzes);
  return `
    <section class="forensic-reader-surface forensic-assessment-reader">
      <button type="button" class="forensic-secondary-button" data-shell-nav="quizzes">Back to quizzes</button>
      <div class="forensic-reader-kicker">Module ${row.index + 1} - Assessment</div>
      <h2>${escapeHtml(selected?.title || "Assessment")}</h2>
      ${selected ? renderActivityBody(selected) : `<div class="forensic-empty">No assessment is available for this module.</div>`}
    </section>
  `;
}

function renderForensics35AssignmentReader(row) {
  if (!row.quizzesUnlocked) {
    return renderForensics35LockedReader(row, "No assignments in this module", "Complete all module content lessons first to unlock this module's assignments.");
  }
  const selected = getSelectedActivity(row.module.id, "assignments", row.taskAssignments);
  return `
    <section class="forensic-reader-surface forensic-assessment-reader forensic-assignment-reader">
      <button type="button" class="forensic-secondary-button" data-shell-nav="${escapeHtml(SHELL_ASSIGNMENTS_VIEW)}">Back to assignments</button>
      <div class="forensic-reader-kicker">Module ${row.index + 1} - Assignment</div>
      <h2>${escapeHtml(selected?.title || "Assignment")}</h2>
      <div class="forensic-assignment-body">
        ${selected ? renderActivityBody(selected) : `<div class="forensic-empty">No standalone assignment is available for this module.</div>`}
      </div>
    </section>
  `;
}

function renderForensics35LockedReader(row, title, message) {
  return `
    <section class="forensic-reader-surface">
      <div class="forensic-empty">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(message)}</p>
        <button type="button" class="forensic-primary-button" data-open-shell-content="${escapeHtml(row.module.id)}">Return to chapter</button>
      </div>
    </section>
  `;
}
function bindForensics35ShellEvents() {
  root.querySelectorAll("[data-sidebar-toggle]").forEach((button) => {
    button.addEventListener("click", () => toggleForensics35Sidebar());
  });

  root.querySelectorAll("[data-shell-nav]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-shell-nav") || "home";
      closeForensics35MenuAfterSelection();
      setForensics35LibraryView(view);
    });
  });

  root.querySelectorAll("[data-library-view]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.getAttribute("data-library-view") || "modules";
      closeForensics35MenuAfterSelection();
      setForensics35LibraryView(view === "modules" ? "chapters" : view);
    });
  });

  root.querySelectorAll("[data-open-shell-content]").forEach((button) => {
    button.addEventListener("click", () => {
      closeForensics35MenuAfterSelection();
      openForensics35Content(button.getAttribute("data-open-shell-content") || "");
    });
  });

  root.querySelectorAll("[data-open-shell-quiz]").forEach((button) => {
    button.addEventListener("click", () => {
      closeForensics35MenuAfterSelection();
      openForensics35Quiz(button.getAttribute("data-open-shell-quiz") || "", button.getAttribute("data-activity-id") || "");
    });
  });

  root.querySelectorAll("[data-open-shell-assignment]").forEach((button) => {
    button.addEventListener("click", () => {
      closeForensics35MenuAfterSelection();
      openForensics35Assignment(button.getAttribute("data-open-shell-assignment") || "", button.getAttribute("data-activity-id") || "");
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
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => ({ ...draft, questionIndex }));
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
        answersByQuestion: { ...draft.answersByQuestion, [questionId]: choiceIndex },
        revealedByQuestion: { ...draft.revealedByQuestion, [questionId]: false },
        resultsVisible: false
      }));
    });
  });

  root.querySelectorAll("[data-quiz-generate], [data-quiz-check-all]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-generate") || button.getAttribute("data-quiz-check-all") || "";
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
      if (!question) return;
      updateQuizDraft(activityId, quizData.quizQuestions.length, (currentDraft) => ({
        ...currentDraft,
        revealedByQuestion: { ...currentDraft.revealedByQuestion, [question.id]: true }
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
        return { ...draft, answersByQuestion, revealedByQuestion, resultsVisible: false };
      });
    });
  });

  root.querySelectorAll("[data-quiz-retake]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-retake") || "";
      setQuizDraft(activityId, { questionIndex: 0, answersByQuestion: {}, revealedByQuestion: {}, resultsVisible: false, resultsGeneratedAt: "" });
    });
  });

  root.querySelectorAll("[data-quiz-next]").forEach((button) => {
    button.addEventListener("click", () => {
      const activityId = button.getAttribute("data-quiz-next") || "";
      const quizData = quizCacheByActivityId.get(activityId);
      updateQuizDraft(activityId, quizData?.quizQuestions?.length || 0, (draft) => ({
        ...draft,
        questionIndex: Math.min(draft.questionIndex + 1, Math.max(0, (quizData?.quizQuestions?.length || 1) - 1))
      }));
    });
  });
}
function injectForensics35ShellStyles() {
  const style = document.createElement("style");
  style.textContent = `
    :root{--forensic-bg:#f3f4f3;--forensic-ink:#191c18;--forensic-muted:#656b61;--forensic-panel:#fff;--forensic-sidebar:#2f3430;--forensic-sidebar-ink:#f6f7f3;--forensic-green:#157908;--forensic-green-soft:#eaf5e8;--forensic-line:#d8ddd3;--forensic-gold:#ffc857}
    body{margin:0;background:var(--forensic-bg)!important;color:var(--forensic-ink)!important;font-family:"Open Sans","Rubik",sans-serif}
    .forensics35-shell{min-height:100vh;display:grid;grid-template-columns:324px minmax(0,1fr);background:var(--forensic-bg)}
    .shell-sidebar{position:sticky;top:0;height:100vh;overflow-y:auto;background:var(--forensic-sidebar);color:var(--forensic-sidebar-ink);padding:18px;display:flex;flex-direction:column;gap:18px;box-shadow:18px 0 40px rgba(20,25,19,.12);z-index:20}
    .shell-brand-card{border-bottom:1px solid rgba(255,255,255,.12);padding-bottom:20px}
    .shell-brand-eyebrow,.shell-kicker{margin:0 0 8px;color:var(--forensic-green);font-size:.75rem;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    .shell-brand-card .shell-brand-eyebrow{color:#a9ff94}
    .shell-brand-card h1,.shell-hero h1,.shell-library-heading h1,.reader-shell-heading h1{margin:0;font-family:"Rubik","Open Sans",sans-serif;letter-spacing:-.045em;line-height:1.05}
    .shell-brand-card h1{font-size:clamp(1.8rem,3vw,2.4rem);color:#a9ff94}
    .shell-brand-card p,.shell-library-heading p,.shell-hero p,.reader-shell-heading p{color:var(--forensic-muted);line-height:1.65}.shell-brand-card p{color:rgba(246,247,243,.72)}
    .shell-nav{display:grid;gap:8px}.side-nav-item{border:1px solid rgba(255,255,255,.12);border-radius:8px;background:rgba(255,255,255,.04);color:rgba(246,247,243,.82);padding:12px 18px;text-align:left;font-weight:900;letter-spacing:.08em;text-transform:uppercase;cursor:pointer}.side-nav-item.active,.side-nav-item:hover{background:var(--forensic-green);border-color:var(--forensic-green);color:white}
    .shell-side-progress,.shell-module-chip,.shell-panel,.shell-card,.forensic-reader-card,.chapter-sequence-list,.mark-complete-panel{border:1px solid var(--forensic-line);border-radius:14px;background:var(--forensic-panel);box-shadow:0 18px 42px rgba(35,45,31,.08)}
    .shell-side-progress{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.12);padding:16px;color:white}.shell-side-progress span{color:rgba(246,247,243,.76);font-size:.8rem}.shell-side-progress strong{display:block;margin-top:4px;font-size:1.9rem;color:#a9ff94}
    .shell-progress-track{height:8px;margin-top:12px;overflow:hidden;border-radius:999px;background:rgba(17,24,15,.12)}.shell-progress-track span{display:block;height:100%;border-radius:inherit;background:var(--forensic-green)}
    .shell-module-stack{display:grid;gap:10px}.shell-module-chip{padding:14px;text-align:left;background:rgba(255,255,255,.07);color:rgba(246,247,243,.8);border-color:rgba(255,255,255,.1);cursor:pointer}.shell-module-chip.active{border-color:#a9ff94;background:rgba(21,121,8,.42);color:white}.shell-module-chip span,.shell-module-chip small{display:block;color:rgba(246,247,243,.6);font-size:.78rem}.shell-module-chip strong{display:block;margin:4px 0;line-height:1.25}
    .shell-resume-button,.shell-button{border:0;border-radius:10px;background:var(--forensic-green);color:white;padding:13px 18px;font-weight:900;cursor:pointer;box-shadow:0 10px 22px rgba(21,121,8,.2)}.shell-resume-button{width:100%;background:var(--forensic-gold);color:#3b3100;margin-top:auto}.shell-button.secondary{background:white;color:var(--forensic-ink);border:1px solid var(--forensic-line);box-shadow:none}.shell-button:disabled,.sequence-item:disabled{cursor:not-allowed;opacity:.52;box-shadow:none}
    .shell-main{min-width:0;padding:0 0 56px}.shell-topbar{position:sticky;top:0;z-index:10;min-height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 28px;background:rgba(255,255,255,.88);border-bottom:1px solid var(--forensic-line);backdrop-filter:blur(16px)}.shell-topbar h2{margin:0;font-size:1rem;letter-spacing:-.02em}.shell-icon-button,.theme-pill{border:1px solid var(--forensic-line);border-radius:999px;background:white;color:var(--forensic-ink);padding:9px 12px;cursor:pointer;font-weight:800}.theme-pill.active{background:var(--forensic-green-soft);border-color:#b9dcb2;color:var(--forensic-green)}.shell-topbar-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .shell-library,.forensic-reader-surface{width:min(100%,1100px);margin:36px auto 0;padding:0 26px}.shell-hero,.shell-library-heading{padding:clamp(24px,4vw,48px);margin-bottom:20px}.shell-hero h1,.shell-library-heading h1,.reader-shell-heading h1{font-size:clamp(2.2rem,5vw,4.6rem)}
    .shell-stat-row,.shell-card-meta,.shell-card-actions,.completion-actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.shell-stat-row span,.shell-card-meta span{border:1px solid var(--forensic-line);border-radius:999px;background:#f9faf7;padding:7px 11px;font-size:.82rem;color:var(--forensic-muted)}
    .shell-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px}.shell-card{padding:22px}.shell-card h2{margin:10px 0;font-size:1.35rem;letter-spacing:-.025em}.shell-card p{color:var(--forensic-muted);line-height:1.55}.shell-card-topline{display:flex;justify-content:space-between;color:var(--forensic-green);font-weight:900;text-transform:uppercase;letter-spacing:.08em;font-size:.72rem}.quiz-card-shell.locked{background:#f6f7f4}
    .forensic-reader-layout{display:grid;grid-template-columns:280px minmax(0,1fr);gap:20px;align-items:start}.reader-shell-heading{margin-bottom:18px}.chapter-sequence-list{position:sticky;top:96px;padding:14px;display:grid;gap:8px}.sequence-item{border:1px solid var(--forensic-line);border-radius:12px;background:white;padding:12px;text-align:left;display:grid;grid-template-columns:30px minmax(0,1fr);gap:8px;cursor:pointer}.sequence-item.active{border-color:var(--forensic-green);background:var(--forensic-green-soft)}.sequence-item span{width:28px;height:28px;display:grid;place-items:center;border-radius:9px;background:var(--forensic-green-soft);color:var(--forensic-green);font-weight:900}.sequence-item strong,.sequence-item small{grid-column:2}.sequence-item small{color:var(--forensic-muted)}
    .forensic-reader-card,.mark-complete-panel{padding:clamp(20px,3vw,40px)}.forensic-reader-card .reader-text{max-width:78ch;font-size:1.05rem;line-height:1.78}.mark-complete-panel{margin-top:22px;display:flex;justify-content:space-between;gap:16px;align-items:center;background:#fffaf0;border-color:#e5d3b0}.mark-complete-panel h2{margin:0 0 6px;font-size:1.25rem}.mark-complete-panel p{margin:0;color:var(--forensic-muted)}.assessment-reader .forensic-reader-card{padding:clamp(16px,3vw,32px)}.locked-panel{padding:clamp(28px,5vw,56px)}
    .forensics35-shell{grid-template-columns:248px minmax(0,1fr)}
    .forensics35-shell.sidebar-compact{grid-template-columns:76px minmax(0,1fr)}
    .mobile-shell-launcher{display:none;position:fixed;left:14px;top:14px;z-index:30;border:1px solid var(--forensic-line);border-radius:999px;background:white;color:var(--forensic-ink);padding:8px 12px;font-weight:900;box-shadow:0 10px 28px rgba(17,24,15,.12)}
    .shell-brand-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .shell-brand-top h1{font-size:1.8rem}
    .shell-sidebar-toggle{border:1px solid rgba(255,255,255,.16);border-radius:8px;background:rgba(255,255,255,.08);color:white;padding:8px 10px;font-size:.72rem;font-weight:900;cursor:pointer}
    .side-nav-item{display:flex;align-items:center;gap:12px;text-transform:none;letter-spacing:0}
    .shell-nav-icon{width:24px;height:24px;display:grid;place-items:center;border-radius:7px;border:1px solid rgba(255,255,255,.14);font-size:.7rem;font-weight:900;flex:0 0 auto}
    .side-nav-item.active .shell-nav-icon{border-color:rgba(255,255,255,.45)}
    .forensics35-shell.sidebar-compact .shell-sidebar{padding:14px 10px}
    .forensics35-shell.sidebar-compact .shell-brand-top h1,.forensics35-shell.sidebar-compact .shell-brand-eyebrow,.forensics35-shell.sidebar-compact .shell-brand-card p,.forensics35-shell.sidebar-compact .shell-nav-label,.forensics35-shell.sidebar-compact .shell-side-progress,.forensics35-shell.sidebar-compact .shell-module-stack,.forensics35-shell.sidebar-compact .shell-resume-button{display:none}
    .forensics35-shell.sidebar-compact .shell-brand-card{padding-bottom:10px}
    .forensics35-shell.sidebar-compact .shell-brand-top{justify-content:center}
    .forensics35-shell.sidebar-compact .side-nav-item{justify-content:center;padding:12px 8px}
    .forensics35-shell.sidebar-compact .shell-sidebar-toggle{width:44px;height:44px;padding:0}
    .sidebar-scrim{display:none}
    @media (max-width:1023px){.forensics35-shell,.forensics35-shell.sidebar-compact{display:block}.mobile-shell-launcher{display:inline-flex}.forensics35-shell:not(.sidebar-compact) .mobile-shell-launcher{display:none}.shell-main{padding-top:50px}.shell-sidebar{position:fixed;inset:0 auto 0 0;width:min(86vw,300px);transform:translateX(-104%);transition:transform 180ms ease}.shell-sidebar.visible{transform:translateX(0)}.forensics35-shell.sidebar-compact .shell-sidebar{padding:18px}.forensics35-shell.sidebar-compact .shell-brand-top h1,.forensics35-shell.sidebar-compact .shell-brand-eyebrow,.forensics35-shell.sidebar-compact .shell-brand-card p,.forensics35-shell.sidebar-compact .shell-nav-label,.forensics35-shell.sidebar-compact .shell-side-progress,.forensics35-shell.sidebar-compact .shell-module-stack,.forensics35-shell.sidebar-compact .shell-resume-button{display:block}.forensics35-shell.sidebar-compact .side-nav-item{justify-content:flex-start;padding:12px 18px}.forensics35-shell.sidebar-compact .shell-brand-top{justify-content:space-between}.sidebar-scrim{display:block;position:fixed;inset:0;z-index:15;border:0;background:rgba(17,24,15,.45);opacity:0;pointer-events:none}.sidebar-scrim.visible{opacity:1;pointer-events:auto}.forensic-reader-layout{grid-template-columns:1fr}.chapter-sequence-list{position:static}.shell-topbar{align-items:flex-start}}
    @media (max-width:640px){.shell-library,.forensic-reader-surface{padding:0 14px;margin-top:18px}.shell-topbar{padding:12px 14px;flex-direction:column}.mark-complete-panel{align-items:stretch;flex-direction:column}.completion-actions,.shell-card-actions{flex-direction:column;align-items:stretch}}
    .forensic-app{min-height:100vh;background:#f3f4f3;color:#1a1c1a;font-family:"Open Sans","Rubik",sans-serif}
    .forensic-app h1,.forensic-app h2,.forensic-app h3,.forensic-app h4{font-family:"Rubik","Open Sans",sans-serif;letter-spacing:0}
    .forensic-layout{display:flex;min-height:100vh;flex-direction:column}
    .forensic-sidebar{position:sticky;top:0;z-index:30;flex-shrink:0;overflow:visible;border-bottom:1px solid #303332;background:#3c3f3e;color:#fff}
    .forensic-sidebar-top{position:sticky;top:0;z-index:30;border-bottom:1px solid #4b4e4d;background:#3c3f3e;padding:1rem}
    .forensic-brand-row{display:flex;align-items:flex-start;justify-content:space-between;gap:.75rem}
    .forensic-brand{min-width:0}.forensic-brand h1{margin:0;color:#fff;font-size:1.5rem;font-weight:800;line-height:.95}.forensic-brand div{margin-top:.5rem;color:#c9ceca;font-size:.625rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase}
    .forensic-menu-button{display:flex;width:2.5rem;height:2.5rem;flex-shrink:0;align-items:center;justify-content:center;flex-direction:column;gap:.375rem;border:1px solid #5a5e5d;border-radius:.5rem;background:#4b4e4d;color:#fff;cursor:pointer}.forensic-menu-button span{display:block;width:1rem;height:2px;border-radius:999px;background:currentColor}.forensic-desktop-menu-toggle{display:none}
    .forensic-sidebar-progress{margin-top:1rem}.forensic-sidebar-progress>div,.forensic-progressbar{height:.375rem;overflow:hidden;border-radius:999px;background:#d9dad9}.forensic-sidebar-progress span,.forensic-progressbar span{display:block;height:100%;border-radius:999px;background:#59A844;transition:width .3s ease}
    .forensic-sidebar-body{display:none;gap:1rem;border-bottom:1px solid #4b4e4d;padding:1rem .75rem}.forensic-sidebar-body.is-open{display:grid}
    .forensic-search{position:relative}.forensic-search span{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:#adb4af;pointer-events:none}.forensic-search input{width:100%;border:1px solid #5a5e5d;border-radius:.5rem;background:#2c2f2e;color:#fff;padding:.625rem .75rem .625rem 2.25rem;outline:none}.forensic-search input:focus{border-color:#59A844}
    .forensic-shell-nav{display:grid;gap:.5rem}.forensic-nav-button{display:flex;align-items:center;gap:.75rem;border:1px solid transparent;border-radius:.375rem;background:transparent;color:#fff;padding:.75rem .9rem;text-align:left;cursor:pointer;transition:background .15s ease,border-color .15s ease}.forensic-nav-button:hover{border-color:#5a5e5d;background:#4b4e4d}.forensic-nav-button.active{border-color:#59A844;background:#59A844}.forensic-nav-button span{width:1rem;text-align:center;font-weight:800}.forensic-nav-button strong{font-size:.875rem}.forensic-nav-icon{display:inline-flex;width:1rem;height:1rem;align-items:center;justify-content:center;flex:0 0 auto}.forensic-nav-icon svg{display:block;width:1rem;height:1rem;stroke:currentColor}
    .forensic-main{min-width:0;flex:1;overflow-x:hidden;overflow-y:auto;background:#f3f4f3;color:#1a1c1a}
    .forensic-library,.forensic-reader-surface{margin:0 auto;max-width:72rem;padding:2rem 1rem}
    .forensic-coursework-card{display:grid;gap:1.5rem;border:1px solid #d9dad9;border-radius:.5rem;background:#fff;padding:1.5rem;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .forensic-overline{color:#3f9f2e;font-size:.75rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase}
    .forensic-coursework-card h1{margin:.9rem 0 0;color:#3c3f3e;font-size:clamp(2.25rem,6vw,3.25rem);line-height:.95;font-weight:800}.forensic-coursework-card p,.forensic-library-section p,.forensic-module-card p{color:#606762;line-height:1.55}
    .forensic-coursework-progress{min-width:240px;align-self:center}.forensic-progress-label,.forensic-progress-stats{display:flex;justify-content:space-between;gap:1rem;color:#606762;font-size:.875rem}.forensic-progress-label strong,.forensic-progress-stats strong{display:block;color:#3c3f3e;font-size:1.125rem;text-align:right}
    .forensic-library-section{margin-top:2rem}.forensic-library-section h2{margin:0;color:#3c3f3e;font-size:2rem;font-weight:800}
    .forensic-module-grid,.forensic-assessment-grid{display:grid;gap:1.25rem;margin-top:1.75rem}.forensic-module-card{border:1px solid #d9dad9;border-radius:.5rem;background:#fff;padding:1.25rem;box-shadow:0 2px 8px rgba(0,0,0,.08)}.forensic-module-card h3{margin:.75rem 0;color:#3c3f3e;font-size:1.25rem;font-weight:800;line-height:1.2}
    .forensic-card-actions{display:flex;flex-wrap:wrap;gap:.625rem;margin-top:1rem}.forensic-primary-button,.forensic-secondary-button{border:1px solid #d9dad9;border-radius:.375rem;padding:.625rem 1rem;font-weight:800;cursor:pointer}.forensic-primary-button{border-color:#59A844;background:#59A844;color:#fff}.forensic-secondary-button{background:#fff;color:#606762}.forensic-primary-button:disabled,.forensic-secondary-button:disabled{cursor:not-allowed;opacity:.55}
    .forensic-complete-pill,.forensic-lock-pill{display:inline-block;margin-top:.75rem;border-radius:999px;background:#eef6eb;color:#15803d;padding:.35rem .65rem;font-size:.75rem;font-weight:800}.forensic-lock-pill{display:block}
    .forensic-reader-header{position:sticky;top:0;z-index:10;border-bottom:1px solid #d9dad9;background:#f3f4f3;padding-bottom:1rem}.forensic-reader-kicker{color:#414942;font-size:.875rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.forensic-reader-header h2,.forensic-assessment-reader h2{margin:.5rem 0;color:#1a1c1a;font-size:clamp(2.25rem,6vw,3.75rem);line-height:1;font-weight:800}
    .forensic-badge{display:inline-flex;border-radius:999px;background:#eef6eb;color:#1e6d0d;padding:.35rem .65rem;font-size:.75rem;font-weight:800}.forensic-reader-progress,.forensic-progress-control,.forensic-sequence-card,.forensic-empty{border:1px solid #d9dad9;border-radius:.5rem;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .forensic-reader-progress{margin-top:1rem;max-width:56rem;padding:1rem}.forensic-reader-progress>div:first-child{display:flex;justify-content:space-between;gap:1rem;color:#414942;font-size:.75rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.forensic-reader-list{margin-top:1.5rem;display:grid;gap:1.25rem}.forensic-progress-control{padding:1.25rem}.forensic-progress-control h3{margin:.25rem 0;color:#1a1c1a;font-size:1.125rem}
    .forensic-sequence-list{display:grid;gap:1.25rem}.forensic-sequence-card{overflow:hidden;padding:1rem}.forensic-sequence-card-head{display:flex;align-items:flex-start;gap:.75rem;margin-bottom:.75rem}.forensic-sequence-card-head>span{display:inline-flex;width:1.75rem;height:1.75rem;align-items:center;justify-content:center;border-radius:999px;background:#eef6eb;color:#3f9f2e;font-weight:800}.forensic-sequence-card-head h3{margin:.25rem 0 0;color:#1a1c1a;font-size:1.125rem}
    .forensic-sequence-card-body{min-width:0;max-width:100%;overflow:hidden}.forensic-sequence-card-body :where(img,video,object,embed,canvas,svg){display:block;max-width:100%!important;height:auto!important}.forensic-sequence-card-body :where(iframe){display:block;width:100%;max-width:100%!important}.forensic-sequence-card-body :where(table){width:100%!important;max-width:100%;table-layout:fixed}
    .forensic-sequence-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin-top:1rem;border-top:1px solid #d9dad9;padding-top:1rem}.forensic-sequence-actions p{margin:0;color:#606762;font-size:.75rem}.forensic-sequence-actions div{display:flex;flex-wrap:wrap;gap:.5rem}.forensic-empty{padding:1.25rem;color:#414942}.forensic-assessment-reader{max-width:72rem}.forensic-reader-surface .quiz-detail-surface{border-color:#d9dad9;background:#fff;color:#1a1c1a;box-shadow:0 2px 8px rgba(0,0,0,.08)}
    .forensic-sequence-card[data-progress-state="locked"] .forensic-sequence-card-head,.forensic-sequence-card[data-progress-state="locked"] .forensic-sequence-card-body{filter:blur(3px);pointer-events:none;user-select:none;opacity:.72}.forensic-sequence-card[data-progress-state="locked"]{position:relative}.forensic-sequence-card[data-progress-state="locked"] .forensic-sequence-actions{position:relative;z-index:2;background:#fff}
    .forensic-reader-surface .reader-html,.forensic-reader-surface .reader-text,.forensic-reader-surface .reader-document,.forensic-reader-surface .assignment-handoff,.forensic-reader-surface .quiz-shell,.forensic-reader-surface [data-testid^="renderer-"],.forensic-reader-surface [data-testid="chapter-lesson-card"],.forensic-reader-surface [data-testid="quick-checkpoints"],.forensic-reader-surface [data-testid="mark-complete-panel"]{background:#fff!important;border-color:#d9dad9!important;color:#1a1c1a!important;box-shadow:0 2px 8px rgba(0,0,0,.08)!important}
    .forensic-reader-surface h1,.forensic-reader-surface h2,.forensic-reader-surface h3,.forensic-reader-surface h4,.forensic-reader-surface strong,.forensic-reader-surface [class*="text-[#f3f4f6]"],.forensic-reader-surface [class*="text-[#f8fafc]"],.forensic-reader-surface [class*="text-[#dce6fb]"]{color:#1a1c1a!important}.forensic-reader-surface p,.forensic-reader-surface li,.forensic-reader-surface td,.forensic-reader-surface [class*="text-[#cbd5e1]"],.forensic-reader-surface [class*="text-[#a8b4ca]"],.forensic-reader-surface [class*="text-[#b8b2a8]"],.forensic-reader-surface [class*="text-[#c2cce0]"]{color:#414942!important}
    .forensic-reader-surface [class*="bg-[#0f172a]"],.forensic-reader-surface [class*="bg-white/[0.02]"],.forensic-reader-surface [class*="bg-white/[0.04]"]{background:#f9f9f8!important}.forensic-reader-surface [class*="border-white"],.forensic-reader-surface [class*="border-[#2b3445]"]{border-color:#d9dad9!important}
    .forensic-reader-surface .reader-html{background:#fff!important}.forensic-reader-surface .reader-html table{background:#fff!important}.forensic-reader-surface .reader-html th{background:#f3f4f3!important;color:#1a1c1a!important}.forensic-reader-surface .reader-html a,.forensic-reader-surface .document-link{color:#1e6d0d!important}.forensic-reader-surface .reader-html :where(section,article,aside,main,header,footer,div){background:#fff!important;color:#414942!important;box-shadow:none!important}.forensic-reader-surface .reader-html :where(h1,h2,h3,h4,h5,h6,strong,b){color:#1a1c1a!important}.forensic-reader-surface .reader-html :where(p,li,span,td,th,label,small){color:#414942!important}.forensic-reader-surface .reader-html :where([style*="background"],[style*="color"]){background:#fff!important;color:#414942!important}
    .forensic-app .quiz-detail-surface .quiz-eyebrow,.forensic-app .quiz-detail-surface .quiz-meta-block span,.forensic-app .quiz-detail-surface .quiz-question-number,.forensic-app .quiz-detail-surface .quiz-breakdown-name{color:#3f9f2e!important}.forensic-app .quiz-detail-surface .quiz-page-title,.forensic-app .quiz-detail-surface .quiz-evaluation-copy h5,.forensic-app .quiz-detail-surface .quiz-breakdown-title,.forensic-app .quiz-detail-surface .quiz-section-breakdown h5,.forensic-app .quiz-detail-surface .quiz-question,.forensic-app .quiz-detail-surface .quiz-breakdown-score,.forensic-app .quiz-detail-surface .quiz-section-score{color:#1a1c1a!important}
    .forensic-app .quiz-detail-surface .quiz-meta-row,.forensic-app .quiz-detail-surface .quiz-evaluation-panel,.forensic-app .quiz-detail-surface .quiz-section-button,.forensic-app .quiz-detail-surface .quiz-breakdown-item{border-color:#d9dad9!important;background:#f9f9f8!important}.forensic-app .quiz-detail-surface .quiz-progress,.forensic-app .quiz-detail-surface .quiz-breakdown-progress{background:#d9dad9!important}.forensic-app .quiz-detail-surface .quiz-progress-bar,.forensic-app .quiz-detail-surface .quiz-breakdown-progress span{background:#59A844!important}.forensic-app .quiz-detail-surface .quiz-evaluation-score strong{color:#59A844!important}.forensic-app .quiz-detail-surface .quiz-evaluation-status{color:#ba1a1a!important}
    .forensic-app .quiz-detail-surface .quiz-action{border-color:#d9dad9!important;background:#fff!important;color:#3c3f3e!important}.forensic-app .quiz-detail-surface .quiz-action.primary{border-color:#59A844!important;background:#59A844!important;color:#fff!important}.forensic-app .quiz-detail-surface .quiz-action:hover:not(:disabled){border-color:#c3c8c1!important;background:#eceeec!important;color:#1a1c1a!important}.forensic-app .quiz-detail-surface .quiz-action.primary:hover:not(:disabled){border-color:#4b8d39!important;background:#4b8d39!important;color:#fff!important}
    .forensic-app .quiz-detail-surface .quiz-choice{border-color:#d9dad9!important;background:#fff!important;color:#414942!important}.forensic-app .quiz-detail-surface .quiz-choice:hover:not(:disabled){border-color:#c3c8c1!important;background:#f9f9f8!important;color:#1a1c1a!important}.forensic-app .quiz-detail-surface .quiz-choice.selected,.forensic-app .quiz-detail-surface .quiz-choice.correct{border-color:#59A844!important;background:#eef6eb!important;color:#1a1c1a!important}.forensic-app .quiz-detail-surface .quiz-choice.incorrect{border-color:#ba1a1a!important;background:#fff1ee!important;color:#1a1c1a!important}.forensic-app .quiz-detail-surface .quiz-choice.selected .quiz-choice-letter,.forensic-app .quiz-detail-surface .quiz-choice.correct .quiz-choice-letter{border-color:#59A844!important;background:#59A844!important;color:#fff!important}.forensic-app .quiz-detail-surface .quiz-choice.incorrect .quiz-choice-letter{border-color:#ba1a1a!important;background:#ba1a1a!important;color:#fff!important}
    .forensic-app .assignment-handoff,.forensic-app .assignment-embed-frame-wrap,.forensic-app .assignment-workspace-shell,.forensic-app .assignment-workspace-panel,.forensic-app .interactive-assignment,.forensic-app .lab-shell,.forensic-app .lab-panel{border-color:#d9dad9!important;background:#fff!important;color:#1a1c1a!important;box-shadow:0 2px 8px rgba(0,0,0,.08)!important}.forensic-app .assignment-handoff *,.forensic-app .assignment-workspace-shell *,.forensic-app .interactive-assignment *,.forensic-app .lab-shell *{border-color:#d9dad9}
    .forensic-app .assignment-handoff h1,.forensic-app .assignment-handoff h2,.forensic-app .assignment-handoff h3,.forensic-app .assignment-handoff h4,.forensic-app .assignment-handoff h5,.forensic-app .assignment-handoff strong,.forensic-app .assignment-workspace-shell h1,.forensic-app .assignment-workspace-shell h2,.forensic-app .assignment-workspace-shell h3,.forensic-app .assignment-workspace-shell h4,.forensic-app .interactive-assignment h1,.forensic-app .interactive-assignment h2,.forensic-app .interactive-assignment h3,.forensic-app .interactive-assignment h4,.forensic-app .lab-shell h1,.forensic-app .lab-shell h2,.forensic-app .lab-shell h3,.forensic-app .lab-shell h4{color:#1a1c1a!important}
    .forensic-app .assignment-handoff p,.forensic-app .assignment-handoff li,.forensic-app .assignment-handoff span,.forensic-app .assignment-workspace-shell p,.forensic-app .assignment-workspace-shell li,.forensic-app .assignment-workspace-shell span,.forensic-app .interactive-assignment p,.forensic-app .interactive-assignment li,.forensic-app .interactive-assignment span,.forensic-app .lab-shell p,.forensic-app .lab-shell li,.forensic-app .lab-shell span{color:#414942!important}
    .forensic-app .assignment-handoff-label,.forensic-app .assignment-handoff .reader-eyebrow,.forensic-app .assignment-workspace-shell [class*="label"],.forensic-app .interactive-assignment [class*="label"],.forensic-app .lab-shell [class*="label"]{color:#3f9f2e!important}.forensic-app .assignment-handoff-state,.forensic-app .assignment-handoff-note,.forensic-app .assignment-handoff-footnote,.forensic-app .assignment-workspace-shell [class*="note"],.forensic-app .assignment-workspace-shell [class*="callout"],.forensic-app .interactive-assignment [class*="note"],.forensic-app .interactive-assignment [class*="callout"],.forensic-app .lab-shell [class*="note"],.forensic-app .lab-shell [class*="callout"]{border-color:#d9dad9!important;background:#f9f9f8!important;color:#414942!important}
    .forensic-app .assignment-link,.forensic-app .assignment-handoff a.assignment-link,.forensic-app .assignment-handoff button,.forensic-app .assignment-workspace-shell button,.forensic-app .interactive-assignment button,.forensic-app .lab-shell button{border-color:#59A844!important;background:#59A844!important;color:#fff!important;border-radius:.375rem!important}.forensic-app .assignment-link:hover,.forensic-app .assignment-handoff button:hover,.forensic-app .assignment-workspace-shell button:hover,.forensic-app .interactive-assignment button:hover,.forensic-app .lab-shell button:hover{border-color:#4b8d39!important;background:#4b8d39!important;color:#fff!important}.forensic-app .assignment-link.secondary,.forensic-app .assignment-handoff button.secondary,.forensic-app .assignment-workspace-shell button.secondary,.forensic-app .interactive-assignment button.secondary,.forensic-app .lab-shell button.secondary{border-color:#d9dad9!important;background:#fff!important;color:#3c3f3e!important}
    .forensic-assignment-reader .forensic-assignment-body{margin-top:1rem;border:1px solid #d9dad9;border-radius:.5rem;background:#fff;padding:1rem;box-shadow:0 2px 8px rgba(0,0,0,.08)}.forensic-assignment-reader .forensic-assignment-body,.forensic-assignment-reader .forensic-assignment-body :where(div,p,span,li,label,small,td,th){color:#414942!important}.forensic-assignment-reader .forensic-assignment-body :where(h1,h2,h3,h4,h5,h6,strong,b){color:#1a1c1a!important}.forensic-assignment-reader .forensic-assignment-body :where(section,article,aside,header,footer,main,div){background-color:transparent!important}.forensic-assignment-reader .forensic-assignment-body :where(.assignment-handoff,.assignment-handoff-state,.assignment-handoff-note,.assignment-handoff-footnote,.assignment-embed-frame-wrap,.assignment-workspace-shell,.assignment-workspace-panel,.interactive-assignment,.lab-shell,.lab-panel){background:#fff!important;border-color:#d9dad9!important;color:#414942!important;box-shadow:none!important}.forensic-assignment-reader .forensic-assignment-body :where([style*="color"]){color:#414942!important}.forensic-assignment-reader .forensic-assignment-body :where(h1[style*="color"],h2[style*="color"],h3[style*="color"],h4[style*="color"],h5[style*="color"],strong[style*="color"],b[style*="color"]){color:#1a1c1a!important}.forensic-assignment-reader .forensic-assignment-body :where(button,a.assignment-link){border-color:#59A844!important;background:#59A844!important;color:#fff!important}
    .forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-label{color:#3f9f2e!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-head h5{color:#1a1c1a!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-summary,.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-footnote{color:#414942!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-note{background:#f9f9f8!important;border-color:#d9dad9!important;color:#414942!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-note strong{color:#1a1c1a!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-note span{color:#414942!important}.forensic-app .forensic-assignment-reader .forensic-assignment-body .assignment-handoff .assignment-handoff-state{background:#fff!important;border-color:#d9dad9!important;color:#3c3f3e!important}
    @media (min-width:768px){.forensic-coursework-card{grid-template-columns:minmax(0,1fr) minmax(240px,.45fr)}.forensic-module-grid,.forensic-assessment-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media (min-width:1024px){.forensic-layout{height:100vh;overflow:hidden;flex-direction:row}.forensic-sidebar{z-index:0;display:flex;width:260px;height:100vh;flex-direction:column;overflow:hidden;border-right:1px solid #303332;border-bottom:0}.forensic-main{height:100vh;overflow-y:auto}.forensic-layout.menu-collapsed .forensic-sidebar{width:4rem}.forensic-mobile-menu-toggle{display:none}.forensic-desktop-menu-toggle{display:flex}.forensic-layout.menu-collapsed .forensic-brand,.forensic-layout.menu-collapsed .forensic-sidebar-progress,.forensic-layout.menu-collapsed .forensic-sidebar-body{display:none}.forensic-layout.menu-collapsed .forensic-brand-row{justify-content:center}.forensic-sidebar-body{display:grid}.forensic-library,.forensic-reader-surface{padding:2.5rem 2rem}}
  `;
  document.head.appendChild(style);
}
function render() {
  renderForensics35Shell();
}

function injectStyles() {
  if (document.getElementById("ep-shell-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "ep-shell-style";
  style.textContent = `
    :root {
      --bg: #121110;
      --bg-elevated: #1b1917;
      --bg-sidebar: #171513;
      --bg-subtle: #24211e;
      --paper: #f4efe6;
      --paper-line: #d7cebf;
      --paper-soft: #ebe2d2;
      --text: #eee7dc;
      --text-strong: #fff9f0;
      --text-body: #2f2a24;
      --muted: #b8aea1;
      --muted-strong: #d0c5b7;
      --accent: #a35a45;
      --accent-soft: #c28d79;
      --line: #34302b;
      --line-strong: #6f4337;
      --focus: rgba(194, 141, 121, 0.45);
      --shadow: 0 2px 10px rgba(0, 0, 0, 0.24);
    }

    * { box-sizing: border-box; }

    html, body {
      margin: 0;
      min-height: 100%;
      background: var(--bg);
      color: var(--text);
      font-family: "IBM Plex Sans", "Avenir Next", "Helvetica Neue", sans-serif;
    }

    body {
      line-height: 1.45;
    }

    .app {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 300px minmax(0, 1fr);
      transition: grid-template-columns 0.16s ease;
    }

    .app.sidebar-hidden {
      grid-template-columns: 0 minmax(0, 1fr);
    }

    .sidebar {
      border-right: 1px solid var(--line);
      background: var(--bg-sidebar);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      width: 300px;
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
      padding: 1rem 1rem 0.95rem;
      border-bottom: 1px solid var(--line);
    }

    .brand h1 {
      margin: 0;
      font-size: 1rem;
      line-height: 1.35;
      font-weight: 700;
      color: var(--text-strong);
    }

    .brand-note {
      margin: 0.5rem 0 0;
      font-size: 0.76rem;
      line-height: 1.45;
      color: var(--muted);
      max-width: 28ch;
    }

    .side-nav-ghost {
      margin: 0.72rem 0.72rem 0.58rem;
      display: grid;
      gap: 0.26rem;
      border-bottom: 1px solid var(--line);
      padding-bottom: 0.64rem;
    }

    .side-nav-item {
      border: 1px solid #323238;
      border-radius: 7px;
      background: #1c1c20;
      color: #9e9ba1;
      text-align: left;
      padding: 0.44rem 0.56rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-size: 0.66rem;
      font-weight: 700;
      font-family: "Space Grotesk", "IBM Plex Sans", sans-serif;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .side-nav-item:hover {
      border-color: #534c50;
      color: #cec3c1;
      background: #232329;
    }

    .side-nav-item.active {
      background: rgba(163, 90, 69, 0.35);
      border-color: rgba(194, 141, 121, 0.4);
      color: #f2d1c8;
    }

    .module-list {
      padding: 0.75rem;
      overflow: auto;
      min-height: 0;
      flex: 1 1 auto;
      display: grid;
      gap: 0.42rem;
      align-content: start;
    }

    .library-list {
      padding: 0.75rem;
      overflow: auto;
      min-height: 0;
      flex: 1 1 auto;
      display: grid;
      gap: 0.74rem;
      align-content: start;
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
      color: var(--accent-soft);
      font-family: "Space Grotesk", "IBM Plex Sans", sans-serif;
      font-weight: 700;
    }

    .library-module-block {
      border: 1px solid var(--line);
      border-radius: 10px;
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
      font-family: "Space Grotesk", "IBM Plex Sans", sans-serif;
      font-weight: 700;
    }

    .library-module-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.45rem;
    }

    .library-lock-chip {
      border: 1px solid #5f5348;
      border-radius: 999px;
      padding: 0.12rem 0.44rem;
      font-size: 0.62rem;
      line-height: 1.2;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      white-space: nowrap;
    }

    .library-lock-chip.unlocked {
      border-color: #3e715c;
      background: #1f3b30;
      color: #b8ead4;
    }

    .library-lock-chip.locked {
      border-color: #665145;
      background: #3a2a24;
      color: #efcabf;
    }

    .library-module-items {
      display: grid;
      gap: 0.32rem;
    }

    .library-lock-note {
      margin: 0;
      font-size: 0.68rem;
      line-height: 1.45;
      color: var(--muted);
    }

    .library-empty {
      border: 1px dashed #454048;
      border-radius: 8px;
      background: #1a1a1f;
      color: #9f9494;
      padding: 0.55rem;
      font-size: 0.74rem;
      text-align: center;
    }

    .module-card {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--bg-elevated);
      overflow: hidden;
    }

    .module-card.expanded {
      border-color: var(--line-strong);
      background: #241d1a;
    }

    .module-card.selected:not(.expanded) {
      border-color: #5a4c44;
    }

    .module-btn {
      width: 100%;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text);
      text-align: left;
      padding: 0.7rem;
      cursor: pointer;
      transition: background 0.16s ease, color 0.16s ease;
    }

    .module-btn:hover {
      background: #211f1c;
    }

    .module-btn.expanded,
    .module-btn.selected {
      background: transparent;
    }

    .module-kicker {
      margin: 0 0 0.22rem;
      font-size: 0.71rem;
      line-height: 1.35;
      color: var(--accent-soft);
    }

    .module-btn h3 {
      margin: 0;
      font-size: 0.84rem;
      line-height: 1.4;
      font-weight: 700;
      color: var(--text-strong);
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
      border-radius: 7px;
      background: #211e1b;
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
      border-radius: 999px;
      background: #2a2521;
      overflow: hidden;
    }

    .module-progress-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--accent);
    }

    .module-dropdown {
      border-top: 1px solid var(--line);
      padding: 0.58rem;
      display: grid;
      gap: 0.46rem;
      max-height: none;
      overflow: visible;
      background: #1a1816;
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
      border-radius: 8px;
      background: #211d1a;
      color: var(--muted-strong);
      padding: 0.42rem 0.62rem;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease, color 0.16s ease;
    }

    .module-view-btn:hover {
      border-color: #53483f;
      color: var(--text-strong);
    }

    .module-view-btn.active {
      border-color: var(--line-strong);
      background: #2b221e;
      color: var(--text-strong);
    }

    .module-view-btn:disabled {
      cursor: not-allowed;
      opacity: 0.55;
      color: var(--muted);
    }

    .release-condition-card {
      border: 1px dashed #58473e;
      border-radius: 8px;
      background: #221d1a;
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
      border-top: 1px solid #2b2723;
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

    .module-item-btn,
    .library-item-btn {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--bg-subtle);
      color: var(--text);
      text-align: left;
      padding: 0.54rem 0.58rem;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease;
    }

    .module-item-btn:hover,
    .library-item-btn:hover {
      border-color: #474039;
      background: #2a2622;
    }

    .module-item-btn.active,
    .library-item-btn.active {
      border-color: var(--line-strong);
      background: #332823;
    }

    .module-item-btn.locked,
    .library-item-btn.locked {
      opacity: 0.5;
      cursor: not-allowed;
      background: #1f1d1c;
      border-color: #3a3531;
      color: #a59b91;
    }

    .module-btn:focus-visible,
    .module-item-btn:focus-visible,
    .library-item-btn:focus-visible,
    .side-nav-item:focus-visible,
    .subgroup-toggle:focus-visible,
    .sidebar-toggle:focus-visible,
    .theme-toggle-button:focus-visible,
    .quiz-nav-btn:focus-visible,
    .quiz-section-button:focus-visible,
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
    }

    .topbar {
      z-index: 8;
      border-bottom: 1px solid var(--line);
      background: #161412;
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
      border-radius: 8px;
      border: 1px solid var(--line);
      background: #211e1b;
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
      border-color: #49423b;
      background: #2a2622;
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
    }

    .topbar h2 {
      margin: 0.12rem 0 0;
      font-size: clamp(1.05rem, 2vw, 1.35rem);
      line-height: 1.3;
      font-weight: 700;
      color: var(--text-strong);
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
      flex-shrink: 0;
    }

    .theme-toggle-button {
      border: 0;
      border-right: 1px solid var(--line);
      background: transparent;
      color: var(--muted-strong);
      min-height: 2rem;
      padding: 0.34rem 0.58rem;
      font-size: 0.72rem;
      line-height: 1.1;
      font-weight: 800;
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
      border-radius: 8px;
      padding: 0.34rem 0.56rem;
      font-size: 0.73rem;
      font-weight: 600;
      color: var(--muted);
      background: #211e1b;
      white-space: nowrap;
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
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 10px;
      background: var(--bg-elevated);
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .item-title {
      font-size: 0.8rem;
      line-height: 1.4;
      font-weight: 700;
      color: var(--text-strong);
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

    .item-complete {
      border: 1px solid #6c5a4c;
      border-radius: 999px;
      padding: 0.12rem 0.4rem;
      font-size: 0.62rem;
      line-height: 1.2;
      color: #e8dac9;
      background: #3a2f29;
      white-space: nowrap;
      flex-shrink: 0;
      margin-top: 0.02rem;
    }

    .reader-card {
      height: 100%;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
    }

    .reader-head {
      border-bottom: 1px solid var(--line);
      padding: 0.8rem 0.9rem;
      background: #211d1a;
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
    }

    .html-reader-content {
      padding-top: 1rem;
    }

    .reader-html,
    .reader-text,
    .reader-document,
    .assignment-handoff,
    .quiz-shell {
      background: var(--paper);
      border: 1px solid var(--paper-line);
      border-radius: 8px;
      color: var(--text-body);
      padding: 1.1rem 1.15rem;
      max-width: 860px;
      margin: 0 auto;
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
      color: #414942;
    }

    .assignment-embed-shell .assignment-handoff-label {
      color: #3f9f2e !important;
    }

    .assignment-embed-shell .assignment-handoff-head h5 {
      color: #1a1c1a !important;
    }

    .assignment-embed-shell .assignment-handoff-state {
      background: #fff;
      border-color: #d9dad9;
      color: #3c3f3e;
    }

    .assignment-embed-shell .assignment-handoff-summary,
    .assignment-embed-shell .assignment-handoff-footnote {
      color: #414942 !important;
    }

    .assignment-embed-shell .assignment-handoff-note {
      background: #f9f9f8;
      border-color: #d9dad9;
      color: #414942;
    }

    .assignment-embed-shell .assignment-handoff-note strong {
      color: #1a1c1a;
    }

    .assignment-embed-shell .assignment-handoff-note span {
      color: #414942;
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
      border-radius: 7px;
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
      border-radius: 8px;
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
      border: 1px solid #d8cbbe;
      border-radius: 16px;
      background: #f7efe5;
      padding: 0.85rem;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
    }

    .assignment-embed-frame {
      width: 100%;
      height: 1100px;
      min-height: 980px;
      border: 1px solid #d6c7b7;
      border-radius: 12px;
      background: #ffffff;
      display: block;
    }

    .assignment-link,
    .quiz-action,
    .quiz-nav-btn,
    .quiz-choice {
      border: 1px solid #d0c3b3;
      border-radius: 8px;
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
      background: #7d493b;
      border-color: #7d493b;
      color: #fff7f0;
    }

    .assignment-link.primary:hover,
    .quiz-action.primary:hover {
      background: #6b3f34;
      border-color: #6b3f34;
      color: #fff7f0;
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
      border-radius: 8px;
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
      border-radius: 7px;
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
      border-radius: 8px;
      background: #fffdfa;
      padding: 1rem;
    }

    .quiz-question {
      font-size: 1rem;
      line-height: 1.65;
      color: #312822;
      font-weight: 600;
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
      border-radius: 8px;
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
      gap: 1.5rem;
    }

    .quiz-header {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 1.2rem;
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
      gap: 1rem;
      align-items: center;
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #f9f9f8;
      padding: 1rem;
    }

    .quiz-evaluation-copy h5 {
      margin: 0;
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 800;
      color: #1a1c1a;
    }

    .quiz-evaluation-copy p {
      margin: 0.55rem 0 0;
      max-width: 38rem;
      color: #5f6660;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    .quiz-evaluation-score {
      text-align: left;
    }

    .quiz-evaluation-score strong {
      display: block;
      color: #59A844;
      font-size: 3rem;
      line-height: 0.95;
      font-weight: 800;
    }

    .quiz-evaluation-score small {
      color: #1a1c1a;
      font-size: 0.56em;
    }

    .quiz-evaluation-status {
      display: block;
      margin-top: 0.4rem;
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

    .quiz-section-breakdown {
      border-top: 1px solid #d9dad9;
      padding-top: 0.5rem;
    }

    .quiz-section-breakdown h5 {
      margin: 0;
      color: #1a1c1a;
      font-size: 1.5rem;
      line-height: 1.2;
      font-weight: 800;
    }

    .quiz-section-list {
      display: grid;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .quiz-section-button {
      width: 100%;
      display: grid;
      gap: 0.5rem;
      border: 1px solid #d9dad9;
      border-radius: 8px;
      background: #f3f4f3;
      color: #1a1c1a;
      padding: 1rem;
      text-align: left;
      cursor: pointer;
    }

    .quiz-section-button:hover {
      border-color: #c3c8c1;
      background: #f9f9f8;
    }

    .quiz-section-label {
      display: block;
      color: #1a1c1a;
      font-size: 0.9rem;
      line-height: 1.35;
      font-weight: 800;
    }

    .quiz-section-range {
      display: block;
      margin-top: 0.25rem;
      color: #5f6660;
      font-size: 0.7rem;
      line-height: 1.35;
      font-weight: 800;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }

    .quiz-section-score {
      color: #1a1c1a;
      font-size: 0.9rem;
      font-weight: 800;
    }

    .quiz-question-list {
      display: grid;
      gap: 1rem;
    }

    .quiz-question-row {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    .quiz-question-grid {
      display: grid;
      gap: 0.9rem;
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

      .quiz-question-grid {
        grid-template-columns: auto minmax(0, 1fr);
      }

      .quiz-section-button {
        grid-template-columns: minmax(0, 1fr) auto;
        align-items: center;
      }
    }

    .lesson-completion-card {
      margin: 0.9rem auto 0;
      max-width: 860px;
      border: 1px solid #d8ccbe;
      border-radius: 8px;
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
      border-radius: 8px;
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
      border-radius: 8px;
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
      border-radius: 8px;
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
      --paper: var(--ns-surface-lowest);
      --paper-line: var(--ns-outline-variant);
      --paper-soft: var(--ns-surface-highest);
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
    .app.next-step-theme .theme-toggle,
    .app.next-step-theme .stat {
      border-color: var(--ns-outline-variant);
      background: var(--ns-surface-low);
      color: var(--ns-on-surface-variant);
    }

    .app.next-step-theme .sidebar-toggle:hover,
    .app.next-step-theme .theme-toggle-button:hover {
      border-color: var(--ns-outline);
      background: var(--ns-surface-container);
      color: var(--ns-on-surface);
    }

    .app.next-step-theme .sidebar-toggle span {
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
      box-shadow: var(--shadow);
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
    .app.next-step-theme .quiz-detail-surface .quiz-section-breakdown h5,
    .app.next-step-theme .quiz-detail-surface .quiz-section-label,
    .app.next-step-theme .quiz-detail-surface .quiz-section-score,
    .app.next-step-theme .quiz-detail-surface .quiz-question {
      color: #1a1c1a;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-meta-row,
    .app.next-step-theme .quiz-detail-surface .quiz-evaluation-panel,
    .app.next-step-theme .quiz-detail-surface .quiz-section-button {
      border-color: #d9dad9;
      background: #f9f9f8;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-section-breakdown {
      border-color: #d9dad9;
    }

    .app.next-step-theme .quiz-detail-surface .quiz-section-range {
      color: #5f6660;
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

    @media (max-width: 860px) {
      .app {
        grid-template-columns: 1fr;
      }

      .app.sidebar-hidden {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: relative;
        min-height: auto;
        width: auto;
        border-right: 0;
        border-bottom: 1px solid var(--line);
        opacity: 1;
        pointer-events: auto;
      }

      .app.sidebar-hidden .sidebar {
        display: none;
      }

      .module-list {
        overflow: visible;
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
        border-radius: 12px;
      }

      .assignment-embed-frame {
        min-height: 1180px;
        border-radius: 10px;
      }

      .lesson-completion-card {
        align-items: stretch;
      }

      .lesson-completion-actions {
        width: 100%;
      }

      .lesson-completion-btn,
      .lesson-next-btn {
        width: 100%;
      }
    }

    @media (max-width: 560px) {
      .brand {
        padding: 0.9rem 0.9rem 0.85rem;
      }

      .module-list {
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
        min-height: 1380px;
      }
    }
  `;

  document.head.appendChild(style);
}
