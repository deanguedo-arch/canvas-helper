import path from "node:path";

import { getStringFlag, hasFlag, parseArgs } from "./lib/cli.js";
import { onboardCourseCatalog } from "./lib/course-onboarding.js";
import { repoRoot } from "./lib/paths.js";

function usage() {
  return "Usage: npm run course:onboard -- --all [--apply] [--report <path>]";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const unknown = Object.keys(args.flags).filter((flag) => !["all", "apply", "report", "help", "h"].includes(flag));
  if (hasFlag(args, "help") || hasFlag(args, "h")) {
    console.log(usage());
    return;
  }
  if (unknown.length || args.positionals.length || !hasFlag(args, "all")) throw new Error(usage());
  const report = await onboardCourseCatalog({ repoRoot, apply: hasFlag(args, "apply") });
  const reportPath = getStringFlag(args, "report");
  if (reportPath) {
    const { mkdir, writeFile } = await import("node:fs/promises");
    const absolute = path.resolve(repoRoot, reportPath);
    const relative = path.relative(repoRoot, absolute);
    if (!relative || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error("The onboarding report path must stay inside this checkout.");
    }
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
