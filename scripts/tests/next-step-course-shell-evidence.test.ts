import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";

import { chromium } from "@playwright/test";

import { renderNextStepCourseShell } from "../lib/next-step-course-shell.js";

const STORAGE_BASE = "canvas-helper:evidence-api-test";

function renderTestCourse() {
  return renderNextStepCourseShell({
    slug: "evidence-api-test",
    courseTitle: "Evidence API Test",
    courseCode: "ELA 20-1",
    overviewIntro: "Runtime contract fixture.",
    outcomes: ["Test deliberate evidence saves."],
    storageKeyBase: STORAGE_BASE,
    lessons: [
      {
        id: "lesson-1",
        title: "Lesson 1",
        summary: "Runtime fixture lesson.",
        html: `<label>Activity draft
          <textarea data-response-id="activity:draft"></textarea>
        </label>`
      }
    ],
    navItems: [
      {
        id: "evidence-bank",
        label: "Evidence Bank",
        icon: "inventory_2",
        html: `<section class="english-evidence-bank-list">
          <div data-evidence-bank-filters>
            <select data-evidence-bank-filter="activity"><option value="">All activities</option></select>
            <select data-evidence-bank-filter="work"><option value="">All works</option></select>
            <select data-evidence-bank-filter="locator"><option value="">All locations</option></select>
            <select data-evidence-bank-filter="type"><option value="">All types</option></select>
          </div>
          <div data-manual-evidence-list></div>
          </section>
          <section data-evidence-notebook-panel>
            <label>Source <input data-response-id="manual:source" data-evidence-draft="source"></label>
            <label>Evidence <textarea data-response-id="manual:detail" data-evidence-draft="detail"></textarea></label>
            <button type="button" data-save-evidence-note>Save to Evidence Bank</button>
            <span data-save-status></span>
          </section>
          <section
            data-response-collection
            data-evidence-collection-id="questions:macbeth:act-1"
            data-evidence-source="Macbeth | Act Questions"
            data-evidence-concept="Act 1 Question Collection"
          >
            <div data-evidence-question-number="1" data-evidence-question-prompt="What do the witches establish?">
              <textarea data-response-id="questions:macbeth:act-1:1"></textarea>
            </div>
            <button type="button" data-save-response-collection>Save Act Answers to Evidence Bank</button>
            <span data-response-collection-status></span>
          </section>`
      }
    ]
  });
}

