import { renderNextStepCourseShell, type NextStepShellLesson } from "../../next-step-course-shell.js";
import { renderBiology30Gate2Runtime } from "../../biology30-unit-a/v2/runtime.js";
import { BIOLOGY30_UNIT_A_V2_CSS } from "../../biology30-unit-a/v2/styles.js";
import type { Biology30LessonBlueprint } from "./blueprint.js";
import type { Biology30LessonContent, Biology30PracticeSeed } from "./content-types.js";
import type { Biology30ProductionUnitCode } from "./curriculum.js";
import {
  BIOLOGY30_CONCEPT_FIGURE_KIND_LABELS,
  biology30ConceptFigureKind,
  validateBiology30ConceptFigureGrammar,
  type Biology30ConceptFigureKind
} from "./figure-grammar.js";
import type { RemainingUnitContract } from "./intake.js";
import { buildBiology30SuspendDataSchema, type Biology30SuspendDataSchema } from "./suspend-data.js";

export type Biology30ProductionPracticeItem = {
  id: string;
  setId: string;
  lessonId: string;
  linkedLessonIds: string[];
  outcomeIds: string[];
  cognitiveLevel: "remember-understand" | "apply" | "higher-mental-activity";
  sourceRefIds: string[];
  prompt: string;
  choices: Record<string, string>;
  answerKey: "a" | "b" | "c" | "d";
  rationale: string;
  targetedFeedback: Record<string, string>;
};

export type Biology30ProductionRenderResult = {
  html: string;
  lessonIds: string[];
  learnerRouteIds: string[];
  practiceItems: Biology30ProductionPracticeItem[];
  interactionIds: string[];
  artifactIds: string[];
  semanticFigureIds: string[];
  semanticFigureKinds: Record<string, Biology30ConceptFigureKind>;
  interactionPresentationKinds: Record<string, Biology30ConceptFigureKind>;
  glossaryTerms: string[];
  suspendDataSchema: Biology30SuspendDataSchema;
  activities: {
    interactions: Array<{
      id: string;
      lessonId: string;
      title: string;
      options: Array<{ id: string; label: string; evidence: string; explanation: string }>;
    }>;
    practiceItems: Biology30ProductionPracticeItem[];
    artifacts: Array<{ id: string; title: string; fields: Array<{ id: string; label: string; maxLength: number }> }>;
  };
};

