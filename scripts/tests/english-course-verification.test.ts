import assert from "node:assert/strict";
import test from "node:test";

import { validateProjectContract } from "../../e2e/lib/project-contract-schema.js";
import {
  inspectEla10CourseVoice,
  inspectE2EContractDepth,
  inspectLegacyEvidenceWorkspace,
  inspectLearnerHtml,
  inspectMappingReport,
  inspectV3MaterialsOutput,
  inspectV3WritingFormOutput,
  inspectWritingNavigationRoutes,
  parseLegacyWorkspaceCourseManifest
} from "../verify-english-course.js";

test("ELA 10-1 course voice keeps conversion provenance out of learner text", () => {
  const contaminated = inspectEla10CourseVoice(`<html><body><p>The CBE lessons use teacher-selected texts.</p><h2>Source Resources</h2></body></html>`);
  assert.equal(contaminated.status, "failed");

  const clean = inspectEla10CourseVoice(`<html><body><p>These lessons use the assigned texts.</p><h2>Resources</h2></body></html>`);
  assert.equal(clean.status, "passed");
});

function byId(checks: ReturnType<typeof inspectLearnerHtml>, id: string) {
  return checks.find((check) => check.id === id);
}

test("writing navigation audit accepts current family subgroups and legacy nav groups", () => {
  const routes = ["critical-essay", "critical-essay-topic", "critical-essay-introduction", "critical-essay-body-one", "critical-essay-body-two", "critical-essay-body-three", "critical-essay-conclusion", "critical-essay-preview"];
  const links = routes.map((route) => `<a data-page-target="${route}"></a>`).join("");
  assert.deepEqual(
    inspectWritingNavigationRoutes(`<nav><div data-ela-nav-subgroup="critical-essay">${links}</div></nav>`, "critical-essay"),
    routes
  );
  assert.deepEqual(
    inspectWritingNavigationRoutes(`<nav><div data-nav-group="critical-essay"><div id="critical-essay-subnav">${links}</div></div></nav>`, "critical-essay"),
    routes
  );
});

test("learner audit catches Unicode grade/exam wording, Student Samples, alt gaps, and empty resource surfaces", () => {
  const checks = inspectLearnerHtml(`<!doctype html><html><body>
    <section id="resources"><h2>Resources</h2><p>No materials yet.</p></section>
    <section><h2>Student Samples</h2><p>Prepare at the English Language Arts 30–1 level for the Diploma Exam, Part A.</p></section>
    <img src="missing-alt.jpg"><img src="empty-alt.jpg" alt="">
  </body></html>`, ["resources"]);

  assert.equal(byId(checks, "grade-exam-contamination")?.status, "failed");
  assert.equal(byId(checks, "student-samples-review")?.status, "warning");
  assert.equal(byId(checks, "image-alt-text")?.status, "warning");
  assert.equal(byId(checks, "required-resource-surfaces")?.status, "failed");
});

test("learner audit accepts a clean populated resource surface", () => {
  const checks = inspectLearnerHtml(`<!doctype html><html><body>
    <section id="resources"><h2>Resources</h2><a href="reading.pdf">Open reading</a></section>
    <img src="cover.jpg" alt="Cover of the assigned text">
  </body></html>`, ["resources"]);

  assert.equal(byId(checks, "grade-exam-contamination")?.status, "passed");
  assert.equal(byId(checks, "student-samples-review")?.status, "passed");
  assert.equal(byId(checks, "image-alt-text")?.status, "passed");
  assert.equal(byId(checks, "required-resource-surfaces")?.status, "passed");
  assert.equal(byId(checks, "lms-delivery-copy")?.status, "passed");
});

test("learner audit accepts truthful access guidance when no packaged material is required", () => {
  const checks = inspectLearnerHtml(`<!doctype html><html><body>
    <section id="materials"><p class="english-material-access-note">Use the assigned or school-licensed copy while completing these activities.</p></section>
  </body></html>`, ["materials"]);

  assert.equal(byId(checks, "required-resource-surfaces")?.status, "passed");
});

