import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoRoot } from "../../../scripts/lib/paths.ts";
import { validateProject } from "../../../scripts/lib/course-standards.ts";
import type { IncomingMessage, ServerResponse } from "node:http";
import { readStandardsQueue,captureStandardsCheckpoint,decideStandardsCandidate } from "../../../scripts/lib/course-standards.ts";
import { readStudioProjectBundle } from "../../../scripts/lib/projects.ts";
import { readRequestJson } from "../lib/request-body";
import { sendJson } from "../lib/response";
export async function handleCourseStandardsRoute(url:string,request:IncomingMessage,response:ServerResponse, root=repoRoot) {
 if(!/^\/api\/course-standards(?:\/(capture|decide))?$/.test(url))return false;
 try {
 if(url==='/api/course-standards'&&request.method==='GET')sendJson(response,200,await readStandardsQueue(root));
 else if(request.method==='POST'&&url.endsWith('/capture')){const p=await readRequestJson<{project:string;identity:string}>(request,{maxBytes:2048});if(typeof p.identity!=='string'||p.identity.length>160)throw new Error('Invalid review identity.');validateProject(p.project);if(root===repoRoot)await readStudioProjectBundle(p.project);else await readFile(path.join(root,"projects",p.project,"meta/project.json"),"utf8");sendJson(response,200,await captureStandardsCheckpoint(p.project,'review',p.identity,root));}
 else if(request.method==='POST'&&url.endsWith('/decide')){const p=await readRequestJson<Parameters<typeof decideStandardsCandidate>[0]>(request,{maxBytes:2048});sendJson(response,200,await decideStandardsCandidate(p,root));}
 else sendJson(response,405,{error:'Method not allowed.'});
 }catch(e){sendJson(response,400,{error:e instanceof Error?e.message:'Standards request failed.'});}return true;
}
