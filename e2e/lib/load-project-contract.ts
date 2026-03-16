import path from "node:path";
import { readFile } from "node:fs/promises";

import { validateProjectContract, type ProjectE2EContract } from "./project-contract-schema";

export type LoadProjectContractOptions = {
  requireDeepTargets?: boolean;
};

export async function loadProjectContractFromPath(
  contractPath: string,
  options: LoadProjectContractOptions = {}
): Promise<ProjectE2EContract> {
  let raw: string;
  try {
    raw = await readFile(contractPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Missing e2e contract at ${contractPath}: ${message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in e2e contract at ${contractPath}: ${message}`);
  }

  return validateProjectContract(parsed, contractPath, options);
}

export async function loadProjectContractBySlug(
  rootDir: string,
  slug: string,
  options: LoadProjectContractOptions = {}
): Promise<ProjectE2EContract> {
  const contractPath = path.join(rootDir, "projects", slug, "meta", "e2e-contract.json");
  return loadProjectContractFromPath(contractPath, options);
}
