import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { ensureDir, fileExists, readJsonFile, removePath, writeJsonFile } from "../lib/fs.js";
import { getProjectPaths } from "../lib/paths.js";
import type { AssessmentModel, CourseModel, CoverageReport, SourceChunk, SourceMapModel } from "../lib/conversion/types.js";
import {
  buildHss1010SourceArtifacts,
  convertHss1010Project,
  enrichHss1010CourseWithSourceSupplements,
  extractHss1010ModelsFromHtml,
  renderHss1010WorkspaceShell
} from "../lib/conversion/hss1010.js";
import { cleanupProjectFixture, createProjectFixture } from "./helpers/project-fixture.js";

const FIXTURE_HTML = `
<!doctype html>
<html>
  <body>
    <div id="view-study" class="main-view active">
      <div class="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto mb-8">
        <button id="btn-study-start">00 Source PDF</button>
        <button id="btn-study-wellness">01 Wellness</button>
      </div>
      <div id="start" class="section-content active space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Course Source Material</h2>
          <div class="read-block">
            <h3>How to use this Digital Booklet</h3>
            <p>Use the tabs to learn.</p>
          </div>
          <div class="image-box">
            <iframe src="https://example.com/course.pdf"></iframe>
          </div>
        </div>
      </div>
      <div id="wellness" class="section-content space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Section 1: Defining Health &amp; Wellness</h2>
          <div class="ref-note">Refer to source diagrams.</div>
          <div class="read-block">
            <h3>Definitions</h3>
            <p>Wellness is an active process.</p>
          </div>
        </div>
      </div>
    </div>
    <div id="view-assess" class="main-view">
      <div class="flex flex-wrap gap-2 mb-6">
        <button id="btn-sec1">Section 1</button>
      </div>
      <div id="sec1" class="assess-tab active">
        <h2>Section 1: Defining Health (2 Marks)</h2>
        <div class="question-box">
          <span class="question-title">1. Wellness Wheel</span>
          <p class="text-sm mb-2">Choose the best answer</p>
          <select class="auto-grade" data-correct="B">
            <option value="">Select...</option>
            <option value="A">Incorrect</option>
            <option value="B">Correct</option>
          </select>
        </div>
        <div class="question-box">
          <span class="question-title">2. Homeostasis</span>
          <label><input type="checkbox" class="cb-grade" value="yes"> Body temperature</label>
          <label><input type="checkbox" class="cb-grade" value="no"> Hair color</label>
        </div>
      </div>
    </div>
  </body>
</html>
`;

const RICH_FIXTURE_HTML = `
<!doctype html>
<html>
  <body>
    <div id="view-study" class="main-view active">
      <div class="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto mb-8">
        <button id="btn-study-start">00 Source PDF</button>
        <button id="btn-study-wellness">01 Wellness</button>
        <button id="btn-study-anatomy">02 Anatomy</button>
        <button id="btn-study-public">04 Public Health</button>
      </div>
      <div id="start" class="section-content active space-y-8">
        <div class="glass p-8 rounded-2xl">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-700 pb-6">
            <div>
              <h2 class="text-3xl font-black uppercase italic tracking-tight text-white">Course Source Material</h2>
              <p class="text-slate-400 text-sm mt-2">The official source text for this course.</p>
            </div>
            <a href="https://example.com/course.pdf" target="_blank" class="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 rounded shadow transition-all">
              Open Full PDF in New Tab
            </a>
          </div>
          <div class="read-block border-l-4 border-emerald-500">
            <h3>How to use this Digital Booklet</h3>
            <p>The tabs above contain the organized text and study notes required to complete your assessment.</p>
          </div>
          <div class="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
            <iframe src="https://example.com/preview" width="100%" height="100%" allow="autoplay"></iframe>
          </div>
        </div>
      </div>
      <div id="wellness" class="section-content space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Section 1: Defining Health &amp; Wellness</h2>
          <div class="ref-note">Refer to the dimensions diagrams in the source booklet.</div>
          <div class="read-block">
            <h3>The 5 Dimensions of Wellness</h3>
            <p class="mb-4">Wellness demonstrates the need for balanced lives.</p>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="info-card"><h4>Physical</h4><p class="text-sm">Healthy movement and care of the body.</p></div>
              <div class="info-card"><h4>Intellectual</h4><p class="text-sm">Critical and creative use of the mind.</p></div>
            </div>
          </div>
          <div class="q-box"><span class="q-question">Are energy drinks safe?</span><p>Consume only according to label instructions.</p></div>
        </div>
      </div>
      <div id="anatomy" class="section-content space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Section 2: Inside Out - How the Body Works</h2>
          <div class="ref-note">Refer to the detailed system diagrams in the full course booklet.</div>
          <div class="read-block">
            <h3>The 11 Human Body Systems</h3>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="anatomy-card"><strong>Integumentary</strong><p class="text-xs mt-1">Protects the body.</p></div>
              <div class="anatomy-card"><strong>Nervous</strong><p class="text-xs mt-1">Coordinates activity.</p></div>
            </div>
          </div>
          <table class="term-table">
            <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
            <tbody><tr><td>Anatomy</td><td>Study of structure.</td></tr></tbody>
          </table>
        </div>
      </div>
      <div id="public" class="section-content space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>4. Public Health</h2>
          <div class="warning-card"><strong>False Claims</strong><p class="text-xs mt-2">Investigate health-product promises carefully.</p></div>
        </div>
      </div>
    </div>
    <div id="view-assess" class="main-view">
      <div class="flex flex-wrap gap-2 mb-6">
        <button id="btn-sec1">Section 1</button>
      </div>
      <div id="sec1" class="assess-tab active">
        <h2>Section 1: Defining Health (1 Mark)</h2>
        <div class="question-box">
          <span class="question-title">1. Wellness Wheel</span>
          <p class="text-sm mb-2">Choose the best answer</p>
          <select class="auto-grade" data-correct="B">
            <option value="">Select...</option>
            <option value="A">Incorrect</option>
            <option value="B">Correct</option>
          </select>
        </div>
      </div>
    </div>
  </body>
</html>
`;

