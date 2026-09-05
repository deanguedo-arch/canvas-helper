import { load as loadHtml } from "cheerio";

import {
  BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE,
  SCIENCE_COMPARISON_RUBRIC,
  type ScienceComparisonVariant
} from "../science-comparison.js";
import {
  renderNextStepCourseShell,
  type NextStepShellLesson,
  type NextStepShellNavItem
} from "../next-step-course-shell.js";
import { BiologyWorkspaceAssets } from "./assets.js";
import {
  BIOLOGY_PRACTICE_RUNTIME,
  renderD2lItemBody,
  renderPracticeQuiz,
  renderReflectionCollection,
  renderSourceSection
} from "./content.js";
import { materializeBiologyNotesDeck, renderNotesRange } from "./notes.js";
import { buildBiologySourceMap, classifyBiologySourceDisposition, flattenD2lItems } from "./source.js";
import type {
  BiologyBuildContext,
  BiologySourceModel,
  BiologyVariantBuildArtifacts,
  ContentDisposition,
  D2lItem,
  OutcomeMapRecord,
  ProvenanceRecord,
  WorkspaceBiologyNotesDeck
} from "./types.js";

type RenderedLesson = NextStepShellLesson & {
  sourceItems: Array<{ source: BiologySourceModel; item: D2lItem }>;
};

const INCLUDED_DISPOSITIONS = new Set<ContentDisposition["disposition"]>([
  "included",
  "included-check-your-work",
  "transformed-practice",
  "transformed-local-replacement"
]);

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "lesson";
}

function textFromHtml(value: string) {
  return loadHtml(`<body>${value}</body>`)("body").text().replace(/\s+/g, " ").trim();
}

function itemLookup(source: BiologySourceModel) {
  return new Map(source.items.map((item) => [item.identifier, item]));
}

function dispositionLookup(dispositions: ContentDisposition[]) {
  return new Map(dispositions.map((record) => [`${record.sourceId}:${record.itemId}`, record]));
}

function includedItem(
  source: BiologySourceModel,
  item: D2lItem,
  dispositions: Map<string, ContentDisposition>
) {
  const record = dispositions.get(`${source.resource.id}:${item.identifier}`);
  return Boolean(record && INCLUDED_DISPOSITIONS.has(record.disposition));
}

function includedTreeItems(
  source: BiologySourceModel,
  item: D2lItem,
  dispositions: Map<string, ContentDisposition>
) {
  return flattenD2lItems([item]).filter((candidate) => includedItem(source, candidate, dispositions));
}

function sourceSelection(source: BiologySourceModel, items: D2lItem[]) {
  return {
    sourceId: source.resource.id,
    itemIds: items.map((item) => item.identifier),
    titles: items.map((item) => item.title),
    rationale: "Mapped from learner-visible Unit A source sections using the Biology-specific outcome sequence."
  };
}

function candidateContext(source: BiologySourceModel, item: D2lItem) {
  const lookup = itemLookup(source);
  const parent = item.parentId ? lookup.get(item.parentId) : undefined;
  const siblingTopics = parent?.children.map((child) => child.title).join(" ") ?? "";
  let sourceText = item.descriptionHtml;
  const href = item.resource?.href?.replace(/\\/g, "/") ?? "";
  if (href && source.textByArchivePath.has(href)) sourceText += ` ${source.textByArchivePath.get(href)}`;
  return `${item.pathTitles.join(" ")} ${siblingTopics} ${textFromHtml(sourceText)}`.toLowerCase();
}

export function mapBiologyItemToStage(source: BiologySourceModel, item: D2lItem) {
  const text = candidateContext(source, item);
  if (/summary|review|quiz|bringing it together|integrated|seminar/.test(text)) return "integrated-application-review";
  if (/sensory|receptor|taste|smell|touch|temperature|photo(?:reception)?|retina|rods?|cones?|eye|ear|hearing|balance|dissection/.test(text)) {
    return "sensory-investigation";
  }
  if (/synap|neurotransmitter|neuromuscular|drug|reabsorption|crossing the divide/.test(text)) return "synapses-disruption";
  if (/action potential|nerve impulse|neuron at rest|depolar|repolar|hyperpolar|myelin|saltatory|neuron structure/.test(text)) {
    return "neuron-action-potential";
  }
  if (/negative feedback|positive feedback|set point|hypothalamus|pituitary|master complex|endocrine system/.test(text)) {
    return "endocrine-feedback";
  }
  if (/thyroid|parathyroid|pancrea|adrenal|gland|hormone|aldosterone|insulin|glucagon|blood glucose|imbalance|growth hormone/.test(text)) {
    return "glands-imbalances";
  }
  if (/homeostasis|unit a introduction|unit a organizer|unit inquiry|organizer/.test(text)) return "unit-inquiry-homeostasis";
  if (/nervous system|brain|spinal|reflex|somatic|autonomic|central nervous|peripheral nervous|pns|cns/.test(text)) {
    return "nervous-system-organization";
  }
  if (/module 2|endocrine/.test(text)) return "endocrine-feedback";
  if (/module 1|nervous/.test(text)) return "nervous-system-organization";
  return "unit-inquiry-homeostasis";
}

