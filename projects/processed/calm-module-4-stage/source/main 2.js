const DATA_URL = "./calm-module-4-hybrid.json";
const root = document.getElementById("root");

const state = {
  payload: null,
  activities: [],
  activityById: new Map(),
  tabs: [],
  activeTabId: "",
  tabGroupTitle: "Module Navigation"
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function paragraphsHtml(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  const blocks = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  return blocks
    .map((block) => {
      const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const isList = lines.length > 1 && lines.every((line) => /^(\d+\.|[-*•])\s+/.test(line));
      if (isList) {
        return `<ul>${lines.map((line) => `<li>${escapeHtml(line.replace(/^(\d+\.|[-*•])\s+/, ""))}</li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`;
    })
    .join("");
}

function countByType(items) {
  return items.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});
}

function formatCount(value, label) {
  return `${value} ${value === 1 ? label : `${label}s`}`;
}

function tabActivities(tab) {
  return (tab?.activityIds ?? [])
    .map((id) => state.activityById.get(id))
    .filter(Boolean)
    .filter((activity) => activity.type !== "tab_group");
}

function loadingHtml() {
  return `
    <main class="shell">
      <section class="loading card">
        <div class="eyebrow">CALM Module 4</div>
        <h2>Loading the workspace viewer</h2>
        <p>Fetching the draft payload and building the navigation map.</p>
      </section>
    </main>
  `;
}

function errorHtml(message) {
  return `
    <main class="shell">
      <section class="error card">
        <div class="eyebrow">Workspace error</div>
        <h2>CALM Module 4 could not load</h2>
        <p>${escapeHtml(message)}</p>
        <a class="button" href="./index.html">Retry workspace</a>
      </section>
    </main>
  `;
}

function heroHtml() {
  const payload = state.payload ?? {};
  const counts = countByType(state.activities);
  const statItems = [
    [state.activities.length, "Activity"],
    [state.tabs.length, "Tab"],
    [counts.worksheet_form ?? 0, "Worksheet"],
    [counts.rubric_creator ?? 0, "Rubric"]
  ];

  return `
    <header class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">CALM draft viewer</div>
          <h1>${escapeHtml(payload.title || "CALM Module 4")}</h1>
          <p class="lede">
            A live workspace view of the composer draft for Career Exploration & Portfolio.
            The navigation on the left follows the draft's own tab group, and the content area renders the real block data from the module.
          </p>
          <div class="chips">
            <span class="chip">${escapeHtml(payload.moduleId || "module-id")}</span>
            <span class="chip">${escapeHtml(payload.template || "template")}</span>
            <span class="chip">${escapeHtml(payload.theme || "theme")}</span>
            <span class="chip">${escapeHtml(payload.composerStarterType || "starter")}</span>
          </div>
        </div>

        <div class="meta">
          <div class="meta-grid">
            <div class="meta-card">
              <p class="meta-card__label">Draft label</p>
              <p class="meta-card__value">${escapeHtml(payload.title || "CALM Module 4: Career Exploration & Portfolio")}</p>
            </div>
            <div class="meta-card">
              <p class="meta-card__label">Navigation</p>
              <p class="meta-card__value">${escapeHtml(state.tabGroupTitle)}</p>
            </div>
            <div class="meta-card">
              <p class="meta-card__label">Current tab</p>
              <p class="meta-card__value">${escapeHtml(state.tabs.find((tab) => tab.id === state.activeTabId)?.label || "Loading")}</p>
            </div>
            <div class="meta-card">
              <p class="meta-card__label">Activity types</p>
              <p class="meta-card__value">${Object.keys(counts).length}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="stats">
        ${statItems
          .map(
            ([value, label]) => `
              <div class="stat">
                <div class="stat-value">${value}</div>
                <div class="stat-label">${escapeHtml(label)}${value === 1 ? "" : "s"}</div>
              </div>
            `,
          )
          .join("")}
      </div>
    </header>
  `;
}

function sidebarHtml() {
  const counts = countByType(state.activities);
  const tabs = state.tabs
    .map((tab) => {
      const visibleCount = tabActivities(tab).length;
      return `
        <button type="button" class="tab-btn ${tab.id === state.activeTabId ? "is-active" : ""}" data-tab-id="${escapeHtml(tab.id)}">
          <span class="tab-label">
            <span class="tab-name">${escapeHtml(tab.label)}</span>
            <span class="tab-count">${escapeHtml(formatCount(visibleCount, "block"))}</span>
          </span>
          <span aria-hidden="true">→</span>
        </button>
      `;
    })
    .join("");

  const legend = Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(
      ([type, count]) => `
        <div class="legend-chip">
          <span>${escapeHtml(type.replace(/_/g, " "))}</span>
          <strong>${count}</strong>
        </div>
      `,
    )
    .join("");

  return `
    <aside class="sidebar">
      <section class="card">
        <h2 class="card-title">${escapeHtml(state.tabGroupTitle)}</h2>
        <p class="card-subtle">Select a section to preview the blocks in the same order they appear in the draft.</p>
        <nav class="tabs" aria-label="CALM Module 4 sections">${tabs}</nav>
      </section>

      <section class="card">
        <h2 class="card-title">Block mix</h2>
        <p class="card-subtle">A quick glance at what is inside the module.</p>
        <div class="legend">${legend}</div>
      </section>
    </aside>
  `;
}

function titleBlockHtml(activity) {
  const data = activity.data ?? {};
  return `
    <section class="activity hero-card">
      <div class="panel-head">
        <div>
          <div class="tag">Title block</div>
          <h3 class="panel-title">${escapeHtml((data.text || data.title || "Module heading").split("\n")[0])}</h3>
          <p class="panel-subtle">The draft uses this block to introduce the section and its goals.</p>
        </div>
      </div>
      <div class="rich">${data.textHtml || `<h3>${escapeHtml(data.text || data.title || "Title")}</h3>`}</div>
    </section>
  `;
}

function contentBlockHtml(activity) {
  const data = activity.data ?? {};
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Content block</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Content")}</h3>
        </div>
      </div>
      <div class="rich">${data.bodyHtml || paragraphsHtml(data.body)}</div>
    </article>
  `;
}

function accordionHtml(activity) {
  const data = activity.data ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Accordion</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Accordion")}</h3>
          <p class="panel-subtle">Expandable reference content from the composer draft.</p>
        </div>
      </div>
      <div class="block-grid">
        ${items
          .map(
            (item, index) => `
              <details ${index === 0 ? "open" : ""}>
                <summary>${escapeHtml(item.title || `Item ${index + 1}`)}</summary>
                <div class="details-body">${paragraphsHtml(item.content)}</div>
              </details>
            `,
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderField(block) {
  const placeholder = escapeHtml(block.placeholder || "Type your response...");
  if (block.fieldType === "text") return `<input class="input" type="text" placeholder="${placeholder}" />`;
  if (block.fieldType === "number") return `<input class="input" type="number" inputmode="numeric" placeholder="${placeholder}" />`;
  return `<textarea class="textarea" rows="4" placeholder="${placeholder}"></textarea>`;
}

function worksheetHtml(activity) {
  const data = activity.data ?? {};
  const blocks = Array.isArray(data.blocks) ? data.blocks : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Worksheet</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Worksheet")}</h3>
          <p class="panel-subtle">The form structure is preserved so the workspace feels like the original activity.</p>
        </div>
      </div>
      <div class="worksheet">
        ${blocks
          .map((block) => {
            if (block.kind === "title") {
              return `
                <div class="worksheet-intro">
                  <h4>${escapeHtml(block.title || "Section intro")}</h4>
                  ${block.showContent ? `<p>${escapeHtml(block.content || "")}</p>` : ""}
                </div>
              `;
            }
            return `
              <label class="field">
                <span class="field-label">${escapeHtml(block.label || "Prompt")}</span>
                ${renderField(block)}
              </label>
            `;
          })
          .join("")}
      </div>
    </article>
  `;
}

function calloutHtml(activity) {
  const data = activity.data ?? {};
  return `
    <article class="activity panel">
      <div class="callout tip">
        <div class="callout-badge">${escapeHtml(data.tone || "tip")}</div>
        <h3 class="callout-title">${escapeHtml(data.title || "Callout")}</h3>
        <div class="callout-body">${paragraphsHtml(data.body)}</div>
      </div>
    </article>
  `;
}

function reflectionHtml(activity) {
  const data = activity.data ?? {};
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Reflection</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Reflection journal")}</h3>
        </div>
      </div>
      <label class="field">
        <span class="field-label">${escapeHtml(data.prompt || "Reflect on the prompt below.")}</span>
        <textarea class="textarea" rows="5" placeholder="${escapeHtml(data.placeholder || "Write your reflection...")}"></textarea>
      </label>
    </article>
  `;
}

function chartHtml(activity) {
  const data = activity.data ?? {};
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const cells = Array.isArray(data.cells) ? data.cells : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Chart</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Chart")}</h3>
          <p class="panel-subtle">${escapeHtml(data.description || "Fillable chart content from the composer draft.")}</p>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>${escapeHtml(data.rowLabelHeader || "Row")}</th>
              ${columns.map((column) => `<th>${escapeHtml(column.label || "Column")}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row, rowIndex) => {
                const rowCells = Array.isArray(cells[rowIndex]) ? cells[rowIndex] : [];
                return `
                  <tr>
                    <th>${escapeHtml(row.label || `Row ${rowIndex + 1}`)}</th>
                    ${rowCells
                      .map(
                        (cell) => `
                          <td>
                            <div class="chart-cell">
                              <div class="chart-cell__label">${escapeHtml(cell.label || "Type your response")}</div>
                              <div class="chart-cell__placeholder">${escapeHtml(cell.placeholder || "")}</div>
                            </div>
                          </td>
                        `,
                      )
                      .join("")}
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}
function checklistHtml(activity) {
  const data = activity.data ?? {};
  const items = Array.isArray(data.items) ? data.items : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Checklist</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Checklist")}</h3>
        </div>
      </div>
      <ul class="checklist">
        ${items
          .map(
            (item) => `
              <li>
                <input type="checkbox" ${item.checked ? "checked" : ""} aria-label="${escapeHtml(item.text || "Checklist item")}" />
                <span>${escapeHtml(item.text || "Checklist item")}</span>
              </li>
            `,
          )
          .join("")}
      </ul>
    </article>
  `;
}

function criteriaHtml(activity) {
  const data = activity.data ?? {};
  const criteria = Array.isArray(data.criteria) ? data.criteria : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Portfolio evidence</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Portfolio evidence")}</h3>
          <p class="panel-subtle">${escapeHtml(data.instructions || "Capture strong evidence for your portfolio.")}</p>
        </div>
      </div>
      <div class="criteria">
        ${criteria.map((item) => `<div class="criteria-item">${escapeHtml(item)}</div>`).join("")}
      </div>
    </article>
  `;
}

function rubricHtml(activity) {
  const data = activity.data ?? {};
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const columns = Array.isArray(data.columns) ? data.columns : [];
  const cells = Array.isArray(data.cells) ? data.cells : [];
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Rubric</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Rubric")}</h3>
          <p class="panel-subtle">${escapeHtml(data.instructions || "Self-assess against the rubric.")}</p>
        </div>
      </div>
      <div class="rubric-wrap">
        <table class="data-table rubric-table">
          <thead>
            <tr>
              <th>Criterion</th>
              ${columns.map((column) => `<th>${escapeHtml(column.label || "Level")}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${rows
              .map((row, rowIndex) => {
                const rowCells = Array.isArray(cells[rowIndex]) ? cells[rowIndex] : [];
                return `
                  <tr>
                    <th>${escapeHtml(row.label || `Row ${rowIndex + 1}`)}</th>
                    ${rowCells.map((cell) => `<td><div class="rubric-cell">${escapeHtml(cell)}</div></td>`).join("")}
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </article>
  `;
}

function saveLoadHtml(activity) {
  const data = activity.data ?? {};
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Save and restore</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Save or restore progress")}</h3>
          <p class="panel-subtle">${escapeHtml(data.description || "Download your responses and return later.")}</p>
        </div>
      </div>
      <div class="action-grid">
        <div class="action-card">
          <h4>Download JSON</h4>
          <p>Export the current module state as a local JSON file so you can keep working later.</p>
          <button type="button" class="button">Save progress</button>
        </div>
        <div class="action-card">
          <h4>Restore later</h4>
          <p>Upload a saved file and continue the same draft without rebuilding the module from scratch.</p>
          <button type="button" class="button">Restore JSON</button>
        </div>
      </div>
    </article>
  `;
}

function submissionHtml(activity) {
  const data = activity.data ?? {};
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Submission</div>
          <h3 class="panel-title">${escapeHtml(data.title || "Submission builder")}</h3>
        </div>
      </div>
      <div class="action-card">
        <h4>${escapeHtml(data.buttonLabel || "Generate report")}</h4>
        <p>This block mirrors the final export action in the composer draft and gives the module a clear finish point.</p>
        <button type="button" class="button">Generate Module 4 Report</button>
      </div>
    </article>
  `;
}

function fallbackHtml(activity) {
  return `
    <article class="activity panel">
      <div class="panel-head">
        <div>
          <div class="tag">Unsupported block</div>
          <h3 class="panel-title">${escapeHtml(activity.type || "Unknown type")}</h3>
        </div>
      </div>
      <pre class="empty" style="white-space: pre-wrap; margin: 0;">${escapeHtml(JSON.stringify(activity.data ?? {}, null, 2))}</pre>
    </article>
  `;
}

function renderActivity(activity) {
  switch (activity.type) {
    case "title_block": return titleBlockHtml(activity);
    case "content_block": return contentBlockHtml(activity);
    case "accordion_block": return accordionHtml(activity);
    case "worksheet_form": return worksheetHtml(activity);
    case "callout_block": return calloutHtml(activity);
    case "reflection_journal": return reflectionHtml(activity);
    case "fillable_chart": return chartHtml(activity);
    case "checklist_block": return checklistHtml(activity);
    case "portfolio_evidence": return criteriaHtml(activity);
    case "rubric_creator": return rubricHtml(activity);
    case "save_load_block": return saveLoadHtml(activity);
    case "submission_builder": return submissionHtml(activity);
    case "tab_group": return "";
    default: return fallbackHtml(activity);
  }
}

function renderMain() {
  const activeTab = state.tabs.find((tab) => tab.id === state.activeTabId) ?? state.tabs[0];
  const activeActivities = tabActivities(activeTab);
  return `
    <section class="main">
      <div class="section-head">
        <div>
          <div class="eyebrow">Workspace preview</div>
          <h2>${escapeHtml(activeTab?.label || "Section")}</h2>
        </div>
        <p>${escapeHtml(formatCount(activeActivities.length, "block"))} in this section, rendered in the same order as the composer draft.</p>
      </div>
      <div class="block-grid">
        ${activeActivities.map((activity) => renderActivity(activity)).join("") || `<div class="empty">No content is mapped to this section yet.</div>`}
      </div>
    </section>
  `;
}

function renderApp() {
  root.innerHTML = `
    <main class="shell">
      ${heroHtml()}
      <section class="layout">
        ${sidebarHtml()}
        ${renderMain()}
      </section>
    </main>
  `;

  root.querySelectorAll("[data-tab-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeTabId = button.getAttribute("data-tab-id") || state.activeTabId;
      renderApp();
    });
  });
}

async function init() {
  root.innerHTML = loadingHtml();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to fetch ${DATA_URL} (${response.status})`);

    const source = await response.json();
    const payload = source?.draft?.payload ?? source?.payload ?? source;
    const activities = Array.isArray(payload?.composerActivities) ? payload.composerActivities : [];
    const tabGroup = activities.find((activity) => activity.type === "tab_group") ?? null;
    const tabs = Array.isArray(tabGroup?.data?.tabs) ? tabGroup.data.tabs : [];

    state.payload = payload ?? {};
    state.activities = activities;
    state.activityById = new Map(activities.map((activity) => [activity.id, activity]));
    state.tabs = tabs;
    state.activeTabId = tabGroup?.data?.defaultTabId || tabs[0]?.id || "";
    state.tabGroupTitle = tabGroup?.data?.title || "Module Navigation";

    renderApp();
  } catch (error) {
    renderApp();
    root.innerHTML = errorHtml(error instanceof Error ? error.message : String(error));
  }
}

document.addEventListener("DOMContentLoaded", init);
