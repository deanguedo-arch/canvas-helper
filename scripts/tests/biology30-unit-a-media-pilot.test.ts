import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, appendFile, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { load as loadHtml } from "cheerio";

import {
  BIOLOGY30_MEDIA_DECKS,
  BIOLOGY30_MEDIA_LEARNER_VIDEO_IDS,
  BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS,
  prepareBiology30UnitAPilotMedia
} from "../lib/biology30-unit-a/pilot-media.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const projectDir = path.join(repoRoot, "projects/biology30-unit-a-pilot");
const workspacePath = path.join(projectDir, "workspace/index.html");
const contractPath = path.join(projectDir, "meta/media-integration.json");
const reportPath = path.join(projectDir, "meta/media-resource-report.json");
const sourceRoot = path.join(repoRoot, "projects/resources/biology30-unit-a-pilot/_sources");
const deckPaths = Object.fromEntries(BIOLOGY30_MEDIA_DECKS.map((deck) => [deck.id, path.join(sourceRoot, `${deck.sha256}.pptx`)]));

type MediaContract = {
  project: string;
  status: string;
  sourceDecks: Array<Record<string, unknown>>;
  inventory: { slideCount: number; mediaCount: number; youtubeCount: number; externalLinkCount: number };
  slides: Array<{ id: string; treatment: string; dispositionReason: string }>;
  media: Array<{ id: string; treatment: string; rightsStatus: string; extractedOutputPath?: string | null }>;
  videos: Array<{
    youtubeId: string;
    lessonConnections: string[];
    watchFor: string;
    localFallback: string;
    finalDisposition: string;
    learnerVisibility: string;
    captionsStatus: string;
    factualReviewStatus: string;
    affectsCompletion: boolean;
    affectsScore: boolean;
  }>;
  externalLinks: Array<{ finalDisposition: string }>;
  redrawReferences: Array<{ extractedOutputPath: string; sourceRasterLearnerVisible: boolean; learnerTreatment: string }>;
  learnerPolicy: Record<string, unknown>;
  validation: Record<string, boolean>;
};

function digest(bytes: Buffer | string) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function exists(target: string) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

async function setupFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "biology30-unit-a-media-"));
  const fixtureProject = path.join(fixtureRoot, "projects/biology30-unit-a-pilot");
  await Promise.all([
    mkdir(path.join(fixtureProject, "workspace"), { recursive: true }),
    mkdir(path.join(fixtureProject, "meta"), { recursive: true })
  ]);
  await Promise.all([
    import("node:fs/promises").then(({ copyFile }) => copyFile(workspacePath, path.join(fixtureProject, "workspace/index.html"))),
    import("node:fs/promises").then(({ copyFile }) => copyFile(path.join(projectDir, "meta/project.json"), path.join(fixtureProject, "meta/project.json")))
  ]);
  return { fixtureRoot, fixtureProject };
}

function fixtureInput(fixtureRoot: string, failAfterPromotion?: number) {
  return {
    repoRoot: fixtureRoot,
    project: "biology30-unit-a-pilot",
    chapter11Pptx: deckPaths["chapter-11"],
    chapter12Pptx: deckPaths["chapter-12"],
    chapter13Pptx: deckPaths["chapter-13"],
    failAfterPromotion
  };
}

