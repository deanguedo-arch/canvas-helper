import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { load as loadHtml } from "cheerio";
import JSZip from "jszip";

import { buildBiology30UnitAPilots } from "../lib/biology30-unit-a/build.js";
import { decodeD2lText, intakeScienceComparison } from "../lib/science-comparison.js";
import type { ProjectManifest } from "../lib/types.js";

function qtiQuestion(input: {
  id: string;
  type: "Multiple Choice" | "Short Answer" | "Long Answer";
  prompt: string;
  choices?: Array<{ id: string; text: string; correct?: boolean }>;
  answer?: string;
}) {
  const choices = input.choices?.length
    ? `<response_lid ident="${input.id}_LID" rcardinality="Single"><render_choice>${input.choices
        .map(
          (choice) =>
            `<response_label ident="${choice.id}"><flow_mat><material><mattext texttype="text/html">&lt;p&gt;${choice.text}&lt;/p&gt;</mattext></material></flow_mat></response_label>`
        )
        .join("")}</render_choice></response_lid>`
    : `<response_str ident="${input.id}_STR"><render_fib><response_label ident="${input.id}_ANS" /></render_fib></response_str>`;
  const responses = input.choices?.length
    ? input.choices
        .map(
          (choice) =>
            `<respcondition><conditionvar><varequal>${choice.id}</varequal></conditionvar><setvar>${choice.correct ? "100" : "0"}</setvar></respcondition>`
        )
        .join("")
    : input.answer
      ? `<respcondition><conditionvar><varequal>${input.answer}</varequal></conditionvar><setvar>100</setvar></respcondition>`
      : "";
  return `<item ident="${input.id}">
    <itemmetadata><qtimetadata><qti_metadatafield><fieldlabel>qmd_questiontype</fieldlabel><fieldentry>${input.type}</fieldentry></qti_metadatafield><qti_metadatafield><fieldlabel>qmd_displayid</fieldlabel><fieldentry>${input.id}-source</fieldentry></qti_metadatafield></qtimetadata></itemmetadata>
    <presentation><flow><material><mattext texttype="text/html">${input.prompt}</mattext></material>${choices}</flow></presentation>
    <resprocessing>${responses}</resprocessing>
  </item>`;
}

