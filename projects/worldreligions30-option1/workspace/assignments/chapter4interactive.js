(function () {
  const STORAGE_KEY = "worldreligions30-option1.assignment.chapter4interactive";
  const HEIGHT_MESSAGE = "wr30-assignment-height";
  const FRAME_KEY = "chapter4interactive";
  const STEPS = [
    {
      id: "identification",
      title: "Artifact Identification",
      marks: 2,
      copy: "Identify the Hindu deity, avatar, or symbol you selected before you begin the explanation."
    },
    {
      id: "description",
      title: "Meaning and Usage",
      marks: 4,
      copy: "Describe its main meaning and how it is used or understood."
    },
    {
      id: "values",
      title: "Beliefs and Values",
      marks: 4,
      copy: "Explain what beliefs or values it communicates to worshippers."
    },
    {
      id: "misunderstanding",
      title: "Clarifying Misconceptions",
      marks: 3,
      copy: "State one reason outsiders sometimes misunderstand it, and explain how you would correct that misunderstanding."
    },
    {
      id: "bibliography",
      title: "Bibliography",
      marks: 3,
      copy: "Record at least two reliable sources using the citation format your class expects."
    },
    {
      id: "report",
      title: "Final Report",
      marks: 16,
      copy: "Review the compiled study report, tighten the wording, and generate the printable version when it is ready."
    }
  ];
  const DEFAULT_FIELDS = {
    itemName: "",
    description: "",
    values: "",
    misunderstanding: "",
    source1: "",
    source2: ""
  };
  const refs = {
    nav: document.getElementById("step-nav"),
    stepCode: document.getElementById("step-code"),
    stepTitle: document.getElementById("step-title"),
    stepCopy: document.getElementById("step-copy"),
    progressValue: document.getElementById("progress-value"),
    saveState: document.getElementById("save-state"),
    panel: document.getElementById("step-panel"),
    reset: document.getElementById("reset-work"),
    prev: document.getElementById("prev-step"),
    generate: document.getElementById("generate-report")
  };
  const state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        activeStep: Number.isInteger(parsed.activeStep) ? clampStep(parsed.activeStep) : 0,
        fields: {
          ...DEFAULT_FIELDS,
          ...(parsed.fields && typeof parsed.fields === "object" ? parsed.fields : {})
        },
        savedAt: parsed.savedAt || ""
      };
    } catch (_error) {
      return { activeStep: 0, fields: { ...DEFAULT_FIELDS }, savedAt: "" };
    }
  }

  function saveState() {
    state.savedAt = new Date().toISOString();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        activeStep: state.activeStep,
        fields: state.fields,
        savedAt: state.savedAt
      })
    );
    renderStatus();
    notifyParentHeight();
  }

  function clampStep(step) {
    return Math.max(0, Math.min(step, STEPS.length - 1));
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatSavedAt(value) {
    if (!value) return "Local only";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Local only" : date.toLocaleString();
  }

  function getCompletedStepCount() {
    const f = state.fields;
    return [
      Boolean(f.itemName),
      Boolean(f.description),
      Boolean(f.values),
      Boolean(f.misunderstanding),
      Boolean(f.source1 && f.source2),
      Boolean(f.itemName && f.description && f.values && f.misunderstanding)
    ].filter(Boolean).length;
  }

  function getReportData() {
    const f = state.fields;
    const checklist = [
      { label: "Selected deity or symbol recorded", complete: Boolean(f.itemName) },
      { label: "Meaning and usage explained", complete: Boolean(f.description) },
      { label: "Beliefs or values explained", complete: Boolean(f.values) },
      { label: "Misunderstanding corrected", complete: Boolean(f.misunderstanding) },
      { label: "Two bibliography entries recorded", complete: Boolean(f.source1 && f.source2) }
    ];
    const ready = checklist.every((item) => item.complete);

    return {
      ready,
      title: f.itemName || "Unnamed Hindu deity or symbol",
      subtitle: f.itemName ? `Hindu deity or symbol study: ${f.itemName}` : "Select a deity, avatar, or symbol to build the report.",
      intro: "A Chapter 4 study report built from the notes below. Review the wording, then generate the printable version from this page.",
      meta: [
        { label: "Selected artifact", value: f.itemName || "Not yet recorded" },
        { label: "Misunderstanding", value: f.misunderstanding ? "Clarification drafted" : "Not yet recorded" },
        { label: "Sources", value: f.source1 && f.source2 ? "Two sources recorded" : "Sources still incomplete" },
        { label: "Last saved", value: formatSavedAt(state.savedAt) }
      ],
      sections: [
        {
          label: "Meaning and usage",
          value: f.description || "No meaning and usage section recorded yet.",
          wide: true
        },
        {
          label: "Beliefs and values",
          value: f.values || "No beliefs and values section recorded yet."
        },
        {
          label: "Clarifying misconceptions",
          value: f.misunderstanding || "No misunderstanding correction recorded yet."
        },
        {
          label: "Bibliography",
          list: [
            f.source1 || "First citation not yet recorded.",
            f.source2 || "Second citation not yet recorded."
          ],
          wide: true
        }
      ],
      checklist
    };
  }

  function setStep(step) {
    state.activeStep = clampStep(step);
    saveState();
    render();
  }

  function updateField(name, value) {
    state.fields[name] = value;
    saveState();
  }

  function renderNav() {
    refs.nav.innerHTML = STEPS.map((step, index) => `
      <button class="step-button ${index === state.activeStep ? "active" : ""}" type="button" data-step-index="${index}">
        <span class="step-index">${index + 1}</span>
        <span class="step-title">${escapeHtml(step.title)}</span>
        <span class="step-mark">${step.marks} marks</span>
      </button>
    `).join("");
  }

  function renderStatus() {
    refs.progressValue.textContent = `${getCompletedStepCount()}/${STEPS.length}`;
    refs.saveState.textContent = formatSavedAt(state.savedAt);
  }

  function renderHeader() {
    const step = STEPS[state.activeStep];
    const isFinalStep = state.activeStep === STEPS.length - 1;
    document.body.dataset.assignmentStepKind = isFinalStep ? "report" : "work";
    document.body.dataset.assignmentStep = step.id;
    refs.stepCode.textContent = `Chapter 4 · Step ${state.activeStep + 1}`;
    refs.stepTitle.textContent = step.title;
    refs.stepCopy.textContent = step.copy;
    refs.prev.disabled = state.activeStep === 0;
    refs.generate.textContent = isFinalStep ? "Print or Save PDF" : "Proceed";
    refs.generate.classList.toggle("is-ready", isFinalStep);
    refs.generate.dataset.mode = isFinalStep ? "print" : "proceed";
  }

  function renderField(label, name, placeholder, hint = "") {
    return `
      <label class="field-group">
        <span class="field-label">${escapeHtml(label)}</span>
        <input class="text-input" type="text" name="${escapeHtml(name)}" value="${escapeHtml(state.fields[name])}" placeholder="${escapeHtml(placeholder)}" />
        ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
      </label>
    `;
  }

  function renderTextArea(label, name, placeholder, hint = "", rows = 7) {
    return `
      <label class="field-group">
        <span class="field-label">${escapeHtml(label)}</span>
        <textarea class="text-area" name="${escapeHtml(name)}" rows="${rows}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(state.fields[name])}</textarea>
        ${hint ? `<span class="field-hint">${escapeHtml(hint)}</span>` : ""}
      </label>
    `;
  }

  function renderIdentification() {
    return `
      <div class="step-section">
        ${renderField("Deity, avatar, or symbol", "itemName", "Example: Om, Vishnu, Shiva, Lotus, Murti")}
      </div>
    `;
  }

  function renderDescription() {
    return `
      <div class="step-section">
        ${renderTextArea(
          "Meaning and usage",
          "description",
          "Describe its main meaning and how it is used or understood.",
          "You can include temple use, devotional use, symbolic meaning, visual meaning, or role in practice."
        )}
      </div>
    `;
  }

  function renderValues() {
    return `
      <div class="step-section">
        ${renderTextArea(
          "Beliefs and values",
          "values",
          "Explain what beliefs or values it communicates to worshippers.",
          "You can discuss divinity, unity, preservation, destruction, devotion, duty, release, or sacred sound."
        )}
      </div>
    `;
  }

  function renderMisunderstanding() {
    return `
      <div class="step-section">
        ${renderTextArea(
          "Clarifying misconceptions",
          "misunderstanding",
          "State one reason outsiders sometimes misunderstand it, and explain how you would correct that misunderstanding.",
          "Keep the correction specific, respectful, and tied to the actual meaning of the deity or symbol."
        )}
      </div>
    `;
  }

  function renderBibliography() {
    return `
      <div class="step-section">
        ${renderTextArea("Source 1", "source1", "Record your first citation.", "", 4)}
        ${renderTextArea("Source 2", "source2", "Record your second citation.", "", 4)}
      </div>
    `;
  }

  function renderReportSection(section) {
    const body = Array.isArray(section.list)
      ? `<ul class="report-list ${section.label === "Bibliography" ? "is-numbered" : ""}">${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
      : `<p class="report-copy">${escapeHtml(section.value || "")}</p>`;

    return `
      <section class="report-panel ${section.wide ? "report-panel-wide" : ""}">
        <p class="folio-label">${escapeHtml(section.label)}</p>
        ${body}
      </section>
    `;
  }

  function renderChecklistItem(item) {
    return `
      <li class="report-check-item ${item.complete ? "complete" : ""}">
        <span class="report-check-state">${item.complete ? "Ready" : "Needs work"}</span>
        <span>${escapeHtml(item.label)}</span>
      </li>
    `;
  }

  function renderReportPreview() {
    const report = getReportData();

    return `
      <div class="step-section">
        <article class="completion-card report-status-card ${report.ready ? "complete" : ""}">
          <h3 class="completion-title">${report.ready ? "Report ready for review" : "Report still needs key sections"}</h3>
          <p class="completion-copy">${escapeHtml(
            report.ready
              ? "The report now reads as a complete draft. Use Print or Save PDF when you want a clean copy for printing or export."
              : "Keep building the missing sections, then use Generate report again to review the polished version."
          )}</p>
        </article>

        <article class="assignment-report">
          <header class="report-shell">
            <div>
              <p class="assignment-code">Final report</p>
              <h3 class="report-title">${escapeHtml(report.title)}</h3>
              <p class="report-subtitle">${escapeHtml(report.subtitle)}</p>
              <p class="report-intro">${escapeHtml(report.intro)}</p>
            </div>
            <dl class="report-meta-list">
              ${report.meta.map((item) => `
                <div class="report-meta-item">
                  <dt>${escapeHtml(item.label)}</dt>
                  <dd>${escapeHtml(item.value)}</dd>
                </div>
              `).join("")}
            </dl>
          </header>

          <div class="report-summary">
            ${report.sections.map((section) => renderReportSection(section)).join("")}
          </div>

          <section class="report-checklist">
            <div class="report-checklist-copy">
              <p class="folio-label">Submission check</p>
              <h4>Final report readiness</h4>
              <p class="report-copy">Use this checklist as the final pass before you export or submit the assignment in your class workflow.</p>
            </div>
            <ul class="report-checklist-list">
              ${report.checklist.map((item) => renderChecklistItem(item)).join("")}
            </ul>
          </section>
        </article>
      </div>
    `;
  }

  function buildReportDocument() {
    const report = getReportData();

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(report.title)} Report</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Noto+Serif:wght@500;600;700&display=swap" rel="stylesheet">
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 32px;
    background: #efe7da;
    color: #241d16;
    font-family: "Manrope", sans-serif;
  }
  .report-page {
    max-width: 980px;
    margin: 0 auto;
    background: #fffdf9;
    border: 1px solid #d8ccb7;
    padding: 28px 30px 34px;
  }
  .report-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 16px;
  }
  .report-toolbar button {
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid #7f5c1d;
    background: #7f5c1d;
    color: #fff8eb;
    font: 700 12px/1 "Manrope", sans-serif;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .report-head {
    display: flex;
    justify-content: space-between;
    gap: 24px;
    align-items: flex-start;
    padding-bottom: 18px;
    border-bottom: 1px solid #d8ccb7;
  }
  .report-code {
    margin: 0;
    color: #7f5c1d;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  h1, h2 {
    margin: 0;
    color: #241d16;
    font-family: "Noto Serif", serif;
    line-height: 1.1;
  }
  h1 {
    margin-top: 10px;
    font-size: 34px;
  }
  .report-subtitle,
  .report-intro,
  .report-body {
    color: #5f5447;
    line-height: 1.65;
  }
  .report-subtitle,
  .report-intro {
    margin: 10px 0 0;
  }
  .report-meta {
    min-width: 280px;
    display: grid;
    gap: 10px;
  }
  .report-meta-row {
    border: 1px solid #ddd1be;
    padding: 12px 14px;
  }
  .report-meta-label {
    display: block;
    color: #7b6b57;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }
  .report-meta-value {
    margin-top: 6px;
    color: #241d16;
    font-size: 14px;
    line-height: 1.5;
  }
  .report-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
    margin-top: 18px;
  }
  .report-grid section {
    border: 1px solid #ddd1be;
    padding: 16px 18px;
  }
  .report-grid .wide {
    grid-column: 1 / -1;
  }
  .report-label {
    margin: 0;
    color: #7f5c1d;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .report-body {
    margin: 10px 0 0;
    white-space: pre-wrap;
  }
  .report-list {
    margin: 10px 0 0;
    padding-left: 18px;
    color: #3d352b;
    line-height: 1.6;
  }
  .report-list li + li {
    margin-top: 8px;
  }
  .report-checks {
    margin-top: 18px;
    border: 1px solid #ddd1be;
    padding: 16px 18px;
  }
  .report-checks ul {
    margin: 12px 0 0;
    padding-left: 18px;
    color: #3d352b;
    line-height: 1.6;
  }
  @media print {
    body {
      background: #ffffff;
      padding: 0;
    }
    .report-toolbar {
      display: none;
    }
    .report-page {
      border: 0;
      max-width: none;
      padding: 0;
    }
  }
</style>
</head>
<body>
  <div class="report-page">
    <div class="report-toolbar">
      <button type="button" onclick="window.print()">Print or Save PDF</button>
    </div>
    <header class="report-head">
      <div>
        <p class="report-code">Chapter 4 Report</p>
        <h1>${escapeHtml(report.title)}</h1>
        <p class="report-subtitle">${escapeHtml(report.subtitle)}</p>
        <p class="report-intro">${escapeHtml(report.intro)}</p>
      </div>
      <div class="report-meta">
        ${report.meta.map((item) => `
          <div class="report-meta-row">
            <span class="report-meta-label">${escapeHtml(item.label)}</span>
            <div class="report-meta-value">${escapeHtml(item.value)}</div>
          </div>
        `).join("")}
      </div>
    </header>

    <div class="report-grid">
      ${report.sections.map((section) => `
        <section class="${section.wide ? "wide" : ""}">
          <p class="report-label">${escapeHtml(section.label)}</p>
          ${Array.isArray(section.list)
            ? `<ol class="report-list">${section.list.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
            : `<p class="report-body">${escapeHtml(section.value || "")}</p>`}
        </section>
      `).join("")}
    </div>

    <section class="report-checks">
      <p class="report-label">Submission check</p>
      <ul>
        ${report.checklist.map((item) => `<li>${escapeHtml(`${item.complete ? "Ready" : "Needs work"} - ${item.label}`)}</li>`).join("")}
      </ul>
    </section>
  </div>
</body>
</html>`;
  }

  function openReportWindow() {
    const popup = window.open("", "_blank", "width=1100,height=840");
    if (!popup) return;
    popup.document.open();
    popup.document.write(buildReportDocument());
    popup.document.close();
    popup.focus();
    window.setTimeout(() => {
      try {
        popup.focus();
        popup.print();
      } catch (_error) {
        // Ignore print-dialog failures in preview environments.
      }
    }, 180);
  }

  function renderPanel() {
    switch (STEPS[state.activeStep].id) {
      case "identification":
        refs.panel.innerHTML = renderIdentification();
        return;
      case "description":
        refs.panel.innerHTML = renderDescription();
        return;
      case "values":
        refs.panel.innerHTML = renderValues();
        return;
      case "misunderstanding":
        refs.panel.innerHTML = renderMisunderstanding();
        return;
      case "bibliography":
        refs.panel.innerHTML = renderBibliography();
        return;
      default:
        refs.panel.innerHTML = renderReportPreview();
    }
  }

  function render() {
    renderNav();
    renderHeader();
    renderStatus();
    renderPanel();
    notifyParentHeight();
  }

  function notifyParentHeight() {
    const height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    window.parent?.postMessage({ type: HEIGHT_MESSAGE, key: FRAME_KEY, height }, "*");
  }

  refs.nav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-step-index]");
    if (!button) return;
    setStep(Number(button.dataset.stepIndex));
  });

  refs.panel.addEventListener("input", (event) => {
    const field = event.target.closest("[name]");
    if (!field) return;
    updateField(field.name, field.value);
  });

  refs.prev.addEventListener("click", () => {
    if (state.activeStep > 0) setStep(state.activeStep - 1);
  });

  refs.generate.addEventListener("click", () => {
    if (state.activeStep !== STEPS.length - 1) {
      setStep(state.activeStep + 1);
      return;
    }
    openReportWindow();
  });

  refs.reset.addEventListener("click", () => {
    const confirmed = window.confirm("Reset all saved work for this assignment?");
    if (!confirmed) return;
    state.activeStep = 0;
    state.fields = { ...DEFAULT_FIELDS };
    state.savedAt = "";
    window.localStorage.removeItem(STORAGE_KEY);
    render();
  });

  window.addEventListener("resize", notifyParentHeight);
  window.addEventListener("load", notifyParentHeight);

  render();
})();
