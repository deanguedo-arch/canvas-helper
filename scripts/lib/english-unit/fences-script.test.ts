import assert from "node:assert/strict";
import test from "node:test";

import { parseFencesScriptScenes } from "./fences-script.js";

test("Fences script parser preserves all two acts and nine scenes", () => {
  const source = `Introduction\nACT I\nSCENE I: Opening one.\ntroy: First line.\nSCENE II: Opening two.\nrose: Second line.\nSCENE III: Opening three.\nSCENE IV: Opening four.\nACT II\nSCENE I: Later one.\nSCENE II: Later two.\nSCENE III: Later three.\nSCENE IV: Later four.\nSCENE V: Funeral morning.\nraynell: Final line.`;
  const scenes = parseFencesScriptScenes(source);
  assert.deepEqual(scenes.map((scene) => `${scene.act}.${scene.scene}`), ["1.1", "1.2", "1.3", "1.4", "2.1", "2.2", "2.3", "2.4", "2.5"]);
  assert.equal(scenes[0]?.title, "Opening one.");
  assert.match(scenes.at(-1)?.text ?? "", /Final line/);
});

test("Fences script parser blocks incomplete scene coverage", () => {
  assert.throws(() => parseFencesScriptScenes("ACT I\nSCENE I: Only one scene."), /must contain Act I Scenes 1-4/);
});
