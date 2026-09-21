/* Canvas Helper SCORM Bridge */
(function () {
  "use strict";

  const config = {"managedState":true,"projectSlug":"math10c-unit3-pilot","tracking":{"schemaVersion":1,"adapter":"hash-pages-v1","pageIds":["u3-overview","u3-ready","u3-31","u3-32","u3-33","u3-34","u3-35","u3-36","u3-37","u3-38","u3-practice","u3-mixed","u3-errors","u3-review","u3-reference","u3-number-lab","u3-expansion-lab","u3-vocab","u3-work","u3-resources","u3-support-library","u3-transfer"],"defaultPageId":"u3-overview","state":{"adapter":"course-state-v1"},"completion":{"storageKey":"math10c-unit3-pilot:completion","path":["completedIds"],"requiredIds":["u3-check-31","u3-check-32","u3-check-33","u3-check-34","u3-check-35","u3-check-36","u3-check-37","u3-check-38"]}},"version":"2004","storageKeys":["math10c-unit3-pilot::workspace-state::v1"],"maxSuspendChars":60000};
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

const stateCodec = (function () {
const LIMIT=1000000,PREFIX='CH10LZ1|';
function hash(bytes){let h=2166136261;for(const b of bytes)h=Math.imul(h^b,16777619);return (h>>>0).toString(16);}
function encode(s){const a=new TextEncoder().encode(s);if(a.length>LIMIT)throw Error('The work record exceeds the supported one-megabyte state limit.');const output=[],seen=new Map();let pos=0;
 function add(i){if(i+2>=a.length)return;const k=(a[i]<<16)|(a[i+1]<<8)|a[i+2];let list=seen.get(k);if(!list){list=[];seen.set(k,list);}list.push(i);if(list.length>28)list.shift();}
 while(pos<a.length){const flagAt=output.length;output.push(0);let flags=0;for(let bit=0;bit<8&&pos<a.length;bit++){
  let length=0,offset=0;const key=pos+2<a.length?(a[pos]<<16)|(a[pos+1]<<8)|a[pos+2]:-1,possible=seen.get(key)||[];
  for(let c=possible.length-1;c>=0;c--){const candidate=possible[c],distance=pos-candidate;if(distance>4095)break;let n=0;while(n<18&&pos+n<a.length&&a[candidate+n]===a[pos+n])n++;if(n>=3&&n>length){length=n;offset=distance;if(n===18)break;}}
  if(length>=3){flags|=1<<bit;const token=(offset<<4)|(length-3);output.push(token>>8,token&255);for(let j=0;j<length;j++)add(pos+j);pos+=length;}else{output.push(a[pos]);add(pos);pos++;}
 }output[flagAt]=flags;}
 let bin='';for(let i=0;i<output.length;i+=8192)bin+=String.fromCharCode(...output.slice(i,i+8192));const packed=PREFIX+a.length+'|'+hash(a)+'|'+btoa(bin);return packed.length<a.length?packed:s;
}
function decode(s){if(!s.startsWith(PREFIX))return s;const parts=s.split('|');if(parts.length!==4||!/^\d+$/.test(parts[1])||! /^[0-9a-f]+$/.test(parts[2]))throw Error('Invalid saved-state header.');const expected=Number(parts[1]);if(expected>LIMIT)throw Error('Saved state exceeds the decode limit.');const input=Uint8Array.from(atob(parts[3]),c=>c.charCodeAt(0)),out=new Uint8Array(expected);let p=0,q=0;
 while(p<input.length&&q<expected){const flags=input[p++];for(let bit=0;bit<8&&p<input.length&&q<expected;bit++){
  if(flags&(1<<bit)){if(p+1>=input.length)throw Error('Truncated saved state.');const token=(input[p++]<<8)|input[p++],offset=token>>4,length=(token&15)+3;if(!offset||offset>q||q+length>expected)throw Error('Invalid saved-state reference.');for(let j=0;j<length;j++){out[q]=out[q-offset];q++;}}
  else out[q++]=input[p++];
 }}if(q!==expected||p!==input.length||hash(out)!==parts[2])throw Error('Saved-state integrity check failed.');return new TextDecoder('utf-8',{fatal:true}).decode(out);
}
return {encode, decode};
})();

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

  
  const actionRecords = new Map();
  const pendingEdits = new Map();
  let interactionSlots = null;
  let nextInteraction = 0;
  let actionReportWarning = "";
  let actionReportsWritten = false;
  function actionsEnabled() { return config.version === "2004" && trackingContract && trackingContract.actions; }
  function actionPageLabel(page) { const node=document.getElementById(page); const heading=node && node.querySelector("h2,h1"); return heading ? heading.textContent.trim().slice(0,120) : page; }
  function interactionId(kind, target) { return "canvas-helper:" + kind + ":" + encodeURIComponent(String(target)); }
  function loadInteractionSlots() {
    if (interactionSlots) return;
    const slots = new Map();
    const count = Number(api.getValue("cmi.interactions._count") || "0");
    if (!Number.isInteger(count) || count < 0 || count > 10000) throw new Error("Brightspace returned an invalid activity report. Keep this page open and retry saving.");
    nextInteraction = count;
    for (let i = 0; i < count; i++) {
      const id = api.getValue("cmi.interactions." + i + ".id");
      if (id) slots.set(id, i);
    }
    interactionSlots = slots;
  }
  function actionRecord(kind, target, label) {
    const id = interactionId(kind, target);
    if (actionRecords.has(id)) return actionRecords.get(id);
    loadInteractionSlots();
    const index = interactionSlots.get(id);
    const previous = index === undefined ? null : tryParseJson(api.getValue("cmi.interactions." + index + ".learner_response"));
    const record = { id: id, kind: kind, target: String(target), label: String(label || target).slice(0, 180), count: previous && Number.isSafeInteger(previous.count) && previous.count >= 0 ? previous.count : 0, first: previous && typeof previous.first === "string" ? previous.first : "", last: previous && typeof previous.last === "string" ? previous.last : "", seconds: previous && typeof previous.activeSeconds === "number" ? previous.activeSeconds : undefined, visibleSeconds: previous && typeof previous.visibleSeconds === "number" ? previous.visibleSeconds : undefined, dirty: false };
    actionRecords.set(id, record);
    return record;
  }
  function recordAction(kind, target, label) {
    if (!actionsEnabled() || !initialized || terminated || restoreBlocked) return;
    let record;
    try { record = actionRecord(kind, target, label); }
    catch (error) { logWarning(String(error.message || error)); return; }
    record.count++;
    record.last = new Date().toISOString();
    if (!record.first) record.first = record.last;
    record.dirty = true;
    scheduleFlush("action:" + kind);
  }
  function flushActionEdits() {
    for (const pair of pendingEdits) {
      window.clearTimeout(pair[1].timer);
      recordAction("answer-edit", pair[0], pair[1].label);
    }
    pendingEdits.clear();
  }
  function writeActionReports() {
    if (!actionsEnabled()) return;
    flushActionEdits();
    for (const page of trackingContract.pageIds) {
      if (!(visiblePageMs[page] > 0)) continue;
      const record = actionRecord("content-time", page, "Content time (active and visible): " + actionPageLabel(page));
      const seconds = Number(((pageMs[page] || 0) / 1000).toFixed(2));
      const visibleSeconds = Number((visiblePageMs[page] / 1000).toFixed(2));
      if (record.seconds === seconds && record.visibleSeconds === visibleSeconds) continue;
      record.seconds = seconds;
      record.visibleSeconds = visibleSeconds;
      record.last = new Date().toISOString();
      record.dirty = true;
    }
    for (const record of actionRecords.values()) {
      if (!record.dirty) continue;
      let index = interactionSlots.get(record.id);
      if (index === undefined) {
        index = nextInteraction;
      }
      const prefix = "cmi.interactions." + index + ".";
      const response = {action:record.kind,target:record.target,count:record.count,first:record.first,last:record.last};
      if (record.seconds !== undefined) { response.activeSeconds = record.seconds; response.visibleSeconds = record.visibleSeconds; response.idleSeconds = Number(Math.max(0,record.visibleSeconds-record.seconds).toFixed(2)); }
      // SCORM time(second,10,2) does not accept JavaScript's three-digit milliseconds.
      const timestamp = record.last.replace(/\.\d{3}Z$/, "Z");
      const fields = [["id",record.id],["type","other"],["description",record.label],["timestamp",timestamp],["learner_response",JSON.stringify(response)],["result","neutral"],["weighting","0"]];
      if (record.seconds !== undefined) fields.push(["latency","PT" + record.seconds.toFixed(2) + "S"]);
      for (const field of fields) {
        const key = prefix + field[0];
        if (!api.setValue(key, field[1])) throw new Error("Activity reporting rejected at " + key + (api.diagnostic ? ": " + api.diagnostic() : ""));
        if (field[0] === "id" && !interactionSlots.has(record.id)) {
          interactionSlots.set(record.id, index);
          nextInteraction = index + 1;
        }
      }
      // Keep records dirty through Commit; retry rewrites the same stable rows.
    }
  }
  function commitActionReports() { if (actionReportsWritten) for (const record of actionRecords.values()) record.dirty = false; }
  function startActionTracking() {
    if (!actionsEnabled()) return;
    recordAction("page-view", currentPage(), "Content opened: " + actionPageLabel(currentPage()));
    window.addEventListener("hashchange", function () { recordAction("page-view", currentPage(), "Content opened: " + actionPageLabel(currentPage())); });
    document.addEventListener("input", function (event) {
      const field = event.target.closest && event.target.closest("[data-response-id]:not([type=hidden])");
      if (!field) return;
      const id = field.getAttribute("data-response-id");
      const old = pendingEdits.get(id);
      if (old) window.clearTimeout(old.timer);
      const label = "Answer edited: " + id;
      pendingEdits.set(id, {label:label,timer:window.setTimeout(function () { pendingEdits.delete(id); recordAction("answer-edit",id,label); },1000)});
    }, true);
    document.addEventListener("click", function (event) {
      const target = event.target.closest && event.target.closest("button,a,input");
      if (!target || target.closest("[data-scorm-controls]")) return;
      const completeId = target.getAttribute("data-complete-id");
      if (completeId) {
        const before = window.localStorage.getItem(trackingContract.completion.storageKey);
        window.setTimeout(function () {
          const after = window.localStorage.getItem(trackingContract.completion.storageKey);
          if (before !== after) { const done = tryParseJson(after); recordAction(Array.isArray(done) && done.includes(completeId) ? "lesson-completed" : "lesson-uncompleted",completeId,"Lesson completion changed: " + completeId); }
        },0);
      }
      const collect = target.hasAttribute("data-tool-collect") || target.hasAttribute("data-book-collect") || target.hasAttribute("data-save-evidence-note");
      const removing = target.hasAttribute("data-remove-evidence-note");
      if ((collect || removing) && trackingContract.actions.evidenceStorageKey) {
        const key = trackingContract.actions.evidenceStorageKey;
        const before = window.localStorage.getItem(key);
        const name = target.getAttribute("data-remove-evidence-note") || target.getAttribute("data-tool-collect") || target.closest("[data-book-record]")?.getAttribute("data-book-record") || currentPage();
        window.setTimeout(function () { if (window.localStorage.getItem(key) !== before) recordAction(removing ? "evidence-removed" : "evidence-collected",name,(removing ? "Evidence removed: " : "Evidence collected: ") + name); },0);
      }
      const word = target.getAttribute("data-vocabulary-term") || target.getAttribute("data-vocabulary-choose");
      if (word) recordAction("vocabulary-opened",word,"Vocabulary accessed: " + word);
      const reading = target.getAttribute("data-textbook-page");
      if (reading) recordAction("reading-opened",reading,"Textbook page requested: " + reading);
      if (target.hasAttribute("data-textbook-browse")) recordAction("textbook-browsed",currentPage(),"Textbook viewer opened");
      if (target.hasAttribute("data-book-choose")) recordAction("practice-opened",target.getAttribute("data-book-choose"),"Textbook practice selected");
      if (target.hasAttribute("data-book-save")) recordAction("practice-save-clicked",currentPage(),"Textbook practice save requested");
      const href = target.getAttribute("href") || "";
      if (href && !href.startsWith("#") && !target.hasAttribute("data-textbook-page")) recordAction("resource-opened",href,"Resource link opened: " + (target.textContent || href).trim());
    }, true);
    document.addEventListener("change", function (event) {
      const target = event.target;
      if (target.matches("[data-vocabulary-topic],[data-book-topic],[data-practice-source-select]")) recordAction("tool-filter-changed",currentPage() + ":" + target.value,"Tool topic or source selected");
      if (target.matches("[data-vocabulary-search]")) recordAction("vocabulary-search-used",currentPage(),"Vocabulary search used (query not reported)");
      if (target.matches("[data-film-select]")) recordAction("media-selected",target.value,"Media selected (access, not viewing confirmation)");
    }, true);
    document.addEventListener("toggle",function(event) { const detail=event.target; if(detail.matches && detail.matches("details") && detail.open) { const summary=detail.querySelector("summary"); if(summary) recordAction("guide-opened",currentPage() + ":" + summary.textContent.trim().slice(0,120),"Support section opened: " + summary.textContent.trim()); } },true);
    document.addEventListener("submit", function (event) {
      if (event.target.closest(".social-textbook-dialog")) { const input = event.target.querySelector("[data-textbook-input]"); if (input) recordAction("reading-page-requested",input.value,"Textbook page jump requested"); }
    }, true);
    for (const name of ["play","pause","ended"]) document.addEventListener(name,function (event) {
      const media = event.target;
      if (media.matches && media.matches("video,audio")) recordAction("media-" + name,media.getAttribute("src") || media.querySelector("source")?.getAttribute("src") || currentPage(),"Native media " + name);
    },true);
  }

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
