import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule2/workspace/main.jsx");

test("teacher report includes print-polish summary, budget table, and explicit empty states", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    "summary-grid",
    "summary-stat",
    "budget-compare-table",
    "budget-compare-note",
    "answer-empty-chip"
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
