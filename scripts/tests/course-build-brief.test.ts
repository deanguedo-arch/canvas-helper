import assert from "node:assert/strict";
import test from "node:test";

import { buildCourseBuildBrief } from "../../app/server/routes/course-build-brief.ts";
import { buildCourseBuildBriefPacket } from "../../app/studio/src/lib/course-build-brief.ts";
import {
  inspectCourseAuthoringProject,
  type CourseDoctorReport
} from "../lib/course-authoring/context.ts";

test("course build brief keeps direct, factory, snapshot, and proposal-only routes distinct", async () => {
  const [directReport, factoryReport, snapshotReport] = await Promise.all([
    inspectCourseAuthoringProject("forensics35"),
    inspectCourseAuthoringProject("ela20-1-modern-play-crucible"),
    inspectCourseAuthoringProject("social10-1-related-issue-1-option-2")
  ]);
  const direct = buildCourseBuildBrief(directReport);
  const factory = buildCourseBuildBrief(factoryReport);
  const snapshot = buildCourseBuildBrief(snapshotReport);
  const proposal = buildCourseBuildBrief({
    slug: "proposal-fixture",
    status: "pass",
    issues: [],
    normalizedLegacyPathCount: 0,
    project: {
      slug: "proposal-fixture",
      driverId: "proposal-only-v1",
      driverSource: "declared",
      authoringMode: "proposal-only",
      canonicalSources: [],
      editableSources: [],
      protectedPaths: [],
      sharedSources: [],
      studioEditing: { enabled: false, renameCourse: false, imageAssets: false }
    }
  } satisfies CourseDoctorReport);

  assert.equal(direct.status, "ready");
  assert.equal(direct.mode, "direct");
  assert.ok(direct.editableSources.includes("projects/forensics35/workspace/index.html"));
  assert.equal(direct.generatedOutput, false);

  assert.equal(factory.status, "ready");
  assert.equal(factory.mode, "factory");
  assert.equal(factory.generatedOutput, true);
  assert.ok(factory.editableSources.includes("projects/ela20-1-modern-play-crucible/meta/english-unit.json"));

  assert.equal(snapshot.status, "ready");
  assert.equal(snapshot.mode, "factory");
  assert.equal(snapshot.driver, "legacy-snapshot-v1");
  assert.equal(snapshot.generatedOutput, true);
  assert.ok(snapshot.editableSources.includes("projects/social10-1-related-issue-1-option-2/meta/studio-edits.json"));

  assert.equal(proposal.status, "proposal-only");
  assert.equal(proposal.mode, "proposal-only");
  assert.deepEqual(proposal.editableSources, []);
  assert.match(proposal.issues[0]?.message ?? "", /No safe editable source/i);
});

test("course build brief is bounded and does not copy source contents or local paths", async () => {
  const report = await inspectCourseAuthoringProject("forensics35");
  const brief = buildCourseBuildBrief(report);
  const packet = buildCourseBuildBriefPacket(brief);

  assert.ok(Buffer.byteLength(packet, "utf8") <= 3_000);
  assert.match(packet, /Editable sources:/);
  assert.match(packet, /projects\/forensics35\/workspace\/index\.html/);
  assert.doesNotMatch(packet, /<!doctype html/i);
  assert.doesNotMatch(packet, /\/Users\//);
});
