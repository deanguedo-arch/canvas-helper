import { load } from "cheerio";

const GOOGLE_HOSTED_EXPORT_LABEL = "google-hosted";
const GOOGLE_HOSTED_FIREBASE_VERSION = "10.12.2";
const GOOGLE_HOSTED_FIREBASE_CONFIG_PLACEHOLDER = "replace-with-firebase-project-id";

type BuildGoogleHostedBridgeScriptOptions = {
  projectSlug: string;
  storageKeys: string[];
};

type BuildGoogleHostedDeployReadmeOptions = {
  projectSlug: string;
  projectTitle: string;
  storageKeys: string[];
};

function unique(values: string[]) {
  return [...new Set(values)];
}

function normalizeStorageKeys(projectSlug: string, storageKeys: string[]) {
  return storageKeys.length > 0 ? unique(storageKeys) : [`${projectSlug}::workspace-state::v1`];
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

export function buildGoogleHostedBridgeScript(options: BuildGoogleHostedBridgeScriptOptions) {
  const config = {
    firebaseConfigCandidates: ["./firebase-config.json", "./firebase-config.template.json"],
    firebaseSdkVersion: GOOGLE_HOSTED_FIREBASE_VERSION,
    firestoreCollection: "projects",
    metaKey: `__canvas_helper_google_hosted__${options.projectSlug}`,
    projectSlug: options.projectSlug,
    schemaVersion: 1,
    storageKeys: normalizeStorageKeys(options.projectSlug, options.storageKeys)
  };

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
  let lastStatusMessage = "Preparing cloud resume...";
  let lastStatusTone = "working";

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
  }

  function renderControls() {
    if (!actionButton || !secondaryButton) {
      return;
    }

    if (currentUser) {
      actionButton.textContent = "Save now";
      actionButton.disabled = false;
      secondaryButton.hidden = false;
    } else {
      actionButton.textContent = "Sign in with Google";
      actionButton.disabled = false;
      secondaryButton.hidden = true;
    }
  }

  function ensureControls() {
    if (controlHost || typeof document === "undefined") {
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
        ".canvas-helper-google-hosted-controls{position:fixed;right:16px;bottom:16px;z-index:2147483647;display:flex;flex-direction:column;gap:8px;min-width:220px;max-width:min(320px,calc(100vw - 32px));padding:12px 14px;border-radius:14px;background:rgba(17,24,39,.95);color:#f9fafb;box-shadow:0 18px 40px rgba(15,23,42,.35);font:13px/1.4 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}",
        ".canvas-helper-google-hosted-controls[data-tone='error']{background:rgba(127,29,29,.96)}",
        ".canvas-helper-google-hosted-actions{display:flex;gap:8px;flex-wrap:wrap}",
        ".canvas-helper-google-hosted-button,.canvas-helper-google-hosted-secondary{appearance:none;border:0;border-radius:999px;padding:8px 12px;font:600 12px/1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:pointer}",
        ".canvas-helper-google-hosted-button{background:#f59e0b;color:#111827}",
        ".canvas-helper-google-hosted-secondary{background:rgba(255,255,255,.14);color:#f9fafb}",
        ".canvas-helper-google-hosted-status{margin:0;font-size:12px;opacity:.94}",
        ".canvas-helper-google-hosted-status[data-tone='saved']{color:#bbf7d0}",
        ".canvas-helper-google-hosted-status[data-tone='error']{color:#fecaca}",
        ".canvas-helper-google-hosted-status[data-tone='working']{color:#fde68a}",
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
    return {
      reportSnapshot: extractReportSnapshot(state),
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
    const payload = {
      projectSlug: config.projectSlug,
      reportSnapshot: snapshot.reportSnapshot,
      savedAt,
      schemaVersion: config.schemaVersion,
      state: snapshot.state,
      storageKeys: config.storageKeys,
      storageValues: snapshot.storageValues,
      userId: currentUser.uid
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
      if (Object.keys(localSnapshot.storageValues).length > 0) {
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

      window.setTimeout(() => {
        window.location.reload();
      }, 50);
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
  const storageKeys = normalizeStorageKeys(options.projectSlug, options.storageKeys);

  return `# Google Hosted Deployment

- Project title: ${options.projectTitle}
- Project slug: ${options.projectSlug}
- Export target: \`${GOOGLE_HOSTED_EXPORT_LABEL}\`
- Tracked localStorage keys: ${storageKeys.join(", ")}

## What This Bundle Does

- Hosts the project workspace as a normal web app on Firebase Hosting.
- Prompts the learner to \`Sign in with Google\`.
- Saves the tracked browser state to Firestore at \`projects/{slug}/users/{uid}\`.
- Restores saved progress on later launches from another browser or device.

## One-Time Firebase Setup

1. Create or choose a Firebase project for this class delivery target.
2. Enable Google Authentication in Firebase Authentication.
3. Enable Firestore in Native mode.
4. Add the hosted domain to Firebase Authentication authorized domains if your school uses a custom domain.
5. Install the Firebase CLI and log in with an account that can deploy the project.

## Required Bundle Edits Before Deploy

1. Create \`firebase-config.json\` beside this file using \`firebase-config.template.json\` as the starting point.
2. Replace every placeholder value with the web app config from Firebase project settings.
3. If you want to restrict sign-in to school domains, fill \`allowedEmailDomains\` in the config JSON.
4. Update \`.firebaserc.template\` with the actual Firebase project id and rename it to \`.firebaserc\` if you want CLI project aliases.

## Firestore Rules

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

## Deploy Commands

\`\`\`bash
firebase use <project-id>
firebase deploy --only hosting
\`\`\`

If you also manage Firestore rules from the CLI:

\`\`\`bash
firebase deploy --only firestore:rules
\`\`\`

## Manual Verification

1. Open the hosted URL in browser A and sign in with a learner Google account.
2. Answer enough content to change one of the tracked storage keys.
3. Wait for the \`Autosave ready\` status.
4. Open the same hosted URL in browser B or another device with the same Google account.
5. Confirm the previous state restores automatically and the printable report still works.
`;
}
