import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { chromium } from "@playwright/test";

const WORKSPACE = path.join(process.cwd(), "projects", "ela20-1-shakespeare-macbeth", "workspace");

test("Macbeth parity surfaces autosave and deliberately upsert into the shared Evidence Bank", async () => {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent((request.url ?? "/").split("?")[0]);
      const relative = requestPath === "/" ? "index.html" : requestPath.replace(/^\//, "");
      const absolute = path.resolve(WORKSPACE, relative);
      if (!absolute.startsWith(`${WORKSPACE}${path.sep}`) && absolute !== path.join(WORKSPACE, "index.html")) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(absolute);
      const extension = path.extname(absolute).toLowerCase();
      const contentType = extension === ".html"
        ? "text/html"
        : extension === ".pdf"
          ? "application/pdf"
          : extension === ".css"
            ? "text/css"
            : "application/octet-stream";
      response.writeHead(200, { "content-type": contentType }).end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const base = `http://127.0.0.1:${address.port}/index.html`;
    await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());

    await page.goto(`${base}#play-materials`, { waitUntil: "domcontentloaded" });
    assert.equal(await page.locator("#play-materials:visible").count(), 1);
    assert.equal(await page.locator("#play-materials .library-doc-tab").count(), 7);
    assert.equal(
      await page.locator('#play-materials [data-english-activity-panel="macbeth-original-text"] iframe').getAttribute("src"),
      "https://shakespeare.mit.edu/macbeth/index.html"
    );
    await page.getByRole("button", { name: /myShakespeare Macbeth Companion/ }).click();
    assert.equal(await page.locator('#play-materials [data-english-activity-panel="macbeth-multimedia-companion"]:visible').count(), 1);
    assert.equal(await page.locator('#play-materials [data-english-activity-panel="macbeth-multimedia-companion"] iframe').count(), 0);
    await page.getByRole("button", { name: /Macbeth Original Text/ }).click();
    await page.getByRole("button", { name: "Full Screen", exact: true }).click();
    assert.equal(await page.locator("[data-shakespeare-reader-overlay]:visible").count(), 1);
    assert.equal(
      await page.locator("[data-shakespeare-reader-frame]").getAttribute("src"),
      "https://shakespeare.mit.edu/macbeth/index.html"
    );
    await page.getByRole("button", { name: "Close full-screen reader" }).click();

    await page.goto(`${base}#act-questions`);
    const actOne = page.locator('#act-questions [data-question-panel][data-english-activity-panel="act-1"]:visible');
    assert.equal(await actOne.count(), 1);
    assert.equal(await actOne.getByRole("button", { name: "Save Act Answers to Evidence Bank", exact: true }).count(), 1);
    const hintButton = actOne.locator("[data-worksheet-toggle-hints]");
    await hintButton.click();
    assert.equal((await actOne.locator("[data-question-hint]:visible").count()) > 0, true);
    await hintButton.click();
    const actSummary = actOne.locator('[data-response-id="ela20-1-shakespeare-macbeth:act-questions:act-1:scene-1:summary"]');
    const teacherAnswer = actOne.locator('[data-response-id="ela20-1-shakespeare-macbeth:act-questions:act-1:scene-1-question-1"]');
    await actSummary.fill("The Witches create a world of reversal and arrange to meet Macbeth.");
    await teacherAnswer.fill("The antithesis makes moral categories feel unstable and establishes an ominous mood.");
    const sceneEvidence = actOne.locator('[data-evidence-contribution-id="ela20-1-shakespeare-macbeth:act-questions:act-1:scene-1:evidence"]');
    await sceneEvidence.locator('[data-evidence-draft="detail"]').fill("Fair is foul, and foul is fair. (1.1)");
    await sceneEvidence.locator('[data-evidence-draft="connection"]').fill("The reversal establishes appearance and reality as a governing pattern.");
    await sceneEvidence.getByRole("button", { name: "Save Scene Checkpoint to Evidence Bank", exact: true }).click();
    assert.equal(await sceneEvidence.locator("[data-save-status]").innerText(), "Saved to Evidence Bank");
    await actOne.getByRole("button", { name: "Save Act Answers to Evidence Bank", exact: true }).click();
    assert.equal(await actOne.locator("[data-response-collection-status]").innerText(), "Act 1 saved to Evidence Bank");
    await page.reload();
    assert.equal(await actSummary.inputValue(), "The Witches create a world of reversal and arrange to meet Macbeth.");

    await page.goto(`${base}#character-notes`);
    const macbethDossier = page.locator('[data-character-dossier-panel="macbeth"]:visible');
    await macbethDossier.locator('[data-response-id="ela20-1-shakespeare-macbeth:character-notes:macbeth:traits"]').fill("Initially celebrated as courageous and loyal.");
    await macbethDossier.locator('[data-response-id$=":quotation:detail"]').fill("Stars, hide your fires. (1.4)");
    await macbethDossier.locator('[data-response-id$=":quotation:connection"]').fill("The concealment imagery exposes ambition beneath Macbeth's public loyalty.");
    await macbethDossier.getByRole("button", { name: "Save Quotation to Evidence Bank", exact: true }).click();
    assert.equal(await macbethDossier.locator("[data-save-status]").innerText(), "Saved to Evidence Bank");
    await macbethDossier.getByRole("button", { name: "Save Dossier to Evidence Bank", exact: true }).click();
    assert.equal(await macbethDossier.locator("[data-response-collection-status]").innerText(), "Macbeth dossier saved to Evidence Bank");
    await page.getByRole("button", { name: /Lady Macbeth 0% complete/ }).click();
    assert.equal(await page.locator('[data-character-dossier-panel="lady-macbeth"]:visible').count(), 1);
    await page.reload();
    assert.equal(await page.locator('[data-character-dossier-panel="lady-macbeth"]:visible').count(), 1);

    await page.goto(`${base}#writing-studio`);
    const writingSelect = page.locator('#writing-studio [data-english-activity-select="ela20-1-shakespeare-macbeth:writing-studio:tools"]');
    await page.locator('[data-shakespeare-match-term="wherefore"]').click();
    await page.locator('[data-shakespeare-match-meaning="wherefore"]').click();
    assert.equal(await page.locator("[data-shakespeare-match-score]").innerText(), "1 / 12");
    await writingSelect.selectOption("character-change-paragraph");
    const paragraph = page.locator('#writing-studio [data-english-activity-panel="character-change-paragraph"]:visible');
    await paragraph.locator('[data-response-id$=":focused-answer"]').fill("Macbeth changes from a conflicted conspirator into an increasingly isolated tyrant.");
    await paragraph.locator('[data-response-id$=":paragraph"]').fill("Macbeth's responses to violence reveal that repeated murder hardens action while deepening fear and isolation.");
    await paragraph.getByRole("button", { name: "Save Character-Change Paragraph", exact: true }).click();
    assert.equal(await paragraph.locator("[data-response-collection-status]").innerText(), "Character-Change Paragraph saved to Evidence Bank");
    await writingSelect.selectOption("graphic-essay");
    const motif = page.locator('#writing-studio [data-english-activity-panel="graphic-essay"]:visible');
    await motif.locator('[data-response-id$=":motif"]').selectOption("Blood");
    await motif.locator('[data-response-id$=":theme-claim"]').fill("Blood changes from proof of violence into an inescapable sign of guilt.");
    await motif.getByRole("button", { name: "Save Visual Motif Essay Plan", exact: true }).click();
    assert.equal(await motif.locator("[data-response-collection-status]").innerText(), "Visual Motif Essay saved to Evidence Bank");
    await page.reload();
    assert.equal(await page.locator('#writing-studio [data-english-activity-panel="graphic-essay"]:visible').count(), 1);
    assert.equal(await motif.locator('[data-response-id$=":motif"]').inputValue(), "Blood");

    await page.goto(`${base}#resources`);
    assert.equal(await page.locator("#resources:visible").count(), 1);
    assert.equal(await page.locator("#resources .resource-lesson-group--documents .external-resource-card").count(), 5);
    assert.equal(await page.locator('#resources [data-english-activity-panel="resources-play-access"]:visible .external-resource-card').count(), 2);

    await page.goto(`${base}#evidence-bank`);
    const evidenceCards = page.locator("[data-manual-evidence-list] .social-manual-evidence-card");
    assert.equal(await evidenceCards.count(), 6);
    const evidenceText = await page.locator("[data-manual-evidence-list]").innerText();
    assert.match(evidenceText, /Act 1 Question Collection/);
    assert.match(evidenceText, /Macbeth Character Dossier/);
    assert.match(evidenceText, /Character-Change Paragraph/);
    assert.match(evidenceText, /Visual Motif Essay/);

    const greenButtons = page.locator(".evidence-bank-save-action");
    assert.equal((await greenButtons.count()) > 0, true);
    assert.equal(
      await greenButtons.evaluateAll((buttons) => buttons.every((button) => getComputedStyle(button).backgroundColor === "rgb(21, 66, 18)")),
      true
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${base}#writing-studio`);
    const dimensions = await page.evaluate(() => ({ innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.equal(dimensions.scrollWidth <= dimensions.innerWidth + 1, true);
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
