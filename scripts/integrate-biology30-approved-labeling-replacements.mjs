/**
 * Integrate teacher-approved Biology 30 Chapter 14-20 labeling replacements.
 *
 * This changes only diagram image sources. Activity IDs, answer maps, option lists,
 * saved-attempt namespaces and required-progress rules remain unchanged.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFile,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const root = process.cwd();
const archive = process.argv[2] || "/Users/deanguedo/Downloads/Biology30_Redone_Labeling_Images_30.zip";
const signoff = process.argv[3] || "/Users/deanguedo/Downloads/Biology30_Labeling_Signoff_2026-09-21.json";
const expectedApproved = 26;
const expectedPending = new Set([
  "ch14-label-feedback",
  "ch16-alternation-label",
  "ch18-translation-label",
  "ch20-change-label",
]);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const stableAnswers = (diagram) => JSON.stringify({ answers: diagram.answers, options: diagram.options });

const decisions = JSON.parse(await readFile(signoff, "utf8")).decisions;
const approved = decisions.filter((item) => item.decision === "replacement");
const pending = decisions.filter((item) => item.decision === "changes");

if (approved.length !== expectedApproved) {
  throw new Error(`Expected ${expectedApproved} approved replacements; found ${approved.length}.`);
}
if (pending.length !== expectedPending.size || pending.some((item) => !expectedPending.has(item.activity_id))) {
  throw new Error("The four pending activity IDs do not match the teacher sign-off boundary.");
}
if (approved.some((item) => item.answer_map_matches !== true)) {
  throw new Error("Every approved replacement must have answer_map_matches=true.");
}

const temp = await mkdtemp(path.join(os.tmpdir(), "biology30-labeling-approved-"));
const records = [];
try {
  execFileSync("unzip", ["-q", archive, "-d", temp], { stdio: "pipe" });

  for (const item of approved) {
    const chapter = Number(item.activity_id.match(/^ch(1[4-9]|20)-/)?.[1]);
    if (!chapter) throw new Error(`Unsupported activity ID: ${item.activity_id}`);

    const project = path.join(root, `projects/biology30-chapter-${chapter}`);
    const configPath = path.join(
      project,
      "meta/external-generation/authoring",
      chapter === 14 ? "label-diagrams.json" : "course-config.json",
    );
    const config = JSON.parse(await readFile(configPath, "utf8"));
    const diagrams = chapter === 14 ? config : config.labelDiagrams;
    const diagram = diagrams.find((candidate) => candidate.id === item.activity_id);
    if (!diagram) throw new Error(`Canonical diagram not found: ${item.activity_id}`);

    const before = stableAnswers(diagram);
    const source = path.join(temp, "images", `${item.activity_id}.png`);
    const sourceBytes = await readFile(source);
    const relative = `./assets/labeling/${item.activity_id}.png`;
    const destination = path.join(project, "workspace/assets/labeling", `${item.activity_id}.png`);
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
    diagram.src = relative;

    if (stableAnswers(diagram) !== before) {
      throw new Error(`Answer contract changed unexpectedly: ${item.activity_id}`);
    }
    await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
    records.push({
      activityId: item.activity_id,
      chapter,
      source: path.basename(archive),
      sourceSha256: sha256(sourceBytes),
      destination: path.relative(root, destination),
      canonicalConfig: path.relative(root, configPath),
      imageSource: relative,
      answerContractPreserved: true,
    });
  }
} finally {
  await rm(temp, { recursive: true, force: true });
}

const python = process.env.BIOLOGY_PYTHON || "python3";
const chapter14Owner = path.join(root, "projects/biology30-chapter-14/meta/external-generation");
execFileSync(python, [path.join(chapter14Owner, "scripts/build_chapter.py")], {
  cwd: chapter14Owner,
  stdio: "pipe",
  maxBuffer: 4e6,
});
execFileSync(python, [path.join(chapter14Owner, "scripts/patch_runtime.py")], {
  cwd: chapter14Owner,
  stdio: "pipe",
  maxBuffer: 4e6,
});

for (let chapter = 15; chapter <= 20; chapter += 1) {
  const owner = path.join(root, `projects/biology30-chapter-${chapter}/meta/external-generation`);
  execFileSync(python, [path.join(owner, "scripts/build.py")], {
    cwd: owner,
    stdio: "pipe",
    maxBuffer: 4e6,
  });
}

execFileSync("node", [path.join(root, "scripts/refresh-biology30-chapters14-20-portable.mjs")], {
  cwd: root,
  stdio: "pipe",
  maxBuffer: 4e6,
});

for (const record of records) {
  const html = await readFile(path.join(root, `projects/biology30-chapter-${record.chapter}/workspace/index.html`), "utf8");
  const match = html.match(/<script[^>]+id=["']course-data["'][^>]*>([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Chapter ${record.chapter}: course-data missing after rebuild.`);
  const course = JSON.parse(match[1]);
  const rendered = course.labelDiagrams.find((diagram) => diagram.id === record.activityId);
  if (!rendered || rendered.src !== record.imageSource) {
    throw new Error(`${record.activityId}: rebuilt workspace does not reference the approved PNG.`);
  }
}

const receipt = {
  schemaVersion: 1,
  integratedAt: new Date().toISOString(),
  sourceArchive: archive,
  sourceArchiveSha256: sha256(await readFile(archive)),
  teacherSignoff: signoff,
  teacherSignoffSha256: sha256(await readFile(signoff)),
  approvedCount: records.length,
  pendingActivityIds: [...expectedPending],
  invariants: {
    activityIdsUnchanged: true,
    answerMapsUnchanged: true,
    optionListsUnchanged: true,
    saveNamespacesUnchanged: true,
    requiredProgressRulesUnchanged: true,
  },
  records,
};
await writeFile(
  path.join(root, "projects/biology30-chapter-14/meta/labeling-replacement-integration.json"),
  JSON.stringify(receipt, null, 2) + "\n",
);

console.log(`Integrated ${records.length} teacher-approved labeling replacements; preserved 4 pending diagrams.`);
