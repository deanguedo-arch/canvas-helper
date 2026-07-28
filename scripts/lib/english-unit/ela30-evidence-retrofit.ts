import { createHash } from "node:crypto";
import { load } from "cheerio";
import {
  ENGLISH_EVIDENCE_BANK_CSS,
  ENGLISH_EVIDENCE_BANK_RUNTIME,
  renderEnglishEvidenceBankRoute,
} from "./evidence-bank-core.js";
import type {
  EnglishActivityProfileKind,
  EnglishEvidenceBankRetrofitAdapterV1,
  EnglishEvidenceBankRetrofitV1,
} from "./types.js";

export const ELA30_EVIDENCE_RETROFIT_VERSION = "1.1.0";
export const ELA30_EVIDENCE_PROJECT_SLUGS = [
  "ela30-1-short-stories",
  "ela30-1-shakespeare-othello",
  "ela30-1-modern-drama",
  "ela30-1-novel-study-legacy",
  "ela30-1-feature-film-legacy",
] as const;

export type Ela30EvidenceProjectSlug = (typeof ELA30_EVIDENCE_PROJECT_SLUGS)[number];

type AdapterKind = "collection" | "collection-composer" | "individual-composer" | "json-item" | "adaptive" | "modern-state";

interface EvidenceComposerField {
  id: string;
  label: string;
  control?: "input" | "textarea";
  placeholder: string;
}

interface EvidenceAdapter {
  id: string;
  kind: AdapterKind;
  route: string;
  rootSelector: string;
  activityTitle: string;
  workTitle: string;
  collectionIdTemplate: string;
  saveLabel: string;
  activeSelector?: string;
  activeAttribute?: string;
  activePanelSelector?: string;
  activePanelAttribute?: string;
  fieldSelector?: string;
  promptSelector?: string;
  fieldScope?: "root" | "document";
  disabledActiveValues?: string[];
  individualActiveValues?: string[];
  storeSelector?: string;
  itemTitleFields?: string[];
  composerFields?: EvidenceComposerField[];
  tags?: string[];
}

interface EvidenceProjectDefinition {
  projectSlug: Ela30EvidenceProjectSlug;
  courseCode: string;
  courseTitle: string;
  profile: EnglishActivityProfileKind;
  storageBase: string;
  requiredSnippets: string[];
  adapters: EvidenceAdapter[];
  renameLocalBanks?: Array<{ from: string; to: string }>;
  pageIdArray?: boolean;
  staticPagesArray?: boolean;
  othelloNonLessonFilter?: boolean;
}

export interface ApplyEnglishEvidenceRetrofitInput {
  projectSlug: string;
  html: string;
}

export interface AppliedEnglishEvidenceRetrofit {
  html: string;
  changed: boolean;
  baseHash: string;
  outputHash: string;
  project: EvidenceProjectDefinition;
  selectorChecks: Array<{ selector: string; found: boolean; count: number; adapterId?: string }>;
  actionIds: string[];
}

export interface EnglishEvidenceRetrofitVerification {
  ok: boolean;
  failures: string[];
  actionIds: string[];
}

const MARKERS = {
  styles: [
    "<!-- canvas-helper:ela30-evidence-retrofit:styles:start -->",
    "<!-- canvas-helper:ela30-evidence-retrofit:styles:end -->",
  ],
  nav: [
    "<!-- canvas-helper:ela30-evidence-retrofit:nav:start -->",
    "<!-- canvas-helper:ela30-evidence-retrofit:nav:end -->",
  ],
  route: [
    "<!-- canvas-helper:ela30-evidence-retrofit:route:start -->",
    "<!-- canvas-helper:ela30-evidence-retrofit:route:end -->",
  ],
  runtime: [
    "<!-- canvas-helper:ela30-evidence-retrofit:runtime:start -->",
    "<!-- canvas-helper:ela30-evidence-retrofit:runtime:end -->",
  ],
} as const;

