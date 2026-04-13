import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/general-psychology-20-independent-studies-202633108/workspace/main.js");

test("general psychology quiz rows do not render conversion status pills", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(
    source,
    /const status = bucket === "assignments" && !isQuizLibraryItem\(activity\)\s+\? getActivityConversionStatus\(activity\)\s+: "";/,
  );
});
