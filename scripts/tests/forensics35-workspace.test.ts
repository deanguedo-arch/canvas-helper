import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import ts from "typescript";

const workspaceMainJsxPath = path.resolve("projects/forensics35/workspace/main.jsx");
const workspaceMainJsPath = path.resolve("projects/forensics35/workspace/main.js");

test("forensics35 workspace main.jsx transpiles cleanly as React JSX", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");
  const transpileResult = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ES2020,
      target: ts.ScriptTarget.ES2020
    },
    fileName: "main.jsx",
    reportDiagnostics: true
  });

  const diagnostics = (transpileResult.diagnostics ?? []).filter(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
  );
  assert.equal(diagnostics.length, 0);
});

test("forensics35 workspace runtime stays bound to the forensics35 storage key", async () => {
  const source = await readFile(workspaceMainJsxPath, "utf8");

  assert.match(source, /forensics35::workspace-state::v1/);
  assert.match(source, /module-assignments-view/);
  assert.match(source, /module-content-view/);
});

test("forensics35 workspace transpiled main.js does not contain bare React module specifiers", async () => {
  const source = await readFile(workspaceMainJsPath, "utf8");

  assert.doesNotMatch(source, /from "react\/jsx-runtime"/);
  assert.doesNotMatch(source, /from "react-dom\/client"/);
  assert.match(source, /https:\/\/esm\.sh\/react@19\.1\.1\/jsx-runtime/);
});
