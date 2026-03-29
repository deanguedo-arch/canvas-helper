import courseShellData from "./course-shell-data.js";
import assessmentDelivery from "./assessment-delivery.js";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.worker.mjs";

const STORAGE_KEY = `${courseShellData.storageKey}::assessment-layout::v5`;
const root = document.getElementById("root");
const assessmentDeliveryByActivityId = new Map(assessmentDelivery.map((entry) => [entry.activityId, entry]));

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
render();

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      selectedModuleId: typeof parsed.selectedModuleId === "string" ? parsed.selectedModuleId : "",
      expandedModuleId: typeof parsed.expandedModuleId === "string" ? parsed.expandedModuleId : "",
      sidebarHidden: Boolean(parsed.sidebarHidden),
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
      collapsedSectionByKey: {},
      selectedByBucket: {},
      moduleViewByModuleId: {},
      completedActivityById: {},
      quizDraftByActivityId: {}
    };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
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

  state.selectedModuleId = moduleId;
  state.expandedModuleId = moduleId;
  if (!state.moduleViewByModuleId[moduleId]) {
    state.moduleViewByModuleId[moduleId] = "content";
  }
  saveState();
  render();
}

function toggleSidebar() {
  state.sidebarHidden = !state.sidebarHidden;
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
      /Complete Assignment 2 that covers the concepts learned in Section 3 and Section 4\.\s*When you have received feedback from your teacher, you will be provided with access to the Module 1 Assessment\. Complete the assessment when you are ready \(you do not need to complete the first assessment before moving on to Module 2\)\./gi,
      "Complete Assignment 2 that covers the concepts learned in Section 3 and Section 4 in this module."
    )
    .replace(
      /Using Sections 1 and 2 as your guide, complete Assignment 3\.\s*Once you have completed Assignment 3, upload it to Brightspace and then continue on with Section 3\./gi,
      "Using Sections 1 and 2 as your guide, complete Assignment 3 in this module, then continue on with Section 3."
    )
    .replace(
      /Using Section 3 and Section 4 as a\s+guideline, complete Assignment 4\.\s*When you have completed the assignment, upload it to Brightspace\.\s*Once you receive feedback you will be given access to the Module 2 Assessment\. You do not need to complete this assessment before moving on with Module 3\./gi,
      "Using Section 3 and Section 4 as a guideline, complete Assignment 4 in this module."
    )
    .replace(
      /Using the information in Section 1 and Section 2, complete Assignment 5\.\s*When you\s+have completed the assignment, submit it on Brightspace, then continue with Section 3\./gi,
      "Using the information in Section 1 and Section 2, complete Assignment 5 in this module, then continue with Section 3."
    )
    .replace(
      /Using content from Section 3 and Section 4 you can complete Assignment 6\.\s*When you are done, submit your assignment to Brightspace\.\s*Once you receive feedback from your teacher, you will be given access to the Module 3 Assessment\./gi,
      "Using content from Section 3 and Section 4, complete Assignment 6 in this module."
    )
    .replace(/upload it to Brightspace/gi, "complete it in this module")
    .replace(/submit your assignment to Brightspace/gi, "complete your assignment in this module")
    .replace(/submit it on Brightspace/gi, "complete it in this module")
    .replace(/teacher can provide feedback/gi, "you can keep working through the module")
    .replace(/While waiting for feedback/gi, "After that")
    .replace(/When you have received feedback from your teacher, you will be provided with access to the Module \d+ Assessment\./gi, "")
    .replace(/Once you receive feedback from your teacher, you will be given access to the Module \d+ Assessment\./gi, "")
    .replace(/Once you receive feedback you will be given access to the Module \d+ Assessment\./gi, "")
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