function outcomeRecords(input: {
  sources: BiologySourceModel[];
  candidates: Array<{ source: BiologySourceModel; item: D2lItem }>;
}) {
  return BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE.map((stage) => {
    const sourceSelections = input.sources
      .map((source) => {
        const items = input.candidates
          .filter((candidate) => candidate.source.resource.id === source.resource.id)
          .map((candidate) => candidate.item)
          .filter((item) => mapBiologyItemToStage(source, item) === stage.id);
        return items.length ? sourceSelection(source, items) : null;
      })
      .filter((selection): selection is NonNullable<typeof selection> => Boolean(selection));
    return { stageId: stage.id, stageLabel: stage.label, sourceSelections } satisfies OutcomeMapRecord;
  });
}

function lessonProvenance(input: {
  lesson: RenderedLesson;
  treatment: ScienceComparisonVariant["treatment"];
  rationale: string;
  use?: ProvenanceRecord["use"];
}) {
  const grouped = new Map<string, { source: BiologySourceModel; items: D2lItem[] }>();
  for (const selection of input.lesson.sourceItems) {
    const group = grouped.get(selection.source.resource.id) ?? { source: selection.source, items: [] };
    if (!group.items.some((item) => item.identifier === selection.item.identifier)) group.items.push(selection.item);
    grouped.set(selection.source.resource.id, group);
  }
  return [...grouped.values()].map(
    ({ source, items }) =>
      ({
        sectionId: input.lesson.id,
        sectionTitle: input.lesson.title,
        sourceId: source.resource.id,
        sourceLabel: source.resource.label,
        sourceItemIds: items.map((item) => item.identifier),
        sourcePaths: items.map((item) => item.pathTitles),
        treatment: input.treatment,
        use: input.use ?? "sequence",
        rationale: input.rationale
      }) satisfies ProvenanceRecord
  );
}

async function renderItemTree(input: {
  source: BiologySourceModel;
  item: D2lItem;
  assets: BiologyWorkspaceAssets;
  dispositions: Map<string, ContentDisposition>;
  responseNamespace: string;
  includeDescendants: boolean;
  notesDeck?: WorkspaceBiologyNotesDeck;
}) {
  const items = input.includeDescendants ? flattenD2lItems([input.item]) : [input.item];
  const sections: string[] = [];
  const selected: D2lItem[] = [];
  for (const item of items) {
    if (!includedItem(input.source, item, input.dispositions)) continue;
    const quiz = input.source.quizzes.find((candidate) => candidate.sourceItemId === item.identifier);
    if (quiz) {
      sections.push(
        await renderPracticeQuiz({
          source: input.source,
          quiz,
          assets: input.assets,
          responseNamespace: input.responseNamespace
        })
      );
      selected.push(item);
      continue;
    }
    const body = await renderD2lItemBody({
      source: input.source,
      item,
      assets: input.assets,
      responseNamespace: `${input.responseNamespace}:${item.identifier}`,
      localNotesPath: input.notesDeck?.pdfPath
    });
    const notesContent = input.notesDeck
      ? renderNotesRange({ source: input.source, item, deck: input.notesDeck })
      : "";
    if (!body && !notesContent && item.children.length && input.includeDescendants) continue;
    if (!body && !notesContent && !item.descriptionHtml.trim() && !item.resource?.href) continue;
    sections.push(renderSourceSection({ source: input.source, item, body: [body, notesContent].filter(Boolean).join("\n") }));
    selected.push(item);
  }
  return { html: sections.join("\n"), selected };
}

function localNotesItem(source: BiologySourceModel) {
  return source.items.find(
    (item) => item.explicitlyHidden && /unit\s+a.*nervous.*endocrine.*notes/i.test(item.title) && /\.pdf$/i.test(item.resource?.href ?? "")
  );
}

async function createLocalNotesPage(input: {
  source: BiologySourceModel;
  deck: WorkspaceBiologyNotesDeck;
}) {
  const item = input.source.items.find((candidate) => candidate.identifier === input.deck.sourceItemId) ?? localNotesItem(input.source);
  if (!item?.resource?.href || input.deck.pageCount !== 139) {
    throw new Error(`The current class source ${input.source.resource.id} does not contain the verified local Unit A notes deck.`);
  }
  return {
    item,
    path: input.deck.pdfPath,
    navItem: {
      id: "local-notes",
      label: "Full notes PDF",
      icon: "description",
      html: `<section id="local-notes" class="course-page" hidden>
        <p class="course-kicker">Full-deck fallback</p>
        <h2>Original Unit A notes PDF</h2>
        <p class="page-intro">The mapped PDF content is already recreated as readable course text inside the lessons. Use this preserved 139-page PDF only to compare against the original pages or download the complete source; Google Slides is not required.</p>
        <object class="source-pdf-frame" data="${escapeHtml(input.deck.pdfPath)}" type="application/pdf" aria-label="Complete Biology 30 Unit A notes">
          <p>Your browser cannot display the PDF inline. Use the local download link below.</p>
        </object>
        <div class="source-document-link"><a href="${escapeHtml(input.deck.pdfPath)}" download>Open or download the full source PDF</a></div>
        <p class="source-provenance-line">Source: ${escapeHtml(input.source.resource.label)} · ${escapeHtml(item.title)}</p>
      </section>`
    } satisfies NextStepShellNavItem
  };
}

function lessonSummary(title: string, sourceLabel: string) {
  return `${title} normalized from ${sourceLabel} with source-level provenance.`;
}

