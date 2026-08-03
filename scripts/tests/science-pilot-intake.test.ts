import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { intakeSciencePilot } from "../lib/science-pilot-intake.js";
import { validateProjectManifestPolicy } from "../lib/project-manifest-policy.js";
import type { ProjectManifest } from "../lib/types.js";

test("creates a checksum-named science pilot intake without generating a learner workspace", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-repo-"));
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-sources-"));
  const brightspaceZip = path.join(sourceRoot, "science-brightspace.zip");
  const teacherZip = path.join(sourceRoot, "science-teacher.zip");
  try {
    await Promise.all([writeFile(brightspaceZip, "brightspace source", "utf8"), writeFile(teacherZip, "teacher source", "utf8")]);
    const result = await intakeSciencePilot({
      repoRoot,
      projectSlug: "science20-pilot",
      courseCode: "SCI 20",
      courseTitle: "Science 20",
      mode: "conversion",
      brightspaceZip,
      teacherResourcesZip: teacherZip
    });

    assert.equal(result.resources.length, 2);
    const projectManifest = JSON.parse(
      await readFile(path.join(repoRoot, "projects", "science20-pilot", "meta", "project.json"), "utf8")
    ) as ProjectManifest;
    assert.equal(validateProjectManifestPolicy(projectManifest).status, "valid");
    assert.equal(projectManifest.authoringStatus, "blocked");
    assert.equal(projectManifest.authoring?.driverId, "proposal-only-v1");
    assert.deepEqual(projectManifest.authoring?.sourceResourceIds, ["brightspace-export", "teacher-resources"]);
    assert.equal(projectManifest.sourcePath, "projects/resources/science20-pilot/resource-manifest.json");
    assert.deepEqual(projectManifest.canonicalSources, [
      "projects/science20-pilot/meta/science-pilot.json",
      "projects/science20-pilot/meta/prompt-pack.md",
      "projects/science20-pilot/meta/decision-log.md"
    ]);
    assert.doesNotMatch(JSON.stringify(projectManifest), /science-pilot-repo-/);
    const sciencePilot = JSON.parse(
      await readFile(path.join(repoRoot, "projects", "science20-pilot", "meta", "science-pilot.json"), "utf8")
    ) as { instructionalPattern: { learnerLoop: string[] } };
    assert.deepEqual(sciencePilot.instructionalPattern.learnerLoop, ["question", "investigate", "explain", "apply", "reflect"]);
    const resourceManifest = JSON.parse(
      await readFile(path.join(repoRoot, "projects", "resources", "science20-pilot", "resource-manifest.json"), "utf8")
    ) as { resources: Array<{ path: string; sha256: string }> };
    assert.equal(resourceManifest.resources.length, 2);
    for (const resource of resourceManifest.resources) {
      assert.match(resource.path, /^projects\/resources\/science20-pilot\/_sources\/[a-f0-9]{64}\.zip$/);
      await readFile(path.join(repoRoot, resource.path));
    }
    await assert.rejects(readFile(path.join(repoRoot, "projects", "science20-pilot", "workspace", "index.html"), "utf8"));
    const decisionLog = await readFile(path.join(repoRoot, "projects", "science20-pilot", "meta", "decision-log.md"), "utf8");
    assert.match(decisionLog, /Red team/);
    assert.match(decisionLog, /projects\/resources\/science20-pilot\/resource-manifest\.json/);
  } finally {
    await Promise.all([rm(repoRoot, { recursive: true, force: true }), rm(sourceRoot, { recursive: true, force: true })]);
  }
});

test("removes staged science resources when a later input is invalid", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-repo-"));
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-sources-"));
  const brightspaceZip = path.join(sourceRoot, "science-brightspace.zip");
  const invalidTeacherSource = path.join(sourceRoot, "science-teacher.txt");
  try {
    await Promise.all([
      writeFile(brightspaceZip, "brightspace source", "utf8"),
      writeFile(invalidTeacherSource, "not a zip", "utf8")
    ]);
    await assert.rejects(
      intakeSciencePilot({
        repoRoot,
        projectSlug: "science20-pilot",
        courseCode: "SCI 20",
        courseTitle: "Science 20",
        mode: "conversion",
        brightspaceZip,
        teacherResourcesZip: invalidTeacherSource
      }),
      /must be a \.zip archive/
    );
    await assert.rejects(readFile(path.join(repoRoot, "projects", "science20-pilot", "meta", "project.json"), "utf8"));
    await assert.rejects(readFile(path.join(repoRoot, "projects", "resources", "science20-pilot", "resource-manifest.json"), "utf8"));
  } finally {
    await Promise.all([rm(repoRoot, { recursive: true, force: true }), rm(sourceRoot, { recursive: true, force: true })]);
  }
});

test("refuses a duplicate science pilot slug without replacing existing work", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-repo-"));
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), "science-pilot-sources-"));
  const brightspaceZip = path.join(sourceRoot, "science-brightspace.zip");
  try {
    await writeFile(brightspaceZip, "brightspace source", "utf8");
    const request = {
      repoRoot,
      projectSlug: "science20-pilot",
      courseCode: "SCI 20",
      courseTitle: "Science 20",
      mode: "conversion" as const,
      brightspaceZip
    };
    await intakeSciencePilot(request);
    await assert.rejects(intakeSciencePilot(request), /project already exists/);
    assert.match(
      await readFile(path.join(repoRoot, "projects", "science20-pilot", "meta", "science-pilot.json"), "utf8"),
      /intake-complete/
    );
  } finally {
    await Promise.all([rm(repoRoot, { recursive: true, force: true }), rm(sourceRoot, { recursive: true, force: true })]);
  }
});
