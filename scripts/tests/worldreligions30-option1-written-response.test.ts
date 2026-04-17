import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/worldreligions30-option1/workspace/main.js");

test("world religions option1 quiz runtime supports written responses without a separate student-choice quiz section", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /written:\s*\{\}/);
  assert.match(source, /<textarea[^`]*data-written-question=/);
  assert.match(source, /setWrittenAnswer/);
  assert.doesNotMatch(source, /data-quiz-section="choice"/);
  assert.doesNotMatch(source, /Student choice/i);
  assert.doesNotMatch(source, /data-choice-key=/);
});

test("world religions option1 quiz runtime avoids duplicating prompt numbers in written-response sections", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotMatch(source, /item\.number \? `\$\{item\.number\}\. ` : ""\)\}\$\{escapeHtml\(item\.prompt/);
  assert.match(source, /formatPromptLabel|stripPromptNumber|renderPromptText/i);
});
