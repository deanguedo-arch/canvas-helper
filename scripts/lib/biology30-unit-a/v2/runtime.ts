import type { Biology30SuspendDataSchema } from "../../biology30-course/v1/suspend-data.js";

type Gate1PracticeItem = {
  id: string;
  setId?: string;
  answerKey: unknown;
  rationale: string;
  targetedFeedback: Record<string, string>;
};

type BiologyRuntimeInteraction = {
  id: string;
  lessonId?: string;
  title?: string;
  options?: Array<{ id: string; label: string; evidence: string; explanation: string }>;
};

type Gate1Activities = {
  interactions: BiologyRuntimeInteraction[];
  practiceItems: Gate1PracticeItem[];
  artifacts: Array<{
    id: string;
    title?: string;
    fields: Array<{ id: string; label: string; maxLength: number }>;
  }>;
};

type Gate1Dataset = {
  simulatorScenarios: Array<{
    id: string;
    label: string;
    timesMinutes: number[];
    glucose: number[];
    insulinSignal: string;
    glucagonSignal: string;
    mechanism: string;
  }>;
};

function safeScriptJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export function renderBiology30Gate1Runtime(input: { activities: Gate1Activities; dataset: Gate1Dataset }) {
  return renderBiology30Runtime({
    ...input,
    courseSlug: "biology30-unit-a",
    courseLessonIds: ["lesson-04", "lesson-15"],
    requiredLessonIds: Array.from({ length: 17 }, (_value, index) => `lesson-${String(index + 1).padStart(2, "0")}`),
    requiredArtifactIds: ["regulation-systems-map", "action-potential-evidence", "reflex-investigation", "sensory-investigation", "sensory-evidence-case", "glucose-urinalysis", "hormone-technology-case"],
    fullCourse: false
  });
}

export function renderBiology30Gate2Runtime(input: {
  activities: Gate1Activities;
  dataset: Gate1Dataset;
  lessonIds: string[];
  requiredArtifactIds: string[];
  courseSlug?: string;
  suspendDataSchema?: Biology30SuspendDataSchema;
}) {
  return renderBiology30Runtime({
    activities: input.activities,
    dataset: input.dataset,
    courseSlug: input.courseSlug ?? "biology30-unit-a",
    courseLessonIds: input.lessonIds,
    requiredLessonIds: input.lessonIds,
    requiredArtifactIds: input.requiredArtifactIds,
    fullCourse: true,
    suspendDataSchema: input.suspendDataSchema
  });
}

