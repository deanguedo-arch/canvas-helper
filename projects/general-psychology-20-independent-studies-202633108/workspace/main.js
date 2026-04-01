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
const quizLauncherCacheByActivityId = new Map();
const quizLauncherLoadingByActivityId = new Set();
const quizLauncherErrorByActivityId = new Set();
const conversionStatusByActivityId = new Map();
const conversionStatusLoadingByActivityId = new Set();
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

  if (state.selectedModuleId === moduleId && state.expandedModuleId === moduleId) {
    state.expandedModuleId = "";
    saveState();
    render();
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

  const delivery = getAssessmentDelivery(activity);
  const kind = String(activity?.kind || "").toLowerCase();
  const resourceKind = String(activity?.resourceKind || "").toLowerCase();
  const hasSource = hasSourceHref(activity);
  const embedPath = String(delivery?.embedPath || "").trim();
  const hasLocalWorkspaceEmbed = embedPath.startsWith("./assets/");

  if (delivery?.deliveryMode === "document-handin") {
    return "needs-conversion";
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

  // True converted embedded assignment/lab: local workspace asset integration.
  if (delivery?.deliveryMode === "workspace-embed" && hasLocalWorkspaceEmbed) {
    return "converted";
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

function detectArrayBufferEncoding(bytes, contentType) {
  const declared = getCharsetFromContentType(contentType);
  if (declared) {
    return declared;
  }

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

  return "utf-8";
}

function decodeFetchedArrayBuffer(buffer, contentType = "") {
  const bytes = new Uint8Array(buffer);
  const encoding = detectArrayBufferEncoding(bytes, contentType);
  try {
    return new TextDecoder(encoding).decode(bytes);
  } catch {
    try {
      return new TextDecoder("utf-16le").decode(bytes);
    } catch {
      return new TextDecoder("utf-8").decode(bytes);
    }
  }
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

function bindImageFallbacks() {
  root.querySelectorAll(".reader-html img, .reader-text img, .reader-document img").forEach((image) => {
    if (image.dataset.fallbackBound === "1") {
      return;
    }

    image.dataset.fallbackBound = "1";
    image.addEventListener("error", () => {
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

      image.dataset.fallbackRecovered = "1";
      image.style.display = "none";

      if (image.nextElementSibling?.classList?.contains("image-missing-note")) {
        return;
      }

      const note = document.createElement("div");
      note.className = "image-missing-note";
      note.textContent = "Image unavailable in source export";
      image.insertAdjacentElement("afterend", note);
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

function sanitizeHtmlContent(rawHtml, sourceHref) {
  const doc = unwrapEncodedHtmlDocument(normalizeLearnerCopy(rawHtml));

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
  const displayTitle = getActivityDisplayTitle(activity);
  const status = bucket === "assignments" ? getActivityConversionStatus(activity) : "";
  const statusLabel = conversionStatusLabel(status);
  const statusClass = conversionStatusClass(status);
  return `
    <button
      class="${className} ${active ? "active" : ""}"
      type="button"
      data-select-activity="${escapeHtml(activity.id)}"
      data-module-id="${escapeHtml(moduleId)}"
      data-bucket="${escapeHtml(bucket)}"
    >
      <div class="item-row">
        <div class="item-title">
          <span class="item-title-text">${escapeHtml(displayTitle)}</span>
          ${statusLabel ? `<span class="item-status-pill ${escapeHtml(statusClass)}">${escapeHtml(statusLabel)}</span>` : ""}
        </div>
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
  const moduleCount = Array.isArray(courseShellData.modules) ? courseShellData.modules.length : 0;
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
          <h1>General Psychology 20</h1>
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
              <span class="stat"><strong>${moduleCount}</strong><span> modules</span></span>
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

  bindEmbeddedFrames();
  bindImageFallbacks();
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
      --bg-elevated: #1c1b1c;
      --bg-sidebar: #1c1b1c;
      --bg-subtle: #2a2a2b;
      --surface-3: #313134;
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
      --line: #353436;
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
      background: var(--bg);
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
      background: var(--bg-sidebar);
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

    .module-list {
      padding: 0.65rem;
      overflow: auto;
      min-height: 0;
      flex: 1 1 auto;
      display: grid;
      gap: 0.38rem;
      align-content: start;
    }

    .module-card {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg-elevated);
      overflow: hidden;
    }

    .module-card.expanded {
      border-color: var(--line-strong);
      background: #26211f;
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
      background: #222123;
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
      background: #232225;
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
      background: #29292b;
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
      background: #181819;
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
      background: #242426;
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
      background: #2f2f31;
      color: var(--text-strong);
    }

    .module-view-btn.active {
      border-color: var(--line-strong);
      background: #322321;
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
      background: #232124;
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
      background: #313033;
    }

    .module-item-btn.active {
      border-color: var(--line-strong);
      background: #3a2a27;
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
      position: relative;
    }

    .topbar {
      z-index: 8;
      border-bottom: 1px solid var(--line);
      background: #131314;
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
      background: #1d1d1e;
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
    }

    .panel {
      border: 1px solid var(--line);
      border-radius: 6px;
      background: var(--bg-elevated);
      box-shadow: 0 0 0 1px rgba(255, 180, 169, 0.05);
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
      background: #1f1f20;
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
      max-width: 860px;
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
      background: #1a1a1c;
      border: 1px solid #403734;
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
      background: #141416;
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
      background: #7e3b32;
      border-color: #7e3b32;
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
      background: #fffdfa;
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

    @media (max-width: 860px) {
      .app {
        grid-template-columns: 1fr;
      }

      .app.sidebar-hidden {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: fixed;
        inset: 0 auto 0 0;
        min-height: 100vh;
        width: min(86vw, 340px);
        border-right: 1px solid var(--line);
        border-bottom: 0;
        opacity: 1;
        pointer-events: auto;
        z-index: 30;
        box-shadow: 0 20px 42px rgba(0, 0, 0, 0.48);
        transform: translateX(0);
        transition: transform 0.2s ease, opacity 0.2s ease;
      }

      .app.sidebar-hidden .sidebar {
        display: flex;
        width: min(86vw, 340px);
        transform: translateX(-108%);
        opacity: 0;
        pointer-events: none;
        border-right-color: var(--line);
      }

      .app:not(.sidebar-hidden) .main::before {
        content: "";
        position: fixed;
        inset: 0;
        background: rgba(8, 8, 10, 0.56);
        z-index: 20;
      }

      .module-list {
        overflow: auto;
      }

      .topbar {
        position: sticky;
        top: 0;
        z-index: 24;
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

      .lesson-completion-btn {
        width: 100%;
      }
    }

    @media (max-width: 560px) {
      .sidebar {
        width: min(92vw, 340px);
      }

      .app.sidebar-hidden .sidebar {
        width: min(92vw, 340px);
      }

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
        min-height: 1320px;
      }
    }
  `;

  document.head.appendChild(style);
}
