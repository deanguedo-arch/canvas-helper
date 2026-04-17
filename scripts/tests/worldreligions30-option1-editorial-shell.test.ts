import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/worldreligions30-option1/workspace/main.js");
const stylesPath = path.resolve("projects/worldreligions30-option1/workspace/styles.css");

test("world religions option1 shared shell uses editorial surfaces for chapters, library, and overview cards", async () => {
  const [mainSource, stylesSource] = await Promise.all([
    readFile(mainPath, "utf8"),
    readFile(stylesPath, "utf8")
  ]);

  assert.match(mainSource, /editorial-overview-card/);
  assert.match(mainSource, /chapter-detail-surface/);
  assert.match(mainSource, /library-shell-grid/);
  assert.match(mainSource, /library-panel/);

  assert.match(stylesSource, /\.editorial-overview-card/);
  assert.match(stylesSource, /\.chapter-detail-surface/);
  assert.match(stylesSource, /\.library-shell-grid/);
  assert.match(stylesSource, /\.library-panel/);
  assert.match(stylesSource, /\.btn-primary[\s\S]*background:\s*var\(--gold\)/);
  assert.match(stylesSource, /\.content-shell[\s\S]*box-shadow:\s*none/);
  assert.match(stylesSource, /\.progress-shell[\s\S]*box-shadow:\s*none/);
});
