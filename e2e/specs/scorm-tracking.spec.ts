import { test, expect, type Page } from "@playwright/test";
import { buildScormBridgeScript, injectScormBridgeTag } from "../../scripts/lib/scorm.js";
import { resolveScormTracking, type ScormTrackingContract } from "../../scripts/lib/scorm-tracking.js";

const source = `<!doctype html><html><head><title>SCORM course fixture</title></head><body>
<a href="#overview" data-page-target="overview">Overview</a><a href="#lesson-1" data-page-target="lesson-1">Lesson 1</a><a href="#lesson-2" data-page-target="lesson-2">Lesson 2</a>
<section class="course-page" id="overview"><h1>Unit overview</h1></section>
<section class="course-page" id="lesson-1"><textarea aria-label="Response" data-response-id="answer"></textarea><button data-complete-id="one">Complete one</button></section>
<section class="course-page" id="lesson-2"><button data-complete-id="two">Complete two</button><button data-complete-id="optional">Optional practice</button></section>
<script>
const completionIds = ["one","two"];
const STORAGE_KEY = "unit:complete";
function readComplete(){return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}
function updateComplete(){const complete=new Set(readComplete());const count = completionIds.filter((id) => complete.has(id)).length;document.body.dataset.progress=String(count/2);}
function route(){document.querySelectorAll('.course-page').forEach(p=>p.hidden=p.id!==(location.hash.slice(1)||'overview'));}
document.querySelector('textarea').value=localStorage.getItem('unit:responses')||'';
document.querySelector('textarea').addEventListener('input',e=>localStorage.setItem('unit:responses',e.target.value));
document.querySelectorAll('[data-complete-id]').forEach(b=>b.onclick=()=>{localStorage.setItem(STORAGE_KEY,JSON.stringify([...new Set([...readComplete(),b.dataset.completeId])]));updateComplete();});
window.addEventListener('hashchange',route);route();updateComplete();
</script></body></html>`;

type LmsState = { values: Record<string, string>; commits: number; terminated: number; failCommit: boolean; failKey: string; writesAfterExit: number };
declare global {
  interface Window {
    __scormTestLms: LmsState;
  }
}

async function launch(page: Page, options: { version?: "2004" | "1.2"; suspend?: string; noLms?: boolean; hash?: string; contract?: ScormTrackingContract } = {}) {
  const version = options.version ?? "2004";
  const report = resolveScormTracking(source, ["unit:complete", "unit:responses"], version, options.contract);
  const bridge = buildScormBridgeScript({ projectSlug: "unit", version, storageKeys: ["unit:complete", "unit:responses"], tracking: report.contract });
  await page.addInitScript(({ version, suspend, noLms }) => {
    const lms: LmsState = { values: { "cmi.suspend_data": suspend || "" }, commits: 0, terminated: 0, failCommit: false, failKey: "", writesAfterExit: 0 };
    window.__scormTestLms = lms;
    const get = (key: string) => lms.values[key] || "";
    const set = (key: string, value: string) => { if (lms.terminated) lms.writesAfterExit++; if (key === lms.failKey) return "false"; lms.values[key] = value; return "true"; };
    const commit = () => { lms.commits++; return lms.failCommit ? "false" : "true"; };
    const end = () => { lms.terminated++; return "true"; };
    if (!noLms) Object.assign(window, version === "2004" ? { API_1484_11: { Initialize: () => "true", GetValue: get, SetValue: set, Commit: commit, Terminate: end } } : { API: { LMSInitialize: () => "true", LMSGetValue: get, LMSSetValue: set, LMSCommit: commit, LMSFinish: end } });
  }, { version, suspend: options.suspend, noLms: options.noLms });
  await page.route("http://scorm.test/**", route => route.fulfill({ contentType: route.request().url().endsWith(".js") ? "text/javascript" : "text/html", body: route.request().url().endsWith(".js") ? bridge : injectScormBridgeTag(source) }));
  await page.goto("http://scorm.test/index.html" + (options.hash || ""));
}

const values = (page: Page) => page.evaluate(() => window.__scormTestLms.values);
const savedState = async (page: Page) => JSON.parse((await values(page))["cmi.suspend_data"]);

