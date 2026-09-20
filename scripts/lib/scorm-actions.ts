/** Optional, ungraded SCORM 2004 analytics. No learner writing is copied here. */
export function buildScormActionsRuntime() {
  return `
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
      const timestamp = record.last.replace(/\\.\\d{3}Z$/, "Z");
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
`;
}
