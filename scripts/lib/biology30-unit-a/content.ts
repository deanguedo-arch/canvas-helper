import path from "node:path";

import { load as loadHtml } from "cheerio";
import type { Element } from "domhandler";

import type { BiologyWorkspaceAssets } from "./assets.js";
import { resolveArchiveReference } from "./assets.js";
import type { BiologySourceModel, D2lItem, PracticeQuiz } from "./types.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeId(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "source";
}

function isExternal(value: string) {
  return /^(?:https?:|mailto:|tel:|data:)/i.test(value.trim());
}

function isD2lLauncher(value: string) {
  return /(?:^|\/)d2l\/|quicklink\.d2l|\{orgunitid\}/i.test(value);
}

const UNIT_A_NOTES_PAGE_OFFSETS: Record<number, number> = {
  11: 0,
  12: 66,
  13: 96
};

function unitANotesChapter(label: string, href: string) {
  const value = `${label} ${href}`;
  const match = value.match(/chapter\s*(11|12|13)[^\n]{0,80}notes|notes[^\n]{0,80}chapter\s*(11|12|13)/i);
  const chapter = Number(match?.[1] ?? match?.[2]);
  return chapter in UNIT_A_NOTES_PAGE_OFFSETS ? chapter : undefined;
}

function rewriteLocalNotesSlideRange($: ReturnType<typeof loadHtml>, element: Element, chapter: number) {
  const scope = $(element).closest("p, li").first();
  if (!scope.length) return;
  const offset = UNIT_A_NOTES_PAGE_OFFSETS[chapter];
  const containers = [scope.get(0), ...scope.find("*").toArray()].filter(Boolean);
  for (const container of containers) {
    for (const child of $(container).contents().toArray()) {
      if (child.type !== "text") continue;
      const textNode = child as typeof child & { data: string };
      textNode.data = textNode.data.replace(
        /\bslides?\s+(\d+)(?:\s*[-–—]\s*(\d+))?(?:\s+of\s+the)?/gi,
        (_match, startValue: string, endValue?: string) => {
          const start = offset + Number(startValue);
          const end = endValue ? offset + Number(endValue) : undefined;
          return end && end !== start
            ? `content from source note pages ${start}-${end}, recreated below in the`
            : `content from source note page ${start}, recreated below in the`;
        }
      );
    }
  }
}

function filenameLabel(value: string) {
  return path.posix
    .basename(value.replace(/\\/g, "/"))
    .replace(/[-_]+/g, " ")
    .replace(/\.[a-z0-9]+$/i, "")
    .trim();
}

function plainTextFromHtml(value: string) {
  return loadHtml(`<body>${value}</body>`)("body").text().replace(/\s+/g, " ").trim();
}

function transformCheckYourWork($: ReturnType<typeof loadHtml>) {
  $(".show_btn").each((_index, element) => {
    const trigger = $(element);
    const answer = trigger.nextAll(".contentparent_box").first();
    if (!answer.length) return;
    const summaryText = trigger.text().replace(/\s+/g, " ").trim() || "Check your work";
    const details = $("<details></details>").attr("class", "source-answer").attr("data-biology-generated", "true");
    details.append($("<summary></summary>").text(summaryText));
    details.append(answer.contents());
    trigger.replaceWith(details);
    answer.remove();
  });
}

function normalizeHeadingLevels($: ReturnType<typeof loadHtml>) {
  const mapping: Record<string, string> = {
    h1: "h3",
    h2: "h3",
    h3: "h4",
    h4: "h4",
    h5: "h5",
    h6: "h5"
  };
  for (const [sourceTag, targetTag] of Object.entries(mapping)) {
    $(sourceTag).each((_index, element) => {
      const node = $(element);
      const replacement = $(`<${targetTag}></${targetTag}>`).attr("data-biology-generated", "true");
      replacement.append(node.contents());
      node.replaceWith(replacement);
    });
  }
}

function stripUnsafeAttributes($: ReturnType<typeof loadHtml>) {
  $("*").each((_index, element) => {
    const node = $(element);
    const attributes = { ...(element as Element).attribs };
    for (const name of Object.keys(attributes)) {
      if (/^on/i.test(name) || ["style", "srcset", "contenteditable", "background"].includes(name.toLowerCase())) {
        node.removeAttr(name);
      }
    }
    if (!node.attr("data-biology-generated")) {
      node.removeAttr("class");
      node.removeAttr("id");
    }
  });
}

