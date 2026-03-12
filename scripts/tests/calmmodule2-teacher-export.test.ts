import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule2/workspace/main.jsx");

test("teacher export uses styled html print report instead of plain text download", async () => {
  const source = await readFile(mainPath, "utf8");

  const expectedSnippets = [
    'const reportHtml = `<!DOCTYPE html>',
    'window.open("", "_blank")',
    'printWindow.document.write(reportHtml)',
    'printWindow.print()',
    'Print Teacher Report'
  ];

  for (const snippet of expectedSnippets) {
    assert.match(source, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  assert.doesNotMatch(source, /new Blob\(\[out\], \{ type: "text\/plain" \}\)/);
  assert.doesNotMatch(source, /\.txt`/);
});
