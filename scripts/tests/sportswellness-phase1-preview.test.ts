import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { chromium } from "playwright";

const projectRoot = path.resolve("projects/sportswellness-phase-1");
const workspace = path.join(projectRoot, "workspace");

test("Phase 1 preview preserves its source inventory and blocked boundary", async () => {
  const raw = await readFile(path.join(projectRoot, "raw/original.html"));
  assert.equal(createHash("sha256").update(raw).digest("hex"), "97b1bcddded6a825b1b6712245b758e5b4d3993d890ca968401408d1f712d459");
  const $ = load(await readFile(path.join(workspace, "index.html"), "utf8"));
  const styles = await readFile(path.join(workspace, "styles.css"), "utf8");
  assert.equal($(".chapter-section:not([data-support-route])").length, 12);
  assert.deepEqual($(".chapter-section[data-support-route]").map((_, element) => $(element).attr("id")).get(), ["course-guide", "checkpoint", "performance-game", "untimed-practice", "process-collection", "resources"]);
  assert.equal($("[data-draft]").length, 72);
  assert.equal(new Set($("[data-draft]").map((_, element) => $(element).attr("data-draft")).get()).size, 72);
  assert.equal($("[data-check]").length, 15);
  assert.equal($("[data-review-question]").length, 10);
  assert.equal($(".learning-support").length, 12);
  assert.deepEqual($(".learning-support").map((_, element) => $(element).attr("data-p1-topic")).get(), ["start", "key-terms", "stress-loop", "performance-zone", "interpreting-nerves", "stress-sources", "attention-coordination", "regulation-tools", "cues-goals", "performance-lab", "playbook", "phase-review"]);
  assert.equal($("[data-support-resource]").length, 33);
  assert.equal($("[data-support-resource][data-resource-kind='video']").length, 16);
  assert.equal($("[data-support-resource][data-resource-kind='reading']").length, 17);
  assert.equal($("[data-resource-id='v-flow']").attr("data-resource-topic"), "performance-zone");
  assert.equal($("[data-p1-play]").length, 0);
  $("[data-support-resource]").each((_, element) => {
    const resource = $(element);
    for (const attribute of ["data-resource-topic", "data-resource-kind", "data-resource-title", "data-resource-publisher", "data-resource-url"]) assert.ok(resource.attr(attribute), `${attribute} is required`);
    for (const label of ["Why this is here:", "Focus on this:", "After:", "If unavailable:"]) assert.match(resource.text(), new RegExp(label), `${resource.attr("data-resource-title")} needs ${label}`);
  });
  $("a[target='_blank']").each((_, element) => assert.match($(element).attr("rel") ?? "", /noopener noreferrer/));
  assert.equal($(".checkpoint-question").length, 10);
  assert.equal($(".course-phases").length, 0);
  assert.equal($(".course-nav > details.nav-section").length, 6);
  assert.equal($(".course-nav > details.nav-section > summary").length, 6);
  assert.deepEqual($(".course-nav .topic-link").map((_, element) => $(element).attr("href")).get(), ["#course-guide", "#start", "#key-terms", "#stress-loop", "#performance-zone", "#interpreting-nerves", "#stress-sources", "#attention-coordination", "#regulation-tools", "#cues-goals", "#performance-lab", "#playbook", "#phase-review", "#checkpoint", "#process-collection", "#resources"]);
  assert.equal($(".course-nav a[href='#performance-game'], .course-nav a[href='#untimed-practice']").length, 0);
  assert.equal($("#performance-lab .practice-chooser a[href='#regulation-lab']").length, 1);
  assert.equal($("#performance-lab .practice-chooser a[href='#performance-game']").length, 1);
  assert.equal($("#performance-lab .practice-chooser a[href='#untimed-practice']").length, 1);
  assert.equal($("#process-collection-title").text(), "My Work · Phase 1");
  assert.match($("#process-collection .work-explainer").text(), /Your work collects here automatically/);
  assert.equal($("#process-collection .my-work-actions button").length, 1);
  assert.match($("#process-collection .my-work-actions").text(), /save My Work as PDF/);
  assert.equal($("#process-collection #backup-save, #process-collection #backup-load, #process-collection #clear-work").length, 0);
  assert.equal($(".nav-tools [data-open-dialog='notebook-dialog']").length, 1);
  assert.equal($("#quick-notes[data-open-dialog='notebook-dialog']").length, 1);
  assert.equal($("#notebook-title").text(), "Quick Notes");
  assert.equal($("#notebook-dialog [data-draft='notebook-notes']").length, 1);
  assert.equal($("#save-note-entry").length, 1);
  assert.equal($("#note-entry-list").length, 1);
  assert.equal($("#note-delete-undo #undo-note-delete").length, 1);
  assert.equal($(".handoff").filter((_, element) => /Keep your Phase 1 tool|Ready for your teacher check-in/.test($(element).text())).length, 0);
  assert.equal($(".sidebar-course-progress, #sidebar-continue").length, 0);
  assert.equal($(".course-guide-nav[href='#course-guide']").length, 1);
  assert.equal($(".nav-stage-guide, .nav-guide-link, .nav-section-guide-link").length, 0);
  assert.equal($("#course-guide-title").text(), "How to use this phase");
  assert.equal($("#course-guide .phase-guide-steps > li").length, 6);
  assert.match($("#course-guide").text(), /How do I know I am finished\?/);
  assert.deepEqual($(".section-completion-guide").map((_, element) => $(element).attr("id")).get(), ["completion-guide-start", "completion-guide-key-terms", "completion-guide-stress-loop", "completion-guide-performance-zone", "completion-guide-interpreting-nerves", "completion-guide-stress-sources", "completion-guide-attention-coordination", "completion-guide-regulation-tools", "completion-guide-cues-goals", "completion-guide-performance-lab", "completion-guide-playbook", "completion-guide-phase-review"]);
  $(".section-completion-guide").each((_, element) => {
    assert.equal($(element).attr("open"), undefined);
    assert.match($(element).find("summary").text(), /How to complete this section/);
    assert.ok($(element).find(".section-completion-body li").length >= 5);
    assert.match($(element).find(".section-completion-body > p").text(), /Expected work:/);
  });
  assert.match(styles, /@media\(min-width:761px\)[\s\S]*?\.nav-collapsed \.school-topbar #mobile-menu-label\s*\{\s*display:\s*none/);
  assert.match(styles, /@media\(max-width:760px\)[\s\S]*?#mobile-menu-label\{display:inline!important\}/);
  assert.equal($("#checkpoint .learning-note").length, 0);
  assert.equal($(".sidebar-review, .sidebar-storage").length, 0);
  assert.deepEqual($(".checkpoint-question").map((_, element) => $(element).attr("id")).get(), Array.from({ length: 10 }, (_, index) => `phase1-q${index + 1}`));
  assert.equal($("img[src^='data:']").length, 0);
  assert.equal($("img[src^='./assets/phase1/']").length, 9);
  assert.equal($("img.brand-logo[src='./assets/school/next-step-logo.png']").length, 1);
  const ids = $("[id]").map((_, element) => $(element).attr("id")).get();
  assert.equal(new Set(ids).size, ids.length);
  for (const src of $("img[src^='./assets/']").map((_, element) => $(element).attr("src")!.slice(2)).get()) await stat(path.join(workspace, src));
  const manifest = JSON.parse(await readFile(path.join(projectRoot, "meta/project.json"), "utf8"));
  assert.equal(manifest.authoringStatus, "blocked");
  assert.equal(manifest.authoring.driverId, "proposal-only-v1");
  assert.equal(manifest.authoring.studioEditing.enabled, false);
  assert.ok(manifest.exportTargets.every((target: { enabled: boolean }) => target.enabled === false));
  const originalGameRoot = path.join(workspace, "assets/game/original");
  const originalHashes = {
    "phase1-performance-state-simulator-game.html": "3cd3582b8ba33768cae2c5e65a63b78d3521994aaae0a47d3246361b4d16e525",
    "phase1-performance-state-simulator-game.app.js": "84faecbed7798173a50cda89ec3cc5144a41e3c403cf9c17c798384d76a93dc6",
    "performance-game-scale.js": "0f296e9351353101127fb52b2167e0536dde617765d52c489e850f1e445da6c8",
    "performance-game-theme.css": "40263de60b6f04c08f89cbdda67a4886e353cf27cf597738395aa92dca1c7a62"
  };
  for (const [file, hash] of Object.entries(originalHashes)) {
    assert.equal(createHash("sha256").update(await readFile(path.join(originalGameRoot, file))).digest("hex"), hash);
  }
});

test("Phase 1 preview restores work, deduplicates checkpoint submission, validates game state and exports safely", async () => {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
      const file = path.resolve(workspace, `.${pathname}`);
      if (!file.startsWith(`${workspace}${path.sep}`)) throw new Error("outside workspace");
      const data = await readFile(file);
      response.setHeader("Content-Type", file.endsWith(".html") ? "text/html" : file.endsWith(".js") ? "text/javascript" : file.endsWith(".css") ? "text/css" : file.endsWith(".svg") ? "image/svg+xml" : file.endsWith(".webp") ? "image/webp" : file.endsWith(".png") ? "image/png" : file.endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
      response.end(data);
    } catch {
      response.statusCode = 404;
      response.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1100, height: 800 }, acceptDownloads: true });
  await context.route(/youtube|google|youtu\.be/, (route) => route.abort());
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(`http://127.0.0.1:${port}/index.html#course-guide`);
    assert.equal(await page.locator("#course-guide").getAttribute("class"), "chapter-section support-route course-guide-route active");
    assert.equal(await page.locator(".course-guide-nav").getAttribute("aria-current"), "page");
    await page.goto(`http://127.0.0.1:${port}/index.html#key-terms`);
    assert.equal(await page.locator("#completion-guide-key-terms").getAttribute("open"), null);
    await page.locator("#completion-guide-key-terms > summary").click();
    assert.equal(await page.locator("#completion-guide-key-terms").getAttribute("open"), "");

    await page.goto(`http://127.0.0.1:${port}/index.html#start-moment`);
    await page.locator("#start-moment").fill("A final-keystroke save check.");
    await page.locator("#school-save-exit").click();
    assert.match(await page.locator("#school-local-status").innerText(), /Saved in this browser/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("canvas-helper:sportswellness-phase-1:state")!).drafts["start-moment"]), "A final-keystroke save check.");
    await page.reload();
    assert.equal(await page.locator("#start-moment").inputValue(), "A final-keystroke save check.");

    await page.locator("#school-sidebar-toggle").click();
    assert.equal(await page.locator("#chapter-navigation").isVisible(), false);
    assert.equal(await page.locator("#contents-toggle").isVisible(), true);
    assert.match(await page.locator("#contents-toggle").getAttribute("aria-label") ?? "", /Open course navigation.*0 of 12 complete/);
    await page.locator("#contents-toggle").click();
    assert.equal(await page.locator("#chapter-navigation").isVisible(), true);

    for (const route of ["start", "key-terms", "stress-loop"]) {
      await page.goto(`http://127.0.0.1:${port}/index.html#${route}`);
      await page.locator(`[data-reviewed='${route}']`).check();
    }
    await page.goto(`http://127.0.0.1:${port}/index.html#performance-zone`);
    assert.equal((await page.locator(".topic-link[aria-current='page'] .nav-current-marker").textContent())?.trim(), "Current");
    assert.equal(await page.locator(".topic-link.reviewed").count(), 3);
    assert.equal(await page.locator("#nav-learn-label").locator("xpath=ancestor::details").getAttribute("open"), "");
    await page.locator("[data-reviewed='performance-zone']").check();

    await page.goto(`http://127.0.0.1:${port}/index.html#performance-lab`);
    assert.equal(await page.locator(".practice-chooser a[href='#performance-game']").count(), 1);
    assert.equal(await page.locator(".practice-chooser a[href='#untimed-practice']").count(), 1);

    await page.goto(`http://127.0.0.1:${port}/index.html#checkpoint`);
    for (const question of await page.locator(".checkpoint-question").all()) await question.locator(`input[value="${await question.getAttribute("data-answer")}"]`).check();
    await page.locator("#checkpoint-submit").click();
    await page.locator("#checkpoint-submit").click();
    assert.match(await page.locator("#checkpoint-result").innerText(), /already saved/);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("canvas-helper:sportswellness-phase-1:state")!).checkpoint.attempts.length), 1);
    await page.reload();
    assert.equal(await page.locator(".checkpoint-question input:checked").count(), 10);

    await page.goto(`http://127.0.0.1:${port}/index.html#performance-game`);
    await page.locator("#phase1-game-frame").waitFor();
    const game = page.frameLocator("#phase1-game-frame");
    await game.getByRole("button", { name: "Begin Simulation" }).click({ timeout: 15_000 });
    await game.getByRole("button", { name: "Breathe" }).click();
    const target = game.locator("div.absolute.rounded-full.border-2.border-white");
    const targetPositionBefore = await target.getAttribute("style");
    await game.locator('[class*="cursor-none"]').click({ position: { x: 320, y: 180 }, force: true });
    await page.waitForTimeout(350);
    const targetPositionAfter = await target.getAttribute("style");
    assert.notEqual(targetPositionAfter, targetPositionBefore);
    assert.equal(await game.getByText("Simulation Terminated").isVisible().catch(() => false), false);
    await page.goto(`http://127.0.0.1:${port}/index.html#resources`);
    assert.match(await page.locator("#phase1-video-host").innerText(), /video will open here/i);
    assert.equal(await page.locator("#support-resource-index .resource-index-kind").count(), 2);
    assert.equal(await page.locator("#support-resource-index .resource-index-group").count(), 14);
    await page.locator("#phase1-video-picker").selectOption("tape-11");
    await page.locator("#video-play").click();
    assert.match(await page.locator("#phase1-video-host iframe").getAttribute("src") ?? "", /youtube-nocookie\.com\/embed\/_Le9VIVi1xM/);

    await page.goto(`http://127.0.0.1:${port}/index.html#performance-zone`);
    const support = page.locator("#support-performance-zone");
    await support.locator(":scope > summary").click();
    const supportVideo = support.locator("[data-resource-id='v-flow']");
    await supportVideo.locator("xpath=ancestor::details[1]/summary").click();
    await supportVideo.locator("[data-play-video]").click();
    assert.match(await supportVideo.locator(".player-slot iframe").getAttribute("src") ?? "", /youtube-nocookie\.com\/embed\/0rIjFCNay2Q/);
    assert.doesNotMatch(await supportVideo.locator(".player-slot iframe").getAttribute("src") ?? "", /autoplay=1/);
    await support.locator(":scope > summary").click();
    await page.waitForFunction(() => !document.querySelector("#support-performance-zone .player-slot iframe"));

    await page.goto(`http://127.0.0.1:${port}/index.html#process-collection`);
    await page.locator("#quick-notes").click();
    await page.locator("#notebook-notes").fill("A saved quick-note entry.");
    await page.locator("#save-note-entry").click();
    assert.match(await page.locator("#note-entry-list").innerText(), /A saved quick-note entry/);
    await page.locator("#note-entry-list .note-delete").click();
    assert.equal(await page.locator("#note-entry-list .note-entry").count(), 0);
    await page.locator("#undo-note-delete").click();
    assert.match(await page.locator("#note-entry-list").innerText(), /A saved quick-note entry/);
    await page.locator("#notebook-dialog [data-close]").last().click();
    assert.match(await page.locator("#process-summary").innerText(), /A saved quick-note entry/);
    assert.match(await page.locator("#process-summary").innerText(), /0 responses saved automatically/);
    await page.reload();
    await page.locator("#quick-notes").click();
    assert.match(await page.locator("#note-entry-list").innerText(), /A saved quick-note entry/);
    await page.locator("#notebook-dialog [data-close]").last().click();
    const popupPromise = page.waitForEvent("popup");
    await page.locator("#process-collection [data-export='notebook']").click();
    const printPage = await popupPromise;
    await printPage.waitForLoadState("domcontentloaded");
    assert.match(await printPage.title(), /My Work/);
    assert.match(await printPage.locator("body").innerText(), /A saved quick-note entry/);
    await printPage.close();

    for (const width of [1100, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of ["checkpoint", "performance-game", "untimed-practice", "process-collection", "resources"]) {
        await page.goto(`http://127.0.0.1:${port}/index.html#${route}`);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`http://127.0.0.1:${port}/index.html#performance-zone`);
    assert.match(await page.locator("#mobile-menu-label").innerText(), /Course menu · \d+\/12/);
    const denied = await browser.newContext();
    await denied.addInitScript(() => Object.defineProperty(Storage.prototype, "setItem", { configurable: true, value() { throw new DOMException("Denied", "SecurityError"); } }));
    const deniedPage = await denied.newPage();
    await deniedPage.goto(`http://127.0.0.1:${port}/index.html#start-moment`);
    await deniedPage.locator("#start-moment").fill("Held in this tab");
    await deniedPage.locator("#school-save-exit").click();
    assert.match(await deniedPage.locator("#school-local-status").innerText(), /storage is unavailable|Export/);
    assert.equal(await deniedPage.locator("#quick-notes").count(), 1);
    await denied.close();
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