const INTERACTIVE_WELLNESS_FIXTURE_HTML = `
<!doctype html>
<html>
  <body>
    <div id="view-study" class="main-view active">
      <div class="flex bg-slate-900/50 p-1 rounded-lg border border-slate-800 overflow-x-auto mb-8">
        <button id="btn-study-start">00 Source PDF</button>
        <button id="btn-study-wellness">01 Wellness</button>
      </div>
      <div id="start" class="section-content active space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Course Source Material</h2>
          <div class="read-block">
            <h3>How to use this Digital Booklet</h3>
            <p>Open the source when you need diagrams, but use the study tabs to learn.</p>
          </div>
          <div class="image-box">
            <iframe src="https://example.com/course.pdf"></iframe>
          </div>
        </div>
      </div>
      <div id="wellness" class="section-content space-y-8">
        <div class="glass p-8 rounded-2xl">
          <h2>Section 1: Defining Health &amp; Wellness</h2>
          <div class="ref-note">Refer to the source diagrams when you need the visual wellness wheel.</div>
          <div class="read-block border-l-4 border-l-blue-500">
            <h3>Definitions</h3>
            <p><strong>Health:</strong> A state of complete physical, mental, and social well-being.</p>
            <p><strong>Wellness:</strong> An active process of becoming aware and making choices toward a more successful existence.</p>
          </div>
          <div class="read-block">
            <h3>The 5 Dimensions of Wellness</h3>
            <p class="mb-4">Balanced lives require attention to all five dimensions.</p>
            <div class="grid md:grid-cols-2 gap-4">
              <div class="info-card"><h4>Physical</h4><p class="text-sm">Movement, nutrition, sleep, and care of the body.</p></div>
              <div class="info-card"><h4>Intellectual</h4><p class="text-sm">Curiosity, creativity, learning, and perspective taking.</p></div>
              <div class="info-card"><h4>Social</h4><p class="text-sm">Communication, respect, and healthy relationships.</p></div>
              <div class="info-card"><h4>Spiritual</h4><p class="text-sm">Meaning, values, beliefs, and purpose.</p></div>
              <div class="info-card"><h4>Emotional</h4><p class="text-sm">Self-awareness, support, and constructive expression of feelings.</p></div>
            </div>
          </div>
          <div class="read-block">
            <h3>The 12 Determinants of Health</h3>
            <ol class="list-decimal list-inside space-y-4 text-slate-300">
              <li><strong>Income and Social Status:</strong> Shapes housing, food access, and opportunity.</li>
              <li><strong>Social Support Networks:</strong> Support from family, peers, and community buffers stress.</li>
              <li><strong>Education and Literacy:</strong> Builds problem solving and helps people understand health information.</li>
              <li><strong>Employment/Working Conditions:</strong> Safe, stable work improves health.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div id="view-assess" class="main-view">
      <div class="flex flex-wrap gap-2 mb-6">
        <button id="btn-sec1">Section 1</button>
      </div>
      <div id="sec1" class="assess-tab active">
        <h2>Section 1: Defining Health (1 Mark)</h2>
        <div class="question-box">
          <span class="question-title">1. Wellness Wheel</span>
          <p class="text-sm mb-2">Choose the best answer</p>
          <select class="auto-grade" data-correct="B">
            <option value="">Select...</option>
            <option value="A">Incorrect</option>
            <option value="B">Correct</option>
          </select>
        </div>
      </div>
    </div>
  </body>
</html>
`;

const SAMPLE_SOURCE_CHUNKS: SourceChunk[] = [
  {
    id: "chunk-1",
    index: 1,
    page: 1,
    text: "Course Source Material and wellness diagrams."
  },
  {
    id: "chunk-2",
    index: 2,
    page: 2,
    text: "Section 1 defining health and wellness outcomes."
  },
  {
    id: "chunk-3",
    index: 3,
    page: 3,
    text: "Public health agencies and system roles."
  }
];

