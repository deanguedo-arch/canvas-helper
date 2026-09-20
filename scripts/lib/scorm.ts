import { load } from "cheerio";
import { buildScormStateCodecRuntime } from "./scorm-state-codec.js";
import { buildScormTrackingRuntime, type ScormTrackingContract } from "./scorm-tracking.js";

export type ScormVersion = "2004" | "1.2";

const SCORM_2004_VERSION_ALIASES = new Set(["2004", "2004_4th", "2004-4th", "2004_4", "2004-4"]);
const SCORM_12_VERSION_ALIASES = new Set(["1.2", "12", "1_2", "1-2"]);

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toPosixPath(value: string) {
  return value.replace(/\\/g, "/");
}

export function normalizeScormVersion(value: string | undefined): ScormVersion | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (SCORM_2004_VERSION_ALIASES.has(normalized)) {
    return "2004";
  }

  if (SCORM_12_VERSION_ALIASES.has(normalized)) {
    return "1.2";
  }

  return null;
}

export function getScormExportLabel(version: ScormVersion) {
  return version === "2004" ? "scorm-2004" : "scorm-1-2";
}

export function getScormZipLabel(version: ScormVersion) {
  return version === "2004" ? "scorm-2004" : "scorm-1-2";
}

function addStorageKey(keys: Set<string>, value: string | undefined) {
  const key = value?.trim();
  if (!key || key.includes("${")) {
    return;
  }

  keys.add(key);
}

function resolveTemplateValue(value: string, variables: Map<string, string>) {
  let resolved = value;
  for (const match of value.matchAll(/\$\{([^}]+)\}/g)) {
    const expression = match[1]?.trim() ?? "";
    const replacement = variables.get(expression);
    if (!replacement) {
      continue;
    }

    resolved = resolved.replace(match[0], replacement);
  }

  return resolved;
}

