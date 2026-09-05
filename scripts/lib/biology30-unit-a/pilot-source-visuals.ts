import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

import JSZip from "jszip";
import sharp from "sharp";

export const BIOLOGY30_SOURCE_VISUAL_PROJECT = "biology30-unit-a-pilot" as const;
export const BIOLOGY30_SOURCE_VISUAL_COUNT = 9 as const;
export const BIOLOGY30_SOURCE_VISUAL_REPLACEMENTS: Record<string, string> = {
  "neuron-anatomy-source": "figure-neuron-anatomy",
  "brain-functional-regions": "figure-brain-regions",
  "reflex-arc-anatomy-source": "figure-reflex-arc",
  "eye-anatomy-source": "figure-eye-anatomy",
  "ear-anatomy-source": "figure-ear-hearing-pathway",
  "hypothalamus-pituitary-source": "figure-hypothalamus-pituitary-axes"
};

type SourceRecord = {
  id: string;
  kind: "normalized-textbook-pdf" | "content-addressed-powerpoint";
  path: string;
  sha256: string;
  rightsStatus: string;
};

type RelatedTextbook = { documentId: string; pdfPage: number; printedPage: number };

type VisualRecord = {
  id: string;
  lessonId: string;
  sectionId: string;
  title: string;
  sourceId: string;
  sourceKind: "pdf-crop" | "powerpoint-media";
  pdfPage?: number;
  printedPage?: number;
  renderDpi?: number;
  basePagePixels?: { width: number; height: number };
  cropAtBasePixels?: { left: number; top: number; width: number; height: number };
  slideNumber?: number;
  sourcePath?: string;
  sourceMediaSha256?: string;
  relatedTextbook?: RelatedTextbook;
  outputPath: string;
  displayRole: "replacement" | "supplemental";
  replacesFigureSlot: string | null;
  treatment: string;
  rightsStatus: string;
  releaseBlocker: string | null;
  altText: string;
  longDescription: string;
};

type VisualContract = {
  schemaVersion: number;
  profileId: string;
  project: string;
  status: string;
  sources: SourceRecord[];
  visuals: VisualRecord[];
  policy: Record<string, boolean>;
  releaseBlockers: Array<{ visualId: string; reason: string }>;
};

const run = promisify(execFile);

function sha256(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(target: string) {
  try {
    await lstat(target);
    return true;
  } catch {
    return false;
  }
}

async function compareFile(target: string, expected: Buffer) {
  if (!(await exists(target))) return false;
  return (await readFile(target)).equals(expected);
}

async function filesUnder(root: string, prefix = ""): Promise<string[]> {
  if (!(await exists(root))) return [];
  const result: string[] = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) result.push(...await filesUnder(path.join(root, entry.name), relative));
    else result.push(relative);
  }
  return result.sort();
}

async function compareDirectory(target: string, expected: Map<string, Buffer>) {
  if (!(await exists(target))) return false;
  const actualPaths = await filesUnder(target);
  const expectedPaths = [...expected.keys()].sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(expectedPaths)) return false;
  const matches = await Promise.all(expectedPaths.map((relative) => compareFile(path.join(target, relative), expected.get(relative)!)));
  return matches.every(Boolean);
}

async function verifyExistingOwnedInstallation(input: {
  targetAssets: string;
  targetReport: string;
  project: string;
}) {
  const assetsExist = await exists(input.targetAssets);
  const reportExists = await exists(input.targetReport);
  if (!assetsExist && !reportExists) return false;
  if (assetsExist !== reportExists) throw new Error("Source-visual owned outputs are incomplete; refusing replacement.");
  const report = JSON.parse(await readFile(input.targetReport, "utf8")) as {
    profileId?: string;
    project?: string;
    assets?: Array<{ outputPath?: string; sha256?: string }>;
  };
  if (report.profileId !== "biology30-unit-a-pilot-source-visual-resource-report-v1" || report.project !== input.project || !Array.isArray(report.assets)) {
    throw new Error("Existing source-visual report is not a recognized owned installation.");
  }
  const expected = new Map<string, string>();
  for (const asset of report.assets) {
    const filename = asset.outputPath ? path.basename(asset.outputPath) : "";
    if (!/^[a-z0-9-]+\.webp$/.test(filename) || !/^[a-f0-9]{64}$/.test(asset.sha256 ?? "") || expected.has(filename)) {
      throw new Error("Existing source-visual report contains an invalid asset inventory.");
    }
    expected.set(filename, asset.sha256!);
  }
  const actualPaths = await filesUnder(input.targetAssets);
  if (JSON.stringify(actualPaths) !== JSON.stringify([...expected.keys()].sort())) {
    throw new Error("Existing source-visual assets drifted from their owned report; refusing replacement.");
  }
  for (const [filename, expectedSha256] of expected) {
    const actualSha256 = sha256(await readFile(path.join(input.targetAssets, filename)));
    if (actualSha256 !== expectedSha256) {
      throw new Error(`Existing source-visual asset drifted from its owned report: ${filename}.`);
    }
  }
  return true;
}

