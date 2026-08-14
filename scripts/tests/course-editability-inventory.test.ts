import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { isProjectLearnerSurfacesV1 } from "../../app/shared/course-editability.ts";
import { createCodexStudioCourse } from "../lib/codex-course.ts";
import {
  extractStructurallyDeclaredLearnerRouteIds,
  hasUnsupportedLearnerStateMechanisms,
  isDeclaredFactoryActivityRoute,
  resolveLearnerSurfaceInventory
} from "../lib/course-editability/inventory.ts";
import { RenderedCourseEditabilityCollector } from "../lib/course-editability/rendered.ts";
import { scoreRenderedSurface } from "../lib/course-editability/scoring.ts";
import {
  listCourseEditabilityProjectSlugsReadOnly,
  openCourseEditabilityReadOnlyProject
} from "../lib/course-editability/read-only-project.ts";
import type { ProjectManifest } from "../lib/types.ts";

async function fixtureRepo() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-editability-inventory-"));
  await mkdir(path.join(repoRoot, "projects"), { recursive: true });
  return {
    repoRoot,
    async cleanup() { await rm(repoRoot, { recursive: true, force: true }); }
  };
}

async function writeProject(input: {
  repoRoot: string;
  slug: string;
  driverId: NonNullable<ProjectManifest["authoring"]>["driverId"];
  learnerSurfaces?: NonNullable<ProjectManifest["authoring"]>["learnerSurfaces"];
  html?: string;
}) {
  const projectRoot = path.join(input.repoRoot, "projects", input.slug);
  await Promise.all([
    mkdir(path.join(projectRoot, "workspace"), { recursive: true }),
    mkdir(path.join(projectRoot, "meta"), { recursive: true })
  ]);
  await writeFile(
    path.join(projectRoot, "workspace", "index.html"),
    input.html ?? "<!doctype html><main><h1>Course</h1></main>",
    "utf8"
  );
  const manifest: ProjectManifest = {
    id: input.slug,
    slug: input.slug,
    title: "Course",
    sourcePath: `projects/${input.slug}/workspace/index.html`,
    inputKind: "html",
    brightspaceTarget: "course-page",
    previewModes: ["workspace"],
    workspaceEntrypoint: "workspace/index.html",
    rawEntrypoint: "raw/original.html",
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: "2026-08-14T00:00:00.000Z",
    migrationState: "migrated",
    projectType: "generated-course",
    preferredWorkflows: ["generated-course"],
    canonicalEntry: `projects/${input.slug}/workspace/index.html`,
    canonicalSources: [`projects/${input.slug}/workspace/index.html`],
    authoring: {
      driverId: input.driverId,
      studioEditing: { enabled: true },
      ...(input.learnerSurfaces ? { learnerSurfaces: input.learnerSurfaces } : {})
    },
    authoringStatus: "active",
    exportTargets: [{ target: "html", enabled: true }],
    createdAt: "2026-08-14T00:00:00.000Z",
    updatedAt: "2026-08-14T00:00:00.000Z"
  };
  await writeFile(path.join(projectRoot, "meta", "project.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return projectRoot;
}

test("learner-surface declarations reject external routes, duplicate path syntax, and empty inventories", () => {
  assert.equal(isProjectLearnerSurfacesV1({
    schemaVersion: 1,
    mode: "static-pages-complete",
    pages: [{ htmlPath: "index.html", route: "" }]
  }), true);
  assert.equal(isProjectLearnerSurfacesV1({
    schemaVersion: 1,
    mode: "declared-routes-and-states",
    surfaces: [{ htmlPath: "index.html", route: "#lesson-1", stateKey: "lesson-1" }]
  }), true);
  assert.equal(isProjectLearnerSurfacesV1({
    schemaVersion: 1,
    mode: "static-pages-complete",
    pages: [{ htmlPath: "../index.html", route: "https://example.com" }]
  }), false);
  assert.equal(isProjectLearnerSurfacesV1({ schemaVersion: 1, mode: "static-pages-complete", pages: [] }), false);
});

test("Direct inventory is explicit, deterministic, canonical, and read-only", async () => {
  const fixture = await fixtureRepo();
  try {
    const projectRoot = await writeProject({
      repoRoot: fixture.repoRoot,
      slug: "direct-course",
      driverId: "direct-workspace-v1",
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "declared-routes-and-states",
        surfaces: [
          { htmlPath: "index.html", route: "#lesson-2", stateKey: null },
          { htmlPath: "index.html", route: "#lesson-1", stateKey: null }
        ]
      }
    });
    const before = await readFile(path.join(projectRoot, "meta", "project.json"));
    const first = await resolveLearnerSurfaceInventory("direct-course", fixture.repoRoot);
    const second = await resolveLearnerSurfaceInventory("direct-course", fixture.repoRoot);
    assert.equal(first.complete, true);
    assert.equal(first.adapter, "direct");
    assert.deepEqual(first, second);
    assert.deepEqual(first.surfaces.map((surface) => surface.route), ["#lesson-1", "#lesson-2"]);
    assert.ok(first.surfaces.every((surface) => /^ls1:[a-f0-9]{24}$/.test(surface.surfaceId)));
    assert.deepEqual(await readFile(path.join(projectRoot, "meta", "project.json")), before);

    const opened = await openCourseEditabilityReadOnlyProject("direct-course", fixture.repoRoot);
    assert.match(await opened.readWorkspaceText("index.html"), /Course/);
    assert.deepEqual(await listCourseEditabilityProjectSlugsReadOnly(fixture.repoRoot), ["direct-course"]);
  } finally {
    await fixture.cleanup();
  }
});

test("missing declarations and non-canonical pages cannot produce coverage inventories", async () => {
  const fixture = await fixtureRepo();
  try {
    await writeProject({ repoRoot: fixture.repoRoot, slug: "undeclared", driverId: "direct-workspace-v1" });
    const undeclared = await resolveLearnerSurfaceInventory("undeclared", fixture.repoRoot);
    assert.equal(undeclared.complete, false);
    assert.equal(undeclared.errorCode, "route-declaration-missing");

    await writeProject({
      repoRoot: fixture.repoRoot,
      slug: "not-canonical",
      driverId: "direct-workspace-v1",
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "static-pages-complete",
        pages: [{ htmlPath: "other.html", route: "" }]
      }
    });
    const nonCanonical = await resolveLearnerSurfaceInventory("not-canonical", fixture.repoRoot);
    assert.equal(nonCanonical.complete, false);
    assert.equal(nonCanonical.errorCode, "declared-page-missing");
  } finally {
    await fixture.cleanup();
  }
});

