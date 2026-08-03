import { lstat, mkdir, mkdtemp, readFile, rename, rm } from "node:fs/promises";
import path from "node:path";

export type SocialBuildStageContext = {
  projectDir: string;
  stageWorkspaceDir: string;
  stageMetaDir: string;
};

type StagedPath = {
  sourcePath: string;
  targetPath: string;
};

async function pathExists(targetPath: string) {
  try {
    await lstat(targetPath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

async function assertRealDirectory(directory: string, label: string) {
  const stats = await lstat(directory);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new Error(`${label} must be a real directory: ${directory}`);
  }
}

async function assertStagedWorkspace(stageWorkspaceDir: string) {
  await assertRealDirectory(stageWorkspaceDir, "Staged Social workspace");
  const indexPath = path.join(stageWorkspaceDir, "index.html");
  const indexStats = await lstat(indexPath);
  if (!indexStats.isFile() || indexStats.isSymbolicLink()) {
    throw new Error("Staged Social workspace must contain a real index.html file.");
  }
  const html = await readFile(indexPath, "utf8");
  if (!html.trim() || !/<html(?:\s|>)/i.test(html) || !/<body(?:\s|>)/i.test(html)) {
    throw new Error("Staged Social workspace index.html is not a complete HTML document.");
  }
}

async function restorePromotedPaths(promoted: Array<StagedPath & { backupPath: string; hadPrevious: boolean }>) {
  for (const entry of [...promoted].reverse()) {
    await rm(entry.targetPath, { recursive: true, force: true });
    if (entry.hadPrevious && (await pathExists(entry.backupPath))) {
      await mkdir(path.dirname(entry.targetPath), { recursive: true });
      await rename(entry.backupPath, entry.targetPath);
    }
  }
}

async function promotePaths(transactionDir: string, paths: StagedPath[]) {
  const backupRoot = path.join(transactionDir, "backup");
  const promoted: Array<StagedPath & { backupPath: string; hadPrevious: boolean }> = [];
  try {
    for (const [index, entry] of paths.entries()) {
      const backupPath = path.join(backupRoot, String(index));
      const hadPrevious = await pathExists(entry.targetPath);
      if (hadPrevious) {
        await mkdir(path.dirname(backupPath), { recursive: true });
        await rename(entry.targetPath, backupPath);
      }
      try {
        await mkdir(path.dirname(entry.targetPath), { recursive: true });
        await rename(entry.sourcePath, entry.targetPath);
      } catch (error) {
        if (hadPrevious && (await pathExists(backupPath))) {
          await rename(backupPath, entry.targetPath);
        }
        throw error;
      }
      promoted.push({ ...entry, backupPath, hadPrevious });
    }
  } catch (error) {
    await restorePromotedPaths(promoted);
    throw error;
  }
}

export async function stageAndPromoteSocialBuild(options: {
  projectDir: string;
  buildStage(context: SocialBuildStageContext): Promise<void>;
}): Promise<void> {
  const projectDir = path.resolve(options.projectDir);
  await mkdir(projectDir, { recursive: true });
  const transactionDir = await mkdtemp(path.join(projectDir, ".social-build-transaction-"));
  const stageWorkspaceDir = path.join(transactionDir, "stage", "workspace");
  const stageMetaDir = path.join(transactionDir, "stage", "meta");
  try {
    await Promise.all([mkdir(stageWorkspaceDir, { recursive: true }), mkdir(stageMetaDir, { recursive: true })]);
    await options.buildStage({ projectDir, stageWorkspaceDir, stageMetaDir });
    await assertStagedWorkspace(stageWorkspaceDir);

    const paths: StagedPath[] = [
      { sourcePath: stageWorkspaceDir, targetPath: path.join(projectDir, "workspace") }
    ];
    for (const fileName of ["social-build.json", "conversion-notes.md"]) {
      const stagedFile = path.join(stageMetaDir, fileName);
      if (await pathExists(stagedFile)) {
        const stats = await lstat(stagedFile);
        if (!stats.isFile() || stats.isSymbolicLink()) {
          throw new Error(`Staged Social metadata must be a real file: ${fileName}`);
        }
        paths.push({ sourcePath: stagedFile, targetPath: path.join(projectDir, "meta", fileName) });
      }
    }
    await promotePaths(transactionDir, paths);
  } finally {
    await rm(transactionDir, { recursive: true, force: true });
  }
}
