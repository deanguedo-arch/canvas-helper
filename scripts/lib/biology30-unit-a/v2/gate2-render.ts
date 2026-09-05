import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { renderNextStepCourseShell, type NextStepShellLesson } from "../../next-step-course-shell.js";
import {
  buildBiology30SuspendDataSchema,
  type Biology30SuspendDataSchema
} from "../../biology30-course/v1/suspend-data.js";
import { renderBiology30Gate2Runtime } from "./runtime.js";
import { BIOLOGY30_UNIT_A_V2_CSS } from "./styles.js";
import type { BiologyArtifactV2, BiologyProductionContractV1 } from "./types.js";

type PracticeItem = {
  id: string;
  setId?: string;
  outcomeIds: string[];
  cognitiveLevel: "remember-understand" | "apply" | "higher-mental-activity";
  sourceRefIds: string[];
  prompt: string;
  choices: Record<string, string>;
  answerKey: unknown;
  rationale: string;
  targetedFeedback: Record<string, string>;
};

type CanonicalLesson = {
  schemaVersion: 1;
  id: string;
  module: string;
  title: string;
  inquiry: string;
  learningIntention: string;
  requiredMinutes: number;
  optionalMinutes: number;
  outcomeIds: string[];
  materials: string;
  safety: string;
  targets: string[];
  warmup: { title: string; prompt: string; placeholder: string };
  sections: Array<{
    label?: string;
    title: string;
    paragraphs: string[];
    figureIds?: string[];
    table?: { caption: string; headers: string[]; rows: string[][] };
  }>;
  interaction: {
    id: string;
    title: string;
    intro: string;
    prompt: string;
    options: Array<{ id: string; label: string; evidence: string; explanation: string }>;
    staticFallback: string;
  };
  artifact?: { id: string; number: number; prompt: string; evidenceRequirements: string[] };
  collaboration?: { title: string; peerRoute: string; teacherRoute: string };
  exit: { title: string; prompt: string; placeholder: string };
  sources: { summary: string; sourceRefIds: string[] };
};

type RuntimeActivities = Parameters<typeof renderBiology30Gate2Runtime>[0]["activities"];
type RuntimeDataset = Parameters<typeof renderBiology30Gate2Runtime>[0]["dataset"];

const MODULE_TITLES: Record<string, string> = {
  "module-1": "Systems and Signals",
  "module-2": "Neural Communication",
  "module-3": "Nervous Control",
  "module-4": "Sensory Systems",
  "module-5": "Endocrine Control",
  "module-6": "Integration"
};

