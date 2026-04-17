import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { getProjectPaths } from "../lib/paths.js";

const projectPaths = getProjectPaths("worldreligions30-option1");
const mainPath = path.resolve(projectPaths.workspaceDir, "main.js");
const stylesPath = path.resolve(projectPaths.workspaceDir, "styles.css");

test("world religions option1 assignment surfaces remove internal placeholder copy and promote student-facing instructions", async () => {
  const [mainSource, styles] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.doesNotMatch(mainSource, /Assignment workspace/);
  assert.doesNotMatch(mainSource, /interactive assignment/);
  assert.doesNotMatch(mainSource, /This assignment rebuilds the Chapter/i);
  assert.doesNotMatch(mainSource, /The interactive stays embedded below/i);
  assert.doesNotMatch(mainSource, /now include in-site interactive assignments/i);

  assert.match(mainSource, /Assignment instructions/i);
  assert.match(mainSource, /assignment-instructions/);
  assert.match(styles, /\.assignment-instructions[\s\S]*font-size:\s*clamp\(/);
});
