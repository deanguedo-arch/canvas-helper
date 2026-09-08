import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";

const root = process.cwd();
const pilot1 = "projects/biology30-unit-a-pilot";
const pilot2 = "projects/biology30-unit-a-pilot-2";
const resources = "projects/resources/biology30-production/v1";
const transferPath = `${pilot1}/meta/biology30-improvement-transfer-contract.json`;
const materialsPath = `${pilot1}/meta/bcd-material-readiness.json`;
const checkOnly = process.argv.includes("--check");
if (process.argv.slice(2).some((arg) => arg !== "--check")) throw new Error("Only --check is supported.");
const json = async (file: string) => JSON.parse(await readFile(path.join(root, file), "utf8"));
async function digest(file: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path.join(root, file))) hash.update(chunk);
  return hash.digest("hex");
}
const [ledger1, ledger2, family, catalog, academic] = await Promise.all([
  json(`${pilot1}/meta/improvement-ledger.json`), json(`${pilot2}/meta/pilot-2-improvement-ledger.json`),
  json(`${resources}/family-contract.json`), json(`${resources}/source-catalog.json`), json(`${pilot2}/meta/final-academic-review.json`)
]);
const currentSha = await digest(`${pilot2}/workspace/index.html`);
if (academic.workspaceSha256 !== currentSha || ledger2.workspaceSha256 !== currentSha) throw new Error("Pilot 2 audit/ledger is stale.");
const suppliedManifestPath = `${pilot1}/meta/bcd-rebuild-intake-manifest.json`;
const suppliedManifest = await json(suppliedManifestPath);
const suppliedManifestSha = await digest(suppliedManifestPath);
const preparedIntakePath = `${resources}/pilot2/intake/${suppliedManifestSha}`;
const preparedAvailability = await json(`${preparedIntakePath}/availability.json`);
const relationshipPath = `${resources}/pilot2/relationships/${suppliedManifestSha}`;
const relationshipInventory = await json(`${relationshipPath}/package-relationships.json`);
if (relationshipInventory.externalDeckRelationships !== suppliedManifest.totals.priorPlanningExternalHyperlinkRelationships) throw new Error("Deck/notes hyperlink inventory drift");
if (preparedAvailability.manifestSha256 !== suppliedManifestSha || preparedAvailability.readyForRendering !== false) {
  throw new Error("Supplied intake availability must remain separate from academic readiness.");
}
for (const file of await json(`${preparedIntakePath}/packet-files.json`)) {
  if (await digest(`${preparedIntakePath}/${file.path}`) !== file.sha256) throw new Error(`Prepared intake changed: ${file.path}`);
}
for (const file of await json(`${relationshipPath}/packet-files.json`)) {
  if (await digest(`${relationshipPath}/${file.path}`) !== file.sha256) throw new Error(`Prepared relationship packet changed: ${file.path}`);
}
const suppliedChecks = await Promise.all(suppliedManifest.sources.map(async (entry: any) => {
  const preservedPath = entry.sharedCopy ?? `${preparedIntakePath}/originals/${entry.sha256}${path.extname(entry.path).toLowerCase()}`;
  if (await digest(preservedPath) !== entry.sha256) throw new Error(`Preserved supplied source changed: ${entry.path}`);
  return { unit: entry.unit, kind: entry.kind, originalName: path.basename(entry.path), preservedPath, sha256: entry.sha256, status: "preserved-hash-verified-academic-review-pending" };
}));