test("course shell exposes the Evidence Bank API without changing its storage channels", () => {
  const html = renderTestCourse();

  assert.match(html, /window\.nextStepEvidenceBank = Object\.freeze\(\{/);
  assert.match(html, new RegExp(`${STORAGE_BASE}:responses`));
  assert.match(html, new RegExp(`${STORAGE_BASE}:manual-evidence-notes`));
});

test("Evidence Bank API upserts, filters, and removes deliberate saves without consuming drafts", async () => {
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
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: "domcontentloaded" });

    assert.deepEqual(
      await page.evaluate(() => {
        const api = (window as typeof window & {
          nextStepEvidenceBank?: { upsert?: unknown; remove?: unknown; list?: unknown };
        }).nextStepEvidenceBank;
        return [typeof api?.upsert, typeof api?.remove, typeof api?.list];
      }),
      ["function", "function", "function"]
    );

    await page.goto(`http://127.0.0.1:${address.port}/#lesson-1`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-response-id="activity:draft"]').fill("Autosaved working draft");
    assert.equal(
      await page.evaluate(() => {
        const api = (window as typeof window & { nextStepEvidenceBank: { list: () => unknown[] } }).nextStepEvidenceBank;
        return api.list().length;
      }),
      0,
      "typing a draft must not add it to the Evidence Bank"
    );

    const firstSave = await page.evaluate(() => {
      const api = (window as typeof window & {
        nextStepEvidenceBank: {
          upsert: (entry: Record<string, unknown>) => Record<string, unknown>;
          list: (filters?: Record<string, unknown>) => Array<Record<string, unknown>>;
        };
      }).nextStepEvidenceBank;
      const saved = api.upsert({
        contributionId: "macbeth:a1s1:anchor-1",
        activity: "side-by-side-reader",
        text: "Macbeth",
        locator: "Act 1, Scene 1",
        evidenceType: "anchor-line",
        evidence: "Fair is foul, and foul is fair.",
        analysis: "The paradox establishes the play's unstable moral world.",
        tags: ["shakespeare", "theme"]
      });
      return {
        saved,
        filtered: api.list({ activity: "side-by-side-reader", text: "Macbeth", tags: ["theme"] }),
        stored: JSON.parse(localStorage.getItem("canvas-helper:evidence-api-test:manual-evidence-notes") || "[]")
      };
    });

    assert.equal(firstSave.filtered.length, 1);
    assert.equal(firstSave.stored.length, 1);
    assert.equal(firstSave.saved.source, "Macbeth | side-by-side-reader");
    assert.equal(firstSave.saved.detail, "Fair is foul, and foul is fair.");
    assert.equal(firstSave.saved.connection, "The paradox establishes the play's unstable moral world.");

    const updatedSave = await page.evaluate(() => {
      const api = (window as typeof window & {
        nextStepEvidenceBank: {
          upsert: (entry: Record<string, unknown>) => Record<string, unknown>;
          list: () => Array<Record<string, unknown>>;
        };
      }).nextStepEvidenceBank;
      const before = api.list()[0];
      const updated = api.upsert({
        contributionId: "macbeth:a1s1:anchor-1",
        evidence: "Fair is foul, and foul is fair — hover through the fog.",
        analysis: "The revised note connects paradox with the scene's obscuring imagery."
      });
      const after = api.list();
      return { before, updated, after };
    });

    assert.equal(updatedSave.after.length, 1);
    assert.equal(updatedSave.updated.id, updatedSave.before.id);
    assert.equal(updatedSave.updated.createdAt, updatedSave.before.createdAt);
    assert.equal(updatedSave.updated.detail, "Fair is foul, and foul is fair — hover through the fog.");

    await page.goto(`http://127.0.0.1:${address.port}/#evidence-bank`, { waitUntil: "domcontentloaded" });
    await page.locator('[data-response-id="questions:macbeth:act-1:1"]').fill("They establish disorder and equivocation.");
    await page.getByRole("button", { name: "Save Act Answers to Evidence Bank" }).click();
    await page.getByRole("button", { name: "Save Act Answers to Evidence Bank" }).click();

    const responseIdUpsert = await page.evaluate(() => {
      const api = (window as typeof window & {
        nextStepEvidenceBank: {
          upsert: (entry: Record<string, unknown>) => Record<string, unknown>;
          list: (filters?: Record<string, unknown>) => Array<Record<string, unknown>>;
        };
      }).nextStepEvidenceBank;
      const before = api.list({ responseId: "questions:macbeth:act-1" })[0];
      const updated = api.upsert({
        responseId: "questions:macbeth:act-1",
        activity: "act-questions",
        answer: "Updated Act 1 answer collection"
      });
      return {
        before,
        updated,
        allCount: api.list().length,
        byResponseIdCount: api.list({ contributionId: "questions:macbeth:act-1" }).length
      };
    });

    assert.equal(responseIdUpsert.allCount, 2);
    assert.equal(responseIdUpsert.byResponseIdCount, 1);
    assert.equal(responseIdUpsert.updated.id, responseIdUpsert.before.id);
    assert.equal(responseIdUpsert.updated.detail, "Updated Act 1 answer collection");

    await page.locator('[data-response-id="manual:source"]').fill("Macbeth | Character Notes");
    await page.locator('[data-response-id="manual:detail"]').fill("Macbeth conceals his intentions from Banquo.");
    assert.equal(
      await page.evaluate(() => {
        const api = (window as typeof window & { nextStepEvidenceBank: { list: () => unknown[] } }).nextStepEvidenceBank;
        return api.list().length;
      }),
      2
    );
    await page.getByRole("button", { name: "Save to Evidence Bank" }).click();
    assert.equal(
      await page.evaluate(() => {
        const api = (window as typeof window & { nextStepEvidenceBank: { list: () => unknown[] } }).nextStepEvidenceBank;
        return api.list().length;
      }),
      3,
      "the legacy manual save remains available"
    );

    const removal = await page.evaluate(() => {
      const api = (window as typeof window & {
        nextStepEvidenceBank: {
          remove: (contributionId: string) => boolean;
          list: () => Array<Record<string, unknown>>;
        };
      }).nextStepEvidenceBank;
      const responsesBefore = localStorage.getItem("canvas-helper:evidence-api-test:responses");
      const removed = api.remove("macbeth:a1s1:anchor-1");
      const missing = api.remove("missing-contribution");
      const responsesAfter = localStorage.getItem("canvas-helper:evidence-api-test:responses");
      return { removed, missing, responsesBefore, responsesAfter, remaining: api.list() };
    });

    assert.equal(removal.removed, true);
    assert.equal(removal.missing, false);
    assert.equal(removal.responsesAfter, removal.responsesBefore, "Evidence Bank removal must not erase activity responses");
    assert.equal(removal.remaining.length, 2);
    assert.equal(removal.responsesAfter?.includes("Autosaved working draft"), true);

    const structuredFilters = await page.evaluate(() => {
      const api = (window as typeof window & {
        nextStepEvidenceBank: {
          upsert: (entry: Record<string, unknown>) => Record<string, unknown>;
          list: (filters?: Record<string, unknown>) => Array<Record<string, unknown>>;
        };
      }).nextStepEvidenceBank;
      api.upsert({
        schemaVersion: 2,
        contributionId: "film:viewing:24-15",
        entryKind: "individual",
        activity: { id: "viewing-guide", profile: "film-study", title: "Viewing Guide" },
        work: { id: "selected-film", title: "Selected Film", kind: "film" },
        locator: { label: "24:15", timestamp: "24:15" },
        evidenceType: "cinematography",
        evidence: "The frame isolates the protagonist.",
        tags: ["film", "framing"]
      });
      return {
        activity: api.list({ activityId: "viewing-guide" }).length,
        profile: api.list({ profile: "film-study" }).length,
        work: api.list({ workId: "selected-film" }).length,
        locator: api.list({ locator: "24:15" }).length
      };
    });
    assert.deepEqual(structuredFilters, { activity: 1, profile: 1, work: 1, locator: 1 });
    await page.locator('[data-evidence-bank-filter="activity"]').selectOption({ label: "Viewing Guide" });
    assert.equal(await page.locator("[data-manual-evidence-list] article").count(), 1, "the learner-facing activity filter narrows the central Evidence Bank");
  } finally {
    await browser.close();
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
});
