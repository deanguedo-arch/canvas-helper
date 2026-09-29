import path from "node:path";

export const TASK_SCHEMA_VERSION = 1;
export const MAX_WORKER_PACKET_BYTES = 8_000;
export const MAX_WORKER_REPORT_BYTES = 4_000;

export type TaskFamily = "deterministic" | "small-edit" | "investigation" | "bulk-implementation" | "high-consequence";
export type TaskMode = "build" | "rollout";

export interface AgentTask {
  schemaVersion: 1;
  taskId: string;
  attemptId: string;
  projectSlug?: string;
  workflow: string;
  mode: TaskMode;
  objective: string;
  taskFamily: TaskFamily;
  consequenceLevel: "normal" | "high";
  allowedReadPaths: string[];
  allowedWritePaths: string[];
  contextSources: string[];
  acceptanceCriteria: string[];
  requiredChecks: string[];
  deferredChecks: string[];
  prohibitedChanges: string[];
  privacyScope: "repository" | "sensitive";
  baselineSha?: string;
}

const families = new Set<TaskFamily>(["deterministic", "small-edit", "investigation", "bulk-implementation", "high-consequence"]);
const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,79}$/;
const slugPattern = /^[a-z0-9][a-z0-9-]*$/;

function stringField(value: unknown, field: string, max = 2_000): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error(`Invalid ${field}.`);
  return value.trim();
}

export function normalizeTaskPath(value: string): string {
  if (typeof value !== "string" || !value || value.includes("\\") || value.includes("\0")) throw new Error(`Invalid task path: ${String(value)}`);
  const normalized = path.posix.normalize(value);
  if (normalized !== value || value.startsWith("/") || value === "." || value === ".." || value.startsWith("../") || value.split("/").includes(".git")) {
    throw new Error(`Task paths must be normalized repository-relative paths: ${value}`);
  }
  if (value.split("/").some((segment) => segment === ".env" || segment.startsWith(".env.") || segment === ".ssh" || segment === "secrets" || segment === "credentials") || value.startsWith(".runtime/") || value.startsWith(".codex/")) {
    throw new Error(`Sensitive or runtime path is not eligible for a worker task: ${value}`);
  }
  return value;
}

function pathList(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length > 100) throw new Error(`Invalid ${field}.`);
  return [...new Set(value.map((item) => normalizeTaskPath(item)))].sort();
}

function textList(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.length > 50 || value.some((item) => typeof item !== "string" || item.length > 1_000)) {
    throw new Error(`Invalid ${field}.`);
  }
  return value.map((item) => item.trim());
}

export function parseAgentTask(value: unknown): AgentTask {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Task must be a JSON object.");
  const input = value as Record<string, unknown>;
  if (input.schemaVersion !== TASK_SCHEMA_VERSION) throw new Error("Unsupported task schemaVersion.");
  const taskId = stringField(input.taskId, "taskId", 80);
  const attemptId = stringField(input.attemptId, "attemptId", 80);
  if (!idPattern.test(taskId) || !idPattern.test(attemptId)) throw new Error("Task and attempt IDs must be simple stable identifiers.");
  const projectSlug = input.projectSlug === undefined ? undefined : stringField(input.projectSlug, "projectSlug", 100);
  if (projectSlug && !slugPattern.test(projectSlug)) throw new Error("Invalid projectSlug.");
  if (!families.has(input.taskFamily as TaskFamily)) throw new Error("Invalid taskFamily.");
  if (input.mode !== "build" && input.mode !== "rollout") throw new Error("Invalid mode.");
  if (input.consequenceLevel !== "normal" && input.consequenceLevel !== "high") throw new Error("Invalid consequenceLevel.");
  if (input.privacyScope !== "repository" && input.privacyScope !== "sensitive") throw new Error("Invalid privacyScope.");
  const baselineSha = input.baselineSha === undefined ? undefined : stringField(input.baselineSha, "baselineSha", 64);
  if (baselineSha && !/^[a-f0-9]{40}$/.test(baselineSha)) throw new Error("Invalid baselineSha.");
  const allowedWritePaths = pathList(input.allowedWritePaths, "allowedWritePaths");
  if (allowedWritePaths.some((file) => /^projects\/[^/]+\/(raw|exports)(\/|$)/.test(file))) {
    throw new Error("Protected raw and generated export paths are not eligible worker write boundaries.");
  }
  return {
    schemaVersion: 1,
    taskId,
    attemptId,
    projectSlug,
    workflow: stringField(input.workflow, "workflow", 100),
    mode: input.mode,
    objective: stringField(input.objective, "objective", 2_000),
    taskFamily: input.taskFamily as TaskFamily,
    consequenceLevel: input.consequenceLevel,
    allowedReadPaths: pathList(input.allowedReadPaths, "allowedReadPaths"),
    allowedWritePaths,
    contextSources: pathList(input.contextSources, "contextSources"),
    acceptanceCriteria: textList(input.acceptanceCriteria, "acceptanceCriteria"),
    requiredChecks: textList(input.requiredChecks, "requiredChecks"),
    deferredChecks: textList(input.deferredChecks, "deferredChecks"),
    prohibitedChanges: textList(input.prohibitedChanges, "prohibitedChanges"),
    privacyScope: input.privacyScope,
    baselineSha
  };
}

export function assertByteBudget(text: string, maxBytes: number, name: string): void {
  const bytes = Buffer.byteLength(text, "utf8");
  if (bytes > maxBytes) throw new Error(`${name} is ${bytes} UTF-8 bytes; limit is ${maxBytes} bytes.`);
}
