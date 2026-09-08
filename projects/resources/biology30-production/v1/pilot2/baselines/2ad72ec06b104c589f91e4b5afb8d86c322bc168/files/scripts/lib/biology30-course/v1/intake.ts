import { createHash } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import pdf from "pdf-parse";

import {
  classifyBiologyUnitSourceDisposition,
  loadBiologySourceModel
} from "../../biology30-unit-a/source.js";
import type { BiologySourceModel, ContentDisposition } from "../../biology30-unit-a/types.js";
import { validateProjectManifestPolicy } from "../../project-manifest-policy.js";
import type { NamedBrightspaceResource } from "../../science-comparison.js";
import type { ProjectManifest } from "../../types.js";
import {
  BIOLOGY30_NOTE_SOURCES,
  BIOLOGY30_REMAINING_ARTIFACTS,
  BIOLOGY30_REMAINING_LESSONS,
  BIOLOGY30_REMAINING_MODULES,
  validateBiology30RemainingBlueprint,
  type Biology30ArtifactBlueprint,
  type Biology30LessonBlueprint,
  type Biology30ModuleBlueprint,
  type Biology30NotesSelection
} from "./blueprint.js";
import {
  BIOLOGY30_PROGRAM_OF_STUDIES_SHA256,
  BIOLOGY30_PROGRAM_OF_STUDIES_URL,
  BIOLOGY30_UNIT_CURRICULA,
  validateBiology30RemainingCurriculum,
  type Biology30ProductionUnitCode
} from "./curriculum.js";

export const BIOLOGY30_PRODUCTION_FAMILY = "biology30-production" as const;
export const BIOLOGY30_PRODUCTION_PROFILE = "biology30-production-95-v1" as const;
export const BIOLOGY30_PRODUCTION_RESOURCE_ROOT = "projects/resources/biology30-production/v1" as const;
export const BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH = `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/source-and-rights-register.json` as const;
const SOURCE_MANIFEST_PATH = "projects/resources/biology30-unit-a-pilot/resource-manifest.json";

const UNIT_CODES = ["B", "C", "D"] as const;
const UNIT_CODE_LOWER = { B: "b", C: "c", D: "d" } as const;
const UNIT_SOURCE_TITLES = { B: "Unit B", C: "Unit C", D: "Unit D" } as const;

const AUTHORITY_URLS = {
  performanceStandards: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology30-performance-standards.pdf",
  biologyBulletin: "https://www.alberta.ca/system/files/custom_downloaded_images/edc-biology-30-info-bulletin.pdf",
  diplomaGeneral: "https://www.alberta.ca/system/files/ecc-diploma-exam-general-information-bulletin-2026-27.pdf"
} as const;

const SUPPLEMENT_URLS = {
  openStaxAnatomyPhysiology: "https://openstax.org/details/books/anatomy-and-physiology-2e",
  openStaxBiology: "https://openstax.org/details/books/biology-2e",
  canadaSexualHealth: "https://www.canada.ca/en/public-health/services/sexual-health.html",
  canadaStiGuidance: "https://www.canada.ca/en/services/health/campaigns/sexually-transmitted-infections.html",
  canadaAssistedReproduction: "https://www.canada.ca/en/health-canada/services/drugs-health-products/biologics-radiopharmaceuticals-genetic-therapies/legislation-guidelines/assisted-human-reproduction.html"
} as const;

type SourceModelsByUnit = Record<Biology30ProductionUnitCode, Map<string, BiologySourceModel>>;

type SourceCatalogItem = {
  unitCode: Biology30ProductionUnitCode;
  sourceId: string;
  itemId: string;
  parentId?: string;
  title: string;
  pathTitles: string[];
  visible: boolean;
  explicitlyHidden: boolean;
  descriptionPresent: boolean;
  resource?: { identifier: string; href: string; type: string; materialType?: string; resourceCode?: string };
  disposition: ContentDisposition["disposition"];
  dispositionReason: string;
};

export type RemainingSourceCatalog = {
  schemaVersion: 1;
  family: typeof BIOLOGY30_PRODUCTION_FAMILY;
  generatedAt: string;
  sources: Array<{
    unitCode: Biology30ProductionUnitCode;
    sourceId: string;
    label: string;
    role: string;
    path: string;
    sha256: string;
    originalName: string;
    rootId: string;
    rootTitle: string;
    itemCount: number;
    visibleQuizCount: number;
    visibleQuestionCount: number;
    utf16HtmlCount: number;
  }>;
  items: SourceCatalogItem[];
  visibleQuizzes: Array<{
    unitCode: Biology30ProductionUnitCode;
    sourceId: string;
    id: string;
    title: string;
    sourceItemId: string;
    sourceXmlPath: string;
    questionCount: number;
  }>;
};

type NoteSourceRecord = {
  sourceId: string;
  unitCode: Biology30ProductionUnitCode;
  archivePath: string;
  archiveLocator: string;
  sha256: string;
  pageCount: number;
  byteCount: number;
  selectedLessonIds: string[];
  selectedPageCount: number;
  pageDispositionCount: number;
  visualReviewStatus: "pending-gate-1" | "complete-authoring-reference-review";
};

type ResolvedSourceRef = {
  id: string;
  sourceId: string;
  itemId?: string;
  sourcePath: string;
  pdfPages?: number[];
  role: "core" | "reference";
  rightsStatus: string;
  usage: "paraphrase" | "adaptation" | "data";
};

export type Biology30SourceAndRightsRegister = {
  schemaVersion: 1;
  family: typeof BIOLOGY30_PRODUCTION_FAMILY;
  generatedAt: string;
  rule: string;
  requiredLearningLocal: true;
  sources: Array<{
    id: string;
    label: string;
    kind: string;
    role: string;
    path?: string;
    url?: string;
    sha256?: string;
    originalName?: string;
    retrievedAt?: string;
    rightsStatus: string;
    allowedUse: string;
  }>;
  uses: Array<{
    id: string;
    sourceId: string;
    lessonIds?: string[];
    projectScopes?: string[];
    role: "authority" | "core" | "reference" | "cross-check";
    usage: "outcome-mapping" | "paraphrase" | "adaptation" | "assessment-guidance";
  }>;
};

export type RemainingUnitContract = {
  schemaVersion: 1;
  profileId: typeof BIOLOGY30_PRODUCTION_PROFILE;
  family: typeof BIOLOGY30_PRODUCTION_FAMILY;
  unitCode: Biology30ProductionUnitCode;
  project: { slug: string; title: string; courseCode: "BIO 30"; version: "production-candidate-v1" };
  status: {
    authoringStatus: "blocked";
    driverId: "proposal-only-v1";
    reviewGate: "gate-0-ready";
    studioEditingEnabled: false;
    exportEnabled: false;
  };
  curriculum: {
    courseTimePercent: number;
    programOfStudiesUrl: string;
    programOfStudiesSha256: string;
    programPages: number[];
    biologyBulletinSchoolYear: "2025-26";
    biologyBulletin2026_27Found: false;
    authorityCheckedAt: string;
  };
  delivery: {
    mode: "independent-first-asynchronous";
    requiredMinutes: number;
    optionalMinutes: number;
    requiredInternet: false;
    requiredTeacherPresence: false;
    requiredPeerAvailability: false;
  };
  quality: {
    minimumHumanScore: 95;
    minimumCategoryPercent: 80;
    automaticPromotion: false;
    binaryBlockers: string[];
  };
  assessment: {
    boundary: "formative-practice-and-submission-ready-artifacts";
    secureSummativeLocation: "brightspace";
    practiceBlueprint: { lessonChecks: number; moduleChecks: number; finalPractice: number; total: number };
    sourceVisibleQuestionInventory: number;
  };
  learnerRoutes: string[];
  modules: Biology30ModuleBlueprint[];
  outcomes: Array<{
    id: string;
    officialText: string;
    category: string;
    authorityUrl: string;
    authorityPdfPage: number;
    teachRoutes: string[];
    practiceRoutes: string[];
    evidenceRoutes: string[];
  }>;
  sourceRefs: ResolvedSourceRef[];
  lessons: Array<Biology30LessonBlueprint & { sourceRefIds: string[] }>;
  artifacts: Array<Biology30ArtifactBlueprint & {
    fields: Array<{ id: string; label: string; maxLength: number }>;
    rubricId: string;
    printEnabled: true;
    exportSummaryEnabled: true;
  }>;
  interactions: Array<{
    id: string;
    kind: string;
    lessonId: string;
    responseIds: string[];
    completionRule: string;
    fallbackType: "supplied-data" | "static-model";
    keyboardOperable: true;
    persistent: true;
    networkRequired: false;
  }>;
  sourcePolicy: {
    requiredLocalFirst: true;
    slideImagesAsLessons: false;
    externalLinksRequiredForCompletion: false;
    visibleChapterQuizzesBecomeNonGradedPractice: true;
    secureTestsKeysAndPrintableQuizzesExcluded: true;
    sourceTextCopiedVerbatim: false;
  };
  reviewRubric: {
    total: 100;
    minimumPassingTotal: 95;
    categories: Array<{ id: string; points: number; minimum: number }>;
    promotionRequiresExplicitUserAcceptance: true;
  };
  generatedAt: string;
};

