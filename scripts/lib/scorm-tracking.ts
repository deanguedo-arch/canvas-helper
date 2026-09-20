import { buildScormActionsRuntime } from "./scorm-actions.js";
import { load } from "cheerio";

/** Canonical optional workspace/scorm-tracking.json. No executable selectors or code. */
export type ScormTrackingContract = {
  schemaVersion: 1;
  adapter: "hash-pages-v1";
  pageIds: string[];
  defaultPageId: string;
  pageContainerId?: string;
  state?: { adapter: "course-state-v1"; legacyCourseId?: string };
  actions?: { schemaVersion: 1; evidenceStorageKey?: string };
  completion?: {
    storageKey: string;
    requiredIds: string[];
    /** Omit for a root array; use a path for an array within a saved JSON object. */
    path?: string[];
  };
};

export type ScormTrackingReport = {
  schemaVersion: 1;
  source: "workspace-contract" | "next-step-shell" | "hash-pages" | "unconnected";
  contract: ScormTrackingContract | null;
  features: {
    saveStatus: true;
    activeSessionTime: true;
    resume: boolean;
    pageTime: boolean;
    completion: boolean;
    progressMeasure: boolean;
  };
  actionReporting: "ungraded-scorm-2004" | "disabled";
  stateTransport: "localStorage" | "course-state-v1";
  warnings: string[];
};

const safeId = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,199}$/.test(value);

function ids(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.length || value.length > 500 || !value.every(safeId) || new Set(value).size !== value.length) {
    throw new Error(`Invalid SCORM tracking ${label}: supply 1–500 unique stable IDs.`);
  }
  return value;
}

