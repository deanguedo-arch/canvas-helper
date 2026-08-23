/* Canvas Helper SCORM Bridge */
(function () {
  "use strict";

  const config = {"projectSlug":"ela20-1-novel-study-clean","version":"2004","storageKeys":["canvas-helper:ela20-1-novel-study-clean:complete","canvas-helper:ela20-1-novel-study-clean:responses","canvas-helper:ela20-1-novel-study-clean:manual-evidence-notes"],"maxSuspendChars":60000};
  const trackedKeySet = new Set(config.storageKeys);
  const statusModel = config.version === "2004"
    ? {
        completionKey: "cmi.completion_status",
        exitKey: "cmi.exit",
        incompleteValue: "incomplete"
      }
    : {
        completionKey: "cmi.core.lesson_status",
        exitKey: "cmi.core.exit",
        incompleteValue: "incomplete"
      };
  let api = null;
  let initialized = false;
  let terminated = false;
  let saveTimer = null;
  let localStoragePatched = false;
  let controlHost = null;
  let lastPersistErrorMessage = "";

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
    for (const key of trackedKeySet) {
      try {
        const value = window.localStorage.getItem(key);
        if (typeof value === "string" && value.length > 0) {
          values[key] = value;
        }
      } catch (_error) {
        // Ignore access issues.
      }
    }

    return {
      version: 1,
      projectSlug: config.projectSlug,
      savedAt: new Date().toISOString(),
      values: values
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
        // Ignore access issues.
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

  function announceStatus(message, isError) {
    if (!controlHost) {
      return;
    }

    const statusNode = controlHost.querySelector("[data-scorm-status]");
    if (!statusNode) {
      return;
    }

    statusNode.textContent = message;
    statusNode.style.color = isError ? "#b91c1c" : "#334155";
  }

  function persistToLms(reason, exitValue) {
    lastPersistErrorMessage = "";
    if (!api || !initialized || terminated) {
      lastPersistErrorMessage = "Progress could not be saved to Brightspace. Keep this tab open and try again.";
      return false;
    }

    const payload = collectStateFromLocalStorage();
    payload.reason = reason;
    const serialized = JSON.stringify(payload);

    if (serialized.length > config.maxSuspendChars) {
      logWarning("State payload exceeded suspend_data budget; skipping save.");
      lastPersistErrorMessage = "This course has more saved work than Brightspace can accept. Your last successful LMS save is still safe. Keep this tab open and remove unneeded draft evidence before trying again.";
      announceStatus(lastPersistErrorMessage, true);
      return false;
    }

    if (!ensureCompletionStatus()) {
      lastPersistErrorMessage = "Brightspace rejected the course completion state. Your last successful LMS save is still safe.";
      return false;
    }

    if (!api.setValue("cmi.suspend_data", serialized)) {
      logWarning("Failed to write cmi.suspend_data.");
      lastPersistErrorMessage = "Brightspace rejected the saved course data. Your last successful LMS save is still safe.";
      return false;
    }

    if (exitValue && !api.setValue(statusModel.exitKey, exitValue)) {
      logWarning("Failed to write " + statusModel.exitKey + ".");
      lastPersistErrorMessage = "Brightspace could not suspend this attempt. Your last successful LMS save is still safe.";
      return false;
    }

    if (!api.commit()) {
      logWarning("Failed to commit SCORM data.");
      lastPersistErrorMessage = "Brightspace could not commit this save. Your last successful LMS save is still safe.";
      return false;
    }

    return true;
  }

  function save() {
    if (saveTimer) {
      window.clearTimeout(saveTimer);
      saveTimer = null;
    }

    const saved = persistToLms("manual-save");
    announceStatus(saved ? "Progress saved." : (lastPersistErrorMessage || "Save failed. Try again before closing."), !saved);
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

    api.terminate();
    terminated = true;
    announceStatus("Progress saved. Close this tab or window to return to Brightspace.");

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
    if (!api || !initialized) {
      return;
    }

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

    persistToLms("terminate", "suspend");
    api.terminate();
    terminated = true;
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

    controlHost = document.createElement("div");
    controlHost.setAttribute("data-scorm-controls", "true");
    controlHost.setAttribute("aria-live", "polite");
    controlHost.style.position = "fixed";
    controlHost.style.right = "16px";
    controlHost.style.bottom = "16px";
    controlHost.style.zIndex = "2147483647";
    controlHost.style.display = "flex";
    controlHost.style.alignItems = "center";
    controlHost.style.gap = "12px";
    controlHost.style.padding = "12px 14px";
    controlHost.style.borderRadius = "14px";
    controlHost.style.background = "rgba(15, 23, 42, 0.92)";
    controlHost.style.boxShadow = "0 16px 40px rgba(15, 23, 42, 0.28)";
    controlHost.style.fontFamily = "Inter, Arial, sans-serif";

    const statusNode = document.createElement("div");
    statusNode.setAttribute("data-scorm-status", "true");
    statusNode.textContent = "Use Save and Exit before closing.";
    statusNode.style.color = "#e2e8f0";
    statusNode.style.fontSize = "12px";
    statusNode.style.lineHeight = "1.4";

    const exitButton = document.createElement("button");
    exitButton.type = "button";
    exitButton.setAttribute("data-scorm-save-exit", "true");
    exitButton.textContent = "Save and Exit";
    exitButton.style.border = "0";
    exitButton.style.borderRadius = "999px";
    exitButton.style.background = "#f8fafc";
    exitButton.style.color = "#0f172a";
    exitButton.style.fontWeight = "700";
    exitButton.style.fontSize = "12px";
    exitButton.style.padding = "10px 14px";
    exitButton.style.cursor = "pointer";
    exitButton.addEventListener("click", saveAndExit);

    controlHost.appendChild(statusNode);
    controlHost.appendChild(exitButton);
    document.body.appendChild(controlHost);
  }

  function patchLocalStorage() {
    if (localStoragePatched || typeof Storage === "undefined") {
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
    const parsedState = tryParseJson(existingSuspendData);
    if (parsedState) {
      applyStateToLocalStorage(parsedState);
    }

    ensureCompletionStatus();
    patchLocalStorage();
    installControls();
    window.__canvasHelperScorm = {
      save: save,
      saveAndExit: saveAndExit
    };
    scheduleFlush("init");

    window.addEventListener("beforeunload", terminateSession);
    window.addEventListener("pagehide", terminateSession);
    window.addEventListener("storage", handleStorageEvent);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        persistToLms("visibility-hidden");
      }
    });

    return true;
  }

  const bootedImmediately = boot();

  if (!bootedImmediately) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", boot, { once: true });
    } else {
      window.setTimeout(boot, 0);
    }
  }
})();