const PROJECTS: Record<Ela30EvidenceProjectSlug, EvidenceProjectDefinition> = {
  "ela30-1-short-stories": {
    projectSlug: "ela30-1-short-stories",
    courseCode: "ELA 30-1",
    courseTitle: "Short Stories",
    profile: "short-fiction",
    storageBase: "canvas-helper:ela30-1-short-stories",
    requiredSnippets: [
      'id="story-questions"',
      "data-default-worksheet-story",
      "data-worksheet-answer",
      'id="writing"',
      "data-analysis-explorer",
    ],
    adapters: [
      {
        id: "short-story-question-collection",
        kind: "collection",
        route: "story-questions",
        rootSelector: ".story-questions-studio[data-worksheet-studio]",
        activityTitle: "Short Story Questions",
        workTitle: "{activeLabel}",
        collectionIdTemplate: "ela30-short-stories:questions:{active}",
        saveLabel: "Save Story Answers to Evidence Bank",
        activeSelector: "[data-worksheet-select]",
        fieldSelector: "[data-worksheet-answer]",
        promptSelector: ".worksheet-question-prompt, .worksheet-answer-field > span",
        tags: ["short-fiction", "guided-questions"],
      },
      {
        id: "short-story-writing-evidence",
        kind: "individual-composer",
        route: "writing",
        rootSelector: "[data-analysis-explorer]",
        activityTitle: "Writing Studio Analysis",
        workTitle: "Short Stories",
        collectionIdTemplate: "ela30-short-stories:writing:{active}",
        saveLabel: "Save to Evidence Bank",
        activeSelector: "[data-analysis-story-select]",
        tags: ["short-fiction", "analysis"],
      },
      {
        id: "short-story-personal-response-plan",
        kind: "collection-composer",
        route: "writing",
        rootSelector: "[data-analysis-explorer]",
        activityTitle: "Personal Response Plan",
        workTitle: "{activeLabel}",
        collectionIdTemplate: "ela30-short-stories:personal-response:{active}",
        saveLabel: "Save Personal Response Plan to Evidence Bank",
        activeSelector: "[data-analysis-story-select]",
        composerFields: [
          { id: "idea", label: "Idea, feeling, or impression", placeholder: "What central idea, feeling, or impression does the text create for you?" },
          { id: "connection", label: "Personal connection", placeholder: "What knowledge or experience connects meaningfully to that idea?" },
          { id: "evidence", label: "Textual evidence", placeholder: "Record the precise quotation, image, event, or detail you will use." },
          { id: "form", label: "Prose form and purpose", placeholder: "Which prose form best communicates this response, and why?" },
          { id: "opening", label: "Controlling idea or opening move", placeholder: "Draft the line or controlling idea that will guide your response." },
        ],
        tags: ["short-fiction", "personal-response", "writing-plan"],
      },
    ],
  },
  "ela30-1-shakespeare-othello": {
    projectSlug: "ela30-1-shakespeare-othello",
    courseCode: "ELA 30-1",
    courseTitle: "Shakespearean Drama - Othello",
    profile: "shakespeare-drama",
    storageBase: "canvas-helper:ela30-1-shakespeare-othello",
    requiredSnippets: [
      'id="side-by-side"',
      "data-parallel-select",
      "data-default-worksheet-story",
      "data-character-dossier-studio",
      "data-othello-writing-studio",
    ],
    othelloNonLessonFilter: true,
    renameLocalBanks: [
      { from: "<h5>Quotation bank</h5>", to: "<h5>Key quotation</h5>" },
      { from: "<h4>Quotation bank</h4>", to: "<h4>Key quotations</h4>" },
    ],
    adapters: [
      {
        id: "othello-close-reading",
        kind: "individual-composer",
        route: "side-by-side",
        rootSelector: "#side-by-side",
        activityTitle: "Side-by-Side Close Reading",
        workTitle: "Othello - {activeLabel}",
        collectionIdTemplate: "ela30-othello:close-reading:{active}",
        saveLabel: "Save Close Reading to Evidence Bank",
        activeSelector: "[data-parallel-select]",
        tags: ["othello", "close-reading"],
      },
      {
        id: "othello-act-questions",
        kind: "collection",
        route: "story-questions",
        rootSelector: ".story-questions-studio[data-worksheet-studio]",
        activityTitle: "Othello Act Questions",
        workTitle: "Othello - {activeLabel}",
        collectionIdTemplate: "ela30-othello:act-questions:{active}",
        saveLabel: "Save Act Answers to Evidence Bank",
        activeSelector: "[data-worksheet-select]",
        fieldSelector: "[data-worksheet-answer]",
        promptSelector: ".worksheet-question-prompt, .worksheet-answer-field > span",
        tags: ["othello", "act-questions"],
      },
      {
        id: "othello-character-dossier",
        kind: "collection",
        route: "character-notes",
        rootSelector: "[data-character-dossier-studio]",
        activityTitle: "Othello Character Dossier",
        workTitle: "Othello - {activeLabel}",
        collectionIdTemplate: "ela30-othello:character:{active}",
        saveLabel: "Save Dossier to Evidence Bank",
        activeAttribute: "data-active-character-dossier",
        fieldSelector: "[data-character-dossier-field]:not([type=color])",
        promptSelector: ".character-dossier-field > span, h4",
        tags: ["othello", "character-dossier"],
      },
      {
        id: "othello-writing-activity",
        kind: "adaptive",
        route: "writing",
        rootSelector: "[data-othello-writing-studio]",
        activityTitle: "Shakespeare Writing Studio",
        workTitle: "Othello - {activeLabel}",
        collectionIdTemplate: "ela30-othello:writing:{active}",
        saveLabel: "Save Writing Work to Evidence Bank",
        activeSelector: "[data-othello-assignment-select]",
        activePanelSelector: "[data-othello-assignment-panel]",
        activePanelAttribute: "data-othello-assignment-panel",
        fieldSelector: "textarea, input:not([type=button]):not([type=submit]), select",
        promptSelector: "label, h3, h4",
        disabledActiveValues: ["language-translator"],
        individualActiveValues: ["annotation-lab"],
        tags: ["othello", "writing-studio"],
      },
    ],
  },
  "ela30-1-modern-drama": {
    projectSlug: "ela30-1-modern-drama",
    courseCode: "ELA 30-1",
    courseTitle: "Modern Drama - A Streetcar Named Desire",
    profile: "modern-drama",
    storageBase: "canvas-helper:ela30-1-modern-drama",
    staticPagesArray: true,
    requiredSnippets: ['id="writing"', "data-critical-response-activity", "const criticalResponseState"],
    adapters: [
      {
        id: "streetcar-critical-response",
        kind: "modern-state",
        route: "writing",
        rootSelector: "[data-critical-response-activity]",
        activityTitle: "Critical Response Workshop",
        workTitle: "A Streetcar Named Desire",
        collectionIdTemplate: "ela30-streetcar:critical-response:{active}",
        saveLabel: "Save Writing Work to Evidence Bank",
        individualActiveValues: ["evidenceCollector", "paragraphArchitect"],
        tags: ["streetcar", "critical-response"],
      },
      {
        id: "streetcar-writing-evidence-note",
        kind: "individual-composer",
        route: "writing",
        rootSelector: "[data-critical-response-activity]",
        activityTitle: "Streetcar Writing Evidence Note",
        workTitle: "A Streetcar Named Desire",
        collectionIdTemplate: "ela30-streetcar:writing-note",
        saveLabel: "Save Evidence Note to Evidence Bank",
        tags: ["streetcar", "critical-response", "evidence-note"],
      },
      {
        id: "streetcar-response-plan",
        kind: "collection-composer",
        route: "writing",
        rootSelector: "[data-critical-response-activity]",
        activityTitle: "Streetcar Critical Response Plan",
        workTitle: "A Streetcar Named Desire",
        collectionIdTemplate: "ela30-streetcar:response-plan",
        saveLabel: "Save Response Plan to Evidence Bank",
        composerFields: [
          { id: "claim", label: "Interpretive claim", placeholder: "State the defensible idea your response will develop." },
          { id: "evidence", label: "Best supporting evidence", placeholder: "Record the precise line, action, image, or dramatic choice you will use." },
          { id: "analysis", label: "Analytical connection", placeholder: "Explain how the evidence proves or complicates the claim." },
        ],
        tags: ["streetcar", "critical-response", "writing-plan"],
      },
    ],
  },
  "ela30-1-novel-study-legacy": {
    projectSlug: "ela30-1-novel-study-legacy",
    courseCode: "ELA 30-1",
    courseTitle: "Novel Study",
    profile: "novel-study",
    storageBase: "canvas-helper:ela30-1-novel-study-legacy",
    requiredSnippets: [
      'id="critical-essay"',
      "data-reading-notebook",
      "data-reading-evidence-store",
      "data-novel-question-studio",
      "data-writing-activity-select",
    ],
    pageIdArray: true,
    renameLocalBanks: [
      { from: "<h3>Evidence bank</h3>", to: "<h3>Saved Passages</h3>" },
      { from: "<h3>Evidence bank</h3>", to: "<h3>Saved Paragraphs</h3>" },
    ],
    adapters: [
      {
        id: "novel-reading-passage",
        kind: "json-item",
        route: "reading-guide",
        rootSelector: "[data-reading-notebook]",
        activityTitle: "Reading Guide Passage",
        workTitle: "Novel Study",
        collectionIdTemplate: "ela30-novel:reading-passage:{itemId}",
        saveLabel: "Save Passage to Evidence Bank",
        storeSelector: "[data-reading-evidence-store]",
        itemTitleFields: ["location", "passage", "type"],
        tags: ["novel-study", "reading-passage"],
      },
      {
        id: "novel-question-collection",
        kind: "collection",
        route: "novel-study-questions",
        rootSelector: "[data-novel-question-studio]",
        activityTitle: "Novel Study Questions",
        workTitle: "Novel Study - {activeLabel}",
        collectionIdTemplate: "ela30-novel:questions:{active}",
        saveLabel: "Save Question Set to Evidence Bank",
        activeSelector: "[data-novel-question-section-select]",
        activePanelSelector: "[data-novel-question-panel]",
        activePanelAttribute: "data-novel-question-panel",
        fieldSelector: "[data-novel-question-answer]",
        promptSelector: ".worksheet-question-prompt",
        tags: ["novel-study", "questions"],
      },
      {
        id: "novel-writing-activity",
        kind: "adaptive",
        route: "writing",
        rootSelector: "#writing",
        activityTitle: "Novel Writing Studio",
        workTitle: "Novel Study - {activeLabel}",
        collectionIdTemplate: "ela30-novel:writing:{active}",
        saveLabel: "Save Writing Work to Evidence Bank",
        activeSelector: "[data-writing-activity-select]",
        activePanelSelector: "[data-writing-activity-panel]",
        activePanelAttribute: "data-writing-activity-panel",
        fieldSelector: "textarea, input:not([type=button]):not([type=submit]), select",
        promptSelector: "label, h3, h4",
        individualActiveValues: ["paragraph-builder", "motif-string-board", "author-intent-toggle"],
        tags: ["novel-study", "writing-studio"],
      },
    ],
  },
  "ela30-1-feature-film-legacy": {
    projectSlug: "ela30-1-feature-film-legacy",
    courseCode: "ELA 30-1",
    courseTitle: "Feature Film",
    profile: "film-study",
    storageBase: "canvas-helper:ela30-1-feature-film-legacy",
    requiredSnippets: [
      'id="critical-essay"',
      "data-viewing-notebook",
      "data-evidence-store",
      "data-film-question-studio",
      'id="film-room"',
    ],
    pageIdArray: true,
    renameLocalBanks: [{ from: "<h3>Evidence bank</h3>", to: "<h3>Saved Viewing Moments</h3>" }],
    adapters: [
      {
        id: "film-viewing-moment",
        kind: "json-item",
        route: "viewing-guide",
        rootSelector: "[data-viewing-notebook]",
        activityTitle: "Viewing Guide Moment",
        workTitle: "Feature Film",
        collectionIdTemplate: "ela30-film:viewing-moment:{itemId}",
        saveLabel: "Save Viewing Moment to Evidence Bank",
        storeSelector: "[data-evidence-store]",
        itemTitleFields: ["timestamp", "observation", "technique"],
        tags: ["film-study", "viewing-moment"],
      },
      {
        id: "film-viewing-synthesis",
        kind: "collection",
        route: "viewing-guide",
        rootSelector: "[data-viewing-notebook]",
        activityTitle: "Viewing Guide Synthesis",
        workTitle: "Feature Film",
        collectionIdTemplate: "ela30-film:viewing-synthesis",
        saveLabel: "Save Viewing Synthesis to Evidence Bank",
        fieldSelector: '[data-response-id^="viewing-synthesis-"]',
        promptSelector: "label",
        tags: ["film-study", "viewing-synthesis"],
      },
      {
        id: "film-question-collection",
        kind: "collection",
        route: "film-study-questions",
        rootSelector: "[data-film-question-studio]",
        activityTitle: "Film Study Questions",
        workTitle: "Feature Film - {activeLabel}",
        collectionIdTemplate: "ela30-film:questions:{active}",
        saveLabel: "Save Question Set to Evidence Bank",
        activeSelector: "[data-film-question-select]",
        activePanelSelector: "[data-film-question-panel]",
        activePanelAttribute: "data-film-question-panel",
        fieldSelector: "[data-film-question-answer]",
        promptSelector: ".worksheet-question-prompt",
        tags: ["film-study", "questions"],
      },
    ],
  },
};

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripMarkerBlock(html: string, markers: readonly [string, string]): string {
  return html.replace(new RegExp(`${escapeRegExp(markers[0])}[\\s\\S]*?${escapeRegExp(markers[1])}\\n?`, "g"), "");
}

