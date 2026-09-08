export const PROJECT_SLUG = "pe10-online-pilot";
export const STATE_SCHEMA_VERSION = 1;
export const STATE_STORAGE_KEY = "canvas-helper:pe10-online-pilot:state:v1";
export const STATE_CHARACTER_LIMIT = 48_000;
export const MAX_LOG_ENTRIES = 60;
export const TOTAL_REQUIRED_MINUTES = 3_000;
export const DIMENSION_REQUIRED_MINUTES = 300;
export const DIMENSION_MAXIMUM_MINUTES = 1_800;

export const DIMENSIONS = Object.freeze([
  { id: "alternative-environments", label: "Alternative environments" },
  { id: "dance", label: "Dance" },
  { id: "games", label: "Games" },
  { id: "gymnastics-body-control", label: "Gymnastics and body control" },
  { id: "individual-activities", label: "Individual activities" }
]);

export const CHECKPOINT_TARGETS = Object.freeze([5, 10, 15, 20, 25, 30, 35, 40, 45, 50]);

export const ASSIGNMENT_FIELDS = Object.freeze({
  "assignment-1": ["startingPoint", "goals", "weeklyPlan", "safetyPlan"],
  "assignment-2": ["context", "evidence", "adaptation", "cooperation"],
  "assignment-3": ["demands", "fuelHydration", "recovery", "adjustment"],
  "assignment-4": ["claim", "evidenceCheck", "contextImpact", "conclusion"],
  "assignment-5": ["response", "aed", "growth", "activeLiving"]
});

export const STATE_LIMITS = Object.freeze({
  logEntry: Object.freeze({
    id: 48,
    activity: 48,
    learningFocus: 64,
    progression: 80,
    reflection: 100,
    verifierName: 40,
    verifierRole: 40
  }),
  checkpointField: 180,
  assignmentField: 450,
  alternateReference: 160
});

const ROUTES = Object.freeze([
  "overview",
  "how-it-works",
  "safety-planning",
  "activity-log",
  "checkpoints",
  "assignments",
  "portfolio",
  "resources"
]);

const INTENSITIES = new Set(["light", "moderate", "vigorous", "mixed"]);
const DIMENSION_IDS = new Set(DIMENSIONS.map((dimension) => dimension.id));
const ASSIGNMENT_IDS = Object.freeze(Object.keys(ASSIGNMENT_FIELDS));
const CHECKPOINT_KEYS = new Set(CHECKPOINT_TARGETS.map(String));
const MIN_CHECKPOINT_RESPONSE = 20;
const MIN_ASSIGNMENT_RESPONSE = 40;
const SERIALIZED_STATE_KEYS = Object.freeze([
  "schemaVersion",
  "projectSlug",
  "logEntries",
  "checkpoints",
  "assignmentDrafts",
  "alternateEvidence",
  "completion",
  "updatedAt"
]);

function currentIso() {
  return new Date().toISOString();
}

function localDateString(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasOnlyKeys(value, allowed) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function boundedString(value, label, maximum, options = {}) {
  if (typeof value !== "string") throw new Error(`${label} must be text.`);
  const result = value.trim();
  if (options.required && !result) throw new Error(`${label} is required.`);
  if (result.length > maximum) throw new Error(`${label} must be ${maximum} characters or fewer.`);
  return result;
}

function validDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function percent(value, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function formatHours(minutes) {
  return (minutes / 60).toFixed(1);
}

function labelForDimension(id) {
  return DIMENSIONS.find((dimension) => dimension.id === id)?.label || id;
}

function labelForIntensity(id) {
  return id ? `${id.charAt(0).toUpperCase()}${id.slice(1)}` : "";
}

function assignmentDefaults() {
  return Object.fromEntries(ASSIGNMENT_IDS.map((assignmentId) => [
    assignmentId,
    Object.fromEntries(ASSIGNMENT_FIELDS[assignmentId].map((field) => [field, ""]))
  ]));
}

export function createEmptyState(now = currentIso()) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    projectSlug: PROJECT_SLUG,
    logEntries: [],
    checkpoints: {},
    assignmentDrafts: assignmentDefaults(),
    alternateEvidence: {
      teacherApproved: false,
      dimensions: [],
      planReference: ""
    },
    completion: {
      safetyPlanningComplete: false,
      lastRoute: "overview",
      portfolioAssignmentIds: []
    },
    updatedAt: now
  };
}

function encodeEntry(entry) {
  return [
    entry.id,
    entry.date,
    entry.activity,
    entry.durationMinutes,
    entry.dimension,
    entry.intensity,
    entry.learningFocus,
    entry.progression,
    entry.reflection,
    entry.safetyConfirmed,
    entry.verifierName,
    entry.verifierRole
  ];
}

function decodeEntry(tuple, today) {
  if (!Array.isArray(tuple) || tuple.length !== 12) throw new Error("A saved log entry has an invalid structure.");
  const [id, date, activity, durationMinutes, dimension, intensity, learningFocus, progression, reflection, safetyConfirmed, verifierName, verifierRole] = tuple;
  const draft = {
    id: boundedString(id, "Log entry id", STATE_LIMITS.logEntry.id, { required: true }),
    date,
    activity,
    durationMinutes,
    dimension,
    intensity,
    learningFocus,
    progression,
    reflection,
    safetyConfirmed,
    verifierName,
    verifierRole
  };
  if (!/^[A-Za-z0-9._:-]+$/.test(draft.id)) throw new Error("A saved log entry id contains unsupported characters.");
  const validation = validateLogEntryDraft(draft, [], draft.id, today);
  if (!validation.valid || !validation.entry) throw new Error(validation.errors[0] || "A saved log entry is invalid.");
  return validation.entry;
}

function buildSerializableState(state, now = state.updatedAt || currentIso()) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    projectSlug: PROJECT_SLUG,
    logEntries: state.logEntries.map(encodeEntry),
    checkpoints: Object.fromEntries(CHECKPOINT_TARGETS.flatMap((target) => {
      const checkpoint = state.checkpoints[String(target)];
      return checkpoint ? [[String(target), [checkpoint.reflection || "", checkpoint.nextStep || ""]]] : [];
    })),
    assignmentDrafts: Object.fromEntries(ASSIGNMENT_IDS.map((assignmentId) => [
      assignmentId,
      Object.fromEntries(ASSIGNMENT_FIELDS[assignmentId].map((field) => [field, state.assignmentDrafts[assignmentId]?.[field] || ""]))
    ])),
    alternateEvidence: {
      teacherApproved: Boolean(state.alternateEvidence.teacherApproved),
      dimensions: state.alternateEvidence.teacherApproved ? [...state.alternateEvidence.dimensions] : [],
      planReference: state.alternateEvidence.teacherApproved ? state.alternateEvidence.planReference || "" : ""
    },
    completion: {
      safetyPlanningComplete: Boolean(state.completion.safetyPlanningComplete),
      lastRoute: ROUTES.includes(state.completion.lastRoute) ? state.completion.lastRoute : "overview",
      portfolioAssignmentIds: validatePortfolioAssignmentIds(portfolioAssignmentIdsOrLegacyEmpty(state.completion))
    },
    updatedAt: now
  };
}

