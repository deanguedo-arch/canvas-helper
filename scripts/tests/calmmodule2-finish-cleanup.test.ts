import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/calmmodule2/workspace/main.jsx");

test("finish page no longer shows supplementary evidence upload or export note", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotMatch(source, /Supplementary Evidence \(Optional\)/);
  assert.doesNotMatch(source, /Student attached supplementary image evidence/);
  assert.doesNotMatch(source, /<ImageUploader image=\{formData\.supplementaryImage\}/);
});
