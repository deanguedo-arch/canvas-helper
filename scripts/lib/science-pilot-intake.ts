import { createHash } from "node:crypto";
import { copyFile, lstat, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { validateProjectManifestPolicy } from "./project-manifest-policy.js";
import type { ProjectManifest } from "./types.js";

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;

export type SciencePilotMode = "conversion" | "generated-course";

export type SciencePilotIntakeRequest = {
  repoRoot: string;
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  mode: SciencePilotMode;
  brightspaceZip?: string;
  teacherResourcesZip?: string;
};

export type SciencePilotResource = {
  id: "brightspace-export" | "teacher-resources";
  role: "brightspace-export" | "teacher-resource";
  path: string;
  sha256: string;
  originalName: string;
};

export type SciencePilotIntakeResult = {
  projectSlug: string;
  projectDir: string;
  resourceDir: string;
  resources: SciencePilotResource[];
};

function assertProjectSlug(value: string) {
  if (!PROJECT_SLUG_PATTERN.test(value)) {
    throw new Error(`Science pilot project slug must be lowercase and exact: ${JSON.stringify(value)}`);
  }
}

function assertNonEmpty(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required.`);
  return value.trim();
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

async function sha256File(filePath: string) {
  return createHash("sha256").update(await readFile(filePath)).digest("hex");
}

async function copyScienceSource(input: {
  sourcePath: string;
  stageResourceDir: string;
  projectSlug: string;
  id: SciencePilotResource["id"];
  role: SciencePilotResource["role"];
}): Promise<SciencePilotResource> {
  const absoluteSourcePath = path.resolve(input.sourcePath);
  const stats = await lstat(absoluteSourcePath);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new Error(`Science pilot source must be a real file: ${input.sourcePath}`);
  }
  if (path.extname(absoluteSourcePath).toLowerCase() !== ".zip") {
    throw new Error(`Science pilot ${input.role} must be a .zip archive: ${input.sourcePath}`);
  }
  const sha256 = await sha256File(absoluteSourcePath);
  const destinationPath = path.join(input.stageResourceDir, "_sources", `${sha256}.zip`);
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(absoluteSourcePath, destinationPath);
  return {
    id: input.id,
    role: input.role,
    path: `projects/resources/${input.projectSlug}/_sources/${sha256}.zip`,
    sha256,
    originalName: path.basename(absoluteSourcePath)
  };
}

function renderPromptPack(input: {
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  mode: SciencePilotMode;
  resources: SciencePilotResource[];
}) {
  return `# ${input.courseCode} ${input.courseTitle} Science Pilot Prompt Pack

- Mode: DEFAULT planning only
- Workflow: ${input.mode}
- Project: ${input.projectSlug}
- Status: intake complete; no learner workspace has been generated
- Source resources: ${input.resources.map((resource) => `${resource.id} (${resource.sha256.slice(0, 12)})`).join(", ")}

## Fixed boundaries

- Preserve the named ZIP resources and their checksums.
- Use the shared Next Step shell only after a representative unit has an approved science-specific learning loop.
- Do not copy an English or Social activity layout wholesale. Reuse the stable navigation, accessibility, autosave, evidence, and export patterns; choose science activities from the unit's investigation needs.
- Do not generate a whole course, edit raw input, or create SCORM output at this planning stage.

## First pilot decision

Map one representative unit in meta/science-pilot.json, then record the red-team and green-team evidence in meta/decision-log.md. The next implementation must prove one complete learner loop before this course gains an active authoring driver.
`;
}

function renderDecisionLog(projectSlug: string) {
  return `# Science Pilot Decision Log

Use this file after both reviewers have read the same packet:

- meta/science-pilot.json
- meta/project.json
- meta/prompt-pack.md
- projects/resources/${projectSlug}/resource-manifest.json

## Decision 1: representative unit and learner loop

### Red team

- Evidence reviewed:
- Failure modes or missing source information:
- What would make this unsafe to build:

### Green team

- Evidence reviewed:
- Smallest viable learner loop:
- What can be reused from the shared shell:

### Joint decision

- Decision:
- Evidence that resolves disagreement:
- Exact pilot boundary:
- Required verification before expansion:
`;
}

function buildProjectManifest(input: {
  projectSlug: string;
  courseCode: string;
  courseTitle: string;
  mode: SciencePilotMode;
  resources: SciencePilotResource[];
  now: string;
}): ProjectManifest {
  const projectPath = `projects/${input.projectSlug}`;
  const resourcePath = `projects/resources/${input.projectSlug}`;
  const sciencePilotPath = `${projectPath}/meta/science-pilot.json`;
  const promptPackPath = `${projectPath}/meta/prompt-pack.md`;
  const resourceManifestPath = `${resourcePath}/resource-manifest.json`;
  return {
    id: input.projectSlug,
    slug: input.projectSlug,
    title: `${input.courseCode} ${input.courseTitle}`,
    sourcePath: resourceManifestPath,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: `${projectPath}/workspace/index.html`,
    rawEntrypoint: `${projectPath}/raw/intake.json`,
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: input.now,
    createdAt: input.now,
    updatedAt: input.now,
    migrationState: "migrated",
    projectType: input.mode === "conversion" ? "conversion" : "generated-course",
    preferredWorkflows: [input.mode],
    canonicalEntry: sciencePilotPath,
    canonicalSources: [sciencePilotPath, promptPackPath, `${projectPath}/meta/decision-log.md`],
    generatedOutputs: [],
    authoring: {
      driverId: "proposal-only-v1",
      familyId: "science-pilot-v1",
      sourceResourceIds: input.resources.map((resource) => resource.id),
      qualityProfile: "science-pilot"
    },
    authoringStatus: "blocked",
    exportTargets: [
      { target: "html", enabled: false, notes: "Enabled only after the representative science unit passes review." },
      { target: "scorm", enabled: false, notes: "Enabled only after the representative science unit and persistence checks pass." }
    ],
    referenceOnly: [
      resourceManifestPath,
      ...input.resources.map((resource) => resource.path),
      `${projectPath}/raw/intake.json`
    ],
    sourceOfTruthNotes:
      "This is a planning-only science pilot. Edit meta/science-pilot.json and meta/decision-log.md until the representative unit is approved. No learner workspace or generic science factory exists yet."
  };
}

export async function intakeSciencePilot(request: SciencePilotIntakeRequest): Promise<SciencePilotIntakeResult> {
  const repoRoot = path.resolve(request.repoRoot);
  const projectSlug = request.projectSlug.trim();
  const courseCode = assertNonEmpty(request.courseCode, "--course-code");
  const courseTitle = assertNonEmpty(request.courseTitle, "--title");
  assertProjectSlug(projectSlug);
  if (request.mode !== "conversion" && request.mode !== "generated-course") {
    throw new Error(`Science pilot mode must be conversion or generated-course: ${request.mode}`);
  }
  if (!request.brightspaceZip && !request.teacherResourcesZip) {
    throw new Error("Science pilot intake needs --brightspace-zip, --teacher-resources-zip, or both.");
  }

  const projectsRoot = path.join(repoRoot, "projects");
  const resourceRoot = path.join(projectsRoot, "resources");
  const projectDir = path.join(projectsRoot, projectSlug);
  const resourceDir = path.join(resourceRoot, projectSlug);
  if (await pathExists(projectDir)) throw new Error(`Science pilot project already exists: ${projectSlug}`);
  if (await pathExists(resourceDir)) throw new Error(`Science pilot resource library already exists: ${projectSlug}`);

  await Promise.all([mkdir(projectsRoot, { recursive: true }), mkdir(resourceRoot, { recursive: true })]);
  const transactionDir = await mkdtemp(path.join(projectsRoot, ".science-pilot-intake-"));
  const stageProjectDir = path.join(transactionDir, "project");
  const stageResourceDir = path.join(transactionDir, "resource");
  let resourcePromoted = false;

  try {
    await Promise.all([mkdir(path.join(stageProjectDir, "meta"), { recursive: true }), mkdir(path.join(stageProjectDir, "raw"), { recursive: true })]);
    const resources: SciencePilotResource[] = [];
    if (request.brightspaceZip) {
      resources.push(
        await copyScienceSource({
          sourcePath: request.brightspaceZip,
          stageResourceDir,
          projectSlug,
          id: "brightspace-export",
          role: "brightspace-export"
        })
      );
    }
    if (request.teacherResourcesZip) {
      resources.push(
        await copyScienceSource({
          sourcePath: request.teacherResourcesZip,
          stageResourceDir,
          projectSlug,
          id: "teacher-resources",
          role: "teacher-resource"
        })
      );
    }
    const now = new Date().toISOString();
    const finalResources = resources;
    const sciencePilot = {
      schemaVersion: 1,
      projectSlug,
      course: { code: courseCode, title: courseTitle },
      mode: request.mode,
      status: "intake-complete",
      sourceResources: finalResources,
      instructionalPattern: {
        sharedShell: "next-step-course-shell",
        learnerLoop: ["question", "investigate", "explain", "apply", "reflect"],
        pilotBoundary: "one representative science unit only"
      },
      requiredDecisions: [
        "Choose the representative unit and name its curriculum outcomes.",
        "Map each activity to an investigation, model, data interpretation, or explanation need.",
        "Define what learner evidence must persist before a SCORM export is allowed.",
        "Record red-team and green-team evidence before building a learner workspace."
      ]
    };
    const finalProjectManifest = buildProjectManifest({
      projectSlug,
      courseCode,
      courseTitle,
      mode: request.mode,
      resources: finalResources,
      now
    });
    const validation = validateProjectManifestPolicy(finalProjectManifest);
    if (validation.status !== "valid") {
      throw new Error(`Science pilot manifest is invalid: ${validation.errors.join(" ")}`);
    }
    await Promise.all([
      writeFile(
        path.join(stageResourceDir, "resource-manifest.json"),
        `${JSON.stringify({ schemaVersion: 1, projectSlug, resources: finalResources }, null, 2)}\n`,
        "utf8"
      ),
      writeFile(path.join(stageProjectDir, "meta", "science-pilot.json"), `${JSON.stringify(sciencePilot, null, 2)}\n`, "utf8"),
      writeFile(
        path.join(stageProjectDir, "meta", "prompt-pack.md"),
        renderPromptPack({ projectSlug, courseCode, courseTitle, mode: request.mode, resources: finalResources }),
        "utf8"
      ),
      writeFile(path.join(stageProjectDir, "meta", "decision-log.md"), renderDecisionLog(projectSlug), "utf8"),
      writeFile(path.join(stageProjectDir, "meta", "project.json"), `${JSON.stringify(finalProjectManifest, null, 2)}\n`, "utf8"),
      writeFile(
        path.join(stageProjectDir, "raw", "intake.json"),
        `${JSON.stringify({ schemaVersion: 1, projectSlug, receivedAt: now, sourceResourceIds: finalResources.map((resource) => resource.id) }, null, 2)}\n`,
        "utf8"
      )
    ]);

    await rename(stageResourceDir, resourceDir);
    resourcePromoted = true;
    try {
      await rename(stageProjectDir, projectDir);
    } catch (error) {
      await rename(resourceDir, stageResourceDir);
      resourcePromoted = false;
      throw error;
    }

    return { projectSlug, projectDir, resourceDir, resources: finalResources };
  } finally {
    if (resourcePromoted && !(await pathExists(projectDir))) {
      await rm(resourceDir, { recursive: true, force: true });
    }
    await rm(transactionDir, { recursive: true, force: true });
  }
}