export function serializeState(state, now = state.updatedAt || currentIso()) {
  const serialized = JSON.stringify(buildSerializableState(state, now));
  if (serialized.length > STATE_CHARACTER_LIMIT) {
    throw new Error(`Saved course state would be ${serialized.length.toLocaleString()} characters; the limit is ${STATE_CHARACTER_LIMIT.toLocaleString()}.`);
  }
  return serialized;
}

export function parseStateBackup(text, options = {}) {
  if (typeof text !== "string") throw new Error("Backup content must be text.");
  if (text.length > STATE_CHARACTER_LIMIT) throw new Error(`Backup exceeds the ${STATE_CHARACTER_LIMIT.toLocaleString()}-character limit.`);
  let saved;
  try {
    saved = JSON.parse(text);
  } catch {
    throw new Error("Backup is not valid JSON.");
  }
  if (!isPlainObject(saved) || !hasOnlyKeys(saved, SERIALIZED_STATE_KEYS)) throw new Error("Backup has an unsupported structure.");
  if (!Number.isInteger(saved.schemaVersion)) throw new Error("Backup schema version is missing.");
  if (saved.schemaVersion > STATE_SCHEMA_VERSION) throw new Error("Backup was created by a newer course version and cannot be restored safely.");
  if (saved.schemaVersion !== STATE_SCHEMA_VERSION) throw new Error("Backup schema version is not supported.");
  if (saved.projectSlug !== PROJECT_SLUG) throw new Error("Backup belongs to a different course project.");
  if (!Array.isArray(saved.logEntries) || saved.logEntries.length > MAX_LOG_ENTRIES) throw new Error(`Backup may contain at most ${MAX_LOG_ENTRIES} log entries.`);
  if (typeof saved.updatedAt !== "string" || !Number.isFinite(Date.parse(saved.updatedAt))) throw new Error("Backup update time is invalid.");

  const today = options.today instanceof Date ? options.today : new Date();
  const state = createEmptyState(saved.updatedAt);
  state.logEntries = saved.logEntries.map((entry) => decodeEntry(entry, today));

  if (!isPlainObject(saved.checkpoints)) throw new Error("Backup checkpoints are invalid.");
  if (![...Object.keys(saved.checkpoints)].every((key) => CHECKPOINT_KEYS.has(key))) throw new Error("Backup contains an unknown checkpoint.");
  for (const [key, value] of Object.entries(saved.checkpoints)) {
    if (!Array.isArray(value) || value.length !== 2) throw new Error(`Checkpoint ${key} is invalid.`);
    state.checkpoints[key] = {
      reflection: boundedString(value[0], `Checkpoint ${key} reflection`, STATE_LIMITS.checkpointField),
      nextStep: boundedString(value[1], `Checkpoint ${key} next step`, STATE_LIMITS.checkpointField)
    };
  }

  if (!isPlainObject(saved.assignmentDrafts) || !hasOnlyKeys(saved.assignmentDrafts, ASSIGNMENT_IDS)) throw new Error("Backup assignments are invalid.");
  for (const assignmentId of ASSIGNMENT_IDS) {
    const draft = saved.assignmentDrafts[assignmentId];
    if (!isPlainObject(draft) || !hasOnlyKeys(draft, ASSIGNMENT_FIELDS[assignmentId])) throw new Error(`${assignmentId} has an invalid structure.`);
    for (const field of ASSIGNMENT_FIELDS[assignmentId]) {
      state.assignmentDrafts[assignmentId][field] = boundedString(draft[field], `${assignmentId} ${field}`, STATE_LIMITS.assignmentField);
    }
  }

  if (!isPlainObject(saved.alternateEvidence) || !hasOnlyKeys(saved.alternateEvidence, ["teacherApproved", "dimensions", "planReference"])) throw new Error("Backup alternate-evidence settings are invalid.");
  if (typeof saved.alternateEvidence.teacherApproved !== "boolean" || !Array.isArray(saved.alternateEvidence.dimensions)) throw new Error("Backup alternate-evidence settings are invalid.");
  const alternateDimensions = saved.alternateEvidence.dimensions;
  if (alternateDimensions.length > DIMENSIONS.length || new Set(alternateDimensions).size !== alternateDimensions.length || alternateDimensions.some((id) => !DIMENSION_IDS.has(id))) throw new Error("Backup contains an invalid alternate-evidence dimension.");
  const planReference = boundedString(saved.alternateEvidence.planReference, "Alternate-evidence plan reference", STATE_LIMITS.alternateReference);
  if (!saved.alternateEvidence.teacherApproved && (alternateDimensions.length || planReference)) throw new Error("Alternate-evidence details require teacher approval.");
  state.alternateEvidence = {
    teacherApproved: saved.alternateEvidence.teacherApproved,
    dimensions: [...alternateDimensions],
    planReference
  };

  if (!isPlainObject(saved.completion) || !hasOnlyKeys(saved.completion, ["safetyPlanningComplete", "lastRoute", "portfolioAssignmentIds"])) throw new Error("Backup completion state is invalid.");
  if (typeof saved.completion.safetyPlanningComplete !== "boolean" || !ROUTES.includes(saved.completion.lastRoute)) throw new Error("Backup completion state is invalid.");
  state.completion = {
    safetyPlanningComplete: saved.completion.safetyPlanningComplete,
    lastRoute: saved.completion.lastRoute,
    portfolioAssignmentIds: validatePortfolioAssignmentIds(portfolioAssignmentIdsOrLegacyEmpty(saved.completion))
  };

  const normalized = serializeState(state, saved.updatedAt);
  if (normalized.length > STATE_CHARACTER_LIMIT) throw new Error("Backup exceeds the saved-state limit after validation.");
  return state;
}

