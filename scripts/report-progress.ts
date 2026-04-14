import { getStringFlag, parseArgs } from "./lib/cli.js";
import { writeTextFile } from "./lib/fs.js";
import { pullProgressReportRows, splitCourseFlag } from "./lib/report-progress.js";

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serviceAccountPath = getStringFlag(args, "service-account") ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const configuredFirebaseProjectId = getStringFlag(args, "firebase-project") ?? process.env.FIREBASE_PROJECT_ID;
  const courses = [
    ...splitCourseFlag(getStringFlag(args, "course")),
    ...splitCourseFlag(getStringFlag(args, "courses")),
    ...args.positionals
  ];
  const outputPath = getStringFlag(args, "out") ?? "progress-report.csv";

  if (!serviceAccountPath) {
    throw new Error(
      "Usage: npm run report:progress -- --firebase-project <id> --course <slug> --out progress.csv --service-account path/to/service-account.json"
    );
  }

  if (courses.length === 0) {
    throw new Error("Provide at least one course slug with --course <slug> or --courses <slug-a,slug-b>.");
  }

  const report = await pullProgressReportRows({
    courseSlugs: courses,
    firebaseProjectId: configuredFirebaseProjectId,
    serviceAccountPath
  });

  await writeTextFile(outputPath, report.csv);
  console.log(`Wrote ${report.rows.length} progress row(s) to ${outputPath}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