const WELLNESS_SUPPLEMENT_CHUNKS: SourceChunk[] = [
  {
    id: "intro-page",
    index: 1,
    page: 3,
    text: "INTRODUCTION\nCourse overview and guiding questions."
  },
  {
    id: "section-1-page",
    index: 2,
    page: 5,
    text: "SECTION 1 - DEFINING HEALTH AND WELLNESS\nDefinitions and outcomes."
  },
  {
    id: "section-1-page-6",
    index: 3,
    page: 6,
    text: "Dimensions of Health and Wellness\nThe dimensions are interdependent and constantly interact with each other."
  },
  {
    id: "section-1-page-7",
    index: 4,
    page: 7,
    text: "PHYSICAL\nMove effectively, sleep well, and care for your body.\nINTELLECTUAL\nStay curious and keep learning.\nSOCIAL\nBuild healthy relationships and communicate with respect."
  },
  {
    id: "section-1-page-8",
    index: 5,
    page: 8,
    text: "SPIRITUAL\nConnect your values to your daily actions.\nEMOTIONAL\nRecognize, understand, and express feelings constructively."
  },
  {
    id: "section-1-page-9",
    index: 6,
    page: 9,
    text: "What Determines Health?\nThe Public Health Agency of Canada identifies twelve key determinants of health.\nKEY DETERMINANT - 1. Income and Social Status\nKEY DETERMINANT - 2. Social Support Networks\nKEY DETERMINANT - 3. Education and Literacy"
  },
  {
    id: "section-1-page-10",
    index: 7,
    page: 10,
    text: "KEY DETERMINANT - 4. Employment/Working Conditions\nKEY DETERMINANT - 5. Social Environments\nKEY DETERMINANT - 6. Physical Environments"
  }
];

test("extractHss1010ModelsFromHtml returns tabbed course and assessment models", () => {
  const { course, assessment } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  assert.equal(course.slug, "hss1010");
  assert.equal(course.sections.length, 2);
  assert.equal(course.sections[0]?.id, "start");
  assert.equal(course.sections[1]?.id, "wellness");
  assert.equal(course.sections[1]?.blocks.length > 0, true);
  assert.equal(assessment.sections.length, 1);
  assert.equal(assessment.sections[0]?.id, "sec1");
  assert.equal(assessment.sections[0]?.questions.length, 2);
  assert.equal(assessment.sections[0]?.questions[0]?.inputs[0]?.kind, "select");
  assert.equal(assessment.sections[0]?.questions[1]?.inputs[0]?.kind, "checkbox");
});

test("renderHss1010WorkspaceShell preserves rich legacy study skeleton markup", () => {
  const { course, assessment } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: RICH_FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const rendered = renderHss1010WorkspaceShell({
    projectSlug: "hss1010",
    course,
    assessment
  });

  assert.match(
    rendered.indexHtml,
    /<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-700 pb-6">/
  );
  assert.doesNotMatch(
    rendered.indexHtml,
    /<div class="read-block"><div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-slate-700 pb-6">/
  );
  assert.match(rendered.indexHtml, /<iframe src="https:\/\/example\.com\/preview"/);
  assert.match(rendered.indexHtml, /The 5 Dimensions of Wellness/);
  assert.match(rendered.indexHtml, /class="info-card"/);
  assert.match(rendered.indexHtml, /class="anatomy-card/);
  assert.match(rendered.indexHtml, /class="warning-card"/);
  assert.match(rendered.indexHtml, /class="q-box"/);
  assert.match(rendered.indexHtml, /data-study-activity="anatomy-movement-check"/);
  assert.match(rendered.indexHtml, /Anatomy Systems Studio/i);
  assert.match(rendered.indexHtml, /Section 2 Outcomes/i);
  assert.match(rendered.indexHtml, /Anatomy Guiding Questions/i);
  assert.match(rendered.indexHtml, /Movement Mechanics Check/i);
  assert.match(rendered.indexHtml, /Anatomy Assignment Handoff/i);
});

test("renderHss1010WorkspaceShell composes wellness into lesson, practice, and reflection flow", () => {
  const { course, assessment } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: INTERACTIVE_WELLNESS_FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-13T00:00:00.000Z"
  });

  const baselineArtifacts = buildHss1010SourceArtifacts({
    projectSlug: "hss1010",
    course,
    sourceReferenceId: "fixture-source",
    sourceChunks: WELLNESS_SUPPLEMENT_CHUNKS,
    generatedAt: "2026-03-13T00:00:00.000Z"
  });

  const enrichedCourse = enrichHss1010CourseWithSourceSupplements({
    course,
    sourceChunks: WELLNESS_SUPPLEMENT_CHUNKS,
    sourceTitle: "Fixture Source",
    baselineSourceMap: baselineArtifacts.sourceMap
  });

  const rendered = renderHss1010WorkspaceShell({
    projectSlug: "hss1010",
    course: enrichedCourse,
    assessment
  });

  assert.match(rendered.indexHtml, /Wellness Playbook/i);
  assert.match(rendered.indexHtml, /class="module-container hss-section-flow"/);
  assert.match(rendered.indexHtml, /class="practice-panel"/);
  assert.match(rendered.indexHtml, /Practice: Wellness Balance/i);
  assert.match(rendered.indexHtml, /data-persist-key="wellness-balance-reflection"/);
  assert.match(rendered.indexHtml, /data-persist-key="wellness-determinant-check-1"/);
  assert.match(rendered.indexHtml, /Determinant Insight Studio/i);
  assert.match(rendered.indexHtml, /Section 1 Outcomes/i);
  assert.match(rendered.indexHtml, /Guiding Questions/i);
  assert.match(rendered.indexHtml, /Determinants and Public Policy/i);
  assert.match(rendered.indexHtml, /Assignment Handoff/i);
  assert.doesNotMatch(rendered.indexHtml, /SolveSocialProblems/i);
  assert.doesNotMatch(rendered.indexHtml, /Course booklet page/i);
  assert.doesNotMatch(rendered.indexHtml, /Source supplement/i);
  assert.doesNotMatch(rendered.indexHtml, /Booklet support drawer/i);
  assert.doesNotMatch(rendered.indexHtml, /source-support-toggle/i);
  assert.match(rendered.runtimeJs, /data-persist-key/);
});