test("PowerPoint intake contract accounts for every source slide, media asset, and link", async () => {
  const contract = JSON.parse(await readFile(contractPath, "utf8")) as MediaContract;
  const report = JSON.parse(await readFile(reportPath, "utf8")) as { counts: MediaContract["inventory"]; candidateVideos: number; excludedVideos: number; learnerVisibleVideos: number; primaryLessonVideos: number; canonicalWorkspaceRewritten: boolean };
  assert.equal(contract.project, "biology30-unit-a-pilot");
  assert.equal(contract.status, "blocked-preview-only");
  assert.deepEqual(contract.inventory, { slideCount: 138, mediaCount: 152, youtubeCount: 45, externalLinkCount: 3 });
  assert.deepEqual(report.counts, contract.inventory);
  assert.equal(contract.slides.length, 138);
  assert.equal(contract.media.length, 152);
  assert.equal(contract.videos.length, 45);
  assert.equal(contract.externalLinks.length, 3);
  assert.equal(new Set(contract.slides.map((slide) => slide.id)).size, 138);
  assert.equal(new Set(contract.media.map((asset) => asset.id)).size, 152);
  assert.equal(new Set(contract.videos.map((video) => video.youtubeId)).size, 45);
  assert.ok(contract.slides.every((slide) => slide.treatment && slide.dispositionReason));
  assert.ok(contract.media.every((asset) => asset.treatment && asset.rightsStatus));
  assert.ok(contract.externalLinks.every((link) => link.finalDisposition === "reference-only-not-learner-delivered"));
  assert.deepEqual(contract.sourceDecks.map((source) => source.sha256), BIOLOGY30_MEDIA_DECKS.map((deck) => deck.sha256));
  assert.deepEqual(contract.sourceDecks.map((source) => source.slideCount), [66, 29, 43]);
  assert.deepEqual(contract.sourceDecks.map((source) => source.mediaCount), [68, 34, 50]);
  assert.equal(report.candidateVideos, 35);
  assert.equal(report.excludedVideos, 10);
  assert.equal(report.learnerVisibleVideos, 35);
  assert.equal(report.primaryLessonVideos, 12);
  assert.equal(report.canonicalWorkspaceRewritten, false);
  assert.equal(contract.validation.sourceHashesVerified, true);
  assert.equal(contract.validation.allSlidesDisposed, true);
  assert.equal(contract.validation.allMediaDisposed, true);
  assert.equal(contract.validation.allLinksDisposed, true);
  assert.equal(contract.validation.networkChecksRun, true);
  assert.equal(contract.learnerPolicy.videoPreviewLoadsWhenVisible, true);
  assert.equal(contract.learnerPolicy.hiddenVideoPreviewsLoad, false);
  assert.equal(contract.learnerPolicy.videoAutoplay, false);
  assert.equal(contract.learnerPolicy.videoNetworkRequestBeforePlay, undefined);

  const excluded = new Set(["ecGEcj1tBBI", "jaWrMYChc5A", "RNLceVI8jcc", "jEHwB1PG_-Q", "FPH5CFSmYEU", "HKHuQYVcxG4", "qEEEu1HEtU0", "-w8n9UOiBxE", "cVf38y07cfk", "I9XG8EBwdSU"]);
  assert.deepEqual(new Set(contract.videos.filter((video) => video.finalDisposition === "excluded").map((video) => video.youtubeId)), excluded);
  assert.deepEqual(
    new Set(contract.videos.filter((video) => video.learnerVisibility !== "hidden").map((video) => video.youtubeId)),
    new Set(BIOLOGY30_MEDIA_LEARNER_VIDEO_IDS)
  );
  assert.deepEqual(
    new Set(contract.videos.filter((video) => video.learnerVisibility === "lesson-and-video-library").map((video) => video.youtubeId)),
    new Set(BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS)
  );
  for (const video of contract.videos) {
    assert.ok(video.lessonConnections.length, video.youtubeId);
    assert.ok(video.watchFor.trim(), video.youtubeId);
    assert.ok(video.localFallback.trim(), video.youtubeId);
    assert.equal(video.affectsCompletion, false, video.youtubeId);
    assert.equal(video.affectsScore, false, video.youtubeId);
    if (video.learnerVisibility !== "hidden") {
      assert.equal(video.captionsStatus, "english-caption-track-verified");
      assert.equal(video.factualReviewStatus, "approved-as-optional-with-local-correction-and-fallback");
    }
  }

  assert.equal(contract.redrawReferences.length, 3);
  for (const reference of contract.redrawReferences) {
    assert.equal(reference.sourceRasterLearnerVisible, false);
    assert.equal(reference.learnerTreatment, "original-redraw");
    assert.equal(await exists(path.join(repoRoot, reference.extractedOutputPath)), true, reference.extractedOutputPath);
  }
});