const UNIT_LABELS: Record<Biology30ProductionUnitCode, string> = {
  B: "Reproduction and Development",
  C: "Cell Division, Genetics, and Molecular Biology",
  D: "Population and Community Dynamics"
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sentenceCase(value: string) {
  const trimmed = value.trim();
  return trimmed ? `${trimmed[0].toLowerCase()}${trimmed.slice(1)}` : trimmed;
}

function lessonResponseId(slug: string, lessonId: string, field: "warmup" | "exit") {
  const simple = lessonId.match(/^lesson-(\d+)$/);
  return `${slug}:lesson:${simple ? simple[1] : lessonId}:${field}`;
}

function artifactFieldId(slug: string, artifactId: string, fieldId: string) {
  const suffix = fieldId.split(":").at(-1) ?? fieldId;
  return `${slug}:artifact:${artifactId}:${suffix}`;
}

function rotateChoices(values: [string, string, string, string], shift: number) {
  const normalized = ((shift % values.length) + values.length) % values.length;
  return [...values.slice(normalized), ...values.slice(0, normalized)] as [string, string, string, string];
}

function itemFromSeed(input: {
  seed: Biology30PracticeSeed;
  lesson: Biology30LessonBlueprint & { sourceRefIds: string[] };
  index: number;
}) {
  const original: [string, string, string, string] = [input.seed.correct, ...input.seed.distractors];
  const ordered = rotateChoices(original, input.index % 4);
  const correctIndex = ordered.indexOf(input.seed.correct);
  const answerKey = (["a", "b", "c", "d"] as const)[correctIndex];
  const feedbackByValue = new Map(input.seed.distractors.map((value, index) => [value, input.seed.misconceptionFeedback[index]]));
  const targetedFeedback = Object.fromEntries(
    ordered.flatMap((choice, index) => {
      const key = (["a", "b", "c", "d"] as const)[index];
      return key === answerKey ? [] : [[key, feedbackByValue.get(choice) ?? "Return to the mechanism and compare this choice with the observed evidence."]];
    })
  );
  return {
    id: `${input.lesson.id}-check-${String(input.index + 1).padStart(2, "0")}`,
    setId: input.lesson.id,
    lessonId: input.lesson.id,
    linkedLessonIds: [input.lesson.id],
    outcomeIds: [...input.lesson.outcomeIds],
    cognitiveLevel: input.seed.cognitiveLevel,
    sourceRefIds: [...input.lesson.sourceRefIds],
    prompt: input.seed.prompt,
    choices: Object.fromEntries(ordered.map((choice, index) => [(["a", "b", "c", "d"] as const)[index], choice])),
    answerKey,
    rationale: input.seed.rationale,
    targetedFeedback
  } satisfies Biology30ProductionPracticeItem;
}

function mixedCognitiveLevels(total: number) {
  const rememberCount = Math.round(total * 0.3);
  const higherCount = Math.round(total * 0.2);
  const applyCount = total - rememberCount - higherCount;
  const remaining = {
    "remember-understand": rememberCount,
    apply: applyCount,
    "higher-mental-activity": higherCount
  };
  const pattern = ["apply", "remember-understand", "apply", "higher-mental-activity", "apply"] as const;
  const result: Array<Biology30ProductionPracticeItem["cognitiveLevel"]> = [];
  while (result.length < total) {
    for (const level of pattern) {
      if (result.length >= total) break;
      if (remaining[level] > 0) {
        result.push(level);
        remaining[level] -= 1;
      }
    }
  }
  return result;
}

type Biology30PracticeContext = {
  lesson: Biology30LessonBlueprint & { sourceRefIds: string[] };
  content: Biology30LessonContent;
};

function uniqueStrings(values: string[]) {
  return [...new Set(values)];
}

function mixedPracticeItem(input: {
  context: Biology30PracticeContext;
  peerContexts: Biology30PracticeContext[];
  caseIndex: number;
  id: string;
  setId: string;
  cognitiveLevel: Biology30ProductionPracticeItem["cognitiveLevel"];
  finalVariant: boolean;
}) {
  const { lesson, content } = input.context;
  const selectedIndex = input.caseIndex % content.interaction.cases.length;
  const selected = content.interaction.cases[selectedIndex];
  const primaryAlternative = content.interaction.cases[(selectedIndex + 1) % content.interaction.cases.length];
  const availablePeers = input.peerContexts.filter((entry) => entry.lesson.id !== lesson.id);
  if (!availablePeers.length) throw new Error(`${input.id} requires a second lesson for mixed retrieval.`);
  const peerContext = availablePeers[(input.caseIndex + input.id.length) % availablePeers.length];
  const peerCase = peerContext.content.interaction.cases[(selectedIndex + 2) % peerContext.content.interaction.cases.length];
  const taskLabel = input.cognitiveLevel === "remember-understand"
    ? "Mechanism recognition"
    : input.cognitiveLevel === "apply"
      ? "Evidence application"
      : "Evidence synthesis";
  const setLabel = input.finalVariant ? "Unit transfer" : "Module retrieval";

  let prompt: string;
  let rationale: string;
  let values: [string, string, string, string];
  let feedbackByValue: Map<string, string>;

  if (input.cognitiveLevel === "higher-mental-activity") {
    const correct = `Analyze “${selected.label}” and “${peerCase.label}” as separate mechanisms, then test whether they are causally linked before combining the claims.`;
    const firstOnly = `${selected.explanation} Therefore the second observation can be ignored.`;
    const secondOnly = `${peerCase.explanation} Therefore the first observation must be a measurement error.`;
    const overclaim = "Treat both observations as proof of one universal cause that will produce the same outcome in every context.";
    prompt = `${setLabel} · ${taskLabel}: Evidence 1 — ${selected.evidence} Evidence 2 — ${peerCase.evidence} Which analysis best integrates both observations without overstating causation?`;
    rationale = `${selected.explanation} ${peerCase.explanation} The strongest analysis retains both mechanism-level inferences and tests their relationship instead of discarding one or claiming a universal cause.`;
    values = [correct, firstOnly, secondOnly, overclaim];
    feedbackByValue = new Map([
      [firstOnly, `This uses the “${selected.label}” explanation but discards the second evidence stream. The “${peerCase.label}” evidence instead supports: ${peerCase.explanation}`],
      [secondOnly, `This uses the “${peerCase.label}” explanation but dismisses the first evidence stream without justification. The “${selected.label}” evidence supports: ${selected.explanation}`],
      [overclaim, `Two observations can support linked hypotheses without proving one universal cause. Apply both evidence procedures: ${content.interaction.staticFallback} ${peerContext.content.interaction.staticFallback}`]
    ]);
  } else {
    const noMechanism = input.cognitiveLevel === "remember-understand"
      ? "Classify the observation from its topic label alone; no biological mechanism or comparison is needed."
      : "Treat the observation as proof of one cause and apply the conclusion to every context without another measurement.";
    prompt = input.cognitiveLevel === "remember-understand"
      ? `${setLabel} · ${taskLabel}: ${selected.evidence} Which explanation identifies the biological mechanism that directly matches this observation?`
      : `${setLabel} · ${taskLabel}: A new case reports that ${sentenceCase(selected.evidence)} Which interpretation should be applied first, before making a broader claim?`;
    rationale = `${selected.explanation} This interpretation matches the location, timing, variable, or direction in the evidence and remains bounded to what was observed.`;
    values = [selected.explanation, primaryAlternative.explanation, peerCase.explanation, noMechanism];
    feedbackByValue = new Map([
      [primaryAlternative.explanation, `That explanation belongs to “${primaryAlternative.label},” whose defining evidence is: ${primaryAlternative.evidence} The prompt instead describes “${selected.label}.”`],
      [peerCase.explanation, `That explanation comes from ${peerContext.lesson.title} and matches this evidence: ${peerCase.evidence} It does not account for the “${selected.label}” observation.`],
      [noMechanism, input.cognitiveLevel === "remember-understand"
        ? `A topic label is not a mechanism. Use the evidence to distinguish “${selected.label}” from “${primaryAlternative.label}” and “${peerCase.label}.”`
        : `The observation supports this bounded interpretation: ${selected.explanation} A broader causal or universal claim requires comparison and additional evidence.`]
    ]);
  }

  if (new Set(values).size !== values.length) throw new Error(`${input.id} contains duplicate mixed-practice choices.`);
  const ordered = rotateChoices(values, input.caseIndex + input.id.length);
  const correctIndex = ordered.indexOf(values[0]);
  const answerKey = (["a", "b", "c", "d"] as const)[correctIndex];
  const targetedFeedback: Record<string, string> = {};
  ordered.forEach((choice, index) => {
    const key = (["a", "b", "c", "d"] as const)[index];
    if (key === answerKey) return;
    targetedFeedback[key] = feedbackByValue.get(choice) ?? `Compare this choice with the “${selected.label}” evidence and identify the first variable, stage, or mechanism that does not match.`;
  });
  return {
    id: input.id,
    setId: input.setId,
    lessonId: lesson.id,
    linkedLessonIds: [lesson.id, peerContext.lesson.id],
    outcomeIds: uniqueStrings([...lesson.outcomeIds, ...peerContext.lesson.outcomeIds]),
    cognitiveLevel: input.cognitiveLevel,
    sourceRefIds: uniqueStrings([...lesson.sourceRefIds, ...peerContext.lesson.sourceRefIds]),
    prompt,
    choices: Object.fromEntries(ordered.map((choice, index) => [(["a", "b", "c", "d"] as const)[index], choice])),
    answerKey,
    rationale,
    targetedFeedback
  } satisfies Biology30ProductionPracticeItem;
}

function buildPracticeBank(contract: RemainingUnitContract, contents: Biology30LessonContent[]) {
  const contentById = new Map(contents.map((record) => [record.id, record]));
  const lessonCheckCount = contract.assessment.practiceBlueprint.lessonChecks / contract.lessons.length;
  if (!Number.isInteger(lessonCheckCount)) throw new Error(`Unit ${contract.unitCode} lesson-check total cannot be distributed evenly.`);
  const lessonItems = contract.lessons.flatMap((lesson) => {
    const content = contentById.get(lesson.id);
    if (!content || content.practiceSeeds.length < lessonCheckCount) throw new Error(`${lesson.id} lacks authored lesson practice.`);
    return content.practiceSeeds.slice(0, lessonCheckCount).map((seed, index) => itemFromSeed({ seed, lesson, index }));
  });

  const mixedTotal = contract.assessment.practiceBlueprint.moduleChecks + contract.assessment.practiceBlueprint.finalPractice;
  const levels = mixedCognitiveLevels(mixedTotal);
  let mixedIndex = 0;
  const unitContexts = contract.lessons.map((lesson) => ({ lesson, content: contentById.get(lesson.id)! }));
  const unitModules = contract.modules;
  const baseModuleCount = Math.floor(contract.assessment.practiceBlueprint.moduleChecks / unitModules.length);
  const extraModuleCount = contract.assessment.practiceBlueprint.moduleChecks % unitModules.length;
  const moduleItems = unitModules.flatMap((module, moduleIndex) => {
    const desired = baseModuleCount + (moduleIndex < extraModuleCount ? 1 : 0);
    const moduleLessons = module.lessonIds.map((id) => contract.lessons.find((lesson) => lesson.id === id)).filter(Boolean) as Array<Biology30LessonBlueprint & { sourceRefIds: string[] }>;
    const moduleContexts = moduleLessons.map((lesson) => ({ lesson, content: contentById.get(lesson.id)! }));
    const moduleCycleStride = moduleLessons.length % 3 === 2 ? 2 : 1;
    return Array.from({ length: desired }, (_value, index) => {
      const lesson = moduleLessons[index % moduleLessons.length];
      const content = contentById.get(lesson.id)!;
      const item = mixedPracticeItem({
        context: { lesson, content },
        peerContexts: moduleContexts.length > 1 ? moduleContexts : unitContexts,
        caseIndex: (index + (moduleCycleStride * Math.floor(index / moduleLessons.length))) % 3,
        id: `module-${moduleIndex + 1}-check-${String(index + 1).padStart(2, "0")}`,
        setId: `module-${moduleIndex + 1}`,
        cognitiveLevel: levels[mixedIndex],
        finalVariant: false
      });
      mixedIndex += 1;
      return item;
    });
  });
  const finalCycleStride = contract.lessons.length % 3 === 2 ? 2 : 1;
  const finalItems = Array.from({ length: contract.assessment.practiceBlueprint.finalPractice }, (_value, index) => {
    const lesson = contract.lessons[index % contract.lessons.length];
    const content = contentById.get(lesson.id)!;
    const item = mixedPracticeItem({
      context: { lesson, content },
      peerContexts: unitContexts,
      caseIndex: (index + (finalCycleStride * Math.floor(index / contract.lessons.length)) + 1) % 3,
      id: `final-practice-${String(index + 1).padStart(2, "0")}`,
      setId: "final-practice",
      cognitiveLevel: levels[mixedIndex],
      finalVariant: true
    });
    mixedIndex += 1;
    return item;
  });
  const items = [...lessonItems, ...moduleItems, ...finalItems];
  if (items.length !== contract.assessment.practiceBlueprint.total || new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error(`Unit ${contract.unitCode} practice inventory is incomplete or contains duplicate IDs.`);
  }
  return items;
}

function renderTable(table: NonNullable<Biology30LessonContent["sections"][number]["table"]>) {
  return `<div class="bio-table-wrap" role="region" aria-label="${escapeHtml(table.caption)}" tabindex="0"><table>
    <caption>${escapeHtml(table.caption)}</caption>
    <thead><tr>${table.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>${table.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${escapeHtml(cell)}</th>` : `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function renderConceptMap(content: Biology30LessonContent, lesson: Biology30LessonBlueprint) {
  const figureId = `${lesson.id}-concept-model`;
  const figureKind = biology30ConceptFigureKind(lesson.id);
  const sequentialKinds: Biology30ConceptFigureKind[] = ["pathway", "feedback", "timeline", "cycle", "calculation"];
  const ordered = sequentialKinds.includes(figureKind);
  const listTag = ordered ? "ol" : "ul";
  const textEquivalent = content.conceptMap.nodes.map((node) => `${node.label}: ${node.detail}`).join(" ");
  const nodes = content.conceptMap.nodes.map((node, index) => {
    const marker = ordered ? String(index + 1) : String.fromCharCode(65 + index);
    return `<li data-figure-node><span aria-hidden="true">${marker}</span><strong>${escapeHtml(node.label)}</strong><p>${escapeHtml(node.detail)}</p></li>`;
  }).join("");
  return `<figure class="bio-concept-figure bio-concept-figure--${escapeHtml(figureKind)}" data-semantic-figure-id="${escapeHtml(figureId)}" data-figure-kind="${escapeHtml(figureKind)}" aria-labelledby="${escapeHtml(figureId)}-title" aria-describedby="${escapeHtml(figureId)}-desc">
    <div class="bio-concept-figure-heading"><p class="bio-section-label">Scientific ${escapeHtml(BIOLOGY30_CONCEPT_FIGURE_KIND_LABELS[figureKind])}</p><h3 id="${escapeHtml(figureId)}-title">${escapeHtml(content.conceptMap.title)}</h3></div>
    <div class="bio-concept-visual"><${listTag} class="bio-concept-flow bio-concept-flow--${escapeHtml(figureKind)}">${nodes}</${listTag}><span class="bio-concept-connector" aria-hidden="true"></span></div>
    <figcaption id="${escapeHtml(figureId)}-desc"><p><strong>Model summary.</strong> ${escapeHtml(content.conceptMap.description)}</p><details class="bio-figure-equivalent"><summary>Read the complete model as text</summary><p>${escapeHtml(textEquivalent)}</p></details></figcaption>
  </figure>`;
}

function renderPracticeItem(item: Biology30ProductionPracticeItem, number: number) {
  const thinkingLabel = item.cognitiveLevel === "remember-understand"
    ? "Recall and connect"
    : item.cognitiveLevel === "apply"
      ? "Apply the evidence"
      : "Evaluate the claim";
  return `<article class="bio-practice-item" data-practice-id="${escapeHtml(item.id)}">
    <h3>Question ${number + 1} · ${thinkingLabel}</h3>
    <fieldset><legend>${escapeHtml(item.prompt)}</legend>${Object.entries(item.choices).map(([key, label]) => `<label><input type="radio" name="${escapeHtml(item.id)}" value="${escapeHtml(key)}"> ${escapeHtml(label)}</label>`).join("")}</fieldset>
    <button type="button" class="bio-check-action" data-check-practice>Check answer</button>
    <div class="bio-feedback" data-practice-feedback aria-live="polite" hidden></div>
  </article>`;
}

function renderInteraction(content: Biology30LessonContent, interactionId: string, lessonId: string) {
  const presentationKind = biology30ConceptFigureKind(lessonId);
  const orderedKinds: Biology30ConceptFigureKind[] = ["pathway", "feedback", "timeline", "cycle", "calculation"];
  const actionLabels: Record<Biology30ConceptFigureKind, string> = {
    pathway: "Trace this stage",
    feedback: "Test this loop",
    timeline: "Inspect this point",
    cycle: "Inspect this phase",
    layers: "Inspect this layer",
    comparison: "Compare this case",
    calculation: "Work this case",
    evidence: "Evaluate this evidence",
    network: "Trace this connection"
  };
  const caseButtons = content.interaction.cases.map((entry, index) => {
    const marker = orderedKinds.includes(presentationKind) ? String(index + 1) : String.fromCharCode(65 + index);
    return `<button type="button" class="bio-model-case-option" data-bio-model-case="${escapeHtml(interactionId)}" data-bio-model-case-id="${escapeHtml(entry.id)}" aria-pressed="false" aria-controls="${escapeHtml(interactionId)}-readout"><span class="bio-model-case-marker" aria-hidden="true">${marker}</span><strong>${escapeHtml(entry.label)}</strong><span class="bio-model-case-action">${escapeHtml(actionLabels[presentationKind])}</span></button>`;
  }).join("");
  return `<section class="bio-section bio-model bio-model--grammar bio-model--${escapeHtml(presentationKind)}" aria-labelledby="${escapeHtml(interactionId)}-title" data-bio-interaction="${escapeHtml(interactionId)}" data-interaction-kind="${escapeHtml(presentationKind)}">
    <div class="bio-model-header"><div><p class="bio-section-label">Model Lab</p><h2 id="${escapeHtml(interactionId)}-title">${escapeHtml(content.interaction.title)}</h2></div><p>${escapeHtml(content.interaction.intro)}</p></div>
    <p>${escapeHtml(content.interaction.prompt)}</p>
    <div class="bio-model-case-selector bio-model-case-selector--${escapeHtml(presentationKind)}" role="group" aria-label="Choose an evidence case">${caseButtons}</div>
    <div class="bio-model-case-actions"><p>Select a case to reveal its evidence and test the explanation. Compare all three before you finish.</p><button type="button" data-reset-bio-model="${escapeHtml(interactionId)}">Reset this model</button></div>
    <aside id="${escapeHtml(interactionId)}-readout" class="bio-model-readout" aria-live="polite" aria-atomic="true"><p class="bio-model-stage" data-generic-model-label="${escapeHtml(interactionId)}">Choose a case</p><dl><div><dt>Evidence</dt><dd data-generic-model-evidence="${escapeHtml(interactionId)}">Select one of the three cases above to inspect the evidence.</dd></div><div><dt>Explanation</dt><dd data-generic-model-explanation="${escapeHtml(interactionId)}">The mechanism-based explanation will appear after you make a selection.</dd></div></dl><p class="bio-model-progress" data-generic-model-progress="${escapeHtml(interactionId)}">0 of 3 cases inspected</p></aside>
    <details class="bio-static-fallback"><summary>Use the complete static equivalent</summary><p>${escapeHtml(content.interaction.staticFallback)}</p><ul>${content.interaction.cases.map((entry) => `<li><strong>${escapeHtml(entry.label)}:</strong> ${escapeHtml(entry.evidence)} ${escapeHtml(entry.explanation)}</li>`).join("")}</ul></details>
  </section>`;
}

function renderRubric() {
  return `<details class="bio-rubric"><summary>Review the four-level artifact rubric</summary><div class="bio-table-wrap" role="region" aria-label="Portfolio artifact rubric" tabindex="0"><table>
    <caption>Biology 30 scientific evidence rubric</caption>
    <thead><tr><th scope="col">Dimension</th><th scope="col">Beginning</th><th scope="col">Developing</th><th scope="col">Proficient</th><th scope="col">Excellent</th></tr></thead>
    <tbody>
      <tr><th scope="row">Scientific accuracy</th><td>Major errors obscure the mechanism.</td><td>Partly accurate with gaps.</td><td>Accurate mechanism and terminology.</td><td>Precise, integrated, and appropriately qualified.</td></tr>
      <tr><th scope="row">Evidence or data</th><td>Evidence is absent or unrelated.</td><td>One relevant observation is named.</td><td>Values or observations support the claim.</td><td>Evidence is compared, quantified, and evaluated.</td></tr>
      <tr><th scope="row">Reasoning and connections</th><td>Claim and evidence are disconnected.</td><td>A partial link is present.</td><td>A clear mechanism connects evidence to claim.</td><td>Alternatives are tested and integrated.</td></tr>
      <tr><th scope="row">Procedure, safety, and limits</th><td>Controls or limits are missing.</td><td>Some limits are named.</td><td>Methods, safety, and limits fit the task.</td><td>Improvements and next evidence are justified.</td></tr>
      <tr><th scope="row">Communication and reflection</th><td>Meaning is difficult to follow.</td><td>Organization is uneven.</td><td>Clear, organized, and appropriately bounded.</td><td>Concise, precise, and thoughtfully revised.</td></tr>
    </tbody></table></div></details>`;
}

function renderArtifact(input: {
  slug: string;
  artifact: RemainingUnitContract["artifacts"][number];
  content: Biology30LessonContent;
  number: number;
}) {
  const headingId = `${input.artifact.id}-title`;
  return `<section class="bio-section bio-artifact" aria-labelledby="${escapeHtml(headingId)}" data-artifact-id="${escapeHtml(input.artifact.id)}" data-evidence-notebook-panel data-evidence-preserve-draft data-evidence-capture="${escapeHtml(input.artifact.id)}" data-evidence-contribution-id="${escapeHtml(input.slug)}:artifact:${escapeHtml(input.artifact.id)}">
    <div class="bio-artifact-heading"><div><p class="bio-section-label">Portfolio artifact ${input.number}</p><h2 id="${escapeHtml(headingId)}">${escapeHtml(input.artifact.title)}</h2></div><span>Draft checkpoint</span></div>
    <p>${escapeHtml(input.content.artifact.prompt)}</p><ul class="bio-evidence-requirements">${input.content.artifact.evidenceRequirements.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
    <div class="bio-artifact-fields">${input.artifact.fields.map((field) => {
      const id = artifactFieldId(input.slug, input.artifact.id, field.id);
      return `<label>${escapeHtml(field.label)} <span>Maximum ${field.maxLength} characters</span><textarea rows="4" maxlength="${field.maxLength}" data-bio-response-id="${escapeHtml(id)}" data-response-id="${escapeHtml(id)}" data-evidence-draft="detail" data-evidence-draft-label="${escapeHtml(field.label)}"></textarea></label>`;
    }).join("")}</div>
    ${renderRubric()}
    <p class="bio-submission-guidance"><strong>When your work is ready:</strong> save the draft here, then print or save it as a PDF—or copy the summary—and submit it using the assignment location your teacher provides.</p>
    <div class="bio-artifact-actions"><button type="button" class="bio-primary-button" data-save-artifact="${escapeHtml(input.artifact.id)}" data-save-evidence-note>Save artifact draft</button><button type="button" data-print-artifact="${escapeHtml(input.artifact.id)}">Print / Save as PDF</button><button type="button" data-copy-artifact="${escapeHtml(input.artifact.id)}">Copy summary</button><span data-artifact-status="${escapeHtml(input.artifact.id)}" data-save-status aria-live="polite">Draft not saved</span></div>
  </section>`;
}

function renderLesson(input: {
  contract: RemainingUnitContract;
  lesson: RemainingUnitContract["lessons"][number];
  content: Biology30LessonContent;
  practiceItems: Biology30ProductionPracticeItem[];
  artifact?: RemainingUnitContract["artifacts"][number];
  artifactNumber?: number;
  moduleTitle: string;
}) {
  const slug = input.contract.project.slug;
  const interaction = input.contract.interactions.find((entry) => entry.lessonId === input.lesson.id);
  if (!interaction) throw new Error(`${input.lesson.id} has no interaction contract.`);
  const warmupId = lessonResponseId(slug, input.lesson.id, "warmup");
  const exitId = lessonResponseId(slug, input.lesson.id, "exit");
  const sections = input.content.sections.map((section, index) => `<section class="bio-section" aria-labelledby="${escapeHtml(input.lesson.id)}-section-${index + 1}">${section.label ? `<p class="bio-section-label">${escapeHtml(section.label)}</p>` : ""}<h2 id="${escapeHtml(input.lesson.id)}-section-${index + 1}">${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${index === 1 ? renderConceptMap(input.content, input.lesson) : ""}${section.table ? renderTable(section.table) : ""}</section>`).join("");
  const evidenceCheckpoint = input.artifact
    ? renderArtifact({ slug, artifact: input.artifact, content: input.content, number: input.artifactNumber ?? 1 })
    : `<aside class="bio-section bio-callout" aria-labelledby="${escapeHtml(input.lesson.id)}-evidence-link"><p class="bio-section-label">Portfolio connection</p><h2 id="${escapeHtml(input.lesson.id)}-evidence-link">Build evidence as you go</h2><p>${escapeHtml(input.content.artifact.prompt)} Record useful observations in the Investigation Notebook; the structured artifact fields appear at the final checkpoint for this evidence thread.</p></aside>`;
  return `<div class="bio-route bio-lesson" data-biology-lesson="${escapeHtml(input.lesson.id)}">
    <header class="bio-lesson-header"><p class="bio-course-code">Lesson ${input.lesson.order} · ${escapeHtml(input.moduleTitle)}</p><h1>${escapeHtml(input.lesson.title)}</h1><p class="bio-inquiry">${escapeHtml(input.lesson.inquiry)}</p><dl class="bio-lesson-meta"><div><dt>Required time</dt><dd>${input.lesson.requiredMinutes} minutes</dd></div><div><dt>Optional extension</dt><dd>${input.lesson.optionalMinutes} minutes</dd></div><div><dt>Outcomes</dt><dd>${input.lesson.outcomeIds.map(escapeHtml).join(", ")}</dd></div></dl></header>
    <aside class="bio-callout bio-callout--safety" aria-labelledby="${escapeHtml(input.lesson.id)}-readiness"><h2 id="${escapeHtml(input.lesson.id)}-readiness">Materials and safety</h2><p><strong>Materials:</strong> ${escapeHtml(input.content.materials)}</p><p><strong>Safety:</strong> ${escapeHtml(input.content.safety)}</p></aside>
    <section class="bio-learning-targets" aria-labelledby="${escapeHtml(input.lesson.id)}-targets"><div><p class="bio-section-label">Learning intention</p><h2 id="${escapeHtml(input.lesson.id)}-targets">${escapeHtml(input.content.learningIntention)}</h2></div><div><p class="bio-section-label">Success criteria</p><ul aria-label="Lesson success criteria">${input.content.successCriteria.map((target) => `<li>${escapeHtml(target.startsWith("I can ") ? target : `I can ${sentenceCase(target)}`)}</li>`).join("")}</ul></div></section>
    <section class="bio-section bio-retrieval" aria-labelledby="${escapeHtml(input.lesson.id)}-retrieval"><div><p class="bio-section-label">Retrieve</p><h2 id="${escapeHtml(input.lesson.id)}-retrieval">${escapeHtml(input.content.warmup.title)}</h2><p>${escapeHtml(input.content.warmup.prompt)}</p></div><label class="bio-response-label" for="${escapeHtml(input.lesson.id)}-warmup">Record your thinking <span>autosaves</span></label><textarea id="${escapeHtml(input.lesson.id)}-warmup" rows="3" maxlength="300" data-bio-response-id="${escapeHtml(warmupId)}" data-bio-autosave placeholder="${escapeHtml(input.content.warmup.placeholder)}"></textarea><p class="bio-save-status" data-bio-status-for="${escapeHtml(warmupId)}" aria-live="polite">Not saved yet</p></section>
    ${sections}
    ${renderInteraction(input.content, interaction.id, input.lesson.id)}
    <section class="bio-section bio-practice" aria-labelledby="${escapeHtml(input.lesson.id)}-practice" data-bio-practice="${escapeHtml(input.lesson.id)}"><p class="bio-section-label">Guided practice</p><h2 id="${escapeHtml(input.lesson.id)}-practice">Check the mechanism</h2><p>Submit each answer for explanatory feedback. Your choices and feedback state are saved.</p><div class="bio-practice-list" data-practice-set="${escapeHtml(input.lesson.id)}">${input.practiceItems.map(renderPracticeItem).join("")}</div></section>
    ${evidenceCheckpoint}
    <section class="bio-section bio-exit" aria-labelledby="${escapeHtml(input.lesson.id)}-exit"><p class="bio-section-label">Exit check</p><h2 id="${escapeHtml(input.lesson.id)}-exit">${escapeHtml(input.content.exit.title)}</h2><label for="${escapeHtml(input.lesson.id)}-exit-response">${escapeHtml(input.content.exit.prompt)}</label><textarea id="${escapeHtml(input.lesson.id)}-exit-response" rows="4" maxlength="300" data-bio-response-id="${escapeHtml(exitId)}" placeholder="${escapeHtml(input.content.exit.placeholder)}"></textarea><div class="bio-exit-actions"><button type="button" class="bio-primary-button" data-complete-bio-lesson="${escapeHtml(input.lesson.id)}">Save exit and complete lesson</button><span data-lesson-status="${escapeHtml(input.lesson.id)}" aria-live="polite">Exit response required</span></div></section>
    ${input.lesson.optionalMinutes ? `<details class="bio-extension"><summary>Optional extension · ${input.lesson.optionalMinutes} minutes</summary><p>Revisit <strong>${escapeHtml(input.content.interaction.title)}</strong>, compare all three cases, and change one assumption. Predict the evidence that would support the revision and the evidence that would make you reject it. Optional work never blocks required completion.</p></details>` : ""}
    <details class="bio-sources"><summary>Lesson sources and scientific basis</summary><p>${escapeHtml(input.content.sourceSummary)} Required instruction is local; external authorities are citations, not completion dependencies.</p></details>
  </div>`;
}

function renderOverview(contract: RemainingUnitContract) {
  const unitTitle = UNIT_LABELS[contract.unitCode];
  const leadingQuestion = contract.unitCode === "B"
    ? "How does biological information coordinate reproduction, development, and continuity?"
    : contract.unitCode === "C"
      ? "How can cells preserve, recombine, express, and change genetic information?"
      : "How do genes, interactions, and environmental limits shape populations through time?";
  const lede = contract.unitCode === "B"
    ? "Connect reproductive structures and hormones to gamete formation, fertilization, development, health evidence, and reproductive technologies."
    : contract.unitCode === "C"
      ? "Move from chromosome behaviour to inheritance probabilities, DNA expression, mutation, biotechnology, and evidence-based genetic decisions."
      : "Connect allele-frequency change to species interactions, succession, population growth, and defensible, monitored management decisions.";
  const criteria = contract.unitCode === "B"
    ? ["I can explain reproductive structures, gamete formation, hormone feedback, fertilization, development, and birth.", "I can interpret reproductive data and evaluate health or technology claims without diagnosing individuals.", "I can build evidence-based explanations that respect variation, uncertainty, rights, and informed decision-making."]
    : contract.unitCode === "C"
      ? ["I can trace chromosomes through mitosis and meiosis and connect their behaviour to inheritance patterns.", "I can solve genetic problems, analyze pedigrees and molecular evidence, and state model limits.", "I can explain DNA replication and expression and evaluate biotechnology evidence, uncertainty, and social implications."]
      : ["I can calculate and interpret allele, genotype, abundance, density, and growth evidence.", "I can explain how evolutionary forces, species interactions, disturbance, and limiting factors shape populations.", "I can compare alternatives and make an adaptive management recommendation with indicators and revision rules."];
  const modules = contract.modules.map((module) => {
    const moduleLessons = contract.lessons.filter((lesson) => module.lessonIds.includes(lesson.id));
    return `<li><strong>${escapeHtml(module.title)}</strong><span>${escapeHtml(moduleLessons.map((lesson) => lesson.title).join(" · "))}</span></li>`;
  }).join("");
  return `<div class="bio-route bio-overview">
    <header class="bio-overview-header"><div><p class="bio-course-code">BIO 30 · Unit ${contract.unitCode}</p><h1>${escapeHtml(leadingQuestion)}</h1><p class="bio-lede">${escapeHtml(lede)}</p></div><dl class="bio-overview-facts" aria-label="Unit facts"><div><dt>Required learning</dt><dd>${(contract.delivery.requiredMinutes / 60).toFixed(1)} hours</dd></div><div><dt>Lessons</dt><dd>${contract.lessons.length}</dd></div><div><dt>Portfolio artifacts</dt><dd>${contract.artifacts.length}</dd></div></dl></header>
    <section class="bio-learning-targets" aria-labelledby="overview-learning-intention"><div><p class="bio-section-label">Learning intention</p><h2 id="overview-learning-intention">I am learning to use models and evidence to explain ${escapeHtml(sentenceCase(unitTitle))}.</h2></div><div><p class="bio-section-label">Success criteria</p><ul aria-label="Unit success criteria">${criteria.map((criterion) => `<li>${escapeHtml(criterion)}</li>`).join("")}</ul></div></section>
    <section class="bio-section" aria-labelledby="overview-journey"><h2 id="overview-journey">The learning journey</h2><p>Every lesson begins with a phenomenon, develops a scientific explanation in short sections, makes the mechanism visible in an original semantic model, tests reasoning with a local evidence interaction, and saves a concise exit response. Required learning works without internet access.</p><ol class="bio-module-sequence">${modules}</ol></section>
    <section class="bio-section bio-two-column" aria-labelledby="overview-evidence"><div><h2 id="overview-evidence">What you will make</h2><p>Your Investigation Notebook gathers ${contract.artifacts.length} structured portfolio artifacts. Each artifact asks for a claim, evidence, reasoning, and limits. Drafts save as you work, and each checkpoint can be printed, saved as a PDF, or copied for submission.</p><p>The Practice Hub contains ${contract.assessment.practiceBlueprint.total} non-graded checks with immediate explanatory feedback. Your teacher will provide the secure Unit ${contract.unitCode} test separately.</p></div><aside class="bio-callout bio-callout--safety" aria-labelledby="overview-safety"><h2 id="overview-safety">Evidence and safety</h2><p>Investigations use safe observation, local models, or supplied data. Synthetic datasets are labelled. Course activities are educational, not medical, genetic, ecological, or legal advice for a real person or population.</p></aside></section>
    <section class="bio-section" aria-labelledby="overview-use"><h2 id="overview-use">How to use this course</h2><div class="bio-process-grid"><article><span aria-hidden="true">1</span><h3>Learn</h3><p>Read the short sections and use the labelled concept model.</p></article><article><span aria-hidden="true">2</span><h3>Test</h3><p>Inspect cases and describe evidence before explaining it.</p></article><article><span aria-hidden="true">3</span><h3>Check</h3><p>Use targeted practice feedback to revise your mechanism.</p></article><article><span aria-hidden="true">4</span><h3>Save</h3><p>Complete the exit response and preserve useful evidence.</p></article></div><div class="bio-start-row"><a class="bio-primary-action" href="#${escapeHtml(contract.lessons[0].id)}" data-page-target="${escapeHtml(contract.lessons[0].id)}">Begin Lesson 1</a><a class="bio-secondary-action" href="#model-lab" data-page-target="model-lab">Open the Model Lab</a></div></section>
  </div>`;
}

function renderModelLab(contract: RemainingUnitContract, contents: Map<string, Biology30LessonContent>) {
  const cards = contract.interactions.map((interaction) => {
    const lesson = contract.lessons.find((entry) => entry.id === interaction.lessonId)!;
    const content = contents.get(lesson.id)!;
    const module = contract.modules.find((entry) => entry.id === lesson.moduleId)!;
    return `<article class="bio-hub-card"><div><p>${escapeHtml(module.title)}</p><h2>${escapeHtml(content.interaction.title)}</h2><span data-model-status="${escapeHtml(interaction.id)}">Not started</span></div><p>${escapeHtml(interaction.completionRule)}</p><a href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}" data-open-bio-model="${escapeHtml(interaction.id)}" aria-label="Open ${escapeHtml(content.interaction.title)}">Open model</a></article>`;
  }).join("");
  return `<div class="bio-route bio-hub"><header class="bio-hub-header"><p class="bio-course-code">Unit workspace</p><h1>Model Lab</h1><p>Open any local evidence model directly. Every interaction works by keyboard, saves relevant state, and includes a complete static equivalent.</p></header><div class="bio-hub-grid" data-model-index>${cards}</div><section class="bio-section" aria-labelledby="model-method"><h2 id="model-method">Use a model like a scientist</h2><ol class="bio-numbered-method"><li><strong>Name the question.</strong> Identify the variable, population, process, or relationship.</li><li><strong>Inspect one case.</strong> Describe the evidence before choosing an explanation.</li><li><strong>Compare alternatives.</strong> Ask what another mechanism would predict.</li><li><strong>State the limit.</strong> Explain what the simplified model cannot establish.</li><li><strong>Save the reasoning.</strong> Carry useful evidence into an exit response or artifact.</li></ol></section></div>`;
}

