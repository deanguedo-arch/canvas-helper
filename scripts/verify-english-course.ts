import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import * as cheerio from "cheerio";

import { validateProjectContract } from "../e2e/lib/project-contract-schema.js";
import { parseEnglishCourseManifest, parseEnglishUnitRecipe } from "./lib/english-unit/schema.js";

type VerificationCheck = { id: string; status: "passed" | "warning" | "failed"; detail: string };
type UnitVerification = { projectSlug: string; activityProfile: string; checks: VerificationCheck[] };

function parseArgs(argv: string[]) {
  const courseIndex = argv.indexOf("--course");
  const courseId = courseIndex >= 0 ? argv[courseIndex + 1] : undefined;
  if (!courseId) throw new Error("Usage: npm run verify:english-course -- --course ela20-1");
  const repoIndex = argv.indexOf("--repo-root");
  return { courseId, repoRoot: path.resolve(repoIndex >= 0 ? argv[repoIndex + 1] : process.cwd()) };
}

async function exists(filePath: string) {
  try { return (await stat(filePath)).isFile(); } catch { return false; }
}

async function walkFiles(root: string, relative = ""): Promise<string[]> {
  const current = path.join(root, relative);
  let entries;
  try { entries = await readdir(current, { withFileTypes: true }); } catch { return []; }
  const files: string[] = [];
  for (const entry of entries) {
    const next = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await walkFiles(root, next));
    else if (entry.isFile()) files.push(next.replaceAll(path.sep, "/"));
  }
  return files;
}

function add(checks: VerificationCheck[], id: string, passed: boolean, detail: string, warning = false) {
  checks.push({ id, status: passed ? "passed" : warning ? "warning" : "failed", detail });
}