export function validateLogEntryDraft(draft, existingEntries = [], editingId = "", today = new Date()) {
  const errors = [];
  const warnings = [];
  const id = cleanText(draft.id || editingId);
  const date = cleanText(draft.date);
  const activity = cleanText(draft.activity);
  const dimension = cleanText(draft.dimension);
  const intensity = cleanText(draft.intensity);
  const learningFocus = cleanText(draft.learningFocus);
  const progression = cleanText(draft.progression);
  const reflection = cleanText(draft.reflection);
  const verifierName = cleanText(draft.verifierName);
  const verifierRole = cleanText(draft.verifierRole);
  const durationMinutes = Number(draft.durationMinutes);

  if (!validDateString(date)) errors.push("Enter a valid activity date.");
  else if (date > localDateString(today)) errors.push("Future activity dates cannot be saved.");
  if (!activity) errors.push("Enter the activity.");
  else if (activity.length > STATE_LIMITS.logEntry.activity) errors.push(`Activity must be ${STATE_LIMITS.logEntry.activity} characters or fewer.`);
  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 720 || durationMinutes % 5 !== 0) errors.push("Duration must be a whole number from 15 to 720 minutes in 5-minute steps.");
  if (!DIMENSION_IDS.has(dimension)) errors.push("Choose a movement dimension.");
  if (!INTENSITIES.has(intensity)) errors.push("Choose an intensity.");
  if (!learningFocus) errors.push("Describe the learning focus.");
  else if (learningFocus.length > STATE_LIMITS.logEntry.learningFocus) errors.push(`Learning focus must be ${STATE_LIMITS.logEntry.learningFocus} characters or fewer.`);
  if (!progression) errors.push("Describe an adaptation or progression.");
  else if (progression.length > STATE_LIMITS.logEntry.progression) errors.push(`Adaptation or progression must be ${STATE_LIMITS.logEntry.progression} characters or fewer.`);
  if (!reflection) errors.push("Add a short reflection.");
  else if (reflection.length > STATE_LIMITS.logEntry.reflection) errors.push(`Reflection must be ${STATE_LIMITS.logEntry.reflection} characters or fewer.`);
  if (verifierName.length > STATE_LIMITS.logEntry.verifierName || verifierRole.length > STATE_LIMITS.logEntry.verifierRole) errors.push("Verifier name and role must each be 40 characters or fewer.");
  if (Boolean(verifierName) !== Boolean(verifierRole)) errors.push("Enter both verifier name and role, or leave both blank.");
  if (/@/.test(`${verifierName}${verifierRole}`) || /\d{7,}/.test(`${verifierName}${verifierRole}`.replace(/\D/g, ""))) errors.push("Do not enter verifier phone numbers or email addresses.");
  if (draft.safetyConfirmed !== true) errors.push("Confirm the safety statement before saving.");

  const duplicate = existingEntries.some((entry) => entry.id !== (editingId || id) && entry.date === date && entry.durationMinutes === durationMinutes && entry.dimension === dimension && entry.activity.trim().toLocaleLowerCase() === activity.toLocaleLowerCase());
  if (duplicate) warnings.push("This looks like another entry with the same date, activity, duration, and dimension. Save only if it is a separate session.");

  const entry = errors.length ? null : {
    id,
    date,
    activity,
    durationMinutes,
    dimension,
    intensity,
    learningFocus,
    progression,
    reflection,
    safetyConfirmed: true,
    verifierName,
    verifierRole
  };
  return { valid: errors.length === 0, errors, warnings, entry };
}

export function calculateReadiness(state) {
  const minutesByDimension = Object.fromEntries(DIMENSIONS.map((dimension) => [dimension.id, 0]));
  for (const entry of state.logEntries) {
    if (DIMENSION_IDS.has(entry.dimension) && Number.isFinite(entry.durationMinutes)) minutesByDimension[entry.dimension] += entry.durationMinutes;
  }
  const totalMinutes = Object.values(minutesByDimension).reduce((sum, minutes) => sum + minutes, 0);
  const approvedAlternates = state.alternateEvidence.teacherApproved ? new Set(state.alternateEvidence.dimensions) : new Set();
  const dimensions = DIMENSIONS.map((dimension) => {
    const minutes = minutesByDimension[dimension.id];
    const alternate = approvedAlternates.has(dimension.id);
    return {
      ...dimension,
      minutes,
      hours: minutes / 60,
      alternate,
      breadthReady: minutes >= DIMENSION_REQUIRED_MINUTES || alternate,
      overMaximum: minutes > DIMENSION_MAXIMUM_MINUTES
    };
  });
  const completedCheckpoints = CHECKPOINT_TARGETS.filter((target) => {
    const checkpoint = state.checkpoints[String(target)];
    return Boolean(checkpoint && cleanText(checkpoint.reflection).length >= MIN_CHECKPOINT_RESPONSE && cleanText(checkpoint.nextStep).length >= MIN_CHECKPOINT_RESPONSE);
  });
  const readyAssignments = ASSIGNMENT_IDS.filter((assignmentId) => ASSIGNMENT_FIELDS[assignmentId].every((field) => cleanText(state.assignmentDrafts[assignmentId]?.[field]).length >= MIN_ASSIGNMENT_RESPONSE));
  const overMaximum = dimensions.filter((dimension) => dimension.overMaximum);
  const dimensionsReady = dimensions.filter((dimension) => dimension.breadthReady);
  const checks = {
    safetyPlanning: Boolean(state.completion.safetyPlanningComplete),
    totalHours: totalMinutes >= TOTAL_REQUIRED_MINUTES,
    dimensionBreadth: dimensionsReady.length === DIMENSIONS.length,
    dimensionMaximum: overMaximum.length === 0,
    checkpoints: completedCheckpoints.length === CHECKPOINT_TARGETS.length,
    assignments: readyAssignments.length === ASSIGNMENT_IDS.length
  };
  return {
    totalMinutes,
    totalHours: totalMinutes / 60,
    remainingMinutes: Math.max(0, TOTAL_REQUIRED_MINUTES - totalMinutes),
    dimensions,
    dimensionsReadyCount: dimensionsReady.length,
    overMaximumDimensions: overMaximum,
    completedCheckpoints,
    checkpointsCompleted: completedCheckpoints.length,
    readyAssignments,
    assignmentsReady: readyAssignments.length,
    checks,
    overallReady: Object.values(checks).every(Boolean)
  };
}

function validatePortfolioAssignmentIds(value) {
  if (!Array.isArray(value) || value.length > ASSIGNMENT_IDS.length) throw new Error("Portfolio assignment selection is invalid.");
  if (value.some((assignmentId) => typeof assignmentId !== "string" || !ASSIGNMENT_IDS.includes(assignmentId))) throw new Error("Portfolio assignment selection contains an unknown assignment.");
  if (new Set(value).size !== value.length) throw new Error("Portfolio assignment selection contains a duplicate assignment.");
  const canonical = ASSIGNMENT_IDS.filter((assignmentId) => value.includes(assignmentId));
  if (canonical.some((assignmentId, index) => assignmentId !== value[index])) throw new Error("Portfolio assignments must be stored in course order.");
  return canonical;
}

function portfolioAssignmentIdsOrLegacyEmpty(completion) {
  return completion?.portfolioAssignmentIds === undefined ? [] : completion.portfolioAssignmentIds;
}