function stripRetrofitBlocks(html: string): string {
  return Object.values(MARKERS).reduce((current, markers) => stripMarkerBlock(current, markers), html);
}

function markerBlock(markers: readonly [string, string], content: string): string {
  const normalizedContent = content.trim().replace(/[ \t]+$/gm, "");
  return `${markers[0]}\n${normalizedContent}\n${markers[1]}`;
}

function assertExactlyOne(haystack: string, needle: string, label: string): void {
  const count = haystack.split(needle).length - 1;
  if (count !== 1) throw new Error(`ELA 30-1 Evidence Bank retrofit expected exactly one ${label}; found ${count}.`);
}

function getProjectDefinition(projectSlug: string): EvidenceProjectDefinition {
  if (!ELA30_EVIDENCE_PROJECT_SLUGS.includes(projectSlug as Ela30EvidenceProjectSlug)) {
    throw new Error(`Unsupported ELA 30-1 Evidence Bank project: ${projectSlug}`);
  }
  return PROJECTS[projectSlug as Ela30EvidenceProjectSlug];
}

function renderStyles(): string {
  return `<style data-ela30-evidence-retrofit-styles>
${ENGLISH_EVIDENCE_BANK_CSS}
.english-evidence-card { border: 1px solid #d6ddd3; border-left: 4px solid #175a1a; background: #f7f9f6; padding: 18px; }
.english-evidence-card header { display: flex; justify-content: space-between; gap: 14px; align-items: start; }
.english-evidence-card h4 { margin: 0; color: #151a16; }
.english-evidence-card-meta { color: #557057; font-size: .88rem; font-weight: 700; }
.english-evidence-card-detail { white-space: pre-wrap; line-height: 1.55; margin: 12px 0 0; }
.english-evidence-empty { color: #5d685d; margin: 0; }
.english-evidence-secondary { border: 1px solid #9eac9b; background: #fff; color: #174c19; padding: 9px 13px; font: inherit; font-weight: 800; cursor: pointer; }
.english-evidence-status { color: #486049; font-size: .9rem; }
.english-evidence-activity-actions { border: 1px solid #d6ddd3; border-top: 4px solid #175a1a; background: #f7f9f6; padding: 16px; margin: 18px 0; }
.english-evidence-activity-actions p { margin: 0 0 10px; color: #465447; }
.english-evidence-composer-card { border: 1px solid #d6ddd3; background: #fff; padding: 18px; margin-top: 18px; }
.english-evidence-composer-card h3 { margin-top: 0; }
.english-evidence-composer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.english-evidence-composer-grid label:last-child { grid-column: 1 / -1; }
.english-evidence-json-picker { display: grid; grid-template-columns: minmax(220px, 1fr) auto; gap: 10px; align-items: end; }
.english-evidence-composer-card textarea,
.english-evidence-composer-card input,
.english-evidence-json-picker select { width: 100%; box-sizing: border-box; border: 1px solid #aeb8a7; border-radius: 6px; padding: 10px 12px; font: inherit; }
.english-evidence-composer-card label,
.english-evidence-json-picker label { display: grid; gap: 6px; font-weight: 700; }
.english-evidence-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-top: 14px; }
.english-evidence-activity-actions [data-save-response-collection],
.english-evidence-activity-actions [data-save-evidence-note],
.english-evidence-composer-card [data-save-response-collection],
.english-evidence-composer-card [data-save-evidence-note] { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 1px solid #154212; border-radius: 6px; background: #154212; color: #fff; padding: 10px 14px; font: inherit; font-weight: 800; cursor: pointer; }
.english-evidence-activity-actions [data-save-response-collection]:hover,
.english-evidence-activity-actions [data-save-evidence-note]:hover,
.english-evidence-composer-card [data-save-response-collection]:hover,
.english-evidence-composer-card [data-save-evidence-note]:hover { background: #0f4212; }
@media (max-width: 760px) {
  .english-evidence-composer-grid,
  .english-evidence-json-picker { grid-template-columns: 1fr; }
}
@media print {
  .english-evidence-activity-actions,
  .english-evidence-card button { display: none !important; }
}
</style>`;
}

function renderEvidenceRoute(project: EvidenceProjectDefinition): string {
  const links = project.adapters
    .filter((adapter, index, all) => all.findIndex((candidate) => candidate.route === adapter.route) === index)
    .slice(0, 4)
    .map((adapter) => ({ id: adapter.route, label: adapter.activityTitle, icon: "arrow_outward" }));
  return renderEnglishEvidenceBankRoute({
    projectSlug: project.projectSlug,
    courseCode: project.courseCode,
    profile: project.profile,
    links,
  })
    .replace(
      'class="course-page" data-page="evidence-bank" hidden',
      `class="course-page" data-page="evidence-bank" hidden data-english-evidence-bank-route data-evidence-profile="${project.profile}"`,
    )
    .replace(
      "data-evidence-notebook-panel",
      'data-evidence-notebook-panel data-evidence-capture="manual-evidence-note" data-evidence-contribution-id="manual-evidence-note"',
    );
}