function renderNotebook(contract: RemainingUnitContract) {
  return `<div class="bio-route bio-hub"><header class="bio-hub-header"><p class="bio-course-code">Unit workspace</p><h1>Investigation Notebook</h1><p>Keep observations, calculations, model evidence, and artifact drafts together. Removing a notebook entry never deletes its original lesson response.</p></header><section class="bio-notebook-composer" aria-labelledby="notebook-new-entry"><h2 id="notebook-new-entry">Add a notebook entry</h2><div class="bio-notebook-fields"><label>Title<input type="text" maxlength="60" data-notebook-title placeholder="Example: Evidence pattern"></label><label>Observation or reasoning<textarea rows="5" maxlength="540" data-notebook-body placeholder="Record evidence, mechanism, uncertainty, and one next question."></textarea></label></div><div class="bio-notebook-actions"><button type="button" class="bio-primary-button" data-save-notebook-entry>Save entry</button><button type="button" data-clear-notebook-draft>Clear draft</button><span data-notebook-status aria-live="polite">Nothing saved yet</span></div></section><section class="bio-section" aria-labelledby="notebook-saved"><div class="bio-section-heading-row"><div><p class="bio-section-label">Saved work</p><h2 id="notebook-saved">Notebook entries</h2></div><span data-notebook-count>0 of 10 entries</span></div><div class="bio-notebook-list" data-notebook-list><p class="bio-empty-state">Saved entries will appear here.</p></div></section><section class="bio-section" aria-labelledby="notebook-artifacts"><div class="bio-section-heading-row"><div><p class="bio-section-label">Portfolio</p><h2 id="notebook-artifacts">Artifact checkpoints</h2></div><span data-artifact-count>0 of ${contract.artifacts.length} available artifacts saved</span></div><div class="bio-artifact-index" data-artifact-index></div></section><div class="bio-notebook-export"><button type="button" data-print-notebook data-worksheet-print>Print / Save as PDF</button><button type="button" data-copy-notebook>Copy notebook summary</button><span data-notebook-export-status aria-live="polite"></span></div></div>`;
}

