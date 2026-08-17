import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  MAX_PROJECT_CONTEXT_BYTES,
  buildProjectAuthoringContext,
  inspectCourseAuthoringProject,
  listCourseAuthoringProjects,
  renderProjectAuthoringContext
} from "../lib/course-authoring/context.js";

type FixtureOptions = {
  canonicalEntry?: string;
  canonicalSources?: string[];
  regenerateCommand?: string;
  sourceOfTruthNotes?: string;
  authoringStatus?: string;
  authoring?: {
    driverId:
      | "direct-workspace-v1"
      | "english-factory-v1"
      | "social-related-issues-v1"
      | "legacy-snapshot-v1"
      | "proposal-only-v1";
    familyId?: string;
    sourceResourceIds?: string[];
    studioEditing?: { enabled: boolean; renameCourse?: boolean; imageAssets?: boolean };
  };
};

async function createFixture(options: FixtureOptions = {}) {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-context-"));
  const slug = "course";
  const projectRoot = path.join(repoRoot, "projects", slug);
  const workspaceDir = path.join(projectRoot, "workspace");
  const metaDir = path.join(projectRoot, "meta");
  await Promise.all([
    mkdir(workspaceDir, { recursive: true }),
    mkdir(path.join(projectRoot, "raw"), { recursive: true }),
    mkdir(path.join(projectRoot, "exports"), { recursive: true })
  ]);
  await Promise.all([
    writeFile(path.join(workspaceDir, "index.html"), "<main>course</main>", "utf8"),
    writeFile(path.join(workspaceDir, "main.js"), "export {};", "utf8")
  ]);

  const indexPath = path.join(workspaceDir, "index.html");
  const mainPath = path.join(workspaceDir, "main.js");
  const manifest = {
    id: slug,
    slug,
    sourcePath: path.join(repoRoot, "source.html"),
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: indexPath,
    rawEntrypoint: path.join(projectRoot, "raw", "original.html"),
    learningSource: "other",
    learningTrust: "auto",
    learningUpdatedAt: "2026-08-02T00:00:00.000Z",
    createdAt: "2026-08-02T00:00:00.000Z",
    updatedAt: "2026-08-02T00:00:00.000Z",
    migrationState: "migrated",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: options.canonicalEntry ?? indexPath,
    canonicalSources: options.canonicalSources ?? [indexPath, mainPath],
    authoringStatus: options.authoringStatus ?? "active",
    exportTargets: [{ target: "scorm", enabled: true }],
    ...(options.regenerateCommand ? { regenerateCommand: options.regenerateCommand } : {}),
    ...(options.sourceOfTruthNotes ? { sourceOfTruthNotes: options.sourceOfTruthNotes } : {}),
    ...(options.authoring ? { authoring: options.authoring } : {})
  };
  await mkdir(metaDir, { recursive: true });
  await writeFile(path.join(metaDir, "project.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return { repoRoot, slug, projectRoot, workspaceDir, metaDir, indexPath, mainPath };
}

async function createSocialSourceFixture(repoRoot: string) {
  const resourcePath = "projects/resources/social30-1-related-issues/_sources/social30-fixture.zip";
  const sourcePath = path.join(repoRoot, resourcePath);
  const manifestPath = path.join(repoRoot, "projects/resources/social30-1-related-issues/resource-manifest.json");
  const content = "fixture source export";
  const sha256 = createHash("sha256").update(content).digest("hex");
  await Promise.all([mkdir(path.dirname(sourcePath), { recursive: true }), mkdir(path.dirname(manifestPath), { recursive: true })]);
  await Promise.all([
    writeFile(sourcePath, content, "utf8"),
    writeFile(
      manifestPath,
      `${JSON.stringify(
        {
          schemaVersion: 1,
          familyId: "social30-1-related-issues",
          resources: [
            {
              id: "social30-fixture",
              kind: "brightspace-zip",
              path: resourcePath,
              sha256,
              availability: "canonical",
              provenance: { sourceSystem: "brightspace", description: "Fixture source export." }
            }
          ]
        },
        null,
        2
      )}\n`,
      "utf8"
    )
  ]);
}

async function createEnglishFactoryFixture(fixture: Awaited<ReturnType<typeof createFixture>>, options: { includeTeacherArchive?: boolean } = {}) {
  const brightspaceArchive = path.join(fixture.projectRoot, "raw", "brightspace.zip");
  const teacherArchive = path.join(fixture.projectRoot, "raw", "teacher.zip");
  await Promise.all([
    writeFile(
      path.join(fixture.metaDir, "english-unit.json"),
      `${JSON.stringify(
        {
          source: {
            brightspaceZip: "raw/brightspace.zip",
            teacherResourcesZip: "raw/teacher.zip"
          }
        },
        null,
        2
      )}\n`,
      "utf8"
    ),
    writeFile(brightspaceArchive, "fixture Brightspace archive", "utf8"),
    mkdir(path.join(fixture.workspaceDir, "components"), { recursive: true }),
    mkdir(path.join(fixture.workspaceDir, "assets", "custom"), { recursive: true }),
    mkdir(path.join(fixture.repoRoot, "scripts", "lib", "english-unit"), { recursive: true })
  ]);
  if (options.includeTeacherArchive !== false) {
    await writeFile(teacherArchive, "fixture teacher archive", "utf8");
  }
  await Promise.all([
    writeFile(path.join(fixture.repoRoot, "scripts", "build-english-unit.ts"), "export {};", "utf8"),
    writeFile(path.join(fixture.repoRoot, "scripts", "lib", "english-unit", "factory-build.ts"), "export {};", "utf8"),
    writeFile(path.join(fixture.repoRoot, "scripts", "lib", "english-unit", "workspace-staging.ts"), "export {};", "utf8")
  ]);
}

test("builds a bounded repo-relative context without loading large project artifacts", async () => {
  const fixture = await createFixture();
  try {
    const { report, text } = await buildProjectAuthoringContext(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.ok(text);
    assert.match(text, /projects\/course\/workspace\/index\.html/);
    assert.doesNotMatch(text, new RegExp(fixture.repoRoot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.doesNotMatch(text, /course-blueprint|resource-catalog|prompt-pack content/i);
    assert.ok(Buffer.byteLength(text, "utf8") <= MAX_PROJECT_CONTEXT_BYTES);
    assert.ok(report.normalizedLegacyPathCount > 0);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("normalizes only a legacy Windows path anchored to this checkout", async () => {
  const fixture = await createFixture();
  try {
    const windowsIndex = `C:\\work\\${path.basename(fixture.repoRoot)}\\projects\\course\\workspace\\index.html`;
    const manifestPath = path.join(fixture.metaDir, "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.canonicalEntry = windowsIndex;
    manifest.canonicalSources = [windowsIndex];
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const { report, text } = await buildProjectAuthoringContext(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.match(text ?? "", /projects\/course\/workspace\/index\.html/);
    assert.ok(report.normalizedLegacyPathCount > 0);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("a declared Direct project may keep shared canonical code outside workspace without making it editable", async () => {
  const fixture = await createFixture({
    authoring: {
      driverId: "direct-workspace-v1",
      studioEditing: { enabled: true }
    }
  });
  try {
    const sharedPath = path.join(fixture.repoRoot, "scripts", "shared-renderer.ts");
    await mkdir(path.dirname(sharedPath), { recursive: true });
    await writeFile(sharedPath, "export {};", "utf8");
    const manifestPath = path.join(fixture.metaDir, "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.canonicalSources = [fixture.indexPath, sharedPath];
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.equal(report.project?.authoringMode, "direct");
    assert.deepEqual(report.project?.editableSources.map((entry) => entry.repoRelative), ["projects/course/workspace/index.html"]);
    assert.deepEqual(report.project?.sharedSources.map((entry) => entry.repoRelative), ["scripts/shared-renderer.ts"]);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("a declared legacy snapshot stores edits as overrides and protects the materialized workspace", async () => {
  const fixture = await createFixture({
    authoring: {
      driverId: "legacy-snapshot-v1",
      familyId: "legacy-snapshot",
      studioEditing: { enabled: true, imageAssets: true }
    }
  });
  try {
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.equal(report.project?.driverId, "legacy-snapshot-v1");
    assert.equal(report.project?.authoringMode, "factory");
    assert.equal(report.project?.editableSources[0]?.repoRelative, "projects/course/meta/studio-edits.json");
    assert.ok(report.project?.protectedPaths.some((entry) => entry.repoRelative === "projects/course/workspace"));
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("fails closed for unresolved absolute paths, traversal, protected zones, and symlink escapes", async (t) => {
  await t.test("unresolved Windows path", async () => {
    const fixture = await createFixture({
      canonicalEntry: "C:\\work\\other-checkout\\projects\\course\\workspace\\index.html",
      canonicalSources: ["C:\\work\\other-checkout\\projects\\course\\workspace\\index.html"]
    });
    try {
      const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
      assert.equal(report.status, "fail");
      assert.match(report.issues.map((issue) => issue.message).join("\n"), /Cannot safely resolve legacy Windows path/);
    } finally {
      await rm(fixture.repoRoot, { recursive: true, force: true });
    }
  });

  await t.test("traversal and protected raw path", async () => {
    const fixture = await createFixture();
    try {
      const manifestPath = path.join(fixture.metaDir, "project.json");
      const traversalPath = `${fixture.workspaceDir}/../meta/project.json`;
      const rawPath = path.join(fixture.projectRoot, "raw", "original.html");
      await writeFile(rawPath, "raw", "utf8");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
      manifest.canonicalEntry = traversalPath;
      manifest.canonicalSources = [traversalPath, rawPath];
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

      const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
      assert.equal(report.status, "fail");
      const messages = report.issues.map((issue) => issue.message).join("\n");
      assert.match(messages, /traversal segments/);
      assert.match(messages, /protected raw or exports path/);
    } finally {
      await rm(fixture.repoRoot, { recursive: true, force: true });
    }
  });

  await t.test("stale canonical source", async () => {
    const fixture = await createFixture({
      canonicalSources: [path.join(os.tmpdir(), "not-used")]
    });
    try {
      const manifestPath = path.join(fixture.metaDir, "project.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
      const stalePath = path.join(fixture.workspaceDir, "missing.js");
      manifest.canonicalSources = [fixture.indexPath, stalePath];
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

      const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
      assert.equal(report.status, "fail");
      assert.match(report.issues.map((issue) => issue.message).join("\n"), /does not exist/);
    } finally {
      await rm(fixture.repoRoot, { recursive: true, force: true });
    }
  });

  await t.test("symlink escape", async () => {
    const fixture = await createFixture();
    const outsideRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-outside-"));
    try {
      await writeFile(path.join(outsideRoot, "source.html"), "outside", "utf8");
      await symlink(outsideRoot, path.join(fixture.workspaceDir, "linked"));
      const manifestPath = path.join(fixture.metaDir, "project.json");
      const escapedPath = path.join(fixture.workspaceDir, "linked", "source.html");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
      manifest.canonicalEntry = escapedPath;
      manifest.canonicalSources = [escapedPath];
      await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

      const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
      assert.equal(report.status, "fail");
      assert.match(report.issues.map((issue) => issue.message).join("\n"), /symbolic link/);
    } finally {
      await Promise.all([
        rm(fixture.repoRoot, { recursive: true, force: true }),
        rm(outsideRoot, { recursive: true, force: true })
      ]);
    }
  });
});

test("uses the English staging contract instead of treating factory output as editable", async () => {
  const fixture = await createFixture({
    regenerateCommand: "npm run build:english-unit -- --project course",
    sourceOfTruthNotes: "Factory-owned index/assets/generated output is replaced through a safe staged build."
  });
  try {
    await createEnglishFactoryFixture(fixture);

    const { report, text } = await buildProjectAuthoringContext(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.equal(report.project?.canonicalSources.length, 2);
    assert.match(text ?? "", /Driver: english-factory-v1/);
    const editableSection = (text ?? "").split("## Shared sources")[0];
    assert.match(editableSection, /meta\/english-unit\.json/);
    assert.doesNotMatch(editableSection, /workspace\/index\.html/);
    assert.match(text ?? "", /workspace\/index\.html/);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("blocks an English factory project when a declared recipe archive is missing", async () => {
  const fixture = await createFixture({ regenerateCommand: "npm run build:english-unit -- --project course" });
  try {
    await createEnglishFactoryFixture(fixture, { includeTeacherArchive: false });
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "fail");
    assert.ok(report.issues.some((issue) => issue.code === "missing-source" && /teacher-resource archive/.test(issue.message)));
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("blocks an English factory project when a declared archive is an unresolved LFS pointer", async () => {
  const fixture = await createFixture({ regenerateCommand: "npm run build:english-unit -- --project course" });
  try {
    await createEnglishFactoryFixture(fixture);
    await writeFile(
      path.join(fixture.projectRoot, "raw", "teacher.zip"),
      "version https://git-lfs.github.com/spec/v1\noid sha256:placeholder\nsize 1\n",
      "utf8"
    );
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "fail");
    assert.ok(report.issues.some((issue) => issue.code === "unresolved-lfs-source" && /teacher-resource archive/.test(issue.message)));
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("uses a declared shared Social driver instead of treating generated workspace output as editable", async () => {
  const fixture = await createFixture({
    authoring: {
      driverId: "social-related-issues-v1",
      familyId: "social30-related-issues",
      sourceResourceIds: ["social30-fixture"]
    }
  });
  try {
    await createSocialSourceFixture(fixture.repoRoot);
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.equal(report.project?.driverId, "social-related-issues-v1");
    assert.equal(report.project?.driverSource, "declared");
    assert.equal(report.project?.authoringMode, "factory");
    assert.equal(report.project?.editableSources[0]?.repoRelative, "projects/course/meta/studio-edits.json");
    assert.ok(report.project?.protectedPaths.some((entry) => entry.repoRelative === "projects/course/workspace"));
    assert.ok(report.project?.sharedSources.some((entry) => entry.repoRelative.endsWith("social30-fixture.zip")));
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("blocks a Social project whose authoring contract does not name a source resource", async () => {
  const fixture = await createFixture({
    authoring: { driverId: "social-related-issues-v1", familyId: "social30-related-issues" }
  });
  try {
    await createSocialSourceFixture(fixture.repoRoot);
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "fail");
    assert.ok(report.issues.some((issue) => issue.code === "missing-social-resource"));
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("course:list derives readiness from the same doctor inspection", async () => {
  const fixture = await createFixture();
  try {
    const readyRows = await listCourseAuthoringProjects({ repoRoot: fixture.repoRoot });
    assert.deepEqual(readyRows, [
      {
        slug: fixture.slug,
        readiness: "not-onboarded",
        lifecycle: "active",
        driver: "direct-workspace-v1",
        driverSource: "legacy-inferred",
        issueCount: 0
      }
    ]);

    const manifestPath = path.join(fixture.metaDir, "project.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<string, unknown>;
    manifest.canonicalSources = [fixture.indexPath, path.join(fixture.workspaceDir, "missing.js")];
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

    const blockedRows = await listCourseAuthoringProjects({ repoRoot: fixture.repoRoot });
    assert.equal(blockedRows.length, 1);
    assert.equal(blockedRows[0]?.readiness, "blocked");
    assert.equal(blockedRows[0]?.driver, "direct-workspace-v1");
    assert.ok((blockedRows[0]?.issueCount ?? 0) > 0);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("course:list preserves an intentional blocked planning state", async () => {
  const fixture = await createFixture({
    authoringStatus: "blocked",
    authoring: { driverId: "proposal-only-v1", familyId: "science-pilot-v1" }
  });
  try {
    const rows = await listCourseAuthoringProjects({ includeAll: true, repoRoot: fixture.repoRoot });
    assert.deepEqual(rows, [
      {
        slug: fixture.slug,
        readiness: "blocked",
        lifecycle: "blocked",
        driver: "proposal-only-v1",
        driverSource: "declared",
        issueCount: 0
      }
    ]);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});

test("fails rather than truncating a multibyte context beyond the byte cap", async () => {
  const fixture = await createFixture();
  try {
    const report = await inspectCourseAuthoringProject(fixture.slug, fixture.repoRoot);
    assert.equal(report.status, "pass");
    assert.ok(report.project);
    report.project.editableSources = [
      {
        kind: "file",
        repoRelative: `projects/course/workspace/${"é".repeat(MAX_PROJECT_CONTEXT_BYTES)}`,
        exists: true
      }
    ];
    assert.throws(() => renderProjectAuthoringContext(report), /UTF-8 bytes; limit is/);
  } finally {
    await rm(fixture.repoRoot, { recursive: true, force: true });
  }
});
