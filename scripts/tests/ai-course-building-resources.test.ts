import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { repoRoot } from "../lib/paths.js";
import type { ProjectManifest } from "../lib/types.js";

const slug = "ai-course-building-resources";
const projectDir = path.join(repoRoot, "projects", slug);
const sourceDir = path.join(repoRoot, "canvas code and references", "AICOURSEBUILDING");

const sourceFiles = [
  {
    sourceName: "DEANAIASSESSMENTPILLARS",
    resourceName: "dean-ai-assessment-pillars.html",
    title: "DEANAIASSESSMENTPILLARS",
    label: "Assessment Pillars",
    workspaceEdited: true
  },
  {
    sourceName: "JONAIRESOURCE",
    resourceName: "jon-ai-resource.html",
    title: "JONAIRESOURCE",
    label: "AI-Resources",
    workspaceEdited: false
  }
];

async function readUtf8(filePath: string) {
  return readFile(filePath, "utf8");
}

test("ai course building package preserves both source HTML pages behind one hub", async () => {
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const hubPath = path.join(projectDir, "workspace", "index.html");
  const manifest = JSON.parse(await readUtf8(manifestPath)) as ProjectManifest;
  const hub = await readUtf8(hubPath);

  assert.equal(manifest.slug, slug);
  assert.equal(manifest.migrationState, "migrated");
  assert.equal(manifest.projectType, "conversion");
  assert.deepEqual(manifest.preferredWorkflows, ["conversion"]);
  assert.equal(manifest.authoringStatus, "active");
  assert.equal(manifest.canonicalEntry, path.join(projectDir, "workspace", "index.html"));
  assert.deepEqual(manifest.exportTargets, [
    {
      target: "html",
      enabled: true,
      notes: "Primary teacher-facing meeting package as one standalone HTML file."
    }
  ]);

  assert.match(hub, /data-testid="resource-selector"/);
  assert.match(hub, /data-testid="resource-frame"/);
  assert.match(hub, /class="resource-switcher"/);
  assert.match(hub, /data-active-resource="assessment"/);
  assert.doesNotMatch(hub, /<h1>AI Course Building Resources<\/h1>/);

  for (const sourceFile of sourceFiles) {
    const sourcePath = path.join(sourceDir, sourceFile.sourceName);
    const workspaceResourcePath = path.join(projectDir, "workspace", "resources", sourceFile.resourceName);
    const rawResourcePath = path.join(projectDir, "raw", sourceFile.resourceName);
    const sourceHtml = await readUtf8(sourcePath);

    assert.match(sourceHtml, /<!DOCTYPE html>|<html[\s>]/i, `${sourceFile.sourceName} should be an HTML document`);
    assert.equal(await readUtf8(rawResourcePath), sourceHtml);
    if (!sourceFile.workspaceEdited) {
      assert.equal(await readUtf8(workspaceResourcePath), sourceHtml);
    } else {
      assert.notEqual(await readUtf8(workspaceResourcePath), sourceHtml);
    }
    assert.ok(
      manifest.canonicalSources?.includes(workspaceResourcePath),
      `expected ${sourceFile.resourceName} to be declared canonical`
    );
    assert.match(hub, new RegExp(sourceFile.resourceName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(hub, new RegExp(sourceFile.title));
    assert.match(hub, new RegExp(sourceFile.label));
  }
});

test("assessment pillars page has balanced assessment-weight sliders", async () => {
  const pagePath = path.join(projectDir, "workspace", "resources", "dean-ai-assessment-pillars.html");
  const html = await readUtf8(pagePath);

  assert.match(
    html,
    /Every major summative assessment is evaluated across three distinct buckets\. While the foundational model is 50\/25\/25, teachers use professional judgment to shift these weights based on course demands\. We do not change weights based on AI level, but rather on pedagogical intent\./
  );

  const pillarIcons = {
    product: "inventory_2",
    process: "call_merge",
    defence: "mic"
  };

  for (const [key, icon] of Object.entries(pillarIcons)) {
    assert.match(html, new RegExp(`id="${key}-weight"`));
    assert.match(html, new RegExp(`id="${key}-weight-label"`));
    assert.doesNotMatch(html, new RegExp(`id="${key}-weight-badge"`));
    assert.match(html, new RegExp(`oninput="updateAssessmentWeights\\('${key}'\\)"`));
    assert.match(html, new RegExp(`${key}-control`));
    assert.match(
      html,
      new RegExp(`<label for="${key}-weight" class="pillar-control weight-control ${key}-control">[\\s\\S]*<span class="material-symbols-outlined">${icon}</span>[\\s\\S]*<span>Weight</span>`)
    );
  }

  assert.doesNotMatch(html, /assessment-weight-meta/);
  assert.match(html, /pillar-control/);
  assert.doesNotMatch(html, /assessment-weight-panel/);
  assert.doesNotMatch(html, /weight-control-grid/);
  assert.doesNotMatch(html, /id="assessment-weight-total"/);
  assert.doesNotMatch(html, /<span class="material-symbols-outlined">tune<\/span>\s*<span>Weight<\/span>/);
  assert.match(html, /type="range"/);
  assert.match(html, /min="0"/);
  assert.match(html, /max="100"/);
  assert.match(html, /function updateAssessmentWeights\(activeKey\)/);
  assert.match(html, /const total = product \+ process \+ defence;/);
  assert.match(html, /const diff = 100 - total;/);
  assert.match(html, /sliders\[key\]\.value = weights\[key\];/);
  assert.match(html, /sliders\[key\]\.style\.setProperty\("--range-fill", `\$\{weights\[key\]\}%`\);/);
  assert.doesNotMatch(html, /badges\[key\]\.innerText/);
  assert.doesNotMatch(html, /totalLabel\.innerText = "100%";/);
});
