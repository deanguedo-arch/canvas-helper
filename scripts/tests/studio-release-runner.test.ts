import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertStudioReleasePortAvailable,
  createStudioReleaseSteps,
  fingerprintStudioReleaseSource,
  reserveStudioReleasePort,
  runStudioReleaseSteps
} from "../lib/studio-release.ts";

test("Studio release gate owns ordered local-tool steps with no npx or nested npm", () => {
  const steps = createStudioReleaseSteps(46_173);
  assert.deepEqual(steps.map((step) => step.id), [
    "focused",
    "build",
    "inspection-e2e",
    "platform-smoke",
    "project-contract"
  ]);
  for (const step of steps) {
    assert.equal(step.executable, process.execPath);
    assert.doesNotMatch([step.executable, ...step.args].join(" "), /(?:^|\s)(?:npx|npm)(?:\s|$)/);
  }
  assert.equal(steps[2]?.environment?.E2E_STUDIO_PORT, "46173");
});

test("Studio release gate stops immediately and propagates the failing exit code", async () => {
  const steps = createStudioReleaseSteps(46_174).slice(0, 3);
  const visited: string[] = [];
  const result = await runStudioReleaseSteps(steps, async (_executable, args) => {
    visited.push(args.join(" "));
    return { exitCode: visited.length === 2 ? 23 : 0, output: "1 passed\n" };
  });
  assert.equal(result.ok, false);
  assert.equal(result.results.at(-1)?.exitCode, 23);
  assert.equal(visited.length, 2);
});

test("Studio release gate fails before tests when its requested port is occupied", async (context) => {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  context.after(() => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  await assert.rejects(assertStudioReleasePortAvailable(address.port), /already in use/);
});

test("Studio release gate holds its allocated port until browser startup", async () => {
  const reservation = await reserveStudioReleasePort();
  await assert.rejects(assertStudioReleasePortAvailable(reservation.port), /already in use/);
  await reservation.release();
  await assertStudioReleasePortAvailable(reservation.port);
});

test("Studio release provenance fingerprints exact source bytes and paths", async (context) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-studio-release-"));
  context.after(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(root, { recursive: true, force: true });
  });
  await mkdir(path.join(root, "app"), { recursive: true });
  await writeFile(path.join(root, "app", "one.ts"), "alpha\n");
  await writeFile(path.join(root, "package.json"), "{}\n");
  const first = await fingerprintStudioReleaseSource(root, ["app", "package.json"]);
  const unchanged = await fingerprintStudioReleaseSource(root, ["package.json", "app"]);
  assert.equal(unchanged.digest, first.digest);
  assert.deepEqual(first.files, ["app/one.ts", "package.json"]);
  assert.deepEqual(first.sourcePaths, ["app", "package.json"]);

  await writeFile(path.join(root, "app", "one.ts"), "bravo\n");
  const changed = await fingerprintStudioReleaseSource(root, ["app", "package.json"]);
  assert.notEqual(changed.digest, first.digest);
});