export type Biology30CourseIntakeRequest = {
  repoRoot: string;
  family?: string;
  testHooks?: {
    afterStageWrite?: (stageRoot: string) => void | Promise<void>;
    beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
  };
};

export type Biology30CourseIntakeResult = {
  resourceDir: string;
  projectDirs: string[];
  familyContractSha256: string;
  sourceCatalog: RemainingSourceCatalog;
  noteSources: NoteSourceRecord[];
};

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function writeJson(targetPath: string, value: unknown) {
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function loadResources(repoRoot: string) {
  const manifest = JSON.parse(await readFile(path.join(repoRoot, SOURCE_MANIFEST_PATH), "utf8")) as {
    resources: NamedBrightspaceResource[];
  };
  const expected = ["class-2026-27", "system-2020"];
  if (manifest.resources.length !== expected.length || manifest.resources.some((resource, index) => resource.id !== expected[index])) {
    throw new Error("Biology 30 production requires the verified class-2026-27 and system-2020 resources in stable order.");
  }
  return manifest.resources;
}

async function loadModels(repoRoot: string, resources: NamedBrightspaceResource[]): Promise<SourceModelsByUnit> {
  const result = {} as SourceModelsByUnit;
  for (const unitCode of UNIT_CODES) {
    result[unitCode] = new Map();
    for (const resource of resources) {
      const model = await loadBiologySourceModel({
        repoRoot,
        resource,
        unitTitle: UNIT_SOURCE_TITLES[unitCode],
        chapterNumbers: BIOLOGY30_UNIT_CURRICULA[unitCode].chapters
      });
      result[unitCode].set(resource.id, model);
    }
  }
  return result;
}

function buildSourceCatalog(models: SourceModelsByUnit, generatedAt: string): RemainingSourceCatalog {
  const sources: RemainingSourceCatalog["sources"] = [];
  const items: SourceCatalogItem[] = [];
  const visibleQuizzes: RemainingSourceCatalog["visibleQuizzes"] = [];
  for (const unitCode of UNIT_CODES) {
    for (const model of models[unitCode].values()) {
      const dispositions = classifyBiologyUnitSourceDisposition(model, { unitCode, boundaryLabel: UNIT_SOURCE_TITLES[unitCode] });
      const dispositionById = new Map(dispositions.map((record) => [record.itemId, record]));
      sources.push({
        unitCode,
        sourceId: model.resource.id,
        label: model.resource.label,
        role: model.resource.role,
        path: model.resource.path,
        sha256: model.resource.sha256,
        originalName: model.resource.originalName,
        rootId: model.unitRoot.identifier,
        rootTitle: model.unitRoot.title,
        itemCount: model.items.length,
        visibleQuizCount: model.quizzes.length,
        visibleQuestionCount: model.quizzes.reduce((total, quiz) => total + quiz.questions.length, 0),
        utf16HtmlCount: model.utf16HtmlPaths.length
      });
      for (const item of model.items) {
        const disposition = dispositionById.get(item.identifier);
        if (!disposition) throw new Error(`Missing ${unitCode} source disposition for ${model.resource.id}:${item.identifier}.`);
        items.push({
          unitCode,
          sourceId: model.resource.id,
          itemId: item.identifier,
          parentId: item.parentId,
          title: item.title,
          pathTitles: [...item.pathTitles],
          visible: item.visible,
          explicitlyHidden: item.explicitlyHidden,
          descriptionPresent: Boolean(item.descriptionHtml.trim()),
          resource: item.resource
            ? {
                identifier: item.resource.identifier,
                href: item.resource.href,
                type: item.resource.type,
                materialType: item.resource.materialType,
                resourceCode: item.resource.resourceCode
              }
            : undefined,
          disposition: disposition.disposition,
          dispositionReason: disposition.reason
        });
      }
      visibleQuizzes.push(
        ...model.quizzes.map((quiz) => ({
          unitCode,
          sourceId: model.resource.id,
          id: quiz.id,
          title: quiz.title,
          sourceItemId: quiz.sourceItemId,
          sourceXmlPath: quiz.sourceXmlPath,
          questionCount: quiz.questions.length
        }))
      );
    }
  }
  return { schemaVersion: 1, family: BIOLOGY30_PRODUCTION_FAMILY, generatedAt, sources, items, visibleQuizzes };
}

async function verifyNoteSources(models: SourceModelsByUnit): Promise<NoteSourceRecord[]> {
  const classModel = models.B.get("class-2026-27");
  if (!classModel) throw new Error("The primary class archive is unavailable for notes verification.");
  const noteUnit: Record<keyof typeof BIOLOGY30_NOTE_SOURCES, Biology30ProductionUnitCode> = {
    B: "B",
    C1: "C",
    C2: "C",
    C3: "C",
    D: "D"
  };
  const records: NoteSourceRecord[] = [];
  for (const [key, source] of Object.entries(BIOLOGY30_NOTE_SOURCES) as Array<[
    keyof typeof BIOLOGY30_NOTE_SOURCES,
    (typeof BIOLOGY30_NOTE_SOURCES)[keyof typeof BIOLOGY30_NOTE_SOURCES]
  ]>) {
    const entry = classModel.archive.file(source.archivePath);
    if (!entry) throw new Error(`The canonical Biology notes entry is missing: ${source.archivePath}.`);
    const bytes = await entry.async("nodebuffer");
    const actualHash = sha256(bytes);
    if (actualHash !== source.sha256) {
      throw new Error(`Biology notes hash drift for ${source.archivePath}: expected ${source.sha256}, received ${actualHash}.`);
    }
    const parsed = await pdf(bytes);
    if (parsed.numpages !== source.pageCount) {
      throw new Error(`Biology notes page-count drift for ${source.archivePath}: expected ${source.pageCount}, received ${parsed.numpages}.`);
    }
    const unitCode = noteUnit[key];
    const selections = BIOLOGY30_REMAINING_LESSONS[unitCode].flatMap((lesson) =>
      lesson.notes.filter((selection) => selection.sourceId === source.sourceId).map((selection) => ({ lessonId: lesson.id, ...selection }))
    );
    const selectedPages = new Set(selections.flatMap((selection) => selection.pages));
    records.push({
      sourceId: source.sourceId,
      unitCode,
      archivePath: source.archivePath,
      archiveLocator: `${classModel.resource.path}#${source.archivePath}`,
      sha256: source.sha256,
      pageCount: source.pageCount,
      byteCount: bytes.byteLength,
      selectedLessonIds: [...new Set(selections.map((selection) => selection.lessonId))],
      selectedPageCount: selectedPages.size,
      pageDispositionCount: source.pageCount,
      visualReviewStatus: "pending-gate-1"
    });
  }
  return records;
}

function sourceCatalogItem(catalog: RemainingSourceCatalog, unitCode: Biology30ProductionUnitCode, sourceId: string, itemId: string) {
  const item = catalog.items.find((candidate) => candidate.unitCode === unitCode && candidate.sourceId === sourceId && candidate.itemId === itemId);
  if (!item) throw new Error(`Unknown explicit Biology source selection ${unitCode}/${sourceId}/${itemId}.`);
  if (item.disposition.startsWith("excluded-")) {
    throw new Error(`Lesson source selection ${unitCode}/${sourceId}/${itemId} is excluded: ${item.disposition}.`);
  }
  return item;
}

function noteRef(lesson: Biology30LessonBlueprint, selection: Biology30NotesSelection, index: number): ResolvedSourceRef {
  return {
    id: `${lesson.id}:notes:${index + 1}`,
    sourceId: selection.sourceId,
    sourcePath: selection.archivePath,
    pdfPages: [...selection.pages],
    role: "core",
    rightsStatus: "authorized-local-course-source",
    usage: "adaptation"
  };
}

function resolveLessonSources(lesson: Biology30LessonBlueprint, catalog: RemainingSourceCatalog) {
  const refs: ResolvedSourceRef[] = [];
  for (const itemId of lesson.classItemIds) {
    const item = sourceCatalogItem(catalog, lesson.unitCode, "class-2026-27", itemId);
    refs.push({
      id: `${lesson.id}:class:${itemId}`,
      sourceId: "class-2026-27",
      itemId,
      sourcePath: item.pathTitles.join(" > "),
      role: "core",
      rightsStatus: "authorized-local-course-source",
      usage: "paraphrase"
    });
  }
  for (const itemId of lesson.systemItemIds) {
    const item = sourceCatalogItem(catalog, lesson.unitCode, "system-2020", itemId);
    refs.push({
      id: `${lesson.id}:system:${itemId}`,
      sourceId: "system-2020",
      itemId,
      sourcePath: item.pathTitles.join(" > "),
      role: "reference",
      rightsStatus: "authorized-local-course-source",
      usage: "paraphrase"
    });
  }
  refs.push(...lesson.notes.map((selection, index) => noteRef(lesson, selection, index)));
  return refs;
}

function practiceBlueprint(unitCode: Biology30ProductionUnitCode) {
  if (unitCode === "B") return { lessonChecks: 42, moduleChecks: 20, finalPractice: 24, total: 86 };
  if (unitCode === "C") return { lessonChecks: 96, moduleChecks: 24, finalPractice: 40, total: 160 };
  return { lessonChecks: 33, moduleChecks: 15, finalPractice: 24, total: 72 };
}

function learnerRoutes(unitCode: Biology30ProductionUnitCode) {
  return [
    "overview",
    ...BIOLOGY30_REMAINING_LESSONS[unitCode].map((lesson) => lesson.id),
    "model-lab",
    "investigation-notebook",
    "practice-hub",
    "glossary-and-data",
    "sources-and-credits"
  ];
}

function buildUnitContract(
  unitCode: Biology30ProductionUnitCode,
  catalog: RemainingSourceCatalog,
  generatedAt: string
): RemainingUnitContract {
  const curriculum = BIOLOGY30_UNIT_CURRICULA[unitCode];
  const lessons = BIOLOGY30_REMAINING_LESSONS[unitCode];
  const artifactFieldMaxLength = unitCode === "C" ? 350 : 500;
  const artifacts: RemainingUnitContract["artifacts"] = BIOLOGY30_REMAINING_ARTIFACTS.filter((artifact) => artifact.unitCode === unitCode).map((artifact) => ({
    ...artifact,
    fields: [
      { id: `${artifact.id}:claim`, label: "Scientific claim", maxLength: artifactFieldMaxLength },
      { id: `${artifact.id}:evidence`, label: "Evidence or data", maxLength: artifactFieldMaxLength },
      { id: `${artifact.id}:reasoning`, label: "Reasoning and connections", maxLength: artifactFieldMaxLength },
      { id: `${artifact.id}:limitations`, label: "Limitations, safety, or reflection", maxLength: artifactFieldMaxLength }
    ],
    rubricId: "biology30-scientific-evidence-rubric-v1",
    printEnabled: true as const,
    exportSummaryEnabled: true as const
  }));
  const sourceRefs = lessons.flatMap((lesson) => resolveLessonSources(lesson, catalog));
  const refsByLesson = new Map(lessons.map((lesson) => [lesson.id, sourceRefs.filter((ref) => ref.id.startsWith(`${lesson.id}:`)).map((ref) => ref.id)]));
  const sourceVisibleQuestionInventory = catalog.visibleQuizzes
    .filter((quiz) => quiz.unitCode === unitCode && quiz.sourceId === "class-2026-27")
    .reduce((total, quiz) => total + quiz.questionCount, 0);
  const outcomes = curriculum.outcomes.map((record) => {
    const teachRoutes = lessons.filter((lesson) => lesson.outcomeIds.includes(record.id)).map((lesson) => lesson.id);
    const evidenceRoutes = artifacts.filter((artifact) => artifact.outcomeIds.includes(record.id)).map((artifact) => `investigation-notebook#${artifact.id}`);
    if (teachRoutes.length === 0 || evidenceRoutes.length === 0) throw new Error(`Unit ${unitCode} outcome ${record.id} has incomplete coverage.`);
    return {
      id: record.id,
      officialText: record.officialText,
      category: record.category,
      authorityUrl: record.authorityUrl,
      authorityPdfPage: record.authorityPdfPage,
      teachRoutes,
      practiceRoutes: teachRoutes.map((route) => `${route}#practice`),
      evidenceRoutes
    };
  });
  return {
    schemaVersion: 1,
    profileId: BIOLOGY30_PRODUCTION_PROFILE,
    family: BIOLOGY30_PRODUCTION_FAMILY,
    unitCode,
    project: { slug: curriculum.slug, title: curriculum.title, courseCode: "BIO 30", version: "production-candidate-v1" },
    status: {
      authoringStatus: "blocked",
      driverId: "proposal-only-v1",
      reviewGate: "gate-0-ready",
      studioEditingEnabled: false,
      exportEnabled: false
    },
    curriculum: {
      courseTimePercent: curriculum.courseTimePercent,
      programOfStudiesUrl: BIOLOGY30_PROGRAM_OF_STUDIES_URL,
      programOfStudiesSha256: BIOLOGY30_PROGRAM_OF_STUDIES_SHA256,
      programPages: curriculum.programPages,
      biologyBulletinSchoolYear: "2025-26",
      biologyBulletin2026_27Found: false,
      authorityCheckedAt: generatedAt
    },
    delivery: {
      mode: "independent-first-asynchronous",
      requiredMinutes: curriculum.requiredMinutes,
      optionalMinutes: curriculum.optionalMinutes,
      requiredInternet: false,
      requiredTeacherPresence: false,
      requiredPeerAvailability: false
    },
    quality: {
      minimumHumanScore: 95,
      minimumCategoryPercent: 80,
      automaticPromotion: false,
      binaryBlockers: [
        "mandatory outcome unmapped",
        "factual error",
        "teacher-only test or key exposure",
        "inaccessible required activity",
        "required internet dependency",
        "unresolved local asset",
        "learner-state loss",
        "missing investigation fallback",
        "slide controls or placeholders",
        "unresolved rights status",
        "LMS restore failure"
      ]
    },
    assessment: {
      boundary: "formative-practice-and-submission-ready-artifacts",
      secureSummativeLocation: "brightspace",
      practiceBlueprint: practiceBlueprint(unitCode),
      sourceVisibleQuestionInventory
    },
    learnerRoutes: learnerRoutes(unitCode),
    modules: BIOLOGY30_REMAINING_MODULES.filter((module) => module.unitCode === unitCode),
    outcomes,
    sourceRefs,
    lessons: lessons.map((lesson) => ({ ...lesson, sourceRefIds: refsByLesson.get(lesson.id) ?? [] })),
    artifacts,
    interactions: lessons.map((lesson) => ({
      id: `${lesson.id}:interaction`,
      kind: lesson.interactionKind,
      lessonId: lesson.id,
      responseIds: [`${curriculum.slug}:activity:${lesson.interactionKind}:state`],
      completionRule: "Learner completes the reasoning task and receives or reveals explanatory feedback.",
      fallbackType: /data|lab|calculator|simulator|evidence/i.test(lesson.interactionKind) ? "supplied-data" : "static-model",
      keyboardOperable: true,
      persistent: true,
      networkRequired: false
    })),
    sourcePolicy: {
      requiredLocalFirst: true,
      slideImagesAsLessons: false,
      externalLinksRequiredForCompletion: false,
      visibleChapterQuizzesBecomeNonGradedPractice: true,
      secureTestsKeysAndPrintableQuizzesExcluded: true,
      sourceTextCopiedVerbatim: false
    },
    reviewRubric: {
      total: 100,
      minimumPassingTotal: 95,
      categories: [
        { id: "academic", points: 25, minimum: 20 },
        { id: "coherence", points: 20, minimum: 16 },
        { id: "visual", points: 15, minimum: 12 },
        { id: "practice", points: 15, minimum: 12 },
        { id: "accessibility", points: 10, minimum: 8 },
        { id: "runtime", points: 10, minimum: 8 },
        { id: "maintainability", points: 5, minimum: 4 }
      ],
      promotionRequiresExplicitUserAcceptance: true
    },
    generatedAt
  };
}

function factualCorrectionLedger() {
  return [
    { id: "b-sex-development-precision", unitCode: "B", sourceId: "unit-b-notes", pages: [5, 66, 67, 68], severity: "major", treatment: "Distinguish chromosomes, gonadal development, hormones, anatomy, sex characteristics, gender, and individual variation without reducing identity to a binary diagram." },
    { id: "b-aging-and-contraception-precision", unitCode: "B", sourceId: "unit-b-notes", pages: [20, 35], severity: "major", treatment: "Exclude universal ‘andropause’ framing and source-era emergency-contraception simplifications; teach age-related endocrine change and contraception only through bounded, current, non-diagnostic mechanisms." },
    { id: "b-current-sti-and-fertility-guidance", unitCode: "B", sourceId: "unit-b-notes", pages: [65], severity: "major", treatment: "Use current public-health sources, non-stigmatizing language, and no diagnosis or personal disclosure activity." },
    { id: "b-current-reproductive-technology", unitCode: "B", sourceId: "unit-b-notes", pages: [69, 70, 71, 72, 73, 74, 75], severity: "major", treatment: "Cross-check mechanisms, effectiveness, risk, access, and terminology against current authoritative health sources." },
    { id: "c-cloning-aging-telomere-nuance", unitCode: "C", sourceId: "unit-c-cell-division-notes", pages: [34, 35, 36, 37], severity: "major", treatment: "Replace outdated Dolly/telomere generalizations with current, qualified evidence and separate cloning, stem-cell, aging, and cancer claims." },
    { id: "c-karyotype-and-chromosome-language", unitCode: "C", sourceId: "unit-c-cell-division-notes", pages: [6, 7, 58, 59, 60, 61], severity: "major", treatment: "Replace ‘normal karyotype’ and deterministic chromosome/sex language with precise chromosome-pattern terminology, model limits, mosaicism and resolution limits, and respectful non-diagnostic interpretation." },
    { id: "c-reproductive-strategy-teacher-notes", unitCode: "C", sourceId: "unit-c-cell-division-notes", pages: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79], severity: "editorial", treatment: "Rebuild as learner-facing comparison; remove ‘do not memorize’ directions and oversimplified life-cycle framing." },
    { id: "c-mendelian-human-example-limits", unitCode: "C", sourceId: "unit-c-mendelian-genetics-notes", pages: [7, 8, 9, 10, 11, 12, 53, 54], severity: "major", treatment: "Do not teach eye colour or other complex human traits as single-gene binaries; describe sickle-cell inheritance, molecular phenotype, dominance language, and clinical variation with explicit model boundaries." },
    { id: "c-human-trait-model-limitations", unitCode: "C", sourceId: "unit-c-mendelian-genetics-notes", pages: [59, 60, 61, 62, 63, 64, 65, 66, 72, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93], severity: "major", treatment: "Use validated inheritance examples, explicitly label model limitations, avoid simplistic human-trait claims, and preserve the corrected pedigree individual number on page 80." },
    { id: "c-dna-history-credit", unitCode: "C", sourceId: "unit-c-molecular-genetics-notes", pages: [3, 4, 5, 10, 11, 12], severity: "major", treatment: "Represent Franklin’s evidence and the broader history accurately; remove teacher-facing ‘testable’ language." },
    { id: "c-molecular-model-boundaries", unitCode: "C", sourceId: "unit-c-molecular-genetics-notes", pages: [6, 24], severity: "major", treatment: "Qualify ‘same DNA’ and central-dogma shortcuts by accounting for genomic variation, cell lineage, gene regulation, RNA processing, reverse information flow where relevant, and protein-level context." },
    { id: "c-current-genetic-technology", unitCode: "C", sourceId: "unit-c-molecular-genetics-notes", pages: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59], severity: "major", treatment: "Cross-check mutation, organelle inheritance, gene editing, gel electrophoresis, privacy, patent, and treatment claims against current authoritative sources." },
    { id: "d-evolution-and-cultural-example-disposition", unitCode: "D", sourceId: "unit-d-population-notes", pages: [4, 28], severity: "major", treatment: "Exclude the ladder-like human-evolution silhouette and the source’s Métis/Indigenous gene-flow example; use non-human synthetic evidence unless a current Indigenous-led, rights-safe source and appropriate context are available." },
    { id: "d-source-typos-and-formulas", unitCode: "D", sourceId: "unit-d-population-notes", pages: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 34, 35, 36, 38, 39, 40, 41, 42, 43], severity: "blocker", treatment: "Re-typeset every equation and worked example from verified values; never inherit clipped exponents, extraction corruption, or source typos." },
    { id: "d-r-k-continuum", unitCode: "D", sourceId: "unit-d-population-notes", pages: [50, 51, 52, 53, 54, 55], severity: "major", treatment: "Present r/K selection as a comparative continuum and life-history model, not a quality-versus-quantity binary." },
    { id: "d-community-language", unitCode: "D", sourceId: "unit-d-population-notes", pages: [56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68], severity: "editorial", treatment: "Remove teacher notes, correct succession wording, and ground management examples in current Canadian and Indigenous-led sources when used." }
  ];
}

