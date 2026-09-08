import { createHash } from "node:crypto";

type RuntimeActivities = {
  practiceItems: Array<{ id: string }>;
  interactions: Array<{ id: string; options?: Array<{ id: string }> }>;
  artifacts: Array<{ id: string; fields: Array<{ id: string }> }>;
};

export type Biology30SuspendDataSchema = {
  profile: "biology30-compact-suspend-v2";
  responses: Record<string, string>;
  practice: Record<string, string>;
  interactions: Record<string, { token: string; options: Record<string, string> }>;
  artifacts: Record<string, string>;
  lessons: Record<string, string>;
};

type Biology30StateLike = {
  updatedAt?: unknown;
  location?: unknown;
  responses?: unknown;
  practice?: unknown;
  interactions?: unknown;
  artifacts?: unknown;
  notebook?: unknown;
  completions?: unknown;
  finalPractice?: unknown;
};

function stableToken(namespace: string, id: string) {
  return createHash("sha256").update(`${namespace}\0${id}`).digest("base64url").slice(0, 7);
}

function tokenMap(namespace: string, ids: string[]) {
  const entries = ids.map((id) => [id, stableToken(namespace, id)] as const);
  const tokens = entries.map((entry) => entry[1]);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate ${namespace} identifier in Biology suspend-data schema.`);
  if (new Set(tokens).size !== tokens.length) throw new Error(`Token collision in Biology suspend-data ${namespace} schema.`);
  return Object.fromEntries(entries);
}

function lessonResponseId(courseSlug: string, lessonId: string, field: "warmup" | "exit") {
  const simple = lessonId.match(/^lesson-(\d+)$/);
  return `${courseSlug}:lesson:${simple ? simple[1] : lessonId}:${field}`;
}

export function buildBiology30SuspendDataSchema(input: {
  courseSlug: string;
  lessonIds: string[];
  activities: RuntimeActivities;
}): Biology30SuspendDataSchema {
  const responseIds = [
    ...input.lessonIds.flatMap((lessonId) => [
      lessonResponseId(input.courseSlug, lessonId, "warmup"),
      lessonResponseId(input.courseSlug, lessonId, "exit")
    ]),
    ...input.activities.artifacts.flatMap((artifact) => artifact.fields.map((field) => field.id))
  ];
  const interactions = Object.fromEntries(input.activities.interactions.map((interaction) => [
    interaction.id,
    {
      token: stableToken("interaction", interaction.id),
      options: tokenMap(`interaction-option:${interaction.id}`, (interaction.options ?? []).map((option) => option.id))
    }
  ]));
  const interactionTokens = Object.values(interactions).map((entry) => entry.token);
  if (new Set(interactionTokens).size !== interactionTokens.length) throw new Error("Token collision in Biology suspend-data interaction schema.");
  return {
    profile: "biology30-compact-suspend-v2",
    responses: tokenMap("response", responseIds),
    practice: tokenMap("practice", input.activities.practiceItems.map((item) => item.id)),
    interactions,
    artifacts: tokenMap("artifact", input.activities.artifacts.map((artifact) => artifact.id)),
    lessons: tokenMap("lesson", input.lessonIds)
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function encodeTime(value: unknown) {
  const parsed = Date.parse(typeof value === "string" ? value : "");
  return Number.isFinite(parsed) ? parsed.toString(36) : "0";
}

function tokenOrId(map: Record<string, string>, id: string) {
  return map[id] ?? id;
}

function compactActionPotential(value: unknown) {
  const record = asRecord(value);
  const stages = ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"];
  const current = Math.max(0, stages.indexOf(String(record.current ?? "rest")));
  const seen = Array.isArray(record.seen) ? record.seen.map(String) : [];
  const mask = stages.reduce((total, stage, index) => seen.includes(stage) ? total + 2 ** index : total, 0);
  return [current, mask.toString(36)];
}

export function compactBiology30SuspendData(state: Biology30StateLike, schema: Biology30SuspendDataSchema) {
  const responses = asRecord(state.responses);
  const practice = asRecord(state.practice);
  const interactions = asRecord(state.interactions);
  const generic = asRecord(asRecord(interactions.generic));
  const artifacts = asRecord(state.artifacts);
  const finalPractice = asRecord(state.finalPractice);
  return {
    v: 2,
    t: encodeTime(state.updatedAt),
    l: typeof state.location === "string" ? state.location : "overview",
    r: Object.entries(responses).map(([id, value]) => [tokenOrId(schema.responses, id), String(value ?? "")]),
    p: Object.entries(practice).map(([id, value]) => [tokenOrId(schema.practice, id), String(value ?? "")]),
    i: {
      a: compactActionPotential(interactions.actionPotential),
      b: (() => {
        const value = asRecord(interactions.bloodGlucose);
        return [String(value.current ?? "regulated-meal"), Array.isArray(value.seenScenarios) ? value.seenScenarios.map(String) : []];
      })(),
      g: Object.entries(generic).map(([id, raw]) => {
        const definition = schema.interactions[id];
        const value = asRecord(raw);
        const optionMap = definition?.options ?? {};
        const seen = Array.isArray(value.seen) ? value.seen.map(String) : [];
        return [
          definition?.token ?? id,
          tokenOrId(optionMap, String(value.current ?? "")),
          seen.map((optionId) => tokenOrId(optionMap, optionId))
        ];
      })
    },
    a: Object.keys(artifacts).map((id) => tokenOrId(schema.artifacts, id)),
    n: (Array.isArray(state.notebook) ? state.notebook : []).slice(0, 10).map((raw) => {
      const note = asRecord(raw);
      return [String(note.title ?? ""), String(note.body ?? "")];
    }),
    c: (Array.isArray(state.completions) ? state.completions : []).map(String).map((id) => tokenOrId(schema.lessons, id)),
    f: Object.keys(finalPractice).length ? [
      Number(finalPractice.percent ?? 0),
      Number(finalPractice.correct ?? 0),
      Number(finalPractice.total ?? 0)
    ] : null
  };
}

export function serializeBiology30SuspendData(state: Biology30StateLike, schema: Biology30SuspendDataSchema) {
  return JSON.stringify(compactBiology30SuspendData(state, schema));
}

function reverseMap(map: Record<string, string>) {
  return Object.fromEntries(Object.entries(map).map(([id, token]) => [token, id]));
}

function decodeTime(value: unknown) {
  const parsed = typeof value === "string" && /^[0-9a-z]+$/i.test(value) ? Number.parseInt(value, 36) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? new Date(parsed).toISOString() : new Date(0).toISOString();
}

function idOrToken(map: Record<string, string>, token: unknown) {
  const value = String(token ?? "");
  return map[value] ?? value;
}

export function expandBiology30SuspendData(value: unknown, schema: Biology30SuspendDataSchema, activities: RuntimeActivities) {
  const candidate = asRecord(value);
  if (candidate.v !== 2) throw new Error("Biology suspend data is not compact schema version 2.");
  const reverse = {
    responses: reverseMap(schema.responses),
    practice: reverseMap(schema.practice),
    artifacts: reverseMap(schema.artifacts),
    lessons: reverseMap(schema.lessons),
    interactions: Object.fromEntries(Object.entries(schema.interactions).map(([id, definition]) => [
      definition.token,
      { id, options: reverseMap(definition.options) }
    ])) as Record<string, { id: string; options: Record<string, string> }>
  };
  const updatedAt = decodeTime(candidate.t);
  const unpackPairs = (raw: unknown, map: Record<string, string>) => Object.fromEntries(
    (Array.isArray(raw) ? raw : []).flatMap((entry) => Array.isArray(entry) && entry.length >= 2
      ? [[idOrToken(map, entry[0]), String(entry[1] ?? "")]]
      : [])
  );
  const packedInteractions = asRecord(candidate.i);
  const actionStages = ["rest", "threshold", "depolarization", "repolarization", "hyperpolarization", "recovery"];
  const packedAction = Array.isArray(packedInteractions.a) ? packedInteractions.a : [];
  const currentAction = Math.max(0, Math.min(actionStages.length - 1, Number(packedAction[0]) || 0));
  const actionMask = Number.parseInt(String(packedAction[1] ?? "0"), 36) || 0;
  const generic = Object.fromEntries((Array.isArray(packedInteractions.g) ? packedInteractions.g : []).flatMap((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) return [];
    const definition = reverse.interactions[String(entry[0])];
    const id = definition?.id ?? String(entry[0]);
    const options = definition?.options ?? {};
    return [[id, {
      current: idOrToken(options, entry[1]),
      seen: (Array.isArray(entry[2]) ? entry[2] : []).map((token) => idOrToken(options, token))
    }]];
  }));
  const packedBloodGlucose = Array.isArray(packedInteractions.b) ? packedInteractions.b : [];
  const artifactById = new Map(activities.artifacts.map((artifact) => [artifact.id, artifact]));
  const artifactIds = (Array.isArray(candidate.a) ? candidate.a : []).map((token) => idOrToken(reverse.artifacts, token));
  const finalPractice = Array.isArray(candidate.f) && candidate.f.length >= 3 ? {
    submittedAt: updatedAt,
    percent: Number(candidate.f[0]) || 0,
    correct: Number(candidate.f[1]) || 0,
    total: Number(candidate.f[2]) || 0
  } : null;
  return {
    schemaVersion: 1,
    updatedAt,
    location: typeof candidate.l === "string" ? candidate.l : "overview",
    responses: unpackPairs(candidate.r, reverse.responses),
    practice: unpackPairs(candidate.p, reverse.practice),
    interactions: {
      actionPotential: {
        current: actionStages[currentAction],
        seen: actionStages.filter((_stage, index) => Boolean(actionMask & (2 ** index)))
      },
      bloodGlucose: {
        current: String(packedBloodGlucose[0] ?? "regulated-meal"),
        seenScenarios: Array.isArray(packedBloodGlucose[1]) ? packedBloodGlucose[1].map(String) : []
      },
      generic
    },
    artifacts: Object.fromEntries(artifactIds.map((id) => [id, {
      savedAt: updatedAt,
      fieldIds: artifactById.get(id)?.fields.map((field) => field.id) ?? []
    }])),
    notebook: (Array.isArray(candidate.n) ? candidate.n : []).slice(0, 10).flatMap((entry, index) => Array.isArray(entry) && entry.length >= 2 ? [{
      id: `note-restored-${index}-${String(candidate.t ?? "0")}`,
      title: String(entry[0] ?? ""),
      body: String(entry[1] ?? ""),
      savedAt: updatedAt
    }] : []),
    completions: (Array.isArray(candidate.c) ? candidate.c : []).map((token) => idOrToken(reverse.lessons, token)),
    finalPractice
  };
}
