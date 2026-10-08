import { readFile, writeFile, rename, open, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { repoRoot } from "../../../scripts/lib/paths.ts";
import type { ProjectOrganization, ProjectOrganizationRegistry } from "../../shared/project-organization.js";

export const organizationRegistryPath = path.join(repoRoot, "config", "project-organization.json");
let mutationQueue: Promise<unknown> = Promise.resolve();

export function parseOrganizationRegistry(text: string): ProjectOrganizationRegistry {
  const value = JSON.parse(text) as ProjectOrganizationRegistry;
  if (value.schemaVersion !== 1 || !value.projects || typeof value.projects !== "object" || Array.isArray(value.projects)) {
    throw new Error("Invalid project organization registry.");
  }
  for (const [slug, entry] of Object.entries(value.projects)) {
    if (!/^[a-z0-9][a-z0-9._-]*$/i.test(slug) || !entry || typeof entry.archived !== "boolean"
      || (entry.role !== undefined && entry.role !== "fixture")) throw new Error("Invalid project organization entry.");
  }
  return value;
}

export async function readOrganizationRegistry(registryPath = organizationRegistryPath) {
  try { return parseOrganizationRegistry(await readFile(registryPath, "utf8")); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { schemaVersion: 1, projects: {} } as ProjectOrganizationRegistry;
    throw error;
  }
}

export function organizationForSlug(registry: ProjectOrganizationRegistry, slug: string): ProjectOrganization {
  const entry = Object.hasOwn(registry.projects, slug) ? registry.projects[slug] : undefined;
  return { archived: entry?.archived ?? false, canArchive: Boolean(entry), ...(entry?.role ? { role: entry.role } : {}) };
}

export function setProjectArchived(slug: string, archived: boolean, registryPath = organizationRegistryPath) {
  const run = async () => {
    const lockPath = `${registryPath}.lock`;
    let lock;
    try { lock = await open(lockPath, "wx"); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error("Organization registry is busy; refresh and retry after the active writer finishes.");
      throw error;
    }
    try {
    const before = await readFile(registryPath, "utf8");
    const registry = parseOrganizationRegistry(before);
    if (!Object.hasOwn(registry.projects, slug)) throw new Error("Project is outside the approved organization registry.");
    registry.projects[slug] = { ...registry.projects[slug], archived };
    if (await readFile(registryPath, "utf8") !== before) throw new Error("Organization changed concurrently; refresh and retry.");
    const temporary = `${registryPath}.${randomUUID()}.tmp`;
    await writeFile(temporary, `${JSON.stringify(registry, null, 2)}\n`, { flag: "wx" });
    if (await readFile(registryPath, "utf8") !== before) throw new Error("Organization changed concurrently; refresh and retry.");
    // Atomic registry save only; no project files, manifests or paths are changed.
    await rename(temporary, registryPath);
    return organizationForSlug(registry, slug);
    } finally { await lock.close(); await unlink(lockPath); }
  };
  const result = mutationQueue.then(run);
  mutationQueue = result.catch(() => undefined);
  return result;
}
