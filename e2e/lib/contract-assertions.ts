import type { ProjectE2EContract } from "./project-contract-schema";

export function assertTextChanged(label: string, before: string, after: string) {
  if (before === after) {
    throw new Error(`Expected ${label} to change, but it stayed the same.`);
  }
}

export function assertNonEmptyCertificationTargets(contract: ProjectE2EContract) {
  const hasTargets = Boolean(contract.modulePassTargets?.length || contract.visibilityChecks?.length);
  if (!hasTargets) {
    throw new Error("Deep contract is empty: add modulePassTargets or visibilityChecks.");
  }
}
