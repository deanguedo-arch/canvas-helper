import type { CourseBlock, CourseModel, CourseSection } from "./types.js";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHeading(level: number, title: string) {
  const clampedLevel = Math.min(Math.max(level, 2), 5);
  const tag = `h${clampedLevel}`;
  const className = clampedLevel <= 3 ? "text-white font-black uppercase tracking-wide mb-4" : "text-blue-400 font-bold mb-3";
  return `<${tag} class="${className}">${escapeHtml(title)}</${tag}>`;
}

function renderList(block: CourseBlock) {
  const tag = block.ordered ? "ol" : "ul";
  const listClass = block.ordered ? "list-decimal list-inside space-y-2 text-slate-300" : "list-disc list-inside space-y-2 text-slate-300";
  const items = (block.items ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<${tag} class="${listClass}">${items}</${tag}>`;
}

function renderTable(block: CourseBlock) {
  const headers = (block.headers ?? []).map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const rows = (block.rows ?? [])
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("");
  return [
    `<table class="term-table">`,
    headers.length > 0 ? `<thead><tr>${headers}</tr></thead>` : "",
    `<tbody>${rows}</tbody>`,
    `</table>`
  ].join("");
}

function renderCardGrid(block: CourseBlock) {
  const cards = (block.cards ?? [])
    .map((card) => {
      const cardClass =
        card.variant === "anatomy" ? "anatomy-card" : card.variant === "warning" ? "warning-card" : "info-card";
      return `<div class="${cardClass}"><h4>${escapeHtml(card.title)}</h4><p class="text-sm">${escapeHtml(card.body)}</p></div>`;
    })
    .join("");
  return `<div class="grid md:grid-cols-2 gap-4">${cards}</div>`;
}

function renderFigure(block: CourseBlock) {
  if (block.figureSourceUrl && /(preview|\.pdf(?:$|\?))/i.test(block.figureSourceUrl)) {
    return [
      `<div class="w-full h-[600px] bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">`,
      `<iframe src="${escapeHtml(block.figureSourceUrl)}" width="100%" height="100%" allow="autoplay"></iframe>`,
      `</div>`
    ].join("");
  }

  if (block.figureSourceUrl && /\.(?:png|jpe?g|webp|gif|svg)(?:$|\?)/i.test(block.figureSourceUrl)) {
    const label = escapeHtml(block.figureLabel ?? "Figure");
    const description = block.figureDescription ? escapeHtml(block.figureDescription) : "";
    return [
      `<figure class="image-box border border-emerald-500/60">`,
      `<img src="${escapeHtml(block.figureSourceUrl)}" alt="${label}" class="w-full h-auto rounded-xl border border-slate-700">`,
      `<figcaption class="text-xs text-slate-300 mt-3"><strong class="text-blue-300">${label}</strong>${
        description.length > 0 ? ` - ${description}` : ""
      }</figcaption>`,
      `</figure>`
    ].join("");
  }

  const statusClass = block.figureStatus === "pending" ? "border-amber-500/60" : "border-emerald-500/60";
  const statusLabel = block.figureStatus === "pending" ? "Pending visual conversion" : "Visual available";
  const sourceNote = block.figureSourceUrl ? `<p class="text-xs text-slate-400 mt-2">Source: ${escapeHtml(block.figureSourceUrl)}</p>` : "";
  return [
    `<div class="image-box border ${statusClass}">`,
    `<strong class="text-blue-300">${escapeHtml(block.figureLabel ?? "Figure")}</strong>`,
    `<p class="text-xs text-slate-300 mt-2">${escapeHtml(block.figureDescription ?? "")}</p>`,
    `<p class="text-[11px] text-amber-300 mt-2 uppercase tracking-widest">${statusLabel}</p>`,
    sourceNote,
    `</div>`
  ].join("");
}

function renderBlock(block: CourseBlock) {
  if (block.type === "heading" && block.title) {
    return renderHeading(block.level ?? 3, block.title);
  }

  if (block.type === "paragraph" && block.text) {
    return `<p class="text-slate-300 leading-8">${escapeHtml(block.text)}</p>`;
  }

  if (block.type === "list") {
    return renderList(block);
  }

  if (block.type === "table") {
    return renderTable(block);
  }

  if (block.type === "referenceNote" && block.text) {
    return `<div class="ref-note">${escapeHtml(block.text)}</div>`;
  }

  if (block.type === "warning") {
    return `<div class="warning-card"><h4>${escapeHtml(block.title ?? "Warning")}</h4><p class="text-sm">${escapeHtml(
      block.text ?? ""
    )}</p></div>`;
  }

  if (block.type === "callout") {
    return `<div class="q-box">${escapeHtml(block.text ?? "")}</div>`;
  }

  if (block.type === "cardGrid") {
    return renderCardGrid(block);
  }

  if (block.type === "figure") {
    return renderFigure(block);
  }

  if (block.type === "rawHtml" && block.html) {
    return block.html;
  }

  return "";
}

function isStructuredHtmlFragment(html: string) {
  return (
    /class="[^"]*(?:read-block|ref-note|image-box|q-box|warning-card|info-card|anatomy-card|term-table|glass|module-container|clay-card|practice-panel|workbook-note|study-check-results)[^"]*"/.test(
      html
    ) ||
    /class="[^"]*(?:flex|grid|overflow-hidden|border-b|rounded-xl|shadow-2xl)[^"]*"/.test(html) ||
    /<(?:iframe|img|table)\b/i.test(html)
  );
}

function renderSection(section: CourseSection, isFirst: boolean) {
  const hasEmbeddedHero =
    section.blocks[0]?.type === "rawHtml" &&
    typeof section.blocks[0].html === "string" &&
    /<h2[\s>]/i.test(section.blocks[0].html);
  const renderedBlocks = section.blocks
    .filter((block) => !(block.type === "heading" && (block.title ?? "").trim() === section.title.trim()))
    .map((block) => renderBlock(block))
    .filter((html) => html.trim().length > 0)
    .map((html) => {
      const trimmed = html.trim();
      if (isStructuredHtmlFragment(trimmed)) {
        return trimmed;
      }
      if (trimmed.startsWith("<table") || trimmed.startsWith("<ul") || trimmed.startsWith("<ol")) {
        return `<div class="read-block">${trimmed}</div>`;
      }
      if (trimmed.startsWith("<h")) {
        return trimmed;
      }

      return `<div class="read-block">${trimmed}</div>`;
    })
    .join("\n");

  return [
    `<div id="${section.id}" class="section-content${isFirst ? " active" : ""} space-y-8">`,
    `<div class="glass p-8 rounded-2xl">`,
    hasEmbeddedHero
      ? ""
      : `<h2 class="text-4xl font-black uppercase italic tracking-tight text-white mb-8">${escapeHtml(section.title)}</h2>`,
    renderedBlocks,
    `</div>`,
    `</div>`
  ].join("\n");
}

export function renderStudyTabs(course: CourseModel) {
  return course.sections
    .map((section, index) => {
      const activeClass = index === 0 ? " bg-slate-800 border-slate-700 shadow-sm text-blue-400" : " text-slate-400";
      return [
        `<button type="button" data-study-tab="${section.id}" id="btn-study-${section.id}"`,
        `class="nav-btn px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:text-white${activeClass}">`,
        `${escapeHtml(section.tabLabel)}`,
        `</button>`
      ].join(" ");
    })
    .join("\n");
}

export function renderStudySections(course: CourseModel) {
  return course.sections.map((section, index) => renderSection(section, index === 0)).join("\n");
}