export function saveAssignmentToPortfolio(state, assignmentId) {
  if (!ASSIGNMENT_IDS.includes(assignmentId)) throw new Error("Choose a recognized assignment to save.");
  const ready = ASSIGNMENT_FIELDS[assignmentId].every((field) => cleanText(state.assignmentDrafts?.[assignmentId]?.[field]).length >= MIN_ASSIGNMENT_RESPONSE);
  if (!ready) throw new Error("Complete all four assignment responses before saving to the Portfolio.");
  const savedIds = validatePortfolioAssignmentIds(portfolioAssignmentIdsOrLegacyEmpty(state.completion));
  state.completion.portfolioAssignmentIds = ASSIGNMENT_IDS.filter((id) => id === assignmentId || savedIds.includes(id));
  return [...state.completion.portfolioAssignmentIds];
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

export function buildLogCsv(state) {
  const header = ["Date", "Activity", "Duration minutes", "Duration hours", "Movement dimension", "Intensity", "Learning focus", "Adaptation or progression", "Reflection", "Safety confirmed", "Verifier name", "Verifier role"];
  const rows = [...state.logEntries]
    .sort((left, right) => left.date.localeCompare(right.date) || left.activity.localeCompare(right.activity))
    .map((entry) => [entry.date, entry.activity, entry.durationMinutes, formatHours(entry.durationMinutes), labelForDimension(entry.dimension), labelForIntensity(entry.intensity), entry.learningFocus, entry.progression, entry.reflection, entry.safetyConfirmed ? "Yes" : "No", entry.verifierName, entry.verifierRole]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function buildPortfolioSummary(state) {
  const readiness = calculateReadiness(state);
  const savedAssignmentCount = validatePortfolioAssignmentIds(portfolioAssignmentIdsOrLegacyEmpty(state.completion)).length;
  const lines = [
    "Physical Education 10 — Online",
    `Evidence status: ${readiness.overallReady ? "Ready for teacher review" : "In progress"}`,
    `Activity: ${formatHours(readiness.totalMinutes)} of 50 hours`,
    `Movement dimensions ready: ${readiness.dimensionsReadyCount} of 5`,
    `5-hour checkpoints complete: ${readiness.checkpointsCompleted} of 10`,
    `Assignments ready: ${readiness.assignmentsReady} of 5`,
    `Assignments saved to Portfolio: ${savedAssignmentCount} of 5`,
    `Safety planning acknowledgement: ${readiness.checks.safetyPlanning ? "Complete" : "Not complete"}`,
    "",
    "Dimension totals:"
  ];
  for (const dimension of readiness.dimensions) {
    const note = dimension.alternate ? " · teacher-approved alternate evidence" : dimension.overMaximum ? " · over 30-hour maximum" : "";
    lines.push(`- ${dimension.label}: ${formatHours(dimension.minutes)} hours${note}`);
  }
  lines.push("", "This summary reports evidence readiness only. Brightspace is the official submission and grading record.");
  return lines.join("\n");
}

function newEntryId() {
  const random = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `entry-${Date.now().toString(36)}-${random}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDisplayDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(date);
}

function assignmentTitle(assignmentId) {
  return {
    "assignment-1": "Personal Activity and Safety Plan",
    "assignment-2": "Movement Skill and Cooperation Observation",
    "assignment-3": "Fitness, Fuel, Hydration, and Recovery Plan",
    "assignment-4": "Health and Media Literacy Inquiry",
    "assignment-5": "CPR/AED Awareness and Final Active-Living Reflection"
  }[assignmentId];
}

function assignmentFieldLabel(assignmentId, field) {
  const labels = {
    "assignment-1": { startingPoint: "Meaningful starting point", goals: "Two specific goals", weeklyPlan: "Weekly activity pattern", safetyPlan: "Safety and support plan" },
    "assignment-2": { context: "Observation context", evidence: "Observable evidence", adaptation: "Feedback and adaptation", cooperation: "Cooperation and next step" },
    "assignment-3": { demands: "Activity demands", fuelHydration: "Fuel and hydration", recovery: "Recovery", adjustment: "Monitor and adjust" },
    "assignment-4": { claim: "Claim, source, and audience", evidenceCheck: "Evidence check", contextImpact: "Missing context and possible impact", conclusion: "Responsible rewrite and conclusion" },
    "assignment-5": { response: "Recognize and respond", aed: "AED awareness and limits", growth: "Evidence of growth", activeLiving: "Active-living plan" }
  };
  return labels[assignmentId]?.[field] || field;
}

export function buildSavedAssignmentsHtml(state) {
  const savedAssignmentIds = validatePortfolioAssignmentIds(portfolioAssignmentIdsOrLegacyEmpty(state.completion));
  if (!savedAssignmentIds.length) {
    return '<p class="portfolio-placeholder" data-portfolio-assignments-empty>No assignments have been saved to the Portfolio yet. Complete an assignment, then choose Save to Portfolio.</p>';
  }
  return savedAssignmentIds.map((assignmentId) => {
    const fields = ASSIGNMENT_FIELDS[assignmentId].map((field) => `<div><dt>${escapeHtml(assignmentFieldLabel(assignmentId, field))}</dt><dd>${escapeHtml(state.assignmentDrafts[assignmentId][field]) || "Not answered yet"}</dd></div>`).join("");
    return `<article class="portfolio-saved-assignment" data-portfolio-assignment="${assignmentId}"><h4>${escapeHtml(assignmentTitle(assignmentId))}</h4><dl>${fields}</dl></article>`;
  }).join("");
}

function initCourse() {
  const doc = document;
  const storageStatus = doc.querySelector("[data-storage-status]");
  let state = createEmptyState();
  let persistTimer = 0;
  let toastTimer = 0;
  let initializedRoute = false;

  try {
    const raw = window.localStorage.getItem(STATE_STORAGE_KEY);
    if (raw) state = parseStateBackup(raw);
  } catch (error) {
    if (storageStatus) {
      storageStatus.hidden = false;
      storageStatus.textContent = `Saved course data could not be read, so a clean in-memory copy is open. Current saved data has not been changed. ${error instanceof Error ? error.message : ""}`;
    }
  }

  function notify(message) {
    const toast = doc.querySelector("[data-toast]");
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = window.setTimeout(() => { toast.hidden = true; }, 3200);
  }

  function persistState(options = {}) {
    window.clearTimeout(persistTimer);
    const write = () => {
      const previousUpdatedAt = state.updatedAt;
      state.updatedAt = currentIso();
      try {
        const serialized = serializeState(state);
        window.localStorage.setItem(STATE_STORAGE_KEY, serialized);
        if (storageStatus) storageStatus.hidden = true;
        if (options.message) notify(options.message);
      } catch (error) {
        state.updatedAt = previousUpdatedAt;
        if (storageStatus) {
          storageStatus.hidden = false;
          storageStatus.textContent = `This change could not be saved. ${error instanceof Error ? error.message : "Browser storage is unavailable."}`;
        }
      }
    };
    if (options.immediate) write();
    else persistTimer = window.setTimeout(write, 240);
  }

  function showRoute(routeId, options = {}) {
    const route = ROUTES.includes(routeId) ? routeId : "overview";
    for (const panel of doc.querySelectorAll("[data-route-panel]")) panel.hidden = panel.getAttribute("data-route-panel") !== route;
    for (const link of doc.querySelectorAll("[data-page-target]")) {
      const active = link.getAttribute("data-page-target") === route;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
    doc.body.dataset.route = route;
    doc.body.classList.remove("mobile-menu-open");
    const mobileMenu = doc.querySelector("[data-mobile-menu]");
    mobileMenu?.setAttribute("aria-expanded", "false");
    state.completion.lastRoute = route;
    if (options.persist !== false) persistState();
    if (options.focus && initializedRoute) {
      const heading = doc.querySelector(`#${CSS.escape(route)} h1`);
      if (heading instanceof HTMLElement) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    initializedRoute = true;
  }

  function routeFromHash() {
    const hash = window.location.hash.replace(/^#/, "");
    return ROUTES.includes(hash) ? hash : "overview";
  }

  function renderProgress() {
    const readiness = calculateReadiness(state);
    const hourPercent = percent(readiness.totalMinutes, TOTAL_REQUIRED_MINUTES);
    const summary = doc.querySelector("[data-hours-summary]");
    if (summary) summary.textContent = `${formatHours(readiness.totalMinutes)} / 50 hours`;
    const progress = doc.querySelector("[data-hours-progress]");
    progress?.setAttribute("aria-valuenow", String(Math.min(50, readiness.totalHours)));
    const fill = doc.querySelector("[data-hours-progress-fill]");
    if (fill instanceof HTMLElement) fill.style.width = `${hourPercent}%`;

    const overviewValues = [
      ["[data-overview-hours]", `${formatHours(readiness.totalMinutes)} of 50`],
      ["[data-overview-dimensions]", `${readiness.dimensionsReadyCount} of 5`],
      ["[data-overview-checkpoints]", `${readiness.checkpointsCompleted} of 10`],
      ["[data-overview-assignments]", `${readiness.assignmentsReady} of 5`]
    ];
    overviewValues.forEach(([selector, value]) => { const node = doc.querySelector(selector); if (node) node.textContent = value; });
    const fills = [
      ["[data-overview-hours-fill]", hourPercent],
      ["[data-overview-dimensions-fill]", percent(readiness.dimensionsReadyCount, 5)],
      ["[data-overview-checkpoints-fill]", percent(readiness.checkpointsCompleted, 10)],
      ["[data-overview-assignments-fill]", percent(readiness.assignmentsReady, 5)]
    ];
    fills.forEach(([selector, value]) => { const node = doc.querySelector(selector); if (node instanceof HTMLElement) node.style.width = `${value}%`; });

    const readinessList = doc.querySelector("[data-readiness-list]");
    if (readinessList) {
      const checkRows = [
        { ready: readiness.checks.safetyPlanning, label: "Safety planning acknowledgement complete" },
        { ready: readiness.checks.totalHours, label: readiness.checks.totalHours ? `${formatHours(readiness.totalMinutes)} activity hours logged` : `${formatHours(readiness.remainingMinutes)} hours remain` },
        { ready: readiness.checks.dimensionBreadth, label: `${readiness.dimensionsReadyCount} of 5 dimension breadth checks ready` },
        { ready: readiness.checks.dimensionMaximum, warning: !readiness.checks.dimensionMaximum, label: readiness.checks.dimensionMaximum ? "No dimension exceeds 30 hours" : `${readiness.overMaximumDimensions.map((dimension) => dimension.label).join(", ")} exceeds 30 hours` },
        { ready: readiness.checks.checkpoints, label: `${readiness.checkpointsCompleted} of 10 checkpoints complete` },
        { ready: readiness.checks.assignments, label: `${readiness.assignmentsReady} of 5 assignment drafts structurally ready` }
      ];
      readinessList.innerHTML = checkRows.map((item) => `<li class="${item.ready ? "is-ready" : item.warning ? "is-warning" : ""}">${escapeHtml(item.label)}</li>`).join("");
    }
    return readiness;
  }

  function renderLog() {
    const readiness = calculateReadiness(state);
    const hours = doc.querySelector("[data-log-hours]");
    if (hours) hours.textContent = formatHours(readiness.totalMinutes);
    const dimensionTotals = doc.querySelector("[data-dimension-totals]");
    if (dimensionTotals) {
      dimensionTotals.innerHTML = readiness.dimensions.map((dimension) => {
        const status = dimension.overMaximum ? "Over 30 h" : dimension.breadthReady ? (dimension.alternate && dimension.minutes < DIMENSION_REQUIRED_MINUTES ? "Alternate plan" : "Breadth ready") : `${formatHours(Math.max(0, DIMENSION_REQUIRED_MINUTES - dimension.minutes))} h to breadth`;
        const className = dimension.overMaximum ? "is-over" : dimension.breadthReady ? "is-ready" : "";
        return `<div class="dimension-total ${className}"><span>${escapeHtml(dimension.label)}</span><strong>${formatHours(dimension.minutes)} h</strong><span>${escapeHtml(status)}</span></div>`;
      }).join("");
    }

    const count = doc.querySelector("[data-log-entry-count]");
    if (count) count.textContent = state.logEntries.length ? `${state.logEntries.length} of ${MAX_LOG_ENTRIES} sessions saved.` : "No entries yet.";
    const empty = doc.querySelector("[data-log-empty]");
    const tableWrap = doc.querySelector("[data-log-table-wrap]");
    if (empty) empty.hidden = state.logEntries.length > 0;
    if (tableWrap) tableWrap.hidden = state.logEntries.length === 0;
    for (const button of doc.querySelectorAll("[data-download-log-csv], [data-download-portfolio-csv]")) button.disabled = state.logEntries.length === 0;

    const tbody = doc.querySelector("[data-log-table-body]");
    if (tbody) {
      tbody.innerHTML = [...state.logEntries]
        .sort((left, right) => right.date.localeCompare(left.date))
        .map((entry) => `<tr data-log-entry-id="${escapeHtml(entry.id)}">
          <td data-label="Date and activity"><span class="log-entry-primary">${escapeHtml(entry.activity)}</span><span class="log-entry-meta">${escapeHtml(formatDisplayDate(entry.date))} · ${escapeHtml(labelForIntensity(entry.intensity))}</span></td>
          <td data-label="Dimension">${escapeHtml(labelForDimension(entry.dimension))}</td>
          <td data-label="Time">${escapeHtml(formatHours(entry.durationMinutes))} h</td>
          <td data-label="Reflection"><div class="log-entry-reflection">${escapeHtml(entry.reflection)}</div><span class="log-entry-meta">Focus: ${escapeHtml(entry.learningFocus)} · Change: ${escapeHtml(entry.progression)}</span>${entry.verifierName ? `<span class="log-entry-meta">Observed by ${escapeHtml(entry.verifierName)}, ${escapeHtml(entry.verifierRole)}</span>` : ""}</td>
          <td data-label="Actions"><div class="log-entry-actions"><button class="button button-secondary button-small" type="button" data-edit-entry="${escapeHtml(entry.id)}">Edit</button><button class="button button-danger button-small" type="button" data-delete-entry="${escapeHtml(entry.id)}">Delete</button></div></td>
        </tr>`).join("");
    }
  }

  function renderCheckpoints() {
    const readiness = calculateReadiness(state);
    const summary = doc.querySelector("[data-checkpoint-summary]");
    if (summary) summary.textContent = `${readiness.checkpointsCompleted} of 10 complete`;
    const nextTarget = CHECKPOINT_TARGETS.find((target) => readiness.totalHours < target);
    const next = doc.querySelector("[data-next-checkpoint]");
    if (next) next.textContent = nextTarget ? `Next checkpoint unlocks at ${nextTarget} hours.` : "All checkpoints are unlocked.";
    for (const panel of doc.querySelectorAll("[data-checkpoint]")) {
      const target = Number(panel.getAttribute("data-checkpoint"));
      const unlocked = readiness.totalHours >= target;
      const checkpoint = state.checkpoints[String(target)] || { reflection: "", nextStep: "" };
      const complete = cleanText(checkpoint.reflection).length >= MIN_CHECKPOINT_RESPONSE && cleanText(checkpoint.nextStep).length >= MIN_CHECKPOINT_RESPONSE;
      panel.classList.toggle("is-unlocked", unlocked);
      panel.classList.toggle("is-complete", complete);
      const stateNode = panel.querySelector("[data-checkpoint-state]");
      if (stateNode) stateNode.textContent = complete ? "Complete" : unlocked ? "Ready for reflection" : `Unlocks at ${target} hours`;
      for (const input of panel.querySelectorAll("[data-checkpoint-field]")) input.disabled = !unlocked;
    }
  }

  function renderAssignmentReadiness() {
    const readiness = calculateReadiness(state);
    for (const assignmentId of ASSIGNMENT_IDS) {
      const ready = readiness.readyAssignments.includes(assignmentId);
      const badge = doc.querySelector(`[data-assignment-readiness="${assignmentId}"]`);
      if (badge) {
        badge.textContent = ready ? "Ready for review" : "Draft";
        badge.classList.toggle("is-ready", ready);
      }
      const saveButton = doc.querySelector(`[data-save-to-portfolio="${assignmentId}"]`);
      if (saveButton instanceof HTMLButtonElement) {
        const saved = state.completion.portfolioAssignmentIds.includes(assignmentId);
        saveButton.textContent = saved ? "Saved to Portfolio" : "Save to Portfolio";
        saveButton.disabled = saved || !ready;
        saveButton.setAttribute("aria-pressed", String(saved));
        saveButton.classList.toggle("button-saved", saved);
      }
    }
  }

  function readinessRows(readiness) {
    const rows = [
      ["Safety planning", readiness.checks.safetyPlanning ? "Acknowledged" : "Not complete", readiness.checks.safetyPlanning],
      ["Activity total", `${formatHours(readiness.totalMinutes)} / 50 hours`, readiness.checks.totalHours],
      ["Dimension breadth", `${readiness.dimensionsReadyCount} / 5 ready`, readiness.checks.dimensionBreadth],
      ["30-hour maximum", readiness.checks.dimensionMaximum ? "Within limit" : "Needs teacher review", readiness.checks.dimensionMaximum],
      ["Checkpoints", `${readiness.checkpointsCompleted} / 10 complete`, readiness.checks.checkpoints],
      ["Assignments", `${readiness.assignmentsReady} / 5 structurally ready`, readiness.checks.assignments]
    ];
    return rows.map(([label, detail, ready]) => `<div class="readiness-row ${ready ? "is-ready" : "is-warning"}"><strong>${escapeHtml(label)}</strong><span>${escapeHtml(detail)}</span><strong>${ready ? "Ready" : "In progress"}</strong></div>`).join("");
  }

  function renderPortfolio() {
    const readiness = calculateReadiness(state);
    const report = doc.querySelector("[data-portfolio-readiness]");
    if (report) report.innerHTML = readinessRows(readiness);

    const preview = doc.querySelector("[data-portfolio-preview]");
    if (!preview) return;
    const entries = [...state.logEntries].sort((left, right) => left.date.localeCompare(right.date));
    const entriesHtml = entries.length
      ? entries.map((entry) => `<div class="portfolio-entry"><strong>${escapeHtml(formatDisplayDate(entry.date))} · ${escapeHtml(entry.activity)} · ${escapeHtml(formatHours(entry.durationMinutes))} h</strong><p>${escapeHtml(labelForDimension(entry.dimension))} · ${escapeHtml(labelForIntensity(entry.intensity))}</p><p><strong>Focus:</strong> ${escapeHtml(entry.learningFocus)} <strong>Adaptation:</strong> ${escapeHtml(entry.progression)} <strong>Reflection:</strong> ${escapeHtml(entry.reflection)}</p></div>`).join("")
      : '<p class="portfolio-placeholder">No activity sessions have been logged.</p>';
    const checkpointHtml = CHECKPOINT_TARGETS.flatMap((target) => {
      const checkpoint = state.checkpoints[String(target)];
      if (!checkpoint || (!cleanText(checkpoint.reflection) && !cleanText(checkpoint.nextStep))) return [];
      return [`<div class="portfolio-entry"><strong>${target}-hour checkpoint</strong><p>${escapeHtml(checkpoint.reflection)}</p><p><strong>Next step:</strong> ${escapeHtml(checkpoint.nextStep)}</p></div>`];
    }).join("") || '<p class="portfolio-placeholder">No checkpoint reflections have been started.</p>';
    const assignmentsHtml = buildSavedAssignmentsHtml(state);
    preview.innerHTML = `
      <section><h3>Activity summary</h3><dl>${readiness.dimensions.map((dimension) => `<div><dt>${escapeHtml(dimension.label)}</dt><dd>${formatHours(dimension.minutes)} hours${dimension.alternate ? " · teacher-approved alternate evidence" : ""}</dd></div>`).join("")}</dl></section>
      <section><h3>Activity log</h3>${entriesHtml}</section>
      <section><h3>5-hour reflections</h3>${checkpointHtml}</section>
      <section data-portfolio-saved-assignments><h3>Saved assignments</h3>${assignmentsHtml}</section>`;
  }

  function renderAll() {
    renderProgress();
    renderLog();
    renderCheckpoints();
    renderAssignmentReadiness();
    renderPortfolio();
  }

  function hydrateInputs() {
    const safety = doc.querySelector("[data-safety-planning-complete]");
    if (safety) safety.checked = state.completion.safetyPlanningComplete;
    const approved = doc.querySelector("[data-alternate-approved]");
    if (approved) approved.checked = state.alternateEvidence.teacherApproved;
    const alternateFields = doc.querySelector("[data-alternate-fields]");
    if (alternateFields) alternateFields.disabled = !state.alternateEvidence.teacherApproved;
    for (const input of doc.querySelectorAll("[data-alternate-dimension]")) input.checked = state.alternateEvidence.dimensions.includes(input.value);
    const reference = doc.querySelector("[data-alternate-reference]");
    if (reference) reference.value = state.alternateEvidence.planReference;
    for (const panel of doc.querySelectorAll("[data-checkpoint]")) {
      const checkpoint = state.checkpoints[panel.getAttribute("data-checkpoint")] || { reflection: "", nextStep: "" };
      for (const input of panel.querySelectorAll("[data-checkpoint-field]")) input.value = checkpoint[input.getAttribute("data-checkpoint-field")] || "";
    }
    for (const form of doc.querySelectorAll("[data-assignment-form]")) {
      const assignmentId = form.getAttribute("data-assignment-form");
      for (const input of form.querySelectorAll("[data-assignment-field]")) input.value = state.assignmentDrafts[assignmentId]?.[input.getAttribute("data-assignment-field")] || "";
    }
  }

  function resetActivityForm() {
    const form = doc.querySelector("[data-activity-form]");
    if (!(form instanceof HTMLFormElement)) return;
    form.reset();
    form.elements.entryId.value = "";
    form.elements.date.value = localDateString();
    const title = doc.querySelector("[data-entry-form-title]");
    if (title) title.textContent = "Add an activity entry";
    const save = doc.querySelector("[data-save-entry]");
    if (save) save.textContent = "Save entry";
    const cancel = doc.querySelector("[data-cancel-entry]");
    if (cancel) cancel.hidden = true;
    const message = doc.querySelector("[data-activity-form-message]");
    if (message) message.hidden = true;
  }

  function showFormMessage(messages, kind = "error") {
    const message = doc.querySelector("[data-activity-form-message]");
    if (!message) return;
    message.className = `form-message is-${kind}`;
    message.textContent = messages.join(" ");
    message.hidden = false;
  }

  function formDraft(form) {
    return {
      id: form.elements.entryId.value,
      date: form.elements.date.value,
      activity: form.elements.activity.value,
      durationMinutes: form.elements.durationMinutes.value,
      dimension: form.elements.dimension.value,
      intensity: form.elements.intensity.value,
      learningFocus: form.elements.learningFocus.value,
      progression: form.elements.progression.value,
      reflection: form.elements.reflection.value,
      safetyConfirmed: form.elements.safetyConfirmed.checked,
      verifierName: form.elements.verifierName.value,
      verifierRole: form.elements.verifierRole.value
    };
  }

  function selectAssignment(assignmentId, options = {}) {
    if (!ASSIGNMENT_IDS.includes(assignmentId)) return;
    const tabs = [...doc.querySelectorAll("[data-assignment-tab]")];
    for (const tab of tabs) {
      const selected = tab.getAttribute("data-assignment-tab") === assignmentId;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && options.focus) tab.focus();
    }
    for (const panel of doc.querySelectorAll("[data-assignment-panel]")) panel.hidden = panel.getAttribute("data-assignment-panel") !== assignmentId;
  }

  function preparePrint(title, source, removeSelectors = []) {
    const root = doc.querySelector("#print-root");
    if (!root) return;
    root.replaceChildren();
    const heading = doc.createElement("h1");
    heading.textContent = title;
    root.append(heading);
    const clone = source.cloneNode(true);
    for (const selector of removeSelectors) clone.querySelectorAll(selector).forEach((node) => node.remove());
    clone.removeAttribute("hidden");
    clone.querySelectorAll("[hidden]").forEach((node) => node.removeAttribute("hidden"));
    clone.querySelectorAll("textarea").forEach((textarea) => { textarea.textContent = textarea.value; });
    clone.querySelectorAll("details").forEach((details) => { details.open = true; });
    root.append(clone);
    root.setAttribute("aria-hidden", "false");
    window.print();
    window.setTimeout(() => {
      root.replaceChildren();
      root.setAttribute("aria-hidden", "true");
    }, 1200);
  }

  function downloadText(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = doc.createElement("a");
    link.href = url;
    link.download = filename;
    link.hidden = true;
    doc.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const textarea = doc.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    doc.body.append(textarea);
    textarea.select();
    const copied = doc.execCommand("copy");
    textarea.remove();
    if (!copied) throw new Error("Copy is not available in this browser.");
  }

  doc.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    const sidebarToggle = target.closest("[data-sidebar-toggle]");
    if (sidebarToggle) {
      const collapsed = doc.body.classList.toggle("sidebar-collapsed");
      sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
      const label = sidebarToggle.querySelector(".visually-hidden");
      if (label) label.textContent = collapsed ? "Expand course menu" : "Collapse course menu";
      return;
    }

    const mobileToggle = target.closest("[data-mobile-menu]");
    if (mobileToggle) {
      const open = doc.body.classList.toggle("mobile-menu-open");
      mobileToggle.setAttribute("aria-expanded", String(open));
      const label = mobileToggle.querySelector(".visually-hidden");
      if (label) label.textContent = open ? "Close course menu" : "Open course menu";
      return;
    }

    const routeLink = target.closest('a[href^="#"]');
    if (routeLink) {
      const route = routeLink.getAttribute("href").slice(1);
      if (ROUTES.includes(route) && window.location.hash === `#${route}`) showRoute(route, { focus: true });
    }

    const editButton = target.closest("[data-edit-entry]");
    if (editButton) {
      const entry = state.logEntries.find((item) => item.id === editButton.getAttribute("data-edit-entry"));
      const form = doc.querySelector("[data-activity-form]");
      if (!entry || !(form instanceof HTMLFormElement)) return;
      for (const [key, value] of Object.entries(entry)) {
        const control = form.elements.namedItem(key);
        if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) {
          if (control.type === "checkbox") control.checked = Boolean(value);
          else control.value = String(value);
        }
      }
      form.elements.entryId.value = entry.id;
      const title = doc.querySelector("[data-entry-form-title]");
      if (title) title.textContent = "Edit activity entry";
      const save = doc.querySelector("[data-save-entry]");
      if (save) save.textContent = "Update entry";
      const cancel = doc.querySelector("[data-cancel-entry]");
      if (cancel) cancel.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      form.elements.activity.focus();
      return;
    }

    const deleteButton = target.closest("[data-delete-entry]");
    if (deleteButton) {
      const id = deleteButton.getAttribute("data-delete-entry");
      const entry = state.logEntries.find((item) => item.id === id);
      if (!entry || !window.confirm(`Delete the ${entry.activity} entry from ${formatDisplayDate(entry.date)}?`)) return;
      state.logEntries = state.logEntries.filter((item) => item.id !== id);
      persistState({ immediate: true, message: "Activity entry deleted." });
      renderAll();
      return;
    }

    if (target.closest("[data-cancel-entry]")) {
      resetActivityForm();
      return;
    }

    const assignmentTab = target.closest("[data-assignment-tab]");
    if (assignmentTab) {
      selectAssignment(assignmentTab.getAttribute("data-assignment-tab"));
      return;
    }

    const printAssignment = target.closest("[data-print-assignment]");
    if (printAssignment) {
      const assignmentId = printAssignment.getAttribute("data-print-assignment");
      const panel = doc.querySelector(`[data-assignment-panel="${assignmentId}"]`);
      if (panel) preparePrint(panel.getAttribute("data-printable-title") || assignmentTitle(assignmentId), panel, [".assignment-actions"]);
      return;
    }

    const saveToPortfolio = target.closest("[data-save-to-portfolio]");
    if (saveToPortfolio) {
      const assignmentId = saveToPortfolio.getAttribute("data-save-to-portfolio");
      try {
        saveAssignmentToPortfolio(state, assignmentId);
        persistState({ immediate: true, message: `${assignmentTitle(assignmentId)} saved to Portfolio.` });
        renderAssignmentReadiness();
        renderPortfolio();
      } catch (error) {
        notify(error instanceof Error ? error.message : "Assignment could not be saved to the Portfolio.");
      }
      return;
    }

    if (target.closest("[data-print-portfolio]")) {
      const portfolio = doc.querySelector("#portfolio");
      if (portfolio) preparePrint("Physical Education 10 — Portfolio", portfolio, ['[aria-labelledby="portfolio-tools-title"]', ".page-turn"]);
      return;
    }

    if (target.closest("[data-download-log-csv], [data-download-portfolio-csv]")) {
      downloadText(`pe10-activity-log-${localDateString()}.csv`, buildLogCsv(state), "text/csv;charset=utf-8");
      notify("Activity log CSV prepared.");
      return;
    }

    if (target.closest("[data-download-backup]")) {
      try {
        downloadText(`pe10-course-backup-${localDateString()}.json`, `${serializeState(state)}\n`, "application/json;charset=utf-8");
        notify("Validated JSON backup prepared.");
      } catch (error) {
        notify(error instanceof Error ? error.message : "Backup could not be created.");
      }
      return;
    }

    if (target.closest("[data-copy-summary]")) {
      copyText(buildPortfolioSummary(state)).then(() => notify("Portfolio summary copied.")).catch((error) => notify(error instanceof Error ? error.message : "Summary could not be copied."));
    }
  });

  window.addEventListener("hashchange", () => showRoute(routeFromHash(), { focus: true }));

  const activityForm = doc.querySelector("[data-activity-form]");
  if (activityForm instanceof HTMLFormElement) {
    activityForm.elements.date.max = localDateString();
    activityForm.elements.date.value = localDateString();
    activityForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const draft = formDraft(activityForm);
      const editingId = cleanText(draft.id);
      const validation = validateLogEntryDraft(draft, state.logEntries, editingId);
      if (!validation.valid || !validation.entry) {
        showFormMessage(validation.errors);
        return;
      }
      if (!editingId && state.logEntries.length >= MAX_LOG_ENTRIES) {
        showFormMessage([`The log has reached ${MAX_LOG_ENTRIES} sessions. Contact your teacher before replacing or combining evidence.`]);
        return;
      }
      const entry = { ...validation.entry, id: editingId || newEntryId() };
      if (editingId) state.logEntries = state.logEntries.map((item) => item.id === editingId ? entry : item);
      else state.logEntries = [...state.logEntries, entry];
      persistState({ immediate: true, message: editingId ? "Activity entry updated." : "Activity entry saved." });
      renderAll();
      resetActivityForm();
      if (validation.warnings.length) showFormMessage(validation.warnings, "success");
    });
    activityForm.addEventListener("input", () => {
      const validation = validateLogEntryDraft(formDraft(activityForm), state.logEntries, activityForm.elements.entryId.value);
      const message = doc.querySelector("[data-activity-form-message]");
      if (validation.warnings.length && !validation.errors.length) showFormMessage(validation.warnings, "success");
      else if (message) message.hidden = true;
    });
  }

  const safetyComplete = doc.querySelector("[data-safety-planning-complete]");
  safetyComplete?.addEventListener("change", () => {
    state.completion.safetyPlanningComplete = safetyComplete.checked;
    persistState({ immediate: true, message: safetyComplete.checked ? "Safety planning acknowledgement saved." : "Safety planning acknowledgement cleared." });
    renderProgress();
    renderPortfolio();
  });

  const alternateApproved = doc.querySelector("[data-alternate-approved]");
  alternateApproved?.addEventListener("change", () => {
    state.alternateEvidence.teacherApproved = alternateApproved.checked;
    if (!alternateApproved.checked) state.alternateEvidence = { teacherApproved: false, dimensions: [], planReference: "" };
    hydrateInputs();
    persistState({ immediate: true, message: alternateApproved.checked ? "Alternate-evidence plan enabled." : "Alternate-evidence plan cleared." });
    renderAll();
  });

  doc.querySelector("[data-alternate-evidence-form]")?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || !state.alternateEvidence.teacherApproved) return;
    if (input.matches("[data-alternate-dimension]")) {
      state.alternateEvidence.dimensions = [...doc.querySelectorAll("[data-alternate-dimension]:checked")].map((node) => node.value);
    } else if (input.matches("[data-alternate-reference]")) {
      state.alternateEvidence.planReference = input.value.slice(0, STATE_LIMITS.alternateReference);
    }
    persistState();
    renderProgress();
    renderLog();
    renderPortfolio();
  });

  doc.querySelector("[data-checkpoint-list]")?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLTextAreaElement)) return;
    const panel = input.closest("[data-checkpoint]");
    const target = panel?.getAttribute("data-checkpoint");
    const field = input.getAttribute("data-checkpoint-field");
    if (!target || !CHECKPOINT_KEYS.has(target) || !["reflection", "nextStep"].includes(field)) return;
    state.checkpoints[target] ||= { reflection: "", nextStep: "" };
    state.checkpoints[target][field] = input.value.slice(0, STATE_LIMITS.checkpointField);
    persistState();
    renderProgress();
    renderCheckpoints();
    renderPortfolio();
  });

  doc.querySelector(".assignment-panels")?.addEventListener("input", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLTextAreaElement)) return;
    const form = input.closest("[data-assignment-form]");
    const assignmentId = form?.getAttribute("data-assignment-form");
    const field = input.getAttribute("data-assignment-field");
    if (!assignmentId || !ASSIGNMENT_FIELDS[assignmentId]?.includes(field)) return;
    state.assignmentDrafts[assignmentId][field] = input.value.slice(0, STATE_LIMITS.assignmentField);
    persistState();
    renderProgress();
    renderAssignmentReadiness();
    renderPortfolio();
    const status = doc.querySelector("[data-assignment-save-status]");
    if (status) status.textContent = "Saving draft…";
    window.setTimeout(() => { if (status) status.textContent = "Draft saved on this device."; }, 360);
  });

  doc.querySelector(".assignment-picker")?.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...doc.querySelectorAll("[data-assignment-tab]")];
    const current = tabs.indexOf(doc.activeElement);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    selectAssignment(tabs[next].getAttribute("data-assignment-tab"), { focus: true });
  });

  const restoreInput = doc.querySelector("[data-restore-backup]");
  restoreInput?.addEventListener("change", async () => {
    const message = doc.querySelector("[data-backup-message]");
    const file = restoreInput.files?.[0];
    restoreInput.value = "";
    if (!file) return;
    try {
      if (file.size > STATE_CHARACTER_LIMIT * 4) throw new Error("Backup file is too large to inspect safely.");
      const text = await file.text();
      const restored = parseStateBackup(text);
      state = restored;
      persistState({ immediate: true });
      hydrateInputs();
      renderAll();
      if (message) {
        message.className = "form-message is-success";
        message.textContent = "Backup restored. Review the readiness report before continuing.";
        message.hidden = false;
      }
    } catch (error) {
      if (message) {
        message.className = "form-message is-error";
        message.textContent = `Backup was not restored. ${error instanceof Error ? error.message : "The file is invalid."}`;
        message.hidden = false;
      }
    }
  });

  hydrateInputs();
  resetActivityForm();
  renderAll();
  showRoute(routeFromHash(), { persist: false });

  window.PE10Pilot = Object.freeze({
    storageKey: STATE_STORAGE_KEY,
    getState: () => JSON.parse(JSON.stringify(state)),
    getReadiness: () => calculateReadiness(state),
    serialize: () => serializeState(state)
  });
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCourse, { once: true });
  else initCourse();
}
