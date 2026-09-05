import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import pdf from "pdf-parse";

export const BIOLOGY30_PILOT_PROJECT = "biology30-unit-a-pilot" as const;
export const BIOLOGY30_PILOT_PRIMARY_SHA256 = "46a6c8794419bcbd574888c2b54cbf42c2c551894a8f6844c2233b82ea7baed5";
export const BIOLOGY30_PILOT_REFERENCE_SHA256 = "0c00ebf519d0a727c569001b3f3840fb04b1040a726fa3d2cb36a9120f005761";

type SourceAsset = {
  id: string;
  sourceId: "class-2026-27" | "system-2020";
  itemId: string;
  archiveEntry: string;
  originalFilename: string;
  expectedSha256: string;
  expectedPages: number;
  role: "learner-textbook" | "learner-historical-copy" | "answer-authoring-source";
  rightsStatus: string;
  outputPath?: string;
  wrapperBytes?: number;
  printedPageStart?: number;
  printedPageEnd?: number;
  physicalPageStart?: number;
  physicalPageEnd?: number;
};

const TEXTBOOK_ASSETS: SourceAsset[] = [
  {
    id: "textbook-chapter-11",
    sourceId: "system-2020",
    itemId: "2226",
    archiveEntry: "_11_inquirybio_ch11.pdf",
    originalFilename: "_11_inquirybio_ch11.pdf",
    expectedSha256: "93f996d7015896614c22f2b6b526c0719f547bddaa6cf4a38b5ec0c5ba1564e4",
    expectedPages: 44,
    role: "learner-textbook",
    rightsStatus: "authorized-supplied-course-material-local-delivery",
    outputPath: "workspace/assets/textbook/chapter-11.pdf",
    wrapperBytes: 128,
    printedPageStart: 360,
    printedPageEnd: 403,
    physicalPageStart: 1,
    physicalPageEnd: 44
  },
  {
    id: "textbook-chapter-12",
    sourceId: "system-2020",
    itemId: "2227",
    archiveEntry: "_12_inquirybio_ch12.pdf",
    originalFilename: "_12_inquirybio_ch12.pdf",
    expectedSha256: "6b5660e0a63538c678913dd6d3019e0ab846d6f2db939884885daf8b5b82c3f3",
    expectedPages: 30,
    role: "learner-textbook",
    rightsStatus: "authorized-supplied-course-material-local-delivery",
    outputPath: "workspace/assets/textbook/chapter-12.pdf",
    wrapperBytes: 128,
    printedPageStart: 404,
    printedPageEnd: 433,
    physicalPageStart: 1,
    physicalPageEnd: 30
  },
  {
    id: "textbook-chapter-13",
    sourceId: "system-2020",
    itemId: "2228",
    archiveEntry: "_13_inquirybio_ch13.pdf",
    originalFilename: "_13_inquirybio_ch13.pdf",
    expectedSha256: "c53388eb7fef8362eefc7319ed3011be9832b460f749eead72c36742444c838d",
    expectedPages: 38,
    role: "learner-textbook",
    rightsStatus: "authorized-supplied-course-material-local-delivery",
    outputPath: "workspace/assets/textbook/chapter-13.pdf",
    wrapperBytes: 128,
    printedPageStart: 434,
    printedPageEnd: 471,
    physicalPageStart: 1,
    physicalPageEnd: 38
  },
  {
    id: "review-seminar-learner-copy",
    sourceId: "class-2026-27",
    itemId: "1498128",
    archiveEntry: "B30 Unit A Seminar.pdf",
    originalFilename: "B30 Unit A Seminar.pdf",
    expectedSha256: "8a9fe5be03068d31092d87d0bee489b50a44fa8e0b172111eea752fde69c5526",
    expectedPages: 35,
    role: "learner-historical-copy",
    rightsStatus: "authorized-supplied-course-material-optional-historical-copy",
    outputPath: "workspace/assets/review/unit-a-review-seminar-source.pdf",
    wrapperBytes: 0
  }
];

