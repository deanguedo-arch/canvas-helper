import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import { load } from "cheerio";

import {
  ELA30_EVIDENCE_PROJECT_SLUGS,
  applyEnglishEvidenceRetrofitToHtml,
  createEnglishEvidenceRetrofitReport,
  verifyEnglishEvidenceRetrofitHtml,
  type Ela30EvidenceProjectSlug,
} from "./ela30-evidence-retrofit.js";
import { parseEnglishEvidenceBankRetrofit } from "./schema.js";
import { updateProjectJson } from "../../retrofit-english-evidence.js";

async function sourceFor(slug: Ela30EvidenceProjectSlug): Promise<string> {
  return readFile(path.resolve("projects", slug, "workspace", "index.html"), "utf8");
}

test("retrofitting every canonical ELA 30-1 workspace is deterministic and schema-valid", async () => {
  for (const slug of ELA30_EVIDENCE_PROJECT_SLUGS) {
    const first = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: await sourceFor(slug) });
    const second = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: first.html });
    const verification = verifyEnglishEvidenceRetrofitHtml({ projectSlug: slug, html: first.html });
    const report = parseEnglishEvidenceBankRetrofit(createEnglishEvidenceRetrofitReport(first, "2026-07-20T12:00:00-06:00"));

    assert.equal(verification.ok, true, `${slug}: ${verification.failures.join(" ")}`);
    assert.equal(second.html, first.html, `${slug} was not idempotent`);
    assert.equal(second.outputHash, first.outputHash, `${slug} output hash drifted`);
    assert.equal(report.outputSha256, first.outputHash);
    assert.equal(report.sourceSha256, first.baseHash);
    assert.equal(report.adapters.length, first.actionIds.length);
    assert.ok(report.selectorChecks.every((check) => check.status === "placed" && check.count > 0));
  }
});

test("project metadata explicitly tracks the Evidence Bank key for SCORM restoration", () => {
  const workspacePath = "/repo/projects/ela30-1-short-stories/workspace/index.html";
  const updated = updateProjectJson({
    googleHosted: {
      authMode: "local-only",
      trackedStorageKeys: ["existing-response-key", "existing-response-key"],
    },
  }, "ela30-1-short-stories", workspacePath);

  assert.deepEqual(updated.googleHosted, {
    authMode: "local-only",
    trackedStorageKeys: [
      "existing-response-key",
      "canvas-helper:ela30-1-short-stories:manual-evidence-notes",
    ],
  });
});

test("every injected inline runtime parses as JavaScript in all five workspaces", async () => {
  for (const slug of ELA30_EVIDENCE_PROJECT_SLUGS) {
    const applied = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: await sourceFor(slug) });
    const runtimeStart = applied.html.indexOf("<!-- canvas-helper:ela30-evidence-retrofit:runtime:start -->");
    const runtimeEnd = applied.html.indexOf("<!-- canvas-helper:ela30-evidence-retrofit:runtime:end -->");
    assert.notEqual(runtimeStart, -1, `${slug} is missing its injected runtime start marker`);
    assert.ok(runtimeEnd > runtimeStart, `${slug} is missing its injected runtime end marker`);
    const runtimeHtml = applied.html.slice(runtimeStart, runtimeEnd);
    const $ = load(runtimeHtml);
    const scripts = $("script:not([src])").toArray();
    assert.ok(scripts.length > 0, `${slug} has no injected inline runtime to parse`);
    scripts.forEach((script, index) => {
      assert.doesNotThrow(
        () => new vm.Script($(script).html() || "", { filename: `${slug}:evidence-runtime-${index + 1}.js` }),
        `${slug} injected runtime ${index + 1} must parse`,
      );
    });
  }
});

