import assert from "node:assert/strict";
import test from "node:test";

import type { InspectionResolution, InspectionResolveRequest } from "../../app/shared/inspection.ts";
import {
  createInspectionDraftState,
  createInspectionScopeController,
  inspectionDraftReducer
} from "../../app/studio/src/lib/inspection-draft.ts";

function request(nodeId = "node-1"): InspectionResolveRequest {
  return {
    projectSlug: "e2e-fixture",
    root: "workspace",
    htmlPath: "index.html",
    selection: {
      nodeId,
      visibleText: "Fixture heading",
      tagName: "h1",
      role: "",
      testId: "",
      geometry: { x: 10, y: 20, width: 100, height: 30 },
      viewport: { width: 1280, height: 720 },
      scroll: { windowTop: 0, windowLeft: 0, containers: [] },
      pageHref: "http://127.0.0.1/preview/workspace/e2e-fixture/index.html"
    }
  };
}

function resolution(input: InspectionResolveRequest): InspectionResolution {
  return {
    projectSlug: input.projectSlug,
    previewPath: `projects/${input.projectSlug}/workspace/${input.htmlPath}`,
    selection: input.selection,
    resolution: "exact",
    freshness: "current",
    artifactRole: "canonical-editable-source",
    generated: false,
    primaryEditTarget: `projects/${input.projectSlug}/workspace/${input.htmlPath}`,
    primaryEditLine: 1,
    contributors: [],
    rebuildCommand: null,
    validationCommand: null,
    warnings: []
  };
}

test("inspection draft commits selection state atomically", () => {
  const initial = createInspectionDraftState("workspace");
  const pending = inspectionDraftReducer(initial, { type: "begin", previewMode: "workspace" });
  assert.equal(pending.resolving, true);
  assert.equal(pending.request, null);
  assert.equal(pending.resolution, null);

  const nextRequest = request();
  const committed = inspectionDraftReducer(pending, {
    type: "commit",
    request: nextRequest,
    resolution: resolution(nextRequest)
  });
  assert.equal(committed.resolving, false);
  assert.equal(committed.request?.selection.nodeId, "node-1");
  assert.equal(committed.resolution?.selection.nodeId, "node-1");
});

test("inspection draft refreshes request and resolution geometry together", () => {
  const nextRequest = request();
  const committed = inspectionDraftReducer(createInspectionDraftState("workspace"), {
    type: "commit",
    request: nextRequest,
    resolution: resolution(nextRequest)
  });
  const selection = {
    ...nextRequest.selection,
    geometry: { x: 40, y: 60, width: 180, height: 44 }
  };
  const refreshed = inspectionDraftReducer(committed, { type: "replace-selection", selection });
  assert.deepEqual(refreshed.request?.selection.geometry, selection.geometry);
  assert.deepEqual(refreshed.resolution?.selection.geometry, selection.geometry);
});

test("inspection draft reset can preserve or clear teacher input", () => {
  const noted = inspectionDraftReducer(
    inspectionDraftReducer(createInspectionDraftState("workspace"), { type: "teacher-note", value: "Tighten this." }),
    { type: "issue-category", value: "content" }
  );
  const preserved = inspectionDraftReducer(noted, {
    type: "reset",
    previewMode: "reference",
    resetTeacherInput: false
  });
  assert.equal(preserved.teacherNote, "Tighten this.");
  assert.equal(preserved.issueCategory, "content");
  assert.equal(preserved.previewMode, "reference");

  const cleared = inspectionDraftReducer(preserved, {
    type: "reset",
    previewMode: "workspace",
    resetTeacherInput: true
  });
  assert.equal(cleared.teacherNote, "");
  assert.equal(cleared.issueCategory, "unsure");
  assert.equal(cleared.resolution, null);
  assert.equal(cleared.request, null);
});

test("inspection scope aborts stale work and rejects late completions", () => {
  const scope = createInspectionScopeController();
  const first = scope.begin();
  assert.equal(first.signal.aborted, false);
  assert.equal(first.isCurrent(), true);

  const second = scope.begin();
  assert.equal(first.signal.aborted, true);
  assert.equal(first.isCurrent(), false);
  assert.equal(scope.complete(first.scopeVersion), false);
  assert.equal(second.isCurrent(), true);
  assert.equal(scope.complete(second.scopeVersion), true);
});

test("inspection scope reset models course changes and unmount cancellation", () => {
  const scope = createInspectionScopeController();
  const active = scope.begin();
  const resetVersion = scope.reset();
  assert.equal(active.signal.aborted, true);
  assert.equal(active.isCurrent(), false);
  assert.equal(resetVersion, active.scopeVersion + 1);
  assert.equal(scope.currentVersion(), resetVersion);
});
