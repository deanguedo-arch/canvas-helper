import path from "node:path";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { ensureDir, fileExists, latestMtimeMs, readJsonFile, writeJsonFile } from "./lib/fs.js";
import {
  IncomingLockError,
  processIncomingProjectItem,
  refreshResourceProjects,
  withIncomingLock
} from "./lib/incoming-intake.js";
import {
  latestResourceSourceMtimeMs,
  listIncomingProjectItems,
  listResourceProjectDirs
} from "./lib/incoming-watch.js";
import {
  incomingRoot as defaultIncomingRoot,
  incomingWatchLockPath,
  repoRoot,
  resourcesRoot as defaultResourcesRoot
} from "./lib/paths.js";

type WatchItemKind = "project" | "resource";
type IncomingMode = "all" | "projects" | "references";

type WatchStateEntry = {
  fingerprint: number;
  processedAt: string;
  itemKind: WatchItemKind;
  status: "imported" | "refreshed";
  slug?: string;
};

type WatchState = {
  schemaVersion: 3;
  generatedAt: string;
  incomingRoot: string;
  resourcesRoot: string;
  entries: Record<string, WatchStateEntry>;
};

type PendingItem = {
  itemKind: WatchItemKind;
  inputPath: string;
  key: string;
  fingerprint: number;
  changedAt: number;
};

type FailedItem = {
  fingerprint: number;
  nextRetryAt: number;
};

const defaultStatePath = path.join(repoRoot, ".runtime", "incoming-watch-state.json");

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function normalizeMode(value: string | undefined): IncomingMode {
  if (value === "projects" || value === "references") {
    return value;
  }

  return "all";
}

function keyForItem(itemKind: WatchItemKind, inputPath: string) {
  return itemKind === "project"
    ? `project:${path.basename(inputPath)}`
    : `resource:${path.basename(inputPath)}`;
}

async function loadState(statePath: string, incomingRoot: string, resourcesRoot: string): Promise<WatchState> {
  if (!(await fileExists(statePath))) {
    return {
      schemaVersion: 3,
      generatedAt: new Date().toISOString(),
      incomingRoot,
      resourcesRoot,
      entries: {}
    };
  }

  try {
    const current = await readJsonFile<Partial<WatchState>>(statePath);
    return {
      schemaVersion: 3,
      generatedAt: current.generatedAt ?? new Date().toISOString(),
      incomingRoot,
      resourcesRoot,
      entries: current.entries ?? {}
    };
  } catch {
    return {
      schemaVersion: 3,
      generatedAt: new Date().toISOString(),
      incomingRoot,
      resourcesRoot,
      entries: {}
    };
  }
}

async function saveState(statePath: string, state: WatchState) {
  await writeJsonFile(statePath, {
    ...state,
    generatedAt: new Date().toISOString()
  });
}

async function collectPendingItems(incomingRoot: string, resourcesRoot: string, mode: IncomingMode) {
  const items: Array<{ itemKind: WatchItemKind; inputPath: string }> = [];

  if (mode === "all" || mode === "projects") {
    const projectItems = await listIncomingProjectItems(incomingRoot);
    items.push(...projectItems.map((inputPath) => ({ itemKind: "project" as const, inputPath })));
  }

  if (mode === "all" || mode === "references") {
    const resourceDirs = await listResourceProjectDirs(resourcesRoot);
    items.push(...resourceDirs.map((inputPath) => ({ itemKind: "resource" as const, inputPath })));
  }

  return items.sort((left, right) => left.inputPath.localeCompare(right.inputPath));
}

