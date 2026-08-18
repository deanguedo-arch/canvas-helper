import {
  COURSE_EDIT_MAX_EDITOR_TEXT_CODE_UNITS,
  COURSE_EDIT_MAX_ID_CODE_UNITS,
  COURSE_EDIT_PAGE_MAP_MAX_ENTRIES,
  COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION
} from "../shared/course-editing.js";
import {
  PREVIEW_BRIDGE_MAX_CONTAINERS,
  PREVIEW_BRIDGE_MAX_VISIBLE_TEXT,
  PREVIEW_BRIDGE_PROTOCOL,
  PREVIEW_BRIDGE_VERSION,
  PREVIEW_REVIEW_MAX_ITEMS,
  PREVIEW_REVIEW_MAX_SCREENSHOTS,
  PREVIEW_REVIEW_NOTE_MAX_LENGTH,
  PREVIEW_REVIEW_PACKET_MAX_LENGTH,
  PREVIEW_STANDALONE_BOOTSTRAP_TYPE,
  PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE,
  PREVIEW_STANDALONE_HOST_REJOIN_TYPE,
  PREVIEW_STANDALONE_REJOIN_PARAM,
  PREVIEW_STANDALONE_SESSION_PARAM,
  PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH
} from "../shared/preview-bridge.js";
import { STUDIO_BRIDGE_LIMITS, STUDIO_REVIEW_LIMITS } from "../shared/studio-quality.js";
import { PREVIEW_COURSE_EDIT_MAP_ATTRIBUTE, PREVIEW_INSPECT_NODE_ATTRIBUTE } from "./lib/preview-inspection.js";

/**
 * This runs inside an untrusted course preview. Keep it intentionally small:
 * it reports opaque browser evidence and never knows repository source paths.
 */
