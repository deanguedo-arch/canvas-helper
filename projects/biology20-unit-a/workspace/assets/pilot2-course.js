"use strict";
(() => {
  // scripts/lib/biology30-course/v1/course-identity.ts
  var BIOLOGY20_MODULE_UNITS = ["A", "B", "C", "D-PART-1", "D-PART-2"];
  function validateBiologyRuntimeIdentity(identity) {
    if (identity.courseId === void 0) {
      if (!["B", "C", "D"].includes(identity.unit)) throw Error("Unsupported legacy Biology30 runtime identity");
    } else if (identity.courseId !== "biology20" || !BIOLOGY20_MODULE_UNITS.includes(identity.unit)) throw Error("Unsupported Biology course/module identity");
    return identity;
  }
  function biologyRuntimeStorageBase(identity) {
    validateBiologyRuntimeIdentity(identity);
    return `${identity.courseId ?? "biology30"}-unit-${identity.unit.toLowerCase()}`;
  }
  function biologyRuntimeStorageKey(identity) {
    const base = biologyRuntimeStorageBase(identity);
    return `${base}:${identity.courseId ? "state:v1" : "pilot2-v3"}`;
  }

  // scripts/lib/biology30-vocabulary/word-frayer-state.ts
  function validateWordFrayers(slots, schema) {
    if (!/^[a-f0-9]{64}$/.test(schema.identity) || !Number.isInteger(schema.limit) || schema.limit < 1) throw Error("Invalid word Frayer schema");
    if (new Set(schema.wordIds).size !== schema.wordIds.length || new Set(schema.legacyIds).size !== schema.legacyIds.length) throw Error("Duplicate word Frayer identity");
    if (!Array.isArray(slots) || slots.length > 8) throw Error("Choose up to eight words");
    const seen = /* @__PURE__ */ new Set();
    for (const s of slots) {
      if (!s || !["word", "legacy"].includes(s.kind) || !(s.kind === "word" ? schema.wordIds : schema.legacyIds).includes(s.id) || seen.has(s.kind + ":" + s.id)) throw Error("Unknown or duplicate Frayer owner");
      seen.add(s.kind + ":" + s.id);
      if (!Array.isArray(s.answers) || s.answers.length !== 4 || s.answers.some((a) => typeof a !== "string" || a.length > schema.limit)) throw Error("A Frayer response is oversized or invalid; writing was not truncated");
      if (typeof s.collected !== "boolean" || s.kind === "word" && s.collected && !s.answers.every((a) => a.trim())) throw Error("Complete four fields before collecting");
    }
    return slots;
  }
  function chooseWord(slots, schema, id) {
    validateWordFrayers(slots, schema);
    if (!schema.wordIds.includes(id)) throw Error("Unknown word");
    if (slots.some((s) => s.kind === "word" && s.id === id)) return slots;
    if (slots.length >= 8) throw Error("All eight slots are occupied. Copy and remove a chosen Frayer before choosing another word.");
    return [...slots, { kind: "word", id, answers: ["", "", "", ""], collected: false }];
  }
  function removeWordFrayer(slots, schema, kind, id, confirmed) {
    validateWordFrayers(slots, schema);
    const found = slots.find((s) => s.kind === kind && s.id === id);
    if (!found) throw Error("Frayer is not selected");
    if ((found.answers.some((a) => a.length) || found.collected) && !confirmed) throw Error("Copy your writing and explicitly confirm removal first");
    return slots.filter((s) => s !== found);
  }
  function packWordFrayers(slots, schema) {
    validateWordFrayers(slots, schema);
    return { m: schema.identity, s: slots.map((s) => [s.kind === "word" ? schema.wordIds.indexOf(s.id) : -1 - schema.legacyIds.indexOf(s.id), s.collected ? 1 : 0, ...s.answers]) };
  }
  function unpackWordFrayers(raw, schema) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw Error("Invalid word Frayer payload");
    const p = raw;
    if (Object.keys(p).sort().join(",") !== "m,s" || p.m !== schema.identity || !Array.isArray(p.s)) throw Error("Word map changed; preserve the original save");
    const slots = p.s.map((row) => {
      if (!Array.isArray(row) || row.length !== 6 || !Number.isInteger(row[0]) || ![0, 1].includes(row[1]) || row.slice(2).some((a) => typeof a !== "string")) throw Error("Malformed word Frayer; preserve original save");
      const kind = row[0] < 0 ? "legacy" : "word", id = kind === "word" ? schema.wordIds[row[0]] : schema.legacyIds[-1 - row[0]];
      return { kind, id, answers: row.slice(2), collected: row[1] === 1 };
    });
    return validateWordFrayers(slots, schema);
  }

  // scripts/lib/biology30-course/v1/pilot2-state.ts
  var TOPIC_STATE_GUARD = 48e3;
  function emptyTopicState(schema) {
    validateBiologyRuntimeIdentity(schema);
    return { version: 3, unit: schema.unit, ...schema.courseId ? { courseId: schema.courseId } : {}, updatedAt: (/* @__PURE__ */ new Date(0)).toISOString(), route: schema.routes[0], responses: {}, choices: {}, flags: [], visited: [], frayerChoices: [], legacy: [] };
  }
  function own(record2, key) {
    return Object.prototype.hasOwnProperty.call(record2, key) ? record2[key] : void 0;
  }
  function uniqueStrings(values, label) {
    if (!Array.isArray(values) || values.some((v) => typeof v !== "string") || new Set(values).size !== values.length) throw new Error(`Invalid ${label}`);
  }
  function object(value, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Invalid ${label}`);
  }
  function validateTopicState(state, schema) {
    validateBiologyRuntimeIdentity(schema);
    if (state.version !== 3 || state.unit !== schema.unit || state.courseId !== schema.courseId) throw new Error("State version or unit does not match this course");
    if (!schema.routes.includes(state.route) || typeof state.updatedAt !== "string" || !Number.isFinite(Date.parse(state.updatedAt))) throw new Error("Unknown route or invalid state time");
    object(state.responses, "responses");
    object(state.choices, "choices");
    uniqueStrings(state.flags, "flags");
    uniqueStrings(state.visited, "visited routes");
    uniqueStrings(state.frayerChoices, "Frayer choices");
    if (state.flags.some((id) => !own(schema.flags, id)) || state.visited.some((id) => !schema.routes.includes(id))) throw new Error("Unknown state flag or visited route");
    if (state.frayerChoices.length > 2 || state.frayerChoices.some((id) => !schema.families.selectable.includes(id) || schema.families.fixed.includes(id))) throw new Error("Invalid optional Frayer selection");
    for (const [id, text] of Object.entries(state.responses)) {
      const field = own(schema.responses, id);
      if (!field || typeof text !== "string" || text.length > field.limit) throw new Error(`Unknown or oversized response: ${id}; writing was not truncated`);
    }
    for (const [id, value] of Object.entries(state.choices)) {
      if (typeof value !== "string" || !own(schema.choices, id)?.values.includes(value)) throw new Error(`Unknown choice or value: ${id}`);
    }
    if (state.vocabularyActiveId !== void 0 && !Object.hasOwn(schema.families.responseIds, state.vocabularyActiveId)) throw new Error("Unknown active vocabulary concept");
    const activeFamilies = /* @__PURE__ */ new Set([...schema.families.fixed, ...state.frayerChoices]);
    for (const [family, ids] of Object.entries(schema.families.responseIds)) {
      if (!activeFamilies.has(family) && ids.some((id) => (state.responses[id] ?? "").length > 0)) throw new Error("Written Frayer belongs to an inactive choice; preserve it before replacement");
    }
    if (!Array.isArray(state.legacy) || state.legacy.some((x) => !x || typeof x.original !== "string" || typeof x.source !== "string")) throw new Error("Invalid preserved legacy payload");
    if (state.wordFrayers !== void 0) {
      if (!schema.wordFrayers) throw Error("Word Frayers are not enabled in this profile");
      validateWordFrayers(state.wordFrayers, schema.wordFrayers);
      if (state.frayerChoices.length || Object.values(schema.families.responseIds).flat().some((id) => state.responses[id]?.length)) throw Error("Legacy and word Frayers cannot duplicate the saved writing budget");
    }
    return state;
  }
  function reverseTokens(entries, token) {
    const result = /* @__PURE__ */ Object.create(null);
    for (const [id, value] of Object.entries(entries)) {
      const key = token(value);
      if (!key || Object.prototype.hasOwnProperty.call(result, key)) throw new Error("Duplicate or empty storage token");
      result[key] = id;
    }
    return result;
  }
  function checkFlagPacking(schema) {
    const packing = schema.flagPacking;
    if (!packing) return;
    if (packing.format !== "hex-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported flag packing identity");
    uniqueStrings(packing.order, "flag packing order");
    if (packing.order.length !== Object.keys(schema.flags).length || packing.order.some((id) => !Object.hasOwn(schema.flags, id))) throw new Error("Flag packing inventory drift");
  }
  function packFlags(flags, schema) {
    checkFlagPacking(schema);
    if (!schema.flagPacking) return flags.map((id) => schema.flags[id]);
    const { order, sha256 } = schema.flagPacking;
    const positions = new Map(order.map((id, index) => [id, index]));
    const digits = Array(Math.ceil(order.length / 4)).fill(0);
    for (const id of flags) {
      const index = positions.get(id);
      digits[Math.floor(index / 4)] |= 1 << index % 4;
    }
    return { v: 1, m: sha256, b: digits.map((value) => value.toString(16)).join("") };
  }
  function unpackFlags(value, schema, legacyTokens) {
    if (Array.isArray(value)) {
      uniqueStrings(value, "packed flags");
      if (value.some((token) => !own(legacyTokens, token))) throw new Error("Unknown compact flag");
      return value.map((token) => legacyTokens[token]);
    }
    checkFlagPacking(schema);
    object(value, "packed flags");
    const packing = schema.flagPacking;
    if (!packing || Object.keys(value).sort().join(",") !== "b,m,v" || value.v !== 1 || value.m !== packing.sha256 || typeof value.b !== "string" || value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b)) throw new Error("Unknown or mismatched flag map; preserve original payload");
    const digits = [...value.b].map((char) => Number.parseInt(char, 16));
    const unused = packing.order.length % 4;
    if (unused && digits.at(-1) >= 1 << unused) throw new Error("Packed flags contain unknown trailing bits");
    return packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & 1 << index % 4));
  }
  function checkResponsePacking(schema) {
    const packing = schema.responsePacking;
    if (!packing) return;
    if (packing.format !== "ordered-text-v1" || !/^[a-f0-9]{64}$/.test(packing.sha256)) throw new Error("Unsupported response packing identity");
    uniqueStrings(packing.order, "response packing order");
    if (packing.order.length !== Object.keys(schema.responses).length || packing.order.some((id) => !Object.hasOwn(schema.responses, id))) throw new Error("Response packing inventory drift");
  }
  function packResponses(responses, schema) {
    const pairs = Object.entries(responses).map(([id, text]) => [schema.responses[id].token, text]);
    checkResponsePacking(schema);
    if (!schema.responsePacking) return pairs;
    const { order, sha256 } = schema.responsePacking;
    const digits = Array(Math.ceil(order.length / 4)).fill(0), texts = [];
    order.forEach((id, index) => {
      if (!Object.hasOwn(responses, id)) return;
      digits[Math.floor(index / 4)] |= 1 << index % 4;
      texts.push(responses[id]);
    });
    const packed = { v: 1, m: sha256, b: digits.map((value) => value.toString(16)).join(""), t: texts };
    return JSON.stringify(packed).length < JSON.stringify(pairs).length ? packed : pairs;
  }
  function unpackResponses(value, schema) {
    checkResponsePacking(schema);
    object(value, "packed responses");
    const packing = schema.responsePacking;
    if (!packing || Object.keys(value).sort().join(",") !== "b,m,t,v" || value.v !== 1 || value.m !== packing.sha256 || typeof value.b !== "string" || value.b.length !== Math.ceil(packing.order.length / 4) || !/^[0-9a-f]*$/.test(value.b) || !Array.isArray(value.t) || value.t.some((text) => typeof text !== "string")) throw new Error("Unknown or mismatched response map; preserve original payload");
    const digits = [...value.b].map((char) => Number.parseInt(char, 16)), unused = packing.order.length % 4;
    if (unused && digits.at(-1) >= 1 << unused) throw new Error("Packed responses contain unknown trailing bits");
    const present = packing.order.filter((_id, index) => Boolean(digits[Math.floor(index / 4)] & 1 << index % 4));
    if (present.length !== value.t.length) throw new Error("Packed response count mismatch; preserve original payload");
    return Object.fromEntries(present.map((id, index) => [id, value.t[index]]));
  }
  function checkIndexPacking(schema) {
    if (!schema.indexPacking || schema.indexPacking.format !== "choices-routes-v1" || !/^[a-f0-9]{64}$/.test(schema.indexPacking.sha256)) throw new Error("Unsupported choice/route packing identity");
    uniqueStrings(schema.routes, "route map");
    for (const choice of Object.values(schema.choices)) {
      uniqueStrings(choice.values, "choice map");
      if (!choice.values.length || choice.values.length > 10) throw new Error("Choice map exceeds single-digit encoding");
    }
  }
  function encodeTopicState(state, schema, limit = TOPIC_STATE_GUARD) {
    validateTopicState(state, schema);
    reverseTokens(schema.responses, (x) => x.token);
    reverseTokens(schema.choices, (x) => x.token);
    reverseTokens(schema.flags, (x) => x);
    if (schema.indexPacking) checkIndexPacking(schema);
    const packed = {
      v: 3,
      u: state.unit,
      ...schema.courseId ? { q: schema.courseId } : {},
      t: state.updatedAt,
      l: state.route,
      ...state.vocabularyActiveId ? { a: state.vocabularyActiveId } : {},
      r: packResponses(state.responses, schema),
      p: schema.indexPacking ? { v: 1, m: schema.indexPacking.sha256, b: Object.entries(schema.choices).map(([id, choice]) => Object.hasOwn(state.choices, id) ? String(choice.values.indexOf(state.choices[id])) : "-").join("") } : Object.entries(state.choices).map(([id, value]) => [schema.choices[id].token, value]),
      f: packFlags(state.flags, schema),
      h: schema.indexPacking ? state.visited.map((id) => schema.routes.indexOf(id)) : state.visited,
      w: state.frayerChoices,
      z: state.legacy.map((x) => [x.source, x.original]),
      ...state.wordFrayers !== void 0 ? { k: packWordFrayers(state.wordFrayers, schema.wordFrayers) } : {}
    };
    const serialized = JSON.stringify(packed);
    if (serialized.length > limit) throw new Error(`Save needs ${serialized.length} characters; limit is ${limit}. Last valid state and current writing remain intact.`);
    return serialized;
  }
  function decodeTopicState(raw, schema) {
    const p = JSON.parse(raw);
    object(p, "saved payload");
    validateBiologyRuntimeIdentity(schema);
    const keys = /* @__PURE__ */ new Set(["v", "u", "t", "l", "r", "p", "f", "h", "w", "z", "a", ...schema.courseId ? ["q"] : [], ...schema.wordFrayers ? ["k"] : []]);
    if (Object.keys(p).some((k) => !keys.has(k))) throw new Error("Saved payload contains unknown data; retain original for recovery");
    if (p.v !== 3 || p.u !== schema.unit || p.q !== schema.courseId) throw new Error("Saved payload belongs to another profile or unit");
    const responses = reverseTokens(schema.responses, (x) => x.token), choices = reverseTokens(schema.choices, (x) => x.token), flags = reverseTokens(schema.flags, (x) => x);
    function pairs(rawPairs, map) {
      if (!Array.isArray(rawPairs)) throw new Error("Invalid compact entries");
      const result = /* @__PURE__ */ Object.create(null);
      for (const pair of rawPairs) {
        if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== "string" || typeof pair[1] !== "string" || !own(map, pair[0])) throw new Error("Unknown or malformed compact entry; original retained");
        const id = map[pair[0]];
        if (Object.prototype.hasOwnProperty.call(result, id)) throw new Error("Duplicate compact response would overwrite writing");
        result[id] = pair[1];
      }
      return result;
    }
    const decodedFlags = unpackFlags(p.f, schema, flags);
    let decodedChoices, visited;
    if (Array.isArray(p.p)) {
      decodedChoices = pairs(p.p, choices);
      visited = p.h;
    } else {
      checkIndexPacking(schema);
      object(p.p, "indexed choices");
      const entries = Object.entries(schema.choices);
      if (Object.keys(p.p).sort().join(",") !== "b,m,v" || p.p.v !== 1 || p.p.m !== schema.indexPacking.sha256 || typeof p.p.b !== "string" || p.p.b.length !== entries.length || !/^[0-9-]*$/.test(p.p.b)) throw new Error("Mismatched choice/route map; preserve original payload");
      decodedChoices = /* @__PURE__ */ Object.create(null);
      entries.forEach(([id, choice], index) => {
        const code = p.p.b[index];
        if (code === "-") return;
        const value = choice.values[Number(code)];
        if (value === void 0) throw new Error("Unknown indexed choice; preserve original payload");
        decodedChoices[id] = value;
      });
      if (!Array.isArray(p.h) || p.h.some((i) => !Number.isInteger(i) || i < 0 || i >= schema.routes.length) || new Set(p.h).size !== p.h.length) throw new Error("Invalid indexed visited routes");
      visited = p.h.map((i) => schema.routes[i]);
    }
    if (!Array.isArray(p.z) || p.z.some((x) => !Array.isArray(x) || x.length !== 2 || x.some((v) => typeof v !== "string"))) throw new Error("Invalid legacy archive");
    return validateTopicState({ version: 3, unit: schema.unit, ...schema.courseId ? { courseId: schema.courseId } : {}, updatedAt: p.t, route: p.l, ...p.a !== void 0 ? { vocabularyActiveId: p.a } : {}, responses: Array.isArray(p.r) ? pairs(p.r, responses) : unpackResponses(p.r, schema), choices: decodedChoices, flags: decodedFlags, visited, frayerChoices: p.w, legacy: p.z.map((x) => ({ source: x[0], original: x[1] })), ...p.k !== void 0 ? { wordFrayers: unpackWordFrayers(p.k, schema.wordFrayers) } : {} }, schema);
  }
  function migrateTopicWordFrayers(state, schema) {
    validateTopicState(state, schema);
    if (!schema.wordFrayers || state.wordFrayers !== void 0) return state;
    const next = structuredClone(state);
    next.wordFrayers = [];
    for (const id of [...schema.families.fixed, ...state.frayerChoices]) {
      const answers = schema.families.responseIds[id].map((field) => state.responses[field] ?? "");
      const collected = state.flags.includes(id + "-collected");
      if (answers.some((a) => a.length) || collected || state.frayerChoices.includes(id)) next.wordFrayers.push({ kind: "legacy", id, answers, collected });
    }
    for (const ids of Object.values(schema.families.responseIds)) for (const id of ids) delete next.responses[id];
    next.flags = next.flags.filter((flag) => !Object.keys(schema.families.responseIds).some((id) => flag === id + "-collected"));
    next.frayerChoices = [];
    validateTopicState(next, schema);
    encodeTopicState(next, schema);
    return next;
  }
  function replaceFrayerChoice(state, schema, oldId, nextId) {
    validateTopicState(state, schema);
    if (!schema.families.selectable.includes(nextId) || schema.families.fixed.includes(nextId)) throw new Error("Choose an eligible optional family");
    if (oldId && !state.frayerChoices.includes(oldId)) throw new Error("The replaced choice is not selected");
    if (oldId && schema.families.responseIds[oldId]?.some((id) => (state.responses[id] ?? "").length)) throw new Error("Copy and explicitly clear this written Frayer before replacement");
    const choices = state.frayerChoices.filter((id) => id !== oldId);
    if (choices.includes(nextId) || choices.length >= 2) throw new Error("Two different optional Frayer choices are allowed");
    return validateTopicState({ ...state, frayerChoices: [...choices, nextId] }, schema);
  }
  function clearFrayer(state, schema, familyId, confirmed) {
    if (!confirmed || !Object.prototype.hasOwnProperty.call(schema.families.responseIds, familyId)) throw new Error("Explicit scoped Frayer clear confirmation required");
    const responses = { ...state.responses };
    for (const id of schema.families.responseIds[familyId]) delete responses[id];
    return validateTopicState({ ...state, responses, flags: state.flags.filter((id) => id !== `${familyId}-collected`) }, schema);
  }
  var succeeded = (value) => value === true || value === "true";
  function persistTopicState(state, schema, local, lms) {
    let serialized;
    try {
      serialized = encodeTopicState(state, schema);
    } catch (error) {
      return { accepted: false, local: "not-attempted", setValue: "not-attempted", commit: "not-attempted", error: String(error) };
    }
    const outcome = { accepted: true, local: local ? "pending" : "unavailable", setValue: lms ? "pending" : "unavailable", commit: lms ? "not-attempted" : "unavailable", error: "" };
    const key = biologyRuntimeStorageKey(schema);
    if (local) try {
      const before = local.getItem(key);
      if (before) {
        decodeTopicState(before, schema);
        local.setItem(`${key}:previous`, before);
      }
      local.setItem(key, serialized);
      outcome.local = "saved";
    } catch (error) {
      outcome.local = "failed";
      outcome.error = String(error);
    }
    if (lms) try {
      if (succeeded(lms.setValue("cmi.suspend_data", serialized))) {
        outcome.setValue = "accepted";
        outcome.commit = succeeded(lms.commit()) ? "confirmed" : "failed";
      } else outcome.setValue = "failed";
    } catch (error) {
      if (outcome.setValue === "accepted") outcome.commit = "failed";
      else outcome.setValue = "failed";
      outcome.error = String(error);
    }
    return outcome;
  }

  // scripts/lib/biology30-course/v1/pilot2-legacy-work.ts
  var record = (value) => Boolean(value && typeof value === "object" && !Array.isArray(value));
  function validateLegacyRecord(item) {
    const data = JSON.parse(item.original);
    if (!item.source.trim()) throw new Error("Legacy source identity is required");
    const valid = item.kind === "compact-v2" ? record(data) && data.v === 2 : item.kind === "state-v1" ? record(data) && data.schemaVersion === 1 : item.kind === "responses" ? record(data) && Object.values(data).every((value) => typeof value === "string") : item.kind === "completions" ? Array.isArray(data) && data.every((value) => typeof value === "string") : item.kind === "notes" ? Array.isArray(data) && data.every(record) : false;
    if (!valid) throw new Error(`Unrecognized earlier ${item.kind} payload; retain original and use recovery`);
    return data;
  }
  function describeLegacyWork(original, schema) {
    let data;
    try {
      data = JSON.parse(original);
    } catch {
      return [{ label: "Unparsed earlier work", text: original }];
    }
    const entries = [];
    const text = (value) => typeof value === "string" ? value : JSON.stringify(value, null, 2);
    const reverse = (map) => Object.fromEntries(Object.entries(map).map(([id, token]) => [token, id]));
    const name = (value, map) => typeof value === "string" ? Object.hasOwn(map, value) ? map[value] : value : text(value);
    if (record(data) && data.v === 2) {
      const seen = /* @__PURE__ */ new Set();
      for (const [field, label, map] of [["r", "Earlier response", reverse(schema.responses)], ["p", "Earlier practice choice", reverse(schema.practice)]]) {
        if (!Array.isArray(data[field])) continue;
        seen.add(field);
        for (const pair of data[field]) {
          if (Array.isArray(pair) && pair.length === 2) entries.push({ label: `${label}: ${name(pair[0], map)}`, text: text(pair[1]) });
          else entries.push({ label: `${label}: unrecognized entry`, text: text(pair) });
        }
      }
      for (const [field, label, map] of [["c", "Earlier completion (not new completion)", reverse(schema.lessons)], ["a", "Earlier collected artifact", reverse(schema.artifacts)]]) {
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
          const definition = Array.isArray(row) && typeof row[0] === "string" ? interactions.get(row[0]) : void 0;
          entries.push({ label: `Earlier model: ${definition?.id ?? "unrecognized model"}`, text: definition && Array.isArray(row) && row.length === 3 ? `Selected: ${name(row[1], definition.options)}
Seen: ${Array.isArray(row[2]) ? row[2].map((value) => name(value, definition.options)).join(", ") : text(row[2])}` : text(row) });
        }
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

  // scripts/lib/biology30-course/v1/pilot2-restore.ts
  function inspectTopicRestore(sources, schema) {
    if (new Set(sources.map((source) => source.id)).size !== sources.length || sources.some((source) => !source.id || !source.label || typeof source.raw !== "string")) throw new Error("Invalid restore source inventory");
    const present = sources.filter((source) => source.raw.length > 0), candidates = [], issues = [];
    for (const source of present.filter((source2) => source2.role !== "legacy")) {
      try {
        const state = decodeTopicState(source.raw, schema), identity = encodeTopicState(state, schema), same = candidates.find((candidate) => encodeTopicState(candidate.state, schema) === identity);
        if (same) same.sources.push(source.id);
        else candidates.push({ id: source.id, label: source.label, state, sources: [source.id] });
      } catch (error) {
        issues.push({ source: source.id, message: String(error) });
      }
    }
    const legacy = present.filter((source) => source.role === "legacy");
    if (legacy.length) {
      try {
        const state = emptyTopicState(schema);
        state.legacy = legacy.map((source) => {
          if (!source.legacyKind) throw new Error("Earlier source kind is missing");
          validateLegacyRecord({ source: source.id, original: source.raw, kind: source.legacyKind });
          return { source: source.label, original: source.raw };
        });
        encodeTopicState(state, schema);
        candidates.push({ id: "preserved-earlier-work", label: "Preserve earlier work in the rebuilt course", state, sources: legacy.map((source) => source.id) });
      } catch (error) {
        issues.push({ source: "earlier-work", message: String(error) });
      }
    }
    const current = candidates.filter((candidate) => candidate.sources.some((id) => present.some((source) => source.id === id && source.role === "current")));
    const automatic = current.length === 1 && issues.length === 0 && legacy.length === 0 ? current[0] : null;
    return { sources: present, candidates, automaticId: automatic?.id ?? null, requiresChoice: present.length > 0 && !automatic, issues };
  }
  function readArchive(storage, key) {
    const raw = storage.getItem(key);
    if (raw === null) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data) || data.some((entry) => !entry || typeof entry.source !== "string" || typeof entry.label !== "string" || typeof entry.key !== "string") || new Set(data.map((entry) => entry.key)).size !== data.length) throw new Error("Recovery archive index is unreadable; preserve it before proceeding");
    return data;
  }
  function readTopicRecoveryArchive(storage, schema) {
    const prefix = `${biologyRuntimeStorageKey(schema)}:recovery`;
    return readArchive(storage, `${prefix}:index`).map((entry) => {
      if (!entry.key.startsWith(prefix + ":source:")) throw new Error("Recovery key outside the unit archive");
      const raw = storage.getItem(entry.key);
      if (raw === null) throw new Error("Recovery archive entry is missing");
      return { ...entry, raw };
    });
  }
  function activateTopicRestore(inspection, candidateId, schema, storage, confirmed) {
    if (inspection.requiresChoice && !confirmed) throw new Error("Choose and confirm the recovery version first");
    const candidate = inspection.candidates.find((candidate2) => candidate2.id === candidateId);
    if (!candidate) throw new Error("Unknown recovery candidate");
    const payload = encodeTopicState(candidate.state, schema), prefix = `${biologyRuntimeStorageKey(schema)}:recovery`, indexKey = `${prefix}:index`, originalIndex = storage.getItem(indexKey);
    const archive = readTopicRecoveryArchive(storage, schema).map(({ source, label, key }) => ({ source, label, key }));
    for (const source of inspection.sources) {
      let key = "";
      for (let slot = 0; slot < 1e3; slot++) {
        const proposed = `${prefix}:source:${encodeURIComponent(source.id)}:${slot}`, existing = storage.getItem(proposed);
        if (existing === null || existing === source.raw) {
          key = proposed;
          break;
        }
      }
      if (!key) throw new Error("Recovery archive capacity reached; original work remains in place");
      if (storage.getItem(key) === null) storage.setItem(key, source.raw);
      if (storage.getItem(key) !== source.raw) throw new Error("Recovery backup was not verified");
      if (!archive.some((entry) => entry.key === key)) archive.push({ source: source.id, label: source.label, key });
    }
    if (storage.getItem(indexKey) !== originalIndex) throw new Error("Recovery archive changed during preparation");
    const archived = JSON.stringify(archive);
    storage.setItem(indexKey, archived);
    if (storage.getItem(indexKey) !== archived) throw new Error("Recovery archive index was not verified");
    const active = biologyRuntimeStorageKey(schema);
    const local = inspection.sources.find((source) => source.id === active);
    if (local && storage.getItem(active) !== local.raw) throw new Error("Local work changed while recovery was open; inspect it again");
    if (!local && storage.getItem(active) !== null) throw new Error("Local work appeared while recovery was open; inspect it again");
    storage.setItem(active, payload);
    if (storage.getItem(active) !== payload) throw new Error("Chosen recovery version was not verified; original backups remain");
    return { state: structuredClone(candidate.state), archive };
  }

  // scripts/lib/biology30-course/v1/pilot2-browser-environment.ts
  var succeeded2 = (value) => value === true || value === "true";
  var isApi = (value) => !!value && typeof value === "object" && ["Initialize", "GetValue", "GetLastError", "SetValue", "Commit", "Terminate"].every((key) => typeof value[key] === "function");
  function findTopicLms(host) {
    const queue = [host], seen = /* @__PURE__ */ new Set();
    while (queue.length && seen.size < 32) {
      const next = queue.shift();
      if (seen.has(next)) continue;
      seen.add(next);
      try {
        if (isApi(next.API_1484_11)) return next.API_1484_11;
      } catch {
      }
      for (const key of ["parent", "opener"]) try {
        const related = next[key];
        if (related && !seen.has(related)) queue.push(related);
      } catch {
      }
    }
    return null;
  }
  function connectTopicLms(host) {
    const api = findTopicLms(host);
    let active = false, raw = null;
    if (api) {
      if (!succeeded2(api.Initialize(""))) throw new Error("The learning platform could not open the saved-work session. Reload before editing.");
      active = true;
      try {
        const value = api.GetValue("cmi.suspend_data");
        if (String(api.GetLastError()) !== "0" || typeof value !== "string") throw new Error("The learning platform could not read the saved work.");
        raw = value;
      } catch (error) {
        try {
          api.Terminate("");
        } catch {
        }
        active = false;
        throw error;
      }
    }
    const adapter = api ? { setValue(name, value) {
      return active ? api.SetValue(name, value) : false;
    }, commit() {
      return active ? api.Commit("") : false;
    } } : null;
    return { raw, adapter, close() {
      if (!api || !active) return null;
      active = false;
      return api.Terminate("");
    } };
  }
  function captureTopicSources(unit, local, lmsRaw, courseId) {
    const identity = { unit, courseId }, base = biologyRuntimeStorageBase(identity), key = biologyRuntimeStorageKey(identity), sources = [];
    const add = (id, label, raw, role, legacyKind) => {
      if (raw !== null && raw !== "") sources.push({ id, label, raw, role, ...legacyKind ? { legacyKind } : {} });
    };
    if (local) {
      add(key, "This device", local.getItem(key), "current");
      add(`${key}:previous`, "Previous device save", local.getItem(`${key}:previous`), "previous");
      if (!courseId) for (const [suffix, label, kind] of [["state:v1", "Earlier course work", "state-v1"], ["responses", "Earlier written responses", "responses"], ["complete", "Earlier completion markers", "completions"], ["manual-evidence-notes", "Earlier notebook entries", "notes"]]) add(`${base}:${suffix}`, label, local.getItem(`${base}:${suffix}`), "legacy", kind);
    }
    if (lmsRaw !== null && lmsRaw !== "") {
      let kind;
      if (!courseId) try {
        const value = JSON.parse(lmsRaw);
        if (value && typeof value === "object") {
          if (value.v === 2) kind = "compact-v2";
          else if (value.schemaVersion === 1) kind = "state-v1";
        }
      } catch {
      }
      add("lms", "Learning platform save", lmsRaw, kind ? "legacy" : "current", kind);
    }
    const archive = local && sources.some((source) => source.role === "current") ? readTopicRecoveryArchive(local, identity) : [];
    return sources.filter((source) => source.role !== "legacy" || !archive.some((entry) => entry.source === source.id && entry.raw === source.raw));
  }
  function captureTopicEnvironment(host, unit, courseId) {
    const local = host.localStorage ?? null, connection = connectTopicLms(host);
    try {
      return { local, lms: connection.adapter, sources: captureTopicSources(unit, local, connection.raw, courseId), close: connection.close };
    } catch (error) {
      try {
        connection.close();
      } catch {
      }
      throw error;
    }
  }

  // scripts/lib/biology30-course/v1/pilot2-render-common.ts
  var topicHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  function renderTopicDataset(data, caption) {
    if (!data.columns.length || data.rows.some((row) => row.length !== data.columns.length)) throw new Error("Dataset table column inventory drift");
    return `<div class="p2-table-scroll" role="region" aria-label="${topicHtml(caption)}" tabindex="0"><table><caption>${topicHtml(caption)}</caption><thead><tr>${data.columns.map((column) => `<th scope="col">${topicHtml(column)}</th>`).join("")}</tr></thead><tbody>${data.rows.map((row) => `<tr>${row.map((cell, index) => index ? `<td>${topicHtml(cell)}</td>` : `<th scope="row">${topicHtml(cell)}</th>`).join("")}</tr>`).join("")}</tbody></table></div>${data.sourceRole ? `<p>${topicHtml(data.sourceRole)}</p>` : ""}`;
  }

  // scripts/lib/biology30-course/v1/pilot2-recovery-view.ts
  function renderTopicRecovery(inspection) {
    return `<section class="p2-topic p2-recovery" aria-label="Saved work recovery"><h1>Choose the work to continue</h1><p>More than one version or an unreadable save needs attention. Your original work stays available below. Continuing keeps verified copies before changing the active save on this device.</p>${inspection.candidates.length ? `<label>Version to continue<select data-pilot2-recovery-choice><option value="">Choose a version\u2026</option>${inspection.candidates.map((candidate) => `<option value="${topicHtml(candidate.id)}">${topicHtml(candidate.label)}</option>`).join("")}</select></label><p data-pilot2-recovery-summary></p><label><input type="checkbox" data-pilot2-recovery-confirm> Continue with this version and keep copies of the originals.</label><button type="button" data-pilot2-recovery-continue disabled>Keep originals and continue</button>` : "<p>No complete version can be opened safely. Keep the original text below for recovery; nothing has been reset.</p>"}<p data-pilot2-recovery-status role="status"></p>${inspection.sources.map((source) => `<details><summary>${topicHtml(source.label)} \u2014 original saved work</summary><textarea readonly rows="10" aria-label="${topicHtml(source.label)} original saved work">${topicHtml(source.raw)}</textarea></details>`).join("")}</section>`;
  }
  function mountTopicRecovery(root, inspection, schema, storage, onReady) {
    const choose = root.querySelector("[data-pilot2-recovery-choice]"), confirm = root.querySelector("[data-pilot2-recovery-confirm]"), button = root.querySelector("[data-pilot2-recovery-continue]"), status = root.querySelector("[data-pilot2-recovery-status]");
    if (!status) throw new Error("Missing recovery status");
    const update = () => {
      if (button) button.disabled = !storage || !choose?.value || !confirm?.checked;
      const candidate = inspection.candidates.find((candidate2) => candidate2.id === choose?.value), summary = root.querySelector("[data-pilot2-recovery-summary]");
      if (summary) summary.textContent = candidate ? `${Object.values(candidate.state.responses).filter((value) => value.trim()).length} written responses.${Date.parse(candidate.state.updatedAt) > 0 ? " Saved " + new Date(candidate.state.updatedAt).toLocaleString() + "." : ""}` : "";
    };
    if (!storage) status.textContent = "Device storage is unavailable. Keep the original text before leaving; no save will be replaced.";
    const continueWork = () => {
      if (!button || button.disabled || !storage || !choose || !confirm) return;
      try {
        const result = activateTopicRestore(inspection, choose.value, schema, storage, confirm.checked);
        button.disabled = true;
        onReady(result.state);
      } catch {
        status.textContent = "Recovery could not be completed. The originals remain available. Keep a copy and reopen this page before trying again.";
      }
    };
    choose?.addEventListener("change", update);
    confirm?.addEventListener("change", update);
    button?.addEventListener("click", continueWork);
    update();
    return { dispose() {
      choose?.removeEventListener("change", update);
      confirm?.removeEventListener("change", update);
      button?.removeEventListener("click", continueWork);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-source-videos.ts
  function mountSourceVideos(root) {
    const items = [...root.querySelectorAll("[data-p2-source-video]")];
    let frame = 0;
    const refresh = () => {
      for (const item of items) {
        const host = item.querySelector("[data-p2-source-video-host]"), box = item.getBoundingClientRect(), visible = !item.closest("[hidden]") && box.width > 0 && box.bottom > 0 && box.top < innerHeight;
        const player = host.querySelector("iframe");
        if (!visible) {
          player?.remove();
          continue;
        }
        if (item.dataset.p2SourcePreview !== "true") continue;
        if (!navigator.onLine) {
          host.textContent = "You are offline. Use the illustrated walkthrough linked below.";
          continue;
        }
        if (location.protocol === "file:" && item.hasAttribute("data-p2-source-require-http")) {
          player?.remove();
          host.textContent = "Embedded playback needs the local web preview or hosted course. Use Watch on YouTube below to view this PowerPoint video, or use the illustrated walkthrough.";
          continue;
        }
        if (player) continue;
        const id = item.dataset.p2SourceVideo;
        if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw Error("Invalid source video ID");
        const iframe = root.ownerDocument.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=0&rel=0&playsinline=1&cc_load_policy=1`;
        iframe.title = item.querySelector("h3").textContent;
        iframe.allow = "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        host.replaceChildren(iframe);
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refresh);
    };
    root.addEventListener("click", schedule);
    window.addEventListener("hashchange", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("online", schedule);
    window.addEventListener("offline", schedule);
    schedule();
    return { dispose() {
      cancelAnimationFrame(frame);
      root.removeEventListener("click", schedule);
      window.removeEventListener("hashchange", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("online", schedule);
      window.removeEventListener("offline", schedule);
      items.forEach((i) => i.querySelector("iframe")?.remove());
    } };
  }

  // scripts/lib/biology30-vocabulary/word-record.ts
  var escape = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  function renderBiologyWordDetails(word2, words, categories = []) {
    const section = (title, text) => `<section><h3 class="section-label">${title}</h3><p>${escape(text)}</p></section>`;
    const labels2 = word2.categoryIds.map((id) => categories.find((c) => c.id === id)?.label).filter(Boolean).join(" \xB7 ");
    const related = word2.relatedTermIds.map((id) => {
      const related2 = words.find((w) => w.id === id);
      if (!related2) throw Error("Unknown related word " + id);
      return related2.term;
    }).join(" \xB7 ");
    const structure = word2.structure.parts?.length ? '<section><h3 class="section-label">Word structure</h3><dl class="word-parts">' + word2.structure.parts.map((p) => "<div><dt>" + escape(p.text) + "</dt><dd>" + escape(p.meaning) + "</dd></div>").join("") + "</dl>" + (word2.structure.caution ? '<p class="caution-line"><strong>Use with care:</strong> ' + escape(word2.structure.caution) + "</p>" : "") + "</section>" : section("Word structure", word2.structure.text);
    return `<div data-biology-word-details="${escape(word2.id)}">${labels2 ? `<p class="eyebrow">${escape(labels2)}</p>` : ""}<h2 tabindex="-1">${escape(word2.term)}</h2>${section("Meaning", word2.definition)}${structure}${section("What it does", word2.whatItDoes)}<section class="concept-contrast"><div><h3>Related ideas</h3><p>${escape(related)}</p></div><div><h3>Common confusion</h3><p>${escape(word2.commonConfusion)}</p></div></section><section class="retrieval-mini"><h3>Retrieve the idea</h3><p>${escape(word2.retrievalPrompt)}</p></section></div>`;
  }

  // scripts/lib/biology30-vocabulary/panel.ts
  var VOCABULARY_PANEL_CSS = `
button.bio-term{display:inline;min-height:0;padding:0;border:0;border-radius:0;background:none;color:inherit;font:inherit;text-align:inherit;text-decoration:underline dotted;text-underline-offset:.2em;cursor:pointer}
button.bio-term:hover,button.bio-term:focus-visible{text-decoration-style:solid;outline-offset:3px}
dialog.bio-vocabulary{position:fixed;inset:0 0 0 auto;margin:0;width:min(36rem,100%);height:100dvh;max-height:100dvh;max-width:100%;box-sizing:border-box;border:0;border-left:1px solid var(--border,#ccc);border-radius:0;background:var(--surface,#fff);color:var(--ink,#222);padding:1.25rem;overflow:auto;overscroll-behavior:contain}
dialog.bio-vocabulary::backdrop{background:#0005}
.bio-vocabulary header{display:flex;align-items:start;justify-content:space-between;gap:1rem}
.bio-vocabulary h2{margin:0 0 1rem}.bio-vocabulary p{line-height:1.6}
.bio-vocabulary button,.bio-vocabulary select,.bio-vocabulary summary{min-height:44px;font:inherit}
.bio-vocabulary label{display:block}.bio-vocabulary select{max-width:100%;width:100%}
.bio-vocabulary textarea{display:block;box-sizing:border-box;width:100%;font:inherit;line-height:1.5;resize:vertical;padding:.6rem}
.bio-vocabulary .frayer-grid{grid-template-columns:1fr}.bio-vocabulary .save-row{flex-wrap:wrap}
.bio-vocabulary :focus-visible{outline:3px solid currentColor;outline-offset:3px}
.bio-vocabulary [hidden]{display:none!important}
.bio-vocabulary [data-bio-save-status]{position:sticky;bottom:0;background:var(--surface,#fff);padding:.5rem 0}
@media(max-width:600px){dialog.bio-vocabulary{width:100%;border:0;padding:1rem}}
@media print{dialog.bio-vocabulary{display:none!important}button.bio-term{text-decoration:none}}
`;
  var excluded = 'a,button,nav,summary,label,input,textarea,select,[contenteditable]:not([contenteditable="false"]),script,style,dialog,.stop-check,.guided-practice,.p2-writing,.p2-practice,[data-practice-id],[data-checkpoint],.word-lens';
  var word = (value) => Boolean(value && /[\p{L}\p{N}_]/u.test(value));
  function termMatches(text, terms, seen = /* @__PURE__ */ new Set()) {
    const names = [...new Set(terms.map((t) => t.toLocaleLowerCase()))].sort((a, b) => b.length - a.length), lower = text.toLocaleLowerCase();
    const matches = [];
    for (let i = 0; i < text.length; ) {
      const name = names.find((name2) => !seen.has(name2) && lower.startsWith(name2, i) && !word(text[i - 1]) && !word(text[i + name2.length]));
      if (name) {
        matches.push({ start: i, end: i + name.length, term: name });
        seen.add(name);
        i += name.length;
      } else i++;
    }
    return matches;
  }
  function mountVocabularyPanel(adapter) {
    const { root } = adapter, doc = root.ownerDocument, win = doc.defaultView;
    const terms = /* @__PURE__ */ new Map();
    for (const item of adapter.terms) {
      const key = item.term.toLocaleLowerCase(), old = terms.get(key);
      terms.set(key, old ? { ...old, familyIds: [.../* @__PURE__ */ new Set([...old.familyIds, ...item.familyIds])] } : item);
    }
    const style = doc.createElement("style");
    style.textContent = VOCABULARY_PANEL_CSS;
    root.append(style);
    const dialog = doc.createElement("dialog");
    dialog.className = "bio-vocabulary";
    dialog.dataset.testid = "vocabulary-panel";
    dialog.setAttribute("aria-labelledby", "bio-vocabulary-title");
    dialog.innerHTML = '<header><h2 id="bio-vocabulary-title"></h2><button type="button" data-bio-close aria-label="Close vocabulary">Close</button></header><label data-bio-family-label>Concept family<select data-bio-family></select></label><div data-bio-meaning></div><details data-bio-frayer><summary>My Frayer</summary><p data-bio-locked></p><div data-bio-frayer-slot></div><div data-bio-choices-slot></div></details><p data-bio-save-status role="status" aria-live="polite"></p>';
    root.append(dialog);
    const get = (selector) => dialog.querySelector(selector);
    const familySelect = get("[data-bio-family]"), meaning = get("[data-bio-meaning]"), slot = get("[data-bio-frayer-slot]");
    let trigger = null, current = null;
    let loans = [], scrolls = [], windowScroll = [0, 0], oldOverflow = "";
    const restoreLoans = () => {
      for (const { node, marker } of loans) {
        marker.replaceWith(node);
      }
      loans = [];
    };
    const loan = (node, target) => {
      if (!node) return;
      const marker = doc.createComment("Frayer home");
      node.before(marker);
      loans.push({ node, marker });
      target.append(node);
    };
    const status = () => {
      get("[data-bio-save-status]").textContent = adapter.status();
    };
    function showFamily() {
      restoreLoans();
      meaning.replaceChildren();
      const family = adapter.families.find((f) => f.id === familySelect.value);
      if (!family || !current) return;
      const paragraph = (text) => {
        const p = doc.createElement("p");
        p.textContent = text;
        meaning.append(p);
      };
      const belongs = current.familyIds.includes(family.id);
      const wordRecord = adapter.words?.find((w) => w.term.toLocaleLowerCase() === current.term.toLocaleLowerCase());
      if (adapter.words && !wordRecord) throw Error("Missing word-owned popup record: " + current.term);
      if (wordRecord) {
        meaning.innerHTML = renderBiologyWordDetails(wordRecord, adapter.words, adapter.families);
        const owner = adapter.wordFrayers?.[wordRecord.id];
        const unlocked2 = Boolean(owner && adapter.unlocked(owner));
        get("[data-bio-locked]").textContent = !owner ? "This word is available for reference. It is not a separate saved Frayer target. Existing broader-concept writing remains in Core Vocabulary." : unlocked2 ? "This is the existing saved Frayer record. Review its stated scope before revising earlier writing." : "The word explanation is available now. Begin its associated lesson to unlock the saved Frayer.";
        if (unlocked2) {
          loan(adapter.frayer(owner), slot);
          loan(adapter.choices?.() ?? null, get("[data-bio-choices-slot]"));
          adapter.refresh();
        }
        status();
        return;
      }
      paragraph(belongs && current.definition ? current.definition : `${belongs ? "Family-level explanation" : "My chosen Frayer"} \u2014 ${family.label}: ${family.meaning}`);
      if (belongs && current.definition) paragraph(`Concept family \u2014 ${family.label}: ${family.meaning}`);
      const heading = doc.createElement("h3");
      heading.textContent = "Word structure";
      meaning.append(heading);
      for (const note of family.wordAnalysis) paragraph(note);
      const unlocked = adapter.unlocked(family.id);
      get("[data-bio-locked]").textContent = unlocked ? "The same Frayer and saved work as Core Vocabulary. Six anchors and two learner choices." : "The meaning is available now. Begin the associated lesson to unlock this Frayer.";
      if (unlocked) {
        loan(adapter.frayer(family.id), slot);
        loan(adapter.choices?.() ?? null, get("[data-bio-choices-slot]"));
        adapter.refresh();
      }
      status();
    }
    const close = () => {
      if (dialog.open) dialog.close();
    };
    const onClose = () => {
      restoreLoans();
      root.dispatchEvent(new CustomEvent("biology-word-popup-close"));
      doc.documentElement.style.overflow = oldOverflow;
      for (const item of scrolls) {
        item.node.scrollLeft = item.x;
        item.node.scrollTop = item.y;
      }
      win.scrollTo(...windowScroll);
      trigger?.focus({ preventScroll: true });
    };
    const click = (event) => {
      const target = event.target instanceof Element ? event.target.closest("[data-bio-term]") : null;
      if (!target || !root.contains(target)) return;
      current = terms.get(target.dataset.bioTerm) ?? null;
      if (!current) return;
      trigger = target;
      root.dispatchEvent(new CustomEvent("biology-word-popup-open"));
      const route = target.dataset.bioTermRoute;
      familySelect.replaceChildren();
      for (const family of adapter.families.filter((f) => current.familyIds.includes(f.id)).sort((a, b) => Number(b.routes.includes(route)) - Number(a.routes.includes(route)))) {
        const option = doc.createElement("option");
        option.value = family.id;
        option.textContent = family.label;
        familySelect.append(option);
      }
      for (const id of adapter.words ? [] : adapter.selectedFamilies?.() ?? []) {
        if (current.familyIds.includes(id)) continue;
        const family = adapter.families.find((f) => f.id === id);
        if (family) {
          const option = doc.createElement("option");
          option.value = id;
          option.textContent = `My chosen Frayer: ${family.label}`;
          familySelect.append(option);
        }
      }
      get("[data-bio-family-label]").hidden = familySelect.options.length < 2;
      get("#bio-vocabulary-title").textContent = target.textContent;
      get("[data-bio-frayer]").open = false;
      windowScroll = [win.scrollX, win.scrollY];
      scrolls = [];
      for (let parent = target.parentElement; parent; parent = parent.parentElement) scrolls.push({ node: parent, x: parent.scrollLeft, y: parent.scrollTop });
      oldOverflow = doc.documentElement.style.overflow;
      showFamily();
      dialog.showModal();
      doc.documentElement.style.overflow = "hidden";
      get("[data-bio-close]").focus({ preventScroll: true });
    };
    for (const section of adapter.sections()) {
      const seen = /* @__PURE__ */ new Set(), walker = doc.createTreeWalker(section, win.NodeFilter.SHOW_TEXT), nodes = [];
      while (walker.nextNode()) {
        const text = walker.currentNode;
        if (text.parentElement && !text.parentElement.closest(excluded)) nodes.push(text);
      }
      for (const node of nodes) {
        const matches = termMatches(node.data, [...terms.keys()], seen);
        if (!matches.length) continue;
        const fragment = doc.createDocumentFragment();
        let position = 0;
        for (const match of matches) {
          fragment.append(node.data.slice(position, match.start));
          const button = doc.createElement("button");
          button.type = "button";
          button.className = "bio-term";
          button.dataset.bioTerm = match.term;
          button.dataset.bioTermRoute = adapter.route(section);
          button.setAttribute("aria-haspopup", "dialog");
          button.setAttribute("aria-label", `Vocabulary: ${node.data.slice(match.start, match.end)}`);
          button.textContent = node.data.slice(match.start, match.end);
          fragment.append(button);
          position = match.end;
        }
        fragment.append(node.data.slice(position));
        node.replaceWith(fragment);
      }
    }
    const afterInput = () => win.setTimeout(status, 0);
    root.addEventListener("click", click);
    dialog.addEventListener("close", onClose);
    get("[data-bio-close]").addEventListener("click", close);
    familySelect.addEventListener("change", showFamily);
    dialog.addEventListener("input", afterInput);
    dialog.addEventListener("change", afterInput);
    dialog.addEventListener("click", afterInput);
    win.addEventListener("hashchange", close);
    return { dispose() {
      close();
      restoreLoans();
      root.removeEventListener("click", click);
      win.removeEventListener("hashchange", close);
      dialog.remove();
      style.remove();
    } };
  }

  // scripts/lib/biology30-vocabulary/word-reader.ts
  function mountBiologyWordReader(root) {
    const views = [...root.querySelectorAll("[data-biology-word-view]")];
    const buttons = [...root.querySelectorAll("[data-biology-select-word]")];
    const select = (id, focus) => {
      const view = views.find((v) => v.dataset.biologyWordView === id);
      if (!view) return;
      for (const v of views) v.hidden = v !== view;
      for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.biologySelectWord === id));
      if (focus) {
        const heading = view.querySelector("h2");
        heading?.focus({ preventScroll: true });
        heading?.scrollIntoView({ block: "start" });
      }
      root.dispatchEvent(new CustomEvent("biology-word-selected", { bubbles: true, detail: { wordId: id } }));
    };
    const click = (event) => {
      const button = event.target.closest("[data-biology-select-word]");
      if (button && root.contains(button)) select(button.dataset.biologySelectWord, true);
    };
    root.addEventListener("click", click);
    if (views[0]) select(views[0].dataset.biologyWordView, false);
    return { selectWord: (id) => select(id, true), dispose: () => root.removeEventListener("click", click) };
  }

  // scripts/lib/biology30-vocabulary/word-page-runtime.ts
  function mountTopicWordPage(root, data, unlocked, refresh, learned = () => false) {
    const reader = root.querySelector("[data-biology-word-reader]");
    if (!reader) return { dispose() {
    } };
    const doc = root.ownerDocument;
    let selected = "", loanWord = "", suspended = false, loans = [];
    const restore = () => {
      for (const { node, marker } of loans) marker.replaceWith(node);
      loans = [];
      loanWord = "";
    };
    const loan = (node, slot) => {
      if (!node) return;
      const marker = doc.createComment("Original saved-control home");
      node.before(marker);
      loans.push({ node, marker });
      slot.append(node);
    };
    function show() {
      for (const button of reader.querySelectorAll("[data-biology-select-word]")) {
        const label = button.querySelector("[data-biology-word-state]");
        if (label) label.textContent = data.wordRoutes?.[button.dataset.biologySelectWord] && learned(data.wordRoutes[button.dataset.biologySelectWord]) ? "Learned" : "Reference available";
      }
      if (suspended) return;
      if (loanWord === selected && loans.length && unlocked(data.wordFrayers[selected])) return;
      restore();
      const view = [...reader.querySelectorAll("[data-biology-word-view]")].find((n) => n.dataset.biologyWordView === selected);
      if (!view) return;
      const owner = data.wordFrayers[selected], status = view.querySelector("[data-biology-word-frayer-status]");
      status.textContent = !owner ? "This word has a reference entry, but no separate saved Frayer is required. The module retains six anchors and two learner choices." : !unlocked(owner) ? "Begin the associated lesson to unlock this saved Frayer. The word explanation is available now." : "This is the same saved writing used in the lesson vocabulary panel.";
      if (owner && unlocked(owner)) {
        const slot = view.querySelector("[data-biology-word-frayer-slot]");
        loan(root.querySelector(`[data-biology-frayer-record="${CSS.escape(owner)}"]`), slot);
        loan(root.querySelector(".p2-family-choices"), slot);
        loanWord = selected;
      }
    }
    const select = (event) => {
      selected = event.detail.wordId;
      show();
      refresh();
    };
    reader.addEventListener("biology-word-selected", select);
    const controller = mountBiologyWordReader(reader);
    const pause = () => {
      suspended = true;
      restore();
    };
    const resume = () => {
      suspended = false;
      show();
    };
    const reveal = (event) => {
      const target = event.detail;
      const record2 = target?.closest("[data-biology-frayer-record]")?.dataset.biologyFrayerRecord ?? target?.closest("[data-p2-family-panel]")?.dataset.p2FamilyPanel;
      if (!record2) return;
      const id = Object.keys(data.wordFrayers).find((id2) => data.wordFrayers[id2] === record2);
      if (id) {
        controller.selectWord(id);
        const view = reader.querySelector(`[data-biology-word-view="${CSS.escape(id)}"]`);
        const details = view?.querySelector("[data-biology-word-frayer]");
        if (details) details.open = true;
      }
    };
    root.addEventListener("biology-word-popup-open", pause);
    root.addEventListener("biology-word-popup-close", resume);
    root.addEventListener("pilot2-reveal-target", reveal);
    root.addEventListener("pilot2-state-change", show);
    return { dispose() {
      restore();
      controller.dispose();
      reader.removeEventListener("biology-word-selected", select);
      root.removeEventListener("biology-word-popup-open", pause);
      root.removeEventListener("biology-word-popup-close", resume);
      root.removeEventListener("pilot2-reveal-target", reveal);
      root.removeEventListener("pilot2-state-change", show);
    } };
  }

  // scripts/lib/biology30-vocabulary/word-frayer-runtime.ts
  var esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  var labels = ["My definition in context", "Essential characteristics or mechanism", "Example or evidence", "Non-example or common confusion"];
  function mountWordFrayerControls(root, data, schema, owner) {
    const reader = root.querySelector("[data-biology-word-reader]"), controller = mountBiologyWordReader(reader);
    const legacy = root.ownerDocument.createElement("section");
    legacy.className = "collection-section";
    legacy.dataset.wordLegacy = "";
    reader.after(legacy);
    const status = (message) => {
      root.querySelectorAll("[data-word-save-status]").forEach((n) => n.textContent = message);
    };
    const summary = () => {
      const slots = owner.get();
      const progress = root.querySelector("[data-p2-vocabulary-progress]");
      if (progress) progress.textContent = `${slots.filter((s) => s.collected).length} of 8`;
    };
    function render() {
      for (const word2 of data.words) {
        let node = root.querySelector(`[data-word-frayer="${CSS.escape(word2.id)}"]`);
        if (!node) {
          const view = reader.querySelector(`[data-biology-word-view="${CSS.escape(word2.id)}"]`);
          view.querySelector("[data-biology-word-frayer]")?.remove();
          node = root.ownerDocument.createElement("section");
          node.className = "frayer";
          node.dataset.wordFrayer = word2.id;
          node.id = "word-frayer-" + word2.id;
          view.append(node);
        }
        const slot = owner.get().find((s) => s.kind === "word" && s.id === word2.id);
        node.innerHTML = `<div class="frayer-heading"><div><p class="section-label">Frayer model</p><h3>${esc(word2.term)}</h3></div></div>` + (slot ? `<div class="frayer-grid">${labels.map((label, i) => `<label>${label}<textarea rows="3" data-word-answer="${i}" aria-label="${esc(word2.term + ": " + label)}">${esc(slot.answers[i])}</textarea><small>Up to ${schema.limit} characters. Longer drafts stay visible but are not saved.</small></label>`).join("")}</div><div class="save-row"><button type="button" data-word-collect>${slot.collected ? "Remove from Process Collection" : "Add to Process Collection"}</button><button type="button" class="text-link" data-word-copy>Copy my Frayer</button></div><details><summary>Remove this word and free a slot</summary><p>This removes only this word\u2019s four answers and collection status. Copy your writing first.</p><label><input type="checkbox" data-word-remove-confirm> I want to remove this word and its writing.</label><button type="button" data-word-remove>Remove this word</button></details>` : `<p>Choose any eight words. Choosing opens an empty Frayer; it does not fill in your answers.</p><button type="button" data-word-choose>Choose this word</button>`) + `<p data-word-save-status role="status" aria-live="polite"></p>`;
        if (slot && word2.modelFrayer) {
          const button = root.ownerDocument.createElement("button");
          button.type = "button";
          button.dataset.wordCompare = "";
          button.textContent = "Compare with course model";
          button.disabled = slot.answers.some((a) => !a.trim() || a.length > schema.limit);
          const guide = root.ownerDocument.createElement("div");
          guide.className = "course-model";
          guide.dataset.wordModel = "";
          guide.hidden = true;
          guide.innerHTML = "<h4>Course model for " + esc(word2.term) + "</h4><dl>" + word2.modelFrayer.map((a, i) => "<div><dt>" + labels[i] + "</dt><dd>" + esc(a) + "</dd></div>").join("") + "</dl>";
          node.append(button, guide);
        }
      }
      const old = owner.get().filter((s) => s.kind === "legacy");
      legacy.hidden = !old.length;
      legacy.innerHTML = "<h2>Preserved earlier Frayers</h2><p>These retain their original category labels and writing. Each occupies one of the eight slots until you explicitly remove it. No writing has been assigned to a different word.</p>" + old.map((s) => `<article data-word-legacy-record="${esc(s.id)}"><h3>${esc(data.categories.find((c) => c.id === s.id)?.label ?? s.id)}</h3><dl>${s.answers.map((a, i) => `<div><dt>${labels[i]}</dt><dd>${esc(a)}</dd></div>`).join("")}</dl><button type="button" class="text-link" data-word-copy>Copy earlier Frayer</button><label><input type="checkbox" data-word-remove-confirm> I have kept a copy and want to remove this earlier Frayer.</label><button type="button" data-word-remove>Remove earlier Frayer and free a slot</button><p data-word-save-status role="status"></p></article>`).join("");
      summary();
    }
    const transact = (next) => {
      const before = owner.get();
      owner.set(next);
      const result = owner.save();
      if (!result.saved) {
        owner.set(before);
        status(result.message);
        return false;
      }
      render();
      status(result.message);
      return true;
    };
    const input = (event) => {
      const field = event.target;
      if (!field.matches("textarea[data-word-answer]")) return;
      const id = field.closest("[data-word-frayer]").dataset.wordFrayer, slot = owner.get().find((s) => s.kind === "word" && s.id === id);
      slot.answers[Number(field.dataset.wordAnswer)] = field.value;
      slot.collected = false;
      const result = owner.save();
      status(result.message);
      summary();
      const collect = field.closest("[data-word-frayer]").querySelector("[data-word-collect]");
      collect.textContent = "Add to Process Collection";
      const compare = field.closest("[data-word-frayer]").querySelector("[data-word-compare]");
      if (compare) {
        compare.disabled = slot.answers.some((a) => !a.trim() || a.length > schema.limit);
        if (compare.disabled) field.closest("[data-word-frayer]").querySelector("[data-word-model]").hidden = true;
      }
    };
    const click = async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const node = button.closest("[data-word-frayer],[data-word-legacy-record]");
      if (!node) return;
      const kind = node.hasAttribute("data-word-frayer") ? "word" : "legacy", id = node.dataset.wordFrayer ?? node.dataset.wordLegacyRecord;
      try {
        if (button.hasAttribute("data-word-compare")) {
          const slot2 = owner.get().find((s) => s.kind === kind && s.id === id);
          if (slot2?.answers.every((a) => a.trim() && a.length <= schema.limit)) {
            const guide = node.querySelector("[data-word-model]");
            if (guide) guide.hidden = !guide.hidden;
          }
        }
        if (button.hasAttribute("data-word-choose")) transact(chooseWord(owner.get(), schema, id));
        if (button.hasAttribute("data-word-remove")) transact(removeWordFrayer(owner.get(), schema, kind, id, Boolean(node.querySelector("[data-word-remove-confirm]")?.checked)));
        const slot = owner.get().find((s) => s.kind === kind && s.id === id);
        if (button.hasAttribute("data-word-collect") && slot) {
          const next = structuredClone(owner.get()), target = next.find((s) => s.kind === kind && s.id === id);
          if (!target.collected && target.answers.some((a) => !a.trim() || a.length > schema.limit)) throw Error("Complete all four fields within their limits before collecting.");
          target.collected = !target.collected;
          transact(next);
        }
        if (button.hasAttribute("data-word-copy") && slot) {
          const text = [node.querySelector("h3").textContent, ...slot.answers.map((a, i) => labels[i] + ": " + a)].join("\n\n");
          try {
            await navigator.clipboard.writeText(text);
            status("Frayer copied.");
          } catch {
            let copy = node.querySelector("[data-word-copy-fallback]");
            if (!copy) {
              copy = root.ownerDocument.createElement("textarea");
              copy.dataset.wordCopyFallback = "";
              copy.readOnly = true;
              copy.setAttribute("aria-label", "Copy of this Frayer");
              node.append(copy);
            }
            copy.value = text;
            copy.focus();
            copy.select();
            status("Clipboard unavailable. Copy the selected text manually before removing.");
          }
        }
      } catch (error) {
        status(String(error).replace(/^Error: /, ""));
      }
    };
    const reveal = (event) => {
      const target = event.detail;
      const id = target?.closest("[data-word-frayer]")?.dataset.wordFrayer;
      if (id) controller.selectWord(id);
    };
    root.addEventListener("input", input);
    root.addEventListener("click", click);
    root.addEventListener("pilot2-state-change", summary);
    root.addEventListener("pilot2-reveal-target", reveal);
    render();
    return { dispose() {
      controller.dispose();
      root.removeEventListener("input", input);
      root.removeEventListener("click", click);
      root.removeEventListener("pilot2-state-change", summary);
      root.removeEventListener("pilot2-reveal-target", reveal);
      legacy.remove();
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-vocabulary-panel.ts
  function mountTopicVocabularyPanel(root, input, state, controls) {
    const source = input.vocabulary;
    const families = source.conceptFamilies.map((f) => ({ id: f.id, label: f.label, meaning: f.meaning, wordAnalysis: [f.wordAnalysis.treatment, f.wordAnalysis.caution], routes: input.contract.topics.filter((t) => t.parts.some((p) => f.teachingPartIds.includes(p.id))).map((t) => t.id) }));
    let lastMessage = "Writing saves as you type. Each field allows 240 characters.";
    const observe = (event) => {
      const detail = event.detail;
      if (detail?.message) lastMessage = detail.message;
    };
    root.addEventListener("pilot2-state-change", observe);
    const dataElement = root.querySelector("#biology-word-data");
    const wordData = dataElement ? JSON.parse(dataElement.textContent) : void 0;
    const unlocked = (id) => {
      const route = root.querySelector(`[data-p2-family-panel="${CSS.escape(id)}"]`)?.dataset.p2UnlockRoute;
      return Boolean(route && state.visited.includes(route));
    };
    const freelyChosen = Boolean(input.state.wordFrayers && wordData);
    const wordPage = wordData ? freelyChosen ? mountWordFrayerControls(root, wordData, input.state.wordFrayers, { get: () => state.wordFrayers, set: (slots) => {
      state.wordFrayers = slots;
    }, save: () => controls.saveDraft() }) : mountTopicWordPage(root, wordData, unlocked, () => controls.refresh(), (route) => state.visited.includes(route)) : void 0;
    const wordFamilies = wordData ? wordData.categories.map((c) => ({ id: c.id, label: c.label, meaning: "", wordAnalysis: [], routes: [...new Set(c.wordIds.map((id) => wordData.wordRoutes?.[id]).filter((r) => Boolean(r)))] })) : families;
    const panel = mountVocabularyPanel({
      root,
      families: wordFamilies,
      words: wordData?.words,
      wordFrayers: freelyChosen ? Object.fromEntries(wordData.words.map((w) => [w.id, w.id])) : wordData?.wordFrayers,
      terms: wordData ? wordData.words.map((w) => ({ term: w.term, definition: w.definition, familyIds: w.categoryIds })) : source.introducedTerms.filter((t) => source.conceptFamilies.some((f) => f.termIds.includes(t.id))).map((t) => ({ term: t.term, definition: t.definition, familyIds: source.conceptFamilies.filter((f) => f.termIds.includes(t.id)).map((f) => f.id) })),
      sections: () => Array.from(root.querySelectorAll(".p2-part > .lesson-block,.p2-part > .worked-example,.p2-part > .p2-advanced,.p2-walkthrough-frame")),
      route: (section) => section.closest("[data-pilot2-topic]").dataset.pilot2Topic,
      unlocked: freelyChosen ? () => true : unlocked,
      frayer: (id) => freelyChosen ? root.querySelector(`[data-word-frayer="${CSS.escape(id)}"]`) : wordData ? root.querySelector(`[data-biology-frayer-record="${CSS.escape(id)}"]`) : root.querySelector(`[data-p2-family-panel="${CSS.escape(id)}"] .frayer`),
      choices: () => freelyChosen ? null : root.querySelector(".p2-family-choices"),
      refresh: () => controls.refresh(),
      status: () => lastMessage,
      selectedFamilies: () => state.frayerChoices
    });
    const choose = (event) => {
      const button = event.target instanceof Element ? event.target.closest("dialog.bio-vocabulary [data-p2-choose-family]") : null;
      if (button && state.frayerChoices.length === 2 && !state.frayerChoices.includes(button.dataset.p2ChooseFamily)) {
        event.stopPropagation();
        const manager = root.querySelector(".p2-family-choices");
        if (manager) manager.open = true;
        const status = root.querySelector("[data-pilot2-frayer-status]");
        if (status) status.textContent = "Both choices are occupied. Use the concept-family selector above to open a chosen Frayer. Keep a copy and explicitly clear its writing before replacing that choice.";
      }
    };
    root.addEventListener("click", choose, true);
    return { dispose() {
      panel.dispose();
      wordPage?.dispose();
      root.removeEventListener("click", choose, true);
      root.removeEventListener("pilot2-state-change", observe);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-presentation-runtime.ts
  function mountTopicPresentation(root, state, schema, controls) {
    const doc = root.ownerDocument, host = doc.defaultView, pages = [...root.querySelectorAll(".course-page")], sidebar = root.querySelector(".sidebar"), scrim = root.querySelector("[data-p2-scrim]"), menu = root.querySelector("[data-p2-menu]");
    const search = root.querySelector("[data-p2-vocabulary-search]"), filter = root.querySelector("[data-p2-vocabulary-filter]"), familyButtons = [...root.querySelectorAll("[data-p2-family-target]")], familyPanels = [...root.querySelectorAll("[data-p2-family-panel]")];
    let selectedFamily = state.vocabularyActiveId ?? "", saveTimer;
    const closeMenu = () => {
      sidebar.classList.remove("is-open");
      doc.body.classList.remove("nav-open");
      scrim.hidden = true;
      menu?.setAttribute("aria-expanded", "false");
    };
    function vocabulary() {
      const advanced = [...root.querySelectorAll("[data-pilot2-optional-flag]")];
      advanced.forEach((n) => n.checked = state.flags.includes(n.dataset.pilot2OptionalFlag));
      const advancedIds = [...new Set(advanced.map((n) => n.dataset.pilot2OptionalFlag))];
      const advancedProgress = root.querySelector("[data-p2-advanced-progress]");
      if (advancedProgress) advancedProgress.textContent = `${advancedIds.filter((id) => state.flags.includes(id)).length} of ${advancedIds.length}`;
      const models = [...root.querySelectorAll("[data-pilot2-model]")];
      const modelProgress = root.querySelector("[data-p2-model-progress]");
      if (modelProgress) modelProgress.textContent = `${models.filter((n) => state.flags.includes(n.querySelector("[data-pilot2-collect]")?.dataset.pilot2Collect ?? "")).length} of ${models.length}`;
      const query = search?.value.trim().toLowerCase() ?? "", view = filter?.value ?? "all";
      for (const button of familyButtons) {
        const learned = state.visited.includes(button.dataset.p2FamilyRoute);
        button.hidden = !(button.dataset.p2FamilySearch ?? "").includes(query) || view === "learned" && !learned || view !== "learned" && view !== "all" && button.dataset.p2FamilyChapter !== view;
        const label = button.querySelector("[data-p2-term-state]");
        if (label && learned) label.textContent = "Learned";
      }
      const visible = familyButtons.filter((b) => !b.hidden);
      if (!visible.some((b) => b.dataset.p2FamilyTarget === selectedFamily)) selectedFamily = visible[0]?.dataset.p2FamilyTarget ?? "";
      familyButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.p2FamilyTarget === selectedFamily);
        button.setAttribute("aria-pressed", String(button.dataset.p2FamilyTarget === selectedFamily));
      });
      familyPanels.forEach((panel) => {
        panel.hidden = panel.dataset.p2FamilyPanel !== selectedFamily;
        const learned = state.visited.includes(panel.dataset.p2UnlockRoute);
        panel.querySelector("[data-p2-family-locked]").hidden = learned;
        panel.querySelector("[data-p2-family-content]").hidden = !learned;
      });
      const empty = root.querySelector("[data-p2-vocabulary-empty]");
      if (empty) empty.hidden = visible.length > 0;
      root.querySelectorAll("[data-p2-choose-family]").forEach((b) => {
        const selected = state.frayerChoices.includes(b.dataset.p2ChooseFamily);
        b.disabled = selected;
        b.textContent = selected ? "Selected for Frayer" : "Choose this concept";
      });
      const progress = root.querySelector("[data-p2-vocabulary-progress]");
      if (progress) progress.textContent = `${[...schema.families.fixed, ...state.frayerChoices].filter((id) => state.flags.includes(id + "-collected")).length} of 8`;
    }
    function openPanel(id) {
      const panel = root.querySelector(`#${CSS.escape(id)}`);
      if (!panel) return;
      const hub = panel.closest("[data-p2-hub]");
      if (!hub) return;
      hub.querySelectorAll("[data-p2-panel]").forEach((p) => p.hidden = p.id !== id);
      const select = hub.querySelector("[data-p2-library-select]");
      if (select) select.value = id;
      hub.querySelectorAll("[data-p2-panel-target]").forEach((b) => {
        b.classList.toggle("active", b.dataset.p2PanelTarget === id);
        b.setAttribute("aria-pressed", String(b.dataset.p2PanelTarget === id));
        if (b.getAttribute("role") === "tab") b.setAttribute("aria-selected", String(b.dataset.p2PanelTarget === id));
      });
    }
    function reveal(target) {
      const family = target.closest("[data-p2-family-panel]");
      if (family) {
        selectedFamily = family.id;
        state.vocabularyActiveId = selectedFamily;
        if (filter) filter.value = "all";
        if (search) search.value = "";
        vocabulary();
      }
      const panel = target.closest("[data-p2-panel]");
      if (panel) openPanel(panel.id);
    }
    function navigate() {
      let id = "";
      try {
        id = decodeURIComponent(host.location.hash.slice(1));
      } catch {
      }
      if (!pages.some((p) => p.id === id)) id = state.route.endsWith("-overview") ? "overview" : state.route;
      if (!pages.some((p) => p.id === id)) id = "overview";
      const current = pages.find((p) => p.id === id);
      pages.forEach((p) => p.hidden = !(p === current || p.contains(current) || current.contains(p) && p.hasAttribute("data-p2-embedded")));
      for (let parent = current.parentElement; parent; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
      root.querySelectorAll(".nav-link").forEach((a) => {
        const active = a.dataset.pageTarget === id;
        a.classList.toggle("active", active);
        if (active) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
      closeMenu();
      host.scrollTo(0, 0);
      vocabulary();
    }
    function click(event) {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      const bookLink = target.closest("[data-p2-open-book]");
      if (bookLink) {
        const panel2 = root.querySelector(`#${CSS.escape(bookLink.dataset.p2OpenBook)}`), frame = panel2?.querySelector("[data-p2-book-base]"), page = Number(bookLink.dataset.p2BookPage);
        if (!frame || !Number.isInteger(page) || page < 1) throw Error("Invalid textbook link");
        frame.src = frame.dataset.p2BookBase + `#page=${page}&zoom=page-width`;
        const location2 = panel2.querySelector("[data-p2-book-location]");
        if (location2) location2.textContent = `Opened from ${bookLink.textContent?.trim()}. PDF page ${page}.`;
        const fullScreen = panel2.querySelector(".resource-links a:not([download])");
        if (fullScreen) fullScreen.href = frame.src;
      }
      const bookGroup = target.closest("[data-p2-textbook-group-attempt]");
      if (bookGroup) {
        const panel2 = bookGroup.closest(".textbook-review-support"), guide = panel2.querySelector("[data-p2-textbook-group-guide]");
        const open = guide.hidden;
        guide.hidden = !open;
        guide.open = open;
        bookGroup.setAttribute("aria-expanded", String(open));
        bookGroup.textContent = open ? "Hide answer guide" : "I attempted the textbook review";
        if (open) panel2.querySelectorAll("[data-pilot2-textbook-attempt]").forEach((button) => button.click());
        return;
      }
      const family = target.closest("[data-p2-family-target]");
      if (family) {
        selectedFamily = family.dataset.p2FamilyTarget;
        state.vocabularyActiveId = selectedFamily;
        controls.saveDraft();
        vocabulary();
        familyPanels.find((p) => p.id === selectedFamily)?.querySelector("h2")?.focus();
        return;
      }
      const panel = target.closest("[data-p2-panel-target]");
      if (panel) {
        openPanel(panel.dataset.p2PanelTarget);
        return;
      }
      const choice = target.closest("[data-p2-choose-family]");
      if (choice) {
        const slot = state.frayerChoices.length < 2 ? state.frayerChoices.length : -1, status = root.querySelector("[data-pilot2-frayer-status]");
        if (slot < 0) {
          root.querySelector(".p2-family-choices").open = true;
          if (status) {
            status.textContent = "Both learner choices are in use. Keep a copy and clear a chosen family before replacing it.";
            status.scrollIntoView({ block: "center" });
          }
          return;
        }
        const select = root.querySelector(`[data-pilot2-frayer-choice="${slot}"]`);
        select.value = choice.dataset.p2ChooseFamily;
        select.dispatchEvent(new Event("change", { bubbles: true }));
        vocabulary();
        return;
      }
      if (target.closest("[data-p2-menu]")) {
        const open = !sidebar.classList.contains("is-open");
        sidebar.classList.toggle("is-open", open);
        doc.body.classList.toggle("nav-open", open);
        scrim.hidden = !open;
        menu.setAttribute("aria-expanded", String(open));
        return;
      }
      if (target.closest("[data-p2-scrim]")) {
        closeMenu();
        menu.focus();
        return;
      }
      const collapse = target.closest("[data-p2-collapse]");
      if (collapse) {
        const collapsed = doc.body.classList.toggle("sidebar-collapsed");
        collapse.setAttribute("aria-expanded", String(!collapsed));
        collapse.setAttribute("aria-label", collapsed ? "Expand course navigation" : "Collapse course navigation");
        return;
      }
      if (target.closest("[data-p2-save-exit]")) {
        controls.saveDraft();
        return;
      }
      const link = target.closest("[data-page-target]");
      if (link && !target.closest("[data-pilot2-return-route]")) {
        const id = link.dataset.pageTarget;
        if (!pages.some((p) => p.id === id)) return;
        event.preventDefault();
        if (host.location.hash === `#${id}`) navigate();
        else host.location.hash = id;
      }
    }
    const librarySelect = root.querySelector("[data-p2-library-select]");
    const libraryChange = () => {
      if (librarySelect) openPanel(librarySelect.value);
    };
    librarySelect?.addEventListener("change", libraryChange);
    const revealEvent = (event) => {
      const target = event.detail;
      if (target) reveal(target);
    };
    const key = (event) => {
      if (event.key === "Escape" && sidebar.classList.contains("is-open")) {
        closeMenu();
        menu.focus();
      }
    };
    const stateChange = () => {
      vocabulary();
      const toast = root.querySelector("[data-pilot2-save-status]");
      if (toast?.textContent) {
        toast.classList.add("p2-show-save");
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => toast.classList.remove("p2-show-save"), 5e3);
      }
    };
    root.querySelectorAll("[data-p2-hub]").forEach((hub) => {
      const first = hub.querySelector("[data-p2-panel]");
      if (first) openPanel(first.id);
    });
    root.addEventListener("click", click);
    root.addEventListener("pilot2-reveal-target", revealEvent);
    root.addEventListener("pilot2-state-change", stateChange);
    root.addEventListener("pilot2-draft-change", stateChange);
    host.addEventListener("hashchange", navigate);
    doc.addEventListener("keydown", key);
    search?.addEventListener("input", vocabulary);
    filter?.addEventListener("change", vocabulary);
    navigate();
    return { dispose() {
      librarySelect?.removeEventListener("change", libraryChange);
      clearTimeout(saveTimer);
      closeMenu();
      root.removeEventListener("click", click);
      root.removeEventListener("pilot2-reveal-target", revealEvent);
      root.removeEventListener("pilot2-state-change", stateChange);
      root.removeEventListener("pilot2-draft-change", stateChange);
      host.removeEventListener("hashchange", navigate);
      doc.removeEventListener("keydown", key);
      search?.removeEventListener("input", vocabulary);
      filter?.removeEventListener("change", vocabulary);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-media-controls.ts
  var pending;
  function loadTopicYouTubeApi() {
    const win = window;
    if (win.YT?.Player) return Promise.resolve(win.YT);
    if (pending) return pending;
    pending = new Promise((resolve, reject) => {
      const prior = win.onYouTubeIframeAPIReady, script = document.createElement("script");
      let timer;
      let done = false;
      const finish = (error) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        script.onerror = null;
        if (win.onYouTubeIframeAPIReady === ready) win.onYouTubeIframeAPIReady = prior;
        if (error) {
          script.remove();
          reject(error);
        } else resolve(win.YT);
      };
      const ready = () => {
        try {
          prior?.();
        } finally {
          finish(win.YT?.Player ? void 0 : new Error("Provider API did not initialize"));
        }
      };
      win.onYouTubeIframeAPIReady = ready;
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.onerror = () => finish(new Error("Provider API is unavailable"));
      timer = setTimeout(() => finish(new Error("Provider API timed out")), 12e3);
      document.head.append(script);
    }).catch((error) => {
      pending = void 0;
      throw error;
    });
    return pending;
  }
  function mountTopicMedia(root, loadApi = loadTopicYouTubeApi) {
    const items = [...root.querySelectorAll("[data-pilot2-video]")];
    let disposed = false;
    const records = items.map((item) => ({ item, player: null, loading: false, failed: false, timer: null }));
    const visible = (item) => {
      const box = item.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && box.bottom > 0 && box.top < innerHeight && !item.closest("[hidden]");
    };
    const fallback = (record2, message) => {
      if (disposed) return;
      record2.failed = true;
      if (record2.timer) clearTimeout(record2.timer);
      record2.item.querySelector("[data-pilot2-video-host]").hidden = true;
      try {
        record2.player?.destroy();
      } catch {
      }
      record2.player = null;
      record2.item.querySelector("[data-pilot2-video-local]").open = true;
      record2.item.querySelector("[data-pilot2-video-status]").textContent = message;
    };
    const refresh = () => {
      for (const record2 of records) {
        if (!visible(record2.item)) {
          try {
            record2.player?.pauseVideo();
          } catch {
          }
          continue;
        }
        if (record2.loading || record2.player || record2.failed) continue;
        if (!navigator.onLine) {
          fallback(record2, "You are offline. The illustrated local path is available below.");
          continue;
        }
        record2.loading = true;
        void loadApi().then((api) => {
          if (disposed || !visible(record2.item)) {
            record2.loading = false;
            return;
          }
          const videoId = record2.item.dataset.pilot2Video, startSeconds = Number(record2.item.dataset.pilot2VideoStart), endSeconds = Number(record2.item.dataset.pilot2VideoEnd);
          if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId) || !Number.isInteger(startSeconds) || !Number.isInteger(endSeconds) || startSeconds < 0 || endSeconds <= startSeconds) throw new Error("Invalid reviewed video segment");
          const host = record2.item.querySelector("[data-pilot2-video-host]"), slot = document.createElement("div");
          host.append(slot);
          record2.timer = setTimeout(() => fallback(record2, "The provider has not responded. Use the illustrated local path below."), 12e3);
          record2.player = new api.Player(slot, { host: "https://www.youtube-nocookie.com", videoId, playerVars: { autoplay: 0, playsinline: 1, rel: 0, cc_load_policy: 1, ...location.origin === "null" ? {} : { origin: location.origin } }, events: {
            onReady: ({ target }) => {
              if (disposed || record2.failed) return;
              if (record2.timer) clearTimeout(record2.timer);
              target.getIframe().title = record2.item.querySelector("h3").textContent;
              target.cueVideoById({ videoId, startSeconds, endSeconds });
              if (!visible(record2.item)) target.pauseVideo();
              if (!record2.failed) record2.item.querySelector("[data-pilot2-video-status]").textContent = "Use the player\u2019s controls, or open the illustrated local path.";
            },
            onError: () => fallback(record2, "This video is unavailable here. Use the illustrated local path below.")
          } });
        }).catch(() => fallback(record2, "The provider could not load. Use the illustrated local path below."));
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(refresh);
    records.forEach((record2) => observer?.observe(record2.item));
    const offline = () => records.filter((record2) => visible(record2.item)).forEach((record2) => fallback(record2, "You are offline. The illustrated local path is available below."));
    window.addEventListener("hashchange", refresh);
    window.addEventListener("offline", offline);
    window.addEventListener("scroll", refresh, { passive: true });
    refresh();
    return { dispose() {
      disposed = true;
      observer?.disconnect();
      window.removeEventListener("hashchange", refresh);
      window.removeEventListener("offline", offline);
      window.removeEventListener("scroll", refresh);
      records.forEach((record2) => {
        if (record2.timer) clearTimeout(record2.timer);
        try {
          record2.player?.destroy();
        } catch {
        }
      });
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-graph-work.ts
  var exactKeys = (value, keys) => Object.keys(value).sort().join("|") === [...keys].sort().join("|");
  function emptyGraphDraft(work) {
    return { v: 1, k: work.unit, g: work.graphs.map((graph) => ({ a: [null, null, null], p: graph.series.map(() => graph.x.map(() => null)) })), e: "" };
  }
  function validateGraphDraft(work, value) {
    if (!value || typeof value !== "object" || !exactKeys(value, ["v", "k", "g", "e"])) throw new Error("Unknown graph response format; preserve the original writing");
    const draft = value;
    if (draft.v !== 1 || draft.k !== work.unit || !Array.isArray(draft.g) || draft.g.length !== work.graphs.length || typeof draft.e !== "string" || draft.e.length > work.explanationLimit) throw new Error("Graph unit, inventory or explanation capacity mismatch");
    for (const [index, graph] of work.graphs.entries()) {
      const data = draft.g[index];
      if (!data || typeof data !== "object" || !exactKeys(data, ["a", "p"]) || !Array.isArray(data.a) || data.a.length !== 3 || !Array.isArray(data.p) || data.p.length !== graph.series.length) throw new Error("Graph axes or series inventory mismatch");
      const counts = [graph.xLabels.length, graph.yLabels.length, graph.maxima.length];
      if (data.a.some((choice, axis) => choice !== null && (!Number.isSafeInteger(choice) || choice < 0 || choice >= counts[axis]))) throw new Error("Unknown graph axis selection");
      for (const points of data.p) {
        if (!Array.isArray(points) || points.length !== graph.x.length) throw new Error("Graph point inventory mismatch");
        if (points.some((point) => point !== null && (typeof point !== "number" || !Number.isFinite(point) || point < 0 || point > 9999.99 || Math.abs(point * 100 - Math.round(point * 100)) > 1e-7))) throw new Error("Graph values must be finite nonnegative numbers with at most two decimal places");
      }
    }
  }
  function encodeGraphDraft(work, draft, responseLimit) {
    validateGraphDraft(work, draft);
    const encoded = JSON.stringify(draft);
    if (encoded.length > responseLimit) throw new Error("Graph response exceeds its saved field; keep the previous valid response and current draft");
    return encoded;
  }
  function decodeGraphDraft(work, response) {
    try {
      const value = JSON.parse(response);
      validateGraphDraft(work, value);
      return { kind: "graph", draft: value };
    } catch {
      return { kind: "preserved-writing", original: response };
    }
  }
  function compareGraphDraft(work, draft) {
    validateGraphDraft(work, draft);
    return work.graphs.map((graph, index) => {
      const data = draft.g[index];
      return {
        graphId: graph.id,
        axes: data.a.map((value, axis) => value === null ? "blank" : axis === 2 ? graph.maxima[value] >= Math.max(...graph.series.flatMap((series) => series.expected)) ? "fits-source-values" : "scale-too-small" : value === graph.expectedAxes[axis] ? "matches" : "compare-axis-label"),
        series: graph.series.map((series, s) => ({ id: series.id, points: data.p[s].map((point, i) => point === null ? "blank" : Math.abs(point - series.expected[i]) < 5e-3 ? "matches" : "compare-source-value") })),
        outsideScale: data.a[2] === null ? [] : data.p.flatMap((values, series) => values.flatMap((point, pointIndex) => point !== null && point > graph.maxima[data.a[2]] ? [{ series, pointIndex, value: point }] : []))
      };
    });
  }
  function graphWorkText(work, draft) {
    validateGraphDraft(work, draft);
    return work.graphs.map((graph, index) => {
      const data = draft.g[index];
      return [
        graph.title,
        `Horizontal axis: ${data.a[0] === null ? "not selected" : graph.xLabels[data.a[0]]}`,
        `Vertical axis: ${data.a[1] === null ? "not selected" : graph.yLabels[data.a[1]]}`,
        `Vertical maximum: ${data.a[2] === null ? "not selected" : graph.maxima[data.a[2]]}`,
        ...graph.series.map((series, s) => `${series.label}: ${graph.x.map((x, i) => `${x} = ${data.p[s][i] ?? "not plotted"}`).join("; ")}`)
      ].join("\n");
    }).concat(`Explanation: ${draft.e || "not written"}`).join("\n\n");
  }

  // scripts/lib/biology30-course/v1/pilot2-activity-index.ts
  function buildTopicActivityIndex(input) {
    const { contract, state } = input, unit = contract.unit.toLowerCase();
    validateBiologyRuntimeIdentity(contract);
    if (contract.unit !== state.unit || contract.courseId !== state.courseId) throw Error("Activity course identity does not match saved-state schema");
    const entries = [];
    const add = (entry) => entries.push(entry);
    for (const topic of contract.topics) {
      const teaching = input.framing.topics.find((item) => item.topicId === topic.id);
      if (!teaching) throw new Error(`Missing activity framing: ${topic.id}`);
      for (const [field, label, flag] of [
        [teaching.retrieval, "Retrieval", null],
        [teaching.evidenceSlip, "Evidence Slip", `${topic.id}-evidence-collected`],
        [teaching.localWalkthrough.checkpoint, "Media checkpoint", `${topic.id}-media-attempted`]
      ]) {
        add({
          id: field.responseId,
          routeId: topic.id,
          focusId: field.responseId,
          title: `${topic.title}: ${label}`,
          category: label,
          responses: [{ id: field.responseId, label: field.prompt }],
          choices: [],
          flags: flag ? [{ id: flag, label: label === "Evidence Slip" ? "Saved to collection" : "Attempted" }] : []
        });
      }
      for (const part of topic.parts) {
        const advanced = input.instruction.parts.find((item) => item.partId === part.id)?.advanced;
        if (!advanced) throw new Error(`Missing Advanced activity: ${part.id}`);
        add({
          id: advanced.id,
          routeId: topic.id,
          focusId: advanced.id,
          title: advanced.title,
          category: "Advanced Learning",
          responses: [],
          choices: [],
          flags: [{ id: `${advanced.id}-complete`, label: "Self-marked complete" }]
        });
      }
    }
    for (const item of input.practice.items) {
      const selected = item.kind === "multiple-choice";
      add({
        id: item.id,
        routeId: item.routeId,
        focusId: item.id,
        title: item.prompt,
        category: item.role === "challenge" ? "Diploma Challenge" : "Practice",
        responses: selected ? [] : [{ id: item.id, label: "Your response" }],
        choices: selected ? [{ id: item.id, label: "Your selection", options: Object.fromEntries(item.options.map((text, index) => [String(index), text])) }] : [],
        flags: [{ id: `${item.id}-attempted`, label: "Attempted" }]
      });
    }
    for (const family of input.vocabulary.conceptFamilies) {
      const ids = state.families.responseIds[family.id];
      if (ids?.length !== 4) throw new Error(`Incomplete Frayer state: ${family.id}`);
      add({
        id: family.id,
        routeId: `${unit}-core-vocabulary`,
        focusId: family.id,
        title: family.label,
        category: "Frayer",
        responses: ids.map((id, index) => ({ id, label: ["Contextual definition", "Essential mechanism", "Unit evidence", "Non-example or confusion"][index] })),
        choices: [],
        flags: [{ id: `${family.id}-collected`, label: "Saved to collection" }]
      });
    }
    for (const model of input.models.models) {
      add({
        id: model.id,
        routeId: `${unit}-models`,
        focusId: model.id,
        title: model.title,
        category: "Models and Data Lab",
        responses: [{ id: model.predictionId, label: "Prediction" }, { id: model.explanationId, label: "Explanation" }],
        choices: [{ id: model.id, label: "Selected case", options: Object.fromEntries(model.cases.map((item) => [item.value, item.label])) }],
        flags: [{ id: model.testFlag, label: "Tested" }, { id: model.collectionFlag, label: "Saved to collection" }]
      });
    }
    for (const investigation of input.investigations.investigations) {
      add({
        id: investigation.id,
        routeId: `${unit}-investigations`,
        focusId: investigation.id,
        title: investigation.title,
        category: "Investigation",
        responses: investigation.responseFields.map((field) => ({ id: field.id, label: field.label })),
        choices: [],
        flags: [{ id: `${investigation.id}-saved`, label: "Saved to collection" }]
      });
    }
    add({
      id: input.seminar.id,
      routeId: input.seminar.id,
      focusId: input.seminar.activities[0].id,
      title: input.seminar.title,
      category: "Review Seminar",
      responses: input.seminar.activities.map((item) => ({ id: item.id, label: item.prompt })),
      choices: [],
      flags: [{ id: `${input.seminar.id}-saved`, label: "Saved to collection" }]
    });
    for (const group of input.textbook.groups) for (const item of group.items) {
      add({
        id: item.id,
        routeId: group.chapter ? `${unit}-chapter-${group.chapter}-practice` : `${unit}-final-practice`,
        focusId: item.id,
        title: `Textbook Q${item.questionNumber}: ${item.title}`,
        category: "Textbook reinforcement",
        responses: [],
        choices: [],
        flags: [{ id: `${item.id}-attempted`, label: "Attempt confirmed" }]
      });
    }
    add({
      id: `${unit}-process-note`,
      routeId: `${unit}-notes`,
      focusId: `${unit}-process-note`,
      title: "My notes",
      category: "Notes",
      responses: [{ id: `${unit}-process-note`, label: "Notes" }],
      choices: [],
      flags: []
    });
    validateTopicActivityIndex(entries, state);
    return entries;
  }
  function validateTopicActivityIndex(entries, state) {
    const ids = /* @__PURE__ */ new Set();
    const accounted = { responses: /* @__PURE__ */ new Set(), choices: /* @__PURE__ */ new Set(), flags: /* @__PURE__ */ new Set() };
    for (const entry of entries) {
      if (!entry.id || ids.has(entry.id) || !state.routes.includes(entry.routeId) || !entry.focusId || !entry.title.trim()) throw new Error(`Invalid activity return target: ${entry.id}`);
      ids.add(entry.id);
      for (const kind of ["responses", "choices", "flags"]) for (const field of entry[kind]) {
        if (!Object.hasOwn(state[kind], field.id) || accounted[kind].has(field.id) || !field.label.trim()) throw new Error(`Unbound or duplicate collection ${kind}: ${field.id}`);
        accounted[kind].add(field.id);
      }
      for (const choice of entry.choices) {
        if (Object.keys(choice.options).sort().join("\0") !== [...state.choices[choice.id].values].sort().join("\0") || Object.values(choice.options).some((label) => !label.trim())) throw new Error(`Collection choice meaning drift: ${choice.id}`);
      }
    }
    for (const kind of ["responses", "choices", "flags"]) {
      if (accounted[kind].size !== Object.keys(state[kind]).length) throw new Error(`Collection omits registered ${kind}`);
    }
    return { entries: entries.length, responses: accounted.responses.size, choices: accounted.choices.size, flags: accounted.flags.size };
  }
  function meaningfulTopicResponse(id, value, graphs) {
    if (!value?.trim()) return false;
    const graph = graphs.find((item) => item.responseId === id);
    if (!graph) return true;
    const result = decodeGraphDraft(graph, value);
    return result.kind === "preserved-writing" || Boolean(result.draft.e.trim()) || result.draft.g.some((plot2) => plot2.a.some((axis) => axis !== null) || plot2.p.some((points) => points.some((point) => point !== null)));
  }
  function collectTopicWork(index, state, schema, graphs = [], legacySchema) {
    validateTopicState(state, schema);
    const entries = [];
    for (const item of index) {
      const fields = [];
      for (const field of item.responses) {
        const text = state.responses[field.id];
        if (!meaningfulTopicResponse(field.id, text, graphs)) continue;
        const graph = graphs.find((graph2) => graph2.responseId === field.id), decoded = graph ? decodeGraphDraft(graph, text) : null;
        fields.push({ label: field.label, text: decoded?.kind === "graph" ? graphWorkText(graph, decoded.draft) : text });
      }
      for (const field of item.choices) {
        const value = state.choices[field.id];
        if (value !== void 0) fields.push({ label: field.label, text: field.options[value] });
      }
      for (const field of item.flags) if (state.flags.includes(field.id)) fields.push({ label: "Status", text: field.label });
      if (fields.length) entries.push({ id: item.id, title: item.title, category: item.category, routeId: item.routeId, focusId: item.focusId, fields });
    }
    state.legacy.forEach((legacy, index2) => entries.push({
      id: `preserved-legacy-${index2}`,
      title: `Earlier work: ${legacy.source}`,
      category: "Preserved earlier work",
      routeId: null,
      focusId: null,
      fields: legacySchema ? describeLegacyWork(legacy.original, legacySchema) : [{ label: "Original saved payload; not reassigned to new activities", text: legacy.original }],
      legacyOriginal: legacy.original
    }));
    return entries;
  }
  function completedTopicRoutes(input, state, graphs = []) {
    validateTopicState(state, input.state);
    const attempted = (item) => state.flags.includes(`${item.id}-attempted`) && (item.kind === "multiple-choice" ? state.choices[item.id] !== void 0 : meaningfulTopicResponse(item.id, state.responses[item.id], graphs));
    return input.contract.requiredRoutes.filter((routeId) => {
      const teaching = input.framing.topics.find((topic) => topic.topicId === routeId);
      if (teaching) return input.practice.items.filter((item) => item.routeId === routeId && item.role === "guided").length === 2 && input.practice.items.filter((item) => item.routeId === routeId && item.role === "guided").every(attempted) && state.flags.includes(`${routeId}-evidence-collected`) && Boolean(state.responses[teaching.evidenceSlip.responseId]?.trim()) && state.flags.includes(`${routeId}-media-attempted`) && Boolean(state.responses[teaching.localWalkthrough.checkpoint.responseId]?.trim());
      if (routeId === input.seminar.id) return state.flags.includes(`${routeId}-saved`) && input.seminar.activities.every((item) => Boolean(state.responses[item.id]?.trim()));
      const questions = input.practice.items.filter((item) => item.routeId === routeId && ["chapter", "final"].includes(item.role));
      return questions.length > 0 && questions.every(attempted);
    });
  }

  // scripts/lib/biology30-course/v1/pilot2-controls-runtime.ts
  function mountTopicControls(root, state, schema, onChange, graphs = []) {
    const openTextbookGuides = /* @__PURE__ */ new Set();
    const all = (selector) => Array.from(root.querySelectorAll(selector));
    const byValue = (attribute, value) => all(`[${attribute}]`).find((node) => node.getAttribute(attribute) === value);
    const showResponseCapacity = (field) => {
      const id = field.dataset.pilot2Response;
      if (!/^[bcd]-(?:review-seminar-|investigation-.*-final-transfer-revision-v2$)/.test(id)) return;
      const limit = schema.responses[id].limit;
      let note = byValue("data-pilot2-response-capacity", id);
      if (!note) {
        note = root.querySelector(`[id="${id}-capacity"]`) ?? document.createElement("p");
        note.dataset.pilot2ResponseCapacity = id;
        note.id = id + "-capacity";
        if (!note.parentElement) field.insertAdjacentElement("afterend", note);
        field.setAttribute("aria-describedby", [.../* @__PURE__ */ new Set([...(field.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean), note.id])].join(" "));
      }
      const oversized = field.value.length > limit;
      note.textContent = `${field.value.length} / ${limit} characters.` + (oversized ? ` Over the limit by ${field.value.length - limit}. This draft cannot be saved yet. Your writing remains here; shorten it or copy it before leaving.` : " Include the working and explanation requested.");
      field.setAttribute("aria-invalid", String(oversized));
    };
    const setFlag = (id, value) => {
      if (!Object.hasOwn(schema.flags, id)) throw new Error(`Unknown control flag: ${id}`);
      state.flags = state.flags.filter((flag) => flag !== id);
      if (value) state.flags.push(id);
    };
    const responseReady = (id) => {
      if (!state.responses[id]?.trim() || state.responses[id].length > (schema.responses[id]?.limit ?? -1)) return false;
      const graph = graphs.find((work) => work.responseId === id), panel = byValue("data-pilot2-graph-work", id);
      if (panel?.dataset.pilot2GraphInvalid === "true") return false;
      if (graph) {
        const decoded = decodeGraphDraft(graph, state.responses[id]);
        if (decoded.kind === "graph") return Boolean(decoded.draft.e.trim()) || decoded.draft.g.some((plot2) => plot2.a.some((axis) => axis !== null) || plot2.p.some((points) => points.some((point) => point !== null)));
      }
      return true;
    };
    const collectionReady = (button) => {
      const required = (button.dataset.pilot2Requires ?? "").split(" ").filter(Boolean), flag = button.dataset.pilot2RequiredFlag;
      return required.length > 0 && required.every(responseReady) && (!flag || state.flags.includes(flag));
    };
    const practiceReady = (id) => schema.choices[id] ? schema.choices[id].values.includes(state.choices[id]) : responseReady(id);
    function revealPractice(id, show) {
      const panel = byValue("data-pilot2-feedback", id), button = byValue("data-pilot2-check", id);
      if (!panel || !button) return;
      panel.hidden = !show;
      button.setAttribute("aria-expanded", String(show));
      panel.querySelectorAll("[data-pilot2-option-feedback]").forEach((node) => {
        node.hidden = node.dataset.pilot2OptionFeedback !== state.choices[id];
      });
    }
    function refresh() {
      all("[data-pilot2-check]").forEach((button) => {
        const id = button.dataset.pilot2Check;
        button.disabled = !practiceReady(id);
        const attempted = practiceReady(id) && state.flags.includes(`${id}-attempted`);
        revealPractice(id, attempted);
        const status = byValue("data-pilot2-check-status", id);
        if (status) status.textContent = attempted ? "Feedback is open for this attempt." : practiceReady(id) ? "Ready to check your attempt." : "Attempt the question to open the feedback.";
      });
      all("[data-pilot2-compare]").forEach((button) => {
        button.disabled = !responseReady(button.dataset.pilot2Compare);
      });
      all("[data-pilot2-collect]").forEach((button) => {
        button.disabled = !collectionReady(button);
      });
      all("[data-pilot2-group-compare]").forEach((button) => {
        button.disabled = !collectionReady(button);
      });
      all("[data-pilot2-textbook-attempt]").forEach((button) => {
        const id = button.dataset.pilot2TextbookAttempt, panel = root.querySelector(`#${CSS.escape(id + "-guide")}`);
        const attempted = state.flags.includes(`${id}-attempted`);
        const open = attempted && openTextbookGuides.has(id);
        if (panel) panel.hidden = !open;
        button.setAttribute("aria-expanded", String(open));
        const status = byValue("data-pilot2-textbook-status", id);
        if (status && !open) status.textContent = attempted ? "Previous attempt recorded; open the guide when ready." : "";
      });
    }
    function save() {
      state.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      let result;
      try {
        result = onChange(state);
      } catch {
        result = { saved: false, message: "Saving failed. Your current writing remains visible; copy it before leaving." };
      }
      all("[data-pilot2-save-status]").forEach((node) => {
        node.textContent = result.message;
      });
      refresh();
      root.dispatchEvent(new CustomEvent("pilot2-state-change", { detail: result }));
      return result;
    }
    function changedResponse(id) {
      const field = byValue("data-pilot2-response", id);
      for (const flag of (field?.dataset.pilot2Invalidates ?? "").split(" ").filter(Boolean)) setFlag(flag, false);
      all("[data-pilot2-group-compare]").filter((button) => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach((button) => {
        button.setAttribute("aria-expanded", "false");
        const panel = root.querySelector(`#${CSS.escape(button.dataset.pilot2GroupCompare + "-overall-guide")}`);
        if (panel) panel.hidden = true;
      });
      if (schema.flags[`${id}-attempted`]) setFlag(`${id}-attempted`, false);
      const compare = byValue("data-pilot2-compare", id);
      if (compare) {
        compare.setAttribute("aria-expanded", "false");
        const guide = root.querySelector(`#${CSS.escape(id + "-guide")}`);
        if (guide) guide.hidden = true;
      }
      all("[data-pilot2-collect]").filter((button) => (button.dataset.pilot2Requires ?? "").split(" ").includes(id)).forEach((button) => {
        if (button.hasAttribute("data-pilot2-collect-toggle")) return;
        setFlag(button.dataset.pilot2Collect, false);
        const status = byValue("data-pilot2-collection-status", button.dataset.pilot2Collect);
        if (status) status.textContent = "Edited draft; save this activity again when ready.";
      });
    }
    const onInput = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLTextAreaElement) || !field.dataset.pilot2Response) return;
      const id = field.dataset.pilot2Response;
      if (!Object.hasOwn(schema.responses, id)) throw new Error(`Unknown response control: ${id}`);
      state.responses[id] = field.value;
      showResponseCapacity(field);
      changedResponse(id);
      save();
    };
    const onChoice = (event) => {
      const field = event.target;
      if (field instanceof HTMLInputElement && field.dataset.pilot2OptionalFlag) {
        const id2 = field.dataset.pilot2OptionalFlag;
        if (!id2.endsWith("-advanced-complete")) throw new Error("Only optional Advanced markers use this control");
        setFlag(id2, field.checked);
        save();
        return;
      }
      if (!(field instanceof HTMLInputElement) || !field.dataset.pilot2Choice || !field.checked) return;
      const id = field.dataset.pilot2Choice;
      if (!schema.choices[id]?.values.includes(field.value)) throw new Error(`Unknown choice control: ${id}`);
      state.choices[id] = field.value;
      setFlag(`${id}-attempted`, false);
      save();
    };
    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || !root.contains(button) || button.disabled) return;
      const check = button.dataset.pilot2Check, compare = button.dataset.pilot2Compare, collect = button.dataset.pilot2Collect, textbook = button.dataset.pilot2TextbookAttempt, group = button.dataset.pilot2GroupCompare;
      if (group && collectionReady(button)) {
        const panel = root.querySelector(`#${CSS.escape(group + "-overall-guide")}`);
        if (panel) {
          panel.hidden = false;
          button.setAttribute("aria-expanded", "true");
        }
      } else if (textbook) {
        openTextbookGuides.add(textbook);
        setFlag(`${textbook}-attempted`, true);
        const result = save();
        const status = byValue("data-pilot2-textbook-status", textbook);
        if (status) status.textContent = result.saved ? "Attempt saved; comparison guide is open." : "Comparison guide is open; saving was not confirmed.";
      } else if (check && practiceReady(check)) {
        setFlag(`${check}-attempted`, true);
        const result = save();
        revealPractice(check, true);
        const status = byValue("data-pilot2-check-status", check);
        if (status) {
          status.classList.toggle("sr-only", result.saved);
          status.textContent = result.saved ? "Attempt saved. Feedback is open." : "Feedback is open. Saving this attempt was not confirmed.";
        }
      } else if (compare && responseReady(compare)) {
        const panel = root.querySelector(`#${CSS.escape(compare + "-guide")}`);
        if (panel) {
          panel.hidden = false;
          button.setAttribute("aria-expanded", "true");
        }
      } else if (collect && collectionReady(button)) {
        setFlag(collect, button.hasAttribute("data-pilot2-collect-toggle") ? !state.flags.includes(collect) : true);
        const result = save();
        const status = byValue("data-pilot2-collection-status", collect);
        if (status) status.textContent = result.saved ? "Saved to Process Collection." : "Your draft remains visible. Saving was not confirmed.";
      }
    };
    all("[data-pilot2-response]").forEach((field) => {
      const id = field.dataset.pilot2Response;
      if (!Object.hasOwn(schema.responses, id)) throw new Error(`Unknown response control: ${id}`);
      field.value = state.responses[id] ?? "";
      showResponseCapacity(field);
    });
    all("[data-pilot2-choice]").forEach((field) => {
      field.checked = state.choices[field.dataset.pilot2Choice] === field.value;
    });
    all("[data-pilot2-optional-flag]").forEach((field) => {
      field.checked = state.flags.includes(field.dataset.pilot2OptionalFlag);
    });
    refresh();
    root.addEventListener("input", onInput);
    root.addEventListener("change", onChoice);
    root.addEventListener("click", onClick);
    return { refresh, saveDraft: save, responseChanged(id) {
      if (!schema.responses[id]) throw new Error("Unknown response update");
      changedResponse(id);
      return save();
    }, dispose() {
      root.removeEventListener("input", onInput);
      root.removeEventListener("change", onChoice);
      root.removeEventListener("click", onClick);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-science.ts
  function finite(value, label) {
    if (!Number.isFinite(value)) throw new Error(`${label} must be finite`);
    return value;
  }
  function nonnegative(value, label) {
    finite(value, label);
    if (value < 0) throw new Error(`${label} cannot be negative`);
    return value;
  }
  function count(value, label) {
    nonnegative(value, label);
    if (!Number.isSafeInteger(value)) throw new Error(`${label} must be a whole count`);
    return value;
  }
  function alleleFrequencies(AA, Aa, aa) {
    [AA, Aa, aa].forEach((v, i) => count(v, ["AA", "Aa", "aa"][i]));
    const individuals = AA + Aa + aa;
    if (!Number.isSafeInteger(2 * individuals) || individuals === 0) throw new Error("A positive safe diploid sample is required");
    const p = (2 * AA + Aa) / (2 * individuals), q = (2 * aa + Aa) / (2 * individuals);
    return { individuals, alleleCopies: 2 * individuals, p, q, observed: [AA / individuals, Aa / individuals, aa / individuals], expectedUnderEquilibrium: [p * p, 2 * p * q, q * q] };
  }
  function demographicChange(initial, births, immigrants, deaths, emigrants, elapsed) {
    [initial, births, immigrants, deaths, emigrants].forEach((v, i) => count(v, ["Initial count", "Births", "Immigrants", "Deaths", "Emigrants"][i]));
    finite(elapsed, "Elapsed time");
    if (initial === 0 || elapsed <= 0) throw new Error("Initial count and elapsed time must be positive");
    const change = births + immigrants - deaths - emigrants, final = initial + change;
    if (!Number.isSafeInteger(final) || final < 0) throw new Error("Population balance is impossible or unsafe");
    return { change, final, absolutePerTime: change / elapsed, perInitialIndividualOverInterval: change / initial, averagePerInitialIndividualPerTime: change / initial / elapsed };
  }
  function stageCounts(diploidNumber, stage) {
    count(diploidNumber, "Diploid number");
    if (!diploidNumber || diploidNumber % 2) throw new Error("Use a positive even diploid number for this paired-chromosome model");
    if (stage === "G1") return { chromosomes: diploidNumber, chromatids: diploidNumber, sets: 2 };
    if (stage === "after-S") return { chromosomes: diploidNumber, chromatids: 2 * diploidNumber, sets: 2 };
    if (stage === "after-meiosis-I") return { chromosomes: diploidNumber / 2, chromatids: diploidNumber, sets: 1 };
    if (stage === "after-meiosis-II") return { chromosomes: diploidNumber / 2, chromatids: diploidNumber / 2, sets: 1 };
    throw new Error("Unknown stage");
  }
  function monohybridCross(first, second) {
    if (!/^[Aa]{2}$/.test(first) || !/^[Aa]{2}$/.test(second)) throw new Error("Use AA, Aa, aA or aa for the one-locus model");
    const probabilities = { AA: 0, Aa: 0, aa: 0 };
    for (const a of first) for (const b of second) {
      const genotype = [a, b].sort().join("");
      probabilities[genotype] += 0.25;
    }
    return probabilities;
  }
  function DNA(sequence) {
    const normalized = sequence.replace(/\s/g, "").toUpperCase();
    if (!normalized || !/^[ACGT]+$/.test(normalized)) throw new Error("Enter DNA bases A, C, G and T; direction labels belong outside the sequence");
    return normalized;
  }
  function complementDNA(sequence, reverse = false) {
    const bases = { A: "T", T: "A", G: "C", C: "G" };
    const result = [...DNA(sequence)].map((base) => bases[base]);
    return (reverse ? result.reverse() : result).join("");
  }
  function transcribeDNA(sequence, suppliedStrand) {
    if (suppliedStrand === "coding-5-to-3") return DNA(sequence).replace(/T/g, "U");
    if (suppliedStrand === "template-3-to-5") return complementDNA(sequence).replace(/T/g, "U");
    if (suppliedStrand === "template-5-to-3") return complementDNA(sequence, true).replace(/T/g, "U");
    throw new Error("An explicit strand and direction are required");
  }
  var aminoAcids = {};
  for (const [name, codons] of Object.entries({ Phe: "UUU UUC", Leu: "UUA UUG CUU CUC CUA CUG", Ile: "AUU AUC AUA", Met: "AUG", Val: "GUU GUC GUA GUG", Ser: "UCU UCC UCA UCG AGU AGC", Pro: "CCU CCC CCA CCG", Thr: "ACU ACC ACA ACG", Ala: "GCU GCC GCA GCG", Tyr: "UAU UAC", Stop: "UAA UAG UGA", His: "CAU CAC", Gln: "CAA CAG", Asn: "AAU AAC", Lys: "AAA AAG", Asp: "GAU GAC", Glu: "GAA GAG", Cys: "UGU UGC", Trp: "UGG", Arg: "CGU CGC CGA CGG AGA AGG", Gly: "GGU GGC GGA GGG" })) {
    for (const codon of codons.split(" ")) aminoAcids[codon] = name;
  }
  function translateRNA(sequence, frame = 0) {
    const rna = sequence.replace(/\s/g, "").toUpperCase();
    if (!rna || !/^[ACGU]+$/.test(rna) || ![0, 1, 2].includes(frame)) throw new Error("Use RNA bases and frame 0, 1 or 2");
    const peptide = [], codons = [];
    let stopIndex = null;
    for (let i = frame; i + 2 < rna.length; i += 3) {
      const codon = rna.slice(i, i + 3);
      codons.push(codon);
      if (aminoAcids[codon] === "Stop") {
        stopIndex = i;
        break;
      }
      peptide.push(aminoAcids[codon]);
    }
    return { peptide, codons, stopIndex, startsWithAUG: rna.slice(frame, frame + 3) === "AUG", trailingBases: stopIndex === null ? rna.slice(frame + 3 * codons.length) : "", interpretation: "Translation in the explicitly supplied frame; actual initiation and expression need biological context." };
  }

  // scripts/lib/biology30-course/v1/pilot2-models.ts
  function runBiology30TopicModel(model, choice) {
    if (model.modelVersion !== 1 || !model.options.includes(choice)) throw new Error("Unknown Biology model version or option");
    if (new Set(model.options).size !== model.options.length || model.cases.length !== model.options.length || model.options.some((option) => model.cases.filter((entry) => entry.value === option).length !== 1)) throw new Error("Biology model case inventory drift");
    const selected = model.cases.find((entry) => entry.value === choice);
    const parameters = selected.parameters;
    const number2 = (key) => {
      const value = parameters[key];
      if (typeof value !== "number" || !Number.isFinite(value)) throw new Error(`Invalid model number: ${key}`);
      return value;
    };
    const text = (key) => {
      const value = parameters[key];
      if (typeof value !== "string" || !value.trim()) throw new Error(`Invalid model text: ${key}`);
      return value;
    };
    const result = (output) => ({ modelId: model.id, modelVersion: 1, choice, title: selected.label, ...output });
    switch (model.id) {
      case "a-model-closed-system": {
        const production = number2("production"), consumption = number2("consumption");
        if (production < 0 || consumption < 0) throw new Error("Gas model rates cannot be negative");
        const oxygenChange = production - consumption;
        return result({ columns: ["Account", "Source", "Sink", "Net change"], rows: [["Oxygen", production, consumption, oxygenChange], ["Carbon dioxide (simplified coupling)", consumption, production, -oxygenChange]], explanation: "Net change equals source minus sink over the same interval. Reduced production can reverse the sign even while oxygen is still being produced.", limitation: "Illustrative arbitrary gas units, with equal and opposite CO\u2082 coupling assumed. This is not a complete chemical mechanism, a real sealed-ecosystem measurement or a guarantee of indefinite balance.", visual: "pathway-observations", values: { production, consumption, oxygenChange } });
      }
      case "b-model-signal-pathway": {
        const keys = ["germCells", "support", "LH", "duct"];
        const observations = keys.map(text);
        const labels2 = ["Developing germ cells", "Sertoli support", "LH signal", "Duct passage"];
        const interpretation = {
          "support-defect": "Germ cells are absent with disrupted support despite a present LH signal and an open duct. Investigate support and production before attributing the finding to an obstruction.",
          "signal-defect": "Reduced germ cells accompany a reduced LH signal while support is recorded as present and the duct is open. This is consistent with an upstream signal problem; it does not uniquely identify a cause.",
          "duct-obstruction": "Germ cells, support and LH are recorded as present while the duct is blocked. Reduced delivery can therefore occur even when the observed production pathway is present."
        };
        if (!interpretation[choice]) throw new Error("Unknown pathway case");
        return result({
          columns: ["Observation", "Reference", `Case ${text("case")}`],
          rows: labels2.map((label, i) => [label, i === 3 ? "open" : "present", observations[i]]),
          explanation: interpretation[choice],
          limitation: "Fictional observations do not diagnose a person or establish fertility.",
          visual: "pathway-observations",
          values: { observations }
        });
      }
      case "b-model-cycle-sequence": {
        const start = number2("start"), end = number2("end");
        const series = model.series;
        if (!series || series.columns.length !== 5 || start >= end || series.rows.some((row, i) => row.length !== 5 || row.some((value) => !Number.isFinite(value)) || i > 0 && row[0] <= series.rows[i - 1][0])) throw new Error("Invalid cycle series");
        const rows = series.rows.filter((row) => row[0] >= start && row[0] <= end).map((row) => [...row]);
        if (rows.length < 2 || rows[0][0] !== start || rows.at(-1)[0] !== end) throw new Error("Cycle interval lacks its endpoints");
        const differences = rows[0].slice(1).map((initial, i) => rows.at(-1)[i + 1] - initial);
        return result({
          columns: [...series.columns],
          rows,
          explanation: "Read each hormone on its own relative scale. Connect the sampled changes in time: estrogen rises before the highest sampled LH point; the later progesterone rise is consistent with luteal support.",
          limitation: "A sparse illustrative cycle cannot date an individual's ovulation. Indices of different hormones are not comparable molar concentrations.",
          visual: "separate-line-panels",
          values: { differences, start, end, separateHormoneScales: true }
        });
      }
      case "b-model-development-timing": {
        const control = number2("control"), exposed = number2("exposed"), n = number2("samplesPerGroup");
        if (![control, exposed, n].every(Number.isSafeInteger) || n <= 0 || Math.min(control, exposed) < 0 || Math.max(control, exposed) > n) throw new Error("Invalid development counts");
        const controlProportion = control / n, exposedProportion = exposed / n;
        return result({
          columns: ["Group", "Marker M present", "Samples", "Proportion"],
          rows: [["No agent", control, n, controlProportion], ["Agent X", exposed, n, exposedProportion]],
          explanation: "Subtract the control proportion from the exposed proportion within this stage. Compare that difference with the other stage before claiming a constant effect.",
          limitation: "Synthetic non-human cell-model data concern marker M, not a human birth outcome or a personal risk estimate.",
          visual: "paired-proportions",
          values: { difference: exposedProportion - controlProportion }
        });
      }
      case "c-model-chromosome-counts": {
        const stages = ["G1", "after-S", "after-meiosis-I", "after-meiosis-II"];
        const counts = stages.map((stage) => stageCounts(number2("diploid"), stage));
        return result({
          columns: ["Stage (per cell)", "Chromosomes", "DNA molecules", "Chromosome sets"],
          rows: stages.map((stage, i) => [stage, counts[i].chromosomes, counts[i].chromatids, counts[i].sets]),
          explanation: "S phase copies DNA without adding chromosome sets. Meiosis I separates homologues; meiosis II separates sister chromatids. The last two rows describe each resulting daughter cell after division.",
          limitation: "A paired diploid model with successful segregation. An undivided anaphase cell and one daughter cell have different counting boundaries.",
          visual: "chromosome-stages",
          values: { diploid: number2("diploid"), stages: [...stages], counts }
        });
      }
      case "c-model-inheritance-cross": {
        const first = text("parent1"), second = text("parent2"), probabilities = monohybridCross(first, second);
        return result({
          columns: ["Genotype", "Probability"],
          rows: Object.entries(probabilities),
          explanation: "Combine one allele from each parent's gamete. Repeated rows or columns represent repeated allele probabilities, not different allele types.",
          limitation: "Equal segregation and fertilization probabilities at one autosomal locus. Complete dominance applies only when converting these genotypes to the stated simple phenotype model.",
          visual: "punnett-square",
          values: { first, second, probabilities, dominantPhenotype: probabilities.AA + probabilities.Aa, recessivePhenotype: probabilities.aa }
        });
      }
      case "c-model-sequence-expression": {
        const coding = text("coding5to3"), rna = transcribeDNA(coding, "coding-5-to-3"), translation = translateRNA(rna, 0);
        return result({
          columns: ["Representation", "Sequence or outcome"],
          rows: [["Coding DNA, 5\u2032 \u2192 3\u2032", coding], ["RNA, 5\u2032 \u2192 3\u2032", rna], ["Codons in supplied frame", translation.codons.join(" ")], ["Peptide, N \u2192 C", translation.peptide.join("\u2013")], ["Stop in supplied excerpt", translation.stopIndex === null ? "not present" : `yes, RNA base ${translation.stopIndex + 1}`], ["Trailing incomplete bases", translation.trailingBases || "none"]],
          explanation: "Read from the first base in the stated frame. A synonymous substitution can preserve this peptide; a one-base insertion shifts later codon boundaries.",
          limitation: "A short coding excerpt does not establish whole-gene expression or protein function. A stop is not an amino acid; an incomplete codon is not translated.",
          visual: "aligned-sequences",
          values: { coding, rna, ...translation }
        });
      }
      case "d-model-gene-pool": {
        const counts = [number2("AA"), number2("Aa"), number2("aa")];
        const frequencies = alleleFrequencies(counts[0], counts[1], counts[2]);
        return result({
          columns: ["Genotype", "Observed count", "Observed frequency", "Expected frequency under equilibrium"],
          rows: ["AA", "Aa", "aa"].map((genotype, i) => [genotype, counts[i], frequencies.observed[i], frequencies.expectedUnderEquilibrium[i]]),
          explanation: "Calculate allele frequencies from all observed genotypes using 2N as the denominator. Then calculate p\xB2, 2pq and q\xB2 as conditional expectations; they are separate from observed frequencies.",
          limitation: "Agreement at one time does not prove all equilibrium assumptions. A frequency change alone does not identify selection, movement or sampling as its cause.",
          visual: "observed-expected-bars",
          values: frequencies
        });
      }
      case "d-model-population-balance": {
        const initial = number2("initial"), days = number2("days"), area = number2("areaM2");
        if (area <= 0) throw new Error("Model area must be positive");
        const balance = demographicChange(initial, number2("births"), number2("immigration"), number2("deaths"), number2("emigration"), days);
        return result({
          columns: ["Quantity", "Value", "Unit or interval"],
          rows: [["Initial population", initial, "individuals"], ["Births", number2("births"), `individuals over ${days} days`], ["Immigration", number2("immigration"), `individuals over ${days} days`], ["Deaths", number2("deaths"), `individuals over ${days} days`], ["Emigration", number2("emigration"), `individuals over ${days} days`], ["Net change", balance.change, "individuals"], ["Final population", balance.final, "individuals"], ["Final density", balance.final / area, "individuals/m\xB2"], ["Absolute growth rate", balance.absolutePerTime, "individuals/day"], ["Per initial individual", balance.perInitialIndividualOverInterval, `over ${days} days`], ["Average per initial individual per day", balance.averagePerInitialIndividualPerTime, "day\u207B\xB9"]],
          explanation: "Add births and immigration; subtract deaths and emigration. Keep the initial population, elapsed time and area as separate denominators for different questions.",
          limitation: "This whole-population scenario is separate from the quadrat estimate. Two time points do not establish an exponential or logistic growth curve.",
          visual: "population-balance",
          values: { ...balance, initial, days, area, initialDensity: initial / area, finalDensity: balance.final / area }
        });
      }
      case "d-model-competition": {
        const a = number2("A"), b = number2("B"), first = number2("replicate1"), second = number2("replicate2"), days = number2("days");
        if (![a, b].every(Number.isSafeInteger) || a <= 0 || b < 0 || Math.min(first, second) < 0 || days <= 0) throw new Error("Invalid competition treatment");
        const mean = (first + second) / 2;
        return result({
          columns: ["Replicate", "Mean dry mass per focal A plant (g/A)"],
          rows: [[1, first], [2, second], ["Mean of replicates", mean]],
          explanation: "Compare 5 A with 10 A to examine within-species density. Compare 10 A with 5 A + 5 B at equal total density to examine composition, while noting the change in focal A density.",
          limitation: "Two synthetic replicate means do not establish statistical significance or identify a limiting resource. Plant mass is not a population growth rate.",
          visual: "replicate-comparison",
          values: { a, b, totalDensityPerPot: a + b, days, first, second, mean }
        });
      }
      default:
        throw new Error(`Unknown Biology model operation: ${model.id}`);
    }
  }

  // scripts/lib/biology30-course/v1/pilot2-model-plot.ts
  function renderTopicModelPlot(graph, instance) {
    const left = 100, right = 920, top = 110, bottom = 430, maximum = graph.maxima[0];
    if (!Number.isFinite(maximum) || maximum <= 0 || !graph.x.length || graph.series.some((series2) => series2.expected.length !== graph.x.length || series2.expected.some((value) => !Number.isFinite(value) || value < 0 || value > maximum))) throw new Error("Invalid model plot data or scale");
    const numeric = graph.kind === "line" && graph.x.every((value) => typeof value === "number"), xs = graph.x, xmin = numeric ? Math.min(...xs) : 0, xmax = numeric ? Math.max(...xs) : 0;
    const x = (index) => numeric ? left + (right - left) * (xmax === xmin ? 0.5 : (xs[index] - xmin) / (xmax - xmin)) : left + (right - left) * (index + 0.5) / graph.x.length;
    const y = (value) => bottom - (bottom - top) * value / maximum, n = (value) => Number(value.toFixed(3));
    const grid = Array.from({ length: 6 }, (_v, index) => {
      const value = maximum * index / 5, py = y(value);
      return `<path d="M${left} ${n(py)}H${right}" stroke="#d9e1df"/><text x="${left - 12}" y="${n(py + 6)}" text-anchor="end" font-size="20">${topicHtml(Number(value.toPrecision(5)))}</text>`;
    }).join("");
    const colours = ["#176a65", "#815022", "#3d588b"];
    const series = graph.series.map((series2, s) => {
      const colour = colours[s % colours.length], barWidth = Math.min(70, (right - left) / graph.x.length * 0.7 / graph.series.length);
      const points = series2.expected.map((value, index) => {
        const px = x(index), py = y(value), title = `<title>${topicHtml(series2.label)}; ${topicHtml(graph.x[index])}: ${topicHtml(value)}</title>`;
        return graph.kind === "bar" ? `<rect x="${n(px + (s - (graph.series.length - 1) / 2) * barWidth - barWidth / 2 + 2)}" y="${n(py)}" width="${n(barWidth - 4)}" height="${n(bottom - py)}" fill="${colour}">${title}</rect>${value === 0 ? `<circle cx="${n(px + (s - (graph.series.length - 1) / 2) * barWidth)}" cy="${bottom}" r="4" fill="${colour}"/>` : ""}` : `<circle cx="${n(px)}" cy="${n(py)}" r="5" fill="white" stroke="${colour}" stroke-width="2">${title}</circle>`;
      }).join("");
      const line = graph.kind === "line" ? `<path d="${series2.expected.map((value, index) => `${index ? "L" : "M"}${n(x(index))} ${n(y(value))}`).join(" ")}" fill="none" stroke="${colour}" stroke-width="2"/>` : "";
      return `<g><path d="M100 ${30 + s * 28}h32" stroke="${colour}" stroke-width="4"/><text x="145" y="${37 + s * 28}" font-size="20">${topicHtml(series2.label)}</text>${line}${points}</g>`;
    }).join("");
    const id = `${graph.id}-${instance}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="560" viewBox="0 0 960 560" role="img" aria-labelledby="${topicHtml(id)}-title ${topicHtml(id)}-description"><title id="${topicHtml(id)}-title">${topicHtml(graph.title)}</title><desc id="${topicHtml(id)}-description">${topicHtml(graph.xLabels[0])}; ${topicHtml(graph.yLabels[0])}. Every full-precision value is represented; the adjacent table supplies readable values.</desc><rect width="960" height="560" fill="white"/><g fill="#233531" font-family="sans-serif">${grid}<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#344643"/>${graph.x.map((value, index) => `<text x="${n(x(index))}" y="462" text-anchor="middle" font-size="20">${topicHtml(value)}</text>`).join("")}<text x="510" y="520" text-anchor="middle" font-size="22">${topicHtml(graph.xLabels[0])}</text><text transform="translate(30 270) rotate(-90)" text-anchor="middle" font-size="22">${topicHtml(graph.yLabels[0])}</text>${series}</g></svg>`;
  }

  // scripts/lib/biology30-course/v1/pilot2-render-model-output.ts
  var display = (value) => typeof value === "number" ? Number(value.toPrecision(6)) : value;
  function plot(output, graphs) {
    return graphs.map((graph) => {
      const svg = renderTopicModelPlot(graph, `${output.modelId}-${output.choice}-result`);
      return `<figure class="p2-figure"><div class="p2-graph-scroll" tabindex="0" role="region" aria-label="Model result graph; scroll on narrow screens">${svg}</div><figcaption>${topicHtml(graph.title)}</figcaption><p>${graph.kind === "line" ? "Connecting lines guide comparison; they do not establish unmeasured intermediate values." : "Bar height represents the named quantity for each comparison group."}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge result graph</button></figure>`;
    }).join("");
  }
  function renderTopicModelOutput(output) {
    let visual = "";
    const bar = (id, title, x, series, maximum) => ({ id: `${output.modelId}-${id}`, title, kind: "bar", x, series, xLabels: ["Comparison group"], yLabels: [title], maxima: [maximum], expectedAxes: [0, 0, 0] });
    if (output.visual === "separate-line-panels") {
      visual = plot(output, output.columns.slice(1).map((label, index) => {
        const values = output.rows.map((row) => Number(row[index + 1]));
        return { id: `${output.modelId}-hormone-${index}`, title: label, kind: "line", x: output.rows.map((row) => Number(row[0])), series: [{ id: `hormone-${index}`, label, expected: values }], xLabels: ["Cycle day"], yLabels: [label], maxima: [Math.max(1, ...values) * 1.2], expectedAxes: [0, 0, 0] };
      }));
    } else if (output.visual === "paired-proportions") visual = plot(output, [bar("proportions", "Proportion with marker M", output.rows.map((row) => String(row[0])), [{ id: "proportion", label: "Marker M proportion", expected: output.rows.map((row) => Number(row[3])) }], 1)]);
    else if (output.visual === "observed-expected-bars") visual = plot(output, [bar("frequencies", "Genotype frequency", output.rows.map((row) => String(row[0])), [{ id: "observed", label: "Observed frequency", expected: output.rows.map((row) => Number(row[2])) }, { id: "expected", label: "Expected under equilibrium", expected: output.rows.map((row) => Number(row[3])) }], 1)]);
    else if (output.visual === "replicate-comparison") {
      const rows = output.rows.filter((row) => typeof row[0] === "number"), values = rows.map((row) => Number(row[1]));
      visual = plot(output, [bar("replicates", "Mean dry mass per focal A plant (g/A)", rows.map((row) => `Replicate ${row[0]}`), [{ id: "replicate", label: "Replicate mean", expected: values }], Math.max(1, ...values) * 1.2)]);
    } else if (output.visual === "punnett-square") {
      const first = String(output.values.first), second = String(output.values.second);
      if (!/^[Aa]{2}$/.test(first) || !/^[Aa]{2}$/.test(second)) throw new Error("Unsupported model gamete representation");
      visual = renderTopicDataset({ columns: ["Gamete from second parent", ...first.split("").map((allele) => `First parent: ${allele} (\xBD)`)], rows: second.split("").map((allele) => [`${allele} (\xBD)`, ...first.split("").map((other) => (other + allele).split("").sort().join(""))]) }, "Punnett square: each cell has probability \xBC");
    } else if (output.visual === "chromosome-stages") {
      const panels = output.rows.map((row, index) => {
        const count2 = Number(row[1]), molecules = Number(row[2]), replicated = molecules === 2 * count2;
        if (!Number.isInteger(count2) || count2 < 1 || count2 > 100 || !replicated && molecules !== count2) throw new Error("Unsupported chromosome model count");
        const left = 20 + index * 240;
        const icons = Array.from({ length: count2 }, (_v, i) => {
          const x = left + 30 + i % 8 * 23, y = 110 + Math.floor(i / 8) * 30;
          return `<path d="${replicated ? `M${x - 5} ${y - 10}L${x + 5} ${y + 10}M${x + 5} ${y - 10}L${x - 5} ${y + 10}` : `M${x} ${y - 10}V${y + 10}`}" stroke="#176a65" stroke-width="3"/><circle cx="${x}" cy="${y}" r="2" fill="#233531"/>`;
        }).join("");
        return `<g><text x="${left + 110}" y="35" text-anchor="middle" font-size="20">${topicHtml(row[0])}</text><rect x="${left}" y="60" width="220" height="430" rx="12" fill="none" stroke="#344643"/>${icons}<text x="${left + 110}" y="530" text-anchor="middle" font-size="20">${count2} chromosomes</text><text x="${left + 110}" y="560" text-anchor="middle" font-size="20">${molecules} DNA molecules</text><text x="${left + 110}" y="590" text-anchor="middle" font-size="20">${topicHtml(row[3])} chromosome sets</text></g>`;
      }).join("");
      visual = `<figure class="p2-figure"><div class="p2-graph-scroll" tabindex="0" role="region" aria-label="Chromosome counts in one cell at each stage"><svg xmlns="http://www.w3.org/2000/svg" width="980" height="620" viewBox="0 0 980 620" role="img"><title>Chromosome and DNA molecule counts per cell</title><desc>Single rods have one DNA molecule; paired rods joined at one centromere have two. The adjacent table gives every count.</desc><rect width="980" height="620" fill="white"/>${panels}</svg></div><figcaption>Counts in one cell or final product at each named stage</figcaption><p>Symbols represent chromosome counts and replication state. They do not reconstruct particular chromosome identities or allele combinations.</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge chromosome model</button></figure>`;
    } else if (output.visual === "population-balance") {
      const values = new Map(output.rows.map((row) => [String(row[0]), Number(row[1])]));
      visual = `<p class="p2-equation" aria-label="Population balance equation">${topicHtml(values.get("Initial population"))} + ${topicHtml(values.get("Births"))} + ${topicHtml(values.get("Immigration"))} \u2212 ${topicHtml(values.get("Deaths"))} \u2212 ${topicHtml(values.get("Emigration"))} = ${topicHtml(values.get("Final population"))} individuals</p>`;
    } else if (!["aligned-sequences", "pathway-observations"].includes(output.visual)) throw new Error("Unsupported model result display");
    return `<section data-pilot2-model-result-kind="${topicHtml(output.visual)}"><h3>${topicHtml(output.title)}</h3>${visual}${renderTopicDataset({ columns: output.columns, rows: output.rows.map((row) => row.map(display)) }, "Model observations and calculated values")}<p>${topicHtml(output.explanation)}</p><p>${topicHtml(output.limitation)}</p></section>`;
  }

  // scripts/lib/biology30-course/v1/pilot2-model-controls.ts
  function mountTopicModelControls(root, state, schema, models, controls) {
    const elements = models.map((model) => {
      const panel = Array.from(root.querySelectorAll("[data-pilot2-model]")).find((panel2) => panel2.dataset.pilot2Model === model.id);
      if (!panel) return null;
      return { model, panel, choice: panel.querySelector("[data-pilot2-model-choice]"), button: panel.querySelector("[data-pilot2-model-test]"), result: panel.querySelector("[data-pilot2-model-result]"), status: panel.querySelector("[data-pilot2-model-status]") };
    }).filter((item) => item !== null);
    const clear = (ids) => {
      if (ids.some((id) => !schema.flags[id])) throw new Error("Unknown model flag");
      state.flags = state.flags.filter((id) => !ids.includes(id));
    };
    function refresh() {
      for (const item of elements) {
        const { model, choice, button, result } = item;
        choice.value = state.choices[model.id] ?? "";
        const prediction = state.responses[model.predictionId] ?? "", ready = Boolean(prediction.trim()) && prediction.length <= schema.responses[model.predictionId].limit && model.options.includes(choice.value);
        button.disabled = !ready;
        const show = ready && state.flags.includes(model.testFlag);
        result.hidden = !show;
        item.panel.querySelectorAll("[data-pilot2-model-case]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.pilot2ModelCaseValue === choice.value)));
        const empty = item.panel.querySelector("[data-pilot2-model-empty]");
        if (empty) empty.hidden = show;
        const predictionField = item.panel.querySelector(`[data-pilot2-response="${model.predictionId}"]`), explanationField = item.panel.querySelector(`[data-pilot2-response="${model.explanationId}"]`);
        if (predictionField) predictionField.disabled = !choice.value;
        if (explanationField) explanationField.disabled = !show;
        if (show && result.dataset.resultChoice !== choice.value) {
          result.innerHTML = renderTopicModelOutput(runBiology30TopicModel(model, choice.value));
          result.dataset.resultChoice = choice.value;
        }
      }
      controls.refresh();
    }
    const input = (event) => {
      const field = event.target;
      if (field instanceof HTMLTextAreaElement && models.some((model) => [model.predictionId, model.explanationId].includes(field.dataset.pilot2Response ?? ""))) refresh();
    };
    const change = (event) => {
      if (!(event.target instanceof HTMLSelectElement) || !event.target.dataset.pilot2ModelChoice) return;
      const field = event.target, item = elements.find((item2) => item2.model.id === field.dataset.pilot2ModelChoice);
      if (!item) return;
      const value = field.value;
      if (value && !item.model.options.includes(value)) throw new Error("Unknown model scenario");
      if (value) state.choices[item.model.id] = value;
      else delete state.choices[item.model.id];
      clear([item.model.testFlag, item.model.collectionFlag]);
      controls.saveDraft();
      item.status.textContent = "Scenario changed. Test it before saving this explanation to the collection.";
      refresh();
    };
    const click = (event) => {
      const target = event.target instanceof Element ? event.target.closest("button") : null;
      if (!target || target.disabled) return;
      const caseId = target.dataset.pilot2ModelCase;
      if (caseId) {
        const item2 = elements.find((i) => i.model.id === caseId);
        item2.choice.value = target.dataset.pilot2ModelCaseValue;
        item2.choice.dispatchEvent(new Event("change", { bubbles: true }));
        return;
      }
      const button = target.matches("[data-pilot2-model-test]") ? target : null;
      if (!button) return;
      const item = elements.find((item2) => item2.model.id === button.dataset.pilot2ModelTest);
      if (!item) return;
      runBiology30TopicModel(item.model, item.choice.value);
      clear([item.model.testFlag, item.model.collectionFlag]);
      state.flags.push(item.model.testFlag);
      const saved = controls.saveDraft();
      item.status.textContent = saved.saved ? "Scenario tested and saved. Explain the result." : "Result is available. Saving was not confirmed.";
      refresh();
    };
    root.addEventListener("input", input);
    root.addEventListener("change", change);
    root.addEventListener("click", click);
    refresh();
    return { refresh, dispose() {
      root.removeEventListener("input", input);
      root.removeEventListener("change", change);
      root.removeEventListener("click", click);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-frayer-controls.ts
  function mountTopicFrayerControls(root, state, schema, controls) {
    const choices = Array.from(root.querySelectorAll("[data-pilot2-frayer-choice]")), status = root.querySelector("[data-pilot2-frayer-status]");
    const writing = Array.from(root.querySelectorAll("[data-pilot2-frayer-writing]"));
    const active = (id) => schema.families.fixed.includes(id) || state.frayerChoices.includes(id);
    const ready = (id) => (schema.families.responseIds[id] ?? []).length === 4 && schema.families.responseIds[id].every((field) => Boolean(state.responses[field]?.trim()) && state.responses[field].length <= schema.responses[field].limit);
    function refresh() {
      root.querySelectorAll("[data-p2-choose-family]").forEach((button) => {
        const selected = active(button.dataset.p2ChooseFamily);
        button.disabled = selected;
        button.textContent = selected ? "Selected for Frayer" : "Choose this concept";
      });
      choices.forEach((choice, index) => {
        choice.value = state.frayerChoices[index] ?? "";
        choice.disabled = index === 1 && !state.frayerChoices.length;
        choice.querySelectorAll("option").forEach((option) => {
          option.disabled = Boolean(option.value && state.frayerChoices.some((id, slot) => slot !== index && id === option.value));
        });
      });
      writing.forEach((panel) => {
        const id = panel.dataset.pilot2FrayerWriting, collected = state.flags.includes(id + "-collected");
        panel.hidden = !active(id);
        const button = panel.querySelector("[data-pilot2-collect-toggle]");
        if (button) button.textContent = collected ? "Remove from Process Collection" : "Add to Process Collection";
        const status2 = panel.querySelector("[data-pilot2-collection-status]");
        if (status2) status2.textContent = ready(id) ? collected ? "Collected" : "Ready to collect" : "Complete all four fields first.";
      });
      root.querySelectorAll("[data-pilot2-frayer-compare]").forEach((button) => {
        button.disabled = !active(button.dataset.pilot2FrayerCompare) || !ready(button.dataset.pilot2FrayerCompare);
        if (button.disabled) {
          button.setAttribute("aria-expanded", "false");
          button.textContent = "Compare with course model";
          const guide = root.querySelector(`#${CSS.escape(button.dataset.pilot2FrayerCompare + "-guide")}`);
          if (guide) guide.hidden = true;
        }
      });
      controls.refresh();
    }
    const change = (event) => {
      const field = event.target;
      if (field instanceof HTMLSelectElement && field.dataset.pilot2FrayerChoice !== void 0) {
        const index = Number(field.dataset.pilot2FrayerChoice), old = state.frayerChoices[index] ?? null, next = field.value;
        try {
          if (!next) {
            if (old && schema.families.responseIds[old].some((id) => state.responses[id]?.length)) throw new Error("Copy and explicitly clear this family\u2019s writing before removing it.");
            state.frayerChoices = state.frayerChoices.filter((id) => id !== old);
          } else {
            const previous = [...state.frayerChoices], replaced = replaceFrayerChoice(state, schema, old, next);
            if (old) replaced.frayerChoices = previous.map((id) => id === old ? next : id);
            Object.assign(state, replaced);
          }
          const result = controls.saveDraft();
          if (status) status.textContent = result.saved ? "Family selection saved." : result.message;
        } catch (error) {
          if (status) status.textContent = String(error).replace(/^Error: /, "");
        }
        refresh();
      } else if (field instanceof HTMLInputElement && field.dataset.pilot2FrayerClearConfirm) {
        const id = field.dataset.pilot2FrayerClearConfirm;
        const button = Array.from(root.querySelectorAll("[data-pilot2-frayer-clear]")).find((button2) => button2.dataset.pilot2FrayerClear === id);
        if (button) button.disabled = !field.checked;
      }
    };
    const input = (event) => {
      const field = event.target;
      if (!(field instanceof HTMLTextAreaElement) || !field.dataset.pilot2Response) return;
      const family = Object.entries(schema.families.responseIds).find(([, ids]) => ids.includes(field.dataset.pilot2Response))?.[0];
      if (!family) return;
      const panel = root.querySelector(`#${CSS.escape(family + "-guide")}`);
      if (panel) panel.hidden = true;
      const button = Array.from(root.querySelectorAll("[data-pilot2-frayer-compare]")).find((button2) => button2.dataset.pilot2FrayerCompare === family);
      if (button) {
        button.setAttribute("aria-expanded", "false");
        button.textContent = "Compare with course model";
      }
      refresh();
    };
    const click = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || button.disabled) return;
      if (button.hasAttribute("data-pilot2-collect-toggle")) {
        refresh();
        return;
      }
      const id = button.dataset.pilot2FrayerClear, compare = button.dataset.pilot2FrayerCompare;
      if (id) {
        const confirm = Array.from(root.querySelectorAll("[data-pilot2-frayer-clear-confirm]")).find((field) => field.dataset.pilot2FrayerClearConfirm === id);
        if (!confirm?.checked) return;
        try {
          Object.assign(state, clearFrayer(state, schema, id, true));
        } catch {
          if (status) status.textContent = "Another current response cannot be saved. Keep a copy or revise it before clearing this family.";
          return;
        }
        root.querySelectorAll("[data-pilot2-response]").forEach((field) => {
          if (schema.families.responseIds[id].includes(field.dataset.pilot2Response)) field.value = "";
        });
        confirm.checked = false;
        button.disabled = true;
        const guide = root.querySelector(`#${CSS.escape(id + "-guide")}`);
        if (guide) guide.hidden = true;
        const result = controls.saveDraft();
        if (status) status.textContent = result.saved ? "This family\u2019s writing was cleared. Other work is unchanged." : "Clear was not saved. Earlier saved writing remains available after reload.";
        refresh();
      } else if (compare && active(compare) && ready(compare)) {
        const guide = root.querySelector(`#${CSS.escape(compare + "-guide")}`);
        if (guide) {
          guide.hidden = !guide.hidden;
          button.setAttribute("aria-expanded", String(!guide.hidden));
          button.textContent = guide.hidden ? "Compare with course model" : "Hide course model";
        }
      }
    };
    root.addEventListener("change", change);
    root.addEventListener("input", input);
    root.addEventListener("click", click);
    root.addEventListener("pilot2-state-change", refresh);
    refresh();
    return { refresh, dispose() {
      root.removeEventListener("change", change);
      root.removeEventListener("input", input);
      root.removeEventListener("click", click);
      root.removeEventListener("pilot2-state-change", refresh);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-graph-svg.ts
  var escape2 = (text) => String(text).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  var number = (value) => Number(value.toFixed(2));
  function renderBiology30GraphSvg(work, graphIndex, draft, instance = "learner") {
    validateGraphDraft(work, draft);
    const graph = work.graphs[graphIndex], drawing = draft.g[graphIndex];
    if (!graph || !drawing) throw new Error("Unknown required graph");
    const width = 960, height = 560, left = 96, right = 920, top = 108, bottom = 424;
    const maximum = drawing.a[2] === null ? null : graph.maxima[drawing.a[2]];
    const xLabel = drawing.a[0] === null ? "Horizontal label not chosen" : graph.xLabels[drawing.a[0]];
    const yLabel = drawing.a[1] === null ? "Vertical label not chosen" : graph.yLabels[drawing.a[1]];
    const numericX = graph.x.every((value) => typeof value === "number");
    const xValues = graph.x;
    const minimumX = numericX ? Math.min(...xValues) : 0;
    const maximumX = numericX ? Math.max(...xValues) : 0;
    const x = (index) => numericX ? left + (right - left) * (maximumX === minimumX ? 0.5 : (xValues[index] - minimumX) / (maximumX - minimumX)) : left + (right - left) * (index + 0.5) / graph.x.length;
    const y = (value) => bottom - (bottom - top) * value / maximum;
    const colours = ["#176a65", "#815022", "#3d588b", "#8c4567"];
    const warnings = [];
    const layers = [];
    const values = [];
    const description = [`${xLabel}; ${yLabel}.`, maximum === null ? "No vertical scale selected." : `Vertical scale: zero to ${maximum}.`];
    if (maximum === null) warnings.push("Choose a vertical maximum to plot the entered values.");
    graph.series.forEach((series, seriesIndex) => {
      const colour = colours[seriesIndex % colours.length];
      const dash = seriesIndex % 2 ? ' stroke-dasharray="9 5"' : "";
      layers.push(`<g data-series="${escape2(series.id)}"><path d="M96 ${36 + seriesIndex * 28} h38" fill="none" stroke="${colour}" stroke-width="3"${dash}/><text x="148" y="${43 + seriesIndex * 28}" font-size="20">${escape2(series.label)}</text>`);
      let line = "", connected = false;
      drawing.p[seriesIndex].forEach((value, index) => {
        values.push({ series: series.label, x: graph.x[index], value });
        description.push(`${series.label}, ${graph.x[index]}: ${value === null ? "blank" : value}.`);
        if (value === null || maximum === null) {
          connected = false;
          return;
        }
        if (value > maximum) {
          connected = false;
          warnings.push(`${series.label}, ${graph.x[index]}: ${value} exceeds the selected maximum ${maximum}.`);
          layers.push(`<text data-outside-scale="true" x="${number(x(index))}" y="98" text-anchor="middle" fill="#9d3025" font-size="18">\u2191 ${escape2(value)}</text>`);
          return;
        }
        const px = number(x(index)), py = number(y(value));
        if (graph.kind === "bar") {
          const barWidth = Math.min(88, (right - left) / graph.x.length * 0.55);
          layers.push(`<rect data-point="${index}" data-value="${value}" x="${number(px - barWidth / 2)}" y="${py}" width="${barWidth}" height="${number(bottom - py)}" fill="${colour}"><title>${escape2(series.label)}; ${escape2(graph.x[index])}: ${value}</title></rect>`);
          if (value === 0) layers.push(`<circle data-zero="true" cx="${px}" cy="${bottom}" r="4" fill="${colour}"/><text x="${px}" y="${bottom - 10}" text-anchor="middle" font-size="18">0</text>`);
        } else {
          line += `${connected ? "L" : "M"}${px} ${py} `;
          connected = true;
          const title = `<title>${escape2(series.label)}; ${escape2(graph.x[index])}: ${value}</title>`;
          layers.push(seriesIndex % 2 ? `<rect data-point="${index}" data-value="${value}" x="${px - 5}" y="${py - 5}" width="10" height="10" fill="white" stroke="${colour}" stroke-width="2">${title}</rect>` : `<circle data-point="${index}" data-value="${value}" cx="${px}" cy="${py}" r="5" fill="white" stroke="${colour}" stroke-width="2">${title}</circle>`);
        }
      });
      if (line) layers.push(`<path data-entered-line="true" d="${line.trim()}" fill="none" stroke="${colour}" stroke-width="2"${dash}/>`);
      layers.push("</g>");
    });
    const grid = [];
    if (maximum !== null) for (let tick = 0; tick <= 5; tick++) {
      const value = maximum * tick / 5, py = number(y(value));
      grid.push(`<path d="M${left} ${py}H${right}" stroke="#d9e1df"/><text x="${left - 14}" y="${py + 6}" text-anchor="end" font-size="18">${number(value)}</text>`);
    }
    graph.x.forEach((value, index) => {
      const px = number(x(index));
      const words = String(value).split("/");
      grid.push(`<path d="M${px} ${bottom}v7" stroke="#344643"/><text x="${px}" y="${bottom + 30}" text-anchor="middle" font-size="18">${words.map((word2, line) => `<tspan x="${px}" dy="${line ? 22 : 0}">${escape2(word2)}</tspan>`).join("")}</text>`);
    });
    const titleId = `${graph.id}-${instance}-drawing-title`, descId = `${graph.id}-${instance}-drawing-description`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="${escape2(titleId)} ${escape2(descId)}"><title id="${escape2(titleId)}">${escape2(graph.title)}</title><desc id="${escape2(descId)}">${escape2(description.join(" "))}</desc><rect width="${width}" height="${height}" fill="white"/><g font-family="Arial, Helvetica, sans-serif" fill="#233531">${grid.join("")}<path d="M${left} ${top}V${bottom}H${right}" fill="none" stroke="#344643" stroke-width="2"/><text x="${(left + right) / 2}" y="524" text-anchor="middle" font-size="22">${escape2(xLabel)}</text><text transform="translate(30 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle" font-size="22">${escape2(yLabel)}</text>${layers.join("")}</g></svg>`;
    return {
      svg,
      values,
      warnings,
      width,
      height,
      interpretation: graph.kind === "line" ? "Markers show supplied positions; connecting lines guide comparison and do not establish unmeasured intermediate observations." : "Bar height shows the entered value for each category; a blank is not zero."
    };
  }

  // scripts/lib/biology30-course/v1/pilot2-graph-controls.ts
  function mountTopicGraphControls(root, state, schema, works, controls) {
    const dispose = [];
    for (const work of works) {
      let drawings2 = function() {
        work.graphs.forEach((graph, index) => {
          const result = renderBiology30GraphSvg(work, index, draft, `${work.responseId}-draft`), target = panel.querySelector(`[data-pilot2-graph-drawing="${index}"]`);
          target.innerHTML = `<figure class="p2-figure"><div class="p2-graph-scroll" role="region" aria-label="Your graph; scroll horizontally on a narrow screen" tabindex="0">${result.svg}</div><figcaption>${topicHtml(graph.title)} \u2014 your entered values</figcaption><p>${topicHtml(result.interpretation)}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge graph</button></figure>${result.warnings.map((warning) => `<p>${topicHtml(warning)}</p>`).join("")}${renderTopicDataset({ columns: ["Series", "Position", "Entered value"], rows: result.values.map((value) => [value.series, value.x, value.value ?? "Not plotted"]) }, "Your plotted values")}`;
        });
      }, compare2 = function(force = false) {
        comparison.hidden = !force && !state.flags.includes(`${work.responseId}-attempted`) || panel.dataset.pilot2GraphInvalid === "true" || preserved !== null;
        if (comparison.hidden) return;
        const reports = compareGraphDraft(work, draft), findings = panel.querySelector("[data-pilot2-graph-findings]");
        const names = { "blank": "not entered", "matches": "matches the supplied value or label", "fits-source-values": "contains the supplied values; a larger scale gives less visual detail", "scale-too-small": "too small for the supplied values", "compare-axis-label": "compare this label with the measured quantity", "compare-source-value": "compare this point with the supplied value" };
        findings.innerHTML = reports.map((report, index) => `<section><h5>${topicHtml(work.graphs[index].title)}</h5><ul>${report.axes.map((value, axis) => `<li>${["Horizontal label", "Vertical label", "Vertical maximum"][axis]}: ${topicHtml(names[value])}</li>`).join("")}${report.series.flatMap((series, s) => series.points.map((value, p) => `<li>${topicHtml(work.graphs[index].series[s].label)} at ${topicHtml(work.graphs[index].x[p])}: ${topicHtml(names[value])}</li>`)).join("")}</ul></section>`).join("");
        const model = emptyGraphDraft(work);
        model.g.forEach((plot2, index) => {
          plot2.a = [...work.graphs[index].expectedAxes];
          plot2.p = work.graphs[index].series.map((series) => [...series.expected]);
        });
        findings.innerHTML += `<h4>Read-only comparison graphs</h4>${work.graphs.map((graph, index) => {
          const answer = renderBiology30GraphSvg(work, index, model, `${work.responseId}-answer`);
          return `<figure class="p2-figure"><div class="p2-graph-scroll" role="region" aria-label="Comparison graph; scroll horizontally on a narrow screen" tabindex="0">${answer.svg}</div><figcaption>${topicHtml(graph.title)} \u2014 supplied values</figcaption><p>${topicHtml(answer.interpretation)}</p><button type="button" data-pilot2-enlarge aria-haspopup="dialog">Enlarge comparison graph</button></figure>`;
        }).join("")}<p>${topicHtml(work.modelExplanation)}</p>`;
      }, restore2 = function() {
        panel.querySelectorAll("[data-pilot2-graph-axis]").forEach((field) => {
          const [g, a] = field.dataset.pilot2GraphAxis.split(":").map(Number);
          field.value = draft.g[g].a[a] === null ? "" : String(draft.g[g].a[a]);
        });
        panel.querySelectorAll("[data-pilot2-graph-point]").forEach((field) => {
          const [g, s, p] = field.dataset.pilot2GraphPoint.split(":").map(Number);
          field.value = draft.g[g].p[s][p] === null ? "" : String(draft.g[g].p[s][p]);
        });
        explanation.value = draft.e;
        drawings2();
        compare2();
      }, update2 = function() {
        if (preserved !== null) return;
        try {
          panel.querySelectorAll("[data-pilot2-graph-point]").forEach((field) => {
            if (field.validity.badInput) throw new Error("Finish the number before saving this construction.");
            const [g, s, p] = field.dataset.pilot2GraphPoint.split(":").map(Number);
            draft.g[g].p[s][p] = field.value.trim() === "" ? null : Number(field.value);
          });
          panel.querySelectorAll("[data-pilot2-graph-axis]").forEach((field) => {
            const [g, a] = field.dataset.pilot2GraphAxis.split(":").map(Number);
            draft.g[g].a[a] = field.value.trim() === "" ? null : Number(field.value);
          });
          draft.e = explanation.value;
          const serialized = encodeGraphDraft(work, draft, schema.responses[work.responseId].limit);
          panel.dataset.pilot2GraphInvalid = "false";
          state.responses[work.responseId] = serialized;
          const result = controls.responseChanged(work.responseId);
          status.textContent = result.saved ? result.message : "Construction remains visible; saving was not confirmed.";
          drawings2();
          compare2();
        } catch {
          panel.dataset.pilot2GraphInvalid = "true";
          status.textContent = `Construction not saved. Use numbers from 0 to 9999.99 with at most two decimal places and an explanation up to ${work.explanationLimit} characters. Current entries remain visible; the previous valid response is retained.`;
          comparison.hidden = true;
          controls.refresh();
          root.dispatchEvent(new Event("pilot2-draft-change"));
        }
      };
      var drawings = drawings2, compare = compare2, restore = restore2, update = update2;
      const panel = Array.from(root.querySelectorAll("[data-pilot2-graph-work]")).find((node) => node.dataset.pilot2GraphWork === work.responseId);
      if (!panel) continue;
      const saved = state.responses[work.responseId], decoded = saved ? decodeGraphDraft(work, saved) : null;
      let draft = decoded?.kind === "graph" ? decoded.draft : emptyGraphDraft(work), preserved = decoded?.kind === "preserved-writing" ? decoded.original : null;
      const editor = panel.querySelector("[data-pilot2-graph-editor]"), recovery = panel.querySelector("[data-pilot2-graph-recovery]"), original = panel.querySelector("[data-pilot2-graph-original]"), confirm = panel.querySelector("[data-pilot2-graph-recovery-confirm]"), start = panel.querySelector("[data-pilot2-graph-start]"), explanation = panel.querySelector("[data-pilot2-graph-explanation]"), status = panel.querySelector("[data-pilot2-graph-status]"), comparison = panel.querySelector("[data-pilot2-graph-comparison]");
      if (preserved !== null) {
        editor.hidden = true;
        recovery.hidden = false;
        original.value = preserved;
      }
      const input = (event) => {
        if (event.target === explanation || event.target instanceof HTMLInputElement && event.target.dataset.pilot2GraphPoint) update2();
      };
      const change = (event) => {
        if (event.target === confirm) start.disabled = !confirm.checked;
        else if (event.target instanceof HTMLSelectElement && event.target.dataset.pilot2GraphAxis) update2();
      };
      const startNew = () => {
        if (!confirm.checked || preserved === null) return;
        state.legacy.push({ source: `Earlier response: ${work.responseId}`, original: preserved });
        preserved = null;
        editor.hidden = false;
        start.disabled = true;
        confirm.disabled = true;
        draft = emptyGraphDraft(work);
        restore2();
        update2();
      };
      const check = (event) => {
        const button = event.target instanceof Element ? event.target.closest("[data-pilot2-check],[data-pilot2-compare]") : null;
        if (button && !button.disabled && (button.dataset.pilot2Check === work.responseId || button.dataset.pilot2Compare === work.responseId)) compare2(Boolean(button.dataset.pilot2Compare));
      };
      panel.addEventListener("input", input);
      panel.addEventListener("change", change);
      start.addEventListener("click", startNew);
      root.addEventListener("click", check);
      restore2();
      dispose.push(() => {
        panel.removeEventListener("input", input);
        panel.removeEventListener("change", change);
        start.removeEventListener("click", startNew);
        root.removeEventListener("click", check);
      });
    }
    controls.refresh();
    return { dispose() {
      dispose.forEach((cleanup) => cleanup());
    } };
  }
  function currentUnsavedGraphWork(root, works, index = []) {
    return works.flatMap((work) => {
      const panel = Array.from(root.querySelectorAll("[data-pilot2-graph-work]")).find((panel2) => panel2.dataset.pilot2GraphWork === work.responseId);
      if (panel?.dataset.pilot2GraphInvalid !== "true") return [];
      const fields = [];
      panel.querySelectorAll("[data-pilot2-graph-axis]").forEach((field) => {
        const [g, a] = field.dataset.pilot2GraphAxis.split(":").map(Number);
        fields.push({ label: `${work.graphs[g].title}: ${["horizontal axis", "vertical axis", "vertical maximum"][a]}`, text: field.selectedOptions[0]?.text ?? "Not selected" });
      });
      panel.querySelectorAll("[data-pilot2-graph-point]").forEach((field) => {
        const [g, s, p] = field.dataset.pilot2GraphPoint.split(":").map(Number);
        fields.push({ label: `${work.graphs[g].title}: ${work.graphs[g].series[s].label} at ${work.graphs[g].x[p]}`, text: field.value || "Not plotted" });
      });
      fields.push({ label: "Explanation", text: panel.querySelector("[data-pilot2-graph-explanation]").value });
      return [{ id: `${work.responseId}-unsaved-draft`, title: "Unsaved graph draft", category: "Unsaved draft", routeId: index.find((entry) => entry.id === work.responseId)?.routeId ?? null, focusId: work.responseId, fields }];
    });
  }

  // scripts/lib/biology30-course/v1/pilot2-collection-view.ts
  function currentTopicWork(index, state, schema, graphs = [], legacySchema) {
    validateTopicActivityIndex(index, schema);
    const displaySchema = { ...schema, responses: Object.fromEntries(Object.entries(schema.responses).map(([id, field]) => [id, { ...field, limit: Math.max(field.limit, typeof state.responses[id] === "string" ? state.responses[id].length : 0) }])) };
    return collectTopicWork(index, state, displaySchema, graphs, legacySchema);
  }
  function collectedWorkText(entries) {
    return entries.map((entry) => `${entry.title}
${entry.category}
${entry.fields.map((field) => `${field.label}
${field.text}`).join("\n\n")}`).join("\n\n\u2500\u2500\u2500\u2500\n\n");
  }
  function workHtml(entries, withReturn, groupFor = (e) => e.category) {
    return [...new Set(entries.map(groupFor))].map((category) => `<section class="process-work-group"><h3>${topicHtml(category)}</h3>${entries.filter((e) => groupFor(e) === category).map((entry) => `<article class="process-work-item p2-work-entry"><div><p class="process-work-context">${topicHtml(entry.category)}</p><h4>${topicHtml(entry.title)}</h4>${entry.fields.map((field) => `<section><p class="process-work-prompt">${topicHtml(field.label)}</p><p class="process-work-response p2-preserved-text">${topicHtml(field.text)}</p></section>`).join("")}</div><div class="process-work-side">${withReturn && entry.routeId && entry.focusId ? `<a href="#${topicHtml(entry.routeId)}" data-pilot2-return-route="${topicHtml(entry.routeId)}" data-pilot2-return-focus="${topicHtml(entry.focusId)}">Return to this activity</a>` : ""}</div></article>`).join("")}</section>`).join("");
  }
  function mountTopicCollection(root, index, state, schema, graphs = [], legacySchema, extraDrafts = () => []) {
    const search = root.querySelector("[data-pilot2-work-search]"), category = root.querySelector("[data-pilot2-work-category]"), list = root.querySelector("[data-pilot2-work-list]"), status = root.querySelector("[data-pilot2-work-status]"), fallback = root.querySelector("[data-pilot2-copy-fallback]"), print = root.querySelector("[data-pilot2-print-work]");
    if (!search || !category || !list || !status || !fallback || !print) throw new Error("Incomplete collection controls");
    const chapter = root.querySelector("[data-p2-work-chapter]");
    const chapterFor = (entry) => {
      const route = entry.routeId ? root.querySelector(`#${CSS.escape(entry.routeId)}`) : null;
      const target = entry.focusId ? root.querySelector(`#${CSS.escape(entry.focusId)}`) : null;
      const unlock = target?.dataset.p2UnlockRoute;
      const taught = unlock ? root.querySelector(`#${CSS.escape(unlock)}`) : null;
      const n = target?.dataset.p2Chapter ?? taught?.dataset.p2Chapter ?? route?.dataset.p2Chapter;
      return n ? `Chapter ${n}` : /seminar|final|challenge/.test(entry.routeId ?? "") ? "Unit review" : "Personal and collection work";
    };
    let current = [];
    const refresh = () => {
      try {
        current = [...currentTopicWork(index, state, schema, graphs, legacySchema), ...extraDrafts()];
      } catch {
        status.textContent = "Some current work cannot be interpreted. Keep the visible responses and recovery text before leaving.";
        return false;
      }
      const selected = category.value, categories = [...new Set(current.map((entry) => entry.category))].sort();
      category.replaceChildren(new Option("All types", ""), ...categories.map((value) => new Option(value, value)));
      category.value = categories.includes(selected) ? selected : "";
      if (chapter) {
        const selectedChapter = chapter.value, chapters = [...new Set(current.map(chapterFor))].sort();
        chapter.replaceChildren(new Option("All chapters", ""), ...chapters.map((value) => new Option(value, value)));
        chapter.value = chapters.includes(selectedChapter) ? selectedChapter : "";
      }
      const query = search.value.trim().toLocaleLowerCase(), filtered = current.filter((entry) => (!chapter?.value || chapterFor(entry) === chapter.value) && (!category.value || entry.category === category.value) && (!query || [entry.title, ...entry.fields.flatMap((field) => [field.label, field.text])].join(" ").toLocaleLowerCase().includes(query)));
      list.innerHTML = filtered.length ? workHtml(filtered, true, chapterFor) : "<p>No work matches this view.</p>";
      status.textContent = `Showing ${filtered.length} of ${current.length} work entries.`;
      return true;
    };
    let printParent = null, printNext = null;
    const finishPrint = () => {
      root.ownerDocument.body.classList.remove("p2-printing-work");
      if (printParent) {
        printParent.insertBefore(print, printNext?.parentNode === printParent ? printNext : null);
        printParent = null;
      }
    };
    window.addEventListener("afterprint", finishPrint);
    const click = async (event) => {
      const button = event.target instanceof Element ? event.target.closest("button") : null;
      if (!button || !root.contains(button)) return;
      if (button.hasAttribute("data-pilot2-copy-all")) {
        if (!refresh()) return;
        const text = collectedWorkText(current);
        try {
          await navigator.clipboard.writeText(text);
          status.textContent = "Whole collection copied.";
          fallback.hidden = true;
        } catch {
          fallback.value = text;
          fallback.hidden = false;
          fallback.focus();
          fallback.select();
          status.textContent = "Automatic copying is unavailable. The whole collection is selected below for copying.";
        }
      } else if (button.hasAttribute("data-pilot2-print-all")) {
        if (!refresh()) return;
        finishPrint();
        print.innerHTML = `<h1>All My Work</h1>${workHtml(current, false, chapterFor)}`;
        printParent = print.parentNode;
        printNext = print.nextSibling;
        root.ownerDocument.body.append(print);
        root.ownerDocument.body.classList.add("p2-printing-work");
        try {
          window.print();
        } catch {
          finishPrint();
          status.textContent = "Printing did not open. Copy all work to keep a readable copy.";
        }
      }
    };
    root.addEventListener("click", click);
    root.addEventListener("pilot2-state-change", refresh);
    root.addEventListener("pilot2-draft-change", refresh);
    search.addEventListener("input", refresh);
    category.addEventListener("change", refresh);
    chapter?.addEventListener("change", refresh);
    refresh();
    return { refresh, dispose() {
      finishPrint();
      window.removeEventListener("afterprint", finishPrint);
      root.removeEventListener("click", click);
      root.removeEventListener("pilot2-state-change", refresh);
      root.removeEventListener("pilot2-draft-change", refresh);
      search.removeEventListener("input", refresh);
      category.removeEventListener("change", refresh);
      chapter?.removeEventListener("change", refresh);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-figure-viewer.ts
  function mountTopicFigureViewer(root) {
    const doc = root.ownerDocument, dialog = doc.createElement("dialog");
    dialog.className = "p2-figure-dialog";
    dialog.setAttribute("aria-label", "Enlarged teaching figure");
    const title = doc.createElement("h2"), close = doc.createElement("button"), label = doc.createElement("label"), original = doc.createElement("input"), viewport = doc.createElement("div"), image = doc.createElement("img"), explanation = doc.createElement("p");
    title.textContent = "Enlarged figure";
    close.type = "button";
    close.textContent = "Close figure";
    close.dataset.testid = "pilot2-figure-close";
    original.type = "checkbox";
    label.append(original, doc.createTextNode(" Show original size"));
    viewport.className = "p2-figure-viewport";
    viewport.tabIndex = 0;
    viewport.setAttribute("role", "region");
    viewport.setAttribute("aria-label", "Enlarged figure; scroll when showing original size");
    viewport.append(image);
    dialog.append(title, close, label, viewport, explanation);
    root.append(dialog);
    let opener = null;
    const resize = () => viewport.classList.toggle("p2-figure-original", original.checked);
    const onClose = () => {
      opener?.focus();
      opener = null;
      image.removeAttribute("src");
    };
    const closeDialog = () => dialog.close();
    const onClick = (event) => {
      const button = event.target instanceof Element ? event.target.closest("button[data-pilot2-enlarge]") : null;
      if (!button || !root.contains(button)) return;
      const figure = button.closest("figure"), source = figure?.querySelector("img,svg");
      if (!source || !figure || dialog.open) return;
      opener = button;
      title.textContent = figure.querySelector("figcaption")?.textContent ?? "Enlarged figure";
      if (source instanceof HTMLImageElement) {
        image.src = source.src;
        image.alt = source.alt;
        image.width = source.naturalWidth || Number(source.getAttribute("width"));
        image.height = source.naturalHeight || Number(source.getAttribute("height"));
      } else {
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(source))}`;
        image.alt = source.querySelector("desc")?.textContent ?? source.querySelector("title")?.textContent ?? "Teaching graph";
        image.width = Number(source.getAttribute("width"));
        image.height = Number(source.getAttribute("height"));
      }
      explanation.textContent = figure.querySelector("p")?.textContent ?? "";
      original.checked = false;
      resize();
      dialog.showModal();
      close.focus();
    };
    root.addEventListener("click", onClick);
    close.addEventListener("click", closeDialog);
    original.addEventListener("change", resize);
    dialog.addEventListener("close", onClose);
    return { dispose() {
      if (dialog.open) dialog.close();
      root.removeEventListener("click", onClick);
      close.removeEventListener("click", closeDialog);
      original.removeEventListener("change", resize);
      dialog.removeEventListener("close", onClose);
      dialog.remove();
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-return-links.ts
  function mountTopicReturnLinks(root, routes) {
    let frame = null;
    let pending2 = null;
    const afterRoute = () => {
      if (!pending2 || location.hash !== `#${pending2.route}`) return;
      if (frame !== null) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = pending2?.target;
        if (!target || location.hash !== `#${pending2.route}`) return;
        root.dispatchEvent(new CustomEvent("pilot2-reveal-target", { detail: target }));
        if (target instanceof HTMLDetailsElement) target.open = true;
        let parent = target.parentElement;
        while (parent && parent !== root) {
          if (parent instanceof HTMLDetailsElement) parent.open = true;
          parent = parent.parentElement;
        }
        const visible = (node) => !node.closest("[hidden]") && node.getClientRects().length > 0;
        const field = target.matches("input,textarea,select,button,a[href]") && visible(target) ? target : [...target.querySelectorAll("textarea,input,select"), ...target.querySelectorAll("button,a[href]")].find(visible);
        const reading = target.hasAttribute("data-p2-reading-target"), focus = reading ? target : field ?? target;
        if ((reading || !field) && !focus.hasAttribute("tabindex")) focus.tabIndex = -1;
        focus.focus();
        focus.scrollIntoView({ block: "center" });
        frame = null;
        pending2 = null;
      });
    };
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest("[data-pilot2-return-route]") : null;
      if (!link || !root.contains(link)) return;
      const route = link.dataset.pilot2ReturnRoute, id = link.dataset.pilot2ReturnFocus;
      const target = root.querySelector(`#${CSS.escape(id)}`);
      if (!routes.includes(route) || !target) throw new Error(`Missing activity return target: ${route}/${id}`);
      event.preventDefault();
      const routed = route.endsWith("-overview") ? "overview" : route;
      if (frame !== null) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      pending2 = { target, route: routed };
      if (location.hash !== `#${routed}`) location.hash = routed;
      else window.dispatchEvent(new HashChangeEvent("hashchange"));
    };
    root.addEventListener("click", onClick);
    window.addEventListener("hashchange", afterRoute);
    return { dispose() {
      root.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", afterRoute);
      if (frame !== null) cancelAnimationFrame(frame);
      pending2 = null;
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-render-reference.ts
  function mountTopicGlossary(root) {
    const search = root.querySelector("[data-pilot2-glossary-search]"), status = root.querySelector("[data-pilot2-glossary-status]"), entries = Array.from(root.querySelectorAll("[data-pilot2-glossary-term]"));
    if (!search || !status) throw new Error("Missing glossary controls");
    const update = () => {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const entry of entries) {
        entry.hidden = !(entry.textContent ?? "").toLocaleLowerCase().includes(query);
        if (!entry.hidden) visible++;
      }
      status.textContent = `${visible} of ${entries.length} terms shown.`;
    };
    search.addEventListener("input", update);
    update();
    return { dispose() {
      search.removeEventListener("input", update);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-session.ts
  function topicSaveMessage(result) {
    if (!result.accepted) return "Not saved: some current work is too large or cannot be read safely. Keep it visible or use Copy all before leaving.";
    const local = result.local === "saved" ? "Saved on this device." : result.local === "unavailable" ? "Device saving is unavailable." : "Device saving failed; current writing remains visible.";
    const lms = result.commit === "confirmed" ? " LMS save confirmed." : result.setValue === "accepted" ? " LMS accepted the data but did not confirm saving." : result.setValue === "failed" ? " LMS did not accept this save." : " LMS saving is unavailable in this session.";
    return local + lms;
  }
  function mountTopicSession(root, input, state, models, graphs, local, lms, legacySchema) {
    validateTopicState(state, input.state);
    if (input.state.wordFrayers) Object.assign(state, migrateTopicWordFrayers(state, input.state));
    const index = buildTopicActivityIndex(input), cleanup = [];
    let latestSaveConfirmed = true;
    const progress = () => {
      try {
        const completed = completedTopicRoutes(input, state, graphs);
        root.querySelectorAll("[data-pilot2-progress-percent]").forEach((node) => {
          node.textContent = `${Math.round(100 * completed.length / input.contract.requiredRoutes.length)}%`;
        });
        root.querySelectorAll("[data-pilot2-progress-count]").forEach((node) => {
          node.textContent = `${completed.length} / ${input.contract.requiredRoutes.length} required routes`;
        });
        root.querySelectorAll("[data-pilot2-progress-fill]").forEach((node) => {
          node.style.width = `${Math.round(100 * completed.length / input.contract.requiredRoutes.length)}%`;
        });
        root.querySelectorAll("[data-pilot2-required-progress]").forEach((node) => {
          node.textContent = `${completed.length} of ${input.contract.requiredRoutes.length} required activities complete.`;
        });
        root.querySelectorAll("[data-pilot2-route-status]").forEach((node) => {
          node.textContent = completed.includes(node.dataset.pilot2RouteStatus) ? "Complete" : "In progress";
        });
      } catch {
        root.querySelectorAll("[data-pilot2-required-progress]").forEach((node) => {
          node.textContent = "Progress cannot be updated until the current oversized or invalid draft is revised. Your writing remains available.";
        });
      }
    };
    const controls = mountTopicControls(root, state, input.state, (current) => {
      const result = persistTopicState(current, input.state, local, lms);
      latestSaveConfirmed = result.local === "saved" || result.commit === "confirmed";
      return { saved: latestSaveConfirmed, message: topicSaveMessage(result) };
    }, graphs);
    cleanup.push(controls.dispose);
    cleanup.push(mountTopicGraphControls(root, state, input.state, graphs, controls).dispose, mountTopicModelControls(root, state, input.state, models, controls).dispose, mountTopicFrayerControls(root, state, input.state, controls).dispose);
    const archiveWork = () => {
      if (!local) return [];
      return readTopicRecoveryArchive(local, input.state).map((entry, position) => {
        let fields;
        try {
          fields = collectTopicWork(index, decodeTopicState(entry.raw, input.state), input.state, graphs, legacySchema).flatMap((work) => work.fields.map((field) => ({ label: `${work.title}: ${field.label}`, text: field.text })));
        } catch {
          fields = legacySchema ? describeLegacyWork(entry.raw, legacySchema) : [{ label: "Original saved work", text: entry.raw }];
        }
        return { id: `recovery-archive-${position}`, title: `Preserved save: ${entry.label}`, category: "Preserved recovery versions", routeId: null, focusId: null, fields };
      }).filter((entry) => entry.fields.some((field) => field.text.trim().length > 0));
    };
    const wordWork = () => {
      if (!state.wordFrayers) return [];
      const data = JSON.parse(root.querySelector("#biology-word-data")?.textContent ?? "{}");
      return state.wordFrayers.filter((s) => s.answers.some((a) => a.length)).map((s) => ({ id: "word-frayer-" + s.id, title: s.kind === "word" ? data.words?.find((w) => w.id === s.id)?.term ?? s.id : "Preserved earlier Frayer: " + (data.categories?.find((c) => c.id === s.id)?.label ?? s.id), category: s.collected ? "Collected vocabulary" : "Vocabulary drafts", routeId: input.state.unit.toLowerCase() + "-core-vocabulary", focusId: s.kind === "word" ? "word-frayer-" + s.id : null, fields: s.answers.map((text, i) => ({ label: ["Definition", "Characteristics", "Example", "Non-example"][i], text })) }));
    };
    cleanup.push(mountTopicCollection(root, index, state, input.state, graphs, legacySchema, () => [...currentUnsavedGraphWork(root, graphs, index), ...archiveWork(), ...wordWork()]).dispose);
    cleanup.push(mountSourceVideos(root).dispose, mountTopicMedia(root).dispose, mountTopicFigureViewer(root).dispose, mountTopicReturnLinks(root, input.state.routes).dispose);
    if (root.querySelector("[data-pilot2-glossary-search]")) cleanup.push(mountTopicGlossary(root).dispose);
    const routeChanged = () => {
      let hash;
      try {
        hash = decodeURIComponent(location.hash.slice(1));
      } catch {
        return;
      }
      const route = hash === "overview" ? `${input.state.unit.toLowerCase()}-overview` : hash;
      if (!input.state.routes.includes(route)) return;
      state.route = route;
      if (!state.visited.includes(route)) state.visited.push(route);
      controls.saveDraft();
    };
    root.addEventListener("pilot2-state-change", progress);
    root.addEventListener("pilot2-draft-change", progress);
    window.addEventListener("hashchange", routeChanged);
    cleanup.push(mountTopicPresentation(root, state, input.state, controls).dispose);
    routeChanged();
    progress();
    cleanup.push(mountTopicVocabularyPanel(root, input, state, controls).dispose);
    const unsaved = () => {
      try {
        return !latestSaveConfirmed || currentUnsavedGraphWork(root, graphs, index).length > 0 || !persistable();
      } catch {
        return true;
      }
    };
    const persistable = () => {
      try {
        encodeTopicState(state, input.state);
        return true;
      } catch {
        return false;
      }
    };
    const beforeUnload = (event) => {
      if (unsaved()) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", beforeUnload);
    return { state, controls, dispose() {
      cleanup.reverse().forEach((dispose) => dispose());
      root.removeEventListener("pilot2-state-change", progress);
      root.removeEventListener("pilot2-draft-change", progress);
      window.removeEventListener("hashchange", routeChanged);
      window.removeEventListener("beforeunload", beforeUnload);
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-startup.ts
  function startTopicCourse(root, recoveryRoot, sources, input, models, graphs, local, lms, legacySchema) {
    if (root === recoveryRoot || root.contains(recoveryRoot)) throw new Error("Recovery controls must remain outside the suspended course surface");
    let session, recovery;
    const begin = (state) => {
      recovery?.dispose();
      recoveryRoot.hidden = true;
      root.hidden = false;
      session = mountTopicSession(root, input, state, models, graphs, local, lms, legacySchema);
      const route = state.route.endsWith("-overview") ? "overview" : state.route;
      let current = "";
      try {
        current = decodeURIComponent(location.hash.slice(1));
      } catch {
      }
      if (!input.state.routes.includes(current) && current !== "overview") location.hash = route;
    };
    const recover = (inspection2) => {
      root.hidden = true;
      recoveryRoot.hidden = false;
      recoveryRoot.innerHTML = renderTopicRecovery(inspection2);
      recovery = mountTopicRecovery(recoveryRoot, inspection2, input.state, local, begin);
    };
    const inspection = inspectTopicRestore(sources, input.state);
    if (inspection.requiresChoice) recover(inspection);
    else if (!inspection.sources.length) begin(emptyTopicState(input.state));
    else {
      const candidate = inspection.candidates.find((candidate2) => candidate2.id === inspection.automaticId);
      if (!candidate) throw new Error("Restore inspection has no continuation state");
      const needsArchive = inspection.sources.some((source) => !candidate.sources.includes(source.id));
      let state = candidate.state;
      if (needsArchive) {
        if (!local) state = null;
        else try {
          state = activateTopicRestore(inspection, candidate.id, input.state, local, false).state;
        } catch {
          state = null;
        }
      }
      if (state) begin(state);
      else recover({ ...inspection, requiresChoice: true, automaticId: null });
    }
    return { getSession: () => session, dispose() {
      recovery?.dispose();
      session?.dispose();
    } };
  }

  // scripts/lib/biology30-course/v1/pilot2-browser-entry.ts
  function bootTopicBrowser(document2, host) {
    const root = document2.getElementById("pilot2-course-surface"), panel = document2.getElementById("pilot2-recovery");
    if (!root || !panel) throw new Error("Missing owning course surfaces");
    let environment, course;
    const stop = () => {
      course?.dispose();
      environment?.close();
    };
    const pageHide = (event) => {
      if (!event.persisted) stop();
    };
    try {
      const payload = JSON.parse(document2.getElementById("pilot2-course-data")?.textContent ?? "");
      if (payload.schemaVersion !== 1 || !Array.isArray(payload.models) || !Array.isArray(payload.graphs)) throw new Error("Invalid course startup data");
      validateTopicState(emptyTopicState(payload.activities.state), payload.activities.state);
      buildTopicActivityIndex(payload.activities);
      if (payload.activities.contract.unit !== payload.activities.state.unit) throw new Error("Mismatched unit startup data");
      environment = captureTopicEnvironment(host, payload.activities.state.unit, payload.activities.state.courseId);
      course = startTopicCourse(root, panel, environment.sources, payload.activities, payload.models, payload.graphs, environment.local, environment.lms, payload.legacySchema);
      host.addEventListener("pagehide", pageHide);
      return { course, dispose() {
        host.removeEventListener("pagehide", pageHide);
        stop();
      } };
    } catch {
      try {
        stop();
      } catch {
      }
      root.hidden = true;
      panel.hidden = false;
      panel.replaceChildren();
      const heading = document2.createElement("h1");
      heading.textContent = "Saved work could not be opened";
      const message = document2.createElement("p");
      message.textContent = "The course could not read its saved work or startup data safely. No empty replacement has been saved. Reopen this page to try again.";
      const retry = document2.createElement("button");
      retry.type = "button";
      retry.textContent = "Reopen this page";
      retry.addEventListener("click", () => host.location.reload());
      panel.append(heading, message, retry);
      return null;
    }
  }
  if (typeof document !== "undefined" && typeof window !== "undefined") bootTopicBrowser(document, window);
})();
