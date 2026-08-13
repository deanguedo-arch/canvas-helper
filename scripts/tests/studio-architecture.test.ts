import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { isStudioProjectManifestPath } from "../../app/server/studio-server.ts";

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

test("Studio watches only exact project manifests for live course discovery", async () => {
  const root = "/repo";
  assert.equal(isStudioProjectManifestPath("/repo/projects/new-course/meta/project.json", root), true);
  assert.equal(isStudioProjectManifestPath("/repo/projects/new-course/workspace/index.html", root), false);
  assert.equal(isStudioProjectManifestPath("/repo/projects/resources/new-course/meta/project.json", root), false);
  assert.equal(isStudioProjectManifestPath("/repo/projects/../outside/meta/project.json", root), false);

  const [serverSource, projectsHookSource] = await Promise.all([
    readFile("app/server/studio-server.ts", "utf8"),
    readFile("app/studio/src/hooks/useProjects.ts", "utf8")
  ]);
  assert.match(serverSource, /STUDIO_PROJECTS_CHANGED_EVENT/);
  assert.match(serverSource, /STUDIO_PROJECT_CHANGE_SIGNAL/);
  assert.match(projectsHookSource, /import\.meta\.hot\.on\(STUDIO_PROJECTS_CHANGED_EVENT/);
  assert.match(projectsHookSource, /loadProjectsOnce\(true\)/);
});
