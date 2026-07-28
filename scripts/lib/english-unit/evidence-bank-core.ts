import type {
  EnglishActivityProfileKind,
  EnglishEvidenceEntryV2,
  EnglishEvidenceSourceV2,
  EnglishEvidenceWorkV2,
  EnglishEvidenceBankRouteLinkV1
} from "./types.js";

type EvidenceRecord = Record<string, unknown>;

export type EnglishEvidenceNormalizationOptions = {
  projectSlug?: string;
  profile?: EnglishActivityProfileKind;
  now?: string;
};

export type EnglishEvidenceBankRouteRenderOptions = {
  projectSlug: string;
  courseCode: string;
  profile: EnglishActivityProfileKind;
  links?: EnglishEvidenceBankRouteLinkV1[];
  title?: string;
  description?: string;
};

const SOURCE_KINDS = new Set<EnglishEvidenceSourceV2["kind"]>([
  "lesson",
  "reading",
  "question-set",
  "writing-studio",
  "activity",
  "media"
]);

const WORK_KINDS = new Set<EnglishEvidenceWorkV2["kind"]>(["text", "film", "visual", "paired-text"]);

const PROFILE_KINDS = new Set<EnglishActivityProfileKind>([
  "short-fiction",
  "modern-drama",
  "shakespeare-drama",
  "novel-study",
  "film-study"
]);

function record(value: unknown): EvidenceRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as EvidenceRecord) : undefined;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = text(value);
    if (normalized) return normalized;
  }
  return "";
}

function safeId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "evidence";
}

function validDate(value: unknown, fallback: string): string {
  const normalized = text(value);
  return normalized && !Number.isNaN(Date.parse(normalized)) ? normalized : fallback;
}

function normalizeSource(input: EvidenceRecord, entryKind: EnglishEvidenceEntryV2["entryKind"]): EnglishEvidenceSourceV2 {
  const source = record(input.source);
  if (source) {
    const kind = text(source.kind) as EnglishEvidenceSourceV2["kind"];
    const title = firstText(source.title, source.id, input.sourceTitle);
    return {
      kind: SOURCE_KINDS.has(kind) ? kind : entryKind === "collection" ? "question-set" : "activity",
      id: firstText(source.id, title, "evidence-source"),
      ...(title ? { title } : {})
    };
  }

  const title = firstText(input.source, input.sourceTitle, input.text, input.film, input.workTitle, "Evidence source");
  return {
    kind: entryKind === "collection" ? "question-set" : "activity",
    id: firstText(input.sourceId, safeId(title)),
    title
  };
}

function normalizeActivity(
  input: EvidenceRecord,
  profileFallback: EnglishActivityProfileKind
): EnglishEvidenceEntryV2["activity"] {
  const activity = record(input.activity);
  const profile = firstText(activity?.profile, input.profile, profileFallback) as EnglishActivityProfileKind;
  if (activity) {
    const title = firstText(activity.title, activity.id, input.concept, "Evidence activity");
    return {
      id: firstText(activity.id, safeId(title)),
      profile: PROFILE_KINDS.has(profile) ? profile : profileFallback,
      ...(title ? { title } : {})
    };
  }

  const title = firstText(input.activity, input.activityTitle, input.concept, input.title, "Evidence activity");
  return {
    id: firstText(input.activityId, safeId(title)),
    profile: PROFILE_KINDS.has(profile) ? profile : profileFallback,
    title
  };
}

function normalizeWork(input: EvidenceRecord): EnglishEvidenceWorkV2 | undefined {
  const work = record(input.work);
  if (work) {
    const title = firstText(work.title, work.id);
    if (!title) return undefined;
    const kind = text(work.kind) as EnglishEvidenceWorkV2["kind"];
    return {
      id: firstText(work.id, safeId(title)),
      title,
      kind: WORK_KINDS.has(kind) ? kind : "text"
    };
  }

  const title = firstText(input.workTitle, input.text, input.film);
  if (!title) return undefined;
  return {
    id: firstText(input.workId, safeId(title)),
    title,
    kind: text(input.film) ? "film" : "text"
  };
}

