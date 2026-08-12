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
import { PREVIEW_INSPECT_NODE_ATTRIBUTE } from "./lib/preview-inspection.js";

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
  var MAX_SESSION_TOKEN = ${PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH};
  var STUDIO_ORIGIN = ${serializedStudioOrigin};
  var PREVIEW_ORIGIN = ${serializedPreviewOrigin};

  var port = null;
  var studioConnected = false;
  var inspectEnabled = false;
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
  var reviewLightbox = null;
  var reviewPanelOpen = false;
  var reviewPacket = "";
  var reviewLocalMessage = "";
  var reviewCapturePending = false;
  var reviewSavePending = false;
  var reviewActionSequence = 0;
  var latestReviewActionId = "";
  var reviewState = { sessionId: "", items: [], draftScreenshotCount: 0, captureItemId: "", saving: false, preparing: false, packetReady: false, status: "", error: "", undoLabel: "" };
  var standaloneSessionToken = "";
  var standaloneRejoinToken = "";
  var standaloneUrl = null;
  var captureMode = false;
  var hostMode = false;
  var trustedStudioWindow = null;
  var hostedCourseFrame = null;
  var hostedCoursePort = null;
  var hostedCourseReadyHref = "";
  var pendingHostedKeyboardEntry = false;
  var hostedCourseHealth = null;
  var hostedCourseHealthTimer = 0;
  var hostedCourseRecoveryMessage = "";
  var hostedFocusRequest = null;
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

  function boundedString(value, maximum) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > maximum ? text.slice(0, maximum) : text;
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
    if (
      !isReviewScreenshotPath(filePath) ||
      !(new RegExp("^[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}$")).test(reviewState.sessionId) ||
      !item ||
      typeof item.projectSlug !== "string" ||
      typeof item.id !== "string" ||
      typeof item.nodeId !== "string"
    ) return "";
    var params = new URLSearchParams({
      path: filePath,
      sessionId: reviewState.sessionId,
      projectSlug: item.projectSlug,
      itemId: item.id,
      ownerNodeId: item.nodeId
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

  function setOverlay(rect) {
    var element = ensureOverlay();
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

  function updateStandaloneControls() {
    if (!inspectControl) return;
    inspectControl.textContent = inspectEnabled ? "Annotating" : "Annotate";
    inspectControl.setAttribute("aria-pressed", inspectEnabled ? "true" : "false");
    inspectControl.style.background = inspectEnabled ? "#ffffff" : "#ffffff";
    inspectControl.style.color = inspectEnabled ? "#1473e6" : "#18212f";
    if (previewControls) {
      previewControls.style.background = inspectEnabled ? "#1473e6" : "#ffffff";
      previewControls.style.borderColor = inspectEnabled ? "#0f63cc" : "#64748b";
      previewControls.style.color = inspectEnabled ? "#ffffff" : "#18212f";
    }
    if (previewStatus) previewStatus.style.color = inspectEnabled ? "#ffffff" : "#475569";
    if (inspectEnabled) {
      setStandaloneStatus(
        studioConnected
          ? reviewSelection
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
    renderReviewPanel();
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
      latestReviewActionId = "review-" + (++reviewActionSequence);
      action = Object.assign({}, action, { requestId: latestReviewActionId });
    }
    send("preview-review-action", action);
    return true;
  }

  function setReviewPanelOpen(open) {
    reviewPanelOpen = Boolean(open);
    renderReviewPanel();
  }

  function updateReviewComposerState() {
    if (reviewSelectionText) reviewSelectionText.textContent = reviewSelectionExcerpt(reviewSelection);
    if (reviewDraft) reviewDraft.disabled = !reviewSelection;
    if (reviewCapture) {
      reviewCapture.disabled = !studioConnected || (!reviewCapturePending && (!reviewSelection || !reviewSelection.nodeId || reviewState.draftScreenshotCount >= MAX_REVIEW_SCREENSHOTS));
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
      reviewSave.disabled = !studioConnected || reviewSavePending || reviewState.saving || !reviewSelection || !reviewSelection.nodeId || !note || reviewState.items.length >= MAX_REVIEW_ITEMS;
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

        var remove = document.createElement("button");
        remove.type = "button";
        remove.textContent = "Remove";
        stylePreviewControlButton(remove);
        remove.style.padding = "5px 7px";
        remove.style.fontSize = "11px";
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
        show.addEventListener("click", function() {
          reviewLocalMessage = "Showing annotation…";
          renderReviewPanel();
          sendReviewAction({ action: "focus-item", itemId: item.id });
        });

        var rowActions = document.createElement("div");
        rowActions.style.display = "flex";
        rowActions.style.gap = "5px";
        rowActions.appendChild(show);
        rowActions.appendChild(remove);

        var noteArea = document.createElement("textarea");
        noteArea.value = item.teacherNote;
        noteArea.rows = 2;
        noteArea.maxLength = MAX_REVIEW_NOTE;
        noteArea.setAttribute("aria-label", "Change note for annotation " + (index + 1));
        stylePreviewTextArea(noteArea);
        noteArea.style.marginTop = "7px";
        noteArea.addEventListener("change", function() {
          reviewLocalMessage = "Updating note…";
          sendReviewAction({ action: "update-note", itemId: item.id, teacherNote: noteArea.value });
        });

        rowHeading.appendChild(excerpt);
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
            removeScreenshot.style.cursor = "pointer";
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
        addScreenshot.disabled = !studioConnected || (reviewState.captureItemId !== item.id && (reviewCapturePending || Boolean(reviewState.captureItemId) || item.screenshots.length >= MAX_REVIEW_SCREENSHOTS));
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
      reviewCopy.disabled = !studioConnected || reviewState.preparing || !reviewState.packetReady || !reviewPacket;
      reviewCopy.textContent = reviewState.preparing ? "Getting Review Set ready…" : "Copy Review Set for Codex";
      reviewCopy.style.opacity = reviewCopy.disabled ? "0.48" : "1";
      reviewCopy.style.cursor = reviewCopy.disabled ? "default" : "pointer";
    }
    if (reviewClear) {
      reviewClear.disabled = !studioConnected || !reviewState.items.length;
      reviewClear.style.opacity = reviewClear.disabled ? "0.48" : "1";
      reviewClear.style.cursor = reviewClear.disabled ? "default" : "pointer";
    }
    if (reviewUndo) {
      reviewUndo.style.display = reviewState.undoLabel ? "inline-flex" : "none";
      reviewUndo.textContent = reviewState.undoLabel || "Undo";
      reviewUndo.disabled = !studioConnected || !reviewState.undoLabel;
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
      setInspectMode(!inspectEnabled, true, event.detail === 0);
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
      if (!reviewPacket || !navigator.clipboard || typeof navigator.clipboard.writeText !== "function") {
        reviewLocalMessage = "Clipboard access is not available. Copy the packet shown below.";
        if (reviewPacketFallback) {
          reviewPacketFallback.value = reviewPacket;
          reviewPacketFallback.style.display = "block";
          reviewPacketFallback.focus();
          reviewPacketFallback.select();
        }
        renderReviewPanel();
        return;
      }
      navigator.clipboard.writeText(reviewPacket).then(function() {
        reviewLocalMessage = "Copied. Paste the Review Set into Codex.";
        if (reviewPacketFallback) reviewPacketFallback.style.display = "none";
        renderReviewPanel();
      }).catch(function() {
        reviewLocalMessage = "Clipboard access was blocked. Copy the packet shown below.";
        if (reviewPacketFallback) {
          reviewPacketFallback.value = reviewPacket;
          reviewPacketFallback.style.display = "block";
          reviewPacketFallback.focus();
          reviewPacketFallback.select();
        }
        renderReviewPanel();
      });
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
    panel.appendChild(panelMessage);

    actions.appendChild(inspectButton);
    actions.appendChild(reviewButton);
    actions.appendChild(retryButton);
    actions.appendChild(returnButton);
    controls.appendChild(actions);
    controls.appendChild(status);
    controls.appendChild(panel);
    (document.body || document.documentElement).appendChild(controls);
    previewControls = controls;
    inspectControl = inspectButton;
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
    reviewMessage = panelMessage;
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
    return Boolean(element && element.closest("[data-canvas-helper-preview-controls]"));
  }

  function selectionFor(target, includeScroll, interactionStartedAt) {
    var element = target instanceof Element ? target : null;
    if (!element) return null;
    var rect = element.getBoundingClientRect();
    var isFormControl = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
    return {
      nodeId: uniqueSourceNodeId(element),
      selectionKind: "element",
      visibleText: isFormControl ? "" : boundedString(element.textContent || "", MAX_TEXT),
      tagName: boundedString(element.tagName ? element.tagName.toLowerCase() : "", MAX_ELEMENT_TAG),
      role: boundedString(element.getAttribute("role") || "", MAX_ELEMENT_ROLE),
      testId: boundedString(element.getAttribute("data-testid") || "", MAX_ELEMENT_TEST_ID),
      geometry: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(Math.max(0, rect.width)), height: Math.round(Math.max(0, rect.height)) },
      viewport: { width: Math.max(240, Math.round(window.innerWidth)), height: Math.max(240, Math.round(window.innerHeight)) },
      scroll: includeScroll === false ? { windowTop: window.scrollY, windowLeft: window.scrollX, containers: [] } : captureScrollState(),
      pageHref: boundedString(location.href, MAX_COURSE_URL),
      interactionStartedAt: typeof interactionStartedAt === "number" ? interactionStartedAt : undefined
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

  function selectInspection(selection) {
    if (!selection) return;
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    send("preview-inspect-selected", selection);
    if (window.top === window) {
      reviewSelection = selection;
      reviewLocalMessage = selection.nodeId ? "Add a note or screenshot, then save this annotation." : "Choose a more specific course element.";
      setReviewPanelOpen(true);
    }
    setStandaloneStatus(studioConnected ? "Selection ready." : "Selection highlighted. Open this preview from Studio to save it.");
  }

  function keyboardCandidates() {
    if (!keyboardCandidateCache || keyboardCandidateCacheDirty) {
      keyboardCandidateCache = Array.prototype.slice.call(document.querySelectorAll("[" + NODE_ATTRIBUTE + "]"), 0, 12000).filter(function(element) {
        return Boolean(
          element &&
          element !== document.documentElement &&
          element !== document.body &&
          !isPreviewControlTarget(element) &&
          isVisibleCourseElement(element)
        );
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
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
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
    if (dragStart) {
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
      var selection = selectionFor(target, false);
      if (!selection) return;
      setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
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
    var selection = selectionFor(target);
    blockAction(event);
    if (!selection) return;
    dragStart = { x: event.clientX, y: event.clientY, selection: selection, target: target };
    dragging = false;
  }

  function onInspectPointerUp(event) {
    if (!inspectEnabled || !event.isTrusted || !dragStart) return;
    blockAction(event);
    var interactionStartedAt = Date.now();
    var selection = Object.assign({}, dragStart.selection, { interactionStartedAt: interactionStartedAt });
    if (dragging) {
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
    dragStart = null;
    dragging = false;
    selectInspection(selection);
  }

  function onInspectPointerCancel() {
    dragStart = null;
    dragging = false;
  }

  function onInspectKeydown(event) {
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
    var selection = selectionFor(active, true, Date.now());
    if (!selection) return;
    selectInspection(selection);
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
      if (inspectModeChanged) updateStandaloneControls(); else renderReviewPanel();
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
    if (inspectModeChanged) updateStandaloneControls(); else renderReviewPanel();
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
    if (inspectEnabled) startKeyboardMutationObserver();
    reviewSelection = null;
    reviewLocalMessage = "The course page changed. Select an element again.";
    dragStart = null;
    dragging = false;
    hideOverlay();
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
    if (typeof value.sessionId !== "string" || !(new RegExp("^[A-Za-z0-9-]{" + MIN_REVIEW_SESSION_ID + "," + MAX_REVIEW_SESSION_ID + "}$")).test(value.sessionId) || typeof value.draftScreenshotCount !== "number" || value.draftScreenshotCount < 0 || value.draftScreenshotCount > MAX_REVIEW_SCREENSHOTS || value.draftScreenshotCount % 1 !== 0 || typeof value.captureItemId !== "string" || value.captureItemId.length > MAX_REVIEW_ITEM_ID || typeof value.saving !== "boolean" || typeof value.preparing !== "boolean" || typeof value.packetReady !== "boolean" || typeof value.status !== "string" || value.status.length > MAX_REVIEW_STATUS || typeof value.error !== "string" || value.error.length > MAX_REVIEW_STATUS || (value.undoLabel !== undefined && (typeof value.undoLabel !== "string" || value.undoLabel.length > MAX_SESSION_NAME))) return false;
    return value.items.every(function(item) {
      return item && typeof item === "object" && typeof item.id === "string" && item.id.length > 0 && item.id.length <= MAX_REVIEW_ITEM_ID && typeof item.projectSlug === "string" && item.projectSlug.length > 0 && item.projectSlug.length <= MAX_REVIEW_ITEM_ID && typeof item.nodeId === "string" && item.nodeId.length > 0 && item.nodeId.length <= MAX_REVIEW_ITEM_ID && typeof item.excerpt === "string" && item.excerpt.length <= MAX_REVIEW_EXCERPT && typeof item.teacherNote === "string" && item.teacherNote.length <= MAX_REVIEW_NOTE && Array.isArray(item.screenshots) && item.screenshots.length <= MAX_REVIEW_SCREENSHOTS && item.screenshots.every(function(screenshot) {
        return screenshot && typeof screenshot === "object" && typeof screenshot.id === "string" && screenshot.id.length > 0 && screenshot.id.length <= MAX_REVIEW_ITEM_ID && isReviewScreenshotPath(screenshot.filePath);
      });
    });
  }

  function isReviewActionResult(value) {
    return value && typeof value === "object" && typeof value.ok === "boolean" && typeof value.message === "string" && value.message.length <= MAX_REVIEW_STATUS && typeof value.clearDraft === "boolean" && (value.requestId === undefined || (typeof value.requestId === "string" && value.requestId.length > 0 && value.requestId.length <= MAX_REQUEST_ID));
  }

  function hostedTargetUrl(value) {
    if (!hostMode) return null;
    var currentHref = hostedCourseReadyHref || (hostedCourseFrame && hostedCourseFrame.src) || "";
    var rebased = currentHref ? rebaseCourseUrl(value, currentHref, PREVIEW_ORIGIN) : null;
    if (rebased) return rebased;
    var parsed = boundedCourseUrl(value);
    return parsed && parsed.url.origin === PREVIEW_ORIGIN ? parsed.url : null;
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

  function handleHostedCourseMessage(event) {
    if (!isCommand(event.data)) return;
    var data = event.data;
    if (data.type === "preview-ready" && data.payload && typeof data.payload.href === "string") {
      hostedCourseReadyHref = data.payload.href;
      send("preview-ready", data.payload);
      var shouldStartFromKeyboard = inspectEnabled && pendingHostedKeyboardEntry;
      if (sendHostedCourse("studio-set-inspect-mode", { enabled: inspectEnabled, keyboardEntry: shouldStartFromKeyboard }) && shouldStartFromKeyboard) {
        pendingHostedKeyboardEntry = false;
      }
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
      hostedCourseHealth = null;
      setHostedCourseRecovery("");
      scheduleHostedCourseHealthTimeout();
      reviewSelection = null;
      reviewLocalMessage = "The course page changed. Select an element again.";
      renderReviewPanel();
      flushHostedFocusRequest();
    }
    if (data.type === "preview-inspect-selected") {
      reviewSelection = data.payload;
      reviewLocalMessage = data.payload && data.payload.nodeId ? "Add a note or screenshot, then save this annotation." : "Choose a more specific course element.";
      setReviewPanelOpen(true);
      setStandaloneStatus("Selection ready.");
    }
    if (data.type === "preview-inspect-mode" && data.payload && typeof data.payload.enabled === "boolean") {
      inspectEnabled = Boolean(data.payload.enabled);
      document.documentElement.setAttribute("data-canvas-helper-inspect-active", inspectEnabled ? "true" : "false");
      if (!inspectEnabled) pendingHostedKeyboardEntry = false;
      updateStandaloneControls();
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
      data.type === "preview-health" ||
      data.type === "preview-diagnostic" ||
      data.type === "preview-error"
    ) send(data.type, data.payload);
  }

  function connectHostedCourse() {
    if (!hostMode || typeof MessageChannel !== "function") return;
    hostedCourseFrame = document.querySelector("[data-canvas-helper-standalone-course]");
    if (!hostedCourseFrame || !hostedCourseFrame.contentWindow) return;
    hostedCourseHealth = null;
    setHostedCourseRecovery("");
    scheduleHostedCourseHealthTimeout();
    if (hostedCoursePort) { try { hostedCoursePort.close(); } catch (_) {} }
    var channel = new MessageChannel();
    hostedCoursePort = channel.port1;
    channel.port1.onmessage = handleHostedCourseMessage;
    if (typeof channel.port1.start === "function") channel.port1.start();
    try {
      hostedCourseFrame.contentWindow.postMessage(message("studio-connect", null), PREVIEW_ORIGIN, [channel.port2]);
    } catch (_) {
      try { channel.port1.close(); } catch (_) {}
      try { channel.port2.close(); } catch (_) {}
      hostedCoursePort = null;
    }
  }

  function handlePortMessage(event) {
    if (!isCommand(event.data)) return;
    studioConnected = true;
    reconnectAttempts = 0;
    if (reconnectTimer) { window.clearTimeout(reconnectTimer); reconnectTimer = 0; }
    updateStandaloneControls();
    if (event.data.type === "studio-request-state" && event.data.payload === null) {
      if (hostMode) sendHostedCourse("studio-request-state", null); else sendScrollState();
    }
    if (event.data.type === "studio-restore-scroll") {
      if (hostMode) sendHostedCourse("studio-restore-scroll", event.data.payload); else restoreScrollState(event.data.payload);
    }
    if (event.data.type === "studio-set-inspect-mode" && event.data.payload && typeof event.data.payload.enabled === "boolean") {
      setInspectMode(event.data.payload.enabled, false, event.data.payload.keyboardEntry === true);
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
    if (event.data.type === "studio-disconnect-standalone" && hostMode) {
      studioConnected = false;
      if (port) { try { port.close(); } catch (_) {} }
      port = null;
      updateStandaloneControls();
      scheduleStandaloneReconnect();
      return;
    }
    if (event.data.type === "studio-set-review-state" && isReviewState(event.data.payload)) {
      reviewState = event.data.payload;
      if (!reviewState.captureItemId && reviewState.draftScreenshotCount >= 0 && reviewCapturePending && reviewLocalMessage !== "Capturing the course preview…") {
        reviewCapturePending = false;
      }
      renderReviewPanel();
    }
    if (event.data.type === "studio-set-review-packet" && event.data.payload && typeof event.data.payload.packet === "string" && event.data.payload.packet.length <= MAX_REVIEW_PACKET) {
      reviewPacket = event.data.payload.packet;
      if (reviewPacketFallback && reviewPacketFallback.style.display !== "none") reviewPacketFallback.value = reviewPacket;
      renderReviewPanel();
    }
    if (event.data.type === "studio-review-action-result" && isReviewActionResult(event.data.payload)) {
      if (event.data.payload.requestId && latestReviewActionId && event.data.payload.requestId !== latestReviewActionId) return;
      reviewCapturePending = false;
      reviewSavePending = false;
      reviewLocalMessage = event.data.payload.message;
      if (event.data.payload.clearDraft) {
        reviewSelection = null;
        if (reviewDraft) reviewDraft.value = "";
      }
      renderReviewPanel();
      if (event.data.payload.ok && reviewPanel && (event.data.payload.clearDraft || /removed/i.test(event.data.payload.message))) {
        window.requestAnimationFrame(function() { reviewPanel.focus(); });
      }
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
    if (window.top === window) send("preview-review-action", { action: "request-state" });
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
    if (!standaloneSessionToken || !studioWindow || typeof MessageChannel !== "function" || (hostMode && !standaloneRejoinToken)) {
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
    if (!element || element.closest("[data-canvas-helper-preview-controls], [hidden], [aria-hidden='true']")) return false;
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
    ensureStandalonePreviewControls();
    beginContentHealthCheck();
    if (hostMode) {
      hostedCourseFrame = document.querySelector("[data-canvas-helper-standalone-course]");
      if (hostedCourseFrame) hostedCourseFrame.addEventListener("load", connectHostedCourse);
      connectHostedCourse();
      scheduleHostedCourseHealthTimeout();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", markReady, { once: true }); else markReady();
})();`;
}