test("learner audit blocks inherited Brightspace delivery instructions", () => {
  const checks = inspectLearnerHtml(`<html><body>
    <p>Make sure to access the assignment prior to reading.</p>
    <p>Click the link to watch the video.</p>
    <p>This link opens in a new window/tab.</p>
  </body></html>`);
  assert.equal(byId(checks, "lms-delivery-copy")?.status, "failed");
});

test("grade contamination audit recognizes ASCII and Unicode 30-1 dashes", () => {
  for (const wording of ["ELA 30-1", "ELA 30–1", "English Language Arts 30‐1"]) {
    const checks = inspectLearnerHtml(`<html><body><p>${wording}</p></body></html>`);
    assert.equal(byId(checks, "grade-exam-contamination")?.status, "failed", wording);
  }
});

const v3WritingRoutes = {
  "literary-exploration": [
    "literary-exploration",
    "literary-exploration-prompt-controlling-idea",
    "literary-exploration-introduction-thesis",
    "literary-exploration-body-assigned-text",
    "literary-exploration-body-studied-work",
    "literary-exploration-body-personal-connection",
    "literary-exploration-conclusion-revision",
    "literary-exploration-preview"
  ],
  "personal-response": [
    "personal-response",
    "personal-response-prompt-impression",
    "personal-response-text-evidence",
    "personal-response-knowledge-experience",
    "personal-response-form-perspective",
    "personal-response-response-plan",
    "personal-response-draft-revise",
    "personal-response-preview"
  ],
  "visual-response": [
    "visual-response",
    "visual-response-observe",
    "visual-response-paces",
    "visual-response-central-idea",
    "visual-response-prose-form",
    "visual-response-draft",
    "visual-response-conclusion-revision",
    "visual-response-preview"
  ]
} as const;

function v3WritingFixture(kinds: Array<keyof typeof v3WritingRoutes>, extra = "") {
  return `<!doctype html><html><body><aside>${kinds.map((kind) => `<div data-nav-group="${kind}">${v3WritingRoutes[kind].map((route) => `<a data-page-target="${route}"></a>`).join("")}</div>`).join("")}</aside><main>${kinds.flatMap((kind) => v3WritingRoutes[kind]).map((route) => `<section id="${route}"></section>`).join("")}</main>${extra}</body></html>`;
}

function v3WritingFixtureWithToggle(kinds: Array<keyof typeof v3WritingRoutes>) {
  return `<!doctype html><html><body><aside>${kinds.map((kind) => `<div data-nav-group="${kind}"><a data-nav-group-toggle data-page-target="${v3WritingRoutes[kind][0]}"></a>${v3WritingRoutes[kind].map((route) => `<a data-page-target="${route}"></a>`).join("")}</div>`).join("")}</aside><main>${kinds.flatMap((kind) => v3WritingRoutes[kind]).map((route) => `<section id="${route}"></section>`).join("")}</main></body></html>`;
}

test("V3 writing audit enforces exact -2 form routes and recipe order", () => {
  const forms = [
    { kind: "literary-exploration" as const, trackMode: "per-work" as const },
    { kind: "personal-response" as const, trackMode: "per-work" as const }
  ];
  const clean = inspectV3WritingFormOutput(v3WritingFixture(forms.map((form) => form.kind)), {
    courseCode: "ELA 20-2",
    writingForms: forms
  });
  assert.equal(clean.filter((check) => check.status === "failed").length, 0);

  const wrongOrder = inspectV3WritingFormOutput(v3WritingFixture(["personal-response", "literary-exploration"]), {
    courseCode: "ELA 20-2",
    writingForms: forms
  });
  assert.equal(wrongOrder.find((check) => check.id === "v3-writing-form-order")?.status, "failed");
  assert.equal(wrongOrder.find((check) => check.id === "v3-writing-page-order")?.status, "failed");

  const withGroupToggles = inspectV3WritingFormOutput(v3WritingFixtureWithToggle(forms.map((form) => form.kind)), {
    courseCode: "ELA 20-2",
    writingForms: forms
  });
  assert.equal(withGroupToggles.find((check) => check.id === "v3-writing-route-order")?.status, "passed");

  const familyNavigation = inspectV3WritingFormOutput(
    v3WritingFixture(forms.map((form) => form.kind)).replaceAll("data-nav-group=", "data-ela-nav-subgroup="),
    { courseCode: "ELA 20-2", writingForms: forms }
  );
  assert.equal(familyNavigation.find((check) => check.id === "v3-writing-route-order")?.status, "passed");
  assert.equal(familyNavigation.find((check) => check.id === "v3-writing-form-order")?.status, "passed");
});

