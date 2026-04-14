import path from "node:path";
import { pathToFileURL } from "node:url";

import { getStringFlag, parseArgs } from "./lib/cli.js";
import { listDeployableGoogleHostedProjects } from "./lib/google-hosted-deploy.js";
import { ensureDir, writeTextFile } from "./lib/fs.js";
import { pullProgressReportRows } from "./lib/report-progress.js";

function formatTimestampForFilename(date: Date) {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}-${hours}${minutes}`;
}

export function buildReportAllOutputPaths(rootDir: string, now = new Date()) {
  const reportsDir = path.join(rootDir, "reports");
  const stamp = formatTimestampForFilename(now);
  return {
    latestCsvPath: path.join(reportsDir, "latest-progress.csv"),
    reportsDir,
    timestampedCsvPath: path.join(reportsDir, `progress-${stamp}.csv`)
  };
}

export async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serviceAccountPath = getStringFlag(args, "service-account") ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const firebaseProjectId = getStringFlag(args, "firebase-project") ?? process.env.FIREBASE_PROJECT_ID;
  const rootDir = process.cwd();

  if (!serviceAccountPath) {
    throw new Error(
      "Usage: npm run report:all -- --service-account path/to/service-account.json [--firebase-project <id>]"
    );
  }

  const deployableProjects = await listDeployableGoogleHostedProjects();
  if (deployableProjects.length === 0) {
    throw new Error("No deployable Google Hosted projects were found for reporting.");
  }

  const courseSlugs = deployableProjects.map((project) => project.slug);
  const outputPaths = buildReportAllOutputPaths(rootDir, new Date());
  await ensureDir(outputPaths.reportsDir);

  const report = await pullProgressReportRows({
    courseSlugs,
    firebaseProjectId,
    serviceAccountPath
  });

  await Promise.all([
    writeTextFile(outputPaths.timestampedCsvPath, report.csv),
    writeTextFile(outputPaths.latestCsvPath, report.csv)
  ]);

  console.log(`Courses: ${courseSlugs.join(", ")}`);
  console.log(`Rows: ${report.rows.length}`);
  console.log(`Wrote latest report to ${outputPaths.latestCsvPath}`);
  console.log(`Wrote timestamped report to ${outputPaths.timestampedCsvPath}`);
}

const isEntrypoint = (() => {
  const entryArg = process.argv[1];
  if (!entryArg) {
    return false;
  }

  return import.meta.url === pathToFileURL(path.resolve(entryArg)).href;
})();

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
