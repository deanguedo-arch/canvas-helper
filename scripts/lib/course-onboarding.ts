import { randomUUID } from "node:crypto";
import { chmod, lstat, mkdir, readFile, readdir, rename, rm, rmdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { STUDIO_PROJECT_CHANGE_SIGNAL } from "../../app/shared/project-discovery.js";
import {
  STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
  STUDIO_ROUTINE_CONTENT_PROFILE_ID,
  type ProjectLearnerSurfacesV1
} from "../../app/shared/course-editability.js";
import { inspectCourseAuthoringProject } from "./course-authoring/context.js";
import {
  extractAdapterLearnerRouteIds,
  extractStructurallyDeclaredLearnerRouteIds,
  hasUnsupportedLearnerStateMechanisms,
  learnerRouteNeedsNativeDetailsState
} from "./course-editability/inventory.js";
import { validateProjectManifestPolicy } from "./project-manifest-policy.js";
import type { ProjectManifest } from "./types.js";

const PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:[._-][a-z0-9]+)*$/;
const RESERVED_PROJECTS = new Set(["assessments", "incoming", "processed", "resources"]);
const SOURCE_EXTENSIONS = new Set([".css", ".htm", ".html", ".js", ".jsx", ".json", ".mjs", ".ts", ".tsx"]);
const SOCIAL30_RESOURCE_ID = "social30-1-brightspace-winter-2020";
const SOCIAL30_RESOURCE_MANIFEST = "projects/resources/social30-1-related-issues/resource-manifest.json";
const AUTHORABLE_STATUSES = new Set(["active", "ready-for-export"]);

const SOCIAL30_OPTION_DETAILS = [
  {
    issue: 1,
    question: "To what extent should ideology be the foundation of identity?",
    units: ["U1", "U2"]
  },
  {
    issue: 2,
    question: "To what extent is resistance to liberalism justified?",
    units: ["U3", "U4"]
  },
  {
    issue: 3,
    question: "To what extent are the principles of liberalism viable?",
    units: ["U5", "U6"]
  },
  {
    issue: 4,
    question: "To what extent should my actions as a citizen be shaped by an ideology?",
    units: ["U7"]
  }
] as const;

export type CourseOnboardingClassification =
  | "direct"
  | "english-factory"
  | "social-factory"
  | "legacy-snapshot"
  | "blocked"
  | "reference-only"
  | "package-archive";

export type CourseOnboardingEntry = {
  slug: string;
  classification: CourseOnboardingClassification;
  studioEditing: "enabled" | "disabled" | "not-applicable";
  action: "create" | "migrate" | "onboard" | "retain" | "classify";
  reason: string;
};

export type CourseOnboardingReport = {
  schemaVersion: 1;
  generatedAt: string;
  applied: boolean;
  projectDirectoryCount: number;
  manifestCount: number;
  entries: CourseOnboardingEntry[];
  counts: Record<CourseOnboardingClassification, number>;
};

type ManifestCandidate = {
  slug: string;
  path: string;
  manifest: ProjectManifest;
  entry: CourseOnboardingEntry;
};

type OnboardingFileBackup = {
  target: string;
  content: Buffer | null;
  mode: number | null;
  createdParentDirectories: string[];
};

function slash(value: string) {
  return value.replaceAll("\\", "/");
}