test("renderHss1010WorkspaceShell composes lifestyle into lesson, practice, and handoff flow", () => {
  const course: CourseModel = {
    courseId: "hss1010",
    slug: "hss1010",
    title: "HSS 1010",
    generatedAt: "2026-03-13T00:00:00.000Z",
    sourceTitle: "Fixture Source",
    sourcePdfUrl: null,
    sections: [
      {
        id: "lifestyle",
        tabLabel: "03 Lifestyle",
        title: "Section 3: Road Map to Wellness",
        blocks: [
          {
            id: "lifestyle-nutrition",
            type: "rawHtml",
            html: '<div class="read-block"><h3>Nutritional Choices (Canada\'s Food Guide)</h3><p>Eat well and hydrate.</p></div>',
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture Source",
              sourcePageStart: 34,
              sourcePageEnd: 34,
              sourceBlockId: "lifestyle-nutrition",
              conversionStatus: "converted",
              notes: []
            }
          },
          {
            id: "lifestyle-tools",
            type: "rawHtml",
            html: '<div class="read-block"><h3>Nutrition Tools for Schools</h3><p>Check source quality and claims.</p></div>',
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture Source",
              sourcePageStart: 35,
              sourcePageEnd: 35,
              sourceBlockId: "lifestyle-tools",
              conversionStatus: "converted",
              notes: []
            }
          },
          {
            id: "lifestyle-activity",
            type: "rawHtml",
            html: '<div class="read-block"><h3>Physical Activity Guidelines</h3><p>Youth 12-17 should move daily.</p></div>',
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture Source",
              sourcePageStart: 36,
              sourcePageEnd: 36,
              sourceBlockId: "lifestyle-activity",
              conversionStatus: "converted",
              notes: []
            }
          },
          {
            id: "lifestyle-safety",
            type: "rawHtml",
            html: '<div class="read-block"><h3>Q&A: Supplements & Safety</h3><p>Energy drinks and labels matter.</p></div>',
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture Source",
              sourcePageStart: 37,
              sourcePageEnd: 37,
              sourceBlockId: "lifestyle-safety",
              conversionStatus: "converted",
              notes: []
            }
          },
          {
            id: "lifestyle-supplement-proof",
            type: "rawHtml",
            html: '<div class="read-block"><h3>Supplemental Source Detail</h3><p>LIFESTYLE_SUPPLEMENT_PROOF full-detail-content must remain in section output.</p></div>',
            source: {
              sourceType: "pdf",
              sourceTitle: "Fixture Source",
              sourcePageStart: 44,
              sourcePageEnd: 44,
              sourceBlockId: "lifestyle-supplement-proof",
              conversionStatus: "converted",
              notes: ["source-supplement"]
            }
          }
        ]
      }
    ]
  };

  const assessment: AssessmentModel = {
    courseId: "hss1010",
    slug: "hss1010",
    title: "Assessment",
    generatedAt: "2026-03-13T00:00:00.000Z",
    sections: []
  };

  const rendered = renderHss1010WorkspaceShell({
    projectSlug: "hss1010",
    course,
    assessment
  });

  assert.match(rendered.indexHtml, /Lifestyle Action Lab/i);
  assert.match(rendered.indexHtml, /Fuel Decisions Lab/i);
  assert.match(rendered.indexHtml, /Movement Under Real Constraints/i);
  assert.match(rendered.indexHtml, /Supplement & Claim Forensics/i);
  assert.match(rendered.indexHtml, /Lifestyle Risk Tradeoff Simulator/i);
  assert.match(rendered.indexHtml, /Assignment Synthesis Studio/i);
  assert.match(rendered.indexHtml, /Section 3 Outcomes/i);
  assert.match(rendered.indexHtml, /Lifestyle Guiding Questions/i);
  assert.match(rendered.indexHtml, /Lifestyle Assignment Handoff/i);
  assert.match(rendered.indexHtml, /data-study-activity="lifestyle-fuel-check"/);
  assert.match(rendered.indexHtml, /data-study-activity="lifestyle-movement-plan"/);
  assert.match(rendered.indexHtml, /data-study-activity="lifestyle-claim-forensics"/);
  assert.match(rendered.indexHtml, /data-study-activity="lifestyle-risk-simulator"/);
  assert.match(rendered.indexHtml, /LIFESTYLE_SUPPLEMENT_PROOF/);
  assert.doesNotMatch(rendered.indexHtml, /Lifestyle Deep Content Library/i);
  assert.match(rendered.runtimeJs, /data-persist-key/);
});

