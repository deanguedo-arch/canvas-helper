import path from "node:path";
import { readFile } from "node:fs/promises";

export type ProjectE2EContract = {
  projectSlug: string;
  requiredTestIds?: string[];
  assertionProfiles?: Record<string, { checks: string[]; mode?: "learner" | "archive" }>;
  modulePassTargets?: Array<{
    moduleTitle: string;
    itemTitle: string;
    assertionProfile?: string;
    checks?: string[];
    mode?: "learner" | "archive";
  }>;
  visibilityChecks?: Array<{
    moduleTitle: string;
    itemTitle: string;
    learnerVisible: boolean;
    archiveVisible: boolean;
  }>;
  modes?: {
    enabled: boolean;
    toggleRoleName?: string;
    learnerIndicator?: string;
    archiveIndicator?: string;
  };
  navigation?: {
    enabled: boolean;
    nextRoleName?: string;
    previousRoleName?: string;
    nodeCounterPattern?: string;
  };
  quiz?: {
    enabled: boolean;
    lessonTitle: string;
    answerChoiceLabel?: string;
    progressPattern?: string;
    checkAnswerRoleName?: string;
  };
  fallbackPanel?: {
    enabled: boolean;
  };
};

function assertContractShape(value: unknown, sourcePath: string): asserts value is ProjectE2EContract {
  if (!value || typeof value !== "object") {
    throw new Error(`Invalid e2e contract at ${sourcePath}: expected object.`);
  }

  const contract = value as Partial<ProjectE2EContract>;
  if (!contract.projectSlug || typeof contract.projectSlug !== "string") {
    throw new Error(`Invalid e2e contract at ${sourcePath}: missing projectSlug.`);
  }

  if (contract.requiredTestIds && !Array.isArray(contract.requiredTestIds)) {
    throw new Error(`Invalid e2e contract at ${sourcePath}: requiredTestIds must be an array.`);
  }

  if (contract.assertionProfiles && typeof contract.assertionProfiles !== "object") {
    throw new Error(`Invalid e2e contract at ${sourcePath}: assertionProfiles must be an object.`);
  }

  if (contract.modulePassTargets && !Array.isArray(contract.modulePassTargets)) {
    throw new Error(`Invalid e2e contract at ${sourcePath}: modulePassTargets must be an array.`);
  }

  if (contract.visibilityChecks && !Array.isArray(contract.visibilityChecks)) {
    throw new Error(`Invalid e2e contract at ${sourcePath}: visibilityChecks must be an array.`);
  }
}

export async function loadProjectContractFromPath(contractPath: string): Promise<ProjectE2EContract> {
  const raw = await readFile(contractPath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  assertContractShape(parsed, contractPath);
  return parsed;
}

export async function loadProjectContractBySlug(rootDir: string, slug: string): Promise<ProjectE2EContract> {
  const contractPath = path.join(rootDir, "projects", slug, "meta", "e2e-contract.json");
  return loadProjectContractFromPath(contractPath);
}