export function buildPreviewBridgeRuntime(
  studioOrigin: string,
  options: { hostPreviewOrigin?: string } = {}
) {
  const serializedStudioOrigin = JSON.stringify(studioOrigin);
  const serializedPreviewOrigin = JSON.stringify(options.hostPreviewOrigin ?? "");

  return String.raw`(function canvasHelperPreviewBridge() {
  "use strict";
  var PROTOCOL = "${PREVIEW_BRIDGE_PROTOCOL}";
  var VERSION = ${PREVIEW_BRIDGE_VERSION};
  var NODE_ATTRIBUTE = "${PREVIEW_INSPECT_NODE_ATTRIBUTE}";
  var EDIT_MAP_ATTRIBUTE = "${PREVIEW_COURSE_EDIT_MAP_ATTRIBUTE}";
  var EDIT_MAP_SCHEMA_VERSION = ${COURSE_EDIT_PAGE_MAP_SCHEMA_VERSION};
  var MAX_EDIT_MAP_ENTRIES = ${COURSE_EDIT_PAGE_MAP_MAX_ENTRIES};
  var MAX_COURSE_EDIT_ID = ${COURSE_EDIT_MAX_ID_CODE_UNITS};
  var MAX_EDITOR_TEXT = ${COURSE_EDIT_MAX_EDITOR_TEXT_CODE_UNITS};
  var MAX_TEXT = ${PREVIEW_BRIDGE_MAX_VISIBLE_TEXT};
  var MAX_CONTAINERS = ${PREVIEW_BRIDGE_MAX_CONTAINERS};
  var MAX_REVIEW_ITEMS = ${PREVIEW_REVIEW_MAX_ITEMS};
  var MAX_REVIEW_NOTE = ${PREVIEW_REVIEW_NOTE_MAX_LENGTH};
  var MAX_REVIEW_SCREENSHOTS = ${PREVIEW_REVIEW_MAX_SCREENSHOTS};
  var MAX_REVIEW_PACKET = ${PREVIEW_REVIEW_PACKET_MAX_LENGTH};
  var MAX_REVIEW_ITEM_ID = ${STUDIO_BRIDGE_LIMITS.reviewItemIdCodeUnits};
  var MAX_REVIEW_EXCERPT = ${STUDIO_BRIDGE_LIMITS.reviewExcerptCodeUnits};
  var MAX_REVIEW_STATUS = ${STUDIO_BRIDGE_LIMITS.reviewStatusCodeUnits};
  var MAX_REQUEST_ID = ${STUDIO_BRIDGE_LIMITS.inspectRequestIdCodeUnits};
  var MAX_SESSION_NAME = ${STUDIO_BRIDGE_LIMITS.reviewSessionNameCodeUnits};
  var MIN_STANDALONE_SESSION_TOKEN = ${STUDIO_BRIDGE_LIMITS.standaloneSessionTokenMinCodeUnits};
  var MIN_REVIEW_SESSION_ID = ${STUDIO_REVIEW_LIMITS.sessionIdMinCodeUnits};
  var MAX_REVIEW_SESSION_ID = ${STUDIO_REVIEW_LIMITS.sessionIdMaxCodeUnits};
  var MIN_PREVIEW_CAPABILITY_TOKEN = ${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMinCodeUnits};
  var MAX_PREVIEW_CAPABILITY_TOKEN = ${STUDIO_BRIDGE_LIMITS.previewCapabilityTokenMaxCodeUnits};
  var MAX_COURSE_URL = ${STUDIO_BRIDGE_LIMITS.courseUrlCodeUnits};
  var MAX_ELEMENT_TAG = ${STUDIO_BRIDGE_LIMITS.elementTagCodeUnits};
  var MAX_ELEMENT_ROLE = ${STUDIO_BRIDGE_LIMITS.elementRoleCodeUnits};
  var MAX_ELEMENT_TEST_ID = ${STUDIO_BRIDGE_LIMITS.elementTestIdCodeUnits};
  var MAX_SCROLL_SELECTOR = ${STUDIO_BRIDGE_LIMITS.scrollSelectorCodeUnits};
  var STANDALONE_BOOTSTRAP_TYPE = "${PREVIEW_STANDALONE_BOOTSTRAP_TYPE}";
  var STANDALONE_HOST_BOOTSTRAP_TYPE = "${PREVIEW_STANDALONE_HOST_BOOTSTRAP_TYPE}";
  var STANDALONE_HOST_REJOIN_TYPE = "${PREVIEW_STANDALONE_HOST_REJOIN_TYPE}";
  var STANDALONE_SESSION_PARAM = "${PREVIEW_STANDALONE_SESSION_PARAM}";
  var STANDALONE_REJOIN_PARAM = "${PREVIEW_STANDALONE_REJOIN_PARAM}";
  var CAPTURE_PARAM = "canvas-helper-capture";
  var STANDALONE_REJOIN_STORAGE_KEY = "canvas-helper/standalone-preview-rejoin-v1";
  var MAX_SESSION_TOKEN = ${PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH};
  var STUDIO_ORIGIN = ${serializedStudioOrigin};
  var PREVIEW_ORIGIN = ${serializedPreviewOrigin};

  var port = null;
  var studioConnected = false;
  var inspectEnabled = false;
  var editModeEnabled = false;
  var hoverHandle = 0;
  var hoverEvent = null;
  var scrollHandle = 0;
  var lastSelectors = [];
  var scrollSelectorsInitialized = false;
  var sourceNodeCounts = null;
  var sourceNodeElements = null;
  var sourceNodeIndexBuildCount = 0;
  var keyboardCursor = null;
  var keyboardCandidateCache = null;
  var keyboardCandidateCacheDirty = true;
  var keyboardMutationObserver = null;
  var temporaryFocusElement = null;
  var temporaryFocusTabIndex = null;
  var overlay = null;
  var shield = null;
  var dragStart = null;
  var dragging = false;
  var previewControls = null;
  var inspectControl = null;
  var editControl = null;
  var previewStatus = null;
  var standaloneRetryControl = null;
  var reviewToggle = null;
  var reviewPanel = null;
  var reviewSelection = null;
  var reviewSelectionText = null;
  var reviewDraft = null;
  var reviewCapture = null;
  var reviewSave = null;
  var reviewItems = null;
  var reviewCopy = null;
  var reviewClear = null;
  var reviewUndo = null;
  var reviewMessage = null;
  var reviewPacketFallback = null;
  var reviewPacketConfirm = null;
  var reviewLightbox = null;
  var reviewPanelOpen = false;
  var editPanel = null;
  var editPanelOpen = false;
  var editToggle = null;
  var editTargetText = null;
  var editHtml = null;
  var editFormat = null;
  var editHref = null;
  var editSrc = null;
  var editAlt = null;
  var editTitle = null;
  var editStyleControls = null;
  var editSave = null;
  var editItems = null;
  var editApply = null;
  var editUndo = null;
  var editAnnotate = null;
  var editMessage = null;
  var editActionSequence = 0;
  var editPreviewActionTimer = 0;
  var latestEditActionId = "";
  var pendingEditAnnotationId = "";
  var editComposerKey = "";
  var editLastSelection = null;
  var editPanelPositionHandle = 0;
  var editPageMap = { available: false, reason: "This page does not include a current editability map.", entries: [] };
  var editMapEntriesByNodeId = Object.create(null);
  var editMapRuntimeByNodeId = Object.create(null);
  var editMapShowAll = true;
  var editMapStyle = null;
  var editMapToolbar = null;
  var editMapCount = null;
  var editMapToggle = null;
  var editMapTooltip = null;
  var editMapTooltipLabel = null;
  var editMapTooltipReason = null;
  var editMapRefreshTimer = 0;
  var editPreviewOverlay = null;
  var editPreviewTarget = null;
  var editPreviewCommand = null;
  var editPreviewPositionHandle = 0;
  var editPreviewSessions = Object.create(null);
  var editPreviewSessionOrder = [];
  var editState = { projectSlug: "", enabled: false, available: false, unavailableReason: "", target: null, drafts: [], selectedDraft: null, busy: false, canUndo: false, exportsOutOfDate: false, staleExportTargets: [], status: "", error: "" };
  var reviewPacket = "";
  var reviewPacketId = "";
  var reviewPacketItemIds = [];
  var reviewPacketSessionId = "";
  var reviewManualPacketSnapshot = null;
  var reviewLocalMessage = "";
  var reviewCapturePending = false;
  var reviewSavePending = false;
  var reviewCopyPending = false;
  var reviewCopyTransaction = null;
  var reviewActionSequence = 0;
  var latestReviewActionId = "";
  var reviewCopyReservationResult = null;
  var reviewState = { sessionId: "", items: [], draftScreenshotCount: 0, captureItemId: "", saving: false, copying: false, preparing: false, packetReady: false, status: "", error: "", undoLabel: "" };
  var standaloneSessionToken = "";
  var standaloneRejoinToken = "";
  var standaloneUrl = null;
  var captureMode = false;
  var hostMode = false;
  var trustedStudioWindow = null;
  var hostedCourseFrame = null;
  var hostedCoursePort = null;
  var hostedCourseReadyHref = "";
  // Full Preview is a Studio-owned host around a cross-origin learner frame.
  // Keep a short-lived host guard above that frame until its own inspection
  // shield acknowledges the requested mode, so an eager click cannot reach
  // learner controls before safe selection capture is armed.
  var hostedCourseInteractionReady = false;
  var hostedCourseGuard = null;
  var hostedCourseGuardLabel = null;
  // The standalone host can connect to Studio before its nested learner frame
  // has finished booting. Retain only the already-validated bridge command so
  // it can be delivered once that frame is ready instead of being lost.
  var hostedEditPreview = null;
  var pendingHostedKeyboardEntry = false;
  var hostedCourseHealth = null;
  var hostedCourseHealthTimer = 0;
  // The outer Full Preview host is created before its learner iframe has a
  // stable preview-origin document. A direct postMessage can therefore race
  // the initial about:blank navigation. Retry only that bounded handshake;
  // this never replays learner input or changes the learner subtree.
  var hostedCourseConnectTimer = 0;
  var hostedCourseConnectAttempts = 0;
  var MAX_HOSTED_COURSE_CONNECT_ATTEMPTS = 80;
  var hostedCourseConnectPending = false;
  var hostedCourseHandshakeTimer = 0;
  var hostedCourseRecoveryMessage = "";
  var hostedFocusRequest = null;
  var hostedInlineEditor = null;
  var hostedInlineEditorField = null;
  var hostedInlineEditorStatus = null;
  var hostedInlineEditorCommand = null;
  var hostedInlineEditorInputRevision = 0;
  var hostedInlineEditorPositionHandle = 0;
  var reconnectTimer = 0;
  var reconnectAttempts = 0;
  var lastNavigationIdentity = "";
  var navigationReportTimer = 0;
  var contentHealth = null;
  var contentHealthTimer = 0;
  var contentHealthMutationTimer = 0;
  var contentHealthObserver = null;

  try {
    standaloneUrl = new URL(location.href);
    standaloneSessionToken = standaloneUrl.searchParams.get(STANDALONE_SESSION_PARAM) || "";
    standaloneRejoinToken = standaloneUrl.searchParams.get(STANDALONE_REJOIN_PARAM) || "";
    captureMode = standaloneUrl.searchParams.get(CAPTURE_PARAM) === "1";
    hostMode = Boolean(PREVIEW_ORIGIN && location.origin === STUDIO_ORIGIN && standaloneUrl.pathname === "/standalone-preview");
  } catch (_) {}
  if (standaloneSessionToken.length < MIN_STANDALONE_SESSION_TOKEN || standaloneSessionToken.length > MAX_SESSION_TOKEN || !/^[A-Za-z0-9-]+$/.test(standaloneSessionToken)) standaloneSessionToken = "";
  if (standaloneRejoinToken.length < MIN_STANDALONE_SESSION_TOKEN || standaloneRejoinToken.length > MAX_SESSION_TOKEN || !/^[A-Za-z0-9-]+$/.test(standaloneRejoinToken)) standaloneRejoinToken = "";
  if (hostMode) {
    try {
      if (standaloneRejoinToken) {
        window.sessionStorage.setItem(STANDALONE_REJOIN_STORAGE_KEY, standaloneRejoinToken);
      } else {
        var storedStandaloneRejoinToken = window.sessionStorage.getItem(STANDALONE_REJOIN_STORAGE_KEY) || "";
        if (storedStandaloneRejoinToken.length >= MIN_STANDALONE_SESSION_TOKEN && storedStandaloneRejoinToken.length <= MAX_SESSION_TOKEN && /^[A-Za-z0-9-]+$/.test(storedStandaloneRejoinToken)) {
          standaloneRejoinToken = storedStandaloneRejoinToken;
        }
      }
    } catch (_) {}
  }
  if ((standaloneSessionToken || standaloneRejoinToken) && standaloneUrl) {
    standaloneUrl.searchParams.delete(STANDALONE_SESSION_PARAM);
    standaloneUrl.searchParams.delete(STANDALONE_REJOIN_PARAM);
    try { history.replaceState(history.state, "", standaloneUrl.pathname + standaloneUrl.search + standaloneUrl.hash); } catch (_) {}
  }
  if (captureMode && standaloneUrl) {
    standaloneUrl.searchParams.delete(CAPTURE_PARAM);
    try { history.replaceState(history.state, "", standaloneUrl.pathname + standaloneUrl.search + standaloneUrl.hash); } catch (_) {}
  }
  if (hostMode) trustedStudioWindow = window.opener;

  function message(type, payload) {
    return { protocol: PROTOCOL, version: VERSION, type: type, payload: payload };
  }

  function send(type, payload) {
    if (!port) return;
    try { port.postMessage(message(type, payload)); } catch (_) {}
  }

  function sendHostedCourse(type, payload) {
    if (!hostedCoursePort) return false;
    try {
      hostedCoursePort.postMessage(message(type, payload));
      return true;
    } catch (_) {
      return false;
    }
  }

  function ensureHostedCourseGuard() {
    if (!hostMode) return null;
    if (hostedCourseGuard) return hostedCourseGuard;
    var guard = document.createElement("div");
    guard.setAttribute("data-canvas-helper-full-preview-ready-guard", "true");
    guard.setAttribute("aria-live", "polite");
    guard.setAttribute("role", "status");
    guard.style.position = "fixed";
    guard.style.inset = "0";
    guard.style.zIndex = "2147483645";
    guard.style.display = "none";
    guard.style.alignItems = "center";
    guard.style.justifyContent = "center";
    guard.style.pointerEvents = "auto";
    guard.style.background = "rgba(248,250,252,.06)";
    guard.style.color = "#18212f";
    guard.style.font = "600 13px/1.35 system-ui, sans-serif";
    var label = document.createElement("span");
    label.textContent = "Preparing safe editing…";
    label.style.padding = "7px 10px";
    label.style.border = "1px solid rgba(100,116,139,.45)";
    label.style.borderRadius = "7px";
    label.style.background = "rgba(255,255,255,.94)";
    label.style.boxShadow = "0 2px 8px rgba(15,23,42,.12)";
    guard.appendChild(label);
    (document.body || document.documentElement).appendChild(guard);
    hostedCourseGuard = guard;
    hostedCourseGuardLabel = label;
    return guard;
  }

  function updateHostedCourseGuard() {
    if (!hostMode) return;
    var guard = ensureHostedCourseGuard();
    if (!guard) return;
    var active = Boolean(inspectEnabled && !hostedCourseInteractionReady);
    guard.style.display = active ? "flex" : "none";
    guard.style.pointerEvents = active ? "auto" : "none";
    if (hostedCourseGuardLabel) {
      hostedCourseGuardLabel.textContent = hostedCourseRecoveryMessage || "Preparing safe editing…";
    }
  }

  function boundedString(value, maximum) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > maximum ? text.slice(0, maximum) : text;
  }

  function normalizedRenderedText(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, ${24000});
  }

  function renderedTextFingerprint(value) {
    var text = normalizedRenderedText(value);
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function shortEditMapFingerprint(value) {
    var text = String(value || "");
    var hash = 2166136261;
    for (var index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
  }

  function renderedAttributeFingerprint(element) {
    return shortEditMapFingerprint(["href", "src", "alt", "title"].map(function(name) {
      return element.getAttribute(name) || "";
    }).join("\u0000"));
  }

  function validEditMapEntry(entry) {
    if (!entry || typeof entry !== "object") return false;
    if (typeof entry.nodeId !== "string" || !/^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(entry.nodeId)) return false;
    if (typeof entry.tagName !== "string" || entry.tagName.length < 1 || entry.tagName.length > MAX_ELEMENT_TAG) return false;
    if (["edit-text", "edit-link", "replace-image", "style-text", "rename-course", "annotation-only"].indexOf(entry.action) < 0) return false;
    if (typeof entry.label !== "string" || entry.label.length > 80 || typeof entry.reason !== "string" || entry.reason.length > 240) return false;
    if (entry.expected === null) return true;
    return Boolean(
      entry.expected &&
      typeof entry.expected.textFingerprint === "string" && /^[a-f0-9]{8}$/.test(entry.expected.textFingerprint) &&
      Number.isInteger(entry.expected.textLength) && entry.expected.textLength >= 0 && entry.expected.textLength <= 24000 &&
      typeof entry.expected.attributeFingerprint === "string" && /^[a-f0-9]{8}$/.test(entry.expected.attributeFingerprint)
    );
  }

  function readEditPageMap() {
    var mapScript = document.querySelector("script[type='application/json'][" + EDIT_MAP_ATTRIBUTE + "='v" + EDIT_MAP_SCHEMA_VERSION + "']");
    if (!mapScript) return;
    try {
      var parsed = JSON.parse(mapScript.textContent || "null");
      if (
        !parsed ||
        parsed.schemaVersion !== EDIT_MAP_SCHEMA_VERSION ||
        typeof parsed.projectSlug !== "string" || parsed.projectSlug.length < 1 || parsed.projectSlug.length > MAX_COURSE_EDIT_ID ||
        typeof parsed.sourceDigest !== "string" || !/^[a-f0-9]{64}$/.test(parsed.sourceDigest) ||
        typeof parsed.available !== "boolean" ||
        typeof parsed.reason !== "string" ||
        !Array.isArray(parsed.entries) ||
        parsed.entries.length > MAX_EDIT_MAP_ENTRIES ||
        !parsed.entries.every(validEditMapEntry)
      ) return;
      editPageMap = parsed;
      editMapEntriesByNodeId = Object.create(null);
      parsed.entries.forEach(function(entry) { editMapEntriesByNodeId[entry.nodeId] = entry; });
    } catch (_) {}
  }

  function ensureEditMapVisuals() {
    if (!editMapStyle) {
      editMapStyle = document.createElement("style");
      editMapStyle.setAttribute("data-canvas-helper-edit-map-style", "v1");
      editMapStyle.textContent = "html[data-canvas-helper-edit-map-active='true'][data-canvas-helper-edit-map-show='true'] [data-canvas-helper-edit-map-outline='true'][data-canvas-helper-edit-map-state='editable']{outline:2px solid rgba(24,121,78,.72)!important;outline-offset:2px!important}html[data-canvas-helper-edit-map-active='true'][data-canvas-helper-edit-map-show='true'] [data-canvas-helper-edit-map-outline='true'][data-canvas-helper-edit-map-state='rename']{outline:2px solid rgba(88,68,138,.72)!important;outline-offset:2px!important}html[data-canvas-helper-edit-map-active='true'][data-canvas-helper-edit-map-show='true'] [data-canvas-helper-edit-map-outline='true'][data-canvas-helper-edit-map-state='blocked']{outline:2px dashed rgba(166,105,24,.62)!important;outline-offset:2px!important}";
      (document.head || document.documentElement).appendChild(editMapStyle);
    }
    if (!editMapToolbar) {
      editMapToolbar = document.createElement("div");
      editMapToolbar.setAttribute("data-canvas-helper-edit-map-toolbar", "true");
      editMapToolbar.setAttribute("role", "toolbar");
      editMapToolbar.setAttribute("aria-label", "Editable areas");
      editMapToolbar.style.position = "fixed";
      editMapToolbar.style.top = "10px";
      editMapToolbar.style.right = "10px";
      editMapToolbar.style.zIndex = "2147483647";
      editMapToolbar.style.display = "none";
      editMapToolbar.style.alignItems = "center";
      editMapToolbar.style.gap = "8px";
      editMapToolbar.style.padding = "6px 8px";
      editMapToolbar.style.border = "1px solid #64748b";
      editMapToolbar.style.borderRadius = "6px";
      editMapToolbar.style.background = "#ffffff";
      editMapToolbar.style.color = "#18212f";
      editMapToolbar.style.font = "12px/1.3 system-ui, sans-serif";
      editMapToolbar.style.boxShadow = "0 2px 8px rgba(15,23,42,.16)";
      editMapCount = document.createElement("span");
      editMapCount.setAttribute("data-canvas-helper-edit-map-count", "true");
      editMapToggle = document.createElement("button");
      editMapToggle.type = "button";
      editMapToggle.setAttribute("data-canvas-helper-edit-map-toggle", "true");
      stylePreviewControlButton(editMapToggle);
      editMapToggle.style.padding = "4px 7px";
      editMapToggle.addEventListener("click", function(event) {
        if (!event.isTrusted) return;
        editMapShowAll = !editMapShowAll;
        document.documentElement.setAttribute("data-canvas-helper-edit-map-show", editMapShowAll ? "true" : "false");
        editMapToggle.textContent = editMapShowAll ? "Hide outlines" : "Show outlines";
      });
      editMapToolbar.appendChild(editMapCount);
      editMapToolbar.appendChild(editMapToggle);
      (document.body || document.documentElement).appendChild(editMapToolbar);
    }
    if (!editMapTooltip) {
      editMapTooltip = document.createElement("div");
      editMapTooltip.setAttribute("data-canvas-helper-edit-map-tooltip", "true");
      editMapTooltip.setAttribute("role", "tooltip");
      editMapTooltip.style.position = "fixed";
      editMapTooltip.style.zIndex = "2147483647";
      editMapTooltip.style.display = "none";
      editMapTooltip.style.maxWidth = "320px";
      editMapTooltip.style.padding = "7px 9px";
      editMapTooltip.style.border = "1px solid #334155";
      editMapTooltip.style.borderRadius = "6px";
      editMapTooltip.style.background = "#18212f";
      editMapTooltip.style.color = "#ffffff";
      editMapTooltip.style.font = "12px/1.35 system-ui, sans-serif";
      editMapTooltip.style.boxShadow = "0 2px 8px rgba(15,23,42,.2)";
      editMapTooltipLabel = document.createElement("strong");
      editMapTooltipLabel.style.display = "block";
      editMapTooltipReason = document.createElement("span");
      editMapTooltipReason.style.display = "block";
      editMapTooltipReason.style.marginTop = "2px";
      editMapTooltipReason.style.color = "#e2e8f0";
      editMapTooltip.appendChild(editMapTooltipLabel);
      editMapTooltip.appendChild(editMapTooltipReason);
      (document.body || document.documentElement).appendChild(editMapTooltip);
    }
  }

  function hideEditMapTooltip() {
    if (editMapTooltip) editMapTooltip.style.display = "none";
  }

  function showEditMapTooltip(runtime, rect) {
    ensureEditMapVisuals();
    if (!editMapTooltip || !editMapTooltipLabel || !editMapTooltipReason) return;
    editMapTooltipLabel.textContent = runtime.label;
    editMapTooltipReason.textContent = runtime.reason;
    editMapTooltip.style.display = "block";
    var tooltipRect = editMapTooltip.getBoundingClientRect();
    var left = Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - tooltipRect.width - 8));
    var above = rect.top - tooltipRect.height - 8;
    var top = above >= 8 ? above : Math.min(window.innerHeight - tooltipRect.height - 8, rect.bottom + 8);
    editMapTooltip.style.left = left + "px";
    editMapTooltip.style.top = Math.max(8, top) + "px";
  }

  function refreshEditMap() {
    if (!document.documentElement) return;
    var previouslyMapped = document.querySelectorAll("[data-canvas-helper-edit-map-state]");
    for (var previousIndex = 0; previousIndex < previouslyMapped.length; previousIndex += 1) {
      previouslyMapped[previousIndex].removeAttribute("data-canvas-helper-edit-map-state");
      previouslyMapped[previousIndex].removeAttribute("data-canvas-helper-edit-map-outline");
    }
    editMapRuntimeByNodeId = Object.create(null);
    var actionable = [];
    var annotationOnly = [];
    Object.keys(editMapEntriesByNodeId).forEach(function(nodeId) {
      var entry = editMapEntriesByNodeId[nodeId];
      var element = elementForSourceNodeId(nodeId);
      if (!element || element.tagName.toLowerCase() !== entry.tagName) return;
      var state = entry.action === "annotation-only" ? "blocked" : entry.action === "rename-course" ? "rename" : "editable";
      var label = entry.label;
      var reason = entry.reason;
      if (entry.expected) {
        var renderedText = normalizedRenderedText(element.textContent || "");
        if (
          renderedText.length !== entry.expected.textLength ||
          renderedTextFingerprint(renderedText) !== entry.expected.textFingerprint ||
          renderedAttributeFingerprint(element) !== entry.expected.attributeFingerprint
        ) {
          state = "blocked";
          label = "Annotation only";
          reason = "Course code replaces this element after the page loads, so a source edit would not control what learners see.";
        }
      }
      var runtime = { element: element, state: state, action: entry.action, label: label, reason: reason, nodeId: nodeId };
      editMapRuntimeByNodeId[nodeId] = runtime;
      element.setAttribute("data-canvas-helper-edit-map-state", state);
      if (state !== "blocked" && isVisibleCourseElement(element)) actionable.push(runtime);
      if (
        state === "blocked" &&
        isVisibleCourseElement(element) &&
        /^(?:h[1-6]|p|a|img|li|td|th|figcaption|button|label)$/.test(entry.tagName)
      ) annotationOnly.push(runtime);
    });
    var primaryCount = 0;
    actionable.forEach(function(runtime) {
      var ancestor = runtime.element.parentElement;
      var hasActionableAncestor = false;
      while (ancestor && ancestor !== document.documentElement) {
        var ancestorNodeId = ancestor.getAttribute(NODE_ATTRIBUTE) || "";
        var ancestorRuntime = ancestorNodeId ? editMapRuntimeByNodeId[ancestorNodeId] : null;
        if (ancestorRuntime && ancestorRuntime.state !== "blocked") {
          hasActionableAncestor = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      var isSpecificAction = runtime.action === "edit-link" || runtime.action === "replace-image" || runtime.action === "rename-course";
      if (!hasActionableAncestor || isSpecificAction) {
        runtime.element.setAttribute("data-canvas-helper-edit-map-outline", "true");
        primaryCount += 1;
      }
    });
    var annotationOnlyCount = 0;
    annotationOnly.forEach(function(runtime) {
      var ancestor = runtime.element.parentElement;
      var hasOutlinedAncestor = false;
      while (ancestor && ancestor !== document.documentElement) {
        if (ancestor.getAttribute("data-canvas-helper-edit-map-outline") === "true") {
          hasOutlinedAncestor = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!hasOutlinedAncestor) {
        runtime.element.setAttribute("data-canvas-helper-edit-map-outline", "true");
        annotationOnlyCount += 1;
      }
    });
    ensureEditMapVisuals();
    if (editMapCount) {
      editMapCount.textContent = editPageMap.available
        ? (editPageMap.truncated
          ? primaryCount + "+ mapped editable areas"
          : primaryCount + " editable " + (primaryCount === 1 ? "area" : "areas") + " · " + annotationOnlyCount + " annotation-only")
        : "Edit map unavailable";
    }
    if (editMapToggle) {
      editMapToggle.textContent = editMapShowAll ? "Hide outlines" : "Show outlines";
      editMapToggle.disabled = !editPageMap.available || primaryCount === 0;
      editMapToggle.style.opacity = editMapToggle.disabled ? "0.48" : "1";
    }
  }

  function scheduleEditMapRefresh() {
    if (!editModeEnabled || editMapRefreshTimer) return;
    editMapRefreshTimer = window.setTimeout(function() {
      editMapRefreshTimer = 0;
      refreshEditMap();
    }, 80);
  }

  function updateEditMapVisuals() {
    ensureEditMapVisuals();
    var active = Boolean(editModeEnabled && inspectEnabled && !hostMode);
    document.documentElement.setAttribute("data-canvas-helper-edit-map-active", active ? "true" : "false");
    document.documentElement.setAttribute("data-canvas-helper-edit-map-show", editMapShowAll ? "true" : "false");
    if (editMapToolbar) editMapToolbar.style.display = active ? "flex" : "none";
    if (!active) {
      hideEditMapTooltip();
      return;
    }
    refreshEditMap();
    window.setTimeout(scheduleEditMapRefresh, 260);
    window.setTimeout(scheduleEditMapRefresh, 1000);
  }

  function mapRuntimeForElement(element) {
    if (!element) return null;
    var nodeId = uniqueSourceNodeId(element);
    return nodeId ? editMapRuntimeByNodeId[nodeId] || null : null;
  }

  function validEditPreviewStyle(value) {
    if (!value || typeof value !== "object") return false;
    var keys = ["textStyle", "fontFamily", "fontSize", "textTone", "alignment", "spacing"];
    if (Object.keys(value).length !== keys.length) return false;
    var allowed = {
      textStyle: ["default", "heading", "subheading", "body", "caption"],
      fontFamily: ["default", "readable-sans", "book-serif"],
      fontSize: ["default", "small", "large", "x-large"],
      textTone: ["default", "ink", "muted", "accent"],
      alignment: ["default", "left", "center", "right"],
      spacing: ["default", "compact", "relaxed"]
    };
    return keys.every(function(key) { return allowed[key].indexOf(value[key]) >= 0; });
  }

  function validEditPreviewRepresentation(value) {
    if (!value || typeof value !== "object") return false;
    if (typeof value.tagName !== "string" || !/^[a-z][a-z0-9-]{0,23}$/.test(value.tagName)) return false;
    if (typeof value.html !== "string" || value.html.length > 24000) return false;
    if (!value.attributes || typeof value.attributes !== "object") return false;
    if (!["href", "src", "alt", "title"].every(function(name) { return typeof value.attributes[name] === "string" && value.attributes[name].length <= 24000; })) return false;
    return validEditPreviewStyle(value.style);
  }

  function validEditPreviewCommand(value) {
    return Boolean(
      value &&
      typeof value === "object" &&
      (value.action === "render" || value.action === "clear") &&
      typeof value.previewSessionId === "string" && /^[A-Za-z0-9-]{1,96}$/.test(value.previewSessionId) &&
      Number.isSafeInteger(value.revision) && value.revision > 0 &&
      typeof value.projectSlug === "string" && value.projectSlug.length > 0 && value.projectSlug.length <= MAX_COURSE_EDIT_ID &&
      typeof value.pageIdentity === "string" && value.pageIdentity.length > 0 && value.pageIdentity.length <= MAX_COURSE_URL &&
      typeof value.mapSourceDigest === "string" && /^[a-f0-9]{64}$/.test(value.mapSourceDigest) &&
      typeof value.targetNodeId === "string" && /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(value.targetNodeId) &&
      typeof value.canonicalPatchDigest === "string" && /^[a-f0-9]{64}$/.test(value.canonicalPatchDigest) &&
      (value.action === "render" ? validEditPreviewRepresentation(value.representation) : value.representation === null)
    );
  }

  function editPreviewAck(command, action, ok, messageText) {
    send("preview-edit-preview-ack", {
      action: action,
      previewSessionId: command.previewSessionId,
      revision: command.revision,
      projectSlug: command.projectSlug,
      pageIdentity: command.pageIdentity,
      mapSourceDigest: command.mapSourceDigest,
      targetNodeId: command.targetNodeId,
      canonicalPatchDigest: command.canonicalPatchDigest,
      ok: Boolean(ok),
      message: boundedString(messageText, MAX_REVIEW_STATUS),
      acknowledgedAt: Date.now()
    });
  }

  function recordEditPreviewSession(command, closed) {
    if (!editPreviewSessions[command.previewSessionId]) {
      editPreviewSessionOrder.push(command.previewSessionId);
      if (editPreviewSessionOrder.length > 64) {
        var retired = editPreviewSessionOrder.shift();
        if (retired) delete editPreviewSessions[retired];
      }
    }
    editPreviewSessions[command.previewSessionId] = { revision: command.revision, closed: Boolean(closed) };
  }

  function removeEditPreviewOverlay() {
    if (editPreviewPositionHandle) {
      window.cancelAnimationFrame(editPreviewPositionHandle);
      editPreviewPositionHandle = 0;
    }
    if (editPreviewOverlay && editPreviewOverlay.parentNode) editPreviewOverlay.parentNode.removeChild(editPreviewOverlay);
    editPreviewOverlay = null;
    editPreviewTarget = null;
    editPreviewCommand = null;
  }

  function visibleBackgroundFor(element) {
    var cursor = element;
    while (cursor && cursor !== document.documentElement) {
      var style = window.getComputedStyle(cursor);
      if (style.backgroundImage && style.backgroundImage !== "none") return style.background;
      var color = style.backgroundColor || "";
      if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
      cursor = cursor.parentElement;
    }
    return window.getComputedStyle(document.body || document.documentElement).backgroundColor || "#ffffff";
  }

  function positionEditPreviewOverlay() {
    editPreviewPositionHandle = 0;
    if (!editPreviewOverlay || !editPreviewTarget || !editPreviewTarget.isConnected) {
      removeEditPreviewOverlay();
      return;
    }
    var rect = editPreviewTarget.getBoundingClientRect();
    editPreviewOverlay.style.left = Math.round(rect.left) + "px";
    editPreviewOverlay.style.top = Math.round(rect.top) + "px";
    editPreviewOverlay.style.width = Math.max(1, Math.round(rect.width)) + "px";
    editPreviewOverlay.style.minHeight = Math.max(1, Math.round(rect.height)) + "px";
  }

  function scheduleEditPreviewPosition() {
    if (!editPreviewOverlay || editPreviewPositionHandle) return;
    editPreviewPositionHandle = window.requestAnimationFrame(positionEditPreviewOverlay);
  }

  function copyComputedPresentation(source, target) {
    var computed = window.getComputedStyle(source);
    for (var index = 0; index < computed.length; index += 1) {
      var property = computed[index];
      if (["position", "left", "right", "top", "bottom", "inset", "z-index", "transform", "margin", "margin-left", "margin-right", "margin-top", "margin-bottom"].indexOf(property) >= 0) continue;
      try { target.style.setProperty(property, computed.getPropertyValue(property), computed.getPropertyPriority(property)); } catch (_) {}
    }
    target.style.setProperty("margin", "0", "important");
    target.style.setProperty("max-width", "100%", "important");
    target.style.setProperty("pointer-events", "none", "important");
  }

  function renderEditPreview(command) {
    var session = editPreviewSessions[command.previewSessionId];
    if (session && (session.closed || command.revision <= session.revision)) {
      editPreviewAck(command, "rejected", false, session.closed ? "This preview session is closed." : "A newer preview revision is already visible.");
      return;
    }
    if (!editModeEnabled || !inspectEnabled) {
      editPreviewAck(command, "rejected", false, "Edit mode is no longer active on this learner page.");
      return;
    }
    var currentPageIdentity = pageIdentity(location.href);
    if (!currentPageIdentity || pageIdentity(command.pageIdentity) !== currentPageIdentity) {
      editPreviewAck(command, "rejected", false, "The learner page changed before this preview could render.");
      return;
    }
    if (!editPageMap || editPageMap.sourceDigest !== command.mapSourceDigest) {
      editPreviewAck(command, "rejected", false, "The editable source map changed. Select the element again.");
      return;
    }
    var target = elementForSourceNodeId(command.targetNodeId);
    var runtime = target ? mapRuntimeForElement(target) : null;
    if (!target || !runtime || runtime.state === "blocked" || target.tagName.toLowerCase() !== command.representation.tagName) {
      editPreviewAck(command, "rejected", false, "The selected learner element is no longer previewable.");
      return;
    }
    removeEditPreviewOverlay();
    var stage = document.createElement("div");
    stage.setAttribute("data-canvas-helper-edit-preview-overlay", "true");
    stage.setAttribute("aria-hidden", "true");
    stage.setAttribute("inert", "");
    stage.style.position = "fixed";
    stage.style.zIndex = "2147483644";
    stage.style.pointerEvents = "none";
    stage.style.overflow = "visible";
    stage.style.background = visibleBackgroundFor(target);
    stage.style.boxSizing = "border-box";
    var clone = document.createElement(command.representation.tagName);
    copyComputedPresentation(target, clone);
    if (command.representation.tagName !== "img") clone.innerHTML = command.representation.html;
    ["href", "src", "alt", "title"].forEach(function(name) {
      var value = command.representation.attributes[name];
      if (value) clone.setAttribute(name, value); else clone.removeAttribute(name);
    });
    var styleAttributes = {
      textStyle: "data-canvas-helper-text-style",
      fontFamily: "data-canvas-helper-font",
      fontSize: "data-canvas-helper-font-size",
      textTone: "data-canvas-helper-text-tone",
      alignment: "data-canvas-helper-align",
      spacing: "data-canvas-helper-spacing"
    };
    Object.keys(styleAttributes).forEach(function(key) {
      var value = command.representation.style[key];
      if (value && value !== "default") clone.setAttribute(styleAttributes[key], value);
    });
    var descendants = clone.querySelectorAll("a,button,input,select,textarea,[tabindex]");
    for (var descendantIndex = 0; descendantIndex < descendants.length; descendantIndex += 1) {
      descendants[descendantIndex].setAttribute("tabindex", "-1");
      descendants[descendantIndex].setAttribute("aria-hidden", "true");
    }
    stage.appendChild(clone);
    (document.body || document.documentElement).appendChild(stage);
    editPreviewOverlay = stage;
    editPreviewTarget = target;
    editPreviewCommand = command;
    positionEditPreviewOverlay();
    recordEditPreviewSession(command, false);
    editPreviewAck(command, "rendered", true, "Live preview updated on the learner page.");
  }

  function applyEditPreviewCommand(command) {
    if (!validEditPreviewCommand(command)) return;
    if (command.action === "clear") {
      var session = editPreviewSessions[command.previewSessionId];
      if (session && command.revision <= session.revision) {
        editPreviewAck(command, "rejected", false, "A newer preview revision already exists.");
        return;
      }
      if (editPreviewCommand && editPreviewCommand.previewSessionId !== command.previewSessionId) {
        recordEditPreviewSession(command, true);
        editPreviewAck(command, "cleared", true, "The older preview session was already replaced.");
        return;
      }
      removeEditPreviewOverlay();
      recordEditPreviewSession(command, true);
      editPreviewAck(command, "cleared", true, "Live preview cleared.");
      return;
    }
    renderEditPreview(command);
  }

  function validInlinePresentation(value) {
    if (!value || typeof value !== "object") return false;
    var keys = ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "textAlign", "color", "whiteSpace"];
    if (Object.keys(value).length !== keys.length || !keys.every(function(key) { return Object.prototype.hasOwnProperty.call(value, key); })) return false;
    var safeValue = function(candidate, maximum) {
      return typeof candidate === "string" && candidate.length <= maximum && !/[;{}<>]/.test(candidate) && !/(?:url|expression|@import)\s*\(/i.test(candidate);
    };
    return (
      safeValue(value.fontFamily, 240) &&
      safeValue(value.fontSize, 32) &&
      safeValue(value.fontWeight, 32) &&
      ["normal", "italic", "oblique"].indexOf(value.fontStyle) >= 0 &&
      safeValue(value.lineHeight, 32) &&
      safeValue(value.letterSpacing, 32) &&
      ["left", "right", "center", "justify", "start", "end"].indexOf(value.textAlign) >= 0 &&
      safeValue(value.color, 64) &&
      ["normal", "pre", "pre-wrap", "pre-line", "nowrap"].indexOf(value.whiteSpace) >= 0
    );
  }

  function validHostedInlineEditorCommand(value) {
    if (!value || typeof value !== "object") return false;
    var keys = ["schemaVersion", "active", "sessionId", "revision", "targetId", "target", "text", "allowsLineBreaks", "status"];
    if (Object.keys(value).length !== keys.length || !keys.every(function(key) { return Object.prototype.hasOwnProperty.call(value, key); })) return false;
    if (value.schemaVersion !== VERSION || typeof value.active !== "boolean" || !Number.isSafeInteger(value.revision) || value.revision < 0 || typeof value.allowsLineBreaks !== "boolean" || ["clean", "editing", "normalizing", "valid", "invalid", "saved"].indexOf(value.status) < 0) return false;
    if (!value.active) return value.sessionId === "" && value.targetId === "" && value.target === null && value.text === "" && value.allowsLineBreaks === false && value.status === "clean";
    var target = value.target;
    return Boolean(
      typeof value.sessionId === "string" && /^[A-Za-z0-9-]{1,96}$/.test(value.sessionId) &&
      value.revision > 0 &&
      typeof value.targetId === "string" && /^[a-f0-9]{24}$/.test(value.targetId) &&
      typeof value.text === "string" && value.text.length <= MAX_EDITOR_TEXT &&
      target && typeof target === "object" &&
      target.schemaVersion === VERSION &&
      typeof target.targetNodeId === "string" && /^ch1:[a-f0-9]{24}:[1-9][0-9]*$/.test(target.targetNodeId) &&
      target.geometry && typeof target.geometry === "object" &&
      ["x", "y", "width", "height"].every(function(key) { return Number.isFinite(target.geometry[key]) && Math.abs(target.geometry[key]) <= 10000000; }) &&
      target.geometry.width >= 0 && target.geometry.height >= 0 &&
      target.viewport && typeof target.viewport === "object" &&
      Number.isInteger(target.viewport.width) && target.viewport.width >= 240 && target.viewport.width <= 2560 &&
      Number.isInteger(target.viewport.height) && target.viewport.height >= 240 && target.viewport.height <= 2000 &&
      typeof target.visible === "boolean" &&
      validInlinePresentation(target.presentation)
    );
  }

  function inlineEditorStatusText(status) {
    if (status === "normalizing") return "Checking…";
    if (status === "saved") return "Saved draft";
    if (status === "valid") return "Ready to save";
    if (status === "invalid") return "Fix this text before saving";
    return "Draft";
  }

  function removeHostedInlineEditor() {
    if (hostedInlineEditorPositionHandle) {
      window.cancelAnimationFrame(hostedInlineEditorPositionHandle);
      hostedInlineEditorPositionHandle = 0;
    }
    if (hostedInlineEditor && hostedInlineEditor.parentNode) hostedInlineEditor.parentNode.removeChild(hostedInlineEditor);
    hostedInlineEditor = null;
    hostedInlineEditorField = null;
    hostedInlineEditorStatus = null;
    hostedInlineEditorCommand = null;
    hostedInlineEditorInputRevision = 0;
  }

  function positionHostedInlineEditor() {
    hostedInlineEditorPositionHandle = 0;
    var command = hostedInlineEditorCommand;
    var frame = hostedCourseFrame;
    if (!hostMode || !hostedInlineEditor || !command || !command.active || !frame || !command.target || !command.target.visible) {
      if (hostedInlineEditor) hostedInlineEditor.style.display = "none";
      return;
    }
    var frameRect = frame.getBoundingClientRect();
    var target = command.target;
    var scaleX = frameRect.width / Math.max(1, target.viewport.width);
    var scaleY = frameRect.height / Math.max(1, target.viewport.height);
    hostedInlineEditor.style.display = "block";
    hostedInlineEditor.style.left = Math.round(frameRect.left + target.geometry.x * scaleX) + "px";
    hostedInlineEditor.style.top = Math.round(frameRect.top + target.geometry.y * scaleY) + "px";
    hostedInlineEditor.style.width = Math.max(1, Math.round(target.geometry.width * scaleX)) + "px";
    hostedInlineEditor.style.minHeight = Math.max(1, Math.round(target.geometry.height * scaleY)) + "px";
  }

  function scheduleHostedInlineEditorPosition() {
    if (!hostedInlineEditor || hostedInlineEditorPositionHandle) return;
    hostedInlineEditorPositionHandle = window.requestAnimationFrame(positionHostedInlineEditor);
  }

  function hostedInlineEditorText() {
    if (!hostedInlineEditorField) return "";
    return String(hostedInlineEditorField.innerText || hostedInlineEditorField.textContent || "").replace(/\r\n?/g, "\n");
  }

  function sendHostedInlineEditorAction(action) {
    var command = hostedInlineEditorCommand;
    if (!command || !command.active || !hostMode) return;
    var revision = hostedInlineEditorInputRevision + 1;
    hostedInlineEditorInputRevision = revision;
    var payload = {
      action: action,
      sessionId: command.sessionId,
      revision: revision,
      targetId: command.targetId
    };
    if (action === "input") {
      var text = hostedInlineEditorText();
      if (text.length > MAX_EDITOR_TEXT) {
        if (hostedInlineEditorStatus) hostedInlineEditorStatus.textContent = "Text is too long to save.";
        if (hostedInlineEditorField) hostedInlineEditorField.setAttribute("aria-invalid", "true");
        return;
      }
      payload.text = text;
      if (hostedInlineEditorField) hostedInlineEditorField.removeAttribute("aria-invalid");
    }
    send("preview-inline-editor-action", payload);
  }

  function setHostedInlinePresentation(field, presentation) {
    if (!field || !presentation) return;
    field.style.fontFamily = presentation.fontFamily;
    field.style.fontSize = presentation.fontSize;
    field.style.fontWeight = presentation.fontWeight;
    field.style.fontStyle = presentation.fontStyle;
    field.style.lineHeight = presentation.lineHeight;
    field.style.letterSpacing = presentation.letterSpacing;
    field.style.textAlign = presentation.textAlign;
    field.style.color = presentation.color;
    field.style.whiteSpace = presentation.whiteSpace === "nowrap" ? "pre-wrap" : presentation.whiteSpace;
  }

  function configureHostedPlainTextEditor(field) {
    if (!field) return;
    // Native plaintext-only support is inconsistent: some browser engines
    // advertise it but accept focus without accepting teacher keystrokes.
    // The trusted host instead uses the broadly supported editor mode and
    // enforces plain text at every browser and server boundary.
    field.setAttribute("contenteditable", "true");
    field.setAttribute("data-canvas-helper-plain-text-fallback", "true");
  }

  function applyHostedInlineEditorCommand(command) {
    if (!hostMode || !validHostedInlineEditorCommand(command)) return;
    if (!command.active) {
      removeHostedInlineEditor();
      return;
    }
    var previous = hostedInlineEditorCommand;
    if (previous && previous.sessionId === command.sessionId && command.revision < previous.revision) return;
    var newSession = !previous || previous.sessionId !== command.sessionId;
    hostedInlineEditorCommand = command;
    if (!hostedInlineEditor) {
      var stage = document.createElement("div");
      stage.setAttribute("data-canvas-helper-full-preview-inline-editor", "true");
      stage.style.position = "fixed";
      // The in-place caret and its attached controls must remain reachable
      // even when the Full Preview Draft Changes surface is open below it.
      stage.style.zIndex = "2147483647";
      stage.style.boxSizing = "border-box";
      stage.style.pointerEvents = "none";
      stage.style.background = "rgba(255,255,255,.88)";
      var field = document.createElement("div");
      field.setAttribute("data-testid", "course-full-preview-inline-text-editor");
      field.setAttribute("role", "textbox");
      field.setAttribute("aria-label", "Edit course text in place");
      configureHostedPlainTextEditor(field);
      field.setAttribute("spellcheck", "true");
      field.setAttribute("tabindex", "0");
      field.style.boxSizing = "border-box";
      field.style.display = "block";
      field.style.width = "100%";
      field.style.minHeight = "inherit";
      field.style.margin = "0";
      field.style.padding = "0";
      field.style.overflow = "hidden";
      field.style.border = "1px solid #1473e6";
      field.style.outline = "2px solid rgba(20,115,230,.35)";
      field.style.outlineOffset = "1px";
      field.style.background = "transparent";
      field.style.caretColor = "currentColor";
      field.style.cursor = "text";
      field.style.pointerEvents = "auto";
      field.style.userSelect = "text";
      field.addEventListener("input", function() {
        if (!field.hasAttribute("data-canvas-helper-composing")) sendHostedInlineEditorAction("input");
      });
      field.addEventListener("compositionstart", function() { field.setAttribute("data-canvas-helper-composing", "true"); });
      field.addEventListener("compositionend", function() {
        field.removeAttribute("data-canvas-helper-composing");
        sendHostedInlineEditorAction("input");
      });
      field.addEventListener("paste", function(event) {
        event.preventDefault();
        var text = event.clipboardData ? String(event.clipboardData.getData("text/plain") || "") : "";
        if (!hostedInlineEditorCommand || !hostedInlineEditorCommand.allowsLineBreaks) text = text.replace(/\r?\n/g, " ");
        try { document.execCommand("insertText", false, text); } catch (_) { field.textContent += text; }
        sendHostedInlineEditorAction("input");
      });
      field.addEventListener("beforeinput", function(event) {
        var inputType = String(event.inputType || "");
        if (inputType === "insertFromDrop" || inputType === "insertFromPaste" || inputType.indexOf("format") === 0) event.preventDefault();
      });
      field.addEventListener("drop", function(event) { event.preventDefault(); });
      field.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
          event.preventDefault();
          sendHostedInlineEditorAction("cancel");
          return;
        }
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          event.preventDefault();
          sendHostedInlineEditorAction("save");
          return;
        }
        if (event.key === "Enter" && (!hostedInlineEditorCommand || !hostedInlineEditorCommand.allowsLineBreaks)) event.preventDefault();
      });
      var toolbar = document.createElement("div");
      toolbar.style.position = "absolute";
      toolbar.style.top = "-20px";
      toolbar.style.left = "0";
      toolbar.style.display = "inline-flex";
      toolbar.style.alignItems = "center";
      toolbar.style.gap = "4px";
      toolbar.style.pointerEvents = "auto";
      var status = document.createElement("span");
      status.setAttribute("data-canvas-helper-full-preview-inline-editor-status", "true");
      status.setAttribute("aria-live", "polite");
      status.style.padding = "2px 6px";
      status.style.border = "1px solid #64748b";
      status.style.borderRadius = "4px";
      status.style.color = "#18212f";
      status.style.background = "#ffffff";
      status.style.font = "600 11px/1.2 system-ui, sans-serif";
      status.style.pointerEvents = "none";
      var options = document.createElement("button");
      options.type = "button";
      options.setAttribute("data-testid", "course-full-preview-inline-options");
      options.textContent = "Format & options";
      options.style.padding = "2px 6px";
      options.style.border = "1px solid #64748b";
      options.style.borderRadius = "4px";
      options.style.color = "#18212f";
      options.style.background = "#ffffff";
      options.style.font = "600 11px/1.2 system-ui, sans-serif";
      options.style.cursor = "pointer";
      options.addEventListener("mousedown", function(event) { event.preventDefault(); });
      options.addEventListener("click", function() {
        var active = hostedInlineEditorCommand;
        if (!active || !active.active) return;
        sendEditAction({ action: "open-target-options", targetId: active.targetId });
      });
      stage.appendChild(field);
      toolbar.appendChild(status);
      toolbar.appendChild(options);
      stage.appendChild(toolbar);
      (document.body || document.documentElement).appendChild(stage);
      hostedInlineEditor = stage;
      hostedInlineEditorField = field;
      hostedInlineEditorStatus = status;
    }
    if (hostedInlineEditorField) {
      hostedInlineEditorField.setAttribute("aria-multiline", command.allowsLineBreaks ? "true" : "false");
      configureHostedPlainTextEditor(hostedInlineEditorField);
      setHostedInlinePresentation(hostedInlineEditorField, command.target.presentation);
      if (!hostedInlineEditorField.hasAttribute("data-canvas-helper-composing") && hostedInlineEditorField.textContent !== command.text) {
        hostedInlineEditorField.textContent = command.text;
      }
    }
    if (hostedInlineEditorStatus) hostedInlineEditorStatus.textContent = inlineEditorStatusText(command.status);
    if (
      editHtml &&
      editState.target &&
      editState.target.targetId === command.targetId &&
      document.activeElement !== editHtml &&
      editHtml.textContent !== command.text
    ) {
      editHtml.textContent = command.text;
    }
    scheduleHostedInlineEditorPosition();
    if (newSession && hostedInlineEditorField) {
      window.requestAnimationFrame(function() {
        if (!hostedInlineEditorField || hostedInlineEditorCommand !== command) return;
        try {
          hostedInlineEditorField.focus({ preventScroll: true });
          var range = document.createRange();
          range.selectNodeContents(hostedInlineEditorField);
          range.collapse(false);
          var selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch (_) {}
      });
    }
  }

  function editMapDistanceToRect(x, y, rect) {
    var dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
    var dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function editMapTargetForPointer(target, x, y) {
    var element = target instanceof Element ? target : null;
    if (!element) return null;
    var firstBlocked = null;
    var cursor = element;
    while (cursor && cursor !== document.documentElement) {
      var runtime = mapRuntimeForElement(cursor);
      if (runtime && runtime.state !== "blocked") return runtime;
      if (runtime && !firstBlocked) firstBlocked = runtime;
      cursor = cursor.parentElement;
    }
    var candidates = element.querySelectorAll ? element.querySelectorAll("[" + NODE_ATTRIBUTE + "]") : [];
    var nearest = null;
    var nearestDistance = Infinity;
    for (var index = 0; index < candidates.length && index < 300; index += 1) {
      var candidateRuntime = mapRuntimeForElement(candidates[index]);
      if (!candidateRuntime || candidateRuntime.state === "blocked" || !isVisibleCourseElement(candidateRuntime.element)) continue;
      var candidateRect = candidateRuntime.element.getBoundingClientRect();
      var distance = editMapDistanceToRect(x, y, candidateRect);
      if (distance < nearestDistance) {
        nearest = candidateRuntime;
        nearestDistance = distance;
      }
    }
    if (nearest && nearestDistance <= 36) return nearest;
    if (firstBlocked) return firstBlocked;
    return {
      element: element,
      state: "blocked",
      action: "annotation-only",
      label: "Annotation only",
      reason: uniqueSourceNodeId(element)
        ? "This is layout or interactive course structure. Select its text, link, or image, or annotate it for Codex."
        : "This content was created at runtime and has no stable course-source target. Annotate it for Codex.",
      nodeId: uniqueSourceNodeId(element) || ""
    };
  }

  function boundedCourseUrl(value) {
    var serialized = value instanceof URL ? value.toString() : value;
    if (typeof serialized !== "string" || serialized.length < 1 || serialized.length > MAX_COURSE_URL) return null;
    try {
      var url = new URL(serialized, hostMode ? PREVIEW_ORIGIN : location.origin);
    var match = url.pathname.match(new RegExp("^/_canvas-helper/p/([A-Za-z0-9-]{" + MIN_PREVIEW_CAPABILITY_TOKEN + "," + MAX_PREVIEW_CAPABILITY_TOKEN + "})(/preview/workspace/([^/]+)(?:/.*)?)$"));
      if (url.protocol !== "http:" || url.hostname !== "127.0.0.1" || !match) return null;
      url.searchParams.delete(STANDALONE_SESSION_PARAM);
      url.searchParams.delete(STANDALONE_REJOIN_PARAM);
      url.searchParams.delete(CAPTURE_PARAM);
      return {
        url: url,
        publicPrefix: "/_canvas-helper/p/" + match[1],
        previewPath: match[2],
        scope: match[3]
      };
    } catch (_) {
      return null;
    }
  }

  function pageIdentity(value) {
    var parsed = boundedCourseUrl(value);
    return parsed ? parsed.url.toString() : "";
  }

  function rebaseCourseUrl(value, currentValue, requiredOrigin) {
    var saved = boundedCourseUrl(value);
    var current = boundedCourseUrl(currentValue);
    if (!saved || !current || current.url.origin !== requiredOrigin || saved.scope !== current.scope) return null;
    saved.url.protocol = current.url.protocol;
    saved.url.host = current.url.host;
    saved.url.pathname = current.publicPrefix + saved.previewPath;
    return saved.url;
  }

  function isReviewScreenshotPath(value) {
    return typeof value === "string" && new RegExp("^\\.runtime/studio-review-sets/[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}/[A-Za-z0-9._-]+\\.png$").test(value);
  }

  function reviewScreenshotUrl(filePath, item) {
    var screenshot = item && Array.isArray(item.screenshots)
      ? item.screenshots.find(function(candidate) { return candidate.filePath === filePath; })
      : null;
    if (
      !isReviewScreenshotPath(filePath) ||
      !(new RegExp("^[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}$")).test(reviewState.sessionId) ||
      !item ||
      typeof item.projectSlug !== "string" ||
      typeof item.id !== "string" ||
      !screenshot ||
      typeof screenshot.ownerNodeId !== "string"
    ) return "";
    var params = new URLSearchParams({
      path: filePath,
      sessionId: reviewState.sessionId,
      projectSlug: item.projectSlug,
      itemId: item.id,
      ownerNodeId: screenshot.ownerNodeId
    });
    return STUDIO_ORIGIN + "/api/inspection/screenshots?" + params.toString();
  }

  function closeReviewLightbox() {
    if (!reviewLightbox) return;
    var trigger = reviewLightbox.__canvasHelperTrigger;
    try { reviewLightbox.remove(); } catch (_) {}
    reviewLightbox = null;
    if (trigger && typeof trigger.focus === "function") window.setTimeout(function() { trigger.focus(); }, 0);
  }

  function openReviewLightbox(filePath, label, trigger, item) {
    var imageUrl = reviewScreenshotUrl(filePath, item);
    if (!imageUrl) return;
    closeReviewLightbox();
    var dialog = document.createElement("div");
    dialog.setAttribute("data-canvas-helper-preview-controls", "true");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-label", label);
    dialog.style.position = "fixed";
    dialog.style.inset = "0";
    dialog.style.zIndex = "2147483647";
    dialog.style.display = "grid";
    dialog.style.placeItems = "center";
    dialog.style.padding = "24px";
    dialog.style.background = "rgba(15, 23, 42, 0.72)";
    dialog.__canvasHelperTrigger = trigger;

    var content = document.createElement("div");
    content.style.width = "min(980px, 100%)";
    content.style.maxHeight = "calc(100vh - 48px)";
    content.style.padding = "12px";
    content.style.overflow = "auto";
    content.style.borderRadius = "8px";
    content.style.background = "#ffffff";

    var close = document.createElement("button");
    close.type = "button";
    close.textContent = "Close";
    close.setAttribute("aria-label", "Close screenshot preview");
    stylePreviewControlButton(close);
    close.style.display = "block";
    close.style.margin = "0 0 8px auto";
    close.addEventListener("click", closeReviewLightbox);

    var image = document.createElement("img");
    image.src = imageUrl;
    image.alt = label;
    image.decoding = "async";
    image.style.display = "block";
    image.style.width = "100%";
    image.style.height = "auto";

    content.appendChild(close);
    content.appendChild(image);
    dialog.appendChild(content);
    dialog.addEventListener("click", function(event) { if (event.target === dialog) closeReviewLightbox(); });
    dialog.addEventListener("keydown", function(event) {
      if (event.key === "Tab") {
        event.preventDefault();
        close.focus();
      }
    });
    (document.body || document.documentElement).appendChild(dialog);
    reviewLightbox = dialog;
    close.focus();
  }

  function isFiniteCoordinate(value) {
    return typeof value === "number" && isFinite(value) && Math.abs(value) <= 10000000;
  }

  function isScrollState(value) {
    if (!value || typeof value !== "object" || !isFiniteCoordinate(value.windowTop) || !isFiniteCoordinate(value.windowLeft) || !Array.isArray(value.containers) || value.containers.length > MAX_CONTAINERS) return false;
    return value.containers.every(function(container) {
      return container && typeof container.selector === "string" && container.selector.length <= MAX_SCROLL_SELECTOR && isFiniteCoordinate(container.top) && isFiniteCoordinate(container.left);
    });
  }

  function escapeSelectorToken(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function getElementSelector(element) {
    if (element.id) return "#" + escapeSelectorToken(element.id);
    var parts = [];
    var current = element;
    var depth = 0;
    while (current && depth < 8) {
      var tagName = current.tagName.toLowerCase();
      var selector = tagName;
      if (current.id) {
        selector += "#" + escapeSelectorToken(current.id);
        parts.unshift(selector);
        break;
      }
      var parent = current.parentElement;
      if (parent) {
        var siblings = Array.prototype.filter.call(parent.children, function(child) { return child.tagName === current.tagName; });
        if (siblings.length > 1) selector += ":nth-of-type(" + (siblings.indexOf(current) + 1) + ")";
      }
      parts.unshift(selector);
      current = parent;
      depth += 1;
    }
    return parts.join(" > ");
  }

  function isScrollable(element) {
    var style = window.getComputedStyle(element);
    var canScrollY = /(auto|scroll|overlay)/.test(style.overflowY) && element.scrollHeight - element.clientHeight > 24;
    var canScrollX = /(auto|scroll|overlay)/.test(style.overflowX) && element.scrollWidth - element.clientWidth > 24;
    return canScrollX || canScrollY;
  }

  function captureScrollState() {
    var containers = [];
    var selectors = lastSelectors || [];
    if (!scrollSelectorsInitialized) {
      var seen = {};
      var candidates = Array.prototype.slice.call(document.querySelectorAll("body *"), 0, 12000)
        .filter(isScrollable)
        .map(function(element) { return { element: element, selector: getElementSelector(element), score: Math.max(element.scrollHeight - element.clientHeight, element.scrollWidth - element.clientWidth) }; })
        .sort(function(left, right) { return right.score - left.score; })
        .filter(function(candidate) { if (!candidate.selector || seen[candidate.selector]) return false; seen[candidate.selector] = true; return true; })
        .slice(0, MAX_CONTAINERS);
      selectors = candidates.map(function(candidate) { return candidate.selector; });
      containers = candidates.map(function(candidate) { return { selector: candidate.selector, top: candidate.element.scrollTop, left: candidate.element.scrollLeft }; });
      scrollSelectorsInitialized = true;
    } else {
      selectors.forEach(function(selector) {
        var element;
        try { element = document.querySelector(selector); } catch (_) { element = null; }
        if (element && isScrollable(element)) containers.push({ selector: selector, top: element.scrollTop, left: element.scrollLeft });
      });
    }
    lastSelectors = selectors;
    return { windowTop: window.scrollY, windowLeft: window.scrollX, containers: containers };
  }

  function sendScrollState() { send("preview-scroll-state", captureScrollState()); }

  function scheduleScrollState() {
    if (scrollHandle) return;
    scrollHandle = window.requestAnimationFrame(function() { scrollHandle = 0; sendScrollState(); });
  }

  function restoreScrollState(state) {
    if (!isScrollState(state)) return;
    function apply() {
      window.scrollTo(state.windowLeft, state.windowTop);
      state.containers.forEach(function(container) {
        var element;
        try { element = document.querySelector(container.selector); } catch (_) { element = null; }
        if (!element) return;
        element.scrollTop = container.top;
        element.scrollLeft = container.left;
      });
    }
    window.requestAnimationFrame(function() {
      apply();
      window.setTimeout(apply, 80);
      window.setTimeout(apply, 260);
    });
  }

  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("data-canvas-helper-preview-selection-overlay", "true");
    overlay.style.position = "fixed";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "2147483645";
    overlay.style.border = "2px solid #1473e6";
    overlay.style.background = "rgba(20, 115, 230, 0.08)";
    overlay.style.boxShadow = "0 0 0 1px rgba(255,255,255,0.9), 0 0 0 4px rgba(20,115,230,0.18)";
    overlay.style.borderRadius = "3px";
    overlay.style.display = "none";
    (document.documentElement || document.body).appendChild(overlay);
    return overlay;
  }

  function setOverlay(rect, appearance) {
    var element = ensureOverlay();
    if (appearance === "editable") {
      element.style.border = "2px solid #18794e";
      element.style.background = "rgba(24,121,78,.08)";
      element.style.boxShadow = "0 0 0 1px rgba(255,255,255,.9),0 0 0 4px rgba(24,121,78,.16)";
    } else if (appearance === "rename") {
      element.style.border = "2px solid #58448a";
      element.style.background = "rgba(88,68,138,.08)";
      element.style.boxShadow = "0 0 0 1px rgba(255,255,255,.9),0 0 0 4px rgba(88,68,138,.15)";
    } else if (appearance === "blocked") {
      element.style.border = "2px dashed #8a5d13";
      element.style.background = "rgba(138,93,19,.06)";
      element.style.boxShadow = "0 0 0 1px rgba(255,255,255,.9)";
    } else {
      element.style.border = "2px solid #1473e6";
      element.style.background = "rgba(20,115,230,.08)";
      element.style.boxShadow = "0 0 0 1px rgba(255,255,255,.9),0 0 0 4px rgba(20,115,230,.18)";
    }
    element.style.left = Math.max(0, rect.left) + "px";
    element.style.top = Math.max(0, rect.top) + "px";
    element.style.width = Math.max(0, rect.width) + "px";
    element.style.height = Math.max(0, rect.height) + "px";
    element.style.display = "block";
  }

  function hideOverlay() { if (overlay) overlay.style.display = "none"; }

  function stylePreviewControlButton(control) {
    control.style.padding = "7px 9px";
    control.style.border = "1px solid #64748b";
    control.style.borderRadius = "6px";
    control.style.background = "#ffffff";
    control.style.color = "#18212f";
    control.style.font = "600 13px/1.2 system-ui, sans-serif";
    control.style.cursor = "pointer";
  }

  function stylePreviewTextArea(control) {
    control.style.boxSizing = "border-box";
    control.style.width = "100%";
    control.style.padding = "8px";
    control.style.border = "1px solid #cbd5e1";
    control.style.borderRadius = "6px";
    control.style.background = "#ffffff";
    control.style.color = "#18212f";
    control.style.font = "13px/1.35 system-ui, sans-serif";
    control.style.resize = "vertical";
  }

  function setStandaloneStatus(value) {
    if (previewStatus) previewStatus.textContent = boundedString(value, 120);
  }

  function clearHostedCourseHealthTimeout() {
    if (!hostedCourseHealthTimer) return;
    window.clearTimeout(hostedCourseHealthTimer);
    hostedCourseHealthTimer = 0;
  }

  function setHostedCourseRecovery(message) {
    hostedCourseRecoveryMessage = boundedString(message, 120);
    if (standaloneRetryControl) standaloneRetryControl.style.display = hostedCourseRecoveryMessage ? "inline-flex" : "none";
    if (hostedCourseRecoveryMessage) setStandaloneStatus(hostedCourseRecoveryMessage);
  }

  function scheduleHostedCourseHealthTimeout() {
    if (!hostMode) return;
    clearHostedCourseHealthTimeout();
    hostedCourseHealthTimer = window.setTimeout(function() {
      hostedCourseHealthTimer = 0;
      if (!hostedCourseHealth || hostedCourseHealth.status !== "ready") {
        setHostedCourseRecovery("Course content did not finish loading. Retry or return to Studio.");
      }
    }, 12000);
  }

  function clearHostedCourseConnectRetry() {
    if (hostedCourseConnectTimer) {
      window.clearTimeout(hostedCourseConnectTimer);
      hostedCourseConnectTimer = 0;
    }
  }

  function clearHostedCourseHandshakeTimeout() {
    if (!hostedCourseHandshakeTimer) return;
    window.clearTimeout(hostedCourseHandshakeTimer);
    hostedCourseHandshakeTimer = 0;
  }

  function closeHostedCoursePort() {
    if (hostedCoursePort) {
      try { hostedCoursePort.close(); } catch (_) {}
      hostedCoursePort = null;
    }
  }

  function resetHostedCourseConnection() {
    clearHostedCourseHandshakeTimeout();
    hostedCourseConnectPending = false;
    closeHostedCoursePort();
  }

  function scheduleHostedCourseHandshakeTimeout() {
    clearHostedCourseHandshakeTimeout();
    hostedCourseHandshakeTimer = window.setTimeout(function() {
      hostedCourseHandshakeTimer = 0;
      if (!hostedCourseConnectPending) return;
      resetHostedCourseConnection();
      scheduleHostedCourseConnectRetry();
    }, 600);
  }

  function scheduleHostedCourseConnectRetry() {
    if (
      !hostMode ||
      hostedCourseConnectTimer ||
      hostedCourseConnectAttempts >= MAX_HOSTED_COURSE_CONNECT_ATTEMPTS
    ) return;
    hostedCourseConnectAttempts += 1;
    hostedCourseConnectTimer = window.setTimeout(function() {
      hostedCourseConnectTimer = 0;
      connectHostedCourse();
    }, 50);
  }

  function updateStandaloneControls(options) {
    if (!inspectControl) return;
    var canEditHere = hostMode || window.top !== window;
    inspectControl.textContent = inspectEnabled && !editModeEnabled ? "Annotating" : "Annotate";
    inspectControl.setAttribute("aria-pressed", inspectEnabled && !editModeEnabled ? "true" : "false");
    inspectControl.style.background = "#ffffff";
    inspectControl.style.color = inspectEnabled && !editModeEnabled ? "#1473e6" : "#18212f";
    if (editControl) {
      editControl.textContent = canEditHere ? (editModeEnabled ? "Editing" : "Edit") : "Drafts";
      editControl.setAttribute("aria-pressed", canEditHere && editModeEnabled ? "true" : "false");
      editControl.disabled = canEditHere ? (!editState.available || editState.busy) : editState.busy;
      editControl.style.opacity = editControl.disabled ? "0.48" : "1";
      editControl.style.color = canEditHere && editModeEnabled ? "#1473e6" : "#18212f";
    }
    if (previewControls) {
      previewControls.style.background = inspectEnabled ? "#1473e6" : "#ffffff";
      previewControls.style.borderColor = inspectEnabled ? "#0f63cc" : "#64748b";
      previewControls.style.color = inspectEnabled ? "#ffffff" : "#18212f";
    }
    if (previewStatus) previewStatus.style.color = inspectEnabled ? "#ffffff" : "#475569";
    if (hostMode && inspectEnabled && !hostedCourseInteractionReady) {
      setStandaloneStatus(hostedCourseRecoveryMessage || "Preparing safe editing…");
    } else if (inspectEnabled) {
      setStandaloneStatus(
        studioConnected
          ? editModeEnabled
            ? editState.target
              ? "Selection ready to edit."
              : "Click text, a link, or an image to edit it."
            : reviewSelection
              ? "Selection ready."
              : "Click anything in the course to annotate it."
          : port
            ? "Connecting to Studio..."
            : "Open this preview from Studio to save annotations."
      );
    } else {
      setStandaloneStatus(studioConnected ? "Connected to Studio." : port ? "Connecting to Studio..." : "Open this preview from Studio to save annotations.");
    }
    if (hostMode && hostedCourseRecoveryMessage) setStandaloneStatus(hostedCourseRecoveryMessage);
    if (!options || options.renderReview !== false) renderReviewPanel();
    renderEditPanel();
  }

  function sendEditAction(action) {
    if (!studioConnected || !port) {
      if (editMessage) editMessage.textContent = "Open this preview from Studio to edit courses.";
      return false;
    }
    if (action.action !== "request-state") {
      var requestId = "edit-" + (++editActionSequence);
      latestEditActionId = requestId;
      action = Object.assign({}, action, { requestId: requestId });
    }
    send("preview-edit-action", action);
    return action.requestId || true;
  }

  function setEditPanelOpen(open) {
    editPanelOpen = Boolean(open);
    renderEditPanel();
  }

  function resetEditPanelPosition() {
    if (!editPanel) return;
    if (editPanelPositionHandle) {
      window.cancelAnimationFrame(editPanelPositionHandle);
      editPanelPositionHandle = 0;
    }
    editPanel.style.position = "absolute";
    editPanel.style.left = "0";
    editPanel.style.top = "";
    editPanel.style.right = "";
    editPanel.style.bottom = "calc(100% + 8px)";
    editPanel.style.width = "min(460px, calc(100vw - 24px))";
    editPanel.style.maxHeight = "min(72vh, 680px)";
    editPanel.removeAttribute("data-canvas-helper-preview-edit-panel-placement");
  }

  function positionEditPanelAtSelection() {
    editPanelPositionHandle = 0;
    var target = editState.target;
    var selection = editLastSelection;
    if (
      !editPanel ||
      !editPanelOpen ||
      !hostMode ||
      !target ||
      hostedInlineEditorMatchesTarget(target) ||
      !selection ||
      !selection.geometry ||
      !selection.viewport ||
      !hostedCourseFrame
    ) {
      resetEditPanelPosition();
      return;
    }
    var geometry = selection.geometry;
    var viewport = selection.viewport;
    if (
      !Number.isFinite(geometry.x) || !Number.isFinite(geometry.y) ||
      !Number.isFinite(geometry.width) || !Number.isFinite(geometry.height) ||
      !Number.isFinite(viewport.width) || !Number.isFinite(viewport.height) ||
      viewport.width <= 0 || viewport.height <= 0
    ) {
      resetEditPanelPosition();
      return;
    }
    var frameRect = hostedCourseFrame.getBoundingClientRect();
    var scaleX = frameRect.width / Math.max(1, viewport.width);
    var scaleY = frameRect.height / Math.max(1, viewport.height);
    var selectedLeft = frameRect.left + geometry.x * scaleX;
    var selectedTop = frameRect.top + geometry.y * scaleY;
    var selectedBottom = selectedTop + Math.max(1, geometry.height * scaleY);
    var width = Math.min(460, Math.max(288, window.innerWidth - 24));
    var left = Math.max(12, Math.min(selectedLeft, window.innerWidth - width - 12));
    var panelHeight = Math.min(680, Math.max(240, editPanel.scrollHeight || 360));
    var belowTop = selectedBottom + 10;
    var placeAbove = belowTop + Math.min(panelHeight, window.innerHeight - 24) > window.innerHeight - 12;
    var top = placeAbove
      ? Math.max(12, selectedTop - Math.min(panelHeight, window.innerHeight - 24) - 10)
      : Math.max(12, belowTop);
    editPanel.style.position = "fixed";
    editPanel.style.left = Math.round(left) + "px";
    editPanel.style.top = Math.round(top) + "px";
    editPanel.style.right = "";
    editPanel.style.bottom = "";
    editPanel.style.width = Math.round(width) + "px";
    editPanel.style.maxHeight = Math.max(180, window.innerHeight - top - 12) + "px";
    editPanel.setAttribute("data-canvas-helper-preview-edit-panel-placement", placeAbove ? "above-selection" : "below-selection");
  }

  function scheduleEditPanelPosition() {
    if (!editPanel || editPanelPositionHandle) return;
    editPanelPositionHandle = window.requestAnimationFrame(positionEditPanelAtSelection);
  }

  function editControlValue(name, fallback) {
    if (!editStyleControls) return fallback;
    var control = editStyleControls[name];
    return control ? control.value : fallback;
  }

  function currentEditSource() {
    if (editState.target) return {
      originalHtml: editState.target.originalHtml || "",
      capabilities: editState.target.capabilities,
      attributes: editState.target.attributes,
      currentStyle: editState.target.currentStyle
    };
    if (!editState.selectedDraft) return null;
    return editState.selectedDraft.baseline;
  }

  function hostedInlineEditorMatchesTarget(target) {
    return Boolean(
      hostMode &&
      hostedInlineEditorCommand &&
      hostedInlineEditorCommand.active &&
      target &&
      target.targetId === hostedInlineEditorCommand.targetId
    );
  }

  function currentEditPatch() {
    var source = currentEditSource();
    if (!source) return null;
    var patch = {};
    var htmlValue = editHtml ? editHtml.innerHTML : "";
    if (source.capabilities.richText && editHtml && htmlValue !== source.originalHtml) patch.html = htmlValue;
    if (source.capabilities.link && editHref && editHref.value !== source.attributes.href) patch.href = editHref.value;
    if (source.capabilities.image) {
      if (editSrc && editSrc.value !== source.attributes.src) patch.src = editSrc.value;
      if (editAlt && editAlt.value !== source.attributes.alt) patch.alt = editAlt.value;
    }
    if (editTitle && editTitle.value !== source.attributes.title) patch.title = editTitle.value;
    if (source.capabilities.styles) {
      var style = {};
      (source.capabilities.styleKeys || []).forEach(function(key) {
        var value = editControlValue(key, source.currentStyle[key] || "default");
        if (value !== source.currentStyle[key]) style[key] = value;
      });
      if (Object.keys(style).length) patch.style = style;
    }
    return Object.keys(patch).length ? patch : null;
  }

  function scheduleEditComposerPreview() {
    if (editPreviewActionTimer) window.clearTimeout(editPreviewActionTimer);
    editPreviewActionTimer = window.setTimeout(function() {
      editPreviewActionTimer = 0;
      var target = editState.target;
      if (!target || target.eligibility !== "editable" || editState.busy) return;
      if (hostedInlineEditorMatchesTarget(target) && editHtml) {
        var inlineText = String(editHtml.innerText || editHtml.textContent || "").replace(/\r\n?/g, "\n");
        if (hostedInlineEditorField && hostedInlineEditorField.textContent !== inlineText) hostedInlineEditorField.textContent = inlineText;
        sendHostedInlineEditorAction("input");
        return;
      }
      var patch = currentEditPatch();
      if (patch) sendEditAction({ action: "preview-target", targetId: target.targetId, patch: patch });
      else sendEditAction({ action: "clear-preview", targetId: target.targetId });
    }, 180);
  }

  function setEditFieldVisibility(control, visible) {
    if (control && control.parentElement) control.parentElement.style.display = visible ? "block" : "none";
  }

  function populateEditComposer() {
    if (window.top === window && !hostMode) {
      if (editTargetText) editTargetText.textContent = "Open this course through Studio to edit it safely.";
      setEditFieldVisibility(editHtml, false);
      if (editFormat) editFormat.style.display = "none";
      setEditFieldVisibility(editHref, false);
      setEditFieldVisibility(editSrc, false);
      setEditFieldVisibility(editAlt, false);
      setEditFieldVisibility(editTitle, false);
      if (editStyleControls && editStyleControls.container) editStyleControls.container.style.display = "none";
      if (editSave) editSave.style.display = "none";
      if (editAnnotate) editAnnotate.style.display = "none";
      return;
    }
    var target = editState.target;
    var selectedDraft = editState.selectedDraft && (!target || editState.selectedDraft.targetId === target.targetId)
      ? editState.selectedDraft
      : null;
    var source = currentEditSource();
    var inlineTextTarget = hostedInlineEditorMatchesTarget(target);
    var nextComposerKey = target
      ? "target:" + target.targetId + (selectedDraft ? ":draft:" + selectedDraft.id : "")
      : selectedDraft ? "draft:" + selectedDraft.id : "";
    if (editTargetText) editTargetText.textContent = inlineTextTarget
      ? "Editing this text in place. This editor stays synchronized with the selected course text."
      : target
      ? (target.originalText || target.tagName || "Selected element")
      : selectedDraft
        ? "Editing saved draft: " + (selectedDraft.afterText || selectedDraft.tagName || "Draft change")
        : editState.available ? "Click a course element to edit it." : editState.unavailableReason || "This course is annotation-only.";
    setEditFieldVisibility(editHtml, Boolean(inlineTextTarget || (source && source.capabilities.richText)));
    if (editFormat) editFormat.style.display = !inlineTextTarget && source && source.capabilities.richText ? "flex" : "none";
    setEditFieldVisibility(editHref, Boolean(!inlineTextTarget && source && source.capabilities.link));
    setEditFieldVisibility(editSrc, Boolean(!inlineTextTarget && source && source.capabilities.image));
    setEditFieldVisibility(editAlt, Boolean(!inlineTextTarget && source && source.capabilities.image));
    setEditFieldVisibility(editTitle, Boolean(!inlineTextTarget && source));
    if (editStyleControls && editStyleControls.container) editStyleControls.container.style.display = !inlineTextTarget && source && source.capabilities.styles ? "grid" : "none";
    if (nextComposerKey && editComposerKey !== nextComposerKey) {
      editComposerKey = nextComposerKey;
      var selectedPatch = selectedDraft ? selectedDraft.patch || {} : {};
      if (editHtml) {
        if (inlineTextTarget && hostedInlineEditorCommand) editHtml.textContent = hostedInlineEditorCommand.text;
        else editHtml.innerHTML = selectedPatch.html !== undefined ? selectedPatch.html : source.originalHtml || "";
      }
      if (editHref) editHref.value = selectedPatch.href !== undefined ? selectedPatch.href || "" : source.attributes.href || "";
      if (editSrc) editSrc.value = selectedPatch.src !== undefined ? selectedPatch.src || "" : source.attributes.src || "";
      if (editAlt) editAlt.value = selectedPatch.alt !== undefined ? selectedPatch.alt || "" : source.attributes.alt || "";
      if (editTitle) editTitle.value = selectedPatch.title !== undefined ? selectedPatch.title || "" : source.attributes.title || "";
      var displayedStyle = Object.assign({}, source.currentStyle || {}, selectedPatch.style || {});
      if (editStyleControls) Object.keys(displayedStyle).forEach(function(key) { if (editStyleControls[key]) editStyleControls[key].value = displayedStyle[key]; });
    } else if (!nextComposerKey) {
      editComposerKey = "";
    }
    if (editSave) {
      editSave.textContent = inlineTextTarget ? "Save text draft" : selectedDraft ? "Update draft" : "Save draft change";
      editSave.disabled = (!target && !selectedDraft) || (target && target.eligibility !== "editable") || editState.busy;
      editSave.style.opacity = editSave.disabled ? "0.48" : "1";
    }
    if (editAnnotate) {
      var canAnnotateSelection = Boolean(target && target.eligibility === "unsupported" && editLastSelection);
      editAnnotate.style.display = canAnnotateSelection ? "inline-flex" : "none";
      editAnnotate.disabled = editState.busy || !studioConnected || !canAnnotateSelection;
    }
    [editHref, editSrc, editAlt, editTitle].forEach(function(control) {
      if (control) control.disabled = editState.busy;
    });
    if (editHtml) editHtml.contentEditable = editState.busy ? "false" : "true";
    if (editStyleControls) {
      Object.keys(editStyleControls).forEach(function(key) {
        if (key !== "container" && editStyleControls[key]) {
          editStyleControls[key].disabled = editState.busy || !source || (source.capabilities.styleKeys || []).indexOf(key) < 0;
          if (editStyleControls[key].parentElement) editStyleControls[key].parentElement.style.display = !source || (source.capabilities.styleKeys || []).indexOf(key) < 0 ? "none" : "block";
        }
      });
    }
  }

  function renderEditPanel() {
    if (!editPanel || !editToggle) return;
    var canEditHere = hostMode || window.top !== window;
    editToggle.textContent = "Draft Changes (" + editState.drafts.length + ")";
    editToggle.setAttribute("aria-expanded", editPanelOpen ? "true" : "false");
    editPanel.style.display = editPanelOpen ? "block" : "none";
    if (!editPanelOpen) {
      resetEditPanelPosition();
      return;
    }
    populateEditComposer();
    if (editItems) {
      while (editItems.firstChild) editItems.removeChild(editItems.firstChild);
      if (!editState.drafts.length) {
        var empty = document.createElement("p");
        empty.textContent = "No draft changes yet.";
        empty.style.margin = "0";
        empty.style.color = "#64748b";
        empty.style.fontSize = "12px";
        editItems.appendChild(empty);
      }
      editState.drafts.forEach(function(draft, index) {
        var row = document.createElement("div");
        row.setAttribute("data-canvas-helper-preview-edit-draft", "true");
        row.style.padding = "9px 0";
        row.style.borderTop = index ? "1px solid #e2e8f0" : "0";
        var summary = document.createElement("button");
        summary.type = "button";
        summary.textContent = (index + 1) + ". " + (draft.afterText || draft.tagName || "Draft change");
        stylePreviewControlButton(summary);
        summary.style.width = "100%";
        summary.style.textAlign = "left";
        summary.style.overflowWrap = "anywhere";
        summary.disabled = editState.busy || !canEditHere;
        summary.style.opacity = summary.disabled ? "0.48" : "1";
        if (canEditHere) summary.addEventListener("click", function() { sendEditAction({ action: "reopen-draft", draftId: draft.id }); });
        var actions = document.createElement("div");
        actions.style.display = "flex";
        actions.style.gap = "5px";
        actions.style.marginTop = "5px";
        [["↑", -1], ["↓", 1]].forEach(function(entry) {
          var move = document.createElement("button");
          move.type = "button";
          move.textContent = entry[0];
          move.setAttribute("aria-label", entry[1] < 0 ? "Move draft up" : "Move draft down");
          stylePreviewControlButton(move);
          move.disabled = true;
          if (canEditHere) {
            move.disabled = editState.busy || (entry[1] < 0 ? index === 0 : index === editState.drafts.length - 1);
            move.addEventListener("click", function() { sendEditAction({ action: "reorder-draft", draftId: draft.id, direction: entry[1] }); });
          }
          actions.appendChild(move);
        });
        var remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        stylePreviewControlButton(remove);
        remove.disabled = !canEditHere || editState.busy;
        if (canEditHere) remove.addEventListener("click", function() { sendEditAction({ action: "remove-draft", draftId: draft.id }); });
        actions.appendChild(remove);
        row.appendChild(summary);
        row.appendChild(actions);
        editItems.appendChild(row);
      });
    }
    if (editApply) {
      editApply.textContent = editState.busy ? "Working…" : "Apply " + editState.drafts.length + (editState.drafts.length === 1 ? " change" : " changes");
      editApply.disabled = !canEditHere || editState.busy || !editState.drafts.length;
      editApply.style.opacity = editApply.disabled ? "0.48" : "1";
    }
    if (editUndo) {
      editUndo.style.display = !canEditHere ? "none" : editState.canUndo ? "inline-flex" : "none";
      editUndo.disabled = true;
      if (canEditHere) editUndo.disabled = editState.busy;
    }
    if (editMessage) {
      var exportMessage = editState.exportsOutOfDate ? " Exports out of date: " + editState.staleExportTargets.join(", ") + "." : "";
      editMessage.textContent = boundedString((!canEditHere
        ? "Open this course through Studio to edit it safely."
        : editState.error || editState.status || editState.unavailableReason) + exportMessage, 300);
      editMessage.style.color = editState.error ? "#9a3412" : editState.exportsOutOfDate ? "#805100" : "#475569";
    }
    scheduleEditPanelPosition();
  }

  function reviewSelectionExcerpt(selection) {
    if (!selection) return "No selection yet.";
    return boundedString(selection.visibleText, 180) || "Selected " + boundedString(selection.tagName || "course element", 48);
  }

  function sendReviewAction(action) {
    if (!studioConnected || !port) {
      reviewLocalMessage = "Open this preview from Studio to save annotations.";
      renderReviewPanel();
      return false;
    }
    if (action.action !== "request-state") {
      var requestId = "review-" + (++reviewActionSequence);
      latestReviewActionId = requestId;
      action = Object.assign({}, action, { requestId: requestId });
    }
    send("preview-review-action", action);
    return action.requestId || true;
  }

  function showReviewPacketFallback(snapshot, messageText) {
    reviewManualPacketSnapshot = snapshot;
    reviewLocalMessage = messageText;
    if (reviewPacketFallback) {
      reviewPacketFallback.value = snapshot.packet;
      reviewPacketFallback.style.display = "block";
      reviewPacketFallback.focus();
      reviewPacketFallback.select();
    }
    if (reviewPacketConfirm) reviewPacketConfirm.style.display = "inline-flex";
    renderReviewPanel();
  }

  function completeReservedReviewCopy(transaction) {
    if (!transaction || reviewCopyTransaction !== transaction) return;
    if (transaction.purpose === "manual") {
      reviewLocalMessage = "Marking this Review Set as sent…";
      transaction.phase = "committing";
      var manualRequestId = sendReviewAction({
        action: "mark-sent",
        copyId: transaction.copyId,
        itemIds: transaction.snapshot.itemIds.slice(),
        packetId: transaction.snapshot.packetId,
        reviewSessionId: transaction.snapshot.reviewSessionId
      });
      transaction.requestId = manualRequestId;
      if (!manualRequestId) {
        reviewCopyTransaction = null;
        reviewCopyPending = false;
      }
      renderReviewPanel();
      return;
    }
    transaction.phase = "copying";
    reviewLocalMessage = "Copying Review Set…";
    renderReviewPanel();
    navigator.clipboard.writeText(transaction.snapshot.packet).then(function() {
      if (reviewCopyTransaction !== transaction) return;
      reviewLocalMessage = "Copied. Marking this Review Set as sent…";
      if (reviewPacketFallback) reviewPacketFallback.style.display = "none";
      if (reviewPacketConfirm) reviewPacketConfirm.style.display = "none";
      transaction.phase = "committing";
      var commitRequestId = sendReviewAction({
        action: "mark-sent",
        copyId: transaction.copyId,
        itemIds: transaction.snapshot.itemIds.slice(),
        packetId: transaction.snapshot.packetId,
        reviewSessionId: transaction.snapshot.reviewSessionId
      });
      transaction.requestId = commitRequestId;
      if (!commitRequestId) {
        reviewCopyTransaction = null;
        reviewCopyPending = false;
      }
      renderReviewPanel();
    }).catch(function() {
      if (reviewCopyTransaction !== transaction) return;
      transaction.phase = "canceling";
      var cancelRequestId = sendReviewAction({
        action: "cancel-copy",
        copyId: transaction.copyId,
        itemIds: transaction.snapshot.itemIds.slice(),
        packetId: transaction.snapshot.packetId,
        reviewSessionId: transaction.snapshot.reviewSessionId
      });
      transaction.requestId = cancelRequestId;
      if (!cancelRequestId) {
        reviewCopyTransaction = null;
        reviewCopyPending = false;
      }
      showReviewPacketFallback(transaction.snapshot, "Clipboard access was blocked. Copy the packet shown below.");
    });
  }

  function beginReservedReviewCopy(snapshot, purpose) {
    var copyId = "copy-" + Date.now().toString(36) + "-" + (reviewActionSequence + 1).toString(36);
    var transaction = {
      copyId: copyId,
      snapshot: snapshot,
      purpose: purpose,
      phase: "reserving",
      requestId: ""
    };
    reviewCopyTransaction = transaction;
    reviewCopyPending = true;
    reviewLocalMessage = "Reserving this Review Set…";
    var requestId = sendReviewAction({
      action: "begin-copy",
      copyId: copyId,
      itemIds: snapshot.itemIds.slice(),
      packetId: snapshot.packetId,
      reviewSessionId: snapshot.reviewSessionId
    });
    transaction.requestId = requestId;
    if (reviewCopyReservationResult && reviewCopyReservationResult.requestId === requestId) {
      var reservationResult = reviewCopyReservationResult;
      reviewCopyReservationResult = null;
      if (reservationResult.ok) completeReservedReviewCopy(transaction);
      else {
        reviewCopyTransaction = null;
        reviewCopyPending = false;
        reviewLocalMessage = reservationResult.message;
      }
    }
    if (!requestId) {
      reviewCopyTransaction = null;
      reviewCopyPending = false;
    }
    renderReviewPanel();
  }

  function setReviewPanelOpen(open) {
    reviewPanelOpen = Boolean(open);
    renderReviewPanel();
  }

  function updateReviewComposerState() {
    if (reviewSelectionText) reviewSelectionText.textContent = reviewSelectionExcerpt(reviewSelection);
    var sharedMutationPending = reviewCopyPending || reviewState.copying || reviewState.saving;
    if (reviewDraft) reviewDraft.disabled = !reviewSelection || sharedMutationPending;
    if (reviewCapture) {
      reviewCapture.disabled = sharedMutationPending || !studioConnected || (!reviewCapturePending && (!reviewSelection || !reviewSelection.nodeId || reviewState.draftScreenshotCount >= MAX_REVIEW_SCREENSHOTS));
      reviewCapture.textContent = reviewCapturePending
        ? "Cancel capture"
        : reviewState.draftScreenshotCount
        ? "Screenshot (" + reviewState.draftScreenshotCount + "/" + MAX_REVIEW_SCREENSHOTS + ")"
        : "Screenshot";
      reviewCapture.style.opacity = reviewCapture.disabled ? "0.48" : "1";
      reviewCapture.style.cursor = reviewCapture.disabled ? "default" : "pointer";
    }
    if (reviewSave) {
      var note = reviewDraft ? boundedString(reviewDraft.value, MAX_REVIEW_NOTE) : "";
      reviewSave.disabled = sharedMutationPending || !studioConnected || reviewSavePending || !reviewSelection || !reviewSelection.nodeId || !note || reviewState.items.length >= MAX_REVIEW_ITEMS;
      reviewSave.style.opacity = reviewSave.disabled ? "0.48" : "1";
      reviewSave.style.cursor = reviewSave.disabled ? "default" : "pointer";
    }
  }

  function renderReviewPanel() {
    if (!reviewPanel || !reviewToggle) return;
    reviewToggle.textContent = "Review Set (" + reviewState.items.length + ")";
    reviewToggle.setAttribute("aria-expanded", reviewPanelOpen ? "true" : "false");
    reviewPanel.style.display = reviewPanelOpen ? "block" : "none";
    if (!reviewPanelOpen) return;

    updateReviewComposerState();

    if (reviewItems) {
      while (reviewItems.firstChild) reviewItems.removeChild(reviewItems.firstChild);
      if (!reviewState.items.length) {
        var empty = document.createElement("p");
        empty.textContent = "No saved annotations yet.";
        empty.style.margin = "0";
        empty.style.color = "#64748b";
        empty.style.fontSize = "12px";
        reviewItems.appendChild(empty);
      }
      reviewState.items.forEach(function(item, index) {
        var itemEditLocked = reviewCopyPending || reviewState.copying || reviewState.saving || item.handoffState === "sent" || item.handoffState === "accepted";
        var row = document.createElement("div");
        row.setAttribute("data-canvas-helper-preview-review-item", "true");
        row.style.padding = "10px 0";
        row.style.borderTop = index ? "1px solid #e2e8f0" : "0";

        var rowHeading = document.createElement("div");
        rowHeading.style.display = "flex";
        rowHeading.style.alignItems = "flex-start";
        rowHeading.style.justifyContent = "space-between";
        rowHeading.style.gap = "8px";

        var excerpt = document.createElement("strong");
        excerpt.textContent = (index + 1) + ". " + (boundedString(item.excerpt, 180) || "Selected element");
        excerpt.style.font = "600 12px/1.35 system-ui, sans-serif";
        excerpt.style.overflowWrap = "anywhere";

        var handoffState = document.createElement("span");
        handoffState.textContent = item.handoffState === "sent"
          ? "Sent · verify"
          : item.handoffState === "accepted"
          ? "Accepted"
          : item.handoffState === "reopened"
          ? "Follow-up"
          : "Draft";
        handoffState.style.display = "block";
        handoffState.style.marginTop = "3px";
        handoffState.style.color = item.handoffState === "accepted" ? "#166534" : item.handoffState === "reopened" ? "#805100" : "#64748b";
        handoffState.style.font = "600 10px/1.3 system-ui, sans-serif";

        var remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        stylePreviewControlButton(remove);
        remove.style.padding = "5px 7px";
        remove.style.fontSize = "11px";
        remove.disabled = itemEditLocked;
        remove.style.opacity = itemEditLocked ? "0.48" : "1";
        remove.addEventListener("click", function() {
          reviewLocalMessage = "Removing…";
          renderReviewPanel();
          sendReviewAction({ action: "remove", itemId: item.id });
          window.requestAnimationFrame(function() { if (reviewPanel) reviewPanel.focus(); });
        });

        var show = document.createElement("button");
        show.type = "button";
        show.textContent = "Show";
        stylePreviewControlButton(show);
        show.style.padding = "5px 7px";
        show.style.fontSize = "11px";
        show.disabled = reviewCopyPending;
        show.style.opacity = show.disabled ? "0.48" : "1";
        show.addEventListener("click", function() {
          reviewLocalMessage = "Showing annotation…";
          renderReviewPanel();
          sendReviewAction({ action: "focus-item", itemId: item.id });
        });

        var rowActions = document.createElement("div");
        rowActions.style.display = "flex";
        rowActions.style.gap = "5px";
        rowActions.appendChild(show);
        if (item.handoffState === "sent") {
          var accept = document.createElement("button");
          accept.type = "button";
          accept.textContent = "Accept";
          stylePreviewControlButton(accept);
          accept.style.padding = "5px 7px";
          accept.style.fontSize = "11px";
          accept.disabled = reviewCopyPending;
          accept.addEventListener("click", function() {
            reviewLocalMessage = "Accepting change…";
            renderReviewPanel();
            var sent = sendReviewAction({ action: "accept-item", itemId: item.id });
            if (sent && reviewMessage) reviewMessage.focus();
          });
          var reopen = document.createElement("button");
          reopen.type = "button";
          reopen.textContent = "Reopen";
          stylePreviewControlButton(reopen);
          reopen.style.padding = "5px 7px";
          reopen.style.fontSize = "11px";
          reopen.disabled = reviewCopyPending;
          reopen.addEventListener("click", function() {
            reviewLocalMessage = "Reopening change…";
            renderReviewPanel();
            var sent = sendReviewAction({ action: "reopen-item", itemId: item.id });
            if (sent && reviewMessage) reviewMessage.focus();
          });
          rowActions.appendChild(accept);
          rowActions.appendChild(reopen);
        } else if (item.handoffState === "accepted") {
          var accepted = document.createElement("button");
          accepted.type = "button";
          accepted.textContent = "Accepted";
          accepted.disabled = true;
          stylePreviewControlButton(accepted);
          accepted.style.padding = "5px 7px";
          accepted.style.fontSize = "11px";
          var reopenAccepted = document.createElement("button");
          reopenAccepted.type = "button";
          reopenAccepted.textContent = "Reopen";
          stylePreviewControlButton(reopenAccepted);
          reopenAccepted.style.padding = "5px 7px";
          reopenAccepted.style.fontSize = "11px";
          reopenAccepted.disabled = reviewCopyPending;
          reopenAccepted.addEventListener("click", function() {
            reviewLocalMessage = "Reopening change…";
            renderReviewPanel();
            var sent = sendReviewAction({ action: "reopen-item", itemId: item.id });
            if (sent && reviewMessage) reviewMessage.focus();
          });
          rowActions.appendChild(accepted);
          rowActions.appendChild(reopenAccepted);
        }
        rowActions.appendChild(remove);

        var noteArea = document.createElement("textarea");
        noteArea.value = item.teacherNote;
        noteArea.rows = 2;
        noteArea.maxLength = MAX_REVIEW_NOTE;
        noteArea.setAttribute("aria-label", "Change note for annotation " + (index + 1));
        stylePreviewTextArea(noteArea);
        noteArea.style.marginTop = "7px";
        noteArea.disabled = itemEditLocked;
        noteArea.style.opacity = itemEditLocked ? "0.68" : "1";
        noteArea.addEventListener("change", function() {
          reviewLocalMessage = "Updating note…";
          sendReviewAction({ action: "update-note", itemId: item.id, teacherNote: noteArea.value });
        });

        rowHeading.appendChild(excerpt);
        excerpt.appendChild(handoffState);
        rowHeading.appendChild(rowActions);
        row.appendChild(rowHeading);
        if (item.screenshots.length) {
          var screenshotGrid = document.createElement("div");
          screenshotGrid.style.display = "grid";
          screenshotGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
          screenshotGrid.style.gap = "6px";
          screenshotGrid.style.marginTop = "7px";
          item.screenshots.forEach(function(screenshot, screenshotIndex) {
            var screenshotCell = document.createElement("div");
            screenshotCell.style.position = "relative";

            var screenshotPreview = document.createElement("button");
            screenshotPreview.type = "button";
            screenshotPreview.setAttribute("aria-label", "Open screenshot " + (screenshotIndex + 1) + " for annotation " + (index + 1));
            screenshotPreview.style.display = "block";
            screenshotPreview.style.width = "100%";
            screenshotPreview.style.padding = "0";
            screenshotPreview.style.overflow = "hidden";
            screenshotPreview.style.border = "1px solid #cbd5e1";
            screenshotPreview.style.borderRadius = "6px";
            screenshotPreview.style.background = "#f8fafc";
            screenshotPreview.style.cursor = "pointer";
            var thumbnail = document.createElement("img");
            thumbnail.src = reviewScreenshotUrl(screenshot.filePath, item);
            thumbnail.alt = "";
            thumbnail.loading = "lazy";
            thumbnail.decoding = "async";
            thumbnail.style.display = "block";
            thumbnail.style.width = "100%";
            thumbnail.style.aspectRatio = "16 / 10";
            thumbnail.style.objectFit = "cover";
            screenshotPreview.appendChild(thumbnail);
            screenshotPreview.addEventListener("click", function() {
              openReviewLightbox(screenshot.filePath, "Screenshot " + (screenshotIndex + 1) + " for annotation " + (index + 1), screenshotPreview, item);
            });

            var removeScreenshot = document.createElement("button");
            removeScreenshot.type = "button";
            removeScreenshot.textContent = "×";
            removeScreenshot.setAttribute("aria-label", "Remove screenshot " + (screenshotIndex + 1));
            removeScreenshot.style.position = "absolute";
            removeScreenshot.style.top = "3px";
            removeScreenshot.style.right = "3px";
            removeScreenshot.style.width = "22px";
            removeScreenshot.style.height = "22px";
            removeScreenshot.style.padding = "0";
            removeScreenshot.style.border = "1px solid rgba(15, 23, 42, 0.22)";
            removeScreenshot.style.borderRadius = "11px";
            removeScreenshot.style.background = "rgba(255, 255, 255, 0.94)";
            removeScreenshot.disabled = itemEditLocked;
            removeScreenshot.style.opacity = itemEditLocked ? "0.48" : "1";
            removeScreenshot.style.cursor = itemEditLocked ? "default" : "pointer";
            removeScreenshot.addEventListener("click", function() {
              reviewLocalMessage = "Removing screenshot…";
              renderReviewPanel();
              sendReviewAction({ action: "remove-screenshot", itemId: item.id, screenshotId: screenshot.id });
            });

            screenshotCell.appendChild(screenshotPreview);
            screenshotCell.appendChild(removeScreenshot);
            screenshotGrid.appendChild(screenshotCell);
          });
          row.appendChild(screenshotGrid);
        }
        row.appendChild(noteArea);
        var addScreenshot = document.createElement("button");
        addScreenshot.type = "button";
        addScreenshot.textContent = reviewState.captureItemId === item.id
          ? "Cancel capture"
          : item.screenshots.length >= MAX_REVIEW_SCREENSHOTS ? MAX_REVIEW_SCREENSHOTS + " screenshots attached" : "Add screenshot";
        stylePreviewControlButton(addScreenshot);
        addScreenshot.style.marginTop = "7px";
        addScreenshot.style.padding = "5px 7px";
        addScreenshot.style.fontSize = "11px";
        addScreenshot.disabled = itemEditLocked || !studioConnected || (reviewState.captureItemId !== item.id && (reviewCapturePending || Boolean(reviewState.captureItemId) || item.screenshots.length >= MAX_REVIEW_SCREENSHOTS));
        addScreenshot.style.opacity = addScreenshot.disabled ? "0.48" : "1";
        addScreenshot.addEventListener("click", function() {
          if (reviewState.captureItemId === item.id) {
            reviewLocalMessage = "Canceling screenshot capture…";
            renderReviewPanel();
            sendReviewAction({ action: "cancel-capture" });
            return;
          }
          reviewCapturePending = true;
          reviewLocalMessage = "Capturing the course preview…";
          renderReviewPanel();
          if (!sendReviewAction({ action: "capture-item", itemId: item.id })) {
            reviewCapturePending = false;
            renderReviewPanel();
          }
        });
        row.appendChild(addScreenshot);
        reviewItems.appendChild(row);
      });
    }

    if (reviewCopy) {
      reviewCopy.disabled = reviewCopyPending || reviewState.copying || reviewState.saving || !studioConnected || reviewState.preparing || !reviewState.packetReady || !reviewPacket;
      var hasReviewHistory = reviewState.items.some(function(item) { return item.handoffState !== "draft"; });
      reviewCopy.textContent = reviewState.preparing
        ? "Getting Review Set ready…"
        : hasReviewHistory ? "Copy Follow-up for Codex" : "Copy Review Set for Codex";
      reviewCopy.style.opacity = reviewCopy.disabled ? "0.48" : "1";
      reviewCopy.style.cursor = reviewCopy.disabled ? "default" : "pointer";
    }
    if (reviewClear) {
      reviewClear.disabled = reviewCopyPending || reviewState.copying || reviewState.saving || !studioConnected || !reviewState.items.length || reviewState.items.some(function(item) { return item.handoffState === "sent" || item.handoffState === "accepted"; });
      reviewClear.style.opacity = reviewClear.disabled ? "0.48" : "1";
      reviewClear.style.cursor = reviewClear.disabled ? "default" : "pointer";
    }
    if (reviewUndo) {
      reviewUndo.style.display = reviewState.undoLabel ? "inline-flex" : "none";
      reviewUndo.textContent = reviewState.undoLabel || "Undo";
      reviewUndo.disabled = reviewCopyPending || reviewState.copying || reviewState.saving || !studioConnected || !reviewState.undoLabel;
    }
    if (reviewPacketConfirm && reviewPacketConfirm.style.display !== "none") {
      reviewPacketConfirm.disabled = reviewCopyPending || reviewState.copying || reviewState.saving || !studioConnected;
      reviewPacketConfirm.style.opacity = reviewPacketConfirm.disabled ? "0.48" : "1";
    }
    if (reviewMessage) {
      reviewMessage.textContent = boundedString(reviewState.error || reviewLocalMessage || reviewState.status, 180);
      reviewMessage.style.color = reviewState.error ? "#9a3412" : "#475569";
    }
  }

  function ensureStandalonePreviewControls() {
    if (captureMode || window.top !== window || previewControls) return;
    var controls = document.createElement("div");
    controls.setAttribute("data-canvas-helper-preview-controls", "true");
    controls.setAttribute("role", "toolbar");
    controls.setAttribute("aria-label", "Canvas Helper preview tools");
    controls.style.position = "fixed";
    controls.style.bottom = "12px";
    controls.style.left = "50%";
    controls.style.transform = "translateX(-50%)";
    controls.style.zIndex = "2147483647";
    controls.style.width = "min(680px, calc(100vw - 24px))";
    controls.style.padding = "8px";
    controls.style.border = "1px solid #64748b";
    controls.style.borderRadius = "8px";
    controls.style.background = "#ffffff";
    controls.style.color = "#18212f";
    controls.style.fontFamily = "system-ui, sans-serif";
    controls.style.boxShadow = "0 2px 8px rgba(15, 23, 42, 0.18)";

    var actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "6px";
    actions.style.flexWrap = "wrap";

    var inspectButton = document.createElement("button");
    inspectButton.type = "button";
    inspectButton.setAttribute("data-canvas-helper-preview-inspect", "true");
    stylePreviewControlButton(inspectButton);
    inspectButton.addEventListener("click", function(event) {
      if (editModeEnabled) {
        sendEditAction({ action: "set-mode", enabled: false, nextMode: "annotate" });
        editModeEnabled = false;
        setInspectMode(true, false, event.detail === 0);
        return;
      }
      editModeEnabled = false;
      setInspectMode(!inspectEnabled, true, event.detail === 0);
    });

    var editButton = document.createElement("button");
    editButton.type = "button";
    editButton.setAttribute("data-canvas-helper-preview-edit", "true");
    stylePreviewControlButton(editButton);
    editButton.addEventListener("click", function() {
      if (window.top === window && !hostMode) {
        setEditPanelOpen(true);
        return;
      }
      if (!editState.available || editState.busy) return;
      sendEditAction({ action: "set-mode", enabled: !editModeEnabled });
    });

    var editDraftButton = document.createElement("button");
    editDraftButton.type = "button";
    editDraftButton.setAttribute("data-canvas-helper-preview-edit-toggle", "true");
    editDraftButton.setAttribute("aria-controls", "canvas-helper-preview-edit-panel");
    stylePreviewControlButton(editDraftButton);
    editDraftButton.addEventListener("click", function() {
      setEditPanelOpen(!editPanelOpen);
      if (editPanelOpen) sendEditAction({ action: "request-state" });
    });

    var reviewButton = document.createElement("button");
    reviewButton.type = "button";
    reviewButton.setAttribute("data-canvas-helper-preview-review-toggle", "true");
    reviewButton.setAttribute("aria-controls", "canvas-helper-preview-review-panel");
    stylePreviewControlButton(reviewButton);
    reviewButton.addEventListener("click", function() {
      setReviewPanelOpen(!reviewPanelOpen);
      if (reviewPanelOpen) sendReviewAction({ action: "request-state" });
    });

    var retryButton = document.createElement("button");
    retryButton.type = "button";
    retryButton.textContent = "Retry preview";
    retryButton.setAttribute("data-canvas-helper-preview-retry", "true");
    stylePreviewControlButton(retryButton);
    retryButton.style.display = "none";
    retryButton.addEventListener("click", function(event) {
      if (!event.isTrusted || !hostMode || !hostedCourseFrame) return;
      hostedCourseHealth = null;
      hostedCourseReadyHref = "";
      setHostedCourseRecovery("");
      setStandaloneStatus("Retrying course preview…");
      scheduleHostedCourseHealthTimeout();
      try { hostedCourseFrame.src = hostedCourseFrame.src; } catch (_) {}
    });

    var returnButton = document.createElement("button");
    returnButton.type = "button";
    returnButton.textContent = "Return to Studio";
    returnButton.setAttribute("aria-label", "Return to Canvas Helper Studio");
    returnButton.setAttribute("data-canvas-helper-return-to-studio", "true");
    stylePreviewControlButton(returnButton);
    returnButton.addEventListener("click", function(event) {
      if (!event.isTrusted) return;
      if (studioConnected && port) {
        send("preview-return-to-studio", null);
        setStandaloneStatus("Returning to Studio…");
        window.setTimeout(function() {
          if (!window.closed) {
            setStandaloneStatus("Studio is ready in the original tab. Close this preview tab to return.");
          }
        }, 400);
        try { window.close(); } catch (_) {}
        return;
      }
      try { window.location.replace(STUDIO_ORIGIN); } catch (_) { window.location.href = STUDIO_ORIGIN; }
    });

    var status = document.createElement("div");
    status.setAttribute("data-canvas-helper-preview-inspect-status", "true");
    status.setAttribute("role", "status");
    status.style.marginTop = "7px";
    status.style.fontSize = "12px";
    status.style.lineHeight = "1.35";
    status.style.color = "#475569";

    var panel = document.createElement("section");
    panel.id = "canvas-helper-preview-review-panel";
    panel.setAttribute("data-canvas-helper-preview-review-panel", "true");
    panel.setAttribute("aria-label", "Review Set");
    panel.tabIndex = -1;
    panel.style.display = "none";
    panel.style.position = "absolute";
    panel.style.right = "0";
    panel.style.bottom = "calc(100% + 8px)";
    panel.style.width = "min(420px, calc(100vw - 24px))";
    panel.style.maxHeight = "min(68vh, 620px)";
    panel.style.marginTop = "9px";
    panel.style.padding = "12px";
    panel.style.overflowY = "auto";
    panel.style.border = "1px solid #dbe4ef";
    panel.style.borderRadius = "8px";
    panel.style.background = "#ffffff";
    panel.style.color = "#18212f";

    var courseEditPanel = document.createElement("section");
    courseEditPanel.id = "canvas-helper-preview-edit-panel";
    courseEditPanel.setAttribute("data-canvas-helper-preview-edit-panel", "true");
    courseEditPanel.setAttribute("aria-label", "Draft Changes");
    courseEditPanel.tabIndex = -1;
    courseEditPanel.style.display = "none";
    courseEditPanel.style.position = "absolute";
    courseEditPanel.style.left = "0";
    courseEditPanel.style.bottom = "calc(100% + 8px)";
    courseEditPanel.style.width = "min(460px, calc(100vw - 24px))";
    courseEditPanel.style.maxHeight = "min(72vh, 680px)";
    courseEditPanel.style.padding = "12px";
    courseEditPanel.style.overflowY = "auto";
    courseEditPanel.style.border = "1px solid #dbe4ef";
    courseEditPanel.style.borderRadius = "8px";
    courseEditPanel.style.background = "#ffffff";
    courseEditPanel.style.color = "#18212f";

    var editPanelTitle = document.createElement("strong");
    editPanelTitle.textContent = "Edit selection";
    editPanelTitle.style.display = "block";
    editPanelTitle.style.font = "650 13px/1.3 system-ui, sans-serif";
    var editSelectedText = document.createElement("p");
    editSelectedText.style.margin = "6px 0";
    editSelectedText.style.color = "#475569";
    editSelectedText.style.font = "12px/1.35 system-ui, sans-serif";
    function editField(labelText, control) {
      var label = document.createElement("label");
      label.style.display = "block";
      label.style.marginTop = "8px";
      var labelSpan = document.createElement("span");
      labelSpan.textContent = labelText;
      labelSpan.style.display = "block";
      labelSpan.style.marginBottom = "4px";
      labelSpan.style.font = "600 11px/1.3 system-ui, sans-serif";
      label.appendChild(labelSpan);
      label.appendChild(control);
      return label;
    }
    var editHtmlArea = document.createElement("div");
    editHtmlArea.setAttribute("data-canvas-helper-preview-edit-html", "true");
    editHtmlArea.setAttribute("role", "textbox");
    editHtmlArea.setAttribute("aria-multiline", "true");
    editHtmlArea.contentEditable = "true";
    editHtmlArea.style.minHeight = "110px";
    editHtmlArea.style.maxHeight = "260px";
    editHtmlArea.style.overflow = "auto";
    stylePreviewTextArea(editHtmlArea);
    var editFormatBar = document.createElement("div");
    editFormatBar.style.display = "flex";
    editFormatBar.style.flexWrap = "wrap";
    editFormatBar.style.gap = "6px";
    editFormatBar.style.marginTop = "8px";
    var editTextRange = null;
    function rememberEditTextRange() {
      var selection = window.getSelection();
      if (selection && selection.rangeCount && editHtmlArea.contains(selection.anchorNode)) {
        editTextRange = selection.getRangeAt(0).cloneRange();
      }
    }
    editHtmlArea.addEventListener("keyup", rememberEditTextRange);
    editHtmlArea.addEventListener("mouseup", rememberEditTextRange);
    editHtmlArea.addEventListener("input", scheduleEditComposerPreview);
    [["bold", "Bold"], ["italic", "Italic"], ["insertUnorderedList", "Bullets"], ["insertOrderedList", "Numbers"]].forEach(function(definition) {
      var formatButton = document.createElement("button");
      formatButton.type = "button";
      formatButton.textContent = definition[1];
      stylePreviewControlButton(formatButton);
      formatButton.addEventListener("mousedown", function(event) { event.preventDefault(); });
      formatButton.addEventListener("click", function() { editHtmlArea.focus(); document.execCommand(definition[0], false); rememberEditTextRange(); scheduleEditComposerPreview(); });
      editFormatBar.appendChild(formatButton);
    });
    var editInlineLink = document.createElement("input");
    editInlineLink.type = "url";
    editInlineLink.placeholder = "Link selected text";
    editInlineLink.setAttribute("aria-label", "Link selected course text");
    editInlineLink.style.minWidth = "150px";
    editInlineLink.style.flex = "1 1 150px";
    stylePreviewTextArea(editInlineLink);
    var editInlineLinkButton = document.createElement("button");
    editInlineLinkButton.type = "button";
    editInlineLinkButton.textContent = "Add link";
    stylePreviewControlButton(editInlineLinkButton);
    editInlineLinkButton.addEventListener("click", function() {
      var href = editInlineLink.value.trim();
      if (!href || !editTextRange) return;
      editHtmlArea.focus();
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(editTextRange);
      document.execCommand("createLink", false, href);
      editInlineLink.value = "";
      rememberEditTextRange();
      scheduleEditComposerPreview();
    });
    editFormatBar.appendChild(editInlineLink);
    editFormatBar.appendChild(editInlineLinkButton);
    var editHrefInput = document.createElement("input");
    stylePreviewTextArea(editHrefInput);
    var editSrcInput = document.createElement("input");
    stylePreviewTextArea(editSrcInput);
    var editAltArea = document.createElement("textarea");
    editAltArea.rows = 2;
    stylePreviewTextArea(editAltArea);
    var editTitleInput = document.createElement("input");
    stylePreviewTextArea(editTitleInput);
    [editHrefInput, editSrcInput, editAltArea, editTitleInput].forEach(function(control) {
      control.addEventListener("input", scheduleEditComposerPreview);
    });

    var styleGrid = document.createElement("div");
    styleGrid.style.display = "grid";
    styleGrid.style.gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    styleGrid.style.gap = "7px";
    styleGrid.style.marginTop = "9px";
    var styleControls = { container: styleGrid };
    [
      ["fontFamily", "Font", ["default", "readable-sans", "book-serif"]],
      ["fontSize", "Size", ["default", "small", "large", "x-large"]],
      ["textTone", "Colour", ["default", "ink", "muted", "accent"]],
      ["alignment", "Align", ["default", "left", "center", "right"]],
      ["spacing", "Spacing", ["default", "compact", "relaxed"]]
    ].forEach(function(definition) {
      var select = document.createElement("select");
      stylePreviewTextArea(select);
      definition[2].forEach(function(value) {
        var option = document.createElement("option");
        option.value = value;
        option.textContent = value === "default" ? "Default" : value.replace(/-/g, " ");
        select.appendChild(option);
      });
      styleControls[definition[0]] = select;
      select.addEventListener("change", scheduleEditComposerPreview);
      styleGrid.appendChild(editField(definition[1], select));
    });

    var saveEdit = document.createElement("button");
    saveEdit.type = "button";
    saveEdit.setAttribute("data-canvas-helper-preview-edit-save", "true");
    saveEdit.textContent = "Save draft change";
    stylePreviewControlButton(saveEdit);
    saveEdit.style.marginTop = "9px";
    saveEdit.style.background = "#18212f";
    saveEdit.style.color = "#ffffff";
    saveEdit.addEventListener("click", function() {
      if (editState.busy) return;
      if (hostedInlineEditorMatchesTarget(editState.target)) {
        sendHostedInlineEditorAction("save");
        return;
      }
      var patch = currentEditPatch();
      if (!patch) return;
      if (editState.target) {
        sendEditAction({ action: "save-target", targetId: editState.target.targetId, patch: patch });
        return;
      }
      if (editState.selectedDraft) sendEditAction({ action: "update-draft", draftId: editState.selectedDraft.id, patch: patch });
    });
    var annotateEdit = document.createElement("button");
    annotateEdit.type = "button";
    annotateEdit.setAttribute("data-canvas-helper-preview-edit-annotate", "true");
    annotateEdit.textContent = "Annotate this for Codex";
    stylePreviewControlButton(annotateEdit);
    annotateEdit.style.display = "none";
    annotateEdit.style.marginTop = "9px";
    annotateEdit.addEventListener("click", function() {
      if (!editLastSelection || editState.busy) return;
      pendingEditAnnotationId = sendEditAction({ action: "annotate-selection", selection: editLastSelection }) || "";
    });
    var editSavedHeading = document.createElement("div");
    editSavedHeading.textContent = "Draft changes";
    editSavedHeading.style.marginTop = "14px";
    editSavedHeading.style.paddingTop = "10px";
    editSavedHeading.style.borderTop = "1px solid #e2e8f0";
    editSavedHeading.style.font = "650 13px/1.3 system-ui, sans-serif";
    var editSavedItems = document.createElement("div");
    editSavedItems.setAttribute("data-canvas-helper-preview-edit-items", "true");
    var editFooter = document.createElement("div");
    editFooter.style.display = "flex";
    editFooter.style.gap = "6px";
    editFooter.style.marginTop = "9px";
    var applyEdits = document.createElement("button");
    applyEdits.type = "button";
    applyEdits.setAttribute("data-canvas-helper-preview-edit-apply", "true");
    stylePreviewControlButton(applyEdits);
    applyEdits.style.background = "#18212f";
    applyEdits.style.color = "#ffffff";
    applyEdits.addEventListener("click", function() { sendEditAction({ action: "apply" }); });
    var undoEdits = document.createElement("button");
    undoEdits.type = "button";
    undoEdits.setAttribute("data-canvas-helper-preview-edit-undo", "true");
    undoEdits.textContent = "Undo last batch";
    stylePreviewControlButton(undoEdits);
    undoEdits.addEventListener("click", function() { sendEditAction({ action: "undo" }); });
    var editPanelMessage = document.createElement("p");
    editPanelMessage.setAttribute("data-canvas-helper-preview-edit-message", "true");
    editPanelMessage.setAttribute("role", "status");
    editPanelMessage.style.margin = "8px 0 0";
    editPanelMessage.style.font = "12px/1.35 system-ui, sans-serif";

    editFooter.appendChild(applyEdits);
    editFooter.appendChild(undoEdits);
    courseEditPanel.appendChild(editPanelTitle);
    courseEditPanel.appendChild(editSelectedText);
    courseEditPanel.appendChild(editFormatBar);
    courseEditPanel.appendChild(editField("Text", editHtmlArea));
    courseEditPanel.appendChild(editField("Link destination", editHrefInput));
    courseEditPanel.appendChild(editField("Image", editSrcInput));
    courseEditPanel.appendChild(editField("Alt text", editAltArea));
    courseEditPanel.appendChild(editField("Tooltip or title", editTitleInput));
    courseEditPanel.appendChild(styleGrid);
    courseEditPanel.appendChild(saveEdit);
    courseEditPanel.appendChild(annotateEdit);
    courseEditPanel.appendChild(editSavedHeading);
    courseEditPanel.appendChild(editSavedItems);
    courseEditPanel.appendChild(editFooter);
    courseEditPanel.appendChild(editPanelMessage);

    var panelTitle = document.createElement("strong");
    panelTitle.textContent = "New annotation";
    panelTitle.style.display = "block";
    panelTitle.style.font = "650 13px/1.3 system-ui, sans-serif";

    var selectedText = document.createElement("p");
    selectedText.setAttribute("data-canvas-helper-preview-review-selection", "true");
    selectedText.style.margin = "6px 0";
    selectedText.style.color = "#475569";
    selectedText.style.font = "12px/1.35 system-ui, sans-serif";

    var draft = document.createElement("textarea");
    draft.rows = 3;
    draft.maxLength = MAX_REVIEW_NOTE;
    draft.placeholder = "What should Codex change?";
    draft.setAttribute("aria-label", "What should Codex change?");
    draft.setAttribute("data-canvas-helper-preview-review-note", "true");
    stylePreviewTextArea(draft);
    draft.addEventListener("input", updateReviewComposerState);

    var save = document.createElement("button");
    save.type = "button";
    save.textContent = "Save annotation";
    save.setAttribute("data-canvas-helper-preview-review-save", "true");
    stylePreviewControlButton(save);
    save.style.marginTop = "7px";
    save.style.background = "#18212f";
    save.style.color = "#ffffff";
    save.addEventListener("click", function() {
      if (!reviewSelection || !reviewDraft || reviewSavePending) return;
      var note = boundedString(reviewDraft.value, MAX_REVIEW_NOTE);
      if (!note) {
        reviewLocalMessage = "Add a note before saving.";
        renderReviewPanel();
        return;
      }
      reviewSavePending = true;
      reviewLocalMessage = "Saving annotation…";
      renderReviewPanel();
      if (!sendReviewAction({ action: "add", selection: reviewSelection, teacherNote: note })) {
        reviewSavePending = false;
        renderReviewPanel();
      }
    });

    var capture = document.createElement("button");
    capture.type = "button";
    capture.setAttribute("data-canvas-helper-preview-review-capture", "true");
    stylePreviewControlButton(capture);
    capture.style.marginTop = "7px";
    capture.style.marginRight = "6px";
    capture.addEventListener("click", function() {
      if (reviewCapturePending) {
        reviewLocalMessage = "Canceling screenshot capture…";
        renderReviewPanel();
        sendReviewAction({ action: "cancel-capture" });
        return;
      }
      if (!reviewSelection) return;
      reviewCapturePending = true;
      reviewLocalMessage = "Capturing the course preview…";
      renderReviewPanel();
      if (!sendReviewAction({ action: "capture-draft", selection: reviewSelection })) {
        reviewCapturePending = false;
        renderReviewPanel();
      }
    });

    var savedHeading = document.createElement("div");
    savedHeading.textContent = "Saved annotations";
    savedHeading.style.marginTop = "14px";
    savedHeading.style.paddingTop = "10px";
    savedHeading.style.borderTop = "1px solid #e2e8f0";
    savedHeading.style.font = "650 13px/1.3 system-ui, sans-serif";

    var savedItems = document.createElement("div");
    savedItems.setAttribute("data-canvas-helper-preview-review-items", "true");

    var footer = document.createElement("div");
    footer.style.display = "flex";
    footer.style.gap = "6px";
    footer.style.flexWrap = "wrap";
    footer.style.paddingTop = "10px";
    footer.style.borderTop = "1px solid #e2e8f0";

    var copy = document.createElement("button");
    copy.type = "button";
    copy.setAttribute("data-canvas-helper-preview-review-copy", "true");
    stylePreviewControlButton(copy);
    copy.style.background = "#18212f";
    copy.style.color = "#ffffff";
    copy.addEventListener("click", function() {
      if (reviewCopyPending || reviewState.saving) return;
      var copiedPacket = reviewPacket;
      var copiedPacketId = reviewPacketId;
      var copiedPacketItemIds = reviewPacketItemIds.slice();
      var copiedReviewSessionId = reviewPacketSessionId;
      reviewManualPacketSnapshot = {
        packet: copiedPacket,
        packetId: copiedPacketId,
        itemIds: copiedPacketItemIds,
        reviewSessionId: copiedReviewSessionId
      };
      if (!reviewPacket || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        showReviewPacketFallback(reviewManualPacketSnapshot, "Clipboard access is not available. Copy the packet shown below.");
        return;
      }
      beginReservedReviewCopy(reviewManualPacketSnapshot, "clipboard");
    });

    var clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "Clear";
    clear.setAttribute("data-canvas-helper-preview-review-clear", "true");
    stylePreviewControlButton(clear);
    clear.addEventListener("click", function() {
      reviewLocalMessage = "Clearing…";
      renderReviewPanel();
      sendReviewAction({ action: "clear" });
    });

    var undo = document.createElement("button");
    undo.type = "button";
    undo.setAttribute("data-canvas-helper-preview-review-undo", "true");
    stylePreviewControlButton(undo);
    undo.style.display = "none";
    undo.addEventListener("click", function() {
      reviewLocalMessage = "Undoing last change…";
      renderReviewPanel();
      sendReviewAction({ action: "undo" });
    });

    var panelMessage = document.createElement("p");
    panelMessage.setAttribute("role", "status");
    panelMessage.setAttribute("aria-live", "polite");
    panelMessage.tabIndex = -1;
    panelMessage.setAttribute("data-canvas-helper-preview-review-status", "true");
    panelMessage.style.minHeight = "16px";
    panelMessage.style.margin = "7px 0 0";
    panelMessage.style.font = "12px/1.35 system-ui, sans-serif";

    var packetFallback = document.createElement("textarea");
    packetFallback.readOnly = true;
    packetFallback.rows = 8;
    packetFallback.setAttribute("aria-label", "Review Set packet for manual copy");
    packetFallback.setAttribute("data-canvas-helper-preview-review-packet", "true");
    stylePreviewTextArea(packetFallback);
    packetFallback.style.display = "none";
    packetFallback.style.marginTop = "8px";

    var packetConfirm = document.createElement("button");
    packetConfirm.type = "button";
    packetConfirm.textContent = "I sent this to Codex";
    packetConfirm.setAttribute("data-canvas-helper-preview-review-confirm-sent", "true");
    stylePreviewControlButton(packetConfirm);
    packetConfirm.style.display = "none";
    packetConfirm.style.marginTop = "7px";
    packetConfirm.addEventListener("click", function() {
      if (!reviewManualPacketSnapshot || reviewCopyPending || reviewState.saving) return;
      beginReservedReviewCopy(reviewManualPacketSnapshot, "manual");
    });

    footer.appendChild(copy);
    footer.appendChild(undo);
    footer.appendChild(clear);
    panel.appendChild(panelTitle);
    panel.appendChild(selectedText);
    panel.appendChild(draft);
    panel.appendChild(capture);
    panel.appendChild(save);
    panel.appendChild(savedHeading);
    panel.appendChild(savedItems);
    panel.appendChild(footer);
    panel.appendChild(packetFallback);
    panel.appendChild(packetConfirm);
    panel.appendChild(panelMessage);

    actions.appendChild(editButton);
    actions.appendChild(editDraftButton);
    actions.appendChild(inspectButton);
    actions.appendChild(reviewButton);
    actions.appendChild(retryButton);
    actions.appendChild(returnButton);
    controls.appendChild(actions);
    controls.appendChild(status);
    controls.appendChild(panel);
    controls.appendChild(courseEditPanel);
    (document.body || document.documentElement).appendChild(controls);
    previewControls = controls;
    inspectControl = inspectButton;
    editControl = editButton;
    previewStatus = status;
    standaloneRetryControl = retryButton;
    reviewToggle = reviewButton;
    reviewPanel = panel;
    reviewSelectionText = selectedText;
    reviewDraft = draft;
    reviewCapture = capture;
    reviewSave = save;
    reviewItems = savedItems;
    reviewCopy = copy;
    reviewClear = clear;
    reviewUndo = undo;
    reviewPacketFallback = packetFallback;
    reviewPacketConfirm = packetConfirm;
    reviewMessage = panelMessage;
    editToggle = editDraftButton;
    editPanel = courseEditPanel;
    editTargetText = editSelectedText;
    editHtml = editHtmlArea;
    editFormat = editFormatBar;
    editHref = editHrefInput;
    editSrc = editSrcInput;
    editAlt = editAltArea;
    editTitle = editTitleInput;
    editStyleControls = styleControls;
    editSave = saveEdit;
    editAnnotate = annotateEdit;
    editItems = editSavedItems;
    editApply = applyEdits;
    editUndo = undoEdits;
    editMessage = editPanelMessage;
    updateStandaloneControls();
  }

  function restoreTemporaryFocus() {
    if (!temporaryFocusElement) return;
    if (temporaryFocusTabIndex === null) temporaryFocusElement.removeAttribute("tabindex");
    else temporaryFocusElement.setAttribute("tabindex", temporaryFocusTabIndex);
    temporaryFocusElement = null;
    temporaryFocusTabIndex = null;
  }

  function focusInspectableElement(element) {
    if (!element) return false;
    if (temporaryFocusElement !== element) {
      restoreTemporaryFocus();
      temporaryFocusElement = element;
      temporaryFocusTabIndex = element.hasAttribute("tabindex") ? element.getAttribute("tabindex") : null;
      if (element.tabIndex < 0) element.setAttribute("tabindex", "-1");
    }
    try { element.focus({ preventScroll: true }); } catch (_) { try { element.focus(); } catch (_) {} }
    return document.activeElement === element;
  }

  function focusSourceNode(nodeId, requestId) {
    var element = elementForSourceNodeId(nodeId);
    if (!element) {
      if (requestId) send("preview-inspect-focused", { requestId: requestId, nodeId: nodeId, focused: false });
      return false;
    }
    try {
      element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    } catch (_) {
      element.scrollIntoView();
    }
    focusInspectableElement(element);
    window.requestAnimationFrame(function() {
      var rect = element.getBoundingClientRect();
      setOverlay({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      document.documentElement.setAttribute("data-canvas-helper-inspection-focus", "true");
      if (requestId) send("preview-inspect-focused", { requestId: requestId, nodeId: nodeId, focused: true });
    });
    return true;
  }

  function diagnosticMessage(value, fallback) {
    var text = boundedString(value || fallback, 240);
    text = text.replace(/(?:https?|file):\/\/\S+/gi, "[link]");
    text = text.replace(/(?:[A-Za-z]:)?(?:\\|\/)(?:[^\s]+)/g, "[path]");
    return boundedString(text || fallback, 240);
  }

  function sendDiagnostic(kind, value, fallback) {
    send("preview-diagnostic", { kind: kind, message: diagnosticMessage(value, fallback), href: location.href });
  }

  function ensureShield() {
    if (shield) return shield;
    shield = document.createElement("div");
    shield.setAttribute("aria-hidden", "true");
    shield.tabIndex = -1;
    shield.style.position = "fixed";
    shield.style.inset = "0";
    shield.style.zIndex = "2147483646";
    shield.style.display = "none";
    shield.style.background = "transparent";
    shield.style.cursor = "crosshair";
    shield.style.touchAction = "none";
    (document.body || document.documentElement).appendChild(shield);
    return shield;
  }

  function ensureSourceNodeIndex() {
    if (!sourceNodeCounts) {
      sourceNodeIndexBuildCount += 1;
      document.documentElement.setAttribute("data-canvas-helper-source-index-builds", String(sourceNodeIndexBuildCount));
      sourceNodeCounts = Object.create(null);
      sourceNodeElements = Object.create(null);
      var matches = document.querySelectorAll("[" + NODE_ATTRIBUTE + "]");
      for (var index = 0; index < matches.length; index += 1) {
        var candidateId = matches[index].getAttribute(NODE_ATTRIBUTE) || "";
        if (!candidateId) continue;
        sourceNodeCounts[candidateId] = (sourceNodeCounts[candidateId] || 0) + 1;
        sourceNodeElements[candidateId] = sourceNodeCounts[candidateId] === 1 ? matches[index] : null;
      }
    }
  }

  function uniqueSourceNodeId(element) {
    var nodeId = element.getAttribute(NODE_ATTRIBUTE) || "";
    if (!nodeId) return null;
    ensureSourceNodeIndex();
    return sourceNodeCounts[nodeId] === 1 ? nodeId : null;
  }

  function elementForSourceNodeId(nodeId) {
    if (typeof nodeId !== "string" || !nodeId) return null;
    ensureSourceNodeIndex();
    return sourceNodeCounts[nodeId] === 1 ? sourceNodeElements[nodeId] : null;
  }

  function targetForPointerEvent(event) {
    if (event.target !== shield) return event.target;
    if (!shield) return null;
    shield.style.pointerEvents = "none";
    var target = document.elementFromPoint(event.clientX, event.clientY);
    shield.style.pointerEvents = "auto";
    return target;
  }

  function isPreviewControlTarget(target) {
    var element = target instanceof Element ? target : null;
    return Boolean(element && element.closest("[data-canvas-helper-preview-controls], [data-canvas-helper-edit-map-toolbar], [data-canvas-helper-edit-map-tooltip], [data-canvas-helper-edit-preview-overlay]"));
  }

  function safePresentationFor(element) {
    var style = window.getComputedStyle(element);
    var fontStyle = ["normal", "italic", "oblique"].indexOf(style.fontStyle) >= 0 ? style.fontStyle : "normal";
    var textAlign = ["left", "right", "center", "justify", "start", "end"].indexOf(style.textAlign) >= 0 ? style.textAlign : "start";
    var whiteSpace = ["normal", "pre", "pre-wrap", "pre-line", "nowrap"].indexOf(style.whiteSpace) >= 0 ? style.whiteSpace : "normal";
    return {
      fontFamily: boundedString(style.fontFamily || "system-ui, sans-serif", 240),
      fontSize: boundedString(style.fontSize || "16px", 32),
      fontWeight: boundedString(style.fontWeight || "400", 32),
      fontStyle: fontStyle,
      lineHeight: boundedString(style.lineHeight || "normal", 32),
      letterSpacing: boundedString(style.letterSpacing || "normal", 32),
      textAlign: textAlign,
      color: boundedString(style.color || "rgb(0, 0, 0)", 64),
      whiteSpace: whiteSpace
    };
  }

  function selectionFor(target, includeScroll, interactionStartedAt) {
    var element = target instanceof Element ? target : null;
    if (!element) return null;
    var rect = element.getBoundingClientRect();
    var isFormControl = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
    var fullVisibleText = isFormControl ? "" : normalizedRenderedText(element.textContent || "");
    return {
      nodeId: uniqueSourceNodeId(element),
      selectionKind: "element",
      visibleText: boundedString(fullVisibleText, MAX_TEXT),
      tagName: boundedString(element.tagName ? element.tagName.toLowerCase() : "", MAX_ELEMENT_TAG),
      role: boundedString(element.getAttribute("role") || "", MAX_ELEMENT_ROLE),
      testId: boundedString(element.getAttribute("data-testid") || "", MAX_ELEMENT_TEST_ID),
      geometry: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(Math.max(0, rect.width)), height: Math.round(Math.max(0, rect.height)) },
      viewport: { width: Math.max(240, Math.round(window.innerWidth)), height: Math.max(240, Math.round(window.innerHeight)) },
      scroll: includeScroll === false ? { windowTop: window.scrollY, windowLeft: window.scrollX, containers: [] } : captureScrollState(),
      pageHref: boundedString(location.href, MAX_COURSE_URL),
      presentation: safePresentationFor(element),
      interactionStartedAt: typeof interactionStartedAt === "number" ? interactionStartedAt : undefined,
      rendered: {
        textFingerprint: renderedTextFingerprint(fullVisibleText),
        textLength: fullVisibleText.length,
        attributes: {
          href: boundedString(element.getAttribute("href") || "", ${2048}),
          src: boundedString(element.getAttribute("src") || "", ${2048}),
          alt: boundedString(element.getAttribute("alt") || "", ${2048}),
          title: boundedString(element.getAttribute("title") || "", ${2048})
        }
      }
    };
  }

  function commonMappedOwner(startTarget, endTarget) {
    var start = startTarget instanceof Element ? startTarget : null;
    var end = endTarget instanceof Element ? endTarget : null;
    var current = start;
    while (current) {
      if (
        current !== document.documentElement &&
        current !== document.body &&
        end &&
        current.contains(end) &&
        uniqueSourceNodeId(current)
      ) return current;
      current = current.parentElement;
    }
    return null;
  }

  function visualAreaSelection(rect, interactionStartedAt) {
    return {
      nodeId: null,
      selectionKind: "area",
      visibleText: "",
      tagName: "area",
      role: "",
      testId: "",
      geometry: rect,
      viewport: { width: Math.max(240, Math.round(window.innerWidth)), height: Math.max(240, Math.round(window.innerHeight)) },
      scroll: captureScrollState(),
      pageHref: boundedString(location.href, MAX_COURSE_URL),
      interactionStartedAt: typeof interactionStartedAt === "number" ? interactionStartedAt : undefined
    };
  }

  function selectInspection(selection, editRuntime) {
    if (!selection) return;
    setOverlay(
      { left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height },
      editRuntime ? editRuntime.state : undefined
    );
    send("preview-inspect-selected", selection);
    if (editModeEnabled) editLastSelection = selection;
    if (window.top === window) {
      if (editModeEnabled) {
        setEditPanelOpen(true);
      } else {
        reviewSelection = selection;
        reviewLocalMessage = selection.nodeId ? "Add a note or screenshot, then save this annotation." : "Choose a more specific course element.";
        setReviewPanelOpen(true);
      }
    }
    setStandaloneStatus(studioConnected ? "Selection ready." : "Selection highlighted. Open this preview from Studio to save it.");
  }

  function keyboardCandidates() {
    if (!keyboardCandidateCache || keyboardCandidateCacheDirty) {
      keyboardCandidateCache = Array.prototype.slice.call(document.querySelectorAll("[" + NODE_ATTRIBUTE + "]"), 0, 12000).filter(function(element) {
        var inspectable = Boolean(
          element &&
          element !== document.documentElement &&
          element !== document.body &&
          !isPreviewControlTarget(element) &&
          isVisibleCourseElement(element)
        );
        if (!inspectable || !editModeEnabled) return inspectable;
        var runtime = mapRuntimeForElement(element);
        return Boolean(runtime && runtime.state !== "blocked");
      });
      keyboardCandidateCacheDirty = false;
    }
    return keyboardCandidateCache;
  }

  function moveKeyboardCursor(direction) {
    var candidates = keyboardCandidates();
    if (!candidates.length) return null;
    var currentIndex = keyboardCursor ? candidates.indexOf(keyboardCursor) : -1;
    var nextIndex = currentIndex < 0 ? (direction < 0 ? candidates.length - 1 : 0) : (currentIndex + direction + candidates.length) % candidates.length;
    keyboardCursor = candidates[nextIndex];
    var selection = selectionFor(keyboardCursor, false);
    if (!selection) return null;
    var editRuntime = editModeEnabled ? mapRuntimeForElement(keyboardCursor) : null;
    setOverlay(
      { left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height },
      editRuntime ? editRuntime.state : undefined
    );
    if (editRuntime) showEditMapTooltip(editRuntime, {
      left: selection.geometry.x,
      top: selection.geometry.y,
      right: selection.geometry.x + selection.geometry.width,
      bottom: selection.geometry.y + selection.geometry.height
    });
    try { keyboardCursor.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "auto" }); } catch (_) {}
    focusInspectableElement(keyboardCursor);
    return selection;
  }

  function stopKeyboardMutationObserver() {
    if (!keyboardMutationObserver) return;
    try { keyboardMutationObserver.disconnect(); } catch (_) {}
    keyboardMutationObserver = null;
  }

  function startKeyboardMutationObserver() {
    stopKeyboardMutationObserver();
    keyboardCandidateCacheDirty = true;
    sourceNodeCounts = null;
    sourceNodeElements = null;
    scrollSelectorsInitialized = false;
    lastSelectors = [];
    if (typeof MutationObserver !== "function" || !document.body) return;
    keyboardMutationObserver = new MutationObserver(function(mutations) {
      var relevantMutation = mutations.some(function(mutation) {
        var target = mutation.target instanceof Element ? mutation.target : mutation.target && mutation.target.parentElement;
        if (!target) return true;
        if (target === shield || target === overlay || isPreviewControlTarget(target)) return false;
        if (mutation.type === "childList") {
          var changedNodes = Array.prototype.slice.call(mutation.addedNodes || []).concat(Array.prototype.slice.call(mutation.removedNodes || []));
          if (changedNodes.length && changedNodes.every(function(node) {
            var element = node instanceof Element ? node : node && node.parentElement;
            return element && (element === shield || element === overlay || isPreviewControlTarget(element));
          })) return false;
        }
        return true;
      });
      if (!relevantMutation) return;
      keyboardCandidateCacheDirty = true;
      sourceNodeCounts = null;
      sourceNodeElements = null;
      scrollSelectorsInitialized = false;
      lastSelectors = [];
      scheduleEditMapRefresh();
    });
    try {
      keyboardMutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden", "aria-hidden", NODE_ATTRIBUTE]
      });
    } catch (_) {
      stopKeyboardMutationObserver();
    }
  }

  function onPointerMove(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    if (dragStart && !editModeEnabled) {
      var dragRect = {
        left: Math.min(dragStart.x, event.clientX),
        top: Math.min(dragStart.y, event.clientY),
        width: Math.abs(event.clientX - dragStart.x),
        height: Math.abs(event.clientY - dragStart.y)
      };
      dragging = dragging || dragRect.width > 6 || dragRect.height > 6;
      if (dragging) setOverlay(dragRect);
      return;
    }
    hoverEvent = { target: event.target, clientX: event.clientX, clientY: event.clientY };
    if (hoverHandle) return;
    hoverHandle = window.requestAnimationFrame(function() {
      hoverHandle = 0;
      var pending = hoverEvent;
      hoverEvent = null;
      if (!pending) return;
      var syntheticEvent = { target: pending.target, clientX: pending.clientX, clientY: pending.clientY };
      var target = targetForPointerEvent(syntheticEvent);
      if (isPreviewControlTarget(target)) return;
      var editRuntime = editModeEnabled ? editMapTargetForPointer(target, pending.clientX, pending.clientY) : null;
      var selection = selectionFor(editRuntime ? editRuntime.element : target, false);
      if (!selection) return;
      setOverlay(
        { left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height },
        editRuntime ? editRuntime.state : undefined
      );
      if (editRuntime) {
        showEditMapTooltip(editRuntime, {
          left: selection.geometry.x,
          top: selection.geometry.y,
          right: selection.geometry.x + selection.geometry.width,
          bottom: selection.geometry.y + selection.geometry.height
        });
      } else {
        hideEditMapTooltip();
      }
      send("preview-inspect-hover", selection);
    });
  }

  function blockAction(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    if (isPreviewControlTarget(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function onInspectPointerDown(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    var target = targetForPointerEvent(event);
    if (isPreviewControlTarget(target)) return;
    var editRuntime = editModeEnabled ? editMapTargetForPointer(target, event.clientX, event.clientY) : null;
    var selectedTarget = editRuntime ? editRuntime.element : target;
    var selection = selectionFor(selectedTarget);
    blockAction(event);
    if (!selection) return;
    dragStart = { x: event.clientX, y: event.clientY, selection: selection, target: selectedTarget, editRuntime: editRuntime };
    dragging = false;
  }

  function onInspectPointerUp(event) {
    if (!inspectEnabled || !event.isTrusted || !dragStart) return;
    blockAction(event);
    var interactionStartedAt = Date.now();
    var selection = Object.assign({}, dragStart.selection, { interactionStartedAt: interactionStartedAt });
    if (dragging && !editModeEnabled) {
      var areaRect = {
        x: Math.round(Math.min(dragStart.x, event.clientX)),
        y: Math.round(Math.min(dragStart.y, event.clientY)),
        width: Math.round(Math.abs(event.clientX - dragStart.x)),
        height: Math.round(Math.abs(event.clientY - dragStart.y))
      };
      var endTarget = targetForPointerEvent(event);
      var owner = commonMappedOwner(dragStart.target, endTarget);
      selection = owner ? selectionFor(owner, true, interactionStartedAt) : visualAreaSelection(areaRect, interactionStartedAt);
      if (owner && selection) {
        selection.selectionKind = "area";
        selection.geometry = areaRect;
      }
    }
    var selectedEditRuntime = dragStart.editRuntime;
    dragStart = null;
    dragging = false;
    selectInspection(selection, selectedEditRuntime);
  }

  function onInspectPointerCancel() {
    dragStart = null;
    dragging = false;
  }

  function isHostedInlineEditorTarget(target) {
    return Boolean(
      hostMode &&
      hostedInlineEditorField &&
      target &&
      (target === hostedInlineEditorField || hostedInlineEditorField.contains(target))
    );
  }

  function onInspectKeydown(event) {
    // Full Preview normally captures keyboard input to keep the learner frame
    // inert in Edit mode. The one exception is Studio's own host overlay.
    // Let its local key handler process typing, Escape, and Cmd/Ctrl+Enter.
    if (isHostedInlineEditorTarget(event.target)) return;
    if (reviewLightbox && event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      closeReviewLightbox();
      return;
    }
    if (!inspectEnabled || !event.isTrusted) return;
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopImmediatePropagation();
      setInspectMode(false, true);
      return;
    }
    if (isPreviewControlTarget(event.target)) return;
    if (event.key === "Tab") return;
    blockAction(event);
    if (event.key === "ArrowDown" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowLeft") {
      moveKeyboardCursor(event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    var active = document.activeElement && document.activeElement !== document.body ? document.activeElement : keyboardCursor;
    var editRuntime = editModeEnabled ? editMapTargetForPointer(active, 0, 0) : null;
    var selection = selectionFor(editRuntime ? editRuntime.element : active, true, Date.now());
    if (!selection) return;
    selectInspection(selection, editRuntime);
  }

  function onInspectWheel(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    if (isPreviewControlTarget(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.scrollBy({ left: event.deltaX, top: event.deltaY, behavior: "auto" });
  }

  function setInspectMode(enabled, notifyStudio, keyboardEntry) {
    var nextInspectEnabled = Boolean(enabled);
    var inspectModeChanged = inspectEnabled !== nextInspectEnabled;
    inspectEnabled = nextInspectEnabled;
    document.documentElement.setAttribute("data-canvas-helper-inspect-active", inspectEnabled ? "true" : "false");
    if (hostMode) {
      if (!inspectEnabled) pendingHostedKeyboardEntry = false;
      if (inspectEnabled && keyboardEntry) pendingHostedKeyboardEntry = true;
      var shouldStartFromKeyboard = inspectEnabled && pendingHostedKeyboardEntry;
      if (sendHostedCourse("studio-set-inspect-mode", { enabled: inspectEnabled, keyboardEntry: shouldStartFromKeyboard }) && shouldStartFromKeyboard) {
        pendingHostedKeyboardEntry = false;
      }
      if (inspectModeChanged) updateStandaloneControls();
      updateHostedCourseGuard();
      if (notifyStudio) send("preview-inspect-mode", { enabled: inspectEnabled });
      if (!inspectEnabled && notifyStudio && inspectControl) {
        window.requestAnimationFrame(function() { inspectControl.focus(); });
      }
      return;
    }
    var element = ensureShield();
    element.style.display = inspectEnabled ? "block" : "none";
    element.style.pointerEvents = inspectEnabled ? "auto" : "none";
    if (!inspectEnabled) {
      removeEditPreviewOverlay();
      hideOverlay();
      dragStart = null;
      dragging = false;
      keyboardCursor = null;
      hoverEvent = null;
      stopKeyboardMutationObserver();
      restoreTemporaryFocus();
    } else if (!hostMode) {
      startKeyboardMutationObserver();
      if (keyboardEntry) window.requestAnimationFrame(function() { moveKeyboardCursor(1); });
    }
    // Studio echoes the active mode back to every preview surface. Preserve a
    // useful local status such as "Selection ready" when that echo does not
    // actually change this preview's mode.
    if (inspectModeChanged) updateStandaloneControls();
    updateEditMapVisuals();
    // The nested Full Preview learner acknowledges mode setup directly to its
    // host. It is deliberately not forwarded to Studio: a delayed initial
    // "off" acknowledgement must never turn off a newer Studio edit session.
    if (window.top !== window) send("preview-hosted-inspect-ready", { enabled: inspectEnabled });
    if (notifyStudio) send("preview-inspect-mode", { enabled: inspectEnabled });
  }

  function reportNavigationIfChanged() {
    navigationReportTimer = 0;
    if (hostMode) return;
    var nextIdentity = pageIdentity(location.href);
    if (!nextIdentity || nextIdentity === lastNavigationIdentity) return;
    lastNavigationIdentity = nextIdentity;
    sourceNodeCounts = null;
    sourceNodeElements = null;
    keyboardCandidateCache = null;
    keyboardCandidateCacheDirty = true;
    scrollSelectorsInitialized = false;
    lastSelectors = [];
    keyboardCursor = null;
    editLastSelection = null;
    removeEditPreviewOverlay();
    if (inspectEnabled) startKeyboardMutationObserver();
    reviewSelection = null;
    reviewLocalMessage = "The course page changed. Select an element again.";
    dragStart = null;
    dragging = false;
    hideOverlay();
    hideEditMapTooltip();
    scheduleEditMapRefresh();
    renderReviewPanel();
    send("preview-navigation", { href: location.href });
    beginContentHealthCheck();
    scheduleScrollState();
  }

  function scheduleNavigationReport() {
    if (navigationReportTimer) return;
    navigationReportTimer = window.setTimeout(reportNavigationIfChanged, 0);
  }

  function isCommand(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && typeof data.type === "string";
  }

  function isBootstrap(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && data.type === "studio-connect" && data.payload === null;
  }

  function isReviewState(value) {
    if (!value || typeof value !== "object" || !Array.isArray(value.items) || value.items.length > MAX_REVIEW_ITEMS) return false;
    if (typeof value.sessionId !== "string" || !(new RegExp("^[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}$")).test(value.sessionId) || typeof value.draftScreenshotCount !== "number" || value.draftScreenshotCount < 0 || value.draftScreenshotCount > MAX_REVIEW_SCREENSHOTS || value.draftScreenshotCount % 1 !== 0 || typeof value.captureItemId !== "string" || value.captureItemId.length > MAX_REVIEW_ITEM_ID || typeof value.saving !== "boolean" || typeof value.copying !== "boolean" || typeof value.preparing !== "boolean" || typeof value.packetReady !== "boolean" || typeof value.status !== "string" || value.status.length > MAX_REVIEW_STATUS || typeof value.error !== "string" || value.error.length > MAX_REVIEW_STATUS || (value.undoLabel !== undefined && (typeof value.undoLabel !== "string" || value.undoLabel.length > MAX_SESSION_NAME))) return false;
    return value.items.every(function(item) {
      return item && typeof item === "object" && typeof item.id === "string" && item.id.length > 0 && item.id.length <= MAX_REVIEW_ITEM_ID && typeof item.projectSlug === "string" && item.projectSlug.length > 0 && item.projectSlug.length <= MAX_REVIEW_ITEM_ID && typeof item.nodeId === "string" && item.nodeId.length > 0 && item.nodeId.length <= MAX_REVIEW_ITEM_ID && typeof item.excerpt === "string" && item.excerpt.length <= MAX_REVIEW_EXCERPT && typeof item.teacherNote === "string" && item.teacherNote.length <= MAX_REVIEW_NOTE && ["draft", "sent", "accepted", "reopened"].indexOf(item.handoffState) >= 0 && Array.isArray(item.screenshots) && item.screenshots.length <= MAX_REVIEW_SCREENSHOTS && item.screenshots.every(function(screenshot) {
        return screenshot && typeof screenshot === "object" && typeof screenshot.id === "string" && screenshot.id.length > 0 && screenshot.id.length <= MAX_REVIEW_ITEM_ID && isReviewScreenshotPath(screenshot.filePath) && typeof screenshot.ownerNodeId === "string" && screenshot.ownerNodeId.length > 0 && screenshot.ownerNodeId.length <= MAX_REVIEW_ITEM_ID;
      });
    });
  }

  function isReviewActionResult(value) {
    return value && typeof value === "object" && typeof value.ok === "boolean" && typeof value.message === "string" && value.message.length <= MAX_REVIEW_STATUS && typeof value.clearDraft === "boolean" && (value.requestId === undefined || (typeof value.requestId === "string" && value.requestId.length > 0 && value.requestId.length <= MAX_REQUEST_ID));
  }

  function isEditState(value) {
    return value && typeof value === "object" && typeof value.projectSlug === "string" && typeof value.enabled === "boolean" && typeof value.available === "boolean" && typeof value.unavailableReason === "string" && (value.target === null || typeof value.target === "object") && Array.isArray(value.drafts) && value.drafts.length <= 20 && (value.selectedDraft === null || typeof value.selectedDraft === "object") && typeof value.busy === "boolean" && typeof value.canUndo === "boolean" && typeof value.exportsOutOfDate === "boolean" && Array.isArray(value.staleExportTargets) && typeof value.status === "string" && typeof value.error === "string";
  }

  function isEditActionResult(value) {
    return value && typeof value === "object" && typeof value.ok === "boolean" && typeof value.message === "string" && value.message.length <= MAX_REVIEW_STATUS && (value.requestId === undefined || (typeof value.requestId === "string" && value.requestId.length > 0 && value.requestId.length <= MAX_REQUEST_ID));
  }

  function hostedTargetUrl(value) {
    if (!hostMode) return null;
    var currentHref = hostedCourseReadyHref || (hostedCourseFrame && hostedCourseFrame.src) || "";
    var rebased = currentHref ? rebaseCourseUrl(value, currentHref, PREVIEW_ORIGIN) : null;
    if (rebased) return rebased;
    var parsed = boundedCourseUrl(value);
    return parsed && parsed.url.origin === PREVIEW_ORIGIN ? parsed.url : null;
  }

  function replaceHostedTargetInLocation(value) {
    if (!hostMode || !standaloneUrl) return;
    var target = boundedCourseUrl(value);
    if (!target || target.url.origin !== PREVIEW_ORIGIN) return;
    try {
      var nextUrl = new URL(location.href);
      nextUrl.searchParams.set("target", target.url.toString());
      nextUrl.searchParams.delete(STANDALONE_SESSION_PARAM);
      nextUrl.searchParams.delete(STANDALONE_REJOIN_PARAM);
      history.replaceState(history.state, "", nextUrl.pathname + nextUrl.search + nextUrl.hash);
      standaloneUrl = nextUrl;
    } catch (_) {}
  }

  function flushHostedFocusRequest() {
    if (!hostedFocusRequest || !hostedCourseReadyHref) return;
    var target = hostedTargetUrl(hostedFocusRequest.pageHref);
    if (!target || pageIdentity(target) !== pageIdentity(hostedCourseReadyHref)) return;
    sendHostedCourse("studio-focus-inspect-node", {
      requestId: hostedFocusRequest.requestId,
      nodeId: hostedFocusRequest.nodeId
    });
  }

  function showHostedCourseNode(payload) {
    if (
      !hostMode ||
      !payload ||
      typeof payload.requestId !== "string" ||
      !payload.requestId ||
      payload.requestId.length > MAX_REQUEST_ID ||
      typeof payload.nodeId !== "string" ||
      !payload.nodeId ||
      payload.nodeId.length > MAX_REVIEW_ITEM_ID
    ) return;
    var target = hostedTargetUrl(payload.pageHref);
    if (!target || !hostedCourseFrame) {
      send("preview-inspect-focused", { requestId: payload.requestId, nodeId: payload.nodeId, focused: false });
      return;
    }
    hostedFocusRequest = {
      requestId: payload.requestId,
      nodeId: payload.nodeId,
      pageHref: target.toString()
    };
    if (pageIdentity(hostedCourseReadyHref) === pageIdentity(target)) {
      flushHostedFocusRequest();
      return;
    }
    hostedCourseReadyHref = "";
    hostedCourseFrame.src = target.toString();
  }

  function showCurrentCourseNode(payload) {
    if (
      hostMode ||
      !payload ||
      typeof payload.requestId !== "string" ||
      !payload.requestId ||
      payload.requestId.length > MAX_REQUEST_ID ||
      typeof payload.nodeId !== "string" ||
      !payload.nodeId ||
      payload.nodeId.length > MAX_REVIEW_ITEM_ID
    ) return;
    var target = rebaseCourseUrl(payload.pageHref, location.href, location.origin);
    if (!target) {
      send("preview-inspect-focused", { requestId: payload.requestId, nodeId: payload.nodeId, focused: false });
      return;
    }
    if (pageIdentity(location.href) !== pageIdentity(target)) {
      try {
        location.assign(target.toString());
      } catch (_) {
        send("preview-inspect-focused", { requestId: payload.requestId, nodeId: payload.nodeId, focused: false });
      }
      return;
    }
    focusSourceNode(payload.nodeId, payload.requestId);
  }

  function refreshPreviewTarget(value) {
    if (hostMode) {
      var target = hostedTargetUrl(value);
      if (!target || !hostedCourseFrame) return;
      hostedCourseReadyHref = "";
      hostedCourseInteractionReady = false;
      updateHostedCourseGuard();
      hostedCourseHealth = null;
      setHostedCourseRecovery("");
      scheduleHostedCourseHealthTimeout();
      replaceHostedTargetInLocation(target.toString());
      hostedCourseFrame.src = target.toString();
      return;
    }
    var currentTarget = rebaseCourseUrl(value, location.href, location.origin);
    if (!currentTarget) return;
    try { location.assign(currentTarget.toString()); } catch (_) {}
  }

  function handleHostedCourseMessage(event) {
    if (!isCommand(event.data)) return;
    var data = event.data;
    if (data.type === "preview-ready" && data.payload && typeof data.payload.href === "string") {
      clearHostedCourseConnectRetry();
      clearHostedCourseHandshakeTimeout();
      hostedCourseConnectPending = false;
      hostedCourseConnectAttempts = 0;
      hostedCourseReadyHref = data.payload.href;
      hostedCourseInteractionReady = false;
      updateHostedCourseGuard();
      replaceHostedTargetInLocation(hostedCourseReadyHref);
      send("preview-ready", data.payload);
      var shouldStartFromKeyboard = inspectEnabled && pendingHostedKeyboardEntry;
      if (sendHostedCourse("studio-set-inspect-mode", { enabled: inspectEnabled, keyboardEntry: shouldStartFromKeyboard }) && shouldStartFromKeyboard) {
        pendingHostedKeyboardEntry = false;
      }
      sendHostedCourse("studio-set-edit-visual-mode", { enabled: editModeEnabled });
      if (hostedEditPreview) sendHostedCourse("studio-set-edit-preview", hostedEditPreview);
      flushHostedFocusRequest();
      return;
    }
    if (data.type === "preview-health") {
      hostedCourseHealth = data.payload;
      send("preview-health", data.payload);
      if (data.payload && data.payload.status === "empty") {
        clearHostedCourseHealthTimeout();
        setHostedCourseRecovery("Course content did not appear. Retry or return to Studio.");
      } else if (data.payload && data.payload.status === "ready") {
        clearHostedCourseHealthTimeout();
        setHostedCourseRecovery("");
        updateStandaloneControls();
      }
      return;
    }
    if (data.type === "preview-navigation" && data.payload && typeof data.payload.href === "string") {
      hostedCourseReadyHref = data.payload.href;
      hostedCourseInteractionReady = false;
      updateHostedCourseGuard();
      hostedCourseHealth = null;
      setHostedCourseRecovery("");
      scheduleHostedCourseHealthTimeout();
      reviewSelection = null;
      removeHostedInlineEditor();
      reviewLocalMessage = "The course page changed. Select an element again.";
      renderReviewPanel();
      flushHostedFocusRequest();
    }
    if (data.type === "preview-inspect-selected") {
      if (editModeEnabled) {
        editLastSelection = data.payload;
        setEditPanelOpen(true);
        scheduleEditPanelPosition();
        setStandaloneStatus("Checking this edit target…");
      } else {
        reviewSelection = data.payload;
        reviewLocalMessage = data.payload && data.payload.nodeId ? "Add a note or screenshot, then save this annotation." : "Choose a more specific course element.";
        setReviewPanelOpen(true);
        setStandaloneStatus("Selection ready.");
      }
    }
    if (data.type === "preview-hosted-inspect-ready" && data.payload && typeof data.payload.enabled === "boolean") {
      if (data.payload.enabled === inspectEnabled) {
        hostedCourseInteractionReady = true;
      }
      updateHostedCourseGuard();
    }
    if (data.type === "preview-inspect-mode" && data.payload && typeof data.payload.enabled === "boolean") {
      inspectEnabled = Boolean(data.payload.enabled);
      updateHostedCourseGuard();
      document.documentElement.setAttribute("data-canvas-helper-inspect-active", inspectEnabled ? "true" : "false");
      if (!inspectEnabled) pendingHostedKeyboardEntry = false;
      updateStandaloneControls({ renderReview: false });
      if (!inspectEnabled && inspectControl) window.requestAnimationFrame(function() { inspectControl.focus(); });
    }
    if (data.type === "preview-inspect-focused" && hostedFocusRequest && data.payload && data.payload.requestId === hostedFocusRequest.requestId) {
      hostedFocusRequest = null;
    }
    if (
      data.type === "preview-scroll-state" ||
      data.type === "preview-navigation" ||
      data.type === "preview-inspect-hover" ||
      data.type === "preview-inspect-selected" ||
      data.type === "preview-inspect-current" ||
      data.type === "preview-inspect-focused" ||
      data.type === "preview-inspect-mode" ||
      data.type === "preview-edit-preview-ack" ||
      data.type === "preview-edit-action" ||
      data.type === "preview-health" ||
      data.type === "preview-diagnostic" ||
      data.type === "preview-error"
    ) send(data.type, data.payload);
  }

  function connectHostedCourse() {
    if (!hostMode || typeof MessageChannel !== "function") return;
    hostedCourseFrame = document.querySelector("[data-canvas-helper-standalone-course]");
    if (!hostedCourseFrame || !hostedCourseFrame.contentWindow) {
      scheduleHostedCourseConnectRetry();
      return;
    }
    if (hostedCourseConnectPending || (hostedCoursePort && hostedCourseReadyHref)) return;
    hostedCourseHealth = null;
    setHostedCourseRecovery("");
    scheduleHostedCourseHealthTimeout();
    closeHostedCoursePort();
    var channel = new MessageChannel();
    hostedCoursePort = channel.port1;
    hostedCourseConnectPending = true;
    channel.port1.onmessage = handleHostedCourseMessage;
    if (typeof channel.port1.start === "function") channel.port1.start();
    try {
      hostedCourseFrame.contentWindow.postMessage(message("studio-connect", null), PREVIEW_ORIGIN, [channel.port2]);
      scheduleHostedCourseHandshakeTimeout();
    } catch (_) {
      try { channel.port1.close(); } catch (_) {}
      try { channel.port2.close(); } catch (_) {}
      hostedCoursePort = null;
      hostedCourseConnectPending = false;
      scheduleHostedCourseConnectRetry();
    }
  }

  function handlePortMessage(event) {
    if (!isCommand(event.data)) return;
    studioConnected = true;
    reconnectAttempts = 0;
    if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = 0; }
    updateStandaloneControls({ renderReview: false });
    if (event.data.type === "studio-request-state" && event.data.payload === null) {
      if (hostMode) sendHostedCourse("studio-request-state", null); else sendScrollState();
    }
    if (event.data.type === "studio-restore-scroll") {
      if (hostMode) sendHostedCourse("studio-restore-scroll", event.data.payload); else restoreScrollState(event.data.payload);
    }
    if (event.data.type === "studio-set-inspect-mode" && event.data.payload && typeof event.data.payload.enabled === "boolean") {
      setInspectMode(event.data.payload.enabled, false, event.data.payload.keyboardEntry === true);
    }
    if (event.data.type === "studio-set-edit-visual-mode" && event.data.payload && typeof event.data.payload.enabled === "boolean") {
      editModeEnabled = Boolean(event.data.payload.enabled);
      if (!editModeEnabled) {
        hostedEditPreview = null;
        removeEditPreviewOverlay();
        removeHostedInlineEditor();
      }
      keyboardCandidateCacheDirty = true;
      if (hostMode) sendHostedCourse("studio-set-edit-visual-mode", { enabled: editModeEnabled });
      updateEditMapVisuals();
      updateStandaloneControls({ renderReview: false });
    }
    if (event.data.type === "studio-set-edit-preview") {
      if (hostMode) {
        hostedEditPreview = event.data.payload;
        sendHostedCourse("studio-set-edit-preview", hostedEditPreview);
      }
      else applyEditPreviewCommand(event.data.payload);
    }
    if (event.data.type === "studio-set-inline-editor" && hostMode) {
      applyHostedInlineEditorCommand(event.data.payload);
    }
    if (
      event.data.type === "studio-request-inspect-current" &&
      event.data.payload &&
      typeof event.data.payload.requestId === "string" &&
      event.data.payload.requestId.length > 0 &&
      event.data.payload.requestId.length <= MAX_REQUEST_ID &&
      typeof event.data.payload.nodeId === "string"
    ) {
      if (hostMode) {
        sendHostedCourse("studio-request-inspect-current", event.data.payload);
        return;
      }
      var element = elementForSourceNodeId(event.data.payload.nodeId);
      var selection = element ? selectionFor(element) : null;
      if (!selection || selection.nodeId !== event.data.payload.nodeId) {
        send("preview-error", { requestId: event.data.payload.requestId, message: "The selected preview element is no longer available. Select it again before capturing a screenshot." });
        return;
      }
      send("preview-inspect-current", { requestId: event.data.payload.requestId, selection: selection });
    }
    if (
      event.data.type === "studio-focus-inspect-node" &&
      event.data.payload &&
      typeof event.data.payload.requestId === "string" &&
      typeof event.data.payload.nodeId === "string"
    ) {
      if (hostMode) sendHostedCourse("studio-focus-inspect-node", event.data.payload);
      else focusSourceNode(event.data.payload.nodeId, event.data.payload.requestId);
    }
    if (event.data.type === "studio-show-inspect-node") {
      if (hostMode) showHostedCourseNode(event.data.payload);
      else showCurrentCourseNode(event.data.payload);
    }
    if (event.data.type === "studio-refresh-preview" && event.data.payload && typeof event.data.payload.href === "string") {
      refreshPreviewTarget(event.data.payload.href);
    }
    if (event.data.type === "studio-disconnect-standalone" && hostMode) {
      studioConnected = false;
      reviewCopyTransaction = null;
      reviewCopyPending = false;
      removeHostedInlineEditor();
      if (port) { try { port.close(); } catch (_) {} }
      port = null;
      updateStandaloneControls({ renderReview: false });
      scheduleStandaloneReconnect();
      return;
    }
    if (
      event.data.type === "studio-cancel-review-copy" &&
      event.data.payload &&
      typeof event.data.payload.copyId === "string" &&
      typeof event.data.payload.message === "string" &&
      reviewCopyTransaction &&
      reviewCopyTransaction.copyId === event.data.payload.copyId
    ) {
      reviewCopyTransaction = null;
      reviewCopyPending = false;
      reviewCopyReservationResult = null;
      reviewLocalMessage = event.data.payload.message;
      renderReviewPanel();
      return;
    }
    if (event.data.type === "studio-set-review-state" && isReviewState(event.data.payload)) {
      reviewState = event.data.payload;
      if (!reviewState.captureItemId && reviewState.draftScreenshotCount >= 0 && reviewCapturePending && reviewLocalMessage !== "Capturing the course preview…") {
        reviewCapturePending = false;
      }
      renderReviewPanel();
    }
    if (event.data.type === "studio-set-review-packet" && event.data.payload && typeof event.data.payload.packet === "string" && event.data.payload.packet.length <= MAX_REVIEW_PACKET && typeof event.data.payload.packetId === "string" && (event.data.payload.packetId === "" || /^[a-f0-9]{16}$/.test(event.data.payload.packetId)) && Array.isArray(event.data.payload.itemIds) && event.data.payload.itemIds.length <= MAX_REVIEW_ITEMS && !event.data.payload.itemIds.some(function(itemId, index) { return typeof itemId !== "string" || !itemId || itemId.length > MAX_REVIEW_ITEM_ID || event.data.payload.itemIds.indexOf(itemId) !== index; }) && typeof event.data.payload.reviewSessionId === "string" && (new RegExp("^[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}$")).test(event.data.payload.reviewSessionId)) {
      reviewPacket = event.data.payload.packet;
      reviewPacketId = event.data.payload.packetId;
      reviewPacketItemIds = event.data.payload.itemIds.slice();
      reviewPacketSessionId = event.data.payload.reviewSessionId;
      renderReviewPanel();
    }
    if (event.data.type === "studio-review-action-result" && isReviewActionResult(event.data.payload)) {
      if (event.data.payload.requestId && latestReviewActionId && event.data.payload.requestId !== latestReviewActionId) return;
      reviewCapturePending = false;
      reviewSavePending = false;
      reviewLocalMessage = event.data.payload.message;
      if (
        reviewCopyTransaction &&
        event.data.payload.requestId === reviewCopyTransaction.requestId
      ) {
        if (reviewCopyTransaction.phase === "reserving" && event.data.payload.ok) {
          completeReservedReviewCopy(reviewCopyTransaction);
          return;
        }
        reviewCopyTransaction = null;
        reviewCopyPending = false;
      } else if (
        reviewCopyTransaction &&
        reviewCopyTransaction.phase === "reserving" &&
        !reviewCopyTransaction.requestId &&
        event.data.payload.requestId
      ) {
        reviewCopyReservationResult = event.data.payload;
      } else if (!reviewCopyTransaction) {
        reviewCopyPending = false;
      }
      if (event.data.payload.ok && /sent to codex/i.test(event.data.payload.message)) {
        reviewManualPacketSnapshot = null;
        if (reviewPacketFallback) reviewPacketFallback.style.display = "none";
        if (reviewPacketConfirm) reviewPacketConfirm.style.display = "none";
      }
      if (event.data.payload.clearDraft) {
        reviewSelection = null;
        if (reviewDraft) reviewDraft.value = "";
      }
      renderReviewPanel();
      if (event.data.payload.ok && reviewPanel && (event.data.payload.clearDraft || /removed/i.test(event.data.payload.message))) {
        window.requestAnimationFrame(function() { reviewPanel.focus(); });
      }
    }
    if (event.data.type === "studio-set-edit-state" && isEditState(event.data.payload)) {
      var previousTargetId = editState.target && editState.target.targetId;
      var previousDraftId = editState.selectedDraft && editState.selectedDraft.id;
      editState = event.data.payload;
      editModeEnabled = Boolean(editState.enabled);
      if (!editModeEnabled) removeEditPreviewOverlay();
      keyboardCandidateCacheDirty = true;
      if (hostMode) sendHostedCourse("studio-set-edit-state", event.data.payload);
      if (editModeEnabled) editPanelOpen = true;
      var nextTargetId = editState.target && editState.target.targetId;
      var nextDraftId = editState.selectedDraft && editState.selectedDraft.id;
      if (previousTargetId !== nextTargetId || previousDraftId !== nextDraftId) populateEditComposer();
      updateEditMapVisuals();
      updateStandaloneControls({ renderReview: false });
    }
    if (event.data.type === "studio-edit-action-result" && isEditActionResult(event.data.payload)) {
      if (event.data.payload.requestId && latestEditActionId && event.data.payload.requestId !== latestEditActionId) return;
      if (event.data.payload.ok && pendingEditAnnotationId && event.data.payload.requestId === pendingEditAnnotationId && editLastSelection) {
        pendingEditAnnotationId = "";
        reviewSelection = editLastSelection;
        reviewLocalMessage = "Add a note or screenshot, then save this annotation.";
        setEditPanelOpen(false);
        setReviewPanelOpen(true);
      } else if (pendingEditAnnotationId && event.data.payload.requestId === pendingEditAnnotationId) {
        pendingEditAnnotationId = "";
      }
      if (editMessage) editMessage.textContent = event.data.payload.message;
      renderEditPanel();
    }
  }

  function attachPort(nextPort) {
    if (!nextPort || typeof nextPort.postMessage !== "function") return;
    if (port) { try { port.close(); } catch (_) {} }
    port = nextPort;
    studioConnected = false;
    port.onmessage = handlePortMessage;
    port.onmessageerror = function() {
      studioConnected = false;
      reviewCopyTransaction = null;
      reviewCopyPending = false;
      updateStandaloneControls();
      if (hostMode) scheduleStandaloneReconnect();
    };
    if (typeof port.start === "function") port.start();
    if (hostMode) {
      if (hostedCourseReadyHref) send("preview-ready", { href: hostedCourseReadyHref });
      if (hostedCourseHealth) send("preview-health", hostedCourseHealth);
      sendHostedCourse("studio-request-state", null);
    } else {
      send("preview-ready", { href: location.href });
      if (contentHealth) send("preview-health", contentHealth);
      sendScrollState();
    }
    if (window.top === window) {
      send("preview-review-action", { action: "request-state" });
      send("preview-edit-action", { action: "request-state" });
    }
    updateStandaloneControls();
  }

  function scheduleStandaloneReconnect() {
    if (!hostMode || studioConnected || reconnectTimer || !standaloneRejoinToken || !trustedStudioWindow || reconnectAttempts >= 120) return;
    reconnectTimer = window.setTimeout(function() {
      reconnectTimer = 0;
      if (studioConnected || !trustedStudioWindow || trustedStudioWindow.closed || typeof MessageChannel !== "function") return;
      reconnectAttempts += 1;
      var channel = new MessageChannel();
      try {
        trustedStudioWindow.postMessage(
          message(STANDALONE_HOST_REJOIN_TYPE, { rejoinToken: standaloneRejoinToken }),
          STUDIO_ORIGIN,
          [channel.port2]
        );
        attachPort(channel.port1);
      } catch (_) {
        try { channel.port1.close(); } catch (_) {}
        try { channel.port2.close(); } catch (_) {}
      }
      window.setTimeout(function() {
        if (!studioConnected) scheduleStandaloneReconnect();
      }, 800);
    }, 500);
  }

  function connectStandalonePreview() {
    if (captureMode || window.top !== window) return;
    var studioWindow = hostMode ? trustedStudioWindow : window.opener;
    if (!studioWindow || typeof MessageChannel !== "function" || (hostMode && !standaloneRejoinToken)) {
      try { window.opener = null; } catch (_) {}
      return;
    }
    if (hostMode && !standaloneSessionToken) {
      scheduleStandaloneReconnect();
      return;
    }
    if (!standaloneSessionToken) {
      try { window.opener = null; } catch (_) {}
      return;
    }

    var channel = new MessageChannel();
    try {
      studioWindow.postMessage(
        hostMode
          ? message(STANDALONE_HOST_BOOTSTRAP_TYPE, { sessionToken: standaloneSessionToken, rejoinToken: standaloneRejoinToken })
          : message(STANDALONE_BOOTSTRAP_TYPE, { sessionToken: standaloneSessionToken }),
        STUDIO_ORIGIN,
        [channel.port2]
      );
      attachPort(channel.port1);
    } catch (_) {
      try { channel.port1.close(); } catch (_) {}
      try { channel.port2.close(); } catch (_) {}
    } finally {
      standaloneSessionToken = "";
      if (!hostMode) try { window.opener = null; } catch (_) {}
    }
    if (hostMode) window.setTimeout(function() { if (!studioConnected) scheduleStandaloneReconnect(); }, 800);
  }

  window.addEventListener("message", function(event) {
    if (
      window.top === window ||
      event.origin !== STUDIO_ORIGIN ||
      event.source !== window.parent ||
      !event.ports ||
      event.ports.length !== 1 ||
      !isBootstrap(event.data)
    ) return;
    event.stopImmediatePropagation();
    attachPort(event.ports[0]);
  }, true);
  connectStandalonePreview();

  window.addEventListener("scroll", scheduleScrollState, { passive: true });
  document.addEventListener("scroll", scheduleScrollState, true);
  window.addEventListener("scroll", scheduleEditPreviewPosition, { passive: true });
  document.addEventListener("scroll", scheduleEditPreviewPosition, true);
  window.addEventListener("resize", scheduleEditPreviewPosition, { passive: true });
  window.addEventListener("resize", scheduleEditPanelPosition, { passive: true });
  window.addEventListener("resize", scheduleHostedInlineEditorPosition, { passive: true });
  if (!hostMode) {
    lastNavigationIdentity = pageIdentity(location.href);
    ["pushState", "replaceState"].forEach(function(methodName) {
      var original = history[methodName];
      if (typeof original !== "function") return;
      try {
        history[methodName] = function() {
          var result = original.apply(history, arguments);
          scheduleNavigationReport();
          return result;
        };
      } catch (_) {}
    });
    window.addEventListener("hashchange", scheduleNavigationReport);
    window.addEventListener("popstate", scheduleNavigationReport);
    window.setInterval(reportNavigationIfChanged, 100);
  }
  if (!hostMode) {
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerdown", onInspectPointerDown, true);
    document.addEventListener("pointerup", onInspectPointerUp, true);
    document.addEventListener("pointercancel", onInspectPointerCancel, true);
    ["click", "dblclick", "auxclick", "contextmenu", "dragstart", "drag", "dragend", "drop", "submit", "beforeinput", "input", "change", "touchstart", "touchend"].forEach(function(type) {
      document.addEventListener(type, blockAction, true);
    });
    document.addEventListener("keyup", blockAction, true);
    document.addEventListener("keypress", blockAction, true);
    document.addEventListener("wheel", onInspectWheel, { capture: true, passive: false });
  }
  document.addEventListener("keydown", onInspectKeydown, true);
  window.addEventListener("error", function(event) {
    var target = event.target;
    if (target && target !== window && target instanceof Element) {
      var tagName = target.tagName ? target.tagName.toLowerCase() : "asset";
      sendDiagnostic("asset-error", tagName + " failed to load", "A preview asset failed to load.");
      return;
    }
    sendDiagnostic("runtime-error", event.message, "A preview script reported an error.");
  }, true);
  window.addEventListener("unhandledrejection", function(event) {
    var reason = event && event.reason;
    var message = reason && typeof reason === "object" && typeof reason.message === "string" ? reason.message : String(reason || "");
    sendDiagnostic("unhandled-rejection", message, "A preview promise was rejected.");
  });

  function clearContentHealthCheck() {
    if (contentHealthTimer) {
      window.clearTimeout(contentHealthTimer);
      contentHealthTimer = 0;
    }
    if (contentHealthMutationTimer) {
      window.clearTimeout(contentHealthMutationTimer);
      contentHealthMutationTimer = 0;
    }
    if (contentHealthObserver) {
      try { contentHealthObserver.disconnect(); } catch (_) {}
      contentHealthObserver = null;
    }
  }

  function disconnectContentHealthObserver() {
    if (contentHealthObserver) {
      try { contentHealthObserver.disconnect(); } catch (_) {}
      contentHealthObserver = null;
    }
    if (contentHealthMutationTimer) {
      window.clearTimeout(contentHealthMutationTimer);
      contentHealthMutationTimer = 0;
    }
  }

  function isVisibleCourseElement(element) {
    if (!element || element.closest("[data-canvas-helper-preview-controls], [data-canvas-helper-edit-map-toolbar], [data-canvas-helper-edit-map-tooltip], [data-canvas-helper-edit-preview-overlay], [hidden], [aria-hidden='true']")) return false;
    try {
      var ancestor = element;
      while (ancestor && ancestor.nodeType === 1) {
        var style = window.getComputedStyle(ancestor);
        if (
          style.display === "none" ||
          style.visibility === "hidden" ||
          style.visibility === "collapse" ||
          Number(style.opacity) === 0
        ) return false;
        if (ancestor === document.body || ancestor === document.documentElement) break;
        ancestor = ancestor.parentElement;
      }
      var rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && element.getClientRects().length > 0;
    } catch (_) {
      return false;
    }
  }

  function isLoadingPlaceholderText(value) {
    var normalized = boundedString(value, 240)
      .toLowerCase()
      .replace(/[.…!,:;_\-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!normalized) return false;
    return /^(?:(?:loading|working|preparing|starting)(?: (?:the|your|course|lesson|module|page|preview|content|activity|resources?|experience|things|now)){0,6}(?: please wait)?|please wait(?: (?:for|while|the|your|course|lesson|module|page|preview|content|activity|resources?|experience|things|now)){0,6})$/i.test(normalized);
  }

  function isLoadingStatusElement(element) {
    return Boolean(element && element.closest("progress, [role='status'], [role='progressbar'], [aria-busy='true']"));
  }

  function isMeaningfulVisual(element) {
    if (!isVisibleCourseElement(element)) return false;
    var tag = element.tagName ? element.tagName.toLowerCase() : "";
    if (element.getAttribute("role") === "progressbar" || isLoadingStatusElement(element)) return false;
    if (tag === "input" && element.getAttribute("type") === "hidden") return false;
    if (tag !== "svg" && tag !== "canvas") return true;
    var label = boundedString(element.getAttribute("aria-label") || element.getAttribute("title") || "", 120);
    if (!label && tag === "svg") {
      var title = element.querySelector("title");
      label = boundedString(title && title.textContent, 120);
    }
    return Boolean(label && !isLoadingPlaceholderText(label));
  }

  function inspectCourseContent() {
    if (hostMode || captureMode || !document.body) return { textLength: 0, visualCount: 0 };
    var textLength = 0;
    var visibleText = "";
    try {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      var node = walker.nextNode();
      while (node && textLength < 100000) {
        var parent = node.parentElement;
        var tag = parent && parent.tagName ? parent.tagName.toLowerCase() : "";
        if (
          parent &&
          tag !== "script" &&
          tag !== "style" &&
          tag !== "noscript" &&
          tag !== "template" &&
          !isLoadingStatusElement(parent) &&
          isVisibleCourseElement(parent)
        ) {
          var text = boundedString(node.nodeValue, 100000 - textLength);
          if (text) {
            visibleText += (visibleText ? " " : "") + text;
            textLength = visibleText.length;
          }
        }
        node = walker.nextNode();
      }
    } catch (_) {}
    if (isLoadingPlaceholderText(visibleText)) textLength = 0;
    var visualCount = 0;
    try {
      var visuals = document.body.querySelectorAll("img,video,audio,canvas,svg,iframe,object,embed,table,input,textarea,select,button");
      for (var index = 0; index < visuals.length && visualCount < 10000; index += 1) {
        var visual = visuals[index];
        if (isMeaningfulVisual(visual)) visualCount += 1;
      }
    } catch (_) {}
    return { textLength: textLength, visualCount: visualCount };
  }

  function publishContentHealth(status, counts) {
    contentHealth = {
      status: status,
      href: location.href,
      textLength: Math.max(0, Math.min(100000, Math.round(counts.textLength || 0))),
      visualCount: Math.max(0, Math.min(10000, Math.round(counts.visualCount || 0)))
    };
    send("preview-health", contentHealth);
    if (status === "empty" && window.top === window) {
      setStandaloneStatus("Course content did not appear. Return to Studio for recovery options.");
    }
  }

  function beginContentHealthCheck() {
    if (hostMode || captureMode) return;
    clearContentHealthCheck();
    contentHealth = null;
    var check = function(finalCheck) {
      var counts = inspectCourseContent();
      if (counts.textLength > 0 || counts.visualCount > 0) {
        if (!contentHealth || contentHealth.status !== "ready") publishContentHealth("ready", counts);
        disconnectContentHealthObserver();
        if (finalCheck) clearContentHealthCheck();
        return;
      }
      if (finalCheck) {
        publishContentHealth("empty", counts);
        contentHealthTimer = window.setTimeout(clearContentHealthCheck, 15000);
      }
    };
    if (typeof MutationObserver === "function" && document.body) {
      contentHealthObserver = new MutationObserver(function() {
        keyboardCandidateCacheDirty = true;
        if (contentHealthMutationTimer) return;
        contentHealthMutationTimer = window.setTimeout(function() {
          contentHealthMutationTimer = 0;
          check(false);
        }, 40);
      });
      try { contentHealthObserver.observe(document.body, { childList: true, subtree: true, characterData: true }); } catch (_) {}
    }
    check(false);
    contentHealthTimer = window.setTimeout(function() { check(true); }, 8000);
  }

  function markReady() {
    document.documentElement.setAttribute("data-canvas-helper-bridge-ready", "true");
    readEditPageMap();
    ensureStandalonePreviewControls();
    updateEditMapVisuals();
    beginContentHealthCheck();
    if (hostMode) {
      hostedCourseFrame = document.querySelector("[data-canvas-helper-standalone-course]");
      if (hostedCourseFrame) {
        hostedCourseFrame.addEventListener("load", function() {
          clearHostedCourseConnectRetry();
          resetHostedCourseConnection();
          hostedCourseReadyHref = "";
          hostedCourseInteractionReady = false;
          updateHostedCourseGuard();
          hostedCourseConnectAttempts = 0;
          scheduleHostedCourseConnectRetry();
        });
      }
      scheduleHostedCourseConnectRetry();
      scheduleHostedCourseHealthTimeout();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", markReady, { once: true }); else markReady();
})();`;
}
