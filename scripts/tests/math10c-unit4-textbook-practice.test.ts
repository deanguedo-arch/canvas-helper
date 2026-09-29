import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import test from "node:test";
import { chromium, type Browser } from "@playwright/test";
import { buildScormStateCodecRuntime } from "../lib/scorm-state-codec.ts";

const ROOT = path.resolve(process.cwd());
const expected = [
  ["math10c-unit4-textbook-1", 28],
  ["math10c-unit4-textbook-2", 43],
  ["math10c-unit4-textbook-3", 81],
] as const;
const stateCodec = new Function(`${buildScormStateCodecRuntime()}\nreturn stateCodec;`)();
const highEntropy = (seed: string, length = 600) => {
  let value = "";
  for (let index = 0; value.length < length; index += 1) value += createHash("sha256").update(`${seed}:${index}`).digest("base64url");
  return value.slice(0, length);
};

function questions(slug: string) {
  const source = readFileSync(path.join(ROOT, "projects", slug, "workspace", "index.html"), "utf8")
    .match(/<script type="application\/json" id="question-data">([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source, `${slug} must author its question data`);
  return JSON.parse(source) as Array<{ section: string; image: string; file: string; label: string }>;
}

test("three Chapter 4 notebooks retain complete auditable inventories", () => {
  let total = 0;
  for (const [slug, count] of expected) {
    const project = path.join(ROOT, "projects", slug);
    const html = readFileSync(path.join(project, "workspace/index.html"), "utf8");
    const manifest = JSON.parse(readFileSync(path.join(project, "meta/project.json"), "utf8"));
    const cropManifest = JSON.parse(readFileSync(path.join(project, "meta/textbook-question-crops.json"), "utf8"));
    const data = questions(slug);
    assert.equal(data.length, count);
    assert.equal(cropManifest.entries.length, count);
    assert.equal(manifest.textbookPractice.questionCount, count);
    assert.equal(manifest.textbookPractice.graded, false);
    assert.equal(manifest.textbookPractice.completion, false);
    assert.equal(manifest.authoringStatus, "active");
    assert.match(html, /does not report a grade or change mastery/i);
    assert.match(html, /Print or save my written work/i);
    assert.match(readFileSync(path.join(project, "workspace/course.js"), "utf8"), /math-entry-tools/);
    for (const item of data) {
      assert.ok(existsSync(path.join(project, "workspace", item.image)), `${slug} missing ${item.image}`);
      assert.ok(existsSync(path.join(project, "workspace", item.file)), `${slug} missing ${item.file}`);
    }
    total += count;
  }
  assert.equal(total, 152);
});

test("maximum written work fits the bounded notebook and SCORM 2004 envelope", () => {
  for (const [slug] of expected) {
    const data = questions(slug);
    const state = { v: 1, rev: 999, route: "overview", selected: [], answers: data.map((_, index) => [index, highEntropy(`${slug}:${index}`)]) };
    const application = JSON.stringify(state);
    const compressed = stateCodec.encode(application);
    const outer = JSON.stringify({
      version: 1, projectSlug: slug, savedAt: "2026-09-25T18:00:00.000Z", values: {}, scope: "course-scope", learnerId: "learner",
      course: { schemaVersion: 1, data: compressed, completedIds: [] },
      tracking: { schemaVersion: 1, bookmark: "overview", activeMs: 99999999, pageMs: {} }, reason: "edited",
    });
    assert.ok(application.length < 55_000, `${slug} exceeds its notebook admission limit`);
    assert.ok(outer.length < 60_000, `${slug} exceeds the configured SCORM 2004 envelope`);
  }
});

let browser: Browser;
let baseUrl = "";
const mime: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".pdf": "application/pdf", ".json": "application/json" };
const server = createServer((request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname).replace(/^\//, "");
    const file = path.resolve(ROOT, pathname);
    if (!file.startsWith(ROOT + path.sep) || pathname.split("/").includes("..")) throw new Error("invalid path");
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(readFileSync(file));
  } catch {
    response.statusCode = 404;
    response.end("Not found");
  }
});

test.before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

test.after(async () => {
  await browser.close();
  server.close();
});

test("notebooks select questions, insert notation, save, print, and keep source pages inline", async () => {
  for (const [slug] of expected) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/projects/${slug}/workspace/index.html`, { waitUntil: "load" });
    await page.waitForFunction(() => (window as typeof window & { TextbookNotebookDebug?: { ready(): boolean } }).TextbookNotebookDebug?.ready());
    const first = page.locator("[data-question-index=\"0\"]");
    await first.click();
    const stage = page.locator("[data-question-stage]").filter({ has: page.locator("[data-answer-index=\"0\"]") });
    await assert.doesNotReject(stage.locator(".question-preview img").waitFor({ state: "visible" }));
    const answer = stage.locator("[data-answer-index=\"0\"]");
    await answer.fill("Show exact work: x");
    await stage.locator("[data-math-insert=\"²\"]").click();
    assert.equal(await answer.inputValue(), "Show exact work: x²");
    await page.waitForFunction(() => document.querySelector("#save-status")?.textContent?.toLowerCase().includes("saved"));
    await page.evaluate(() => { window.print = () => { (window as typeof window & { __printCalled?: boolean }).__printCalled = true; }; });
    await page.locator("#print-work").click();
    await page.waitForFunction(() => Boolean((window as typeof window & { __printCalled?: boolean }).__printCalled));
    assert.equal(await page.evaluate(() => Boolean((window as typeof window & { __printCalled?: boolean }).__printCalled)), true);
    assert.match(await page.locator("#print-sheet").innerText(), /Show exact work: x²/);
    const pagesBefore = context.pages().length;
    await page.locator("[data-reader-file]").first().click();
    await assert.doesNotReject(page.locator("[data-reader-stage]:not([hidden]) iframe").waitFor({ state: "visible" }));
    assert.equal(context.pages().length, pagesBefore);
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(() => (window as typeof window & { TextbookNotebookDebug?: { ready(): boolean } }).TextbookNotebookDebug?.ready());
    assert.equal(await page.locator("[data-answer-index=\"0\"]").inputValue(), "Show exact work: x²");
    assert.deepEqual(errors, []);
    await context.close();
  }
});