const ANSWER_SOURCES: SourceAsset[] = [
  ["chapter-11-comprehension-key", "1498206", "Content/mhriib_tr_comp_ch11.pdf", "5e97c5733f4183e2bb869a7bebb327618e0fc48b5cfe6627c12589e6fbf046f1", 12],
  ["section-11-1-key", "1498207", "Content/Section-11-1.pdf", "a26d24bc90e639a15515a537a4b6d8881689484fab6e02effb93a9ce9fdb26a2", 3],
  ["section-11-2-key", "1498208", "Content/Section-11-2.pdf", "2ccf1e2d70eebdabed160d65a8edaa61ce075b47068c613c57dcba9f3cb0d246", 2],
  ["section-11-3-key", "1498209", "Content/Section-11-3.pdf", "734a5220c30d1ce51f4e6c87b252b1c64ff0047cee326a54e85440dc846a1dff", 2],
  ["chapter-11-review-key", "1498210", "Content/mhriib_tr_ans_review_ch11.pdf", "fa33982beab308cf166084adf0dcb2db22ebf41052a23daaacd00a7d29e92b2b", 4],
  ["chapter-12-comprehension-key", "1498213", "Content/mhriib_tr_comp_ch12.pdf", "fb2fda079e4eec8931d4e7e83ef08e12178d9f1eea76845173f35aa4c9f0e646", 9],
  ["section-12-1-key", "1498214", "Content/Section-12-1.pdf", "146940d65595b2098c4da5dd47ac1a0ef21f55386f6da9ef5f82db6b57badb65", 1],
  ["section-12-2-key", "1498215", "Content/Section-12-2.pdf", "1914955ff94006aeb9d07cceb446706e5e67ff97a1a01c5715108c22cf618402", 3],
  ["section-12-3-key", "1498216", "Content/Section-12-3.pdf", "d7d1a82c2f940367f5d60f452c4f3404522829ea558f01621e0d63691426b296", 2],
  ["chapter-12-review-key", "1498217", "Content/mhriib_tr_ans_review_ch12.pdf", "e15595656d5791ba6775d6d1911d55b5c8907c1d76e3c414c02823031e0f9b53", 5],
  ["chapter-13-comprehension-key", "1498220", "Content/mhriib_tr_comp_ch13.pdf", "c0a6b30d4aa2b7419b7289a20397ef66ab501137c14bd5f8b6cb8fa08556dc15", 10],
  ["section-13-1-key", "1498221", "Content/Section-13-1.pdf", "d8c11aa0ffb9e5aa7edcebec6a6600d1a6cea69dcdb758e6171eaf16a36b8808", 1],
  ["section-13-2-key", "1498222", "Content/Section-13-2.pdf", "19d0dbd5a82ae044272c2a45c188e038858e14ba76b114930b82f5333a58e324", 2],
  ["section-13-3-key", "1498223", "Content/Section-13-3.pdf", "b3bf90fa60a9c9836d9af0ed4018e111b4c092b57831cb0911e5a6ea494a18f5", 2],
  ["section-13-4-key", "1498224", "Content/Section-13-4.pdf", "e5c26e83af319433bc362be79478d4aa6c52de714782ad9779b5560f84cd0e09", 2],
  ["chapter-13-review-key", "1498225", "Content/mhriib_tr_ans_review_ch13.pdf", "b5c040a6f3f1487afe2b2799f39d2479bdbc309d85a37686599376bd540d84ae", 4],
  ["textbook-unit-5-review-key", "1498116", "Content/mhriib_tr_review_unit_5.pdf", "68f6cb7b6e5632b9e11c4576545eff66a3d6bd24ba431aac3c91a9c04916d826", 10],
  ["review-seminar-key", "1498129", "Bio 30 Unit A Review Seminar KEY.pdf", "30991e6e883e33b37c6dcce1c592e0134b8d16b359954dac27bdf1916a097e7e", 90]
].map(([id, itemId, archiveEntry, expectedSha256, expectedPages]) => ({
  id: String(id),
  sourceId: "class-2026-27" as const,
  itemId: String(itemId),
  archiveEntry: String(archiveEntry),
  originalFilename: path.posix.basename(String(archiveEntry)),
  expectedSha256: String(expectedSha256),
  expectedPages: Number(expectedPages),
  role: "answer-authoring-source" as const,
  rightsStatus: "authorized-supplied-course-material-native-answer-adaptation",
  wrapperBytes: 0
}));

export const BIOLOGY30_PILOT_APPROVED_ASSETS = [...TEXTBOOK_ASSETS, ...ANSWER_SOURCES] as const;

export type PilotTextbookReport = {
  schemaVersion: 1;
  profileId: "biology30-unit-a-pilot-textbook-v1";
  project: typeof BIOLOGY30_PILOT_PROJECT;
  sourceArchives: Array<{ sourceId: string; path: string; sha256: string }>;
  learnerAssets: Array<Record<string, unknown>>;
  authoringSources: Array<Record<string, unknown>>;
  exclusions: string[];
  validation: {
    sourceHashesVerified: true;
    pdfHeadersNormalized: true;
    pageCountsVerified: true;
    textExtractionVerified: true;
    secureAssessmentMaterialIncluded: false;
  };
};