function pageDispositions(noteSources: NoteSourceRecord[]) {
  const corrections = factualCorrectionLedger();
  return noteSources.flatMap((source) => {
    const lessons = BIOLOGY30_REMAINING_LESSONS[source.unitCode];
    return Array.from({ length: source.pageCount }, (_value, index) => {
      const page = index + 1;
      const lessonIds = lessons
        .filter((lesson) => lesson.notes.some((selection) => selection.sourceId === source.sourceId && selection.pages.includes(page)))
        .map((lesson) => lesson.id);
      const correctionIds = corrections
        .filter((record) => record.sourceId === source.sourceId && record.pages.includes(page))
        .map((record) => record.id);
      return {
        sourceId: source.sourceId,
        page,
        status: correctionIds.length ? "corrected" : lessonIds.length ? "used" : "reference-only",
        lessonIds,
        correctionIds,
        reason: correctionIds.length
          ? "Source content may be used only after the listed correction treatment is applied and verified."
          : lessonIds.length
            ? "Page is mapped to explicit lesson authoring and QA routes; no slide image is delivered to learners."
            : "Page is retained for source context but is not required learner instruction."
      };
    });
  });
}

function buildSourceAndRightsRegister(
  resources: NamedBrightspaceResource[],
  noteSources: NoteSourceRecord[],
  generatedAt: string
): Biology30SourceAndRightsRegister {
  const lessonIdsByUnit = Object.fromEntries(
    UNIT_CODES.map((unitCode) => [unitCode, BIOLOGY30_REMAINING_LESSONS[unitCode].map((lesson) => lesson.id)])
  ) as Record<Biology30ProductionUnitCode, string[]>;
  const allLessonIds = UNIT_CODES.flatMap((unitCode) => lessonIdsByUnit[unitCode]);
  const sources: Biology30SourceAndRightsRegister["sources"] = [
    ...resources.map((resource) => ({
      id: resource.id,
      label: resource.label,
      kind: resource.kind,
      role: resource.role,
      path: resource.path,
      sha256: resource.sha256,
      originalName: resource.originalName,
      rightsStatus: "authorized-local-course-source",
      allowedUse: "Local course development and Brightspace delivery; secure assessments and teacher-only material remain excluded."
    })),
    ...noteSources.map((source) => ({
      id: source.sourceId,
      label: source.archivePath.replace(/\.pdf$/i, ""),
      kind: "source-pdf",
      role: "primary",
      path: source.archiveLocator,
      sha256: source.sha256,
      originalName: source.archivePath,
      rightsStatus: "authorized-local-course-source",
      allowedUse: "Rewrite and redraw as local web instruction; source pages are authoring references and are not learner delivery."
    })),
    {
      id: "alberta-program-of-studies",
      label: "Alberta Biology 20–30 Program of Studies",
      kind: "official-curriculum",
      role: "authority",
      url: BIOLOGY30_PROGRAM_OF_STUDIES_URL,
      sha256: BIOLOGY30_PROGRAM_OF_STUDIES_SHA256,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-curriculum",
      allowedUse: "Outcome authority, exact outcome wording, curriculum mapping, and citation."
    },
    {
      id: "alberta-performance-standards",
      label: "Biology 30 Student Performance Standards",
      kind: "official-curriculum",
      role: "authority",
      url: AUTHORITY_URLS.performanceStandards,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-performance-guidance",
      allowedUse: "Performance evidence, cognitive demand, investigation, and data-interpretation guidance."
    },
    {
      id: "alberta-biology-bulletin-2025-26",
      label: "Biology 30 Information Bulletin 2025–2026",
      kind: "official-curriculum",
      role: "authority",
      url: AUTHORITY_URLS.biologyBulletin,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-assessment-guidance",
      allowedUse: "Diploma blueprint and cognitive-level guidance; recheck for a newer subject bulletin before release."
    },
    {
      id: "alberta-diploma-general-2026-27",
      label: "Diploma Examination General Information Bulletin 2026–2027",
      kind: "official-curriculum",
      role: "authority",
      url: AUTHORITY_URLS.diplomaGeneral,
      retrievedAt: generatedAt,
      rightsStatus: "official-public-assessment-guidance",
      allowedUse: "Current diploma-examination process and secure-assessment boundary."
    },
    {
      id: "openstax-anatomy-physiology-2e",
      label: "OpenStax Anatomy and Physiology 2e",
      kind: "authoritative-supplement",
      role: "cross-check",
      url: SUPPLEMENT_URLS.openStaxAnatomyPhysiology,
      retrievedAt: generatedAt,
      rightsStatus: "CC-BY-NC-SA-4.0",
      allowedUse: "Bibliographic factual cross-check and original paraphrase only; no OpenStax text, figures, or assessment items are reproduced."
    },
    {
      id: "openstax-biology-2e",
      label: "OpenStax Biology 2e",
      kind: "authoritative-supplement",
      role: "cross-check",
      url: SUPPLEMENT_URLS.openStaxBiology,
      retrievedAt: generatedAt,
      rightsStatus: "CC-BY-NC-SA-4.0",
      allowedUse: "Bibliographic factual cross-check and original paraphrase only; no OpenStax text, figures, or assessment items are reproduced."
    },
    {
      id: "canada-sexual-and-reproductive-health",
      label: "Government of Canada: Sexual and reproductive health",
      kind: "official-health-guidance",
      role: "cross-check",
      url: SUPPLEMENT_URLS.canadaSexualHealth,
      retrievedAt: generatedAt,
      rightsStatus: "official-government-source-citation-and-paraphrase",
      allowedUse: "Current terminology and public-health framing through citation and original paraphrase; no diagnosis or copied media."
    },
    {
      id: "canada-sti-guidance",
      label: "Government of Canada: Sexual health and preventing sexually transmitted infections",
      kind: "official-health-guidance",
      role: "cross-check",
      url: SUPPLEMENT_URLS.canadaStiGuidance,
      retrievedAt: generatedAt,
      rightsStatus: "official-government-source-citation-and-paraphrase",
      allowedUse: "Current prevention and testing framing through citation and original paraphrase; no individual diagnosis."
    },
    {
      id: "canada-assisted-human-reproduction",
      label: "Health Canada: Assisted human reproduction",
      kind: "official-health-guidance",
      role: "cross-check",
      url: SUPPLEMENT_URLS.canadaAssistedReproduction,
      retrievedAt: generatedAt,
      rightsStatus: "official-government-source-citation-and-paraphrase",
      allowedUse: "Current Canadian policy, safety, consent, and technology context through citation and original paraphrase."
    }
  ];
  const uses: Biology30SourceAndRightsRegister["uses"] = [
    { id: "program-all-lessons", sourceId: "alberta-program-of-studies", lessonIds: allLessonIds, role: "authority", usage: "outcome-mapping" },
    { id: "performance-all-lessons", sourceId: "alberta-performance-standards", lessonIds: allLessonIds, role: "authority", usage: "outcome-mapping" },
    { id: "class-all-lessons", sourceId: "class-2026-27", lessonIds: allLessonIds, role: "core", usage: "paraphrase" },
    { id: "system-all-lessons", sourceId: "system-2020", lessonIds: allLessonIds, role: "reference", usage: "paraphrase" },
    ...noteSources.map((source) => ({
      id: `${source.sourceId}-lesson-use`,
      sourceId: source.sourceId,
      lessonIds: source.selectedLessonIds,
      role: "core" as const,
      usage: "adaptation" as const
    })),
    { id: "openstax-a-and-p-unit-b", sourceId: "openstax-anatomy-physiology-2e", lessonIds: lessonIdsByUnit.B, role: "cross-check", usage: "paraphrase" },
    { id: "openstax-biology-units-c-d", sourceId: "openstax-biology-2e", lessonIds: [...lessonIdsByUnit.C, ...lessonIdsByUnit.D], role: "cross-check", usage: "paraphrase" },
    { id: "canada-sexual-health-b7", sourceId: "canada-sexual-and-reproductive-health", lessonIds: ["b-lesson-07"], role: "cross-check", usage: "paraphrase" },
    { id: "canada-sti-b7", sourceId: "canada-sti-guidance", lessonIds: ["b-lesson-07"], role: "cross-check", usage: "paraphrase" },
    { id: "canada-assisted-reproduction-b13", sourceId: "canada-assisted-human-reproduction", lessonIds: ["b-lesson-13"], role: "cross-check", usage: "paraphrase" },
    { id: "biology-bulletin-assessment", sourceId: "alberta-biology-bulletin-2025-26", projectScopes: ["practice cognitive balance", "diploma blueprint"], role: "authority", usage: "assessment-guidance" },
    { id: "diploma-general-assessment", sourceId: "alberta-diploma-general-2026-27", projectScopes: ["secure summative boundary", "release recheck"], role: "authority", usage: "assessment-guidance" }
  ];
  return {
    schemaVersion: 1,
    family: BIOLOGY30_PRODUCTION_FAMILY,
    generatedAt,
    rule: "Every source has resolved rights/use status and an exact lesson or project-scope locator. Required learner instruction remains local; external links are optional citations only.",
    requiredLearningLocal: true,
    sources,
    uses
  };
}

