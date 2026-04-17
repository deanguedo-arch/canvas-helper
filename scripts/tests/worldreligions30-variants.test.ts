import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { fileExists } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import { listProjectSlugs, loadProjectManifest } from "../lib/projects.js";

test("World Religions Studio variants are both available as generated-course projects", async () => {
  const slugs = await listProjectSlugs();

  assert.ok(slugs.includes("worldreligions30-option1"));
  assert.ok(slugs.includes("worldreligions30-option2"));

  const [option1, option2] = await Promise.all([
    loadProjectManifest("worldreligions30-option1"),
    loadProjectManifest("worldreligions30-option2")
  ]);

  for (const manifest of [option1, option2]) {
    assert.equal(manifest.projectType, "generated-course");
    assert.ok(manifest.preferredWorkflows?.includes("generated-course"));
    assert.equal(
      await fileExists(getProjectPaths(manifest.slug).workspaceEntrypoint),
      true,
      `expected workspace entrypoint for ${manifest.slug}`
    );
  }

  const [option1Html, option2Html] = await Promise.all([
    readFile(getProjectPaths("worldreligions30-option1").workspaceEntrypoint, "utf8"),
    readFile(getProjectPaths("worldreligions30-option2").workspaceEntrypoint, "utf8")
  ]);

  assert.match(option1Html, /data-shell-variant="option-1"/);
  assert.match(option2Html, /data-shell-variant="option-2"/);
});

test("World Religions option1 shell keeps the hero home-only and exposes an integrated progress bar", async () => {
  const option1Paths = getProjectPaths("worldreligions30-option1");
  const [html, css, js] = await Promise.all([
    readFile(option1Paths.workspaceEntrypoint, "utf8"),
    readFile(option1Paths.workspaceDir + "/styles.css", "utf8"),
    readFile(option1Paths.workspaceDir + "/main.js", "utf8")
  ]);

  assert.match(html, /id="progress-track"/);
  assert.match(html, /id="progress-fill"/);
  assert.match(html, /class="progress-hero-top"/);
  assert.match(html, /id="sidebar-progress-track"/);
  assert.match(html, /id="sidebar-progress-fill"/);
  assert.match(css, /\.menu-toggle\s*\{[\s\S]*flex-direction:\s*column;/);
  assert.match(css, /\.sidebar-progress-track\s*\{/);
  assert.match(css, /\.sidebar-progress-fill\s*\{/);
  assert.match(css, /\.progress-shell\s*\{[\s\S]*display:\s*none;/);
  assert.match(css, /body\[data-section="home"\]\[data-tab="chapters"\]\[data-view="overview"\]\s+\.progress-shell\s*\{[\s\S]*display:\s*block;/);
  assert.match(css, /body\[data-section="home"\]\[data-tab="chapters"\]\[data-view="overview"\]\s+\.progress-shell\.is-hero\s+\.progress-hero-top\s*\{/);
  assert.match(css, /body\[data-section="home"\]\[data-tab="chapters"\]\[data-view="overview"\]\s+\.progress-shell\.is-hero::after/);
  assert.match(js, /sidebarProgressTrack:\s*document\.getElementById\("sidebar-progress-track"\)/);
  assert.match(js, /sidebarProgressFill:\s*document\.getElementById\("sidebar-progress-fill"\)/);
  assert.match(js, /refs\.sidebarProgressTrack\?\.setAttribute\("aria-valuenow", String\(summary\.percent\)\)/);
  assert.match(js, /refs\.sidebarProgressFill\.style\.width = `\$\{summary\.percent\}%`;/);
});
