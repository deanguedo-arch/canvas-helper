import assert from "node:assert/strict";
import test from "node:test";

import {
  buildNpmSpawnPlan,
  buildStudioArgs,
  parseStudioAutoOptions
} from "../lib/studio-auto.js";

test("parseStudioAutoOptions reads forwarded host and port flags", () => {
  const options = parseStudioAutoOptions(["--host", "127.0.0.1", "--port", "5191"]);

  assert.deepEqual(options, {
    host: "127.0.0.1",
    port: "5191"
  });
});

test("buildStudioArgs forwards host and port into npm run studio", () => {
  const args = buildStudioArgs({
    host: "127.0.0.1",
    port: "5191"
  });

  assert.deepEqual(args, ["run", "studio", "--", "--host", "127.0.0.1", "--port", "5191"]);
});

test("buildStudioArgs leaves studio command untouched when no flags are forwarded", () => {
  const args = buildStudioArgs({});

  assert.deepEqual(args, ["run", "studio"]);
});

test("buildNpmSpawnPlan uses shell-safe command string on windows", () => {
  const plan = buildNpmSpawnPlan(["run", "studio", "--", "--host", "127.0.0.1"], "win32");

  assert.deepEqual(plan, {
    command: "npm.cmd run studio -- --host 127.0.0.1",
    args: [],
    shell: true
  });
});

test("buildNpmSpawnPlan uses direct npm invocation on non-windows", () => {
  const plan = buildNpmSpawnPlan(["run", "studio"], "linux");

  assert.deepEqual(plan, {
    command: "npm",
    args: ["run", "studio"],
    shell: false
  });
});