test("read-only inventory never reconstructs a missing project from processed snapshots", async () => {
  const fixture = await fixtureRepo();
  try {
    const processed = path.join(fixture.repoRoot, "projects", "processed", "recoverable", "source");
    await mkdir(processed, { recursive: true });
    await writeFile(path.join(processed, "index.html"), "<main>Processed copy</main>", "utf8");
    const inventory = await resolveLearnerSurfaceInventory("recoverable", fixture.repoRoot);
    assert.equal(inventory.complete, false);
    assert.equal(inventory.errorCode, "manifest-missing");
    await assert.rejects(stat(path.join(fixture.repoRoot, "projects", "recoverable")));
  } finally {
    await fixture.cleanup();
  }
});

test("Social adapter inventory accepts only its explicit generated route declaration", async () => {
  const fixture = await fixtureRepo();
  try {
    const html = `<!doctype html>
      <a data-page-target="overview" href="#overview">Overview</a>
      <a data-page-target="lesson-1" href="#lesson-1">Lesson</a>
      <section id="overview" class="course-page">Overview</section>
      <section id="lesson-1" class="course-page" hidden>Lesson</section>
      <script>const pageIds = ["overview", "lesson-1"];</script>`;
    const projectRoot = await writeProject({
      repoRoot: fixture.repoRoot,
      slug: "social-course",
      driverId: "social-related-issues-v1",
      html
    });
    await writeFile(path.join(projectRoot, "meta", "social-build.json"), `${JSON.stringify({
      schemaVersion: 1,
      projectSlug: "social-course",
      builder: "scripts/build-social30-related-issues.ts"
    })}\n`, "utf8");
    const inventory = await resolveLearnerSurfaceInventory("social-course", fixture.repoRoot);
    assert.equal(inventory.complete, true);
    assert.equal(inventory.adapter, "social-related-issues");
    assert.deepEqual(inventory.surfaces.map((surface) => surface.route), ["#lesson-1", "#overview"]);

    await writeFile(
      path.join(projectRoot, "workspace", "index.html"),
      html.replace('["overview", "lesson-1"]', '["overview"]'),
      "utf8"
    );
    const invalid = await resolveLearnerSurfaceInventory("social-course", fixture.repoRoot);
    assert.equal(invalid.complete, false);
    assert.equal(invalid.errorCode, "route-declaration-missing");
  } finally {
    await fixture.cleanup();
  }
});

test("legacy route inference requires an exact structural page and navigation boundary", () => {
  const complete = `<!doctype html>
    <nav><button data-page-target="overview">Overview</button><button data-page-target="lesson-1">Lesson</button></nav>
    <section id="overview" class="course-page">Overview</section>
    <section id="lesson-1" class="course-page" hidden>Lesson</section>`;
  assert.deepEqual(extractStructurallyDeclaredLearnerRouteIds(complete), ["overview", "lesson-1"]);
  assert.equal(
    extractStructurallyDeclaredLearnerRouteIds(complete.replace("</nav>", '<button data-page-target="missing">Missing</button></nav>')),
    null
  );
  assert.equal(
    extractStructurallyDeclaredLearnerRouteIds(complete.replace("</section>", '</section><section id="lesson-2" class="course-page">Two</section>')),
    null
  );
});

