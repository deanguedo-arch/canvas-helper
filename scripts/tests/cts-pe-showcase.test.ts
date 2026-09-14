import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildCtsPeShowcase, SHOWCASE_COURSES } from "../deploy-cts-pe-showcase.ts";

const repo = path.resolve(new URL("../..", import.meta.url).pathname);

test("shared CTS/PE showcase stages a selector and all six canonical workspaces", async () => {
  const stage = await mkdtemp(path.join(os.tmpdir(), "cts-pe-showcase-test-"));
  try {
    const { publicRoot, release } = await buildCtsPeShowcase(repo, stage);
    const selector = await readFile(path.join(publicRoot, "index.html"), "utf8");
    const script = await readFile(path.join(publicRoot, "showcase.js"), "utf8");
    const style = await readFile(path.join(publicRoot, "showcase.css"), "utf8");
    assert.match(selector, /id="course-select"/);
    assert.match(selector, /id="course"/);
    assert.match(selector, /id="copy"/);
    assert.doesNotMatch(selector + script + style, /firebase-app|firebase\/analytics|initializeApp/);
    assert.equal(release.selector.courseCount, 6);
    assert.equal(release.courses.length, SHOWCASE_COURSES.length);
    for (const course of SHOWCASE_COURSES) {
      const prefix = path.join(publicRoot, "courses", course.slug);
      const entry = await readFile(path.join(prefix, "index.html"), "utf8");
      assert.ok(entry.includes(course.title.split(" — ")[0]), course.slug);
      for (const file of ["index.html", "course.js", "styles.css"]) {
        const relative = `courses/${course.slug}/${file}`;
        assert.ok(release.files[relative], relative);
        assert.equal(release.files[relative].length, 64, relative);
      }
    }
    assert.ok(release.files["assets/nxt-ce-logo-white-with-ce.png"]);
    assert.ok(release.files["assets/HankenGrotesk-Variable.ttf"]);
    assert.ok(release.files["assets/WorkSans-Variable.ttf"]);
    assert.ok(!(await readFile(path.join(stage, "firebase.json"), "utf8")).includes("analytics"));
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
});