function normalizeLocator(input: EvidenceRecord): EnglishEvidenceEntryV2["locator"] {
  const locator = record(input.locator);
  if (locator) {
    const normalized = {
      label: firstText(locator.label),
      act: firstText(locator.act),
      scene: firstText(locator.scene),
      chapter: firstText(locator.chapter),
      timestamp: firstText(locator.timestamp)
    };
    const present = Object.fromEntries(Object.entries(normalized).filter(([, value]) => value));
    return Object.keys(present).length ? present : undefined;
  }
  const label = firstText(input.locator);
  return label ? { label } : undefined;
}

/**
 * Converts both the original 20-1/10-1 display-note shape and structured V2
 * entries into the strict V2 contract used by reports and retrofit validation.
 * It does not mutate the stored learner record.
 */
export function normalizeEnglishEvidenceEntryV2(
  value: unknown,
  options: EnglishEvidenceNormalizationOptions = {}
): EnglishEvidenceEntryV2 {
  const input = record(value);
  if (!input) throw new TypeError("Evidence Bank entries must be objects.");

  const contributionId = firstText(input.contributionId, input.responseId, input.id);
  if (!contributionId) throw new TypeError("Evidence Bank entries require a contributionId or responseId.");

  const now = validDate(options.now, new Date().toISOString());
  const entryKind: EnglishEvidenceEntryV2["entryKind"] =
    input.entryKind === "collection" || (!input.entryKind && text(input.responseId)) ? "collection" : "individual";
  const profileFallback = options.profile ?? "short-fiction";
  const explicitEvidence = firstText(input.evidence);
  const legacyDetail = firstText(input.detail);
  const answer = firstText(input.answer, entryKind === "collection" ? legacyDetail : undefined);
  const evidence = firstText(explicitEvidence, entryKind === "individual" ? legacyDetail : undefined);
  const analysis = firstText(input.analysis, input.connection, input.counterpoint);
  const responseIds = Array.isArray(input.responseIds)
    ? input.responseIds.map(text).filter(Boolean)
    : [];
  if (!answer && !evidence && !analysis && responseIds.length === 0) {
    throw new TypeError("Evidence Bank entries require saved content or at least one response id.");
  }
  const tags = Array.isArray(input.tags) ? input.tags.map(text).filter(Boolean) : [];
  const projectSlug = firstText(input.projectSlug, options.projectSlug, "english-unit");
  const work = normalizeWork(input);
  const locator = normalizeLocator(input);
  const prompt = firstText(input.prompt);
  const metadata = record(input.metadata);

  return {
    schemaVersion: 2,
    contributionId,
    projectSlug,
    entryKind,
    source: normalizeSource(input, entryKind),
    activity: normalizeActivity(input, profileFallback),
    ...(work ? { work } : {}),
    ...(locator ? { locator } : {}),
    ...(prompt ? { prompt } : {}),
    ...(answer ? { answer } : {}),
    ...(evidence ? { evidence } : {}),
    ...(analysis ? { analysis } : {}),
    ...(responseIds.length ? { responseIds } : {}),
    tags,
    createdAt: validDate(input.createdAt, now),
    updatedAt: validDate(input.updatedAt, now),
    ...(metadata ? { metadata: { ...metadata } } : {})
  };
}