function renderNavLink(resourceLink: string): string {
  return resourceLink
    .replace(/#resources/g, "#evidence-bank")
    .replace(/data-page-target="resources"/g, 'data-page-target="evidence-bank"')
    .replace(/folder_open/g, "collections_bookmark")
    .replace(/Resources/g, "Evidence Bank");
}

function renderRuntime(project: EvidenceProjectDefinition): string {
  const runtimeConfig = JSON.stringify({
    projectSlug: project.projectSlug,
    courseCode: project.courseCode,
    courseTitle: project.courseTitle,
    profile: project.profile,
    storageKey: `${project.storageBase}:manual-evidence-notes`,
    responseStorageKey: `${project.storageBase}:responses`,
    adapters: project.adapters,
  }).replace(/</g, "\\u003c");
  return `<script data-ela30-evidence-retrofit-runtime>
(() => {
  const config = ${runtimeConfig};
  const fallbackStorage = {};
  const adapterById = Object.fromEntries(config.adapters.map((adapter) => [adapter.id, adapter]));
  function readStorage(key, fallbackValue) {
    try { return window.localStorage?.getItem(key) || fallbackValue; } catch { return fallbackStorage[key] || fallbackValue; }
  }
  function writeStorage(key, value) {
    try { window.localStorage?.setItem(key, value); } catch { fallbackStorage[key] = value; }
  }
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function safeJson(value, fallbackValue) { try { return JSON.parse(value); } catch { return fallbackValue; } }
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]);
  }
  function normalizeIdentity(value) { return String(value == null ? "" : value).trim(); }
  function normalizeIdentitySegment(value) {
    return normalizeIdentity(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
  }
  function readManualEvidenceNotes() {
    const notes = safeJson(readStorage(config.storageKey, "[]"), []);
    return Array.isArray(notes) ? notes : [];
  }
  function writeManualEvidenceNotes(notes) { writeStorage(config.storageKey, JSON.stringify(notes)); }
  function readRetrofitResponses() {
    const responses = safeJson(readStorage(config.responseStorageKey, "{}"), {});
    return responses && typeof responses === "object" && !Array.isArray(responses) ? responses : {};
  }
  function writeRetrofitResponses(responses) { writeStorage(config.responseStorageKey, JSON.stringify(responses)); }
  function persistRetrofitField(field) {
    const responseId = field?.getAttribute?.("data-response-id");
    if (!responseId) return;
    const responses = readRetrofitResponses();
    responses[responseId] = field.type === "checkbox" || field.type === "radio" ? Boolean(field.checked) : field.value;
    writeRetrofitResponses(responses);
  }
  function restoreRetrofitFields() {
    const responses = readRetrofitResponses();
    document.querySelectorAll("[data-evidence-draft][data-response-id], [data-evidence-retrofit-draft][data-response-id]").forEach((field) => {
      const responseId = field.getAttribute("data-response-id");
      if (!Object.prototype.hasOwnProperty.call(responses, responseId)) return;
      if (field.type === "checkbox" || field.type === "radio") field.checked = Boolean(responses[responseId]);
      else field.value = String(responses[responseId] ?? "");
    });
  }
  function getFacet(entry, facet) {
    if (facet === "activity") return entry.activity?.title || entry.activity?.id || "";
    if (facet === "work") return entry.work?.title || entry.work?.id || "";
    if (facet === "type") return entry.entryKind || entry.evidenceType || "";
    if (facet === "locator") {
      const locator = entry.locator;
      if (!locator || typeof locator !== "object") return locator || "";
      return locator.label || locator.act || locator.scene || locator.chapter || locator.timestamp || "";
    }
    return entry[facet] || "";
  }
  function fillFilterOptions(notes) {
    document.querySelectorAll("[data-evidence-bank-filter]").forEach((field) => {
      const facet = field.getAttribute("data-evidence-bank-filter");
      const selected = field.value;
      const label = field.options?.[0]?.textContent || "All";
      const values = notes.map((entry) => normalizeIdentity(getFacet(entry, facet))).filter(Boolean).filter((value, index, all) => all.indexOf(value) === index).sort();
      field.innerHTML = '<option value="">' + escapeHtml(label) + '</option>' + values.map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join("");
      if (values.includes(selected)) field.value = selected;
    });
  }
  function renderManualEvidenceBank() {
    const notes = readManualEvidenceNotes();
    fillFilterOptions(notes);
    const filters = Array.from(document.querySelectorAll("[data-evidence-bank-filter]")).reduce((result, field) => {
      if (field.value) result[field.getAttribute("data-evidence-bank-filter")] = field.value;
      return result;
    }, {});
    const filtered = notes.filter((entry) => Object.entries(filters).every(([facet, expected]) => String(getFacet(entry, facet)) === String(expected)));
    document.querySelectorAll("[data-manual-evidence-list]").forEach((list) => {
      if (!filtered.length) {
        list.innerHTML = '<p class="english-evidence-empty">No saved evidence matches this view yet. Return to an activity or add a note below.</p>';
        return;
      }
      list.innerHTML = filtered.map((entry) => {
        const contributionId = entry.contributionId || entry.responseId || entry.id || "";
        const activity = entry.activity?.title || "Saved evidence";
        const work = entry.work?.title || "";
        const locator = getFacet(entry, "locator");
        const meta = [work, locator, entry.entryKind === "collection" ? "Collection" : "Evidence note"].filter(Boolean).join(" · ");
        const prompt = entry.prompt ? '<div class="english-evidence-card-detail"><strong>Prompt or scope</strong>\\n' + escapeHtml(entry.prompt) + '</div>' : "";
        const detailValue = entry.evidence || entry.answer || entry.detail || "";
        const analysisValue = entry.analysis || entry.connection || "";
        const detail = detailValue ? '<div class="english-evidence-card-detail"><strong>Evidence or saved work</strong>\\n' + escapeHtml(detailValue) + '</div>' : "";
        const analysis = analysisValue ? '<div class="english-evidence-card-detail"><strong>Analysis</strong>\\n' + escapeHtml(analysisValue) + '</div>' : "";
        return '<article class="english-evidence-card" data-evidence-bank-entry="' + escapeHtml(contributionId) + '" data-evidence-bank-entry-kind="' + escapeHtml(entry.entryKind || (entry.responseId ? "collection" : "individual")) + '"><header><div><div class="english-evidence-card-meta">' + escapeHtml(meta) + '</div><h4>' + escapeHtml(activity) + '</h4></div><button class="english-evidence-secondary" type="button" data-remove-evidence-note="' + escapeHtml(contributionId) + '">Remove</button></header>' + prompt + detail + analysis + '</article>';
      }).join("");
    });
  }
${ENGLISH_EVIDENCE_BANK_RUNTIME}
  function activeInfo(adapter, root) {
    if (adapter.kind === "modern-state") {
      const value = typeof criticalResponseState !== "undefined" ? criticalResponseState.activeId : "";
      const labels = { textKnowledge: "Text Knowledge", thesisControl: "Thesis Builder", evidenceCollector: "Evidence Collector", paragraphArchitect: "Paragraph Architect" };
      return { value, label: labels[value] || value || adapter.activityTitle };
    }
    if (adapter.activeAttribute) {
      const value = root.getAttribute(adapter.activeAttribute) || adapter.id;
      return { value, label: value };
    }
    const select = adapter.activeSelector ? root.querySelector(adapter.activeSelector) || document.querySelector(adapter.activeSelector) : null;
    if (!select) return { value: adapter.id, label: adapter.activityTitle };
    const value = select.value || adapter.id;
    const label = select.selectedOptions?.[0]?.textContent?.trim() || value;
    return { value, label };
  }
  function interpolateDisplay(value, data) {
    return String(value || "").replace(/\{active\}/g, data.active).replace(/\{activeLabel\}/g, data.activeLabel).replace(/\{itemId\}/g, data.itemId || "item");
  }
  function interpolateIdentity(value, data) {
    return String(value || "")
      .replace(/\{active\}/g, normalizeIdentitySegment(data.active))
      .replace(/\{activeLabel\}/g, normalizeIdentitySegment(data.activeLabel))
      .replace(/\{itemId\}/g, normalizeIdentitySegment(data.itemId || "item"));
  }
  function resolvePanel(adapter, root, activeValue) {
    if (!adapter.activePanelSelector) return root;
    return Array.from(root.querySelectorAll(adapter.activePanelSelector)).find((panel) => panel.getAttribute(adapter.activePanelAttribute) === activeValue) || root;
  }
  function fieldValue(field) {
    if (field.type === "checkbox") return field.checked ? "Yes" : "";
    if (field.type === "radio") return field.checked ? field.value : "";
    if (field instanceof HTMLSelectElement) return field.selectedOptions?.[0]?.textContent?.trim() || field.value || "";
    return String(field.value || "").trim();
  }
  function fieldPrompt(field, adapter) {
    const container = field.closest(".worksheet-question, label, .critical-writing-panel, .character-dossier-card, .writing-activity-panel") || field.parentElement;
    const promptNode = adapter.promptSelector ? container?.querySelector(adapter.promptSelector) : null;
    const prompt = promptNode?.textContent?.replace(/\s+/g, " ").trim();
    return prompt || field.getAttribute("data-response-id") || field.getAttribute("name") || "Response";
  }
  function collectFields(adapter, root, activeValue) {
    const panel = adapter.fieldScope === "document" ? document : resolvePanel(adapter, root, activeValue);
    const fields = Array.from(panel.querySelectorAll(adapter.fieldSelector || "textarea, input, select"));
    return fields.map((field, index) => {
      const localId = field.getAttribute("data-response-id") || field.getAttribute("data-worksheet-answer") || field.getAttribute("data-novel-question-answer") || field.getAttribute("data-film-question-answer") || field.getAttribute("data-character-dossier-field") || field.getAttribute("name") || String(index + 1);
      return {
        prompt: fieldPrompt(field, adapter),
        answer: fieldValue(field),
        responseId: [adapter.id, activeValue || "default", localId].join(":"),
      };
    }).filter((entry) => entry.answer);
  }
  function setStatus(root, message) {
    const status = root?.querySelector("[data-evidence-save-status], [data-save-status]");
    if (status) status.textContent = message;
  }
  function entryKind(adapter, activeValue) {
    return (adapter.kind === "individual-composer" || adapter.kind === "json-item" || (adapter.individualActiveValues || []).includes(activeValue)) ? "individual" : "collection";
  }
  function updateAdapterUi(adapter, root) {
    const info = activeInfo(adapter, root);
    const wrapper = root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"]');
    if (!wrapper) return;
    let itemId = "item";
    if (adapter.kind === "json-item") {
      const picker = wrapper.querySelector("[data-evidence-json-item-select]");
      const items = jsonItems(adapter, root);
      const index = Number(picker?.value);
      const item = Number.isInteger(index) ? items[index] : null;
      itemId = normalizeIdentity(item?.id || item?.timestamp || item?.location || (item ? index : "item"));
    }
    const id = interpolateIdentity(adapter.collectionIdTemplate, { active: info.value, activeLabel: info.label, itemId });
    wrapper.setAttribute("data-evidence-collection-id", id);
    if (entryKind(adapter, info.value) === "individual") {
      wrapper.setAttribute("data-evidence-capture", adapter.id);
      wrapper.setAttribute("data-evidence-contribution-id", id);
    } else {
      wrapper.removeAttribute("data-evidence-capture");
      wrapper.removeAttribute("data-evidence-contribution-id");
    }
    const disabled = (adapter.disabledActiveValues || []).includes(info.value);
    if (wrapper.hidden !== disabled) wrapper.hidden = disabled;
    const button = wrapper.querySelector("[data-save-response-collection], [data-save-evidence-note]");
    if (button) {
      button.removeAttribute("data-save-response-collection");
      button.removeAttribute("data-save-evidence-note");
      button.setAttribute(entryKind(adapter, info.value) === "individual" ? "data-save-evidence-note" : "data-save-response-collection", adapter.id);
    }
  }
  function renderAdapterControls(adapter, root) {
    if (root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"]')) return;
    const wrapper = document.createElement("section");
    wrapper.className = adapter.kind === "individual-composer" || adapter.kind === "collection-composer" ? "english-evidence-composer-card" : "english-evidence-activity-actions";
    wrapper.setAttribute("data-evidence-retrofit-adapter", adapter.id);
    wrapper.setAttribute("data-evidence-collection-id", adapter.collectionIdTemplate);
    if (adapter.kind === "individual-composer" || adapter.kind === "collection-composer") {
      const draftBase = config.projectSlug + ":evidence-composer:" + adapter.id;
      const fields = adapter.composerFields || [
        { id: "detail", label: "Evidence", control: "textarea", placeholder: "Record the exact line, moment, image, action, or detail." },
        { id: "analysis", label: "Analysis", control: "textarea", placeholder: "Explain how the evidence develops meaning." },
        { id: "locator", label: "Locator or context", control: "input", placeholder: "Act, scene, page, paragraph, or other locator." },
      ];
      const fieldsHtml = fields.map((field) => {
        const attributes = ' data-evidence-composer-field="' + escapeHtml(field.id) + '" data-evidence-retrofit-draft data-response-id="' + escapeHtml(draftBase + ":" + field.id) + '" placeholder="' + escapeHtml(field.placeholder) + '"';
        const control = field.control === "input" ? '<input type="text"' + attributes + '>' : '<textarea' + attributes + '></textarea>';
        return '<label>' + escapeHtml(field.label) + control + '</label>';
      }).join("");
      const saveAttribute = adapter.kind === "collection-composer" ? "data-save-response-collection" : "data-save-evidence-note";
      wrapper.innerHTML = '<h3>' + (adapter.kind === "collection-composer" ? escapeHtml(adapter.activityTitle) : "Save a useful evidence note") + '</h3><p>Your working draft saves automatically here and enters the Evidence Bank only when you select the green button.</p><div class="english-evidence-composer-grid">' + fieldsHtml + '</div><div class="english-evidence-actions"><button type="button" ' + saveAttribute + '="' + adapter.id + '"><span class="material-symbols-outlined" aria-hidden="true">library_add</span>' + escapeHtml(adapter.saveLabel) + '</button><a class="english-evidence-secondary" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a><span class="english-evidence-status" data-evidence-save-status aria-live="polite">Draft saves automatically</span></div>';
    } else if (adapter.kind === "json-item") {
      wrapper.innerHTML = '<p>Keep the local working list here, then deliberately send one selected item to the shared Evidence Bank.</p><div class="english-evidence-json-picker"><label>Saved item<select data-evidence-json-item-select data-evidence-retrofit-draft data-response-id="' + escapeHtml(config.projectSlug + ":evidence-picker:" + adapter.id) + '"><option value="">Choose a saved item...</option></select></label><button type="button" data-save-evidence-note="' + adapter.id + '"><span class="material-symbols-outlined" aria-hidden="true">library_add</span>' + escapeHtml(adapter.saveLabel) + '</button></div><div class="english-evidence-actions"><a class="english-evidence-secondary" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a><span class="english-evidence-status" data-evidence-save-status aria-live="polite"></span></div>';
    } else {
      wrapper.innerHTML = '<p>Working responses continue to autosave in this activity. Use the green button only when this work is ready to keep in the shared Evidence Bank.</p><div class="english-evidence-actions"><button type="button" data-save-response-collection="' + adapter.id + '"><span class="material-symbols-outlined" aria-hidden="true">library_add</span>' + escapeHtml(adapter.saveLabel) + '</button><a class="english-evidence-secondary" href="#evidence-bank" data-page-target="evidence-bank">Open Evidence Bank</a><span class="english-evidence-status" data-evidence-save-status aria-live="polite"></span></div>';
    }
    root.appendChild(wrapper);
    updateAdapterUi(adapter, root);
  }
  function jsonItems(adapter, root) {
    const store = root.querySelector(adapter.storeSelector);
    const items = safeJson(store?.value || "[]", []);
    return Array.isArray(items) ? items : [];
  }
  function refreshJsonPicker(adapter, root) {
    if (adapter.kind !== "json-item") return;
    const picker = root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"] [data-evidence-json-item-select]');
    if (!picker) return;
    const selected = picker.value;
    const items = jsonItems(adapter, root);
    const optionsHtml = '<option value="">Choose a saved item...</option>' + items.map((item, index) => {
      const label = (adapter.itemTitleFields || []).map((field) => item[field]).find(Boolean) || "Saved item " + (index + 1);
      return '<option value="' + index + '">' + escapeHtml(label) + '</option>';
    }).join("");
    if (picker.innerHTML !== optionsHtml) picker.innerHTML = optionsHtml;
    if (selected && Number(selected) < items.length) picker.value = selected;
  }
  function modernStatePayload() {
    if (typeof criticalResponseState === "undefined") return null;
    return clone(criticalResponseState);
  }
  function persistModernState() {
    if (typeof criticalResponseState === "undefined") return;
    const responses = safeJson(readStorage(config.responseStorageKey, "{}"), {});
    responses["critical-response-workshop:state"] = clone(criticalResponseState);
    writeStorage(config.responseStorageKey, JSON.stringify(responses));
  }
  function restoreModernState() {
    if (typeof criticalResponseState === "undefined") return;
    const responses = safeJson(readStorage(config.responseStorageKey, "{}"), {});
    const stored = responses["critical-response-workshop:state"];
    if (stored && typeof stored === "object") Object.assign(criticalResponseState, stored);
    if (typeof renderCriticalResponseActivity === "function") renderCriticalResponseActivity();
  }
  function saveAdapter(adapter, root) {
    const info = activeInfo(adapter, root);
    const controlRoot = root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"]') || root;
    const saveStatus = (message) => setStatus(controlRoot, message);
    if ((adapter.disabledActiveValues || []).includes(info.value)) {
      saveStatus("This practice score stays local and does not enter the Evidence Bank.");
      return;
    }
    const contributionId = interpolateIdentity(adapter.collectionIdTemplate, { active: info.value, activeLabel: info.label });
    const kind = entryKind(adapter, info.value);
    let detail = "";
    let connection = "";
    let locator = "";
    let prompt = "";
    let itemId = "";
    let responseIds = [];
    if (adapter.kind === "individual-composer" || adapter.kind === "collection-composer") {
      const composerRoot = root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"]');
      const composerControls = Array.from(composerRoot?.querySelectorAll("[data-evidence-composer-field]") || []);
      responseIds = composerControls.map((field) => field.getAttribute("data-response-id")).filter(Boolean);
      if (adapter.kind === "collection-composer") {
        const completed = composerControls.map((field) => {
          const fieldId = field.getAttribute("data-evidence-composer-field") || "response";
          const definition = (adapter.composerFields || []).find((candidate) => candidate.id === fieldId);
          return { prompt: definition?.label || fieldId, answer: fieldValue(field) };
        }).filter((entry) => entry.answer);
        if (!completed.length) { saveStatus("Complete at least one part of the plan before saving."); return; }
        prompt = completed.length + " completed planning response" + (completed.length === 1 ? "" : "s");
        detail = completed.map((entry, index) => (index + 1) + ". " + entry.prompt + "\\n" + entry.answer).join("\\n\\n");
      } else {
        detail = composerRoot?.querySelector('[data-evidence-composer-field="detail"]')?.value?.trim() || "";
        connection = composerRoot?.querySelector('[data-evidence-composer-field="analysis"]')?.value?.trim() || "";
        locator = composerRoot?.querySelector('[data-evidence-composer-field="locator"]')?.value?.trim() || "";
        if (!detail && !connection) { saveStatus("Add evidence or analysis before saving."); return; }
      }
    } else if (adapter.kind === "json-item") {
      const picker = root.querySelector('[data-evidence-retrofit-adapter="' + adapter.id + '"] [data-evidence-json-item-select]');
      const items = jsonItems(adapter, root);
      const index = Number(picker?.value);
      const item = Number.isInteger(index) ? items[index] : null;
      if (!item) { saveStatus("Choose a saved item first."); return; }
      itemId = normalizeIdentity(item.id || item.timestamp || item.location || index);
      detail = Object.entries(item).filter(([, value]) => value != null && value !== "").map(([key, value]) => key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase()) + ": " + (typeof value === "object" ? JSON.stringify(value) : value)).join("\\n");
    } else if (adapter.kind === "modern-state") {
      persistModernState();
      const state = modernStatePayload();
      if (info.value === "textKnowledge") {
        const group = typeof getActiveCriticalQuestionGroup === "function" ? getActiveCriticalQuestionGroup() : null;
        detail = "Question group: " + (group?.title || state?.questionGroupId || "Text Knowledge") + "\\nScore: " + (state?.score || 0) + "\\nProgress step: " + (state?.stepIndex || 0);
      } else if (info.value === "thesisControl") {
        detail = state?.thesisText || (typeof generateThesisText === "function" ? generateThesisText() : "");
      } else if (info.value === "evidenceCollector") {
        detail = state?.evidenceText || (typeof generateEvidenceText === "function" ? generateEvidenceText() : "");
      } else if (info.value === "paragraphArchitect") {
        detail = typeof generateParagraphText === "function" ? generateParagraphText() : "";
      }
      connection = JSON.stringify(state, null, 2);
      responseIds = ["critical-response-workshop:state"];
      if (!detail && !connection) { saveStatus("Complete part of this activity before saving."); return; }
    } else {
      const fields = collectFields(adapter, root, info.value);
      if (!fields.length) { saveStatus("Complete at least one response before saving."); return; }
      prompt = fields.length + " completed response" + (fields.length === 1 ? "" : "s");
      detail = fields.map((entry, index) => (index + 1) + ". " + entry.prompt + "\\n" + entry.answer).join("\\n\\n");
      responseIds = fields.map((entry) => entry.responseId).filter(Boolean);
    }
    const finalId = interpolateIdentity(adapter.collectionIdTemplate, { active: info.value, activeLabel: info.label, itemId });
    const workTitle = interpolateDisplay(adapter.workTitle, { active: info.value, activeLabel: info.label, itemId });
    window.nextStepEvidenceBank.upsert({
      contributionId: finalId || contributionId,
      responseId: kind === "collection" ? (finalId || contributionId) : undefined,
      entryKind: kind,
      projectSlug: config.projectSlug,
      source: { kind: kind === "collection" ? "question-set" : "activity", id: adapter.id, title: adapter.activityTitle },
      activity: { id: adapter.id, title: adapter.activityTitle, profile: config.profile },
      work: { id: workTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), title: workTitle, kind: config.profile === "film-study" ? "film" : "text" },
      locator: locator ? { label: locator } : undefined,
      prompt,
      answer: kind === "collection" ? detail : undefined,
      evidence: kind === "individual" ? detail : undefined,
      analysis: connection,
      responseIds,
      tags: adapter.tags || [],
      metadata: { retrofitVersion: "${ELA30_EVIDENCE_RETROFIT_VERSION}", adapterId: adapter.id, activeValue: info.value },
    });
    saveStatus("Saved to Evidence Bank");
  }
  function saveManualComposer() {
    const root = document.querySelector("[data-evidence-notebook-panel]");
    const source = root?.querySelector('[data-evidence-draft="source"]')?.value?.trim() || "";
    const concept = root?.querySelector('[data-evidence-draft="concept"]')?.value?.trim() || "";
    const detail = root?.querySelector('[data-evidence-draft="detail"]')?.value?.trim() || "";
    const connection = root?.querySelector('[data-evidence-draft="connection"]')?.value?.trim() || "";
    if (!detail && !connection) { setStatus(root, "Add evidence or analysis before saving."); return; }
    window.nextStepEvidenceBank.upsert({
      contributionId: "manual:" + Date.now(),
      entryKind: "individual",
      projectSlug: config.projectSlug,
      source: { kind: "activity", id: "manual-evidence-note", title: "Evidence Bank quick entry" },
      activity: { id: "manual-evidence-note", title: concept || "Manual Evidence Note", profile: config.profile },
      work: source ? { id: source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), title: source, kind: config.profile === "film-study" ? "film" : "text" } : undefined,
      evidence: detail,
      analysis: connection,
      tags: ["manual-note"],
      metadata: { retrofitVersion: "${ELA30_EVIDENCE_RETROFIT_VERSION}" },
    });
    root.querySelectorAll("[data-evidence-draft]").forEach((field) => { field.value = ""; persistRetrofitField(field); });
    setStatus(root, "Saved to Evidence Bank");
  }
  function installAdapters() {
    config.adapters.forEach((adapter) => {
      const root = document.querySelector(adapter.rootSelector);
      if (!root) throw new Error("Evidence retrofit adapter root missing: " + adapter.id + " (" + adapter.rootSelector + ")");
      renderAdapterControls(adapter, root);
      if (adapter.kind === "json-item") refreshJsonPicker(adapter, root);
    });
  }
  document.addEventListener("click", (event) => {
    const remove = event.target.closest("[data-remove-evidence-note]");
    if (remove) { event.preventDefault(); removeEvidenceEntry(remove.getAttribute("data-remove-evidence-note")); return; }
    const save = event.target.closest("[data-save-response-collection], [data-save-evidence-note]");
    if (!save) return;
    if (save.matches("[data-save-evidence-note]") && save.closest("[data-evidence-notebook-panel]")) {
      event.preventDefault();
      saveManualComposer();
      return;
    }
    const adapterId = save.getAttribute("data-save-response-collection") || save.getAttribute("data-save-evidence-note");
    const adapter = adapterById[adapterId];
    if (!adapter) return;
    event.preventDefault();
    const root = document.querySelector(adapter.rootSelector);
    if (root) saveAdapter(adapter, root);
  });
  document.addEventListener("change", (event) => {
    if (event.target.closest("[data-evidence-bank-filter]")) renderManualEvidenceBank();
    if (event.target.matches?.("[data-evidence-draft][data-response-id], [data-evidence-retrofit-draft][data-response-id]")) persistRetrofitField(event.target);
    config.adapters.forEach((adapter) => {
      const root = document.querySelector(adapter.rootSelector);
      if (root && adapter.kind === "json-item" && event.target.closest('[data-evidence-retrofit-adapter="' + adapter.id + '"] [data-evidence-json-item-select]')) {
        updateAdapterUi(adapter, root);
      }
      if (!root || !adapter.activeSelector || !event.target.closest(adapter.activeSelector)) return;
      window.setTimeout(() => updateAdapterUi(adapter, root), 0);
    });
  });
  document.addEventListener("input", (event) => {
    if (event.target.matches?.("[data-evidence-draft][data-response-id], [data-evidence-retrofit-draft][data-response-id]")) persistRetrofitField(event.target);
  });
  function afterActivityMutation() {
    config.adapters.forEach((adapter) => {
      const root = document.querySelector(adapter.rootSelector);
      if (!root) return;
      updateAdapterUi(adapter, root);
      if (adapter.kind === "json-item") refreshJsonPicker(adapter, root);
    });
    if (config.adapters.some((adapter) => adapter.kind === "modern-state")) persistModernState();
  }
  function init() {
    restoreModernState();
    installAdapters();
    restoreRetrofitFields();
    renderManualEvidenceBank();
    const watchedRoots = config.adapters.map((adapter) => document.querySelector(adapter.rootSelector)).filter(Boolean);
    const observer = new MutationObserver(() => window.setTimeout(afterActivityMutation, 0));
    watchedRoots.forEach((root) => observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "data-active-character-dossier"] }));
    window.setTimeout(afterActivityMutation, 0);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true }); else init();
})();
</script>`;
}

function patchPageIds(html: string): string {
  if (/const pageIds = \[[^\]]*"evidence-bank"/.test(html)) return html;
  const result = html.replace(/(const pageIds = \[[^\]]*)("resources"\];)/, '$1"evidence-bank",$2');
  if (result === html) throw new Error("ELA 30-1 Evidence Bank retrofit could not add evidence-bank to the hardcoded pageIds array.");
  return result;
}

