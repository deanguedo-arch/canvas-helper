import assert from "node:assert/strict";
import test from "node:test";

import type {
  CourseEditCandidate,
  CourseEditabilityCoverageReport,
  LearnerSurface,
  LearnerSurfaceInventory
} from "../../app/shared/course-editability.ts";
import type { RenderedSurfaceCollection } from "../lib/course-editability/rendered.ts";
import {
  canonicalCourseEditabilityJson,
  collectCourseEditabilitySurfaces,
  courseEditabilityReportDigest
} from "../lib/course-editability/report.ts";
import {
  scoreAggregate,
  scoreProject,
  scoreRenderedSurface
} from "../lib/course-editability/scoring.ts";

const surface: LearnerSurface = {
  surfaceId: "ls1:111111111111111111111111",
  projectSlug: "coverage-fixture",
  htmlPath: "index.html",
  route: "",
  stateKey: null,
  inventorySource: "manifest"
};

const inventory: LearnerSurfaceInventory = {
  schemaVersion: 1,
  complete: true,
  surfaces: [surface],
  errorCode: null
};

function candidate(input: {
  id: string;
  editable: boolean;
  textUnits: number;
  kind?: CourseEditCandidate["kind"];
}): CourseEditCandidate {
  return {
    schemaVersion: 1,
    candidateId: input.id,
    surfaceId: surface.surfaceId,
    kind: input.kind ?? "prose",
    classification: input.editable ? "editable" : "annotation-only",
    ownership: input.editable ? "source-backed" : "runtime-owned",
    reasonCode: input.editable ? "ready" : "runtime-owned",
    sourceNodeId: input.editable ? "ch1:111111111111111111111111:1" : null,
    canonicalOwnerDigest: input.editable ? "a".repeat(64) : null,
    renderedFingerprint: "teacher-content-must-not-leak-into-report",
    normalizedTextCodeUnits: input.textUnits,
    resolveChecked: input.editable,
    resolveEligible: input.editable
  };
}

function collection(candidates: CourseEditCandidate[], learnerSurface = surface): RenderedSurfaceCollection {
  return {
    surface: learnerSurface,
    complete: true,
    reasonCode: null,
    candidates,
    opportunities: candidates.map((entry, index) => ({
      schemaVersion: 1,
      opportunityId: `co1:${String(index + 1).padStart(24, "0")}`,
      candidateId: entry.candidateId,
      kind: "rich-text",
      supported: entry.resolveEligible,
      reasonCode: entry.reasonCode
    })),
    occurrences: candidates.map((entry, index) => ({
      schemaVersion: 1,
      occurrenceId: `ro1:${String(index + 1).padStart(24, "0")}`,
      surfaceId: surface.surfaceId,
      semanticKind: entry.kind,
      disposition: { kind: "primary-candidate", candidateId: entry.candidateId }
    }))
  };
}

test("project coverage counts one canonical unit across repeated learner surfaces", () => {
  const secondSurface: LearnerSurface = {
    ...surface,
    surfaceId: "ls1:222222222222222222222222",
    route: "#lesson-two"
  };
  const firstCandidate = candidate({ id: "cc1:555555555555555555555555", editable: true, textUnits: 40 });
  const secondCandidate = {
    ...candidate({ id: "cc1:666666666666666666666666", editable: true, textUnits: 40 }),
    surfaceId: secondSurface.surfaceId
  };
  const project = scoreProject({
    projectSlug: "coverage-fixture",
    adapter: "direct",
    inventory: { ...inventory, surfaces: [surface, secondSurface] },
    collections: [collection([firstCandidate]), collection([secondCandidate], secondSurface)]
  });
  assert.deepEqual(project.blockCoverage, { numerator: 1, denominator: 1 });
  assert.deepEqual(project.teacherTextCoverage, { numerator: 40, denominator: 40 });
  assert.deepEqual(project.candidatesByKind.prose, { supported: 1, total: 1 });
  assert.deepEqual(project.capabilitiesByKind["rich-text"], { supported: 1, total: 1 });
});

test("zero candidates and incomplete collections never produce flattering percentages", () => {
  const empty = scoreRenderedSurface(collection([]));
  assert.equal(empty.status, "no-candidates");
  assert.equal(empty.blockCoverage, null);
  assert.equal(empty.teacherTextCoverage, null);

  const truncated = scoreRenderedSurface({
    ...collection([]),
    complete: false,
    reasonCode: "candidate-truncated"
  });
  assert.equal(truncated.status, "incomplete");
  assert.equal(truncated.blockCoverage, null);
  assert.equal(truncated.reasons["candidate-truncated"], 1);

  const skippedResolve = collection([candidate({ id: "cc1:111111111111111111111111", editable: true, textUnits: 20 })]);
  skippedResolve.candidates[0].resolveChecked = false;
  assert.equal(scoreRenderedSurface(skippedResolve).status, "incomplete");
});

