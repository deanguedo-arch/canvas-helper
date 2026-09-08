import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import {
  ASSIGNMENT_FIELDS,
  CHECKPOINT_TARGETS,
  DIMENSIONS,
  MAX_LOG_ENTRIES,
  PROJECT_SLUG,
  STATE_CHARACTER_LIMIT,
  STATE_LIMITS,
  STATE_SCHEMA_VERSION,
  STATE_STORAGE_KEY,
  buildLogCsv,
  buildPortfolioSummary,
  buildSavedAssignmentsHtml,
  calculateReadiness,
  createEmptyState,
  parseStateBackup,
  saveAssignmentToPortfolio,
  serializeState,
  validateLogEntryDraft
} from "../../projects/pe10-online-pilot/workspace/course.js";

const projectRoot = path.resolve("projects/pe10-online-pilot");
const resourceRoot = path.resolve("projects/resources/pe10-online-pilot");
const fixedNow = "2026-09-03T18:00:00.000Z";
const fixedToday = new Date("2026-09-03T18:00:00.000Z");

function makeEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: "entry-one",
    date: "2026-09-01",
    activity: "Trail walk",
    durationMinutes: 60,
    dimension: "alternative-environments",
    intensity: "moderate",
    learningFocus: "Steady pacing on varied terrain",
    progression: "Added one gradual hill while keeping control",
    reflection: "My pace stayed consistent and I recovered comfortably.",
    safetyConfirmed: true,
    verifierName: "",
    verifierRole: "",
    ...overrides
  };
}

function completedAssignmentState() {
  const state = createEmptyState(fixedNow);
  for (const [assignmentId, fields] of Object.entries(ASSIGNMENT_FIELDS)) {
    for (const field of fields) state.assignmentDrafts[assignmentId][field] = "A focused response with specific personal evidence and a practical next step.";
  }
  return state;
}

test("PE10 state contract has one versioned, project-scoped storage key", () => {
  assert.equal(PROJECT_SLUG, "pe10-online-pilot");
  assert.equal(STATE_SCHEMA_VERSION, 1);
  assert.equal(STATE_STORAGE_KEY, "canvas-helper:pe10-online-pilot:state:v1");
  assert.equal(STATE_CHARACTER_LIMIT, 48_000);
  assert.equal(MAX_LOG_ENTRIES, 60);
});

test("readiness honours the exact 50-hour boundary and five movement dimensions", () => {
  const state = completedAssignmentState();
  state.completion.safetyPlanningComplete = true;
  state.logEntries = DIMENSIONS.map((dimension, index) => makeEntry({
    id: `entry-${index}`,
    activity: `Activity ${index + 1}`,
    durationMinutes: 600,
    dimension: dimension.id
  }));
  for (const target of CHECKPOINT_TARGETS) {
    state.checkpoints[String(target)] = {
      reflection: "Specific evidence shows a useful change in my participation.",
      nextStep: "I will use one realistic progression during my next sessions."
    };
  }

  const readiness = calculateReadiness(state);
  assert.equal(readiness.totalMinutes, 3_000);
  assert.equal(readiness.totalHours, 50);
  assert.equal(readiness.remainingMinutes, 0);
  assert.equal(readiness.dimensionsReadyCount, 5);
  assert.equal(readiness.checks.dimensionMaximum, true);
  assert.equal(readiness.overallReady, true);

  state.logEntries[0].durationMinutes = 595;
  const belowBoundary = calculateReadiness(state);
  assert.equal(belowBoundary.totalMinutes, 2_995);
  assert.equal(belowBoundary.checks.totalHours, false);
  assert.equal(belowBoundary.overallReady, false);
});

test("teacher-approved alternate evidence can satisfy breadth but never the total-hour requirement", () => {
  const state = createEmptyState(fixedNow);
  state.logEntries = [makeEntry({ durationMinutes: 300, dimension: "individual-activities" })];
  state.alternateEvidence = {
    teacherApproved: true,
    dimensions: DIMENSIONS.filter((dimension) => dimension.id !== "individual-activities").map((dimension) => dimension.id),
    planReference: "Teacher-approved plan recorded in Brightspace feedback."
  };

  const readiness = calculateReadiness(state);
  assert.equal(readiness.dimensionsReadyCount, 5);
  assert.equal(readiness.checks.dimensionBreadth, true);
  assert.equal(readiness.totalHours, 5);
  assert.equal(readiness.checks.totalHours, false);
});