export function validateBiology30SourceAndRightsRegister(
  register: Biology30SourceAndRightsRegister,
  contracts: RemainingUnitContract[]
) {
  if (register.schemaVersion !== 1 || register.family !== BIOLOGY30_PRODUCTION_FAMILY || register.requiredLearningLocal !== true) {
    throw new Error("Biology 30 source-and-rights register identity or local-first policy is invalid.");
  }
  const sourceIds = new Set<string>();
  for (const source of register.sources) {
    if (!source.id.trim() || sourceIds.has(source.id)) throw new Error(`Duplicate or empty Biology 30 rights source ID: ${source.id}.`);
    sourceIds.add(source.id);
    if ((!source.path && !source.url) || !source.rightsStatus.trim() || !source.allowedUse.trim() || /(?:unknown|unresolved|pending)/i.test(source.rightsStatus)) {
      throw new Error(`Biology 30 rights source ${source.id} has an unresolved locator or use status.`);
    }
  }
  const lessonIds = new Set(contracts.flatMap((contract) => contract.lessons.map((lesson) => lesson.id)));
  const useIds = new Set<string>();
  for (const use of register.uses) {
    if (!use.id.trim() || useIds.has(use.id) || !sourceIds.has(use.sourceId)) throw new Error(`Invalid Biology 30 rights use ${use.id}.`);
    useIds.add(use.id);
    if (!(use.lessonIds?.length || use.projectScopes?.length)) throw new Error(`Biology 30 rights use ${use.id} has no exact locator.`);
    if (use.lessonIds?.some((lessonId) => !lessonIds.has(lessonId))) throw new Error(`Biology 30 rights use ${use.id} names an unknown lesson.`);
  }
  const sourceUsedForLesson = (sourceId: string, lessonId: string) => register.uses.some((use) => use.sourceId === sourceId && use.lessonIds?.includes(lessonId));
  for (const contract of contracts) {
    for (const lesson of contract.lessons) {
      const required = [
        "alberta-program-of-studies",
        "alberta-performance-standards",
        "class-2026-27",
        "system-2020",
        contract.unitCode === "B" ? "openstax-anatomy-physiology-2e" : "openstax-biology-2e"
      ];
      if (required.some((sourceId) => !sourceUsedForLesson(sourceId, lesson.id))) throw new Error(`Biology 30 lesson ${lesson.id} lacks a required authority, local source, or scientific cross-check.`);
      const noteSourceIds = contract.sourceRefs.filter((ref) => ref.id.startsWith(`${lesson.id}:notes:`)).map((ref) => ref.sourceId);
      if (!noteSourceIds.length || noteSourceIds.some((sourceId) => !sourceUsedForLesson(sourceId, lesson.id))) throw new Error(`Biology 30 lesson ${lesson.id} lacks an exact notes-use record.`);
    }
  }
  if (!sourceUsedForLesson("canada-sexual-and-reproductive-health", "b-lesson-07")
    || !sourceUsedForLesson("canada-sti-guidance", "b-lesson-07")
    || !sourceUsedForLesson("canada-assisted-human-reproduction", "b-lesson-13")) {
    throw new Error("Unit B current health and reproductive-technology guidance lacks exact lesson locators.");
  }
  for (const sourceId of sourceIds) {
    if (!register.uses.some((use) => use.sourceId === sourceId)) throw new Error(`Biology 30 rights source ${sourceId} has no declared use.`);
  }
}