function quizXml(chapter: number, code: string, includeAllTypes = false) {
  const questions = [
    qtiQuestion({
      id: `CH${chapter}_MC`,
      type: "Multiple Choice",
      prompt: chapter === 11 ? "&lt;p&gt;&lt;img src=&quot;quiz-image.png&quot; /&gt;Which response is coordinated?&lt;/p&gt;" : `&lt;p&gt;Chapter ${chapter} practice question&lt;/p&gt;`,
      choices: [
        { id: `CH${chapter}_A`, text: "Correct source choice", correct: true },
        { id: `CH${chapter}_B`, text: "Distractor" }
      ]
    })
  ];
  if (includeAllTypes) {
    questions.push(
      qtiQuestion({
        id: "CH11_SHORT",
        type: "Short Answer",
        prompt: "&lt;p&gt;Enter the source term.&lt;/p&gt;",
        answer: "homeostasis"
      }),
      qtiQuestion({
        id: "CH11_LONG",
        type: "Long Answer",
        prompt: "&lt;p&gt;Explain the evidence in a complete response.&lt;/p&gt;"
      })
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<questestinterop xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0"><assessment ident="quiz-${chapter}" title="Chapter ${chapter} Quiz" d2l_2p0:resource_code="${code}"><assess_procextension><d2l_2p0:time_limit>120</d2l_2p0:time_limit><d2l_2p0:attempts_allowed>1</d2l_2p0:attempts_allowed></assess_procextension><section>${questions.join("")}</section></assessment></questestinterop>`;
}

function classManifest() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="CLASS_FIXTURE" xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0">
  <metadata><title>Class Biology 30 Fixture</title></metadata>
  <organizations><organization identifier="org"><title>Class Biology 30 Fixture</title>
    <item identifier="UA" identifierref="R_UA"><title>Unit A - Nervous &amp; Endocrine Systems</title>
      <item identifier="NOTES" identifierref="R_NOTES" isvisible="False"><title>Unit A Nervous and Endocrine Systems Notes (1)</title></item>
      <item identifier="G11" identifierref="R_G11"><title>Days 1-7: Chapter 11</title>
        <item identifier="N11" identifierref="R_N11"><title>Unit A Chapter 11 Notes</title></item>
        <item identifier="D11" identifierref="R_D11" description="&lt;p&gt;Go through slides 1-66 of the &lt;a href=&quot;https://docs.google.com/presentation/d/chapter-11&quot;&gt;Unit A Chapter 11 Notes&lt;/a&gt; to study neuron structure and action potentials.&lt;/p&gt;"><title>Day 1: Neuron Structure and Action Potentials</title></item>
        <item identifier="Q11P" identifierref="R_Q11P" description="&lt;p&gt;Complete the Chapter 11 practice after reviewing your notes.&lt;/p&gt;"><title>Days 6-7: Chapter 11 Quiz</title>
          <item identifier="Q11" identifierref="R_Q11" resource_type_key="D2L.LE.Quizzing.Quiz"><title>Chapter 11 Quiz</title></item>
          <item identifier="Q11PRINT" identifierref="R_Q11PRINT" isvisible="False"><title>Chapter 11 Quiz (Printable Version)</title></item>
          <item identifier="Q11KEY" identifierref="R_Q11KEY" isvisible="False"><title>Chapter 11 Quiz (KEY)</title></item>
        </item>
        <item identifier="K11P" identifierref="R_K11P"><title>Ch. 11 Textbook KEYs</title><item identifier="K11" identifierref="R_K11"><title>Textbook Chapter 11 Review (KEY)</title></item></item>
      </item>
      <item identifier="G12" identifierref="R_G12"><title>Days 8-12: Chapter 12</title>
        <item identifier="D12" identifierref="R_D12" description="&lt;p&gt;Go through slides 1-30 of the &lt;a href=&quot;https://docs.google.com/presentation/d/chapter-12&quot;&gt;Unit A Chapter 12 Notes&lt;/a&gt;, then investigate sensory reception, the eye, and hearing.&lt;/p&gt;"><title>Day 8: Sensory Reception</title></item>
        <item identifier="Q12P" identifierref="R_Q12P"><title>Days 11-12: Chapter 12 Quiz</title><item identifier="Q12" identifierref="R_Q12" resource_type_key="D2L.LE.Quizzing.Quiz"><title>Chapter 12 Quiz</title></item></item>
      </item>
      <item identifier="G13" identifierref="R_G13"><title>Days 13-19: Chapter 13</title>
        <item identifier="D13" identifierref="R_D13" description="&lt;p&gt;Go through slides 1-43 of the &lt;a href=&quot;https://docs.google.com/presentation/d/chapter-13&quot;&gt;Unit A Chapter 13 Notes&lt;/a&gt; to trace homeostasis, pituitary hormones, thyroid, pancreas, and adrenal glands.&lt;/p&gt;"><title>Day 13: Homeostasis and Endocrine Feedback</title></item>
        <item identifier="Q13P" identifierref="R_Q13P"><title>Days 18-19: Chapter 13 Quiz</title><item identifier="Q13" identifierref="R_Q13" resource_type_key="D2L.LE.Quizzing.Quiz"><title>Chapter 13 Quiz</title></item></item>
      </item>
      <item identifier="REV" identifierref="R_REV"><title>Days 20-23: Unit A Review and Exam</title><item identifier="SEMINAR" identifierref="R_SEMINAR"><title>Biology 30 Unit A Review Seminar</title></item><item identifier="TEST" identifierref="R_TEST" isvisible="False" resource_type_key="D2L.LE.Quizzing.Quiz"><title>Biology 30 Unit A Test</title></item></item>
    </item>
    <item identifier="UB" identifierref="R_UB"><title>Unit B</title></item>
  </organization></organizations>
  <resources>
    <resource identifier="R_UA" type="webcontent" href="" /><resource identifier="R_NOTES" type="webcontent" href="Unit A Nervous and Endocrine Systems Notes.pdf" />
    <resource identifier="R_G11" type="webcontent" href="" /><resource identifier="R_N11" type="webcontent" href="https://example.com/ch11-slides" /><resource identifier="R_D11" type="webcontent" href="" /><resource identifier="R_Q11P" type="webcontent" href="" />
    <resource identifier="R_Q11" type="webcontent" href="/d2l/common/dialogs/quickLink/quickLink.d2l?type=quiz&amp;rcode=CODE11" /><resource identifier="R_Q11PRINT" type="webcontent" href="Content/quiz11.doc" /><resource identifier="R_Q11KEY" type="webcontent" href="Content/quiz11-key.doc" />
    <resource identifier="R_K11P" type="webcontent" href="" /><resource identifier="R_K11" type="webcontent" href="Content/ch11-review-key.pdf" />
    <resource identifier="R_G12" type="webcontent" href="" /><resource identifier="R_D12" type="webcontent" href="" /><resource identifier="R_Q12P" type="webcontent" href="" /><resource identifier="R_Q12" type="webcontent" href="/d2l/common/dialogs/quickLink/quickLink.d2l?type=quiz&amp;rcode=CODE12" />
    <resource identifier="R_G13" type="webcontent" href="" /><resource identifier="R_D13" type="webcontent" href="" /><resource identifier="R_Q13P" type="webcontent" href="" /><resource identifier="R_Q13" type="webcontent" href="/d2l/common/dialogs/quickLink/quickLink.d2l?type=quiz&amp;rcode=CODE13" />
    <resource identifier="R_REV" type="webcontent" href="" /><resource identifier="R_SEMINAR" type="webcontent" href="Content/review-seminar.pdf" /><resource identifier="R_TEST" type="webcontent" href="/d2l/common/dialogs/quickLink/quickLink.d2l?type=quiz&amp;rcode=TESTCODE" />
    <resource identifier="R_UB" type="webcontent" href="" />
  </resources>
</manifest>`;
}

function systemManifest() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="SYSTEM_FIXTURE" xmlns:d2l_2p0="http://desire2learn.com/xsd/d2lcp_v2p0">
  <metadata><title>System Biology 30 Fixture</title></metadata>
  <organizations><organization identifier="org"><title>System Biology 30 Fixture</title>
    <item identifier="UA" identifierref="R_UA"><title>Unit A</title>
      <item identifier="INTRO" identifierref="R_INTRO"><title>Unit A Introduction</title></item>
      <item identifier="ORG" identifierref="R_ORG"><title>Unit A Organizer</title></item>
      <item identifier="M1" identifierref="R_M1"><title>Module 1</title>
        <item identifier="M1I" identifierref="R_M1I"><title>Module 1 Introduction</title></item>
        <item identifier="M1L1" identifierref="R_M1L1"><title>Unit A - M1: Lesson 1</title>
          <item identifier="M1P1" identifierref="R_M1P1"><title>Page 1: Structure and Organization of the Nervous System</title></item>
          <item identifier="M1P2" identifierref="R_M1P2"><title>Page 2: Self Check</title></item>
          <item identifier="M1P3" identifierref="R_M1P3"><title>Page 3: Action Potential and Synaptic Transmission</title></item>
          <item identifier="M1P4" identifierref="R_M1P4"><title>Page 4: Sensory Investigation of the Eye and Ear</title></item>
        </item>
        <item identifier="M1S" identifierref="R_M1S"><title>Module 1 Summary</title></item>
      </item>
      <item identifier="M2" identifierref="R_M2"><title>Module 2</title>
        <item identifier="M2I" identifierref="R_M2I"><title>Module 2 Introduction</title></item>
        <item identifier="M2L1" identifierref="R_M2L1"><title>Unit A - M2: Lesson 1</title>
          <item identifier="M2P1" identifierref="R_M2P1"><title>Page 1: Negative Feedback and the Pituitary</title></item>
          <item identifier="M2P2" identifierref="R_M2P2"><title>Page 2: Thyroid, Pancreas, and Adrenal Glands</title></item>
          <item identifier="M2P3" identifierref="R_M2P3"><title>Page 3: Bringing It Together</title></item>
        </item>
        <item identifier="M2S" identifierref="R_M2S"><title>Module 2 Summary</title></item>
      </item>
    </item>
    <item identifier="UB" identifierref="R_UB"><title>Unit B</title></item>
  </organization></organizations>
  <resources>
    <resource identifier="R_UA" type="webcontent" href="" /><resource identifier="R_INTRO" type="webcontent" href="system\\ua\\intro.html" /><resource identifier="R_ORG" type="webcontent" href="system\\ua\\organizer.html" />
    <resource identifier="R_M1" type="webcontent" href="" /><resource identifier="R_M1I" type="webcontent" href="system\\ua\\m1\\intro.html" /><resource identifier="R_M1L1" type="webcontent" href="" /><resource identifier="R_M1P1" type="webcontent" href="system\\ua\\m1\\nervous.html" /><resource identifier="R_M1P2" type="webcontent" href="system\\ua\\m1\\selfcheck.html" /><resource identifier="R_M1P3" type="webcontent" href="system\\ua\\m1\\signal.html" /><resource identifier="R_M1P4" type="webcontent" href="system\\ua\\m1\\sensory.html" /><resource identifier="R_M1S" type="webcontent" href="system\\ua\\m1\\summary.html" />
    <resource identifier="R_M2" type="webcontent" href="" /><resource identifier="R_M2I" type="webcontent" href="system\\ua\\m2\\intro.html" /><resource identifier="R_M2L1" type="webcontent" href="" /><resource identifier="R_M2P1" type="webcontent" href="system\\ua\\m2\\feedback.html" /><resource identifier="R_M2P2" type="webcontent" href="system\\ua\\m2\\glands.html" /><resource identifier="R_M2P3" type="webcontent" href="system\\ua\\m2\\together.html" /><resource identifier="R_M2S" type="webcontent" href="system\\ua\\m2\\summary.html" />
    <resource identifier="R_UB" type="webcontent" href="" />
  </resources>
</manifest>`;
}

function utf16Html(body: string) {
  return Buffer.from(`\uFEFF<!doctype html><html><head><meta charset="UTF-8"><script src="legacy.js"></script></head><body>${body}<div id="footer">Legacy footer</div></body></html>`, "utf16le");
}

function fixtureNotesPdf(pageCount = 139) {
  const fontObjectId = 3 + pageCount * 2;
  const objects: string[] = Array.from({ length: fontObjectId + 1 }, () => "");
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  const pageObjectIds = Array.from({ length: pageCount }, (_value, index) => 3 + index * 2);
  objects[2] = `<< /Type /Pages /Count ${pageCount} /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  for (let index = 0; index < pageCount; index += 1) {
    const page = index + 1;
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const chapter = page >= 97 ? 13 : page >= 67 ? 12 : 11;
    const text = `Unit A source notes page ${page} Chapter ${chapter}`;
    const stream = [
      `BT /F1 24 Tf 72 340 Td (${text}) Tj`,
      `/F1 14 Tf 0 -44 Td (This source page explains mapped Biology 30 lesson content.) Tj`,
      `0 -24 Td (- Review the Chapter ${chapter} concepts represented on this source page.) Tj ET`
    ].join("\n");
    objects[pageObjectId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 720 405] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId] = `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`;
  }
  objects[fontObjectId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  let output = "%PDF-1.4\n";
  const offsets: number[] = Array.from({ length: fontObjectId + 1 }, () => 0);
  for (let objectId = 1; objectId <= fontObjectId; objectId += 1) {
    offsets[objectId] = Buffer.byteLength(output, "ascii");
    output += `${objectId} 0 obj\n${objects[objectId]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(output, "ascii");
  output += `xref\n0 ${fontObjectId + 1}\n0000000000 65535 f \n`;
  for (let objectId = 1; objectId <= fontObjectId; objectId += 1) {
    output += `${String(offsets[objectId]).padStart(10, "0")} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${fontObjectId + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(output, "ascii");
}

async function writeClassFixture(filePath: string) {
  const zip = new JSZip();
  zip.file("imsmanifest.xml", classManifest());
  zip.file("Unit A Nervous and Endocrine Systems Notes.pdf", fixtureNotesPdf());
  zip.file("Content/ch11-review-key.pdf", "%PDF-1.4\nreview key\n%%EOF");
  zip.file("Content/review-seminar.pdf", "%PDF-1.4\nseminar\n%%EOF");
  zip.file("Content/quiz11.doc", "excluded printable");
  zip.file("Content/quiz11-key.doc", "excluded key");
  zip.file("quiz-image.png", Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  zip.file("quiz_d2l_11.xml", quizXml(11, "CODE11", true));
  zip.file("quiz_d2l_12.xml", quizXml(12, "CODE12"));
  zip.file("quiz_d2l_13.xml", quizXml(13, "CODE13"));
  await writeFile(filePath, await zip.generateAsync({ type: "nodebuffer" }));
}

async function writeSystemFixture(filePath: string) {
  const zip = new JSZip();
  zip.file("imsmanifest.xml", systemManifest());
  const pages: Record<string, string> = {
    "system/ua/intro.html": "<h2>Unit inquiry and homeostasis</h2><p>UTF-16 Unit A introduction.</p>",
    "system/ua/organizer.html": "<h2>Organizer</h2><p>Ask how the systems coordinate homeostasis.</p>",
    "system/ua/m1/intro.html": "<h2>Nervous system</h2><p>UTF-16 nervous-system overview.</p>",
    "system/ua/m1/nervous.html": "<h2>Nervous organization</h2><p><img src=\"../../images/neuron.png\">The brain, spinal cord, and reflex pathway organize a response.</p>",
    "system/ua/m1/selfcheck.html": "<h2>Self Check</h2><p>Explain homeostasis.</p><div class=\"show_btn\">Check your work.</div><div class=\"contentparent_box\"><p>Source self-check answer.</p></div>",
    "system/ua/m1/signal.html": "<h2>Action potential and synapse</h2><p>Trace depolarization and synaptic transmission.</p>",
    "system/ua/m1/sensory.html": "<h2>Sensory lab</h2><p>Investigate the eye, ear, and sensory receptors.</p>",
    "system/ua/m1/summary.html": "<h2>Module 1 Summary</h2><p>Apply nervous-system evidence.</p>",
    "system/ua/m2/intro.html": "<h2>Endocrine system</h2><p>Use feedback to maintain a set point.</p>",
    "system/ua/m2/feedback.html": "<h2>Negative feedback</h2><p>Connect the hypothalamus and pituitary.</p>",
    "system/ua/m2/glands.html": "<h2>Glands</h2><p>Compare thyroid, pancreas, and adrenal hormones.</p>",
    "system/ua/m2/together.html": "<h2>Bringing It Together</h2><p>Integrate nervous and endocrine evidence.</p>",
    "system/ua/m2/summary.html": "<h2>Module 2 Summary</h2><p>Review endocrine regulation.</p>"
  };
  for (const [entryPath, body] of Object.entries(pages)) zip.file(entryPath, utf16Html(body));
  zip.file("system/images/neuron.png", Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  await writeFile(filePath, await zip.generateAsync({ type: "nodebuffer" }));
}

async function setupFixture() {
  const repoRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-repo-"));
  const sourceRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-pilot-sources-"));
  const primaryZip = path.join(sourceRoot, "class.zip");
  const referenceZip = path.join(sourceRoot, "system.zip");
  await Promise.all([writeClassFixture(primaryZip), writeSystemFixture(referenceZip)]);
  const brandPath = path.join(repoRoot, "docs/design/next-step/assets/nxt-ce-logo-white-with-ce.png");
  await mkdir(path.dirname(brandPath), { recursive: true });
  await writeFile(brandPath, Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  await intakeScienceComparison({
    repoRoot,
    family: "biology30-unit-a-pilot",
    courseCode: "BIO 30",
    title: "Biology 30 Unit A",
    unitTitle: "Unit A",
    primaryId: "class-2026-27",
    primaryLabel: "2026-27 class course",
    primaryZip,
    referenceId: "system-2020",
    referenceLabel: "CBE system course (2020)",
    referenceZip,
    treatments: ["faithful", "optimized"],
    synthesis: "outcome-led"
  });
  return { repoRoot, sourceRoot, primaryZip, referenceZip };
}

test("detects and decodes UTF-16LE Brightspace HTML despite its UTF-8 meta declaration", () => {
  const text = "<!doctype html><meta charset=\"UTF-8\"><p>Recovered endocrine content.</p>";
  const bytes = Buffer.from(`\uFEFF${text}`, "utf16le");
  assert.equal(decodeD2lText(bytes), text);
});

test("builds five isolated blocked workspaces with complete practice, reports, persistence, and exclusions", async () => {
  const fixture = await setupFixture();
  try {
    const beforePrimary = createHash("sha256").update(await readFile(fixture.primaryZip)).digest("hex");
    const beforeReference = createHash("sha256").update(await readFile(fixture.referenceZip)).digest("hex");
    const result = await buildBiology30UnitAPilots({
      repoRoot: fixture.repoRoot,
      family: "biology30-unit-a-pilot",
      checkExternalLinks: false,
      notesVisualMode: "text-svg"
    });
    assert.equal(result.variants.length, 5);
    assert.deepEqual(
      result.variants.map((variant) => variant.slug),
      [
        "biology30-unit-a-class-2026-faithful",
        "biology30-unit-a-class-2026-optimized",
        "biology30-unit-a-system-2020-faithful",
        "biology30-unit-a-system-2020-optimized",
        "biology30-unit-a-synthesis"
      ]
    );

    for (const variant of result.variants) {
      const projectDir = path.join(fixture.repoRoot, "projects", variant.slug);
      const html = await readFile(path.join(projectDir, "workspace/index.html"), "utf8");
      assert.doesNotMatch(html, /quickLink\.d2l|\/d2l\//i);
      assert.doesNotMatch(html, /Biology 30 Unit A Test|Quiz \(KEY\)|Quiz \(Printable Version\)/i);
      assert.match(html, /100-point review matrix/);
      const $ = loadHtml(html);
      assert.ok($("section#overview").length === 1);
      assert.ok($("[data-response-id]").length > 0);
      $("textarea, select, input").each((_index, element) => {
        const node = $(element);
        const type = node.attr("type")?.toLowerCase() ?? "";
        if (!["button", "submit", "reset", "hidden"].includes(type)) assert.ok(node.attr("data-response-id"));
      });
      const manifest = JSON.parse(await readFile(path.join(projectDir, "meta/project.json"), "utf8")) as ProjectManifest;
      assert.equal(manifest.authoringStatus, "blocked");
      assert.equal(manifest.authoring?.driverId, "proposal-only-v1");
      assert.equal(manifest.authoring?.studioEditing?.enabled, false);
      assert.ok(manifest.generatedOutputs?.includes(`projects/${variant.slug}/workspace/index.html`));
      const audit = JSON.parse(await readFile(path.join(projectDir, "meta/asset-link-audit.json"), "utf8")) as {
        unresolvedWorkspaceAssets: string[];
        d2lLaunchersRemaining: string[];
      };
      assert.deepEqual(audit.unresolvedWorkspaceAssets, []);
      assert.deepEqual(audit.d2lLaunchersRemaining, []);
      const e2e = JSON.parse(await readFile(path.join(projectDir, "meta/e2e-contract.json"), "utf8")) as {
        projectSlug: string;
        learnerCourse: { enabled: boolean; routes: string[] };
      };
      assert.equal(e2e.projectSlug, variant.slug);
      assert.equal(e2e.learnerCourse.enabled, true);
      assert.ok(e2e.learnerCourse.routes.includes("review-matrix"));
    }

    const classFaithfulPath = path.join(fixture.repoRoot, "projects/biology30-unit-a-class-2026-faithful/workspace/index.html");
    const classFaithful = await readFile(classFaithfulPath, "utf8");
    assert.match(classFaithful, /Which response is coordinated/);
    assert.match(classFaithful, /Enter the source term/);
    assert.match(classFaithful, /Explain the evidence in a complete response/);
    assert.match(classFaithful, /content from source note pages 67-96, recreated below in the/);
    assert.match(classFaithful, /Recreated source notes/);
    assert.match(classFaithful, /class="notes-page-recreation"/);
    assert.match(classFaithful, /class="notes-bullet-list"/);
    assert.match(classFaithful, /View original source slide/);
    assert.doesNotMatch(classFaithful, /Read the slide text|notes-slide-transcript/);
    assert.match(classFaithful, /data-notes-page="67"/);
    assert.match(classFaithful, /unit-a-notes-slides\/slide-067\.(?:jpg|svg)/);
    assert.doesNotMatch(classFaithful, /href="https:\/\/docs\.google\.com\/presentation\/d\/chapter-12"/);
    assert.equal((classFaithful.match(/class="practice-question"/g) ?? []).length, 5);
    assert.doesNotMatch(classFaithful, /system-2020|CBE system course \(2020\)|System Biology 30 Fixture/);
    assert.ok(
      (await readdir(path.join(fixture.repoRoot, "projects/biology30-unit-a-class-2026-faithful/workspace/assets/source/class-2026-27"), { recursive: true }))
        .some((entry) => String(entry).endsWith("unit-a-notes.pdf"))
    );
    const classNotesReport = JSON.parse(
      await readFile(path.join(fixture.repoRoot, "projects/biology30-unit-a-class-2026-faithful/meta/notes-content-report.json"), "utf8")
    ) as { included: boolean; pageCount: number; embeddedPageAssetCount: number; semanticPageCount: number; sourceSlideReferenceCount: number; verifiedSemanticOverridePages: number[]; renderingTreatment: string; mappedUniquePageCount: number; mappings: Array<{ sourceItemId: string; pdfPageStart: number; pdfPageEnd: number }> };
    assert.equal(classNotesReport.included, true);
    assert.equal(classNotesReport.pageCount, 139);
    assert.equal(classNotesReport.embeddedPageAssetCount, 139);
    assert.equal(classNotesReport.semanticPageCount, 139);
    assert.equal(classNotesReport.sourceSlideReferenceCount, 139);
    assert.deepEqual(classNotesReport.verifiedSemanticOverridePages, []);
    assert.equal(classNotesReport.renderingTreatment, "semantic-html-with-source-slide-reference");
    assert.equal(classNotesReport.mappedUniquePageCount, 139);
    assert.ok(classNotesReport.mappings.some((mapping) => mapping.sourceItemId === "D12" && mapping.pdfPageStart === 67 && mapping.pdfPageEnd === 96));

    const systemFaithful = await readFile(
      path.join(fixture.repoRoot, "projects/biology30-unit-a-system-2020-faithful/workspace/index.html"),
      "utf8"
    );
    assert.match(systemFaithful, /UTF-16 nervous-system overview/);
    assert.match(systemFaithful, /<details class="source-answer">/);
    assert.doesNotMatch(systemFaithful, /class-2026-27|2026-27 class course|Class Biology 30 Fixture/);
    const systemNotesReport = JSON.parse(
      await readFile(path.join(fixture.repoRoot, "projects/biology30-unit-a-system-2020-faithful/meta/notes-content-report.json"), "utf8")
    ) as { included: boolean; mappings: unknown[] };
    assert.equal(systemNotesReport.included, false);
    assert.deepEqual(systemNotesReport.mappings, []);
    const systemSourceMap = JSON.parse(
      await readFile(path.join(fixture.repoRoot, "projects/biology30-unit-a-system-2020-faithful/meta/source-map.json"), "utf8")
    ) as { sources: Array<{ utf16Html: { detected: boolean; count: number } }> };
    assert.equal(systemSourceMap.sources[0].utf16Html.detected, true);
    assert.ok(systemSourceMap.sources[0].utf16Html.count > 0);

    const synthesis = await readFile(
      path.join(fixture.repoRoot, "projects/biology30-unit-a-synthesis/workspace/index.html"),
      "utf8"
    );
    assert.match(synthesis, /data-source-id="class-2026-27"/);
    assert.match(synthesis, /data-source-id="system-2020"/);

    const classDisposition = JSON.parse(
      await readFile(path.join(fixture.repoRoot, "projects/biology30-unit-a-class-2026-faithful/meta/content-disposition.json"), "utf8")
    ) as { records: Array<{ title: string; disposition: string }> };
    assert.ok(classDisposition.records.some((record) => record.title === "Biology 30 Unit A Test" && record.disposition === "excluded-teacher-assessment"));
    assert.ok(classDisposition.records.some((record) => record.title === "Chapter 11 Quiz (KEY)" && record.disposition === "excluded-assessment-material"));
    assert.ok(classDisposition.records.some((record) => record.title === "Unit B" && record.disposition === "excluded-outside-unit"));

    assert.equal(createHash("sha256").update(await readFile(fixture.primaryZip)).digest("hex"), beforePrimary);
    assert.equal(createHash("sha256").update(await readFile(fixture.referenceZip)).digest("hex"), beforeReference);

    const beforeFreeze = createHash("sha256").update(await readFile(classFaithfulPath)).digest("hex");
    await writeFile(
      path.join(fixture.repoRoot, "projects/biology30-unit-a-class-2026-faithful/meta/comparison-freeze.json"),
      '{"schemaVersion":1,"reason":"test freeze"}\n',
      "utf8"
    );
    await assert.rejects(
      buildBiology30UnitAPilots({ repoRoot: fixture.repoRoot, family: "biology30-unit-a-pilot" }),
      /frozen for promotion/
    );
    assert.equal(createHash("sha256").update(await readFile(classFaithfulPath)).digest("hex"), beforeFreeze);
  } finally {
    await Promise.all([rm(fixture.repoRoot, { recursive: true, force: true }), rm(fixture.sourceRoot, { recursive: true, force: true })]);
  }
});
