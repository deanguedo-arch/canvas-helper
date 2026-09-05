import assert from "node:assert/strict";
import { access, copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";
import sharp from "sharp";

import {
  BIOLOGY30_SOURCE_VISUAL_COUNT,
  BIOLOGY30_SOURCE_VISUAL_REPLACEMENTS,
  prepareBiology30UnitAPilotSourceVisuals
} from "../lib/biology30-unit-a/pilot-source-visuals.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const projectDir = path.join(repoRoot, "projects/biology30-unit-a-pilot");
const contractPath = path.join(projectDir, "meta/source-visual-integration.json");
const reportPath = path.join(projectDir, "meta/source-visual-resource-report.json");
const workspacePath = path.join(projectDir, "workspace/index.html");

async function exists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

test("source-visual contract and generated assets are exact, accessible, and release-bounded", async () => {
  const contract = JSON.parse(await readFile(contractPath, "utf8"));
  const report = JSON.parse(await readFile(reportPath, "utf8"));
  assert.equal(contract.project, "biology30-unit-a-pilot");
  assert.equal(contract.status, "blocked-preview-only");
  assert.equal(contract.visuals.length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal(new Set(contract.visuals.map((visual: { id: string }) => visual.id)).size, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.deepEqual(report.counts, { total: 9, pdfCrops: 3, powerpointMedia: 6, replacements: 6, supplemental: 3, releaseBlockers: 4 });
  assert.equal(report.assets.length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal(report.validation.replacementMappingVerified, true);
  assert.equal(report.validation.canonicalWorkspaceRewritten, false);
  assert.equal(report.validation.projectRemainsBlocked, true);
  assert.deepEqual(contract.releaseBlockers.map((blocker: { visualId: string }) => blocker.visualId), [
    "neuron-anatomy-source",
    "spinal-cord-cross-section-source",
    "reflex-arc-anatomy-source",
    "eye-anatomy-source"
  ]);
  for (const visual of contract.visuals) {
    assert.ok(visual.altText.trim(), visual.id);
    assert.ok(visual.longDescription.trim(), visual.id);
    assert.ok(visual.rightsStatus.trim(), visual.id);
    const target = path.join(projectDir, visual.outputPath);
    assert.equal(await exists(target), true, visual.id);
    const metadata = await sharp(target).metadata();
    assert.equal(metadata.format, "webp", visual.id);
    assert.ok((metadata.width ?? 0) >= 360, visual.id);
    assert.ok((metadata.height ?? 0) >= 260, visual.id);
    const expectedReplacement = BIOLOGY30_SOURCE_VISUAL_REPLACEMENTS[visual.id] ?? null;
    assert.equal(visual.displayRole, expectedReplacement ? "replacement" : "supplemental", visual.id);
    assert.equal(visual.replacesFigureSlot, expectedReplacement, visual.id);
  }
  assert.equal(contract.policy.duplicateNativeFiguresAreHidden, true);
  assert.equal(contract.policy.nonDuplicateNativeCourseFiguresRemain, true);
});

test("learner workspace replaces six redundant figures and retains three non-duplicated source additions", async () => {
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  assert.equal($("[data-source-visual]").length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal($("[data-source-visual] img.bio-source-figure__image").length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal($("[data-source-visual] [data-open-figure-dialog]").length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal($("[data-source-visual] [data-textbook-doc]").length, BIOLOGY30_SOURCE_VISUAL_COUNT);
  assert.equal($("[data-replaced-by-source-visual][hidden]").length, 6);
  for (const [visualId, figureSlot] of Object.entries(BIOLOGY30_SOURCE_VISUAL_REPLACEMENTS)) {
    assert.equal($(`[data-figure-slot="${figureSlot}"][data-replaced-by-source-visual="${visualId}"][hidden]`).length, 1, visualId);
    assert.equal($(`[data-source-visual="${visualId}"]:not([hidden])`).length, 1, visualId);
  }
  assert.equal($("[data-media-treatment]").length, 3);
  assert.equal($("[data-media-treatment='reviewed-generated-visual']").length, 2);
  assert.equal($("[data-media-treatment='corrected-source-informed-redraw']").length, 1);
  assert.equal($("[data-retired-media-treatment][hidden]").length, 1);
  assert.equal($("[data-figure-slot]:not([hidden])").length, 21);
  assert.equal($("img[src*='source-visuals']").toArray().every((node) => !/^https?:/.test($(node).attr("src") ?? "")), true);
  assert.equal($("img[src*='source-visuals']").toArray().every((node) => Boolean($(node).attr("alt")?.trim())), true);
  assert.doesNotMatch($("body").clone().find("script,style").remove().end().text(), /PowerPoint|release blocker|rights status|source hash/i);
});

test("source-visual preparation is idempotent for the real pilot", async () => {
  const result = await prepareBiology30UnitAPilotSourceVisuals({ repoRoot, project: "biology30-unit-a-pilot" });
  assert.equal(result.changed, false);
});

test("source-visual preparation replaces only a verified prior owned installation and restores it after failure", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-source-visual-upgrade-"));
  const fixtureProject = path.join(fixtureRoot, "projects/biology30-unit-a-pilot");
  const fixtureSources = path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources");
  try {
    await Promise.all([
      mkdir(path.join(fixtureProject, "workspace/assets/textbook"), { recursive: true }),
      mkdir(path.join(fixtureProject, "meta"), { recursive: true }),
      mkdir(fixtureSources, { recursive: true })
    ]);
    await Promise.all([
      copyFile(workspacePath, path.join(fixtureProject, "workspace/index.html")),
      copyFile(path.join(projectDir, "meta/project.json"), path.join(fixtureProject, "meta/project.json")),
      copyFile(contractPath, path.join(fixtureProject, "meta/source-visual-integration.json")),
      copyFile(path.join(projectDir, "workspace/assets/textbook/chapter-11.pdf"), path.join(fixtureProject, "workspace/assets/textbook/chapter-11.pdf")),
      copyFile(path.join(projectDir, "workspace/assets/textbook/chapter-13.pdf"), path.join(fixtureProject, "workspace/assets/textbook/chapter-13.pdf")),
      ...[
        "74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1.pptx",
        "4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea.pptx",
        "05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482.pptx"
      ].map((filename) => copyFile(
        path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources", filename),
        path.join(fixtureSources, filename)
      ))
    ]);
    const first = await prepareBiology30UnitAPilotSourceVisuals({ repoRoot: fixtureRoot });
    assert.equal(first.changed, true);
    const fixtureReport = path.join(fixtureProject, "meta/source-visual-resource-report.json");
    const reportBefore = await readFile(fixtureReport);
    const fixtureContractPath = path.join(fixtureProject, "meta/source-visual-integration.json");
    const fixtureContract = JSON.parse(await readFile(fixtureContractPath, "utf8"));
    fixtureContract.visuals[0].outputPath = "workspace/assets/source-visuals/neuron-anatomy-source-revised.webp";
    await writeFile(fixtureContractPath, `${JSON.stringify(fixtureContract, null, 2)}\n`, "utf8");
    await assert.rejects(
      () => prepareBiology30UnitAPilotSourceVisuals({ repoRoot: fixtureRoot, failAfterPromotion: 1 }),
      /Simulated source-visual promotion failure/
    );
    assert.deepEqual(await readFile(fixtureReport), reportBefore);
    assert.equal(await exists(path.join(fixtureProject, "workspace/assets/source-visuals/neuron-anatomy-source.webp")), true);
    assert.equal(await exists(path.join(fixtureProject, "workspace/assets/source-visuals/neuron-anatomy-source-revised.webp")), false);
    const upgraded = await prepareBiology30UnitAPilotSourceVisuals({ repoRoot: fixtureRoot });
    assert.equal(upgraded.changed, true);
    assert.equal(await exists(path.join(fixtureProject, "workspace/assets/source-visuals/neuron-anatomy-source.webp")), false);
    assert.equal(await exists(path.join(fixtureProject, "workspace/assets/source-visuals/neuron-anatomy-source-revised.webp")), true);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});

test("source-visual preparation rolls back a partial promotion", async () => {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-source-visuals-"));
  const fixtureProject = path.join(fixtureRoot, "projects/biology30-unit-a-pilot");
  try {
    await Promise.all([
      mkdir(path.join(fixtureProject, "workspace/assets/textbook"), { recursive: true }),
      mkdir(path.join(fixtureProject, "meta"), { recursive: true }),
      mkdir(path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources"), { recursive: true })
    ]);
    await Promise.all([
      copyFile(workspacePath, path.join(fixtureProject, "workspace/index.html")),
      copyFile(path.join(projectDir, "meta/project.json"), path.join(fixtureProject, "meta/project.json")),
      copyFile(contractPath, path.join(fixtureProject, "meta/source-visual-integration.json")),
      copyFile(path.join(projectDir, "workspace/assets/textbook/chapter-11.pdf"), path.join(fixtureProject, "workspace/assets/textbook/chapter-11.pdf")),
      copyFile(path.join(projectDir, "workspace/assets/textbook/chapter-13.pdf"), path.join(fixtureProject, "workspace/assets/textbook/chapter-13.pdf")),
      copyFile(
        path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources/74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1.pptx"),
        path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources/74630659f9860c65b17356513c37f954d4df7b2a55742f1d535f5041e40abfb1.pptx")
      ),
      copyFile(
        path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources/4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea.pptx"),
        path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources/4162d8b6bc3ebe94a11b53ed2694932adccf41622a4473e785a46d57cd2184ea.pptx")
      ),
      copyFile(
        path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources/05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482.pptx"),
        path.join(fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources/05947fe3a4712c7465e9bb370acbeef6897651eae7cac40c2af54d4839bcc482.pptx")
      )
    ]);
    await assert.rejects(
      () => prepareBiology30UnitAPilotSourceVisuals({ repoRoot: fixtureRoot, project: "biology30-unit-a-pilot", failAfterPromotion: 1 }),
      /Simulated source-visual promotion failure/
    );
    assert.equal(await exists(path.join(fixtureProject, "workspace/assets/source-visuals")), false);
    assert.equal(await exists(path.join(fixtureProject, "meta/source-visual-resource-report.json")), false);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
