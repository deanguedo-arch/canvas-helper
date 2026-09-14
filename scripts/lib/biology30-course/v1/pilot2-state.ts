/** Unit-scoped persistence. No DOM, filesystem, LMS globals or Unit A dependency. */
import {biologyRuntimeStorageKey,validateBiologyRuntimeIdentity,type BiologyRuntimeIdentity} from './course-identity.js';
import {validateWordFrayers,packWordFrayers,unpackWordFrayers,type WordFrayerSchema,type WordFrayerState} from '../../biology30-vocabulary/word-frayer-state.js';
export const TOPIC_STATE_VERSION = 3;
export const TOPIC_STATE_TARGET = 44_000;
export const TOPIC_STATE_GUARD = 48_000;
export type TopicStateSchema = BiologyRuntimeIdentity & {
  responses: Record<string, { token: string; limit: number }>;
  choices: Record<string, { token: string; values: string[] }>;
  flags: Record<string, string>;
  /** Exact order identity prevents a changed map from reassigning saved bits. */
  flagPacking?: { format: "hex-v1"; order: string[]; sha256: string };
  /** Presence bits distinguish absent responses from intentionally empty text. */
  responsePacking?: { format: "ordered-text-v1"; order: string[]; sha256: string };
  /** Opt-in identity covers ordered choice IDs/tokens/values and route IDs. */
  indexPacking?: { format: "choices-routes-v1"; sha256: string };
  routes: string[];
  families: { fixed: string[]; selectable: string[]; responseIds: Record<string, string[]> };
  wordFrayers?:WordFrayerSchema;
};
export type TopicState = BiologyRuntimeIdentity & {
  version: 3; updatedAt: string; route: string;
  responses: Record<string, string>; choices: Record<string, string>; flags: string[]; visited: string[]; frayerChoices: string[]; vocabularyActiveId?: string;
  legacy: { original: string; source: string }[];
  wordFrayers?:WordFrayerState;
};
export function emptyTopicState(schema: TopicStateSchema): TopicState {
  validateBiologyRuntimeIdentity(schema);
  return { version: 3, unit: schema.unit, ...(schema.courseId?{courseId:schema.courseId}:{}), updatedAt: new Date(0).toISOString(), route: schema.routes[0], responses: {}, choices: {}, flags: [], visited: [], frayerChoices: [], legacy: [] };
}
function own<T>(record: Record<string, T>, key: string): T | undefined { return Object.prototype.hasOwnProperty.call(record, key) ? record[key] : undefined; }
function uniqueStrings(values: unknown, label: string): asserts values is string[] {
  if (!Array.isArray(values) || values.some(v => typeof v !== "string") || new Set(values).size !== values.length) throw new Error(`Invalid ${label}`);
}
function object(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
}
export function validateTopicState(state: TopicState, schema: TopicStateSchema) {
  validateBiologyRuntimeIdentity(schema);
  if (state.version !== 3 || state.unit !== schema.unit || state.courseId !== schema.courseId) throw new Error("State version or unit does not match this course");
  if (!schema.routes.includes(state.route) || typeof state.updatedAt !== "string" || !Number.isFinite(Date.parse(state.updatedAt))) throw new Error("Unknown route or invalid state time");
  object(state.responses, "responses"); object(state.choices, "choices");
  uniqueStrings(state.flags, "flags"); uniqueStrings(state.visited, "visited routes"); uniqueStrings(state.frayerChoices, "Frayer choices");
  if (state.flags.some(id => !own(schema.flags, id)) || state.visited.some(id => !schema.routes.includes(id))) throw new Error("Unknown state flag or visited route");
  if (state.frayerChoices.length > 2 || state.frayerChoices.some(id => !schema.families.selectable.includes(id) || schema.families.fixed.includes(id))) throw new Error("Invalid optional Frayer selection");
  for (const [id, text] of Object.entries(state.responses)) {
    const field = own(schema.responses, id);
    if (!field || typeof text !== "string" || text.length > field.limit) throw new Error(`Unknown or oversized response: ${id}; writing was not truncated`);
  }
  for (const [id, value] of Object.entries(state.choices)) {
    if (typeof value !== "string" || !own(schema.choices, id)?.values.includes(value)) throw new Error(`Unknown choice or value: ${id}`);
  }
  if(state.vocabularyActiveId!==undefined&&!Object.hasOwn(schema.families.responseIds,state.vocabularyActiveId))throw new Error("Unknown active vocabulary concept");
  const activeFamilies = new Set([...schema.families.fixed, ...state.frayerChoices]);
  for (const [family, ids] of Object.entries(schema.families.responseIds)) {
    if (!activeFamilies.has(family) && ids.some(id => (state.responses[id] ?? "").length > 0)) throw new Error("Written Frayer belongs to an inactive choice; preserve it before replacement");
  }
  if (!Array.isArray(state.legacy) || state.legacy.some(x => !x || typeof x.original !== "string" || typeof x.source !== "string")) throw new Error("Invalid preserved legacy payload");
  if(state.wordFrayers!==undefined){
    if(!schema.wordFrayers)throw Error('Word Frayers are not enabled in this profile');
    validateWordFrayers(state.wordFrayers,schema.wordFrayers);
    if(state.frayerChoices.length||Object.values(schema.families.responseIds).flat().some(id=>state.responses[id]?.length))throw Error('Legacy and word Frayers cannot duplicate the saved writing budget');
  }
  return state;
}
function reverseTokens<T>(entries: Record<string, T>, token: (value: T) => string) {
  const result: Record<string, string> = Object.create(null);
  for (const [id, value] of Object.entries(entries)) {
    const key = token(value);
    if (!key || Object.prototype.hasOwnProperty.call(result, key)) throw new Error("Duplicate or empty storage token");
    result[key] = id;
  }
  return result;
}
function checkFlagPacking(schema: TopicStateSchema) {
  const packing = schema.flagPacking;
  if (!packing) return;
  if (packing.format !== "hex-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported flag packing identity");
  uniqueStrings(packing.order, "flag packing order");
  if (packing.order.length !== Object.keys(schema.flags).length || packing.order.some(id => !Object.hasOwn(schema.flags, id))) throw new Error("Flag packing inventory drift");
}
function packFlags(flags: string[], schema: TopicStateSchema) {
  checkFlagPacking(schema);
  if (!schema.flagPacking) return flags.map(id => schema.flags[id]);
  const { order, sha256 } = schema.flagPacking;
  const positions = new Map(order.map((id, index) => [id, index]));
  const digits = Array<number>(Math.ceil(order.length / 4)).fill(0);
  for (const id of flags) {
    const index = positions.get(id)!;
    digits[Math.floor(index / 4)] |= 1 << (index % 4);
  }
  return { v: 1, m: sha256, b: digits.map(value => value.toString(16)).join("") };
}
function unpackFlags(value: unknown, schema: TopicStateSchema, legacyTokens: Record<string, string>): string[] {
  // Earlier Pilot2 token arrays remain readable. Flags are a set; bit-packed
  // payloads return them in the fixed manifest order, not click chronology.
  if (Array.isArray(value)) {
    uniqueStrings(value, "packed flags");
    if (value.some(token => !own(legacyTokens, token))) throw new Error("Unknown compact flag");
    return value.map(token => legacyTokens[token]);
  }
  checkFlagPacking(schema);
  object(value, "packed flags");
  const packing = schema.flagPacking;
  if (!packing || Object.keys(value).sort().join(",") !== "b,m,v" || value.v !== 1 || value.m !== packing.sha256 || typeof value.b !== "string" ||
      value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b)) throw new Error("Unknown or mismatched flag map; preserve original payload");
  const digits = [...value.b].map(char => Number.parseInt(char, 16));
  const unused = packing.order.length % 4;
  if (unused && digits.at(-1)! >= (1 << unused)) throw new Error("Packed flags contain unknown trailing bits");
  return packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & (1 << (index % 4))));
}
function checkResponsePacking(schema: TopicStateSchema) {
  const packing = schema.responsePacking;
  if (!packing) return;
  if (packing.format !== "ordered-text-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported response packing identity");
  uniqueStrings(packing.order, "response packing order");
  if (packing.order.length !== Object.keys(schema.responses).length || packing.order.some(id => !Object.hasOwn(schema.responses, id))) throw new Error("Response packing inventory drift");
}
function packResponses(responses: Record<string, string>, schema: TopicStateSchema) {
  const pairs = Object.entries(responses).map(([id, text]) => [schema.responses[id].token, text]);
  checkResponsePacking(schema);
  if (!schema.responsePacking) return pairs;
  const { order, sha256 } = schema.responsePacking;
  const digits = Array<number>(Math.ceil(order.length / 4)).fill(0), texts: string[] = [];
  order.forEach((id, index) => {
    if (!Object.hasOwn(responses, id)) return;
    digits[Math.floor(index / 4)] |= 1 << (index % 4);
    texts.push(responses[id]);
  });
  const packed = { v: 1, m: sha256, b: digits.map(value => value.toString(16)).join(""), t: texts };
  // Sparse work keeps its token pairs when those are smaller. Text is never
  // compressed, shortened, normalized or split into code points.
  return JSON.stringify(packed).length < JSON.stringify(pairs).length ? packed : pairs;
}
function unpackResponses(value: unknown, schema: TopicStateSchema): Record<string, string> {
  checkResponsePacking(schema);
  object(value, "packed responses");
  const packing = schema.responsePacking;
  if (!packing || Object.keys(value).sort().join(",") !== "b,m,t,v" || value.v !== 1 || value.m !== packing.sha256 ||
      typeof value.b !== "string" || value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b) ||
      !Array.isArray(value.t) || value.t.some(text => typeof text !== "string")) throw new Error("Unknown or mismatched response map; preserve original payload");
  const digits = [...value.b].map(char => Number.parseInt(char, 16)), unused = packing.order.length % 4;
  if (unused && digits.at(-1)! >= (1 << unused)) throw new Error("Packed responses contain unknown trailing bits");
  const present = packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & (1 << (index % 4))));
  if (present.length !== value.t.length) throw new Error("Packed response count mismatch; preserve original payload");
  return Object.fromEntries(present.map((id, index) => [id, (value.t as string[])[index]]));
}
export function topicIndexIdentity(schema: TopicStateSchema) {
  return JSON.stringify({ choices: Object.entries(schema.choices), routes: schema.routes });
}
function checkIndexPacking(schema: TopicStateSchema) {
  if (!schema.indexPacking || schema.indexPacking.format !== "choices-routes-v1" || !/^[a-f0-9]{64}$/.test(schema.indexPacking.sha256)) throw new Error("Unsupported choice/route packing identity");
  uniqueStrings(schema.routes, "route map");
  for (const choice of Object.values(schema.choices)) {
    uniqueStrings(choice.values, "choice map");
    if (!choice.values.length || choice.values.length > 10) throw new Error("Choice map exceeds single-digit encoding");
  }
}
export function encodeTopicState(state: TopicState, schema: TopicStateSchema, limit = TOPIC_STATE_GUARD) {
  validateTopicState(state, schema);
  reverseTokens(schema.responses, x => x.token); reverseTokens(schema.choices, x => x.token); reverseTokens(schema.flags, x => x);
  if (schema.indexPacking) checkIndexPacking(schema);
  const packed = { v: 3, u: state.unit, ...(schema.courseId?{q:schema.courseId}:{}), t: state.updatedAt, l: state.route, ...(state.vocabularyActiveId?{a:state.vocabularyActiveId}:{}),
    r: packResponses(state.responses, schema),
    p: schema.indexPacking ? { v: 1, m: schema.indexPacking.sha256, b: Object.entries(schema.choices).map(([id, choice]) => Object.hasOwn(state.choices, id) ? String(choice.values.indexOf(state.choices[id])) : '-').join('') } : Object.entries(state.choices).map(([id, value]) => [schema.choices[id].token, value]),
    f: packFlags(state.flags, schema), h: schema.indexPacking ? state.visited.map(id => schema.routes.indexOf(id)) : state.visited, w: state.frayerChoices,
    z: state.legacy.map(x => [x.source, x.original]),...(state.wordFrayers!==undefined?{k:packWordFrayers(state.wordFrayers,schema.wordFrayers!)}:{}) };
  const serialized = JSON.stringify(packed);
  if (serialized.length > limit) throw new Error(`Save needs ${serialized.length} characters; limit is ${limit}. Last valid state and current writing remain intact.`);
  return serialized;
}
export function decodeTopicState(raw: string, schema: TopicStateSchema): TopicState {
  const p: unknown = JSON.parse(raw); object(p, "saved payload");
  validateBiologyRuntimeIdentity(schema);
  const keys = new Set(["v","u","t","l","r","p","f","h","w","z","a",...(schema.courseId?["q"]:[]),...(schema.wordFrayers?['k']:[])]);
  if (Object.keys(p).some(k => !keys.has(k))) throw new Error("Saved payload contains unknown data; retain original for recovery");
  if (p.v !== 3 || p.u !== schema.unit || p.q !== schema.courseId) throw new Error("Saved payload belongs to another profile or unit");
  const responses = reverseTokens(schema.responses, x => x.token), choices = reverseTokens(schema.choices, x => x.token), flags = reverseTokens(schema.flags, x => x);
  function pairs(rawPairs: unknown, map: Record<string, string>) {
    if (!Array.isArray(rawPairs)) throw new Error("Invalid compact entries");
    const result: Record<string, string> = Object.create(null);
    for (const pair of rawPairs) {
      if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== "string" || typeof pair[1] !== "string" || !own(map, pair[0])) throw new Error("Unknown or malformed compact entry; original retained");
      const id = map[pair[0]];
      if (Object.prototype.hasOwnProperty.call(result, id)) throw new Error("Duplicate compact response would overwrite writing");
      result[id] = pair[1];
    }
    return result;
  }
  const decodedFlags = unpackFlags(p.f, schema, flags);
  let decodedChoices: Record<string, string>, visited: string[];
  if (Array.isArray(p.p)) {
    // Preserve earlier v3 choice pairs and string route lists without migration.
    decodedChoices = pairs(p.p, choices); visited = p.h as string[];
  } else {
    checkIndexPacking(schema); object(p.p, "indexed choices");
    const entries = Object.entries(schema.choices);
    if (Object.keys(p.p).sort().join(',') !== 'b,m,v' || p.p.v !== 1 || p.p.m !== schema.indexPacking!.sha256 || typeof p.p.b !== 'string' || p.p.b.length !== entries.length || !/^[0-9-]*$/.test(p.p.b)) throw new Error("Mismatched choice/route map; preserve original payload");
    decodedChoices = Object.create(null);
    entries.forEach(([id, choice], index) => {
      const code = (p.p as { b: string }).b[index];
      if (code === '-') return;
      const value = choice.values[Number(code)];
      if (value === undefined) throw new Error("Unknown indexed choice; preserve original payload");
      decodedChoices[id] = value;
    });
    if (!Array.isArray(p.h) || p.h.some(i => !Number.isInteger(i) || i < 0 || i >= schema.routes.length) || new Set(p.h).size !== p.h.length) throw new Error("Invalid indexed visited routes");
    visited = p.h.map(i => schema.routes[i]);
  }
  if (!Array.isArray(p.z) || p.z.some(x => !Array.isArray(x) || x.length !== 2 || x.some(v => typeof v !== "string"))) throw new Error("Invalid legacy archive");
  return validateTopicState({ version:3,unit:schema.unit,...(schema.courseId?{courseId:schema.courseId}:{}),updatedAt:p.t as string,route:p.l as string,...(p.a!==undefined?{vocabularyActiveId:p.a as string}:{}),responses:Array.isArray(p.r)?pairs(p.r,responses):unpackResponses(p.r,schema),choices:decodedChoices,flags:decodedFlags,visited,frayerChoices:p.w as string[],legacy:p.z.map(x=>({source:x[0],original:x[1]})),...(p.k!==undefined?{wordFrayers:unpackWordFrayers(p.k,schema.wordFrayers!)}:{}) },schema);
}
/** Lossless in-memory migration. The existing persistence owner backs up old bytes before saving. */
export function migrateTopicWordFrayers(state:TopicState,schema:TopicStateSchema):TopicState{
 validateTopicState(state,schema);if(!schema.wordFrayers||state.wordFrayers!==undefined)return state;
 const next=structuredClone(state);next.wordFrayers=[];
 for(const id of [...schema.families.fixed,...state.frayerChoices]){
  const answers=schema.families.responseIds[id].map(field=>state.responses[field]??'') as [string,string,string,string];
  const collected=state.flags.includes(id+'-collected');
  if(answers.some(a=>a.length)||collected||state.frayerChoices.includes(id))next.wordFrayers.push({kind:'legacy',id,answers,collected});
 }
 for(const ids of Object.values(schema.families.responseIds))for(const id of ids)delete next.responses[id];
 next.flags=next.flags.filter(flag=>!Object.keys(schema.families.responseIds).some(id=>flag===id+'-collected'));next.frayerChoices=[];
 validateTopicState(next,schema);encodeTopicState(next,schema);return next;
}
export function replaceFrayerChoice(state: TopicState, schema: TopicStateSchema, oldId: string | null, nextId: string) {
  validateTopicState(state, schema);
  if (!schema.families.selectable.includes(nextId) || schema.families.fixed.includes(nextId)) throw new Error("Choose an eligible optional family");
  if (oldId && !state.frayerChoices.includes(oldId)) throw new Error("The replaced choice is not selected");
  if (oldId && schema.families.responseIds[oldId]?.some(id => (state.responses[id] ?? "").length)) throw new Error("Copy and explicitly clear this written Frayer before replacement");
  const choices = state.frayerChoices.filter(id => id !== oldId);
  if (choices.includes(nextId) || choices.length >= 2) throw new Error("Two different optional Frayer choices are allowed");
  return validateTopicState({ ...state, frayerChoices:[...choices,nextId] },schema);
}
/** Caller must show the exact family and obtain the learner's scoped confirmation. */
export function clearFrayer(state: TopicState, schema: TopicStateSchema, familyId: string, confirmed: boolean) {
  if (!confirmed || !Object.prototype.hasOwnProperty.call(schema.families.responseIds,familyId)) throw new Error("Explicit scoped Frayer clear confirmation required");
  const responses = { ...state.responses };
  for (const id of schema.families.responseIds[familyId]) delete responses[id];
  return validateTopicState({ ...state, responses, flags:state.flags.filter(id=>id!==`${familyId}-collected`) },schema);
}
export type KeyValueStorage = { getItem(key: string): string | null; setItem(key: string, value: string): void };
export type TopicLms = { setValue(name: string, value: string): unknown; commit(): unknown };
const succeeded = (value: unknown) => value === true || value === "true";
/** Local, SetValue and Commit are independent outcomes. Never report a failed Commit as an LMS save. */
export function persistTopicState(state: TopicState, schema: TopicStateSchema, local: KeyValueStorage | null, lms: TopicLms | null) {
  let serialized: string;
  try { serialized=encodeTopicState(state,schema); } catch(error) { return { accepted:false, local:"not-attempted", setValue:"not-attempted", commit:"not-attempted", error:String(error) }; }
  const outcome = { accepted:true, local:local ? "pending" : "unavailable", setValue:lms ? "pending" : "unavailable", commit:lms ? "not-attempted" : "unavailable", error:"" };
  const key=biologyRuntimeStorageKey(schema);
  if (local) try {
    const before=local.getItem(key);
    if(before) { decodeTopicState(before,schema); local.setItem(`${key}:previous`,before); }
    local.setItem(key,serialized); outcome.local="saved";
  } catch(error) { outcome.local="failed"; outcome.error=String(error); }
  if(lms) try {
    if(succeeded(lms.setValue("cmi.suspend_data",serialized))) { outcome.setValue="accepted"; outcome.commit=succeeded(lms.commit())?"confirmed":"failed"; }
    else outcome.setValue="failed";
  } catch(error) { if(outcome.setValue==="accepted") outcome.commit="failed"; else outcome.setValue="failed"; outcome.error=String(error); }
  return outcome;
}
/** Original bytes are backed up before any migration. No old completion or unrelated answer is reassigned. */
export function preserveLegacyState(raw: string, source: string, schema: TopicStateSchema, storage: KeyValueStorage, backupKey: string) {
  const parsed: unknown = JSON.parse(raw); object(parsed,"legacy payload");
  if (parsed.v !== 2 && parsed.schemaVersion !== 1) throw new Error("Unsupported legacy payload; preserve original and request recovery instead of resetting");
  const existing = storage.getItem(backupKey);
  if (existing !== null && existing !== raw) throw new Error("Backup key contains a different original; allocate a distinct backup before migration");
  if (existing === null) storage.setItem(backupKey,raw);
  if(storage.getItem(backupKey)!==raw) throw new Error("Original-payload backup could not be verified");
  const state=emptyTopicState(schema); state.legacy=[{source,original:raw}];
  // May overflow: in that case no new LMS payload is produced, while the verified original remains available.
  encodeTopicState(state,schema);
  return state;
}