test("V3 writing audit blocks Critical Essay runtime leakage and scopes Visual Response to ELA 30-2", () => {
  const twentyTwoForms = [
    { kind: "literary-exploration" as const, trackMode: "unit" as const },
    { kind: "personal-response" as const, trackMode: "unit" as const }
  ];
  const criticalLeak = inspectV3WritingFormOutput(
    v3WritingFixture(["literary-exploration", "personal-response"], `<script>const retired = "critical-essay";</script>`),
    { courseCode: "ELA 20-2", writingForms: twentyTwoForms }
  );
  assert.equal(criticalLeak.find((check) => check.id === "v3-no-critical-essay")?.status, "failed");

  const thirtyTwoForms = [
    ...twentyTwoForms,
    { kind: "visual-response" as const, trackMode: "per-work" as const }
  ];
  const visual = inspectV3WritingFormOutput(
    v3WritingFixture(["literary-exploration", "personal-response", "visual-response"]),
    { courseCode: "ELA 30-2", writingForms: thirtyTwoForms }
  );
  assert.equal(visual.find((check) => check.id === "v3-visual-response-scope")?.status, "passed");
});

test("ELA 30-2 may include a concise Diploma connection without permitting donor or Part A language", () => {
  const allowed = inspectLearnerHtml(`<!doctype html><html><body><main>
    <p>ELA 30-2 Diploma connection: use the current prompt and suggested response length.</p>
  </main></body></html>`, [], { allowThirtyTwoDiplomaConnection: true });
  assert.equal(allowed.find((check) => check.id === "grade-exam-contamination")?.status, "passed");

  const blocked = inspectLearnerHtml(`<!doctype html><html><body><main>
    <p>ELA 30-1 Part A directions.</p>
  </main></body></html>`, [], { allowThirtyTwoDiplomaConnection: true });
  assert.equal(blocked.find((check) => check.id === "grade-exam-contamination")?.status, "failed");
});

test("V3 materials audit keeps packaged files in Materials and permits external-only Resources", () => {
  const recipe = {
    activityProfile: {
      schemaVersion: 1 as const,
      kind: "writing-foundations" as const,
      activities: [{ id: "materials", title: "Materials", route: "materials", enabled: true, evidencePolicyIds: [] }],
      evidencePolicies: []
    },
    resourceDispositions: [{
      id: "learner-guide",
      source: "teacher-resources://learner-guide.pdf",
      title: "Learner Guide",
      role: "supporting-resource" as const,
      disposition: "place" as const,
      destination: "materials",
      reason: "Assigned course document."
    }]
  };
  const clean = inspectV3MaterialsOutput(`<!doctype html><html><body>
    <section id="materials"><a href="assets/learner-guide.pdf">Open guide</a></section>
    <section id="resources"><a href="https://example.com/support">Open support</a></section>
  </body></html>`, recipe);
  assert.equal(clean.filter((check) => check.status === "failed").length, 0);

  const localResourceLeak = inspectV3MaterialsOutput(`<!doctype html><html><body>
    <section id="materials"><a href="assets/learner-guide.pdf">Open guide</a></section>
    <section id="resources"><a href="assets/duplicate-guide.pdf">Open duplicate</a></section>
  </body></html>`, recipe);
  assert.equal(localResourceLeak.find((check) => check.id === "v3-optional-resources-route")?.status, "failed");

  const canonicalResourcesRecipe = {
    ...recipe,
    activityProfile: {
      ...recipe.activityProfile,
      activities: [{ id: "resources", title: "Resources", route: "resources", enabled: true, evidencePolicyIds: [] }]
    }
  };
  const canonicalResources = inspectV3MaterialsOutput(`<!doctype html><html><body>
    <section id="resources"><a href="assets/learner-guide.pdf">Open guide</a></section>
  </body></html>`, canonicalResourcesRecipe);
  assert.equal(canonicalResources.filter((check) => check.status === "failed").length, 0);
});

