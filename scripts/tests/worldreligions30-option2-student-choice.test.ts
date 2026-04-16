import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/worldreligions30-option2/workspace/main.js");

test("world religions quiz runtime normalizes object-shaped student-choice data", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /studentChoice/);
  assert.doesNotMatch(source, /const items = quiz\.studentChoice \|\| \[\];/);
  assert.doesNotMatch(source, /\.\.\.\(quiz\.studentChoice \|\| \[\]\)\.map/);
  assert.match(source, /getStudentChoiceOptions|normalizeStudentChoice/i);
});