test("legacy route onboarding distinguishes navigation chrome from unsupported learner states", () => {
  assert.equal(hasUnsupportedLearnerStateMechanisms(
    '<aside><button aria-controls="lesson-nav">Lessons</button><div id="lesson-nav"></div></aside>'
  ), false);
  assert.equal(hasUnsupportedLearnerStateMechanisms(
    '<main><button role="tab" data-workshop-tab="evidence">Evidence</button></main>'
  ), true);
  assert.equal(hasUnsupportedLearnerStateMechanisms(
    '<main><button aria-controls="answer-panel">Answer</button><div id="answer-panel"></div></main>'
  ), true);
});

test("English activity profiles accept declared per-text variants without accepting unrelated routes", () => {
  assert.equal(isDeclaredFactoryActivityRoute("critical-essay", [
    "critical-essay-lord-of-the-flies",
    "critical-essay-the-book-thief"
  ]), true);
  assert.equal(isDeclaredFactoryActivityRoute("critical-essay", ["critical-thinking"]), false);
});

test("native details disclosures are measured through an explicit bounded surface state", async () => {
  const fixture = await fixtureRepo();
  let collector: RenderedCourseEditabilityCollector | null = null;
  try {
    await writeProject({
      repoRoot: fixture.repoRoot,
      slug: "details-course",
      driverId: "direct-workspace-v1",
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "declared-routes-and-states",
        surfaces: [{ htmlPath: "index.html", route: "", stateKey: "native-details-open" }]
      },
      html: '<!doctype html><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter"><main><h1>Course</h1><details><summary>Read more</summary><p>Required hidden explanation.</p></details><iframe src="https://example.com/embed" title="External learner media"></iframe></main>'
    });
    const inventory = await resolveLearnerSurfaceInventory("details-course", fixture.repoRoot);
    assert.equal(inventory.complete, true);
    collector = await RenderedCourseEditabilityCollector.create(fixture.repoRoot, "2026-08-14T00:00:00.000Z");
    const collected = await collector.collect(inventory.surfaces[0], inventory.surfaces);
    assert.equal(collected.complete, true, collected.reasonCode ?? "native disclosure state was not measured");
    assert.ok(collected.candidates.some((entry) => entry.normalizedTextCodeUnits >= "Required hidden explanation.".length));
    assert.deepEqual(collected.diagnosticReasonCodes, ["external-network-attempt"]);
  } finally {
    await collector?.close();
    await fixture.cleanup();
  }
});

test("rendered census reconciles a fresh Studio-aware course through production Resolve without writes", async () => {
  const fixture = await fixtureRepo();
  let collector: RenderedCourseEditabilityCollector | null = null;
  try {
    await writeFile(path.join(fixture.repoRoot, "package.json"), `${JSON.stringify({
      private: true,
      scripts: {
        "course:doctor": "node -e \"process.exit(0)\" --",
        verify: "node -e \"process.exit(0)\" --"
      }
    })}\n`, "utf8");
    const created = await createCodexStudioCourse({
      repoRoot: fixture.repoRoot,
      slug: "fresh-editable-course",
      title: "Fresh Editable Course",
      courseCode: "FEC 10",
      summary: "Learners use evidence to make and explain a practical decision.",
      now: "2026-08-14T00:00:00.000Z"
    });
    const before = await readFile(created.workspaceEntry);
    const inventory = await resolveLearnerSurfaceInventory("fresh-editable-course", fixture.repoRoot);
    assert.equal(inventory.complete, true);
    collector = await RenderedCourseEditabilityCollector.create(fixture.repoRoot, "2026-08-14T00:00:00.000Z");
    const collection = await collector.collect(inventory.surfaces[0]);
    assert.equal(collection.complete, true, collection.reasonCode ?? "render collection incomplete");
    const report = scoreRenderedSurface(collection);
    assert.equal(report.status, "complete");
    assert.ok((report.blockCoverage?.denominator ?? 0) >= 10);
    assert.ok((report.blockCoverage?.numerator ?? 0) > 0);
    assert.ok((report.teacherTextCoverage?.denominator ?? 0) > 0);
    assert.ok((report.candidatesByKind.heading?.total ?? 0) > 0);
    assert.ok(
      report.blockCoverage && report.blockCoverage.numerator / report.blockCoverage.denominator >= 0.9,
      `Fresh-course block coverage was ${report.blockCoverage?.numerator ?? 0}/${report.blockCoverage?.denominator ?? 0}.`
    );
    assert.ok(
      report.teacherTextCoverage && report.teacherTextCoverage.numerator / report.teacherTextCoverage.denominator >= 0.9,
      `Fresh-course teacher-text coverage was ${report.teacherTextCoverage?.numerator ?? 0}/${report.teacherTextCoverage?.denominator ?? 0}.`
    );
    for (const kind of ["course-name", "heading", "prose", "list-item", "link-label", "image", "caption"] as const) {
      const coverage = report.candidatesByKind[kind];
      assert.ok(coverage, `Fresh-course fixture did not exercise promised ${kind} content.`);
      assert.ok(
        coverage.supported / coverage.total >= 0.8,
        `Fresh-course ${kind} coverage was ${coverage.supported}/${coverage.total}.`
      );
    }
    assert.deepEqual(report.capabilitiesByKind["rename-synchronization"], { supported: 1, total: 1 });
    assert.deepEqual(report.capabilitiesByKind["image-source"], { supported: 1, total: 1 });
    assert.deepEqual(report.capabilitiesByKind["image-alt"], { supported: 1, total: 1 });
    assert.equal(report.reasons["intentional-annotation-only"], 1);
    assert.deepEqual(await readFile(created.workspaceEntry), before);
  } finally {
    await collector?.close();
    await fixture.cleanup();
  }
});