test("mapping audit blocks missing resources while archival link failures remain informational", () => {
  const checks = inspectMappingReport({
    schemaVersion: 1,
    projectSlug: "fixture",
    generatedAt: "2026-07-14T12:00:00.000Z",
    selectedUnit: { identifier: "1", title: "Fixture", lessonCount: 1 },
    summary: { placed: 1, excluded: 1, missing: 1, duplicate: 0, corrected: 0, failed: 1 },
    items: [
      { role: "lesson", source: "lesson.html", status: "placed", note: "Placed." },
      { role: "excluded-assessment", source: "hard-gate.pdf", status: "excluded", note: "Intentional exclusion." },
      { role: "reading", source: "reading.pdf", status: "missing", note: "Absent." },
      { role: "supporting-resource", source: "https://example.invalid", status: "failed", note: "Failed live check." }
    ]
  });

  assert.equal(checks.find((check) => check.id === "mapping-summary")?.status, "passed");
  assert.equal(checks.find((check) => check.id === "mapping-missing")?.status, "failed");
  assert.equal(checks.find((check) => check.id === "mapping-failed")?.status, "passed");
});

test("E2E depth audit rejects shell-only contracts and accepts deep behavioral targets", () => {
  const shallow = validateProjectContract({
    projectSlug: "shallow",
    requiredTestIds: ["studio-shell"],
    navigation: { enabled: false }
  }, "shallow.json");
  assert.equal(inspectE2EContractDepth(shallow).status, "failed");

  const deep = validateProjectContract({
    projectSlug: "deep",
    navigation: { enabled: true },
    assertionProfiles: { lesson: { checks: ["renderer-html", "node-nav"] } },
    modulePassTargets: [
      { moduleTitle: "Unit", itemTitle: "Lesson", assertionProfile: "lesson" }
    ]
  }, "deep.json");
  assert.equal(inspectE2EContractDepth(deep).status, "passed");

  const learnerDeep = validateProjectContract({
    projectSlug: "learner-deep",
    learnerCourse: {
      enabled: true,
      routes: ["overview", "questions", "resources"],
      hintRoutes: ["questions"],
      printRoutes: ["questions"],
      evidenceScenario: {
        route: "questions",
        collectionId: "learner-deep:questions:collection",
        responseId: "learner-deep:questions:answer"
      },
      resourceChecks: [{ route: "resources", kind: "access-notice", minimumPrimary: 1 }],
      mobile: { width: 390, height: 844, routes: ["overview", "questions", "resources"] }
    }
  }, "learner-deep.json");
  assert.equal(inspectE2EContractDepth(learnerDeep).status, "passed");
});

test("E2E contracts accept plural collection and individual Evidence Bank scenarios", () => {
  const contract = validateProjectContract({
    projectSlug: "legacy-unit",
    learnerCourse: {
      enabled: true,
      routes: ["overview", "questions", "writing", "evidence-bank"],
      hintRoutes: [],
      printRoutes: [],
      evidenceScenarios: [
        {
          kind: "collection",
          route: "questions",
          collectionId: "legacy-unit:questions:collection",
          responseId: "legacy-unit:questions:one"
        },
        {
          kind: "individual",
          route: "writing",
          captureId: "writing-note",
          contributionId: "legacy-unit:writing:note",
          responseId: "legacy-unit:writing:detail",
          preserveResponseOnSave: false
        }
      ],
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", "evidence-bank"] }
    }
  }, "legacy-unit.json", { requireDeepTargets: true });

  assert.equal(contract.learnerCourse?.enabled, true);
  assert.equal(inspectE2EContractDepth(contract).status, "passed");
  assert.match(inspectE2EContractDepth(contract).detail, /2 Evidence Bank persistence scenario/);
});