function patchStaticPages(html: string): string {
  if (/const staticPages = \[[^\]]*"evidence-bank"/.test(html)) return html;
  const pattern = /const staticPages = \[([^\]]*)\];/;
  const match = html.match(pattern);
  if (!match) throw new Error("ELA 30-1 Evidence Bank retrofit could not find the legacy staticPages declaration.");
  const pageIds = Array.from(match[1]!.matchAll(/"([^"]+)"/g)).map((entry) => entry[1]!);
  const resourcesIndex = pageIds.indexOf("resources");
  pageIds.splice(resourcesIndex >= 0 ? resourcesIndex : pageIds.length, 0, "evidence-bank");
  return html.replace(match[0], `const staticPages = [${pageIds.map((id) => `"${id}"`).join(",")}];`);
}

function patchOthelloNonLessonFilter(html: string): string {
  const candidates = Array.from(html.matchAll(/\[[^\]]+\]\.includes\(section\.id\)/g));
  const match = candidates.find((candidate) => candidate[0].includes('"side-by-side"') && candidate[0].includes('"story-questions"'));
  if (!match) throw new Error("ELA 30-1 Evidence Bank retrofit could not find Othello's non-lesson route filter.");
  const pageIds = Array.from(match[0].matchAll(/"([^"]+)"/g)).map((entry) => entry[1]!);
  if (pageIds.includes("evidence-bank")) return html;
  const resourcesIndex = pageIds.indexOf("resources");
  pageIds.splice(resourcesIndex >= 0 ? resourcesIndex : pageIds.length, 0, "evidence-bank");
  return html.replace(match[0], `[${pageIds.map((id) => `"${id}"`).join(", ")}].includes(section.id)`);
}