export function validateBiology30RemainingUnitContract(contract: RemainingUnitContract, catalog: RemainingSourceCatalog) {
  const curriculum = BIOLOGY30_UNIT_CURRICULA[contract.unitCode];
  if (contract.quality.minimumHumanScore !== 95 || contract.reviewRubric.minimumPassingTotal !== 95) {
    throw new Error(`Unit ${contract.unitCode} does not enforce the requested 95/100 quality floor.`);
  }
  if (contract.delivery.requiredMinutes !== curriculum.requiredMinutes || contract.delivery.optionalMinutes !== curriculum.optionalMinutes) {
    throw new Error(`Unit ${contract.unitCode} time contract drifted.`);
  }
  if (contract.outcomes.length !== curriculum.outcomes.length || contract.lessons.length !== BIOLOGY30_REMAINING_LESSONS[contract.unitCode].length) {
    throw new Error(`Unit ${contract.unitCode} curriculum or lesson inventory drifted.`);
  }
  for (const outcome of contract.outcomes) {
    if (!outcome.teachRoutes.length || !outcome.practiceRoutes.length || !outcome.evidenceRoutes.length) {
      throw new Error(`Unit ${contract.unitCode} outcome ${outcome.id} lacks teach, practice, or evidence routes.`);
    }
  }
  const refIds = new Set<string>();
  for (const ref of contract.sourceRefs) {
    if (refIds.has(ref.id)) throw new Error(`Duplicate Unit ${contract.unitCode} source reference ${ref.id}.`);
    refIds.add(ref.id);
    if (!ref.rightsStatus.trim() || !ref.sourcePath.trim()) throw new Error(`Unit ${contract.unitCode} source reference ${ref.id} is incomplete.`);
    if (ref.itemId) sourceCatalogItem(catalog, contract.unitCode, ref.sourceId, ref.itemId);
    if (ref.pdfPages?.some((page) => !Number.isInteger(page) || page < 1)) throw new Error(`Invalid page in source reference ${ref.id}.`);
  }
  for (const lesson of contract.lessons) {
    if (!lesson.sourceRefIds.length || lesson.sourceRefIds.some((id) => !refIds.has(id))) {
      throw new Error(`Unit ${contract.unitCode} lesson ${lesson.id} has invalid explicit source references.`);
    }
  }
  const forbidden = contract.sourceRefs.filter((ref) => /(?:unit\s+[b-d]\s+(?:test|exam)|quiz.*(?:key|printable))/i.test(ref.sourcePath));
  if (forbidden.length) throw new Error(`Unit ${contract.unitCode} selects teacher-only assessment material.`);
}

