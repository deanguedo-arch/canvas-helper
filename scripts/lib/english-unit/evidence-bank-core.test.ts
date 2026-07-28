import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import {
  ENGLISH_EVIDENCE_BANK_CSS,
  ENGLISH_EVIDENCE_BANK_RUNTIME,
  normalizeEnglishEvidenceEntryV2,
  normalizeEnglishPersistedEvidenceEntries,
  renderEnglishEvidenceBankRoute
} from "./evidence-bank-core.js";
import { EnglishEvidenceBankRetrofitV1Schema, EnglishEvidenceEntryV2Schema } from "./schema.js";

test("normalizes legacy learner notes into the strict V2 evidence contract", () => {
  const normalized = normalizeEnglishEvidenceEntryV2(
    {
      id: "evidence-1",
      responseId: "macbeth:act-1",
      entryKind: "collection",
      source: "Macbeth | Act Questions",
      concept: "Act 1 Question Collection",
      detail: "Question 1: What do the witches establish?\nAnswer: Disorder.",
      connection: "Useful for an argument about equivocation.",
      tags: ["macbeth", "act-1"],
      createdAt: "2026-07-20T12:00:00-06:00",
      updatedAt: "2026-07-20T12:00:00-06:00"
    },
    { projectSlug: "ela30-1-shakespeare-othello", profile: "shakespeare-drama" }
  );

  assert.equal(normalized.schemaVersion, 2);
  assert.equal(normalized.contributionId, "macbeth:act-1");
  assert.equal(normalized.projectSlug, "ela30-1-shakespeare-othello");
  assert.equal(normalized.entryKind, "collection");
  assert.equal(normalized.source.kind, "question-set");
  assert.equal(normalized.activity.profile, "shakespeare-drama");
  assert.match(normalized.answer ?? "", /Question 1/);
  assert.equal(normalized.evidence, undefined, "a legacy collection detail must not be duplicated into evidence");
  assert.equal(EnglishEvidenceEntryV2Schema.safeParse(normalized).success, true);
});

test("keeps valid historical entries when a malformed persisted record is present", () => {
  const normalized = normalizeEnglishPersistedEvidenceEntries(
    [
      { unexpected: "record without an identity" },
      {
        id: "valid-note",
        source: "The Lamp at Noon",
        concept: "Setting",
        detail: "The dust storm confines the family.",
        createdAt: "2026-07-20T12:00:00-06:00",
        updatedAt: "2026-07-20T12:00:00-06:00"
      }
    ],
    { projectSlug: "ela30-1-short-stories", profile: "short-fiction" }
  );

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0]?.contributionId, "valid-note");
  assert.equal(EnglishEvidenceEntryV2Schema.safeParse(normalized[0]).success, true);
});

test("preserves structured V2 context while normalizing incomplete historical fields", () => {
  const normalized = normalizeEnglishEvidenceEntryV2({
    schemaVersion: 2,
    contributionId: "film:viewing:24-15",
    projectSlug: "ela20-1-feature-film",
    entryKind: "individual",
    source: { kind: "media", id: "selected-film", title: "Selected Film" },
    activity: { id: "viewing-guide", profile: "film-study", title: "Viewing Guide" },
    work: { id: "selected-film", title: "Selected Film", kind: "film" },
    locator: { label: "24:15", timestamp: "24:15" },
    evidence: "The frame isolates the protagonist.",
    tags: ["film", "framing"],
    createdAt: "2026-07-20T12:00:00-06:00",
    updatedAt: "2026-07-20T12:00:00-06:00"
  });

  assert.deepEqual(normalized.source, { kind: "media", id: "selected-film", title: "Selected Film" });
  assert.deepEqual(normalized.locator, { label: "24:15", timestamp: "24:15" });
  assert.equal(normalized.evidence, "The frame isolates the protagonist.");
});

