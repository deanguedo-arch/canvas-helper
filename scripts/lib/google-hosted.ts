import { load } from "cheerio";

import type { ProgressCompletionItem } from "./progress-report.js";

const GOOGLE_HOSTED_EXPORT_LABEL = "google-hosted";
const GOOGLE_HOSTED_FIREBASE_VERSION = "10.12.2";
const GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER = "replace-with-firebase-project-id";

type GoogleHostedAuthMode = "google" | "none";

type BuildGoogleHostedBridgeScriptOptions = {
  authMode?: GoogleHostedAuthMode;
  progressItems?: ProgressCompletionItem[];
  projectSlug: string;
  storageKeys: string[];
};

type BuildGoogleHostedDeployReadmeOptions = {
  authMode?: GoogleHostedAuthMode;
  projectSlug: string;
  projectTitle: string;
  storageKeys: string[];
};

type DecideGoogleHostedNoRemoteActionOptions = {
  hasLocalState: boolean;
  localMetaUid: string | null;
  userUid: string;
};

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizeStorageKeys(projectSlug: string, storageKeys: string[]) {
  return storageKeys.length > 0 ? unique(storageKeys) : [`${projectSlug}::workspace-state::v1`];
}

export function decideGoogleHostedNoRemoteAction(options: DecideGoogleHostedNoRemoteActionOptions) {
  if (!options.hasLocalState) {
    return "ready";
  }

  if (options.localMetaUid && options.localMetaUid !== options.userUid) {
    return "clear-local";
  }

  return "persist-local";
}

export function getGoogleHostedExportLabel() {
  return GOOGLE_HOSTED_EXPORT_LABEL;
}

export function injectGoogleHostedBridgeTag(html: string, bridgeRelativePath = "./google-hosted-bridge.js") {
  const $ = load(html);

  const existingBridge = $(`script[src="${bridgeRelativePath}"]`).toArray();
  if (existingBridge.length > 0) {
    return $.html();
  }

  const scriptNode = $("<script></script>");
  scriptNode.attr("src", bridgeRelativePath);

  const localScriptNode = $("script[src]").toArray().find((node) => {
    const src = ($(node).attr("src") ?? "").trim();
    return src.length > 0 && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(src);
  });

  if (localScriptNode) {
    $(localScriptNode).before(scriptNode);
  } else if ($("body").length > 0) {
    $("body").append("\n");
    $("body").append(scriptNode);
    $("body").append("\n");
  } else {
    $.root().append(scriptNode);
  }

  return $.html();
}

function buildGoogleHostedLocalOnlyBridgeScript(config: {
  authMode: GoogleHostedAuthMode;
  metaKey: string;
  progressItems: ProgressCompletionItem[];
  projectSlug: string;
  schemaVersion: number;
  storageKeys: string[];
}) {
  return `/* Canvas Helper Google Hosted Bridge */
(function () {
  "use strict";

  const config = ${JSON.stringify(config)};
  const hostedReferencePrefix = "/preview/references/raw/" + config.projectSlug + "/";
  let referenceRewritesInstalled = false;

  function safeDecodePath(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function rewriteHostedReferenceUrl(rawUrl) {
    if (typeof rawUrl !== "string" || rawUrl.length === 0) {
      return rawUrl;
    }

    try {
      const asUrl = new URL(rawUrl, window.location.href);
      const pathname = asUrl.pathname || "";
      if (!pathname.startsWith(hostedReferencePrefix)) {
        return rawUrl;
      }

      const encodedRelativePath = pathname.slice(hostedReferencePrefix.length).replace(/^\\/+/, "");
      const decodedRelativePath = encodedRelativePath
        .split("/")
        .map((part) => safeDecodePath(part))
        .join("/")
        .replace(/\\\\/g, "/")
        .replace(/^\\/+/, "");

      return "./" + decodedRelativePath;
    } catch {
      return rawUrl;
    }
  }

  function installHostedReferenceRewrites() {
    if (referenceRewritesInstalled || typeof window === "undefined") {
      return;
    }
    referenceRewritesInstalled = true;

    if (typeof window.fetch === "function") {
      const originalFetch = window.fetch.bind(window);
      window.fetch = function (input, init) {
        let nextInput = input;

        if (typeof input === "string") {
          nextInput = rewriteHostedReferenceUrl(input);
        } else if (input instanceof Request) {
          const rewritten = rewriteHostedReferenceUrl(input.url);
          if (typeof rewritten === "string" && rewritten !== input.url) {
            nextInput = new Request(rewritten, input);
          }
        }

        return originalFetch(nextInput, init);
      };
    }

    const elementProto = typeof Element !== "undefined" ? Element.prototype : null;
    if (!elementProto || typeof elementProto.setAttribute !== "function") {
      return;
    }

    const originalSetAttribute = elementProto.setAttribute;
    elementProto.setAttribute = function (name, value) {
      if (
        typeof name === "string" &&
        typeof value === "string" &&
        /^(src|href|poster|data)$/i.test(name)
      ) {
        return originalSetAttribute.call(this, name, rewriteHostedReferenceUrl(value));
      }

      return originalSetAttribute.call(this, name, value);
    };
  }

  installHostedReferenceRewrites();

  window.__canvasHelperGoogleHosted = {
    config,
    restore: function () {
      return Promise.resolve(null);
    },
    save: function () {
      return Promise.resolve(null);
    },
    signIn: function () {
      return Promise.resolve(null);
    },
    signOut: function () {
      return Promise.resolve(null);
    }
  };
})();
`;
}

