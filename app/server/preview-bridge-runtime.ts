import {
  PREVIEW_BRIDGE_MAX_CONTAINERS,
  PREVIEW_BRIDGE_MAX_VISIBLE_TEXT,
  PREVIEW_BRIDGE_PROTOCOL,
  PREVIEW_BRIDGE_VERSION,
  PREVIEW_STANDALONE_BOOTSTRAP_TYPE,
  PREVIEW_STANDALONE_SESSION_PARAM,
  PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH
} from "../shared/preview-bridge.js";
import { PREVIEW_INSPECT_NODE_ATTRIBUTE } from "./lib/preview-inspection.js";

/**
 * This runs inside an untrusted course preview. Keep it intentionally small:
 * it reports opaque browser evidence and never knows repository source paths.
 */
export function buildPreviewBridgeRuntime(studioOrigin: string) {
  const serializedStudioOrigin = JSON.stringify(studioOrigin);

  return String.raw`(function canvasHelperPreviewBridge() {
  "use strict";
  var PROTOCOL = "${PREVIEW_BRIDGE_PROTOCOL}";
  var VERSION = ${PREVIEW_BRIDGE_VERSION};
  var NODE_ATTRIBUTE = "${PREVIEW_INSPECT_NODE_ATTRIBUTE}";
  var MAX_TEXT = ${PREVIEW_BRIDGE_MAX_VISIBLE_TEXT};
  var MAX_CONTAINERS = ${PREVIEW_BRIDGE_MAX_CONTAINERS};
  var STANDALONE_BOOTSTRAP_TYPE = "${PREVIEW_STANDALONE_BOOTSTRAP_TYPE}";
  var STANDALONE_SESSION_PARAM = "${PREVIEW_STANDALONE_SESSION_PARAM}";
  var MAX_SESSION_TOKEN = ${PREVIEW_STANDALONE_SESSION_TOKEN_MAX_LENGTH};
  var STUDIO_ORIGIN = ${serializedStudioOrigin};

  var port = null;
  var studioConnected = false;
  var inspectEnabled = false;
  var hoverHandle = 0;
  var scrollHandle = 0;
  var lastSelectors = [];
  var overlay = null;
  var shield = null;
  var previewControls = null;
  var inspectControl = null;
  var previewStatus = null;
  var standaloneSessionToken = "";
  var standaloneUrl = null;
  try {
    standaloneUrl = new URL(location.href);
    standaloneSessionToken = standaloneUrl.searchParams.get(STANDALONE_SESSION_PARAM) || "";
  } catch (_) {}
  if (standaloneSessionToken.length < 16 || standaloneSessionToken.length > MAX_SESSION_TOKEN || !/^[A-Za-z0-9-]+$/.test(standaloneSessionToken)) standaloneSessionToken = "";
  if (standaloneSessionToken && standaloneUrl) {
    standaloneUrl.searchParams.delete(STANDALONE_SESSION_PARAM);
    try { history.replaceState(history.state, "", standaloneUrl.pathname + standaloneUrl.search + standaloneUrl.hash); } catch (_) {}
  }

  function message(type, payload) {
    return { protocol: PROTOCOL, version: VERSION, type: type, payload: payload };
  }

  function send(type, payload) {
    if (!port) return;
    try { port.postMessage(message(type, payload)); } catch (_) {}
  }

  function boundedString(value, maximum) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    return text.length > maximum ? text.slice(0, maximum) : text;
  }

  function isFiniteCoordinate(value) {
    return typeof value === "number" && isFinite(value) && Math.abs(value) <= 10000000;
  }

  function isScrollState(value) {
    if (!value || typeof value !== "object" || !isFiniteCoordinate(value.windowTop) || !isFiniteCoordinate(value.windowLeft) || !Array.isArray(value.containers) || value.containers.length > MAX_CONTAINERS) return false;
    return value.containers.every(function(container) {
      return container && typeof container.selector === "string" && container.selector.length <= 260 && isFiniteCoordinate(container.top) && isFiniteCoordinate(container.left);
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
    selectors.forEach(function(selector) {
      var element;
      try { element = document.querySelector(selector); } catch (_) { element = null; }
      if (element && isScrollable(element)) containers.push({ selector: selector, top: element.scrollTop, left: element.scrollLeft });
    });
    if (!containers.length) {
      var seen = {};
      var candidates = Array.prototype.slice.call(document.querySelectorAll("body *"), 0, 12000)
        .filter(isScrollable)
        .map(function(element) { return { element: element, selector: getElementSelector(element), score: Math.max(element.scrollHeight - element.clientHeight, element.scrollWidth - element.clientWidth) }; })
        .sort(function(left, right) { return right.score - left.score; })
        .filter(function(candidate) { if (!candidate.selector || seen[candidate.selector]) return false; seen[candidate.selector] = true; return true; })
        .slice(0, MAX_CONTAINERS);
      selectors = candidates.map(function(candidate) { return candidate.selector; });
      containers = candidates.map(function(candidate) { return { selector: candidate.selector, top: candidate.element.scrollTop, left: candidate.element.scrollLeft }; });
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
    overlay.style.border = "2px solid #2563eb";
    overlay.style.background = "rgba(37, 99, 235, 0.10)";
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

  function setStandaloneStatus(value) {
    if (previewStatus) previewStatus.textContent = boundedString(value, 120);
  }

  function updateStandaloneControls() {
    if (!inspectControl) return;
    inspectControl.textContent = inspectEnabled ? "Inspecting" : "Inspect";
    inspectControl.setAttribute("aria-pressed", inspectEnabled ? "true" : "false");
    inspectControl.style.background = inspectEnabled ? "#18212f" : "#ffffff";
    inspectControl.style.color = inspectEnabled ? "#ffffff" : "#18212f";
    if (inspectEnabled) {
      setStandaloneStatus(studioConnected ? "Click a course element. The selection will appear in Studio." : port ? "Connecting to Studio..." : "Click a course element. Open this preview from Studio to send it back.");
    } else {
      setStandaloneStatus(studioConnected ? "Connected to Studio." : port ? "Connecting to Studio..." : "Open this preview from Studio to send selections back.");
    }
  }

  function ensureStandalonePreviewControls() {
    if (window.top !== window || previewControls) return;
    var controls = document.createElement("div");
    controls.setAttribute("data-canvas-helper-preview-controls", "true");
    controls.setAttribute("role", "toolbar");
    controls.setAttribute("aria-label", "Canvas Helper preview tools");
    controls.style.position = "fixed";
    controls.style.top = "12px";
    controls.style.right = "12px";
    controls.style.zIndex = "2147483647";
    controls.style.width = "min(280px, calc(100vw - 24px))";
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

    var inspectButton = document.createElement("button");
    inspectButton.type = "button";
    inspectButton.setAttribute("data-canvas-helper-preview-inspect", "true");
    stylePreviewControlButton(inspectButton);
    inspectButton.addEventListener("click", function() {
      setInspectMode(!inspectEnabled, true);
    });

    var returnButton = document.createElement("button");
    returnButton.type = "button";
    returnButton.textContent = "Return to Studio";
    returnButton.setAttribute("aria-label", "Return to Canvas Helper Studio");
    returnButton.setAttribute("data-canvas-helper-return-to-studio", "true");
    stylePreviewControlButton(returnButton);
    returnButton.addEventListener("click", function() {
      try { window.location.replace(STUDIO_ORIGIN); } catch (_) { window.location.href = STUDIO_ORIGIN; }
    });

    var status = document.createElement("div");
    status.setAttribute("data-canvas-helper-preview-inspect-status", "true");
    status.setAttribute("role", "status");
    status.style.marginTop = "7px";
    status.style.fontSize = "12px";
    status.style.lineHeight = "1.35";
    status.style.color = "#475569";

    actions.appendChild(inspectButton);
    actions.appendChild(returnButton);
    controls.appendChild(actions);
    controls.appendChild(status);
    (document.body || document.documentElement).appendChild(controls);
    previewControls = controls;
    inspectControl = inspectButton;
    previewStatus = status;
    updateStandaloneControls();
  }

  function focusSourceNode(nodeId) {
    var element = elementForSourceNodeId(nodeId);
    if (!element) return;
    try {
      element.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
    } catch (_) {
      element.scrollIntoView();
    }
    window.requestAnimationFrame(function() {
      var rect = element.getBoundingClientRect();
      setOverlay({ left: rect.left, top: rect.top, width: rect.width, height: rect.height });
      document.documentElement.setAttribute("data-canvas-helper-inspection-focus", "true");
    });
  }

  function diagnosticMessage(value, fallback) {
    var text = boundedString(value || fallback, 240);
    text = text.replace(/(?:https?|file):\/\/\S+/gi, "[link]");
    text = text.replace(/(?:[A-Za-z]:)?(?:\\|\/)(?:[^\s]+)/g, "[path]");
    return boundedString(text || fallback, 240);
  }

  function sendDiagnostic(kind, value, fallback) {
    send("preview-diagnostic", { kind: kind, message: diagnosticMessage(value, fallback) });
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

  function uniqueSourceNodeId(element) {
    var nodeId = element.getAttribute(NODE_ATTRIBUTE) || "";
    if (!nodeId) return null;
    var matches = document.querySelectorAll("[" + NODE_ATTRIBUTE + "]");
    var count = 0;
    for (var index = 0; index < matches.length; index += 1) {
      if (matches[index].getAttribute(NODE_ATTRIBUTE) === nodeId) count += 1;
    }
    return count === 1 ? nodeId : null;
  }

  function elementForSourceNodeId(nodeId) {
    if (typeof nodeId !== "string" || !nodeId) return null;
    var matches = document.querySelectorAll("[" + NODE_ATTRIBUTE + "]");
    var found = null;
    for (var index = 0; index < matches.length; index += 1) {
      if (matches[index].getAttribute(NODE_ATTRIBUTE) !== nodeId) continue;
      if (found) return null;
      found = matches[index];
    }
    return found;
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

  function selectionFor(target) {
    var element = target instanceof Element ? target : null;
    if (!element) return null;
    var rect = element.getBoundingClientRect();
    var isFormControl = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement;
    return {
      nodeId: uniqueSourceNodeId(element),
      visibleText: isFormControl ? "" : boundedString(element.textContent || "", MAX_TEXT),
      tagName: boundedString(element.tagName ? element.tagName.toLowerCase() : "", 48),
      role: boundedString(element.getAttribute("role") || "", 80),
      testId: boundedString(element.getAttribute("data-testid") || "", 120),
      geometry: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(Math.max(0, rect.width)), height: Math.round(Math.max(0, rect.height)) }
    };
  }

  function onPointerMove(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    var target = targetForPointerEvent(event);
    if (isPreviewControlTarget(target)) return;
    var selection = selectionFor(target);
    if (!selection) return;
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    if (hoverHandle) return;
    hoverHandle = window.requestAnimationFrame(function() { hoverHandle = 0; send("preview-inspect-hover", selection); });
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
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    send("preview-inspect-selected", selection);
    setStandaloneStatus(studioConnected ? "Selection sent to Studio." : "Selection highlighted. Open this preview from Studio to send it back.");
  }

  function onInspectKeydown(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    if (isPreviewControlTarget(event.target)) return;
    if (event.key === "Tab") return;
    blockAction(event);
    if (event.key === "Escape") {
      hideOverlay();
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") return;
    var selection = selectionFor(document.activeElement);
    if (!selection) return;
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    send("preview-inspect-selected", selection);
    setStandaloneStatus(studioConnected ? "Selection sent to Studio." : "Selection highlighted. Open this preview from Studio to send it back.");
  }

  function onInspectWheel(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    if (isPreviewControlTarget(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.scrollBy({ left: event.deltaX, top: event.deltaY, behavior: "auto" });
  }

  function setInspectMode(enabled, notifyStudio) {
    inspectEnabled = Boolean(enabled);
    document.documentElement.setAttribute("data-canvas-helper-inspect-active", inspectEnabled ? "true" : "false");
    var element = ensureShield();
    element.style.display = inspectEnabled ? "block" : "none";
    element.style.pointerEvents = inspectEnabled ? "auto" : "none";
    if (!inspectEnabled) {
      hideOverlay();
    }
    updateStandaloneControls();
    if (notifyStudio) send("preview-inspect-mode", { enabled: inspectEnabled });
  }

  function isCommand(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && typeof data.type === "string";
  }

  function isBootstrap(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && data.type === "studio-connect" && data.payload === null;
  }

  function handlePortMessage(event) {
    if (!isCommand(event.data)) return;
    studioConnected = true;
    updateStandaloneControls();
    if (event.data.type === "studio-request-state" && event.data.payload === null) sendScrollState();
    if (event.data.type === "studio-restore-scroll") restoreScrollState(event.data.payload);
    if (event.data.type === "studio-set-inspect-mode" && event.data.payload && typeof event.data.payload.enabled === "boolean") setInspectMode(event.data.payload.enabled, false);
    if (event.data.type === "studio-request-inspect-current" && event.data.payload && typeof event.data.payload.nodeId === "string") {
      var element = elementForSourceNodeId(event.data.payload.nodeId);
      var selection = element ? selectionFor(element) : null;
      if (!selection || selection.nodeId !== event.data.payload.nodeId) {
        send("preview-error", { message: "The selected preview element is no longer available. Select it again before capturing a screenshot." });
        return;
      }
      send("preview-inspect-current", selection);
    }
    if (event.data.type === "studio-focus-inspect-node" && event.data.payload && typeof event.data.payload.nodeId === "string") {
      focusSourceNode(event.data.payload.nodeId);
    }
  }

  function attachPort(nextPort) {
    if (!nextPort || typeof nextPort.postMessage !== "function") return;
    if (port) { try { port.close(); } catch (_) {} }
    port = nextPort;
    studioConnected = false;
    port.onmessage = handlePortMessage;
    port.onmessageerror = function() { studioConnected = false; updateStandaloneControls(); };
    if (typeof port.start === "function") port.start();
    send("preview-ready", { href: location.href });
    sendScrollState();
    updateStandaloneControls();
  }

  function connectStandalonePreview() {
    if (window.top !== window) return;
    var studioWindow = window.opener;
    if (!standaloneSessionToken || !studioWindow || typeof MessageChannel !== "function") {
      try { window.opener = null; } catch (_) {}
      return;
    }

    var channel = new MessageChannel();
    try {
      studioWindow.postMessage(
        message(STANDALONE_BOOTSTRAP_TYPE, { sessionToken: standaloneSessionToken }),
        STUDIO_ORIGIN,
        [channel.port2]
      );
      attachPort(channel.port1);
    } catch (_) {
      try { channel.port1.close(); } catch (_) {}
      try { channel.port2.close(); } catch (_) {}
    } finally {
      standaloneSessionToken = "";
      try { window.opener = null; } catch (_) {}
    }
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
  window.addEventListener("hashchange", function() { send("preview-navigation", { href: location.href }); scheduleScrollState(); });
  window.addEventListener("popstate", function() { send("preview-navigation", { href: location.href }); scheduleScrollState(); });
  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("pointerdown", onInspectPointerDown, true);
  ["pointerup", "pointercancel", "click", "dblclick", "auxclick", "contextmenu", "dragstart", "drag", "dragend", "drop", "submit", "beforeinput", "input", "change", "touchstart", "touchend"].forEach(function(type) {
    document.addEventListener(type, blockAction, true);
  });
  document.addEventListener("keydown", onInspectKeydown, true);
  document.addEventListener("keyup", blockAction, true);
  document.addEventListener("keypress", blockAction, true);
  document.addEventListener("wheel", onInspectWheel, { capture: true, passive: false });
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

  function markReady() {
    document.documentElement.setAttribute("data-canvas-helper-bridge-ready", "true");
    ensureStandalonePreviewControls();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", markReady, { once: true }); else markReady();
})();`;
}