test("legacy workspace evidence audit requires route, API, filters, tracked storage, and both save granularities", () => {
  const contract = validateProjectContract({
    projectSlug: "legacy-unit",
    learnerCourse: {
      enabled: true,
      routes: ["overview", "questions", "writing", "evidence-bank"],
      hintRoutes: [],
      printRoutes: [],
      evidenceScenarios: [
        {
          route: "questions",
          collectionId: "legacy-unit:questions:collection",
          responseId: "legacy-unit:questions:one"
        },
        {
          kind: "individual",
          route: "writing",
          captureId: "writing-note",
          contributionId: "legacy-unit:writing:note",
          responseId: "legacy-unit:writing:detail"
        }
      ],
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", "evidence-bank"] }
    }
  }, "legacy-unit.json");
  const html = `<!doctype html><html><body>
    <header class="course-topbar"></header>
    <aside class="course-sidebar"><nav class="course-nav"><a data-page-target="evidence-bank"></a></nav></aside>
    <section id="overview"></section>
    <section id="questions"><article data-evidence-collection-id="legacy-unit:questions:collection">
      <textarea data-response-id="legacy-unit:questions:one"></textarea>
      <button class="evidence-bank-save-action" data-save-response-collection></button>
    </article></section>
    <section id="writing"><article data-evidence-capture="writing-note" data-evidence-contribution-id="legacy-unit:writing:note">
      <textarea data-response-id="legacy-unit:writing:detail"></textarea>
      <button class="evidence-bank-save-action" data-save-evidence-note></button>
    </article></section>
    <section id="evidence-bank">
      <select data-evidence-bank-filter="activity"></select>
      <select data-evidence-bank-filter="work"></select>
      <select data-evidence-bank-filter="locator"></select>
      <select data-evidence-bank-filter="type"></select>
    </section>
    <script>
      const manualEvidenceStorageKey = "canvas-helper:legacy-unit:manual-evidence-notes";
      function upsertEvidenceEntry() {}
      function removeEvidenceEntry() {}
      function listEvidenceEntries() {}
      window.nextStepEvidenceBank = { upsert: upsertEvidenceEntry, remove: removeEvidenceEntry, list: listEvidenceEntries };
    </script>
  </body></html>`;

  const clean = inspectLegacyEvidenceWorkspace({ html, projectSlug: "legacy-unit", contract });
  assert.equal(clean.filter((check) => check.status === "failed").length, 0);

  const contaminated = inspectLegacyEvidenceWorkspace({
    html: html
      .replace("canvas-helper:legacy-unit:manual-evidence-notes", "wrong-key")
      .replace('data-evidence-capture="writing-note"', 'data-evidence-capture="wrong-note"'),
    projectSlug: "legacy-unit",
    contract
  });
  assert.equal(contaminated.find((check) => check.id === "evidence-storage-key")?.status, "failed");
  assert.equal(contaminated.find((check) => check.id === "evidence-scenario-2-individual-hooks")?.status, "failed");
});