function localReference(value: string) {
  const withoutFragment = value.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment || /^(?:https?:|data:|mailto:|tel:|javascript:|#)/i.test(value)) return undefined;
  return decodeURIComponent(withoutFragment);
}

function profileChecks(profile: string, $: cheerio.CheerioAPI, checks: VerificationCheck[]) {
  if (profile === "short-fiction") {
    add(checks, "short-fiction-routes", ["story-bank", "story-questions", "writing-studio", "evidence-bank", "film-room", "resources"].every((id) => $(`#${id}`).length === 1), "Golden Short Fiction routes are present.");
    add(checks, "short-fiction-readings", $("[data-library-doc-panel]").length >= 5, "All five teacher-selected reading panels are present.");
    return;
  }
  if (profile === "modern-drama") {
    add(checks, "crucible-routes", ["play-materials", "act-questions", "character-notes", "critical-essay", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Modern Drama activity routes are present.");
    add(checks, "crucible-acts", $("#act-questions [data-question-panel]").length === 4, "Four Crucible act question sets are present.");
    return;
  }
  if (profile === "shakespeare-drama") {
    add(checks, "macbeth-routes", ["side-by-side", "play-materials", "act-questions", "character-notes", "writing-studio", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Shakespeare activity routes are present.");
    add(checks, "macbeth-scenes", $("#side-by-side [data-english-activity-panel]").length === 28, "All 28 Macbeth scenes are present in the side-by-side reader.");
    add(checks, "macbeth-editorial", $("#side-by-side [data-editorial-status='needs-editorial']").length === 28, "All unreviewed companion scenes remain visibly marked needs-editorial.");
    add(checks, "macbeth-act-sets", $("#act-questions [data-question-panel]").length === 5, "Five Macbeth act collections are present.");
    add(checks, "macbeth-selected-scenes", $("#act-questions [data-evidence-question-prompt]").length >= 20, "The 20 teacher-selected scene pages produced guided questions.");
    add(checks, "macbeth-characters", $("#character-notes [data-english-activity-panel]").length === 6, "Six Macbeth character dossiers are present.");
    const writingTools = ["language-lab", "close-reading", "theme-builder", "character-change-paragraph", "critical-essay", "graphic-essay"];
    add(
      checks,
      "macbeth-writing-tools",
      writingTools.every((id) => $(`#writing-studio [data-english-activity-panel='${id}']`).length === 1),
      "All six Shakespeare Writing Studio tools are present."
    );
    return;
  }
  if (profile === "novel-study") {
    add(checks, "novel-routes", ["critical-essay-lord-of-the-flies", "critical-essay-the-book-thief", "reading-guide", "major-works-data", "novel-study-questions", "writing-studio", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Both novel tracks and their activity routes are present.");
    add(checks, "novel-generic-questions", $("#novel-study-questions [data-evidence-question-prompt]").length === 48, "The 24 disclosed profile-supplied questions are rendered for both novel tracks.");
    add(checks, "novel-phases", $("#novel-study-questions [data-question-panel]").length === 6, "Opening, middle, and final collections are present for both novels.");
    return;
  }
  if (profile === "film-study") {
    add(checks, "film-routes", ["critical-essay", "viewing-guide", "film-study-questions", "film-room", "resources", "evidence-bank"].every((id) => $(`#${id}`).length === 1), "Film Study activity routes are present.");
    const sets = $("#film-study-questions [data-question-panel]");
    add(checks, "film-question-sets", sets.length === 2 && sets.eq(0).find("[data-evidence-question-prompt]").length === 22 && sets.eq(1).find("[data-evidence-question-prompt]").length === 18, "Film question sets contain 22 technique and 18 full-response prompts.");
    add(checks, "film-essay-fields", $("#critical-essay [data-activity-response]").length === 19, "Film Critical Essay contains six stages and 19 fields.");
    add(checks, "film-videos", $("#film-room iframe").length === 4, "Four verified Film Study concept videos are embedded.");
  }
}

async function verifyUnit(input: { repoRoot: string; projectSlug: string; activityProfile: string }): Promise<UnitVerification> {
  const projectDir = path.join(input.repoRoot, "projects", input.projectSlug);
  const workspaceDir = path.join(projectDir, "workspace");
  const recipePath = path.join(projectDir, "meta", "english-unit.json");
  const buildManifestPath = path.join(projectDir, "meta", "english-unit-build.json");
  const checks: VerificationCheck[] = [];
  const recipe = parseEnglishUnitRecipe(JSON.parse(await readFile(recipePath, "utf8")));
  add(checks, "recipe-profile", recipe.activityProfile.kind === input.activityProfile, `Recipe profile is ${recipe.activityProfile.kind}.`);
  const e2eContractPath = path.join(projectDir, "meta", "e2e-contract.json");
  try {
    validateProjectContract(JSON.parse(await readFile(e2eContractPath, "utf8")), e2eContractPath);
    add(checks, "e2e-contract", true, "Project E2E contract is valid.");
  } catch (error) {
    add(checks, "e2e-contract", false, error instanceof Error ? error.message.replace(/\s+/g, " ") : String(error));
  }
  const indexPath = path.join(workspaceDir, "index.html");
  const html = await readFile(indexPath, "utf8");
  const $ = cheerio.load(html);
  add(checks, "complete-html", $("html").length === 1 && $("body").length === 1, "Workspace index is a complete HTML document.");
  add(checks, "shared-shell", $(".course-sidebar").length === 1 && $(".course-topbar").length === 1, "Shared Next Step course shell is present.");
  add(checks, "evidence-api", html.includes("window.nextStepEvidenceBank") && html.includes("upsertEvidenceEntry") && html.includes("removeEvidenceEntry") && html.includes("listEvidenceEntries"), "Shared Evidence Bank API is embedded.");
  add(checks, "evidence-filters", input.activityProfile === "short-fiction" || $("[data-evidence-bank-filter]").length === 4, "Central Evidence Bank filter controls are present.");
  add(checks, "green-save-actions", $("[data-save-evidence-note], [data-save-response-collection]").toArray().every((element) => $(element).hasClass("evidence-bank-save-action") || input.activityProfile === "short-fiction"), "Evidence Bank save actions use the shared green style.");
  add(checks, "hints-print", $("[data-worksheet-toggle-hints]").length > 0 && $("[data-worksheet-print], [data-print-writing]").length > 0, "Hints and scoped Print/PDF controls are present.");
  add(checks, "no-contamination", !/(?:soft|hard)[ _-]*gate|(?:ELA|English)\s*30-1|Diploma\s*Exam|Part\s+A\s*\(Written\)|factors_and_products|trigonometry/i.test(html), "No gate, grade, exam, or Math contamination appears in learner HTML.");
  const duplicateResponseIds = $("[data-response-id]").toArray().map((element) => $(element).attr("data-response-id") ?? "").filter((id, index, ids) => id && ids.indexOf(id) !== index);
  const unexpectedDuplicateResponseIds = input.activityProfile === "short-fiction"
    ? duplicateResponseIds.filter((id) => !id.startsWith("english-question:"))
    : duplicateResponseIds;
  add(
    checks,
    "stable-response-ids",
    unexpectedDuplicateResponseIds.length === 0,
    unexpectedDuplicateResponseIds.length
      ? `Unexpected duplicate response IDs: ${[...new Set(unexpectedDuplicateResponseIds)].slice(0, 8).join(", ")}`
      : input.activityProfile === "short-fiction"
        ? "Question response IDs are deliberately shared between lessons and the full Question Bank."
        : "Response IDs are unique and stable."
  );

  const brokenLocal: string[] = [];
  for (const element of $("img[src], iframe[src], a[href]").toArray()) {
    const attribute = element.tagName === "a" ? "href" : "src";
    const reference = localReference($(element).attr(attribute) ?? "");
    if (!reference) continue;
    const target = path.resolve(workspaceDir, reference);
    if (!target.startsWith(`${path.resolve(workspaceDir)}${path.sep}`) || !(await exists(target))) brokenLocal.push(reference);
  }
  add(checks, "local-links", brokenLocal.length === 0, brokenLocal.length ? `Broken local references: ${[...new Set(brokenLocal)].slice(0, 8).join(", ")}` : "All local image, reader, download, and link targets exist.");
  const leakedFiles = (await walkFiles(workspaceDir)).filter((file) => /(?:soft|hard)[ _-]*gate|answer\s*key|\bmath\b/i.test(file));
  add(checks, "excluded-files", leakedFiles.length === 0, leakedFiles.length ? `Excluded files leaked: ${leakedFiles.join(", ")}` : "No gate, answer-key, or Math files exist in learner workspace.");
  profileChecks(input.activityProfile, $, checks);

  const buildManifest = JSON.parse(await readFile(buildManifestPath, "utf8")) as { status?: string; components?: Array<{ source: string; sha256: string }>; reviewItems?: string[] };
  add(checks, "review-status", buildManifest.status === "needs-review" || recipe.status === "ready-for-export", `Build status is ${buildManifest.status}; final export remains review-gated.`, buildManifest.status !== "needs-review" && recipe.status !== "ready-for-export");
  if (input.activityProfile === "shakespeare-drama") {
    const scenePath = path.join(workspaceDir, "components", "shakespeare-side-by-side", "scenes.json");
    const digest = createHash("sha256").update(await readFile(scenePath)).digest("hex");
    add(checks, "preserved-macbeth-component", buildManifest.components?.some((component) => component.source === "components/shakespeare-side-by-side/scenes.json" && component.sha256 === digest) ?? false, "Macbeth editable scene data is preserved and hashed in the build manifest.");
  }
  return { projectSlug: input.projectSlug, activityProfile: input.activityProfile, checks };
}

function renderMarkdown(courseId: string, units: UnitVerification[]) {
  const failed = units.flatMap((unit) => unit.checks).filter((check) => check.status === "failed").length;
  const warning = units.flatMap((unit) => unit.checks).filter((check) => check.status === "warning").length;
  const lines = [`# ${courseId} English Factory Verification`, "", `- Failed: ${failed}`, `- Warnings: ${warning}`, ""];
  for (const unit of units) {
    lines.push(`## ${unit.projectSlug}`, "", "| Status | Check | Detail |", "| --- | --- | --- |");
    unit.checks.forEach((check) => lines.push(`| ${check.status} | ${check.id} | ${check.detail.replace(/\|/g, "\\|")} |`));
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

export async function verifyEnglishCourse(input: { courseId: string; repoRoot: string }) {
  const manifestPath = path.join(input.repoRoot, "config", "english", "families", `${input.courseId}.json`);
  const manifest = parseEnglishCourseManifest(JSON.parse(await readFile(manifestPath, "utf8")));
  const units: UnitVerification[] = [];
  for (const unit of manifest.units) units.push(await verifyUnit({ repoRoot: input.repoRoot, projectSlug: unit.projectSlug, activityProfile: unit.activityProfile }));
  const failed = units.flatMap((unit) => unit.checks).filter((check) => check.status === "failed");
  const warnings = units.flatMap((unit) => unit.checks).filter((check) => check.status === "warning");
  const report = { schemaVersion: 1, courseId: input.courseId, generatedAt: new Date().toISOString(), passed: failed.length === 0, failed: failed.length, warnings: warnings.length, units };
  const outputBase = path.join(input.repoRoot, "config", "english", "families", `${input.courseId}-verification`);
  await writeFile(`${outputBase}.json`, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  await writeFile(`${outputBase}.md`, renderMarkdown(input.courseId, units), "utf8");
  if (failed.length) throw new Error(`English course verification failed ${failed.length} check(s). See ${outputBase}.md`);
  return report;
}

async function main() { console.log(JSON.stringify(await verifyEnglishCourse(parseArgs(process.argv.slice(2))), null, 2)); }
if (import.meta.url === `file://${process.argv[1]}`) main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