async function getItemFingerprint(item: { itemKind: WatchItemKind; inputPath: string }) {
  return item.itemKind === "project"
    ? latestMtimeMs(item.inputPath)
    : latestResourceSourceMtimeMs(item.inputPath);
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const once = hasFlag(parsedArgs, "once");
  const incomingRoot = path.resolve(getStringFlag(parsedArgs, "incoming") ?? defaultIncomingRoot);
  const resourcesRoot = path.resolve(getStringFlag(parsedArgs, "resources") ?? defaultResourcesRoot);
  const statePath = path.resolve(getStringFlag(parsedArgs, "state") ?? defaultStatePath);
  const intervalMs = toInt(getStringFlag(parsedArgs, "interval-ms"), 2500);
  const quietMs = toInt(getStringFlag(parsedArgs, "quiet-ms"), 4000);
  const retryMs = toInt(getStringFlag(parsedArgs, "retry-ms"), 15000);
  const lockPath = path.resolve(getStringFlag(parsedArgs, "lock") ?? incomingWatchLockPath);
  const mode = normalizeMode(getStringFlag(parsedArgs, "mode"));

  await ensureDir(path.dirname(statePath));
  await ensureDir(incomingRoot);
  await ensureDir(resourcesRoot);

  const state = await loadState(statePath, incomingRoot, resourcesRoot);
  const pending = new Map<string, PendingItem>();
  const failed = new Map<string, FailedItem>();
  const queue: PendingItem[] = [];
  let processing = false;

  async function processQueue() {
    if (processing || queue.length === 0) {
      return;
    }

    processing = true;
    const next = queue.shift();
    if (!next) {
      processing = false;
      return;
    }

    if (!(await fileExists(next.inputPath))) {
      failed.delete(next.key);
      processing = false;
      void processQueue();
      return;
    }

    let deferredRetry = false;
    try {
      if (next.itemKind === "project") {
        const imported = await withIncomingLock(
          async () =>
            processIncomingProjectItem({
              inputPath: next.inputPath,
              incomingRoot
            }),
          lockPath
        );

        state.entries[next.key] = {
          fingerprint: next.fingerprint,
          processedAt: new Date().toISOString(),
          itemKind: "project",
          status: "imported",
          slug: imported.slug
        };
        console.log(`[watch] imported ${imported.sourceKey} -> ${imported.slug}`);
        for (const warning of imported.warnings) {
          console.log(`[watch] warning (${imported.slug}): ${warning}`);
        }
      } else {
        const result = await withIncomingLock(
          async () =>
            refreshResourceProjects({
              resourceDirs: [next.inputPath]
            }),
          lockPath
        );

        if (result.failures.length > 0) {
          throw new Error(result.failures[0].message);
        }

        const refreshed = result.syncedReferences[0];
        if (!refreshed) {
          throw new Error(`No resource refresh result was produced for ${next.key}.`);
        }

        state.entries[next.key] = {
          fingerprint: next.fingerprint,
          processedAt: new Date().toISOString(),
          itemKind: "resource",
          status: "refreshed",
          slug: refreshed.slug
        };
        console.log(`[watch] refreshed resources for ${refreshed.slug}`);
      }

      failed.delete(next.key);
      await saveState(statePath, state);
    } catch (error) {
      if (error instanceof IncomingLockError) {
        queue.unshift(next);
        deferredRetry = true;
        setTimeout(() => {
          void processQueue();
        }, 750);
      } else {
        failed.set(next.key, {
          fingerprint: next.fingerprint,
          nextRetryAt: Date.now() + retryMs
        });
        console.error(`[watch] failed for ${next.key}: ${error instanceof Error ? error.message : String(error)}`);
        console.error(`[watch] ${next.key} will retry after the input changes or in ${Math.ceil(retryMs / 1000)}s.`);
      }
    } finally {
      processing = false;
      if (!deferredRetry) {
        void processQueue();
      }
    }
  }

  async function scan(allowUnstable = false) {
    const now = Date.now();
    const items = await collectPendingItems(incomingRoot, resourcesRoot, mode);
    const seenKeys = new Set<string>();

    for (const item of items) {
      const key = keyForItem(item.itemKind, item.inputPath);
      seenKeys.add(key);

      const fingerprint = await getItemFingerprint(item);
      let current = pending.get(key);

      if (!current || current.fingerprint !== fingerprint) {
        current = {
          itemKind: item.itemKind,
          inputPath: item.inputPath,
          key,
          fingerprint,
          changedAt: now
        };
        pending.set(key, current);
        if (!allowUnstable) {
          continue;
        }
      }

      const stable = allowUnstable || now - current.changedAt >= quietMs;
      if (!stable) {
        continue;
      }

      const previous = state.entries[key];
      if (previous?.fingerprint === fingerprint) {
        failed.delete(key);
        continue;
      }

      const failedEntry = failed.get(key);
      if (failedEntry && failedEntry.fingerprint === fingerprint) {
        if (now < failedEntry.nextRetryAt) {
          continue;
        }
        failed.delete(key);
      }

      if (queue.some((queuedItem) => queuedItem.key === key)) {
        continue;
      }

      queue.push({ ...current });
      void processQueue();
    }

    for (const key of Object.keys(state.entries)) {
      if (!seenKeys.has(key)) {
        delete state.entries[key];
      }
    }
    await saveState(statePath, state);
  }

  console.log(`[watch] incoming root: ${incomingRoot}`);
  console.log(`[watch] resources root: ${resourcesRoot}`);
  console.log(`[watch] state file: ${statePath}`);
  console.log(`[watch] mode: ${mode}`);

  if (once) {
    await scan(true);
    while (processing || queue.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    console.log("[watch] one-shot scan complete.");
    return;
  }

  await scan();
  const timer = setInterval(() => {
    void scan();
  }, intervalMs);

  const shutdown = () => {
    clearInterval(timer);
    console.log("[watch] stopped.");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
