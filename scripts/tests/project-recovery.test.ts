import assert from "node:assert/strict";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { ensureDir, fileExists, removePath } from "../lib/fs.js";
import { importProject } from "../lib/importer.js";
import { getProcessedProjectPaths, getProjectPaths } from "../lib/paths.js";
import { listStudioProjectBundles, readStudioProjectBundle } from "../lib/projects.js";

function buildSourceHtml(title: string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${title}</title>
  </head>
  <body>
    <main>${title}</main>
  </body>
</html>
`;
}

test("listStudioProjectBundles recovers a processed-only project into the canonical project root", async () => {
  const slug = `processed-recovery-${Date.now()}`;
  const projectPaths = getProjectPaths(slug);
  const processedPaths = getProcessedProjectPaths(slug);
  const sourcePath = path.join(processedPaths.sourceDir, "index.html");

  await removePath(projectPaths.root);
  await removePath(projectPaths.resourceDir);
  await removePath(processedPaths.root);

  try {
    await ensureDir(processedPaths.sourceDir);
    await writeFile(sourcePath, buildSourceHtml("Recovered From Processed"), "utf8");

    const bundles = await listStudioProjectBundles();
    const recovered = bundles.find((bundle) => bundle.manifest.slug === slug) ?? null;

    assert.ok(recovered, "expected processed-only slug to be visible in Studio");
    assert.equal(recovered?.manifest.slug, slug);
    assert.equal(await fileExists(projectPaths.manifestPath), true);
    assert.equal(await fileExists(projectPaths.workspaceEntrypoint), true);
    assert.equal(await fileExists(projectPaths.rawEntrypoint), true);
  } finally {
    await removePath(projectPaths.root);
    await removePath(projectPaths.resourceDir);
    await removePath(processedPaths.root);
  }
});

test("readStudioProjectBundle rebuilds an incomplete canonical project from the processed snapshot", async () => {
  const slug = `partial-recovery-${Date.now()}`;
  const projectPaths = getProjectPaths(slug);
  const processedPaths = getProcessedProjectPaths(slug);
  const fixtureDir = path.resolve(".runtime", "test-fixtures", slug);
  const fixturePath = path.join(fixtureDir, "index.html");

  await removePath(projectPaths.root);
  await removePath(projectPaths.resourceDir);
  await removePath(processedPaths.root);
  await removePath(fixtureDir);

  try {
    await ensureDir(fixtureDir);
    await writeFile(fixturePath, buildSourceHtml("Recovered Workspace"), "utf8");
    await importProject({
      inputPath: fixturePath,
      slug,
      force: true
    });

    await ensureDir(processedPaths.sourceDir);
    await copyFile(fixturePath, path.join(processedPaths.sourceDir, "index.html"));
    await removePath(projectPaths.workspaceDir);

    const bundle = await readStudioProjectBundle(slug);

    assert.equal(bundle.manifest.slug, slug);
    assert.equal(await fileExists(projectPaths.workspaceEntrypoint), true);
    assert.equal(await fileExists(projectPaths.rawEntrypoint), true);
  } finally {
    await removePath(projectPaths.root);
    await removePath(projectPaths.resourceDir);
    await removePath(processedPaths.root);
    await removePath(fixtureDir);
  }
});