function renderPracticeHub(contract: RemainingUnitContract, items: Biology30ProductionPracticeItem[]) {
  const lessonCards = contract.lessons.map((lesson) => `<article class="bio-hub-card"><div><p>Lesson ${lesson.order}</p><h2>${escapeHtml(lesson.title)}</h2><span data-practice-set-status="${escapeHtml(lesson.id)}">0 of ${items.filter((item) => item.setId === lesson.id).length} submitted</span></div><p>${escapeHtml(lesson.outcomeIds.join(", "))}</p><a href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}" data-open-bio-practice="${escapeHtml(lesson.id)}" aria-label="Open practice for Lesson ${lesson.order}: ${escapeHtml(lesson.title)}">Open lesson practice</a></article>`).join("");
  const moduleGroups = contract.modules.map((module, index) => {
    const setId = `module-${index + 1}`;
    const setItems = items.filter((item) => item.setId === setId);
    return `<details class="bio-practice-group"><summary><span>${escapeHtml(module.title)}</span><strong data-practice-set-status="${setId}">0 of ${setItems.length} submitted</strong></summary><div class="bio-practice-list">${setItems.map(renderPracticeItem).join("")}</div></details>`;
  }).join("");
  const finalItems = items.filter((item) => item.setId === "final-practice");
  return `<div class="bio-route bio-hub"><header class="bio-hub-header"><p class="bio-course-code">Unit workspace</p><h1>Practice Hub</h1><p>Practice is non-graded. Use feedback to repair the mechanism, then retry. Saved choices return after reload.</p></header><div class="bio-practice-overview" aria-label="Practice progress"><div><strong data-practice-complete-count>0</strong><span>of ${items.length} checks submitted</span></div><div class="bio-practice-meter" aria-hidden="true"><span data-practice-progress-fill></span></div></div><section class="bio-section" aria-labelledby="practice-lessons-title"><h2 id="practice-lessons-title">Lesson checks</h2><p>Open a lesson directly at its guided practice. Each item gives targeted feedback for common reasoning errors.</p><div class="bio-hub-grid" data-lesson-practice-index>${lessonCards}</div></section><section class="bio-section" aria-labelledby="practice-modules-title"><p class="bio-section-label">Mixed retrieval</p><h2 id="practice-modules-title">Module checks</h2><p>These sets combine evidence across each module and save every submitted choice.</p><div data-module-practice>${moduleGroups}</div></section><section class="bio-section bio-final-practice" aria-labelledby="practice-final-title"><p class="bio-section-label">Unit integration</p><h2 id="practice-final-title">${finalItems.length}-item final practice</h2><p>Apply Unit ${contract.unitCode} ideas in unfamiliar contexts. Submit once to record a formative percentage; this is not the secure Unit ${contract.unitCode} test.</p><div class="bio-final-practice-status"><strong data-final-practice-status>Not submitted</strong><span data-final-practice-score aria-live="polite"></span></div><div class="bio-practice-list" data-final-practice>${finalItems.map(renderPracticeItem).join("")}</div><button type="button" class="bio-primary-button" data-submit-final-practice>Submit final practice</button></section><section class="bio-section" aria-labelledby="practice-strategy"><h2 id="practice-strategy">When an answer is wrong</h2><ol class="bio-numbered-method"><li>Read the targeted feedback and name the misconception.</li><li>Return to the relevant model or evidence table.</li><li>Explain why the selected distractor fails.</li><li>Choose again only after revising the mechanism.</li></ol></section></div>`;
}

