import path from "node:path";

import {
  buildCourseEditabilityReport,
  writeCourseEditabilityReport
} from "./lib/course-editability/report.js";
import { repoRoot } from "./lib/paths.js";

type Arguments = {
  all: boolean;
  projects: string[];
  reportPath: string;
  inventoryOnly: boolean;
  allowIncomplete: boolean;
};

function usage() {
  return "Usage: npm run report:course-editability -- (--all | --project <slug> [...]) [--report <path>] [--inventory-only] [--allow-incomplete]";
}

function parseArguments(argv: string[]): Arguments {
  const result: Arguments = {
    all: false,
    projects: [],
    reportPath: path.join(repoRoot, ".runtime", "course-editability-report.json"),
    inventoryOnly: false,
    allowIncomplete: false
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--all") result.all = true;
    else if (argument === "--inventory-only") result.inventoryOnly = true;
    else if (argument === "--allow-incomplete") result.allowIncomplete = true;
    else if (argument === "--project") {
      const value = argv[index + 1];
      if (!value) throw new Error(usage());
      result.projects.push(value);
      index += 1;
    } else if (argument === "--report") {
      const value = argv[index + 1];
      if (!value) throw new Error(usage());
      result.reportPath = path.resolve(repoRoot, value);
      index += 1;
    } else throw new Error(`Unknown argument: ${argument}\n${usage()}`);
  }
  if (result.all === (result.projects.length > 0)) throw new Error(usage());
  return result;
}

async function main() {
  const args = parseArguments(process.argv.slice(2));
  const report = await buildCourseEditabilityReport({
    repoRoot,
    projectSlugs: args.all ? undefined : args.projects,
    inventoryOnly: args.inventoryOnly,
    onProjectStart: (projectSlug, index, total) => {
      console.log(`[course editability ${index}/${total}] ${projectSlug}`);
    }
  });
  await writeCourseEditabilityReport(args.reportPath, report);
  const blocks = report.aggregate.blockCoverage;
  const text = report.aggregate.teacherTextCoverage;
  console.log(`Course editability report: ${path.relative(repoRoot, args.reportPath)}`);
  console.log(`Exact commit: ${report.exactCommit}`);
  if (args.inventoryOnly) {
    const completeInventories = report.projects.filter((project) => project.inventory.complete).length;
    console.log(`Learner inventories: ${completeInventories}/${report.projects.length} complete`);
    const errors = new Map<string, number>();
    for (const project of report.projects) {
      if (!project.inventory.errorCode) continue;
      errors.set(project.inventory.errorCode, (errors.get(project.inventory.errorCode) ?? 0) + 1);
    }
    for (const [code, count] of [...errors].sort(([left], [right]) => left.localeCompare(right))) {
      console.log(`Inventory reason ${code}: ${count}`);
    }
    console.log("Coverage: not collected (inventory-only run)");
  } else {
    console.log(`Projects: ${report.aggregate.completeProjectCount}/${report.aggregate.projectCount} coverage-complete`);
    console.log(`Block coverage: ${blocks ? `${blocks.numerator}/${blocks.denominator}` : "not publishable"}`);
    console.log(`Teacher-text coverage: ${text ? `${text.numerator}/${text.denominator}` : "not publishable"}`);
  }
  console.log(`Residue proof: ${report.residue.ok ? "pass" : "fail"}`);
  if (!report.residue.ok) process.exitCode = 1;
  else if (report.aggregate.status !== "complete" && !args.allowIncomplete) process.exitCode = 2;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
