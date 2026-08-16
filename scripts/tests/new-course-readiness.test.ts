import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { promisify } from "node:util";

import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_CANDIDATE_KINDS,
  STUDIO_ROUTINE_CONTENT_CAPABILITY_KINDS,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID,
  type CourseEditabilityProjectReport
} from "../../app/shared/course-editability.ts";
import {
  discoverNewCourseReadinessCandidates,
  evaluateNewCourseCoverageReadiness,
  evaluateNewCourseManifestReadiness,
  NEW_COURSE_EDITABILITY_POLICY_INCEPTION
} from "../lib/new-course-readiness.ts";
import type { ProjectManifest } from "../lib/types.ts";

const execFileAsync = promisify(execFile);

function manifest(slug: string, overrides: Partial<ProjectManifest> = {}): ProjectManifest {
  const projectRoot = `projects/${slug}`;
  return {
    id: slug,
    slug,
    title: "Readiness fixture",
    sourcePath: `${projectRoot}/raw/original.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: "workspace/index.html",
    rawEntrypoint: "raw/original.html",
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: "2026-08-15T00:00:00.000Z",
    createdAt: "2026-08-15T00:00:00.000Z",
    updatedAt: "2026-08-15T00:00:00.000Z",
    migrationState: "migrated",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: `${projectRoot}/workspace/index.html`,
    canonicalSources: [`${projectRoot}/workspace/index.html`],
    authoringStatus: "active",
    exportTargets: [{ target: "html", enabled: true }],
    authoring: {
      driverId: "direct-workspace-v1",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "static-pages-complete",
        pages: [{ htmlPath: "index.html", route: "" }]
      },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    },
    ...overrides
  };
}

function coverageReport(): CourseEditabilityProjectReport {
  const candidatesByKind = Object.fromEntries(
    STUDIO_ROUTINE_CONTENT_CANDIDATE_KINDS.map((kind) => [kind, { supported: 1, total: 1 }])
  );
  const capabilitiesByKind = Object.fromEntries(
    STUDIO_ROUTINE_CONTENT_CAPABILITY_KINDS.map((kind) => [kind, { supported: 1, total: 1 }])
  );
  const surface = {
    surfaceId: "ls1:fixture",
    projectSlug: "ready-course",
    htmlPath: "index.html",
    route: "",
    stateKey: null,
    inventorySource: "manifest" as const
  };
  return {
    projectSlug: "ready-course",
    adapter: "direct",
    inventory: { schemaVersion: 1, complete: true, surfaces: [surface], errorCode: null },
    status: "complete",
    blockCoverage: { numerator: 9, denominator: 10 },
    teacherTextCoverage: { numerator: 900, denominator: 1_000 },
    candidatesByKind,
    capabilitiesByKind,
    reasons: { ready: 10 },
    surfaces: [{
      surface,
      status: "complete",
      blockCoverage: { numerator: 9, denominator: 10 },
      teacherTextCoverage: { numerator: 900, denominator: 1_000 },
      candidatesByKind,
      capabilitiesByKind,
      reasons: { ready: 10 },
      exclusions: {},
      renderedOccurrenceCount: 10,
      duplicateOccurrenceCount: 0
    }]
  };
}

test("new active courses require the versioned Studio-ready manifest contract", () => {
  assert.equal(evaluateNewCourseManifestReadiness(manifest("ready-course"), "ready-course").passed, true);

  const withoutContract = manifest("without-contract");
  delete withoutContract.authoring?.editabilityContract;
  assert.ok(
    evaluateNewCourseManifestReadiness(withoutContract, "without-contract").failedCodes.includes(
      "versioned-editability-contract"
    )
  );

  const legacy = manifest("legacy-driver", {
    authoring: {
      ...manifest("legacy-driver").authoring!,
      driverId: "legacy-snapshot-v1"
    }
  });
  assert.ok(
    evaluateNewCourseManifestReadiness(legacy, "legacy-driver").failedCodes.includes(
      "supported-new-course-driver"
    )
  );

  const disabled = manifest("disabled");
  disabled.authoring!.studioEditing!.enabled = false;
  assert.ok(
    evaluateNewCourseManifestReadiness(disabled, "disabled").failedCodes.includes("studio-editing-enabled")
  );
});

test("the durable policy anchor matches the executable inception and profile", async () => {
  const anchor = JSON.parse(await readFile(
    path.resolve("config/studio-editability-policy-v1.json"),
    "utf8"
  )) as { schemaVersion: number; policyId: string; inceptionCommit: string };
  assert.equal(anchor.schemaVersion, STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION);
  assert.equal(anchor.policyId, STUDIO_ROUTINE_CONTENT_PROFILE_ID);
  assert.equal(anchor.inceptionCommit, NEW_COURSE_EDITABILITY_POLICY_INCEPTION);
});

test("new-course rendered coverage enforces every profile floor", () => {
  assert.equal(evaluateNewCourseCoverageReadiness(coverageReport()).passed, true);

  const lowText = coverageReport();
  lowText.teacherTextCoverage = { numerator: 899, denominator: 1_000 };
  assert.ok(
    evaluateNewCourseCoverageReadiness(lowText).failedCodes.includes("teacher-text-coverage-90")
  );

  const missingImage = coverageReport();
  delete missingImage.candidatesByKind.image;
  const missingImageResult = evaluateNewCourseCoverageReadiness(missingImage);
  assert.ok(missingImageResult.failedCodes.includes("candidate-image-present"));
  assert.ok(missingImageResult.failedCodes.includes("candidate-image-80"));

  const lowLink = coverageReport();
  lowLink.capabilitiesByKind["link-destination"] = { supported: 8, total: 10 };
  assert.ok(
    evaluateNewCourseCoverageReadiness(lowLink).failedCodes.includes("capability-link-destination-90")
  );
});

async function git(repoRoot: string, args: string[]) {
  const { stdout } = await execFileAsync("git", args, { cwd: repoRoot, encoding: "utf8" });
  return stdout.trim();
}

async function writeManifest(repoRoot: string, value: ProjectManifest) {
  const manifestPath = path.join(repoRoot, "projects", value.slug, "meta", "project.json");
  await mkdir(path.dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function writeJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function createEnglishDependencyFixture() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-english-dependencies-"));
  const sourceRoot = path.resolve();
  const target = JSON.parse(await readFile(
    path.join(sourceRoot, "projects", "ela20-2-short-stories", "meta", "english-unit.json"),
    "utf8"
  )) as Record<string, any>;
  const donor = JSON.parse(await readFile(
    path.join(sourceRoot, "projects", "ela20-1-short-stories-pilot", "meta", "english-unit.json"),
    "utf8"
  )) as Record<string, any>;
  target.projectSlug = "english-target";
  target.courseCode = "ELA 20-1";
  target.courseTitle = "English Dependency Target";
  target.unitTitle = "Dependency Target";
  target.derivesFromProject = "english-donor";
  target.source.brightspaceZip = "projects/english-target/raw/target.zip";
  target.source.teacherResourcesZip = "projects/english-target/raw/teacher.zip";
  target.source.lessonSelectors = [{ itemId: "donor:english-donor", title: "Donor lesson", disposition: "include" }];
  donor.projectSlug = "english-donor";
  donor.source.brightspaceZip = "projects/english-donor/raw/donor.zip";
  donor.source.teacherResourcesZip = "projects/english-donor/raw/donor-teacher.zip";

  await git(repoRoot, ["init"]);
  await git(repoRoot, ["config", "user.email", "readiness@example.invalid"]);
  await git(repoRoot, ["config", "user.name", "Readiness Test"]);
  await writeJson(path.join(repoRoot, "config", "studio-editability-policy-v1.json"), {
    schemaVersion: 1,
    policyId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
  });
  await writeJson(path.join(repoRoot, "config", "english", "families", "ela20-1.json"), {
    schemaVersion: 1,
    courseId: "ela20-1",
    courseCode: "ELA 20-1",
    courseTitle: "English Language Arts 20-1",
    profileId: "fixture",
    profileVersion: "fixture-v1",
    archives: [
      {
        id: "brightspace",
        kind: "brightspace",
        path: "projects/english-target/raw/target.zip",
        sha256: "1".repeat(64)
      },
      {
        id: "teacher-resources",
        kind: "teacher-resources",
        path: "projects/english-target/raw/teacher.zip",
        sha256: "2".repeat(64)
      },
      {
        id: "supplement",
        kind: "supplement",
        path: "config/english/families/fixture-supplement.txt",
        sha256: "0".repeat(64)
      }
    ],
    units: [{
      projectSlug: "english-target",
      unitTitle: "Dependency Target",
      recipePath: "projects/english-target/meta/english-unit.json",
      profileVersion: "fixture-v1",
      activityProfile: "short-fiction",
      brightspaceUnitIds: ["1"],
      reviewStatus: "needs-review"
    }]
  });
  await writeFile(path.join(repoRoot, "config", "english", "families", "fixture-supplement.txt"), "supplement\n", "utf8");
  await writeJson(path.join(repoRoot, "projects", "english-target", "meta", "english-unit.json"), target);
  await writeJson(path.join(repoRoot, "projects", "english-donor", "meta", "english-unit.json"), donor);
  await writeManifest(repoRoot, manifest("english-target", {
    canonicalSources: ["/legacy-checkout/scripts/lib/english-unit/factory-build.ts"],
    authoring: {
      driverId: "english-factory-v1",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    }
  }));
  await Promise.all([
    mkdir(path.join(repoRoot, "projects", "english-target", "raw"), { recursive: true }),
    mkdir(path.join(repoRoot, "projects", "english-donor", "raw"), { recursive: true }),
    mkdir(path.join(repoRoot, "scripts", "lib", "english-unit"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(path.join(repoRoot, "projects", "english-target", "raw", "target.zip"), "target", "utf8"),
    writeFile(path.join(repoRoot, "projects", "english-target", "raw", "teacher.zip"), "teacher", "utf8"),
    writeFile(path.join(repoRoot, "projects", "english-donor", "raw", "donor.zip"), "donor", "utf8"),
    writeFile(path.join(repoRoot, "projects", "english-donor", "raw", "donor-teacher.zip"), "teacher", "utf8"),
    writeFile(path.join(repoRoot, "scripts", "build-english-unit.ts"), "export {};\n", "utf8"),
    writeFile(path.join(repoRoot, "scripts", "lib", "english-unit", "factory-build.ts"), "export {};\n", "utf8")
  ]);
  await git(repoRoot, ["add", "--all"]);
  await git(repoRoot, ["commit", "-m", "english readiness baseline"]);
  return { repoRoot, baseline: await git(repoRoot, ["rev-parse", "HEAD"]) };
}

test("English factory recipe dependencies select governed courses in clean checkouts", async () => {
  const fixture = await createEnglishDependencyFixture();
  const cases = [
    "config/english/families/ela20-1.json",
    "projects/english-donor/meta/english-unit.json",
    "projects/english-donor/raw/donor.zip",
    "scripts/lib/english-unit/factory-build.ts"
  ];
  try {
    for (const changedPath of cases) {
      const cloneRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-english-clean-checkout-"));
      await rm(cloneRoot, { recursive: true, force: true });
      try {
        await git(fixture.repoRoot, ["clone", "--no-local", fixture.repoRoot, cloneRoot]);
        await git(cloneRoot, ["config", "user.email", "readiness@example.invalid"]);
        await git(cloneRoot, ["config", "user.name", "Readiness Test"]);
        const changedFile = path.join(cloneRoot, ...changedPath.split("/"));
        const current = await readFile(changedFile, "utf8");
        await writeFile(
          changedFile,
          changedPath.endsWith(".json") ? `${current}\n` : `${current}changed\n`,
          "utf8"
        );
        await git(cloneRoot, ["add", changedPath]);
        await git(cloneRoot, ["commit", "-m", `change ${changedPath}`]);
        const discovered = await discoverNewCourseReadinessCandidates({
          repoRoot: cloneRoot,
          requestedBase: fixture.baseline,
          policyInception: fixture.baseline
        });
        const candidate = discovered.candidates.find((entry) => entry.projectSlug === "english-target");
        assert.ok(candidate, `${changedPath} must select the governed English factory target.`);
        assert.equal(candidate.required, true, `${changedPath} must not allow a zero-required readiness pass.`);
        assert.ok(candidate.changedPaths.includes(changedPath));
      } finally {
        await rm(cloneRoot, { recursive: true, force: true });
      }
    }
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("change-aware discovery enforces additions, activation, and governed edits without retroactive legacy failure", async () => {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-new-course-policy-"));
  try {
    await git(repoRoot, ["init"]);
    await git(repoRoot, ["config", "user.email", "readiness@example.invalid"]);
    await git(repoRoot, ["config", "user.name", "Readiness Test"]);
    await writeFile(path.join(repoRoot, "README.md"), "pre-policy\n", "utf8");
    await git(repoRoot, ["add", "README.md"]);
    await git(repoRoot, ["commit", "-m", "pre-policy"]);
    const prePolicy = await git(repoRoot, ["rev-parse", "HEAD"]);

    const oldLegacy = manifest("old-legacy");
    delete oldLegacy.authoring?.editabilityContract;
    const governed = manifest("governed");
    governed.canonicalSources!.push("scripts/shared-governed-builder.ts");
    const contractRemoved = manifest("contract-removed");
    const governedDeleted = manifest("governed-deleted");
    const activated = manifest("activated", { authoringStatus: "blocked" });
    delete activated.authoring?.editabilityContract;
    const onboarded = manifest("onboarded", {
      authoring: {
        driverId: "proposal-only-v1",
        studioEditing: { enabled: false, renameCourse: false, imageAssets: false }
      }
    });
    await Promise.all([
      writeManifest(repoRoot, oldLegacy),
      writeManifest(repoRoot, governed),
      writeManifest(repoRoot, contractRemoved),
      writeManifest(repoRoot, governedDeleted),
      writeManifest(repoRoot, activated),
      writeManifest(repoRoot, onboarded)
    ]);
    await mkdir(path.join(repoRoot, "config"), { recursive: true });
    await writeFile(
      path.join(repoRoot, "config", "studio-editability-policy-v1.json"),
      '{"schemaVersion":1,"policyId":"studio-routine-content-v1"}\n',
      "utf8"
    );
    await mkdir(path.join(repoRoot, "projects", "old-legacy", "workspace"), { recursive: true });
    await mkdir(path.join(repoRoot, "scripts"), { recursive: true });
    await writeFile(path.join(repoRoot, "projects", "old-legacy", "workspace", "index.html"), "old", "utf8");
    await writeFile(path.join(repoRoot, "scripts", "shared-governed-builder.ts"), "export const version = 1;\n", "utf8");
    await git(repoRoot, ["add", "projects", "scripts", "config"]);
    await git(repoRoot, ["commit", "-m", "baseline"]);
    const inception = await git(repoRoot, ["rev-parse", "HEAD"]);

    await writeFile(path.join(repoRoot, "projects", "old-legacy", "workspace", "index.html"), "changed", "utf8");
    await writeFile(path.join(repoRoot, "scripts", "shared-governed-builder.ts"), "export const version = 2;\n", "utf8");
    delete contractRemoved.authoring?.editabilityContract;
    await writeManifest(repoRoot, contractRemoved);
    await git(repoRoot, ["rm", "-r", "projects/governed-deleted"]);
    await writeManifest(repoRoot, manifest("activated"));
    await writeManifest(repoRoot, manifest("onboarded"));
    await writeManifest(repoRoot, manifest("new-active"));
    const malformedManifestPath = path.join(repoRoot, "projects", "malformed-new", "meta", "project.json");
    await mkdir(path.dirname(malformedManifestPath), { recursive: true });
    await writeFile(malformedManifestPath, "{ not-json\n", "utf8");
    const blocked = manifest("new-blocked", { authoringStatus: "blocked" });
    delete blocked.authoring?.editabilityContract;
    await writeManifest(repoRoot, blocked);
    await git(repoRoot, ["add", "--all", "projects", "scripts"]);
    await git(repoRoot, ["commit", "-m", "course changes"]);
    assert.match(
      await git(repoRoot, ["diff", "--no-renames", "--name-only", `${inception}...HEAD`]),
      /projects\/governed-deleted\/meta\/project\.json/
    );

    const discovered = await discoverNewCourseReadinessCandidates({
      repoRoot,
      requestedBase: prePolicy,
      policyInception: inception
    });
    assert.equal(discovered.comparisonBase, inception);
    assert.deepEqual(
      discovered.candidates.map((candidate) => [candidate.projectSlug, candidate.trigger, candidate.required]),
      [
        ["activated", "activated", true],
        ["contract-removed", "governed-change", true],
        ["governed", "governed-change", true],
        ["governed-deleted", "governed-change", true],
        ["malformed-new", "new-active", true],
        ["new-active", "new-active", true],
        ["new-blocked", "new-non-active", false],
        ["onboarded", "activated", true]
      ]
    );
    assert.equal(discovered.candidates.some((candidate) => candidate.projectSlug === "old-legacy"), false);

    const squashSafe = await discoverNewCourseReadinessCandidates({
      repoRoot,
      requestedBase: prePolicy,
      policyInception: "missing-policy-inception"
    });
    assert.equal(squashSafe.comparisonBase, squashSafe.exactHead);
    assert.deepEqual(squashSafe.candidates, []);
  } finally {
    await rm(repoRoot, { recursive: true, force: true });
  }
});