async function renderClassFaithful(input: {
  context: BiologyBuildContext;
  source: BiologySourceModel;
  assets: BiologyWorkspaceAssets;
  dispositions: Map<string, ContentDisposition>;
  notesDeck: WorkspaceBiologyNotesDeck;
}) {
  const lessons: RenderedLesson[] = [];
  for (const sourceGroup of input.source.unitRoot.children) {
    if (sourceGroup.explicitlyHidden) continue;
    const lessonCandidates = sourceGroup.children.length ? sourceGroup.children : [sourceGroup];
    for (const candidate of lessonCandidates) {
      if (!includedItem(input.source, candidate, input.dispositions)) continue;
      const rendered = await renderItemTree({
        source: input.source,
        item: candidate,
        assets: input.assets,
        dispositions: input.dispositions,
        responseNamespace: input.context.variant.slug,
        includeDescendants: true,
        notesDeck: input.notesDeck
      });
      if (!rendered.html) continue;
      const id = `source-${slugify(candidate.identifier)}-${slugify(candidate.title)}`;
      lessons.push({
        id,
        title: candidate.title,
        summary: lessonSummary(candidate.title, input.source.resource.label),
        group: sourceGroup.title.replace(/\s+and\s+Exam$/i, ""),
        html: rendered.html,
        sourceItems: rendered.selected.map((item) => ({ source: input.source, item }))
      });
    }
  }
  if (lessons[0]) {
    lessons[0].html += renderReflectionCollection({
      slug: input.context.variant.slug,
      lessonId: lessons[0].id,
      prompt: "What evidence from this lesson helps explain how the body coordinates a response?"
    });
  }
  return lessons;
}

async function renderSystemFaithful(input: {
  context: BiologyBuildContext;
  source: BiologySourceModel;
  assets: BiologyWorkspaceAssets;
  dispositions: Map<string, ContentDisposition>;
}) {
  const lessons: RenderedLesson[] = [];
  for (const unitChild of input.source.unitRoot.children) {
    const lessonCandidates = /^module\s+[12]$/i.test(unitChild.title) ? unitChild.children : [unitChild];
    for (const candidate of lessonCandidates) {
      if (!includedItem(input.source, candidate, input.dispositions)) continue;
      const rendered = await renderItemTree({
        source: input.source,
        item: candidate,
        assets: input.assets,
        dispositions: input.dispositions,
        responseNamespace: input.context.variant.slug,
        includeDescendants: true
      });
      if (!rendered.html) continue;
      const id = `source-${slugify(candidate.identifier)}-${slugify(candidate.title)}`;
      lessons.push({
        id,
        title: candidate.title.replace(/^Unit A\s*-\s*M[12]:?\s*/i, ""),
        summary: lessonSummary(candidate.title, input.source.resource.label),
        group: /^module\s+[12]$/i.test(unitChild.title) ? unitChild.title : "Unit A introduction",
        html: rendered.html,
        sourceItems: rendered.selected.map((item) => ({ source: input.source, item }))
      });
    }
  }
  if (lessons[0]) {
    lessons[0].html += renderReflectionCollection({
      slug: input.context.variant.slug,
      lessonId: lessons[0].id,
      prompt: "What question about nervous and endocrine coordination will guide your Unit A learning?"
    });
  }
  return lessons;
}

function classOptimizedCandidates(source: BiologySourceModel, dispositions: Map<string, ContentDisposition>) {
  const candidates: D2lItem[] = [];
  for (const group of source.unitRoot.children) {
    if (group.explicitlyHidden) continue;
    const children = group.children.length ? group.children : [group];
    for (const child of children) {
      if (includedItem(source, child, dispositions)) candidates.push(child);
    }
  }
  return candidates;
}

function systemOptimizedCandidates(source: BiologySourceModel, dispositions: Map<string, ContentDisposition>) {
  return source.items.filter(
    (item) =>
      includedItem(source, item, dispositions) &&
      Boolean(item.descriptionHtml.trim() || item.resource?.href) &&
      !item.children.length
  );
}

function stageBridge(stageLabel: string, treatment: ScienceComparisonVariant["treatment"]) {
  const treatmentNote = treatment === "synthesis"
    ? "Current class directions set the pathway; selected system explanations and investigations deepen it."
    : "The source sections below are regrouped without adding outside factual content.";
  return `<header class="outcome-stage-header">
    <p>Outcome stage</p>
    <h3>${escapeHtml(stageLabel)}</h3>
    <p>${escapeHtml(treatmentNote)}</p>
  </header>`;
}

async function renderOutcomeStages(input: {
  context: BiologyBuildContext;
  assets: BiologyWorkspaceAssets;
  dispositions: Map<string, ContentDisposition>;
  candidates: Array<{ source: BiologySourceModel; item: D2lItem }>;
  notesDeck?: WorkspaceBiologyNotesDeck;
}) {
  const lessons: RenderedLesson[] = [];
  for (const stage of BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE) {
    const candidates = input.candidates.filter(
      (candidate) => mapBiologyItemToStage(candidate.source, candidate.item) === stage.id
    );
    const sections: string[] = [];
    const selected: Array<{ source: BiologySourceModel; item: D2lItem }> = [];
    for (const candidate of candidates) {
      const rendered = await renderItemTree({
        source: candidate.source,
        item: candidate.item,
        assets: input.assets,
        dispositions: input.dispositions,
        responseNamespace: input.context.variant.slug,
        includeDescendants: candidate.item.children.length > 0,
        notesDeck: input.notesDeck
      });
      sections.push(rendered.html);
      selected.push(...rendered.selected.map((item) => ({ source: candidate.source, item })));
    }
    if (!sections.some((section) => section.trim())) {
      sections.push(`<p class="source-asset-fallback" role="note">No standalone source section was mapped here. Review the adjacent stage evidence.</p>`);
    }
    const lesson: RenderedLesson = {
      id: `stage-${stage.id}`,
      title: stage.label,
      summary: `Outcome-led organization for ${stage.label.toLowerCase()}.`,
      group: "Eight-stage Unit A pathway",
      html: `${stageBridge(stage.label, input.context.variant.treatment)}${sections.join("\n")}`,
      sourceItems: selected
    };
    lessons.push(lesson);
  }
  if (lessons[0]) {
    lessons[0].html += renderReflectionCollection({
      slug: input.context.variant.slug,
      lessonId: lessons[0].id,
      prompt: "What pattern of evidence will you track as Unit A moves from a stimulus to a coordinated response?"
    });
  }
  return lessons;
}