const ARTIFACT_PLACEMENT: Record<string, string> = {
  "regulation-systems-map": "lesson-01",
  "action-potential-evidence": "lesson-04",
  "reflex-investigation": "lesson-07",
  "sensory-investigation": "lesson-08",
  "sensory-evidence-case": "lesson-10",
  "glucose-urinalysis": "lesson-15",
  "hormone-technology-case": "lesson-16"
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toICanStatement(value: string) {
  const target = value.trim();
  if (/^I can\b/.test(target)) return target;
  return `I can ${target.charAt(0).toLowerCase()}${target.slice(1)}`;
}

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function assertCanonicalHtml(label: string, html: string, placeholders: string[] = []) {
  if (!/<h1(?:\s|>)/i.test(html)) throw new Error(`Gate 2 canonical fragment ${label} has no H1.`);
  if (/<script\b|<iframe\b|fonts\.googleapis|material-symbols|slide-source|slide viewer|primarily visual|coming soon|lorem ipsum/i.test(html)) {
    throw new Error(`Gate 2 canonical fragment ${label} contains a prohibited dependency, slide treatment, or placeholder.`);
  }
  const remaining = Array.from(html.matchAll(/\{\{([a-z0-9-]+)(?::[a-z0-9-]+)?\}\}/gi), (match) => match[1]);
  if (remaining.some((placeholder) => !placeholders.includes(placeholder))) {
    throw new Error(`Gate 2 canonical fragment ${label} contains an unknown placeholder: ${remaining.join(", ")}.`);
  }
}

function assertFigure(id: string, svg: string) {
  if (!/<title\b/i.test(svg) || !/<desc\b/i.test(svg) || !/role="img"/i.test(svg)) {
    throw new Error(`Gate 2 figure ${id} is missing its title, description, or image role.`);
  }
  if (/<image\b|https?:\/\//i.test(svg.replace("http://www.w3.org/2000/svg", ""))) {
    throw new Error(`Gate 2 figure ${id} contains a raster or remote dependency.`);
  }
}

function namespaceSvg(svg: string, namespace: string) {
  const ids = Array.from(svg.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const replacements = new Map(ids.map((id) => [id, `${namespace}-${id}`]));
  let result = svg;
  for (const [id, safe] of replacements) {
    result = result
      .replace(new RegExp(`id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"), `id="${safe}"`)
      .replace(new RegExp(`url\\(#${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`, "g"), `url(#${safe})`)
      .replace(new RegExp(`href="#${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`, "g"), `href="#${safe}"`);
  }
  result = result.replace(/aria-labelledby="([^"]+)"/g, (_match, value: string) => `aria-labelledby="${value.split(/\s+/).map((id) => replacements.get(id) ?? id).join(" ")}"`);
  return result;
}

function svgDescription(svg: string) {
  const match = svg.match(/<desc(?:\s[^>]*)?>([\s\S]*?)<\/desc>/i);
  return (match?.[1] ?? "A labelled scientific model is provided above.").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function renderFigure(id: string, figures: Record<string, string>, lessonId: string, occurrence: number) {
  const svg = figures[id];
  if (!svg) throw new Error(`Gate 2 lesson ${lessonId} requests unknown figure ${id}.`);
  const namespace = `${lessonId}-${id}-${occurrence}`;
  return `<figure class="bio-figure" data-figure-slot="${escapeHtml(id)}">
    ${namespaceSvg(svg, namespace)}
    <figcaption><strong>Text equivalent.</strong> ${escapeHtml(svgDescription(svg))}</figcaption>
  </figure>`;
}

function renderTable(table: NonNullable<CanonicalLesson["sections"][number]["table"]>) {
  return `<div class="bio-table-wrap" role="region" aria-label="${escapeHtml(table.caption)}" tabindex="0"><table>
    <caption>${escapeHtml(table.caption)}</caption>
    <thead><tr>${table.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${table.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function renderPracticeItem(item: PracticeItem, number: number) {
  return `<article class="bio-practice-item" data-practice-id="${escapeHtml(item.id)}">
    <h3>${number}. Apply the idea</h3>
    <fieldset><legend>${escapeHtml(item.prompt)}</legend>
      ${Object.entries(item.choices).map(([key, label]) => `<label><input type="radio" name="${escapeHtml(item.id)}" value="${escapeHtml(key)}"> ${escapeHtml(label)}</label>`).join("")}
    </fieldset>
    <button type="button" class="bio-check-action" data-check-practice>Check answer</button>
    <div class="bio-feedback" data-practice-feedback aria-live="polite" hidden></div>
  </article>`;
}

function renderRubric() {
  return `<details class="bio-rubric"><summary>Review the four-level artifact rubric</summary>
    <div class="bio-table-wrap" role="region" aria-label="Portfolio artifact rubric" tabindex="0"><table>
      <caption>Biology 30 scientific evidence rubric</caption>
      <thead><tr><th scope="col">Dimension</th><th scope="col">Beginning</th><th scope="col">Developing</th><th scope="col">Proficient</th><th scope="col">Excellent</th></tr></thead>
      <tbody>
        <tr><th scope="row">Scientific accuracy</th><td>Major errors obscure the mechanism.</td><td>Partly accurate with gaps.</td><td>Accurate mechanism and terminology.</td><td>Precise, integrated, and anticipates exceptions.</td></tr>
        <tr><th scope="row">Evidence or data</th><td>Evidence is absent or unrelated.</td><td>One relevant observation is named.</td><td>Relevant values or observations support the claim.</td><td>Evidence is compared, quantified, and evaluated.</td></tr>
        <tr><th scope="row">Reasoning and connections</th><td>Claim and evidence are disconnected.</td><td>A partial causal link is present.</td><td>A clear mechanism connects evidence to claim.</td><td>Competing explanations are tested.</td></tr>
        <tr><th scope="row">Procedure, safety, and limits</th><td>Key controls or limits are missing.</td><td>Some controls or limits are named.</td><td>Procedure, safety, and limits fit the task.</td><td>Improvements and next evidence are justified.</td></tr>
        <tr><th scope="row">Communication and reflection</th><td>Meaning is difficult to follow.</td><td>Organization or terminology is uneven.</td><td>Clear, organized, and appropriately bounded.</td><td>Concise, precise, and thoughtfully revised.</td></tr>
      </tbody>
    </table></div>
  </details>`;
}

function stableArtifactField(artifactId: string, fieldId: string) {
  const suffix = fieldId.includes(":") ? fieldId.split(":").at(-1)! : fieldId;
  return `biology30-unit-a:artifact:${artifactId}:${suffix}`;
}

function renderArtifact(artifact: BiologyArtifactV2, lessonArtifact: NonNullable<CanonicalLesson["artifact"]>) {
  const headingId = `${artifact.id}-title`;
  return `<section class="bio-section bio-artifact" aria-labelledby="${escapeHtml(headingId)}" data-artifact-id="${escapeHtml(artifact.id)}" data-evidence-notebook-panel data-evidence-preserve-draft data-evidence-capture="${escapeHtml(artifact.id)}" data-evidence-contribution-id="biology30-unit-a:artifact:${escapeHtml(artifact.id)}">
    <div class="bio-artifact-heading"><div><p class="bio-section-label">Portfolio artifact ${lessonArtifact.number}</p><h2 id="${escapeHtml(headingId)}">${escapeHtml(artifact.title)}</h2></div><span>Draft checkpoint</span></div>
    <p>${escapeHtml(lessonArtifact.prompt)}</p>
    <ul class="bio-evidence-requirements">${lessonArtifact.evidenceRequirements.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
    <div class="bio-artifact-fields">${artifact.fields.map((field) => {
      const id = stableArtifactField(artifact.id, field.id);
      return `<label>${escapeHtml(field.label)} <span>Maximum ${field.maxLength} characters</span><textarea rows="4" maxlength="${field.maxLength}" data-bio-response-id="${escapeHtml(id)}" data-response-id="${escapeHtml(id)}" data-evidence-draft="detail" data-evidence-draft-label="${escapeHtml(field.label)}"></textarea></label>`;
    }).join("")}</div>
    ${renderRubric()}
    <p class="bio-submission-guidance"><strong>When your work is ready:</strong> save the draft here, then print or save it as a PDF—or copy the summary—and submit it using the assignment location your teacher provides.</p>
    <div class="bio-artifact-actions"><button type="button" class="bio-primary-button" data-save-artifact="${escapeHtml(artifact.id)}" data-save-evidence-note>Save artifact draft</button><button type="button" data-print-artifact="${escapeHtml(artifact.id)}">Print / Save as PDF</button><button type="button" data-copy-artifact="${escapeHtml(artifact.id)}">Copy summary</button><span data-artifact-status="${escapeHtml(artifact.id)}" data-save-status aria-live="polite">Draft not saved</span></div>
  </section>`;
}

function renderInteraction(interaction: CanonicalLesson["interaction"]) {
  const first = interaction.options[0];
  if (!first) throw new Error(`Gate 2 interaction ${interaction.id} has no cases.`);
  return `<section class="bio-section bio-model bio-model--generic" aria-labelledby="${escapeHtml(interaction.id)}-title" data-bio-interaction="${escapeHtml(interaction.id)}">
    <div class="bio-model-header"><div><p class="bio-section-label">Model Lab</p><h2 id="${escapeHtml(interaction.id)}-title">${escapeHtml(interaction.title)}</h2></div><p>${escapeHtml(interaction.intro)}</p></div>
    <p>${escapeHtml(interaction.prompt)}</p>
    <div class="bio-generic-model-controls"><label for="${escapeHtml(interaction.id)}-select">Choose a case<select id="${escapeHtml(interaction.id)}-select" data-generic-model-select="${escapeHtml(interaction.id)}">${interaction.options.map((option) => `<option value="${escapeHtml(option.id)}">${escapeHtml(option.label)}</option>`).join("")}</select></label><div><button type="button" class="bio-primary-button" data-run-bio-model="${escapeHtml(interaction.id)}">Inspect case</button><button type="button" data-reset-bio-model="${escapeHtml(interaction.id)}">Reset this model</button></div></div>
    <aside class="bio-model-readout" aria-live="polite" aria-atomic="true"><p class="bio-model-stage" data-generic-model-label="${escapeHtml(interaction.id)}">${escapeHtml(first.label)}</p><dl><div><dt>Evidence</dt><dd data-generic-model-evidence="${escapeHtml(interaction.id)}">${escapeHtml(first.evidence)}</dd></div><div><dt>Explanation</dt><dd data-generic-model-explanation="${escapeHtml(interaction.id)}">${escapeHtml(first.explanation)}</dd></div></dl><p class="bio-model-progress" data-generic-model-progress="${escapeHtml(interaction.id)}">0 of ${interaction.options.length} cases inspected</p></aside>
    <details class="bio-static-fallback"><summary>Use the complete static equivalent</summary><p>${escapeHtml(interaction.staticFallback)}</p><ul>${interaction.options.map((option) => `<li><strong>${escapeHtml(option.label)}:</strong> ${escapeHtml(option.evidence)} ${escapeHtml(option.explanation)}</li>`).join("")}</ul></details>
  </section>`;
}

function renderOptionalExtension(lesson: { optionalMinutes: number; interactionTitle: string; inquiry: string }) {
  if (!lesson.optionalMinutes) return "";
  return `<details class="bio-extension"><summary>Optional extension · ${lesson.optionalMinutes} minutes</summary><p>Revisit <strong>${escapeHtml(lesson.interactionTitle)}</strong> and compare every case. Then change one assumption in the model and predict the evidence that would follow. Explain which observation would support your revision and which would make you reject it.</p><p>This extension deepens the inquiry—${escapeHtml(lesson.inquiry)}—but it does not count toward required completion.</p></details>`;
}

function renderCollaboration(collaboration: NonNullable<CanonicalLesson["collaboration"]>) {
  return `<section class="bio-section bio-collaboration" aria-labelledby="${escapeHtml(collaboration.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}"><p class="bio-section-label">Feedback route</p><h2 id="${escapeHtml(collaboration.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"))}">${escapeHtml(collaboration.title)}</h2><div class="bio-two-column"><div><h3>Peer discussion, when enabled</h3><p>${escapeHtml(collaboration.peerRoute)}</p></div><div><h3>Teacher or self-review alternative</h3><p>${escapeHtml(collaboration.teacherRoute)}</p></div></div></section>`;
}

function renderCanonicalLesson(input: {
  lesson: CanonicalLesson;
  sequence: number;
  practiceItems: PracticeItem[];
  figures: Record<string, string>;
  artifact?: BiologyArtifactV2;
}) {
  const { lesson } = input;
  if (input.practiceItems.length !== 3) throw new Error(`Gate 2 lesson ${lesson.id} requires exactly three lesson checks.`);
  if (!/^I am learning to\b/.test(lesson.learningIntention.trim())) throw new Error(`Gate 2 lesson ${lesson.id} requires a student-facing learning intention.`);
  let figureOccurrence = 0;
  const sections = lesson.sections.map((section) => `<section class="bio-section" aria-labelledby="${escapeHtml(lesson.id)}-section-${section.title.match(/^\d+/)?.[0] ?? section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">
    ${section.label ? `<p class="bio-section-label">${escapeHtml(section.label)}</p>` : ""}
    <h2 id="${escapeHtml(lesson.id)}-section-${section.title.match(/^\d+/)?.[0] ?? section.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}">${escapeHtml(section.title)}</h2>
    ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
    ${(section.figureIds ?? []).map((figureId) => renderFigure(figureId, input.figures, lesson.id, ++figureOccurrence)).join("")}
    ${section.table ? renderTable(section.table) : ""}
  </section>`).join("");
  const artifact = input.artifact && lesson.artifact ? renderArtifact(input.artifact, lesson.artifact) : "";
  return `<div class="bio-route bio-lesson" data-biology-lesson="${escapeHtml(lesson.id)}">
    <header class="bio-lesson-header"><p class="bio-course-code">Lesson ${input.sequence} · ${escapeHtml(lesson.module)}</p><h1>${escapeHtml(lesson.title)}</h1><p class="bio-inquiry">${escapeHtml(lesson.inquiry)}</p><dl class="bio-lesson-meta"><div><dt>Required time</dt><dd>${lesson.requiredMinutes} minutes</dd></div><div><dt>Optional extension</dt><dd>${lesson.optionalMinutes} minutes</dd></div><div><dt>Outcomes</dt><dd>${lesson.outcomeIds.map(escapeHtml).join(", ")}</dd></div></dl></header>
    <aside class="bio-callout bio-callout--safety" aria-labelledby="${escapeHtml(lesson.id)}-readiness"><h2 id="${escapeHtml(lesson.id)}-readiness">Materials and safety</h2><p><strong>Materials:</strong> ${escapeHtml(lesson.materials)}</p><p><strong>Safety:</strong> ${escapeHtml(lesson.safety)}</p></aside>
    <section class="bio-learning-targets" aria-labelledby="${escapeHtml(lesson.id)}-targets"><div><p class="bio-section-label">Learning intention</p><h2 id="${escapeHtml(lesson.id)}-targets">${escapeHtml(lesson.learningIntention)}</h2></div><div><p class="bio-section-label">Success criteria</p><ul aria-label="Lesson success criteria">${lesson.targets.map((target) => `<li>${escapeHtml(toICanStatement(target))}</li>`).join("")}</ul></div></section>
    <section class="bio-section bio-retrieval" aria-labelledby="${escapeHtml(lesson.id)}-retrieval"><div><p class="bio-section-label">Retrieve</p><h2 id="${escapeHtml(lesson.id)}-retrieval">${escapeHtml(lesson.warmup.title)}</h2><p>${escapeHtml(lesson.warmup.prompt)}</p></div><label class="bio-response-label" for="${escapeHtml(lesson.id)}-warmup">Record your thinking <span>autosaves</span></label><textarea id="${escapeHtml(lesson.id)}-warmup" rows="3" maxlength="300" data-bio-response-id="biology30-unit-a:lesson:${lesson.id.slice(-2)}:warmup" data-bio-autosave placeholder="${escapeHtml(lesson.warmup.placeholder)}"></textarea><p class="bio-save-status" data-bio-status-for="biology30-unit-a:lesson:${lesson.id.slice(-2)}:warmup" aria-live="polite">Not saved yet</p></section>
    ${sections}
    ${renderInteraction(lesson.interaction)}
    ${lesson.collaboration ? renderCollaboration(lesson.collaboration) : ""}
    <section class="bio-section bio-practice" aria-labelledby="${escapeHtml(lesson.id)}-practice" data-bio-practice="${escapeHtml(lesson.id)}"><p class="bio-section-label">Guided practice</p><h2 id="${escapeHtml(lesson.id)}-practice">Check the mechanism</h2><p>Submit each answer for explanatory feedback. Your choices and feedback state are saved.</p><div class="bio-practice-list" data-practice-set="${escapeHtml(lesson.id)}">${input.practiceItems.map(renderPracticeItem).join("")}</div></section>
    ${artifact}
    <section class="bio-section bio-exit" aria-labelledby="${escapeHtml(lesson.id)}-exit"><p class="bio-section-label">Exit check</p><h2 id="${escapeHtml(lesson.id)}-exit">${escapeHtml(lesson.exit.title)}</h2><label for="${escapeHtml(lesson.id)}-exit-response">${escapeHtml(lesson.exit.prompt)}</label><textarea id="${escapeHtml(lesson.id)}-exit-response" rows="4" maxlength="300" data-bio-response-id="biology30-unit-a:lesson:${lesson.id.slice(-2)}:exit" placeholder="${escapeHtml(lesson.exit.placeholder)}"></textarea><div class="bio-exit-actions"><button type="button" class="bio-primary-button" data-complete-bio-lesson="${escapeHtml(lesson.id)}">Save exit and complete lesson</button><span data-lesson-status="${escapeHtml(lesson.id)}" aria-live="polite">Exit response required</span></div></section>
    ${renderOptionalExtension({ optionalMinutes: lesson.optionalMinutes, interactionTitle: lesson.interaction.title, inquiry: lesson.inquiry })}
    <details class="bio-sources"><summary>Lesson sources and scientific basis</summary><p>${escapeHtml(lesson.sources.summary)} Required instruction is local; listed external authorities are citations, not completion dependencies.</p></details>
  </div>`;
}

function injectApprovedLessonFigures(html: string, figures: Record<string, string>, lessonId: string) {
  let occurrence = 0;
  const injected = html.replace(/\{\{figure:([a-z0-9-]+)\}\}/g, (_match, shortId: string) => {
    const id = `figure-${shortId}`;
    const svg = figures[id];
    if (!svg) throw new Error(`Approved lesson ${lessonId} requests unknown figure ${id}.`);
    occurrence += 1;
    return namespaceSvg(svg, `${lessonId}-${id}-${occurrence}`);
  });
  if (/\{\{figure:/i.test(injected)) throw new Error(`Approved lesson ${lessonId} retains an unresolved figure placeholder.`);
  return injected;
}

function augmentApprovedLesson(html: string, input: { lessonId: string; optionalMinutes: number; inquiry: string; interactionTitle: string }) {
  const reset = input.lessonId === "lesson-04"
    ? '<div class="bio-model-reset"><button type="button" data-reset-ap-model>Reset this model</button></div>'
    : '<div class="bio-model-reset"><button type="button" data-reset-glucose-model>Reset this model</button></div>';
  const withReset = html.replace('<details class="bio-static-fallback">', `${reset}<details class="bio-static-fallback">`);
  const withPracticeTarget = withReset.replace('<section class="bio-section bio-practice"', `<section class="bio-section bio-practice" data-bio-practice="${escapeHtml(input.lessonId)}"`);
  if (withPracticeTarget === withReset) throw new Error(`Approved lesson ${input.lessonId} has no guided-practice section to target.`);
  const extension = renderOptionalExtension({ optionalMinutes: input.optionalMinutes, interactionTitle: input.interactionTitle, inquiry: input.inquiry });
  return withPracticeTarget.replace('<details class="bio-sources">', `${extension}<details class="bio-sources">`);
}

function renderModelCards(contract: BiologyProductionContractV1, canonical: Map<string, CanonicalLesson>) {
  return contract.interactions.map((interaction) => {
    const lesson = contract.lessons.find((entry) => entry.id === interaction.lessonId)!;
    const title = canonical.get(interaction.lessonId)?.interaction.title ?? (interaction.id === "interaction-action-potential-explorer" ? "Action-potential explorer" : "Blood-glucose feedback model");
    return `<article class="bio-hub-card"><div><p>${escapeHtml(MODULE_TITLES[lesson.moduleId] ?? lesson.moduleId)}</p><h2>${escapeHtml(title)}</h2><span data-model-status="${escapeHtml(interaction.id)}">Not started</span></div><p>${escapeHtml(interaction.completionRule)}</p><a href="#${escapeHtml(interaction.lessonId)}" data-page-target="${escapeHtml(interaction.lessonId)}" data-open-bio-model="${escapeHtml(interaction.id)}" aria-label="Open ${escapeHtml(title)}">Open model</a></article>`;
  }).join("");
}

function renderLessonPracticeCards(contract: BiologyProductionContractV1) {
  return contract.lessons.map((lesson) => `<article class="bio-hub-card"><div><p>Lesson ${lesson.order}</p><h2>${escapeHtml(lesson.title)}</h2><span data-practice-set-status="${escapeHtml(lesson.id)}">0 of 3 submitted</span></div><p>${escapeHtml(lesson.outcomeIds.join(", "))}</p><a href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}" data-open-bio-practice="${escapeHtml(lesson.id)}" aria-label="Open practice for Lesson ${lesson.order}: ${escapeHtml(lesson.title)}">Open lesson practice</a></article>`).join("");
}

function renderModulePractice(items: PracticeItem[]) {
  return Array.from({ length: 5 }, (_value, index) => {
    const moduleId = `module-${index + 1}`;
    const setItems = items.filter((item) => item.setId === moduleId);
    if (setItems.length !== 5) throw new Error(`${moduleId} requires exactly five module-check items.`);
    return `<details class="bio-practice-group"><summary><span>${escapeHtml(MODULE_TITLES[moduleId])}</span><strong data-practice-set-status="${moduleId}">0 of 5 submitted</strong></summary><div class="bio-practice-list">${setItems.map(renderPracticeItem).join("")}</div></details>`;
  }).join("");
}

function renderGlossary(entries: Array<{ term: string; definition: string }>) {
  return entries.map((entry) => `<article><h3>${escapeHtml(entry.term)}</h3><p>${escapeHtml(entry.definition)}</p></article>`).join("");
}

function renderSources(register: { sources: Array<{ id: string; label: string; role: string; url?: string; rightsStatus: string }> }) {
  const learnerRights = (status: string) => {
    if (/CC[- ]?BY/i.test(status)) return "Open educational source · CC BY 4.0";
    if (/official-government/i.test(status)) return "Official public health or science source";
    if (/official-public/i.test(status)) return "Official public curriculum or assessment source";
    if (/authorized-local/i.test(status)) return "Authorized local course source";
    return "Source use and attribution recorded";
  };
  return register.sources.map((source) => `<article><div><p>${escapeHtml(source.role)}</p><h2>${escapeHtml(source.label)}</h2></div><p>${escapeHtml(learnerRights(source.rightsStatus))}</p>${source.url ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" data-optional-enrichment>Optional source reference <span>— course completion does not depend on this link</span></a>` : '<span>Local authorized source; no learner download is required.</span>'}</article>`).join("");
}

export type Biology30Gate2RenderResult = {
  html: string;
  learnerRouteIds: string[];
  lessonIds: string[];
  figureIds: string[];
  interactionIds: string[];
  practiceItems: PracticeItem[];
  artifactIds: string[];
  activities: RuntimeActivities;
  suspendDataSchema: Biology30SuspendDataSchema;
};

export async function renderBiology30UnitAGate2(resourceDir: string): Promise<Biology30Gate2RenderResult> {
  const contract = await readJson<BiologyProductionContractV1>(path.join(resourceDir, "production-contract.json"));
  const lessonJsonIds = contract.lessons.map((lesson) => lesson.id).filter((id) => !["lesson-04", "lesson-15"].includes(id));
  const lessonPairs = await Promise.all(lessonJsonIds.map(async (id) => [id, await readJson<CanonicalLesson>(path.join(resourceDir, "content", "lessons", `${id}.json`))] as const));
  const canonical = new Map(lessonPairs);
  const figureFiles = (await readdir(path.join(resourceDir, "figures"))).filter((name) => name.endsWith(".svg")).sort();
  const figurePairs = await Promise.all(figureFiles.map(async (file) => [`figure-${file.replace(/\.svg$/i, "")}`, await readFile(path.join(resourceDir, "figures", file), "utf8")] as const));
  const figures = Object.fromEntries(figurePairs) as Record<string, string>;
  figurePairs.forEach(([id, svg]) => assertFigure(id, svg));

  const [overview, lesson04Raw, lesson15Raw, modelLabRaw, notebook, practiceHubRaw, glossaryRaw, sourcesRaw, gate1Activities, dataset, glossary, datasets, sourceRegister] = await Promise.all([
    readFile(path.join(resourceDir, "content", "overview.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "lessons", "lesson-04.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "lessons", "lesson-15.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "hubs", "model-lab.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "hubs", "investigation-notebook.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "hubs", "practice-hub.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "hubs", "glossary-and-data.html"), "utf8"),
    readFile(path.join(resourceDir, "content", "hubs", "sources-and-credits.html"), "utf8"),
    readJson<{ practiceItems: PracticeItem[]; artifacts: RuntimeActivities["artifacts"] }>(path.join(resourceDir, "activities", "gate-1-activities.json")),
    readJson<RuntimeDataset>(path.join(resourceDir, "datasets", "lesson-15-synthetic.json")),
    readJson<{ entries: Array<{ term: string; definition: string }> }>(path.join(resourceDir, "glossary.json")),
    readJson<{ datasets: Array<{ lessonId: string; label: string; status: string; purpose: string }> }>(path.join(resourceDir, "datasets", "gate-2-datasets.json")),
    readJson<{ sources: Array<{ id: string; label: string; role: string; url?: string; rightsStatus: string }> }>(path.join(resourceDir, "source-and-rights-register.json"))
  ]);

  assertCanonicalHtml("overview", overview);
  assertCanonicalHtml("lesson-04", lesson04Raw, ["figure"]);
  assertCanonicalHtml("lesson-15", lesson15Raw, ["figure"]);
  assertCanonicalHtml("model-lab", modelLabRaw, ["model-cards"]);
  assertCanonicalHtml("investigation-notebook", notebook);
  assertCanonicalHtml("practice-hub", practiceHubRaw, ["lesson-practice-cards", "module-practice", "final-practice"]);
  assertCanonicalHtml("glossary-and-data", glossaryRaw, ["glossary-entries", "dataset-rows"]);
  assertCanonicalHtml("sources-and-credits", sourcesRaw, ["source-entries"]);

  const practiceFiles = (await readdir(path.join(resourceDir, "practice"))).filter((name) => name.endsWith(".json")).sort();
  const practiceGroups = await Promise.all(practiceFiles.map((file) => readJson<{ items: PracticeItem[] }>(path.join(resourceDir, "practice", file))));
  const gate1Practice = gate1Activities.practiceItems.map((item) => ({ ...item, setId: item.id.startsWith("lesson-04") ? "lesson-04" : "lesson-15" }));
  const practiceItems = [...gate1Practice, ...practiceGroups.flatMap((group) => group.items)];
  if (practiceItems.length !== 100 || new Set(practiceItems.map((item) => item.id)).size !== 100) throw new Error("Gate 2 requires exactly 100 unique practice items.");

  const sourceRefIds = new Set(contract.sourceRefs.map((source) => source.id));
  for (const item of practiceItems) {
    const choices = Object.keys(item.choices);
    if (!item.outcomeIds.length || !item.sourceRefIds.length || !choices.includes(String(item.answerKey)) || !item.rationale.trim()) throw new Error(`Practice item ${item.id} is incomplete.`);
    if (choices.some((choice) => choice !== String(item.answerKey) && !item.targetedFeedback[choice]?.trim())) throw new Error(`Practice item ${item.id} lacks targeted feedback.`);
    if (item.sourceRefIds.some((id) => !sourceRefIds.has(id))) throw new Error(`Practice item ${item.id} references an unknown source.`);
  }

  const approvedArtifactOverrides = new Map(gate1Activities.artifacts.map((artifact) => [artifact.id, artifact]));
  const artifacts = contract.artifacts.map((artifact) => {
    const override = approvedArtifactOverrides.get(artifact.id);
    return {
      id: artifact.id,
      title: artifact.title,
      fields: override?.fields ?? artifact.fields.map((field) => ({ ...field, id: stableArtifactField(artifact.id, field.id) }))
    };
  });
  const interactions = contract.interactions.map((interaction) => {
    const authored = canonical.get(interaction.lessonId)?.interaction;
    return { id: interaction.id, lessonId: interaction.lessonId, title: authored?.title, options: authored?.options };
  });
  const activities: RuntimeActivities = { interactions, practiceItems, artifacts };

  const lesson04Contract = contract.lessons.find((lesson) => lesson.id === "lesson-04")!;
  const lesson15Contract = contract.lessons.find((lesson) => lesson.id === "lesson-15")!;
  const lesson04 = augmentApprovedLesson(injectApprovedLessonFigures(lesson04Raw, figures, "lesson-04"), { lessonId: "lesson-04", optionalMinutes: lesson04Contract.optionalMinutes, inquiry: lesson04Contract.inquiry, interactionTitle: "Action-potential explorer" });
  const lesson15 = augmentApprovedLesson(injectApprovedLessonFigures(lesson15Raw, figures, "lesson-15"), { lessonId: "lesson-15", optionalMinutes: lesson15Contract.optionalMinutes, inquiry: lesson15Contract.inquiry, interactionTitle: "Blood-glucose feedback model" });
  const artifactById = new Map(contract.artifacts.map((artifact) => [artifact.id, artifact]));
  const lessons: NextStepShellLesson[] = contract.lessons.map((lesson) => {
    let html: string;
    if (lesson.id === "lesson-04") html = lesson04;
    else if (lesson.id === "lesson-15") html = lesson15;
    else {
      const record = canonical.get(lesson.id);
      if (!record) throw new Error(`Missing canonical Gate 2 lesson record ${lesson.id}.`);
      const artifactId = Object.entries(ARTIFACT_PLACEMENT).find(([, placement]) => placement === lesson.id)?.[0];
      html = renderCanonicalLesson({ lesson: record, sequence: lesson.order, practiceItems: practiceItems.filter((item) => item.setId === lesson.id), figures, artifact: artifactId ? artifactById.get(artifactId) : undefined });
    }
    return { id: lesson.id, sequenceNumber: lesson.order, title: lesson.title, summary: lesson.inquiry, html, group: MODULE_TITLES[lesson.moduleId] ?? lesson.moduleId };
  });

  const modelLab = modelLabRaw.replace("{{model-cards}}", renderModelCards(contract, canonical));
  const finalItems = practiceItems.filter((item) => item.setId === "final-practice");
  if (finalItems.length !== 24) throw new Error("Gate 2 final practice requires exactly 24 items.");
  const practiceHub = practiceHubRaw
    .replace("{{lesson-practice-cards}}", renderLessonPracticeCards(contract))
    .replace("{{module-practice}}", renderModulePractice(practiceItems))
    .replace("{{final-practice}}", `<div class="bio-practice-list">${finalItems.map(renderPracticeItem).join("")}</div>`);
  const contractGlossary = new Set(contract.lessons.flatMap((lesson) => lesson.glossaryTerms));
  const glossaryTerms = new Set(glossary.entries.map((entry) => entry.term));
  const missingGlossary = [...contractGlossary].filter((term) => !glossaryTerms.has(term));
  if (missingGlossary.length) throw new Error(`Gate 2 glossary is missing: ${missingGlossary.join(", ")}.`);
  const glossaryPage = glossaryRaw
    .replace("{{glossary-entries}}", renderGlossary(glossary.entries))
    .replace("{{dataset-rows}}", datasets.datasets.map((entry) => `<tr><th scope="row"><a href="#${escapeHtml(entry.lessonId)}" data-page-target="${escapeHtml(entry.lessonId)}">${escapeHtml(entry.lessonId.replace("lesson-", "Lesson "))}</a></th><td>${escapeHtml(entry.label)}</td><td>${escapeHtml(entry.status)}</td><td>${escapeHtml(entry.purpose)}</td></tr>`).join(""));
  const sourcesPage = sourcesRaw.replace("{{source-entries}}", renderSources(sourceRegister));
  const learnerRouteIds = [...contract.learnerRoutes];
  const suspendDataSchema = buildBiology30SuspendDataSchema({
    courseSlug: "biology30-unit-a",
    lessonIds: contract.lessons.map((lesson) => lesson.id),
    activities
  });
  const html = renderNextStepCourseShell({
    slug: "biology30-unit-a",
    courseTitle: "Biology 30 — Unit A: Nervous and Endocrine Systems",
    courseCode: "BIO 30",
    overviewIntro: "",
    overviewHtml: overview,
    outcomes: [],
    lessons,
    completionIds: contract.lessons.map((lesson) => lesson.id),
    completionLabel: "lesson exits",
    lessonGroupTitle: "Unit A",
    lessonSequenceTitle: "Unit A lesson pathway",
    nextAfterLastLesson: { id: "practice-hub", label: "Open Practice Hub" },
    navItems: [
      { id: "model-lab", label: "Model Lab", icon: "science", html: modelLab },
      { id: "investigation-notebook", label: "Investigation Notebook", icon: "edit_note", html: notebook },
      { id: "practice-hub", label: "Practice Hub", icon: "quiz", html: practiceHub },
      { id: "glossary-and-data", label: "Glossary and Data", icon: "glossary", html: glossaryPage },
      { id: "sources-and-credits", label: "Sources and Credits", icon: "source", html: sourcesPage }
    ],
    logoPath: "assets/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: "biology30-unit-a",
    showLessonSubnavHeadings: true,
    showLessonsIndex: false,
    showLessonCompletionButton: false,
    lessonPresentation: "authored",
    chromeAssets: "self-contained",
    extraHeadHtml: '<meta name="color-scheme" content="light">',
    extraCss: BIOLOGY30_UNIT_A_V2_CSS,
    extraBodyHtml: renderBiology30Gate2Runtime({
      activities,
      dataset,
      lessonIds: contract.lessons.map((lesson) => lesson.id),
      requiredArtifactIds: contract.artifacts.map((artifact) => artifact.id),
      courseSlug: "biology30-unit-a",
      suspendDataSchema
    })
  });
  return {
    html,
    learnerRouteIds,
    lessonIds: contract.lessons.map((lesson) => lesson.id),
    figureIds: Object.keys(figures).sort(),
    interactionIds: contract.interactions.map((interaction) => interaction.id),
    practiceItems,
    artifactIds: contract.artifacts.map((artifact) => artifact.id),
    activities,
    suspendDataSchema
  };
}
