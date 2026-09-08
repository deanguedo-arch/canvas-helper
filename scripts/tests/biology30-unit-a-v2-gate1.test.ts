import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, lstat, mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { load as loadHtml } from "cheerio";

import { buildBiology30UnitAGate1, buildWorstCaseBiologyState } from "../lib/biology30-unit-a/v2/build.js";
import { renderBiology30UnitAGate1 } from "../lib/biology30-unit-a/v2/render.js";

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const resourceDir = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/v2");
const pilotSlugs = [
  "biology30-unit-a-class-2026-faithful",
  "biology30-unit-a-class-2026-optimized",
  "biology30-unit-a-system-2020-faithful",
  "biology30-unit-a-system-2020-optimized",
  "biology30-unit-a-synthesis"
];

async function exists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function hash(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

async function createGate1Fixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-gate1-"));
  const fixtureFamily = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot");
  await mkdir(fixtureFamily, { recursive: true });
  await cp(resourceDir, path.join(fixtureFamily, "v2"), { recursive: true });
  await cp(
    path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/resource-manifest.json"),
    path.join(fixtureFamily, "resource-manifest.json")
  );
  const resourceManifest = JSON.parse(await readFile(path.join(fixtureFamily, "resource-manifest.json"), "utf8")) as {
    resources: Array<{ path: string }>;
  };
  for (const resource of resourceManifest.resources) {
    const destination = path.join(fixtureRoot, resource.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await symlink(path.join(repoRoot, resource.path), destination);
  }
  await mkdir(path.join(fixtureRoot, "projects"), { recursive: true });
  for (const slug of pilotSlugs) {
    await symlink(path.join(repoRoot, "projects", slug), path.join(fixtureRoot, "projects", slug));
  }
  await cp(path.join(repoRoot, "projects/biology30-unit-a"), path.join(fixtureRoot, "projects/biology30-unit-a"), { recursive: true });
  // The real project has advanced to an explicitly approved Gate 1 and a Gate 2
  // candidate. Historical Gate 1 transaction tests need the same blocked project
  // boundary but no accepted Gate 1 review record.
  await rm(path.join(fixtureRoot, "projects/biology30-unit-a/meta/gate-1-review.json"), { force: true });
  return fixtureRoot;
}

test("Gate 1 renderer is native, self-contained, semantic, and scientifically structured", async () => {
  const rendered = await renderBiology30UnitAGate1(resourceDir);
  const $ = loadHtml(rendered.html);
  assert.deepEqual(rendered.learnerRouteIds, [
    "overview", "lessons", "lesson-04", "lesson-15", "model-lab", "investigation-notebook", "practice-hub"
  ]);
  for (const routeId of rendered.learnerRouteIds) assert.equal($(`#${routeId}`).find("h1").length, 1, routeId);
  assert.equal($("iframe, .material-symbols-outlined, [data-canvas-helper-edit-key]").length, 0);
  assert.equal(
    $("[src],[href]").toArray().filter((element) => /^https?:/i.test($(element).attr("src") || $(element).attr("href") || "")).length,
    0
  );
  assert.doesNotMatch($.root().text(), /slide viewer|primarily visual|coming soon|proposal-only|build hash/i);
  assert.match(rendered.html, /API_1484_11/);
  assert.match(rendered.html, /cmi\.suspend_data/);
  assert.match(rendered.html, /BIO_STATE_LIMIT = 48000/);
  assert.match(rendered.html, /@font-face/);
  assert.match(rendered.html, /prefers-reduced-motion/);
  assert.match(rendered.html, /@media print/);
  assert.deepEqual(rendered.figureIds, ["resting-membrane", "action-potential-graph", "blood-glucose-loop"]);
  assert.equal(rendered.interactionIds.length, 2);
  assert.equal(rendered.practiceIds.length, 6);
  assert.equal(rendered.artifactIds.length, 2);
  for (const script of $("script").toArray()) assert.doesNotThrow(() => new Function($(script).html() || ""));
});

test("Gate 1 source fragments, figures, practice, fonts, and state budget pass their production constraints", async () => {
  for (const lessonId of ["lesson-04", "lesson-15"]) {
    const fragment = await readFile(path.join(resourceDir, "content/lessons", `${lessonId}.html`), "utf8");
    const $ = loadHtml(fragment);
    $("script,style,svg").remove();
    const words = $.root().text().replace(/\s+/g, " ").trim().split(/\s+/).length;
    assert.ok(words >= 900 && words <= 1600, `${lessonId} has ${words} words`);
    $("p").each((_index, element) => {
      const paragraphWords = $(element).text().replace(/\s+/g, " ").trim().split(/\s+/).filter(Boolean).length;
      assert.ok(paragraphWords <= 120, `${lessonId} paragraph has ${paragraphWords} words`);
    });
  }
  for (const figure of ["resting-membrane", "action-potential-graph", "blood-glucose-loop"]) {
    const svg = await readFile(path.join(resourceDir, "figures", `${figure}.svg`), "utf8");
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.match(svg, /role="img"/);
    assert.doesNotMatch(svg.replace("http://www.w3.org/2000/svg", ""), /<image\b|https?:\/\//);
  }
  const glucoseLoop = await readFile(path.join(resourceDir, "figures/blood-glucose-loop.svg"), "utf8");
  const $glucoseLoop = loadHtml(glucoseLoop, { xmlMode: true });
  assert.match(glucoseLoop, /Example: after a meal, insulin-linked responses/);
  assert.equal($glucoseLoop("marker#bg-arrow").attr("markerUnits"), "userSpaceOnUse");
  assert.equal($glucoseLoop("circle.bg-step-node--high, circle.bg-step-node--low").length, 4);
  assert.ok(
    $glucoseLoop("path.bg-arrow").toArray().every((element) => !/M(?:316|668) (?:70|554)H/.test($glucoseLoop(element).attr("d") || "")),
    "flow arrows must not run through the numbered step markers"
  );
  const activities = JSON.parse(await readFile(path.join(resourceDir, "activities/gate-1-activities.json"), "utf8")) as {
    practiceItems: Array<{
      id: string;
      outcomeIds: string[];
      sourceRefIds: string[];
      cognitiveLevel: string;
      choices: Record<string, string>;
      answerKey: string;
      rationale: string;
      targetedFeedback: Record<string, string>;
    }>;
  };
  assert.equal(activities.practiceItems.length, 6);
  assert.equal(new Set(activities.practiceItems.map((item) => item.id)).size, 6);
  for (const item of activities.practiceItems) {
    assert.ok(item.outcomeIds.length && item.sourceRefIds.length && item.rationale.length > 20);
    assert.ok(["remember-understand", "apply", "higher-mental-activity"].includes(item.cognitiveLevel));
    assert.ok(Object.hasOwn(item.choices, item.answerKey));
    assert.equal(Object.keys(item.targetedFeedback).length, Object.keys(item.choices).length - 1);
  }
  const dataset = JSON.parse(await readFile(path.join(resourceDir, "datasets/lesson-15-synthetic.json"), "utf8")) as {
    dataStatus: string;
    diagnosticUse: string;
  };
  assert.match(JSON.stringify(dataset), /synthetic instructional data/i);
  assert.match(JSON.stringify(dataset), /not diagnostic/i);
  const fontManifest = JSON.parse(await readFile(path.join(resourceDir, "assets/font-manifest.json"), "utf8")) as {
    fonts: Array<{ file: string; sha256: string; licenseFile: string }>;
  };
  for (const font of fontManifest.fonts) {
    assert.equal(hash(await readFile(path.join(resourceDir, "assets", font.file))), font.sha256);
    assert.match(await readFile(path.join(resourceDir, "assets", font.licenseFile), "utf8"), /SIL OPEN FONT LICENSE/i);
  }
  const worstCaseCharacters = JSON.stringify(buildWorstCaseBiologyState()).length;
  assert.ok(worstCaseCharacters < 48000, `worst case is ${worstCaseCharacters}`);
  assert.ok(48000 - worstCaseCharacters >= 10000, `persistence headroom is only ${48000 - worstCaseCharacters}`);
});

test("Gate 1 builder writes one blocked exact-hash candidate transactionally", async (context) => {
  const fixtureRoot = await createGate1Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const result = await buildBiology30UnitAGate1({ repoRoot: fixtureRoot, project: "biology30-unit-a", strict: true });
  const build = JSON.parse(await readFile(path.join(result.projectDir, "meta/gate-1-build.json"), "utf8")) as {
    buildSha256: string;
    status: string;
    learnerRoutes: string[];
  };
  const review = JSON.parse(await readFile(path.join(result.projectDir, "meta/gate-1-review.json"), "utf8")) as {
    buildSha256: string;
    status: string;
    decision: unknown;
  };
  const manifest = JSON.parse(await readFile(path.join(result.projectDir, "meta/project.json"), "utf8")) as {
    authoringStatus: string;
    authoring: { driverId: string; studioEditing: { enabled: boolean } };
    exportTargets: Array<{ enabled: boolean }>;
  };
  assert.equal(build.buildSha256, result.buildSha256);
  assert.equal(build.status, "blocked-awaiting-user");
  assert.equal(build.learnerRoutes.length, 7);
  assert.equal(review.buildSha256, result.buildSha256);
  assert.equal(review.status, "awaiting-user");
  assert.equal(review.decision, null);
  assert.equal(manifest.authoringStatus, "blocked");
  assert.equal(manifest.authoring.driverId, "proposal-only-v1");
  assert.equal(manifest.authoring.studioEditing.enabled, false);
  assert.ok(manifest.exportTargets.every((target) => target.enabled === false));
  assert.equal((await readdir(path.join(fixtureRoot, "projects"))).some((entry) => entry.startsWith(".biology30-unit-a-gate1-")), false);
});

test("Gate 1 validation failure preserves the previous candidate and removes staging", async (context) => {
  const fixtureRoot = await createGate1Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const workspacePath = path.join(fixtureRoot, "projects/biology30-unit-a/workspace/index.html");
  const before = await readFile(workspacePath);
  await assert.rejects(
    buildBiology30UnitAGate1({
      repoRoot: fixtureRoot,
      project: "biology30-unit-a",
      strict: true,
      testHooks: {
        afterStageWrite: async (stageWorkspaceDir) => {
          const indexPath = path.join(stageWorkspaceDir, "index.html");
          await writeFile(indexPath, `${await readFile(indexPath, "utf8")}<p>Coming soon</p>`, "utf8");
        }
      }
    }),
    /placeholder language/
  );
  assert.deepEqual(await readFile(workspacePath), before);
  assert.equal((await readdir(path.join(fixtureRoot, "projects"))).some((entry) => entry.startsWith(".biology30-unit-a-gate1-")), false);
});

test("Gate 1 promotion failure restores every replaced path", async (context) => {
  const fixtureRoot = await createGate1Fixture();
  context.after(() => rm(fixtureRoot, { recursive: true, force: true }));
  const workspacePath = path.join(fixtureRoot, "projects/biology30-unit-a/workspace/index.html");
  const projectPath = path.join(fixtureRoot, "projects/biology30-unit-a/meta/project.json");
  const candidatePath = path.join(fixtureRoot, "projects/biology30-unit-a/meta/production-candidate.json");
  const before = await Promise.all([readFile(workspacePath), readFile(projectPath), readFile(candidatePath)]);
  await assert.rejects(
    buildBiology30UnitAGate1({
      repoRoot: fixtureRoot,
      project: "biology30-unit-a",
      strict: true,
      testHooks: {
        beforePromote: (_targetPath, index) => {
          if (index === 2) throw new Error("simulated Gate 1 promotion failure");
        }
      }
    }),
    /simulated Gate 1 promotion failure/
  );
  const after = await Promise.all([readFile(workspacePath), readFile(projectPath), readFile(candidatePath)]);
  assert.deepEqual(after, before);
  assert.equal((await readdir(path.join(fixtureRoot, "projects"))).some((entry) => entry.startsWith(".biology30-unit-a-gate1-")), false);
});
