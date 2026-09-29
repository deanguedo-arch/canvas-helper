/** Integrate the teacher-approved final four Biology 30 labeling diagrams. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const signoffPath = process.argv[2] || "/Users/deanguedo/Downloads/Biology30_Labeling_Final_4_Signoff_2026-09-21.json";
const imageRoot = process.argv[3] || "/Users/deanguedo/Downloads/Biology30_Labeling_Final_4_Review_2026-09-21/assets";
const expected = new Set([
  "ch14-label-feedback",
  "ch16-alternation-label",
  "ch18-translation-label",
  "ch20-change-label",
]);
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const answerContract = (diagram) => JSON.stringify({ answers: diagram.answers, options: diagram.options });

const signoffBytes = await readFile(signoffPath);
const signoff = JSON.parse(signoffBytes);
if (!Array.isArray(signoff.decisions) || signoff.decisions.length !== expected.size) {
  throw new Error(`Expected ${expected.size} final decisions.`);
}
if (signoff.decisions.some((item) => !expected.has(item.activity_id))) {
  throw new Error("Final sign-off contains an unexpected activity ID.");
}
if (signoff.decisions.some((item) => item.decision !== "replacement")) {
  throw new Error("All four final diagrams must be explicitly approved before integration.");
}

const records = [];
for (const item of signoff.decisions) {
  const chapter = Number(item.activity_id.match(/^ch(1[4-9]|20)-/)?.[1]);
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
  const before = answerContract(diagram);

  const source = path.join(imageRoot, `${item.activity_id}.png`);
  const image = await readFile(source);
  if (image.subarray(1, 4).toString("ascii") !== "PNG") throw new Error(`${item.activity_id}: not a PNG.`);
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== 1600 || height !== 1000) {
    throw new Error(`${item.activity_id}: expected 1600x1000; found ${width}x${height}.`);
  }

  const relative = `./assets/labeling/${item.activity_id}.png`;
  const destination = path.join(project, "workspace/assets/labeling", `${item.activity_id}.png`);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  diagram.src = relative;
  if (answerContract(diagram) !== before) throw new Error(`${item.activity_id}: answer contract changed.`);
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");

  records.push({
    activityId: item.activity_id,
    chapter,
    imageSha256: sha256(image),
    dimensions: { width, height },
    destination: path.relative(root, destination),
    canonicalConfig: path.relative(root, configPath),
    imageSource: relative,
    answerContractPreserved: true,
  });
}

const python = process.env.BIOLOGY_PYTHON || "python3";
const chapter14Owner = path.join(root, "projects/biology30-chapter-14/meta/external-generation");
for (const script of ["build_chapter.py", "patch_runtime.py"]) {
  execFileSync(python, [path.join(chapter14Owner, "scripts", script)], {
    cwd: chapter14Owner,
    stdio: "pipe",
    maxBuffer: 4e6,
  });
}
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
  const htmlPath = path.join(root, `projects/biology30-chapter-${record.chapter}/workspace/index.html`);
  const html = await readFile(htmlPath, "utf8");
  const match = html.match(/<script[^>]+id=["']course-data["'][^>]*>([\s\S]*?)<\/script>/);
  const course = match && JSON.parse(match[1]);
  const rendered = course?.labelDiagrams?.find((diagram) => diagram.id === record.activityId);
  if (rendered?.src !== record.imageSource) {
    throw new Error(`${record.activityId}: rebuilt workspace does not reference the approved PNG.`);
  }
}

const receiptPath = path.join(root, "projects/biology30-chapter-14/meta/labeling-replacement-integration.json");
const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
receipt.integratedAt = new Date().toISOString();
receipt.finalFourSignoff = signoffPath;
receipt.finalFourSignoffSha256 = sha256(signoffBytes);
receipt.approvedCount = receipt.records.length + records.length;
receipt.pendingActivityIds = [];
receipt.records.push(...records);
await writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n");

console.log("Integrated all four final approved labeling replacements; 30 of 30 replacements are now applied.");