function validateContract(contract: VisualContract) {
  if (contract.schemaVersion !== 1 || contract.profileId !== "biology30-unit-a-pilot-source-visuals-v1") {
    throw new Error("Unsupported Biology 30 source-visual contract.");
  }
  if (contract.project !== BIOLOGY30_SOURCE_VISUAL_PROJECT || contract.status !== "blocked-preview-only") {
    throw new Error("Source-visual contract must remain scoped to the blocked Unit A pilot.");
  }
  if (contract.visuals.length !== BIOLOGY30_SOURCE_VISUAL_COUNT || new Set(contract.visuals.map((visual) => visual.id)).size !== BIOLOGY30_SOURCE_VISUAL_COUNT) {
    throw new Error(`Source-visual contract must define exactly ${BIOLOGY30_SOURCE_VISUAL_COUNT} unique pilot visuals.`);
  }
  const sourceIds = new Set(contract.sources.map((source) => source.id));
  if (sourceIds.size !== contract.sources.length) throw new Error("Source-visual contract contains duplicate source IDs.");
  for (const visual of contract.visuals) {
    if (!sourceIds.has(visual.sourceId)) throw new Error(`Unknown source ${visual.sourceId} for ${visual.id}.`);
    if (!/^workspace\/assets\/source-visuals\/[a-z0-9-]+\.webp$/.test(visual.outputPath)) {
      throw new Error(`Invalid owned output path for ${visual.id}: ${visual.outputPath}.`);
    }
    if (!visual.altText.trim() || !visual.longDescription.trim() || !visual.rightsStatus.trim()) {
      throw new Error(`Incomplete accessibility or rights record for ${visual.id}.`);
    }
    const expectedReplacement = BIOLOGY30_SOURCE_VISUAL_REPLACEMENTS[visual.id] ?? null;
    if (expectedReplacement) {
      if (visual.displayRole !== "replacement" || visual.replacesFigureSlot !== expectedReplacement) {
        throw new Error(`Invalid replacement mapping for ${visual.id}.`);
      }
    } else if (visual.displayRole !== "supplemental" || visual.replacesFigureSlot !== null) {
      throw new Error(`Non-duplicated source visual ${visual.id} must remain supplemental.`);
    }
    if (visual.sourceKind === "pdf-crop") {
      if (!visual.pdfPage || !visual.printedPage || !visual.renderDpi || !visual.basePagePixels || !visual.cropAtBasePixels) {
        throw new Error(`Incomplete PDF crop definition for ${visual.id}.`);
      }
    } else if (!visual.slideNumber || !visual.sourcePath || !visual.sourceMediaSha256 || !visual.relatedTextbook) {
      throw new Error(`Incomplete PowerPoint media definition for ${visual.id}.`);
    }
  }
  const blockedIds = new Set(contract.visuals.filter((visual) => visual.releaseBlocker).map((visual) => visual.id));
  if (contract.releaseBlockers.length !== blockedIds.size || contract.releaseBlockers.some((blocker) => !blockedIds.has(blocker.visualId))) {
    throw new Error("Release-blocker inventory does not match blocked source visuals.");
  }
  if (
    !contract.policy.nonDuplicateNativeCourseFiguresRemain
    || !contract.policy.duplicateNativeFiguresAreHidden
    || !contract.policy.replacementSourceVisualsAllowed
    || !contract.policy.uniqueSourceVisualsAreSupplemental
    || contract.policy.slideScreenshotsAllowed
  ) {
    throw new Error("Source-visual policy drifted from the selective-upgrade pilot boundary.");
  }
}

async function renderPdfCrop(input: {
  repoRoot: string;
  sourcePath: string;
  visual: VisualRecord;
  renderRoot: string;
}) {
  const { visual } = input;
  const prefix = path.join(input.renderRoot, visual.id);
  await run("pdftoppm", [
    "-f", String(visual.pdfPage),
    "-l", String(visual.pdfPage),
    "-r", String(visual.renderDpi),
    "-png",
    "-singlefile",
    input.sourcePath,
    prefix
  ], { maxBuffer: 8 * 1024 * 1024 });
  const renderedPath = `${prefix}.png`;
  const metadata = await sharp(renderedPath).metadata();
  if (!metadata.width || !metadata.height || !visual.basePagePixels || !visual.cropAtBasePixels) {
    throw new Error(`Unable to determine rendered page dimensions for ${visual.id}.`);
  }
  const scaleX = metadata.width / visual.basePagePixels.width;
  const scaleY = metadata.height / visual.basePagePixels.height;
  if (Math.abs(scaleX - scaleY) > 0.01) throw new Error(`Rendered PDF aspect ratio drift for ${visual.id}.`);
  const crop = {
    left: Math.round(visual.cropAtBasePixels.left * scaleX),
    top: Math.round(visual.cropAtBasePixels.top * scaleY),
    width: Math.round(visual.cropAtBasePixels.width * scaleX),
    height: Math.round(visual.cropAtBasePixels.height * scaleY)
  };
  if (crop.left < 0 || crop.top < 0 || crop.left + crop.width > metadata.width || crop.top + crop.height > metadata.height) {
    throw new Error(`PDF crop falls outside the rendered page for ${visual.id}.`);
  }
  return sharp(renderedPath)
    .extract(crop)
    .webp({ quality: 88, effort: 6, smartSubsample: true })
    .toBuffer();
}