function synthesisScore(source: BiologySourceModel, item: D2lItem) {
  const text = candidateContext(source, item);
  let score = Math.min(5, Math.floor(text.length / 900));
  if (/lab|investigation|try this|self[- ]?check|reflect and connect|thought lab/.test(text)) score += 8;
  if (/intro|structure|organization|mechanism|anatomy|regulat|transmission|potential|feedback/.test(text)) score += 4;
  if (/watch and listen|glossary|lesson summary/.test(text)) score -= 5;
  return score;
}

function synthesisCandidates(input: {
  current: BiologySourceModel;
  system: BiologySourceModel;
  dispositions: Map<string, ContentDisposition>;
}) {
  const currentAtomic = classOptimizedCandidates(input.current, input.dispositions).flatMap((item) => {
    if (/textbook\s+keys?/i.test(item.title)) {
      return item.children.filter(
        (child) =>
          includedItem(input.current, child, input.dispositions) &&
          /chapter\s+(?:11|12|13)\s+review|review seminar|questions for comprehension/i.test(child.title)
      );
    }
    return [item];
  });
  const systemAtomic = systemOptimizedCandidates(input.system, input.dispositions);
  const result: Array<{ source: BiologySourceModel; item: D2lItem }> = [];
  for (const stage of BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE) {
    const currentStage = currentAtomic
      .filter((item) => mapBiologyItemToStage(input.current, item) === stage.id)
      .filter((item) => !/unit a chapter \d+ notes/i.test(item.title));
    const systemStage = systemAtomic
      .filter((item) => mapBiologyItemToStage(input.system, item) === stage.id)
      .sort((left, right) => synthesisScore(input.system, right) - synthesisScore(input.system, left))
      .slice(0, 6)
      .sort((left, right) => input.system.items.indexOf(left) - input.system.items.indexOf(right));
    result.push(...currentStage.map((item) => ({ source: input.current, item })));
    result.push(...systemStage.map((item) => ({ source: input.system, item })));
  }
  return result;
}

function renderReviewMatrix(input: {
  variant: ScienceComparisonVariant;
  sourceLabels: string[];
}) {
  const rows = SCIENCE_COMPARISON_RUBRIC.map(
    (criterion) => `<tr>
      <th scope="row"><strong>${escapeHtml(criterion.label)}</strong><span>${escapeHtml(criterion.reviewPrompt)}</span></th>
      <td>${criterion.points}</td>
      <td><label><span class="visually-hidden">Score for ${escapeHtml(criterion.label)}</span><input type="number" min="0" max="${criterion.points}" step="1" data-rubric-score data-response-id="${escapeHtml(input.variant.slug)}:rubric:${escapeHtml(criterion.id)}"></label></td>
      <td><label><span class="visually-hidden">Evidence for ${escapeHtml(criterion.label)}</span><textarea rows="3" data-response-id="${escapeHtml(input.variant.slug)}:rubric:${escapeHtml(criterion.id)}:notes"></textarea></label></td>
    </tr>`
  ).join("\n");
  return `<section id="review-matrix" class="course-page" hidden>
    <p class="course-kicker">Human comparison</p>
    <h2>100-point review matrix</h2>
    <p class="page-intro">Review this blocked prototype against the same seven criteria used for the other versions. A total is informative only; it never promotes a course.</p>
    <dl class="version-facts">
      <div><dt>Treatment</dt><dd>${escapeHtml(input.variant.treatment)}</dd></div>
      <div><dt>Source scope</dt><dd>${escapeHtml(input.sourceLabels.join(" + "))}</dd></div>
      <div><dt>Status</dt><dd>Blocked · preview and Annotation only</dd></div>
    </dl>
    <div class="review-table-wrap"><table class="review-matrix-table">
      <thead><tr><th>Criterion</th><th>Available</th><th>Score</th><th>Evidence / notes</th></tr></thead>
      <tbody>${rows}<tr class="review-total-row"><th scope="row">Reviewer total</th><td>100</td><td><output data-rubric-total>0</output></td><td>Manual selection remains required.</td></tr></tbody>
    </table></div>
  </section>`;
}