function renderGlossaryAndData(input: { contract: RemainingUnitContract; contents: Biology30LessonContent[]; glossary: Record<string, string> }) {
  const terms = [...new Set(input.contents.flatMap((content) => content.glossaryTerms))].sort((left, right) => left.localeCompare(right));
  const missing = terms.filter((term) => !input.glossary[term]?.trim());
  if (missing.length) throw new Error(`Unit ${input.contract.unitCode} glossary is missing definitions: ${missing.join(", ")}.`);
  const entries = terms.map((term) => `<article><h3>${escapeHtml(term)}</h3><p>${escapeHtml(input.glossary[term])}</p></article>`).join("");
  const rows = input.contract.lessons.map((lesson) => `<tr><th scope="row"><a href="#${escapeHtml(lesson.id)}" data-page-target="${escapeHtml(lesson.id)}">Lesson ${lesson.order}</a></th><td>${escapeHtml(lesson.title)}</td><td>Synthetic or source-adapted instructional evidence</td><td>Model, calculation, investigation, or decision reasoning</td></tr>`).join("");
  return `<div class="bio-route bio-hub"><header class="bio-hub-header"><p class="bio-course-code">Reference workspace</p><h1>Glossary and Data</h1><p>Use precise terms to read models and evidence. Definitions explain how each term functions in this unit rather than replacing lesson instruction.</p></header><section class="bio-section" aria-labelledby="glossary-title"><h2 id="glossary-title">Unit ${input.contract.unitCode} glossary</h2><div class="bio-glossary" data-glossary-index>${entries}</div></section><section class="bio-section" aria-labelledby="data-method-title"><h2 id="data-method-title">A reliable data-reading routine</h2><ol class="bio-numbered-method"><li><strong>Read the context, variables, units, and sample.</strong></li><li><strong>Describe before explaining.</strong> Name direction, magnitude, timing, and variation.</li><li><strong>Calculate transparently.</strong> Show symbols, substitution, result, units, and checks.</li><li><strong>Compare mechanisms.</strong> State another explanation and discriminating evidence.</li><li><strong>Bound the claim.</strong> Identify synthetic data, assumptions, uncertainty, and what cannot be concluded.</li></ol></section><section class="bio-section" aria-labelledby="data-register-title"><h2 id="data-register-title">Lesson evidence register</h2><div class="bio-table-wrap" role="region" aria-label="Dataset register" tabindex="0"><table><caption>Locally included instructional evidence</caption><thead><tr><th scope="col">Route</th><th scope="col">Topic</th><th scope="col">Status</th><th scope="col">Use</th></tr></thead><tbody>${rows}</tbody></table></div></section></div>`;
}

