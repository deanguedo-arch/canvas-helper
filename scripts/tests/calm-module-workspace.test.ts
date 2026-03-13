import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { parse } from "@babel/parser";

const mainPath = path.resolve("projects/calm-module/workspace/main.jsx");

test("calm-module workspace main.jsx remains valid JSX after report updates", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotThrow(() =>
    parse(source, {
      sourceType: "module",
      plugins: ["jsx"]
    })
  );
});

test("calm-module teacher report template uses live interpolation tokens", async () => {
  const source = await readFile(mainPath, "utf8");

  assert.doesNotMatch(source, /\\\$\{inventorySection\}/);
  assert.doesNotMatch(source, /\\\$\{overallPercentage\}/);
  assert.doesNotMatch(source, /\\\$\{escapeTeacherReportHtml\(new Date\(\)\.toLocaleString\(\)\)\}/);

  assert.match(source, /\$\{inventorySection\}/);
  assert.match(source, /\$\{overallPercentage\}/);
});
