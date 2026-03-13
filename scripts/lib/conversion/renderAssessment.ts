import type { AssessmentModel, AssessmentQuestion, AssessmentSection } from "./types.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderQuestionFromInputs(question: AssessmentQuestion) {
  const renderedInputs = question.inputs
    .map((input) => {
      if (input.kind === "select") {
        const options = input.options
          .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
          .join("");
        const dataCorrect = input.correctValue != null ? ` data-correct="${escapeHtml(input.correctValue)}"` : "";
        return [
          `<div class="flex flex-col">`,
          `<label class="text-xs text-slate-400">${escapeHtml(input.label)}</label>`,
          `<select class="auto-grade"${dataCorrect}>${options}</select>`,
          `</div>`
        ].join("");
      }

      return input.options
        .map(
          (option) =>
            `<label><input type="checkbox" class="cb-grade" value="${escapeHtml(option.value)}"> ${escapeHtml(option.label)}</label>`
        )
        .join("");
    })
    .join("");

  return [
    `<div class="question-box">`,
    `<span class="question-title">${escapeHtml(question.title)}</span>`,
    question.prompt ? `<p class="text-sm mb-2">${escapeHtml(question.prompt)}</p>` : "",
    renderedInputs,
    `</div>`
  ].join("");
}

function renderQuestion(question: AssessmentQuestion) {
  if (question.html?.trim()) {
    return question.html;
  }

  return renderQuestionFromInputs(question);
}

function renderSectionFooter(section: AssessmentSection) {
  const totalMarks = section.totalMarks ?? 0;
  return [
    `<div class="mt-4 pt-4 border-t border-slate-700">`,
    `<button type="button" data-score-section="${section.id}" data-score-total="${totalMarks}" class="score-section-btn bg-slate-700 hover:bg-slate-600 text-sm text-white py-2 px-4 rounded w-full md:w-auto">`,
    `Check ${escapeHtml(section.title)} Score`,
    `</button>`,
    `<span id="score-${section.id}-display" class="block md:inline mt-2 md:mt-0 md:ml-4 text-blue-400 font-bold hidden"></span>`,
    `</div>`
  ].join("");
}

function renderSection(section: AssessmentSection, isFirst: boolean) {
  const headingSuffix = section.totalMarks != null ? ` (${section.totalMarks} Marks)` : "";
  return [
    `<div id="${section.id}" class="assess-tab${isFirst ? " active" : " hidden"}">`,
    `<h2 class="text-xl font-bold text-white mb-4">${escapeHtml(section.title)}${headingSuffix}</h2>`,
    section.questions.map((question) => renderQuestion(question)).join("\n"),
    renderSectionFooter(section),
    `</div>`
  ].join("\n");
}

export function renderAssessmentTabs(assessment: AssessmentModel) {
  return assessment.sections
    .map((section, index) => {
      const activeClass = index === 0 ? " active bg-slate-800 text-blue-400 border border-blue-500" : " bg-slate-900 text-slate-400 border border-slate-700";
      return `<button type="button" data-assess-tab="${section.id}" class="nav-btn${activeClass}" id="btn-${section.id}">${escapeHtml(
        section.title
      )}</button>`;
    })
    .join("\n");
}

export function renderAssessmentSections(assessment: AssessmentModel) {
  return assessment.sections.map((section, index) => renderSection(section, index === 0)).join("\n");
}

export function getAssessmentTotalMarks(assessment: AssessmentModel) {
  return assessment.sections.reduce((sum, section) => sum + (section.totalMarks ?? 0), 0);
}