function renderSourcesAndCredits(contract: RemainingUnitContract) {
  const unitSources = contract.unitCode === "B"
    ? [
        { role: "Open scientific cross-check", title: "OpenStax Anatomy and Physiology 2e", href: "https://openstax.org/details/books/anatomy-and-physiology-2e", note: "Used as a factual cross-check under CC BY-NC-SA 4.0. Course explanations and figures are original; OpenStax text and artwork are not reproduced." },
        { role: "Current Canadian health guidance", title: "Sexual and reproductive health", href: "https://www.canada.ca/en/public-health/services/sexual-health.html", note: "Supports current, non-stigmatizing public-health language. No classroom activity provides diagnosis or individual medical advice." },
        { role: "Current Canadian health guidance", title: "Sexual health and preventing sexually transmitted infections", href: "https://www.canada.ca/en/services/health/campaigns/sexually-transmitted-infections.html", note: "Supports current prevention and testing framing in Lesson 7." },
        { role: "Current Canadian policy guidance", title: "Assisted human reproduction", href: "https://www.canada.ca/en/health-canada/services/drugs-health-products/biologics-radiopharmaceuticals-genetic-therapies/legislation-guidelines/assisted-human-reproduction.html", note: "Supports Canadian safety, consent, and technology context in Lesson 13." }
      ]
    : [
        { role: "Open scientific cross-check", title: "OpenStax Biology 2e", href: "https://openstax.org/details/books/biology-2e", note: "Used as a factual cross-check under CC BY-NC-SA 4.0. Course explanations and figures are original; OpenStax text and artwork are not reproduced." }
      ];
  const sources: Array<{ role: string; title: string; note: string; href?: string }> = [
    { role: "Curriculum authority", title: "Alberta Biology 20–30 Program of Studies", href: "https://education.alberta.ca/media/159727/bio203007.pdf", note: "Defines the required Unit outcomes and skills." },
    { role: "Performance authority", title: "Biology 30 Student Performance Standards", href: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf", note: "Guides evidence interpretation, application, and communication quality." },
    { role: "Assessment authority", title: "Biology 30 Information Bulletin", href: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf", note: "The current Biology-specific bulletin available at production intake." },
    ...unitSources,
    { role: "Authorized local source", title: "2026–27 Biology 30 classroom course", note: "Verified course source; secure tests and teacher-only material are excluded." },
    { role: "Authorized local source", title: "CBE system Biology 30 course (2020)", note: "Verified reference source, including normalized UTF-16 lessons." }
  ];
  const entries = sources.map((source) => `<article><div><p>${escapeHtml(source.role)}</p><h2>${escapeHtml(source.title)}</h2></div><p>${escapeHtml(source.note)}</p>${source.href ? `<a href="${escapeHtml(source.href)}" target="_blank" rel="noopener noreferrer" data-optional-enrichment>Optional source reference <span>— course completion does not depend on this link</span></a>` : "<span>Local authorized source; no learner download is required.</span>"}</article>`).join("");
  return `<div class="bio-route bio-hub"><header class="bio-hub-header"><p class="bio-course-code">Scientific basis</p><h1>Sources and Credits</h1><p>Required instruction, models, data, practice, and response tools are included in the course. The references below show the curriculum and scientific basis for the explanations you use.</p></header><section class="bio-section" aria-labelledby="source-authorities"><h2 id="source-authorities">Curriculum and scientific authorities</h2><div class="bio-source-list" data-source-list>${entries}</div></section><section class="bio-section bio-two-column" aria-labelledby="source-use"><div><h2 id="source-use">How sources were used</h2><p>The Alberta curriculum defines outcomes and performance expectations. Classroom and system-course materials establish local scope and useful examples. Current official or open sources help verify explanations and update older terminology.</p><p>Lessons are rebuilt as readable web instruction with local models, data, practice, and response tools.</p></div><aside class="bio-callout"><h2>Works offline</h2><p>No required lesson, model, font, image, script, video, or simulation needs internet access. External links here are optional citations only.</p></aside></section><section class="bio-section" aria-labelledby="source-licenses"><h2 id="source-licenses">Course asset credits</h2><ul><li>Hanken Grotesk and Work Sans are bundled under the SIL Open Font License.</li><li>Next Step Continuing Education branding is used for local course delivery.</li><li>Scientific concept figures and datasets are original or visibly labelled synthetic instructional material.</li></ul></section></div>`;
}

const BIOLOGY30_PRODUCTION_EXTRA_CSS = String.raw`
.bio-concept-figure {
  margin: 30px 0 6px;
  padding: 24px;
  border: 1px solid #cfd8d1;
  border-radius: 8px;
  background: #f8fbf8;
}
.bio-concept-figure-heading { margin-bottom: 18px; }
.bio-concept-figure-heading h3 { margin: 0; font-size: 1.28rem; }
.bio-concept-visual { position: relative; }
.bio-concept-flow {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: none;
}
.bio-concept-flow li {
  position: relative;
  min-width: 0;
  padding: 17px;
  border: 1px solid #bfcac2;
  border-radius: 6px;
  background: #fff;
}
.bio-concept-flow li > span {
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  margin-bottom: 10px;
  border: 1px solid #146c60;
  border-radius: 50%;
  color: #146c60;
  font-size: .82rem;
  font-weight: 800;
}
.bio-concept-flow strong { display: block; color: #154212; }
.bio-concept-flow p { margin: 6px 0 0; font-size: .94rem; line-height: 1.5; }
.bio-concept-connector { display: none; }

.bio-concept-flow--pathway li:not(:last-child)::after,
.bio-concept-flow--feedback li:not(:last-child)::after,
.bio-concept-flow--cycle li:not(:last-child)::after,
.bio-concept-flow--calculation li:not(:last-child)::after {
  content: "→";
  position: absolute;
  right: -21px;
  top: 50%;
  width: 18px;
  color: #146c60;
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
  transform: translateY(-50%);
}

.bio-concept-figure--pathway .bio-concept-flow li {
  border-top: 3px solid #146c60;
}

.bio-concept-figure--feedback .bio-concept-visual,
.bio-concept-figure--cycle .bio-concept-visual {
  padding-bottom: 30px;
}
.bio-concept-figure--feedback .bio-concept-flow li {
  border-top: 3px solid #a15c00;
}
.bio-concept-figure--feedback .bio-concept-connector,
.bio-concept-figure--cycle .bio-concept-connector {
  display: block;
  position: absolute;
  right: 10%;
  bottom: 2px;
  left: 10%;
  height: 17px;
  border-right: 2px solid #146c60;
  border-bottom: 2px solid #146c60;
  border-left: 2px solid #146c60;
}
.bio-concept-figure--feedback .bio-concept-connector { border-bottom-style: dashed; }
.bio-concept-figure--feedback .bio-concept-connector::before,
.bio-concept-figure--cycle .bio-concept-connector::before {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  width: 8px;
  height: 8px;
  border-top: 2px solid #146c60;
  border-left: 2px solid #146c60;
  transform: rotate(45deg);
}
.bio-concept-figure--cycle .bio-concept-flow li:nth-child(2) { border-top-color: #a15c00; }
.bio-concept-figure--cycle .bio-concept-flow li:nth-child(3) { border-top-color: #a43f35; }

.bio-concept-flow--timeline {
  position: relative;
  gap: 20px;
}
.bio-concept-flow--timeline::before {
  content: "";
  position: absolute;
  top: 25px;
  right: 8%;
  left: 8%;
  z-index: 0;
  border-top: 2px solid #146c60;
}
.bio-concept-flow--timeline li {
  z-index: 1;
  padding-top: 48px;
  border: 0;
  border-top: 3px solid #146c60;
  background: #fff;
  box-shadow: inset 0 0 0 1px #d5ddd7;
}
.bio-concept-flow--timeline li > span {
  position: absolute;
  top: 9px;
  left: 16px;
  margin: 0;
  background: #f8fbf8;
}

.bio-concept-flow--layers {
  grid-template-columns: 1fr;
  gap: 10px;
}
.bio-concept-flow--layers li {
  display: grid;
  grid-template-columns: 34px minmax(130px, .55fr) minmax(0, 1.45fr);
  gap: 14px;
  align-items: start;
  padding: 15px 16px;
  border: 0;
  border-left: 5px solid #146c60;
  border-radius: 0 5px 5px 0;
  box-shadow: inset 0 0 0 1px #d5ddd7;
}
.bio-concept-flow--layers li:nth-child(2) { margin-left: 28px; border-left-color: #a15c00; }
.bio-concept-flow--layers li:nth-child(3) { margin-left: 56px; border-left-color: #a43f35; }
.bio-concept-flow--layers li > span { margin: 0; }
.bio-concept-flow--layers strong { padding-top: 4px; }
.bio-concept-flow--layers p { margin: 3px 0 0; }

.bio-concept-flow--comparison { gap: 0; border: 1px solid #c7d0c9; background: #fff; }
.bio-concept-flow--comparison li {
  border: 0;
  border-radius: 0;
  background: transparent;
}
.bio-concept-flow--comparison li + li { border-left: 1px solid #c7d0c9; }
.bio-concept-flow--comparison li > span { border-radius: 3px; }

.bio-concept-figure--calculation { background: #fbfcf9; }
.bio-concept-flow--calculation li {
  border: 1px solid #88958b;
  border-radius: 3px;
  box-shadow: 4px 4px 0 #e3e8e3;
}
.bio-concept-flow--calculation li > span { border-radius: 3px; }

.bio-concept-figure--evidence .bio-concept-visual { padding-bottom: 25px; }
.bio-concept-flow--evidence li {
  border: 0;
  border-bottom: 3px solid #146c60;
  border-radius: 5px 5px 0 0;
  box-shadow: inset 0 0 0 1px #d5ddd7;
}
.bio-concept-flow--evidence li:nth-child(2) { border-bottom-color: #a15c00; }
.bio-concept-flow--evidence li:nth-child(3) { border-bottom-color: #a43f35; }
.bio-concept-figure--evidence .bio-concept-connector {
  display: block;
  position: absolute;
  right: 15%;
  bottom: 2px;
  left: 15%;
  height: 14px;
  border-top: 2px solid #146c60;
}
.bio-concept-figure--evidence .bio-concept-connector::after {
  content: "";
  position: absolute;
  left: 50%;
  width: 2px;
  height: 14px;
  background: #146c60;
}

.bio-concept-flow--network {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 30px 24px;
}
.bio-concept-flow--network li:first-child {
  grid-column: 1 / -1;
  width: 58%;
  justify-self: center;
  border-top: 3px solid #154212;
}
.bio-concept-flow--network li:nth-child(2),
.bio-concept-flow--network li:nth-child(3) { border-top: 3px solid #146c60; }
.bio-concept-figure--network .bio-concept-connector {
  display: block;
  position: absolute;
  top: 50%;
  right: 25%;
  left: 25%;
  height: 18%;
  border-top: 2px solid #146c60;
  border-right: 2px solid #146c60;
  border-left: 2px solid #146c60;
  pointer-events: none;
}

.bio-model--grammar > p { max-width: 72ch; }
.bio-model-case-selector {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  margin: 24px 0 0;
}
.bio-model-case-option {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  grid-template-areas: "marker title" "marker action";
  gap: 3px 12px;
  align-content: start;
  width: 100%;
  min-width: 0;
  min-height: 126px;
  padding: 17px !important;
  border: 1px solid #bfcac2 !important;
  border-radius: 6px !important;
  background: #fff !important;
  color: #171b1b !important;
  font-size: 1rem;
  line-height: 1.35;
  text-align: left;
  box-shadow: none;
}
.bio-model-case-marker {
  grid-area: marker;
  display: inline-grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid #146c60;
  border-radius: 50%;
  color: #146c60;
  font-size: .82rem;
  font-weight: 800;
}
.bio-model-case-option strong {
  grid-area: title;
  min-width: 0;
  color: #154212;
  overflow-wrap: anywhere;
}
.bio-model-case-action {
  grid-area: action;
  color: #5b635d;
  font-size: .82rem;
  font-weight: 560;
}
.bio-model-case-option:hover { border-color: #75847a !important; }
.bio-model-case-option:focus-visible {
  outline: 3px solid rgb(20 108 96 / .45);
  outline-offset: 3px;
}
.bio-model-case-option[aria-pressed="true"] {
  border-color: #154212 !important;
  background: #edf5ec !important;
  box-shadow: inset 0 0 0 1px #154212;
}
.bio-model-case-option[aria-pressed="true"] .bio-model-case-marker {
  border-color: #154212;
  background: #154212;
  color: #fff;
}
.bio-model-case-actions {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-top: 14px;
}
.bio-model-case-actions p {
  margin: 0;
  color: #5b635d;
  font-size: .86rem;
}
.bio-model-case-actions button { flex: 0 0 auto; }

.bio-model-case-selector--pathway .bio-model-case-option,
.bio-model-case-selector--feedback .bio-model-case-option,
.bio-model-case-selector--cycle .bio-model-case-option { border-top: 3px solid #146c60 !important; }
.bio-model-case-selector--feedback .bio-model-case-option { border-top-color: #a15c00 !important; }
.bio-model-case-selector--cycle .bio-model-case-option:nth-child(2) { border-top-color: #a15c00 !important; }
.bio-model-case-selector--cycle .bio-model-case-option:nth-child(3) { border-top-color: #a43f35 !important; }
.bio-model-case-selector--pathway .bio-model-case-option:not(:last-child)::after,
.bio-model-case-selector--feedback .bio-model-case-option:not(:last-child)::after,
.bio-model-case-selector--cycle .bio-model-case-option:not(:last-child)::after,
.bio-model-case-selector--calculation .bio-model-case-option:not(:last-child)::after {
  content: "→";
  position: absolute;
  top: 50%;
  right: -22px;
  z-index: 2;
  width: 20px;
  color: #146c60;
  font-size: 1.25rem;
  font-weight: 800;
  text-align: center;
  transform: translateY(-50%);
  pointer-events: none;
}

.bio-model-case-selector--timeline {
  gap: 20px;
}
.bio-model-case-selector--timeline::before {
  content: "";
  position: absolute;
  top: 29px;
  right: 8%;
  left: 8%;
  border-top: 2px solid #146c60;
  pointer-events: none;
}
.bio-model-case-selector--timeline .bio-model-case-option {
  grid-template-columns: 1fr;
  grid-template-areas: "title" "action";
  padding-top: 56px !important;
  border-top: 3px solid #146c60 !important;
}
.bio-model-case-selector--timeline .bio-model-case-marker {
  position: absolute;
  top: 12px;
  left: 16px;
  z-index: 1;
  background: #fff;
}
.bio-model-case-selector--timeline .bio-model-case-option[aria-pressed="true"] .bio-model-case-marker { background: #154212; }

.bio-model-case-selector--layers {
  grid-template-columns: 1fr;
  gap: 10px;
}
.bio-model-case-selector--layers .bio-model-case-option {
  min-height: 90px;
  border: 0 !important;
  border-left: 5px solid #146c60 !important;
  border-radius: 0 5px 5px 0 !important;
  box-shadow: inset 0 0 0 1px #d5ddd7;
}
.bio-model-case-selector--layers .bio-model-case-option:nth-child(2) { margin-left: 24px; width: calc(100% - 24px); border-left-color: #a15c00 !important; }
.bio-model-case-selector--layers .bio-model-case-option:nth-child(3) { margin-left: 48px; width: calc(100% - 48px); border-left-color: #a43f35 !important; }
.bio-model-case-selector--layers .bio-model-case-option[aria-pressed="true"] { box-shadow: inset 0 0 0 2px #154212; }

.bio-model-case-selector--comparison {
  gap: 0;
  border: 1px solid #bfcac2;
  background: #fff;
}
.bio-model-case-selector--comparison .bio-model-case-option {
  border: 0 !important;
  border-radius: 0 !important;
}
.bio-model-case-selector--comparison .bio-model-case-option + .bio-model-case-option { border-left: 1px solid #bfcac2 !important; }
.bio-model-case-selector--comparison .bio-model-case-marker { border-radius: 3px; }

.bio-model-case-selector--calculation .bio-model-case-option {
  border-color: #88958b !important;
  border-radius: 3px !important;
  box-shadow: 4px 4px 0 #e3e8e3;
}
.bio-model-case-selector--calculation .bio-model-case-marker { border-radius: 3px; }
.bio-model-case-selector--calculation .bio-model-case-option[aria-pressed="true"] { box-shadow: inset 0 0 0 1px #154212, 4px 4px 0 #cdd8ce; }

.bio-model-case-selector--evidence .bio-model-case-option {
  border: 0 !important;
  border-bottom: 3px solid #146c60 !important;
  border-radius: 5px 5px 0 0 !important;
  box-shadow: inset 0 0 0 1px #d5ddd7;
}
.bio-model-case-selector--evidence .bio-model-case-option:nth-child(2) { border-bottom-color: #a15c00 !important; }
.bio-model-case-selector--evidence .bio-model-case-option:nth-child(3) { border-bottom-color: #a43f35 !important; }
.bio-model-case-selector--evidence .bio-model-case-option[aria-pressed="true"] { box-shadow: inset 0 0 0 2px #154212; }

.bio-model-case-selector--network {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  row-gap: 30px;
}
.bio-model-case-selector--network .bio-model-case-option:first-child {
  grid-column: 1 / -1;
  justify-self: center;
  width: 58%;
  border-top: 3px solid #154212 !important;
}
.bio-model-case-selector--network .bio-model-case-option:nth-child(2),
.bio-model-case-selector--network .bio-model-case-option:nth-child(3) { border-top: 3px solid #146c60 !important; }

.bio-concept-figure figcaption { margin-top: 18px; color: #4d5750; font-size: .9rem; }
.bio-concept-figure figcaption > p { margin: 0; }
.bio-figure-equivalent { margin-top: 10px; border-top: 1px solid #d6ddd7; padding-top: 8px; }
.bio-figure-equivalent summary { width: fit-content; color: #154212; cursor: pointer; font-weight: 700; }
.bio-figure-equivalent p { margin: 10px 0 0; }
@media (max-width: 760px) {
  .bio-concept-flow,
  .bio-concept-flow--network { grid-template-columns: 1fr; gap: 18px; }
  .bio-concept-flow--network li:first-child { grid-column: auto; width: auto; }
  .bio-model-case-selector,
  .bio-model-case-selector--network { grid-template-columns: 1fr; gap: 18px; }
  .bio-model-case-selector--network .bio-model-case-option:first-child { grid-column: auto; width: 100%; }
  .bio-model-case-selector--layers .bio-model-case-option:nth-child(2),
  .bio-model-case-selector--layers .bio-model-case-option:nth-child(3) { margin-left: 0; width: 100%; }
  .bio-model-case-selector--comparison { gap: 0; }
  .bio-model-case-selector--comparison .bio-model-case-option + .bio-model-case-option { border-top: 1px solid #bfcac2 !important; border-left: 0 !important; }
  .bio-model-case-selector--timeline::before { top: 18px; right: auto; bottom: 18px; left: 30px; border-top: 0; border-left: 2px solid #146c60; }
  .bio-model-case-selector--timeline .bio-model-case-option {
    grid-template-columns: 40px minmax(0, 1fr);
    grid-template-areas: "marker title" "marker action";
    padding-top: 17px !important;
    padding-left: 17px !important;
  }
  .bio-model-case-selector--timeline .bio-model-case-marker { position: relative; top: auto; left: auto; }
  .bio-model-case-selector--pathway .bio-model-case-option:not(:last-child)::after,
  .bio-model-case-selector--feedback .bio-model-case-option:not(:last-child)::after,
  .bio-model-case-selector--cycle .bio-model-case-option:not(:last-child)::after,
  .bio-model-case-selector--calculation .bio-model-case-option:not(:last-child)::after {
    content: "↓";
    top: auto;
    right: auto;
    bottom: -21px;
    left: 50%;
    transform: translateX(-50%);
  }
  .bio-model-case-actions { align-items: stretch; flex-direction: column; }
  .bio-model-case-actions button { align-self: start; }
  .bio-concept-flow--layers li { grid-template-columns: 32px 1fr; gap: 10px 12px; }
  .bio-concept-flow--layers li:nth-child(2),
  .bio-concept-flow--layers li:nth-child(3) { margin-left: 0; }
  .bio-concept-flow--layers p { grid-column: 2; }
  .bio-concept-flow--comparison { gap: 0; }
  .bio-concept-flow--comparison li + li { border-top: 1px solid #c7d0c9; border-left: 0; }
  .bio-concept-flow--timeline::before { top: 18px; right: auto; bottom: 18px; left: 29px; border-top: 0; border-left: 2px solid #146c60; }
  .bio-concept-flow--timeline li { padding-top: 17px; padding-left: 58px; }
  .bio-concept-flow--timeline li > span { top: 15px; left: 15px; }
  .bio-concept-flow--pathway li:not(:last-child)::after,
  .bio-concept-flow--feedback li:not(:last-child)::after,
  .bio-concept-flow--cycle li:not(:last-child)::after,
  .bio-concept-flow--calculation li:not(:last-child)::after {
    content: "↓";
    right: auto;
    left: 50%;
    top: auto;
    bottom: -20px;
    transform: translateX(-50%);
  }
  .bio-concept-figure--feedback .bio-concept-visual,
  .bio-concept-figure--cycle .bio-concept-visual,
  .bio-concept-figure--evidence .bio-concept-visual { padding-bottom: 0; }
  .bio-concept-figure--feedback .bio-concept-connector,
  .bio-concept-figure--cycle .bio-concept-connector,
  .bio-concept-figure--evidence .bio-concept-connector,
  .bio-concept-figure--network .bio-concept-connector { display: none; }
}
`;

export function renderBiology30ProductionUnit(input: {
  contract: RemainingUnitContract;
  contents: Biology30LessonContent[];
  glossary: Record<string, string>;
}) : Biology30ProductionRenderResult {
  const { contract } = input;
  validateBiology30ConceptFigureGrammar(contract.lessons.map((lesson) => lesson.id));
  const contentById = new Map(input.contents.map((content) => [content.id, content]));
  if (input.contents.length !== contract.lessons.length || contract.lessons.some((lesson) => !contentById.has(lesson.id))) {
    throw new Error(`Unit ${contract.unitCode} learner content does not exactly match its ${contract.lessons.length}-lesson contract.`);
  }
  const practiceItems = buildPracticeBank(contract, input.contents);
  const artifactPlacement = new Map<string, RemainingUnitContract["artifacts"][number]>();
  for (const artifact of contract.artifacts) {
    const placementLessonId = artifact.lessonIds.at(-1);
    if (!placementLessonId) throw new Error(`Artifact ${artifact.id} has no lesson placement.`);
    artifactPlacement.set(placementLessonId, artifact);
  }
  const moduleById = new Map(contract.modules.map((module) => [module.id, module]));
  const lessons: NextStepShellLesson[] = contract.lessons.map((lesson) => {
    const content = contentById.get(lesson.id)!;
    const artifact = artifactPlacement.get(lesson.id);
    const module = moduleById.get(lesson.moduleId);
    if (!module) throw new Error(`${lesson.id} references an unknown module ${lesson.moduleId}.`);
    return {
      id: lesson.id,
      sequenceNumber: lesson.order,
      title: lesson.title,
      summary: lesson.inquiry,
      group: module.title,
      html: renderLesson({
        contract,
        lesson,
        content,
        practiceItems: practiceItems.filter((item) => item.setId === lesson.id),
        artifact,
        artifactNumber: artifact ? contract.artifacts.indexOf(artifact) + 1 : undefined,
        moduleTitle: module.title
      })
    };
  });
  const artifactActivities = contract.artifacts.map((artifact) => ({
    id: artifact.id,
    title: artifact.title,
    fields: artifact.fields.map((field) => ({ ...field, id: artifactFieldId(contract.project.slug, artifact.id, field.id) }))
  }));
  const interactionActivities = contract.interactions.map((interaction) => {
    const content = contentById.get(interaction.lessonId)!;
    return { id: interaction.id, lessonId: interaction.lessonId, title: content.interaction.title, options: content.interaction.cases.map((entry) => ({ ...entry })) };
  });
  const activities = { interactions: interactionActivities, practiceItems, artifacts: artifactActivities };
  const suspendDataSchema = buildBiology30SuspendDataSchema({
    courseSlug: contract.project.slug,
    lessonIds: contract.lessons.map((lesson) => lesson.id),
    activities
  });
  const learnerRouteIds = [...contract.learnerRoutes];
  const html = renderNextStepCourseShell({
    slug: contract.project.slug,
    courseTitle: contract.project.title,
    courseCode: "BIO 30",
    overviewIntro: "",
    overviewHtml: renderOverview(contract),
    outcomes: [],
    lessons,
    completionIds: contract.lessons.map((lesson) => lesson.id),
    completionLabel: "lesson exits",
    lessonGroupTitle: `Unit ${contract.unitCode}`,
    lessonSequenceTitle: `Unit ${contract.unitCode} lesson pathway`,
    nextAfterLastLesson: { id: "practice-hub", label: "Open Practice Hub" },
    navItems: [
      { id: "model-lab", label: "Model Lab", icon: "science", html: `<section id="model-lab" class="course-page course-page--authored" hidden>${renderModelLab(contract, contentById)}</section>` },
      { id: "investigation-notebook", label: "Investigation Notebook", icon: "edit_note", html: `<section id="investigation-notebook" class="course-page course-page--authored" hidden>${renderNotebook(contract)}</section>` },
      { id: "practice-hub", label: "Practice Hub", icon: "quiz", html: `<section id="practice-hub" class="course-page course-page--authored" hidden>${renderPracticeHub(contract, practiceItems)}</section>` },
      { id: "glossary-and-data", label: "Glossary and Data", icon: "glossary", html: `<section id="glossary-and-data" class="course-page course-page--authored" hidden>${renderGlossaryAndData({ contract, contents: input.contents, glossary: input.glossary })}</section>` },
      { id: "sources-and-credits", label: "Sources and Credits", icon: "source", html: `<section id="sources-and-credits" class="course-page course-page--authored" hidden>${renderSourcesAndCredits(contract)}</section>` }
    ],
    logoPath: "assets/brand/nxt-ce-logo-white-with-ce.png",
    storageKeyBase: contract.project.slug,
    showLessonSubnavHeadings: true,
    showLessonsIndex: false,
    showLessonCompletionButton: false,
    lessonPresentation: "authored",
    chromeAssets: "self-contained",
    extraHeadHtml: '<meta name="color-scheme" content="light">',
    extraCss: `${BIOLOGY30_UNIT_A_V2_CSS}\n${BIOLOGY30_PRODUCTION_EXTRA_CSS}`,
    extraBodyHtml: renderBiology30Gate2Runtime({
      activities,
      dataset: { simulatorScenarios: [] },
      lessonIds: contract.lessons.map((lesson) => lesson.id),
      requiredArtifactIds: contract.artifacts.map((artifact) => artifact.id),
      courseSlug: contract.project.slug,
      suspendDataSchema
    })
  });
  return {
    html,
    lessonIds: contract.lessons.map((lesson) => lesson.id),
    learnerRouteIds,
    practiceItems,
    interactionIds: contract.interactions.map((interaction) => interaction.id),
    artifactIds: contract.artifacts.map((artifact) => artifact.id),
    semanticFigureIds: contract.lessons.map((lesson) => `${lesson.id}-concept-model`),
    semanticFigureKinds: Object.fromEntries(contract.lessons.map((lesson) => [lesson.id, biology30ConceptFigureKind(lesson.id)])),
    interactionPresentationKinds: Object.fromEntries(contract.lessons.map((lesson) => [lesson.id, biology30ConceptFigureKind(lesson.id)])),
    glossaryTerms: [...new Set(input.contents.flatMap((content) => content.glossaryTerms))].sort(),
    suspendDataSchema,
    activities
  };
}
