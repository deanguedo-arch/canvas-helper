import { createHash } from "node:crypto";
import { cp, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/** Same path-NUL-file-SHA-LF format as the immutable Python intake baseline. */
export async function hashTopicBuildTree(root: string) {
  const files: { path: string; sha256: string }[] = [];
  async function visit(relative: string) {
    const full = path.join(root, relative), stat = await lstat(full);
    if (stat.isSymbolicLink()) throw new Error(`Biology build tree contains a symlink: ${full}`);
    if (stat.isDirectory()) {
      for (const name of await readdir(full)) await visit(relative ? `${relative}/${name}` : name);
    } else if (stat.isFile()) {
      files.push({ path: relative, sha256: createHash("sha256").update(await readFile(full)).digest("hex") });
    } else throw new Error(`Unsupported Biology build entry: ${full}`);
  }
  await visit("");
  files.sort((a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path)));
  const hash = createHash("sha256");
  for (const file of files) hash.update(`${file.path}\0${file.sha256}\n`);
  return { sha256: hash.digest("hex"), files };
}

async function exists(file: string) {
  try { await lstat(file); return true; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return false; throw error; }
}

type Stage = { workspaceDir: string; metaDir: string };
type Request<T> = {
  repoRoot: string;
  project: string;
  expectedWorkspaceSha256: string;
  prepare: (stage: Stage) => Promise<void>;
  validate: (stage: Stage) => Promise<T>;
  beforePromote?: (target: string, index: number) => Promise<void> | void;
};

/**
 * Owner-only infrastructure. The caller must pass the frozen academic/source
 * gate before invoking it. No renderer or acceptance decision is supplied here.
 * Original metadata is copied, so unrelated operational records survive a build.
 */
export async function transactTopicBuild<T>(request: Request<T>) {
  if (!/^biology30-unit-[bcd]$/.test(request.project)) throw new Error("Topic transactions are restricted to Biology B/C/D");
  if (!/^[a-f0-9]{64}$/.test(request.expectedWorkspaceSha256)) throw new Error("An exact workspace tree baseline is required");
  const repo = await realpath(request.repoRoot), project = path.join(repo, "projects", request.project);
  if (await realpath(project) !== project) throw new Error("Biology project boundary resolves through a symlink");
  const lock = path.join(repo, "projects", `.${request.project}-pilot2-lock`);
  try { await mkdir(lock); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") throw new Error(`Biology build already locked; inspect the existing transaction: ${lock}`);
    throw error;
  }
  let stageRoot: string | undefined, preserveStage = false, preserveLock = false;
  const touched: { name: string; target: string; backup: string }[] = [];
  try {
    const original = {
      workspace: (await hashTopicBuildTree(path.join(project, "workspace"))).sha256,
      meta: (await hashTopicBuildTree(path.join(project, "meta"))).sha256,
    };
    if (original.workspace !== request.expectedWorkspaceSha256) throw new Error("Pilot 2 workspace baseline drift (complete tree, including assets)");
    stageRoot = await mkdtemp(path.join(repo, "projects", `.${request.project}-pilot2-stage-`));
    await writeFile(path.join(lock, "transaction.json"), JSON.stringify({ pid: process.pid, stageRoot, original }, null, 2));
    const stage = { workspaceDir: path.join(stageRoot, "workspace"), metaDir: path.join(stageRoot, "meta") };
    await mkdir(stage.workspaceDir);
    await cp(path.join(project, "meta"), stage.metaDir, { recursive: true, errorOnExist: true, force: false });
    await request.prepare(stage);
    const validation = await request.validate(stage);
    const staged = {
      workspace: (await hashTopicBuildTree(stage.workspaceDir)).sha256,
      meta: (await hashTopicBuildTree(stage.metaDir)).sha256,
    };
    await mkdir(path.join(stageRoot, "backup"));
    const promoted = new Set<string>();
    const journal = async (status: string) => {
      const file = path.join(stageRoot!, "journal.json");
      await writeFile(`${file}.next`, JSON.stringify({ project, status, original, staged, touched, promoted: [...promoted] }, null, 2));
      await rename(`${file}.next`, file);
    };
    await journal("validated; no target replaced");
    for (const [index, name] of (["workspace", "meta"] as const).entries()) {
      const target = path.join(project, name), backup = path.join(stageRoot, "backup", name);
      await request.beforePromote?.(target, index);
      // Recheck both directories, including any already promoted tree, after
      // external hooks and immediately before each replacement.
      for (const check of ["workspace", "meta"] as const) {
        const expected = promoted.has(check) ? staged[check] : original[check];
        if ((await hashTopicBuildTree(path.join(project, check))).sha256 !== expected) throw new Error(`Intervening Biology ${check} edit; candidate promotion stopped`);
      }
      if ((await hashTopicBuildTree(path.join(stageRoot, name))).sha256 !== staged[name]) throw new Error(`Validated Biology ${name} stage changed`);
      touched.push({ name, target, backup });
      await journal(`moving original ${name} to backup`);
      await rename(target, backup);
      // Detect an edit in the final check-to-rename interval without discarding it.
      if ((await hashTopicBuildTree(backup)).sha256 !== original[name]) throw new Error(`Intervening Biology ${name} edit preserved in backup`);
      await rename(path.join(stageRoot, name), target);
      promoted.add(name);
      await journal(`promoted ${name}`);
    }
    for (const name of ["workspace", "meta"] as const) {
      if ((await hashTopicBuildTree(path.join(project, name))).sha256 !== staged[name]) throw new Error(`Promoted Biology ${name} changed before final verification`);
    }
    await journal("workspace and metadata promoted and verified");
    return { workspaceSha256: staged.workspace, metadataSha256: staged.meta, validation };
  } catch (error) {
    if (touched.length && stageRoot) {
      // Retain failed candidate bytes and any concurrent writing. Never delete
      // backups in a finally block after an unsuccessful rollback.
      preserveStage = true;
      try {
        const recovery = path.join(stageRoot, "recovery");
        await mkdir(recovery);
        for (const move of [...touched].reverse()) {
          if (!await exists(move.backup)) continue;
          if (await exists(move.target)) await rename(move.target, path.join(recovery, move.name));
          await rename(move.backup, move.target);
        }
        await writeFile(path.join(stageRoot, "rollback.json"), JSON.stringify({ status: "original targets restored; failed/current candidate bytes retained", error: String(error) }, null, 2));
      } catch (rollbackError) {
        preserveLock = true;
        throw new AggregateError([error, rollbackError], `Biology rollback needs recovery; all available bytes and lock retained: ${stageRoot}`);
      }
      throw new Error(`Biology build rolled back; recovery evidence retained at ${stageRoot}`, { cause: error });
    }
    throw error;
  } finally {
    if (stageRoot && !preserveStage) await rm(stageRoot, { recursive: true, force: true });
    if (!preserveLock) await rm(lock, { recursive: true, force: true });
  }
}