export function buildGoogleHostedBridgeScript(options: BuildGoogleHostedBridgeScriptOptions) {
  const authMode: GoogleHostedAuthMode = options.authMode === "none" ? "none" : "google";
  const config = {
    authMode,
    firebaseConfigCandidates: ["./firebase-config.json", "./firebase-config.template.json"],
    firebaseSdkVersion: GOOGLE_HOSTED_FIREBASE_VERSION,
    firestoreCollection: "projects",
    metaKey: `__canvas_helper_google_hosted__${options.projectSlug}`,
    progressItems: options.progressItems ?? [],
    projectSlug: options.projectSlug,
    schemaVersion: 2,
    storageKeys: normalizeStorageKeys(options.projectSlug, options.storageKeys)
  };

  if (authMode === "none") {
    return buildGoogleHostedLocalOnlyBridgeScript(config);
  }

  const sdkSources = [
    `https://www.gstatic.com/firebasejs/${GOOGLE_HOSTED_FIREBASE_VERSION}/firebase-app-compat.js`,
    `https://www.gstatic.com/firebasejs/${GOOGLE_HOSTED_FIREBASE_VERSION}/firebase-auth-compat.js`,
    `https://www.gstatic.com/firebasejs/${GOOGLE_HOSTED_FIREBASE_VERSION}/firebase-firestore-compat.js`
  ];

  return `/* Canvas Helper Google Hosted Bridge */
(function () {
  "use strict";

  const config = ${JSON.stringify(config)};
  const sdkSources = ${JSON.stringify(sdkSources)};
  const trackedKeySet = new Set(config.storageKeys);
  const hostedReferencePrefix = "/preview/references/raw/" + config.projectSlug + "/";
  const reloadGuardKey = config.metaKey + "__reload_guard";
  let firebaseReadyPromise = null;
  let lifecycleBound = false;
  let localStoragePatched = false;
  let currentUser = null;
  let firestore = null;
  let auth = null;
  let firebaseApi = null;
  let saveTimer = null;
  let savingPromise = Promise.resolve();
  let restoring = false;
  let controlHost = null;
  let actionButton = null;
  let secondaryButton = null;
  let statusNode = null;
  let controlsPlacementObserver = null;
  let controlsPlacementFrame = 0;
  let controlsThemeFrame = 0;
  let lastStatusMessage = "Preparing cloud resume...";
  let lastStatusTone = "working";
  let referenceRewritesInstalled = false;

  function safeDecodePath(value) {
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }

  function rewriteHostedReferenceUrl(rawUrl) {
    if (typeof rawUrl !== "string" || rawUrl.length === 0) {
      return rawUrl;
    }

    try {
      const asUrl = new URL(rawUrl, window.location.href);
      const pathname = asUrl.pathname || "";
      if (!pathname.startsWith(hostedReferencePrefix)) {
        return rawUrl;
      }

      const encodedRelativePath = pathname.slice(hostedReferencePrefix.length).replace(/^\\/+/, "");
      const decodedRelativePath = encodedRelativePath
        .split("/")
        .map((part) => safeDecodePath(part))
        .join("/")
        .replace(/\\\\/g, "/")
        .replace(/^\\/+/, "");

      return "./" + decodedRelativePath;
    } catch {
      return rawUrl;
    }
  }

  function installHostedReferenceRewrites() {
    if (referenceRewritesInstalled || typeof window === "undefined") {
      return;
    }
    referenceRewritesInstalled = true;

    if (typeof window.fetch === "function") {
      const originalFetch = window.fetch.bind(window);
      window.fetch = function (input, init) {
        let nextInput = input;

        if (typeof input === "string") {
          nextInput = rewriteHostedReferenceUrl(input);
        } else if (input instanceof Request) {
          const rewritten = rewriteHostedReferenceUrl(input.url);
          if (typeof rewritten === "string" && rewritten !== input.url) {
            nextInput = new Request(rewritten, input);
          }
        }

        return originalFetch(nextInput, init);
      };
    }

    const elementProto = typeof Element !== "undefined" ? Element.prototype : null;
    if (!elementProto || typeof elementProto.setAttribute !== "function") {
      return;
    }

    const originalSetAttribute = elementProto.setAttribute;
    elementProto.setAttribute = function (name, value) {
      if (
        typeof name === "string" &&
        typeof value === "string" &&
        /^(src|href|poster|data)$/i.test(name)
      ) {
        return originalSetAttribute.call(this, name, rewriteHostedReferenceUrl(value));
      }

      return originalSetAttribute.call(this, name, value);
    };
  }

  installHostedReferenceRewrites();

  function logWarning(message) {
    try {
      console.warn("[google-hosted-bridge]", message);
    } catch (_error) {
      // No-op.
    }
  }

  function setStatus(message, tone) {
    lastStatusMessage = message;
    lastStatusTone = tone || "neutral";
    if (!statusNode) {
      return;
    }

    statusNode.textContent = lastStatusMessage;
    statusNode.setAttribute("data-tone", lastStatusTone);
    if (controlHost) {
      controlHost.setAttribute("data-tone", lastStatusTone);
    }
  }

  function renderControls() {
    if (!actionButton || !secondaryButton) {
      return;
    }

    if (controlHost) {
      controlHost.setAttribute("data-authenticated", currentUser ? "true" : "false");
    }

    if (currentUser) {
      actionButton.textContent = "Save now";
      actionButton.disabled = false;
      secondaryButton.hidden = false;
    } else {
      actionButton.textContent = "Sign in";
      actionButton.disabled = false;
      secondaryButton.hidden = true;
    }
  }

  const sidebarControlSelectors = [
    "[data-google-hosted-controls-host]",
    "[data-canvas-helper-google-hosted-host]"
  ];

  const sidebarRootSelectors = [
    ".forensic-sidebar",
    ".shell-sidebar",
    ".sidebar",
    "#sidebar",
    "aside[data-testid='chapter-menu-panel']",
    "aside"
  ];

  function findGoogleHostedControlsHost() {
    if (typeof document === "undefined") {
      return null;
    }

    for (const selector of sidebarControlSelectors) {
      const candidate = document.querySelector(selector);
      if (!candidate || candidate === controlHost || (controlHost && controlHost.contains(candidate))) {
        continue;
      }
      return candidate;
    }

    return null;
  }

  function findGoogleHostedSidebarRoot() {
    if (typeof document === "undefined") {
      return null;
    }

    for (const selector of sidebarRootSelectors) {
      const candidate = document.querySelector(selector);
      if (!candidate || candidate === controlHost || (controlHost && controlHost.contains(candidate))) {
        continue;
      }
      return candidate;
    }

    return null;
  }

  function parseColorChannels(value) {
    if (typeof value !== "string") {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === "transparent" || !normalized.startsWith("rgb")) {
      return null;
    }

    const openIndex = normalized.indexOf("(");
    const closeIndex = normalized.lastIndexOf(")");
    if (openIndex === -1 || closeIndex <= openIndex) {
      return null;
    }

    const parts = normalized
      .slice(openIndex + 1, closeIndex)
      .replace(/\//g, " ")
      .replace(/,/g, " ")
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length < 3) {
      return null;
    }

    const parseChannel = function (part) {
      if (typeof part !== "string") {
        return null;
      }
      if (part.endsWith("%")) {
        const percent = Number.parseFloat(part);
        if (!Number.isFinite(percent)) {
          return null;
        }
        return Math.max(0, Math.min(255, Math.round((percent / 100) * 255)));
      }

      const value = Number.parseFloat(part);
      if (!Number.isFinite(value)) {
        return null;
      }
      return Math.max(0, Math.min(255, Math.round(value)));
    };

    const red = parseChannel(parts[0]);
    const green = parseChannel(parts[1]);
    const blue = parseChannel(parts[2]);
    if (red === null || green === null || blue === null) {
      return null;
    }

    let alpha = 1;
    if (parts.length > 3) {
      const alphaRaw = parts[3];
      if (alphaRaw.endsWith("%")) {
        const percent = Number.parseFloat(alphaRaw);
        if (Number.isFinite(percent)) {
          alpha = Math.max(0, Math.min(1, percent / 100));
        }
      } else {
        const value = Number.parseFloat(alphaRaw);
        if (Number.isFinite(value)) {
          alpha = Math.max(0, Math.min(1, value));
        }
      }
    }

    return { red, green, blue, alpha };
  }

  function withAlpha(color, alpha) {
    const channels = parseColorChannels(color);
    if (!channels) {
      return color;
    }

    return "rgba(" + channels.red + ", " + channels.green + ", " + channels.blue + ", " + alpha + ")";
  }

  function isTransparentColor(value) {
    const channels = parseColorChannels(value);
    if (!channels) {
      return value === "transparent";
    }
    return channels.alpha <= 0.01;
  }

  function luminance(color) {
    const channels = parseColorChannels(color);
    if (!channels) {
      return 0;
    }

    return (channels.red * 0.299 + channels.green * 0.587 + channels.blue * 0.114) / 255;
  }

  function pickReadableTextColor(backgroundColor, fallbackColor) {
    const colorLuminance = luminance(backgroundColor);
    if (colorLuminance >= 0.6) {
      return "rgb(15, 23, 42)";
    }
    if (colorLuminance <= 0.25) {
      return "rgb(248, 250, 252)";
    }
    return fallbackColor;
  }

  function findComputedColor(startElement, propertyName) {
    if (!startElement || typeof window === "undefined" || typeof window.getComputedStyle !== "function") {
      return null;
    }

    let current = startElement;
    while (current) {
      const style = window.getComputedStyle(current);
      const value = style ? style[propertyName] : null;
      if (value && !isTransparentColor(value)) {
        return value;
      }
      current = current.parentElement;
    }

    const bodyStyle = window.getComputedStyle(document.body);
    const bodyValue = bodyStyle ? bodyStyle[propertyName] : null;
    if (bodyValue && !isTransparentColor(bodyValue)) {
      return bodyValue;
    }

    return null;
  }

  function findSidebarAccentColor(themeRoot) {
    if (!themeRoot || typeof themeRoot.querySelector !== "function") {
      return null;
    }

    const accentSelectors = [
      "[aria-current='page']",
      ".active",
      ".is-active",
      ".nav-item.active",
      ".library-tab.active",
      ".sidebar-progress-fill",
      "#sidebar-progress-fill",
      ".progress-fill",
      "#progress-fill",
      "button[class*='active']"
    ];

    for (const selector of accentSelectors) {
      const candidate = themeRoot.querySelector(selector);
      if (!candidate || candidate === controlHost || (controlHost && controlHost.contains(candidate))) {
        continue;
      }

      const style = window.getComputedStyle(candidate);
      if (!style) {
        continue;
      }

      const properties = ["backgroundColor", "color", "borderColor"];
      for (const propertyName of properties) {
        const value = style[propertyName];
        if (value && !isTransparentColor(value)) {
          return value;
        }
      }
    }

    return null;
  }

  function clearControlThemeVariables() {
    if (!controlHost) {
      return;
    }

    const variableNames = [
      "--gh-controls-bg",
      "--gh-controls-text",
      "--gh-controls-border",
      "--gh-button-bg",
      "--gh-button-text",
      "--gh-secondary-bg",
      "--gh-secondary-text",
      "--gh-status-text"
    ];

    for (const variableName of variableNames) {
      controlHost.style.removeProperty(variableName);
    }
  }

  function applySidebarThemeStyles(themeRoot, isEmbedded) {
    if (!controlHost || !themeRoot) {
      return;
    }

    const sidebarBackground = findComputedColor(themeRoot, "backgroundColor");
    const sidebarText = findComputedColor(themeRoot, "color");
    const sidebarBorder = findComputedColor(themeRoot, "borderColor");
    const accentColor = findSidebarAccentColor(themeRoot) || sidebarText || "rgb(37, 99, 235)";
    const baseText = pickReadableTextColor(sidebarBackground || "rgb(17, 24, 39)", sidebarText || "rgb(248, 250, 252)");

    if (isEmbedded) {
      controlHost.style.setProperty("--gh-controls-bg", withAlpha(sidebarBackground || "rgb(17, 24, 39)", 0.2));
      controlHost.style.setProperty("--gh-controls-text", baseText);
      controlHost.style.setProperty("--gh-controls-border", withAlpha(sidebarBorder || accentColor, 0.38));
      controlHost.style.setProperty("--gh-button-bg", accentColor);
      controlHost.style.setProperty("--gh-button-text", pickReadableTextColor(accentColor, "rgb(15, 23, 42)"));
      controlHost.style.setProperty("--gh-secondary-bg", withAlpha(sidebarBackground || accentColor, 0.4));
      controlHost.style.setProperty("--gh-secondary-text", baseText);
      controlHost.style.setProperty("--gh-status-text", withAlpha(baseText, 0.84));
      return;
    }

    controlHost.style.setProperty("--gh-controls-bg", withAlpha(sidebarBackground || "rgb(17, 24, 39)", 0.95));
    controlHost.style.setProperty("--gh-controls-text", baseText);
    controlHost.style.setProperty("--gh-controls-border", withAlpha(sidebarBorder || accentColor, 0.28));
    controlHost.style.setProperty("--gh-button-bg", accentColor);
    controlHost.style.setProperty("--gh-button-text", pickReadableTextColor(accentColor, "rgb(15, 23, 42)"));
    controlHost.style.setProperty("--gh-secondary-bg", withAlpha(sidebarBackground || accentColor, 0.48));
    controlHost.style.setProperty("--gh-secondary-text", baseText);
    controlHost.style.setProperty("--gh-status-text", withAlpha(baseText, 0.84));
  }

  function scheduleThemeRefresh(themeRoot, isEmbedded) {
    if (!controlHost) {
      return;
    }

    if (controlsThemeFrame) {
      return;
    }

    const run = function () {
      controlsThemeFrame = 0;
      applySidebarThemeStyles(themeRoot, isEmbedded);
    };

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      controlsThemeFrame = window.requestAnimationFrame(run);
      return;
    }

    controlsThemeFrame = window.setTimeout(run, 0);
  }

  function placeControlsInSidebar() {
    if (!controlHost || typeof document === "undefined" || !document.body) {
      return;
    }

    const host = findGoogleHostedControlsHost();
    if (host) {
      if (controlHost.parentElement !== host) {
        host.appendChild(controlHost);
      }
      controlHost.classList.add("canvas-helper-google-hosted-controls--embedded");
      controlHost.setAttribute("data-placement", "sidebar");
      controlHost.removeAttribute("data-sidebar-root-only");
      scheduleThemeRefresh(host, true);
      return;
    }

    const sidebarRoot = findGoogleHostedSidebarRoot();
    if (sidebarRoot) {
      if (controlHost.parentElement !== sidebarRoot) {
        sidebarRoot.appendChild(controlHost);
      }
      controlHost.classList.add("canvas-helper-google-hosted-controls--embedded");
      controlHost.setAttribute("data-placement", "sidebar");
      controlHost.setAttribute("data-sidebar-root-only", "true");
      scheduleThemeRefresh(sidebarRoot, true);
      return;
    }

    if (controlHost.parentElement !== document.body) {
      document.body.appendChild(controlHost);
    }
    controlHost.classList.remove("canvas-helper-google-hosted-controls--embedded");
    controlHost.setAttribute("data-placement", "fixed");
    controlHost.removeAttribute("data-sidebar-root-only");
    clearControlThemeVariables();
    scheduleThemeRefresh(document.body, false);
  }

  function scheduleControlsPlacement() {
    if (controlsPlacementFrame) {
      return;
    }

    const run = function () {
      controlsPlacementFrame = 0;
      placeControlsInSidebar();
    };

    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      controlsPlacementFrame = window.requestAnimationFrame(run);
      return;
    }

    controlsPlacementFrame = window.setTimeout(run, 0);
  }

  function watchControlsPlacement() {
    if (
      controlsPlacementObserver ||
      typeof MutationObserver === "undefined" ||
      typeof document === "undefined" ||
      !document.body
    ) {
      return;
    }

    controlsPlacementObserver = new MutationObserver(() => {
      scheduleControlsPlacement();
    });
    controlsPlacementObserver.observe(document.body, { childList: true, subtree: true });
  }

  function ensureControls() {
    if (controlHost || typeof document === "undefined") {
      scheduleControlsPlacement();
      return;
    }

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", ensureControls, { once: true });
      return;
    }

    if (!document.head.querySelector("style[data-canvas-helper-google-hosted]")) {
      const styleTag = document.createElement("style");
      styleTag.setAttribute("data-canvas-helper-google-hosted", "true");
      styleTag.textContent = [
        ".canvas-helper-google-hosted-controls{position:fixed;right:12px;top:50%;transform:translateY(-50%);z-index:2147483647;display:flex;flex-direction:column;gap:8px;min-width:0;max-width:min(240px,calc(100vw - 24px));padding:9px;border-radius:10px 0 0 10px;border:1px solid var(--gh-controls-border,rgba(255,255,255,.18));background:var(--gh-controls-bg,rgba(17,24,39,.94));color:var(--gh-controls-text,#f9fafb);box-shadow:0 10px 26px rgba(15,23,42,.28);font:13px/1.4 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
        ".canvas-helper-google-hosted-controls[data-tone='error']{background:rgba(127,29,29,.96)}",
        ".canvas-helper-google-hosted-actions{display:flex;flex-direction:column;gap:7px}",
        ".canvas-helper-google-hosted-button,.canvas-helper-google-hosted-secondary{appearance:none;border:0;border-radius:8px;padding:8px 11px;font:700 12px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer;white-space:nowrap}",
        ".canvas-helper-google-hosted-button{background:var(--gh-button-bg,#f59e0b);color:var(--gh-button-text,#111827)}",
        ".canvas-helper-google-hosted-secondary{background:var(--gh-secondary-bg,rgba(255,255,255,.14));color:var(--gh-secondary-text,#f9fafb)}",
        ".canvas-helper-google-hosted-status{display:none;margin:0;max-width:190px;font-size:11px;opacity:.94}",
        ".canvas-helper-google-hosted-controls:hover .canvas-helper-google-hosted-status,.canvas-helper-google-hosted-controls:focus-within .canvas-helper-google-hosted-status,.canvas-helper-google-hosted-controls[data-authenticated='true'] .canvas-helper-google-hosted-status,.canvas-helper-google-hosted-controls[data-tone='error'] .canvas-helper-google-hosted-status{display:block}",
        ".canvas-helper-google-hosted-status[data-tone='saved']{color:var(--gh-status-text,#bbf7d0)}",
        ".canvas-helper-google-hosted-status[data-tone='error']{color:#fecaca}",
        ".canvas-helper-google-hosted-status[data-tone='working']{color:var(--gh-status-text,#fde68a)}",
        ".forensic-sidebar:has(> .canvas-helper-google-hosted-controls--embedded),.shell-sidebar:has(> .canvas-helper-google-hosted-controls--embedded),.sidebar:has(> .canvas-helper-google-hosted-controls--embedded),aside[data-testid='chapter-menu-panel']:has(> .canvas-helper-google-hosted-controls--embedded){display:flex;flex-direction:column}",
        ".canvas-helper-google-hosted-controls--embedded{position:static;right:auto;top:auto;transform:none;z-index:auto;width:calc(100% - 24px);max-width:none;margin:12px 12px 16px;padding:10px;border:1px solid var(--gh-controls-border,rgba(255,255,255,.14));border-radius:8px;background:var(--gh-controls-bg,rgba(255,255,255,.08));box-shadow:none;color:var(--gh-controls-text,inherit)}",
        ".canvas-helper-google-hosted-controls--embedded[data-sidebar-root-only='true']{position:sticky;bottom:16px;margin-top:auto}",
        ".forensic-sidebar:has(> .canvas-helper-google-hosted-controls--embedded) .forensic-sidebar-body,.shell-sidebar:has(> .canvas-helper-google-hosted-controls--embedded) .forensic-sidebar-body,.sidebar:has(> .canvas-helper-google-hosted-controls--embedded) .sidebar-nav,aside[data-testid='chapter-menu-panel']:has(> .canvas-helper-google-hosted-controls--embedded) nav[aria-label='Workspace sections']{margin-bottom:12px}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-actions{display:flex;flex-direction:column;gap:7px}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-button,.canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-secondary{width:100%;border-radius:8px}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-secondary{border:1px solid var(--gh-controls-border,rgba(255,255,255,.14));background:var(--gh-secondary-bg,rgba(255,255,255,.12));color:var(--gh-secondary-text,inherit)}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-status{display:block;max-width:none;color:var(--gh-status-text,rgba(255,255,255,.78))}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-status[data-tone='saved']{color:var(--gh-status-text,#bbf7d0)}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-status[data-tone='error']{color:#fecaca}",
        ".canvas-helper-google-hosted-controls--embedded .canvas-helper-google-hosted-status[data-tone='working']{color:var(--gh-status-text,#fde68a)}",
        "@media print{.canvas-helper-google-hosted-controls{display:none!important}}"
      ].join("");
      document.head.appendChild(styleTag);
    }

    controlHost = document.createElement("div");
    controlHost.className = "canvas-helper-google-hosted-controls";
    controlHost.setAttribute("data-tone", lastStatusTone);

    const actions = document.createElement("div");
    actions.className = "canvas-helper-google-hosted-actions";

    actionButton = document.createElement("button");
    actionButton.className = "canvas-helper-google-hosted-button";
    actionButton.type = "button";
    actionButton.textContent = "Sign in with Google";
    actionButton.addEventListener("click", () => {
      if (currentUser) {
        void flushSave("manual");
        return;
      }

      void signInWithGoogle();
    });

    secondaryButton = document.createElement("button");
    secondaryButton.className = "canvas-helper-google-hosted-secondary";
    secondaryButton.type = "button";
    secondaryButton.textContent = "Sign out";
    secondaryButton.hidden = true;
    secondaryButton.addEventListener("click", () => {
      void signOut();
    });

    statusNode = document.createElement("p");
    statusNode.className = "canvas-helper-google-hosted-status";
    statusNode.setAttribute("data-tone", lastStatusTone);
    statusNode.textContent = lastStatusMessage;

    actions.appendChild(actionButton);
    actions.appendChild(secondaryButton);
    controlHost.appendChild(actions);
    controlHost.appendChild(statusNode);
    document.body.appendChild(controlHost);

    watchControlsPlacement();
    scheduleControlsPlacement();
    renderControls();
    setStatus(lastStatusMessage, lastStatusTone);
  }

  function tryParseJson(value) {
    if (typeof value !== "string") {
      return null;
    }

    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  function hasPlaceholderValue(value) {
    return typeof value === "string" && /replace-with-|replace_me|placeholder/i.test(value);
  }

  function isFirebaseConfigReady(candidate) {
    if (!candidate || typeof candidate !== "object") {
      return false;
    }

    const requiredKeys = ["apiKey", "authDomain", "projectId", "appId", "messagingSenderId"];
    return requiredKeys.every((key) => {
      const value = candidate[key];
      return typeof value === "string" && value.trim().length > 0 && !hasPlaceholderValue(value);
    });
  }

  function loadJsonScriptConfig() {
    const runtimeConfig = window.__FIREBASE_CONFIG__;
    if (isFirebaseConfigReady(runtimeConfig)) {
      return runtimeConfig;
    }

    return null;
  }

  async function fetchJson(pathname) {
    const response = await fetch(pathname, { cache: "no-store" });
    if (!response.ok) {
      return null;
    }

    return response.json();
  }

  async function loadFirebaseConfig() {
    const globalConfig = loadJsonScriptConfig();
    if (globalConfig) {
      return globalConfig;
    }

    let sawTemplateWithoutValues = false;

    for (const candidatePath of config.firebaseConfigCandidates) {
      try {
        const candidate = await fetchJson(candidatePath);
        if (!candidate) {
          continue;
        }

        if (isFirebaseConfigReady(candidate)) {
          return candidate;
        }

        sawTemplateWithoutValues = true;
      } catch (error) {
        logWarning(error instanceof Error ? error.message : String(error));
      }
    }

    if (sawTemplateWithoutValues) {
      throw new Error("Firebase config template exists but still contains placeholder values.");
    }

    throw new Error("Firebase config not found. Follow README-deploy.md before publishing.");
  }

  function loadExternalScript(source) {
    const existing = document.querySelector('script[data-canvas-helper-src="' + source + '"]');
    if (existing && existing.getAttribute("data-loaded") === "true") {
      return Promise.resolve();
    }

    if (existing) {
      return new Promise((resolve, reject) => {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Failed to load " + source)), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.src = source;
      script.setAttribute("data-canvas-helper-src", source);
      script.addEventListener("load", () => {
        script.setAttribute("data-loaded", "true");
        resolve();
      }, { once: true });
      script.addEventListener("error", () => {
        reject(new Error("Failed to load " + source));
      }, { once: true });
      document.head.appendChild(script);
    });
  }

  async function ensureFirebaseReady() {
    if (!firebaseReadyPromise) {
      firebaseReadyPromise = (async () => {
        ensureControls();
        for (const source of sdkSources) {
          await loadExternalScript(source);
        }

        const firebaseConfig = await loadFirebaseConfig();
        const firebaseGlobal = window.firebase;
        if (!firebaseGlobal) {
          throw new Error("Firebase SDK loaded without a global firebase object.");
        }

        firebaseApi = firebaseGlobal;

        if (!firebaseGlobal.apps || firebaseGlobal.apps.length === 0) {
          firebaseGlobal.initializeApp(firebaseConfig);
        }

        auth = firebaseGlobal.auth();
        firestore = firebaseGlobal.firestore();
        await auth.setPersistence(firebaseGlobal.auth.Auth.Persistence.LOCAL);

        return {
          auth,
          config: firebaseConfig,
          firebase: firebaseGlobal,
          firestore
        };
      })();
    }

    return firebaseReadyPromise;
  }

  function formatTimestamp(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString([], {
      hour: "numeric",
      minute: "2-digit",
      month: "short",
      day: "numeric"
    });
  }

  function readSyncMetadata() {
    try {
      return tryParseJson(localStorage.getItem(config.metaKey)) || {};
    } catch {
      return {};
    }
  }

  function writeSyncMetadata(value) {
    try {
      localStorage.setItem(config.metaKey, JSON.stringify(value));
    } catch (error) {
      logWarning(error instanceof Error ? error.message : String(error));
    }
  }

  function buildReloadSignature(reason, uid, savedAt, storageValues) {
    const orderedValues = config.storageKeys
      .map((key) => key + ":" + (Object.prototype.hasOwnProperty.call(storageValues || {}, key) ? String(storageValues[key]) : ""))
      .join("|");
    return [config.projectSlug, reason || "", uid || "", savedAt || "", orderedValues].join("::");
  }

  // reload-loop guard: prevent repeated reloads from the same restore payload.
  function skipReloadIfRepeated(signature) {
    try {
      const lastSignature = sessionStorage.getItem(reloadGuardKey);
      if (lastSignature === signature) {
        return true;
      }
      sessionStorage.setItem(reloadGuardKey, signature);
    } catch (_error) {
      // No-op. If sessionStorage is unavailable, allow a normal reload.
    }
    return false;
  }

  function serializeStoredValue(value) {
    if (typeof value === "string") {
      return value;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  function buildStateView(storageValues) {
    if (config.storageKeys.length === 1) {
      const onlyKey = config.storageKeys[0];
      if (!Object.prototype.hasOwnProperty.call(storageValues, onlyKey)) {
        return null;
      }

      const parsed = tryParseJson(storageValues[onlyKey]);
      return parsed === null ? storageValues[onlyKey] : parsed;
    }

    const state = {};
    for (const key of config.storageKeys) {
      if (!Object.prototype.hasOwnProperty.call(storageValues, key)) {
        continue;
      }

      const parsed = tryParseJson(storageValues[key]);
      state[key] = parsed === null ? storageValues[key] : parsed;
    }

    return Object.keys(state).length > 0 ? state : null;
  }

  function extractReportSnapshot(state) {
    if (!state || typeof state !== "object") {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(state, "reportSnapshot")) {
      return state.reportSnapshot ?? null;
    }

    for (const value of Object.values(state)) {
      if (value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, "reportSnapshot")) {
        return value.reportSnapshot ?? null;
      }
    }

    return null;
  }

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeNumber(value) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  function clampPercent(value) {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round(value)));
  }

  function addCompletedMapIds(value, completedIds) {
    if (!isObject(value)) {
      return;
    }

    for (const [id, completionValue] of Object.entries(value)) {
      if (completionValue === true) {
        completedIds.add(id);
        continue;
      }

      if (isObject(completionValue)) {
        const status = typeof completionValue.status === "string" ? completionValue.status.toLowerCase() : "";
        if (completionValue.completed === true || status === "complete" || status === "completed") {
          completedIds.add(id);
        }
      }
    }
  }

  function addCompletedArrayIds(value, completedIds) {
    if (!Array.isArray(value)) {
      return;
    }

    for (const entry of value) {
      if (typeof entry === "string" && entry.trim()) {
        completedIds.add(entry.trim());
        continue;
      }

      if (isObject(entry)) {
        const id = typeof entry.id === "string" ? entry.id.trim() : "";
        const status = typeof entry.status === "string" ? entry.status.toLowerCase() : "";
        if (id && entry.completed !== false && status !== "incomplete" && status !== "pending") {
          completedIds.add(id);
        }
      }
    }
  }

  function collectCompletedItemIds(value, completedIds, visited) {
    if (!value || typeof value !== "object") {
      return completedIds;
    }

    if (visited.has(value)) {
      return completedIds;
    }
    visited.add(value);

    if (Array.isArray(value)) {
      for (const entry of value) {
        collectCompletedItemIds(entry, completedIds, visited);
      }
      return completedIds;
    }

    const completionMapFields = new Set([
      "completedactivitybyid",
      "completedbyid",
      "completeditembyid",
      "completeditemsbyid",
      "completedlessonbyid",
      "completedquizbyid"
    ]);
    const completionArrayFields = new Set([
      "completedactivityids",
      "completedids",
      "completeditemids",
      "completedlessonids",
      "completedquizids"
    ]);

    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.toLowerCase();
      if (completionMapFields.has(normalizedKey)) {
        addCompletedMapIds(child, completedIds);
        continue;
      }

      if (completionArrayFields.has(normalizedKey) || (normalizedKey.startsWith("completed") && Array.isArray(child))) {
        addCompletedArrayIds(child, completedIds);
        continue;
      }

      collectCompletedItemIds(child, completedIds, visited);
    }

    return completedIds;
  }

  function findFirstStringField(value, fieldNames, visited) {
    if (!value || typeof value !== "object") {
      return "";
    }

    if (visited.has(value)) {
      return "";
    }
    visited.add(value);

    if (isObject(value)) {
      for (const fieldName of fieldNames) {
        const candidate = value[fieldName];
        if (typeof candidate === "string" && candidate.trim()) {
          return candidate.trim();
        }
      }

      for (const child of Object.values(value)) {
        const found = findFirstStringField(child, fieldNames, visited);
        if (found) {
          return found;
        }
      }
      return "";
    }

    for (const child of value) {
      const found = findFirstStringField(child, fieldNames, visited);
      if (found) {
        return found;
      }
    }

    return "";
  }

  function extractProgressSummary(state, reportSnapshot, savedAt) {
    const requiredItems = Array.isArray(config.progressItems)
      ? config.progressItems.filter((item) => item && typeof item.id === "string" && item.id.trim())
      : [];
    const completedIds = collectCompletedItemIds(state, new Set(), new WeakSet());

    if (reportSnapshot && typeof reportSnapshot === "object") {
      collectCompletedItemIds(reportSnapshot, completedIds, new WeakSet());
    }

    const lastActivityId =
      findFirstStringField(reportSnapshot, ["lastActivityId", "lastCompletedItemId"], new WeakSet()) ||
      findFirstStringField(state, ["lastActivityId", "lastCompletedItemId", "selectedActivityId"], new WeakSet()) ||
      "";

    if (requiredItems.length > 0) {
      const completedItemIds = requiredItems
        .filter((item) => completedIds.has(item.id))
        .map((item) => item.id);
      const requiredCount = requiredItems.length;
      const snapshot = isObject(reportSnapshot) ? reportSnapshot : {};
      const snapshotCompletedCount = normalizeNumber(snapshot.completedCount);
      const snapshotPercent =
        normalizeNumber(snapshot.percentComplete) ??
        normalizeNumber(snapshot.progressPercent) ??
        normalizeNumber(snapshot.completionPercent);
      const completedCount =
        completedItemIds.length === 0 && snapshotCompletedCount !== null
          ? Math.max(0, Math.min(requiredCount, Math.round(snapshotCompletedCount)))
          : completedItemIds.length;
      return {
        completedCount,
        completedItemIds,
        lastActivityId,
        percentComplete:
          completedItemIds.length === 0 && snapshotPercent !== null
            ? clampPercent(snapshotPercent)
            : clampPercent((completedCount / requiredCount) * 100),
        requiredCount,
        updatedAt: savedAt
      };
    }

    const snapshot = isObject(reportSnapshot) ? reportSnapshot : {};
    const completedCount = normalizeNumber(snapshot.completedCount);
    const requiredCount =
      normalizeNumber(snapshot.requiredCount) ??
      normalizeNumber(snapshot.totalCount) ??
      normalizeNumber(snapshot.totalItems);
    const percentComplete =
      normalizeNumber(snapshot.percentComplete) ??
      normalizeNumber(snapshot.progressPercent) ??
      normalizeNumber(snapshot.completionPercent);

    if (completedCount !== null || requiredCount !== null || percentComplete !== null) {
      const safeCompletedCount = Math.max(0, Math.round(completedCount ?? completedIds.size));
      const safeRequiredCount = Math.max(0, Math.round(requiredCount ?? 0));
      return {
        completedCount: safeCompletedCount,
        completedItemIds: [...completedIds].sort(),
        lastActivityId,
        percentComplete:
          percentComplete !== null
            ? clampPercent(percentComplete)
            : safeRequiredCount > 0
              ? clampPercent((safeCompletedCount / safeRequiredCount) * 100)
              : 0,
        requiredCount: safeRequiredCount,
        updatedAt: savedAt
      };
    }

    return {
      completedCount: completedIds.size,
      completedItemIds: [...completedIds].sort(),
      lastActivityId,
      percentComplete: 0,
      requiredCount: 0,
      updatedAt: savedAt
    };
  }

  function readTrackedLocalState() {
    const storageValues = {};

    for (const key of config.storageKeys) {
      try {
        const rawValue = localStorage.getItem(key);
        if (typeof rawValue === "string") {
          storageValues[key] = rawValue;
        }
      } catch (error) {
        logWarning(error instanceof Error ? error.message : String(error));
      }
    }

    const state = buildStateView(storageValues);
    const reportSnapshot = extractReportSnapshot(state);
    return {
      progressSummary: extractProgressSummary(state, reportSnapshot, new Date().toISOString()),
      reportSnapshot,
      state,
      storageValues
    };
  }

  function normalizeStoredValues(remoteData) {
    if (remoteData && remoteData.storageValues && typeof remoteData.storageValues === "object") {
      const storageValues = {};
      for (const key of config.storageKeys) {
        const value = remoteData.storageValues[key];
        if (typeof value === "string") {
          storageValues[key] = value;
        }
      }

      return storageValues;
    }

    if (!Object.prototype.hasOwnProperty.call(remoteData || {}, "state")) {
      return {};
    }

    if (config.storageKeys.length === 1) {
      return {
        [config.storageKeys[0]]: serializeStoredValue(remoteData.state)
      };
    }

    if (remoteData && remoteData.state && typeof remoteData.state === "object") {
      const storageValues = {};
      for (const key of config.storageKeys) {
        if (Object.prototype.hasOwnProperty.call(remoteData.state, key)) {
          storageValues[key] = serializeStoredValue(remoteData.state[key]);
        }
      }

      return storageValues;
    }

    return {};
  }

  function shouldUpgradeProgressSummary(remoteData) {
    if (!remoteData || typeof remoteData !== "object") {
      return true;
    }

    if (normalizeNumber(remoteData.schemaVersion) < config.schemaVersion) {
      return true;
    }

    const progressSummary = remoteData.progressSummary;
    if (!progressSummary || typeof progressSummary !== "object") {
      return true;
    }

    const requiredCount = normalizeNumber(progressSummary.requiredCount);
    return Array.isArray(config.progressItems) && config.progressItems.length > 0 && (!requiredCount || requiredCount <= 0);
  }

  function storageValuesDiffer(left, right) {
    for (const key of config.storageKeys) {
      const leftValue = Object.prototype.hasOwnProperty.call(left, key) ? left[key] : null;
      const rightValue = Object.prototype.hasOwnProperty.call(right, key) ? right[key] : null;
      if (leftValue !== rightValue) {
        return true;
      }
    }

    return false;
  }

  function applyStorageValues(storageValues, savedAt, uid) {
    let changed = false;

    for (const key of config.storageKeys) {
      const nextValue = Object.prototype.hasOwnProperty.call(storageValues, key) ? storageValues[key] : null;
      const currentValue = localStorage.getItem(key);

      if (nextValue === null) {
        if (currentValue !== null) {
          localStorage.removeItem(key);
          changed = true;
        }
        continue;
      }

      if (currentValue !== nextValue) {
        localStorage.setItem(key, nextValue);
        changed = true;
      }
    }

    writeSyncMetadata({
      savedAt: savedAt || new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      uid
    });

    return changed;
  }

  function getUserDocumentRef(uid) {
    return firestore.collection(config.firestoreCollection).doc(config.projectSlug).collection("users").doc(uid);
  }

  function normalizeAllowedDomains(firebaseConfig) {
    if (!Array.isArray(firebaseConfig.allowedEmailDomains)) {
      return [];
    }

    return firebaseConfig.allowedEmailDomains
      .map((value) => (typeof value === "string" ? value.trim().toLowerCase() : ""))
      .filter(Boolean);
  }

  function isAllowedDomain(user, allowedDomains) {
    if (allowedDomains.length === 0) {
      return true;
    }

    const email = typeof user?.email === "string" ? user.email : "";
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    return allowedDomains.includes(domain);
  }

  async function persistCurrentState(reason) {
    if (!currentUser || !firestore) {
      setStatus("Sign in with Google to sync progress.", "neutral");
      return null;
    }

    const snapshot = readTrackedLocalState();
    const savedAt = new Date().toISOString();
    snapshot.progressSummary.updatedAt = savedAt;
    const payload = {
      progressSummary: snapshot.progressSummary,
      projectSlug: config.projectSlug,
      reportSnapshot: snapshot.reportSnapshot,
      savedAt,
      schemaVersion: config.schemaVersion,
      state: snapshot.state,
      storageKeys: config.storageKeys,
      storageValues: snapshot.storageValues,
      userEmail: typeof currentUser.email === "string" ? currentUser.email : "",
      userId: currentUser.uid,
      userName: typeof currentUser.displayName === "string" ? currentUser.displayName : ""
    };

    setStatus(reason === "manual" ? "Saving to Firebase..." : "Autosaving to Firebase...", "working");

    savingPromise = savingPromise
      .catch(() => undefined)
      .then(async () => {
        await getUserDocumentRef(currentUser.uid).set(payload, { merge: true });
        writeSyncMetadata({
          savedAt,
          syncedAt: savedAt,
          uid: currentUser.uid
        });
        setStatus("Autosave ready. Last saved " + formatTimestamp(savedAt) + ".", "saved");
        return payload;
      })
      .catch((error) => {
        setStatus("Autosave failed. Check Firebase config and Firestore rules.", "error");
        logWarning(error instanceof Error ? error.message : String(error));
        throw error;
      });

    return savingPromise;
  }

  function scheduleSave(reason, delayMs) {
    if (!currentUser || restoring) {
      return;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
    }

    setStatus("Autosave queued...", "working");
    saveTimer = window.setTimeout(() => {
      saveTimer = null;
      void persistCurrentState(reason);
    }, typeof delayMs === "number" ? delayMs : 900);
  }

  async function flushSave(reason) {
    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }

    return persistCurrentState(reason);
  }

  function patchLocalStorage() {
    if (localStoragePatched || !window.localStorage) {
      return;
    }

    const storageProto = Object.getPrototypeOf(window.localStorage);
    const originalSetItem = storageProto.setItem;
    const originalRemoveItem = storageProto.removeItem;
    const originalClear = storageProto.clear;

    storageProto.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage && trackedKeySet.has(String(key))) {
        scheduleSave("local-change", 900);
      }
    };

    storageProto.removeItem = function (key) {
      originalRemoveItem.call(this, key);
      if (this === window.localStorage && trackedKeySet.has(String(key))) {
        scheduleSave("local-remove", 300);
      }
    };

    storageProto.clear = function () {
      let hadTrackedValues = false;
      if (this === window.localStorage) {
        hadTrackedValues = config.storageKeys.some((key) => window.localStorage.getItem(key) !== null);
      }

      originalClear.call(this);

      if (hadTrackedValues) {
        scheduleSave("local-clear", 300);
      }
    };

    localStoragePatched = true;
  }

  function bindLifecycleEvents() {
    if (lifecycleBound) {
      return;
    }

    lifecycleBound = true;
    window.addEventListener("pagehide", () => {
      void flushSave("pagehide");
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        void flushSave("visibility-hidden");
      }
    });
  }

  async function restoreStateForUser(user) {
    const ready = await ensureFirebaseReady();
    const allowedDomains = normalizeAllowedDomains(ready.config);

    if (!isAllowedDomain(user, allowedDomains)) {
      setStatus("This account is not allowed for the configured Google domain.", "error");
      await ready.auth.signOut();
      return;
    }

    currentUser = user;
    renderControls();
    setStatus("Checking saved progress...", "working");

    const remoteSnapshot = await getUserDocumentRef(user.uid).get();
    const localSnapshot = readTrackedLocalState();
    const localMeta = readSyncMetadata();

    if (!remoteSnapshot.exists) {
      const noRemoteAction = ${decideGoogleHostedNoRemoteAction.toString()}({
        hasLocalState: Object.keys(localSnapshot.storageValues).length > 0,
        localMetaUid: typeof localMeta.uid === "string" ? localMeta.uid : null,
        userUid: user.uid
      });

      if (noRemoteAction === "clear-local") {
        setStatus("No saved progress found for this Google account. Reloading a clean workbook...", "working");
        restoring = true;
        try {
          applyStorageValues({}, "", user.uid);
        } finally {
          restoring = false;
        }

        const reloadSignature = buildReloadSignature("clear-local", user.uid, "", {});
        if (skipReloadIfRepeated(reloadSignature)) {
          setStatus("Cloud state mismatch detected. Reload skipped to prevent a loop.", "error");
          return;
        }

        window.setTimeout(() => {
          window.location.reload();
        }, 50);
        return;
      }

      if (noRemoteAction === "persist-local") {
        await persistCurrentState("initial-sync");
      } else {
        setStatus("Signed in. Autosave ready.", "saved");
      }
      return;
    }

    const remoteData = remoteSnapshot.data() || {};
    const remoteStorageValues = normalizeStoredValues(remoteData);
    const remoteSavedAt = typeof remoteData.savedAt === "string" ? remoteData.savedAt : "";
    const keepLocalState =
      Object.keys(localSnapshot.storageValues).length > 0 &&
      typeof localMeta.savedAt === "string" &&
      localMeta.uid === user.uid &&
      (!remoteSavedAt || localMeta.savedAt > remoteSavedAt);

    if (keepLocalState) {
      await persistCurrentState("local-newer");
      return;
    }

    if (storageValuesDiffer(remoteStorageValues, localSnapshot.storageValues)) {
      setStatus("Saved progress restored. Reloading...", "working");
      restoring = true;
      try {
        applyStorageValues(remoteStorageValues, remoteSavedAt, user.uid);
      } finally {
        restoring = false;
      }

      const reloadSignature = buildReloadSignature("remote-restore", user.uid, remoteSavedAt, remoteStorageValues);
      if (skipReloadIfRepeated(reloadSignature)) {
        setStatus("Cloud restore completed. Reload skipped to prevent a loop.", "saved");
        return;
      }

      window.setTimeout(() => {
        window.location.reload();
      }, 50);
      return;
    }

    if (shouldUpgradeProgressSummary(remoteData)) {
      await persistCurrentState("progress-upgrade");
      return;
    }

    writeSyncMetadata({
      savedAt: remoteSavedAt || new Date().toISOString(),
      syncedAt: new Date().toISOString(),
      uid: user.uid
    });

    setStatus("Signed in. Autosave ready.", "saved");
  }

  async function signInWithGoogle() {
    try {
      const ready = await ensureFirebaseReady();
      const provider = new ready.firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      setStatus("Waiting for Google sign-in...", "working");
      try {
        const result = await ready.auth.signInWithPopup(provider);
        if (result.user) {
          await restoreStateForUser(result.user);
        }
      } catch (error) {
        const popupCode = typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
        const popupMessage = error instanceof Error ? error.message : String(error);
        const shouldFallbackToRedirect =
          popupCode === "auth/popup-blocked" ||
          popupCode === "auth/popup-closed-by-user" ||
          popupCode === "auth/cancelled-popup-request" ||
          /popup/i.test(popupMessage);

        if (!shouldFallbackToRedirect) {
          throw error;
        }

        setStatus("Popup sign-in unavailable. Redirecting to Google sign-in...", "working");
        await ready.auth.signInWithRedirect(provider);
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Google sign-in failed.", "error");
      logWarning(error instanceof Error ? error.message : String(error));
    }
  }

  async function signOut() {
    try {
      if (auth) {
        await auth.signOut();
      }
      currentUser = null;
      renderControls();
      setStatus("Signed out. Local browser progress is still available on this device.", "neutral");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Sign out failed.", "error");
    }
  }

  window.__canvasHelperGoogleHosted = {
    config,
    restore: function () {
      if (!currentUser) {
        return Promise.reject(new Error("Not signed in."));
      }

      return restoreStateForUser(currentUser);
    },
    save: function () {
      return flushSave("manual");
    },
    signIn: function () {
      return signInWithGoogle();
    },
    signOut: function () {
      return signOut();
    }
  };

  async function boot() {
    ensureControls();
    setStatus("Preparing cloud resume...", "working");
    try {
      const ready = await ensureFirebaseReady();
      patchLocalStorage();
      bindLifecycleEvents();
      const redirectResult = await ready.auth.getRedirectResult();
      if (redirectResult && redirectResult.user) {
        await restoreStateForUser(redirectResult.user);
      }
      ready.auth.onAuthStateChanged((user) => {
        currentUser = user || null;
        renderControls();
        if (!user) {
          setStatus("Sign in with Google to sync progress.", "neutral");
          return;
        }

        void restoreStateForUser(user);
      });

      if (ready.auth.currentUser) {
        await restoreStateForUser(ready.auth.currentUser);
      } else {
        setStatus("Sign in with Google to sync progress.", "neutral");
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Google Hosted bridge failed to start.", "error");
      logWarning(error instanceof Error ? error.message : String(error));
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      void boot();
    }, { once: true });
  } else {
    void boot();
  }
})();
`;
}

