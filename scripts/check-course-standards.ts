import { readFile } from "node:fs/promises";
import { getStringFlag,parseArgs } from "./lib/cli.js";
import { getProjectPaths } from "./lib/paths.js";
import { inspectPinnedStandard,validateProject } from "./lib/course-standards.js";
async function main(){const args=parseArgs(process.argv.slice(2));const project=getStringFlag(args,'project');if(!project)throw new Error('Usage: npm run standards:check -- --project <slug>');validateProject(project);const result=await inspectPinnedStandard(project,await readFile(getProjectPaths(project).workspaceEntrypoint,'utf8'));console.log(JSON.stringify(result,null,2));if(result.status==='needs-review')process.exitCode=1;}
main().catch(e=>{console.error(e instanceof Error?e.message:String(e));process.exitCode=1;});