function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(filePath: string) {
  try {
    await lstat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function loadVerifiedArchive(filePath: string, expectedSha256: string) {
  const bytes = await readFile(filePath);
  const actual = sha256(bytes);
  if (actual !== expectedSha256) {
    throw new Error(`Source archive hash mismatch for ${path.basename(filePath)}: expected ${expectedSha256}, received ${actual}.`);
  }
  return { bytes, zip: await JSZip.loadAsync(bytes) };
}

async function validatePdf(bytes: Buffer, expectedPages: number, label: string) {
  if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new Error(`${label} does not begin with a standard %PDF- header.`);
  }
  const parsed = await pdf(bytes);
  if (parsed.numpages !== expectedPages) {
    throw new Error(`${label} page-count drift: expected ${expectedPages}, received ${parsed.numpages}.`);
  }
  if (parsed.text.replace(/\s+/g, " ").trim().length < 80) {
    throw new Error(`${label} did not yield enough extractable text to validate.`);
  }
  return parsed;
}

function normalizedPdf(bytes: Buffer, expectedWrapperBytes: number, label: string) {
  const marker = bytes.indexOf(Buffer.from("%PDF-"));
  if (marker !== expectedWrapperBytes) {
    throw new Error(`${label} wrapper drift: expected PDF marker at byte ${expectedWrapperBytes}, received ${marker}.`);
  }
  return Buffer.from(bytes.subarray(marker));
}

async function compareFile(filePath: string, expected: Buffer) {
  if (!(await exists(filePath))) return false;
  return (await readFile(filePath)).equals(expected);
}

export async function prepareBiology30UnitAPilotTextbook(input: {
  repoRoot: string;
  project?: string;
  failAfterPromotion?: number;
}) {
  const project = input.project ?? BIOLOGY30_PILOT_PROJECT;
  if (project !== BIOLOGY30_PILOT_PROJECT) {
    throw new Error(`This resource command is scoped only to ${BIOLOGY30_PILOT_PROJECT}.`);
  }
  const projectDir = path.join(input.repoRoot, "projects", project);
  const projectManifestPath = path.join(projectDir, "meta", "project.json");
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  if (!(await exists(projectManifestPath)) || !(await exists(workspacePath))) {
    throw new Error(`Pilot project ${project} is missing its direct workspace or metadata.`);
  }
  const manifest = JSON.parse(await readFile(projectManifestPath, "utf8")) as {
    authoringStatus?: string;
    authoring?: { driverId?: string; studioEditing?: { enabled?: boolean } };
  };
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring?.studioEditing?.enabled !== false) {
    throw new Error("Pilot ownership drift: expected blocked direct-workspace-v1 with Studio editing disabled.");
  }

  const sourceRoot = path.join(input.repoRoot, "projects", "resources", "biology30-unit-a-pilot", "_sources");
  const primaryPath = path.join(sourceRoot, `${BIOLOGY30_PILOT_PRIMARY_SHA256}.zip`);
  const referencePath = path.join(sourceRoot, `${BIOLOGY30_PILOT_REFERENCE_SHA256}.zip`);
  const [primary, reference] = await Promise.all([
    loadVerifiedArchive(primaryPath, BIOLOGY30_PILOT_PRIMARY_SHA256),
    loadVerifiedArchive(referencePath, BIOLOGY30_PILOT_REFERENCE_SHA256)
  ]);
  const archives = { "class-2026-27": primary.zip, "system-2020": reference.zip } as const;

  const learnerFiles = new Map<string, Buffer>();
  const learnerAssets: Array<Record<string, unknown>> = [];
  const authoringSources: Array<Record<string, unknown>> = [];
  for (const asset of BIOLOGY30_PILOT_APPROVED_ASSETS) {
    const entry = archives[asset.sourceId].file(asset.archiveEntry);
    if (!entry) throw new Error(`Approved source entry is missing: ${asset.archiveEntry}.`);
    const original = await entry.async("nodebuffer");
    const actualSourceSha256 = sha256(original);
    if (actualSourceSha256 !== asset.expectedSha256) {
      throw new Error(`Approved source entry hash mismatch for ${asset.archiveEntry}: expected ${asset.expectedSha256}, received ${actualSourceSha256}.`);
    }
    const normalized = normalizedPdf(original, asset.wrapperBytes ?? 0, asset.archiveEntry);
    const parsed = await validatePdf(normalized, asset.expectedPages, asset.archiveEntry);
    const record = {
      id: asset.id,
      sourceId: asset.sourceId,
      itemId: asset.itemId,
      archiveEntry: asset.archiveEntry,
      originalFilename: asset.originalFilename,
      sourceSha256: actualSourceSha256,
      normalizedSha256: sha256(normalized),
      wrapperBytesRemoved: asset.wrapperBytes ?? 0,
      pageCount: parsed.numpages,
      rightsStatus: asset.rightsStatus,
      role: asset.role
    };
    if (asset.outputPath) {
      learnerFiles.set(asset.outputPath, normalized);
      learnerAssets.push({
        ...record,
        outputPath: `projects/${project}/${asset.outputPath}`,
        printedPages: asset.printedPageStart ? { start: asset.printedPageStart, end: asset.printedPageEnd } : undefined,
        physicalPages: asset.physicalPageStart ? { start: asset.physicalPageStart, end: asset.physicalPageEnd } : undefined
      });
    } else {
      authoringSources.push(record);
    }
  }

  const report: PilotTextbookReport = {
    schemaVersion: 1,
    profileId: "biology30-unit-a-pilot-textbook-v1",
    project: BIOLOGY30_PILOT_PROJECT,
    sourceArchives: [
      { sourceId: "class-2026-27", path: `projects/resources/biology30-unit-a-pilot/_sources/${BIOLOGY30_PILOT_PRIMARY_SHA256}.zip`, sha256: BIOLOGY30_PILOT_PRIMARY_SHA256 },
      { sourceId: "system-2020", path: `projects/resources/biology30-unit-a-pilot/_sources/${BIOLOGY30_PILOT_REFERENCE_SHA256}.zip`, sha256: BIOLOGY30_PILOT_REFERENCE_SHA256 }
    ],
    learnerAssets,
    authoringSources,
    exclusions: [
      "printable chapter quizzes",
      "chapter quiz keys",
      "Unit A test and test answers",
      "broken Brightspace launchers",
      "teacher-only assessment material"
    ],
    validation: {
      sourceHashesVerified: true,
      pdfHeadersNormalized: true,
      pageCountsVerified: true,
      textExtractionVerified: true,
      secureAssessmentMaterialIncluded: false
    }
  };
  const reportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8");

  const targetTextbookDir = path.join(projectDir, "workspace", "assets", "textbook");
  const targetReviewDir = path.join(projectDir, "workspace", "assets", "review");
  const targetReportPath = path.join(projectDir, "meta", "textbook-resource-report.json");
  const expectedTextbook = [...learnerFiles].filter(([relative]) => relative.includes("/textbook/"));
  const expectedReview = [...learnerFiles].filter(([relative]) => relative.includes("/review/"));
  const exact = await Promise.all([
    ...expectedTextbook.map(([relative, bytes]) => compareFile(path.join(projectDir, relative), bytes)),
    ...expectedReview.map(([relative, bytes]) => compareFile(path.join(projectDir, relative), bytes)),
    compareFile(targetReportPath, reportBytes)
  ]);
  if (exact.every(Boolean)) {
    return { project, changed: false, report, files: [...learnerFiles.keys()] };
  }
  for (const target of [targetTextbookDir, targetReviewDir, targetReportPath]) {
    if (await exists(target)) {
      throw new Error(`Owned textbook target drift detected at ${path.relative(input.repoRoot, target)}; refusing to overwrite it.`);
    }
  }

  const stageRoot = await mkdtemp(path.join(projectDir, ".textbook-resource-stage-"));
  const stageTextbookDir = path.join(stageRoot, "textbook");
  const stageReviewDir = path.join(stageRoot, "review");
  const stageReportPath = path.join(stageRoot, "textbook-resource-report.json");
  const promoted: string[] = [];
  try {
    await Promise.all([mkdir(stageTextbookDir), mkdir(stageReviewDir)]);
    for (const [relative, bytes] of learnerFiles) {
      const destination = relative.includes("/textbook/")
        ? path.join(stageTextbookDir, path.basename(relative))
        : path.join(stageReviewDir, path.basename(relative));
      await writeFile(destination, bytes);
    }
    await writeFile(stageReportPath, reportBytes);
    for (const [relative, bytes] of learnerFiles) {
      const staged = relative.includes("/textbook/")
        ? path.join(stageTextbookDir, path.basename(relative))
        : path.join(stageReviewDir, path.basename(relative));
      await validatePdf(await readFile(staged), Number(learnerAssets.find((item) => String(item.outputPath).endsWith(relative))?.pageCount), relative);
      if (!(await readFile(staged)).equals(bytes)) throw new Error(`Staged resource drift for ${relative}.`);
    }
    const promotions = [
      { stage: stageTextbookDir, target: targetTextbookDir },
      { stage: stageReviewDir, target: targetReviewDir },
      { stage: stageReportPath, target: targetReportPath }
    ];
    for (let index = 0; index < promotions.length; index += 1) {
      const promotion = promotions[index];
      if (input.failAfterPromotion === index) throw new Error(`Simulated resource promotion failure at step ${index}.`);
      await rename(promotion.stage, promotion.target);
      promoted.push(promotion.target);
    }
    return { project, changed: true, report, files: [...learnerFiles.keys()] };
  } catch (error) {
    for (const target of promoted.reverse()) await rm(target, { recursive: true, force: true });
    throw error;
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}