export function buildFirebaseConfigTemplate(projectSlug: string) {
  return `${JSON.stringify(
    {
      apiKey: "replace-with-web-api-key",
      appId: "replace-with-web-app-id",
      authDomain: `${GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER}.firebaseapp.com`,
      messagingSenderId: "replace-with-sender-id",
      projectId: GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER,
      storageBucket: `${GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER}.firebasestorage.app`,
      allowedEmailDomains: [],
      projectSlug
    },
    null,
    2
  )}\n`;
}

export function buildFirebaseHostingConfig() {
  return `${JSON.stringify(
    {
      hosting: {
        public: ".",
        ignore: [
          "firebase.json",
          ".firebaserc.template",
          "README-deploy.md",
          "firebase-config.template.json",
          "**/.*",
          "**/node_modules/**"
        ],
        rewrites: [
          {
            source: "**",
            destination: "/index.html"
          }
        ]
      }
    },
    null,
    2
  )}\n`;
}

export function buildFirebaseRcTemplate() {
  return `${JSON.stringify(
    {
      projects: {
        default: GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER
      }
    },
    null,
    2
  )}\n`;
}

export function buildGoogleHostedDeployReadme(options: BuildGoogleHostedDeployReadmeOptions) {
  const authMode = options.authMode === "none" ? "none" : "google";
  const storageKeys = normalizeStorageKeys(options.projectSlug, options.storageKeys);
  const bundleBehavior =
    authMode === "none"
      ? `- Hosts the project workspace as a normal web app on Firebase Hosting.
- Google sign-in is disabled for this bundle.
- Keeps browser state local to the current device.
- Keeps hosted reference-path rewrites active so copied resources still resolve.`
      : `- Hosts the project workspace as a normal web app on Firebase Hosting.
- Prompts the learner to \`Sign in with Google\`.
- Saves the tracked browser state to Firestore at \`projects/{slug}/users/{uid}\`.
- Saves a normalized \`progressSummary\` beside the raw state for progress reporting.
- Restores saved progress on later launches from another browser or device.`;
  const firebaseSetup =
    authMode === "none"
      ? `## One-Time Firebase Setup

1. Create or choose a Firebase project for this hosting target.
2. Install the Firebase CLI and log in with an account that can deploy the project.`
      : `## One-Time Firebase Setup

1. Create or choose a Firebase project for this class delivery target.
2. Enable Google Authentication in Firebase Authentication.
3. Enable Firestore in Native mode.
4. Add the hosted domain to Firebase Authentication authorized domains if your school uses a custom domain.
5. Install the Firebase CLI and log in with an account that can deploy the project.`;
  const requiredEdits =
    authMode === "none"
      ? `## Required Bundle Edits Before Deploy

1. Update \`.firebaserc.template\` with the actual Firebase project id and rename it to \`.firebaserc\` if you want CLI project aliases.`
      : `## Required Bundle Edits Before Deploy

1. Create \`firebase-config.json\` beside this file using \`firebase-config.template.json\` as the starting point.
2. Replace every placeholder value with the web app config from Firebase project settings.
3. If you want to restrict sign-in to school domains, fill \`allowedEmailDomains\` in the config JSON.
4. Update \`.firebaserc.template\` with the actual Firebase project id and rename it to \`.firebaserc\` if you want CLI project aliases.`;
  const syncOperations =
    authMode === "none"
      ? `## Manual Verification

1. Open the hosted URL.
2. Confirm no hosted sign-in control appears.
3. Move through the presentation and confirm media/resources still load.`
      : `## Firestore Rules

\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectSlug}/users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

## Progress Report Export

After learners have saved progress, export a CSV from a local machine with access to a Firebase service account:

\`\`\`bash
npm run report:progress -- --firebase-project <firebase-project-id> --course ${options.projectSlug} --out progress.csv --service-account path/to/service-account.json
\`\`\`

## Manual Verification

1. Open the hosted URL in browser A and sign in with a learner Google account.
2. Answer enough content to change one of the tracked storage keys.
3. Wait for the \`Autosave ready\` status.
4. Open the same hosted URL in browser B or another device with the same Google account.
5. Confirm the previous state restores automatically and the printable report still works.`;

  return `# Google Hosted Deployment

- Project title: ${options.projectTitle}
- Project slug: ${options.projectSlug}
- Export target: \`${GOOGLE_HOSTED_EXPORT_LABEL}\`
- Tracked localStorage keys: ${storageKeys.join(", ")}
- Auth mode: \`${authMode}\`

## What This Bundle Does

${bundleBehavior}

${firebaseSetup}

${requiredEdits}

## Deploy Commands

\`\`\`bash
firebase use <project-id>
firebase deploy --only hosting
\`\`\`

If you also manage Firestore rules from the CLI:

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

${syncOperations}
`;
}