function renderProvenancePage(input: {
  variant: ScienceComparisonVariant;
  sources: BiologySourceModel[];
  provenance: ProvenanceRecord[];
}) {
  const sourceRows = input.sources
    .map(
      (source) => `<tr><th scope="row">${escapeHtml(source.resource.label)}</th><td><code>${escapeHtml(source.resource.id)}</code></td><td><code>${escapeHtml(source.resource.sha256)}</code></td><td>${escapeHtml(source.manifestTitle)}</td></tr>`
    )
    .join("\n");
  const sectionRows = input.provenance
    .map(
      (record) => `<tr><th scope="row">${escapeHtml(record.sectionTitle)}</th><td>${escapeHtml(record.sourceLabel)}</td><td>${record.sourceItemIds.length}</td><td>${escapeHtml(record.rationale)}</td></tr>`
    )
    .join("\n");
  return `<section id="source-provenance" class="course-page" hidden>
    <p class="course-kicker">Traceability</p>
    <h2>Source and section provenance</h2>
    <p class="page-intro">This prototype is generated only from the named source scope below. Full item paths and content dispositions are stored beside the workspace in project metadata.</p>
    <div class="review-table-wrap"><table class="provenance-table"><thead><tr><th>Source</th><th>ID</th><th>SHA-256</th><th>Manifest title</th></tr></thead><tbody>${sourceRows}</tbody></table></div>
    <h3>Rendered sections</h3>
    <div class="review-table-wrap"><table class="provenance-table"><thead><tr><th>Section</th><th>Source</th><th>Items</th><th>Selection rule</th></tr></thead><tbody>${sectionRows}</tbody></table></div>
  </section>`;
}