const procedures = {
  source: { owner: "scripts/lib/biology30-course/v1/intake.ts", inputs: ["teacher-sequence", "source-archives", "curriculum-performance", "notes"], outputs: ["checksummed source inventory", "row/page/slide dispositions", "exact unit contract"], checks: ["hash and count verification", "secure-source exclusion", "transaction rollback"], recovery: "Reject drift; preserve originals; stage a new inventory rather than overwrite accepted sources." },
  instruction: { owner: "scripts/lib/biology30-course/v1/content-<unit>.ts", inputs: ["teacher-sequence", "curriculum-performance", "notes"], outputs: ["complete core explanations", "first-use dependency graph", "worked examples and retrieval"], checks: ["atomic scientific and skills review", "first-use reading order", "readability plus unassisted reader review"], recovery: "Repair the exact missing mechanism or prerequisite; never raise reading difficulty to add depth." },
  textbook: { owner: "scripts/lib/biology30-course/v1/render.ts", inputs: ["textbook-chapters", "learner-review-questions", "authorized-review-guidance"], outputs: ["printed/physical page map", "native corrected answer guides", "practice feedback links"], checks: ["exact physical PDF opening", "attempt-before-answer persistence", "all answer rationales checked"], recovery: "Reconcile printed folios with PDF pages; do not substitute PDF arithmetic for inspection." },
  visual: { owner: "scripts/lib/biology30-course/v1/figure-grammar.ts", inputs: ["editable-decks", "textbook-chapters", "image-rights-and-decisions"], outputs: ["native source extraction", "scientific prompt and full-resolution candidate", "side-by-side decision and replacement provenance"], checks: ["scientific checklist before aesthetics", "alt/long description and enlargement", "one visible figure per purpose"], recovery: "Return to the exact prompt/candidate; narrowly correct errors and obtain a new teacher decision. Keep replaced assets in authoring history." },
  video: { owner: "scripts/lib/biology30-course/v1/render.ts", inputs: ["editable-decks", "video-transcripts-captions", "notes"], outputs: ["unit-specific video map", "reviewed segments and duration", "local illustrated equivalent and checkpoint"], checks: ["no autoplay or custom play button", "blocked-network completion", "transcript accuracy and objective parity"], recovery: "Use the reviewed local path when a provider fails; never silently substitute an unreviewed clip." },
  practice: { owner: "scripts/lib/biology30-course/v1/content-<unit>.ts", inputs: ["curriculum-performance", "learner-review-questions", "textbook-chapters"], outputs: ["explicit item-to-behaviour bindings", "key/distractor/rationale records", "non-quiz skills evidence"], checks: ["no route-level alignment fallbacks", "no untaught required vocabulary", "stable equivalent IDs or documented migration"], recovery: "Remap an existing genuinely aligned item first, replace weak items one-for-one second, add a scoped skills task only if necessary." },
  vocabulary: { owner: "scripts/lib/biology30-course/v1/content-<unit>.ts", inputs: ["curriculum-performance", "teacher-sequence", "morphology-sources"], outputs: ["unit-specific concept families", "four anchors plus all terms", "model Frayers and stable response IDs"], checks: ["definitions before dependent words", "no false morphology", "choice/reveal/collection safety"], recovery: "Preserve writing; revise only the selected empty choice or use an explicit copy/clear flow." },
  evidence: { owner: "scripts/lib/biology30-course/v1/render.ts", inputs: ["unit-state-contract", "teacher-approved-investigations"], outputs: ["Predict-Test-Explain-Save models", "unified saved-work registry", "exact return links and copy/print"], checks: ["derived state not duplicated text", "task actually demonstrates claimed skill", "truthful local/LMS save outcomes"], recovery: "Keep last valid state; expose failed saving and offer copy. Never count a selection as a saved explanation." },
  advanced: { owner: "scripts/lib/biology30-course/v1/content-<unit>.ts", inputs: ["curriculum-performance", "old-unit-sections", "notes"], outputs: ["section-by-section depth disposition", "adjacent collapsed advanced blocks", "independent optional checklist"], checks: ["no core content hidden in advanced", "accessible language", "optional minutes and flags separated"], recovery: "Exclude noncurricular/unsafe content; retain rejected and superseded decisions rather than copying everything." },
  verification: { owner: "scripts/lib/biology30-course/v1/acceptance.ts", inputs: ["exact-candidate", "unit-state-contract", "image-rights-and-decisions"], outputs: ["exact-build audit and contact sheets", "teacher feedback resolution", "acceptance and handoff"], checks: ["all sheets actually opened", "mobile/zoom/keyboard/axe", "full-build teacher acceptance distinct from deployment"], recovery: "Invalidate only evidence affected by drift, rerun on the new hash, and keep older evidence attached to its original build." }
};
type ProcedureKey = keyof typeof procedures;
// An unknown rule must receive an authored mapping, not a title/keyword guess.
const ruleProcedures: Record<string, ProcedureKey> = {
  "transactional-local-textbook-intake": "source",
  "three-document-library-and-exact-page-links": "textbook",
  "attempt-before-answer-with-isolated-persistence": "textbook",
  "practice-feedback-textbook-crosswalk": "textbook",
  "chapter-grouped-lessons-and-review-navigation": "instruction",
  "native-corrected-review-experience": "textbook",
  "secure-assessment-exclusion": "source",
  "point-of-use-safety-notes": "instruction",
  "retrieval-response-layout": "instruction",
  "transactional-powerpoint-media-intake": "source",
  "transactional-source-visual-preparation": "visual",
  "selective-source-informed-visual-upgrade": "visual",
  "optional-visible-preview-video-library": "video",
  "exact-build-visual-contact-sheet-gate": "verification",
  "lesson-04-membrane-contrast-and-generated-base-review": "visual",
  "lesson-12-endocrine-body-map-generated-base-review": "visual",
  "teacher-selected-generated-figure-replacements": "visual",
  "deduplicate-final-lesson-textbook-review": "textbook",
  "one-based-learner-practice-numbering": "practice",
  "process-collection-exit-slip-aggregation": "evidence",
  "science-core-vocabulary-and-frayer-process-collection": "vocabulary",
  "topic-sequence-from-teacher-plans": "instruction",
  "prerequisite-first-science-language": "instruction",
  "teach-then-retrieve": "instruction",
  "required-core-versus-advanced-learning": "advanced",
  "two-purposeful-visuals-per-lesson": "visual",
  "curricular-practice-only": "practice",
  "manageable-non-gating-investigations": "evidence",
  "atomic-curriculum-component-coverage": "practice",
  "expanded-readable-core-explanations": "instruction",
  "four-anchors-plus-complete-term-inventory": "vocabulary",
  "required-media-or-local-equivalent": "video",
  "complete-online-investigation-and-media-paths": "evidence",
  "media-aware-nondestructive-state-migration": "evidence",
  "complete-thirteen-lesson-depth-propagation": "instruction",
  "all-lesson-purposeful-visual-density": "visual",
  "curricular-prerequisite-practice-readiness": "practice",
  "full-course-required-media-equivalent-parity": "video",
  "restored-collapsible-course-navigation": "instruction",
  "process-collection-resource-grouping": "evidence",
  "lesson-model-lab-and-collected-evidence": "evidence",
  "responsive-model-mechanism-layout": "evidence",
  "pilot-1-interaction-depth-adapted-to-pilot-2": "evidence",
  "guided-model-investigation-cycle": "evidence",
  "compact-backward-compatible-learner-state": "evidence",
  "responsive-illustrated-walkthrough-steps": "video",
  "operable-locked-core-vocabulary-preview": "vocabulary",
  "optional-attempt-gated-textbook-review-guides": "textbook",
  "pilot-1-to-pilot-2-advanced-learning-bridge": "advanced",
  "explicit-academic-evidence-without-route-fallbacks": "practice",
  "exact-first-use-vocabulary-links": "vocabulary",
  "append-only-improvement-history": "verification",
  "unified-process-collection-index-and-truthful-save-status": "evidence"
};
const ownerOverrides: Record<string, string> = {
  "chapter-grouped-lessons-and-review-navigation": "scripts/lib/biology30-course/v1/render.ts",
  "restored-collapsible-course-navigation": "scripts/lib/biology30-course/v1/render.ts",
  "retrieval-response-layout": "scripts/lib/biology30-course/v1/render.ts",
  "one-based-learner-practice-numbering": "scripts/lib/biology30-course/v1/render.ts",
  "media-aware-nondestructive-state-migration": "scripts/lib/biology30-course/v1/suspend-data.ts",
  "compact-backward-compatible-learner-state": "scripts/lib/biology30-course/v1/suspend-data.ts"
};
const rules = [
  ...ledger1.entries.map((entry: any) => ({ ...entry, origin: pilot1, sourceStatus: entry.reviewStatus, evidenceRef: `${pilot1}/meta/improvement-ledger.json` })),
  ...ledger2.rules.map((entry: any) => ({ ...entry, origin: pilot2, sourceStatus: entry.status, evidenceRef: `${pilot2}/${entry.evidence.split("#")[0]}` }))
].map((entry: any) => {
  const procedure = ruleProcedures[entry.id];
  if (!procedure) throw new Error(`Missing authored transfer procedure: ${entry.id}`);
  const owner = ownerOverrides[entry.id] ?? procedures[procedure].owner;
  const implementationFiles = entry.origin === pilot1
    ? entry.owner.split(/,\s*(?:and\s+)?|\s+and\s+/).map((file: string) => file.startsWith("meta/") ? `${pilot1}/${file}` : file)
    : [entry.evidenceRef];
  const sourceIterations = entry.chapter11Iteration ? [{
    ...entry.chapter11Iteration,
    evidence: `${pilot2}/${entry.chapter11Iteration.evidence}`,
    review: `${pilot2}/${entry.chapter11Iteration.review}`
  }] : [];
  if (sourceIterations.length) implementationFiles.push(
    sourceIterations[0].evidence, sourceIterations[0].review,
    ...["chapter-11-study", "academic-evidence", "process-collection-content", "render-gate1", "build-process-collection-index"]
      .map((name) => `scripts/lib/biology30-unit-a-pilot-2/${name}.ts`)
  );
  const academicReview = entry.remainingAcademicReview ? {
    ...entry.remainingAcademicReview,
    evidence: `${pilot2}/${entry.remainingAcademicReview.evidence}`,
    report: `${pilot2}/${entry.remainingAcademicReview.report}`
  } : null;
  if (academicReview) implementationFiles.push(academicReview.evidence, academicReview.report,
    "scripts/lib/biology30-unit-a-pilot-2/remaining-academic-review.ts",
    "scripts/review-biology30-unit-a-pilot-2-academic.ts");
  const academicCorrections = entry.correctionIteration ? {
    ...entry.correctionIteration,
    evidence: `${pilot2}/${entry.correctionIteration.evidence}`,
    verification: `${pilot2}/${entry.correctionIteration.review}`
  } : null;
  if (academicCorrections) implementationFiles.push(academicCorrections.evidence, academicCorrections.verification,
    "scripts/lib/biology30-unit-a-pilot-2/practice-corrections.ts",
    "scripts/lib/biology30-unit-a-pilot-2/academic-corrections.ts",
    "scripts/check-biology30-unit-a-academic-corrections.ts",
    "scripts/tests/biology30-unit-a-academic-corrections.test.ts");
  if (entry.id === "complete-online-investigation-and-media-paths") implementationFiles.push(
    ...["online-studies", "online-media", "render-online", "online-investigations", "online-video-review", "online-finalization", "practice-academic-review"]
      .map((name) => `scripts/lib/biology30-unit-a-pilot-2/${name}.ts`)
  );
  return { id: `${entry.origin}:${entry.id}`, sourceRuleId: entry.id, origin: entry.origin, sourceStatus: entry.sourceStatus, acceptedScope: entry.acceptedScope ?? null, evidence: entry.evidenceRef, implementationFiles, sourceIterations, academicReview, academicCorrections, sourcePrinciple: entry.rule ?? null, sourceAdaptation: entry.applicabilityToUnitsBD?.adaptation ?? null, procedure, ...procedures[procedure], owner, unitOwners: Object.fromEntries(["B", "C", "D"].map((unit) => [unit, owner.replace("<unit>", unit.toLowerCase())])), procedureLink: `${pilot1}/meta/unit-a-to-bcd-improvement-playbook.md#current-production-recipe`, transferEligibility: "awaiting-complete-unit-a-acceptance", unitReadiness: { B: "not-applied", C: "not-applied", D: "not-applied" } };
});
if (Object.keys(ruleProcedures).length !== rules.length) throw new Error("Transfer mapping and ledger inventory differ.");
await Promise.all([...new Set(rules.flatMap((rule) => [rule.evidence, ...rule.implementationFiles, ...Object.values(rule.unitOwners), rule.procedureLink.split("#")[0]]))].map(async (file) => {
  if (typeof file !== "string") throw new Error("Invalid transfer file reference.");
  await access(path.join(root, file));
}));
const archiveChecks = await Promise.all(family.sharedSourceLibrary.resources.map(async (entry: any) => {
  const actual = await digest(entry.path);
  if (actual !== entry.sha256) throw new Error(`Changed shared source archive: ${entry.id}`);
  return { id: entry.id, path: entry.path, sha256: actual, status: "hash-verified" };
}));
const classArchive = family.sharedSourceLibrary.resources.find((entry: any) => entry.id === "class-2026-27");
const zip = await JSZip.loadAsync(await readFile(classArchive.path));
const verifiedNotes = await Promise.all(family.sharedSourceLibrary.noteSources.map(async (entry: any) => {
  const file = zip.file(entry.archivePath);
  if (!file) throw new Error(`Missing inventoried note source: ${entry.archivePath}`);
  const actual = createHash("sha256").update(await file.async("nodebuffer")).digest("hex");
  if (actual !== entry.sha256) throw new Error(`Note source changed: ${entry.sourceId}`);
  return { unit: entry.unitCode, id: entry.sourceId, locator: entry.archiveLocator, sha256: actual, pageCount: entry.pageCount, status: "hash-verified-content-needs-current-audit" };
}));
const units = await Promise.all(["B", "C", "D"].map(async (unit) => {
  const slug = `biology30-unit-${unit.toLowerCase()}`;
  const contractPath = `${resources}/units/unit-${unit.toLowerCase()}/production-contract.json`;
  const contract = await json(contractPath);
  const entries = catalog.items.filter((entry: any) => entry.unitCode === unit && !["excluded-assessment-material", "excluded-hidden", "transformed-practice"].includes(entry.disposition));
  const candidates = entries.filter((entry: any) => /day|note|review|textbook|chapter/.test(entry.title.toLowerCase())).map((entry: any) => ({ title: entry.title, locator: `${entry.sourceId}#${entry.resource?.href || entry.itemId}`, disposition: entry.disposition }));
  return { unit, project: slug, contractPath, contractSha256: await digest(contractPath), workspaceSha256: await digest(`projects/${slug}/workspace/index.html`), owner: "scripts/lib/biology30-course/v1/", lessonCount: contract.learnerRoutes.filter((route: string) => /-lesson-/.test(route)).length, practiceCount: contract.assessment.practiceBlueprint.total, requiredMinutes: contract.delivery.requiredMinutes, optionalMinutes: contract.delivery.optionalMinutes, readyForOnePassBuild: false, presentNotes: verifiedNotes.filter((entry) => entry.unit === unit), presentUnauditedArchiveCandidates: candidates, needBeforeBuild: [
    { material: "Current teacher topic/daily/review plans", status: "supplied-preserved-rows-inventoried", action: "Use the supplied teacher order and daily-plans.json; complete row dispositions. No re-upload or topic-order confirmation is needed." },
    { material: "Original editable PowerPoints", status: "supplied-preserved-slides-media-links-inventoried", action: "Use decks.json and preserved originals; complete individual visual/science/rights dispositions before learner reuse." },
    { material: "Textbook chapters and visible review questions", status: "all-chapters-normalized-original-part-mapped", action: "Use textbooks.json and preserved archive members; visually verify folios and review every assigned question before adapting guides." },
    { material: "Learner-authorized review guidance", status: "archive-candidates-present-needs-rights-and-answer-audit", action: "Separate visible textbook guidance from secure quizzes/teacher-only keys; rewrite and scientifically verify native answers." },
    { material: "Videos, captions, segments and duration", status: "needs-unit-link-and-transcript-inventory", action: "Extract every link from supplied decks and notes, record dispositions, and review captions, facts, pace and local equivalents." },
    { material: "Figures, rights and teacher choices", status: "needs-current-context-review", action: "Compare existing figures, native PPT/PDF images and original candidates. Reuse the documented ChatGPT comparison process only for gaps." },
    { material: "Investigations and data", status: "needs-teacher-approved-skills-paths", action: "Inventory real or supplied data, tools, safety and accommodations. Do not call analysis evidence proof of performing a physical procedure." }
  ] };
}));
const transfer = { schemaVersion: 1, project: "biology30-production", sourceWorkspaceSha256: currentSha, sourceAcademicReview: `${pilot2}/meta/final-academic-review.json`, status: "recipe-complete-academic-clearance-pending", executionChoice: "full-unit-build-then-review", automaticTransfer: false, academicGapsOpen: academic.gaps.length, canonicalPlaybook: `${pilot1}/meta/unit-a-to-bcd-improvement-playbook.md`, rules, futureBuilderOwner: "scripts/lib/biology30-course/v1/", legacyRulesSuperseded: ["Universal optional-video policy is superseded by required video-or-local-path learning steps; supplementary library entries remain optional.", "Two visuals per lesson is a historical minimum, not sufficient proof of present instructional completeness.", "A route or first available question is never evidence that a precise skill is taught or assessed.", "B-D representative-slice approval pauses are replaced by the user's full-unit-build-then-review decision; source readiness and final acceptance gates remain."] };
const materials = { schemaVersion: 1, status: "sources-prepared-academic-contracts-incomplete", sourceWorkspaceSha256: currentSha, archiveChecks,
  availabilityOverlay: { manifestPath: suppliedManifestPath, manifestSha256: suppliedManifestSha, preparedIntakePath, relationshipPath, externalDeckRelationships: relationshipInventory.externalDeckRelationships, suppliedChecks, counts: preparedAvailability.counts,
    executionAuthorization: "Provisional Unit A process use and complete sequential B/C/D rebuild authorized; no teacher acceptance or release authority." },
  units, prohibited: ["secure tests", "teacher-only quiz/exam keys", "external account credentials", "broken LMS launchers", "private ChatGPT conversation links in learner files"], note: "Preservation and inventories are not scientific, rights or teaching acceptance. B/C/D learner workspaces remain unchanged; source preparation is recorded separately." };
for (const [file, value] of [[transferPath, transfer], [materialsPath, materials]] as const) {
  if (checkOnly) {
    if (JSON.stringify(await json(file)) !== JSON.stringify(value)) throw new Error(`Stale generated transfer record: ${file}`);
  } else await writeFile(file, JSON.stringify(value, null, 2) + "\n");
}
console.log(`${checkOnly ? "Verified" : "Generated"} ${rules.length} ledger-rule transfer records and B/C/D materials readiness. No unit is marked ready while academic/source gates remain open.`);
