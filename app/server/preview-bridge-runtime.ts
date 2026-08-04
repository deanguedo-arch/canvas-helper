import {
  PREVIEW_BRIDGE_MAX_CONTAINERS,
  PREVIEW_BRIDGE_MAX_VISIBLE_TEXT,
  PREVIEW_BRIDGE_PROTOCOL,
  PREVIEW_BRIDGE_VERSION
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
  var STUDIO_ORIGIN = ${serializedStudioOrigin};

  var port = null;
  var inspectEnabled = false;
  var hoverHandle = 0;
  var scrollHandle = 0;
  var lastSelectors = [];
  var overlay = null;
  var shield = null;

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
    overlay.style.zIndex = "2147483647";
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
    var selection = selectionFor(targetForPointerEvent(event));
    if (!selection) return;
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    if (hoverHandle) return;
    hoverHandle = window.requestAnimationFrame(function() { hoverHandle = 0; send("preview-inspect-hover", selection); });
  }

  function blockAction(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function onInspectPointerDown(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    var selection = selectionFor(targetForPointerEvent(event));
    blockAction(event);
    if (!selection) return;
    setOverlay({ left: selection.geometry.x, top: selection.geometry.y, width: selection.geometry.width, height: selection.geometry.height });
    send("preview-inspect-selected", selection);
  }

  function onInspectKeydown(event) {
    if (!inspectEnabled || !event.isTrusted) return;
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
  }

  function onInspectWheel(event) {
    if (!inspectEnabled || !event.isTrusted) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.scrollBy({ left: event.deltaX, top: event.deltaY, behavior: "auto" });
  }

  function setInspectMode(enabled) {
    inspectEnabled = Boolean(enabled);
    document.documentElement.setAttribute("data-canvas-helper-inspect-active", inspectEnabled ? "true" : "false");
    var element = ensureShield();
    element.style.display = inspectEnabled ? "block" : "none";
    element.style.pointerEvents = inspectEnabled ? "auto" : "none";
    if (!inspectEnabled) {
      hideOverlay();
    }
  }

  function isCommand(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && typeof data.type === "string";
  }

  function isBootstrap(data) {
    return data && typeof data === "object" && data.protocol === PROTOCOL && data.version === VERSION && data.type === "studio-connect" && data.payload === null;
  }

  function handlePortMessage(event) {
    if (!isCommand(event.data)) return;
    if (event.data.type === "studio-request-state" && event.data.payload === null) sendScrollState();
    if (event.data.type === "studio-restore-scroll") restoreScrollState(event.data.payload);
    if (event.data.type === "studio-set-inspect-mode" && event.data.payload && typeof event.data.payload.enabled === "boolean") setInspectMode(event.data.payload.enabled);
    if (event.data.type === "studio-request-inspect-current" && event.data.payload && typeof event.data.payload.nodeId === "string") {
      var element = elementForSourceNodeId(event.data.payload.nodeId);
      var selection = element ? selectionFor(element) : null;
      if (!selection || selection.nodeId !== event.data.payload.nodeId) {
        send("preview-error", { message: "The selected preview element is no longer available. Select it again before capturing a screenshot." });
        return;
      }
      send("preview-inspect-current", selection);
    }
  }

  function attachPort(nextPort) {
    if (!nextPort || typeof nextPort.postMessage !== "function") return;
    if (port) { try { port.close(); } catch (_) {} }
    port = nextPort;
    port.onmessage = handlePortMessage;
    if (typeof port.start === "function") port.start();
    send("preview-ready", { href: location.href });
    sendScrollState();
  }

  window.addEventListener("message", function(event) {
    if (event.origin !== STUDIO_ORIGIN || event.source !== window.parent || !isBootstrap(event.data) || !event.ports || event.ports.length !== 1) return;
    event.stopImmediatePropagation();
    attachPort(event.ports[0]);
  }, true);

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
  window.addEventListener("error", function(event) { send("preview-error", { message: boundedString(event.message || "Preview error", 360) }); });

  function markReady() { document.documentElement.setAttribute("data-canvas-helper-bridge-ready", "true"); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", markReady, { once: true }); else markReady();
})();`;
}
