import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { normalizeActiveHandoffProject } from "../lib/headroom-session.js";

const repoRoot = process.cwd();

test("headroom normalizes active handoff project labels into slugs", () => {
  assert.equal(normalizeActiveHandoffProject("sportswellness"), "sportswellness");
  assert.equal(normalizeActiveHandoffProject("`sportswellness`"), "sportswellness");
  assert.equal(normalizeActiveHandoffProject("`sportswellness` Apps Script export/runtime"), "sportswellness");
  assert.equal(normalizeActiveHandoffProject("sportswellness Apps Script export/runtime"), "sportswellness");
});

test("codex session startup runs headroom before prompt starters", async () => {
  const script = await readFile(path.join(repoRoot, "scripts", "codex-session.sh"), "utf8");

  assert.match(script, /run_headroom\(\)/);
  assert.match(script, /npm run headroom/);
  assert.ok(
    script.indexOf("run_headroom") < script.indexOf("print_prompt_starters"),
    "Headroom should run before prompt starters are printed"
  );
});

test("npm codex session command uses the cross-platform headroom session helper", async () => {
  const packageJson = JSON.parse(await readFile(path.join(repoRoot, "package.json"), "utf8"));
  const script = await readFile(path.join(repoRoot, "scripts", "codex-session.ts"), "utf8");

  assert.equal(packageJson.scripts["studio:codex:session"], "tsx scripts/codex-session.ts");
  assert.match(script, /runHeadroom/);
  assert.match(script, /npm.*headroom/s);
  assert.ok(
    script.indexOf("runHeadroom") < script.indexOf("printPromptStarters"),
    "Headroom should run before prompt starters are printed"
  );
});

test("session checklist treats headroom as part of startup context compression", async () => {
  const checklist = await readFile(path.join(repoRoot, "docs", "ops", "session-checklist.md"), "utf8");

  assert.match(checklist, /Run Headroom/);
  assert.doesNotMatch(checklist, /Do not start Headroom automatically/);
  assert.match(checklist, /Read `projects\/<slug>\/meta\/prompt-pack\.md` first/);
});