test("a dimension above 30 hours is flagged without locking navigation or changing total hours", () => {
  const state = createEmptyState(fixedNow);
  state.logEntries = [makeEntry({ durationMinutes: 1_805, dimension: "games" })];
  const readiness = calculateReadiness(state);
  assert.equal(readiness.totalMinutes, 1_805);
  assert.equal(readiness.checks.dimensionMaximum, false);
  assert.deepEqual(readiness.overMaximumDimensions.map((dimension) => dimension.id), ["games"]);
});

test("log validation rejects future dates, invalid durations, incomplete safety, and verifier contact details", () => {
  const future = validateLogEntryDraft(makeEntry({ date: "2026-09-04" }), [], "", fixedToday);
  assert.equal(future.valid, false);
  assert.match(future.errors.join(" "), /Future activity dates/);

  for (const durationMinutes of [0, 17, 725, 60.5]) {
    const result = validateLogEntryDraft(makeEntry({ durationMinutes }), [], "", fixedToday);
    assert.equal(result.valid, false, `expected duration ${durationMinutes} to be rejected`);
  }

  const unsafe = validateLogEntryDraft(makeEntry({ safetyConfirmed: false }), [], "", fixedToday);
  assert.match(unsafe.errors.join(" "), /Confirm the safety statement/);

  const email = validateLogEntryDraft(makeEntry({ verifierName: "Observer", verifierRole: "coach@example.ca" }), [], "", fixedToday);
  assert.match(email.errors.join(" "), /phone numbers or email addresses/);
  const phone = validateLogEntryDraft(makeEntry({ verifierName: "Observer", verifierRole: "Coach 780-555-1234" }), [], "", fixedToday);
  assert.match(phone.errors.join(" "), /phone numbers or email addresses/);
});

test("duplicate warnings are non-destructive and edits and deletions recalculate totals", () => {
  const first = makeEntry();
  const duplicate = validateLogEntryDraft(makeEntry({ id: "entry-two" }), [first], "", fixedToday);
  assert.equal(duplicate.valid, true);
  assert.match(duplicate.warnings.join(" "), /looks like another entry/);

  const state = createEmptyState(fixedNow);
  state.logEntries = [first, makeEntry({ id: "entry-two", activity: "Dance sequence", dimension: "dance" })];
  assert.equal(calculateReadiness(state).totalMinutes, 120);
  state.logEntries = state.logEntries.map((entry) => entry.id === first.id ? { ...entry, durationMinutes: 180 } : entry);
  assert.equal(calculateReadiness(state).totalMinutes, 240);
  state.logEntries = state.logEntries.filter((entry) => entry.id !== "entry-two");
  assert.equal(calculateReadiness(state).totalMinutes, 180);
});

test("JSON backup round-trips and rejects corrupt, wrong-project, future-schema, and oversized input", () => {
  const state = completedAssignmentState();
  state.logEntries = [makeEntry()];
  state.checkpoints["5"] = {
    reflection: "My pacing evidence was specific and useful.",
    nextStep: "I will progress by adding one short hill safely."
  };
  state.alternateEvidence = {
    teacherApproved: true,
    dimensions: ["dance"],
    planReference: "Plan recorded in Brightspace."
  };
  state.completion.portfolioAssignmentIds = ["assignment-1", "assignment-3"];

  const serialized = serializeState(state, fixedNow);
  assert.deepEqual(parseStateBackup(`${serialized}\n`, { today: fixedToday }), state);
  assert.throws(() => parseStateBackup("{broken"), /not valid JSON/);

  const wrongProject = JSON.parse(serialized);
  wrongProject.projectSlug = "another-course";
  assert.throws(() => parseStateBackup(JSON.stringify(wrongProject), { today: fixedToday }), /different course project/);

  const futureSchema = JSON.parse(serialized);
  futureSchema.schemaVersion = 2;
  assert.throws(() => parseStateBackup(JSON.stringify(futureSchema), { today: fixedToday }), /newer course version/);
  assert.throws(() => parseStateBackup("x".repeat(STATE_CHARACTER_LIMIT + 1)), /exceeds/);
});

test("legacy v1 state without Portfolio assignment IDs loads with an empty saved collection", () => {
  const legacy = JSON.parse(serializeState(completedAssignmentState(), fixedNow));
  delete legacy.completion.portfolioAssignmentIds;
  const restored = parseStateBackup(JSON.stringify(legacy), { today: fixedToday });
  assert.deepEqual(restored.completion.portfolioAssignmentIds, []);
  assert.deepEqual(JSON.parse(serializeState(restored, fixedNow)).completion.portfolioAssignmentIds, []);
});