test("rendered census invalidates a static inventory when the learner page exposes undeclared routes or states", async () => {
  const fixture = await fixtureRepo();
  let collector: RenderedCourseEditabilityCollector | null = null;
  try {
    await writeProject({
      repoRoot: fixture.repoRoot,
      slug: "undeclared-runtime-surface",
      driverId: "direct-workspace-v1",
      learnerSurfaces: {
        schemaVersion: 1,
        mode: "static-pages-complete",
        pages: [{ htmlPath: "index.html", route: "" }]
      },
      html: `<!doctype html>
        <main>
          <h1>Course overview</h1>
          <a href="#lesson-2">Open lesson two</a>
          <section id="lesson-2" class="course-page" hidden>
            <h2>Lesson two</h2>
          </section>
          <button aria-expanded="false" aria-controls="answer-panel">Show answer</button>
          <div id="answer-panel" hidden>Answer</div>
        </main>`
    });
    const inventory = await resolveLearnerSurfaceInventory("undeclared-runtime-surface", fixture.repoRoot);
    assert.equal(inventory.complete, true);
    collector = await RenderedCourseEditabilityCollector.create(fixture.repoRoot, "2026-08-14T00:00:00.000Z");
    const collection = await collector.collect(inventory.surfaces[0], inventory.surfaces);
    assert.equal(collection.complete, false);
    assert.equal(collection.reasonCode, "surface-inventory-incomplete");
    const report = scoreRenderedSurface(collection);
    assert.equal(report.status, "incomplete");
    assert.equal(report.blockCoverage, null);

    await writeFile(
      path.join(fixture.repoRoot, "projects", "undeclared-runtime-surface", "workspace", "index.html"),
      `<!doctype html><nav><button aria-expanded="false" aria-controls="course-sidebar">Menu</button></nav>
        <aside id="course-sidebar"><h2>Navigation</h2></aside><main><h1>Course</h1><a href="#marker">Jump down</a><span id="marker" aria-hidden="true"></span></main>`,
      "utf8"
    );
    const navigationCollection = await collector.collect(inventory.surfaces[0], inventory.surfaces);
    assert.equal(navigationCollection.complete, true, navigationCollection.reasonCode ?? "navigation chrome was treated as learner state");

    await writeFile(
      path.join(fixture.repoRoot, "projects", "undeclared-runtime-surface", "workspace", "index.html"),
      '<!doctype html><link rel="stylesheet" href="https://example.com/runtime.css"><main><h1>Course</h1></main>',
      "utf8"
    );
    const executableNetworkCollection = await collector.collect(inventory.surfaces[0], inventory.surfaces);
    assert.equal(executableNetworkCollection.complete, false);
    assert.equal(executableNetworkCollection.reasonCode, "external-network-attempt");

    await writeFile(
      path.join(fixture.repoRoot, "projects", "undeclared-runtime-surface", "workspace", "index.html"),
      `<!doctype html><main><h1>Course</h1></main><script>try { localStorage.setItem("progress", "1"); } catch {}</script>`,
      "utf8"
    );
    const storageCollection = await collector.collect(inventory.surfaces[0], inventory.surfaces);
    assert.equal(storageCollection.complete, false);
    assert.equal(storageCollection.reasonCode, "storage-write-attempt");
  } finally {
    await collector?.close();
    await fixture.cleanup();
  }
});
