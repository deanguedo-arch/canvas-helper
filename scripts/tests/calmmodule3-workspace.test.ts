import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule3/workspace/main.jsx");
const stylesPath = path.resolve("projects/calmmodule3/workspace/styles.css");

test("calmmodule3 workspace is a planner-first module with core sections and export flow", async () => {
  const [mainSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  const mainSnippets = [
    "Oh, The Places You'll Go",
    "Attitude and Learning",
    "SMART Goals Studio",
    "Decision Making",
    "Transferable Skills",
    "Job Search Readiness",
    "Export Teacher Report"
  ];

  for (const snippet of mainSnippets) {
    assert.match(mainSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }

  const styleSnippets = [
    ".module-shell",
    ".glass-panel",
    ".planner-grid",
    ".teacher-report-shell"
  ];

  for (const snippet of styleSnippets) {
    assert.match(stylesSource, new RegExp(snippet.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
});