function injectNav(html: string): string {
  const resourceLinkPattern = /<a\b(?=[^>]*href="#resources")(?=[^>]*data-page-target="resources")[^>]*>[\s\S]*?<\/a>/;
  const match = html.match(resourceLinkPattern);
  if (!match) throw new Error("ELA 30-1 Evidence Bank retrofit could not find the Resources navigation link.");
  const nav = markerBlock(MARKERS.nav, renderNavLink(match[0]));
  return html.replace(match[0], `${nav}\n${match[0]}`);
}

function injectRoute(html: string, project: EvidenceProjectDefinition): string {
  const resourceSectionPattern = /<section\s+id="resources"(?=[\s>])/;
  const match = html.match(resourceSectionPattern);
  if (!match || match.index == null) throw new Error("ELA 30-1 Evidence Bank retrofit could not find the Resources route.");
  const route = markerBlock(MARKERS.route, renderEvidenceRoute(project));
  return `${html.slice(0, match.index)}${route}\n${html.slice(match.index)}`;
}

export function verifyEnglishEvidenceRetrofitHtml(input: ApplyEnglishEvidenceRetrofitInput): EnglishEvidenceRetrofitVerification {
  const project = getProjectDefinition(input.projectSlug);
  const failures: string[] = [];
  const expected = [
    ...Object.values(MARKERS).flat(),
    'id="evidence-bank"',
    'data-page="evidence-bank"',
    'data-page-target="evidence-bank"',
    "data-english-evidence-bank-route",
    "data-manual-evidence-list",
    "data-evidence-collection-id",
    "data-evidence-capture",
    "data-evidence-contribution-id",
    "data-save-response-collection",
    "data-save-evidence-note",
    `${project.storageBase}:manual-evidence-notes`,
    "window.nextStepEvidenceBank",
  ];
  expected.forEach((needle) => {
    const count = input.html.split(needle).length - 1;
    if (count < 1) failures.push(`Missing required retrofit output: ${needle}`);
  });
  Object.values(MARKERS).flat().forEach((marker) => {
    const count = input.html.split(marker).length - 1;
    if (count !== 1) failures.push(`Expected one marker ${marker}; found ${count}.`);
  });
  project.adapters.forEach((adapter) => {
    if (!input.html.includes(`\\"id\\":\\"${adapter.id}\\"`) && !input.html.includes(`"id":"${adapter.id}"`)) {
      failures.push(`Missing adapter configuration: ${adapter.id}`);
    }
  });
  if (project.pageIdArray && !/const pageIds = \[[^\]]*"evidence-bank"/.test(input.html)) failures.push("Hardcoded pageIds does not include evidence-bank.");
  if (project.staticPagesArray && !/const staticPages = \[[^\]]*"evidence-bank"/.test(input.html)) failures.push("Legacy staticPages does not include evidence-bank.");
  if (project.othelloNonLessonFilter) {
    const filter = Array.from(input.html.matchAll(/\[[^\]]+\]\.includes\(section\.id\)/g))
      .find((candidate) => candidate[0].includes('"side-by-side"') && candidate[0].includes('"story-questions"'))?.[0];
    if (!filter?.includes('"evidence-bank"')) failures.push("Othello non-lesson route filter does not include evidence-bank.");
  }
  return { ok: failures.length === 0, failures, actionIds: project.adapters.map((adapter) => adapter.id) };
}

