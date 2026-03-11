import { load } from "cheerio";

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

export function findStorageKeysInScriptSources(sourceTexts: string[], fallbackKey: string) {
  const keys = new Set<string>();

  for (const source of sourceTexts) {
    for (const match of source.matchAll(/\bSTORAGE_KEY\s*=\s*['"`]([^'"`]+)['"`]/g)) {
      const key = match[1]?.trim();
      if (key) {
        keys.add(key);
      }
    }

    for (const match of source.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\(\s*['"`]([^'"`]+)['"`]/g)) {
      const key = match[1]?.trim();
      if (key) {
        keys.add(key);
      }
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
  projectSlug: string;
  storageKeys: string[];
  version: ScormVersion;
};

export function buildScormBridgeScript(options: BuildScormBridgeScriptOptions) {
  const config = {
    projectSlug: options.projectSlug,
    version: options.version,
    storageKeys: options.storageKeys.length > 0 ? [...new Set(options.storageKeys)] : [`${options.projectSlug}::workspace-state::v1`],
    maxSuspendChars: options.version === "2004" ? 60000 : 3500
  };

  return `/* Canvas Helper SCORM Bridge */
(function () {
  "use strict";

  const config = ${JSON.stringify(config)};
  const trackedKeySet = new Set(config.storageKeys);
  let api = null;
  let initialized = false;
  let terminated = false;
  let saveTimer = null;
  let localStoragePatched = false;

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

  function applyStateToLocalStorage(state) {
    if (!state || typeof state !== "object" || !state.values || typeof state.values !== "object") {
      return;
    }

    for (const key of trackedKeySet) {
      try {
        const value = state.values[key];
        if (typeof value === "string") {
          window.localStorage.setItem(key, value);
        }
      } catch (_error) {
        // Ignore access issues.
      }
    }
  }

  function flushToLms(reason) {
    if (!api || !initialized) {
      return;
    }

    const payload = collectStateFromLocalStorage();
    payload.reason = reason;
    const serialized = JSON.stringify(payload);

    if (serialized.length > config.maxSuspendChars) {
      logWarning("State payload exceeded suspend_data budget; skipping save.");
      return;
    }

    if (!api.setValue("cmi.suspend_data", serialized)) {
      logWarning("Failed to write cmi.suspend_data.");
      return;
    }

    api.commit();
  }

  function scheduleFlush(reason) {
    if (!api || !initialized) {
      return;
    }

    if (saveTimer) {
      window.clearTimeout(saveTimer);
    }

    saveTimer = window.setTimeout(function () {
      flushToLms(reason);
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

    flushToLms("terminate");
    api.terminate();
    terminated = true;
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
      if (this === window.localStorage && trackedKeySet.has(String(key))) {
        scheduleFlush("setItem:" + String(key));
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

    patchLocalStorage();
    scheduleFlush("init");

    window.addEventListener("beforeunload", terminateSession);
    window.addEventListener("pagehide", terminateSession);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") {
        flushToLms("visibility-hidden");
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
`;
}