const BIOLOGY_CSS = `
.biology-source-section {
  margin: 1.5rem 0 2.25rem;
  padding: 1.25rem 0 0;
  border-top: 2px solid #c9d6ca;
}
.biology-source-header > span,
.outcome-stage-header > p:first-child,
.practice-quiz > header > p:first-child {
  display: block;
  margin: 0 0 .35rem;
  color: #526257;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
}
.biology-source-header h3,
.outcome-stage-header h3,
.practice-quiz h3 { margin: 0 0 .8rem; }
.biology-source-body { line-height: 1.72; }
.biology-source-body img,
.practice-prompt img { display: block; max-width: min(100%, 52rem); height: auto; margin: 1rem auto; }
.biology-source-section footer,
.source-provenance-line {
  margin-top: 1.1rem;
  padding-top: .75rem;
  border-top: 1px solid #e0e6e0;
  color: #59645d;
  font-size: .82rem;
}
.source-answer { margin: 1.1rem 0; border-left: 3px solid #55785a; padding: .75rem 1rem; background: #f5f8f4; }
.source-answer summary { cursor: pointer; font-weight: 700; }
.source-table-wrap,
.review-table-wrap { width: 100%; overflow-x: auto; margin: 1rem 0; }
.source-table-wrap table,
.review-matrix-table,
.provenance-table { width: 100%; border-collapse: collapse; }
.source-table-wrap th,
.source-table-wrap td,
.review-matrix-table th,
.review-matrix-table td,
.provenance-table th,
.provenance-table td { padding: .7rem; border: 1px solid #d7ded8; text-align: left; vertical-align: top; }
.source-table-wrap th,
.review-matrix-table thead th,
.provenance-table thead th { background: #edf2ed; }
.source-document-link,
.notes-included-notice,
.optional-reference,
.source-asset-fallback {
  margin: 1rem 0;
  padding: .9rem 1rem;
  border: 1px solid #cfd8d0;
  border-radius: 6px;
  background: #f7f9f7;
}
.source-document-link { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: .8rem; }
.source-pdf-frame { display: block; width: 100%; min-height: 68vh; border: 1px solid #cfd8d0; background: #fff; }
.notes-included-marker { font-weight: 700; color: #244b2a; }
.notes-content-range { margin: 2rem 0; padding-top: 1.25rem; border-top: 3px solid #365d3b; }
.notes-content-range > header { max-width: 48rem; margin-bottom: 1.1rem; }
.notes-content-range > header h4 { margin: .2rem 0 .55rem; font-size: 1.18rem; }
.notes-content-kicker { margin: 0; color: #526057; font-size: .78rem; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.notes-page-sequence { display: grid; gap: 1.1rem; max-width: 54rem; }
.notes-page-recreation { min-width: 0; overflow: hidden; border: 1px solid #cbd5cc; border-radius: 7px; background: #fff; }
.notes-page-header { padding: 1rem 1.15rem .85rem; border-bottom: 1px solid #dce3dd; background: #f5f7f4; }
.notes-page-header p { margin: 0 0 .22rem; color: #667168; font-size: .76rem; font-weight: 750; letter-spacing: .045em; text-transform: uppercase; }
.notes-page-header h5 { margin: 0; color: #1f3d25; font-size: clamp(1.08rem, 2vw, 1.35rem); line-height: 1.3; }
.notes-page-body { padding: 1rem 1.15rem 1.15rem; color: #27302a; line-height: 1.68; }
.notes-page-body > :first-child { margin-top: 0; }
.notes-page-body > :last-child { margin-bottom: 0; }
.notes-page-body p { max-width: 46rem; }
.notes-page-subheading { margin: 1.2rem 0 .45rem; color: #244b2a; font-size: 1.02rem; font-weight: 800; line-height: 1.4; }
.notes-bullet-list,
.notes-numbered-list { display: grid; gap: .48rem; margin: .8rem 0 1rem; padding-left: 1.45rem; }
.notes-bullet-list li,
.notes-numbered-list li { padding-left: .18rem; }
.notes-page-callout { margin: 1rem 0; padding: .8rem .9rem; border-left: 3px solid #55785a; background: #f1f5f0; color: #2e3b31; }
.notes-page-reference { display: grid; gap: .18rem; margin: 1rem 0; padding: .72rem .85rem; border: 1px solid #d4ddd5; border-radius: 5px; background: #fafbf9; color: #4d5950; font-size: .9rem; overflow-wrap: anywhere; }
.notes-page-reference strong { color: #33453a; font-size: .76rem; letter-spacing: .04em; text-transform: uppercase; }
.notes-page-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr)); gap: 1rem; margin: .75rem 0 1rem; }
.notes-page-column { min-width: 0; padding: .85rem; border: 1px solid #dce3dd; border-radius: 5px; background: #fafbf9; }
.notes-page-column > :first-child { margin-top: 0; }
.notes-page-column > :last-child { margin-bottom: 0; }
.notes-visual-note { padding: .75rem .85rem; border: 1px dashed #aab7ac; border-radius: 5px; background: #fbfcfa; color: #4b594e; font-size: .92rem; }
.notes-source-slide { border-top: 1px solid #dce3dd; background: #fafbf9; }
.notes-source-slide summary { padding: .78rem 1.15rem; cursor: pointer; color: #294b2e; font-weight: 750; }
.notes-source-slide summary:hover { background: #f1f5f0; }
.notes-source-slide summary:focus-visible { outline: 3px solid #7a9b80; outline-offset: -3px; }
.notes-source-slide figure { margin: 0; padding: 0 1.15rem 1.15rem; }
.notes-source-slide img { display: block; width: 100%; height: auto; margin: 0; border: 1px solid #cbd5cc; background: #eef1ee; }
.notes-source-slide figcaption { margin-top: .5rem; color: #667168; font-size: .82rem; }
@media (max-width: 680px) {
  .notes-page-columns { grid-template-columns: 1fr; }
  .notes-page-header,
  .notes-page-body { padding-left: .9rem; padding-right: .9rem; }
  .notes-source-slide summary { padding-left: .9rem; padding-right: .9rem; }
  .notes-source-slide figure { padding-left: .9rem; padding-right: .9rem; }
}
.outcome-stage-header { margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #d8e0d9; }
.practice-quiz { margin: 2rem 0; padding-top: 1.25rem; border-top: 3px solid #365d3b; }
.practice-question { margin: 1.4rem 0; padding: 1.15rem; border: 1px solid #cbd6cd; border-radius: 7px; min-width: 0; }
.practice-question legend { padding: 0 .4rem; font-weight: 700; }
.practice-prompt { line-height: 1.65; }
.practice-choices { display: grid; gap: .65rem; margin: 1rem 0; }
.practice-choice { display: grid; grid-template-columns: 1.25rem minmax(0, 1fr); gap: .65rem; align-items: start; }
.practice-choice input { margin-top: .3rem; }
.practice-choice label { cursor: pointer; }
.practice-choice label > :first-child { margin-top: 0; }
.practice-written-label { display: grid; gap: .45rem; margin: 1rem 0; font-weight: 700; }
.practice-written-label input,
.practice-written-label textarea,
.biology-reflection textarea,
.review-matrix-table input,
.review-matrix-table textarea {
  width: 100%;
  padding: .72rem;
  border: 1px solid #98a69b;
  border-radius: 5px;
  background: #fff;
  color: #182019;
  font: inherit;
}
.practice-question-actions,
.biology-reflection-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .8rem; margin-top: 1rem; }
.practice-check-button,
.biology-reflection-actions button {
  border: 1px solid #244b2a;
  border-radius: 5px;
  padding: .65rem .9rem;
  background: #244b2a;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}
[data-practice-feedback][data-result="correct"] { color: #1d6330; font-weight: 700; }
[data-practice-feedback][data-result="incorrect"] { color: #8a3d16; font-weight: 700; }
.biology-reflection { margin: 2rem 0 0; padding: 1.25rem; border: 1px solid #a9baaC; border-radius: 7px; background: #f1f5f1; }
.biology-reflection label { display: grid; gap: .5rem; font-weight: 700; }
.version-facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: #d6ded7; border: 1px solid #d6ded7; }
.version-facts div { padding: .9rem; background: #f7f9f7; }
.version-facts dt { color: #59645d; font-size: .78rem; font-weight: 700; text-transform: uppercase; }
.version-facts dd { margin: .3rem 0 0; }
.review-matrix-table th span { display: block; margin-top: .35rem; color: #59645d; font-weight: 400; }
.review-matrix-table input { min-width: 5rem; }
.review-matrix-table textarea { min-width: 15rem; }
.review-total-row { background: #edf2ed; font-weight: 700; }
.visually-hidden { position: absolute !important; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
:where(.practice-check-button, .biology-reflection-actions button, .practice-choice input, .practice-written-label input, .practice-written-label textarea, .review-matrix-table input, .review-matrix-table textarea):focus-visible { outline: 3px solid #e4a93b; outline-offset: 3px; }
@media (max-width: 720px) {
  .version-facts { grid-template-columns: 1fr; }
  .source-pdf-frame { min-height: 55vh; }
  .source-document-link { align-items: flex-start; flex-direction: column; }
  .practice-question { padding: .9rem; }
}
`;

async function ensureResponseContracts(html: string) {
  const $ = loadHtml(html);
  const missing: string[] = [];
  $("textarea, select, input").each((_index, element) => {
    const node = $(element);
    const type = node.attr("type")?.toLowerCase() ?? "";
    if (["button", "submit", "reset", "hidden"].includes(type)) return;
    if (!node.attr("data-response-id")) missing.push($.html(element));
  });
  if (missing.length) throw new Error(`Learner response controls are missing persistence IDs: ${missing.slice(0, 3).join(" ")}`);
}

