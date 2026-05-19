import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const calmModuleOnePath = path.resolve("projects/calm-module/workspace/main.jsx");
const calmModuleTwoPath = path.resolve("projects/calmmodule2/workspace/main.jsx");
const calmModuleThreeIndexPath = path.resolve("projects/calm3new/workspace/index.html");
const calmModuleThreeStylesPath = path.resolve("projects/calm3new/workspace/styles.css");

test("CALM Module 1 exposes a sidebar host for Google-hosted save controls", async () => {
  const source = await readFile(calmModuleOnePath, "utf8");

  assert.match(source, /data-google-hosted-controls-host="true"/);
  assert.match(source, /className="mt-auto px-4 pb-6"/);
});

test("CALM Module 2 exposes a sidebar host for Google-hosted save controls", async () => {
  const source = await readFile(calmModuleTwoPath, "utf8");

  assert.match(source, /data-google-hosted-controls-host="true"/);
  assert.match(source, /className="mt-auto pt-4"/);
});

test("CALM Module 3 hides Google-hosted save controls when the sidebar is collapsed", async () => {
  const [indexSource, stylesSource] = await Promise.all([
    readFile(calmModuleThreeIndexPath, "utf8"),
    readFile(calmModuleThreeStylesPath, "utf8")
  ]);

  assert.match(indexSource, /data-google-hosted-controls-host="true"/);
  assert.match(stylesSource, /\.sidebar-collapsed \[data-google-hosted-controls-host\]/);
  assert.match(stylesSource, /\.sidebar-collapsed > \.canvas-helper-google-hosted-controls/);
});