test("legacy workspace evidence audit resolves controls injected by the retrofit runtime", () => {
  const contract = validateProjectContract({
    projectSlug: "legacy-runtime",
    learnerCourse: {
      enabled: true,
      routes: ["overview", "questions", "writing", "evidence-bank"],
      hintRoutes: [],
      printRoutes: [],
      evidenceScenarios: [
        {
          kind: "collection",
          route: "questions",
          collectionId: "legacy-runtime:questions:first",
          responseId: "legacy-runtime:questions:one"
        },
        {
          kind: "individual",
          route: "writing",
          captureId: "writing-note",
          contributionId: "legacy-runtime:writing:first",
          responseId: "legacy-runtime:evidence-composer:writing-note:detail",
          activateSelector: '[data-dynamic-work] option[value="First Work"]'
        }
      ],
      resourceChecks: [],
      mobile: { width: 390, height: 844, routes: ["overview", "evidence-bank"] }
    }
  }, "legacy-runtime.json");
  const html = `<!doctype html><html><head><style>
    .english-evidence-activity-actions [data-save-response-collection],
    .english-evidence-activity-actions [data-save-evidence-note] { background: #154212; }
  </style></head><body>
    <header class="course-topbar"></header>
    <aside class="course-sidebar"><nav class="course-nav"><a data-page-target="evidence-bank"></a></nav></aside>
    <section id="overview"></section>
    <section id="questions"><textarea data-response-id="legacy-runtime:questions:one"></textarea></section>
    <section id="writing"><select data-dynamic-work></select></section>
    <section id="evidence-bank">
      <select data-evidence-bank-filter="activity"></select>
      <select data-evidence-bank-filter="work"></select>
      <select data-evidence-bank-filter="locator"></select>
      <select data-evidence-bank-filter="type"></select>
      <button class="evidence-bank-save-action" data-save-evidence-note></button>
    </section>
    <script>
      const manualEvidenceStorageKey = "canvas-helper:legacy-runtime:manual-evidence-notes";
      function upsertEvidenceEntry() {}
      function removeEvidenceEntry() {}
      function listEvidenceEntries() {}
      window.nextStepEvidenceBank = { upsert: upsertEvidenceEntry, remove: removeEvidenceEntry, list: listEvidenceEntries };
    </script>
    <script data-ela30-evidence-retrofit-runtime>
      const config = {"projectSlug":"legacy-runtime","adapters":[{"id":"question-collection","kind":"collection","route":"questions","collectionIdTemplate":"legacy-runtime:questions:{active}"},{"id":"writing-note","kind":"individual-composer","route":"writing","collectionIdTemplate":"legacy-runtime:writing:{active}","activeSelector":"[data-dynamic-work]"}]};
      const fallbackStorage = {};
      const adapterMarkup = 'data-evidence-retrofit-adapter="" data-evidence-capture data-evidence-contribution-id data-save-response-collection data-save-evidence-note';
    </script>
  </body></html>`;

  const checks = inspectLegacyEvidenceWorkspace({ html, projectSlug: "legacy-runtime", contract });
  assert.equal(checks.filter((check) => check.status === "failed").length, 0);
  assert.match(checks.find((check) => check.id === "evidence-scenario-1-collection-hooks")?.detail ?? "", /runtime-configured/);
  assert.match(checks.find((check) => check.id === "evidence-scenario-2-individual-hooks")?.detail ?? "", /runtime-configured/);

  const malformed = inspectLegacyEvidenceWorkspace({
    html: html.replace(
      "const fallbackStorage = {};",
      "const broken = 'line one\nline two';\nconst fallbackStorage = {};"
    ),
    projectSlug: "legacy-runtime",
    contract
  });
  assert.equal(malformed.find((check) => check.id === "evidence-runtime-syntax")?.status, "failed");
});

test("legacy workspace family manifest is explicit and rejects duplicate projects", () => {
  const raw = {
    schemaVersion: 1,
    sourceMode: "legacy-workspace",
    courseId: "ela30-1",
    courseCode: "ELA 30-1",
    courseTitle: "English Language Arts 30-1",
    profileVersion: "next-step-english-evidence-v1",
    units: [{
      projectSlug: "ela30-1-short-stories",
      unitTitle: "Short Stories",
      activityProfile: "short-fiction",
      profileVersion: "next-step-english-evidence-v1",
      reviewStatus: "needs-review"
    }]
  };
  assert.equal(parseLegacyWorkspaceCourseManifest(raw).units.length, 1);
  assert.throws(
    () => parseLegacyWorkspaceCourseManifest({ ...raw, units: [raw.units[0], raw.units[0]] }),
    /project slugs must be unique/
  );
});
