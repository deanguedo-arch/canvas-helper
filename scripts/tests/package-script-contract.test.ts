import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { repoRoot } from "../lib/paths.js";

test("every package script entrypoint under scripts resolves to a real file", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  const scripts = packageJson.scripts ?? {};
  for (const requiredName of [
    "course:create",
    "course:doctor",
    "course:list",
    "course:onboard",
    "context:project",
    "test:course-onboarding",
    "verify:course-onboarding",
    "verify:typecheck-baseline",
    "test:new-course-readiness",
    "verify:new-course-readiness",
    "verify:fresh-course-studio-proof",
    "test:studio-release"
  ]) {
    assert.equal(typeof scripts[requiredName], "string", `${requiredName} must be advertised in package.json`);
  }
  assert.equal(scripts["test:studio-release"], "tsx scripts/run-studio-release.ts");

  const entrypoints = new Set<string>();
  for (const command of Object.values(scripts)) {
    for (const match of command.matchAll(/(?:^|\s)(scripts\/[^\s]+\.ts)(?=\s|$)/g)) {
      entrypoints.add(match[1]);
    }
  }
  assert.ok(entrypoints.size > 0);

  await Promise.all(
    [...entrypoints].map(async (entrypoint) => {
      const target = path.join(repoRoot, entrypoint);
      const targetStats = await stat(target);
      assert.ok(targetStats.isFile(), `${entrypoint} must be a file`);
    })
  );
});