test("dynamic contribution IDs use stable slug segments while display labels stay unchanged", async () => {
  const applied = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-short-stories",
    html: await sourceFor("ela30-1-short-stories"),
  });
  const runtimeStart = applied.html.indexOf("<!-- canvas-helper:ela30-evidence-retrofit:runtime:start -->");
  const runtimeEnd = applied.html.indexOf("<!-- canvas-helper:ela30-evidence-retrofit:runtime:end -->");
  const $ = load(applied.html.slice(runtimeStart, runtimeEnd));
  const runtime = $("script:not([src])").first().html() || "";
  const helperStart = runtime.indexOf("function normalizeIdentity(value)");
  const helperEnd = runtime.indexOf("function resolvePanel(");
  assert.ok(helperStart >= 0 && helperEnd > helperStart, "identity interpolation helpers must be present");
  const helpers = runtime.slice(helperStart, helperEnd);
  const result = vm.runInNewContext(
    `(() => { ${helpers}; return {
      contributionId: interpolateIdentity("ela30-short-stories:writing:{active}", {
        active: "By the Waters of Babylon",
        activeLabel: "By the Waters of Babylon",
        itemId: "item"
      }),
      existingId: interpolateIdentity("ela30-short-stories:questions:{active}", {
        active: "babylon",
        activeLabel: "By the Waters of Babylon",
        itemId: "section-1"
      }),
      displayTitle: interpolateDisplay("{activeLabel}", {
        active: "babylon",
        activeLabel: "By the Waters of Babylon",
        itemId: "section-1"
      })
    }; })()`,
    { window: {} },
  ) as { contributionId: string; existingId: string; displayTitle: string };

  assert.equal(result.contributionId, "ela30-short-stories:writing:by-the-waters-of-babylon");
  assert.equal(result.existingId, "ela30-short-stories:questions:babylon");
  assert.equal(result.displayTitle, "By the Waters of Babylon");
});

test("retrofit refuses a canonical workspace whose required adapter selector disappeared", async () => {
  const slug = "ela30-1-short-stories";
  const source = (await sourceFor(slug)).replace("data-analysis-explorer", "data-analysis-explorer-removed");
  assert.throws(
    () => applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: source }),
    /retrofit refused.*required selectors are missing/i,
  );
});

test("generated routes expose the central API and deliberate stable save contracts", async () => {
  for (const slug of ELA30_EVIDENCE_PROJECT_SLUGS) {
    const result = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: await sourceFor(slug) });
    assert.match(result.html, /window\.nextStepEvidenceBank/);
    assert.match(result.html, /data-evidence-collection-id/);
    assert.match(result.html, /data-evidence-capture/);
    assert.match(result.html, /data-evidence-contribution-id/);
    assert.match(result.html, /data-save-response-collection/);
    assert.match(result.html, /data-save-evidence-note/);
    assert.match(result.html, /:manual-evidence-notes/);
    assert.match(result.html, /responseIds/);
    assert.match(result.html, /data-worksheet-answer/);
    assert.match(result.html, /entryKind/);
  }
});

test("passive Film Room and Resources routes never receive activity-save adapters", async () => {
  for (const slug of ELA30_EVIDENCE_PROJECT_SLUGS) {
    const result = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: await sourceFor(slug) });
    const adapterRoutes = result.project.adapters.map((adapter) => adapter.route);
    assert.equal(adapterRoutes.includes("film-room"), false, `${slug} configured a Film Room save adapter`);
    assert.equal(adapterRoutes.includes("resources"), false, `${slug} configured a Resources save adapter`);
  }
});

test("legacy activity-local banks receive honest learner-facing names", async () => {
  const novel = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-novel-study-legacy",
    html: await sourceFor("ela30-1-novel-study-legacy"),
  }).html;
  assert.match(novel, /<h3>Saved Passages<\/h3>/);
  assert.match(novel, /<h3>Saved Paragraphs<\/h3>/);
  assert.doesNotMatch(novel, /<h3>Evidence bank<\/h3>/);

  const film = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-feature-film-legacy",
    html: await sourceFor("ela30-1-feature-film-legacy"),
  }).html;
  assert.match(film, /<h3>Saved Viewing Moments<\/h3>/);
  assert.doesNotMatch(film, /<h3>Evidence bank<\/h3>/);
});