function sourceCatalogMarkdown(catalog: RemainingSourceCatalog) {
  const rows = catalog.sources
    .map((source) => `| ${source.unitCode} | ${source.label} | ${source.itemCount} | ${source.visibleQuizCount} | ${source.visibleQuestionCount} | ${source.utf16HtmlCount} | ${source.rootTitle} (${source.rootId}) |`)
    .join("\n");
  return `# Biology 30 Units B-D source inventory\n\n| Unit | Source | Items | Visible quizzes | Questions | UTF-16 HTML | Root |\n| --- | --- | ---: | ---: | ---: | ---: | --- |\n${rows}\n\nAll archives remain checksum-preserved in the existing shared source library. Secure unit tests, quiz keys, printable quizzes, and hidden teacher material are excluded from lesson selections.\n`;
}

function curriculumMarkdown(contracts: RemainingUnitContract[]) {
  return `# Biology 30 remaining-units curriculum map\n\nQuality floor: **95/100** for each production unit. Promotion remains human-only.\n\n${contracts
    .map((contract) => {
      const rows = contract.lessons
        .map((lesson) => `| ${lesson.order} | ${lesson.id} | ${lesson.title} | ${lesson.requiredMinutes} | ${lesson.optionalMinutes} | ${lesson.outcomeIds.join(", ")} |`)
        .join("\n");
      return `## Unit ${contract.unitCode}\n\n- Project: ${contract.project.slug}\n- Required: ${contract.delivery.requiredMinutes} minutes\n- Optional: ${contract.delivery.optionalMinutes} minutes\n- Outcomes: ${contract.outcomes.length}\n- Source-visible questions available for review: ${contract.assessment.sourceVisibleQuestionInventory}\n\n| # | Lesson | Title | Required | Optional | Outcomes |\n| ---: | --- | --- | ---: | ---: | --- |\n${rows}`;
    })
    .join("\n\n")}\n`;
}

function buildProjectManifest(contract: RemainingUnitContract, generatedAt: string, resources: NamedBrightspaceResource[]): ProjectManifest {
  const slug = contract.project.slug;
  const unitFolder = `unit-${UNIT_CODE_LOWER[contract.unitCode]}`;
  const canonicalRoot = `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/units/${unitFolder}`;
  return {
    id: slug,
    slug,
    title: contract.project.title,
    sourcePath: SOURCE_MANIFEST_PATH,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: `projects/${slug}/workspace/index.html`,
    rawEntrypoint: `projects/${slug}/raw/intake.json`,
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: generatedAt,
    createdAt: generatedAt,
    updatedAt: generatedAt,
    migrationState: "migrated",
    projectType: "hybrid",
    preferredWorkflows: ["conversion", "generated-course"],
    canonicalEntry: `${canonicalRoot}/production-contract.json`,
    canonicalSources: [
      `${canonicalRoot}/production-contract.json`,
      `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/family-contract.json`,
      `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/curriculum-baseline.json`,
      `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/source-catalog.json`,
      `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/notes-page-disposition.json`,
      `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/factual-correction-ledger.json`,
      BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH
    ],
    generatedOutputs: [],
    authoring: {
      driverId: "proposal-only-v1",
      familyId: BIOLOGY30_PRODUCTION_FAMILY,
      sourceResourceIds: resources.map((resource) => resource.id),
      qualityProfile: BIOLOGY30_PRODUCTION_PROFILE,
      studioEditing: { enabled: false }
    },
    authoringStatus: "blocked",
    exportTargets: [
      { target: "html", enabled: false, notes: "Blocked Gate 0 curriculum-review preview only." },
      { target: "scorm", enabled: false, notes: "SCORM 2004 export requires a 95+/100 accepted production build and promotion." }
    ],
    referenceOnly: [SOURCE_MANIFEST_PATH, ...resources.map((resource) => resource.path), `projects/${slug}/raw/intake.json`],
    sourceOfTruthNotes: "The Biology 30 production family contract and explicit per-unit source map govern this blocked proposal. The workspace is generated review output, Studio editing is disabled, and no export or publication is authorized."
  };
}

function renderProjectPreview(contract: RemainingUnitContract) {
  const lessonRows = contract.lessons
    .map((lesson) => `<li><span><strong>${lesson.order}. ${lesson.title}</strong><small>${lesson.inquiry}</small></span><span>${lesson.requiredMinutes} min</span></li>`)
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${contract.project.title} — curriculum review</title>
  <style>
    :root { color-scheme: light; --ink: #171b1b; --muted: #5b635d; --green: #154212; --teal: #146c60; --paper: #f7f8f5; --surface: #fff; --border: #d9ded8; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--paper); color: var(--ink); font: 17px/1.65 "Work Sans", system-ui, sans-serif; }
    header { border-bottom: 1px solid var(--border); background: var(--surface); }
    .bar, main { width: min(960px, calc(100% - 40px)); margin: 0 auto; }
    .bar { min-height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
    .brand { color: var(--green); font-weight: 760; }
    main { padding: 52px 0 80px; }
    h1 { max-width: 22ch; margin: 0 0 14px; font-size: clamp(2rem, 4.5vw, 2.625rem); line-height: 1.08; letter-spacing: -.035em; }
    .lede { max-width: 68ch; color: var(--muted); font-size: 1.05rem; }
    .notice { margin: 30px 0; padding: 18px 20px; border-left: 4px solid var(--teal); background: var(--surface); }
    dl { display: grid; grid-template-columns: repeat(3, 1fr); margin: 32px 0 44px; border: 1px solid var(--border); background: var(--surface); }
    dl div { padding: 18px 20px; border-right: 1px solid var(--border); }
    dl div:last-child { border-right: 0; }
    dt { color: var(--muted); font-size: .86rem; }
    dd { margin: 4px 0 0; font-size: 1.4rem; font-weight: 720; }
    h2 { margin: 0 0 12px; font-size: 1.35rem; }
    ul { margin: 0; padding: 0; border-top: 1px solid var(--border); list-style: none; }
    li { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 24px; padding: 14px 2px; border-bottom: 1px solid var(--border); }
    li small { display: block; max-width: 70ch; margin-top: 2px; color: var(--muted); font-size: .9rem; }
    @media (max-width: 680px) { main { padding-top: 36px; } dl { grid-template-columns: 1fr; } dl div { border-right: 0; border-bottom: 1px solid var(--border); } dl div:last-child { border-bottom: 0; } li { grid-template-columns: 1fr; gap: 4px; } }
  </style>
</head>
<body>
  <header><div class="bar"><span class="brand">Next Step</span><span>BIO 30</span></div></header>
  <main>
    <h1>${contract.project.title}</h1>
    <p class="lede">The exact curriculum, source, lesson, practice, and evidence architecture is ready. Full learner lessons are now the next production stage.</p>
    <div class="notice"><strong>Production proposal — blocked.</strong> The release target is at least 95/100 with no academic, accessibility, rights, persistence, or assessment-security blocker.</div>
    <dl>
      <div><dt>Required learning</dt><dd>${(contract.delivery.requiredMinutes / 60).toFixed(1)} hours</dd></div>
      <div><dt>Official outcomes</dt><dd>${contract.outcomes.length}</dd></div>
      <div><dt>Planned lessons</dt><dd>${contract.lessons.length}</dd></div>
    </dl>
    <h2>Production sequence</h2>
    <ul>${lessonRows}</ul>
  </main>
</body>
</html>`;
}