export function resolveScormTracking(html: string, storageKeys: string[], version: "2004" | "1.2", explicit?: unknown): ScormTrackingReport {
  const $ = load(html);
  let contract: ScormTrackingContract | null = null;
  let source: ScormTrackingReport["source"] = "unconnected";
  const warnings: string[] = [];
  if (explicit !== undefined) {
    const value = explicit as Partial<ScormTrackingContract> | null;
    if (!value || value.schemaVersion !== 1 || value.adapter !== "hash-pages-v1") throw new Error("Unsupported SCORM tracking contract.");
    const pageIds = ids(value.pageIds, "pageIds");
    if (!safeId(value.defaultPageId) || !pageIds.includes(value.defaultPageId)) throw new Error("SCORM tracking defaultPageId must be a declared page.");
    if (value.pageContainerId !== undefined) {
      if (!value.state || !safeId(value.pageContainerId) || $("[id]").filter((_index, node) => $(node).attr("id") === value.pageContainerId).length !== 1) throw new Error("SCORM dynamic routes require a unique page container and course state adapter.");
    } else for (const id of pageIds) {
      if ($("[id]").filter((_index, node) => $(node).attr("id") === id).length !== 1) throw new Error(`SCORM tracking page is missing or duplicated: ${id}`);
    }
    contract = { schemaVersion: 1, adapter: "hash-pages-v1", pageIds, defaultPageId: value.defaultPageId, ...(value.pageContainerId ? { pageContainerId: value.pageContainerId } : {}) };
    if (value.state) {
      if (value.state.adapter !== "course-state-v1" || (value.state.legacyCourseId !== undefined && !safeId(value.state.legacyCourseId))) throw new Error("Invalid SCORM course state adapter.");
      contract.state = { adapter: "course-state-v1", legacyCourseId: value.state.legacyCourseId };
    }
    if (value.actions) {
      if (value.actions.schemaVersion !== 1 || (value.actions.evidenceStorageKey !== undefined && (typeof value.actions.evidenceStorageKey !== "string" || !value.actions.evidenceStorageKey.trim() || value.actions.evidenceStorageKey.length > 500))) throw new Error("Invalid SCORM action reporting contract.");
      contract.actions = { schemaVersion: 1, ...(value.actions.evidenceStorageKey ? { evidenceStorageKey: value.actions.evidenceStorageKey } : {}) };
    }
    if (value.completion) {
      const completion = value.completion;
      if (typeof completion.storageKey !== "string" || !completion.storageKey.trim() || completion.storageKey.length > 500) throw new Error("Invalid SCORM completion storageKey.");
      const requiredIds = ids(completion.requiredIds, "requiredIds");
      if (completion.path !== undefined && (!Array.isArray(completion.path) || completion.path.length > 10 || !completion.path.every(part => safeId(part) && !["__proto__", "constructor", "prototype"].includes(part)))) throw new Error("Invalid SCORM completion path.");
      contract.completion = { storageKey: completion.storageKey, requiredIds, path: completion.path };
    }
    source = "workspace-contract";
  } else {
    const pageIds = $(".course-page[id]").map((_index, node) => $(node).attr("id")!).get();
    const targets = new Set($("[data-page-target]").map((_index, node) => $(node).attr("data-page-target")!).get());
    if (pageIds.length && pageIds.length <= 500 && pageIds.every(safeId) && new Set(pageIds).size === pageIds.length && pageIds.includes("overview") && targets.has("overview")) {
      contract = { schemaVersion: 1, adapter: "hash-pages-v1", pageIds, defaultPageId: "overview" };
      source = "hash-pages";
      // Only recognize the owning shell's literal contract; never evaluate course JS,
      // count arbitrary buttons, or infer required work from visits / percentages.
      const scripts = $("script:not([src])").map((_index, node) => $(node).html() || "").get().join("\n");
      const listName = /\bconst completionIds\b/.test(scripts) ? "completionIds" : "lessonIds";
      const lists = [...scripts.matchAll(new RegExp("\\bconst " + listName + "\\s*=\\s*(\\[[^;]*?\\]);", "g"))];
      const keys = [...scripts.matchAll(/\bconst STORAGE_KEY\s*=\s*("[^"\n]*:complete");/g)];
      if (lists.length === 1 && keys.length === 1 && scripts.includes("function readComplete()") && scripts.includes("function updateComplete()") && scripts.includes("const count = " + listName + ".filter((id) => complete.has(id)).length")) {
        try {
          const requiredIds = ids(JSON.parse(lists[0][1]), "requiredIds");
          const storageKey = JSON.parse(keys[0][1]) as string;
          const markers = new Set($("[data-complete-id]").map((_index, node) => $(node).attr("data-complete-id")!).get());
          if (storageKeys.includes(storageKey) && requiredIds.every(id => markers.has(id))) {
            contract.completion = { storageKey, requiredIds };
            source = "next-step-shell";
          }
        } catch { /* Unknown shell stays explicitly unconnected for completion. */ }
      }
    }
  }
  if (!contract) warnings.push("Resume and page timing are unconnected. Add workspace/scorm-tracking.json for a hash-routed course.");
  if (!contract?.completion) warnings.push("Automatic completion and progress are unconnected. Declare the course's actual required completion IDs; visits are not completion.");
  if (version === "1.2") warnings.push("SCORM 1.2 has no separate progress measure and a small save budget. Prefer SCORM 2004 for written work.");
  if (contract?.actions && version === "1.2") warnings.push("Ungraded action reporting requires SCORM 2004; it is disabled in 1.2 exports.");
  warnings.push(contract?.actions && version === "2004" ? "Active page times and action summaries are sent as ungraded SCORM interactions. Verify Brightspace report displays before release." : "Page times are saved inside the package state, not published as native Brightspace page reports. Verify LMS displays before release.");
  return { schemaVersion: 1, source, contract, actionReporting: contract?.actions && version === "2004" ? "ungraded-scorm-2004" : "disabled", stateTransport: contract?.state ? "course-state-v1" : "localStorage", features: { saveStatus: true, activeSessionTime: true, resume: !!contract, pageTime: !!contract, completion: !!contract?.completion, progressMeasure: !!contract?.completion && version === "2004" }, warnings };
}

/** Included inside the bridge closure so it shares the SCORM session lifecycle. */
export function buildScormTrackingRuntime() {
  return `
  const trackingContract = config.tracking;
  let bookmark = "";
  let sessionMs = 0;
  let previousMs = 0;
  const pageMs = Object.create(null);
  const visiblePageMs = Object.create(null);
  let visibleSessionMs = 0;
  let previousVisibleMs = 0;
  let lastTick = Date.now();
  let lastActivity = lastTick;
  let wasVisible = document.visibilityState !== "hidden";
  let trackingTimer = null;
  let completionRequested = false;

  ${buildScormActionsRuntime()}
  function validPage(id) { return trackingContract && trackingContract.pageIds.includes(id); }
  function currentPage() {
    if (!trackingContract) return "";
    let id = "";
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) {}
    return validPage(id) ? id : trackingContract.defaultPageId;
  }
  function tickTime() {
    const now = Date.now();
    const delta = Math.max(0, Math.min(now, lastActivity + 300000) - lastTick);
    if (actionsEnabled() && !terminated && wasVisible && now - lastTick <= 30000) {
      visibleSessionMs += now - lastTick;
      if (validPage(bookmark)) visiblePageMs[bookmark] = (visiblePageMs[bookmark] || 0) + now - lastTick;
    }
    // A delayed callback after sleep/background throttling is not evidence of use.
    if (!terminated && wasVisible && now - lastTick <= 30000) {
      sessionMs += delta;
      if (validPage(bookmark)) pageMs[bookmark] = (pageMs[bookmark] || 0) + delta;
    }
    lastTick = now;
  }
  function activity() { tickTime(); lastActivity = Date.now(); }
  function restoreTracking(state) {
    if (state && state.schemaVersion === 1) {
      if (Number.isSafeInteger(state.activeMs) && state.activeMs >= 0) previousMs = state.activeMs;
      if (actionsEnabled()) {
        previousVisibleMs = Number.isSafeInteger(state.visibleMs) && state.visibleMs >= 0 ? state.visibleMs : previousMs;
        for (const id of trackingContract.pageIds) {
          const value = state.visiblePageMs && state.visiblePageMs[id];
          visiblePageMs[id] = Number.isSafeInteger(value) && value >= 0 ? value : state.pageMs && state.pageMs[id] || 0;
        }
      }
      if (trackingContract && state.pageMs && typeof state.pageMs === "object") {
        for (const id of trackingContract.pageIds) {
          const value = state.pageMs[id];
          if (Number.isSafeInteger(value) && value >= 0) pageMs[id] = value;
        }
      }
    }
    if (trackingContract && window.location && !window.location.hash) {
      const saved = state && validPage(state.bookmark) ? state.bookmark : api.getValue(config.version === "2004" ? "cmi.location" : "cmi.core.lesson_location");
      if (validPage(saved)) window.history.replaceState(null, "", "#" + saved);
    }
    bookmark = currentPage();
  }
  function collectTracking() {
    tickTime();
    return { schemaVersion: 1, bookmark: bookmark, activeMs: previousMs + sessionMs, pageMs: pageMs, ...(actionsEnabled() ? {visibleMs:previousVisibleMs + visibleSessionMs,visiblePageMs:visiblePageMs} : {}) };
  }
  function completionProgress() {
    const completion = trackingContract && trackingContract.completion;
    if (!completion) return null;
    if (config.managedState) {
      const done = new Set(courseCompletedIds);
      return completion.requiredIds.filter(id => done.has(id)).length / completion.requiredIds.length;
    }
    const raw = window.localStorage.getItem(completion.storageKey);
    let value = raw === null ? [] : tryParseJson(raw);
    if (raw === null) value = [];
    else for (const part of completion.path || []) value = value && Object.prototype.hasOwnProperty.call(value, part) ? value[part] : null;
    if (!Array.isArray(value) || !value.every(id => typeof id === "string")) throw new Error("Course completion data is invalid; progress was not reported.");
    const done = new Set(value);
    return completion.requiredIds.filter(id => done.has(id)).length / completion.requiredIds.length;
  }
  function sessionDuration() {
    if (config.version === "2004") return "PT" + (sessionMs / 1000).toFixed(2) + "S";
    const centiseconds = Math.min(3599999999, Math.floor(sessionMs / 10));
    return String(Math.floor(centiseconds / 360000)).padStart(4, "0") + ":" + String(Math.floor(centiseconds / 6000) % 60).padStart(2, "0") + ":" + String(Math.floor(centiseconds / 100) % 60).padStart(2, "0") + "." + String(centiseconds % 100).padStart(2, "0");
  }
  function writeTracking(progress) {
    const writes = [[config.version === "2004" ? "cmi.session_time" : "cmi.core.session_time", sessionDuration()]];
    if (validPage(bookmark)) writes.push([config.version === "2004" ? "cmi.location" : "cmi.core.lesson_location", bookmark]);
    if (progress !== null) {
      if (config.version === "2004") writes.push(["cmi.progress_measure", String(progress)]);
      writes.push([statusModel.completionKey, progress === 1 ? statusModel.completedValue : statusModel.incompleteValue]);
    } else if (completionRequested && api.getValue(statusModel.completionKey) !== statusModel.completedValue) {
      writes.push([statusModel.completionKey, statusModel.completedValue]);
    }
    for (const pair of writes) if (!api.setValue(pair[0], pair[1])) throw new Error("Brightspace rejected " + pair[0] + ". Keep this page open and retry saving.");
    actionReportsWritten = false;
    actionReportWarning = "";
    try { writeActionReports(); actionReportsWritten = true; }
    catch (error) {
      actionReportWarning = " Detailed activity reporting is unavailable; your work and session time were saved.";
      logWarning(String(error.message || error));
    }
  }
  function startTracking() {
    if (trackingTimer || terminated) return;
    lastTick = lastActivity = Date.now();
    wasVisible = document.visibilityState !== "hidden";
    bookmark = currentPage();
    window.addEventListener("hashchange", function () {
      tickTime();
      bookmark = currentPage();
      scheduleFlush("navigation");
    });
    for (const name of ["pointerdown", "keydown", "input", "scroll"]) document.addEventListener(name, activity, { capture: true, passive: true });
    document.addEventListener("visibilitychange", function () {
      tickTime();
      wasVisible = document.visibilityState !== "hidden";
      if (wasVisible) lastActivity = Date.now();
      if (!terminated) persistToLms("visibility-change");
    });
    startActionTracking();
    trackingTimer = window.setInterval(function () { persistToLms("heartbeat"); }, 15000);
  }
  function stopTracking() {
    if (trackingTimer) window.clearInterval(trackingTimer);
    trackingTimer = null;
  }
`;
}
