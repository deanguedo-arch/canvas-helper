import { readdir } from "node:fs/promises";
import path from "node:path";

import { fileExists, readJsonFile } from "./fs.js";
import { getProjectPaths, projectsRoot } from "./paths.js";

const NON_PROJECT_SLUGS = new Set(["incoming", "processed", "resources", "assessments"]);

export type GoogleHostedDeployConfig = {
  enabled: boolean;
  firebaseProjectId: string;
  hostingSiteId: string;
};

export type DeployableGoogleHostedProject = {
  slug: string;
  config: GoogleHostedDeployConfig;
  exportDir: string;
  firebaseConfigPath: string;
  firebaseRcPath: string;
  deployConfigPath: string;
};

export type GoogleHostedDeployContext = {
  slug: string;
  firebaseProjectId: string;
  hostingSiteId: string;
  exportDir: string;
  firebaseConfigPath: string;
  firebaseRcPath: string;
  deployConfigPath: string;
};

type FirebaseHostingConfig = {
  public?: string;
  ignore?: string[];
  rewrites?: Array<Record<string, string>>;
  target?: string;
  [key: string]: unknown;
};

type FirebaseJson = {
  hosting: FirebaseHostingConfig;
  [key: string]: unknown;
};

type FirebaseRc = {
  projects: {
    default: string;
  };
  targets: Record<
    string,
    {
      hosting: Record<string, string[]>;
    }
  >;
};

function validateGoogleHostedDeployConfig(value: unknown, slug: string): GoogleHostedDeployConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid Google Hosted deploy config for "${slug}": expected object.`);
  }

  const enabled = "enabled" in value ? value.enabled : undefined;
  const firebaseProjectId = "firebaseProjectId" in value ? value.firebaseProjectId : undefined;
  const hostingSiteId = "hostingSiteId" in value ? value.hostingSiteId : undefined;

  if (typeof enabled !== "boolean") {
    throw new Error(`Invalid Google Hosted deploy config for "${slug}": enabled must be boolean.`);
  }

  if (typeof firebaseProjectId !== "string" || firebaseProjectId.trim().length === 0) {
    throw new Error(`Invalid Google Hosted deploy config for "${slug}": firebaseProjectId is required.`);
  }

  if (typeof hostingSiteId !== "string" || hostingSiteId.trim().length === 0) {
    throw new Error(`Invalid Google Hosted deploy config for "${slug}": hostingSiteId is required.`);
  }

  return {
    enabled,
    firebaseProjectId: firebaseProjectId.trim(),
    hostingSiteId: hostingSiteId.trim()
  };
}

export async function loadGoogleHostedDeployConfig(slug: string): Promise<GoogleHostedDeployConfig | null> {
  const deployConfigPath = path.join(getProjectPaths(slug).metaDir, "google-hosted.deploy.json");
  if (!(await fileExists(deployConfigPath))) {
    return null;
  }

  const rawConfig = await readJsonFile<unknown>(deployConfigPath);
  return validateGoogleHostedDeployConfig(rawConfig, slug);
}

export async function listDeployableGoogleHostedProjects(): Promise<DeployableGoogleHostedProject[]> {
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const deployableProjects: DeployableGoogleHostedProject[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || NON_PROJECT_SLUGS.has(entry.name)) {
      continue;
    }

    const slug = entry.name;
    const config = await loadGoogleHostedDeployConfig(slug);
    if (!config?.enabled) {
      continue;
    }

    const exportDir = path.join(getProjectPaths(slug).exportsDir, "google-hosted");
    const firebaseConfigPath = path.join(exportDir, "firebase-config.json");
    const firebaseRcPath = path.join(exportDir, ".firebaserc");

    if (!(await fileExists(exportDir)) || !(await fileExists(firebaseConfigPath)) || !(await fileExists(firebaseRcPath))) {
      continue;
    }

    deployableProjects.push({
      slug,
      config,
      exportDir,
      firebaseConfigPath,
      firebaseRcPath,
      deployConfigPath: path.join(getProjectPaths(slug).metaDir, "google-hosted.deploy.json")
    });
  }

  return deployableProjects.sort((left, right) => left.slug.localeCompare(right.slug));
}

export function parseGoogleHostedDeploySelection(input: string, entryCount: number) {
  const rawParts = input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (rawParts.length === 0) {
    throw new Error("A selection is required.");
  }

  const selectedIndexes = new Set<number>();
  for (const rawPart of rawParts) {
    if (!/^\d+$/.test(rawPart)) {
      throw new Error(`Invalid selection "${rawPart}".`);
    }

    const oneBasedIndex = Number(rawPart);
    if (oneBasedIndex < 1 || oneBasedIndex > entryCount) {
      throw new Error(`Selection "${rawPart}" is out of range.`);
    }

    selectedIndexes.add(oneBasedIndex - 1);
  }

  return [...selectedIndexes].sort((left, right) => left - right);
}

export function buildGoogleHostedDeployContext(project: DeployableGoogleHostedProject): GoogleHostedDeployContext {
  return {
    slug: project.slug,
    firebaseProjectId: project.config.firebaseProjectId,
    hostingSiteId: project.config.hostingSiteId,
    exportDir: project.exportDir,
    firebaseConfigPath: project.firebaseConfigPath,
    firebaseRcPath: project.firebaseRcPath,
    deployConfigPath: project.deployConfigPath
  };
}

export function formatDeployableGoogleHostedProjects(projects: DeployableGoogleHostedProject[]) {
  return projects.map(
    (project, index) => `${index + 1}. ${project.slug} -> ${project.config.firebaseProjectId} / ${project.config.hostingSiteId}`
  );
}

export function buildGoogleHostedFirebaseDeployFiles(context: GoogleHostedDeployContext, firebaseJson: FirebaseJson) {
  const deployTargetName = context.slug;
  return {
    deployTargetName,
    firebaseJson: {
      ...firebaseJson,
      hosting: {
        ...firebaseJson.hosting,
        target: deployTargetName
      }
    },
    firebaseRc: {
      projects: {
        default: context.firebaseProjectId
      },
      targets: {
        [context.firebaseProjectId]: {
          hosting: {
            [deployTargetName]: [context.hostingSiteId]
          }
        }
      }
    } satisfies FirebaseRc
  };
}

export function getFirebaseCliCommand(platform = process.platform) {
  return platform === "win32" ? "firebase.cmd" : "firebase";
}

export function getFirebaseCliUsesShell(platform = process.platform) {
  return platform === "win32";
}
