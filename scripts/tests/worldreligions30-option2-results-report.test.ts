import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/worldreligions30-option2/workspace/main.js");

test("world religions quiz results report includes print-polish layout and print-safe table rules", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "results-sheet",
    "summary-strip",
    "result-badge",
    "teacher-guidance-grid",
    "@page { size: letter portrait;",
    "thead { display: table-header-group; }",
    "page-break-inside: avoid;"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")));
  }
});
