import test from "node:test";
import assert from "node:assert/strict";

import { buildGenerationContext } from "../lib/engine/context-builder.js";
import { getProjectPaths } from "../lib/paths.js";

test("generation context includes workflow-aware production guidance", async () => {
  const context = await buildGenerationContext({
    slug: "forensics35",
    roots: getProjectPaths("forensics35")
  });

  assert.match(context, /production artifact assistant/i);
  assert.match(context, /conversion/);
  assert.match(context, /generated-course/);
  assert.match(context, /injection\/integration/);
  assert.match(context, /export-safe/i);
  assert.match(context, /Boundary Discipline/);
});