test("Short Stories receives story collections, individual analysis, and a personal-response collection", async () => {
  const result = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-short-stories",
    html: await sourceFor("ela30-1-short-stories"),
  });
  assert.deepEqual(result.actionIds, [
    "short-story-question-collection",
    "short-story-writing-evidence",
    "short-story-personal-response-plan",
  ]);
  assert.match(result.html, /ela30-short-stories:questions:\{active\}/);
  assert.match(result.html, /ela30-short-stories:writing:\{active\}/);
  assert.match(result.html, /ela30-short-stories:personal-response:\{active\}/);
});

test("Modern Drama persists criticalResponseState before a deliberate evidence save", async () => {
  const applied = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-modern-drama",
    html: await sourceFor("ela30-1-modern-drama"),
  });
  const result = applied.html;
  assert.deepEqual(applied.actionIds, [
    "streetcar-critical-response",
    "streetcar-writing-evidence-note",
    "streetcar-response-plan",
  ]);
  const saveFunction = result.slice(result.indexOf("function saveAdapter"), result.indexOf("function saveManualComposer"));
  assert.ok(saveFunction.indexOf("persistModernState();") < saveFunction.indexOf("window.nextStepEvidenceBank.upsert"));
  assert.match(result, /critical-response-workshop:state/);
  assert.match(result, /ela30-streetcar:writing-note/);
  assert.match(result, /ela30-streetcar:response-plan/);
  assert.match(result, /"id":"claim"/);
  assert.match(result, /individualActiveValues/);
  assert.match(result, /evidenceCollector/);
  assert.match(result, /paragraphArchitect/);
  assert.match(
    result,
    /const staticPages = \[[^\]]*"writing"[^\]]*"critical-essay"[^\]]*"personal-response"[^\]]*"evidence-bank"[^\]]*"resources"\];/,
    "Streetcar's legacy router must allow the injected Evidence Bank route",
  );
});

test("Othello maps scene work individually and larger activities as collections", async () => {
  const result = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-shakespeare-othello",
    html: await sourceFor("ela30-1-shakespeare-othello"),
  });
  const adapters = new Map(result.project.adapters.map((adapter) => [adapter.id, adapter]));
  assert.equal(adapters.get("othello-close-reading")?.kind, "individual-composer");
  assert.equal(adapters.get("othello-act-questions")?.kind, "collection");
  assert.equal(adapters.get("othello-character-dossier")?.kind, "collection");
  assert.equal(adapters.get("othello-writing-activity")?.kind, "adaptive");
  assert.deepEqual(adapters.get("othello-writing-activity")?.disabledActiveValues, ["language-translator"]);
  assert.deepEqual(adapters.get("othello-writing-activity")?.individualActiveValues, ["annotation-lab"]);
  assert.match(result.html, /othello-phase-2-anticipation-reflection/);
  assert.doesNotMatch(result.html, /Quotation bank/);
});

test("retrofit reports make mixed evidence granularity explicit", async () => {
  const streetcarApplied = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-modern-drama",
    html: await sourceFor("ela30-1-modern-drama"),
  });
  const streetcarReport = parseEnglishEvidenceBankRetrofit(
    createEnglishEvidenceRetrofitReport(streetcarApplied, "2026-07-20T12:00:00-06:00"),
  );
  const streetcarPolicy = streetcarReport.adapters.find((adapter) => adapter.id === "streetcar-critical-response")?.evidencePolicy;
  assert.deepEqual(streetcarPolicy, {
    defaultKind: "collection",
    individualActiveValues: ["evidenceCollector", "paragraphArchitect"],
  });

  const othelloApplied = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-shakespeare-othello",
    html: await sourceFor("ela30-1-shakespeare-othello"),
  });
  const othelloReport = parseEnglishEvidenceBankRetrofit(
    createEnglishEvidenceRetrofitReport(othelloApplied, "2026-07-20T12:00:00-06:00"),
  );
  const othelloPolicy = othelloReport.adapters.find((adapter) => adapter.id === "othello-writing-activity")?.evidencePolicy;
  assert.deepEqual(othelloPolicy, {
    defaultKind: "collection",
    individualActiveValues: ["annotation-lab"],
    disabledActiveValues: ["language-translator"],
  });
});