test("learner workspace auto-loads real previews only when their video entries are visible", async () => {
  const html = await readFile(workspacePath, "utf8");
  const $ = loadHtml(html);
  const learnerVisibleFigureZooms = $("[data-open-figure-dialog]").toArray().filter((node) => $(node).closest("[data-replaced-by-source-visual][hidden]").length === 0);
  assert.equal($(".course-page").length, 32);
  assert.equal($("#video-library").length, 1);
  assert.equal($(".course-nav-link[data-page-target='video-library']").length, 1);
  assert.equal($("#video-library [data-video-panel]").length, 35);
  assert.equal($("#video-library [data-video-select] option").length, 35);
  assert.equal($("#video-library [data-video-topic-filter]").length, 5);
  assert.equal($(".bio-video-companion").length, 12);
  assert.deepEqual(new Set($(".bio-video-companion").map((_index, node) => $(node).attr("data-video-entry")).get()), new Set(BIOLOGY30_MEDIA_PRIMARY_LESSON_VIDEO_IDS));
  assert.equal($("[data-video-frame-host]").length, 47);
  assert.equal($("[data-video-play]").length, 0);
  assert.equal($(".bio-video-stage-trigger").length, 0);
  assert.equal($(".bio-video-action--play").length, 0);
  assert.equal($("iframe[src*='youtube']").length, 0);
  assert.equal($("img[src^='http'],script[src^='http'],link[href^='http']").length, 0);
  assert.match(html, /https:\/\/www\.youtube-nocookie\.com\/embed\//);
  assert.match(html, /syncVisibleVideoPreviews/);
  assert.doesNotMatch(html, /autoplay=1/);
  assert.doesNotMatch(html, /[?&]autoplay=1/);
  assert.equal($("[data-media-treatment]").length, 3);
  assert.equal($("[data-media-treatment='reviewed-generated-visual']").length, 2);
  assert.equal($("[data-media-treatment='corrected-source-informed-redraw']").length, 1);
  assert.equal($("[data-retired-media-treatment][data-replaced-by-source-visual='eye-anatomy-source'][hidden]").length, 1);
  assert.equal($("[data-source-visual]").length, 9);
  assert.equal($("[data-figure-slot='figure-generic-feedback-loop'] [data-open-figure-dialog]").length, 2);
  assert.equal(learnerVisibleFigureZooms.length, 24);
  assert.equal($("[data-generated-visual]").length, 12);
  assert.equal($("[data-generated-visual] img[src*='assets/generated-visuals/']").length, 12);
  assert.equal($("#bio-figure-dialog").length, 1);
  assert.ok($("[data-media-treatment]").toArray().every((node) => /redraw|reviewed-generated-visual/.test($(node).attr("data-media-treatment") ?? "")));
  assert.equal($("img[src*='powerpoint-media'],img[src$='.pptx']").length, 0);
  assert.doesNotMatch($("body").clone().find("script,style").remove().end().text(), /representative slice|PowerPoint|media disposition|source raster/i);
  for (const excluded of ["ecGEcj1tBBI", "jaWrMYChc5A", "RNLceVI8jcc", "jEHwB1PG_-Q", "FPH5CFSmYEU", "HKHuQYVcxG4", "qEEEu1HEtU0", "-w8n9UOiBxE", "cVf38y07cfk", "I9XG8EBwdSU"]) {
    assert.doesNotMatch(html, new RegExp(excluded.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.equal($("[data-biology-lesson]").length, 17);
  assert.equal($("[data-practice-id]").length, 100);
  assert.equal($("[data-artifact-id]").length, 7);
});

test("media preparation is transactional, idempotent, and preserves canonical HTML", async () => {
  const fixture = await setupFixture();
  try {
    const workspace = path.join(fixture.fixtureProject, "workspace/index.html");
    const before = digest(await readFile(workspace));
    const first = await prepareBiology30UnitAPilotMedia(fixtureInput(fixture.fixtureRoot));
    assert.equal(first.changed, true);
    assert.equal(digest(await readFile(workspace)), before);
    const second = await prepareBiology30UnitAPilotMedia(fixtureInput(fixture.fixtureRoot));
    assert.equal(second.changed, false);
    assert.equal(digest(await readFile(workspace)), before);

    const driftTarget = path.join(fixture.fixtureRoot, `projects/resources/biology30-unit-a-pilot/_sources/${BIOLOGY30_MEDIA_DECKS[0].sha256}.pptx`);
    await appendFile(driftTarget, "drift");
    await assert.rejects(() => prepareBiology30UnitAPilotMedia(fixtureInput(fixture.fixtureRoot)), /content-addressed source drift/i);
    assert.equal(digest(await readFile(workspace)), before);
  } finally {
    await rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});

test("a simulated promotion failure rolls back every new media target", async () => {
  const fixture = await setupFixture();
  try {
    await assert.rejects(
      () => prepareBiology30UnitAPilotMedia(fixtureInput(fixture.fixtureRoot, 2)),
      /Simulated media promotion failure/
    );
    const fixtureSourceRoot = path.join(fixture.fixtureRoot, "projects/resources/biology30-unit-a-pilot/_sources");
    for (const deck of BIOLOGY30_MEDIA_DECKS) assert.equal(await exists(path.join(fixtureSourceRoot, `${deck.sha256}.pptx`)), false);
    assert.equal(await exists(path.join(fixture.fixtureProject, "meta/media-integration.json")), false);
    assert.equal(await exists(path.join(fixture.fixtureProject, "meta/media-resource-report.json")), false);
    assert.equal(await exists(path.join(fixture.fixtureRoot, "projects/resources/biology30-unit-a-pilot/_extracted/powerpoint-media")), false);
  } finally {
    await rm(fixture.fixtureRoot, { recursive: true, force: true });
  }
});
