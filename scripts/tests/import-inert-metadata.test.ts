import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { importProject } from "../lib/importer.js";
import { getProjectPaths } from "../lib/paths.js";

test("HTML import keeps JSON configuration and import maps inert beside executable behaviour", async () => {
  const source = await mkdtemp(path.join(os.tmpdir(), "sportswellness-import-"));
  const slug = `inert-import-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const config = { moduleId: slug, topics: ["start"], questionCount: 12 };
  try {
    await writeFile(path.join(source, "index.html"), `<!doctype html><html><body>
      <h1>Import fixture</h1><script id="phase-config" type="application/json">${JSON.stringify(config)}</script>
      <script type="importmap">{"imports":{"lesson":"./lesson.js"}}</script>
      <script type="text/x-template" id="template"><p>Teaching template</p></script>
      <script>window.importedModule = JSON.parse(document.getElementById('phase-config').textContent).moduleId;</script>
      </body></html>`);
    await importProject({ inputPath: source, slug });
    const html = await readFile(paths.workspaceEntrypoint, "utf8");
    const script = await readFile(path.join(paths.workspaceDir, "main.js"), "utf8");
    assert.match(html, /id="phase-config" type="application\/json"/);
    assert.match(html, /type="importmap"/);
    assert.match(html, /id="template"/);
    assert.match(html, /src="\.\/main\.js"/);
    assert.match(script, /window.importedModule/);
    assert.doesNotMatch(script, /questionCount|"imports"|Teaching template/);
    assert.equal(JSON.parse(html.match(/id="phase-config" type="application\/json">([^<]+)</)![1]).moduleId, slug);
  } finally {
    await rm(source, { recursive: true, force: true });
    await rm(paths.root, { recursive: true, force: true });
    await rm(paths.resourceDir, { recursive: true, force: true });
  }
});
