import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("Studio App consumes Review Workbench only through its facade", async () => {
  const source = await readFile("app/studio/src/App.tsx", "utf8");
  assert.match(source, /from "\.\/lib\/review-workbench"/);
  assert.doesNotMatch(source, /from "\.\/lib\/review-(?:set|set-storage|screenshots)"/);
  assert.doesNotMatch(source, /from "\.\/hooks\/useScreenshotAnnotation"/);
});

test("shared Studio and server code has no course-specific feature branches", async () => {
  const files = [
    "app/studio/src/App.tsx",
    "app/server/preview-bridge-runtime.ts",
    "app/shared/preview-bridge.ts"
  ];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  for (const courseSlug of ["social10", "forensics35", "calm3new", "general-psychology"]) {
    assert.doesNotMatch(source, new RegExp(courseSlug, "i"));
  }
});

test("review and bridge consumers do not duplicate canonical identifier limits", async () => {
  const files = [
    "app/studio/src/lib/review-set.ts",
    "app/studio/src/lib/review-set-storage.ts",
    "app/server/preview-bridge-runtime.ts"
  ];
  const source = (await Promise.all(files.map((file) => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /\{16,80\}|\{0,159\}/);
  assert.doesNotMatch(source, /(?:requestId|nodeId|projectSlug)\.length\s*[<>]=?\s*(?:80|160)\b/);
});