export function applyEnglishEvidenceRetrofitToHtml(input: ApplyEnglishEvidenceRetrofitInput): AppliedEnglishEvidenceRetrofit {
  const project = getProjectDefinition(input.projectSlug);
  if (!input.html.trim()) throw new Error(`Cannot retrofit an empty workspace for ${project.projectSlug}.`);
  let baseHtml = stripRetrofitBlocks(input.html);
  (project.renameLocalBanks || []).forEach((rename) => {
    if (baseHtml.includes(rename.from)) baseHtml = baseHtml.replace(rename.from, rename.to);
  });
  if (project.pageIdArray) baseHtml = patchPageIds(baseHtml);
  if (project.staticPagesArray) baseHtml = patchStaticPages(baseHtml);
  if (project.othelloNonLessonFilter) baseHtml = patchOthelloNonLessonFilter(baseHtml);
  const $ = load(baseHtml);
  const selectorChecks = [
    ...project.requiredSnippets.map((selector) => {
      const count = baseHtml.split(selector).length - 1;
      return { selector, found: count > 0, count };
    }),
    ...project.adapters.map((adapter) => {
      const count = $(adapter.rootSelector).length;
      return { selector: adapter.rootSelector, adapterId: adapter.id, found: count > 0, count };
    }),
  ];
  const missing = selectorChecks.filter((check) => !check.found);
  if (missing.length) {
    throw new Error(`ELA 30-1 Evidence Bank retrofit refused ${project.projectSlug}; required selectors are missing: ${missing.map((check) => check.selector).join(", ")}`);
  }
  ["</head>", "</body>"].forEach((needle) => assertExactlyOne(baseHtml, needle, needle));
  let html = baseHtml;
  html = injectNav(html);
  html = injectRoute(html, project);
  html = html.replace("</head>", `${markerBlock(MARKERS.styles, renderStyles())}\n</head>`);
  html = html.replace("</body>", `${markerBlock(MARKERS.runtime, renderRuntime(project))}\n</body>`);
  const verification = verifyEnglishEvidenceRetrofitHtml({ projectSlug: project.projectSlug, html });
  if (!verification.ok) throw new Error(`ELA 30-1 Evidence Bank retrofit produced an incomplete workspace for ${project.projectSlug}: ${verification.failures.join(" ")}`);
  return {
    html,
    changed: html !== input.html,
    baseHash: sha256(baseHtml),
    outputHash: sha256(html),
    project,
    selectorChecks,
    actionIds: verification.actionIds,
  };
}

