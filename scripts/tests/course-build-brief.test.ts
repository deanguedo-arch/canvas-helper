import assert from "node:assert/strict";
import test from "node:test";

import { buildCourseBuildBrief } from "../../app/server/routes/course-build-brief.ts";
import { buildCourseBuildBriefPacket } from "../../app/studio/src/lib/course-build-brief.ts";
import {
  inspectCourseAuthoringProject,
  type CourseDoctorReport
} from "../lib/course-authoring/context.ts";

test("course build brief keeps direct, English factory, legacy snapshot, Social snapshot, and proposal-only routes distinct", async () => {
  const [directReport, englishSnapshotReport, socialSnapshotReport] = await Promise.all([
    inspectCourseAuthoringProject("forensics35"),
    inspectCourseAuthoringProject("ela20-1-modern-play-crucible"),
    inspectCourseAuthoringProject("social10-1-related-issue-1-option-2")
  ]);
  const direct = buildCourseBuildBrief(directReport);
  const englishSnapshot = buildCourseBuildBrief(englishSnapshotReport);
  const socialSnapshot = buildCourseBuildBrief(socialSnapshotReport);
  const englishFactory = buildCourseBuildBrief({
    slug: "english-factory-fixture",
    status: "pass",
    issues: [],
    normalizedLegacyPathCount: 0,
    project: {
      slug: "english-factory-fixture",
      driverId: "english-factory-v1",
      driverSource: "declared",
      authoringMode: "factory",
      canonicalSources: [{
        kind: "file",
        repoRelative: "projects/english-factory-fixture/meta/english-unit.json",
        exists: true
      }],
      editableSources: [{
        kind: "file",
        repoRelative: "projects/english-factory-fixture/meta/english-unit.json",
        exists: true
      }],
      protectedPaths: [],
      sharedSources: [],
      regenerateCommand: "npm run build:english-unit -- --project english-factory-fixture",
      studioEditing: { enabled: false, renameCourse: false, imageAssets: false }
    }
  } satisfies CourseDoctorReport);
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

  assert.equal(englishFactory.status, "ready");
  assert.equal(englishFactory.mode, "factory");
  assert.equal(englishFactory.driver, "english-factory-v1");
  assert.equal(englishFactory.generatedOutput, true);
  assert.deepEqual(englishFactory.editableSources, ["projects/english-factory-fixture/meta/english-unit.json"]);
  assert.equal(englishFactory.rebuildCommand, "npm run build:english-unit -- --project english-factory-fixture");

  assert.equal(englishSnapshot.status, "ready");
  assert.equal(englishSnapshot.mode, "factory");
  assert.equal(englishSnapshot.driver, "legacy-snapshot-v1");
  assert.equal(englishSnapshot.generatedOutput, true);
  assert.equal(englishSnapshot.rebuildCommand, null);
  assert.ok(englishSnapshot.editableSources.includes("projects/ela20-1-modern-play-crucible/meta/studio-edits.json"));

  assert.equal(socialSnapshot.status, "ready");
  assert.equal(socialSnapshot.mode, "factory");
  assert.equal(socialSnapshot.driver, "legacy-snapshot-v1");
  assert.equal(socialSnapshot.generatedOutput, true);
  assert.ok(socialSnapshot.editableSources.includes("projects/social10-1-related-issue-1-option-2/meta/studio-edits.json"));

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
