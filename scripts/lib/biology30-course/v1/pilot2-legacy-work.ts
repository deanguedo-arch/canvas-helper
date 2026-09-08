import type { Biology30SuspendDataSchema } from "./suspend-data.js";
import { emptyTopicState, encodeTopicState, type KeyValueStorage, type TopicStateSchema } from "./pilot2-state.js";

export type LegacyRecord = { source: string; original: string; kind: "compact-v2" | "state-v1" | "responses" | "completions" | "notes" };
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === "object" && !Array.isArray(value));

/** Validate the source envelope, not equivalence to any rebuilt activity. */
export function validateLegacyRecord(item: LegacyRecord) {
  const data: unknown = JSON.parse(item.original);
  if (!item.source.trim()) throw new Error("Legacy source identity is required");
  const valid = item.kind === "compact-v2" ? record(data) && data.v === 2
    : item.kind === "state-v1" ? record(data) && data.schemaVersion === 1
    : item.kind === "responses" ? record(data) && Object.values(data).every(value => typeof value === "string")
    : item.kind === "completions" ? Array.isArray(data) && data.every(value => typeof value === "string")
    : item.kind === "notes" ? Array.isArray(data) && data.every(record) : false;
  if (!valid) throw new Error(`Unrecognized earlier ${item.kind} payload; retain original and use recovery`);
  return data;
}

/**
 * Back up every original source before producing a new payload. In particular,
 * the old shell's arrays/maps are not mistaken for compact-v2 envelopes. The
 * caller retains every original key, including on quota or combined-size failure.
 */
export function preserveLegacyRecords(records: LegacyRecord[], schema: TopicStateSchema, storage: KeyValueStorage, backupPrefix: string) {
  if (!backupPrefix.trim() || !records.length || new Set(records.map(item => item.source)).size !== records.length) throw new Error("Distinct legacy sources and a backup namespace are required");
  records.forEach(validateLegacyRecord);
  const backups = records.map(item => ({ item, key: `${backupPrefix}:${encodeURIComponent(item.source)}` }));
  // Check all collisions first; never replace a different earlier backup.
  for (const { item, key } of backups) {
    const previous = storage.getItem(key);
    if (previous !== null && previous !== item.original) throw new Error(`Different original already occupies legacy backup: ${key}`);
  }
  for (const { item, key } of backups) {
    if (storage.getItem(key) === null) storage.setItem(key, item.original);
    if (storage.getItem(key) !== item.original) throw new Error(`Could not verify original legacy backup: ${key}`);
  }
  const state = emptyTopicState(schema);
  state.legacy = records.map(item => ({ source: item.source, original: item.original }));
  encodeTopicState(state, schema); // Reject overflow only after originals are safely backed up.
  return { state, backups: backups.map(({ item, key }) => ({ source: item.source, key })) };
}

export type LegacyDisplayEntry = { label: string; text: string };
/** Read-only display keeps duplicate pairs and unknown fields; it assigns no new IDs. */
export function describeLegacyWork(original: string, schema: Biology30SuspendDataSchema): LegacyDisplayEntry[] {
  let data: unknown;
  try { data = JSON.parse(original); }
  catch { return [{ label: "Unparsed earlier work", text: original }]; }
  const entries: LegacyDisplayEntry[] = [];
  const text = (value: unknown) => typeof value === "string" ? value : JSON.stringify(value, null, 2);
  const reverse = (map: Record<string, string>) => Object.fromEntries(Object.entries(map).map(([id, token]) => [token, id]));
  const name = (value: unknown, map: Record<string, string>) => typeof value === "string" ? (Object.hasOwn(map, value) ? map[value] : value) : text(value);
  if (record(data) && data.v === 2) {
    const seen = new Set<string>();
    for (const [field, label, map] of [["r", "Earlier response", reverse(schema.responses)], ["p", "Earlier practice choice", reverse(schema.practice)]] as const) {
      if (!Array.isArray(data[field])) continue;
      seen.add(field);
      for (const pair of data[field]) {
        if (Array.isArray(pair) && pair.length === 2) entries.push({ label: `${label}: ${name(pair[0], map)}`, text: text(pair[1]) });
        else entries.push({ label: `${label}: unrecognized entry`, text: text(pair) });
      }
    }
    for (const [field, label, map] of [["c", "Earlier completion (not new completion)", reverse(schema.lessons)], ["a", "Earlier collected artifact", reverse(schema.artifacts)]] as const) {
      if (!Array.isArray(data[field])) continue;
      seen.add(field);
      for (const value of data[field]) entries.push({ label, text: name(value, map) });
    }
    if (Array.isArray(data.n)) {
      seen.add("n");
      for (const note of data.n) entries.push(Array.isArray(note) && note.length === 2 ? { label: `Earlier note: ${text(note[0])}`, text: text(note[1]) } : { label: "Earlier note: unrecognized entry", text: text(note) });
    }
    if (record(data.i) && Array.isArray(data.i.g)) {
      const interactions = new Map(Object.entries(schema.interactions).map(([id, definition]) => [definition.token, { id, options: reverse(definition.options) }]));
      for (const row of data.i.g) {
        const definition = Array.isArray(row) && typeof row[0] === "string" ? interactions.get(row[0]) : undefined;
        entries.push({ label: `Earlier model: ${definition?.id ?? "unrecognized model"}`, text: definition && Array.isArray(row) && row.length === 3
          ? `Selected: ${name(row[1], definition.options)}\nSeen: ${Array.isArray(row[2]) ? row[2].map(value => name(value, definition.options)).join(", ") : text(row[2])}` : text(row) });
      }
      // The complete interaction object below retains every other legacy model.
    }
    for (const [field, value] of Object.entries(data)) if (!seen.has(field)) entries.push({ label: `Earlier ${field}`, text: text(value) });
  } else if (record(data)) {
    for (const [field, value] of Object.entries(data)) {
      if (record(value)) for (const [id, answer] of Object.entries(value)) entries.push({ label: `Earlier ${field}: ${id}`, text: text(answer) });
      else entries.push({ label: `Earlier ${field}`, text: text(value) });
    }
  } else if (Array.isArray(data)) {
    data.forEach((value, index) => entries.push({ label: `Earlier entry ${index + 1}`, text: text(value) }));
  } else entries.push({ label: "Earlier saved value", text: text(data) });
  return entries;
}