test("progress mirrors required items; resume restores work in a fresh browser context", async ({ page, browser }) => {
  await launch(page);
  await page.getByRole("link", { name: "Lesson 1", exact: true }).click();
  await page.getByRole("textbox", { name: "Response" }).fill("My saved evidence");
  await page.getByRole("button", { name: "Complete one", exact: true }).click();
  await expect(page.locator("[data-scorm-status]")).toContainText("Saved to Brightspace at");
  expect((await values(page))["cmi.progress_measure"]).toBe("0.5");
  expect((await values(page))["cmi.completion_status"]).toBe("incomplete");
  expect(await page.locator("body").getAttribute("data-progress")).toBe("0.5");
  await page.getByRole("button", { name: "Save and Exit" }).click();
  const suspend = (await values(page))["cmi.suspend_data"];
  const context = await browser.newContext();
  try {
    const reopened = await context.newPage();
    await launch(reopened, { suspend });
    await expect(reopened).toHaveURL(/#lesson-1$/);
    await expect(reopened.getByRole("textbox", { name: "Response" })).toHaveValue("My saved evidence");
    await reopened.getByRole("link", { name: "Lesson 2", exact: true }).click();
    await reopened.getByRole("button", { name: "Complete two", exact: true }).click();
    await reopened.getByRole("button", { name: "Save now", exact: true }).click();
    expect((await values(reopened))["cmi.completion_status"]).toBe("completed");
    expect((await values(reopened))["cmi.progress_measure"]).toBe("1");
    expect((await savedState(reopened)).values["unit:complete"]).not.toContain("optional");
    expect(Object.keys(await values(reopened)).some(key => /score|success_status/.test(key))).toBe(false);
  } finally { await context.close(); }
});

test("active time is cumulative within a session, allocated by page, and excludes idle and hidden time", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-08T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-08T12:00:01Z"));
  await launch(page);
  await page.clock.runFor(15000);
  await page.getByRole("link", { name: "Lesson 1", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Response" })).toBeVisible();
  await page.clock.runFor(15000);
  let state = await savedState(page);
  expect(state.tracking.pageMs.overview).toBe(15000);
  expect(state.tracking.pageMs["lesson-1"]).toBe(15000);
  expect((await values(page))["cmi.session_time"]).toBe("PT30.00S");
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.runFor(60000);
  expect((await savedState(page)).tracking.activeMs).toBe(30000);
  await page.evaluate(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new Event("visibilitychange")); });
  await page.clock.runFor(360000);
  state = await savedState(page);
  expect(state.tracking.activeMs).toBe(330000);
  await page.getByRole("button", { name: "Save and Exit" }).click();
  await page.clock.runFor(30000);
  expect(await page.evaluate(() => window.__scormTestLms.terminated)).toBe(1);
  expect(await page.evaluate(() => window.__scormTestLms.writesAfterExit)).toBe(0);
});

test("save failures stay visible, preserve retry, and prevent completion on oversized work", async ({ page }) => {
  await launch(page);
  await page.getByRole("button", { name: "Save now" }).click();
  const original = (await values(page))["cmi.suspend_data"];
  await page.evaluate(() => { localStorage.setItem("unit:complete", '["one","two"]'); localStorage.setItem("unit:responses", "x".repeat(61000)); });
  await page.getByRole("button", { name: "Save and Exit" }).click();
  await expect(page.locator("[data-scorm-status]")).toContainText("more saved work");
  expect((await values(page))["cmi.suspend_data"]).toBe(original);
  expect((await values(page))["cmi.completion_status"]).toBe("incomplete");
  expect(await page.evaluate(() => window.__scormTestLms.terminated)).toBe(0);
  await page.evaluate(() => { localStorage.setItem("unit:responses", "short answer"); window.__scormTestLms.failCommit = true; });
  await expect(page.locator("[data-scorm-status]")).toContainText("could not commit");
  await page.evaluate(() => { window.__scormTestLms.failCommit = false; });
  await page.getByRole("button", { name: "Save now" }).click();
  await expect(page.locator("[data-scorm-status]")).toContainText("Saved to Brightspace at");
});