export async function renderBiologyVariant(context: BiologyBuildContext): Promise<BiologyVariantBuildArtifacts> {
  const selectedSources = context.variant.sourceResourceIds.map((id) => {
    const source = context.sources.get(id);
    if (!source) throw new Error(`Variant ${context.variant.slug} references missing source ${id}.`);
    return source;
  });
  const dispositions = selectedSources.flatMap(classifyBiologySourceDisposition);
  const dispositionsById = dispositionLookup(dispositions);
  const assets = new BiologyWorkspaceAssets(context.repoRoot, context.stageWorkspaceDir, context.sources);
  await assets.copyBrand();

  const currentSource = selectedSources.find((source) => source.resource.role === "primary");
  const systemSource = selectedSources.find((source) => source.resource.role === "reference");
  let workspaceNotesDeck: WorkspaceBiologyNotesDeck | undefined;
  let notesPage: Awaited<ReturnType<typeof createLocalNotesPage>> | undefined;
  if (currentSource) {
    if (context.preparedNotesDeck.sourceId !== currentSource.resource.id) {
      throw new Error(`Prepared Unit A notes belong to ${context.preparedNotesDeck.sourceId}, not ${currentSource.resource.id}.`);
    }
    workspaceNotesDeck = await materializeBiologyNotesDeck({ prepared: context.preparedNotesDeck, assets });
    notesPage = await createLocalNotesPage({ source: currentSource, deck: workspaceNotesDeck });
  }

  let lessons: RenderedLesson[];
  let allCandidates: Array<{ source: BiologySourceModel; item: D2lItem }>;
  if (context.variant.treatment === "faithful") {
    const source = selectedSources[0];
    if (source.resource.role === "primary") {
      if (!notesPage || !workspaceNotesDeck) throw new Error(`Missing in-course notes content for ${context.variant.slug}.`);
      lessons = await renderClassFaithful({
        context,
        source,
        assets,
        dispositions: dispositionsById,
        notesDeck: workspaceNotesDeck
      });
    } else {
      lessons = await renderSystemFaithful({ context, source, assets, dispositions: dispositionsById });
    }
    allCandidates = lessons.flatMap((lesson) => lesson.sourceItems);
  } else if (context.variant.treatment === "optimized") {
    const source = selectedSources[0];
    const candidateItems = source.resource.role === "primary"
      ? classOptimizedCandidates(source, dispositionsById)
      : systemOptimizedCandidates(source, dispositionsById);
    allCandidates = candidateItems.map((item) => ({ source, item }));
    lessons = await renderOutcomeStages({
      context,
      assets,
      dispositions: dispositionsById,
      candidates: allCandidates,
      notesDeck: workspaceNotesDeck
    });
  } else {
    if (!currentSource || !systemSource || !notesPage || !workspaceNotesDeck) {
      throw new Error("The synthesis requires one primary class source, one reference system source, and the local Unit A notes deck.");
    }
    allCandidates = synthesisCandidates({ current: currentSource, system: systemSource, dispositions: dispositionsById });
    lessons = await renderOutcomeStages({
      context,
      assets,
      dispositions: dispositionsById,
      candidates: allCandidates,
      notesDeck: workspaceNotesDeck
    });
  }
  if (!lessons.length) throw new Error(`Biology renderer produced no lessons for ${context.variant.slug}.`);

  const provenance = lessons.flatMap((lesson) =>
    lessonProvenance({
      lesson,
      treatment: context.variant.treatment,
      rationale:
        context.variant.treatment === "faithful"
          ? "Preserved the source organization while normalizing delivery and removing excluded assessment launchers."
          : context.variant.treatment === "optimized"
            ? "Regrouped only this source's Unit A sections around the eight approved outcome stages."
            : "Used the current class pathway with selected system explanations, investigations, and self-checks."
    })
  );
  if (notesPage && currentSource) {
    provenance.push({
      sectionId: "local-notes",
      sectionTitle: "Local Unit A notes",
      sourceId: currentSource.resource.id,
      sourceLabel: currentSource.resource.label,
      sourceItemIds: [notesPage.item.identifier],
      sourcePaths: [notesPage.item.pathTitles],
      treatment: context.variant.treatment,
      use: "local-reference",
      rationale: "Rendered the verified 139-page source deck directly inside mapped lessons with text transcripts; retained the full PDF only as a fallback."
    });
  }
  const effectiveDispositions = context.variant.treatment === "synthesis"
    ? (() => {
        const renderedKeys = new Set(
          provenance.flatMap((record) => record.sourceItemIds.map((itemId) => `${record.sourceId}:${itemId}`))
        );
        return dispositions.map((record) => {
          if (!INCLUDED_DISPOSITIONS.has(record.disposition) || renderedKeys.has(`${record.sourceId}:${record.itemId}`)) {
            return record;
          }
          return {
            ...record,
            disposition: "excluded-duplicate" as const,
            reason:
              "The outcome-led synthesis selected a stronger or less duplicative section for the same stage; this source item remains preserved and mapped but is not rendered."
          };
        });
      })()
    : dispositions;
  const reviewPage: NextStepShellNavItem = {
    id: "review-matrix",
    label: "Review matrix",
    icon: "fact_check",
    html: renderReviewMatrix({ variant: context.variant, sourceLabels: selectedSources.map((source) => source.resource.label) })
  };
  const provenancePage: NextStepShellNavItem = {
    id: "source-provenance",
    label: "Provenance",
    icon: "account_tree",
    html: renderProvenancePage({ variant: context.variant, sources: selectedSources, provenance })
  };
  const navItems = [...(notesPage ? [notesPage.navItem] : []), reviewPage, provenancePage];
  const html = renderNextStepCourseShell({
    slug: context.variant.slug,
    courseTitle: `${context.contract.course.title} — ${context.variant.label}`,
    courseCode: context.contract.course.code,
    overviewIntro:
      context.variant.treatment === "faithful"
        ? "A source-faithful Unit A prototype with technical normalization, local persistence, and assessment-safe practice."
        : context.variant.treatment === "optimized"
          ? "A source-isolated Unit A redesign organized around eight shared outcome stages."
          : "An outcome-led Unit A synthesis using the current class pathway and selected system-course explanations and investigations.",
    overviewNotice:
      "Comparison build only. This project is blocked, preview-only, and available for Annotation inspection; Studio editing and export are disabled.",
    outcomes: BIOLOGY30_UNIT_A_OUTCOME_SEQUENCE.map(
      (stage) => `I can explain and apply Unit A learning about ${stage.label.toLowerCase()}.`
    ),
    lessons,
    navItems,
    lessonGroupTitle: context.contract.unitBoundary.title,
    lessonSequenceTitle: context.variant.treatment === "faithful" ? "Source sequence" : "Outcome sequence",
    sourceLessonLabel: context.variant.treatment === "faithful" ? "source lessons" : "outcome stages",
    storageKeyBase: `canvas-helper:${context.variant.slug}`,
    logoPath: "assets/brand/nxt-ce-logo-white-with-ce.png",
    evidenceProfile: "short-fiction",
    showLessonCardSummary: true,
    showLessonHeaderSummary: true,
    showLessonSubnavHeadings: true,
    extraHeadHtml: BIOLOGY_PRACTICE_RUNTIME,
    extraCss: BIOLOGY_CSS
  });
  await ensureResponseContracts(html);
  if (/Biology\s+30\s+Unit\s+A\s+Test/i.test(html) || /quiz\s*\(KEY\)|quiz\s*\(Printable Version\)/i.test(html)) {
    throw new Error(`Teacher-only assessment material leaked into ${context.variant.slug}.`);
  }
  if (context.checkExternalLinks) await assets.checkExternalLinkHealth();
  const assetAudit = await assets.finalizeAudit(html, context.generatedAt);
  if (assetAudit.unresolvedWorkspaceAssets.length || assetAudit.d2lLaunchersRemaining.length) {
    throw new Error(
      `Workspace asset/link validation failed for ${context.variant.slug}: unresolved=${assetAudit.unresolvedWorkspaceAssets.join(", ")} d2l=${assetAudit.d2lLaunchersRemaining.join(", ")}`
    );
  }
  const $ = loadHtml(html);
  const responseIds = [
    ...new Set(
      $("[data-response-id]")
        .map((_index, element) => $(element).attr("data-response-id")?.trim() ?? "")
        .get()
        .filter(Boolean)
    )
  ];
  return {
    variant: context.variant,
    html,
    lessonIds: lessons.map((lesson) => lesson.id),
    responseIds,
    dispositions: effectiveDispositions,
    provenance,
    outcomeMap: outcomeRecords({ sources: selectedSources, candidates: allCandidates }),
    assetAudit,
    notesContentReport: workspaceNotesDeck
      ? {
          schemaVersion: 1,
          included: true,
          reason: "The checksum-verified Unit A notes are recreated as semantic HTML inside mapped lessons; source-slide images and the full PDF remain optional comparison references.",
          sourceId: workspaceNotesDeck.sourceId,
          sourceArchivePath: workspaceNotesDeck.sourceArchivePath,
          sourceSha256: workspaceNotesDeck.sourceSha256,
          pageCount: workspaceNotesDeck.pageCount,
          embeddedPageAssetCount: workspaceNotesDeck.pages.length,
          semanticPageCount: workspaceNotesDeck.pages.filter((page) => page.semantic.title && page.semantic.blocks).length,
          sourceSlideReferenceCount: workspaceNotesDeck.pages.length,
          verifiedSemanticOverridePages: workspaceNotesDeck.verifiedSemanticOverridePages,
          mappedUniquePageCount: new Set(
            workspaceNotesDeck.mappings.flatMap((mapping) =>
              Array.from({ length: mapping.pdfPageEnd - mapping.pdfPageStart + 1 }, (_value, index) => mapping.pdfPageStart + index)
            )
          ).size,
          nativeTextPageCount: workspaceNotesDeck.nativeTextPageCount,
          ocrTextPageCount: workspaceNotesDeck.ocrTextPageCount,
          visualMethod: workspaceNotesDeck.visualMethod,
          renderingTreatment: "semantic-html-with-source-slide-reference",
          mappings: workspaceNotesDeck.mappings
        }
      : {
          schemaVersion: 1,
          included: false,
          reason: "This system-only variant remains source-isolated and therefore does not use the class-course notes PDF.",
          mappings: []
        },
    sourceMap: {
      schemaVersion: 1,
      family: context.contract.family,
      variant: context.variant.slug,
      sources: selectedSources.map((source) => buildBiologySourceMap(source, context.contract))
    }
  };
}
