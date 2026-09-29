import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium, type Browser, type BrowserContext, type Page } from "@playwright/test";

const roots = Object.fromEntries([1, 2, 3].map((part) => [String(part), path.resolve(process.cwd(), `projects/math10c-unit4-textbook-${part}/exports/scorm-2004-review`)]));
const mime: Record<string, string> = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".pdf": "application/pdf", ".json": "application/json", ".xml": "application/xml" };
let browser: Browser;
let baseUrl = "";
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
    const [, part, ...rest] = pathname.split("/");
    const root = roots[part];
    if (!root) throw new Error("unknown part");
    const relative = rest.join("/") || "index.html";
    if (relative.split("/").includes("..")) throw new Error("invalid path");
    const file = path.resolve(root, relative);
    if (!file.startsWith(root + path.sep) && file !== path.join(root, "index.html")) throw new Error("invalid path");
    response.setHeader("Content-Type", mime[path.extname(file)] || "application/octet-stream");
    response.end(await readFile(file));
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

async function launch(context: BrowserContext, part: number, suspend = ""): Promise<Page> {
  const page = await context.newPage();
  const initial = JSON.stringify({ suspend });
  await page.addInitScript({ content: `(()=>{const input=${initial};const lms={values:{'cmi.suspend_data':input.suspend,'cmi.learner_id':'chapter4-textbook-student'},initializes:0,commits:0,terminates:0};window.textbookLms=lms;window.API_1484_11={Initialize:function(){lms.initializes++;return lms.initializes===1?'true':'false';},GetValue:function(key){return lms.values[key]||'';},SetValue:function(key,value){lms.values[key]=value;return 'true';},Commit:function(){lms.commits++;return 'true';},Terminate:function(){lms.terminates++;return 'true';},GetLastError:function(){return '0';},GetErrorString:function(){return 'No error';},GetDiagnostic:function(){return '';}};})();` });
  await page.goto(`${baseUrl}/${part}/index.html`, { waitUntil: "load" });
  await page.waitForFunction(() => (window as typeof window & { TextbookNotebookDebug?: { ready(): boolean } }).TextbookNotebookDebug?.ready());
  return page;
}

for (const part of [1, 2, 3]) test(`review SCORM part ${part} saves and resumes the exact notebook state`, async () => {
  const firstContext = await browser.newContext();
  const first = await launch(firstContext, part);
  assert.equal(await first.evaluate(() => (window as typeof window & { textbookLms: { initializes: number } }).textbookLms.initializes), 1);
  await first.locator('[data-question-index="0"]').click();
  const answer = first.locator('[data-answer-index="0"]');
  await answer.fill(`Part ${part}: x`);
  await first.locator('[data-math-insert="²"]').click();
  const saved = await first.evaluate(async () => {
    const bridge = (window as typeof window & { __canvasHelperScorm: { saveAsync(): Promise<boolean>; lastError(): string }; textbookLms: { values: Record<string, string>; commits: number } }).__canvasHelperScorm;
    const ok = await bridge.saveAsync();
    return { ok, error: bridge.lastError(), lms: (window as typeof window & { textbookLms: { values: Record<string, string>; commits: number } }).textbookLms };
  });
  assert.equal(saved.ok, true, saved.error);
  assert.ok(saved.lms.commits >= 1);
  assert.ok(saved.lms.values["cmi.suspend_data"].length > 50);
  assert.ok(saved.lms.values["cmi.suspend_data"].length <= 60_000);
  const suspend = saved.lms.values["cmi.suspend_data"];
  await firstContext.close();

  const secondContext = await browser.newContext();
  const second = await launch(secondContext, part, suspend);
  assert.equal(await second.locator('[data-answer-index="0"]').inputValue(), `Part ${part}: x²`);
  assert.match(await second.locator("#save-status").innerText(), /restored|saved|connected/i);
  await secondContext.close();
});