test("SCORM 1.2 reports time and completion without unsupported 2004 fields", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-08T12:00:00Z") });
  await page.clock.pauseAt(new Date("2026-09-08T12:00:01Z"));
  await launch(page, { version: "1.2" });
  await page.evaluate(() => localStorage.setItem("unit:complete", '["one","two"]'));
  await page.clock.runFor(15000);
  const data = await values(page);
  expect(data["cmi.core.lesson_status"]).toBe("completed");
  expect(data["cmi.core.session_time"]).toBe("0000:00:15.00");
  expect(data["cmi.progress_measure"]).toBeUndefined();
});

test("standalone launch never claims an LMS save; controls fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await launch(page, { noLms: true });
  await expect(page.locator("[data-scorm-status]")).toContainText("Not connected to Brightspace");
  await expect(page.getByRole("button", { name: "Save and Exit" })).toBeDisabled();
  const bounds = await page.locator("[data-scorm-controls]").boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(375);
  await page.screenshot({ path: test.info().outputPath("save-status-mobile.png") });
});

test("old saves without tracking remain readable and explicit launch locations win", async ({ page }) => {
  const suspend = JSON.stringify({ version: 1, projectSlug: "unit", values: { "unit:responses": "An older saved response", "unit:complete": '["one"]' } });
  await launch(page, { suspend, hash: "#lesson-1" });
  await expect(page.getByRole("textbox", { name: "Response" })).toHaveValue("An older saved response");
  await page.getByRole("button", { name: "Save now" }).click();
  expect((await values(page))["cmi.progress_measure"]).toBe("0.5");
  expect((await savedState(page)).tracking.bookmark).toBe("lesson-1");
});

test("nested builder contract reports required completion and rejects malformed state", async ({ page }) => {
  await launch(page, { contract: { schemaVersion: 1, adapter: "hash-pages-v1", pageIds: ["overview", "lesson-1", "lesson-2"], defaultPageId: "overview", completion: { storageKey: "science:tracking", path: ["completedIds"], requiredIds: ["core-a", "core-b"] } } });
  await page.evaluate(() => localStorage.setItem("science:tracking", JSON.stringify({ completedIds: ["core-a", "optional", "core-a"] })));
  await page.getByRole("button", { name: "Save now" }).click();
  expect((await values(page))["cmi.progress_measure"]).toBe("0.5");
  const valid = (await values(page))["cmi.suspend_data"];
  await page.evaluate(() => localStorage.setItem("science:tracking", "broken JSON"));
  await page.getByRole("button", { name: "Save and Exit" }).click();
  await expect(page.locator("[data-scorm-status]")).toContainText("completion data is invalid");
  expect((await values(page))["cmi.suspend_data"]).toBe(valid);
  expect(await page.evaluate(() => window.__scormTestLms.terminated)).toBe(0);
});

test("tracking write rejection is visible and keeps Save and Exit retryable", async ({ page }) => {
  await launch(page);
  await page.evaluate(() => { window.__scormTestLms.failKey = "cmi.session_time"; });
  await page.getByRole("button", { name: "Save and Exit" }).click();
  await expect(page.locator("[data-scorm-status]")).toContainText("rejected cmi.session_time");
  await expect(page.getByRole("button", { name: "Save and Exit" })).toBeEnabled();
  expect(await page.evaluate(() => window.__scormTestLms.terminated)).toBe(0);
  await page.evaluate(() => { window.__scormTestLms.failKey = ""; });
  await page.getByRole("button", { name: "Save and Exit" }).click();
  expect(await page.evaluate(() => window.__scormTestLms.terminated)).toBe(1);
});

test("incompatible LMS saves are not replaced with an empty course attempt", async ({ page }) => {
  const suspend = JSON.stringify({ version: 1, projectSlug: "different-unit", values: { response: "Preserve this work" } });
  await launch(page, { suspend });
  await expect(page.locator("[data-scorm-status]")).toContainText("Automatic saving is stopped to protect it");
  await expect(page.getByRole("button", { name: "Save now" })).toBeDisabled();
  expect((await values(page))["cmi.suspend_data"]).toBe(suspend);
  expect(await page.evaluate(() => window.__scormTestLms.commits)).toBe(0);
});
