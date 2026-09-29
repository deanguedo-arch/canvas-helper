import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { buildScormStateCodecRuntime } from "./lib/scorm-state-codec.ts";

const stateCodec = new Function(`${buildScormStateCodecRuntime()}\nreturn stateCodec;`)();
const highEntropy = (seed: string, length = 600) => {
  let value = "";
  for (let index = 0; value.length < length; index += 1) value += createHash("sha256").update(`${seed}:${index}`).digest("base64url");
  return value.slice(0, length);
};

const packages = Object.fromEntries([1, 2, 3].map((part) => {
  const slug = `math10c-unit4-textbook-${part}`;
  const html = readFileSync(`projects/${slug}/workspace/index.html`, "utf8");
  const source = html.match(/<script type="application\/json" id="question-data">([\s\S]*?)<\/script>/)?.[1];
  if (!source) throw new Error(`${slug} has no question-data inventory`);
  const questions = JSON.parse(source) as unknown[];
  const state = { v: 1, rev: 999, route: "overview", selected: [], answers: questions.map((_, index) => [index, highEntropy(`${slug}:${index}`)]) };
  const application = JSON.stringify(state);
  const compressed = stateCodec.encode(application);
  const outer = JSON.stringify({
    version: 1, projectSlug: slug, savedAt: "2026-09-25T18:00:00.000Z", values: {}, scope: "course-scope", learnerId: "learner",
    course: { schemaVersion: 1, data: compressed, completedIds: [] },
    tracking: { schemaVersion: 1, bookmark: "overview", activeMs: 99999999, pageMs: {} }, reason: "edited",
  });
  return [slug, {
    questionCount: questions.length,
    responseCharactersPerQuestion: 600,
    applicationPayloadCharacters: application.length,
    losslessCodecOutputCharacters: compressed.length,
    scorm2004EnvelopeCharacters: outer.length,
    applicationLimitCharacters: 55_000,
    scorm2004SuspendDataLimitCharacters: 60_000,
    fitsApplicationLimit: application.length < 55_000,
    fitsScorm2004Envelope: outer.length < 60_000,
  }];
}));

const report = {
  schemaVersion: 1,
  measuredAt: "2026-09-25",
  method: "Every question contains a deterministic 600-character high-entropy response; state is encoded with the production SCORM state codec and wrapped in the production SCORM 2004 envelope shape.",
  packages,
};
writeFileSync("projects/resources/math10c-production/v1/chapter4/textbook-practice-capacity-report.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
