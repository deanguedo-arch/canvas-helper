import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";

import { ENGLISH_ACTIVITY_PROFILE_RUNTIME } from "./activity-profile-runtime.js";
import { FILM_STUDY_PROFILE_RUNTIME } from "./film-study-profile-renderer.js";
import { NOVEL_STUDY_PROFILE_RUNTIME } from "./novel-study-profile-renderer.js";
import { SHAKESPEARE_READER_RUNTIME } from "./shakespeare-reader-renderer.js";
import { SHORT_FICTION_PROFILE_RUNTIME } from "./short-fiction-profile-renderer.js";
import {
  assertEnglishV3RuntimeHasNoCriticalEssay,
  composeEnglishV3Runtime,
  EnglishV3RuntimeSanitizationError,
  sanitizeEnglishV3Runtime,
} from "./v3-runtime-sanitizer.js";
import { WRITING_FOUNDATIONS_PROFILE_RUNTIME } from "./writing-foundations-profile-renderer.js";
import { ENGLISH_WRITING_SEQUENCE_RUNTIME } from "./writing-sequence-renderer.js";

function assertRunnable(source: string, filename: string) {
  assert.doesNotThrow(() => new vm.Script(source, { filename }));
}

function assertNoCriticalEssayRuntime(source: string, filename: string) {
  assert.doesNotThrow(() => assertEnglishV3RuntimeHasNoCriticalEssay(source, { fragmentId: filename }));
  assert.doesNotMatch(source, /critical(?:[-_\s]?essay)/i);
  assert.doesNotMatch(source, /data-(?:save-modern-essay-preview|modern-essay-preview)/i);
  assert.doesNotMatch(source, /data-novel-(?:essay-preview|save-essay-preview)/i);
  assert.doesNotMatch(source, /data-film-(?:essay-preview|save-essay-preview)/i);
}

test("V3 writing runtime removes Critical Essay and remains configuration-neutral for enabled forms", () => {
  const runtime = sanitizeEnglishV3Runtime({
    id: "writing-sequence",
    kind: "writing-sequence",
    source: ENGLISH_WRITING_SEQUENCE_RUNTIME,
  });

  assertRunnable(runtime, "v3-writing-sequence-runtime.js");
  assertNoCriticalEssayRuntime(runtime, "v3-writing-sequence-runtime.js");
  assert.match(runtime, /data-english-writing-preview-title/);
  assert.match(runtime, /kind\.split\("-"\)/);
  assert.doesNotMatch(runtime, /literary-exploration|Literary Exploration|visual-response|Visual Response/);
  assert.match(runtime, /data-english-writing-track-panel/);
  assert.match(runtime, /data-save-english-writing-preview/);
});

test("V3 modern runtime removes donor essay preview hooks and preserves native activity behavior", () => {
  const runtime = sanitizeEnglishV3Runtime({
    id: "modern-drama",
    kind: "modern-drama",
    source: ENGLISH_ACTIVITY_PROFILE_RUNTIME,
  });

  assertRunnable(runtime, "v3-modern-runtime.js");
  assertNoCriticalEssayRuntime(runtime, "v3-modern-runtime.js");
  assert.match(runtime, /data-english-activity-select/);
  assert.match(runtime, /data-repeatable-evidence-panel/);
  assert.match(runtime, /data-shakespeare-character-studio/);
  assert.match(runtime, /data-save-evidence-note/);
  assert.match(runtime, /data-activity-response/);
});

test("V3 novel runtime removes donor essay preview storage and preserves tracks, questions, and repeatables", () => {
  const runtime = sanitizeEnglishV3Runtime({
    id: "novel-study",
    kind: "novel-study",
    source: NOVEL_STUDY_PROFILE_RUNTIME,
  });

  assertRunnable(runtime, "v3-novel-runtime.js");
  assertNoCriticalEssayRuntime(runtime, "v3-novel-runtime.js");
  assert.match(runtime, /data-novel-track-select/);
  assert.match(runtime, /data-novel-phase-select/);
  assert.match(runtime, /data-repeatable-root/);
  assert.match(runtime, /data-save-profile-collection/);
});