test("project and catalog coverage sum raw units instead of averaging page percentages", () => {
  const first = scoreProject({
    projectSlug: "first",
    adapter: "direct",
    inventory: { ...inventory, surfaces: [{ ...surface, projectSlug: "first" }] },
    collections: [collection([
      candidate({ id: "cc1:111111111111111111111111", editable: true, textUnits: 90 }),
      candidate({ id: "cc1:222222222222222222222222", editable: false, textUnits: 10 })
    ])]
  });
  const second = scoreProject({
    projectSlug: "second",
    adapter: "direct",
    inventory: { ...inventory, surfaces: [{ ...surface, projectSlug: "second" }] },
    collections: [collection([
      candidate({ id: "cc1:333333333333333333333333", editable: false, textUnits: 900 })
    ])]
  });
  const aggregate = scoreAggregate([first, second]);
  assert.deepEqual(aggregate.blockCoverage, { numerator: 1, denominator: 3 });
  assert.deepEqual(aggregate.teacherTextCoverage, { numerator: 90, denominator: 1_000 });
});

test("publishable scoring contains counts and stable reasons but no course text or candidate fingerprints", () => {
  const project = scoreProject({
    projectSlug: "coverage-fixture",
    adapter: "direct",
    inventory,
    collections: [collection([
      candidate({ id: "cc1:444444444444444444444444", editable: true, textUnits: 42, kind: "heading" })
    ])]
  });
  const serialized = JSON.stringify(project);
  assert.doesNotMatch(serialized, /teacher-content-must-not-leak-into-report/);
  assert.doesNotMatch(serialized, /cc1:444444444444444444444444/);
  assert.match(serialized, /"heading"/);
  assert.match(serialized, /"ready"/);
});

test("canonical report JSON and digest are deterministic across object insertion order", () => {
  const left = { z: 2, nested: { b: 2, a: 1 }, a: 1 };
  const right = { a: 1, nested: { a: 1, b: 2 }, z: 2 };
  assert.equal(canonicalCourseEditabilityJson(left), canonicalCourseEditabilityJson(right));

  const report = {
    schemaVersion: 1,
    exactCommit: "a".repeat(40),
    commitTimestamp: "2026-08-14T00:00:00-06:00",
    worktreeClean: true,
    inventorySchemaVersion: 1,
    candidateSchemaVersion: 1,
    reasonRegistryVersion: 1,
    isolationProfileVersion: 1,
    limits: { surfaceTimeoutMs: 45_000 },
    projects: [],
    aggregate: {
      status: "error",
      projectCount: 0,
      completeProjectCount: 0,
      blockCoverage: null,
      teacherTextCoverage: null,
      candidatesByKind: {},
      capabilitiesByKind: {},
      reasons: {}
    },
    residue: {
      ok: true,
      changedPaths: [],
      browserStorageWriteAttemptCount: 0,
      browserStorageResidue: false
    }
  } satisfies Omit<CourseEditabilityCoverageReport, "reportDigest">;
  const reordered = JSON.parse(JSON.stringify(report)) as typeof report;
  assert.equal(courseEditabilityReportDigest(report), courseEditabilityReportDigest(reordered));
  assert.match(courseEditabilityReportDigest(report), /^[a-f0-9]{64}$/);
});

test("rendered census honors its worker limit and preserves declared surface order", async () => {
  const surfaces = Array.from({ length: 5 }, (_, index): LearnerSurface => ({
    ...surface,
    surfaceId: `ls1:${String(index + 1).padStart(24, "0")}`,
    route: `#lesson-${index + 1}`
  }));
  let active = 0;
  let maximumActive = 0;
  const declaredCounts: number[] = [];
  const collector = {
    async collect(learnerSurface: LearnerSurface, declaredSurfaces: readonly LearnerSurface[] = []) {
      active += 1;
      maximumActive = Math.max(maximumActive, active);
      declaredCounts.push(declaredSurfaces.length);
      await new Promise((resolve) => setTimeout(resolve, learnerSurface.route === "#lesson-1" ? 20 : 2));
      active -= 1;
      return collection([], learnerSurface);
    }
  };

  const result = await collectCourseEditabilitySurfaces(collector, surfaces);
  assert.equal(maximumActive, 2);
  assert.deepEqual(declaredCounts, [5, 5, 5, 5, 5]);
  assert.deepEqual(result.map((entry) => entry.surface.surfaceId), surfaces.map((entry) => entry.surfaceId));
});