function validateFamilyContract(
  familyContract: any,
  contracts: RemainingUnitContract[],
  catalog: RemainingSourceCatalog,
  noteSources: NoteSourceRecord[],
  rightsRegister: Biology30SourceAndRightsRegister
) {
  if (familyContract.quality.minimumScore !== 95 || familyContract.units.length !== 3) {
    throw new Error("Biology 30 family contract does not enforce three units at the 95/100 quality floor.");
  }
  if (catalog.sources.reduce((total, source) => total + source.itemCount, 0) !== 423) {
    throw new Error("Biology 30 B-D source item inventory drifted from 423 items.");
  }
  if (catalog.sources.reduce((total, source) => total + source.utf16HtmlCount, 0) !== 237) {
    throw new Error("Biology 30 B-D UTF-16 inventory drifted from 237 pages.");
  }
  if (catalog.visibleQuizzes.reduce((total, quiz) => total + quiz.questionCount, 0) !== 202) {
    throw new Error("Biology 30 B-D visible source-question inventory drifted from 202.");
  }
  if (noteSources.reduce((total, source) => total + source.pageCount, 0) !== 395) {
    throw new Error("Biology 30 B-D notes inventory drifted from 395 pages.");
  }
  if (familyContract.sourceAndRightsRegisterPath !== BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH) {
    throw new Error("Biology 30 family contract does not name the canonical source-and-rights register.");
  }
  validateBiology30SourceAndRightsRegister(rightsRegister, contracts);
  for (const contract of contracts) validateBiology30RemainingUnitContract(contract, catalog);
}

async function promoteStagedTargets(input: {
  stageResourceDir: string;
  targetResourceDir: string;
  stageProjects: Array<{ stage: string; target: string }>;
  beforePromote?: (targetPath: string, index: number) => void | Promise<void>;
}) {
  const targets = [{ stage: input.stageResourceDir, target: input.targetResourceDir }, ...input.stageProjects];
  const promoted: string[] = [];
  try {
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      await input.beforePromote?.(target.target, index);
      await mkdir(path.dirname(target.target), { recursive: true });
      await rename(target.stage, target.target);
      promoted.push(target.target);
    }
  } catch (error) {
    for (const target of promoted.reverse()) await rm(target, { recursive: true, force: true });
    throw error;
  }
}