test("V3 film runtime removes donor essay preview storage while preserving film tools and Personal Response", () => {
  const runtime = sanitizeEnglishV3Runtime({
    id: "film-study",
    kind: "film-study",
    source: FILM_STUDY_PROFILE_RUNTIME,
  });

  assertRunnable(runtime, "v3-film-runtime.js");
  assertNoCriticalEssayRuntime(runtime, "v3-film-runtime.js");
  assert.match(runtime, /data-film-viewing-save-draft/);
  assert.match(runtime, /data-film-viewing-evidence-save/);
  assert.match(runtime, /data-film-room-select/);
  assert.match(runtime, /data-film-save-personal-response-preview/);
});

test("V3 native short-fiction, Shakespeare, and writing-foundations runtimes remain executable", () => {
  const cases = [
    {
      id: "short-fiction",
      kind: "short-fiction" as const,
      source: SHORT_FICTION_PROFILE_RUNTIME,
      marker: /data-short-fiction-analysis-term/,
    },
    {
      id: "shakespeare-reader",
      kind: "shakespeare-drama" as const,
      source: SHAKESPEARE_READER_RUNTIME,
      marker: /data-reader-anchor/,
    },
    {
      id: "writing-foundations",
      kind: "writing-foundations" as const,
      source: WRITING_FOUNDATIONS_PROFILE_RUNTIME,
      marker: /data-wf-check-sentences/,
    },
  ];

  for (const runtimeCase of cases) {
    const runtime = sanitizeEnglishV3Runtime(runtimeCase);
    assertRunnable(runtime, `${runtimeCase.id}.js`);
    assertNoCriticalEssayRuntime(runtime, `${runtimeCase.id}.js`);
    assert.match(runtime, runtimeCase.marker);
  }
});

test("V3 runtime composition accepts already-combined medium and writing fragments and is idempotent", () => {
  const once = composeEnglishV3Runtime([
    { id: "novel-native", kind: "novel-study", source: NOVEL_STUDY_PROFILE_RUNTIME },
    { id: "writing", kind: "writing-sequence", source: ENGLISH_WRITING_SEQUENCE_RUNTIME },
  ]);
  const normalized = sanitizeEnglishV3Runtime({ id: "combined", kind: "composite", source: once });
  const twice = sanitizeEnglishV3Runtime({ id: "combined-again", kind: "composite", source: normalized });

  assert.equal(twice, normalized);
  assertRunnable(normalized, "v3-composed-runtime.js");
  assertNoCriticalEssayRuntime(normalized, "v3-composed-runtime.js");
  assert.match(normalized, /data-novel-track-select/);
  assert.match(normalized, /data-english-writing-preview-title/);
});

test("V3 runtime sanitizer fails closed for unknown Critical Essay residue", () => {
  assert.throws(
    () => sanitizeEnglishV3Runtime({
      id: "unknown-runtime",
      kind: "pass-through",
      source: `window.courseHooks = { route: "critical-essay", selector: "[data-custom-critical-essay]" };`,
    }),
    (error) => error instanceof EnglishV3RuntimeSanitizationError
      && error.fragmentId === "unknown-runtime"
      && error.violations.some((violation) => violation.code === "critical-essay-token"),
  );

  assert.throws(
    () => sanitizeEnglishV3Runtime({
      id: "unknown-camel-case-hook",
      kind: "pass-through",
      source: `window.courseHooks = { criticalEssayStorageKey: "unit:critical_essay:draft" };`,
    }),
    (error) => error instanceof EnglishV3RuntimeSanitizationError
      && error.fragmentId === "unknown-camel-case-hook"
      && error.violations.some((violation) => violation.code === "critical-essay-token"),
  );
});