test("convertHss1010Project applies the selected workbook benchmark to wellness source support", async () => {
  const slug = "test-hss1010-benchmark-selection";
  const paths = await createProjectFixture({
    slug,
    workspaceHtml: INTERACTIVE_WELLNESS_FIXTURE_HTML,
    workspaceFiles: {
      "main.js": "console.log('legacy');\n"
    }
  });

  const chunkManifestPath = path.join(paths.resourceExtractedDir, "fixture-source.chunks.json");
  await ensureDir(paths.resourceExtractedDir);
  await writeJsonFile(chunkManifestPath, {
    projectId: slug,
    referenceId: "fixture-source",
    generatedAt: "2026-03-13T00:00:00.000Z",
    chunks: WELLNESS_SUPPLEMENT_CHUNKS.map((chunk) => ({
      id: chunk.id,
      index: chunk.index,
      locator: {
        kind: "page",
        label: `Page ${chunk.page}`,
        page: chunk.page,
        startPage: chunk.page,
        endPage: chunk.page
      },
      text: chunk.text,
      keywordHints: []
    }))
  });

  await writeJsonFile(paths.resourceCatalogPath, {
    projectId: slug,
    generatedAt: "2026-03-13T00:00:00.000Z",
    resources: [
      {
        id: "fixture-source",
        originalPath: "C:/tmp/fixture-source.pdf",
        relativePath: "fixture-source.pdf",
        kind: "pdf",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: "C:/tmp/fixture-source.txt",
        chunkManifestPath,
        chunkCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        pageCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        sectionLabels: [],
        titleGuess: "Fixture Source",
        resourceCategory: "assessment",
        authorityRole: "assessment-authoritative",
        blueprintSignals: [],
        assessmentSignals: [],
        supportSignals: []
      }
    ],
    warnings: []
  });

  await writeJsonFile(paths.benchmarkSelectionPath, {
    benchmarkId: "calm-module-2-workbook",
    sourceSupportMode: "hidden-by-default",
    notes: ["Use the workbook surface for the study side."]
  });

  try {
    await convertHss1010Project({
      projectSlug: slug,
      generatedAt: "2026-03-13T00:00:00.000Z"
    });

    const renderedHtml = await readFile(paths.workspaceEntrypoint, "utf8");

    assert.match(renderedHtml, /teacher-checkpoint/i);
    assert.match(renderedHtml, /Determinant Insight Studio/i);
    assert.match(renderedHtml, /Section 1 Outcomes/i);
    assert.match(renderedHtml, /Guiding Questions/i);
    assert.match(renderedHtml, /Determinants and Public Policy/i);
    assert.match(renderedHtml, /Assignment Handoff/i);
    assert.doesNotMatch(renderedHtml, /SolveSocialProblems/i);
    assert.doesNotMatch(renderedHtml, /source-support-toggle/i);
    assert.doesNotMatch(renderedHtml, /source-support-panel hidden/i);
    assert.doesNotMatch(renderedHtml, /Course booklet page/i);
    assert.doesNotMatch(renderedHtml, /Source supplement/i);
    assert.doesNotMatch(renderedHtml, /Course booklet evidence deck/i);
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("buildHss1010SourceArtifacts generates source-map and coverage report", () => {
  const { course } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const { sourceMap, coverageReport } = buildHss1010SourceArtifacts({
    projectSlug: "hss1010",
    course,
    sourceReferenceId: "fixture-source",
    sourceChunks: SAMPLE_SOURCE_CHUNKS,
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  assert.equal(sourceMap.slug, "hss1010");
  assert.equal(sourceMap.sectionMappings.length, course.sections.length);
  assert.equal(sourceMap.blockMappings.length > 0, true);
  assert.equal(coverageReport.slug, "hss1010");
  assert.equal(coverageReport.sourceBlocksTotal, SAMPLE_SOURCE_CHUNKS.length);
  assert.equal(coverageReport.sourcePagesCovered > 0, true);
  assert.equal(Array.isArray(coverageReport.sourcePagesUncovered), true);
});

test("enrichHss1010CourseWithSourceSupplements appends missing section pages as source-backed blocks", () => {
  const { course } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const sourceChunks: SourceChunk[] = [
    {
      id: "intro-page",
      index: 1,
      page: 3,
      text: "INTRODUCTION\nCourse overview and guiding questions."
    },
    {
      id: "section-1-page",
      index: 2,
      page: 5,
      text: "SECTION 1 - DEFINING HEALTH AND WELLNESS\nDefinitions and outcomes."
    },
    {
      id: "section-1-extra-page",
      index: 3,
      page: 6,
      text: "Applied examples for students.\nâ€¢ Case study prompts and reflection exercises."
    },
    {
      id: "section-1-follow-up-page",
      index: 4,
      page: 7,
      text: "Reflection prompts.\nout of school?"
    }
  ];

  const baselineArtifacts = buildHss1010SourceArtifacts({
    projectSlug: "hss1010",
    course,
    sourceReferenceId: "fixture-source",
    sourceChunks,
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const enrichedCourse = enrichHss1010CourseWithSourceSupplements({
    course,
    sourceChunks,
    sourceTitle: "Fixture Source",
    baselineSourceMap: baselineArtifacts.sourceMap
  });

  const wellnessSection = enrichedCourse.sections.find((section) => section.id === "wellness");
  assert.ok(wellnessSection);
  assert.equal(
    wellnessSection.blocks.some(
      (block) => block.source.sourcePageStart === 6 && block.source.sourceBlockId === "section-1-extra-page"
    ),
    true
  );
  const supplementBlock = wellnessSection.blocks.find((block) => block.source.sourcePageStart === 6);
  assert.ok(supplementBlock?.html);
  const followUpBlock = wellnessSection.blocks.find((block) => block.source.sourcePageStart === 7);
  assert.ok(followUpBlock?.html);
  assert.equal(followUpBlock.html.includes("<li>ut of school?</li>"), false);
  assert.equal(followUpBlock.html.includes("<p>out of school?</p>"), true);
  assert.equal(supplementBlock.html.includes("â€¢"), false);
});

test("buildHss1010SourceArtifacts keeps section page matches inside the correct section ranges", () => {
  const { course } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const sourceChunks: SourceChunk[] = [
    {
      id: "intro-page",
      index: 1,
      page: 3,
      text: "INTRODUCTION\nCourse overview and guiding questions."
    },
    {
      id: "section-1-page",
      index: 2,
      page: 5,
      text: "SECTION 1 - DEFINING HEALTH AND WELLNESS\nDefinitions and outcomes."
    },
    {
      id: "section-2-page",
      index: 3,
      page: 15,
      text: "SECTION 2 - INSIDE OUT: HOW THE BODY WORKS\nAnatomy and physiology."
    }
  ];

  const enrichedCourse = enrichHss1010CourseWithSourceSupplements({
    course,
    sourceChunks,
    sourceTitle: "Fixture Source",
    baselineSourceMap: buildHss1010SourceArtifacts({
      projectSlug: "hss1010",
      course,
      sourceReferenceId: "fixture-source",
      sourceChunks,
      generatedAt: "2026-03-12T00:00:00.000Z"
    }).sourceMap
  });

  const { sourceMap } = buildHss1010SourceArtifacts({
    projectSlug: "hss1010",
    course: enrichedCourse,
    sourceReferenceId: "fixture-source",
    sourceChunks,
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const wellnessMapping = sourceMap.sectionMappings.find((mapping) => mapping.sectionId === "wellness");
  assert.ok(wellnessMapping);
  assert.equal(wellnessMapping.matchedPages.includes(15), false);
});

test("enrichHss1010CourseWithSourceSupplements shapes wellness supplement headings into info cards", () => {
  const { course } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const sourceChunks: SourceChunk[] = [
    {
      id: "intro-page",
      index: 1,
      page: 3,
      text: "INTRODUCTION\nCourse overview."
    },
    {
      id: "section-1-page",
      index: 2,
      page: 5,
      text: "SECTION 1 - DEFINING HEALTH AND WELLNESS\nDefinitions and outcomes."
    },
    {
      id: "section-1-card-page",
      index: 3,
      page: 6,
      text: "PHYSICAL\nMovement, sleep, and body care.\nINTELLECTUAL\nCuriosity, learning, and perspective taking.\nEMOTIONAL\nFeelings, support, and reflection."
    }
  ];

  const baselineArtifacts = buildHss1010SourceArtifacts({
    projectSlug: "hss1010",
    course,
    sourceReferenceId: "fixture-source",
    sourceChunks,
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const enrichedCourse = enrichHss1010CourseWithSourceSupplements({
    course,
    sourceChunks,
    sourceTitle: "Fixture Source",
    baselineSourceMap: baselineArtifacts.sourceMap
  });

  const wellnessSection = enrichedCourse.sections.find((section) => section.id === "wellness");
  assert.ok(wellnessSection);
  const shapedBlock = wellnessSection.blocks.find((block) => block.source.sourcePageStart === 6);
  assert.ok(shapedBlock?.html);
  assert.equal(shapedBlock.html.includes("info-card"), true);
  assert.equal(shapedBlock.html.includes("PHYSICAL"), true);
});

test("renderHss1010WorkspaceShell returns a data-driven section-tab shell", () => {
  const { course, assessment } = extractHss1010ModelsFromHtml({
    projectSlug: "hss1010",
    html: FIXTURE_HTML,
    sourceTitle: "Fixture Source",
    sourcePdfUrl: "https://example.com/course.pdf",
    generatedAt: "2026-03-12T00:00:00.000Z"
  });

  const rendered = renderHss1010WorkspaceShell({
    projectSlug: "hss1010",
    course,
    assessment
  });

  assert.match(rendered.indexHtml, /id="study-tabs"/);
  assert.match(rendered.indexHtml, /id="study-sections-root"/);
  assert.match(rendered.indexHtml, /id="assessment-sections-root"/);
  assert.match(rendered.runtimeJs, /fetch\(['"]\.\/data\/course\.json['"]\)/);
  assert.match(rendered.runtimeJs, /auto-grade/);
});

test("renderHss1010WorkspaceShell can skip recomposition when course is already interactive", () => {
  const anatomyOnlyCourse: CourseModel = {
    courseId: "hss1010",
    slug: "hss1010",
    title: "HSS 1010",
    generatedAt: "2026-03-13T00:00:00.000Z",
    sourceTitle: "Fixture Source",
    sourcePdfUrl: null,
    sections: [
      {
        id: "anatomy",
        tabLabel: "02 Anatomy",
        title: "Section 2: Anatomy",
        blocks: [
          {
            id: "anatomy-custom",
            type: "rawHtml",
            html: '<div class="module-container">CUSTOM_IMAGE_MARKER</div>',
            source: {
              sourceType: "legacy-html",
              sourceTitle: "Fixture Source",
              sourcePageStart: null,
              sourcePageEnd: null,
              sourceBlockId: "anatomy-custom",
              conversionStatus: "converted",
              notes: []
            }
          }
        ]
      }
    ]
  };

  const assessment: AssessmentModel = {
    courseId: "hss1010",
    slug: "hss1010",
    title: "Assessment",
    generatedAt: "2026-03-13T00:00:00.000Z",
    sections: []
  };

  const rendered = renderHss1010WorkspaceShell({
    projectSlug: "hss1010",
    course: anatomyOnlyCourse,
    assessment,
    assumeInteractiveCourse: true
  });

  assert.match(rendered.indexHtml, /CUSTOM_IMAGE_MARKER/);
  assert.doesNotMatch(rendered.indexHtml, /Anatomy Systems Studio/i);
});

test("convertHss1010Project writes structured meta artifacts and workspace runtime data", async () => {
  const slug = "test-hss1010-conversion";
  const paths = await createProjectFixture({
    slug,
    workspaceHtml: FIXTURE_HTML,
    workspaceFiles: {
      "main.js": "console.log('legacy');\n"
    }
  });

  const chunkManifestPath = path.join(paths.resourceExtractedDir, "fixture-source.chunks.json");
  await ensureDir(paths.resourceExtractedDir);
  await writeJsonFile(chunkManifestPath, {
    projectId: slug,
    referenceId: "fixture-source",
    generatedAt: "2026-03-12T00:00:00.000Z",
    chunks: SAMPLE_SOURCE_CHUNKS.map((chunk) => ({
      id: chunk.id,
      index: chunk.index,
      locator: {
        kind: "page",
        label: `Page ${chunk.page}`,
        page: chunk.page,
        startPage: chunk.page,
        endPage: chunk.page
      },
      text: chunk.text,
      keywordHints: []
    }))
  });

  await writeJsonFile(paths.resourceCatalogPath, {
    projectId: slug,
    generatedAt: "2026-03-12T00:00:00.000Z",
    resources: [
      {
        id: "fixture-source",
        originalPath: "C:/tmp/fixture-source.pdf",
        relativePath: "fixture-source.pdf",
        kind: "pdf",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: "C:/tmp/fixture-source.txt",
        chunkManifestPath,
        chunkCount: 3,
        pageCount: 3,
        sectionLabels: [],
        titleGuess: "Fixture Source",
        resourceCategory: "assessment",
        authorityRole: "assessment-authoritative",
        blueprintSignals: [],
        assessmentSignals: [],
        supportSignals: []
      }
    ],
    warnings: []
  });

  try {
    const result = await convertHss1010Project({
      projectSlug: slug,
      generatedAt: "2026-03-12T00:00:00.000Z"
    });

    assert.equal(result.projectSlug, slug);

    const metaCoursePath = path.join(paths.metaDir, "course.json");
    const metaAssessmentPath = path.join(paths.metaDir, "assessment.json");
    const metaSourceMapPath = path.join(paths.metaDir, "source-map.json");
    const metaCoveragePath = path.join(paths.metaDir, "coverage-report.json");
    const workspaceCoursePath = path.join(paths.workspaceDir, "data", "course.json");
    const workspaceAssessmentPath = path.join(paths.workspaceDir, "data", "assessment.json");

    assert.equal(await fileExists(metaCoursePath), true);
    assert.equal(await fileExists(metaAssessmentPath), true);
    assert.equal(await fileExists(metaSourceMapPath), true);
    assert.equal(await fileExists(metaCoveragePath), true);
    assert.equal(await fileExists(workspaceCoursePath), true);
    assert.equal(await fileExists(workspaceAssessmentPath), true);

    const storedCourse = await readJsonFile<CourseModel>(metaCoursePath);
    const storedSourceMap = await readJsonFile<SourceMapModel>(metaSourceMapPath);
    const storedCoverage = await readJsonFile<CoverageReport>(metaCoveragePath);

    assert.equal(storedCourse.slug, slug);
    assert.equal(storedCourse.sections.length, 2);
    assert.equal(storedSourceMap.sourceChunkCount, 3);
    assert.equal(storedCoverage.sourceBlocksTotal, 3);
    assert.equal(storedCoverage.sourcePagesCovered, 3);

    const workspaceShellExists = await fileExists(paths.workspaceEntrypoint);
    const runtimeExists = await fileExists(path.join(paths.workspaceDir, "main.js"));
    assert.equal(workspaceShellExists, true);
    assert.equal(runtimeExists, true);
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("convertHss1010Project fails fast when authoring preferences detect blocking deviations", async () => {
  const slug = "test-hss1010-conversion-deviation-block";
  const paths = await createProjectFixture({
    slug,
    workspaceHtml: INTERACTIVE_WELLNESS_FIXTURE_HTML,
    workspaceFiles: {
      "main.js": "console.log('legacy');\n"
    }
  });

  const chunkManifestPath = path.join(paths.resourceExtractedDir, "fixture-source.chunks.json");
  await ensureDir(paths.resourceExtractedDir);
  await writeJsonFile(chunkManifestPath, {
    projectId: slug,
    referenceId: "fixture-source",
    generatedAt: "2026-03-12T00:00:00.000Z",
    chunks: WELLNESS_SUPPLEMENT_CHUNKS.map((chunk) => ({
      id: chunk.id,
      index: chunk.index,
      locator: {
        kind: "page",
        label: `Page ${chunk.page}`,
        page: chunk.page,
        startPage: chunk.page,
        endPage: chunk.page
      },
      text: chunk.text,
      keywordHints: []
    }))
  });

  await writeJsonFile(paths.resourceCatalogPath, {
    projectId: slug,
    generatedAt: "2026-03-12T00:00:00.000Z",
    resources: [
      {
        id: "fixture-source",
        originalPath: "C:/tmp/fixture-source.pdf",
        relativePath: "fixture-source.pdf",
        kind: "pdf",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: "C:/tmp/fixture-source.txt",
        chunkManifestPath,
        chunkCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        pageCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        sectionLabels: [],
        titleGuess: "Fixture Source",
        resourceCategory: "assessment",
        authorityRole: "assessment-authoritative",
        blueprintSignals: [],
        assessmentSignals: [],
        supportSignals: []
      }
    ],
    warnings: []
  });

  await writeJsonFile(paths.authoringPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    rules: {
      forbid: [
        {
          id: "forbid-determinant-insight-studio",
          description: "Determinant Insight Studio should be hidden in this fixture.",
          pattern: "Determinant Insight Studio"
        }
      ]
    },
    learning: {
      defaultScope: "project"
    }
  });

  try {
    await assert.rejects(
      () =>
        convertHss1010Project({
          projectSlug: slug,
          generatedAt: "2026-03-13T00:00:00.000Z"
        }),
      /Authoring preference deviations blocked conversion/
    );

    assert.equal(await fileExists(paths.deviationReportJsonPath), true);
    const report = await readJsonFile<{ pass: boolean; deviations: Array<{ ruleId: string }> }>(paths.deviationReportJsonPath);
    assert.equal(report.pass, false);
    assert.equal(report.deviations.some((deviation) => deviation.ruleId === "forbid-determinant-insight-studio"), true);
  } finally {
    await cleanupProjectFixture(slug);
  }
});

test("convertHss1010Project allows accepted deviations and updates authoring preferences", async () => {
  const slug = "test-hss1010-conversion-deviation-accept";
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "canvas-helper-authoring-gate-"));
  const repoPreferencesPath = path.join(tempDir, "authoring-preferences.json");

  await writeJsonFile(repoPreferencesPath, {
    schemaVersion: 1,
    flow: {
      sourceSupportMode: "hidden-by-default"
    },
    rules: {
      forbid: [
        {
          id: "forbid-determinant-insight-studio",
          description: "Determinant Insight Studio should be hidden in this fixture.",
          pattern: "Determinant Insight Studio"
        }
      ]
    },
    learning: {
      defaultScope: "repo"
    }
  });

  const paths = await createProjectFixture({
    slug,
    workspaceHtml: INTERACTIVE_WELLNESS_FIXTURE_HTML,
    workspaceFiles: {
      "main.js": "console.log('legacy');\n"
    }
  });

  const chunkManifestPath = path.join(paths.resourceExtractedDir, "fixture-source.chunks.json");
  await ensureDir(paths.resourceExtractedDir);
  await writeJsonFile(chunkManifestPath, {
    projectId: slug,
    referenceId: "fixture-source",
    generatedAt: "2026-03-12T00:00:00.000Z",
    chunks: WELLNESS_SUPPLEMENT_CHUNKS.map((chunk) => ({
      id: chunk.id,
      index: chunk.index,
      locator: {
        kind: "page",
        label: `Page ${chunk.page}`,
        page: chunk.page,
        startPage: chunk.page,
        endPage: chunk.page
      },
      text: chunk.text,
      keywordHints: []
    }))
  });

  await writeJsonFile(paths.resourceCatalogPath, {
    projectId: slug,
    generatedAt: "2026-03-12T00:00:00.000Z",
    resources: [
      {
        id: "fixture-source",
        originalPath: "C:/tmp/fixture-source.pdf",
        relativePath: "fixture-source.pdf",
        kind: "pdf",
        extractionStatus: "indexed",
        extractionMethod: "native",
        extractedTextPath: "C:/tmp/fixture-source.txt",
        chunkManifestPath,
        chunkCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        pageCount: WELLNESS_SUPPLEMENT_CHUNKS.length,
        sectionLabels: [],
        titleGuess: "Fixture Source",
        resourceCategory: "assessment",
        authorityRole: "assessment-authoritative",
        blueprintSignals: [],
        assessmentSignals: [],
        supportSignals: []
      }
    ],
    warnings: []
  });

  try {
    await convertHss1010Project({
      projectSlug: slug,
      generatedAt: "2026-03-13T00:00:00.000Z",
      repoAuthoringPreferencesPath: repoPreferencesPath,
      authoringAcceptance: {
        acceptDeviations: ["forbid-determinant-insight-studio"],
        because: "Intentional for this module design.",
        updatePreferences: true,
        preferenceScope: "repo"
      }
    });

    assert.equal(await fileExists(paths.workspaceEntrypoint), true);
    const updatedRepoPreferences = await readJsonFile<{
      rules?: { accepted?: Array<{ ruleId: string; reason: string }> };
    }>(repoPreferencesPath);
    assert.equal(
      updatedRepoPreferences.rules?.accepted?.some(
        (entry) => entry.ruleId === "forbid-determinant-insight-studio" && /Intentional/.test(entry.reason)
      ),
      true
    );
  } finally {
    await cleanupProjectFixture(slug);
    await removePath(tempDir);
  }
});