test("saved Portfolio assignment IDs validate, round-trip, and stay in canonical order", () => {
  const state = completedAssignmentState();
  state.completion.portfolioAssignmentIds = ["assignment-1", "assignment-4"];
  const serialized = serializeState(state, fixedNow);
  assert.deepEqual(parseStateBackup(serialized, { today: fixedToday }).completion.portfolioAssignmentIds, ["assignment-1", "assignment-4"]);

  for (const ids of [
    ["assignment-1", "assignment-1"],
    ["assignment-1", "assignment-unknown"],
    ["assignment-4", "assignment-1"],
    ["assignment-1", "assignment-2", "assignment-3", "assignment-4", "assignment-5", "assignment-1"],
    null,
    "assignment-1"
  ]) {
    const malformed = JSON.parse(serialized);
    malformed.completion.portfolioAssignmentIds = ids;
    assert.throws(() => parseStateBackup(JSON.stringify(malformed), { today: fixedToday }), /Portfolio assignment/);
  }
});

test("saving to Portfolio requires assignment readiness and keeps later edits live-linked", () => {
  const state = createEmptyState(fixedNow);
  assert.throws(() => saveAssignmentToPortfolio(state, "assignment-1"), /Complete all four assignment responses/);
  assert.deepEqual(state.completion.portfolioAssignmentIds, []);

  for (const field of ASSIGNMENT_FIELDS["assignment-3"]) {
    state.assignmentDrafts["assignment-3"][field] = "A specific response with enough structural detail for teacher review.";
  }
  assert.deepEqual(saveAssignmentToPortfolio(state, "assignment-3"), ["assignment-3"]);
  assert.deepEqual(saveAssignmentToPortfolio(state, "assignment-3"), ["assignment-3"]);

  state.assignmentDrafts["assignment-3"].recovery = "Needs revision";
  assert.equal(calculateReadiness(state).readyAssignments.includes("assignment-3"), false);
  assert.deepEqual(state.completion.portfolioAssignmentIds, ["assignment-3"]);
  assert.deepEqual(parseStateBackup(serializeState(state, fixedNow), { today: fixedToday }).completion.portfolioAssignmentIds, ["assignment-3"]);
});

test("saved-assignment collection renders only selected live drafts and has a clear empty state", () => {
  const emptyState = completedAssignmentState();
  const emptyHtml = buildSavedAssignmentsHtml(emptyState);
  assert.match(emptyHtml, /No assignments have been saved to the Portfolio yet/);
  assert.doesNotMatch(emptyHtml, /Personal Activity and Safety Plan/);

  emptyState.completion.portfolioAssignmentIds = ["assignment-2"];
  emptyState.assignmentDrafts["assignment-2"].context = "Current observation context after a later edit.";
  const savedHtml = buildSavedAssignmentsHtml(emptyState);
  assert.match(savedHtml, /Movement Skill and Cooperation Observation/);
  assert.match(savedHtml, /Current observation context after a later edit/);
  assert.doesNotMatch(savedHtml, /Personal Activity and Safety Plan|Fitness, Fuel, Hydration/);
});

test("the fully populated bounded state stays below the 48,000-character guard", async () => {
  const state = createEmptyState(fixedNow);
  state.logEntries = Array.from({ length: MAX_LOG_ENTRIES }, (_, index) => makeEntry({
    id: `e${String(index).padStart(2, "0")}${"x".repeat(45)}`,
    date: "2026-09-01",
    activity: "a".repeat(STATE_LIMITS.logEntry.activity),
    durationMinutes: 50,
    dimension: DIMENSIONS[index % DIMENSIONS.length].id,
    intensity: "moderate",
    learningFocus: "f".repeat(STATE_LIMITS.logEntry.learningFocus),
    progression: "p".repeat(STATE_LIMITS.logEntry.progression),
    reflection: "r".repeat(STATE_LIMITS.logEntry.reflection),
    verifierName: "n".repeat(STATE_LIMITS.logEntry.verifierName),
    verifierRole: "c".repeat(STATE_LIMITS.logEntry.verifierRole)
  }));
  for (const target of CHECKPOINT_TARGETS) {
    state.checkpoints[String(target)] = {
      reflection: "r".repeat(STATE_LIMITS.checkpointField),
      nextStep: "n".repeat(STATE_LIMITS.checkpointField)
    };
  }
  for (const [assignmentId, fields] of Object.entries(ASSIGNMENT_FIELDS)) {
    for (const field of fields) state.assignmentDrafts[assignmentId][field] = "a".repeat(STATE_LIMITS.assignmentField);
  }
  state.alternateEvidence = {
    teacherApproved: true,
    dimensions: DIMENSIONS.map((dimension) => dimension.id),
    planReference: "p".repeat(STATE_LIMITS.alternateReference)
  };
  state.completion.safetyPlanningComplete = true;
  state.completion.portfolioAssignmentIds = Object.keys(ASSIGNMENT_FIELDS);

  const serialized = serializeState(state, fixedNow);
  assert.ok(serialized.length < STATE_CHARACTER_LIMIT);
  const stateContract = JSON.parse(await readFile(path.join(projectRoot, "meta/state-contract.json"), "utf8"));
  assert.equal(stateContract.worstCaseFixture.characters, serialized.length);
  assert.equal(stateContract.worstCaseFixture.headroom, STATE_CHARACTER_LIMIT - serialized.length);

  state.assignmentDrafts["assignment-1"].startingPoint = "x".repeat(STATE_CHARACTER_LIMIT);
  assert.throws(() => serializeState(state, fixedNow), /limit is 48,000/);
});

