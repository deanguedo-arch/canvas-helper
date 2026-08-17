import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { withCourseEditFileLock } from "../../../app/server/lib/course-edit-transaction.ts";

const [repoRoot, workerId] = process.argv.slice(2);
if (!repoRoot || !workerId) throw new Error("Lock worker requires a repository root and worker id.");

const barrierRoot = path.join(repoRoot, "barrier");
await mkdir(barrierRoot, { recursive: true });

async function waitFor(filePath: string) {
  for (;;) {
    try {
      await access(filePath);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
}

try {
  await withCourseEditFileLock({
    projectSlug: "lock-race-fixture",
    operation: "apply",
    repoRoot,
    recoverInterrupted: async () => undefined,
    beforePublish: async () => {
      await writeFile(path.join(barrierRoot, `ready-${workerId}`), "ready\n", "utf8");
      await waitFor(path.join(barrierRoot, "go"));
    },
    run: async () => {
      await writeFile(path.join(barrierRoot, `result-${workerId}`), "acquired\n", "utf8");
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  });
} catch (error) {
  await writeFile(
    path.join(barrierRoot, `result-${workerId}`),
    `rejected:${error instanceof Error ? error.message : String(error)}\n`,
    "utf8"
  );
}