export async function intakeBiology30RemainingUnits(input: Biology30CourseIntakeRequest): Promise<Biology30CourseIntakeResult> {
  const repoRoot = path.resolve(input.repoRoot);
  if (input.family && input.family !== BIOLOGY30_PRODUCTION_FAMILY) {
    throw new Error(`Expected --family ${BIOLOGY30_PRODUCTION_FAMILY}; received ${input.family}.`);
  }
  validateBiology30RemainingCurriculum();
  validateBiology30RemainingBlueprint();

  const targetResourceDir = path.join(repoRoot, BIOLOGY30_PRODUCTION_RESOURCE_ROOT);
  const projectTargets = UNIT_CODES.map((unitCode) => path.join(repoRoot, "projects", BIOLOGY30_UNIT_CURRICULA[unitCode].slug));
  const existingTargets = (await Promise.all([targetResourceDir, ...projectTargets].map(async (target) => ((await pathExists(target)) ? target : null)))).filter(Boolean);
  if (existingTargets.length) throw new Error(`Biology 30 remaining-unit intake refuses existing targets: ${existingTargets.join(", ")}.`);

  const generatedAt = new Date().toISOString();
  const resources = await loadResources(repoRoot);
  const models = await loadModels(repoRoot, resources);
  const sourceCatalog = buildSourceCatalog(models, generatedAt);
  const noteSources = await verifyNoteSources(models);
  const contracts = UNIT_CODES.map((unitCode) => buildUnitContract(unitCode, sourceCatalog, generatedAt));
  const corrections = factualCorrectionLedger();
  const dispositions = pageDispositions(noteSources);
  const sourceAndRightsRegister = buildSourceAndRightsRegister(resources, noteSources, generatedAt);
  const familyContract = {
    schemaVersion: 1,
    profileId: BIOLOGY30_PRODUCTION_PROFILE,
    family: BIOLOGY30_PRODUCTION_FAMILY,
    generatedAt,
    status: { authoringStatus: "blocked", driverId: "proposal-only-v1", studioEditingEnabled: false, exportEnabled: false },
    quality: { minimumScore: 95, automaticPromotion: false, noBinaryBlockers: true },
    authorities: {
      programOfStudies: { url: BIOLOGY30_PROGRAM_OF_STUDIES_URL, sha256: BIOLOGY30_PROGRAM_OF_STUDIES_SHA256, retrievedAt: generatedAt },
      performanceStandards: { url: AUTHORITY_URLS.performanceStandards, retrievedAt: generatedAt },
      biologyBulletin: { url: AUTHORITY_URLS.biologyBulletin, schoolYear: "2025-26", retrievedAt: generatedAt },
      diplomaGeneral: { url: AUTHORITY_URLS.diplomaGeneral, schoolYear: "2026-27", retrievedAt: generatedAt },
      biologyBulletin2026_27Found: false,
      currentAuthorityFinding: "As of intake, Alberta's official Biology 30 link still resolves to the 2025-26 subject bulletin; the 2026-27 general diploma bulletin is current. Recheck before each production build."
    },
    sourceAndRightsRegisterPath: BIOLOGY30_SOURCE_RIGHTS_REGISTER_PATH,
    sharedSourceLibrary: {
      manifestPath: SOURCE_MANIFEST_PATH,
      resources: resources.map((resource) => ({ id: resource.id, label: resource.label, role: resource.role, path: resource.path, sha256: resource.sha256, originalName: resource.originalName })),
      archivesCopied: false,
      noteSources
    },
    units: contracts.map((contract) => ({
      code: contract.unitCode,
      project: contract.project,
      contractPath: `${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/units/unit-${UNIT_CODE_LOWER[contract.unitCode]}/production-contract.json`,
      outcomes: contract.outcomes.length,
      lessons: contract.lessons.length,
      requiredMinutes: contract.delivery.requiredMinutes,
      optionalMinutes: contract.delivery.optionalMinutes,
      practiceItems: contract.assessment.practiceBlueprint.total,
      artifacts: contract.artifacts.length
    })),
    aggregate: {
      outcomes: contracts.reduce((total, contract) => total + contract.outcomes.length, 0),
      lessons: contracts.reduce((total, contract) => total + contract.lessons.length, 0),
      requiredMinutes: contracts.reduce((total, contract) => total + contract.delivery.requiredMinutes, 0),
      optionalMinutes: contracts.reduce((total, contract) => total + contract.delivery.optionalMinutes, 0),
      practiceItems: contracts.reduce((total, contract) => total + contract.assessment.practiceBlueprint.total, 0),
      sourceVisibleQuestions: 202,
      notesPages: 395
    }
  };
  validateFamilyContract(familyContract, contracts, sourceCatalog, noteSources, sourceAndRightsRegister);
  const familyContractJson = `${JSON.stringify(familyContract, null, 2)}\n`;
  const familyContractSha256 = sha256(familyContractJson);

  const stagingParent = path.join(repoRoot, "projects", "resources");
  await mkdir(stagingParent, { recursive: true });
  const stageRoot = await mkdtemp(path.join(stagingParent, ".biology30-production-intake-"));
  const stageResourceDir = path.join(stageRoot, "resource");
  const stageProjectsRoot = path.join(stageRoot, "projects");
  try {
    await mkdir(stageResourceDir, { recursive: true });
    await writeFile(path.join(stageResourceDir, "family-contract.json"), familyContractJson, "utf8");
    await writeJson(path.join(stageResourceDir, "curriculum-baseline.json"), {
      schemaVersion: 1,
      generatedAt,
      programOfStudies: { url: BIOLOGY30_PROGRAM_OF_STUDIES_URL, sha256: BIOLOGY30_PROGRAM_OF_STUDIES_SHA256 },
      units: UNIT_CODES.map((unitCode) => BIOLOGY30_UNIT_CURRICULA[unitCode])
    });
    await writeJson(path.join(stageResourceDir, "source-catalog.json"), sourceCatalog);
    await writeFile(path.join(stageResourceDir, "source-catalog.md"), sourceCatalogMarkdown(sourceCatalog), "utf8");
    await writeJson(path.join(stageResourceDir, "source-and-rights-register.json"), sourceAndRightsRegister);
    await writeJson(path.join(stageResourceDir, "source-pdf-manifest.json"), {
      schemaVersion: 1,
      generatedAt,
      canonicalArchiveId: "class-2026-27",
      noteSources,
      supersededOrReferenceOnly: [
        {
          archivePath: "Unit C Part B Mendelian Genetics  Student Copy (1).pdf",
          sha256: "9a3585da91dca31255325940ebba1cc1b407820e12b858088d01e9ccfcf8aeee",
          disposition: "reference-only-superseded",
          reason: "The selected non-suffixed copy corrects the pedigree prompt from individual 3 to individual 4 on page 80."
        }
      ]
    });
    await writeJson(path.join(stageResourceDir, "notes-page-disposition.json"), { schemaVersion: 1, generatedAt, entries: dispositions });
    await writeJson(path.join(stageResourceDir, "factual-correction-ledger.json"), { schemaVersion: 1, generatedAt, entries: corrections });
    await writeFile(path.join(stageResourceDir, "curriculum-map.md"), curriculumMarkdown(contracts), "utf8");
    await writeJson(path.join(stageResourceDir, "gate-0-review.json"), {
      schemaVersion: 1,
      gateId: "gate-0",
      family: BIOLOGY30_PRODUCTION_FAMILY,
      familyContractSha256,
      status: "implemented-under-user-goal-awaiting-production-review",
      generatedAt,
      qualityFloor: 95,
      scope: "Units B-D curriculum, source, correction, lesson, practice, interaction, and evidence architecture."
    });

    for (const contract of contracts) {
      const unitFolder = `unit-${UNIT_CODE_LOWER[contract.unitCode]}`;
      await writeJson(path.join(stageResourceDir, "units", unitFolder, "production-contract.json"), contract);
      const stageProjectDir = path.join(stageProjectsRoot, contract.project.slug);
      const manifest = buildProjectManifest(contract, generatedAt, resources);
      const manifestValidation = validateProjectManifestPolicy(manifest);
      if (manifestValidation.status !== "valid") {
        throw new Error(`Unit ${contract.unitCode} project manifest is invalid: ${manifestValidation.errors.join(" ")}`);
      }
      await writeJson(path.join(stageProjectDir, "meta", "project.json"), manifest);
      await writeJson(path.join(stageProjectDir, "meta", "gate-0-review.json"), {
        schemaVersion: 1,
        gateId: "gate-0",
        projectSlug: contract.project.slug,
        familyContractSha256,
        status: "curriculum-and-source-contract-complete",
        qualityFloor: 95,
        generatedAt
      });
      await writeFile(
        path.join(stageProjectDir, "meta", "prompt-pack.md"),
        `# ${contract.project.title}\n\n- Status: blocked\n- Driver: proposal-only-v1\n- Quality floor: 95/100\n- Canonical contract: ${BIOLOGY30_PRODUCTION_RESOURCE_ROOT}/units/${unitFolder}/production-contract.json\n- Full learner production must remain local-first, independently teachable, source-explicit, and free of secure tests or keys.\n`,
        "utf8"
      );
      await writeJson(path.join(stageProjectDir, "raw", "intake.json"), {
        schemaVersion: 1,
        family: BIOLOGY30_PRODUCTION_FAMILY,
        projectSlug: contract.project.slug,
        sourceResourceIds: resources.map((resource) => resource.id),
        sourceArchivesCopied: false,
        familyContractSha256,
        generatedAt
      });
      await mkdir(path.join(stageProjectDir, "workspace"), { recursive: true });
      await writeFile(path.join(stageProjectDir, "workspace", "index.html"), renderProjectPreview(contract), "utf8");
    }

    await input.testHooks?.afterStageWrite?.(stageRoot);
    const stagedFamily = JSON.parse(await readFile(path.join(stageResourceDir, "family-contract.json"), "utf8"));
    const stagedContracts = await Promise.all(
      UNIT_CODES.map(async (unitCode) => JSON.parse(await readFile(path.join(stageResourceDir, "units", `unit-${UNIT_CODE_LOWER[unitCode]}`, "production-contract.json"), "utf8")) as RemainingUnitContract)
    );
    const stagedRightsRegister = JSON.parse(await readFile(path.join(stageResourceDir, "source-and-rights-register.json"), "utf8")) as Biology30SourceAndRightsRegister;
    validateFamilyContract(stagedFamily, stagedContracts, sourceCatalog, noteSources, stagedRightsRegister);

    await promoteStagedTargets({
      stageResourceDir,
      targetResourceDir,
      stageProjects: UNIT_CODES.map((unitCode) => ({
        stage: path.join(stageProjectsRoot, BIOLOGY30_UNIT_CURRICULA[unitCode].slug),
        target: path.join(repoRoot, "projects", BIOLOGY30_UNIT_CURRICULA[unitCode].slug)
      })),
      beforePromote: input.testHooks?.beforePromote
    });
  } finally {
    await rm(stageRoot, { recursive: true, force: true });
  }

  return {
    resourceDir: targetResourceDir,
    projectDirs: projectTargets,
    familyContractSha256,
    sourceCatalog,
    noteSources
  };
}
