import path from "node:path";
import { readdir } from "node:fs/promises";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { ensureDir, fileExists, latestMtimeMs, readJsonFile, writeJsonFile } from "./lib/fs.js";
import { repoRoot } from "./lib/paths.js";
import { importProject } from "./lib/importer.js";

type WatchStateEntry = {
  fingerprint: number;
  processedAt: string;
  slug: string;
};

type WatchState = {
  schemaVersion: 1;
  generatedAt: string;
  incomingRoot: string;
  entries: Record<string, WatchStateEntry>;
};

type PendingFolder = {
  folderPath: string;
  fingerprint: number;
  changedAt: number;
};

const defaultIncomingRoot = path.join(repoRoot, "projects", "_incoming");
const defaultStatePath = path.join(repoRoot, ".runtime", "incoming-watch-state.json");

function toInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

function keyForFolder(incomingRoot: string, folderPath: string) {
  return path.relative(incomingRoot, folderPath).replace(/\\/g, "/");
}

async function loadState(statePath: string, incomingRoot: string): Promise<WatchState> {
  if (!(await fileExists(statePath))) {
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      incomingRoot,
      entries: {}
    };
  }

  try {
    const current = await readJsonFile<WatchState>(statePath);
    return {
      schemaVersion: 1,
      generatedAt: current.generatedAt ?? new Date().toISOString(),
      incomingRoot,
      entries: current.entries ?? {}
    };
  } catch {
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      incomingRoot,
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

async function listIncomingFolders(incomingRoot: string) {
  if (!(await fileExists(incomingRoot))) {
    return [] as string[];
  }

  const entries = await readdir(incomingRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => path.join(incomingRoot, entry.name))
    .sort((left, right) => left.localeCompare(right));
}

async function main() {
  const parsedArgs = parseArgs(process.argv.slice(2));
  const once = hasFlag(parsedArgs, "once");
  const force = !hasFlag(parsedArgs, "no-force");
  const incomingRoot = path.resolve(getStringFlag(parsedArgs, "incoming") ?? defaultIncomingRoot);
  const statePath = path.resolve(getStringFlag(parsedArgs, "state") ?? defaultStatePath);
  const intervalMs = toInt(getStringFlag(parsedArgs, "interval-ms"), 2500);
  const quietMs = toInt(getStringFlag(parsedArgs, "quiet-ms"), 4000);

  await ensureDir(path.dirname(statePath));
  await ensureDir(incomingRoot);

  const state = await loadState(statePath, incomingRoot);
  const pending = new Map<string, PendingFolder>();
  const queue: PendingFolder[] = [];
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

    const folderKey = keyForFolder(incomingRoot, next.folderPath);
    try {
      const result = await importProject({
        inputPath: next.folderPath,
        force
      });

      state.entries[folderKey] = {
        fingerprint: next.fingerprint,
        processedAt: new Date().toISOString(),
        slug: result.slug
      };
      await saveState(statePath, state);

      console.log(`[watch] imported ${folderKey} -> ${result.slug}`);
      if (result.warnings.length > 0) {
        for (const warning of result.warnings) {
          console.log(`[watch] warning (${result.slug}): ${warning}`);
        }
      }
    } catch (error) {
      console.error(`[watch] failed for ${folderKey}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      processing = false;
      void processQueue();
    }
  }

  async function scan(allowUnstable = false) {
    const now = Date.now();
    const folders = await listIncomingFolders(incomingRoot);
    const seenKeys = new Set<string>();

    for (const folderPath of folders) {
      const key = keyForFolder(incomingRoot, folderPath);
      seenKeys.add(key);

      const fingerprint = await latestMtimeMs(folderPath);
      const current = pending.get(key);

      if (!current || current.fingerprint !== fingerprint) {
        pending.set(key, {
          folderPath,
          fingerprint,
          changedAt: now
        });
        continue;
      }

      const stable = allowUnstable || now - current.changedAt >= quietMs;
      if (!stable) {
        continue;
      }

      const previous = state.entries[key];
      if (previous?.fingerprint === fingerprint) {
        continue;
      }

      const alreadyQueued = queue.some((item) => keyForFolder(incomingRoot, item.folderPath) === key);
      if (alreadyQueued) {
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
  console.log(`[watch] state file: ${statePath}`);
  console.log(`[watch] force imports: ${force ? "on" : "off"}`);

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