function replaceWithFallback($: ReturnType<typeof loadHtml>, element: Element, message: string) {
  const fallback = $("<span></span>")
    .attr("class", "source-asset-fallback")
    .attr("role", "note")
    .attr("data-biology-generated", "true")
    .text(message);
  $(element).replaceWith(fallback);
}

export async function sanitizeBiologyMarkup(input: {
  source: BiologySourceModel;
  assets: BiologyWorkspaceAssets;
  rawHtml: string;
  baseArchivePath: string;
  contextTitle: string;
  responseNamespace: string;
  purpose?: "source" | "quiz";
  localNotesPath?: string;
}) {
  const $ = loadHtml(input.rawHtml.includes("<html") ? input.rawHtml : `<body>${input.rawHtml}</body>`);
  transformCheckYourWork($);
  $("script, style, link, meta, base, noscript, template, #footer").remove();
  $("font").each((_index, element) => {
    $(element).replaceWith($(element).contents());
  });
  $("center").each((_index, element) => {
    const replacement = $("<div></div>").attr("data-biology-generated", "true");
    replacement.append($(element).contents());
    $(element).replaceWith(replacement);
  });
  normalizeHeadingLevels($);
  stripUnsafeAttributes($);

  for (const element of $("a").toArray() as Element[]) {
    const node = $(element);
    const href = node.attr("href")?.trim() ?? "";
    if (!href || href === "#") {
      node.replaceWith(node.contents());
      continue;
    }
    if (/^javascript:/i.test(href) || isD2lLauncher(href)) {
      input.assets.addNeutralizedLauncher({
        sourceId: input.source.resource.id,
        sourceArchivePath: href,
        context: input.contextTitle,
        replacement: "Removed the launcher and retained the surrounding learner instruction."
      });
      replaceWithFallback($, element, `${node.text().trim() || "Legacy activity"} — source launcher removed; required instruction is retained locally.`);
      continue;
    }
    if (href.startsWith("#")) {
      node.replaceWith(node.contents());
      continue;
    }
    if (isExternal(href)) {
      if (/^https?:/i.test(href)) {
        input.assets.addExternalLink({ sourceId: input.source.resource.id, url: href, context: input.contextTitle });
        const notesChapter = input.localNotesPath ? unitANotesChapter(node.text(), href) : undefined;
        if (notesChapter) {
          rewriteLocalNotesSlideRange($, element, notesChapter);
          const replacement = $("<span></span>")
            .attr("class", "notes-included-marker")
            .attr("data-biology-generated", "true")
            .attr("data-material-status", "included-local-content")
            .text(`${node.text().trim()} (included in this lesson)`);
          node.replaceWith(replacement);
          continue;
        }
        node.attr("target", "_blank");
        node.attr("rel", "noopener noreferrer");
        node.attr("data-material-status", "optional-reference");
        node.attr("title", "Optional source reference; the local lesson remains complete without it.");
      } else {
        node.removeAttr("target");
      }
      continue;
    }
    let archivePath: string;
    try {
      archivePath = resolveArchiveReference(input.baseArchivePath, href);
    } catch {
      replaceWithFallback($, element, `${node.text().trim() || "Source file"} — unsafe source path removed.`);
      continue;
    }
    if (/\.html?$/i.test(archivePath)) {
      input.assets.addNeutralizedLauncher({
        sourceId: input.source.resource.id,
        sourceArchivePath: archivePath,
        context: input.contextTitle,
        replacement: "The legacy linked page or activity was not executed; its relevant Unit A content is rendered in the normalized course."
      });
      replaceWithFallback($, element, `${node.text().trim() || filenameLabel(archivePath)} — legacy activity reference normalized into this course.`);
      continue;
    }
    const copied = await input.assets.copyArchiveAsset({
      sourceId: input.source.resource.id,
      archivePath,
      context: input.contextTitle
    });
    if (!copied) {
      replaceWithFallback($, element, `${node.text().trim() || filenameLabel(archivePath)} — source file unavailable in the archive.`);
      continue;
    }
    node.attr("href", copied);
    node.removeAttr("target");
    node.attr("download", "");
  }

  for (const element of $("img").toArray() as Element[]) {
    const node = $(element);
    const src = node.attr("src")?.trim() ?? "";
    if (!src) {
      node.remove();
      continue;
    }
    if (isExternal(src)) {
      input.assets.addExternalLink({ sourceId: input.source.resource.id, url: src, context: `${input.contextTitle} image` });
      const link = $("<a></a>")
        .attr("href", src)
        .attr("target", "_blank")
        .attr("rel", "noopener noreferrer")
        .attr("class", "source-asset-fallback")
        .attr("data-biology-generated", "true")
        .attr("data-material-status", "optional-reference")
        .text("Open optional source image");
      node.replaceWith(link);
      continue;
    }
    let archivePath: string;
    try {
      archivePath = resolveArchiveReference(input.baseArchivePath, src);
    } catch {
      replaceWithFallback($, element, "Unsafe source image path removed.");
      continue;
    }
    const copied = await input.assets.copyArchiveAsset({
      sourceId: input.source.resource.id,
      archivePath,
      purpose: input.purpose === "quiz" ? "quiz-image" : "image",
      context: input.contextTitle
    });
    if (!copied) {
      replaceWithFallback($, element, `Source image unavailable: ${filenameLabel(archivePath)}`);
      continue;
    }
    node.attr("src", copied);
    node.removeAttr("width");
    node.removeAttr("height");
    node.attr("loading", "lazy");
    if (!node.attr("alt")?.trim()) {
      node.attr("alt", /\/icons\//i.test(archivePath) ? "" : `Source diagram supporting ${input.contextTitle}`);
    }
  }

  for (const element of $("iframe, embed").toArray() as Element[]) {
    const node = $(element);
    const reference = node.attr("src")?.trim() ?? "";
    if (reference && isExternal(reference)) {
      input.assets.addExternalLink({ sourceId: input.source.resource.id, url: reference, context: `${input.contextTitle} embedded media` });
      const link = $("<a></a>")
        .attr("href", reference)
        .attr("target", "_blank")
        .attr("rel", "noopener noreferrer")
        .attr("class", "source-asset-fallback")
        .attr("data-biology-generated", "true")
        .attr("data-material-status", "optional-reference")
        .text("Open optional source media");
      node.replaceWith(link);
    } else {
      input.assets.addNeutralizedLauncher({
        sourceId: input.source.resource.id,
        sourceArchivePath: reference || "embedded source",
        context: input.contextTitle,
        replacement: "Removed a legacy embedded launcher; the normalized lesson remains available."
      });
      replaceWithFallback($, element, "Legacy embedded activity removed; continue with the local lesson content.");
    }
  }

  for (const element of $("object").toArray() as Element[]) {
    const node = $(element);
    const reference = node.attr("data")?.trim() ?? "";
    if (!reference || isExternal(reference) || isD2lLauncher(reference)) {
      if (reference && /^https?:/i.test(reference)) {
        input.assets.addExternalLink({ sourceId: input.source.resource.id, url: reference, context: `${input.contextTitle} document` });
      }
      replaceWithFallback($, element, "Optional source document is not required for this local lesson.");
      continue;
    }
    let archivePath: string;
    try {
      archivePath = resolveArchiveReference(input.baseArchivePath, reference);
    } catch {
      replaceWithFallback($, element, "Unsafe source document path removed.");
      continue;
    }
    const copied = await input.assets.copyArchiveAsset({ sourceId: input.source.resource.id, archivePath, context: input.contextTitle });
    if (!copied) {
      replaceWithFallback($, element, `Source document unavailable: ${filenameLabel(archivePath)}`);
      continue;
    }
    node.attr("data", copied);
    node.attr("type", node.attr("type") || "application/pdf");
    node.attr("class", "source-pdf-frame");
    node.attr("data-biology-generated", "true");
    node.attr("aria-label", node.attr("aria-label") || input.contextTitle);
  }

  for (const element of $("video, audio, source").toArray() as Element[]) {
    const node = $(element);
    const reference = node.attr("src")?.trim() ?? "";
    if (!reference) continue;
    if (isExternal(reference)) {
      input.assets.addExternalLink({ sourceId: input.source.resource.id, url: reference, context: `${input.contextTitle} media` });
      replaceWithFallback($, element, "Open the optional source media from its original link if needed.");
      continue;
    }
    let archivePath: string;
    try {
      archivePath = resolveArchiveReference(input.baseArchivePath, reference);
    } catch {
      replaceWithFallback($, element, "Unsafe source media path removed.");
      continue;
    }
    const copied = await input.assets.copyArchiveAsset({ sourceId: input.source.resource.id, archivePath, context: input.contextTitle });
    if (!copied) {
      replaceWithFallback($, element, `Source media unavailable: ${filenameLabel(archivePath)}`);
      continue;
    }
    node.attr("src", copied);
  }

  $("form").each((_index, element) => {
    const replacement = $("<div></div>").attr("class", "source-practice-form").attr("data-biology-generated", "true");
    replacement.append($(element).contents());
    $(element).replaceWith(replacement);
  });
  $("button, input[type='submit'], input[type='button'], input[type='reset'], input[type='hidden']").remove();
  $("input, textarea, select").each((index, element) => {
    const node = $(element);
    const responseId = `${input.responseNamespace}:source-field-${index + 1}`;
    node.attr("data-response-id", responseId);
    node.removeAttr("name");
    if (!node.attr("aria-label") && !node.attr("id")) node.attr("aria-label", `Saved source response ${index + 1}`);
  });
  $("table").each((_index, element) => {
    const node = $(element);
    const wrapper = $("<div></div>").attr("class", "source-table-wrap").attr("data-biology-generated", "true");
    node.before(wrapper);
    wrapper.append(node);
  });
  $("p").each((_index, element) => {
    const node = $(element);
    if (!node.text().replace(/\u00a0/g, " ").trim() && !node.find("img, a, input, textarea, select").length) node.remove();
  });
  $("[data-biology-generated]").removeAttr("data-biology-generated");
  return ($("body").html() ?? $.root().html() ?? "").trim();
}

export async function renderD2lItemBody(input: {
  source: BiologySourceModel;
  item: D2lItem;
  assets: BiologyWorkspaceAssets;
  responseNamespace: string;
  localNotesPath?: string;
}) {
  const parts: string[] = [];
  if (input.item.descriptionHtml.trim()) {
    const description = await sanitizeBiologyMarkup({
      source: input.source,
      assets: input.assets,
      rawHtml: input.item.descriptionHtml,
      baseArchivePath: input.source.manifestPath,
      contextTitle: input.item.title,
      responseNamespace: input.responseNamespace,
      localNotesPath: input.localNotesPath
    });
    if (description) parts.push(description);
  }
  const href = input.item.resource?.href?.trim() ?? "";
  if (!href) return parts.join("\n");
  if (isD2lLauncher(href)) {
    input.assets.addNeutralizedLauncher({
      sourceId: input.source.resource.id,
      sourceArchivePath: href,
      context: input.item.title,
      replacement: "Converted the matching visible chapter quiz from QTI into local non-graded practice."
    });
    return parts.join("\n");
  }
  if (isExternal(href)) {
    if (/^https?:/i.test(href)) {
      input.assets.addExternalLink({ sourceId: input.source.resource.id, url: href, context: input.item.title });
      const localNotesPath = input.localNotesPath;
      const notesChapter = localNotesPath ? unitANotesChapter(input.item.title, href) : undefined;
      if (notesChapter) {
        parts.push(`<aside class="notes-included-notice" data-material-status="included-local-content">
          <strong>Chapter notes are recreated below</strong>
          <p>The PDF content is presented as native headings, explanations, lists, and comparisons. Original source slides are optional references.</p>
        </aside>`);
        return parts.join("\n");
      }
      parts.push(`<aside class="optional-reference" data-material-status="optional-reference">
        <strong>Optional source reference</strong>
        <p>The required Unit A material is available locally. This original source link may provide an additional view.</p>
        <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">Open ${escapeHtml(input.item.title)}</a>
      </aside>`);
    }
    return parts.join("\n");
  }
  const archivePath = input.item.resource
    ? input.item.resource.href.replace(/\\/g, "/")
    : "";
  if (!archivePath) return parts.join("\n");
  if (/\.html?$/i.test(archivePath)) {
    const normalized = archivePath.replace(/\\/g, "/");
    const rawHtml = input.source.textByArchivePath.get(normalized);
    if (!rawHtml) {
      input.assets.addNeutralizedLauncher({
        sourceId: input.source.resource.id,
        sourceArchivePath: normalized,
        context: input.item.title,
        replacement: "The missing legacy page was replaced by a labelled fallback."
      });
      parts.push(`<p class="source-asset-fallback" role="note">Source page unavailable in the archive: ${escapeHtml(filenameLabel(normalized))}</p>`);
      return parts.join("\n");
    }
    const sanitized = await sanitizeBiologyMarkup({
      source: input.source,
      assets: input.assets,
      rawHtml,
      baseArchivePath: normalized,
      contextTitle: input.item.title,
      responseNamespace: input.responseNamespace,
      localNotesPath: input.localNotesPath
    });
    if (sanitized) parts.push(sanitized);
    return parts.join("\n");
  }
  const normalized = archivePath.replace(/\\/g, "/");
  const copied = await input.assets.copyArchiveAsset({
    sourceId: input.source.resource.id,
    archivePath: normalized,
    context: input.item.title
  });
  if (!copied) {
    parts.push(`<p class="source-asset-fallback" role="note">Source file unavailable in the archive: ${escapeHtml(filenameLabel(normalized))}</p>`);
  } else {
    parts.push(`<div class="source-document-link">
      <strong>${escapeHtml(input.item.title)}</strong>
      <a href="${escapeHtml(copied)}" download>Open local source file</a>
    </div>`);
  }
  return parts.join("\n");
}

export function renderSourceSection(input: {
  source: BiologySourceModel;
  item: D2lItem;
  body: string;
  provenanceLabel?: string;
}) {
  return `<section class="biology-source-section" data-source-id="${escapeHtml(input.source.resource.id)}" data-source-item-id="${escapeHtml(input.item.identifier)}">
    <header class="biology-source-header">
      <span>${escapeHtml(input.provenanceLabel ?? input.source.resource.label)}</span>
      <h3>${escapeHtml(input.item.title)}</h3>
    </header>
    <div class="biology-source-body">${input.body || "<p>No additional source text was attached to this manifest item.</p>"}</div>
    <footer>Source: ${escapeHtml(input.source.resource.label)} · ${escapeHtml(input.item.pathTitles.join(" / "))}</footer>
  </section>`;
}

export async function renderPracticeQuiz(input: {
  source: BiologySourceModel;
  quiz: PracticeQuiz;
  assets: BiologyWorkspaceAssets;
  responseNamespace: string;
}) {
  const renderedQuestions: string[] = [];
  for (const [index, question] of input.quiz.questions.entries()) {
    const responseId = `${input.responseNamespace}:${safeId(input.quiz.id)}:${safeId(question.id)}`;
    const prompt = await sanitizeBiologyMarkup({
      source: input.source,
      assets: input.assets,
      rawHtml: question.promptHtml,
      baseArchivePath: question.sourceXmlPath,
      contextTitle: `${input.quiz.title}, question ${index + 1}`,
      responseNamespace: responseId,
      purpose: "quiz"
    });
    const correctLabels: string[] = [];
    let controlHtml = "";
    if (question.type === "multiple-choice") {
      const choices: string[] = [];
      for (const [choiceIndex, choice] of question.choices.entries()) {
        const choiceHtml = await sanitizeBiologyMarkup({
          source: input.source,
          assets: input.assets,
          rawHtml: choice.html,
          baseArchivePath: question.sourceXmlPath,
          contextTitle: `${input.quiz.title}, question ${index + 1}, choice ${choiceIndex + 1}`,
          responseNamespace: `${responseId}:choice-${choiceIndex + 1}`,
          purpose: "quiz"
        });
        if (question.correctValues.includes(choice.id)) correctLabels.push(plainTextFromHtml(choiceHtml));
        const inputId = `${safeId(responseId)}-choice-${choiceIndex + 1}`;
        choices.push(`<div class="practice-choice">
          <input id="${escapeHtml(inputId)}" type="radio" name="${escapeHtml(responseId)}" value="${escapeHtml(choice.id)}" data-response-id="${escapeHtml(responseId)}">
          <label for="${escapeHtml(inputId)}">${choiceHtml}</label>
        </div>`);
      }
      controlHtml = `<div class="practice-choices">${choices.join("\n")}</div>`;
    } else if (question.type === "short-answer") {
      correctLabels.push(...question.correctValues);
      controlHtml = `<label class="practice-written-label">Your answer
        <input type="text" data-response-id="${escapeHtml(responseId)}" autocomplete="off">
      </label>`;
    } else {
      controlHtml = `<label class="practice-written-label">Build your response
        <textarea rows="6" data-response-id="${escapeHtml(responseId)}"></textarea>
      </label>
      <p class="practice-guidance">This source question requires an explained response. Save your reasoning, then compare it with the lesson evidence or discuss it with your teacher.</p>`;
    }
    const checkControl = question.type === "long-answer"
      ? ""
      : `<button class="practice-check-button" type="button" data-check-practice>Check answer</button>`;
    renderedQuestions.push(`<fieldset class="practice-question" data-practice-question data-question-type="${question.type}" data-correct-values="${escapeHtml(JSON.stringify(question.correctValues))}" data-correct-labels="${escapeHtml(JSON.stringify(correctLabels))}">
      <legend><span>Question ${index + 1}</span></legend>
      <div class="practice-prompt">${prompt}</div>
      ${controlHtml}
      <div class="practice-question-actions">${checkControl}<span role="status" aria-live="polite" data-practice-feedback></span></div>
    </fieldset>`);
  }
  return `<section class="practice-quiz" data-source-id="${escapeHtml(input.source.resource.id)}" data-source-item-id="${escapeHtml(input.quiz.sourceItemId)}">
    <header>
      <p>Non-graded local practice</p>
      <h3>${escapeHtml(input.quiz.title)}</h3>
      <p>All ${input.quiz.questions.length} source-visible questions are retained. Attempt limits, timing, grade transfer, submission, and the broken D2L launcher have been removed.</p>
    </header>
    ${renderedQuestions.join("\n")}
  </section>`;
}

export function renderReflectionCollection(input: { slug: string; lessonId: string; prompt: string }) {
  const collectionId = `${input.slug}:biology-reflection`;
  const responseId = `${input.slug}:biology-reflection:response`;
  return `<section class="biology-reflection" data-response-collection data-evidence-collection-id="${escapeHtml(collectionId)}" data-evidence-source="Biology 30 Unit A" data-evidence-activity-title="Unit A learning reflection" data-evidence-concept="Biology learning reflection">
    <h3>Save a learning checkpoint</h3>
    <div data-evidence-question-number="1" data-evidence-question-prompt="${escapeHtml(input.prompt)}">
      <label for="${escapeHtml(safeId(responseId))}">${escapeHtml(input.prompt)}</label>
      <textarea id="${escapeHtml(safeId(responseId))}" rows="5" data-response-id="${escapeHtml(responseId)}"></textarea>
    </div>
    <div class="biology-reflection-actions">
      <button type="button" data-save-response-collection>Save checkpoint to Evidence Bank</button>
      <span role="status" aria-live="polite" data-response-collection-status>Saved locally as you type</span>
    </div>
  </section>`;
}

export const BIOLOGY_PRACTICE_RUNTIME = `<script>
function updateBiologyRubricTotal(){
  document.querySelectorAll("[data-rubric-total]").forEach((output) => {
    const page = output.closest("#review-matrix") || document;
    const total = Array.from(page.querySelectorAll("[data-rubric-score]")).reduce((sum, field) => {
      const maximum = Number(field.getAttribute("max") || 0);
      const value = Number(field.value || 0);
      return sum + (Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0);
    }, 0);
    output.textContent = String(total);
  });
}
document.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("[data-check-practice]") : null;
  if (!button) return;
  const question = button.closest("[data-practice-question]");
  const feedback = question?.querySelector("[data-practice-feedback]");
  if (!question || !feedback) return;
  let correctValues = [];
  let correctLabels = [];
  try {
    correctValues = JSON.parse(question.getAttribute("data-correct-values") || "[]");
    correctLabels = JSON.parse(question.getAttribute("data-correct-labels") || "[]");
  } catch {
    feedback.textContent = "This practice answer could not be checked.";
    return;
  }
  const type = question.getAttribute("data-question-type");
  const selected = type === "multiple-choice"
    ? question.querySelector("input[type=radio]:checked")?.value || ""
    : question.querySelector("input[type=text]")?.value || "";
  if (!String(selected).trim()) {
    feedback.textContent = "Choose or enter an answer first.";
    return;
  }
  const normalized = String(selected).trim().toLowerCase().replace(/\\s+/g, " ");
  const isCorrect = correctValues.some((value) => String(value).trim().toLowerCase().replace(/\\s+/g, " ") === normalized);
  if (isCorrect) {
    feedback.textContent = "Correct. Your response is saved locally.";
    feedback.setAttribute("data-result", "correct");
  } else {
    const answer = correctLabels.filter(Boolean).join(" or ");
    feedback.textContent = answer ? "Not yet. Check your work against: " + answer + "." : "Not yet. Review the lesson evidence and try again.";
    feedback.setAttribute("data-result", "incorrect");
  }
});
document.addEventListener("input", (event) => {
  if (event.target instanceof Element && event.target.matches("[data-rubric-score]")) updateBiologyRubricTotal();
});
window.addEventListener("DOMContentLoaded", () => setTimeout(updateBiologyRubricTotal, 0));
</script>`;