function collectStringVariables(sourceTexts: string[]) {
  const variables = new Map<string, string>();

  for (const source of sourceTexts) {
    for (const match of source.matchAll(/["']storageKey["']\s*:\s*["'`]([^"'`]+)["'`]/g)) {
      const value = match[1]?.trim();
      if (value) {
        variables.set("courseShellData.storageKey", value);
      }
    }
  }

  for (const source of sourceTexts) {
    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*String\(\s*courseShellData\.storageKey\s*\|\|\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
      const name = match[1]?.trim();
      const fallback = match[2]?.trim();
      const value = variables.get("courseShellData.storageKey") ?? fallback;
      if (name && value) {
        variables.set(name, value);
      }
    }

    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*[^;\n]*\|\|\s*["'`]([^"'`]+)["'`]/g)) {
      const name = match[1]?.trim();
      const value = match[2]?.trim();
      if (name && value && !variables.has(name)) {
        variables.set(name, value);
      }
    }

    for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*["']([^"']+)["']/g)) {
      const name = match[1]?.trim();
      const value = match[2]?.trim();
      if (name && value && !variables.has(name)) {
        variables.set(name, value);
      }
    }
  }

  for (let pass = 0; pass < 4; pass += 1) {
    let changed = false;
    for (const source of sourceTexts) {
      for (const match of source.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*`([^`]+)`/g)) {
        const name = match[1]?.trim();
        const template = match[2] ?? "";
        const value = resolveTemplateValue(template, variables);
        if (name && value && !value.includes("${") && variables.get(name) !== value) {
          variables.set(name, value);
          changed = true;
        }
      }
    }

    if (!changed) {
      break;
    }
  }

  return variables;
}

export function findStorageKeysInScriptSources(sourceTexts: string[], fallbackKey: string) {
  const keys = new Set<string>();
  const variables = collectStringVariables(sourceTexts);

  for (const [name, value] of variables.entries()) {
    if (/(?:^|_)(?:STORAGE|STATE|UI)_KEY$/i.test(name)) {
      addStorageKey(keys, value);
    }
  }

  for (const source of sourceTexts) {
    for (const match of source.matchAll(/\b(?:[A-Za-z_$][\w$]*_)?(?:STORAGE|STATE)_KEY\b\s*=\s*['"`]([^'"`]+)['"`]/g)) {
      addStorageKey(keys, match[1]);
    }

    for (const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g)) {
      addStorageKey(keys, match[1]);
    }

    for (const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*`([^`]+)`/g)) {
      addStorageKey(keys, resolveTemplateValue(match[1] ?? "", variables));
    }

    for (const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*([A-Za-z_$][\w$]*)/g)) {
      addStorageKey(keys, variables.get(match[1] ?? ""));
    }
  }

  if (keys.size === 0) {
    keys.add(fallbackKey);
  }

  return [...keys];
}

export function injectScormBridgeTag(html: string, bridgeRelativePath = "./scorm-bridge.js") {
  const $ = load(html);

  const existingBridge = $(`script[src="${bridgeRelativePath}"]`).toArray();
  if (existingBridge.length > 0) {
    return $.html();
  }

  const scriptNode = $("<script></script>");
  scriptNode.attr("src", bridgeRelativePath);

  const localScriptNode = $("script").toArray().find((node) => {
    const src = ($(node).attr("src") ?? "").trim();
    return src.length === 0 || !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(src);
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

type BuildScormManifestOptions = {
  identifier: string;
  title: string;
  entrypoint: string;
  files: string[];
  version: ScormVersion;
};

function sanitizeManifestIdentifier(value: string) {
  const cleaned = value.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned || "canvas-helper-scorm";
}

export function buildScormManifest(options: BuildScormManifestOptions) {
  const manifestId = sanitizeManifestIdentifier(options.identifier);
  const title = xmlEscape(options.title || "Canvas Helper Activity");
  const entrypoint = xmlEscape(toPosixPath(options.entrypoint));
  const normalizedFiles = [...new Set(options.files.map((filePath) => toPosixPath(filePath)).sort())]
    .filter((filePath) => filePath !== "imsmanifest.xml");
  const fileRows = normalizedFiles
    .map((filePath) => `      <file href="${xmlEscape(filePath)}" />`)
    .join("\n");

  if (options.version === "2004") {
    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xmlEscape(manifestId)}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
    http://www.adlnet.org/xsd/adlcp_v1p3 adlcp_v1p3.xsd
    http://www.adlnet.org/xsd/adlseq_v1p3 adlseq_v1p3.xsd
    http://www.adlnet.org/xsd/adlnav_v1p3 adlnav_v1p3.xsd
    http://www.imsglobal.org/xsd/imsss imsss_v1p0.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormType="sco" href="${entrypoint}">
${fileRows}
    </resource>
  </resources>
</manifest>
`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${xmlEscape(manifestId)}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="
    http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
    http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-1">
    <organization identifier="ORG-1">
      <title>${title}</title>
      <item identifier="ITEM-1" identifierref="RES-1">
        <title>${title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormType="sco" href="${entrypoint}">
${fileRows}
    </resource>
  </resources>
</manifest>
`;
}

type BuildScormBridgeScriptOptions = {
  tracking?: ScormTrackingContract | null;
  projectSlug: string;
  storageKeys: string[];
  version: ScormVersion;
};

export function buildScormBridgeScript(options: BuildScormBridgeScriptOptions) {
  const config = {
    managedState: options.tracking?.state?.adapter === "course-state-v1",
    projectSlug: options.projectSlug,
    tracking: options.tracking ?? null,
    version: options.version,
    storageKeys: options.storageKeys.length > 0 ? [...new Set(options.storageKeys)] : [`${options.projectSlug}::workspace-state::v1`],
    maxSuspendChars: options.version === "2004" ? 60000 : 3500
  };

  return `/* Canvas Helper SCORM Bridge */
(function () {
  "use strict";

  const config = ${JSON.stringify(config)};
  const trackedKeySet = new Set(config.storageKeys);
  const statusModel = config.version === "2004"
    ? {
        completionKey: "cmi.completion_status",
        exitKey: "cmi.exit",
        incompleteValue: "incomplete",
        completedValue: "completed"
      }
    : {
        completionKey: "cmi.core.lesson_status",
        exitKey: "cmi.core.exit",
        incompleteValue: "incomplete",
        completedValue: "completed"
      };
  let api = null;
  let initialized = false;
  let terminated = false;
  let saveTimer = null;
  let localStoragePatched = false;
  let controlHost = null;
  let lastPersistErrorMessage = "";
  let restoreBlocked = false;
  let courseState = null;
  let courseCompletedIds = [];
  let courseReady = !config.managedState;
  let courseFlush = null;
  let courseScope = "";
  let learnerId = "";
  let courseError = "";
  let preparing = null;

${buildScormStateCodecRuntime()}

  function connectionState() {
    return restoreBlocked ? "blocked" : initialized && !terminated ? "connected" : api ? "unavailable" : "preview";
  }
  function readCourseState() {
    if (restoreBlocked || (api && !initialized)) throw new Error(lastPersistErrorMessage || "Brightspace could not open this attempt. Existing work has been retained.");
    return courseState === null ? null : JSON.parse(JSON.stringify(courseState));
  }
  function publishCourseState(value, completedIds) {
    if (!config.managedState || !initialized || restoreBlocked || terminated) throw new Error(lastPersistErrorMessage || "Brightspace saving is unavailable.");
    if (!Array.isArray(completedIds) || !completedIds.every(id => typeof id === "string")) throw new Error("Invalid required completion IDs.");
    // Validate and materialize before replacing the last committed snapshot.
    const copy = JSON.parse(JSON.stringify(value));
    stateCodec.encode(JSON.stringify(copy));
    courseState = copy;
    courseCompletedIds = Array.from(new Set(completedIds));
    courseError = "";
    scheduleFlush("course-state");
  }
  function registerCourse(options) {
    if (!config.managedState) throw new Error("This package has no course state adapter contract.");
    courseFlush = options && options.flush;
    if (typeof courseFlush !== "function") throw new Error("The course must provide a save flush function.");
    courseReady = true;
    scheduleFlush("course-ready");
  }
  function prepareSave() {
    if (!courseFlush) return Promise.resolve();
    if (!preparing) preparing = Promise.resolve().then(courseFlush).finally(function () { preparing = null; });
    return preparing;
  }
  function saveAsync() {
    return prepareSave().then(save).catch(function (error) {
      courseError = String(error.message || error);
      announceStatus(courseError, true);
      return false;
    });
  }
  function exposeBridge() {
    window.__canvasHelperScorm = {
      save: save, saveAsync: saveAsync, saveAndExit: saveAndExit, markCompleted: markCompleted,
      connectionState: connectionState, readCourseState: readCourseState,
      publishCourseState: publishCourseState, registerCourse: registerCourse,
      scopeKey: function (key) { return initialized && config.managedState ? key + ":lms:" + courseScope : key; },
      learner: function () { return learnerId; },
      failCourseSave: function (error) { courseError = String(error.message || error); announceStatus(courseError, true); },
      lastError: function () { return courseError || lastPersistErrorMessage; }
    };
  }

${buildScormTrackingRuntime()}

  function logWarning(message) {
    try {
      console.warn("[scorm-bridge]", message);
    } catch (_error) {
      // No-op.
    }
  }

  function tryParseJson(value) {
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value);
    } catch (_error) {
      return null;
    }
  }

  function findApiInHierarchy(startWindow, apiName) {
    let current = startWindow;
    let depth = 0;

    while (current && depth < 12) {
      try {
        if (current[apiName]) {
          return current[apiName];
        }
      } catch (_error) {
        // Ignore cross-origin access errors.
      }

      try {
        if (current.parent === current) {
          break;
        }
        current = current.parent;
      } catch (_error) {
        break;
      }

      depth += 1;
    }

    try {
      if (startWindow.opener && startWindow.opener[apiName]) {
        return startWindow.opener[apiName];
      }
    } catch (_error) {
      // Ignore opener access errors.
    }

    return null;
  }

  function toSuccess(result) {
    return result !== false && result !== "false";
  }

  function buildApiAdapter() {
    if (config.version === "2004") {
      const handle = findApiInHierarchy(window, "API_1484_11");
      if (!handle) {
        return null;
      }

      return {
        initialize: function () {
          return toSuccess(handle.Initialize(""));
        },
        terminate: function () {
          return toSuccess(handle.Terminate(""));
        },
        getValue: function (key) {
          return String(handle.GetValue(key) || "");
        },
        setValue: function (key, value) {
          return toSuccess(handle.SetValue(key, value));
        },
        diagnostic: function () {
          const code = typeof handle.GetLastError === "function" ? handle.GetLastError() : "unknown";
          return String(code) + (typeof handle.GetDiagnostic === "function" ? " " + handle.GetDiagnostic(code) : "");
        },
        commit: function () {
          return toSuccess(handle.Commit(""));
        }
      };
    }

    const handle = findApiInHierarchy(window, "API");
    if (!handle) {
      return null;
    }

    return {
      initialize: function () {
        return toSuccess(handle.LMSInitialize(""));
      },
      terminate: function () {
        return toSuccess(handle.LMSFinish(""));
      },
      getValue: function (key) {
        return String(handle.LMSGetValue(key) || "");
      },
      setValue: function (key, value) {
        return toSuccess(handle.LMSSetValue(key, value));
      },
      commit: function () {
        return toSuccess(handle.LMSCommit(""));
      }
    };
  }

  function collectStateFromLocalStorage() {
    const values = {};
    for (const key of config.managedState ? [] : trackedKeySet) {
      try {
        const value = window.localStorage.getItem(key);
        if (typeof value === "string" && value.length > 0) {
          values[key] = value;
        }
      } catch (_error) {
        throw new Error("Browser storage is unavailable. Keep this page open; work was not saved to Brightspace.");
      }
    }

    return {
      version: 1,
      projectSlug: config.projectSlug,
      savedAt: new Date().toISOString(),
      values: values,
      ...(config.managedState ? {scope: courseScope, learnerId: learnerId, course: {schemaVersion: 1, data: stateCodec.encode(JSON.stringify(courseState)), completedIds: courseCompletedIds}} : {}),
      tracking: collectTracking()
    };
  }

  function shouldInitializeIncompleteStatus(value) {
    const normalized = String(value || "").trim().toLowerCase();
    return !normalized || normalized === "not attempted" || normalized === "unknown";
  }

  function applyStateToLocalStorage(state) {
    if (!state || typeof state !== "object" || !state.values || typeof state.values !== "object") {
      return;
    }

    for (const entry of Object.entries(state.values)) {
      const key = entry[0];
      const value = entry[1];
      try {
        if (typeof value === "string") {
          trackedKeySet.add(String(key));
          window.localStorage.setItem(key, value);
        }
      } catch (_error) {
        throw new Error("Browser storage is unavailable; saved work could not be restored. Reopen this activity before continuing.");
      }
    }
  }

  function ensureCompletionStatus() {
    if (!api || !initialized) {
      return true;
    }

    const currentValue = api.getValue(statusModel.completionKey);
    if (!shouldInitializeIncompleteStatus(currentValue)) {
      return true;
    }

    if (!api.setValue(statusModel.completionKey, statusModel.incompleteValue)) {
      logWarning("Failed to write " + statusModel.completionKey + ".");
      return false;
    }

    return true;
  }

  function automaticControls() { return document.body && document.body.getAttribute && document.body.getAttribute("data-scorm-save-mode") === "automatic"; }
  function announceStatus(message, isError) {
    if (config.managedState && typeof window.dispatchEvent === "function" && typeof window.CustomEvent === "function") {
      window.dispatchEvent(new window.CustomEvent("canvas-helper:scorm-status", {detail: {message: message, error: Boolean(isError)}}));
    }
    if (!controlHost) { return; }
    if (automaticControls()) controlHost.style.display = isError ? "flex" : "none";

    const statusNode = controlHost.querySelector("[data-scorm-status]");
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.style.color = isError ? "#b91c1c" : "#334155";
  }

  function persistToLms(reason, exitValue) {
    let saved = false;
    try { saved = persistStateToLms(reason, exitValue); }
    catch (error) { lastPersistErrorMessage = String(error.message || "Brightspace save failed. Keep this page open."); }
    announceStatus(saved ? "Saved to Brightspace at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + actionReportWarning : lastPersistErrorMessage, !saved);
    return saved;
  }

  function persistStateToLms(reason, exitValue) {
    lastPersistErrorMessage = "";
    if (!api || !initialized || terminated) {
      lastPersistErrorMessage = "Progress could not be saved to Brightspace. Keep this tab open and try again.";
      return false;
    }

    if (config.managedState && (!courseReady || courseState === null || courseError)) {
      lastPersistErrorMessage = courseError || "Opening saved course work…";
      return false;
    }
    announceStatus("Saving to Brightspace…", false);
    let payload;
    let progress;
    try {
      payload = collectStateFromLocalStorage();
      progress = completionProgress();
    } catch (error) {
      lastPersistErrorMessage = String(error.message || "Saved work could not be read. Keep this page open.");
      announceStatus(lastPersistErrorMessage, true);
      return false;
    }
    payload.reason = reason;
    const serialized = JSON.stringify(payload);

    if (serialized.length > config.maxSuspendChars) {
      logWarning("State payload exceeded suspend_data budget; skipping save.");
      lastPersistErrorMessage = "This course has more saved work than Brightspace can accept. Your last successful LMS save is still safe. Keep this tab open and download a process report or backup; nothing has been shortened.";
      announceStatus(lastPersistErrorMessage, true);
      return false;
    }

    if (!ensureCompletionStatus()) {
      lastPersistErrorMessage = "Brightspace rejected the course completion state. Keep this page open and retry saving.";
      return false;
    }

    if (!api.setValue("cmi.suspend_data", serialized)) {
      logWarning("Failed to write cmi.suspend_data.");
      lastPersistErrorMessage = "Brightspace rejected the saved course data. Keep this page open and retry saving.";
      return false;
    }

    writeTracking(progress);

    if (exitValue && !api.setValue(statusModel.exitKey, exitValue)) {
      logWarning("Failed to write " + statusModel.exitKey + ".");
      lastPersistErrorMessage = "Brightspace could not suspend this attempt. Keep this page open and retry saving.";
      return false;
    }

    if (!api.commit()) {
      logWarning("Failed to commit SCORM data.");
      lastPersistErrorMessage = "Brightspace could not commit this save. Keep this page open and retry saving.";
      return false;
    }
    commitActionReports();

    return true;
  }

  function save() {
    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }

    const saved = persistToLms("manual-save");
    return saved;
  }

  function markCompleted() {
    if (!api || !initialized || terminated) {
      return false;
    }

    // Contract-driven courses must meet their required list; preserve the legacy
    // explicit completion hook only for courses without a completion contract.
    if (trackingContract && trackingContract.completion) {
      try { if (completionProgress() !== 1) return false; } catch (_) { return false; }
    }
    completionRequested = true;

    const saved = persistToLms("completion");
    announceStatus(
      saved ? "Unit complete. Progress saved." : (lastPersistErrorMessage || "Completion could not be saved."),
      !saved
    );
    return saved;
  }

  function saveAndExit() {
    if (!api || !initialized || terminated) {
      return false;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }

    const saved = persistToLms("save-and-exit", "suspend");
    if (!saved) {
      announceStatus(lastPersistErrorMessage || "Save failed. Keep this tab open and try again.", true);
      return false;
    }

    if (!api.terminate()) {
      announceStatus("Work saved, but Brightspace could not close the session. Try Save and Exit again.", true);
      return false;
    }
    terminated = true;
    stopTracking();
    announceStatus("Progress saved. Close this tab or window to return to Brightspace." + actionReportWarning);

    const saveButton = controlHost ? controlHost.querySelector("[data-scorm-save]") : null;
    if (saveButton) saveButton.setAttribute("disabled", "disabled");
    const exitButton = controlHost ? controlHost.querySelector("[data-scorm-save-exit]") : null;
    if (exitButton) {
      exitButton.textContent = "Saved";
      exitButton.setAttribute("disabled", "disabled");
      exitButton.style.opacity = "0.7";
      exitButton.style.cursor = "default";
    }

    return true;
  }

  function scheduleFlush(reason) {
    if (terminated) {
      announceStatus("Session closed. Reopen this activity in Brightspace before making more changes.", true);
      return;
    }
    if (!api || !initialized || terminated) {
      return;
    }

    announceStatus("Changes pending save to Brightspace…", false);
    if (saveTimer) {
      window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(function () {
      persistToLms(reason);
    }, 500);
  }

  function terminateSession() {
    if (!api || !initialized || terminated) {
      return;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }

    if (!persistToLms("terminate", "suspend")) return false;
    if (!api.terminate()) {
      announceStatus("Work saved, but Brightspace could not close the session. Try Save and Exit again.", true);
      return false;
    }
    terminated = true;
    stopTracking();
  }

  function handleStorageEvent(event) {
    if (!event) {
      return;
    }

    if (!(event.storageArea === window.localStorage)) {
      return;
    }

    if (event.key === null) {
      scheduleFlush("storage:clear");
      return;
    }

    trackedKeySet.add(String(event.key));
    scheduleFlush("storage:" + String(event.key));
  }

  function installControls() {
    if (controlHost) {
      return;
    }
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", installControls, { once: true });
      return;
    }

    if (config.managedState) {
      const nativeStatus = document.querySelector("#save-status,[data-local-status]");
      if (nativeStatus && nativeStatus.parentElement) {
        controlHost = nativeStatus.parentElement;
        controlHost.setAttribute("data-scorm-controls", "true");
        nativeStatus.setAttribute("data-scorm-status", "true");
        nativeStatus.setAttribute("role", "status");
        nativeStatus.textContent = restoreBlocked ? lastPersistErrorMessage : initialized ? "Opening saved course work…" : "Not connected to Brightspace. LMS saving is unavailable.";
        const retry = document.querySelector('[data-action="save"]') || document.createElement("button");
        retry.setAttribute("data-scorm-save", "true");
        retry.type = "button";
        retry.textContent = "Save now";
        if (!initialized) retry.setAttribute("disabled", "disabled");
        retry.addEventListener("click", function (event) { event.preventDefault(); event.stopImmediatePropagation(); saveAsync(); }, true);
        if (!retry.parentElement) controlHost.appendChild(retry);
        return;
      }
    }
    controlHost = document.createElement("div");
    controlHost.setAttribute("data-scorm-controls", "true");
    controlHost.setAttribute("aria-live", "polite");
    controlHost.style.position = "fixed";
    controlHost.style.right = "16px";
    controlHost.style.bottom = "16px";
    controlHost.style.maxWidth = "calc(100vw - 32px)";
    controlHost.style.boxSizing = "border-box";
    controlHost.style.zIndex = "2147483647";
    controlHost.style.display = "flex";
    controlHost.style.alignItems = "center";
    controlHost.style.gap = "12px";
    controlHost.style.padding = "12px 14px";
    controlHost.style.flexWrap = "wrap";
    controlHost.style.border = "1px solid #cbd5e1";
    controlHost.style.borderRadius = "6px";
    controlHost.style.background = "#f8fafc";
    controlHost.style.fontFamily = "inherit";

    const statusNode = document.createElement("div");
    statusNode.setAttribute("data-scorm-status", "true");
    statusNode.setAttribute("role", "status");
    statusNode.textContent = restoreBlocked ? lastPersistErrorMessage : initialized ? "Connecting save status…" : "Not connected to Brightspace. LMS saving is unavailable.";
    statusNode.style.color = "#334155";
    statusNode.style.fontSize = "12px";
    statusNode.style.lineHeight = "1.4";

    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.setAttribute("data-scorm-save-exit", "true");
    exitButton.textContent = "Save and Exit";
    exitButton.style.border = "1px solid #94a3b8";
    exitButton.style.borderRadius = "6px";
    exitButton.style.background = "#f8fafc";
    exitButton.style.color = "#0f172a";
    exitButton.style.fontWeight = "700";
    exitButton.style.fontSize = "12px";
    exitButton.style.padding = "10px 14px";
    exitButton.style.cursor = "pointer";
    exitButton.addEventListener("click", function () { prepareSave().then(saveAndExit).catch(function (error) { courseError = String(error.message || error); announceStatus(courseError, true); }); });
    if (!initialized) exitButton.setAttribute("disabled", "disabled");

    const saveButton = document.createElement("button");
    saveButton.type = "button";
    saveButton.textContent = "Save now";
    saveButton.setAttribute("data-scorm-save", "true");
    saveButton.addEventListener("click", saveAsync);
    if (!initialized) saveButton.setAttribute("disabled", "disabled");

    controlHost.appendChild(statusNode);
    controlHost.appendChild(saveButton);
    if (!config.managedState && !automaticControls()) controlHost.appendChild(exitButton);
    document.body.appendChild(controlHost);
    if (automaticControls() && initialized && !restoreBlocked) controlHost.style.display = "none";
  }

  function patchLocalStorage() {
    if (config.managedState || localStoragePatched || typeof Storage === "undefined") {
      return;
    }

    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    const originalClear = Storage.prototype.clear;

    Storage.prototype.setItem = function (key, value) {
      originalSetItem.call(this, key, value);
      if (this === window.localStorage) {
        const normalizedKey = String(key);
        trackedKeySet.add(normalizedKey);
        scheduleFlush("setItem:" + normalizedKey);
      }
    };

    Storage.prototype.removeItem = function (key) {
      originalRemoveItem.call(this, key);
      if (this === window.localStorage && trackedKeySet.has(String(key))) {
        scheduleFlush("removeItem:" + String(key));
      }
    };

    Storage.prototype.clear = function () {
      originalClear.call(this);
      scheduleFlush("clear");
    };

    localStoragePatched = true;
  }

  function boot() {
    if (restoreBlocked) return false;
    api = buildApiAdapter();
    if (!api) {
      return false;
    }

    initialized = api.initialize();
    if (!initialized) {
      logWarning("Unable to initialize SCORM API session.");
      return false;
    }

    const existingSuspendData = api.getValue("cmi.suspend_data");
    let parsedState = tryParseJson(existingSuspendData);
    try {
      if (config.managedState) {
        learnerId = api.getValue(config.version === "2004" ? "cmi.learner_id" : "cmi.core.student_id");
        if (!learnerId) throw new Error("Brightspace did not supply a learner identity. Saving is stopped to protect private work.");
        const legacyId = config.tracking.state.legacyCourseId;
        if (existingSuspendData && legacyId && (!parsedState || parsedState.version !== 1)) {
          const legacy = JSON.parse(stateCodec.decode(existingSuspendData));
          if (legacy.schema !== 1 || legacy.course !== legacyId || !legacy.fields || !legacy.done || !legacy.tools) throw new Error("This older Chemistry save does not match the course.");
          courseState = legacy;
          courseCompletedIds = Object.keys(legacy.done).filter(id => legacy.done[id] === true);
          parsedState = {version: 1, projectSlug: config.projectSlug, values: {}};
        }
        if (parsedState && parsedState.learnerId && parsedState.learnerId !== learnerId) throw new Error("This saved work belongs to another learner.");
        if (parsedState && !parsedState.course && !courseState && Object.keys(parsedState.values || {}).length) throw new Error("This older package save needs a course-specific migration before opening. It has not been overwritten; keep the previous package and export a backup for recovery.");
        if (parsedState && parsedState.course) {
          if (parsedState.course.schemaVersion !== 1 || typeof parsedState.course.data !== "string" || !Array.isArray(parsedState.course.completedIds) || !parsedState.course.completedIds.every(id => typeof id === "string")) throw new Error("The saved course snapshot is invalid.");
          courseState = JSON.parse(stateCodec.decode(parsedState.course.data));
          courseCompletedIds = parsedState.course.completedIds;
        }
        if (parsedState && parsedState.scope && !/^[a-zA-Z0-9-]{1,100}$/.test(parsedState.scope)) throw new Error("Invalid learner save scope.");
        courseScope = parsedState && parsedState.scope || Array.from(window.crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, "0")).join("");
      }
      if (existingSuspendData && (!parsedState || parsedState.version !== 1 || parsedState.projectSlug !== config.projectSlug || !parsedState.values || typeof parsedState.values !== "object" || Array.isArray(parsedState.values) || !Object.values(parsedState.values).every(value => typeof value === "string"))) {
        throw new Error("Brightspace saved work could not be restored for this course. Automatic saving is stopped to protect it. Reopen the correct activity or contact your teacher.");
      }
      if (parsedState) {
        if (!config.managedState) applyStateToLocalStorage(parsedState);
        restoreTracking(parsedState.tracking);
      } else {
        restoreTracking(null);
      }
    } catch (error) {
      restoreBlocked = true;
      initialized = false;
      lastPersistErrorMessage = String(error.message);
      exposeBridge();
      return false;
    }

    ensureCompletionStatus();
    patchLocalStorage();
    installControls();
    exposeBridge();
    if (typeof window.dispatchEvent === "function" && typeof window.CustomEvent === "function") {
      window.dispatchEvent(new window.CustomEvent("canvas-helper:scorm-ready"));
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startTracking, { once: true });
    else startTracking();
    scheduleFlush("init");

    window.addEventListener("beforeunload", terminateSession);
    window.addEventListener("pagehide", terminateSession);
    window.addEventListener("storage", handleStorageEvent);

    return true;
  }

  if (config.managedState) exposeBridge();
  const bootedImmediately = boot();

  if (!bootedImmediately) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () { if (!boot()) installControls(); }, { once: true });
    } else {
      window.setTimeout(function () { if (!boot()) installControls(); }, 0);
    }
  }
})();
`;
}
