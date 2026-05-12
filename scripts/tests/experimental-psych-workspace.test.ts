import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const mainPath = path.resolve("projects/experimental-psych-30-per-1-a-b-sec-s-202632352/workspace/main.js");

test("experimental psychology exposes the persisted Next Step theme toggle", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.match(source, /COURSE_THEME_MODES/);
  assert.match(source, /themeMode:\s*normalizeThemeMode\(parsed\.themeMode\)/);
  assert.match(source, /data-theme-toggle="current"/);
  assert.match(source, /data-theme-toggle="next-step"/);
  assert.match(source, /aria-pressed="\$\{themeMode === "next-step"/);
  assert.match(source, /next-step-theme/);
  assert.match(source, /setThemeMode\(/);
  assert.match(source, /--ns-primary:\s*#1e6d0d/);
});