async function exists(target: string) {
  try {
    await lstat(target);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

function contained(parent: string, candidate: string) {
  const relative = path.relative(parent, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
}

function anchoredRepoPath(value: string, slug: string, repoRoot: string) {
  const normalized = slash(value).replace(/^\.\//, "");
  if (!normalized) return value;
  const absoluteRepoRoot = slash(path.resolve(repoRoot));
  if (normalized === absoluteRepoRoot || normalized.startsWith(`${absoluteRepoRoot}/`)) {
    return normalized.slice(absoluteRepoRoot.length + 1);
  }
  for (const marker of [
    `projects/${slug}/`,
    "projects/resources/",
    "projects/processed/",
    "scripts/",
    "config/",
    "docs/"
  ]) {
    const index = normalized.toLowerCase().indexOf(marker.toLowerCase());
    if (index >= 0) return normalized.slice(index);
  }
  if (/^(?:projects|scripts|config|docs)\//.test(normalized)) return normalized;
  if (/^(?:workspace|raw|meta|exports)\//.test(normalized)) return `projects/${slug}/${normalized}`;
  return value;
}

async function normalizeCanonicalPath(value: string, slug: string, repoRoot: string) {
  const anchored = anchoredRepoPath(value, slug, repoRoot);
  if (anchored !== value) return slash(anchored);
  const normalized = slash(value);
  if (!normalized.includes("/")) {
    const workspaceCandidate = path.join(repoRoot, "projects", slug, "workspace", normalized);
    if (await exists(workspaceCandidate)) return `projects/${slug}/workspace/${normalized}`;
  }
  return normalized;
}

async function normalizeCanonicalList(values: readonly string[] | undefined, slug: string, repoRoot: string) {
  const normalized = await Promise.all((values ?? []).map((value) => normalizeCanonicalPath(value, slug, repoRoot)));
  return [...new Set(normalized.filter(Boolean))];
}

function projectLocalEntrypoint(value: string | undefined, slug: string, fallback: string) {
  if (!value) return fallback;
  const normalized = slash(value);
  const marker = `projects/${slug}/`;
  const index = normalized.toLowerCase().indexOf(marker.toLowerCase());
  if (index >= 0) return normalized.slice(index + marker.length);
  if (/^(?:workspace|raw)\//.test(normalized)) return normalized;
  return fallback;
}

async function collectLegacyWorkspaceSources(repoRoot: string, slug: string) {
  const workspace = path.join(repoRoot, "projects", slug, "workspace");
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      if (entry.name === ".DS_Store" || entry.name === "node_modules") continue;
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        files.push(`projects/${slug}/workspace/${slash(path.relative(workspace, absolute))}`);
      }
    }
  };
  if (await exists(workspace)) await visit(workspace);
  return files;
}

async function titleMarkerCount(repoRoot: string, slug: string) {
  try {
    const html = await readFile(path.join(repoRoot, "projects", slug, "workspace", "index.html"), "utf8");
    const unsafeOrVoid = new Set([
      "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr",
      "script", "style", "template", "iframe", "object", "svg", "math"
    ]);
    return [...html.matchAll(/<([a-z][a-z0-9-]*)\b[^>]*\bdata-canvas-helper-course-title\b[^>]*>/gi)]
      .filter((match) => !unsafeOrVoid.has(match[1]!.toLowerCase()))
      .length;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return 0;
    throw error;
  }
}

function workspaceHtmlPath(source: string, slug: string) {
  const prefix = `projects/${slug}/workspace/`;
  return source.startsWith(prefix) && /\.html?$/i.test(source) ? source.slice(prefix.length) : null;
}

function hasUninventoryableRuntimeSurface(html: string) {
  return (
    /\b(?:history\.(?:pushState|replaceState)|createBrowserRouter|createHashRouter|new\s+URLPattern)\b/.test(html) ||
    /\b(?:location\.hash|hashchange|data-page-target)\b/i.test(html) ||
    /\b(?:data-tab(?:-target)?|role=["']tab["']|aria-controls=["'][^"']+["'])/i.test(html) ||
    /\b(?:data-page|data-route|data-module|data-lesson)-(?:id|key|state)\b/i.test(html) ||
    /\b(?:pagination|carousel|slideshow)\b/i.test(html)
  );
}

async function inferLearnerSurfaceDeclaration(
  manifest: ProjectManifest,
  slug: string,
  repoRoot: string
): Promise<ProjectLearnerSurfacesV1 | undefined> {
  const htmlPaths = [...new Set((manifest.canonicalSources ?? [])
    .map((source) => workspaceHtmlPath(source, slug))
    .filter((value): value is string => Boolean(value)))]
    .sort((left, right) => left.localeCompare(right));
  if (!htmlPaths.length) return undefined;
  const currentDeclaration = manifest.authoring?.learnerSurfaces;
  if (currentDeclaration) {
    const currentSurfaces = currentDeclaration.mode === "static-pages-complete"
      ? currentDeclaration.pages.map((entry) => ({ ...entry, stateKey: null }))
      : currentDeclaration.surfaces;
    const upgraded: Array<{ htmlPath: string; route: string; stateKey: string | null }> = [];
    let changed = false;
    for (const entry of currentSurfaces) {
      if (entry.stateKey) {
        upgraded.push(entry);
        continue;
      }
      const html = await readFile(path.join(repoRoot, "projects", slug, "workspace", ...entry.htmlPath.split("/")), "utf8");
      const stateKey = learnerRouteNeedsNativeDetailsState(html, entry.route);
      changed ||= stateKey !== null;
      upgraded.push({ ...entry, stateKey });
    }
    return changed
      ? { schemaVersion: 1, mode: "declared-routes-and-states", surfaces: upgraded }
      : currentDeclaration;
  }
  const declared: Array<{ htmlPath: string; route: string; stateKey: string | null }> = [];
  let routed = false;
  for (const htmlPath of htmlPaths) {
    const html = await readFile(path.join(repoRoot, "projects", slug, "workspace", ...htmlPath.split("/")), "utf8");
    const routeIds = extractAdapterLearnerRouteIds(html) ?? extractStructurallyDeclaredLearnerRouteIds(html);
    if (routeIds) {
      if (hasUnsupportedLearnerStateMechanisms(html)) return undefined;
      routed = true;
      declared.push(...routeIds.map((route) => ({
        htmlPath,
        route: `#${route}`,
        stateKey: learnerRouteNeedsNativeDetailsState(html, `#${route}`)
      })));
      continue;
    }
    if (hasUninventoryableRuntimeSurface(html)) return undefined;
    declared.push({ htmlPath, route: "", stateKey: learnerRouteNeedsNativeDetailsState(html, "") });
  }
  return routed || declared.some((entry) => entry.stateKey !== null)
    ? { schemaVersion: 1, mode: "declared-routes-and-states", surfaces: declared }
    : { schemaVersion: 1, mode: "static-pages-complete", pages: declared.map(({ htmlPath, route }) => ({ htmlPath, route })) };
}

function isEnglishProject(manifest: ProjectManifest, slug: string) {
  return manifest.regenerateCommand === `npm run build:english-unit -- --project ${slug}` ||
    manifest.authoring?.driverId === "english-factory-v1" ||
    manifest.authoring?.familyId === "english-legacy-snapshot" ||
    (manifest.canonicalSources ?? []).some((source) => slash(source).endsWith(`/projects/${slug}/meta/english-unit.json`) || slash(source).endsWith(`projects/${slug}/meta/english-unit.json`));
}

function isSocialLegacyProject(slug: string) {
  return /^social(?:10|20|30)-1-related-issue-[1-4](?:-option-2)?$/.test(slug);
}

function hasWorkspaceReplacingLegacyBuilder(manifest: ProjectManifest) {
  const command = manifest.regenerateCommand ?? "";
  return (
    /build_(?:sports|forensics)_style_course\.py/i.test(command) ||
    /build-ela-(?:modern-drama|shakespeare-othello|short-stories)/i.test(command) ||
    /build:course-shell/i.test(command) ||
    /build-shell-from-manifest/i.test(command)
  );
}

function isSocial30FactorySlug(slug: string) {
  return /^social30-1-related-issue-[1-4]-option-2$/.test(slug);
}

async function packageArchiveReason(projectRoot: string) {
  const entries = await readdir(projectRoot, { withFileTypes: true });
  const hasWorkspaceOrMeta = entries.some((entry) => entry.name === "workspace" || entry.name === "meta" || entry.name === "raw");
  const hasPackage = entries.some((entry) => entry.name === "exports" || entry.name.toLowerCase().endsWith(".zip"));
  return !hasWorkspaceOrMeta && hasPackage
    ? "Package/export artifact retained without inventing an editable source."
    : null;
}

function createSocial30FactoryManifest(slug: string, now: string): ProjectManifest {
  const details = SOCIAL30_OPTION_DETAILS.find((entry) => slug === `social30-1-related-issue-${entry.issue}-option-2`);
  if (!details) throw new Error(`Unsupported Social 30 option project: ${slug}`);
  const projectRoot = `projects/${slug}`;
  return {
    id: randomUUID(),
    slug,
    title: `Social Studies 30-1: Related Issue ${details.issue} (Option Two)`,
    sourcePath: SOCIAL30_RESOURCE_MANIFEST,
    inputKind: "brightspace-zip",
    brightspaceTarget: "scorm",
    previewModes: ["workspace"],
    workspaceEntrypoint: "workspace/index.html",
    rawEntrypoint: "raw/README.md",
    learningSource: "other",
    learningTrust: "curated",
    learningUpdatedAt: now,
    createdAt: now,
    updatedAt: now,
    migrationState: "migrated",
    projectType: "conversion",
    preferredWorkflows: ["conversion"],
    canonicalEntry: "scripts/build-social30-related-issues.ts",
    canonicalSources: [
      "scripts/build-social30-related-issues.ts",
      "scripts/lib/next-step-course-shell.ts",
      SOCIAL30_RESOURCE_MANIFEST
    ],
    generatedOutputs: [
      `${projectRoot}/workspace/index.html`,
      `${projectRoot}/meta/social-build.json`,
      `${projectRoot}/meta/conversion-notes.md`
    ],
    regenerateCommand: `npm run build:social30 -- --resource ${SOCIAL30_RESOURCE_ID} --only ${slug}`,
    authoring: {
      driverId: "social-related-issues-v1",
      familyId: "social30-related-issues",
      sourceResourceIds: [SOCIAL30_RESOURCE_ID],
      qualityProfile: "social-related-issues",
      studioEditing: { enabled: true, renameCourse: true, imageAssets: true },
      editabilityContract: {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      }
    },
    importedFirstPassOrigin: {
      sourceSystem: "brightspace",
      sourcePath: SOCIAL30_RESOURCE_MANIFEST,
      importedAt: now,
      notes: `Palette-shell variant generated from the checksum-verified Social 30-1 source for ${details.units.join(" + ")}.`
    },
    exportTargets: [
      { target: "scorm", enabled: true, notes: "SCORM package for Brightspace upload." },
      { target: "html", enabled: true, notes: "Standalone workspace preview." }
    ],
    authoringStatus: "active",
    referenceOnly: [],
    sourceOfTruthNotes:
      `The workspace is generated output. Studio stores course-only overrides and the staged Social factory rebuilds from ${SOCIAL30_RESOURCE_ID} without rewriting raw source or meta/project.json. Studio onboarding: Checksum-backed Social source and staged rebuild adapter retained.`
  };
}

async function normalizeManifestBase(manifest: ProjectManifest, slug: string, repoRoot: string, now: string) {
  const legacySources = manifest.migrationState === "legacy" || !manifest.canonicalSources?.length
    ? await collectLegacyWorkspaceSources(repoRoot, slug)
    : [];
  const canonicalSources = legacySources.length
    ? legacySources
    : await normalizeCanonicalList(manifest.canonicalSources, slug, repoRoot);
  const defaultEntry = `projects/${slug}/workspace/index.html`;
  const canonicalEntry = manifest.canonicalEntry
    ? await normalizeCanonicalPath(manifest.canonicalEntry, slug, repoRoot)
    : defaultEntry;
  if (!canonicalSources.includes(canonicalEntry) && await exists(path.join(repoRoot, ...canonicalEntry.split("/")))) {
    canonicalSources.unshift(canonicalEntry);
  }
  const projectType = manifest.projectType ?? (manifest.learningSource === "gemini" ? "generated-course" : "conversion");
  const preferredWorkflows: NonNullable<ProjectManifest["preferredWorkflows"]> = manifest.preferredWorkflows?.length
    ? manifest.preferredWorkflows
    : [projectType === "conversion" ? "conversion" : "generated-course"];
  const exportTargets = manifest.exportTargets?.length
    ? manifest.exportTargets
    : [{ target: "html" as const, enabled: true, notes: "Canonical workspace preview and export target." }];
  const normalized: ProjectManifest = {
    ...manifest,
    migrationState: "migrated" as const,
    projectType,
    preferredWorkflows,
    workspaceEntrypoint: projectLocalEntrypoint(manifest.workspaceEntrypoint, slug, "workspace/index.html"),
    rawEntrypoint: projectLocalEntrypoint(manifest.rawEntrypoint, slug, "raw/original.html"),
    canonicalEntry,
    canonicalSources,
    generatedOutputs: await normalizeCanonicalList(manifest.generatedOutputs, slug, repoRoot),
    referenceOnly: await normalizeCanonicalList(manifest.referenceOnly, slug, repoRoot),
    exportTargets
  };
  return normalized;
}

async function buildManifestCandidate(input: {
  manifest: ProjectManifest;
  slug: string;
  repoRoot: string;
  now: string;
  priorDoctorPass: boolean;
}) {
  const { slug, repoRoot, now } = input;
  const manifest = await normalizeManifestBase(input.manifest, slug, repoRoot, now);
  const priorDriver = input.manifest.authoring?.driverId;
  const authorable = AUTHORABLE_STATUSES.has(manifest.authoringStatus ?? "active");
  const renameCourse = await titleMarkerCount(repoRoot, slug) >= 2;
  let classification: CourseOnboardingClassification;
  let driverId: NonNullable<ProjectManifest["authoring"]>["driverId"];
  let familyId: string;
  let enabled = authorable;
  let reason: string;

  if (!authorable) {
    classification = manifest.authoringStatus === "blocked" ? "blocked" : "reference-only";
    driverId = manifest.canonicalSources?.some((source) => source.startsWith(`projects/${slug}/workspace/`))
      ? "direct-workspace-v1"
      : "proposal-only-v1";
    familyId = classification;
    enabled = false;
    reason = classification === "blocked"
      ? "Source ownership was normalized, but the existing course lifecycle blocker remains explicit."
      : "Reference/test artifact retained without enabling writes.";
  } else if (isSocial30FactorySlug(slug) && priorDriver === "social-related-issues-v1") {
    classification = "social-factory";
    driverId = "social-related-issues-v1";
    familyId = "social30-related-issues";
    reason = "Checksum-backed Social source and staged rebuild adapter retained.";
  } else if (isEnglishProject(manifest, slug) && priorDriver !== "legacy-snapshot-v1" && input.priorDoctorPass) {
    classification = "english-factory";
    driverId = "english-factory-v1";
    familyId = "english-course-factory";
    reason = "Materialized English source archives and staged factory are available.";
  } else if (
    priorDriver === "legacy-snapshot-v1" ||
    isEnglishProject(manifest, slug) ||
    isSocialLegacyProject(slug) ||
    (hasWorkspaceReplacingLegacyBuilder(manifest) && input.manifest.authoring?.studioEditing?.enabled !== true)
  ) {
    classification = "legacy-snapshot";
    driverId = "legacy-snapshot-v1";
    familyId = manifest.authoring?.familyId ?? (
      isEnglishProject(manifest, slug)
        ? "english-legacy-snapshot"
        : isSocialLegacyProject(slug)
          ? "social-legacy-snapshot"
          : "builder-legacy-snapshot"
    );
    reason = "The learner page is preserved as the editable baseline because its original rebuild inputs are incomplete or not portable.";
    const priorCommand = manifest.regenerateCommand;
    if (priorCommand) {
      const quarantineNote = `Legacy onboarding quarantined the prior rebuild command until its source inputs are restored: ${priorCommand}`;
      if (!manifest.sourceOfTruthNotes?.includes(quarantineNote)) {
        manifest.sourceOfTruthNotes = `${manifest.sourceOfTruthNotes ?? ""} ${quarantineNote}`.trim();
      }
      if (!(manifest.generatedOutputs?.length)) delete manifest.regenerateCommand;
    }
  } else {
    classification = "direct";
    driverId = "direct-workspace-v1";
    familyId = input.manifest.migrationState === "legacy" ? "migrated-legacy-workspace" : "explicit-workspace-source";
    reason = priorDriver === "direct-workspace-v1"
      ? "Explicit canonical workspace ownership retained."
      : "Canonical workspace ownership made explicit; shared non-workspace sources remain read-only in Studio.";
  }

  const learnerSurfaces = (driverId === "direct-workspace-v1" || driverId === "legacy-snapshot-v1") && enabled
    ? await inferLearnerSurfaceDeclaration(manifest, slug, repoRoot)
    : undefined;
  const supportedNewCourseDriver = (
    driverId === "direct-workspace-v1" ||
    driverId === "english-factory-v1" ||
    driverId === "social-related-issues-v1"
  );
  const newlyEnrolledEditabilityContract = (
    enabled &&
    supportedNewCourseDriver &&
    input.manifest.authoring?.studioEditing?.enabled !== true
  )
    ? {
        schemaVersion: STUDIO_EDITABILITY_CONTRACT_SCHEMA_VERSION,
        profileId: STUDIO_ROUTINE_CONTENT_PROFILE_ID
      } as const
    : undefined;

  const next: ProjectManifest = {
    ...manifest,
    ...(classification === "reference-only" ? { canonicalEntry: undefined, canonicalSources: [] } : {}),
    authoring: {
      driverId,
      familyId: manifest.authoring?.familyId ?? familyId,
      ...(driverId === "social-related-issues-v1"
        ? { sourceResourceIds: manifest.authoring?.sourceResourceIds ?? [SOCIAL30_RESOURCE_ID] }
        : {}),
      qualityProfile: manifest.authoring?.qualityProfile ?? (
        driverId === "direct-workspace-v1" ? "direct-rendered-course" :
        driverId === "english-factory-v1" ? "english-unit" :
        driverId === "social-related-issues-v1" ? "social-related-issues" :
        driverId === "legacy-snapshot-v1" ? "legacy-snapshot-rendered" : "proposal-only"
      ),
      ...(learnerSurfaces ? { learnerSurfaces } : {}),
      ...(manifest.authoring?.editabilityContract
        ? { editabilityContract: manifest.authoring.editabilityContract }
        : newlyEnrolledEditabilityContract
          ? { editabilityContract: newlyEnrolledEditabilityContract }
          : {}),
      studioEditing: {
        enabled,
        // Rename is enabled only when the current rendered source still
        // carries enough synchronized title markers. A previous onboarding
        // flag is not proof that those markers survived later course changes.
        renameCourse: enabled && renameCourse,
        imageAssets: enabled
      }
    },
    sourceOfTruthNotes: manifest.sourceOfTruthNotes?.includes("Studio onboarding:")
      ? manifest.sourceOfTruthNotes
      : `${manifest.sourceOfTruthNotes ?? ""} Studio onboarding: ${reason}`.trim()
  };
  return { manifest: next, classification, enabled, reason };
}

async function atomicWriteJson(target: string, value: unknown) {
  await atomicWriteBytes(target, Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8"), 0o644);
}

async function atomicWriteBytes(target: string, content: Buffer, mode: number) {
  await mkdir(path.dirname(target), { recursive: true });
  const temporary = `${target}.course-onboard-${process.pid}-${Date.now()}`;
  try {
    await writeFile(temporary, content, { mode });
    await chmod(temporary, mode);
    await rename(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function snapshotOnboardingFile(target: string): Promise<OnboardingFileBackup> {
  const createdParentDirectories: string[] = [];
  let cursor = path.dirname(target);
  while (!(await exists(cursor))) {
    createdParentDirectories.push(cursor);
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  try {
    const entry = await lstat(target);
    if (!entry.isFile() || entry.isSymbolicLink()) throw new Error("Onboarding rollback supports regular files only.");
    return { target, content: await readFile(target), mode: entry.mode, createdParentDirectories };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { target, content: null, mode: null, createdParentDirectories };
  }
}

async function restoreOnboardingFile(backup: OnboardingFileBackup) {
  if (backup.content === null) {
    await rm(backup.target, { force: true });
    for (const directory of backup.createdParentDirectories) {
      try {
        await rmdir(directory);
      } catch (error) {
        if (!["ENOENT", "ENOTEMPTY", "EEXIST"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error;
      }
    }
    return;
  }
  await atomicWriteBytes(backup.target, backup.content, backup.mode ?? 0o644);
}

async function buildCandidates(repoRoot: string, now: string) {
  const projectsRoot = path.join(repoRoot, "projects");
  const directories = (await readdir(projectsRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && PROJECT_SLUG_PATTERN.test(entry.name) && !RESERVED_PROJECTS.has(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const candidates: ManifestCandidate[] = [];
  const entries: CourseOnboardingEntry[] = [];

  for (const directory of directories) {
    const slug = directory.name;
    const manifestPath = path.join(projectsRoot, slug, "meta", "project.json");
    let current: ProjectManifest | null = null;
    try {
      current = JSON.parse(await readFile(manifestPath, "utf8")) as ProjectManifest;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }

    if (!current && isSocial30FactorySlug(slug) && await exists(path.join(projectsRoot, slug, "workspace", "index.html"))) {
      const manifest = createSocial30FactoryManifest(slug, now);
      candidates.push({
        slug,
        path: manifestPath,
        manifest,
        entry: {
          slug,
          classification: "social-factory",
          studioEditing: "enabled",
          action: "create",
          reason: "Created a checksum-backed Social factory manifest for the staged Option Two workspace."
        }
      });
      continue;
    }

    if (!current) {
      const reason = await packageArchiveReason(path.join(projectsRoot, slug));
      if (!reason) {
        entries.push({
          slug,
          classification: "blocked",
          studioEditing: "disabled",
          action: "classify",
          reason: "No project manifest was found. Catalog onboarding did not invent canonical source authority; establish an explicit source contract before enabling Studio writes."
        });
        continue;
      }
      entries.push({
        slug,
        classification: "package-archive",
        studioEditing: "not-applicable",
        action: "classify",
        reason
      });
      continue;
    }

    const priorDoctor = await inspectCourseAuthoringProject(slug, repoRoot);
    const built = await buildManifestCandidate({
      manifest: current,
      slug,
      repoRoot,
      now,
      priorDoctorPass: priorDoctor.status === "pass"
    });
    const policy = validateProjectManifestPolicy(built.manifest);
    if (policy.status === "invalid") {
      throw new Error(`${slug} onboarding candidate violates manifest policy: ${policy.errors.join("; ")}`);
    }
    const unchanged = JSON.stringify(current) === JSON.stringify(built.manifest);
    if (!unchanged) built.manifest.updatedAt = now;
    const action = unchanged
      ? "retain"
      : current.migrationState === "legacy"
        ? "migrate"
        : "onboard";
    candidates.push({
      slug,
      path: manifestPath,
      manifest: built.manifest,
      entry: {
        slug,
        classification: built.classification,
        studioEditing: built.enabled ? "enabled" : "disabled",
        action,
        reason: built.reason
      }
    });
  }
  return { projectDirectoryCount: directories.length, candidates, entries };
}

function countClassifications(entries: CourseOnboardingEntry[]) {
  const counts: Record<CourseOnboardingClassification, number> = {
    direct: 0,
    "english-factory": 0,
    "social-factory": 0,
    "legacy-snapshot": 0,
    blocked: 0,
    "reference-only": 0,
    "package-archive": 0
  };
  for (const entry of entries) counts[entry.classification] += 1;
  return counts;
}

export async function onboardCourseCatalog(options: {
  repoRoot: string;
  apply?: boolean;
  now?: string;
  /** Internal fault-injection seam used only by the onboarding tests. */
  hooks?: { afterStudioSignalWritten?: () => void | Promise<void> };
}): Promise<CourseOnboardingReport> {
  const repoRoot = path.resolve(options.repoRoot);
  const now = options.now ?? new Date().toISOString();
  const built = await buildCandidates(repoRoot, now);
  const allEntries = [...built.candidates.map((candidate) => candidate.entry), ...built.entries]
    .sort((left, right) => left.slug.localeCompare(right.slug));

  if (options.apply) {
    const backups = new Map<string, OnboardingFileBackup>();
    const rememberBackup = async (target: string) => {
      if (!backups.has(target)) backups.set(target, await snapshotOnboardingFile(target));
    };
    try {
      const changedCandidates = built.candidates.filter((candidate) => candidate.entry.action !== "retain");
      for (const candidate of changedCandidates) {
        await rememberBackup(candidate.path);
        await atomicWriteJson(candidate.path, candidate.manifest);
      }
      for (const candidate of built.candidates) {
        if (candidate.entry.studioEditing !== "enabled") continue;
        const doctor = await inspectCourseAuthoringProject(candidate.slug, repoRoot);
        if (doctor.status !== "pass" || !doctor.project?.studioEditing.enabled) {
          throw new Error(
            `${candidate.slug} failed its post-onboarding doctor: ${doctor.issues.map((issue) => issue.message).join("; ")}`
          );
        }
      }
      if (changedCandidates.length > 0) {
        const signalPath = path.join(repoRoot, STUDIO_PROJECT_CHANGE_SIGNAL);
        await rememberBackup(signalPath);
        await atomicWriteJson(signalPath, {
          changedAt: now,
          projectCount: changedCandidates.length,
          reason: "course-catalog-onboarding",
          nonce: randomUUID()
        });
        await options.hooks?.afterStudioSignalWritten?.();
      }
    } catch (error) {
      for (const backup of [...backups.values()].reverse()) {
        await restoreOnboardingFile(backup);
      }
      throw error;
    }
  }

  return {
    schemaVersion: 1,
    generatedAt: now,
    applied: options.apply === true,
    projectDirectoryCount: built.projectDirectoryCount,
    manifestCount: built.candidates.length,
    entries: allEntries,
    counts: countClassifications(allEntries)
  };
}