test("renders the reusable Evidence Bank route and shared production styling", () => {
  const html = renderEnglishEvidenceBankRoute({
    projectSlug: "ela30-1-short-stories",
    courseCode: "ELA 30-1",
    profile: "short-fiction",
    links: [{ id: "story-questions", label: "Short Story Questions", icon: "quiz" }]
  });

  assert.match(html, /id="evidence-bank"/);
  assert.match(html, /data-page="evidence-bank"/);
  assert.match(html, /data-manual-evidence-list/);
  assert.match(html, /data-save-evidence-note/);
  assert.match(html, /ela30-1-short-stories:evidence-bank:quick-entry:source/);
  assert.match(html, /href="#story-questions"/);
  assert.match(ENGLISH_EVIDENCE_BANK_CSS, /#161a17/);
  assert.match(ENGLISH_EVIDENCE_BANK_CSS, /\.evidence-bank-save-action/);

  const escaped = renderEnglishEvidenceBankRoute({
    projectSlug: "escape-test",
    courseCode: "ELA <30-1>",
    profile: "short-fiction",
    title: 'Evidence <script>alert("x")</script>'
  });
  assert.match(escaped, /ELA &lt;30-1&gt;/);
  assert.match(escaped, /Evidence &lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(escaped, /<script>alert/);
});

test("shared browser runtime keeps contributionId and responseId filters compatible", () => {
  let notes: Array<Record<string, unknown>> = [];
  const context = {
    window: {} as Record<string, unknown>,
    readManualEvidenceNotes: () => notes,
    writeManualEvidenceNotes: (next: Array<Record<string, unknown>>) => {
      notes = next;
    },
    renderManualEvidenceBank: () => undefined
  };
  vm.runInNewContext(ENGLISH_EVIDENCE_BANK_RUNTIME, context);
  const api = context.window.nextStepEvidenceBank as {
    upsert(entry: Record<string, unknown>): Record<string, unknown>;
    list(filters?: Record<string, unknown>): Array<Record<string, unknown>>;
  };

  api.upsert({
    responseId: "othello:act-1",
    activity: "act-questions",
    answer: "Act 1 answers"
  });
  api.upsert({
    contributionId: "othello:act-1",
    answer: "Updated Act 1 answers"
  });

  assert.equal(notes.length, 1);
  assert.equal(api.list({ contributionId: "othello:act-1" }).length, 1);
  assert.equal(api.list({ responseId: "othello:act-1" }).length, 1);
  assert.equal(api.list({ contributionId: ["missing", "othello:act-1"] }).length, 1);
  assert.equal(api.list({ activity: "act-questions" }).length, 1);
  assert.equal(EnglishEvidenceEntryV2Schema.safeParse(notes[0]).success, true);
  assert.equal(notes[0]?.schemaVersion, 2);
  assert.equal(notes[0]?.answer, "Updated Act 1 answers");
  assert.equal(notes[0]?.evidence, undefined);
});

test("browser runtime returns strict V2 entries and supports advertised activity and text filters", () => {
  let notes: Array<Record<string, unknown>> = [
    { malformed: true },
    {
      id: "legacy-valid",
      text: "The Lamp at Noon",
      activity: "literary-terms",
      detail: "The lamp becomes a fragile symbol of safety."
    }
  ];
  const context = {
    window: {} as Record<string, unknown>,
    readManualEvidenceNotes: () => notes,
    writeManualEvidenceNotes: (next: Array<Record<string, unknown>>) => {
      notes = next;
    },
    renderManualEvidenceBank: () => undefined
  };
  vm.runInNewContext(ENGLISH_EVIDENCE_BANK_RUNTIME, context);
  const api = context.window.nextStepEvidenceBank as {
    upsert(entry: Record<string, unknown>): Record<string, unknown>;
    list(filters?: Record<string, unknown>): Array<Record<string, unknown>>;
  };

  assert.equal(api.list().length, 1, "a malformed historical entry must not suppress a valid one");
  const saved = api.upsert({
    schemaVersion: 2,
    contributionId: "film:viewing:24-15",
    projectSlug: "ela30-1-feature-film-legacy",
    entryKind: "individual",
    source: { kind: "media", id: "selected-film", title: "Selected Film" },
    activity: { id: "viewing-guide", profile: "film-study", title: "Viewing Guide" },
    work: { id: "selected-film", title: "Selected Film", kind: "film" },
    locator: { act: "Act 2", scene: "Scene 3", timestamp: "24:15" },
    evidence: "The frame isolates the protagonist.",
    tags: ["film", "framing"],
    createdAt: "2026-07-20T12:00:00-06:00",
    updatedAt: "2026-07-20T12:00:00-06:00"
  });

  assert.equal(EnglishEvidenceEntryV2Schema.safeParse(saved).success, true);
  assert.equal(api.list({ activity: "viewing-guide" }).length, 1);
  assert.equal(api.list({ activity: "Viewing Guide" }).length, 1);
  assert.equal(api.list({ text: "Selected Film" }).length, 1);
  assert.equal(api.list({ text: "selected-film" }).length, 1);
  assert.equal(api.list({ locator: "Scene 3" }).length, 1);
  assert.equal(api.list().every((entry) => EnglishEvidenceEntryV2Schema.safeParse(entry).success), true);
});

test("Evidence Bank Print / PDF is delegated, scoped, and restores page visibility", () => {
  let clickHandler: ((event: Record<string, unknown>) => void) | undefined;
  let printed = 0;
  let prevented = false;
  const bodyClasses = new Set<string>();
  const route = { hidden: false };
  const otherPage = { hidden: false };
  const printButton = {
    closest(selector: string) {
      return selector === "#evidence-bank" ? route : null;
    }
  };
  const context = {
    window: {
      print() {
        printed += 1;
        assert.equal(route.hidden, false);
        assert.equal(otherPage.hidden, true);
        assert.equal(bodyClasses.has("english-evidence-printing"), true);
      },
      addEventListener: () => undefined,
      removeEventListener: () => undefined
    } as Record<string, unknown>,
    document: {
      body: {
        classList: {
          add: (name: string) => bodyClasses.add(name),
          remove: (name: string) => bodyClasses.delete(name)
        }
      },
      querySelectorAll: (selector: string) => selector === ".course-page" ? [route, otherPage] : [],
      addEventListener(type: string, handler: (event: Record<string, unknown>) => void) {
        if (type === "click") clickHandler = handler;
      }
    },
    readManualEvidenceNotes: () => [],
    writeManualEvidenceNotes: () => undefined,
    renderManualEvidenceBank: () => undefined
  };
  vm.runInNewContext(ENGLISH_EVIDENCE_BANK_RUNTIME, context);
  assert.ok(clickHandler, "runtime must install the delegated print handler");
  clickHandler?.({
    target: {
      closest: (selector: string) => selector === "[data-print-writing]" ? printButton : null
    },
    preventDefault: () => { prevented = true; }
  });

  assert.equal(prevented, true);
  assert.equal(printed, 1);
  assert.equal(route.hidden, false);
  assert.equal(otherPage.hidden, false);
  assert.equal(bodyClasses.has("english-evidence-printing"), false);
});

test("validates retrofit manifests and rejects failed selector reports disguised as placed", () => {
  const base = {
    schemaVersion: 1,
    retrofitVersion: "1.0.0",
    projectSlug: "ela30-1-short-stories",
    courseCode: "ELA 30-1",
    courseTitle: "Short Stories",
    profile: "short-fiction",
    storageKey: "canvas-helper:ela30-1-short-stories:manual-evidence-notes",
    route: {
      id: "evidence-bank",
      label: "Evidence Bank",
      icon: "library_books",
      links: [{ id: "story-questions", label: "Short Story Questions", icon: "quiz" }]
    },
    selectorsRequired: ["[data-response-collection]"],
    adapters: [
      {
        id: "story-question-collection",
        kind: "collection",
        route: "story-questions",
        rootSelector: "[data-response-collection]",
        saveSelector: "[data-save-response-collection]",
        contributionId: "ela30-1-short-stories:questions:{work}",
        source: { kind: "question-set", id: "story-questions", title: "Short Story Questions" },
        activity: { id: "story-questions", profile: "short-fiction", title: "Short Story Questions" },
        questionSelector: "[data-evidence-question-number]",
        tags: ["short-fiction"]
      }
    ],
    sourceSha256: "a".repeat(64),
    outputSha256: "b".repeat(64),
    appliedAt: "2026-07-20T12:00:00-06:00",
    selectorChecks: [
      {
        selector: "[data-response-collection]",
        adapterId: "story-question-collection",
        count: 1,
        status: "placed"
      }
    ]
  };

  assert.equal(EnglishEvidenceBankRetrofitV1Schema.safeParse(base).success, true);
  assert.equal(
    EnglishEvidenceBankRetrofitV1Schema.safeParse({
      ...base,
      selectorChecks: [{ ...base.selectorChecks[0], count: 0, status: "placed" }]
    }).success,
    false
  );
  assert.equal(
    EnglishEvidenceBankRetrofitV1Schema.safeParse({
      ...base,
      selectorsRequired: [],
      adapters: [],
      selectorChecks: []
    }).success,
    false,
    "an empty retrofit manifest must not be accepted as a completed injection"
  );
  assert.equal(
    EnglishEvidenceBankRetrofitV1Schema.safeParse({
      ...base,
      selectorChecks: [{ ...base.selectorChecks[0], count: 0, status: "failed" }]
    }).success,
    false,
    "completed retrofit reports must not contain failed selector checks"
  );
});