function renderBiology30Runtime(input: {
  activities: Gate1Activities;
  dataset: Gate1Dataset;
  courseSlug: string;
  courseLessonIds: string[];
  requiredLessonIds: string[];
  requiredArtifactIds: string[];
  fullCourse: boolean;
  suspendDataSchema?: Biology30SuspendDataSchema;
}) {
  return `<div class="bio-global-save" data-bio-global-save aria-live="polite">Progress saves on this device.</div>${input.fullCourse ? '<button type="button" class="bio-save-exit" data-bio-save-exit>Save and Exit</button>' : ""}
<script>
(() => {
  "use strict";
  const BIO_COURSE_SLUG = ${safeScriptJson(input.courseSlug)};
  const BIO_STATE_KEY = BIO_COURSE_SLUG + ":state:v1";
  const BIO_SHELL_COMPLETION_KEY = BIO_COURSE_SLUG + ":complete";
  const BIO_STATE_LIMIT = 48000;
  const BIO_COURSE_LESSONS = ${safeScriptJson(input.courseLessonIds)};
  const BIO_REQUIRED_LESSONS = ${safeScriptJson(input.requiredLessonIds)};
  const BIO_REQUIRED_ARTIFACTS = ${safeScriptJson(input.requiredArtifactIds)};
  const BIO_FULL_COURSE = ${input.fullCourse ? "true" : "false"};
  const BIO_ACTIVITIES = ${safeScriptJson(input.activities)};
  const BIO_DATASET = ${safeScriptJson(input.dataset)};
  const BIO_SUSPEND_SCHEMA = ${safeScriptJson(input.suspendDataSchema ?? null)};
  const BIO_PRACTICE = Object.fromEntries(BIO_ACTIVITIES.practiceItems.map((item) => [item.id, item]));
  const BIO_ARTIFACTS = Object.fromEntries(BIO_ACTIVITIES.artifacts.map((item) => [item.id, item]));
  const BIO_AP_STAGES = {
    rest: { name: "Rest", voltage: "−70 mV", channels: "Voltage-gated Na⁺ and K⁺ channels are closed; leak channels remain active.", explanation: "Selective permeability and maintained ion gradients keep the inside negative relative to the outside." },
    threshold: { name: "Threshold", voltage: "about −55 mV", channels: "Enough voltage-gated Na⁺ channels begin opening to start positive feedback.", explanation: "A subthreshold change fades, but crossing threshold recruits additional sodium channels and triggers a full event." },
    depolarization: { name: "Rising phase", voltage: "toward +30 mV", channels: "Voltage-gated Na⁺ channels are open; Na⁺ enters rapidly.", explanation: "Sodium entry makes the inside more positive and opens additional sodium channels." },
    repolarization: { name: "Falling phase", voltage: "falling toward −70 mV", channels: "Na⁺ channels are inactivated; delayed voltage-gated K⁺ channels are open.", explanation: "Potassium leaves the axon, removing positive charge from the inside." },
    hyperpolarization: { name: "Undershoot", voltage: "below −70 mV", channels: "Some K⁺ channels remain open while Na⁺ channels recover from inactivation.", explanation: "Delayed potassium-channel closing briefly makes the membrane more negative than its resting level." },
    recovery: { name: "Recovery", voltage: "returning to −70 mV", channels: "Voltage-gated channels return to resting states; leak channels and pumps continue.", explanation: "Channel recovery restores excitability while the sodium-potassium pump maintains the ion gradients over time." }
  };

  const defaultState = () => ({
    schemaVersion: 1,
    updatedAt: new Date(0).toISOString(),
    location: "overview",
    responses: {},
    practice: {},
    interactions: {
      actionPotential: { current: "rest", seen: ["rest"] },
      bloodGlucose: { current: "regulated-meal", seenScenarios: [] },
      generic: {}
    },
    artifacts: {},
    notebook: [],
    completions: [],
    finalPractice: null
  });

  const asRecord = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const reverseTokens = (map) => Object.fromEntries(Object.entries(map || {}).map(([id, token]) => [token, id]));
  const BIO_SUSPEND_REVERSE = BIO_SUSPEND_SCHEMA ? {
    responses: reverseTokens(BIO_SUSPEND_SCHEMA.responses),
    practice: reverseTokens(BIO_SUSPEND_SCHEMA.practice),
    artifacts: reverseTokens(BIO_SUSPEND_SCHEMA.artifacts),
    lessons: reverseTokens(BIO_SUSPEND_SCHEMA.lessons),
    interactions: Object.fromEntries(Object.entries(BIO_SUSPEND_SCHEMA.interactions).map(([id, definition]) => [definition.token, {
      id,
      options: reverseTokens(definition.options)
    }]))
  } : null;

  function encodeSuspendTime(value) {
    const parsed = Date.parse(typeof value === "string" ? value : "");
    return Number.isFinite(parsed) ? parsed.toString(36) : "0";
  }

  function decodeSuspendTime(value) {
    const parsed = typeof value === "string" && /^[0-9a-z]+$/i.test(value) ? Number.parseInt(value, 36) : NaN;
    return Number.isFinite(parsed) && parsed > 0 ? new Date(parsed).toISOString() : new Date(0).toISOString();
  }

  function tokenOrId(map, id) {
    return map?.[id] || id;
  }

  function idOrToken(map, token) {
    return map?.[token] || token;
  }

  function compactActionPotential(value) {
    const record = asRecord(value);
    const stages = ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"];
    const current = Math.max(0, stages.indexOf(String(record.current || "rest")));
    const seen = Array.isArray(record.seen) ? record.seen.map(String) : [];
    const mask = stages.reduce((total, stage, index) => seen.includes(stage) ? total + 2 ** index : total, 0);
    return [current, mask.toString(36)];
  }

  function expandActionPotential(value) {
    const stages = ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"];
    const packed = Array.isArray(value) ? value : [];
    const currentIndex = Math.max(0, Math.min(stages.length - 1, Number(packed[0]) || 0));
    const mask = Number.parseInt(String(packed[1] || "0"), 36) || 0;
    return {
      current: stages[currentIndex],
      seen: stages.filter((_stage, index) => Boolean(mask & (2 ** index)))
    };
  }

  function serializeSuspendState(candidate) {
    if (!BIO_SUSPEND_SCHEMA) return JSON.stringify(candidate);
    const interactions = asRecord(candidate.interactions);
    const generic = asRecord(interactions.generic);
    const artifacts = asRecord(candidate.artifacts);
    const finalPractice = asRecord(candidate.finalPractice);
    return JSON.stringify({
      v: 2,
      t: encodeSuspendTime(candidate.updatedAt),
      l: typeof candidate.location === "string" ? candidate.location : "overview",
      r: Object.entries(asRecord(candidate.responses)).map(([id, value]) => [tokenOrId(BIO_SUSPEND_SCHEMA.responses, id), String(value || "")]),
      p: Object.entries(asRecord(candidate.practice)).map(([id, value]) => [tokenOrId(BIO_SUSPEND_SCHEMA.practice, id), String(value || "")]),
      i: {
        a: compactActionPotential(interactions.actionPotential),
        b: (() => {
          const value = asRecord(interactions.bloodGlucose);
          return [String(value.current || "regulated-meal"), Array.isArray(value.seenScenarios) ? value.seenScenarios.map(String) : []];
        })(),
        g: Object.entries(generic).map(([id, raw]) => {
          const definition = BIO_SUSPEND_SCHEMA.interactions[id];
          const value = asRecord(raw);
          const options = definition?.options || {};
          const seen = Array.isArray(value.seen) ? value.seen.map(String) : [];
          return [
            definition?.token || id,
            tokenOrId(options, String(value.current || "")),
            seen.map((optionId) => tokenOrId(options, optionId))
          ];
        })
      },
      a: Object.keys(artifacts).map((id) => tokenOrId(BIO_SUSPEND_SCHEMA.artifacts, id)),
      n: (Array.isArray(candidate.notebook) ? candidate.notebook : []).slice(0, 10).map((raw) => {
        const note = asRecord(raw);
        return [String(note.title || ""), String(note.body || "")];
      }),
      c: (Array.isArray(candidate.completions) ? candidate.completions : []).map(String).map((id) => tokenOrId(BIO_SUSPEND_SCHEMA.lessons, id)),
      f: Object.keys(finalPractice).length ? [
        Number(finalPractice.percent || 0),
        Number(finalPractice.correct || 0),
        Number(finalPractice.total || 0)
      ] : null
    });
  }

  function expandSuspendState(candidate) {
    if (!BIO_SUSPEND_REVERSE || candidate?.v !== 2) return null;
    const updatedAt = decodeSuspendTime(candidate.t);
    const responses = Object.fromEntries((Array.isArray(candidate.r) ? candidate.r : []).flatMap((entry) => Array.isArray(entry) && entry.length >= 2
      ? [[idOrToken(BIO_SUSPEND_REVERSE.responses, String(entry[0])), String(entry[1] || "")]]
      : []));
    const practice = Object.fromEntries((Array.isArray(candidate.p) ? candidate.p : []).flatMap((entry) => Array.isArray(entry) && entry.length >= 2
      ? [[idOrToken(BIO_SUSPEND_REVERSE.practice, String(entry[0])), String(entry[1] || "")]]
      : []));
    const packedInteractions = asRecord(candidate.i);
    const generic = Object.fromEntries((Array.isArray(packedInteractions.g) ? packedInteractions.g : []).flatMap((entry) => {
      if (!Array.isArray(entry) || entry.length < 2) return [];
      const definition = BIO_SUSPEND_REVERSE.interactions[String(entry[0])];
      const id = definition?.id || String(entry[0]);
      const options = definition?.options || {};
      return [[id, {
        current: idOrToken(options, String(entry[1] || "")),
        seen: (Array.isArray(entry[2]) ? entry[2] : []).map((token) => idOrToken(options, String(token)))
      }]];
    }));
    const packedBloodGlucose = Array.isArray(packedInteractions.b) ? packedInteractions.b : [];
    const artifactIds = (Array.isArray(candidate.a) ? candidate.a : []).map((token) => idOrToken(BIO_SUSPEND_REVERSE.artifacts, String(token)));
    const artifacts = Object.fromEntries(artifactIds.map((id) => [id, {
      savedAt: updatedAt,
      fieldIds: BIO_ARTIFACTS[id]?.fields?.map((field) => field.id) || []
    }]));
    const notebook = (Array.isArray(candidate.n) ? candidate.n : []).slice(0, 10).flatMap((entry, index) => Array.isArray(entry) && entry.length >= 2 ? [{
      id: "note-restored-" + index + "-" + String(candidate.t || "0"),
      title: String(entry[0] || ""),
      body: String(entry[1] || ""),
      savedAt: updatedAt
    }] : []);
    const completions = (Array.isArray(candidate.c) ? candidate.c : []).map((token) => idOrToken(BIO_SUSPEND_REVERSE.lessons, String(token)));
    const final = Array.isArray(candidate.f) && candidate.f.length >= 3 ? {
      submittedAt: updatedAt,
      percent: Number(candidate.f[0]) || 0,
      correct: Number(candidate.f[1]) || 0,
      total: Number(candidate.f[2]) || 0
    } : null;
    return {
      schemaVersion: 1,
      updatedAt,
      location: typeof candidate.l === "string" ? candidate.l : "overview",
      responses,
      practice,
      interactions: {
        actionPotential: expandActionPotential(packedInteractions.a),
        bloodGlucose: {
          current: String(packedBloodGlucose[0] || "regulated-meal"),
          seenScenarios: Array.isArray(packedBloodGlucose[1]) ? packedBloodGlucose[1].map(String) : []
        },
        generic
      },
      artifacts,
      notebook,
      completions,
      finalPractice: final
    };
  }

  let bioState = defaultState();
  let lastValidSerialized = serializeSuspendState(bioState);
  let saveTimer = null;
  let scormApi = null;
  let scormInitialized = false;

  function globalStatus(message, kind) {
    const node = document.querySelector("[data-bio-global-save]");
    if (!node) return;
    node.textContent = message;
    node.dataset.status = kind || "neutral";
  }

  function normalizeState(candidate) {
    if (!candidate || candidate.schemaVersion !== 1 || typeof candidate !== "object") return defaultState();
    const base = defaultState();
    const practice = Object.fromEntries(Object.entries(candidate.practice && typeof candidate.practice === "object" ? candidate.practice : {}).flatMap(([id, record]) => {
      const choice = typeof record === "string" ? record : record?.choice;
      return typeof choice === "string" && choice ? [[id, choice]] : [];
    }));
    return {
      ...base,
      ...candidate,
      responses: candidate.responses && typeof candidate.responses === "object" ? candidate.responses : {},
      practice,
      interactions: {
        actionPotential: { ...base.interactions.actionPotential, ...(candidate.interactions?.actionPotential || {}) },
        bloodGlucose: { ...base.interactions.bloodGlucose, ...(candidate.interactions?.bloodGlucose || {}) },
        generic: candidate.interactions?.generic && typeof candidate.interactions.generic === "object" ? candidate.interactions.generic : {}
      },
      artifacts: candidate.artifacts && typeof candidate.artifacts === "object" ? candidate.artifacts : {},
      notebook: Array.isArray(candidate.notebook) ? candidate.notebook.slice(0, 10) : [],
      completions: Array.isArray(candidate.completions) ? candidate.completions : [],
      finalPractice: candidate.finalPractice && typeof candidate.finalPractice === "object" ? candidate.finalPractice : null
    };
  }

  function parseState(raw) {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      const expanded = parsed?.v === 2 ? expandSuspendState(parsed) : parsed;
      return expanded ? normalizeState(expanded) : null;
    } catch { return null; }
  }

  function findScormApi() {
    let current = window;
    for (let depth = 0; depth < 10; depth += 1) {
      try {
        if (current.API_1484_11) return current.API_1484_11;
        if (!current.parent || current.parent === current) break;
        current = current.parent;
      } catch { break; }
    }
    try { return window.opener?.API_1484_11 || null; } catch { return null; }
  }

  function initializeScorm() {
    if (scormInitialized) return scormApi;
    scormInitialized = true;
    scormApi = findScormApi();
    if (!scormApi) return null;
    try {
      const initialized = scormApi.Initialize("");
      if (String(initialized).toLowerCase() !== "true") scormApi = null;
    } catch { scormApi = null; }
    return scormApi;
  }

  function readScormState() {
    const api = initializeScorm();
    if (!api) return null;
    try { return parseState(api.GetValue("cmi.suspend_data")); } catch { return null; }
  }

  function isCourseComplete() {
    const lessonsDone = BIO_REQUIRED_LESSONS.every((id) => bioState.completions.includes(id));
    const artifactsDone = BIO_REQUIRED_ARTIFACTS.every((id) => Boolean(bioState.artifacts[id]?.savedAt));
    return lessonsDone && artifactsDone && Boolean(bioState.finalPractice?.submittedAt);
  }

  function writeScormState(serialized) {
    const api = initializeScorm();
    if (!api) return true;
    try {
      api.SetValue("cmi.suspend_data", serialized);
      api.SetValue("cmi.location", bioState.location || "overview");
      const completedCount = BIO_REQUIRED_LESSONS.filter((id) => bioState.completions.includes(id)).length;
      api.SetValue("cmi.progress_measure", String(completedCount / BIO_REQUIRED_LESSONS.length));
      api.SetValue("cmi.completion_status", isCourseComplete() ? "completed" : "incomplete");
      api.SetValue("cmi.success_status", "unknown");
      if (bioState.finalPractice?.submittedAt && Number.isFinite(bioState.finalPractice?.percent)) {
        api.SetValue("cmi.score.min", "0");
        api.SetValue("cmi.score.max", "100");
        api.SetValue("cmi.score.raw", String(bioState.finalPractice.percent));
      }
      const committed = api.Commit("");
      return String(committed).toLowerCase() === "true";
    } catch { return false; }
  }

  function loadState() {
    let localState = null;
    try { localState = parseState(window.localStorage.getItem(BIO_STATE_KEY)); } catch {}
    const lmsState = readScormState();
    const localTime = Date.parse(localState?.updatedAt || "") || 0;
    const lmsTime = Date.parse(lmsState?.updatedAt || "") || 0;
    bioState = normalizeState(lmsTime > localTime ? lmsState : localState);
    lastValidSerialized = serializeSuspendState(bioState);
  }

  function persistState(message) {
    const candidate = { ...bioState, updatedAt: new Date().toISOString() };
    const localSerialized = JSON.stringify(candidate);
    const suspendSerialized = serializeSuspendState(candidate);
    if (suspendSerialized.length >= BIO_STATE_LIMIT) {
      globalStatus("Save paused: this change would exceed the course state budget. Copy or print your work, then shorten the newest entry.", "error");
      return false;
    }
    try {
      window.localStorage.setItem(BIO_STATE_KEY, localSerialized);
    } catch {
      globalStatus("This browser could not save locally. Copy or print your work before leaving.", "error");
      return false;
    }
    bioState = candidate;
    lastValidSerialized = suspendSerialized;
    const lmsSaved = writeScormState(suspendSerialized);
    globalStatus(lmsSaved ? (message || "Progress saved.") : "Saved on this device. Keep this page open and try Save again.", lmsSaved ? "saved" : "warning");
    return lmsSaved;
  }

  function scheduleSave(message) {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => persistState(message), 260);
  }

  function responseStatus(id, message) {
    const node = Array.from(document.querySelectorAll("[data-bio-status-for]")).find((item) => item.getAttribute("data-bio-status-for") === id);
    if (node) node.textContent = message;
  }

  function saveResponseField(field, immediate) {
    const id = field.getAttribute("data-bio-response-id");
    if (!id) return;
    const maximum = Number(field.getAttribute("maxlength")) || 2000;
    const value = String(field.value || "").slice(0, maximum);
    if (value.trim()) bioState.responses[id] = value;
    else delete bioState.responses[id];
    responseStatus(id, value.trim() ? "Saved draft" : "Empty response");
    if (immediate) persistState("Response saved.");
    else scheduleSave("Response saved.");
  }

  function restoreResponseFields() {
    document.querySelectorAll("[data-bio-response-id]").forEach((field) => {
      const id = field.getAttribute("data-bio-response-id");
      if (id && Object.prototype.hasOwnProperty.call(bioState.responses, id)) field.value = bioState.responses[id];
      if (id && String(field.value || "").trim()) responseStatus(id, "Saved draft restored");
    });
  }

  function renderPracticeFeedback(article, choice) {
    const definition = BIO_PRACTICE[article.getAttribute("data-practice-id")];
    const region = article.querySelector("[data-practice-feedback]");
    if (!definition || !region || !choice) return;
    const correct = choice === String(definition.answerKey);
    const detail = correct ? definition.rationale : (definition.targetedFeedback[choice] || definition.rationale);
    region.hidden = false;
    region.classList.toggle("is-correct", correct);
    region.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = correct ? "Correct reasoning" : "Revise this idea";
    const copy = document.createElement("span");
    copy.textContent = detail;
    region.append(heading, copy);
  }

  function submitPractice(button) {
    const article = button.closest("[data-practice-id]");
    if (!article) return;
    const id = article.getAttribute("data-practice-id");
    const selected = article.querySelector("input[type='radio']:checked");
    const region = article.querySelector("[data-practice-feedback]");
    if (!selected) {
      if (region) { region.hidden = false; region.classList.remove("is-correct"); region.textContent = "Choose one response before checking."; }
      return;
    }
    const definition = BIO_PRACTICE[id];
    bioState.practice[id] = selected.value;
    renderPracticeFeedback(article, bioState.practice[id]);
    persistState("Practice feedback saved.");
    updatePracticeHub();
  }

  function restorePractice() {
    document.querySelectorAll("[data-practice-id]").forEach((article) => {
      const id = article.getAttribute("data-practice-id");
      const choice = bioState.practice[id];
      if (!choice) return;
      const radio = Array.from(article.querySelectorAll("input[type='radio']")).find((item) => item.value === choice);
      if (radio) radio.checked = true;
      renderPracticeFeedback(article, choice);
    });
  }

  function updatePracticeHub() {
    const ids = Object.keys(BIO_PRACTICE);
    const submitted = ids.filter((id) => Boolean(bioState.practice[id])).length;
    document.querySelectorAll("[data-practice-complete-count]").forEach((node) => node.textContent = String(submitted));
    document.querySelectorAll("[data-practice-progress-fill]").forEach((node) => node.style.width = String((submitted / ids.length) * 100) + "%");
    BIO_COURSE_LESSONS.forEach((lessonId) => {
      const lessonIds = ids.filter((id) => id.startsWith(lessonId + "-check"));
      const count = lessonIds.filter((id) => Boolean(bioState.practice[id])).length;
      document.querySelectorAll("[data-practice-set-status='" + lessonId + "']").forEach((node) => node.textContent = count + " of " + lessonIds.length + " submitted");
    });
    Array.from({ length: 5 }, (_, index) => "module-" + (index + 1)).forEach((setId) => {
      const setIds = ids.filter((id) => BIO_PRACTICE[id]?.setId === setId);
      const count = setIds.filter((id) => Boolean(bioState.practice[id])).length;
      document.querySelectorAll("[data-practice-set-status='" + setId + "']").forEach((node) => node.textContent = count + " of " + setIds.length + " submitted");
    });
    const finalIds = ids.filter((id) => BIO_PRACTICE[id]?.setId === "final-practice");
    const finalCount = finalIds.filter((id) => Boolean(bioState.practice[id])).length;
    const submittedFinal = Boolean(bioState.finalPractice?.submittedAt);
    document.querySelectorAll("[data-final-practice-status]").forEach((node) => node.textContent = submittedFinal ? "Submitted" : finalCount + " of " + finalIds.length + " answered");
    document.querySelectorAll("[data-final-practice-score]").forEach((node) => node.textContent = submittedFinal ? "Formative score: " + bioState.finalPractice.percent + "%" : "");
  }

  function runGenericModel(interactionId, shouldSave) {
    const definition = BIO_ACTIVITIES.interactions.find((item) => item.id === interactionId);
    if (!definition?.options?.length) return;
    const select = document.querySelector("[data-generic-model-select='" + interactionId + "']");
    const caseButtons = Array.from(document.querySelectorAll("[data-bio-model-case='" + interactionId + "']"));
    const stored = bioState.interactions.generic[interactionId];
    if (!shouldSave && caseButtons.length && !stored) {
      caseButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
      const emptyValues = [
        ["[data-generic-model-label='" + interactionId + "']", "Choose a case"],
        ["[data-generic-model-evidence='" + interactionId + "']", "Select one of the three cases above to inspect the evidence."],
        ["[data-generic-model-explanation='" + interactionId + "']", "The mechanism-based explanation will appear after you make a selection."],
        ["[data-generic-model-progress='" + interactionId + "']", "0 of " + definition.options.length + " cases inspected"]
      ];
      emptyValues.forEach(([selector, value]) => document.querySelectorAll(selector).forEach((node) => node.textContent = value));
      updateModelHub();
      return;
    }
    const previous = stored || { current: definition.options[0].id, seen: [] };
    const pressedCase = caseButtons.find((button) => button.getAttribute("aria-pressed") === "true");
    const selectedId = shouldSave
      ? (pressedCase?.getAttribute("data-bio-model-case-id") || select?.value || previous.current)
      : (previous.current || pressedCase?.getAttribute("data-bio-model-case-id") || select?.value || definition.options[0].id);
    const option = definition.options.find((item) => item.id === selectedId) || definition.options[0];
    const seen = new Set(previous.seen || []);
    if (shouldSave) seen.add(option.id);
    bioState.interactions.generic[interactionId] = { current: option.id, seen: Array.from(seen) };
    if (select) select.value = option.id;
    caseButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-bio-model-case-id") === option.id)));
    const values = [
      ["[data-generic-model-label='" + interactionId + "']", option.label],
      ["[data-generic-model-evidence='" + interactionId + "']", option.evidence],
      ["[data-generic-model-explanation='" + interactionId + "']", option.explanation],
      ["[data-generic-model-progress='" + interactionId + "']", seen.size + " of " + definition.options.length + " cases inspected"]
    ];
    values.forEach(([selector, value]) => document.querySelectorAll(selector).forEach((node) => node.textContent = value));
    if (shouldSave) persistState("Model state saved.");
    updateModelHub();
  }

  function resetGenericModel(interactionId) {
    const definition = BIO_ACTIVITIES.interactions.find((item) => item.id === interactionId);
    if (!definition?.options?.length) return;
    delete bioState.interactions.generic[interactionId];
    runGenericModel(interactionId, false);
    persistState("This model was reset; other work was preserved.");
  }

  function submitFinalPractice() {
    const finalIds = Object.keys(BIO_PRACTICE).filter((id) => BIO_PRACTICE[id]?.setId === "final-practice");
    const missing = finalIds.filter((id) => !bioState.practice[id]);
    if (missing.length) {
      document.querySelectorAll("[data-final-practice-status]").forEach((node) => node.textContent = "Answer all " + finalIds.length + " questions before submitting (" + missing.length + " remaining)." );
      document.querySelector("[data-practice-id='" + missing[0] + "'] input")?.focus();
      return;
    }
    const correct = finalIds.filter((id) => bioState.practice[id] === String(BIO_PRACTICE[id].answerKey)).length;
    const percent = Math.round((correct / finalIds.length) * 100);
    bioState.finalPractice = { submittedAt: new Date().toISOString(), percent, correct, total: finalIds.length };
    persistState("Final practice submitted and saved.");
    updatePracticeHub();
    updateCourseProgress();
  }

  function selectActionPotentialStage(stageId, shouldSave) {
    const stage = BIO_AP_STAGES[stageId];
    if (!stage) return;
    bioState.interactions.actionPotential.current = stageId;
    const seen = new Set(bioState.interactions.actionPotential.seen || []);
    seen.add(stageId);
    bioState.interactions.actionPotential.seen = Array.from(seen);
    document.querySelectorAll("[data-ap-stage-button]").forEach((button) => button.setAttribute("aria-pressed", String(button.getAttribute("data-ap-stage-button") === stageId)));
    document.querySelectorAll("[data-ap-stage]").forEach((point) => point.setAttribute("data-active", String(point.getAttribute("data-ap-stage") === stageId)));
    const values = { "[data-ap-stage-name]": stage.name, "[data-ap-voltage]": stage.voltage, "[data-ap-channels]": stage.channels, "[data-ap-explanation]": stage.explanation };
    Object.entries(values).forEach(([selector, value]) => document.querySelectorAll(selector).forEach((node) => node.textContent = value));
    document.querySelectorAll("[data-ap-progress]").forEach((node) => node.textContent = seen.size + " of 6 stages inspected");
    if (shouldSave) persistState("Model state saved.");
    updateModelHub();
  }

  function resetActionPotentialModel() {
    bioState.interactions.actionPotential = { current: "rest", seen: ["rest"] };
    selectActionPotentialStage("rest", false);
    persistState("The action-potential model was reset; other work was preserved.");
  }

  function renderSvgText(group, x, y, textValue, anchor) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
    node.setAttribute("x", String(x)); node.setAttribute("y", String(y));
    node.setAttribute("fill", "#5b635d"); node.setAttribute("font-size", "14"); node.setAttribute("font-family", "Work Sans, sans-serif");
    if (anchor) node.setAttribute("text-anchor", anchor);
    node.textContent = textValue; group.append(node);
  }

  function renderGlucoseChart(scenario) {
    const svg = document.querySelector("[data-glucose-chart]");
    if (!svg) return;
    const grid = svg.querySelector("[data-glucose-chart-grid]");
    const pointsGroup = svg.querySelector("[data-glucose-chart-points]");
    const curve = svg.querySelector("[data-glucose-chart-path]");
    grid.replaceChildren(); pointsGroup.replaceChildren();
    const left = 70, right = 720, top = 30, bottom = 300, maxY = 15;
    [0, 5, 10, 15].forEach((value) => {
      const y = bottom - (value / maxY) * (bottom - top);
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", String(left)); line.setAttribute("x2", String(right)); line.setAttribute("y1", String(y)); line.setAttribute("y2", String(y)); line.setAttribute("stroke", value === 0 ? "#39423d" : "#d9ded8"); line.setAttribute("stroke-width", "2"); grid.append(line);
      renderSvgText(grid, left - 12, y + 5, String(value), "end");
    });
    const coordinates = scenario.glucose.map((value, index) => {
      const x = left + (index / (scenario.glucose.length - 1)) * (right - left);
      const y = bottom - (value / maxY) * (bottom - top);
      return { x, y, value, time: scenario.timesMinutes[index] };
    });
    curve.setAttribute("d", coordinates.map((point, index) => (index ? "L" : "M") + point.x + " " + point.y).join(" "));
    coordinates.forEach((point) => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", String(point.x)); circle.setAttribute("cy", String(point.y)); circle.setAttribute("r", "6"); circle.setAttribute("fill", "#fff"); circle.setAttribute("stroke", "#146c60"); circle.setAttribute("stroke-width", "3"); pointsGroup.append(circle);
      renderSvgText(pointsGroup, point.x, bottom + 28, point.time + " min", "middle");
      renderSvgText(pointsGroup, point.x, point.y - 12, String(point.value), "middle");
    });
    const description = svg.querySelector("[data-glucose-chart-desc]");
    if (description) description.textContent = scenario.label + ": glucose values " + scenario.glucose.join(", ") + " millimoles per litre at " + scenario.timesMinutes.join(", ") + " minutes.";
  }

  function renderGlucoseTable(scenario) {
    const header = document.querySelector("[data-glucose-time-row]");
    const values = document.querySelector("[data-glucose-value-row]");
    if (!header || !values) return;
    header.replaceChildren(); values.replaceChildren();
    const blank = document.createElement("th"); blank.scope = "col"; blank.textContent = "Measure"; header.append(blank);
    const label = document.createElement("th"); label.scope = "row"; label.textContent = "Glucose (mmol/L)"; values.append(label);
    scenario.timesMinutes.forEach((time, index) => {
      const heading = document.createElement("th"); heading.scope = "col"; heading.textContent = time + " min"; header.append(heading);
      const cell = document.createElement("td"); cell.textContent = String(scenario.glucose[index]); values.append(cell);
    });
    document.querySelectorAll("[data-glucose-table-caption]").forEach((node) => node.textContent = scenario.label + " values");
  }

  function runGlucoseScenario(shouldSave) {
    const select = document.querySelector("[data-glucose-scenario]");
    const id = shouldSave
      ? (select?.value || bioState.interactions.bloodGlucose.current)
      : (bioState.interactions.bloodGlucose.current || select?.value);
    const scenario = BIO_DATASET.simulatorScenarios.find((item) => item.id === id) || BIO_DATASET.simulatorScenarios[0];
    if (!scenario) return;
    bioState.interactions.bloodGlucose.current = scenario.id;
    const seen = new Set(bioState.interactions.bloodGlucose.seenScenarios || []);
    if (shouldSave) seen.add(scenario.id);
    bioState.interactions.bloodGlucose.seenScenarios = Array.from(seen);
    if (select) select.value = scenario.id;
    const values = { "[data-glucose-scenario-label]": scenario.label, "[data-glucose-insulin]": scenario.insulinSignal, "[data-glucose-glucagon]": scenario.glucagonSignal, "[data-glucose-mechanism]": scenario.mechanism };
    Object.entries(values).forEach(([selector, value]) => document.querySelectorAll(selector).forEach((node) => node.textContent = value));
    renderGlucoseChart(scenario); renderGlucoseTable(scenario);
    if (shouldSave) persistState("Glucose model state saved.");
    updateModelHub();
  }

  function resetGlucoseModel() {
    bioState.interactions.bloodGlucose = { current: "regulated-meal", seenScenarios: [] };
    runGlucoseScenario(false);
    persistState("The blood-glucose model was reset; other work was preserved.");
  }

  function updateModelHub() {
    const apSeen = new Set(bioState.interactions.actionPotential.seen || []).size;
    const glucoseSeen = new Set(bioState.interactions.bloodGlucose.seenScenarios || []).size;
    document.querySelectorAll("[data-model-status='interaction-action-potential-explorer']").forEach((node) => node.textContent = apSeen >= 6 ? "All 6 stages inspected" : apSeen + " of 6 stages inspected");
    document.querySelectorAll("[data-model-status='interaction-blood-glucose-simulator']").forEach((node) => node.textContent = glucoseSeen + " of 4 scenarios run");
    BIO_ACTIVITIES.interactions.filter((item) => item.options?.length).forEach((interaction) => {
      const seen = new Set(bioState.interactions.generic[interaction.id]?.seen || []).size;
      document.querySelectorAll("[data-model-status='" + interaction.id + "']").forEach((node) => node.textContent = seen ? seen + " of " + interaction.options.length + " cases inspected" : "Not started");
    });
  }

  function artifactText(id) {
    const artifact = BIO_ARTIFACTS[id];
    if (!artifact) return "";
    const lines = ["Biology 30 — " + id];
    artifact.fields.forEach((field) => lines.push("\\n" + field.label + "\\n" + (bioState.responses[field.id] || "")));
    return lines.join("\\n");
  }

  function saveArtifact(id) {
    const artifact = BIO_ARTIFACTS[id];
    if (!artifact) return;
    artifact.fields.forEach((field) => {
      const input = Array.from(document.querySelectorAll("[data-bio-response-id]")).find((node) => node.getAttribute("data-bio-response-id") === field.id);
      if (input) saveResponseField(input, false);
    });
    bioState.artifacts[id] = { savedAt: new Date().toISOString(), fieldIds: artifact.fields.map((field) => field.id) };
    persistState("Artifact draft saved.");
    updateArtifactViews();
  }

  function cloneForPrint(node, title) {
    document.querySelector(".print-job-root")?.remove();
    const root = document.createElement("main"); root.className = "print-job-root";
    const heading = document.createElement("h1"); heading.textContent = title; root.append(heading, node.cloneNode(true));
    document.body.append(root); document.body.classList.add("print-job-active"); window.print();
  }

  async function copyText(value, statusNode) {
    try {
      await navigator.clipboard.writeText(value);
      if (statusNode) statusNode.textContent = "Copied";
    } catch {
      if (statusNode) statusNode.textContent = "Copy unavailable. Select the text and copy manually.";
    }
  }

  function updateArtifactViews() {
    Object.keys(BIO_ARTIFACTS).forEach((id) => {
      const saved = Boolean(bioState.artifacts[id]?.savedAt);
      document.querySelectorAll("[data-artifact-status='" + id + "']").forEach((node) => node.textContent = saved ? "Saved draft restored" : "Draft not saved");
    });
    const index = document.querySelector("[data-artifact-index]");
    if (index) {
      index.replaceChildren();
      Object.keys(BIO_ARTIFACTS).forEach((id) => {
        const item = document.createElement("article");
        const title = document.createElement("strong"); title.textContent = BIO_ARTIFACTS[id].title || id;
        const status = document.createElement("span"); status.textContent = bioState.artifacts[id]?.savedAt ? "Saved" : "Not saved";
        item.append(title, status); index.append(item);
      });
    }
    const count = Object.keys(BIO_ARTIFACTS).filter((id) => bioState.artifacts[id]?.savedAt).length;
    document.querySelectorAll("[data-artifact-count]").forEach((node) => node.textContent = count + " of " + Object.keys(BIO_ARTIFACTS).length + " available artifacts saved");
  }

  function renderNotebook() {
    const list = document.querySelector("[data-notebook-list]");
    if (list) {
      list.replaceChildren();
      if (!bioState.notebook.length) {
        const empty = document.createElement("p"); empty.className = "bio-empty-state"; empty.textContent = "Saved entries will appear here."; list.append(empty);
      } else {
        bioState.notebook.forEach((entry) => {
          const article = document.createElement("article"); article.className = "bio-notebook-entry";
          const header = document.createElement("header"); const title = document.createElement("h3"); title.textContent = entry.title;
          const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "Remove"; remove.setAttribute("data-remove-notebook-entry", entry.id); remove.setAttribute("aria-label", "Remove notebook entry " + entry.title);
          const body = document.createElement("p"); body.textContent = entry.body;
          const time = document.createElement("small"); time.textContent = "Saved " + new Date(entry.savedAt).toLocaleString();
          header.append(title, remove); article.append(header, body, time); list.append(article);
        });
      }
    }
    document.querySelectorAll("[data-notebook-count]").forEach((node) => node.textContent = bioState.notebook.length + " of 10 entries");
  }

  function saveNotebookEntry() {
    const titleField = document.querySelector("[data-notebook-title]");
    const bodyField = document.querySelector("[data-notebook-body]");
    const status = document.querySelector("[data-notebook-status]");
    const title = String(titleField?.value || "").trim().slice(0, 60);
    const body = String(bodyField?.value || "").trim().slice(0, 540);
    if (!title || !body) { if (status) status.textContent = "Add both a title and an observation before saving."; return; }
    if (bioState.notebook.length >= 10) { if (status) status.textContent = "Notebook limit reached. Export or remove an entry before adding another."; return; }
    bioState.notebook.unshift({ id: "note-" + Date.now(), title, body, savedAt: new Date().toISOString() });
    if (titleField) titleField.value = ""; if (bodyField) bodyField.value = "";
    persistState("Notebook entry saved."); renderNotebook(); if (status) status.textContent = "Entry saved.";
  }

  function notebookText() {
    const lines = ["Biology 30 — Investigation Notebook"];
    bioState.notebook.forEach((entry) => lines.push("\\n" + entry.title + "\\n" + entry.body));
    Object.keys(BIO_ARTIFACTS).forEach((id) => { if (bioState.artifacts[id]?.savedAt) lines.push("\\n---\\n" + artifactText(id)); });
    return lines.join("\\n");
  }

  function updateCourseProgress() {
    const complete = BIO_COURSE_LESSONS.filter((id) => bioState.completions.includes(id));
    const percent = Math.round((complete.length / BIO_COURSE_LESSONS.length) * 100);
    document.querySelectorAll("[data-progress-count]").forEach((node) => node.textContent = complete.length + " / " + BIO_COURSE_LESSONS.length + " lesson exits");
    document.querySelectorAll("[data-progress-count-inline]").forEach((node) => node.textContent = complete.length + "/" + BIO_COURSE_LESSONS.length);
    document.querySelectorAll("[data-progress-percent]").forEach((node) => node.textContent = percent + "%");
    document.querySelectorAll("[data-progress-fill]").forEach((node) => node.style.width = percent + "%");
    BIO_COURSE_LESSONS.forEach((id) => document.querySelectorAll("[data-lesson-status='" + id + "']").forEach((node) => node.textContent = bioState.completions.includes(id) ? "Lesson completed" : "Exit response required"));
    try { window.localStorage.setItem(BIO_SHELL_COMPLETION_KEY, JSON.stringify(complete)); } catch {}
  }

  function completeLesson(id) {
    const simpleLesson = id.match(/^lesson-(\\d+)$/);
    const responseId = BIO_COURSE_SLUG + ":lesson:" + (simpleLesson ? simpleLesson[1] : id) + ":exit";
    const field = Array.from(document.querySelectorAll("[data-bio-response-id]")).find((node) => node.getAttribute("data-bio-response-id") === responseId);
    const status = document.querySelector("[data-lesson-status='" + id + "']");
    if (!field || String(field.value || "").trim().length < 25) {
      if (status) status.textContent = "Add a specific 2–3 sentence explanation before completing.";
      field?.focus(); return;
    }
    saveResponseField(field, false);
    if (!bioState.completions.includes(id)) bioState.completions.push(id);
    persistState("Lesson exit saved."); updateCourseProgress();
  }

  function restoreAll() {
    restoreResponseFields(); restorePractice();
    selectActionPotentialStage(bioState.interactions.actionPotential.current || "rest", false);
    runGlucoseScenario(false);
    BIO_ACTIVITIES.interactions.filter((item) => item.options?.length).forEach((interaction) => runGenericModel(interaction.id, false));
    updatePracticeHub(); updateModelHub(); updateArtifactViews(); renderNotebook(); updateCourseProgress();
  }

  function saveAndExit() {
    window.clearTimeout(saveTimer);
    const saved = persistState("Progress saved. You can close this course window.");
    const api = initializeScorm();
    if (saved && api) {
      try { api.Terminate(""); } catch {}
    }
    document.querySelector("[data-bio-save-exit]")?.setAttribute("data-saved", "true");
  }

  function focusHubDestination(destination) {
    if (!destination) return;
    window.requestAnimationFrame(() => {
      destination.scrollIntoView({ block: "start", behavior: "auto" });
      const labelledBy = destination.getAttribute("aria-labelledby");
      const heading = (labelledBy ? document.getElementById(labelledBy) : null) || destination.querySelector("h2, h3");
      if (!heading) return;
      heading.setAttribute("tabindex", "-1");
      try { heading.focus({ preventScroll: true }); } catch { heading.focus(); }
    });
  }

  function openModelFromHub(interactionId) {
    if (!interactionId) return;
    const model = Array.from(document.querySelectorAll("[data-bio-interaction]")).find((node) => node.getAttribute("data-bio-interaction") === interactionId);
    focusHubDestination(model);
  }

  function openPracticeFromHub(lessonId) {
    if (!lessonId) return;
    const practice = Array.from(document.querySelectorAll("[data-bio-practice]")).find((node) => node.getAttribute("data-bio-practice") === lessonId);
    focusHubDestination(practice);
  }

  document.addEventListener("click", (event) => {
    const modelLink = event.target.closest("[data-open-bio-model]");
    const practiceLink = event.target.closest("[data-open-bio-practice]");
    if (!modelLink && !practiceLink) return;
    window.setTimeout(() => {
      if (modelLink) openModelFromHub(modelLink.getAttribute("data-open-bio-model"));
      if (practiceLink) openPracticeFromHub(practiceLink.getAttribute("data-open-bio-practice"));
    }, 0);
  }, true);

  document.addEventListener("input", (event) => {
    const field = event.target.closest("[data-bio-response-id]");
    if (field) saveResponseField(field, false);
  });
  document.addEventListener("change", (event) => {
    const field = event.target.closest("[data-bio-response-id]");
    if (field) saveResponseField(field, false);
  });
  document.addEventListener("click", (event) => {
    const stageButton = event.target.closest("[data-ap-stage-button]");
    if (stageButton) selectActionPotentialStage(stageButton.getAttribute("data-ap-stage-button"), true);
    const runModel = event.target.closest("[data-run-glucose-model]");
    if (runModel) runGlucoseScenario(true);
    const caseButton = event.target.closest("[data-bio-model-case]");
    if (caseButton) {
      const interactionId = caseButton.getAttribute("data-bio-model-case");
      document.querySelectorAll("[data-bio-model-case='" + interactionId + "']").forEach((button) => button.setAttribute("aria-pressed", String(button === caseButton)));
      runGenericModel(interactionId, true);
    }
    const runGeneric = event.target.closest("[data-run-bio-model]");
    if (runGeneric) runGenericModel(runGeneric.getAttribute("data-run-bio-model"), true);
    const resetGeneric = event.target.closest("[data-reset-bio-model]");
    if (resetGeneric) resetGenericModel(resetGeneric.getAttribute("data-reset-bio-model"));
    if (event.target.closest("[data-reset-ap-model]")) resetActionPotentialModel();
    if (event.target.closest("[data-reset-glucose-model]")) resetGlucoseModel();
    const check = event.target.closest("[data-check-practice]");
    if (check) submitPractice(check);
    const saveArtifactButton = event.target.closest("[data-save-artifact]");
    if (saveArtifactButton) saveArtifact(saveArtifactButton.getAttribute("data-save-artifact"));
    const printArtifactButton = event.target.closest("[data-print-artifact]");
    if (printArtifactButton) { const id = printArtifactButton.getAttribute("data-print-artifact"); const node = document.querySelector("[data-artifact-id='" + id + "']"); if (node) cloneForPrint(node, "Biology 30 — Portfolio Artifact"); }
    const copyArtifactButton = event.target.closest("[data-copy-artifact]");
    if (copyArtifactButton) { const id = copyArtifactButton.getAttribute("data-copy-artifact"); copyText(artifactText(id), document.querySelector("[data-artifact-status='" + id + "']")); }
    const complete = event.target.closest("[data-complete-bio-lesson]");
    if (complete) completeLesson(complete.getAttribute("data-complete-bio-lesson"));
    if (event.target.closest("[data-save-notebook-entry]")) saveNotebookEntry();
    if (event.target.closest("[data-clear-notebook-draft]")) { const title = document.querySelector("[data-notebook-title]"); const body = document.querySelector("[data-notebook-body]"); if (title) title.value = ""; if (body) body.value = ""; }
    const remove = event.target.closest("[data-remove-notebook-entry]");
    if (remove) { bioState.notebook = bioState.notebook.filter((entry) => entry.id !== remove.getAttribute("data-remove-notebook-entry")); persistState("Notebook entry removed."); renderNotebook(); }
    if (event.target.closest("[data-print-notebook]")) { const node = document.querySelector("#investigation-notebook"); if (node) cloneForPrint(node, "Biology 30 — Investigation Notebook"); }
    if (event.target.closest("[data-copy-notebook]")) copyText(notebookText(), document.querySelector("[data-notebook-export-status]"));
    if (event.target.closest("[data-submit-final-practice]")) submitFinalPractice();
    if (event.target.closest("[data-bio-save-exit]")) saveAndExit();
  });
  document.addEventListener("keydown", (event) => {
    const button = event.target.closest("[data-ap-stage-button]");
    if (!button || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(document.querySelectorAll("[data-ap-stage-button]"));
    const index = buttons.indexOf(button); const offset = event.key === "ArrowRight" ? 1 : -1;
    const next = buttons[(index + offset + buttons.length) % buttons.length]; next.focus(); next.click();
  });
  window.addEventListener("hashchange", () => { bioState.location = (location.hash || "#overview").slice(1); scheduleSave("Location saved."); });
  window.addEventListener("beforeunload", () => { window.clearTimeout(saveTimer); persistState("Progress saved."); });
  window.addEventListener("afterprint", () => { document.body.classList.remove("print-job-active"); document.querySelector(".print-job-root")?.remove(); });

  loadState();
  bioState.location = (location.hash || ("#" + (bioState.location || "overview"))).slice(1);
  restoreAll();
  globalStatus(scormApi ? "Progress restored from available course storage." : "Progress restored on this device.", "saved");
})();
</script>`;
}