export function getEla30EvidenceProjectDefinition(projectSlug: string): Readonly<EvidenceProjectDefinition> {
  return getProjectDefinition(projectSlug);
}

function stableId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "evidence";
}

function contractAdapter(project: EvidenceProjectDefinition, adapter: EvidenceAdapter): EnglishEvidenceBankRetrofitAdapterV1 {
  const manifestKind: EnglishEvidenceBankRetrofitAdapterV1["kind"] =
    adapter.kind === "individual-composer" || adapter.kind === "json-item"
      ? "individual"
      : "collection";
  const fieldSelectors = manifestKind === "individual"
    ? {
        evidence: adapter.kind === "json-item"
          ? adapter.storeSelector || adapter.rootSelector
          : `[data-evidence-retrofit-adapter="${adapter.id}"] [data-evidence-composer-field="detail"], ${adapter.fieldSelector || adapter.rootSelector}`,
        analysis: `[data-evidence-retrofit-adapter="${adapter.id}"] [data-evidence-composer-field="analysis"]`,
      }
    : undefined;
  return {
    id: adapter.id,
    kind: manifestKind,
    route: adapter.route,
    rootSelector: adapter.rootSelector,
    saveSelector: manifestKind === "individual"
      ? `[data-save-evidence-note="${adapter.id}"]`
      : `[data-save-response-collection="${adapter.id}"]`,
    contributionId: adapter.collectionIdTemplate,
    source: {
      kind: manifestKind === "collection" ? "question-set" : "activity",
      id: adapter.id,
      title: adapter.activityTitle,
    },
    activity: {
      id: adapter.id,
      title: adapter.activityTitle,
      profile: project.profile,
    },
    work: {
      id: stableId(adapter.workTitle),
      title: adapter.workTitle,
      kind: project.profile === "film-study" ? "film" : "text",
    },
    ...(fieldSelectors ? { fieldSelectors } : {}),
    ...(manifestKind === "collection" ? { responseSelector: adapter.fieldSelector || adapter.rootSelector } : {}),
    ...(adapter.promptSelector ? { questionSelector: adapter.promptSelector } : {}),
    ...(
      adapter.kind === "adaptive"
      || adapter.kind === "modern-state"
      || (adapter.individualActiveValues || []).length > 0
      || (adapter.disabledActiveValues || []).length > 0
        ? {
            evidencePolicy: {
              defaultKind: manifestKind,
              ...((adapter.individualActiveValues || []).length > 0
                ? { individualActiveValues: adapter.individualActiveValues }
                : {}),
              ...((adapter.disabledActiveValues || []).length > 0
                ? { disabledActiveValues: adapter.disabledActiveValues }
                : {}),
            },
          }
        : {}
    ),
    tags: adapter.tags || [],
    saveLabel: adapter.saveLabel,
    savedMessage: "Saved to Evidence Bank",
    updatedMessage: "Updated in Evidence Bank",
  };
}

export function createEnglishEvidenceRetrofitReport(
  applied: AppliedEnglishEvidenceRetrofit,
  appliedAt: string,
): EnglishEvidenceBankRetrofitV1 {
  const project = applied.project;
  const links = project.adapters
    .filter((adapter, index, all) => all.findIndex((candidate) => candidate.route === adapter.route) === index)
    .slice(0, 4)
    .map((adapter) => ({ id: adapter.route, label: adapter.activityTitle, icon: "arrow_outward" }));
  return {
    schemaVersion: 1,
    retrofitVersion: ELA30_EVIDENCE_RETROFIT_VERSION,
    projectSlug: project.projectSlug,
    courseCode: project.courseCode,
    courseTitle: project.courseTitle,
    profile: project.profile,
    storageKey: `${project.storageBase}:manual-evidence-notes`,
    route: { id: "evidence-bank", label: "Evidence Bank", icon: "collections_bookmark", links },
    selectorsRequired: [...new Set([...project.requiredSnippets, ...project.adapters.map((adapter) => adapter.rootSelector)])],
    adapters: project.adapters.map((adapter) => contractAdapter(project, adapter)),
    sourceSha256: applied.baseHash,
    outputSha256: applied.outputHash,
    appliedAt,
    selectorChecks: applied.selectorChecks.map((check) => ({
      selector: check.selector,
      ...(check.adapterId ? { adapterId: check.adapterId } : {}),
      count: check.count,
      status: check.found ? "placed" : "failed",
      ...(!check.found ? { message: "Required selector was not found; retrofit refused to write." } : {}),
    })),
  };
}
