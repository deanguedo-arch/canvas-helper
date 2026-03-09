import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { ensureDir, fileExists, removePath } from "../lib/fs.js";
import { importProject } from "../lib/importer.js";
import { getProjectPaths } from "../lib/paths.js";

const reactModuleSource = `import React, { useState } from "react";
import { BookOpen } from "lucide-react";

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <BookOpen size={20} />
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </main>
  );
};

export default App;
`;

test("importProject preserves React module sources disguised as html files", async () => {
  const slug = `react-module-import-${Date.now()}`;
  const paths = getProjectPaths(slug);
  const sourceDir = path.resolve(".runtime", "test-fixtures", slug);
  const sourcePath = path.join(sourceDir, "CALMMODULE3.HTML");

  await removePath(paths.root);
  await removePath(paths.resourceDir);
  await removePath(sourceDir);
  await ensureDir(sourceDir);
  await writeFile(sourcePath, reactModuleSource, "utf8");

  try {
    await importProject({
      inputPath: sourcePath,
      slug,
      force: true
    });

    assert.equal(await fileExists(paths.workspaceEntrypoint), true);
    assert.equal(await fileExists(path.join(paths.workspaceDir, "main.jsx")), true);
    assert.equal(await fileExists(path.join(paths.rawDir, "main.jsx")), true);
    assert.equal(await fileExists(paths.rawSourceText), true);

    const [workspaceHtml, workspaceScript, rawSourceText] = await Promise.all([
      readFile(paths.workspaceEntrypoint, "utf8"),
      readFile(path.join(paths.workspaceDir, "main.jsx"), "utf8"),
      readFile(paths.rawSourceText, "utf8")
    ]);

    assert.match(workspaceHtml, /type="text\/babel"/);
    assert.match(workspaceHtml, /data-type="module"/);
    assert.doesNotMatch(workspaceHtml, /type="importmap"/);
    assert.match(workspaceHtml, /__canvas-helper-preview-error/);
    assert.match(workspaceHtml, /src="\.\/main\.jsx"/);

    assert.match(workspaceScript, /export default App;/);
    assert.match(workspaceScript, /import __CanvasHelperReactDomClient from "https:\/\/unpkg\.com\/react-dom@19\.1\.1\/client\?module";/);
    assert.match(workspaceScript, /__CanvasHelperReactDomClient\.createRoot/);
    assert.equal(rawSourceText, reactModuleSource);
  } finally {
    await removePath(paths.root);
    await removePath(paths.resourceDir);
    await removePath(sourceDir);
  }
});
