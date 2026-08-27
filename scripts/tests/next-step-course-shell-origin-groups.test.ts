import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { chromium } from "@playwright/test";

import { renderNextStepCourseShell } from "../lib/next-step-course-shell.js";

const STORAGE_BASE = "canvas-helper:evidence-origin-groups-test";

function renderTestCourse() {
  return renderNextStepCourseShell({
    slug: "evidence-origin-groups-test",
    courseTitle: "Evidence Origin Groups Test",
    courseCode: "Social Studies 30-1",
    overviewIntro: "Runtime contract fixture.",
    outcomes: ["Organize deliberate evidence saves by collection point."],
    storageKeyBase: STORAGE_BASE,
    lessons: [
      {
        id: "lesson-1",
        title: "Lesson 1",
        summary: "Runtime fixture lesson.",
        html: "<p>Lesson fixture.</p>"
      }
    ],
    navItems: [
      {
        id: "source-analysis",
        label: "Source Analysis",
        icon: "fact_check",
        html: `<section
          data-writing-activity-panel
          data-response-collection
          data-evidence-collection-id="evidence-origin-groups-test:source-analysis:collection"
          data-evidence-source="Source Analysis"
          data-evidence-activity-id="source-analysis"
          data-evidence-activity-title="Source Analysis"
          data-evidence-origin-id="source-analysis"
          data-evidence-origin-title="Source Analysis"
          data-evidence-prompt-label="Source response routine"
          data-evidence-detail-label="Source analysis responses"
        >
          <div data-evidence-question-number="1" data-evidence-question-prompt="What is the source message?">
            <textarea data-response-id="evidence-origin-groups-test:source:1"></textarea>
          </div>
          <button type="button" data-save-response-collection>Save Source Analysis to Evidence Bank</button>
          <span data-response-collection-status></span>
          <span data-save-status></span>
        </section>`
      },
      {
        id: "evidence-bank",
        label: "Evidence Bank",
        icon: "inventory_2",
        html: `<section data-organized-evidence-list></section>
          <section
            data-evidence-notebook-panel
            data-evidence-contribution-id="evidence-origin-groups-test:evidence:notebook"
            data-evidence-origin-id="evidence-notebook"
            data-evidence-origin-title="Saved Directly in Evidence Bank"
          >
            <label>Source <input data-response-id="evidence-origin-groups-test:evidence:source" data-evidence-draft="source"></label>
            <label>Concept <input data-response-id="evidence-origin-groups-test:evidence:concept" data-evidence-draft="concept"></label>
            <label>Evidence <textarea data-response-id="evidence-origin-groups-test:evidence:detail" data-evidence-draft="detail"></textarea></label>
            <button type="button" data-save-evidence-note>Save to Evidence Bank</button>
            <span data-save-status></span>
          </section>`
      }
    ]
  });
}

test("organized Evidence Bank groups stable collection and notebook saves without rewriting drafts", async () => {
  const html = renderTestCourse();
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(html);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address === "object");

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") browserErrors.push(message.text());
    });

    await page.goto(`http://127.0.0.1:${address.port}/#source-analysis`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-response-id="evidence-origin-groups-test:source:1"]').fill("The source warns that unchecked power weakens rights.");
    await page.getByRole("button", { name: "Save Source Analysis to Evidence Bank" }).click();
    await page.getByRole("button", { name: "Save Source Analysis to Evidence Bank" }).click();

    await page.goto(`http://127.0.0.1:${address.port}/#evidence-bank`, { waitUntil: "domcontentloaded" });
    assert.deepEqual(
      await page.locator("[data-organized-evidence-list] [data-evidence-origin-group]").evaluateAll((groups) =>
        groups.map((group) => group.getAttribute("data-evidence-origin-group"))
      ),
      ["source-analysis"]
    );
    assert.equal(
      await page.locator('[data-evidence-origin-group="source-analysis"] [data-evidence-bank-entry]').count(),
      1,
      "saving the same Source Analysis again must update its stable collection"
    );

    await page.locator('[data-response-id="evidence-origin-groups-test:evidence:source"]').fill("Lesson 4");
    await page.locator('[data-response-id="evidence-origin-groups-test:evidence:concept"]').fill("Individual rights");
    await page.locator('[data-response-id="evidence-origin-groups-test:evidence:detail"]').fill("The case shows why legal limits matter.");
    await page.getByRole("button", { name: "Save to Evidence Bank" }).click();

    assert.deepEqual(
      await page.locator("[data-organized-evidence-list] [data-evidence-origin-group]").evaluateAll((groups) =>
        groups.map((group) => group.getAttribute("data-evidence-origin-group"))
      ),
      ["source-analysis", "evidence-notebook"]
    );
    assert.deepEqual(
      await page.evaluate(() => {
        const api = (window as typeof window & {
          nextStepEvidenceBank: { list: () => Array<{ contributionId: string; metadata?: { originId?: string } }> };
        }).nextStepEvidenceBank;
        return api.list().map((entry) => [entry.contributionId, entry.metadata?.originId]);
      }),
      [
        ["evidence-origin-groups-test:evidence:notebook", "evidence-notebook"],
        ["evidence-origin-groups-test:source-analysis:collection", "source-analysis"]
      ]
    );

    await page.reload({ waitUntil: "domcontentloaded" });
    assert.deepEqual(
      await page.locator("[data-organized-evidence-list] [data-evidence-origin-group]").evaluateAll((groups) =>
        groups.map((group) => group.getAttribute("data-evidence-origin-group"))
      ),
      ["source-analysis", "evidence-notebook"],
      "origin groups must restore after reload"
    );

    await page.locator('[data-evidence-bank-entry="evidence-origin-groups-test:source-analysis:collection"] [data-remove-evidence-note]').click();
    assert.deepEqual(
      await page.locator("[data-organized-evidence-list] [data-evidence-origin-group]").evaluateAll((groups) =>
        groups.map((group) => group.getAttribute("data-evidence-origin-group"))
      ),
      ["evidence-notebook"]
    );
    await page.goto(`http://127.0.0.1:${address.port}/#source-analysis`, { waitUntil: "domcontentloaded" });
    assert.equal(
      await page.locator('[data-response-id="evidence-origin-groups-test:source:1"]').inputValue(),
      "The source warns that unchecked power weakens rights.",
      "removing the collected copy must not erase the autosaved source response"
    );
    assert.deepEqual(browserErrors, []);
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