test("Novel Study maps essay and question collections while retaining individual passage and studio saves", async () => {
  const result = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-novel-study-legacy",
    html: await sourceFor("ela30-1-novel-study-legacy"),
  });
  const adapters = new Map(result.project.adapters.map((adapter) => [adapter.id, adapter]));
  assert.equal(adapters.get("novel-question-collection")?.kind, "collection");
  assert.equal(adapters.get("novel-reading-passage")?.kind, "json-item");
  assert.equal(adapters.get("novel-writing-activity")?.kind, "adaptive");
  assert.deepEqual(adapters.get("novel-writing-activity")?.individualActiveValues, [
    "paragraph-builder",
    "motif-string-board",
    "author-intent-toggle",
  ]);
  assert.equal(result.project.adapters.filter((adapter) => adapter.id.startsWith("critical-writing-")).length, 0);
  assert.match(result.html, /data-save-english-writing-preview/);
  assert.match(result.html, /Save Full Critical Essay Plan/);
});

test("Feature Film maps essay, question, and synthesis collections plus individual viewing moments", async () => {
  const result = applyEnglishEvidenceRetrofitToHtml({
    projectSlug: "ela30-1-feature-film-legacy",
    html: await sourceFor("ela30-1-feature-film-legacy"),
  });
  const adapters = new Map(result.project.adapters.map((adapter) => [adapter.id, adapter]));
  assert.equal(adapters.get("film-question-collection")?.kind, "collection");
  assert.equal(adapters.get("film-viewing-synthesis")?.kind, "collection");
  assert.equal(adapters.get("film-viewing-moment")?.kind, "json-item");
  assert.equal(result.project.adapters.filter((adapter) => adapter.id.startsWith("critical-writing-film-")).length, 0);
  assert.match(result.html, /data-save-english-writing-preview/);
  assert.match(result.html, /Save Full Critical Essay Plan/);
});

test("future legacy builder output is guarded by the pure retrofit enhancer", async () => {
  const [storiesBuilder, othelloBuilder, modernBuilder] = await Promise.all([
    readFile(path.resolve("scripts/build-ela-short-stories.ts"), "utf8"),
    readFile(path.resolve("scripts/build-ela-shakespeare-othello.ts"), "utf8"),
    readFile(path.resolve("scripts/lib/ela-modern-drama.ts"), "utf8"),
  ]);
  assert.match(storiesBuilder, /applyEnglishEvidenceRetrofitToHtml\(\{ projectSlug: "ela30-1-short-stories"/);
  assert.match(othelloBuilder, /applyEnglishEvidenceRetrofitToHtml\(\{ projectSlug: "ela30-1-shakespeare-othello"/);
  assert.match(modernBuilder, /applyEnglishEvidenceRetrofitToHtml\(\{ projectSlug: "ela30-1-modern-drama"/);
});

test("all hardcoded route lists account for the new Evidence Bank route", async () => {
  for (const slug of ["ela30-1-shakespeare-othello", "ela30-1-novel-study-legacy", "ela30-1-feature-film-legacy"] as const) {
    const result = applyEnglishEvidenceRetrofitToHtml({ projectSlug: slug, html: await sourceFor(slug) });
    const $ = load(result.html);
    assert.equal($("#evidence-bank").length, 1);
    assert.equal($("#evidence-bank").attr("data-page"), "evidence-bank");
    assert.equal($('[data-page-target="evidence-bank"]').length >= 1, true);
    assert.match(result.html, /evidence-bank/);
  }
});