test("CSV and portfolio summaries contain evidence information but never calculate an official grade", () => {
  const state = createEmptyState(fixedNow);
  state.logEntries = [makeEntry({ activity: 'Walk, "steady"' })];
  const csv = buildLogCsv(state);
  assert.match(csv, /"Walk, ""steady"""/);
  assert.match(csv, /"Alternative environments"/);

  const summary = buildPortfolioSummary(state);
  assert.match(summary, /Activity: 1\.0 of 50 hours/);
  assert.match(summary, /Assignments saved to Portfolio: 0 of 5/);
  assert.match(summary, /Brightspace is the official submission and grading record/);
  assert.doesNotMatch(summary, /course grade|percent grade|final mark/i);
});

test("learner HTML ships all eight routes, five assignments, current links, and privacy-minimized controls", async () => {
  const html = await readFile(path.join(projectRoot, "workspace/index.html"), "utf8");
  const routes = [...html.matchAll(/data-route-panel="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(routes, [
    "overview",
    "how-it-works",
    "safety-planning",
    "activity-log",
    "checkpoints",
    "assignments",
    "portfolio",
    "resources"
  ]);
  assert.equal((html.match(/data-assignment-panel=/g) || []).length, 5);
  assert.equal((html.match(/data-save-to-portfolio=/g) || []).length, 5);
  assert.equal((html.match(/data-save-to-portfolio="[^"]+" aria-pressed="false" disabled/g) || []).length, 5);
  assert.match(html, /Physical Education 10 — Online/);
  assert.match(html, /Self-paced · 50-hour pathway/);
  assert.doesNotMatch(html, /Physical Education 10 — Online Pilot|Online pilot · 50-hour pathway|created by this pilot/);
  assert.doesNotMatch(html, /data-brightspace-submit|Brightspace link not configured|Portfolio submission link not configured|Saved in Brightspace/);
  assert.match(html, /https:\/\/food-guide\.canada\.ca\/en\//);
  assert.match(html, /https:\/\/www\.canada\.ca\/en\/public-health\/services\/being-active\/physical-activity-your-health\.html/);
  assert.match(html, /hands-only-cpr-poster-en\.pdf/);
  assert.match(html, /https:\/\/www\.eips\.ca\/about-us\/administrative-procedures\/317/);
  assert.doesNotMatch(html, /name="(?:phone|email|weight|calories|diagnosis)"/i);
  assert.doesNotMatch(html, /href=["'][^"']*dropbox/i);
});

test("all authoring references match their recorded SHA-256 and remain outside the learner workspace", async () => {
  const inventory = JSON.parse(await readFile(path.join(resourceRoot, "source-inventory.json"), "utf8"));
  assert.equal(inventory.sources.length, 6);
  assert.equal(inventory.releasePolicy.learnerExportAllowed, false);

  for (const source of inventory.sources) {
    const bytes = await readFile(path.resolve(source.contentAddressedPath));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), source.sha256, source.originalName);
    assert.equal(bytes.length, source.bytes, source.originalName);
  }

  const manifest = JSON.parse(await readFile(path.join(projectRoot, "meta/project.json"), "utf8"));
  assert.equal(manifest.title, "Physical Education 10 — Online");
  assert.equal(manifest.authoringStatus, "blocked");
  assert.equal(manifest.authoring.studioEditing.enabled, false);
  assert.equal(manifest.authoring.editabilityContract, undefined);
  assert.ok(manifest.exportTargets.every((target: { enabled: boolean }) => target.enabled === false));
  assert.ok(manifest.referenceOnly.every((source: string) => !source.includes("workspace/assets/")));
});