export function normalizeEnglishPersistedEvidenceEntries(
  value: unknown,
  options: EnglishEvidenceNormalizationOptions = {}
): EnglishEvidenceEntryV2[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    try {
      return [normalizeEnglishEvidenceEntryV2(entry, options)];
    } catch {
      return [];
    }
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderEnglishEvidenceBankRoute(options: EnglishEvidenceBankRouteRenderOptions): string {
  const title = options.title ?? "Evidence Bank";
  const description = options.description ??
    "Save only the evidence, activity collections, and writing plans you deliberately choose. Working drafts remain in their original activity.";
  const draftBase = `${safeId(options.projectSlug)}:evidence-bank:quick-entry`;
  const darkHeaderClass = options.profile === "novel-study"
    ? " english-dark-worksheet-header novel-dark-worksheet-header"
    : " english-dark-worksheet-header";
  const links = (options.links ?? [])
    .slice(0, 4)
    .map((link) => `<a href="#${escapeHtml(link.id)}" data-page-target="${escapeHtml(link.id)}"><span class="material-symbols-outlined" aria-hidden="true">${escapeHtml(link.icon)}</span>${escapeHtml(link.label)}</a>`)
    .join("");

  return `<section id="evidence-bank" class="course-page" data-page="evidence-bank" hidden>
    <p class="route-kicker">${escapeHtml(options.courseCode)} | Evidence Bank</p>
    <h2 class="route-title">${escapeHtml(title)}</h2>
    <p class="route-description">${escapeHtml(description)}</p>
    <div class="english-evidence-bank-actions">${links}</div>
    <section class="english-evidence-bank-list" aria-labelledby="saved-evidence-title">
      <div class="english-evidence-bank-heading${darkHeaderClass}">
        <div><p>Shared unit notebook</p><h3 id="saved-evidence-title">Saved evidence</h3></div>
        <button type="button" data-print-writing><span class="material-symbols-outlined" aria-hidden="true">print</span> Print / PDF</button>
      </div>
      <div class="english-evidence-filter-grid" data-evidence-bank-filters>
        <label>Activity<select data-evidence-bank-filter="activity"><option value="">All activities</option></select></label>
        <label>Text or film<select data-evidence-bank-filter="work"><option value="">All texts and films</option></select></label>
        <label>Act, chapter, or timestamp<select data-evidence-bank-filter="locator"><option value="">All locations</option></select></label>
        <label>Evidence type<select data-evidence-bank-filter="type"><option value="">All evidence types</option></select></label>
      </div>
      <div class="english-evidence-card-list" data-manual-evidence-list></div>
    </section>
    <section class="english-evidence-capture english-evidence-bank-capture" data-writing-activity-panel data-evidence-notebook-panel>
      <div class="english-evidence-capture-heading${darkHeaderClass}"><div><p>Quick entry</p><h3>Add evidence directly</h3><span>Use this only for a useful detail that is not already captured by a guided activity.</span></div><span class="material-symbols-outlined" aria-hidden="true">note_add</span></div>
      <div class="english-evidence-fields">
        <label>Source text, film, or lesson<input type="text" data-response-id="${escapeHtml(`${draftBase}:source`)}" data-evidence-draft="source" placeholder="Name the source and useful location."></label>
        <label>Literary or film concept<input type="text" data-response-id="${escapeHtml(`${draftBase}:concept`)}" data-evidence-draft="concept" placeholder="Example: conflict, motif, framing, or point of view."></label>
      </div>
      <label>Exact evidence<textarea rows="4" data-response-id="${escapeHtml(`${draftBase}:detail`)}" data-evidence-draft="detail" placeholder="Record the quotation, stage action, image, scene detail, or film moment."></textarea></label>
      <label>Analytical value<textarea rows="4" data-response-id="${escapeHtml(`${draftBase}:connection`)}" data-evidence-draft="connection" placeholder="Explain what the evidence suggests and how it could support an interpretation."></textarea></label>
      <div class="english-evidence-actions"><button class="evidence-bank-save-action" type="button" data-save-evidence-note><span class="material-symbols-outlined" aria-hidden="true">library_add</span> Save to Evidence Bank</button><span data-save-status aria-live="polite">Draft saves automatically</span></div>
    </section>
  </section>`;
}

export const ENGLISH_EVIDENCE_BANK_CSS = `
.english-evidence-bank-actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
.english-evidence-bank-actions a { display: inline-flex; align-items: center; gap: 7px; min-height: 40px; border: 1px solid #7d9272; border-radius: 6px; color: #24491f; padding: 8px 12px; font-weight: 700; text-decoration: none; }
.english-evidence-bank-list, .english-evidence-capture { margin-top: 20px; border: 1px solid #d9dadb; border-radius: 8px; background: #fff; padding: 22px; }
.english-evidence-bank-heading, .english-evidence-capture-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #e3e6e1; }
.english-evidence-bank-heading p, .english-evidence-capture-heading p { margin: 0 0 5px; color: #154212; font: 700 12px/1.3 "IBM Plex Sans", sans-serif; text-transform: uppercase; }
.english-evidence-bank-heading h3, .english-evidence-capture-heading h3 { margin: 0; }
#evidence-bank .english-dark-worksheet-header { border-bottom: 0; background: #161a17; color: #fff; }
#evidence-bank .english-dark-worksheet-header h3 { color: #fff; }
#evidence-bank .english-dark-worksheet-header p { color: #b9c3b2; }
#evidence-bank .english-dark-worksheet-header span:not(.material-symbols-outlined) { color: #d7ddd4; }
#evidence-bank .english-evidence-bank-heading.english-dark-worksheet-header { margin: -22px -22px 18px; border-radius: 7px 7px 0 0; padding: 24px 28px; }
#evidence-bank .english-evidence-capture-heading.english-dark-worksheet-header { margin: -22px -22px 0; border-radius: 7px 7px 0 0; padding: 24px 28px; }
#evidence-bank .english-dark-worksheet-header > .material-symbols-outlined { border-radius: 6px; background: #293029; padding: 8px; color: #9fcf93; }
.english-evidence-filter-grid, .english-evidence-fields { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 18px 0; }
.english-evidence-filter-grid label, .english-evidence-capture label { display: grid; gap: 6px; font-weight: 700; }
.english-evidence-filter-grid select, .english-evidence-capture input, .english-evidence-capture textarea { width: 100%; box-sizing: border-box; border: 1px solid #aeb8a7; border-radius: 6px; padding: 10px 12px; font: inherit; }
.english-evidence-card-list { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 12px; }
.english-evidence-card-list .social-lesson-evidence-card { border: 1px solid #d9dadb; border-radius: 8px; background: #fbfcfa; padding: 16px; }
.english-evidence-card-list .social-evidence-card-detail p { white-space: pre-wrap; }
.english-evidence-capture { display: grid; gap: 16px; }
.english-evidence-actions { display: flex; align-items: center; gap: 10px; }
.evidence-bank-save-action { border: 1px solid #154212 !important; border-radius: 6px; background: #154212 !important; color: #fff !important; padding: 9px 13px; font-weight: 700; }
@media(max-width:760px){.english-evidence-filter-grid,.english-evidence-fields{grid-template-columns:1fr}.english-evidence-bank-heading,.english-evidence-capture-heading{display:grid}}
@media print{
  .english-evidence-filter-grid,.english-evidence-bank-actions,.english-evidence-actions{display:none!important}
  body.english-evidence-printing .course-page:not(#evidence-bank),
  body.english-evidence-printing .course-sidebar,
  body.english-evidence-printing .course-topbar{display:none!important}
  body.english-evidence-printing #evidence-bank{display:block!important}
}
`;

/**
 * Browser API runtime. Host shells provide the storage and route-render hooks;
 * this keeps the API identical across factory-built and retrofitted units.
 */
export const ENGLISH_EVIDENCE_BANK_RUNTIME = String.raw`
function cloneEvidenceValue(value){
  return typeof value === "undefined" ? undefined : JSON.parse(JSON.stringify(value));
}
function normalizeEvidenceIdentity(value){
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}
function evidenceRecord(value){
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}
function evidenceText(value){
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}
function evidenceFirstText(){
  for (const value of arguments) {
    const normalized = evidenceText(value);
    if (normalized) return normalized;
  }
  return "";
}
function evidenceSafeId(value){
  return evidenceText(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "evidence";
}
function evidenceValidDate(value, fallbackValue){
  const normalized = evidenceText(value);
  return normalized && !Number.isNaN(Date.parse(normalized)) ? normalized : fallbackValue;
}
const evidenceSourceKinds = ["lesson", "reading", "question-set", "writing-studio", "activity", "media"];
const evidenceProfileKinds = ["short-fiction", "modern-drama", "shakespeare-drama", "novel-study", "film-study"];
const evidenceWorkKinds = ["text", "film", "visual", "paired-text"];
function getEvidenceIdentities(entry){
  return [entry?.contributionId, entry?.responseId, entry?.id, entry?.metadata?.responseId]
    .map(normalizeEvidenceIdentity)
    .filter((value, index, values) => value && values.indexOf(value) === index);
}
function evidenceEntriesShareIdentity(entry, identities){
  const entryIdentities = getEvidenceIdentities(entry);
  return entryIdentities.some((identity) => identities.includes(identity));
}
function normalizeEvidenceSource(input, entryKind){
  const source = evidenceRecord(input.source);
  if (source) {
    const title = evidenceFirstText(source.title, source.id, input.sourceTitle);
    const kind = evidenceText(source.kind);
    return {
      kind: evidenceSourceKinds.includes(kind) ? kind : entryKind === "collection" ? "question-set" : "activity",
      id: evidenceFirstText(source.id, title, "evidence-source"),
      ...(title ? { title } : {})
    };
  }
  const title = evidenceFirstText(input.source, input.sourceTitle, input.text, input.film, input.workTitle, "Evidence source");
  return {
    kind: entryKind === "collection" ? "question-set" : "activity",
    id: evidenceFirstText(input.sourceId, evidenceSafeId(title)),
    title
  };
}
function normalizeEvidenceActivity(input, profileFallback){
  const activity = evidenceRecord(input.activity);
  const profile = evidenceFirstText(activity?.profile, input.profile, profileFallback);
  if (activity) {
    const title = evidenceFirstText(activity.title, activity.id, input.concept, "Evidence activity");
    return {
      id: evidenceFirstText(activity.id, evidenceSafeId(title)),
      profile: evidenceProfileKinds.includes(profile) ? profile : profileFallback,
      ...(title ? { title } : {})
    };
  }
  const title = evidenceFirstText(input.activity, input.activityTitle, input.concept, input.title, "Evidence activity");
  return {
    id: evidenceFirstText(input.activityId, evidenceSafeId(title)),
    profile: evidenceProfileKinds.includes(profile) ? profile : profileFallback,
    title
  };
}
function normalizeEvidenceWork(input){
  const work = evidenceRecord(input.work);
  if (work) {
    const title = evidenceFirstText(work.title, work.id);
    if (!title) return undefined;
    const kind = evidenceText(work.kind);
    return {
      id: evidenceFirstText(work.id, evidenceSafeId(title)),
      title,
      kind: evidenceWorkKinds.includes(kind) ? kind : "text"
    };
  }
  const title = evidenceFirstText(input.workTitle, input.text, input.film);
  if (!title) return undefined;
  return {
    id: evidenceFirstText(input.workId, evidenceSafeId(title)),
    title,
    kind: evidenceText(input.film) ? "film" : "text"
  };
}
function normalizeEvidenceLocator(input){
  const locator = evidenceRecord(input.locator);
  if (locator) {
    const values = {
      label: evidenceFirstText(locator.label),
      act: evidenceFirstText(locator.act),
      scene: evidenceFirstText(locator.scene),
      chapter: evidenceFirstText(locator.chapter),
      timestamp: evidenceFirstText(locator.timestamp)
    };
    const normalized = Object.fromEntries(Object.entries(values).filter(([, value]) => value));
    return Object.keys(normalized).length ? normalized : undefined;
  }
  const label = evidenceFirstText(input.locator);
  return label ? { label } : undefined;
}
function normalizeEvidenceMetadata(input){
  const metadata = { ...(evidenceRecord(input.metadata) || {}) };
  const responseId = evidenceText(input.responseId);
  const promptLabel = evidenceText(input.promptLabel);
  const detailLabel = evidenceText(input.detailLabel);
  const counterpoint = evidenceText(input.counterpoint);
  if (responseId) metadata.responseId = responseId;
  if (promptLabel) metadata.promptLabel = promptLabel;
  if (detailLabel) metadata.detailLabel = detailLabel;
  if (counterpoint) metadata.counterpoint = counterpoint;
  return Object.keys(metadata).length ? metadata : undefined;
}
function normalizeEvidenceEntry(value){
  const input = evidenceRecord(value);
  if (!input) throw new TypeError("Evidence Bank entries must be objects.");
  const contributionId = evidenceFirstText(input.contributionId, input.responseId, input.id);
  if (!contributionId) throw new TypeError("Evidence Bank entries require a contributionId or responseId.");
  const now = new Date().toISOString();
  const entryKind = input.entryKind === "collection" || (!input.entryKind && evidenceText(input.responseId)) ? "collection" : "individual";
  const activityRecord = evidenceRecord(input.activity);
  const requestedProfile = evidenceFirstText(activityRecord?.profile, input.profile, "short-fiction");
  const profileFallback = evidenceProfileKinds.includes(requestedProfile) ? requestedProfile : "short-fiction";
  const legacyDetail = evidenceFirstText(input.detail);
  const explicitEvidence = evidenceFirstText(input.evidence);
  const answer = evidenceFirstText(input.answer, entryKind === "collection" ? legacyDetail : undefined);
  const evidence = evidenceFirstText(explicitEvidence, entryKind === "individual" ? legacyDetail : undefined);
  const connection = evidenceFirstText(input.connection);
  const counterpoint = evidenceFirstText(input.counterpoint);
  const analysis = evidenceFirstText(input.analysis, [connection, counterpoint].filter(Boolean).join("\n\n"));
  const responseIds = Array.isArray(input.responseIds) ? input.responseIds.map(evidenceText).filter(Boolean) : [];
  if (!answer && !evidence && !analysis && !responseIds.length) {
    throw new TypeError("Evidence Bank entries require saved content or at least one response id.");
  }
  const work = normalizeEvidenceWork(input);
  const locator = normalizeEvidenceLocator(input);
  const prompt = evidenceFirstText(input.prompt);
  const metadata = normalizeEvidenceMetadata(input);
  return {
    schemaVersion: 2,
    contributionId,
    projectSlug: evidenceFirstText(input.projectSlug, "english-unit"),
    entryKind,
    source: normalizeEvidenceSource(input, entryKind),
    activity: normalizeEvidenceActivity(input, profileFallback),
    ...(work ? { work } : {}),
    ...(locator ? { locator } : {}),
    ...(prompt ? { prompt } : {}),
    ...(answer ? { answer } : {}),
    ...(evidence ? { evidence } : {}),
    ...(analysis ? { analysis } : {}),
    ...(responseIds.length ? { responseIds } : {}),
    tags: Array.isArray(input.tags) ? input.tags.map(evidenceText).filter(Boolean) : [],
    createdAt: evidenceValidDate(input.createdAt, now),
    updatedAt: evidenceValidDate(input.updatedAt, now),
    ...(metadata ? { metadata } : {})
  };
}
function tryNormalizeEvidenceEntry(entry){
  try {
    return normalizeEvidenceEntry(entry);
  } catch {
    return null;
  }
}
function mergeEvidenceEntries(existing, incoming){
  const merged = { ...(existing || {}), ...incoming };
  if (evidenceRecord(existing?.activity) && evidenceRecord(incoming.activity)) {
    merged.activity = { ...existing.activity, ...incoming.activity };
  } else if (evidenceRecord(existing?.activity) && typeof incoming.activity === "string") {
    merged.activity = { ...existing.activity, id: incoming.activity, title: incoming.activity };
  }
  if (evidenceRecord(existing?.source) && evidenceRecord(incoming.source)) {
    merged.source = { ...existing.source, ...incoming.source };
  }
  if (evidenceRecord(existing?.work) && evidenceRecord(incoming.work)) {
    merged.work = { ...existing.work, ...incoming.work };
  }
  if (evidenceRecord(existing?.locator) && evidenceRecord(incoming.locator)) {
    merged.locator = { ...existing.locator, ...incoming.locator };
  }
  if (evidenceRecord(existing?.metadata) || evidenceRecord(incoming.metadata)) {
    merged.metadata = { ...(evidenceRecord(existing?.metadata) || {}), ...(evidenceRecord(incoming.metadata) || {}) };
  }
  return merged;
}
function upsertEvidenceEntry(entry){
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    throw new TypeError("Evidence Bank entries must be objects.");
  }
  const incoming = cloneEvidenceValue(entry);
  const identities = getEvidenceIdentities(incoming);
  if (!identities.length) {
    throw new TypeError("Evidence Bank entries require a contributionId or responseId.");
  }
  const notes = readManualEvidenceNotes();
  const existing = notes.find((note) => evidenceEntriesShareIdentity(note, identities));
  const normalizedExisting = existing ? tryNormalizeEvidenceEntry(existing) : null;
  const merged = mergeEvidenceEntries(normalizedExisting || existing, incoming);
  merged.updatedAt = new Date().toISOString();
  const nextEntry = normalizeEvidenceEntry(merged);
  writeManualEvidenceNotes([
    nextEntry,
    ...notes.filter((note) => !evidenceEntriesShareIdentity(note, identities))
  ]);
  renderManualEvidenceBank();
  return cloneEvidenceValue(nextEntry);
}
function removeEvidenceEntry(contributionId){
  const identity = normalizeEvidenceIdentity(contributionId);
  if (!identity) return false;
  const notes = readManualEvidenceNotes();
  const remaining = notes.filter((note) => !getEvidenceIdentities(note).includes(identity));
  if (remaining.length === notes.length) return false;
  writeManualEvidenceNotes(remaining);
  renderManualEvidenceBank();
  return true;
}
function evidenceValueMatchesFilter(actual, expected){
  if (Array.isArray(expected)) {
    return expected.some((value) => evidenceValueMatchesFilter(actual, value));
  }
  if (Array.isArray(actual)) {
    return actual.some((value) => evidenceValueMatchesFilter(value, expected));
  }
  return actual === expected;
}
function evidenceEntryMatchesFilters(entry, filters){
  return Object.entries(filters || {}).every(([key, expected]) => {
    if (typeof expected === "undefined") return true;
    if (key === "contributionId" || key === "responseId") {
      if (Array.isArray(expected)) {
        return expected.some((value) => getEvidenceIdentities(entry).includes(normalizeEvidenceIdentity(value)));
      }
      return getEvidenceIdentities(entry).includes(normalizeEvidenceIdentity(expected));
    }
    if (key === "tags") {
      const requestedTags = (Array.isArray(expected) ? expected : [expected]).map(normalizeEvidenceIdentity).filter(Boolean);
      const entryTags = (Array.isArray(entry.tags) ? entry.tags : []).map(normalizeEvidenceIdentity).filter(Boolean);
      return requestedTags.every((tag) => entryTags.includes(tag));
    }
    if (key === "activityId") return evidenceValueMatchesFilter(entry.activity?.id || entry.activityId, expected);
    if (key === "activity") {
      return [entry.activity?.id, entry.activity?.title, entry.activityId, entry.activityTitle, entry.concept]
        .filter(Boolean)
        .some((value) => evidenceValueMatchesFilter(value, expected));
    }
    if (key === "profile") return evidenceValueMatchesFilter(entry.activity?.profile || entry.profile, expected);
    if (key === "workId") return evidenceValueMatchesFilter(entry.work?.id || entry.workId, expected);
    if (key === "text") {
      return [entry.work?.id, entry.work?.title, entry.workId, entry.workTitle, entry.text, entry.film]
        .filter(Boolean)
        .some((value) => evidenceValueMatchesFilter(value, expected));
    }
    if (key === "locator") {
      const values = entry.locator && typeof entry.locator === "object"
        ? [entry.locator.label, entry.locator.act, entry.locator.scene, entry.locator.chapter, entry.locator.timestamp].filter(Boolean)
        : [entry.locator].filter(Boolean);
      return values.some((value) => evidenceValueMatchesFilter(value, expected));
    }
    return evidenceValueMatchesFilter(entry[key], expected);
  });
}
function listEvidenceEntries(filters){
  const normalizedFilters = filters && typeof filters === "object" && !Array.isArray(filters) ? filters : {};
  const entries = readManualEvidenceNotes().map(tryNormalizeEvidenceEntry).filter(Boolean);
  return cloneEvidenceValue(entries.filter((entry) => evidenceEntryMatchesFilters(entry, normalizedFilters)));
}
window.nextStepEvidenceBank = Object.freeze({
  upsert: upsertEvidenceEntry,
  remove: removeEvidenceEntry,
  list: listEvidenceEntries
});
function printEnglishEvidenceBank(route){
  if (!route || typeof document === "undefined" || typeof window.print !== "function") return;
  const pages = Array.from(document.querySelectorAll(".course-page"));
  const hiddenStates = pages.map((page) => page.hidden);
  pages.forEach((page) => { page.hidden = page !== route; });
  document.body?.classList.add("english-evidence-printing");
  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    pages.forEach((page, index) => { page.hidden = hiddenStates[index]; });
    document.body?.classList.remove("english-evidence-printing");
    window.removeEventListener?.("afterprint", restore);
  };
  window.addEventListener?.("afterprint", restore, { once: true });
  try {
    window.print();
  } finally {
    restore();
  }
}
if (typeof document !== "undefined") {
  document.addEventListener("click", (event) => {
    const printButton = event.target?.closest?.("[data-print-writing]");
    const route = printButton?.closest?.("#evidence-bank");
    if (!route) return;
    event.preventDefault();
    printEnglishEvidenceBank(route);
  });
}
`;