function activityMetaLabel(activity) {
  const delivery = getAssessmentDelivery(activity);
  if (delivery?.deliveryMode === "workspace-quiz") {
    return "Workspace quiz";
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
  return !delivery || delivery.deliveryMode === "workspace-quiz";
}

function shouldHideActivityFromModuleList(module, activity) {
  const moduleTitle = String(module?.title || "");
  const sectionTitle = String(activity?.sectionTitle || "");
  const activityTitle = String(activity?.title || "");

  if (moduleTitle !== "Module 2: Statistics" || sectionTitle !== "Section 1: Measurements") {
    return false;
  }

  return [
    "Means, Modes, and Other Measures of Central Tendancy",
    "Mode, Median, and Mean",
    "Measures of Variability",
    "Practice with Percentiles",
    "Normal vs. Abnormal",
    "Reliability and Validity"
  ].includes(activityTitle);
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

function renderQuiz(activity, quizData) {
  const questions = quizData?.quizQuestions || [];
  if (!questions.length) {
    return `<div class="reader-text">${renderTextContent(activity.description || "No quiz questions were found.")}</div>`;
  }

  const draft = getQuizDraft(activity.id, questions.length);
  const activeQuestion = questions[draft.questionIndex] || questions[0];
  const activeQuestionId = activeQuestion?.id || "";
  const selectedAnswer = draft.answersByQuestion[activeQuestionId];
  const revealed = Boolean(draft.revealedByQuestion[activeQuestionId]);
  const answeredCount = questions.filter((question) => Number.isInteger(draft.answersByQuestion[question.id])).length;
  const correctCount = questions.filter((question) => draft.answersByQuestion[question.id] === question.answerIndex).length;
  const progress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const isCorrect = selectedAnswer === activeQuestion?.answerIndex;

  return `
    <div class="quiz-shell" data-quiz-id="${escapeHtml(activity.id)}">
      <div class="quiz-toolbar">
        <div class="quiz-toolbar-copy">
          <div class="quiz-label">${escapeHtml(quizData.quizMeta?.profile || "Assessment")}</div>
          <h5>${escapeHtml(activity.title)}</h5>
        </div>
        <div class="quiz-stats">
          <span class="quiz-stat">${questions.length} questions</span>
          <span class="quiz-stat">${answeredCount}/${questions.length} answered</span>
          <span class="quiz-stat">${correctCount}/${questions.length} correct</span>
        </div>
      </div>
      <div class="quiz-progress">
        <div class="quiz-progress-bar" style="width: ${progress}%;"></div>
      </div>
      ${
        questions.length > 1
          ? `
        <div class="quiz-nav">
          ${questions
            .map(
              (question, index) => `
            <button
              class="quiz-nav-btn ${index === draft.questionIndex ? "active" : ""}"
              type="button"
              data-quiz-question="${escapeHtml(activity.id)}"
              data-question-index="${index}"
            >
              Q${index + 1}${Number.isInteger(draft.answersByQuestion[question.id]) ? " •" : ""}
            </button>
          `
            )
            .join("")}
        </div>
      `
          : ""
      }
      <div class="quiz-card">
        <div class="quiz-question">${escapeHtml(activeQuestion?.question || "No quiz question parsed.")}</div>
        <div class="quiz-choices">
          ${(activeQuestion?.choices || [])
            .map(
              (choice, index) => `
            <button
              class="quiz-choice ${selectedAnswer === index ? "selected" : ""}"
              type="button"
              data-quiz-choice="${escapeHtml(activity.id)}"
              data-question-id="${escapeHtml(activeQuestionId)}"
              data-choice-index="${index}"
            >
              ${escapeHtml(choice)}
            </button>
          `
            )
            .join("")}
        </div>
        <div class="quiz-actions">
          <button class="quiz-action primary" type="button" data-quiz-check="${escapeHtml(activity.id)}">Check answer</button>
          <button class="quiz-action" type="button" data-quiz-clear="${escapeHtml(activity.id)}" data-question-id="${escapeHtml(activeQuestionId)}">Clear answer</button>
          <button class="quiz-action" type="button" data-quiz-retake="${escapeHtml(activity.id)}">Retake quiz</button>
          ${
            questions.length > 1
              ? `<button class="quiz-action" type="button" data-quiz-next="${escapeHtml(activity.id)}">Next question</button>`
              : ""
          }
        </div>
        ${
          revealed && Number.isInteger(selectedAnswer)
            ? `
          <div class="quiz-feedback ${isCorrect ? "correct" : "incorrect"}">
            <strong>${isCorrect ? "Correct" : "Not quite yet"}</strong>
            <span>The correct answer is ${escapeHtml(activeQuestion.choices?.[activeQuestion.answerIndex] || "")}.</span>
          </div>
        `
            : ""
        }
      </div>
    </div>
  `;
}

function renderLessonCompletionFooter(activity) {
  if (!activity || isAssignment(activity)) {
    return "";
  }

  const completed = isLessonCompleted(activity.id);
  return `
    <div class="lesson-completion-card">
      <div>
        <strong>${completed ? "Lesson completed" : "Mark this lesson complete"}</strong>
        <span>${completed ? "This lesson now counts toward the module release condition." : "Complete every lesson in the module to unlock the assignments tab."}</span>
      </div>
      <button
        class="lesson-completion-btn ${completed ? "completed" : ""}"
        type="button"
        data-complete-lesson="${escapeHtml(activity.id)}"
        data-completed="${completed ? "true" : "false"}"
      >
        ${completed ? "Completed" : "Mark complete"}
      </button>
    </div>
  `;
}

function renderActivityBody(activity) {
  if (!activity) {
    return `<div class="empty">Select an item to view its content.</div>`;
  }

  const delivery = getAssessmentDelivery(activity);
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
  const counts = moduleCounts(module);
  const { content, assignments } = getModuleBuckets(module);
  const completion = moduleCompletion(module);
  const moduleView = getModuleView(module.id);
  const effectiveModuleView = moduleView === "assignments" ? "assignments" : "content";
  const visibleItems = effectiveModuleView === "assignments" ? assignments : content;
  const selectedItem = expanded
    ? getSelectedActivity(module.id, effectiveModuleView === "assignments" ? "assignments" : "content", visibleItems)
    : null;

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
                  ? `Assignments unlocked`
                  : `Assignments recommended after 100% completion`
                : `No assignments in this module`
            }
          </div>
        </div>
      </button>
      ${
        expanded
          ? `
      <div class="module-dropdown">
        <div class="module-view-switcher">
          <button
            class="module-view-btn ${effectiveModuleView === "content" ? "active" : ""}"
            type="button"
            data-module-view="${escapeHtml(module.id)}"
            data-view="content"
          >
            Content
          </button>
          ${
            assignments.length
              ? `
          <button
            class="module-view-btn ${effectiveModuleView === "assignments" ? "active" : ""}"
            type="button"
            data-module-view="${escapeHtml(module.id)}"
            data-view="assignments"
          >
            Assignments
          </button>
          `
              : ""
          }
        </div>
        ${
          effectiveModuleView === "assignments"
            ? `
        <div class="group-block" data-testid="module-assignments-view">
          ${assignments.length
            ? assignments
                .map((activity) =>
                  renderActivityListItem(module.id, "assignments", activity, selectedItem?.id === activity.id, "module-item-btn")
                )
                .join("")
            : `<div class="empty compact-empty">No assignments.</div>`}
        </div>
        `
            : `
        <div class="group-block" data-testid="module-content-view">
          ${renderContentGroups(module.id, content, selectedItem?.id)}
        </div>
        `
        }
      </div>
    `
          : ""
      }
    </article>
  `;
}

function renderActivityListItem(moduleId, bucket, activity, active, className = "item-btn") {
  const metaLabel = activityMetaLabel(activity);
  const completed = !isAssignment(activity) && isLessonCompleted(activity.id);
  return `
    <button
      class="${className} ${active ? "active" : ""}"
      type="button"
      data-select-activity="${escapeHtml(activity.id)}"
      data-module-id="${escapeHtml(moduleId)}"
      data-bucket="${escapeHtml(bucket)}"
    >
      <div class="item-row">
        <div class="item-title">${escapeHtml(activity.title)}</div>
        ${completed ? `<span class="item-complete">Completed</span>` : ""}
      </div>
      ${metaLabel ? `<div class="item-meta">${escapeHtml(metaLabel)}</div>` : ""}
    </button>
  `;
}

function renderReader(activity) {
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
            <div class="reader-eyebrow">${escapeHtml(prettyKind(activity.kind))}</div>
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
          ${renderLessonCompletionFooter(activity)}
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
  const moduleReaderItems = activeBucket === "assignments" ? buckets.assignments : buckets.content;
  const selectedActivity = module ? getSelectedActivity(module.id, activeBucket, moduleReaderItems) : null;
  const contentCount = courseShellData.modules.reduce(
    (sum, current) => sum + getModuleBuckets(current).content.length,
    0
  );
  const assignmentCount = courseShellData.modules.reduce(
    (sum, current) => sum + getModuleBuckets(current).assignments.length,
    0
  );

  root.innerHTML = `
    <div class="app ${state.sidebarHidden ? "sidebar-hidden" : ""}">
      <aside class="sidebar">
        <div class="brand">
          <h1>Experimental Psychology 30</h1>
          <p class="brand-note">Select a module, then open one lesson or assignment at a time in the reading pane.</p>
        </div>

        <div class="module-list" data-testid="module-list">
          ${courseShellData.modules
            .map((item) => renderModuleButton(item, item.id === state.expandedModuleId, item.id === module?.id))
            .join("")}
        </div>
      </aside>

      <section class="main">
        <header class="topbar">
          <div class="topbar-inner">
            <div class="topbar-main">
              <button
                class="sidebar-toggle"
                type="button"
                data-toggle-sidebar
                aria-label="Toggle module sidebar"
                aria-expanded="${state.sidebarHidden ? "false" : "true"}"
                title="Toggle module sidebar"
              >
                <span></span><span></span><span></span>
              </button>
              <div class="topbar-copy">
                <div class="topbar-kicker">${escapeHtml(module?.overline || "Module")}</div>
                <h2>${escapeHtml(module?.title || "Course")}</h2>
              </div>
            </div>
            <div class="stats">
              <span class="stat"><strong>${courseShellData.stats.moduleCount}</strong><span> modules</span></span>
              <span class="stat"><strong>${contentCount}</strong><span> content items</span></span>
              <span class="stat"><strong>${assignmentCount}</strong><span> assignments</span></span>
            </div>
          </div>
        </header>

        <div class="content">
          ${renderReader(selectedActivity)}
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
        revealedByQuestion: {}
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

    .module-list {
      padding: 0.75rem;
      overflow: auto;
      min-height: 0;
      flex: 1 1 auto;
      display: grid;
      gap: 0.42rem;
      align-content: start;
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

    .module-item-btn {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--bg-subtle);
      color: var(--text);
      text-align: left;
      padding: 0.54rem 0.58rem;
      cursor: pointer;
      transition: border-color 0.16s ease, background 0.16s ease;
    }

    .module-item-btn:hover {
      border-color: #474039;
      background: #2a2622;
    }

    .module-item-btn.active {
      border-color: var(--line-strong);
      background: #332823;
    }

    .module-btn:focus-visible,
    .module-item-btn:focus-visible,
    .subgroup-toggle:focus-visible,
    .sidebar-toggle:focus-visible,
    .quiz-nav-btn:focus-visible,
    .quiz-choice:focus-visible,
    .quiz-action:focus-visible,
    .assignment-link:focus-visible {
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

      .stats {
        width: 100%;
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

      .lesson-completion-card {
        align-items: stretch;
      }

      .lesson-completion-btn {
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
    }
  `;

  document.head.appendChild(style);
}