async function renderPowerPointMedia(input: {
  zip: JSZip;
  visual: VisualRecord;
}) {
  const entry = input.zip.file(input.visual.sourcePath!);
  if (!entry) throw new Error(`PowerPoint media is missing for ${input.visual.id}: ${input.visual.sourcePath}.`);
  const sourceBytes = await entry.async("nodebuffer");
  const actual = sha256(sourceBytes);
  if (actual !== input.visual.sourceMediaSha256) {
    throw new Error(`PowerPoint media hash drift for ${input.visual.id}: expected ${input.visual.sourceMediaSha256}, received ${actual}.`);
  }
  return sharp(sourceBytes).webp({ quality: 88, effort: 6, smartSubsample: true }).toBuffer();
}

export async function prepareBiology30UnitAPilotSourceVisuals(input: {
  repoRoot: string;
  project?: string;
  failAfterPromotion?: number;
}) {
  const project = input.project ?? BIOLOGY30_SOURCE_VISUAL_PROJECT;
  if (project !== BIOLOGY30_SOURCE_VISUAL_PROJECT) {
    throw new Error(`This source-visual command is scoped only to ${BIOLOGY30_SOURCE_VISUAL_PROJECT}.`);
  }
  const projectDir = path.join(input.repoRoot, "projects", project);
  const workspacePath = path.join(projectDir, "workspace", "index.html");
  const manifestPath = path.join(projectDir, "meta", "project.json");
  const contractPath = path.join(projectDir, "meta", "source-visual-integration.json");
  if (!(await exists(workspacePath)) || !(await exists(manifestPath)) || !(await exists(contractPath))) {
    throw new Error(`Pilot project ${project} is missing its workspace, metadata, or source-visual contract.`);
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    authoringStatus?: string;
    authoring?: { driverId?: string; studioEditing?: { enabled?: boolean } };
  };
  if (manifest.authoringStatus !== "blocked" || manifest.authoring?.driverId !== "direct-workspace-v1" || manifest.authoring?.studioEditing?.enabled !== false) {
    throw new Error("Pilot ownership drift: expected blocked direct-workspace-v1 with Studio editing disabled.");
  }
  const workspaceBefore = await readFile(workspacePath);
  const contractBytes = await readFile(contractPath);
  const contract = JSON.parse(contractBytes.toString("utf8")) as VisualContract;
  validateContract(contract);

  const sourceBytes = new Map<string, Buffer>();
  const sourcePaths = new Map<string, string>();
  const sourceZips = new Map<string, JSZip>();
  for (const source of contract.sources) {
    const sourcePath = path.join(input.repoRoot, source.path);
    const bytes = await readFile(sourcePath);
    const actual = sha256(bytes);
    if (actual !== source.sha256) throw new Error(`Source hash mismatch for ${source.id}: expected ${source.sha256}, received ${actual}.`);
    sourceBytes.set(source.id, bytes);
    sourcePaths.set(source.id, sourcePath);
    if (source.kind === "content-addressed-powerpoint") sourceZips.set(source.id, await JSZip.loadAsync(bytes));
  }

  const stageRoot = await mkdtemp(path.join(projectDir, ".source-visual-stage-"));
  const renderRoot = path.join(stageRoot, "rendered-pages");
  const stageAssets = path.join(stageRoot, "source-visuals");
  const stageReport = path.join(stageRoot, "source-visual-resource-report.json");
  await Promise.all([mkdir(renderRoot), mkdir(stageAssets)]);
  const generated = new Map<string, Buffer>();
  const assetRecords: Array<Record<string, unknown>> = [];
  try {
    for (const visual of contract.visuals) {
      const bytes = visual.sourceKind === "pdf-crop"
        ? await renderPdfCrop({ repoRoot: input.repoRoot, sourcePath: sourcePaths.get(visual.sourceId)!, visual, renderRoot })
        : await renderPowerPointMedia({ zip: sourceZips.get(visual.sourceId)!, visual });
      const metadata = await sharp(bytes).metadata();
      if (metadata.format !== "webp" || !metadata.width || !metadata.height || metadata.width < 360 || metadata.height < 260) {
        throw new Error(`Generated source visual failed image validation for ${visual.id}.`);
      }
      const filename = path.basename(visual.outputPath);
      generated.set(filename, bytes);
      await writeFile(path.join(stageAssets, filename), bytes);
      assetRecords.push({
        id: visual.id,
        lessonId: visual.lessonId,
        sectionId: visual.sectionId,
        outputPath: `projects/${project}/${visual.outputPath}`,
        sha256: sha256(bytes),
        byteLength: bytes.length,
        width: metadata.width,
        height: metadata.height,
        displayRole: visual.displayRole,
        replacesFigureSlot: visual.replacesFigureSlot,
        treatment: visual.treatment,
        rightsStatus: visual.rightsStatus,
        releaseBlocked: Boolean(visual.releaseBlocker),
        source: visual.sourceKind === "pdf-crop"
          ? { sourceId: visual.sourceId, pdfPage: visual.pdfPage, printedPage: visual.printedPage }
          : { sourceId: visual.sourceId, slideNumber: visual.slideNumber, sourcePath: visual.sourcePath, relatedTextbook: visual.relatedTextbook }
      });
    }
    if (!(await compareDirectory(stageAssets, generated))) throw new Error("Staged source-visual validation failed.");
    const report = {
      schemaVersion: 1,
      profileId: "biology30-unit-a-pilot-source-visual-resource-report-v1",
      project,
      status: contract.status,
      contractPath: `projects/${project}/meta/source-visual-integration.json`,
      contractSha256: sha256(contractBytes),
      sources: contract.sources.map((source) => ({ id: source.id, path: source.path, sha256: source.sha256, rightsStatus: source.rightsStatus })),
      assets: assetRecords,
      counts: {
        total: assetRecords.length,
        pdfCrops: contract.visuals.filter((visual) => visual.sourceKind === "pdf-crop").length,
        powerpointMedia: contract.visuals.filter((visual) => visual.sourceKind === "powerpoint-media").length,
        replacements: contract.visuals.filter((visual) => visual.displayRole === "replacement").length,
        supplemental: contract.visuals.filter((visual) => visual.displayRole === "supplemental").length,
        releaseBlockers: contract.releaseBlockers.length
      },
      validation: {
        sourceHashesVerified: true,
        exactVisualInventoryVerified: true,
        webpDimensionsVerified: true,
        accessibilityRecordsComplete: true,
        rightsRecordsComplete: true,
        replacementMappingVerified: true,
        canonicalWorkspaceRewritten: false,
        projectRemainsBlocked: true
      }
    };
    const reportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8");
    await writeFile(stageReport, reportBytes);

    const targetAssets = path.join(projectDir, "workspace", "assets", "source-visuals");
    const targetReport = path.join(projectDir, "meta", "source-visual-resource-report.json");
    const exactAssets = await compareDirectory(targetAssets, generated);
    const exactReport = await compareFile(targetReport, reportBytes);
    if (exactAssets && exactReport) {
      if (!(await readFile(workspacePath)).equals(workspaceBefore)) throw new Error("Canonical workspace changed during source-visual verification.");
      return { project, changed: false, contract, report };
    }
    const existingOwnedInstallation = await verifyExistingOwnedInstallation({ targetAssets, targetReport, project });

    const promoted: string[] = [];
    const previousAssets = path.join(stageRoot, "previous-source-visuals");
    const previousReport = path.join(stageRoot, "previous-source-visual-resource-report.json");
    let backupsMoved = false;
    try {
      if (existingOwnedInstallation) {
        await rename(targetAssets, previousAssets);
        try {
          await rename(targetReport, previousReport);
          backupsMoved = true;
        } catch (error) {
          await rename(previousAssets, targetAssets);
          throw error;
        }
      }
      const promotions = [
        { stage: stageAssets, target: targetAssets },
        { stage: stageReport, target: targetReport }
      ];
      let promotionIndex = 0;
      for (const promotion of promotions) {
        if (input.failAfterPromotion === promotionIndex) throw new Error(`Simulated source-visual promotion failure at step ${promotionIndex}.`);
        await mkdir(path.dirname(promotion.target), { recursive: true });
        await rename(promotion.stage, promotion.target);
        promoted.push(promotion.target);
        promotionIndex += 1;
      }
      if (!(await readFile(workspacePath)).equals(workspaceBefore)) throw new Error("Source-visual preparation rewrote canonical workspace HTML.");
      return { project, changed: true, contract, report };
    } catch (error) {
      for (const target of promoted.reverse()) await rm(target, { recursive: true, force: true });
      if (backupsMoved) {
        await rename(previousAssets, targetAssets);
        await rename(previousReport, targetReport);
      }
      throw error;
    }
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }
}
